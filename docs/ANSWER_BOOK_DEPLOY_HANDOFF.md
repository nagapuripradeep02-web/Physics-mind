> **[SUPERSEDED 2026-09-23 — this deploy is DONE.]** The formula sheet is live on
> answers.viditra.co. For the next deploy use **`docs/ANSWER_BOOK_DEPLOY_HANDBOOK.md`**,
> which covers the whole surface. This file is kept as the record of how the sheet shipped.

# Handoff — deploying the formula sheet to answers.viditra.co

> Written 2026-09-21, after PRs #227–#231 merged to master. The code is **done and
> verified**; only the publish step is left, and it could not be done from the Mac
> this was built on. Take this to a machine that can log in to Cloudflare.

## Why this is a handoff and not a deploy

Two things blocked the publish, and only the first is a real blocker:

1. **Cloudflare is not authenticated on the build Mac.** `npx wrangler whoami` →
   *"You are not authenticated"*, `~/.wrangler` does not exist, and no
   `CLOUDFLARE_API_TOKEN` is in the environment. `wrangler login` is an interactive
   browser flow, so it needs a person at the machine.
2. **`content:push:live` was deliberately NOT run on its own.** The Supabase keys for
   it do exist (`.env.local` in the main checkout), so it was possible — but pushing
   new content bundles while the old page is still served puts fresh answers behind
   stale code. The two steps belong in one sequence, run by whoever runs step 1.

## What is already true

- **master = `ee6db1ac`**, carrying #227 (the sheet + Maths-1A), #228 (1B), #229 (2A),
  #230 (2B), #231 (the session record).
- **The live artifact builds clean from master** — 8.92 MB, all four sheets:
  1A 97 formulas / 1B 45 / 2A 35 / 2B 27, and 924 of 1459 maths cards tagged.
- **The gated artifact was driven in a browser and works**: the Formulas tab appears
  on all four maths papers and on no other, two seeded Understand ticks filled the
  sheet to 5 of 97, a locked row's formula is absent from the DOM, the "N questions
  away" counts resolve from the gated metadata, and the console is clean.
- CI `verify` passed on every PR. The full Playwright suite is 88 passed / 2 failed,
  and **both failures reproduce on a branch carrying none of this work** — they are
  pre-existing (`Simplify writes ONE mark…` and `hosted: telemetry…`).

## Prerequisites on the deploying machine

1. A checkout of this repo on **master at `ee6db1ac` or later**, with `npm install` done.
2. **`.env.local` present at the repo root.** It is gitignored and never committed, so
   copy it from the build Mac's main checkout (`~/Desktop/Viditra/Physics-mind/.env.local`).
   `content:push:live` needs `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` from it.
   **If you work in a `desk:new` worktree, hard-link rather than copy** so the secret is
   never duplicated and never goes stale.
3. **Cloudflare login**: `npx wrangler login`, then confirm with `npx wrangler whoami`.
   The account must own the `viditra-answers` Worker and the `answers.viditra.co`
   custom domain.

## The deploy, in order

```bash
# 1. the page. This REBUILDS the artifact first (five streams, gated) and then
#    uploads it — never point wrangler at a directory some other script built.
npm run deploy:answers

# 2. the answer bodies the gated page fetches on unlock.
npm run content:push:live
```

`deploy:answers` = `build:answers:gated:live && npx wrangler deploy -c wrangler.answers.toml`.
The Worker is `viditra-answers`; `routes` in `wrangler.answers.toml` auto-attaches
`answers.viditra.co` on deploy. The directory it serves is
`./answer-book/dist-gated-mpc+mpc_2+bipc_2+mec+mec_2` — the five live streams
(MPC, MPC second year, BiPC second year, MEC, MEC second year).

Expect the build to print, before the upload:

```
formula sheet mathematics: 97 formulas in 11 chapters
formula sheet mathematics_1b: 45 formulas in 10 chapters
formula sheet mathematics_2a: 35 formulas in 10 chapters
formula sheet mathematics_2b: 27 formulas in 8 chapters
formula tags: 924 cards tagged, 535 use none
content bundles: 120 units → … (71661 KB)
```

If those five lines are missing, the checkout is not on the merged master — stop.

## Verify on the live site

1. Open **https://answers.viditra.co/**, pick **MPC**, then **first year**.
2. Subject box → **Maths 1A**. A **Formulas** tab appears beside Questions, reading
   **0/97**. On **Physics** there is no tab at all — that is correct, not a bug.
3. Open the tab. Every formula of the paper is listed in chapter order, all dim, each
   with "N questions away". **No formula text is visible on a dim row** — check in
   devtools too; it should not be in the DOM.
4. Open any Maths-1A question and click the **last item in the "Answer plan" rail**.
   A green line appears above the Next button: "N formulas added to your sheet →".
   Tapping it opens the sheet with those rows now white cards, ticked, counter moved.
5. Reload. The count holds (it is in `localStorage` under `pm_read_v1`).
6. Repeat step 2 for **Maths 1B (0/45)**, **2A (0/35)**, **2B (0/27)**.

## If it goes wrong

- **Roll back the page**: `npx wrangler rollback -c wrangler.answers.toml`, or redeploy
  from the previous master commit. The page is a static artifact, so a rollback is total.
- **The content push is additive per unit key** and safe to re-run; it replaces the
  bundles for the 120 units it names and touches nothing else.
- **Nothing in this feature writes to a student's data on the server.** The sheet is
  derived at read time from authored data plus `localStorage`; the only new key is
  `pm_read_v1`, which is local and never synced. A rollback cannot lose student work.

## Traps recorded from this session

- **`npm run smoke:answers` overwrites `answer-book/dist` with the OFFLINE build.** After
  any smoke run, re-run `npm run build:answers:hosted` before serving the page to a person.
  (This does not affect `deploy:answers`, which builds its own gated directory.)
- **Keep the machine quiet during the suite.** `dist/index.html` is ~86 MB since the
  stacked-fractions conversion of 18–19 Sep turned much of the maths bank into KaTeX,
  and several gates load it per question. Running builds or browsers alongside it
  produced 11 phantom failures that all passed when re-run alone.
- **`npm run dev` does not start inside a `desk:new` worktree** (Turbopack rejects the
  `node_modules` junction). Not needed for this deploy, but it bites.
