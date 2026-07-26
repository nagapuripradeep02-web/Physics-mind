# eye_walker report — newton_second_law — RE-VERIFY 2

Run dir: `C:\Tutor\physics-mind-lom-b\.visual_runs\newton_second_law\20260725-214342\`
Supersedes: `docs/loop_runs/lom/newton_second_law/eye_walker_report_reverify.md` (stale — pre-slider-fix
pixels; superseded by that report's own note as instructed).

Engine bug queue consultation (pre-walk): `query_engine_bug_queue.ts newton_second_law --field3d --open`
→ **No matching OPEN/DEFERRED rows.** No known scar to carry into the walk.

## Deterministic gate summary (verbatim, as supplied)
📊 19 deterministic checks · 19 passed · 0 failed · $0.00 · (from the visual:eyes run that produced this dump)

## Slider-fix verification (the reason for this re-run)

Checked every frame with a live slider row for thumb-position ↔ printed-value consistency, computing
expected fractional position from the now-corrected `field_3d_config.slider_controls` ranges
(m/m2: 50–300, F: −40–40, v0 unchanged) and comparing against the pixel thumb position on the ~228px rail:

| frame | control | label | expected rail % | observed thumb position | verdict |
|---|---|---|---|---|---|
| STATE_2 frozen / all dense / contact-sheet rows | m₂ | 150.0 kg | 40% | mid-rail, ~40% | ✓ matches |
| STATE_4 frozen | m₁ | 150.0 kg | 40% | mid-rail, ~40% | ✓ matches |
| STATE_4 frozen | F | 9.8 N | 62% | right-of-center, ~62% | ✓ matches |
| STATE_4 frozen | v₀ | 0.0 m/s | ~50% (center of symmetric range) | center | ✓ matches |
| STATE_4 dense t=0 | m₁ | 150.0 kg | 40% | mid-rail | ✓ matches |
| STATE_4 dense t=0 | F | −20.0 N | 25% | left-of-center, ~25% | ✓ matches (previously rail-pinned hard-left — now interior) |
| STATE_4 keyframes t=2613/t=7628 (idle auto-sweep) | F | 10.72 N / −5.60 N | 63% / 43% | tracks continuously, never rail-pinned | ✓ matches |

**No rail-pinned thumb with a mid-range numeric label found anywhere in this dump.** The previously
reported failure signature (m₁/m₂ = 150.0 kg pinned far-right, F = −20.0 N pinned far-left against a
max:5-style stale range) is GONE. `slider_controls` rescale confirmed correct in pixels across STATE_2,
STATE_4 (both seized and idle-sweep), all contact-sheet time steps, and both persisted keyframes.

## Two-body engine re-verification (nlbBodyLaneZ, commit 3a576ea)

STATE_2 and STATE_3 bodies are individually colored (blue m₁ / pink or red m₂ depending on state),
individually labelled, and legibly separate as the run progresses:
- t=0 (S2, S3): both bodies at rest, same `initial_position_m: -8` per the authored physics_block
  ("both bodies... share the identical initial_position_m: -8" — this is the documented start-line
  design, NOT a defect; the lane (z) offset still gives two distinct colored boxes at this instant,
  just close together because they are physically co-located at rest).
- Mid-run (t≈3000–6000ms): visible gap opening, consistent with a=0.20 vs a=0.10 (S2) / a=0.10 vs a=0.20
  (S3, mirrored).
- Late-run (t≈10000–12000ms) and dense_t12000/t11000: bodies clearly separated, non-overlapping, each
  with its own label and readout row (m₁/v/a, m₂/v/a) — the 2:1 distance-growth comparison is legible.
- No interpenetration (single fused mesh / z-fighting) observed at ANY captured t — this was the actual
  failure class the commit fixed, and it does not recur.

## Force-arrow verification

- STATE_1: a visible directional arrow (labelled `F`) sits beside the body at every captured t (t=0
  through t=14000, frozen, panel_a) — present, not a floor-clamped stub, consistent length throughout
  (constant F=15N per Rule 32a's continuous-cause pattern; matches physics_block §3 S1 row).
- STATE_3: two-body 1:2 length ratio confirmed — m₂'s (30N) arrow is visibly longer than m₁'s (15N) arrow
  in every frame where both are drawn (t=0, t=6000, t=12000, frozen) — matches the documented
  0.45/0.90 world-unit target (magnitude-driven length, the authored Rule 29 exception for this pair).

## Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| STATE_1 | ✓ v=0.30 a=0.10 F=15.00N HUD legible, single F-arrow present | ✓ v climbs 0.00→1.39 across t=0→14000, a pinned 0.10, no teleport | ✓ cue "Force on — speed climbs" vs blank baseline | ✓ one formula surface `constant F ⇒ constant a`, value-only HUD, Unicode clean | none |
| STATE_2 | ✓ both bodies + HUD rows legible, m₂ slider thumb mid-rail matching 150.0 kg | ✓ gap widens t=0→12000, a_A=0.20/a_B=0.10 held constant, no teleport | ✓ cue "Same force — heavier lags" | ✓ formula `a = F/m`, value-only rows, Unicode clean | none |
| STATE_3 | ✓ both bodies + HUD rows legible, 1:2 arrow-length ratio visible | ✓ gap widens (mirrored vs S2), a_A=0.10/a_B=0.20, no teleport | ✓ cue "Same mass — stronger force wins" | ✓ formula `a ∝ F`, value-only rows, Unicode clean | none |
| STATE_4 | ✓ all three sliders (m, F, v₀) legible with thumbs matching printed values | ✓ idle auto-sweep drives F/a continuously (keyframes t=94…10115), free-runs per Rule 37, no freeze | n/a (explore state, Rule 32b/e exempt) | ✓ formula `a = ΣF/m`, value-only HUD incl. ΣF row, Unicode clean | none |

Home-pose continuity (32d): apparatus (single flat surface, same camera framing) persists across all four
states — S2→S3 is the declared contrast pair, same start line, only m/F roles swap, no teleport-rebuild.

Single glow focal (32e): each guided state's sole moving-cause element (the F arrow, or the arrow pair in
S2 opening beat) is the only bright element in the frame at any instant in the sampled frames; no second
simultaneous bright focal observed. (Noted as a lower-confidence read given frame resolution/dimness, but
no contradicting evidence found — no candidate row filed on this basis alone.)

## Frames for founder eyes

None required — zero candidates found, deterministic 19/19, pixel checks all confirm the fix.

## Candidate engine_bug_queue rows

**ZERO.** No new defects found. Both re-verify targets — the slider_controls rescale and the
nlbBodyLaneZ two-body separation — check out clean in pixels across every captured frame (contact
sheets, frozen, dense series, and STATE_4 keyframes).

## Overall read

**CLEAN (0 candidates).** Amendment 6 condition met (quality-auditor PASS assumed + this clean report) —
eligible for `visual:approve` auto-trigger by the orchestrating session. eye_walker does not run approve
itself.
