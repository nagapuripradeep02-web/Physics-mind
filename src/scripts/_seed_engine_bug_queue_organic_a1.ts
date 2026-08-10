/**
 * engine_bug_queue — organic dispatch A1 (`organic_structure_torsion`) scar harvest (2026-08-10).
 *
 * SEVEN rows: six from the field3d-surgeon A1 build (the driven dihedral), plus
 * one filed by the dispatching session about the queue's own discoverability.
 *
 * THREE NORMALISATIONS applied to the surgeon's emitted SQL, recorded here so the
 * deviation is visible rather than silent:
 *   1. status 'closed' -> 'FIXED'. 'closed' is not a member of the status enum
 *      (OPEN | FIXED | DEFERRED | NOT_REPRODUCING | FALSE_POSITIVE) and would
 *      have failed the column's check constraint.
 *   2. concepts_affected ['organic_structure'] -> the CONCEPT ids the row bears on.
 *      The scenario name is not a concept id, and tagging by scenario is exactly
 *      the mistake row 7 below records.
 *   3. the planning-doc row was routed to alex:physics_author; this is a chemistry
 *      concept and the doc is an architect artifact, so it routes to alex:architect.
 *
 * Row 7 is the session's own: the surgeon consulted the queue with two reasonable
 * probes, got 0 rows from both, and concluded the 23 seeded rows had never been
 * applied. They had. Both probes were mis-targeted, and the next organic dispatch
 * would have made the same query and drawn the same wrong conclusion.
 *
 * Idempotent: upsert onConflict 'bug_class'.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_organic_a1.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'organic-a1-torsion-2026-08-10';

type Owner = 'alex:architect' | 'alex:chemistry_author' | 'alex:json_author'
  | 'peter_parker:field3d_surgeon' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'probe_definition' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const R = 'src/lib/renderers/field_3d_renderer.ts';
const G = 'src/scripts/check_organic_structure.ts';
const ETH_BUT = ['conformations_of_ethane', 'conformations_of_butane'];
const ALL3 = ['conformations_of_ethane', 'conformations_of_butane', 'cyclohexane_chair_flip'];

const rows: Row[] = [
  {
    bug_class: 'scheduled_field_named_bare_at_ms_inside_a_config_object_is_invisible_to_the_frozen_pin_evaluator',
    title: 'A timed key spelled at_ms/ramp_ms inside an object pins every frozen frame at DEFAULT_REVEAL_MS mid-motion',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      "deriveStateMeta's generic timed-key sweep pairs <stem>_at_ms with <stem>_ramp_ms and only honours a BARE at_ms inside an ARRAY leg (\"at_ms\".endsWith(\"_at_ms\") is false). A scheduled field written bare inside a nested config OBJECT therefore contributes no pin candidate at all: the state silently pins at DEFAULT_REVEAL_MS = 1500 and every frozen baseline photographs a half-finished motion that no concept JSON can fix.",
    prevention_rule:
      'A scheduled field inside a config OBJECT is STEMMED (phi_at_ms/phi_ramp_ms, reveal_at_ms/reveal_ramp_ms); a bare at_ms is legal ONLY inside an array leg. Avoiding the trap by convention is not enough — the bare spelling is registered in a misnamed-field map and REJECTED LOUDLY at apply, so a later author copying an older contract draft cannot re-author it. The gate proves BOTH halves deliberately: a negative control confirms the bare key really does pin at 1500, and a second assertion confirms the same state is rejected.',
    probe_type: 'js_eval',
    probe_logic:
      'deriveMaxRevealTimeMs over a state whose block nests {at_ms, ramp_ms} in an OBJECT must return DEFAULT_REVEAL_MS (the trap is real), and applying that same state must push a rejection naming the stemmed replacement. The stemmed spelling must pin at at_ms + ramp_ms + cushion.',
    status: 'FIXED', concepts_affected: ALL3, fixed_in_files: [R, G], row_type: 'directive',
  },
  {
    bug_class: 'live_slider_handle_written_from_the_unwrapped_driven_scalar_clamps_at_the_controls_maximum',
    title: 'A force-shown slider tracking a driven coordinate sticks at its maximum whenever the sweep runs past the control range',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      "A Rule-39b live slider row was written each frame from the DRIVEN scalar rather than from the MEASURED quantity. A torsion authored 180 -> 540 (a legal full turn) writes 540 into a 0..360 range input; the browser clamps it, so the handle pins at its maximum for the entire second half of the turn while the molecule keeps rotating. The handle and the HUD then print two different numbers for one coordinate.",
    prevention_rule:
      "A live handle is written from the MEASURED, range-normalised quantity the HUD publishes — never from the driver's raw scalar. One coordinate, one number, on the handle and in the readout. Write DOM-only (no input event) so the isTrusted drag-seize is never tripped by the engine itself.",
    probe_type: 'js_eval',
    probe_logic:
      'Drive the coordinate past the control max (e.g. a 180 -> 540 sweep on a 0..360 slider), step to mid-overshoot, and assert the slider value is strictly inside [min, max) AND equals the value the HUD prints for the same instant.',
    status: 'FIXED', concepts_affected: ETH_BUT, fixed_in_files: [R, G], row_type: 'incident',
  },
  {
    bug_class: 'periodic_motion_rewind_probe_samples_two_instants_an_integer_number_of_periods_apart',
    title: 'A determinism probe that samples one whole period apart passes on a frozen scene',
    severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'The rewind standard (pin A -> advance to B -> pin back to A) needs A and B to be genuinely different phases. On a wrapping free-run at 30 deg/s, t = 4 s and t = 40 s are exactly three whole turns apart, so the two angles coincide: the probe asserted "still moving" and passed, and would have passed identically on a molecule that had stopped dead.',
    prevention_rule:
      'A rewind/motion probe over a PERIODIC quantity asserts the two sampled instants actually differ, and the sample pair is chosen coprime with the period (or the difference is asserted non-zero before the equality is asserted). Never report "moves + rewinds" from an equality test alone.',
    probe_type: 'js_eval',
    probe_logic:
      'For any periodic driver: assert value(tA) !== value(tB) AND value(tA) === value(tA replayed). A probe that only asserts the second clause is incomplete and must be flagged.',
    status: 'FIXED', concepts_affected: ETH_BUT, fixed_in_files: [G], row_type: 'probe_definition',
  },
  {
    bug_class: 'derived_extremum_span_printed_as_the_named_quantity_a_textbook_reserves_for_a_different_stationary_point',
    title: 'An energy instrument printing hi minus lo as "barrier" names the wrong barrier on any curve with three or more maxima',
    severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      "orgEnergyRange returns barrier = hi - lo, which is correct only where the curve's global span IS the quantity the subject names. On butane that span is 19 kJ/mol — the anti->syn maximum — while the interconversion barrier a textbook quotes for butane is 16 (12.2 from gauche). Printed bare as \"barrier = 19\" on the HUD and on the graph bracket, a teacher reads the rotation barrier and is wrong by 3 kJ/mol.",
    prevention_rule:
      "A derived span is printed with the row's OWN name for what it spans. The published-value registry carries an optional label per row; rows whose global span is unambiguous keep the bare default, rows where it is not MUST name it, and EVERY surface that prints the number prints the name (HUD line and canvas bracket alike — a canvas string is invisible to a DOM probe, so it needs its own assertion).",
    probe_type: 'js_eval',
    probe_logic:
      'For every registry row with three or more maxima, assert the rendered barrier string is not the bare word "barrier"; capture the canvas fillText calls and assert the bracket carries the same label as the HUD line.',
    status: 'FIXED', concepts_affected: ETH_BUT, fixed_in_files: [R, G], row_type: 'incident',
  },
  {
    bug_class: 'config_field_parsed_but_never_consumed_renders_a_silent_no_op_instead_of_a_loud_rejection',
    title: 'An authored field the renderer reads nowhere degrades a state to a default scene with no signal at all',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      "organic_structure's contract declared torsion.about, but the geometry pass drove the molecule's table-level torsion_bond and never read it: a state naming the wrong bond rotated the right one and published a number that did not come from the bond it claimed. The same hole let a torsion block be authored on a molecule declaring no torsion_bond at all (cyclohexane, methane, ethene), where every torsion field is a guaranteed no-op. Both are the deferred-enum scar one authoring level down: accepted, ignored, invisible.",
    prevention_rule:
      'A dispatch that takes ownership of a config sub-block audits EVERY field in it for a live consumer. A field with no consumer is either implemented, registered in the deferred-field map with a named owning dispatch, or REJECTED LOUDLY at apply — never parsed and dropped. A redundant declaration is checked for agreement with the value that actually drives (about must equal torsion_bond), not merely tolerated.',
    probe_type: 'js_eval',
    probe_logic:
      'Apply a state authoring each field of the sub-block with a value the renderer cannot honour; assert PM_<prefix>Rejects is non-empty for each, and assert the honest block yields zero rejections (the probe must not be indiscriminate).',
    status: 'FIXED', concepts_affected: ALL3, fixed_in_files: [R, G], row_type: 'incident',
  },
  {
    bug_class: 'planning_doc_counts_degenerate_enantiomeric_minima_as_distinct_conformations',
    title: "A design artifact counting butane's gauche pair twice specifies a curve the chemistry does not have",
    severity: 'MODERATE', owner_cluster: 'alex:architect',
    root_cause:
      'ORGANIC_PHASE0_CONFORMATION.md:33 specified butane E(phi) as having "four minima". It has THREE: gauche+ and gauche- are a degenerate enantiomeric pair — one literature value (3.8 kJ/mol) appearing twice on a 0-360 sweep. Three minima, three maxima, FOUR distinct conformations. A skeleton budgeting states or an instrument counting stationary points off that line would teach a fourth minimum that does not exist.',
    prevention_rule:
      'Count MINIMA and count CONFORMATIONS as separate numbers in any energy-curve spec, and state which is which. A symmetric coordinate makes degenerate points reappear; the published-value table lists them once per appearance, so a naive count of table rows over-reports. Related: the drawn knots at 60/300 are the authored positions — the real gauche minimum sits ~5 degrees outward, below the drawn curve resolution, so nothing may assert 60.0 degrees as the MEASURED gauche angle.',
    probe_type: 'js_eval',
    probe_logic:
      'For each registry row, count distinct interior minima, distinct interior maxima and distinct conformer LABELS separately, and assert every doc/comment claim about the curve matches the count it actually names. Assert no source string presents an authored knot position as a measured angle.',
    status: 'FIXED', concepts_affected: ETH_BUT,
    fixed_in_files: ['docs/ORGANIC_PHASE0_CONFORMATION.md', 'docs/concepts/chemistry/cyclohexane_chair_flip_skeleton.md', G],
    row_type: 'incident',
  },
  // ── filed by the dispatching session, not by the surgeon ──────────────────
  {
    bug_class: 'engine_bug_queue_consulted_by_scenario_name_returns_zero_because_rows_are_tagged_by_concept_id',
    title: 'A surgeon consulted the queue with two reasonable probes, got 0 rows from both, and concluded 23 seeded rows had never been applied',
    severity: 'MAJOR', owner_cluster: 'ambiguous',
    root_cause:
      "concepts_affected is populated with CONCEPT ids (cyclohexane_chair_flip, conformations_of_ethane). A surgeon building a SCENARIO naturally queries by the scenario name (concepts_affected @> {organic_structure}) and by substring (bug_class ILIKE %organic%). Both return 0 against 23 rows that exist and constrain the dispatch directly: no bug_class among them contains the substring organic, and none is tagged with the scenario name. The agent then reported the seeds had never run and worked from the seed SCRIPTS on disk instead — which happened to be adequate only because those scripts were committed. Had the rows been seeded from a script that was never committed, the consultation would have silently found nothing.",
    prevention_rule:
      'A scenario-scoped dispatch is given the exact query that finds its rows, in the dispatch prompt, rather than being left to guess the tagging convention. Complementarily: rows arising from a named scenario build carry the scenario_type in concepts_affected ALONGSIDE the concept ids, so both the concept-first and the scenario-first probe succeed. An agent reporting an empty queue must state the query it ran, so a wrong probe is distinguishable from an empty table.',
    probe_type: 'sql',
    probe_logic:
      "For each live scenario_type, assert that a query of the form concepts_affected @> ARRAY[<scenario_type>] returns a non-zero count whenever rows exist whose fixed_in_files reference that scenario's renderer block. Report the delta between the concept-first and scenario-first counts.",
    status: 'OPEN', concepts_affected: ALL3, fixed_in_files: [], row_type: 'directive',
  },
];

async function main() {
  const now = new Date().toISOString();
  const payload = rows.map((r) => ({
    ...r, discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? now : null,
  }));
  const { error } = await supabaseAdmin
    .from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ upserted ${payload.length} engine_bug_queue row(s)`);
  for (const r of rows) console.log(`  · [${r.severity}/${r.status}] ${r.bug_class} (${r.owner_cluster})`);
}

main();
