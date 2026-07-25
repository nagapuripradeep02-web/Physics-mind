# CHAPTER_LOOP — autonomous chapter authoring, traditional pipeline

> Laws of Motion variant, founder-approved 2026-07-25. Derived from the Ch.7/Ch.8 chapter loop with
> the founder-proxy checkpoint system REMOVED (see Amendment 6). Scope: branches `feat/lom-a` and
> `feat/lom-b` only. Kill switch: reset the branch, delete `docs/loop_runs/`.

**One session = one concept.** A fresh headless session picks up the next concept (or resumes an
in-flight one from disk), takes it through the pipeline, seals or parks it, updates the state file,
and EXITS. A wrapper script launches the next session. Fresh session = empty context = no growing
cache-read tax.

---

## Amendments carried forward

**Amendment 4 (token discipline) — the single most important cost control.** One `bug_class` per
engine dispatch; bundles are banned. A bundled ten-bug dispatch on Ch.7 burned **156M tokens in 91
minutes** because prompt caching bills every turn for the accumulated context — one 480-turn
conversation costs far more than ten fresh 48-turn dispatches. Per-dispatch ceiling ~100 tool calls
or ~45 minutes; at the ceiling, write `engine_handoff.md` and exit so a fresh dispatch continues.
field_3d engine work goes to the **field3d-surgeon** agent, never a general-purpose dispatch.

**Amendment 5 (parallel safety).** Two worktrees share one dev Supabase, so the start-of-concept
cache clear is SCOPED: `npm run cache:clear:scoped -- <id>`, never an unconditional full-table wipe
(that would delete the other worktree's freshly-seeded concept mid-EYE and cause a false visual FAIL).
The field_3d regression sample comes from this branch's `regression_sample:` line in the state file,
so the two worktrees use disjoint baseline pairs.

**Amendment 6 (this variant, founder-approved 2026-07-25) — traditional pipeline, auto-approve.**
1. **No founder-proxy.** The three CP-A/CP-B/CP-C checkpoints are gone. The gate is now
   quality-auditor + eye-walker, exactly as in ordinary non-loop authoring.
2. **Auto-approve on PASS.** quality-auditor PASS *and* eye-walker clean (zero new
   `engine_bug_queue` rows) triggers `npm run visual:approve -- <id>` automatically. This is a
   deliberate, founder-accepted deviation from the Rule 17 human gate: the founder reviews each
   sealed concept afterward and iterates anything wrong.
3. **The loop still stops short of shipping.** TTS, `PILOT_CONCEPTS`, `build:pilot` and `deploy:*`
   remain founder-gated and are never run by a loop session.
4. **field3d-surgeon is KEPT.** It is an engine specialist, not a review agent — ~3.4M tokens per
   dispatch versus ~25M for a general-purpose dispatch doing the same field_3d work.

---

## §0 — The stateless-orchestrator law

1. **Subagents carry the load.** The orchestrator dispatches and reconciles. It never reads THE EYE
   frame dumps, never reads `field_3d_renderer.ts` (~2.3 MB), never reads a full concept JSON.
2. **Artifacts are files**, under `docs/loop_runs/lom/<concept>/`. Every stage writes its output
   there so a later session can resume from the furthest durable artifact.
3. **The concept boundary is the checkpoint.** Advance only after commit + state-file update.
4. **One concept per session.** The moment a concept is SEALED or PARKED and the state file is
   updated, EXIT. Never start a second concept in the same session.

---

## §1 — State file

`docs/loop_runs/lom_<a|b>_state.md`. Keys: `updated:` · `review_port:` · `regression_sample:` ·
`next:` · `done:` · `parked:` · `in_flight:` · `engine_commits:` · `chapter_map:` · repeated `notes:`.

**Resume protocol:** read the state file first. If `in_flight:` names a concept, or the working tree
has uncommitted artifacts under `docs/loop_runs/lom/<concept>/` or an uncommitted
`src/data/concepts/<concept>.json`, RESUME from the furthest durable artifact — do not re-run
completed pipeline stages. Otherwise start `next:`.

---

## §2 — Pre-flight (already done for this chapter)

Chapter map is founder-approved and written in the state file. The `newtons_laws_body` engine is
built and committed (Phase 0, see `docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md` and
`docs/loop_runs/phase0_engine_report.md`). `npm run check:agents` must report 11/11.

---

## §3 — Per-concept loop

**Step 1 — scoped cache clear.**
`npm run cache:clear:scoped -- <id>`

**Step 2 — the pipeline.** Sequential; each output is the next input. Write each stage's artifact to
`docs/loop_runs/lom/<concept>/`.

| # | Agent | Artifact |
|---|---|---|
| 1 | `architect` | `skeleton.md` — 9-section skeleton, state count, EPIC-L arc, Rule 31 per-state control table (state × teaches × archetype × delta × controls × duration), Rule 16a misconception beats, universal culture-neutral anchor (Rule 35) |
| 2 | `physics-author` | `physics_block.md` — variables/formulas/constraints, per-state reveal timeline |
| 3 | `json-author` | `src/data/concepts/<id>.json` + the registration sites + SQL migration |

**The engine is already built.** Every concept in this chapter is expressed purely as
`newtons_laws_body` configuration — see §6 of the engine spec for the per-concept knob mapping.
`json-author` writes config, not renderer code.

> **If a concept appears to need a renderer change, STOP.** Do not quietly extend the engine per
> concept — that is exactly the cost pattern this design exists to avoid. Park the concept, write
> what was missing to `docs/loop_runs/lom/<concept>/engine_gap.md`, note it in the state file, and
> exit for founder review.

**Step 3 — build and look.**
```
npm run visual:eyes -- <id>          # THE EYE, deterministic frames, $0
npm run build:review -- <id>
```
Then dispatch **quality-auditor** and **eye-walker IN PARALLEL** (one message, two Agent calls).
eye-walker reads ALL the frame dumps in its own context and returns a per-state verdict table —
the orchestrator must never load the PNGs. Write both reports to the concept's artifact dir.

**Step 4 — the gate (Amendment 6).**

- **PASS** = quality-auditor PASS *and* eye-walker reports zero new `engine_bug_queue` candidates.
  → `npm run visual:approve -- <id>` → commit → update the state file → **EXIT**.
- **FIX (content)** = route back to the named `alex:*` owner (json-author / physics-author /
  architect). Max **3 cycles**, then park.
- **FIX (engine)** = run §3b. Max **2 attempts** per finding, then park.
- **PARK** = commit what exists, record the cause in `parked:`, advance `next:`, **EXIT**.

**Step 5 — commit.** Surgical `git add` of only this concept's files. Never `git add -A`.
Message: `feat(lom): <concept_id> — Laws of Motion #N`.

**Never, under any verdict:** merge to master · touch another branch or worktree · run any `tts:*`
script · edit `PILOT_CONCEPTS` · run `build:pilot` or `deploy:*` · write rows to `engine_bug_queue`
(scar candidates go to `docs/loop_runs/lom/_engine/scar_candidates.sql` for founder review) ·
run the paid `smoke:visual-validator` (THE EYE is $0 and sufficient).

---

## §3b — Engine loop

Only for findings whose root cause is genuinely in the renderer.

**Routing.** `field_3d_renderer.ts` → **field3d-surgeon**. Generator / cache / serving-path work →
`runtime-generation`. PCPL/parametric → `renderer-primitives`. Never bundle.

**Dispatch prompt contains:** the one finding with its evidence paths, the minimal-diff instruction,
"no DB writes", and the verify chain. Not a re-derivation request — name the fix.

**Verify chain — ALL must pass before the fix is considered landed:**
```
npm run check:renderer-syntax        # Rule 36c, after every renderer edit
npx tsc --noEmit                     # 0 errors
npm run validate:concepts            # PASS
npm run cache:clear:scoped -- <id> && npm run visual:eyes -- <id>
# then the regression sample from the state file's regression_sample: line
```

**Commit discipline.** Log the rollback-point SHA before dispatching. One commit per verified fix:
`fix(engine): <bug_class> [owner: peter_parker:field3d_surgeon]`. Append the SHA to the state file's
`engine_commits:` line and a one-line entry to `docs/loop_runs/lom_engine_log.md`.

**Runaway guard.** Because the engine was built once up front, engine fixes in this chapter should be
RARE. **If `engine_commits:` reaches 5 in this worktree, PAUSE the loop and notify the founder** —
that many engine fixes means the Phase 0 design under-generalized and the whole approach needs
re-examination rather than another fix.

---

## §4 — Chapter end

1. Regression EYE across this branch's `regression_sample`.
2. `npm run build:review -- <id>` for each sealed concept; verify HTTP 200 on the review port.
3. Write a chapter summary to the state file's `notes:`.
4. STOP. The founder reviews every concept, iterates anything wrong (`retrofit-surgeon` with a
   NAMED delta), merges, and only then ships (TTS / catalog / deploy).

---

## §5 — Escalation

Park and exit for founder review when: physics correctness is genuinely in doubt · the content
fix-cycle budget (3) is exceeded · an engine finding fails 2 repair attempts · a concept appears to
need a renderer change the engine spec doesn't cover (`engine_gap.md`).

Engine defects are NOT escalations by themselves — they run §3b.

---

## §6 — Quality over quantity

There is no completion incentive in this loop. A parked concept is a normal, correct outcome; a
concept shipped past a real defect is not. Budget caps exist to force a PARK, never to lower the bar.
The founder's own review is the real gate — auto-approve (Amendment 6) speeds the loop up, it does
not replace their judgment.

---

## §7 — Known engine gaps and PRE-APPROVED fixes

Findings carried forward from an earlier concept in this chapter. These are founder-visible and the
listed fix is **already authorized** — do not spend a cycle re-deciding, and do not work around one by
rewriting narration when it is the concept's central beat.

### 7.1 — `param_ramp`: no monotonic parameter reveal in a guided state

**Found on** `free_body_diagram` STATE_5 (2026-07-25). The engine has no way to sweep a physical
parameter monotonically across a guided state's reveal window: `idle_auto_sweep` is a ~4 s triangle
(it comes back down) and `phases[]` drives glow only, never physics. STATE_5 therefore ships a STATIC
θ = 30° incline instead of the intended 0° → 30° tilt, and its narration was rewritten so nothing
promises a tilt the student never sees. Acceptable there — the tilt was not that concept's point.

**It is NOT acceptable on `block_on_incline`.** "Tilt the ramp until the block breaks away at
tan θ = μs" IS that concept's central beat. A static incline cannot show it, and rewriting the
narration around it would gut the concept.

**PRE-APPROVED:** when authoring `block_on_incline`, treat this as a §3b engine item and dispatch
**field3d-surgeon** to add a minimal monotonic `param_ramp` knob (one parameter, start → end, over a
declared window, driving real physics, one-shot per state entry — NOT a repeating sweep). Constraints
are unchanged: ONE bug_class, minimal diff, linear in `dt`, byte-stable under `SET_TIME_FREEZE`
(Rule 36), and the `interaction_complete` sandbox state must keep free-running (Rule 37). Rebase it
on state entry the same way `nlbResetTrajectory()` already rebases the integrator.

Do **not** work around this one. If the fix fails twice, park the concept and report — a weakened
break-away beat is worse than a parked concept.

### 7.2 — Deferred to founder review, do NOT act on in-loop

- **STATE_3-style frozen-pin timing on coast states.** The canonical reviewer screenshot can pin while
  a coasting body still overlaps its ghost, under-selling a growing-gap idea. The fix is a one-line
  `deriveStateMeta` reveal-candidate nudge, but it moves H2 baseline pixels for every affected concept,
  so it is a founder call. Noted at the end of `scar_candidates.sql`.
- **Uncoupled-body tension.** `hanging` means "hangs off the pulley", so an uncoupled body genuinely has
  no string and T = 0. Tension is `connected_bodies`' job. Do not try to rescue tension elsewhere.
