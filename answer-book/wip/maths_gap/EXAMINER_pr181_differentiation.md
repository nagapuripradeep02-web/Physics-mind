# Independent examiner pass — PR #181 Differentiation cards (Maths-1B, unit 9)

**Corpus:** all 72 `ts_ipe_m1b_dif_*` cards in `answer-book/questions/`.
**Method:** every derivative re-derived independently with sympy from the card's own
`question_text`, then (a) evaluated against the card's claimed derivative at **two** numeric
points to ≥8 significant figures, and (b) cross-checked against a central difference quotient
`(f(x+h) − f(x−h)) / 2h`, `h = 1e-5`, at an interior point. `verification.note` was treated as
prose, never as evidence. Prose (`why`, `memory_tip`, `margin_note`, `common_mistakes`) read as
claims to be checked.

*(This file is written incrementally, group by group.)*

**The tally, the consolidated findings table, the "I disagreed" section and the coverage
statement are in the `# Summary` section at the end.** The six group sections between here and
there carry the per-card evidence.

---

## Group 1 — First principles (9 cards)

Every one re-derived with sympy, symbolic `d/dx(f) − claimed = 0`, two numeric points, and a
central difference quotient at each point. The three sum-to-product identities the group leans on
were also verified symbolically (`cos²A − cos²B = −sin(A+B)sin(A−B)`,
`cos C − cos D = −2 sin((C+D)/2) sin((C−D)/2)`, `sin C − sin D = 2 cos((C+D)/2) sin((C−D)/2)` — all
three reduce to 0).

| card | claimed f′ | symbolic diff | pt 1 (sympy / claimed / CD) | pt 2 |
|---|---|---|---|---|
| `first_principle_cos_ax` | −a sin ax | 0 | x=0.7, a=2.3: −2.29823275916920 / same / −2.29823275896615 | x=1.9: 2.16649714838886 / same / 2.16649714820660 |
| `first_principle_cos_squared_x` | −sin 2x | 0 | x=0.4: −0.717356090899523 / same / −0.717356090845778 | x=1.3: −0.515501371821464 / same / −0.515501371790850 |
| `first_principle_cot_x` | −cosec²x | 0 | x=0.6: −3.13655504170455 / same / −3.13655504247112 | x=2.2: −1.52983226072562 / same / −1.52983226086589 |
| `first_principle_log_x` | 1/x | 0 | x=0.8: 1.25000000000000 / same / 1.25000000005954 | x=3.1: 0.322580645161290 / same / 0.322580645162329 |
| `first_principle_root_x_plus_1` | 1/(2√(x+1)) | 0 | x=0.5: 0.408248290463863 / same / 0.408248290473256 | x=4.0: 0.223606797749979 / same / 0.223606797744580 |
| `first_principle_sec_3x` | 3 sec 3x tan 3x | 0 | x=0.2: 2.48675858396064 / same / 2.48675858687264 | x=0.9: 1.56866119571501 / same / 1.56866119719323 |
| `first_principle_sin_2x` | 2 cos 2x | 0 | x=0.3: 1.65067122981936 / same / 1.65067122971374 | x=1.7: −1.93359638515892 / same / −1.93359638504254 |
| `first_principle_tan_2x` | 2 sec²2x | 0 | x=0.35: 3.41889943172623 / same / 3.41889943315521 | x=1.1: 5.77477958261911 / same / 5.77477958778605 |
| `first_principle_x_sin_x` | sin x + x cos x | 0 | x=0.9: 1.34277588107108 / same / 1.34277588101361 | x=2.5: −1.40438689476338 / same / −1.40438689477662 |

Beyond the final answers I checked, line by line, that the limit is genuinely *evaluated* rather
than asserted, that the `h` actually cancels before the limit is taken, and that every
`common_mistakes` bullet names a wrong move (not a correct one). Specific sub-checks that passed:

- `cos_ax` s3 substitution `t = ah/2 ⇒ h = 2t/a` and the resulting `−a sin(ax+t)·sin t/t` — algebra
  confirmed; the bullet "lim sin(ah/2)/h = 1, which is a/2, not 1" is arithmetically correct.
- `cos_squared_x` s2 margin derivation of the identity from `sin(A+B)sin(A−B) = sin²A − sin²B` and
  `sin²θ = 1 − cos²θ` — correct; the bullet warning that `+sin(A+B)sin(A−B)` equals `sin²A − sin²B`
  is correct.
- `cot_x` s2: numerator `cos(x+h)sin x − cos x sin(x+h) = sin(x − (x+h)) = −sin h` — the minus is
  produced by the order of subtraction, as the margin claims, not inserted by hand.
- `sec_3x` s3: `(C−D)/2 = −3h/2` with `sin(−3h/2) = −sin(3h/2)` cancelling the leading minus — the
  double sign flip is stated and correct; s4's `2 × 3/2 = 3` bookkeeping is correct.
- `x_sin_x` s2 split `x[sin(x+h) − sin x] + h sin(x+h)` — expansion verified; the `2` from the
  identity pairing with `h/2` (s3 margin) is exact.
- Domain conditions appear **in `lines`, where the student reads them**, not only in
  `verification.note`: `cot x` carries `sin x ≠ 0`, `log x` carries `x > 0` (and again beside the
  boxed answer), `sec 3x` carries `cos 3x ≠ 0`, `√(x+1)` carries `x > −1` (strict, correctly — the
  function exists at x = −1 but the derivative does not).
- `sin_2x` s3 margin says sin 2x is "the shortest of the nine" — there are exactly 9
  first-principle cards in this unit, so the count is right.

**Group 1 verdict: 9 CLEAN, 0 WRONG, 0 MISLEADING, 0 THIN.**

---

## Group 2 — Parametric + "derivative with respect to another function" (8 cards)

Parametric cards were checked by forming `(dy/dt)/(dx/dt)` symbolically, simplifying against the
claim, and independently by a finite-difference *slope* `ΔY/ΔX` at two parameter values (which
tests the division is the right way up, since an inverted ratio fails it immediately).

| card | claimed | symbolic diff | t = p₁ (sym / claim / FD slope) | t = p₂ |
|---|---|---|---|---|
| `param_1_minus_t2_over_1_plus_t2` | b(t²−1)/(2at) | 0 | t=0.6 (a=1.4,b=2.75): −1.04761904761905 / same / −1.04761904780268 | t=1.7: 1.09191176470588 / same / 1.09191176470092 |
| `param_3_cos_t_minus_2_cos3t` | cot t | 0 | t=0.5: 1.83048772171245 / same / 1.83048772215527 | t=1.9: −0.341635355496547 / same / −0.341635355437860 |
| `param_a_cos_t_plus_t_sin_t` | tan t | 0 | t=0.7: 0.842288380463079 / same / 0.842288380547613 | t=2.1: −1.70984654290451 / same / −1.70984654287316 |
| `x_a_cos3t_y_a_sin3t` | −tan t | 0 | t=0.4: −0.422793218738162 / same / −0.422793218817477 | t=1.2: −2.57215162212632 / same / −2.57215162157766 |
| `param_cycloid_second_deriv` | cosec⁴(t/2)/(4a) | 0 (2nd derivative) | t=0.8: 7.76508757539322 / same / FD 7.76508757627312 | t=2.3: 0.257263441541449 / same / FD 0.257263441546611 |
| `ex_wrt_root_x` | 2√x·eˣ | 0 | see finding below | |
| `f_wrt_g_tan_inverse_pair` | 1/2 | 0 | f(1)=π/8, g(1)=π/4 confirmed | |
| `tan_inverse_wrt_sin_inverse` | 1 on −1<x<1 | — | FD df/dg: x=0.4 → 1.0, x=−0.7 → 1.0 | x=2.0 → −1.0, x=−3.0 → −1.0 |

### FINDING — `ts_ipe_m1b_dif_ex_wrt_root_x` — **MISLEADING** (two false general claims)

The mathematics is right: `d(eˣ)/d(√x) = eˣ ÷ 1/(2√x) = 2√x·eˣ`, sympy difference 0, and the
finite-difference `Δ(eˣ)/Δ(√x)` agrees (x=0.5: claim 2.33164398159712, FD 2.33164398164961;
x=2.0: claim 20.8994066964867, FD 20.8994066983604). Two prose sentences beside it are false.

1. **Step `s2_divide`, `why`:** *"The fraction underneath is smaller than 1 near x = 0, so dividing
   by it must make the answer larger than eˣ."*
   The fraction underneath is `dv/dx = 1/(2√x)`, which **tends to +∞ as x → 0⁺** — it is smaller
   than 1 only when `x > 1/4`. At x = 0.04 it equals **2.5**, not something "smaller than 1".
2. **Step `s2_divide`, `margin_note`:** *"Dividing by 1/(2√x) multiplies by 2√x, so the answer is
   larger than eˣ, never smaller."*
   False for `0 < x < 1/4`, where `2√x < 1`. Numeric: at **x = 0.04** the answer is
   `2√x·eˣ = 0.416324309676955` while `eˣ = 1.04081077419` — the answer is **smaller**, by a factor
   of 0.4. (Crossover is exactly x = 1/4, where both equal e^0.25.)

Both sentences are offered to the student as a *sanity check on the direction of the division*, so
a student who applies the check on any x below 1/4 — the most natural region to test near a square
root — is told correct work is wrong. Correct replacement: dividing by `1/(2√x)` **multiplies by
`2√x`**, which enlarges the answer when x > 1/4 and shrinks it when x < 1/4; the direction check
that always works is that dividing by a *fraction* means multiplying by its reciprocal, so the
`2√x` must end up on top. (The step's `memory_tip` — "A half underneath becomes a two on top" —
is fine and already does this job.)

### CLEAN in this group, with the checks named

- **`param_1_minus_t2_over_1_plus_t2`** — CLEAN. Re-derived directly by the quotient rule without
  the card's `t = tan θ` substitution: `dx/dt = −4at/(1+t²)²`, `dy/dt = 2b(1−t²)/(1+t²)²`, ratio
  `b(t²−1)/(2at)` — identical to the boxed answer. Also checked the substitution route the card
  actually takes: `x = a cos 2θ`, `y = b sin 2θ` are correct tan-half-angle forms, `dx/dθ =
  −2a sin 2θ`, `dy/dθ = 2b cos 2θ`, `cot 2θ = (1−t²)/(2t)`. The step-4 `memory_tip` check "at t = 1
  the point is (0, b), the top of the ellipse, tangent horizontal, dy/dx = 0" is verified: x = 0,
  y = b, and `b(1−1)/(2a) = 0`. The bullet "cot 2θ written as 2t/(1−t²) is tan 2θ" is correct.
- **`param_3_cos_t_minus_2_cos3t`** — CLEAN. `dx/dt = −3 sin t + 6 sin t cos²t = 3 sin t(2cos²t−1)`
  and `dy/dt = 3 cos t − 6 sin²t cos t = 3 cos t(1−2sin²t)`; both brackets are `cos 2t` (the two
  different standard forms, as the card says), so the ratio is `cot t`. Two points above. The
  step-4 margin's validity condition (`sin t ≠ 0` and `cos 2t ≠ 0`) is correct.
- **`param_a_cos_t_plus_t_sin_t`** — CLEAN. `dx/dt = a(−sin t + t cos t + sin t) = a t cos t`;
  `dy/dt = a(cos t − (cos t − t sin t)) = a t sin t`; ratio `tan t`. The `why` claim that `a` cannot
  survive because scaling both coordinates equally cannot change a slope is true, and the
  `dx/dt ≠ 0` condition (`t ≠ 0`, `cos t ≠ 0`) is stated.
- **`x_a_cos3t_y_a_sin3t`** — CLEAN. Chain rule applied twice per line as claimed; ratio `−tan t`;
  the bullet "dividing dx/dt by dy/dt gives −cot t" is correct.
- **`param_cycloid_second_deriv`** — CLEAN, and the most error-prone card in the group. Confirmed
  `dy/dx = −sin t/(1−cos t) = −cot(t/2)` (sympy returns `sin t/(cos t − 1)`, the same thing);
  confirmed `d/dt(−cot(t/2)) = +½ cosec²(t/2)` (two minus signs, both present); and — the step the
  margin flags as the one most often lost — confirmed the **second** division by `dx/dt`, giving
  `½cosec²(t/2) / (2a sin²(t/2)) = cosec⁴(t/2)/(4a)`. Symbolic `d²y/dx² − claim = 0`; numeric at
  t = 0.8 and t = 2.3 above, cross-checked by a finite-difference of `dy/dx` against `x`. Note this
  is the `y = a(1 + cos t)` cycloid, so the **positive** sign is correct — the more familiar
  `y = a(1 − cos t)` gives `−cosec⁴(t/2)/(4a)`; the card has not copied the textbook sign.
- **`f_wrt_g_tan_inverse_pair`** — CLEAN. Verified `(sec θ − 1)/tan θ = (1−cos θ)/sin θ = tan(θ/2)`
  and that `θ/2 ∈ (−π/4, π/4)` so `Tan⁻¹(tan(θ/2)) = θ/2` exactly — i.e. `f = ½Tan⁻¹x` for all
  x ≠ 0, and the card states `x ≠ 0` in `lines`. `f′ = 1/(2(1+x²))`, `g′ = 1/(1+x²)`, ratio 1/2.
  The step-4 tip check f(1) = π/8, g(1) = π/4 is numerically right (`atan(√2−1) = 0.3926990817`).
- **`tan_inverse_wrt_sin_inverse`** — CLEAN, and its branch analysis is genuinely correct, which is
  unusual. Numeric finite-difference of `df/dg`: **x = 0.4 → 1.0, x = −0.7 → 1.0, x = 2.0 → −1.0,
  x = −3.0 → −1.0**. So the boxed `df/dg = 1, for −1 < x < 1` is right, the step-5 `why` claim
  "outside it the answer is −1" is right, and the bullet "giving the answer as 1 with no range,
  which is wrong for |x| > 1" is right. The range condition is in `lines`, not only in
  `verification.note`. Bullet "multiplying instead of dividing gives 4/(1+x²)²" is arithmetically
  correct.

**Group 2 verdict: 7 CLEAN, 1 MISLEADING (`ex_wrt_root_x`), 0 WRONG, 0 THIN.**

---

## Group 3 — Implicit differentiation (12 cards)

Each was re-derived as `dy/dx = −F_x/F_y` from the card's own relation (or, where the card makes
one variable the subject, by direct differentiation of the explicit function), simplified against
the claim, and then cross-checked numerically: a root-find for `y(x)` **on the curve** followed by
a central difference `(y(x+h) − y(x−h))/2h` at two points. That last step is what proves the
`dy/dx` terms were collected correctly, per the brief.

| card | claimed dy/dx | symbolic `−F_x/F_y − claim` | numeric point 1 (claim / FD) | point 2 |
|---|---|---|---|---|
| `2x2_minus_3xy_plus_y2_implicit` | (3y−4x−1)/(2y−3x+2) | 0 | x=1, y=1.61803…: 2.26376261582597 / 2.2637626158062 | x=1.5: 2.36094603209228 / 2.3609460320650 |
| `x3_plus_y3_minus_3axy` | (ay−x²)/(y²−ax) | 0 | a=1.75, x=1, y=0.19182058372011: 0.38776096926909 / 0.38776096926909 | x=2, y=0.81310189184533: 0.90778230197678 / same |
| `x_two_thirds_plus_y_two_thirds` | −∛(y/x) | 0 | a=8, x=1: −1.732050807569 / FD −1.732050807224 | x=3.375: −0.881917103688 / FD −0.881917104012 |
| `ay4_equals_x_plus_b_5` | 5y·y″ = (y′)² | `5yy″ − (y′)² = 0` | a=3,b=2,x=1: 5yy″=1.56250000000000, (y′)²=1.56250000000000 | x=4: 2.20970869120796 / 2.20970869120796 |
| `root_1_minus_x2_plus_root_1_minus_y2` | √((1−y²)/(1−x²)) | — | a=2, x=0.5, y=−0.392820323028: 1.0618802153517 / FD 1.0618802153517 | x=0.8, y≈0: 1.6666666666667 / 1.6666666666667 |
| `sin_y_equals_x_sin_a_plus_y` | sin²(a+y)/sin a | 0 | a=0.6, x=0.4, y=0.325197363258: 1.1298916803809 / FD 1.1298916803809 | x=0.9, y=1.10226661954: 1.7405968611078 / same |
| `x_power_log_y_equals_log_x` | (y/x)(1−log x log y)/(log x)² | 0 | x=2: 0.838093566026766 / CD 0.83809356510312 | x=5: 0.0543903747871652 / CD 0.054390374426561 |
| `x_power_y_equals_y_power_x` | y(x log y−y)/(x(y log x−x)) | 0 | x=3, y=2.4780526802883: −0.72717897733087 / FD −0.72717897733087 | x=2.5 (trivial branch y=x): 1.0 / 1.0 |
| `x_power_y_plus_y_power_x_equals_ab` | −(y·x^(y−1)+yˣ log y)/(xʸ log x+x·y^(x−1)) | 0 | 17-level set, x=2, y=3: −1.8958141356657 / FD −1.8958141356657 | x=2.4, y=2.4417148623504: −1.0275125127635 / same |
| `x_tan_e_minus_y` | −eʸ/(1+x²) | 0 | x=0.5: −1.72544834583329 / CD −1.7254483458684 | x=2: −0.180644205051770 / CD −0.18064420494179 |
| `xy_equals_e_x_minus_y` | log x/(1+log x)² | 0 | x=2: 0.241788720762580 / CD 0.24178872015668 | x=0.7: −0.861810276821051 / CD −0.86181027758592 |
| `y_equals_x_power_y` | y²/(x(1−y log x)) | 0 | x=1.2, y=1.2577345413765: 1.7104807891297 / FD 1.7104807891297 | x=1.15, y=1.179159112517: 1.4476291259455 / same |

### FINDING — `ts_ipe_m1b_dif_root_1_minus_x2_plus_root_1_minus_y2` — **MISLEADING**

Step `s5_differentiate`, `margin_note`: *"The two roots must end the right way round: the y root on
top, the x root underneath. **Check by putting y = x, which gives dy/dx = 1.**"*

Two problems, and they compound.

1. **The check cannot detect the error it names.** It is offered as the test that the roots are the
   right way round — but the test is symmetric in x and y. `√((1−y²)/(1−x²))` and the inverted
   `√((1−x²)/(1−y²))` **both** equal 1 when y = x. A student who made exactly the mistake the
   sentence warns about, one line earlier, applies the check, gets 1, and concludes they are right.
2. **`y = x` is not a point on this curve.** Setting y = x in `√(1−x²) + √(1−y²) = a(x−y)` gives
   `2√(1−x²) = 0`, so `x = ±1` (sympy `solve` returns `[-1, 1]`) — and at x = ±1 the claimed
   derivative `√((1−y²)/(1−x²))` is `0/0`, undefined. In the reduced form the curve is
   `Sin⁻¹x − Sin⁻¹y = 2 Cot⁻¹a`, so y = x would require `Cot⁻¹a = 0`, true for no real a.

A check that works: pick any point on the curve and compare. At a = 2, x = 0.5 the curve gives
y = −0.392820323028; the claimed derivative reads **1.0618802153517**, the true slope
(finite-difference of the root-found `y(x)`) reads **1.0618802153517**, and the inverted form reads
**0.94172580442022** — so a real point *does* separate the two orderings, while y = x does not.
Note too that step 5's own `common_mistakes` bullet says dropping the `dy/dx` factor "makes the
answer come out as 1" — so within the same step, a value of 1 is named once as the signature of an
error and once as the confirmation of correctness.

*Everything else on this card is correct*, including the delicate part: the cancellation argument
in s3 (cos((A+B)/2) = 0 ⟹ cos A + cos B = 0 ⟹ cos A = cos B = 0 ⟹ x = y = ±1, where the derivative
does not exist anyway) is valid as written, the principal-value argument for `√(1−sin²A) = +cos A`
is correct, and both sum-to-product forms are quoted correctly.

### FINDING — `ts_ipe_m1b_dif_x3_plus_y3_minus_3axy` — **MISLEADING** (low severity)

Step `s2_collect_and_solve`, `memory_tip`: *"The numerator and the denominator have the same shape
with x and y exchanged: ay − x² over y² − ax."*

Exchanging x and y in the numerator `ay − x²` gives `ax − y²`. The denominator is `y² − ax`, which
is **−(ax − y²)** — the exchanged form *with a sign flip*. A student who remembers the mnemonic and
not the printed expression writes `dy/dx = (ay − x²)/(ax − y²)`, which is exactly the negative of
the right answer: at a = 1.75, x = 1 the correct value is **0.387760969269** and the mnemonic
version is **−0.387760969269**; at x = 2 they are **0.907782301977** and **−0.907782301977**.

Severity is low because the tip prints the correct expressions immediately after the colon, so the
card itself is not wrong — only the rule the student is invited to memorise is. There *is* a true
symmetry statement available: exchanging x and y in the whole fraction gives the **reciprocal**
(the folium is symmetric in x and y, so the swap sends dy/dx to dx/dy) — verified numerically: at
x = 2 the swap gives **1.10158569717** and `1/(dy/dx)` gives **1.10158569717**.

### CLEAN in this group, with the checks named

- **`2x2_minus_3xy_plus_y2_implicit`** — CLEAN. All six terms differentiated correctly; the product
  rule on `3xy` produces both halves; all **three** `dy/dx`-bearing terms (`−3x`, `+2y`, `+2`) are
  collected, which is the specific failure the step-2 `why` warns about, and the card does not
  commit it. `2y − 3x + 2 ≠ 0` stated beside the boxed answer, in `lines`.
- **`x3_plus_y3_minus_3axy`** — mathematics CLEAN (banded MISLEADING above for the tip only).
  Implicit differentiation gives `(y² − ax)·dy/dx = ay − x²`. The `y² ≠ ax` condition is in
  `lines`, and the margin's reading of it as "where the tangent is vertical" is correct.
- **`x_two_thirds_plus_y_two_thirds`** — CLEAN. `(2/3)x^(−1/3) + (2/3)y^(−1/3)·dy/dx = 0`; the
  negative powers invert correctly to put `y^(1/3)` on top. Both bullets name real errors.
- **`ay4_equals_x_plus_b_5`** — CLEAN, and this is a "show that" with no derivative to compare, so
  I verified it by constructing the actual solution `y = ((x+b)⁵/a)^(1/4)` and evaluating
  `5yy″ − (y′)²`, which sympy returns as **0** identically; numeric at x = 1 and x = 4 above. The
  quotient-rule step `d/dx(y′/y) = (y·y″ − (y′)²)/y²` is right, `1/(x+b) = 4y′/(5y)` is a correct
  re-read of step 2, and `(4y′/(5y))² = 16(y′)²/(25y²)` is squared correctly — the arithmetic
  `−(5/4)(16/25) = −4/5` and hence `y·y″ = (1/5)(y′)²` checks out. The step-4 tip's general rule
  (for `p·log y = q·log(x+b)`, the ratio `y·y″/(y′)² = (q−p)/q`) is a true theorem, not merely true
  of these numbers — I checked it symbolically. Domain `a > 0, y > 0, x + b > 0` is in `lines`.
- **`sin_y_equals_x_sin_a_plus_y`** — CLEAN. The card's choice to compute `dx/dy` and invert is
  sound and the inversion is guarded: `sin a ≠ 0` is stated *before* the reciprocal is taken, and
  the question's own condition (a not a multiple of π) is what supplies it. Numerator
  `sin(a+y)cos y − cos(a+y)sin y = sin a` verified. The bullet about reversing the numerator
  "gives −sin a and the wrong sign" is correct.
- **`x_power_log_y_equals_log_x`** — CLEAN. `(log y)(log x) = log(log x)`; the derivative of
  `log(log x)` is `1/(x log x)` (the bullet warning against dropping the `1/x` is right); the s4
  factorisation to `(y/x)(1 − log x log y)/(log x)²` is correct. The domain `x > 1` — genuinely
  needed, since `log(log x)` requires `log x > 0` — is stated in `lines`, not only in
  `verification.note`.
- **`x_power_y_equals_y_power_x`** — CLEAN. `y log x = x log y`; four terms, two per side, all four
  present; the fraction-clearing `log x − x/y = (y log x − x)/y` and `log y − y/x = (x log y − y)/x`
  is right, giving the printed form. Verified on the **non-trivial** branch (x = 3, y = 2.478…) as
  well as the trivial y = x branch, because the trivial branch returns 1 for many wrong formulas.
- **`x_power_y_plus_y_power_x_equals_ab`** — CLEAN. Both `xʸ·(1/x) = x^(y−1)` and `yˣ·(x/y) =
  x·y^(x−1)` simplifications are right; the sign is collected at step 4 rather than at the end, as
  the `why` claims; the s1 bullet warning that log of a sum is not the sum of logs is correctly
  aimed.
- **`x_tan_e_minus_y`** — CLEAN. `dx/dy = sec²(e⁻ʸ)·(−e⁻ʸ) = −e⁻ʸ(1+x²)`; `sec² = 1 + tan²` with
  `tan(e⁻ʸ) = x` is the legitimate shortcut; the inversion is guarded — `dx/dy` is never zero,
  since `e⁻ʸ > 0` and `1+x² ≥ 1`, so the margin's claim is true.
- **`xy_equals_e_x_minus_y`** — CLEAN. `y log x = x − y` ⟹ `y = x/(1+log x)`; quotient rule in the
  right order (bottom × derivative of top first); numerator collapses `(1+log x) − 1 = log x`. One
  small imprecision worth noting but **not** band-worthy: the s4 `margin_note` justifies not
  cancelling with "log x is not a factor of (1 + log x)", when the fact actually needed is the
  converse — `(1 + log x)` is not a factor of `log x`. Both statements happen to be true, and the
  conclusion drawn is correct, so nothing false reaches the student; the sentence is just the wrong
  way round.
- **`y_equals_x_power_y`** — CLEAN. Both `dy/dx` terms present; `(1/y − log x) = (1 − y log x)/y`
  is what produces the `y²`, exactly as the s3 tip says; and the s4 equivalence of the two printed
  forms follows from the step-1 line `log y = y log x`, correctly.

**Group 3 verdict: 10 CLEAN, 2 MISLEADING, 0 WRONG, 0 THIN.**

---

## Group 4 — Chain / product / power / exponential + logarithm cards (15 cards)

| card | claimed | symbolic diff | pt 1 (sym / claim / CD) | pt 2 |
|---|---|---|---|---|
| `2x_plus_3_over_4x_plus_5_second` | y″ = 16/(4x+5)³ | 0 | x=0: 0.128000000000000 / same / 0.12800000001312 | x=1.3: 0.0150771573527527 / same / 0.015077157354548 |
| `7_power_x3_plus_3x` | 3(x²+1)·7^(x³+3x)·log 7 | 0 | x=0.4: 79.2329725905353 / same / 79.232972672116 | x=1.1: 105751.207475482 / same / 105751.20783933 |
| `a2_e_x_squared` | 2a²x·e^(x²) | 0 | a=1.8, x=0.6: 5.57278476381060 / same / 5.5727847644516 | x=1.4: 64.4050951351010 / same / 64.405095150377 |
| `ex_x2_plus_1` | eˣ(x+1)² | 0 | x=0.3: 2.28126138480345 / same / 2.2812613850065 | x=2.0: 66.5015048903759 / same / 66.501504893424 |
| `a_cos_sin_x_plus_b_sin_sin_x` | y₂ + tan x·y₁ + y cos²x = 0 | 0 | x=0.5: LHS = 1.4e−16 | x=1.9: LHS = 2.2e−16 |
| `a_cos_x_plus_b_plus_2x_sin_x` | y″ + y = 4 cos x | 0 | x=0.5: y″+y = 3.51033024756149, 4cos x = 3.51033024756149 | x=1.9: −1.29315826745401 / −1.29315826745401 |
| `a_enx_plus_b_e_minus_nx_second` | y″ = n²y | 0 | (identity, exact) | |
| `ax_n_plus_1_plus_bx_minus_n` | x²y″ = n(n+1)y | 0 | a=1.8,b=1.333,n=1.5, x=1: 11.7500000000000 / 11.7500000000000 | x=2.5: 67.9692054582441 / 67.9692054582441 |
| `log_4x2_minus_9_second` | −8(4x²+9)/(4x²−9)² | 0 | x=2: −4.08163265306122 / same / −4.0816326547066 | x=3.5: −0.290000000000000 / same / −0.29000000000834 |
| `log_diff_fractional_powers` | y·[−4/(3(1−2x)) − 9/(4(1+3x)) + 5/(1−6x) + 6/(1+7x)] | 0 | x=0.05: 11.9094435469901 / same / 11.909443614355 | x=−0.1: 6.68083709888861 / same / 6.6808371190191 |
| `log_quadratic_ratio` | 2(2−x²)/(x⁴+3x²+4) | 0 | x=0: 1.00000000000000 / same / 0.99999999996768 | x=1: 0.250000000000000 / same / 0.25000000001829; x=2.5: −0.137512639029323 / same / −0.13751263904238 |
| `log_sec_x_plus_tan_x` | sec x | 0 | x=0.3: 1.04675160153809 / same / 1.0467516015689 | x=1.2: 2.75970360133241 / same / 2.7597036020177 |
| `log_sin_log_x` | cot(log x)/x | 0 | x=1.5: 1.55309568555431 / same / 1.5530956858356 | x=3.0: 0.170238845731925 / same / 0.17023884573281 |
| `log_tan_e_x` | 2eˣ·cosec(2eˣ) | 0 | x=−1: 1.09626605801902 / same / 1.0962660580260 | x=0.1: 2.75477627453435 / same / 2.7547762752766 |
| `sin_log_x` | cos(log x)/x | 0 | x=0.8: 1.21900826572280 / same / 1.2190082657279 | x=4.0: 0.0458642436858254 / same / 0.045864243686244 |

### FINDING — `ts_ipe_m1b_dif_log_sec_x_plus_tan_x` — **THIN** (missing domain condition)

The derivative `sec x` is right and every line is right. But the card states **no condition at all**
on x, in `lines`, `why`, `memory_tip` or `margin_note` — the only remark is "where log is the
natural logarithm". Two things the working relies on go unsaid:

- `log(sec x + tan x)` exists only where `sec x + tan x > 0`. Since
  `sec x + tan x = (1 + sin x)/cos x` (verified symbolically) and `1 + sin x ≥ 0`, that means
  **cos x > 0**. Concretely, at x = 2, 3 and 4 radians the bracket is **−4.5880378249839**,
  **−1.1526552089822717** and **−0.3720643741168197** — the function is undefined there, so the
  boxed "dy/dx = sec x" is not true "for all x" as the card leaves it reading.
- Step 2 cancels the whole bracket `(sec x + tan x)` between numerator and denominator, which needs
  it to be non-zero.

This is banded THIN rather than MISLEADING because nothing false is asserted — it is an omission.
It is worth reporting because **three of the four sibling log cards in this same unit do state
their condition** (`log_4x2_minus_9_second`: "4x² − 9 > 0, so x > 3/2 or x < −3/2";
`log_diff_fractional_powers`: "−1/7 < x < 1/6"; `log_sin_log_x`: "needs sin(log x) > 0"), so this is
an inconsistency inside the unit, not a house convention.

### FINDING — `ts_ipe_m1b_dif_log_tan_e_x` — **THIN** (missing domain condition)

Same shape and the same reason. `log(tan eˣ)` needs `tan eˣ > 0`, and step 2's final form
`2eˣ·cosec(2eˣ)` additionally needs `sin(2eˣ) ≠ 0`. The card names three layers carefully and says
nothing about where any of it is valid. (The mathematics is exact: I confirmed
`sec²θ/tan θ − 2 cosec 2θ = 0` symbolically, so the two boxed forms really are the same function.)

### CLEAN in this group, with the checks named

- **`2x_plus_3_over_4x_plus_5_second`** — CLEAN. Verified the rewrite `2x + 3 = ½(4x+5) + ½`
  (= 2x + 2.5 + 0.5 ✓), then `y′ = −2(4x+5)⁻²` and `y″ = 16(4x+5)⁻³` — sympy's second derivative
  matches exactly. The s2 `memory_tip` arithmetic "(−2)×4 = −8, and −2×(−8) = 16" is right, and the
  margin's spot-check "at x = 0: 16/125 = 0.128" is right (sympy gives 0.128000000000000). `x ≠ −5/4`
  appears in `lines` twice.
- **`7_power_x3_plus_3x`** — CLEAN. `aᵘ` rule applied with a = 7, u = x³ + 3x; the `log 7` factor is
  present and the exponent derivative `3x² + 3 = 3(x²+1)` is right.
- **`a2_e_x_squared`** — CLEAN. Constant pulled out; inner derivative `2x` present.
- **`ex_x2_plus_1`** — CLEAN. Product rule both terms; `2x + x² + 1 = (x+1)²` verified.
- **`a_cos_sin_x_plus_b_sin_sin_x`** — CLEAN, and the hardest identity in the group. I built
  `y = a cos(sin x) + b sin(sin x)` with a = 1.8, b = 1.333 and evaluated
  `y₂ + tan x·y₁ + y cos²x`: sympy simplifies it to **0** symbolically and returns 1.4e−16 at
  x = 0.5 and 2.2e−16 at x = 1.9. The card's device — naming `P = b cos(sin x) − a sin(sin x)` so
  that `y₁ = P cos x` and `P′ = −y cos x` — is correct, and both product-rule terms survive into
  `y₂ = −y cos²x − P sin x`. *Observation, not banded:* the identity contains `tan x`, and step 3
  cancels a `cos x`, so it holds only where `cos x ≠ 0`; the card does not say so. I did not band
  this because the printed identity carries `tan x` in it, which announces the restriction on its
  own face — unlike the two log cards above, where nothing in the statement hints at a domain.
- **`a_cos_x_plus_b_plus_2x_sin_x`** — CLEAN. Two applications of the product rule; the `4 cos x`
  is genuinely `2 + 2` from two distinct sources as the s2 `why` claims; `y″ + y − 4 cos x`
  simplifies to 0 for arbitrary a, b.
- **`a_enx_plus_b_e_minus_nx_second`** — CLEAN. `y″ − n²y = 0` identically for symbolic a, b, n.
  The s1 bullet "keeping the second term negative in y″, forgetting that (−n)×(−n) = n²" names a
  real error.
- **`ax_n_plus_1_plus_bx_minus_n`** — CLEAN. Index bookkeeping checked twice over: `x^(−n)` →
  `−n·x^(−n−1)` → `+n(n+1)x^(−n−2)`, and multiplying by x² restores exactly the two original
  indices. `x²y″ − n(n+1)y = 0` symbolically with a, b, n symbolic. The s4 tip's worked check
  (n = 1, b = 0 → y = ax², y″ = 2a, x²y″ = 2ax² = 1·2·y) is arithmetically correct.
- **`log_4x2_minus_9_second`** — CLEAN. Both boxed forms verified equal: I checked
  `−4/(2x−3)² − 4/(2x+3)² + 8(4x²+9)/(4x²−9)²` simplifies to **0**. The margin's numeric spot-check
  ("at x = 2: −4/1 − 4/49 = −4.0816, and the numerical second derivative there is −4.0816") is
  correct — sympy gives −4.08163265306122 and the central difference −4.0816326547066. Domain
  `4x² − 9 > 0 ⇒ x > 3/2 or x < −3/2` stated.
- **`log_diff_fractional_powers`** — CLEAN, and its domain claim is exactly right, which I did not
  expect. `solve([1−2x>0, 1+3x>0, 1−6x>0, 1+7x>0])` returns **(−1/7 < x) & (x < 1/6)** — the card's
  stated interval. All four sign decisions in step 2 are right, including the two negative
  exponents (numerator with a negative power → minus; denominator with a negative power → plus).
  Coefficient arithmetic verified: `(2/3)(−2) = −4/3`, `(3/4)(3) = 9/4`, `−(5/6)(−6) = +5`,
  `(6/7)(7) = 6`. Numeric check run at x = 0.05 and at x = **−0.1** — deliberately on the negative
  side of the interval, since the two `+` signs are what a sign slip would flip.
- **`log_quadratic_ratio`** — CLEAN. Numerator expansion verified term by term
  (`2x³ − x² + 3x + 2` minus `2x³ + x² + 3x − 2` = `4 − 2x²`), denominator via the difference of
  squares `(x²+2)² − x² = x⁴ + 3x² + 4`. Both of the card's own spot-checks are right: at x = 0 the
  derivative is 1 (sympy 1.00000000000000) and y = log 1 = 0; at x = 1 the derivative is 1/4
  (sympy 0.250000000000000) and y = log 2. The s1 margin claim "both quadratics have discriminant
  −7, so each is positive for every real x" is true (1 − 8 = −7 for both), which is why this card
  needs no domain restriction and correctly gives none.
- **`log_sin_log_x`** — CLEAN. Three chain-rule layers all present; `cos/sin → cot`. *Observation,
  not banded:* the domain line reads "This working needs sin(log x) > 0, that is 0 < log x < π" —
  the "that is" states an equivalence, but `sin(log x) > 0` also holds on `2kπ < log x < (2k+1)π`
  for every integer k. Concretely, at `x = e^{2.5π} ≈ 2575.97` we have `sin(log x) = 1.0`, outside
  the stated interval. The effect is over-restriction in the safe direction, and the essential
  condition *is* surfaced to the student, so I have not banded it — but the phrase would be exact
  as "in particular for 1 < x < e^π".
- **`sin_log_x`** — CLEAN. `cos(log x)·(1/x)`; the domain `x > 0` is given in the question and
  restated in `lines` and again in the s2 margin.

**Group 4 verdict: 13 CLEAN, 2 THIN, 0 WRONG, 0 MISLEADING.**

---

## Group 5 — Remaining direct-rule cards and single-layer inverse-trig (14 cards)

| card | claimed | symbolic diff | pt 1 (sym / claim / CD) | pt 2 |
|---|---|---|---|---|
| `poly_1_to_x100_at_1` | f′(1) = 5050 | exact | sympy `diff(Σx^k, x).subs(x,1)` = **5050** | 100·101/2 = 5050 |
| `poly_1_to_xn_at_1` | f′(1) = n(n+1)/2 | `summation(k,(k,1,n))` = n(n+1)/2 | n=3: 6 / 6 | n=7: 28 / 28; n=12: 78 / 78 |
| `sec_root_tan_x` | sec²x·sec(√tan x)·tan(√tan x)/(2√tan x) | 0 | x=0.4: 0.866120972457102 / 0.866120972457101 / 0.86612097257577 | x=1.0: 12.9311974043285 / same / 12.931197441590 |
| `x_ex_sin_x` | eˣ[(1+x)sin x + x cos x] | 0 | x=0.5: 1.90910314311251 / same / 1.9091031432633 | x=2.2: 11.6647039070349 / same / 11.664703905723 |
| `x_plus_tan_x_second` | cos²x·y″ + 2x = 2y | 0 | x=0.4: LHS 1.64558643747632, 2y 1.64558643747632 | x=1.1: 6.12951931449730 / 6.12951931449730 |
| `x_root_a2_plus_x2_plus_a2_log` | 2√(a²+x²) | 0 | a=2.5, x=0.7: 5.19230199429887 / same / 5.1923019943168 | x=3.3: 8.28009661779378 / same / 8.2800966179519 |
| `x2_2x_log_x` | x2ˣ[2log x + x(log2)(log x) + 1] | 0 | x=0.9: 1.21517562365229 / same / 1.2151756239268 | x=2.4: 53.2953635228301 / same / 53.295363524875 |
| `cos_inverse_4x3_minus_3x` | −3/√(1−x²) on ½ ≤ x ≤ 1 | (branch) | x=0.6: −3.75000000000000 / same / −3.750000000080 | x=0.9: −6.88247201611685 / same / −6.882472016412 |
| `cos_inverse_a_cos_x_plus_b` | 1/(a + b cos x) | (branch) | a=5,b=3, x=0.5: 0.131014418553006 / 0.131014418553005 / 0.1310144185016 | x=2.0: 0.266555815673450 / same / 0.2665558156978; x=3.0: 0.492605375051794 / …796 / 0.4926053749910 |
| `cosec_inverse_e_2x_plus_1` | −2/√(e^(4x+2) − 1) | 0 | x=0.3: −0.412283242821674 / same / −0.4122832428094 | x=1.2: −0.0667837413177158 / same / −0.06678374131139 |
| `cot_inverse_x3_squared` | −6x²·Cot⁻¹(x³)/(1+x⁶) | 0 | x=0.7: −3.26282327661365 / same / −3.262823276673 | x=1.6: −0.206896867444189 / same / −0.2068968674301 |
| `e_a_sin_inverse_x` | ay/√(1−x²) | 0 | a=1.75, x=0.3: 3.12671606166147 / same / 3.126716061508 | x=−0.6: 0.709377395686677 / same / 0.7093773957134 |
| `sin_inverse_root_x` | 1/(2√(x−x²)) | 0 | x=0.2: 1.25000000000000 / same / 1.250000000008 | x=0.75: 1.15470053837925 / same / 1.154700538519 |
| `tan_inverse_log_x` | 1/(x[1+(log x)²]) | 0 | x=0.5: 1.35093784213168 / same / 1.350937842148 | x=3.0: 0.151038079834253 / same / 0.1510380798209 |

### FINDING — `ts_ipe_m1b_dif_sec_root_tan_x` — **THIN** (missing domain condition)

Third of the same kind. `sec(√(tan x))` needs `tan x ≥ 0`, and the answer's denominator
`2√(tan x)` needs `tan x > 0` strictly — so the boxed derivative is valid only on
`kπ < x < kπ + π/2` (and not at points where `cos(√tan x) = 0`). The card names its three layers
carefully and states no condition anywhere the student can read it. Mathematics is exact
(symbolic difference 0; two points plus central difference above).

### CLEAN in this group, with the checks named

- **`poly_1_to_x100_at_1`** — CLEAN. I built the actual 101-term polynomial in sympy, differentiated
  it, and substituted x = 1: **5050**, matching the card. Both bullets are right, including the
  subtle one — "using n(n+1)/2 with n = 99 because the last derivative term shows x⁹⁹" is a real
  trap, and the card takes n = 100.
- **`poly_1_to_xn_at_1`** — CLEAN. `summation(k, (k,1,n))` returns `n(n+1)/2`. The card's own check
  at n = 3 is right, and I extended it to n = 7 (28) and n = 12 (78) against the explicitly
  constructed polynomials. The s1 claim that f′ has exactly **n** terms, not n + 1, is correct.
- **`sec_root_tan_x`** — mathematics CLEAN (banded THIN above for the domain only). All three chain
  factors present in the right order.
- **`x_ex_sin_x`** — CLEAN. Three-factor product rule stated correctly (`u′vw + uv′w + uvw′`), all
  three terms present, `eˣ` factored out and `sin x` grouped as `(1+x)sin x`.
- **`x_plus_tan_x_second`** — CLEAN. `y′ = 1 + sec²x`, `y″ = 2 sec²x tan x` (the chain rule on
  `(sec x)²` is done, not skipped); `cos²x·y″ + 2x − 2y` simplifies to **0**.
- **`x_root_a2_plus_x2_plus_a2_log`** — CLEAN, the longest computation in this group and correct at
  every stage: `d/dx √(a²+x²) = x/√(a²+x²)`; product rule giving `(a²+2x²)/√(a²+x²)`; the log term
  collapsing to `a²/√(a²+x²)` because the bracket `x + √(a²+x²)` cancels; sum
  `2(a²+x²)/√(a²+x²) = 2√(a²+x²)`. The s1 domain sentence — the logarithm exists for every real x
  because `√(a²+x²) > |x|`, so `x + √(a²+x²) > 0` — is true (for a ≠ 0, which the question's `a²`
  factor requires) and is in `lines`.
- **`x2_2x_log_x`** — CLEAN. The three different rules are each right (`aˣ → aˣ log a` with the
  `log 2` present), and the third product term genuinely reduces `x²·(1/x) = x`, which is why
  `x2ˣ` is the common factor and the bracket ends in a plain `1`. Domain `x > 0` given and repeated.
- **`cos_inverse_4x3_minus_3x`** — CLEAN, and its branch handling is the reason. The card restricts
  to `1/2 ≤ x ≤ 1` **in `lines`**, and its third bullet says the sign is different on
  `−1/2 < x < 1/2`. I checked that claim rather than assuming it: at **x = 0.2** sympy's derivative
  of `acos(4x³−3x)` is **+3.06186217848**, and `+3/√(1−x²)` is **+3.06186217848** — so the sign
  really does flip there and the warning is accurate. On the card's own interval, x = 0.6 gives
  −3.75 and x = 0.9 gives −6.88247201611685, both matching `−3/√(1−x²)` and the difference quotient.
- **`cos_inverse_a_cos_x_plus_b`** — CLEAN, and the most intricate card in the whole corpus. I
  followed every stage independently: the half-angle regrouping to
  `[(a+b) − (a−b)t²]/[(a+b) + (a−b)t²]`; the definition `k = √((a−b)/(a+b))`; the derivation
  `Cos⁻¹((1−s²)/(1+s²)) = 2 Tan⁻¹s` with its range check (`0 < φ < π/2 ⇒ 0 < 2φ < π`, inside the
  principal range); the two chain factors in s4 including the `½` from the half angle, which the
  leading 2 cancels; and the s5 rebuild `(a+b)cos²(x/2) + (a−b)sin²(x/2) = a + b cos x` together
  with `k(a+b) = √(a²−b²)`, which is what makes the constant exactly 1. Numerically with a = 5,
  b = 3 at three points spread across `0 < x < π` (0.5, 2.0, 3.0) the derivative matches
  `1/(a + b cos x)` to 15 significant figures and matches the central difference. Both conditions
  the proof leans on (`a + b cos x ≥ a − b > 0` and `tan(x/2) > 0`) are stated in `lines` in step 1
  and are actually used later, as the margin claims.
- **`cosec_inverse_e_2x_plus_1`** — CLEAN, including the part most cards of this type get wrong.
  The `|u|` in `d/dx Cosec⁻¹u = −u′/(|u|√(u²−1))` is present and is resolved *with a reason*
  (`e^(2x+1) > 0`), not silently dropped. The s1 `why` also states the real restriction — the
  branch needs `2x + 1 > 0` — which is exactly right: at x = −1, `e^(2x+1) = 0.36787944 < 1` and
  sympy returns a complex value for `acsc`, i.e. the function does not exist there. `(e^(2x+1))² =
  e^(4x+2)` is squared correctly and the bullet warning against `e^(4x+1)` is well aimed.
- **`cot_inverse_x3_squared`** — CLEAN. Outer square differentiated first; the Cot⁻¹ minus sign
  kept; `(x³)² = x⁶` in the denominator.
- **`e_a_sin_inverse_x`** — CLEAN. Checked at a positive and a **negative** x (−0.6), since a sign
  slip on `1/√(1−x²)` would not show at a single positive point. Domain `−1 < x < 1` is in the s2
  margin.
- **`sin_inverse_root_x`** — CLEAN. `u² = x` (not `√x`) in the denominator, `d/dx√x = 1/(2√x)`
  present, and the two roots combined as `√(x − x²)`. The condition `0 < x < 1` is in `lines`,
  directly under the boxed answer.
- **`tan_inverse_log_x`** — CLEAN. `1 + (log x)²` (not `1 + x²`), and the `1/x` present. `x > 0`
  stated in `lines`.

**Group 5 verdict: 13 CLEAN, 1 THIN, 0 WRONG, 0 MISLEADING.**

---

## Group 6 — Multiple-angle inverse trig and logarithmic differentiation (14 cards)

Every reduction of the form `Inverse(f(nθ)) = nθ` was checked for its branch, and the derivative was
then verified against sympy plus a central difference at two or three points — including, where the
card claims a *different* branch exists, a point on that other branch.

| card | claimed | pt 1 (sym / claim / CD) | pt 2 |
|---|---|---|---|
| `sin_inverse_2x_over_1_plus_x2` | 2/(1+x²) on \|x\| ≤ 1 | x=0.4: 1.72413793103448 / same / 1.724137931036 | x=−0.8: 1.21951219512195 / same / 1.219512195338 |
| `sin_inverse_3x_minus_4x3` | 3/√(1−x²) on \|x\| ≤ ½ | x=0.3: 3.14485451016575 / same / 3.144854510029 | x=−0.45: 3.35935506573513 / same / 3.359355065902 |
| `tan_inverse_3a2x_minus_x3` | 3a/(a²+x²) | a=3, x=0.5: 0.972972972972973 / same / 0.9729729730235 | x=1.2: 0.862068965517241 / same / 0.8620689654348 |
| `second_deriv_tan_inverse_2x_over_1_minus_x2` | y″ = −4x/(1+x²)² | x=0.3: −1.01001599191987 / same / −1.010015991953 | x=−0.6: 1.29757785467128 / same / 1.297577854609 |
| `sin_inverse_and_tan_inverse_equal_derivatives` | f′ = g′ = 1/(2√((x−β)(α−x))) | α=5, β=1, x=1.6: f′ 0.350070021007002, g′ 0.350070021007002, claim same | x=3.0: 0.25 / 0.25 / 0.25; x=4.4: 0.350070021007003 all three |
| `three_tan_inverse_sum_derivative` | 1/(1+x²) | x=0.2: 0.961538461538461 / same / 0.9615384614359 | x=0.35: 0.890868596881960 / same; x=−0.3: 0.917431192660552 / …550 |
| `tan_inverse_root_1_minus_cos_over_1_plus_cos` | 1/2 | x=0.6: 0.500000000000000 / same / 0.5000000000421 | x=2.5: 0.500000000000000 / same / 0.5000000000699 |
| `tan_inverse_root_1_minus_x_over_1_plus_x` | −1/(2√(1−x²)) | x=0.3: −0.524142418360959 / same / −0.5241424183011 | x=−0.7: −0.700140042014005 / same / −0.7001400420537 |
| `tan_inverse_root_1_plus_x2_minus_1_over_x` | 1/(2(1+x²)) | x=0.6: 0.367647058823530 / …529 / 0.3676470588798 | x=−1.4: 0.168918918918919 / same / 0.1689189188525 |
| `tan_inverse_root_sum_over_difference` | −x/√(1−x⁴) | x=0.4: −0.405220449236554 / same / −0.4052204491956 | x=0.85: −1.22944135274031 / same; x=−0.5: +0.516397779494322 / same |
| `tan_inverse_sec_x_plus_tan_x` | 1/2 | x=0.2: 0.5 / 0.5 / 0.5000000000144 | x=−1.0: 0.5 / 0.5 / 0.4999999999311; x=1.4: 0.5 / 0.5 / 0.4999999999589 |
| `sin_x_power_x_plus_x_power_sin_x` | (sinx)ˣ[log sin x + x cot x] + x^(sinx)[cos x·log x + sinx/x] | 0 symbolically; x=0.7: 0.802250576606243 / same / 0.8022505766370 | x=2.0: −0.523278215750616 / same / −0.5232782158693 |
| `x_power_tan_x_plus_sin_x_power_cos_x` | x^(tanx)[sec²x·log x + tanx/x] + (sinx)^(cosx)[cos x cot x − sin x·log sin x] | 0 symbolically; x=0.6: 1.22924366998569 / same / 1.229243670187 | x=2.5: 2.65093278991713 / same / 2.650932790171 |
| `x_power_x` | xˣ(1 + log x) | 0 symbolically; x=0.5: 0.216977709452274 / same / 0.2169777094108 | x=2.0: 6.77258872223978 / same / 6.772588722503; x=3.4: 142.599908142095 / same / 142.5999081661 |

### FINDING — `ts_ipe_m1b_dif_three_tan_inverse_sum_derivative` — **MISLEADING** (low severity)

Step `s3_triple`, second `common_mistakes` bullet: *"Writing the formula as
(3 tan θ + tan³θ)/(1 + 3 tan²θ), **which are the signs of tan of a sum** and not of tan 3θ."*

The bullet correctly identifies a wrong formula. Its stated reason is false. The tangent
sum formula is

    tan(A + B) = (tan A + tan B) / (1 − tan A tan B)

— verified symbolically (`tan(A+B) − (tA+tB)/(1 − tA·tB)` simplifies to **0**). Its numerator sign
is `+` but its **denominator sign is MINUS**. The `+ / +` pattern the bullet describes belongs to no
standard tangent formula at all; it is the **hyperbolic** tangent's:
`tanh 3u = (3T + T³)/(1 + 3T²)` with `T = tanh u` — checked numerically at u = 0.4, both sides
**0.833654607012155**.

This matters because the minus sign in the denominator of `tan(A + B)` is itself one of the most
frequently examined details in the syllabus, and this sentence tells a Class-11 student that
`tan(A + B)` has a plus there. Correct replacement: "…which is the tan 3θ formula with both signs
flipped; tan(A + B) has a plus on top but a **minus** underneath." Nothing else on this card is
wrong.

### CLEAN in this group, with the checks named

- **`sin_inverse_2x_over_1_plus_x2`** — CLEAN. Reduction `2x/(1+x²) = sin 2θ` under `x = tan θ`
  correct, range `θ ∈ [−π/4, π/4] ⟺ x ∈ [−1, 1]` correct, and the range is in `lines`. The third
  bullet — "the sign is different for x > 1" — I checked rather than assumed: at **x = 2** the true
  derivative is **−0.4** and `−2/(1+x²) = −0.4`, so the sign really does flip. Checked at a negative
  point too.
- **`sin_inverse_3x_minus_4x3`** — CLEAN. `3 sin θ − 4 sin³θ = sin 3θ`; range
  `θ ∈ [−π/6, π/6] ⟺ x ∈ [−1/2, 1/2]`, stated in `lines`. Its branch warning checked at
  **x = 0.7**: the true derivative is **−4.20084025208** and `−3/√(1−x²)` is **−4.20084025208** —
  the flip is real. The bullet that `sin 3θ = 4sin³θ − 3 sin θ` is "the cosine pattern with the
  wrong function" is right (`cos 3θ = 4cos³θ − 3cos θ`).
- **`tan_inverse_3a2x_minus_x3`** — CLEAN. `x = a tan θ` clears `a³` from both numerator and
  denominator, leaving exactly `tan 3θ`; `y = 3 tan⁻¹(x/a)`; `dy/dx = 3a/(a²+x²)`. The branch note
  is exact: `|3θ| < π/2 ⟺ |x| < a/√3`, and outside it the two differ by the constant π (so the
  derivative is unchanged) — I confirmed the arithmetic `tan(π/6) = 1/√3`. The s4 `why` scaling
  check is also true: doubling a and x from (3, 1.2) to (6, 2.4) takes **0.862068965517** to
  **0.431034482759**, exactly half.
- **`second_deriv_tan_inverse_2x_over_1_minus_x2`** — CLEAN. `y = 2 Tan⁻¹x` on `|x| < 1` with the
  restriction stated in `lines`; `y″ = −4x/(1+x²)²`; and the margin's sign description (zero at
  x = 0, negative for x > 0, positive for x < 0) is right — checked at x = 0.3 (−1.01) and
  x = −0.6 (+1.30). `x ≠ ±1` is written beside the boxed answer.
- **`sin_inverse_and_tan_inverse_equal_derivatives`** — CLEAN, and unusually careful. The
  substitution `x − β = (α−β)sin²θ` forces `α − x = (α−β)cos²θ`, so f reduces to `Sin⁻¹|sin θ|` and
  g to `Tan⁻¹|tan θ|`; **the card handles the modulus explicitly in both steps** and justifies
  dropping it from `0 < θ < π/2`, which is exactly the step most answers skip. Step 4's logic —
  equal on an *interval* ⟹ equal derivatives — is correctly stated, and the margin insists on "every
  point", not one point. Step 5's common value verified: with α = 5, β = 1 I computed f′ and g′
  independently at x = 1.6, 3.0 and 4.4 and they agree with each other, with the claimed
  `1/(2√((x−β)(α−x)))`, and with both central differences (e.g. x = 3: all three read 0.25).
- **`tan_inverse_root_1_minus_cos_over_1_plus_cos`** — CLEAN. `(1−cos x)/(1+cos x) = tan²(x/2)`;
  the card writes `√(tan²(x/2)) = |tan(x/2)|` and states the range `0 < x < π` that removes the
  modulus — in `lines`. Derivative 1/2 confirmed at x = 0.6 and x = 2.5.
- **`tan_inverse_root_1_minus_x_over_1_plus_x`** — CLEAN. `x = cos 2θ` (not `cos θ`); both
  half-angle identities used the right way round; the modulus on `√(tan²θ)` handled with a reason;
  `y = ½cos⁻¹x` and `dy/dx = −1/(2√(1−x²))`. Checked at a negative x too, since the minus sign is
  the whole risk here.
- **`tan_inverse_root_1_plus_x2_minus_1_over_x`** — CLEAN. Same reduction as the
  `f_wrt_g_tan_inverse_pair` card and consistent with it: `(sec θ − 1)/tan θ = tan(θ/2)`, so
  `y = ½Tan⁻¹x`. `x ≠ 0` is stated in `lines`, and the range argument `θ/2 ∈ (−π/4, π/4)` is given.
  Checked at a negative x (−1.4) as well.
- **`tan_inverse_root_sum_over_difference`** — CLEAN, and its restriction reasoning is right at both
  ends: `|x| < 1` for `1 − x² ≥ 0`, and `x ≠ 0` because the denominator vanishes there — both in
  `lines`. Substituting on **x²** (not x) is the correct choice; `θ ∈ (0, π/4)` makes both
  `√2 cos θ` and `√2 sin θ` positive; `(1+tan θ)/(1−tan θ) = tan(π/4 + θ)` with `π/4 + θ ∈
  (π/4, π/2)` inside the principal range. Final `−x/√(1−x⁴)`. Because the reduction goes through x²
  the answer is **odd** while y is **even** — I checked a negative point deliberately (x = −0.5
  gives **+0.516397779494322**, matching), since an author who mishandled the x² substitution would
  get the sign wrong exactly there.
- **`tan_inverse_sec_x_plus_tan_x`** — CLEAN. `sec x + tan x = (1+sin x)/cos x`; `1 + sin x =
  (cos(x/2)+sin(x/2))²` and `cos x = (cos(x/2)+sin(x/2))(cos(x/2)−sin(x/2))` — the shared bracket
  really does cancel; `(1+tan(x/2))/(1−tan(x/2)) = tan(π/4 + x/2)`; derivative 1/2, confirmed at
  three points including a negative one. *Observation, not banded:* the s4 `memory_tip` checks the
  slope with "y(0) = π/4 and y(π/2) = π/2", but `x = π/2` is outside the card's own stated interval
  `−π/2 < x < π/2` and the original function does not exist there (sympy returns `zoo` for both
  `sec(π/2)` and `tan(π/2)`; the value π/2 is the one-sided **limit**, which sympy confirms). Unlike
  the `y = x` check flagged in Group 3, this check does discriminate — a wrong slope would fail it —
  and it lands on the right answer, so the harm is small; the honest phrasing is "as x → π/2⁻".
- **`sin_x_power_x_plus_x_power_sin_x`** — CLEAN. Split before logging (the card explicitly warns
  that `log(u+v) ≠ log u + log v`); `log u = x log(sin x)` and `log v = sin x·log x` are the right
  way round, not duplicated; both brackets multiplied back by their own factor. Symbolic difference
  **0**. Domain `x > 0` and `sin x > 0` stated in `lines`.
- **`x_power_tan_x_plus_sin_x_power_cos_x`** — CLEAN. `d/dx(tan x) = sec²x` (the bullet warning
  against `sec x tan x` is well aimed); the second term's minus sign from `d/dx(cos x)` survives to
  the boxed line; `cos²x/sin x = cos x cot x` (not `cot²x`, as its own bullet says). Symbolic
  difference **0**. Domain `x > 0` and `sin x > 0` stated in `lines`.
- **`x_power_x`** — CLEAN. Logarithmic differentiation, `(1/y)y′ = 1 + log x`, multiplied back.
  Symbolic difference **0**; checked at x = 0.5, 2.0 and 3.4 with central differences. `x > 0` is in
  the very first line of the working. Both step-1 bullets correctly name the two rules that do
  *not* apply, and the step-2 margin's check ("at x = 1 the derivative is 1") is right.

**Group 6 verdict: 13 CLEAN, 1 MISLEADING, 0 WRONG, 0 THIN.**

---

# Summary

## Tally by band — 72 of 72 cards

| band | count | cards |
|---|---|---|
| **WRONG** | **0** | — |
| **MISLEADING** | **4** | `ex_wrt_root_x`, `root_1_minus_x2_plus_root_1_minus_y2`, `x3_plus_y3_minus_3axy`, `three_tan_inverse_sum_derivative` |
| **THIN** | **3** | `log_sec_x_plus_tan_x`, `log_tan_e_x`, `sec_root_tan_x` |
| **CLEAN** | **65** | listed group by group above |

**Not one card is mathematically wrong.** Every boxed derivative in all 72 cards survived an
independent sympy re-derivation and a central-difference cross-check. That is a materially better
result than the comparable run recorded in `docs/patterns/answer_book.md` (7 of 271 WRONG), and it
also differs in kind from the companion 29-card pass: the four MISLEADING findings here are all
*prose defects beside correct mathematics*, which is the shape that pass predicted, but three of the
four sit in a **check or mnemonic the student is invited to apply**, not in a descriptive sentence.

## Every finding, in one table

| card | band | exact location | what it says | what it should say | numeric evidence |
|---|---|---|---|---|---|
| `ts_ipe_m1b_dif_ex_wrt_root_x` | MISLEADING | step `s2_divide`, `why` | "The fraction underneath is smaller than 1 near x = 0, so dividing by it must make the answer larger than eˣ." | `1/(2√x) → +∞` as `x → 0⁺`; it is below 1 only for `x > 1/4`. Dividing by it multiplies by `2√x`, which **shrinks** the answer when `x < 1/4`. | at x = 0.04: `1/(2√x) = 2.5`; answer `2√x·eˣ = 0.416324309676955` vs `eˣ = 1.04081077419` |
| `ts_ipe_m1b_dif_ex_wrt_root_x` | MISLEADING | step `s2_divide`, `margin_note` | "…so the answer is larger than eˣ, never smaller." | Larger only for `x > 1/4`; equal at `x = 1/4`; smaller below. | same numbers; crossover exactly at x = 1/4 |
| `ts_ipe_m1b_dif_root_1_minus_x2_plus_root_1_minus_y2` | MISLEADING | step `s5_differentiate`, `margin_note` | "The two roots must end the right way round… Check by putting y = x, which gives dy/dx = 1." | The check is symmetric — the inverted answer also gives 1 — so it cannot detect the named error; and `y = x` is not on the curve (`2√(1−x²) = 0 ⇒ x = ±1`, where the expression is 0/0). Check at a real point on the curve instead. | a = 2, x = 0.5, y = −0.392820323028: correct **1.0618802153517** = true slope **1.0618802153517**; inverted **0.94172580442022** |
| `ts_ipe_m1b_dif_x3_plus_y3_minus_3axy` | MISLEADING (low) | step `s2_collect_and_solve`, `memory_tip` | "The numerator and the denominator have the same shape with x and y exchanged: ay − x² over y² − ax." | The denominator is **minus** the numerator with x and y exchanged. The true symmetry is that swapping x and y in the whole fraction gives the **reciprocal**. | a = 1.75: correct at x = 1 is **0.387760969269**, mnemonic-literal `(ay−x²)/(ax−y²)` is **−0.387760969269**; at x = 2, **0.907782301977** vs **−0.907782301977**; full swap at x = 2 gives **1.10158569717** = `1/(dy/dx)` |
| `ts_ipe_m1b_dif_three_tan_inverse_sum_derivative` | MISLEADING (low) | step `s3_triple`, 2nd `common_mistakes` bullet | "(3 tan θ + tan³θ)/(1 + 3 tan²θ), which are the signs of tan of a sum" | `tan(A+B) = (tan A + tan B)/(1 − tan A·tan B)` — the denominator carries a **minus**. The `+/+` pattern is `tanh 3u`, not any tangent formula. | `tan(A+B) − (tA+tB)/(1−tA·tB)` simplifies to **0**; `tanh(3u)` at u = 0.4 = **0.833654607012155** = `(3T+T³)/(1+3T²)` |
| `ts_ipe_m1b_dif_log_sec_x_plus_tan_x` | THIN | whole card | no condition on x anywhere the student reads | needs `sec x + tan x > 0`, i.e. `cos x > 0`; step 2 also cancels that bracket, so it must be non-zero | at x = 2, 3, 4 rad the bracket is **−4.5880378249839**, **−1.1526552089822717**, **−0.3720643741168197** — the function does not exist there |
| `ts_ipe_m1b_dif_log_tan_e_x` | THIN | whole card | no condition on x | needs `tan eˣ > 0`; the `cosec` form additionally needs `sin(2eˣ) ≠ 0` | mathematics exact (`sec²θ/tan θ − 2 cosec 2θ = 0`), only the domain is missing |
| `ts_ipe_m1b_dif_sec_root_tan_x` | THIN | whole card | no condition on x | needs `tan x > 0` (strictly, for the `2√(tan x)` denominator), i.e. `kπ < x < kπ + π/2` | mathematics exact (symbolic 0 at x = 0.4 and x = 1.0 with CD) |

Three sibling log cards in the same unit **do** state their condition
(`log_4x2_minus_9_second`, `log_diff_fractional_powers`, `log_sin_log_x`), so the three THIN cards
are an inconsistency inside the unit rather than a house convention.

## Checks that came back clean across the whole corpus

- **No `common_mistakes` bullet names a correct move as an error.** The companion pass found six in
  one batch; I found zero in 72 cards. Several bullets *do* flag a correct-but-unsimplified form
  (e.g. `sec_3x`: "Stopping at 3 sin 3x/cos²3x, which is right but not in the expected form"), but
  every one of those says so explicitly rather than calling the mathematics wrong.
- **Every quotient-rule numerator is `u′v − uv′`, never reversed.** Checked on
  `sin_y_equals_x_sin_a_plus_y`, `xy_equals_e_x_minus_y`, `log_quadratic_ratio`,
  `ay4_equals_x_plus_b_5`, `x_root_a2_plus_x2_plus_a2_log` and `param_1_minus_t2_over_1_plus_t2`.
- **Every parametric division is the right way up.** The finite-difference *slope* `ΔY/ΔX` was used
  precisely because an inverted `(dx/dt)/(dy/dt)` fails it immediately; all five parametric cards
  passed.
- **Every logarithmic-differentiation card carries both terms of the log-derivative** and multiplies
  back by y: `x_power_x`, `sin_x_power_x_plus_x_power_sin_x`,
  `x_power_tan_x_plus_sin_x_power_cos_x`, `log_diff_fractional_powers`, `x_power_y_equals_y_power_x`,
  `x_power_y_plus_y_power_x_equals_ab`, `y_equals_x_power_y`, `x_power_log_y_equals_log_x`,
  `ay4_equals_x_plus_b_5`.
- **Every first-principles card evaluates the limit rather than asserting it**, and in each one the
  `h` genuinely cancels before the limit is taken.
- **Branch and principal-range arguments are present and correct wherever they matter.** The
  multiple-angle inverse-trig cards state their intervals in `lines`, and the four cards that claim
  a *different* branch exists elsewhere (`cos_inverse_4x3_minus_3x`, `sin_inverse_2x_over_1_plus_x2`,
  `sin_inverse_3x_minus_4x3`, `tan_inverse_wrt_sin_inverse`) are all right about it — I verified each
  flip numerically on the other branch.

## Where I disagreed with a card and the card turned out to be right

1. **`param_cycloid_second_deriv` — the sign of `cosec⁴(t/2)/(4a)`.** I flagged this as a copied
   textbook error, because the cycloid result every reference carries is
   `d²y/dx² = −1/(4a sin⁴(t/2))`, i.e. **negative**. What changed my mind: this question's curve is
   `y = a(1 + cos t)`, not the standard `y = a(1 − cos t)`. Re-deriving from the card's own
   parametrisation gives `dy/dx = −cot(t/2)`, `d/dt(dy/dx) = +½cosec²(t/2)`, and after the second
   division by `dx/dt`, `+cosec⁴(t/2)/(4a)`. Symbolic difference 0; numeric +7.76508757539322 at
   t = 0.8. The card is right and the familiar sign is the one that does not apply.
2. **`root_1_minus_x2…` s5 bullet "makes the answer come out as 1".** I first read this as a
   fabricated consequence — dropping the `dy/dx` factor leaves no `dy/dx` to solve for at all. Then
   I worked it through: dropping it leaves `1/√(1−x²) = 1/√(1−y²)`, i.e. `√(1−y²)/√(1−x²) = 1`, so
   the claimed answer really does collapse to 1. The bullet is right — and noticing why is what
   exposed the *other* defect on that card, since the margin note two lines above recommends
   checking that you get 1.
3. **`xy_equals_e_x_minus_y` s4 margin, "log x is not a factor of (1 + log x)".** I had this written
   up as a MISLEADING finding — the fact needed is the converse, that `(1 + log x)` is not a factor
   of `log x`. On checking, *both* statements are true (neither divides the other as polynomials in
   `log x`) and the conclusion drawn is correct, so nothing false reaches the student. Downgraded to
   an observation.
4. **`three_tan_inverse_sum_derivative` s2 tip, "the count in the numerator matches the multiple of
   the angle in every one of these three formulas".** This looked like a pattern asserted from three
   examples. It is a theorem: the numerator of `tan nθ` is `C(n,1)t − C(n,3)t³ + …`, whose leading
   coefficient is n. Confirmed on `tan 5θ = (5t − 10t³ + t⁵)/(1 − 10t² + 5t⁴)`.
5. **`log_diff_fractional_powers`, the domain `−1/7 < x < 1/6`.** I expected a coaching-book-derived
   card to state a sloppy or over-wide interval. `solve([1−2x>0, 1+3x>0, 1−6x>0, 1+7x>0])` returns
   exactly `(−1/7 < x) & (x < 1/6)`.
6. **`cos_inverse_4x3_minus_3x`, the bullet that the sign differs on `−1/2 < x < 1/2`.** I assumed
   this was a hand-wave. At x = 0.2 the true derivative is **+3.06186217848** and `+3/√(1−x²)` is
   **+3.06186217848** — the card is exactly right about where and how the branch changes.
7. **`tan_inverse_3a2x_minus_x3` s4, "doubling both a and x halves 3a/(a²+x²)".** Read as a
   plausible-sounding aside; it is a real scaling argument and the numbers confirm it
   (0.862068965517 → 0.431034482759).
8. **`x_power_y_equals_y_power_x`.** My first numeric probe at x = 2.5 returned `y = 2.5` and
   `dy/dx = 1.0`, which told me nothing — the root-finder had landed on the trivial branch `y = x`,
   where many wrong formulas also give 1. I re-ran on the non-trivial branch (x = 3,
   y = 2.4780526802883, claim and finite difference both **−0.72717897733087**) before calling it
   clean. Recording this because a single lazy probe on that curve is a false pass waiting to happen.

## Coverage statement — honest

**All 72 cards received a dedicated pass. None was swept.** For every card I:

- read the complete card (question, every `lines` entry of every step, plus every `why`,
  `memory_tip`, `margin_note` and `common_mistakes` bullet) from a full JSON dump — not a sampled
  view;
- re-derived the mathematics independently in sympy from the `question_text`, never from the card's
  working;
- evaluated the card's claim and my own at **two** numeric points — a third wherever a branch, a
  sign, or a negative argument made one worth having — and ran a central difference `h = 1e-5`
  (or `1e-6`, and `1e-8` in mpmath at 25 digits for the implicit and root-found curves) at those
  points.

Deliberate methodological choices, so they can be audited:

- **`verification.note` was never used as evidence.** I read the notes only after forming a verdict,
  and only to check whether a note contradicted what I had found. None did.
- **Implicit cards were checked at points genuinely on the curve**, obtained by root-finding
  `y(x)` at 25-digit precision, so the finite difference measures the real slope of the real curve,
  not of an algebraic rearrangement.
- **"Show that" cards have no derivative to compare**, so for those I constructed the actual
  solution and evaluated the asserted identity's residual (e.g. `5yy″ − (y′)²` → 0;
  `y₂ + tan x·y₁ + y cos²x` → 1.4e−16 and 2.2e−16).
- **Three cards were checked on their off-interval branch as well**, because the card claims the
  answer changes there.

Gaps I am declaring rather than papering over:

1. **I checked correctness, not the mark split.** `mark_split`, per-step `marks`, `marks_total`,
   `qtype` and `expected_time_min` were outside this pass. Every card's own `verification.note`
   says the split is this book's work and unverified by a Telangana IPE teacher; I did nothing to
   change that status either way.
2. **Domain conditions were judged card by card, not by a mechanical rule.** I banded THIN only
   where a condition is absent entirely *and* the function fails on large intervals a student would
   naturally test. Two further cards carry a weaker version of the same issue and are recorded as
   observations rather than bands, with my reasoning stated so a stricter reader can promote them:
   `a_cos_sin_x_plus_b_sin_sin_x` (the identity needs `cos x ≠ 0`, though the printed `tan x`
   announces it) and `log_sin_log_x` (states `0 < log x < π` as an equivalence when
   `sin(log x) > 0` also holds on `2kπ < log x < (2k+1)π` — at `x = e^{2.5π} ≈ 2575.97`,
   `sin(log x) = 1.0`).
3. **Rule 41 plain-language register was not audited, and the `recall` speech fields were only
   counted, not judged.** One measurable thing I did stop to quantify, because it was visible on
   nearly every card: **58 of the 72 cards** carry Telugu–English code-mixed strings in
   `recall.accept` (of 1,229 accept strings in total) — e.g. `x_power_x`: "base kooda x, power kooda
   x, so log teesukovali" and "y tho multiply chesi x power x rayali";
   `2x2_minus_3xy_plus_y2_implicit`: "prati term ni x tho differentiate cheyyali". These are
   speech-recognition *acceptance* patterns, not text a student is shown, so code-mix there may well
   be deliberate — but it sits against the English-only product decision (Rule 30i) and against the
   "plain English, never Hinglish" line in the authoring SOP, and I have not established which
   intent applies. Flagging it as a question for the founder, not as a finding.
4. **I did not compare these cards against the source book.** Originality and provenance
   (`docs/ORIGINALITY_MATHS.md`) were out of scope.

