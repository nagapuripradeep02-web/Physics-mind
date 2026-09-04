# Senior Inter Maths-2B — start here

The IPE Answer Book's **seventh subject** and its third second-year paper, after Physics-II
(`physics_2`) and Chemistry-II (`chemistry_2`). Companion: `docs/IPE_MATHS_2B_SOURCE.md` (the
source analysis, written as the units land), `docs/IPE_MATHS_1A_SOURCE.md` and
`docs/IPE_MATHS_1B_SOURCE.md` (the same book series, first year — their sourcing rules apply
here unchanged), `docs/CHEMISTRY_2_START_HERE.md` (the second-year registration precedent).

Desk: worktree `C:\Tutor\physics-mind-ipe-answerbook-maths-2b`, branch
`feat/ipe-answerbook-maths-2b`, based on `origin/master` @ `e73dddb1`.

## 1. Identity

| | |
|---|---|
| `subject` | `mathematics_2b` |
| question ids | `ts_ipe_m2b_<unit-abbr>_<slug>` — abbrs `cir sc par ell hyp int di de` |
| `year_cycle` | `second_year` |
| `class_label` | `Intermediate II Year (Class 12)` |
| `board` / `board_label` | `ts_ipe` / `Telangana — Board of Intermediate Education` |
| unit numbers | **1–8**, the syllabus/blueprint numbers (§3), never the book's chapter numbers |
| unit name (in cards AND manifest) | `<Chapter> (Maths-2B)` |
| marks | **VSAQ 2 · SAQ 4 · LAQ 7** — `paper_section` `Section A` / `Section B` / `Section C` |

**The paper is the OLD 75-mark shape and that is verified, not inferred.** A 10×2 all · B any 5
of 7 ×4 · C any 5 of 7 ×**7** = 75. The 2026-27 reform that moved Maths-1A/1B to 60 marks with
8-mark LAQs is **first year only** — TV9 Telugu, 17 May 2026: *"these reforms apply only to first
year this year; they will be implemented for second year from 2027-28"*. The source book prints
the same shape in its IPE Blue Print (book p.5) and in all five model papers (pp.118-127).
`PAPER_PATTERNS` holds `mathematics_2b` to it as `ABC_75`; a 2-mark VSAQ authored at 3 marks
fails `check:cards` by name (negative control run 2026-08-29). **An LAQ is 7 marks. Never 8.**

**Why a new subject value.** One PAPER = one subject value. Unit identity is `${subject}-${number}`
everywhere (catalog, triage, exam-eve route, planner) and Maths-1A already owns `mathematics-1..12`;
worse, `notebook.js` `LEGACY_UNIT_KEYS` remaps `mathematics-N` keys for the 2026-27 renumbering, so a
2B chapter filed under `mathematics` would be **silently remapped onto a Maths-1A unit**.
`mathematics_2b-N` passes through untouched.

## 2. The source

`C:\Users\PRADEEEP\Downloads\Telegram Desktop\DocScanner 01-Nov-2022 5-56 am.pdf` —
**"SENIOR INTER MATHS-2B, My Baby Bullet-Q"**, SRI Publishers, Machilipatnam, **128 pages**, a
phone scan with no text layer. **PDF page = printed page EXCEPT for one stretch** (found by the
2026-08-29 page survey, verified on the pages): printed p.23 was never scanned and printed p.43
was scanned twice, so

| PDF page | Printed page |
|---|---|
| 1–22 | 1–22 |
| **23–42** | **24–43** (request PDF N−1 for printed N) |
| 43 | 43 again (duplicate of PDF 42) |
| 44–128 | 44–128 |

**Printed p.23 (Parabola LAQ answers 10 and 11) is absent from the scan.** Answer 10 (parabola
through (−1,2), (1,−1), (2,1), axis ∥ x-axis) is authored by us from the method the book uses for
answer 12; answer 11 is presumed to be the Bullet Model Paper p.113 item (parabola through (−2,1),
(1,2), (−1,3)) and is taken from there. Both cards say so. **Always cite PRINTED page numbers in
`verification.note`** and say which PDF page you read when they differ. Read it with the Read
tool's `pages` parameter, ≤ 8 pages per call, and **read your own pages every time** — never
author from another session's or agent's transcription.

Same publisher, series and organising principle as the 1A/1B books: **a question bank organised
by mark cut**, giving question text, chapter star rank, printed appearance years and, on
single-column pages, a printed mark split — never its prose (its "I-QUOTES" and "BABY CHAT"
boxes are personified and part Telugu; Rule 41 bans that register).

The book is cut by SECTION, then chapter, so **one syllabus unit is scattered across five
places**: its LAQ chapter, its SAQ chapter, its VSAQ chapter, its share of Star Questions Plus,
and any extras in the Bullet Model Paper. Answers are numbered continuously through the book —
LAQ 1 → ~44 (pp.14-48), SAQ 45 → ~102 (pp.49-75), VSAQ 103 → ~195 (pp.76-95), Star Q+ 196 → 218
(pp.96-102) — with twins as sub-numbers (`1.1`, `1.2`, `45.1`, `103.2`).

**Two structural checks are impossible for this subject, and that is recorded, not hidden:**

1. **No two-book union check** — there is no TSBIE second-year BLM on hand.
2. **No board back-test** — `answer-book/papers/` holds first-year physics only. The book's five
   Guess Papers (pp.118-127) are the stand-in: the orchestrator diffs the authored set against
   them at the end.

Say both in every card's `verification.note` and in the `units.json` comment.

## 3. The eight units and where each one lives in the book

From the IPE Blue Print (book p.5) and the Index (p.6). Blueprint marks = the paper slots the
chapter holds; a dash means the paper has NO slot of that kind and the book has NO such chapter.

| Unit | abbr | Chapter | VSAQ (2m) | SAQ (4m) | LAQ (7m) | Total | LAQ pp | SAQ pp | VSAQ pp | Star Q+ (pp.96-102) |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `cir` | Circle | 2+2 | 4 | 7+7 | 22 | 14-21 | 50-53 | 77-79 | 196-205 (pp.96-97) |
| 2 | `sc` | System of Circles | 2 | 4 | — | 6 | — | 54-56 | 80-81 | 206-207 (p.98) |
| 3 | `par` | Parabola | 2 | — | 7 | 9 | 22-25 | — | 82-83 | 208-209 (p.99) |
| 4 | `ell` | Ellipse | — | 4+4 | — | 8 | — | 57-65 | — | 210 (p.99) |
| 5 | `hyp` | Hyperbola | 2 | 4 | — | 6 | — | 66-67 | 84-85 | 211 (p.100) |
| 6 | `int` | Integration | 2+2 | — | 7+7 | 18 | 26-37 | — | 86-89 | none seen — verify |
| 7 | `di` | Definite Integrals | 2+2 | 4 | 7 | 15 | 38-43 | 68-71 | 90-92 | 212-218 (pp.101-102) |
| 8 | `de` | Differential Equations | 2 | 4 | 7 | 13 | 44-48 | 72-75 | 93-95 | none seen — verify |
| | | **IPE weightage** | 10×2=20 | 5×4=20 | 5×7=35 | **75** | | | | |

Paper slots by question number (QF sheet pp.3-4): Q1-2 Circle · Q3 System of Circles · Q4 Parabola ·
Q5 Hyperbola · Q6-7 Integration · Q8-9 Definite Integrals · Q10 D.E. · Q11 Circle · Q12 System ·
Q13-14 Ellipse · Q15 Hyperbola · Q16 Definite Integrals · Q17 D.E. · Q18-19 Circle · Q20 Parabola ·
Q21-22 Integration · Q23 Definite Integrals · Q24 D.E.

**Shape facts, so nobody invents a section:** Ellipse is SAQ-only (two Section-B slots, no VSAQ, no
LAQ). System of Circles and Hyperbola have no LAQ. Parabola and Integration have no SAQ. Author no
7-mark form where the blueprint has no Section-C slot, and no 4-mark form where it has no Section-B
slot. The Star Q+ page banners name the CHAPTER and sometimes a section ("CIRCLE-LAQ & SAQ",
"CIRCLES-VSAQ") — treat a bank question's section as **ours**, classed by its shape against the
unit's real chapters, and say so in its note. Answers 216-218 (areas under curves) belong to
Definite Integrals.

**This table is a hint. Count your own unit and report the number.** On Chemistry-II the
orchestrator's table was wrong by two and the unit agent caught it at a column break. Reading order
is left column then right column; a chapter can hand over mid-column and mid-page. **Walk every
boundary: read the page after the one you think is your last** — for each of your three chapters
and your Star Q+ run.

## 4. What the book gives, and how each signal maps

| Signal in the book | Where | Maps to |
|---|---|---|
| Chapter star rank `★★`/`★★★` | section tables (pp.13, 49, 76) and chapter headers | `units.json` entry `stars` — **the CHAPTER's rank on every entry of that chapter-section**, e.g. all Circle LAQ entries 3, all Circle SAQ entries 2, all Circle VSAQ entries 2. Star Q+ entries take their chapter-section's rank. Never per-question. |
| `★★★ SSP n ★★★` page header | top of a Super Scoring Page | mention in `verification.note` ("on a ★★★ SSP page") |
| `TS 16,18` / `AP 16,18` black tags | beside the question | `appearances: [{year: 2016, board: "ts_ipe"}, {year: 2018, board: "ts_ipe"}, {year: 2016, board: "ap_ipe"}, …]` — 2-digit years are 20xx |
| `IPE 14` tag (pre-2014 undivided board) | beside the question | NOT an appearance (the enum has no value for it) — record "IPE 14" in `verification.note` prose |
| `1 Mark` / `2 Marks` margin tags | right margin, single-column pages only | `steps[].marks` — the split is **sourced**; say "printed margin tags" in the note |
| no margin tags (two-column pages) | | the split is **ours**, patterned on the nearest printed split of the same shape in the same chapter; say so in the note — never present an inferred split as sourced |
| hit lists (pp.7-12) | TOP 30+ LAQ · TOP 35 SAQ · TOP 50+ VSAQ | **priority signal, NEVER inventory** — 1A scoped a chapter from a hit list and missed two questions; 1B's Locus hit list named 6 of 12 |
| Bullet Model Paper (pp.103-117) | compact re-answers organised by paper Q number | mostly repeats; **diff it against your chapter** and author only a question that is NOT in your numbered chapters, as an extra card whose note names "Bullet Model Paper p.N, Q<n>" and whose section follows the paper slot |
| 5 Guess Papers (pp.118-127) | question-only | not inventory; the orchestrator's back-test |
| "Tick Boxes", "I-QUOTES", "BABY CHAT", "You know!" boxes | | ignore entirely |

Question text: **preserve the wording, correct the spelling**, drop the book's space before a
question mark, write products with the middle dot (`1·2·3`, founder-settled 2026-08-21). The
`units.json` `text` renders directly to the student as the catalog label.

## 5. The bar a card must clear

Build-enforced (`npm run build:answers` fails; `npm run check:cards -- --prefix ts_ipe_m2b_<abbr>`
runs the same per-card gates during authoring):

- `marks_total` = `paperMarksFor(mathematics_2b, qtype)` (2/4/7); `sum(steps[].marks)` =
  `sum(mark_split[].marks)` = `marks_total`, per question and per cut
- every step has `why` and a non-empty `common_mistakes` (≤ 3)
- every step with `marks > 0` has `mark_note`; a `marks: 0` step has NONE
- `memory_tip` and `margin_note` are **all steps or none** per card — author both on every step
- `insider_note` on every card (one sentence of examiner insight)
- `verification.needs_teacher_verification: true` on every card
- **Rule 41 plain language** in every string a student reads — no idioms, metaphors, personification
  (`npm run scan:register -- ts_ipe_m2b_<abbr>` reports candidates; it is a partial net — read the
  prose too). Maths vocabulary is not jargon: "substitute", "eliminate", "the discriminant vanishes",
  "the terms cancel" are the plain words. A curve never "wants", an equation never "tells us".
- `recall` blocks and `recall_prompt` are NOT authored (dormant feature)
- `cuts[]` only where the book genuinely asks one answer at two lengths (rare in this book — the LAQ,
  SAQ and VSAQ chapters hold different questions). `common_mistakes` and `insider_note` are NOT
  cut-overridable, so base text must be true at every length.
- **No `unit.name` without the ` (Maths-2B)` suffix**; `chapter` is the bare chapter name.

### Notation

- **Plain Unicode first.** Kalam draws `² ³ ⁴ ⁵ ⁿ ⁻¹ ₁ ₂ · × − ⇒ ⇔ √ ∞ π θ α ∫ Σ ± ≤ ≥ ≠ ∴ ∵ ∈`
  well enough. Write `∫ sinⁿx dx`, `∫₀^π`, `x² + y² + 2gx + 2fy + c = 0`, `e = √(a² − b²)/a`,
  `dy/dx`, `(x₁, y₁)`, `Tan⁻¹`, `log|sec x|`, `S₁₁ = x₁² + y₁² + 2gx₁ + 2fy₁ + c`.
- **Subscript LETTERS are not available** — Kalam has no `ₙ`, and Unicode has no `ₐ` at all
  (digit subscripts `₁ ₂` are fine). So a reduction formula's `Iₙ` cannot be written in the hand:
  write those lines as `render: "katex"` (`I_n = -\frac{\sin^{n-1}x\cos x}{n} + \frac{n-1}{n} I_{n-2}`),
  and in chrome fields (question_text, manifest text) write `I_n` in plain text, the 1A convention
  for `I_A`. That is one of the few legitimate KaTeX uses in this paper.
- **`render: "katex"` only where Unicode genuinely cannot express it**: reduction formulae with
  `I_n`, stacked definite-integral limits that would be unreadable inline, the 3×3 determinant in
  the parabola-triangle-area proof, genuinely tall fractions. A fraction that reads fine on one line
  (`(x + 1)/(x² + 3x + 12)`) stays plain. Every typeset line is a small break in the handwriting
  illusion. Report your katex line count.
- Chrome fields (`question_text`, manifest `text`, `mark_split` labels) are plain text: use the
  same Unicode there; matrices/determinants there are described in words.
- One `lines[]` entry = one ruled line. Budgets in real Kalam 26px: `boxed` 535px, `eq`/`indent`
  568px, everything else 624px — roughly 45-52 characters. Reflow at operators; never shorten away
  a required step.

## 6. Figures — only where the picture IS the argument

The 1A/1B rule: author a figure where the book draws one, or where the geometry cannot be argued
without it. Likely sites in 2B: the standard form of the parabola (derivation), common tangents and
point of contact of two circles, the chord-midpoint foot-of-perpendicular figure, the hyperbola
perpendicular-tangents locus, ellipse auxiliary-circle locus, area under a curve / between curves,
the ellipse-area deduction. Pure algebra (integrals, D.E.s, most circle equations) gets no figure.

Rules: `figure.elements[]` order IS draw order; arrowheads are separate strokes; construction lines
`"pen": "pencil"` + `"wipe"`; **every `ms` a real positive integer** (the schema rejects 0); keep a
figure **under 16 drawn elements** (the pace gate demands phases above that — split across two
diagram steps instead); the renderer draws **outlines only, no fills**; leave **≥ 40 figure units**
of vertical clearance between labels whose horizontal extents overlap; a stroke over ~720 units
cannot pass the pace gate — split it. Diagram marks follow the ASKED question: only "draw" earns
diagram marks; elsewhere the diagram step is `marks: 0` with no `mark_note`. The orchestrator
retimes every stroke at the end (`pace:figures --prefix ts_ipe_m2b --force --write`) and renders
the gallery; you still LOOK at yours.

## 7. Orchestration — one agent per unit, cards first, nobody touches `units.json`

Each unit agent:

1. reads **its own pages** of the PDF (LAQ chapter, SAQ chapter, VSAQ chapter, its Star Q+ run,
   the Bullet Model Paper diff) with the Read tool, walking every boundary;
2. writes only `answer-book/questions/ts_ipe_m2b_<abbr>_*.json` — its own unit's cards;
3. writes ONE manifest fragment to the scratch dir
   `C:\Users\PRADEEEP\AppData\Local\Temp\claude\C--Tutor-physics-mind\4b509fd5-d9d9-48ce-ab09-6e607d10736f\scratchpad\m2bfrag\unit_<NN>.json`;
4. runs `npm run check:cards -- --prefix ts_ipe_m2b_<abbr>` and `npm run scan:register -- ts_ipe_m2b_<abbr>`
   from the desk root until clean, and a hand Rule-41 read;
5. touches **no** shared file — not `units.json`, not `package.json`, not the schema, not any doc;
6. reports: cards per section, the book answer numbers covered and the boundary pages walked,
   which splits are printed vs inferred, Star Q+ / Bullet Model Paper extras folded in, every place
   the book is wrong (answer number + page + what was written instead), figures authored, katex
   line count, and anything that disagrees with §3.

**Cards first.** An interrupted run keeps every finished card on disk and loses everything else.

Fragment shape (`ref` sequential per section in book order, `number` the same integer, `stars` the
chapter-section rank; twins `1.1`/`1.2` become two consecutive refs; the book's answer number goes
in the card's `verification.note`):

```json
{
  "number": 1,
  "name": "Circle (Maths-2B)",
  "subject": "mathematics_2b",
  "questions": [
    { "ref": "laq1", "section": "LAQ", "number": 1, "stars": 3,
      "text": "Find the equation of the circle passing through the points A(1,2), B(3,−4), C(5,−6).",
      "question_id": "ts_ipe_m2b_cir_circle_through_1_2_3_minus4_5_minus6" }
  ]
}
```

Order the entries LAQ → SAQ → VSAQ → (Star Q+ extras, in the section they were classed into) →
(Bullet Model Paper extras). The orchestrator alone merges:

```bash
python answer-book/tools/merge_units.py --subject mathematics_2b --prefix ts_ipe_m2b \
    --suffix "(Maths-2B)" --fragments <scratch>/m2bfrag [--write]
```

(never `--stars-zero` / `--no-appearances` — this book prints both signals.)

## 8. Where the book will be wrong — record, never follow, never silently fix

The book teaches what is MARKED, not what is true. Where an answer is wrong, write the correct
mathematics on the card and record the book's printed position in that step's `why` and in
`verification.note`. Where the book's METHOD is what an examiner marks (a particular substitution,
a particular form of the final answer such as `log|…|` vs `log(…)`, `+ c`), keep the marked form
and note any cleaner alternative. Report every finding; they are collected into
`docs/IPE_MATHS_2B_SOURCE.md` §"Where this book is wrong".

Things to re-derive rather than transcribe: every final numeric answer, every sign in a
completing-the-square, every limit substitution, every `+ c`, every eccentricity/focus/directrix
tuple, every centre/radius pair. A maths card CAN be checked, so check it.

## 9. Verify (orchestrator, after the last unit lands)

```bash
npm run build:answers                  # marks (ABC_75), completeness, Rule 41, katex, unit keys, drift
npx tsc --noEmit                       # 0
npx vitest run
npm run pace:figures -- --prefix ts_ipe_m2b --force --write
npm run check:figure-pace              # retargeted to ts_ipe_m2b
npm run measure:wrap -- ts_ipe_m2b
npm run figures:gallery -- ts_ipe_m2b  # then LOOK
npm run smoke:answers                  # ~40-50 min — DETACHED, trust the exit code
npm run serve:answers                  # localhost:8100
```

**Never deploy.** `npm run deploy:answers` publishes to answers.viditra.co and is the founder's
call alone (Rule 17). There is no `mpc_2` deploy target yet.

## 10. Registration — the two build-blocking sites landed first; the rest last

Landed 2026-08-29 (commit `ab4fefc6`): `ABC_75` + the `mathematics_2b` `PAPER_PATTERNS` row and
`subject` enum (`src/schemas/answerBook.ts`), `SUBJECTS` (`build_answer_book.ts`), `SUBJ_LABEL`
+ `chapterLabel()` (`notebook.js`). Still to do with the merged manifest, mirroring PR #169:
`STREAMS.mpc_2.subjects` + `blurb` (same commit), `push_answer_content.ts` `STREAM_SUBJECTS`,
`build_og_card.ts` `LABELS.mpc_2`, the Vidi prefix router ×3 + a new out-of-bank probe,
`website/students.html`, the `check:figure-pace` prefix, the e2e sweep budgets, and a grep of
every student-facing string for a stale subject name or year.
