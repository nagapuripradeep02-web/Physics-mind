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
    /**
     * Dense per-second frame capture for EVERY state (adjacent-frame motion
     * analysis: D5/D6/D7 in pixelGate). Opt-in — the generation-time auto-fire
     * path never sets this, so its latency/cost profile is unchanged.
     */
    dense?: DenseCaptureOptions;
    /**
     * Per-state ordered TTS math_show replay sequence (Category I2). The headless
     * capture never drives TTS, so KaTeX equation panels that the TeacherPlayer
     * shows via SET_MATH are absent from the normal frame — which made I2
     * false-positive on every TTS-synced formula. When set, the harness replays
     * each math_show via SET_MATH (applying persist) and snapshots the equation
     * panel per formula into StateCapture.i2_frames. Opt-in — auto-fire never
     * sets it, so its behavior is unchanged.
     */
    ttsMathByState?: Record<string, TtsMathStepInput[]>;
    /**
     * Non-default scene_groups to capture per state, keyed by state id. See
     * ExtraSceneGroups. Opt-in — absent means the previous behaviour exactly.
     */
    extraSceneGroupsByState?: ExtraSceneGroups;
    /**
     * Deterministic frozen-frame capture for H2 regression baselines. For each
     * state (after dense + I2 capture, so motion analysis is unaffected) the
     * harness posts RESET_TRAJECTORY then SET_TIME_FREEZE {at_ms} — the
     * renderer pins its virtual clock at the state-local offset, making every
     * time-driven pixel identical across runs. Renderers without the handler
     * degrade gracefully (the frame is captured unpinned; visual_approve's
     * determinism check decides whether it becomes a compared baseline).
     * Opt-in — auto-fire never sets it.
     *
     * atMs is the flat fallback; atMsByState lets each state pin at its own
     * all-reveals-complete sim-time (see maxRevealMsByState) so late reveals
     * land in the baseline. captureFrozenFrame picks atMsByState[id] ?? atMs ?? 1500.
     */
    frozenFrame?: { atMs?: number; atMsByState?: Record<string, number>; settleMs?: number };
    /**
     * Per-state "all-reveals-complete" sim-time (state-local ms), from
     * deriveMaxRevealTimeMs. When set for a state, the PRIMARY vision frame is
     * captured sim-time-aware: the harness pins the renderer clock at the target
     * (SET_TIME_FREEZE) and POLLS window.PM_simTimeMs until it actually reaches
     * the target before the screenshot — so timed reveals are photographed even
     * though headless rAF throttling makes field_3d's frame-count clock lag
     * wall-clock. After capture the pin is released so the dense series runs
     * live. Absent for a state → the legacy fixed 1s settle is used. Opt-in.
     */
    maxRevealMsByState?: Record<string, number>;
}

export interface TtsMathStepInput {
    sentence_id: string;
    /** LaTeX expression posted via SET_MATH. */
    math_show: string;
    /** persist flag (append vs replace) passed to SET_MATH. */
    math_persist: boolean;
}

export interface DenseCaptureOptions {
    /** Interval between dense frames. Default 1000ms. */
    intervalMs?: number;
    /** Per-state capture duration in ms (clamped 3000–60000). Default 10000. */
    durationMsByState?: Record<string, number>;
    /** Safety cap on frames per state. Default 61. */
    maxFramesPerState?: number;
}

/**
 * NON-DEFAULT scene_groups to capture in ADDITION to the ordinary walk.
 *
 * A field_3d state may partition its scene into views a teacher switches with
 * the in-sim picker. The ordinary walk sees only the authored default, so the
 * other view was captured by nothing, gated by nothing and baselined by nothing
 * — bug_class every_visual_gate_captures_only_the_default_scene_group_so_a_
 * partitioned_explore_states_other_view_is_ungated. On lines_and_planes_in_space
 * the unvisited view was a STILL PICTURE for its entire life and survived three
 * Checkpoint-B cycles; the CRITICAL introduced by the fix for it then shipped
 * through the same hole.
 *
 * Deliberately ADDITIVE: each extra view is captured under its own synthetic id
 * `<STATE>@<group>`, so every existing state_id, gate result and approved
 * baseline in the fleet is byte-for-byte untouched, and a concept that declares
 * no groups takes no new code path at all.
 */
export type ExtraSceneGroups = Record<string, string[]>;

/** Join a state and a non-default view into the id its artifacts are keyed by. */
export function sceneGroupStateId(stateId: string, group: string): string {
    return `${stateId}@${group}`;
}

export interface StateCapture {
    /**
     * `STATE_N` for the ordinary walk, or `STATE_N@<group>` for a non-default
     * scene_group captured by the extra pass (see ExtraSceneGroups).
     */
    state_id: string;
    /** The non-default scene_group this capture is of, when it is one. */
    scene_group?: string;
    panel_a_png_b64: string;
    panel_b_png_b64?: string;
    /** Side-by-side composite for Cat F vision prompts. */
    combined_png_b64?: string;
    /**
     * Category I2 per-formula frames — one panel-A snapshot per declared
     * math_show sentence, captured while that formula is on screen (SET_MATH
     * replayed by the harness). Present only when CaptureRequest.ttsMathByState
     * was set for this state. Lets the vision model confirm each formula renders
     * in the frame where the student actually sees it.
     */
    i2_frames?: I2Frame[];
    /**
     * Deterministic frozen frame (panel A) — virtual clock pinned at
     * CaptureRequest.frozenFrame.atMs via SET_TIME_FREEZE. Present only when
     * frozenFrame was requested. Compared against the __frozen.png baseline
     * by regressionGate when the manifest sets compare_frozen.
     */
    frozen_png_b64?: string;
}

export interface I2Frame {
    sentence_id: string;
    /** The LaTeX expression that should be visible in this frame. */
    expression: string;
    panel_a_png_b64: string;
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

export interface DenseTimeseries {
    state_id: string;
    /** Base64 PNGs at ~intervalMs spacing across the state's duration. */
    frames_b64: string[];
    /**
     * Per-frame SIM-time (state-local ms), the time base for the D5/D6/D7 motion
     * gates. On the field_3d path these are the deterministic pinned targets the
     * renderer clock was crawled to (uniform intervalMs spacing) — a frame that
     * could not reach its target within the wall cap records the actual sim-ms it
     * got to. On the fallback path (renderers without PM_simTimeMs) these are the
     * legacy wall-clock elapsed times, which drift with screenshot latency.
     */
    capture_times_ms: number[];
}

export interface TemplateLeakFinding {
    state_id: string;
    panel: PanelName;
    /** The literal {var} or {expr.toFixed(N)} text that leaked into rendered DOM. */
    sample_text: string;
}

export interface ConsoleErrorFinding {
    /** State active when the error fired ('(load)' = before the first state drive). */
    state_id: string;
    /**
     * 'pageerror' = uncaught exception; 'console' = console.error() output;
     * 'consolewarn' = a renderer self-diagnostic emitted via console.warn
     * (collected into `diagnostic_warnings`, never into `console_errors`).
     */
    kind: 'pageerror' | 'console' | 'consolewarn';
    text: string;
}

/**
 * Renderer self-diagnostics worth surfacing from console.warn.
 *
 * Deliberately an allow-list of documented `[PM_*]` prefixes rather than every
 * warning: browsers and third-party libraries emit warnings constantly, and a
 * capture that reports all of them reports none of them.
 */
const DIAGNOSTIC_WARN_RE = /\[PM_[A-Z0-9_]+\]/;

export interface CaptureResult {
    state_captures: StateCapture[];
    timings: TimingMeasurement[];
    param_relay: ParamRelayMeasurement;
    animation_timeseries?: AnimationTimeseries;
    /** Per-state dense frame series — present only when CaptureRequest.dense was set. */
    dense_timeseries?: DenseTimeseries[];
    /**
     * H1 (template substitution leak) — DOM-scan findings collected per state per panel.
     * Inline scan inside the capture loop. Empty array = no leaks via DOM path
     * (OCR backstop in pixelGate.ts still runs on canvas-rendered text).
     */
    template_leak_dom_findings: TemplateLeakFinding[];
    /**
     * H3 (render console errors) — every console.error / uncaught exception the
     * page (including the sim iframes) emitted during capture, attributed to the
     * state being driven at the time. A render crash or dead-slider throw shows
     * up here even when the pixels look plausible.
     */
    console_errors: ConsoleErrorFinding[];
    /**
     * Renderer self-diagnostics (`[PM_*]` prefixes) emitted via console.warn.
     *
     * Separate from `console_errors` so surfacing them does not silently become a
     * new hard gate — H3 fails on any `console_errors` entry. These are evidence
     * for a reviewer (an overflowing work ledger, a bound-clamped energy layer),
     * not a verdict.
     */
    diagnostic_warnings?: ConsoleErrorFinding[];
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
  // STATE_REACHED registry — sims post STATE_REACHED to window.parent (= THIS
  // wrapper window), NOT to their own iframe window, so it must be recorded
  // here. Timestamps are wrapper performance.now() — the same clock
  // driveToState() uses for postTs, so the subtraction is valid.
  window.__pmStateReachedByPanel = { A: {}, B: {} };
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
    if (e.data && e.data.type === 'STATE_REACHED' && typeof e.data.state === 'string'){
      if (src === 'A' || src === 'B') window.__pmStateReachedByPanel[src][e.data.state] = performance.now();
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
 * Probe injected into each panel iframe so we can read PARAM_UPDATE arrival
 * timestamps without modifying the sim HTML itself. (STATE_REACHED is recorded
 * in the WRAPPER window — sims post it to window.parent, so an iframe-side
 * listener would never see it.) Receipt uses Date.now(): the relay post
 * timestamp is taken in the wrapper window, and performance.now() timeOrigins
 * differ between frames — wall clock is the only shared clock.
 */
const PANEL_PROBE_SCRIPT = `
(function(){
  if (window.__pmProbeInstalled) return;
  window.__pmProbeInstalled = true;
  window.__pmParamReceived = null;
  window.addEventListener('message', function(e){
    if (e.data && e.data.type === 'PARAM_UPDATE' && e.data.__pmTest === true){
      window.__pmParamReceived = { ts: Date.now(), key: e.data.key, value: e.data.value };
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

        // H3 collectors — attach BEFORE routing/setContent so load-time crashes
        // are caught too. Sims run inside iframes; page-level 'console' receives
        // child-frame events, and iframe uncaught exceptions surface as
        // console-type 'error' (pageerror covers the wrapper itself).
        const consoleErrors: ConsoleErrorFinding[] = [];
        const diagnosticWarnings: ConsoleErrorFinding[] = [];
        let consoleStateId = '(load)';
        page.on('pageerror', (e) => {
            consoleErrors.push({ state_id: consoleStateId, kind: 'pageerror', text: String(e) });
        });
        page.on('console', (m) => {
            if (m.type() === 'error') {
                consoleErrors.push({ state_id: consoleStateId, kind: 'console', text: m.text() });
                return;
            }
            // Renderer self-diagnostics are emitted with console.warn, which Playwright
            // types 'warning' — so filtering on 'error' alone made every one of them
            // invisible to every gate. Two renderer contracts assert THE EYE audits
            // [PM_NLB_ENERGY_SCALE] / [PM_NLB_ENERGY_CLAMP]; neither prefix had ever
            // reached a capture, so an overflowing work ledger or a bound-clamped
            // energy layer shipped silently while the comments claimed otherwise.
            //
            // Collected SEPARATELY from console_errors on purpose: runConsoleChecks
            // fails H3 on any console_errors entry, so routing warnings there would
            // silently turn a visibility fix into a new hard gate and could fail
            // already-shipped concepts. Surface them as evidence; promoting them to a
            // failure is a separate, founder-gated decision.
            if (m.type() === 'warning' && DIAGNOSTIC_WARN_RE.test(m.text())) {
                diagnosticWarnings.push({ state_id: consoleStateId, kind: 'consolewarn', text: m.text() });
            }
        });

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
        const denseTimeseries: DenseTimeseries[] = [];
        for (const stateId of req.stateIds) {
            consoleStateId = stateId;
            const timing = await driveToState(page, stateId, hasPanelB, perStateTimeoutMs);
            timings.push(timing);
            if (timing.timed_out) warnings.push(`STATE_REACHED timeout for ${stateId}`);

            // Sim-time-aware primary capture. When this state declares a reveal
            // schedule, pin the renderer clock at the all-reveals-complete time
            // and POLL window.PM_simTimeMs until it actually gets there — so late
            // reveals are photographed despite headless rAF throttling lagging
            // field_3d's frame-count clock. Otherwise fall back to the legacy
            // fixed settle (covers the renderer's 800ms state-transition interp).
            const revealTargetMs = req.maxRevealMsByState?.[stateId];
            if (revealTargetMs != null && revealTargetMs > 0) {
                await postToPanels(page, { type: 'RESET_TRAJECTORY' }, hasPanelB);
                // Pair with REPLAY_ANIMATIONS (engine_bug_queue dipole_replay_animations_
                // scenario_type_gap, 2026-07-08) — production's rollTimeline() always sends
                // RESET_TRAJECTORY immediately followed by REPLAY_ANIMATIONS; THE EYE only
                // sent the former, so any one-shot rotation timer that RESET_TRAJECTORY
                // itself doesn't rebase (e.g. the dipole engine's rotation_start_time) went
                // stale relative to the fresh stateStartTime. No-op on renderers without
                // the handler.
                await postToPanels(page, { type: 'REPLAY_ANIMATIONS' }, hasPanelB);
                await postToPanels(page, { type: 'SET_TIME_FREEZE', at_ms: revealTargetMs }, hasPanelB);
                const wallCapMs = revealTargetMs * 3.5 + 8000;
                const poll = await pollSimTimeReached(page, 'panel_a', revealTargetMs, {
                    // Cap widened 2026-07-31 alongside making the stall fatal: a
                    // genuinely-working-but-slow run on a loaded machine must not fail
                    // spuriously now that a stall aborts. Widening ALONE would have been
                    // the wrong fix — it only moves the threshold at which a silent
                    // wrong-phase frame is manufactured.
                    wallCapMs,
                    // …and widening was still not enough on real hardware, because the
                    // cap is a bet on headless frame rate (see pollSimTimeReached). Past
                    // the budget, keep waiting only while the pinned clock is genuinely
                    // still climbing; flatline → abort immediately.
                    extendWhileProgressingUntilMs: Math.max(wallCapMs * 3, 60000),
                });
                if (!poll.reached) {
                    // FATAL — never capture anyway. A frame that never reached its pin
                    // photographs an arbitrary phase of the animation, and every
                    // downstream gate (D5/D6/D7 motion, H2 baseline diff) then reads it
                    // as evidence. That is how a false PASS is manufactured: on
                    // equilibrium_of_particles this path certified seven MOTIONLESS
                    // states 31/31 while never observing a single moving frame.
                    // A frame that missed its pin is not evidence — fail the run loudly
                    // so the cause gets fixed, rather than degrading into a warning
                    // nobody reads.
                    // Rate is the diagnosis, so PUT IT IN THE ARTIFACT. Under a pin the
                    // clock advances 16.67ms per rendered frame, so sim-ms/wall-s ÷ 16.67
                    // is the headless frame rate — the number that says whether this was a
                    // dead pin (≈0) or a slow scene (climbing steadily and still short).
                    const simMsPerSec = poll.waitedMs > 0 ? (poll.lastSimMs / poll.waitedMs) * 1000 : 0;
                    throw new Error(
                        `EYE_CAPTURE_ABORTED — sim-time pin never reached for ${stateId}: `
                        + `PM_simTimeMs reached ${Math.round(poll.lastSimMs)}/${revealTargetMs}ms `
                        + `(${((100 * poll.lastSimMs) / revealTargetMs).toFixed(1)}%) after ${poll.waitedMs}ms of polling `
                        + `[gave up: ${poll.gaveUp}; budget ${Math.round(wallCapMs)}ms, ceiling ${Math.round(Math.max(wallCapMs * 3, 60000))}ms]. `
                        + `Observed pinned-clock rate ${Math.round(simMsPerSec)} sim-ms/s ≈ ${(simMsPerSec / 16.67).toFixed(1)} fps. `
                        + `The frame would show an arbitrary phase, so it is NOT evidence and was not captured. `
                        + (poll.gaveUp === 'stalled'
                            ? `The clock FLATLINED (no advance for ${POLL_STALL_WINDOW_MS}ms) — the renderer is ignoring `
                              + `SET_TIME_FREEZE or its clock is not running. This is a renderer defect, not slowness.`
                            : `The clock was still ADVANCING at the ceiling — this scene is too slow to reach its pin on `
                              + `this machine. Re-run on a quiet box; if it recurs, the state's reveal target is too late `
                              + `for the headless frame rate and the choreography (not the cap) needs shortening.`),
                    );
                }
                // Compass + other performance.now()-driven easings can't be pinned;
                // give them a settle floor (matches captureFrozenFrame's rationale).
                // For throttled field_3d the poll itself usually waits well past this.
                const settleRemaining = 3200 - poll.waitedMs;
                if (settleRemaining > 0) await page.waitForTimeout(settleRemaining);
            } else {
                // Settle past the renderer's 800ms state-transition interpolation
                // before ANY capture. Before the 2026-06-10 handshake fix the
                // (always-failing) 5s STATE_REACHED timeout masked this; a 150ms
                // wait then caught the transition flash as a ~98% first-frame diff
                // (false D6 teleport) and mid-transition static frames.
                await page.waitForTimeout(1000);
            }

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

            // Release the primary-frame time pin BEFORE the dense series so the
            // dense capture sees a LIVE clock from a fresh state-local t=0 (D5/D6/D7
            // need motion). SET_TIME_FREEZE{frozen:false} clears the pin;
            // RESET_TRAJECTORY re-zeroes stateStartTime + the trail. No-op on
            // renderers without these handlers. REPLAY_ANIMATIONS pairs with it (see
            // note above) so a fresh dense "t=0" shows the state's TRUE authored
            // starting pose (e.g. a damped_pendulum's initial angle), not wherever the
            // primary capture's forward time-snap had already carried a one-shot
            // rotation timer that RESET_TRAJECTORY alone doesn't rebase.
            if (revealTargetMs != null && revealTargetMs > 0) {
                await postToPanels(page, { type: 'SET_TIME_FREEZE', frozen: false }, hasPanelB);
                await postToPanels(page, { type: 'RESET_TRAJECTORY' }, hasPanelB);
                await postToPanels(page, { type: 'REPLAY_ANIMATIONS' }, hasPanelB);
            }

            // Dense series — the state is already active here, so capture in place.
            // Runs BEFORE the I2 math replay so motion frames stay free of the
            // equation panel (which would otherwise register as a first-frame diff).
            if (req.dense) {
                try {
                    denseTimeseries.push(await captureDenseSeries(page, stateId, req.dense));
                } catch (err) {
                    warnings.push(`Dense capture failed for ${stateId}: ${err instanceof Error ? err.message : String(err)}`);
                }
            }

            // Category I2 — replay this state's TTS math_show sequence so the
            // KaTeX equation panel renders, and snapshot per formula. The headless
            // capture never drives TTS, so without this the panel is always blank
            // and I2 false-positives on every TTS-synced formula.
            const mathSteps = req.ttsMathByState?.[stateId];
            if (mathSteps && mathSteps.length > 0) {
                try {
                    const frames = await captureI2Frames(page, mathSteps);
                    if (frames.length > 0) {
                        const target = stateCaptures.find(c => c.state_id === stateId);
                        if (target) target.i2_frames = frames;
                    }
                } catch (err) {
                    warnings.push(`I2 math capture failed for ${stateId}: ${err instanceof Error ? err.message : String(err)}`);
                } finally {
                    // Clear the panel so the next state / animation time-series
                    // is not polluted by leftover equation lines.
                    await postMathToPanelA(page, null, false);
                }
            }

            // Frozen frame — LAST in the per-state sequence (freezing before the
            // dense series would kill D5's motion evidence). RESET_TRAJECTORY
            // makes the pin state-local; release + reset afterward so the next
            // state never renders pinned.
            if (req.frozenFrame) {
                try {
                    const atMs = req.frozenFrame.atMsByState?.[stateId] ?? req.frozenFrame.atMs ?? 1500;
                    const frozen = await captureFrozenFrame(page, hasPanelB, { atMs, settleMs: req.frozenFrame.settleMs });
                    const target = stateCaptures.find(c => c.state_id === stateId);
                    // A frozen frame that missed its pin is DROPPED, not stored. H2's
                    // frozen compare then reports an honest "Skipped — this capture has
                    // no frozen frame" (a path that already exists) instead of diffing an
                    // arbitrary phase and calling the difference a regression. Silence is
                    // not an option here: this is the frame visual:approve would freeze.
                    if (!frozen.reached) {
                        warnings.push(
                            `Frozen frame DROPPED for ${stateId}: sim-time pin never reached `
                            + `(${Math.round(frozen.lastSimMs)}/${atMs}ms after ${frozen.waitedMs}ms, `
                            + `${Math.round((frozen.lastSimMs / Math.max(1, frozen.waitedMs)) * 1000)} sim-ms/s). `
                            + `A mid-reveal frame is not a deterministic baseline, so it was discarded — `
                            + `H2's frozen compare for this state will report as skipped. Re-run on a quieter machine.`,
                        );
                    } else if (target) {
                        target.frozen_png_b64 = frozen.png;
                    }
                } catch (err) {
                    warnings.push(`Frozen-frame capture failed for ${stateId}: ${err instanceof Error ? err.message : String(err)}`);
                }
            }
        }

        // ── EXTRA PASS · the non-default scene_groups ────────────────────────
        //   A partitioned state is more than one sandbox behind one card, and the
        //   walk above saw only the authored default. Everything here is ADDITIVE:
        //   each view is captured under `<STATE>@<group>`, so no existing state_id,
        //   gate result or approved baseline moves. A concept declaring no groups
        //   never enters this loop.
        //
        //   Deliberately NOT the primary path's fatal pin: a missed pin on an EXTRA
        //   view must not abort the run and lose the ordinary capture with it. The
        //   frozen frame keeps its own pin+drop discipline (captureFrozenFrame
        //   returns `reached`), so a wrong-phase frame is still never stored.
        const extraGroups = req.extraSceneGroupsByState ?? {};
        for (const stateId of Object.keys(extraGroups)) {
            for (const group of extraGroups[stateId] ?? []) {
                const synthId = sceneGroupStateId(stateId, group);
                try {
                    consoleStateId = synthId;
                    const t = await driveToState(page, stateId, hasPanelB, perStateTimeoutMs);
                    if (t.timed_out) warnings.push(`STATE_REACHED timeout for ${synthId}`);

                    if (!(await selectSceneGroup(page, group))) {
                        // Never capture the default view a second time under another
                        // name — that would manufacture coverage rather than measure it.
                        warnings.push(
                            `Scene group "${group}" NOT captured for ${stateId}: the sim exposes no `
                            + `#vg_scene_group_select option for it. The view remains ungated.`,
                        );
                        continue;
                    }
                    // Same settle the primary path uses on its non-pinned branch — the
                    // group swap re-derives the control rows and the scene re-renders.
                    await page.waitForTimeout(1000);

                    const png = await captureIframe(page, 'panel_a');
                    stateCaptures.push({
                        state_id: synthId,
                        scene_group: group,
                        panel_a_png_b64: png.toString('base64'),
                    });

                    if (req.dense) {
                        try {
                            denseTimeseries.push(await captureDenseSeries(page, synthId, req.dense));
                        } catch (err) {
                            warnings.push(`Dense capture failed for ${synthId}: ${err instanceof Error ? err.message : String(err)}`);
                        }
                    }

                    if (req.frozenFrame) {
                        try {
                            const atMs = req.frozenFrame.atMsByState?.[synthId]
                                ?? req.frozenFrame.atMsByState?.[stateId]
                                ?? req.frozenFrame.atMs ?? 1500;
                            const frozen = await captureFrozenFrame(page, hasPanelB, { atMs, settleMs: req.frozenFrame.settleMs });
                            const target = stateCaptures.find(c => c.state_id === synthId);
                            if (!frozen.reached) {
                                warnings.push(
                                    `Frozen frame DROPPED for ${synthId}: sim-time pin never reached `
                                    + `(${Math.round(frozen.lastSimMs)}/${atMs}ms). Not a deterministic baseline, so discarded.`,
                                );
                            } else if (target) {
                                target.frozen_png_b64 = frozen.png;
                            }
                        } catch (err) {
                            warnings.push(`Frozen-frame capture failed for ${synthId}: ${err instanceof Error ? err.message : String(err)}`);
                        }
                    }
                } catch (err) {
                    // One bad view must not cost the run every other view's evidence.
                    warnings.push(`Scene-group capture failed for ${synthId}: ${err instanceof Error ? err.message : String(err)}`);
                }
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
            dense_timeseries: req.dense ? denseTimeseries : undefined,
            template_leak_dom_findings: templateLeakDomFindings,
            console_errors: consoleErrors,
            diagnostic_warnings: diagnosticWarnings,
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

/** Sim-time advance that counts as real progress (≈6 pinned 1/60s frame steps). */
const POLL_PROGRESS_EPSILON_MS = 100;
/** No progress for this much WALL time = the clock is stuck, not merely slow. */
const POLL_STALL_WINDOW_MS = 4000;

/**
 * Poll the renderer's exposed SIM-TIME clock (window.PM_simTimeMs, state-local
 * ms) inside a panel iframe until it reaches targetMs, or until the wall-clock
 * cap. This is the sim-time-aware wait that defeats the headless-rAF-throttling
 * false negative: rather than guessing on wall-clock, we wait for the renderer's
 * own clock to actually advance past the reveal time. Degrades gracefully —
 * returns reached:false on cap so the caller can warn + capture anyway (never hangs).
 *
 * SLOW ≠ STUCK (2026-08-13, magnetic_field_concept_B). Under a SET_TIME_FREEZE pin
 * the step count is forced to 1 (Rule 36), so the pinned clock advances exactly
 * 16.67ms per RENDERED FRAME — reaching a 12500ms pin costs 750 headless frames.
 * The wall cap is therefore a bet on frame rate: `targetMs * 3.5 + 8000` assumes
 * the scene sustains ≳17fps. magnetic_field_concept_B STATE_5 measured 11344ms of
 * sim time in 51.8s (219 sim-ms/s ≈ 13fps) — it was 91% of the way there, still
 * climbing, and was aborted 1.2% short of the pin for the third session running.
 * Raising the constant would only move that threshold; what actually separates a
 * working-but-slow machine from a renderer that ignores the pin is whether the
 * clock is STILL ADVANCING. So when `extendWhileProgressingUntilMs` is set, the
 * cap stops being an abort and becomes a budget: past it the poll keeps waiting
 * while the clock advances ≥100ms per 4s window, and gives up the moment it
 * flatlines — which catches a genuinely dead pin ~12x FASTER than the old cap did,
 * while letting a slow one finish. Opt-in, so the dense per-frame loop and the
 * frozen-frame poll keep their exact previous timing.
 */
async function pollSimTimeReached(
    page: Page, frameName: PanelName, targetMs: number,
    opts: { wallCapMs: number; pollMs?: number; extendWhileProgressingUntilMs?: number },
): Promise<{ reached: boolean; lastSimMs: number; waitedMs: number; gaveUp: 'cap' | 'stalled' | 'ceiling' | null }> {
    const pollMs = opts.pollMs ?? 50;
    // Tolerance absorbs the renderer's discrete 16ms frame step AND float drift:
    // SET_TIME_FREEZE pins time at stateStartTime + targetMs/1000, and
    // (stateStartTime + x) - stateStartTime is not exactly x in float when
    // stateStartTime is large, so PM_simTimeMs can land at e.g. 7299.999 for a
    // 7300 target. Without this the poll misses the pin and burns the full cap.
    const SIM_TIME_TOLERANCE_MS = 50;
    const ceilingMs = opts.extendWhileProgressingUntilMs ?? opts.wallCapMs;
    const start = Date.now();
    let lastSimMs = 0;
    let progressSimMs = 0;
    let progressAt = start;
    for (;;) {
        const frame = getFrame(page, frameName);
        if (frame) {
            try {
                const sim = await frame.evaluate(() => {
                    const w = window as unknown as { PM_simTimeMs?: number };
                    return typeof w.PM_simTimeMs === 'number' ? w.PM_simTimeMs : null;
                });
                if (typeof sim === 'number') {
                    lastSimMs = sim;
                    if (sim >= targetMs - SIM_TIME_TOLERANCE_MS) return { reached: true, lastSimMs: sim, waitedMs: Date.now() - start, gaveUp: null };
                    if (sim - progressSimMs >= POLL_PROGRESS_EPSILON_MS) { progressSimMs = sim; progressAt = Date.now(); }
                }
            } catch {
                // Frame mid-navigation or renderer without PM_simTimeMs — retry / time out.
            }
        }
        const elapsed = Date.now() - start;
        if (elapsed >= ceilingMs) {
            return { reached: false, lastSimMs, waitedMs: elapsed, gaveUp: ceilingMs > opts.wallCapMs ? 'ceiling' : 'cap' };
        }
        // Past the nominal budget, only a STILL-ADVANCING clock earns more time.
        if (elapsed >= opts.wallCapMs && Date.now() - progressAt >= POLL_STALL_WINDOW_MS) {
            return { reached: false, lastSimMs, waitedMs: elapsed, gaveUp: 'stalled' };
        }
        await page.waitForTimeout(pollMs);
    }
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

/**
 * Switch panel A to a scene_group by driving the sim's own picker.
 *
 * There is NO inbound message for this — field_3d emits PARAM_UPDATE outward
 * (Rule 27) but has no handler to receive a scene_group, so postMessage cannot
 * do it. The picker's change listener is the only path, and it is enough: it
 * sets PM_vgSceneGroup and re-runs the two row passes (deliberately NOT a full
 * apply, which would clear drag-seize flags — Rule 39c).
 *
 * MUST go through getFrame(), not the wrapper's contentDocument. The wrapper is
 * setContent'd while the panel is served from http://__pm_validator__.local, so
 * they are CROSS-ORIGIN: reading iframe.contentDocument from the wrapper throws,
 * and a try/catch around it fails silently — which is exactly how the first
 * version of this reported "the sim exposes no option for it" on a sim whose
 * picker was present and correctly populated with ["A","B"]. It is the same
 * reason every other panel reach-in here uses the frame handle or the
 * __postToPanel relay.
 *
 * Returns false when the picker or the option is genuinely absent, so the caller
 * can warn rather than capture the default view a second time under another name.
 */
async function selectSceneGroup(page: Page, group: string): Promise<boolean> {
    const frame = getFrame(page, 'panel_a');
    if (!frame) return false;
    try {
        return await frame.evaluate((g: string) => {
            const sel = document.getElementById('vg_scene_group_select') as HTMLSelectElement | null;
            if (!sel) return false;
            if (!Array.from(sel.options).some((o) => o.value === g)) return false;
            sel.value = g;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }, group);
    } catch {
        return false;
    }
}

async function driveToState(
    page: Page, stateId: string, hasPanelB: boolean, timeoutMs: number,
): Promise<TimingMeasurement> {
    const postTs = await page.evaluate(({ id, hasB }) => {
        const w = window as unknown as {
            __postToPanel?: (panel: string, msg: unknown) => void;
            __pmStateReachedByPanel?: Record<string, Record<string, number>>;
        };
        // Clear any stale timestamp for this state — captureAnimationTimeseries
        // re-drives a state already visited, and a leftover entry would
        // short-circuit the poll with the OLD arrival time.
        if (w.__pmStateReachedByPanel) {
            delete w.__pmStateReachedByPanel.A?.[id];
            delete w.__pmStateReachedByPanel.B?.[id];
        }
        const t0 = performance.now();
        w.__postToPanel?.('A', { type: 'SET_STATE', state: id });
        if (hasB) w.__postToPanel?.('B', { type: 'SET_STATE', state: id });
        return t0;
    }, { id: stateId, hasB: hasPanelB });

    const deadline = Date.now() + timeoutMs;
    let aTs: number | undefined;
    let bTs: number | undefined;
    while (Date.now() < deadline && (aTs === undefined || (hasPanelB && bTs === undefined))) {
        if (aTs === undefined) aTs = await readStateReached(page, 'A', stateId);
        if (hasPanelB && bTs === undefined) bTs = await readStateReached(page, 'B', stateId);
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

/**
 * Read a STATE_REACHED arrival timestamp from the WRAPPER window's registry.
 * Sims post STATE_REACHED to window.parent (the wrapper), so it is recorded
 * there — an iframe-side read would never see it (the bug behind the universal
 * "STATE_REACHED timeout" warnings prior to 2026-06-10).
 */
async function readStateReached(page: Page, panel: 'A' | 'B', stateId: string): Promise<number | undefined> {
    try {
        const result = await page.evaluate(({ p, id }) => {
            const w = window as unknown as { __pmStateReachedByPanel?: Record<string, Record<string, number>> };
            return w.__pmStateReachedByPanel?.[p]?.[id] ?? null;
        }, { p: panel, id: stateId });
        return typeof result === 'number' ? result : undefined;
    } catch {
        return undefined;
    }
}

/** Post an arbitrary message to one or both panels via the wrapper relay. */
async function postToPanels(page: Page, msg: Record<string, unknown>, hasPanelB: boolean): Promise<void> {
    try {
        await page.evaluate(({ m, hasB }) => {
            const w = window as unknown as { __postToPanel?: (panel: string, msg: unknown) => void };
            w.__postToPanel?.('A', m);
            if (hasB) w.__postToPanel?.('B', m);
        }, { m: msg, hasB: hasPanelB });
    } catch {
        // Non-fatal — callers surface warnings on missing output.
    }
}

/**
 * Capture the deterministic frozen frame for the CURRENT state:
 * RESET_TRAJECTORY (re-zeroes the renderer's state-local clock + trail) →
 * REPLAY_ANIMATIONS (re-stamps one-shot rotation timers RESET_TRAJECTORY alone
 * doesn't touch, e.g. the dipole engine's rotation_start_time — engine_bug_queue
 * dipole_replay_animations_scenario_type_gap, 2026-07-08; mirrors production's
 * rollTimeline() which always sends the two together) →
 * SET_TIME_FREEZE {at_ms} (virtual clock advances to the pin and holds) →
 * settle wait (covers the pin run-up PLUS the renderer's wall-clock easings,
 * e.g. the compass swing, which SET_TIME_FREEZE cannot pin — see the renderer
 * handler comment) → screenshot → release the pin + reset.
 */
async function captureFrozenFrame(
    page: Page, hasPanelB: boolean, opts: { atMs: number; settleMs?: number },
): Promise<{ png: string; reached: boolean; lastSimMs: number; waitedMs: number }> {
    await postToPanels(page, { type: 'RESET_TRAJECTORY' }, hasPanelB);
    await postToPanels(page, { type: 'REPLAY_ANIMATIONS' }, hasPanelB);
    await postToPanels(page, { type: 'SET_TIME_FREEZE', at_ms: opts.atMs }, hasPanelB);
    // Poll the renderer's actual sim-clock to REACH the pin before settling —
    // headless rAF throttling means field_3d's frame-count clock can still be
    // climbing to the pin when the wall-clock settle below would otherwise fire.
    //
    // THIS FRAME IS THE H2 BASELINE, so a missed pin is worse here than anywhere
    // else in the harness: the primary capture was made FATAL on a missed pin
    // (2026-07-31) precisely because a wrong-phase frame becomes evidence, yet
    // this path kept capturing regardless and its output is what visual:approve
    // freezes forever. MEASURED (magnetic_field_concept_B STATE_5, 2026-08-13): a
    // 12500ms pin under the old cap of atMs*2.5+4000 = 35.25s needs ~57s at this
    // machine's observed 219 sim-ms/s, so the frozen frame was photographed
    // mid-reveal — the state's live capture (fatal path, pin reached) and its own
    // frozen capture disagreed by 3.71% inside a SINGLE run, versus 1.37% in the
    // run the baseline was made from, and H2 read the difference as a 3.57%
    // regression in a renderer that had not changed. Same progress-extension as
    // the primary path, and the caller now DROPS a frame that missed its pin.
    const wallCapMs = opts.atMs * 2.5 + 4000;
    const poll = await pollSimTimeReached(page, 'panel_a', opts.atMs, {
        wallCapMs,
        extendWhileProgressingUntilMs: Math.max(wallCapMs * 3, 60000),
    });
    // Settle covers the pin run-up PLUS performance.now()-driven easings (compass
    // swing) the pin can't freeze. Subtract time already spent polling.
    const settle = Math.max(opts.atMs * 1.1 + 500, opts.settleMs ?? 3000);
    const settleRemaining = settle - poll.waitedMs;
    if (settleRemaining > 0) await page.waitForTimeout(settleRemaining);
    const png = await captureIframe(page, 'panel_a');
    await postToPanels(page, { type: 'SET_TIME_FREEZE', frozen: false }, hasPanelB);
    await postToPanels(page, { type: 'RESET_TRAJECTORY' }, hasPanelB);
    await postToPanels(page, { type: 'REPLAY_ANIMATIONS' }, hasPanelB);
    return { png: png.toString('base64'), reached: poll.reached, lastSimMs: poll.lastSimMs, waitedMs: poll.waitedMs };
}

/** Post a SET_MATH message to Panel A (drives the renderer's equation panel). */
async function postMathToPanelA(page: Page, expression: string | null, persist: boolean): Promise<void> {
    try {
        await page.evaluate(({ expr, p }) => {
            const w = window as unknown as { __postToPanel?: (panel: string, msg: unknown) => void };
            w.__postToPanel?.('A', { type: 'SET_MATH', expression: expr, persist: p });
        }, { expr: expression, p: persist });
    } catch {
        // Non-fatal — the caller surfaces a warning if frames end up empty.
    }
}

/**
 * Replay a state's math_show sequence and snapshot Panel A after each formula.
 * Each step posts SET_MATH (applying its persist flag, exactly like the
 * TeacherPlayer), waits for KaTeX render + the 280ms fade-in, then captures.
 * The panel is reset before the sequence so prior states don't bleed in.
 */
async function captureI2Frames(page: Page, steps: TtsMathStepInput[]): Promise<I2Frame[]> {
    const frames: I2Frame[] = [];
    // Start from a clean panel so a persist chain accumulates exactly as it
    // would live (replace clears it; append builds on the prior lines).
    await postMathToPanelA(page, null, false);
    await page.waitForTimeout(60);
    for (const step of steps) {
        await postMathToPanelA(page, step.math_show, step.math_persist);
        // KaTeX render is synchronous; the equation_line fade-in is 280ms.
        await page.waitForTimeout(360);
        const png = await captureIframe(page, 'panel_a');
        frames.push({
            sentence_id: step.sentence_id,
            expression: step.math_show,
            panel_a_png_b64: png.toString('base64'),
        });
    }
    return frames;
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

// 700ms, NOT a round 1000ms, and the oddness is the whole point: the interval
// must stay INCOMMENSURATE with the drive periods sims actually animate at.
// At 1000ms a state driven at f_demo=0.5Hz advances exactly 180° per sample, so
// every frame catches sin(ωt) at the same phase — bead displacement
// (disp = amp*sin θ) reads exactly 0.000 and opacity exactly 0.450 in EVERY
// frame. Measured 2026-08-10 across Ch.7: adjacent dense frames byte-identical
// (max channel delta 0/255) on states whose beads were provably moving — the
// frozen frame, pinned at a non-integer 4700ms, differed by 190/255 over 750px.
// f_demo=0.25Hz aliases the same way for sin(2ωt)/sin²/cos² power and energy
// terms. That produced BOTH false D5 failures (4 states) and false passes (a
// state "passing" on a phasor fan flipping 0°↔180°) across 44 states / 6
// concepts. 700ms advances 126°/sample at 0.5Hz — a 7-sample phase cycle — and
// its finer spacing also stops short cue windows (a 1s freeze hold) falling
// between samples. Any replacement must satisfy: (interval_ms * f_hz * 360)
// mod 180 != 0 for every f a sim drives at.
const DENSE_DEFAULT_INTERVAL_MS = 700;
const DENSE_DEFAULT_DURATION_MS = 10000;
const DENSE_MIN_DURATION_MS = 3000;
// 60s / 61 frames: follow the declared state duration (Rule-31 guided states
// run to their narration length, up to ~50s) — dense frames feed ONLY the $0
// pixel gates, never the vision models, so the cap is a wall-time guard, not a
// cost guard. Raised from 30000/31 on 2026-07-03 in lockstep with
// deriveStateMeta DURATION_MAX_MS (the 30s clamp hid every narration tail past
// 30s from the gate); previously raised from 15000/15 on 2026-06-10.
const DENSE_MAX_DURATION_MS = 60000;
// Must track DENSE_DEFAULT_INTERVAL_MS: frameCount = min(maxFrames,
// floor(duration/interval)+1), so this cap — not the duration — is what
// actually bounds coverage. 60000/700+1 = 86.7, hence 87. Left at the old 61 it
// would silently clip every state at 42s and re-open the long-narration-tail
// blind spot the 2026-07-03 raise closed.
const DENSE_DEFAULT_MAX_FRAMES = 87;

/**
 * Capture a dense frame series for the CURRENT state (caller has already
 * driven the page to `stateId`). Panel A only — motion analysis targets the
 * primary simulation canvas.
 *
 * field_3d path: instead of screenshotting on a free-running clock at WALL-clock
 * intervals — which lags sim-time ~0.6× under headless rAF throttling because
 * each screenshot stalls the render loop, so late narration beats (a current-flip
 * at sim-20s, a compass at sim-18s) were never reached — we crawl the renderer
 * clock to evenly spaced SIM-time targets via SET_TIME_FREEZE + pollSimTimeReached
 * (the same pin+poll captureFrozenFrame uses). SET_TIME_FREEZE advances the clock
 * one rAF frame at a time up to the pin, so per-frame accumulators (particle
 * trail, equal-arc dots, current drift) fill exactly as in a live run —
 * deterministic pixels, full sim-time coverage, no baseline churn (dense is never
 * compared to a baseline). field_3d AND parametric/PCPL both declare
 * __PM_supportsTimePin and take this pinned path (parametric got the fixed-step
 * clock + SET_TIME_FREEZE catch-up in commit 2435706); any renderer that does not
 * declare the flag (e.g. mechanics_2d) takes the legacy wall-clock fallback so it
 * never burns a poll cap per frame.
 */
async function captureDenseSeries(
    page: Page, stateId: string, opts: DenseCaptureOptions,
): Promise<DenseTimeseries> {
    const intervalMs = opts.intervalMs ?? DENSE_DEFAULT_INTERVAL_MS;
    const rawDuration = opts.durationMsByState?.[stateId] ?? DENSE_DEFAULT_DURATION_MS;
    const durationMs = Math.min(DENSE_MAX_DURATION_MS, Math.max(DENSE_MIN_DURATION_MS, rawDuration));
    const maxFrames = opts.maxFramesPerState ?? DENSE_DEFAULT_MAX_FRAMES;
    const frameCount = Math.min(maxFrames, Math.floor(durationMs / intervalMs) + 1);

    const frames: string[] = [];
    const captureTimes: number[] = [];

    // Capability probe: field_3d AND parametric/PCPL both support SET_TIME_FREEZE
    // sim-time pinning (parametric since commit 2435706 — deterministic clock reset
    // + fixed-step catch-up), which each declares via window.__PM_supportsTimePin.
    // Gate on that explicit capability flag, NOT on the presence of PM_simTimeMs: a
    // renderer could expose a wall-clock PM_simTimeMs without a freeze handler, and a
    // type-check alone would wrongly take the pinned path and burn a full poll cap on
    // every frame (~5s/frame). Anything that does not declare the flag keeps the
    // legacy free-run path.
    let pinnable = false;
    const probeFrame = getFrame(page, 'panel_a');
    if (probeFrame) {
        try {
            pinnable = await probeFrame.evaluate(() => {
                const w = window as unknown as { __PM_supportsTimePin?: boolean };
                return w.__PM_supportsTimePin === true;
            });
        } catch {
            pinnable = false;
        }
    }

    if (!pinnable) {
        // Legacy wall-clock free-run (PCPL / any renderer without a sim-clock).
        const start = Date.now();
        for (let i = 0; i < frameCount; i++) {
            const targetMs = start + i * intervalMs;
            const wait = Math.max(0, targetMs - Date.now());
            if (wait > 0) await page.waitForTimeout(wait);
            const png = await captureIframe(page, 'panel_a');
            frames.push(png.toString('base64'));
            captureTimes.push(Date.now() - start);
        }
        return { state_id: stateId, frames_b64: frames, capture_times_ms: captureTimes };
    }

    // field_3d: sim-time-pinned dense capture. Reset ONCE for a clean state-local
    // t=0 + empty trail; never reset between frames (that would wipe the trail the
    // crawl is accumulating). REPLAY_ANIMATIONS paired with the reset (engine_bug_queue
    // dipole_replay_animations_scenario_type_gap, 2026-07-08) so one-shot rotation
    // timers RESET_TRAJECTORY alone doesn't rebase (e.g. the dipole engine's
    // rotation_start_time) don't leave the dense series' own "t=0" reading mid-motion.
    await postToPanels(page, { type: 'RESET_TRAJECTORY' }, false);
    await postToPanels(page, { type: 'REPLAY_ANIMATIONS' }, false);
    for (let i = 0; i < frameCount; i++) {
        // Pin to the frame's sim-time. max(1, …) avoids at_ms=0, which the
        // renderer's SET_TIME_FREEZE handler maps to its 1500ms default.
        const targetMs = Math.max(1, i * intervalMs);
        await postToPanels(page, { type: 'SET_TIME_FREEZE', at_ms: targetMs }, false);
        const poll = await pollSimTimeReached(page, 'panel_a', targetMs, {
            wallCapMs: intervalMs * 3 + 2000,
        });
        const png = await captureIframe(page, 'panel_a');
        frames.push(png.toString('base64'));
        // Honest sim-time: the pinned target when reached, else how far it got.
        captureTimes.push(poll.reached ? i * intervalMs : Math.round(poll.lastSimMs));
    }
    // Hand a live clock back to the downstream math-replay / next state.
    await postToPanels(page, { type: 'SET_TIME_FREEZE', frozen: false }, false);
    await postToPanels(page, { type: 'RESET_TRAJECTORY' }, false);
    await postToPanels(page, { type: 'REPLAY_ANIMATIONS' }, false);
    return { state_id: stateId, frames_b64: frames, capture_times_ms: captureTimes };
}

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

    // Date.now() on BOTH sides: the post happens in the wrapper window, the
    // receipt is recorded in the iframe probe — performance.now() timeOrigins
    // differ between frames, so wall clock is the only valid shared clock.
    const aPostTs = await page.evaluate(() => {
        const t0 = Date.now();
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
        const t0 = Date.now();
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
