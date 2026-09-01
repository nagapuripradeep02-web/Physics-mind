# Diff report — mathematics_1b unit 4: Pair of Straight Lines (Maths-1B)

Source: `answer-book/sources/chaitanya_m1b_ch04_pair_of_straight_lines.json` (21 indexed questions)
Ours: `answer-book/wip/maths_gap/chaitanya_m1b_ch04_pair_of_straight_lines__ours.txt` (15 cards)

## Tally

21 source questions = 14 matched + 0 elsewhere + 7 missing + 0 uncertain

(Earlier pass reported MISSING = 7 — confirmed, same count.)

## MISSING

| ref | book section | stars | printed_page | stem (verbatim) | proposed_qtype | proposed question_id |
|---|---|---|---|---|---|---|
| saq2 | SAQ | 3 | 163 | If ax² + 2hxy + by² = 0 represents a pair of straight lines, show that the angle θ between the two lines is given by cos θ = ±(a + b) / √((a − b)² + 4h²). | SAQ | `ts_ipe_m1b_pl_angle_between_lines_proof` |
| saq14i | SAQ | 1 | 169 | Find the centroid and the area of the triangle formed by the lines 12x² − 20xy + 7y² = 0 and 2x − 3y + 4 = 0. | SAQ | `ts_ipe_m1b_pl_centroid_area_12x2_20xy_7y2` |
| saq14ii | SAQ | 1 | 169 | Find the centroid and the area of the triangle formed by the lines 2y² − xy − 6x² = 0 and x + y + 4 = 0. | SAQ | `ts_ipe_m1b_pl_centroid_area_2y2_xy_6x2` |
| saq15i | SAQ | 0 | 170 | Show that the lines represented by (lx + my)² − 3(mx − ly)² = 0 together with the line lx + my + n = 0 form an equilateral triangle whose area is n² / (√3(l² + m²)) square units. | SAQ | `ts_ipe_m1b_pl_equilateral_triangle_general_proof` |
| saq15ii | SAQ | 0 | 171 | Show that the lines (x + 2a)² − 3y² = 0 and x = a form an equilateral triangle, and find the area of that triangle. | SAQ | `ts_ipe_m1b_pl_equilateral_triangle_x_plus_2a` |
| saq17i | SAQ | 1 | 172 | Show that the pair of lines 6x² − 5xy − 6y² = 0 and the pair 6x² − 5xy − 6y² + x + 5y − 1 = 0 form a square. | SAQ | `ts_ipe_m1b_pl_square_6x2_minus_5xy_minus_6y2` |
| saq17ii | SAQ | 1 | 172 | Show that the pair of lines 3x² + 8xy − 3y² = 0 and the pair 3x² + 8xy − 3y² + 2x − 4y − 1 = 0 form a square. | SAQ | `ts_ipe_m1b_pl_square_3x2_plus_8xy_minus_3y2` |

All seven proposed ids verified against `ls answer-book/questions/ | grep m1b_pl` — no collision.

`proposed_qtype = SAQ` for all seven, matching the LIVE convention already in the bank — every existing
`ts_ipe_m1b_pl_*` card was verified to carry `qtype: "SAQ"`, `marks_total: 4`, `paper_section: "Section B"`
(checked `pl_area_triangle_proof`, `pl_check_3x2_7xy_2y2`, `pl_sqp_centroid_and_area`,
`pl_pair_conditions_proof`), matching the book's own filing (banner: "Short Answer Questions", 2×4M=8M).

## MATCHED

| ref | question_id |
|---|---|
| saq1 | `ts_ipe_m1b_pl_product_perpendiculars_proof` |
| saq3 | `ts_ipe_m1b_pl_area_triangle_proof` |
| saq4 | `ts_ipe_m1b_pl_angular_bisectors_proof` |
| saq5 | `ts_ipe_m1b_pl_parallel_lines_conditions_proof` |
| saq6 | `ts_ipe_m1b_pl_pair_conditions_proof` |
| saq7 | `ts_ipe_m1b_pl_sqp_product_perpendiculars_origin` |
| saq8 | `ts_ipe_m1b_pl_homog_find_k_perpendicular` |
| saq9 | `ts_ipe_m1b_pl_homog_angle_3x_minus_y_plus_1` |
| saq10 | `ts_ipe_m1b_pl_homog_perpendicular_x2_minus_xy` |
| saq11 | `ts_ipe_m1b_pl_chord_coincident_condition` |
| saq12 | `ts_ipe_m1b_pl_chord_right_angle_condition` |
| saq13 | `ts_ipe_m1b_pl_homog_perpendicular_7x2_minus_4xy` |
| saq16 | `ts_ipe_m1b_pl_check_2x2_minus_13xy` |
| saq18 | `ts_ipe_m1b_pl_check_3x2_7xy_2y2` |

## ELSEWHERE

None.

## UNCERTAIN

None.

## NOTES

- **Known scope gap** (per task brief): `ts_ipe_m1b_pl_homog_perpendicular_7x2_minus_4xy` (matched to saq13)
  answers only the "show mutually perpendicular" conclusion for the curve
  7x² − 4xy + 8y² + 2x − 4y − 8 = 0 with line 3x − y = 2, but the book's saq13 also asks to "find the equation
  of the pair of lines" first. Classified MATCHED per instructions; flagged here, not re-authored.
- **Known scope gap** (per task brief): `ts_ipe_m1b_pl_pair_conditions_proof` (matched to saq6) is a two-part
  proof (Δ = abc + 2fgh − af² − bg² − ch² = 0, AND h² ≥ ab, g² ≥ ac, f² ≥ bc) — flagged for a teacher as two
  questions in one. Classified MATCHED per instructions; flagged here, not re-authored.
- The source file's `section_label_conflict` field claims "Our bank holds all 15 of its rows for this unit as
  LAQ at 8 marks" — this is now **stale**. The live bank (checked 2026-08-31) files every `ts_ipe_m1b_pl_*`
  card as `qtype: SAQ`, `marks_total: 4`, matching the book's own SAQ filing. A prior re-cut (documented
  elsewhere as the 2026-27 syllabus retrofit) evidently corrected this after the source index was written.
  The 7 new cards proposed above follow the live SAQ/4 convention, not the stale note.
- `ts_ipe_m1b_pl_sqp_centroid_and_area` (lines 3x² − 4xy + y² = 0, 2x − y = 6) is an extra card in our bank
  that matches none of this chapter's 21 source refs — it is a different numeric case from both saq14i and
  saq14ii. Left alone; not part of this diff's scope.
- No mathematically wrong or ill-posed stems spotted beyond the OCR/print typos the source file already
  flags (e.g. "repsresents", "equllateral", "follwoing", the dropped "rep-" in saq18's "resents a pair").
