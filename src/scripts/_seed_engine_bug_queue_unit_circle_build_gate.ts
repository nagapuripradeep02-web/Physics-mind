/**
 * engine_bug_queue rows from the BUILD gate on `unit_circle_to_sine_wave`
 * — the first mathematics concept (2026-08-05, MATHEMATICS_BUILD_PLAN.md Phase 3).
 *
 * Sibling of _seed_engine_bug_queue_unit_circle_checkpoint_a.ts, which filed the
 * DESIGN-time rows. These four were found after the JSON existed: three by
 * measuring THE EYE's own output frame by frame, one by reading the renderer to
 * explain what the frames showed.
 *
 * THE THROUGH-LINE, and the reason all four are worth a permanent row: every one
 * of them produced a FULLY GREEN run. `npx tsc --noEmit` 0 errors,
 * `npm run validate:mathematics` PASS, `npm run visual:eyes` **35 deterministic
 * checks / 35 passed / 0 failed** — over a build in which the concept's primary
 * marker body never moved in ANY of its 8 states and two focal halos rendered in
 * empty canvas. Same family as eye_reads_the_hand_seeded_cache_not_the_current_source
 * (CRITICAL/FIXED), whose lesson is recorded as: the cost of that miss is not a
 * broken run, it is a GREEN one.
 *
 *   1. pcpl_position_expr_authored_as_an_object_literal_string_pins_the_body_to_the_renderer_default
 *      CRITICAL. `position_expr` (body) and `from_expr`/`to_expr` (vector) take
 *      DIFFERENT shapes on the same renderer. Authoring the body field in the
 *      vector's shape silently pins the body at drawBody's hardcoded (200,200).
 *
 *   2. pcpl_glow_focus_cannot_resolve_an_expression_driven_vector_or_a_locus_trace
 *      MAJOR. PM_resolvePrimitiveCenter reads the LITERAL from/to of a vector and
 *      has no locus_trace branch at all, so both resolve to a hardcoded fallback
 *      point and the halo renders detached, in empty canvas.
 *
 *   3. pcpl_drawvector_has_no_focal_glow_channel
 *      MODERATE. Direct sibling of pcpl_angle_arc_no_focal_glow_channel
 *      (FIXED 2026-07-24). drawLocusTrace and drawAngleArc both got the channel
 *      in that pass; drawVector was missed and still has none.
 *
 *   4. eye_pixel_gates_pass_over_a_body_frozen_at_the_renderer_default_coordinate
 *      MAJOR. The gates aggregate motion across the canvas, so a frozen body is
 *      masked by any other element that legitimately moves.
 *
 * subject='subject_neutral' on all four, deliberately: every one binds physics and
 * chemistry PCPL concepts identically and none is about mathematics CONTENT.
 * Tagging them 'mathematics' would hide them from the physics and chemistry
 * pre-authoring queries, which is the opposite of what they are for.
 *
 * Plus ONE recurrence update (concepts_affected only — every other field left
 * byte-untouched so the original incident's evidence is never clobbered):
 *   - pcpl_slider_label_stale_under_choreography
 *
 * Idempotent: upsert onConflict 'bug_class'. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_unit_circle_build_gate.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'build gate, unit_circle_to_sine_wave, 2026-08-05';
const CONCEPT = 'unit_circle_to_sine_wave';

type Owner =
    | 'alex:json_author'
    | 'peter_parker:renderer_primitives'
    | 'peter_parker:visual_validator';

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

const RECURRENCES = ['pcpl_slider_label_stale_under_choreography'];

const rows: Row[] = [
    {
        bug_class:
            'pcpl_position_expr_authored_as_an_object_literal_string_pins_the_body_to_the_renderer_default',
        title:
            'position_expr and from_expr/to_expr take DIFFERENT shapes on the same renderer, and authoring the body form in the vector form silently pins the body at (200,200)',
        severity: 'CRITICAL',
        owner_cluster: 'alex:json_author',
        subject: 'subject_neutral',
        root_cause:
            'Two expression-driven position fields on ONE renderer are consumed by two different parsers. A vector\'s from_expr/to_expr is a single object-LITERAL STRING — "{x: <expr>, y: <expr>}" — handed whole to PM_safeEvalPoint (parametric_renderer.ts:2251-2262). A body\'s position_expr is an OBJECT whose .x and .y are SEPARATE expression strings, each passed individually to PM_safeEval (:1268-1272): `var peX = (spec.position_expr.x != null) ? PM_safeEval(String(spec.position_expr.x), peVars) : pos.x;`. Author the body field in the vector\'s shape and `spec.position_expr.x` is undefined on a String, so BOTH coordinates take the `: pos.x` / `: pos.y` branch, and `pos` is `attachedPos || spec._resolvedPosition || spec.position || { x: 200, y: 200 }` (:1250). With no literal `position` authored, every such body pins at (200,200) for the entire concept. NOTHING reports it: the JSON is well-formed, the Zod schema does not type the field, tsc passes, validate:mathematics passes, and THE EYE returns 35/35 because other elements on the canvas legitimately move. Found on unit_circle_to_sine_wave, where EIGHT bodies across all 8 states (the point on the circle, both wave pens, the continuation pen, the mirror point, the foot, and both explore tracking dots) were authored in the vector shape and every one rendered frozen at (200,200) — measured at 199.4,199.0 in the captured frames, identical centroid and identical pixel count across every frame of every state. The concept\'s entire claim is that the marker moves. The shipped precedent bohr_model_energy_levels authors the correct object shape, so the two forms have coexisted in the fleet since position_expr landed.',
        prevention_rule:
            'A body\'s position_expr is ALWAYS an object of expression strings: {"x": "<expr>", "y": "<expr>"} (either key may be omitted to keep that coordinate literal). A vector\'s from_expr/to_expr is ALWAYS one object-literal string "{x: <expr>, y: <expr>}". Never copy one shape to the other field — the mathematics block\'s §1b expression table wrote both in the same notation, which is exactly how the two got conflated. Derive both forms from ONE pair of coordinate strings at authoring time so they cannot diverge. ALSO author a literal `position` alongside every position_expr: drawBody keeps the static authored pos when an expression evaluates non-finite (:1272), so the literal is the documented graceful-degradation path and turns a silent teleport-to-(200,200) into a body that merely fails to move from its correct home pose. Engine-side follow-up worth a founder call: make drawBody warn (or refuse) when position_expr is a string rather than an object, since the current behaviour is indistinguishable from correct authoring at every gate.',
        probe_type: 'js_eval',
        probe_logic:
            'Static: for every scene_composition primitive carrying position_expr, assert typeof position_expr === "object" and that any present .x/.y are strings; FAIL on a string position_expr. Symmetrically assert from_expr/to_expr are strings, not objects. Dynamic: for each state, identify every body whose position_expr references a variable the state\'s variable_choreography moves, compute its rendered centroid in each dense frame, and assert the centroid is NOT constant across the state; additionally FAIL any body whose centroid sits within 3 px of (200,200) for the whole state.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: ['src/data/concepts/mathematics/unit_circle_to_sine_wave.json'],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'pcpl_glow_focus_cannot_resolve_an_expression_driven_vector_or_a_locus_trace',
        title:
            'glow_focus on a vector with expression endpoints, or on any locus_trace, renders its halo at a hardcoded fallback point in empty canvas',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            'drawGlowFocus resolves its target through PM_resolvePrimitiveCenter (premium_primitives.ts:71-111). That function tries PM_bodyRegistry, then PM_surfaceRegistry, then a scene scan. In the scene scan the vector branch reads the LITERAL fields only — `PM_resolveEndpoint(p.from)` and `PM_resolveEndpoint(p.to)` — and PM_resolveEndpoint (:113-122) accepts {x,y} literals, a {primitive_id}, or a string anchor, but NEVER from_expr/to_expr. A vector positioned by expression therefore has from === undefined and to === undefined, PM_resolveEndpoint returns its own fallback {x:380,y:250} for both, and the midpoint is that same fallback. There is NO locus_trace branch at all, so a trace falls through the whole scan to the terminal `return { x: 380, y: 250 }` (:110). The halo then renders as a coloured blob in the middle of the canvas, visually detached from anything, while the element it was authored to emphasise gets no emphasis whatsoever. Measured on unit_circle_to_sine_wave: glow_focus on the height segment (a vector with from_expr/to_expr) and on the rim trace (a locus_trace) both rendered centred on logical (380,250) — the exact fallback constant — with the segment 300+ px away. The same blindness has a second consumer: the de-overlap solver host reported "Could not register vector <id> as obstacle (unresolved geometry)" 18 times on this concept and resolved 0 primitives, because it too reads only literal endpoints.',
        prevention_rule:
            'AUTHORING SIDE, until this is fixed: every glow_focus.primitive_id must name a BODY. Bodies register live screen coordinates in PM_bodyRegistry as they draw, so the halo tracks for free — including a body positioned by position_expr. Where the element to emphasise is a vector or a trace, put the halo on a body at its moving end (a pen, a point, a foot marker) instead. Note that focal_primitive_id is a SEPARATE mechanism and does still work on a locus_trace or an angle_arc, because drawLocusTrace and drawAngleArc consume PM_focalEmphasis directly rather than going through the registry. ENGINE SIDE: give PM_resolvePrimitiveCenter the same expression path the renderer already has — evaluate from_expr/to_expr via PM_safeEvalPoint against PM_liveExprVars() when the literals are absent, and add a locus_trace branch that evaluates x_expr/y_expr at the current clock. Both are the identical fix the de-overlap solver host needs, so land them together and re-verify the shipped PCPL fleet through THE EYE per Rule 40.',
        probe_type: 'js_eval',
        probe_logic:
            'Static: for every glow_focus primitive, resolve primitive_id within its state and assert the target is a body, OR that the target type has a registry entry. FAIL when the target is a vector carrying from_expr/to_expr rather than literals, or a locus_trace. Dynamic: assert no glow_focus halo centroid falls within 5 px of (380,250) unless a primitive is genuinely authored there.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: [],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'pcpl_drawvector_has_no_focal_glow_channel',
        title:
            'drawVector never calls PM_focalEmphasis, so a vector can be neither brightened as the focal nor dimmed as a peer',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            'PM_focalEmphasis (parametric_renderer.ts:816-857) is the Rule-29 brightness channel: it returns {isFocal:true, alphaMul:1, glowPx:12} for the state\'s focal_primitive_id and {alphaMul:0.6, glowPx:0} for every peer. drawBody, drawLabel, drawAnnotation, drawForceArrow, drawFormulaBox, drawAngleArc and drawLocusTrace all consume it. drawVector (:2235-2318) does NOT — it has no PM_focalEmphasis call anywhere. So naming a vector as focal_primitive_id is a silent no-op for that vector: it cannot brighten, and it cannot dim when something else is focal. The net visual is that a vector holds constant brightness while every other primitive dims around it, which can accidentally read as emphasis and hide the defect. This is the direct sibling of pcpl_angle_arc_no_focal_glow_channel (FIXED 2026-07-24), whose fix pass added the channel to drawAngleArc and drawLocusTrace and missed drawVector. Surfaced on unit_circle_to_sine_wave, where two states designed the height segment (a vector) as the single glow focal.',
        prevention_rule:
            'AUTHORING SIDE: do not name a vector as focal_primitive_id — name the body at its moving end. ENGINE SIDE: add `var emph = PM_focalEmphasis(spec);` to drawVector and consume it exactly as drawAngleArc does — multiply the stroke alpha by emph.alphaMul and bracket the draw with the drawingContext.shadowColor/shadowBlur set-and-reset when emph.glowPx > 0, fetched AFTER any label text resolves so the emphasis brackets the whole primitive including its label. Trivially small and completes the 2026-07-24 pass. Land on master separately per Rule 40 with check:renderer-syntax and a THE EYE re-verify of the shipped PCPL fleet — vectors appear on nearly every parametric concept, so this changes pixels fleet-wide and will need re-baselining.',
        probe_type: 'js_eval',
        probe_logic:
            'Static: assert every draw<Primitive> function in parametric_renderer.ts that renders a visible mark calls PM_focalEmphasis. Authoring-side: assert no state\'s focal_primitive_id resolves to a primitive whose draw function lacks the channel. Dynamic: with a vector named focal, assert its rendered stroke alpha differs from the same vector rendered with a different focal declared.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: [],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'eye_pixel_gates_pass_over_a_body_frozen_at_the_renderer_default_coordinate',
        title:
            'THE EYE returned 35/35 on a build whose primary marker body never moved in any of its 8 states, because other elements moved',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:visual_validator',
        subject: 'subject_neutral',
        root_cause:
            'The deterministic pixel gates reason about motion in AGGREGATE over the canvas (D1p/D5/D6/D7 measure changed-pixel ratios against canvas- or ink-relative thresholds). They have no per-primitive expectation, so an element that is supposed to move but does not is invisible whenever anything else on the canvas moves enough to clear the thresholds. On unit_circle_to_sine_wave the traces, segments, arcs and HUD text all animated correctly while EIGHT position_expr bodies sat frozen at drawBody\'s (200,200) default in every frame of every state — and the run returned "35 deterministic checks / 35 passed / 0 failed". The defect was found only by measuring a body\'s centroid across frames by hand. This is the same family as eye_reads_the_hand_seeded_cache_not_the_current_source (CRITICAL/FIXED), whose recorded lesson is that the expensive failure is not a broken run but a GREEN one; there the pixels were stale, here they are current and simply not what the design asked for. It is also the exact complement of the recorded D6 thin-content blind spot: D6 cannot see a thin element TELEPORT, and these gates cannot see a thin element FAIL TO MOVE.',
        prevention_rule:
            'A concept declares, per state, which primitive ids are expected to MOVE (the renderer already knows: any primitive whose position_expr / from_expr / to_expr / x_expr / y_expr references a variable that state\'s variable_choreography drives, plus any slider-bound variable). THE EYE derives that set and asserts each member\'s rendered centroid actually changes across the state\'s dense frames, by more than an antialiasing epsilon. This is cheap, needs no new authoring, and is the per-primitive expectation the aggregate gates structurally cannot provide. Until it exists, the eye_walker frame read is the ONLY gate for this class and must check element-by-element that everything the design says moves is moving — a green deterministic run does not clear it, exactly as it does not clear the D6 thin-content teleport.',
        probe_type: 'js_eval',
        probe_logic:
            'For each state: build the expected-movers set from the primitives whose expression fields reference choreographed or slider-bound variables. For each member, compute the rendered centroid of its own colour in each dense frame and assert max pairwise displacement > 2 px. FAIL naming any primitive that should have moved and did not. Independently FAIL any body whose centroid sits within 3 px of (200,200), or any glow halo within 5 px of (380,250), for a whole state — both are renderer fallback constants and neither is a plausible authored position.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: [],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
];

async function main(): Promise<void> {
    console.log(`\nengine_bug_queue — seeding ${rows.length} build-gate row(s) for ${CONCEPT}\n`);

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

/**
 * TWO FOUNDER CALLS THIS SCRIPT DELIBERATELY DOES NOT MAKE.
 *
 * 1. `pcpl_slider_label_stale_under_choreography` (MODERATE/OPEN) carries the
 *    instruction: "Do not ship a NEW PCPL concept authoring variable_choreography
 *    on a slider-bound variable without either fixing this or explicitly hiding
 *    that slider row during the choreographed portion of the state
 *    (visible_controls precedent)." unit_circle_to_sine_wave does exactly that on
 *    S3, S7 and S8 — recorded above as a recurrence.
 *    THE PRESCRIBED REMEDY (b) DOES NOT EXIST ON THIS RENDERER. `visible_controls`
 *    occurs only in particle_field_renderer.ts and field_3d_renderer.ts; there are
 *    ZERO hits in parametric_renderer.ts, and drawCanvasSlider has no
 *    PM_animationGate call, so a PCPL slider cannot be time-gated at all. That
 *    leaves only remedy (a), a Rule-40 platform fix. Amending the row's
 *    prevention_rule to say so is a founder/owner action, not a concept desk's —
 *    flagged rather than edited, since an upsert would clobber the original
 *    incident's evidence.
 *
 * 2. `parametric_from_expr_to_expr_never_consumed` (MODERATE/OPEN) states "as of
 *    2026-07-23 there are zero hits outside comments" for from_expr/to_expr in
 *    parametric_renderer.ts. That is NO LONGER TRUE: drawVector consumes both via
 *    PM_safeEvalPoint at :2251-2262, and the code comment at :2246 records the very
 *    fix ("Previously unread -> the vector collapsed to (0,0)"). The row is STALE-OPEN.
 *    It matters because an author consulting the scar list today would conclude
 *    from_expr/to_expr are unusable and re-author around a defect that was fixed —
 *    and this entire concept is built on them. Closing a row is an owner action;
 *    reported, not changed.
 */
