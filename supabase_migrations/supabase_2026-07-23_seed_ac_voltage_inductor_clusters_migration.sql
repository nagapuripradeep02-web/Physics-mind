-- supabase_2026-07-23_seed_ac_voltage_inductor_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for ac_voltage_inductor.json —
-- the NEW field_3d 'ac_inductor' scenario (Class 12 Ch.7 §7.3 AC Voltage
-- Applied to an Inductor), the second concept of the Ch.7 Alternating Current
-- map. Engine delta landed in-loop (docs/loop_runs/ch7_engine_log.md, Stage 2,
-- commit 35ae566) as a clean standalone sibling of the sealed ac_resistor
-- scenario before this file was authored.
--
-- Authored 2026-07-23 by alex:json_author per architect skeleton §6 +
-- physics_author drill-down trigger phrases (verbatim, physics block §5).
--
-- Migration is AUTHORED, NOT APPLIED — quality_auditor's pre-run step
-- applies it (json_author is forbidden from apply_migration). Per the
-- CHAPTER_LOOP trial rules this migration is NEVER applied to the live DB
-- this phase. Drill-down itself is DEFERRED (Rule 18, 2026-06-10 directive)
-- — the confusion_cluster_registry Gate-8 probe is N/A-DORMANT this phase
-- per the documented false-FAIL scar (memory: auditor-cluster-registry-
-- false-fail). Do not let the auditor re-route json_author to "fix" this.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real student-voice phrasings (lowercase,
-- idiomatic, no textbook prose), verbatim from the physics block §5.
-- status='pending_review' per the current cluster-registry convention.
--
-- has_prebuilt_deep_dive states + clusters (architect skeleton §5):
--   STATE_2 — the chapter's hinge confusion (the lag itself) —
--             why_lag_not_lead, current_max_when_voltage_zero, quarter_cycle_90_degrees_meaning
--   STATE_4 — the PRIMARY aha + the calculus-shy student's wall (slope-vs-value reasoning) —
--             slope_vs_value_confusion, v_equals_L_didt_meaning, why_exactly_quarter_cycle
--   STATE_7 — the power paradox (reactance-vs-resistance; "where does the energy GO") —
--             reactance_vs_resistance_heating, where_stored_energy_goes, zero_power_but_current_flows

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 why_lag_not_lead deep-dive ────────────────────────────────
(
  'why_lag_not_lead',
  'ac_voltage_inductor',
  'STATE_2',
  'Why does the current lag the voltage and not lead it?',
  'Student has just been confronted with a lag they did not expect (the resistor prior said "current copies voltage"), and their first instinct is to treat the DIRECTION of the offset as arbitrary — a coin flip between "late" and "early" rather than something forced by the physics. It is not arbitrary: for a pure inductor, v = L di/dt means the voltage tracks the current''s SLOPE, and a sinusoid''s slope is itself a cosine that peaks a quarter cycle BEFORE the sine it belongs to — which is exactly equivalent to saying the current (the sine) peaks a quarter cycle AFTER the voltage (the derivative-shaped cosine). The lag direction falls directly out of which quantity is the derivative of which; nothing about it is a free choice. The capacitor sibling reverses the roles (charge, not current, is what accumulates from the drive), which is exactly why IT leads instead — the sign is mechanism-determined in both cases, never a coincidence.',
  ARRAY[
    'why does current lag and not lead',
    'could the current come before the voltage instead',
    'why does the coil make it late and not early',
    'is lag always the direction or could it flip',
    'why not just a random delay, why exactly lag'
  ],
  'pending_review'
),
-- ─── STATE_2 current_max_when_voltage_zero deep-dive ───────────────────
(
  'current_max_when_voltage_zero',
  'ac_voltage_inductor',
  'STATE_2',
  'How can the current be at its maximum when the voltage is exactly zero?',
  'Student is importing a resistor-trained instinct that "zero cause must mean zero effect" — if the driving voltage is momentarily zero, surely nothing should be happening to the current. For an inductor this gets the causation backwards: voltage does not directly command the current''s SIZE, it commands the current''s RATE OF CHANGE (v = L di/dt). At the instant voltage is zero, the current isn''t being told to be zero — it''s being told its slope is zero, i.e. it has just finished climbing and is momentarily flat AT ITS OWN PEAK, exactly like a ball thrown upward has zero acceleration''s effect on its velocity at the very top of its swing (a loose but useful mechanical analogy: velocity-vs-position, not force-vs-velocity). The current was built up by all the NONzero voltage that came before it; zero voltage at this instant simply marks the turning point of that accumulation, not an absence of current.',
  ARRAY[
    'how can current be maximum when voltage is zero',
    'if voltage is zero shouldnt current also be zero',
    'whats pushing the current when there is no voltage',
    'why does the current peak exactly where voltage crosses zero',
    'doesnt zero voltage mean nothing is happening'
  ],
  'pending_review'
),
-- ─── STATE_2 quarter_cycle_90_degrees_meaning deep-dive ────────────────
(
  'quarter_cycle_90_degrees_meaning',
  'ac_voltage_inductor',
  'STATE_2',
  'What does "90 degrees" even mean here — nothing is rotating on screen.',
  'Student has only ever met degrees attached to an actual rotating object (a wheel, a clock hand, a compass needle) and is confused when the same word is applied to two SEPARATE time-graphs with no visible circle anywhere. The resolution: one full cycle of the sine wave (however long it actually takes, T seconds) is being treated as "360 degrees" of PHASE — a way of measuring how far apart two repeating patterns are as a FRACTION of their shared repeat-length, independent of the actual seconds involved. A quarter of one full cycle is called "90 degrees" purely by that convention (fraction × 360), and the sim''s bracket makes the fraction concrete: whatever T is at the current frequency, the lag is always exactly T/4 of it, which is always exactly a quarter-turn''s worth of phase, at any frequency. The "rotating" language is a genuine preview of the phasor diagram (two concepts away), where that quarter-turn will finally get drawn as an actual right angle between two spinning arrows — but nothing rotates yet, on purpose.',
  ARRAY[
    'what does 90 degrees even mean without a circle here',
    'why call it degrees when everything is just a graph',
    'is a quarter cycle the same everywhere or does it depend on frequency',
    'how do you turn 1 second into 90 degrees',
    'does 90 degrees mean something is rotating'
  ],
  'pending_review'
),
-- ─── STATE_4 slope_vs_value_confusion deep-dive ────────────────────────
(
  'slope_vs_value_confusion',
  'ac_voltage_inductor',
  'STATE_4',
  'How does a value (voltage) end up controlling a slope, instead of controlling a value?',
  'Student''s whole prior experience with "X controls Y" (including the resistor lesson one concept ago) has been "X''s SIZE controls Y''s SIZE" — bigger cause, bigger effect, both measured the same way. v = L di/dt breaks that pattern: the LEFT side is an ordinary value (a number of volts, read straight off a meter) but the RIGHT side is a RATE — how steeply a graph is climbing at that instant, not how high it is. The equation is simply asserting these two different-looking things are proportional: whatever the voltage number is right now, the current''s STEEPNESS right now is exactly that number divided by L. The sim''s tangent-walk cursor is built to make this concrete rather than abstract — literally watching a line''s tilt change in lockstep with a number on the voltage trace, at the same instant, is the bridge from "controls a value" to "controls a slope."',
  ARRAY[
    'why does voltage control the slope and not the size',
    'im confused how a value can set a slope',
    'so voltage isnt telling current how big to be',
    'how is slope different from the current itself',
    'why cant i just read current straight off the voltage'
  ],
  'pending_review'
),
-- ─── STATE_4 v_equals_L_didt_meaning deep-dive ─────────────────────────
(
  'v_equals_L_didt_meaning',
  'ac_voltage_inductor',
  'STATE_4',
  'What does v = L di/dt actually mean physically — what is di/dt supposed to represent?',
  'Student can manipulate the symbols algebraically but the notation "di/dt" reads as an opaque calculus incantation rather than a physical picture. Concretely: di/dt is just "how many amps the current is gaining or losing, per second, right now" — the exact same kind of quantity as a speedometer reading "how many meters per second you''re gaining or losing" for a car''s velocity, or acceleration reading how fast velocity itself is changing. L (the inductance) is the coil''s own personal "stubbornness constant" — how many volts it takes to force the current to change at a given rate; a bigger L means the SAME rate of current-change demands MORE volts to enforce, exactly as a bigger mass needs more force for the same acceleration (F = ma is the mechanical cousin of v = L di/dt, cause-controls-rate-of-change in both). Reading the whole equation as one sentence: "the voltage needed right now equals the coil''s stubbornness times how fast you''re asking the current to change."',
  ARRAY[
    'what does v equals l di dt actually mean physically',
    'what is di dt supposed to represent',
    'why does inductance multiply the rate of change and not the current',
    'is di dt just how fast current is changing',
    'why isnt there a current term directly in that equation'
  ],
  'pending_review'
),
-- ─── STATE_4 why_exactly_quarter_cycle deep-dive ───────────────────────
(
  'why_exactly_quarter_cycle',
  'ac_voltage_inductor',
  'STATE_4',
  'Why is the lag always EXACTLY a quarter cycle, never a third or a fifth or something in between?',
  'Student suspects "quarter cycle" might be a rounded or approximate figure — a rough description rather than an exact geometric fact — perhaps varying a little with the specific inductor or voltage used. It is exact, and provably so, precisely BECAUSE it falls out of pure trigonometry rather than any component-specific number: the derivative of sin(theta) is cos(theta), and cos(theta) is IDENTICAL in shape to sin(theta) shifted by exactly pi/2 radians — a quarter of a full 2*pi cycle — for EVERY possible amplitude, frequency, and inductance value, with no exceptions and no approximation anywhere in the chain. Change vm, change L, change the frequency: iₘ changes, the TIMING SCALE (how many actual seconds a quarter-cycle takes) changes, but the FRACTION of one cycle never budges from exactly one quarter, because that fraction is a property of the sine/cosine relationship itself, not of the circuit.',
  ARRAY[
    'why exactly a quarter cycle and not some other fraction',
    'is the quarter cycle lag always exactly that or just close',
    'why does the geometry force exactly 90 degrees',
    'could the lag be different for a different inductor',
    'why is it always exactly a quarter, never a third or a fifth'
  ],
  'pending_review'
),
-- ─── STATE_7 reactance_vs_resistance_heating deep-dive ─────────────────
(
  'reactance_vs_resistance_heating',
  'ac_voltage_inductor',
  'STATE_7',
  'If the coil is fighting the current the whole cycle, why doesn''t it heat up like a resistor?',
  'Student has just watched STATE_3''s back-emf visibly opposing the current every instant and reasonably concludes that "opposing something" must always cost energy, the same way friction opposing motion always generates heat. The crucial difference: a resistor''s opposition is DISSIPATIVE — it converts electrical energy into heat that leaves the circuit for good and can never be recovered. A coil''s opposition is REACTIVE — it TEMPORARILY diverts energy into building up a magnetic field, and every single joule that goes in during one quarter cycle comes straight back out during the very next quarter cycle, fully and exactly, with nothing lost to heat anywhere in the process. "Fighting the current" describes the DIRECTION of the coil''s response, not whether energy is being spent or merely borrowed; the wattmeter reading 0.00 W the whole time is the direct, honest proof that no joule ever actually leaves the system.',
  ARRAY[
    'if the coil fights the current why doesnt it heat up',
    'whats the difference between reactance and resistance then',
    'doesnt fighting something always cost energy',
    'why does resistance heat but reactance doesnt',
    'so opposing current isnt the same as using it up'
  ],
  'pending_review'
),
-- ─── STATE_7 where_stored_energy_goes deep-dive ────────────────────────
(
  'where_stored_energy_goes',
  'ac_voltage_inductor',
  'STATE_7',
  'Where does the energy stored in the magnetic field actually go when the field collapses?',
  'Student can accept that energy goes INTO the field while it''s growing but pictures the field''s collapse as the energy simply vanishing or being "used up" quietly, rather than tracing where it re-emerges. It goes straight back to the SOURCE — as the field collapses, the very same back-emf mechanism from STATE_3 that opposed the RISING current now reverses role and props up the FALLING current, actively pushing charge backward through the circuit toward the source, exactly like a spring that was compressed by a push now pushing back on the hand that compressed it. The U-gauge falling to zero and the p-strip dipping below the baseline at that exact same moment are the SAME event described two ways: the field''s energy is being returned as real electrical work done back on the circuit, not dissipated, not destroyed — simply handed back to where it came from, ready to be borrowed again next quarter cycle.',
  ARRAY[
    'where does the stored energy actually go',
    'does the energy just disappear when the field collapses',
    'if energy goes into the field where does it go when the field shrinks',
    'is the energy really given back or just used elsewhere',
    'whats on the other end receiving that returned energy'
  ],
  'pending_review'
),
-- ─── STATE_7 zero_power_but_current_flows deep-dive ────────────────────
(
  'zero_power_but_current_flows',
  'ac_voltage_inductor',
  'STATE_7',
  'How can the average power be exactly zero when the current is clearly, visibly flowing?',
  'Student conflates "current is flowing" with "power is being consumed," treating them as the same fact stated two ways — a very reasonable assumption everywhere EXCEPT a lossless reactive element, since it holds for a resistor and for essentially every everyday intuition about electricity. The two really are independent facts here: current flowing tells you charge is genuinely in motion, at up to its full peak value, the entire time; power tells you whether NET energy is being transferred out of the source into something that keeps it (heat, light, permanent storage). For a pure inductor, current flows continuously in BOTH directions across the cycle, and the ENERGY that accompanies its rise is returned in full as it falls — so charge moves, but the net energy books balance to exactly zero, every single cycle, forever. A live ammeter and a dead wattmeter side by side are not a contradiction; they are reading two genuinely different physical quantities that happen to agree everywhere except here.',
  ARRAY[
    'how can average power be zero when current is clearly flowing',
    'doesnt current flowing always mean power is being used',
    'if power is zero why does the ammeter show current at all',
    'is zero average power even possible with real current',
    'why does the wattmeter read zero but the circuit is obviously live'
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
