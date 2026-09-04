# Independent examiner's report — the 56 vector cards of commit `c0942ca1`

**Corpus:** the 16 `ts_ipe_m1a_vec_*` (Addition of Vectors) and 40 `ts_ipe_m1a_pv_*` (Product of
Vectors) cards added by `c0942ca1 feat(answer-book): the 317 missing Maths-1A/1B questions, authored`.
List derived from `git show HEAD --name-only`, 56 files, no pre-existing vector card included.

**Method:** every card re-derived from its `question_text` only. No card's `verification.note` was
read as evidence — the notes were read only to check *provenance claims*, never to confirm a number.
Report only; no file in the repo was modified except this one.

---

## 1. Tally by band

| Band | Count | Cards |
|---|---|---|
| **WRONG** (mathematics incorrect on any line) | **0** | — |
| **MISLEADING** (defensible but teaches something false; wrong `common_mistakes` bullet; circular proof) | **0** | — |
| **THIN** (correct but omits a step or condition) | **1** | `ts_ipe_m1a_vec_circumcentre_orthocentre_sum` |
| **CLEAN** | **55** | listed in §4 |

Zero cards are mathematically wrong. That is a different result from the comparable run recorded in
`docs/patterns/answer_book.md` (7 of 271 wrong), and I treated it as a reason to check my own
checking rather than to relax — see §6 for the negative control I ran on myself, which caught one
error I had made and none the cards had.

Structural arithmetic was also machine-checked across all 56: `sum(step.marks) == marks_total`,
`sum(mark_split.marks) == marks_total`, one `mark_split` row per paid step, `qtype`↔marks
(VSAQ 2 / SAQ 4 / LAQ 8 — the 2026-27 60-mark Maths-1A shape), a `boxed` final line on every card,
and `margin_note` + `memory_tip` present on every step. **Zero flags.** `expected_time_min` is
uniform per type (VSAQ 4, SAQ 9, LAQ 14) with no drift. No duplicate `question_text` against any
card already in the bank (checked normalised against the whole `answer-book/questions/` directory).

---

## 2. Findings table

| Card | Line | What it says | What it should say | Evidence |
|---|---|---|---|---|
| `ts_ipe_m1a_vec_circumcentre_orthocentre_sum` — **THIN** | `s4_conclude`, the step's `why` | "The orthocentre is defined as the common point of the altitudes, **so a point proved to lie on two of them has to be it.**" (and the step line "Two altitudes meet at one point only, and that point is the orthocentre H.") | The inference needs the concurrency theorem, which the card never names. From the *definition* alone, a point on two altitudes need not be on the third; it follows only because the three altitudes **are** concurrent — i.e. because the orthocentre exists. One clause fixes it: "the three altitudes are concurrent (proved separately), so the point where two of them cross is the orthocentre." The sibling card `ts_ipe_m1a_pv_altitudes_concurrent` proves exactly this and could be cited. | The proof's own maths is sound: with `OP = OA+OB+OC`, `AP = OB+OC = 2·OD` (D the midpoint of BC), `|OB|=|OC|` makes OBC isosceles so `OD ⊥ BC`, hence `AP ⊥ BC`; same at B. Both altitude conclusions verified. Only the last inferential step is short. Secondary omission on the same card: in a right-angled triangle (say ∠A = 90°) the circumcentre O **is** the midpoint D of BC, so `OD = 0`, `AP = 0`, and "AP is parallel to OD" is undefined — the conclusion `P = H = A` is still true but is not reached by the printed argument. |

Not graded as MISLEADING because the mathematics is correct, the conclusion is correct, and the
elision is the one every board answer makes; graded THIN rather than CLEAN because the `why` field —
which exists precisely to carry the reasoning — states a general principle that is false as written.

**No wrong `common_mistakes` bullet was found.** Every bullet on all 56 cards was read back against
its own step's marked lines (recipe item 10). Five bullets that looked wrong on first reading turned
out to be right — those are in §5.

---

## 3. Domain checks actually run

**(1) Every cross product dotted with both inputs — 13 of 13 give exactly 0.** Machine-recomputed
from `question_text` components, not read off the card:

| Card | `a × b` recomputed | `(a×b)·a` | `(a×b)·b` |
|---|---|---|---|
| `pv_cross_and_unit_normal_2i3j5k` | (−26, −9, 5) | 0 | 0 |
| `pv_parallelogram_area_2i3j_3ik` | (3, 2, 9) | 0 | 0 |
| `pv_unit_normal_ijk_and_2ij3k` | (2, −1, −1) | 0 | 0 |
| `pv_vector_magnitude_root6_perpendicular` | (3, 3, 6) | 0 | 0 |
| `pv_triple_cross…` inner `b×c` | (1, 3, 5) | 0 | 0 |
| `pv_triple_cross…` outer `a×(b×c)` | (−1, −8, 5) | 0 | 0 |
| `pv_verify_triple_product_not_equal` `a×b` | (5, −5, 5) | 0 | 0 |
| `pv_verify_triple_product_not_equal` `(a×b)×c` | (−5, 15, 20) | 0 | 0 |
| `pv_plane_parallel_to_two_vectors` `b×c` | (2, 17, 8) | 0 | 0 |
| `pv_plane_through_three_points` `AB×AC` | (3, −9, 4) | 0 | 0 |
| `pv_box_product_i_minus_j_etc` `b×c` | (1, 1, 1) | 0 | 0 |
| `pv_parallelepiped_volume_coterminous` `b×c` | (−1, 5, 3) | 0 | 0 |
| `pv_coplanar_find_lambda…` `AC×AD` | (9, −7, 3) | 0 | 0 |

The named error class — a dropped minus on the j-component — appears **nowhere**. Every j-component
matches `−(a₁b₃ − a₃b₁)`. Two cards even carry the double-minus case the class predicts
(`pv_plane_parallel_to_two_vectors`, j = −(−5 − 12) = **+17**; `pv_vector_magnitude_root6`,
j = −(−2 − 1) = **+3**) and both get it right.

**(2) Scalar triple products expanded two ways.** Every card that computes a box product prints a
second route, and each second route agrees with the first *and* with my independent recomputation:
`box_product_i_minus_j` (determinant 0 = `(i−j)·(b×c)` 0); `coplanar_find_p_3ipj5k`
(`7p + 28` both ways); `coplanar_find_lambda_points_pyq2016` (`35 − 7λ` by row 1, by row 2, and a
third time via `AC×AD = (9,−7,3)` dotted with AB); `coplanar_combination_find_p` (`2p − 4` by row 1
and by column 1); `parallelepiped_volume_coterminous` (−11 both ways);
`parallelepiped_volume_lambda_16` (−4λ by row 1 and by column 3);
`simplify_cross_dot_expression` (12). Cyclic/swap signs checked on
`pv_box_product_sum_identity` ([b c a] = [c a b] = [a b c]) and
`pv_four_points_coplanar_box_identity` (one cyclic move + two swaps: [b c a] = [a b c],
[b a d] = −[a b d], [a c d] = −[c a d] — all three correct).

**(3) Volumes take the modulus.** `pv_parallelepiped_volume_coterminous` → `V = |−11| = 11` cubic
units, negative sign explained as edge order, not size. `pv_parallelepiped_volume_lambda_16` →
`|−4λ| = 4|λ| = 16` and **both** λ = ±4 given. `pv_tetrahedron_volume_general_formula` keeps the 1/6
and the modulus (`h = |c·(a×b)|/|a×b|`, with an explicit sentence on why the modulus is not
optional). No negative volume, no lost sixth, no tetrahedron/parallelepiped formula swap anywhere.

**(4) Vector triple product grouping.** `pv_lagrange_identity_cross_dot` uses
`b × (c × d) = (b·d)c − (b·c)d` — correct. `pv_triple_product_identity_second_form` proves
`a × (b × c) = (a·c)b − (a·b)c` component-by-component; I re-expanded the i component both sides:
LHS `a₂b₁c₂ − a₂b₂c₁ − a₃b₃c₁ + a₃b₁c₃`, RHS after the `a₁b₁c₁` cancellation
`a₂b₁c₂ + a₃b₁c₃ − a₂b₂c₁ − a₃b₃c₁` — identical. `pv_verify_triple_product_not_equal` states **both**
groupings correctly in its `why` fields and I checked both numerically:
`a×(b×c) = (a·c)b − (a·b)c = 1·b − 3·c = (−1,−8,5)` ✓, and
`(a×b)×c = (c·a)b − (c·b)a = 1·b − 7·a = (−5,15,20)` ✓ (c·a = 1, c·b = 7 both confirmed). The two
groupings genuinely give different vectors and the card says so.

**(5) Unit vectors / unit normals.** `pv_cross_and_unit_normal_2i3j5k` → 782/782 = 1, **±** present.
`pv_unit_normal_ijk_and_2ij3k` → 6/6 = 1, **±** present. `pv_vector_magnitude_root6_perpendicular`
→ |i+j+2k|² = 6 = (√6)², **±** present. `vec_vsaq_unit_vector_sum…` → (4,3,−2)/√29, 29/29 = 1 (no ±
required, and correctly absent — the question fixes one direction, the sum). Every unit-normal card
carries the ± with a written reason ("a plane has two sides").

**(6) Projections — direction and form.** The two cards that share the same pair
(a = i+j+k, b = 2i+3j+k) are mutually consistent and each names its form:
`pv_projection_vector_ijk_2i3jk` gives the **vector** projection of b on a, `((a·b)/|a|²)a = 2i+2j+2k`
(divides by |a|², keeps a) — correct. `pv_component_perpendicular_and_scalar` gives the **scalar**
component of b on a, `(a·b)/|a| = 6/√3 = 2√3` (divides by |a|, drops a) — correct — and separately
the vector component along a (2i+2j+2k) as the stepping stone to the perpendicular part
`b − 2a = j − k`, verified `(j−k)·(i+j+k) = 0`. Neither card projects the wrong vector onto the
wrong one; both print the contrast explicitly.

**(7) Planes — every containing point substituted back, every parallel direction dotted to 0.**

| Card | Point substitutions | Direction dots |
|---|---|---|
| `pv_plane_perpendicular_to_vector` → `4x+7y−4z−2=0` | (3,−2,−1): 12−14+4−2 = **0** | — |
| `pv_plane_parallel_to_given_plane` → `4x−12y−3z−32=0` | (2,−1,−4): 8+12+12−32 = **0** | normal reused unchanged ✓ |
| `pv_plane_parallel_to_two_vectors` → `2x+17y+8z+36=0` | A(3,−2,−1): 6−34−8+36 = **0** | b·n = 2−34+32 = **0**; c·n = 6+34−40 = **0** |
| `pv_plane_through_three_points` → `3x−9y+4z+25=0` | A: 6−27−4+25 = **0**; B: 12−45+8+25 = **0**; C: 9−54+20+25 = **0** | n·AB = **0**; n·AC = **0** |
| `pv_plane_through_line_of_intersection` → `r·(20i+23j+26k) = 69` | (1,1,1): 20+23+26 = **69** | contains the line: (20,23,26) = 14(1,1,1) + 3(2,3,4) and 14(6) + 3(−5) = 69 ✓ |
| `pv_distance_point_from_plane` → 13/7 | a·n = 12−15−6 = −9; |−9−4|/7 = **13/7** | — |

The last row of that table is where my own arithmetic slipped once (§6).

**(8) Negative cosines.** No card takes a modulus to force an acute angle.
`vec_direction_angles_two_points` keeps cos β = −2/3 and cos γ = −1/3 and says in words that a
negative cosine is an obtuse angle, "correct, not an error to be tidied away".
`pv_direction_cosines_3i6j2k` keeps cos β = −6/7, says β is obtuse, and lists
"Taking the modulus of cos β to make all three positive" as a *mistake*. Cards whose cosine comes
out positive (`pv_angle_between_combined_vectors` 48/69, `pv_dot_product_and_angle` 12/77,
`pv_sum_zero_angle_ab` 1/2) reach it naturally, with no modulus applied.

**(9) Coplanarity values substituted back — all give exactly 0.** p = 2 in
`coplanar_combination_find_p`; λ = 5 in `coplanar_find_lambda_points_pyq2016`; p = −4 in
`coplanar_find_p_3ipj5k`; all three recomputed as determinants and all three return **exactly 0**
(machine-checked, not "nearly"). `coplanar_combination_find_p` goes further and its margin note
claims the middle vector becomes `(3u + w)/2` at p = 2 — I checked that too:
`(3(a+b+c) + (−a+b+c))/2 = a + 2b + 2c`, which is exactly v at p = 2. Correct.

**(10) `common_mistakes` read back against their own step.** All 56 cards, every bullet. None names
a correct move as the error. Five near-misses in §5.

**(11) The figure card — `ts_ipe_m1a_pv_semicircle_right_angle`.** Coordinates read from
`answer.steps[s2_figure].figure.elements[]` and checked against the claim:

- Circle arc pair `M 66 100 A 74 74 … 214 100 …` → centre (140, 100), r = 74. Endpoint separation
  214 − 66 = 148 = 2r ✓.
- `diameter_ab` `M 66 100 L 214 100` passes through (140, 100) — it **is** a diameter, not an
  ordinary chord. This is the one thing a wrong picture would break, and it is right.
- `centre_dot` spans x = 138…142 at y = 100 → marks (140, 100) ✓; label **O** at (134, 122) sits on it.
- P at (103, 36): distance from the centre = √(37² + 64²) = **73.93** against r = 74 — P is on the
  circle to within 0.07 px (it is the 120° point, rounded to integers).
- The asserted right angle: PA = (−37, 64), PB = (111, 64), PA·PB = −4107 + 4096 = **−11**, i.e.
  cos = −0.0012, **∠APB = 90.07°**. The picture asserts the theorem it proves.
- `right_angle_mark` `M 97 46 L 107 52 L 113 42`: its corner (107, 52) lies on the angle bisector at
  P (bisector direction (0.259, 0.966), P + 16.5·that = (107.3, 51.9)); its two legs are parallel to
  PB and to PA respectively and are mutually perpendicular (dot = 0 exactly). The mark is at the
  right vertex, the right size, the right orientation.
- Labels A (46,108), B (220,108), P (84,28) each sit beside their own point, none overlapping.

**Proof cards checked for circularity (they are not circular):**

- `pv_altitudes_concurrent` — starts from *two* altitudes meeting at O, never assumes three do; s1
  even lists "Assuming all three altitudes already meet" as a mistake. Origin at O gives
  `a·(c−b) = 0` and `b·(a−c) = 0`; adding gives `(a−b)·c = 0`, i.e. `OC ⊥ AB`. Never quotes "the
  orthocentre". Verified line by line.
- `pv_perpendicular_bisectors_concurrent` — same shape, and s6 explicitly lists "Naming the point as
  the circumcentre and treating that as the proof" as a mistake. `(a+b)·(b−a) = |b|²−|a|²` and
  `(c+a)·(a−c) = |a|²−|c|²` both re-expanded and correct.
- `vec_centroid_position_vector_proof` — names G = (a+b+c)/3 as a *candidate* and tests it against
  the median, does not assume the medians concur; `AG = (b+c−2a)/3`, `AD = (b+c−2a)/2`,
  `AG = (2/3)AD` all verified, and the symmetry argument that puts G on the other two medians is
  valid.
- `vec_intercept_form_line_proof` — correctly warns that a and b here are *numbers*, states both are
  non-zero before dividing, and eliminates t; endpoint check t = 0 → A, t = 1 → B holds.
- `pv_tetrahedron_volume_general_formula` — derives 1/6 from `V = ⅓·base·height` rather than quoting
  it; the |a×b| cancellation is genuine.
- `pv_semicircle_right_angle` — excludes P = A and P = B before concluding, which is the condition
  most such proofs drop.
- `vec_orthocentre_ha_hb_hc_2ho` — *quotes* `OA+OB+OC = OH` but labels it as a standard prior result
  and supplies its reason in a bracket, so it is a citation, not an assumption smuggled in.

---

## 4. CLEAN list, with the checks named

**Addition of Vectors (15 clean of 16)**

| Card | Checks run |
|---|---|
| `vec_centroid_position_vector_proof` | OD = (b+c)/2; AG = (b+c−2a)/3; AD = (b+c−2a)/2; AG = (2/3)AD confirmed by direct division; ratio 2:1 correct; symmetry argument valid; non-circular |
| `vec_collinear_test_3a_minus4b_3c` | AB = −7a+9b−9c, AC = a−3b+3c recomputed coefficient-wise; λ = −7 (a) vs −3 (b) vs −3 (c) — genuinely inconsistent, so "not collinear" is right; the extra check BC = 8a−12b+12c is not a multiple of AC (8·AC = 8a−24b+24c ≠ BC) ✓ |
| `vec_collinear_test_a_minus2b_3c` | AB = a+5b−7c, AC = −a−5b+7c = −AB ✓; independent midpoint check OB+OC = 2a−4b+6c = 2·OA ✓ so A really is the midpoint of BC |
| `vec_direction_angles_two_points` | AB = (2,−2,−1); |AB| = 3; l²+m²+n² = 9/9 = 1; negative cosines kept; supplementary-angle remark for BA correct |
| `vec_equilateral_triangle_test` | p+q+r = (0,0,0) checked per component; \|p\|²=\|q\|²=\|r\|²=38 (the same squares 9, 25, 4 in each, as claimed); closure→triangle argument valid |
| `vec_intercept_form_line_proof` | non-zero intercepts stated; x = (1−t)a, y = tb; x/a + y/b = 1; t = 0 → A(a,0), t = 1 → B(0,b) both satisfy |
| `vec_line_plane_intersection` | line → 2a+(1+t)b−tc; plane → (1+y)a+(x+2y)b+(x−y)c; three columns give y = 1, x = t−1, x = 1−t → t = 1; point 2a+2b−c reproduced independently from the plane at x = 0, y = 1 ✓ |
| `vec_orthocentre_ha_hb_hc_2ho` | HX = OX − OH; sum = (OA+OB+OC) − 3·OH (the factor 3, not 1); OH − 3OH = −2OH = 2HO ✓ |
| `vec_vsaq_ab_lambda_ac` | AB = (−2,1,3), AC = (8,−4,−12); all three components give λ = −1/4 ✓ |
| `vec_vsaq_centroid_ga_gb_gc_zero` | GA = a − g (right direction); sum = (a+b+c) − 3g = 0; "GA = g − a" correctly listed as the mistake |
| `vec_vsaq_collinear_minus2a_3b_5c` | PQ = 3a−b−2c; PR = 9a−3b−6c = 3·PQ ✓; shared point P stated |
| `vec_vsaq_median_through_a` | D = (b+c)/2; r = (1−t)a + t(b+c)/2, t ∈ ℝ; t = 0 → A, t = 1 → D ✓ |
| `vec_vsaq_pentagon_lambda_ac` | A→B→C = AC; A→E→D→C = AC; plus the standalone AC → 3AC, λ = 3 ✓ (the routes really do exist as listed: AB+BC, AE+ED+DC) |
| `vec_vsaq_point_c_ac_3ab` | c − a = 3(b − a) → c = 3b − 2a; coefficient sum 3 + (−2) = 1 confirms C is on line AB ✓ |
| `vec_vsaq_unit_vector_sum_a_2i_2j_minus5k` | a+b = (4,3,−2) (k component −5+3 = −2, as the margin note insists); \|a+b\| = √29; unit = (4i+3j−2k)/√29, 29/29 = 1 ✓ |

**Product of Vectors (40 clean of 40)**

| Card | Checks run |
|---|---|
| `pv_altitudes_concurrent` | full re-derivation; (1)+(2) → (a−b)·c = 0 = c·BA; non-circular; marks 1+1+2+2+1+1 = 8 |
| `pv_angle_between_combined_vectors` | 2a+b = (7,2,−4), a+2b = (8,−2,1); u·v = 48; \|u\|² = \|v\|² = 69; cos = 48/69 = 16/23; arccos(0.6957) = 45.9° vs card's "≈46°" ✓; the card's reason for \|u\| = \|v\| (that \|a\| = \|b\| = √17) is itself correct |
| `pv_box_product_i_minus_j_etc` | determinant = 0; cross-route (j−k)×(k−i) = i+j+k, dotted with i−j = 0 ✓; "coplanar not parallel" distinction correct |
| `pv_box_product_sum_identity` | (c+a)×(a+b) = c×a + c×b + a×b; six dot terms listed, the four with a repeated vector are exactly the four that vanish; survivors [b c a] + [c a b] = 2[a b c] ✓ |
| `pv_component_perpendicular_and_scalar` | a·b = 6, \|a\| = √3, \|a\|² = 3; scalar 2√3 (÷\|a\|); vector along a = 2(i+j+k) (÷\|a\|²); perpendicular part j−k with (j−k)·a = 0 ✓ |
| `pv_coplanar_combination_find_p` | D = 2p−4 by row 1 and by column 1; p = 2; substituted back → 0 exactly; the `(3u+w)/2` margin claim verified |
| `pv_coplanar_find_lambda_points_pyq2016` | edges (1,λ−2,4), (1,0,−3), (3,3,−2); 35−7λ by row 1, row 2, and AC×AD; λ = 5 → determinant exactly 0 ✓ |
| `pv_coplanar_find_p_3ipj5k` | 7p+28 by determinant and by b×c = (10+3p, −14, p−6); p = −4 → 0 exactly ✓ |
| `pv_cross_and_unit_normal_2i3j5k` | a×b = (−26,−9,5); both dots 0; 782 = 2·17·23 squarefree as claimed; ± present |
| `pv_cross_product_axes_identity` | j×i = −k, k×i = j, i×k = −j all correct; a×i = a₃j−a₂k, a×j = −a₃i+a₁k, a×k = a₂i−a₁j; three pairs of squares sum to 2\|a\|² — the "each square appears twice" reason is the right reason |
| `pv_cross_product_distributive_identity` | six terms pair as reverses; y×x = −(x×y); sum is the **zero vector**, and the card insists on vector-not-number ✓ |
| `pv_cross_product_magnitude_squared` | sin(π/6) = ½ → \|p×q\| = 3, squared 9; p·q = 3√3, squared 27; identity 36 − 27 = 9 reproduces it independently ✓ |
| `pv_direction_cosines_3i6j2k` | \|v\| = 7; (3/7, −6/7, 2/7); squares sum to 49/49 = 1; obtuse β kept and explained |
| `pv_distance_point_from_plane` | a·n = −9; a·n − d = −13; \|n\| = 7; 13/7; the normal-form second route (\|−9/7 − 4/7\|) gives 13/7 too ✓; "units" not "square units" |
| `pv_dot_product_and_angle_6i2j3k` | a·b = 12; \|a\| = 7, \|b\| = 11; 12/77 irreducible (77 = 7·11); arccos(0.1558) = 81.0° vs card's "≈81°" ✓ |
| `pv_four_points_coplanar_box_identity` | slot-by-slot split reproduced: [b c d] − [b c a] − [b a d] − [a c d]; the four vanishing terms are exactly the repeats; cyclic + two swaps give the stated identity; the "if and only if" survives |
| `pv_lagrange_identity_cross_dot` | (a×b)·u = [a b u] = a·(b×u); b×(c×d) = (b·d)c − (b·c)d; result (a·c)(b·d) − (a·d)(b·c) matches the 2×2 determinant with the diagonals the right way round; c = a, d = b gives \|a×b\|² = \|a\|²\|b\|² − (a·b)² ✓ |
| `pv_parallel_vectors_find_p` | (2p/3)/2 = p/3 identically — so the claim that the middle ratio adds no equation is exactly right; 4 = p/3 → p = 12; a = 4i+8j+12k = 4b, a×b = 0 ✓ |
| `pv_parallelepiped_volume_coterminous` | determinant −11 two ways; V = 11 cubic units; no 1/6 |
| `pv_parallelepiped_volume_lambda_16` | −4λ by row 1 and column 3; 4\|λ\| = 16; **both** λ = ±4 given |
| `pv_parallelogram_area_2i3j_3ik` | zeros written in; a×b = (3,2,9); both dots 0; √94 squarefree; no spurious ½; the sides-vs-diagonals distinction correct (diagonals would carry ½) |
| `pv_perpendicular_bisectors_concurrent` | (a+b)·(b−a) = \|b\|²−\|a\|² (sign order right); (b+c)·(c−b) = \|c\|²−\|b\|²; (c+a)·(a−c) = \|a\|²−\|c\|²; non-circular; marks sum 8 |
| `pv_perpendicular_find_lambda_8i6jk` | a·b = 8 − 6λ − 2 = 6 − 6λ; λ = 1; check 8−6−2 = 0 ✓ |
| `pv_perpendicular_sum_magnitude` | three conditions → 2(a·b+b·c+c·a) = 0; \|a+b+c\|² = 4+9+16 = 29; answer √29 not 29 |
| `pv_plane_parallel_to_given_plane` | normal reused; k = 8+12+12 = 32; point substituted back → 0 |
| `pv_plane_parallel_to_two_vectors` | b×c = (2,17,8); a·n = −36; 2x+17y+8z+36 = 0; A → 0, b·n = 0, c·n = 0 (all three checks) |
| `pv_plane_perpendicular_to_vector` | (r−a)·n = 0; brackets (x−3),(y+2),(z+1) correct for the negative coordinates; constants −12+14−4 = −2; point → 0 |
| `pv_plane_through_line_of_intersection` | family (1)+λ(2); r·n = 6−5λ; 3+9λ = 6−5λ → λ = 3/14; normal (20,23,26)/14, constant 69/14; ×14 → r·(20i+23j+26k) = 69; point → 69; and the plane genuinely contains the line (14n₁ + 3n₂ = n, 14·6 + 3·(−5) = 69) |
| `pv_plane_through_three_points` | AB = (2,2,3), AC = (1,3,6); n = (3,−9,4); n·AB = n·AC = 0; a·n = −25; **all three** points substituted back to 0 |
| `pv_projection_vector_ijk_2i3jk` | correct direction (b on a, so a survives); ÷\|a\|² not \|a\|; (6/3)a = 2i+2j+2k; length 2√3 correctly named as the length, not the answer |
| `pv_semicircle_right_angle` | PA = a−p, PB = −a−p; product = −\|a\|²+\|p\|² = 0; P ≠ A, B stated before concluding; **figure geometry verified** (see §3.11) |
| `pv_simplify_cross_dot_expression` | cross-before-dot reading is the only defined one ✓; determinant with rows (1,−2,3),(2,1,−1),(0,1,1) = 2+4+6 = 12; non-zero → not coplanar; volume 12 (positive, so the modulus is moot) |
| `pv_sum_zero_angle_ab` | 49 = 9+25+2(a·b) → a·b = 15/2; cos θ = (15/2)/15 = ½ → 60°; and the 120° bullet is right — the 3-5-7 triangle's interior angle is arccos((9+25−49)/30) = 120°, the supplement |
| `pv_tetrahedron_volume_general_formula` | ⅓·base·height; base = ½\|a×b\|; unit normal (a×b)/\|a×b\|; h = \|c·(a×b)\|/\|a×b\| with the modulus argued; cancellation gives ⅙\|c·(a×b)\|; [c a b] = [a b c] is a genuine cyclic rotation ✓ |
| `pv_triangle_side_cross_products_equal` | BC+CA+AB = 0 (the path B→C→A→B really closes); b×c = −(b×a) = a×b; c×a = −(b×a) = a×b; and \|a×b\| = 2·area is correct (½\|BC×CA\| is the triangle's area) |
| `pv_triple_cross_i_neg2j_neg3k` | b×c = (1,3,5); a×(b×c) = (−1,−8,5); dot with a = 0; cross-checked against (a·c)b − (a·b)c with a·c = 1, a·b = 3 → b − 3c = (−1,−8,5) ✓ |
| `pv_triple_product_identity_second_form` | i component expanded both sides and matched term for term; the a₁b₁c₁ cancellation is the real one; marks 1+1+2+3+1 = 8 |
| `pv_unit_normal_ijk_and_2ij3k` | a×b = (2,−1,−1); both dots 0; √6; ± present; "divide by √6 not 6" correct |
| `pv_vector_magnitude_root6_perpendicular` | b rewritten in i,j,k order before the determinant (a real trap, handled); a×b = (3,3,6); both dots 0; \|·\| = 3√6; unit (i+j+2k)/√6; ×√6 → ±(i+j+2k) with \|·\| = √6 ✓ |
| `pv_verify_triple_product_not_equal` | all four cross products recomputed; both `why` fields' formula cross-checks verified numerically (b−3c and b−7a); the two sides differ; marks 2+2+2+1+1 = 8 |

---

## 5. Where I disagreed with a card and the card was right

1. **`pv_parallel_vectors_find_p`** — I read `4/1 = (2p/3)/2 = p/3` as a card quietly discarding a
   constraint: three ratios, only two used to fix p, which is the shape of a real error. Working it
   out, `(2p/3)/2 = p/3` **identically, for every p** — the middle ratio is literally the third
   ratio, and the card's sentence "it gives no new equation" is exactly right. The stem is degenerate
   by construction and the card is the only place I have seen say so out loud.

2. **`pv_component_perpendicular_and_scalar`** — I opened this expecting the recorded projection
   trap (recipe item 6): a boxed `2√3` for a question that also asks for a vector looked like a
   scalar/vector confusion. It is not. s2 divides by `|a|` (scalar), s3 divides by `|a|²` and keeps
   `a` (vector), the card prints the contrast as its own margin note, and the boxed line reports both
   requested objects. My suspicion was the card's own `common_mistakes` bullet, correctly stated.

3. **`pv_sum_zero_angle_ab`** — the bullet "Giving 120°, which is the interior angle of the triangle,
   not the angle between a and b" looked like a bullet naming a correct answer as an error: with
   `a+b+c = 0` and sides 3, 5, 7, the angle opposite 7 *is* 120°. Then I set it up properly:
   `cos C = (9+25−49)/30 = −½`, so 120° is the triangle's interior angle at the vertex where a ends
   and b begins, while the angle between the **free vectors** a and b is its supplement, 60°. The
   bullet distinguishes exactly those two and is correct.

4. **`pv_box_product_i_minus_j_etc`** — the expansion line `= 1(1 − 0) + 1(0 − 1) + 0(0 + 1)` has a
   **plus** where the cofactor pattern says minus, which is the named error class of this chapter.
   It is not an error: the entry is `−1`, and `−(−1) = +1` has already been applied. The card even
   says so in its margin ("A minus cofactor times a −1 entry gives a plus"). Same pattern, same
   false alarm, in `pv_coplanar_find_p_3ipj5k`.

5. **`vec_orthocentre_ha_hb_hc_2ho`** — the bullet "Quoting the result with the wrong point, for
   example `OA + OB + OC = 3 OG` for the centroid" reads at first like the card asserting a false
   formula. `OA+OB+OC = 3·OG` is true; the bullet is warning against quoting the *right* formula for
   the *wrong* purpose. Accurate, though the phrasing "with the wrong point" invites the misreading.

---

## 6. Negative control on my own checking

Because a zero-defect result is exactly what a lazy pass also produces, I re-ran my hand arithmetic
through an independent script (cross products, dot products and 3×3 determinants recomputed from the
`question_text` components, then compared against what the card prints). 36 assertions, **35 agreed
and one FAILED** — and the failure was **mine**: I had transcribed the point of
`pv_distance_point_from_plane` as (2, 6, −3) instead of (2, 5, −3), producing a·n = −12 against the
card's −9. Correcting my transcription gives −9, matching the card. That one failure is the evidence
that the harness discriminates rather than rubber-stamping: it caught the only wrong number in the
comparison, and that number was not in the bank.

---

## 7. Advisory — Rule 41 register (not a band verdict; no mathematics affected)

Rule 41 bans idiom, metaphor and personification in every reader-facing string. These are the hits I
found; each is prose colour in a `margin_note` or `why`, none changes a result, and none is in a
boxed answer or an on-page line a student copies:

| Card | String |
|---|---|
| `pv_box_product_sum_identity` | "Six terms come out and four **die**." · recall_prompt: "which terms **die**" |
| `pv_four_points_coplanar_box_identity` | "four of them repeat a vector and **die**" |
| `pv_direction_cosines_3i6j2k` | "Squaring **kills** the minus sign here" |
| `pv_semicircle_right_angle` | "Third mark, and the **heart of** the proof" |
| `vec_circumcentre_orthocentre_sum` | "Do not **chase** H directly" |
| `vec_collinear_test_a_minus2b_3c` | "instead of just **staring at** the three coefficients" |
| `vec_centroid_position_vector_proof` | "The question **hands over** the answer" |
| `vec_direction_angles_two_points` | "not an error to be **tidied away**" |
| `pv_altitudes_concurrent` | "The algebra **finishes one line before the proof does**" |
| `pv_component_perpendicular_and_scalar`, `pv_projection_vector_ijk_2i3jk` | "the length of the **shadow** of b on a" (borderline — "shadow" is near-standard for a projection, but it is still a metaphor under 41a) |

"die"/"kills" and "chase"/"staring"/"hands over" are the clearest 41a violations (personification and
idiom). Consistent with the recorded finding that Rule 41 is enforced by nothing automatic.

---

## 8. Other observations (no band impact)

- **`pv_coplanar_find_lambda_points_pyq2016` carries the corpus's only `appearances` entry**,
  `[{"year": 2016}]`. Its verification note discloses honestly that the year is the **source book's**
  printed tag `(Mar-2016(TS))`, that it has **not** been checked against a TSBIE paper, and that it
  therefore stays under `needs_teacher_verification`. That is the right handling; I could not verify
  the year independently and did not try. Flagging only so nobody later reads the tag as confirmed.
- **All 56 cards are `verification.status: unverified` with `needs_teacher_verification: true`** and
  every note discloses that the mark split is this book's own work, not the source's. Consistent.
- **Degenerate cases are unstated across the geometry proofs** (right-angled triangle in
  `vec_circumcentre_orthocentre_sum`; collinear/coincident points in the four-point coplanarity and
  plane cards). Only the circumcentre card is graded THIN for it, because there the degeneracy makes
  a *printed line* ("AP is parallel to OD") undefined rather than merely unmentioned.
  `pv_semicircle_right_angle` is the counter-example that shows the authors can do this well — it
  excludes P = A, P = B and spends a mark on saying why.

---

## 9. Coverage statement

**Dedicated pass — all 56 cards.** Every card in the corpus received a full independent
re-derivation from its `question_text`: I recomputed every determinant, every cross product, every
dot product, every magnitude and every substitution myself before comparing with the card, and read
every `line`, `why`, `margin_note`, `memory_tip` and `common_mistakes` bullet on every step. No card
was skimmed, and no card's `verification.note` was accepted as evidence for any number. In addition:

- **Machine-recomputed** (not hand-only): the 13 cross products in §3.1, all 8 scalar triple
  products, the 3 coplanarity substitutions, the 2 parallelepiped volumes, and the plane
  point-substitutions — 36 assertions in total, with the one failure traced to my own transcription
  (§6).
- **`recall` blocks**: this was a gap in my first pass — my extraction initially dropped them. I went
  back and read the `must_convey` and `reject` arrays for **all 56 cards / 205 steps**. Every
  `must_convey` states the same mathematics the step's lines do; no `reject` list rejects a correct
  statement of its own step (the rejects are consistently "that belongs to a different step"
  placeholders).
- **Not read in full**: the `recall.accept[]` and `recall.heard_as[]` phrase arrays (spoken-answer
  matching). I sampled these on one card only (`pv_cross_and_unit_normal_2i3j5k`). A defect confined
  to an `accept` phrase — e.g. a paraphrase that would credit a wrong number — would **not** have
  been caught by this pass. Nothing in this report should be read as clearing those two fields.
- **Not attempted**: rendering. I did not build the answer book or look at a rendered card, so
  line-wrap, KaTeX rendering of the `\begin{vmatrix}` blocks, and figure stroke pacing are
  unexamined. The figure was checked as coordinate geometry, not as pixels.

No card in the corpus counts CLEAN on the strength of nobody having looked at it.
