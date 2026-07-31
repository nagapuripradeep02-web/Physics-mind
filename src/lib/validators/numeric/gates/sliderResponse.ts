/**
 * N3 — slider-response direction.
 *
 * Two assertions per swept slider:
 *   (a) it MOVES a readout that the declared physics says depends on it — the
 *       dead-slider class;
 *   (b) it moves it in the physically correct DIRECTION, judged by evaluating
 *       the concept's own expression at the same two slider values.
 *
 * (a) is only asserted where a dependency actually exists, so a purely visual
 * control (a camera angle, a zoom) is skipped rather than failed. (b) needs the
 * slider→variable mapping; where that is ambiguous it skips and says so.
 *
 * Sliders are driven with Playwright's real `fill()`, so the events are TRUSTED
 * and a renderer using the drag-seize pattern still responds.
 */
import { evaluateExpr } from '../exprEval';
import { toleranceFor, type Reading } from '../readoutHarvest';
import {
    buildStateScope,
    deriveAssertions,
    matchReadings,
    sliderVariable,
    variableSpecs,
} from '../deriveAssertions';
import type { ProbeResult, SliderSweep } from '../probeHarness';
import { mkResult, mkSkip, type NumericGateResult, type NumericCheckResult } from '../spec';

function fmt(n: number): string {
    if (n !== 0 && (Math.abs(n) < 1e-3 || Math.abs(n) >= 1e6)) return n.toExponential(4);
    return String(Number(n.toPrecision(8)));
}

function readingFor(readings: Reading[], symbol: string): Reading | null {
    const all = readings.filter((r) => r.symbol === symbol);
    if (all.length === 0) return null;
    return all.find((r) => r.source === 'dom') ?? all[0];
}

export function runSliderResponseGate(probe: ProbeResult): NumericGateResult {
    const started = Date.now();
    const out: NumericCheckResult[] = [];
    const { assertions } = deriveAssertions(probe.json);
    const declared = Object.keys(variableSpecs(probe.json));

    if (probe.sweeps.length === 0) {
        out.push(mkSkip('N3_slider_moves_readout', 'ALL_STATES',
            'no visible input[type=range] was swept (either none exist or sweeps were disabled)'));
        return { check_results: out, cost_usd: 0, duration_ms: Date.now() - started };
    }

    for (const sw of probe.sweeps) {
        const label = `${sw.slider.id || sw.slider.name || '(unnamed)'}`;
        const varName = sliderVariable(sw.slider, declared);
        const state = probe.states.find((s) => s.stateId === sw.stateId);

        // ── (a) does anything the physics depends on actually move? ───────────
        if (!varName) {
            out.push(mkSkip('N3_slider_moves_readout', sw.stateId,
                `slider "${label}" could not be mapped to a declared variable (label "${sw.slider.label}")`));
        } else {
            const dependents = assertions.filter((a) =>
                new RegExp(`\\b${varName}\\b`).test(a.expr)
                && (a.stateId === undefined || a.stateId === sw.stateId));
            if (dependents.length === 0) {
                out.push(mkSkip('N3_slider_moves_readout', sw.stateId,
                    `no declared expression depends on "${varName}", so this slider is not expected `
                    + `to change any number`));
            } else {
                const paintedDependents = dependents
                    .map((a) => a.symbol)
                    .filter((sym) => readingFor(sw.lowReadings, sym) !== null);
                if (paintedDependents.length === 0) {
                    out.push(mkSkip('N3_slider_moves_readout', sw.stateId,
                        `"${varName}" drives ${dependents.map((d) => d.declaredName).join(', ')}, `
                        + `but none of those symbols is painted in this state`));
                } else {
                    const moved = paintedDependents.filter((sym) => {
                        const lo = readingFor(sw.lowReadings, sym);
                        const hi = readingFor(sw.highReadings, sym);
                        return lo && hi && lo.value !== hi.value;
                    });
                    out.push(moved.length > 0
                        ? mkResult('N3_slider_moves_readout', sw.stateId, true,
                            `"${label}" (${varName}) ${fmt(sw.lowValue)} → ${fmt(sw.highValue)} moved `
                            + `${moved.join(', ')}`)
                        : mkResult('N3_slider_moves_readout', sw.stateId, false,
                            `"${label}" maps to "${varName}", which the declared physics says drives `
                            + `${paintedDependents.join(', ')} — but dragging it ${fmt(sw.lowValue)} → `
                            + `${fmt(sw.highValue)} left every one of those painted numbers unchanged `
                            + `(${paintedDependents.map((sym) => `${sym}=${readingFor(sw.lowReadings, sym)?.value}`).join(', ')}). `
                            + `The control is dead.`));
                }
            }
        }

        // ── (b) direction ────────────────────────────────────────────────────
        if (!varName || !state) {
            out.push(mkSkip('N3_slider_direction', sw.stateId,
                `slider "${label}": ${!varName ? 'no variable mapping' : 'state harvest missing'}`));
            continue;
        }
        // Scope from the LOW sample's live evidence, so co-animated inputs are
        // current; the swept variable itself is then overridden per sample below.
        const baseScope = buildStateScope(probe.json, sw.stateId, state.simTimeMs,
            { sliders: state.sliders, readings: sw.lowReadings });
        const applicable = assertions.filter((a) =>
            new RegExp(`\\b${varName}\\b`).test(a.expr)
            && (a.stateId === undefined || a.stateId === sw.stateId));
        if (applicable.length === 0) {
            out.push(mkSkip('N3_slider_direction', sw.stateId,
                `no declared expression depends on "${varName}"`));
            continue;
        }

        let asserted = 0;
        for (const a of applicable) {
            const lo = readingFor(sw.lowReadings, a.symbol);
            const hi = readingFor(sw.highReadings, a.symbol);
            if (!lo || !hi) continue;

            const evLo = evaluateExpr(a.expr, { ...baseScope.values, [varName]: sw.lowValue });
            const evHi = evaluateExpr(a.expr, { ...baseScope.values, [varName]: sw.highValue });
            if (!evLo.ok || !evHi.ok) continue;

            const mLo = matchReadings(a, evLo.value, [lo]).matches[0];
            const mHi = matchReadings(a, evHi.value, [hi]).matches[0];
            if (!mLo || !mHi) continue;

            const expectedDelta = mHi.expectedDisplayed - mLo.expectedDisplayed;
            const actualDelta = hi.value - lo.value;
            // Only assert direction where the predicted move is resolvable on screen.
            const tol = toleranceFor(mHi.expectedDisplayed, hi.decimals, a.tolPct);
            if (Math.abs(expectedDelta) <= tol) continue;

            asserted++;
            const same = Math.sign(expectedDelta) === Math.sign(actualDelta);
            const dir = (d: number) => (d > 0 ? 'rose' : d < 0 ? 'fell' : 'did not move');
            out.push(same
                ? mkResult('N3_slider_direction', sw.stateId, true,
                    `${varName} ${fmt(sw.lowValue)} → ${fmt(sw.highValue)}: ${a.symbol} ${dir(actualDelta)} `
                    + `${lo.value} → ${hi.value}, matching "${a.declaredName} = ${a.expr}" `
                    + `(${fmt(mLo.expectedDisplayed)} → ${fmt(mHi.expectedDisplayed)})`)
                : mkResult('N3_slider_direction', sw.stateId, false,
                    `${varName} ${fmt(sw.lowValue)} → ${fmt(sw.highValue)}: ${a.symbol} ${dir(actualDelta)} `
                    + `${lo.value} → ${hi.value}, but the concept's own "${a.declaredName} = ${a.expr}" `
                    + `says it should have ${dir(expectedDelta)} `
                    + `(${fmt(mLo.expectedDisplayed)} → ${fmt(mHi.expectedDisplayed)}) — wrong direction`));
        }
        if (asserted === 0) {
            out.push(mkSkip('N3_slider_direction', sw.stateId,
                `"${label}" (${varName}): no dependent symbol was both painted and predicted to move `
                + `more than the display can resolve`));
        }
    }

    return { check_results: out, cost_usd: 0, duration_ms: Date.now() - started };
}
