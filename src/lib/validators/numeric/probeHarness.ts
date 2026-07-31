/**
 * THE CALCULATOR — the headless driver.
 *
 * Walks every state of a concept and returns the NUMBERS the sim painted, not
 * pixels. Deliberately parallel to screenshotter.ts rather than an edit of it:
 * that file's contract is "return PNGs", and _verify_pcpl_time_pin.ts already
 * proves this harness shape mirrors it cleanly without touching it.
 *
 * Three things it does differently, each for a stated reason:
 *
 *  1. HTML comes from `assembleSimFromSource`, not from `simulation_cache`. No
 *     Supabase, no `--env-file`, always-current source — and the stale-cache
 *     class that produced the worst gate failure on record
 *     (loadCachedSim.ts:46-85) cannot occur.
 *
 *  2. The sim loads TOP-LEVEL, not in an iframe. Renderers post SIM_READY /
 *     STATE_REACHED to `window.parent`, which at top level IS the same window,
 *     so one listener catches everything and no relay is needed. Same shape as
 *     probe_gas_instruments.ts and the _scratch_nlb_* probes.
 *
 *  3. Timing uses SET_TIME_FREEZE + real waits (THE EYE's proven ordering), NOT
 *     a virtual rAF clock. All three live renderers declare
 *     `__PM_supportsTimePin`, and THE EYE's byte-identical frozen baselines are
 *     the standing evidence that the pin alone is deterministic. Overriding rAF
 *     would additionally risk breaking any renderer that uses setTimeout.
 *
 * Sliders are driven with Playwright's real `fill()`, which emits TRUSTED
 * events — so a renderer that gates on `isTrusted` (the drag-seize pattern)
 * still responds.
 */
import type { Browser, Page } from '@playwright/test';
import { launchBrowser } from '@/lib/validators/visual/chromiumProvider';
import { assembleSimFromSource } from '@/scripts/lib/assembleSimFromSource';
import { deriveStateIds } from '@/lib/validators/visual/deriveStateIds';
import { deriveMaxRevealTimeMs } from '@/lib/validators/visual/deriveStateMeta';
import {
    HARVEST_INIT,
    HARVEST_READ,
    parseReadings,
    type RawHarvest,
    type Reading,
} from './readoutHarvest';
import { symbolsOfInterest } from './deriveAssertions';

const SIM_URL = 'http://__pm_calculator__.local/sim.html';
const STATE_TIMEOUT_MS = 6000;
const SIM_TIME_TOLERANCE_MS = 50;
/** Frames to let canvas HUDs repaint after the buffer is cleared. */
const REPAINT_WAIT_MS = 200;
/** Consecutive-agreement retries before a readout is declared unsettled. */
const STABILITY_ATTEMPTS = 4;

/** Records the outbound postMessage contract. Installed before any renderer script. */
export const MSG_INIT = `(function () {
  window.__PM_CALC_MSGS = { ready: false, states: {} };
  window.addEventListener('message', function (e) {
    try {
      var d = e.data || {};
      if (d.type === 'SIM_READY') window.__PM_CALC_MSGS.ready = true;
      else if (d.type === 'STATE_REACHED' && d.state) window.__PM_CALC_MSGS.states[d.state] = 1;
    } catch (err) { /* never break the sim */ }
  });
})()`;

/** Every `input[type=range]` the sim exposes, as a teacher would find it. */
const SLIDER_SCAN = `(function () {
  var out = [];
  var els = document.querySelectorAll('input[type=range]');
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    var r = el.getBoundingClientRect();
    var st = window.getComputedStyle(el);
    var visible = st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0;
    var label = '';
    var row = el.closest('div');
    if (row) label = (row.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 60);
    out.push({
      id: el.id || '', name: el.name || '', label: label, visible: visible,
      min: parseFloat(el.min), max: parseFloat(el.max),
      step: el.step ? parseFloat(el.step) : NaN, value: parseFloat(el.value)
    });
  }
  return out;
})()`;

export interface SliderInfo {
    id: string;
    name: string;
    label: string;
    visible: boolean;
    min: number;
    max: number;
    step: number;
    value: number;
}

export interface StateHarvest {
    stateId: string;
    reached: boolean;
    pinnedAtMs: number | null;
    simTimeMs: number | null;
    readings: Reading[];
    sliders: SliderInfo[];
    warnings: string[];
}

export interface SliderSweep {
    stateId: string;
    slider: SliderInfo;
    lowValue: number;
    highValue: number;
    lowReadings: Reading[];
    highReadings: Reading[];
}

export interface ProbeResult {
    conceptId: string;
    rendererType: 'field_3d' | 'particle_field' | 'parametric';
    stateIds: string[];
    pinnable: boolean;
    states: StateHarvest[];
    sweeps: SliderSweep[];
    consoleErrors: string[];
    /** The raw concept JSON — the gates read declared physics from it. */
    json: Record<string, unknown>;
}

export class NotCheckableError extends Error {}

async function post(page: Page, msg: Record<string, unknown>): Promise<void> {
    await page.evaluate((m) => { window.postMessage(m, '*'); }, msg);
}

async function readHarvest(page: Page): Promise<RawHarvest> {
    return (await page.evaluate(HARVEST_READ)) as unknown as RawHarvest;
}

async function scanSliders(page: Page): Promise<SliderInfo[]> {
    return (await page.evaluate(SLIDER_SCAN)) as unknown as SliderInfo[];
}

/** Poll until the sim's own clock reaches the pin. Never throws; reports what it saw. */
async function pollSimTime(page: Page, targetMs: number, wallCapMs: number): Promise<number | null> {
    const deadline = Date.now() + wallCapMs;
    let last: number | null = null;
    while (Date.now() < deadline) {
        last = await page.evaluate(() => {
            const w = window as unknown as { PM_simTimeMs?: number };
            return typeof w.PM_simTimeMs === 'number' ? w.PM_simTimeMs : null;
        });
        if (last !== null && last >= targetMs - SIM_TIME_TOLERANCE_MS) return last;
        await page.waitForTimeout(50);
    }
    return last;
}

/**
 * Drive one state to its settled, pinned pose and harvest every painted number.
 *
 * Ordering mirrors screenshotter.ts:351-479 — each step is load-bearing:
 * SET_STATE and wait for the sim's own acknowledgement, re-zero the state clock,
 * re-stamp one-shot timers that RESET_TRAJECTORY does not rebase, then pin.
 */
async function harvestState(
    page: Page,
    stateId: string,
    pinMs: number | undefined,
    pinnable: boolean,
    keep: ReadonlySet<string>,
): Promise<StateHarvest> {
    const warnings: string[] = [];

    await page.evaluate((s) => {
        const w = window as unknown as {
            __PM_CALC_MSGS?: { states: Record<string, number> };
            __PM_CALC_RESET?: () => void;
        };
        if (w.__PM_CALC_MSGS) delete w.__PM_CALC_MSGS.states[s];
        // Drop every earlier state's canvas text so nothing leaks forward.
        w.__PM_CALC_RESET?.();
    }, stateId);
    await post(page, { type: 'SET_STATE', state: stateId });

    let reached = false;
    const deadline = Date.now() + STATE_TIMEOUT_MS;
    while (Date.now() < deadline) {
        reached = await page.evaluate((s) => {
            const w = window as unknown as { __PM_CALC_MSGS?: { states: Record<string, number> } };
            return !!w.__PM_CALC_MSGS?.states[s];
        }, stateId);
        if (reached) break;
        await page.waitForTimeout(25);
    }
    if (!reached) warnings.push(`no STATE_REACHED within ${STATE_TIMEOUT_MS}ms — harvested anyway`);

    await post(page, { type: 'RESET_TRAJECTORY' });
    await post(page, { type: 'REPLAY_ANIMATIONS' });

    let pinnedAtMs: number | null = null;
    if (pinnable && typeof pinMs === 'number' && pinMs > 0) {
        await post(page, { type: 'SET_TIME_FREEZE', at_ms: pinMs });
        const seen = await pollSimTime(page, pinMs, pinMs * 2.5 + 4000);
        if (seen === null || seen < pinMs - SIM_TIME_TOLERANCE_MS) {
            warnings.push(`clock did not reach the ${pinMs}ms pin (last ${seen ?? 'n/a'}ms)`);
        }
        pinnedAtMs = pinMs;
    } else {
        // Unpinned: settle past the renderer's 800ms state-transition interpolation.
        await page.waitForTimeout(1200);
        if (!pinnable) warnings.push('renderer does not declare __PM_supportsTimePin — readings are free-run');
    }

    const readings = await harvestStable(page, keep, warnings, stateId);
    const raw = await readHarvest(page);
    if (raw.err) warnings.push(`harvest: ${raw.err}`);
    return {
        stateId,
        reached,
        pinnedAtMs,
        // The renderer accumulates real elapsed ms, so the last float bit differs
        // run to run (7299.999999999999 vs 7300.000000000001). Round: the pin is
        // ms-resolution and `t` derives from this.
        simTimeMs: raw.simTimeMs === null ? null : Math.round(raw.simTimeMs * 10) / 10,
        readings,
        sliders: await scanSliders(page),
        warnings,
    };
}

/**
 * Harvest repeatedly until two consecutive samples agree.
 *
 * Even under SET_TIME_FREEZE a p5 HUD can still be settling when the first
 * sample lands, so `combination_of_resistors` reported a transient `R_eq = 3` on
 * some runs and not others. Requiring two identical consecutive reads makes the
 * output reproducible; failing to settle is reported, never silently accepted.
 */
async function harvestStable(
    page: Page, keep: ReadonlySet<string>, warnings: string[], label: string,
): Promise<Reading[]> {
    const sample = async (): Promise<Reading[]> => {
        await page.evaluate(() => {
            const w = window as unknown as { __PM_CALC_CLEAR?: () => void };
            w.__PM_CALC_CLEAR?.();
        });
        await page.waitForTimeout(REPAINT_WAIT_MS);
        return parseReadings(await readHarvest(page), keep);
    };
    const fingerprint = (rs: Reading[]): string =>
        rs.map((r) => `${r.where}|${r.symbol}|${r.value}|${r.unitToken}`).sort().join(' ~ ');

    let prev = await sample();
    for (let attempt = 0; attempt < STABILITY_ATTEMPTS; attempt++) {
        const next = await sample();
        if (fingerprint(next) === fingerprint(prev)) return next;
        prev = next;
    }
    warnings.push(`${label}: readouts never settled over ${STABILITY_ATTEMPTS} samples — readings may vary between runs`);
    return prev;
}

/** Round onto the slider's own step grid, clamped to its range. */
function snapToStep(value: number, s: SliderInfo): number {
    if (!isFinite(s.step) || s.step <= 0) return value;
    const steps = Math.round((value - s.min) / s.step);
    const snapped = s.min + steps * s.step;
    // Re-round to the step's own precision so float noise never reappears.
    const decimals = (String(s.step).split('.')[1] ?? '').length;
    return Number(Math.min(s.max, Math.max(s.min, snapped)).toFixed(decimals));
}

/** `CSS.escape` is a browser API; build the selector as a quoted attribute instead. */
function sliderSelector(id: string): string {
    return `input[type=range][id=${JSON.stringify(id)}]`;
}

/** Re-harvest after a real slider drag, without re-entering the state. */
async function harvestAfterSlider(
    page: Page, sliderId: string, value: number, keep: ReadonlySet<string>, warnings: string[],
): Promise<Reading[]> {
    await page.locator(sliderSelector(sliderId)).fill(String(value));
    return harvestStable(page, keep, warnings, `slider ${sliderId}@${value}`);
}

export interface ProbeOptions {
    conceptId: string;
    /** Skip the N3 slider sweeps (they roughly double the run). */
    skipSweeps?: boolean;
}

export async function probeConcept(opts: ProbeOptions): Promise<ProbeResult> {
    const { conceptId } = opts;
    const assembled = assembleSimFromSource(conceptId);
    if (!assembled) {
        throw new NotCheckableError(
            `${conceptId} has no seedable renderer family (no field_3d_config / particle_field_config, not parametric) — not checkable`,
        );
    }
    const json = assembled.json as unknown as Record<string, unknown>;
    const stateIds = deriveStateIds(json);
    if (stateIds.length === 0) {
        throw new NotCheckableError(`${conceptId} declares no states — not checkable`);
    }
    const pinByState = deriveMaxRevealTimeMs(json);

    let browser: Browser | null = null;
    const consoleErrors: string[] = [];
    try {
        browser = await launchBrowser();
        const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
        page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
        page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`console: ${m.text()}`); });

        await page.addInitScript(MSG_INIT);
        await page.addInitScript(HARVEST_INIT);
        await page.route(SIM_URL, (route) =>
            route.fulfill({ status: 200, contentType: 'text/html', body: assembled.simHtml }));
        await page.goto(SIM_URL, { waitUntil: 'load' });

        await page.waitForFunction(
            () => (window as unknown as { __PM_CALC_MSGS?: { ready: boolean } }).__PM_CALC_MSGS?.ready === true,
            null,
            { timeout: 30000, polling: 100 },
        ).catch(() => { consoleErrors.push('SIM_READY never fired within 30s'); });

        const pinnable = await page.evaluate(
            () => (window as unknown as { __PM_supportsTimePin?: boolean }).__PM_supportsTimePin === true,
        );

        const keep = symbolsOfInterest(json);
        const states: StateHarvest[] = [];
        const sweeps: SliderSweep[] = [];
        for (const stateId of stateIds) {
            const h = await harvestState(page, stateId, pinByState[stateId], pinnable, keep);
            states.push(h);

            if (opts.skipSweeps) continue;
            for (const s of h.sliders) {
                if (!s.visible || !s.id) continue;
                if (!isFinite(s.min) || !isFinite(s.max) || s.max <= s.min) continue;
                // Interior points, not the rail ends — an endpoint can sit on a
                // clamp and hide a genuinely dead control. Values MUST land on the
                // step grid: `fill("5.75")` on a step=1 range is rejected outright
                // ("Malformed value"), which silently costs the whole sweep.
                const span = s.max - s.min;
                const lowValue = snapToStep(s.min + span * 0.25, s);
                const highValue = snapToStep(s.min + span * 0.75, s);
                if (lowValue === highValue) continue;   // too coarse to sweep
                try {
                    const lowReadings = await harvestAfterSlider(page, s.id, lowValue, keep, h.warnings);
                    const highReadings = await harvestAfterSlider(page, s.id, highValue, keep, h.warnings);
                    sweeps.push({ stateId, slider: s, lowValue, highValue, lowReadings, highReadings });
                } catch (err: unknown) {
                    h.warnings.push(`slider ${s.id}: ${err instanceof Error ? err.message : String(err)}`);
                }
                // Restore the authored default so the next slider is swept from
                // the state's real pose, not from the previous sweep's endpoint.
                await page.locator(sliderSelector(s.id)).fill(String(s.value)).catch(() => { });
            }
        }

        return {
            conceptId,
            rendererType: assembled.rendererType,
            stateIds,
            pinnable,
            states,
            sweeps,
            consoleErrors,
            json,
        };
    } finally {
        await browser?.close().catch(() => { });
    }
}
