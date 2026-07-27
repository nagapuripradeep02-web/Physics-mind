/**
 * Seed engine_bug_queue with the defect classes surfaced by the stage-4
 * quality_auditor gate on bohr_model_energy_levels (2026-07-24).
 *
 * Companion to _seed_engine_bug_queue_chemistry_session.ts (which recorded the
 * classes found during the BUILD). These are the classes found by the formal
 * ADVERSARIAL gate afterwards — including the one that matters most:
 * the parametric renderer never implemented the player's clock contract, so
 * Play/Pause/Replay are dead on that whole renderer family and THE EYE cannot
 * pin a deterministic frame.
 *
 * Idempotent: upserts on the UNIQUE bug_class.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_bohr_audit.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'chemistry-wave1-bohr-audit-2026-07-24';
const CHEM = ['bohr_model_energy_levels'];

interface BugRow {
    bug_class: string;
    title: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
    owner_cluster: string;
    root_cause: string;
    prevention_rule: string;
    probe_type: 'sql' | 'js_eval' | 'manual' | 'vision_model';
    probe_logic: string;
    status: 'OPEN' | 'FIXED';
    concepts_affected: string[];
    fixed_in_files: string[];
    subject: 'physics' | 'chemistry' | 'subject_neutral';
}

const ROWS: BugRow[] = [
    {
        bug_class: 'parametric_renderer_ignores_player_clock_contract',
        title: 'Parametric renderer implements 3 of 7 player message types — Play/Pause/Replay are dead on the whole family',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause:
            "The parametric renderer's message handler covered only USER_GESTURE, SET_STATE and PARAM_UPDATE. The review player sends SET_TIME_FREEZE (pin the opening frame until Play, and Rule 26b pause), RESET_TRAJECTORY + REPLAY_ANIMATIONS (fired by rollTimeline on Play), PAUSE/RESUME and MUTE — all silently ignored. Effects: selecting a state runs its choreography immediately while the teacher is still reading; Play does not restart motion; Pause stops audio while the canvas keeps animating so a teacher cannot hold a frame to point at it. The failure is SILENT because the renderer does expose window.PM_simTimeMs, so the player's clock READ succeeds while every clock WRITE is dropped. Also blocks THE EYE, whose deterministic capture depends on the SET_TIME_FREEZE pin — which is why this renderer family had never been visually gated.",
        prevention_rule:
            'Every renderer family reachable via renderer_pair.panel_a MUST implement the full postMessage contract (root CLAUDE.md §6) BEFORE any concept ships on it: SIM_READY, SET_STATE + STATE_REACHED, SET_TIME_FREEZE (pin + release), RESET_TRAJECTORY, REPLAY_ANIMATIONS, PAUSE/RESUME (clock+audio together, Rule 26b) and MUTE (audio only). Exposing PM_simTimeMs without honouring the freeze pin is worse than not exposing it — it makes the breakage undetectable from the player side. Adding a renderer family and adding its clock contract are ONE change.',
        probe_type: 'js_eval',
        probe_logic:
            "For each renderer family, grep the emitted template body for a handler branch per message type: SET_STATE, SET_TIME_FREEZE, RESET_TRAJECTORY, REPLAY_ANIMATIONS, PAUSE, RESUME, MUTE. FAIL on any missing. Cross-check the built review-site sim.html: grep -c each token, FAIL on 0.",
        status: 'FIXED',
        concepts_affected: [...CHEM, 'vector_head_to_tail', 'newton_second_law_direction'],
        fixed_in_files: ['src/lib/renderers/parametric_renderer.ts'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'authored_indicator_hardcoded_to_default_variable_value',
        title: 'A value-encoding indicator hardcoded to the default target contradicts the state’s own live arithmetic',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause:
            "A wavelength pointer whose POSITION encodes a computed value was authored as a fixed translate (dx sized to reach the default transition's line). At every non-default slider value the state's own derivation text rendered one number while the pointer glided to a different line — in the exact state whose misconception_watch claims the visual proves 'bigger gap → shorter wavelength'. The shipped visual asserted the opposite of the taught rule.",
        prevention_rule:
            'Any indicator whose POSITION encodes a computed quantity (pointer, caret, needle, marker) must bind via position_expr against the derived variable — never a fixed translate sized to the default case. A hardcoded indicator is invisible in review at default values and wrong everywhere else. Note position_expr and animation.translate are mutually exclusive on the same body.',
        probe_type: 'js_eval',
        probe_logic:
            "In any state containing a 'slider' primitive, FAIL any body whose id matches /pointer|caret|needle|marker/ that has an `animation` block but no `position_expr`.",
        status: 'FIXED',
        // Fixed 2026-07-24: probe mechanised as a HARD gate in validate:chemistry
        // (indicatorBindingErrors). Bohr's own indicators (lambda_pointer,
        // lambda_caret_explore, start_level_marker) all bind position_expr with no
        // animation block, so the concept passes the new gate.
        concepts_affected: CHEM,
        fixed_in_files: ['src/scripts/validate-chemistry.ts', 'src/data/concepts/chemistry/bohr_model_energy_levels.json'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'explore_state_surfaces_non_core_ring_symbol',
        title: 'Explore state renders a symbol first introduced in an extended/advanced ring state (Rule 38b)',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause:
            "Rule 38b requires the explore state to surface CORE-ring content only, because every reduced curriculum preset hides the higher rings. The sandbox rendered a symbol (and two spectral-region abbreviations) whose only prior introduction was an extended-ring state — so under the qualitative_core preset the teacher's sandbox displays notation no surviving state ever taught. Same class as the capacitance epsilon-0*A/d scar.",
        prevention_rule:
            'Every symbol, abbreviation and unit rendered in the interaction_complete explore state must FIRST appear in a depth_ring:core state. Run the cut checks literally: hide advanced, then advanced+extended, and re-read the explore surface for orphaned notation.',
        probe_type: 'js_eval',
        probe_logic:
            "Collect the symbol/abbreviation set rendered by the interaction_complete state; for each, find its earliest occurrence across states ordered by index; FAIL any whose earliest occurrence has depth_ring != 'core'.",
        status: 'OPEN',
        concepts_affected: CHEM,
        fixed_in_files: [],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'narration_outruns_choreography',
        title: 'Guided-state choreography settles long before its narration ends (Rule 31a inversion)',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause:
            'Rule 31a allows motion to outrun narration but never the reverse. Every guided state in the concept settled its choreography 1.5x-10x sooner than its narration takes to speak, leaving the teacher talking over a frozen picture for most of each state. The word budget gate (25-55 words) passed on all states, so budget compliance masked the timing inversion entirely — the two are independent axes.',
        prevention_rule:
            'Per guided state, compare estimated speech duration (words / ~2.8 words-per-sec) against the choreography end (max of appear_at_ms, animate_in_ms, disappear_at_ms+fade_out_ms, duration_ms, delay_sec+duration_sec). The motion must span the narration. Fix by RETIMING (stretch the windows), not by splitting the state — the word budget is already correct.',
        probe_type: 'js_eval',
        probe_logic:
            'For each guided state: est_speech_ms = words/2.8*1000; choreo_end_ms = max over all timing fields; FAIL if choreo_end_ms < 0.7 * est_speech_ms.',
        status: 'OPEN',
        // Probe MECHANISED 2026-07-24 as a WARN in validate:chemistry
        // (narrationChoreographyWarnings) — heuristic (words/2.8 wps), so WARN not
        // FAIL, matching the word-budget pattern. It caught that the prior "all 8
        // guided states retimed" claim was incomplete: STATE_3 (0.69) and STATE_7
        // (0.62) still settle before narration ends. Stays OPEN until those two are
        // retimed (a pedagogical change routed through chemistry_author + Asmi, not
        // a mechanical bump). fixed_in_files lists only the probe, not a content fix.
        concepts_affected: CHEM,
        fixed_in_files: ['src/scripts/validate-chemistry.ts'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'focal_pulse_scales_size_violates_rule29',
        title: 'focal_primitive_id emphasis animates textSize (a size bulge) instead of brightness — Rule 29',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause:
            "The parametric renderer's focal-pulse helper returns a continuous sine-modulated SCALE factor which is multiplied into textSize in the label, annotation, force-arrow and formula-box draw paths. Rule 29 is explicit that emphasis is brightness and never size — no zoom or bulge on any element. Text focals therefore throb by about +/-12% instead of brightening.",
        prevention_rule:
            'Rule 29 mechanised at the renderer: focal/emphasis helpers must modulate alpha, fill brightness or a glow radius — never textSize, scale, or any geometry term. A focal helper that returns a multiplier applied to a size is a defect regardless of how subtle it looks.',
        probe_type: 'js_eval',
        probe_logic:
            'Grep the emitted renderer body for a focal/pulse helper returning a value != 1, then check whether its result multiplies a size/scale term (textSize, scale(, strokeWeight, radius). FAIL if so.',
        status: 'FIXED',
        // Fixed 2026-07-24: PM_focalPulseScale (a size multiplier, applied to
        // textSize/strokeWeight/headLen/lineHeight across drawLabel, drawAnnotation,
        // drawForceArrow, drawFormulaBox) replaced by PM_focalEmphasis(spec) ->
        // {isFocal, alphaMul, glowPx}: focal keeps full alpha + a 12px shadowBlur
        // glow, non-focal peers dim to alphaMul 0.6, geometry invariant. glow_focus
        // holds its halo radius CONSTANT and modulates intensity only.
        // CANONICAL MECHANISM: authored on feat/field3d-draggable-sensor in commit
        // 2435706 "feat(pcpl): harden parametric renderer to doctrine parity"
        // (peter_parker:renderer_primitives). Two machines independently fixed this
        // same Rule-29 violation on 2026-07-24; that version won on merit (it dims
        // peers per Rule 29's "focal brightens + peers dim", uses a real glow rather
        // than a colour lerp, and is static so it does not mask THE EYE's D7
        // frozen-tail probe). Ported verbatim here, adapting only its clock read
        // (PM_simClockMs -> this tree's freeze-aware PM_now()).
        concepts_affected: CHEM,
        fixed_in_files: ['src/lib/renderers/parametric_renderer.ts', 'src/lib/renderers/premium_primitives.ts'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'derived_contract_value_computed_but_never_surfaced',
        title: 'A computed_outputs value declared to drive an on-canvas word is computed but never rendered',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        root_cause:
            "The engine_config declared a `direction` output whose stated role was to drive the photon arrow direction AND the in/out ledger word. It was computed and used only for a divide-by-zero guard; no absorb/emit word ever reached the canvas. In the sandbox, picking 2->5 and 5->2 therefore render identically — re-planting the exact absorb-vs-emit misconception the guided contrast pair exists to kill.",
        prevention_rule:
            'Every computed_outputs entry whose declared role names a display responsibility must actually appear in a rendered text field or drive a visible element. Audit the engine_config contract against the shipped scene: a computed value with no visual consumer is either dead code or a dropped requirement.',
        probe_type: 'js_eval',
        probe_logic:
            'For each computed_outputs key whose formula/role string names a display responsibility, assert the key is referenced by at least one rendered text_expr/label_expr or position_expr. FAIL otherwise.',
        status: 'OPEN',
        concepts_affected: CHEM,
        fixed_in_files: [],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'layout_overlap_script_hardcodes_first_five_states',
        title: 'check-layout-overlap.mjs only scans STATE_1..STATE_5 — silently skips every later state',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:runtime_generation',
        root_cause:
            "The ad-hoc layout checker hardcodes a five-element STATES array (written when concepts were shorter) and a bounding-box model that assumes a 29px annotation box for what is now a 12px label font. On any concept with more than five states it reports clean while never having looked at the rest — Gate 9 passes vacuously. Its bbox model also produces false positives against the 14px separation threshold the queue itself uses.",
        prevention_rule:
            "A layout/QA script must enumerate states from the concept JSON (Object.keys(epic_l_path.states)), never a hardcoded list, and must model each primitive type's REAL rendered box (label = font_size*1.25 line height, centre-anchored; annotation = lines*17+12, top-left anchored). A checker that silently skips states is worse than no checker: it converts an unchecked area into a green tick.",
        probe_type: 'js_eval',
        probe_logic:
            'Grep QA scripts for hardcoded STATE_ arrays or fixed-length state loops; FAIL any that do not derive the state list from the concept JSON.',
        status: 'FIXED',
        // Fixed 2026-07-24: check-layout-overlap.mjs now enumerates states from
        // Object.keys(epic_l_path.states) (+ epic_c_branches) instead of a fixed
        // 5-element array, models each primitive's REAL rendered box (label =
        // font·1.25 centre-anchored; annotation/formula_box = lines·1.35+pad
        // top-left-anchored), and applies a 3px penetration tolerance so the
        // intentional 14px label stagger no longer false-positives. Regression
        // proof: it now scans Bohr's 9 states and vector_head_to_tail's 17 (the
        // old script silently stopped at STATE_5 on both). The stale Windows
        // default path is gone; a bare id resolves across physics + chemistry dirs.
        concepts_affected: [],
        fixed_in_files: ['src/scripts/check-layout-overlap.mjs'],
        subject: 'subject_neutral',
    },
];

async function main(): Promise<void> {
    console.log(`Seeding ${ROWS.length} audit-found defect classes into engine_bug_queue…\n`);
    let withSubject = true;
    let ok = 0;

    for (const row of ROWS) {
        const base = {
            ...row,
            discovered_in_session: SESSION,
            row_type: 'incident',
            fixed_at: row.status === 'FIXED' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
        };
        let payload: Record<string, unknown> = { ...base };
        if (!withSubject) delete payload.subject;

        let { error } = await supabaseAdmin
            .from('engine_bug_queue')
            .upsert(payload, { onConflict: 'bug_class' });

        if (error && /subject/i.test(error.message)) {
            withSubject = false;
            payload = { ...base };
            delete payload.subject;
            ({ error } = await supabaseAdmin
                .from('engine_bug_queue')
                .upsert(payload, { onConflict: 'bug_class' }));
        }

        if (error) console.log(`  ✖ ${row.bug_class} — ${error.message}`);
        else { ok++; console.log(`  ✓ [${row.severity.padEnd(8)}] ${row.status.padEnd(5)} ${row.bug_class}`); }
    }

    console.log(`\n${ok}/${ROWS.length} rows upserted.`);
    if (!withSubject) console.log('⚠ `subject` column absent — apply the 2026-07-24 migration, then re-run.');

    // Queue hygiene (auditor Q1): two physics-only wildcard rows misfire on
    // chemistry, where compliance would itself be the defect (isolation §7).
    if (withSubject) {
        const { error } = await supabaseAdmin
            .from('engine_bug_queue')
            .update({ subject: 'physics' })
            .in('bug_class', [
                'production_routing_disconnect_pcpl_concepts_set',
                'classifier_prompt_drift_atomic_not_advertised',
            ]);
        console.log(error ? `  ✖ Q1 scoping: ${error.message}` : '  ✓ Q1: scoped 2 registration rows to subject=physics');
    }
}

main();
