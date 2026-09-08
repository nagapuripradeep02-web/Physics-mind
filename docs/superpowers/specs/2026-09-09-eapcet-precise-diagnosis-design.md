# EAPCET finder — a diagnosis built from observations, not self-report

Date: 2026-09-09. Status: design, awaiting founder review. Supersedes the "Run state
machine" and "diagnose()" paragraphs of `~/.claude/plans/splendid-swimming-codd.md`. Everything
else in that plan stands.

## 1. Purpose

The finder tells a student what kind of mistake they make in a chapter. Today the only
evidence for the *kind* is the student's own tap after a wrong answer ("I knew it, my
calculation slipped"). That tap cannot be checked, and students misattribute: the face-saving
answer is "slipped" whether or not the concept was there. The founder's requirement is a
diagnosis with no invention in it: every sentence a student reads must restate something we
observed.

This design makes three changes and nothing else:

1. **The tap becomes checkable.** After every answer, right or wrong, the student is asked
   "which way did you go?" and picks one of three short routes written by the author of the
   solution, or "I guessed". The route they claim is checked against the option they picked.
2. **The wrong option becomes evidence.** Every wrong option that an author has explained is
   tagged with the kind of error that produces it. Picking it is an observation of that error.
3. **The unit of diagnosis becomes the exam's own question shape**, authored per chapter, not
   the four-label histogram. The student never selects a sub-topic; the run is composed to cover
   the chapter's shapes and the result names them.

The diagnosis engine stays a pure function with no model in it. The AI tutor (Vidi) receives
the precise diagnosis as input and stays labelled and grounded, as today. Photo and voice input
are recorded as the sequel (section 15) with one invariant: they never change the diagnosis.

## 2. What the student experiences

Physics, then a chapter, then ten questions. Each question is two taps.

**Tap one: the answer.** Scored instantly against the official key, exactly as today. The key's
option is tinted, the pick is tinted.

**Tap two: "Which way did you go?"** A menu of three routes plus "I guessed". The three are the
worked solution's route and two wrong routes, all first person, at most twelve words, in a
stable shuffled order with nothing marked. Examples for the free-fall question:

- "I found the distance by 12 s and took away the first 4 s"
- "I treated the next 8 seconds as a fresh fall from rest"
- "I used the ratio of the squares of the times"
- "I guessed"

A theory question has no route. It keeps today's "Were you sure? I was sure / I guessed".

The route menu appears after the answer is scored, so it never helps the answer. It does show
the correct approach, unmarked, for free. That is accepted: it is the same class of give-away as
the key itself, and the paid value is the full worked steps, the mistake texts, the retries and
the tutor.

**The result** names shapes, not labels. Per question it states the shape and what happened as
a fact. Grouped:

- *Solid:* shapes answered right by the right route.
- *To fix:* shapes answered wrong, each with the reason observed. "Distance in the nth second:
  you took the right route and picked the option you get by dropping the half." "Relative
  velocity: you started from the wrong route, treating the two speeds as if they added."
- *Check these too:* shapes answered right by a guess or by a wrong route. Right for the wrong
  reason is not strength.

Below that, the parameter summary the founder asked for, derived from the same facts: how
many wrong answers came from a wrong route (concept or application, split by the route's
type), how many from a slip on the right route (calculation), how many were guesses, how many
were answered in under fifteen seconds and wrong. A weakness sentence is printed only when the
evidence clears the threshold in section 6.

Then the paid half, unchanged in shape: the worked solution with the student's own mistake
first, Vidi told exactly which route and slip, and siblings of the weak shape until three in a
row are right by the right route.

## 3. The evidence model

Signals, ranked by cost to the student and by whether we can verify them:

| Signal | Cost | Verifiable | Source |
|---|---|---|---|
| The option picked | zero | yes | the tap |
| The kind of error that option is known to come from | zero | yes, when the author labelled it | `common_mistakes[].type` |
| The route the student claims | one tap | yes, against the option picked | the route tap |
| Time from render to tap | zero | yes | `ms` |
| The same shape on a retry | one more question | yes | siblings |
| The four-way "what happened?" cause probe | one tap | no | **removed** |

Two of these can disagree, and the disagreement is itself information. A student who claims the
right route but picked the option that only a wrong route produces is rationalising. The
observed evidence (the option) wins; the mismatch is recorded and the tutor is told, so it can
say so kindly.

## 4. Content: three new authored fields and a shape list

All through the blind-author, key-gate, blind-audit, planted-control loop that produced the
solutions. The two founder-checked worked examples in the author brief get the new fields.

### 4.1 On every `common_mistakes` entry: `type` and `route`

```
common_mistakes: [
  { option: 3, type: "application",
    text: "Treating the next 8 seconds as a fresh fall from rest, ½g(8)² = 32g, instead of ...",
    route: "I treated the next 8 seconds as a fresh fall from rest" },
  { option: 2, type: "calculation",
    text: "Dropping the ½ in ½gt², which gives 16g and 128g and the ratio 8 either way ...",
    route: null }
]
```

- `type` is one of `concept | application | calculation | careless`. *Concept:* the physics
  belief behind the route is wrong. *Application:* the concept is known but applied to the
  wrong quantity, interval, body or frame. *Calculation:* the route is right and a number,
  sign, unit or algebra step went wrong. *Careless:* misread the question or the options.
- `route` is required when `type` is `concept` or `application` (the mistake *is* a route) and
  must be `null` when it is `calculation` or `careless` (the route was right). First person, at
  most twelve words, no number of two or more digits, passes the Rule 41 idiom scan, and must
  not equal `text`.
- `option` stays as it is: the option the mistake leads to, or `null` when the mistake leads
  nowhere in the printed options. An entry with `option: null` and a `route` still appears in
  the route menu; it just cannot be confirmed by the option picked.

### 4.2 On every solution: `right_route`

First person, at most twelve words, the approach of step 1 in the student's voice, or `null` for
a theory or recall question that has no route. The field is required and nullable, so an author
must decide it. The gate requires it to be non-null when `mistake_type_hint` is `calculation` or
`application`, because such a question has a route by definition; when the hint is `concept` the
author decides and the auditor checks the judgement.

### 4.3 The authoring pass for existing solutions

This is a **sighted** pass, by design. The routes and types are derived from an already-verified
solution, not from solving the question, so the author reads the solution. They still never
open the key file or the bank. Dispatch is `dispatch.py --plan --wave 1 --role routes`, one
slice per chapter, agents `model: sonnet`. The audit role gets the question, the solution, and
the new fields, and grades: a wrong `type`, a `route` that does not describe its `text`, a
`right_route` that does not match step 1, a give-away number. Planted controls swap one type or
attach a route to the wrong entry; an auditor who passes one is discredited, as today.

The new fields are excluded from the solution's `content_sha`, so adding them does not flip a
verified solution back to unverified and does not close any open chapter while the pass runs.
They are covered by a second hash, `routes_sha`, over `right_route` and every entry's `type`
and `route`. The route audit's verdict keys on `routes_sha`, is stored beside the solution audit
as `verified.routes`, and a question's route menu is emitted only when that verdict is `ok` or
`weak`. Until then the question behaves as a theory question in the run: it asks "Were you
sure?" and diagnoses from the option alone.

| Content to author | Count |
|---|---|
| Common-mistake entries to type | 252 |
| Of those, concept or application entries needing a route phrase | an estimated 150 |
| Right-route phrases, one per solution with a route | up to 146 |
| Wrong options with no authored explanation at all | 248 of 438 |

The 248 unexplained options are not required for Phase A. An unexplained pick yields the
outcome "wrong, no labelled evidence" (section 6) and the run still diagnoses from the route
tap. Explaining them is a follow-on authoring wave that raises the confirmed share.

### 4.4 Shapes, authored per chapter

**Finding that shaped this section.** Trigram similarity over the release does not cluster the
pool. On the 146 verified questions, at the recurrence threshold 122 are singletons; at 0.35,
107; at 0.25 a chapter collapses into one cluster of 12 that is only shared vocabulary. The pool
was selected to take the most-recurring question of each shape and round-robin across years, so
inside a 15-question pool almost every question is the sole representative of its shape. Shapes
therefore cannot be derived; they are authored.

- `scripts/eapcet/propose_shapes.py` prints, per chapter, the **full kept bank** (30 to 50
  questions, not the 15-pool) clustered at the recurrence threshold with digits masked, plus
  the singletons, each with its text. An agent proposes a shape list for the chapter: 5 to 12
  shapes, each a `key`, a student-facing `label` of at most six words, and a one-line
  `definition`. It assigns every pool question of the chapter to one shape. Unassignable
  questions get the chapter's `other` shape, which the result screen shows as the chapter name.
- The founder reviews the labels. They are reader-facing text and fall under Rule 41.
- Output `eapcet/pool/shapes.json`:
  `{ "<chapter_key>": { "shapes": [{key, label, definition}], "assignments": {"<qid>": "<key>"} } }`.
- `build_release.py` joins the shape onto each question and the shape list onto each chapter.
  Gate: every verified question in an open chapter has an assignment; every assigned key is in
  the chapter's list; every listed shape has at least one pool question; labels pass the idiom
  scan; at most 12 shapes per chapter.

In wave 1 most shapes have one verified question. The result screen therefore states each
question's outcome as a fact about that question ("on X you went wrong by Y"), never "you are
weak at X" from one item. Wave 2's 25-per-chapter pool is what gives shapes a second and third
question.

## 5. Data contracts

### 5.1 Solution file (`eapcet/solutions/<qid>.json`)

Adds `right_route` (string or null) and, on each `common_mistakes` entry, `type` (enum) and
`route` (string or null). `content_sha` excludes them; `routes_sha` covers exactly them. Schema
version stays `eapcet_solution_v1` with the fields required; there are no solutions in the wild
outside this repo.

### 5.2 Release (`physics_pool_v1.release.json`)

Each question gains `shape: {key, label}`. Each chapter gains `shapes: [{key, label}]`. The
`solution.verified` block gains `routes: {routes_sha, audit_verdict, audited_by}`, or `null`
when the route audit has not passed. The `built_from` block gains `shapes_sha256`.

### 5.3 The public pool baked into `index.html`

The build strips `solution` and `verified` from every question, as today, and adds three
deliberately public fields:

- `shape: {key, label}`
- `routes: [{id, text}]`, present only when `verified.routes` passed, sorted by a hash of the
  question id and the route id so the order is stable and unmarked, holding the right route
  with `id: "r"` and each routed wrong route with `id: "m<k>"` where `k` is its index in
  `common_mistakes`. Absent for a theory question or an unaudited one.
- `route_key: "r"` when the question has routes, else absent.
- `option_types: {"<option>": "<type>"}` for every labelled wrong option. Types only, never the
  mistake text.

The leak assertion keeps checking that no `approach`, `steps[].text`, `steps[].equation`,
`why_this_step` or `common_mistakes[].text` string from any solution appears in the artifact.
Route phrases are separate strings and the gate has already enforced `route != text`.

### 5.4 The record written by a run

```
{ qid, picked, correct, ms, route }
  route: "r" | "m<k>" | "guess" | "sure" | null
```

`route` replaces `probe`. `"sure"` and `"guess"` are the only values a theory question can
write. `null` means the tap is still owed (the mid-run reload case). A legacy record carrying
`probe` and no `route` is scored for `correct` only and excluded from every tally; there are no
students, so nothing is migrated.

### 5.5 Persisted chapter state (`ep_state_v1`, unchanged key)

`runs[].records` as above. `retries[]` gains `shape_key` and `route`, and keeps `probe` as the
derived value the server counts: `"sure"` when the route was the right one (or the theory tap
was sure), `"guessed"` when guessed, `"wrong_route"` otherwise. `streak` and `strong_now` are
keyed by shape key instead of mistake type. Each retry records `same_shape: true|false`.

## 6. The diagnosis engine

`eapcet-app/js/55_diag.js` stays a pure function tested by
`src/lib/eapcet/__tests__/diagnose.test.ts`. It now takes the records **and** the public pool's
per-question facts (`route_key`, `option_types`, `shape`), and returns per-question outcomes,
grouped shapes, parameter tallies, the weakness verdict, and timing.

### 6.1 Outcome per record

Let `right = (route === route_key)`, `wrongRoute = route starts with "m"`, `labelled =
option_types[picked]`, `distractorRoute` = whether that labelled type is concept or
application.

| Correct | Route tap | Labelled pick | Outcome | Parameter |
|---|---|---|---|---|
| yes | right, or theory "sure" | n/a | `solid` | none |
| yes | `guess` | n/a | `guessed_right` | guessed |
| yes | a wrong route | n/a | `right_by_wrong_route` | guessed |
| no | `guess` | any | `guessed_wrong` | guessed |
| no | a wrong route `m<k>` | none, or the option `m<k>` names | `wrong_route` (type of `m<k>`), `confirmed` when the option matches | concept or application |
| no | a wrong route `m<k>` | an option a *different* entry names | the labelled entry decides: `slip` if its type is calculation or careless, else `wrong_route` with its type; `mismatch: true` | that type |
| no | right | calculation or careless | `slip`, `confirmed` | calculation |
| no | right | concept or application | `wrong_route` with that type, `mismatch: true` | that type |
| no | right | none | `slip_unconfirmed` | calculation |
| no | theory "sure" | any | `wrong_belief`, `confirmed` when labelled | concept |
| no | null (tap still owed) | any | not scored | none |

The observed evidence (the option) always outranks the claim (the route) when they disagree.
`mismatch` is carried to the result screen and to the tutor.

Additive flag on any wrong record: `rushed` when `ms < 15000`. It never changes the outcome; it
is reported as a fact and counted under "time".

### 6.2 Tallies and the verdict

- `params`: `{concept, application, calculation, guessed, rushed}` from the table.
- `shapes`: `{solid: [{key,label}], fix: [{key,label,outcome,reason}], check: [...]}`, one entry
  per question, grouped by outcome, in run order. `reason` is a template over the outcome and,
  when labelled, the type: the mistake *text* is paid content and is never in the free result.
- `weakness`: the largest of `{concept, application, calculation}` when it is at least 2; ties
  resolve concept, then application, then calculation. If
  none clears 2 and `guessed >= 3`, the verdict is `guessed`. If neither and `score >= 8`, the
  verdict is `solid`. Otherwise `null`, and the sentence says the run did not show a pattern and
  a second run will.
- `confirmed_share`: confirmed outcomes over wrong outcomes, shown on the result as "n of your
  m wrong answers are confirmed by the option you picked". This is the honesty line: it tells
  the student how much of the diagnosis is observation and how much is their own claim.
- `sec_per_q` and `exam_sec_per_q` as today.

Every sentence on the result screen is a template in `05_strings.js` over these fields. There is
no model on this path.

## 7. The draw

`Data.draw(ch, runNo, deviceSeed, seenIds)` stays seeded and replayable and adds a shape
blueprint:

1. Candidates are the chapter's verified ids. Split into unseen (not in the previous run) and
   seen, as today.
2. Round one takes one question per shape, shapes in seeded random order, unseen before seen
   within a shape.
3. Round two fills to ten from what remains, unseen first, seeded.
4. The ten are ordered easy, then medium, then hard, stable by seed within a difficulty, so time
   per question is comparable across students and a student meets the chapter gently.

A chapter with fewer than ten shapes simply repeats shapes in round two. A chapter with more than ten shapes rotates which shapes a run covers across runs,
because round one's order is seeded by run number.

## 8. Retry and strong-now, by shape

`Data.sibling(qid, ch, seenOrder)` picks, in order: the first unseen verified question of the
same shape; the first unseen entry of the similarity sibling list, as today; any unseen verified
question; the least recently seen. It returns `{qid, same_shape}`.

A retry launched from a question of shape S is a sibling attempt for S. Correct by the right
route (or theory-sure) extends `streak[S]`; anything else resets it to 0. At 3, `strong_now[S]`
is set and the chapter badge reads "Strong now: <label>" when all three retries were
`same_shape`, else "Strong now on similar questions". The retry-in-panel flow, the streak line
and the "See its worked solution / Try another one" buttons stay as they are.

## 9. What the tutor is told

The client keeps sending only ids and enums, never free text: `question_id`, `picked`,
`route` (`r | m<k> | guess | sure`), `solid_shapes` and `weak_shapes` (arrays of at most 20 keys
matching `^[a-z0-9_-]{1,40}$`). The server resolves every phrase from `ep_solutions` itself and
derives the mismatch from `picked`, `route` and the solution's own entries, so no student-typed
string enters the prompt outside the question they ask, and no client claim is taken on trust.

`ep_solutions` gains a nullable `shape jsonb` column `{key, label}`, filled by the push script.
`factsOf` adds `SHAPE: <label>` and, under COMMON MISTAKES, each entry's type. The situation
block adds, when present:

- `- this question's shape: <label>`
- `- the route they said they took: "<text>" (the worked solution's route | a wrong route)`
- `- the option they picked is the one you get by: <mistake text> (<type>)`
- `- their route claim and their option disagree: they said "<route>", but option N is what "<mistake text>" gives`
- `- in this chapter they are solid on: <labels>; going wrong on: <labels>`

The persona gains one rule: "When the situation names the route the student took and the slip
their option shows, open with that, in their words, before anything else. When it says the claim
and the option disagree, say what the option shows and ask which they actually did; never call
the student a liar." The three chips stay; "Which mistake did I make?" is shown only when the
pick was wrong, as today.

## 10. Backend

- Migration `supabase_2026_09_11_eapcet_shapes.sql`, create-only and re-runnable, adds
  `ep_solutions.shape jsonb`, `ep_retries.shape_key text`, `ep_retries.route text`,
  `ep_retries.same_shape boolean`. `ep_sync` accepts and stores the three retry fields, keys the
  streak recompute by `shape_key` instead of filtering `mistake_type` against the four type
  words, and keeps counting `correct and probe = 'sure'`. `mistake_type` stays for the legacy rows a team device may have written and is no
  longer read.
- `push_eapcet_content.ts` pushes the shape per row and validates the release against the
  extended zod schema.
- `ep-state` returns the bundle as today; the bundle already carries the whole solution, so the
  paid page has `right_route`, types and routes without a second fetch.
- `ep-vidi-chat`: section 9. Guards unchanged.

## 11. Telemetry

`probe {qid, type}` becomes `route {qid, route, outcome, mismatch}`. `run_done` gains
`params` and `confirmed_share`. `retry_start` and `retry_pick` gain `shape_key` and
`same_shape`. `strong_now {chapter, shape_key, same_shape}`. Nothing else changes.

## 12. Verification

**Content gates (`gate_solutions.py`), new checks in order after `idioms`:** `types` (every
entry typed), `routes` (route present exactly when the type demands it, at most twelve words,
first person, not equal to `text`, no number of two or more digits), `right_route` (present
or null per 4.2), `shape` (assigned and listed, open chapters only). `--baseline` keeps
diffing verdict flips on unchanged shas. The release prints, per wave, the confirmed-option
share the pool can deliver: labelled wrong options over all wrong options.

**Unit (`diagnose.test.ts`):** every row of the outcome table with a fixture pool; the mismatch
rows; the weakness thresholds and tie order; the `guessed` and `solid` verdicts; the null
verdict; the rushed flag; a legacy `probe` record excluded from tallies; `confirmed_share`.

**e2e (`eapcet_app.spec.ts`), added to the eleven:** the route menu appears after a correct
answer and after a wrong one, holds three routes plus "I guessed", and marks nothing; a theory
question shows "Were you sure?" instead; the result groups shapes into solid, fix and check
with the fixture's expected reasons; a mismatch record prints its line; the draw covers every
fixture shape in round one; a same-shape sibling is preferred and `same_shape` is recorded; the
strong-now badge wording differs for same-shape and similar; the free page still holds no
solution byte and no mistake text.

**Live walk, team device:** one run on Motion in a Straight Line with two deliberate mismatches;
`ep_runs.records` carry `route`; `ep_retries` carry `shape_key`; `ai_usage_log` metadata shows
the route and mismatch reached the tutor; the tutor's first sentence names the student's route.

## 13. Rollout

There are no students. Team devices hold a handful of legacy runs; the engine ignores their
records for tallies and the page shows them as score only. No storage key bump, no data
migration. Order of work: content pass (4.3, 4.4) and app engine (6, 7, 8) in parallel, because
the engine can be built and unit-tested on a fixture pool while authoring runs; then schema and
push (5, 10); then the tutor (9); then the e2e additions; then the live walk; then deploy.

## 14. Limits carried, stated in the product

- Wave 1 has mostly one verified question per shape. The result states facts per question, and
  "strong now" on a shape is honest only after wave 2 gives shapes siblings.
- About 57 percent of wrong options have no authored explanation yet. A pick on one of those
  diagnoses from the route tap alone and is reported as unconfirmed. The confirmed share is
  printed on the result so the student can see it.
- The route claim is still a claim. The design catches the case where it contradicts the
  option; it cannot catch a wrong claim that happens to be consistent with the option.
- Time is a flag, not a parameter. Fifteen seconds is a constant, not a per-question norm.
  Per-question expected times come from students, later.
- The server trusts the page's derived `probe` on a retry, exactly as it does today.

## 15. Sequel: photo and voice, and the invariant

Phase B adds a photo of the student's working inside the paid chat. A new function beside
`ep-vidi-chat` stores the image in a private bucket, sends the image with the verified steps and
the student's route and slip to a vision model, and replies with a comparison **phrased as
questions** ("on line 3 I read 32g, is that what you wrote?"), labelled as an AI answer, with a
one-tap "that is not what I wrote". Phase C adds "talk me through it" on one weak shape, with
Sarvam speech to text in front of the same grounded comparison.

The invariant for both: **they write nothing to the run, the diagnosis, the streak or the badge.**
They are tutoring, and their readings are stored beside the student's confirm or deny. Whether
an AI reading can ever touch the measurement is decided later by measuring its agreement with
the deterministic outcomes across many students, never by design.

## 16. Corrections to what was said in conversation

- "Shapes clustered from the sibling structure we already compute" was wrong. Measured in
  section 4.4; shapes are authored.
- "About 290 wrong routes to write" overstated the work. Wrong routes are phrases on existing
  concept and application mistakes; the count is closer to 150 phrases plus up to 146 right
  routes.
