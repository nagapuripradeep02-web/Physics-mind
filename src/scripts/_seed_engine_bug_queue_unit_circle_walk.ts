/**
 * engine_bug_queue rows from the eye_walker + quality_auditor pass on
 * `unit_circle_to_sine_wave` — the first mathematics concept (2026-08-05).
 *
 * Third seed script on this concept, and the split is deliberate:
 *   _checkpoint_a.ts  — found at DESIGN time, before any JSON existed
 *   _build_gate.ts    — found by measuring THE EYE's own frames
 *   _walk.ts (this)   — found by the eye_walker frame read + the auditor
 *
 * Six rows. Three are renderer gaps that no authored JSON can work around;
 * three are authoring classes with a cheap permanent probe.
 *
 * subject='subject_neutral' throughout — every one binds physics and chemistry
 * PCPL concepts identically and none is about mathematics CONTENT.
 *
 * Plus ONE recurrence (concepts_affected only, all other fields untouched):
 *   - frozen_pin_unbudgeted_on_a_sequential_misconception_state_can_archive_the_wrong_picture
 *
 * Idempotent: upsert onConflict 'bug_class'. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_unit_circle_walk.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'eye_walker + quality_auditor, unit_circle_to_sine_wave, 2026-08-05';
const CONCEPT = 'unit_circle_to_sine_wave';

type Owner =
    | 'alex:json_author'
    | 'peter_parker:renderer_primitives'
    | 'peter_parker:visual_validator'
    | 'ambiguous';

interface Row {
    bug_class: string;
    title: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
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

const RECURRENCES = [
    'frozen_pin_unbudgeted_on_a_sequential_misconception_state_can_archive_the_wrong_picture',
];

const rows: Row[] = [
    {
        bug_class: 'pcpl_vector_and_angle_arc_ignore_appear_at_ms_so_authored_reveal_chains_no_op',
        title:
            'appear_at_ms / animate_in_ms gate a body but are ignored on vector and angle_arc, so a reveal-build beat half-fires and pre-spoils its own reveal',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            'PM_animationGate (parametric_renderer.ts:771) is the shared appear/disappear/fade bracket. drawBody (:1217), drawLabel (:1678), drawAnnotation (:1718), drawSurface (:1783), drawForceArrow (:1882), drawLocusTrace (:2409) and drawFormulaBox (:2774) all call it. drawVector (:2235-2318) and drawAngleArc (:2611-2718) do NOT — verified by scanning both ranges for the symbol and getting zero hits. So authoring appear_at_ms on a vector or an arc is silently inert: the primitive draws from frame 0 regardless. The failure is worse than "the timing is off", because a reveal chain that gates its BODY correctly and its VECTORS not at all renders a half-built scene — on unit_circle_to_sine_wave STATE_7 the mirror radius, the mirror height segment and the arc carrying the on-canvas symbol "π − θ" were all authored at appear_at_ms 2400 and all appeared at t=0, while the mirror POINT (a body) correctly waited. For 2.4 s the student sees a green radius and a green height segment with no point at either end, the state\'s declared reveal-build archetype never happens, and the symbol π − θ is pre-spoiled before the state defines it (scar teach_do_not_prespoil_a_later_reveal). Same cause put STATE_6\'s 5π/2 axis tick on screen from t=0 while its paired label, a label primitive, correctly waited until 12000 ms — a tick with no label for twelve seconds, sitting beyond the end of the axis.',
        prevention_rule:
            'AUTHORING SIDE until fixed: do not author appear_at_ms / animate_in_ms on a vector or an angle_arc and do not design a reveal chain that depends on one. If a timed reveal is essential, drive it from a choreographed variable the primitive\'s own expression consumes (a vector whose to_expr collapses onto its from point is invisible), or gate it on a body. ENGINE SIDE: add `var gate = PM_animationGate(spec); if (!gate.visible) return;` to drawVector and drawAngleArc and multiply their stroke alpha by gate.alpha, exactly as drawLocusTrace does at :2409. Bundle with the missing PM_focalEmphasis channel on drawVector (pcpl_drawvector_has_no_focal_glow_channel) — both are the same omission, the standard primitive brackets, and both should land in one Rule-40 platform commit with check:renderer-syntax and a THE EYE fleet re-verify, since vectors appear on nearly every parametric concept and this will move pixels fleet-wide.',
        probe_type: 'js_eval',
        probe_logic:
            'Static: assert every draw<Primitive> function in parametric_renderer.ts that renders a visible mark opens with a PM_animationGate call. Authoring-side: for every scene_composition primitive carrying appear_at_ms / animate_in_ms / disappear_at_ms, assert its type maps to a draw function that consumes the gate; FAIL naming any type/field pair that is silently inert. Dynamic: capture a frame at t=0 and assert every primitive whose appear_at_ms > 0 is absent from it.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: [],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'pcpl_glow_focus_renders_a_halo_before_its_target_body_has_appeared',
        title:
            'glow_focus consults its OWN gate but never its target\'s, so a halo paints in empty canvas while the body it emphasises is still un-drawn',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            'drawGlowFocus (premium_primitives.ts:178-region) runs PM_animationGate on the glow spec itself, then resolves the target through PM_resolvePrimitiveCenter. It never asks whether the TARGET is currently visible. A body that has not yet reached its appear_at_ms has not drawn, so it is absent from PM_bodyRegistry; resolution falls through to the scene scan, which finds the primitive by id and returns its authored literal `position` — a coordinate that is correct only as a degradation fallback and is nowhere near where the body will actually appear. The halo therefore renders as a coloured blob in dead space, drawing the eye to nothing, and Rule 32e ("exactly ONE glow focal at any instant") is violated by an element that is not there. Observed on unit_circle_to_sine_wave: a pink halo in the empty wave zone through STATE_5 t=0-3000 while cosine_pen waits for appear_at_ms 4000, and a cyan halo far right through STATE_6 t=0-2000 while continuation_pen waits for 3000.',
        prevention_rule:
            'AUTHORING SIDE: every glow_focus carries the SAME appear_at_ms (and disappear_at_ms) as the primitive it targets — a halo may never outlive or precede its subject. ENGINE SIDE: drawGlowFocus should resolve the target primitive in the current scene and run PM_animationGate on IT as well as on itself, returning early when the target is not visible; and it should refuse to fall back to a literal `position` for a target that has not drawn, since a fallback coordinate is by definition not where the thing is.',
        probe_type: 'js_eval',
        probe_logic:
            'Static: for every glow_focus, resolve primitive_id within its state and assert glow.appear_at_ms >= target.appear_at_ms and glow.disappear_at_ms <= target.disappear_at_ms where both are present. Dynamic: at each state\'s t=0 frame, assert no glow halo is rendered whose target primitive is not itself drawn.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: ['src/data/concepts/mathematics/unit_circle_to_sine_wave.json'],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'skeleton_budgeted_frozen_pins_are_never_transcribed_into_eye_capture_ms',
        title:
            'The skeleton budgets a frozen pin per state and json_author transcribes none of them, so every H2 baseline archives the state\'s end pose instead',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        subject: 'subject_neutral',
        root_cause:
            'visual_eyes.ts:95 states that eye_capture_ms is "opt-in per state, never a default", and extractEyeCaptureMs (:199-213) reads it from epic_l_path.states.<id>.eye_capture_ms. With no value authored, the frozen capture lands on the state\'s own end-of-timeline pose. A skeleton timing table that carefully budgets a pin per state — landing it inside the CORRECT half of a misconception beat, with a margin, exactly as the architect scar frozen_pin_unbudgeted_on_a_sequential_misconception_state_can_archive_the_wrong_picture demands — therefore has no effect whatsoever unless json_author copies each pin into the JSON. On unit_circle_to_sine_wave the skeleton §12 budgeted seven pins (S1 10200, S2 12600, S3 12600, S4 12600, S5 12600, S6 11400, S7 18500) and the JSON carried exactly one, S7\'s, because that was the only one the skeleton wrote as a literal `eye_capture_ms:` field rather than as a table cell. The consequence is precisely the failure the architect row exists to prevent: STATE_3, whose entire job is that sine is a SIGNED height and goes negative, archived θ = 360° — a ZERO-LENGTH height segment and a readout of −0.00. The state\'s taught object was invisible in its own baseline, and that baseline is what every future regression diff compares against.',
        prevention_rule:
            'Every pin the skeleton timing table budgets is transcribed into the JSON as epic_l_path.states.<id>.eye_capture_ms — the table cell is a REQUIREMENT, not a note. json_author\'s per-state checklist gains one line: "pin transcribed?". Where the skeleton budgets no pin (a free-running explore state), author none, deliberately. Corollary worth keeping: a value that exists only in prose in the design document is not authored, and a downstream field that no one writes is indistinguishable from a design that never budgeted it.',
        probe_type: 'js_eval',
        probe_logic:
            'For each state the skeleton timing table names a pin for, assert the JSON carries a matching eye_capture_ms. Independently and design-document-free: for every state carrying a misconception_watch, assert the frozen frame is NOT byte-identical to the final dense frame, and assert the elements unique to the correct half of the contrast are present in it.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: ['src/data/concepts/mathematics/unit_circle_to_sine_wave.json'],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'hud_prints_negative_zero_on_a_value_only_instrument',
        title: 'toFixed on a small negative renders −0.00, a signed zero the geometry cannot show',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        subject: 'subject_neutral',
        root_cause:
            'JavaScript preserves the sign of zero, and Number.prototype.toFixed carries it through: (-1e-16).toFixed(2) === "-0.00". Any readout bound to a trigonometric or otherwise sign-changing derived value therefore prints −0.00 at exactly the angles where the quantity passes through zero — the moments a student is most likely to be looking. On unit_circle_to_sine_wave the sine readout printed −0.00 at θ = 360° in four states and the cosine readout printed −0.00 at θ = 90° in the explore state. It is worse than cosmetic on this subject: the concept spends STATE_3 teaching that the sign of the height is meaningful, so a signed zero is the one value that contradicts the lesson while looking like a rounding artifact. Compounds the already-filed ascii_minus_in_oncanvas_math_from_tofixed, which is the same toFixed output path.',
        prevention_rule:
            'Any HUD or label bound to a value that changes sign clamps below its own rendered precision before formatting: {(abs(v)<0.005?0:v).toFixed(2)} for 2 dp. Chain it ahead of the existing U+2212 replace, so the two toFixed corrections travel together. Applies to every signed derived readout on any subject, not only trigonometric ones.',
        probe_type: 'js_eval',
        probe_logic:
            'Static: for every text_expr/label containing toFixed on an identifier that any state\'s domain lets go negative, assert a zero-clamp is present. Dynamic: sweep each state\'s choreographed range and assert no rendered string ever matches /[-−]0\\.0+$|[-−]0\\.0+[^0-9]/.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: ['src/data/concepts/mathematics/unit_circle_to_sine_wave.json'],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'formula_surface_footprint_overlaps_an_authored_curve_end_label',
        title:
            'The formula box grows to fit its text, so a label authored near it is struck through by a border the author never sized',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        subject: 'subject_neutral',
        root_cause:
            'drawFormulaBox (parametric_renderer.ts:2774+) measures its own text and derives boxW = textWidth + 20, boxH = lines x 18 + 20, then draws a bordered rectangle from the authored position. The authored coordinate is therefore the box\'s CORNER, not its extent, and the extent is unknown until the glyphs are measured at render time — so an author placing a nearby label is reasoning about a point while the renderer draws a rectangle. On unit_circle_to_sine_wave the surface at (560,80) grew far enough down and right to strike through the cos θ curve-end label authored at (614,118), 38 px away; the label rendered with the border through it in two states, and in one the cosine pen\'s glow landed on top of both. The de-overlap solver does not save this: it reported "Could not register vector <id> as obstacle (unresolved geometry)" 18 times on this concept and resolved 0 primitives, because it reads only literal endpoints and every apparatus vector here is expression-driven.',
        prevention_rule:
            'Treat the formula surface as a RESERVED RECTANGLE, not a point: budget its authored position plus a worst-case extent (widest line x ~9 px per character at 14 px serif, plus 20 px padding, by number of lines) in the state layout plan, and author no other text inside that rectangle. Where a curve-end label must sit in the same corner, place it below the reserved band, not beside it. And do not rely on the de-overlap solver on a concept whose geometry is expression-driven — it cannot see those primitives at all.',
        probe_type: 'js_eval',
        probe_logic:
            'Static: for each state, estimate the formula_box rectangle from its interpolated equation text and assert no label/annotation position falls inside it. Dynamic: render each state and assert no two text primitives\' rendered bounding boxes intersect — measuring the INTERPOLATED string, not the template (the current check-layout-overlap.mjs measures the raw template and reports false positives up to 5x too wide).',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: ['src/data/concepts/mathematics/unit_circle_to_sine_wave.json'],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'eye_walker_dispatched_against_a_run_dir_a_newer_run_has_superseded',
        title:
            'A frame read against a stale .visual_runs directory reports defects already fixed, and clears none of the current build',
        severity: 'MODERATE',
        owner_cluster: 'ambiguous',
        subject: 'subject_neutral',
        root_cause:
            'npm run visual:eyes writes a NEW timestamped directory under .visual_runs/<concept>/ on every run and never prunes. A walker dispatched with an explicit path — or one that picks a directory by name rather than by recency — reads whatever was current when the dispatch was written. When a fix lands between dispatch and read, the walk describes a build that no longer exists: every finding must then be re-triaged as "already fixed" or "still live", and nothing about the current build has actually been cleared. Happened twice on unit_circle_to_sine_wave in one session, because a CRITICAL defect was found and fixed while a walker was mid-read. The failure is quiet: the report looks authoritative and its frame paths all resolve.',
        prevention_rule:
            'A walker lists .visual_runs/<concept>/ and confirms the directory it was given is the newest before reading a single frame; if it is not, it says so and walks the newest. The dispatcher states the run directory explicitly AND re-runs visual:eyes before re-dispatching after any fix — never re-dispatch a walker against frames a fix has invalidated. Cheap belt-and-braces: have visual:eyes maintain a `latest` symlink so a walk can be pinned to recency rather than to a timestamp.',
        probe_type: 'js_eval',
        probe_logic:
            'Assert the run directory being read has the greatest mtime under .visual_runs/<concept_id>/, and that its manifest.json captured_at is later than the mtime of the concept JSON it is meant to depict. FAIL a walk whose frames predate the source they are being compared against.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: [],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
];

async function main(): Promise<void> {
    console.log(`\nengine_bug_queue — seeding ${rows.length} walk row(s) for ${CONCEPT}\n`);

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

    console.log(`\nDone. ${rows.length} rows upserted + ${RECURRENCES.length} recurrence target(s) checked.`);
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
