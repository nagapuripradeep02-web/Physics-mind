/**
 * engine_bug_queue — CLOSE the fₖ force-label contrast row (field3d_surgeon,
 * 2026-08-08). Routed as a MAJOR/OPEN engine fix after PR #56 fixed the friction
 * ARROW fill and left the label that names it below the floor.
 *
 * The diagnosis in the OPEN row is CONFIRMED, and root-caused one level deeper
 * than the row states: the label is NOT on "a different, untouched colour
 * constant" — it shares the arrow's authored palette entry and it does go through
 * the SEAM Q ink pass. What was wrong is the BACKDROP CLASS the pass resolved for
 * it.
 *
 * UPDATE (never a duplicate INSERT): bug_class is the upsert key.
 *
 * Run: npx tsx src/scripts/_close_engine_bug_queue_nlb_friction_label_contrast.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BUG_CLASS =
    'nlb_friction_label_fk_text_colour_unaffected_by_arrow_fill_contrast_fix';

const ROOT_CAUSE_SUFFIX =
    ' [FIXED 2026-08-08, field3d_surgeon] Diagnosis CONFIRMED at the measured numbers and root-caused'
    + ' one level deeper. The row said the label "uses a different, untouched colour constant". It does'
    + ' not: nlb_arrow_label shares the arrow\'s authored palette entry (nlbInkBase returns the same'
    + ' NLB_ARROW_COLORS[kind] for both) and it IS registered in the SEAM Q ink pass as NLB_INK_TYPES'
    + ' class 2, which re-bakes its canvas texture at the lensed hex. The pass reaches labels. What was'
    + ' wrong was the BACKDROP CLASS it resolved for them. nlbInkSampleClass takes an `overlay` flag:'
    + ' for depth-tested ink a solid on the ray HIDES the sample (discard it, it draws nothing), for'
    + ' overlay ink the same solid BACKS it (light backdrop, deepen). nlbInkSpanClass set that flag for'
    + ' exactly two families — var ovl = (t === "nlb_arrow" || t === "nlb_comp") — on the strength of'
    + ' SEAM R\'s own prose note, "Label sprites stay depth-tested too: a label sits PAST the tip, in'
    + ' free space". That sentence was FALSE, and false since long before SEAM R existed:'
    + ' createLabelSprite and pmCreateAutoLabel have always built their SpriteMaterial with'
    + ' depthTest:false, depthWrite:false and renderOrder 999 ("always draw on top of arrows"). A label'
    + ' sprite is the most overlay-like ink in the file — it wins every pixel it covers.'
    + ' MEASURED (conservative_vs_nonconservative_forces STATE_3, 1280x720, camera [0,1.87,9.1], read'
    + ' out of the live scene): the fₖ sprite origin is 9.325 from the camera and the ray hits the slab'
    + ' at 8.495 — 0.83 units IN FRONT. Under depth-tested semantics that is "occluded, draws nothing",'
    + ' so the sample was discarded, the element fell back to the page class and took the LIFTED ink'
    + ' #f9bfd2 (luminance floored at NLB_INK_LUM_MIN 0.62 by construction). It then drew that'
    + ' near-white pink, in front, over the lit slab. Pixels at the frozen EYE pin, slab (108,130,141)'
    + ' lum 0.2108: best contrast anywhere in the glyph box 2.49:1 (brightest (187,151,168) 1.55:1,'
    + ' darkest (63,71,83) 2.33:1 — the row\'s own numbers reproduced), against a 3:1 floor, while the'
    + ' arrow it names measured 14.17:1. REMEDY (one executable line): the overlay flag is stated over'
    + ' the sprite CLASS, not over the one elementType that exposed it —'
    + ' var ovl = (t === "nlb_arrow" || t === "nlb_comp" || NLB_INK_TYPES[t] === 2) — so every label'
    + ' family reads an occluder as its backdrop, which is what the GPU already does with them. The'
    + ' friction label now takes the deepened slab ink #220e15 (the same lens value SEAM Q2 names) and'
    + ' measures 3.99:1 at the same pin, clearing the 3:1 floor. SEAM R\'s false note is corrected in'
    + ' place so the premise cannot be re-derived. NO stroke class is touched, no clock or accumulator'
    + ' is involved (Rule 36 — the branch reads camera, geometry and elementType only, so a'
    + ' SET_TIME_FREEZE rewind reproduces it exactly), and no deriveStateMeta co-edit is needed'
    + ' (colour-only, no new reveal timing).'
    + ' RESIDUAL, MEASURED AND NAMED: 3.99:1 clears the 3:1 stroke floor but not the 4.5:1 text floor.'
    + ' The gap is NLB_LABEL_DIM_OPACITY (0.85) — the label is a non-focal peer here, and the same ink'
    + ' at opacity 1.0 computes 4.57:1. Raising that constant is a second change with fleet-wide reach'
    + ' and is deliberately NOT taken in this one-bug_class dispatch.';

const PREVENTION_SUFFIX =
    ' AMENDED AND GENERALISED on the evidence. (1) The row\'s rule is right and is KEPT verbatim: a'
    + ' contrast fix on a force-vector fill must be independently verified against every TEXT LABEL'
    + ' that names it. (2) But the mechanism it assumed — separate colour constants — was not the'
    + ' mechanism here, so the durable rule is stated over the DEPTH SEMANTICS instead: an ink pass'
    + ' that classifies its backdrop by raycast must take "does this element draw in front of an'
    + ' occluder" from the same fact the GPU uses (material.depthTest / renderOrder), never from a'
    + ' prose note or a hand-maintained elementType list. A hand-maintained list silently omits any'
    + ' family that was ALREADY overlay ink before the concept of overlay ink was named — which is'
    + ' exactly what happened: label sprites had depthTest:false from birth and were left out of the'
    + ' list SEAM R wrote. (3) A LABEL IS NOT A SMALLER ARROW. It reaches the eye through baked-texture'
    + ' ink plus a dark halo, at a fraction of a stroke\'s pixel coverage, so its floor must be'
    + ' measured on its own glyph pixels and never inferred from the arrow beside it — and the failure'
    + ' mode is ASYMMETRIC: fixing the arrow to 14:1 while leaving the label at 2.5:1 makes the label'
    + ' harder to notice than before the arrow was fixed.'
    + ' FLEET REACH MEASURED, NOT ASSUMED. All 14 newtons_laws_body concepts probed post-fix with the'
    + ' pre-fix classifier replicated outside the renderer (5 states x 3 sampled instants each): 13 of'
    + ' 14 carried at least one mis-classified label, 40 distinct (state, family, glyph) sites in all.'
    + ' TWO label families were affected: nlb_arrow_label (the friction label fₛ/fₖ in 13 concepts,'
    + ' because NLB_ARROW_LANE puts friction just above the contact face and therefore behind the'
    + ' slab\'s screen silhouette from an elevated camera; plus the weight label mg once, normal_force'
    + ' STATE_3) and nlb_theta_label (block_on_incline S1-S5, normal_force S2/S5). The other four label'
    + ' families in NLB_INK_TYPES (comp, disp, fang, seg) mis-classify nowhere today but carried the'
    + ' same wrong premise, which is why the fix is stated over the class.'
    + ' ATTRIBUTION MEASURED BY RUNNING THE PRE-FIX RENDERER, not inferred. Paired EYE runs (re-seeded'
    + ' before each capture): conservative_vs_nonconservative_forces pre-fix S1 0.81/0.81, S2'
    + ' 1.57/1.57, S3 0.00/0.00, S4 0.00/0.00, S5 0.00/0.00 -> post-fix identical except'
    + ' STATE_3__frozen 0.00 -> 0.01%; newton_third_law pre-fix 0.59/0.59 0.63/0.62 0.63/0.64'
    + ' 0.61/0.60 0.63/0.62 -> post-fix 0.59/0.59 0.62/0.63 0.63/0.63 0.60/0.60 0.63/0.63 (all within'
    + ' +/-0.01pp run jitter); friction_force pre-fix 0.75/0.76 0.79/0.79 0.98/0.98 0.72/0.72'
    + ' 0.82/0.82 -> post-fix 0.75/0.76 0.79/0.79 0.98/0.99 0.74/0.74 0.85/0.84. So the standing'
    + ' 0.6-1.6% drift on those baselines is PRE-EXISTING and NOT caused by this fix; the fix\'s own'
    + ' contribution is <= 0.03pp on any frame, and 32/32 deterministic gates pass on every run. Two'
    + ' further baseline-locked concepts run post-fix as the widest-reach bound (block_on_incline, 14'
    + ' sites incl. theta labels: max 1.10%; normal_force, 8 sites incl. the mg case: max 1.22%) — all'
    + ' 20 frames inside the 2.0% tolerance, 32/32 gates each. The remaining 9 baseline-locked nlb'
    + ' concepts carry 1-5 sites each, strictly fewer than the two bounds above, and are FLAGGED for'
    + ' the dispatching session rather than swept here.';

const PROBE_LOGIC =
    'js_eval over the cached sim, per state, after SET_STATE and a SET_TIME_FREEZE pin. For every'
    + ' visible object whose elementType is a class-2 entry of NLB_INK_TYPES (the label sprites),'
    + ' assert BOTH: (a) material.depthTest === false implies the element was classified as overlay'
    + ' ink — cast camera -> sprite world origin, and if the slab is hit nearer than the sprite the'
    + ' resolved ink must be the DEEPENED lens value (relative luminance <= NLB_INK_LUM_MAX), never the'
    + ' lifted one (>= NLB_INK_LUM_MIN); and (b) the rendered glyph clears 3:1 against the backdrop'
    + ' material it draws over, measured on the glyph pixels themselves, independently of the same'
    + ' check on the arrow it names. The (a) half is the cheap structural form and is the one to run in'
    + ' CI: it is a pure function of camera + geometry + palette and needs no framebuffer read.'
    + ' (SUPERSEDES the original pixel-only form, which was correct but could only be evaluated from a'
    + ' captured frame and gave no signal on the 39 other affected sites.)';

async function main(): Promise<void> {
    const { data: row, error: readErr } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('bug_class, status, root_cause, prevention_rule, concepts_affected')
        .eq('bug_class', BUG_CLASS)
        .maybeSingle();
    if (readErr) throw new Error(`read failed: ${readErr.message}`);
    if (!row) throw new Error(`row not found — refusing to INSERT a duplicate for ${BUG_CLASS}`);
    if (row.status === 'FIXED') { console.log('already FIXED — nothing to do.'); return; }

    // The authored list named work_energy_theorem, which has no concept JSON on this
    // branch. Replaced with the MEASURED set: every nlb concept with at least one
    // mis-classified label sprite at a sampled instant (13 of 14).
    const CONCEPTS_AFFECTED = [
        'conservative_vs_nonconservative_forces', 'friction_force', 'newton_third_law',
        'block_on_incline', 'connected_bodies', 'free_body_diagram',
        'kinetic_energy_definition', 'newton_first_law', 'normal_force',
        'positive_negative_zero_work', 'rolling_friction', 'tension_force',
        'work_done_by_constant_force',
    ];

    const { error } = await supabaseAdmin
        .from('engine_bug_queue')
        .update({
            status: 'FIXED',
            fixed_at: new Date().toISOString(),
            fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts'],
            concepts_affected: CONCEPTS_AFFECTED,
            root_cause: (row.root_cause ?? '') + ROOT_CAUSE_SUFFIX,
            prevention_rule: (row.prevention_rule ?? '') + PREVENTION_SUFFIX,
            probe_logic: PROBE_LOGIC,
        })
        .eq('bug_class', BUG_CLASS);
    if (error) throw new Error(`update failed: ${error.message}`);
    console.log(`✅ CLOSED (FIXED) ${BUG_CLASS}`);
}

main().catch((err) => { console.error('💥 close failed:', err instanceof Error ? err.stack : err); process.exit(1); });
