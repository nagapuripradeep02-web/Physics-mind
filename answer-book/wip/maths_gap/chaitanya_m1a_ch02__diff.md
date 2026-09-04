# Diff report — Chaitanya M1A Chapter 2 (Functions)

Source: `answer-book/sources/chaitanya_m1a_ch02_functions.json` (82 questions)
Ours: `answer-book/wip/maths_gap/chaitanya_m1a_ch02_functions__ours.txt` (26 cards)

## Tally

**82 source questions = 31 matched + 0 elsewhere + 51 missing + 0 uncertain**

## Cross-check against the earlier pass (49 missing)

My count is **51 missing**, two higher than the earlier pass's 49. I read the actual JSON answer
bodies (not just the restated stems) for the two cards this hinges on, and both are genuine partial
matches — the source question demands *more* than the existing card delivers:

1. **`saq3`** — "Show that f: Q→Q defined by f(x) = 5x + 4 is a **bijection**, and find f⁻¹." Our card
   `ts_ipe_m1a_fn_inverse_5x_plus_4` is a 2-mark VSAQ (sourced from Baby Bullet-Q, a *different* book)
   that **only finds the inverse** — it contains no injectivity/surjectivity proof. The book's SAQ
   demands both. I count this as MISSING (proof half); the earlier pass likely credited the existing
   inverse card as "the same question."
2. **`vsaq20iii`** — "Find the **domain and the range** of the real valued function f(x) = √(9 − x²)."
   Our card `ts_ipe_m1a_fn_domain_root_9_minus_x2` (also from Baby Bullet-Q) computes **only the
   domain** ([−3, 3]) — its `mark_split` is 1 mark for the condition + 1 mark for the domain; there is
   no range step anywhere in the file. I count this as MISSING (range half); the earlier pass likely
   credited the domain-only card as sufficient.

51 − 2 = 49, which is exactly the earlier pass's number, so this is very likely the whole
disagreement: a judgment call on whether "the mathematics is answered" tolerates a card that covers
only part of a multi-part demand. I applied the stricter reading (per the task's own domain-of-√(9−x²)
≠ domain-of-√(4−x²) example: a specific, different demand is a different question) and marked both as
MISSING, with the existing partial card noted for reuse in each row below.

No `ELSEWHERE` cases were found — I grepped all 1,141 `ts_ipe_m1a/m1b/m2a/m2b_*` question files (the
full maths bank) for distinctive fragments of every unmatched stem and found nothing outside this
chapter's own 26 cards.

## MISSING (51)

| ref | section | stars | p. | stem (verbatim) | proposed_qtype | proposed question_id |
|---|---|---|---|---|---|---|
| vsaq3 | VSAQ | 3 | 9 | If A = {1, 2, 3, 4} and f: A→R is a function defined by f(x) = (x² − x + 1)/(x + 1), find the range of f. | VSAQ | `ts_ipe_m1a_fn_range_rational_on_1to4` |
| vsaq4 | VSAQ | 0 | 9 | If f: R − {0} → R is defined by f(x) = x³ − 1/x³, show that f(x) + f(1/x) = 0. | VSAQ | `ts_ipe_m1a_fn_show_f_plus_f_reciprocal_cubic` |
| vsaq5 | VSAQ | 0 | 9 | If f: R → R is defined by f(x) = (1 − x²)/(1 + x²), show that f(tan θ) = cos 2θ. | VSAQ | `ts_ipe_m1a_fn_show_f_tantheta_cos2theta` |
| vsaq6 | VSAQ | 0 | 9 | If f: R − {0} → R is defined by f(x) = x + 1/x, prove that (f(x))² = f(x²) + f(1). | VSAQ | `ts_ipe_m1a_fn_prove_fx_sq_eq_fx2_plus_f1` |
| vsaq8i | VSAQ | 3 | 10 | If f: R→R and g: R→R are defined by f(x) = 3x − 2 and g(x) = x² + 1, find (gof⁻¹)(2). | VSAQ | `ts_ipe_m1a_fn_gofinverse_at_2` |
| vsaq8ii | VSAQ | 3 | 10 | If f: R→R and g: R→R are defined by f(x) = 3x − 2 and g(x) = x² + 1, find (gof)(x − 1). | VSAQ | `ts_ipe_m1a_fn_gof_at_x_minus_1` |
| vsaq9i | VSAQ | 3 | 10 | If f(x) = (x + 1)/(x − 1), x ≠ ±1, find (fofof)(x). | VSAQ | `ts_ipe_m1a_fn_fofof_reciprocal_linear` |
| vsaq9ii | VSAQ | 3 | 10 | If f(x) = (x + 1)/(x − 1), x ≠ ±1, find (fofofof)(x). | VSAQ | `ts_ipe_m1a_fn_fofofof_reciprocal_linear` |
| vsaq10i | VSAQ | 1 | 10 | If f(x) = 2, g(x) = x² and h(x) = 2x for all x ∈ R, find (fo(goh))(x). | VSAQ | `ts_ipe_m1a_fn_triple_composition_constant` |
| vsaq10ii | VSAQ | 1 | 10 | If f: R→R and g: R→R are defined by f(x) = 2x² + 3 and g(x) = 3x − 2, find (fog)(x). | VSAQ | `ts_ipe_m1a_fn_fog_quadratic_linear` |
| vsaq11 | VSAQ | 1 | 10 | If f(x) = 1/x and g(x) = √x for all x ∈ (0, ∞), find (gof)(x). | VSAQ | `ts_ipe_m1a_fn_gof_reciprocal_sqrt` |
| vsaq12i | VSAQ | 3 | 10 | If f: R→R and g: R→R are defined by f(x) = 4x − 1 and g(x) = x² + 2, find (gof)(x). | VSAQ | `ts_ipe_m1a_fn_gof_4x_minus1_squared` |
| vsaq12ii | VSAQ | 3 | 10 | If f: R→R and g: R→R are defined by f(x) = 4x − 1 and g(x) = x² + 2, find (gof)((a + 1)/4). | VSAQ | `ts_ipe_m1a_fn_gof_at_a_plus1_over_4` |
| vsaq13i | VSAQ | 3 | 10 | If f: R→R and g: R→R are defined by f(x) = 3x − 1 and g(x) = x² + 1, find (fof)(x² + 1). | VSAQ | `ts_ipe_m1a_fn_fof_at_x2_plus_1` |
| vsaq13iii | VSAQ | 3 | 10 | If f: R→R and g: R→R are defined by f(x) = 3x − 1 and g(x) = x² + 1, find (gof)(2x − 3). | VSAQ | `ts_ipe_m1a_fn_gof_at_2x_minus_3` |
| vsaq14 | VSAQ | 0 | 11 | If f(x) = x² and g(x) = 2ˣ, solve (fog)(x) = (gof)(x). | VSAQ | `ts_ipe_m1a_fn_solve_fog_eq_gof` |
| vsaq16i | VSAQ | 2 | 11 | If f(x) = 2x − 1 and g(x) = x², find (3f − 2g)(x). | VSAQ | `ts_ipe_m1a_fn_combo_3f_minus_2g` |
| vsaq16ii | VSAQ | 2 | 11 | If f(x) = 2x − 1 and g(x) = x², find (fg)(x). | VSAQ | `ts_ipe_m1a_fn_product_fg_2x_minus1_x2` |
| vsaq16iii | VSAQ | 2 | 11 | If f(x) = 2x − 1 and g(x) = x², find (√f/g)(x). | VSAQ | `ts_ipe_m1a_fn_sqrtf_over_g_2x_minus1_x2` |
| vsaq16iv | VSAQ | 2 | 11 | If f(x) = 2x − 1 and g(x) = x², find (f + g + 2)(x). | VSAQ | `ts_ipe_m1a_fn_sum_f_g_const_2x_minus1_x2` |
| vsaq17v | VSAQ | 2 | 11 | Find the inverse of f: R→R defined by f(x) = (2x + 1)/3. | VSAQ | `ts_ipe_m1a_fn_inverse_2x_plus1_over3` |
| vsaq18i | VSAQ | 0 | 11 | Decide with justification whether f: R→R defined by f(x) = (2x + 1)/3 is an injection, a surjection or a bijection. | VSAQ | `ts_ipe_m1a_fn_classify_2x_plus1_over3` |
| vsaq18ii | VSAQ | 0 | 11 | Decide with justification whether f: R→[0, ∞) defined by f(x) = x² is an injection, a surjection or a bijection. | VSAQ | `ts_ipe_m1a_fn_classify_x_squared_onto_nonneg` |
| vsaq18iii | VSAQ | 0 | 11 | Decide with justification whether f: R→(0, ∞) defined by f(x) = 2ˣ is an injection, a surjection or a bijection. | VSAQ | `ts_ipe_m1a_fn_classify_2_power_x` |
| vsaq18iv | VSAQ | 0 | 11 | Decide with justification whether f: (0, ∞)→R defined by f(x) = log x is an injection, a surjection or a bijection. | VSAQ | `ts_ipe_m1a_fn_classify_log_x` |
| vsaq19ai | VSAQ | 1 | 12 | Find the domain of the real valued function f(x) = 1/(6x − x² − 5). | VSAQ | `ts_ipe_m1a_fn_domain_one_over_6x_minus_x2_minus_5` |
| vsaq19aii | VSAQ | 1 | 12 | Find the domain of the real valued function f(x) = √(x² − 1) + 1/√(x² − 3x + 2). | VSAQ | `ts_ipe_m1a_fn_domain_sqrt_x2m1_plus_reciprocal_sqrt` |
| vsaq19aiii | VSAQ | 3 | 12 | Find the domain of the real valued function f(x) = (√(3 + x) + √(3 − x))/x. | VSAQ | `ts_ipe_m1a_fn_domain_sqrt3plusx_sqrt3minusx_over_x` |
| vsaq19avi | VSAQ | 0 | 12 | Find the domain of the real valued function f(x) = 1/log(2 − x). | VSAQ | `ts_ipe_m1a_fn_domain_one_over_log_2_minus_x` |
| vsaq19biii | VSAQ | 0 | 13 | Find the domain of the real valued function f(x) = √(|x| − x). | VSAQ | `ts_ipe_m1a_fn_domain_sqrt_abs_x_minus_x` |
| vsaq19biv | VSAQ | 0 | 13 | Find the domain of the real valued function f(x) = √(log₁₀((3 − x)/x)). | VSAQ | `ts_ipe_m1a_fn_domain_sqrt_log10_3minusx_over_x` |
| vsaq19bv | VSAQ | 0 | 13 | Find the domain of the real valued function f(x) = 1/√(|x| − x). | VSAQ | `ts_ipe_m1a_fn_domain_one_over_sqrt_abs_x_minus_x` |
| vsaq19bvi | VSAQ | 0 | 13 | Find the domain of the real valued function f(x) = √([x] − x), where [x] is the greatest integer not exceeding x. | VSAQ | `ts_ipe_m1a_fn_domain_sqrt_greatest_integer_minus_x` |
| vsaq20i | VSAQ | 3 | 13 | Find the domain and the range of the real valued function f(x) = log|4 − x²|. | VSAQ | `ts_ipe_m1a_fn_domain_range_log_abs_4_minus_x2` |
| vsaq20ii | VSAQ | 3 | 14 | Find the domain and the range of the real valued function f(x) = (x² − 4)/(x − 2). | VSAQ | `ts_ipe_m1a_fn_domain_range_x2_minus4_over_x_minus2` |
| vsaq20iii | VSAQ | 3 | 14 | Find the domain and the range of the real valued function f(x) = √(9 − x²). *(domain half exists — see NOTES)* | VSAQ | `ts_ipe_m1a_fn_domain_range_root_9_minus_x2` |
| vsaq22 | VSAQ | 1 | 14 | If f(x) = (sin²x + cos⁴x)/(cos²x + sin⁴x), show that f(2016) = 1. | VSAQ | `ts_ipe_m1a_fn_show_f_2016_eq_1` |
| vsaq23a | VSAQ | 1 | 14 | If f is defined by f(x) = 3x − 2 for x ≥ 3, f(x) = x² − 2 for −2 ≤ x ≤ 2 and f(x) = 2x + 1 for x < −3, find the values of f(4), f(2.5), f(−2), f(−4), f(0) and f(−7). | VSAQ | `ts_ipe_m1a_fn_piecewise_eval_set_a` |
| vsaq23b | VSAQ | 0 | 14 | If f is defined by f(x) = x + 2 for x > 1, f(x) = 2 for −1 ≤ x ≤ 1 and f(x) = x − 1 for −3 < x < −1, find the values of f(3), f(0), f(−1.5), f(2) + f(−2) and f(−5). | VSAQ | `ts_ipe_m1a_fn_piecewise_eval_set_b` |
| vsaq24 | VSAQ | 0 | 15 | If f: R→R satisfies f(x + y) = f(x) + f(y) for all x, y ∈ R and f(1) = 7, find Σ (r = 1 to n) f(r). | VSAQ | `ts_ipe_m1a_fn_sum_additive_function_f1_eq_7` |
| vsaq25 | VSAQ | 0 | 15 | Prove that the real valued function f(x) = x/(eˣ − 1) + x/2 + 1 is an even function on R − {0}. | VSAQ | `ts_ipe_m1a_fn_prove_even_exponential_form` |
| vsaq26i | VSAQ | 0 | 15 | Determine whether f(x) = x((eˣ − 1)/(eˣ + 1)) is even or odd. | VSAQ | `ts_ipe_m1a_fn_parity_x_times_exp_ratio` |
| vsaq26ii | VSAQ | 0 | 15 | Determine whether f(x) = log(x + √(x² + 1)) is even or odd. | VSAQ | `ts_ipe_m1a_fn_parity_log_x_plus_sqrt_x2plus1` |
| vsaq27 | VSAQ | 0 | 15 | Define an even function and an odd function. | VSAQ | `ts_ipe_m1a_fn_define_even_odd_function` |
| saq1 | SAQ | 0 | 16 | Let A = {1, 2, 3}, B = {a, b, c} and C = {p, q, r}. If f: A→B and g: B→C are defined by f = {(1, a), (2, c), (3, b)} and g = {(a, q), (b, r), (c, p)}, show that f⁻¹og⁻¹ = (gof)⁻¹. | SAQ | `ts_ipe_m1a_fn_verify_finverse_ginverse_3elt` |
| saq2 | SAQ | 3 | 16 | Let f: A→B and g: B→A with f = {(1, a), (2, c), (4, d), (3, b)} and g⁻¹ = {(2, a), (4, b), (1, c), (3, d)}. Verify that (gof)⁻¹ = f⁻¹og⁻¹. | SAQ | `ts_ipe_m1a_fn_verify_gof_inverse_via_ginverse_4elt` |
| saq3 | SAQ | 3 | 16 | Show that f: Q→Q defined by f(x) = 5x + 4 is a bijection, and find f⁻¹. *(inverse half exists — see NOTES)* | SAQ | `ts_ipe_m1a_fn_bijection_proof_5x_plus_4` |
| saq4iv | SAQ | 3 | 16 | If f = {(4, 5), (5, 6), (6, −4)} and g = {(4, −4), (6, 5), (8, 5)}, find f + 4. | SAQ | `ts_ipe_m1a_fn_set_f_plus4_fdivg_fcubed` |
| saq4vi | SAQ | 3 | 16 | If f = {(4, 5), (5, 6), (6, −4)} and g = {(4, −4), (6, 5), (8, 5)}, find f/g. | SAQ | `ts_ipe_m1a_fn_set_f_plus4_fdivg_fcubed` |
| saq4x | SAQ | 3 | 16 | If f = {(4, 5), (5, 6), (6, −4)} and g = {(4, −4), (6, 5), (8, 5)}, find f³. | SAQ | `ts_ipe_m1a_fn_set_f_plus4_fdivg_fcubed` |
| thm6 | THEOREMS | 0 | 19 | Let f: A→B, g: B→C and h: C→D. Show that ho(gof) = (hog)of, that is, that composition of functions is associative. | LAQ | `ts_ipe_m1a_fn_composition_associative` |

(saq4iv/vi/x share one proposed id — see NOTES, they are naturally one addendum card.)

## MATCHED (31)

| ref | question_id |
|---|---|
| vsaq1 | `ts_ipe_m1a_fn_surjection_range_cos` |
| vsaq2 | `ts_ipe_m1a_fn_surjection_range_quadratic` |
| vsaq7i | `ts_ipe_m1a_fn_set_two_f_and_f_squared` |
| vsaq7ii | `ts_ipe_m1a_fn_set_two_plus_f_and_root_f` |
| vsaq7iii | `ts_ipe_m1a_fn_set_two_f_and_f_squared` |
| vsaq7iv | `ts_ipe_m1a_fn_set_two_plus_f_and_root_f` |
| vsaq13ii | `ts_ipe_m1a_fn_fog_at_2` |
| vsaq15i | `ts_ipe_m1a_fn_gof_fog_identity` |
| vsaq15ii | `ts_ipe_m1a_fn_gof_fog_identity` |
| vsaq17i | `ts_ipe_m1a_fn_inverse_ax_plus_b` |
| vsaq17ii | `ts_ipe_m1a_fn_inverse_5_power_x` |
| vsaq17iii | `ts_ipe_m1a_fn_inverse_log2_x` |
| vsaq19aiv | `ts_ipe_m1a_fn_domain_root_4x_minus_x2` |
| vsaq19av | `ts_ipe_m1a_fn_domain_log_x2_minus_4x_plus_3` |
| vsaq19avii | `ts_ipe_m1a_fn_domain_one_over_root_x2_minus_a2` |
| vsaq19aviii | `ts_ipe_m1a_fn_domain_one_over_root_1_minus_x2` |
| vsaq19bi | `ts_ipe_m1a_fn_domain_rational_x2_minus_1_x_plus_3` |
| vsaq19bii | `ts_ipe_m1a_fn_domain_root_x2_minus_25` |
| vsaq21 | `ts_ipe_m1a_fn_domain_root_x2_minus_3x_plus_2` |
| saq4i | `ts_ipe_m1a_fn_sqp_seven_operations` |
| saq4ii | `ts_ipe_m1a_fn_sqp_seven_operations` |
| saq4iii | `ts_ipe_m1a_fn_sqp_seven_operations` |
| saq4v | `ts_ipe_m1a_fn_sqp_seven_operations` |
| saq4vii | `ts_ipe_m1a_fn_sqp_seven_operations` |
| saq4viii | `ts_ipe_m1a_fn_sqp_seven_operations` |
| saq4ix | `ts_ipe_m1a_fn_sqp_seven_operations` |
| thm1 | `ts_ipe_m1a_fn_gof_bijective` |
| thm2 | `ts_ipe_m1a_fn_gof_inverse_reverse` |
| thm3 | `ts_ipe_m1a_fn_identity_composition` |
| thm4 | `ts_ipe_m1a_fn_f_finverse_identity` |
| thm5 | `ts_ipe_m1a_fn_sqp_bijection_inverse` |

(saq4i/ii/iii/v/vii/viii/ix all point at one 7-operation LAQ card — the book prints these 7 among
ten sub-parts of its own Q4; the remaining three, saq4iv/vi/x, are in the MISSING table.)

## ELSEWHERE (0)

None. I grepped the full maths bank (1,141 `ts_ipe_m1a/m1b/m2a/m2b_*` question files, all four papers)
for distinctive fragments of every stem not covered by the 26 Functions cards, and found no hits
outside this chapter's own card set. Composition-of-functions and domain-of-a-function content is
specific to this unit; it does not recur under Sets & Relations (checked — no `gof`/`fog`/`inverse`
hits there) or under any M1B/M2A/M2B paper.

## UNCERTAIN (0)

None. The two genuinely ambiguous cases (`saq3`, `vsaq20iii`) were resolved by reading the actual
answer JSON rather than left as guesses — see the cross-check section above.

## NOTES

- **`saq3` / `vsaq20iii` partial coverage.** Both have half their demand already authored (see
  cross-check above). The cleanest fix is probably to EXTEND the existing card
  (`ts_ipe_m1a_fn_inverse_5x_plus_4` → add the bijection proof; `ts_ipe_m1a_fn_domain_root_9_minus_x2`
  → add the range step) rather than author a wholly separate card that duplicates the shared half —
  flagging this for whoever authors these two rather than prescribing one path.
- **`saq4iv`, `saq4vi`, `saq4x` are low priority.** The book's own Q4 has TEN sub-parts (i–x); our
  existing `ts_ipe_m1a_fn_sqp_seven_operations` card already covers seven of them and is explicitly
  noted (in its own `verification.note`) as "re-cut to the 8-mark Section-C form of the 2026-27
  pattern" — i.e. the current exam-pattern LAQ already spends all 8 marks on those 7 parts. The three
  leftover operations (f+4, f/g, f³) are book content beyond what the current paper pattern tests.
  I still list them as MISSING (they are genuine book questions), but recommend treating them as
  optional supplementary practice rather than exam-critical, and authoring them as ONE shared
  addendum card (same f, g) rather than three separate ones.
- **`saq1` and `saq2` relate to `thm2` (MATCHED) but are not duplicates of it.** `thm2` is the general
  proof that (gof)⁻¹ = f⁻¹og⁻¹ for arbitrary bijections f, g — already covered. `saq1` and `saq2` ask
  for a concrete numeric verification of the same identity on specific finite sets. Per the task's own
  standard (a specific instance is a different question from the general result, same as
  domain-of-√(9−x²) ≠ domain-of-√(4−x²)), these are counted as separate MISSING questions, not folded
  into the `thm2` match.
- **`vsaq17v` and `vsaq18i` use the same function**, f(x) = (2x + 1)/3 — one asks for the inverse, the
  other asks to classify injection/surjection/bijection. Different demands, so both are listed
  separately in MISSING, but they could reasonably be authored together (classify, then invert).
- **`vsaq22` is a disguised identity, not a numeric substitution.** f(x) = (sin²x + cos⁴x)/(cos²x +
  sin⁴x) simplifies to the constant 1 for every real x (write c = cos²x, s = sin²x = 1 − c; both
  numerator and denominator reduce to 1 − c + c²). So "show f(2016) = 1" is really "show f(x) ≡ 1"; an
  author should not treat 2016 as needing special numeric handling.
- **`vsaq23a` and `vsaq23b` are deliberate domain-gap questions, not misprints** — the source's own
  notes already say so. In `vsaq23a` the three branches (x ≥ 3, −2 ≤ x ≤ 2, x < −3) leave (−3,−2) and
  (2,3) undefined, and f(2.5) is asked precisely because 2.5 falls in that gap (i.e. f(2.5) does not
  exist under the given definition — that is the point of the question). In `vsaq23b` the branches
  (x > 1, −1 ≤ x ≤ 1, −3 < x < −1) cover only (−3, ∞), and f(−5) is asked precisely because −5 falls
  outside that domain. Whoever authors these two needs to preserve the "undefined at that point" answer
  rather than force a value.
- **No duplicate questions found** among the 82 source refs — every ref has a distinct function,
  point set, or demand, even where several share the same underlying f/g pair (e.g. the vsaq8/vsaq12/
  vsaq13 families, or the ten-part saq4).
- I did not find any source stem that looks mathematically wrong or unsolvable; the two "trick" items
  (vsaq22's constant identity, vsaq23a/b's domain gaps) are intentional per the book's own annotations,
  not errors.
