# Diff report — Maths-1A ch.11 Hyperbolic Functions

Source: `answer-book/sources/chaitanya_m1a_ch11_hyperbolic_functions.json` (14 questions)
Ours: `answer-book/wip/maths_gap/chaitanya_m1a_ch11_hyperbolic_functions__ours.txt` (10 cards)

## Tally

**14 source questions = 7 matched + 0 elsewhere + 7 missing + 0 uncertain**

The chapter has only one printed section (Very Short Answer Questions) — every ref below is VSAQ.
My missing count (7) matches the earlier pass's number.

## MATCHED

| ref | question_id |
|---|---|
| vsaq1 | ts_ipe_m1a_hf_cosh_five_halves |
| vsaq2 | ts_ipe_m1a_hf_sinh_three_quarters |
| vsaq3i | ts_ipe_m1a_hf_cosh_minus_sinh_n |
| vsaq3ii | ts_ipe_m1a_hf_cosh_plus_sinh_n |
| vsaq4i | ts_ipe_m1a_hf_sinh_three |
| vsaq4ii | ts_ipe_m1a_hf_sinh_five |
| vsaq6 | ts_ipe_m1a_hf_tanh_half |

## MISSING

| ref | book section | stars | printed_page | stem (verbatim) | proposed_qtype | proposed question_id |
|---|---|---|---|---|---|---|
| vsaq5 | VSAQ | 0 | 118 | If cosh x = 3, show that x = logₑ(3 + √8). | VSAQ (2m) | ts_ipe_m1a_hf_cosh_three |
| vsaq7 | VSAQ | 1 | 118 | For any x ∈ R, prove that cosh⁴x − sinh⁴x = cosh 2x. | VSAQ (2m) | ts_ipe_m1a_hf_cosh4_minus_sinh4 |
| vsaq8i | VSAQ | 0 | 118 | For x, y ∈ R, prove that sinh(x + y) = sinh x cosh y + cosh x sinh y. | VSAQ (2m) | ts_ipe_m1a_hf_sinh_sum_formula |
| vsaq8ii | VSAQ | 0 | 118 | For x, y ∈ R, prove that cosh(x + y) = cosh x cosh y + sinh x sinh y. | VSAQ (2m) | ts_ipe_m1a_hf_cosh_sum_formula |
| vsaq9 | VSAQ (theorem) | 0 | 118 | For any x ∈ R, prove that sinh⁻¹x = logₑ(x + √(x² + 1)). | VSAQ (2m) | ts_ipe_m1a_hf_sinh_inverse_log_form |
| vsaq10 | VSAQ (theorem) | 0 | 119 | For x ∈ (−1, 1), prove that tanh⁻¹x = (1/2) logₑ((1 + x)/(1 − x)). | VSAQ (2m) | ts_ipe_m1a_hf_tanh_inverse_log_form |
| vsaq11 | VSAQ | 0 | 119 | Prove that tanh(x − y) = (tanh x − tanh y)/(1 − tanh x tanh y). | VSAQ (2m) | ts_ipe_m1a_hf_tanh_diff_formula |

All 7 proposed ids checked against `ls answer-book/questions/` — no collisions. All existing
`ts_ipe_m1a_hf_*` cards are VSAQ/2-marks, so the 7 new ones follow the same qtype/marks.

## ELSEWHERE

None. Grepped the bank for each candidate's distinctive expression (`√8`, `cosh⁴`/`sinh⁴`,
`sinh(x + y)`, `cosh(x + y)`, `sinh⁻¹x`, `tanh⁻¹x`, `tanh(x − y)`). Two apparent hits were false
positives: `√8` turns up only inside an unrelated card's solution
(`ts_ipe_m1a_tr_sqp_sin_minus_third`), and `sinh⁻¹x`/`tanh⁻¹x` phrasing turns up only in the
NARRATION of `ts_ipe_m1a_hf_sinh_three`/`_sinh_five`/`_tanh_half`/`_tanh_quarter` ("sinh inverse x
is log of x plus root x squared plus one" — a spoken hint naming the general method used to solve
the numeric card), never as the actual question posed. No genuine elsewhere-match for any of the 7.

## UNCERTAIN

None.

## NOTES

- **vsaq9 and vsaq10 are the GENERAL theorem proofs** ("for any x ∈ R" / "for x ∈ (−1,1), prove
  that …"), printed in the book as "Theorem" rather than as a numbered exercise, but asked/worked
  identically per the source index. Our narration for the numeric cards
  (`ts_ipe_m1a_hf_sinh_three`, `_sinh_five`, `_tanh_half`, `_tanh_quarter`) references the same
  general formula as a solution METHOD, but none of our 10 cards actually proves the general
  identity for all x — so both remain genuinely MISSING, not answered elsewhere.
- One of our existing 10 cards, `ts_ipe_m1a_hf_tanh_quarter` ("Show that Tanh⁻¹(1/4) =
  (1/2) logₑ(5/3)"), applies the vsaq10 general formula to a different specific value (x = 1/4)
  that is not itself one of this source's 14 questions (the source's only specific tanh⁻¹ value is
  x = 1/2, vsaq6, already matched). Two more existing cards, `ts_ipe_m1a_hf_cosh_sq_minus_sinh_sq`
  (cosh²x − sinh²x = 1) and `ts_ipe_m1a_hf_cosh_2x_form` (cosh 2x = 2cosh²x − 1), are basic
  double-angle/Pythagorean identities not among this source's 14 numbered questions either — likely
  drawn from the chapter's theory/formula section rather than its exercise list. This is why only
  7 of our 10 cards land as MATCHED above, not 10.
- No mathematically wrong or ill-posed stems found in this chapter's source excerpt.
- No duplicate questions within the source excerpt.
