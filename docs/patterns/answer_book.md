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
- **Rule 18 (deterministic):** the notebook makes zero runtime API calls and has zero
  randomness. **Amended 2026-08-20 by the spoken-recall check** — see the section below; the
  amendment is deliberate and founder-approved, not a drift.
- **Rule 41 (plain English):** applies to every label/note/button. "The examiner gives 2
  marks for this", never "nail this step".
- **Offline follow-up (undecided):** the single network call is Google Fonts Kalam; the
  fallback font changes pagination metrics. If true offline matters, base64-embed a Kalam
  woff2 subset into the built HTML (precedent: `assets/brand/space-grotesk-latin.woff2`).
  Deferred — it adds a binary to the build.
- **Positioning note:** this is a deliberate student-facing track (founder decision,
  2026-08-20) beside the teacher-facing V1 mission — recorded, not accidental.

---

# Spoken-recall check (added 2026-08-20)

A student taps a mic and says, from memory, the SKELETON of how they would write the answer
("first the statement, then draw the parallelogram, then construction, then R equals root
P squared plus Q squared plus 2PQ cos theta"). We report what they covered, what they did not
say, and roughly what they would score.

**Why it works pedagogically:** a student cannot recite a derivation verbatim, but they can
recite its skeleton — and the skeleton is exactly what the mark scheme pays for. A 60-second
spoken recall predicts the 15-minute written answer well enough to be useful, and it digitises
a habit students already have (revising aloud) rather than teaching a new one.

## The Rule-18 amendment (deliberate, founder-approved)

The original record said "zero runtime API calls, works from `file://`". That still holds for
the notebook. The check is **progressive enhancement**:

- It appears only when the build receives `ANSWER_BOOK_RECALL_ENDPOINT`. Unset (the default) →
  no mic, no fetch, page byte-identical to before. Asserted in `e2e/answer_book.spec.ts`.
- The model **generates no physics and no marks**. It performs a *matching* task against an
  authored rubric. Ids are intersected against real step ids; every evidence quote is verified
  to occur in the transcript; **the score is summed server-side from authored marks** and the
  model never sees a number. Conductor, not composer — the Rule 18 floor is intact.

## Rubric field (`steps[].recall`, grader-side only)

`credit: name_it | say_it` · `must_convey` · `accept[]` · `reject[]` · `heard_as[]`, plus a
top-level `recall_prompt`. **All steps or none** (build-enforced): a partial rubric would
report an ungraded step as missed. **Stripped from the browser copy** — the API reads the
question file itself, so `reject` lists and grader wording never ship.

`credit: name_it` is founder decision 2 made mechanical: a student physically cannot speak a
drawing or a construction, so **naming the move is full credit**. It is one enum on three
steps and it removes the largest class of false negative before the model is even asked.

## The seven guards (`src/lib/answerBook/recallGrader.ts`)

A confident wrong "you missed this" is the one failure that kills this feature. Seven guards
stand in the way, cheapest first:

| # | Guard |
|---|---|
| G1 | `credit: name_it` — the "cannot speak a drawing" class, removed by authoring |
| G2 | **< 12 words → `not_enough_heard`, no LLM call at all.** An accidental tap costs nothing |
| G3 | `on_topic: false` → retry screen; no score, no misses |
| G4 | **Evidence quote not found in the transcript → "not sure", NOT "missed."** A failed check almost always means the model paraphrased, not that the student failed; dropping straight to missed would manufacture the exact false negative we are guarding against |
| G5 | Asymmetric floors: **≥0.50 to credit, ≥0.70 to accuse.** The gap is the generosity, expressed as a number |
| G6 | `heard_as` rescue demotes missed → not sure. Deliberately never promotes to covered — a stray "theta" must not earn a step |
| G7 | An omitted/malformed step is "not sure", never "missed"; **zero-mark steps are never listed as missed** (a student cannot miss unmarked content) |

Also: the score is clamped to `[0, marks_total]`; the order note reports **at most one**
earliest inversion using `mark_split` labels and has **no code path to a number**;
`normalizeForQuote` keeps a raw-index map so the UI highlights the student's *actual* words,
punctuation and all.

The spoken-maths repair map (`tan universe` → `tan inverse`, `parallel program` →
`parallelogram`, `pythagorus` → `pythagoras`, `theater` → `theta`) lives in the grader, not in
question files — it is speech-to-text behaviour, not physics, and every question shares it.

## Cost

≈ **₹0.60 per check** at a 60-second recording. Sarvam STT is ~83% of that; the LLM is
rounding error. The two levers that matter are both client-side: a **90-second hard cap** and a
**silence/short-tap gate that never uploads** (turns an accidental tap from ₹0.60 into ₹0).

## Client capture — the non-obvious constraint

**Sarvam STT rejects webm/opus, so `MediaRecorder` is a dead end.** The client captures raw
Float32 PCM through a ScriptProcessor into a silent gain sink, then hand-writes a 16 kHz mono
16-bit RIFF header (`encodeWav`, ported from the voice-professor branch). Do not "simplify"
this to MediaRecorder.

## Hosting — the open follow-up

The endpoint currently runs only on `npm run dev` (localhost:3000), and the Next app is
deployed nowhere. When this goes public the natural home is a **Supabase Edge Function** — the
only deployed runtime in the repo that already holds secrets (`Deno.env.get`), on the same
project the static pilot site already talks to, with `supabase/functions/razorpay-webhook/` as
the structural template. Both Cloudflare Workers are assets-only (`[assets]`, no `main`). Two
things that template lacks and a public endpoint needs: **CORS** and an **abuse gate** — the
Answer Book has no login, so there is no JWT to rate-limit on, and each call spends real money
on Sarvam plus the LLM. Decide that before exposing it.

## Language

Speech input is **code-mixed English + Telugu, auto-detected** (`language_code` is deliberately
omitted from the Sarvam request). All rendered feedback is English. Rule 30i governs what the
product *ships*, not what it can *understand* — accepting how a Telangana student actually
revises aloud is not a Telugu surface.
