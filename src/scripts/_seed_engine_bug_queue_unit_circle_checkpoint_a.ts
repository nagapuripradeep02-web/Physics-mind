/**
 * engine_bug_queue rows from founder_proxy Checkpoint A on `unit_circle_to_sine_wave`
 * — the FIRST mathematics concept (2026-08-04, MATHEMATICS_BUILD_PLAN.md Phase 3).
 *
 * Three NEW rows, all OPEN, all verified against renderer source by the main
 * session independently of the reviewer before filing:
 *
 *   1. pcpl_locus_trace_sweep_parameter_exposed_as_a_slider_collapses_the_curve
 *      CRITICAL. PM_choreoVarsAtTime merges the live slider value into EVERY
 *      historical sample of a locus_trace, and the drag-seize guard stands the
 *      choreography down — so a trace parameterised on a variable the same state
 *      exposes as a slider collapses to a point on first drag. Caught at DESIGN
 *      time, before a line of JSON was written; had it shipped, the explore state
 *      (the whole Capability-2 product claim) would have erased its own curve the
 *      first time a teacher touched it.
 *
 *   2. pcpl_no_primitive_draws_a_circle_or_arc_at_a_live_radius
 *      MAJOR. Nothing in PCPL renders a circle whose radius follows a variable,
 *      so any radius/size-scaling lesson is unbuildable on the 2D surface today.
 *      Cost a designed state (S7, "The Radius Sets the Wave Height") which the
 *      founder cut from v1.0 on 2026-08-04 rather than spend a fleet-wide
 *      primitive change mid-desk. THIS ROW IS THE QUEUED PLATFORM ITEM for
 *      body.size_expr — its prevention_rule carries the full implementation spec
 *      so the desk that picks it up executes instead of re-deriving.
 *
 *   3. skeleton_discharges_a_ring_cut_with_a_field_no_renderer_reads
 *      MAJOR. A Rule-38 coherent-when-cut verdict was discharged by `min_ring`,
 *      which no renderer reads and no preset builder consumes — converting a real
 *      38b failure into a paper pass (patterns/mathematics.md §4 hazard 3).
 *
 * Plus TWO recurrence updates (concepts_affected only — every other field on
 * those rows is left byte-untouched, since an upsert would clobber the original
 * incident's evidence):
 *   - skeleton_anchor_specified_in_section_9_reaches_no_narration_line
 *   - archetype_live_tier_unverified_against_renderer
 *
 * subject='subject_neutral' on all three deliberately: every lesson binds physics
 * and chemistry PCPL concepts identically, and none of them is about mathematics
 * content. (It also sidesteps the not-yet-applied 'mathematics' subject CHECK in
 * supabase_2026-08-04_engine_bug_queue_mathematics_subject_migration.sql.)
 *
 * Filed via a seed script rather than `npm run log:lesson` because that tool
 * cannot express these rows — see the DEFECT note at the bottom of this file.
 *
 * Idempotent: upsert onConflict 'bug_class'. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_unit_circle_checkpoint_a.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'founder_proxy checkpoint A, unit_circle_to_sine_wave, 2026-08-04';
const RENDERER = 'src/lib/renderers/parametric_renderer.ts';
const CONCEPT = 'unit_circle_to_sine_wave';

type Owner = 'alex:architect' | 'peter_parker:renderer_primitives';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';

interface Row {
    bug_class: string;
    title: string;
    severity: Severity;
    owner_cluster: Owner;
    subject: string;
    root_cause: string;
    prevention_rule: string;
    probe_type: 'js_eval';
    probe_logic: string;
    status: 'OPEN';
    concepts_affected: string[];
    fixed_in_files: string[];
    discovered_in_session: string;
    row_type: 'incident';
}

const rows: Row[] = [
    {
        bug_class: 'pcpl_locus_trace_sweep_parameter_exposed_as_a_slider_collapses_the_curve',
        title: 'A locus_trace parameterised on a variable the same state exposes as a slider collapses to a point on first drag',
        severity: 'CRITICAL',
        owner_cluster: 'alex:architect',
        subject: 'subject_neutral',
        root_cause:
            'PM_choreoVarsAtTime (parametric_renderer.ts:2318-2331) builds the variable scope for EVERY historical sample of a locus_trace. It first merges the live slider value for any variable the state authors as a slider (:2321-2325), then runs variable_choreography — but SKIPS any variable the teacher has seized (:2329, PM_userTouched, set on drag at :3102 and seeded at :3046). So once the teacher drags a slider whose variable also parameterises the trace, all N samples evaluate at that single value: drawLocusTrace (:2385-2404) resamples from scratch each frame, every sample returns the same point, and it draws zero-length segments. The curve vanishes. If the variable is a slider and NEVER choreographed, it is constant from the start and the curve never draws at all. Both failure modes are invisible to every static gate: the JSON is well-formed, the validator passes, tsc passes, and THE EYE photographs a state nobody has dragged. Caught at DESIGN time on unit_circle_to_sine_wave, whose explore state was specified with theta as both the trace parameter and the teacher-facing slider — the state carrying the concept\'s entire Capability-2 claim.',
        prevention_rule:
            'A locus_trace is parameterised on a DEDICATED sweep variable that is never authored as a slider in any state of the concept (e.g. phi), choreographed as a pure function of the state clock. Teacher-facing sliders drive markers, segments, arrows and readouts through the live expression path (drawVector from_expr/to_expr, body position_expr, PM_interpolate) — NEVER the trace parameter. Where a guided state must show the marker and the curve agreeing, choreograph both variables on the same profile so they coincide at every instant; where the teacher scrubs (explore, or any state exposing that slider), let the sweep variable run its own authored sweep so the curve stays complete under the drag. The skeleton states, per state, which variable each trace is parameterised on.',
        probe_type: 'js_eval',
        probe_logic:
            'Static: for each state, intersect the set of scene_composition slider variables with the identifiers appearing in every locus_trace x_expr/y_expr; assert the intersection is EMPTY. Dynamic: post a trusted drag to every slider the explore state exposes and assert the traced polyline bounding box stays within 10 percent of its pre-drag extent (a collapse takes it to ~0).',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: [],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'pcpl_no_primitive_draws_a_circle_or_arc_at_a_live_radius',
        title: 'PCPL cannot render a circle or arc whose radius responds to a variable, so any radius/size-scaling lesson is unbuildable',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            'drawBody reads a circle body\'s size as a literal number at every call site (parametric_renderer.ts:1427 the isCircle guard, :1501, :1514, :1553) and drawAngleArc reads radius the same way (:2588). grep size_expr over the whole 4050-line file returns ZERO hits. The asymmetry is the trap: a body\'s POSITION is expression-driven (position_expr, :1218-1222, evaluated against PM_liveExprVars() with a non-finite fallback to the authored value, added so the bohr electron could ride between energy rungs) — so an author reasonably assumes size is too. It is not. The two workarounds both fail: drawing the circle as a locus_trace under a ramping radius reproduces field3d_orbit_spiral_on_radius_ramp (CRITICAL/FIXED) because the trace accumulates history and yields a spiral, not a circle; and scaling only the radius VECTOR via to_expr leaves a shrinking radius inside a fixed outline, which is worse than showing nothing. Cost the designed state S7 ("The Radius Sets the Wave Height") on unit_circle_to_sine_wave, cut from v1.0 by founder decision 2026-08-04 rather than spend a fleet-wide primitive change mid-desk.',
        prevention_rule:
            'DESIGN SIDE: before designing any state whose lesson is a size, radius or amplitude CHANGE, verify a primitive exists that redraws the complete shape each frame at the CURRENT value about a fixed origin. On PCPL today none does — treat radius-scaling as NEEDS-SCENARIO, not [LIVE]. ENGINE SIDE (the queued platform item, founder-approved 2026-08-04 as a separate desk): add body.size_expr to parametric_renderer.ts modelled line-for-line on position_expr at :1218-1222 — same PM_liveExprVars() scope so a size binding and a text binding in one state can never disagree, same opt-in last-resort precedence (a surface attachment or the Engine 20 motion integrator still wins), same non-finite-eval fallback to the authored literal so a malformed expression degrades to today\'s behaviour rather than vanishing. Resolve it ONCE near the top of drawBody and feed the existing bw/bh derivation at :1432-1437 so every shape (circle, rect w/h, stickman, pulley, tree, door) inherits it instead of patching the four circle call sites. Mirror it onto drawAngleArc\'s radius (:2588). Lands on master separately per Rule 40, with check:renderer-syntax + check:renderer-backticks and a THE EYE re-verify across the shipped PCPL fleet (vector_head_to_tail, scalar_vs_vector, bohr_model_energy_levels at minimum) to prove no regression. Unlocks the whole radius-responds-to-a-slider family: conic_sections_as_loci (ranked-list P2 #7) needs exactly this to morph a conic.',
        probe_type: 'js_eval',
        probe_logic:
            'For every state whose delta cue or narration names a size, radius or amplitude change: drive the authored beat end to end and assert the rendered pixel extent of the named apparatus element changes monotonically with the driving variable. FAIL if only overlay text, a HUD value or a second curve changes while the apparatus extent is byte-constant.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: [],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'skeleton_discharges_a_ring_cut_with_a_field_no_renderer_reads',
        title: 'A Rule-38 coherent-when-cut verdict was discharged by min_ring, which no renderer reads and no preset builder consumes',
        severity: 'MAJOR',
        owner_cluster: 'alex:architect',
        subject: 'subject_neutral',
        root_cause:
            'min_ring occurs in src/ only at field_3d_renderer.ts:55484-55492 (bonding-scene control-list normalisation) and check_bonding_scene.ts:1004-1007. It is absent from parametric_renderer.ts and from src/schemas/conceptJson.ts. Even in field_3d it is inert at runtime — the code comment at :55485 says it is "recorded for the Rule-38h preset builder", and no preset builder exists in build_review_site.ts or pilot_site_assets.ts, so no preset hides any state or any control anywhere in the shipped product today. The unit_circle_to_sine_wave skeleton used it to dissolve the Rule-31c ("explore exposes ALL controls") versus Rule-38b ("explore surfaces CORE-ring content only") tension, asserting the explore state exposes "ALL controls whose teaching ring is visible". That converted a real 38b failure — an extended-ring control surviving into a core_only preset that teaches nothing about it — into a paper pass, which is patterns/mathematics.md §4 hazard 3 (an authored field that no-ops) applied to a GATE VERDICT rather than to a visual.',
        prevention_rule:
            'A ring cut is discharged by RING ASSIGNMENT, never by a field: every control the explore state exposes must map to a guided state whose depth_ring survives the cut, with no hiding mechanism assumed anywhere. If a control cannot satisfy that, the fix is to re-ring or to CUT the control, not to tag it. And generally: before citing ANY authored field as a mechanism in a gate verdict, grep the TARGET renderer and the schema for it and quote the reader function by file:line — presence in a sibling renderer is not presence in yours, and a field read only into a variable that is never consumed is not a mechanism at all.',
        probe_type: 'js_eval',
        probe_logic:
            'For each authored preset cut, assert every control id in the explore state maps to a guided state whose depth_ring survives that cut. Independently: for every field a skeleton names as a mechanism, assert the string appears in the target renderer as a READ (an assignment from spec.<field> that reaches a draw call), not only inside a comment.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: [],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
];

// ── Checkpoint A CYCLE 1 (round-2 review) — two further rows ────────────────
// Both were made visible by the per-state timing table the round-1 amendment
// added: the design was not newly broken, it was newly LEGIBLE. Recorded because
// that is itself the reusable lesson — a timing table is a defect detector, not
// paperwork.
rows.push(
    {
        bug_class: 'correspondence_state_stages_cause_first_as_a_head_start_so_the_equal_quantities_are_drawn_unequal',
        title: 'A state claiming two quantities are equal satisfies cause-before-effect by starting one driver early, so the equality it teaches is drawn false for the rest of the state',
        severity: 'MAJOR',
        owner_cluster: 'alex:architect',
        subject: 'subject_neutral',
        root_cause:
            'Rule 32a asks the cause to move a readable beat before the effect. Where a state claims the two quantities ARE equal, any temporal stagger between their drivers renders the claim false at every instant after the stagger. PM_choreoValue returns the from-value for tMs < start_ms (parametric_renderer.ts:1110, verified), so authoring a later start_ms on the second driver is an ANGULAR HEAD START, not a reveal delay — the two elements are then permanently offset. On unit_circle_to_sine_wave S4 (the PRIMARY-AHA state) the two readings were: theta shares phi\'s profile, so the point does not sweep for the first 2.5s and the aha state opens with nothing moving; or theta runs its own profile, so the carrier joins two DIFFERENT heights for the remaining 17.5s while the narration says they are equal. The concept had already stated the correct principle about a teacher SCRUB ("point and pen at different angles would render the equality false while narrating it true") and simply had not applied it to its own choreography.',
        prevention_rule:
            'In a state whose claim is an equality or a correspondence, Rule 32a is satisfied by REVEAL ORDER (the new element appears first, both drivers held) and NEVER by staggering the drivers of the two equated quantities. The timing table carries a driver-profile column per state and per sub-beat, and declares explicitly that the equated parameters share one profile with no jumps. Corollary worth keeping: a per-state timing table with sub-beat boundaries is a DEFECT DETECTOR — both P1s on this concept were invisible until it existed, so require it on any state carrying a misconception_watch or a correspondence claim.',
        probe_type: 'js_eval',
        probe_logic:
            'For every state rendering a connector between two elements the design declares equal: sample the two driving variables at 100 ms intervals across the whole state and assert they are equal at every sample. Independently assert the connector is axis-parallel wherever the design says the quantities match (for a horizontal carrier, |y_from - y_to| <= 1 px).',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: [],
        discovered_in_session: `${SESSION} (cycle 1)`,
        row_type: 'incident',
    },
    {
        bug_class: 'formula_surface_states_an_identity_in_a_unit_the_hud_never_renders',
        title: 'The equation surface asserts s = theta while the only readout of theta is in degrees, so the state renders its own identity false by a factor of 57.3',
        severity: 'MAJOR',
        owner_cluster: 'alex:architect',
        subject: 'subject_neutral',
        root_cause:
            'A curriculum-dialect decision taken globally in the Rule-38 block ("the HUD always shows theta in degrees", chosen so IGCSE 0580 readers stay in their own dialect) was never diffed against the per-state formula surfaces — one of which, on the state that OWNS radian measure, asserts s = theta (r = 1), an identity that holds only in radians. At the authored pin the canvas would have read "s = theta (r = 1)" above a HUD showing s = 4.00 and theta = 229 degrees. This is the two-instruments-disagree hazard (patterns/mathematics.md §4 hazard 4) reaching the formula surface rather than a second readout, and it also left every later state reading a radian axis (pi/2, pi, 3pi/2) against a degrees-only HUD.',
        prevention_rule:
            'Diff every formula surface against the HUD metric of every symbol it names: if a surface asserts an identity, the readout that would VERIFY it must be rendered in the unit the identity holds in. Where a genuine board-dialect split exists (Rule 38e), a dual-dialect readout carries BOTH units at fixed precision - primary reading first, the other parenthesised - rather than choosing one globally and letting a state contradict it.',
        probe_type: 'js_eval',
        probe_logic:
            'For each state: parse the symbols on the formula surface, read the HUD entry for each, and assert the surface identity evaluates true on the RENDERED numbers to the declared precision. Fail on any identity whose symbols are rendered in a unit it does not hold in.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: [],
        discovered_in_session: `${SESSION} (cycle 1)`,
        row_type: 'incident',
    },
);

// Recurrences: append the concept to concepts_affected and touch NOTHING else.
// An upsert here would clobber the original incident's root_cause and evidence,
// which is the whole value of the row.
//
// named_primitive_declared_without_the_surface_that_can_render_it is the cycle-1
// F20 finding: §3 said the rim arc "thickens", but drawAngleArc hardcodes
// strokeWeight(1.5) (:2641) and exposes no stroke-weight field. Correctly a
// recurrence of the existing class rather than a new bug_class — the reviewer
// checked the queue before minting one, which is the schema discipline working.
const RECURRENCES = [
    'skeleton_anchor_specified_in_section_9_reaches_no_narration_line',
    'archetype_live_tier_unverified_against_renderer',
    'named_primitive_declared_without_the_surface_that_can_render_it',
];

async function main(): Promise<void> {
    for (const row of rows) {
        const { error } = await supabaseAdmin
            .from('engine_bug_queue')
            .upsert(row, { onConflict: 'bug_class' });
        if (error) throw new Error(`upsert ${row.bug_class} failed: ${error.message}`);
        console.log(`✅ ${row.status.padEnd(5)} ${row.severity.padEnd(8)} ${row.bug_class}`);
    }

    for (const bugClass of RECURRENCES) {
        const { data, error } = await supabaseAdmin
            .from('engine_bug_queue')
            .select('bug_class, concepts_affected')
            .eq('bug_class', bugClass)
            .maybeSingle<{ bug_class: string; concepts_affected: string[] | null }>();
        if (error) throw new Error(`read ${bugClass} failed: ${error.message}`);
        if (!data) {
            console.log(`⚠️  recurrence target not found, skipped: ${bugClass}`);
            continue;
        }
        const current = data.concepts_affected ?? [];
        if (current.includes(CONCEPT)) {
            console.log(`•  already recorded: ${bugClass}`);
            continue;
        }
        const { error: upErr } = await supabaseAdmin
            .from('engine_bug_queue')
            .update({ concepts_affected: [...current, CONCEPT] })
            .eq('bug_class', bugClass);
        if (upErr) throw new Error(`update ${bugClass} failed: ${upErr.message}`);
        console.log(`↻  recurrence recorded on ${bugClass} (${current.length} → ${current.length + 1} concepts)`);
    }

    console.log(`\nDone. ${rows.length} rows upserted + ${RECURRENCES.length} recurrence targets checked.`);
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});

/**
 * DEFECT NOTE — `npm run log:lesson` cannot file these rows (found 2026-08-04).
 *
 * src/scripts/log_lesson.ts is the DOCUMENTED intake for exactly this artifact
 * (AUTHORING_PIPELINE.md §"Logging a professor lesson"), but three of its local
 * constants have drifted from the live table:
 *
 *   1. VALID_ROW_TYPES = ['directive', 'bug'].  The table's actual row_type
 *      values are incident (540 rows), probe_definition (53) and directive (83).
 *      'bug' appears ZERO times. So the tool cannot file an incident at all, and
 *      its only non-directive option writes a value nothing else in the system
 *      reads.
 *   2. VALID_OWNERS omits 'alex:mathematics_author', added to the DB CHECK and
 *      both admin enums by MATHEMATICS_BUILD_PLAN.md Phase 2. Mathematics cannot
 *      file a row against its own author role through the documented tool.
 *   3. It never sets `subject`, so every row it files is subject-NULL on a column
 *      the mathematics_author spec's own pre-authoring query filters on
 *      (`WHERE subject IN ('mathematics','subject_neutral')`) — such a row is
 *      invisible to the agent that most needs it.
 *
 * This is the same class the mathematics subject migration was written to
 * pre-empt, inverted: there the DB lagged the UI, here the tooling lags the DB.
 * Not fixed in this file — log_lesson.ts is shared tooling and out of scope for
 * a concept desk. Reported to the founder 2026-08-04.
 */
