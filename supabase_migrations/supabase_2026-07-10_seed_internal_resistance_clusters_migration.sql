-- supabase_2026-07-10_seed_internal_resistance_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for internal_resistance.json —
-- the SIXTH concept on the particle_field (2D p5.js) renderer, same engine
-- family as drift_velocity/ohms_law/resistivity/combination_of_resistors/
-- emf_definition (reuses emf_definition's charge-pump cell + potential-ladder
-- circuit scenario, plus the newly-revealed internal r + external charger).
-- Diamond 2 of the two-diamond emf/internal-resistance split.
-- Authored 2026-07-10 by alex:json_author per architect skeleton §6 +
-- physics_author drill-down trigger phrases §6. Migration is AUTHORED, not
-- applied — quality_auditor's pre-run step applies it (json_author is
-- forbidden from apply_migration). The clusters-registry Gate 8 probe is
-- N/A-DORMANT this phase (authored-not-applied precedent, per architect
-- skeleton §10(f)/FLAG 3 — the 5-for-5 Ch.3 sibling precedent) — do not let
-- the auditor false-FAIL it.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real student-voice phrasings (lowercase,
-- idiomatic, no textbook prose), verbatim from physics_author §6.
-- status='pending_review' per the current cluster-registry convention.
--
-- THREE has_prebuilt_deep_dive-flagged states (json_author epic_l_path /
-- architect §5, drill-down is a DEFERRED feature — Rule 18 — hand-authored
-- only after analytics flag the state), 3 candidate clusters each:
--   STATE_2 — the abstraction: where the missing volts went, emf vs terminal
--             voltage, what r physically is (electrolyte/electrodes, not an
--             installed part)
--   STATE_4 — the classic trap: why short-circuit current isn't infinite,
--             Ohm's law with r included, why shorted cells get hot
--   STATE_5 — the measurement skill: why two readings, why a voltmeter can
--             lie about a worn cell, why open-circuit reads exactly emf

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 where_did_the_volts_go deep-dive ─────────────────────────
(
  'where_did_the_volts_go',
  'internal_resistance',
  'STATE_2',
  'The cell says 1.5 V but the meter reads 1.0 V — where did the rest go?',
  'Student expects a labeled 1.5 V cell to always deliver 1.5 V, and reads the drop as energy destroyed or lost. Nothing is destroyed — the moment current flows, i·r volts are spent INSIDE the cell itself, across its own hidden internal resistance r, before the charge ever reaches the terminal. The ladder''s second, internal step (i·r = 0.50 V) accounts for exactly the missing amount: ε = V + i·r, 1.50 = 1.00 + 0.50.',
  ARRAY[
    'the cell says 1.5 v but meter shows 1.0 v where did the rest go',
    'why does closing the switch drop the voltage reading',
    'is the missing 0.5 volts destroyed or does it go somewhere',
    'the label says 1.5v so why is my reading always less',
    'where exactly do those missing volts disappear to'
  ],
  'pending_review'
),
-- ─── STATE_2 emf_vs_terminal_voltage deep-dive ────────────────────────
(
  'emf_vs_terminal_voltage',
  'internal_resistance',
  'STATE_2',
  'What''s the actual difference between emf and terminal voltage?',
  'Student conflates emf (ε, the cell''s fixed chemistry-set promise, measured with NO current flowing) and terminal voltage (V, what the voltmeter actually reads once current flows through the cell''s own internal r). They coincide only at i = 0 (open circuit, N13.1) or for an idealized r = 0 cell (emf_definition''s Diamond 1). Once real current flows through a real cell, V = ε − i·r while discharging and V = ε + i·r while charging — the operational split this diamond exists to make concrete.',
  ARRAY[
    'whats the actual difference between emf and terminal voltage',
    'is terminal voltage just another name for emf',
    'why do we need two different words if theyre almost the same number',
    'when are emf and terminal voltage actually equal',
    'is v the same as epsilon or not'
  ],
  'pending_review'
),
-- ─── STATE_2 what_is_r_physically deep-dive ───────────────────────────
(
  'what_is_r_physically',
  'internal_resistance',
  'STATE_2',
  'Is there an actual resistor inside a battery — what is r made of?',
  'Student assumes internal resistance is a discrete component someone installed, like a resistor soldered into a circuit. It is not — r is the resistance of the electrolyte and electrode material the cell is already built from; the zigzag symbol drawn inside the opened casing is only a SYMBOL for that resistance, never a claim that a literal resistor sits inside. Every real cell has a nonzero r (it only rises further as the cell ages); the electrochemical origin (ion transport) is beyond this diamond''s scope — definition level only.',
  ARRAY[
    'is there an actual resistor inside a battery',
    'what is internal resistance really made of',
    'why cant i see r if its really there',
    'is r the same kind of resistor as the ones in circuits',
    'does every single battery have this hidden r or only old ones'
  ],
  'pending_review'
),
-- ─── STATE_4 why_not_infinite_current deep-dive ───────────────────────
(
  'why_not_infinite_current',
  'internal_resistance',
  'STATE_4',
  'If R is zero, shouldn''t current become infinite?',
  'Student applies the naive i = ε/R reflex from ohms_law and expects R → 0 to blow up to infinity. It does not, because the loop current always sees R PLUS r in series: i = ε/(R+r). At dead short (R = 0 exactly), the denominator floors at r (r.min = 0.1 Ω > 0 is enforced), so the current caps at the FINITE ceiling i_max = ε/r = 3.0 A — the hidden r never leaves the loop, even when the external resistance vanishes completely.',
  ARRAY[
    'if r is zero shouldnt current become infinite',
    'why does the ammeter stop at 3 amps instead of shooting up',
    'ohms law says i equals v over r so zero r should mean infinite i',
    'whats actually stopping the current from blowing up at short circuit',
    'is there a real physical limit or is the sim just capping it'
  ],
  'pending_review'
),
-- ─── STATE_4 ohms_law_with_r_included deep-dive ───────────────────────
(
  'ohms_law_with_r_included',
  'internal_resistance',
  'STATE_4',
  'Does Ohm''s law stop working when R hits zero?',
  'Ohm''s law never breaks — the loop current is always i = ε/(R+r), and it is entirely correct at R = 0: i = ε/(0+r) = ε/r. Students who learned i = ε/R with an implicit ideal cell (r = 0) mistake the SIMPLIFIED form for the whole law; the internal r was always there, just invisible because emf_definition''s diamond used an ideal cell where it happened to be zero. Short-circuit current is i = ε/r, not i = ε/(big R), because R itself is zero.',
  ARRAY[
    'does ohms law stop working when r hits zero',
    'so is it really i equals epsilon over r plus little r',
    'why did nobody mention the internal r in ohms law before',
    'is short circuit current epsilon over big r or over little r',
    'does the loop even care that big r is zero'
  ],
  'pending_review'
),
-- ─── STATE_4 why_shorted_cells_get_hot deep-dive ──────────────────────
(
  'why_shorted_cells_get_hot',
  'internal_resistance',
  'STATE_4',
  'If the outside voltage is zero, where does all the power go?',
  'At short circuit the EXTERNAL terminal voltage is zero (V = 0), so no power is delivered outside the cell — but the cell still does work at rate ε·i on every coulomb, and with V = 0 that entire power, i²r, dissipates as HEAT inside the cell itself, across its own internal r. This is why a shorted cell gets hot and can be dangerous — all of ε is spent inside, none of it reaches the terminals, and the energy has to go somewhere: it becomes heat in the cell''s own electrolyte and electrodes.',
  ARRAY[
    'if the outside voltage is zero where does all the power go',
    'why do shorted batteries get so hot',
    'is all the energy just turning into heat inside the cell',
    'can a shorted cell actually explode from this heat',
    'wheres the power dissipated if theres no external resistor'
  ],
  'pending_review'
),
-- ─── STATE_5 why_two_readings deep-dive ───────────────────────────────
(
  'why_two_readings',
  'internal_resistance',
  'STATE_5',
  'Why can''t one voltmeter reading tell me r?',
  'A single reading has one unknown too many — the open-circuit reading gives ε alone (i = 0 kills the i·r term entirely, so r cancels out of the measurement), and a single loaded reading gives V and i but still has two unknowns (ε and r) in one equation. TWO readings — the open reading (V₁ = ε) and a loaded reading (V₂ and i) — give two equations, letting r solve out cleanly: r = (ε − V)/i = (V₁ − V₂)/i. This is the conceptual seed of the potentiometer method (A26), taught later.',
  ARRAY[
    'why cant one voltmeter reading tell me r',
    'whats the point of measuring twice instead of once',
    'what does the second reading actually add that the first didnt',
    'cant i just calculate r from the label',
    'why do i need both open and closed readings for r'
  ],
  'pending_review'
),
-- ─── STATE_5 voltmeter_lies_under_load deep-dive ──────────────────────
(
  'voltmeter_lies_under_load',
  'internal_resistance',
  'STATE_5',
  'Why does a battery test fine on a meter but die in my device?',
  'An open-circuit voltmeter reading only ever shows ε (no current flows through an ideal voltmeter, so the i·r term is identically zero, N13.1) — it says NOTHING about r. As a cell ages, its internal resistance r rises, but ε barely changes, so the open-circuit "test" still reads full voltage. The moment the cell has to deliver real current (running a motor, a flashlight bulb), the now-large i·r droop can sink V far below ε — the voltmeter-only test lies about a worn cell''s ability to actually deliver power.',
  ARRAY[
    'why does a battery test fine on a meter but die in my device',
    'how can the open reading lie about a weak battery',
    'why does an old battery still show full voltage with nothing connected',
    'does testing with just a voltmeter actually tell you anything useful',
    'why does r go up as a cell gets old'
  ],
  'pending_review'
),
-- ─── STATE_5 open_circuit_reads_emf deep-dive ─────────────────────────
(
  'open_circuit_reads_emf',
  'internal_resistance',
  'STATE_5',
  'Why is the open-circuit reading always exactly epsilon?',
  'With the switch open, i = 0 by definition (the loop is broken) — and the terminal-voltage law V = ε − i·r has its i·r term multiplied by exactly zero current, no matter how large r is. This makes V = ε EXACTLY, true for ANY cell, ideal or real, brand-new or worn (N13.1) — the open-circuit condition is not an approximation, it is the one measurement condition where r''s value becomes completely irrelevant, which is exactly why it is used as the FIRST of the two readings that let r be measured.',
  ARRAY[
    'why is the open circuit reading always exactly epsilon',
    'does that open circuit rule work for every cell or just ideal ones',
    'why does zero current mean no voltage is lost inside',
    'if r is huge does open circuit still read the full emf',
    'is the open reading really unaffected by internal resistance'
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
