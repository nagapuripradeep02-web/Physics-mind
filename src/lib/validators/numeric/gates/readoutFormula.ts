/**
 * N1 — readout matches formula.
 *
 * The painted number vs the value obtained by evaluating the concept's OWN
 * declared expression in this state's scope. Never the renderer's arithmetic:
 * `computePhysics_<id>` and `capC()` are the implementation under test.
 */
import { evaluateExpr } from '../exprEval';
import { toleranceFor } from '../readoutHarvest';
import {
    buildStateScope,
    deriveAssertions,
    inputsAreTrustworthy,
    matchReadings,
    untrustedInputs,
    type Assertion,
} from '../deriveAssertions';
import type { ProbeResult } from '../probeHarness';
import { mkResult, mkSkip, type NumericGateResult, type NumericCheckResult } from '../spec';

function fmt(n: number): string {
    if (n !== 0 && (Math.abs(n) < 1e-3 || Math.abs(n) >= 1e6)) return n.toExponential(4);
    return String(Number(n.toPrecision(8)));
}

function appliesTo(a: Assertion, stateId: string): boolean {
    return a.stateId === undefined || a.stateId === stateId;
}

export function runReadoutFormulaGate(probe: ProbeResult): NumericGateResult {
    const started = Date.now();
    const out: NumericCheckResult[] = [];
    const { assertions, skipped } = deriveAssertions(probe.json);

    for (const s of probe.states) {
        // A state that paints no numbers is NOT a defect — the sim is a silent
        // visual (Rule 24) and plenty of guided states are purely pictorial. This
        // is a coverage statement, so zero readings is a reported SKIP.
        out.push(
            s.readings.length > 0
                ? mkResult('N0_readings_present', s.stateId, true,
                    `${s.readings.length} reading(s) harvested `
                    + `(${s.readings.slice(0, 6).map((r) => `${r.symbol}=${r.value}${r.unitToken ? ' ' + r.unitToken : ''}`).join(', ')}`
                    + `${s.readings.length > 6 ? ', …' : ''})`)
                : mkSkip('N0_readings_present', s.stateId,
                    'state paints no declared symbol — nothing numeric to verify here'),
        );

        const scope = buildStateScope(probe.json, s.stateId, s.simTimeMs,
            { sliders: s.sliders, readings: s.readings });
        const applicable = assertions.filter((a) => appliesTo(a, s.stateId));

        for (const a of applicable) {
            const ev = evaluateExpr(a.expr, scope.values);
            if (!ev.ok) {
                out.push(mkSkip('N1_readout_matches_formula', s.stateId,
                    `${a.declaredName} (${a.source}): expression "${a.expr}" did not evaluate — ${ev.reason}`));
                continue;
            }

            const { matches, unitMismatches } = matchReadings(a, ev.value, s.readings);

            if (matches.length === 0) {
                if (unitMismatches.length > 0) {
                    const r = unitMismatches[0];
                    out.push(mkResult('N1_readout_unit_matches', s.stateId, false,
                        `${a.declaredName} is declared in "${a.expectedUnit}" but painted as `
                        + `"${r.raw}" (unit "${r.unitToken}") at ${r.where} — not a recognised `
                        + `SI-prefixed form of the declared unit`));
                } else {
                    out.push(mkSkip('N1_readout_matches_formula', s.stateId,
                        `${a.declaredName} (${a.source}) evaluates to ${fmt(ev.value)} but symbol `
                        + `"${a.symbol}" is not painted in this state`));
                }
                continue;
            }

            for (const m of matches) {
                const r = m.reading;
                const tol = toleranceFor(m.expectedDisplayed, r.decimals, a.tolPct);
                const delta = Math.abs(r.value - m.expectedDisplayed);
                const scaleNote = m.scale === 1 ? '' : ` (declared unit ${a.expectedUnit}, ×${fmt(m.scale)})`;
                if (delta <= tol) {
                    out.push(mkResult('N1_readout_matches_formula', s.stateId, true,
                        `${a.symbol}: painted ${r.value}${r.unitToken ? ' ' + r.unitToken : ''} `
                        + `= ${a.declaredName} "${a.expr}" → ${fmt(m.expectedDisplayed)} `
                        + `(|Δ| ${fmt(delta)} ≤ tol ${fmt(tol)}) at ${r.where}${scaleNote}`));
                } else if (!inputsAreTrustworthy(a.expr, scope)) {
                    // Ambiguous: the mismatch could equally be a stale declared
                    // input this state animated away from. Cannot accuse the sim.
                    out.push(mkSkip('N1_readout_matches_formula', s.stateId,
                        `${a.symbol} painted ${r.value} vs ${fmt(m.expectedDisplayed)} from `
                        + `"${a.declaredName} = ${a.expr}", but input(s) `
                        + `${untrustedInputs(a.expr, scope).join(', ')} came only from a declared default `
                        + `that this state may have animated away from — cannot tell a stale declaration `
                        + `from a wrong readout`));
                } else {
                    out.push(mkResult('N1_readout_matches_formula', s.stateId, false,
                        `${a.symbol} painted as ${r.value}${r.unitToken ? ' ' + r.unitToken : ''} at ${r.where}, `
                        + `but the concept's own ${a.source} "${a.declaredName} = ${a.expr}" gives `
                        + `${fmt(m.expectedDisplayed)}${scaleNote} — |Δ| ${fmt(delta)} exceeds tol ${fmt(tol)}. `
                        + `Scope: ${Object.entries(scope.values)
                            .filter(([k]) => new RegExp(`\\b${k}\\b`).test(a.expr))
                            .map(([k, v]) => `${k}=${fmt(v)} (${scope.provenance[k]})`).join(', ') || '(none matched)'}. `
                        + `Raw: "${r.raw}"`));
                }
                if (r.unitToken && a.expectedUnit && m.scale !== 1) {
                    // A prefixed unit is legitimate; record it as a pass so the
                    // unit check is not silently absent from the report.
                    out.push(mkResult('N1_readout_unit_matches', s.stateId, true,
                        `${a.symbol}: painted "${r.unitToken}" is an SI-prefixed form of the declared "${a.expectedUnit}"`));
                }
            }
        }
    }

    for (const sk of skipped) {
        out.push(mkSkip('N1_readout_matches_formula', 'ALL_STATES',
            `${sk.declaredName} (${sk.source}) is not machine-checkable — ${sk.reason}`));
    }

    return { check_results: out, cost_usd: 0, duration_ms: Date.now() - started };
}
