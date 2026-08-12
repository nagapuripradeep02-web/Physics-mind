-- supabase_2026-08-02_seed_kinetic_energy_definition_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for
-- kinetic_energy_definition.json — Class 11 Ch.6 Work, Energy and Power #3,
-- authored against the same newtons_laws_body field_3d engine as #1 and #2,
-- and the FIRST concept in the fleet to author the SEAM L energy_layer (the
-- live K bar). chapter:6, section:"6.4",
-- prerequisites: ["newton_second_law","friction_force"].
--
-- Authored 2026-08-02 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/ch6/
-- kinetic_energy_definition/physics_block.md §5):
--   STATE_2 — why_v_squared, double_speed_quadruple_energy,
--             speed_vs_momentum_scaling;
--   STATE_4 — negative_velocity_positive_energy, energy_is_a_scalar,
--             kinetic_energy_cannot_be_negative.
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
-- STATE_2 (speed_counts_twice — the v-squared abstraction is the stickiest
-- point in this concept and carries the PRIMARY aha) and STATE_4
-- (never_negative — the sign/scalar confusion, historically tangled with
-- momentum). Both states carry a drill_downs array in the concept JSON
-- referencing these cluster_ids.
--
-- BOUNDARY NOTE, binding on every description below: this concept owns WHAT
-- kinetic energy IS. It never says the word "work", never draws a work bar,
-- and never states W = ΔK — that is concept #4 (work_energy_theorem), and
-- "where did the energy go when friction stopped it" is concept #10's PRIMARY
-- aha. No description here may cross either line.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 why_v_squared deep-dive ────────────────────────────────────
(
  'why_v_squared',
  'kinetic_energy_definition',
  'STATE_2',
  'Why is the speed squared in kinetic energy, and not just the speed itself?',
  'Student can recite K = ½mv² but reads the square as an arbitrary piece of notation rather than a statement about how the world behaves, and often has momentum p = mv sitting alongside it as a competing, linear-in-v quantity. The square is not decoration: it is what the measurement says. Two carts of the same 5 kg mass, one moving at 2 m/s and one at 4 m/s, hold 10.0 J and 40.0 J — a factor of four for a factor of two in speed, which is exactly what squaring means and is not what multiplying by the speed would give. The two quantities are genuinely different and both are real: momentum is linear in the speed, kinetic energy is quadratic in it, so the same doubling of speed doubles one and quadruples the other. The square is also why kinetic energy loses the direction of travel entirely, since squaring any real number, positive or negative, gives the same non-negative result — one feature of the formula, two consequences.',
  ARRAY[
    'why is v squared and not just v',
    'where does the square come from in half m v squared',
    'why do we square the speed for energy',
    'is the square just a formula or does it mean something',
    'momentum has no square so why does energy'
  ],
  'pending_review'
),
-- ─── STATE_2 double_speed_quadruple_energy deep-dive ────────────────────
(
  'double_speed_quadruple_energy',
  'kinetic_energy_definition',
  'STATE_2',
  'Twice as fast but four times the energy — how does that arithmetic work?',
  'Student accepts that the meter reads four times as much for the faster cart but cannot reconstruct the arithmetic that produced it, so the fact stays memorised rather than derivable. Hold the mass fixed and the ratio of two kinetic energies is (½mv₂²)/(½mv₁²) = (v₂/v₁)² — every factor except the speeds cancels exactly, so only the SPEED RATIO survives, and it survives squared. With v₂/v₁ = 2 that gives 2² = 4, which is the 40.0 J against 10.0 J on screen. The same rule keeps working past the doubling case: three times the speed gives 3² = 9 times the kinetic energy, and half the speed gives (½)² = a quarter of it. Nothing about the numbers 2 and 4 is special — they are just the first case of a general squaring rule, which is why the same cart at a small extra speed shows a surprisingly large jump in the reading.',
  ARRAY[
    'twice as fast but four times energy how',
    'why not twice the energy if twice the speed',
    'double speed four times ke i dont get it',
    'does 3 times the speed mean 9 times the energy',
    'why did the bar jump so much for a small speed change'
  ],
  'pending_review'
),
-- ─── STATE_2 speed_vs_momentum_scaling deep-dive ────────────────────────
(
  'speed_vs_momentum_scaling',
  'kinetic_energy_definition',
  'STATE_2',
  'How is kinetic energy different from momentum, if both are about a moving body?',
  'Student has met momentum p = mv and kinetic energy K = ½mv² as two formulas about the same moving body and treats them as near-synonyms, which is exactly what makes the "twice as fast means twice the energy" mistake feel reasonable — it is momentum''s rule applied to the wrong quantity. The two differ in how they scale and in what kind of quantity they are. Momentum is LINEAR in the speed and is a VECTOR: reverse the direction of travel and the momentum reverses sign. Kinetic energy is QUADRATIC in the speed and is a SCALAR: reverse the direction and it does not change at all. Both are exactly proportional to the mass, so mass is not what separates them. That difference is measurable rather than merely definitional — doubling a cart''s speed doubles its momentum and quadruples its kinetic energy, and the meter on screen shows the second of those directly.',
  ARRAY[
    'difference between momentum and kinetic energy',
    'why is momentum mv but energy half m v squared',
    'two bodies same momentum different kinetic energy possible',
    'which one doubles when speed doubles momentum or energy',
    'is momentum the same thing as kinetic energy'
  ],
  'pending_review'
),
-- ─── STATE_4 negative_velocity_positive_energy deep-dive ────────────────
(
  'negative_velocity_positive_energy',
  'kinetic_energy_definition',
  'STATE_4',
  'If the velocity is negative, why is the kinetic energy still positive?',
  'Student correctly writes a leftward velocity as −3 m/s and then carries that minus sign straight through the formula into the answer, producing −22.5 J. The step that is skipped is the squaring: K = ½mv² multiplies the velocity by ITSELF, and (−3) × (−3) = +9, so the minus sign is removed by the multiplication before the mass or the one half ever enter. Substituting fully, ½ × 5 × (−3)² = ½ × 5 × 9 = 22.5 J, the same value the rightward cart gives, which is what the two meters on screen show side by side. The sign of the velocity carries real information — it says which way the body is travelling — but the square is exactly the operation that discards it, so a signed velocity and an unsigned energy are both correct at the same time, and the two identical readings are the demonstration.',
  ARRAY[
    'velocity is negative so is kinetic energy negative',
    'moving backward means minus energy right',
    'if v is minus 3 what is half m v squared',
    'why doesnt the minus sign go into the energy',
    'does direction change the kinetic energy'
  ],
  'pending_review'
),
-- ─── STATE_4 energy_is_a_scalar deep-dive ───────────────────────────────
(
  'energy_is_a_scalar',
  'kinetic_energy_definition',
  'STATE_4',
  'Does kinetic energy have a direction — is it a vector or a scalar?',
  'Student has spent a whole chapter drawing arrows for forces and velocities and reasonably expects the energy of a moving body to point somewhere too, especially since the body itself is visibly travelling in a definite direction. Kinetic energy is a SCALAR: it has a size and a unit and nothing else, which is why nothing on screen ever draws an arrow for it — the meter shows a length and a number, never a direction. The reason sits in the formula: mass is a plain number, and the square of the speed is the velocity multiplied by itself, which produces a plain number as well, so no direction survives the arithmetic. The practical consequence is that kinetic energies add as ordinary numbers, never head-to-tail: two carts moving in opposite directions at 22.5 J each hold 45.0 J between them, not zero, which is precisely where a vector sum would have gone wrong.',
  ARRAY[
    'does kinetic energy have a direction',
    'is kinetic energy a vector or scalar',
    'why no arrow for kinetic energy',
    'can i add kinetic energies like vectors',
    'energy has magnitude only meaning what'
  ],
  'pending_review'
),
-- ─── STATE_4 kinetic_energy_cannot_be_negative deep-dive ────────────────
(
  'kinetic_energy_cannot_be_negative',
  'kinetic_energy_definition',
  'STATE_4',
  'Can kinetic energy ever be negative, and what is the smallest it can be?',
  'Student wonders whether some configuration — moving backward, a strange choice of axis, a very small speed — could push the reading below zero, and has no argument that rules it out rather than merely failing to find it. The argument is short and complete. Mass is always a positive number, and the square of any real number is never negative, so K = ½mv² is a product of non-negative factors and can never come out below zero for any body and any velocity whatsoever. The smallest possible value is exactly zero, reached when and only when v = 0, because a product is zero only when one of its factors is, and the mass never is. That is why a body at rest reads exactly 0.0 J and not merely a small number: zero is a genuine floor here, not an approximation, and the meter settling on 0.0 J when the cart stops is that floor being reached.',
  ARRAY[
    'can kinetic energy ever be negative',
    'what would negative kinetic energy even mean',
    'is zero the smallest kinetic energy',
    'when is kinetic energy zero',
    'does a body at rest have kinetic energy'
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
-- agree, mirroring work_done_by_constant_force's 2026-08-01 and
-- positive_negative_zero_work's 2026-08-02 migrations.
--
-- Values mirror the code registration exactly: single panel, field_3d, and
-- sonnet_can_upgrade FALSE because a field_3d diamond is authored config,
-- never an LLM-upgradable panel (Rule 5/18).
INSERT INTO concept_panel_config (
    concept_id, default_panel_count, panel_a_renderer, panel_b_renderer,
    sonnet_can_upgrade, upgrade_max, verified_by_human, reasoning,
    technology_a, class_level, chapter
) VALUES (
    'kinetic_energy_definition',
    1,
    'field_3d',
    NULL,
    FALSE,
    1,
    FALSE,
    'Ch.6 Work, Energy and Power #3 (2026-08-02). Single-panel field_3d diamond on the newtons_laws_body scenario engine, and the FIRST concept in the fleet to author the SEAM L energy_layer (the live K bar). Kinetic energy K = 1/2 m v^2: proportional to the mass, proportional to the SQUARE of the speed, a scalar with no sign, exactly zero at rest. Authors ZERO work_accumulators — the mechanically-greppable boundary with work_energy_theorem (#4), which the engine itself confirms by naming the panel "Energy bars". Pure configuration, zero renderer edits (0d). Mirrors CONCEPT_PANEL_MAP in src/config/panelConfig.ts. sonnet_can_upgrade FALSE: field_3d concepts are pure authored configuration and are never upgraded by an LLM at serving time (Rule 5/18).',
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
