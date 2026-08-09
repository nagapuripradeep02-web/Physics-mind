-- Checkpoint B scar candidates — ch6 concept #3 kinetic_energy_definition
-- Source: docs/loop_runs/ch6/kinetic_energy_definition/founder_proxy_B.md
--
-- ORDER IS LOAD-BEARING: the final UPDATE targets a bug_class that is INSERTed by
-- scar_candidates_checkpointA.sql. Apply checkpointA.sql FIRST or the UPDATE hits nothing.
--
-- Scar-apply hazard (recorded in this chapter, concept #2): every upsert here does
-- ON CONFLICT DO UPDATE SET status = EXCLUDED.status. Before applying, verify no row
-- below is already FIXED in the live table -- a verbatim apply would silently reopen a
-- closed row and discard its fixed_at.

INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('energy_bar_track_renders_no_scale_ceiling_so_two_states_draw_one_value_at_two_heights',
 'The energy panel track shows a fill fraction and a value but never its own maximum, so a state change that alters bar_max_J silently rescales every bar with nothing on screen saying so',
 'MODERATE', 'peter_parker:field3d_surgeon',
 'nlbApplyEnergyLayer builds the track as a bare div with a percentage fill and a value caption; bar_max_J is consumed only by nlbEnPct and never rendered. kinetic_energy_definition authors 45 J on the five guided states and 80 J on the explore state (forced: the sandbox peaks at 75.0 J, verified live at v0=-5,m=6, so 45 would overflow and peg). Measured: the identical reading 40.0 J draws a 165.3 px fill in STATE_1 and a 93.0 px fill in STATE_6.',
 'A magnitude meter whose maximum is authorable per state must render that maximum. Where a scale ceiling is not rendered, the concept must be forbidden from varying bar_max_J across states - and since an explore sandbox legitimately needs more headroom than its guided states, the engine owes the label rather than the author owing a single scale.',
 'js_eval',
 'For every state, read the authored energy_layer.bar_max_J and assert a text node inside the visible track element renders that number; separately assert that any two states rendering the same joule value produce fills within 2 percent of each other, or that both tracks carry a visible and different ceiling numeral.',
 'OPEN', ARRAY['kinetic_energy_definition']::text[], ARRAY[]::text[],
 'ch6-checkpointB-founder_proxy-kinetic_energy_definition', 'incident')
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,
  status = EXCLUDED.status, concepts_affected = EXCLUDED.concepts_affected;

INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('field3d_arrow_label_sprite_renders_at_under_half_the_body_label_glyph_height',
 'Arrow label sprites draw at roughly 6 px glyph height against a 14 px body billboard, so a symbol the term ledger says a state DEFINES is barely legible even though its contrast is fine',
 'MODERATE', 'peter_parker:field3d_surgeon',
 'The arrow label sprite scale in createLabelSprite is set independently of nlbBodyLabelText and is far smaller. Measured on kinetic_energy_definition STATE_3 frozen: the mg label ink bounding box is 13 x 6 px against the cart billboard at 72 x 14 px. This is NOT the nlb_arrow_and_arc_labels_never_received_the_force_rig_label_legibility_floor defect - contrast here measures 7.29:1 at m=4 and 8.42:1 at m=2 against the background, above the 4.5:1 floor, because these labels sit against the dark background rather than the apparatus. The two defects are independent and a fix to one does not touch the other.',
 'Arrow, arc and checkpoint label sprites must scale to at least 0.7 of the body-label glyph height in the same frame. Contrast and size are separate legibility axes and a scar row closing one must state explicitly that it does not close the other, or the second will be read as already fixed.',
 'js_eval',
 'For each visible arrow, arc and checkpoint label sprite, measure the ink bounding box height from the retained sprite canvas and assert it is at least 0.7 times the ink bounding box height of the nearest body label sprite in the same frame; assert independently of any contrast measurement.',
 'OPEN', ARRAY['kinetic_energy_definition','positive_negative_zero_work','work_done_by_constant_force']::text[], ARRAY[]::text[],
 'ch6-checkpointB-founder_proxy-kinetic_energy_definition', 'incident')
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,
  status = EXCLUDED.status, concepts_affected = EXCLUDED.concepts_affected;

INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('seam_r_ink_lift_reveals_sub_surface_force_arrows_fleet_wide_and_no_gate_reads_it_as_a_change',
 'Lifting force ink out of the depth buffer makes every weight arrow on a body resting on a surface draw the sub-floor portion that was previously occluded, across already-shipped concepts, and the only gate that sees it reports a sub-1-percent pixel diff that passes',
 'MAJOR', 'peter_parker:field3d_surgeon',
 'SEAM R correctly rejected originating force ink at the body surface (measured burial 0.645 world units against 0.455 of solid, the extra 0.19 being the slab camera-dependent screen silhouette) and instead lifted force ink out of the depth buffer. The side effect is fleet-wide: on kinetic_energy_definition STATE_3 the mg arrow now spears the slab with its head roughly 55 px into empty space below the floor, shaft contrast 13.89:1. THE EYE regression reported normal_force at 0.28-0.85 percent, the largest of the three swept concepts and consistent with exactly this, but a pixel-diff tolerance cannot distinguish a rendering improvement from an unreviewed picture change on shipped content.',
 'A platform change to how any ink is composited must enumerate the shipped concepts whose PICTURE changes, not only whether their baselines stay inside tolerance, and route the enumerated list for founder visual review before the branch merges. A percentage diff under tolerance is evidence that nothing broke, never evidence that nothing changed.',
 'manual',
 'For each shipped concept authoring arrows on a body in contact with a surface, capture the frozen frame before and after the ink-compositing change and present both to the founder side by side; ask explicitly whether force ink should clip at the contact surface or draw through it, and record the ruling as a directive row.',
 'OPEN', ARRAY['kinetic_energy_definition','normal_force','friction_force','block_on_incline','rolling_friction']::text[],
 ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
 'ch6-checkpointB-founder_proxy-kinetic_energy_definition', 'incident')
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,
  status = EXCLUDED.status, concepts_affected = EXCLUDED.concepts_affected;

-- UPDATE, not a new class: corrects the trigger on founder_proxy's own Checkpoint A row.
-- Requires scar_candidates_checkpointA.sql to have been applied first.
UPDATE engine_bug_queue SET
  title = 'The energy panel reflow ladder drops two-group states one rung at the SHIPPED iframe height, not only on small screens, so the same joule value draws at two heights across adjacent states',
  root_cause = 'nlbFitEnergyPanel steps the panel down when its bottom passes innerHeight minus 12. Checkpoint A estimated the trigger at a viewport below roughly 579 px and concluded THE EYE at 1280x720 could never see it. Measured live on the built review site: the SIM IFRAME is 1052 x 551, not 1280 x 720, so two-group states run at NLB_EN_STEPS[1] (138 px track) on every screen including every EYE baseline, while single-group states run at step 0 (186 px). STATE_1 renders 40.0 J at 165.3 px and STATE_2 renders the same 40.0 J at 122.7 px, at an adjacent state boundary.',
  prevention_rule = 'Never derive a layout threshold from the browser viewport when the renderer runs inside an iframe - measure the iframe. Any design resting on bar height is void across states by construction; anchor the claim on the rendered numeral and the fill FRACTION, which nlbEnPct writes as a percentage and which is therefore invariant under the ladder. This is now confirmed on live pixels, not inferred.',
  severity = 'MAJOR',
  concepts_affected = ARRAY['kinetic_energy_definition','work_energy_theorem','conservation_of_mechanical_energy','mechanical_energy_loss_with_friction']::text[]
WHERE bug_class = 'shared_bar_scale_cross_state_guarantee_is_void_when_the_panel_reflow_ladder_drops_a_step';
