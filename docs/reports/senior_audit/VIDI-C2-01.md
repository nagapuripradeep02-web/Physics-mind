# Vidi audit — Chemistry-II, slice 1 of 14

Slice: `audit_r1_ts_ipe_c2.slice-01.md` — 25 cards, 250 replies (10 templates × 25 cards).
Chapters covered: Aldehydes/Ketones/Carboxylic Acids (cards 1–14), Alcohols/Phenols/Ethers (cards 15–25).

## 1. Per-template table

All non-guard replies in this slice scored 3, except `outofbank` (2 of 25 scored 2 for
volunteering unsolicited content about the open question — see §4).

| Template | N graded | Mean | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|---|
| marks | 24 | 3.000 | 0 | 0 | 0 | 24 |
| whystep | 24 | 3.000 | 0 | 0 | 0 | 24 |
| remember | 25 | 3.000 | 0 | 0 | 0 | 25 |
| explain | 24 | 3.000 | 0 | 0 | 0 | 24 |
| mistakes | 24 | 3.000 | 0 | 0 | 0 | 24 |
| important | 25 | 3.000 | 0 | 0 | 0 | 25 |
| skiplast | 24 | 3.000 | 0 | 0 | 0 | 24 |
| why | 24 | 3.000 | 0 | 0 | 0 | 24 |
| outofbank | 25 | 2.920 | 0 | 0 | 2 | 23 |
| telugu | 24 | 3.000 | 0 | 0 | 0 | 24 |

("N graded" excludes guard replies for that template — see §2. `marks`, `whystep`,
`explain`, `mistakes`, `skiplast`, `why`, and `telugu` each carry exactly 1 guard reply;
`remember`, `important`, and `outofbank` carry none.)

## 2. Overall mean and guard count

- **Overall mean (graded replies only): 2.992** — sum of scores 727 over 243 graded replies.
- **Total reply count in slice: 250.**
- **Guard replies (excluded from mean, counted separately): 7** — one each under
  `whystep`, `why`, `telugu` (card 1, `ts_ipe_c2_akc_acetyl_chloride_and_benzamide`) and
  `mistakes`, `skiplast` (card 2) and `marks`, `explain` (card 3). All 7 read "I could not
  answer just now. The answer book still works — keep going, and try me again in a
  moment." — a legitimate non-answer, not scored.

## 3. Replies scored 0 or 1

**None.** Every graded reply in this slice was scored 3, except the two `outofbank`
replies scored 2 (listed in §4 below; they are accurate, not misleading, so they do not
qualify as a 0/1).

## 4. Four explicit counts

- **WRONG-STEP (whystep explaining the wrong step): 0 of 25.** Checked every `whystep`
  reply against the step id shown in its heading; all 24 graded replies (the 25th is the
  card-1 guard) correctly named and explained the step actually opened.
- **SCOPE-CREEP (outofbank volunteering content of the open question): 2 of 25.**
  - Card `ts_ipe_c2_akc_cannizzaro_and_acetylation`, `outofbank`: after declining the
    Henderson–Hasselbalch ask, Vidi adds "For the question you do have open, the
    Cannizzaro reaction and acetylation, the book lists a 4-mark split with one mark
    each for the definition and equations of both parts." — an unprompted mark
    breakdown of the open question. Scored 2 (accurate, but over the length the ask
    deserved).
  - Card `ts_ipe_c2_akc_esterification_mechanism`, `outofbank`: after declining, Vidi
    adds "For the esterification question that is open, the important step is to number
    the five stages of the mechanism, because that is what earns the mark." — unprompted
    mark-earning advice on the open question. Scored 2.
  - Borderline, not counted: card `ts_ipe_c2_ape_acidic_nature_of_phenols_vs_alcohols`'s
    `outofbank` reply appends "it is a 4-mark SAQ with a clear mark split" — this only
    restates the question's already-visible header metadata (section/marks), not any
    step content, so it was not counted as creep.
  - Every other `outofbank` reply (23 of 25) declined cleanly with at most a bare,
    content-free offer to help with the open question.
- **LITERAL-MARKDOWN: 1 of 250.** Card
  `ts_ipe_c2_akc_acetylation_cannizzaro_cross_aldol_decarboxylation`, `telugu` reply,
  wraps each of the four part names in `**bold**` (`**Acetylation**`, `**Cannizzaro
  reaction**`, `**Cross aldol condensation**`, `**Decarboxylation**`) — the only reply in
  the slice containing `**`, a leading `- ` bullet, a `#` heading, or a backtick. Content
  is otherwise correct.
- **TRUNCATED: 0 of 250.** No reply in this slice ends mid-sentence or mid-formula; every
  reply I read closes on a complete sentence.

## 5. Mechanical flags worth reporting

- `_flags: MARK_SUM:2_` fires on the `marks` reply for
  `ts_ipe_c2_akc_cannizzaro_and_acetylation`. I judge that reply CORRECT: it says "Each
  part is worth 2 marks: 1 for the definition and 1 for the equations," which is the
  right reading of the book's 1M+1M+1M+1M split (2M per named reaction, 4M total, matching
  the question's stated 4 marks). The regex appears to be summing only the last-stated
  per-part total (2) rather than the full 4, so this flag is a **false positive** on a
  correct reply — worth fixing in the extractor, not in the content.
- `_flags: NO_TELUGU_SCRIPT, GUARD_REPLY_` and the other 6 `GUARD_REPLY` flags all fire
  correctly on genuine guard replies (§2) — no misfire there.
- `_flags: MARKDOWN:**bold**_` (§4) fires correctly — the reply does contain `**`.

## 6. Answer-facts defects (bank content wrong, self-contradictory, or ambiguous)

**None found in this slice.** I checked every chemical equation shown in the ANSWER FACTS
blocks for atom and charge balance (Cannizzaro, acetylation/Friedel-Crafts acylation,
decarboxylation and Kolbe electrolysis, esterification mechanism, the general and
acetaldehyde Fehling equations, the general and acetaldehyde Tollens equations,
HVZ α-halogenation, oxidation of acetone/acetophenone, the LiAlH₄/diborane acid-to-alcohol
reduction, the iodoform equation, Kolbe carboxylation + acidification, Reimer-Tiemann,
Williamson tertiary-halide elimination, and the Grignard route to t-butyl alcohol) and
all balance correctly, matching the WHY-field claims (e.g. "Charge: (+4) + (−5) = −1 on
the left, and −1 on the right" for Fehling's, "7 carbon, 10 hydrogen, 4 oxygen, 3 sodium
and 3 chlorine on each side" for Reimer-Tiemann). I also cross-checked every
WHY/REMEMBER/NOTE field against its own MARK SPLIT and WRITE field for internal
consistency (e.g. the acidic-strength pKa orderings, the cross-aldol four-product
labelling, the 443 K/413 K ethanol-dehydration mechanism, the tertiary-vs-primary
Williamson reversal) and found no sibling statements in conflict, no rule stated one way
and applied the other, and no false subject content. Two cards flag their own source-book
errors transparently in the INSIDER POINT (the duplicate acetic-acid entry in the HCN/acid
-strength question, and the same acidic-nature-of-phenols question printed twice in the
book) — these are disclosed corrections of the *source book*, not contradictions within
the ANSWER FACTS given to the model, so I did not count them as defects.
