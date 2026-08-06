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

// ── Gate 9 — WP-R5 choreography primitives (variable_choreography + anchor_to +
// locus_trace sweep collision). MOVED here from validate-concepts.ts on
// 2026-08-06 so validate-mathematics.ts runs them too — they were private to
// the flat-namespace validator, which meant the subject that most needs the
// locus_trace gate (mathematics — the concept that DISCOVERED the collision)
// never ran ANY choreography check. Same move-not-copy rationale as the header.
//
// (a) anchor_to.primitive_id must name a primitive that exists AND is authored
//     EARLIER in the same state's scene_composition array — PM_endpointRegistry
//     (parametric_renderer.ts) only holds entries the current draw() pass has
//     already registered, in array order, so a forward reference silently
//     chains onto a stale/missing endpoint at runtime. FATAL.
// (b) variable_choreography[].variable must be declared in
//     physics_engine_config.variables — an undeclared variable still "moves"
//     inside the renderer's PM_choreoValues cache but computePhysics() never
//     receives it, so nothing downstream reacts. FATAL.
// (c) variable_choreography[].seizable:true needs a type:'slider' primitive for
//     the SAME variable somewhere in the state's scene_composition — otherwise
//     a teacher can never actually take the sweep over. WARN, not fatal.
// (d) a locus_trace's sweep parameter must never be a slider variable in the
//     same state (engine_bug_queue:
//     pcpl_locus_trace_sweep_parameter_exposed_as_a_slider_collapses_the_curve,
//     CRITICAL) — PM_choreoVarsAtTime skips teacher-seized variables when it
//     evaluates a trace's historical samples, so the first drag collapses the
//     curve to zero-length segments, invisibly to every pixel gate. FATAL.

export interface ChoreoWarning { path: string; message: string; fatal: boolean }

function declaredPhysicsVariableNames(data: unknown): Set<string> {
    const out = new Set<string>();
    if (!data || typeof data !== 'object') return out;
    const cfg = (data as { physics_engine_config?: unknown }).physics_engine_config;
    if (!cfg || typeof cfg !== 'object') return out;
    const vars = (cfg as { variables?: unknown }).variables;
    if (!vars || typeof vars !== 'object') return out;
    for (const name of Object.keys(vars as Record<string, unknown>)) out.add(name);
    return out;
}

function checkStateChoreography(
    stateId: string,
    state: unknown,
    pathPrefix: string,
    declaredVars: Set<string>,
): ChoreoWarning[] {
    if (!state || typeof state !== 'object') return [];
    const s = state as Record<string, unknown>;
    const scene = s.scene_composition;
    const out: ChoreoWarning[] = [];

    // (a) anchor_to — walk scene_composition in authored array order, exactly
    // matching PM_endpointRegistry's runtime fill order. Also collects the
    // state's slider variables in the same pass for checks (c) and (d) below.
    const sliderVars = new Set<string>();
    if (Array.isArray(scene)) {
        const allIds = new Set<string>();
        for (const prim of scene) {
            const p = prim as { id?: unknown; type?: unknown; variable?: unknown } | null;
            if (typeof p?.id === 'string') allIds.add(p.id);
            if (p && p.type === 'slider' && typeof p.variable === 'string') sliderVars.add(p.variable);
        }
        const seenIds = new Set<string>();
        scene.forEach((prim, idx) => {
            if (!prim || typeof prim !== 'object') return;
            const p = prim as Record<string, unknown>;
            const anchorTo = p.anchor_to as { primitive_id?: unknown } | undefined;
            if (anchorTo && typeof anchorTo === 'object' && typeof anchorTo.primitive_id === 'string') {
                const targetId = anchorTo.primitive_id;
                const label = typeof p.id === 'string' ? p.id : idx;
                const where = `${pathPrefix}.${stateId}.scene_composition[${label}]`;
                if (!allIds.has(targetId)) {
                    out.push({
                        path: where,
                        fatal: true,
                        message: `anchor_to_missing_target primitive_id='${targetId}' not found anywhere in this state's scene_composition`,
                    });
                } else if (!seenIds.has(targetId)) {
                    out.push({
                        path: where,
                        fatal: true,
                        message: `anchor_to_forward_reference primitive_id='${targetId}' is authored AFTER this primitive — PM_endpointRegistry fills in array order, so this arrow/arc will chain onto a stale or missing endpoint. Move '${targetId}' earlier in scene_composition.`,
                    });
                }
            }
            if (typeof p.id === 'string') seenIds.add(p.id);
        });
    }

    // (b) + (c) variable_choreography.
    const choreo = s.variable_choreography;
    if (Array.isArray(choreo)) {
        choreo.forEach((entry, idx) => {
            if (!entry || typeof entry !== 'object') return;
            const c = entry as Record<string, unknown>;
            if (typeof c.variable !== 'string') return; // Zod already requires this; defend anyway
            const variable = c.variable;
            const where = `${pathPrefix}.${stateId}.variable_choreography[${idx}]`;
            if (!declaredVars.has(variable)) {
                out.push({
                    path: where,
                    fatal: true,
                    message: `choreography_variable_undeclared variable='${variable}' not found in physics_engine_config.variables — computePhysics() will never see this choreographed value`,
                });
            }
            if (c.seizable === true && !sliderVars.has(variable)) {
                out.push({
                    path: where,
                    fatal: false,
                    message: `choreography_seizable_without_slider variable='${variable}' is seizable but no type:'slider' primitive for it exists in this state — a teacher can never seize it`,
                });
            }
        });
    }

    // (d) locus_trace sweep-parameter collision. Slider variables cannot
    // collide with expression function names (sin, cos, PI …), so token
    // intersection is exact here.
    if (Array.isArray(scene) && sliderVars.size > 0) {
        scene.forEach((prim, idx) => {
            if (!prim || typeof prim !== 'object') return;
            const p = prim as Record<string, unknown>;
            if (p.type !== 'locus_trace') return;
            const label = typeof p.id === 'string' ? p.id : idx;
            const where = `${pathPrefix}.${stateId}.scene_composition[${label}]`;
            const flagged = new Set<string>();
            for (const exprKey of ['x_expr', 'y_expr']) {
                const expr = p[exprKey];
                if (typeof expr !== 'string') continue;
                for (const ident of expr.match(/[A-Za-z_]\w*/g) ?? []) {
                    if (sliderVars.has(ident) && !flagged.has(ident)) {
                        flagged.add(ident);
                        out.push({
                            path: where,
                            fatal: true,
                            message: `locus_trace_sweep_parameter_is_a_slider variable='${ident}' parameterises this trace AND is a type:'slider' primitive in the same state — the first teacher drag collapses the curve to a point. Parameterise the trace on a dedicated clock-choreographed sweep variable instead.`,
                        });
                    }
                }
            }
        });
    }

    return out;
}

export function checkConceptChoreography(data: unknown): ChoreoWarning[] {
    if (!data || typeof data !== 'object') return [];
    const obj = data as Record<string, unknown>;
    const declaredVars = declaredPhysicsVariableNames(data);
    const out: ChoreoWarning[] = [];

    const walk = (states: Record<string, unknown>, pathPrefix: string): void => {
        for (const [stateId, state] of Object.entries(states)) {
            out.push(...checkStateChoreography(stateId, state, pathPrefix, declaredVars));
        }
    };

    const epicL = obj.epic_l_path as { states?: Record<string, unknown> } | undefined;
    if (epicL?.states) walk(epicL.states, 'epic_l_path.states');

    const branches = obj.epic_c_branches;
    if (Array.isArray(branches)) {
        branches.forEach((branch, i) => {
            const b = branch as { states?: Record<string, unknown> } | undefined;
            if (b?.states) walk(b.states, `epic_c_branches[${i}].states`);
        });
    }
    return out;
}
