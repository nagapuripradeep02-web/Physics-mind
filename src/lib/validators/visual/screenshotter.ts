/**
 * Visual Validator — Playwright screenshotter (Engine E29, Day 3).
 *
 * Loads each generated simulation in headless Chromium, drives it through
 * every STATE_N via postMessage SET_STATE, and captures:
 *   - Per-state PNG of Panel A (and Panel B for multi-panel) + side-by-side composite
 *   - Animation time-series: 5 keyframes at t=0, 2.5s, 5s, 7.5s, 10s for one chosen state
 *   - postMessage timing for STATE_REACHED across panels (F1 raw data)
 *   - PARAM_UPDATE relay latency in both directions (F4 raw data)
 *
 * Outputs feed visionGate.ts (Day 4).
 *
 * Why a wrapper HTML with two iframes + relay script: the sim HTML expects
 * window.parent.postMessage to reach a coordinator (in production: DualPanelSimulation.tsx).
 * We replicate that coordinator here so sims run unmodified and we get realistic
 * F1/F4 measurements.
 */

import { Buffer } from 'node:buffer';
import { type Browser, type Frame, type Page } from '@playwright/test';
import sharp from 'sharp';
import { launchBrowser } from './chromiumProvider';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface CaptureRequest {
    conceptId: string;
    /** Full HTML document for Panel A's simulation iframe. */
    panelAHtml: string;
    /** Full HTML document for Panel B's simulation iframe. Required for multi-panel. */
    panelBHtml?: string;
    /** Ordered state IDs to walk through, e.g., ["STATE_1", "STATE_2", "STATE_3"]. */
    stateIds: string[];
    /** State ID to hold while capturing the animation time-series. Defaults to last state. */
    animateStateId?: string;
    /** Optional viewport size (default 1280x720). */
    viewport?: { width: number; height: number };
    /** Per-step timeout in ms. Defaults to 5000. */
    perStateTimeoutMs?: number;
}

export interface StateCapture {
    state_id: string;
    panel_a_png_b64: string;
    panel_b_png_b64?: string;
    /** Side-by-side composite for Cat F vision prompts. */
    combined_png_b64?: string;
}

export interface TimingMeasurement {
    state_id: string;
    /** ms from SET_STATE post to STATE_REACHED in Panel A */
    panel_a_state_reached_ms: number;
    /** ms from SET_STATE post to STATE_REACHED in Panel B */
    panel_b_state_reached_ms?: number;
    /** Absolute lag between panels (F1 measurement). */
    panel_b_lag_ms?: number;
    /** True when one or both panels timed out before STATE_REACHED. */
    timed_out: boolean;
}

export interface ParamRelayMeasurement {
    /** ms from PARAM_UPDATE post in A until receipt in B (F4 from A side). */
    a_to_b_ms?: number;
    /** ms from PARAM_UPDATE post in B until receipt in A (F4 from B side). */
    b_to_a_ms?: number;
    timed_out: boolean;
}

export interface AnimationTimeseries {
    state_id: string;
    /** Base64 PNGs at t=0, 2.5s, 5s, 7.5s, 10s. */
    frames_b64: string[];
    /** Wall-clock timestamps actually captured (ms relative to state entry). */
    capture_times_ms: number[];
}

export interface TemplateLeakFinding {
    state_id: string;
    panel: PanelName;
    /** The literal {var} or {expr.toFixed(N)} text that leaked into rendered DOM. */
    sample_text: string;
}

export interface CaptureResult {
    state_captures: StateCapture[];
    timings: TimingMeasurement[];
    param_relay: ParamRelayMeasurement;
    animation_timeseries?: AnimationTimeseries;
    /**
     * H1 (template substitution leak) — DOM-scan findings collected per state per panel.
     * Inline scan inside the capture loop. Empty array = no leaks via DOM path
     * (OCR backstop in pixelGate.ts still runs on canvas-rendered text).
     */
    template_leak_dom_findings: TemplateLeakFinding[];
    /** Non-fatal warnings (e.g., "panel B SIM_READY timed out"). */
    warnings: string[];
}

// ─── Wrapper HTML + injected probe ────────────────────────────────────────────

const PANEL_A_PATH = 'http://__pm_validator__.local/panel-a.html';
const PANEL_B_PATH = 'http://__pm_validator__.local/panel-b.html';
type PanelName = 'panel_a' | 'panel_b';

function buildWrapperHtml(opts: { hasPanelB: boolean; viewport: { width: number; height: number } }): string {
    const { hasPanelB, viewport } = opts;
    const halfWidth = hasPanelB ? Math.floor(viewport.width / 2) : viewport.width;
    const panelBRule = hasPanelB ? `display:block;width:${halfWidth}px` : 'display:none';
    return `<!doctype html>
<html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;background:#000;width:${viewport.width}px;height:${viewport.height}px;overflow:hidden;}
.row{display:flex;flex-direction:row;width:100%;height:100%;}
iframe{border:none;height:100%;}
#panel_a{width:${halfWidth}px;}
#panel_b{${panelBRule};}
</style></head><body><div class="row">
<iframe id="panel_a" name="panel_a" src="${PANEL_A_PATH}"></iframe>
${hasPanelB ? `<iframe id="panel_b" name="panel_b" src="${PANEL_B_PATH}"></iframe>` : ''}
</div>
<script>
(function(){
  var readyA = false, readyB = ${hasPanelB ? 'false' : 'true'};
  window.__simReady = function(){ return readyA && readyB; };
  function panelOf(source){
    var a = document.getElementById('panel_a');
    var b = document.getElementById('panel_b');
    if (a && source === a.contentWindow) return 'A';
    if (b && source === b.contentWindow) return 'B';
    return '?';
  }
  window.addEventListener('message', function(e){
    var src = panelOf(e.source);
    if (e.data && e.data.type === 'SIM_READY'){
      if (src === 'A') readyA = true;
      if (src === 'B') readyB = true;
    }
    if (e.data && e.data.type === 'PARAM_UPDATE'){
      var target = src === 'A' ? document.getElementById('panel_b') : document.getElementById('panel_a');
      if (target && target.contentWindow) target.contentWindow.postMessage(e.data, '*');
    }
  });
  window.__postToPanel = function(panel, msg){
    var el = document.getElementById('panel_' + panel.toLowerCase());
    if (el && el.contentWindow) el.contentWindow.postMessage(msg, '*');
  };
})();
</script>
</body></html>`;
}

/**
 * Probe injected into each panel iframe so we can read STATE_REACHED + PARAM_UPDATE
 * arrival timestamps without modifying the sim HTML itself.
 */
const PANEL_PROBE_SCRIPT = `
(function(){
  if (window.__pmProbeInstalled) return;
  window.__pmProbeInstalled = true;
  window.__pmStateReached = {};
  window.__pmParamReceived = null;
  window.addEventListener('message', function(e){
    if (e.data && e.data.type === 'STATE_REACHED' && typeof e.data.state === 'string'){
      window.__pmStateReached[e.data.state] = performance.now();
    }
    if (e.data && e.data.type === 'PARAM_UPDATE' && e.data.__pmTest === true){
      window.__pmParamReceived = { ts: performance.now(), key: e.data.key, value: e.data.value };
    }
  });
})();
`;

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function captureSimStates(req: CaptureRequest): Promise<CaptureResult> {
    const viewport = req.viewport ?? { width: 1280, height: 720 };
    const perStateTimeoutMs = req.perStateTimeoutMs ?? 5000;
    const hasPanelB = !!req.panelBHtml;
    const animateStateId = req.animateStateId ?? req.stateIds[req.stateIds.length - 1];
    const warnings: string[] = [];

    const browser: Browser = await launchBrowser();
    try {
        const context = await browser.newContext({ viewport });
        const page = await context.newPage();

        await page.route(PANEL_A_PATH, route => route.fulfill({
            status: 200, contentType: 'text/html', body: req.panelAHtml,
        }));
        if (hasPanelB) {
            await page.route(PANEL_B_PATH, route => route.fulfill({
                status: 200, contentType: 'text/html', body: req.panelBHtml as string,
            }));
        }

        await page.setContent(buildWrapperHtml({ hasPanelB, viewport }));

        try {
            await page.waitForFunction(
                () => Boolean((window as unknown as { __simReady?: () => boolean }).__simReady?.()),
                undefined,
                { timeout: perStateTimeoutMs },
            );
        } catch (err) {
            warnings.push(`SIM_READY timeout: ${err instanceof Error ? err.message : String(err)}`);
        }

        await injectPanelProbe(page, 'panel_a', warnings);
        if (hasPanelB) await injectPanelProbe(page, 'panel_b', warnings);

        const stateCaptures: StateCapture[] = [];
        const timings: TimingMeasurement[] = [];
        const templateLeakDomFindings: TemplateLeakFinding[] = [];
        for (const stateId of req.stateIds) {
            const timing = await driveToState(page, stateId, hasPanelB, perStateTimeoutMs);
            timings.push(timing);
            if (timing.timed_out) warnings.push(`STATE_REACHED timeout for ${stateId}`);

            await page.waitForTimeout(150);

            const panelAPng = await captureIframe(page, 'panel_a');
            const panelBPng = hasPanelB ? await captureIframe(page, 'panel_b') : undefined;
            const combinedPng = panelBPng ? await composeSideBySide(panelAPng, panelBPng) : undefined;
            stateCaptures.push({
                state_id: stateId,
                panel_a_png_b64: panelAPng.toString('base64'),
                panel_b_png_b64: panelBPng?.toString('base64'),
                combined_png_b64: combinedPng?.toString('base64'),
            });

            // H1 — DOM scan for unsubstituted PCPL template placeholders ({var}, {expr.toFixed(N)}).
            // Cheap (~5ms) and catches the 80% of leaks that render to DOM. OCR backstop in
            // pixelGate.ts handles canvas/SVG-rendered leaks (Plotly, p5.js text()).
            const aLeaks = await scanLeaksInFrame(page, 'panel_a');
            for (const txt of aLeaks) templateLeakDomFindings.push({ state_id: stateId, panel: 'panel_a', sample_text: txt });
            if (hasPanelB) {
                const bLeaks = await scanLeaksInFrame(page, 'panel_b');
                for (const txt of bLeaks) templateLeakDomFindings.push({ state_id: stateId, panel: 'panel_b', sample_text: txt });
            }
        }

        let animationTimeseries: AnimationTimeseries | undefined;
        if (animateStateId) {
            try {
                animationTimeseries = await captureAnimationTimeseries(page, animateStateId, hasPanelB, perStateTimeoutMs);
            } catch (err) {
                warnings.push(`Animation time-series failed: ${err instanceof Error ? err.message : String(err)}`);
            }
        }

        let paramRelay: ParamRelayMeasurement = { timed_out: !hasPanelB };
        if (hasPanelB) {
            try {
                paramRelay = await measureParamRelay(page, perStateTimeoutMs);
            } catch (err) {
                warnings.push(`PARAM_UPDATE relay measurement failed: ${err instanceof Error ? err.message : String(err)}`);
                paramRelay = { timed_out: true };
            }
        }

        return {
            state_captures: stateCaptures,
            timings,
            param_relay: paramRelay,
            animation_timeseries: animationTimeseries,
            template_leak_dom_findings: templateLeakDomFindings,
            warnings,
        };
    } finally {
        await browser.close();
    }
}

// ─── Internals ────────────────────────────────────────────────────────────────

function getFrame(page: Page, name: PanelName): Frame | null {
    return page.frame({ name }) ?? null;
}

async function injectPanelProbe(page: Page, frameName: PanelName, warnings: string[]): Promise<void> {
    const frame = getFrame(page, frameName);
    if (!frame) {
        warnings.push(`iframe ${frameName} not found for probe injection`);
        return;
    }
    try {
        await frame.evaluate(PANEL_PROBE_SCRIPT);
    } catch (err) {
        warnings.push(`probe injection failed for ${frameName}: ${err instanceof Error ? err.message : String(err)}`);
    }
}

async function driveToState(
    page: Page, stateId: string, hasPanelB: boolean, timeoutMs: number,
): Promise<TimingMeasurement> {
    const postTs = await page.evaluate(({ id, hasB }) => {
        const t0 = performance.now();
        const w = window as unknown as { __postToPanel?: (panel: string, msg: unknown) => void };
        w.__postToPanel?.('A', { type: 'SET_STATE', state: id });
        if (hasB) w.__postToPanel?.('B', { type: 'SET_STATE', state: id });
        return t0;
    }, { id: stateId, hasB: hasPanelB });

    const deadline = Date.now() + timeoutMs;
    let aTs: number | undefined;
    let bTs: number | undefined;
    while (Date.now() < deadline && (aTs === undefined || (hasPanelB && bTs === undefined))) {
        if (aTs === undefined) aTs = await readStateReached(page, 'panel_a', stateId);
        if (hasPanelB && bTs === undefined) bTs = await readStateReached(page, 'panel_b', stateId);
        if (aTs === undefined || (hasPanelB && bTs === undefined)) {
            await page.waitForTimeout(25);
        }
    }

    const timed_out = aTs === undefined || (hasPanelB && bTs === undefined);
    const aReachedMs = aTs !== undefined ? Math.max(0, aTs - postTs) : -1;
    const bReachedMs = bTs !== undefined ? Math.max(0, bTs - postTs) : undefined;
    const lag = aTs !== undefined && bTs !== undefined ? Math.abs(bTs - aTs) : undefined;
    return {
        state_id: stateId,
        panel_a_state_reached_ms: aReachedMs,
        panel_b_state_reached_ms: bReachedMs,
        panel_b_lag_ms: lag,
        timed_out,
    };
}

async function readStateReached(page: Page, frameName: PanelName, stateId: string): Promise<number | undefined> {
    const frame = getFrame(page, frameName);
    if (!frame) return undefined;
    try {
        const result = await frame.evaluate((id) => {
            const w = window as unknown as { __pmStateReached?: Record<string, number> };
            return w.__pmStateReached?.[id] ?? null;
        }, stateId);
        return typeof result === 'number' ? result : undefined;
    } catch {
        return undefined;
    }
}

async function captureIframe(page: Page, frameName: PanelName): Promise<Buffer> {
    const locator = page.locator(`#${frameName}`);
    return await locator.screenshot({ type: 'png' });
}

/**
 * Walk the iframe's DOM, skipping <script>/<style> and hidden elements, and
 * collect any text matching the PCPL placeholder regex. Returns the literal
 * matched substrings so a CheckResult can quote them as evidence.
 */
async function scanLeaksInFrame(page: Page, frameName: PanelName): Promise<string[]> {
    const frame = getFrame(page, frameName);
    if (!frame) return [];
    try {
        return await frame.evaluate(() => {
            const findings: string[] = [];
            const re = /\{[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*(?:\.\w+\([^)]*\))?\}/g;
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
                acceptNode(node: Node): number {
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    const tag = parent.tagName;
                    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
                    const style = window.getComputedStyle(parent);
                    if (style.display === 'none' || style.visibility === 'hidden') return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                },
            });
            let n: Node | null;
            while ((n = walker.nextNode())) {
                const matches = n.nodeValue?.match(re);
                if (matches) for (const m of matches) findings.push(m);
            }
            return findings;
        });
    } catch {
        return [];
    }
}

async function composeSideBySide(left: Buffer, right: Buffer): Promise<Buffer> {
    const [lMeta, rMeta] = await Promise.all([sharp(left).metadata(), sharp(right).metadata()]);
    const lWidth = lMeta.width ?? 640;
    const rWidth = rMeta.width ?? 640;
    const lHeight = lMeta.height ?? 720;
    const rHeight = rMeta.height ?? 720;
    const height = Math.max(lHeight, rHeight);
    return await sharp({
        create: {
            width: lWidth + rWidth,
            height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 1 },
        },
    })
        .composite([
            { input: left, left: 0, top: 0 },
            { input: right, left: lWidth, top: 0 },
        ])
        .png()
        .toBuffer();
}

const KEYFRAME_OFFSETS_MS = [0, 2500, 5000, 7500, 10000];

async function captureAnimationTimeseries(
    page: Page, stateId: string, hasPanelB: boolean, timeoutMs: number,
): Promise<AnimationTimeseries> {
    await driveToState(page, stateId, hasPanelB, timeoutMs);
    const start = Date.now();
    const frames: string[] = [];
    const captureTimes: number[] = [];
    for (const offset of KEYFRAME_OFFSETS_MS) {
        const targetMs = start + offset;
        const wait = Math.max(0, targetMs - Date.now());
        if (wait > 0) await page.waitForTimeout(wait);
        const png = await captureIframe(page, 'panel_a');
        frames.push(png.toString('base64'));
        captureTimes.push(Date.now() - start);
    }
    return { state_id: stateId, frames_b64: frames, capture_times_ms: captureTimes };
}

async function measureParamRelay(page: Page, timeoutMs: number): Promise<ParamRelayMeasurement> {
    await resetParamReceived(page, 'panel_a');
    await resetParamReceived(page, 'panel_b');

    const aPostTs = await page.evaluate(() => {
        const t0 = performance.now();
        const w = window as unknown as { __postToPanel?: (panel: string, msg: unknown) => void };
        w.__postToPanel?.('A', {
            type: 'PARAM_UPDATE', __pmTest: true, key: '__pm_relay_test', value: 1, ts: t0,
        });
        return t0;
    });
    const aToBTs = await pollParamReceived(page, 'panel_b', timeoutMs);

    await resetParamReceived(page, 'panel_a');
    await resetParamReceived(page, 'panel_b');

    const bPostTs = await page.evaluate(() => {
        const t0 = performance.now();
        const w = window as unknown as { __postToPanel?: (panel: string, msg: unknown) => void };
        w.__postToPanel?.('B', {
            type: 'PARAM_UPDATE', __pmTest: true, key: '__pm_relay_test', value: 2, ts: t0,
        });
        return t0;
    });
    const bToATs = await pollParamReceived(page, 'panel_a', timeoutMs);

    return {
        a_to_b_ms: aToBTs !== undefined ? Math.max(0, aToBTs - aPostTs) : undefined,
        b_to_a_ms: bToATs !== undefined ? Math.max(0, bToATs - bPostTs) : undefined,
        timed_out: aToBTs === undefined || bToATs === undefined,
    };
}

async function resetParamReceived(page: Page, frameName: PanelName): Promise<void> {
    const frame = getFrame(page, frameName);
    if (!frame) return;
    await frame.evaluate(() => {
        const w = window as unknown as { __pmParamReceived?: unknown };
        w.__pmParamReceived = null;
    });
}

async function pollParamReceived(page: Page, frameName: PanelName, timeoutMs: number): Promise<number | undefined> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const frame = getFrame(page, frameName);
        if (frame) {
            try {
                const result = await frame.evaluate(() => {
                    const w = window as unknown as { __pmParamReceived?: { ts?: number } | null };
                    return w.__pmParamReceived ?? null;
                });
                if (result && typeof result.ts === 'number') return result.ts;
            } catch {
                // frame gone — keep polling until deadline
            }
        }
        await page.waitForTimeout(20);
    }
    return undefined;
}
