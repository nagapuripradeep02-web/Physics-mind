/**
 * engine_bug_queue — the Newman-legibility + graph-text fix round (2026-08-10).
 *
 * THREE status flips (the ethane eye-walk CRITICALs, now FIXED with their
 * prevention rules asserted by check:organic-structure sections 15–17) and
 * TWO new rows from the fix dispatches:
 *   - the engine half of the labelling scar (a convention that replaces a mesh
 *     with a glyph must hand the label to the glyph);
 *   - a found-not-fixed defect: a seized explore camera leaves every
 *     view-dependent construction reading the solved pose (separate root
 *     cause, separate dispatch — Amendment 4).
 *
 * Gate arithmetic: 277 → 291 (Newman pair, §15–16) → 318 (text placer, §17).
 *
 * Idempotent. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_organic_newman_fixes.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const R = 'src/lib/renderers/field_3d_renderer.ts';
const G = 'src/scripts/check_organic_structure.ts';
const ALL = ['conformations_of_ethane', 'conformations_of_butane', 'cyclohexane_chair_flip', 'organic_structure'];
const now = new Date().toISOString();

async function flip(bug_class: string, patch: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin.from('engine_bug_queue')
    .update({ status: 'FIXED', fixed_at: now, fixed_in_files: [R, G], ...patch })
    .eq('bug_class', bug_class).select('bug_class');
  if (error) { console.error(`✗ ${bug_class}: ${error.message}`); process.exit(1); }
  console.log(data?.length ? `✓ FIXED  ${bug_class}` : `· not present: ${bug_class}`);
}

async function main() {
  await flip('newman_back_atom_disc_clears_the_front_atom_disc_and_is_swallowed_by_the_front_bond_cylinder', {
    concepts_affected: ALL,
    prevention_rule:
      'A countability solve enumerates EVERY drawn primitive as an occluder, not only spheres. Where an eclipsing pose IS the taught content, distance cannot buy legibility and the renderer ships an explicit device. The device chosen here is a STATED PAINT-ORDER CONVENTION: while the projection is up the scene paints back bonds, rim, front bonds, back atoms, front atoms with depth testing off, so in a projection a STICK MAY NEVER HIDE A COUNTABLE ATOM - only another atom may. A projection is a 2-D convention drawn in a 3-D scene, and a front cylinder covering a back atom is an artefact of depth-testing a diagram, not information. The back set is tinted toward the background so a near-white disc newly painted over a near-white stick is still a separate region. Nothing is moved and nothing is resized (Rule 29), and no offset is introduced, so the published torsion is still the measured dihedral. Ordering back atoms UNDER the front sticks was tried and measured at 9 percent of the back-H disc surviving at phi=0.',
    probe_logic:
      "check:organic-structure section 15. Rasterise the depth-sorted scene at 150 px per scene unit at the authored Newman camera for phi in {0,1,2,5,10}: atoms as discs, bonds as capsules at their rendered screen half-width, the rim as an annulus, painted in renderOrder. Count 4-connected components of unoccluded atom pixels and require the largest component of each atom to exceed 60 percent of that atom's own unoccluded disc area; assert the surviving count equals the number of atoms drawn as discs, and separately that the ONLY atom not drawn as a disc is the back carbon and that its rim is drawn, so discs + rim equals the atom count the HUD publishes. Negative control 1: phi=60 returns the full count through the same probe. Negative control 2 (the strong one): the same geometry through the same rasteriser under ORDINARY DEPTH TESTING must FAIL at phi=0 - a probe that cannot reproduce the defect it was written for proves nothing. Observed: flat 7/7 at every eclipsing pose with every disc 100 percent unoccluded; depth-sorted 4/7 with the back set at 9-10 percent.",
  });

  await flip('newman_rim_convention_applies_at_state_apply_instead_of_when_the_sight_line_reaches_the_bond_axis', {
    prevention_rule:
      "The rim treatment is a CONTINUOUS function of the angle between the view direction and the torsion bond axis, measured on the pose the camera is ACTUALLY at this instant (after the camera schedule and after any spin), never a boolean read at apply. One pure closed-form weight drives the back sphere's opacity, the rim's opacity, the bond re-rooting and the carbon-label anchors together, so a state whose camera flies to the axis shows a real two-carbon molecule until the projection actually is the projection. THE BAND IS SOLVED, NOT CHOSEN: the rim may not appear while the back atom is more than one atom radius off the front atom's projected centre, which for d_CC 2.0 scene units and a drawn carbon radius 0.23 puts the outer edge at asin(0.115) = 6.6 deg. A wider band was tried (10/26 deg) and ghosted a rim in while the molecule was plainly two carbons three radii apart. The same weight keeps the back atom LABELLED at every pose, so the HUD can never name a bond the canvas half-names.",
    probe_logic:
      'check:organic-structure section 16. Execute apply + frame against a DOM/three stub over the authored STATE_2 camera flight, sampled at every 10 percent. Assert: while the view-to-axis angle exceeds OFF the back carbon is a real visible mesh and NO rim is drawn; below FULL the rim is drawn and the back sphere is withheld; the back carbon label is present at EVERY sample; and no frame draws a rim while the two carbons are more than one projected atom radius apart. The cross-fade instant is FOUND BY SEARCH, never hardcoded, and must rewind byte-identically. Negative control: a state pinned ON the axis with no camera_steps must be fully Newman on its FIRST frame. Observed flight: 41.3 deg w=0.00 at t=0 through 23.6/16.8/10.4 all w=0.00, 5.1 deg w=0.24, 1.4 deg w=1.00.',
  });

  await flip('graph_overlay_annotation_is_painted_without_measuring_it_against_the_panel_clip_rect', {
    prevention_rule:
      'Every canvas-drawn overlay string is measured with measureText and fitted inside the panel clip rect before it is painted; a string that cannot fit is re-anchored to the opposite side, then slid inside, then shrunk to a STATED font floor, then wrapped at word boundaries - never allowed to run off. The placer is the ONLY paint path: a painter with any bare fillText call has left the class open at that site. The same discipline binds the DOM formula surface (Rule 34b): its box is measured against a band measured off the live neighbouring overlay, never a constant - the shipped 250px constant failed by 0.09px against a 250.09px string - and the unit is bound to the preceding token with U+00A0 so no wrap can orphan it. An axis a caption makes a claim about carries numeric ticks (Rule 33d).',
    probe_logic:
      'check:organic-structure section 17. The painter records every fillText as {text,x,y,width,height} in PM_orgTextBoxes against PM_orgTextClip; assert every box lies inside the clip on both axes over 3 curves x 5 reveal fractions x 2 bracket states x 4 poses (2064 boxes, 0 outside). Assert the painter source has ZERO bare g.fillText calls. NEGATIVE CONTROL: re-inject the pre-fix placer recording through the SAME recorder and require the SAME checker to trip - it reports the shipped caption reaching x=744 on a 700px panel. Second negative control: an over-long unit string trips the pre-fix placer while the shipped placer contains it. Also assert two draws of one state give byte-identical boxes (frozen-pin safety).',
  });

  const inserts = [
    {
      bug_class: 'projection_convention_withholds_the_mesh_and_silently_withholds_its_label_with_it',
      title: "A rendering convention that replaces an atom with a glyph deleted the atom's identity from the canvas while the HUD kept naming it",
      severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
      root_cause:
        "The Newman rim withheld the back carbon's SPHERE, and because the id sprite was slotted off the drawn-atom pool it disappeared with it. The HUD went on printing bond = C1-C2 over a canvas that named only C1, and the surviving C1 sprite was anchored 0.42 right + 0.34 up, which put its ink across the rim arc in near-white on near-white. Neither is visible to any DOM probe: both strings are 3-D sprites.",
      prevention_rule:
        "When a convention REPLACES a scene element with a glyph, the glyph inherits the element's identity: the label is anchored to the GLYPH, never dropped with the mesh, and it moves there on the same continuous weight the glyph fades in on. Anchors are solved against the drawn geometry, not fixed: the inner id sits inside the glyph clear of its stroke by its own measured ink half-width, and the outer id is placed in the direction of maximum clearance from every drawn disc. A rendered string that names an element by identifier requires that element to be named on the canvas at the same instant.",
      probe_type: 'js_eval',
      probe_logic:
        "check:organic-structure section 16. At the fully-formed projection, project both carbon id sprites and the rim into isotropic screen units and assert: the front id's ink reaches less than the arc radius minus a margin; the back id's ink starts beyond the arc radius plus a margin; the two ids' ink does not overlap; and the back id clears the nearest drawn disc by a positive margin, proving it was PLACED rather than parked in a fixed corner. Separately assert both ids are visible at every sample of the camera flight. Observed: C1 ink reaches 0.517 against an arc at 0.652; C2 ink starts at 0.830; centres 1.075 apart; C2 clears the nearest disc by 0.500 scene units.",
      status: 'FIXED', concepts_affected: ALL, fixed_in_files: [R, G],
      row_type: 'incident', subject: 'chemistry',
    },
    {
      bug_class: 'seized_explore_camera_leaves_every_view_dependent_construction_reading_the_solved_pose',
      title: 'Once a teacher orbits the sandbox the camera is theirs but the rim, the label anchors and the double-bond offsets still read the pose nobody is looking from',
      severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
      root_cause:
        'In explore, a trusted drag sets PM_orgCamSeized and the frame pass stops writing the spherical camera - but it keeps deriving basis, the rim orientation, the billboard offsets and now the Newman weight from the SOLVED pose. Every view-dependent construction is therefore oriented to a camera the teacher has left, and the projection convention does not dissolve as they orbit off the bond axis, which is precisely the thing the sandbox exists to let them discover.',
      prevention_rule:
        'A view-dependent construction reads the pose the camera is ACTUALLY at. Where a drag can seize the camera, the frame pass derives its basis from the live spherical state, not from the closed-form pose it would have written - and the closed-form branch must still be the one a freeze pin takes, so the read is guarded on the seize flag rather than made unconditional. Determinism is preserved because the engine writes spherical from the closed form on every unseized frame, and THE EYE never drags.',
      probe_type: 'js_eval',
      probe_logic:
        "Drive the explore state headlessly, orbit the camera 40 deg off the torsion bond axis, and assert the Newman weight falls to 0, the rim is withdrawn and the back carbon returns as a real mesh. Assert the rim's orientation quaternion tracks the dragged view. Negative control: with no drag, a freeze pin at the same instant reproduces byte-identical meshes, so the live read did not make the frame path-dependent.",
      status: 'OPEN', concepts_affected: ALL, fixed_in_files: [],
      row_type: 'incident', subject: 'chemistry',
    },
  ];
  const payload = inserts.map((r) => ({
    ...r,
    discovered_in_session: 'field3d_surgeon 2026-08-10 organic_structure_newman_legibility',
    fixed_at: r.status === 'FIXED' ? now : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  for (const r of inserts) console.log(`✓ [${r.severity}/${r.status}] ${r.bug_class}`);
}

main();
