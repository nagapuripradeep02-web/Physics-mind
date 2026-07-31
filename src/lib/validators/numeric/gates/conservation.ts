/**
 * N2 — conservation, as readout-to-readout consistency.
 *
 * Every check here relates PAINTED numbers to other PAINTED numbers. No model is
 * involved, so these bite even where a concept delegates its physics to the
 * renderer and declares nothing machine-checkable (ohms_law, resistivity).
 *
 * That is deliberate. A rate tolerance can be argued with; a bookkeeping
 * identity cannot (check_gas_reaction_physics.ts:24-27).
 */
import { toleranceFor, type Reading } from '../readoutHarvest';
import { deriveAssertions, unitScale, variableSpecs } from '../deriveAssertions';
import type { ProbeResult, StateHarvest } from '../probeHarness';
import { mkResult, mkSkip, type NumericGateResult, type NumericCheckResult } from '../spec';

function fmt(n: number): string {
    if (n !== 0 && (Math.abs(n) < 1e-3 || Math.abs(n) >= 1e6)) return n.toExponential(4);
    return String(Number(n.toPrecision(8)));
}

/** A pure sum/difference of identifiers: "I1 + I2", "R1 + R2 + R3", "V_a - V_b". */
const PURE_SUM = /^\s*[A-Za-z_]\w*(\s*[+-]\s*[A-Za-z_]\w*)+\s*$/;

function sumTerms(expr: string): { sign: 1 | -1; name: string }[] {
    const terms: { sign: 1 | -1; name: string }[] = [];
    const re = /([+-]?)\s*([A-Za-z_]\w*)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(expr)) !== null) {
        terms.push({ sign: m[1] === '-' ? -1 : 1, name: m[2] });
    }
    return terms;
}

/** Prefer a DOM reading over a canvas one when the same symbol appears twice. */
function pick(readings: Reading[], symbol: string): Reading | null {
    const all = readings.filter((r) => r.symbol === symbol);
    if (all.length === 0) return null;
    return all.find((r) => r.source === 'dom') ?? all[0];
}

function checkSumIdentities(probe: ProbeResult, s: StateHarvest, out: NumericCheckResult[]): void {
    const { assertions } = deriveAssertions(probe.json);
    for (const a of assertions) {
        if (!PURE_SUM.test(a.expr)) continue;
        const total = pick(s.readings, a.symbol);
        if (!total) continue;
        const terms = sumTerms(a.expr);
        const parts = terms.map((t) => ({ ...t, reading: pick(s.readings, t.name) }));
        if (parts.some((p) => !p.reading)) {
            out.push(mkSkip('N2_sum_identity', s.stateId,
                `${a.symbol} = ${a.expr}: part(s) `
                + `${parts.filter((p) => !p.reading).map((p) => p.name).join(', ')} not painted in this state`));
            continue;
        }
        const units = new Set([total.unitToken, ...parts.map((p) => p.reading!.unitToken)]);
        if (units.size > 1) {
            out.push(mkSkip('N2_sum_identity', s.stateId,
                `${a.symbol} = ${a.expr}: painted parts use mixed units (${[...units].join(', ')})`));
            continue;
        }
        const sum = parts.reduce((acc, p) => acc + p.sign * p.reading!.value, 0);
        const tol = toleranceFor(sum, Math.max(total.decimals, ...parts.map((p) => p.reading!.decimals)), 1);
        const delta = Math.abs(total.value - sum);
        const shown = parts.map((p) => `${p.sign < 0 ? '−' : ''}${p.name}=${p.reading!.value}`).join(' + ');
        out.push(delta <= tol
            ? mkResult('N2_sum_identity', s.stateId, true,
                `${a.symbol}=${total.value} equals its painted parts (${shown}) → ${fmt(sum)} (|Δ| ${fmt(delta)} ≤ ${fmt(tol)})`)
            : mkResult('N2_sum_identity', s.stateId, false,
                `${a.symbol} is painted as ${total.value} but its own painted parts sum to ${fmt(sum)} `
                + `(${shown}) — |Δ| ${fmt(delta)} exceeds tol ${fmt(tol)}. Both numbers are on screen at once.`));
    }
}

/** Symbols a state paints for voltage / current / resistance, in base units. */
function ohmTriple(s: StateHarvest): { v: Reading; i: Reading; r: Reading } | null {
    const find = (syms: string[], unit: string): Reading | null => {
        for (const r of s.readings) {
            if (!syms.includes(r.symbol)) continue;
            if (unitScale(unit, r.unitToken) !== 1) continue;   // base units only — no mV/mA/kΩ mixing
            return r;
        }
        return null;
    };
    const v = find(['V', 'v', 'U', 'emf', 'ε'], 'V');
    const i = find(['I', 'i'], 'A');
    const r = find(['R', 'r', 'R_eq', 'R_eff'], 'Ω');
    if (!v || !i || !r) return null;
    return { v, i, r };
}

function checkOhmClosure(s: StateHarvest, out: NumericCheckResult[]): void {
    const t = ohmTriple(s);
    if (!t) {
        out.push(mkSkip('N2_ohm_closure', s.stateId, 'state does not paint V, I and R together in base units'));
        return;
    }
    const expected = t.i.value * t.r.value;
    const tol = toleranceFor(expected, t.v.decimals, 2);   // 2%: three independently rounded displays compound
    const delta = Math.abs(t.v.value - expected);
    const shown = `V=${t.v.value} · I=${t.i.value} · R=${t.r.value}`;
    out.push(delta <= tol
        ? mkResult('N2_ohm_closure', s.stateId, true, `${shown} → I·R = ${fmt(expected)} (|Δ| ${fmt(delta)} ≤ ${fmt(tol)})`)
        : mkResult('N2_ohm_closure', s.stateId, false,
            `the three painted numbers do not close Ohm's law: ${shown}, so I·R = ${fmt(expected)} `
            + `but V is painted as ${t.v.value} — |Δ| ${fmt(delta)} exceeds tol ${fmt(tol)}`));
}

function checkConstantStability(probe: ProbeResult, out: NumericCheckResult[]): void {
    const specs = variableSpecs(probe.json);
    const constants = Object.entries(specs)
        .filter(([, sp]) => sp && typeof sp.constant === 'number')
        .map(([name]) => name);

    for (const name of constants) {
        const seen: { stateId: string; reading: Reading }[] = [];
        for (const s of probe.states) {
            const r = pick(s.readings, name);
            if (r) seen.push({ stateId: s.stateId, reading: r });
        }
        if (seen.length < 2) {
            out.push(mkSkip('N2_constant_stable', 'ALL_STATES',
                `${name} is declared constant but painted in ${seen.length} state(s) — nothing to compare`));
            continue;
        }
        const byUnit = new Map<string, { stateId: string; reading: Reading }[]>();
        for (const x of seen) {
            const k = x.reading.unitToken;
            if (!byUnit.has(k)) byUnit.set(k, []);
            byUnit.get(k)!.push(x);
        }
        for (const [unit, group] of byUnit) {
            if (group.length < 2) continue;
            const first = group[0];
            const bad = group.filter((g) =>
                Math.abs(g.reading.value - first.reading.value)
                > toleranceFor(first.reading.value, Math.max(g.reading.decimals, first.reading.decimals), 1));
            const shown = group.map((g) => `${g.stateId}=${g.reading.value}`).join(', ');
            out.push(bad.length === 0
                ? mkResult('N2_constant_stable', 'ALL_STATES', true,
                    `${name}${unit ? ' (' + unit + ')' : ''} is declared constant and paints identically: ${shown}`)
                : mkResult('N2_constant_stable', 'ALL_STATES', false,
                    `${name} is declared constant (${fmt(specs[name].constant as number)}) but paints different `
                    + `values across states: ${shown} — a per-state override is leaking into a locked value`));
        }
    }
}

export function runConservationGate(probe: ProbeResult): NumericGateResult {
    const started = Date.now();
    const out: NumericCheckResult[] = [];
    for (const s of probe.states) {
        checkSumIdentities(probe, s, out);
        checkOhmClosure(s, out);
    }
    checkConstantStability(probe, out);
    return { check_results: out, cost_usd: 0, duration_ms: Date.now() - started };
}
