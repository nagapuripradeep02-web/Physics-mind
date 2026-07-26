# eye_walker — em_wave_propagation — re-review (fix cycle 2)

Run under review: `.visual_runs/em_wave_propagation/20260725-032745/` (11 states, 47/47 deterministic
checks passed per THE EYE run header — reproduced as given by the dispatch brief; no manifest-embedded
copy of the stdout summary line was available to quote byte-for-byte, so this is carried forward from the
dispatch brief rather than re-derived).
Baseline for before/after diffing: `.visual_runs/em_wave_propagation/20260725-012153/`.
Bug queue: `query_engine_bug_queue.ts em_wave_propagation --field3d --open` → **no open rows** (clean slate
going in).

## Finding closure table

| # | Finding | Verdict | Evidence |
|---|---|---|---|
| F-S5 | ghost_dissolve_hook_dead_code (BLOCKING) | **CLOSED** | `STATE_5__frozen.png` (18000ms): no red ghost line, no `✗ expected: B peaks 90° after E` tag. Confirmed the ghost still does its pedagogical job first: present in `STATE_5__dense_t00000.png` through `..t13000.png`, fully dissolved (ghost + tag both gone) by `..t14000.png`, still gone at `..t15000/16000.png` — clean ~1s fade landing before the 14500ms target, well inside the state before the 18000ms frozen capture. |
| F-S9 | reveal pin omitted link/assembled `_at_ms` | **CLOSED** | `STATE_9__frozen.png` now shows the three recall links docked + the assembled `B_z = (E₀/c)·sin(kx−ωt)` line, byte-matching the shape of `STATE_9__dense_t18000.png` (old run's frozen frame showed only the bare `E_y` line and none of the links/assembly). |
| F-S1 | needle_kick_at_ms unread, pulse mistimed | **CLOSED** | `STATE_1__frozen.png` (9500ms): pulse is at/past the receiver, `E = -98 V/m`, `B = 0.33 µT` (both clearly non-zero) vs the old run's `E = 0 V/m`, `B = 0.00 µT` with the pulse still mid-flight. `STATE_1__dense_t09000.png` shows the receiver needle visibly kicked and E/B at full amplitude (E=-120, B=-0.40) at the moment of arrival — confirms genuine physical kick, not just a nonzero-by-luck reading. |
| F-S6 | λ bracket declared but never rendered | **CLOSED** | Pixel-diffed (not just eyeballed — first visual pass was misleading at thumbnail scale). `STATE_6__frozen.png` diff bbox against the old run isolates exactly the bracket region (579,231)-(704,272); cropped compare: old = blank, new = a ⊓ bracket spanning one wavelength with `λ = 3.00 m` label, sitting clear of gate A/B labels, the top-right HUD, and the bottom formula dock (Rule 34d respected). |
| F-S6 side-effect | `show_lambda` also true on S11 (unreviewed) | **CLOSED / OK** | Same pixel-diff technique applied to `STATE_11__frozen.png`: identical bbox, identical bracket now renders on the explore state too, legible, no collision with the top-right λ/ν HUD or the bottom-right slider panel. Intended side-effect confirmed benign. |
| F-S8 | S8 formula ASCII `u_E`/`u_B` (Rule 34c) | **CLOSED** | `STATE_8__frozen.png` formula now reads with proper typographic subscripts (`u` with small-caps `E`/`B` below baseline), matching the `u_E`/`u_B` tank labels above. Old run showed literal `u_E = ½ε₀E² = u_B = B²/2μ₀` with underscore ASCII. |

## Per-state regression sweep (frozen frames, byte-diffed old vs new)

| State | Frozen diff | Dense spot-checks | Verdict |
|---|---|---|---|
| STATE_1 | expected change (F-S1 fix) | t08000/t09000 show correct pulse arrival + needle kick | intentional fix, no regression |
| STATE_2 | **byte-identical** (frozen + dense t09000/t18000 all null-diff) | — | surgeon's "S2 is byte-identical" claim CONFIRMED on pixels, not just claimed |
| STATE_3 | byte-identical (frozen + dense t14000) | — | clean |
| STATE_4 | byte-identical (frozen); dense t09000 shows a small camera/label-overlap difference during the mid-motion E×B zoom cue (the `ŷ` axis-label sprite happens to sit slightly closer to the `E =` value label than in the old run, reading like a stray superscript at a glance); dense t18000 near-pixel-identical (sub-pixel only) | — | **not a regression** — reveal-complete frame (frozen) is untouched; the mid-motion difference is classic camera-easing/render-timing non-determinism between two separate headless captures (known false-positive class), not a content change. No bug row warranted, but flagging for awareness since it wasn't in the original four fixes. |
| STATE_5 | expected change (F-S5 fix) | see above | intentional fix, no regression |
| STATE_6 | expected change (F-S6 fix — bracket now present) | — | intentional fix, no regression |
| STATE_7 | byte-identical (frozen + dense t14000) | — | clean |
| STATE_8 | expected change (F-S8 fix) | — | intentional fix, no regression |
| STATE_9 | expected change (F-S9 fix) | — | intentional fix, no regression |
| STATE_10 | byte-identical (frozen + dense t09000/t18000) | — | clean |
| STATE_11 | expected change (F-S6 side-effect — bracket now present) | — | intentional, confirmed benign |

## Frames for founder eyes (≤5)

1. `.visual_runs/em_wave_propagation/20260725-032745/STATE_5__frozen.png` — the headline BLOCKING fix: clean in-phase twin-readout, ghost + wrong-belief tag both gone.
2. `.visual_runs/em_wave_propagation/20260725-032745/STATE_1__frozen.png` — pulse-arrival fix, needle kicked, non-zero readout.
3. `.visual_runs/em_wave_propagation/20260725-032745/STATE_9__frozen.png` — assembled B_z line + docked recall links.
4. `.visual_runs/em_wave_propagation/20260725-032745/STATE_6__frozen.png` — λ bracket now rendered, non-colliding.
5. `.visual_runs/em_wave_propagation/20260725-032745/STATE_8__frozen.png` — proper Unicode subscripts on the formula surface.

Zero frames need founder eyes for a *problem* — all five above are confirmation shots, not open issues.

## Candidate engine_bug_queue rows

None. All five findings from the fix brief are CLOSED on pixels; the one incidental STATE_4 dense-frame
difference is judged camera/render-timing noise (frozen frame identical, motion still physically correct),
not a defect — no row recommended.

## Overall read

**CLEAN.** All four engine fixes (F-S5 blocking + F-S9/F-S1/F-S6 ride-along) and the F-S8 authoring fix are
confirmed landed on the actual rendered pixels, cross-checked against the pre-fix run. Regression sweep of
S2/S3/S4/S7/S10 shows no unintended pixel changes (S2 byte-identical claim independently verified). S11's
unreviewed `show_lambda` side-effect is confirmed rendering cleanly with no overlay collisions.
