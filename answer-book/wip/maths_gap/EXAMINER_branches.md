# Independent examiner — the branch-and-root cluster (Maths-1A, 31 cards)

**Corpus:** the 31 cards added in commit `c0942ca1` under `ts_ipe_m1a_te_*` (8), `ts_ipe_m1a_it_*` (9),
`ts_ipe_m1a_hf_*` (7), `ts_ipe_m1a_mi_*` (7). Pre-existing cards in these four chapters were not examined.

**Method.** Every card re-derived from its `question_text` alone. `verification.note` was not read as
evidence on any card. Machine work backing the derivations:

* **Root-completeness scans** — sign-change scan of the ORIGINAL (unsquared, uncleared) equation over the
  relevant period, 4–12 × 10⁵ sample points, each bracket bisected 80–100 times, then the recovered root set
  compared term-by-term with the card's stated family. Run for all 8 TE cards and for the 3 IT cards that
  solve for `x`.
* **Symbolic identity checks** (sympy) — every inductive step as `S(k) + t(k+1) − S(k+1) ≡ 0`, every
  quadratic factorisation, every `u+v / uv / 1−uv` line, both hyperbolic 4·RHS expansions, and the
  `(1−P²)(1−Q²)` expansion. All 24 returned IDENTITY.
* **Numeric identity checks at ≥18 significant digits** (mpmath, dps 30) at two independent argument values
  per identity.
* **Marks arithmetic** — step marks vs `mark_split` vs `marks_total` on all 31 (all consistent).

---

## 1. Tally by band

| Band | Count | Cards |
|---|---|---|
| WRONG | **0** | — |
| MISLEADING | **0** | — |
| THIN | **1** | `ts_ipe_m1a_te_sum_x_y_sin_sum` |
| CLEAN | **30** | listed in §3 |

No card in this cluster is mathematically wrong. No extraneous root is kept, no admissible root is dropped
(one boxed-answer narrowing noted below), no `common_mistakes` bullet names a correct move as an error, and
every card that uses the `Tan⁻¹u + Tan⁻¹v` addition formula states its `uv < 1` condition **in `lines`**, i.e.
where the student reads it — not only in `verification.note`.

---

## 2. Findings

| Card | Exact line | What it says | What it should say | Numeric evidence |
|---|---|---|---|---|
| `ts_ipe_m1a_te_sum_x_y_sin_sum` — **THIN** | `s4_solve_the_pair`, boxed line: `∴ x = π/2, y = π/6`, reached via `Taking n = 0 with the upper signs:` and margin `Only n = 0 gives values inside one turn` | The boxed answer is a single ordered pair. The question states **no interval**, so the card silently imposes "one turn" and one orientation. | Either box the family — `x = 2nπ + π/2, y = π/6 − 2nπ` (and the swap), `n ∈ Z` — or add one line saying the principal pair is quoted because the question expects values in `[0, 2π)`. | Scan of `sin x + sin(2π/3 − x) − 3/2 = 0` over `(−2π, 4π)`, 6×10⁵ points: roots at `x/π = −11/6, −3/2, 1/6, 1/2, 13/6, 5/2` — i.e. six admissible `(x, y)` pairs in that window alone, all with residual < 7e−16. The boxed answer names one of them. |

**Severity note (deliberate, so the finding is not over-read).** This is an omission, not an error. The
general family *is* on the page two lines above the box (`x = π/3 + 2nπ ± π/6`, `y = π/3 − 2nπ ∓ π/6`), and
the card explicitly says "The lower signs give the same pair swapped", so the student is not told anything
false. `x = π/2, y = π/6` is also the conventional Telangana/Chaitanya answer to this question. It is filed
THIN under "correct but omits a condition" because the restriction to one turn is the card's, not the
question's, and it is never named as a choice.

**Nit, recorded but not banded — `ts_ipe_m1a_hf_cosh_three`, `s1_method`.** Four consecutive lines use `x`
for two different things: `Given cosh x = 3` (x = the angle) then `We know Cosh⁻¹x = logₑ(x + √(x² − 1)), x ≥ 1`
(x = the argument, a bound variable) then `cosh(−x) = cosh x`. Nothing is mathematically false and every
standard textbook does the same, so this is not a band; a different dummy letter in the identity line would
remove the collision.

---

## 3. CLEAN list, with the checks actually run on each

### Trigonometric Equations (8)

1. **`te_tan_plus_sec_root3`** — `tanθ + secθ = √3, 0 ≤ θ ≤ 2π`.
   Candidates π/6 and 3π/2 both fed back into the **original**. π/6: `1/√3 + 2/√3 = √3` (residual −2.2e−16).
   3π/2: cosθ = 0, both ratios undefined → correctly discarded; confirmed genuinely extraneous by evaluating
   the **cleared** equation `√3cosθ − sinθ − 1` at 3π/2 = −3.3e−16, i.e. the cleared equation *does* accept it.
   Completeness: full scan of the original over `(0, 2π)`, 4×10⁵ points → exactly **one** root, `θ/π = 0.166666666667`.
   Both families `2nπ + π/6` and `2nπ − π/2` correctly enumerated; nothing dropped.

2. **`te_four_cos_sq_root3`** — `4cos²θ + √3 = 2(√3+1)cosθ`.
   Factorisation `(2c − √3)(2c − 1) ≡ 4c² − 2(√3+1)c + √3` verified symbolically (IDENTITY). Both roots
   `cosθ = √3/2, 1/2` lie in `[−1,1]`, both families kept: `θ = 2nπ ± π/6` **or** `2nπ ± π/3`. No clearing
   or squaring occurs, so no extraneous-root test is owed.

3. **`te_seven_sin_sq_three_cos_sq`** — reduces to `sin²θ = 1/4`, answer `θ = nπ ± π/6`.
   Scan of `7sin²θ + 3cos²θ − 4` on `[0, 2π]` → roots at `θ/π = 1/6, 5/6, 7/6, 11/6` (all four; residuals ≤ 1.8e−15).
   The card's `nπ ± α` family reproduces exactly those four and no others — the alternative `nπ + (−1)ⁿα`,
   which the card names as the mistake, would return only two of them. Correct.

4. **`te_two_cos_sq_11sin`** — `2sin²θ − 11sinθ + 5 = 0`, `(2s−1)(s−5)` verified IDENTITY; `sinθ = 5`
   rejected on range. Scan of the original on `[0, 2π]` → roots `θ/π = 1/6, 5/6` exactly, which is the
   card's `nπ + (−1)ⁿ(π/6)` restricted to that window. Nothing dropped.

5. **`te_tan_plus_3cot_5sec`** — cleared by `sinθcosθ`; `(2s−1)(s+3)` verified IDENTITY.
   Scan of the **original** `tanθ + 3cotθ − 5secθ` on `(0, 2π)`, 6×10⁵ points → roots `θ/π = 1/6, 5/6`,
   residuals ≤ 5.3e−15. **Both** survive the original (see §4.1), so the single family
   `θ = nπ + (−1)ⁿ(π/6)` is complete and the card's `sinθ ≠ 0, cosθ ≠ 0` check correctly rejects nothing.

6. **`te_sin_x10_cos_3x68`** — `x = 37°`.
   `cos(3x−68°) = sin(158° − 3x)` verified. Both parities solved: even → `x = 90m + 37`, odd → `x = −180m − 6`
   (both re-derived independently and both algebraically confirmed). Full degree scan of
   `sin(x+10°) − cos(3x−68°)` over `(−360°, 360°)`, 7.2×10⁵ points → root set
   `{−323, −233, −186, −143, −53, −6, 37, 127, 174, 217, 307, 354}` = exactly the union of the two families,
   and **37° is the only acute member of the whole set**. `sin47° = cos43° = 0.731353701619170` (agreement to
   15 places). The card is right that −6° is a true solution removed by "acute", not a wrong answer.

7. **`te_infinite_exponent_series`** — `x = ±π/3`.
   Convergence condition `|cos x| < 1` stated before the sum is used. Its claim "in `(−π, π)` that rules out
   `x = 0` alone" is exactly right: `cos x = ±1` only at `x = 0, ±π`, and `±π` are outside the **open**
   interval. `S = 1/(1 − cos(±π/3)) = 2.000000000000` and `8² = 64.000000000000 = 4³`. Scan of
   `cos x − 1/2` on `(−π, π)` → exactly `x/π = ±1/3`. Complete.

8. *(the eighth TE card in this cluster is `te_sum_x_y_sin_sum`, banded THIN in §2)*

### Inverse Trigonometric Functions (9)

9. **`it_arcsin_5x_12x_sum`** — the card the brief singles out. Both tests are applied and both are needed.
   Domain: `|x| ≥ 12` (correctly the binding one, not `|x| ≥ 5`). Sign: `x = −13` passes the domain and still
   fails, because `5/x = −5/13 < 0` while `√(1 − 144/x²) ≥ 0`. Verified:
   `asin(−5/13) + asin(−12/13) = −1.570796326794897 = −π/2` (18 digits), and
   `asin(5/13) + asin(12/13) = +1.570796326794897 = +π/2`. Scan over `[12, 100] ∪ [−100, −12]` → the unique
   root is `x = 13.0000000000`. Both admissibility tests present, correct, and on the page.

10. **`it_solve_x_tan_ratio_pi4`** — `x = ±1/√2`, **both** kept and both genuine.
    `u+v = (2x²−4)/(x²−4)`, `uv = (x²−1)/(x²−4)`, `1−uv = −3/(x²−4)` all verified IDENTITY. Scan of
    `atan((x−1)/(x−2)) + atan((x+1)/(x+2)) − π/4` over `[−60, 60]`, 1.2×10⁶ points → exactly two roots,
    `±0.707106781187`. At both, `u,v > 0` and `uv = 0.142857142857 = 1/7 < 1`, and the sum evaluates to
    `0.785398163397448 = π/4` to 15 places. The `uv < 1` condition appears in `lines`, `why` **and**
    `memory_tip` — student-visible, not parked in the note. `x = ±2` excluded in step 1 and neither root is 2.

11. **`it_solve_x_triple_arc_identity`** — `x = 1/√3`.
    All three range conditions correct as stated (`|x| ≤ 1`, `x ≥ 0`, `|x| < 1`; intersection `0 ≤ x < 1`).
    Coefficients `6 − 8 + 4 = 2` verified. At `x = 1/√3` the three terms are `3(π/3) − 4(π/3) + 2(π/3) = π/3`
    (residual 0.000000000). **The card's completeness claim was independently tested**: scan of
    `f(x) = 3asin(2x/(1+x²)) − 4acos((1−x²)/(1+x²)) + 2atan(2x/(1−x²)) − π/3` over `[−20, 0.99999] ∪ [1.00001, 20]`
    → a single root at `0.577350269190`; sample values `f(−2) = −10.83`, `f(−1.5) = −10.09`, `f(−0.5) = −9.39`,
    `f(1.5) = −7.73`, `f(3) = −10.40`, `f(10) = −12.62` — the claim "outside `0 ≤ x < 1` the left side is
    negative" holds. `−1/√3` correctly named as a non-solution (`f = −3π − π/3` there).

12. **`it_cos_two_tan_quarter_ninth`** — `3/5`. `xy = 1/18 < 1` checked **in `lines`**.
    `atan(1/4) + atan(2/9) = 0.463647609000806116 = atan(1/2)` (18 digits, diff 0.0);
    `cos(2·that) = 0.6` exactly. Sum lies in `(−π/2, π/2)`, so `Tan⁻¹(1/2)` is the correct principal value.

13. **`it_cot_sin_root_13_17`** — both sides `2/√13`.
    `cot(asin(√(13/17))) = 0.554700196225229122` and `sin(atan(2/3)) = 0.554700196225229122`
    (diff −9.9e−32); both equal `2/√13`. First-quadrant sign justified on the page.

14. **`it_sin_three_fifth_eight_seventeenth`** — `asin(3/5) + asin(8/17) = 1.1334584350470127 = acos(36/85)`
    (diff 0.0). Triples 3-4-5 and 8-15-17 correct; the `why`'s side-claim that `sin(A+B)` would give `77/85`
    checked and true. Range line `A + B ∈ (0, π) ⊂ [0, π]` present, which is what licenses the `Cos⁻¹`.

15. **`it_two_sin_minus_cos_325`** — `2asin(3/5) − acos(5/13) = 0.110997010491433671 = acos(323/325)`
    (diff −3.2e−31). `cos2A = 0.28 = 7/25`, `sin2A = 0.96 = 24/25` both exact. The `2A > B` argument is
    genuinely needed and genuinely correct: `2A = 1.28700221758656877 > B = 1.1760052070951351`, and the
    card proves it the right way (`cos2A = 7/25 < 5/13 = cosB`, cosine decreasing on `(0, π)`). The
    side-claim "that sign is what produces 323 and not 253" checks out (`35 − 288 = −253`).

16. **`it_tan_cos_plus_tan_value`** — `17/6`. `tan(acos(4/5) + atan(2/3)) = 2.83333333333333333` (diff 0.0).
    `tanα tanβ = 1/2 ≠ 1` checked on the page before the formula is used; `α + β = 1.2315 < π/2`, so the
    tangent exists.

17. **`it_cos_inverse_p_a_q_b_identity`** — the algebra is an identity, verified two ways.
    `(1−P²)(1−Q²) ≡ 1 − P² − Q² + P²Q²` and `(PQ − cosα)² ≡ P²Q² − 2PQcosα + cos²α` both IDENTITY.
    Numeric at two independent argument pairs: `(p/a, q/b) = (0.6, 0.3)` → LHS `0.659934490008080347` vs
    `sin²α = 0.659934490008080347`; `(−0.25, 0.8)` → `0.390120999227554987` both sides. Domain lines
    `|p/a| ≤ 1`, `|q/b| ≤ 1`, `a,b ≠ 0` present, and `A, B ∈ [0, π] ⇒ sinA, sinB ≥ 0` is exactly the fact the
    later positive square roots need.

### Hyperbolic Functions (7)

18. **`hf_sinh_inverse_log_form`** — rejection of the second root is genuine and correctly reasoned:
    `√(x²+1) > x` for **every** real `x` (not just positive `x`), so `x − √(x²+1) < 0 < eʸ`.
    `asinh(0.7) = 0.652666566082355787 = log(0.7 + √1.49)` and
    `asinh(−1.3) = −1.07845105895489698 = log(−1.3 + √2.69)` — both diff 0.0, and the second value confirms
    the formula holds on the negative side where the minus root would be the tempting one.

19. **`hf_tanh_inverse_log_form`** — `1 + x = 2e²ʸ/(e²ʸ+1)` and `1 − x = 2/(e²ʸ+1)` both IDENTITY; ratio `e²ʸ`.
    The domain restriction `x ∈ (−1, 1)` is **on the page** (in `lines`, `why` and `margin_note`), with the
    correct reason (outside it one of `1±x` is ≤ 0 and the log has no value).
    `atanh(0.4) = 0.423648930193601807` and `atanh(−0.85) = −1.25615281198805738`, both matching
    `½log((1+x)/(1−x))`.

20. **`hf_cosh_three`** — `cosh x = 3` has **two** solutions and the card says so, at step 1
    ("cosh is even ⇒ `x = ±Cosh⁻¹3`") and again in the unmarked step 3.
    `cosh(±log(3+√8)) = 3.0` (both signs, diff 3.9e−31); `log(3−√8) = −1.76274717403908605 = −log(3+√8)`
    (diff −5.9e−31); `3 − √8 = 0.1715728753 > 0`, so the card's claim that it is positive and its log defined
    is correct. `√(3²−1) = √8` is the `Cosh⁻¹` form, not the `Sinh⁻¹` form — correct. (Symbol-collision nit
    in §2.)

21. **`hf_cosh4_minus_sinh4`** — `cosh²x + sinh²x ≡ cosh 2x` IDENTITY. Numeric at two values:
    `x = 0.7` → `2.15089846539314053` both sides; `x = −1.3` → `6.76900580660801214` both sides.
    The `common_mistakes` bullet "writing `cosh²x + sinh²x = 1`" correctly names the sign confusion with
    `cosh² − sinh² = 1`.

22. **`hf_cosh_sum_formula`** — the printed expansion
    `(eˣ⁺ʸ + eˣ⁻ʸ + eʸ⁻ˣ + e⁻⁽ˣ⁺ʸ⁾) + (eˣ⁺ʸ − eˣ⁻ʸ − eʸ⁻ˣ + e⁻⁽ˣ⁺ʸ⁾) = 2eˣ⁺ʸ + 2e⁻⁽ˣ⁺ʸ⁾` verified IDENTITY
    term by term; the `/4 → /2` step is right. Numeric at `(0.7, 1.1)` → `3.10747317631726631` and at
    `(−0.4, 2.3)` → `3.41773153075095223`, both sides equal.

23. **`hf_sinh_sum_formula`** — same treatment; `4·RHS ≡ 2eˣ⁺ʸ − 2e⁻⁽ˣ⁺ʸ⁾` IDENTITY, every printed sign on
    the mixed terms correct. Numeric `2.94217428809567977` and `3.26816291152831718` at the two argument pairs.

24. **`hf_tanh_diff_formula`** — `tanh(x−y) = (tanh x − tanh y)/(1 − tanh x tanh y)` verified at `(0.7, 1.1)`
    → `−0.379948962255224885` and `(−0.4, 2.3)` → `−0.99100745367811764`, both sides equal.
    The division by `cosh x cosh y` is justified on the page (`cosh ≥ 1`). No condition is owed on the
    resulting denominator: `|tanh| < 1` always, so `1 − tanh x tanh y > 0` can never vanish — the card is
    right not to add a caveat there. The `common_mistakes` bullet contrasting the trig `tan(x−y)` (which has
    `1 + tan x tan y`) with the hyperbolic minus is correct.

### Mathematical Induction (7)

For every MI card: base case computed by hand at `n = 1`, the identity re-checked numerically at `n = 2…8`
with exact rationals/integers (no floating point), and the inductive step verified as a **symbolic** identity
`S(k) + t(k+1) − S(k+1) ≡ 0`.

25. **`mi_sum_squares_n_np1_2np1`** — `n = 1: 1 = 1`; `n = 2: 5 = 5`; `n = 3: 14 = 14`; OK to `n = 8`.
    Step: `k(k+1)(2k+1)/6 + (k+1)² ≡ (k+1)(k+2)(2k+3)/6` IDENTITY, and the card's intermediate
    `(k+1)(2k²+7k+6)/6` is IDENTITY to the same thing. `2n+1 → 2k+3` handled correctly.

26. **`mi_sum_cubes_n_sq_np1_sq`** — `n = 1: 1`; `n = 2: 9`; `n = 3: 36`; OK to `n = 8`.
    Step `k²(k+1)²/4 + (k+1)³ ≡ (k+1)²(k+2)²/4` IDENTITY.

27. **`mi_sum_4cube_8cube_series`** — three printed terms only, so the general term was checked against them:
    `(4n)³` gives 64, 512, 1728 = `4³, 8³, 12³` ✓ (the card's warning about `4n³` vs `(4n)³` is the real trap).
    Claimed sum verified `n = 1: 64 = 64`; `n = 2: 576 = 576`; `n = 3: 2304 = 2304`; OK to `n = 8`.
    Step `16k²(k+1)² + 64(k+1)³ ≡ 16(k+1)²(k+2)²` IDENTITY.

28. **`mi_sum_n_2n_series`** — three printed terms only. Stated general term `(n+1)·2ⁿ⁻¹` reproduces
    `2·2⁰ = 2`, `3·2¹ = 6`, `4·2² = 16` ✓. Claimed sum `n·2ⁿ`: `n = 1: 2 = 2`; `n = 2: 8 = 8`;
    `n = 3: 24 = 24`; OK to `n = 8`. Step `k·2ᵏ + (k+2)·2ᵏ ≡ (k+1)·2ᵏ⁺¹` IDENTITY. The `(k+1)`-th term is
    correctly `(k+2)·2ᵏ`, which is where this question usually breaks.

29. **`mi_ap_sum_induction`** — checked with **non-trivial symbolic-free constants** `a = 3/2, d = −5/7`
    (exact fractions): `n = 1: 3/2`; `n = 2: 16/7`; `n = 3: 33/14`; OK to `n = 8`.
    Step `(k/2)(2a+(k−1)d) + (a+kd) ≡ ((k+1)/2)(2a+kd)` IDENTITY, and the card's own intermediate
    `[2a(k+1) + dk(k+1)]/2` is IDENTITY to the target. The "`a` and `d` are fixed, induction runs on `n`
    only" line is the right thing to insist on.

30. **`mi_divisible_4n_3n_minus_1`** — `(4ⁿ − 3n − 1) mod 9 = 0` for `n = 1…10`. Base case value at `n = 1`
    is `0`, and the card is right that `0 = 9(0)` is divisible (the bullet warning against starting at
    `n = 2` is correct advice). Step `4(9q + 3k + 1) − 3k − 4 ≡ 9(4q + k)` IDENTITY.

31. **`mi_divisible_xn_minus_yn`** — `(xⁿ − yⁿ) mod (x−y) = 0` for `n = 1…8` at `(x,y) = (7,3)` and, as a
    second independent pair with `x < y` (so `x − y < 0`), `(2,9)`. Both all-zero.
    The add-and-subtract move `x·xᵏ − x·yᵏ + x·yᵏ − y·yᵏ ≡ xᵏ⁺¹ − yᵏ⁺¹` IDENTITY, and
    `x(x−y)q + yᵏ(x−y) ≡ (x−y)(xq + yᵏ)` IDENTITY. `x ≠ y ⇒ x − y ≠ 0` stated with its reason.

---

## 4. Where I disagreed with a card and the card was right

This cluster is exactly where a hasty examiner files a false positive. Five times I formed a defect
hypothesis and the card survived it. Recording all five, because the reasoning that killed each one is the
reasoning a reviewer needs.

**4.1 `te_tan_plus_3cot_5sec` — I expected a rejected branch and there is none.**
I read `sinθ = 1/2 ⇒ θ = nπ + (−1)ⁿ(π/6)` and objected that the family contains `θ = 5π/6`, where
`cosθ = −√3/2 < 0`, while the working passed through `sin²θ + 3cos²θ = 5sinθ` — an equation **even in
cosθ**, which is precisely how a sign-losing step announces itself. On the neighbouring card
(`te_tan_plus_sec_root3`) an analogous clearing step *does* manufacture a false root, so I expected the same
here and expected the card to owe a rejection of `5π/6`.
It does not. `tanθ`, `cotθ` and `secθ` **all** change sign together when `cosθ` changes sign, so the whole
equation is multiplied by `−1` on both sides and is preserved. Direct check of the ORIGINAL at `5π/6`:
`tan + 3cot − 5sec = 5.3e−15`. The scan of the original over `(0, 2π)` returns `π/6` **and** `5π/6` and
nothing else. The card's single family is complete and its "check the root against `θ ≠ nπ/2`" step
correctly rejects nothing. Filing a "missing rejection" here would have been a false positive.

**4.2 `it_solve_x_tan_ratio_pi4` — I expected one of `±1/√2` to be extraneous.**
Taking the tangent of both sides is a classic root-admitting move (angles differing by `π` collapse), and
the card keeps *both* roots, which reads like the "reported both because the algebra gave both" failure.
It is not. At **both** roots `u, v > 0` and `uv = 1/7 < 1`, so `Tan⁻¹u + Tan⁻¹v ∈ (0, π/2)` and the addition
formula applies with no `π`; the sum evaluates to `0.785398163397448 = π/4` at both. Replacing `x` by `−x`
swaps `u` and `v`, which is why the left side is unchanged — the card states exactly that in its
`margin_note`. Reporting only `x = 1/√2` would have been the error, and the card's `common_mistakes`
bullet says so.

**4.3 `hf_cosh_three` — I first read the boxed single value as a dropped root.**
`cosh x = k` has two solutions and the box shows one. But step 1 states `cosh` is even and `x = ±Cosh⁻¹3`
before any substitution, and an unmarked step 3 shows `logₑ(3 − √8) = −logₑ(3 + √8)` via
`(3+√8)(3−√8) = 1`, closing the "is that a third answer?" question. The question itself says *"show that
x = logₑ(3 + √8)"*, so boxing the positive value is answering what was asked, not suppressing a root.
Confirmed `cosh(−log(3+√8)) = 3.0` as well.

**4.4 `it_solve_x_triple_arc_identity` — I doubted the completeness sentence.**
"For `x < 0` or `|x| > 1` the left side is negative, so it cannot equal `π/3`" is the kind of sweeping claim
that is usually asserted rather than true. I scanned `[−20, 20]`: single root, and the function is
comfortably negative everywhere outside `[0, 1)` (`−7.7` to `−12.6` at the sampled points). It also survives
a sign argument: for `x < 0` all three terms are `≤ 0`; for `x > 1` the `−4Cos⁻¹` term alone is below `−2π`
while `3Sin⁻¹ ≤ 3π/2` and the `Tan⁻¹` term is negative. The sentence is true as written.

**4.5 `te_infinite_exponent_series` — I thought `x = ±π` was an unhandled exclusion.**
`|cos x| < 1` fails at `x = 0` **and** at `x = ±π`, and the card says the interval "rules out `x = 0` alone",
which looked like a missed case. It is not: the interval is the **open** `(−π, π)`, so `±π` are already not
candidates. The card's wording is precise, and adding the exclusion would have been wrong, not safer.

---

## 5. Coverage statement — honest

**All 31 cards received a dedicated pass. None was swept.** For each card I read every `lines` entry, every
`why`, `memory_tip`, `margin_note` and `common_mistakes` bullet, plus every `recall.must_convey`, and
re-derived the mathematics from `question_text` before comparing. No card's `verification.note` was used as
evidence for anything (they were read only to confirm none of them was the *only* place a needed condition
appeared — none was).

Depth was not uniform, by design:

* **Deepest (root-completeness scan of the original equation + hand derivation + symbolic check):** the 8 TE
  cards and `it_arcsin_5x_12x_sum`, `it_solve_x_tan_ratio_pi4`, `it_solve_x_triple_arc_identity` — the 11
  cards where a root can be spuriously admitted or silently dropped.
* **Full (hand derivation + ≥18-digit numeric identity at two argument values + symbolic check of each
  printed algebraic line):** the remaining 6 IT cards, all 7 HF cards.
* **Full (hand derivation + exact-arithmetic check at `n = 1…8` + symbolic inductive-step identity):** all
  7 MI cards. Every one was checked at `n = 2` specifically, per the brief.

**What I did NOT examine**, so nobody reads this report as wider than it is:

* Rendering — line wrap/overflow, figure geometry, page-fit. Not looked at.
* Rule 41 plain-language register beyond the mathematical wording; provenance/originality against the source
  book; whether the mark **split shape** matches the real TSBIE scheme (only the arithmetic — steps vs
  `mark_split` vs `marks_total` — was checked, and all 31 are consistent).
* `recall.accept` / `recall.reject` / `heard_as` phrase banks (only `must_convey` was read).
* `expected_time_min`, `appearances`, unit numbering, and the pre-existing cards in these four chapters.

**Which bytes I examined.** I read the **working-tree** copies, not `git show HEAD:`. One corpus card,
`ts_ipe_m1a_mi_sum_n_2n_series.json`, is uncommitted-modified in the worktree by other work in progress; the
diff against HEAD is a single Rule-41 reword in `s1_statement.why` ("which hides the fact that it is 2·2⁰" →
"which does not show that it is 2·2⁰") with no mathematical content, so the verdict is unaffected and applies
to both versions. The other 30 are byte-identical to `HEAD` (`c0942ca1`).
