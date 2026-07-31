# eye_walker report — newton_second_law
Run dir: `.visual_runs/newton_second_law/20260725-205424/`

## Deterministic gate summary (verbatim)
`19 checks · 19 passed · 0 failed · $0.00`

Engine bug queue pre-walk consult (`query_engine_bug_queue.ts newton_second_law --field3d --open`): **no matching OPEN rows** — no known scars carried into this walk.

## Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| STATE_1 | ✗ | ✓ | ✓ (vs black baseline) | ✗ | v=0.00/a=0.10/F=0.20 correct at t=0 (no v0-leak); block moves cleanly rest→+2.66 well inside clamp; BUT the applied-force arrow (the state's sole `glow_focal`, the cause of Rule 32a) renders as a ~1px stub + a dim, non-glowing "F" label with **no visible shaft/arrowhead** at any captured frame (t=0…14000) — see founder frame |
| STATE_2 | ✗ | ✗ | ✓ (caption+HUD legible; bodies not, for ~1/3 of the run) | ✓ (formula/caption clean) | t=0 shows body **B alone** — body A is fully coincident behind it (z=0 for every body; both start at identical `initial_position_m:-8`); the two labels render as an illegible merged "m₁m₂" blob until ~t=4000-5000ms; by t=6000/12000 the two blocks + labels are cleanly separated and the 2:1 gap/`a` ratio reads correctly; **the H2 frozen-pin frame itself lands inside the overlap window** (v≈0.3/0.6), so the reveal-completeness baseline is the worst, least-legible moment of the state; same invisible-arrow defect as S1 (both arrows present only as dim stubs) |
| STATE_3 | ✗ | ✗ | ✓ (caption "Same mass — stronger force wins" reads; bodies overlap early like S2) | ✗ | mirror of S2's occlusion (same coincident-start defect); **the Rule‑29 "visibly twice as long" doubled arrow on B is not visible at all** — both A's F=0.2N and B's F=0.4N arrows floor-clamp to the identical `NLB_ARROW_MIN_LEN`, so the state's entire pedagogical payload (the 2:1 arrow-length contrast) is invisible on screen, leaving only the HUD numbers to carry S3; a≈0.10/0.20 readouts and mirrored 2:1 separation by t=12000 are otherwise correct |
| STATE_4 | ✓ | ✓ | ✓ ("All yours", all sliders visible) | ✓ | idle_auto_sweep starts at F=-1.00N/a=-0.50 (by design, not a v0-leak — v=0.00 genuinely holds); m/F/v₀ sliders all present; ΣF/m formula renders in real Unicode Σ; block stays centered, no clamp risk observed in the 10s sampled window |

Delta-visible column judges the on-canvas caption + formula legibility (which IS clean in every state); it does not certify body-level legibility, which is called out separately per state above.

## Frames for founder eyes (5)

1. `C:\Tutor\physics-mind-lom-b\.visual_runs\newton_second_law\20260725-205424\STATE_1__dense_t00000.png` — the designated glow_focal (applied-force arrow) is visually absent; only a dim label + sub-pixel stub mark next to the block.
2. `C:\Tutor\physics-mind-lom-b\.visual_runs\newton_second_law\20260725-205424\STATE_2__frozen.png` — the H2 reveal-completeness baseline shows the two bodies fully overlapping (illegible merged "m₁m₂" blob), not the "two-lane race" the concept is designed around.
3. `C:\Tutor\physics-mind-lom-b\.visual_runs\newton_second_law\20260725-205424\STATE_3__frozen.png` — same overlap defect on the declared contrast-pair state, plus the doubled-force arrow (this state's core visual point) is invisible.
4. `C:\Tutor\physics-mind-lom-b\.visual_runs\newton_second_law\20260725-205424\STATE_3__dense_t12000.png` — end-of-run reference showing bodies eventually separate correctly and readouts (a=0.10 vs 0.20) land right, for contrast against frame 3.
5. `C:\Tutor\physics-mind-lom-b\.visual_runs\newton_second_law\20260725-205424\STATE_2__dense_t00000.png` — reveal-start reference: only ONE block ("m₂") is visible at t=0, body A is fully hidden behind it.

## Candidate engine_bug_queue rows (REPORT ONLY — not inserted)

1. **bug_class:** `field3d_nlb_two_body_lane_offset_missing_causes_full_occlusion`
   **severity:** CRITICAL
   **owner_cluster:** `peter_parker:renderer_primitives`
   **prevention_rule:** In `newtons_laws_body`, `nlbSetBodyPosition()` sets every non-hanging body's mesh to `(s*NLB_WORLD_PER_M, NLB_BODY_SIZE/2, 0)` — z is hardcoded 0 for ALL bodies, so two independent (no-pulley) bodies authored at the same `initial_position_m` (the architect's own "same start line" pattern, used by both S2 and S3 here) render **fully coincident** at reveal and stay merged until their integrated positions diverge enough to separate on screen (confirmed in code, not just pixels — verified via `field_3d_renderer.ts` lines ~29497-29513). Any multi-body "independent/side-by-side" state needs a small fixed per-body-index lateral (z) offset so two bodies are never pixel-coincident, even when their `s` values match exactly at t=0. This also means the H2 `SET_TIME_FREEZE` reveal-completeness baseline can land inside the overlap window (it does here), so the frozen frame — the reveal-completeness reference — is illegible by construction whenever the pin time falls before the bodies visually separate.

2. **bug_class:** `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio`
   **severity:** MAJOR
   **owner_cluster:** `peter_parker:renderer_primitives`
   **prevention_rule:** `NLB_ARROW_SCALE = 0.030` world-units/N with `NLB_ARROW_MIN_LEN = 0.30` (comment: "a nonzero force is always at least readable") — but at this concept's authored magnitudes (0.2N/0.4N; raw lengths 0.006/0.012, both far under the floor) the rendered arrow is a near-invisible stub with no shaft/arrowhead/glow spread in ANY captured frame (S1 t=0…14000, S3 t=0…12000 all checked). Two consequences: (a) the state's SOLE designated `glow_focal` — the cause element Rule 32a requires to be visibly ON before the effect — is imperceptible; (b) S3's entire pedagogical device (Rule 29's magnitude-length exception: "the doubled arrow on B is visibly twice as long") is destroyed because BOTH 0.2N and 0.4N clamp to the identical `NLB_ARROW_MIN_LEN` — there is no length difference to see. This is exactly the risk the physics_author's own physics block flagged (§6, "numbers-are-small awareness note") and it is realized here, not merely a possibility. Prevention: either raise `NLB_ARROW_MIN_LEN`'s rendered visibility (thicker shaft / stronger glow at floor length) so a floor-clamped arrow still reads as a clear cue, AND reject/flag at author-time any state where two arrow magnitudes on the same canvas both fall under the floor (since their length ratio is then unrenderable) — force values must be scaled so at least the LARGER of a compared pair clears the floor with visible margin.

**Total candidates: 2.**

## Overall read

FINDINGS (2)
