-- supabase_2026-08-02_seed_positive_negative_zero_work_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for
-- positive_negative_zero_work.json — Class 11 Ch.6 Work, Energy and Power #2,
-- authored against the same newtons_laws_body field_3d engine extended with
-- the SEAM K/L/M/N energy layer (docs/loop_runs/ch6_state.md), opening the
-- F_ang regime (0..180deg) concept #1 deliberately ceded. chapter:6,
-- section:"6.3", prerequisites: ["work_done_by_constant_force",
-- "friction_force","normal_force","newton_second_law"].
--
-- Authored 2026-08-02 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/ch6/
-- positive_negative_zero_work/physics_block.md §6):
--   STATE_2 — how_work_can_be_negative, friction_always_opposes_sliding,
--             slowing_down_and_negative_work;
--   STATE_3 — why_ninety_degrees_means_zero, force_without_work,
--             carrying_a_bag_zero_work;
--   STATE_5 — sign_of_cos_theta, negative_work_vs_negative_force,
--             ninety_degrees_the_dividing_line.
--
-- Migration is AUTHORED, NOT APPLIED. json_author's own tooling forbids
-- `apply_migration` — this file is left for the founder / quality_auditor's
-- pre-run step. Drill-down itself is DEFERRED (Rule 18, 2026-06-10 directive)
-- — the confusion_cluster_registry Gate-8 probe is N/A-DORMANT this phase per
-- the documented false-FAIL scar (memory: auditor-cluster-registry-false-fail).
-- Do not let the auditor re-route json_author to "fix" this.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- status='pending_review' per the current cluster-registry convention.
--
-- has_prebuilt_deep_dive picks (architect skeleton §5, metadata only, Rule 18):
-- STATE_2 (negative_work_friction — "how can work be negative?" is the single
-- most-asked confusion on this topic), STATE_3 (zero_work_normal — the
-- mathematical abstraction of perpendicularity plus the exam-staple carried-
-- bag case), and STATE_5 (angle_decides_sign — the cos-theta sign
-- abstraction, "why does the sign flip at 90 degrees"). All three states
-- carry a drill_downs array in the concept JSON referencing these cluster_ids.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 how_work_can_be_negative deep-dive ─────────────────────────
(
  'how_work_can_be_negative',
  'positive_negative_zero_work',
  'STATE_2',
  'How can work be negative — isn''t work just force times distance?',
  'Student has only ever seen work as a positive, accumulating quantity (from the prerequisite concept, every worked case had W >= 0) and struggles with the idea that a product of two positive-looking quantities — a force magnitude and a distance travelled — can come out negative. Work is not simply "force times distance"; it is F·d·cos θ, and the cos θ factor carries a sign that depends entirely on the ANGLE between the force and the direction of travel. When a force points opposite to the motion (θ = 180°, as with kinetic friction on a sliding body), cos θ = −1, and the work done by that force over the same distance is exactly as large in magnitude but negative in sign. The force itself, and the distance, both stay positive numbers — the negativity lives purely in the geometry of how the force is oriented relative to the motion, not in either factor alone.',
  ARRAY[
    'how can work be negative isnt work just force times distance',
    'negative joules doesnt make sense to me',
    'if work is negative does that mean it goes backwards in time',
    'how do you even get a minus sign in work',
    'so work can be less than zero how'
  ],
  'pending_review'
),
-- ─── STATE_2 friction_always_opposes_sliding deep-dive ──────────────────
(
  'friction_always_opposes_sliding',
  'positive_negative_zero_work',
  'STATE_2',
  'Why does friction always point backward, and does that mean it always does negative work?',
  'Student has learned that kinetic friction opposes relative sliding but has not connected WHY that geometric fact forces its work to always be negative while the body is actually moving. Kinetic friction is defined to point directly opposite the direction of sliding at every instant — that is not a special case, it is what "opposes motion" means. Because the angle between the kinetic friction force and the body''s displacement is therefore always exactly 180° while sliding continues, cos 180° = −1 every single time, with no exceptions. The moment the body stops moving, sliding kinetic friction stops existing (it becomes static friction, or zero), so the question "can friction ever do positive work while sliding" has a firm answer: never, for kinetic friction specifically, because the 180° angle is built into its own definition.',
  ARRAY[
    'why does friction always point backward',
    'does friction ever help the motion instead of opposing it',
    'why is frictions angle always 180 degrees to the motion',
    'how do i know friction is exactly opposite to velocity',
    'can friction ever do positive work while sliding'
  ],
  'pending_review'
),
-- ─── STATE_2 slowing_down_and_negative_work deep-dive ───────────────────
(
  'slowing_down_and_negative_work',
  'positive_negative_zero_work',
  'STATE_2',
  'Does slowing down always mean the work done was negative?',
  'Student notices the crate slows to a stop exactly as its friction-work bar dives below zero, and reasonably wonders whether "the body is slowing down" and "the work being done is negative" are simply the same fact stated two ways — a link this very state deliberately leaves as an observation, not a proven rule. This state shows ONE force (friction) doing negative work while the ONLY force acting, so naturally the body slows; the connection between speed change and work is genuinely the NET work across every force acting, which is a separate concept''s claim (the work-energy theorem). In a state with several forces (a later concept in this same rig sums four forces at once), a single force can do positive work while the body still slows down overall, or vice versa — so "slowing down" is a safe observable ONLY when it is the sole force present, exactly as staged here.',
  ARRAY[
    'does slowing down always mean negative work',
    'why does the crate stopping mean the work was negative',
    'is negative work the reason things slow down',
    'how is losing speed connected to a negative number for work',
    'if something slows down is the work always negative'
  ],
  'pending_review'
),
-- ─── STATE_3 why_ninety_degrees_means_zero deep-dive ────────────────────
(
  'why_ninety_degrees_means_zero',
  'positive_negative_zero_work',
  'STATE_3',
  'Why does exactly 90 degrees give zero work?',
  'Student has met cos θ as a formula input but has no physical picture for why the specific value 90° makes the entire work term vanish rather than merely shrink. Cosine measures how much of one vector lies along the direction of another: cos 0° = 1 (fully aligned), cos 90° = 0 (entirely sideways, none of the force lies along the direction of travel), and cos 180° = −1 (fully opposed). At exactly 90°, the force has ZERO component pointing along the direction the body is actually moving — all of the force is spent pushing sideways to the motion, doing nothing to speed the body up or slow it down along its path. This is not an approximation or a special exception written into the formula; it falls directly out of what "component along the direction of travel" means geometrically, and it is the exact reason a right-angle force is the one angle that always gives zero work regardless of how large the force is or how far the body travels.',
  ARRAY[
    'why does 90 degrees give zero work',
    'whats special about a right angle for work',
    'why cos 90 makes the whole thing disappear',
    'how can an angle make work completely vanish',
    'why is perpendicular the exact cutoff for zero work'
  ],
  'pending_review'
),
-- ─── STATE_3 force_without_work deep-dive ───────────────────────────────
(
  'force_without_work',
  'positive_negative_zero_work',
  'STATE_3',
  'Can a force act on a moving body the whole time and still do zero work?',
  'Student is used to assuming that if a force is visibly present and the body is visibly moving, some work must be happening — "acting" and "working" feel like the same thing. They are not: the normal force in this state pushes up on the crate for the entire run, never switching off, while the crate coasts steadily forward the whole time, and the work done by that normal force is exactly zero throughout, not approximately small. The reason is the 90° geometry above — the normal force has no component along the crate''s direction of travel, so however long it acts and however far the crate travels, its work stays pinned at zero. A force needs a component ALONG the direction of displacement to do any work at all; simply being present and nonzero is not enough.',
  ARRAY[
    'can a force act and still do nothing',
    'how can something push on an object without doing work',
    'if the force is there the whole time why is the work zero',
    'does a force have to move something to count as doing work',
    'so acting on an object isnt the same as working on it'
  ],
  'pending_review'
),
-- ─── STATE_3 carrying_a_bag_zero_work deep-dive ─────────────────────────
(
  'carrying_a_bag_zero_work',
  'positive_negative_zero_work',
  'STATE_3',
  'If I carry a heavy bag across a level floor, why is that zero work?',
  'Student experiences real physical tiredness from carrying a bag and finds it counter-intuitive that the physics work done on the bag by their upward-holding hand is exactly zero, no matter how far they walk or how heavy the bag is. The hand''s force on the bag points straight UP (holding it against gravity), while the bag''s displacement is entirely HORIZONTAL (the walking direction) — those two directions are at right angles to each other, which is exactly the perpendicular case: cos 90° = 0. The carrier''s own arm muscles genuinely do biological work internally (small constant contractions cost real energy, which is why the arm tires), but that internal cost is a completely separate account from the mechanical work done ON THE BAG by the hand''s force, which stays zero for as long as the walk is level and the hand''s force stays vertical.',
  ARRAY[
    'if i carry a heavy bag why is that zero work',
    'my arm is holding the bag up the whole walk so why no work',
    'carrying something across a flat road should be work right',
    'why does walking with a bag count as doing nothing physics wise',
    'if it feels tiring how can the work be zero'
  ],
  'pending_review'
),
-- ─── STATE_5 sign_of_cos_theta deep-dive ────────────────────────────────
(
  'sign_of_cos_theta',
  'positive_negative_zero_work',
  'STATE_5',
  'How does cos θ decide whether work comes out positive or negative?',
  'Student can compute cos θ for a given angle but has not organized the three regimes into one coherent picture of where the sign switches and why. Across 0° to 180°, cosine starts at +1 (0°, fully aligned, maximum positive work per unit force and distance), decreases smoothly through 0 at exactly 90° (perpendicular, zero work), and continues decreasing to −1 at 180° (fully opposed, maximum negative work). The SAME single formula W = F·d·cos θ produces all three outcomes without changing shape — nothing special is added or removed at 90°, the cosine function itself simply crosses zero there and continues into negative territory beyond it, which is exactly why one formula spans the whole taxonomy instead of needing three different rules for three different cases.',
  ARRAY[
    'how does cos theta decide if work is plus or minus',
    'why does cos theta flip sign after 90 degrees',
    'whats the pattern for cos theta being positive or negative',
    'does cos theta only matter for the angle value',
    'why does the same formula give different signs at different angles'
  ],
  'pending_review'
),
-- ─── STATE_5 negative_work_vs_negative_force deep-dive ──────────────────
(
  'negative_work_vs_negative_force',
  'positive_negative_zero_work',
  'STATE_5',
  'If the work comes out negative, does that mean the force itself is negative?',
  'Student sees a negative work value and a real, physically present pull and reasonably wonders whether the force reading should also flip to a negative number — treating the minus sign as if it belongs to the force rather than to the geometry of the angle. In this state the pull is a genuine 25 N force, and the instrument reading it stays a positive 25 N for the entire run, never once showing a negative number, even while the work that same pull does is a firmly negative value. The minus sign belongs to cos θ alone — the force''s own magnitude is always reported as a positive number (or zero), because magnitude by definition cannot be negative; it is only when that magnitude gets multiplied by cos θ for an obtuse angle that the product, the WORK, turns negative. A force and the work it does are two different quantities with two different sign conventions, and conflating them is exactly the trap this state is built to break.',
  ARRAY[
    'if the work is negative does that mean the force is negative',
    'how can the force stay positive but the work go negative',
    'does negative work mean the force pushes the wrong way',
    'why isnt the force itself negative when the work is',
    'so the newtons reading is still positive even with negative work'
  ],
  'pending_review'
),
-- ─── STATE_5 ninety_degrees_the_dividing_line deep-dive ─────────────────
(
  'ninety_degrees_the_dividing_line',
  'positive_negative_zero_work',
  'STATE_5',
  'Is ninety degrees always the exact line between positive and negative work, no matter the force?',
  'Student has seen 90° act as the zero-work boundary in one specific case (the normal force) and wonders whether that boundary shifts depending on which force is involved, or whether it is a fixed feature of the angle alone. The 90° boundary belongs entirely to the cosine function, not to any particular force — cos 90° = 0 regardless of whether the force in question is 5 N or 500 N, gravity or an applied pull or friction. Any force whose angle to the displacement is exactly 90° does exactly zero work, and any force at an angle strictly less than 90° does positive work while any force at an angle strictly greater than 90° does negative work, universally. What changes from force to force is only the SIZE of the work on either side of that boundary (set by the force''s magnitude and the distance travelled) — the boundary''s LOCATION, at exactly 90°, never moves.',
  ARRAY[
    'why is ninety degrees the exact line between positive and negative work',
    'what happens right at ninety degrees to the sign of work',
    'is ninety degrees always the boundary no matter the force',
    'why does crossing ninety degrees flip the sign of work',
    'whats so special about ninety degrees compared to any other angle'
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

-- ── concept_panel_config registration (defensive dual-registration) ───────
-- CLAUDE.md §6 registration site 2 offers TWO alternative mechanisms — a SQL
-- INSERT into this table OR CONCEPT_PANEL_MAP in src/config/panelConfig.ts.
-- This concept is ALSO registered in code (CONCEPT_PANEL_MAP in
-- src/config/panelConfig.ts, layout 'single', renderer field_3d — required by
-- Gate 8b's registration cross-check in validate-concepts.ts, which asserts
-- every concept_id parses out of panelConfig.ts or FAILs the fleet run).
-- Included here as belt-and-suspenders so the DB and the code registration
-- agree, mirroring work_done_by_constant_force's 2026-08-01 migration and the
-- precedent set by uniform_circular_motion's migration before it.
--
-- Values mirror the code registration exactly: single panel, field_3d, and
-- sonnet_can_upgrade FALSE because a field_3d diamond is authored config,
-- never an LLM-upgradable panel (Rule 5/18).
INSERT INTO concept_panel_config (
    concept_id, default_panel_count, panel_a_renderer, panel_b_renderer,
    sonnet_can_upgrade, upgrade_max, verified_by_human, reasoning,
    technology_a, class_level, chapter
) VALUES (
    'positive_negative_zero_work',
    1,
    'field_3d',
    NULL,
    FALSE,
    1,
    FALSE,
    'Ch.6 Work, Energy and Power #2 (2026-08-02). Single-panel field_3d diamond on the newtons_laws_body scenario engine, extended with the SEAM K/L/M/N energy layer (docs/loop_runs/ch6_state.md), pure configuration, zero renderer edits (0d). Opens the F_ang regime (0..180deg) concept #1 deliberately ceded (0..85deg). Mirrors CONCEPT_PANEL_MAP in src/config/panelConfig.ts. sonnet_can_upgrade FALSE: field_3d concepts are pure authored configuration and are never upgraded by an LLM at serving time (Rule 5/18).',
    'threejs',
    11,
    '6'
)
ON CONFLICT (concept_id) DO UPDATE
SET default_panel_count = EXCLUDED.default_panel_count,
    panel_a_renderer    = EXCLUDED.panel_a_renderer,
    panel_b_renderer    = EXCLUDED.panel_b_renderer,
    sonnet_can_upgrade  = EXCLUDED.sonnet_can_upgrade,
    upgrade_max         = EXCLUDED.upgrade_max,
    reasoning           = EXCLUDED.reasoning,
    technology_a        = EXCLUDED.technology_a,
    class_level         = EXCLUDED.class_level,
    chapter             = EXCLUDED.chapter;
