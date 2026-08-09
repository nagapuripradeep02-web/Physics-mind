# Checkpoint A — `work_energy_theorem` (concept #4) — cycle 2 (FINAL)

**VERDICT: `DESIGN_OK`** · Checkpoint A CLOSED · cycle 1 of 2 spent.

All eight findings and all four P3s landed at the right sites. The three load-bearing ones (F2/F3/F4)
reproduce exactly under independent re-derivation **from the engine source, not from the architect's
patch log**. Both architect additions beyond the cycle-0 patches are CONFIRMED, and one is a genuine
strengthening. No physics error, no engine dependency, no defect that would ship.

---

## The two architect claims — adjudicated

### Claim 1 — the F1 structural guarantee: **CONFIRMED, and stronger than the reviewer stated**

The work-bar caption node is `class="nlb_en_sym"` created at `field_3d_renderer.ts` L45022 with inline
style `flex:1 0 auto;margin-top:4px;color:#B0BEC5;font-family:Cambria Math,...;line-height:1.15;` —
**no `word-break`, no `overflow-wrap`, no `hyphens`.** A full-file sweep found the only `word-break`
at L2889, scoped to an unrelated cyclotron scenario, and **no `overflow-wrap` anywhere in the file**.

Under CSS defaults a single unspaced word is never broken, so the caption's **line count is 1
independent of its rendered width** — a too-wide word overflows horizontally, it does not wrap. That
is why the claim is stronger than the reviewer's: it does not depend on `friction` ≈ 40 px fitting a
46 px slot. Even if the Cambria Math advance widths were off, the line count — the only thing panel
height reads — stays 1. **F1 is correctly upgraded from "measured at three heights" to "true by
construction".**

### Claim 2 — cycle 0's `expected 138 px` was unpassable at THE EYE's 720: **CONFIRMED**

`nlbFitEnergyPanel` (L45119-41) uses `limit = window.innerHeight − 12` and returns at the FIRST step
whose measured bottom clears the limit (L45141). At 720: limit = 708. Step-0 bottoms are 545.6 px and
560.5 px — **both ≤ 708** — so the ladder returns at step 0 with `trk: 186` for either content class.
`trk 138` is step 1, reachable only below ~558 px. The clause could never have passed under a 1280×720
EYE capture, regardless of the caption fix. RISK-A now reads "never assert a particular value" (L309),
the only safe form.

---

## Independent re-derivations (from source, not from the log)

**F2 — S4, all at t = 2.6 s.** v = −3 + 3(2.6) = **+4.8** ✓ · s = 1.6 − 7.8 + 10.14 = **+3.94** ✓ ·
K = ½·4·4.8² = **46.08** ✓ · W_net = 12(3.94−1.6) = **28.08** ✓ · ΔK = 46.08 − 18.0 = 28.08 ✓.
Turn: t = 1.0, s = +0.1, W = 12(0.1−1.6) = −18.0 ✓. `work_scale_J: 40` → 45.0% / **70.2%**, peak
frac 0.70 < 1 so the L46396 warn (fires on `frac > 1`) is unreachable ✓. Pin at 1560 ms: v = +1.68,
s = +0.5704, W_net ≈ **−12.4** ✓, K = 5.6 J rising ✓ — pin values genuinely unaffected.

**No other scale disturbed:** only S4 (25→40) and S6 (360→400) moved. S1 72.7% · S2 72.7% · S3 89.1% ·
S5 69.8% ✓. **S5 still the concept K peak:** v = 2 + 1(2.4) = 4.4, K = ½·5·19.36 = **48.4 J** > S4's
46.08 ✓, on `bar_max_J: 55` = 88.0%, 12% headroom ✓.

**F3 — S6 envelope.** `nlbBoundsM` (L47150-67): for a non-hanging, **uncoupled** body it returns
`{lo: −lenM, hi: lenM}` — the `hiS` bracket reduction is gated on `eng0.coupled`, which S6 is not.
**Span = 12.0 m ✓.** Monotonicity: ∂K/∂m = ½v₀² − μgd = 8 − 35.28 = **−27.28 < 0** ✓ → lightest mass;
∂K/∂F = d > 0, ∂K/∂v₀ = mv₀ > 0 → max F, max v₀. Worst corner (m 2, F 30, v₀ 4):
**K = 16 + 24.12×12 = 305.44 J** ✓ on `bar_max_J: 340` = 89.8%. **Max pull = 360.0 J** ✓ on
`work_scale_J: 400` = 90%. Friction ≤ 211.7 ✓, net ≤ 289.4 ✓. Defaults: 98.88 / 240 / −141.12 / 98.88 J
= 29% / 60% / 35% / 25% ✓.

**Discrete-overshoot check (reviewer's own, beyond the architect's):** at the worst corner v ≈ 17.5 m/s
at the wrap, so one 1/60 s substep overshoots ≈0.29 m → W ≈ 369 J, K ≈ 312 J; even under a 3-substep
frame (the Rule 36 ceiling) W ≈ 386 < 400 and K ≈ 326 < 340. **Both scales clear the overshoot.**

**F4 — reversal corner removed, verified at the integrator.** With `v0 {min 0}` and `F {min 0}`,
velocity can never go negative: `stuck = !boundPin && |v| < NLB_STOP_EPS_V && |drive| ≤ maxStat`
(**L47908**) holds the body at rest when the drive is under static friction, so the F = 5 / m = 2 corner
(F < μmg = 5.88 N) parks rather than reversing. **No teacher-reachable setting produces a turn-around.**

**S4's disposition kept verbatim, not weakened** — all four clauses adjudicated SOUND at cycle 0 are
retained at §0 L24, with the S6 disposition **appended after**, not substituted. (Stated plainly: no
cycle-0 file exists in git, so this is a clause-by-clause comparison against the cycle-0 report's own
quotations, not a mechanical diff.)

**F7 registry check at source:** `positive_negative_zero_work/skeleton.md` — *"`decay-to-rest`
[may not be reused] for a slow-down that is not itself the taught content."* S2's taught content IS the
slow-down to a standstill → **condition of use satisfied.** Archetype audit now has **zero repeats**;
the contrast-pair declaration is correctly retired.

**F8:** `readoutHarvest.ts` L190-202 — `bare = length ≤ 12 && no '=' && !/\s/ && !/^[+-]?[0-9.]/`, then
`el.nextElementSibling`. In the work-slot DOM the sym div's next sibling IS the val div (L45022 →
L45026) ✓. `pull` (4) / `friction` (8) / `net` (3) / `K` all pass every clause → **all four harvest.**

**P3-1:** `nlbCpStampText` L46222/L46227 → the real emission is exactly
`flag:  W net = 10.0 J  ·  K = 20.0 J`, **36 chars** (counted out) — the architect's figure is right,
> the 34-char one-line precedent, and RISK-E now accepts a 2-line wrap.

---

## Carry-forward — hand down verbatim. NOT a third cycle; all ride along.

**CF-1 → physics-author (fold into the RISK-A probe, one extra assertion).**
The F1 guarantee protects *line count*, which is all panel height reads — but a single word exceeding
its slot **overflows horizontally** rather than wrapping, and that is a legibility defect the current
probe would not catch. At ladder step 2 (`sym: 11 px`, slot `w: 34 px`) `friction` in Cambria Math
measures ≈32–35 px — marginal. Step 2 requires an iframe under ~451 px, outside the observed 551–911
range, so almost certainly unreachable. Cheap insurance: in RISK-A, additionally assert
`scrollWidth <= clientWidth + 1` on every `.nlb_en_sym` caption at each of 551 / 720 / 911.

**CF-2 → json-author + quality-auditor (correct one build-guard sentence).**
§10(f-5) says omitting either block on a state "silently changes the panel class, **the header** AND the
reflow step". The header part is not true: `nlbEnergyPanelLabel` (L44909-23) computes a **union over all
states** and returns `"Energy and work bars"` if *any* state has each block — so a per-state omission
leaves the panel name unchanged and would not show on screen. The visible tell is the missing
`Work done` section header (L44987) in that state. §1's claim is correct as written; only §10(f-5)'s
*detection* claim overstates. Consequence: **the §1 invariant must be enforced by the grep json-author
is held to, never by a screen check.**

**CF-3 → physics-author (one stale number in prose).**
§3 L108's parenthetical — "step 0 at iframe ≥ 573 px … step 1 at ≤ 557 px" — carries the **pre-fix**
two-line boundary. After the single-word fix there is only one class and its boundary is **≥ 558 px**
(545.6 + 12), which is what the patch log at L377 says. Nothing downstream keys on 573; prose accuracy only.

**CF-4 → Checkpoint B (a design observation, explicitly not a fix).**
S6 exposes F, m, v₀ but locks μ at 0.3, so the demonstration a teacher most often wants on a rough floor
— "rougher floor removes more kinetic energy" — is not reachable. A defensible scope call (μ is #10's
neighbourhood), and adding it is *not* free: at μ_max 0.6 the friction ledger reaches
0.6·6·9.8·12 = 423 J, breaking the `work_scale_J: 400` envelope just re-derived. Flagged so Checkpoint B
judges the sandbox's completeness with the trade already priced.

---

## Per-state close-out

| # | idea distinct? | archetype | ring | controls | arithmetic re-derived | verdict |
|---|---|---|---|---|---|---|
| S1 | yes — the theorem, two instruments one number | `translate-through` ✓ | core | none | a = 2.0, d = 4.0, K = W = 40.0 ✓ | OK |
| S2 | yes — the signed case; archetype fix makes the picture honestly inverse to S1 | `decay-to-rest` ✓ registry met | core | none | a = −3.92, rest at d = 2.041 / t = 1.020 s, W = −40.0 ✓ | OK |
| S3 | yes — work by A force ≠ net work; still the best state | `null-result-hold` ✓ | core | none | F = μmg = 19.6 exact, d = 5.0, ±98.0, K flat 15.6 ✓ | OK |
| S4 | yes — ΔK from a nonzero start through a reversal; 16a lands where only S4 can | `cycle-compare` ✓ | extended | none | all at t = 2.6 s ✓; scale 40 ✓ | OK |
| S5 | yes — derivation + stamped check | `flow-along-path` ✓ | advanced | none | flag at −3.4, t = 0.828, K 10→20, W 10.0, R-end 48.4 ✓ | OK |
| S6 | yes — three live dials over the taught relation | `drag-sandbox` ✓ | core (38b ✓) | F, m, v₀ | span 12.0, K 305.44/340, W 360/400, overshoot clears ✓ | OK |

Rule 38 re-checked in full (38a rings + both cuts coherent · 38b explore core-only · 38c algebra
outside S5 · 38d board-neutral · 38f universal anchors · 38g CBSE verified, seven other boards carry
`needs_teacher_verification: true`). Rule 41 audit clean after the two P3 patches.

**No new blocking defect. No engine finding. No `FIX(engine)`. No new scar candidate** beyond the
cycle-0 set already filed in `scar_candidates_checkpointA.sql`.

---

```
RUBRIC (advisory, unratified — did NOT affect the verdict)
  Checkpoint-A subset:  D1 2 · D2 2 · D8 2 · D9 2 · D10 2   = 10/10
  weakest: D1 — S2 remains the thinnest state; it earns its place on content rather
           than on a picture no other state could make. The cycle-0 D1 = 1 rested
           partly on "same picture as S1", which the F7 archetype correction refuted:
           S1 is rest -> moving with the K bar filling, S2 is moving -> rest with it
           emptying — genuinely inverse motions, now honestly declared.
           D10 — every S6 dial demonstrates something, but mu is locked at 0.3 (see CF-4).
```
