# Maths-1B U4 Pair of Straight Lines — coverage vs Sri Chaitanya FAST TRACK

Book questions indexed: 21   |   Our cards in this unit: 15
MATCHED 13 · MISSING 7 · ELSEWHERE 0 · PARTIAL 1 · EXTRA 1

## MISSING — the authoring queue (7)
| ref | section | stars | stem | note |
|---|---|---|---|---|
| saq2 | SAQ | 3 | If ax²+2hxy+by²=0 represents a pair of straight lines, show that the angle θ between the two lines is given by cos θ = ±(a+b)/√((a−b)²+4h²). | no card in the bank proves the general angle-between-a-pair formula |
| saq14i | SAQ | 1 | Find the centroid and the area of the triangle formed by the lines 12x²−20xy+7y²=0 and 2x−3y+4=0. | same method as ts_ipe_m1b_pl_sqp_centroid_and_area, different data |
| saq14ii | SAQ | 1 | Find the centroid and the area of the triangle formed by the lines 2y²−xy−6x²=0 and x+y+4=0. | same method as ts_ipe_m1b_pl_sqp_centroid_and_area, different data |
| saq15i | SAQ | 0 | Show that the lines (lx+my)²−3(mx−ly)²=0 together with lx+my+n=0 form an equilateral triangle whose area is n²/(√3(l²+m²)). | no equilateral-triangle-from-pair-of-lines card exists in the bank |
| saq15ii | SAQ | 0 | Show that the lines (x+2a)²−3y²=0 and x=a form an equilateral triangle, and find its area. | same topic as saq15i (equilateral triangle from pair), different/numeric data; no card of this type exists |
| saq17i | SAQ | 1 | Show that the pair of lines 6x²−5xy−6y²=0 and the pair 6x²−5xy−6y²+x+5y−1=0 form a square. | no "pair-of-pairs form a square" card exists in the bank |
| saq17ii | SAQ | 1 | Show that the pair of lines 3x²+8xy−3y²=0 and the pair 3x²+8xy−3y²+2x−4y−1=0 form a square. | same method as saq17i, different data; no card exists |

## PARTIAL (1)
| ref | our card | what the book also asks |
|---|---|---|
| saq13 | ts_ipe_m1b_pl_homog_perpendicular_7x2_minus_4xy | Book (saq13) asks two deliverables: (1) find/state the equation of the pair of lines joining the origin to the intersection points, and (2) find the angle between those lines. Our card derives the homogenised pair −8x²+8y²+xy=0 internally at step[2] ("Simplify to ax²+2hxy+by²=0") but never states it as a boxed/final deliverable, and answers only the angle deliverable (as "mutually perpendicular", i.e. the specific 90° case). This CONFIRMS the flagged known issue. |

## ELSEWHERE (0)
None found. Pair-of-straight-lines technique (homogenisation, bisector pair, parallel-pair conditions, equilateral/square constructions from a pair) is chapter-specific; no overlap was found with Locus, Transformation of Axes, or The Straight Line units.

## MATCHED (13)
| ref | question_id |
|---|---|
| saq1 | ts_ipe_m1b_pl_product_perpendiculars_proof |
| saq3 | ts_ipe_m1b_pl_area_triangle_proof |
| saq4 | ts_ipe_m1b_pl_angular_bisectors_proof |
| saq5 | ts_ipe_m1b_pl_parallel_lines_conditions_proof |
| saq6 | ts_ipe_m1b_pl_pair_conditions_proof |
| saq7 | ts_ipe_m1b_pl_sqp_product_perpendiculars_origin |
| saq8 | ts_ipe_m1b_pl_homog_find_k_perpendicular |
| saq9 | ts_ipe_m1b_pl_homog_angle_3x_minus_y_plus_1 |
| saq10 | ts_ipe_m1b_pl_homog_perpendicular_x2_minus_xy |
| saq11 | ts_ipe_m1b_pl_chord_coincident_condition |
| saq12 | ts_ipe_m1b_pl_chord_right_angle_condition |
| saq16 | ts_ipe_m1b_pl_check_2x2_minus_13xy |
| saq18 | ts_ipe_m1b_pl_check_3x2_7xy_2y2 |

## EXTRA — our cards with no book counterpart (1)
| question_id | one-line stem |
|---|---|
| ts_ipe_m1b_pl_sqp_centroid_and_area | Find the centroid and area of the triangle formed by 3x²−4xy+y²=0 and 2x−y=6 — same METHOD as book's saq14i/ii (centroid+area of triangle formed by a homogeneous pair and a line) but its numeric data matches neither book instance, so it is not a literal 1:1 match to either. |

## Notes

**Known issue 1 — CONTRADICTED.** The card `ts_ipe_m1b_pl_pair_conditions_proof` (matched to saq6) was flagged as "two questions in one" with "no honest integer mark split at four marks." Checked directly: `marks_total` is 4, and `mark_split` is `[1, 1, 1, 1]` — four honest integer marks. Reading the step content, the split is content-proportionate: part (a) "Δ = abc+2fgh−af²−bg²−ch² = 0" takes 3 marks across three genuinely separate algebraic steps (split-and-match coefficients, build 8fgh, reduce to the Δ form), and part (b) "h²≥ab, f²≥bc, g²≥ac" is a legitimately short 1-mark proof (one inequality worked in full, the other two dismissed by "Similarly" — a standard board-answer shortcut, not padding). The book's own saq6 is also filed as ONE 4-mark question bundling both parts under a single instruction/setup, so our card's structure matches the source. **Not confirmed as a defect** as currently authored — this may be residue from a since-fixed state (commit `eac66a07` "reconcile three insider notes with the re-cut mark scheme" is a plausible candidate).

**Known issue 2 — CONFIRMED.** `ts_ipe_m1b_pl_homog_perpendicular_7x2_minus_4xy` (matched to saq13) answers only the "are the lines perpendicular?" half of the book's two-part ask. See PARTIAL table above.

**Stale note in the book source file itself.** `chaitanya_m1b_ch04_...json`'s `chapter.section_label_conflict` field claims "Our bank holds all 15 of its rows for this unit as LAQ at 8 marks" — this is **out of date**. Verified live: all 15 cards in `mathematics_1b-4.json` are `qtype: "SAQ"`, `marks_total: 4`, `paper_section: "Section B"`, matching the book's own 4-mark banner (`2 x 4M = 8M`) exactly. No coverage gap follows from this; it is a documentation artifact of the source-index file, not a bank defect. Flagging so it doesn't get re-litigated as a live issue.

**saq5's stem repeats a distance formula twice** ("2√((g²−ac)/(a(a+b))) = 2√((f²−bc)/(b(a+b)))") as one deliverable — our card's part (iii) matches this as authored (both forms given). No gap.

**On the two "form a square" (saq17i/ii) and two "equilateral triangle" (saq15i/ii) items**: these are the biggest structural gap in this unit — an entire technique family (proving a geometric shape from a pair-of-lines-plus-line construction) has zero representation in the bank. Recommend authoring at minimum one general/symbolic card per family (saq15i, saq17i) plus deciding whether the numeric companions (saq15ii, saq17ii) are worth a second card or can be folded into insider_note as a "drill variant."
