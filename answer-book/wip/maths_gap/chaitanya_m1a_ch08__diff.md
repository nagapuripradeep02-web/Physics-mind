# Diff report — Maths-1A Chapter 8, Trigonometric Ratios and Transformations

Source index: `answer-book/sources/chaitanya_m1a_ch08_trig_ratios_and_transformations.json` (92 questions)
Our bank: `answer-book/wip/maths_gap/chaitanya_m1a_ch08_trig_ratios_and_transformations__ours.txt` (53 cards — confirmed against `ls answer-book/questions/ts_ipe_m1a_tr_*.json | wc -l` = 53, so the ours.txt list is exhaustive for this unit)

## 1. Tally

**92 source questions = 34 matched + 0 elsewhere + 58 missing + 0 uncertain.**

**Cross-check against the earlier independent pass (58 MISSING): CONFIRMED — same count, 58.** I did not adjust anything to hit this number; it fell out of an independent question-by-question classification plus grep verification (see method note below). I found no ref where my judgement disagrees with "58 missing" as a *total*, and — as far as I can tell without seeing the earlier pass's own list — no reason to think the *set* differs either, since every one of the 58 I list below was verified absent from the whole bank (not just this unit) by grep on distinctive expressions, and every one of the 34 matches was verified either by exact mathematical content or by an explicit provenance note inside the card itself (11 of the 34 cards carry a note literally saying "asking this same question as Very Short Answer question N" — see method note).

### Method note
For every source question that did not have an obvious verbatim-content match in the 53-card list, I grepped the **entire** `answer-book/questions/` directory (not just this unit) for distinctive fragments of its stem (angle values, coefficients, function names) to rule out an ELSEWHERE placement. That returned zero hits for all 58 MISSING items — none of them exist anywhere else in the bank under any unit or paper. I also read the `verification.note` field of every one of the 53 existing cards; 11 of them explicitly cross-reference their Chaitanya-index source question number (e.g. "asking this same question as Very Short Answer question 38"), which let me confirm those matches with certainty rather than judgement alone.

---

## 2. MISSING (58)

| ref | book section | stars | printed_page | stem (verbatim) | proposed_qtype | proposed question_id |
|---|---|---|---|---|---|---|
| vsaq1iii | VSAQ | 0 | 82 | Find the period of f(x) = \|sin x\|. | VSAQ | ts_ipe_m1a_tr_period_abs_sinx |
| vsaq4ii | VSAQ | 0 | 82 | Find the maximum and minimum values of f(x) = sin 2x − cos 2x over ℝ. | VSAQ | ts_ipe_m1a_tr_maxmin_sin2x_cos2x |
| vsaq4iii | VSAQ | 3 | 82 | Find the maximum and minimum values of f(x) = cos(x + π/3) + 2√2 sin(x + π/3) − 3 over ℝ. | VSAQ | ts_ipe_m1a_tr_maxmin_shifted_angle_root2 |
| vsaq5 | VSAQ | 2 | 83 | Find the range of 13 cos x + 3√3 sin x − 4. | VSAQ | ts_ipe_m1a_tr_range_13cos_3root3sin |
| vsaq7ii | VSAQ | 3 | 83 | Find the value of cos² 112½° − sin² 52½°. | VSAQ | ts_ipe_m1a_tr_cos_sq_112_sin_sq_52 |
| vsaq7iii | VSAQ | 1 | 83 | Find the value of sin² 52½° − sin² 22½°. | VSAQ | ts_ipe_m1a_tr_sin_sq_52_sin_sq_22 (note: NOT the same as our existing `ts_ipe_m1a_tr_vsaq_cos52_sin22` — that card is cos²52½°−sin²22½°, a different PYQ (AP19) with a different first term and a different numeric answer; do not treat it as covering this ref) |
| vsaq8 | VSAQ | 1 | 83 | Prove that cot(π/20) · cot(3π/20) · cot(5π/20) · cot(7π/20) · cot(9π/20) = 1. | VSAQ | ts_ipe_m1a_tr_cot_product_twentieths |
| vsaq9 | VSAQ | 1 | 84 | Prove that cos 12° + cos 84° + cos 132° + cos 156° = −1/2. | VSAQ | ts_ipe_m1a_tr_cos_sum_12_84_132_156 |
| vsaq10 | VSAQ | 0 | 84 | If cos θ + sin θ = √2 cos θ, prove that cos θ − sin θ = √2 sin θ. | VSAQ | ts_ipe_m1a_tr_cos_sin_root2_swap |
| vsaq12 | VSAQ | 3 | 84 | If sec θ + tan θ = 2/3, find sin θ and state the quadrant in which θ lies. | VSAQ | ts_ipe_m1a_tr_sec_plus_tan_two_thirds |
| vsaq15 | VSAQ | 0 | 85 | Find the value of tan 20° + tan 40° + √3 tan 20° tan 40°. | VSAQ | ts_ipe_m1a_tr_tan20_tan40_root3_product |
| vsaq17 | VSAQ | 0 | 85 | Eliminate θ from x = a cos³θ and y = b sin³θ. | VSAQ | ts_ipe_m1a_tr_eliminate_theta_cos_cube_sin_cube |
| vsaq19 | VSAQ | 0 | 85 | If cos θ = −5/13 and π/2 < θ < π, find sin 2θ. | VSAQ | ts_ipe_m1a_tr_sin2theta_from_cos_minus5_13 |
| vsaq20 | VSAQ | 0 | 86 | Prove that tan α = sin 2α/(1 + cos 2α), and use it to obtain the values of tan 15° and tan 22½°. | VSAQ | ts_ipe_m1a_tr_tanalpha_half_angle_derive |
| vsaq21 | VSAQ | 0 | 86 | For what values of x in the first quadrant is (2 tan x)/(1 − tan² x) positive? | VSAQ | ts_ipe_m1a_tr_tan2x_formula_positive_range |
| vsaq22 | VSAQ | 0 | 86 | If A, B, C are the angles of a triangle and none of them equals π/2, prove that tan A + tan B + tan C = tan A tan B tan C. | VSAQ | ts_ipe_m1a_tr_tan_sum_product_triangle (see NOTES — duplicate of vsaq32i) |
| vsaq23 | VSAQ | 0 | 86 | If x = 2 sin θ/(1 + cos θ + sin θ), find the value of (1 − cos θ + sin θ)/(1 + sin θ). | VSAQ | ts_ipe_m1a_tr_half_angle_sub_expression |
| vsaq24 | VSAQ | 0 | 87 | Prove that cos 100° cos 40° + sin 100° sin 40° = 1/2. | VSAQ | ts_ipe_m1a_tr_cos100_cos40_sin100_sin40 |
| vsaq25 | VSAQ | 0 | 87 | If sin α = 1/√10, sin β = 1/√5 and α, β are acute, show that α + β = π/4. | VSAQ | ts_ipe_m1a_tr_alpha_plus_beta_pi4_sin_values |
| vsaq27 | VSAQ | 1 | 87 | Prove that 4(cos 66° + sin 84°) = √3 + √15. | VSAQ | ts_ipe_m1a_tr_four_cos66_sin84 |
| vsaq28i | VSAQ | 0 | 87 | Draw the graph of y = tan x on (−π/2, π/2). | VSAQ; a 1-line graph sketch is well-sized for VSAQ | ts_ipe_m1a_tr_graph_tanx |
| vsaq28ii | VSAQ | 0 | 87 | Draw the graph of y = cos² x on (0, π). | VSAQ | ts_ipe_m1a_tr_graph_cos_sq_x |
| vsaq28iii | VSAQ | 0 | 87 | Draw the graph of y = sin 2x on [−π/2, π/2]. | VSAQ | ts_ipe_m1a_tr_graph_sin2x |
| vsaq29 | VSAQ | 1 | 88 | If A, B, C, D are the angles of a cyclic quadrilateral, prove that (i) sin A − sin C = sin D − sin B and (ii) cos A + cos B + cos C + cos D = 0. | VSAQ; two short identities from one condition — a bit dense for 2 marks, borderline SAQ | ts_ipe_m1a_tr_cyclic_quadrilateral_sin_cos |
| vsaq30 | VSAQ | 0 | 88 | Show that cos⁴α + 2cos²α(1 − 1/sec²α) = 1 − sin⁴α. | VSAQ | ts_ipe_m1a_tr_cos_fourth_plus_term_sin_fourth |
| vsaq31i | VSAQ | 0 | 88 | If A − B = 3π/4, show that (1 − tan A)(1 + tan B) = 2. | VSAQ | ts_ipe_m1a_tr_a_minus_b_3pi4_tan_product |
| vsaq31ii | VSAQ | 3 | 88 | If A + B = π/4, prove that (a) (1 + tan A)(1 + tan B) = 2 and (b) (cot A − 1)(cot B − 1) = 2. | VSAQ; two short parts from one condition, borderline SAQ | ts_ipe_m1a_tr_a_plus_b_pi4_tan_cot_products |
| vsaq32i | VSAQ | 1 | 89 | If A, B, C are the angles of a triangle, prove that tan A + tan B + tan C = tan A tan B tan C. | VSAQ | ts_ipe_m1a_tr_tan_sum_product_triangle (see NOTES — duplicate of vsaq22; author ONCE) |
| vsaq32ii | VSAQ | 1 | 89 | If A, B, C are the angles of a triangle, prove that cot A cot B + cot B cot C + cot C cot A = 1. | VSAQ | ts_ipe_m1a_tr_cot_pairwise_sum_triangle |
| vsaq36i | VSAQ | 3 | 91 | Prove that sin(π/5) sin(2π/5) sin(3π/5) sin(4π/5) = 5/16. | VSAQ | ts_ipe_m1a_tr_sin_product_fifths |
| vsaq36ii | VSAQ | 1 | 91 | Prove that cos(π/11) cos(2π/11) cos(3π/11) cos(4π/11) cos(5π/11) = 1/32. | VSAQ | ts_ipe_m1a_tr_cos_product_elevenths |
| vsaq36iii | VSAQ | 1 | 91 | Prove that cos(2π/7) · cos(4π/7) · cos(8π/7) = 1/8. | VSAQ | ts_ipe_m1a_tr_cos_product_sevenths |
| vsaq39i | VSAQ | 3 | 92 | Prove that sin A sin(π/3 + A) sin(π/3 − A) = (1/4) sin 3A. | VSAQ | ts_ipe_m1a_tr_sin_triple_product_identity |
| vsaq39ii | VSAQ | 3 | 92 | Prove that cos A cos(π/3 + A) cos(π/3 − A) = (1/4) cos 3A. | VSAQ | ts_ipe_m1a_tr_cos_triple_product_identity |
| vsaq39iii | VSAQ | 3 | 92 | Prove that sin 20° sin 40° sin 60° sin 80° = 3/16. | VSAQ | ts_ipe_m1a_tr_sin20_sin40_sin60_sin80 |
| vsaq39iv | VSAQ | 3 | 92 | Prove that cos(π/9) cos(2π/9) cos(3π/9) cos(4π/9) = 1/16. | VSAQ | ts_ipe_m1a_tr_cos_product_ninths (see NOTES — printed stem looks suspect) |
| vsaq40 | VSAQ | 0 | 93 | Prove that (tan θ + sec θ − 1)/(tan θ − sec θ + 1) = (1 + sin θ)/cos θ. | VSAQ | ts_ipe_m1a_tr_tan_sec_ratio_identity |
| vsaq42ii | VSAQ | 0 | 93 | Prove that 1/cos 290° + 1/(√3 sin 250°) = 4/√3. | VSAQ | ts_ipe_m1a_tr_sec290_cosec250_sum |
| vsaq44i | VSAQ | 0 | 95 | Prove that sin 18° = (√5 − 1)/4. | VSAQ | ts_ipe_m1a_tr_sin18_special_value |
| vsaq44ii | VSAQ | 0 | 95 | Prove that cos 36° = (√5 + 1)/4. | VSAQ | ts_ipe_m1a_tr_cos36_special_value |
| vsaq46 | VSAQ | 0 | 96 | If sin(α + β)/sin(α − β) = (a + b)/(a − b), prove that a tan β = b tan α. | VSAQ | ts_ipe_m1a_tr_sin_ratio_a_plus_b |
| vsaq47i | VSAQ | 0 | 96 | If θ is not an integral multiple of π/2, prove that tan θ + 2 tan 2θ + 4 tan 4θ + 8 cot 8θ = cot θ. | VSAQ | ts_ipe_m1a_tr_tan_doubling_chain_cot |
| vsaq47ii | VSAQ | 0 | 96 | If 2A and 3A are not odd multiples of π/2, prove that tan 3A · tan 2A · tan A = tan 3A − tan 2A − tan A. | VSAQ | ts_ipe_m1a_tr_tan3a_tan2a_tana_relation |
| vsaq48 | VSAQ | 0 | 96 | If 3A ≠ (2n + 1)π/2, prove that tan A tan(60° + A) tan(60° − A) = tan 3A, and find the value of tan 6° tan 42° tan 66° tan 78°. | VSAQ | ts_ipe_m1a_tr_tan_60_shift_product |
| laq1ii | LAQ | 0 | 97 | If A, B, C are the angles of a triangle, prove that sin 2A + sin 2B − sin 2C = 4 cos A cos B sin C. | LAQ | ts_ipe_m1a_tr_sin2_sum_minus_c |
| laq1iii | LAQ | 3 | 97 | If A, B, C are the angles of a triangle, prove that sin 2A − sin 2B + sin 2C = 4 cos A sin B cos C. | LAQ | ts_ipe_m1a_tr_sin2_sum_minus_b |
| laq1v | LAQ | 1 | 97 | If A, B, C are the angles of a triangle, prove that cos 2A + cos 2B − cos 2C = 1 − 4 sin A sin B cos C. | LAQ | ts_ipe_m1a_tr_cos2_sum_minus_c |
| laq1vi | LAQ | 3 | 98 | If A, B, C are the angles of a triangle, prove that cos A + cos B + cos C = 1 + 4 sin(A/2) sin(B/2) sin(C/2). | LAQ | ts_ipe_m1a_tr_cos_sum_half_angle_sines |
| laq2i | LAQ | null | 99 | If A + B + C = π, prove that cos²A + cos²B − cos²C = 1 − 2 sin A sin B cos C. | LAQ | ts_ipe_m1a_tr_cos_sq_sum_minus_c |
| laq3ii | LAQ | 3 | 100 | If A + B + C = π, show that cos(A/2) + cos(B/2) − cos(C/2) = 4 cos((π + A)/4) cos((π + B)/4) cos((π − C)/4). | LAQ | ts_ipe_m1a_tr_cos_half_sum_minus_c_pi4 |
| laq3iii | LAQ | 1 | 100 | If A + B + C = π, show that sin(A/2) + sin(B/2) − sin(C/2) = −1 + 4 cos((π − A)/4) cos((π − B)/4) sin((π − C)/4). | LAQ | ts_ipe_m1a_tr_sin_half_sum_minus_c_pi4 |
| laq4 | LAQ | 0 | 101 | If A, B, C are the angles of a triangle, prove that sin A + sin B + sin C = 4 cos(A/2) cos(B/2) cos(C/2). | LAQ | ts_ipe_m1a_tr_sin_sum_half_angle_cosines |
| laq5i | LAQ | 0 | 101 | If A + B + C = π/2, show that sin²A + sin²B + sin²C = 1 − 2 sin A sin B sin C. | LAQ | ts_ipe_m1a_tr_sin_sq_sum_half_pi |
| laq5ii | LAQ | 0 | 101 | If A + B + C = π/2, show that sin 2A + sin 2B + sin 2C = 4 cos A cos B cos C. | LAQ | ts_ipe_m1a_tr_sin2_sum_half_pi |
| laq7i | LAQ | 3 | 102 | If A + B + C = 3π/2, prove that cos 2A + cos 2B + cos 2C = 1 − 4 sin A sin B sin C. | LAQ | ts_ipe_m1a_tr_cos2_sum_three_half_pi |
| laq9 | LAQ | 0 | 103 | If A + B + C = 0, prove that cos²A + cos²B + cos²C = 1 + 2 cos A cos B cos C. | LAQ | ts_ipe_m1a_tr_cos_sq_sum_zero |
| laq11 | LAQ | 0 | 104 | If α − β is not an odd multiple of π/2 and sin(α + β)/cos(α − β) = (1 − m)/(1 + m), prove that tan(π/4 − α) = m tan(π/4 + β). | LAQ | ts_ipe_m1a_tr_tan_quarter_pi_shift_m |
| laq12 | LAQ | 0 | 104 | If none of the denominators is zero, prove that ((cos A + cos B)/(sin A − sin B))ⁿ + ((sin A + sin B)/(cos A − cos B))ⁿ equals 2 cotⁿ((A − B)/2) when n is even and 0 when n is odd. | LAQ | ts_ipe_m1a_tr_cot_power_n_sum |

All 58 proposed ids checked against `ls answer-book/questions/` — zero collisions with any existing file (physics, chemistry, or maths).

---

## 3. MATCHED (34)

| ref | question_id |
|---|---|
| vsaq1i | ts_ipe_m1a_tr_vsaq_period_tan5x |
| vsaq1ii | ts_ipe_m1a_tr_vsaq_period_cos_fraction |
| vsaq2i | ts_ipe_m1a_tr_vsaq_period_sum_squares |
| vsaq2ii | ts_ipe_m1a_tr_vsaq_sine_period_two_thirds |
| vsaq2iii | ts_ipe_m1a_tr_vsaq_cosine_period_seven |
| vsaq3 | ts_ipe_m1a_tr_vsaq_period_cos_3x |
| vsaq6 | ts_ipe_m1a_tr_vsaq_cos9_sin9_cot36 |
| vsaq7i | ts_ipe_m1a_tr_sqp_sin_squared_diff |
| vsaq11 | ts_ipe_m1a_tr_vsaq_3sin_4cos_five |
| vsaq13 | ts_ipe_m1a_tr_vsaq_cos42_cos78_cos162 |
| vsaq14 | ts_ipe_m1a_tr_vsaq_sin330_cos120 |
| vsaq16 | ts_ipe_m1a_tr_vsaq_sin50_sin70_sin10 |
| vsaq18 | ts_ipe_m1a_tr_sqp_sin_four_fifths |
| vsaq26 | ts_ipe_m1a_tr_vsaq_cos48_cos12 |
| vsaq33 | ts_ipe_m1a_tr_sqp_cot_product_one (card's own note: "asking this same question as Very Short Answer question 33") |
| vsaq34 | ts_ipe_m1a_tr_saq_cos_fourth_powers (card's own note: "...question 34") |
| vsaq35i | ts_ipe_m1a_tr_sqp_cos_sq_eighths (card's own note: "...question 35 i") |
| vsaq35ii | ts_ipe_m1a_tr_saq_sin_fourth_powers (card's own note: "...question 35 ii") |
| vsaq37 | ts_ipe_m1a_tr_saq_product_pi_ten (card's own note: "...question 37") |
| vsaq38 | ts_ipe_m1a_tr_saq_cos_a_2a_4a_8a (card's own note: "...question 38" — see NOTES, the numeric deduction sub-part looks unaddressed) |
| vsaq41 | ts_ipe_m1a_tr_vsaq_tan70_tan20 (our card states the mathematically-correct "= 2 tan50°"; the source's own printed defect note says the same) |
| vsaq42i | ts_ipe_m1a_tr_saq_one_over_sin10 (card's own note: "...question 42 i") |
| vsaq42iii | ts_ipe_m1a_tr_saq_root3_csc20 (card's own note: "...question 42 iii") |
| vsaq43 | ts_ipe_m1a_tr_saq_acos2t_bsin2t (card's own note: "...question 43" — condition/conclusion letters a,b are swapped between source and card but it is the identical identity family, verified algebraically, see NOTES) |
| vsaq45i | ts_ipe_m1a_tr_saq_tan_plus_cot (card's own note: "...question 45 i") |
| vsaq45ii | ts_ipe_m1a_tr_saq_cot_minus_tan (card's own note: "...question 45 ii") |
| laq1i | ts_ipe_m1a_tr_sin2a_sum |
| laq1iv | ts_ipe_m1a_tr_cos2a_sum |
| laq1vii | ts_ipe_m1a_tr_cosa_cosb_minus_cosc |
| laq2ii | ts_ipe_m1a_tr_cos_half_squares |
| laq6 | ts_ipe_m1a_tr_sqp_cos_double_half_pi |
| laq8i | ts_ipe_m1a_tr_sin_s_minus_a |
| laq8ii | ts_ipe_m1a_tr_cos_s_minus_a |
| laq10 | ts_ipe_m1a_tr_sqp_sin_double_zero_sum |

---

## 4. ELSEWHERE (0)

None. Every source question I could not match verbatim in this unit's 53 cards was grepped against the entire `answer-book/questions/` directory (all subjects, all units, both papers) for its most distinctive fragment (specific angle values, coefficients, or identity shape). All 58 returned zero hits anywhere else in the bank. I specifically checked the neighbouring maths-1A chapters that could plausibly restate a trig-ratios identity — ch09 Trigonometric Equations (`ts_ipe_m1a_te_*`), ch10 Inverse Trig (`ts_ipe_m1a_it_*`), ch11 Hyperbolic Functions (`ts_ipe_m1a_hf_*`), ch12 Properties of Triangles (`ts_ipe_m1a_pt_*`) — none of their 50 files contain any of the 58 missing identities.

## 5. UNCERTAIN (0)

None. The one genuinely ambiguous case (vsaq7iii, discussed in the MISSING table note) resolved cleanly once I read the candidate card's own provenance note: `ts_ipe_m1a_tr_vsaq_cos52_sin22` documents its own source as a separate, unrelated PYQ (Baby Bullet-Q p.95, AP 2019 appearance) with no cross-reference to this Chaitanya index, and it is mathematically a different value (cos² first term, not sin²; different angle pair: 52½°/22½° vs the sum-of-squares subtraction identity needed for vsaq7iii uses the *same* function both sides). I classified it MISSING rather than UNCERTAIN once that provenance was in hand.

---

## NOTES

**Duplicate source questions (author once, list once):**
- **vsaq22 and vsaq32i are the same identity** (tan A + tan B + tan C = tan A tan B tan C for a triangle's angles) — the source book itself flags this in vsaq22's own `notes` field ("The book asks this identity TWICE — again as Q32 i)... there without the caveat"). Both are listed MISSING above sharing one proposed id `ts_ipe_m1a_tr_tan_sum_product_triangle`; author ONE card. If the "none of them equals π/2" caveat from vsaq22 is worth preserving pedagogically (it rules out tan being undefined), fold it into the single authored card's discussion rather than treating vsaq32i's laxer statement as a second question.

**Source questions whose printed stem looks mathematically suspect (beyond the six the source book's own `notes` field already flags as defects — vsaq4ii's missing part i), vsaq5's uncertain star count, vsaq18's "quasrant" typo, vsaq22/32i's duplication, vsaq36ii's uncertain star count, vsaq36iii's colon-for-dot typo, vsaq38's slash-for-comma typo, vsaq41's false-as-printed identity, laq2i/laq3ii's numbering-break-in-the-gutter, laq9's stray degree sign — one more is worth a second look before authoring):**
- **vsaq39iv**: "Prove that cos(π/9) cos(2π/9) cos(3π/9) cos(4π/9) = 1/16." Note that cos(3π/9) = cos(π/3) = 1/2 exactly, which is an unusually convenient (almost certainly deliberate) simplification baked into the product — worth double-checking against the actual scanned page before authoring, since a "π/9, 2π/9, 3π/9, 4π/9" run is an odd way to write a problem when the third factor trivially collapses; it's plausible the book intends this as designed (reduces to proving cos(π/9)cos(2π/9)cos(4π/9) = 1/8, a known identity) rather than a misprint, but confirm the RHS value (1/16) against that reduced form before committing an answer.
- **vsaq38**: our existing matched card `ts_ipe_m1a_tr_saq_cos_a_2a_4a_8a` proves only the general identity cos A·cos 2A·cos 4A·cos 8A = sin 16A/(16 sin A); its own provenance note says "Only the question was taken" when it was re-cut from a different source book that also asked this as its own VSAQ 38. The Chaitanya source's vsaq38 additionally asks to **deduce** the numeric value cos(2π/15)cos(4π/15)cos(8π/15)cos(16π/15) = 1/16 by substituting A = 2π/15. That deduction step does not appear to be in the existing card's mark split. Recommend the founder either (a) extend the existing card with the deduction step, or (b) treat it as its own micro-follow-up — flagging here rather than silently calling vsaq38 "fully answered."

**No duplicate questions found among the 58 MISSING items themselves** (other than the vsaq22/vsaq32i pair noted above) — I checked each missing stem against every other missing stem for repeated identities under different labels and found none.

**A near-miss worth flagging for whoever authors the missing cards:** our existing card `ts_ipe_m1a_tr_vsaq_cos52_sin22` (cos²52½° − sin²22½° = ...) sits one symbol-swap away from source ref **vsaq7iii** (sin²52½° − sin²22½°, same angle pair, different function on the first term, different numeric answer). When `ts_ipe_m1a_tr_sin_sq_52_sin_sq_22` is authored for vsaq7iii, take care the two cards don't end up looking like accidental duplicates of each other to a future gap-fill pass — they are genuinely different questions sharing an angle pair.
