-- supabase_2026-07-10_seed_electrical_power_in_resistor_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for
-- electrical_power_in_resistor.json — the SEVENTH concept on the
-- particle_field (2D p5.js) renderer, same engine family as
-- drift_velocity/ohms_law/resistivity/combination_of_resistors/
-- emf_definition/internal_resistance (reuses the shared circuit-family
-- engine: wire loop / topology / switch / ammeter, plus a new "electric_power"
-- scenario_type with glowing rated bulbs whose brightness IS live power).
-- Authored 2026-07-10 by alex:json_author per architect skeleton §6 +
-- physics_author drill-down trigger phrases §7. Migration is AUTHORED, not
-- applied — quality_auditor's pre-run step applies it (json_author is
-- forbidden from apply_migration). The clusters-registry Gate 8 probe is
-- N/A-DORMANT this phase (authored-not-applied precedent, per architect
-- skeleton Definition-of-Done (f) — the 6-for-6 Ch.3 sibling precedent) —
-- do not let the auditor false-FAIL it.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real student-voice phrasings (lowercase,
-- idiomatic, no textbook prose), verbatim from physics_author §7.
-- status='pending_review' per the current cluster-registry convention.
--
-- THREE has_prebuilt_deep_dive-flagged states (json_author epic_l_path /
-- architect §5, drill-down is a DEFERRED feature — Rule 18 — hand-authored
-- only after analytics flag the state), 3 candidate clusters each:
--   STATE_2 — the abstraction: which power formula to use, whether higher R
--             means more or less power, what a watt actually is (rate vs stock)
--   STATE_4 — the classic trap: why old series string-lights all dim together,
--             how voltage splits in series, a forward-reference teaser to
--             maximum power transfer
--   STATE_5 — the PRIMARY-aha measurement skill: what a bulb rating actually
--             promises, what happens below rated voltage, why household bulbs
--             are wired in parallel

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 which_formula_when deep-dive ─────────────────────────────
(
  'which_formula_when',
  'electrical_power_in_resistor',
  'STATE_2',
  'How do I know which power formula to use — VI, I²R, or V²/R?',
  'Student sees three formulas and treats them as three separate rules to memorize rather than one quantity, P, expressed three ways via Ohm''s law V=IR substituted into itself. P=VI is the definitional rate; P=I²R and P=V²/R are the SAME number reached by substituting V=IR or I=V/R respectively. The fastest choice depends on what''s GIVEN in a problem: know V and I directly → use VI; know I and R → use I²R; know V and R → use V²/R — but all three always agree, as the sim''s live three-way readout shows while V is dragged.',
  ARRAY[
    'how do i know which power formula to use',
    'why are there three formulas for the same thing',
    'is vi the main one and the others just substitutes',
    'do i pick i squared r or v squared over r based on whats given',
    'whats the fastest way to tell which applies'
  ],
  'pending_review'
),
-- ─── STATE_2 p_proportional_to_r_or_not deep-dive ─────────────────────
(
  'p_proportional_to_r_or_not',
  'electrical_power_in_resistor',
  'STATE_2',
  'Does higher resistance mean more power or less — the two formulas seem to contradict.',
  'Student reads P=I²R as "P grows with R" and P=V²/R as "P shrinks with R" and concludes the formulas contradict each other. They don''t — each formula holds a DIFFERENT variable fixed. P=I²R applies when CURRENT is held fixed (as in series, STATE_4): raising R there genuinely raises P. P=V²/R applies when VOLTAGE is held fixed (as in parallel, STATE_5): raising R there lowers P. The resolution is always to ask "what''s actually being held constant in this circuit" before picking a formula — this is exactly the STATE_4→STATE_5 contrast pair''s payoff.',
  ARRAY[
    'does higher resistance mean more power or less',
    'i squared r says power up with r but v squared over r says down, which',
    'why do the two formulas seem to contradict',
    'is power proportional to r or inversely',
    'how can the same p depend on r in opposite ways'
  ],
  'pending_review'
),
-- ─── STATE_2 what_is_a_watt deep-dive ─────────────────────────────────
(
  'what_is_a_watt',
  'electrical_power_in_resistor',
  'STATE_2',
  'Is a watt an amount of energy, or a speed of using it?',
  'Student conflates power (a RATE, joules per second, unit watt) with energy (an AMOUNT, joules). A bulb''s "6 W" rating never says how much energy it has used — only how FAST it converts energy to heat/light at that instant. The amount actually delivered is energy E = P·t (STATE_3''s climbing counter): a 6 W bulb run for 1 second delivers 6 J, run for 10 seconds delivers 60 J — same power, growing energy. This is exactly why household bills are billed in kilowatt-hours (a unit of energy = power × time), not in watts alone.',
  ARRAY[
    'is a watt an amount of energy or a speed of using it',
    'difference between a watt and a joule',
    'if power is a rate why does the rating just say watts no time',
    'is 6 watts a total or per second',
    'why not measure bulbs in joules'
  ],
  'pending_review'
),
-- ─── STATE_4 series_string_lights_dim deep-dive ───────────────────────
(
  'series_string_lights_dim',
  'electrical_power_in_resistor',
  'STATE_4',
  'Why do old-style string lights all dim when one bulb has more resistance?',
  'In an old-style series string, every bulb shares the SAME current (i = V/R_total, same current flows through all of them). Any single higher-resistance bulb in that string doesn''t just dim itself — it raises R_total for the whole loop, sinking the shared current everywhere, so every bulb in the string dims together. This is the direct real-world payoff of STATE_4''s "same current, P=I²R, higher-R bulb dissipates more" result: a weak or aging bulb''s rising resistance drags the WHOLE series string down, which is exactly why decorative fairy lights (and old Christmas-tree strings) go dim as one bulb ages, and why modern strings wire in parallel instead (STATE_5''s payoff).',
  ARRAY[
    'why do old string lights all dim when one has more resistance',
    'does the higher-resistance one hog the light',
    'why does a weak bulb dim the whole string',
    'is that why cheap fairy lights flicker',
    'does adding a higher resistance bulb dim the others'
  ],
  'pending_review'
),
-- ─── STATE_4 series_voltage_sharing deep-dive ─────────────────────────
(
  'series_voltage_sharing',
  'electrical_power_in_resistor',
  'STATE_4',
  'How does voltage split between the two bulbs in series?',
  'In series, the SAME current i threads both bulbs (inherited from combination_of_resistors), but the voltage across each is different: V1 = i·R1, V2 = i·R2, and V1+V2 = V always, with the bigger resistor taking the BIGGER voltage share (V1/V2 = R1/R2 — the DIRECT resistance ratio, unlike parallel''s current-division which is the INVERSE ratio). Since power is P=i²R with the same i in both, the bigger-R bulb — which also gets the bigger voltage share — ends up dissipating more power too: both the voltage-division and the power-division favor the higher-resistance bulb in series.',
  ARRAY[
    'how does voltage split between the two bulbs',
    'does the bigger resistor get more voltage',
    'why does v=ir decide who gets more of the six volts',
    'is voltage sharing the same as current staying constant',
    'why doesnt the current split when the bulbs differ'
  ],
  'pending_review'
),
-- ─── STATE_4 max_power_transfer_forward_ref deep-dive ─────────────────
(
  'max_power_transfer_forward_ref',
  'electrical_power_in_resistor',
  'STATE_4',
  'Is there an R that gives the maximum power — an optimum resistance?',
  'Honest forward-reference, outside this concept''s scope: for a FIXED source with its own internal resistance r, there IS a special external R (namely R = r) that maximizes the power delivered to the load — the maximum-power-transfer theorem. This diamond only shows power in resistors on an ideal (r=0) supply, where power to a single fixed-R load simply keeps climbing as R falls (P=V²/R) or as current climbs (P=I²R) — no optimum appears until a real source''s own internal resistance enters the picture, which is the dedicated grouping_cells_mixed_max_power_transfer concept''s job.',
  ARRAY[
    'is there an r where the bulb gets the most power',
    'whats the resistance that maximizes power',
    'why doesnt power keep climbing forever as r rises in series',
    'is there an optimum r for max power from a battery',
    'does matching resistance to the battery matter'
  ],
  'pending_review'
),
-- ─── STATE_5 bulb_rating_meaning deep-dive ────────────────────────────
(
  'bulb_rating_meaning',
  'electrical_power_in_resistor',
  'STATE_5',
  'Does a 6 watt bulb always draw exactly 6 watts?',
  'No — a bulb''s nameplate wattage is a promise ONLY at its RATED voltage. The sim''s "6 W" bulb genuinely dissipates 6.00 W in STATE_5 (parallel, where it receives its full rated 6 V) but only 0.667 W in STATE_4 (series, where it shares voltage with the other bulb and gets far less than 6 V). The label is really shorthand for "this resistor dissipates this many watts WHEN given its rated voltage" — the actual power at any other voltage follows P=V²/R, which can be far below (or, if over-driven, dangerously above) the nameplate number.',
  ARRAY[
    'does a 6 watt bulb always draw 6 watts',
    'what does the wattage on a bulb promise',
    'is the rating only true at one voltage',
    'why does the same bulb draw different power series vs parallel',
    'so the label is a rating at rated voltage not fixed'
  ],
  'pending_review'
),
-- ─── STATE_5 run_below_rated_voltage deep-dive ────────────────────────
(
  'run_below_rated_voltage',
  'electrical_power_in_resistor',
  'STATE_5',
  'What happens to a bulb''s power if it runs below its rated voltage?',
  'Power follows P=V²/R — a SQUARED relationship with voltage, so power falls faster than voltage does. Halve the voltage and power drops to a QUARTER, not a half (since (V/2)²=V²/4). This is why a dimmer bulb, or a flashlight on a weakening battery, looks disproportionately dim compared to how much the voltage itself has dropped — a small voltage sag produces a much larger visible brightness sag, exactly the squared relationship the sim''s STATE_5/STATE_6 V-slider makes explorable.',
  ARRAY[
    'what happens to a bulbs power below rated voltage',
    'does a 6 watt bulb still make 6 watts on a weaker supply',
    'why does power drop faster than voltage when dimming',
    'if i halve the voltage do i get half the power',
    'why does an underpowered bulb look so dim'
  ],
  'pending_review'
),
-- ─── STATE_5 household_bulbs_parallel deep-dive ───────────────────────
(
  'household_bulbs_parallel',
  'electrical_power_in_resistor',
  'STATE_5',
  'Why are household bulbs wired parallel, not series?',
  'Parallel wiring gives every bulb the FULL supply voltage independently (inherited from combination_of_resistors: every branch sees the same voltage), so each bulb reaches its exact rated power regardless of what any other bulb is doing — the sim''s STATE_5 shows both bulbs landing at their EXACT nameplates, 6.00 W and 3.00 W, simultaneously. It also means one bulb failing (an open branch) doesn''t affect any other branch''s voltage or current at all — unlike a series string, where every bulb shares one current and one failure (or one weak link) drags every other bulb down with it.',
  ARRAY[
    'why are household bulbs wired parallel not series',
    'does every parallel bulb get full voltage',
    'why doesnt one burning out affect the others',
    'is that why a brighter bulb doesnt dim the room',
    'why does each parallel bulb act like the only thing connected'
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
