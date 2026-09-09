# EAPCET Physics — the three-tab student app, front end first

## Context

The finder is live (https://viditra-eapcet.nagapuripradeep02.workers.dev) with the precise
diagnosis proven on p1-02 (15/15 routes, 9 shapes, three-student report, live walk). The founder
has now defined the whole product as one subject shell with three tabs, and asked for the front
end first, the backend and AI architecture after:

- **Learn and Practice** — the classroom. Chapter → topics → subtopics. A subtopic is one idea:
  a short concept card (plain lines, the one formula, one worked example with small numbers,
  **no simulations**), "Check it" (one belief question), "Apply it" (three basic questions,
  not exam questions, each followed by the finder's "Which way did you go?" chips), then
  "How do you feel?" (recorded, never the mark). Objective: the student holds the concept and
  applies it on basic questions. Must never claim exam readiness.
- **Weakness** — the test hall. The live finder unchanged in behaviour (chapters only, ten real
  EAPCET questions, route tap, result by shape, reward reveal, fix page, sibling retry, "3 in a
  row by the right route" → Strong now). The result page becomes the hub with three actions.
- **Solutions** — the doubt desk. A chat panel: photo (camera or gallery) or typed question;
  first reply is three chips (I tried / stuck at a step / just the solution). This phase has no
  photo reading: the photo flow ends in an honest "not available yet" card and the photo never
  leaves the phone. A typed question is matched client-side to the public pool and opens the
  existing fix page.

Decisions taken with the founder (2026-09-09): evolve the live app **in place** (same single-file
build, same engine, same DOM vocabulary; the 13 e2e + 37 unit tests + students spec stay green);
**real screens on a sample content pack for p1-02** authored now, marked unreviewed, free;
deploy to a **preview worker URL**, never the student site; **refine the current warm paper
look** into a phone-first system (a bottom tab bar is a new component; nothing like it exists).

Defaults I am taking (one string each to flip): tapping the Physics tile lands on **Weakness**
(the measured product; test 1 asserts it), tab order in the bar is Learn · Weakness · Solutions
(the founder's order); Learn content is free; the door's Chemistry and Maths tiles stay "soon".

## Ground truth the plan relies on (verified by reading)

- Shell `eapcet-app/shell.html`: sticky `.topbar` (+ `#btnBack`), six hidden `<section>`s in
  `main.ep-main`; `showView(id)` (`80_screens.js:18-22`) toggles the `VIEWS` array (line 15);
  router `route()` at `80_screens.js:652-665`; `[hidden]{display:none!important}` in `app.css`.
- `app.css` is a byte copy of `answer-book/notebook.css` (Rule 40) — **never edited**; every new
  token and component goes in `eapcet-app/eapcet.css`. `.btn-primary` is used on six elements and
  defined nowhere (today those render as plain `.btn`).
- Helpers inside the Screens IIFE to reuse: `say`, `setChips`, `questionCard`, `markPicked`,
  `routeChips`, `routeLabel`, `routePrompt`, `outcomeText`, `button`, `clear`, `setBack`,
  `lockWall`, `renderSolution`, `sibling`. "Right by the right route" =
  `Diag.outcomeOf(rec, fact).outcome === 'solid'`.
- Build `src/scripts/build_eapcet_app.ts`: validates the release, strips solutions, emits public
  questions (`option_types`, `routes[{id,text,type,option}]` sorted by `fnv1a(qid|id)` line 119,
  `route_key:'r'`, `has_routes`, `theory`), concatenates `app.css + eapcet.css` and `js/NN_*.js`
  sorted (line 141), Rule 41 idiom scan over `05_strings.js` only (146-148), injects the EP_*
  globals (174-178), leak assertion (200-205: no solution string ≥ 12 chars, no
  `"approach"`/`"why_this_step"`/`"common_mistakes"`/`"right_route"`/`"mistake_type_hint"` in the
  HTML). `--hosted` + `--dev-open` refused (63).
- Sync: `ep_sync` (`supabase_migrations/supabase_2026_09_11_eapcet_shapes.sql:87-139`) reads only
  `runs`/`retries` per chapter key; `Run.adopt` (`60_run.js:195-226`) merges only runs, retries,
  streak, strong_now. `Sync.push` posts `Run.all().chapters` only.
- e2e selectors that are **unscoped** (`.ep-msg.tutor`, `.ep-card[data-qid]`, `.ep-score`,
  `.ep-shape-item`, `.ep-fix-btn`, `.ep-chat`, `.ep-chat-input`, `#runChips .ep-chip` with class
  exactly `ep-chip`, `#resultBody .ep-note` last = timing) and asserted texts (`#chaptersSub`, run
  intro, badge texts). New screens must not leave stale nodes with these classes in hidden views.
- Rule 41 (`idiomsIn` in `src/lib/answerBook/vidiChecks.ts:90`) must also cover the pack.

## 1. Information architecture and routes

```
#/                                  door (no tab bar)
#/physics                           Weakness · chapter list (existing)        tab: weakness
#/physics/weakness                  alias → #/physics
#/physics/<ck>                      the run (existing)
#/physics/<ck>/result               result = hub (existing, extended)
#/physics/<ck>/fix/<qid>            worked solution (existing, + learn link)
#/unlock                            existing (tab bar stays, weakness active)
#/physics/learn                     Learn · chapter list                       tab: learn
#/physics/learn/<ck>                topics → subtopics
#/physics/learn/<ck>/<sub>          one concept unit (thread)
#/physics/solutions[/<ck>]          the doubt desk                             tab: solutions
#/notastudent/<word>[/off]          existing (no tab bar)
```
`<sub>` matches `[a-z0-9_]{1,50}`; no topic segment (subtopic keys are unique per chapter).
New branches go **before** the chapter regex at `80_screens.js:659`; unknown `<sub>` → redirect
to the chapter page + toast; chapter without a pack → the empty page (not a redirect).

**Tab bar** (`75_nav.js`, `Nav.init/tabs/from/toast`): `<nav class="ep-tabbar" id="tabbar" hidden>`
after `</main>`, three `a.ep-tab[data-tab][href]` with a 22 px inline SVG + 12 px label, words
from STR. Fixed bottom, `max-width:720px; margin:0 auto`, height
`calc(var(--ep-tabbar-h) + env(safe-area-inset-bottom))`, card bg, top hairline, float shadow,
z-index 25; active = `--ink` + 2 px ink top bar + `aria-current`; inactive `--chrome-dim`. **No
clay** on tabs (clay is reserved for the one forward action). Shown on every `#/physics…` route
and `#/unlock`; hidden on `#/` and `#/notastudent`; `body.ep-has-tabbar` while shown. Sticky chip
rows and `.ep-main` padding lift by the bar height (else Playwright reports intercepted clicks).
`Nav.from()` remembers the previous hash so the fix page's Back can return to Solutions.

**Back button** (one level up inside the tab): Learn list → `#/` "Subjects"; Learn chapter →
`#/physics/learn` "Lessons"; subtopic → the chapter page (chapter name); Solutions → `#/`;
fix page → result, or Solutions when `Nav.from()` was Solutions. Existing labels unchanged.

## 2. Screens (copy is literal; every string lives in `05_strings.js`, numbers as params)

**Door `#/`** — unchanged layout; Physics tile gains `door_physics_line(n, m)`: "Lessons for 1
chapter so far. A ten-question test on 10 chapters. A place to ask about your own problem."

**Weakness chapter list `#/physics`** — `#chaptersSub` text unchanged. Eyebrow "Physics", h1
"Find your weakness". Under `.ep-row-share`, when the chapter has shapes and (a finished run or a
learned shape): `.ep-mastery` (one segment per shape, `data-state`) + `.ep-mastery-sum`
"3 solid · 2 to fix · 1 check · 1 learned, not tested yet · 2 not tried" (zero counts omitted;
also the `aria-label`). Segment priority: `strong` (strong_now) → last run's `fix|check|solid`
→ `learned` (every linked subtopic green, shape not in the last run; dashed sage) → `none`.
`.ep-badge` text untouched.

**Run `#/physics/<ck>`** — unchanged; global gains only (44 px targets, ✓/✕ glyphs via `::before`
on `.ep-opt.right/.wrong`, chips above the bar).

**Result = hub `#/physics/<ck>/result`** — order: h2 → `.ep-score` → `#resultVerdict` →
`#resultConfirmed` → **`.ep-hub`** → bars → groups → timing → reveal → run again.
`.ep-hub` = three `a.ep-hub-btn` (≥ 64 px, card look): **Fix this** (`.ep-hub-primary`, clay; the
first item of the first `fix` shape; hidden when nothing to fix, with `hub_nothing` "Nothing to
fix in this run."), **Learn this** (→ `Learn.nextFor(ck, firstFixShape)`, the first not-green
linked subtopic; when no pack: `.ep-hub-none` "Lessons for this chapter are not written yet."),
**Ask about a problem** (→ `#/physics/solutions/<ck>`). Each `.ep-shape` gets a
`.ep-shape-head` row: label + `.ep-mpill[data-state]` + `a.ep-learn-btn` "Learn this" when
linked (never `.ep-fix-btn`, whose count is asserted). "Run it again" becomes a real
`.btn-primary`.

**Fix page** — after `.ep-fix-opts`, above any lock content: `a.ep-learn-btn` "Learn the idea
first (free)" when the shape has a linked subtopic; `.ep-skel` under `fix_loading`.

**Learn chapter list `#/physics/learn`** — eyebrow "Physics", h1 "Learn and practice", sub "Pick
a chapter. Each lesson is one idea: a short card, one check question, then three practice
questions.", `.ep-sample` banner "Sample lessons. Written by the team, not yet checked by a
teacher." (only when any pack is unreviewed), rows in pool order: pack present → link + badge
"Not started" / "3 of 12 done" (`.ep-badge-strong` when all); no pack → `div.ep-row-closed` +
dashed "No lessons yet". Build without packs → `.ep-empty` "Lessons are not in this build." +
chip "Open Weakness".

**Learn chapter `#/physics/learn/<ck>`** — eyebrow, h1 chapter name, sample banner (when
`reviewed:false`), `.ep-pbar` + "3 of 12 lessons done", topics as `.ep-h3` "Topic 1 · <title>",
subtopic rows `.ep-sub-row[data-sub]`: state dot (hollow / half / filled ✓), title, tags
`.ep-tag-next` "Next" (clay, first not-green), `.ep-tag-fix` "To fix in Weakness" (clay-deep,
when a linked shape is `fix` in the last run), pill "Not started / Started / Done".

**Concept unit `#/physics/learn/<ck>/<sub>`** — **a thread like the run** (reuses
`say/setChips/questionCard/markPicked/routeChips` with a target parameter; owns `#learnThread` +
`#learnChips`). Header: eyebrow "Topic 3 · Free fall", `h1.ep-h1-run` title, `.ep-sample-tag`
"Sample · not yet reviewed", state pill. Sequence:
1. tutor "Read the card. Then check the idea." → **`.ep-concept`** (paper bg, examiner's 2 px
   left rule; `.ep-concept-lines p` 5–8 lines; eyebrow "The formula" + `.ep-concept-formula`
   (Cambria Math) + one-line meaning; eyebrow "One example, with small numbers" + `ol.ep-steps`
   2–4 steps + answer line). Text only. → chips [Check it]
2. **Check it** `.ep-check`: "One question about the idea. No numbers." + 2–4 `.ep-opt`
   statements; pick → "Right." + `why_right`, or "Not this one." + `why_wrong[option]`. No route
   chips; never gates. → chips [Apply it] [Read the card again]
3. tutor "Three practice questions, each a little harder. After each one, tell which way you
   went." → **Apply 1 of 3** = `questionCard(q, "Practice 1 of 3")` → `markPicked` → "Correct.
   Which way did you go?" / "You picked (2). The answer is (3). Which way did you go?" → the
   finder's route chips (`data-route`). After the tap, `Diag.outcomeOf`:
   `solid` → next card; `guessed_right` → "Right, but you guessed. A guess does not count here.
   The three start again."; `right_by_wrong_route` → "Right answer, but the route you tapped
   leads to a wrong option. The three start again."; any wrong → `outcomeText()` line +
   **`.ep-lfix`** card (eyebrow "The fix", the pack's 2–3 line fix for that option; free) + "The
   three start again after a wrong answer. Read the fix, then try again." → chips [Try the three
   again] [Read the card again] [All lessons in this chapter].
4. Three `solid` in one pass → sage card "Done. Three right by the right route." + "You hold
   this idea and used it on three basic questions. Real exam questions are in Weakness."; pill →
   Done.
5. End of every pass: "How do you feel about this idea?" chips [Confident] [Not yet] →
   "Recorded. This does not change any result."
6. Final chips: [Next lesson] (next not-green, hidden when none) [Test this chapter in Weakness]
   [All lessons in this chapter].
The words "ready", "exam ready", "mastered" never appear. Reopening replays the stored check and
the live pass (resume at the owed route or next card).

**Solutions `#/physics/solutions[/<ck>]`** — `section#solutionsView > .ep-ask`: header in
`--brand-dark` with the sage presence dot ("Vidi · your own problem"), `#solThread`, `#solChips`,
sticky `#solRow` (`input.ep-sol-input` 16 px, maxlength 500, placeholder "Or type the question
here" + `button.btn.btn-primary` "Send"), hidden `#solCamera` (`accept="image/*"
capture="environment"`) and `#solGallery` (`accept="image/*"`). Bubbles `.ep-sol-msg.tutor|student
> .ep-sol-text` (styled with the chat bubbles, **not** the asserted `.ep-chat*/.ep-msg` classes;
no `.ep-ai-tag`, everything here is deterministic). Flow:
1. "Bring a problem. Take a photo of it, pick one from your gallery, or type it." + chips
   [Take a photo] [Pick from gallery]; from a result: "You came from <chapter>. Questions from
   that chapter are listed first."
2. Photo → student bubble `.ep-photo` (object-URL preview, `image-orientation: from-image`,
   caption "Your photo. It stays on this phone. Nothing is sent.", [Retake] [Remove]); > 15 MB →
   "That photo is too large (18 MB). Take it again."; decode fail → "That file could not be
   opened as a photo."
3. "What do you want for this one?" + [I tried, here is my work] [I am stuck at a step] [Just
   show me the solution]. Tried → "Take a photo of your working." + camera/gallery chips → second
   photo → the card; Stuck → the card; Solution → the card + "If this is a past EAPCET question,
   type its first line. The app looks for it in the pool of past questions." (focus input).
4. **`.ep-na` card**: eyebrow "Not available yet" (gold-ink), title "Reading a photo is not
   available yet.", body "This version cannot read what is in a photo. Your photo stayed on this
   phone and was not sent anywhere." chips [Type the question] [Open Weakness] [Open lessons].
   No date, no fake progress.
5. Typed → "Is it one of these?" + up to three `.ep-match` cards (eyebrow "<chapter> · <shape
   label>", stem ≤ 160 chars, `.ep-match-btn` "Yes, this one" → `#/physics/<ck>/fix/<qid>`) +
   chip [None of these]; no match → "No past question matches that text. Check the key words, or
   type more of the question." + [Take a photo] [Open Weakness]; < 3 tokens → "Type a few more
   words of the question."
6. The tab is free; the fix page is gated exactly as `showFix` does today (`Gate.known() &&
   Gate.locked()` → `lockWall`, `Sync.bundle`). Leaving the view clears the thread and revokes
   object URLs. The photo is never read into memory beyond the preview, never posted.

**States**: fix loading → skeleton; offline → existing; Learn unknown sub → redirect + toast;
Solutions first open → the greeting chips; dev/preview → `#buildNote` banner.

## 3. Design system (all in `eapcet.css`)

Tokens (`:root` at the top): spacing `--sp-1..8` (4/8/12/16/20/24/32), type `--fs-eyebrow 11.5,
--fs-small 13, --fs-body 15, --fs-lead 16.5, --fs-stem 18, --fs-h2 22, --fs-h1 26, --fs-score
30`, radii `--r-card 14, --r-row 12, --r-opt 10, --r-pill 999`, shadows `--shadow-card`,
`--shadow-float`, `--gold-wash #FBF3DC`, `--gold-ink #8A5F00`, `--ep-tabbar-h 56px`, `--tap 44px`,
mastery pairs `--m-none/fix/check/solid/strong/learned` (fix = clay wash/clay-deep, check =
gold, solid = sage wash/sage-deep, strong = sage-deep/white, learned = paper + dashed sage).
Colour roles: clay = the one forward action + chips; clay-deep = the examiner's pen (wrong, to
fix); sage = right/open/done; gold = attention; dashed sage = claimed by the classroom, not yet
confirmed by the test hall. No dark mode (house style).

`.btn-primary` defined (clay bg, white, clay-deep on hover/focus, `:disabled` opacity .45);
`.ep-body .btn { min-height: var(--tap) }`; `.ep-again` drops its own background.

Components: `.ep-eyebrow`; `.ep-tabbar/.ep-tab`; `.ep-mpill[data-state]`; `.ep-mastery` +
`.ep-mastery-sum`; `.ep-pbar > .ep-pbar-fill` (sage, 240 ms); `.ep-concept*`; `.ep-check`;
`.ep-lfix`; `.ep-verdict-ok`; `.ep-hub*`; `.ep-photo*`; `.ep-match*`; `.ep-na`; `.ep-empty`;
`.ep-sample/.ep-sample-tag`; `.ep-skel`; `.ep-toast` (fixed above the bar, `role=status`);
`.ep-chip` padding 11/16 (≥ 44 px, class name unchanged); `.ep-opt` min-height 44 + glyphs.
Motion: 120–160 ms colour/border, `epRise` 180 ms on new thread blocks, bars 240 ms; all off under
`prefers-reduced-motion`; `:hover` rules wrapped in `@media (hover: hover)`; `:focus-visible`
2 px ink ring (clay-deep on chips). Breakpoints: base ≤ 599 (14 px gutters, h1 24, stem 17),
≥ 600 (20 px gutters), ≥ 900 (720 px column). `shell.html` viewport gains `viewport-fit=cover`;
inputs 16 px (iOS zoom); `.ep-main { overflow-wrap: anywhere }`, formulas `overflow-x: auto`.

## 4. The content pack and its gates

Location this phase: `eapcet-app/content/learn/p1-02.json` (app repo; sample content). Schema
`src/schemas/eapcetLearn.ts` (Zod, `.strict()`), `schema: 'eapcet_learn_pack_v1'`:
```
{ chapter_key, chapter_name, reviewed: false, authored_by: {agent, at},
  topics: [{ key, title, subtopics: [{ key, title, shapes: [shape_key…],
    concept: { lines: string[5..8] ≤160, formula: { text ≤80, meaning ≤120 },
               example: { given ≤200, steps: [{text ≤160, equation? ≤80}] 2..4, answer ≤80 } },
    check: { stem ≤300, options: string[2..4], answer, why_right ≤200, why_wrong: {opt: line} },
    apply: [ { variants: [ LearnQuestion 1..2 ] } ×3 ] }] }] }
LearnQuestion = { id /^lq_p[12]-\d{2}_[a-z0-9_]+_\d{2}$/, stem ≤300, options[4] ≤80, answer,
  difficulty 1|2|3 (rising across the three slots),
  routes: [ {id:'r', text}, {id:'m0'|'m1'|'m2', text, type: concept|application|calculation|careless,
             option (≠ answer), fix ≤240} ] }
```
No `right_route`/`common_mistakes`/`approach` field names anywhere (leak assertion). Build folds
each variant into the public shape (`option_types` from routes, `routes` sorted by the pool's
FNV hash, `has_routes:true`, `theory:false`, `route_key:'r'`; `fix` moved to a `fixes{option}`
map) and injects `window.EP_LEARN = { schema, chapters: {ck: pack}, links: {ck: {shape: [sub…]}} }`
(links derived from `subtopics[].shapes`). Gates (named superRefine messages, unit-tested like
`poolSchema.test.ts`): unique subtopic keys and question ids; exactly one `r` route per question;
every wrong option carries a route phrase of its own, whatever its type (the classroom needs a
chip for every explained option, unlike the pool where calculation entries have none); route phrase rules
(starts "I ", ≤ 12 words, no `\d{2,}`, unique per question, ≠ any option/line); `idiomsIn` empty
on every string; every `shapes[]` key exists in the chapter's release shapes; no apply stem
equals a pool `question_en`; sizes warn > 40 KB, fail > 80 KB. Build flags: `--learn=<dir|none>`
(default `eapcet-app/content/learn`); an unreviewed pack is allowed in offline, `--dev-open` and
`--preview` builds and **refused by `--hosted`** (same posture as line 63).

**p1-02 pack** (4 topics, 12 subtopics, one shape each; the shape → subtopic link table):
Position/velocity/acceleration: `average_velocity`, `velocity_from_x_t`, `acceleration_from_v`
(→ `velocity_from_position_equation`), `position_from_v_t` (→ `position_from_velocity_equation`);
Uniform acceleration: `three_equations` (→ `basic_equations_of_motion`), `nth_second`
(→ `nth_second_distance`), `two_stage_stopping` (→ `deceleration_two_segment_ratio`); Free fall:
`free_fall_distance`, `odd_number_rule` (→ `free_fall_interval_distance`), `throw_up`
(→ `vertical_projectile_up_and_down`), `zero_v_nonzero_a` (→ `zero_velocity_nonzero_acceleration`),
`two_stage_fall` (→ `multi_phase_vertical_motion`). Authoring: a brief
`eapcet-app/content/learn/_BRIEF_LEARN.md` (Rule 41, the route rules, basic numbers, no exam
twists, no simulations, never copy a pool stem), four `model: sonnet` authors (one per topic,
files written immediately), the schema gate, then one `model: opus` checker per topic for physics
correctness and the "could a correct solver say this wrong route?" test; `reviewed:false` stays
until a teacher signs off.

## 5. State and rules

`ep_state_v1.learn` — a new top-level branch **beside** `chapters` (never pushed by `Sync`, never
touched by `Run.adopt`; a later `ep_sync` merge is additive):
```
learn: { '<sub>': { ck, opened, opened_at, check: {picked, correct, at}|null,
  pass: { started_at, records: [{qid, picked, correct, route, ms}] }|null,
  passes: [{ at, n, outcome: 'green'|'ended', ended_at_i }], green_at: 'YYYY-MM-DD'|null,
  feel: 'confident'|'not_yet'|null, feel_at } }
```
`60_run.js` exports `save` (one line). **Mastery rule (decided):** green when the three Apply
questions are `solid` in one pass in order; a wrong pick, a guess or right-by-a-wrong-route ends
the pass (the student reads the fix, starts the three again); green is sticky; pass *n* uses
`variants[n % len]`. Same "three in a row by the right route" rule as the test hall.

Modules (build sorts by filename): `52_learndata.js` (`LearnData`: read-only over `EP_LEARN` —
`pack, chapters, topics, subtopic, question, links, facts(q)`), `57_learn.js` (`Learn`, pure, no
DOM/storage/clock, tested via `new Function` like `55_diag.js`: `passStatus(records, facts)`,
`subtopicState(entry)` → none|started|green, `progress(learn, pack)`, `shapeState`, `masteryOf(
strongNow, lastDiagShapes, learn, links)` → `{shape: strong|fix|check|solid|learned|none}`,
`subtopicsFor`, `nextFor`), `58_match.js` (`Match`, pure: `normalise` (NFKD, lower, super/
subscript map, non-alphanumerics → space), `tokens` (30-word stoplist, trailing `s` stripped),
`score` = |Q∩D|/√(|Q||D|) with numeric tokens ×2, substring → 1.0, `find(text, questions, ck)`
→ score ≥ 0.35 and ≥ 3 shared tokens (2 if one numeric), top 3, ties to the context chapter),
`65_study.js` (`Study`: the writer over `Run.all().learn` + `Run.save()` — `open, check,
startPass, apply (returns the outcome), endPass, feel, state, progress, chapterLine`; every tap
saves before the screen moves), `75_nav.js` (`Nav`), `82_learn_screens.js` (`LearnScreens.list/
chapter/subtopic`), `84_solutions.js` (`Solutions.show(ck)`). `80_screens.js` exposes
`Screens.ui = {say, setChips, questionCard, markPicked, routeChips, routeLabel, routePrompt,
outcomeText, button, clear, setBack}` (`say`/`setChips` gain a target parameter), extends
`VIEWS` with `learnView, subtopicView, solutionsView`, clears a view's dynamic containers when
the router **leaves** it (so hidden views never hold `.ep-card[data-qid]` etc.), hooks
`Nav.tabs()` in `showView`, adds the routes. `90_boot.js`: `Nav.init()` before `route()`; banner
shown for `Data.DEV_OPEN || EP_BUILD.preview`.

Telemetry (names only, `Track.log` inert offline): `tab`, `learn_open`, `learn_check`,
`learn_apply`, `learn_pass`, `learn_green`, `learn_feel`, `learn_link`, `sol_open`, `sol_photo
{kind, bytes}`, `sol_chip`, `sol_ask {chars, hits, top}`, `sol_pick {qid, rank}`, `sol_unavailable`.

## 6. Build and preview deploy

- `build_eapcet_app.ts`: `--learn=<dir|none>`, pack validation + fold + `EP_LEARN` injection,
  `EP_BUILD += {learn: [ck…], preview}`, `--preview` (requires the EP_* env like `--hosted`,
  refuses `--dev-open`, default out `eapcet-app/dist-preview`, built-at comment ` preview`, head
  `<meta name="robots" content="noindex">`, unreviewed packs allowed), console summary per pack,
  leak-assertion message names the pack as a possible cause.
- `wrangler.eapcet-preview.toml`: `name = "viditra-eapcet-preview"`, `[assets] directory =
  "./eapcet-app/dist-preview"`; npm `build:eapcet:preview`, `serve:eapcet:preview` (8120),
  `deploy:eapcet:preview`. Scratchpad `ep_ship_preview.sh` = build (EP_* inline, `--pool=<corpus
  release>`) → wrangler → curl proof (present: `EP_LEARN`, a concept line, `"routes"`; absent: the
  five solution field names and a known solution phrase; locked-bundle probe with the preview
  `Origin` → `locked:true`).
- After the first deploy prints the URL, append it to `ORIGINS=` in the scratchpad
  `ep_deploy_functions.sh` and run it (secrets + redeploy `ep-state`, `ep-vidi-chat`); until then
  the preview's paid half fails closed (403) while runs and lessons work.
- `.gitignore` += `eapcet-app/dist-preview/`.

## 7. Tests

Unit (`src/lib/eapcet/__tests__/`): `learnSchema.test.ts` (a valid pack fixture + one mutation
per gate), `learn.test.ts` (pass rule: three solid in order → green; guess / wrong route / wrong
pick end the pass; green sticky; `masteryOf` precedence strong > run > learned > none; `nextFor`),
`match.test.ts` (normalisation, stoplist, exact stem → 1.0, first eight words of the stone 4 s /
8 s question → its qid first ≥ 0.6, unrelated text → none, top-3, chapter tie-break).

e2e: `e2e/eapcet_helpers.ts` gains `learnFixture()` (2 topics × 2 subtopics for `OPEN_KEY`, one
link per `SHAPES` key, phrases obeying the rules and distinct from `STEP_TEXT`/`MISTAKE_*`),
`writeLearnDir()`, `currentLearnCard()`; **both existing `beforeAll` builds pass `--learn=<fixture
dir>`** (else the real p1-02 pack fails against the fixture's closed p1-02). New
`e2e/eapcet_learn.spec.ts`: tab bar hidden on `#/`, shown on `#/physics` with three hrefs and the
right active tab; `#/physics/weakness` alias; the loop end to end (card, sample tag, check, three
applies by `r` → green pill, feel recorded, `green_at` date, chapter row "learned, not tested
yet"); a wrong-route apply ends the pass and the fix card shows, retry → green; unknown sub
redirects; chapter without pack shows the empty page; result hub (three actions, "Learn this"
resolves to the first fix shape's subtopic, Back reads the chapter). New
`e2e/eapcet_solutions.spec.ts`: typed match → cards → fix route (offline `fix_not_built` note);
photo via `setInputFiles` → `img[src^="blob:"]` → chips → `.ep-na` visible; `watchRequests()`
still empty; hosted+locked: typed match → fix → `#lockWall`, no solution byte, no request body
over 20 KB. The 13 existing tests and the students spec stay untouched apart from the build arg.

## 8. Verification

1. `npx vitest run src/lib/eapcet` — 37 + new green. 2. `npm run smoke:eapcet` — 13 + new.
3. `npm run smoke:eapcet:students` — green (default learn dir → the real pack must validate
against the real release). 4. Offline build with the real pack; read the pack summary.
5. `bash scratchpad/ep_ship_preview.sh`; note the URL; run `ep_deploy_functions.sh` with the
origin added; re-run the curl proof. 6. Phone pass (Android Chrome + iPhone Safari): tab bar
clears the home indicator; run chips tappable above it; Learn p1-02 → a subtopic to green and
"Confident"; Weakness row shows the learned line; a result's "Learn this" lands on the right
subtopic and Back returns to the chapter; Solutions: camera opens, gallery opens the picker,
preview upright, the "nothing is sent" line and the not-available card show, airplane mode
changes nothing; typed first words of a p1-02 question find it; preview banner visible; the fix
page shows the lock wall on a locked device. 7. Commit on feat/eapcet-app with the trailers;
report to the founder with the preview URL and the pack marked unreviewed.

## 9. Order and sizes (each step keeps the 13 tests green)

1. Foundation: tokens, `.btn-primary`, targets, focus, motion, tab bar CSS/HTML, toast,
   viewport; `75_nav.js`; clear-on-leave in `showView` (0.5 d)
2. Router branches, `VIEWS`, back rules, `Screens.ui`, `Run.save` — run the 13 tests (0.5 d)
3. Schema + gates + `learnSchema.test.ts`; build `--learn`/`--preview`; toml; npm scripts (1 d)
4. `52_learndata`, `57_learn` + test, `58_match` + test, `65_study` (1 d)
5. Pack: brief → four sonnet authors → gate → four opus checks (1 d, parallel with 6–7)
6. `82_learn_screens` + STR (1.5 d)  7. Result hub, chapter mastery line, fix link (0.5 d)
8. `84_solutions` (1 d)  9. e2e specs (1 d)  10. Preview deploy, origins, phone pass (0.5 d)

Risks: fixed bar intercepting clicks (offsets, verified at step 2); the leak assertion tripping
on a pack line that copies a solution (rewrite it); Rule 41 now covering pack text; learn state
device-local until `ep_sync` learns the branch; the preview origin missing from
`EP_ALLOWED_ORIGINS`; unscoped e2e selectors (clear-on-leave + distinct `.ep-sol-*` classes).

## Out of scope (recorded)
Backend for Learn sync and the photo reading (Mathpix/Gemini/DeepSeek routing, SymPy checker,
BKT/FSRS planner); chemistry and maths packs; sign-in deploy; the money path.
