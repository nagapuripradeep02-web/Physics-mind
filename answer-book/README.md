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

**The notebook itself is preloaded JSON + deterministic JS** — no LLM, no API call, no
randomness. The one network request is the Google Fonts CSS for Kalam (falls back to
`cursive`).

**The spoken-recall check is an optional layer on top, not a dependency.** It appears only
when the build is given `ANSWER_BOOK_RECALL_ENDPOINT`; with that unset (the default) the page
makes zero network calls, shows no mic, and behaves exactly as it did before the feature
existed — a `file://` copy emailed to a student is unchanged, with no dead button. That
guarantee is asserted in `e2e/answer_book.spec.ts`.

Even when the check runs, the model **generates no physics and no marks**: the answer is
authored and fixed, and the model only *matches* the student's spoken words against an
authored rubric. Ids are intersected against real steps, every evidence quote is verified to
occur in the transcript, and the score is summed server-side from authored marks — the model
never sees a number. Full reasoning in `docs/patterns/answer_book.md`.

A future AI chatbot attaches through the same read-only seam (`window.PM_ANSWER`, the
`pm:step-revealed` event, `#pm-assistant-slot`).

## Spoken-recall check

```bash
npm run dev                                    # the endpoint (localhost:3000)
ANSWER_BOOK_RECALL_ENDPOINT=http://localhost:3000/api/answer-book/recall-check \
  npm run build:answers
npm run serve:answers                          # http://localhost:8100 — the mic now appears
```
Needs `SARVAM_API_KEY` in `.env.local` (already provisioned). Without it the endpoint returns
`503 stt_unconfigured` and the client hides the mic rather than showing a broken button.

**Two setup constraints found the hard way:**
1. `npm run dev` **does not start inside a `desk:new` worktree** — Turbopack rejects the
   `node_modules` junction ("Symlink [project]/node_modules is invalid"). Run the endpoint from
   the main checkout, or do a real `npm install` in the desk.
2. A worktree has no `.env.local`. Hard-link rather than copy, so the secret is never
   duplicated and never goes stale:
   `cmd /c mklink /H .env.local C:\Tutor\physics-mind\.env.local` (`.env*` is gitignored).

**Tuning the rubric for a new question:** `npm run probe:recall -- <question_id>` runs four
canned transcripts (full · partial · thin · odd-wording) against the real model for a few paise
and prints the buckets. The grader's guards are unit-tested with canned responses; this probe is
the only way to check that the authored rubric makes the real model generous enough — and
honest enough. Run it after authoring `recall` blocks and after any prompt edit.

**Authoring the rubric for a new question:** every step gets a `recall` block, or none do
(the build enforces all-or-none — a partial rubric would report an ungraded step as missed):

```jsonc
"recall": {
  "credit": "say_it",        // or "name_it": naming the move is FULL credit —
                             // use it for drawings, constructions, end-of-answer extras
  "must_convey": "one sentence, grader-facing, never shown to a student",
  "accept":   ["3-5 spoken phrasings that DO earn it", "code-mixed forms welcome"],
  "reject":   ["near-misses that must NOT earn it"],
  "heard_as": ["forms speech-to-text produces: 'tan universe', 'parallel program'"]
}
```
plus a top-level `recall_prompt`. The rubric is **stripped from the browser copy** — it is
grader-side data; the API reads the question file itself.

Guards against a wrong "you missed this" (the one failure that would kill the feature) live in
`src/lib/answerBook/recallGrader.ts` and are covered by
`src/lib/answerBook/__tests__/recallGrader.test.ts` — run with
`npx vitest run src/lib/answerBook`.
