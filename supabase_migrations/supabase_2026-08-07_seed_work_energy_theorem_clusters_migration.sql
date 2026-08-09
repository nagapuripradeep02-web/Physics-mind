-- supabase_2026-08-07_seed_work_energy_theorem_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for
-- work_energy_theorem.json — Class 11 Ch.6 Work, Energy and Power #4,
-- authored against the same newtons_laws_body field_3d engine as #1/#2/#3,
-- and the FIRST concept in the fleet to author the SEAM L energy_layer AND
-- SEAM M work_accumulators TOGETHER (the engine's own panel header reads
-- "Energy and work bars"). chapter:6, section:"6.2",
-- prerequisites: ["work_done_by_constant_force","positive_negative_zero_work",
-- "kinetic_energy_definition"].
--
-- Authored 2026-08-07 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/ch6/
-- work_energy_theorem/physics_block.md §5):
--   STATE_3 — applied_work_vs_net_work, pulling_but_speed_constant,
--             zero_net_work_while_moving;
--   STATE_4 — forgot_initial_kinetic_energy, negative_then_positive_net_work,
--             net_work_when_body_reverses.
--
-- Migration is AUTHORED, NOT APPLIED. json_author's own tooling forbids
-- `apply_migration` — this file is left for the founder / quality_auditor's
-- pre-run step. Drill-down itself is DEFERRED (Rule 18, 2026-06-10 directive)
-- — the confusion_cluster_registry Gate-8 probe is N/A-DORMANT this phase per
-- the documented false-FAIL scar (memory: auditor-cluster-registry-false-fail).
-- Do not let the auditor re-route json_author to "fix" this.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- status='pending_review' per the current cluster-registry convention.
--
-- has_prebuilt_deep_dive picks (architect skeleton §5, metadata only, Rule 18):
-- STATE_3 (only_net_counts — the stickiest idea: work by a force vs net work
-- on the body) and STATE_4 (change_not_total — the dropped-K0 error, plus
-- signed net work through a reversal). Both states carry a drill_downs array
-- in the concept JSON referencing these cluster_ids.
--
-- BOUNDARY NOTE, binding on every description below: this concept owns the
-- RELATION W_net = delta K. It never re-derives what work IS or W = F d cos
-- theta (work_done_by_constant_force's content), never re-teaches the sign
-- taxonomy of work by angle (positive_negative_zero_work's content), never
-- re-derives what kinetic energy IS (kinetic_energy_definition's content),
-- never says "lost", "heat" or "dissipated" (mechanical_energy_loss_with_friction's
-- content), and never compares paths (conservative_vs_nonconservative_forces's
-- content). No description here may cross any of those lines.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 applied_work_vs_net_work deep-dive ─────────────────────────
(
  'applied_work_vs_net_work',
  'work_energy_theorem',
  'STATE_3',
  'Isn''t the pull''s own work the real work here?',
  'Student watches the pull bar climb to a genuine +98.0 J and reasonably expects that number to be the theorem''s answer, since the pull is doing real, honest, measurable work the entire time. The pull''s +98.0 J is not wrong, not fictional and not a rounding artifact — it is a completely real quantity. What it is NOT is the net work, because friction is also acting on the same crate over the same distance, and friction''s work is a real, honest −98.0 J of its own. The theorem reads the NET work, the signed SUM of every force''s work on the body: +98.0 J plus −98.0 J equals exactly 0.0 J, and by the theorem, zero net work means exactly zero change in kinetic energy — which is precisely the flat 15.6 J the K bar holds the whole loop. Nothing about the pull''s own work needs to be doubted; the theorem simply never asked for it alone.',
  ARRAY[
    'isnt the pulls work the real work here',
    'why doesnt the 98 joules count as the answer',
    'the force did work so why is the energy not changing',
    'if the pull did positive work why does k stay the same',
    'why is only the net work important and not each force'
  ],
  'pending_review'
),
-- ─── STATE_3 pulling_but_speed_constant deep-dive ───────────────────────
(
  'pulling_but_speed_constant',
  'work_energy_theorem',
  'STATE_3',
  'If I''m still pulling, why isn''t the crate speeding up?',
  'Student sees a 19.6 N pull acting the whole time and expects a body under an acting force to accelerate, so a speed that stays fixed at 2.5 m/s feels contradictory. Nothing about the pull is switched off or reduced: it is a full, steady 19.6 N the entire loop. What removes the acceleration is a SECOND force acting at the same time — kinetic friction, authored here at exactly the same 19.6 N, pointing the other way. The pull and friction are two separate, complete forces that happen to cancel in size, so the crate''s NET force is zero, and by the same logic the theorem reads, the NET work is zero too: the pull''s +98.0 J and friction''s −98.0 J sum to 0.0 J, which is exactly why the kinetic energy — and therefore the speed — never changes. A steady pull does not guarantee acceleration; it guarantees acceleration only once you know every OTHER force acting at the same time.',
  ARRAY[
    'if im still pulling why isnt it speeding up',
    'constant speed but a force is acting how',
    'why does the crate not accelerate even though something pushes it',
    'equal forces cancel but the pull still did work right',
    'how can speed stay the same with a force on it'
  ],
  'pending_review'
),
-- ─── STATE_3 zero_net_work_while_moving deep-dive ───────────────────────
(
  'zero_net_work_while_moving',
  'work_energy_theorem',
  'STATE_3',
  'Zero net work, but the crate clearly moved — how does that make sense?',
  'Student conflates "zero work" with "nothing happened," so a crate that visibly crosses five metres of floor while the net-work bar sits parked on the zero line looks like a contradiction. Work is not a report on whether a body moved; the theorem''s NET work is a report on whether the body''s KINETIC ENERGY changed. Motion continuing at a fixed, unchanging speed is exactly the picture zero net work predicts: the crate keeps travelling because nothing is stopping it — no force is even trying to, since the pull and friction''s works exactly cancel — and it neither speeds up nor slows down because K has nothing added or removed. Zero net work while moving is not a special exception to the theorem; it is the theorem''s ordinary statement about a body at constant velocity, read correctly: zero change in K, not zero motion.',
  ARRAY[
    'zero work but the thing is still moving how',
    'can something move a lot and still have zero work done on it',
    'moving 5 metres but net work is 0 doesnt make sense',
    'if net work is zero shouldnt it be standing still',
    'hows zero net work possible when the crate clearly moved'
  ],
  'pending_review'
),
-- ─── STATE_4 forgot_initial_kinetic_energy deep-dive ────────────────────
(
  'forgot_initial_kinetic_energy',
  'work_energy_theorem',
  'STATE_4',
  'Why can''t I just use the final speed for the work done?',
  'Student computes ½mv² at the end of the run — 46.1 J for this cart — and reports that number as the net work, which is exactly the exam-standard slip the theorem is built to catch. The theorem is W_net = delta K = ½mv² MINUS ½mv0², a CHANGE, not a single reading. This cart did not start from rest: it started already carrying 18.0 J of kinetic energy (from its initial 3 m/s launch), so the net work over the whole run is the final 46.1 J with the starting 18.0 J subtracted out — 46.1 minus 18.0 equals 28.1 J, which is exactly what the net-work bar reads at the loop''s end. Dropping the starting kinetic energy silently overstates the net work by however much energy the body already had; the fix is not a different formula, it is remembering that every "final" reading needs its own starting reading subtracted before it means net work.',
  ARRAY[
    'why cant i just use the final speed for the work done',
    'why do i need the starting speed too',
    'isnt net work just half m v squared at the end',
    'why subtract the starting energy from the final one',
    'i keep forgetting the initial ke in this formula'
  ],
  'pending_review'
),
-- ─── STATE_4 negative_then_positive_net_work deep-dive ──────────────────
(
  'negative_then_positive_net_work',
  'work_energy_theorem',
  'STATE_4',
  'How can net work go from negative to positive in the same run?',
  'Student watches the same net-work bar dive to −18.0 J and later climb past zero to +28.1 J and wonders whether the sign of work is somehow switching or the pull itself is changing direction — it is not; the pull stays a steady +12 N the entire run. The net-work bar always measures the change in kinetic energy MEASURED FROM THE START, at every instant, not a fixed property of any one force. While the cart is still slowing toward the turn, its kinetic energy is BELOW the starting 18.0 J, so the net-so-far reads negative; once the cart has turned and sped back up past its starting kinetic energy, the net-so-far reads positive. The same +12 N pull is acting throughout — what changes is not the force''s sign, but whether the crate''s CURRENT kinetic energy sits below or above where it started, which is exactly what the theorem''s ΔK asks.',
  ARRAY[
    'how can net work go from negative to positive in the same run',
    'does the sign of work flip when the cart turns around',
    'why is net work negative first and then positive later',
    'can work done change sign partway through the motion',
    'the net went from minus to plus what does that mean'
  ],
  'pending_review'
),
-- ─── STATE_4 net_work_when_body_reverses deep-dive ──────────────────────
(
  'net_work_when_body_reverses',
  'work_energy_theorem',
  'STATE_4',
  'What happens to net work exactly at the instant the cart reverses?',
  'Student expects the theorem to need a special rule, an exception, or an undefined moment right at the turnaround, where the cart''s velocity is exactly zero and its direction is about to flip. Nothing special happens to the theorem there: at that exact instant the kinetic energy is 0.0 J (any body at rest has zero kinetic energy, whichever way it is about to move), so the net work so far is 0.0 minus the starting 18.0 J, which is exactly −18.0 J — the SAME formula, applied at the SAME instant, with no branch or exception. The reversal is not a discontinuity in the theorem; it is simply the single instant where the kinetic energy happens to be at its lowest, and the net-work bar reads its most negative value there because that is where the CHANGE from the start is largest. The theorem holds continuously, before, during and after the turn, with the identical W_net = delta K relation at every frame.',
  ARRAY[
    'what happens to net work exactly when the speed is zero',
    'does the theorem still work when the object turns around',
    'is there some special rule for when velocity reverses',
    'why does the formula still work through the turning point',
    'at the exact moment it stops and reverses whats the net work'
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

-- ── concept_panel_config registration (defensive dual-registration) ───────
-- CLAUDE.md §6 registration site 2 offers TWO alternative mechanisms — a SQL
-- INSERT into this table OR CONCEPT_PANEL_MAP in src/config/panelConfig.ts.
-- This concept is ALSO registered in code (CONCEPT_PANEL_MAP in
-- src/config/panelConfig.ts, layout 'single', renderer field_3d — required by
-- Gate 8b's registration cross-check in validate-concepts.ts, which asserts
-- every concept_id parses out of panelConfig.ts or FAILs the fleet run).
-- Included here as belt-and-suspenders so the DB and the code registration
-- agree, mirroring work_done_by_constant_force's 2026-08-01,
-- positive_negative_zero_work's 2026-08-02 and kinetic_energy_definition's
-- 2026-08-02 migrations.
--
-- Values mirror the code registration exactly: single panel, field_3d, and
-- sonnet_can_upgrade FALSE because a field_3d diamond is authored config,
-- never an LLM-upgradable panel (Rule 5/18).
--
-- NOTE: this concept_id COLLIDES with a legacy, never-registered mechanics_2d
-- entry of the same name (an old Ch.9 catalog concept — 'dual_horizontal',
-- config_key 'work_energy_theorem_sim'/'work_energy_theorem_graph' — that
-- was never in VALID_CONCEPT_IDS and had no concept JSON). That dead entry
-- has been REMOVED from CONCEPT_PANEL_MAP and CONCEPT_RENDERER_MAP in code
-- (2026-08-07) in favour of this live field_3d atomic, mirroring the
-- rolling_on_incline precedent (2026-08-04). This INSERT targets the SAME
-- concept_id and is the single live row for it.
INSERT INTO concept_panel_config (
    concept_id, default_panel_count, panel_a_renderer, panel_b_renderer,
    sonnet_can_upgrade, upgrade_max, verified_by_human, reasoning,
    technology_a, class_level, chapter
) VALUES (
    'work_energy_theorem',
    1,
    'field_3d',
    NULL,
    FALSE,
    1,
    FALSE,
    'Ch.6 Work, Energy and Power #4 (2026-08-07). Single-panel field_3d diamond on the newtons_laws_body scenario engine, and the FIRST concept in the fleet to author the SEAM L energy_layer AND SEAM M work_accumulators TOGETHER (the engine own panel header reads "Energy and work bars" -- kinetic_energy_definition said "Energy bars", work_done_by_constant_force and positive_negative_zero_work said "Work done"). The net work done on a body equals the change in its kinetic energy, W_net = delta K = half m v^2 minus half m v0^2: shown positive (a lone pull fills K in lockstep with the net-work bar), shown negative (friction alone empties it), confronted (only the NET work changes K, never one force own work, even when that force does large nonzero work), shown as a CHANGE from the starting energy through a velocity reversal, and derived from F = ma. Pure configuration, zero renderer edits (0d). Mirrors CONCEPT_PANEL_MAP in src/config/panelConfig.ts. sonnet_can_upgrade FALSE: field_3d concepts are pure authored configuration and are never upgraded by an LLM at serving time (Rule 5/18).',
    'threejs',
    11,
    '6'
)
ON CONFLICT (concept_id) DO UPDATE
SET default_panel_count = EXCLUDED.default_panel_count,
    panel_a_renderer    = EXCLUDED.panel_a_renderer,
    panel_b_renderer    = EXCLUDED.panel_b_renderer,
    sonnet_can_upgrade  = EXCLUDED.sonnet_can_upgrade,
    upgrade_max         = EXCLUDED.upgrade_max,
    reasoning           = EXCLUDED.reasoning,
    technology_a        = EXCLUDED.technology_a,
    class_level         = EXCLUDED.class_level,
    chapter             = EXCLUDED.chapter;
