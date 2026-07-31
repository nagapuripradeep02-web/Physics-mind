/**
 * THE CALCULATOR — expression normalizer + evaluator.
 *
 * Ground truth for the numeric gate is the concept's OWN declared physics:
 *   physics_engine_config.computed_outputs[].formula   (real JS — the primary source)
 *   physics_engine_config.variables[].derived          (mixed; normalized here)
 *
 * It is never `computePhysics_<id>` or any renderer internal — those are the
 * implementation under test, and using them would make every assertion
 * vacuously true.
 *
 * WHY `new Function` AND NOT A HAND-ROLLED PARSER. The declared formulas *are*
 * JavaScript — `(C*1e12) < 100 ? (C*1e12).toFixed(1) : (C*1e12).toFixed(0)`,
 * `Math.round(Q_nC / 0.1)`. A restricted-grammar parser would reject most of the
 * corpus. This mirrors the established in-repo pattern (PM_interpolate,
 * parametric_renderer.ts:947-968; makeEvaluator, graph_interactive_renderer.ts:23-41).
 * Input is repo-owned JSON read by a local dev gate, never untrusted data.
 *
 * Nothing here throws. Every failure is a typed `{ok:false, reason}` so the gate
 * can SKIP-with-evidence, per THE EYE's fail-open doctrine (pixelGate.ts:14).
 */
import { MATH_WHITELIST } from '@/lib/renderers/animation_vocabulary';

export type NormalizeResult =
    | { ok: true; expr: string }
    | { ok: false; reason: string };

export type EvalResult =
    | { ok: true; value: number; text?: string }
    | { ok: false; reason: string };

/** English connectives that mark a `derived` string as prose rather than an expression. */
const PROSE_WORDS =
    /\b(or|and|the|when|if|per|where|from|with|for|each|this|that|than|then|is|are|be|to|of|in|on|at|as|it|its|not|via|by|so|but|any|all|only|same|about|between|versus|vs|note|see|use|used|using|assumes?|because|since|while|after|before|until|during|both|either|neither)\b/i;

/** Characters legal in an expression after normalization. Anything else = prose or Unicode math. */
const LEGAL_EXPR_CHARS = /^[A-Za-z0-9_.\s+\-*/%(),?:<>=!&|]*$/;

function stripStringLiterals(s: string): string {
    return s
        .replace(/'(?:\\'|[^'])*'/g, "''")
        .replace(/"(?:\\"|[^"])*"/g, '""')
        .replace(/`(?:\\`|[^`])*`/g, '``');
}

/**
 * Split on top-level `=` only — never on `==`, `===`, `!=`, `<=`, `>=`.
 * Parenthesis-aware so a `=` inside a call can never split (it cannot occur in
 * practice, but the guard is free).
 */
function splitTopLevelEquals(s: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c === '(') depth++;
        else if (c === ')') depth--;
        else if (c === '=' && depth === 0) {
            const prev = s[i - 1];
            const next = s[i + 1];
            if (prev === '=' || prev === '!' || prev === '<' || prev === '>') continue;
            if (next === '=') { i++; continue; }
            parts.push(s.slice(start, i));
            start = i + 1;
        }
    }
    parts.push(s.slice(start));
    return parts.map((p) => p.trim());
}

const BARE_IDENT = /^[A-Za-z_]\w*$/;

/** Walk back from index j over one operand; returns its start index, or -1. */
function scanOperandLeft(s: string, j: number): number {
    while (j >= 0 && /\s/.test(s[j])) j--;
    if (j < 0) return -1;
    if (s[j] === ')') {
        let depth = 0;
        while (j >= 0) {
            if (s[j] === ')') depth++;
            else if (s[j] === '(') { depth--; if (depth === 0) break; }
            j--;
        }
        if (j < 0) return -1;
        j--; // step before '('
        // absorb a function name / member chain: Math.pow(...), sqrt(...)
        while (j >= 0 && /[A-Za-z0-9_.]/.test(s[j])) j--;
        return j + 1;
    }
    if (!/[A-Za-z0-9_.]/.test(s[j])) return -1;
    while (j >= 0 && /[A-Za-z0-9_.]/.test(s[j])) j--;
    return j + 1;
}

/** Walk forward from index j over one operand; returns its end index (exclusive), or -1. */
function scanOperandRight(s: string, j: number): number {
    while (j < s.length && /\s/.test(s[j])) j++;
    if (j >= s.length) return -1;
    if (s[j] === '-' || s[j] === '+') j++;          // unary sign: 2^-1
    while (j < s.length && /\s/.test(s[j])) j++;
    if (s[j] === '(') {
        let depth = 0;
        while (j < s.length) {
            if (s[j] === '(') depth++;
            else if (s[j] === ')') { depth--; if (depth === 0) { j++; break; } }
            j++;
        }
        return j;
    }
    if (!/[A-Za-z0-9_.]/.test(s[j])) return -1;
    while (j < s.length && /[A-Za-z0-9_.]/.test(s[j])) j++;
    if (s[j] === '(') {                              // a call: sqrt(x)^2
        let depth = 0;
        while (j < s.length) {
            if (s[j] === '(') depth++;
            else if (s[j] === ')') { depth--; if (depth === 0) { j++; break; } }
            j++;
        }
    }
    return j;
}

/**
 * `^` is XOR in JavaScript but exponentiation in every authored formula
 * (`sqrt(R^2 + X^2)`, `n*e^2*rho`). Rewrite to Math.pow before evaluating.
 */
export function rewriteCaret(src: string): string {
    let s = src;
    for (let guard = 0; s.includes('^') && guard < 64; guard++) {
        const i = s.indexOf('^');
        const left = scanOperandLeft(s, i - 1);
        const right = scanOperandRight(s, i + 1);
        if (left < 0 || right < 0) return s;   // malformed; the charset check will reject it
        s = `${s.slice(0, left)}Math.pow(${s.slice(left, i).trim()},${s.slice(i + 1, right).trim()})${s.slice(right)}`;
    }
    return s;
}

/**
 * Turn an authored `variables[].derived` string into a bare evaluable expression.
 *
 * Handles the four shapes that occur in live data:
 *   "epsilon0 * A / d"                   → as-is (bare RHS)
 *   "Z = sqrt(R^2 + X^2)"                → LHS stripped, ^ rewritten
 *   "X_L = X_L = omega*L = 2*PI*f_demo*L"→ redundant LHS + alternatives, first RHS wins
 *   "V/R (ohmic) or V/R_eff (non-ohmic)" → rejected as prose, never guessed
 */
export function normalizeDerived(raw: string): NormalizeResult {
    if (typeof raw !== 'string' || raw.trim() === '') return { ok: false, reason: 'empty' };
    let s = raw.trim();

    // A bracketed authoring note ("[t = time since STATE ENTRY, ...]") is prose.
    if (/[[\]{}]/.test(s)) return { ok: false, reason: 'contains a bracketed note' };

    const segments = splitTopLevelEquals(s);
    if (segments.length > 1) {
        // Drop leading bare-identifier segments (the redundant LHS chain), then
        // take the FIRST real expression — later ones are restatements.
        const meaningful = segments.filter((seg, i) => !(i < segments.length - 1 && BARE_IDENT.test(seg)));
        s = (meaningful[0] ?? segments[segments.length - 1]).trim();
    }
    if (s === '') return { ok: false, reason: 'empty after normalization' };

    const codeOnly = stripStringLiterals(s);
    if (PROSE_WORDS.test(codeOnly)) {
        const word = codeOnly.match(PROSE_WORDS)?.[0] ?? '?';
        return { ok: false, reason: `prose (contains "${word}")` };
    }

    const rewritten = rewriteCaret(s);
    if (!LEGAL_EXPR_CHARS.test(stripStringLiterals(rewritten))) {
        return { ok: false, reason: 'contains characters that are not valid JS (Unicode math or prose)' };
    }
    if (rewritten.includes('^')) return { ok: false, reason: 'unresolvable ^ operand' };
    return { ok: true, expr: rewritten };
}

/**
 * A `computed_outputs[].formula` is already real JS; it only needs the caret
 * rewrite and the legality check.
 */
export function normalizeComputedOutput(raw: string): NormalizeResult {
    if (typeof raw !== 'string' || raw.trim() === '') return { ok: false, reason: 'empty' };
    let s = raw.trim();
    // Some computed_outputs are authored as full equations ("C = epsilon0*A/d")
    // rather than bare RHS. Without this, `new Function` reports the useless
    // "Invalid left-hand side in assignment".
    const segments = splitTopLevelEquals(s);
    if (segments.length > 1) {
        const meaningful = segments.filter((seg, i) => !(i < segments.length - 1 && BARE_IDENT.test(seg)));
        s = (meaningful[0] ?? segments[segments.length - 1]).trim();
    }
    if (s === '') return { ok: false, reason: 'empty after normalization' };
    const rewritten = rewriteCaret(s);
    if (!LEGAL_EXPR_CHARS.test(stripStringLiterals(rewritten))) {
        return { ok: false, reason: 'contains characters that are not valid JS (Unicode math or prose)' };
    }
    if (rewritten.includes('^')) return { ok: false, reason: 'unresolvable ^ operand' };
    return { ok: true, expr: rewritten };
}

/**
 * The bare math names formulas use unqualified (`sqrt(x)`, `PI`), plus `Math`
 * itself for the qualified form, plus `radians`/`degrees` which appear in
 * authored `derived` strings but are not JS built-ins.
 *
 * Concept variables are spread AFTER this, so a concept that declares `E` as
 * electric field shadows `Math.E` — the physics always wins.
 */
export function mathScope(): Record<string, unknown> {
    const scope: Record<string, unknown> = { Math };
    for (const name of MATH_WHITELIST) {
        const v = (Math as unknown as Record<string, unknown>)[name];
        if (v !== undefined) scope[name] = v;
    }
    scope.radians = (deg: number) => (deg * Math.PI) / 180;
    scope.degrees = (rad: number) => (rad * 180) / Math.PI;
    return scope;
}

const paramNameCache = new Map<string, boolean>();

/**
 * Is `name` legal as a function-parameter name?
 *
 * `combination_of_resistors` declares a variable literally called `switch`.
 * A reserved word in the parameter list makes `new Function` throw a SYNTAX
 * error, which would kill EVERY assertion for that concept, not just the one
 * touching `switch`. Such a name is unreferenceable from a JS expression
 * anyway, so dropping it costs nothing and contains the blast radius.
 */
function isUsableParamName(name: string): boolean {
    const hit = paramNameCache.get(name);
    if (hit !== undefined) return hit;
    let ok = /^[A-Za-z_$][\w$]*$/.test(name);
    if (ok) {
        try { new Function(name, 'return 0;'); } catch { ok = false; }
    }
    paramNameCache.set(name, ok);
    return ok;
}

/**
 * Evaluate a normalized expression against a numeric scope.
 *
 * `.toFixed()` returns a STRING, and many computed_outputs end in one — a
 * numeric string is a success, and its text is returned so the caller can take
 * the declared decimal count for rounding tolerance.
 */
export function evaluateExpr(expr: string, vars: Record<string, number>): EvalResult {
    const scope: Record<string, unknown> = { ...mathScope(), ...vars };
    const keys = Object.keys(scope).filter(isUsableParamName);
    let raw: unknown;
    try {
        const fn = new Function(...keys, `"use strict"; return (${expr});`);
        raw = fn(...keys.map((k) => scope[k]));
    } catch (err: unknown) {
        return { ok: false, reason: err instanceof Error ? err.message : String(err) };
    }
    if (typeof raw === 'number') {
        if (!isFinite(raw)) return { ok: false, reason: `evaluated to ${String(raw)}` };
        return { ok: true, value: raw };
    }
    if (typeof raw === 'string') {
        const n = Number(raw);
        if (raw.trim() !== '' && isFinite(n)) return { ok: true, value: n, text: raw };
        return { ok: false, reason: `evaluated to a non-numeric string "${raw.slice(0, 40)}"` };
    }
    return { ok: false, reason: `evaluated to ${typeof raw}, not a number` };
}
