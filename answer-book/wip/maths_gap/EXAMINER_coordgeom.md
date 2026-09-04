# Independent examiner — the 63 Maths-1B coordinate-geometry cards added in `c0942ca1`

Corpus: the 63 files added (git status `A`, all 63) by `c0942ca1` matching
`ts_ipe_m1b_(sl|pl|loc|td|dc|pln)_` — 42 `sl_`, 7 `pl_`, 5 `loc_`, 5 `pln_`, 3 `td_`, 1 `dc_`.
Split by type: 32 VSAQ @ 2, 12 SAQ @ 4, 19 LAQ @ 8.

Every verdict below was reached by re-deriving from `question_text`. **No card's
`verification.note` was read as evidence** — the notes were excluded from the working dump.

---

## Tally by band

| Band | Count |
|---|---|
| **WRONG** (mathematics incorrect on any line) | **0** |
| **MISLEADING** | **4** |
| **THIN** | **0** |
| **CLEAN** | **59** |

No card produced a wrong final answer. Every boxed result on all 63 cards substitutes back to
exactly 0 / reproduces the stated quantity. The four findings are all in *teaching text*
(`why` / `margin_note` / an asserted hypothesis), not in the answer line.

Machine checks that came back clean across all 63: `mark_split` sum == `marks_total` (63/63),
sum of per-step `marks` == `marks_total` (63/63), at least one `boxed` final line (63/63).

---

## Findings

| # | Card id | Exact line | What it says | What it should say | Numeric evidence |
|---|---|---|---|---|---|
| 1 | `ts_ipe_m1b_sl_laq_angle_between_intercept_lines_sin_theta` | s1 `margin_note`: "Note a > b > 0 here, **since a and b are intercepts**." (and s1 line "a and b are intercepts, and a > b > 0") | Offers "they are intercepts" as the *reason* both are positive. | The stem gives only `a > b`. `b > 0` is an **added hypothesis**, not a consequence of being an intercept — an intercept is freely negative. Say "take a > b > 0" as an assumption, or handle the general case. | Counter-example inside the card's own frame: `a = 1, b = −2` satisfies `a > b` and both are legal intercepts, but `a² − b² = −3 < 0`, so the boxed `sin θ = (a² − b²)/(a² + b²)` returns **−3/5** — a negative sine for an angle between two lines. The true value there is `|a² − b²|/(a² + b²) = 3/5`. |
| 2 | `ts_ipe_m1b_sl_laq_angle_between_intercept_lines_sin_theta` (same card, second bullet) | s1 `common_mistakes`: "Forgetting that a² − b² > 0 **needs** both intercepts positive." | Presents positivity as *necessary* for `a² − b² > 0`. | Positivity is sufficient, not necessary — `a² − b² > 0 ⟺ \|a\| > \|b\|`. | `a = 5, b = −1`: neither "both positive" nor `b > 0`, yet `a² − b² = 24 > 0`. |
| 3 | `ts_ipe_m1b_sl_laq_isosceles_triangle_three_lines` | s4 lines: "A and B are angles of a triangle, and **both tangents are positive, so both are acute**." + s4 `why`: "the range has to be pinned down first — inside a triangle, and acute…" | Presents the positivity of the tangent as the test that fixes the interior angles as the acute ones. | The value comes out of `tan θ = \|(m₁−m₂)/(1+m₁m₂)\|`, so it is **always** positive — the test can never fail and therefore pins nothing. The missing condition is that the interior angle at that vertex equals the *acute* angle between those two lines, which is not automatic. | Apply the same test to this corpus's own `sl_laq_angles_of_triangle_three_lines`: all three moduli are positive (1/3, 1/13, 1/4), "so all three are acute" — giving a triangle whose angles sum to **36°52′**. That card devotes a 2-mark step to correcting exactly this. Here the conclusion survives anyway (both interior angles are 26°34′, and even in the obtuse reading both would be `180° − arctan½`, still equal), and the card's independent side check `CA = CB = √10` proves the result — so the answer stands, the justification does not. |
| 4 | `ts_ipe_m1b_sl_vsaq_line_from_midpoint_pq` | s2 `why`: "If p or q were 0 the midpoint would lie on an axis, which would **force both A and B to the origin**, and no such triangle or segment exists." | Both endpoints collapse to the origin, and no segment exists. | Only *one* endpoint collapses. The real reason `p, q ≠ 0` is that the line would then BE a coordinate axis, so it does not meet the axes at two distinct points and `x/a + y/b = 1` is undefined. | `p = 0, q = 1` ⇒ `a = 2p = 0` so `A = (0,0)`, but `b = 2q = 2` so `B = (0,2) ≠ (0,0)`. Midpoint `(0,1) = (p,q)` ✓. The segment from `(0,0)` to `(0,2)` plainly exists — it lies along the y-axis. |
| 5 | `ts_ipe_m1b_td_centroid_tetrahedron_2_3_minus4` | s2 `margin_note`: "**Three of the four x values** and one of the z values are negative." | Three negative x values. | **Two** of the four x values are negative. (The z clause is right.) | x column as listed by the card itself: `2, −3, −1, 3` → negatives are `−3` and `−1`, i.e. two. z column `−4, 2, 2, 1` → one negative ✓. The arithmetic below it is correct (`(2−3−1+3)/4 = 1/4`); only the note contradicts the card's own numbers. |

(Findings 1 and 2 are on the same card, so 4 cards carry a MISLEADING verdict:
`sl_laq_angle_between_intercept_lines_sin_theta`, `sl_laq_isosceles_triangle_three_lines`,
`sl_vsaq_line_from_midpoint_pq`, `td_centroid_tetrahedron_2_3_minus4`.)

### Two presentation nits (not banded — no mathematics is wrong)

- `ts_ipe_m1b_sl_laq_locus_midpoint_ab_variable_line` s5: the line `"Replacing (h, k) by (x, y):"`
  is followed by the numeric check, not by the replaced equation; the substituted form only
  appears in the boxed line (rearranged as `2(a+b)xy = ab(x+y)`). The colon dangles.
- `ts_ipe_m1b_sl_laq_transform_root3x_y_10_three_forms` `recall.accept` contains
  `"root of three plus one is two"` (spoken `√(3+1) = 2`). It reads identically to the error the
  same card's `common_mistakes` warns against ("Writing √((√3)² + 1²) as √3 + 1"). Harmless as a
  speech target, but it is the one phrase on the card that could be read the wrong way.

---

## CLEAN list — with the checks actually run on each

### Locus (5)

| Card | Checks run |
|---|---|
| `loc_distance_five_minus2_3` | Expanded `(x+2)²+(y−3)²=25` → `x²+y²+4x−6y−12=0`; substituted the card's own witness `(3,3)`: `9+9+12−18−12 = 0` ✓, and `dist((−2,3),(3,3)) = 5` ✓. |
| `loc_distance_twice_origin_1_2` | `x²+y² = 4[(x−1)²+(y−2)²]` → `3x²+3y²−8x−16y+20=0`; witness `(2,4)`: `12+48−16−64+20 = 0` ✓; `OP = √20`, `PA = √5`, `OP = 2PA` ✓. |
| `loc_equidistant_2_0_y_axis` | `x²` cancels → `y²−4x+4=0 = 4(x−1)`; witness `(2,2)`: dist to `A(2,0)` = 2 = dist to y-axis ✓, `4−8+4=0` ✓. Parabola classification correct (one squared term survives). |
| `loc_pa2_pb2_2c2_general` | `(x−a)²+(x+a)²` → `2x²+2a²`; ±2ax cancel; `x²+y² = c²−a²` ✓; `0<\|a\|<\|c\|` ⇒ radius real ✓. |
| `loc_ratio_5_minus4_7_6_two_three` | `9PA² = 4PB²` expanded both brackets independently: `9x²+9y²−90x+72y+369 = 4x²+4y²−56x−48y+340` → `5x²+5y²−34x+120y+29=0` ✓ (−90+56 = −34, 72+48 = 120, 369−340 = 29). Witness `(29/5,0)` = internal 2:3 point of A,B; substitutes to `841/5 − 986/5 + 145/5 = 0` ✓; measured ratio `4.079/6.118 = 0.6667` ✓. |

### Pair of Straight Lines (7 — every pair factorised and **multiplied back out**)

| Card | Checks run |
|---|---|
| `pl_angle_between_lines_proof` | Coefficient match of `b(y−m₁x)(y−m₂x)` re-derived: `m₁m₂ = a/b`, `m₁+m₂ = −2h/b` ✓; `(m₁−m₂)² = (4h²−4ab)/b²`; `p²+q² = 4h²−4ab+a²+2ab+b² = (a−b)²+4h²` ✓. Degenerate check `a+b=0 ⇒ cos θ = 0 ⇒ 90°` ✓. |
| `pl_centroid_area_12x2_20xy_7y2` | **2h convention**: `2h = −20 ⇒ h = −10` ✓ (card says so, and its wrong-h bullet is correct). `(2x−y)(6x−7y)` multiplied back = `12x²−20xy+7y²` ✓. Vertices `O(0,0), A(1,2), B(7,6)` each substituted into both their lines ✓. Centroid `(8/3,8/3)` ✓. Area from coordinates `½\|6−14\| = 4`; **cross-checked by the second formula** `n²√(h²−ab)/\|am²−2hlm+bl²\| = 16·4/\|108−120+28\| = 64/16 = 4` ✓. Signed determinant is −8, card applies the modulus and says why ✓. |
| `pl_centroid_area_2y2_xy_6x2` | `2h = −1 ⇒ h = −1/2` ✓; `a = −6` (x² coeff) not 2 ✓. `(y−2x)(2y+3x)` multiplied back ✓. Vertices `O, (−4/3,−8/3), (8,−12)` ✓. Centroid `(20/9, −44/9)` ✓. Area `½\|16+64/3\| = 56/3`; cross-checked `16·(7/2)/\|−6+1+2\| = 56/3` ✓. |
| `pl_equilateral_triangle_general_proof` | Difference of squares split ✓; normals dotted: `l(l−√3m)+m(m+√3l) = l²+m²` ✓ and `\|n₁\|² = 4(l²+m²)` ✓ ⇒ `cos θ = ½` both times; third angle from the 180° sum ✓. Area `d²/√3 = n²/(√3(l²+m²))` ✓. Verified concretely at `l=1, m=0, n=−1`: lines `y = ±x/√3` with `x=1` → 30°/30°/vertical, all angles 60° ✓. |
| `pl_equilateral_triangle_x_plus_2a` | Non-homogeneous pair meets at `(−2a,0)` ✓ (not the origin — card says so). `x=a` ⇒ `B(a,√3a)`, `C(a,−√3a)` ✓. `AB² = 9a²+3a² = 12a²` ⇒ all three sides `2√3\|a\|` ✓. Area `(√3/4)(12a²) = 3√3a²`, cross-checked `½·2√3\|a\|·3\|a\| = 3√3a²` ✓. |
| `pl_square_3x2_plus_8xy_minus_3y2` | `(3x−y)(x+3y)` back-multiplied ✓; `(3x−y+c)(x+3y+d)` expanded: `3d+c=2`, `3c−d=−4` ⇒ `c=−1, d=1`, `cd = −1` matches the constant ✓. **Perpendicularity by normals**: `(3,−1)·(1,3) = 0` ✓. Both inter-parallel distances `1/√10` ✓ ⇒ square. |
| `pl_square_6x2_minus_5xy_minus_6y2` | `(2x−3y)(3x+2y)` back-multiplied ✓; `2d+3c=1`, `2c−3d=5` ⇒ `c=1, d=−1`, `cd=−1` ✓. `(2,−3)·(3,2) = 0` ✓. Both distances `1/√13` ✓. |

### The Plane (5) and D.C's (1)

| Card | Checks run |
|---|---|
| `pln_define_angle_between_planes` | Definition via normals + the modulus (acute) ✓; formula correct; `d₁,d₂` correctly excluded. |
| `pln_foot_of_perpendicular_1_3_minus5` | Normal `(1,3,−5)`; plane `x+3y−5z−35=0`; **point substituted**: `1+9+25−35 = 0` ✓; constant = `1²+3²+5² = 35 = OP²` ✓. |
| `pln_parallel_zx_plane_0_4_4` | ZX-plane = `y=0` ✓ (degenerate form right); plane `y=4`; point `(0,4,4)` satisfies ✓. |
| `pln_perpendicular_x_axis_2_3_4` | Normal `(1,0,0)` ⇒ `x=2`; point satisfies ✓; correctly noted parallel to the YZ-plane. |
| `pln_through_minus2_1_3_normal_dr` | `3(x+2)−5(y−1)+4(z−3) = 3x−5y+4z−1`; **point substituted**: `−6−5+12−1 = 0` ✓. |
| `dc_angles_of_triangle_1_4_2` | All six d.r. sets recomputed from the vertices ✓. `∠A`: dot `= −3+3+0 = 0` ⇒ 90° ✓. `∠B`: dot 18, `√18 = 3√2`, `√56 = 2√14` ⇒ `cos B = 3√7/14` ✓. `∠C`: dot 38, `√38·2√14` ⇒ `√532/28 = √133/14` ✓. **Angle sum verified numerically**: 90° + 55.46° + 34.54° = 180.00° ✓, and `sin B = √(1−63/196) = √133/14 = cos C` ✓. Correctly keeps the sign (no modulus) because an interior angle may be obtuse. |

### The Straight Line — LAQ (18 clean of 19)

| Card | Checks run |
|---|---|
| `sl_laq_angles_of_triangle_three_lines` | The obtuse trap, handled correctly. Three vertices solved and each substituted into both its lines: `A(2,2), B(3,0), C(3/2,5/2)` ✓. Acute moduli 1/3, 1/13, 1/4 ⇒ 18°26′, 4°24′, 14°2′ ✓ (arctan checks: 18.435°, 4.399°, 14.036°). **Interior angles recomputed from the coordinates by the cosine rule**: 161.57°, 4.40°, 14.04° → sum 180.00° ✓, matching `π − Tan⁻¹(1/3)`, `Tan⁻¹(1/13)`, `Tan⁻¹(1/4)`. `β+γ = arctan((17/52)/(51/52)) = arctan(1/3) = α` ✓. Each acute value attached to the correct named vertex ✓. |
| `sl_laq_area_triangle_three_lines` | `A(4,3), B(−1,2), C(2,−1)` each substituted into both defining lines ✓. Area `½\|12+4+2\| = 9`. **Cross-checked by base×height**: B and C both lie on `x+y−1=0`, `BC = 3√2`, `dist(A, line 3) = 6/√2 = 3√2`, `½·18 = 9` ✓. Modulus kept. |
| `sl_laq_equilateral_triangle_remaining_sides` | Vertex `(2,−1)` confirmed off the base (`2−1−2 = −1 ≠ 0`). `√3 = \|(m+1)/(1−m)\|` → both branches kept → `m = 2∓√3` ✓ (rationalisation re-derived). **Both final lines substituted at (2,−1)**: `(2−√3)2+1+2√3−5 = 0` ✓ and `(2+√3)2+1−2√3−5 = 0` ✓. Angle re-verified: slopes `tan15°`/`tan75°` vs base `tan135°` → 120°/60° ⇒ acute 60° each ✓. |
| `sl_laq_line_at_60_through_1_2` | `m₁ = −√3`; branches give `m = 0` and `m = √3` ✓ (both kept). Lines `y−2=0`, `√3x−y+2−√3=0`, both through `(1,2)` ✓. Angles re-verified: 120° vs 0° and 120° vs 60° ⇒ 60° each ✓. `m = 0` correctly defended as a real answer. |
| `sl_laq_line_through_3_4_area_24` | `3/p + p/12 = 1` → `(p−6)² = 0`. **Discriminant checked, not assumed**: it is genuinely zero, and the card's reason is right — the minimum axes-triangle area through `(x₀,y₀)` is `2x₀y₀ = 24`, so exactly one line achieves it. Final `4x+3y−24=0`: point `12+12 = 24` ✓, area `½·6·8 = 24` ✓. |
| `sl_laq_lines_at_45_through_minus3_2` | Slope of `3x−y+4=0` is `+3` ✓ (sign of b). Branches ⇒ `m = −2`, `m = 1/2`; **m₁m₂ = −1** ✓ (the card's own check, and correct — two lines at 45° either side are mutually perpendicular). Both lines substituted at `(−3,2)`: `−6+2+4=0` ✓, `−3−4+7=0` ✓. Angle re-verified: `\|(3+2)/(1−6)\| = 1` ✓, `\|(3−½)/(1+1.5)\| = 1` ✓. |
| `sl_laq_lines_through_intersection_distance_2` | `P(−2,1)` substituted into both given lines ✓. Vertical line `x = −2` genuinely ruled out (distance 4). `3m²+4m = 0` ⇒ `m = 0, −4/3`, **both kept** (`m` factored, not divided out). Distances re-measured on the finals: `dist((2,−1), y=1) = 2` ✓; `dist((2,−1), 4x+3y+5=0) = 10/5 = 2` ✓; both pass through `P` ✓. |
| `sl_laq_locus_midpoint_ab_variable_line` | `x = y` from the subtraction ⇒ `P = (ab/(a+b), ab/(a+b))` ✓. `α = 2h, β = 2k`; `ab(h+k) = 2hk(a+b)` ✓. **Two concrete positions of the variable line verified** (as the domain recipe requires): at `a=2,b=3` the locus is `10xy = 6(x+y)`; line `x/2+y/3=1` passes through `P(6/5,6/5)` ✓ with midpoint `(1,3/2)` giving `15 = 15` ✓; line `x/3+y/2=1` also through `P` ✓ with midpoint `(3/2,1)` giving `15 = 15` ✓. |
| `sl_laq_parametric_distance_3pi_over_4` | Inclination `π − 3π/4 = π/4` ✓; the card's own consistency argument checked and correct (taking 3π/4 gives slope −1, parallel to `x+y−7=0`, so no P exists). `r√2 = 2 ⇒ r = √2`; `P = (3,4)`; `3+4−7 = 0` ✓; `dist((2,3),(3,4)) = √2` ✓. |
| `sl_laq_parametric_distance_parallel_y_root3x` | `θ = 60°`; substitution into `2x+4y−27=0` gives `r(1+2√3) = 11` ✓; conjugate `(2√3)²−1 = 11` ⇒ `r = 2√3−1` ✓. **Independently re-measured**: `P = ((3+2√3)/2, (12−√3)/2) ≈ (3.232, 5.134)`, `2x+4y = 27.000` ✓, `dist(P,Q) = √6.072 = 2.464 = 2√3−1` ✓. |
| `sl_laq_perp_distance_from_intersection_point` | Cross-multiplication denominators re-derived from `b₁c₂−b₂c₁ = −22`, `c₁a₂−c₂a₁ = 11`, `a₁b₂−a₂b₁ = 11` ✓ ⇒ `P(−2,1)`, substituted into both lines ✓. `\|7(−2)+24−15\|/25 = 5/25 = 1/5` ✓, reduced. |
| `sl_laq_perp_distance_proof_4p2_q2_a2` | `sec²+cosec² = 1/(sin²cos²)` ⇒ `p = \|a sinα cosα\|`; `2p = \|a sin2α\|` ⇒ `4p² = a²sin²2α` ✓. Second line already normalised (`cos²+sin²=1`) ⇒ `q² = a²cos²2α` ✓. Sum `= a²` ✓. Domain condition `sinα, cosα ≠ 0` stated ✓. |
| `sl_laq_perpendicular_through_intersection_2x_3y` | **m₁m₂ computed**: `(−2/3)(3/2) = −1` ✓. `P(−2,1)` substituted into both given lines ✓. `3x−2y+8 = 0` at P: `−6−2+8 = 0` ✓. |
| `sl_laq_transform_root3x_y_10_three_forms` | **All three forms present** ✓. (a) `m=−√3, c=−10` ✓. (b) `a = −10/√3 = −10√3/3`, `b = −10` ✓ (division by −10 checked). (c) **p>0 enforced** by flipping every sign; `√(3+1) = 2`; `cosα = −√3/2, sinα = −1/2, p = 5` ⇒ **third quadrant**, related acute angle 30° (from `tan = 1/√3`), `α = 210°`; `cos210° = −√3/2`, `sin210° = −1/2` ✓. |
| `sl_laq_transform_x_y_2_three_forms` | All three forms ✓. `a = b = −2` ✓. `p = 2/√2 = √2 > 0` after the sign flip ✓; both negative ⇒ **third quadrant**, `α = 225°`; `cos225° = sin225° = −1/√2` ✓. |
| `sl_laq_transform_x_y_minus2_three_forms` | All three forms ✓. `a = b = 2` ✓. Right side already positive — no flip, correctly flagged; `p = √2`; both positive ⇒ **first quadrant**, `α = 45°` ✓. |
| `sl_laq_isosceles_triangle_three_lines` | *(banded MISLEADING above for its justification only.)* The mathematics that is asserted is right: slopes `−1, −3, −1/3` ✓; `tan A = \|2/4\| = ½`, `tan B = \|(−2/3)/(4/3)\| = ½` ✓; vertices `A(2,−2), B(−2,2), C(1,1)` each substituted into both lines ✓; `CA = CB = √10` ✓ (and `AB = √32`, so naming AB would indeed be the error the card warns of). Interior angles from coordinates: 26.57°, 26.57°, 126.87° → 180.00° ✓. |
| `sl_laq_angle_between_intercept_lines_sin_theta` | *(banded MISLEADING above.)* Under `a > b > 0` the derivation is right: `m₁ = −b/a`, `m₂ = −a/b`, `1+m₁m₂ = 2`, `tan θ = (a²−b²)/(2ab)`, `(a²−b²)²+(2ab)² = (a²+b²)²` ⇒ `sin θ = (a²−b²)/(a²+b²)` ✓ — cross-checked by `sin θ = \|a₁b₂−a₂b₁\|/(…)` = `\|b²−a²\|/(a²+b²)` ✓. |

### The Straight Line — VSAQ (23)

| Card | Checks run |
|---|---|
| `sl_vsaq_area_axes_cos_sin_p` | Intercepts `p secα`, `p cosecα`; `½\|p²/(sinα cosα)\| = p²/\|sin2α\|` ✓; modulus present, non-negativity holds; `cosα, sinα ≠ 0` stated. |
| `sl_vsaq_area_axes_x_minus4y_plus2` | `Δ = c²/(2\|ab\|) = 4/8 = ½`; **cross-checked from the intercepts**: `x`-int `−2`, `y`-int `½`, `½·2·½ = ½` ✓. |
| `sl_vsaq_axes_divide_segment_ab` | `−y₁:y₂ = 3:(−6) = 1:−2`; **external division point computed**: `(1,0)` — lies on the X-axis ✓. `−x₁:x₂ = −2:3`; external point `(0,3)` — on the Y-axis ✓. Both correctly labelled external. |
| `sl_vsaq_chord_parametric_at1_at2` | Slope `2/(t₁+t₂)` with `t₁+t₂ ≠ 0` stated ✓. **Both parametric points substituted** into `2x−(t₁+t₂)y+2at₁t₂ = 0`: at `(at₁²,2at₁)` → `2at₁²−2at₁²−2at₁t₂+2at₁t₂ = 0` ✓; symmetric for `t₂` ✓. The `t₁+t₂ = 0` case checked: reduces to `x = at₁²`, the correct vertical chord ✓. |
| `sl_vsaq_collinear_condition_intercept_form` | `h/a+k/b = 1` ⟺ `bh+ak = ab` ✓; worked witness `a=2,b=3, (1,3/2)`: `½+½ = 1` and `3+3 = 6` ✓. |
| `sl_vsaq_collinear_find_t_parametric` | Area expression expanded independently: `6t²−8t+16t−4t²−12t = 2t²−4t = 2t(t−2)` ✓. **Both roots kept.** `t=2`: `A(2,4),B(4,12),C(3,8)`, slope AB = slope BC = 4 ✓. `t=0` degenerate (A=B=origin) and the card says so explicitly. |
| `sl_vsaq_concurrent_family_3a_2b_4c` | Divide by the coefficient of `c` (4) ⇒ `(3/4, 1/2)` ✓. **Two members of the family constructed and checked**: `a=4,b=0 ⇒ c=−3`, line `x = 3/4` ✓; `a=0,b=2 ⇒ c=−1`, line `y = 1/2` ✓. |
| `sl_vsaq_concurrent_family_ap_abc` | `2b = a+c ⇒ a−2b+c = 0` ⇒ `(1,−2)`; substituted: `a(1)+b(−2)+c = 0` for every AP triple ✓. |
| `sl_vsaq_concurrent_find_p_4x_3y_7` | `(1,−1)` from the two p-free lines, substituted into both ✓; `2−p+2 = 0 ⇒ p = 4`; re-substituted into `2x+4y+2=0` at `(1,−1)`: `2−4+2 = 0` ✓. |
| `sl_vsaq_equal_intercepts_through_intersection` | `(−23,−9)` substituted into both given lines: `−46+45+1 = 0` ✓, `−23+27−4 = 0` ✓. `x+y+32 = 0`; both intercepts `−32` — equal and non-zero, matching the stem's "non-zero" ✓; the excluded `x+y=0` case explained. |
| `sl_vsaq_family_l1_lambda_l2_2plus5k` | Regrouping verified by re-expansion ✓. `(5,4)` substituted into `L₁` and `L₂` ✓ **and into the original k-form**: `(2+5k)5 − 3(1+2k)4 + 2 − k = 10+25k−12−24k+2−k = 0` for all k ✓. |
| `sl_vsaq_intercept_product_tan_sec_find_alpha` | Intercepts `cotα`, `cosα` ✓; `cos²α = sin²α ⇒ cos2α = 0 ⇒ α = (2n+1)π/4` ✓ — **general solution given, not just 45°**. All four residues re-checked against the stem: `π/4` (1·1/√2 = sin ✓), `3π/4` (`(−1)(−1/√2) = 1/√2 = sin3π/4` ✓), `5π/4` (`1·(−1/√2) = sin5π/4` ✓), `7π/4` (`(−1)(1/√2) = sin7π/4` ✓). Divide-by-sinα safety stated ✓. |
| `sl_vsaq_intercept_ratio_2_3_through_3_minus4` | `k = 1/6 ⇒ a = 1/3, b = 1/2 ⇒ 3x+2y−1 = 0`; point `9−8 = 1` ✓; intercepts recomputed off the final line: `1/3` and `1/2`, ratio `2:3` ✓. |
| `sl_vsaq_line_from_midpoint_pq` | *(banded MISLEADING above for its `why` only.)* `a = 2p, b = 2q ⇒ x/p + y/q = 2` ✓; midpoint of `(2p,0),(0,2q)` is `(p,q)` ✓. |
| `sl_vsaq_parallel_perp_through_1_3` | Slope AB `= 6/−9 = −2/3`; **m₁m₂ = (−2/3)(3/2) = −1** ✓ and normals `(2,3)·(3,−2) = 0` ✓. Both finals substituted at `(1,3)`: `2+9−11 = 0` ✓, `3−6+3 = 0` ✓. |
| `sl_vsaq_perp_bisector_find_alpha_beta_sum` | Image relation used with the `−2` factor ✓. `r = −26/13 = −2`; `α = −1, β = 2`, sum 1 ✓. **Both bisector conditions verified independently**: midpoint of `(3,−4),(−1,2)` is `(1,−1)`, on `2x−3y−5=0` (`2+3−5 = 0`) ✓; segment slope `−3/2` × line slope `2/3` = −1 ✓. Endpoints equidistant from the line by construction (image). |
| `sl_vsaq_perp_bisector_find_b_from_a` | **Both conditions written and both re-checked.** `h−3k−2 = 0` and `3h+k+6 = 0` ⇒ `B(−8/5,−6/5)`. Midpoint `(−13/10,−21/10)`: `−13/10+63/10−50/10 = 0` ✓ on the line. Slope AB `= (9/5)/(−3/5) = −3`, times `1/3` = −1 ✓. Equidistance: `\|A−mid\| = \|B−mid\|` by construction ✓. |
| `sl_vsaq_perp_distance_minus2_minus3_degenerate` | The degenerate card. **0 confirmed to be right, not assumed**: `5(−2)−2(−3)+4 = −10+6+4 = 0`, so `(−2,−3)` is genuinely a point of `5x−2y+4=0`; distance `0/√29 = 0` ✓. The card explains it rather than hiding it. |
| `sl_vsaq_perpendicular_intercept_minus4_xaxis` | `4x−3y+k` from `bx−ay+k` ✓; **m₁m₂ = (−3/4)(4/3) = −1** ✓. `k = 16`; `x`-intercept re-read off the final: `4x = −16 ⇒ x = −4` ✓. |
| `sl_vsaq_point_equidistant_on_line` | **Both bisector conditions**: midpoint `(−1,4)` ✓, `m₁m₂ = (−½)(2) = −1` ✓ ⇒ `2x−y+6 = 0`. Intersection with `3x+y+4=0` ⇒ `(−2,2)`; on the given line (`−6+2+4 = 0`) ✓; **distances re-measured**: to `(−5,6)` = √25 = 5, to `(3,2)` = √25 = 5 ✓. |
| `sl_vsaq_points_at_distance_five_4x_3y_10` | **Two answers, both given.** `(1,−2)` confirmed on the line first ✓. `tanθ = 4/3 ⇒ cosθ = 3/5, sinθ = 4/5` ✓. `(4,2)`: `16−6−10 = 0` ✓, distance 5 ✓. `(−2,−6)`: `−8+18−10 = 0` ✓, distance 5 ✓. Sign-pairing warning correct — the mixed points `(4,−6)`/`(−2,2)` are indeed off the line. |
| `sl_vsaq_same_line_ratio_r_in_terms_mb` | `l/a = m/b = n/c ⇒ r = m/b` ✓; worked witness `2x+3y+4` vs `6x+9y+12`: all three ratios = 3 ✓. |
| `sl_vsaq_same_side_test_3_2_minus4_minus3` | `L(3,2) = 6−6+4 = 4`, `L(−4,−3) = −8+9+4 = 5`; both positive ⇒ same side ✓. |
| `sl_vsaq_through_origin_equal_angles_axes` | `θ = 45°` and `135°`, **both lines given** ⇒ `y = x`, `y = −x` ✓; `tan135° = −1` ✓. |

### 3D-Coordinates (2 clean of 3)

| Card | Checks run |
|---|---|
| `td_centroid_triangle_5_4_6` | Column sums re-added: `(5+1+4)/3 = 10/3`, `(4−1+3)/3 = 2`, `(6+3+2)/3 = 11/3` ✓; divisor 3 correct for a triangle. |
| `td_new_origin_translation_1_2_3` | `X = x−h` orientation confirmed. `1−h = 2 ⇒ h = −1`, `2−k = 3 ⇒ k = −1`, `3−l = 1 ⇒ l = 2` ✓; **forward-substituted**: `(1−(−1), 2−(−1), 3−2) = (2,3,1)` ✓ reproduces the target. |
| `td_centroid_tetrahedron_2_3_minus4` | *(banded MISLEADING above for its margin note only.)* Arithmetic right: `(2−3−1+3)/4 = 1/4`, `(3+3+4+5)/4 = 15/4`, `(−4+2+2+1)/4 = 1/4` ✓; divisor 4 correct for four vertices. |

---

## Where I disagreed with a card and the card turned out to be right

1. **`sl_laq_isosceles_triangle_three_lines` — I thought the triangle's angles could not sum to
   180°.** Computing the angle at `C(1,1)` I took `CB = B − C = (−3,3)` and got `cos C = −0.894`,
   i.e. 153.4°, which with `A = B = 26.57°` overshoots 180° by 26°. **The slip was mine**:
   `B = (−2,2)` so `CB = (−3,1)`, not `(−3,3)`. Redone: `cos C = (−3−3)/10 = −0.6`, `C = 126.87°`,
   and `26.565 + 26.565 + 126.87 = 180.00` exactly. The card's `CA = CB = √10` and its isosceles
   conclusion stand. (My separate objection to its *justification* survives and is filed above —
   that is a different point from the one I was wrong about.)

2. **`sl_vsaq_collinear_find_t_parametric` — I thought `t = 0` was a spurious root that should be
   rejected.** At `t = 0` the first two points collapse to `(0,0)`, so "three points" arguably do
   not exist and I expected the card to be over-reporting. The card anticipates this in its own
   `why`: two coincident points and a third always lie on a line, so `t = 0` satisfies the
   condition *as printed*. That is the correct reading of the stem, and reporting it while naming
   the degeneracy is better than silently dropping it. Changed my mind.

3. **`sl_laq_parametric_distance_3pi_over_4` — I suspected the inclination conversion.** I first
   read "makes an angle `3π/4` with the negative direction of the X-axis" as possibly just giving
   inclination `3π/4`. The card's own consistency argument settled it against me: `3π/4` gives
   slope −1, which is **parallel** to `x+y−7=0`, so no point P would exist and the question would
   be void. `π − 3π/4 = π/4` is the only reading under which the stem is well-posed, and it
   lands on `P(3,4)` on the line.

4. **`sl_laq_line_through_3_4_area_24` — I expected a dropped second root.** A quadratic that
   factors to `(p−6)²=0` in an area problem usually signals a lost root. It does not here: the
   minimum axes-triangle area cut by a line through `(x₀,y₀)` in the first quadrant is `2x₀y₀`,
   which for `(3,4)` is exactly 24. The discriminant is genuinely zero and the card's explanation
   of *why* is correct.

5. **`pl_centroid_area_12x2_20xy_7y2` — I expected a signed area presented as the answer.** The
   determinant `1(6) − 7(2) = −8` is negative. The card applies the modulus, reports 4, and says
   in its `why` that the negative determinant only records clockwise vertex order. Correct, and
   it also cross-checks against `n²√(h²−ab)/|am²−2hlm+bl²|` with the right `h = −10`.

---

## Coverage statement

**Dedicated pass on all 63 cards. No card was swept.** Every card was re-derived from its
`question_text` before its steps were read as a claim.

What was checked on every card:
- every boxed final equation substituted back through every point it must pass through;
- every perpendicularity claim verified by `m₁m₂` **and**, where normals were used, by the dot
  product (11 cards carry a perpendicularity claim; all 11 checked both ways where both apply);
- every pair of straight lines factorised independently and the factors **multiplied back out**,
  with the `2h` reading confirmed separately on each of the 4 cards where `h` is used numerically
  (`h = −10`, `−1/2`, `4`, `−5/2` — all four correct in the cards);
- all three triangle-area cards computed from explicit vertices **and** cross-checked by a second
  method (standard pair formula / base × height);
- the angle-sum test applied to both "angles of a triangle" cards, numerically, from coordinates;
- every "two answers" stem checked for completeness (9 cards: 2 lines at an angle ×3, 2 points at
  a distance, 2 lines at a distance, 2 collinearity roots, 2 lines through the origin, the general
  `α` family, and the one genuine single-answer case where the discriminant is zero);
- both perpendicular-bisector cards checked for **both** conditions plus endpoint equidistance;
- both locus-of-a-variable-object cards verified at two concrete positions of the variable object;
- the three normal-form cards checked for `p > 0`, the quadrant of `α`, and that all three
  requested forms are actually present;
- the degenerate perpendicular-distance card confirmed to be genuinely 0;
- `mark_split` sums, per-step mark sums, and boxed-final presence machine-checked on all 63;
- **all 270 `recall.must_convey` strings** read back against the verified answers (no contradiction);
- **all ~300 numeric `common_mistakes` bullets** read back against their own step's marked lines —
  no bullet names a correct move as the error (the one wrong-flavoured bullet found, finding #2,
  is a false *necessity* claim, not a mis-named error).

What was **not** exhaustively checked, and therefore is not covered by any verdict above:
- `recall.accept` / `heard_as` / `reject` arrays: sampled on 8 cards (148 strings) and clean;
  the remaining ~55 cards' accept arrays were not read line by line.
- `verification.note` prose (deliberately excluded as evidence; also not audited for its own
  factual claims about sources, page numbers or paper position).
- `expected_time_min`, `appearances`, `page_header` and other metadata beyond the mark arithmetic.
- Rendering: no card was viewed in the built player, so line-wrap, KaTeX/Unicode fallback and
  overflow behaviour on these 63 are unverified here.
