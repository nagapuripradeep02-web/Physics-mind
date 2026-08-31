# Authoring brief — the Maths-1A/1B gap-fill cards

> Written 2026-08-31 for the agents authoring the 310 missing questions. Every convention
> below was **measured from the 613 maths cards already in the bank**, not invented. Where
> the brief and the neighbouring cards disagree, **the neighbouring cards win** — and tell
> the orchestrator, because the brief is then wrong. (That is not hypothetical: a previous
> brief stated `expected_time_min` 4/8 for Maths-1B when every one of its 108 cards used
> 5/9/15, and 102 cards drifted before an agent caught it by comparing against its neighbours.)

## 0. Before you write anything

1. **Read two or three neighbouring cards in the same unit, in full.** `ls answer-book/questions/ | grep <your prefix>` then read them. They are the specification.
2. **You may not open the source PDF scans.** You are given the question stem and nothing else. Solve every question from scratch. This is the boundary the whole track rests on — see `docs/ORIGINALITY_MATHS.md`.
3. **Never take the source book's solution, mark split, arrangement or priority stars.** The book prints no per-step mark allocation at all, so every split you write is ours.

## 1. File

One card = one file: `answer-book/questions/<question_id>.json`. `question_id` **must equal the filename** without `.json`. Schema: `src/schemas/answerBook.ts` (`answer_book_v1`).

Do **not** touch `answer-book/units.json` — the orchestrator adds the manifest rows at the end. Do not touch any other file.

**Do not spend any time on line endings.** This repo has `core.autocrlf=true`, so an LF file and a CRLF file with the same content hash to the **identical** git blob (verified: both give `422c2b7a…`). Write the file however your tool writes it. Two agents converted their cards by hand for nothing.

## 2. Header block — copy the shape exactly

```json
{
  "schema_version": "answer_book_v1",
  "question_id": "ts_ipe_m1a_tr_period_tan_5x",
  "board": "ts_ipe",
  "board_label": "Telangana — Board of Intermediate Education",
  "subject": "mathematics",              // or "mathematics_1b"
  "year_cycle": "first_year",
  "class_label": "Intermediate I Year (Class 11)",
  "unit": { "number": 8, "name": "Trigonometric Ratios and Transformations" },
  "chapter": "Trigonometric Ratios and Transformations",
  "qtype": "VSAQ",                        // VSAQ | SAQ | LAQ
  "marks_total": 2,                       // VSAQ 2 · SAQ 4 · LAQ 8 — hard-gated
  "paper_section": "Section A",           // A / B / C for VSAQ / SAQ / LAQ
  "expected_time_min": 4,                 // §3 below
  "question_text": "…",
  "appearances": [],
  "mark_split": [ { "label": "…", "marks": 1 }, … ],
  "verification": { … },                  // §5
  "recall_prompt": "…",
  "answer": { "page_header": [ … ], "steps": [ … ] }
}
```

- `unit.name` is the **bare chapter name**, no "(Maths-1A)" suffix — the suffix lives only in `units.json`. Copy it verbatim from a neighbouring card in your unit.
- **Marks are hard-gated against `PAPER_PATTERNS`.** Both papers sit `ABC_60`: VSAQ 2 · SAQ 4 · LAQ 8. A 7-mark long answer is the old pattern and fails the build.
- `sum(steps[].marks)` must equal `marks_total`, and so must `sum(mark_split[].marks)`.
- `mark_split[].marks` is `int().positive()` — a step worth 0 **has no `mark_split` row**. Drop the row; do not write 0.
- `appearances: []` — leave it empty. The book prints years on only three of its 864 questions. If your assigned question is one of them the orchestrator will have told you the year; otherwise empty.
- **No `insider_note`.** It requires sourced examiner history, which we do not have here.

`page_header` — two lines, exactly this shape (measured across all 613 cards):

| qtype | `page_header[0]` | `page_header[1]` |
|---|---|---|
| VSAQ | `Section A — Very Short Answer Question` | `<Chapter> · 2 marks` |
| SAQ | `Section B — Short Answer Question` | `<Chapter> · 4 marks` |
| LAQ | `Section C — Long Answer Question` | `<Chapter> · 8 marks` |

## 3. `expected_time_min` — measured, and gated by nothing

No gate checks this field. It drifted on 102 cards last time. Use the value your own unit already uses:

**Maths-1B — uniform across all 10 units. Match exactly.**

| VSAQ | SAQ | LAQ |
|---|---|---|
| **5** | **9** | **15** |

**Maths-1A — VSAQ is always 4; SAQ and LAQ vary by chapter.** Use your chapter's row:

| Unit | VSAQ | SAQ | LAQ |
|---|---|---|---|
| 2 Functions | 4 | 8 *(no precedent — 1A default)* | **12** |
| 4 Mathematical Induction | 4 | **9** | 13 *(no precedent)* |
| 5 Matrices | 4 | **9** *(8 and 9 tie 7–7; use 9)* | **13** |
| 6 Addition of Vectors | 4 | **9** *(8 and 9 tie 5–5; use 9)* | 13 *(no precedent)* |
| 7 Product of Vectors | 4 | **9** | **14** |
| 8 Trig Ratios and Transformations | 4 | **8** | **12** |
| 9 Trigonometric Equations | 4 | **9** | 13 *(no precedent)* |
| 10 Inverse Trigonometric Functions | 4 | **9** | 13 *(no precedent)* |
| 11 Hyperbolic Functions | 4 | 9 *(no precedent)* | 13 *(no precedent)* |
| 12 Properties of Triangles | 4 | **9** | **13** |

## 4. Steps — every one of these is required

Every step carries: `id` (`^[a-z0-9_]+$`, stable forever), `kind`, `label`, `marks`, `lines[]`, `why`, `common_mistakes[]`, `margin_note`, `memory_tip`, `recall`. A step with `marks > 0` also carries `mark_note`; a step with `marks: 0` **must not** carry one.

- **`why`, `common_mistakes`, `margin_note`, `memory_tip` and `recall` are on ALL 613 existing maths cards, on every step.** `memory_tip`, `margin_note` and `recall` are each all-steps-or-none per card, enforced by the gate. Author all of them.
- `common_mistakes`: 1–3 short literal items, max 3. **Read each one back against the step's own marked lines** — a bullet that names the CORRECT move as the error is a real defect that has shipped before.
- `kind`: `equation` for working, `boxed_final` for the last step's boxed answer, `text` for prose, `diagram` for a figure.
- The first step's first line is usually `{ "text": "Sol:", "style": "heading" }`.
- `recall` is the grader-side voice rubric: `credit` (`say_it` normally; `name_it` when the step cannot be spoken — a drawing, a construction), `must_convey` (one grader-facing sentence), `accept` (3–5 spoken phrasings), `reject` (near-misses, mostly a neighbouring step's words), `heard_as` (what speech-to-text produces for this step's terms). Some existing cards include one Telugu-English code-mixed `accept` phrasing; follow your neighbours.
- `recall_prompt` at question level is required once any step carries `recall`.

## 5. `verification` — the provenance block

```json
"verification": {
  "status": "unverified",
  "needs_teacher_verification": true,
  "note": "Source: Sri Chaitanya, FAST TRACK IPE for Jr. Students — Mathematics-IA (2026-27 edition), book p.<printed_page>, chapter <N> <BANNER>, <Very Short Answer|Short Answer|Long Answer> question <number><(part)>. Only the question was taken. The solution, the step order and the mark split are this answer book's own work — see docs/ORIGINALITY_MATHS.md. THE MARK SPLIT IS OURS, NOT THE BOOK'S: <the volume clause — see below>. <One sentence saying what the split rewards.> Paper position: Maths-<1A|1B> Section <A|B|C> <describe>. This is a coaching publication, not a TSBIE document, so the split stays unverified until a Telangana IPE teacher confirms it."
}
```

**The volume clause differs between the two books — assert only what your volume supports.**

| volume | write this |
|---|---|
| **Mathematics-IA** | `the Mathematics-IA volume prints no per-step mark allocation on any answer` |
| **Mathematics-IB** | `the volume prints a chapter-level marks banner over this section but no per-step allocation on any answer` |

An earlier version of this brief gave every card the 1B banner sentence. `docs/ORIGINALITY_MATHS.md` §7 records that the **1A volume has no mark splits anywhere**, and the existing 1A gap-fill cards (`ts_ipe_m1a_sr_*`) say so explicitly — while the 1B cards (`ts_ipe_m1b_lim_*`) do cite a specific printed banner. Nobody on this desk can open the book, so claim the narrower thing: **the part both records agree on is that no per-step allocation is printed in either volume.** If you are unsure which volume clause applies, write only that narrower sentence and say so in your report.

`check:originality` requires the note to contain **`Sri Chaitanya`**, **`Only the question was taken`** (case-insensitive) and **`ORIGINALITY_MATHS.md`**. All three, or the gate fails.

**`verification.note` is internal — it is never rendered and never sent to Vidi.** Provenance only. If the mathematics needs a condition (`p > 0`, `x ≠ 0`, a principal-value branch), that condition belongs in the `lines`, `why` or `memory_tip` where the student reads it — never parked in the note.

## 6. Writing the mathematics

- **Unicode math in the handwriting font**, not LaTeX: `− ∴ √ ² ³ ⁿ θ α ⁻¹ ⊥ ∠ ° × ≈ ∵ ⇒ Δ π ∈`. **U+2212 for minus, never a hyphen.**
- **Number sets are plain capitals — `R`, `N`, `Z`, `Q`, never `ℝ ℕ ℤ ℚ`.** Measured across the committed maths bank: 127 occurrences of `∈ R` / `∈ N` and **zero** blackboard-bold. Write `x ∈ R`, `n ∈ N`. (An earlier version of this brief listed `ℝ ℕ` in the character set; that was wrong.) A fraction, root or power that reads honestly on one line stays plain: `Tan⁻¹((x+y)/(1−xy))`, `√(s(s−a)(s−b)(s−c))`.
- **`render: "katex"` ONLY for a matrix, a determinant written as a 2-D array, or a capital-letter subscript** (`I_A` — Unicode has no subscript capitals). Write `{ "text": "<TeX source>", "render": "katex" }`. Everything else stays plain Unicode; every typeset line is a small break in the handwriting illusion. KaTeX is typeset at build time and a bad macro fails `check:cards` by name.
- **One authored line = one ruled row.** Budgets in real Kalam 26px: **`boxed` 535px · `eq` and `indent` 568px · everything else 624px.** Do not chain several algebra moves onto one line — that is exactly what took one paper to a 20.7% wrap rate.
  **Run `node answer-book/tools/measure_wrap.mjs <your prefix>` on your own cards and reflow until it reports 0**, before you report back. Split at the boundaries a hand actually uses, in this order: sentence end → a label colon → a chaining arrow (`⇒`, `∴`) → a dash or comma clause → a continuation `=` → a plain word boundary. Never split a `boxed` line (it renders inside a drawn box) — shorten it editorially instead, and never drop `+ c`, a modulus bar, `sq. units`, or anything an examiner marks.

## 7. Rule 41 — plain literal English, and it is gated

Every reader-facing string (labels, `why`, `common_mistakes`, `margin_note`, `memory_tip`, `question_text`) must be basic literal English a Class-11 student reading English as a second language understands without asking. **No idioms, no metaphors, no personification.** Mathematics vocabulary is not jargon — "principal value", "extraneous root", "direction cosines" are the plain words; use the word the formula uses. `check:cards` runs an idiom detector over these fields and fails by name.

Also: no country-specific culture in any example (Rule 35).

## 8. If the question is wrong

The source book prints errors — six are already recorded card-by-card. If your stem is mathematically wrong or ill-posed (a limit point that makes the question trivial, an interval printed backwards, a wrong unit), **do not silently repair it and do not skip it**. Author the card on the sensible reading, and say in `verification.note` what the book prints, what you authored instead, and why. That record is itself evidence of independent work — a copy reproduces its source's errors. Report it to the orchestrator too.

## 9. Before you report back — run these

```bash
npx tsx src/scripts/check_cards.ts answer-book/questions/<id>.json …   # or --prefix <prefix>
node answer-book/tools/measure_wrap.mjs <your prefix>                  # 0 wrapping lines OF YOUR OWN
```

**`measure_wrap` reports the whole prefix, and most maths chapters carry a pre-existing wrap
backlog on cards that are not yours** (Maths-1B is at 31.3% overall, Maths-1A at 10.5%). The bar
is that **none of the reported wrapping lines is one of the ids you wrote** — not that the number
reaches zero. Do not reflow another card to make the total look better. The cheapest way to prove
your own are clean is to run the tool once *before* you start and compare the counts.

`npm run build:answers` **cannot** pass during authoring — the manifest rows do not exist yet, so it fails by design. Do not run it.

Report: the ids you wrote, both command outputs, any source error you found, and anything where your card and the brief disagreed.
