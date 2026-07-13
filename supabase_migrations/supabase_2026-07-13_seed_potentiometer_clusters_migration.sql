-- supabase_2026-07-13_seed_potentiometer_clusters_migration.sql
-- Seeds confusion_cluster_registry with 3 clusters for potentiometer.json
-- — the ELEVENTH concept on the particle_field (2D p5.js) renderer, same
-- engine family as drift_velocity/ohms_law/resistivity/combination_of_resistors/
-- emf_definition/internal_resistance/electrical_power_in_resistor/
-- kirchhoff_junction_rule_KCL/kirchhoff_loop_rule_KVL/wheatstone_bridge
-- (REUSES the combination_of_resistors scenario_type as the renderer selector
-- — no new scenario flag, per the approved design's "do NOT mint a new
-- scenario_type" directive; rides a NEW topology:'wire' per-state flag
-- instead). Second of the founder's lab trio (Wheatstone c20 -> potentiometer
-- c23 -> meter bridge).
-- Authored 2026-07-13 by alex:json_author per architect skeleton §6 +
-- physics_author drill-down trigger phrases (verbatim, physics block §7).
--
-- Migration is AUTHORED, NOT APPLIED — quality_auditor's pre-run step
-- applies it (json_author is forbidden from apply_migration). Drill-down
-- itself is DEFERRED (Rule 18, 2026-06-10 directive) — the
-- confusion_cluster_registry Gate-8 probe is N/A-DORMANT this phase per the
-- documented false-FAIL scar (memory: auditor-cluster-registry-false-fail).
-- Do not let the auditor re-route json_author to "fix" this.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real student-voice phrasings (lowercase,
-- idiomatic, no textbook prose), verbatim from the physics block §7.
-- status='pending_review' per the current cluster-registry convention.
--
-- Candidate cluster_ids (architect skeleton §6 — no has_prebuilt_deep_dive
-- flags authored on the concept itself; V1 ships ZERO authored deep-dives):
--   STATE_3 — "the galvanometer/jockey draws current from the cell like any
--             meter" (fired inline via misconception_watch per Rule 16a
--             founder guardrail — no per-state tic) AND the deeper "zero
--             deflection just means tiny, not none" variant (drill-down only)
--   STATE_4 — "a voltmeter reads the true EMF" (fired inline via
--             misconception_watch), plus the driver-cell-role confusion that
--             sits upstream of the whole apparatus (drill-down only)

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 null_method_draws_no_current deep-dive ───────────────────
(
  'null_method_draws_no_current',
  'potentiometer',
  'STATE_3',
  'Does the galvanometer have to draw at least a little current to register a reading?',
  'Student assumes ANY meter reading requires SOME current to flow through it, the way an ordinary ammeter or voltmeter would — so a true zero feels impossible, only a very small deflection that "looks like" zero. It doesn''t: at balance the tapped drop (k·l) exactly equals the tested cell''s EMF, so the potential difference across the tap branch is EXACTLY zero, and by Ohm''s law the current through it is exactly zero too — regardless of the galvanometer''s own resistance, large or small. The sim shows this explicitly: the tap-branch beads drain to none and the needle settles dead at the centre, while the driver-loop beads keep streaming past the jockey the entire time, proving the wire itself is still very much alive.',
  ARRAY[
    'the galvanometer has to draw some current to give a reading',
    'at balance the meter must still be measuring something',
    'how can it read zero and still tell you the emf',
    'doesnt zero deflection just mean tiny not none',
    'if no current flows how does the needle even move to show balance'
  ],
  'pending_review'
),
-- ─── STATE_4 voltmeter_reads_true_emf deep-dive ───────────────────────
(
  'voltmeter_reads_true_emf',
  'potentiometer',
  'STATE_4',
  'Why not skip the wire and jockey entirely and just read a voltmeter across the cell?',
  'Student assumes an ordinary voltmeter placed straight across the tested cell would read its true EMF directly, making the whole potentiometer apparatus feel like unnecessary effort. It doesn''t: any real voltmeter has a finite resistance, so connecting it lets current flow through the cell''s own internal resistance, and the meter reads only the smaller terminal voltage E − I·r — in this sim, 1.35 V instead of the true 1.50 V. The potentiometer''s null method is the only reading that draws zero current from the cell, so it is the only one that reads the true, undisturbed EMF; the sim puts both readings side by side, the voltmeter dial visibly drooping while the null beside it never moves.',
  ARRAY[
    'just put a voltmeter across the cell it reads the emf directly',
    'why not skip the wire and jockey and use a voltmeter',
    'isnt a voltmeter reading close enough to the real emf',
    'whats wrong with reading voltage straight off a meter',
    'why does the voltmeter number come out lower than the actual emf'
  ],
  'pending_review'
),
-- ─── driver_cell_role_confused deep-dive (apparatus-level, no single guided-state pivot) ───
(
  'driver_cell_role_confused',
  'potentiometer',
  'STATE_1',
  'Why does the potentiometer need a second, driver cell at all — and what happens if it is too small?',
  'Student wonders why a SECOND cell (the driver) is needed when the goal is just to measure the FIRST (tested) cell''s EMF — surely the tested cell could drive the wire itself? It can''t serve both roles at once: the driver cell''s job is to establish a steady, known potential gradient (k = ε_d/L) along the wire, completely independent of the cell being tested, so the tested cell can be compared against that gradient without ever being asked to supply current itself. The apparatus also has an honest failure mode worth surfacing: if the driver EMF is smaller than the tested cell''s EMF, the tapped drop k·l can never reach E anywhere along the wire (l is capped at L), so no balance point exists at all — the explore state (STATE_5) lets a student find this out directly by dragging the driver EMF below the tested EMF and watching the null become unreachable.',
  ARRAY[
    'why do you need a second battery',
    'cant the tested cell just drive the wire itself',
    'whats the driver cell even for',
    'what happens if the driver voltage is smaller than the cells emf',
    'why does the balance point disappear when i turn the driver voltage down'
  ],
  'pending_review'
)
ON CONFLICT (cluster_id) DO UPDATE
SET concept_id        = EXCLUDED.concept_id,
    state_id          = EXCLUDED.state_id,
    label             = EXCLUDED.label,
    description       = EXCLUDED.description,
    trigger_examples  = EXCLUDED.trigger_examples,
    status            = EXCLUDED.status,
    updated_at        = now();
