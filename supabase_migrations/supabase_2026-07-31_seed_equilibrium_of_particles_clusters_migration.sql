-- supabase_2026-07-31_seed_equilibrium_of_particles_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for
-- equilibrium_of_particles.json — Laws of Motion (Class 11) #8, and the FIRST
-- concept on the force_rig field_3d engine, Branch A `force_table`
-- (docs/loop_runs/lom_g/_engine/force_rig_json_contract.md). chapter:8,
-- section:"8.5", prerequisites:
-- ["newton_first_law","tension_force","vector_resolution","free_body_diagram"].
--
-- Authored 2026-07-31 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/lom_g/
-- equilibrium_of_particles/02_physics_block.md §10):
--   STATE_3 — why_two_equations_not_one, choosing_the_axes, sign_of_a_component;
--   STATE_6 — why_tension_blows_up_near_flat, why_cables_and_ropes_always_sag,
--             tension_larger_than_the_load.
--
-- Migration is AUTHORED, NOT APPLIED. The lom-g tray forbids DB writes of any
-- kind (docs/loop_runs/lom_g_state.md, "Hard prohibitions"), so this file is
-- authored and left for the founder / quality_auditor's pre-run step. Drill-down
-- itself is DEFERRED (Rule 18, 2026-06-10 directive) — the
-- confusion_cluster_registry Gate-8 probe is N/A-DORMANT this phase per the
-- documented false-FAIL scar (memory: auditor-cluster-registry-false-fail).
-- Do not let the auditor re-route json_author to "fix" this.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- status='pending_review' per the current cluster-registry convention.
--
-- has_prebuilt_deep_dive picks (architect skeleton §5, metadata only, Rule 18):
-- STATE_3 (components — the historical sticking point and the Pass-1
-- prerequisite cliff) and STATE_6 (the cable-angle law — the PRIMARY aha).
-- Both states carry a drill_downs array in the concept JSON referencing these
-- cluster_ids.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 why_two_equations_not_one deep-dive ───────────────────────
(
  'why_two_equations_not_one',
  'equilibrium_of_particles',
  'STATE_3',
  'Why do we write two equations instead of one "the forces balance"?',
  'Student treats "the forces balance" as a single arithmetic statement about sizes, so splitting it into two equations looks like extra bookkeeping invented by the teacher. Force is a VECTOR, and a vector equation is only satisfied when every one of its components is satisfied separately: ΣF = 0 is shorthand for ΣFx = 0 AND ΣFy = 0, two statements that must both hold. The four-string rig on screen shows exactly why one is not enough — the ring is released on the x-axis with the vertical sum already reading 0.00 N at every instant, and it still moves, because the horizontal sum is not zero. A single scalar statement cannot express that: it has no way to say "balanced this way but not that way". Two perpendicular directions are the minimum needed to pin a point in a plane, so two equations are the minimum needed to pin it in equilibrium.',
  ARRAY[
    'why do we write two equations not one',
    'cant i just say the forces balance',
    'why split it into x and y at all',
    'one equation was enough in class 10 what changed',
    'do i always have to do both directions'
  ],
  'pending_review'
),
-- ─── STATE_3 choosing_the_axes deep-dive ───────────────────────────────
(
  'choosing_the_axes',
  'equilibrium_of_particles',
  'STATE_3',
  'How do I know which way to take the x-axis, and does the answer change?',
  'Student believes there is one correct pair of axes, usually "x horizontal, y vertical", and that any other choice is an error. The axes are a CHOICE, not a physical fact: ΣF = 0 is true in every frame of reference oriented any way at all, so any two perpendicular directions give a valid pair of equations, and every valid choice gives the same physical answer. What changes is only the arithmetic. Picking one axis ALONG a string kills that string''s perpendicular component entirely (it contributes to one equation and contributes exactly zero to the other), which turns a two-unknown problem into a one-line solve — that is why a teacher tilts the axes on an incline, or lays x along a cable. The rig on screen is the easiest case: with the strings already along x and y, each string appears in exactly one equation, so both sums read off the picture directly.',
  ARRAY[
    'how do i know which way to take x',
    'can i tilt the axes or must they be up and down',
    'does the answer change if i pick different axes',
    'teacher took x along the string why',
    'is there a wrong choice of axes'
  ],
  'pending_review'
),
-- ─── STATE_3 sign_of_a_component deep-dive ─────────────────────────────
(
  'sign_of_a_component',
  'equilibrium_of_particles',
  'STATE_3',
  'Is a force pointing left negative, or is it a separate "backwards force"?',
  'Student mentally files a leftward pull as a different KIND of force from a rightward pull, then either adds both as positive numbers or subtracts them twice. Once an axis direction is chosen, a component is just a signed number on that axis: a pull along −x enters the sum as a negative value, and that is the whole of it — there is no extra "backwards force" to account for separately. This is exactly what makes ΣFx = 0 do real work on the four-string rig: the +x string contributes +29.4 N and the −x string contributes −29.4 N, and the sum is zero because the two signs are opposite, not because anything was cancelled by hand. The sign is bookkeeping that the chosen axis fixes; flip the axis direction and every sign flips together, leaving the sum, and the physics, unchanged.',
  ARRAY[
    'is a force pointing left negative or positive',
    'why did the component come out minus',
    'do i put a minus sign or just subtract it',
    'confused about signs in the x equation',
    'backwards force vs negative component same thing'
  ],
  'pending_review'
),
-- ─── STATE_6 why_tension_blows_up_near_flat deep-dive ──────────────────
(
  'why_tension_blows_up_near_flat',
  'equilibrium_of_particles',
  'STATE_6',
  'Why does the tension become so large when the cable is nearly flat?',
  'Student expects tension to change smoothly and boundedly with the cable angle, so a very large number at a small angle reads as an arithmetic slip. Only the VERTICAL part of a cable''s tension carries the load. For a symmetric pair, 2 T sin θ = W, so T = W / (2 sin θ) with sin θ in the denominator: as the cables flatten, sin θ shrinks toward zero and the tension needed grows without any ceiling. At 30° each cable pulls W; at 17.5° each pulls about 1.67 W; at 1° it would take about 29 W. There is no maximum because sin θ has no positive minimum — the function is unbounded, not merely large. At exactly θ = 0 the vertical part of every cable is zero, so no finite tension can hold ANY load, which is the mathematical form of "a loaded cable can never be pulled perfectly straight".',
  ARRAY[
    'why does tension become so big when the rope is flat',
    'where does the 1 over sin theta come from',
    'what happens at theta equals zero',
    'why is there no maximum tension',
    'tension is infinite that cant be right'
  ],
  'pending_review'
),
-- ─── STATE_6 why_cables_and_ropes_always_sag deep-dive ─────────────────
(
  'why_cables_and_ropes_always_sag',
  'equilibrium_of_particles',
  'STATE_6',
  'Why can''t a rope be pulled perfectly straight — is the sag a fault in the rope?',
  'Student reads the sag as a defect of the material: a stiffer, stronger or better-tensioned rope should get rid of it. The sag is the MECHANISM by which the rope carries the load at all, not a weakness. A perfectly straight rope is exactly horizontal, so every part of its tension is horizontal and its vertical part is zero — it can supply nothing at all against a vertical load, no matter how hard it is pulled. The rope must lean by some angle θ to have a vertical part to give, and that leaning IS the sag. Making the rope stronger only allows a larger T, which by 2 T sin θ = W permits a smaller θ; it never permits θ = 0. On screen the load grows and the ring answers the only way it can: by sagging further, because a larger vertical share can only come from a larger lean.',
  ARRAY[
    'why cant i pull a rope perfectly straight',
    'is the sag because the rope stretches',
    'the clothes line still dips even when tight why',
    'does a stronger rope sag less',
    'is sagging a fault in the rope'
  ],
  'pending_review'
),
-- ─── STATE_6 tension_larger_than_the_load deep-dive ────────────────────
(
  'tension_larger_than_the_load',
  'equilibrium_of_particles',
  'STATE_6',
  'How can each cable pull harder than the weight it is holding?',
  'Student reasons that two cables sharing one load should each carry at most half of it, so a cable reading MORE than the whole load looks like force appearing from nowhere. Nothing is created: only the VERTICAL parts of the two tensions have to add up to the load, and each cable''s vertical part is T sin θ, a fraction of its full tension. The rest of each tension is horizontal — and the two horizontal parts point in opposite directions and cancel each other exactly, which is why they never show up in the vertical balance. The flatter the cables, the larger that hidden horizontal share becomes, so a bigger and bigger total T is needed to leave the same vertical part behind. Measured on screen at a 17.5° cable: each support reads 49.0 N while the load is 29.4 N, and the two 46.7 N horizontal parts cancel, leaving exactly 2 × 14.7 = 29.4 N vertical. Every newton is accounted for.',
  ARRAY[
    'how can the cable pull harder than the weight',
    'isnt that creating force from nothing',
    'the tension is more than mg how',
    'does that break newtons third law',
    'why is each cable not just half the weight'
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
