-- supabase_2026-07-24_seed_displacement_current_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for displacement_current.json —
-- the field_3d 'displacement_current' scenario (Class 12 Ch.8 §8.2, the chapter's
-- load-bearing opener). A changing electric flux acts as a current — Maxwell's
-- displacement current, I_d = ε₀ dΦ_E/dt — which repairs the two-surface
-- contradiction Ampère's law hits at a charging capacitor and completes the
-- law as ∮B·dl = μ₀(I_c + I_d).
--
-- Authored 2026-07-24 by alex:json_author per architect skeleton §6 +
-- physics_author drill-down trigger phrases (verbatim, physics block §8).
--
-- Migration is AUTHORED, NOT APPLIED — quality_auditor's pre-run step
-- applies it (json_author is forbidden from apply_migration). Drill-down
-- itself is DEFERRED (Rule 18, 2026-06-10 directive) — the
-- confusion_cluster_registry Gate-8 probe is N/A-DORMANT this phase per the
-- documented false-FAIL scar (memory: auditor-cluster-registry-false-fail).
-- Do not let the auditor re-route json_author to "fix" this.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real student-voice phrasings (lowercase,
-- idiomatic, no textbook prose), verbatim from the physics block §8.
-- status='pending_review' per the current cluster-registry convention.
--
-- has_prebuilt_deep_dive states + clusters (architect skeleton §5, physics block §8):
--   STATE_4 — the surface-freedom abstraction ("why are you allowed to pick a
--             different surface?") — why_any_surface_works, flat_vs_balloon_surface,
--             what_counts_as_enclosed
--   STATE_6 — the core insight (PRIMARY aha) and the ontology trap ("is
--             displacement current REAL?") — is_displacement_current_real,
--             current_without_moving_charge, why_gap_current_equals_wire_current
--   STATE_8 — the mathematical step (Gauss → rates) where board/JEE students
--             fumble signs, ε₀ placement, and units — gauss_gives_q_equals_epsilon0_phi,
--             units_of_epsilon0_dphi_dt, steady_state_kills_id

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_4 why_any_surface_works deep-dive ───────────────────────────
(
  'why_any_surface_works',
  'displacement_current',
  'STATE_4',
  'Why can you pick any surface — how is the surface not fixed by the loop?',
  'Student assumes a loop uniquely determines "the" surface it bounds, the way a fence uniquely determines "the" field it encloses. It doesn''t: infinitely many surfaces share the same boundary loop — a flat disk, a bulging balloon, a wildly crumpled sheet — and Ampère''s law (in its original form) is only guaranteed to give the same I_enc for all of them if the SAME current threads every one. For a charging capacitor it doesn''t: the flat disk is pierced by the wire, the bulged surface is not. The sim makes the freedom concrete: STATE_3 builds the loop and picks the flat disk as "one CHOICE of surface" — language chosen deliberately — and STATE_4 shows the identical loop with its curl arrows sitting completely unchanged while the surface itself morphs into a balloon. The loop is what the law actually cares about; the surface choice was always free, and Ampère''s original law simply never anticipated a case where that freedom mattered.',
  ARRAY[
    'why can you pick any surface',
    'how is the surface not fixed',
    'why does the loop matter and not the shape',
    'cant you just pick the surface that works',
    'why is choosing a different surface even allowed'
  ],
  'pending_review'
),
-- ─── STATE_4 flat_vs_balloon_surface deep-dive ─────────────────────────
(
  'flat_vs_balloon_surface',
  'displacement_current',
  'STATE_4',
  'Why does a balloon surface count as valid — isn''t the flat disk the only real surface?',
  'Student treats the flat disk as somehow "more real" than the bulged balloon because it looks like the natural, minimal-area choice — the one you''d draw without thinking. Geometrically neither is privileged: a surface bounded by a loop is any continuous sheet whose edge is exactly that loop, and the bulged balloon slipping between the capacitor plates satisfies that definition just as legitimately as the flat disk does. The sim shows the balloon as a continuous deformation of the SAME disk (STATE_4''s morph, s: 0→1), never swapped in as a separate object — it visibly stays attached to the identical loop edge throughout, which is exactly what "still bounded by the same ring" means. The two surfaces disagree on I_enc not because one is fake, but because Ampère''s original law was never built to handle a case where a loop''s bounded surfaces could disagree.',
  ARRAY[
    'why does a balloon surface count as valid',
    'is the bulged surface still touching the same loop',
    'why does the shape of the surface change the answer',
    'isnt the flat disk the only real surface',
    'how can a stretched surface still be bounded by the same ring'
  ],
  'pending_review'
),
-- ─── STATE_4 what_counts_as_enclosed deep-dive ─────────────────────────
(
  'what_counts_as_enclosed',
  'displacement_current',
  'STATE_4',
  'What does "enclosed current" even mean here — why does the same wire count in one case and not the other?',
  'Student expects "enclosed" to be a fixed, loop-only property — like "inside the fence" — rather than a property of which SURFACE you''ve chosen to bound the loop. Ampère''s law actually asks a narrower question: how much current PIERCES this particular surface, not this particular loop. The wire threads straight through the flat disk (STATE_3''s piercing flashes), so it counts there; the same wire runs completely outside the bulged balloon''s footprint (the balloon slips between the plates, missing the wire entirely), so it doesn''t count there — same wire, same loop, different surface, different piercing. Nothing about the wire changed; only which sheet it happened to cross changed. This is precisely the gap the displacement current fills: once I_d is included, EVERY valid surface — pierced by the wire or not — gives the identical total.',
  ARRAY[
    'what does enclosed current even mean here',
    'why does the wire not count as enclosed anymore',
    'does enclosed mean touching or something else',
    'why does the same wire count in one case and not the other',
    'what changes about what is inside the loop'
  ],
  'pending_review'
),
-- ─── STATE_6 is_displacement_current_real deep-dive ────────────────────
(
  'is_displacement_current_real',
  'displacement_current',
  'STATE_6',
  'Is displacement current an actual current, or just a math trick to patch the formula?',
  'Student suspects I_d was invented purely to make an equation balance — a fudge factor with no independent physical footing. It isn''t: STATE_5 already showed the magnetic field is MEASURABLY present in the gap (the probe reads 2.4 μT, identical to beside the wire) using no formula at all — that reading is an experimental fact, not an algebra trick. What STATE_6 supplies is the explanation FOR that already-observed fact: a changing electric flux produces the exact same magnetic effect an equal conduction current would. "Real" here means "produces a real, measurable magnetic field" — and on that test, displacement current passes exactly as a conduction current does. It is real in its effect, even though (unlike a conduction current) no charge is physically moving to produce it.',
  ARRAY[
    'is displacement current an actual current',
    'is I_d a made up thing or a real current',
    'does displacement current really exist',
    'is this just a math trick or is it physical',
    'why call it current if nothing is moving'
  ],
  'pending_review'
),
-- ─── STATE_6 current_without_moving_charge deep-dive ───────────────────
(
  'current_without_moving_charge',
  'displacement_current',
  'STATE_6',
  'How can there be a current with no charge moving — what''s actually flowing in the gap?',
  'Student''s whole prior notion of "current" is charge in motion, so a current with zero moving charge sounds like a contradiction in terms rather than a generalization of the word. Nothing is flowing in the gap — the ghost column glows there but stays visibly bead-free throughout STATE_6, in both the throttle-on and throttle-off phases. What IS happening is that the electric flux Φ_E through that same region is changing at a rate that, multiplied by ε₀, numerically equals I_c. Maxwell''s move was to recognize that Ampère''s law only ever cared about magnetic circulation, and a changing flux produces exactly the SAME circulation a conduction current would — so for the purposes of "what generates B," treating dΦ_E/dt as if it were a current is not a metaphor, it is functionally identical. The answer to "what''s flowing" is: nothing — the flux itself is changing, and that change alone does the job current normally does.',
  ARRAY[
    'how can there be current with no charge moving',
    'if nothing crosses the gap how is there current',
    'whats actually flowing in the gap',
    'how do you get current without any charge carriers',
    'is the field itself the current somehow'
  ],
  'pending_review'
),
-- ─── STATE_6 why_gap_current_equals_wire_current deep-dive ─────────────
(
  'why_gap_current_equals_wire_current',
  'displacement_current',
  'STATE_6',
  'Why is the gap current exactly equal to the wire current — is that a coincidence?',
  'Student sees I_d = I_c holding exactly, every time, and suspects the sim (or the formula) is simply forcing the two readouts to match rather than the equality being a genuine physical necessity. It is not a coincidence — it follows directly from charge conservation. Every coulomb the wire delivers to a plate (dQ/dt = I_c, by definition of the conduction current) shows up instantly as the SAME rate of increase in the flux through the gap (since Φ_E = Q/ε₀), because that charge has nowhere else to go but onto the plate face. Chase the chain in STATE_8: I_c = dQ/dt = ε₀ dΦ_E/dt = I_d, an unbroken equality, not two separately-measured numbers that happen to agree. Turn the throttle off and both die together in the SAME instant (STATE_6''s throttle-off beat) precisely because they were never two different quantities — they are the same physical fact, described two ways: charge arriving at the plate, and flux rising in the gap.',
  ARRAY[
    'why is the gap current exactly equal to the wire current',
    'how do they always match up',
    'is it a coincidence that I_d equals I_c',
    'why cant the gap current be different from the wire',
    'why does the number always come out the same as I_c'
  ],
  'pending_review'
),
-- ─── STATE_8 gauss_gives_q_equals_epsilon0_phi deep-dive ───────────────
(
  'gauss_gives_q_equals_epsilon0_phi',
  'displacement_current',
  'STATE_8',
  'Where does Q = ε₀Φ_E come from — how do you get charge from flux?',
  'Student has met Φ_E = Q/ε₀ as an isolated formula to plug numbers into, without the underlying picture that flux literally COUNTS how much field a charge produces through a surface — so rearranging it to solve for Q feels like an arbitrary algebra move rather than a meaningful physical statement. It is exactly Gauss''s law applied to the one-plate surface already familiar from electric_flux and gauss_law: the flux through a closed surface around one plate''s charge is Φ_E = Q/ε₀ by definition of how Gauss''s law counts field lines per unit charge. Rearranging to Q = ε₀Φ_E is not a new fact — it is the SAME equation read the other direction, isolating the charge that produced a given amount of flux. STATE_8''s first link (sentence 2) glows the dot pool precisely because Q is a property of the CHARGE sitting there, and the flux is what that charge is doing to the field around it.',
  ARRAY[
    'where does Q equals epsilon naught phi come from',
    'how do you get charge from flux',
    'why is Gauss law used here',
    'why does flux relate to charge like that',
    'where does the epsilon naught come from in that step'
  ],
  'pending_review'
),
-- ─── STATE_8 units_of_epsilon0_dphi_dt deep-dive ───────────────────────
(
  'units_of_epsilon0_dphi_dt',
  'displacement_current',
  'STATE_8',
  'Why does ε₀ times dΦ_E/dt give amperes — how do the units actually work out?',
  'Student can follow the algebra step-by-step but doesn''t trust that the final answer is genuinely in amperes rather than some leftover mess of volts and metres. Track it explicitly: Φ_E carries units of V·m (volts times metres — field strength times area, since E is in V/m and area is in m²), so dΦ_E/dt carries V·m/s. Multiplying by ε₀, whose units are C²/(N·m²) — or equivalently, and more usefully here, C/(V·m) — cancels the V·m in the numerator against the V·m in ε₀''s denominator, leaving C/s, which is exactly the ampere. STATE_8''s numeric closure (8.854×10⁻¹² × 1.36×10¹¹ ≈ 1.2 A) is that unit cancellation made concrete: the same arithmetic that makes the NUMBER come out to 1.2 also makes the UNIT come out to amperes, because ε₀ was built, dimensionally, to convert a flux rate into exactly that.',
  ARRAY[
    'why does epsilon naught times dphi by dt give amperes',
    'how do the units work out to current',
    'what are the units of dphi by dt actually',
    'why does multiplying by epsilon naught fix the units',
    'how does V·m per second turn into amps'
  ],
  'pending_review'
),
-- ─── STATE_8 steady_state_kills_id deep-dive ───────────────────────────
(
  'steady_state_kills_id',
  'displacement_current',
  'STATE_8',
  'Why does displacement current stop once the capacitor is fully charged?',
  'Student has just learned I_d = ε₀ dΦ_E/dt as a formula and doesn''t yet see why a FULLY charged, steady-state capacitor should give zero rather than some leftover nonzero value. The formula answers it directly: I_d depends entirely on the RATE of change of the flux, dΦ_E/dt — not on the flux''s value. Once charging finishes, Q (and therefore Φ_E) sits at a fixed, unchanging number; a constant quantity has a rate of change of exactly zero, so I_d = ε₀ × 0 = 0, no matter how large Φ_E itself is. This is the same fact STATE_6''s throttle-off beat dramatizes physically: the gap readout dies to zero the INSTANT charging stops, even though Q, E, and Φ_E all stay frozen at their fully-charged values (not zero) — displacement current cares only about change, never about the standing amount.',
  ARRAY[
    'why does displacement current stop once the capacitor is full',
    'why is I_d zero when charging is done',
    'if the flux is not changing why is there no I_d',
    'why does a fully charged capacitor have no displacement current',
    'does I_d only exist while charging is happening'
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
