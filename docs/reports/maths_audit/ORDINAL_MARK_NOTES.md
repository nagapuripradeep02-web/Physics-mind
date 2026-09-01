# Stale ordinal-mark margin notes — a bank-wide, machine-detectable defect

Found 2026-08-31 by the examiner pass on Maths-1A group A09, then swept across the whole
bank (2,727 cards) from the main session.

## What it is

A step's `margin_note` names which mark it earns — "Sixth mark." — but the step actually
earns a different one. The reader sees a number that does not match the mark gutter beside it.

**28 cards are affected.** The sweep compares each ordinal word against the running total of
`steps[].marks` before and after that step, so a note is only reported when the claimed
ordinal falls outside the range of marks the step actually earns.

| Subject | Cards |
|---|---|
| mathematics (Maths-1A) | 16 |
| physics_2 | 5 |
| botany | 2 |
| mathematics_2b | 2 |
| chemistry_2 | 1 |
| mathematics_2a | 1 |
| zoology | 1 |

## Two different causes

**1. Fallout from the 7 → 8 mark re-cut (Maths-1A, most of the 16).** When the 2026-27 paper
moved Section C from 7 marks to 8 on 2026-08-28, the step marks were re-cut but the prose in
the margin notes was not. Eleven Maths-1A cards say "Sixth mark" on a step that is now the
seventh of eight — a whole family of trigonometric LAQ cards sharing one `s4_factor` step:

`tr_cos2a_sum`, `tr_cosa_cosb_minus_cosc`, `tr_cos_half_squares`, `tr_cos_s_minus_a`,
`tr_sin2a_sum`, `tr_sin_half_minus_c`, `tr_sin_half_squares`, `tr_sin_s_minus_a`,
`tr_sqp_cos_s_minus`, plus `mat_det_a_minus_b_minus_c` and `mat_det_sum_2c_cube`.

Three Matrices cards say "Fourth mark" on a step earning the sixth
(`mat_inverse_2x_y_3z_8`, `mat_inverse_2x_y_3z_9`, `mat_inverse_3x_4y_5z_18`), and two more
are off by one in the other direction.

**2. Original authoring slips (the other 12).** Physics-II, Chemistry-II, Botany, Zoology and
Maths-2A/2B were never re-cut, so their errors were authored that way. Two Botany/Zoology and
one Chemistry-II card have it exactly backwards on a 2-mark question — the note on step 1 says
"second mark" and the note on step 2 says "first mark". Two Maths-2B cards put an ordinal note
on a step carrying **zero** marks.

`ts_ipe_p2_mcm_torque_on_loop_and_galvanometer` carries two of them, on consecutive steps.

## Why it matters, and how much

`margin_note` is rail-side guidance, not page content, so this costs a student no marks
directly — but it is the field that tells them how the examiner counts, and it is wrong on
28 cards. On `tr_sqp_cos_s_minus` the stale note also contradicts the card's own s3 margin
note, so the two disagree with each other in front of the reader.

## The gate that should exist

This is fully mechanical and there is no reason to leave it to human eyes. A check in
`build_answer_book.ts` alongside the other §1c completeness gates: for each step whose
`margin_note` matches `/\b(First|Second|…|Tenth)\s+mark\b/i`, resolve the ordinal and fail
unless it falls within the marks that step actually earns. It would have caught all 28, and
it would have caught the re-cut fallout on the day of the re-cut.

Note this is exactly the class of defect the bank keeps producing: a number written into prose
that duplicates a number held in structured data, with nothing keeping the two in step.

## Reproducing the sweep

Read every `answer-book/questions/*.json`, walk `answer.steps[]` keeping a running total of
`marks`, and for each step compare any ordinal word in `margin_note` against the half-open
range `(runningTotalBefore, runningTotalAfter]`. A step with `marks: 0` can never legitimately
name an ordinal.

---

## Addendum (group A08): the sweep missed a second shape — CARDINAL mark counts

The sweep above tested only ordinal words ("Sixth mark"). Group A08 found a `margin_note`
opening with a mark COUNT — "One mark." on a step worth 2 — which the ordinal pattern cannot
see. That is the same lesson this bank keeps relearning: **a gate must name what it selects,
never count to it.**

Re-swept for a cardinal count (either opening the note, or after "worth/carries/earns") that
disagrees with the step's own `marks`. **12 more cards**, none overlapping the 28 above:

| Subject | Cards | |
|---|---|---|
| mathematics_1b | 8 | four D.C's & D.R's cards, each on BOTH its s3 and s4 step |
| mathematics (1A) | 2 | `pv_triple_product_pair`, `pv_two_triple_products` — both say "One mark" on a 2-mark step |
| botany | 1 | `bm_glycosidic_bond_in_dna` — "Two marks" on a 1-mark step |
| chemistry | 1 | `som_grahams_law` — "One mark" on a 2-mark step |

The 1B cluster is one cloned pair repeated across four sibling cards
(`dc_angle_3l_plus_m_plus_5n`, `dc_angle_l_plus_m_plus_n`, `dc_dcs_l_minus_5m_plus_3n`,
`dc_dcs_l_plus_m_plus_n_mn`), all telling the student each case is worth two marks when each
is worth one — so the note claims four marks of a question that carries eight across more steps.

**Running total for this defect class: 40 cards** (28 ordinal + 12 cardinal), plus the one
stale mark TOTAL on `ts_ipe_m1a_mat_det_square_cyclic` that reached a student through Vidi.

The proposed gate must therefore cover all three shapes: an ordinal ("Sixth mark"), a cardinal
count ("One mark.", "worth two marks"), and a total ("the seven are already spent"). All three
are a number in prose duplicating a number in structured data, and all three are checkable.

---

## Resolved 2026-09-01 — 35 notes repaired, and the gate now exists

**Corrected count: 35, not 40.** Two refinements to the sweep, both learned by over-firing:

1. **Only a note that OPENS by naming a mark is naming THIS step's mark.** A mid-sentence
   ordinal normally refers to ANOTHER step ("The names carry the second mark", "A bare list of
   tests usually earns only the first mark") and is correct. Four cards were flagged on that
   basis and are fine; 80 such mid-sentence references exist across the bank and none was
   touched.
2. **"One mark PER application" counts per item, not per step.** `ts_ipe_c1_som_grahams_law`
   was edited to "Two marks per application" on a 2-mark step listing two applications — which
   made a correct note wrong. Caught on review and reverted.

The remaining 35 were repaired across 29 files: ordinals corrected to the mark the step
actually earns, cardinals to the step's own value, and the two notes sitting on a **0-mark**
step rewritten to "No mark of its own." (a step earning nothing cannot name a mark at all).

## The gate

`markNumberError(note, stepMarks, marksBefore)` in `src/lib/answerBook/vidiChecks.ts`, called
from both `check_cards.ts` and `build_answer_book.ts` alongside the other completeness checks.
It reads only the OPENING phrase, skips "per/each" constructions, and reports the mark the step
actually earns.

**Verified by negative control, not by assumption.** Re-injecting the original "Sixth mark" into
`ts_ipe_m1a_tr_cos2a_sum` makes `check:cards` exit 1 with:

    ts_ipe_m1a_tr_cos2a_sum / s4_factor: margin_note opens "Sixth mark" but the step earns mark 7

and restoring the file makes it pass again. Nine unit cases were checked first, including the
two shapes that must NOT fire (mid-sentence, and per-item).

That control mattered: the first version of the check passed everything, including the
deliberately broken card. The cause was the shell transport eating the double backslashes in
the regex, so `\s` became `s` and `\b` a literal backspace — a recorded scar on this machine.
The source now uses `String.raw` and was written with a file-editing tool, not a heredoc.
**A gate that has not been shown to fail is not a gate.**

Still not covered: a stale mark TOTAL in free prose ("the seven are already spent"). One card
carried it and it is fixed; the shape is too varied to pattern-match safely, so it stays a
human check.
