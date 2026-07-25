-- supabase_2026-07-25_seed_em_wave_propagation_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for em_wave_propagation.json —
-- the field_3d 'em_wave_propagation' scenario (Class 12 Ch.8 §8.3, the chapter's
-- second diamond, direct sequel to displacement_current). Mutually regenerating
-- changing E and B fields self-propagate through empty space as a transverse
-- wave — E ⊥ B ⊥ direction of travel, E×B ahead, E and B in phase with
-- E₀/B₀ = c, energy split equally between the two fields, at the speed
-- c = 1/√(μ₀ε₀) ≈ 3×10⁸ m/s that identifies light itself as an electromagnetic
-- wave (v = c/n in a medium).
--
-- Authored 2026-07-25 by alex:json_author per architect skeleton §6 +
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
--   STATE_2 — the self-sustaining abstraction ("how can fields hold each other up
--             with nothing underneath?") — the chicken-and-egg wall this concept
--             historically dies at — how_do_fields_sustain_each_other,
--             does_the_wave_need_its_source, chicken_and_egg_e_or_b_first
--   STATE_6 — the identity claim ("is it a coincidence that the number matches
--             light?"), the PRIMARY aha, carrying the deepest conceptual weight —
--             is_c_matching_light_a_coincidence, why_multiply_mu0_and_eps0,
--             does_c_depend_on_frequency_or_amplitude
--   STATE_9 — the exam-mechanics synthesis (direction sign errors, phase-argument
--             bookkeeping, which axis B takes) where board/JEE students fumble
--             under time pressure — how_to_write_b_given_e,
--             direction_of_b_from_propagation, same_phase_argument_meaning

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 how_do_fields_sustain_each_other deep-dive ─────────────────
(
  'how_do_fields_sustain_each_other',
  'em_wave_propagation',
  'STATE_2',
  'How do the fields keep each other going with nothing underneath them?',
  'Student expects every effect to need a persistent external cause — a wave needs a source pushing it the whole way, the way a hand keeps pushing a swing. STATE_2''s leapfrog-relay shows something different: the E-kink and B-loop are ALREADY both continuously present in the traveling train (never a sequential appear/disappear), and the relay choreography is a highlight riding on top of that always-simultaneous pair, marching forward one stylized step at a time. Nothing is "holding the fields up" from outside — a changing E at one point in space is, by Faraday''s law and the Ampère-Maxwell law together (both prerequisites, cashed here), exactly what a changing B one step ahead requires, and vice versa. The loop closes on itself, spatially, forever, which is why the source can vanish (STATE_2''s switch-open beat) and the already-launched wave keeps regenerating itself all the way to the receiver.',
  ARRAY[
    'how do the fields keep each other going',
    'whats actually holding the wave up with nothing there',
    'how can E and B just keep making each other forever',
    'why doesnt the wave run out of energy on its own',
    'what keeps the fields regenerating without a source'
  ],
  'pending_review'
),
-- ─── STATE_2 does_the_wave_need_its_source deep-dive ────────────────────
(
  'does_the_wave_need_its_source',
  'em_wave_propagation',
  'STATE_2',
  'Does the wave die if you turn off the transmitter — why does it keep going after the source stops?',
  'Student assumes a wave is like a wake behind a boat — the instant the boat (source) stops, the wake should stop being generated and eventually die out entirely, including the part already out there. STATE_2 draws the distinction sharply: the source switch opens visibly and the charge bead freezes INSTANTLY (cause), yet the ALREADY-LAUNCHED pulse keeps traveling unchanged (effect) — because that pulse no longer needs the source at all, only its own leapfrog hand-off. The source''s only job was to launch the disturbance in the first place (STATE_1); once launched, the wave is a self-contained, self-perpetuating structure in the fields themselves, carried entirely by the mutual regeneration mechanism, with zero ongoing dependency on the antenna that started it.',
  ARRAY[
    'does the wave die if you turn off the transmitter',
    'why does the wave keep going after the source stops',
    'so the source isnt actually pushing the wave the whole time',
    'once its launched does it need anything to keep moving',
    'why doesnt the wave stop the moment the antenna stops'
  ],
  'pending_review'
),
-- ─── STATE_2 chicken_and_egg_e_or_b_first deep-dive ─────────────────────
(
  'chicken_and_egg_e_or_b_first',
  'em_wave_propagation',
  'STATE_2',
  'Which one comes first, E or B — isn''t this a chicken-and-egg problem?',
  'Student reasonably suspects a causal ordering must exist — SOMETHING has to be the "original" cause, so either E must precede B or B must precede E, at every point. The relay choreography resolves this by refusing the premise: at every instant, BOTH fields are simultaneously present and simultaneously changing, each one''s CHANGE (not the field itself) feeding the other''s existence one step ahead in SPACE, not in time at a single point — the hard narration guardrail is exactly "each field''s change feeds the other," never "E turns into B," because the latter phrasing plants a false sequential-alternation picture (the very 90°-out-of-phase misconception STATE_5 exists to destroy). There is no "first" field, just as there is no first link in a closed circular chain — the mutual regeneration is a steady-state spatial structure, not a temporal relay race between two separately-existing things.',
  ARRAY[
    'which one comes first E or B',
    'isnt this a chicken and egg problem',
    'how can both fields cause each other at the same time',
    'does E create B or does B create E',
    'why isnt one of them the original cause'
  ],
  'pending_review'
),
-- ─── STATE_6 is_c_matching_light_a_coincidence deep-dive ────────────────
(
  'is_c_matching_light_a_coincidence',
  'em_wave_propagation',
  'STATE_6',
  'Is it just a coincidence that this number matches the speed of light?',
  'Student sees two seemingly unrelated numbers — a timed pulse speed and a formula built from two constants borrowed from earlier chapters (capacitor and coil labs) — land on the identical value, and suspects either a rigged demo or a genuine but accidental numerical near-miss. STATE_6''s required narration framing is explicit on this point: the gate-timed speed and the 1/√(μ₀ε₀) prediction are NOT two independent measurements that happen to agree — the gate timing IS internally derived from the same v = c the constants predict, so the agreement is a mathematical certainty, not a coincidence to sell. Historically this was the actual discovery: physicists had μ₀ and ε₀ from entirely separate experiments (magnetic force between wires, electric force between charges) with no reason to expect a speed, let alone a familiar one — computing 1/√(μ₀ε₀) and getting exactly the already-known speed of light was the moment electromagnetism and optics were recognized as the same subject.',
  ARRAY[
    'is it just a coincidence that this equals the speed of light',
    'why does this number match light exactly',
    'did they design mu naught and epsilon naught to give light speed',
    'is this really how light was discovered or just a nice match',
    'how do two constants from circuits give the speed of light'
  ],
  'pending_review'
),
-- ─── STATE_6 why_multiply_mu0_and_eps0 deep-dive ────────────────────────
(
  'why_multiply_mu0_and_eps0',
  'em_wave_propagation',
  'STATE_6',
  'Why do you multiply mu-naught and epsilon-naught to get a speed — what do these two constants have to do with each other?',
  'Student has met μ₀ (from Ampère''s law / magnetic force between wires) and ε₀ (from Coulomb''s law / capacitor fields) as two completely separate bookkeeping constants for two separate forces, so combining them into 1/√(μ₀ε₀) feels like an arbitrary formula-hunting trick rather than a meaningful physical statement. The genuine derivation (beyond this concept''s scope, but the intuition is available) comes from the wave equation that falls out of Maxwell''s equations for E(x,t) and B(x,t) together — the SAME two constants that set how strongly a changing E produces B (via μ₀, from the Ampère-Maxwell law, prerequisite displacement_current) and how strongly a changing B produces E (via 1/ε₀-flavoured terms, prerequisite faraday_law_induction) also, together, set exactly how FAST that mutual regeneration can propagate through space. Units check it too: 1/√(μ₀ε₀) works out dimensionally to m/s, not some other unit — the "speed" the formula produces is not a coincidence of algebra, it is what naturally falls out of combining the two coupling strengths that govern the STATE_2 handshake itself.',
  ARRAY[
    'why do you multiply mu naught and epsilon naught to get speed',
    'what do these two constants have to do with each other',
    'why does 1 over root of mu epsilon give a speed at all',
    'where does this formula for c even come from',
    'why not just add mu naught and epsilon naught instead'
  ],
  'pending_review'
),
-- ─── STATE_6 does_c_depend_on_frequency_or_amplitude deep-dive ──────────
(
  'does_c_depend_on_frequency_or_amplitude',
  'em_wave_propagation',
  'STATE_6',
  'Does the speed change if you change the frequency or make the wave stronger?',
  'Student, having just watched the ν slider reshape the wavelength live on STATE_6, reasonably wonders whether dragging frequency (or the field-strength slider on STATE_7) also changes how fast the wave travels — an intuition borrowed from everyday experience where "more energetic" often means "faster." In vacuum it emphatically does not: c = 1/√(μ₀ε₀) is a GLOBAL constant of this concept that depends on nothing but the two constants themselves — not ν, not E₀, not source_on. Dragging ν on STATE_6 visibly RESHAPES λ while the gates keep timing the exact SAME speed underneath; dragging field strength on STATE_7/STATE_8 rescales the envelopes and the energy tanks while the ratio chip E₀/B₀ never ticks, precisely because that ratio is c and c does not move. Every colour of visible light, every radio station''s frequency, every wave amplitude — all travel through vacuum at the identical c; only entering an actual MEDIUM (STATE_10, v = c/n) changes the speed, and even there it is the medium''s refractive index doing the work, not the wave''s own frequency or amplitude.',
  ARRAY[
    'does the speed change if you change the frequency',
    'does a stronger wave travel faster',
    'why doesnt higher frequency mean faster light',
    'is c different for different colors',
    'does amplitude affect how fast the wave moves'
  ],
  'pending_review'
),
-- ─── STATE_9 how_to_write_b_given_e deep-dive ───────────────────────────
(
  'how_to_write_b_given_e',
  'em_wave_propagation',
  'STATE_9',
  'How do I find B if I only know E — what''s the formula to get B from E?',
  'Student has separately learned that E and B are perpendicular, in phase, and related in amplitude by c, but hasn''t practiced ASSEMBLING those three separately-taught facts into one written expression under exam pressure. STATE_9''s chain-link derivation walks exactly this synthesis: given E_y = E₀ sin(kx − ωt), three already-familiar pieces glow in turn and dock into the answer — direction (the triad recall: E×B must point along the travel direction, fixing B''s axis as ẑ), phase (the cursor recall: same bracket (kx − ωt), since in-phase means literally the same argument, not just "related"), and amplitude (the ratio-chip recall: B₀ = E₀/c). Assembled, B_z = (E₀/c)·sin(kx − ωt) — every piece of that expression is a DIRECT lookup from a fact already taught in an earlier state, never a fresh derivation; the exam skill is knowing which three facts to reach for and in what order.',
  ARRAY[
    'how do I find B if I only know E',
    'whats the formula to get B from E',
    'if E is given how do you figure out B',
    'how do you write out the B equation from the E equation',
    'given E how do I know what B looks like'
  ],
  'pending_review'
),
-- ─── STATE_9 direction_of_b_from_propagation deep-dive ──────────────────
(
  'direction_of_b_from_propagation',
  'em_wave_propagation',
  'STATE_9',
  'How do you know which direction B points — why is B along z and not some other axis?',
  'Student can recite "E, B, and travel are mutually perpendicular" but freezes when asked to pick B''s SPECIFIC axis out of the two remaining choices (here, +ẑ vs −ẑ), often guessing rather than applying the rule. STATE_4 already performed the rule fully once: sweep E into B using the right-hand rule (the sweep-arc glyph), and the resulting E×B thrust must point along the travel direction — for E along ŷ and travel along +x̂, only B along +ẑ makes ŷ×ẑ = x̂ true (ẑ×ŷ = −x̂ would be wrong). STATE_9 does not re-perform this rule; it RECALLS it (the triad glows, "direction: ẑ" docks) precisely because the mechanical step was already earned at STATE_4, including its sign-robustness check on the trough (both fields flip, but E×B still points +x̂ — flipping BOTH signs together never changes B''s axis choice). The rule is always the same cross-product logic: E direction, cross B direction, must equal travel direction — solve for the missing one.',
  ARRAY[
    'how do you know which direction B points',
    'why is B along z and not some other axis',
    'how do you figure out Bs direction from the direction of travel',
    'whats the rule for finding Bs axis',
    'why does the direction of travel decide where B points'
  ],
  'pending_review'
),
-- ─── STATE_9 same_phase_argument_meaning deep-dive ──────────────────────
(
  'same_phase_argument_meaning',
  'em_wave_propagation',
  'STATE_9',
  'Why do E and B use the same kx minus omega t — what does using the same phase argument actually mean?',
  'Student can copy the phase argument (kx − ωt) from E into B mechanically but doesn''t connect WHY that specific move encodes "in phase," so the step feels like unmotivated notation-copying rather than a meaningful physical claim. STATE_5 already built the physical picture directly: the cursor''s twin readouts rise together and fall together, crest with crest and zero with zero, at every instant — that IS what "in phase" means, observed live. Sharing the identical bracket (kx − ωt) in both E_y = E₀ sin(kx − ωt) and B_z = (E₀/c) sin(kx − ωt) is simply the algebraic way of writing "these two quantities reach their maximum, zero, and minimum at exactly the same (x, t) pairs" — if B instead carried (kx − ωt − π/2), that extra phase offset would be exactly the WRONG 90°-shifted ghost train STATE_5 spent its whole beat falsifying. Same bracket, same timing, same physical claim: no phase lag anywhere in this wave.',
  ARRAY[
    'why do E and B use the same kx minus omega t',
    'what does using the same phase argument actually mean',
    'why cant B have a different phase term than E',
    'does the same argument mean they peak together',
    'why is the bracket identical for both fields'
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
