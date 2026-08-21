-- supabase_2026-08-14_seed_rotational_work_energy_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for
-- rotational_work_energy.json — Class 11 Ch.7 Systems of Particles and
-- Rotational Motion (rotmech), authored against the rigid_body_rotation
-- field_3d engine (0c-1). chapter:9, section:"9.8",
-- prerequisites: ["work_done_by_constant_force"].
--
-- Authored 2026-08-14 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/rotmech/
-- rotational_work_energy/physics_block.md §5):
--   STATE_3 — why_angle_not_time, negative_work_sign,
--             torque_times_angle_is_joules;
--   STATE_4 — where_does_the_lost_energy_go, rotational_work_energy_theorem,
--             energy_falls_faster_than_speed.
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
-- has_prebuilt_deep_dive picks (architect skeleton §6, metadata only, Rule 18):
-- STATE_3 ("why the angle and not the time?" is where students stall, and
-- where W = F·d must be re-seated) and STATE_4 (energy bookkeeping is where
-- exam mistakes concentrate, and it carries the PRIMARY aha). Both states
-- carry a drill_downs array in the concept JSON referencing these
-- cluster_ids.
--
-- BOUNDARY NOTE, binding on every description below: this concept owns the
-- RELATION W = τθ and the theorem W = ΔKE for a rotating body of CONSTANT I.
-- It never re-derives what torque is (torque, not yet shipped), how I is
-- computed from a mass distribution (moment_of_inertia, not yet shipped),
-- how a torque produces angular acceleration (tau_eq_i_alpha, not yet
-- shipped), angular momentum (angular_momentum, not yet shipped), or the
-- kinetic-energy split in rolling motion (pure_rolling, rolling_on_incline,
-- not yet shipped). No description here may cross any of those lines. The
-- apparatus never displays m, r or the drum radius as numbers (DoD hard
-- prohibition) — no description below quotes them either.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 why_angle_not_time deep-dive ────────────────────────────────
(
  'why_angle_not_time',
  'rotational_work_energy',
  'STATE_3',
  'Why angle, and not how long the brake pushed?',
  'Student watches the brake act continuously and reasonably expects that TIME — how long the torque pushed — is what belongs in the work formula, the same instinct that expects a longer shove to always mean more work. Time is not wrong to think about, but it is the wrong quantity for THIS formula: W = τθ measures work through the ANGLE the body turns while the torque acts, exactly mirroring the straight-line case, where W = F·d measures work through the DISTANCE a body travels, never the time the force acted for. A torque that pushes for a long time but turns the wheel through only a small angle — for instance, a very weak brake barely denting a fast spin — does very little work, no matter how long the clock runs; a torque that turns the wheel through a large angle quickly does much more. The rod''s own sweep is the running tally the work counter is built from, not the ticking clock beside it. Time decides how FAST the work is done — that quantity is power, τω — but the work ITSELF is set by torque times the angle turned, never by torque times time.',
  ARRAY[
    'why does angle matter and not how long the brake pushed',
    'does it matter how long the torque acts or just how far it turns',
    'why not use seconds for work instead of the angle',
    'the brake pushes the whole time so why does only the angle count',
    'why is time not part of the work formula'
  ],
  'pending_review'
),
-- ─── STATE_3 negative_work_sign deep-dive ────────────────────────────────
(
  'negative_work_sign',
  'rotational_work_energy',
  'STATE_3',
  'Why is the work negative if the brake is clearly doing something?',
  'Student sees the brake pad pressed firmly against the spinning rim, doing something very real and very physical, and struggles to square that with a work counter that keeps climbing further into negative numbers rather than a comfortable positive total. The brake is doing real work the entire time — the minus sign is not a statement that no work happened, or that the work somehow does not count. It is a statement about DIRECTION: which way energy is flowing. Positive work on a spinning body means energy is being ADDED to it, the way a hand pushing a swing higher adds energy; negative work means energy is being REMOVED, exactly what a brake''s whole job is. The torque here points opposite to the spin — it opposes the turn rather than helping it along — and that opposition is precisely what the negative sign records. A negative value on the work counter is not a smaller amount of work, nor a broken formula; it is the correct, honest report that this particular torque''s job is to take energy OUT of the wheel, not put it in.',
  ARRAY[
    'why is the work negative',
    'does negative work mean less work was done',
    'what does the minus sign on W actually mean',
    'is negative work even real work',
    'why isnt the work just zero if the wheel is slowing down'
  ],
  'pending_review'
),
-- ─── STATE_3 torque_times_angle_is_joules deep-dive ──────────────────────
(
  'torque_times_angle_is_joules',
  'rotational_work_energy',
  'STATE_3',
  'How does newton-metres times radians give joules?',
  'Student multiplies the torque meter''s newton-metres by the angle meter''s radians and lands on a unit that LOOKS like N·m·rad, not the plain joules the work counter actually prints, and reasonably wonders where the radian went. The radian is not lost or cancelled by a trick — it is DIMENSIONLESS by its own definition: an angle in radians is one arc length divided by another length (the radius), a ratio of two lengths, so the two length units cancel completely and leave a pure number with no unit of its own attached. That is exactly why multiplying a torque in newton-metres by an angle in radians gives newton-metres, which IS the joule — the same unit force-times-distance work already uses, since a newton-metre and a joule are the identical combination of base units under two different names, one for straight-line work and one for rotational work. Nothing new or unusual is happening in the rotational formula; the radian silently contributes a factor of one and steps out of the way, leaving torque times angle measured in exactly the same energy unit as force times distance.',
  ARRAY[
    'how does newton metre times radian give joules',
    'why does the radian not show up as a unit',
    'torque times angle looks nothing like force times distance',
    'where did the joules come from if theta has no unit',
    'is N m the same as a joule or not'
  ],
  'pending_review'
),
-- ─── STATE_4 where_does_the_lost_energy_go deep-dive ─────────────────────
(
  'where_does_the_lost_energy_go',
  'rotational_work_energy',
  'STATE_4',
  'If energy cannot disappear, where does the lost kinetic energy actually go?',
  'Student watches the kinetic energy meter and its bar fall steadily and, holding onto the correct instinct that energy cannot simply vanish, wonders where that lost energy has actually gone — a fair question the sim''s own instruments do not directly answer, since neither a thermometer nor a sound meter is rendered here. The wheel''s rotational kinetic energy is genuinely leaving the wheel, not being destroyed: the brake pad presses against the rim with real friction, and that friction converts the wheel''s organized kinetic energy into heat at the rubbing surfaces (the potter''s-wheel anchor names exactly this — a hand pressed to a slowing wheel''s rim grows warm, which is the same energy transfer happening here) and, more faintly, into the sound of the brake''s squeal. None of this is invented outside the physics taught: the work-energy theorem this state teaches, W equals the change in kinetic energy, is precisely the accounting statement that the energy the wheel loses equals the (negative) work the brake does on it — the theorem describes the TRANSFER exactly, even though the sim''s own dial does not paint a thermometer.',
  ARRAY[
    'where does the energy actually go',
    'does the energy just disappear',
    'is the lost kinetic energy turned into heat',
    'why does the wheel get warm when it slows down',
    'if energy is conserved where did the lost energy end up'
  ],
  'pending_review'
),
-- ─── STATE_4 rotational_work_energy_theorem deep-dive ────────────────────
(
  'rotational_work_energy_theorem',
  'rotational_work_energy',
  'STATE_4',
  'Is this the same work-energy theorem as before, just for spinning things?',
  'Student has already met the work-energy theorem for straight-line motion — the net work on a body equals the change in its (translational) kinetic energy — and reasonably asks whether the rotational version taught here is that same rule wearing a costume, or something genuinely new that happens to look similar. It is the SAME theorem, applied to the same underlying idea (a net influence acting on a body changes exactly the kinetic energy that body carries), simply rewritten in the rotational vocabulary this apparatus uses: a NET TORQUE (rather than a net force) acting through an ANGLE (rather than a distance) changes the ROTATIONAL kinetic energy, one half I omega squared (rather than one half m v squared). Every piece has a direct rotational counterpart — torque stands in for force, angle stands in for distance, moment of inertia stands in for mass, angular speed stands in for speed — and the relation W equals delta KE holds in exactly the same form on both sides. Nothing about turning motion needed a separate law; it is the identical bookkeeping statement, just read off a spinning body instead of a sliding one.',
  ARRAY[
    'is this the same work energy theorem as before but for spinning things',
    'why does work done equal the change in kinetic energy here too',
    'does the work energy theorem work for rotation the same way it does for straight line motion',
    'so W equals delta KE always even for a spinning wheel',
    'how is this rule different from the one for a block sliding on a table'
  ],
  'pending_review'
),
-- ─── STATE_4 energy_falls_faster_than_speed deep-dive ────────────────────
(
  'energy_falls_faster_than_speed',
  'rotational_work_energy',
  'STATE_4',
  'The speed has barely dropped — why has the energy fallen so much?',
  'Student watches the wheel''s speed ease down only a little while the energy bar empties dramatically over the same stretch, and the mismatch feels like the two instruments must disagree, or like the energy bar is somehow reacting too strongly. Both readings are correct, and the mismatch is exactly what the physics of STATE_2''s square law predicts, now seen again under the work-energy lens: rotational kinetic energy is one half I omega SQUARED, so a modest fractional drop in speed corresponds to a much larger fractional drop in energy — halving the speed alone would already remove three quarters of the energy, well before the speed has fallen anywhere near that far. Here the brake''s steady negative work is draining the energy meter continuously, and because that meter reads a SQUARED quantity, its fall visibly outpaces the fall in the speed reading sitting right beside it. Nothing is broken or exaggerated: energy and speed are related by a square, not a straight line, so watching them together will always show energy racing ahead of speed on the way down.',
  ARRAY[
    'why does the energy meter fall faster than the speed drops',
    'the wheel has only slowed a little so why has it lost so much energy',
    'does energy always fall faster than speed',
    'why dont energy and speed drop at the same rate',
    'if speed drops slowly why does the bar empty so fast'
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
-- This concept is ALREADY registered in code — CONCEPT_PANEL_MAP,
-- CONCEPT_RENDERER_MAP, VALID_CONCEPT_IDS and the CLASSIFIER_PROMPT block
-- were ALL pre-registered 2026-08-04 ahead of the Phase-0d rotmech authoring
-- wave (see the "PRE-REGISTERED" comments at each site), specifically so the
-- five parallel rotmech desks never need to touch those four files. This
-- INSERT is included here only as belt-and-suspenders so the DB and the code
-- registration agree, mirroring work_done_by_constant_force's 2026-08-01,
-- positive_negative_zero_work's 2026-08-02, kinetic_energy_definition's
-- 2026-08-02 and work_energy_theorem's 2026-08-07 migrations.
--
-- Values mirror the code registration exactly (panelConfig.ts:1901-1909):
-- single panel, field_3d, and sonnet_can_upgrade FALSE because a field_3d
-- diamond is authored config, never an LLM-upgradable panel (Rule 5/18).
INSERT INTO concept_panel_config (
    concept_id, default_panel_count, panel_a_renderer, panel_b_renderer,
    sonnet_can_upgrade, upgrade_max, verified_by_human, reasoning,
    technology_a, class_level, chapter
) VALUES (
    'rotational_work_energy',
    1,
    'field_3d',
    NULL,
    FALSE,
    1,
    FALSE,
    'Class 11 Ch.7 System of Particles and Rotational Motion (rotmech, 2026-08-14). Single-panel field_3d diamond on the rigid_body_rotation scenario engine (0c-1), the same apparatus family as conservation_of_angular_momentum. A constant torque acting through an angle does work on a rotating body, W = tau*theta, and that work equals the change in the body rotational kinetic energy, KE = half I omega^2 -- the rotational work-energy theorem. Six states: KE exists without translation (STATE_1), the square law read live off a brake decay against two pre-placed chips (STATE_2), W = tau*theta with all three quantities live and the sign named (STATE_3, no energy instrument on screen -- the DoD invariant that keeps the PRIMARY aha intact), the PRIMARY aha where the energy meter mirrors the work counter (STATE_4), the calculus derivation W = integral tau dtheta = delta(half I omega^2) (STATE_5, advanced ring), and a live sandbox (STATE_6). Founder-ruled RESEED semantics: every guided state reseeds omega0 = 1.50 rad/s fresh rather than inheriting the prior state decayed value. Pure configuration, zero renderer edits (0d). Mirrors CONCEPT_PANEL_MAP in src/config/panelConfig.ts (pre-registered 2026-08-04). sonnet_can_upgrade FALSE: field_3d concepts are pure authored configuration and are never upgraded by an LLM at serving time (Rule 5/18).',
    'threejs',
    11,
    '9'
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
