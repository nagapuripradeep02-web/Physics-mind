# E2b — `bonding_scene` thermal layer · ENGINE FIX SPEC (ready-to-dispatch)

**Owner: `field3d-surgeon` (`peter_parker:field3d_surgeon`). ONE dispatch, ONE region, Rule 40 —
lands on MASTER, separately and immediately, never inside a concept branch.**

**Queue position:** behind E3a and E1c. Two surgeons in `field_3d_renderer.ts` at once is the exact
Rule-40 hazard Phase 0 exists to prevent.

**Raised by:** Desk 1 concept 2 (`hydrogen_bonding`), founder-proxy Checkpoint A cycle 1
(`DESIGN_FIX`, 2026-08-02), recommendation **option (B)**. Full evidence:
`docs/skeletons/hydrogen_bonding_skeleton.md` (the measurement note at the top, Appendix A, and the
Checkpoint-A section at the bottom).

**Blocks:** `hydrogen_bonding` S6 — and ONLY S6. S1–S5, S7 and S8 are design-complete and fully
measured against the shipped engine; the concept build is stopped at this gate rather than authoring
a state the taste gate has already rejected in its only shippable form.

**Do NOT build:** an expansion/diffusion thermal model. founder-proxy rejected it on three
independent grounds — it is the wrong physics (a real hydrogen-bond network collapses at
*vaporisation*, by molecules separating; the shipped model is isochoric, so its modest decline
across the liquid range is *defensible*, not deficient), it would have to be authored rather than
derived (the D-2 defect), and it builds the ledger-deferred `states_of_matter` concept. **That is
where the Phase-0 alarm rule fires.** The two asks below are the whole scope.

---

## EQ-1 · `thermal.T_from` / `T_at_ms` / `T_ramp_ms` — the scripted temperature ramp — **BLOCKING**

### Why
`T_K` is resolved statically per state (`field_3d_renderer.ts:53507–53508`); the only scripted ramp
in the free-placement path is `sepAt` (`:53603–53610`). A full-file grep for
`T_from | T_at_ms | T_ramp | thermal_at_ms | heat_at_ms` returns zero `bonding_scene` hits.
`hydrogen_bonding` S6's beat must AUTO-PLAY on the state clock (Rule 31; the headless harness never
drags). Without it S6 opens hot and stays hot: nothing causes anything (Rule 32a), and
`heat-the-network` names a rhythm that does not exist, making it an undeclared repeat of S5's
`network-flicker` (Rule 31b).

### The shape — a line-for-line clone of the angle ramp E1c already shipped
`:53500–53503` is the pattern; do not invent a second one:
```js
var angleAt = function (mms) {
    if (bs.angle_from == null || bs.angle_at_ms == null) return angleTo;
    return mgRamp(mms, bs.angle_at_ms,
        (bs.angle_ramp_ms != null) ? bs.angle_ramp_ms : BS_ANGLE_RAMP_MS,
        bs.angle_from, angleTo);
};
```
The temperature twin, at the site where `T_K` is currently resolved (`:53507–53508`):
```js
var T_to = (th.T_K != null) ? th.T_K : BS_T0_K;
var tempAt = function (mms) {
    if (th.T_from == null || th.T_at_ms == null) return T_to;
    return mgRamp(mms, th.T_at_ms,
        (th.T_ramp_ms != null) ? th.T_ramp_ms : BS_T_RAMP_MS,
        th.T_from, T_to);
};
var T_K = (bscHasControl(ctrls, "temperature") && window.PM_bscTempDragged)
    ? window.PM_bscTemp : tempAt(ms);
```

### Requirements
1. **Closed form in state-local `ms` (D-1).** `mgRamp` only — no accumulator, no latch. A
   `SET_TIME_FREEZE` rewind must photograph the same pixels. `bscJiggle` is already a pure function
   of `(idx, tSec, T_K, scale)`, so feeding it a ramped `T_K` keeps the whole pass pure.
2. **`T_K` stays the DESTINATION** (exactly as `angle_deg` is the destination of `angle_from`, and
   `separation` of `approach_from`). A state authoring no ramp is byte-identical to today.
3. **Drag-seize, both directions.** The guard `PM_bscTempDragged` **already exists** (`:53507`) —
   yield to it exactly as `sepAt` yields at `:53603–53604`. And **the slider row already tracks the
   live `T_K` every frame** (`:54590–54593`) — do NOT rebuild that half; it is the FIXED scar
   `scripted_change_desyncs_the_dom_control_that_shares_it` and it is already satisfied.
4. **Entry seeding.** In `applyBondingSceneState`, seed the widget at the ramp's OWN starting value,
   mirroring `:53209–53210` (the angle) and `:53200–53201` (the separation):
   `window.PM_bscTemp = (th.T_from != null && th.T_at_ms != null) ? th.T_from : (th.T_K ?? BS_T0_K);`
   Otherwise the slider reads 600 while the network is drawn at 298.
5. **`deriveStateMeta` registration IN THE SAME CHANGE** (the E1c-8 lesson — a ramp with no
   following reveal cue otherwise pins at `DEFAULT_REVEAL_MS` = 1500 ms, i.e. mid-ramp, minting a
   self-contradictory baseline). In `maxRevealForField3dState`, beside the existing
   `angle_at_ms` candidate at `:2021–2023`:
   ```ts
   const bscTh2 = asObj(bscState.thermal);
   if (bscTh2 && typeof bscTh2.T_at_ms === 'number') {
     candidates.push(asNum(bscTh2.T_at_ms, 0) + asNum(bscTh2.T_ramp_ms, 2000) + 600);
   }
   ```
6. **Motion declaration is already correct** — `deriveStateMeta:282–288` declares motion when
   `thermal.jiggle_scale > 0`, which S6 authors. No change needed.

### Before / after
S6 plays 298 → 600 K over ~5 s and the network visibly agitates harder (amplitude ×1.42, exactly
√(600/298)) while `links_per_unit` declines monotonically, instead of opening hot.

---

## EQ-2 · a time-averaged `links_per_unit` — **BLOCKING (measured)**

### Why — this was conditional, and the measurement fired it
founder-proxy made EQ-2 conditional on the S6 live range. Measured on the shipped harness (the link
pass at `:54399–54471` replayed exactly), 0.8–18 s sweep, `jiggle_scale` 0.9, shipped link defaults:

| state | mean | live range |
|---|---|---|
| S5 @ 298 K | 3.41 | **3.00 – 3.67** |
| S6 @ 600 K | 2.85 | **2.27 – 3.33** |

**The ranges OVERLAP** (S6 max 3.33 > S5 min 3.00). **29 % of S6's frames read a value S5 also
produces at 298 K.** The HUD prints `toFixed(2)` (`:54546`) on a quantity whose fixed-condition
swing is ±0.33, so S6's entire taught delta (0.56) is one flicker-swing wide: no single frame — and
no teacher glance — can tell the heated network from a random instant of the unheated one. That
breaks Rule 33d (an instrument must evidence its own caption) and Rule 32c (the delta must be
visible), and it will make eye_walker's S5→S6 "delta visible?" inconclusive by construction.

### The fix is confirmed to work
Averaging over the **640 ms lookback the link pass already builds** (`frames[]`,
`BS_LINK_SAMPLES` = 9 closed-form snapshots, oldest first, `:54419–54433`) separates them cleanly:

| state | smoothed range |
|---|---|
| S5 @ 298 K | **3.18 – 3.59** |
| S6 @ 600 K | **2.60 – 3.16** |

Separated: **YES**. The flicker stays in the pixels — where it is S5's whole lesson — and the number
stops being noise, so S6's caption becomes readable.

### Requirements
1. **Reuse `frames[]`; build nothing new.** Each sample is already a closed-form position set, so a
   mean over that window is pin-safe by exactly the argument the FIXED scar
   `hysteretic_state_cannot_be_latched_under_a_time_pin` established ("this pattern generalises to
   any beat needing memory"). A `SET_TIME_FREEZE` rewind still reproduces it bit-for-bit.
2. **Average the COUNT, not the displayed string.** Evaluate the link predicate at each of the 9
   lookback samples and average the resulting counts; publish as
   `window.PM_bscLinksPerUnitAvg`. Samples before the state start (`mms < 0`) are already `null` and
   must not vote — reuse the existing skip.
3. **`hud_lines: 'links_per_unit'` reads the AVERAGED value; `'links'` keeps reading the
   instantaneous count** (S2/S3 count a single link forming and breaking — an average there would
   smear the exact beat those states teach). One instrument per quantity (D-3) is preserved: the
   dashes are the instantaneous truth, the readout is the mean, and they are labelled as different
   things.
4. **Do not change the `2L/N` convention** (`:54471`) — it is the mean degree and it is correct.

---

## EQ-3 · `bscSiteExtent` must see molecular units — **ride-along**

### Why
`BS_CAMERAS.network = { az 35, el 22, dist 17.0 }` (`:51718`) was solved by E2 against *"a 27-unit
box spans ~11.5"* (`:51713`) — a loose cubic arrangement the contract itself records as giving
**≈1.07 links/molecule** (trap 4), i.e. a layout no lesson can use. The tetrahedral network
`hydrogen_bonding` must use has radius **12.84 units**, while dist 17.0 shows only ±9.81 vertically,
so the outer shell bleeds off-frame. This is physics, not a layout error: liquid water occupies
270 unit³ per molecule, so any honest 30-molecule arrangement needs radius ≥ 12.5.

### The mechanism already ships — extend it, do not build it twice (Rule 40a)
The E3a auto-fit exists at `:53280–53283` (`dd = Math.max(dd, ext * BS_FIT_MARGIN)`), built for
exactly this. It is a **silent no-op** here only because `bscSiteExtent` → `bscSiteList`'s
free-placement branch (`:52503–52512`) filters through `bscIsSite` (`:52449` —
`!MG_MOLECULES[sp]`), i.e. atoms and ions only.

1. Make `bscSiteExtent` include molecular units' `at` (plus their bond reach, `BS_BOND_LEN`).
2. Set `network: { az: 35, el: 22, dist: 17.0, fit: true }`.
3. ⚠ `BS_FIT_MARGIN` 1.90 is calibrated for lattice half-diagonals and would push dist ≈ 27 here —
   **verify legibility on THE EYE frames and tune per-camera**, never by authoring a state `camera`
   (that suppresses the solved camera).
4. Subsumes the S3→S4 `approach_link` el 16/dist 11 → `compare` el 20/dist 12 nudge if the
   free-placement solve is made content-derived rather than mode-keyed.

---

## VERIFY CHAIN (the surgeon's, on master)

```
npm run check:renderer-syntax          # both emitted template bodies, node --check
npx tsc --noEmit                       # 0
npm run check:bonding-scene            # extend: assert the T ramp is closed-form and that a
                                       # state authoring no ramp is byte-identical; assert the
                                       # averaged readout separates two temperatures whose
                                       # instantaneous ranges overlap
npm run validate:concepts              # unchanged
npm run visual:eyes -- vsepr_molecular_shapes        # the three-concept regression
npm run visual:eyes -- hybridisation_sp_sp2_sp3      # (MG_* untouched, but prove it)
npm run visual:eyes -- sigma_pi_bonding
npm run visual:eyes -- bond_polarity_dipole_moment   # the sibling on this scenario
```

`visual:approve` is founder-only (Rule 17) — the surgeon never runs it.

## WHEN THIS LANDS

Desk 1 resumes at `chemistry_author` on `feat/chemistry-polarity-hbonding`. S6's narration (F1b) is
deliberately NOT yet drafted — it must be written against what EQ-1 and EQ-2 actually ship, onto the
two things that are unambiguously visible and engine-guaranteed (the ×1.42 jiggle amplitude and the
invariant O–H sticks), with the count change stated as *fewer links*, never as a countdown.
Everything else — including the full 30-unit solved geometry — is in
`docs/skeletons/hydrogen_bonding_skeleton.md` Appendix A and needs no rework.

---

# FOLLOW-UP — E2c · the link latch cannot reach `break_pm` on a scripted ramp

**Found by `quality_auditor` on `hydrogen_bonding` fix cycle 1 (2026-08-02), confirmed on frames.
NOT fixed by E2b. Needs a `field3d-surgeon` dispatch and an `engine_bug_queue` row.**

**Severity: MAJOR — it is a regression of a FIXED row.**
`hysteretic_state_cannot_be_latched_under_a_time_pin` [DIRECTIVE/FIXED,
`peter_parker:field3d_surgeon`] states the contract as *"forming at the inner threshold and
**surviving to the outer one**."* The shipped implementation only honours that when the pair's
form→break traversal fits inside the 640 ms lookback.

**Mechanism.** `bscLinkLatch` (`field_3d_renderer.ts:52303–52313`) seeds `held = false` at the
OLDEST sample of a `BS_LINK_LOOKBACK_MS` = 640 ms window (`BS_LINK_SAMPLES` = 9) and replays
forward. A link therefore survives only while some sample still inside that window meets `form_pm`.
It never persists across windows, so `break_pm` is unreachable whenever the ramp is slower than
~640 ms across the two thresholds.

**Measured on `hydrogen_bonding` S3** (`approach_from 5.75 → separation 8.0`, `approach_at_ms 1000`,
`approach_duration_ms 11500`; `mgRamp` is smoothstep-eased, not linear):

| t (ms) | separation (units) | H···O (pm) | HUD `links` |
|---|---|---|---|
| 5000 | 6.377 | 210.1 | **1** |
| 6000 | 6.656 | 223.5 | **0** |
| 9518 | 7.625 | 270.0 | 0 |

`form_pm` 210 is crossed at t ≈ 4992 ms and `break_pm` 260 at t ≈ 8667 ms — a traversal of
**3675 ms = 5.7 × the lookback**. The link visibly dies at **H···O ≈ 210–223 pm**, not 260 pm.
Frame proof: `.visual_runs/hydrogen_bonding/20260802-154012/STATE_3__dense_t05000.png` (`links = 1`)
vs `…_t06000.png` (`links = 0`).

**Why the concept cannot author around it.** Even the skeleton's original faster 3500 ms pull
traverses form→break in ~1.6 s, still 2.5× the lookback. Any pull slow enough for a teacher to
narrate is slow enough to break this. S3's whole misconception beat is *"the weak link fails while
the covalent sticks never do"* — the beat survives, but **every quoted 260 pm figure was false** and
has been removed from the narration, the annotation and `misconception_watch` in fix cycle 1.

**Two candidate fixes (surgeon's call):**
1. Extend the lookback so it spans the authored ramp — i.e. derive the window from the ramp
   duration rather than a fixed 640 ms constant; or
2. make the latch persist across windows without reintroducing an accumulator — e.g. resolve the
   latch from the last time the pair was inside `form_pm`, computed closed-form from the ramp,
   which keeps the `SET_TIME_FREEZE` rewind property E2b's own averaging fix relies on.

Either way the acceptance test is: on S3's shipped cue times, the link must survive to
H···O ≈ 260 pm (t ≈ 8667 ms) and the on-screen break must match a narratable number.

**Until it lands, no concept on this surface may quote `break_pm` as an observed distance.**

---

# FOLLOW-UP — E2d · the state-entry camera lerp draws the new scene under the old camera

**Found by `eye-walker` on `hydrogen_bonding` (2026-08-02), root cause corrected by measurement in
the dispatching session. Owner: `peter_parker:field3d_surgeon` — NOT `alex:json_author`.**

**Severity: MODERATE.** Not blocking; cosmetic but ugly, and it survives a fix cycle because it is
not authorable.

**Symptom.** `hydrogen_bonding` S2 opens with its incoming water molecule oversized and its lower
hydrogen sphere clipped off the bottom edge of the canvas. It resolves to correct framing by
~3000 ms. Frame: `.visual_runs/hydrogen_bonding/20260802-161813/STATE_2__dense_t00000.png`.

**The obvious diagnosis is wrong.** eye-walker attributed it to `approach_from: 12.0` being too wide
for the `approach_link` camera (`dist: 11`) and proposed an authoring rule ("validate the start
separation against the camera frustum at author time"). Measured against the shipped projection
(FOV 60, aspect 16:9, every drawn atom with its own radius), worst |NDC.y| for the near unit:

| `approach_from` | at S1's camera (el 47 / dist 7) — **what is on screen at t=0** | at S2's own camera (el 16 / dist 11) |
|---|---|---|
| 12.0 | **3.036 CLIPPED** | 0.729 ok |
| 9.0 | **1.882 CLIPPED** | 0.537 ok |
| 8.0 | **1.616 CLIPPED** | 0.486 ok |
| 7.0 | **1.387 CLIPPED** | 0.441 ok |
| 6.6 | **1.304 CLIPPED** | 0.424 ok |

**Every authorable value clips**, and 6.6 is already below the 6.375-unit link-form threshold, i.e.
a separation at which the state cannot teach its own beat. So the proposed authoring rule would have
passed 12.0 and shipped the defect anyway.

**Actual root cause.** `applyBondingSceneState` calls `animateCameraTo`, a fixed-rate lerp
(deliberate — E1c-H: *"IT MOVES, IT DOES NOT CUT"*, for Rule-32d continuity). But the SCENE is
already at its t=0 pose on frame 1. When consecutive states differ sharply in scene scale — here
S1's single molecule at the origin under a close el 47 / dist 7 solve, then S2's pair spanning
12 units under a wide el 16 / dist 11 solve — the new, much wider scene is drawn under the old,
much closer camera for the whole glide.

**Candidate fixes (surgeon's call):**
1. **Snap instead of lerp when the solved camera changes by more than a threshold** (distance ratio
   or elevation delta), keeping the lerp for small, continuous moves — preserves E1c-H's intent
   where it matters and avoids the overflow where it does not.
2. **Apply the solved camera before the first rendered frame of a state**, and lerp only the
   *residual* if the previous state left the camera hand-orbited.
3. Fold it into EQ-3's auto-fit: if `fit` is on, evaluate the fit against the scene at `t=0` as well
   as at its settled pose, and take the wider of the two.

**Acceptance test:** on `hydrogen_bonding` S2, no drawn atom may exceed |NDC| = 1 at t = 0, with the
authored `approach_from: 12.0` unchanged.

**Until it lands:** this is not authorable around. Do not ask a concept to shrink `approach_from`
to compensate — the measurement above shows it cannot work.

---

# FOLLOW-UP — E2e · the explore sandbox cannot hold a multi-unit network

**Found on `hydrogen_bonding` fix cycle 3 (2026-08-02). Owner: `peter_parker:field3d_surgeon`.
Two independent defects, both surfacing the moment an explore state authors more than one unit.**

**Severity: MAJOR** — defect 2 is a two-instrument disagreement (the σ/π scar class).

Context: `hydrogen_bonding` S8 originally authored no `units`, so count fell back to 1 and the
sandbox of a *hydrogen bonding* concept showed a single molecule with **zero** hydrogen bonds
(quality-auditor D2). Copying S5's 30-unit array in fixed that and immediately exposed both of these.

### Defect 1 — `BS_CAMERAS.explore` has no `fit`
```
explore:    { az: 35, el: 47, dist: 7.0 }            // no fit
network:    { az: 35, el: 22, dist: 17.0, fit: true } // EQ-3 added fit HERE only
```
Visible half-height at dist 7 is `7·tan30 = 4.04` units; the authored cluster radius is **12.84**.
The network runs off all four edges (`.visual_runs/hydrogen_bonding/20260802-164228/STATE_8__dense_t05000.png`).
No authored unit count helps: the sites are radius-sorted, and even the 10 innermost span radius 9.4.
**Fix:** give `explore` the same `fit: true` EQ-3 gave `network`, now that `bscSiteExtent` can see
molecular units.

### Defect 2 — the forced idle spin tumbles each unit in place and destroys the link geometry
`field_3d_renderer.ts:53620`:
```js
if (mode === "explore" && !(spinRate > 0) && !window.PM_bscSpinDragged) spinRate = 0.14;
```
That fallback exists so a sandbox is never a frozen tail (Rule 37). But the spin is applied to the
**intra-unit atom offsets** while the unit **origins stay fixed** — so every molecule rotates about
its own centre inside a stationary lattice, the O–H bond vectors stop pointing at their neighbours,
and links stop forming.

**Measured, same 30 units / same 298 K / same `jiggle_scale` 0.9:**

| state | mode | spin | `links per molecule` |
|---|---|---|---|
| S5 | `network` | none | **3.40** |
| S8 | `explore` | engine-forced 0.14 | **1.28** |

A **2.7× disagreement between two states of the same concept**, on the concept's headline
instrument, with the teacher free to compare them by clicking.

**Fix (either):**
1. Make the idle spin **orbit the camera** rather than rotate unit offsets — correct for a
   multi-unit scene and identical in appearance for the single-unit case it was written for; or
2. Skip the fallback spin when the state already has its own continuous motion
   (`thermal.jiggle_scale > 0`), which is what Rule 37 actually asks for.

**Do NOT expect authoring to work around it.** The only JSON lever is authoring a tiny positive
`spin_rate` to dodge the `!(spinRate > 0)` guard — a workaround-shaped number that would itself
become a scar, and it fixes nothing about defect 1.

**Acceptance test:** `hydrogen_bonding` S8, authored with S5's 30-unit array, must render the whole
network on frame and read `links per molecule` within ±0.2 of S5's 3.40 at the same temperature.
