# Maths 1A / 1B answer book — state of the bank against the new Sri Chaitanya book

Audit run 2026-08-31 on `master` at `328515b9`, after the founder uploaded the Sri Chaitanya
*FAST TRACK IPE for Jr. Students*, Mathematics-IA and IB, **2026-27 edition** (scanned
2026-08-30; indexed as 22 chapter files under `answer-book/sources/`, 864 questions).

Companion detail: `docs/reports/maths_gap/` (22 chapter diffs + SUMMARY),
`docs/reports/maths_vidi/` (8 grading slices + SUMMARY), `docs/reports/maths_audit/`
(examiner accuracy pass — 23 group reports + SUMMARY, see §6).

---

## 1. Is every chapter of the new syllabus present?  YES

Maths 1A has all 12 units and Maths 1B all 10, every one answered, zero coming-soon rows.
That includes both chapters **new** to the 2026-27 first-year syllabus — Sets and Relations
(26 cards) and Sequences and Series (25) — and Trigonometric Equations, which was correctly
kept rather than retired.

## 2. Is the marking scheme the new 2026-27 one?  YES, AND IT CANNOT DRIFT

`PAPER_PATTERNS` (`src/schemas/answerBook.ts:77`) pins both papers to `ABC_60`:

> 60 marks written + 15 activity-based · Section A all 10 x 2 · Section B any 6 of 8 x 4 ·
> Section C any 2 of 3 x **8** · w.e.f. 2026-27

The schema hard-fails any card whose `marks_total` disagrees with its section
(`superRefine`, lines 450-468), so this is enforced by the build, not by discipline. **Zero
7-mark maths cards remain** — all 99 were re-cut on 2026-08-28. Verified: `npm run
build:answers` exits 0.

Note the contrast that is *correct*: Maths 2A and 2B are still on the old 75-mark
`ABC_75_MATHS_PRE_REFORM` shape, because the reform is first-year only.

## 3. Is the whole "brain" present for the chatbot?  YES, with one deliberate exception

Across all 613 maths cards / 1,831 steps:

| Field | Maths 1A | Maths 1B |
|---|---|---|
| `memory_tip` (the "How to remember?" chip) | 100% | 100% |
| `common_mistakes` | 100% | 100% |
| `why` | 100% | 100% |
| `margin_note` | 100% | 100% |
| recall rubric | 100% | 100% |
| `insider_note` | **83.1%** (250/301) | 100% |

The 51 missing insider notes are exactly units 1 and 3 — the two brand-new chapters — left
blank on purpose: no insider note without sourced examiner history, and those chapters have
none. Everything else in the table is complete.

**All of these fields reach DeepSeek.** `buildVidiContext()` (`answer-book/notebook.js:5180`)
emits `insider_note` as INSIDER POINT, `common_mistakes` as MISTAKES, `memory_tip` as
REMEMBER, plus the mark split, the paper pattern, the star rank and each step's `why`.

Gate honesty: **nothing enforces `memory_tip` or `insider_note` presence.** `memory_tip` is
all-or-none per card once one exists; `insider_note` is optional and only Rule-41 scanned.
The 100% figures are the result of authoring discipline, not of a gate, so they can regress
silently.

## 4. Coverage against the book:  613 of 864 — 308 questions still unauthored

Full table in `docs/reports/maths_gap/SUMMARY.md`. Headline:

| | Book Qs | MATCHED | MISSING | PARTIAL | our EXTRA |
|---|---|---|---|---|---|
| Maths 1A | 506 | 249 | **245** | 5 | 55 |
| Maths 1B | 358 | 289 | **63** | 6 | 17 |

This confirms the recorded figure of 310 at 308, and it now exists as a per-question work
queue rather than a count — the eight diff reports that `MATHS_1AB_GAP_START_HERE.md:41`
said were lost have been regenerated, and extended from 8 chapters to all 22.

The gap is entirely **depth inside chapters**, never a missing chapter. It is also very
unevenly spread: 1B's calculus half (Limits 43, Differentiation 72, Applications of
Derivatives 89) is a clean 1:1 with the book because it was authored directly from it,
while 1A Trigonometric Ratios sits at 34 of 92 and 1A Functions at 31 of 82.

Three things in that queue matter more than their size:

- **1A Functions holds zero SAQ cards**, and the book's own model paper asks a Functions SAQ
  at Q11. This is the single THIN row `npm run backtest:maths` reports.
- **11 cards are PARTIAL** — they answer part of what the book asks. Cheaper to finish than
  to author fresh. The previously recorded list of five scope gaps was an undercount.
- **In 1B The Plane, all three EXTRA cards duplicate methods we already cover** while five
  different plane constructions have no card at all.

## 5. Does the chatbot answer precisely?  9.86 / 10, zero harmful replies

420 real DeepSeek calls on a 40-card stratified sample, graded blind by eight readers
against the authored bank (about Rs 11.4). Detail in `docs/reports/maths_vidi/SUMMARY.md`.

| | Replies graded | Out of 10 | scored 0 |
|---|---|---|---|
| Maths 1A | 200 | 9.82 | 1 |
| Maths 1B | 194 | 9.91 | 0 |

Fleet comparison: physics 9.9, chemistry 9.64, Maths-2A 9.94, Maths-2B 9.90.

The one 0 was Vidi saying "all 7 marks" on an 8-mark matrices card. **That is the card's
defect, not the model's** — `ts_ipe_m1a_mat_det_square_cyclic` step `s6_conclude` carries the
margin note "the seven are already spent", a relic of the 7-mark paper that survived the
2026-08-28 re-cut, and margin notes are emitted into the prompt. The model repeated what the
bank gave it. A sweep of all 613 maths cards found this to be the only reader-facing mark
TOTAL that disagrees with its card. See §7c.

Context sizes are safe: the widest maths context is 8,619 chars against a 14,000-char slice,
and **no maths card reaches even the 12,000 warning threshold**. One walkthrough reply was
cut mid-formula by the `max_tokens: 500` cap on the bank's longest 1B card.

## 6. The accuracy of the mathematics — CHECKED, and it holds

All 613 cards and 1,831 steps were audited in 23 groups, each agent re-deriving every answer
independently before reading the card's own steps. Full result:
`docs/reports/maths_audit/SUMMARY.md`, per-group detail in the 23 files beside it.

| | Cards | HARMFUL | WRONG | WEAK |
|---|---|---|---|---|
| Maths 1A | 301 | **2** | 62 | 102 |
| Maths 1B | 312 | **5** | 49 | 90 |
| **Total** | **613** | **7** | **111** | **192** |

**Not one wrong final answer was found.** Every determinant, derivative, locus, identity and
mark sum reconciles, verified numerically where possible.

**But 303 of the 310 findings are in the PROSE fields** — `common_mistakes`, `memory_tip`,
`why`, `margin_note`, `insider_note`. Those fields are what makes this a teaching product
rather than a list of answers, they are the half no gate checks, and they are the half Vidi
speaks verbatim. A false line there is read to the student as fact, which is why §5's 9.86/10
is not reassurance about the bank: it measures faithfulness to the cards, so a confidently
wrong card scores well while misleading the reader.

The dominant defect, present in every one of the 23 groups, is a `common_mistakes` line that
condemns mathematically **correct** work as an error — students are currently told that a
valid coplanarity determinant, the exact decimal 1.5, factorising k² − k, and a correct
sum-to-product identity are mistakes. It does not merely fail to help; it argues a student out
of correct working in the voice of an examiner.

The mechanism is almost always prose **cloned from a sibling card**: true of the card it was
written for, false on the neighbour it was pasted onto. And the same false claim usually
repeats across two or three prose fields of one step, so a repair must sweep `why`,
`memory_tip`, `common_mistakes` and `margin_note` together.

The seven harmful findings, and the units that came out cleanest (B10: 0 · 0 · 8 over 30 cards
— the units authored most recently and directly against this book), are named in the summary.

`verification.status` stays `unverified` on all 613: this is a careful re-derivation, not a
board teacher's sign-off.

## 7. Three defects nobody had measured

### 7a. Line wrap — Maths 1B is the worst in the whole bank

One authored line must equal one ruled row. Measured with `npm run measure:wrap`:

| Subject | Lines wrapping |
|---|---|
| physics (shipped) | 0.1% |
| botany (shipped) | 1.3% |
| chemistry (shipped) | 4.1% |
| **Maths 1A** | **10.5%** (329 / 3,127) |
| **Maths 1B** | **31.3%** (1,296 / 4,138) |

425 of 613 cards carry at least one over-long line. It concentrates in exactly the newest
work: 1B units 8/9/10 account for 906 of the 1,296, and 1A's two new chapters for 149 of 329.
No gate catches this — the e2e wrap test measures the first question only, and
`measure_wrap.mjs` reports without failing. The repair is reflowing at word boundaries; no
words change.

### 7c. Mark numbers written into prose drift away from the marks they name

A step's `margin_note` names which mark it earns — "Sixth mark." — and nothing keeps that
prose in step with `steps[].marks`. A sweep of all **2,727 cards in the bank** found **28**
where the named ordinal is not a mark that step actually earns: 16 in Maths-1A (fallout from
the 7 to 8 re-cut, where the marks moved and the prose did not), and 12 in Physics-II,
Botany, Zoology, Chemistry-II and Maths-2A/2B that were authored wrong from the start — two
of them exactly backwards on a 2-mark question, two more naming a mark on a step carrying
zero marks.

A second sweep, for a reader-facing mark TOTAL disagreeing with `marks_total`, found exactly
one card: `ts_ipe_m1a_mat_det_square_cyclic`. That is the card that made Vidi tell a student
the wrong total in §5.

Both are fully machine-checkable and neither is checked. Detail and the proposed gate:
`docs/reports/maths_audit/ORDINAL_MARK_NOTES.md`. This is the failure shape the bank keeps
producing — a number written into prose that duplicates a number held in structured data,
with nothing keeping the two in step.

### 7b. answers.viditra.co is serving a bank three units smaller than master

Checked against the live bundle, not the repo. The live site's baked manifest carries **19**
maths units; master has **22**. Missing live: **Limits and Continuity, Differentiation, and
Applications of Derivatives** — the entire calculus half of Maths 1B, 204 cards. Live maths
question ids: 250 of 301 for 1A, **108 of 312** for 1B.

A student opening Maths 1B on answers.viditra.co today sees the paper end at The Plane.
Deploying is founder-only (Rule 17) and nothing here touched it.

## 8. Gates run, with exit codes

| Command | Result |
|---|---|
| `check_cards.ts --prefix ts_ipe_m1a` | 0 — 301 cards, 272 katex lines, all gates pass |
| `check_cards.ts --prefix ts_ipe_m1b` | 0 — 312 cards, 6 katex lines, all gates pass |
| `npm run check:originality` | 0 — 316 maths cards cite the book and all carry the boundary sentence |
| `npm run build:answers` | 0 |
| `npm run backtest:maths` | 0 — 42 model-paper questions, 0 on a missing chapter, 1 THIN (1A Functions SAQ) |
| `npx tsc --noEmit` | 0 |
| `npx vitest run` | 0 — 443/443 in 37 files |

Two non-gates checked by hand:

- **`expected_time_min`** is enforced by nothing. 1B is perfectly uniform (VSAQ 5 / SAQ 9 /
  LAQ 15, all 312). 1A has no convention at all — VSAQ 4 (177 cards, one outlier at 3:
  `ts_ipe_m1a_tr_sqp_sin_four_fifths`), SAQ 7-9, LAQ 12-15. A student sees "about 12 minutes"
  and "about 15 minutes" on two questions of identical weight.
- **Figures**: maths is NOT in the `check:figure-pace` `--strict` list, so its figures are
  warn-only. 1A has 6 figure cards, 1B 17 — and 1B units 8/9/10, the whole 204-card calculus
  half, carry **zero** figures.

Verified NOT a defect: `answer-book/content/mpc/` stopping at 1B unit 7 is a stale local
artifact from an Aug-30 build, not a build fault — content bundles are written only under
`--gated` (`build_answer_book.ts:590`), which clears the directory first, so `deploy:answers`
regenerates all 22.

## 9. Still open, and owned by the founder

1. **Deploy** — master is 255 cards ahead of the live site, including three whole 1B units.
2. **Repairing the 310 audit findings** (§6) — no card was edited; the repairs are a separate pass.
3. **The line-wrap reflow** (§7a) — 425 cards, no words changed.
4. `ab_content.free` still reads `physics-4`; `docs/SYLLABUS_2026_27.md:97` records the fix
   as an UPDATE setting `free` for `physics-3`, `chemistry-3`, `mathematics-4` and
   `mathematics_1b-3`.
5. Three artifacts still needed: the Telugu Akademi Maths 1A and 1B textbooks, a photo of
   both Chaitanya volumes' copyright pages, and a re-scan of printed page 173 of the 1B volume.
