# CHAPTER_LOOP — Autonomous chapter authoring with founder-proxy

> **EXPERIMENTAL (trial; replicated to this branch 2026-07-24).** This protocol + the `founder-proxy`
> + `field3d-surgeon` agents live ONLY on the trial branches (`feat/ch7-alternating-current`, origin;
> `feat/ch8-em-waves`, this copy). Nothing here is project doctrine: CLAUDE.md / `.agents/CLAUDE.md` /
> the global agent-teams rule do not reference it, deliberately. Trial constraints (bold below) hold
> until the founder graduates the system. Kill switch: reset this branch + delete `docs/loop_runs/`
> and `.founder_runs/` — the repo is then bit-for-bit pre-trial. On THIS branch the wrapper is
> `scripts/ch8_loop.ps1`, the state file is `docs/loop_runs/ch8_state.md`, review port 8088, and the
> regression pair is `magnetisation_and_intensity` + `bar_magnet_as_dipole` (Amendment 5 disjoint-pair
> rule — ch7 keeps faraday_law_induction + capacitance).

**What this is.** The SOP a worktree Claude session follows to author an entire chapter of concepts
autonomously: the Alex pipeline authors each concept, `founder-proxy` (EXPERIMENTAL, Opus) plays the
founder at THREE checkpoints (A design, B build, C handover — see its spec), routed engine fixes run
in-loop under the §3b verify chain (Amendment 2, founder-approved 2026-07-22), scars accumulate so
later sims don't repeat earlier tweaks, and the human founder reviews the finished chapter in one
batch. Prime directive for every decision: maximum simulation quality and teaching value for the
Indian AND international curricula together — speed and completion are never tiebreakers. **Shipping stays human**: nothing here runs
`visual:approve`, TTS, PILOT_CONCEPTS, `build:pilot`, or any deploy — Rule 17 intact.

> **Amendment 4 — token discipline (founder-approved 2026-07-24).** Driven by the Ch.7 token audit
> (~1.13B tokens for 6 concepts; the E1–E10 fix bundle alone = 156M = 19% of all subagent spend).
> Three structural changes: (i) ONE bug per engine dispatch + a per-dispatch ceiling (§3b);
> (ii) one concept per SESSION — an outer wrapper (`scripts/ch7_loop.ps1 or scripts/ch8_loop.ps1`) relaunches a fresh
> headless session at every concept boundary, so no session pays the growing cache-read tax (§0);
> (iii) field_3d engine dispatches go to the specialist `field3d-surgeon` agent, not
> general-purpose (§3b). Quality machinery — the verify chain, checkpoints, fix budgets — is
> UNTOUCHED by this amendment.

> **Amendment 5 — parallel-safety (founder-approved 2026-07-24).** Enables a SECOND chapter loop
> (Ch.8 EM Waves) to run concurrently against the SAME dev Supabase without cache collisions. Two
> changes, both behavior-neutral for a solo run: (i) the start-of-concept `simulation_cache` clear is
> SCOPED to the concept_key (`npm run cache:clear:scoped -- <id>`) instead of an unconditional
> full-table wipe — so one loop never clobbers the other's freshly-seeded concept mid-EYE (§3 step 1);
> (ii) the field_3d regression sample is read from the state file's `regression_sample:` field so each
> parallel chapter uses a DISJOINT locked pair (ch7 = faraday_law_induction + capacitance; ch8 =
> magnetisation_and_intensity + bar_magnet_as_dipole) and the two never re-seed the same baseline at
> once (§3b step 3). The serving-path tables (lesson/response/session_context) are not read by THE EYE,
> so they are simply left alone by the scoped clear.

**The prompt that runs (or resumes) it, always the same one line:**

> Continue the chapter loop for <chapter> per docs/CHAPTER_LOOP.md.

---

## 0 · The stateless-orchestrator law

**Nothing the next concept needs may exist only in the conversation.**

1. **Subagents carry the load.** Architect / physics-author / json-author / quality-auditor /
   eye-walker / founder-proxy each run in their own disposable context window. The orchestrating
   session NEVER Reads frames, renderer source, or full concept JSONs — it dispatches with PATHS and
   receives compact reports (verdict + paths + top findings).
2. **Artifacts are files.** Every inter-stage product lives under `docs/loop_runs/<chapter>/<concept>/`
   (skeleton.md, physics_block.md, auditor_report.md, eye_walker_report.md, founder_proxy_report.md,
   scar_candidates.sql). Dispatch prompts hand paths, never pasted content.
3. **Concept boundary = checkpoint.** Only after commit + state-file update does the loop advance.
4. **Clearing is always safe at a boundary, never mid-concept.** Re-orientation = CLAUDE.md
   (auto-loads) + this doc + the state file (~30 lines). Auto-compaction mid-run is harmless by
   design; a crash/restart resumes identically.
5. **One concept per SESSION (Amendment 4 — supersedes "clear every 2–3 concepts").** The
   orchestrating session completes exactly ONE concept — seal it (or park it per protocol), update
   the state file, then EXIT. It never starts a second concept. The outer wrapper
   (`scripts/ch7_loop.ps1 or scripts/ch8_loop.ps1`) owns the loop: it relaunches a fresh headless session per concept, so
   every concept starts on an empty context window. Rationale (audit 2026-07-24): a long-lived
   orchestrator pays cache-read on its whole history at every turn — one 20h session cost ~95M
   tokens of pure overhead; a fresh session re-orients from disk for a tiny fraction of that.
   Resuming an `in_flight` concept from its furthest disk artifact counts as that session's one
   concept.

## 1 · Chapter state file — `docs/loop_runs/<chapter>_state.md`

The loop's only memory. Overwritten at every boundary (PROGRESS.md stays the human append-only log):

```markdown
# ch7 loop state
updated: <ISO timestamp>
review_port: 8087
next: ac_voltage_inductor
done: ac_voltage_resistor (A:ok B-cycles:1 C:sealed), phasors (A:fix-1 B-cycles:0 C:sealed)
parked: <concept> — <cause: ESCALATE(trigger) | engine-blocking-failed | design-parked> | (none)
in_flight: <concept> stage=<design|pipeline|build|review|fix-cycle-N|engine-fix|handover> | (none)
engine_commits: <sha> <bug_class> [owner] | (none yet)
notes: <anything the next resume must know, one line each>
```

On resume: read this file, finish/restart any `in_flight` concept from its last durable artifact,
then continue at `next`.

## 2 · Chapter pre-flight (founder involved — NOT autonomous)

1. **Chapter map:** concepts in teaching order (NCERT ToC; prose-only sections get no sim). Founder
   approves the list. Write it into the state file. This approval is the ONLY founder step before
   the loop runs (Amendment 2: engine work — including new scenarios — happens in-loop via §3b).
2. Confirm worktree basics: dev server port, review-site server port (detached `http-server`),
   `.env.local` present, `npm run check:agents` clean.

## 3 · Per-concept loop (autonomous, sequential)

1. **Cache clear (Amendment 5 — SCOPED).** `npm run cache:clear:scoped -- <id>` clears only THIS
   concept's `simulation_cache` rows (concept_key + fingerprint_key), so a parallel chapter loop on
   the same dev Supabase is never clobbered. (The old unconditional 4-table wipe —
   `_scratch_cache_clear_4tables.mjs`, CLAUDE.md §6 — is retained for solo/manual use, but the loop
   uses the scoped clear. The serving tables don't affect THE EYE, so they're left alone.)
2. **Pipeline with Checkpoint A** — architect writes the skeleton → **dispatch founder-proxy at
   Checkpoint A (design gate)**: DESIGN_OK proceeds; DESIGN_FIX routes back to architect (max 2
   cycles, then park); ESCALATE parks. Only on DESIGN_OK: physics-author → json-author, each output
   written to `docs/loop_runs/<chapter>/<concept>/` and passed by path. Then quality-auditor ∥
   eye-walker (one message, two Agent calls). An auditor FAIL routed `alex:*` re-runs upstream as
   normal (the pipeline's own cycles); an auditor FAIL routed `[owner: peter_parker:*]` goes through
   the §3b engine loop.
3. **Build + drive** — `npm run visual:eyes -- <id>` · `npm run build:review -- <id>` · ensure the
   detached review server is up · `npm run founder:drive -- --id <id> --url http://localhost:<port>`.
4. **founder-proxy review** — dispatch with paths (concept JSON, skeleton, physics block, reports,
   `.visual_runs` dir, `.founder_runs` dump, ALL prior `scar_candidates.sql` of this run). Persist its
   report to `founder_proxy_report.md`.
   - **FIX** → save its candidate rows to `scar_candidates.sql` (**trial: files only, NEVER applied
     to the DB**), dispatch the ONE named `alex:*` owner per finding, re-run step 3's affected parts,
     re-dispatch founder-proxy. **Max 3 cycles**, then it's an ESCALATE.
   - **FIX(engine), ride-along** → log the finding to `docs/loop_runs/<chapter>_engine_log.md` +
     its scar candidate to `scar_candidates.sql`; the concept proceeds to APPROVE on its authoring
     merits; the engine fix runs via §3b AFTER the approve commit, before the next concept starts.
   - **FIX(engine), blocking** (the state's core claim is contradicted on screen) → the engine fix
     runs via §3b NOW; on verified success, re-run founder_drive + founder-proxy (Checkpoint B) on
     the concept; on 2-attempt failure, park the concept with the engine finding as the named cause.
   - **ESCALATE** (physics doubt | fix-budget exceeded) → park: commit WIP to the chapter branch,
     `parked:` entry in the state file, PushNotification to the founder (concept, trigger, one-line
     why), **continue with next concept**.
   - **APPROVE** → step 5.
5. **Checkpoint C (handover gate), then commit** — dispatch founder-proxy at Checkpoint C: it diffs
   every claimed A/B fix (no silent skips), validates scar-candidate schema, and writes the
   "highest-value version achievable?" sentence for the founder packet. On `SEALED`: surgical
   `git add` (concept JSON, registration sites, migration file, `docs/loop_runs/<chapter>/<concept>/`,
   PROGRESS.md) → commit to the chapter branch. **Trial: NO merge to master, ever** (master merge is
   a graduation behavior). Update the state file (incl. `checkpointA:` / `checkpointC:` markers);
   append the PROGRESS.md session line. Advance `next`. A Checkpoint-C `FIX` (a claimed fix didn't
   land) routes it back within the same budget; `ESCALATE` parks.
6. **EXIT (Amendment 4).** The concept is sealed (or parked) and the state file updated — the
   session's job is DONE. End the session; the wrapper launches a fresh one for the next concept.
   Never start a second concept in the same session.

**Never, under any verdict:** `visual:approve` · `tts:*` · PILOT_CONCEPTS · `build:pilot` /
`deploy:*` · DB writes to `engine_bug_queue` (candidates stay files) · touching any other branch or
worktree · engine edits OUTSIDE the §3b verify chain (a routed dispatch under the chain is the ONLY
legitimate path to a renderer edit; the orchestrator never edits engine files itself).

## 3b · Engine loop (Amendment 2 — founder-approved 2026-07-22)

Routed engine findings (founder-proxy `FIX(engine)` or a quality-auditor FAIL tagged
`[owner: peter_parker:*]`) are fixed IN-loop by dispatching the named engine agent. This mirrors the
FAIL-routing authority quality_auditor has always had — a routed, owner-tagged, evidence-carrying
dispatch, never a cold-call. (Trial-branch amendment to hard rule 3; goes to doctrine only at
graduation.)

**Agent routing (Amendment 4):** engine work whose root cause lives in `field_3d_renderer.ts`
(new scenario_type builds AND fixes) dispatches the **`field3d-surgeon`** agent — it carries the
gotcha checklist, a region map of the renderer, and the verify chain in its own spec, so the
dispatch prompt only needs the finding + evidence. particle_field / generator / cache work stays on
general-purpose with the full inline template below.

**ONE bug per dispatch (Amendment 4 — bundles are BANNED).** Each engine dispatch fixes exactly ONE
`bug_class`. Multi-finding bundles (the E1–E10 pattern) are forbidden: N findings = N sequential
dispatches, each starting fresh. Sole exception: two findings may share a dispatch only when they
are in the SAME file AND share the SAME root cause. Ride-along findings each get their own queued
dispatch after the concept's approve. Audit rationale: the bundled E1–E10 dispatch cost 156M tokens
over 480 calls; the identically-shaped single-bug E11 dispatch cost 4.9M over 45 — per-turn cache
reads compound with conversation length, so ten short dispatches are ~3× cheaper than one long one.

**Per-dispatch ceiling (Amendment 4):** ~100 tool-calls or ~45 minutes, whichever first. On hitting
it: STOP cleanly — write a handoff note to `docs/loop_runs/<chapter>/<concept>/engine_handoff.md`
(what's done, what's verified, the exact next step) and exit; the loop re-dispatches FRESH with the
note as input. Never push past the ceiling "to finish" — a fresh dispatch reading the note is
cheaper than 50 more turns on a long context.

**Effort guidance (Amendment 4):** when the finding already names the root cause (a diagnosed fix,
not an investigation), the dispatch prompt says so explicitly: "Root cause is already diagnosed —
execute the named fix; keep exploration minimal; do not re-derive the diagnosis." Reserve
open-ended exploration for genuinely novel work (new scenario design, undiagnosed choreography).

**Dispatch prompt must carry (peter_parker specs are NOT edited — constraints ride per-dispatch):**
- The finding verbatim + its evidence (file/region, before/after expectation, the probe that proves it).
- Minimal surgical diff; sacred-file scope per the agent's own spec; work ONLY in this worktree.
- NO DB writes — the spec's post-fix bug-queue update goes to `scar_candidates.sql` instead.
- New-scenario checklists when applicable: field_3d → deriveStateMeta registration, `#sliders`
  exclusion chain, `field_lines` block for tube-drawing scenarios, NO backticks in the renderer
  template, cue gates at t=0, `__PM_supportsTimePin`; particle_field → `updateReadouts` early-out for
  a new topology, `PF_WG_FLAGS` registration for new canvas HUDs, `pfRevealMs` whitelist for sweeps.

**Verify chain — ALL must pass before the fix commits:**
1. `npm run check:renderer-syntax` (Rule 36c) → `npx tsc --noEmit` → `npm run validate:concepts`.
2. Re-seed the target concept's `simulation_cache` (THE EYE reads cached HTML — skipping the reseed
   silently tests the OLD code) → `npm run visual:eyes -- <target>`.
3. Regression sample — re-seed + EYE on baseline-locked concepts of the touched renderer.
   **field_3d = the state file's `regression_sample:` field** (Amendment 5 — default
   `faraday_law_induction` + `capacitance`; a parallel chapter overrides to a DISJOINT locked pair so
   two loops never re-seed the same baseline at once); particle_field → `ohms_law` +
   `wheatstone_bridge`. Any H2 diff vs locked baselines = regression = FAIL.
4. **Clock guard (Rule 36b):** if the diff touches `__pmSteps` / `dtStep` / the p5 `deltaTime`
   accumulator / any integrator, the FULL fleet sweep runs NOW, not at chapter end.
5. On any failure: surgical rollback (`git checkout -- <engine files only>`), attempt 2 with the
   failure evidence added to the dispatch. Second failure → the finding degrades to the founder's
   chapter-end queue (blocking → the concept parks). **Never leave the build broken.**

**Commit + audit discipline:** record `git rev-parse HEAD` before each dispatch (rollback point);
each verified fix = its OWN commit `fix(engine-loop): <bug_class> [<owner>]`; log finding → fix
commit → verify evidence to `docs/loop_runs/<chapter>_engine_log.md`; append the sha to the state
file's `engine_commits:`. The founder reviews every engine diff at chapter end via
`git log --grep=engine-loop -p`. Budgets: 2 attempts per finding; ≥8 engine-fix commits in one
chapter run → pause the loop + notify the founder (runaway guard).

## 4 · Chapter end

1. **Full-fleet sweep** (Rule 36b precedent) — re-seed + THE EYE across all baseline-locked concepts,
   since engine-loop commits touched shared renderers during the run. Any regression → fix or revert
   the offending engine commit BEFORE notifying the founder.
2. **Checkpoint C, chapter-wide** — dispatch founder-proxy once more: cross-sim coherence (shared
   apparatus pose, notation + dialect consistency across the chapter, no cross-concept
   contradictions), the engine-diff summary, the parked list, and the handoff report the founder
   reads first.
3. `npm run build:review -- <id>` for every approved concept (already built during the loop — verify
   HTTP 200 each on the detached server).
4. PushNotification: "<chapter> ready: N approved, M parked, E engine commits, F degraded engine
   findings, review at http://localhost:<port>".
5. STOP. The founder batch-reviews every sim: approves (→ shipping flow later, at their discretion),
   or gives tweaks (→ new scar candidates + fix dispatches), rules on each `parked` concept and each
   `scar_candidates.sql` (apply / edit / discard), reviews every engine diff
   (`git log --grep=engine-loop -p` + `<chapter>_engine_log.md`), and triages any DEGRADED engine
   findings (the 2-attempt failures).

## 5 · Escalation triggers (founder-proxy → park-and-continue)

1. Physics-correctness doubt founder-proxy cannot resolve beyond doubt.
2. Fix-cycle budget exceeded (Checkpoint B: 3 rounds; Checkpoint A: 2 design rounds).

Engine-side defects are NOT escalations: they run the §3b engine loop — ride-alongs after the
concept's approve, blocking ones before it; only a 2-attempt engine failure degrades to the founder
(blocking → the concept parks).

## 6 · Quality-over-quantity (structural, not aspirational)

The pipeline agents never see the chapter goal — every dispatch is one concept. The only entity
holding "finish the chapter" is this protocol; founder-proxy holds the opposite mandate
(reject-biased, no completion incentive, evidence-only findings) and its budget cap ESCALATES rather
than lowers the bar. A stuck concept costs the founder a parked notification, never a quality
discount. Grade drift across fix cycles is called out by name in founder-proxy's self-review.

## 7 · Trust ladder (how the founder decides keep/advance/modify/discard)

- **Stage 0 — calibration (DONE 2026-07-22):** founder-drive + founder-proxy on 2
  already-founder-reviewed sims (`capacitance`, `wheatstone_bridge`), blinded, vs the real scar
  record + a replanted-defect recall test. Result: outperformed the recorded review (2 live
  production bugs found); verdict miscalibration (everything escalated) → Amendment 2's FIX(engine);
  harness gaps → guided-state drags + collision probe added to founder_drive. Report:
  `docs/loop_runs/stage0_calibration/CALIBRATION_REPORT.md`.
- **Stage 1a — engine-loop shakedown on a KNOWN defect:** run §3b end-to-end on the Stage-0
  `particle_field` chrome collision (`pm-sliders` top:10px vs the chrome — field_3d's own fix shape
  is `top:52px` at its L5569). Known defect, known fix, the driver's collision probe as the
  after-proof, the regression sample as the safety proof. Proves dispatch + verify chain + rollback +
  commit discipline before any novel work.
- **Stage 1b — one new Ch.7 concept through the FULL closed loop** (content + engine autonomy, all
  three checkpoints): proposed `ac_voltage_resistor` (NCERT 7.2). The founder approves the chapter
  map first (§2); any new scenario the concept needs is built in-loop via §3b. Founder reviews the
  finished sim + transcript + every engine diff.
- **Scale-up gate:** the founder's Stage-1b review finds zero must-fix issues founder-proxy missed
  (≤1 minor tolerated). Satisfied → the founder grants the whole-chapter run (the rest of Ch.7 in
  one autonomous pass). A miss → rubric update + repeat with the next concept. (Ch.8 stays manual
  until graduation.)
- **Graduation of the system:** founder says "keep it" → Rule 40 + roster entries written into
  doctrine, accumulated scar candidates applied to `engine_bug_queue`, branch merged to master,
  per-concept master merges enabled, Ch.8 adopts the loop.
