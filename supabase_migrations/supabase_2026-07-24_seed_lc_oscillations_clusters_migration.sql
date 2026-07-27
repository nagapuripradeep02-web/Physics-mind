-- supabase_2026-07-24_seed_lc_oscillations_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for lc_oscillations.json —
-- the NEW field_3d 'lc_oscillation' scenario (Class 12 Ch.7 §7.8 LC
-- Oscillations), the seventh concept of the Ch.7 Alternating Current map.
-- Class-B triage: engine build for the 'lc_oscillation' scenario is
-- dispatched SEPARATELY from this authoring pass (peter_parker:
-- renderer_primitives scope) — this migration seeds the drill-down cluster
-- registry only and does not depend on the renderer being live.
--
-- Authored 2026-07-24 by alex:json_author per architect skeleton section 6
-- + physics_author drill-down trigger phrases (verbatim, physics block
-- section 5).
--
-- Migration is AUTHORED, NOT APPLIED — quality_auditor's pre-run step
-- applies it (json_author is forbidden from apply_migration). Per the
-- CHAPTER_LOOP trial rules this migration is NEVER applied to the live DB
-- this phase; no DB writes happen from this authoring session — files
-- only. Drill-down itself is DEFERRED (Rule 18, 2026-06-10 directive) —
-- the confusion_cluster_registry Gate-8 probe is N/A-DORMANT this phase
-- per the documented false-FAIL scar (memory: auditor-cluster-registry-
-- false-fail). Do not let the auditor re-route json_author to "fix" this.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real student-voice phrasings (lowercase,
-- idiomatic, no textbook prose), verbatim from the physics block section 5.
-- status='pending_review' per the current cluster-registry convention.
--
-- has_prebuilt_deep_dive states + clusters (architect skeleton section 5):
--   STATE_3 — PRIMARY aha (the through-zero crossing): the concept's core
--             insight + densest documented confusion ("why doesn't it
--             stop", "where does the current come from with no source",
--             "why does the polarity reverse") —
--             why_current_max_at_zero_charge, inductor_opposes_change_not_current,
--             capacitor_recharges_reversed_polarity
--   STATE_5 — the energy mathematics (computing I0 from 1/2 C V0^2 = 1/2 L I0^2;
--             when is the energy half-and-half; the 2*f0 exchange rhythm —
--             the exam-heavy computation site) —
--             lc_energy_conservation_math, max_current_from_energy_balance,
--             energy_exchange_twice_per_cycle
--   STATE_6 — the correspondence mapping (which maps to which and WHY L is
--             mass, not spring — the abstraction students memorize wrong) —
--             lc_shm_correspondence_table, inductance_as_inertia,
--             reciprocal_c_as_spring_constant
-- Divergence from the misconception pivots (STATE_3, STATE_5) documented in
-- the skeleton: pivots sit at STATE_3/STATE_5, investment goes
-- STATE_3/STATE_5/STATE_6 — STATE_6 is where the algebra of the mechanical
-- analogy sticks even after both pivots land.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 why_current_max_at_zero_charge deep-dive ──────────────────
(
  'why_current_max_at_zero_charge',
  'lc_oscillations',
  'STATE_3',
  'Why is the current biggest exactly when there''s no charge left on the plates?',
  'Student watched the struck ghost — the "q=0 means i=0" pose — get refuted the instant the real circuit crosses zero charge, and wants the plain-English reason the current is not just nonzero there but at its own PEAK. Charge and current in a free LC oscillation are a quarter cycle apart, exactly the way a pendulum''s displacement and speed are a quarter cycle apart: q(t) = Q0 cos(omega0 t) and i(t) = dq/dt = -I0 sin(omega0 t) are two different trigonometric functions of the SAME clock, and sine and cosine never peak together — sine is largest exactly where cosine crosses zero. Physically, as the plates discharge, the coil''s magnetic field has been steadily building (fed by the very current draining the plates); by the instant the plates are exactly empty, ALL the circuit''s stored energy has migrated into the coil''s magnetic field, and the current that carries that field is at its own largest possible value, I0 = Q0 * omega0 = 2.00 A here. "Zero charge" is not "story over" — it is the exact midpoint of the swing, the moment the electrical pendulum is at its lowest, fastest-moving point.',
  ARRAY[
    'why is the current biggest when theres no charge left',
    'how can zero charge give the strongest current',
    'shouldnt no charge mean no current at all',
    'why does the current peak right when the capacitor is empty',
    'isnt an empty capacitor just a dead circuit at that point'
  ],
  'pending_review'
),
-- ─── STATE_3 inductor_opposes_change_not_current deep-dive ─────────────
(
  'inductor_opposes_change_not_current',
  'lc_oscillations',
  'STATE_3',
  'Does the coil fight the current itself, or only fight CHANGES in the current?',
  'Student has seen the coil "keep the current going" past the empty-plate instant and wonders whether the coil is somehow acting like a hidden battery or actively driving the current, rather than merely allowing it to continue. The coil never pushes current — it only OPPOSES any change to whatever current is already flowing (the ac_voltage_inductor prerequisite: v = L di/dt, a back-emf that fights the RATE of change, not the size). At the instant the plates go empty, the current is not stopping — it is flowing at its own maximum, completely unchanging for an instant (di/dt momentarily related only to the coil''s own equilibrium at that phase) — so the coil has nothing to fight right there. What the coil DID do, in the quarter cycle leading up to that instant, is refuse to let the current jump to zero the moment the driving charge ran out: exactly like a moving mass refuses to stop the instant a spring''s restoring force vanishes at the equilibrium point, inertia (the coil''s own self-inductance) carries the motion through. The coil is not a second source — it is the circuit''s own inertia, converting stored magnetic energy back into current precisely because stopping abruptly would require an infinite back-emf, which is physically impossible.',
  ARRAY[
    'why doesnt the coil just let the current stop when charge runs out',
    'does the coil fight the current itself or just changes in it',
    'why does the coil keep pushing current even with nothing driving it',
    'whats actually forcing the current to keep flowing after the plates are empty',
    'is the coil acting like its own little battery for a moment'
  ],
  'pending_review'
),
-- ─── STATE_3 capacitor_recharges_reversed_polarity deep-dive ───────────
(
  'capacitor_recharges_reversed_polarity',
  'lc_oscillations',
  'STATE_3',
  'Where does the reversed charge on the plates actually come from?',
  'Student watched the plate glyphs vanish at the crossing and then re-appear with FLIPPED sign, and wants to know what physically deposits opposite-polarity charge on plates that were, moments ago, completely empty — especially since the battery is long gone from the circuit. The current never actually stopped at the crossing — it was at its own peak, still flowing in the SAME direction it had been flowing in since the switch was thrown. That same, continuing current keeps delivering charge to the plates exactly as before; the only thing that changed is which plate was already empty and available to receive it. Because the plates had just fully discharged (both starting at zero) and the current direction did not reverse at that instant, the charge that arrives next necessarily piles up with the OPPOSITE sign from before — the plate that was positive is now accumulating negative charge, and vice versa. Nothing reverses the battery (it is not even in the circuit); the coil''s own continuing, unbroken current is what "wants" to keep flowing in its established direction, and the plates simply record whichever sign that delivers next. The circuit will fully reverse-charge, then the current itself reverses direction (driven by the now-fully-charged, oppositely-poled plates), and the whole cycle repeats — the honest engine behind an oscillation that never needs restarting.',
  ARRAY[
    'why does the capacitor charge up backwards after being emptied',
    'how does the polarity flip without anything reversing the battery',
    'wheres the reversed charge actually coming from',
    'does the plate that was positive become negative now',
    'why would the circuit want to charge itself the opposite way'
  ],
  'pending_review'
),
-- ─── STATE_5 lc_energy_conservation_math deep-dive ─────────────────────
(
  'lc_energy_conservation_math',
  'lc_oscillations',
  'STATE_5',
  'What''s the actual math connecting the capacitor''s energy to the coil''s energy?',
  'Student has watched the two gauges trade in antiphase under a flat total and accepts the qualitative "energy only changes address" story, but wants the precise formulas that connect the capacitor''s stored energy to the coil''s stored energy at any instant, not just the two extremes. At every instant (with R = 0, the ideal loop) the capacitor holds E_C(t) = q(t)^2 / (2C) and the coil holds E_B(t) = (1/2) L i(t)^2, and because q(t) = Q0 cos(omega0 t) and i(t) = -I0 sin(omega0 t) with I0 = Q0 * omega0 and omega0^2 = 1/(LC), substituting shows E_C(t) + E_B(t) collapses to the SAME constant, Q0^2/(2C), at every single instant — the famous cos^2 + sin^2 = 1 identity doing the conservation work algebraically, not just qualitatively. This is exactly why the total-line marker in the gauges never moves: it is not an approximation or a coincidence of this particular circuit, it is an algebraic identity guaranteed by the very differential equation the loop obeys. The two gauges are literally reading two different, exactly complementary slices of the SAME fixed total, Q0^2/(2C) = (1/2) C V0^2 = 6.36 J here.',
  ARRAY[
    'how do you actually calculate the max current from just the voltage',
    'wheres the formula linking the capacitor energy to the coil energy',
    'why do half c v squared and half l i squared have to be equal',
    'how is energy conserved if nothing is being supplied anymore',
    'whats the actual math connecting charge energy and current energy'
  ],
  'pending_review'
),
-- ─── STATE_5 max_current_from_energy_balance deep-dive ─────────────────
(
  'max_current_from_energy_balance',
  'lc_oscillations',
  'STATE_5',
  'Is there a shortcut to find the peak current without doing calculus?',
  'Student can watch the HUD read i = 2.00 A at the crossing but wants a way to COMPUTE that number directly from V0, L, and C, ideally without solving the differential equation from scratch — a genuinely common exam-style ask. Yes: the peak current follows in one line from energy conservation alone, no calculus needed once you accept that the total energy is fixed. At the moment the plates are fully charged and current has not yet started (STATE_1''s end), ALL the energy is electric: E_total = 1/2 C V0^2. At the crossing (STATE_3''s moment), the plates are empty and ALL the energy has migrated to the coil: E_total = 1/2 L I0^2. Since the total cannot change (STATE_5''s own lesson), these two expressions for the SAME E_total must be equal: 1/2 C V0^2 = 1/2 L I0^2, so I0 = V0 * sqrt(C/L). Plugging in this build''s numbers, I0 = 10.0 * sqrt(0.1273/3.1831) = 2.00 A exactly matching the measured HUD reading — energy conservation alone, at the two extreme instants, is the entire shortcut; no differential equation required.',
  ARRAY[
    'why does setting the two energy formulas equal give you the peak current',
    'is there a shortcut to find the max current without calculus',
    'why does all the capacitor energy have to become coil energy at some point',
    'how do i solve for i naught from just v naught l and c',
    'does the peak current depend on both l and c or just one of them'
  ],
  'pending_review'
),
-- ─── STATE_5 energy_exchange_twice_per_cycle deep-dive ─────────────────
(
  'energy_exchange_twice_per_cycle',
  'lc_oscillations',
  'STATE_5',
  'Why does the energy trade between the plates and the coil TWICE in one swing, not once?',
  'Student noticed the half-split chip (3.18 J + 3.18 J = 6.36 J) fires at T0/8, which is a full quarter of the way through a HALF-swing, and is confused about why the energy exchange seems to run at a different rhythm than the charge itself. The charge q(t) completes one full swing (fully positive to fully negative and back) every T0 = 4.00 s. But the ENERGY only cares about the MAGNITUDE of q and i, not their sign — E_C is proportional to q^2 and E_B to i^2, and squaring erases the sign entirely. Over one full period, q goes from +Q0 to 0 to -Q0 to 0 back to +Q0 — that is TWO complete electric-to-magnetic-to-electric energy round trips (once during the first half-swing, once during the second, even though the CHARGE itself only reversed sign once, at the halfway point). This is exactly why the exchange period is T0/2 = 2.00 s, not T0 = 4.00 s — the energy oscillates at DOUBLE the charge''s own frequency, the same "squaring doubles the frequency" fact that makes an AC power curve run at double the source frequency in the earlier ac_power_factor concept.',
  ARRAY[
    'why does the energy switch back and forth twice in one swing',
    'shouldnt the energy trade happen only once per cycle',
    'whats special about twice per cycle instead of once',
    'why is the energy swap frequency different from the charge swap frequency',
    'does the energy really finish trading faster than the charge oscillates'
  ],
  'pending_review'
),
-- ─── STATE_6 lc_shm_correspondence_table deep-dive ─────────────────────
(
  'lc_shm_correspondence_table',
  'lc_oscillations',
  'STATE_6',
  'Which electrical quantity matches which mechanical quantity, exactly, and why?',
  'Student has watched the block-on-a-spring inset track the charge trace but wants the full, precise correspondence table rather than a single visual impression, and wants to know whether the mapping is forced by the mathematics or just a loose teaching analogy. It is forced, not loose: the source-free LC loop obeys L (d^2 q / dt^2) + q/C = 0, and an ideal mass-spring system obeys m (d^2 x / dt^2) + k x = 0 — these are the IDENTICAL differential equation with the substitutions q -> x (charge maps to displacement), L -> m (inductance maps to mass), and 1/C -> k (reciprocal capacitance maps to the spring constant). Because current is the rate of change of charge, i = dq/dt, and velocity is the rate of change of displacement, v = dx/dt, the correspondence i -> v follows automatically, with no separate assumption needed. Even the frequency formulas match term for term: omega0 = 1/sqrt(LC) for the circuit and omega = sqrt(k/m) for the mechanical oscillator are the SAME formula with the substitutions applied — this is why L is genuinely inertia and 1/C is genuinely a spring constant, not just a convenient picture.',
  ARRAY[
    'which electrical thing matches which mechanical thing exactly',
    'why does inductance match mass and not something else',
    'is this analogy exact or just a rough comparison',
    'how do i remember which quantity maps to which in this table',
    'does the math actually force this pairing or is it just convenient'
  ],
  'pending_review'
),
-- ─── STATE_6 inductance_as_inertia deep-dive ───────────────────────────
(
  'inductance_as_inertia',
  'lc_oscillations',
  'STATE_6',
  'Why is inductance like mass, and not like a spring or a strength rating?',
  'Student has heard "the coil is the mass" repeated but wants the physical reasoning, since inductance is usually first introduced as an opposition to current (which sounds more spring-like, i.e. resistive) rather than as inertia. The key distinguishing question is: what does each quantity resist, a SIZE or a CHANGE? A spring resists displacement itself — the further you stretch it, the harder it pushes back, purely as a function of position. Mass resists nothing about position at all; it only resists CHANGES in velocity (acceleration), via F = ma — a mass moving at constant velocity feels no resistance whatsoever. Inductance behaves exactly like mass: a coil carrying a perfectly STEADY current feels zero back-emf (v = L di/dt = 0 when di/dt = 0) — the coil does not oppose the current''s SIZE at all, only changes in it, exactly like mass opposing only changes in velocity. A bigger inductor does not mean "more current is blocked" (that would make it spring-like); it means the current is HARDER TO CHANGE, ramping up and down more sluggishly for the same driving conditions — precisely the inertia signature, and precisely why the coil (not the capacitor) is what refused to let the current stop at the STATE_3 crossing.',
  ARRAY[
    'why is inductance like mass instead of like a spring',
    'what does it even mean for an electrical part to have inertia',
    'how does the coil resist a change the same way mass does',
    'why doesnt a bigger inductor just mean a stronger current',
    'is inductance really about resisting change and not about strength'
  ],
  'pending_review'
),
-- ─── STATE_6 reciprocal_c_as_spring_constant deep-dive ─────────────────
(
  'reciprocal_c_as_spring_constant',
  'lc_oscillations',
  'STATE_6',
  'Why is it 1/C, and not C itself, that behaves like the spring constant?',
  'Student has seen the correspondence chip "1/C <-> k" and finds it counter-intuitive that the RECIPROCAL of capacitance, rather than capacitance directly, plays the spring-constant role — especially since a bigger capacitor usually sounds like it should mean "more", not "stiffer". The physical reasoning follows directly from the restoring-voltage relationship: for a capacitor, v = q/C, so a GIVEN charge q on a SMALLER capacitance C produces a LARGER voltage — a smaller C therefore pushes back harder (more volts) for the same amount of charge displaced onto the plates, exactly the way a stiffer spring (bigger k) pushes back harder for the same displacement, F = kx. This is precisely why the resonance/natural-frequency formula has C sitting where it does: omega0 = 1/sqrt(LC), so a SMALLER capacitance (a "stiffer electrical spring") raises the natural frequency, matching a mechanical oscillator''s own omega = sqrt(k/m) rising with a stiffer spring. A bigger capacitor is a SOFTER electrical spring: it accepts more charge for the same voltage, restores more gently, and swings at a lower frequency — the exact mechanical intuition, once the reciprocal relationship v = q/C is seen as the restoring-force law in disguise.',
  ARRAY[
    'why is it one over c and not just c that acts like the spring constant',
    'why does a smaller capacitor act like a stiffer spring',
    'whats the physical reason capacitance flips upside down in the analogy',
    'does a bigger capacitor make the swing softer or stiffer',
    'how does one over c connect to how hard the spring pushes back'
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
