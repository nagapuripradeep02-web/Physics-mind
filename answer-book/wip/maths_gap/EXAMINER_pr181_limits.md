# Independent examiner pass — Maths-1B Unit 8, Limits and Continuity (43 cards, PR #181)

Examiner: independent pass, 2026-08-31. Report only; no card was edited.
Corpus: all 43 `ts_ipe_m1b_lim_*` (36) + `ts_ipe_m1b_con_*` (7) cards, `subject: mathematics_1b`, unit 8.

Method: every card's answer was **re-derived from `question_text`**, not read against its own
working. `verification.note` was treated as non-evidence throughout (per
`docs/patterns/answer_book.md`). Every limit was then evaluated **numerically from both sides** at
`a ± 10⁻³, 10⁻⁴, 10⁻⁵, 10⁻⁶` at 40-digit precision (mpmath, `mp.dps = 40`), and cross-checked
symbolically with `sympy.limit()` where a closed form was available. Limits at infinity were
sampled at `x = 10³, 10⁵, 10⁷, 10⁹`. Every `why`, `memory_tip`, `margin_note` and
`common_mistakes` bullet was read as a claim to be checked, and every numeric figure quoted in
prose was recomputed.

---

## 1. Tally

| Band | Count | Cards |
|---|---|---|
| **WRONG** | **0** | — |
| **MISLEADING** | **5** | `con_k_squared_x_minus_k_find_k`, `lim_e_power_sin_x_minus_1_over_x`, `lim_one_over_x_minus_2_minus_four_over_x2_minus_4`, `lim_sin_x_minus_1_over_x2_minus_1`, `lim_sin_tan_squared_over_x2_minus_a2_squared` |
| **THIN** | **2** | `lim_1_minus_cos_2mx_over_sin2_nx`, `lim_x2_sin_one_over_x` |
| **CLEAN** | **36** | listed in §4 |

**No card in this corpus is mathematically wrong.** All 43 boxed answers reproduce to ≥ 8
significant figures under two-sided numerical approach, and every one that sympy can evaluate
symbolically agrees. The shape here matches the companion pass exactly: the defects are false
sentences in explanatory prose sitting beside correct mathematics — three of the five are
`common_mistakes` / `memory_tip` fields, not working lines.

**Instruction-2 trap, confirmed handled and closed.** The source volume prints
`lim(x→2) (2x²−7x−4)/((2x−1)(√x−2))`, which is not indeterminate at 2 while its own working
rationalises `√x−2` (which only cancels at 4). Our card
`ts_ipe_m1b_lim_2x2_minus_7x_minus_4_over_root_x_minus_2` asks for **x → 4**, which is genuinely
0/0 there (numerator `2(16)−28−4 = 0`, denominator `7·0 = 0`). Verified: the value **at x = 2** is
`5√2/3 + 10/3 ≈ 5.690` (finite, non-indeterminate); the limit **at x = 4** is `36/7` by sympy and
by two-sided approach. The card is correct and does not inherit the source defect. Not re-litigated.

**Also swept and clean across the corpus:**
- **No falsely-claimed indeterminacy.** Every card that applies a special technique first faces a
  real indeterminate form. The three cards where the expression is *not* indeterminate
  (`lim_abs_x_minus_2_left`, `lim_two_abs_x_..._right`, both `lim_floor_x_plus_x_*`) correctly do
  **not** claim 0/0 — `lim_abs_x_minus_2_left` explicitly warns against it in a mistake bullet.
- **No condition parked out of sight.** A scripted diff of every inequality/`≠` condition appearing
  in `verification.note` against the union of `lines + why + common_mistakes + memory_tip +
  margin_note` found **zero** conditions visible only in the note. In particular the domain
  restriction on `lim_x_minus_3_over_root_x2_minus_9` (`√(x²−9)` real only for `x ≥ 3` or `x ≤ −3`,
  so the approach is necessarily from the right) is stated in the note **and** in student-visible
  line `s1_split_root[2]`.
- **Mark arithmetic.** For all 43 cards, `sum(mark_split) == sum(step marks) == marks_total`.

---

## 2. Findings — every WRONG / MISLEADING / THIN card

### F1 — `ts_ipe_m1b_con_k_squared_x_minus_k_find_k` · **MISLEADING**
**Where:** step `s2_limits_and_value`, `common_mistakes[1]`.
**Says:** *"Substituting x = 1 into k²x − k as k² − k and then writing it as k(k − 1) too early,
before the equation is set up."*
**Why it is a defect:** the leading clause names **the step's own marked line** as a mistake — the
same step's `lines[1]` reads *"Value at 1: x = 1 satisfies x ≥ 1, so f(1) = k²(1) − k = k² − k"*,
which is the correct move worth this mark. And the trailing clause is not an error either:
`k² − k = k(k − 1)` is valid algebra, and a student who writes `k(k − 1) = 2` reaches
`k² − k − 2 = 0` and the same two roots. Nothing here loses a mark.
**Should say:** delete the bullet, or replace with a real error for this step, e.g.
*"Reading the right limit as 2 instead of k² − k, because the constant piece is written first."*
**Evidence:** the mathematics is sound — `sympy.solve(k² − k − 2)` returns `[-1, 2]`; the card's
own back-substitution check (`k = 2 → f(1) = 2`; `k = −1 → f(1) = 2`) is correct. Only the bullet
is wrong.

### F2 — `ts_ipe_m1b_lim_e_power_sin_x_minus_1_over_x` · **MISLEADING**
**Where:** step `s2_answer`, `common_mistakes[1]`.
**Says:** *"Multiplying the two factors and giving 2 instead of 1."*
**Why it is a defect:** multiplying the two factors is the **correct** operation and is exactly what
the card prescribes — `lines[3]` is `= 1 · 1` and the `memory_tip` reads *"Both factors are worth 1,
so the answer is 1 × 1."* Multiplying gives 1, never 2. The error the bullet is reaching for is
**adding** them. As printed, the bullet tells a student that the card's own final line is a mistake.
**Should say:** *"Adding the two factors and giving 2, when they must be multiplied to give 1."*
**Evidence:** two-sided approach, `L/R` at `h = 10⁻³ … 10⁻⁶`:
`0.999500000125 / 1.00049999987`, `0.99995 / 1.00005`, `0.999995 / 1.000005`,
`0.9999995 / 1.0000005` → **1**, as boxed. The mathematics is correct.

### F3 — `ts_ipe_m1b_lim_one_over_x_minus_2_minus_four_over_x2_minus_4` · **MISLEADING**
**Where:** step `s1_combine`, **`lines[1]`** (student-visible working) and the same claim repeated
in `margin_note`.
**Says:** *"Each part alone increases without bound as x → 2, so the two are combined into one
fraction."* / *"Each piece alone increases without bound as x → 2, so neither may be given a limit
on its own."*
**Why it is a defect:** false on the left. `1/(x − 2) → +∞` as `x → 2⁺` but `→ −∞` as `x → 2⁻`;
likewise `4/(x² − 4)`. Neither part "increases without bound as x → 2". A student who takes the
sentence at face value will later write `lim(x→2⁻) 1/(x − 2) = +∞`, which is wrong. The
**conclusion** the card draws from it (neither piece has a limit, so combine first) is correct — the
`why` field on the same step even states the correct reason (*"the difference of two limits rule
needs each limit to exist, and neither piece has a limit here"*). Only the stated reason on the
printed line is false.
**Should say:** *"Each part alone is unbounded near 2 — it runs to +∞ from the right and to −∞ from
the left — so neither has a limit and the two are combined into one fraction."*
**Evidence:** the card's answer 1/4 is correct. Two-sided approach:
`h=10⁻³ L=0.250062515629 R=0.249937515621`; `10⁻⁴ 0.250006250156 / 0.249993750156`;
`10⁻⁵ 0.250000625002 / 0.249999375002`; `10⁻⁶ 0.2500000625 / 0.2499999375` → **1/4**.
Directly: `1/(1.999 − 2) = −1000`, `1/(2.001 − 2) = +1000` — opposite signs, not both "increasing".

### F4 — `ts_ipe_m1b_lim_sin_x_minus_1_over_x2_minus_1` · **MISLEADING**
**Where:** step `s2_standard_limit`, `memory_tip`.
**Says:** *"The answer is always 1 divided by the leftover factor at the point. Here the leftover is
x + 1 = 2, so the answer is 1/2."*
**Why it is a defect:** stated as a theorem (`always`) with no scope. It holds only when the angle
inside the sine is **exactly** the cancelling factor with coefficient 1. Applied as written to the
neighbouring shape `lim(x→1) sin(2x − 2)/(x² − 1)` a student gets 1/2; the true value is **1**
(`2 · 1/2`). This is precisely the "true of the card's own numbers, printed as a theorem" shape.
The sibling card `lim_tan_x_minus_a_over_x2_minus_a2` gets the same idea right by scoping it —
*"The leftover factor at the point is x + a = 2a, so the answer is its reciprocal"* — no `always`.
**Should say:** *"When the angle inside the sine is exactly the factor that cancels, the answer is 1
divided by whatever is left at the point. Here the leftover is x + 1 = 2, so the answer is 1/2."*
**Evidence:** the card's answer 1/2 is correct — `h=10⁻³ L=0.500250041688 R=0.499750041646` …
`10⁻⁶ L=0.50000025 R=0.49999975`, and its own prose figure checks out exactly
(at x = 1.00001 the expression is **0.4999975**, as claimed). Counter-example computed:
`sin(2x−2)/(x²−1)` at `x = 1.000001` is `0.9999995` and at `x = 1.00001` is `0.999995` → limit **1**, not 1/2.

### F5 — `ts_ipe_m1b_lim_sin_tan_squared_over_x2_minus_a2_squared` · **MISLEADING**
**Where:** step `s2_apply_and_substitute`, `why`.
**Says:** *"The value checks numerically: with a = 2 the expression is 0.000625 at x = 2.01 and
0.0000625 at x = 2.001, falling by a factor of ten each time, **exactly as** (x − a)/(2a)² =
(x − a)/16 does."*
**Why it is a defect:** 0.000625 is the value of the **approximation** `(x − a)/16`, not of the
expression. The expression at `x = 2.01` is **0.00062192** — the third significant figure is wrong,
and the sentence asserts the agreement is "exact". A verification figure that does not reproduce is
worse than no figure: it is the one line a reader would use to satisfy themselves the card was
checked.
**Should say:** *"…with a = 2 the expression is 0.000622 at x = 2.01 and 0.0000625 at x = 2.001,
falling by a factor of about ten each time, as (x − a)/(x + a)² does."*
**Evidence (recomputed at 40 digits):**

| x | card claims | actual `sin(x−2)·tan²(x−2)/((x²−4)²)` |
|---|---|---|
| 2.01 | 0.000625 | **0.0006219177759** |
| 2.001 | 0.0000625 | 0.00006246879295 (claim ok to 3 s.f.) |

Ratio between the two is 9.956, not exactly ten. The **mathematics is correct**: two-sided approach
gives `h=10⁻³ L=−6.253e−5 R=+6.247e−5`; `10⁻⁴ ∓6.250e−6`; `10⁻⁵ ∓6.250e−7`; `10⁻⁶ ∓6.250e−8`
→ **0**, as boxed, and the stated condition `a ≠ 0` is present in the working line and in the box.

### F6 — `ts_ipe_m1b_lim_1_minus_cos_2mx_over_sin2_nx` · **THIN**
**Where:** the whole card — the condition `n ≠ 0` appears **nowhere**.
**Says:** boxed answer `2m²/n²`, with no restriction on n stated in `question_text`, `lines`,
`why`, `common_mistakes`, `memory_tip`, `margin_note` or `verification.note`.
**Why it is a defect:** at `n = 0` the denominator `sin²(nx)` is identically zero on every punctured
neighbourhood of 0, so the expression does not exist and `2m²/n²` is meaningless. A scripted scan
found this is the **only** card in the corpus that divides by a symbolic quantity without naming the
condition that keeps it non-zero — the bank states such conditions everywhere else it needs one
(`a ≠ 0` on `lim_tan_x_minus_a` and `lim_sin_tan_squared`; `b ≠ 1` and `a > 0` on
`lim_ax_minus_1_over_bx_minus_1`; `a > 0` on `lim_root_a_plus_2x_minus_root_3x`). It is an
inconsistency, not a source error.
**Should say:** add `, n ≠ 0` to the boxed line, matching the house style of the two `a ≠ 0` cards.
**Evidence:** mathematics correct. With `m = 3, n = 7` the two-sided approach gives
`0.367351836777 / 0.367346987755 / 0.367346939265 / 0.36734693878` → `2·9/49 = 0.3673469388`;
`sympy.limit` returns `2*m**2/n**2`.

### F7 — `ts_ipe_m1b_lim_x2_sin_one_over_x` · **THIN**
**Where:** step `s1_double_inequality`, `why`.
**Says:** *"sin(1/x) has no limit at x = 0, because **1/x increases without bound** and the sine
keeps oscillating between −1 and 1."*
**Why it is a defect:** same directional slip as F3 — as `x → 0⁻`, `1/x → −∞`, it does not increase.
Graded THIN rather than MISLEADING because (a) it sits in a `why`, not in a printed working line,
(b) the substantive reason (the sine keeps oscillating) is correct and carries the argument on its
own, and (c) nothing a student can do with the sentence produces a wrong answer here.
**Should say:** *"…because 1/x runs off to infinity in size as x → 0 and the sine keeps oscillating
between −1 and 1."*
**Evidence:** mathematics correct — `−x² ≤ x² sin(1/x) ≤ x²` holds (`x² > 0` for `x ≠ 0`, so the
inequality direction is preserved, as the card says), and the two-sided numeric values are
`±8.27e−7`, `∓3.06e−9`, `±3.57e−12`, `∓3.50e−13` → **0**, as boxed. Sandwich theorem correctly
named and its hypothesis (both outer limits equal) correctly checked.

---

## 3. Where I disagreed with a card and the card turned out right

Six of these. All were prose I read as broken on the first pass and had to withdraw after
re-deriving. They are recorded because each one is a trap for the next examiner.

1. **`lim_2x2_minus_7x_minus_4_over_root_x_minus_2` — I opened it expecting the source defect.**
   The card id ends `_over_root_x_minus_2`, which reads as "limit at 2". It is not: the `_x_minus_2`
   names the *denominator factor* `√x − 2`, and the `question_text` asks for **x → 4**, the point
   where the expression really is 0/0. The card had already corrected the source volume. Nothing to fix.

2. **`lim_cos_ax_minus_cos_bx_over_x2`, `s2` mistake bullet — "Forgetting the half-angle
   coefficients and answering 2(a + b)(b − a)".** I first read this as unreachable: forgetting the
   coefficients *entirely* leaves `2 · 1 · 1 = 2`. Re-derived: dropping only the `÷2` inside each
   coefficient — using `(a + b)` and `(b − a)` where `(a+b)/2` and `(b−a)/2` belong — gives exactly
   `2(a + b)(b − a)`. The bullet is precise; I had misread "half-angle" as "the coefficient" rather
   than "the halving".

3. **`lim_sin_tan_squared_over_x2_minus_a2_squared`, `s1` mistake — "Cancelling all three powers
   above against the two below and answering 1/(2a)²".** I flagged the arithmetic (three against two
   should leave one power on top). It is right as stated: a student who treats the counts as equal
   cancels everything above, leaves 1, and lands on `1/(x + a)² → 1/(2a)²`.

4. **`con_piecewise_at_2`, `s3` mistake — "Reading 8x⁻³ as −8x³ and getting 2 − 64".** I read this
   as self-contradictory: `−8·2³ = −64`, so `2 − (−64) = 66`, not `2 − 64`. Re-parsed correctly: the
   thing being misread is the whole *signed* term `−8x⁻³`, which as `−8x³` is `−64`, so the student
   writes `2 − 64`. The bullet quotes the expression, not the value. Consistent.

5. **`con_x2_and_x_on_r` `s2`, and `lim_floor_x_plus_x_right` `s1` — mistake bullets whose described
   error yields the right number.** Taking `f(1)` from the `x > 1` piece also gives 1; writing
   `lim [x] = [lim x]` at `2⁺` also gives 2. I initially treated both as wrong-bullet candidates
   under the "names a correct move as the error" test. They are not: both name a *reasoning* error
   whose consequence happens to coincide at this point, which is precisely why they are worth
   warning about — the student cannot tell they got lucky. Kept CLEAN. This is the distinction I
   applied throughout: a bullet is a defect when it names a move the card itself prescribes (F1, F2),
   not when it names an invalid route that coincidentally lands correctly.

6. **`lim_sin_a_plus_bx_minus_sin_a_minus_bx`, `s2` memory tip — "sin(bx)/x is never 1; it is b".**
   Literally false at `b = 1`. I drafted this as a sixth MISLEADING and withdrew it: the corrective
   ("it is b") is in the same sentence, so no student can be led to a wrong answer by it, unlike F4
   where the false rule stands alone and *does* produce a wrong answer on a neighbouring question.
   Logged in §5 instead.

---

## 4. The CLEAN list — 36 cards, with the checks run on each

Every entry below names the approach sequence actually run, the two-sided values obtained, and the
standard form or identity re-derived. `L/R` are the values at `a − h` and `a + h`.

### Continuity (6 of 7)

| Card | Checks run |
|---|---|
| `con_cos_ax_minus_cos_bx_at_zero` | a=3, b=5. Two-sided at `10⁻³…10⁻⁶`: L=R=`7.99997733335`, `7.99999977333`, `7.99999999773`, `7.99999999998` → **8** = `(b²−a²)/2`, which is the given `f(0)`; `sympy.limit` returns `−a²/2 + b²/2`. Identity `cos C − cos D = 2 sin((C+D)/2)·sin((D−C)/2)` re-derived from the standard `−2 sin((C+D)/2) sin((C−D)/2)` — the card's order is sign-correct, and its mistake bullet naming the reversed order is right. All three continuity quantities (limit, value, comparison) present. |
| `con_piecewise_at_2` | Left limit, value and right limit computed **separately**, as required: `sympy.limit((x²−4)/2, x, 2, '-') = 0`; `f(2) = 0` given; `sympy.limit(2 − 8x⁻³, x, 2, '+') = 1` (`8/2³ = 1`). `0 ≠ 1` → the two-sided limit does not exist; jump, not removable. The card's "continuous from the left but not continuous at 2" verdict is exactly what the three numbers support. |
| `con_sin_2x_over_x_at_zero` | Two-sided: L=R=`1.99999866667`, `1.99999998667`, `1.99999999987`, `2.0` → **2**; standard form `sin θ/θ` applied with `θ = 2x` (not x) — the substitution-slip class, handled correctly, factor 2 carried outside. `f(0) = 1` given, `2 ≠ 1` → discontinuous; "removable" is the right name because the limit exists. |
| `con_three_piece_discuss` | Both junctions computed with all three quantities each. At **x=1**: L `= lim(5−3x) = 2`, `f(1) = 2` (the middle piece `−2 ≤ x ≤ 1` owns 1), R `= lim (x−1)/(√x−1) = 2` by sympy (difference of squares in √x re-derived) → continuous. At **x=−2**: L `= 6/(−12) = −1/2` by sympy, `f(−2) = 11`, R `= 11` → discontinuous. Three open intervals each independently cleared (`x = 10 ∉ (−∞,−2)`; `√x − 1 = 0` only at 1). Verdict "continuous everywhere except x = −2" is complete over ℝ. |
| `con_x2_and_x_on_r` | L `= lim x² = 1`, `f(1) = 1` (the `x ≤ 1` piece owns the join), R `= lim x = 1` — all three separately, all equal → continuous at the join. Both pieces polynomial. Union `(−∞,1) ∪ {1} ∪ (1,∞) = ℝ` checked. The tip "x² and x are equal at exactly two places, 0 and 1" verified (`x² = x ⟺ x(x−1) = 0`). |
| `con_x2_minus_9_over_x2_minus_2x_minus_3_at_3` | Two-sided: `1.50012503126/1.49987503124`, `1.50001250031/1.49998750031`, `1.50000125/1.49999875`, `1.500000125/1.499999875` → **3/2**; `sympy.limit = 3/2`. Both factorisations expanded and confirmed: `x²−9 = (x−3)(x+3)`, `x²−2x−3 = (x−3)(x+1)`; the counter-factorisation `(x+3)(x−1)` in the mistake bullet does expand to `x²+2x−3`. `f(3) = 1.5` given, `6/4 = 1.5` → continuous. |

### Limits (30 of 36)

| Card | Checks run |
|---|---|
| `lim_11x3_minus_3x_plus_4_over_13x3` | At `x = 10³,10⁵,10⁷,10⁹`: `0.846479185`, `0.846157101`, `0.846153879`, `0.846153846` → **11/13 = 0.8461538462**. Dominant term correct (both lines cubic); the divided form `(11 − 3/x² + 4/x³)/(13 − 5/x − 7/x³)` re-derived term by term. |
| `lim_2x2_minus_7x_minus_4_over_root_x_minus_2` | Genuinely 0/0 at **x = 4** (see §1). Two-sided: `5.14286229771/5.1428520936` … `5.14285714796/5.14285713776` → **36/7 = 5.142857143**; `sympy.limit = 36/7`. `2x²−7x−4 = (2x+1)(x−4)` expanded and confirmed; `x−4 = (√x−2)(√x+2)` for `x > 0`; only `√x − 2` cancels, `2x−1 = 7` at 4 stays. Negative control: value **at x = 2** is `5√2/3 + 10/3`, finite — the card is not applying a technique to a non-indeterminate form. |
| `lim_3x_minus_1_over_root_1_plus_x_minus_1` | Two-sided: `2.19546892841/2.19898143907` … `2.19722282108/2.19722633359` → **2 ln 3 = 2.19722457734**. Both standard forms applied with the argument each requires: `(aˣ−1)/x → ln a` and `(√(1+x)−1)/x → 1/2`; quotient-rule hypothesis (lower limit `1/2 ≠ 0`) stated on the card. Prose figure recomputed: claimed `2.19724` at `x = 10⁻⁵`, actual **2.19724214** ✓. |
| `lim_8_abs_x_plus_3x_over_3_abs_x_minus_2x` | `x → +∞`: exactly `11.0` at `10³,10⁵,10⁷,10⁹`. Sign of x fixes `|x| = x` → `11x/x`. The `x → −∞` contrast the card asserts was computed as a control: at `x = −10⁹` the value is **1.0**, exactly as the mistake bullet claims (`(−5x)/(−5x)`). |
| `lim_abs_x_minus_2_left` | **Left side only**, correct for a one-sided question: `−1.0` exactly at `h = 10⁻³,10⁻⁴,10⁻⁵,10⁻⁶`. `|t| = −t` for `t < 0` correctly tied to `x < 2`; the card does not falsely claim 0/0, and its bullet says so explicitly. Right-side value `+1` (the card's own contrast) confirmed. |
| `lim_ax_minus_1_over_bx_minus_1` | a=4, b=2. Two-sided: `1.99930709299/2.00069338746` … `1.99999930685/2.00000069315` → **ln4/ln2 = 2**. Standard form `(aˣ−1)/x → logₑa` used twice with the right base each time. Conditions `a > 0` and `b ≠ 1` both present in the visible lines (not parked). Change-of-base gloss `logₑa/logₑb = log_b a` correct. Prose figure: claimed `2.000007`, actual **2.000006931** ✓. |
| `lim_cbrt_1_plus_x_minus_cbrt_1_minus_x_over_x` | Two-sided: L=R=`0.666666790124`, `0.666666667901`, `0.666666666679`, `0.666666666667` → **2/3**. Standard form `((1+x)ⁿ−1)/x → n` applied with `n = 1/3` twice; the `t = −x` substitution re-derived (`(1 − ∛(1−x))/x = (∛(1+t)−1)/t` ✓, sign preserved). The card's own cross-check ("the square-root version gives 1") verified as `2 × ½ = 1`. Prose `0.66667` at `x = 0.001` ✓. |
| `lim_cos_ax_minus_cos_bx_over_x2` | a=3, b=5. Two-sided L=R=`7.99997733335` → `7.99999999998` → **8 = (25−9)/2**. Identity order `(D−C)/2` sign-checked. Both of the card's internal cross-checks verified independently: `a = 0` gives `(1−cos bx)/x² = b²/2` ✓, and the alternative route `(cos ax−1)/x² → −a²/2` plus `(1−cos bx)/x² → b²/2` sums to `(b²−a²)/2` ✓. |
| `lim_cos_x_over_x_minus_pi_by_2` | Two-sided at `π/2`: L=R=`−0.999999833333`, `−0.999999998333`, `−0.999999999983`, `−1.0` → **−1**. `cos(π/2 + h) = −sin h` confirmed; the alternative `x = π/2 − h` route in the mistake bullet also checked (`cos = +sin h`, denominator `−h`, same `−1`). Derivative cross-check `d/dx cos x |_{π/2} = −1` ✓. Prose "−1.000000 at π/2 + 0.00001" reproduces. |
| `lim_e_7x_minus_1_over_x` | Two-sided: `6.97555706676/7.02455726685` … `6.99997550006/7.00002450006` → **7**. `(eᵗ−1)/t → 1` applied with `t = 7x`, not x — the coefficient is carried outside, not lost. |
| `lim_e_x_plus_3_minus_e3_over_x` | Two-sided: `20.0754975015/20.0955830401` … `20.0855268804/20.085546966` → **e³ = 20.0855369232**. `e^(x+3) = e³·eˣ` split confirmed; `e³` is x-free so it leaves the limit correctly. |
| `lim_ex_minus_1_over_root_1_plus_x_minus_1` | Two-sided: `1.99850045817/2.0015004585` … `1.9999985/2.0000015` → **2**. Ratio of `(eˣ−1)/x → 1` and `(√(1+x)−1)/x → 1/2`; quotient-rule hypothesis stated. Prose `2.000015` at `10⁻⁵` reproduces **exactly**. |
| `lim_ex_minus_sin_x_minus_1_over_x` | Two-sided: `−4.99667e−4/+5.00333e−4`, `−4.99967e−5/+5.00033e−5`, `−5.0e−6/+5.0e−6`, `−5.0e−7/+5.0e−7` → **0** (values straddle 0 symmetrically, converging linearly). Regrouping `(eˣ−1) − sin x` justified by both limits existing separately; `1 − 1 = 0`. |
| `lim_floor_x_plus_x_left` | `[x] = 1` on `1 < x < 2` confirmed (`[1.9] = [1.999] = 1`); at `x = 1.999999` the whole expression is `2.999999` → **3**. Left approach only, correct for the one-sided question. The stated right-hand contrast (4) confirmed against the sibling card. |
| `lim_floor_x_plus_x_right` | `[x] = 2` on `2 < x < 3`; at `x = 2.000001` the expression is `4.000001` → **4**. Right approach only. The card correctly reports the pair `3 ≠ 4` as the two-sided limit failing to exist. |
| `lim_log_1_plus_5x_over_x` | Two-sided: `5.01254182354/4.98754151104` … `5.00001250004/4.99998750004` → **5**. `log(1+t)/t → 1` with `t = 5x`; base declared natural in the first line, and the base-10 caveat in the mistake bullet is correct (`log₁₀(1+t)/t → 1/ln 10`). |
| `lim_one_over_x_minus_2_minus_four_over_x2_minus_4` | *(mathematics only — banded MISLEADING at F3 for its prose)* |
| `lim_root_1_plus_x_minus_1_over_x` | Two-sided: `0.500125062539/0.499875062461` … `0.500000125/0.499999875` → **1/2**. Conjugate step re-derived: `(1+x) − 1 = x` cancels the x below, leaving `1/(√(1+x)+1) → 1/2`. Prose `0.49999` at `x = 0.0001`: actual **0.4999875006**, correct to the 5 dp quoted. |
| `lim_root_a_plus_2x_minus_root_3x` | Both conjugates re-derived: numerator `(a+2x) − 3x = a − x`; denominator `(3a+x) − 4x = 3(a − x)` — the `2` in `2√x` **is** squared, as the mistake bullet insists. Two-sided at **three separate values of a** to test the card's claim that the answer is a-independent: a=5 → `0.384900187/0.384900171`; a=0.7 → `0.384900237/0.384900122`; a=1 → `0.384900220/0.384900139`; all → **2√3/9 = 0.38490017946**. Condition `a > 0` present in the working line and in the box. Denominator zero only at `x = a` (`3a+x = 4x ⟺ x = a`), so nothing else cancels. |
| `lim_root_x_plus_1_minus_root_x` | `x = 10³,10⁵,10⁷,10⁹`: `0.0158074374`, `0.00158113488`, `0.000158113879`, `1.58113883e−5` → **0**, decaying as `1/(2√x)` exactly as the rationalised form `1/(√(x+1)+√x)` predicts. `∞ − ∞` correctly named, not substituted. |
| `lim_sin_a_plus_bx_minus_sin_a_minus_bx` | a=1, b=3. Two-sided L=R=`3.24180897249`, `3.24181378658`, `3.24181383472`, `3.2418138352` → **2b cos a = 3.24181383521**. `sin C − sin D = 2 cos((C+D)/2)·sin((C−D)/2)` re-derived: half-sum `a`, half-difference `bx` ✓. `sin(bx)/x → b`, not 1 — applied correctly. Prose `3.24181` ✓. |
| `lim_sin_ax_over_x_cos_x` | a=3. Two-sided L=R=`2.999997`, `2.99999997`, `2.9999999997`, `3.0` → **a**. `sin θ/θ` used with `θ = ax`, the coefficient paid for outside; `cos x` split off as the non-indeterminate factor and substituted (`cos 0 = 1`). Prose "3.0000 at x = 0.0001": actual **2.99999997** ✓. |
| `lim_sin_pi_cos2_x_over_x2` | Two-sided L=R=`3.14159160639`, `3.14159264312`, `3.14159265349`, `3.14159265359` → **π**. Reduction `cos²x = 1 − sin²x` then `sin(π − θ) = sin θ` with `θ = π sin²x` re-derived (the mistake bullet correctly attributes `−sin θ` to `sin(π + θ)`). `sin θ/θ` used twice with the right angle each time: outer with `π sin²x`, inner as `(sin x / x)²`. Prose "3.14159 to five decimal places at x = 0.001": actual **3.141591606** ✓. |
| `lim_tan_x_minus_a_over_x2_minus_a2` | a=2. Two-sided: `0.250062598983/0.249937598934` … `0.2500000625/0.2499999375` → **1/(2a) = 0.25**. `tan θ/θ → 1` justified via `tan θ = sin θ/cos θ` with `cos θ → 1`. `x² − a² = (x−a)(x+a)` factored, leftover `1/(x+a) → 1/(2a)`. Condition `a ≠ 0` present in the working line **and** in the box. Prose `0.2499994` at `x = 2.00001`: actual **0.249999375** ✓. |
| `lim_two_abs_x_over_x_plus_x_plus_1_right` | **Both sides computed separately.** Right: `3.001`, `3.0001`, `3.00001`, `3.000001` → **3**. Left (as a control on the card's two claims): `−1.001`, `−1.0001`, `−1.00001`, `−1.000001` → **−1**, confirming both the margin note ("the two-sided limit does not exist here — the left-hand value is −1") and the mistake bullet. Not indeterminate after the modulus is removed, and the card does not pretend it is. |
| `lim_x2_minus_8x_plus_15_over_x2_minus_9` | Two-sided: `−0.333555592599/−0.333111148142` … `−0.333333555556/−0.333333111111` → **−1/3**. Both factorisations expanded: `(x−3)(x−5) = x²−8x+15` ✓, `(x−3)(x+3) = x²−9` ✓. Counter-split `−4x−4x` correctly identified as giving product 16, not 15. `−2/6` correctly reduced. |
| `lim_x2_minus_sin_x_over_x2_minus_2` | `x = 10³,10⁵,10⁷,10⁹`: `1.00000117312`, `1.0000000002`, `1.0`, `1.0` → **1**. Dominant term `x²` on both lines. Sandwich correctly set up: `−1 ≤ sin x ≤ 1` divided by `x² > 0` preserves direction, `±1/x² → 0`. The card correctly refuses to assign `sin x` a limit at infinity. |
| `lim_x2_plus_5x_plus_2_over_2x2_minus_5x_plus_1` | `x = 10³,10⁵,10⁷,10⁹`: `0.503760148`, `0.500037501`, `0.500000375`, `0.50000000375` → **1/2**. Divided form `(1 + 5/x + 2/x²)/(2 − 5/x + 1/x²)` re-derived; ratio of leading coefficients, right way up. |
| `lim_x_minus_2_over_x3_minus_8` | Two-sided: `0.0833750138924/0.0832916805521` … `0.083333375/0.0833332916667` → **1/12 = 0.0833333333**. `a³ − b³ = (a−b)(a²+ab+b²)` sign checked (all-plus bracket, as the tip says); `x²+2x+4` at `x = 2` is `4+4+4 = 12`, not 10. Cancelling the whole numerator leaves 1, not 0 — the card says so. |
| `lim_x_minus_3_over_root_x2_minus_9` | **Approach tested from both sides and the left side is not real** — at `x = 3 − 10⁻³…10⁻⁶` the expression returns pure-imaginary `0 + 0.01291i`, `0 + 0.004083i`, `0 + 0.001291i`, `0 + 0.000408i`, confirming the card's own domain sentence in `s1` that the approach is necessarily from the right. Right side: `0.0129088688`, `0.00408244888`, `0.00129099337`, `0.000408248256` → **0**. `√(x²−9) = √(x−3)·√(x+3)` valid because both factors are positive for `x > 3`, as the card states; the surviving denominator `√6 ≠ 0` — the card explicitly notes that a `0/0` ending would prove nothing. Domain condition is in the student-visible lines, not only in `verification.note`. |
| `lim_x_sin_a_minus_a_sin_x` | a=2.5. Two-sided: `2.60058275904/2.60207893928` … `2.60133043488/2.60133193106` → **sin a − a cos a = 2.60133118297** (`0.5984721 + 2.5 × 0.8011436`). The add-and-subtract split re-derived: `x sin a − a sin x = sin a(x−a) − a(sin x − sin a)` ✓. `(sin x − sin a)/(x − a) → cos a` confirmed as the derivative of sin at a, and independently via `sin x − sin a = 2 cos((x+a)/2) sin((x−a)/2)`. Prose `2.60133` at `x = 2.500001`: actual **2.601331931** ✓. |

*(The row for `lim_one_over_x_minus_2_minus_four_over_x2_minus_4` above is a cross-reference only —
that card is banded MISLEADING at F3 and is **not** counted in the 36.)*

---

## 5. Soft observations — below the band threshold, logged so nobody re-finds them

None of these changed a band. Each is a wording or redundancy issue, not a mathematical one.

- **`lim_sin_a_plus_bx_minus_sin_a_minus_bx` `s2` memory_tip** — *"sin(bx)/x is never 1; it is b."*
  False at `b = 1`. Self-correcting in the same sentence (see §3.6).
- **`lim_8_abs_x_plus_3x_over_3_abs_x_minus_2x` `s2` mistake** — *"Dividing by x² instead of x and
  reporting 0."* Dividing **both** lines by x² gives `(11/x)/(1/x) = 11`, not 0; the stated
  consequence needs the numerator alone divided. Loose, harmless.
- **`lim_e_7x_minus_1_over_x` `s2` mistake** — *"Writing e⁷ as the answer by substituting x = 1."*
  Substituting `x = 1` gives `e⁷ − 1`, not `e⁷`.
- **`con_cos_ax_minus_cos_bx_at_zero` `s4` memory_tip** — *"The final line of every continuity proof
  is the same sentence: limit equals value."* Not true of a discontinuity proof, nor of the
  three-part junction form (`left = value = right`) that four other cards in this same corpus use.
- **`con_three_piece_discuss` `s1` memory_tip** — *"every point that is not a junction is safe if its
  own formula is defined there."* "Defined" is not "continuous" in general — the greatest-integer
  function, which this same unit teaches two cards later, is defined everywhere and continuous at no
  integer. True for every formula that actually appears in this card.
- **Duplicate mistake bullets.** `lim_sin_tan_squared` `s1 cm[0]` ("answering 1/(2a)²") and
  `s2 cm[0]` ("Answering 1/(4a²)") are the same wrong answer written two ways;
  `lim_1_minus_cos_2mx` `s2 cm[0]` and `cm[1]` both land on `2m/n`.
- **`lim_x_minus_3_over_root_x2_minus_9`** writes `lim(x → 3)` with no `⁺` throughout, following the
  question's own notation. Defensible — the limit is taken over the domain, and the restriction is
  spelled out in `s1` — but a teacher may prefer the explicit `⁺`.

---

## 6. Coverage statement — honest

**All 43 cards received a dedicated pass. None was swept.** Specifically, for every one of the 43:

- the answer was **re-derived from `question_text`** before the card's working was read;
- the limit was evaluated **numerically from both sides** (or from the one side the question or the
  domain permits) at `10⁻³, 10⁻⁴, 10⁻⁵, 10⁻⁶`, or at `x = 10³…10⁹` for the five limits at infinity,
  at 40-digit precision — **the numbers in §4 are the actual outputs of that run**, not restatements
  of the card;
- every `line`, `margin_note`, `why`, `common_mistakes` bullet and `memory_tip` was read as a claim.
  Two scripted sweeps backstopped the manual read: one grepping every absolute quantifier
  (`always / never / every / any / all / must / exactly / cannot / guaranteed`) across all
  `why`/`memory_tip`/`margin_note`/`common_mistakes` fields — 44 hits, each checked by hand — and one
  diffing `verification.note` conditions against the student-visible text;
- every numeric figure quoted in prose (14 of them, across 14 cards) was recomputed independently.
  **Thirteen reproduce. One does not** — F5.

**What this pass did NOT do**, stated so it is not read as covered:

- **No source fidelity check.** I verified each card against its own `question_text`. I did not open
  the Sri Chaitanya volume to confirm the `question_text` transcribes the printed question correctly
  — a transcription error would leave a card internally perfect and still wrong on the page. The one
  known source defect I was told to confirm (the `x → 2` / `x → 4` trap) is confirmed handled.
- **No mark-split verification against a board scheme.** Only the arithmetic (`sum == total`) was
  checked; every card in this corpus carries `verification.status: unverified` and
  `needs_teacher_verification: true`, and the split is this bank's own work by the notes' own
  admission. That gate stays open.
- **No rendering check.** Line wrap, figure geometry and the `chipTip` / `insider_note` surfaces were
  out of scope.
- **No Rule 41 register sweep** beyond what fell out of reading every string — I was checking
  mathematical truth, not plain-language compliance.

**Confidence.** High on the mathematics: the 0-WRONG result rests on independent numerical
convergence for all 43, plus symbolic confirmation wherever sympy could produce one, and I would
defend it. Lower on the prose: five findings surfaced from reading ~350 free-text fields by hand,
and a second reader would plausibly find one or two more of the same low-severity class, or disagree
with my F4 / F7 line between MISLEADING and THIN. The band boundary I applied and would defend is
stated in §3.5: a bullet or claim is a **defect** when it names as an error a move the card itself
prescribes, or when applying it as written produces a wrong answer on a neighbouring question; it is
a **soft observation** when the sentence carries its own corrective.
