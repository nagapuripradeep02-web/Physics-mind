/**
 * THE CALCULATOR — turning a concept's declared physics into assertions, and
 * resolving the scope each state evaluates them in.
 *
 * Measured across the 146-concept fleet:
 *   computed_outputs   586 declared · 555 normalize · 429 evaluate  (73%)
 *   variables[].derived 345 declared · 257 normalize · 163 evaluate (47%)
 * Everything that does not evaluate becomes a reported SKIP, never a guess.
 */
import { buildDefaultVars } from '@/lib/validators/formulaScope';
import { evaluateExpr, normalizeComputedOutput, normalizeDerived } from './exprEval';
import type { Reading } from './readoutHarvest';

export type AssertionSource = 'computed_outputs' | 'derived' | 'authored';

export interface Assertion {
    /** Name as declared, e.g. "Q_nC" or "C". */
    declaredName: string;
    /** Symbol expected on screen, e.g. "Q" — the declared name minus a unit suffix. */
    symbol: string;
    /** Unit implied by a name suffix ("Q_nC" → "nC"), else the declared `unit`. */
    expectedUnit: string;
    expr: string;
    source: AssertionSource;
    tolPct: number;
    /** Authored assertions may pin one state; otherwise every state. */
    stateId?: string;
}

export interface SkippedAssertion {
    declaredName: string;
    source: AssertionSource;
    reason: string;
}

/** SI prefixes that appear on PhysicsMind readouts. `u` and `µ`/`μ` all mean micro. */
const SI_PREFIX: Record<string, number> = {
    T: 1e12, G: 1e9, M: 1e6, k: 1e3,
    d: 1e-1, c: 1e-2, m: 1e-3,
    u: 1e-6, 'µ': 1e-6, 'μ': 1e-6,
    n: 1e-9, p: 1e-12, f: 1e-15,
};

/** Unit tokens that can be spelled into a declared NAME, e.g. `Q_nC`, `d_mm`, `E_display_Vpm`. */
const NAME_UNIT_SUFFIX = /_(([TGMkdcmunpfµμ]?)(?:[A-Za-z]{1,3}\d?|Vpm|per_[A-Za-z]+|[A-Za-z]+_per_[A-Za-z0-9^]+))$/;

/**
 * Split a declared output name into the symbol a teacher sees and the unit the
 * name encodes. `Q_nC` → {Q, nC}; `ratio_nC_per_V` → {ratio, nC per V}; `C` → {C, ''}.
 */
export function splitNameUnit(name: string): { symbol: string; unit: string } {
    const m = NAME_UNIT_SUFFIX.exec(name);
    if (!m) return { symbol: name, unit: '' };
    const symbol = name.slice(0, m.index);
    if (symbol === '') return { symbol: name, unit: '' };
    return { symbol, unit: m[1].replace(/_per_/g, '/').replace(/_/g, ' ') };
}

function normalizeUnit(u: string): string {
    return u
        .replace(/Ω/g, 'Ω')          // OHM SIGN → GREEK CAPITAL OMEGA
        .replace(/µ/g, 'μ')          // MICRO SIGN → GREEK SMALL MU
        .replace(/\s+/g, '')
        .replace(/·/g, '.')               // middot → dot
        .trim();
}

/**
 * Factor converting a value expressed in `declared` into one expressed in
 * `displayed`, or null when the two units are not the same quantity.
 * `F` → `pF` gives 1e12.
 */
export function unitScale(declared: string, displayed: string): number | null {
    const d = normalizeUnit(declared);
    const s = normalizeUnit(displayed);
    if (d === s) return 1;
    if (d === '' || s === '') return null;
    // displayed carries a prefix the declared unit lacks: F → pF
    if (s.length === d.length + 1 && s.slice(1) === d) {
        const f = SI_PREFIX[s[0]];
        if (f) return 1 / f;
    }
    // declared carries the prefix instead: mm → m
    if (d.length === s.length + 1 && d.slice(1) === s) {
        const f = SI_PREFIX[d[0]];
        if (f) return f;
    }
    return null;
}

interface VariableSpec {
    unit?: string;
    min?: number;
    max?: number;
    default?: number;
    constant?: number;
    derived?: string;
}

export function variableSpecs(json: Record<string, unknown>): Record<string, VariableSpec> {
    const pec = json.physics_engine_config as Record<string, unknown> | undefined;
    const vars = pec?.variables;
    if (!vars || typeof vars !== 'object') return {};
    return vars as Record<string, VariableSpec>;
}

/**
 * The symbols a reading is allowed to carry: every declared variable plus every
 * computed_output's display symbol.
 *
 * Parametric and particle_field sims paint NARRATION on the canvas, and prose
 * containing an "=" parses as a reading — `vector_head_to_tail` yielded
 * `Path=7 m`, `Exactly=5 m`, `16=25`, `STATE=3`. Restricting to symbols the
 * concept actually declares removes that noise deterministically instead of
 * blacklisting English words.
 */
export function symbolsOfInterest(json: Record<string, unknown>): Set<string> {
    const out = new Set<string>(Object.keys(variableSpecs(json)));
    const pec = json.physics_engine_config as Record<string, unknown> | undefined;
    for (const name of Object.keys((pec?.computed_outputs as Record<string, unknown>) ?? {})) {
        out.add(name);
        out.add(splitNameUnit(name).symbol);
    }
    return out;
}

/** Which renderer config block holds the per-state overrides. */
function rendererStates(json: Record<string, unknown>): Record<string, unknown> | null {
    for (const key of ['field_3d_config', 'particle_field_config', 'parametric_config']) {
        const cfg = json[key] as Record<string, unknown> | undefined;
        const states = cfg?.states;
        if (states && typeof states === 'object') return states as Record<string, unknown>;
    }
    return null;
}

/**
 * Numeric overrides a state authored for declared variables.
 *
 * Per-state values live nested inside the scenario block
 * (`field_3d_config.states.STATE_4.capacitance.d = 0.001`), so this walks the
 * state object breadth-first and takes the SHALLOWEST numeric leaf whose key is
 * a declared variable name. Keys that are not declared variables (`a_from`,
 * `at_ms`, `mode`) are ignored.
 */
export function stateOverrides(
    json: Record<string, unknown>,
    stateId: string,
): Record<string, number> {
    const out: Record<string, number> = {};
    const states = rendererStates(json);
    const state = states?.[stateId];
    if (!state || typeof state !== 'object') return out;
    const declared = new Set(Object.keys(variableSpecs(json)));

    const queue: unknown[] = [state];
    let depth = 0;
    while (queue.length > 0 && depth < 6) {
        const next: unknown[] = [];
        for (const node of queue) {
            if (!node || typeof node !== 'object' || Array.isArray(node)) continue;
            for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
                if (typeof v === 'number' && isFinite(v) && declared.has(k) && out[k] === undefined) {
                    out[k] = v;
                } else if (v && typeof v === 'object') {
                    next.push(v);
                }
            }
        }
        queue.length = 0;
        queue.push(...next);
        depth++;
    }
    return out;
}

/**
 * Which declared variable does a slider drive?
 *
 * Tried in order of confidence: exact id/name match, then an id segment
 * (`cap_d_slider` → `d`), then the row label carrying the symbol. Ambiguity
 * yields null so callers skip rather than guess.
 */
export function sliderVariable(
    slider: { id: string; name: string; label: string },
    declared: string[],
): string | null {
    const exact = declared.find((v) => v === slider.id || v === slider.name);
    if (exact) return exact;

    const segments = slider.id.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const bySegment = declared.filter((v) => segments.includes(v.toLowerCase()));
    if (bySegment.length === 1) return bySegment[0];

    const label = slider.label.trim();
    const byLabel = declared.filter((v) => new RegExp(`(^|[\\s(])${v}([\\s)=:]|$)`).test(label));
    if (byLabel.length === 1) return byLabel[0];

    return null;
}

/**
 * A variable is INDEPENDENT if nothing DERIVES it — a slider or a constant.
 * Only a `derived` string makes a variable dependent.
 *
 * A computed_output does NOT: `d_mm = (d*1000).toFixed(1)` is a display
 * formatting of the independent `d`, not a derivation of it. Treating it as one
 * demoted `d`, so the live `cap_d_slider = 0.002` was ignored and all of
 * capacitance STATE_5 false-failed against the pre-animation `d = 0.001`.
 *
 * Circularity is still closed, because it was never the computed_outputs that
 * caused it: `C_pF` reads `C`, and `C` HAS a `derived`, so `C` stays dependent
 * and is recomputed from ε₀·A/d rather than read off the screen.
 */
function independentVars(json: Record<string, unknown>): Set<string> {
    const out = new Set<string>();
    for (const [name, spec] of Object.entries(variableSpecs(json))) {
        if (spec && typeof spec.derived === 'string') continue;
        out.add(name);
    }
    return out;
}

export interface LiveEvidence {
    sliders: { id: string; name: string; label: string; value: number; visible: boolean }[];
    readings: Reading[];
}

/**
 * Where a scope value came from, in increasing order of trust.
 *
 * `declared_default` is the weak one: a slider's authored default is the value
 * BEFORE the state's animation runs, and the gate harvests AFTER it. A constant
 * cannot animate, and a painted value or a visible slider is what is on screen
 * right now — those three are trustworthy.
 */
export type Provenance = 'declared_default' | 'state_override' | 'constant' | 'slider' | 'painted' | 'computed';

export interface ScopeResult {
    values: Record<string, number>;
    provenance: Record<string, Provenance>;
}

const TRUSTED: ReadonlySet<Provenance> = new Set<Provenance>(['constant', 'slider', 'painted', 'computed']);

/**
 * Can a mismatch in this expression be blamed on the sim?
 *
 * Only if every identifier it reads resolved from live or immutable evidence. If
 * any input is a `declared_default` the state may have animated away from, a
 * mismatch cannot distinguish "stale declared input" from "wrong readout", and
 * the gate must SKIP rather than accuse.
 *
 * The treatment is deliberately ASYMMETRIC: a PASS under such inputs is still
 * strong evidence (a stale input would not have reproduced the painted number),
 * so passes are kept and only ambiguous FAILURES are downgraded.
 */
export function inputsAreTrustworthy(expr: string, scope: ScopeResult): boolean {
    for (const [name, prov] of Object.entries(scope.provenance)) {
        if (!new RegExp(`\\b${name}\\b`).test(expr)) continue;
        if (!TRUSTED.has(prov)) return false;
    }
    return true;
}

/** The identifiers in `expr` that came from an untrusted source, for the skip reason. */
export function untrustedInputs(expr: string, scope: ScopeResult): string[] {
    return Object.entries(scope.provenance)
        .filter(([name, prov]) => !TRUSTED.has(prov) && new RegExp(`\\b${name}\\b`).test(expr))
        .map(([name]) => name);
}

/**
 * The numeric scope a state's formulas evaluate in.
 *
 * INDEPENDENT variables are resolved from LIVE evidence, in increasing order of
 * authority: declared default/constant → this state's authored override → the
 * live slider position → the value the sim itself paints. DEPENDENT variables
 * are then folded in by evaluating their declared expressions, so chains close
 * (capacitance: A,d → C → Q → sigma → E).
 *
 * WHY LIVE EVIDENCE. States animate their inputs — `capacitance` STATE_4 morphs
 * the plate area 0.01 → 0.02 m², so the authored `A: 0.01` is the value BEFORE
 * the beat the gate pins at. Scoring the painted C against the pre-animation A
 * false-failed all of STATE_3/4/5/7 on the first run, while the sim was right
 * every time (ε₀·0.02/0.001 = 177.08 pF, painted 177 pF). Reading the input the
 * teacher can actually see is both correct and animation-proof.
 *
 * This keeps the gate honest: the RELATIONSHIPS still come only from the concept
 * JSON, never from the renderer. Only the inputs come from the screen.
 */
export function buildStateScope(
    json: Record<string, unknown>,
    stateId: string,
    simTimeMs: number | null,
    live?: LiveEvidence,
): ScopeResult {
    const specs = variableSpecs(json);
    const independent = independentVars(json);
    const values: Record<string, number> = {};
    const provenance: Record<string, Provenance> = {};
    const set = (k: string, v: number, p: Provenance) => { values[k] = v; provenance[k] = p; };

    for (const [name, spec] of Object.entries(specs)) {
        if (typeof spec?.constant === 'number' && isFinite(spec.constant)) set(name, spec.constant, 'constant');
        else if (typeof spec?.default === 'number' && isFinite(spec.default)) set(name, spec.default, 'declared_default');
    }
    for (const [k, v] of Object.entries(stateOverrides(json, stateId))) set(k, v, 'state_override');

    if (live) {
        const declared = Object.keys(specs);
        for (const s of live.sliders) {
            if (!s.visible || !isFinite(s.value)) continue;
            const v = sliderVariable(s, declared);
            if (v && independent.has(v)) set(v, s.value, 'slider');
        }
        // The painted value outranks the slider: a coarse integer-stepped control
        // can read 21 while the engine (and the HUD) use 21.4.
        for (const r of live.readings) {
            if (!independent.has(r.symbol)) continue;
            const declaredUnit = specs[r.symbol]?.unit ?? '';
            const scale = declaredUnit && r.unitToken ? unitScale(declaredUnit, r.unitToken) : 1;
            if (scale === null) continue;
            set(r.symbol, r.value / scale, 'painted');
        }
    }

    const tMs = typeof simTimeMs === 'number' && isFinite(simTimeMs) ? simTimeMs : 0;
    if (values.t === undefined) set('t', tMs / 1000, 'painted');      // formulas use seconds
    if (values.t_ms === undefined) set('t_ms', tMs, 'painted');

    // Dependent variables are recomputed from the live independents, so a stale
    // authored default can never masquerade as the current value.
    for (const name of Object.keys(specs)) {
        if (!independent.has(name) && specs[name]?.derived) {
            delete values[name];
            delete provenance[name];
        }
    }
    for (let pass = 0; pass < 6; pass++) {
        let grew = false;
        for (const [name, spec] of Object.entries(specs)) {
            if (values[name] !== undefined) continue;
            if (!spec || typeof spec.derived !== 'string') continue;
            const n = normalizeDerived(spec.derived);
            if (!n.ok) continue;
            const e = evaluateExpr(n.expr, values);
            if (!e.ok) continue;
            // A computed value is only as trustworthy as its own inputs.
            const trusted = inputsAreTrustworthy(n.expr, { values, provenance });
            set(name, e.value, trusted ? 'computed' : 'declared_default');
            grew = true;
        }
        if (!grew) break;
    }
    return { values, provenance };
}

export interface AssertionSet {
    assertions: Assertion[];
    skipped: SkippedAssertion[];
}

/**
 * Every assertion a concept declares about itself.
 *
 * `computed_outputs` first — it is the only genuinely machine-shaped field and
 * the one the renderer independently reimplements by hand, which is what makes
 * comparing them a real test. `variables[].derived` fills the rest. An optional
 * authored `numeric_assertions` block pins cases the two cannot express.
 */
export function deriveAssertions(json: Record<string, unknown>, defaultTolPct = 1): AssertionSet {
    const assertions: Assertion[] = [];
    const skipped: SkippedAssertion[] = [];
    const pec = json.physics_engine_config as Record<string, unknown> | undefined;
    if (!pec || typeof pec !== 'object') return { assertions, skipped };

    const specs = variableSpecs(json);

    const co = pec.computed_outputs as Record<string, { formula?: string }> | undefined;
    for (const [name, spec] of Object.entries(co ?? {})) {
        if (!spec || typeof spec.formula !== 'string') continue;
        const n = normalizeComputedOutput(spec.formula);
        if (!n.ok) { skipped.push({ declaredName: name, source: 'computed_outputs', reason: n.reason }); continue; }
        const { symbol, unit } = splitNameUnit(name);
        assertions.push({
            declaredName: name,
            symbol,
            // A name-encoded unit means the formula already did the scaling.
            expectedUnit: unit || specs[symbol]?.unit || '',
            expr: n.expr,
            source: 'computed_outputs',
            tolPct: defaultTolPct,
        });
    }

    for (const [name, spec] of Object.entries(specs)) {
        if (!spec || typeof spec.derived !== 'string') continue;
        if (assertions.some((a) => a.declaredName === name)) continue;
        const n = normalizeDerived(spec.derived);
        if (!n.ok) { skipped.push({ declaredName: name, source: 'derived', reason: n.reason }); continue; }
        assertions.push({
            declaredName: name,
            symbol: name,
            expectedUnit: spec.unit ?? '',
            expr: n.expr,
            source: 'derived',
            tolPct: defaultTolPct,
        });
    }

    const authored = pec.numeric_assertions;
    if (Array.isArray(authored)) {
        for (const a of authored) {
            if (!a || typeof a !== 'object') continue;
            const spec = a as { state?: string; read?: string; expect?: string; tol_pct?: number };
            if (typeof spec.read !== 'string' || typeof spec.expect !== 'string') continue;
            const n = normalizeComputedOutput(spec.expect);
            if (!n.ok) { skipped.push({ declaredName: spec.read, source: 'authored', reason: n.reason }); continue; }
            const { symbol, unit } = splitNameUnit(spec.read);
            // An authored assertion supersedes whatever was auto-derived for the same name.
            const dup = assertions.findIndex((x) => x.declaredName === spec.read && x.stateId === spec.state);
            if (dup >= 0) assertions.splice(dup, 1);
            assertions.push({
                declaredName: spec.read,
                symbol,
                expectedUnit: unit || specs[symbol]?.unit || '',
                expr: n.expr,
                source: 'authored',
                tolPct: typeof spec.tol_pct === 'number' ? spec.tol_pct : defaultTolPct,
                stateId: spec.state,
            });
        }
    }

    return { assertions, skipped };
}

export interface Match {
    reading: Reading;
    /** Expected value converted into the units the reading displays. */
    expectedDisplayed: number;
    scale: number;
}

/**
 * Find the reading an assertion is talking about, and put the expected value
 * into the same units. Returns every unit-compatible candidate; unit mismatches
 * are returned separately so they are reported as a unit finding rather than
 * silently swallowed or miscounted as a value failure.
 */
export function matchReadings(
    a: Assertion,
    expected: number,
    readings: Reading[],
): { matches: Match[]; unitMismatches: Reading[] } {
    const matches: Match[] = [];
    const unitMismatches: Reading[] = [];
    for (const r of readings) {
        if (r.symbol !== a.symbol) continue;
        if (a.expectedUnit === '' || r.unitToken === '') {
            matches.push({ reading: r, expectedDisplayed: expected, scale: 1 });
            continue;
        }
        const scale = unitScale(a.expectedUnit, r.unitToken);
        if (scale === null) { unitMismatches.push(r); continue; }
        matches.push({ reading: r, expectedDisplayed: expected * scale, scale });
    }
    return { matches, unitMismatches };
}
