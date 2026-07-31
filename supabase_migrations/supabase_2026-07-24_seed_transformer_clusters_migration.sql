-- supabase_2026-07-24_seed_transformer_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for transformer.json —
-- the NEW field_3d 'transformer' scenario (Class 12 Ch.7 §7.9 Transformers),
-- the EIGHTH and LAST concept of the Ch.7 Alternating Current map. The
-- chapter CLOSES with this concept.
--
-- Class-B triage: engine build for the 'transformer' scenario is dispatched
-- SEPARATELY from this authoring pass (peter_parker:renderer_primitives
-- scope) — this migration seeds the drill-down cluster registry only and
-- does not depend on the renderer being live.
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
--   STATE_3 — PIVOT #2 (the DC-dead null result): the concept's second
--             confronted misconception + its densest documented confusion
--             ("why doesn't DC work", "what was that one blip at switch-on",
--             "then how do phone chargers work on DC electronics") —
--             why_transformer_needs_ac, dc_switch_on_blip_explained,
--             steady_flux_zero_emf
--   STATE_5 — the turns-ratio mathematics (the exam-heaviest numerical site:
--             identify step-up/down, compute Vs, volts-per-turn design
--             thinking) — turns_ratio_numericals, step_up_vs_step_down_identify,
--             volts_per_turn_design
--   STATE_6 — PRIMARY aha (the power-conservation crux): compute Ip, why the
--             primary current rises with load, the free-energy error in
--             every form — power_conservation_current_inverse,
--             step_up_free_energy_error, primary_current_feels_the_load
-- Divergence from the misconception pivots documented in the skeleton:
-- pivots sit at STATE_6 (PRIMARY) / STATE_3 (second), investment goes
-- STATE_3/STATE_5/STATE_6 — STATE_5 is where the turns-ratio algebra sticks
-- even after both pivots land (the exam-heaviest numerical site).

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 why_transformer_needs_ac deep-dive ─────────────────────────
(
  'why_transformer_needs_ac',
  'transformer',
  'STATE_3',
  'Why doesn''t a transformer work on a regular battery?',
  'Student watched the DC throw give one blip and then the secondary go permanently dark, and wants the plain-English reason a transformer refuses to work on a battery when it happily works on the mains. A transformer''s ONLY mechanism is Faraday''s law: a CHANGING magnetic flux threading a loop induces an EMF in it — the induced voltage is proportional to dPhi/dt, the rate of change, not to Phi itself. An AC source keeps making the flux rise, fall, and reverse every cycle, so dPhi/dt is never zero — the secondary gets a continuous, repeating kick. A steady battery, once its transient (the moment of connection) has passed, drives a CONSTANT current, which makes a CONSTANT flux — large, real, and genuinely present in the core, but with dPhi/dt = 0 exactly. Zero rate of change means zero induced EMF, however big the steady flux is. This is not a design flaw or a weak transformer — it is the literal mathematics of Faraday''s law: only CHANGE crosses the gap between the two windings, and a battery, after its first instant, offers none.',
  ARRAY[
    'why doesnt a transformer work on a regular battery',
    'why does the secondary need the flux to keep changing',
    'cant a strong steady current do the same job as ac',
    'why does the current have to keep switching direction for it to work',
    'whats special about ac that dc just cant give you here'
  ],
  'pending_review'
),
-- ─── STATE_3 dc_switch_on_blip_explained deep-dive ──────────────────────
(
  'dc_switch_on_blip_explained',
  'transformer',
  'STATE_3',
  'Why did the needle jump for just a second when the battery got connected — and does that mean DC sort of works?',
  'Student saw the secondary needle kick once and the lamp flash once at the exact instant the battery was thrown into the circuit, and wonders whether that flash is a mistake, a coincidence, or actual (if brief) proof that DC can work in a transformer after all. It is real physics, not a glitch or a partial success: at the very instant the switch closes, the flux in the core is CHANGING — it is climbing from zero (or from its old AC value) up to the new steady value the battery will eventually sustain. During that short climb, dPhi/dt is genuinely nonzero, so the secondary genuinely sees a real, if brief, induced EMF — the needle-kick and lamp-flash are honest readings of honest physics, not noise. The instant the flux FINISHES climbing and settles at its new steady value, dPhi/dt drops back to exactly zero, and the induced EMF vanishes just as completely. So the blip is not "DC working a little bit" — it is the ONE moment DC ever changes anything, immediately followed by permanent silence for as long as the current stays steady. This is exactly why real switch-mode chargers and adapters never just connect a battery to a transformer''s primary directly — they chop the DC into a rapidly-switching waveform first, deliberately manufacturing a continuous stream of these "blips" so a transformer inside has something to work on at all.',
  ARRAY[
    'why did the needle jump for just a second when the battery got connected',
    'if dc doesnt work why did the lamp flash at all',
    'was that flash a mistake or is it supposed to happen',
    'why does something happen right at the switch but then nothing after',
    'is that one flash proof that dc sort of works a tiny bit'
  ],
  'pending_review'
),
-- ─── STATE_3 steady_flux_zero_emf deep-dive ─────────────────────────────
(
  'steady_flux_zero_emf',
  'transformer',
  'STATE_3',
  'How can there be a huge flux inside the core but zero induced voltage?',
  'Student is watching the flux tubes stay visually PRESENT and full during the DC hold — a large, real magnetic flux, clearly still there — while every secondary meter reads a flat 0.00, and finds the combination counter-intuitive: shouldn''t more flux mean more induced voltage, the way it did during the AC states? The confusion conflates two genuinely different physical quantities: the flux itself (Phi, how many field lines currently thread the loop — a snapshot) and the RATE of change of that flux (dPhi/dt, how fast that count is currently changing). Faraday''s law names dPhi/dt as the ONLY thing that induces an EMF — Phi''s own size never appears in the formula on its own. A large, constant flux, sitting still cycle after cycle, has dPhi/dt = 0 by definition, exactly the same as a small, constant flux would; both induce nothing. This is the same distinction the earlier magnetic_flux concept planted (a strong field can still give zero flux depending on angle) now paying off in a new form: a strong FLUX can still give zero induced VOLTAGE, depending on whether it is changing. "Flux existing" and "flux doing something" are genuinely different claims, and only the second one crosses a transformer''s gap.',
  ARRAY[
    'how can there be a huge flux but zero voltage induced',
    'isnt more flux supposed to mean more induced voltage',
    'why does a strong flux give nothing if it just sits there',
    'whats the difference between flux existing and flux doing something',
    'why does dphi dt matter more than phi itself'
  ],
  'pending_review'
),
-- ─── STATE_5 turns_ratio_numericals deep-dive ───────────────────────────
(
  'turns_ratio_numericals',
  'transformer',
  'STATE_5',
  'What''s the actual formula for finding the secondary voltage from the turns?',
  'Student has watched the secondary visibly gain turns while Vs climbs on the meter, and accepts the qualitative story, but wants the precise numerical recipe for exam-style problems: given a primary voltage and a turns count on each side, how exactly do you compute the secondary voltage (and the reverse). The ideal transformer voltage law is a straightforward ratio, and it works in EITHER direction: Vs/Vp = Ns/Np, so Vs = Vp times (Ns/Np). At this sim''s work point, Vp = 10.0 V, Np = 100, Ns = 200, giving Vs = 10.0 times (200/100) = 10.0 times 2 = 20.0 V — exactly the measured HUD reading. The same formula rearranges to find any missing piece: if you know Vp, Vs, and one turns count, you can solve for the other (Ns = Np times Vs/Vp); if you know both turns counts and Vs, you can solve backward for Vp (Vp = Vs times Np/Ns). The ratio itself, Ns/Np or Vs/Vp, is exactly the SAME number either way you compute it — that consistency check (does Ns/Np come out equal to Vs/Vp) is a fast way to catch an arithmetic slip in an exam.',
  ARRAY[
    'how do you find the secondary voltage if you know the turns and the primary voltage',
    'whats the actual ratio you multiply by to get the new voltage',
    'how many turns do i need if i want to double the voltage',
    'does the turns ratio work the same way for stepping down',
    'how do i figure out which winding has more turns just from the voltages'
  ],
  'pending_review'
),
-- ─── STATE_5 step_up_vs_step_down_identify deep-dive ────────────────────
(
  'step_up_vs_step_down_identify',
  'transformer',
  'STATE_5',
  'How do you tell whether a transformer is step-up or step-down just from a diagram?',
  'Student can compute the ratio once told the turns counts, but wants a fast, reliable rule for LOOKING at a diagram or a word problem and immediately naming which side is "up" and which is "down" — a common exam first-step before any arithmetic. The rule is a direct read of the turns counts alone, nothing else: whichever winding has MORE turns has the LARGER voltage. If the secondary has more turns than the primary (Ns > Np, as in this sim''s 200-versus-100 work point), the device is STEP-UP — it raises voltage from primary to secondary. If the secondary has FEWER turns (Ns < Np), it is STEP-DOWN. This is symmetric in a genuinely useful way: the SAME physical transformer, if you simply reverse which side you call "in" and which you call "out" (feed it from what was previously its secondary), flips roles — a step-up transformer run backward becomes a step-down transformer, and vice versa, since the ratio Vs/Vp = Ns/Np doesn''t care which winding you label input versus output, only which one has more turns than the other.',
  ARRAY[
    'how do you tell if a transformer is step up or step down just by looking',
    'is more turns on the secondary always step up',
    'what tells you which side is which in a diagram',
    'can the same transformer be step up one way and step down the other way',
    'why does winding fewer turns lower the voltage instead of raising it'
  ],
  'pending_review'
),
-- ─── STATE_5 volts_per_turn_design deep-dive ────────────────────────────
(
  'volts_per_turn_design',
  'transformer',
  'STATE_5',
  'Why does each turn only contribute a tiny slice of the total voltage, and how do engineers use that?',
  'Student watched STATE_4''s tick cascade fill a bar 0.100 V at a time and wants to understand what "volts per turn" physically means and why it stays fixed at 0.100 V/turn on BOTH windings even after STATE_5''s ramp changes the secondary''s total voltage. Every turn on either winding embraces the exact SAME changing flux (they share one closed core), so every single turn — on either side — picks up the exact same tiny EMF share: per_turn = Vp/Np = Vs/Ns, verified identical (0.100 V/turn) at both the ratio-1 and ratio-2 work points in this sim. This per-turn value is set entirely by the flux''s own rate of change (which depends on Vp, Np, and the frequency alone) — it is NOT something that changes when you add more turns to the secondary; adding turns just means MORE of these identical 0.100 V slices stack in series, which is exactly why Vs scales linearly with Ns. Real transformer engineers use this fact directly: to hit a target output voltage, they don''t guess — they compute the volts-per-turn from the core and frequency, then simply wind however many turns are needed to reach the target voltage, turn by turn, exactly like this sim''s own tick cascade.',
  ARRAY[
    'why does each turn only give a tiny bit of voltage',
    'how do engineers decide how many turns to wind',
    'does a thicker wire mean more volts per turn',
    'why is the volts per turn the same on both sides',
    'if i want more voltage do i just add more turns forever'
  ],
  'pending_review'
),
-- ─── STATE_6 power_conservation_current_inverse deep-dive ───────────────
(
  'power_conservation_current_inverse',
  'transformer',
  'STATE_6',
  'Why does the primary current rise or fall automatically to match whatever the secondary needs?',
  'Student has watched Ip visibly track changes on the secondary side (it doubled from 0.40 to 1.60 A as the ratio moved from 1 to 2) with no wire directly connecting the two currents, and wants to understand the actual mechanism that makes the primary "know" how much current to draw. Nothing external is controlling the primary current, and there is no separate feedback signal — it is a direct, automatic consequence of the SAME shared flux that links the two windings. When the secondary draws more current (say, because a bigger load was connected), that secondary current makes its OWN small opposing flux (by Lenz''s law) that would otherwise partially cancel the core''s flux. But the primary is being driven by a fixed AC voltage source, which insists on maintaining the SAME v_p = N_p dPhi/dt regardless — so to keep the total flux exactly what the source demands, the primary AUTOMATICALLY draws more current itself, exactly enough to cancel the secondary''s opposing effect and restore the flux. This self-correcting loop is instantaneous and needs no controller: it is built into Faraday''s law and Lenz''s law operating together on the one shared core, and it is precisely why VpIp = VsIs holds at every instant, not just as an average.',
  ARRAY[
    'why does the current drop when the voltage goes up',
    'shouldnt more voltage just mean more power for free',
    'how does the primary know to send less current when the secondary needs less',
    'why cant you get more power out than you put in',
    'does the primary current change automatically or does someone control it'
  ],
  'pending_review'
),
-- ─── STATE_6 step_up_free_energy_error deep-dive ────────────────────────
(
  'step_up_free_energy_error',
  'transformer',
  'STATE_6',
  'If the voltage doubled, why isn''t the power doubled too — where would the extra energy even come from?',
  'Student watched the secondary voltage climb from 10.0 V to 20.0 V during the turns ramp and the lamp visibly brighten, and — precisely because that FEELS like getting more for nothing — wants a rigorous account of why the power delivered does NOT double along with the voltage, and where a naive "more voltage equals more energy" instinct actually goes wrong. Power is never just voltage alone — it is voltage TIMES current, P = V times I. When voltage doubles (Vs = 2*Vp here), the current on that SAME side does not stay fixed; because power must balance across the ideal core (VpIp = VsIs, a direct consequence of energy conservation applied to Faraday''s law — nothing else is available to store or release that energy inside the device), the current on the higher-voltage side must fall by exactly the same factor the voltage rose: Is = Ip/2 in this sim''s case, Iₚ = 1.60 A halving to Iₛ = 0.80 A. The product Vs times Is (20.0 times 0.80 = 16.0 W) lands exactly where Vp times Ip (10.0 times 1.60 = 16.0 W) started — unchanged. There genuinely is no "extra energy" anywhere to explain, because none was created: the lamp brightens because ITS resistance sees a higher voltage and draws current accordingly, not because the transformer manufactured any additional watts. A transformer is a currency exchange, not a mint.',
  ARRAY[
    'if the voltage doubled why isnt the power doubled too',
    'where would the extra energy even come from if it did double',
    'isnt a step up transformer basically making free electricity',
    'why does a brighter lamp not mean youre getting something for nothing',
    'whats actually being traded when the voltage goes up'
  ],
  'pending_review'
),
-- ─── STATE_6 primary_current_feels_the_load deep-dive ───────────────────
(
  'primary_current_feels_the_load',
  'transformer',
  'STATE_6',
  'How does the primary current know anything about what resistor is connected on the secondary side, with no wire between them?',
  'Student wants to understand the causal chain by which changing R_load — a component that lives entirely on the secondary''s own, electrically separate loop — ends up changing the current the primary draws from its own separate supply, given that the two circuits share nothing but a magnetic flux. The chain runs entirely through the shared flux, in three honest physical steps. First: a smaller R_load lets a bigger secondary current Is = Vs/R_load flow, for the SAME secondary voltage (which the turns ratio fixes independently of the load). Second: that bigger secondary current makes a bigger opposing flux of its own (Lenz''s law) inside the shared core. Third: because the primary''s AC source insists on maintaining a fixed total flux (v_p = N_p dPhi/dt is set by the source voltage and frequency alone), the primary must draw more current to cancel that bigger opposition and keep the flux where the source demands it. So the primary current is not psychic and needs no wire to "know" about the load — it is mechanically forced to respond, through the physical intermediary of the one flux both windings share. This is exactly why real appliances (an idle phone charger versus one actively charging a phone) draw noticeably different currents from the wall, even though the wall''s own voltage supply never changes.',
  ARRAY[
    'why does the primary current depend on what the secondary is connected to',
    'how does the primary know theres a lamp on the other side with no wire',
    'does the primary current change if i swap the load resistor',
    'why does a bigger load pull more current on both sides',
    'whats the actual link between the secondary load and the primary draw'
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
