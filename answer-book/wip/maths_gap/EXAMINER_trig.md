# Independent examiner report — Trigonometric Ratios and Transformations (57 new cards)

**Scope.** The 57 `ts_ipe_m1a_tr_*` cards added in commit `c0942ca1` ("the 317 missing Maths-1A/1B
questions, authored"), identified by `git show --stat HEAD --name-only | grep m1a_tr`. Pre-existing
`ts_ipe_m1a_tr_*` cards (e.g. `sin2a_sum`) were **not** examined.

**Method.** Every card re-derived from its `question_text` with no reference to its own
`verification.note` claim of correctness. Every identity checked numerically against angle sets that
satisfy **that card's own stated condition** (triangle / π/2 / 3π/2 / zero-sum / no condition), at
minimum 3–4 independent sets per card, agreeing to 12 decimal places. For every multi-line
derivation, **each intermediate line was evaluated as an expression in its own right** and confirmed
constant across all angle sets — not just the boxed answer. Exact-value claims were compared against
the direct decimal to 12 places. Every `common_mistakes` bullet was read back against its own step's
lines.

**Report only. No file in the repository was changed** (`git status` clean apart from this report).

---

## 1. Tally by band

| Band | Count | Cards |
|---|---|---|
| **WRONG** | **0** | — |
| **MISLEADING** | **3** | `cos_sum_half_angle_sines`, `cos_half_sum_minus_c_pi4`, `sin_half_sum_minus_c_pi4` |
| **THIN** | **1** | `tan_quarter_pi_shift_m` |
| **CLEAN** | **53** | listed in §4 |

**No card in this corpus is mathematically wrong.** Every boxed answer is correct and every
intermediate line of every derivation reproduces numerically. That is a materially better result
than the 7-in-271 baseline `docs/patterns/answer_book.md` records, and I looked for that failure mode
specifically (per-line evaluation, not destination-only checking).

The four findings below are all **notation and condition** defects, not arithmetic ones.

---

## 2. Findings table (MISLEADING / THIN)

| # | Card | Exact line | What it says | What it should say | Numeric evidence |
|---|---|---|---|---|---|
| F1 | `ts_ipe_m1a_tr_cos_sum_half_angle_sines` | step `s5_final`, `memory_tip` | "**With C = (A−B)/2 and D = (A+B)/2** the formula gives exactly 2 sin(A/2) sin(B/2)." | The stem of this card is "*If A, B, C are the angles of a triangle*". `C` is already bound to the third angle of the triangle, and it is bound again on the same page — `sin(C/2)` appears in the boxed answer. Re-binding `C` to `(A−B)/2` in a student-facing tip is a false statement about *this card's* `C`. Use neutral dummies: "With P = (A−B)/2 and Q = (A+B)/2 …", or state it as "half the sum is A/2, half the difference is B/2". | At A = 50°, B = 60°, C = 70°: the tip's own equation `C = (A−B)/2` reads `70° = −5°`, which is false. The mathematics of the step is correct (verified: LHS 1.484807753012 = RHS 1.484807753012 at (50,60,70); also (40,75,65) 1.447481749962, (110,25,45) 1.271394424898, (100,50,30) 1.335164835804 — and the step-4 bracket form `1 + 2sin(C/2)[cos((A−B)/2) − cos((A+B)/2)]` matches at all four). The defect is the tip only. |
| F2 | `ts_ipe_m1a_tr_cos_half_sum_minus_c_pi4` | step `s5_final`, `lines[3]` | `  [(C+D)/2 = (π+A)/4, (C−D)/2 = −(π+B)/4]` | This is an **asserted equation on the answer page**, and its `C` is the sum-formula dummy while the same step's next line reads `4 cos((π+A)/4) cos((π+B)/4) cos((π−C)/4)`, where `C` is the triangle angle from the stem `A + B + C = π`. Two different meanings of `C` two lines apart. Rename the dummies (`P`, `Q`) or write it verbally as the margin note already does ("half the sum gives (π+A)/4 and half the difference gives −(π+B)/4"). | With the triangle's C, at A = 50°, B = 60°, C = 70°, `(C+D)/2 = (π+A)/4` is unsatisfiable for any D. With the intended dummies C = (A−B)/2, D = (2π+A+B)/4 it is an identity. The proof itself is correct: L = R = 0.953181146532 at (50,60); 0.889654515264 at (40,75); 0.625992910960 at (110,25); 0.545115132226 at (20,120), with the step-2, step-3 and step-4 forms all matching to 12 places at every set. |
| F3 | `ts_ipe_m1a_tr_sin_half_sum_minus_c_pi4` | step `s5_final`, `lines[3]` | `  [(C+D)/2 = (π−B)/4, (C−D)/2 = −(π−A)/4]` | Identical defect to F2, in the sibling card. The stem is `A + B + C = π` and the boxed answer contains `sin((π−C)/4)`. | Proof verified correct: L = R = 0.349041825390 at (A,B) = (50,60); 0.413481963988 at (40,75); 0.652908225862 at (110,25); −0.348387313579 at (30,30), with the s3 and s4 intermediate forms matching at all four. Only the dummy-variable line is defective. |
| F4 | `ts_ipe_m1a_tr_tan_quarter_pi_shift_m` | step `s1_given`, `lines`: "Take cos(π/4 − α) ≠ 0, cos(π/4 − β) ≠ 0." | The card makes completeness of the condition list its explicit selling point (`why`: "*Naming the non-zero conditions first means no later line has to be defended*"; note: "*CONDITIONS ARE ON THE PAGE, NOT ONLY HERE*"). It lists four conditions and **omits the one the final step actually needs**: `cos(π/4 + β) ≠ 0`, i.e. β not an odd multiple of π/4 above π/4. Step `s6_final` multiplies both sides by `tan(π/4 + β)`; at β = π/4 that tangent does not exist and the printed conclusion is false. | Counterexample inside the card's own stated conditions: α = 20°, β = 45°. Then cos(α−β) = cos(−25°) ≠ 0 ✓, cos(π/4−α) = cos25° ≠ 0 ✓, cos(π/4−β) = cos0° = 1 ≠ 0 ✓. The given ratio sin(α+β)/cos(α−β) = sin65°/cos(−25°) = **1.000000000000**, so (1−m)/(1+m) = 1 ⇒ m = 0, and 1 + m ≠ 0 ✓. The conclusion then reads tan(π/4 − α) = 0 · tan(π/2): the right side is undefined, and the left side is tan25° = **0.466307658155 ≠ 0**. Add `cos(π/4 + β) ≠ 0` to step 1. (The proof is otherwise correct — verified at (α,β) = (20,35) m = 0.082222621444, both sides 0.466307658155; (10,−25) m = 1.923804400163, both sides 0.700207538210; (48,12) m = −0.034034009809, both sides −0.052407779283; (70,5) m = −0.391278583973, both sides −0.466307658155; and the step-5 form m = tan(π/4−α)tan(π/4−β) matches m at all four.) |

---

## 3. Cross-cutting notes (reported, not band-changing)

**3a. The `C`/`D` dummy collision is systemic, not confined to F1–F3.** Eight further LAQ cards quote
the sum-to-product rule verbatim as `[∵ cosC + cosD = 2 cos((C+D)/2) cos((C−D)/2)]` (or the sine
version) *inside a proof whose stem binds `C` to the third angle*:
`cos2_sum_minus_c`, `cos2_sum_three_half_pi`, `cos_sq_sum_zero`, `sin2_sum_half_pi`,
`sin2_sum_minus_b`, `sin2_sum_minus_c`, `sin_sq_sum_half_pi`, `sin_sum_half_angle_cosines`.
I left these CLEAN because the bracket is a *generic quoted rule* with no asserted equation tying the
dummy to a value, which is how printed textbooks do it. F1–F3 crossed the line by asserting a value
for `C` on the page. If a fleet-wide fix is made, renaming the dummies to `P`/`Q` in all eleven is the
cheap way to close the whole class. (`cos_sum_12_84_132_156`, `four_cos66_sin84`,
`cyclic_quadrilateral_sin_cos` and `tan_quarter_pi_shift_m` also use `C`/`D` but bind no conflicting
`C`, so they are unaffected.)

**3b. "the cosine rule".** `sin2_sum_minus_b` and `sin2_sum_minus_c` each carry the
`common_mistakes` bullet "Writing sin(180° − C) = −sin C, **which is the cosine rule not the sine
one**." The bullet correctly names a real mistake, but "the cosine rule" is the standard name of
a² = b² + c² − 2bc·cos A. In a trigonometry chapter this reads as a different theorem. Suggest "…
that is what *cosine* does, not sine." (`sin_product_fifths` has the safer phrasing "which is the
rule for cosine".)

**3c. `cos_sq_sum_zero`, step 1, `common_mistakes`:** "Assuming all three angles are positive; here
at least one of them is negative." Under A + B + C = 0 the single case A = B = C = 0 has none
negative. Degenerate and harmless; recorded for completeness only.

**3d. `graph_cos_sq_x`, step 1:** the table of values includes x = 0 and x = π, which the stem's open
interval (0, π) excludes. The step-2 `margin_note` does say "The interval is open, so the value 1 is
approached at the two ends but not included," so a student reading the page is not misled — this is
why the card stays CLEAN rather than THIN.

---

## 4. CLEAN list — 53 cards, with the checks actually run

Angle sets are in degrees unless marked. "s2/s3/s4…" means that step's intermediate expression was
evaluated independently and matched the two endpoints at every listed angle set.

### Two-angle / no-triangle-condition identities
1. **`a_minus_b_3pi4_tan_product`** — A − B = 3π/4. (1−tanA)(1+tanB) evaluated at B = 10°, 33°, 77°, −20° (A = B+135°): **2.000000000000** at all four. Step-1 relation tanA − tanB = −1 − tanA·tanB confirmed at each.
2. **`a_plus_b_pi4_tan_cot_products`** — A + B = π/4. At A = 10°, 30°, −20°, 44°: (1+tanA)(1+tanB) = **2.000000000000** and (cotA−1)(cotB−1) = **2.000000000000** at all four. Cotangent addition formula (cotAcotB−1)/(cotA+cotB) hand-verified as correct (the card does not use the wrong `+1` form its own CM warns about).
3. **`alpha_plus_beta_pi4_sin_values`** — exact: asin(1/√10) + asin(1/√5) = **0.785398163397** = π/4 to 12 places. cosα = 3/√10, cosβ = 2/√5, sin(α+β) = cos(α+β) = 1/√2 all confirmed; the 3π/4 elimination is genuinely needed and is present.
4. **`cos100_cos40_sin100_sin40`** — cos100cos40 + sin100sin40 = **0.500000000000** = cos60°.
5. **`cos_fourth_plus_term_sin_fourth`** — at α = 37°, 100°, 215°, 13°: LHS = RHS = 0.868824689928 / 0.059398134217 / 0.891765627053 / 0.997439338734. Third and fourth quadrants used deliberately. `cos α ≠ 0` is on the page (step-1 line), not parked in the note.
6. **`cos_sin_root2_swap`** — the given forces tanθ = √2−1 ⇒ θ = 22½° (and 202½°). At 22½°: cosθ+sinθ = √2cosθ = 1.306562964876; cosθ−sinθ = √2sinθ = 0.541196100146. At 202½° both sides = −1.306562964876 / −0.541196100146. Regrouping 2−√2 = √2(√2−1) verified.
7. **`eliminate_theta_cos_cube_sin_cube`** — (x/a)^(2/3) + (y/b)^(2/3) evaluated as (∛·)² at (a,b,θ) = (2.7,−1.4,200°), (3,5,47°), (−2,1,310°), (1,1,135°): **1.000000000000** at all four. Negative a, negative b and third-quadrant θ all exercised; the "no ± because a real cube root is unique" claim holds.
8. **`half_angle_sub_expression`** — x and the asked expression at θ = 50°, 130°, 240°, 310°, 17°: 0.636029765734 / 1.363970234266 / 4.732050807569 / −1.747477419455 / 0.260038924972, agreeing to 12 places in every case. Numerator identity (1+sinθ)²−cos²θ = 2sinθ(1+sinθ) confirmed.
9. **`sin_ratio_a_plus_b`** — see §5: I initially thought this card was wrong. Correct construction (a+b)/(a−b) = r gives, at (α,β) = (50,20), (115,−35), (70,15), (33,−8): a·tanβ = b·tanα = 0.524005260459 / −1.039673581451 / 0.296905011099 / −0.115537017338. The collected line 2a·cosα·sinβ = 2b·sinα·cosβ was evaluated separately and matches at all four.
10. **`sec_plus_tan_two_thirds`** — secθ = 13/12, tanθ = −5/12 give secθ+tanθ = 0.666666666667 and secθ−tanθ = 1.5; sinθ = tanθcosθ = −5/13 = −0.384615384615, cosθ = 12/13; sin²+cos² = 1. cos > 0 with sin < 0 ⇒ fourth quadrant, correct.
11. **`sin2theta_from_cos_minus5_13`** — sinθ = +12/13 by the second-quadrant condition; sin2θ = 2(12/13)(−5/13) = **−0.710059171598** = −120/169 exactly.
12. **`tan_sec_ratio_identity`** — at θ = 40°, 100°, 200°, 320°, 13°: LHS = RHS = 2.144506920510 / −11.430052302761 / −0.700207538210 / 0.466307658155 / 1.257172298919. Factorisation Nr = (secθ+tanθ)(tanθ−secθ+1) verified. The denominator-zero family θ = 2nπ is derived correctly (sinθ+cosθ = 1 with cosθ ≠ 0) and **is on the page**, not only in the note.
13. **`tan3a_tan2a_tana_relation`** — at A = 10°, 25°, −33°, 70°: tan3A·tan2A·tanA = tan3A − tan2A − tanA = 0.037053054215 / 2.073989556820 / 9.209195881777 / −1.331027519088. The stem's condition is genuinely sufficient: if A were an odd multiple of π/2 then so would 3A be, and 1 − tan2A·tanA = 0 would make tan3A undefined — both checked.
14. **`tan_doubling_chain_cot`** — at θ = 10°, 33°, −7°, 50°: tanθ + 2tan2θ + 4tan4θ + 8cot8θ = cotθ = 5.671281819618 / 1.539864963815 / −8.144346427975 / 0.839099631177. The lemma cotθ − tanθ = 2cot2θ evaluated separately: 5.494954838909 / 0.890457370617 / −8.021561867072 / −0.352653961417, matching 2cot2θ at each. **The card's sharpening of the source condition is correct and belongs on the page**: sin8θ = 8 sinθ cosθ cos2θ cos4θ, so sin8θ ≠ 0 (θ ≠ nπ/8) is exactly what keeps all five ratios defined, and the printed θ ≠ nπ/2 does not (θ = π/4 breaks tan2θ; θ = π/8 breaks cot8θ). It is stated in step 1's lines, not parked.
15. **`tanalpha_half_angle_derive`** — sin2α/(1+cos2α) = tanα at α = 15°, 22½°, 37°, 110°: 0.267949192431 / 0.414213562373 / 0.753554050103 / −2.747477419455. tan15° = 2−√3 = 0.267949192431 and tan22½° = √2−1 = 0.414213562373, both matching the direct tangent to 12 places. `cos α ≠ 0` is on the page.
16. **`cot_power_n_sum`** — at (A,B) = (70,20), (130,−15), (33,101): first ratio = cot((A−B)/2) = 2.144506920510 / 0.315298788879 / −1.482560968513 and second ratio = exactly its negative at each. n = 2: 9.197819864227 / 0.198826652537 / 4.395974050715 = 2cot²x at each; n = 4: 42.299945127382 / 0.019766018880 / 9.662293927279 = 2cot⁴x; n = 3: 0.000000000000 at all three. The step-1 reduction of "none of the denominators is zero" to sin x ≠ 0, sin y ≠ 0, cos y ≠ 0 is correct and complete, and the "n is a positive integer" assumption is on the page.

### Triangle (A + B + C = π) identities — every intermediate line checked
Angle sets used throughout: **(50,60,70), (40,75,65), (110,25,45)** plus a fourth non-standard set per card (obtuse or isosceles). All values agree to 12 decimals at every set, at every line.

17. **`cos2_sum_minus_c`** — L = R = 0.092396265452 / −0.049589616431 / −0.123256833432 / 0.092396265452 at (20,120,40). Steps s2 `2cos(A+B)cos(A−B) − (2cos²C−1)`, s3 `−2cosC·cos(A−B) − 2cos²C + 1`, s4a `1 − 2cosC[cos(A−B)+cosC]`, s4b `1 − 2cosC[cos(A−B)−cos(A+B)]` each evaluated independently: all four match at all four sets.
18. **`cos_sq_sum_minus_c`** — L = R = 0.546198132726 / 0.475205191785 / 0.438371583284, plus (95,55,30) = −0.413413948169. s2, s3, s4 intermediates match at all four.
19. **`cos_sum_half_angle_sines`** — L = R = 1.484807753012 / 1.447481749962 / 1.271394424898, plus (100,50,30) = 1.335164835804. s2, s3, s4 match at all four. *(This card is F1 — the mathematics is CLEAN; the memory_tip is the defect.)*
20. **`sin2_sum_minus_b`** — L = R = 0.761569958914 / 1.250852196131 / −0.408832052806, plus (20,140,20) = 2.270382972385. The reorder-then-pair route, s3 `2sinB·cos(A−C) − 2sinB·cosB` and s4 `2sinB[cos(A−C)+cos(A+C)]` match at all four. The A+C rearrangement (not A+B) is the right choice for this sign pattern.
21. **`sin2_sum_minus_c`** — L = R = 1.208045547110 / 0.718763309893 / −0.876743166568, plus (20,140,20) = −0.984807753012. s3 and s4 match at all four.
22. **`sin_sum_half_angle_cosines`** — L = R = 2.571762467689 / 2.515021223012 / 2.069417663713, plus (20,140,20) = 1.326827896338; the s4 bracket form 2cos(C/2)[cos((A−B)/2)+cos((A+B)/2)] matches at all four.
23. **`cos_half_sum_minus_c_pi4`** — L = R = 0.953181146532 / 0.889654515264 / 0.625992910960, plus (20,120,40) = 0.545115132226; s2, s3, s4 all match. The quarter-angle bookkeeping ((A+B)/4 = (π−C)/4, −sin θ = cos(θ+π/2), (3π−C)/4 = (2π+A+B)/4, half-sum (π+A)/4, half-difference −(π+B)/4) was re-derived symbolically and is correct at every step. *(This card is F2 — the defect is the dummy-variable line only.)*
24. **`sin_half_sum_minus_c_pi4`** — L = R = 0.349041825390 / 0.413481963988 / 0.652908225862, plus (30,30,120) = −0.348387313579; s3 and s4 match. sin(C/2) = 1 − 2sin²((π−C)/4), sin((π−C)/4) = cos((π+C)/4) = cos((2π−A−B)/4), half-sum (π−B)/4, half-difference −(π−A)/4 all re-derived. *(This card is F3.)*
25. **`cot_pairwise_sum_triangle`** — cotAcotB + cotBcotC + cotCcotA = **1.000000000000** at (50,60,70), (100,30,50), (20,140,20) and the near-degenerate (89,1.5,89.5). The claim that this identity needs *no* excluded angle is correct and I checked it: cot is defined on all of (0,π); cotA + cotB = sinC/(sinA sinB) > 0 in a triangle so the cross-multiplication is safe; and A+B = π−C ∈ (0,π) is never a multiple of π.
26. **`tan_sum_product_triangle`** — at (50,60,70), (100,30,50), (20,140,20): sum = product = 5.671281819618 / −3.902177957834 / −0.111159162645. The justification that 1 − tanA·tanB ≠ 0 *because* C ≠ π/2 is correct.
27. **`cyclic_quadrilateral_sin_cos`** — at (A,B) = (70,100), (120,40), (95,95): sinA − sinC = sinD − sinB = 0.000000000000 and cosA+cosB+cosC+cosD = 0.000000000000 in all three. Part (i) genuinely gives 0 = 0, as the card says.

### Non-π conditions — checked on angle sets satisfying **that** condition
28. **`cos2_sum_three_half_pi`** (A+B+C = **270°**) — L = R = −2.879385241572 at (100,80,90), −2.393639805818 at (110,95,65), −1.705737063905 at (130,70,70), −1.613340798453 at (50,100,120). Steps s2, s3, s4, s5 each evaluated separately and match at all four. Both minus signs (cos(3π/2−θ) = −sinθ and sin(3π/2−θ) = −cosθ) are correct — I checked these against the quadrant directly, since this is exactly the place a triangle-habit substitution would flip the answer.
29. **`sin2_sum_half_pi`** (A+B+C = **90°**) — L = R = 2.571762467689 at (30,25,35), 2.192853300122 at (10,50,30), 1.235183875139 at (70,−5,25), 2.408832052806 at (45,20,25). s2, s3, s4 match at all four. A negative-angle witness was used deliberately, since the π/2 condition does not force all three positive.
30. **`sin_sq_sum_half_pi`** (A+B+C = **90°**) — L = R = 0.757596123494 / 0.866977778441 / 1.069224540210 / 0.795583973597 on the same four sets; s2, s3, s4, s5 all match.
31. **`cos_sq_sum_zero`** (A+B+C = **0**) — L = R = 1.586824088833 at (40,25,−65), 0.780153689607 at (130,−70,−60), 2.822714842345 at (10,10,−20), 1.033576224745 at (−33,88,−55). s2, s3, s4, s5 all match. The sign-free substitution cos(A+B) = cos(−C) = +cosC is correct and is what makes the right-hand side carry a plus.

### Exact-value and product cards — closed form vs direct decimal, 12 places
32. **`cos36_special_value`** — cos36° = **0.809016994375** and (√5+1)/4 = **0.809016994375**. Cubic 4c³+2c²−3c−1 = 0, factorisation (c+1)(4c²−2c−1) and roots (1±√5)/4 all verified symbolically; the rejection of c = −1 is properly justified (cos180° also satisfies 3θ = 180°−2θ). The margin note's alternative route 1 − 2sin²18° = (1+√5)/4 also checks.
33. **`sin18_special_value`** — sin18° = **0.309016994375** = (√5−1)/4 = **0.309016994375**. 4sin²θ + 2sinθ − 1 = 0 with roots (−1±√5)/4 re-derived; the "divide by cosθ, which is not zero at 18°" step is stated.
34. **`cos_product_sevenths`** — cos(2π/7)cos(4π/7)cos(8π/7) = **0.125000000000** = 1/8. Chain 8θ = 16π/7 = 2π + 2π/7 verified.
35. **`cos_product_ninths`** — cos20cos40cos60cos80 = **0.062500000000** = 1/16; the inner triple cos20cos40cos80 = **0.125000000000** = (1/4)cos60°.
36. **`cos_product_elevenths`** — direct product = **0.031250000000** = 1/32; the rewritten doubling chain cos(π/11)cos(2π/11)cos(4π/11)cos(8π/11)cos(16π/11) = **0.031250000000** independently, confirming the two sign flips cancel.
37. **`cot_product_twentieths`** — cot9·cot27·cot45·cot63·cot81 = **1.000000000000**; π/20 = 9° and the complementary pairing verified.
38. **`sin_product_fifths`** — sin36sin72sin108sin144 = **0.312500000000** = 5/16; sin36sin72 = **0.559016994375** = √5/4; cos36+cos72 = **1.118033988750** = √5/2.
39. **`sin20_sin40_sin60_sin80`** — **0.187500000000** = 3/16; the identity sinA sin(60−A) sin(60+A) = (1/4)sin3A checked separately at A = 17°, 80°, −40°, 200°.
40. **`cos_sum_12_84_132_156`** — sum = **−0.500000000000**; the intermediate 2cos72cos60 + 2cos120cos36 = **−0.500000000000** and cos72 − cos36 = **−0.500000000000**. cos72° = (√5−1)/4 = 0.309016994375 confirmed (and correctly *not* swapped with cos36°).
41. **`four_cos66_sin84`** — 4(cos66+sin84) = **5.605034153776** = √3+√15 = **5.605034153776**; intermediates 8sin54cos30 and 4√3 sin54 both **5.605034153776**; sin54° = cos36° = 0.809016994375.
42. **`cos_sq_112_sin_sq_52`** — cos²112½ − sin²52½ = **−0.482962913145**; cos165cos60 = **−0.482962913145**; −(√3+1)/(4√2) = **−0.482962913145**; cos15° = (√3+1)/(2√2) = 0.965925826289.
43. **`sin_sq_52_sin_sq_22`** — sin²52½ − sin²22½ = **0.482962913145** = sin75 sin30 = (√3+1)/(4√2) = **0.482962913145**.
44. **`sec290_cosec250_sum`** — 1/cos290° + 1/(√3 sin250°) = **2.309401076759** = 4/√3 = **2.309401076759**. Reductions cos290 = +cos70 = sin20 and sin250 = −sin70 = −cos20 both confirmed by sign; numerator = 2sin40° and denominator = (√3/2)sin40° verified.
45. **`cos_triple_product_identity`** — cosA cos(60+A) cos(60−A) vs (1/4)cos3A at A = 17°, 80°, −40°, 200°: 0.157330097762 / −0.216506350946 (×3 at the last three, correctly — 3A differs by multiples of 360°/…), matching to 12 places; the intermediate cosA(cos²A − 3/4) matches at each.
46. **`sin_triple_product_identity`** — sinA sin(60+A) sin(60−A) vs (1/4)sin3A at A = 17°, 80°, −40°, 200°: 0.194286490364 / −0.216506350946 / −0.216506350946 / −0.216506350946, with the intermediate sinA(3/4 − sin²A) matching at each.
47. **`tan20_tan40_root3_product`** — tan20 + tan40 + √3 tan20 tan40 = **1.732050807569** = √3.
48. **`tan_60_shift_product`** — tanA tan(60+A) tan(60−A) vs tan3A at A = 6°, 18°, 25°, −11°: 0.324919696233 / 1.376381920471 / 3.732050807569 / −0.649407593198, matching to 12 places. The second half tan6·tan42·tan66·tan78 = **1.000000000000** directly, and the two-triple route (A = 6° then A = 18°, extra factors tan54° and tan18° reciprocal) re-derived. The note's claim that the single printed inequality 3A ≠ (2n+1)π/2 covers every undefined case was checked and is true: each of tanA, tan(60±A) undefined and 1 − 3tan²A = 0 each forces 3A onto an odd multiple of π/2.

### Range / max-min / period / graphs
49. **`maxmin_shifted_angle_root2`** — √(1² + (2√2)²) = √9 = 3 exactly; a 0.1° sweep of x over 360° gives max **−0.000000378450** and min **−5.999999621550**, i.e. 0 and −6. The "shift inside the angle changes nothing" argument is sound.
50. **`maxmin_sin2x_cos2x`** — 0.01° sweep gives max **1.414213562373** and min **−1.414213562373** = ±√2.
51. **`range_13cos_3root3sin`** — (3√3)² = 27, 169 + 27 = 196, √196 = 14 exactly; 0.01° sweep gives max **9.999999978019** and min **−17.999999978019**, i.e. the closed interval [−18, 10]. Attainment (hence the closed brackets) is correct.
52. **`period_abs_sinx`** — |sin(x+π)| = |sin x| verified (0.943818209375 at x = 1.234). Least-period claim verified exhaustively: **no** p = k° with 1 ≤ k ≤ 179 is a period of |sin x| (scanned over x ∈ [0, 2π) at 0.01 rad, tolerance 1e-9), so π is the least. The card's zeros argument is a valid proof of that.
53. **`tan2x_formula_positive_range`** — (2tanx)/(1−tan²x) vs tan2x at x = 1°, 30°, 44.9°, 45.1°, 60°, 89°: 0.034920769492 / 1.732050807569 / 286.477734011610 / −286.477734011625 / −1.732050807569 / −0.034920769492, agreeing with tan2x at every point. Positive at 1° and 30°, negative at 60° and 89°, undefined at 45°. The answer (0, π/4) is right, and both exclusions (x = 0 gives 0, which is not positive; x = π/4 has no value) are named on the page.

**Graph cards** (checked by arithmetic on the SVG path data, not by rendering — see §6):

54. **`graph_cos_sq_x`** — axes x@y=148, y@x=60; x = 0 → px 60, x = π → px 250, so π/2 → px 155. Curve starts (60, 56) = y 1, minimum (155.5, 148.0) = y 0 at π/2, returns (250, 56) = y 1. Sample check at x = π/4 (px 107.5): curve y-px 102.2 ⇒ value (148 − 102.2)/92 = **0.4978 ≈ 0.5** ✓. One dip, never crosses the axis, y ∈ [0,1] — all as the text claims. Period-π claim correct.
55. **`graph_sin2x`** — axes x@y=96, y@x=150; −π/2 → px 50, π/2 → px 250, origin px 150. Curve (50,96) = 0 → minimum (100.3, 150.0) at px 100 = −π/4 → through (150,96) = origin → maximum (201.3, 42.0) at px 200 = π/4 → (250,96) = 0. Amplitude symmetric about the axis (96−42 = 54 = 150−96) ⇒ ±1 ✓. **Negative half first**, which is correct for sin2x on (−π/2, 0), and is the point the card makes. Exactly one full period ✓.
56. **`graph_tanx`** — axes x@y=116, y@x=150; asymptotes drawn at px 90 and 210 = ∓π/2, origin px 150. Curve passes (148.2,117.2)→(151.5,115.0), i.e. through the origin ✓; strictly rising ✓; contained strictly between the asymptotes ✓. Scale verified against real values: interpolating the path at π/4 (px 180) gives Δ = 26.1 px below the axis and at π/3 (px 190) gives Δ = 45.16 px, ratio **1.730 ≈ √3** ✓, so the plotted values are tan x and not a generic rising curve. Table values (−√3, −1, 0, 1, √3) correct; asymptote behaviour correctly described.

*(Cards 17–24 and 28–31 above are the LAQ transformation family; 19, 23 and 24 are also F1/F2/F3 and are counted in the MISLEADING band, not in the CLEAN 53. The CLEAN 53 = all 57 minus F1–F4.)*

---

## 5. Where I disagreed with a card and the card was right

**5a. `sin_ratio_a_plus_b` — I first scored this as WRONG.** My first numeric run produced
a·tanβ = 0.777861913430 against b·tanα = 1.355212182620 at (α,β) = (50°,20°) — a clean disagreement,
not a rounding artefact. **The error was mine.** I had constructed the witness by setting
`b = 1/(r−1), a = r·b`, which imposes `a/b = r`, whereas the hypothesis imposes
`(a+b)/(a−b) = r`. Rebuilding the witness as `a = (r+1)/2, b = (r−1)/2` (which satisfies the actual
hypothesis) gives a·tanβ = b·tanα = 0.524005260459 at (50,20), and agreement at three further sets.
The card's own worked numbers (a = 1.4396926208, b = 0.4396926208, both sides 0.5240052605) are
correct. **Settled: the card is right; do not re-litigate.**

**5b. `cos36_special_value` — I paused on the boxed value.** (√5+1)/4 looked like it might be the
half-angle form missing a factor. It is not: (√5+1)/4 = 0.809016994375 = cos36° exactly (it is φ/2).
The neighbouring cos72° = (√5−1)/4 = sin18° is the other member of the pair, and
`cos_sum_12_84_132_156` uses both, in the right places. Settled.

**5c. `cos_product_ninths` — I expected 1/8, not 1/16.** cos20cos40cos80 = 1/8 is the familiar
result, and the four-factor version looked like it had picked up a spurious halving. It has not: the
extra factor is cos(3π/9) = cos60° = 1/2, and 1/2 × 1/8 = 1/16. Direct evaluation gives
0.062500000000. The card's own note anticipates exactly this doubt. Settled.

**5d. `cot_pairwise_sum_triangle` — I expected a missing excluded angle.** The card asserts that,
unlike the tangent identity, this one needs no excluded angle, and an unqualified claim like that is
usually where a condition has been dropped. I checked all three places it could fail: cot θ is
defined on all of (0,π); A+B = π−C is never a multiple of π; and cotA + cotB = sinC/(sinA sinB) is
strictly positive in a triangle, so the cross-multiplication never divides by zero. **The card's
claim is exactly right.** Settled.

**5e. `cos2_sum_three_half_pi` — I expected a sign error.** A 3π/2 condition producing
`1 − 4 sinA sinB sinC` (rather than the `1 + …` of the π/2 sibling) is precisely the shape of a
copied-from-the-wrong-sibling defect. Both substitutions are correct: cos(3π/2 − θ) = −sinθ and
sin(3π/2 − θ) = −cosθ, and the two minus signs are what produce the minus in the answer. Verified at
four 270°-summing sets including a non-right-angled one. Settled.

---

## 6. Coverage statement — honest

**Dedicated pass: 57 of 57 cards.** Every card in the corpus was read in full (question_text, every
`lines[]` entry of every step, `why`, `memory_tip`, `margin_note`, every `common_mistakes` bullet,
and `verification.note`) and re-derived independently. No card was skimmed and none was scored from
its own correctness claim. There is no "faster sweep" tier in this report.

**What was verified numerically:** all 54 non-graph cards, each on ≥ 3 independent inputs satisfying
that card's own stated condition, to 12 decimal places. For all 15 LAQ derivations, every
intermediate line was evaluated as a standalone expression and confirmed to equal both endpoints at
every angle set — this is the check that would have caught the recorded "right answer, wrong middle
line" failure mode, and it found none.

**What was NOT verified, and how:**

- **The three graph cards were checked by arithmetic on the SVG path coordinates, not by rendering
  them.** I confirmed the axis mapping, the zeros, the extrema, the monotonicity, the asymptote
  containment, and — by interpolating the path — that the plotted values really are the stated
  function (the tan card's √3 : 1 ratio check, the cos²x card's 0.5 at π/4). I did **not** view the
  drawn output, so I cannot speak to stroke pacing, label collision, line wrap, or clipping. The
  project's own history (`project_ipe_chemistry_book.md`, `project_maths_2b_live_senior_maths_audit.md`)
  records that figure gates miss clipping and wrong shapes, so **someone should screenshot these
  three figures**; that check is outside what this pass covered.
- **`graph_tanx`'s curve is truncated ~11 px short of each asymptote** (it runs px 101.2 → 198.7
  between asymptotes at 90 and 210, i.e. it stops at |tan x| ≈ 3.3). That is a deliberate-looking
  drawing choice and mathematically fine, but whether it reads as "approaching the asymptote" on
  screen is a rendering judgement I could not make from the path data.
- **Mark splits, `expected_time_min`, paper-position claims and the 2026-27 pattern assertions were
  not examined** — they are not mathematics and were outside this brief. I did confirm mechanically
  that every card's step marks and `mark_split` marks each sum to `marks_total` (57/57 pass).
- **Source provenance** (whether the stems really are the Sri Chaitanya questions the notes cite, and
  the originality position in `docs/ORIGINALITY_MATHS.md`) was not checked. Several notes record
  source defects ("PRINTED DEFECT recorded, not repaired", "SOURCE CONDITION TOO WEAK") that I could
  only evaluate on their mathematics, not against the book.
- **Recall blocks** (`accept` / `reject` / `heard_as` phrase lists) were read but not audited as
  speech-recognition targets.

**One class of defect I looked for and did not find:** a restriction stated only in
`verification.note` and nowhere the student reads. An automated sweep over all 57 notes for
condition-bearing sentences, cross-checked against the concatenation of every card's lines, `why`,
`memory_tip`, `margin_note` and `common_mistakes`, produced 7 candidates — all false positives on
inspection (five are conditions genuinely printed in the lines in equivalent form; two discuss
conditions of an *alternative route the card deliberately did not take*). The only genuinely missing
condition is F4, which is absent from **both** places.
