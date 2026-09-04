# Diff report — Maths-1A Chapter 12, Properties of Triangles (unit 12, `ts_ipe_m1a_pt_*`)

Source: `answer-book/sources/chaitanya_m1a_ch12_properties_of_triangles.json` (32 questions)
Ours: `answer-book/wip/maths_gap/chaitanya_m1a_ch12_properties_of_triangles__ours.txt` (23 cards)

## Tally

**32 source questions = 17 matched + 0 elsewhere + 15 missing + 0 uncertain**

This agrees with the earlier independent pass's count of 15 MISSING — no disagreement to report.

Method note: for every unmatched source question I grepped the whole bank (`answer-book/questions/*.json`)
for the question's distinctive expression (`cot(A/2)`, `excircle`/`incircle`, `equilateral`,
`right angled`, `cos A + cos B + cos C`, `4R cos C`, `8R`, `b − c`, etc.), and specifically checked
unit 8 (Trig Ratios, `ts_ipe_m1a_tr_*`) as the likely neighbour, since several of these are
half-angle/cot identities that could plausibly be misfiled as generic trig identities. No hits
corresponded to any of the 15 missing questions — all 15 are genuinely absent from the bank.

## MISSING (15)

| ref | book section | stars | printed_page | stem (verbatim) | proposed_qtype | proposed question_id |
|---|---|---|---|---|---|---|
| vsaq3 | VSAQ | 0 | 121 | Show that in △ABC, tan((B − C)/2) = ((b − c)/(b + c)) cot(A/2). | VSAQ (2M) | `ts_ipe_m1a_pt_tan_half_bc_diff` |
| vsaq5i | VSAQ | 3 | 122 | In △ABC, prove that tan(A/2) + tan(B/2) + tan(C/2) = (bc + ca + ab − s²)/Δ. | VSAQ (2M) | `ts_ipe_m1a_pt_tan_half_sum` |
| vsaq9 | VSAQ | 0 | 123 | Show that in △ABC, a = b cos C + c cos B. | VSAQ (2M) | `ts_ipe_m1a_pt_projection_formula` |
| vsaq11 | VSAQ | 1 | 123 | In △ABC, show that (b − c)² cos²(A/2) + (b + c)² sin²(A/2) = a². | VSAQ (2M) | `ts_ipe_m1a_pt_b_minus_c_sq_cos_half` |
| vsaq12 | VSAQ | 1 | 123 | In △ABC, if cot(A/2), cot(B/2), cot(C/2) are in A.P., prove that a, b, c are in A.P. | VSAQ (2M) | `ts_ipe_m1a_pt_cot_half_ap_sides_ap` |
| vsaq13 | VSAQ | 1 | 124 | If A, A₁, A₂, A₃ are the areas of the incircle and the three excircles of a triangle respectively, prove that 1/√A₁ + 1/√A₂ + 1/√A₃ = 1/√A. | VSAQ (2M) | `ts_ipe_m1a_pt_incircle_excircle_areas` |
| vsaq14 | VSAQ | 0 | 124 | If cos A + cos B + cos C = 3/2, show that the triangle is equilateral. | VSAQ (2M) | `ts_ipe_m1a_pt_cos_sum_3_2_equilateral` |
| vsaq15 | VSAQ | 0 | 125 | If tan(A/2) = 5/6 and tan(C/2) = 2/5, determine the relation between a, b and c. | VSAQ (2M) | `ts_ipe_m1a_pt_tan_half_5_6_2_5` |
| vsaq16 | VSAQ | 0 | 125 | If b + c = 3a, find the value of cot(B/2) cot(C/2). | VSAQ (2M) | `ts_ipe_m1a_pt_b_plus_c_3a_cot_half` |
| saq3II | SAQ | 1 | 126 | If p₁, p₂, p₃ are the altitudes drawn from the vertices A, B, C of △ABC to the opposite sides, show that 1/p₁² + 1/p₂² + 1/p₃² = (cot A + cot B + cot C)/Δ. | SAQ (4M) | `ts_ipe_m1a_pt_altitudes_reciprocal_squares` |
| saq5 | SAQ | 3 | 127 | In △ABC, show that cos A + cos B + cos C = 1 + r/R. | SAQ (4M) | `ts_ipe_m1a_pt_cos_sum_1_plus_r_over_r` |
| saq8 | SAQ | 3 | 129 | In △ABC, show that r + r₁ + r₂ − r₃ = 4R cos C. | SAQ (4M) | `ts_ipe_m1a_pt_r_r1_r2_minus_r3` |
| saq9ii | SAQ | 1 | 130 | In △ABC, if r₁ + r₂ = r₃ − r, show that C = 90°. | SAQ (4M) | `ts_ipe_m1a_pt_r1_plus_r2_eq_r3_minus_r` |
| saq10 | SAQ | 1 | 130 | In △ABC, if a² + b² + c² = 8R², prove that the triangle is right angled. | SAQ (4M) | `ts_ipe_m1a_pt_sum_squares_8r2_right_angled` |
| saq11 | SAQ | 0 | 131 | Prove that r₁(r₂ + r₃)/√(r₁r₂ + r₂r₃ + r₃r₁) = a. | SAQ (4M) | `ts_ipe_m1a_pt_r1_r2_r3_over_sqrt` |

All 15 proposed ids were checked against `ls answer-book/questions/ | grep m1a_pt` (23 existing ids,
listed below under NOTES) — no collisions.

## MATCHED (17)

| ref | question_id |
|---|---|
| vsaq1 | `ts_ipe_m1a_pt_saq_c_is_60` |
| vsaq2i | `ts_ipe_m1a_pt_a_eq_b_minus_c_sec` |
| vsaq2ii | `ts_ipe_m1a_pt_a_eq_b_plus_c_cos` |
| vsaq2iii | `ts_ipe_m1a_pt_sin_theta_a_over_b_plus_c` |
| vsaq4 | `ts_ipe_m1a_pt_ratio_789` |
| vsaq5ii | `ts_ipe_m1a_pt_saq_cot_half_sum` |
| vsaq6 | `ts_ipe_m1a_pt_saq_cot_sum` |
| vsaq7 | `ts_ipe_m1a_pt_saq_cos_over_a` |
| vsaq8 | `ts_ipe_m1a_pt_saq_reciprocal_squares` |
| vsaq10 | `ts_ipe_m1a_pt_saq_a_sq_cot` |
| saq1 | `ts_ipe_m1a_pt_13_14_15` |
| saq2i | `ts_ipe_m1a_pt_prove_345` |
| saq2ii | `ts_ipe_m1a_pt_find_abc_from_r` |
| saq3I | `ts_ipe_m1a_pt_altitudes` |
| saq4 | `ts_ipe_m1a_pt_cot_half_ratio` |
| saq6 | `ts_ipe_m1a_pt_saq_r1_r2_r3_minus_r` |
| saq7 | `ts_ipe_m1a_pt_saq_r_r3_r1_minus_r2` |

## ELSEWHERE (0)

None. Unit 8 (`ts_ipe_m1a_tr_*`, Trig Ratios) was checked by keyword (`cot(A/2)`, `cos²(A/2)`,
`b cos C`) — the hits were all generic trig-identity cards (`tr_cos_half_squares`,
`tr_sin_half_squares`, `tr_cos2a_sum`, etc.) with no side lengths a/b/c, R, r, r₁–r₃, or s, Δ — none
are properties-of-triangles content, so none are ELSEWHERE matches for this chapter's questions.

## UNCERTAIN (0)

None — every one of the 32 source refs classified cleanly as MATCHED or MISSING.

## NOTES

- **Printed defect tied to a MISSING item (actionable at authoring time):** the source index flags
  saq3II — "If p₁, p₂, p₃ are the altitudes ... show that 1/p₁² + 1/p₂² + 1/p₃² = (cot A + cot B +
  cot C)/Δ" — as printed with "the centers of altitudes" where "the lengths of the altitudes p₁, p₂,
  p₃ (same as part I)" is clearly meant. When this card is authored, write it as lengths, matching
  the existing `ts_ipe_m1a_pt_altitudes` card's phrasing, not the printed wording.
- **Printed defect, not actionable:** saq9 prints only a "*ii)" sub-part — question 9's "i)" stem was
  never printed on the page, so there is no 9i) to author; `saq9ii` (→ `C = 90°`) is the only part
  that exists.
- **No duplicate source questions found** among the 32 refs.
- **No mathematically wrong or ill-posed stems found** among the 15 missing questions. Spot-checked
  vsaq4's ratio identity (a:b:c = 7:8:9 ⇒ cos A:cos B:cos C = 14:11:6, verified by law of cosines)
  against the already-matched card `ts_ipe_m1a_pt_ratio_789` for consistency with the source book's
  general accuracy level in this chapter; no other numeric identity among the 15 missing questions
  looked internally contradictory.
- **No triangle diagrams needed.** All 15 missing questions are symbolic identity proofs/derivations
  in the standard triangle-properties notation (a, b, c, A, B, C, R, r, r₁, r₂, r₃, s, Δ) — the same
  style as every existing `pt_*` card, none of which carry a figure. None require a drawn diagram.
- **Six existing `pt_*` cards in our bank don't correspond to any of these 32 source refs** and were
  excluded from the matching (their content doesn't restate any printed stem here — most notably two
  are tagged `[LAQ]` even though the source explicitly states this chapter prints no long-answer
  block at all): `ts_ipe_m1a_pt_a_cos_sq_half` (LAQ), `ts_ipe_m1a_pt_r1_over_bc` (LAQ),
  `ts_ipe_m1a_pt_saq_cot_ratio_357` (a specific 3:5:7 ratio variant, not the A.P.-condition question
  vsaq12), `ts_ipe_m1a_pt_saq_cos_ab_ratio`, `ts_ipe_m1a_pt_saq_four_r1r2_sum`, and
  `ts_ipe_m1a_pt_saq_sec_squared_equal`. These are presumably authored from a different source and
  are left untouched; they simply don't reduce the MISSING count.
