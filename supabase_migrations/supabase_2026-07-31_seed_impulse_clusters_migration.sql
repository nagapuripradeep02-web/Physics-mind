-- supabase_2026-07-31_seed_impulse_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for impulse.json —
-- Laws of Motion (Class 11) #8, on the momentum_bench field_3d engine
-- (docs/MOMENTUM_BENCH_ENGINE_SPEC.md). chapter:8, section:"8.8",
-- prerequisites: ["newton_second_law","newton_third_law"].
--
-- Authored 2026-07-31 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/lom_f/impulse/
-- 02_physics_block.md §7): STATE_2 — rebound_sign_reversal,
-- momentum_change_vs_speed_change, impulse_direction; STATE_4 —
-- area_under_curve_meaning, average_force_from_graph, impulse_units;
-- STATE_5 — stiffness_vs_impulse, peak_force_vs_average_force,
-- time_spreading_safety.
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
-- has_prebuilt_deep_dive picks (architect skeleton §5, metadata only, Rule 18):
-- STATE_2 (the NCERT 2mv rebound, most common exam error), STATE_4 (F-t
-- graph literacy), STATE_5 (the PRIMARY aha — equal areas, different
-- peaks) — all three states carry a drill_downs array in the concept JSON
-- referencing these cluster_ids.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 rebound_sign_reversal deep-dive ───────────────────────────
(
  'rebound_sign_reversal',
  'impulse',
  'STATE_2',
  'Why is the momentum change 2mv, not mv, on a rebound?',
  'Student treats momentum as if it only had a size, so a ball leaving at the same speed it arrived reads as "nothing much changed" — at most mv. Momentum is a signed quantity along the track: arriving at +mv and departing at -mv is a swing of mv - (-mv) = 2mv, not a difference of mv - mv = 0. The magnitude of the velocity never changed (3.0 m/s in, 3.0 m/s out), but the DIRECTION reversed, and momentum change is computed on the signed value, not the speed. The engine makes this literal: the momentum readout runs from +3.00 to -3.00 kg·m/s, a swing the student can watch happen rather than take on faith.',
  ARRAY[
    'why is momentum change 2mv not mv',
    'why does bouncing back double the momentum change',
    'doesnt the ball just keep the same momentum since speed is same',
    'why do we add the momentum instead of subtract',
    'is momentum change always 2mv on a bounce'
  ],
  'pending_review'
),
-- ─── STATE_2 momentum_change_vs_speed_change deep-dive ─────────────────
(
  'momentum_change_vs_speed_change',
  'impulse',
  'STATE_2',
  'If the speed is the same before and after, how can momentum have changed?',
  'Student conflates speed (a magnitude) with velocity/momentum (signed quantities), so equal speeds before and after feel like proof that "nothing changed." Speed staying at 3.0 m/s is genuinely true and genuinely irrelevant to the momentum-change question: momentum is mass times VELOCITY, and velocity carries a direction. A rebound that returns the ball at the same speed but the opposite direction has a velocity that went from +3.0 to -3.0 m/s — a real, large change, even though |v| never moved. The sim keeps the speed readout and the signed momentum readout side by side precisely so a student can see the two disagree: |v| flat, p swinging through zero.',
  ARRAY[
    'speed is same before and after so why did momentum change',
    'if speed doesnt change how can momentum change',
    'why does direction matter for momentum',
    'the ball has the same speed so shouldnt p be the same',
    'why is momentum negative after the bounce'
  ],
  'pending_review'
),
-- ─── STATE_2 impulse_direction deep-dive ───────────────────────────────
(
  'impulse_direction',
  'impulse',
  'STATE_2',
  'Which way does the impulse point on a rebound?',
  'Student is unsure whether the impulse (and the momentum change it equals) points in the direction the ball arrives, the direction it leaves, or some average of the two. The impulse is defined as the CHANGE in momentum, final minus initial: Δp = p_after - p_before = (-3.00) - (+3.00) = -6.00 kg·m/s along the track. The sign is negative because the wall push acts opposite to the ball''s original direction of travel — the impulse points the same way the contact FORCE points during the bounce, which is back toward where the ball came from, not toward where it ends up heading (those happen to be the same direction here only because the rebound is a straight-line reversal).',
  ARRAY[
    'which way does the impulse point on a rebound',
    'is impulse in the direction the ball leaves or arrives',
    'why is impulse opposite to the incoming velocity',
    'does impulse point toward the wall or away from it',
    'how do i know the sign of the impulse'
  ],
  'pending_review'
),
-- ─── STATE_4 area_under_curve_meaning deep-dive ────────────────────────
(
  'area_under_curve_meaning',
  'impulse',
  'STATE_4',
  'Why does the area under the force-time graph equal the impulse?',
  'Student sees the shaded region on the F-t graph as a visual decoration rather than a computed quantity. Impulse is, by definition, the sum of force times a tiny slice of time, added up over the whole contact — and that is exactly what integrating (summing) F over t means geometrically: the area under the curve. Each thin vertical strip of the shaded region has height F and width dt, so its area is F·dt, one tiny contribution to the impulse; adding every strip together is the total area, which is the total impulse. The sim draws this live during the slowed contact so the area visibly fills in step with time passing, not as a static picture.',
  ARRAY[
    'why does the area under the force time graph equal impulse',
    'what does the shaded region on the F-t graph mean',
    'why cant i just multiply peak force by time',
    'is area under the curve always equal to momentum change',
    'why is impulse an area and not a single number'
  ],
  'pending_review'
),
-- ─── STATE_4 average_force_from_graph deep-dive ────────────────────────
(
  'average_force_from_graph',
  'impulse',
  'STATE_4',
  'How do I find the average force from a force-time graph?',
  'Student is unsure how to turn a curved, changing F-t trace into a single force number. The average force F̄ is defined so that a CONSTANT force of that size, acting for the same total contact time, would deliver the identical impulse — same area, different shape: a rectangle of height F̄ and width Δt whose area equals the real curve''s area. Algebraically this is just F̄ = Δp/Δt, dividing the total momentum change by the total contact time. The average force is always less than the peak force (since the real pulse rises and falls, while the equal-area rectangle is flat), which is why average and peak force are never the same number.',
  ARRAY[
    'how do i find average force from a force time graph',
    'is average force the same as peak force',
    'why is average force less than the peak',
    'how do i turn the graph area into a force value',
    'whats the difference between average force and peak force'
  ],
  'pending_review'
),
-- ─── STATE_4 impulse_units deep-dive ───────────────────────────────────
(
  'impulse_units',
  'impulse',
  'STATE_4',
  'Why is impulse measured in newton-seconds?',
  'Student is puzzled that impulse gets its own unit name (newton-seconds, N·s) that looks unrelated to momentum''s unit (kilogram metres per second, kg·m/s), even though the impulse-momentum theorem says they are equal. Both units are dimensionally identical: a newton is a kg·m/s², so newton-seconds is kg·m/s² times s, which simplifies to kg·m/s exactly. The two names exist because impulse is naturally built from force times time (leading to N·s), while momentum is naturally built from mass times velocity (leading to kg·m/s) — two different physical stories that land on the same physical quantity, which is exactly why the impulse-momentum theorem is a genuine equality and not just a coincidence of arithmetic.',
  ARRAY[
    'why is impulse measured in newton seconds',
    'are newton seconds the same as kilogram metres per second',
    'why does impulse have two different unit names',
    'is N s the same unit as momentum',
    'why do impulse and momentum share units'
  ],
  'pending_review'
),
-- ─── STATE_5 stiffness_vs_impulse deep-dive ────────────────────────────
(
  'stiffness_vs_impulse',
  'impulse',
  'STATE_5',
  'Does a stiffer wall change the impulse?',
  'Student expects a stiffer, harder-hitting-looking contact to deliver "more" impulse than a soft one. For an elastic rebound at a given mass and impact speed, the momentum change |Δp| = 2m|v| depends only on the mass and speed — the wall''s stiffness never enters that formula at all. What stiffness DOES control is how that same impulse is delivered in time: a rigid wall (k = 2000 N/m) delivers it as a tall, brief 70 ms pulse; a padded wall ten times softer (k = 200 N/m) delivers the identical impulse as a shorter, wider 222 ms pulse. The two shaded areas under their force-time traces come out equal to within 0.0038% in the engine — stiffness reshapes the pulse, it does not resize the impulse.',
  ARRAY[
    'does a stiffer wall change the impulse',
    'why is the impulse the same for both walls',
    'if the wall is harder shouldnt the impulse be bigger',
    'does stiffness change how much momentum is transferred',
    'why doesnt spring stiffness affect the area under the graph'
  ],
  'pending_review'
),
-- ─── STATE_5 peak_force_vs_average_force deep-dive ─────────────────────
(
  'peak_force_vs_average_force',
  'impulse',
  'STATE_5',
  'Which one actually matters for injury: peak force or average force?',
  'Student assumes that because both walls deliver the same impulse, they must be equally "dangerous," when in fact it is the PEAK force, not the impulse or the average force, that tends to cause damage — bones, joints and structures fail under a large instantaneous force, not under a fixed total momentum change spread arbitrarily over time. In the sim, the rigid wall''s peak (134.16 N) is √10 ≈ 3.16 times the padded wall''s peak (42.43 N), even though both walls deliver exactly the same 6.00 N·s impulse. A bigger peak, not a bigger impulse, is the harmful quantity — which is exactly why spreading a fixed impulse over more time (a lower peak) is the whole point of protective padding.',
  ARRAY[
    'which one actually causes damage, peak force or average force',
    'why does the rigid wall have a higher peak but same impulse',
    'is peak force the same thing as impulse',
    'why does a bigger peak not mean a bigger momentum change',
    'whats worse for injury, peak force or average force'
  ],
  'pending_review'
),
-- ─── STATE_5 time_spreading_safety deep-dive ───────────────────────────
(
  'time_spreading_safety',
  'impulse',
  'STATE_5',
  'Why does bending your knees (or an airbag) reduce the force?',
  'Student assumes that a safety measure like bending your knees or an airbag must somehow reduce the amount of momentum being stopped, since the outcome "feels safer." Neither one changes the momentum change at all — landing from a given height, or crashing at a given speed, fixes Δp regardless of how the stop happens. What knees and airbags change is Δt, the time over which that same Δp is delivered: a stiff-legged landing stops the body in a few milliseconds (small Δt, large peak force through the joints), while bent knees stretch the same stop over a much longer time (larger Δt, smaller peak force). F̄ = Δp/Δt makes this exact — with Δp fixed, only stretching Δt can shrink the force.',
  ARRAY[
    'why does bending your knees reduce the force when landing',
    'how does an airbag lower the force in a crash',
    'if the momentum change is fixed how does padding help',
    'why does spreading out the time lower the force',
    'does padding change how much momentum is absorbed'
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
