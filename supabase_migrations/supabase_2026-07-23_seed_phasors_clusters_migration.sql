-- supabase_2026-07-23_seed_phasors_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for phasors.json —
-- the NEW field_3d 'ac_phasor' scenario (Class 12 Ch.7 §7.5 Representation
-- of AC Current and Voltage by Rotating Vectors — Phasors), the fourth
-- concept of the Ch.7 Alternating Current map. Engine build for the
-- 'ac_phasor' scenario is PENDING as of this authoring pass (Class-B
-- triage per the architect skeleton section 0b) — this migration is
-- authored ahead of the engine delta, matching the concept JSON.
--
-- Authored 2026-07-23 by alex:json_author per architect skeleton section 6
-- + physics_author drill-down trigger phrases (verbatim, physics block
-- section 7).
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
-- idiomatic, no textbook prose), verbatim from the physics block section 7.
-- status='pending_review' per the current cluster-registry convention.
--
-- has_prebuilt_deep_dive states + clusters (architect skeleton section 5):
--   STATE_1 — the circle<->sine projection abstraction (students who cannot see
--             it never recover the concept) —
--             circle_to_sine_projection, what_actually_rotates_phasor, one_turn_one_cycle
--   STATE_4 — the PRIMARY aha + the angle<->time conversion (students who accept
--             the picture still can't USE it) —
--             angle_vs_time_delay_conversion, frozen_diagram_still_shows_lag, why_angle_never_changes
--   STATE_6 — the exam skill (reading lead/lag off a printed frozen diagram +
--             the rotation-direction convention) —
--             which_phasor_leads_on_diagram, rotation_direction_convention_ccw, arrow_length_across_units_trap

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_1 circle_to_sine_projection deep-dive ───────────────────────
(
  'circle_to_sine_projection',
  'phasors',
  'STATE_1',
  'How does a rotating circle turn into a sine wave?',
  'Student can watch the arrow spin and the shadow draw a wave but cannot connect WHY a circle''s edge-on view is exactly a sine curve. The bridge is the vertical component of uniform circular motion: if an arrow of length vₘ rotates at a steady angular speed ω, its tip traces a perfect circle, but its VERTICAL height above the centre at any instant is vₘ·sin(θ), where θ = ωt grows steadily with time. Plot that height against time (not against the horizontal position) and the result is, by definition, a sine curve — the circle was never "turned into" a wave, the wave WAS always the circle''s vertical shadow, viewed edge-on. The sim''s tie-line makes this concrete: it is a literal horizontal ruler carrying the arrow tip''s height straight across to the scope pen, at every instant, with nothing hidden in between.',
  ARRAY[
    'how does a circle turn into a wave',
    'why does spinning make a sine curve',
    'im not seeing how the shadow becomes the graph',
    'why is the wave secretly a circle',
    'how do you get a smooth wave out of something going round and round'
  ],
  'pending_review'
),
-- ─── STATE_1 what_actually_rotates_phasor deep-dive ────────────────────
(
  'what_actually_rotates_phasor',
  'phasors',
  'STATE_1',
  'What is actually spinning in the circuit — is the phasor a real physical thing?',
  'Student sees a spinning arrow drawn right beside the circuit and reasonably wonders whether something inside the wires is physically rotating — a belief this concept explicitly confronts one state later (S2''s pivot). The honest answer here: nothing in the circuit spins. The phasor is a BOOKKEEPING device — a drawn arrow whose length equals the amplitude (vₘ) and whose rotation angle (ωt) is a clock the diagram keeps for you, entirely separate from the real physical wire, source and beads, which do exactly what they have done all chapter (straight-line oscillation, never circular). The disc pane is a second, abstract picture living alongside the real apparatus, not a zoomed-in view of some hidden spinning part.',
  ARRAY[
    'what is actually spinning in the circuit',
    'is something physically rotating inside the wire',
    'does the phasor arrow exist for real or is it just a drawing',
    'what part of the circuit is the arrow representing',
    'is there a real spinning thing i cant see'
  ],
  'pending_review'
),
-- ─── STATE_1 one_turn_one_cycle deep-dive ──────────────────────────────
(
  'one_turn_one_cycle',
  'phasors',
  'STATE_1',
  'Why does exactly one full spin of the arrow equal one full cycle of the wave?',
  'Student can accept that spinning produces a wave in general but is unsure why the correspondence is exactly one-to-one — one revolution, one period — rather than some other ratio. The reason is definitional: a sine wave''s period T is, by definition, the shortest time after which sin(θ) repeats its entire pattern of values, and sin(θ) repeats exactly when θ has advanced by a full 2π radians (360°) — no more, no less, because sine is periodic with period 2π and nothing shorter. Since the phasor''s angle θ = ωt advances at a constant rate, the arrow must complete exactly one full revolution (360°) for θ to advance by 2π, which is precisely the condition for the shadow to complete one full wave cycle — the "one turn = one cycle" rule is not a coincidence of this particular circuit, it is what "sine wave" and "uniform rotation" mean, matched up.',
  ARRAY[
    'why does one spin equal one wave cycle',
    'how is a full circle the same as one period',
    'does the arrow have to go exactly once around for one cycle',
    'why not half a turn for one cycle',
    'whats the connection between degrees of spin and seconds of time'
  ],
  'pending_review'
),
-- ─── STATE_4 angle_vs_time_delay_conversion deep-dive ──────────────────
(
  'angle_vs_time_delay_conversion',
  'phasors',
  'STATE_4',
  'How do I actually turn a phase angle (like ninety degrees) into a time delay in seconds?',
  'Student can read the ninety-degree gap on the diagram but has no reliable procedure to convert it into "how many seconds late." The conversion is a straight proportion: a full 360° of phasor rotation corresponds to exactly one period T (the time for one complete AC cycle), so any smaller angle φ corresponds to the SAME fraction of T — Δt = (φ/360°)·T. At this chapter''s demo settings (T = 4.0 s), a 90° gap is exactly a quarter of 4.0 s, i.e. 1.0 second — which is precisely the "one second of lateness" the coil lesson measured directly from its traces. The angle and the time delay are two descriptions of the SAME physical gap; the formula is just the unit conversion between them, and it works identically for any angle, not only 90°.',
  ARRAY[
    'how do i turn ninety degrees into seconds',
    'why does an angle even represent a time delay',
    'is ninety degrees always one second or does that change',
    'how do degrees and seconds connect on this diagram',
    'why is a quarter turn the same as a quarter cycle'
  ],
  'pending_review'
),
-- ─── STATE_4 frozen_diagram_still_shows_lag deep-dive ──────────────────
(
  'frozen_diagram_still_shows_lag',
  'phasors',
  'STATE_4',
  'If the diagram is frozen — not moving — how can it still show that one quantity is late relative to another?',
  'Student has spent three lessons reading lag and lead directly off MOVING traces rolling across a scope, so a single still picture feels like it should have lost that information the instant it stopped moving. It has not, because the lag/lead fact was never actually about the traces moving — it is about the CONSTANT angular gap between two arrows that share one rotation rate. That gap is present at every single instant of the rotation, including the instant the picture was frozen; freezing the diagram does not erase the angle, it just stops showing you that the SAME angle would still be there a moment later. A frozen phasor diagram is less like a paused video (which genuinely loses the sense of "what happens next") and more like a photograph of two rigidly welded gears — the photo alone proves their fixed relative position, no motion required.',
  ARRAY[
    'how can a still picture show something that happens over time',
    'if its frozen how do i know theres a delay at all',
    'doesnt a snapshot lose the timing information',
    'how does one frame carry a whole cycle of lag',
    'why does a paused picture still tell me who is late'
  ],
  'pending_review'
),
-- ─── STATE_4 why_angle_never_changes deep-dive ─────────────────────────
(
  'why_angle_never_changes',
  'phasors',
  'STATE_4',
  'Why does the angle between the two arrows never open or close as time goes on?',
  'Student is applying an entirely reasonable default expectation from everyday moving objects — that the gap between two things in motion usually changes over time — to a system where it provably cannot. Both arrows are driven by the SAME angular speed ω (one shared clock, S3''s own teaching): the voltage arrow''s angle is θᵥ(t) = ωt and the current arrow''s angle is θᵢ(t) = ωt + φ, where φ (the phase offset, fixed by which element — R, L, or C — is in the circuit) does not depend on t at all. Subtract the two angles and every ωt term cancels exactly, leaving θᵢ(t) − θᵥ(t) = φ, a pure constant, for every value of t. The angle cannot open or close for the same reason two spokes welded onto one spinning wheel can never drift apart — they are forced to share the exact same rotation, differing only by a fixed offset baked in at the start.',
  ARRAY[
    'why doesnt the angle between the arrows ever move',
    'shouldnt the lag angle change as time goes on',
    'why is the gap between the arrows always the same',
    'does the angle ever open or close over time',
    'why is this angle constant when everything else in ac keeps changing'
  ],
  'pending_review'
),
-- ─── STATE_6 which_phasor_leads_on_diagram deep-dive ───────────────────
(
  'which_phasor_leads_on_diagram',
  'phasors',
  'STATE_6',
  'Looking at a printed phasor diagram, how do I tell which arrow is leading just from the picture?',
  'Student has the rotation-order rule in principle but freezes when handed a static, printed diagram with no visible motion to watch. The rule reduces to a purely geometric read: with rotation taken counterclockwise (the universal convention), pick a fixed reference direction (traditionally "up," the vertical peak line) and ask which arrow is CLOSER to that direction going counterclockwise from the reference — equivalently, which arrow would reach that direction FIRST if the whole diagram started spinning right now. That arrow leads; the other lags. On this chapter''s diagrams specifically: the resistor''s current arrow sits exactly on top of the voltage arrow (0°, neither leads); the inductor''s current arrow sits a quarter turn clockwise from voltage (it must catch up, so it lags); the capacitor''s sits a quarter turn counterclockwise from voltage (it is already ahead, so it leads) — no animation needed, only the fixed geometric relationship between the two arrows.',
  ARRAY[
    'how do i tell which arrow is ahead just by looking',
    'on a printed diagram how do i know which one leads',
    'which arrow do i look at first to find the lead',
    'how can i read lead or lag off a still picture',
    'whats the trick for spotting the leading phasor'
  ],
  'pending_review'
),
-- ─── STATE_6 rotation_direction_convention_ccw deep-dive ───────────────
(
  'rotation_direction_convention_ccw',
  'phasors',
  'STATE_6',
  'Does the direction the arrows spin (clockwise vs counterclockwise) actually matter, or is it just an arbitrary drawing choice?',
  'Student suspects the whole reading convention (ahead-in-rotation-means-leads) might quietly depend on an arbitrary choice of spin direction that could just as easily be flipped without changing anything real. The physics itself — the actual instantaneous values of v(t) and i(t), and which one is genuinely ahead in time — does not care how you choose to draw it; that physical fact is fixed. What IS a convention is which rotation direction (clockwise or counterclockwise) a textbook or this sim CHOOSES to associate with increasing time, and NCERT (like this sim) fixes that choice as counterclockwise, universally, on every diagram. Once that single convention is fixed and used consistently, the reading rule ("ahead in the chosen rotation direction = leads in time") becomes fully reliable — the convention itself is arbitrary in the sense that clockwise COULD have been chosen instead, but it is NOT arbitrary in the sense that, having been fixed, it must be applied the same way on every diagram or the reading breaks.',
  ARRAY[
    'why does the arrow spin counterclockwise and not the other way',
    'does the spin direction actually matter',
    'what if i imagined it spinning clockwise instead',
    'is counterclockwise just a convention or is it physically required',
    'would the diagram mean something different if it spun the other way'
  ],
  'pending_review'
),
-- ─── STATE_6 arrow_length_across_units_trap deep-dive ──────────────────
(
  'arrow_length_across_units_trap',
  'phasors',
  'STATE_6',
  'Can I compare the length of the voltage arrow to the length of the current arrow — is the shorter one somehow weaker?',
  'Student sees two arrows of visibly different length sharing one diagram (vₘ = 10.0 V drawn long, iₘ = 2.00 A drawn short) and reaches for the natural visual instinct that longer must mean "bigger" or "stronger" in some universal sense, forgetting the two arrows are not measured on the same scale at all. A voltage arrow''s length is drawn in volts, on a scale chosen for the voltage axis; a current arrow''s length is drawn in amperes, on an entirely independent scale chosen for the current axis — the two lengths are two different rulers laid on the same picture, and there is no physically meaningful way to compare 10.0 (volts) to 2.00 (amperes) as raw numbers, any more than you could meaningfully compare "10 kilometres" to "2 kilograms." The ONLY information a phasor diagram''s cross-arrow comparison carries reliably is the ANGLE between the arrows (the phase relationship) — never their relative lengths, which is exactly why this sim gives the two arrows visibly distinct arrowhead styles as a standing reminder.',
  ARRAY[
    'can i compare the length of the voltage arrow to the current arrow',
    'why cant i say the current arrow is smaller so its weaker',
    'do the two arrow lengths mean anything when compared to each other',
    'is a ten unit arrow bigger than a two unit arrow in any real sense',
    'why do volts and amps arrows use different scales'
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
