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

## Filters — ONE CARD = ONE QUESTION AT ONE LENGTH (founder review, same day)

The first shipped version matched filters on the UNION of an entry's section and its cuts'
qtypes, and cards wore chips for every length. The founder's review killed it in one screenshot:
a card labelled "SAQ 2" carrying an "LAQ · 8M" chip under an LAQ filter is three contradictions
at once, and the in-notebook "How much to write" switch was a fourth. The model now: **an entry
belongs to exactly its section**, the 8-mark forms are their own LAQ manifest entries (`laq1`,
`laq2` — the book has no LAQ section for Unit 4; these are the TSBIE Section-C forms), every SAQ
entry pins its 4-mark cut, each card shows ONE marks chip and that answer's time, sections render
as sub-groups (LAQ → SAQ → VSAQ, paper-marks order), and **the in-notebook length switch is
GONE** — by the time a student is on the page the length is already chosen. The cut mechanism
survives only in the data, the `#/q/<id>/<cutKey>` router, and `PM_ANSWER.setCut` (a locked test:
"the notebook offers no length switch").

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

## Board landscape 2026-27 — the two IPE patterns diverged (researched 2026-08-20)

The product is built on the TS pattern. In 2026 the two states stopped being variants of one exam,
and the analysis below is what the authoring model rests on. Multi-source web research 2026-08-20;
none of it is from an official circular yet — re-verify against tsbie.cgg.gov.in /
bieap.apcfss.in model papers when they publish.

### Telangana (TGBIE) — our board: theory UNCHANGED, syllabus revised

- **Physics theory stays 60 marks** — explicitly stated in the reform coverage, and the March 2026
  paper ran exactly our structure: Section A 10×2 compulsory · B 6-of-8 ×4 · C 2-of-3 ×8,
  21 questions, 3 hours, English + Telugu. **The Answer Book's model is safe for March 2027.**
- What changes 2026-27 (FIRST year; second year follows 2027-28): the old 30-mark second-year-only
  practicals split into **15 marks per year**, conducted externally at each year's end. Maths goes
  75 written → **60 written + 15 Activity-Based Learning** per paper. Humanities/Languages
  100 → 80 + 20 internal. ("60 + 15 ABL" is the MATHS formula — for Physics the 15 is practicals.)
- **The real exposure is the syllabus revision**, not the pattern: NCERT-aligned for 2026-27,
  ~30% cuts in some subjects (Chemistry named), non-JEE/NEET topics removed, a new "Artificial
  Intelligence in Physics" chapter, QR-coded textbooks. Our inventory is sourced from the 2024
  Fastrack, which compiles the OLD syllabus's exam history. Mechanics (Units 4-6) is NCERT-stable;
  the per-unit inventory still needs a diff against the new TGBIE textbooks when they publish.

### Andhra Pradesh (BIEAP) — already switched, March 2026

AP ran its reformed paper in March 2026 (first year; second year reforms 2026-27). NCERT syllabus
(first year since 2025-26), CBSE-style format. **Physics Paper-I (NEW), Max Marks 85, 3 hours:**

| Section | Questions | Marks | Choice |
|---|---|---|---|
| A | 9 | 1 each = 9 | ALL compulsory — mix of MCQ, fill-in-blank, one-liner |
| B | 14 | 2 each = 28 | ALL compulsory — no choice |
| C | 12 | 4 each, answer 8 = 32 | 8 of 12 |
| D | 3 | 8 each, answer 2 = 16 | 2 of 3 |

Plus 20 internal assessment; practicals separate (pass 11). Pass mark 29/85 (Yr 1).
Source scan: `C:\Users\PRADEEEP\Downloads\AP-Inter-1stYear-Physics-QP-March2026-newpattern.pdf`
(page 1 of 3 — the testbook CDN copy; the full paper is 3 pages). A near-complete transcription
was recovered from exam-day coverage: Section A and B complete, C 6 of 12, D 1 of 3.

### The finding that matters: the AP paper asks OUR questions

From the March 2026 AP paper, transcribed:
- B-13 "What is inertia? What gives the measure of inertia?" — our `ts_ipe_p1_lom_inertia_measure`
  (TS VSAQ 2M ↔ AP Section B 2M: same length, both compulsory sections).
- B-14 "State the relation between kinetic energy and momentum of a body." — our
  `ts_ipe_p1_wpe_kinetic_energy_momentum` (2M in both).
- C-26 "Mention the methods used to decrease friction." — our
  `ts_ipe_p1_lom_methods_to_decrease_friction` (4M in both).
- C-24 "Explain the terms average velocity and instantaneous velocity. When are they equal?" — our
  `ts_ipe_p1_mp_average_instantaneous_velocity` (4M in BOTH — one transcription labelled it
  Section D, but the numbering disproves that: A ends at 9, B at 23, so C runs 24-35 and D 36-38;
  Q24 is a Section C 4-mark question. Every known C question — 24, 26, 27, 30, 31, 32, 35 —
  falls inside 24-35, consistent).

Both boards now draw from the same NCERT-shaped bank at different lengths — which is exactly what
`cuts[]` + the `board` header field model. An AP edition is a re-heading + re-cutting exercise
over the same authored step lists, not a rewrite.

### What an AP edition would need (scoped, not planned)

1. `board: 'ap_ipe'` headers (the field exists) + AP cuts on shared step lists.
2. A `qtype` slot for AP Section A (1-mark objective/fill-in) — the current enum is VSAQ/SAQ/LAQ.
3. AP-specific inventory: the Fastrack star-ranks are TS exam-frequency data and do NOT transfer;
   AP's new-pattern history starts with the March 2026 paper (the seed frequency signal).
4. Note AP Section B: 14 compulsory 2-mark questions, no choice — 2M coverage is worth far more
   there than in TS, where a student can dodge within the section.

### Deliberately NOT done

No pattern_version field, no AP authoring, no schema change. The TS product is structurally safe;
the trigger points are (a) TGBIE's revised theory model papers appearing, (b) the new TS textbooks
publishing (→ per-unit inventory diff), (c) a founder decision to open the AP edition.

## The enumeration method — the VSAQ/SAQ space per chapter is closed (Session 89, 2026-08-21)

A 2-mark answer must fit 2-4 lines, so every VSAQ is one of ~8 archetypes applied to the chapter's
finite object inventory. Archetypes, each evidenced by authored cards / real papers:

| Archetype | Evidence |
|---|---|
| Define X (+ SI unit) | inertia · unit/null vector · work-power-energy |
| State the law | Hooke's law (AP 2026 B) · Kepler's areas (AP 2026 A) |
| Explain with a law | gun recoil · bomb pieces · horse at start |
| Yes/No + reason | can mu exceed 1 · zero vector with non-zero components |
| What-if / special case | mu when weight doubles · a at projectile top · SHM energy at 2A (AP 2026) |
| Relation between two quantities | KE-momentum (both boards, both years) |
| Mini-numerical (2 steps) | batsman 3.6 N s · t = 4 s · the 7-24 resultant |
| Condition / comparison | when is work zero · elastic vs inelastic constants |

Method per chapter: (1) extract the **object inventory** from the textbook (every definition, law,
formula, named phenomenon — ~15-20 objects; use the NEW NCERT-aligned book once published);
(2) cross with the archetypes, delete non-sensical cells → **~30-40 askable VSAQs**, ~10-15 SAQs
(SAQ archetypes add sub-derivations, definition sets, distinguish tables, list-with-reasons,
state-the-laws, medium numericals — numericals enumerate at the FORMULA level, the boards lift
their numbers from textbook examples); (3) rank: asked (appearances) > book-listed (stars) >
predicted; (4) **back-test**: every question actually asked 2019-2026 in either state must fall
inside the grid, else fix the archetype set before the map ships. Honest ceiling ~95% — the claim
is "every question of the last N years plus the full predicted space", never "cannot be surprised".

**Tiered authoring** (the cost half of the doctrine): full cards (figures, full rubrics) ONLY for
the asked core; the predicted tail ships as **lean cards** — schema-valid steps + marks + short
rubric, no figures — promoted to full cards only when a paper season or the teacher pass validates
the cell. Manifest entries carry `source`: absent = Fastrack, `"blm"` = TSBIE BLM only,
`"enumerated"` = predicted; cards render a plain "Predicted — not asked yet" chip (Rule 41).
Empirical footing: the two source books are not supersets of each other even within one unit
(Unit 7: the BLM holds 2 VSAQs the Fastrack lacks; the Fastrack holds 6 SAQs the BLM lacks) —
**the union is the starting bank; enumeration extends past the union.**

### Run 2 — Units 4, 5 and 6 (2026-08-21): the method holds, and the union check flips

The sweep was run over three already-complete chapters. Two findings worth keeping:

**(a) Neither book is reliably the superset, but which one is thinner changes per unit.** Unit 7
needed the union because the BLM held VSAQs the Fastrack lacked. Units 4, 5 and 6 are the opposite:
re-running the check over the BLM's *short-answer* sections (earlier sessions had only checked them
for a Section C) shows the BLM is a strict **subset** in all three — 6 VSAQ + 4 SAQ in Unit 4,
7 VSAQ + 3 SAQ in Unit 5, LAQs only in Unit 6, every one of them already in the Fastrack list.
The asked cores stayed at 20 / 17 / 12 and nothing was added. **The check still has to run per
unit — its ANSWER is what varies, not its necessity.** It also corrected a sourcing claim: Unit 4's
two LAQ entries are *invented* Section-C forms, not the BLM's — neither book has a Unit 4 Section C.

**(b) The archetype set survived three more chapters.** +11 predicted cells in Unit 4, +12 in
Unit 5, +10 in Unit 6 (44 predicted across the four swept chapters). Back-test: every question
either book asks in these units, plus all four March-2026 AP hits from these chapters (B-13, B-14,
C-26, C-24), falls inside the grid. Nothing landed outside — six chapters in, the eight archetypes
have not needed an addition.

**What the sweep found missing is itself a signal about the source books.** The gaps were not
exotic: Unit 5 had neither Newton's **first** nor **third** law anywhere in the bank, and nothing
on angle of repose, the rough incline, or banking; Unit 6 had no scalar product at all, though
NCERT introduces it in that chapter. A star-ranked commercial question bank tracks what was asked,
so it inherits whatever the examiners happened to skip — which is precisely the hole enumeration
exists to fill.

**Cross-unit duplication is a real failure mode of this method** and has to be checked by hand: the
grid for Unit 4 proposes "define angular velocity, derive v = rω", which is already Unit 7 SAQ 7,
and the grid for Unit 6 proposes the vector product, which is Unit 7 SAQ 2. Both were dropped;
the scalar product went to Unit 6 and the vector product stayed in Unit 7, following NCERT's own
placement. **Sweep a chapter against the whole bank, not against its own unit.**

### Run 3 — Unit 8 (2026-08-21): the back-test was too weak, and a real paper proved it

Unit 8 Oscillations was built from both books read page by page (Fastrack pp.23–27, BLM pp.21–24).
The union came back the **Unit 6 shape**: the BLM carries exactly the three LAQs and nothing else,
so both books agree on the 8-mark set and the 3 VSAQ + 2 SAQ list is the Fastrack's alone. 8 asked
entries — the thinnest asked core of any unit — plus 11 predicted, so here the tail is larger than
the core. That is a property of the chapter, not of the method.

**The correction this run forced.** The back-test as written asks: *does every question a real paper
asked fall INSIDE the archetype grid?* Unit 8 passed it, as every unit has. But reading the March-2026
AP paper directly turned up **Section A question 7, "When are two vectors said to be equal vectors?"** —
a **Unit 4** question that neither source book lists, and that the Unit 4 sweep run *earlier the same
day* did not author. "Equal vectors" was in that sweep's object inventory; the cell was dropped when
selecting what to author. The archetype set held perfectly. The **selection from the grid** did not.

> **Back-testing the archetype set is not back-testing the output.** When a real paper is in the
> corpus, diff the sweep's authored list against that paper question by question. "Everything asked
> falls inside the grid" is a statement about the grid; it says nothing about what you actually wrote.

**A third provenance appeared with it.** That card is neither `blm` nor `enumerated` — it was *asked*,
just not by either book. It ships as `source: "ap_2026_paper"` with a real `appearances` entry.
`notebook.js` branches only on `source === 'enumerated'`, so an unknown source value falls through to
the asked-chip path and needed no code change — but that is a property worth knowing before adding a
fourth.

**PROBLEMS, deferred, keep turning out to be examined.** Unit 6 problem 3 carries printed years;
Unit 8 problem 2 (energy when the amplitude is doubled) is the what-if the AP 2026 paper asked, and is
authored here as a predicted VSAQ rather than left in the deferred pile. Two for two. The founder's
2026-08-20 deferral stands, but the evidence against it is now a pattern, not an anecdote.

**The browser label gate earns its place on every new figure.** Four figures were authored for Unit 8
(spring, pendulum, reference circle, energy graph) with a local geometric pre-check that reported
clean. The browser gate still caught two rounds of collisions — `P`/`ω` on the reference circle, then
`mg sin θ` against both `O` and `x` on the pendulum. The reason the pre-check was wrong is worth
knowing: the gate measures `getBoundingClientRect()` on the RENDERED `<text>`, and the SVG is scaled
to the notebook page, so a gap expressed in figure units shrinks on screen while the font does not.
**Empirical rule: leave ≥ 40 figure units of vertical clearance between any two labels whose
horizontal extents overlap** (28 was not enough at these figure widths). Pre-checks triage; the gate
decides.

## The term-pack design (designed Session 89 — NOT built)

The student's year is unit tests → quarterly (late Sept) → half-yearly (Dec) → pre-finals → IPE
(March); every internal exam is the board paper over a smaller chapter window. Design: the student
declares `{exam_date, chapters[]}` (two-tap picker; a later chat shell parses free text into the
same struct — **chatbot is the doorman, never the building**; the offline single file must work
fully without it). Deterministic outputs: filtered bank view · a board-format practice paper over
those chapters (real section counts + choice structure) · a marks-weighted day-by-day plan ·
a term-scoped readiness meter. AI boundaries (Rule 18 as the trust position — "every answer
human-verified; AI only checks YOU"): explain-a-step = DeepSeek grounded strictly in the authored
`why`/`margin_note`/`common_mistakes` (cacheable per step); **memory tips are authored and
measured** (tip → did the next recall pass?), never improvised live. Cost basis: DeepSeek
₹0.045/check (₹0.014 cached), Web Speech free/on-device.

## Marks arithmetic — what full-bank mastery buys (Session 89)

| | TS (60M) | AP (85M) |
|---|---|---|
| LAQ/8M section | 16M, dodge 1-of-3 | 16M, dodge 1-of-3 |
| SAQ/4M section | 24M, dodge 2-of-8 | 32M, dodge 4-of-12 |
| **Choice-protected total** | **40M** | **48M** |
| 2M section | 20M, NO choice | 28M (14 q), NO choice |
| 1M section | — | 9M, NO choice, MCQ/fill-in/one-liner |
| No-choice exposure | 20M (33%) | 37M (43%) |

Full-bank mastery ⇒ ~38-40 choice-protected in TS plus most of Section A → honest ~50-56/60 target.
In AP the compulsory B section makes complete 2M coverage LOAD-BEARING, not garnish. Caveats that
keep "guaranteed" honest: year-one-of-new-syllabus draw risk (absorbed by choice; resolved by model
papers), knowing ≠ producing (the checking loop is the guarantee's enforcement mechanism), and all
mark splits are claims until the teacher pass.

## Board picker = a lens over ONE bank (founder question, Session 89)

When login/state selection lands: the student picks TS or AP once; the catalog stays ONE inventory.
The board choice re-labels section groupings (TS "Section A - VSAQ" content appears under AP's
"Section B" name), selects which header/cut a card opens with, foregrounds that board's Asked
years, and drives that board's marks arithmetic/readiness. TS+AP share the 2/4/8 mark values, so
most cards are valid in both at the same marks; AP adds the 1M drill surface. **Never two
catalogs, never duplicated files** — one card = one question stays law; board affects presentation
and cuts only. Today's `appearances[].board` tags are the data foundation for that view.

## AP paper-merge facts (2025-26 revision, for the record)

Maths 1A+1B merged into ONE 100M paper (was 75+75; objective questions added; pass 26→35).
Botany+Zoology merged into one Biology paper (43+42=85, separate booklets). Physics/Chemistry 85M
each (+20 internal; practicals separate, pass 11; theory pass 29/85 Yr-1).
