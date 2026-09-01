# Independent examiner's report — the 47 Functions cards authored 2026-08-31

**Corpus:** the 47 new `ts_ipe_m1a_fn_*` files in commit `c0942ca1`
(`git show HEAD --name-only --pretty=format: | grep m1a_fn`). Pre-existing `m1a_fn`
cards (gof_bijective, f_finverse_identity, identity_composition, gof_inverse_reverse,
sqp_bijection_inverse, sqp_seven_operations, and 20 others) were **not** examined.

**Method:** every card was re-derived from its own `question_text` before its answer was
read. No card's `verification.note` was accepted as evidence of anything mathematical.
Verdicts below name the actual numbers I put through each card.

---

## 1. Tally by band

| Band | Count | Cards |
|---|---|---|
| **WRONG** | **0** | — |
| **MISLEADING** | **0** | — |
| **THIN** | **1** | `ts_ipe_m1a_fn_gof_at_x_minus_1` |
| **CLEAN** | **46** | listed in §3 |

Zero mathematically wrong lines in 47 cards. Given that the comparable Maths-2B run put
7 wrong cards past their own authors' "re-derived and correct" claims, I went back over
the four highest-risk classes a second time (compositions at a named point, the
`√(|x|−x)` pair, the removable-discontinuity range, and the involution inverses) rather
than accept a clean first pass — see §4.

---

## 2. Findings

### 2.1 THIN

| Card | Exact location | What it says | What it should say | Numeric evidence |
|---|---|---|---|---|
| `ts_ipe_m1a_fn_gof_at_x_minus_1` | step `s1_inner`, `common_mistakes[1]` (file line 86) | "Writing 3(x − 1) − 2 as **3x − 1** by multiplying only the x by 3." | "Writing 3(x − 1) − 2 as **3x − 1 − 2 = 3x − 3** by multiplying only the x by 3." | The named move is *distribute 3 over x only*. Applied to `3(x − 1) − 2` it produces `3x − 1 − 2 = 3x − 3`, not `3x − 1`. The bullet's stated result silently loses the `− 2`, so the equation it prints does not follow from the error it names. This is a bullet defect only — the card's own mathematics is correct: f(x − 1) = 3(x − 1) − 2 = 3x − 5, g(3x − 5) = (3x − 5)² + 1 = 9x² − 30x + 26; checked at x = 2 (f(1) = 1, g(1) = 2; formula 36 − 60 + 26 = 2 ✓) and x = 0 (f(−1) = −5, g(−5) = 26; formula 26 ✓). |

The card's own sibling gets this right and shows the house style:
`ts_ipe_m1a_fn_gof_at_2x_minus_3` writes "Writing **6x − 3 − 1** by multiplying 3 into 2x
only" — trailing constant kept. Five other cards in the batch (`fof_at_x2_plus_1`,
`product_fg`, `combo_3f_minus_2g`, `gof_at_a_plus1_over_4`, `inverse_2x_plus1_over3`) also
carry the constant through correctly. So this is a one-off slip against the batch's own
convention, fixable in one edit.

### 2.2 Sub-threshold — reported, but **not** band findings

I looked hard at these and concluded none of them teaches anything false. Listing them so
the call is visible rather than silent.

| Card | Location | Observation | Why it is not a band finding |
|---|---|---|---|
| `fog_quadratic_linear` | `s2_expand` CM[0] | "Multiplying only the first term by 2, giving 18x² − 12x + 4" — the final `+ 3` is not carried. | The marked line above it is `2(9x² − 12x + 4) + 3`, and `18x² − 12x + 4` is exactly what the *bracket multiplication* yields under that error. It reads as the intermediate, not the final answer, so it closes under its own words. (Unlike the THIN above, which closes under no reading.) |
| `domain_sqrt_abs_x_minus_x` | `s1_condition` CM[0] | "Treating \|x\| − x as 0 for all x and concluding the function does not exist." | The premise is a real student error, and "√0 is not a thing, so f doesn't exist" is a real follow-on belief. The chain is compressed but names a genuine misconception; it does not endorse a correct move as wrong. |
| `classify_2_power_x` | `s1_one_one` CM[1] | "Cancelling the 2 instead of the base power and concluding a = b directly." | The named move is invalid (2 is not a factor here) even though it lands on the true conclusion `a = b`. In a proof question the mark is for the method, so flagging an unjustified route is legitimate. |
| `fofof_reciprocal_linear`, `fofofof_reciprocal_linear` | boxed finals, `x ≠ ±1` | Read *literally*, a domain of R − {1, −1} would also drop x = 0 from the composite, since f(0) = −1 is then not a legal input to the second f. | f(x) = 1 has no solution, so f genuinely needs only x ≠ 1, and the cards say so on the page ("f itself needs x ≠ 1, and the question also rules out x = −1"). Under the correct domain every stated answer holds at x = 0 too: f(0) = −1, f(−1) = 0, f(0) = −1, so (fofof)(0) = −1 = (0+1)/(0−1) ✓ and (fofofof)(0) = 0 = x ✓. The `±1` is the source book's printed tag, correctly identified as redundant. |
| `domain_one_over_6x_minus_x2_minus_5` | `s2_domain`, line 3 | `= (−∞, 1) ∪ (1, 5) ∪ (5, ∞)` opens with a bare `=` and no left-hand side. | Typographic only; the preceding line supplies the antecedent ("x may be any real number except 1 and 5"). |

### 2.3 Mechanical passes — all clean

| Pass | Result |
|---|---|
| Step marks sum to `marks_total`; `mark_split` sums to `marks_total` | 47/47 pass, no exceptions |
| **Rule-10 grep** — a condition (`x ≠ …`, a branch restriction, a base assumption) stated *only* in `verification.note` and absent from `lines`/`why`/`common_mistakes`/`memory_tip`/`margin_note` | **0 cards.** Four regex hits were all false positives: `classify_log_x` ("base a > 0 with a ≠ 1" is a meta-remark; the page pins base e on a visible line), `fofof`/`fofofof` (the visible WHY carries "f itself needs x ≠ 1"), `prove_even_exponential_form` (`x ≠ 0` is on the first visible line). Every real condition in this batch is student-visible: the `x ≠ ±1` tags, `θ ≠ (2n+1)π/2`, base e, the piecewise gaps, x² ≠ 0, `(0, ∞)` on `gof_reciprocal_sqrt`, `[1/2, ∞)` on `sqrtf_over_g`, and "−1 is not in A" on `range_rational_on_1to4`. |
| `recall.must_convey` on all 121 marked steps re-checked against the derived mathematics | No contradictions with the lines; no independent claims that fail. |
| `expected_time_min` | Uniform: VSAQ/2m → 4, SAQ/4m → 8. No drift. |
| Authored line length | max 51 chars, 2.1% of 572 lines over 44 chars — **tighter** than the 26 pre-existing `m1a_fn` cards (max 72, 9.0%). No wrap concern. (I did not run `measure_wrap.mjs`: it writes artifacts, and I am write-restricted to this file.) |

---

## 3. CLEAN — 46 cards, with the checks named

### Domains (10) — each tested one value inside and one just outside every boundary

| Card | Checks run |
|---|---|
| `domain_one_over_6x_minus_x2_minus_5` | 6x − x² − 5 = 0 ⇒ x = 1, 5. Inside: x = 0 → −5 ✓ defined; x = 3 → 4 ✓. Boundary: x = 1 → 0 ✗; x = 5 → 0 ✗. Domain R − {1, 5} correct. |
| `domain_one_over_log_2_minus_x` | Two conditions intersected, not unioned. x = 0 → log 2 = 0.301 ✓; x = 1.5 → log 0.5 = −0.301 ✓. Boundaries: x = 1 → log 1 = 0, denominator zero ✗; x = 2 → log 0 ✗; x = 3 → log(−1) ✗. `(−∞,1) ∪ (1,2)` correct — the `u ≠ 1` rule for `1/log u` is present. |
| `domain_one_over_sqrt_abs_x_minus_x` | Strict `> 0` because the root is in a denominator. x = −1 → \|x\|−x = 2, 1/√2 ✓. x = 0 → 0, 1/0 ✗. x = 1 → 0 ✗. Domain (−∞, 0) correct. |
| `domain_sqrt_abs_x_minus_x` | The sibling with `≥ 0`. x = −2 → 4, √4 = 2 ✓; x = 0 → √0 = 0 ✓; x = 5 → √0 = 0 ✓. Domain R correct — the pair the brief warned about is on the right side of the trap in **both** cards. |
| `domain_range_log_abs_4_minus_x2` | Domain: modulus fixes the sign so only the zeros go. x = 0 → log 4 ✓; x = 3 → log 5 ✓; x = 1.9 → log 0.39 ✓; x = ±2 → log 0 ✗. Range derived constructively in two pieces: \|x\|<2 gives t ∈ (0,4], \|x\|>2 gives t ∈ (0,∞); I checked t is onto (0,∞) both ways (t > 4 ⇒ x = √(4+t); 0 < t < 4 ⇒ x = √(4−t)), so range R has **no hole**. |
| `domain_range_x2_minus4_over_x_minus2` | The removable-discontinuity case. Domain R − {2}: x = 0 → −4/−2 = 2 = 0+2 ✓; x = 3 → 5/1 = 5 = 3+2 ✓; x = 2 ✗. Range R − {4} — the hole **is** removed, and the card correctly identifies 4 (the missing *output*) rather than 2 (the missing *input*). |
| `domain_sqrt3plusx_sqrt3minusx_over_x` | Three conditions intersected. x = −3 → √0 + √6, /(−3) ✓; x = 3 → √6 + √0, /3 ✓; x = 0 ✗; x = 4 → √(−1) ✗. `[−3,0) ∪ (0,3]` correct, brackets right at all three boundaries. |
| `domain_sqrt_greatest_integer_minus_x` | [x] ≤ x forces [x] − x = 0. x = 2 → √0 ✓; x = −2 → √0 ✓; x = 2.5 → 2 − 2.5 = −0.5 ✗; x = −1.3 → [−1.3] = −2, −0.7 ✗. Domain Z correct, negatives included; the memory tip's `[2.7] = 2`, `[−1.3] = −2` are the correct floor values. |
| `domain_sqrt_log10_3minusx_over_x` | Stacked conditions: the root forces (3−x)/x ≥ 1, which is strictly stronger than the log's `> 0`. x = 1 → 2, log 0.301 ✓; x = 0.1 → 29 ✓; **x = 3/2 → exactly 1, log 0, √0 = 0 ✓ defined** (closed bracket correct); x = 1.6 → 0.875, log −0.058 ✗; x = 0 ✗; x = −1 → −4, log ✗. `(0, 3/2]` correct, including the x < 0 case ruled out separately without multiplying by x. |
| `domain_sqrt_x2m1_plus_reciprocal_sqrt` | Two terms, `≥ 0` vs `> 0`, **intersected**. x = −1 → 0 under the first root ✓, 6 under the second ✓ defined; x = −2 ✓; x = 3 → 8, 2 ✓; x = 0 → −1 ✗; x = 1 → second denominator 0 ✗; x = 1.5 → −0.25 ✗; x = 2 → 0 ✗. `(−∞,−1] ∪ (2,∞)` correct; the "other two overlaps are empty" line checked and true. |

### Compositions (12) — every one evaluated two-step by hand at **two** concrete values

| Card | Checks run |
|---|---|
| `gof_at_a_plus1_over_4` | **The exact trap the brief names.** a = 3: correct gof = a²+2 = 11; wrong order fog = 4x²+7 at x = 1 = **also 11**. a = −5: gof = 27, fog = 11. Card answers a² + 2 — the right side. CM "applying g first computes fog" verified. |
| `fof_at_x2_plus_1` | (fof)(t) = 9t − 4. x = 0 → input 1: f(1)=2, f(2)=5; formula 5 ✓. x = 2 → input 5: f(5)=14, f(14)=41; formula 41 ✓. |
| `fog_quadratic_linear` | x = 1: g(1)=1, f(1)=5; 18−24+11 = 5 ✓. x = 2: g(2)=4, f(4)=35; 72−48+11 = 35 ✓. CM's claimed gof = 6x²+7 independently derived and correct. |
| `gof_4x_minus1_squared` | x = 1: f(1)=3, g(3)=11; 16−8+3 = 11 ✓. x = −1: f(−1)=−5, g(−5)=27; 16+8+3 = 27 ✓. CM's claimed fog = 4x²+7 independently derived and correct. |
| `gof_at_2x_minus_3` | x = 1: f(−1)=−4, g(−4)=17; 36−120+101 = 17 ✓. x = 2: f(1)=2, g(2)=5; 144−240+101 = 5 ✓. |
| `gof_reciprocal_sqrt` | x = 4: 1/4 → √0.25 = 0.5 = 1/√4 ✓. x = 1/9: 9 → 3 = 1/√(1/9) ✓. Domain (0,∞) carried onto the boxed line. |
| `fofof_reciprocal_linear` | (fof)(x) = x re-derived from scratch: (2x/(x−1))·((x−1)/2) = x ✓. x = 2: f(2)=3, f(3)=2, f(2)=3, so (fofof)(2) = 3 = (2+1)/(2−1) ✓ — the card's own check line is correct. |
| `fofofof_reciprocal_linear` | x = 5: f(5)=3/2, f(3/2)=5, f(5)=3/2, f(3/2)=5 = x ✓. Card's check line correct. Parity rule "even ⇒ x, odd ⇒ f(x)" verified. |
| `triple_composition_constant` | Inside-out: x = 1 → h=2, g=4, f=2 ✓; x = 3 → h=6, g=36, f=2 ✓. (goh)(x) = 4x² correct; the constant f correctly discards it. CM's `(hog)(x) = 2x²` independently derived and correct. |
| `solve_fog_eq_gof` | fog = 2^(2x), gof = 2^(x²); injectivity of 2^u gives 2x = x², so **exactly** {0, 2}. x = 0: 1 = 1 ✓. x = 2: 16 = 16 ✓. Factorising rather than dividing preserves x = 0 — correct, and the CM about x(x+2) is a real error. |
| `gofinverse_at_2` | f⁻¹(2) = 4/3 verified forward: f(4/3) = 4 − 2 = 2 ✓. g(4/3) = 16/9 + 9/9 = 25/9 ✓. |
| `composition_associative` | Domain chain checked link by link: gof: A→C, ho(gof): A→D, hog: **B→D**, (hog)of: A→D ✓. Element chase transforms **both** sides to h(c) — not a single substitution. Instantiated with f(x)=x+1, g(x)=2x, h(x)=x²: a = 1 → 16 both sides ✓; a = 3 → 64 both sides ✓. |

### Inverses and finite sets (3)

| Card | Checks run |
|---|---|
| `inverse_2x_plus1_over3` | f⁻¹(x) = (3x−1)/2 verified both directions: f(3) = 7/3, f⁻¹(7/3) = 3 ✓; f(0) = 1/3, f⁻¹(1/3) = 0 ✓. The card's own f(f⁻¹(x)) = x algebra re-checked line by line. Both CM bullets ((3y−3)/2 and 3(x−1)/2) reproduce under the errors they name. |
| `verify_finverse_ginverse_3elt` | Pair by pair. gof: 1→a→q, 2→c→p, 3→b→r ✓. (gof)⁻¹ = {(q,1),(p,2),(r,3)} ✓. f⁻¹ = {(a,1),(c,2),(b,3)} ✓, g⁻¹ = {(q,a),(r,b),(p,c)} ✓. f⁻¹og⁻¹: p→c→2, q→a→1, r→b→3 ✓ — same three pairs. Domain claims (g⁻¹ has domain C, f⁻¹ has domain B) checked and correct. |
| `verify_gof_inverse_via_ginverse_4elt` | g recovered from g⁻¹ pair by pair: g = {(a,2),(b,4),(c,1),(d,3)} ✓. gof: 1→a→2, 2→c→1, 3→b→4, 4→d→3 ✓. f⁻¹og⁻¹: 1→c→2, 2→a→1, 3→d→4, 4→b→3 ✓ — matches (gof)⁻¹. See §4 for why the "(gof)⁻¹ = gof" line is right and not a copy-paste slip. |

### Injective / surjective / bijective (4) — each verdict checked against **the stem's own** codomain

| Card | Checks run |
|---|---|
| `classify_2_power_x` | Codomain is **(0, ∞)**, not R. Injective: 2^a = 2^b ⇒ a = b ✓. Surjective onto (0,∞): y = 5 → x = log₂5 = 2.3219, 2^2.3219 = 5 ✓; y = 0.1 → x = −3.3219, 2^(−3.3219) = 0.1 ✓. Bijection correct, and the WHY explicitly contrasts the R→R reading, which would fail. |
| `classify_log_x` | Codomain **R**, domain (0,∞). Injective ✓. Surjective: y = −2 → x = e⁻² = 0.1353, ln = −2 ✓; y = 3 → x = 20.09, ln = 3 ✓. Base e is declared on a *visible* line, so the x = e^y step is not an unstated assumption. Bijection correct. |
| `classify_x_squared_onto_nonneg` | Codomain **[0, ∞)**, so the usual "x² is not onto" answer is wrong here. Counterexample f(−1) = f(1) = 1 with −1 ≠ 1 ✓ (both images computed, not just named). Surjective: y = 9 → x = 3 ✓; y = 2 → x = √2 ✓; y = 0 → x = 0 ✓. Verdict "surjection, not bijection" correct, and the CM about writing x = ±√y is right. |
| `classify_2x_plus1_over3` | R→R. Injective: f(x₁) = f(x₂) ⇒ x₁ = x₂ ✓, argued in the correct direction (the CM about starting from x₁ = x₂ is a real and important error). Surjective: y = 5 → x = 7, f(7) = 5 ✓; y = −1 → x = −2, f(−2) = −1 ✓. Bijection correct. |

### Parity (4) — f(−x) computed symbolically **and** numerically at two values, domain symmetry confirmed first

| Card | Checks run |
|---|---|
| `define_even_odd_function` | Both definitions correct, both carry "for every x in A" and the symmetry condition x ∈ A ⇒ −x ∈ A. Examples verified: x², cos even; x³, sin odd; the "neither" example x + 1 checked (f(−1) = 0, f(1) = 2, so neither f(−x) = f(x) nor = −f(x)). |
| `parity_log_x_plus_sqrt_x2plus1` | Domain first: √(x²+1) > \|x\| ≥ −x so the argument is positive for all real x, domain R, symmetric ✓. Conjugate product independently expanded: (x²+1) − x² = 1 ✓. Numerically: f(0.6) = ln 1.76619 = **0.56880**, f(−0.6) = ln 0.56619 = **−0.56880** ✓; f(1.7) = ln 3.67231 = **1.30084**, f(−1.7) = **−1.30084** ✓. Odd correct; base-independence claim (log(1/u) = −log u in any base) is true. |
| `parity_x_times_exp_ratio` | Domain R (e^x + 1 > 0) ✓ symmetric. Symbolically: two sign flips (the outer −x, and 1 − e^x = −(e^x − 1)) cancel ⇒ even ✓. Numerically recomputed independently: f(0.6) = 0.6 × 0.29131 = **0.174787**; f(−0.6) = −0.6 × (−0.291313) = **0.174788** ✓. f(1.7) = 1.7 × 0.691066 = **1.174812**; f(−1.7) matches ✓. |
| `prove_even_exponential_form` | Domain R − {0}, symmetric, stated on the page ✓. Algebra re-derived: e⁻ˣ − 1 = (1−eˣ)/eˣ ⇒ first term becomes xeˣ/(eˣ−1) = x + x/(eˣ−1); then x − x/2 = x/2 ⇒ f(−x) = f(x) ✓. Numerically: f(0.6) = 0.729819 + 0.3 + 1 = **2.029819**, f(−0.6) = 1.329811 − 0.3 + 1 = **2.029811** ✓; f(1.7) = **2.2299796**, f(−1.7) = 2.0799796 − 0.85 + 1 = **2.2299796** ✓ (the card's 2.2300 is the correct rounding of both). |

### Algebra of functions (5)

| Card | Checks run |
|---|---|
| `sum_f_g_const_2x_minus1_x2` | x = 1: 1 + 1 + 2 = 4 = (1+1)² ✓. x = −3: −7 + 9 + 2 = 4 = (−2)² ✓. Constant collects to +1 correctly; (x+1)² factorisation right; domain R justified. |
| `product_fg_2x_minus1_x2` | x = 2: 3 × 4 = 12 = 2(8) − 4 ✓. x = −1: −3 × 1 = −3 = −2 − 1 ✓. fg vs fog distinction made explicitly. |
| `combo_3f_minus_2g` | x = 0: 3(−1) − 0 = −3 = −3 ✓. x = 2: 3(3) − 2(4) = 1 = −8 + 12 − 3 ✓. Domain-of-a-combination rule (intersection) stated correctly. |
| `sqrtf_over_g_2x_minus1_x2` | Reading √f/g = √(f(x))/g(x) matches the standard IPE answer, and the alternative reading √(f/g) is flagged as a CM. Boundary tests: x = 1/2 → √0/(1/4) = 0 ✓ **defined** (closed bracket correct, and the CM says so explicitly); x = 0.4 → √(−0.2) ✗; x = 1 → 1 ✓; x = 2 → √3/4 ✓; x = 0 excluded but already outside x ≥ 1/2. Domain [1/2, ∞) correct. |
| `set_f_plus4_fdivg_fcubed` | Element by element. Domains {4,5,6} and {4,6,8}, intersection {4,6} ✓. f+4 = {(4,9),(5,10),(6,0)} ✓ — (6,0) correctly retained. f/g: g(4) = −4 ≠ 0, g(6) = 5 ≠ 0, so {(4,−5/4),(6,−4/5)} ✓. f³ = {(4,125),(5,216),(6,−64)} ✓, sign of (−4)³ correct. The "unlike f²" remark checked: f²(6) = 16 > 0 ✓. |

### Piecewise (2) — every requested point tested against **every** branch

| Card | Checks run |
|---|---|
| `piecewise_eval_set_a` | f(4)=10 (branch 1), f(−2)=2 (branch 2, endpoint closed), f(−4)=−7 (branch 3), f(0)=−2, f(−7)=−13 — all re-computed. f(2.5): 2.5 ≥ 3 false, −2 ≤ 2.5 ≤ 2 false, 2.5 < −3 false ⇒ **undefined** ✓. Uncovered set stated as **[−3, −2) and (2, 3)** — I verified the open/closed endpoints independently: branch 3 is `x < −3` strict, so −3 itself is uncovered and the closed bracket at −3 is right. |
| `piecewise_eval_set_b` | f(3)=5, f(0)=2, f(−1.5)=−2.5, f(2)=4 (branch 1), f(−2)=−3 (branch 3), sum = 1 ✓. f(−5): all three conditions fail ⇒ undefined ✓. Union (−3,−1) ∪ [−1,1] ∪ (1,∞) = **(−3, ∞)** verified — no interior gap, since −1 and 1 are both covered by the closed middle branch. |

### Identities, proofs, sums (6) — each proof transforms one side into the other, plus two numeric checks

| Card | Checks run |
|---|---|
| `show_f_2016_eq_1` | t = cos²x: numerator (1−t) + t² = t² − t + 1; denominator t + (1−t)² = t² − t + 1 — both re-derived. Denominator (t−½)² + ¾ ≥ ¾ > 0, so never zero ✓. Numerically at **x = 1 rad**: top 0.708073 + 0.085221 = 0.793294, bottom 0.291927 + 0.501367 = 0.793294 ✓ (the card's 0.7933 confirmed). At **x = 2 rad**: both 0.856813 ✓. |
| `show_f_plus_f_reciprocal_cubic` | 1/(1/x)³ = x³ re-derived (this is the step the card says the question turns on, and it is right). x = 2: 63/8 + (−63/8) = 0 ✓. x = 3: 728/27 + (−728/27) = 0 ✓. Domain R − {0} closed under x ↦ 1/x ✓, and the card says so. |
| `show_f_tantheta_cos2theta` | Reduction re-derived: multiply top and bottom by cos²θ ⇒ (cos²θ − sin²θ)/1 = cos 2θ ✓. θ = 30°: (1 − ⅓)/(1 + ⅓) = ½ = cos 60° ✓. θ = 60°: (1−3)/(1+3) = −½ = cos 120° ✓. The condition θ ≠ (2n+1)π/2 is on a visible line. |
| `prove_fx_sq_eq_fx2_plus_f1` | Both sides built independently: LHS = x² + 2 + 1/x², RHS = (x² + 1/x²) + 2 ✓. x = 2: 25/4 = 25/4 ✓. x = 3: 100/9 = 82/9 + 18/9 ✓. x² ≠ 0 noted. The CM warning that a single substitution is a check and not a proof is correct and welcome. |
| `sum_additive_function_f1_eq_7` | f(2) = 2f(1), f(3) = 3f(1) built from the property, generalised to r ∈ **N** only. n = 1: 7·1·2/2 = 7 = f(1) ✓. n = 3: 7 + 14 + 21 = 42 = 7·3·4/2 ✓. The CM "assuming f(x) = 7x for every real x from the start" is mathematically sophisticated and correct — without a regularity hypothesis Cauchy's equation does not force linearity on R, and the card confines itself to natural r. |
| `range_rational_on_1to4` | Element by element: f(1) = 1/2, f(2) = 3/3 = 1, f(3) = 7/4, f(4) = 13/5 — all four recomputed. All distinct, so no collapse ✓. Range written as a set ✓. The x = −1 pole is correctly noted as harmless because −1 ∉ A, and that note is on the page. The CM "x² − x + 1 has no factor (x+1)" is true (it has no real roots at all). |

---

## 4. Where I disagreed with a card and was wrong

Six places. I record them because each one is a case where a faster sweep would have
produced a false finding.

1. **`domain_sqrt_abs_x_minus_x` — I expected the domain to be (−∞, 0), not R.** The
   instinct is that x ≥ 0 makes the radicand zero and therefore "fails". It does not:
   √0 = 0 is a real number, so the whole right half stays in. What settled it was the
   sibling card `domain_one_over_sqrt_abs_x_minus_x`, where the same radicand sits under a
   denominator and the condition genuinely becomes strict. The pair is the trap the brief
   flagged, and both cards land on the correct side of it — one gives R, the other (−∞, 0).

2. **`domain_sqrt_log10_3minusx_over_x` — I expected an open bracket at 3/2.** "√ of a log"
   felt like it should force the log strictly positive. It does not: at x = 3/2 the
   argument is exactly 1, log₁₀1 = 0, and √0 = 0 is defined. `(0, 3/2]` is right, and the
   card's own CM warns against exactly the mistake I was about to make.

3. **`verify_gof_inverse_via_ginverse_4elt` — I read `(gof)⁻¹ = {(1,2),(2,1),(3,4),(4,3)}`
   as an un-reversed copy of `gof` and expected a defect.** That is the classic signature of
   "forgot to swap the coordinates". Re-deriving showed gof is an involution — 1↔2 and 3↔4
   — so its inverse genuinely is the same set of pairs. The card anticipates the suspicion
   in its own WHY ("that is a property of these particular numbers, not a rule") which is
   the right thing to have written.

4. **`parity_x_times_exp_ratio` — I read "f(0.6) = 0.1748" and "f(1.7) = 1.1748" as a
   copy-paste error**, since two unrelated arguments ending in the same four digits looked
   manufactured. Recomputing gave 0.174787 and 1.174812. The coincidence is real.

5. **`fofof`/`fofofof` — I thought the composite domain should also exclude x = 0.** Under
   a literal reading of the printed `x ≠ ±1`, f(0) = −1 would not be a legal input to the
   second f. But f(x) = 1 has no solution, so f needs only x ≠ 1; the −1 exclusion is the
   source book's redundant tag, the cards say so on the page, and every answer holds at
   x = 0 anyway. Recorded in §2.2 as pedantry, not a finding.

6. **`domain_range_log_abs_4_minus_x2` — I went looking for a missing hole in "Range = R".**
   The brief's warning about ranges made me expect an omitted excluded value. There isn't
   one: t = \|4 − x²\| attains every positive value (t > 4 from x = √(4+t), 0 < t < 4 from
   x = √(4−t)), so log t attains every real value. The card derives this in two pieces
   rather than asserting it, which is what the brief asks for.

---

## 5. Coverage statement

**Every one of the 47 cards got a dedicated pass, not a sweep.** For each card I read the
`question_text`, derived the answer independently before reading the card's steps, then
read every `label`, `margin_note`, `lines` entry, `why`, `memory_tip` and
`common_mistakes` bullet, plus the `mark_split` and the `verification.note`. No card in the
corpus is unchecked, and no card is marked CLEAN on the strength of another card's result.

On top of that, four mechanical passes ran across all 47: marks arithmetic, the Rule-10
note-only-condition grep, a `recall.must_convey` cross-check, and a line-length comparison
against the 26 pre-existing `m1a_fn` cards.

**What I did NOT check, and what therefore stays unverified:**

- **Provenance.** Every card's `verification.note` cites a page and question number in
  *Sri Chaitanya FAST TRACK IPE — Mathematics-IA (2026-27)*. I do not have that book, so
  every source citation, every "the book prints this as part v)" claim, and every mark-split
  claim is unverifiable from here. All 47 already carry `needs_teacher_verification: true`,
  which is the correct state.
- **Mark-split pedagogy.** I checked that the splits *sum* correctly and that the labels
  describe the steps they sit on. Whether a Telangana examiner would award 1+1 that way is a
  teacher's call, not mine.
- **The Telugu-transliterated `recall.accept` phrases** (e.g. "modata f apply cheyyali") were
  read for mathematical content only, not reviewed linguistically.
- **`mark_note` style.** 16 of the 47 use generic `"Method"`/`"Answer"` tags where 8 use
  descriptive ones. This is *not* a defect: 167 of the 483 other shipped `m1a` cards use the
  same generic tags, so the batch is inside existing practice. Noted so it is not
  re-discovered as a finding later.
- **Rendered output.** I did not build or screenshot the cards. Line lengths are healthy on
  paper (max 51 chars, better than the neighbours), but `measure_wrap.mjs` writes artifacts
  and I am write-restricted to this file, so wrap is measured only by character count.
