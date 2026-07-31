/**
 * Probe definitions for THE CALCULATOR (PIPELINE_V2_PLAN.md §2 Phase 3).
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_the_calculator.ts
 *
 * These are `row_type: 'probe_definition'` rows, NOT incidents: they record the
 * checks the numeric gate now performs so a future session can execute them and
 * so Gate 8's incident replay never counts them.
 *
 * The gate ships ADVISORY (exit 1 on failure, but not in verify.yml and not in
 * the SOP's blocking chain). Promotion is gated on the fleet SKIP census.
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const S = 'session_2026-07-31_the_calculator';
const G = 'src/scripts/numeric_calc.ts';
const H = 'src/lib/validators/numeric/probeHarness.ts';
const R = 'src/lib/validators/numeric/readoutHarvest.ts';
const D = 'src/lib/validators/numeric/deriveAssertions.ts';

const rows = [
    {
        bug_class: 'probe_numeric_readouts_never_checked_against_declared_physics',
        title: 'PROBE: THE CALCULATOR asserts every painted HUD/probe/readout value against the concept\'s own declared physics',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:visual_validator',
        subject: 'subject_neutral',
        root_cause:
            'Nothing verified that the NUMBERS a teacher reads are physically right. THE EYE proves '
            + 'pixels moved and that frozen frames match baselines; validate:concepts proves structure '
            + 'and never runs the sim; the vision gate costs money and is deliberately rare. The '
            + 'gas_box session already recorded the shape of the hole — THE EYE passed 31/31 twice over '
            + 'frames stepped by the WRONG physics. check_gas_reaction_physics.ts closed it for one '
            + 'chemistry scenario by driving engine internals in a vm, but by its own sibling\'s words '
            + '"it cannot see a pixel", so an engine-right/label-wrong defect stayed invisible fleet-wide.',
        prevention_rule:
            'Assert the number that is PAINTED, not the one the engine holds. Ground truth comes from '
            + 'the concept JSON (computed_outputs, variables[].derived) — never from computePhysics_<id> '
            + 'or a renderer internal, which are the implementation under test.',
        probe_type: 'js_eval',
        probe_logic:
            'npm run numeric:calc -- <concept_id> — drives every state headlessly on the SET_TIME_FREEZE '
            + 'pin, harvests readings from three channels (DOM overlays, a CanvasRenderingContext2D.fillText '
            + 'hook for p5 instruments and sprite labels, Three.js sprite _pmText), and runs N1 '
            + 'readout-matches-formula, N2 conservation, N3 slider-response direction. Exit 1 on failure. '
            + 'Negative-controlled before use: perturbing a declared formula fires N1, inverting one fires N3.',
        status: 'FIXED',
        concepts_affected: [] as string[],
        fixed_in_files: [G, H, R, D],
        row_type: 'probe_definition',
    },
    {
        bug_class: 'probe_declared_input_is_stale_when_a_state_animates_it',
        title: 'PROBE: a numeric gate must read state inputs LIVE, never from the authored default',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:visual_validator',
        subject: 'subject_neutral',
        root_cause:
            'THE CALCULATOR\'s first run false-failed capacitance STATE_3/4/5/7 — 20 findings, all wrong. '
            + 'A state ANIMATES its inputs (STATE_4 morphs plate area 0.01 -> 0.02 m2 via area_morph), so '
            + 'the authored `A: 0.01` is the value BEFORE the beat the gate pins at. The sim was right '
            + 'every time: eps0*0.02/0.001 = 177.08 pF, painted 177 pF. A second instance of the same '
            + 'class: treating a computed_output (d_mm) as a DERIVATION of d demoted d to dependent, so '
            + 'its live slider was ignored and STATE_5 false-failed too.',
        prevention_rule:
            'Resolve independent variables from live evidence (painted value > visible slider > state '
            + 'override > declared default) and recompute dependent ones. Only a `derived` string makes a '
            + 'variable dependent — a computed_output is display formatting. Where an input could only be '
            + 'read from a declared default, a MISMATCH is ambiguous and must SKIP, not accuse; a MATCH is '
            + 'still strong evidence, so the treatment is deliberately asymmetric.',
        probe_type: 'js_eval',
        probe_logic:
            'buildStateScope() in src/lib/validators/numeric/deriveAssertions.ts stamps a Provenance on '
            + 'every scope value; inputsAreTrustworthy() gates whether a mismatch may be reported as a '
            + 'failure. numeric:calc prints the provenance of each input in every failure evidence string.',
        status: 'FIXED',
        concepts_affected: ['capacitance'],
        fixed_in_files: [D],
        row_type: 'probe_definition',
    },
    {
        bug_class: 'probe_headless_numeric_harvest_must_be_run_to_run_reproducible',
        title: 'PROBE: numeric readings must be byte-identical across two runs of the same source',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:visual_validator',
        subject: 'subject_neutral',
        root_cause:
            'A gate whose output varies between runs cannot be trusted or diffed. Three real sources of '
            + 'drift were found and closed: (1) a p5 sketch repaints its HUD every frame, so a settling '
            + 'readout contributed a transient value (combination_of_resistors reported an extra '
            + '"R_eq = 3" on some runs); (2) the cumulative fillText buffer retained EVERY earlier '
            + 'state\'s text, so a stale "V2 = 3.0" surfaced in a later state and read as a dead slider; '
            + '(3) the renderer accumulates real elapsed ms, so PM_simTimeMs differed in its last float '
            + 'bit (7299.999999999999 vs 7300.000000000001).',
        prevention_rule:
            'Sample until two consecutive harvests agree, keep the LAST value painted per (canvas, symbol), '
            + 'reset both text buffers on state entry, and round the sim clock. Prove it by running twice '
            + 'and diffing readings.json — never assume determinism.',
        probe_type: 'js_eval',
        probe_logic:
            'npm run numeric:calc -- <id> twice, then diff the two .calc_runs/<id>/<ts>/readings.json files: '
            + 'they must be byte-identical. Verified on capacitance (field_3d), combination_of_resistors '
            + '(particle_field) and vector_head_to_tail (parametric).',
        status: 'FIXED',
        concepts_affected: ['combination_of_resistors', 'capacitance'],
        fixed_in_files: [H, R],
        row_type: 'probe_definition',
    },
];

(async () => {
    for (const r of rows) {
        const res = await supabaseAdmin
            .from('engine_bug_queue')
            .upsert({ ...r, discovered_in_session: S }, { onConflict: 'bug_class' });
        console.log(res.error
            ? `  x  ${r.bug_class}: ${res.error.message}`
            : `  ok ${r.severity.padEnd(8)} ${r.status.padEnd(5)} ${r.bug_class}`);
    }
})();
