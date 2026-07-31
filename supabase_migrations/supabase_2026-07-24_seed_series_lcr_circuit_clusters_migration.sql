-- supabase_2026-07-24_seed_series_lcr_circuit_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for series_lcr_circuit.json —
-- the NEW field_3d 'ac_series_lcr' scenario (Class 12 Ch.7 §7.6 AC Voltage
-- Applied to a Series LCR Circuit), the fifth concept of the Ch.7 Alternating
-- Current map. Engine build for the 'ac_series_lcr' scenario is ALREADY
-- SHIPPED (commit cec3a50) as of this authoring pass — unlike the phasors
-- migration (authored ahead of its engine delta), this one is authored
-- AFTER the renderer landed, matching the sealed contract.
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
--   STATE_5 — phasor addition is the mathematical abstraction of the concept
--             (students who cannot see WHY tip-to-tail is legitimate never
--             recover) —
--             why_voltages_dont_add_arithmetically, phasor_addition_tip_to_tail_method,
--             vl_vc_antiparallel_cancellation
--   STATE_6 — the quadrature algebra (the historically stuck computation:
--             Z = sqrt(R^2+X^2) vs the scalar sum; the triangle construction) —
--             impedance_vs_resistance_difference, z_quadrature_not_scalar_sum,
--             impedance_triangle_construction
--   STATE_8 — the PRIMARY aha + the exam-heaviest territory (what actually
--             happens at resonance; why current is maximal; the tuning
--             application) —
--             what_happens_at_resonance, why_current_peaks_at_f0,
--             radio_tuning_frequency_selection
-- Divergence from the misconception pivots (S4, S8) documented in the
-- skeleton: pivots sit at S4/S8 but investment goes S5/S6/S8 — S4's
-- confusion is resolved the moment S5's chain closes (the deep-dive
-- belongs with the TOOL, not the failure), and S6 is where the algebra
-- sticks.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_5 why_voltages_dont_add_arithmetically deep-dive ────────────
(
  'why_voltages_dont_add_arithmetically',
  'series_lcr_circuit',
  'STATE_5',
  'Why doesn''t 5.55 + 11.09 + 2.77 just equal the 10.0 V source?',
  'Student watched the struck arithmetic sum (19.41 V) fail against the true source reading (10.0 V) and accepts that SOMETHING is wrong with simple addition, but cannot yet articulate WHY — especially since Kirchhoff''s voltage law, learned in DC circuits, says voltages around a loop should add up. The resolution is that KVL never stopped being true — it was applied at the wrong moment. Kirchhoff''s law demands that INSTANTANEOUS voltages sum to the instantaneous source voltage at every single moment, v(t) = v_R(t) + v_L(t) + v_C(t), and this holds EXACTLY (STATE_4 proved it twice, at two different instants). The three PEAK values (5.55, 11.09, 2.77 V) are each the largest value that element''s voltage EVER reaches, but — because the three voltages are not in phase with each other — those three peaks occur at three DIFFERENT instants in the cycle. Summing three numbers that were never simultaneously true is not KVL at all; it is a category error, arithmetic performed on the wrong kind of quantity. The correct combination of PEAK values is not a number but a geometric one: tip-to-tail phasor addition, which STATE_5 performs directly.',
  ARRAY[
    'why doesnt 5.55 plus 11.09 plus 2.77 just equal the source voltage',
    'if kirchhoffs law says voltages add around a loop why doesnt this add up',
    'how can the source read less than the sum of its parts',
    'is ac voltage addition just different from dc',
    'why do i need arrows instead of just adding the three numbers'
  ],
  'pending_review'
),
-- ─── STATE_5 phasor_addition_tip_to_tail_method deep-dive ──────────────
(
  'phasor_addition_tip_to_tail_method',
  'series_lcr_circuit',
  'STATE_5',
  'Why tip-to-tail, and how do I know which arrow goes first in the chain?',
  'Student accepts that voltages must combine as vectors rather than numbers but is unsure why the specific tip-to-tail construction is the legitimate one, or whether the order of the three legs matters. The construction works because each element''s peak voltage IS literally a vector quantity once you track both its SIZE (the peak value) and its FIXED ANGLE relative to the shared current (0 deg for the resistor, +90 deg for the coil, -90 deg for the capacitor) — exactly the phasor picture built in STATE_3. Adding vectors tip-to-tail (place the second vector''s tail at the first vector''s tip, and so on) is the general geometric rule for summing ANY set of vectors, and it is legitimate here for the same reason it is legitimate in mechanics: the resultant''s magnitude and direction are fully determined by the SET of vectors being added, regardless of the order you lay them out in — starting with V_R then V_L then V_C gives the identical closing point as any other order, because vector addition is commutative. The ORDER chosen (R, then L, then C) is simply the narratively clearest one, not a physical requirement.',
  ARRAY[
    'why tip to tail and not just side by side',
    'how do i know which arrow goes first in the chain',
    'whats the point of moving the arrows if the angles dont change',
    'why does sliding the arrows around still count as the same physics',
    'how is this different from just adding vectors in mechanics'
  ],
  'pending_review'
),
-- ─── STATE_5 vl_vc_antiparallel_cancellation deep-dive ─────────────────
(
  'vl_vc_antiparallel_cancellation',
  'series_lcr_circuit',
  'STATE_5',
  'How can two positive voltages (V_L and V_C) end up cancelling each other in the chain?',
  'Student sees both the coil''s voltage (11.09 V) and the capacitor''s voltage (2.77 V) reported as ordinary positive numbers and is confused how two positive quantities produce a SMALLER net contribution (8.32 V) when combined, especially since the resistor''s voltage never behaves this way. The key fact is DIRECTION, not sign of the number: on the phasor diagram, the coil''s voltage points a quarter-turn AHEAD of the current and the capacitor''s voltage points a quarter-turn BEHIND it — a full 180 degrees apart from each other, making them exactly ANTIPARALLEL (opposite arrows on the SAME line). Antiparallel is not the same as "negative" in the arithmetic sense; both magnitudes (11.09 V and 2.77 V) are genuinely positive PEAK values, but when laid tip-to-tail their opposite directions mean the second one partially retraces the first, leaving a net vertical leg of only 11.09 - 2.77 = 8.32 V. The resistor''s voltage never cancels against anything because it alone sits in phase with the current (0 degrees) — it is the coil and capacitor''s special quarter-cycle-apart relationship (one leads, one lags, by the SAME amount) that makes them each other''s natural opponents, a relationship the resistor simply does not share.',
  ARRAY[
    'why do v_l and v_c point exactly opposite directions',
    'how can two positive voltages cancel each other out',
    'is antiparallel the same as negative',
    'why dont v_r and v_l cancel too',
    'whats special about the coil and capacitor that makes them opposites'
  ],
  'pending_review'
),
-- ─── STATE_6 impedance_vs_resistance_difference deep-dive ──────────────
(
  'impedance_vs_resistance_difference',
  'series_lcr_circuit',
  'STATE_6',
  'Isn''t impedance just another word for resistance — why can''t I use Ohm''s law with R alone?',
  'Student has used V = IR successfully in every DC circuit and reasonably wonders why this AC circuit needs an entirely new quantity, Z, instead of reusing R directly. Resistance R captures ONLY the energy-DISSIPATING opposition of the heater — the same value at every frequency, including DC (f = 0). Impedance Z is the CIRCUIT''s total opposition to current, and it must also account for the coil and capacitor''s reactance, which opposes current WITHOUT dissipating any energy (every joule they store in one quarter-cycle is returned the next) and, crucially, CHANGES with frequency (X_L = omega*L rises, X_C = 1/(omega*C) falls). Using plain Ohm''s law with R alone (im = vm/R) would ignore the coil and capacitor entirely, predicting a current that is wrong at every frequency except the one special case of resonance, where the two reactances happen to cancel and Z genuinely does equal R. Z is therefore the honest, frequency-aware generalization of R for a circuit that contains reactive elements — R is Z''s special case for a purely resistive circuit, never the reverse.',
  ARRAY[
    'isnt impedance just another word for resistance',
    'why cant i just use ohms law with regular resistance here',
    'whats actually different between z and r physically',
    'why does impedance need two numbers combined and resistance doesnt',
    'does impedance change with frequency the way resistance doesnt'
  ],
  'pending_review'
),
-- ─── STATE_6 z_quadrature_not_scalar_sum deep-dive ─────────────────────
(
  'z_quadrature_not_scalar_sum',
  'series_lcr_circuit',
  'STATE_6',
  'Why is impedance the square root of R squared plus X squared, and not just R plus X?',
  'Student has just seen the SAME error corrected once already for voltages (STATE_4/STATE_5 — peaks don''t add arithmetically) and now meets an analogous-looking formula for impedance, reasonably wondering whether the same quadrature rule applies here for the same reason. It does, and for exactly the same underlying reason: R and X are not measured along the same line. The impedance triangle IS the voltage triangle from STATE_5, simply divided through by the one shared current im — dividing every side of a triangle by the same number produces a SIMILAR triangle with all the same angles, just rescaled from volts into ohms. Since the resistor''s voltage (now R) and the net reactive voltage (now X) were 90 degrees apart on the ORIGINAL phasor diagram — R in phase with current, X perpendicular to it — that same right angle survives the division intact. The impedance triangle is therefore a genuine right triangle with legs R and X, and Z, the hypotenuse, follows the Pythagorean theorem exactly: Z = sqrt(R^2+X^2). Adding R + X directly would only be correct if the two legs pointed the SAME direction, which they never do.',
  ARRAY[
    'why is it root of r squared plus x squared and not just r plus x',
    'wheres the squaring coming from physically',
    'why does the impedance formula look like the pythagorean theorem',
    'is this the same right triangle thing as vectors',
    'why not just add r and the net reactance directly'
  ],
  'pending_review'
),
-- ─── STATE_6 impedance_triangle_construction deep-dive ─────────────────
(
  'impedance_triangle_construction',
  'series_lcr_circuit',
  'STATE_6',
  'How exactly does dividing the voltage triangle by the current turn volts into ohms, and does this triangle rotate like the phasors did?',
  'Student watched the morph animation (volts shrinking into ohms) but is unsure what mathematical operation actually happened, and — having just spent several states watching phasors rotate rigidly — reasonably wonders whether the impedance triangle keeps spinning too. Dimensionally, dividing a voltage (volts) by a current (amperes) gives exactly an impedance (ohms) — this is Ohm''s law itself, V/I = Z, applied not to the whole triangle at once but to EACH leg individually: (V_R)/im = R, (V_L - V_C)/im = X, and (vm)/im = Z, so the SAME triangle, only rescaled, describes both the voltage relationship and the impedance relationship simultaneously. Crucially, the impedance triangle does NOT rotate: its three sides are FIXED lengths, set once R, L, C and the frequency are chosen, and they stay fixed as the AC clock keeps ticking. This is the concept''s own explicit warning against a new misconception — the impedance triangle is a static circuit FINGERPRINT (a property of the circuit''s construction), not a phasor caught mid-rotation like the voltage arrows it came from.',
  ARRAY[
    'why does dividing by current turn volts into ohms',
    'if i divide the same triangle by something why does it still look the same shape',
    'does the impedance triangle rotate like the voltage arrows did',
    'how is this triangle different from the phasor diagram',
    'why is z always the longest side'
  ],
  'pending_review'
),
-- ─── STATE_8 what_happens_at_resonance deep-dive ───────────────────────
(
  'what_happens_at_resonance',
  'series_lcr_circuit',
  'STATE_8',
  'What does "resonance" actually mean in this circuit — is it a special state, or just a coincidence of the numbers?',
  'Student has watched the reactance curves cross and the current peak but is unsure whether resonance is a genuine physical phenomenon or merely an arithmetic coincidence of the particular R, L, C values chosen. Resonance is a REAL, general phenomenon that happens in EVERY series LCR circuit, at exactly one frequency determined entirely by L and C: the frequency where the inductive reactance (X_L = omega*L, which RISES with frequency) exactly equals the capacitive reactance (X_C = 1/(omega*C), which FALLS with frequency). Because these two quantities move in opposite directions as frequency changes, they are guaranteed to cross exactly once, at f0 = 1/(2*pi*sqrt(LC)) — this is not a coincidence of THIS build''s numbers, it is a structural consequence of one reactance rising while the other falls. What IS specific to this build is that the founder chose L and C so that f0 happens to land exactly on the sim''s default frequency (0.25 Hz) — a deliberately engineered "gift" for teaching, not a claim that resonance always sits at whatever frequency a dial happens to start on.',
  ARRAY[
    'what does resonance actually mean in this circuit',
    'why does everything become simple exactly at one frequency',
    'is resonance a special state or just a coincidence of the numbers',
    'does resonance happen in every lcr circuit or only some',
    'what is actually canceling out at resonance'
  ],
  'pending_review'
),
-- ─── STATE_8 why_current_peaks_at_f0 deep-dive ─────────────────────────
(
  'why_current_peaks_at_f0',
  'series_lcr_circuit',
  'STATE_8',
  'I thought more parts in the circuit always means less current — why does the current suddenly jump back up at f0 instead of staying low?',
  'Student earned this exact belief honestly: every off-home frequency shown earlier in the concept (STATE_2 onward) made the current SMALLER than the bare-heater value, so a jump back UP feels like it should be impossible. The resolution is that the coil and capacitor were never opposing the CURRENT directly — they were opposing EACH OTHER. Away from resonance, X_L and X_C are unequal, so their difference X = X_L - X_C is nonzero and adds in quadrature to R, making the total impedance Z = sqrt(R^2+X^2) larger than R alone, which does shrink the current (im = vm/Z). But exactly AT f0, X_L and X_C become EQUAL, so X = 0 and Z collapses to exactly R — the coil and capacitor have not "gone away," they are still there, still opposing current individually, but their OPPOSITE-direction opposition (leading vs lagging) cancels perfectly, leaving the circuit behaving, electrically, as if only the resistor existed. The current at resonance therefore reaches its true ceiling: im = vm/R, the largest peak current this circuit can EVER produce at any frequency.',
  ARRAY[
    'why does the current suddenly jump back up instead of staying low',
    'i thought more parts in the circuit always means less current',
    'why is the peak exactly at the frequency where reactances match',
    'does the current peak mean the circuit is doing something special',
    'why cant the current go higher than this peak value'
  ],
  'pending_review'
),
-- ─── STATE_8 radio_tuning_frequency_selection deep-dive ────────────────
(
  'radio_tuning_frequency_selection',
  'series_lcr_circuit',
  'STATE_8',
  'How does turning a radio dial actually pick out one station when every station''s signal arrives at the antenna at the same time?',
  'Student accepts the resonance curve mathematically but has not yet connected it to the everyday act of tuning a radio, and is puzzled that a single antenna receiving EVERY station''s signal simultaneously can still produce just one station''s sound. Every broadcast station''s radio wave really does arrive at the antenna at once, each oscillating at its own carrier frequency — but behind the tuning dial sits a series LCR circuit exactly like this one. Turning the dial changes the CAPACITANCE, which slides the circuit''s own resonant frequency f0 = 1/(2*pi*sqrt(LC)) up or down the dial. Every incoming station drives this circuit at its own frequency, but ONLY the one station whose frequency happens to match f0 meets the "everything cancels" condition — its current surges to the circuit''s maximum (im = vm/R), hundreds of times stronger than any neighbouring, off-resonance station, whose current stays suppressed by a large mismatched impedance. The circuit does not somehow "ignore" the other stations — it genuinely receives all of them, but selectively AMPLIFIES the one at resonance so overwhelmingly that only it survives to be heard. A sharper resonance peak (small R, high Q) makes this selection cleaner, letting two nearby stations be told apart without interference.',
  ARRAY[
    'how does turning a radio dial actually pick one station',
    'why dont all the radio stations play at once if theyre all arriving',
    'whats the capacitor got to do with tuning a radio',
    'why does a sharper peak help separate two stations',
    'is tuning a radio literally just changing the resonant frequency'
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
