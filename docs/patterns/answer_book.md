# Answer Book — pattern reference (schema · mechanisms · rule tensions)

> Companion to `answer-book/README.md` (how to build/run/add questions). This file records
> the schema, the two load-bearing mechanisms, the AI-chatbot seam, and the CLAUDE.md rule
> tensions — so nobody relitigates them at review. First landed 2026-08-20
> (`feat/ipe-answerbook`, parallelogram-law LAQ prototype).

## What this track is

A student-facing board-exam **answer-writing guide**: preloaded model answers revealed step
by step on a ruled notebook page, marks per step in examiner's red, diagrams drawn stroke by
stroke, honest multi-page pagination. NO simulations, NO runtime LLM. First board: Telangana
IPE, Physics-I.

## Question schema (`answer_book_v1` — zod: `src/schemas/answerBook.ts`)

Design principle: **board specificity is confined to the header; `answer.steps[]` is
portable physics.** A CBSE variant of the same question is a new file with a different
header over the same steps. There is no country/board fact inside any step.

- Header: `board`, `board_label`, `subject`, `year_cycle`, `class_label`, `unit`, `chapter`,
  `qtype` (VSAQ|SAQ|LAQ), `marks_total`, `paper_section`, `expected_time_min`,
  `question_text`, `appearances[]`, `mark_split[]` (display only), `verification`.
- `verification.needs_teacher_verification` — Rule 38g spirit: the mark split and appearance
  years are **claims until a board teacher confirms them**; the chrome shows this caveat.
- Step: `{ id (stable forever), kind: text|equation|diagram|boxed_final, label, marks (0
  legal), mark_note, margin_note, lines[] | figure }`.
- Line: string or `{ text, style: heading|normal|indent|eq|boxed, pause_after_ms }`.
  One line = one rule; author ≤ ~52 chars so nothing wraps.
- Enforced by the build: schema validity, `sum(steps[].marks) === marks_total`,
  `sum(mark_split[].marks) === marks_total`, unique step ids, filename === question_id.

**Equations are Unicode math in the handwriting font** (`− ∴ √ ² ³ θ α ⁻¹ ⊥ ∠ ° × ≈ ∵`;
U+2212 minus, never hyphen). This is deliberate: a KaTeX-typeset fraction inside a Kalam
notebook page breaks the illusion, char-by-char reveal is trivial on a text node and hostile
to KaTeX, and the one-line slash form is exactly what a hand writes in a booklet in 15
minutes. Upgrade path if a question ever needs a stacked fraction/integral: an optional
per-line `"render": "katex"` with a width-clip reveal (KaTeX is already vendored — see
`writeVendorAssets()` in `build_review_site.ts` for the copy pattern). Not before.

## Mechanism 1 — pagination: measure → freeze → clear → type

The page invariant: **every vertical metric is a multiple of `--rule` (32px)**; the page
body is exactly 32 rules (1024px). Placement:

1. Build the step block with its FULL final content; append `visibility:hidden` (never
   `display:none` — `offsetHeight` and `getTotalLength()` both need layout).
2. Overflow test against the page body. If it overflows → move the whole block to a fresh
   page (**a derivation step is never split across a page**). If it overflows an empty page,
   warn and let it overflow — that is an authoring error.
3. Freeze each line's measured height (a wrapped line keeps its two-rule box while half
   typed), clear the text, reveal, type at 28 chars/sec (the `public/board-mvp.html` L591-623
   harvest).
4. Boot behind `Promise.race([fonts.load('26px Kalam') → fonts.ready, 2.5s timeout])` —
   measuring in fallback `cursive` breaks every frozen height when Kalam swaps in.
5. `renderUpTo(index)` re-lays-out from scratch for jump/restart — ONE code path, so
   pagination is identical whether the student tapped through or jumped.
6. Mobile never reflows the notebook (that would change pagination) — it scales:
   `transform: scale(fit)`. Print: `@media print` zooms each page 0.96 to fit A4 at 96dpi
   (793.7×1122.5px vs the 820×1160 page — without the zoom every sheet spills ~38px onto a
   phantom extra sheet).
7. The examiner's red marks live in the right-padding gutter, OUTSIDE `.page-body` — so
   `.page-body` must never get `overflow: hidden` (it clips them; found and fixed in the
   first build).

## Mechanism 2 — stroke-drawn figures

`figure.elements[]` — **array order IS the draw order** (no order field to drift).

- Solid ink strokes: `getTotalLength()` → `stroke-dasharray/dashoffset` transition.
- Dashed construction lines: dasharray is already spent on the dashes, so reveal uses a
  **clip-rect wipe** along the drawing axis (`"pen": "pencil"`, `"wipe": "x"|"y"`).
- **Arrowheads are separate ~120ms strokes, never `marker-end`** — a marker paints at the
  true endpoint from frame 0, so the arrow would arrive before the line.
- Labels are `<text>` opacity fades sequenced after their stroke.
- Hand feel v1 = round caps + hand-authored 1–2px imperfect coordinates + the same ink blue
  as the text + no bordered box. **No `feTurbulence` wobble** (fuzzes 2px strokes, costs GPU
  on low-end Android). If wobble is ever added it must be **seeded/authored, never
  `Math.random()`** — every load must render identically (Rule 18 posture).

## AI-chatbot seam (exists; nothing more)

1. Data attributes on every rendered node: `.step-block[data-step-id][data-kind][data-marks]`,
   `.line[data-line-index]`, notebook root `[data-question-id]`.
2. `window.PM_ANSWER` (frozen): `{ version, question, getState(), goToStep(id),
   revealNext(), revealAll() }`.
3. `pm:step-revealed` CustomEvent per completed step + `<aside id="pm-assistant-slot" hidden>`
   in the rail. `margin_note` per step is the grounding text a future assistant reads.
   No fetch, no button, no transcript store until the chatbot actually lands.

## Rule tensions — resolved, do not relitigate

- **Rule 35 (globally neutral content):** no violation. 35c scopes the rule to SIM content;
  this surface is exam-format guidance. Its spirit is honoured structurally — every
  board-specific fact lives in the question header; steps are pure physics.
- **Rule 20 [D] (board mode suspended):** no violation. No concept `mode_overrides` is
  authored or edited; `src/schemas/conceptJson.ts` untouched. The two legacy board overrides
  (`resultant_formula.json`, `direction_of_resultant.json`) were read as a content reference
  only. This store is question-keyed and lives outside `src/data/`.
- **Why not `src/data/`:** `validate-concepts.ts` sweeps every JSON under `src/data/concepts`
  — question files there would break `npm run validate:concepts`.
- **Rule 40 (platform files):** `build_review_site.ts`, renderers, `deriveStateMeta.ts` not
  touched. `build_answer_book.ts` is a new, separate script.
- **Rule 18 (deterministic):** zero runtime API calls, zero randomness.
- **Rule 41 (plain English):** applies to every label/note/button. "The examiner gives 2
  marks for this", never "nail this step".
- **Offline follow-up (undecided):** the single network call is Google Fonts Kalam; the
  fallback font changes pagination metrics. If true offline matters, base64-embed a Kalam
  woff2 subset into the built HTML (precedent: `assets/brand/space-grotesk-latin.woff2`).
  Deferred — it adds a binary to the build.
- **Positioning note:** this is a deliberate student-facing track (founder decision,
  2026-08-20) beside the teacher-facing V1 mission — recorded, not accidental.
