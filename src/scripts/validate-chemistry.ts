/**
 * validate-chemistry.ts — v0 chemistry concept validator
 * (2026-07-23, CHEMISTRY_BUILD_PLAN.md Phase 2.5 pull-forward; full chemistry
 * gates — machine-checked balanced-equation ledger, chemistry animation
 * vocabulary — land in Phase 4.)
 *
 * Scans ONLY src/data/concepts/chemistry/*.json (the isolation contract:
 * the physics validator's flat scan is non-recursive by design and never sees
 * these files — docs/CHEMISTRY_ARCHITECTURE.md §7). An empty namespace is a
 * PASS (0 files scanned) so this can run in CI before the first concept lands.
 *
 * v0 gates:
 *   1. JSON parses.
 *   2. Zod schema via validateConceptJson (src/schemas/conceptJson.ts) — the
 *      subject-neutral schema the vertical slice reuses as-is, including its
 *      superRefine gates (≥2 advance_mode, coverage/quiz when assessment
 *      present, board all-or-nothing).
 *   3. Word budget (Rule 31a) — WARN-only: guided states 25–55 EN words on
 *      text_en; explore states (advance_mode interaction_complete) exempt.
 *
 * Usage: npm run validate:chemistry
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { validateConceptJson } from '../schemas/conceptJson';
import {
    deriveMaxRevealTimeMs,
    deriveMotionExpectations,
    deriveStateDurationsMs,
} from '../lib/validators/visual/deriveStateMeta';

const CHEM_DIR = join(process.cwd(), 'src', 'data', 'concepts', 'chemistry');

interface Primitive {
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
interface StateShape {
    advance_mode?: string;
    teacher_script?: { tts_sentences?: Array<{ text_en?: string }> };
    scene_composition?: Primitive[];
}

function statesOf(data: unknown): Record<string, StateShape> {
    return (data as { epic_l_path?: { states?: Record<string, StateShape> } })?.epic_l_path?.states ?? {};
}

function countWords(state: StateShape): number {
    return (state.teacher_script?.tts_sentences ?? [])
        .map((s) => s.text_en ?? '')
        .join(' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
}

function wordBudgetWarnings(data: unknown, file: string): string[] {
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
function indicatorBindingErrors(data: unknown, file: string): string[] {
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
function choreoEndMs(state: StateShape): number {
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
function narrationChoreographyWarnings(data: unknown, file: string): string[] {
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

function main(): void {
    if (!existsSync(CHEM_DIR)) {
        console.log('validate:chemistry — chemistry namespace not found; 0 files scanned. PASS');
        return;
    }

    const files = readdirSync(CHEM_DIR)
        .filter((f) => f.endsWith('.json') && !f.includes('.legacy.') && !f.includes('.deleted'))
        .sort();

    console.log(`\nvalidate:chemistry — scanning src/data/concepts/chemistry/ (${files.length} JSON file(s))\n`);

    let passCount = 0;
    const failures: string[] = [];
    const allWarnings: string[] = [];

    for (const file of files) {
        let parsed: unknown;
        try {
            parsed = JSON.parse(readFileSync(join(CHEM_DIR, file), 'utf-8'));
        } catch (e) {
            failures.push(`${file}: JSON parse error — ${e instanceof Error ? e.message : String(e)}`);
            console.log(`FAIL        ${file} (parse error)`);
            continue;
        }

        const result = validateConceptJson(parsed, file);
        const indicatorErrors = indicatorBindingErrors(parsed, file);
        const errors = [...(result.passed ? [] : result.errors), ...indicatorErrors];

        if (errors.length === 0) {
            passCount += 1;
            console.log(`PASS        ${file}`);
        } else {
            failures.push(`${file}:\n${errors.join('\n')}`);
            console.log(`FAIL        ${file}`);
        }

        allWarnings.push(...wordBudgetWarnings(parsed, file));
        allWarnings.push(...narrationChoreographyWarnings(parsed, file));
    }

    if (allWarnings.length > 0) {
        console.log(`\nWord-budget warnings (Rule 31a — non-fatal):`);
        for (const w of allWarnings) console.log(`  WARN  ${w}`);
    }

    console.log(`\nSummary: ${files.length} scanned, ${passCount} PASS, ${failures.length} FAIL`);
    if (failures.length > 0) {
        console.error('\nFailures:\n' + failures.join('\n\n'));
        process.exit(1);
    }
    console.log('PASS');
}

main();
