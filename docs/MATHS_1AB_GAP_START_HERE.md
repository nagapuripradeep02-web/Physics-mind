# Starting the Maths 1A/1B gap-fill — read this before authoring the first card

> Written 2026-08-31, immediately after PR #181 merged. Audience: whoever authors the remaining
> 310 questions. Companions: `docs/ORIGINALITY_MATHS.md` (the rules that bind this work),
> `docs/patterns/answer_book.md` (schema + mechanisms), `docs/MATHS_1B_START_HERE.md` (1B history).

## 1. Where things stand

**Merged to master in PR #181** (`0d30a4e4`): 255 new cards, 61 re-cuts, three live card defects
fixed, two new gates. Both Maths papers now have **every chapter of the 2026-27 syllabus present and
answered** — 1A's 12 units and 1B's 10 — and every long answer is at **8 marks**.

| Paper | Units | Answered |
|---|---|---|
| Maths 1A (`mathematics`) | 12 | 301 |
| Maths 1B (`mathematics_1b`) | 10 | 312 |

**Not deployed.** Master is updated; `answers.viditra.co` still serves the previous build until the
founder runs the deploy. Shipping is founder-only (Rule 17).

## 2. What is left — 310 questions, already measured

All 22 chapters of the Sri Chaitanya *FAST TRACK IPE* Maths-1A/1B (2026-27 edition) are indexed at
`answer-book/sources/chaitanya_m1{a,b}_ch*.json` — **864 questions**, each with its book page, scan
page, section, star rank and a restated stem. The diff against our bank was done chapter by chapter.

| Chapter | Missing | Chapter | Missing |
|---|---|---|---|
| 1A ch.8 Trig Ratios + Transformations | **58** | 1A ch.12 Properties of Triangles | 15 |
| 1A ch.2 Functions | **49** | 1A ch.10 Inverse Trigonometric Functions | 9 |
| 1B ch.3 The Straight Line | **42** | 1A ch.9 Trigonometric Equations | 8 |
| 1A ch.7 Product of Vectors | **40** | 1A ch.4 Mathematical Induction | 7 |
| 1A ch.5 Matrices | **38** | 1A ch.11 Hyperbolic Functions | 7 |
| 1A ch.6 Addition of Vectors | 16 | 1B ch.4 Pair of Straight Lines | 7 |
| | | 1B ch.1 Locus | 5 |
| | | 1B ch.7 The Plane | 5 |
| | | 1B ch.5 3D-Coordinates | 3 |
| | | 1B ch.6 D.C's & D.R's | 1 |
| | | 1B ch.2 Transformation of Axes | 0 |

**The full MISSING list per chapter — ref, section, stem, star rank — is in this session's eight
diff reports.** If they are not to hand, regenerate: give an agent one chapter's index file plus the
matching `units.json` unit and ask it to classify every book question as MATCHED / MISSING /
ELSEWHERE / EXTRA, matching on the MATHEMATICS rather than on wording (our stems are already
restated, so string comparison finds nothing).

**Founder decision, 2026-08-31: do NOT author from the model papers.** Questions that appear only on
the books' own model papers — and not in a chapter's question list — are out of scope. A coaching
publisher's model paper is weaker evidence than its main chapter listing.

## 3. The rules that bind this work

Read `docs/ORIGINALITY_MATHS.md` in full. The short version:

- **Take the question. Never the solution.** Authors are given the stem only, must not open the PDF
  scans, and solve from scratch. `npm run check:originality` enforces the boundary.
- Every card citing the book carries the sentence **"Only the question was taken"** and points at
  the dossier. The gate matches case-insensitively.
- **Never republish the book's stars.** A cited card whose manifest row has `stars` fails rule 4.
- **Do not mirror the book's arrangement.** Order by the syllabus.
- `appearances: []` unless the book actually printed years — it does so on only three of its 864
  questions. No `insider_note` without sourced examiner history.

## 4. Conventions that are measured, not guessed

**`expected_time_min`** — no gate checks this field, and it drifted on 102 cards last time.

| | VSAQ | SAQ | LAQ |
|---|---|---|---|
| **Maths 1B** — uniform, match exactly | **5** | **9** | **15** |
| **Maths 1A** — no single convention (SAQ runs 7–9, LAQ 12–15) | **4** always | use your chapter's most common | same |

**Marks** are hard-gated against `PAPER_PATTERNS`: VSAQ 2 · SAQ 4 · LAQ 8, both papers on `ABC_60`.

**`mark_split[].marks` is `int().positive()`** — a zeroed step cannot have a split row. Drop the row
rather than writing 0. Labels on surviving rows stay byte-identical.

**A `marks: 0` step must not carry `mark_note`.** Keep its `lines`, `why`, `common_mistakes`.

**`margin_note`, `memory_tip` and `recall` are all-steps-or-none per card.** Include `memory_tip` on
new cards — it feeds the player's "How to remember?" chip.

## 5. Gotchas that cost time last session

- **The manifest row's `section` — not the card's `qtype` — drives the catalog.** `notebook.js`
  filters (646), counts (749), groups (906) and labels (930) from the row. A card and its row can
  disagree with a green build. Sync with the cards, never retype.
- **A row with a `cut` key is SUPPOSED to differ from the card's root qtype.** 14 such rows exist.
  Comparing against the root reports all 14 as broken. Compare against the named cut.
- **`git merge-tree` under-reports.** It predicted 0 conflicts for a merge that produced 56. Always
  merge master into your branch first and look.
- **Count questions, not question numbers.** The book's ~480 numbers carry 864 questions. Estimating
  from numbers put the gap at 85 when it was 310.
- **`verification.note` is internal** — never rendered, never sent to Vidi. Only
  `needs_teacher_verification` is read from that object.
- **The Playwright suite is 68 tests and takes ~2h18m**, with buffered output. Run it detached; the
  live process, not the log, is the progress signal. A single gate re-runs in seconds with `-g`.

## 6. The source has errors — record them, never repeat them

Six found so far, each documented on its card: an identity printed as `tan70° − tan20° = tan50°`
where the book's own working ends at `2 tan50°`; a limit point that makes its question trivial; an
interval printed `[2, 2]`; a rate given per "mm"; a bacteria count in seconds asked at "4 hours";
a `√65` whose own solution uses a cube root. **A copy reproduces its source's errors — this record
is itself evidence of independent work.**

## 7. Flagged for a teacher, not for an author

- **`ts_ipe_m1b_pl_pair_conditions_proof`** — two questions in one; was 5+3 at eight marks and has no
  honest integer split at four.
- **Three Straight Line cards** carry an `AUTHOR DOUBT` note: they hold four or five marks of work
  but are filed long on placement. The repair is to **extend** them, not to spread marks thinner.
- **Scope gaps** (card answers part of the book's question): `ts_ipe_m1b_pl_homog_perpendicular_7x2_minus_4xy`
  (book also wants the pair's equation), `ts_ipe_m1a_tr_saq_cos_a_2a_4a_8a` (book also wants the
  cos(2π/15)… deduction), three Straight Line "transform to all three forms" cards that give two,
  and `ts_ipe_m1a_fn_domain_root_9_minus_x2` (domain given, range not).

## 8. Still needed from the founder

1. **Telugu Akademi Maths 1A and 1B textbooks** — not on this disk. Needed so a question can cite a
   source that is not Chaitanya.
2. **A photo of both volumes' copyright pages** — the edition is undated in our hands, which is why
   the dossier does not claim anyone copied us.
3. **A re-scan of printed page 173 of the 1B volume** — missing, taking one worked solution with it.
   (Both Q17 stems survive on p.172, so nothing is blocked.)

## 9. Commands

```bash
npx tsx src/scripts/check_cards.ts --prefix ts_ipe_m1a   # per-card pre-flight during authoring
npm run build:answers                                    # the real gate: manifest <-> file drift
npm run check:originality                                # the boundary around the source book
npm run backtest:maths                                   # both model papers, 42 questions
npx tsc --noEmit && npx vitest run                       # 0 and 443/443
npm run smoke:answers                                    # 68 tests, ~2h18m, run DETACHED
```

`build:answers` cannot run mid-authoring — the manifest rows do not exist yet, so it fails by
design. Use `check:cards` until the chapter is complete, then add the manifest rows and build.

**Never deploy.** `npm run deploy:answers` is the founder's call alone.
