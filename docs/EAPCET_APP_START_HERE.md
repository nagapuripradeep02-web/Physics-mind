# EAPCET student app — START HERE

The handoff for the competitive-exam student product. Read this first in any new session that
touches EAPCET. Written 2026-09-10, at the end of the three-tab front-end session.

## 1. Where the work lives — read this before you touch anything

**Nothing about this product is on `master`.** The main checkout `C:\Tutor\physics-mind` is on
`master` and does not carry `eapcet-app/` at all. Two worktrees hold everything:

| Worktree | Branch | What it holds | Tip at handoff |
|---|---|---|---|
| `C:\Tutor\physics-mind-eapcet-app` | `feat/eapcet-app` | the app: shell, CSS, JS modules, build script, schemas, e2e, lesson packs | `a5f70cc6` |
| `C:\Tutor\physics-mind-eapcet-corpus` | `feat/eapcet-solutions` | the corpus: bank, solutions, route sidecars, shapes, pool releases, the audit scripts | `970a7a0f` |

Both are clean and pushed. No pull request is open for either. `feat/eapcet-app` is 44 commits
ahead of `master` and 3 behind; `feat/eapcet-solutions` is 49 ahead and 3 behind. They are meant to
stay separate desks — the app never edits corpus files, the corpus never edits app files.

`PROGRESS.md` is branch-scoped: the app worktree's copy carries the app sessions, `master`'s copy
carries the simulation and Answer Book sessions, and neither can see the other. The cross-session
channel is the memory directory.

## 2. What the student sees today

**Live, students:** https://viditra-eapcet.nagapuripradeep02.workers.dev — worker `viditra-eapcet`,
config `wrangler.eapcet.toml`. This is the finder alone. A `--hosted` build deliberately leaves an
unreviewed lesson pack out and prints a line saying so, so shipping the student site stays safe
while lesson content is still a sample.

**Live, preview:** https://viditra-eapcet-preview.nagapuripradeep02.workers.dev — worker
`viditra-eapcet-preview`, config `wrangler.eapcet-preview.toml`. This is the three-tab app with the
sample lessons, marked noindex, with a banner saying the lessons are not yet checked by a teacher.
Show this one to the founder and the team. Never deploy sample content to the student worker.

The three tabs:

- **Learn and practice** — chapter, then topics, then lessons. A lesson is a text concept card
  (lines, one formula, one worked example with small numbers, no simulations), one "Check it"
  belief question that never gates, three "Apply it" practice questions each followed by the
  finder's "Which way did you go?" route chips, then "How do you feel?" which is recorded and never
  scored. Green means three right by the right route in one pass. A wrong pick, a guess, or a right
  answer reached by a wrong route ends the pass and shows the pack's fix for that option. Green is
  sticky. Pass number n uses variant n modulo the variant count.
- **Weakness** — the original finder, behaviour unchanged. New around it: each chapter row shows a
  per-shape mastery line, the result page is now a hub offering Fix this, Learn this and Ask about
  a problem, each shape group carries a mastery pill and a lesson link, and the fix page offers
  "Learn the idea first (free)".
- **Solutions** — photo from camera or gallery, or typed text. The photo stays on the device, is
  never posted, and the flow ends in an honest "reading a photo is not available yet" card. Typed
  text is matched client-side against the public question pool and opens the existing fix page,
  with Back returning to Solutions.

## 3. The state model, and the one thing a backend must not break

Student state is a single local object `ep_state_v1`. It has two top-level branches:

- `chapters` — the finder's runs and retries. This is the only branch `Sync.push` sends to the
  server, and the only branch `Run.adopt` merges back.
- `learn` — one entry per lesson key, holding the check answer, the live pass, the pass history,
  the green date and the feel. **Nothing syncs this today.** It is device-local by design, so a
  student who changes phone loses lesson progress but never loses diagnosis history.

When the backend learns this branch, the merge must be additive and must never let a server reply
clear a local green. `Run.adopt` deliberately does not touch `learn` today; keep that true.

## 4. Content: how a lesson pack is made and gated

A pack is one JSON file per chapter at `eapcet-app/content/learn/<chapter_key>.json`, schema
`eapcet_learn_pack_v1`, validated by `src/schemas/eapcetLearn.ts` (zod, strict). The gates that
matter: exactly one right route per question, one typed wrong route per wrong option, route phrases
that start with "I ", stay within twelve words, carry no two-or-more-digit number, and avoid
hindsight, verdict and contrast wording; an idiom scan over every reader-facing string; every shape
key must exist in the release; no practice stem may copy a real exam stem; size warns over 40 KB
and fails over 80 KB.

The authoring loop, proven once on p1-02:

1. The brief `eapcet-app/content/learn/_BRIEF_LEARN.md` carries the rules.
2. Four Sonnet authors, one per topic, write `_parts/<ck>.topicN.json`.
3. Merge the parts into the pack, then run any offline build to hit the schema gate.
4. Four Opus checkers, one per topic, write `_checks/<ck>.topicN.md`.
5. Rework in place, re-merge, re-gate, then re-check and append a round-2 section.

p1-02 result: 4 topics, 12 lessons, 36 practice questions, 58 KB. Round 1 found 130 ok, 47 weak,
1 wrong and 5 harmful. Round 2 found 144 ok, 7 weak, 0 wrong and 1 harmful. All eight round-2
findings are corrected. The pack stays `reviewed: false` until a teacher signs it off.

**The harmful test cuts both ways.** A wrong route is harmful if a student who reached the correct
answer could honestly say it. Round 2 caught one that round 1 passed: a phrase naming a step the
correct working also performs, dividing by twice the distance. Read every route against the
correct method, not only against the mistake it describes.

## 5. Commands

Run these from the app worktree. `.env.local` here is a HARD LINK to `C:\Tutor\physics-mind\.env.local`
(made with `mklink /H`, 2026-09-10) and that file now carries the non-secret bases `EP_CHAT_BASE`,
`EP_STATE_BASE`, `EP_PHOTO_BASE`, `EP_STAFF_WORD`, so the npm scripts that pass `--env-file=.env.local`
work from this worktree.

```
npx tsx src/scripts/build_eapcet_app.ts --pool=<release> --out=<dir>   # offline build = the content gate
npx vitest run src/lib/eapcet                                          # 101 unit tests
npm run smoke:eapcet                                                   # 13 e2e, the finder
npm run smoke:eapcet:learn                                             # 9 e2e, lessons and solutions
npx playwright test e2e/eapcet_photo.spec.ts                           # 2 e2e, show me your working
npm run smoke:eapcet:students                                          # the three-student spec (3003 draws each)
npx tsc --noEmit -p tsconfig.json
npm run content:push:eapcet -- --pool=<release>                        # verified solutions + routes -> ep_solutions
npx tsx --env-file=.env.local src/scripts/build_eapcet_app.ts --preview --pool=<release>
npx wrangler deploy -c wrangler.eapcet-preview.toml                     # the preview worker, never the student site
```

The pool release lives in the corpus worktree at
`C:/Tutor/physics-mind-eapcet-corpus/eapcet/pool/physics_pool_v1.release.json`. Edge Functions deploy
with `npx supabase functions deploy <name> --no-verify-jwt --use-api --project-ref dxwpkjfypzxrzgbevfnx`
(`SUPABASE_ACCESS_TOKEN` from `.env.local` in the environment). Migrations are applied ONCE through the
Supabase MCP `apply_migration`; `supabase_2026_09_10_eapcet_finder.sql`, `_09_11_eapcet_shapes.sql` and
`_09_12_eapcet_photos.sql` are applied — never re-run them.

## 6. Traps that cost time in this session

- **The students spec rewrites its own report.** Running `smoke:eapcet:students` overwrites
  `docs/reports/eapcet_students/` and drops any hand-written section. Restore with
  `git checkout -- docs/reports/eapcet_students/` after every run.
- **A module-level variable can shadow a function in the same IIFE.** `var pack = L.chapters[ck]`
  inside a loop shadowed `function pack()` and silently broke every lesson screen and the result
  hub at once. Name loop variables so they cannot collide with the module's own API.
- **A Playwright probe script must live inside the worktree.** The scratchpad cannot resolve
  `@playwright/test`. Put it in `e2e/_probe/` and delete it afterwards.
- **Chrome screenshots time out on the result and fix pages** while JavaScript keeps answering.
  Read the DOM through the JavaScript tool instead of waiting for a picture.
- **The preview origin is a different device.** Browser storage is per origin, so the founder's
  granted device id on the student site does not carry over to the preview. Expect the lock wall
  there until that origin's device id is granted too.

## 7. Next session, in order

1. **Founder: enable billing on the Google AI project behind `GOOGLE_GENERATIVE_AI_API_KEY`.** It is
   on the free tier (20 requests per day per model for gemini-2.5-flash), so the photo step answers
   "could not be read just now" for everyone once 20 photos have been read. Nothing else in the
   photo path is blocked: the function, the migration, the client and the caps are live and proven.
2. **Founder walk on the preview** (https://viditra-eapcet-preview.nagapuripradeep02.workers.dev,
   his Chrome's preview-origin device `d6e474ca-…` is granted): a number question asks for the
   number first; chips come before the verdict; every wrong answer names its mistake; the result
   leads with shapes; a photo of working on a fix page returns a tick-list (after item 1).
3. **One real student walks it**, then the founder decides on the student-site deploy
   (`npm run deploy:eapcet`). No second chapter before that walk and the first week's photo ledger
   (`ai_usage_log` where `task_type = 'eapcet_photo_read'`).
4. **Then expand**: p1-03 and p1-05 through the same strict corpus loop (45/45, student-word
   routes, hosted controls), one chapter at a time.
5. **Learn tab** still waits on a teacher review of the p1-02 pack; sync of the `learn` branch is
   still unbuilt.

Blocked on the founder: Google billing (above); the p1-02 shape labels; the spot sheets
`_spot/wave_01.md` and `_spot/wave_02.md`; escalations q092 and q099; the q101 exclusion; the
domain; the founding price; a teacher review of the lesson pack; the Obsidian vault sync proposal.

## 8. Related documents

- `docs/superpowers/specs/2026-09-09-eapcet-three-tabs-frontend-design.md` — the approved plan for
  this session's work, including the parts deliberately left out of scope.
- `docs/superpowers/specs/2026-09-09-eapcet-precise-diagnosis-design.md` — the earlier diagnosis
  engine spec.
- `eapcet-app/content/learn/_BRIEF_LEARN.md` — the lesson authoring rules.
- `PROGRESS.md` in this worktree — the session-by-session record for this branch.
- `docs/EAPCET_CORPUS_START_HERE.md` on `master` is an early build brief whose status line still
  says nothing has been written. The corpus has since been built. Treat that file as history.
