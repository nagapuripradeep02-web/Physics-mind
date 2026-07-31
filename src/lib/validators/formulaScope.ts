/**
 * Shared formula-scope helpers — the identifier half of every gate that reads
 * `physics_engine_config`.
 *
 * Extracted from validate-concepts.ts (Gate 4) so THE CALCULATOR
 * (src/lib/validators/numeric/*) and the concept validator resolve identifiers
 * through ONE definition. `buildDefaultVars` had already been copied into the
 * admin test pages and _verify_pcpl_time_pin.ts; this module exists so the
 * count stops growing.
 *
 * Behaviour is byte-for-byte the pre-extraction logic — validate:concepts must
 * report the same 146 PASS / 0 FAIL it did before the move.
 */
import { MATH_WHITELIST, JS_RESERVED_IDENTIFIERS } from '@/lib/renderers/animation_vocabulary';

const SIMPLE_IDENT_RE = /^\w+$/;
const IDENT_TOKEN_RE = /\b[A-Za-z_]\w*\b/g;

/**
 * Numeric scope declared by a concept: `variables[].default`, falling back to
 * `variables[].constant`. Reads the RAW json — physicsEngineConfigSchema is not
 * `.passthrough()`, so a Zod-parsed object has already lost `step` and
 * `derived_fields_declared`.
 */
export function buildDefaultVars(data: unknown): Record<string, number> {
    const out: Record<string, number> = {};
    if (!data || typeof data !== 'object') return out;
    const cfg = (data as { physics_engine_config?: unknown }).physics_engine_config;
    if (!cfg || typeof cfg !== 'object') return out;
    const vars = (cfg as { variables?: unknown }).variables;
    if (!vars || typeof vars !== 'object') return out;
    for (const [name, spec] of Object.entries(vars as Record<string, unknown>)) {
        if (!spec || typeof spec !== 'object') continue;
        const s = spec as { default?: unknown; constant?: unknown };
        if (typeof s.default === 'number' && isFinite(s.default)) out[name] = s.default;
        else if (typeof s.constant === 'number' && isFinite(s.constant)) out[name] = s.constant;
    }
    return out;
}

/** `physics_engine_config.derived_fields_declared` — fields computePhysics_<id> injects at render time. */
export function declaredDerivedFields(data: unknown): Set<string> {
    const out = new Set<string>();
    if (!data || typeof data !== 'object') return out;
    const cfg = (data as { physics_engine_config?: unknown }).physics_engine_config;
    if (!cfg || typeof cfg !== 'object') return out;
    const list = (cfg as { derived_fields_declared?: unknown }).derived_fields_declared;
    if (Array.isArray(list)) {
        for (const item of list) if (typeof item === 'string') out.add(item);
    }
    return out;
}

/**
 * Free identifiers in an expression body, excluding string-literal contents and
 * property-access tails (`x.toFixed` yields `x`, never `toFixed`).
 */
export function extractIdentifiers(body: string): string[] {
    if (SIMPLE_IDENT_RE.test(body)) return [body];
    // Strip JS string literals before tokenizing — words inside 'KINETIC' or
    // "STATIC (at rest)" are display strings, not identifier references.
    const stripped = body
        .replace(/'(?:\\'|[^'])*'/g, "''")
        .replace(/"(?:\\"|[^"])*"/g, '""')
        .replace(/`(?:\\`|[^`])*`/g, '``');
    const out = new Set<string>();
    const tokens = stripped.match(IDENT_TOKEN_RE) ?? [];
    const propAccess = new Set<string>();
    let m: RegExpExecArray | null;
    IDENT_TOKEN_RE.lastIndex = 0;
    while ((m = IDENT_TOKEN_RE.exec(stripped)) !== null) {
        const charBefore = m.index > 0 ? stripped[m.index - 1] : '';
        if (charBefore === '.') propAccess.add(m[0]);
    }
    IDENT_TOKEN_RE.lastIndex = 0;
    for (const t of tokens) {
        if (/^\d/.test(t)) continue;
        if (propAccess.has(t)) continue;
        out.add(t);
    }
    return [...out];
}

export type IdentifierClass = 'resolved' | 'derived_undeclared' | 'unknown';

export function classifyIdentifier(
    ident: string,
    defaultVars: Record<string, number>,
    derived: Set<string>,
): IdentifierClass {
    if (Object.prototype.hasOwnProperty.call(defaultVars, ident)) return 'resolved';
    if ((MATH_WHITELIST as readonly string[]).includes(ident)) return 'resolved';
    if ((JS_RESERVED_IDENTIFIERS as readonly string[]).includes(ident)) return 'resolved';
    if (derived.has(ident)) return 'resolved';
    // Heuristic: identifiers that look like "force_magnitude" / "i_actual" /
    // "pressure" but aren't declared anywhere are most likely missing-derived
    // bugs. Treat as WARN until the author declares them in
    // physics_engine_config.derived_fields_declared.
    if (/^[a-z]/.test(ident)) return 'derived_undeclared';
    return 'unknown';
}
