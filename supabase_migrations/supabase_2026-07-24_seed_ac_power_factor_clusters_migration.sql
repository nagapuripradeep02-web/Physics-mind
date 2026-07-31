-- supabase_2026-07-24_seed_ac_power_factor_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for ac_power_factor.json —
-- the NEW field_3d 'ac_power' scenario (Class 12 Ch.7 §7.7 Power in AC
-- Circuit: The Power Factor), the sixth concept of the Ch.7 Alternating
-- Current map. Engine build for the 'ac_power' scenario is ALREADY SHIPPED
-- (commit 9df14e3, Stage 6) as of this authoring pass.
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
--   STATE_4 — PIVOT #1 (apparent-vs-real power): the "why isn't power just
--             V times I" confusion is the concept's own front door — most
--             students land here first —
--             apparent_vs_real_power, why_power_less_than_v_times_i,
--             volt_ampere_vs_watt_units
--   STATE_5 — PRIMARY aha (the current projection): where the algebra
--             (cos phi = R/Z) becomes a PICTURE (the split current arrow) —
--             students who can't see WHY cos phi and not sin phi never
--             recover the rest of the concept —
--             power_factor_physical_meaning, in_phase_current_component,
--             cos_phi_as_projection
--   STATE_8 — the power triangle + unit territory (P/Q/S, VAR vs W vs VA,
--             the JEE-adjacent nameplate-rating application) —
--             power_triangle_pqs_relations, reactive_power_var_meaning,
--             kva_vs_kw_rating
-- Divergence from the misconception pivots (S4, S6) documented in the
-- skeleton: pivots sit at S4/S6 but investment goes S4/S5/S8 — S6's
-- wattless-current paradox resolves in-state (the R-cycle IS its own
-- explanation), while S5 and S8 are where the algebra and the units stick.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_4 apparent_vs_real_power deep-dive ──────────────────────────
(
  'apparent_vs_real_power',
  'ac_power_factor',
  'STATE_4',
  'What''s the actual difference between apparent power and real power?',
  'Student has just watched the ghost needle swing to 5.55 W (the naive volts-times-amps guess) get struck out beside the real needle''s steady 3.08 W, and now wants the plain-English difference between the two quantities, not just the numbers. Apparent power, S = V_rms * I_rms, is the CEILING — the largest power figure the circuit''s own voltage and current magnitudes could possibly represent, exactly what you would get if voltage and current were perfectly in step (a pure resistor). It is what the supply wiring, transformer, and generator must be BUILT to carry, because they see the full current regardless of phase. Real (average) power, P = V_rms * I_rms * cos(phi), is what actually gets delivered and converted to useful work — heat in the heater, in this build. The gap between them is never "wasted" or "hidden" — it is the wattless share of the current (STATE_5/6''s own territory), the part that flows through the wires without ever doing work. This is exactly why equipment carries two separate ratings, VA and W: one for what the wiring must survive, one for what actually gets done.',
  ARRAY[
    'whats the difference between apparent power and real power',
    'why does the meter not just read volts times amps',
    'if the meter reads less wheres the rest of the power going',
    'is apparent power even real power at all',
    'why do we need two different power numbers'
  ],
  'pending_review'
),
-- ─── STATE_4 why_power_less_than_v_times_i deep-dive ───────────────────
(
  'why_power_less_than_v_times_i',
  'ac_power_factor',
  'STATE_4',
  'Why is the real power always smaller than V times I — can it ever be bigger?',
  'Student has accepted that 3.08 W is less than 5.55 W here but wants to know if this is a rule or just what happened to work out for this particular circuit — and whether real power could ever exceed the volts-times-amps number. It is a genuine, unbreakable bound: cos(phi) = R/Z is mathematically confined to the range zero to one for any physically real resistance R > 0 and impedance Z >= R, so P = S * cos(phi) can never exceed S, and the two are exactly equal only at the special case cos(phi) = 1 (unity power factor — the bare-heater case, or this circuit at its own resonance). Nothing is being "eaten" by the circuit in the sense of lost energy — an ideal inductor and capacitor dissipate exactly zero joules net per cycle (the STATE_7 energy ledger proves this directly): the missing power was never available for delivery in the first place, because part of the current was never aligned with the voltage to begin with. A light bulb (a near-pure resistor) never shows this gap because its current has nowhere to misalign — it is always exactly in phase, cos(phi) = 1, by construction.',
  ARRAY[
    'why is the real power always smaller than v times i',
    'can real power ever be bigger than v times i',
    'wheres the missing power going if its not v times i',
    'does the circuit eat some of the power',
    'why doesnt volts times amps just work like it does for a light bulb'
  ],
  'pending_review'
),
-- ─── STATE_4 volt_ampere_vs_watt_units deep-dive ───────────────────────
(
  'volt_ampere_vs_watt_units',
  'ac_power_factor',
  'STATE_4',
  'Why do volt-amps and watts even need to be different units?',
  'Student sees VA and W both come out as ordinary numbers (5.55 and 3.08 here) and reasonably wonders whether the unit distinction is just bookkeeping rather than a physically meaningful difference. The two units measure genuinely DIFFERENT physical questions. A watt (W) answers "how much energy is being converted to useful work per second" — it is what a customer is billed for and what a heater''s glow, a motor''s torque, or a lamp''s light actually consumes. A volt-ampere (VA) answers "how large a current-and-voltage combination must the supply infrastructure be able to carry" — it sets the wire gauge, the transformer size, the generator rating, because those components must survive the FULL current regardless of whether that current is doing useful work or just shuttling wattlessly back and forth. The two units are numerically EQUAL only when cos(phi) = 1 (a purely resistive load); for any circuit with reactance, VA is strictly the larger number, and the gap between them is precisely why a nameplate quotes both — the kW number promises what the machine delivers, the kVA number tells the electrician what the wiring must be built to survive.',
  ARRAY[
    'why are volt amps not the same as watts',
    'isnt a va just another name for a watt',
    'why does the nameplate use two different units',
    'when would va and watts actually be equal',
    'why bother with va if watts is what actually gets used'
  ],
  'pending_review'
),
-- ─── STATE_5 power_factor_physical_meaning deep-dive ───────────────────
(
  'power_factor_physical_meaning',
  'ac_power_factor',
  'STATE_5',
  'What does the power-factor number actually mean, physically?',
  'Student can compute cos(phi) = R/Z = 0.555 but treats it as an abstract ratio rather than a physically meaningful quantity, and is unsure why a power factor of one is the best possible case or what a power factor of zero would even look like. Physically, the power factor is the FRACTION of the current that is aligned in phase with the voltage — equivalently, the fraction of the apparent power (the volts-times-amps ceiling) that survives as real, delivered power. A power factor of exactly one (the bare-heater case, or this circuit at resonance) means EVERY amp of current is working — none of it is wattless, so apparent power and real power coincide exactly. A power factor of zero (a lone ideal coil or ideal capacitor, seen in the ac_voltage_inductor/ac_voltage_capacitor prerequisites) means the current is entirely PERPENDICULAR to the voltage — every amp flows, but none of it ever does work, so the wattmeter reads exactly zero no matter how large the current is. Power factor is not "efficiency" in the sense of energy being wasted as heat — it is a phase-alignment fact about the circuit''s own reactance, which is precisely why it depends on the circuit''s construction (R, L, C, and frequency), never on the current''s size alone.',
  ARRAY[
    'what does the power factor number actually mean',
    'why is a power factor of one the best case',
    'what does it mean when the power factor is zero',
    'is power factor just efficiency',
    'why does the power factor depend on the circuit not just the current'
  ],
  'pending_review'
),
-- ─── STATE_5 in_phase_current_component deep-dive ──────────────────────
(
  'in_phase_current_component',
  'ac_power_factor',
  'STATE_5',
  'What does "in-phase current" even mean, and why does only part of the current matter?',
  'Student watched the current arrow split into two dashed components on the fan and accepts that one part "does the work" while the other doesn''t, but is unsure what "in phase" means geometrically or why current — a single, real, measurable quantity — can be legitimately divided this way. "In phase with the voltage" means the two quantities peak and cross zero at the exact same instants — they rise and fall in lockstep, like the resistor''s own current always does. In this circuit, the total current is neither fully in phase nor fully perpendicular to the voltage; it sits at some fixed angle phi between them. Just as a force at an angle can be split into a component along a direction of motion (which does work) and a component perpendicular to it (which does none), the current phasor can be split into a component ALONG the voltage''s own direction — I_rms cos(phi), which delivers power — and a component PERPENDICULAR to it — I_rms sin(phi), which does not. This is not two separate currents flowing (the solid amber arrow stays ONE current throughout) — it is one current, described two equivalent ways, exactly the way a single displacement can be described by its x- and y-components without becoming two displacements.',
  ARRAY[
    'what does in phase current even mean',
    'why does only part of the current matter',
    'how can current be in phase with something',
    'is the in phase part the useful current',
    'why split the current into two pieces at all'
  ],
  'pending_review'
),
-- ─── STATE_5 cos_phi_as_projection deep-dive ───────────────────────────
(
  'cos_phi_as_projection',
  'ac_power_factor',
  'STATE_5',
  'Why is it cos phi specifically, and not sin phi, that decides the real power?',
  'Student can recite P = V_rms * I_rms * cos(phi) but wants to know why cosine — rather than sine, or some other function of the angle — is the correct one, and whether there is a geometric reason rather than just a memorized formula. The answer is projection. On the phasor fan, current and voltage are two arrows separated by the fixed angle phi. The component of the current ALONG the voltage''s own direction — the one that actually delivers power — has length I_rms * cos(phi), because that is exactly how you project one vector onto another: multiply the length by the cosine of the angle between them. This is the same geometric fact used everywhere else in physics (work = force times displacement times cos(theta), for instance) — cosine measures alignment, and alignment is exactly what determines whether current is doing work on the voltage''s own timing. Sine, by contrast, measures the PERPENDICULAR component — the part of the current that is exactly 90 degrees out of step, which is precisely the wattless current explored next. So cos(phi) is not an arbitrary formula choice; it is the direct geometric consequence of only the aligned share of the current ever doing work.',
  ARRAY[
    'why is it cos phi and not something else',
    'is cos phi just a projection of the current',
    'why does the angle between v and i decide the power',
    'whats the geometry behind cos phi',
    'why cosine and not sine for the real power part'
  ],
  'pending_review'
),
-- ─── STATE_8 power_triangle_pqs_relations deep-dive ────────────────────
(
  'power_triangle_pqs_relations',
  'ac_power_factor',
  'STATE_8',
  'How exactly are P, Q, and S related in the power triangle?',
  'Student watched the impedance triangle rescale into the power triangle but wants the precise relationship between the three power quantities, and is puzzled that the displayed numbers (3.08, 4.62, 5.55) don''t exactly satisfy P-squared plus Q-squared equals S-squared when checked by hand. The power triangle is not a new geometric fact — it IS the impedance triangle (legs R, X, hypotenuse Z) uniformly scaled by I_rms squared: P = I_rms^2 * R, Q = I_rms^2 * X, S = I_rms^2 * Z. Because scaling every side of a right triangle by the same factor preserves the right angle, S-squared equals P-squared plus Q-squared is EXACTLY true in the true, unrounded values — the apparent discrepancy only appears when checking with the rounded, displayed 2-decimal numbers, which lose just enough precision to break the identity at that resolution (this is a display-rounding artifact, not a physics failure, which is why this sim never presents that particular check as a clickable arithmetic chip). The right angle itself carries real meaning: it says real power (P, along the "resistive" leg) and reactive power (Q, along the "reactive" leg) are fundamentally different KINDS of quantity that combine in quadrature, never by simple addition — exactly like R and X did before them.',
  ARRAY[
    'how are p q and s related in the power triangle',
    'is the power triangle the same as the impedance triangle',
    'why does p squared plus q squared not exactly equal s squared on the numbers',
    'what does the right angle in the power triangle mean',
    'why does scaling the impedance triangle give me power'
  ],
  'pending_review'
),
-- ─── STATE_8 reactive_power_var_meaning deep-dive ──────────────────────
(
  'reactive_power_var_meaning',
  'ac_power_factor',
  'STATE_8',
  'What is reactive power actually doing if it isn''t real power?',
  'Student sees Q = 4.62 VAR labeled "reactive power" right beside the real power P and reasonably wonders whether this is energy being wasted somewhere, or whether it is measured in a different unit (VAR, not W) simply to hide that it is being lost. Reactive power is neither wasted nor consumed — it is a bookkeeping number for the RATE at which energy sloshes back and forth between the source and the inductor/capacitor every cycle, the same borrow-and-return exchange the STATE_7 energy ledger shows directly (E_L and E_C both breathe to a peak and back to zero, net zero every single cycle). It is measured in VAR (volt-amps-reactive) rather than watts specifically to keep this distinction visible on a nameplate or a utility bill — VAR quantities are never billed as delivered energy, because none is ever delivered. The reason the reactive component matters at all, despite consuming nothing net, is that the WIRES cannot tell the difference between working current and wattless current — they carry the full current either way and heat by I-squared-R on all of it — so a large Q, even though it represents zero net energy use, still demands wires, transformers, and generators sized to carry it.',
  ARRAY[
    'what is reactive power actually doing',
    'is reactive power wasted energy',
    'why is reactive power measured in var and not watts',
    'does reactive power ever get used up',
    'why do the wires care about power that isnt even real'
  ],
  'pending_review'
),
-- ─── STATE_8 kva_vs_kw_rating deep-dive ────────────────────────────────
(
  'kva_vs_kw_rating',
  'ac_power_factor',
  'STATE_8',
  'Why does equipment get rated in kVA instead of just kW?',
  'Student has seen the S = V_rms * I_rms apparent-power chip throughout the concept but has not yet connected it to the everyday nameplate rating on a compressor, generator, or UPS, and wonders why kVA appears at all when kW is what the customer actually cares about. A generator, transformer, or set of supply wires must be sized to survive the FULL current a load draws, regardless of that load''s power factor — because I-squared-R heating in the wires and the magnetic saturation limits of a transformer core depend on current magnitude alone, not on how much of that current is doing useful work. This is exactly why equipment is rated in kVA (or the S = V_rms * I_rms quantity this sim builds): it is the honest ceiling the supply infrastructure must be built to withstand. The kW rating, by contrast, tells you what the machine actually accomplishes. A large industrial motor with a poor power factor might draw far more kVA than its kW output would suggest — which is precisely why utilities penalize large consumers for a poor power factor: the grid must still build and maintain infrastructure sized for the larger kVA number, even though it only bills for the smaller kW number actually delivered.',
  ARRAY[
    'why does my equipment get rated in kva not kw',
    'whats the difference between kva and kw on a nameplate',
    'why would a machine need a bigger kva rating than its kw rating',
    'why not just rate everything in kw and skip kva',
    'how do i know how much real power a kva rating gives me'
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
