-- supabase_2026-07-20_seed_meter_bridge_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for meter_bridge.json
-- — the THIRTEENTH concept on the particle_field (2D p5.js) renderer, same
-- engine family as drift_velocity/ohms_law/resistivity/combination_of_resistors/
-- emf_definition/internal_resistance/electrical_power_in_resistor/
-- kirchhoff_junction_rule_KCL/kirchhoff_loop_rule_KVL/wheatstone_bridge/
-- potentiometer/combination_of_cells (REUSES the combination_of_resistors
-- scenario_type as the renderer selector — no new scenario flag, per the
-- approved design's "do NOT mint a new scenario_type" directive; rides a NEW
-- topology:'meter_bridge' per-state flag instead). FINALE of the founder's
-- lab trio (Wheatstone c20 -> potentiometer c23 -> meter bridge).
-- Authored 2026-07-20 by alex:json_author per architect skeleton §6 +
-- physics_author drill-down trigger phrases (verbatim, physics block §5).
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
-- idiomatic, no textbook prose), verbatim from the physics block §5.
-- status='pending_review' per the current cluster-registry convention.
--
-- Candidate cluster_ids (architect skeleton §6 — no has_prebuilt_deep_dive
-- flags authored on the concept itself; V1 ships ZERO authored deep-dives):
--   STATE_2 — "wire = resistance ruler" pivot: resistance_proportional_to_length,
--             why_wire_resistance_per_cm_cancels, nonuniform_wire_breaks_balance
--   STATE_4 — "null is not the answer" pivot: null_reading_is_not_the_answer,
--             deriving_X_from_lengths, which_length_over_which
--   STATE_5 — precision/sensitivity beat: balance_near_middle_min_error,
--             choosing_R_comparable_to_X, end_errors_swap_to_cancel

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 resistance_proportional_to_length deep-dive ──────────────
(
  'resistance_proportional_to_length',
  'meter_bridge',
  'STATE_2',
  'Why does a longer piece of the wire have more resistance?',
  'Student is unsure how a bare length of wire can act as a resistor at all, let alone one whose value changes smoothly as the jockey slides. It does: because the wire is UNIFORM along its whole length, every centimetre of it contributes the same amount of resistance, so the resistance of any stretch is directly proportional to its length. That is exactly why the two segments either side of the jockey — A to J, and J to C — can stand in as two more ratio arms of a Wheatstone bridge, the same way the known resistor R and the unknown resistor X do above them.',
  ARRAY[
    'why does a longer piece of the wire have more resistance',
    'does each cm of the wire add the same resistance',
    'how does length turn into resistance here',
    'is the resistance just the length basically',
    'why can i treat the two wire bits as two resistors'
  ],
  'pending_review'
),
-- ─── STATE_2 why_wire_resistance_per_cm_cancels deep-dive ─────────────
(
  'why_wire_resistance_per_cm_cancels',
  'meter_bridge',
  'STATE_2',
  'Don''t I need to know the wire''s actual resistance per centimetre to find X?',
  'Student expects the wire''s exact ohms-per-centimetre (its resistivity and cross-section combined) must appear somewhere in the calculation, the way it would in a resistivity problem. It never does: the balance condition compares a RATIO of the two segment resistances, R_segL : R_segR = l : (100 − l), and the wire''s own Ω/cm constant appears in BOTH segments equally, so it cancels out algebraically before it ever reaches the final formula X = R·(100 − l₁)/l₁. Only the two LENGTHS and the one known resistor R ever appear in the answer — the wire''s material and thickness are irrelevant as long as it stays uniform.',
  ARRAY[
    'dont i need to know the wires resistance per cm',
    'how come the actual ohms of the wire dont matter',
    'where did the wire resistance go in the formula',
    'why is it only the ratio of lengths not the real resistance',
    'do i need the resistivity of the wire to get x'
  ],
  'pending_review'
),
-- ─── STATE_2 nonuniform_wire_breaks_balance deep-dive ─────────────────
(
  'nonuniform_wire_breaks_balance',
  'meter_bridge',
  'STATE_2',
  'What if the wire is thicker or different at one end — does the method still work?',
  'Student wonders whether the meter bridge''s length-to-resistance trick is robust to an imperfect wire, or whether it silently assumes a physically ideal one. It genuinely assumes UNIFORMITY: the entire method rests on each segment''s resistance being strictly proportional to its length, which is only true if the wire''s cross-section and material are the same everywhere along it. A wire that is thicker, thinner, corroded, or made of a different alloy at one end breaks that proportionality — the two segments would no longer be honest ratio arms, and the balance length would give a WRONG value of X even though the galvanometer still reads a clean zero.',
  ARRAY[
    'what if the wire is thicker at one end',
    'does the wire have to be uniform for this to work',
    'why does a non-uniform wire mess up the reading',
    'what happens if the wire isnt the same all along',
    'is the length-ratio still right if the wire varies'
  ],
  'pending_review'
),
-- ─── STATE_4 null_reading_is_not_the_answer deep-dive ─────────────────
(
  'null_reading_is_not_the_answer',
  'meter_bridge',
  'STATE_4',
  'Is the galvanometer reading the value of X directly?',
  'Student treats the zero deflection itself as if it were somehow displaying the unknown resistance, the way a digital multimeter might. It never does: the galvanometer is a NULL detector, not a resistance meter — its only job is to tell you WHEN the junction and the jockey agree in potential. The value of X is computed AFTERWARD, entirely separately, from the balance length and the known resistance R via X = R·(100 − l₁)/l₁. A zero reading with no further calculation tells you nothing about X''s numeric value at all.',
  ARRAY[
    'so is the galvanometer reading the value of x',
    'the needle is at zero so how is that telling me anything',
    'what does zero deflection actually give me',
    'if it reads nothing how do i know x',
    'does the meter show me the unknown resistance'
  ],
  'pending_review'
),
-- ─── STATE_4 deriving_X_from_lengths deep-dive ────────────────────────
(
  'deriving_X_from_lengths',
  'meter_bridge',
  'STATE_4',
  'How exactly does the balance length turn into X?',
  'Student can locate the balance point but gets lost translating the two lengths into the actual formula for X. Walk it through from the balance condition itself: at balance the two segment ratios match the two resistor ratios, R/X = l₁/(100 − l₁), where l₁ is the length from A to the jockey and (100 − l₁) is what remains from the jockey to C. Solving that single equation for X directly gives X = R·(100 − l₁)/l₁ — plug in the known resistance and the two measured lengths, and the unknown resistance falls straight out.',
  ARRAY[
    'how do i get x from the balance point',
    'which formula turns the length into x',
    'where does 100 minus l come from',
    'how does r and the length give me the unknown',
    'walk me through x equals r times 100 minus l over l'
  ],
  'pending_review'
),
-- ─── STATE_4 which_length_over_which deep-dive ────────────────────────
(
  'which_length_over_which',
  'meter_bridge',
  'STATE_4',
  'Which length goes on top in the ratio — is it l1 or 100 minus l1?',
  'Student has the right formula shape but keeps flipping which segment length belongs with which resistor, inverting the answer by accident. The rule is fixed by WHERE each resistor sits: the known resistance R sits on the LEFT (the A side), so it pairs with the LEFT segment length l₁ (measured from A to the jockey); the unknown resistance X sits on the RIGHT (the C side), so it pairs with the RIGHT segment length (100 − l₁). Putting R with l₁ and X with (100 − l₁) on the same side of the ratio, R/X = l₁/(100 − l₁), always gives the correctly-oriented formula X = R·(100 − l₁)/l₁ — swapping the two lengths inverts X by the square of the true ratio.',
  ARRAY[
    'is l measured from the r side or the x side',
    'which length goes on top in the ratio',
    'do i use l or 100 minus l for x',
    'i keep flipping the ratio which way is right',
    'does it matter which gap i put the known r in'
  ],
  'pending_review'
),
-- ─── STATE_5 balance_near_middle_min_error deep-dive ──────────────────
(
  'balance_near_middle_min_error',
  'meter_bridge',
  'STATE_5',
  'Why should the balance point be near the middle of the wire?',
  'Student assumes any balance point on the wire is equally trustworthy, since the formula X = R·(100 − l₁)/l₁ is exact wherever l₁ happens to land. The FORMULA is exact, but the MEASUREMENT of l₁ never is — a real jockey always carries a small, unavoidable placement uncertainty δl. Differentiating the formula shows the fractional error in X, |ΔX/X| = 100·δl/[l·(100 − l)], is minimized when the denominator l·(100 − l) is largest — exactly at the middle, l = 50 cm — and grows rapidly toward either end of the wire, where the same small δl gets divided by a much smaller denominator.',
  ARRAY[
    'why should the balance point be near the middle',
    'does it matter where on the wire it balances',
    'why is a balance near the end bad',
    'how does the balance position affect accuracy',
    'why is the middle the most accurate spot'
  ],
  'pending_review'
),
-- ─── STATE_5 choosing_R_comparable_to_X deep-dive ─────────────────────
(
  'choosing_R_comparable_to_X',
  'meter_bridge',
  'STATE_5',
  'How do I pick the known resistance R to get an accurate reading?',
  'Student doesn''t realize the choice of R (a dial the experimenter sets, before ever touching the jockey) directly controls where the balance point lands, and therefore how accurate the whole measurement will be. Since l₁ = 100R/(R + X), setting R close in VALUE to the unknown X pushes l₁ toward the middle of the wire — the most error-tolerant region found in the balance_near_middle_min_error cluster above. Setting R very different from X (much smaller or much larger) forces the balance point toward one end, where the same small jockey-placement error produces a much larger fractional error in the computed X.',
  ARRAY[
    'how do i pick the known resistance r',
    'why should r be close to x',
    'what value of r should i use in the box',
    'does choosing r change where it balances',
    'how do i get the null to land in the middle'
  ],
  'pending_review'
),
-- ─── STATE_5 end_errors_swap_to_cancel deep-dive ──────────────────────
(
  'end_errors_swap_to_cancel',
  'meter_bridge',
  'STATE_5',
  'What are end errors, and why do you swap R and X and repeat?',
  'Student has never encountered "end errors" and doesn''t see why a careful experimenter would deliberately swap two resistors and redo the whole measurement. End errors are a small SYSTEMATIC extra resistance hiding in the copper strips and connections at each end of the wire, which the ideal uniform-wire formula never accounts for — and this extra resistance affects the two ends of the wire differently, biasing l₁ slightly one way. Interchanging the known and unknown resistors and re-balancing flips WHICH end that bias favors, so averaging the two balance lengths from both trials cancels the end-error''s effect on the computed X, leaving a far more trustworthy final value.',
  ARRAY[
    'what are end errors in a meter bridge',
    'why do you swap r and x and repeat',
    'how does interchanging the resistors help',
    'what causes error at the ends of the wire',
    'why average the two balance lengths'
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
