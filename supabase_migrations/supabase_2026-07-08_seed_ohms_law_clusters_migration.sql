-- supabase_2026-07-08_seed_ohms_law_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for ohms_law.json —
-- the SECOND concept on the particle_field (2D p5.js) renderer, same
-- engine family as drift_velocity.
-- Authored 2026-07-08 by alex:json_author per architect skeleton §6 +
-- physics_author drill-down trigger phrases §6. Migration is AUTHORED, not
-- applied — quality_auditor's pre-run step applies it (json_author is
-- forbidden from apply_migration).
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real-Indian-11th/12th-grade phrasings
-- (lowercase, idiomatic, no textbook prose). status='pending_review' per the
-- current cluster-registry convention (mirrors supabase_2026-07-08_seed_drift_velocity_clusters_migration.sql).
--
-- THREE has_prebuilt_deep_dive-flagged states (json_author §5, drill-down is a
-- DEFERRED feature — Rule 18 — hand-authored only after analytics flag the state),
-- 3 candidate clusters each (json_author §6):
--   STATE_2 — PRIMARY aha: the straight V-I line through the origin IS Ohm's law
--   STATE_4 — current is conserved through a resistor; voltage is what drops
--   STATE_5 — Ohm's law is ohmic-only; a filament's trace curves upward

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 slope_axis_confusion deep-dive ───────────────────────────
(
  'slope_axis_confusion',
  'ohms_law',
  'STATE_2',
  'Why is the slope R and not 1/R on this graph?',
  'Student is unsure which axis convention the sim uses and whether the slope reads R or 1/R. This concept plots I on the x-axis and V on the y-axis (NCERT convention), so the geometric slope dV/dI equals R directly — a steeper line means MORE resistance. Flipping the axes would flip the slope to 1/R.',
  ARRAY[
    'why is slope r and not 1 over r',
    'on this graph which axis gives resistance',
    'if i flip the axes does slope become 1 over r',
    'why did we put v on y not i on y',
    'im confused which line slope actually equals r'
  ],
  'pending_review'
),
-- ─── STATE_2 why_straight_through_origin deep-dive ────────────────────
(
  'why_straight_through_origin',
  'ohms_law',
  'STATE_2',
  'Why does the V-I line have to pass through the origin?',
  'Student is unsure why the line is not just increasing but specifically straight AND through zero. At V = 0 there is no field to drive any drift, so i = 0 for every ohmic conductor — the proportionality (not merely an increasing relationship) is what makes the line pass through the origin with no offset.',
  ARRAY[
    'why does the line have to pass through zero',
    'does zero volts always mean zero current',
    'why is it a straight line and not just increasing',
    'whats the difference between proportional and just increasing',
    'why cant the line start above zero on the graph'
  ],
  'pending_review'
),
-- ─── STATE_2 ohms_law_from_drift deep-dive ────────────────────────────
(
  'ohms_law_from_drift',
  'ohms_law',
  'STATE_2',
  'How do we get V = IR from drift velocity?',
  'Student wants the bridge from drift_velocity''s microscopic chain to the macroscopic law. E = V/L, v_d = eEτ/m_e, and i = neAv_d combine to i = (ne²Aτ/(m_e L))·V = V/R, where R = m_e L/(n e² A τ) — Ohm''s law is DERIVED from the drift chain, not a separate postulate.',
  ARRAY[
    'how do we get v equals i r from drift velocity',
    'wheres the connection between i equals n e a v d and ohms law',
    'how does e e tau over m become v equals i r',
    'is ohms law derived or just observed experimentally',
    'how is r related to tau and n from the drift chapter'
  ],
  'pending_review'
),
-- ─── STATE_4 current_conservation_series deep-dive ────────────────────
(
  'current_conservation_series',
  'ohms_law',
  'STATE_4',
  'Is current the same everywhere in a series circuit?',
  'Student is unsure whether current is conserved through a resistor the way it is through plain wire. Yes — the number of electrons crossing any plane per second is identical before and after a resistor (and every element in series); current never drops crossing a resistor, only voltage does.',
  ARRAY[
    'is current the same everywhere in a series circuit',
    'does current change after passing through a resistor',
    'why is i the same before and after the resistor',
    'in series does every component get the same current',
    'how can current be constant if energy is being lost'
  ],
  'pending_review'
),
-- ─── STATE_4 what_the_resistor_spends deep-dive ───────────────────────
(
  'what_the_resistor_spends',
  'ohms_law',
  'STATE_4',
  'What does a resistor actually use up — current or voltage?',
  'Student conflates "current drops" with "voltage drops." A resistor spends VOLTAGE (potential difference), never current — the electron count crossing per second stays matched on both sides while the potential level falls across the band, which is what powers the resistor.',
  ARRAY[
    'what does a resistor actually use up',
    'is it current or voltage that drops across a resistor',
    'why do we say voltage drops not current drops',
    'whats actually being consumed by the resistor',
    'does the resistor eat electrons or eat energy'
  ],
  'pending_review'
),
-- ─── STATE_4 where_the_energy_goes deep-dive ──────────────────────────
(
  'where_the_energy_goes',
  'ohms_law',
  'STATE_4',
  'Where does the lost voltage energy actually go?',
  'Student wants the physical destination of the spent potential energy — this bridges toward electric_power_heating (deferred concept). The voltage drop across the resistor corresponds to energy converted to heat (Joule heating, P = I²R) as the drifting electrons collide with the lattice more often inside the resistive material.',
  ARRAY[
    'where does the lost voltage energy actually go',
    'does the resistor convert electricity into heat',
    'why does the wire get warm near a resistor',
    'is the energy drop the same as power dissipated',
    'whats the connection between voltage drop and heat'
  ],
  'pending_review'
),
-- ─── STATE_5 ohmic_vs_non_ohmic deep-dive ─────────────────────────────
(
  'ohmic_vs_non_ohmic',
  'ohms_law',
  'STATE_5',
  'Which materials actually obey Ohm''s law?',
  'Student wants to know the scope of Ohm''s law — it is an empirical property of ohmic conductors (metals at constant temperature), not a universal law of nature. Non-ohmic devices (filament bulbs, diodes, transistors) do not give a straight V-I line; identifying ohmic vs non-ohmic from the graph shape is the key skill.',
  ARRAY[
    'which materials actually obey ohms law',
    'is a metal wire always ohmic',
    'what makes something non ohmic',
    'does ohms law ever completely fail',
    'how do i know if a component is ohmic from its graph'
  ],
  'pending_review'
),
-- ─── STATE_5 filament_resistance_rises deep-dive ──────────────────────
(
  'filament_resistance_rises',
  'ohms_law',
  'STATE_5',
  'Why does a bulb''s resistance change when it heats up?',
  'Student is unsure why R is not constant for a filament. As voltage (and hence current) rises, the filament heats up; the higher temperature shortens the electrons'' relaxation time τ between collisions, which raises R_eff — the effect this concept models as R_eff = R(1 + filament_k·V/V_max).',
  ARRAY[
    'why does a bulbs resistance change when it heats up',
    'does more current make the filament resistance go up',
    'why isnt r constant for a light bulb',
    'how does heating affect tau and resistance',
    'why does the filament curve bend upward not downward'
  ],
  'pending_review'
),
-- ─── STATE_5 dynamic_resistance_meaning deep-dive ─────────────────────
(
  'dynamic_resistance_meaning',
  'ohms_law',
  'STATE_5',
  'What does resistance mean on a curved (non-ohmic) graph?',
  'Student is confused between the single-number R = V/I and a slope that changes along a curve. On a curved trace, R = V/I (static resistance) still gives a valid ratio AT a point, but it is no longer constant across the curve like it is for an ohmic conductor — the instantaneous slope dV/dI (dynamic resistance) is a distinct, also-valid quantity.',
  ARRAY[
    'whats the difference between r equals v over i and dv over di',
    'on a curved graph what does resistance even mean',
    'is there one r value or many for a filament',
    'how do you find resistance at a single point on a curve',
    'why is static resistance different from dynamic resistance'
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
