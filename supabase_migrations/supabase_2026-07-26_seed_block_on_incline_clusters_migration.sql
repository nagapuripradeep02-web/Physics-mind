-- supabase_2026-07-26_seed_block_on_incline_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for block_on_incline.json —
-- Laws of Motion (Class 11) #3, on the newtons_laws_body field_3d engine
-- (docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md), pure configuration plus the
-- pre-approved param_ramp one-shot knob (CHAPTER_LOOP §7.1), zero renderer
-- edits. chapter:8, section:"8.4", prerequisites:
-- ["free_body_diagram","normal_reaction","newton_second_law","vector_resolution"].
--
-- Authored 2026-07-26 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/lom/block_on_incline/
-- physics_block.md §8): STATE_3 — tan_theta_equals_mu_threshold,
-- mass_cancels_in_breakaway_angle, static_friction_maximum_vs_actual;
-- STATE_4 — kinetic_less_than_static, a_equals_g_sin_minus_mu_cos,
-- friction_direction_on_incline.
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
-- status='pending_review' per the current cluster-registry convention.
--
-- has_prebuilt_deep_dive picks (architect skeleton §6, metadata only, Rule 18):
-- STATE_3 (the threshold — the exam's favourite, PRIMARY aha) and STATE_4
-- (the two-regime wall) — both states carry a drill_downs array in the
-- concept JSON referencing these cluster_ids.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 tan_theta_equals_mu_threshold deep-dive (PRIMARY aha) ─────
(
  'tan_theta_equals_mu_threshold',
  'block_on_incline',
  'STATE_3',
  'Why does the block slip at exactly that one angle, and not gradually before or after it?',
  'Student expects slipping to be a fuzzy, gradual transition rather than a sharp threshold. The stick condition is |drive| <= maxStat, i.e. m·g·sin θ <= μₛ·m·g·cos θ. Dividing both sides by m·g·cos θ (always positive for θ < 90°) gives tan θ <= μₛ exactly — a single inequality with a single crossing point. Below that angle the ceiling μₛN always exceeds the demand mg·sin θ, so the block never moves at all; there is no partial sliding, no fractional grip. The instant tan θ exceeds μₛ, the demand permanently exceeds every possible static friction value the surface can supply, and the block accelerates from that instant on. The "sharpness" is not a modeling simplification — it falls directly out of comparing two quantities that cross at exactly one point.',
  ARRAY[
    'why does it slip at exactly that angle and not before',
    'how is the tipping angle just tan of mu',
    'why does one number decide when it lets go',
    'is there a formula for the exact angle it starts sliding',
    'why does the angle where it slips depend only on mu'
  ],
  'pending_review'
),
-- ─── STATE_3 mass_cancels_in_breakaway_angle deep-dive ─────────────────
(
  'mass_cancels_in_breakaway_angle',
  'block_on_incline',
  'STATE_3',
  'Shouldn''t a heavier block need a steeper ramp before it slips, since it presses down harder?',
  'Student reasons that a heavier block "should" behave differently because it presses harder into the ramp. It is true that both the driving force (mg·sin θ) and the friction ceiling (μₛ·mg·cos θ) grow with mass — but they grow by the exact SAME factor, m·g. The stick condition m·g·sin θ <= μₛ·m·g·cos θ has m·g on both sides, so it cancels completely, leaving tan θ <= μₛ with no mass term left at all. A heavier block does press harder into the ramp, which raises its normal force N and hence its absolute friction ceiling in newtons — but it also pulls harder down the slope by the identical factor, so the RATIO that decides slipping is completely unaffected. This is why every block, light or heavy, slips at the same angle on the same surface.',
  ARRAY[
    'does a heavier block slip at a different angle',
    'why doesnt the weight change when it starts sliding',
    'shouldnt a bigger mass need a steeper tilt to slide',
    'why does mass drop out of the slipping angle formula',
    'if I double the mass does the block still slip at the same angle'
  ],
  'pending_review'
),
-- ─── STATE_3 static_friction_maximum_vs_actual deep-dive ───────────────
(
  'static_friction_maximum_vs_actual',
  'block_on_incline',
  'STATE_3',
  'Is friction always equal to μₛN, or only sometimes?',
  'Student conflates the FORMULA μₛN (a maximum, a ceiling the surface can supply) with the ACTUAL static friction force acting at any given moment (whatever value is needed to keep the block still, which can be anywhere from zero up to that ceiling). Static friction is fundamentally a RESPONSE force: on a flat surface with nothing else pushing the block, static friction is exactly zero, even though μₛN might be a large positive number — there is simply no sliding tendency to resist. As the incline tilts, the sliding tendency mg·sin θ grows, and static friction grows to match it, precisely because it is answering a demand, not asserting a fixed value. Only in the single instant right at break-away does the actual friction force finally reach its ceiling μₛN; at every angle strictly below that, the actual friction is smaller than the ceiling, even though both are legitimate quantities to compute.',
  ARRAY[
    'is friction always at its maximum value',
    'why isnt static friction just mu times N all the time',
    'does friction only equal mu_s N right before it slips',
    'why does the friction number keep changing while it holds still',
    'is mu_s N a fixed force or just a limit'
  ],
  'pending_review'
),
-- ─── STATE_4 kinetic_less_than_static deep-dive ────────────────────────
(
  'kinetic_less_than_static',
  'block_on_incline',
  'STATE_4',
  'Why does friction get weaker the instant the block starts moving, when it just took a huge force to make it slip?',
  'Student expects friction to be a single continuous quantity across the stick-to-slip transition, so a large force needed to overcome it should still be needed to keep it going. In reality, static and kinetic friction are governed by two DIFFERENT coefficients (μₛ and μₖ), with μₖ < μₛ always, because a surface at rest has microscopic contact points that have settled and interlocked more thoroughly than a surface already sliding, where contact is more fleeting. Once the block breaks away, the resisting force drops from its ceiling μₛN to the smaller μₖN — a real, measurable step down — which is exactly why breakaway looks like a sudden snap rather than a gentle release: the driving force that was JUST barely losing to μₛN now decisively beats the smaller μₖN, so the block doesn''t just start moving, it accelerates immediately and does not re-stick.',
  ARRAY[
    'why does friction get weaker once it starts moving',
    'shouldnt friction stay the same once its already slipping',
    'why is sliding friction smaller than the friction that was holding it',
    'if it needed that much force to slip why does it need less now',
    'why does the grip not come back once it starts sliding'
  ],
  'pending_review'
),
-- ─── STATE_4 a_equals_g_sin_minus_mu_cos deep-dive ─────────────────────
(
  'a_equals_g_sin_minus_mu_cos',
  'block_on_incline',
  'STATE_4',
  'Where does the −μₖ cos θ term come from in the sliding acceleration, and why isn''t it just g sin θ?',
  'Student remembers "acceleration on a frictionless incline is g sin θ" and either forgets the friction term entirely once a coefficient is given, or is unsure why it is SUBTRACTED rather than added. Applying Newton''s second law along the slope to a body already sliding down: the net force is the down-slope drive (mg·sin θ) minus the up-slope kinetic friction (μₖ·N = μₖ·mg·cos θ), because kinetic friction always opposes the direction of relative sliding — here, down-slope motion means friction acts up-slope. Dividing the net force by mass m gives a = g·sin θ − μₖ·g·cos θ = g(sin θ − μₖ·cos θ); the mass cancels here too, just as it did in the break-away condition. The term is subtracted specifically because friction opposes the very motion mg·sin θ is causing — if friction ever pointed the same way as the slide, the sign would flip, but that never happens for a body sliding down under gravity alone.',
  ARRAY[
    'where does the minus mu cos theta come from in the acceleration',
    'why does the sliding acceleration have two parts instead of just g sin theta',
    'why does friction subtract from g sin theta instead of adding',
    'how do I know when to include the friction term in acceleration',
    'why isnt the acceleration on a slope just g sin theta like in physics class'
  ],
  'pending_review'
),
-- ─── STATE_4 friction_direction_on_incline deep-dive ───────────────────
(
  'friction_direction_on_incline',
  'block_on_incline',
  'STATE_4',
  'How do I know which way to draw the friction arrow on an incline — does it always point up the slope?',
  'Student is unsure whether friction has a fixed direction on an incline (e.g. "friction always points up the slope") or needs to be worked out each time. The correct rule is that friction ALWAYS opposes the direction of actual or impending RELATIVE SLIDING, never a fixed geometric direction. For a block that is stationary but tends to slide down under gravity, static friction points up-slope to resist that tendency. For a block already sliding down, kinetic friction likewise points up-slope, opposing the down-slope motion. But if the same block were instead sliding UP the slope (for instance, given an initial push upward, or driven by an applied force), kinetic friction would point DOWN-slope, opposing that upward motion instead. So "friction points up the slope" is only true for the specific, common case of a block sliding or tending to slide downward — the general and exam-safe rule is always "friction opposes relative sliding," checked fresh for each scenario.',
  ARRAY[
    'why does friction point up the slope and not down',
    'does friction always oppose the direction something is moving',
    'how do I know which way to draw the friction arrow on an incline',
    'why does the friction arrow flip direction depending on which way its sliding',
    'does friction ever point down the slope'
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
