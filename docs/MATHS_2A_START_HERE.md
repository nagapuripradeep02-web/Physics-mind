# Senior Maths-2A — start here

The IPE Answer Book's **seventh subject** and its **third second-year paper**, after Physics-II
(PR #167) and Chemistry-II (PR #169). It is also the **first paper in the bank whose long answer is
not 8 marks** on the 2026-27 syllabus — see §1.

Desk: worktree `C:\Tutor\physics-mind-ipe-answerbook-maths-2a`, branch
`feat/ipe-answerbook-maths-2a`, opened 2026-08-29 from `origin/master` at `e73dddb1`.
Companion: `docs/IPE_MATHS_2A_SOURCE.md` (source, blueprint, unit table, notation ledger).

## 1. Identity

| | |
|---|---|
| `subject` | `mathematics_2a` |
| question ids | `ts_ipe_m2a_<unit-abbr>_<slug>` (filename = `question_id`) |
| `year_cycle` | `second_year` |
| `class_label` | `Intermediate II Year (Class 12)` |
| `board` / `board_label` | `ts_ipe` / `Telangana — Board of Intermediate Education` |
| unit numbers | **1–10**, blueprint order (`cn dm qe te pc bt pf md pb rv`) |
| unit name suffix | ` (Maths-2A)` |
| paper | **75 marks**: A 10×2 all · B any 5 of 7 ×4 · C any 5 of 7 ×**7** → VSAQ 2 · SAQ 4 · LAQ **7** |
| `paper_section` | `Section A` / `Section B` / `Section C` |

**Why `mathematics_2a` and not `maths_2a`.** `answer-book/notebook.js` decides the verification
sentence a student reads by PREFIX — `question.subject.indexOf('mathematics') === 0` → "The
mathematics and the method are checked." Any other spelling falls through to "The physics and the
method are checked", silently, with no gate. The build comment in `build_answer_book.ts` already
names `mathematics_2a` as the planned value. And `mathematics-N` unit keys are remapped by
`LEGACY_UNIT_KEYS` (the 1A renumbering); `mathematics_2a-N` passes through untouched.

**Why 75 and not `ABC_60`.** The 2026-27 reform (60 written + 15 activity marks, 8-mark LAQ) is
FIRST YEAR ONLY; second year switches in 2027-28 (`docs/SYLLABUS_2026_27.md` §1b — Telangana Today
28 May 2026, Resonance 15 May 2026). The source book's blueprint and all five of its model papers
print the 75-mark shape. Founder decision 2026-08-29: "if same as old for the mathematics, continue
for 75 marks with old marking scheme." Registered as `PAPER_PATTERNS.mathematics_2a` =
`ABC_75_MATHS_PRE_REFORM` in `src/schemas/answerBook.ts`, `internal` omitted (unsourced, and it
renders into a student-facing sentence).

**The marks gate was proven live, not assumed** (2026-08-29): a throwaway `mathematics_2a` VSAQ
authored at `marks_total: 3` failed `check:cards` with *"marks_total = 3 but a mathematics_2a VSAQ is
2 marks on the 2026-27 paper (PAPER_PATTERNS)"*, and passed at 2. An unregistered subject makes
`paperMarksFor` return `undefined` and the gate skips silently — that is why the row, the enum and
`SUBJECTS` landed in one commit before any card.

## 2. The source, and the two checks that are impossible

`Downloads\Telegram Desktop\DocScanner 31-Oct-2022 5-49 pm.pdf` — Baby Bullet-Q Senior Inter
Maths-2A, Sri Publishers. **Book page = PDF page − 1** (corrected 2026-08-29 — this doc first said
− 2, read off the front matter; all ten unit agents measured − 1 from the LAQ section onward). Full
analysis in `IPE_MATHS_2A_SOURCE.md`.
Read the source every time; never author from another session's transcription.

No two-book union check (no second 2A source) and no board back-test (`answer-book/papers/` is
first-year physics only). Recorded on every card's `verification.note` and in the `units.json`
comment. A later session must never read "not checked" as "checked and clean".

## 3. The bar a card must clear

Enforced by `npm run check:cards -- --prefix ts_ipe_m2a` (schema + completeness + Rule 41 + KaTeX)
during authoring and by `npm run build:answers` at the end:

- `marks_total` = the paper (2 / 4 / **7**); `mark_split` and `steps[].marks` both sum to it;
  `page_header[1]` names it ("Complex Numbers · 4 marks").
- every step: `why` + `common_mistakes` (≤ 3) + a full `recall` block; `mark_note` on every scoring
  step (never on a 0-mark step); `margin_note` all steps or none; top-level `recall_prompt`.
- **Rule 41** plain English in every string a student reads — no "Dhamaka", "Rocking", "Super Hit
  'Q'", no metaphors, no personification. The build's `idiomsIn()` is an ERROR; the advisory
  `npm run scan:register -- ts_ipe_m2a` lists candidates for a human to judge — hand-sweep on top.
- one `lines[]` entry = one ruled row; measured budgets `boxed` 535 px · `eq`/`indent` 568 px ·
  everything else 624 px (`npm run measure:wrap -- ts_ipe_m2a`; never split a boxed line).
- notation per the ledger in `IPE_MATHS_2A_SOURCE.md` — `ⁿCᵣ` and `Cₙ` are plain Unicode; KaTeX
  only for fractional exponents, `e^{-λ}`, and matrices.
- splits: use the printed `[N Marks]` tags where the page prints them; otherwise pattern on the
  nearest printed split of the same shape and flag `⚠ THE MARK SPLIT IS OURS, NOT THE BOOK'S` with
  the page it was patterned on. Same split + same step ids across a family that is one method over
  different numbers (the four Cramer LAQs of 1A are the precedent).
- `appearances` from the printed `TS nn` / `AP nn` chips (`board: 'ts_ipe' | 'ap_ipe'`); pre-2014
  plain `IPE nn` in the note only. `stars` = the CHAPTER's stars from the section table, and the note
  says so.
- verification note in the 1A house style: source page + answer number · printed appearances ·
  split ours-vs-book · chapter-star disclaimer · paper position (which Q slot) · the two impossible
  checks · any correction to the book, recorded not silently fixed.
- templates: `ts_ipe_m1a_mat_cramer_x_y_z_1.json` (LAQ — re-cut to **7**),
  `ts_ipe_m1a_mat_saq_adj_inverse_1_0_2.json` (SAQ), `ts_ipe_m1a_mat_vsaq_adj_inverse_2x2.json` (VSAQ).

Figures (few expected — Argand-plane polygons in Complex Numbers SAQ 54–55): author `"ms": 0`, then
after the LAST unit lands `npm run pace:figures -- --prefix ts_ipe_m2a --force --write` (70 u/s),
`npm run check:figure-pace` (40–160 u/s over every opted-in prefix, `ts_ipe_m2a` among them; a
stroke over ~720 units cannot pass — split it), then `npm run figures:gallery -- ts_ipe_m2a` and
LOOK. `figure.height` is a pagination decision (whole 32 px rules); leave ~7 px headroom under an
`em` label. Two of the three Argand figures hit the ≥16-drawn-elements-and-no-`pause` rule and are
now drawn in four named phases.

**Passing `--strict` with no prefix is a hard error, and that is new.** It used to degrade to a
silent report-only run: a package.json script ending in a bare `--strict` shipped on 2026-08-29
gating nothing at all while still printing a green line and exiting 0. Caught by the sibling
Maths-2B session, not by the script.

## 4. Orchestration — one agent per unit, and nobody touches units.json

Each unit agent reads its own PDF pages, writes only `answer-book/questions/ts_ipe_m2a_<abbr>_*.json`
and one manifest fragment `<scratch>/m2afrag/unit_<NN>.json`:

```json
{
  "number": 1,
  "name": "Complex Numbers (Maths-2A)",
  "subject": "mathematics_2a",
  "questions": [
    { "ref": "saq1", "section": "SAQ", "number": 1, "stars": 2,
      "text": "Show that the points in the Argand diagram represented by the complex numbers 2 + 2i, −2 − 2i, −2√3 + 2√3i are the vertices of an equilateral triangle.",
      "question_id": "ts_ipe_m2a_cn_argand_equilateral_triangle" }
  ]
}
```

`ref` = section + running number WITHIN THE UNIT in book order (`laq1…`, `saq1…`, `vsaq1…`); the
book's own continuous answer number lives in `verification.note`. Refs must be unique within a unit.

The orchestrator alone merges:

```bash
python answer-book/tools/merge_units.py --subject mathematics_2a --prefix ts_ipe_m2a \
    --suffix "(Maths-2A)" --fragments <scratch>/m2afrag [--write]
```

(neither `--stars-zero` nor `--no-appearances` — this book prints both). Stage a NAMED file list.

## 5. Verify

```bash
npx tsc --noEmit
npm run build:answers                      # marks · completeness · Rule 41 · katex · unit keys · drift
npx vitest run
npm run check:figure-pace
npm run measure:wrap -- ts_ipe_m2a
npm run scan:register -- ts_ipe_m2a
npm run figures:gallery -- ts_ipe_m2a
npm run smoke:answers                      # ~50 min at this fleet size — detached process
npm run build:answers:mpc2 && npm run serve:answers:mpc2    # localhost:8102
npm run check:papers
```

`dist` is shared and the smoke suite asserts the OFFLINE build (build:answers → test → hosted build).
One gate is ~10 s: `npx playwright test e2e/answer_book.spec.ts -g "<name>"`.

**Never deploy.** `npm run deploy:answers` is the founder's call alone (Rule 17) — and it publishes
the JUNIOR book; the senior book has no worker yet.

## 6. Registration — the delta on top of master

| Class | Site | Status |
|---|---|---|
| Build-blocking | `build_answer_book.ts` `SUBJECTS` · `answerBook.ts` `subject` enum · `PAPER_PATTERNS.mathematics_2a` | **done first, 2026-08-29** |
| Silent if missed | `notebook.js` `subjectWord` — prefix test, satisfied by the name | n/a |
| Marks display | `notebook.js` `scopeMarks()` reads `PATTERNS.physics` for every subject → the planner labels LAQ "8 marks" even for a 7-mark 2A card. Derive from the subjects in the built book; print a range when they differ | after merge |
| Visibly wrong | `notebook.js` `SUBJ_LABEL` (`Maths-2A`), `chapterLabel()` strip regex (add `Maths-2A`), paywall list `:3541`, door tag `:3844`; `build_answer_book.ts` `TRACKS[0].subjects` copy | after merge |
| Stream and copy | `STREAMS.mpc_2.subjects` += `mathematics_2a`, `blurb` → `Maths-2A, Physics and Chemistry`; `build_og_card.ts` `LABELS.mpc_2.subjects`; `push_answer_content.ts` `mpc_2`; `website/students.html` second-year copy (already stale — founder call) | after merge |
| Wrong grounding | Vidi ladder in `answerbook_vidi_server.ts` + `supabase/functions/answerbook-vidi-chat/index.ts` (byte-identical) + `vidi_audit.ts`; a NEW out-of-bank probe — `DE_MOIVRE_PROBE` becomes in-bank (unit 2) and must be retired for `mathematics`, `mathematics_1b` and `mathematics_2a` alike | after merge |
| Gates | `e2e/answer_book.spec.ts` fleet sweeps (raise, never trim); `package.json` duplicated figure-gate keys | after merge |

Then grep every student-facing string for "Physics and Chemistry", "First year" and "Maths-1B".
