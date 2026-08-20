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

---

# Tier 1 — modes, teaching layer, self-assessment (added 2026-08-20)

One page, three students: the sprinter tests himself, the reviser writes and self-scores, the
learner reads why each step exists. All from the same authored data, at zero running cost.

## Mode model

`mode` is one closure variable with three values, switched from a rail toggle. **Every switch
routes through `renderUpTo(-1, false)`** — clearing `#notebook` directly would leave orphan
typing timers that still mutate `stepIndex`/`marksEarned` when they fire.

- `study` (default) — tap through + `why`/`common_mistakes` rail cards
- `exam` — tap through, no extras. **Byte-identical to the pre-Tier-1 behaviour**, and that is
  the regression the e2e suite guards.
- `test` — the notebook stays blank; `advance()` early-returns so tapping the page does nothing.

## The rail-only invariant

`why` and `common_mistakes` render **only in the rail**, never inside `.step-block`. Two
engine facts force this: `typeLines` types **every** `.line` descendant, and `placeStep` freezes
**only** `.line` heights while paginating on the block's total `offsetHeight`. A teaching note
in the block would be typed out as if it were part of the answer *and* would move the page
break. The e2e test asserts no `.step-block` ever gains a child outside
`line | red-mark | figure-wrap | total-underline`.

## Self-scoring

The model step is revealed **before** the student is asked — harder to over-credit yourself
than a blind yes/no. `Partly` = half marks, so totals are non-integer; `fmtMarks` prints `6.5`
but `6`, never `6.0`. Zero-mark steps get a plain "Next" instead of a verdict, because a student
cannot lose marks that were never on offer. The redo list carries each step's first
`common_mistakes` entry, so the miss teaches instead of only scolding.

The accumulator card is hidden in `test` mode: it counts how much of the notebook has been
*revealed*, and a "0/8" beside "you would have scored 6 out of 8" reads as a contradictory
second result.

## A CSS trap worth remembering

`.btn-mic { display: flex }` **beats the `hidden` attribute's UA `display:none`**, so the mic
button stayed visible with no endpoint configured — breaking the offline promise in the UI
while every other check passed. Fixed globally with `[hidden] { display: none !important; }`
near the top of the stylesheet. Caught by e2e, not by eye; any future component with an
explicit `display` needs the same care.

## Cuts: the same question at two lengths (built 2026-08-20, founder decision)

Was deferred; now built. The founder's call: build the LAQ **and** offer the SAQ beside it, so a
student can see *how much to write* for each. The eight append-only breakages listed here were
real and all five enabling changes landed.

**Model.** A cut is a *view over the one authored step list*, never a second copy of the answer.
`question.cuts[]` — each cut carries its own `qtype`, `marks_total`, `paper_section`,
`expected_time_min`, `mark_split`, and a `steps` map of `step_id -> { marks, label?, lines?,
mark_note? }`. **A step id absent from that map is omitted from the cut.** `cuts[0]` is the
default and the schema forces it to restate the root header, so a consumer that knows nothing
about cuts (the graders, `PM_ANSWER`) still reads the truth. A question with no `cuts` is
wrapped in a synthesised single cut, so every existing question works untouched.

**Coherence is the author's job** — the Rule 38a test applied here: with the omitted steps
hidden, no surviving line may refer to something only an omitted step introduced. On the
parallelogram SAQ, dropping `s3_construction`/`s4_legs`/`s6_direction` meant the magnitude and
direction steps had to re-state θ, α, OACB, CD and OD in their own `lines` override. Nothing
enforces this; the schema only checks marks and membership.

**What the refactor changed.** `renderChrome` split into `renderMeta()` / `renderMarkSplit()` /
`renderStepList()` / `renderCutSwitch()`, each clearing first (append-only was why a second
render stacked duplicate chips, split rows and pills, and why pill click handlers kept indices
from the previous step set). `steps` and `marksTotal` are derived from the active cut instead of
captured once. `page_header` is DERIVED (`pageHeaderLines()`), never literal — a hardcoded
"· 8 marks" cannot follow a switch. `fitNotebook()` runs at the end of every `renderUpTo`.
Schema gains per-cut mark-sum, split-sum, membership and diagram-override checks plus the paired
root/`cuts[0]` equality check. Switching cut **restarts** the answer — it is a different answer,
not a filter.

**Photo and mic are default-cut only.** Both grade server-side against the question's full step
list (the endpoints take a `question_id` and know nothing about cuts), so on a reduced cut they
would mark a student down for omitting steps that cut deliberately drops. The panel says so.
The self-check has no such problem — it scores in the browser from the steps on screen — so it
works on every cut. Make the graders cut-aware before lifting this.

**Both splits are still claims.** `needs_teacher_verification` is now per cut, and the rail note
follows whichever cut is on screen. For the parallelogram: the 8-mark split comes from the TSBIE
Basic Learning Material, the 4-mark one from the Sri Chaitanya Fastrack — which lists the
question as SHORT ANSWER 1 of Unit 4 and has **no LONG ANSWER section in the chapter at all**.
The sources disagree, which is exactly why the student can switch. *Which steps a 4-mark answer
may omit is invented and needs a Telangana IPE teacher.*

**A line-wrap test now exists** (`no written line wraps past its own height, in either cut`). It
measures rendered height against computed line-height rather than guessing a character budget,
and it caught three over-packed lines in the first SAQ draft that no other gate saw.

---

# Test yourself — photo + mic (2026-08-20, replaces the three-mode toggle)

The Study / Exam / Test-myself toggle is **removed**. There is one entry — a **Test myself**
button in the top-right corner — opening an overlay with two ways to be checked:

- **Photo or PDF** → vision model proposes which steps it can see → **the student confirms a
  tick-list** → only ticked steps count.
- **Speak it** → the spoken-recall check, unchanged.

Both render through one `renderCheck(res, source)`.

## Why the photo path proposes instead of marking

`recallGrader` can verify an evidence quote by substring-matching it against the transcript
(guard G4). **A photo has no transcript**, so that guard cannot exist. The student's confirmation
replaces it: a misread of untidy handwriting costs one tap instead of becoming a wrong
accusation. `photoGrader` therefore returns *proposals*, the browser recomputes the total from
the ticks, and the server total is provisional only.

The same asymmetry as the mic path is kept in the model's favour: a low-confidence read
(< 0.5) becomes **unsure**, never **missed** — bad light is a photo problem, not a student
problem.

## Endpoint configuration

One env var, `ANSWER_BOOK_API_BASE`; the client derives `/recall-check` and `/photo-check`
(replaces the old `ANSWER_BOOK_RECALL_ENDPOINT`). Each path is gated on its own key —
`SARVAM_API_KEY` for the mic, `GOOGLE_GENERATIVE_AI_API_KEY` for the photo — and a missing key
returns 503, which hides that option rather than showing a broken button. With no base at all
the page makes zero network calls, asserted in e2e.

## The teaching layer moved

`why` and `common_mistakes` are still authored and validated but no longer render while tapping
through. They surface **in the redo list** after a check, where a miss is exactly the moment the
explanation is wanted.

## Two layout traps found by tests, not by eye

1. **A third top-bar button overflows a phone.** `Test myself` beside `Restart`/`Print` pushed
   `scrollWidth` to 432 on a 390 px viewport. Fixed by letting `.topbar` wrap under 560 px. The
   existing mobile no-horizontal-scroll test caught it.
2. **`display:` beats the `hidden` attribute** (recorded earlier for `.btn-mic`) — the reason
   `[hidden] { display: none !important; }` sits near the top of the stylesheet. Every new
   component with an explicit `display` depends on it.

---

# Catalog — the landing view (added 2026-08-20, founder decision)

The product opens on a **catalog**, the way Viditra does for teachers: chapters listed, questions
inside, filterable by VSAQ / SAQ / LAQ, with search. One self-contained file still — the catalog
is a VIEW (`#catalogView` / `#notebookView`), routed by `location.hash`:

    #/                      catalog (the default)
    #/q/<question_id>       notebook, default cut
    #/q/<id>/<cutKey>       notebook, that cut

Back/forward work from `file://`; an in-notebook cut switch writes the hash back (`syncHash`), so
the current view is always shareable. `route()` no-ops when the target state is already on screen
— without that, the hash write-back would re-load the question it just rendered.

## `units.json` — the manifest

The catalog lists the BOOK'S inventory, not just what is authored (founder: show the chapter's
true shape). `answer-book/units.json` carries every question the Fastrack lists for a unit —
section (VSAQ/SAQ), number, **star rank** (stars live here, not in the question schema: the
ranking belongs to the inventory), and text. An entry with `question_id` opens in the notebook;
`cut` names which length that book entry corresponds to (SAQ 2 and SAQ 4 both map to the
projectile file, different cuts). No `question_id` → a dimmed, unclickable "Not written yet" card.

**Drift is a build failure in both directions** (`build_answer_book.ts`): an authored question
missing from the manifest would be invisible in the catalog; a manifest pointer at nothing would
be a dead card. Both exit 1 naming the offender — the PILOT_CONCEPTS silent-drop lesson applied
here before it could happen.

## Filters

The qtype chips match on the UNION of an entry's book section and its authored cuts' qtypes — the
projectile counts under LAQ and SAQ both. Counts on the chips are static per build (an inventory,
not a moving target). Opening a card resolves WHICH cut: the entry's own `cut` wins when it fits
the active filter, else the first cut of the filtered qtype — and the time chip follows the same
resolution, so a card mapped to the 4-mark cut never advertises the 8-mark answer's minutes.

## Design language

Anatomy echoes the Viditra teacher catalog (narrow 780px column, chapter sections with 999px count
pills, cards with a trailing arrow, border-tint hover, chip vocabulary) but in THIS product's
light paper palette — the Viditra dark tokens were deliberately not imported (`--ink` and `--red`
mean different things there). Signature: every card carries a thin red left rule, the examiner's
margin line from the notebook.

## What replaced the question picker

The rail `<select>` (`#qCard`) is gone; `← All questions` in the topbar returns to the catalog.
`PM_ANSWER.openQuestion(id, cutKey?)` is the seam tests and the AI layer use; `openCatalog()`
goes back. Cut overrides gained `margin_note` and `why` — the root wording can state a mark count
a reduced cut contradicts ("the two marks are for the words alone" beside a 1-mark step), and the
first catalog screenshot caught exactly that on the parallelogram SAQ cut.
