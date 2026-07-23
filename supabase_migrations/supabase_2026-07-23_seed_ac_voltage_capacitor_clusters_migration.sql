-- supabase_2026-07-23_seed_ac_voltage_capacitor_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for ac_voltage_capacitor.json —
-- the NEW field_3d 'ac_capacitor' scenario (Class 12 Ch.7 §7.4 AC Voltage
-- Applied to a Capacitor), the third concept of the Ch.7 Alternating Current
-- map. Engine delta landed in-loop (docs/loop_runs/ch7_engine_log.md,
-- commit 21e1f0f) as a clean standalone sibling of the sealed ac_resistor
-- and ac_inductor scenarios before this file was authored.
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
--   STATE_2 — the chapter's causality shock (the lead itself) —
--             why_lead_not_lag, current_before_voltage_causality, reading_lead_lag_on_time_graphs
--   STATE_4 — the PRIMARY aha + the calculus-shy student's wall (slope-vs-value reasoning) —
--             i_equals_c_dvdt_meaning, v_slope_vs_v_value_confusion, why_exactly_quarter_early
--   STATE_7 — the power paradox, round two (a device that visibly stores charge) —
--             capacitor_charging_heats_misconception, where_field_energy_goes_capacitor, zero_power_but_current_flows_capacitor

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 why_lead_not_lag deep-dive ────────────────────────────────
(
  'why_lead_not_lag',
  'ac_voltage_capacitor',
  'STATE_2',
  'Why does the current lead the voltage here and not lag, like the coil taught?',
  'Student has just been confronted with a lead they did not expect (the inductor prior one lesson ago said "current runs late"), and their first instinct is to assume every reactive component behaves the same way. It does not: for a pure capacitor, i = C dv/dt means the current tracks the voltage''s SLOPE, and a sinusoid''s slope (a cosine) peaks a quarter cycle BEFORE the sine itself crosses zero rising — which is exactly equivalent to saying the current (the cosine) peaks a quarter cycle BEFORE the voltage (the sine) does. The direction falls directly out of WHICH quantity is accumulating charge versus WHICH quantity is the rate of that accumulation — the inductor and capacitor swap those roles, which is exactly why their timing directions are mirror images, not copies.',
  ARRAY[
    'why does current lead and not lag this time',
    'didnt the coil teach us current is always late',
    'why is the capacitor the opposite of the coil',
    'is lead just lag backwards or something different',
    'why does this component flip the rule from last time'
  ],
  'pending_review'
),
-- ─── STATE_2 current_before_voltage_causality deep-dive ────────────────
(
  'current_before_voltage_causality',
  'ac_voltage_capacitor',
  'STATE_2',
  'How can the current arrive before the voltage that supposedly causes it?',
  'Student is reading the lead as a violation of cause-and-effect — if voltage is what drives the circuit, surely the current cannot show up first. Nothing about causality is actually broken: at every single instant the current is set by the voltage''s INSTANTANEOUS SLOPE (how fast it is changing right now), not by some future value it has not reached yet. The current "arriving early" relative to the voltage''s PEAK just means the slope is steepest before the peak is reached — a purely local, instant-by-instant relationship, not the current reaching into the future. The sim''s tangent-walk cursor (a later state) makes this concrete: the current at any instant is a simple, present-tense function of that same instant''s slope, nothing more mysterious than that.',
  ARRAY[
    'how can the current arrive before the voltage that causes it',
    'isnt that backwards, effect before cause',
    'does the capacitor know the voltage is coming',
    'how does current know to rise early if nothing pushed it yet',
    'is this actually breaking cause and effect'
  ],
  'pending_review'
),
-- ─── STATE_2 reading_lead_lag_on_time_graphs deep-dive ─────────────────
(
  'reading_lead_lag_on_time_graphs',
  'ac_voltage_capacitor',
  'STATE_2',
  'How do I actually tell from the graph which curve is leading and which is lagging?',
  'Student can see two wavy lines on the scope pane but has no reliable rule for reading "leads" or "lags" off the shapes themselves. The rule: find a peak (or a zero-crossing in the same direction) on EACH curve, then ask which one happens FIRST in time, reading left to right. Whichever curve reaches that landmark earlier is the one that LEADS; the other LAGS. The sim''s explicit time-order arrow is drawn for exactly this reason — it points FORWARD in time from the current''s peak to the voltage''s peak that follows it, so the direction of the arrow itself is the answer: an arrow pointing from current to a LATER voltage peak means current leads.',
  ARRAY[
    'how do i tell from the graph which one is early',
    'does the earlier peak mean it leads or lags',
    'why does the arrow point forward not backward',
    'which curve crossing zero first tells me the lead',
    'im lost reading which peak comes first on this graph'
  ],
  'pending_review'
),
-- ─── STATE_4 i_equals_c_dvdt_meaning deep-dive ─────────────────────────
(
  'i_equals_c_dvdt_meaning',
  'ac_voltage_capacitor',
  'STATE_4',
  'What does i = C dv/dt actually mean physically — what is dv/dt supposed to represent?',
  'Student can manipulate the symbols algebraically but "dv/dt" reads as an opaque calculus incantation rather than a physical picture. Concretely: dv/dt is just "how many volts the voltage is gaining or losing, per second, right now" — the same kind of quantity as a speedometer reading meters-per-second for a car''s position. C (the capacitance) is the plates'' own "eagerness constant" — how many amps of current it takes to force the voltage to change at a given rate; a bigger C means the SAME rate of voltage-change demands MORE current to supply it, because there is simply more plate area waiting to be filled. Reading the whole equation as one sentence: "the current flowing right now equals the plates'' eagerness times how fast you''re asking the voltage to change."',
  ARRAY[
    'what does i equals c dv dt actually mean here',
    'why does capacitance multiply the rate of change and not the voltage itself',
    'is dv dt just how fast the voltage is changing',
    'why isnt there a v term directly in that equation',
    'what is c actually doing in that formula'
  ],
  'pending_review'
),
-- ─── STATE_4 v_slope_vs_v_value_confusion deep-dive ────────────────────
(
  'v_slope_vs_v_value_confusion',
  'ac_voltage_capacitor',
  'STATE_4',
  'Why does the current care about voltage''s slope and not simply how big the voltage is?',
  'Student''s whole prior experience with "X controls Y" (including the resistor lesson two concepts ago, where bigger voltage simply meant bigger current) has been "X''s SIZE controls Y''s SIZE." i = C dv/dt breaks that pattern: the current is proportional to the RATE the voltage is changing, not to the voltage''s own instantaneous value — which is exactly why the current can be at its own peak (t=0, voltage=0) or exactly zero (voltage at its peak) depending purely on the SLOPE at that moment, never on the voltage reading itself. The sim''s tangent-walk cursor is built to make this concrete: watching a line''s tilt change in lockstep with a number on the CURRENT trace, at the same instant, is the bridge from "controls a value" to "controls a slope."',
  ARRAY[
    'why does the current care about voltages slope and not its value',
    'im confused how a slope can create a current',
    'so voltage size doesnt matter to the current',
    'how is slope different from the voltage itself',
    'why cant i just read current straight off the voltage graph'
  ],
  'pending_review'
),
-- ─── STATE_4 why_exactly_quarter_early deep-dive ───────────────────────
(
  'why_exactly_quarter_early',
  'ac_voltage_capacitor',
  'STATE_4',
  'Why is the lead always EXACTLY a quarter cycle, never a third or a fifth or something in between?',
  'Student suspects "quarter cycle" might be a rounded or approximate figure rather than an exact geometric fact — perhaps varying a little with the specific capacitor or voltage used. It is exact, and provably so, precisely BECAUSE it falls out of pure trigonometry rather than any component-specific number: the derivative of sin(theta) is cos(theta), and cos(theta) is IDENTICAL in shape to sin(theta) shifted EARLIER by exactly pi/2 radians — a quarter of a full 2*pi cycle — for EVERY possible amplitude, frequency, and capacitance value, with no exceptions and no approximation anywhere in the chain. Change vm, change C, change the frequency: iₘ changes, the TIMING SCALE (how many actual seconds a quarter-cycle takes) changes, but the FRACTION of one cycle never budges from exactly one quarter, because that fraction is a property of the sine/cosine relationship itself, not of the circuit.',
  ARRAY[
    'why exactly a quarter cycle early and not some other amount',
    'is the quarter cycle lead always exact or just approximate',
    'could the lead be a different fraction for a different capacitor',
    'why does the geometry force exactly 90 degrees early',
    'why is it always a quarter, never a third or a fifth early'
  ],
  'pending_review'
),
-- ─── STATE_7 capacitor_charging_heats_misconception deep-dive ─────────
(
  'capacitor_charging_heats_misconception',
  'ac_voltage_capacitor',
  'STATE_7',
  'If the plates keep pushing back against the source the whole cycle, why doesn''t the capacitor heat up like a resistor?',
  'Student has just watched STATE_3''s plate voltage visibly opposing the source''s attempt to change it and reasonably concludes that "pushing back" must always cost energy, the same way friction opposing motion always generates heat. The crucial difference: a resistor''s opposition is DISSIPATIVE — it converts electrical energy into heat that leaves the circuit for good and can never be recovered. A capacitor''s opposition is REACTIVE — it TEMPORARILY diverts energy into building up an electric field between its plates, and every single joule that goes in during one quarter cycle comes straight back out during the very next quarter cycle, fully and exactly, with nothing lost to heat anywhere in the process. "Pushing back" describes the DIRECTION of the plates'' response, not whether energy is being spent or merely borrowed; the wattmeter reading 0.00 W the whole time is the direct, honest proof that no joule ever actually leaves the system.',
  ARRAY[
    'if the plates keep pushing back doesnt that cost energy like a resistor',
    'why doesnt the capacitor heat up if its always resisting',
    'isnt charging something always going to waste some energy',
    'why does a resistor heat but a capacitor doesnt',
    'so pushing back on current isnt the same as burning it up'
  ],
  'pending_review'
),
-- ─── STATE_7 where_field_energy_goes_capacitor deep-dive ───────────────
(
  'where_field_energy_goes_capacitor',
  'ac_voltage_capacitor',
  'STATE_7',
  'Where does the energy stored in the electric field actually go when the field collapses?',
  'Student can accept that energy goes INTO the field while the plates are filling but pictures the field''s collapse as the energy simply vanishing or being "used up" quietly, rather than tracing where it re-emerges. It goes straight back to the SOURCE — as the plates empty, the very same charge that piled up now pours back out through the wires, actively pushing current backward through the circuit toward the source, exactly like a compressed spring pushing back on the hand that compressed it. The U-gauge falling to zero and the p-strip dipping below the baseline at that exact same moment are the SAME event described two ways: the field''s energy is being returned as real electrical work done back on the circuit, not dissipated, not destroyed — simply handed back to where it came from, ready to be borrowed again next quarter cycle.',
  ARRAY[
    'where does the energy in the field actually go',
    'does the energy disappear when the field collapses',
    'if energy is stored between the plates where does it go when they discharge',
    'is the energy really given back or lost somewhere',
    'whats on the other end getting that returned energy'
  ],
  'pending_review'
),
-- ─── STATE_7 zero_power_but_current_flows_capacitor deep-dive ──────────
(
  'zero_power_but_current_flows_capacitor',
  'ac_voltage_capacitor',
  'STATE_7',
  'How can the average power be exactly zero when the current is clearly, visibly flowing?',
  'Student conflates "current is flowing" with "power is being consumed," treating them as the same fact stated two ways — a very reasonable assumption everywhere EXCEPT a lossless reactive element, since it holds for a resistor and for essentially every everyday intuition about electricity. The two really are independent facts here: current flowing tells you charge is genuinely in motion, at up to its full peak value, the entire time; power tells you whether NET energy is being transferred out of the source into something that keeps it (heat, light, permanent storage). For a pure capacitor, current flows continuously in BOTH directions across the cycle, and the ENERGY that accompanies the plates filling is returned in full as they empty — so charge moves, but the net energy books balance to exactly zero, every single cycle, forever. A live ammeter and a dead wattmeter side by side are not a contradiction; they are reading two genuinely different physical quantities that happen to agree everywhere except here.',
  ARRAY[
    'how can average power be zero when current is clearly flowing',
    'doesnt current always mean some power is being used',
    'if power is zero why does the ammeter still show current',
    'is zero average power even possible with real current flowing',
    'why does the wattmeter read zero while the circuit is obviously active'
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
