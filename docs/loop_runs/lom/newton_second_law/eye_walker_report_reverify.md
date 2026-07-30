# eye-walker re-verification report — newton_second_law

Run dir: `C:\Tutor\physics-mind-lom-b\.visual_runs\newton_second_law\20260725-212557\`
(fresh run, this session, captured after a scoped cache clear + full re-seed)

Engine bug queue consultation (pre-walk): `query_engine_bug_queue.ts newton_second_law --field3d --open`
→ **No matching engine_bug_queue rows.** (Both prior findings from this concept's earlier walk were never
inserted as queue rows — they were reported and routed directly; nothing OPEN to carry into this walk.)

## Deterministic gate summary (verbatim from this session's visual:eyes run)

19 deterministic checks · 19 passed · 0 failed · $0.00

## Prior-finding re-verification (the point of this pass)

**FINDING 1 — `field3d_nlb_two_body_lane_offset_missing_causes_full_occlusion` (was CRITICAL) → RESOLVED.**
Checked STATE_2 and STATE_3 (the two-body states) across every dense frame, both `__panel_a.png` captures,
and both `__frozen.png` (H2) baselines. The two bodies are now DISTINCTLY colored (pink/red vs blue) and
individually labelled (`m₁` / `m₂`) at every captured instant, including t=0. At t=0–~2000ms the two bodies
start visually close together (both authored at the same `initial_position_m: -8` — intentional, "launched
together" is the taught beat) but are never coincident/merged the way the CRITICAL bug described: colors
differ from frame 1, and a sliver of the rear body is always visible. By t≈3000–4000ms (of a 12s state) the
bodies have visibly separated into two clearly independent, individually-labelled objects, and the gap grows
monotonically per the correct 2:1 (STATE_2) / 2:1 (STATE_3) physics. The H2 `__frozen.png` baseline (captured
at reveal-complete time, well past the initial close-start window) shows full, unambiguous separation in both
states. **Verdict: fixed. No recurrence of the "full occlusion / merged label blob" defect class.**

**FINDING 2 — `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` (was MAJOR,
re-routed to content) → RESOLVED.** STATE_1's sole force arrow (15 N → 0.45 world units) is present in every
dense frame as a legible small arrow+label (`F`), clearly above the 0.30 floor stub and correctly serving as
the state's sole glow_focal per Rule 32a. STATE_3's two arrows (15 N / 30 N → 0.45 / 0.90 world units) show a
genuinely readable ~1:2 length difference in the dense frames (checked t=0 and t=12000) — body B's (m₂,
30 N) arrow is visibly longer than body A's (m₁, 15 N) arrow. STATE_2's two arrows (both 15 N, equal force)
render at visibly equal length, correctly signalling "same force" for the mass-compare beat. **Verdict:
fixed — the x75 content rescale produced legible, ratio-correct arrows.**

**"field3d_nlb_phase_glow_handoff_not_visible" (open item flagged for re-check)** — not confirmable or
deniable from static frame dumps (a brightness-delta handoff needs consecutive-frame diffing or a live
session, which THE EYE's frozen/dense stills don't capture directly). Structurally: every state declares
exactly ONE `newtons_laws_body.glow_focal` id (`nlb_arrow_A_applied`, `nlb_body_B`, `nlb_arrow_B_applied`,
`nlb_body_A`) — no state authors more than one, satisfying Rule 32e at the JSON level. No visual evidence of
a broken handoff was found in any frame (the declared focal element — arrow or body — is always the visually
distinct/colored element in its state). **Not filed as a candidate** — no evidence either way; recommend a
live-session spot-check only if the founder wants certainty, not required to unblock this loop.

## Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| STATE_1 | ✓ | ✓ | ✓ | ✓ | single body, single arrow, constant length; v climbs while a/F pin — matches aha statement |
| STATE_2 | ✓ | ✓ | ✓ | ✓ | two bodies separate cleanly by ~t=3–4s; equal-length arrows confirm "same force" |
| STATE_3 | ✓ | ✓ | ✓ | ✓ | two bodies separate cleanly; arrow lengths show readable ~1:2 ratio (15N vs 30N) |
| STATE_4 | ✓ | ✓ | ✓ | ✓ | sandbox idle-sweep drives F across sign; arrow direction flips consistently with F sign and readout |

Notes column legend: ✓ = no defect found. "Delta visible?" judged per Rule 32c/32d — each state's frozen
frame + top caption differ from the previous state's (distinct caption, distinct body count/colors/formula
overlay) and the delta cue reads correctly (≤5 words, on-canvas, opens each caption).

Additional doctrine checks (Rule 33d instruments, Rule 34 canvas/formula/HUD, HUD-vs-caption-vs-position
consistency — the class that caught the prior concept's clock defect):
- Rule 33d: HUD readouts are live numeric values (v, a, F, ΣF as applicable) throughout every dense frame
  and both keyframes checked — no decorative/static dial found.
- Rule 34a: on-canvas top caption is the ≤5-word delta cue only in every state; narration prose is not
  duplicated on-canvas.
- Rule 34b: exactly one formula overlay per state (`constant F ⇒ constant a` / `a = F/m` / `a ∝ F` /
  `a = ΣF/m`), math-serif styled, value-only HUD alongside it.
- Rule 34c: all on-canvas math uses real Unicode (₁ ₂ ∝ Σ) — no ASCII math transcription found in any
  checked frame.
- Rule 34d: no overlay collision in any checked frame — top caption, top-right HUD, bottom-right
  formula/controls, bottom-left caption strip all occupy distinct screen zones.
- HUD-vs-position consistency: spot-checked STATE_4 keyframes — F=-19.04N ⇒ left-pointing arrow, F=12.96N
  ⇒ right-pointing arrow; body position/velocity sign agrees with F sign at every checked keyframe. No
  contradiction found (this is the exact class of defect that caught the prior concept's clock bug).

## Frames for founder eyes

None required — no findings rise to founder-review priority. If the founder wants a spot confirmation of the
two-body fix (the park cause), the most informative single frame is:

- `C:\Tutor\physics-mind-lom-b\.visual_runs\newton_second_law\20260725-212557\STATE_2__dense_t11000.png` —
  shows both bodies fully separated late in the state with clearly different labels/colors/velocities,
  the clearest single-frame proof the lane-offset fix works.

## Candidate engine_bug_queue rows

**ZERO.** No new findings. Both prior findings (Finding 1 CRITICAL, Finding 2 MAJOR/re-routed) are verified
resolved in pixels on this fresh, re-seeded run. The open "phase glow handoff" item found no supporting or
contradicting evidence in static frames and is not filed.

## Overall read

**CLEAN**
