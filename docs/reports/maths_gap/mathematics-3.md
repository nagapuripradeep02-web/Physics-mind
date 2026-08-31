# Maths-1A Unit 3 — Sequences and Series — coverage vs Sri Chaitanya FAST TRACK

Book questions indexed: 25   |   Our cards in this unit: 25
MATCHED 25 · MISSING 0 · ELSEWHERE 0 · PARTIAL 0 · EXTRA 0

## MISSING — the authoring queue (0)
| ref | section | stars | stem | note |
|---|---|---|---|---|
| (none) | | | | |

## PARTIAL (0)
| ref | our card | what the book also asks |
|---|---|---|
| (none) | | |

## ELSEWHERE (0)
| ref | where we answer it |
|---|---|
| (none) | |

## MATCHED (25)
| ref | question_id |
|---|---|
| vsaq1 | ts_ipe_m1a_ss_ap_10th_term_3_5_7_9 |
| vsaq2 | ts_ipe_m1a_ss_ap_mth_n_nth_m_shows_zero |
| vsaq3 | ts_ipe_m1a_ss_ap_35th_term_69_sum_69 |
| vsaq4 | ts_ipe_m1a_ss_gp_which_term_is_320 |
| vsaq5 | ts_ipe_m1a_ss_gp_three_numbers_sum_43_product_216 |
| vsaq6 | ts_ipe_m1a_ss_sum_8_88_888_n_terms |
| vsaq7 | ts_ipe_m1a_ss_infinite_gp_one_third_ratio |
| vsaq8 | ts_ipe_m1a_ss_am_10_gm_8_find_numbers |
| vsaq9 | ts_ipe_m1a_ss_sum_6_times_gm_ratio |
| vsaq10 | ts_ipe_m1a_ss_am_gm_ratio_m_n |
| vsaq11 | ts_ipe_m1a_ss_ap_cd_3_15th_term_37_second_term |
| vsaq12 | ts_ipe_m1a_ss_ap_mth_1_over_n_nth_1_over_m |
| vsaq13 | ts_ipe_m1a_ss_sum_2_3_5_6_8_9_2n_terms |
| vsaq14 | ts_ipe_m1a_ss_insert_five_am_between_8_and_26 |
| vsaq15 | ts_ipe_m1a_ss_gp_5th_term_4_8_16 |
| vsaq16 | ts_ipe_m1a_ss_gp_third_term_4_product_first_five |
| vsaq17 | ts_ipe_m1a_ss_sum_0_7_0_77_0_777_n_terms |
| vsaq18 | ts_ipe_m1a_ss_infinite_gp_one_third_minus_two_ninths |
| vsaq19 | ts_ipe_m1a_ss_infinite_sum_n_over_2_power |
| vsaq20 | ts_ipe_m1a_ss_infinite_gp_sum_one_third_first_one_fourth |
| vsaq21 | ts_ipe_m1a_ss_insert_three_gm_between_1_and_81 |
| vsaq22 | ts_ipe_m1a_ss_am_34_gm_16_find_numbers |
| vsaq23 | ts_ipe_m1a_ss_one_gm_two_am_identity |
| vsaq24 | ts_ipe_m1a_ss_am_x_two_gm_y_z_identity |
| vsaq25 | ts_ipe_m1a_ss_sum_1_2_2_3_3_4_n_terms |

## EXTRA — our cards with no book counterpart (0)
| question_id | one-line stem |
|---|---|
| (none) | |

## Notes

**The "0 missing" verdict from the previous session HOLDS, and this session verified it individually
rather than trusting the near-equal counts.** All 25 book questions were checked against the bank row
by `ref` (both files use identical `vsaqN` refs, same section VSAQ, same numbering, same star rating 0),
and 9 of the 25 (36% — vsaq6, vsaq9, vsaq10, vsaq13, vsaq16, vsaq18, vsaq19, vsaq23, vsaq24) were opened
in `answer-book/questions/<question_id>.json` and read in full. In every one of those 9:

- `question_text` is **verbatim identical** to the book's `stem` (not just mathematically equivalent —
  character-for-character the same wording, including the specific numbers/letters used).
- The `verification.note` cites the **exact book page and item number** (e.g. "book p.21 … Very Short
  Answer question 9" for vsaq9, "book p.22 … question 16" for vsaq16), confirming the card was authored
  directly against this book's numbering, not against a different source that happened to produce a
  similar-looking id.
- The worked solution is mathematically correct and internally consistent (e.g. vsaq16's symmetric
  a/r², a/r, a, ar, ar² trick correctly gives 4⁵ = 1024; vsaq6's 8,88,888 sum correctly resolves to
  (8/81)(10ⁿ⁺¹ − 9n − 10); vsaq9/vsaq10's twin componendo-dividendo proofs are structurally identical
  and both correct).

The remaining 16 were confirmed by exact stem-text match alone (both files' `text`/`stem` fields are
already full, non-terse restated sentences — none needed the "text too terse, open the question file"
fallback) plus identical `ref`/`section`/`number`/`stars` alignment, which given the 9-file sample's
100% hit rate on page+item-number provenance is strong enough not to warrant opening every remaining
file.

No repeated-drill case existed to test the "same method, different data → MISSING" rule — the book's
25 VSAQs are already all distinct problems (no two share both method and numbers), and none of the 25
bank cards is a duplicate of another within this unit.

Context: Sequences and Series is new to the 2026-27 first-year Telangana syllabus (confirmed by every
sampled card's own `verification.note`: "Sequences and Series is NEW to the 2026-27 Telangana syllabus,
so this question has never appeared on a board paper — appearances[] is empty"), so — as expected for a
freshly-typeset chapter — the source book carries only VSAQ-weight (2-mark) questions with zero star
ratings and no SAQ/LAQ entries, and the bank mirrors that shape exactly (25 VSAQ cards, no SAQ/LAQ rows
for this unit). The bank's mark split (1+1) and worked-solution content are the bank's own authored
work, not sourced from the book (the book prints no mark allocation or solutions at all), per each
card's `verification.note` — this diff only checks question coverage, not the split's correctness.
