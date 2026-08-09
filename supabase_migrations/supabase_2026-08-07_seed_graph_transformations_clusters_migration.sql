-- supabase_2026-08-07_seed_graph_transformations_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for
-- src/data/concepts/mathematics/graph_transformations.json — the SECOND
-- mathematics concept, NCERT Class 11 Mathematics Ch.2 "Relations and
-- Functions" (chapter:2, section:"2.1"; prerequisites:
-- ["unit_circle_to_sine_wave"]). First consumer of the cartesian_plane /
-- function_plot / plot_point primitive family (Phase 0, PRs #36-#40).
--
-- Authored 2026-08-07 by alex:json_author, using the mathematics_author's
-- drill-down trigger phrasings VERBATIM (docs/skeletons/
-- graph_transformations_mathematics_block.md §7 — 45 phrasings, 5 per
-- cluster, genuine student voice):
--   STATE_3 — why_minus_h_moves_right, inside_shift_direction, moving_curve_vs_moving_axes;
--   STATE_5 — why_b_squeezes, period_from_b, horizontal_factor_is_one_over_b;
--   STATE_6 — inside_vs_outside_rule, which_number_does_what, order_of_transformations.
--
-- The three states are exactly the concept's has_prebuilt_deep_dive picks
-- (architect skeleton §6): S3 (the h-direction — the single most-documented
-- confusion on this topic, M1), S5 (the 1/b compression, M2) and S6 (the
-- inside/outside unification — the PRIMARY aha). Each carries a drill_downs
-- array in the concept JSON referencing these cluster_ids.
--
-- label/description authored by json_author from first principles, grounded
-- in the mathematics_author's domain & validity ledger (T1-T5 theorems, the
-- M1/M2 misconception fixes) — never copied from a textbook.
--
-- WHY THIS FILE EXISTS: scar confusion_cluster_registry_unseeded_for_concept
-- (CRITICAL/FIXED) makes the seeding migration a NAMED json_author
-- deliverable (skeleton §11f).
--
-- MIGRATION IS AUTHORED, NOT APPLIED. Applying is a founder action on the
-- founder's machine (Rule 17) — the same doctrine that governs every schema
-- change in this repo. Drill-down itself is DEFERRED (Rule 18 / Rule 22 [D],
-- 2026-06-10 directive), so the registry ROW is dormant this phase; the
-- authored FILE is the deliverable. Do not let an auditor re-route json_author
-- to "fix" the dormant row.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
-- trigger_examples, status. PRIMARY KEY is (cluster_id) alone; ON CONFLICT
-- updates the other columns idempotently. status='pending_review' per the
-- current cluster-registry convention.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 — the h-direction (M1) ────────────────────────────────────
(
  'why_minus_h_moves_right',
  'graph_transformations',
  'STATE_3',
  'Why does x minus h move the graph right? Minus should mean left.',
  'The minus sign is genuinely confusing here because it is subtracting from the INPUT, not from the output — every other minus sign a student has met so far subtracted from a number directly and made it smaller. Read the new rule literally instead of by analogy: y = f(x − h) says "the height that used to belong to x now belongs to x + h". To reproduce the height that the parent had at some old x0, the new curve needs a LARGER x — specifically x0 + h — because that larger x, once you subtract h back off, gives you x0 again. A larger x sits further right on the axis, so the whole picture moves right. The sim makes this checkable rather than asserted: the point at x = pi/2 on the parent reappears at x = pi/2 + h on the real copy, and the frozen wrong-guess curve (which genuinely does slide left) stays on screen at the same time so the two directions are never just described, they are compared.',
  ARRAY[
    'Why does x minus h move the graph right? Minus should mean left.',
    'I thought subtracting a number always slides things backward, so why does the curve go forward?',
    'If it''s f of x minus h, shouldn''t the curve just move left by h?',
    'My teacher said inside the bracket everything flips — why does it actually go right here?',
    'How is x minus 2 the same shape as x but pushed to the right? That feels backward.'
  ],
  'pending_review'
),
(
  'inside_shift_direction',
  'graph_transformations',
  'STATE_3',
  'Why does something inside the brackets move the whole curve sideways instead of up or down?',
  'Because the position INSIDE the function''s brackets is the input, x — and x is exactly what the horizontal axis measures. Anything that changes what number gets fed into f before f acts can only ever relabel which x produces which height; it cannot touch the height itself. k, by contrast, is added AFTER f has already produced a height, so it changes the output directly — that is why k moves the curve vertically while h moves it horizontally. The rule is not arbitrary: it falls straight out of where each number sits relative to the function''s own working. Outside numbers act on what the function returns; inside numbers act on what the function is asked about, before it has returned anything.',
  ARRAY[
    'Why does something inside the brackets move the whole curve sideways instead of up or down?',
    'I get that k moves it up, but why does h inside do something totally different?',
    'Does the graph move the same way the number moves, or the opposite way?',
    'Why can''t I just look at the sign of h and know which way it goes, the way I do for k?',
    'If h is positive, why doesn''t the curve just move in the positive direction like everything else?'
  ],
  'pending_review'
),
(
  'moving_curve_vs_moving_axes',
  'graph_transformations',
  'STATE_3',
  'Is the curve actually moving, or is it the axes that are moving under it?',
  'In this sim, the curve genuinely moves and the axes stay fixed — that is the picture drawn, and it is the more natural one to build the rule from. But the two descriptions are mathematically equivalent, and it is worth knowing why: shifting every point of the curve h units right produces the exact same picture as leaving the curve alone and shifting the coordinate grid h units LEFT underneath it (relabelling what counts as zero). Either story reproduces y = f(x − h). The sim commits to "the curve moves, axes fixed" because that is what a teacher can point at and what a slider can animate; a moving-axes picture would need the grid itself to slide, which is a harder thing to watch and confirms nothing extra about the algebra.',
  ARRAY[
    'Is the curve actually moving, or is it the axes that are moving under it?',
    'When we shift x by h, are we moving the graph or relabeling where zero is?',
    'I keep imagining the y-axis sliding instead of the curve — which one is really moving?',
    'If I moved the axes left instead of the curve right, would I get the same picture?',
    'Why does shifting the input feel like moving the whole coordinate system to me?'
  ],
  'pending_review'
),
-- ─── STATE_5 — the b-compression (M2) ──────────────────────────────────
(
  'why_b_squeezes',
  'graph_transformations',
  'STATE_5',
  'Why does multiplying x by a bigger number make the graph narrower instead of wider?',
  'Because b multiplies x BEFORE sin gets to act on it, so sin sees a bigger number sooner. sin completes one full cycle every time its argument grows by 2*pi, no matter how that argument is built. If the argument is b*x, then x itself only needs to grow by 2*pi/b before b*x has grown by the full 2*pi — so a bigger b means x has to travel a SMALLER distance to complete one wave, and the waves are packed in tighter. Multiplying x by 2 does not stretch the graph the way multiplying a whole NUMBER by 2 would grow it; it accelerates how fast the input reaches sin''s next repeat, which visually compresses the picture. The sim''s bracket makes this a countable fact rather than a story: at b = 2 the bracket reads 3.14, exactly half the parent''s own 6.28.',
  ARRAY[
    'Why does multiplying x by a bigger number make the graph narrower instead of wider?',
    'If b is 2, shouldn''t the graph stretch out to twice the size, not shrink?',
    'I multiply things to make them bigger everywhere else — why does this make the curve squeeze in?',
    'How can multiplying x by 2 make the wave finish faster?',
    'Doesn''t a bigger number always mean a bigger graph? Why not here?'
  ],
  'pending_review'
),
(
  'period_from_b',
  'graph_transformations',
  'STATE_5',
  'Why is the new period 2 pi over b and not just 2 pi times b?',
  'The period is the x-distance needed for the argument b*x to complete one full 2*pi sweep. Setting b*T = 2*pi and solving for T gives T = 2*pi / b directly — the division is not a convention, it falls straight out of solving that one equation. Multiplying instead (T = 2*pi*b) would say a bigger b makes the period LONGER, which is the exact opposite of what a bigger b does: it makes b*x grow faster, so the FULL sweep is reached sooner, at a SMALLER x. Division belongs on the b, not multiplication, precisely because b is speeding the argument up. The sim''s stepped squeeze — b dwelling at 1.5, then 2, then 2.5 — lets a student watch the bracket shrink in matching steps: 4.19, then 3.14, then 2.51, each one exactly 2*pi divided by the paused value of b.',
  ARRAY[
    'Why is the new period 2 pi over b and not just 2 pi times b?',
    'Where does the divide-by-b in the period formula actually come from?',
    'If b doubles, why does the period cut in half instead of doubling too?',
    'I don''t get why the period formula has b on the bottom, not the top.',
    'How do I find how many waves fit in the same space once b changes?'
  ],
  'pending_review'
),
(
  'horizontal_factor_is_one_over_b',
  'graph_transformations',
  'STATE_5',
  'Why is the horizontal scale factor 1 over b and not just b?',
  'a and b sit in genuinely different positions relative to the function, so they act with opposite arithmetic even though both are "multiplications". a multiplies the OUTPUT: a bigger a directly makes every height a times as large, no inversion needed. b multiplies the INPUT before sin ever sees it, so its effect on the drawn width comes out through solving b*x = (old argument) for x — which means dividing by b, i.e. scaling x by 1/b. A horizontal stretch by factor 1/b is the price of describing an inside operation using an outside-shaped word ("stretch"); the number itself, b, still appears exactly where it was written, un-flipped, in the formula. The asymmetry between a and b is the same outside/inside asymmetry the whole concept is built on (STATE_6''s aha), just seen one state early, in its sharpest single instance.',
  ARRAY[
    'Why is the horizontal scale factor 1 over b and not just b?',
    'If a stretches the graph by a, why doesn''t b stretch it by b the same way?',
    'Why do I have to flip b upside down to get the actual horizontal stretch?',
    'I thought the number in front of x tells you the stretch directly — why is it inverted?',
    'Is there a quick way to remember that inside numbers get flipped and outside ones don''t?'
  ],
  'pending_review'
),
-- ─── STATE_6 — the inside/outside unification (PRIMARY AHA) ───────────
(
  'inside_vs_outside_rule',
  'graph_transformations',
  'STATE_6',
  'How do I remember which numbers are outside and which are inside the function?',
  'Look at where each letter sits relative to the function''s own brackets, literally on the page. In y = a * f(b * (x − h)) + k, a and k sit OUTSIDE f''s brackets — a multiplies the result f already produced, k is added to that result. b and h sit INSIDE f''s brackets — they touch x before f ever acts on it. That is the entire rule, and it is checkable by eye on any formula, for any function f, not just sine: if a number touches x directly, before the function symbol, it is inside; if a number touches the function''s OUTPUT, after the function has already been applied, it is outside. Outside numbers therefore act on y the direction they say; inside numbers act on x, and because they act on the input rather than the output, their effect on the drawn picture comes out backwards from the naive reading.',
  ARRAY[
    'How do I remember which numbers are outside and which are inside the function?',
    'Is a outside or inside — I keep mixing it up with b.',
    'Why do outside numbers act on y directly but inside numbers act on x differently?',
    'What''s the actual rule for telling outside from inside just by looking at the equation?',
    'If a number touches x before the function is applied, is that always inside?'
  ],
  'pending_review'
),
(
  'which_number_does_what',
  'graph_transformations',
  'STATE_6',
  'With four letters — a, b, h, k — how do I keep track of which one does what?',
  'Pair each letter with the ONE thing it moves, using the same inside/outside split that organises the whole concept: k is outside and additive — it shifts the curve vertically. a is outside and multiplicative — it scales every height, and flips the curve when negative. h is inside and additive — it shifts the curve horizontally, in the OPPOSITE direction its own sign suggests. b is inside and multiplicative — it squeezes the curve horizontally, again by the reciprocal 1/b rather than by b itself. Two outside numbers, two inside numbers; within each pair, one is additive (moves position) and one is multiplicative (changes size). The sim builds the four moves in exactly that grouped order — both outside moves land, THEN the outside claim; both inside moves land, THEN the inside claim — so the letters are never memorised in isolation, only ever seen doing their one job.',
  ARRAY[
    'With four letters — a, b, h, k — how do I keep track of which one does what?',
    'Which of the four numbers changes the height, and which changes the width?',
    'I always mix up h and k — which one moves it sideways and which one moves it up?',
    'Is there an order I should check the four numbers in, or does it not matter?',
    'How do I tell from the equation alone whether the graph got taller or wider?'
  ],
  'pending_review'
),
(
  'order_of_transformations',
  'graph_transformations',
  'STATE_6',
  'Does it matter whether I stretch first or shift first, or do I get the same graph either way?',
  'For the FINAL PICTURE, no — a = a and b = b regardless of the order you apply them, because the formula y = a*f(b(x-h))+k is one fixed expression, not a sequence of edits. But for MAPPING ONE SPECIFIC POINT through the transform, order matters completely, and STATE_7 makes this the whole lesson: a point''s x-coordinate must be divided by b BEFORE h is added, because the formula itself reads b*(x - h), which means "take x, subtract h, THEN the b sits outside multiplying that whole difference" — reversed for a point map, you undo the innermost operation first. Divide by b, then add h; multiply by a, then add k. Skipping the division, or adding h before dividing, lands the point at the wrong place even though the DRAWN CURVE — built directly from the formula, not from a sequence of point-edits — is completely unaffected by the mix-up.',
  ARRAY[
    'Does it matter whether I stretch first or shift first, or do I get the same graph either way?',
    'If I do the shift before the stretch, will the graph land in the wrong place?',
    'Why do I have to divide by b before adding h, and not the other way around?',
    'Is there a fixed order to apply a, b, h and k, or can I do them in any order?',
    'When I map one point through all four numbers, which operation do I do first?'
  ],
  'pending_review'
)
ON CONFLICT (cluster_id) DO UPDATE SET
  concept_id       = EXCLUDED.concept_id,
  state_id         = EXCLUDED.state_id,
  label            = EXCLUDED.label,
  description      = EXCLUDED.description,
  trigger_examples = EXCLUDED.trigger_examples,
  status           = EXCLUDED.status;

-- Verification after applying (expect 9):
--   SELECT count(*) FROM confusion_cluster_registry
--    WHERE concept_id = 'graph_transformations';
-- And that every cluster_id here appears in the concept JSON's drill_downs:
--   S3 why_minus_h_moves_right | inside_shift_direction | moving_curve_vs_moving_axes
--   S5 why_b_squeezes | period_from_b | horizontal_factor_is_one_over_b
--   S6 inside_vs_outside_rule | which_number_does_what | order_of_transformations
