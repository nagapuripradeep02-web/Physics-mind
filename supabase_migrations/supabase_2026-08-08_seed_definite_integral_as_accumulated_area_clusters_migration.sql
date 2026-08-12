-- supabase_2026-08-08_seed_definite_integral_as_accumulated_area_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for
-- src/data/concepts/mathematics/definite_integral_as_accumulated_area.json —
-- the THIRD MATHEMATICS concept (NCERT Class 12 Mathematics, Chapter 7
-- "Integrals"; chapter:7, section:"Integrals"; prerequisites: []).
--
-- Authored 2026-08-08 by alex:json_author, using the mathematics_author's
-- drill-down trigger phrasings VERBATIM (docs/skeletons/
-- definite_integral_as_accumulated_area_mathematics_block.md §5 — 45
-- phrasings, 5 per cluster, written in genuine student voice):
--   STATE_3 — why_thinner_rectangles_are_closer, does_the_sum_have_a_ceiling,
--             rectangles_vs_the_smooth_region;
--   STATE_4 — approaching_is_not_reaching, what_a_limit_means_here,
--             why_define_it_as_a_limit;
--   STATE_5 — negative_area_meaning, signed_vs_total_area,
--             where_the_sign_flips.
--
-- label + description are json_author's own composition (the mathematics
-- block supplied only the trigger phrasings + a one-line prevention-rule-
-- style gloss), matching the shape of the derivative_as_secant_limit
-- precedent migration, which this file mirrors byte-for-byte in structure.
--
-- The three states are exactly the concept's has_prebuilt_deep_dive picks
-- (architect skeleton §5): STATE_3 (the PRIMARY aha — refinement toward
-- n = 1000), STATE_4 (the limit — the hardest idea here; M1) and STATE_5
-- (the sign convention; the most common exam error; M2). Each carries a
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
-- ─── STATE_3 — more rectangles, closer sum (PRIMARY AHA) ────────────────
(
  'why_thinner_rectangles_are_closer',
  'definite_integral_as_accumulated_area',
  'STATE_3',
  'Why does making the rectangles thinner make the total more accurate?',
  'Each rectangle''s own error is the small sliver between its flat top and the curve above it — the difference between the curve''s true height across that strip and the single left-edge height the rectangle borrowed for the whole strip. Making a rectangle thinner shrinks that sliver two ways at once: the strip itself is narrower, so there is less horizontal room for the curve to rise before the strip ends, AND the curve barely changes height at all over a narrower strip, so the borrowed left-edge height is a much better stand-in for every point inside it. With n rectangles the total error is n slivers added together, but each sliver has shrunk faster than their count has grown — that trade-off is exactly what the closed formula for the gap proves algebraically, not just observes visually: the total error behaves like 4/n, which shrinks toward zero as n grows without bound, even though there are more and more slivers being summed.',
  ARRAY[
    'why does making the rectangles thinner make the total more accurate?',
    'if four rectangles were already close, why do we even need a thousand?',
    'does thinner always mean better, or could it go wrong somehow?',
    'how thin do the rectangles have to get before the answer stops changing?',
    'why does adding more pieces fix the gaps instead of just adding more error?'
  ],
  'pending_review'
),
(
  'does_the_sum_have_a_ceiling',
  'definite_integral_as_accumulated_area',
  'STATE_3',
  'Does the sum ever stop growing, or does it just keep climbing forever?',
  'For this left-sum sequence on an increasing curve, the sum does keep climbing as n grows — the left sum under-estimates the true area at every finite n, and refining the partition always recovers a little more of the missed slivers, never gives some of it back. But "keeps climbing" is not the same as "climbs without bound": it climbs toward a ceiling, the exact integral, and gets closer to that ceiling by ever-smaller amounts, the way the closed-form gap (4/n − 4/(3n²)) itself shrinks toward zero. Nothing about the arithmetic could ever push the sum past that ceiling, because every rectangle''s height is borrowed directly from the curve itself and can never overshoot the curve''s own true value inside its strip. The sum is not oscillating and not overshooting — it is rising along one smooth path toward one fixed number, and the exact-gap formula is the proof that the path really does have a limit rather than only appearing to.',
  ARRAY[
    'does the sum ever stop growing, or does it just keep climbing forever?',
    'how do we know the number is settling and not still slowly rising?',
    'could the sum overshoot the real answer and then come back down?',
    'is there a highest possible value the sum can reach?',
    'what stops the sum from just growing without any limit?'
  ],
  'pending_review'
),
(
  'rectangles_vs_the_smooth_region',
  'definite_integral_as_accumulated_area',
  'STATE_3',
  'The rectangles have flat tops and the curve is round — how can they ever be the same shape?',
  'At any finite n the rectangles genuinely are NOT the same shape as the region — their flat tops always leave a visible gap under a rising curve, and no finite count of flat-topped rectangles can trace a curved boundary exactly. What converges is not the SHAPE but the AREA: the total space enclosed by the rectangles gets arbitrarily close to the total space enclosed by the curve, even while the rectangles'' corners keep poking out or falling short at every scale you zoom into. This is why the definition is stated as a limit of a NUMBER (the summed area), never as a limit of a picture — the exact area is defined as the one number every rectangle-count''s total is heading toward, and that number is reached in the limit even though the jagged rectangle silhouette itself is never literally replaced by a smooth curve at any finite n.',
  ARRAY[
    'the rectangles have flat tops and the curve is round — how can they ever be the same shape?',
    'even with a thousand rectangles, isn''t there still a tiny gap along the top?',
    'why do blocky shapes end up equalling a smooth curved area?',
    'if I could zoom in forever, would I still see the rectangle corners?',
    'is the region actually made of rectangles, or do the rectangles just estimate it?'
  ],
  'pending_review'
),
-- ─── STATE_4 — the gap shrinks, never zero ──────────────────────────────
(
  'approaching_is_not_reaching',
  'definite_integral_as_accumulated_area',
  'STATE_4',
  'If the gap never becomes exactly zero, how can we say we know the exact area?',
  'The exact area is not defined as "whatever number the gap eventually becomes" — it is defined as the number the sum is APPROACHING, and that target number is pinned down completely even though no finite rectangle count ever lands on it. The gap formula, 4/n minus 4/(3n²), is exact and strictly positive at every integer n, so the picture genuinely never reaches the target at any finite stopping point — but the formula also proves the gap shrinks toward zero with no floor, and a quantity that gets arbitrarily small with no floor other than zero itself has exactly one honest description: it is heading to zero. Knowing the exact area does not require any rectangle count to touch it; it requires knowing, with certainty from the formula, that the gap can be forced smaller than any distance you name by choosing n large enough — that certainty is what "knowing the exact value" means here.',
  ARRAY[
    'if the gap never becomes exactly zero, how can we say we know the exact area?',
    'isn''t ''never reaching zero'' the same as ''never actually finding the answer''?',
    'how small does the gap have to get before we can just call it zero?',
    'why can''t we just say the gap is basically zero once it''s really small?',
    'does the gap ever jump back up, or does it only ever shrink?'
  ],
  'pending_review'
),
(
  'what_a_limit_means_here',
  'definite_integral_as_accumulated_area',
  'STATE_4',
  'What does "the limit" actually mean if no rectangle count ever gets there?',
  'A limit is the number a sequence of values gets arbitrarily close to as its index grows without bound — it is a precise, checkable claim about the whole infinite sequence of sums, not a rounded-off guess about the closest one anyone actually computed. Here that claim is checkable because the gap has a closed exact form: for any distance you name, however small, the formula 4/n minus 4/(3n²) tells you exactly how large n must be to force the gap under that distance, and that guarantee holds for every distance, not just a convenient one. That is a fundamentally different kind of statement from "the biggest n we tried was close," which is only ever a report about one finite calculation. The exact integral is trusted precisely because the algebra, not a picture or a spreadsheet, proves the gap can be forced below anything positive — no finite computation could ever supply that certainty on its own.',
  ARRAY[
    'what does ''the limit'' actually mean if no rectangle count ever gets there?',
    'is the limit just a rounded version of the closest number we can compute?',
    'why do we trust a number that no finite calculation ever produces exactly?',
    'how is a limit different from just a really good approximation?',
    'does the limit depend on which side we approach n from?'
  ],
  'pending_review'
),
(
  'why_define_it_as_a_limit',
  'definite_integral_as_accumulated_area',
  'STATE_4',
  'Why not just define the area as whatever a huge number of rectangles gives?',
  'Picking "a huge number of rectangles" instead of a genuine limit sounds practical, but it quietly smuggles in an arbitrary choice — a million rectangles gives one number, a billion gives a slightly different one, and nothing in "just pick a big n" says which of those competing numbers deserves to be called THE area. Skipping the limit and using n equals a million gives an estimate that is still off by the closed-form gap at that n, however small, and offers no guarantee about how much better a bigger choice would be. Defining the area as the limit removes the arbitrariness entirely: it names the ONE number every sufficiently large n converges toward, independent of which particular large n a calculator happens to use, and the exact gap formula is what makes that number provable rather than merely observed. This is not a technicality — it is the only definition under which "the area" means the same fixed thing no matter who computes it or how far they choose to refine the partition.',
  ARRAY[
    'why not just define the area as whatever a huge number of rectangles gives?',
    'what goes wrong if we skip the limit and use n equals a million instead?',
    'is defining it as a limit just a technicality, or does it actually matter?',
    'why does the formula for the gap matter if the picture already looks the same?',
    'couldn''t we define the area some other way that avoids limits entirely?'
  ],
  'pending_review'
),
-- ─── STATE_5 — below the axis counts negative ───────────────────────────
(
  'negative_area_meaning',
  'definite_integral_as_accumulated_area',
  'STATE_5',
  'How can an area be negative if area is just a size?',
  'A plain geometric area — a size, measured in square units — is indeed never negative, and the region below the axis is still a real, positive-sized patch of the plane; it does not shrink or disappear when the curve dips below zero. What goes negative is a DIFFERENT quantity: the signed total the definite integral computes, which is built by letting each rectangle''s contribution carry the sign of the curve''s own height at that point. Below the axis the curve''s height is a negative number, so the rectangle''s "area" (height times width) is recorded as a negative number too — not because the patch of plane has negative size, but because the integral is bookkeeping direction as well as size, the same way a signed distance below sea level is a real, positive-length drop recorded with a negative number. The two quantities — the unsigned total area and the signed integral — are both legitimate, both computed here, and both shown side by side precisely so neither is mistaken for the other.',
  ARRAY[
    'how can an area be negative if area is just a size?',
    'does the region below the axis actually disappear, or is it still there?',
    'is ''negative area'' just a way of keeping score, not a real area?',
    'why does going below the axis flip the sign instead of just measuring the same way?',
    'if I flip the picture upside down, does the negative area become positive?'
  ],
  'pending_review'
),
(
  'signed_vs_total_area',
  'definite_integral_as_accumulated_area',
  'STATE_5',
  'What''s the difference between the total area and the answer the integral gives?',
  'The total (unsigned) area adds up the SIZE of every patch of the plane between the curve and the axis, treating a patch below the axis exactly the same as a patch above it — it answers "how much plane surface is enclosed altogether". The integral''s signed total instead adds up each patch''s size with its own sign attached, so a patch below the axis SUBTRACTS from the running total instead of adding to it — it answers a different question: "how much does the curve accumulate, net, allowing a dip below the axis to cancel part of a rise above it". Both numbers are computed from the exact same picture and both are genuinely useful, but for different jobs: the unsigned total is what a painter estimating how much surface to cover would want, while the signed integral is what a quantity that can trend backward — like net displacement, or net profit after a loss — actually needs. Neither number is "more correct" than the other; they simply answer different questions about the same curve.',
  ARRAY[
    'what''s the difference between the total area and the answer the integral gives?',
    'why would anyone want the signed answer instead of the actual amount of area?',
    'if both numbers describe the same picture, why do they disagree?',
    'which of the two numbers is the ''real'' one — the total or the signed total?',
    'does every problem need both numbers, or only some of them?'
  ],
  'pending_review'
),
(
  'where_the_sign_flips',
  'definite_integral_as_accumulated_area',
  'STATE_5',
  'How does the formula know exactly where the curve crosses the axis?',
  'The sign is decided rectangle by rectangle, purely from the curve''s own height at each rectangle''s sample point — no separate step "finds" the crossing in advance, the crossing simply falls out of where the sampled height first turns negative. A rectangle straddling the crossing samples its height at one specific point (its left edge, for the left rule used here), so it is coloured entirely by the sign at THAT point, even though the true curve inside its strip crosses zero somewhere in between — this is a small, honest approximation, exactly like every other rectangle''s flat-top approximation, and it shrinks away as the rectangles get thinner and the crossing gets pinned down more precisely by whichever rectangle happens to straddle it. The sign does not flip gradually across one rectangle; each rectangle is simply positive or negative as a whole, and the flip becomes sharper and better-located as n grows, converging on the curve''s own exact crossing point in the limit.',
  ARRAY[
    'how does the formula know exactly where the curve crosses the axis?',
    'what happens to the rectangles right at the point where the curve crosses zero?',
    'does the sign flip suddenly at one point, or does it happen gradually?',
    'if the curve barely dips below the axis, does the sign still flip?',
    'why does one crossing point change the sign of an entire rectangle?'
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
--    WHERE concept_id = 'definite_integral_as_accumulated_area';
-- And that every cluster_id here appears in the concept JSON's drill_downs:
--   STATE_3 why_thinner_rectangles_are_closer | does_the_sum_have_a_ceiling | rectangles_vs_the_smooth_region
--   STATE_4 approaching_is_not_reaching | what_a_limit_means_here | why_define_it_as_a_limit
--   STATE_5 negative_area_meaning | signed_vs_total_area | where_the_sign_flips
