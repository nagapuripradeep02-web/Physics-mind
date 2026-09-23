# Answer Book — deploy handbook

> **For whoever is publishing answers.viditra.co.** Written 2026-09-23. It assumes you
> were not in the sessions that built any of this. Everything you need is here; you
> should not have to read another document to finish.
>
> This supersedes `docs/ANSWER_BOOK_DEPLOY_HANDOFF.md` (the formula-sheet-only handoff,
> whose deploy is now **done**) and `~/Desktop/VIDI_CHAT_MEMORY_DEPLOY.md` (the
> chat-memory handoff, also **done**). Both are kept as history; work from this file.

---

## 1. The one-minute version

```bash
cd <repo>
git checkout master && git pull          # must be at 47033a7c or later
npm install                              # only if this is a fresh checkout

npm run deploy:answers                   # 1. the page  (needs Cloudflare login)
npm run content:push:live                # 2. the answer bodies (needs .env.local)
```

Two commands, in that order. **No SQL. No Supabase function deploy** — see §5 for the
one check that could change that.

Then verify with §6, which takes about three minutes in a browser.

---

## 2. What is already live (checked 2026-09-23, not assumed)

I read the live page and called the live function before writing this. On
**https://answers.viditra.co** right now:

| | state |
|---|---|
| The formula sheet (Formulas tab, all four maths papers) | **live** |
| Vidi asks the student's own name, and greets by it | **live** |
| The chat-history drawer (past conversations, bookmark, delete) | **live** |
| The chat-history endpoints on the Edge Function | **live** — `chat_list` answers |
| The old **five**-chip row ("Will this come?" …) | **still live** ← this is what you are replacing |

So the database work, the function deploy and the previous page deploy are all **done**.
You are shipping one page update, not a backlog.

---

## 3. What this deploy changes for a student

Everything below is merged to master and verified; none of it has reached a student.

**The chat box goes from five question chips to two** (founder, 2026-09-23):

```
BEFORE  [Will this come?] [Why this step?] [How do I write this?]
        [How much to write?] [Which formula?]

AFTER   [Explain this step] [How to remember?]
```

Nothing authored was lost with the removed chips. The star rank, the asked years, the
mark split and the formula notes all still reach the model, so a student who *types*
those questions still gets the same authored answer — only the one-tap shortcuts are
gone. The tip chip also goes back to one name on every paper ("How to remember?"); a
short-lived per-paper rename is reverted.

**193 new formula notes** land on Maths-1B, 2A and 2B, bringing all four maths papers to
368 notes over 680 long/short-answer cards. A formula note says which formula a question
turns on and how to tell it from the sibling questions it is confused with. It reaches
students through Vidi's replies (there is no longer a chip for it).

These ride **step 2**, not step 1 — the notes live in the content bundles that a gated
page fetches when a chapter unlocks. Run only step 1 and the new page ships with the old
notes.

---

## 4. Before you start

1. **A checkout of this repo on `master` at `47033a7c` or later**, with `npm install` done.
   ```bash
   git log --oneline -1        # expect: Merge pull request #234 … or newer
   ```
2. **`.env.local` at the repo root.** It is gitignored and never committed, so copy it
   from the build Mac (`~/Desktop/Viditra/Physics-mind/.env.local`). `content:push:live`
   reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from it.
   *If you work in a `desk:new` worktree, hard-link rather than copy, so the secret is
   never duplicated and never goes stale.*
3. **Cloudflare login.**
   ```bash
   npx wrangler login          # interactive browser flow — needs a real terminal
   npx wrangler whoami         # must succeed
   ```
   The account must own the `viditra-answers` Worker and the `answers.viditra.co`
   custom domain. **This is the only reason this is a handoff**: the build Mac has no
   Cloudflare auth and `wrangler login` cannot be driven from a non-interactive shell.

You do **not** need a Supabase login for the normal path.

---

## 5. The deploy

### Step 1 — the page

```bash
npm run deploy:answers
```

This is `build:answers:gated:live && npx wrangler deploy -c wrangler.answers.toml`. It
**rebuilds the artifact first** and then uploads that exact directory — never point
wrangler at a directory some other script built, which is how a deploy silently ships a
stale page.

Before the upload it should print, among other things:

```
formula sheet mathematics: 97 formulas in 11 chapters
formula sheet mathematics_1b: 45 formulas in 10 chapters
formula sheet mathematics_2a: 35 formulas in 10 chapters
formula sheet mathematics_2b: 27 formulas in 8 chapters
content bundles: 120 units → …
```

If those lines are missing, the checkout is not on the merged master — **stop**.

The artifact is ~9 MB and carries five streams: MPC, MPC second year, BiPC second year,
MEC, MEC second year.

### Step 2 — the answer bodies

```bash
npm run content:push:live
```

This uploads the per-chapter content bundles to the `ab_content` table. **The 193 new
formula notes are in here, not in step 1.** It is additive per unit key and safe to
re-run: it replaces the bundles for the 120 units it names and touches nothing else.

### Step 3 — only if the check below fails

The Edge Function is already deployed and carries the chat history. What I could **not**
verify from the build machine is whether it also carries the September persona work (Vidi
using the student's name; the one-small-joke tone). Checking it means a real model call,
which would be filed in the cost ledger as a student question — and a past session
polluted 45 of the first 80 rows exactly that way, so I left it for you.

**The check** — on the live site, open any question, give Vidi a name when it asks, then
ask it something. If the reply uses the name, the persona is deployed and **you are
done**. If it never uses the name:

```bash
npx supabase login          # browser handshake — needs a real terminal
npx supabase functions deploy answerbook-vidi-chat \
    --no-verify-jwt \
    --project-ref dxwpkjfypzxrzgbevfnx
```

**`--no-verify-jwt` is not optional.** Students have no Supabase account; deploy with JWT
verification on and Vidi stops answering for everyone.

---

## 6. Verify on the live site

1. Open **https://answers.viditra.co/**, pick **MPC**, then **first year**.
2. Open any Maths-1A question and open Vidi (the pill at the bottom).
3. **The chip row shows exactly two chips**: *Explain this step* and *How to remember?*
   If you still see *Will this come?*, the page did not update — hard-reload, then check
   `npx wrangler deployments list -c wrangler.answers.toml`.
4. Tap each chip. Both answer instantly from authored data, with no network call.
5. Unlock or open a **Maths-1B / 2A / 2B** chapter and ask Vidi *"which formula does this
   need?"* on a long-answer question. The reply should name the formula and, often, the
   sibling question it is confused with. That is the new content from step 2 — if the
   answer is vague, step 2 did not run.
6. **Check the formula sheet still works**: subject box → Maths 1A → a **Formulas** tab
   appears beside Questions reading **0/97**. On Physics there is no tab at all; that is
   correct.

---

## 7. Do not do these

- **Do not run any SQL.** Every migration this feature needs is already applied to
  `dxwpkjfypzxrzgbevfnx`. Re-running them would re-mark devices as internal and drop a
  live function overload.
- **Do not run `npm run deploy:cf-site`.** That publishes the *marketing* site
  (`viditra.co`) wholesale and **deletes anything your branch lacks** — it has silently
  removed `/admin/answers` from the live site before. Different site, different command.
- **Do not deploy from `npm run build:answers`.** That is the offline single-file build
  used by the test suite; it has no chat and no gate.
- **Do not run `npm run smoke:answers` and then serve `answer-book/dist`.** The smoke run
  overwrites that directory with the offline build. (It does not affect `deploy:answers`,
  which builds its own directory.)
- **Do not use `npm run build:answers:gated:mpc`** (or `:mpc2`) to sanity-check anything.
  It is **broken on master** — the formula-sheet gate validates every registry against
  the stream-filtered `units.json`, so a single-year build dies with 18 *"chapter N is not
  a live unit of mathematics_2a"* errors. Reproduced on a clean tree; it is not caused by
  this deploy. The live path (`deploy:answers`, all five streams) is unaffected.

---

## 8. If it goes wrong

- **Roll the page back**: `npx wrangler rollback -c wrangler.answers.toml`, or redeploy
  from the previous master commit. The page is a static artifact, so a rollback is total
  and immediate.
- **The content push is safe to re-run** — additive per unit key.
- **No student data is at risk.** Nothing in this deploy writes to a student's server
  record. The chip row is page code; the formula notes are authored content. A rollback
  cannot lose anyone's progress, plan or chat history.
- **If Vidi stops answering entirely**, the likely cause is the Edge Function being
  redeployed *without* `--no-verify-jwt` (§5). Redeploy with the flag.

---

## 9. Where things live, if you need to look

| | |
|---|---|
| Page source | `answer-book/notebook.js`, `answer-book/shell.html`, `answer-book/notebook.css` |
| Question content | `answer-book/questions/*.json` (3,330 cards) |
| Formula-sheet registries | `answer-book/formulas/<subject>.json` |
| The build | `src/scripts/build_answer_book.ts` |
| Worker config | `wrangler.answers.toml` → Worker `viditra-answers`, dir `answer-book/dist-gated-mpc+mpc_2+bipc_2+mec+mec_2` |
| Edge Function | `supabase/functions/answerbook-vidi-chat/index.ts`, project `dxwpkjfypzxrzgbevfnx` |
| Local mirror of the function | `src/scripts/answerbook_vidi_server.ts` — kept byte-identical by hand |
| Formula-note sweep | `python3 answer-book/tools/check_formula_notes.py` |

Deeper background, none of it required for this deploy:
`docs/notes/answer_book_hosting.md` (how the chat was first turned on),
`docs/notes/ANSWER_BOOK_PAYMENTS_RUNBOOK.md` (the ₹99/₹199 gate),
`docs/ANSWER_BOOK_VIDI_DESIGN.md` (why Vidi is shaped the way it is).
