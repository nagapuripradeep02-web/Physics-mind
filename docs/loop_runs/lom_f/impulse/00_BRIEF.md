# `impulse` — founder brief (lom-f concept 1 of 2)

Chapter: Laws of Motion (Class 11). Renderer: `field_3d`, `scenario_type: "momentum_bench"`.
Engine contract: `docs/loop_runs/lom_f/_engine/momentum_bench_json_contract.md`.
Engine spec (design rationale): `docs/MOMENTUM_BENCH_ENGINE_SPEC.md` §8 "what the two concepts need".

Phase 0 is complete — the engine is built and proved (harness 63/63). **Author to the proved
numbers; do not re-derive them and do not design against config the engine does not have.**

---

## The apparatus (founder-decided 2026-07-30)

**NCERT's ball-and-wall**, with **WALL STIFFNESS as the taught variable.**

Explicitly REJECTED and not to be reintroduced: wall-vs-cushion. A cushion *absorbs* while a wall
*returns*, so `Δp` changes from `2mv` to `mv` and the comparison is confounded — the student cannot
tell which variable caused what. **Both walls rebound.** Only stiffness varies.

## The two beats this concept exists for

### 1. The NCERT beat — the rebound DOUBLES the momentum change to `2mv`

Students routinely miss this. A ball arriving at `+mv` and leaving at `−mv` has changed its momentum
by `2mv`, not `mv`. Make the sign reversal visible, not asserted. `readouts: ['v','p','J','F_contact']`.

### 2. The payoff beat — TWO LANES, same ball, same speed, stiffness ~10× apart

Rigid wall vs springy padded wall, **both rebounding**, so `Δp = 2mv` is identical *by construction*
and only the contact stiffness differs. `force_trace.compare_with_previous_lane: true` puts both
traces on ONE shared axis:

> **equal areas, very different peaks.**

The engine proves this at **0.0038% area agreement** with a peak ratio of **3.16223** against
`√10 = 3.16228`. Author to that; do not hedge it.

The physical claim: stiffening the contact raises the peak and shortens the duration in exact
compensation, leaving the area — the impulse, the momentum change — fixed. `F_peak · t_c = πJ/2`.

## Mandatory: `slow_window` on EVERY contact state

A real steel impact lasts milliseconds. At real speed it is invisible; slowed silently it teaches a
falsehood about how long forces act. So every state with a contact declares `slow_window` **with the
badge**. The HUD keeps reporting the TRUE peak force and TRUE contact duration in ms — only the
PLAYBACK slows. This is an honesty requirement, not a presentation choice.

## Anchor (Rule 35 — universal, never country-specific)

Airbag · crumple zone · bending your knees when you land · foam in a parcel. Pick ONE and keep it
culture-neutral: no places, festivals, food, currency, brands, names, or "in every Indian home"
phrasing, in any rendered or narrated string.

## Standing rules that bind this build

- **Rule 31** — guided state = ONE idea + ONE complete motion; narration **25–55 EN words**
  (>55 split, <~20 merge); each state DECLARES a motion archetype + a one-line delta; no archetype
  repeat except a declared contrast pair; per-state contextual controls; **explore state LAST**
  (`interaction_complete`, all sliders, `trusted_drag_seizes`, `repeat_every_ms`).
- **Rule 32** — cause moves before effect · only the taught variable moves · ≤5-word delta-cue
  caption · same apparatus from a recognizable home pose · exactly ONE glow focal at any instant.
- **Rule 34** — on-canvas caption is the delta cue ONLY (prose goes to the subtitle strip); ONE
  formula surface per state, separate from the value-only HUD; all math real Unicode.
- **Rule 38** — every state tagged `depth_ring: core|extended|advanced`; advanced is a contiguous
  block immediately before explore and hiding it must leave a coherent lesson; **the explore state
  surfaces CORE-ring content only**; `curriculum_tags` are CLAIMS —
  `needs_teacher_verification: true` on every unverified cell.
- **Rule 41** — every reader-facing string basic literal English. No idioms, no metaphors, no
  personification. Forces do not want, know, answer, or care. Physics vocabulary is NOT jargon:
  "impulse", "momentum", "contact force" are the plain words.
- **Rule 20** — conceptual-only: do NOT author `mode_overrides` (board/competitive suspended).
- **Rule 16a** — confront the wrong belief inside EPIC-L with a straightforward contrast beat
  (show the wrong expectation's consequence, then the real physics). No predict-pause.
- **Rule 15** — ≥2 distinct `advance_mode`; never `wait_for_answer`, never `pause_after_ms`.
- **Rule 19** — ≥3 primitives per state.

Likely misconceptions to confront (physics-author to sharpen): *"the momentum change is mv"*
(ignoring the sign reversal on rebound); *"a softer wall means a smaller momentum change"*
(it means a smaller PEAK FORCE over a LONGER time — same area).

## Prerequisites to check

`newton_second_law` (`F = ma` → `FΔt = Δp`) and `newton_third_law` exist in
`src/data/concepts/`. Prerequisites are advisory, never gating (Rule 23).

## STOP LINE for this run

Pipeline: **architect → physics-author → json-author → quality-auditor. Then STOP.**

**Do NOT run `visual:eyes` and do NOT dispatch `eye-walker`.** THE EYE's capture path is currently
photographing a random phase on loaded machines (the sim-time poll gives up at a wall-clock cap and
captures anyway), and a slow-motion contact frame is the worst possible case for that. lom-g is
fixing it; this tray cherry-picks the fix and runs the visual gate afterwards.

Also forbidden on this tray: `visual:approve` · `tts:*` · `build:pilot` / `deploy:*` ·
`PILOT_CONCEPTS` · DB writes to `engine_bug_queue` · any merge · any other branch or worktree.
