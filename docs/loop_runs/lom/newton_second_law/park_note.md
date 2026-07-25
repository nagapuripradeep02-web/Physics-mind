# PARK NOTE — `newton_second_law` (Laws of Motion #2, lom-b)

**Status:** PARKED 2026-07-25. Content is COMPLETE and verified; blocked on ONE engine defect that
could not be dispatched from this session.

**Rollback point at park time:** `ee14dce`. Engine commits this branch: still **1** (the inherited
`3e1b159` cherry-pick). **Zero** of the 2-attempt engine repair budget was spent — see §3.

---

## 1. What is DONE (do not re-run these stages)

| Stage | Artifact | Status |
|---|---|---|
| architect | `skeleton.md` | COMPLETE — 4 states, ENGINE GAP: none |
| physics-author | `physics_block.md` (at REVISION 2) | COMPLETE — ENGINE GAP: none |
| json-author | `src/data/concepts/newton_second_law.json` + 4 registration sites + SQL migration | COMPLETE |
| THE EYE | `.visual_runs/newton_second_law/20260725-205424/` | **19 checks · 19 passed · 0 failed · $0** |
| build:review | `review-site/newton_second_law/` | HTTP 200 on port 8090 |
| quality-auditor | `quality_auditor_report.md` | **VERDICT: PASS** |
| eye-walker | `eye_walker_report.md` | **FINDINGS (2)** — see §2 |

Verification at park time: `npx tsc --noEmit` 0 errors · `npm run validate:concepts` **127 PASS /
0 FAIL** (`newton_second_law` PASSES) · `npm run check:renderer-syntax` OK · no renderer file
touched · no DB writes.

Registration sites touched (matching what `newton_first_law` did): `src/config/panelConfig.ts`,
`src/lib/aiSimulationGenerator.ts` (`CONCEPT_RENDERER_MAP`), `src/lib/intentClassifier.ts`
(`VALID_CONCEPT_IDS` + `CLASSIFIER_PROMPT`). `PCPL_CONCEPTS` correctly NOT touched (field_3d).

**Amendment 6 auto-approve deliberately did NOT fire.** The gate is quality-auditor PASS *and*
eye-walker zero candidates. eye-walker returned 2. `visual:approve` was NOT run — there are **no
locked baselines** for this concept.

---

## 2. The two eye-walker findings

Both are in `docs/loop_runs/lom/_engine/scar_candidates.sql` (file only — **no `engine_bug_queue`
DB rows were written**, per the loop's constraints).

### Finding 1 — THE BLOCKER (unfixed)

**`field3d_nlb_two_body_lane_offset_missing_causes_full_occlusion`** · CRITICAL ·
owner `peter_parker:field3d_surgeon`

`nlbSetBodyPosition()` (`src/lib/renderers/field_3d_renderer.ts` ~L29497–29513) sets every
non-hanging body mesh to `(s * NLB_WORLD_PER_M, NLB_BODY_SIZE/2, 0)` — **z is hardcoded 0 for all
bodies.** Engine spec §1 explicitly promises "Two bodies with NO `pulley` = independent,
**side-by-side**"; they in fact share one lane. Two bodies authored at the same
`initial_position_m` — the intended same-start-line compare pattern — are pixel-coincident at
reveal and stay merged until integration separates them.

Impact on STATE_2 and STATE_3 (both two-body compare states): at t=0 only ONE block is visible,
the two Unicode labels render as an illegible merged `m₁m₂` blob for roughly the first third of
the run, and the H2 `SET_TIME_FREEZE` reveal-completeness baseline lands INSIDE the overlap window
— so the frozen reference frame is illegible by construction. Root-caused in code by eye-walker,
not inferred from pixels.

**There is no authoring workaround, and the resuming session must not attempt one.** Staggering
the two `initial_position_m` values keeps both bodies in ONE lane, so the faster body overtakes and
visually interpenetrates the slower one — worse than the occlusion, and it destroys the 2:1
distance comparison the states exist to show.

**This is a DEFECT, not an ENGINE GAP.** No config knob is missing; no author-facing surface needs
to change; the spec already promises the behavior. It therefore runs CHAPTER_LOOP §3b (engine
loop), not the "park with `engine_gap.md`" path — which is why there is no `engine_gap.md` here.
Same reasoning the founder accepted for concept 1's clock defect.

### Finding 2 — FIXED THIS SESSION (content, not engine)

**`field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio`** · MAJOR ·
re-owned to `alex:physics_author`

The engine draws `len = clamp(NLB_ARROW_MIN_LEN, NLB_ARROW_MAX_LEN, magnitudeN * NLB_ARROW_SCALE)`
with `SCALE = 0.030` and `MIN_LEN = 0.30`, so any force under 10 N floor-clamps. The concept had
authored 0.2 N / 0.4 N. Consequences: STATE_1's sole `glow_focal` — the Rule 32a cause element —
was an invisible ~1px stub in every captured frame; and STATE_3's "visibly twice as long" doubled
arrow (its entire pedagogical payload, the Rule 29 magnitude-length exception) did not exist,
because both magnitudes clamped to the identical minimum.

eye-walker filed this against `peter_parker:renderer_primitives`; the orchestrator **re-routed it
to content**. The clamp is DESIGNED behavior per engine spec §3 ("a nonzero force is always at
least readable") — the defect was the authored magnitudes, and 0.2 N is physically silly for a
push in the first place.

**Fix applied and verified:** physics-author scaled every force AND every mass by a uniform **×75**
(`physics_block.md` → "REVISION 2" changelog), so every acceleration, distance, velocity and clamp
margin is numerically IDENTICAL to before — only the N/kg units moved. Smallest on-screen force is
now 15 N (raw arrow length 0.45 = 1.5× the floor); STATE_3's pair is 15 N / 30 N → 0.45 / 0.90, a
genuinely visible 1:2. Masses 75 kg / 150 kg read as a loaded suitcase vs a loaded luggage cart —
consistent with the skeleton's own universal anchor. Slider ranges and the S4 `idle_auto_sweep`
range were widened to match. json-author applied it; `tsc` 0 and validator 127 PASS confirm.

**Not yet re-verified in pixels** — the JSON changed after the last EYE run, so a fresh
`visual:eyes` is required on resume (see §4).

---

## 3. WHY it parked instead of being fixed — dispatch-registry gap (again)

`field3d-surgeon.md` is on disk in `.claude/agents/` and `npm run check:agents` reports
**"OK — all 11 emissions are up-to-date with their canonicals"** — but the agent was **absent from
this session's dispatch registry**. The dispatch failed with:

> `Agent type 'field3d-surgeon' not found. Available agents: architect, claude, Explore,
> eye-walker, feedback-collector, general-purpose, json-author, physics-author, Plan,
> quality-auditor, retrofit-surgeon, statusline-setup`

`renderer-primitives`, `runtime-generation` and `shipper` are likewise missing — i.e. the whole
`peter_parker` cluster plus the release agent are undispatchable here, not just field3d-surgeon.

Both fallbacks are correctly banned, so the session refused both rather than burning the repair
budget on a banned path:
- **Amendment 4** — field_3d engine work goes to `field3d-surgeon`, never a general-purpose dispatch.
- **§0.1** — the orchestrator never edits `field_3d_renderer.ts`.

**FOUNDER ATTENTION.** The prior session's state-file note concluded "new agent types only dispatch
from a session started after they were added; **fresh sessions from now on do have it**." That
conclusion is **WRONG, or the condition is not merely session freshness** — this was a fresh
session started well after field3d-surgeon landed, and it still could not dispatch it. Two concepts
in a row have now parked on this same gap. It is worth diagnosing directly (agent-registry loading
in a git *worktree*, vs. the main checkout, is the obvious suspect) before the next loop session
runs, because concept 3 (`newton_third_law`) is also a two-body concept and will hit Finding 1 too.

---

## 4. RESUME INSTRUCTIONS (next session)

Do NOT re-run architect, physics-author or json-author. The content is complete and correct.

1. **Confirm `field3d-surgeon` is dispatchable before anything else.** If it is not, park again
   immediately — do not fall back to general-purpose, and do not edit the renderer directly.
2. Dispatch **field3d-surgeon** with ONE bug_class: `field3d_nlb_two_body_lane_offset_missing_causes_full_occlusion`.
   The fix is named, not a re-derivation request: give independent (no-`pulley`) bodies a small
   fixed **per-body-index lateral (z) offset centered about z=0** — so a one-body state is
   bit-identical and existing single-body baselines hold — and carry that offset to everything
   anchored to the body (mesh, label sprite, force arrows, trusted-drag hit proxy). Derive the
   magnitude from `NLB_BODY_SIZE`, not a magic number. Do not disturb `pulley`/`hanging` placement.
   **No new author-facing config knob** — this is a layout defect, not a missing feature.
3. Verify chain (all of it): `check:renderer-syntax` → `tsc --noEmit` → `validate:concepts` →
   `cache:clear:scoped -- newton_second_law` → **re-seed** (`npx tsx
   src/scripts/_seed_newton_second_law_cache.ts` — MANDATORY: the sim HTML is assembled from the
   renderer and cached, so a renderer fix never reaches THE EYE without it) → `visual:eyes --
   newton_second_law` → regression EYE on `gauss_law_sphere` + `gauss_law_solid_sphere` (an H2 diff
   on those is a REAL regression — report, never re-baseline).
4. `build:review -- newton_second_law`, then dispatch **quality-auditor and eye-walker IN PARALLEL**.
   A full re-run of both is required, not a delta: the JSON changed (×75 rescale) after the last
   EYE run, so **every** pixel-level and numeric verdict is stale. Tell eye-walker to confirm BOTH
   fixes in pixels — bodies visibly in separate lanes at t=0 in S2/S3, and S3's two arrows reading
   a clear 1:2 length ratio.
5. On PASS + zero candidates: `visual:approve -- newton_second_law` (Amendment 6) → commit → update
   state file → EXIT.

**Carried, non-blocking:** `field3d_nlb_phase_glow_handoff_not_visible` (from concept 1, owner still
ambiguous, awaiting founder triage) does not affect this concept — it deliberately authors no
`phases[]` at all.
