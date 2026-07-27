# CHECKPOINT B (build gate) — founder-proxy — `em_wave_propagation`

> Ch.8 chapter loop, `docs/CHAPTER_LOOP.md` §3 step 4. Date: 2026-07-25. Branch `feat/ch8-em-waves`.
> Cycle 1 of 3.

## VERDICT: **FIX(engine, BLOCKING)** — the concept does NOT seal today.

One finding blocks (**S5** — the misconception ghost never dissolves, in the LIVE sim, so a Rule-16a pivot's resolution beat is dead). Joined by one authoring FIX (**S8**, Rule 34c) and three ride-along engine findings (**S9, S1, S6-bracket**). No ESCALATE: the physics is correct on every built frame inspected, and the fix budget is intact.

**Why the two gate reports disagreed.** THE EYE's 47/47 deterministic gates consult the freeze pins themselves — nothing in the battery asks *"is the pinned frame the RIGHT frame."* The eye-walker's frame-walk is the operative report; its load-bearing claims were re-verified here against both the code and the pixels.

**Why S5 blocks and S9/S1 do not — the crux, decided on evidence.** The test: *blocking* = the live sim is wrong; *ride-along* = the live sim teaches correctly and only THE EYE's captured frame is wrong.

Tracing the freeze machinery: **the teacher's held frame is pinned at `timelineTotal`** (narration end, `build_review_site.ts` L1079-81/L1165, computed from word count at WPM 150 × rate 0.9) — a **DIFFERENT clock** from `deriveStateMeta`, which is consumed ONLY by THE EYE.

- **S9:** 55-word narration → `timelineTotal ≈ 24–25 s`, far past the `assembled_at_ms: 16000` dock. `STATE_9__dense_t18000.png` proves the derivation builds correctly. The teacher's held frame shows the fully-built `B_z`. **Only THE EYE's 1500 ms fallback capture is wrong.** → ride-along.
- **S1:** the needle kick is physics-driven and visible every loop cycle in the live sim; THE EYE's 9500 ms pin lands at a loop-restart. → ride-along.
- **S5:** the frozen frame at 14700 ms (past the intended 13500 dissolve) STILL shows the red ghost + `✗ expected: B peaks 90° after E`. `ghost_dissolve_at_ms` is pushed to the pin (`deriveStateMeta.ts` L1369) but **the renderer never reads it** (grep-confirmed) → dead code → **the ghost persists in the LIVE sim and the held frame.** → sim-is-wrong, blocking.

S5 is the only one where a teacher, sound-off, is left with the wrong picture. On a Rule-16a misconception pivot — the highest-stakes pedagogy — a resolution beat dead in the live sim clears the reject-biased bar.

---

## Per-state review table (Pass 4)

| State | correct | order_ok | labels | reads_sound_off | clearly_diff | how a teacher uses it | problem / missing | priority |
|---|---|---|---|---|---|---|---|---|
| S1 | Y | Y | Y | ~ | Y | "the pulse leaves the antenna; the receiver stays dead until it arrives — travel takes time" | THE EYE frozen pin (9500 ms) lands at a loop-restart → receiver reads 0, misses the kick payoff. Live loop shows the kick. **Capture-is-wrong.** | P2 (ride-along) |
| S2 | Y | Y | Y | Y | Y | "switch off mid-flight — the wave keeps going, self-carrying" | none — clean | — |
| S3 | Y | Y | Y | Y | Y | "the motes never jiggle; pump them out, nothing changes" | none — scar-recurrence check passes | — |
| S4 | Y | Y | Y | Y | Y | "E×B points ahead — crest or trough alike" | none | — |
| S5 | Y | Y | Y | **N** | Y | "twin readouts peak together — in phase, not 90°" | **ghost_dissolve dead code → the ✗-tagged wrong-phase ghost NEVER dissolves in the live sim; the held final frame of a phase-comparison state permanently shows the un-cleared foil.** | **P1 (BLOCKING)** |
| S6 | Y | Y | Y | Y | Y | "gates time it → constants predict it → that's light" | λ graphical bracket declared in the symbol table never renders (HUD value present); ν reads v-like in the monospace HUD above formula `v = D/Δt` | P2 (ride-along) + P3 |
| S7 | Y | Y | Y | Y | Y | "drag strength — the ratio stays c" | none | — |
| S8 | Y | Y | Y | Y | Y | "tiny B, but exactly equal energy" | formula surface literal ASCII `u_E`/`u_B` beside proper-subscript tank labels (Rule 34c) — same frame | P2 (authoring FIX) |
| S9 | Y | Y | Y | Y (live) / N (baseline) | Y | "three recalls assemble B_z from E_y" | link cues absent from deriveStateMeta push → THE EYE baseline photographs the un-built state. Live held frame at `timelineTotal ≈ 24 s` is fully built. **Capture-is-wrong.** | P1-severity / ride-along |
| S10 | Y | Y | Y | Y | Y | "the slab slows it — crests bunch, ν holds" | none — **F2 bounce landed correctly**; FL1 n-drag = founder hand-test | — |
| S11 | Y | Y | Y | Y | Y | "drag anything — the speed never moves" | none — Rule 37 continuous run, 3 controls live | — |

---

## Findings

**F-S5 · P1 · FIX(engine, BLOCKING) → `peter_parker:renderer_primitives`.**
Founder, sound-off: *"the red 'you'd expect 90°' ghost is still sitting there at the end — it never got defeated."* Evidence: `STATE_5__frozen.png` (pinned 14700 ms, past intended dissolve) shows the desaturated-red ghost train + `✗ expected: B peaks 90° after E` fully present; `ghost_dissolve_at_ms` IS pushed to the pin (`deriveStateMeta.ts` L1369) but referenced NOWHERE in `field_3d_renderer.ts` — `emw_ghostb` is gated only by static `show_ghostb`. **Fix:** wire a time-gated dissolve read for `emw_ghostb` to the existing `ghost_dissolve_at_ms` hook (the displacement_current S5 ghost-fix shape, commit `aa724f8`-class). **Re-review:** ghost gone by ~14500 ms, clean in-phase held pose.

**F-S8 · P2 · FIX → `alex:json_author`.**
*"Why is it 'u underscore E' in the formula but proper subscripts in the tanks right next to it?"* Evidence: `STATE_8__frozen.png` — formula renders `u_E = ½ε₀E² = u_B = B²/2μ₀` with literal underscores while tank mini-labels use `<sub>`. The renderer accepts `<sub>` (S9's `E_y`/`B_z` prove it). **Fix:** author the S8 `formula` string with `u<sub>E</sub>`/`u<sub>B</sub>`. Extend the Rule-34c sweep to JSON `formula` fields.

**F-S9 · P1-severity / RIDE-ALONG · FIX(engine) → `peter_parker:renderer_primitives`.**
`STATE_9__frozen.png` shows only `E_y = E₀ sin(kx−ωt)`; the `em_wave` push-list (`deriveStateMeta.ts` L1354-1372) omits `link1/2/3_at_ms` + `assembled_at_ms` → fallback `DEFAULT_REVEAL_MS ≈ 1500`. The renderer DOES read the link cues (L31420-23) and builds correctly. **Fix:** add the four cues to the em_wave push in `maxRevealForField3dState`.

**F-S1 · P2 · RIDE-ALONG · FIX(engine) → `peter_parker:renderer_primitives`.**
`STATE_1__frozen.png` (pin 9500 ms) shows the pulse at the source and receiver `B=0.00`; physics-driven arrival is ~7000 ms while authored `needle_kick_at_ms: 9000` sits in the post-reset trough (`needle_kick_at_ms` is NOT read by the renderer). **Fix:** prefer the engine retime — align the actual pulse arrival with the authored ~9000 ms, so the intended delay is honored AND the pin lands on the kick (a longer visible travel-delay serves S1's "after a delay" lesson better).

**F-S6 · P2 · RIDE-ALONG · FIX(engine) → `peter_parker:renderer_primitives`.**
The symbol-label table declares a graphical λ bracket; only the HUD readout renders. λ value is present (not misteaching) → ride-along. **P3 (founder packet):** ν renders as a v-lookalike in the 13 px monospace HUD, sitting above formula `v = D/Δt` on S6 (ν is correct Unicode, so not a 34c fail; a serif HUD or a "freq ν" label removes the ambiguity).

---

## Checkpoint-A carry-forward diff (all landed — no silent skips)

| CP-A item | Status | Evidence |
|---|---|---|
| **F2** — both trains drawn + bunching in the slab | ✓ LANDED | eye-walker S10 CLEAN; auditor probe 5; the design bounce is resolved |
| **F3** — S6 zoning, ONE two-line formula surface | ✓ LANDED | `overlayCollisions:[]`, HUD at `top:52px`; auditor probe 7 |
| **FL1** — S10 n-drag un-pins clock | ✓ WIRED (hand-test pending) | `freezeAtTime=null` on seize; founder_drive n-drag 1.5→1.85 registered |
| **FL2** — S6 historical-identity framing | ✓ LANDED | auditor probe 3 |
| **FL4** — both tanks identical, crest = 6.38×10⁻⁸ | ✓ LANDED (code-proven) | L31442-50: `C_EXACT = 1/√(μ₀ε₀)` drives u_B; every sampled pair equal; exact-crest 6.38 provable |
| **Scar recurrence** (S3/S5/S8 cues paint) | ✓ PASSES | all three paint — `field3d_scene_composition_annotation_silent_noop` does NOT recur |

The five new findings are a DIFFERENT family (reveal-pin registration / renderer dead code / typography) — build-time defects Checkpoint A could not have anticipated.

---

## Engine queue (the loop dispatches under §3b)

| Finding | Tag | Owner | Fix | Re-verify |
|---|---|---|---|---|
| F-S5 ghost dissolve dead code | **BLOCKING** | `peter_parker:renderer_primitives` | wire `ghost_dissolve_at_ms` to the `emw_ghostb` visibility gate | S5 frozen: ghost gone ≤14500 ms |
| F-S9 link cues missing from pin | RIDE-ALONG* | `peter_parker:renderer_primitives` | add `link1/2/3_at_ms` + `assembled_at_ms` to the em_wave push | S9 frozen shows assembled `B_z` + 3 recalls |
| F-S1 pin/arrival desync | RIDE-ALONG* | `peter_parker:renderer_primitives` | align pulse arrival with `needle_kick_at_ms` (≈9000) | S1 frozen shows the kick peak, receiver ≠ 0 |
| F-S6 λ bracket absent | RIDE-ALONG | `peter_parker:renderer_primitives` | render the declared λ bracket, or document the deferral | bracket visible spanning one λ |

\* *Formally ride-along, but since the S5 block forces a re-review anyway, the recommendation is to dispatch F-S9 and F-S1 in the blocking round — both are cheap, and doing them now gives the re-review a fully-correct reveal-complete artifact across S1/S5/S9, protecting the eventual founder `visual:approve` from baselining wrong frames. If either exceeds its 2-attempt budget, only F-S5 is a hard gate; the rest degrade to the founder chapter-end queue.*

---

## ≤5 key frames for the founder's own eyes

1. `.visual_runs/em_wave_propagation/20260725-012153/STATE_5__frozen.png` — **the blocker**: ghost still present at 14700 ms.
2. `.visual_runs/em_wave_propagation/20260725-012153/STATE_9__frozen.png` — baseline shows only the given `E_y` (capture-is-wrong).
3. `.visual_runs/em_wave_propagation/20260725-012153/STATE_9__dense_t18000.png` — same state fully built, proving the live sim is correct.
4. `.visual_runs/em_wave_propagation/20260725-012153/STATE_1__frozen.png` — pin at a loop-restart.
5. `.visual_runs/em_wave_propagation/20260725-012153/STATE_8__frozen.png` — literal `u_E`/`u_B` beside proper-subscript tank labels.

---

## Grade-drift self-check

Moved reject-ward on the borderline: **S5 ruled blocking**, against the milder read that the ✗-tagged ghost + correct in-phase twin readouts still carry the core claim. *Degrade path:* the core "in phase" claim IS shown correctly, so if the founder judges S5 a high-priority ride-along, the concept's teaching survives — but the block is held, because a misconception pivot's designed payoff (the wrong idea visibly defeated and removed) is load-bearing and its absence at the held frame misleads sound-off.

Did NOT inflate the two capture-is-wrong findings: **S9 was DEMOTED** from the eye-walker's blanket CRITICAL-blocking to CRITICAL-severity/ride-along after proving the player freezes at `timelineTotal ≈ 24 s` (built), and the same for S1 — distinguishing baseline-integrity from teaching-integrity rather than rubber-stamping either gate report. No P1 was lowered to reach APPROVE (there is no APPROVE today). Every code claim (deriveStateMeta push-list, renderer cue reads, player-freeze clock, `timelineTotal` formula) and every pixel claim (4 frozen frames) was verified first-hand.
