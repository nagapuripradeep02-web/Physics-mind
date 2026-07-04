-- supabase_2026-07-04_seed_eddy_currents_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 drill-down clusters for
-- eddy_currents.json (Class 12 Ch.6 §6.8 Eddy Currents). Authored 2026-07-04
-- by json_author from the physics-author drill-down trigger phrasings.
--
-- Cluster placement:
--   STATE_2 (loop_mechanism — PRIMARY aha: closed loops form in solid metal) — 3 clusters
--   STATE_3 (lenz_direction — grip rule fixes circulation, drag always opposes) — 3 clusters
--   STATE_4 (slots_contrast — SUPPORTING aha: connectivity, not material, controls damping) — 3 clusters
--
-- STATE_2, STATE_3, STATE_4 carry has_prebuilt_deep_dive: true + drill_downs: [...]
-- in the JSON.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO NOTHING per the
-- json_author output contract for this concept (idempotent, additive-only).
-- NOT applied here — quality_auditor's pre-run step applies this migration.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'solid_metal_can_carry_current',
  'eddy_currents',
  'STATE_2',
  'How can current flow inside a solid metal block with no wires?',
  'Student assumes current requires a wire or a wound coil as a physical path, not seeing that any conductor supports circulating current wherever a changing local flux drives it — the bulk metal itself is the path.',
  ARRAY[
    'how can current flow inside a solid metal block',
    'isnt current only possible in wires',
    'there is no wire here so how is there current',
    'solid metal has no path for current to go',
    'current needs a loop of wire not a flat plate right'
  ],
  'pending_review'
),
(
  'why_current_forms_a_loop_not_just_flow',
  'eddy_currents',
  'STATE_2',
  'Why does the induced current go in a closed loop instead of just flowing through?',
  'Student expects a simple one-directional flow (as through a wire) rather than seeing that a changing local flux drives charges around a closed circulating path within the conductor, self-closing without any external circuit.',
  ARRAY[
    'why does it go in a circle inside the metal',
    'shouldnt the current just flow straight through the plate',
    'why is it a closed loop and not just moving charges',
    'who closes the circuit if there is no wire loop',
    'why does the current curve back on itself'
  ],
  'pending_review'
),
(
  'where_exactly_do_eddy_currents_live',
  'eddy_currents',
  'STATE_2',
  'Does the whole plate carry eddy current, or just the edge crossing the field?',
  'Student has not connected "only a CHANGING flux induces a current" (from faraday_law_induction) to the bulk-conductor case, so does not predict that the loops localize exactly where flux is locally changing (the moving boundary) and fade where flux is locally steady (fully in or fully out of the field).',
  ARRAY[
    'does the whole plate carry eddy current or just the edge',
    'why does it glow only near the boundary line',
    'so is current everywhere inside the metal or just one spot',
    'why does it fade when the plate is fully inside the field',
    'if the plate is completely in the field why no current there'
  ],
  'pending_review'
),
(
  'is_eddy_current_direction_random',
  'eddy_currents',
  'STATE_3',
  'Can the eddy current loop go either way, or does it ever help the motion?',
  'Student is uncertain whether the loop''s circulation direction is fixed or arbitrary, not yet trusting that Lenz''s law deterministically fixes it to always oppose the plate''s own motion, on both edges, every time.',
  ARRAY[
    'can the eddy current go either way randomly',
    'is the loop direction just by chance',
    'why cant it go the other way sometimes',
    'does direction depend on which way I look at it',
    'so the current picks a random direction each time'
  ],
  'pending_review'
),
(
  'why_use_grip_rule_not_slap_rule',
  'eddy_currents',
  'STATE_3',
  'Why the grip rule here, and not the right-hand rule used for the rod?',
  'Student confuses the grip rule (fixes a whole circulating LOOP''s direction, thumb gives the loop''s own induced-B) with the cross-product rule used in motional_emf (fixes force on a single moving charge), not seeing these answer different kinds of questions.',
  ARRAY[
    'why grip rule here not the other hand rule',
    'which rule do I use loop or single charge',
    'in motional emf we used a different hand rule why is this one different',
    'why curl fingers instead of pointing them',
    'how do I know when to use grip vs the other rhr'
  ],
  'pending_review'
),
(
  'does_drag_stay_same_or_change_each_instant',
  'eddy_currents',
  'STATE_3',
  'Is the eddy-current drag force constant, like ordinary friction?',
  'Student models the retarding force as a fixed rubbing-type friction force, not seeing that it is freshly generated each instant by the loop-field interaction and depends on how fast the boundary is being crossed.',
  ARRAY[
    'is the drag force constant like friction',
    'does the retarding force stay same the whole swing',
    'why does it feel like friction if its not friction',
    'is a new current made every instant or is it the same current',
    'so eddy drag is not steady like normal friction'
  ],
  'pending_review'
),
(
  'why_does_cutting_metal_reduce_current',
  'eddy_currents',
  'STATE_4',
  'Why does cutting slots in the plate reduce the eddy-current drag?',
  'Student cannot see how cutting metal changes anything electrical, not yet connecting that slots interrupt the closed current PATH, breaking one big strong loop into many small, weak, disconnected ones.',
  ARRAY[
    'why does cutting slots reduce the current',
    'same metal so why less drag after slotting',
    'how do slots stop the eddy current',
    'cutting shouldnt change how good a conductor it is right',
    'why does a few cuts make such a big difference'
  ],
  'pending_review'
),
(
  'does_slotting_change_resistivity',
  'eddy_currents',
  'STATE_4',
  'Does cutting slots change the metal''s resistivity?',
  'Student conflates connectivity (the shape/path of the current loop) with a material property (resistivity), not seeing that the metal itself is physically unchanged — only the geometry of the available current path is.',
  ARRAY[
    'does slotting make the metal a worse conductor',
    'is resistivity different after cutting the plate',
    'so the material itself became bad conductor',
    'did cutting change what the metal is made of',
    'why does resistance of the material change from slots'
  ],
  'pending_review'
),
(
  'is_the_slotted_plate_still_a_conductor',
  'eddy_currents',
  'STATE_4',
  'Is the slotted plate still a conductor at all?',
  'Student overreaches from "damping is much weaker" to "there is no current at all," not seeing that small loops still form within each segment (s_slot never reaches exactly zero) — the effect is reduced, never eliminated.',
  ARRAY[
    'is the slotted plate still conducting at all',
    'does the plate stop carrying current completely',
    'so no current flows in the slotted plate ever',
    'are the small pieces still metal or now insulators',
    'why is there still a tiny bit of drag if its slotted'
  ],
  'pending_review'
)
ON CONFLICT (cluster_id) DO NOTHING;

-- Verify:
-- SELECT cluster_id, state_id FROM confusion_cluster_registry
--   WHERE concept_id = 'eddy_currents' ORDER BY state_id, cluster_id;
-- Should return 9 rows (3 STATE_2, 3 STATE_3, 3 STATE_4).
