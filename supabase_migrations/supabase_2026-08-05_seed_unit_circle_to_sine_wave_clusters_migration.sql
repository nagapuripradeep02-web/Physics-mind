-- supabase_2026-08-05_seed_unit_circle_to_sine_wave_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for
-- src/data/concepts/mathematics/unit_circle_to_sine_wave.json — the FIRST
-- MATHEMATICS concept (NCERT Class 11 Mathematics Ch.3, Trigonometric
-- Functions; chapter:3, section:"3.1"; prerequisites: []).
--
-- Authored 2026-08-05 by alex:json_author, using the mathematics_author's
-- drill-down trigger phrasings VERBATIM (docs/skeletons/
-- unit_circle_to_sine_wave_mathematics_block.md §5 — 45 phrasings, 5 per
-- cluster, written in genuine student voice):
--   STATE_2 — radian_vs_degree, arc_length_equals_angle, why_pi_appears_on_the_axis;
--   STATE_4 — wave_is_not_the_path, x_axis_is_angle, height_to_graph_mapping;
--   STATE_5 — cosine_phase_shift, cosine_starts_at_one, sin_cos_same_circle.
--
-- The three states are exactly the concept's has_prebuilt_deep_dive picks
-- (architect skeleton §5): S2 (radian measure — perennial multi-phrasing
-- confusion), S4 (the PRIMARY aha; axis-is-angle confusions) and S5 (the
-- cos/sin phase relationship). Each carries a drill_downs array in the concept
-- JSON referencing these cluster_ids.
--
-- WHY THIS FILE EXISTS: scar confusion_cluster_registry_unseeded_for_concept
-- (CRITICAL/FIXED) makes the seeding migration a NAMED json_author deliverable,
-- recorded in skeleton §6 and §10(f). It was missing from the first build-gate
-- pass and caught by quality_auditor on 2026-08-05.
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
-- ─── STATE_2 — radian measure ──────────────────────────────────────────
(
  'radian_vs_degree',
  'unit_circle_to_sine_wave',
  'STATE_2',
  'Why do we need radians at all when degrees already work?',
  'Degrees are an arbitrary human choice: 360 was picked because it divides neatly, not because a circle knows anything about it. A radian is not arbitrary — it is defined by the circle itself. Sweep an angle until the distance travelled along the rim equals the radius, and that angle is one radian, on every circle of every size. That is why the unit circle makes the whole idea visible: with r = 1 the rim distance and the angle are literally the same number, so the counter reads the same value twice. Converting is then not a formula to memorise but a statement about one full turn: going all the way round covers a rim distance of 2 pi radius-lengths, and the same turn is 360 degrees, so 2 pi radians and 360 degrees name the same rotation.',
  ARRAY[
    'why do we need radians when degrees already work fine',
    'what even is one radian, like what does it actually look like',
    'is a radian a made-up unit or does it mean something real',
    'why does pi keep showing up if radians are supposed to be simpler than degrees',
    'how do I convert between degrees and radians without just memorizing a formula'
  ],
  'pending_review'
),
(
  'arc_length_equals_angle',
  'unit_circle_to_sine_wave',
  'STATE_2',
  'Why is the arc length the same number as the angle? Is that a coincidence?',
  'It is not a coincidence, and it is not general either — it is true precisely because the radius is 1. Arc length on any circle is s = r times the angle in radians. Set r = 1 and the multiplication disappears, leaving s = theta. On a circle of radius 3 the same angle sweeps three times the rim distance, so the two numbers part company immediately. This is exactly why the unit circle is the circle mathematics chose to build trigonometry on: it is the one radius at which the angle and the distance it sweeps are the same quantity, so a single counter on screen can be read as either. Going all the way round gives 2 pi and not some other number because 2 pi r IS the circumference, and r is 1.',
  ARRAY[
    'why is the arc length the same number as the angle, that feels like a coincidence',
    'does this only work because the radius is exactly 1',
    'if the circle were bigger would the arc length still equal the angle',
    'so is a radian just the angle where the arc length matches the radius',
    'why does going all the way around give exactly 2 pi and not some other number'
  ],
  'pending_review'
),
(
  'why_pi_appears_on_the_axis',
  'unit_circle_to_sine_wave',
  'STATE_2',
  'Why is the graph axis marked in pi instead of ordinary numbers?',
  'The marks pi/2, pi, 3pi/2 and 2pi on the wave axis are ANGLES measured in radians, not lengths and not areas. They look unusual only because the natural unit of angle happens to be irrational. Labelling the same axis 90, 180, 270, 360 would be equally true and is what some syllabuses do — the sim shows both, radians on the axis and degrees parenthesised in the readout, so neither dialect is a foreign language. Pi enters for one geometric reason and one only: a half turn sweeps a rim distance of pi radius-lengths, because the circumference of a radius-1 circle is 2 pi. Every pi on that axis is therefore a distance travelled around the rim, converted into the angle it subtends.',
  ARRAY[
    'why is the x-axis measured in pi instead of normal numbers',
    'what does ''pi over 2'' even mean as a position on the axis',
    'is pi a length here or an angle, I keep mixing them up',
    'why not just label the axis 90, 180, 270, 360 like degrees',
    'where does the number pi actually come from in this circle'
  ],
  'pending_review'
),
-- ─── STATE_4 — the unroll (PRIMARY aha) ────────────────────────────────
(
  'wave_is_not_the_path',
  'unit_circle_to_sine_wave',
  'STATE_4',
  'Is the wavy graph just the circle stretched out flat?',
  'No — and the sim keeps both objects on screen at once precisely so the difference stays visible. The point''s PATH is the closed circle, and it never stops being a circle: the point returns to where it began every single turn. The wave is not a path at all, it is a PLOT — a record of one number (the height) against another number (the angle). Nothing physically travels along the wave. The horizontal axis of the graph is not a direction the point moves in; it is how far round the point has turned. That is why the wave runs off to the right forever while the point keeps circling in the same small patch of screen: the plot has a new place to put every new angle, and the circle does not.',
  ARRAY[
    'isn''t the wavy graph just the circle stretched out flat',
    'so the point never actually moves like a wave, it''s always going in a circle',
    'what is the sideways axis on the graph measuring if it''s not distance',
    'why does the wave look like it''s moving right when the point is just going in circles',
    'is the curvy line the point''s real path or is it something else completely'
  ],
  'pending_review'
),
(
  'x_axis_is_angle',
  'unit_circle_to_sine_wave',
  'STATE_4',
  'What is the bottom axis of the wave graph — time, or the angle?',
  'The angle. This matters more than it first appears, because a sine wave met later in physics usually does have time on that axis, and the two readings get fused. Here the horizontal position means one thing: how far the point has turned, measured in radians. Moving right on the graph is the same act as spinning the point further round the circle. Nothing about the graph would change if the point turned faster or slower — the same angle always lands at the same horizontal position, because the axis measures the angle and not the clock. Speed would change how quickly the curve is DRAWN, never its shape. Distance along the ground appears nowhere in this picture at all.',
  ARRAY[
    'what is on the bottom axis of the wave graph, is it time or the angle',
    'why does the horizontal position on the graph mean the same thing as the angle on the circle',
    'so the wave has nothing to do with distance along the ground',
    'why does moving right on the graph match spinning the point further round',
    'if the point went faster would the graph''s x-axis change, or is it still just the angle'
  ],
  'pending_review'
),
(
  'height_to_graph_mapping',
  'unit_circle_to_sine_wave',
  'STATE_4',
  'How does the point''s up-down position on the circle become a point on the flat graph?',
  'One quantity is carried across and one only: the signed height of the point above the horizontal diameter. The dashed line on screen is that carry made visible — it runs horizontally, so both ends sit at exactly the same height, which is the entire claim of the state. The pen on the wave is placed at that same height, at a horizontal position given by the current angle. Nothing else crosses over: not the horizontal distance, not the speed, not the position along the rim. The curve dips below the line whenever the point is in the lower half of the circle, because the height is genuinely negative there. On a circle of a different radius every height would scale together, which is amplitude — a separate lesson this concept deliberately does not teach.',
  ARRAY[
    'how does the up-down position on the circle turn into a point on the flat graph',
    'why do the point and the dot on the wave always sit at the same height',
    'what exactly gets carried over sideways to make the wave, the height or something else',
    'does the wave curve get taller if the circle is bigger',
    'why does the wave dip below the line when the point is in the bottom half'
  ],
  'pending_review'
),
-- ─── STATE_5 — cosine ──────────────────────────────────────────────────
(
  'cosine_phase_shift',
  'unit_circle_to_sine_wave',
  'STATE_5',
  'Why is cosine the same wave as sine, just shifted along?',
  'Because the two are the same measurement taken in directions a quarter turn apart. Sine reads the point''s height; cosine reads its horizontal distance. Rotate the whole picture by a quarter turn and height becomes horizontal distance, so the two curves must be the same shape displaced by exactly that quarter turn — pi/2 in radians, 90 degrees. The amount never changes and cannot: it is fixed by the right angle between the two directions being measured, not by anything about the particular circle or the particular angle. Shifting sine left by a quarter turn gives cosine because it re-labels every angle as the angle a quarter turn earlier, which is precisely the swap between the two readings.',
  ARRAY[
    'why is cosine the same wave as sine but just shifted over',
    'how much is cosine actually shifted from sine, is it exactly a quarter turn',
    'if sine and cosine come from the same circle, why do they look different on the graph',
    'does the shift between sine and cosine ever change or is it always the same amount',
    'why does shifting sine over turn it into cosine'
  ],
  'pending_review'
),
(
  'cosine_starts_at_one',
  'unit_circle_to_sine_wave',
  'STATE_5',
  'Why does cosine start at 1 when sine starts at 0?',
  'Look at where the point actually is when the angle is zero: at the rightmost point of the circle, level with the centre. Its HEIGHT above the horizontal line is zero, so sin 0 = 0. Its HORIZONTAL DISTANCE from the centre is the full radius, so cos 0 = 1. Both readings are taken at the same instant, at the same point — they differ because they measure different directions. The expectation that both must start at zero comes from reading "0" as "nothing has happened yet", but the angle being zero says only that the point has not turned; it says nothing about how far right it is. Cosine never starts at 0 on the unit circle, at any angle where the point is farthest right.',
  ARRAY[
    'why does cosine start at 1 when sine starts at 0, don''t they come from the same point',
    'at angle zero, why is the point all the way to the right instead of at the top',
    'so cos of 0 is 1, but doesn''t 0 usually mean nothing, why is it the biggest value',
    'does cosine ever start at 0 like sine does',
    'why does everyone assume both waves start at zero, where does that idea even come from'
  ],
  'pending_review'
),
(
  'sin_cos_same_circle',
  'unit_circle_to_sine_wave',
  'STATE_5',
  'If sine and cosine both come from one circle, why are there two functions?',
  'Because locating a point on a plane needs two numbers, and these are those two numbers. Sine gives the vertical coordinate, cosine the horizontal one; together they say exactly where the point is, and neither alone does. They are permanently linked because they describe one point: the two lengths are the legs of a right triangle whose hypotenuse is the radius, so on the unit circle they always satisfy sin squared plus cos squared equals 1, at every angle without exception. You can obtain cosine from sine by shifting a quarter turn, so in a sense one function would do — but keeping both means each is read directly off the picture in its own direction, with no mental rotation in the way.',
  ARRAY[
    'if sine and cosine both come from the same circle, why do we need two separate functions',
    'does the circle prove that sine and cosine are basically the same thing',
    'why does one direction give sine and the other gives cosine',
    'is there a way to get cosine directly from sine''s formula instead of drawing it separately',
    'why do sine and cosine always seem to be connected no matter what angle you pick'
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
--    WHERE concept_id = 'unit_circle_to_sine_wave';
-- And that every cluster_id here appears in the concept JSON's drill_downs:
--   S2 radian_vs_degree | arc_length_equals_angle | why_pi_appears_on_the_axis
--   S4 wave_is_not_the_path | x_axis_is_angle | height_to_graph_mapping
--   S5 cosine_phase_shift | cosine_starts_at_one | sin_cos_same_circle
