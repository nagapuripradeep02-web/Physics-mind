-- supabase_2026-08-07_seed_derivative_as_secant_limit_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for
-- src/data/concepts/mathematics/derivative_as_secant_limit.json — the SECOND
-- MATHEMATICS concept (NCERT Class 11 Mathematics Ch.13, Limits and
-- Derivatives; chapter:12, section:"12.2"; prerequisites: []).
--
-- Authored 2026-08-07 by alex:json_author, using the mathematics_author's
-- drill-down trigger phrasings VERBATIM (docs/skeletons/
-- derivative_as_secant_limit_mathematics_block.md §5 — 45 phrasings, 5 per
-- cluster, written in genuine student voice):
--   STATE_3 — average_rate_vs_point_rate, does_it_ever_stop_changing, which_number_is_the_real_slope;
--   STATE_4 — why_cant_we_just_plug_in_zero, what_does_undefined_actually_mean, limit_as_a_target_not_a_value_there;
--   STATE_5 — does_the_chord_become_the_tangent, why_a_new_line_at_all, what_makes_tangent_special.
--
-- label + description are json_author's own composition (the mathematics
-- block supplied only the trigger phrasings + a one-line prevention-rule-style
-- gloss, matching the shape of the unit_circle_to_sine_wave precedent
-- migration, which this file mirrors byte-for-byte in structure).
--
-- The three states are exactly the concept's has_prebuilt_deep_dive picks
-- (architect skeleton §5): STATE_3 (the PRIMARY aha; average-vs-point-rate
-- confusion), STATE_4 (the h=0 exclusion; 0/0-is-not-a-number confusions) and
-- STATE_5 (the chord-becomes-tangent misconception). Each carries a
-- drill_downs array in the concept JSON referencing these cluster_ids.
--
-- WHY THIS FILE EXISTS: scar confusion_cluster_registry_unseeded_for_concept
-- (CRITICAL/FIXED) makes the seeding migration a NAMED json_author deliverable
-- (architect skeleton §6 / §10(f); dispatch requirement).
--
-- MIGRATION IS AUTHORED, NOT APPLIED. Applying is a founder action on the
-- founder's machine (Rule 17). Drill-down itself is DEFERRED (Rule 18 /
-- Rule 22 [D], 2026-06-10 directive), so the registry ROW is dormant this
-- phase; the authored FILE is the deliverable.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
-- trigger_examples, status. PRIMARY KEY is (cluster_id) alone; ON CONFLICT
-- updates the other columns idempotently. status='pending_review' per the
-- current cluster-registry convention.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 — the second point slides closer (PRIMARY AHA) ────────────
(
  'average_rate_vs_point_rate',
  'derivative_as_secant_limit',
  'STATE_3',
  'Isn''t the chord''s slope just the average rate over that bit, not the real rate at the point?',
  'Yes — a chord''s slope genuinely is an average: it is the total climb of the curve divided by the total width of the gap, spread evenly across an interval that is not a single point. The rate AT the point is a different question entirely, and it needs a different construction: instead of picking one gap and reading its average, watch what happens to the average as the gap itself shrinks toward zero. If the averages keep changing but head toward one particular number, that settling number is defined to be the rate at the point — not measured directly, but pinned down as a limit. Different second points give different averages because they cover different stretches of a curving function; a curve does not climb at a constant rate, so no single gap''s average can stand in for the point''s own rate. Only the number every gap''s average is converging on deserves that name.',
  ARRAY[
    'isn''t the chord''s slope just the average speed over that bit, not the real speed at the point?',
    'why does picking a different second point change the answer if we''re still measuring at the same P?',
    'how is ''the slope at one point'' even a thing if slope needs two points to begin with?',
    'if I use a huge gap I get a totally different number — so which one is the real slope?',
    'does it matter which side I slide Q in from, left or right?'
  ],
  'pending_review'
),
(
  'does_it_ever_stop_changing',
  'derivative_as_secant_limit',
  'STATE_3',
  'How do I know the number has actually settled and isn''t still slowly changing?',
  'For this curve the settling is provable algebraically, not just watched: the chord slope works out to exactly x-naught plus half of h, so shrinking h by a factor of ten shrinks the DIFFERENCE from the final answer by the same factor of ten, forever. At h = 0.1 the slope is 0.05 away from the limit; at h = 0.01 it is 0.005 away; the gap never stops shrinking, but it also never turns around or plateaus at a wrong value. Zooming in further always finds the same target number, because the formula guarantees it — this is not something that could look settled and then jump, the way a noisy measurement might. There genuinely is no smallest h at which the value becomes exact, because h = 0 is excluded from the domain of this construction altogether; that exclusion, and what to make of it, is exactly the next state''s subject.',
  ARRAY[
    'how do I know the number has actually settled and isn''t still slowly changing?',
    'what if it looks like it''s settling but then changes again further out?',
    'why does it matter that the number keeps getting closer instead of just jumping straight to the answer?',
    'could the number settle on a different value if I zoom in more carefully?',
    'is there a smallest h where the number finally becomes exact?'
  ],
  'pending_review'
),
(
  'which_number_is_the_real_slope',
  'derivative_as_secant_limit',
  'STATE_3',
  'Why isn''t the very first reading, at the biggest gap, good enough?',
  'The first reading at h = 1 is a perfectly correct number — it is just correct for a different question. It answers ''what is the average climb rate over a specific one-unit stretch starting at the point'', which is genuinely useful but is not the same as ''how steep is the curve exactly at the point''. The settling number, 1.0050 in the state''s own numbers, is not one gap''s average and not a value the chord itself ever actually displays — no rendered chord, at any h greater than zero, ever reads exactly that number. It belongs to the point because it is the one value every shrinking gap''s average is heading toward, independent of which gap you started from or which direction you approached from. That target is trusted precisely because it is the unique number both the leftward and the rightward approach converge on — if the readout never lands on it exactly, that absence is not a flaw in the method, it is the definition of a limit working as intended.',
  ARRAY[
    'why isn''t the very first reading, at the biggest gap, good enough?',
    'so is 1.0050 the actual slope, or is it still just close?',
    'why do we trust the number the chord is heading toward instead of any number it actually shows?',
    'does the settling number belong to the chord or to the point P?',
    'if the readout never lands exactly on the answer, how do we know what the answer even is?'
  ],
  'pending_review'
),
-- ─── STATE_4 — at h = 0 there is no chord ───────────────────────────────
(
  'why_cant_we_just_plug_in_zero',
  'derivative_as_secant_limit',
  'STATE_4',
  'Why can''t I just put h equal to zero into the formula and get the answer directly?',
  'Substituting h = 0 makes the numerator f(x-naught+0) minus f(x-naught) equal exactly zero, because the two points have become one and the same point — there is no climb left to measure. It ALSO makes the denominator h equal exactly zero, because the gap itself has closed. Zero divided by zero is not a number the arithmetic of division defines; division by zero is excluded from ordinary arithmetic precisely because it does not produce a consistent answer. This is not a special defect of this particular curve — every difference quotient, for every function, hits this same 0/0 wall at h = 0, because the quotient''s own construction requires two distinct points. The formula that works perfectly at every h greater than zero simply stops being a valid expression exactly at h = 0, which is why the limiting VALUE has to be found by watching where the quotient is heading as h approaches zero, never by evaluating the quotient there.',
  ARRAY[
    'why can''t I just put h equals zero into the formula and get the answer directly?',
    'the top and bottom both go to zero — doesn''t that just cancel out to a normal number?',
    'in every other formula plugging in a value works, so why not here?',
    'isn''t zero divided by zero technically just zero?',
    'if the formula breaks at h equals zero, how can the slope AT that point even exist?'
  ],
  'pending_review'
),
(
  'what_does_undefined_actually_mean',
  'derivative_as_secant_limit',
  'STATE_4',
  'If something is undefined, doesn''t that just mean it''s a really big number, or maybe zero?',
  'Undefined means the expression names no number at all — not a large number, not zero, not infinity, just an absence of any single value the arithmetic can settle on. Zero over zero is different from a nonzero number over zero (which trends toward infinity as the denominator shrinks) and different from zero over a nonzero number (which genuinely is zero): in the 0/0 case, the ratio''s behaviour depends entirely on HOW the numerator and denominator are approaching zero together, and different functions approaching 0/0 can settle on completely different ratios. That is exactly why the limit has to be computed from the surrounding behaviour of the quotient, not read off the single broken point. And ''undefined at h = 0'' does not mean the curve has no slope at the point — the curve is perfectly smooth there. It means this one particular calculation method breaks down at that exact input, while the slope itself is recovered by the limiting process the next few states complete.',
  ARRAY[
    'is ''undefined'' the same as saying the slope is zero?',
    'if something is undefined, doesn''t that just mean it''s a really big number?',
    'why is zero over zero different from just being zero, or just being infinite?',
    'does undefined mean the curve has no slope there at all?',
    'why does two points becoming one point break the whole calculation?'
  ],
  'pending_review'
),
(
  'limit_as_a_target_not_a_value_there',
  'derivative_as_secant_limit',
  'STATE_4',
  'If the value never actually happens at h equals zero, how can we call it the answer?',
  'A limit is defined as the number a quantity approaches, and mathematics accepts that definition as complete — it does not additionally require the value to be reached at the excluded point. This is not a lowered standard; it is what makes the derivative exist at all for curves like this one, where the direct calculation is undefined exactly at the point in question. The chord slopes get closer and closer to 1.0000 with no floor to how close they can get, and that no-floor property is exactly what ''the limit is 1'' is defined to mean — it is not a guess about a nearby value, it is a precise, checkable claim about how close every sufficiently small gap gets. And the claim is checked from BOTH sides: gaps approaching from the left (negative h) and from the right (positive h) are both tracked, and the limit is only trusted when both sides agree on the same target number, which they do here at every point this curve is smooth.',
  ARRAY[
    'if the value never actually happens at h equals zero, how can we call it the answer?',
    'isn''t a limit just a guess about what the number would be?',
    'why do we trust a number the chord never actually reaches?',
    'how is ''the values were getting closer to 1.0000'' different from just saying it equals 1.0000?',
    'does the limit change if we approach from the other side, with h negative?'
  ],
  'pending_review'
),
-- ─── STATE_5 — the tangent: one line remains ────────────────────────────
(
  'does_the_chord_become_the_tangent',
  'derivative_as_secant_limit',
  'STATE_5',
  'At some point doesn''t the chord just turn into the tangent line?',
  'No — however small the gap gets, the chord still connects two DIFFERENT points, and a line through two distinct points on a curve is a different geometric object from the line that touches the curve at exactly one point with a matching slope. What changes is not the chord''s identity but its slope, which gets closer and closer to the tangent''s slope without the two lines ever becoming the same line at any finite gap. On screen the two lines can become impossible to tell apart — at the state''s own numbers they sit under a pixel apart — but the numbers keep them distinct: the chord''s slope reads 1.0020 while the tangent''s reads 1.0000, a real, measurable difference that persists no matter how small the gap gets. The picture merging is a fact about how the eye reads a plane full of pixels; the numbers refusing to merge is a fact about the actual mathematics, and the numbers are the ones to trust.',
  ARRAY[
    'if the lines look exactly the same, why do we say they''re two different lines?',
    'at some point doesn''t the chord just turn into the tangent line?',
    'why do the numbers matter if the picture already shows one line?',
    'how can two lines be different if I genuinely cannot see any gap between them?',
    'is the tangent just the chord at the smallest possible h?'
  ],
  'pending_review'
),
(
  'why_a_new_line_at_all',
  'derivative_as_secant_limit',
  'STATE_5',
  'If the slope number already tells us the answer, why do we need to draw a tangent line at all?',
  'The number alone answers ''how steep'', but the tangent line answers a second question the number cannot: ''what does the curve look like, locally, right at this point''. Near the point of tangency the curve and its tangent line are nearly indistinguishable — the tangent is the best straight-line approximation to the curve at that exact spot, which is a genuinely useful geometric fact with no single number attached to it. The tangent is drawn touching the curve at exactly one point in this state''s picture because that is a consequence of it having exactly the LIMITING slope, not an assumption built in by hand — a line through the same point with any other slope would visibly cross the curve rather than hug it. So the line and the number are answering related but different questions: the number is the rate, the line is the local shape the rate describes.',
  ARRAY[
    'if the slope number already tells us the answer, why do we need to draw a whole tangent line?',
    'what does the tangent line actually add that the number by itself doesn''t?',
    'is the tangent line just there to look nice, or does it mean something specific?',
    'why is the tangent drawn touching only at P and nowhere else nearby?',
    'could there be more than one line with the same slope through P?'
  ],
  'pending_review'
),
(
  'what_makes_tangent_special',
  'derivative_as_secant_limit',
  'STATE_5',
  'What actually makes a line ''the'' tangent, instead of just some line through the point?',
  'What makes it THE tangent, and not merely a line through the point, is that its slope is defined as the specific number every chord''s slope is converging toward as the second point slides in — no other slope earns that title. Infinitely many lines pass through one point with every other possible slope, and each of those would visibly cross the curve near the point rather than hug it on both sides the way the true tangent does. This is close to, but not identical with, the tangent-to-a-circle idea from earlier geometry, where ''touches at exactly one point and nowhere else'' was used as the DEFINITION; here that single-touch behaviour is a CONSEQUENCE of the limit definition rather than the starting point, which is also why this definition still works for curves where a line can touch at one point locally but cross the curve again somewhere else far away — the limit-of-chord-slopes definition never breaks, even where the touches-once test would mislead.',
  ARRAY[
    'what actually makes a line ''the'' tangent instead of just some line through P?',
    'why does the tangent only touch the curve at one point here, when curves can cross lines twice?',
    'is this the same idea as a tangent to a circle?',
    'if I picked a slightly different slope, would the line still look tangent to my eye?',
    'why can''t the tangent just be defined as the closest line to the curve near P?'
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
--    WHERE concept_id = 'derivative_as_secant_limit';
-- And that every cluster_id here appears in the concept JSON's drill_downs:
--   STATE_3 average_rate_vs_point_rate | does_it_ever_stop_changing | which_number_is_the_real_slope
--   STATE_4 why_cant_we_just_plug_in_zero | what_does_undefined_actually_mean | limit_as_a_target_not_a_value_there
--   STATE_5 does_the_chord_become_the_tangent | why_a_new_line_at_all | what_makes_tangent_special
