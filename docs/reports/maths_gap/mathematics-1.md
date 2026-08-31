# Maths-1A Unit 1 — Sets and Relations — coverage vs Sri Chaitanya FAST TRACK

Book questions indexed: 35   |   Our cards in this unit: 26
MATCHED 35 · MISSING 0 · ELSEWHERE 0 · PARTIAL 0 · EXTRA 0

## MISSING — the authoring queue (0)

| ref | section | stars | stem | note |
|---|---|---|---|---|
| — | — | — | — | none found |

## PARTIAL (0)

| ref | our card | what the book also asks |
|---|---|---|
| — | — | none found |

## ELSEWHERE (0)

| ref | where we answer it |
|---|---|
| — | none found |

## MATCHED (35)

| ref | question_id |
|---|---|
| vsaq1 | ts_ipe_m1a_sr_set_builder_form |
| vsaq2 | ts_ipe_m1a_sr_power_set_minus3_0_3 |
| vsaq3i | ts_ipe_m1a_sr_intersections_three_sets |
| vsaq3ii | ts_ipe_m1a_sr_intersections_three_sets |
| vsaq3iii | ts_ipe_m1a_sr_intersections_three_sets |
| vsaq3iv | ts_ipe_m1a_sr_intersections_three_sets |
| vsaq4 | ts_ipe_m1a_sr_cartesian_product_intersection |
| vsaq5 | ts_ipe_m1a_sr_distributive_union_over_intersection |
| vsaq6 | ts_ipe_m1a_sr_a_minus_b_minus_c |
| vsaq7 | ts_ipe_m1a_sr_de_morgan_universal_1_to_7 |
| vsaq8 | ts_ipe_m1a_sr_relation_x_equals_y_domain_range |
| vsaq9 | ts_ipe_m1a_sr_relation_x_plus_y_5_domain_range_codomain |
| vsaq10 | ts_ipe_m1a_sr_parallel_lines_equivalence |
| vsaq11 | ts_ipe_m1a_sr_relation_2x_plus_y_41_properties |
| vsaq12i | ts_ipe_m1a_sr_define_set_and_cardinality |
| vsaq12ii | ts_ipe_m1a_sr_define_set_and_cardinality |
| vsaq13 | ts_ipe_m1a_sr_define_power_set |
| vsaq14 | ts_ipe_m1a_sr_define_symmetric_difference |
| vsaq15i | ts_ipe_m1a_sr_subsets_and_power_set_of_1_2_3 |
| vsaq15ii | ts_ipe_m1a_sr_subsets_and_power_set_of_1_2_3 |
| vsaq15iii | ts_ipe_m1a_sr_subsets_and_power_set_of_1_2_3 |
| vsaq15iv | ts_ipe_m1a_sr_subsets_and_power_set_of_1_2_3 |
| vsaq16 | ts_ipe_m1a_sr_power_set_512_elements |
| vsaq17 | ts_ipe_m1a_sr_symmetric_difference_abcde_acfgh |
| vsaq18 | ts_ipe_m1a_sr_de_morgan_universal_1_to_9 |
| vsaq19 | ts_ipe_m1a_sr_define_cartesian_product |
| vsaq20i | ts_ipe_m1a_sr_cartesian_product_over_union_intersection |
| vsaq20ii | ts_ipe_m1a_sr_cartesian_product_over_union_intersection |
| vsaq20iii | ts_ipe_m1a_sr_cartesian_product_over_union_intersection |
| vsaq21 | ts_ipe_m1a_sr_define_relation |
| vsaq22 | ts_ipe_m1a_sr_define_reflexive_relation |
| vsaq23 | ts_ipe_m1a_sr_define_symmetric_relation |
| vsaq24 | ts_ipe_m1a_sr_define_transitive_relation |
| vsaq25 | ts_ipe_m1a_sr_define_equivalence_relation |
| vsaq26 | ts_ipe_m1a_sr_relation_x_less_than_y |

## EXTRA — our cards with no book counterpart (0)

| question_id | one-line stem |
|---|---|
| — | none found |

## Notes

**Verdict on the "0 missing" discrepancy: the earlier session was RIGHT, and the 35-vs-26 count
gap is fully explained by the book's own inconsistent numbering — not by any uncovered content.**
This session re-derived the diff independently, at the level of actual solved steps (not just
stems), and found zero gaps.

**Why 35 book refs collapse to 26 real questions.** The source book itself is inconsistent about
how it numbers a multi-part VSAQ:
- Two multi-part questions (vsaq7, vsaq18 — both "show the two De Morgan laws") are printed as
  ONE indexed question each, with sub-parts (i)/(ii) folded inside a single `stem`.
- Four other multi-part questions are instead split across MULTIPLE index entries, one per
  sub-part: vsaq3 → vsaq3i/ii/iii/iv (4 refs), vsaq12 → vsaq12i/ii (2 refs), vsaq15 →
  vsaq15i/ii/iii/iv (4 refs), vsaq20 → vsaq20i/ii/iii (3 refs). That is 13 refs standing in for
  4 real questions.

  22 singly-indexed questions + 13 refs covering 4 multi-part questions = 35 book refs.
  22 + 4 = 26 real questions — exactly the 26 cards in our bank.

Our bank already bundles each of those four multi-part questions into ONE card apiece (e.g.
`ts_ipe_m1a_sr_intersections_three_sets` carries all of A∩B, A∩C, B∩C, A∩B∩C), which is the same
bundling choice the book itself made for vsaq7/vsaq18. Per the task's own equivalence rule
("solving one solves the other"), a bundled card that genuinely works every sub-part is a full
match for every ref that sub-part maps to — it is not a partial match and not a missing gap.

**This was checked at the content level, not just by ref name.** I opened the actual answer-book
JSON (`question_text`, `mark_split`, and `answer.steps[].lines`) for all four bundled cards plus
both De Morgan cards and confirmed the solved steps literally work every lettered sub-part the
book asks:
- `ts_ipe_m1a_sr_intersections_three_sets` — steps compute (i) A∩B, (ii) A∩C, (iii) B∩C, then
  (iv) A∩B∩C from (i).
- `ts_ipe_m1a_sr_subsets_and_power_set_of_1_2_3` — steps give (i) |A|=3, (ii) |P(A)|=8, (iii) all
  8 subsets listed, (iv) the power set written out.
- `ts_ipe_m1a_sr_cartesian_product_over_union_intersection` — steps give (i) A×(B∪C),
  (ii) A×(B∩C), (iii) (A×B)∪(A×C), with the (i)=(iii) equality shown.
- `ts_ipe_m1a_sr_define_set_and_cardinality` — steps define both "a set" and "cardinality of a
  finite set" in full, each with its own worked example.
- `ts_ipe_m1a_sr_de_morgan_universal_1_to_7` and `..._1_to_9` — the one drill-repeat pair in this
  chapter (same De Morgan method, different U/A/B data) is already authored as two SEPARATE cards,
  matching vsaq7 and vsaq18 respectively one-to-one — so this is not a collapsed repeat needing a
  MISSING row.

No other same-method/different-data repeats exist in this chapter (Sets and Relations is short,
mostly definitional, and each computational VSAQ uses a distinct set/relation), so the "different
data, mark MISSING" rule from the task brief does not apply anywhere else in this unit.

**Scope caveat carried over from the source files themselves:** every card's `verification.status`
is `unverified` / `needs_teacher_verification: true` — the mark splits here are this bank's own
1+1 convention for a Maths-1A Section A question, not a TSBIE-confirmed split, because Sets and
Relations is new to the 2026-27 syllabus and has no board-paper history (`appearances: []` on
every card checked). That is a verification-status caveat, not a coverage gap, and is unrelated to
this diff's MATCHED/MISSING classification.

**Conclusion:** all 35 indexed book question-instances in this chapter are answered in the bank.
Zero authoring queue for Unit 1.
