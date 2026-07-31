# Git workflow — PhysicsMind

*Written 2026-07-26, after a week in which the same renderer fix was built twice
and 110 commits sat on a single hard drive with no backup.*

Two people work in this repo: physics on one laptop (13 git worktrees),
chemistry on another. This document is the shared contract.

---

## 0. New machine? Run this FIRST

```bash
node scripts/install-git-hooks.js     # once per machine — installs the auto-push hooks
```

**Do this before your first commit, not after.** The hooks live in `.git/hooks`,
which git does **not** track — so they do not arrive with a clone, a fetch, or a
new worktree. A fresh machine has no backup automation at all, and nothing tells
you that. You keep committing, everything looks normal, and the work sits on one
disk exactly as it did on 2026-07-26.

Confirm it took:

```bash
ls .git/hooks/post-commit                        # should exist
git rev-list --count --branches --not --remotes  # must be 0 — nothing unpushed
```

That second command is the real test, and it is worth running at the end of any
session. **The hook is a convenience, not a guarantee** — it has been observed to
skip a push after a large merge (chemistry branch, 2026-07-27: the count read 4,
not 0, and the branch was pushed by hand). Trust the count, not the hook.

One install covers every worktree on every branch, because `.git/hooks` is shared.
It chains to any hook it displaces (Git LFS, an existing pre-commit) rather than
replacing it. Opt out of a single auto-push with `PM_NO_AUTOPUSH=1 git commit`, or
persistently for one worktree with `touch "$(git rev-parse --git-dir)/autopush.off"`.

If a background push ever fails, it writes `autopush.status` and prints the failure
on your next commit — a silent failed push would be worse than no push at all.

---

## 1. Your code lives in four places

```
1. Working tree   — the files on disk, as you edit them
2. Staging area   — what you've marked to include        (git add)
3. Local repo     — saved checkpoints on YOUR laptop     (git commit)
4. GitHub         — the shared copy everyone can see     (git push)
```

**`git commit` does not back anything up.** On 2026-07-26 this repo had 110
commits across 5 branches that existed on exactly one disk in the world. They
were all committed. Backup happens at step 4, never step 3.

| Command | Does | Risk to others |
|---|---|---|
| `git commit` | Saves a checkpoint locally | none |
| `git push` | Copies commits to GitHub | **none** — cannot break anyone's work |
| `git merge` | Combines two lines of work | this is where conflicts live |

Push and merge are unrelated operations. Pushing a branch merges nothing.

---

## 2. The rhythm

**Commit — when one thing works.** Not on a timer. The test: *"would I ever
want to undo exactly this, by itself?"* One concept = one commit. One engine
fix = its own commit.

Always look at what you're about to commit:

```bash
git status              # BEFORE `git add`
git diff --cached       # AFTER staging, BEFORE committing
```

This is not ceremony. A stray staged rename from a previous session once got
swept into a commit that was supposed to be a single isolated file.

**Push — every day, minimum.** The auto-push hook (§4) does this for you on
feature branches. The rule behind it: **never end a session with unpushed
commits.** A messy pushed commit beats a perfect lost one.

**Merge — two directions, two cadences:**

- **master → your branch: every morning.** This is the one everyone skips.
  A daily merge is a 2-minute no-op; a 23-commit-behind merge is an hour.
- **your branch → master: when the unit is done.** A finished concept or
  chapter — not a half-built one.

---

## 3. Conflicts

A conflict is only ever: **two branches changed the same lines, and Git won't
guess.** Nothing is lost, nothing is corrupted — Git stops and asks.

Nearly all conflicts here are the easy kind: *both sides appended a new entry
to the same list.* Keep both, done.

**But verify before you commit the resolution.** A keep-both merge once left an
unbalanced brace — both sides opened an `if` block and there was only one
closing brace below the conflict. `tsc` caught it in seconds; committing first
would have put the breakage in history.

```bash
npm run check:renderer-syntax
npx tsc --noEmit
npm run validate:concepts
# only now: git add + git commit
```

---

## 4. What is automated (and what is not)

**Automated — you do nothing:**

| Mechanism | What it does |
|---|---|
| `post-commit` hook | Auto-pushes feature branches in the background. Never blocks the commit, never force-pushes, never fires mid-rebase. Skips `master`. |
| `pre-commit` hook | Blocks a commit if an agent emission is stale vs its canonical. |
| GitHub Actions `verify` | On every push: renderer syntax, agent sync, scenarios, concept schema, unit tests, type check. Lint is advisory. |

**None of the hook rows above are active until you install them** — see §0. They
are not tracked by git, so a new machine or a fresh clone has none of this.

**Not automated — this needs a human:**

Engine files (`parametric_renderer.ts`, `field_3d_renderer.ts`,
`particle_field_renderer.ts`, `premium_primitives.ts`, `deriveStateMeta.ts`,
`build_review_site.ts`, `validators/visual/*`) are **platform**, shared by every
chapter and both subjects. Land changes to them on master **separately and
immediately** — never buried inside a chapter branch where they stay invisible
until merge.

Before building any engine-level mechanism, check it doesn't already exist:

```bash
git fetch origin && git log --all -S "PM_someSymbol" --oneline
```

Ten seconds. Skipping it is why `PM_focalEmphasis` and `PM_focalPulseBoost`
were built independently, on the same day, to solve the same problem.

---

## 5. Namespacing — why content never conflicts

Concept JSONs live in per-subject directories (`src/data/concepts/` for
physics, `src/data/concepts/chemistry/` for chemistry). No two people write the
same file, so **zero conflicts have ever come from concept content.**

Every collision so far has been in the ~6 shared engine files above. That's the
cost of one repo with a shared engine, and it's the right trade — but it's why
§4's engine rule exists.

---

## 6. Quick reference

```bash
# ONCE per machine, before your first commit (§0) — nothing below is automatic without it
node scripts/install-git-hooks.js

# every morning
git fetch origin && git merge origin/master

# during work — commit small, the hook pushes for you
git status && git add <paths> && git diff --cached && git commit

# before merging your branch to master
npm run check:renderer-syntax && npx tsc --noEmit && npm run validate:concepts

# "does this already exist?"
git fetch origin && git log --all -S "<symbol>" --oneline

# where is unpushed work hiding?
git rev-list --count --branches --not --remotes     # must be 0
```

---

## 7. Desks — and the four commands that keep them honest

*Added 2026-08-01, after an audit found 7 commits on one hard drive, three desks 81 commits behind
master, and a finished desk still open a day after its PR merged.*

**The office** is your main checkout. It stays on `master` and stays clean: you plan there, you never
build there. **A desk** is a worktree: one desk = one branch = one session = one job. A desk is opened
when the job starts and **closed when the job merges**. Desks are places you visit, not places you live
— the month the main checkout spent parked on a feature branch is what made everything else drift.

```bash
npm run desk:audit                 # the truth table — run at session start AND session close
npm run desk:sync                  # merge origin/master into every live desk
npm run desk:new   -- feat/ch9-ray-optics    # open a desk (branch + worktree + node_modules junction)
npm run desk:close -- feat/ch9-ray-optics    # close one; add --yes once you've read what it prints
```

`desk:audit` exits non-zero when any commit exists only on this machine, so it also works as a
pre-flight. It is the mechanical answer to §2's "never end a session with unpushed commits" — a rule a
human forgets and a script cannot.

`desk:sync` merges one desk at a time and **stops at the first conflict** rather than guessing. When
the conflicting file is one of §4's six platform engine files it says so loudly and names the owning
surgeon, because that conflict is a judgement call (see §3 — and PR #10, where nine hunks in
`field_3d_renderer.ts` looked like ordinary keep-both conflicts and a naive resolution would have
printed two HUD headers per body).

`desk:close` **refuses** to close a desk holding unpushed commits or uncommitted changes, backs up
untracked files to `C:\Backups\desk-close-<date>\` first, and removes the `node_modules` junction
*before* the worktree — that order is not cosmetic: reversed, `git worktree remove` follows the
junction and empties the real `node_modules`. It never deletes a branch; the branch stays on GitHub.

**Delegating it.** The `git-steward` agent does the same work when a desk has drifted badly or the
staging list is long: verify chain → surgical `git add` of a *named* list → commit → push → open the
PR. It never merges to master, never force-pushes, never `git add -A`, and stops at any conflict under
`src/`. Shipping (`visual:approve`, TTS, `PILOT_CONCEPTS`, deploy) remains founder-only — Rule 17.
