# Vidi Audit — Chemistry II, slice 3 of 14

Slice file: `.answerbook_logs\audit_r1_ts_ipe_c2.slice-03.md`
25 question cards × 10 templates = 250 replies. Every reply graded, none sampled. 0 guard replies
("I could not answer just now" / "Give me a short moment") encountered.

## 1. Per-template table

| Template  | Mean  | 0 | 1 | 2 | 3  |
|-----------|-------|---|---|---|----|
| marks     | 3.000 | 0 | 0 | 0 | 25 |
| whystep   | 3.000 | 0 | 0 | 0 | 25 |
| remember  | 3.000 | 0 | 0 | 0 | 25 |
| explain   | 3.000 | 0 | 0 | 0 | 25 |
| mistakes  | 2.960 | 0 | 0 | 1 | 24 |
| important | 3.000 | 0 | 0 | 0 | 25 |
| skiplast  | 2.840 | 0 | 2 | 0 | 23 |
| why       | 3.000 | 0 | 0 | 0 | 25 |
| outofbank | 2.840 | 0 | 0 | 4 | 21 |
| telugu    | 3.000 | 0 | 0 | 0 | 25 |

## 2. Overall mean

**2.964** across all **250** replies. Guard replies: **0** (none in this slice, so nothing was
excluded from the mean on that account).

## 3. Every reply scored 0 or 1

Both are `skiplast` replies, and both share the same defect: the card has a drawn-figure step
worth **0M** (the bank explicitly says "not a marked step... sketch it only if the written parts
are complete"), and Vidi's "minimum you must write" answer wrongly folds that 0M figure into the
required minimum — telling a time-pressured student to spend exam minutes on something the bank
says earns nothing and is optional.

**`ts_ipe_c2_bio_saq_peptide_linkage_primary_structure_denaturation`** — template `skiplast`, step
`s4_denaturation`. Score: **1**.
> "If you skip the last step, you lose the 2 marks that the book gives for Denaturation. The
> minimum you must write is the first three steps: the peptide linkage definition, **the figure**,
> and the primary structure definition. Those together still earn the 2 marks for the first two
> parts."

Reason: `s2_figure` is explicitly `— 0M` in the bank ("this earns no marks... sketch it only if the
written parts are already complete"), yet the reply lists it as part of the "minimum you must
write." It then also calls the three listed items "the first two parts," an internal
inconsistency. The numeric marks lost/kept (2 lost, 2 kept) are correct — only the inclusion of the
figure as required is wrong — but that is exactly the part a student would act on.

**`ts_ipe_c2_bio_saq_zwitter_ion`** — template `skiplast`, step `s5_acid_base`. Score: **1**.
> "If you skip step 5, 'Behaviour in acid and in base,' you lose that step's 1 mark. The minimum
> you must write is the other four steps: how it forms, its structure and charge, the example,
> **and the figure**. Those four steps still earn the other 3 marks."

Reason: same defect — `s3_figure` is `— 0M` ("Not a marked step... Sketch it only if the written
steps are finished"), but the reply names it as one of the "four steps" that make up the required
minimum. Notably, the *same card's own* `whystep` reply on that identical figure step gets it right
("The question only asks for a definition and an example... this drawing earns no marks. You can
skip it if the written steps are finished."), and `structure_of_glucose`'s `skiplast` reply also
correctly excludes both of its unmarked figure steps. So this is an inconsistent failure mode, not
a card the model always gets wrong.

## 4. Four counts

- **WRONG-STEP: 0 of 25.** Every `whystep` reply explains the exact step named in the ask (verified
  step-id by step-id against the bank) and attributes that step's own mark to it, never a
  neighbouring step's.
- **SCOPE-CREEP: 4 of 25.** All 25 `outofbank` replies correctly decline the Henderson–Hasselbalch
  question. Four then go beyond a bare offer and volunteer marks/content of the open question the
  student did not ask about:
  - `ts_ipe_c2_bio_saq_glucose_with_hi_br2_hno3` — "the important step is to write all three
    equations and then add one line of conclusion for each. That final step is what earns the
    fourth mark." (reveals step count + mark allocation of the open question)
  - `ts_ipe_c2_bio_saq_types_of_hormones` — dumps the full definition and all three worked
    examples of the open question unprompted (the largest creep instance; also flagged
    `OVER_BUDGET(99w/90)`)
  - `ts_ipe_c2_bio_types_of_rna` — "the three names are mRNA, rRNA, and tRNA, and each one gets a
    short line on what it does" (hands over the exact 1-mark content, the three names, unprompted)
  - `ts_ipe_c2_cel_antifertility_drugs` — "the definition is worth 1 mark and the examples with
    their parent hormones are worth 1 mark" (reveals the open question's mark split unprompted)

  Judged as **not** creep, for calibration: several `outofbank` replies name the open question by
  its own subject vocabulary as a one-sentence offer only (e.g. "the α-helix and β-pleated sheet
  answer that is open here instead," "the hormones question that is open — the four hormones with
  source, chemical nature, and function") — these stay at topic-identification and don't hand over
  graded content, step counts, or mark values, so they were kept out of the count.
- **LITERAL-MARKDOWN: 0 of 250.** No reply contains `**`, a leading `- ` bullet, a `#` heading, or a
  backtick. (The only markdown characters in the file are in the frozen rubric header and inside
  the fenced ANSWER FACTS blocks, neither of which is a Vidi reply.)
- **TRUNCATED: 0 of 250.** Checked every reply's final character programmatically as well as by
  reading — all end on a complete sentence, formula, or closing punctuation (English or Telugu).

## 5. Mechanical flags

Only 4 flags fire anywhere in this slice, and none of them sit under a reply I scored 0 or 1 — so
by the letter of the rubric there is nothing to report here. But all four flags are themselves
informative about the checker's reliability, which the rubric explicitly invites reporting:

- **`MARK_SUM:3`** fires twice, on the `marks` replies for `ts_ipe_c2_bio_saq_enzymes` and
  `ts_ipe_c2_bio_saq_glucose_with_hi_br2_hno3` — both replies I scored 3 (precise). In both cases
  the reply's own arithmetic sums correctly to the card's actual total (1+3=4, and 1+1+1+1=4). The
  flag value of "3" in both cases matches only the *last* "N mark(s)" phrase appearing in the
  reply's prose (e.g. "...that only earns **3 marks**" describing what happens if a student stops
  early), not an actual sum of the marks claimed. This looks like the regex is grabbing the final
  numeric mark-mention rather than summing all of them — worth fixing so `MARK_SUM` stops false-
  firing on correct replies.
- **`OVER_BUDGET(187w/170)`** on `ts_ipe_c2_bio_saq_structure_of_glucose`'s `mistakes` reply and
  **`OVER_BUDGET(99w/90)`** on `ts_ipe_c2_bio_saq_types_of_hormones`'s `outofbank` reply — both
  correctly fire on replies that are genuinely over-length/padded (scored 2 here, not 0/1, since
  neither invents anything).
- Worth flagging in the other direction: **neither of the two genuinely wrong replies (item 3
  above) tripped any mechanical flag.** The "minimum you must write" miscount that includes a 0M
  figure step is exactly the kind of numeric-content error a MARK_SUM-style check should catch,
  and it did not, on either occurrence.

## 6. Cards with defective ANSWER FACTS

**None found in this slice.** All 25 cards were checked for: mark-split sums matching the stated
question total (all 25 do — 2M VSAQs split 1+1, 4M SAQs split into four 1M parts or 1+1+2M etc.,
consistently), balance/consistency of the stated reactions (HI reduction, bromine-water and HNO₃
oxidation of glucose, the antacid neutralisation equation, the zwitterion protonation/
deprotonation equilibria — all balance in atoms and charge), and internal consistency between each
step's WRITE/WHY/MISTAKES/REMEMBER/NOTE lines (no case where a NOTE or WHY contradicts its own
MARK SPLIT, and no sibling steps reaching opposite conclusions). The recurring "0M drawn figure"
steps (peptide linkage, zwitterion, glucose structure) are internally consistent and clearly
labelled as unmarked in the bank itself — the two errors they produced (item 3) are reply-level
failures to respect that labelling, not defects in the bank text.
