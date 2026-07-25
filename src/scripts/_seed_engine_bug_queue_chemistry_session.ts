/**
 * Seed engine_bug_queue with the defect classes surfaced by the first chemistry
 * concept run (bohr_model_energy_levels, 2026-07-23/24 — archetype L on the
 * parametric renderer, the Wave-1 "prove-first" slice).
 *
 * Why this exists: root CLAUDE.md §2 — engine_bug_queue IS the build-side moat.
 * Every agent that authors a concept queries it for prevention_rules BEFORE
 * authoring (see .agents/chemistry_author/CLAUDE.md §"Engine bug queue
 * consultation"). A defect that isn't recorded here is a defect the NEXT
 * concept repeats. Twelve reusable classes came out of this run; ten of them
 * are subject_neutral (they bind physics authoring identically).
 *
 * Idempotent: upserts on the UNIQUE bug_class, so re-running only refreshes.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_chemistry_session.ts
 *
 * NOTE: `subject` + the `alex:chemistry_author` owner value require
 * supabase_migrations/supabase_2026-07-24_engine_bug_queue_chemistry_subject_migration.sql.
 * This script degrades gracefully if that migration hasn't been applied yet:
 * it retries without the `subject` column and remaps the chemistry owner.
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'chemistry-wave1-bohr-2026-07-24';
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
    status: 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
    concepts_affected: string[];
    fixed_in_files: string[];
    subject: 'physics' | 'chemistry' | 'subject_neutral';
}

const ROWS: BugRow[] = [
    {
        bug_class: 'parametric_canvas_fixed_size_not_filling_host',
        title: 'Parametric sim renders at a fixed 760x500 pinned top-left instead of filling its host panel',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause:
            'parametric_renderer setup() called createCanvas(760, 500) unconditionally. field_3d does renderer.setSize(window.innerWidth, window.innerHeight) and reframes with its camera, so it always fills its iframe; the 2D parametric renderer had no equivalent. Measured on the review surface: a 760x500 canvas inside a 972x659 iframe = 59% fill, anchored top-left with dead black to the right and below. Read as "the sim only occupies half the panel" and made every parametric sim look unfinished next to a field_3d diamond.',
        prevention_rule:
            'A fixed-design-space 2D renderer MUST fit-and-center its design space to the host viewport, never render at native size in a larger frame. Keep the design space constant (760x500 — every authored coordinate, zone table and edge clamp assumes it) and apply a uniform translate+scale, letterboxed on the background colour. Any mouse/pointer hit-testing must be mapped back into design space or interactive widgets break under scale. Verify: canvas CSS size == host iframe size.',
        probe_type: 'js_eval',
        probe_logic:
            "In the rendered sim iframe: const c=document.querySelector('canvas'); const cs=getComputedStyle(c); FAIL if parseFloat(cs.width) < 0.95*window.innerWidth && parseFloat(cs.height) < 0.95*window.innerHeight (canvas is not filling its host).",
        status: 'FIXED',
        concepts_affected: CHEM,
        fixed_in_files: ['src/lib/renderers/parametric_renderer.ts', 'src/scripts/build_review_site.ts'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'annotation_deoverlap_breaks_label_object_anchoring',
        title: 'Automatic annotation de-overlap drags anchored labels off the objects they name',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause:
            'PM_resolveAnnotationOverlap (parametric_renderer.ts) collects EVERY primitive of type "annotation", buckets them left/right of x=380, sorts top-to-bottom and force-separates them to prev.h+12 (~41px for a single line). It was designed for sparse mechanics callouts. On a dense labelled diagram (a Bohr energy ladder whose rungs converge to 27-50px apart) it pushed all six rung labels apart so they no longer aligned with their own rung, and the cascade shoved the bottom label onto the wavelength strip, colliding with the axis text. A label that points at the wrong line is a correctness defect, not a cosmetic one.',
        prevention_rule:
            'Text that must stay anchored to an object uses type "label" (drawLabel renders at the exact authored position and is EXEMPT from the de-overlap resolver). Reserve type "annotation" for free-floating callouts where auto-separation is desirable. When converting annotation->label, note the anchor changes from textAlign(LEFT,TOP) to textAlign(CENTER,CENTER) and there is no background box — shift x/y accordingly and set font_size explicitly. Every object label must end up at EXACTLY its object y.',
        probe_type: 'js_eval',
        probe_logic:
            'For each state, for every annotation whose text names a specific object (e.g. matches /^n\\s*=/ for level diagrams), assert |annotation.position.y - target_object.position.y| <= 2. Any drift means the resolver moved it; convert to type "label".',
        status: 'FIXED',
        concepts_affected: CHEM,
        fixed_in_files: ['src/data/concepts/chemistry/bohr_model_energy_levels.json'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'animated_path_missing_disappear_gating_labels_accumulate',
        title: 'animated_path arrows without disappear_at_ms persist and pile their labels into the frozen end frame',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause:
            'Transient animated_path primitives (photon flights) were authored with appear timing but no disappear_at_ms/fade_out_ms. Because a guided state holds its final picture (Rule 26), every arrow fired during the state was still drawn at the end frame, and animated_path renders its label anchored at the arrow TIP — so three sequential photon flights ended with three arrows crossing the diagram and three value chips stacked in the same corner. This produced both the "arrows through text" and the "bottom-left label pile-up" reported in review.',
        prevention_rule:
            'Every TRANSIENT animated_path declares disappear_at_ms (+ fade_out_ms) so it leaves the frozen end frame. Never rely on the tip-anchored built-in label for a value that must stay readable — author a separate label primitive at the flight MIDPOINT, gated to the same window. Design the end frame deliberately: state explicitly which primitives are visible when the clock stops.',
        probe_type: 'js_eval',
        probe_logic:
            "For each state: collect primitives of type 'animated_path' with an appear_at_ms; FAIL any that lack disappear_at_ms. Then count primitives visible at t=duration; FAIL if >1 animated_path is visible simultaneously in the end frame.",
        status: 'FIXED',
        concepts_affected: CHEM,
        fixed_in_files: ['src/data/concepts/chemistry/bohr_model_energy_levels.json'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'coincident_text_primitives_render_superimposed',
        title: 'Two text primitives authored at the same position render on top of each other (unreadable)',
        severity: 'CRITICAL',
        owner_cluster: 'alex:json_author',
        root_cause:
            'In the quantitative state a formula_box ("delta-E = h nu = hc/lambda") and a computed derivation line ("lambda = 1240 / 1.89 = 656 nm") were authored at effectively the same position, so they painted over each other into an illegible garble. Nothing in the schema or validator forbids two text primitives sharing a position, and neither type participates in the annotation de-overlap resolver, so it rendered exactly as authored.',
        prevention_rule:
            'No two text-bearing primitives may share a position. A formula surface owns its own zone; derivation lines stack BELOW it with >=40px separation and never inside the box rect. Rule 34b already caps ONE formula surface per state — treat any second equation-like string in the same zone as a defect.',
        probe_type: 'js_eval',
        probe_logic:
            "For each state, for every pair of text-bearing primitives (label|annotation|formula_box|derivation_step), FAIL if |dy| < 14 AND their x-spans overlap.",
        status: 'FIXED',
        concepts_affected: CHEM,
        fixed_in_files: ['src/data/concepts/chemistry/bohr_model_energy_levels.json'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'authored_content_collides_renderer_owned_control_zone',
        title: 'Authored content placed inside the renderer-owned canvas-slider band collides with slider captions',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause:
            'The parametric renderer OWNS PM_ZONES.CONTROL_ZONE = {x:30,y:460,w:700,h:40} for canvas-drawn sliders: each slot renders at y=480 with its caption at y=466. A concept authored its wavelength strip and tick labels into that same band, so in every state carrying a slider the caption ("End level n: 6") painted over the strip axis label ("wavelength lambda (nm)"). The concept cannot move the slider — the position is renderer-owned.',
        prevention_rule:
            'In any state that exposes canvas sliders, author NOTHING below y~450 — the renderer owns y=460..500. If the composition needs that space, move the composition (e.g. raise the whole diagram by a uniform translation) rather than the strip alone; shifting one element in isolation just relocates the collision. Uniform translations must preserve relative spacing where that spacing encodes physics.',
        probe_type: 'js_eval',
        probe_logic:
            "For each state whose scene contains a primitive of type 'slider': FAIL if any other primitive has position.y >= 450.",
        status: 'FIXED',
        concepts_affected: CHEM,
        fixed_in_files: ['src/data/concepts/chemistry/bohr_model_energy_levels.json'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'smooth_camera_zoom_clips_content_on_full_canvas',
        title: 'smooth_camera scales the whole draw pass and clips content off-canvas when the scene is already full',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause:
            'PM_beginSmoothCameraIfActive wraps the ENTIRE draw pass in push()/translate/scale, panning to centre its target_primitive. A state used zoom 1.3 targeting an element near the BOTTOM of a diagram that already filled ~91% of the canvas height. Solving the transform at settle, the top three ladder rungs mapped to negative screen y — silently clipped off the top. The visible symptom (only 3 of 6 levels showing) looked like a coordinate bug; the real cause was the camera.',
        prevention_rule:
            'Only use smooth_camera when the scene has genuine vertical/horizontal slack. Before authoring a zoom, compute the transform at settle (screen = pos*zoom + pan) for the EXTREME primitives and confirm all stay within 0..760 / 0..500. On a near-full canvas, omit the zoom — a clipped diagram is far worse than a missing flourish.',
        probe_type: 'js_eval',
        probe_logic:
            "For each state containing a smooth_camera: compute z=zoom, pan to centre target; for every primitive assert 0 <= pos*z+pan <= canvas bound on both axes. FAIL on any out-of-range extreme.",
        status: 'FIXED',
        concepts_affected: CHEM,
        fixed_in_files: ['src/data/concepts/chemistry/bohr_model_energy_levels.json'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'ascii_minus_in_oncanvas_math_from_tofixed',
        title: 'ASCII hyphen leaks into on-canvas math because toFixed() emits it at render time (Rule 34c)',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        root_cause:
            'Rule 34c requires real Unicode for on-canvas math. Static authored strings used the correct U+2212 minus, but an interpolated derivation line built its numbers with .toFixed(2) — and the JS runtime emits an ASCII "-" for negatives at render time. The result mixed both glyphs in one equation ("higher - lower = -1.51 - (-3.40) eV"). Invisible in the JSON; only visible in the render.',
        prevention_rule:
            "Any interpolated numeric that can be NEGATIVE must post-process the sign into Unicode: .toFixed(2).replace('-','\\u2212'). A Unicode sweep of static strings is not sufficient — it misses runtime-generated numbers. Sweep all three text paths (DOM/JSON text, canvas fillText, sprite labels).",
        probe_type: 'js_eval',
        probe_logic:
            "Scan every on-canvas text/text_expr/label_expr/equation field for /toFixed\\(/ without a following .replace('-'. Also scan rendered output for /[^\\u2212]-\\d/ in math contexts.",
        status: 'FIXED',
        concepts_affected: CHEM,
        fixed_in_files: ['src/data/concepts/chemistry/bohr_model_energy_levels.json'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'review_site_missing_renderer_family_branch',
        title: 'Review-site builder hard-gated on two renderer families, leaving a third with no teacher surface',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:runtime_generation',
        root_cause:
            'build_review_site.ts buildOne() required field_3d_config or particle_field_config and exited(1) otherwise, and its assembly line was a two-way ternary. Parametric-family concepts carry NEITHER config block (their scene lives in epic_l_path.states + physics_engine_config), so NO parametric concept could render on the teacher review surface at all — including pre-existing physics ones (vector_head_to_tail), which had silently only ever been viewable through bespoke admin test pages.',
        prevention_rule:
            'Every renderer family reachable via renderer_pair.panel_a MUST have a branch in the review-site builder. When adding a renderer family, add its review-site assembly branch in the same change — the review site is the teacher product surface, so "renders in the app but not on the review site" is a shipping blocker, not a gap.',
        probe_type: 'js_eval',
        probe_logic:
            "Enumerate distinct renderer_pair.panel_a values across src/data/concepts/**; for each, assert build_review_site.ts buildOne() has a matching assembly branch. FAIL on any family that falls through to the error exit.",
        status: 'FIXED',
        concepts_affected: [...CHEM, 'vector_head_to_tail', 'newton_second_law_direction'],
        fixed_in_files: ['src/scripts/build_review_site.ts'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'parametric_position_not_variable_bindable',
        title: 'Parametric primitives bound only TEXT to live variables, so slider-driven explore states could not move',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause:
            'The parametric renderer supported label_expr/text_expr (and to_deg_expr for angles) but body/animated_path POSITIONS were static per state. In an explore/sandbox state the numeric readouts updated live on slider drag while the moving glyph stayed put — the teacher saw the numbers change but the picture frozen, which reads as a broken sim and undercuts the whole point of an interaction_complete explore state (Rule 31 explore-last, Rule 37 continuous run).',
        prevention_rule:
            'A sandbox/explore state whose sliders drive a quantity must move the PICTURE, not only the readout. Use position_expr {x,y} on the body (expressions evaluated against live slider+derived vars, non-finite falls back to the static position; the body registry updates so glow_focus tracks automatically). If a value is shown live, whatever represents it visually must be bound live too.',
        probe_type: 'js_eval',
        probe_logic:
            "For each interaction_complete state: if any label_expr/text_expr references a slider variable, assert at least one body/path primitive also binds that variable (position_expr / from_expr / to_expr). Otherwise the state is numbers-live-picture-dead.",
        status: 'FIXED',
        concepts_affected: CHEM,
        fixed_in_files: ['src/lib/renderers/parametric_renderer.ts', 'src/data/concepts/chemistry/bohr_model_energy_levels.json'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'parametric_computephysics_missing_silent_template_leak',
        title: 'A parametric concept without its own computePhysics_<id> renders literal {template} text instead of values',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:runtime_generation',
        root_cause:
            'parametric_renderer computePhysics(conceptId, vars) is a HARDCODED per-concept-id dispatch that returns null for unknown ids — it is not a generic formula evaluator, despite physics_engine_config carrying a formulas block that reads like one. With no matching function, PM_physics stays null, PM_interpolate falls back to static default_variables, and every {derived} binding renders as the literal template string on canvas. Fails silently: no error, no console warning, just wrong text in front of a class.',
        prevention_rule:
            'Standing up a NEW parametric-family concept is never data-only: it also needs computePhysics_<concept_id> in parametric_renderer.ts (+ dispatcher line) and the matching TS engine in src/lib/physicsEngine/concepts/ registered in the ENGINES map. Implement both from the same formula contract. After building, assert no literal "{" remains in rendered on-canvas text.',
        probe_type: 'js_eval',
        probe_logic:
            "Render the sim and scan all drawn text for /\\{[a-z_]+\\}/ (an unresolved interpolation token). Any hit = missing/failed computePhysics for that concept_id.",
        status: 'FIXED',
        concepts_affected: CHEM,
        fixed_in_files: ['src/lib/renderers/parametric_renderer.ts', 'src/lib/physicsEngine/concepts/bohr_model_energy_levels.ts', 'src/lib/physicsEngine/index.ts'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'archetype_live_tier_unverified_against_renderer',
        title: 'Pattern-library archetypes marked [LIVE] without verifying the renderer supports the specific motion',
        severity: 'CRITICAL',
        owner_cluster: 'alex:architect',
        root_cause:
            'docs/patterns/chemistry.md v0.1 tagged archetypes [LIVE] from design intent rather than code inspection. Three were wrong: M (particle box) claimed [LIVE] though particle_field_renderer is entirely circuit-shaped with no gas-collision scenario; K (scattering) claimed a free reuse of the magnetic_force_moving_charge trajectory, but that machinery is hardcoded closed-form circle/helix with NO general force integrator and cannot express 1/r^2 hyperbolic scattering; L (energy ladder) was genuinely renderable but its "no new engine code" claim was false (see parametric_computephysics_missing). Scheduling on an unverified tier would have burned a full pipeline run on an unbuildable concept.',
        prevention_rule:
            "An archetype's [LIVE] tier is a CLAIM about renderer readiness, not a fact — like a Rule 38g curriculum tag. Before scheduling a concept, verify against renderer CODE that the SPECIFIC motion that concept needs exists (not merely that the renderer family exists). Maintain three tiers: [LIVE] (scenario exists), [NEEDS-SCENARIO] (renderer exists, scenario does not), [PHASE-5] (no render surface). Record the verification file:line in the pattern doc.",
        probe_type: 'manual',
        probe_logic:
            'For each archetype cited in a skeleton, open the named renderer and confirm a handler exists for the specific motion (not just the family). Cite file:line in the skeleton. Reject any skeleton citing a [LIVE] tier with no code citation.',
        status: 'FIXED',
        concepts_affected: CHEM,
        fixed_in_files: ['docs/patterns/chemistry.md'],
        subject: 'chemistry',
    },
    {
        bug_class: 'chemistry_author_owner_cluster_missing_from_db_check',
        title: 'alex:chemistry_author exists in the admin UI enums but is rejected by the engine_bug_queue DB CHECK',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:runtime_generation',
        root_cause:
            'Phase 2 (2026-07-23) registered the chemistry_author role in the two admin-UI enums (bug-queue/page.tsx union + BugQueueList.tsx OWNERS) but never migrated the engine_bug_queue.owner_cluster CHECK constraint, which still listed only the physics-era clusters. The UI therefore offers an owner value the database rejects on write, and no chemistry-owned scar row could be filed at all — silently defeating the chemistry pipeline pre-authoring query.',
        prevention_rule:
            'A role added to an agent roster must be registered in EVERY enum that constrains it — TS unions, UI arrays AND database CHECK constraints — in the same change. When adding an owner cluster, grep for the constraint name (engine_bug_queue_owner_cluster_check) and ship the migration alongside the UI edit.',
        probe_type: 'sql',
        probe_logic:
            "SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname='engine_bug_queue_owner_cluster_check'; assert the string contains every value in the admin OWNERS array.",
        status: 'OPEN',
        concepts_affected: [],
        fixed_in_files: ['supabase_migrations/supabase_2026-07-24_engine_bug_queue_chemistry_subject_migration.sql'],
        subject: 'chemistry',
    },
];

async function main(): Promise<void> {
    console.log(`Seeding ${ROWS.length} chemistry-session defect classes into engine_bug_queue…\n`);

    let withSubject = true;
    let inserted = 0;
    const failures: string[] = [];

    for (const row of ROWS) {
        const base = {
            ...row,
            discovered_in_session: SESSION,
            row_type: 'incident',
            fixed_at: row.status === 'FIXED' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
        };

        let payload: Record<string, unknown> = { ...base };
        if (!withSubject) {
            delete payload.subject;
            if (payload.owner_cluster === 'alex:chemistry_author') {
                payload.owner_cluster = 'ambiguous';
            }
        }

        let { error } = await supabaseAdmin
            .from('engine_bug_queue')
            .upsert(payload, { onConflict: 'bug_class' });

        // Migration not applied yet → retry without the new column / value.
        if (error && /subject|owner_cluster/i.test(error.message)) {
            withSubject = false;
            payload = { ...base };
            delete payload.subject;
            if (payload.owner_cluster === 'alex:chemistry_author') {
                payload.owner_cluster = 'ambiguous';
            }
            ({ error } = await supabaseAdmin
                .from('engine_bug_queue')
                .upsert(payload, { onConflict: 'bug_class' }));
        }

        if (error) {
            failures.push(`${row.bug_class}: ${error.message}`);
            console.log(`  ✖ ${row.bug_class} — ${error.message}`);
        } else {
            inserted++;
            console.log(`  ✓ [${row.severity.padEnd(8)}] ${row.subject.padEnd(15)} ${row.bug_class}`);
        }
    }

    console.log(`\n${inserted}/${ROWS.length} rows upserted.`);
    if (!withSubject) {
        console.log(
            '\n⚠ `subject` column / alex:chemistry_author owner NOT present — rows were written without them.\n' +
            '  Apply supabase_migrations/supabase_2026-07-24_engine_bug_queue_chemistry_subject_migration.sql,\n' +
            '  then re-run this script to set subjects (its Step 3 also backfills them).',
        );
    }
    if (failures.length) {
        console.log(`\n${failures.length} failure(s):`);
        for (const f of failures) console.log(`  - ${f}`);
        process.exitCode = 1;
    }

    const { count } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('*', { count: 'exact', head: true })
        .eq('discovered_in_session', SESSION);
    console.log(`\nengine_bug_queue rows tagged "${SESSION}": ${count}`);
}

main();
