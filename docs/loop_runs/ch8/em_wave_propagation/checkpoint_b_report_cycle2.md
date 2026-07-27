# CHECKPOINT B (build gate) — founder-proxy — `em_wave_propagation` — CYCLE 2 of 3

> Ch.8 chapter loop, `docs/CHAPTER_LOOP.md` §3 step 4. Date 2026-07-25. Branch `feat/ch8-em-waves`.
> Re-review of founder-proxy's own cycle-1 `FIX(engine, BLOCKING)`.
> (Report returned inline by the agent per its no-write role contract; persisted here by the loop session.)

## VERDICT: **APPROVE** (authoring sign-off only — NOT shipping; Rule 17 batch review stays founder-only)

The one blocking finding (F-S5) and all four ride-along/authoring findings are RESOLVED on the actual rendered pixels, verified first-hand against the pre-fix run. Zero unresolved P1s, zero unresolved blocking engine findings, zero Pass-1 scar recurrences. The concept seals to the chapter branch and the loop advances to the next concept.

## Pass 1 — scar recurrence (re-checked, economical)

The blocking F-S5 class (`field3d_scenario_cue_authored_but_renderer_never_reads`, kin to `displacement_current` S5 `aa724f8`) was the exact recurrence risk this cycle. It is now DEFEATED, not merely patched: the renderer reads the authored cue via `cueTriggerMs`. The original chapter scar `field3d_scene_composition_annotation_silent_noop` does not recur — S3/S5/S8 cues all paint. No new recurrence introduced.

## The four judged items

**1. F-S5 — did the ghost get defeated ON THE PIXELS, without becoming a new failure?** RESOLVED.
- `STATE_5__dense_t12000.png`: red wrong-phase ghost train PRESENT + `✗ expected: B peaks 90° after E` tag PRESENT — the Rule-16a provocation does its job first.
- `STATE_5__dense_t14000.png`: ghost + tag both fading (~1 s closed-form fade in progress).
- `STATE_5__frozen.png` (18000 ms): ghost GONE, tag GONE, clean in-phase twin readout (`E = −11 V/m, B = −0.04 µT`, crests-together caption). The held frame a sound-off teacher lands on is now correct. The "ghost that never appears would be a NEW failure" trap is avoided — it appears, teaches, then dissolves. Verified first-hand, not carried from eye-walker.

**2. F-S6 S11 side-effect — is a live λ span on the explore state core-ring or advanced leakage (Rule 38b)?** CORE-RING APPROPRIATE — approved.
- `STATE_11__frozen.png`: the ⊓ `λ = 3.00 m` bracket renders on the explore sandbox, spanning one wavelength, clear of the top-right λ/v HUD, the bottom-right slider panel, the top caption, and the bottom `c = 3.00×10⁸ m/s — always` line. No collision (Rule 34d intact).
- **Ruling:** wavelength/frequency/speed (c = νλ) is foundational CORE-ring content — no calculus, no vector form, no derivation. It is exactly the manipulation the explore state exists for: dragging ν visibly shrinks λ while the bracket and the `c … always` punchline show the speed holding. This is not advanced-ring leakage; it is a small *reinforcement* of the state's core claim. Rule 38b satisfied. This was the one genuinely new decision and it clears.

**3. The two moved freeze pins (S1, S9) — right frames now, and does the cycle-1 "capture-vs-sim" call resolve?** BOTH RESOLVED.
- `STATE_1__frozen.png` (9500 ms): pulse has reached the receiver, readout `E ≈ −98 V/m, B ≈ −0.33 µT` (non-zero, kick landed) — vs cycle-1's `E = 0 / B = 0.00` at a loop-restart trough. The cycle-1 call (retime the arrival to the authored `needle_kick_at_ms ≈ 9000` so the intended delay is honored AND the pin lands on the kick) landed correctly. The longer visible travel-delay also serves S1's "after a delay" lesson better, exactly as recommended.
- `STATE_9__frozen.png`: the three recall links are docked in the E×B scene and the assembled `B_z = (E₀/c)·sin(kx − ωt)` line + `direction: ẑ · same phase · amplitude: E₀/c` now render alongside the given `E_y`. The baseline that previously photographed the un-built state now captures the reveal-complete frame — the eventual founder `visual:approve` will baseline the RIGHT frame. Capture-integrity restored.

**4. Did any fix introduce a new problem?** NO.
- Regression sample independently corroborated: eye-walker byte-diffed S2/S3/S7/S10 frozen frames = null-diff (S2 byte-identical claim independently verified there). The S1/`8d2f826` "default path for cue-less pulse states is byte-identical" claim holds — S2 unchanged.
- The incidental S4 mid-motion dense-frame diff (`ŷ` sprite easing closer to the `E=` label) is capture/render-timing non-determinism: the reveal-complete FROZEN frame is untouched, so no content changed. Correctly judged noise, no bug row.
- F-S8 verified first-hand: `STATE_8__frozen.png` formula now renders `u` with proper typographic `E`/`B` subscripts, matching the tank labels; Rule 34c satisfied. (Tanks equal at `0.06×10⁻⁸` — FL4 equal-energy still holds.)

## Per-state table (delta only — clean states carried from cycle 1 per the economy instruction)

| State | correct | order | labels | sound_off | clearly_diff | problem / missing | priority |
|---|---|---|---|---|---|---|---|
| S1 | Y | Y | Y | Y | Y | RESOLVED — pin lands on the kick, receiver non-zero | — |
| S5 | Y | Y | Y | **Y** | Y | RESOLVED — ghost appears, teaches, dissolves; clean in-phase held frame | — |
| S6 | Y | Y | Y | Y | Y | RESOLVED — λ bracket renders, non-colliding; ν-as-"v" HUD glyph persists (P3, below) | P3 |
| S8 | Y | Y | Y | Y | Y | RESOLVED — proper Unicode subscripts | — |
| S9 | Y | Y | Y | Y | Y | RESOLVED — assembled B_z + 3 docked recalls | — |
| S11 | Y | Y | Y | Y | Y | λ bracket side-effect benign/positive; ν-as-"v" on HUD+slider (P3, below) | P3 |
| S2,S3,S4,S7,S10 | Y | Y | Y | Y | Y | sanity-checked, byte-identical to cycle-1 clean rulings | — |

## Findings

No P1s. No FIX routing. No engine queue. Two P3 founder-packet notes (do NOT block APPROVE, no fix cycle):

- **P3 (carried from cycle-1 S6, now also on S11) — frequency ν renders as Latin "v".** Evidence: `STATE_11__frozen.png` HUD `v = 100 MHz` and slider `Source frequency v: 100 MHz`; `STATE_6` HUD likewise. This is a glyph-ambiguity (Greek nu ν vs Latin vee v), sharpened on S11 where the punchline `c = 3.00×10⁸ m/s — always` is a *speed* — a teacher could momentarily misread `v = 100 MHz` as a speed. Not a Rule-34c ASCII fail and not misteaching (value + unit are correct), so it stays a founder-packet P3, not a gate. Cheapest fix if the founder wants it: label as `freq ν` / `ν (frequency)` on the HUD and slider.
- **P3 (new, minor) — S11 shows `λ = 3.00 m` on both the HUD and the bracket label.** Mild value duplication (Rule 34b is about *formula* duplication, so this is only an awareness note); the bracket label localizes the quantity to the visual span while the HUD is the instrument panel — an accepted pattern. No action recommended.

## Handover-readiness note (for Checkpoint C)

Every cycle-1 finding has a landed, pixel-verified fix — no silent skips: F-S5 `7bb26e2`, F-S9 `1b5efa7`, F-S1 `8d2f826`, F-S6 `c16383d`, F-S8 (JSON, uncommitted — flag for the C-gate commit sweep so the subscript edit is not lost). No scar candidate rows warranted this cycle (all findings closed on pixels; the S4 dense diff is capture noise). `scar_candidates.sql` needs no addition from cycle 2.

## ≤5 key frames for the founder's own eyes (all confirmation shots — zero open problems)

1. `.visual_runs/em_wave_propagation/20260725-032745/STATE_5__frozen.png` — the headline blocker cleared: clean in-phase twin readout, ghost + ✗-tag gone.
2. `.visual_runs/em_wave_propagation/20260725-032745/STATE_5__dense_t12000.png` — proof the ghost still APPEARS and does its Rule-16a job before dissolving (the "did the fix over-correct?" check).
3. `.visual_runs/em_wave_propagation/20260725-032745/STATE_9__frozen.png` — assembled `B_z` + three docked recalls; the baseline now captures the right frame.
4. `.visual_runs/em_wave_propagation/20260725-032745/STATE_1__frozen.png` — pin lands on the needle kick, receiver reads non-zero.
5. `.visual_runs/em_wave_propagation/20260725-032745/STATE_11__frozen.png` — the new decision: live λ bracket on the explore sandbox, ruled core-ring appropriate under Rule 38b, non-colliding.

## Grade-drift self-check

This is the failure mode the role exists to catch, so explicitly: cycle 1 held S5 as a hard block against the milder "the ✗-tagged ghost still carries the core claim" read. That bar was NOT lowered to reach APPROVE on a fix cycle — APPROVE is because the block is genuinely defeated on the pixels (ghost appears → teaches → dissolves → clean held frame), verified first-hand at three timestamps, not because the concept is over budget. Conversely no new block was manufactured: the ν-as-"v" glyph and the λ-twice duplication are honestly P3s defensible to the founder as "polish, not defect" (correct values, no misteaching, no collision) — neither was inflated to force a fourth cycle. The one genuinely new decision (S11 λ side-effect) was reasoned from Rule 38b on its merits and cleared, not waved through because eye-walker called it benign — c = νλ manipulation was independently ruled core-ring. No physics doubt on any inspected frame → no ESCALATE. Fix budget intact (this is cycle 2 of 3).
