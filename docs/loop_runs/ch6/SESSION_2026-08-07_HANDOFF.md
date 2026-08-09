# ch6 session handoff — 2026-08-07

Two concepts taken from nothing to Checkpoint B. **Both returned FIX. Neither is approved, neither is
shipped, `visual:approve` was not run, no TTS, nothing near `PILOT_CONCEPTS` or deploy.**

## Review links (servers were live at session end)

| concept | link | desk / branch |
|---|---|---|
| #4 `work_energy_theorem` | `http://localhost:8101/work_energy_theorem/` | `C:\Tutor\pm-ch6-c4` · `feat/ch6-concept-4` |
| #5 `conservative_vs_nonconservative_forces` | `http://localhost:8102/conservative_vs_nonconservative_forces/` | `C:\Tutor\pm-ch6-c5` · `feat/ch6-concept-5` |

Restart if dead:
```
npx --yes http-server "C:\Tutor\pm-ch6-c4\review-site" -p 8101 -c-1
npx --yes http-server "C:\Tutor\pm-ch6-c5\review-site" -p 8102 -c-1
```

## Merged to master this session

| PR | what |
|---|---|
| #18/#19/#21 | the ch6 stack (concepts #2/#3 + the nlb engine fixes). Two needed hand-resolved conflicts — master had gained 140 commits |
| **#47** | THE CALCULATOR was structurally blind to the energy panel (symbol and value are sibling elements). `1 passed / 59 skipped` → `7 passed / 53 skipped` |
| **#48** | THE EYE never persisted its `checks` block — "27/27" had no artifact behind it |
| **#52** | renderer `[PM_*]` self-diagnostics emit via `console.warn`; every capture filtered on `error`. **Two documented guards had never once reached a gate** |
| **#56** | a glow-focal arrow was made **darker by its own focal boost**. 1.04:1 → 13.27:1 |
| **#57** | `newtons_laws_body` printed `stateDef.label` as canvas prose — the state's own outcome, from frame one |

## Checkpoint B verdicts

### #4 `work_energy_theorem` — **FIX** (2 P1, 4 P2, one blocking `FIX(engine)`)
- **P1-1** the legend spoiler → **now FIXED and merged (PR #57)**. Re-verify at cycle 1.
- **P1-2 OPEN** `alex:physics_author`: the K track maps `0…bar_max_J` over 138 px while the signed work
  track maps `±work_scale_J` over the same 138 px, so the same `18.1 J` draws at **45.3 px and 22.7 px**
  on the state whose delta cue is literally "Two bars, one number". Identity: **`bar_max_J = 2 × work_scale_J`**
  (S1/S2 → `bar_max_J: 110`). Re-derive; do not take the numbers on trust.
- **P2-1** S4's still cannot carry its claim — `K₀ = 18.0 J` is rendered nowhere.
- **P2-2** CF-4 answered, and the reviewer **overturned its own Checkpoint A pricing**: at `μ ∈ [0.2, 0.5]`
  both envelopes hold unchanged (friction 352.8 < 400; K 329.0 < 340). Sliders already wired. Add the μ dial.
- **P2-3** friction 6.30:1 vs pull 12.50:1 in the state whose claim is that they are **equal**.
- Re-audit **not** required if the fix stays inside `bar_max_J` / `slider_controls` / S4 narration.

### #5 `conservative_vs_nonconservative_forces` — **FIX(engine)**, 3 blocking, **zero authoring P1s**
The authoring is the best in the chapter. All three blockers are engine-owned.
- **F-A BLOCKING, NEW CLASS** — the S5 sandbox **dies against the lower track bound**. SEAM J
  (L48253-55) wraps a body crossing `bd.lo` to `bd.hi` and re-seeds `v = v0` **up-slope**, which
  re-crosses immediately. Measured: `s` confined to **[−5.89, −4.82] of a 12 m track for 24 s**. This is
  the **first nlb sandbox on a slope** — every shipped one is `theta_deg: 0`, where the wrap is correct.
  No authoring escape exists.
- **F-B BLOCKING** — and the reviewer **reversed its own Checkpoint A ruling** to file it. It had granted
  `DESIGN_OK` partly on the written premise that at the recross "bar and stamp read zero together".
  Measured at 60 fps that is false: the bar reads `+1.5 → +24.9 J` **green** across the whole 217 ms the
  stamp says `W gravity = 0.0 J`. **The bar reads the stamped value on zero of the ~14 frames the stamp
  is on screen.** Fix is a time qualifier on the live panel, gated so no shipped baseline moves.
- **F1 BLOCKING** — S2's two flag labels overprint into `back at the flag rt`, in the H2 pin itself.
  The reviewer **rejected** re-routing this to `alex:json_author` and priced the alternative: moving the
  flag from +0.2 m to +0.6 m drops the pass-1→pass-2 friction growth from **9.9× to 2.6×** and collides
  with S4's stamp. Fix the dodge, keep the design.
- **CF-2 ruled: DO NOT PULL IT.** The lever lengthens dwell but raises S1's green from +24.9 J to
  **+37.1 J** — it pays in the exact currency the defect is denominated in.

## Founder decisions waiting

1. **Re-baseline.** PRs #56 and #57 both move pixels on shipped concepts. #57 re-cuts every nlb baseline
   (3 ch6 + the Ch.5 laws-of-motion set). Rule 34e makes this yours. Nothing was re-approved.
2. **Canvas composition** — both concepts, and the three shipped siblings, put the apparatus in roughly
   the middle third of a 1280 px frame with the right half near-empty. Consistent across the family, so
   it is an apparatus-scale decision, not a per-concept slip. Flagged by two independent reviewers.
3. **The μ dial on #4's sandbox** (P2-2) — cheap, and the reviewer changed its own mind in favour.

## Scar rows: 18 filed and applied this session

Including two that **correct earlier rows**: one instructed future architects to size a loop so a closure
stamp precedes the 0.60R pin, which was later proved structurally impossible; the other recorded a
reviewer accepting a residual on an inferred visual premise instead of measuring it.

## The lessons that cost the most

- **A skip is not a pass, three times over.** THE CALCULATOR reported `7 passed / 0 failed` on #4 while
  checking **zero physics** — six of the seven passes were a coverage count. Both gates also fold skips
  into their pass totals (`23/23` was 17 real checks; `113 skipped` was encoded as `passed: true`).
- **A gate result is only evidence if the artifact it ran against is the one you changed.** An early
  legend-fix test ran from a branch cut off master, which lacks the concept JSON; the re-seed failed
  silently and THE EYE photographed a stale cached sim. It nearly produced two false conclusions at once.
- **H2 is structurally blind to small-object defects.** A 280-pixel arrow is 0.03% of the frame against a
  2.0% tolerance, so a fully-inverted CRITICAL focal hid inside baseline noise on a shipped concept.
- **Agents refusing instructions saved this session twice.** An architect rejected a reviewer's worked
  patch with arithmetic showing it would ship the defect it was written to prevent (+134.6 J on a 70 J
  scale). A quality-auditor rejected the dispatching session's own proposed fix because it would mint
  **false FAILs**, and gave an ordering instead.
- **Every defect that mattered was found by reading pixels or driving the sim.** Every deterministic gate
  reported clean.
