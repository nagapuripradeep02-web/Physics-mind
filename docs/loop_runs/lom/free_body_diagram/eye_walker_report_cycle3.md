# eye_walker report — free_body_diagram — cycle 3 (FINAL verification pass)

Run dir: `.visual_runs/free_body_diagram/20260725-205200/`
Deterministic gate summary: **27/27 passed**
Engine bug queue (pre-walk consult): `query_engine_bug_queue.ts free_body_diagram --field3d --open` → No matching OPEN/DEFERRED rows.

## Cycle-2 MODERATE note — apparatus-continuity fix: CONFIRMED FIXED
Frozen frames of S1/S2/S3/S4/S6 now show the plank at identical width/position/camera framing
(camera `[0.0,1.3,8.4]`, `length_m:7`); S5's ramp geometry legitimately differs (incline, not the flat
plank — that is the taught content, not a continuity break). No residual scale/position jump at any
seam, including S2→S3 and S4→S5→S6. Verify item 1: **confirmed, 0% residual**.

## NEW finding — STATE_3 mid-state teleport (regression introduced by this cycle's re-budget)
`STATE_3__dense_t00000.png` → `t02000` → `t04000` → `t06000` → `t08000` → `t09000` shows the cyan body
translating right at a constant rate consistent with v=1.00 m/s (body left edge x≈455px at t=0 →
≈527 → ≈600 → ≈676 → ≈749 → ≈785px at t=9000, a steady ~36-38 px/1000ms). Between `t09000` and
`t10000` the body **jumps backward** to x≈565px — landing almost on top of ghost `G3` (x≈505-552),
i.e. back near its START position, not further right as continuous 1 m/s motion demands. `STATE_3__frozen.png`
(the H2/reveal-complete baseline) shows this SAME back-near-G3 position, not the far-right position seen
at t=9000. HUD `v = 1.00 m/s` is unchanged across all these frames, so the readout does not explain the
jump — it reads as a genuine position discontinuity, most likely a loop/modulo artifact in the coast
animation leaking into a GUIDED state (Rule 37 continuous-loop behavior is meant only for the final
`interaction_complete` state, never a guided one). This is exactly the "no mid-state teleport" check in
the reading protocol and it fails here.

This sits right at the seam most likely to be affected by this cycle's `v0`/`initial_position_m` rebudget,
so I read it as a regression of the fix, not a pre-existing issue — cycle 2's report did not flag it (cycle
2 predates the speed/position rebudget).

## Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| STATE_1 | ✓ | ✓ (static, correct — isolation concept) | ✓ (names setup vs black baseline) | ✓ | — |
| STATE_2 | ✓ | ✓ (static, N=mg at rest, correct) | ✓ | ✓ | — |
| STATE_3 | ✗ | ✗ | ✓ (caption/HUD read correctly) | ✓ | mid-state teleport t9000→t10000/frozen, body jumps back near G3 |
| STATE_4 | ✓ | ✓ (body glides 455→820px, fully visible, no occlusion, no track-end) | ✓ | ✓ | — |
| STATE_5 | ✓ | ✓ (static incline pose, N=16.97N, θ=30° correct) | ✓ | ✓ | — |
| STATE_6 | ✓ | ✓ (genuinely oscillating, bounded ~x580-660, F/v/a sign-flipping) | ✓ | ✓ | — |

Text consistency (verify item 5): no stale "2.0 m/s" found on canvas anywhere sampled — STATE_3's
slider/HUD both read "v₀ = 1.0 m/s" / "v = 1.00 m/s" consistently, including in the corrupted tail frames.

Ghost G3 (verify item 4): dimmed reference marker at its new −3 m mark reads correctly in STATE_3's
early/mid frames; it is the STATE_3 tail defect above (body drifting back onto G3) that makes them look
coincident at t10000/frozen — this is the SAME bug, not a second one.

Force-arrow/glow checks: STATE_2/3/4/5/6 each show exactly one glow-bright vector at a time with peers
dimmed; STATE_3's zero net-force is correctly captioned "ΣF = 0" with no drawn stub arrow (matches Rule
29). STATE_6 sandbox legitimately shows both N and ΣF simultaneously (explore state, all sliders/arrows
exposed by design) — one reads bright/glow, the other dim; not flagged.

No blank/black/NaN materials, no formula-surface overlap with the "Full screen" chrome corner, no ASCII
math observed in any sampled frame (θ, °, Σ, µₛ, µₖ all render as proper Unicode).

## Frames for founder eyes (3)
1. `C:\Tutor\physics-mind-lom-a\.visual_runs\free_body_diagram\20260725-205200\STATE_3__dense_t09000.png` — last good position before the jump (body far right, x≈785).
2. `C:\Tutor\physics-mind-lom-a\.visual_runs\free_body_diagram\20260725-205200\STATE_3__dense_t10000.png` — post-jump frame, body back near G3.
3. `C:\Tutor\physics-mind-lom-a\.visual_runs\free_body_diagram\20260725-205200\STATE_3__frozen.png` — the H2 baseline capturing the same wrong (post-jump) position, i.e. this is what a teacher would land on if they pause here.

## Candidate engine_bug_queue rows (1)
| bug_class | severity | owner_cluster | prevention_rule |
|---|---|---|---|
| `coast_position_wraps_near_state_end` | MAJOR | ambiguous (peter_parker:renderer_primitives if it's a shared coast/loop primitive; alex:json_author if it's a leftover duration/period param from the pre-rebudget config) | any one-way translational coast in a GUIDED state must be verified to hold/clamp at its final position for the full remainder of the state's duration — never modulo/loop position (looping motion is reserved for the final `interaction_complete` state per Rule 37) |

## Overall read: FINDINGS (1)
Do not seal on this read. The apparatus-continuity fix (cycle-2's MODERATE note) is confirmed resolved,
but the rebudget introduced a new MAJOR defect in STATE_3's tail — the exact state that was touched. This
is very likely a quick, narrowly-scoped fix (clamp/hold the coast position at its final value once the
state's target position is reached), but it must be fixed and re-verified before Amendment 6's auto-approve
fires.
