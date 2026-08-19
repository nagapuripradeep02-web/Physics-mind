# Answer Book — board-exam answer-writing guide

A **student-facing** static surface, a deliberately separate product track beside the
teacher-facing sim product. A student opens a board-exam question and the model answer
**writes itself step by step on a ruled notebook page** — handwriting font, character by
character — with the examiner's **marks shown in red per step**. Required diagrams draw
themselves **stroke by stroke** in the same blue ink. When page 1 fills, page 2 is created,
like a real answer booklet.

First board: **Telangana IPE** (Intermediate Public Examination). First question: the
Physics-I 8-mark LAQ on the parallelogram law of vectors.

## Build · serve · test

```bash
npm run build:answers    # questions/*.json + shell.html + notebook.css + notebook.js
                         #   → dist/index.html (ONE self-contained file)
npm run serve:answers    # http://localhost:8100
npm run smoke:answers    # Playwright evidence (needs a build first)
```

`dist/index.html` also opens directly from `file://` — you can email or WhatsApp the single
file to a student. That is why everything is inlined: Chrome blocks `fetch()` and JS modules
from `file://`.

## Files

| File | What it is |
|---|---|
| `questions/*.json` | One question per file — the single source of truth (schema below) |
| `shell.html` | HTML skeleton with 4 tokens the build replaces |
| `notebook.css` | Page geometry + chrome. **Every vertical page metric is a multiple of 32px (one rule)** — break that and text drifts off the rules |
| `notebook.js` | The engine: pagination (measure → freeze → clear → type), typing, stroke-drawn figures, marks, interaction |
| `../src/schemas/answerBook.ts` | zod schema; the build fails on any violation, incl. `sum(steps[].marks) !== marks_total` |
| `../src/scripts/build_answer_book.ts` | The ~150-line build |
| `../e2e/answer_book.spec.ts` | Pagination/marks regression evidence |
| `../docs/patterns/answer_book.md` | Schema reference + design decisions + rule-tension record |

## How to add question #2

1. Copy `questions/ts_ipe_p1_vec_parallelogram_law.json` to a new file. The filename must
   equal `question_id`.
2. Rewrite the header (board, unit, qtype, marks_total, mark_split, question_text) and the
   `answer.steps[]`. Rules of thumb:
   - one `lines[]` entry = one written rule; keep every line under ~52 characters;
   - equations are **Unicode math in plain text** (`R = √(P² + Q² + 2PQ cos θ)`, use
     `− ∴ √ ² θ α ⁻¹ ⊥ ∠ °`), exactly what a hand writes in the booklet;
   - marks: `0` is legal (content the examiner does not mark); the build enforces that all
     step marks sum to `marks_total`;
   - a diagram step carries `figure.elements[]` — array order IS the draw order; arrowheads
     are separate short strokes (never SVG markers); dashed construction lines use
     `"pen": "pencil"` + `"wipe": "x"|"y"`.
3. `npm run build:answers` — it will tell you loudly if the marks don't add up.
4. Eyeball at `npm run serve:answers`, then `npm run smoke:answers`.

Today the page shows `PM_QUESTIONS[0]` only; a question picker is deliberately out of scope
until there is more than one question worth picking.

## Determinism (Rule 18)

The page is preloaded JSON + deterministic JS. No LLM, no API call, no randomness. The one
network request is the Google Fonts CSS for Kalam (falls back to `cursive`). A future AI
chatbot attaches through the read-only seam (`window.PM_ANSWER`, the `pm:step-revealed`
event, `#pm-assistant-slot`) — see `docs/patterns/answer_book.md`.
