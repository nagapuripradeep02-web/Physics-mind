# CHAPTER_LOOP — Autonomous chapter authoring with founder-proxy

> **EXPERIMENTAL (trial, 2026-07-22).** This protocol + the `founder-proxy` agent live ONLY on
> `feat/ch7-alternating-current`. Nothing here is project doctrine: CLAUDE.md / `.agents/CLAUDE.md` /
> the global agent-teams rule do not reference it, deliberately. Trial constraints (bold below) hold
> until the founder graduates the system. Kill switch: reset this branch + delete `docs/loop_runs/`
> and `.founder_runs/` — the repo is then bit-for-bit pre-trial.

**What this is.** The SOP a worktree Claude session follows to author an entire chapter of concepts
autonomously: the Alex pipeline authors each concept, `founder-proxy` (EXPERIMENTAL, Opus) plays the
founder's per-sim taste review, scars accumulate so later sims don't repeat earlier tweaks, and the
human founder reviews the finished chapter in one batch. **Shipping stays human**: nothing here runs
`visual:approve`, TTS, PILOT_CONCEPTS, `build:pilot`, or any deploy — Rule 17 intact.

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
   design; a founder `/clear` + the one-line prompt is the clean manual version; a crash/restart
   resumes identically. Keep the session under ~50% context by clearing every 2–3 concepts.

## 1 · Chapter state file — `docs/loop_runs/<chapter>_state.md`

The loop's only memory. Overwritten at every boundary (PROGRESS.md stays the human append-only log):

```markdown
# ch7 loop state
updated: <ISO timestamp>
review_port: 8087
next: ac_voltage_inductor
done: ac_voltage_resistor (cycles:1), phasors (cycles:0)
parked: <concept> — ESCALATE(<trigger>) — <one line>   | (none)
in_flight: <concept> stage=<pipeline|review|fix-cycle-N> | (none)
notes: <anything the next resume must know, one line each>
```

On resume: read this file, finish/restart any `in_flight` concept from its last durable artifact,
then continue at `next`.

## 2 · Chapter pre-flight (founder involved — NOT autonomous)

1. **Chapter map:** concepts in teaching order (NCERT ToC; prose-only sections get no sim). Founder
   approves the list. Write it into the state file.
2. **Engine audit:** which concepts need a scenario_type/primitive that doesn't exist? Those renderer
   builds happen WITH the founder before the loop starts (renderer edits are escalation territory,
   never autonomous). The loop only runs over concepts whose scenarios exist.
3. Confirm worktree basics: dev server port, review-site server port (detached `http-server`),
   `.env.local` present, `npm run check:agents` clean.

## 3 · Per-concept loop (autonomous, sequential)

1. **Cache clear** — the 4 DELETEs (simulation_cache / lesson_cache / response_cache /
   session_context), four separate queries (CLAUDE.md §6).
2. **Pipeline** — architect → physics-author → json-author, each output written to
   `docs/loop_runs/<chapter>/<concept>/` and passed by path. Then quality-auditor ∥ eye-walker
   (one message, two Agent calls). Auditor FAIL routes upstream as normal — those cycles are the
   pipeline's own, not founder-proxy fix cycles.
3. **Build + drive** — `npm run visual:eyes -- <id>` · `npm run build:review -- <id>` · ensure the
   detached review server is up · `npm run founder:drive -- --id <id> --url http://localhost:<port>`.
4. **founder-proxy review** — dispatch with paths (concept JSON, skeleton, physics block, reports,
   `.visual_runs` dir, `.founder_runs` dump, ALL prior `scar_candidates.sql` of this run). Persist its
   report to `founder_proxy_report.md`.
   - **FIX** → save its candidate rows to `scar_candidates.sql` (**trial: files only, NEVER applied
     to the DB**), dispatch the ONE named `alex:*` owner per finding, re-run step 3's affected parts,
     re-dispatch founder-proxy. **Max 3 cycles**, then it's an ESCALATE.
   - **FIX(engine)** *(non-blocking)* → append the finding to `docs/loop_runs/<chapter>_engine_queue.md`
     + its scar candidate to `scar_candidates.sql`; the concept proceeds on its authoring merits
     (can still APPROVE with engine items riding along). **NOBODY edits engine code during the loop** —
     the queue batches to the founder at chapter end.
   - **FIX(engine)-blocking** (the state's core claim is contradicted on screen) → park like an
     escalation, with the engine finding as the named cause.
   - **ESCALATE** (physics doubt | fix-budget exceeded) → park: commit WIP to the chapter branch,
     `parked:` entry in the state file, PushNotification to the founder (concept, trigger, one-line
     why), **continue with next concept**.
   - **APPROVE** → step 5.
5. **Checkpoint** — surgical `git add` (concept JSON, registration sites, migration file,
   `docs/loop_runs/<chapter>/<concept>/`, PROGRESS.md) → commit to the chapter branch.
   **Trial: NO merge to master, ever** (master merge is a graduation behavior). Update the state
   file; append the PROGRESS.md session line. Advance `next`.
6. Repeat. If context feels heavy at a boundary, this is the safe moment to compact/clear.

**Never, under any verdict:** `visual:approve` · `tts:*` · PILOT_CONCEPTS · `build:pilot` /
`deploy:*` · edits to `field_3d_renderer.ts` / `particle_field_renderer.ts` / any shared engine file ·
`peter_parker:*` dispatches · DB writes to `engine_bug_queue` (candidates stay files) · touching any
other branch or worktree.

## 4 · Chapter end

1. `npm run build:review -- <id>` for every approved concept (already built during the loop — verify
   HTTP 200 each on the detached server).
2. PushNotification: "<chapter> ready: N approved, M parked, E engine-queue items, review at
   http://localhost:<port>".
3. STOP. The founder batch-reviews every sim: approves (→ shipping flow later, at their discretion),
   or gives tweaks (→ new scar candidates + fix dispatches), rules on each `parked` concept and each
   `scar_candidates.sql` (apply / edit / discard), and triages `<chapter>_engine_queue.md` (the
   batched `FIX(engine)` findings → peter_parker dispatches at the founder's discretion).

## 5 · Escalation triggers (founder-proxy → park-and-continue)

1. Physics-correctness doubt founder-proxy cannot resolve beyond doubt.
2. Fix-cycle budget exceeded (3 rounds).

Engine-side defects are NOT escalations (Stage-0 calibration outcome, founder-approved 2026-07-22):
they are `FIX(engine)` ride-alongs batched to the chapter-end engine queue — unless blocking
(`FIX(engine)-blocking`), which parks the concept.

## 6 · Quality-over-quantity (structural, not aspirational)

The pipeline agents never see the chapter goal — every dispatch is one concept. The only entity
holding "finish the chapter" is this protocol; founder-proxy holds the opposite mandate
(reject-biased, no completion incentive, evidence-only findings) and its budget cap ESCALATES rather
than lowers the bar. A stuck concept costs the founder a parked notification, never a quality
discount. Grade drift across fix cycles is called out by name in founder-proxy's self-review.

## 7 · Trust ladder (how the founder decides keep/advance/modify/discard)

- **Stage 0 — calibration:** founder-drive + founder-proxy on 2 already-founder-reviewed sims
  (`capacitance`, `wheatstone_bridge`), findings compared against the real scar rows + PROGRESS
  notes from those reviews. Misses become named rubric patterns in the spec. Report to founder.
- **Stage 1:** first Ch.7 concept through the full loop; founder reads the transcript + reviews the sim.
- **Stage 2:** two concepts back-to-back autonomously.
- **Stage 3:** the rest of Ch.7. (Ch.8 stays manual until graduation.)
- **Graduation criterion per stage:** the founder's review finds zero must-fix issues founder-proxy
  missed (≤1 minor tolerated). A miss → rubric update + repeat the stage.
- **Graduation of the system:** founder says "keep it" → Rule 40 + roster entries written into
  doctrine, accumulated scar candidates applied to `engine_bug_queue`, branch merged to master,
  per-concept master merges enabled, Ch.8 adopts the loop.
