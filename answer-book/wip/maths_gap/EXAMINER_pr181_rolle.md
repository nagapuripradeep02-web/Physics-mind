# EXAMINER — PR #181, Applications of Derivatives (unit 10, mathematics_1b)
## Rolle / Lagrange MVT + tangent, normal, subtangent — 27 cards

Independent re-examination. Every card re-derived from its own `question_text`; no
`verification.note` was treated as evidence. Report only — no card file was touched.

---

## 1. Tally by band

| Band | Count | Cards |
|---|---|---|
| **WRONG** | **0** | — |
| **MISLEADING** | **2** | `lmvt_x2_minus_1_on_2_3`, `more_than_one_c_cubic` |
| **THIN** | **1** | `tangent_root_x_plus_root_y_equals_root_a` |
| **CLEAN** | **24** | listed in section 4 |

**Every piece of mathematics on all 27 cards is correct.** All 195 `common_mistakes`
bullets were read back against their own step's marked lines; two of the 195 name a
correct move as an error. Both defects are in explanatory prose beside correct
mathematics — the same shape the companion pass over the 29 sibling cards found.

Cross-cutting checks that came back clean on the whole corpus:

- **No Rolle card applies the theorem where f(a) != f(b).** Nine cards invoke Rolle: the
  seven `rolle_*` cards plus `more_than_one_c_cubic` and `no_k_two_distinct_roots`. Six
  compute both endpoint values explicitly and I re-computed every pair. The other three
  are the argument-shaped ones: `more_than_one_c_cubic` uses the three zeros (all
  re-checked), `no_k_two_distinct_roots` uses f(alpha) = f(beta) = 0 from the assumed
  roots, and `rolle_holds_find_a_and_b` correctly uses f(1) = f(3) as the given it is told
  to use — I confirmed f(1) = f(3) = 6 does hold for the a and b it finds. All nine state
  the three hypotheses with the correct closed/open pairing.
- **No LMVT card demands the third hypothesis.** All five LMVT-shaped cards
  (`lmvt_*`, `find_c_*`) state exactly two conditions. `lmvt_sin_x_minus_sin_2x_on_0_pi`
  has f(0) = f(pi) = 0 by coincidence and correctly presents that as *why the chord
  slope is 0*, not as a required condition.
- **No `c` outside its open interval, and no dropped root.** Every reported `c` was
  recomputed and located strictly inside (a, b). The only transcendental derivative in
  the corpus (cos x − 2cos 2x on (0, pi)) was root-scanned numerically over 20,001
  points: exactly two zeros exist, 0.567829373 and 2.205663198, and both cards report
  both.
- **Subtangent / subnormal are never swapped.** All three subtangent cards use
  subtangent = y/m and subnormal = y·m, confirmed symbolically at a general point.
- **Every tangent and normal passes through its point of contact and has the right
  slope** (residual 0 and slope match, checked by symbolic differentiation of the
  boxed line equation itself, not of the card's working).
- **Marks arithmetic**: on all 27, `mark_split` totals = step marks totals =
  `marks_total`, labels align one-to-one with steps, exactly one `boxed_final`.

---

## 2. Findings table

| # | Card | Band | Exact line | What it says | What it should say | Numeric evidence |
|---|---|---|---|---|---|---|
| 1 | `ts_ipe_m1b_ad_lmvt_x2_minus_1_on_2_3` | **MISLEADING** | step `s1_conditions_and_slope`, `common_mistakes[2]` | "Computing f(3) − f(2) as 3² − 2² = 5 by accident, which is right here only because the −1 cancels." | It is not an accident and it is not "here only". For f(x) = x² − 1 the constant cancels in *every* difference on *every* interval: f(b) − f(a) = (b² − 1) − (a² − 1) = b² − a² identically. Writing 3² − 2² is a valid simplification, not an error. Suggested rewrite: drop the bullet, or reword to "the −1 cancels in the difference, so 3² − 2² is a legitimate shortcut — but write f(3) and f(2) out when the constant does not cancel." | f(3) − f(2) = 8 − 3 = 5; 3² − 2² = 9 − 4 = 5. Identical for all a, b, so the "coincidence" framing is false. |
| 2 | `ts_ipe_m1b_ad_more_than_one_c_cubic` | **MISLEADING** | step `s2_two_applications`, `common_mistakes[1]` | "Solving f′(x) = 3x² − 12x + 11 = 0 and calling that the proof; the roots confirm the answer, but the question asks for an argument from Rolle's theorem." | Exhibiting two distinct roots of f′ inside (1, 3) **is** a complete and rigorous proof of the stated claim, and the printed `question_text` ("Prove that there is more than one c in (1, 3) such that f′(c) = 0") does not ask for Rolle's theorem. The bullet names a correct proof as a mistake. Suggested rewrite: "Solving f′(x) = 0 does prove the claim, but this question sits in the Rolle's theorem section and the expected answer is the two-interval Rolle argument — use the roots only as a check." Note the card's own `margin_note` on the same step uses exactly this computation and calls it "a numerical check". | f′(x) = 3x² − 12x + 11 has roots 2 ± 1/sqrt(3) = 1.42264973081 and 2.57735026919; both lie in (1, 3), both distinct, f′ = 0 at each to machine precision. A direct proof, complete on its own. |
| 3 | `ts_ipe_m1b_ad_tangent_root_x_plus_root_y_equals_root_a` | **THIN** (low severity) | step `s4_use_condition`, line "Divide both sides by √(x₁y₁) = √x₁·√y₁" | The division is performed with no statement that x₁ != 0 and y₁ != 0. | Both excluded points are genuinely on the curve: (a, 0) and (0, a) satisfy √x + √y = √a, and at each the printed form x·x₁^(−1/2) + y·y₁^(−1/2) = a^(1/2) is undefined (the tangent is horizontal at (a, 0) and vertical at (0, a)). One clause — "for a point with x₁ > 0 and y₁ > 0" — closes it. | At (a, 0): dy/dx = −√y₁/√x₁ = 0, tangent y = 0, but y·y₁^(−1/2) divides by 0. At (0, a): dy/dx → −infinity, tangent x = 0, and x·x₁^(−1/2) divides by 0. Everywhere else the card is exact — the boxed form has residual 0 at (x₁, y₁) and slope −√y₁/√x₁, matching implicit differentiation. |

**Severity read.** None of the three is a wrong answer; none would cost a student a
mark in the exam. Finding 3 is the textbook convention (the printed target itself
presupposes x₁, y₁ > 0), so it is flagged for completeness rather than as a required
fix. Findings 1 and 2 are worth editing because they actively teach a student to
distrust a correct move.

---

## 3. The two flagged cards are otherwise correct

For the record, so nobody re-derives them:

- `lmvt_x2_minus_1_on_2_3`: f = x^2 - 1 on [2, 3]; f(2) = 3, f(3) = 8; chord slope
  (8 - 3)/1 = 5; f'(x) = 2x; 2c = 5 gives c = 5/2 = 2.5, strictly inside (2, 3);
  f'(2.5) = 5.00000000 = chord slope. The midpoint claim (2 + 3)/2 = 5/2 is a true
  theorem for every quadratic. Only the one bullet is at fault.
- `more_than_one_c_cubic`: f = (x-1)(x-2)(x-3) = x^3 - 6x^2 + 11x - 6;
  f(1) = f(2) = f(3) = 0; polynomial, so continuous and differentiable on each of
  [1, 2] and [2, 3]; Rolle applies twice; the subintervals are disjoint so c1 != c2.
  The margin note's numbers (2 - 1/sqrt3 = 1.423, 2 + 1/sqrt3 = 2.577) are correct to
  the digits printed. Only the one bullet is at fault.

---

## 4. CLEAN list - 24 cards, with the checks actually run

Every entry names the endpoint values, the c (or point and slope), and the independent
recomputation. Nothing here is a "looks fine".

### Rolle's theorem

1. **`rolle_x2_minus_1_on_minus1_1`** - f = x^2 - 1 on [-1, 1]. Polynomial, so (i) and
   (ii) hold with the correct closed/open pairing. f(-1) = 0, f(1) = 0, equal. f' = 2x,
   sole root c = 0, strictly inside (-1, 1); f'(0) = 0 exactly. No second root. The prose
   claim "between two roots of a differentiable function the derivative is zero somewhere"
   is Rolle itself - true.
2. **`rolle_x2_plus_4_on_minus3_3`** - f = x^2 + 4 on [-3, 3]. f(-3) = 13, f(3) = 13, equal
   (both computed on the card). f' = 2x, sole root c = 0 in (-3, 3), f'(0) = 0.
3. **`rolle_x2_minus_1_x_minus_2`** - f = (x^2-1)(x-2) on [-1, 2]. Expansion verified:
   x^3 - 2x^2 - x + 2. f(-1) = 0, f(2) = 0, equal. f' = 3x^2 - 4x - 1 (verified by
   differentiating the expansion), roots (2 +/- sqrt7)/3 = 1.54858377 and -0.21525044.
   Both strictly inside (-1, 2), both reported - **no root dropped**. sqrt7 = 2.6457513,
   matching the card's 2.646.
4. **`rolle_log_x2_plus_2_minus_log_3`** - f = log(x^2+2) - log 3. x^2 + 2 >= 2 > 0 for
   every real x, so the domain objection is correctly disposed of. f(-1) = log 3 - log 3
   = 0, f(1) = 0, equal. f' = 2x/(x^2+2) (verified), sole root c = 0 in (-1, 1). See
   section 5 for the open-interval notation in the question, which the card handles
   explicitly.
5. **`rolle_x_x_plus_3_e_minus_x_over_2`** - f = x(x+3)e^(-x/2) on [-3, 0]. f(-3) = 0
   (zero bracket times e^(3/2)), f(0) = 0, equal. The card's factored derivative
   -(e^(-x/2)/2)(x-3)(x+2) was checked against sympy's derivative: the difference
   simplifies to exactly 0. Roots x = -2 and x = 3; 3 correctly rejected as outside
   (-3, 0); c = -2 strictly inside, f'(-2) = 0.
6. **`rolle_sin_x_minus_sin_2x_on_0_pi`** - f = sin x - sin 2x on [0, pi]. f(0) = 0,
   f(pi) = sin pi - sin 2pi = 0, equal. f' = cos x - 2cos 2x. The reduction
   4cos^2 c - cos c - 2 = 0 is algebraically exact; cos c = (1 +/- sqrt33)/8 =
   0.843070331 and -0.593070331. c = 0.567829373 and c = 2.205663198, **both** strictly
   in (0, pi), **both** reported; f' evaluates to 0 at each to 126 digits. A 20,001-point
   scan of f' over (0, pi) finds exactly these two zeros and no third. The card's rounded
   0.568 and 2.206 are correct to 3 dp (2.205663 rounds to 2.206 - I initially doubted
   this; see section 5). The margin claim that Cos-inverse maps (-1, 1) onto (0, pi) is
   true.
7. **`more_than_one_c_cubic`** - see section 3 (flagged for one bullet only; the
   mathematics is fully correct, including both applications of Rolle and the
   disjointness argument that makes c1 != c2).
8. **`no_k_two_distinct_roots`** - f = x^2 - 3x + k. The contradiction is airtight:
   f'(x) = 2x - 3 has its only zero at c = 3/2, independent of k; if two roots
   alpha < beta lay in [0, 1] then 0 <= alpha < c < beta <= 1 forces c < 1, contradicting
   3/2 > 1. The card writes that inequality chain explicitly, which is the load-bearing
   line. The discriminant named in a bullet (9 - 4k) is correct. Back-substitution is
   vacuous here - the answer is that no k exists - and the argument holds for every real
   k precisely because c = 3/2 carries no k, which the `why` states correctly.
9. **`rolle_holds_find_a_and_b`** - inverse shape, answer substituted back. f = x^3 + bx^2
   + ax on [1, 3] with c = 2 + 1/sqrt3. f(1) = f(3) gives a + 4b = -13 (verified).
   3c^2 = 13 + 4sqrt3 = 19.9282032303 (both forms agree numerically). Solving the pair
   symbolically returns exactly {a: 11, b: -6}, the card's answer. **Back-substitution:**
   f = x^3 - 6x^2 + 11x has f(1) = 6 and f(3) = 6, so the Rolle hypothesis the answer was
   supposed to produce does hold; f' = 3x^2 - 12x + 11 has roots 2 +/- 1/sqrt3 =
   1.42264973 and 2.57735027, so the given c = 2 + 1/sqrt3 = 2.57735027 really is a zero
   of f' and lies strictly in (1, 3).

### Lagrange's mean value theorem

10. **`find_c_ex_on_0_1`** - f = e^x on [0, 1]. Two conditions only, correctly. f(0) = 1,
    f(1) = e; chord slope = e - 1 = 1.71828182846. c = log(e - 1) = 0.541324854613,
    strictly in (0, 1); f'(c) = e^c = 1.71828182846, matching the chord slope to 12 s.f.
    (Nit, not a defect: the `margin_note` denies "log_e(e-1) = 1 - log_e e" while the
    matching `common_mistakes` bullet denies "1 - log_e 1"; the first decoy equals 0, the
    second equals 1. Both denials are true, so nothing false is taught, but the two lines
    name different wrong answers for the same slip.)
11. **`find_c_x2_minus_3x_minus_1`** - f = x^2 - 3x - 1, a = -11/7, b = 13/7.
    f(13/7) = -153/49 = -3.12244897959 and f(-11/7) = 303/49 = 6.18367346939, both as
    printed. b - a = 24/7. Chord slope = -19/7 exactly (sympy). 2c - 3 = -19/7 gives
    c = 1/7, and the midpoint (-11/7 + 13/7)/2 = 1/7 agrees. -11/7 < 1/7 < 13/7, strictly
    inside. The general claim "for any quadratic c is the midpoint" is a true theorem, not
    a coincidence of these numbers (see section 5).
12. **`lmvt_log_x_on_1_2`** - f = log x on [1, 2]. The domain condition correctly carries
    the first mark: log x is differentiable exactly on x > 0 and [1, 2] sits inside it.
    f(1) = 0, f(2) = log 2; chord slope = 0.693147180560. c = 1/log 2 = 1.44269504089,
    strictly in (1, 2); f'(c) = 1/c = 0.693147180560, matching to 12 s.f. The bullet
    "1/log_e 2 is not log_e(1/2), which is negative" is true (log 0.5 = -0.693).
13. **`lmvt_x2_minus_1_on_2_3`** - see section 3 (flagged for one bullet only).
14. **`lmvt_sin_x_minus_sin_2x_on_0_pi`** - same function and the same two roots as item 6,
    verified identically. The card states only the two LMVT conditions, and correctly
    explains that f(0) = f(pi) = 0 is what makes the chord slope 0 rather than a hypothesis
    it needed. Its bullet "taking sin 2pi as 1 makes the chord slope -1/pi" is
    arithmetically right: (0 - 1 - 0)/pi = -1/pi.
15. **`state_rolle_and_lagrange`** - statement card, checked word by word. Rolle: continuous
    on the **closed** [a, b], differentiable on the **open** (a, b), f(a) = f(b), conclusion
    "at least one c in (a, b) with f'(c) = 0" - all three hypotheses present, intervals
    correctly paired, conclusion on f' and not on f. Lagrange: the same two conditions,
    conclusion f'(c) = (f(b) - f(a))/(b - a) with c in the open interval. Both geometric
    readings are correct. The boxed link ("Rolle is the special case f(a) = f(b) of
    Lagrange") is true. The bullet "saying the tangent is parallel to the x-axis is true
    for Rolle but not for Lagrange" is correct. Nothing dropped, nothing mis-paired - safe
    to memorise verbatim.
16. **`tangent_parallel_chord_y_x2`** - both given points verified on y = x^2 (0 = 0^2,
    1 = 1^2). Chord slope (1 - 0)/(1 - 0) = 1. 2x = 1 gives x = 1/2, y = (1/2)^2 = 1/4;
    the point (1/2, 1/4) is returned in full, and 1/2 lies strictly in (0, 1) as LMVT
    requires. The `why` correctly identifies this as LMVT in geometric form.

### Subtangent and subnormal

17. **`subtangent_constant_y_a_power_x`** - subtangent = y/m (correct orientation; the
    subnormal ym is named in a bullet as the wrong choice, also correct). m = a^x log_e a,
    so y/m = 1/log_e a, verified symbolically and numerically (a = 3, x = 2: subtangent
    0.910239226627 = 1/log 3 = 0.910239226627, independent of x). The card adds "a != 1",
    which the question omits and which the answer needs. The side claim that y = b e^(x/a)
    has slope y/a was checked symbolically: true. The length-of-tangent formula
    y sqrt(1+m^2)/m quoted in a bullet is the standard one.
18. **`subtangent_squared_varies_subnormal`** - by^2 = (x+a)^3. Implicit differentiation
    gives m = 3(x+a)^2/(2by), matching. Subtangent y/m = 2by^2/(3(x+a)^2), which on the
    curve simplifies to exactly 2(x+a)/3 (sympy difference = 0). Subnormal ym =
    3(x+a)^2/(2b) (difference = 0). Ratio (subtangent)^2/subnormal = 8b/27 exactly - free
    of x and y, which is precisely the wording the card uses for "varies as". The two
    lengths are not swapped. (Nit, not a defect: at the single point x = -a, y = 0 the
    curve has a cusp and both lengths degenerate to 0, so the ratio is 0/0 there; unlike
    finding 3 that point has no well-defined subtangent at all, so nothing false is
    asserted.)
19. **`subtangent_subnormal_b_sin_x_over_a`** - y = b sin(x/a), m = (b/a)cos(x/a) (the
    chain-rule factor 1/a is present). Subtangent y/m = a tan(x/a), verified symbolically
    (difference = 0). Subnormal ym = (b^2/a)sin(x/a)cos(x/a) = (b^2/2a)sin(2x/a), verified
    symbolically (difference = 0). Both orientations correct; the double-angle step is
    exact. (Nit: the third bullet of s3 labels the mechanism of the error oddly - "doubling
    the whole expression instead of the angle, giving sin(2x)/a" - but the wrong answer it
    warns against, sin(2x)/a, is a genuine wrong answer, so the takeaway is correct.)

### Tangents and normals

For items 20-25 each boxed line was checked two ways: the point of contact substituted into
the printed line (residual must be 0), and the line's own slope -(dL/dx)/(dL/dy) recomputed
from the printed equation and matched against dy/dx of the curve at that point. Both tests
passed on every line - I checked the printed answer, not the card's working.

20. **`tangent_normal_2e_minus_x_over_3_y_axis`** - y = 2e^(-x/3) meets x = 0 at (0, 2).
    m = (-2/3)e^(-x/3) at x = 0 is -2/3. Tangent 2x + 3y - 6 = 0: residual 0 at (0, 2),
    slope -2/3. Normal 3x - 2y + 4 = 0: residual 0, slope 3/2 = -1/m. Slope product -1.
21. **`tangent_normal_quartic_at_0_5`** - point (0, 5) verified on the curve. dy/dx =
    4x^3 - 18x^2 + 26x - 10; at x = 0, m = -10. Tangent 10x + y - 5 = 0: residual 0, slope
    -10. Normal x - 10y + 50 = 0: residual 0, slope 1/10.
22. **`tangent_normal_x3_plus_4x2_at_minus1_3`** - point verified: (-1)^3 + 4(-1)^2 = 3.
    dy/dx = 3x^2 + 8x; at x = -1, m = 3 - 8 = -5. Tangent 5x + y + 2 = 0: residual 0
    (-5 + 3 + 2), slope -5. Normal x - 5y + 16 = 0: residual 0 (-1 - 15 + 16), slope 1/5.
23. **`tangent_normal_xy_10_at_2_5`** - point verified: 2 x 5 = 10. y = 10/x,
    dy/dx = -10/x^2; at x = 2, m = -5/2. Tangent 5x + 2y - 20 = 0: residual 0
    (10 + 10 - 20), slope -5/2. Normal 2x - 5y + 21 = 0: residual 0 (4 - 25 + 21),
    slope 2/5.
24. **`tangent_normal_y4_ax3_at_a_a`** - point verified for every a: a^4 = a(a^3). Implicit
    differentiation gives dy/dx = 3ax^2/(4y^3); at (a, a) this is 3a^3/(4a^3) = 3/4, a pure
    number, so the card's "the tangent has the same direction whatever the size of a" is
    true. Tangent 3x - 4y + a = 0: residual 0 (3a - 4a + a), slope 3/4. Normal
    4x + 3y - 7a = 0: residual 0 (4a + 3a - 7a), slope -4/3. The card's added "a != 0" is
    correct and is not in the question.
25. **`tangent_normal_y_5x4_at_1_5`** - point verified: 5(1)^4 = 5. dy/dx = 20x^3, m = 20.
    Tangent 20x - y - 15 = 0: residual 0 (20 - 5 - 15), slope 20. Normal x + 20y - 101 = 0:
    residual 0 (1 + 100 - 101), slope -1/20.
26. **`tangent_sec_tan_curve`** - x = c sec(t), y = c tan(t). dx/dt = c sec t tan t,
    dy/dt = c sec^2 t, quotient = sec/tan = 1/sin t, verified symbolically (difference from
    cosec = 0). The target line y sin t - x + c cos t = 0 was tested directly: substituting
    the parametric point gives residual **exactly 0** for all t, and the line's slope is
    1/sin t, matching dy/dx. The identity route (sec t = sec^2 t cos t, tan t sin t =
    tan^2 t cos t, sec^2 - tan^2 = 1) is valid, and the bullet "sec^2 + tan^2 = 1 is not an
    identity" is correct.

The 27th card, `tangent_root_x_plus_root_y_equals_root_a`, is the THIN entry (finding 3).
Its mathematics is exact everywhere x1, y1 > 0: implicit differentiation gives
dy/dx = -sqrt(y)/sqrt(x); the intermediate form sqrt(y1)x + sqrt(x1)y = sqrt(y1)x1 +
sqrt(x1)y1 is correct; the right side does factor as sqrt(x1 y1)(sqrt(x1) + sqrt(y1)) =
sqrt(x1 y1) sqrt(a); and the boxed form has residual 0 at (x1, y1) and slope
-sqrt(y1)/sqrt(x1), matching.

---

## 5. Where I disagreed with a card and the card turned out to be right

1. **`rolle_log_x2_plus_2_minus_log_3` - the question states an OPEN interval.** The
   `question_text` reads "Verify Rolle's theorem for the function log(x^2 + 2) - log 3 on
   (-1, 1)". My first call was WRONG: Rolle's theorem needs a closed interval and the two
   endpoint values, so a card applying it on an open interval would have an unchecked
   hypothesis. Reading the card changed my mind - its first line writes "taken on the
   closed interval [-1, 1]", its margin note says why ("The interval is read as the closed
   interval [-1, 1], since the endpoint values are needed"), and conditions (i) and (ii)
   are then correctly paired closed/open. The loose notation is the source question's, and
   the card is the thing that repairs it. CLEAN.
2. **`find_c_x2_minus_3x_minus_1` - "for any quadratic, c is the midpoint of the
   interval".** This is exactly the shape the brief warned about: a fact true of the card's
   own numbers dressed up as a theorem. I nearly filed it MISLEADING. It is a genuine
   theorem - for f = px^2 + qx + r the MVT point is (a+b)/2 for every interval - so the
   claim is sound, and `lmvt_x2_minus_1_on_2_3` makes the same claim correctly. CLEAN.
3. **`subtangent_squared_varies_subnormal` - a "constant" that still contains a letter.**
   The boxed conclusion is (subtangent)^2 = (8b/27) x subnormal, and I first read the
   surviving b as a failed constancy claim. It is not: b is a parameter of the curve, not a
   coordinate, and "varies as" requires only that the ratio be free of x and y - which is
   the exact wording the card uses. Verified 8b/27 symbolically. CLEAN.
4. **`subtangent_constant_y_a_power_x` - a = 1 not excluded.** The question says only
   a > 0, and the answer 1/log_e a is undefined at a = 1, so I expected a THIN. The card's
   very first line already reads "a > 0 and a != 1" - it is stricter than the question it
   was given. CLEAN.
5. **`rolle_sin_x_minus_sin_2x_on_0_pi` - the second root's third decimal.** My hand
   estimate of arccos(-0.5930703) came to 2.205, against the card's 2.206, and I opened it
   as a rounding defect. mpmath gives 2.205663198, which rounds to 2.206 at 3 dp. The card
   is right and my estimate was short. CLEAN.

---

## 6. Coverage statement

**Dedicated pass on all 27 cards. No card was skimmed, and no card is counted CLEAN
without a named check.** Concretely, for each card I:

- read the complete JSON (question_text, every `lines` entry of every step, every
  `margin_note`, `memory_tip`, `why`, `recall.must_convey`, and all `common_mistakes`
  bullets - 195 bullets across the corpus, every one read back against its own step's
  marked lines);
- re-derived the mathematics from the `question_text` alone, with sympy, ignoring the
  card's working and its `verification.note`;
- for Rolle and LMVT: computed both endpoint values, confirmed or refused f(a) = f(b) as
  the shape required, solved f' = 0 (or the LMVT equation) over the whole open interval,
  compared the full solution set against what the card reports, and evaluated f' at the
  card's own c to at least 12 significant figures (126 digits for the trigonometric pair);
- for the one transcendental derivative in the corpus, added a 20,001-point sign-change
  scan plus mpmath root polishing to prove no root was dropped;
- for tangents, normals and subtangents: differentiated independently, then tested the
  card's **printed boxed answer** (not its working) by substituting the point of contact
  into the line and by recomputing the line's own slope;
- confirmed subtangent = y/m and subnormal = y m orientation numerically at a general
  point on each of the three subtangent cards;
- ran a structural check across all 27 (mark_split total = step marks total = marks_total,
  label alignment, exactly one boxed_final, subject/unit fields) - all 27 pass.

Two limits worth stating plainly. First, I verified the mathematics and the internal
consistency of each card; I did **not** verify the source attributions in
`verification.note` (book, page, question number) or the mark splits against a real
Telangana IPE mark scheme - those remain `needs_teacher_verification: true` on every card,
as authored. Second, the plain-language (Rule 41) register was read informally as part of
reading the prose, not audited systematically; nothing idiomatic stood out, but that is an
impression, not a gate result.
