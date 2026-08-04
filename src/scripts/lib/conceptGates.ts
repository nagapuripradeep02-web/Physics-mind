/**
 * conceptGates.ts — SUBJECT-NEUTRAL concept-JSON gates, shared by every
 * per-subject validator (2026-08-04, MATHEMATICS_BUILD_PLAN.md Phase 2.5).
 *
 * Extracted BY MOVE out of `validate-chemistry.ts`, where these gates were
 * written between 2026-07-23 and 2026-07-29. They were always subject-neutral —
 * they check authoring discipline (word budget, choreography timing, indicator
 * binding, duplicate keys), not chemistry — so `validate-mathematics.ts` needs
 * exactly them and nothing else.
 *
 * WHY MOVED RATHER THAN COPIED. Every comment below records a real defect that
 * shipped past `tsc`, past the validators, and in two cases past a 39/39 THE EYE
 * run. `duplicateKeyErrors` in particular exists because an authored fix was
 * silently discarded by JSON last-key-wins and NOTHING caught it. A gate with
 * that history must not fork into two copies that drift — a fix applied to one
 * and not the other reintroduces the exact class it was written to kill.
 *
 * Chemistry's output was captured before the move and diffed after: byte-identical.
 * That is the same proof technique chemistry Phase 1 used for the physics catalog.
 *
 * Subject-SPECIFIC gates stay in their own validator (e.g. `gasPopulationErrors`
 * in validate-chemistry.ts, which knows `gas_box` internals).
 */
import {
    deriveMaxRevealTimeMs,
    deriveMotionExpectations,
    deriveStateDurationsMs,
} from '../../lib/validators/visual/deriveStateMeta';

export interface Primitive {
    type?: string;
    id?: string;
    position_expr?: unknown;
    animation?: Record<string, number> | undefined;
    appear_at_ms?: number;
    animate_in_ms?: number;
    disappear_at_ms?: number;
    fade_out_ms?: number;
    duration_ms?: number;
    delay_sec?: number;
    duration_sec?: number;
}

export interface StateShape {
    advance_mode?: string;
    teacher_script?: { tts_sentences?: Array<{ text_en?: string }> };
    scene_composition?: Primitive[];
}

export function statesOf(data: unknown): Record<string, StateShape> {
    return (data as { epic_l_path?: { states?: Record<string, StateShape> } })?.epic_l_path?.states ?? {};
}

export function countWords(state: StateShape): number {
    return (state.teacher_script?.tts_sentences ?? [])
        .map((s) => s.text_en ?? '')
        .join(' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
}

export function wordBudgetWarnings(data: unknown, file: string): string[] {
    const warnings: string[] = [];
    for (const [stateId, state] of Object.entries(statesOf(data))) {
        if (state.advance_mode === 'interaction_complete') continue; // explore = 0/open
        const words = countWords(state);
        if (words > 55) warnings.push(`${file} ${stateId}: ${words} EN words (>55 — two ideas? split)`);
        else if (words > 0 && words < 20) warnings.push(`${file} ${stateId}: ${words} EN words (<~20 — merge/enrich)`);
    }
    return warnings;
}

// ── Gate: authored value-encoding indicator must bind its POSITION to the
// derived variable, never a fixed animation sized to the default case
// (engine_bug_queue: authored_indicator_hardcoded_to_default_variable_value,
// 2026-07-24). A pointer/caret/needle/marker BODY in a slider state that has an
// `animation` block but no `position_expr` is hardcoded — invisible in review at
// the default value and wrong at every other. HARD FAIL. ─────────────────────
const INDICATOR_RX = /pointer|caret|needle|marker/i;

export function indicatorBindingErrors(data: unknown, file: string): string[] {
    const errors: string[] = [];
    for (const [stateId, state] of Object.entries(statesOf(data))) {
        const scene = state.scene_composition ?? [];
        const hasSlider = scene.some((p) => p?.type === 'slider');
        if (!hasSlider) continue;
        for (const p of scene) {
            if (p?.type !== 'body' || !INDICATOR_RX.test(p.id ?? '')) continue;
            if (p.animation && p.position_expr == null) {
                errors.push(
                    `${file} ${stateId}: body#${p.id} is a value-encoding indicator (matches ${INDICATOR_RX}) with an ` +
                    `\`animation\` block but no \`position_expr\` in a slider state — its position is hardcoded to the ` +
                    `default value and wrong at every other. Bind position_expr to the derived variable ` +
                    `(engine_bug_queue: authored_indicator_hardcoded_to_default_variable_value).`,
                );
            }
        }
    }
    return errors;
}

// Choreography end = max over every timing field on the state's primitives
// (engine_bug_queue: narration_outruns_choreography probe_logic).
//
// 2026-07-28: this scan reads `scene_composition` ONLY, which is the PCPL/
// parametric shape — a field_3d concept keeps its choreography in
// field_3d_config.states[*].<scenario block>, and on field_3d
// `scene_composition` is a silent no-op (the OPEN scar
// field3d_scene_composition_annotation_silent_noop). So this measured 0 ms for
// EVERY field_3d chemistry concept and warned on all of them regardless of how
// their motion was timed. Fixed by ALSO consulting deriveMaxRevealTimeMs, the
// shared derivation THE EYE already uses, which knows every scenario's per-mode
// reveal fields; the caller takes whichever signal lands later, so the
// parametric path is byte-identical to before.
export function choreoEndMs(state: StateShape): number {
    let mx = 0;
    for (const p of state.scene_composition ?? []) {
        const ends = [
            p.appear_at_ms,
            p.animate_in_ms,
            p.disappear_at_ms != null ? p.disappear_at_ms + (p.fade_out_ms ?? 0) : undefined,
            p.duration_ms,
            p.delay_sec != null ? (p.delay_sec + (p.duration_sec ?? 0)) * 1000 : undefined,
        ];
        if (p.animation) {
            const a = p.animation;
            ends.push((a.delay_ms ?? a.start_ms ?? 0) + (a.duration_ms ?? 0));
        }
        for (const v of ends) if (typeof v === 'number' && v > mx) mx = v;
    }
    return mx;
}

// ── Warn: narration must not outrun choreography (Rule 31a inversion;
// engine_bug_queue: narration_outruns_choreography, 2026-07-24). Motion may
// outrun narration, never the reverse. Heuristic (speech ≈ words/2.8 wps), so
// WARN-only — matches the word-budget pattern and never false-breaks the gate. ─
export function narrationChoreographyWarnings(data: unknown, file: string): string[] {
    const warnings: string[] = [];
    // Renderer-aware reveal times (field_3d / particle_field / PCPL) from the
    // same derivation THE EYE pins its frozen frames with.
    let derivedReveal: Record<string, number> = {};
    try {
        derivedReveal = deriveMaxRevealTimeMs(
            (data && typeof data === 'object') ? (data as Record<string, unknown>) : null,
        );
    } catch {
        derivedReveal = {};   // never let a derivation edge case break the gate
    }
    // A state whose motion is CONTINUOUS by construction (particles never stop,
    // field lines keep flowing) has no "settle" instant at all — its motion runs
    // for the state's whole duration. Measuring such a state by a REVEAL time is
    // a category error: reveal times describe one-shot cues, and a state with no
    // cues falls through to the small default (~1500ms), so every state warns no
    // matter how carefully it was timed. That is the same class as the recorded
    // field_3d scar (field3d_scene_composition_annotation_silent_noop): a warning
    // that cannot be satisfied trains the author to ignore the gate.
    //
    // Renderer-AGNOSTIC by deliberate choice: this consults deriveMotionExpectations
    // — the shared classifier that already knows, per renderer, which states move
    // every frame — rather than special-casing scenario_type 'gas_box'. That is the
    // explicit "PATTERN TO WATCH" instruction left on the vsepr_3d_surface scar:
    // "the next such fix should ask whether the tool can be made renderer-agnostic
    // rather than taught one more special case."
    //
    // The check stays HONEST: a continuously-moving state is measured against its
    // own authored duration, so one whose narration genuinely overruns its state
    // duration still warns.
    let motionByState: Record<string, boolean | undefined> = {};
    let durationByState: Record<string, number> = {};
    try {
        const src = (data && typeof data === 'object') ? (data as Record<string, unknown>) : null;
        motionByState = deriveMotionExpectations(src);
        durationByState = deriveStateDurationsMs(src);
    } catch {
        motionByState = {}; durationByState = {};   // never let a derivation edge case break the gate
    }
    for (const [stateId, state] of Object.entries(statesOf(data))) {
        if (state.advance_mode === 'interaction_complete') continue; // explore sandbox exempt
        const words = countWords(state);
        if (words === 0) continue;
        const estSpeech = (words / 2.8) * 1000;
        const continuous = motionByState[stateId] === true ? (durationByState[stateId] ?? 0) : 0;
        const choreo = Math.max(choreoEndMs(state), derivedReveal[stateId] ?? 0, continuous);
        if (choreo < 0.7 * estSpeech) {
            warnings.push(
                `${file} ${stateId}: choreography settles ~${Math.round(choreo)}ms but narration runs ~${Math.round(estSpeech)}ms ` +
                `(ratio ${(choreo / estSpeech).toFixed(2)} < 0.70) — motion must span narration (Rule 31a). Retime the windows.`,
            );
        }
    }
    return warnings;
}

// ── Gate: DUPLICATE KEYS. HARD FAIL. ────────────────────────────────────────
// JSON.parse resolves a duplicate key LAST-WINS and reports nothing. Neither
// Zod nor any other gate can ever see it, because by the time either runs the
// earlier value is simply gone. Recorded cost (atomic_orbitals_s_p_d,
// 2026-07-28): a fix authored `spin_rate` fifteen lines above an existing
// `spin_rate: 0`, so the change was silently discarded — the file stayed valid,
// tsc passed, validate:chemistry passed and THE EYE passed 39/39, and the edit
// did nothing at all. It was caught only by diffing the SEEDED sim html against
// the source and finding 9 spin_rate values where the source had 10.
//
// So this reads the raw TEXT, not the parsed object: a scanner is the only thing
// that can see a key the parser has already thrown away.
export function duplicateKeyErrors(raw: string, file: string): string[] {
    const errors: string[] = [];
    // path stack of the object/array we are inside, plus the keys seen at each
    // object level. Strings and escapes are tracked so a brace or a quote inside
    // a value never moves the stack.
    const stack: Array<{ isArray: boolean; keys: Map<string, number>; label: string }> = [];
    let i = 0, line = 1;
    let pendingKey: string | null = null;
    while (i < raw.length) {
        const ch = raw[i];
        if (ch === '\n') { line += 1; i += 1; continue; }
        if (ch === '"') {
            // read the whole string token, honouring escapes
            let j = i + 1, out = '';
            while (j < raw.length) {
                if (raw[j] === '\\') { out += raw[j + 1] ?? ''; j += 2; continue; }
                if (raw[j] === '"') break;
                if (raw[j] === '\n') line += 1;
                out += raw[j]; j += 1;
            }
            // is this token a KEY? (next non-space char is a colon)
            let k = j + 1;
            while (k < raw.length && /\s/.test(raw[k])) k += 1;
            const top = stack[stack.length - 1];
            if (raw[k] === ':' && top && !top.isArray) {
                const prev = top.keys.get(out);
                if (prev !== undefined) {
                    errors.push(
                        `${file}: DUPLICATE KEY "${out}" in ${top.label} — first at line ${prev}, again at line ${line}. ` +
                        `JSON.parse keeps the LAST one and reports nothing, so the earlier value is silently discarded.`,
                    );
                } else {
                    top.keys.set(out, line);
                }
                pendingKey = out;
            }
            i = j + 1;
            continue;
        }
        if (ch === '{') {
            const parentLabel = stack.length === 0 ? '(root)' : (pendingKey ?? stack[stack.length - 1].label);
            stack.push({ isArray: false, keys: new Map(), label: parentLabel });
            pendingKey = null;
        } else if (ch === '[') {
            stack.push({ isArray: true, keys: new Map(), label: pendingKey ?? '(array)' });
            pendingKey = null;
        } else if (ch === '}' || ch === ']') {
            stack.pop();
        }
        i += 1;
    }
    return errors;
}
