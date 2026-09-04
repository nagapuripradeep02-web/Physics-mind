# Independent examiner pass — 33 Applications-of-Derivatives cards (PR #181, unit 10, `mathematics_1b`)

Examiner: independent pass, 2026-08-31. Worktree `C:\Tutor\physics-mind-ipe-maths-1ab`.
**Report only — no card was edited.** Every `verification.note` was ignored as evidence; every
result was re-derived from `question_text` with sympy/mpmath at ≥ 8 significant figures.

**Verdict tally over all 33 cards: WRONG 0 - MISLEADING 5 - THIN 3 - CLEAN 25.**
Eight findings, F-1 to F-8, all in explanatory prose; no mathematical result on any card is wrong.
The full tally table, the single findings table, the CLEAN list with named checks, the
"I disagreed and was wrong" section and the coverage statement are at the END of this file, under
FINAL TALLY AND SUMMARY. Sections 1-5 below carry the working, group by group.

---

## Section 1 — Approximations (5 cards)

Method checked on every card: base point is the nearest value where the function is exact,
sign of Δx, the derivative re-differentiated with sympy, and **the approximation compared
against the true value at 20 dps**.

| card | base pt / Δx | f′ at base | card's answer | true value | signed error of the approximation | card's own claim about the error | verdict |
|---|---|---|---|---|---|---|---|
| `approx_root_65` | 64 / +1 | 1/16 | 8.0625 | 8.0622577482985497 | +0.00024225 | "high by about 0.00024" ✓ | CLEAN |
| `approx_root_82` | 81 / +1 | 1/18 | 9.0556 | 9.0553851381374166 | +0.00017042 | "true value 9.055385 … high by about 0.00017" ✓ | CLEAN |
| `approx_cbrt_999` | 1000 / −1 | 1/300 | 9.9967 | 9.9966655549378598 | +0.00000111 | "true value 9.9966656 … high by about 0.000001" ✓ | CLEAN |
| `approx_cbrt_7_8` | 8 / −0.2 | 1/12 | 1.9833 | 1.9831924826807747 | +0.00014085 | "true value 1.983192 … high by about 0.00014" ✓ | CLEAN |
| `approx_cos_60_deg_5_min` | 60° / +5′ | −sin60° | 0.4987 | 0.4987398887026634 | +0.00000053 | "true value 0.4987399 … high by less than a millionth" ✓ | CLEAN |

Named checks behind each CLEAN:

- **`approx_root_65`** — d/dx √x = 1/(2√x) re-derived; f′(64) = 1/16 = 0.0625 exact; 64 confirmed the
  nearest perfect square to 65 (81 is 16 away). Approximation 8.0625 vs true 8.0622577482985497 —
  closer to the truth than the base point 8, so the estimate is an improvement, as required.
  **Known source defect handled**: the card carries the √-vs-∛ discrepancy explicitly in
  `verification.note` AND turns it into a `common_mistakes` bullet ("Using 64 as a perfect cube and
  taking f(x) = ∛x, which answers a different question") — 64 really is both 8² and 4³, so the bullet
  is correct as written. The `why` claim "the tangent sits slightly above the curve, so a square-root
  estimate of this kind is always a little large" is a true general statement (√x is concave on x > 0,
  so its tangent line dominates it everywhere).
- **`approx_root_82`** — f′(81) = 1/18 = 0.05555…; 81 nearest perfect square (100 is 18 away).
  Same concavity claim, same check, true. Both `common_mistakes` bullets name genuine errors
  (1/18 misread; the missing 2 in 1/(2√x)).
- **`approx_cbrt_999`** — f′(x) = 1/(3(∛x)²) re-derived (= ⅓x^(−2/3)); f′(1000) = 1/300 exact.
  Sign of Δx = −1 correct and the card's margin note says so twice. Approx 9.9966667 is nearer the
  truth than the base point 10 ✓.
- **`approx_cbrt_7_8`** — f′(8) = 1/(3·2²) = 1/12 ✓; 0.2/12 = 1/60 = 0.0166667 ✓, so 2 − 1/60 =
  1.9833333. Δx = −0.2 sign correct. The bullet "Computing f′(8) as 1/(3 × 8) = 1/24, cubing instead
  of squaring the cube root" is right: 1/24 comes from using (∛8)³ = 8 where (∛8)² = 4 belongs.
- **`approx_cos_60_deg_5_min`** — both conversions re-checked: 5′ = (1/12)° = π/2160 rad =
  0.0014544410433286 ✓; sin60°·π/2160 = 0.0012595828918293 ✓ (card prints 0.0012595); the
  radians-only condition on d/dx cos x = −sin x is stated and is true; the bullet "an answer above
  0.5, which cosine cannot be just past 60°" is correct (cos is strictly decreasing on (0°, 180°)).

Sub-threshold observation (NOT a finding): `approx_root_82` s2 bullet says a student who rounds to
9.06 loses "the decimal places the question is asking for" — the printed stem asks for no particular
precision. The sibling `approx_root_65` phrases the identical bullet better ("when the working
already provides four decimal places"). Cosmetic; not counted against the card.

---

## Section 2 — dy and Δy (5 cards)

Every card re-computed at 25 dps: dy = f′(x)·Δx, Δy = f(x+Δx) − f(x), and the gap.

| card | dy (recomputed) | card's dy | Δy (recomputed) | card's Δy | gap | verdict |
|---|---|---|---|---|---|---|
| `dy_delta_y_x2_plus_3x_plus_6` (x=10, Δx=0.01) | 0.23 | 0.23 | 0.2301 | 0.2301 | 0.0001 | CLEAN |
| `dy_delta_y_x2_plus_x` (x=10, Δx=0.1) | 2.1 | 2.1 | 2.11 | 2.11 | 0.01 | THIN (see F-1) |
| `dy_delta_y_5x2_plus_6x_plus_6` (x=2, Δx=0.001) | 0.026 | 0.026 | 0.026005 | 0.026005 | 0.000005 | CLEAN |
| `dy_delta_y_ex_plus_x` (x=5, Δx=0.02) | 2.9882631820515321 | 2.9883 | 3.0181446914761592 | 3.0181 | 0.0298815 | THIN (see F-2) |
| `dy_delta_y_one_over_x_plus_2` (x=8, Δx=0.02) | −0.0002 | −0.0002 | −0.00019960079840319 | −0.0001996 | 3.99e−7 | CLEAN |

Named checks:

- **`x2_plus_3x_plus_6`** — f′ = 2x+3 (sympy) ✓; (10.01)² = 100.2001 ✓; f(10.01) = 136.2301 ✓;
  the `why`'s "differ by only 0.0001" matches the recomputed gap exactly.
- **`5x2_plus_6x_plus_6`** — f′ = 10x+6 ✓; (2.001)² = 4.004001 exactly as printed ✓;
  f(2.001) = 38.026005 ✓. Margin claim "dy and Δy differ in the sixth decimal place" — gap is
  5×10⁻⁶ ✓. `why` "agree to five decimal places" ✓ (0.02600 both).
- **`one_over_x_plus_2`** — f′ = −1/(x+2)² (sympy) ✓; −1/100 at x = 8 ✓; 1/10.02 − 1/10 =
  −0.02/100.2 = −0.000199600798 ✓; the printed "−0.0001996 (to 7 decimal places)" is a correct
  7-dp rounding. `why` "agree to six decimal places" ✓. The mistake bullet's arithmetic checks:
  rounding 1/10.02 to 0.0998 does give exactly −0.0002 ✓. Sign discipline correct throughout;
  the general claim "the derivative is negative everywhere the function is defined" is true
  (−(x+2)⁻² < 0 for all x ≠ −2).
- **`ex_plus_x`** — f′ = eˣ+1 ✓; e⁵ = 148.41315910257660 (card prints 148.4132 ✓);
  e^5.02 = 151.41130379405276 (card prints 151.4113 ✓); e^5.02 − e⁵ = 2.9981446914761592
  (card prints 2.9981 ✓); dy = 0.02(e⁵+1) = 2.9882631820515321 ✓; Δy = 3.0181446914761592 ✓.
  The `why`'s "gap … about 0.0299" matches 0.02988151 ✓. The power-rule bullet and the
  e^(5.02) ≠ e⁵ + e^0.02 bullet are both correct.
- **`x2_plus_x`** — f′ = 2x+1 ✓; (10.1)² = 102.01 ✓; gap 0.01 ✓; the `why`'s "it grows as Δx
  grows" is true for a fixed convex f (gap = ½f″Δx² exactly for a quadratic).

### Findings in this section

**F-1 · `dy_delta_y_x2_plus_x` — THIN.** s2 `margin_note`: *"Δx = 0.1 is ten times bigger than in
the previous part, so dy and Δy sit further apart here — 2.1 against 2.11."* I checked the claim
against `answer-book/units.json`: the immediately preceding card in the unit really is
`dy_delta_y_x2_plus_3x_plus_6` with Δx = 0.01, so **the claim is arithmetically true**. The defect
is that the card is served standalone — a student who opens this card alone (search, or a different
navigation order) reads a comparison to a "previous part" that is not on the page, and the sentence
becomes unverifiable. Suggested wording: "Δx = 0.1 is a large step, so dy and Δy sit further
apart — 2.1 against 2.11." Mathematics untouched.

**F-2 · `dy_delta_y_ex_plus_x` — THIN.** Same shape, twice. s2 `margin_note`: *"much wider than in
the polynomial parts"*; s2 `why`: *"far wider than in the polynomial parts"*. Checked: the three
polynomial dy/Δy cards earlier in the unit have gaps 0.0001, 0.01 and 0.000005, all smaller than this
card's 0.0299, so **the claim is true**; and the stated cause is right too (gap ≈ ½f″Δx², and
f″ = e⁵ ≈ 148 here). Again the reference points off the card. Suggested: "much wider than a
polynomial of the same size would give".

---

## Section 3 — Errors, relative and percentage (7 cards)

| card | quantity checked | recomputed | card | verdict |
|---|---|---|---|---|
| `define_relative_and_percentage_error` | Δy/y and 100Δy/y on y=50, Δy=0.5 | 0.01 and 1% | 0.01 and 1% | CLEAN |
| `kxn_relative_error` | dy/y for y = kxⁿ | n·(dx/x) | n·(dx/x) | CLEAN |
| `pendulum_percentage_error` | dT/T for T = 2π√(l/g) | ½·(dl/l) → 0.5% | 0.5% | CLEAN |
| `sphere_diameter_40_error` | dV, dS at r=20, dr=0.01 | 16π = 50.265482 cm³; 1.6π = 5.0265482 cm² | 16π ≈ 50.27; 1.6π ≈ 5.03 | CLEAN |
| `square_3_to_3_01` | dA at x=3, dx=0.01 | 0.06 cm² (exact 0.0601) | 0.06 (exact 0.0601) | **MISLEADING (F-4)** |
| `square_side_up_4_percent` | dA/A = 2dx/x, 4% | 8% (exact 8.16%) | 8% (exact 8.16%) | CLEAN |
| `sphere_radius_7_to_7_02` | dV at r=7, dr=0.02 | 3.92π = 12.315043 cm³ (exact 3.9312107π = 12.350263) | 3.92π ≈ 12.32 | **MISLEADING (F-3)** |

Named checks behind each CLEAN:

- **`define_relative_and_percentage_error`** — both definitions match the standard forms (relative Δy/y,
  percentage 100Δy/y); the stated conditions "defined only when y ≠ 0" and "pure numbers with no unit"
  are both true; the worked number 0.5/50 = 0.01 → 1% recomputed. The bullet "Giving 0.5% by dividing
  0.5 by 100 instead of by y" checks out (0.5/100 = 0.005 = 0.5%). Definitions are the right way round —
  I checked specifically for the relative↔percentage swap.
- **`kxn_relative_error`** — differentiation re-run in sympy: d/dx(k·xⁿ) = k·n·xⁿ⁻¹ ✓; dy/y =
  (k n xⁿ⁻¹ dx)/(k xⁿ) = n dx/x ✓, k genuinely cancels and the exponent is n, not n−1. The `why`'s
  three instances are each correct: n = 2 → 2×, n = ½ → ½×, n = −1 → −1×. (Unstated hypotheses
  x ≠ 0 and k ≠ 0 are standard for this board question; not counted as THIN.)
- **`pendulum_percentage_error`** — T = 2π√(l/g) = (2π/√g)·√l re-derived; dT/dl = k/(2√l);
  dT/T = (k dl/(2√l))/(k√l) = dl/(2l) = ½(dl/l) ✓ — I checked specifically that the ½ was not
  inverted to 2. 1% → 0.5% ✓, and the claim that g drops out of the answer is true.
- **`sphere_diameter_40_error`** — the diameter/radius trap is handled correctly and explicitly:
  r = 20 and dr = 0.01, both halved. dV = 4πr²dr = 4π(400)(0.01) = 16π = 50.2654825 cm³ ✓
  (card's 50.27); dS = 8πr dr = 8π(20)(0.01) = 1.6π = 5.0265482 cm² ✓ (card's 5.03). Units are the
  right way round (cm³ / cm²) and the bullet warning about swapping them is correct. The `why`'s
  identity dV/dr = 4πr² = surface area is true, and its dV/V = 3(dr/r), dS/S = 2(dr/r) are both right.
- **`square_side_up_4_percent`** — dA/A = 2(dx/x) re-derived; 2 × 4 = 8%; exact
  (1.04² − 1)×100 = 8.16% — the card prints exactly 8.16% ✓. The "don't square the 4" bullet is a
  real student error, correctly named.

### Findings in this section

**F-3 · `sphere_radius_7_to_7_02` — MISLEADING.** Step `s2_answer`, `why`:
*"The exact increase is (4/3)π[(7.02)³ − 7³] = 3.9312π cm³, and the approximation gives 3.92π cm³.
**They agree to three figures** because dr = 0.02 is small compared with r = 7."*
The two numbers do **not** agree to three figures. Recomputed at 20 dps:
exact = 3.93121066666667π = **12.350262550** cm³; approximation = 3.92π = **12.315043202** cm³.
To three significant figures that is 12.4 vs 12.3 (or, as π-multiples, 3.93 vs 3.92) — they part
company in the *third* figure. Relative difference 0.285%. They agree to **two** significant figures.
Should say "They agree to two figures" (or "to about 0.3%"). Everything else on the card — the
derivative, the 3.92π, the 12.32, the exact 3.9312π — is correct; only this sentence is false, and
it teaches a student to over-trust the linear estimate.

**F-4 · `square_3_to_3_01` — MISLEADING.** Step `s2_answer`, `common_mistakes[1]`:
*"Giving 9.0601 or 0.0601, which answers a different question from the one asked."*
0.0601 cm² is not a different question — it is the **exact** increase in area, the very quantity the
question asks for, computed without the linear approximation. The card contradicts itself twice on the
same step: its own line reads *"Exact increase = (3.01)² − 3² = 9.0601 − 9 = 0.0601 cm², so 0.06 cm² is
close to it"*, its `margin_note` says *"The exact value 0.0601 is worth writing beside it"*, and its
`memory_tip` says *"The exact answer 0.0601 is one ten-thousandth away from it"* — calling 0.0601
**the exact answer** in one field and a wrong answer in another. Only 9.0601 (the new area) answers a
different question. Compare the sibling `sphere_radius_7_to_7_02`, whose equivalent bullet is worded
correctly: *"Computing the two full volumes and subtracting, **which is exact but** is not what
'approximate' asks for."* Suggested fix: *"Giving 9.0601, the new area, instead of the increase; or
working the exact difference without ever using dA = 2x·dx, which loses the method mark."*

Sub-threshold observation (NOT a finding): `pendulum_percentage_error` s1 bullet
*"Differentiating √(l/g) as 1/(2√(l/g)) and losing the 1/√g factor"* under-states the slip — the
erroneous expression √g/(2√l) differs from the correct 1/(2√(gl)) by a factor of g, not 1/√g. The
bullet still names a genuinely wrong move, so it is not a defect band; the wording is just loose.

---

## Section 4 — Angle between curves, touching, orthogonality (8 cards)

Protocol on every card: intersection points solved independently in sympy **and each candidate point
substituted back into BOTH curve equations to confirm it gives 0**; both slopes re-derived implicitly
in sympy; the angle recomputed and converted to degrees-and-minutes; rejected roots checked to be
genuinely non-real / out of domain.

| card | intersections I solved | card's point(s) | m₁, m₂ (recomputed) | tanθ | θ recomputed | card's θ | verdict |
|---|---|---|---|---|---|---|---|
| `angle_2y2_9x_and_3x2_4y_fourth_quadrant` | (0,0) and (2,−3) only real | (2,−3), origin rejected | −3/4, −3 | 9/13 | 34°41.71′ | 34°42′ | CLEAN |
| `angle_line_and_circle_x2_y2_10y` | (−3,1), (−4,2) | both | −1 and −3/4; −1 and −4/3 | 1/7 at both | 8°7.81′ | 8°8′ | CLEAN |
| `angle_x2_3y_3_and_x2_minus_y2_25` | (±2√6,−7); y=4 gives x=±3i | (2√6,−7), y=4 rejected | −4√6/3, −2√6/7 | 22√6/69 | 37°59.38′ | 37°59′ | CLEAN |
| `angle_xy_2_and_x2_plus_4y` | (−2,−1) only real | (−2,−1) | −1/2, 1 | 3 | 71°33.9′ | 71°34′ | **MISLEADING (F-5)** |
| `angle_y2_4x_and_circle_5` | (1,±2); x=−5 rejected | (1,2) | 1, −1/2 | 3 | 71°33.9′ | 71°34′ | CLEAN |
| `angle_y2_8x_and_ellipse_32` | (2,±4); x=−4 rejected | (2,4) | 1, −2 | 3 | 71°33.9′ | 71°34′ | CLEAN |
| `curves_touch_at_half_half` | (½,½) on both (verified 0 and 0) | (½,½) | −1/2 and −1/2 | — | tangent 2x+4y=3 | same | CLEAN |
| `curves_y2_4x_plus_1_and_y2_36_9_minus_x_orthogonal` | (8,6), (8,−6) | both | 1/3,−3 and −1/3,3 | m₁m₂ = −1 | orthogonal | same | CLEAN |

Named checks behind each CLEAN:

- **`angle_2y2_9x_and_3x2_4y_fourth_quadrant`** — elimination reproduced: x = 2y²/9 → 4y⁴/27 + 4y = 0
  → y(y³+27) = 0. sympy's full solve returns exactly two real points, (0,0) and (2,−3), plus a complex
  conjugate pair — so "the curves meet at two points" is right. **(2,−3) substituted back: 2(9)−9(2) = 0
  and 3(4)+4(−3) = 0 ✓**, and x > 0, y < 0 puts it in the fourth quadrant ✓. m₁ = 9/(4y) = −3/4 and
  m₂ = −3x/2 = −3 both re-derived. tanθ = |(−3/4+3)/(1+9/4)| = (9/4)/(13/4) = 9/13; arctan(9/13) =
  34.69515° = 34°41.7′, so "≈ 34°42′" is the correct rounding. The `why`'s claim that the origin would
  give a different answer is true and I checked it: at the origin the parabola 2y² = 9x has the
  y-axis as tangent and 3x² = −4y has the x-axis, i.e. 90°, not 34°42′.
- **`angle_line_and_circle_x2_y2_10y`** — both points substituted back into the circle: 9+1−10 = 0 ✓,
  16+4−20 = 0 ✓, and both satisfy x+y+2 = 0 ✓. Circle slope re-derived as x/(5−y) (equivalent to the
  usual −(x)/(y−5)) ✓. tanθ = 1/7 at **both** points independently — I recomputed each rather than
  trusting the symmetry claim. arctan(1/7) = 8.13010° = 8°7.8′ → 8°8′ ✓. The geometric claim in the
  `why` ("the two radii to the ends of a chord make equal angles with it") is a true theorem
  (isosceles triangle), and the tip "for ax+by+c = 0 the slope is −a/b" is correct.
- **`angle_x2_3y_3_and_x2_minus_y2_25`** — sympy's solve returns (±2√6, −7) real and (±3i, 4)
  complex, so the card's rejection of y = 4 "because x² = −9 is impossible" is exactly right.
  (2√6,−7) substituted back: 24 − 21 = 3 ✓ and 24 − 49 + 25 = 0 ✓. m₁ = −2x/3 = −4√6/3;
  m₂ = x/y = −2√6/7 (sign of the −y² handled correctly). m₁ − m₂ = −22√6/21 ✓, m₁m₂ = 48/21 ✓,
  1 + m₁m₂ = 69/21 ✓, tanθ = 22√6/69 = 0.78099673; arctan = 37.98972° = 37°59.4′ → 37°59′ ✓.
  "22 and 69 share no factor" verified (2·11 vs 3·23).
- **`angle_y2_4x_and_circle_5`** — (1,2) substituted back: y² = 4 = 4x ✓ and 1+4 = 5 ✓; x = −5
  correctly rejected because y² = 4x forces x ≥ 0. m₁ = 2/y = 1, m₂ = −x/y = −1/2. tanθ =
  (3/2)/(1/2) = 3, θ = 71.56505° = 71°33.9′ → 71°34′ ✓. The tip "for x²+y² = r² the slope is −x/y
  because the tangent is perpendicular to the radius" is a true statement.
- **`angle_y2_8x_and_ellipse_32`** — (2,4) substituted back: 16 = 8(2) ✓ and 4(4)+16 = 32 ✓;
  x = −4 correctly rejected. m₁ = 4/y = 1, m₂ = −4x/y = −2. Denominator 1 + m₁m₂ = −1, so the
  modulus is doing real work here and the card says so. tanθ = 3 → 71°34′ ✓. The generalisation
  "for Ax² + By² = C the slope is −Ax/(By)" is true.
- **`curves_touch_at_half_half`** — both membership checks recomputed in exact rationals and both
  return **0**: 6(¼) − 5(½) + 2(½) = 0 and 4(¼) + 8(¼) − 3 = 0. m₁ = (5−12x)/2, which sympy gives
  as 5/2 − 6x — the same expression — equal to −1/2 at x = ½; m₂ = −x/(2y) = −1/2 at (½,½). Slopes
  equal, so the curves touch. **The common tangent 2x + 4y = 3 was verified independently**: the
  point-slope line y − ½ = −½(x − ½) rearranges to exactly 2x + 4y = 3, and (½,½) satisfies it.
  The definitional discipline is correct throughout — the card insists on common point AND common
  slope, and its bullet "using m₁m₂ = −1, which is the test for cutting at right angles" is right.
- **`curves_y2_4x_plus_1_and_y2_36_9_minus_x_orthogonal`** — sympy's solve returns exactly (8,6)
  and (8,−6); both substituted back into both curves (36 = 4·9 ✓, 36 = 36·1 ✓). m₁ = 2/y,
  m₂ = −18/y re-derived (the minus from 36(9−x) is present). **m₁m₂ = −1 confirmed exactly at both
  points**, and the general form −36/y² = −1 is valid because y² = 36 at every common point — the
  card states that condition. The bullet warning that tanθ = |(m₁−m₂)/(1+m₁m₂)| is undefined here
  is correct (1 + m₁m₂ = 0).

### Finding in this section

**F-5 · `angle_xy_2_and_x2_plus_4y` — MISLEADING.** Step `s1_intersection`, `memory_tip`:
*"A rectangular hyperbola xy = c always gives y = c/x, and substituting that turns the other
equation into a cubic."*
The first half is fine; the second half is stated as a general rule and is false. Substituting
y = c/x turns the *other* equation into a cubic only when that equation is of this card's particular
shape (one x² term and a first-power y). Counter-examples a student meets in the same exercise set:
into the straight line x + y = k it gives x² − kx + c = 0, a **quadratic**; into the circle
x² + y² = r² it gives x⁴ − r²x² + c² = 0, a **quartic**; into another rectangular hyperbola it gives
no equation in x at all. The word "always" at the head of the sentence carries into the second
clause, so a student reading this tip carries a false expectation into the very next question.
Suggested fix: *"A rectangular hyperbola xy = c always gives y = c/x — substitute that, and here it
clears to the cubic x³ + 8 = 0."*
The mathematics on the card is fully correct: (−2,−1) substituted back gives (−2)(−1) = 2 ✓ and
4 + 4(−1) = 0 ✓; x³ + 8 = (x+2)(x²−2x+4) with discriminant 4 − 16 < 0, so the card's claim of a single
real intersection is right; m₁ = −y/x = −1/2 and m₂ = −x/2 = 1 both re-derived; tanθ = |(−3/2)/(1/2)| = 3,
θ = 71°33.9′ → 71°34′ ✓.

Cross-card note (not a finding): three cards in this group — `angle_xy_2_and_x2_plus_4y`,
`angle_y2_4x_and_circle_5`, `angle_y2_8x_and_ellipse_32` — all land on tanθ = 3, θ ≈ 71°34′. I treated
that as a copy-paste smell and re-derived all three from their own stems independently. Each really is
3, from three different slope pairs (−½ and 1; 1 and −½; 1 and −2). No defect.

---

## Section 5 — Tangents, normals, subtangents and subnormals (8 cards)

Protocol: every derivative re-derived in sympy; every claimed point substituted back into the curve;
**subtangent = y/y′ and subnormal = y·y′ checked on a concrete numeric point on each card's own curve**
(the swap test the brief asks for) rather than read off the card's own definition line; every closed
form confirmed numerically at 20 dps with a random non-special parameter value.

| card | subtangent / subnormal (or line) recomputed | card | verdict |
|---|---|---|---|
| `subtangent_constant_subnormal_y2_over_a` | y/m = a; ym = y²/a | a; y²/a | CLEAN |
| `subnormal_constant_y2_4ax` | ym = 2a | 2a | CLEAN |
| `subnormal_constant_find_k` | ym = k a²⁻²ᵏ x²ᵏ⁻¹; k = ½ → a/2 | same | **THIN (F-6)** |
| `normal_y_x2_minus_4x_plus_2_at_4_2` | normal x + 4y − 12 = 0 | same | CLEAN |
| `astroid_tangent_ab_constant` | AB = abs(a) | abs(a) | CLEAN |
| `slope_normal_astroid_at_pi_over_4` | m = −1 → normal slope +1 | +1 | CLEAN |
| `normal_subnormal_catenary` | normal y²/a; subnormal (a/4)(e^(2x/a) − e^(−2x/a)) | same | **MISLEADING (F-7)** |
| `cycloid_tangent_normal_subtangent_subnormal` | 4 lengths, all confirmed | same | **MISLEADING (F-8)** |

Named checks behind each CLEAN:

- **`subtangent_constant_subnormal_y2_over_a`** — dy/dx of b·e^(x/a) re-derived = (b/a)e^(x/a) = y/a
  (the chain-rule 1/a is present and not inverted). **Swap test run**: with a = 1.7, b = 2.3, x = 0.63,
  y = 3.3399…, m = y/a = 1.9647…; y/m = 1.7000… = a and y·m = 6.5620… = y²/a — so the card has
  subtangent and subnormal the right way round. Part (i)'s answer contains no x and no y, so
  "constant" is justified; part (ii) still contains y and the card explicitly refuses to call it
  constant. The "length of the tangent y√(1+m²)/m" quoted in a mistake bullet is the correct formula.
- **`subnormal_constant_y2_4ax`** — implicit differentiation 2y·y′ = 4a, giving y·y′ = 2a directly.
  Subnormal = ym = 2a, free of x and y. The mark-numbering in the margin notes is right and I checked
  it: step 2 carries 2 marks, so the third step really is "the fourth mark".
- **`normal_y_x2_minus_4x_plus_2_at_4_2`** — **point substituted into the curve: 16 − 16 + 2 = 2**,
  so (4,2) is on it. y′ = 2x − 4 = 4 at x = 4 (tangent). **Normal slope taken as −1/m = −1/4, not −m**,
  and the card says so explicitly. Line: y − 2 = −¼(x − 4) → x + 4y − 12 = 0. **Both substitutions run:
  (4,2) satisfies the curve AND satisfies x + 4y − 12 = 0 (4 + 8 − 12 = 0).** The tangent quoted in
  the mistake bullet, 4x − y − 14 = 0, is also correct. No division-by-zero risk here (m = 4 ≠ 0).
- **`astroid_tangent_ab_constant`** — the parametrisation is verified on the card and I re-verified it:
  (a cos³θ)^(2/3) + (a sin³θ)^(2/3) = a^(2/3). dy/dx = (3a sin²θcosθ)/(−3a cos²θ sinθ) = −tanθ.
  Tangent reduced by hand to x/(a cosθ) + y/(a sinθ) = 1 — the collapse a sinθcos³θ + a sin³θcosθ =
  a sinθcosθ is correct. Intercepts A = (a cosθ, 0), B = (0, a sinθ) — **not swapped** (I checked by
  setting y = 0 and x = 0 in the unsimplified tangent as well). AB = √(a²cos²θ + a²sin²θ) = abs(a),
  and the card keeps the modulus.
- **`slope_normal_astroid_at_pi_over_4`** — dx/dθ = −3a cos²θ sinθ and dy/dθ = 3a sin²θ cosθ both
  re-derived; ratio = −tanθ (not +tanθ, not −cotθ). At θ = π/4, m = −1 and the normal slope is
  −1/(−1) = **+1**, i.e. the card does not stop at the tangent's slope. Perpendicularity check
  (−1)(+1) = −1.
- **`normal_subnormal_catenary` (mathematics only — see F-7 for the defect)** — m = ½(e^(x/a) − e^(−x/a))
  = sinh(x/a), confirmed by sympy. **The identity 1 + m² = y²/a² verified symbolically to exactly 0**
  and numerically (a = 1.7, x = 0.63: both sides 1.1437389267776929). Length of normal =
  y√(1+m²) = 1.9443561755220779 = y²/a = (a/4)(e^(x/a)+e^(−x/a))² — all three forms agree to 20 dps.
  Subnormal = ym = 0.68928618069950383 = (a/4)(e^(2x/a) − e^(−2x/a)). The a > 0 and y > 0 conditions
  needed to write √(y²/a²) = y/a are both stated on the card.
- **`cycloid_…` (mathematics only — see F-8)** — m = (a sin t)/(a(1+cos t)) = tan(t/2);
  y = a(1−cos t) = 2a sin²(t/2) (both verified symbolically). All four lengths recomputed at
  a = 1.7, t = 1.1 against the card's closed forms: subtangent 1.5150525121044401 = a sin t;
  subnormal 0.5695052130752211 = 2a sin³(t/2)/cos(t/2) **and** = a(1−cos t)tan(t/2), the card's
  alternative form; length of tangent 1.7771365783642412 = 2a sin(t/2); length of normal
  1.0895717009201557 = 2a sin(t/2)tan(t/2). The card's two cross-checks are both true:
  √(2ay) = 2a sin(t/2), and L_normal = m·L_tangent with subnormal = m²·subtangent (both confirmed
  numerically). **This card is the only one in the group that states its domain restriction**
  (0 < t < π so sin(t/2), cos(t/2) > 0 and every length is positive) — good practice.

### Findings in this section

**F-7 · `normal_subnormal_catenary` — MISLEADING.** Step `s4_subnormal`, `memory_tip`:
*"Subtangent divides, subnormal multiplies: y/m and ym. **The word with more letters, subnormal, is
the product.**"*
The mnemonic is false and it points the wrong way. "subnormal" has **9** letters; "subtangent" has
**10**. The word with more letters is *subtangent* — which is the one that **divides**. A student who
memorises this tip and applies it under exam pressure will pick the subtangent as the product, i.e.
will make exactly the swap the rest of the card is trying to prevent, and which this same card's own
`common_mistakes` bullet names: *"Dividing instead of multiplying, which gives the subtangent y/m."*
The two lines of mathematics above the tip are correct. Suggested replacement:
*"subNORMAL multiplies, subTANGENT divides — write both, y·m and y/m, before you choose."*
Or simply drop the letter-count sentence.

**F-8 · `cycloid_tangent_normal_subtangent_subnormal` — MISLEADING.** Step
`s3_subtangent_subnormal`, `margin_note`: *"The subtangent simplifies all the way back to a sin t,
which is a useful check: **it is exactly dy/dt divided by a**."*
It is not. For this curve dy/dt = a sin t, so the subtangent **equals dy/dt itself**, not dy/dt ÷ a
(which would be sin t). Numeric evidence at a = 1.7, t = 1.1: subtangent = 1.5150525121044401,
dy/dt = a sin t = 1.5150525121044401 (identical), dy/dt ÷ a = 0.8912073600614354 — off by the factor
a. A student who applies the stated "check" will conclude the correct answer a sin t is wrong. The
result a sin t itself is right and everything else on the card is right. Suggested fix:
*"…a useful check: it is exactly dy/dt."*

**F-6 · `subnormal_constant_find_k` — THIN.** Step `s3_power_zero` asserts uniqueness twice.
`lines`: *"The subnormal is constant at every point only if it does not depend on x. So the power of
x must be zero"*; `why`: *"**Setting the index of x to zero is the only condition available**, because
k and a cannot depend on x."* The subnormal is k·a²⁻²ᵏ·x²ᵏ⁻¹, and that is free of x in **two** ways:
2k − 1 = 0 (the intended k = ½), **or** the leading coefficient k·a²⁻²ᵏ = 0, i.e. **k = 0**. k = 0 is a
genuine solution of the question as stated: y = a¹⁻⁰x⁰ = a, a horizontal line, dy/dx = 0, subnormal
= y·y′ = 0 — constant. The card's own expression agrees: at k = 0 it reads 0·a²·x⁻¹ = 0 for all x ≠ 0.
The missing condition is one clause: *"k ≠ 0 (k = 0 gives the horizontal line y = a, whose subnormal
is 0 — constant but degenerate), so the power of x must be zero: 2k − 1 = 0."* The answer k = ½ and
the value a/2 are both correct and were re-derived, including the back-substitution
2 − 2k = 1, 2k − 1 = 0, subnormal = a/2, and the identification y² = ax.
Related, and only an observation: the card's `memory_tip` *"Only the parabola y² = 4ax family has a
constant subnormal"* is very nearly right — integrating y·y′ = c gives y² = 2cx + C, i.e. any
horizontally-shifted parabola y² = 4A(x − h), plus the degenerate c = 0 horizontal lines. Reading
"the y² = 4ax family" as including translates makes the tip true, so I am not counting it.

Sub-threshold observations in this section (NOT findings):
- `astroid_tangent_ab_constant` divides by a sinθ cosθ to reach intercept form, and that is zero at the
  astroid's four cusps (θ = 0, π/2, π, 3π/2), where the tangent meets only one axis — so "the same at
  every point of the curve" quietly excludes them. Every textbook treatment does the same and the card
  makes no false statement, so I did not raise it; the `cycloid` card, by contrast, does state its
  domain, which is the better pattern.
- `cycloid` s2 `memory_tip` says m "goes underneath as it does in the tangent line" — m goes underneath
  in the *length of the tangent* formula, not in the tangent line's equation y − y₁ = m(x − x₁).
  Loose wording in a mnemonic; the four formulas themselves are stated correctly right above it.
- `subtangent_constant_subnormal_y2_over_a` reports the subtangent as `a` rather than `abs(a)`, where
  `astroid_tangent_ab_constant` is careful to keep the modulus. Board-standard either way; noted only
  because two cards in the same unit differ.

---

# FINAL TALLY AND SUMMARY

All 33 cards examined. Every card carries exactly one verdict.

| band | count | cards |
|---|---|---|
| **WRONG** | **0** | — |
| **MISLEADING** | **5** | `sphere_radius_7_to_7_02`, `square_3_to_3_01`, `angle_xy_2_and_x2_plus_4y`, `normal_subnormal_catenary`, `cycloid_tangent_normal_subtangent_subnormal` |
| **THIN** | **3** | `dy_delta_y_x2_plus_x`, `dy_delta_y_ex_plus_x`, `subnormal_constant_find_k` |
| **CLEAN** | **25** | listed below |

**Not one mathematical result in the 33 cards is wrong.** Every final answer, every derivative, every
intersection point, every closed form was recomputed independently and agreed. The eight findings are
all in prose: three false or unresolvable sentences, one false mnemonic, one false "check", one bullet
that calls a correct answer wrong, and one uniqueness claim with an unstated condition. That is the
same shape the companion pass over the 29 sibling cards reported.

## Every finding, in one table

| # | card id | field / step | exact text | what it should say | numeric evidence | band |
|---|---|---|---|---|---|---|
| F-1 | `ts_ipe_m1b_ad_dy_delta_y_x2_plus_x` | `s2_delta_y.margin_note` | "Δx = 0.1 is ten times bigger than **in the previous part**, so dy and Δy sit further apart here — 2.1 against 2.11." | Drop the cross-card reference: "Δx = 0.1 is a large step, so dy and Δy sit further apart — 2.1 against 2.11." | Claim itself is TRUE — the preceding card in `units.json` is `dy_delta_y_x2_plus_3x_plus_6` with Δx = 0.01. Defect is that the card is served standalone, so "the previous part" points at nothing on the page. dy = 2.1, Δy = 2.11, gap 0.01 — all correct. | THIN |
| F-2 | `ts_ipe_m1b_ad_dy_delta_y_ex_plus_x` | `s2_delta_y.margin_note` and `s2_delta_y.why` | "much wider than **in the polynomial parts**" / "far wider than **in the polynomial parts**" | "much wider than a polynomial of the same size would give" | Claim itself is TRUE — the three polynomial dy/Δy cards have gaps 0.0001, 0.01 and 0.000005 vs this card's 0.02988151. Same standalone-reference defect. dy = 2.9882631820515321, Δy = 3.0181446914761592 — both correct. | THIN |
| F-3 | `ts_ipe_m1b_ad_sphere_radius_7_to_7_02` | `s2_answer.why` | "The exact increase is (4/3)π[(7.02)³ − 7³] = 3.9312π cm³, and the approximation gives 3.92π cm³. **They agree to three figures** because dr = 0.02 is small compared with r = 7." | "They agree to two figures" (or "to about 0.3%") | exact = 3.9312106666666667π = **12.350262550113833** cm³; approx = 3.92π = **12.315043202071989** cm³. Third significant figure differs (12.4 vs 12.3; 3.93 vs 3.92). Relative gap 0.285%. | MISLEADING |
| F-4 | `ts_ipe_m1b_ad_square_3_to_3_01` | `s2_answer.common_mistakes[1]` | "Giving 9.0601 **or 0.0601**, which answers a different question from the one asked." | "Giving 9.0601, the new area, instead of the increase; or working the exact difference without ever using dA = 2x·dx, which loses the method mark." | 0.0601 cm² **is** the exact increase in area — the quantity asked for. The same step's own `lines` call it "Exact increase … = 0.0601 cm²", its `margin_note` says "the exact value 0.0601 is worth writing beside it", and its `memory_tip` calls it "the exact answer 0.0601". The card contradicts itself. (Recomputed: (3.01)² − 3² = 0.0601 exactly; dA = 2(3)(0.01) = 0.06; difference (dx)² = 0.0001.) | MISLEADING |
| F-5 | `ts_ipe_m1b_ad_angle_xy_2_and_x2_plus_4y` | `s1_intersection.memory_tip` | "A rectangular hyperbola xy = c **always** gives y = c/x, and substituting that **turns the other equation into a cubic**." | "A rectangular hyperbola xy = c always gives y = c/x — substitute that, and here it clears to the cubic x³ + 8 = 0." | False as a general rule. Into x + y = k it gives the **quadratic** x² − kx + c = 0; into x² + y² = r² it gives the **quartic** x⁴ − r²x² + c² = 0. Cubic only for this card's particular second curve. The card's own mathematics is correct: (−2,−1) satisfies both curves, m₁ = −1/2, m₂ = 1, tanθ = 3, θ = 71.565051° = 71°33.9′ → 71°34′. | MISLEADING |
| F-6 | `ts_ipe_m1b_ad_subnormal_constant_find_k` | `s3_power_zero.lines` and `s3_power_zero.why` | "The subnormal is constant at every point **only if** it does not depend on x. So the power of x must be zero" / "Setting the index of x to zero **is the only condition available**" | Add the missing condition: "k ≠ 0 (k = 0 gives the horizontal line y = a, whose subnormal is 0 — constant but degenerate), so the power of x must be zero: 2k − 1 = 0." | Subnormal = k·a²⁻²ᵏ·x²ᵏ⁻¹ is free of x when 2k − 1 = 0 **or** when k·a²⁻²ᵏ = 0, i.e. k = 0. At k = 0 the curve is y = a¹x⁰ = a, y′ = 0, subnormal = y·y′ = 0 — constant. Answer k = ½ and value a/2 both re-derived and correct. | THIN |
| F-7 | `ts_ipe_m1b_ad_normal_subnormal_catenary` | `s4_subnormal.memory_tip` | "Subtangent divides, subnormal multiplies: y/m and ym. **The word with more letters, subnormal, is the product.**" | Drop the letter-count sentence, or: "subNORMAL multiplies, subTANGENT divides — write both, y·m and y/m, before you choose." | "subnormal" = **9** letters; "subtangent" = **10** letters. The word with more letters is subtangent, which **divides**. The mnemonic inverts itself and points a student straight at the swap the same card's `common_mistakes` warns about ("Dividing instead of multiplying, which gives the subtangent y/m"). Mathematics on the card is exact: normal = y²/a, subnormal = (a/4)(e^(2x/a) − e^(−2x/a)) = 0.68928618069950383 at a = 1.7, x = 0.63. | MISLEADING |
| F-8 | `ts_ipe_m1b_ad_cycloid_tangent_normal_subtangent_subnormal` | `s3_subtangent_subnormal.margin_note` | "The subtangent simplifies all the way back to a sin t, which is a useful check: **it is exactly dy/dt divided by a**." | "…a useful check: it is exactly dy/dt." | dy/dt = a sin t, so subtangent = dy/dt, not dy/dt ÷ a. At a = 1.7, t = 1.1: subtangent = **1.5150525121044401**, dy/dt = **1.5150525121044401** (identical), dy/dt ÷ a = **0.8912073600614354**. The stated check is off by the factor a and would make a student reject the correct answer. All four lengths on the card are correct. | MISLEADING |

## The CLEAN list — 25 cards, with the checks that were actually run

Approximations (5) — base point, sign of Δx, derivative re-derived, **approximation compared against
the true value at 20 dps** (all five are nearer the truth than their base point, as required):
1. `approx_root_65` — f′(64) = 1/16; 8.0625 vs true 8.0622577482985497; source √-vs-∛ discrepancy handled.
2. `approx_root_82` — f′(81) = 1/18; 9.0555556 vs true 9.0553851381374166.
3. `approx_cbrt_999` — f′(1000) = 1/300; 9.9966667 vs true 9.9966655549378598.
4. `approx_cbrt_7_8` — f′(8) = 1/12, Δx = −0.2; 1.9833333 vs true 1.9831924826807747.
5. `approx_cos_60_deg_5_min` — both conversions (5′ = π/2160 = 0.0014544410433286); 0.4987405 vs true 0.4987398887026634.

dy and Δy (3) — derivative in sympy, dy = f′(x)Δx and Δy = f(x+Δx) − f(x) both recomputed at 25 dps,
gap compared with the card's own claim about the gap:
6. `dy_delta_y_x2_plus_3x_plus_6` — 0.23 / 0.2301, gap 0.0001.
7. `dy_delta_y_5x2_plus_6x_plus_6` — 0.026 / 0.026005, gap 5×10⁻⁶; (2.001)² = 4.004001 exact.
8. `dy_delta_y_one_over_x_plus_2` — −0.0002 / −0.000199600798, sign discipline correct throughout.

Errors (5) — formula direction (Δy/y vs 100Δy/y), the n-multiplier for power laws, units:
9. `define_relative_and_percentage_error` — definitions the right way round; 0.5/50 = 0.01 → 1%.
10. `kxn_relative_error` — dy/y = n(dx/x), k genuinely cancels, exponent n not n−1.
11. `pendulum_percentage_error` — dT/T = ½(dl/l), the ½ not inverted; 1% → 0.5%; g drops out.
12. `sphere_diameter_40_error` — diameter halved to r = 20 AND error halved to dr = 0.01; dV = 16π = 50.2654825 cm³, dS = 1.6π = 5.0265482 cm²; units the right way round.
13. `square_side_up_4_percent` — dA/A = 2(dx/x) → 8%; the card's stated exact 8.16% recomputed as (1.04²−1)×100 = 8.16 exactly.

Angle / touching / orthogonality (7) — intersections solved in sympy **and substituted back into both
curves**, slopes re-derived implicitly, angle converted to degrees and minutes:
14. `angle_2y2_9x_and_3x2_4y_fourth_quadrant` — (2,−3) on both; the origin correctly excluded (and it really would give 90°, not 34°42′); tanθ = 9/13 → 34°41.71′.
15. `angle_line_and_circle_x2_y2_10y` — (−3,1) and (−4,2) both on both curves; tanθ = 1/7 computed separately at each; 8°7.81′.
16. `angle_x2_3y_3_and_x2_minus_y2_25` — y = 4 root correctly rejected (sympy returns x = ±3i there); tanθ = 22√6/69 = 0.78099673 → 37°59.38′.
17. `angle_y2_4x_and_circle_5` — (1,2) on both; x = −5 correctly rejected; tanθ = 3 → 71°33.9′.
18. `angle_y2_8x_and_ellipse_32` — (2,4) on both; x = −4 correctly rejected; 1 + m₁m₂ = −1 so the modulus matters and the card says so; tanθ = 3.
19. `curves_touch_at_half_half` — (½,½) substituted into both curves, **both give exactly 0**; m₁ = m₂ = −1/2; the common tangent 2x + 4y = 3 independently re-derived and the point verified on it.
20. `curves_y2_4x_plus_1_and_y2_36_9_minus_x_orthogonal` — (8,±6) both on both curves; **m₁m₂ = −1 confirmed exactly at both points**; the general −36/y² = −1 is valid because y² = 36 there, which the card states.

Tangents / normals / subtangents / subnormals (5) — **the y/y′ vs y·y′ swap test run numerically on
each card's own curve**, plus every closed form checked at a random parameter value:
21. `subtangent_constant_subnormal_y2_over_a` — y/m = a and ym = y²/a verified at a = 1.7, b = 2.3, x = 0.63; the "constant" claim is made only for part (i), and the card explicitly refuses it for part (ii).
22. `subnormal_constant_y2_4ax` — 2y·y′ = 4a → subnormal 2a, free of x and y; mark numbering checked against `mark_split`.
23. `normal_y_x2_minus_4x_plus_2_at_4_2` — point on the curve verified; normal slope −1/4 (not −4, not 1/4); x + 4y − 12 = 0 satisfied by (4,2); the tangent quoted in a bullet (4x − y − 14 = 0) also correct.
24. `astroid_tangent_ab_constant` — parametrisation verified on the curve; dy/dx = −tanθ; intercepts not swapped (checked by setting y = 0 and x = 0 independently); AB = abs(a), modulus kept.
25. `slope_normal_astroid_at_pi_over_4` — dx/dθ and dy/dθ re-derived; ratio −tanθ; at π/4 the normal slope is +1 and the card does not stop at the tangent's −1.

## Where I disagreed with a card and the card turned out to be right

1. **Three angle cards all answer Tan⁻¹3 ≈ 71°34′** (`angle_xy_2_and_x2_plus_4y`,
   `angle_y2_4x_and_circle_5`, `angle_y2_8x_and_ellipse_32`). My first reading was that one answer had
   been copy-pasted across siblings. I re-derived all three from their own stems: the slope pairs are
   genuinely different (−½ and 1; 1 and −½; 1 and −2) and all three really do give tanθ = 3. Not a defect.
2. **`angle_line_and_circle_x2_y2_10y` claims the same angle at both intersection points.** I expected
   the two ends of a chord to give different angles and treated the claim as an unproved shortcut. The
   card computes both explicitly, and both really are 1/7; the geometric reason it gives (the radii to
   the two ends of a chord make equal angles with it) is a true theorem. My objection was wrong.
3. **`subnormal_constant_y2_4ax` labels its third step "Fourth mark."** I read that as an off-by-one
   until I checked `mark_split`: step 2 carries 2 marks, so the third step is indeed the fourth mark.
4. **`angle_x2_3y_3_and_x2_minus_y2_25` gives the hyperbola's slope as +x/y.** I reached for the circle
   result −x/y and thought a sign had been dropped. Differentiating x² − y² + 25 = 0 gives
   2x − 2y·y′ = 0, so y′ = +x/y. The card is right and its tip (the sign inside the curve is the sign
   that flips) is a correct generalisation.
5. **`cycloid_…` gives the subnormal twice, as 2a sin³(t/2)/cos(t/2) and as a(1 − cos t)tan(t/2).**
   I read the second as an inconsistent alternative. They are identical (both 0.5695052130752211 at
   a = 1.7, t = 1.1).
6. **`approx_root_65`.** Its `verification.note` discusses a cube root at length and my first pass read
   that as the card having answered the wrong function. It has not: the card answers √65 as printed and
   only records the source book's internal mismatch. This is the one place I did read a
   `verification.note` — and only to confirm the *known* source defect was handled, never as evidence
   for a result.

## Coverage statement

**This was a dedicated pass over all 33 cards — not a sweep.** No card in the list was skimmed or
skipped, and no card is counted CLEAN on the strength of "looks fine": every CLEAN entry above names
the specific checks that produced it.

What "dedicated" means here, concretely:
- I read all 33 card files in full through a field extractor that prints every `lines` entry,
  `margin_note`, `why`, every `common_mistakes` bullet, `memory_tip`, `insider_note` and
  `recall.must_convey`, per step — 89 steps in total across the 33 cards.
- Every derivative was re-derived in sympy and compared with the card's, term by term.
- Every intersection point was solved independently in sympy (which also surfaced the complex roots
  the cards reject) and substituted back into **both** curve equations.
- Every numeric answer was recomputed with mpmath at 20–25 decimal places; approximation cards were
  additionally compared against their true values, and both numbers are reported in Section 1.
- The subtangent/subnormal swap test was run numerically, on the card's own curve, on every card in
  Section 5 rather than trusting the definition line the card states.
- Card ordering claims (F-1, F-2) were checked against `answer-book/units.json`, not assumed.
- No `verification.note` was used as evidence of correctness anywhere. The single exception is
  `approx_root_65`, where the brief names a known source defect and the note was read to confirm the
  card handled it.

**What I did NOT check, stated plainly:**
- The `recall.accept`, `recall.reject` and `recall.heard_as` arrays were not read (only
  `recall.must_convey` was). A defect hiding inside a spoken-answer phrase would not have been caught
  by this pass.
- `verification.note` bodies were not audited for provenance accuracy, mark-split sourcing, or the
  `appearances[]` claims — that is a different pass from this one.
- Rendering was not checked: no line-wrap, figure, KaTeX or pace inspection, and the cards were not
  opened in the player.
- Nothing outside these 33 ids was examined; the other cards in unit 10 belong to the three parallel
  examiners.

**One structural observation from the field census** (context, not a finding): across the 89 steps,
`memory_tip` is present on 89/89 and `margin_note` on 89/89, but `insider_note` is present on
**0/89**. That matches the known bank-wide gap for first-year maths recorded in project memory; it is
not a defect introduced by PR #181 and I raise it only so the zero is not mistaken for something this
pass overlooked.
