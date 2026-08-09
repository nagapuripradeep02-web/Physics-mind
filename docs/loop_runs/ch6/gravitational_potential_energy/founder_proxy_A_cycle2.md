# FOUNDER_PROXY — CHECKPOINT A (design gate) — `gravitational_potential_energy` — cycle 2 (final)

> Persisted verbatim by the dispatching session; founder-proxy is report-only.

## VERDICT: `DESIGN_OK` → `alex:physics_author`

**Physics-author may proceed without further Checkpoint-A re-review**, subject to the six BLOCKING CARRY-INS in §6 being written into its dispatch verbatim. All five cycle-0 P1s are genuinely resolved at the root, not promised; both architect refusals are **upheld** after independent recomputation; and the home-armed `'first'` configuration is **cleared at source** — I traced it through arm, departure, interpolation, re-fire suppression, loop rewind and re-arm, and it cannot reproduce concept #5's defect.

What I did **not** find is a reason to spend another design cycle. The three factual errors I found in cycle-1 text (§3, §4, §5) are all one-sentence corrections with fully-specified replacements and zero design consequence — bouncing the skeleton would buy nothing and re-expose §10(d) to another re-derivation (it already picked up a 50 ms slip this cycle). **I considered `DESIGN_FIX` and rejected it deliberately; the founder may overrule.** What the errors DO require is that Checkpoint B refuses APPROVE until each is evidenced — §6 states them as blocking.

---

## 1. 🔴 THE HIGHEST-RISK ITEM — the home-armed `capture_mode: 'first'` checkpoint

### RULING: **the contract holds. This deliberate use is CLEARED, on the record.**

This is the chapter's first intentional use of a configuration it previously met only as a bug, so I traced every branch rather than trusting §0A.4.

**(a) Arming is from authored seed data, not a live sample.**
`nlbCpArm` L50405–50417. `s0 === cp.s_m` (2.8 === 2.8, both the same parsed double) → `_side = (v0 < 0) ? 1 : ((v0 > 0) ? -1 : 0)` → v₀ = +3.13 gives `_side = -1`, `_home = true`, `_count = 0`. This is exactly the state the FIXED race row's determinism probe asserts (`_side === -sign(v0)`, `_home === true`, `_count === 0`). The degenerate `_side = 0` branch (L50437) is never entered here.

**(b) The departure branch cannot fire before the state's first published frame — and cannot fire late either.**
L50434–50438: while `b.s === cp.s_m` exactly, `continue` — a dt = 0 frame decides nothing. On the first frame with dt > 0, `_home` clears, `side` (=1) ≠ `_side` (=−1), `_count → 1`, and because `cp.mode === "first" && cp._count > 1` is false (L50442), the stamp is written. **Departure IS pass 1, deterministically, on entry and on every loop cycle.**

**(c) The latched values are display-exact, not post-step — and this is the part §0A.4 did not prove.**
The order within a frame is `nlbRunWorkAccum` (52811) → `nlbPublishEnergy` → `nlbRunCheckpoints` (52816). The accumulator records `b._cpS0 = b._s_pre; b._cpS1 = b.s` (L50345), and `_s_pre` is stamped at the **input stage before the integrator** (L52277–52280) on every frame. So on the departure frame `_cpS0 = 2.8 = cp.s_m` exactly ⇒ `nlbCpFrac` returns **f = 0** ⇒
- `ugX = m·G·(h_m + dh)` collapses to `m·G·(s_m·sinθ − h_ref)` = 24.5 × 1.4 = **34.3 J**;
- `wv = W − (1−0)·_dW` = W-before-this-step = **exactly 0**, rendered `"0.0 J"` through `nlbEnFx`'s |x| < 0.05 clamp (L48611) — never `"−0.0 J"`.

Had `_s_pre` been null on that frame the stamp would have fallen back to post-step reads and printed **34.9 / −0.6** — the very numerals the architect rejected in refusal (i). It does not, because L52279 runs unconditionally ahead of the integrator. **This is the single load-bearing fact under S5's whole design and it is sound.**

**(d) The latch cannot be overwritten or re-fired.**
The `'first'` early-continue (L50442) sits **before** `cp.text = …` (L50443) and before the dwell scheduler (L50457). So the descent recross of s = 3.5 (wall 2389) and the home recross of s = 2.8 (wall 2678) increment `_count` and `_side` and do nothing else: no text rewrite, no `changed` flag, no second dwell, no marker re-fire (L50482 is also past the continue). **Verified: a second 1400 ms dwell at wall 2389 would have overrun R = 2900 and fired the `[PM_NLB_DWELL]` deferral warn; it provably cannot happen.**

**(e) A rewind or loop reset re-arms correctly.**
`nlbRunLoopReset` (52214, input stage) → `nlbResetTrajectory` → `nlbSeedKinematics` (51483, restores s0/v0) → `nlbSpringPhysReset` (51503, which clears `_side = null`, `_home = false`, `_count = 0`, `text = ""` at L48407–48412 and `_s_pre = null` at L48419) → **`nlbCpArm` (51510)** re-arms `_home = true`, `_side = −1` from the seed. Then L52279 restamps `_s_pre = 2.8` before the next integration. **The cycle-2 stamp is byte-identical to the cycle-1 stamp.** The engine's own note at L48479–48487 anticipates exactly this case ("the ONE crossing that can land on the rewind frame is a HOME-ARMED checkpoint's departure … f is exactly 0"), and cites the shipped precedent `work_energy_theorem` STATE_4, which already arms a checkpoint at its home pose.

**(f) Does anything reproduce #5's failure in a new costume? No — and the FIXED row's own DO authorises this.**
The row's prevention rule reads: *"A checkpoint seeded at the home pose fires on DEPARTURE first. **If the claim is about the RETURN**, capture_mode must be 'every' (or dwell_from_pass ≥ 2) … whenever a checkpoint's s_m equals its body's initial_position_m, state in the state label which PASS the stamp is meant to show, and verify the rendered string at the frozen pin says that."*
- #5's claim was about the **return**; S5's claim is about the **departure** (U₀ is the baseline of the subtraction). The row's precondition does not bind.
- The label names the pass: the stamp head reads `start:` — the departure, explicitly.
- The `W gravity = 0.0 J` numeral is **not the state's reading of the taught quantity**; it is the labelled zero of the ledger, sitting beside `point C: … W gravity = −8.6 J`. In #5 the zero WAS the only reading. Structurally different.

**One live tripwire the dispatching session should know about.** The FIXED row's probe half says: *"FAIL when every captured accumulator in a round-trip state reads exactly 0.0."* S5 **is** a round-trip state and its start stamp's only accumulator **is** exactly 0.0. Whether S5 trips that probe depends on whether it is implemented per-stamp or per-surface. Per-surface (the whole `#nlb_formula`, which also holds −8.6) it passes. **Name this in the physics block so Checkpoint B reads a per-stamp fail as expected-and-adjudicated, not as a recurrence.** (P3-8 below.)

---

## 2. ADJUDICATION — the two refusals

### Refusal (i) — offset flag at s = 2.85. **UPHELD (architect right; reason slightly mis-stated).**

The numerals the architect quotes are correct: at s = 2.85, h = 1.425 ⇒ U = 24.5 × 1.425 = 34.9125 → `34.9`; W = −12.25 × 0.05 = −0.6125 → `−0.6`.

Where its wording is loose: **34.9 and −0.6 are display-exact too** (the interpolated path is exact at any flag). What actually breaks is not exactness but **one-step legibility**:

| design | the reading the student must perform |
|---|---|
| flag at 2.85 | 42.9 − 34.9 = 8.0 **and** −8.6 − (−0.6) = −8.0 — two subtractions, and the U-side and W-side subtrahends differ |
| home flag (chosen) | 42.9 − 34.3 = 8.6 **and** −8.6 is already the whole ΔW — one subtraction |

The mirror survives in both (I checked: 8.0 = −(−8.0)), so the refusal's stated reason is wrong but **its judgment is right, and the chosen design is strictly better.** The whole point of S5 is that a subtraction is *visible*; halving the number of subtractions is a real gain. Upheld.

### Refusal (ii) — home `'every'` + `dwell_from_pass: 2`. **UPHELD, arithmetic reproduces exactly.**

Home recross at physics t = 2v₀/|a| = 1277.6 ms. With a pass-2 dwell attached there, `R ≥ (home-recross wall) + D_home + 500` and `physics end = R − Σdwells`. The D_home terms cancel:

> physics end ≥ 1277.6 + 500 = **1777.6 ms**, independent of both dwell lengths.

That is cycle-0's value. At the worst folded frame (physics 1828 ms): s = 0.3348, **W = −12.25 × (0.3348 − 2.8) = +30.20 J > work_scale_J = 30** ⇒ `nlbUpdateWorkPanel` L50824–50835 fires `NLB_ENERGY_SCALE_WARN_PREFIX` and the signed bar clamps. **Option (ii) recreates P1-4 exactly as claimed.** The only escapes are raising `work_scale_J` (breaks `bar_max = 2 × work_scale`, on which §0B.1's shared-scale mitigation rests) or dropping the settle tail (which the `worked_loop_resize_patch…` DO forbids). Refusal upheld.

**Both refusals stand. My cycle-0 mechanism list was the weaker half of that exchange; the architect found the better third option.**

---

## 3. Item-by-item verification of what the dispatch asked

### 3.1 Does S5 now earn its place? — **YES against #6-S1. Partially against #6-S3.**

Re-running the cycle-0 side-by-side, the picture is no longer the same picture as **#6-S1**: S5 now carries two latched two-clause stamps, a `mgΔh` product line, and a start value on screen — none of which #6-S1 has. The cycle-0 charge ("nothing on S5's screen performs the derivation") is answered: **8.6 J is rendered by three independent routes** — as `mgΔh`, as the stamp difference 42.9 − 34.3, and as −(−8.6). That is a derivation the eye can walk.

Display-exactness verified independently:
- 24.5 = 49/2 and 1.75 = 7/4 are dyadic; `sin(30°)` in double is 0.49999999999999994, so h_C = 1.7499999999999998, U = 42.874999999999996 → **`42.9`** (midpoint 42.85, wide clear).
- U₀ = 24.5 × 1.3999999999999999 = 34.299999999999997 → **`34.3`**.
- W_C = −12.25 × 0.7 = −8.575 → **`−8.6`**. `NLB_G = 9.8` confirmed at L43260.
- Displayed subtraction closes exactly: **42.9 − 34.3 = 8.6 = |−8.6|**. The architect's "I checked before asserting" is true.

**The residual, and it is real:** under route (a), **#6-S3** is now a launched body on a 30° incline with a U bar, a signed gravity ledger, and **two latched two-clause stamps whose difference proves ΔU = −ΔW** (88.2/−39.2 and 127.4/−78.4 ⇒ 39.2). That is #7-S5's shape. Collision 1 has partially re-formed at a different address, created by the two cycle-1 revisions moving toward each other. What genuinely separates them is one line: `ΔU = mgΔh = 8.6 J` — the bridge to the formula. That is enough to earn the state, but only just, and **Δh itself is rendered nowhere as a number** (the markers bracket it geometrically and carry no heights). See CARRY-IN 6.

### 3.2 P1-1 — **RESOLVED, and better than I asked.**

The authored formula surface is byte-identical between S1 and S3 (base `U = mgh` + `ΔU = mgΔh = 29.4 J` at 4400 ms). More importantly, **the held line is reproducible from the displayed stamps in BOTH states**:
- S1: 44.1 − 14.7 = 29.4 ✓ (h = 0.49999999999999994 → 14.699999999999998 → `14.7`; 1.4999999999999998 → 44.099999999999994 → `44.1`)
- S3: 35.3 − 5.9 = 29.4 ✓ (h_ref 0.3 ⇒ 0.19999999999999996 → 5.879999999999999 → `5.9`; 1.1999999999999997 → 35.27999999999999 → `35.3`)

So the click into S3 moves four numerals and holds one — exactly the "changes state and stays the same" the concept is built on. **This is the strongest thing in the revision.** (One precision note: `#nlb_formula`'s full content is not byte-identical — the stamps differ. §3 and the §Handoff Checkpoint-B duty say it correctly; §10(b)'s shorthand does not. P3-1.)

### 3.3 P1-4 — **RESOLVED. Recomputed independently, all values reproduce.**

| | physics at R | s | U | W | folded (R+50) | s | U | W |
|---|---|---|---|---|---|---|---|---|
| S5 | 1500 ms | 1.9825 | 24.3 | +10.01 | 1550 ms | 1.7654 | 21.6 | **+12.67** |

`bar_max_J = 60 = 2 × work_scale_J = 30` preserved ✓. And I verified the **actual** engine thresholds, which are more generous than the architect's own discipline lines: the U-bar warn fires at `vals[k] > bar_max_J` (L48967, i.e. **60**, not 54) and the ledger warn at `|W|/work_scale_J > 1` (L50823–50824, i.e. **30**, not 27). So S5's folded +12.7 has 58% headroom, not 53%.

§0B.16 is re-filed exactly as required: **RECURRED → DISCHARGED, recurrence cited, no sibling row minted** ✓. My cycle-0 finding was correct in the specific: cycle-0's folded +30.20 J did exceed 30 and would have fired.

*Bookkeeping slip (P3-2, no consequence):* the h = 0 margin is **384 ms at R and 334 ms at the folded frame**, not "334 at R, 284 at folded" — the folded offset was applied twice. Conservative, so nothing is at risk, but it is a slip in the very table the P1-4 re-derivation duty governs. S2's row (56 ms at folded) and S4's row (2300 ms ⇒ s 2.44 ⇒ 53.81 J) both reproduce exactly.

### 3.4 S4's folded 53.81 J left in place — **the trade is CORRECT. Architect right.**

Verified at source: the assertion THE EYE's H4 reads is zero `[PM_NLB_ENERGY_*]` console lines, and that warn fires at `> maxJ` = **60 J** (L48967–48971). 53.81 is **10.3% under the real threshold**; the 54 line is a self-imposed 0.9 discipline with no reader. The floor is genuinely deterministic (R ≥ stamp + dwell + 500 forces folded s ≥ 2.44 given m 3 / h 1.5 / v 0.8), and lowering v would add a second visible change to the S1↔S4 contrast that P1-2's fix just purified — a straight Rule 32b regression to buy headroom that is not needed. **Named residual, correctly accepted, correctly documented.**

### 3.5 P1-5 — **RESOLVED at the root, and I verified the part that could have been decorative.**

The claim that mattered was "the θ sweep rotates the ramp with the cart riding it." Traced:
- `nlbRunIdleSweep` L47652–47669 calls **`nlbApplyParam(tok, v)`** — no sandbox guard, confirmed again.
- `nlbApplyParam('theta')` L47361–47363 writes `eng.theta_deg` **and** calls `nlbApplySurface`.
- `nlbApplySurface` L44693 rotates `nlb_surface_group`; the body mesh is a **child of that group** (L44541–44544: "the pointer-pick proxy shares the body's PARENT, so the surface rotation applies to both identically"), so **the cart rides the ramp for free** — no per-body reposition needed.
- **And the risk the θ sweep newly created is clear:** `marker_h_ref` is added to **`world`**, not `surf` (L49388, contrast `surf.add(mkT)` at 49396). **The dashed h = 0 line stays horizontal and fixed while the ramp rotates about the point where they meet.** That is a genuinely good picture and it was not guaranteed — had the line been parented to `surf` it would have tilted with the ramp and the explore state would have been nonsense.
- Sweep contract: `NLB_SWEEP_MS = 4000`, triangle from `range[0]` at t = 0 (L47646–47649) ⇒ range[0] = 30 = the authored θ ⇒ **no first-frame snap** ✓ (P2-5 discharged at the root).
- 60 J scale at every corner: worst m 3 / θ 40 / s 2.4 ⇒ U = 45.36 J, under both 54 and 60 ✓. Static hold: tan 40° = 0.8391 < μₛ 0.9 ✓ (limit 41.99°).
- §0A.9 now credits the limit with **drag only** and runs the token-by-token audit ✓ — the exact discharge my cycle-0 scar row demanded. EQ-1 correctly re-filed ride-along and explicitly not depended on ✓.

*Gap (P3-3):* the audit walks m2 / R / R2 / omega0 / F / F_ang / mu_s / mu_k — **8 of the 9 unauthored tokens. `v0` is missing.** The row's DO says *every* remaining member. Off-concept and harmless, but the enumeration must be complete or the discipline decays.

### 3.6 P2-1 numeral cross-tab — **RESOLVED. Verified independently.**

Moving S5's flag 3.6 → 3.5 kills the 44.1 collision (42.9 at (2.5, 1.75) is unique among stamps). Every declared benign repeat genuinely shares its tuple: 44.1 at S1-B and S4 both (3 kg, 1.5 m) ✓; 34.3 at S2 both passes and S5's start both (2.5 kg, 1.4 m) ✓; 29.4 in S1 and S3 is the same quantity mgΔh ✓; 35.3 at S3-B and S6's live dial both (3 kg, 1.2 m) ✓. The live-continuum exemption for S6 is legitimate (a swept range passes through every value; the collision rule governs latched numerals). **No numeral is shared by two states whose tuples differ.**

*One numeral the cross-tab does not cover, correctly:* S3's folded live-bar value at R+50 is 42.9 J — the same numeral as S5's point-C stamp. It is a transient no claim rides on and no frame captures. Not a collision.

### 3.7 The remaining cycle-0 findings — **all DONE, not promised.**

| finding | status |
|---|---|
| **P1-2** | DONE. `displacement_vector {show_value:true}` on S1/S3/S4; 2.40 m and 1.40 m both rendered; S4's only visible change is now the ramp angle (Rule 32b strengthened). The pin at 4800 sits inside S1's B-dwell where physics is frozen at s = 3.0 ⇒ the frozen frame reads exactly `d = 2.40 m` ✓. The settle-tail growth is disclosed in §10(b) and ENGINE FIT. |
| **P2-2** | DONE. S3 carries the anchor sentence; the convention-free floor-language constraint is authored as binding on physics-author. Rule 35 clean. See CARRY-IN 5 for the budget collision it creates. |
| **P2-3** | DONE in structure, **wrong in one premise** — see §3.8. |
| **P2-4** | DONE. Probe P6 authored verbatim including the "reads as a LEVEL, not lost in the slab silhouette" clause and the S2 `predicted_stop` half. See CARRY-IN 3(b) for the states it omits. |
| **P2-5** | DONE at the root (sweep moved to θ with range[0] = authored; `slider_controls.m.label = 'm'` kills the `m₁` glyph). |
| **P3-1** | DONE — "Equal change, opposite sign", 4 words, literal. |
| **P3-2** | DONE — `(moved)` dropped; `h = 0` in all six states. |
| **P3-3** | DONE — §7 names the preset re-route for both dead aspects. |
| **P3-4** | DONE — the one-overwritten-line fact is in §10(d) and in the Checkpoint-B duties. |
| **P3-5** | DONE — relabelled `syllabus_doc_verified`, explicitly not teacher verification. |
| **P3-6** | DONE — dissolved by P1-1's fix; only the line's position differs at the S1→S3 click. |

Rule 41 sweep of the new cycle-1 strings: all six titles and all six delta cues are literal, ≤5 words for the cues, meaning in the first words. The new anchor sentence is plain. Clean.

### 3.8 Cross-sim coherence with #6 under route (a) — **the weakest area. Two factual errors.**

Read #6's cycle-1 skeleton at source. Under route (a) it authors `h_ref_m = −3.05` in all four states — the ramp's foot, 0.05 m below its track's lowest point — labelled `"U = 0"`, with **U₀ = 49.0 J** and the explicit statement *"the U LEVEL never equals −W anywhere"* (its ENGINE FIT limitation 3). Against that:

**Error A — #7-S5's narration duty asserts something route (a) made false.** §3's S5 row still says: *"Narration cites #6's pinned-at-start configuration as the case where U₀ happened to be 0."* Under route (a), **#6 does not pin at the start and its U₀ is 49.0 J, not 0.** This is stale cycle-0 reasoning that survived a header the architect otherwise absorbed correctly (§7's own header line already says both concepts "now face the same offset-U problem"). As written it instructs physics-author to tell a student a falsehood about the concept they just watched. **P1-severity; one-sentence fix; a better bridge is available (CARRY-IN 2).**

**Error B — "the same placement" is not what the two screens show.** §7's header, §4's belief-1 beat and Block-1 item 3 all claim #7-S1/S2's line is *"visually CONTINUOUS with #6's picture"* / *"continue the same placement at the base."* But `h_ref_m = 0` places the line at the **surface origin**, and the slab spans s ∈ [−length_m, +length_m] (`nlbApplySurface` L44717: `slab.scale.set(halfWorld*2,1,1)` with `halfWorld = length_m · NLB_WORLD_PER_M`) — so on a 4.5 m ramp the origin is the **slab's midpoint**, with 2.25 m of height below it. #6's line is at its slab's bottom. **They are at different places in the picture.** I share the blame for the noun: I called it "ramp base" in cycle 0 too. But the *continuity claim* is new cycle-1 text written to discharge P2-3, and it is false.

This also exposes an **unflagged ASSUMPTION**: whether the h = 0 line is in-frame at all in the five states where `h_ref_m = 0`. §10(d) frames S1 at s ∈ [0.05, 4.03], which puts y = 0 at the exact bottom edge; §0B.41 says the camera is the fixed fleet convention, which may instead show the whole slab and put the line mid-picture. **Either way it is unverified, and probe P6 tests the line only on S3 — the one state (h_ref = 0.3) where it is comfortably safe.** #6 flagged precisely this for its own line and made it probe-before-authoring; #7 did not. See CARRY-IN 3.

Neither error changes the design. The planting story that is *true* needs no claim about #6's geometry at all: S1/S2 use a zero line silently and confidently, and S3 is the first time either concept discusses the line as a choice. That is sufficient, and route (a) does strengthen belief 1 — #6's line at the ramp's foot ≈ the ground genuinely reinforces "the ground is THE zero," which is the belief S3 breaks.

---

## 4. Pass-1 recurrence check — which scar classes I checked, and the result

| class | result |
|---|---|
| `checkpoint_capture_mode_first_at_the_home_pose_stamps_the_departure_reading…` (CRITICAL/FIXED) | **NOT a recurrence** — §1(f). The row's precondition ("if the claim is about the RETURN") does not bind; the label names the pass; the zero is a labelled baseline, not the state's reading. One probe-form ambiguity flagged (P3-8). |
| `nlb_checkpoint_at_the_body_home_pose_adopts_its_side_in_a_race…` (CRITICAL/FIXED) | **NOT a recurrence** — arm-from-seed verified; v₀ ≠ 0 so even the degenerate branch is unused. |
| `nlb_checkpoint_capture_overshoots_exact_crossing_value` (CRITICAL/FIXED) | **NOT a recurrence** — f = 0 exact at both home flags; interpolation path verified through `_s_pre`. |
| `nlb_checkpoint_dwell_does_not_refire_after_a_loop_rewind` (FIXED) | **NOT a recurrence** — the rewind's `_tPrevMs` restore (L48495/48504) is intact and is what makes the dwell survive cycle 2+. |
| `worked_loop_resize_patch_bounded_at_the_pin_instant…` (OPEN directive) | **Recurred at cycle 0, DISCHARGED at cycle 1** with the folded column; re-verified by hand. No sibling row minted ✓. |
| `taught_variable_has_no_rendered_physical_correlate…` (OPEN) | **Recurred at cycle 0 on S6, CLOSED at the root** — the θ sweep gives h a moving physical correlate; the h-line's `world` parentage makes the rotation legible. |
| `explore_state_shrunk_to_one_control_by_an_engine_limit…` (cycle-0 row) | **Discharged** by §0A.9's token-by-token audit, minus `v0` (P3-3). |
| `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` | **Discharged** — every limit re-read this session; the inverted form now satisfied on S6. |
| `prior_rulings_and_internal_ledgers_are_not_re_run_over_the_states_a_restructure_creates` (OPEN directive, carried at §0B.40) | **RECURRED — three instances**: Error A, Error B, and the `formula_lines` semantics (CARRY-IN 1). Cycle-1 text was not re-derived against the thing it depends on. Cited as a recurrence; no sibling minted. |
| `paired_concept_pins_a_reference…no_bridging_line` (cycle-0 row) | **Partially recurred** in a new form — the bridge exists but is built on a false position claim. Upsert-extended in §9 rather than duplicated. |
| `nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula` | Not exhibited — every pin is inside a dwell whose stamp is already on screen; S5's start stamp re-fires within one frame of each rewind. |
| `checkpoint_marker_labels_collide_when_two_checkpoints_sit_near_in_world_space` (FIXED) | **Disposition now incomplete** — §0B claims "the easy case (2.0 m apart)" but S5's new second flag puts two markers **0.7 m apart**. The engine's de-collision (`nlbStackMarkerLabels`) should carry it; the disposition must say so. P3-4. |

---

## 5. Per-state design table

| # | id | ring | idea distinct? | archetype | delta cue | controls | design risk |
|---|---|---|---|---|---|---|---|
| S1 | `lifting_stores_energy` | core | yes — U = mgh as a rendered number twice, plus the held 29.4 line | translate-through | "Higher up, more energy" | none | h = 0 line in-frame unproven (C-3b) |
| S2 | `same_height_same_energy` | core | yes — U is a state function; the return re-stamps 34.3 | cycle-compare | "Same height, same energy" | none | folded frame clears h = 0 by 56 ms — thin but proven |
| S3 | `the_zero_is_your_choice` | core (PRIMARY aha) | yes — the invariant holds while every level moves | translate-through (declared pair w/ S1) | "New zero, same ΔU" | none | narration budget collision (C-5); planting premise false (C-3a) |
| S4 | `different_slope_same_U` | extended | yes — path independence, both compared numerals now rendered | translate-through (declared pair w/ S1) | "Shorter path, same U" | none | folded 53.81 J accepted, correctly |
| S5 | `U_and_the_work_by_gravity` | advanced | yes vs #6-S1; **marginal vs #6-S3** | cycle-compare (declared pair w/ S2) | "Equal change, opposite sign" | none | `formula_lines` semantics (C-1); false #6 clause (C-2); picture overlap (C-6) |
| S6 | `explore` | core | yes — two live controls on both terms of U = mgh; apparatus moves | drag-sandbox | "Change mass and angle yourself" | `m`, `theta` | body drag off (honest limit, EQ-1 ride-along) |

---

## 6. BLOCKING CARRY-INS — verbatim, into the physics-author dispatch and the Checkpoint-B gate

These are **not** advisory. `DESIGN_OK` is conditioned on all six travelling with the concept, and **Checkpoint B must refuse APPROVE until each has evidence.**

### C-1 · P1 · json-author · the base equation must be `formula_lines[0]`, not `formula`

`nlbRenderStamps` L50642–50654 **replaces** the base with the joined lines whenever `formula_lines` is a non-empty array (presence resolved by `Array.isArray && length` at L50981–50982; the sibling `rbr` comment at L57091–57093 names the hazard outright: *"an empty array … would blank a state that authored a plain formula string"*). The skeleton says "base + line" in five places (§3 S1/S3/S5, §10(a), §10(b), ENGINE FIT). Authored literally, **`U = mgh` would never render on S1 or S3** — the surface would be empty until 4400 ms and then show only `ΔU = mgΔh = 29.4 J`.

Author instead:
- **S1 / S3:** `formula_lines: [{text: "U = mgh"}, {text: "ΔU = mgΔh = 29.4 J", at_ms: 4400}]` — no `formula`.
- **S5:** `formula_lines: [{text: "ΔU = −W by gravity"}, {text: "ΔU = mgΔh = 8.6 J", at_ms: 600}]` — no `formula`.
- **S4 / S6:** `formula` only. **Never an empty `formula_lines` array.**

*Checkpoint-B evidence:* an S1 frame captured **before** 4400 ms showing `U = mgh` on `#nlb_formula`.

### C-2 · P1 · physics-author · #6 under route (a) does NOT pin U₀ = 0 — delete the false clause

Strike from S5's narration duty: *"cites #6's pinned-at-start configuration as the case where U₀ happened to be 0."* #6 authors `h_ref_m = −3.05` in all four states and opens at **U₀ = 49.0 J**; its own skeleton states *"the U LEVEL never equals −W anywhere."*

Replacement (physics-author may re-word; two constraints are binding — never say #6's start was zero, and cite #6 by `concept_id` only, never by state number):

> "The last concept counted from a line at the ramp's foot, so its start already read forty-nine joules. Here the start reads 34.3. Neither starting number matters — only the change does."

Block-1 item 1's prerequisite patch ("a conservative force's work defines the change in potential energy, ΔU = −W") **remains true under route (a) — keep it.**

### C-3 · P1 · architect-text correction + probe extension · the h = 0 line

**(a)** Delete the three "same placement / visually continuous with #6" claims (§7 header line, §4 belief-1 beat, Block-1 item 3). `h_ref_m = 0` is the **slab midpoint** (L44717), not the ramp's foot; #6's `−3.05` is its foot. The true and sufficient planting story: *S1 and S2 use a zero line silently and confidently and never discuss it; S3 is the first time either concept treats the line as a choice.* The misconception `belief`, `visual_counter` and `one_line_fix` are all sound and unchanged.

**(b)** Extend probe **P6** to **S1** (h_ref 0, θ 30°) and **S4** (h_ref 0, θ 48.6°): at the state's `eye_capture_ms`, assert `marker_h_ref` and `marker_h_ref_label` are `visible` **and inside the rendered viewport**, and that the line reads as a level distinct from the slab silhouette. This is the same ASSUMPTION #6 flagged for its own line and made probe-before-authoring. **If the line clips, route a camera-framing note — do not move `h_ref_m`** (moving it destroys the 60 J scale and every stamp).

### C-4 · P2 · json-author · one minus glyph on one surface

`nlbEnFx` emits **U+2212** (`nlbMinus`, L48605), while `formula_base`/`formula_lines` render **byte-for-byte as authored** (L50612–50613). An ASCII hyphen in `ΔU = -W by gravity` would sit one line above the engine's `W gravity = −8.6 J` on the same surface, in two visibly different glyph widths. Author U+2212 everywhere and name it in §10(b)'s Unicode audit (which currently lists Δ, θ, ·, ₀ but not the minus).

### C-5 · P2 · physics-author · S3's narration budget

S3 must carry, inside 40–55 words: the 26-word anchor sentence (currently a verbatim duty), the #6-bridge clause, and the aha itself. **Explicit permission is granted to compress the anchor sentence**, provided it keeps (i) convention-free floor language — "the floor you start on" / "a floor below it", never a floor number — and (ii) the idea that the zero is chosen and the building does not change. Do not drop the aha or the bridge to preserve 26 words of anchor.

### C-6 · P2 · Checkpoint-B duty + one optional cheap fix · S5 vs #6-S3

Under route (a), #6-S3 and #7-S5 both end on a launched body on a 30° incline with a U bar, a signed gravity ledger and two latched two-clause stamps whose difference proves ΔU = −ΔW. **Checkpoint B must place #6-S3's and #7-S5's frozen frames side by side and answer in writing whether they read as one picture** — this is the founder's "it looks same thing explained in all the simulations" complaint at chapter scale, and no per-concept gate can see it.

*Optional differentiator, recommended:* give S5's two checkpoint labels their heights — `start (h = 1.40 m)` and `point C (h = 1.75 m)`. This makes **Δh = 0.35 m a rendered pair**, completes the `mgΔh` derivation on screen (its middle factor is currently symbol-only), and visibly separates S5 from #6-S3, which shows no heights. Cost: a longer stamp head against the 340 px surface literal — measure with **P7**, do not assert.

---

## 7. Findings not in the carry-ins

**P3-1 · §10(b)** — "S1 and S3 BYTE-IDENTICAL" is true of the authored lines, not of `#nlb_formula` (the stamps differ). §3 and the §Handoff duty state it correctly; align §10(b).
**P3-2 · §10(d) S5** — margins to h = 0 are **384 ms at R / 334 ms at folded**, not "334 / 284"; the folded offset was applied twice. Conservative; correct the row so the re-derivation tripwire stays trustworthy.
**P3-3 · §0A.9** — the token audit omits **`v0`** (9th unauthored member of the L1819 enum). One clause: no velocity term in U = mgh, explore body at rest.
**P3-4 · §0B / S5** — S5's two markers sit **0.7 m apart**, not 2.0 m; the FIXED near-collision row's easy-case disposition no longer covers this concept. State that `nlbStackMarkerLabels` carries it and measure both captions at the S5 pin under **P7**.
**P3-5 · S5 frozen frame** — at the pin the cart is frozen **standing on** the point-C marker, which is depth-tested by design (§0B.2). The dot may be occluded; the label sprite will not be. Name it as an eye-walker reading duty so an occluded dot is not read as a missing marker.
**P3-6 · S1/S4 live view** — the compared numerals `d = 2.40` and `d = 1.40` are exact only inside their dwell windows (40% / 38% of each loop); a teacher scrubbing live will see them grown. Disclosed in §10(b); make it an eye-walker note so a tail frame is not read as a contradiction.
**P3-7 · §0B.34** — the cross-tab covers latched/authored numerals only, correctly; add one line saying live-bar transients are out of scope (S3's folded 42.9 vs S5's stamped 42.9 is the case that would otherwise look like a hit).
**P3-8 · Probe set** — record in the physics block that S5's start stamp reads `W gravity = 0.0 J` **by design**, so a per-stamp implementation of the `checkpoint_capture_mode_first_at_the_home_pose…` probe is an expected, adjudicated fail and not a recurrence (§1(f)).

---

## 8. `engine_queue`

**EQ-1 — RIDE-ALONG (unchanged from cycle 0) · owner `peter_parker:field3d_surgeon` · `nlb_energy_stack_cannot_render_negative_u_grav_so_a_reference_choice_concept_cannot_show_below_its_own_zero_line`.** Correctly re-filed by the architect as ride-along and explicitly not depended on. No new engine asks: **zero renderer edits, Phase-0 alarm rule not fired, confirmed.** Every mechanism S5 and S6 need is built and contracted, and I read each one this session.

---

## 9. Candidate scar rows

No `bug_class` collision with the 32 keys already in this run's candidate files. **Note for the dispatching session: the five cycle-0 rows are still unfiled** — the concept directory holds no `scar_candidates.sql`. File those plus these.

```sql
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('skeleton_authors_a_timed_formula_line_beside_a_base_string_the_reader_replaces',
 'A skeleton specified "formula base plus a timed second line" against a renderer whose timed-line path overwrites the base, so the concept''s own equation would never have rendered',
 'CRITICAL', 'alex:architect',
 'nlbRenderStamps (field_3d_renderer.ts L50642-50654) sets txt = formula_base and then, whenever formula_lines is a non-empty array, REPLACES it with the joined visible lines; the resolver decides presence by Array.isArray && length (L50981-50982). The skeleton cited those exact reader lines and still described the mechanism additively in five places, because "add a timed line" reads as an append everywhere else in the config surface.',
 'When a skeleton specifies a timed reveal ON an existing surface, it must state whether the timed path APPENDS to or REPLACES the static field, quoting the assignment that decides it - not merely cite the function. For this family the base equation is authored as the first entry of formula_lines with no at_ms; formula and formula_lines are never authored together, and an empty formula_lines array is never authored at all (it blanks the surface). The same shape exists on rigid_body_rotation (rbrRenderFormula, L56676) and carries the same rule.',
 'js_eval',
 'For every state authoring formula_lines: assert the state does NOT also author a non-empty formula/formula_base, and assert formula_lines[0] has no at_ms (or at_ms 0). Then load the state, pin at t = 0, and assert the rendered #nlb_formula (or #rbr_formula) textContent is non-empty and contains the concept''s base equation.',
 'OPEN', ARRAY['gravitational_potential_energy']::text[], ARRAY[]::text[],
 'ch6 concept-7 founder_proxy Checkpoint A cycle 2 (2026-08-09)', 'incident'),

('skeleton_names_a_reference_line_by_a_geometric_noun_the_renderer_does_not_guarantee',
 'A dashed zero-reference authored at h_ref_m = 0 was called "the ramp base" throughout a skeleton and used to claim visual continuity with a sibling concept, but the engine draws the surface centred on that origin so the line lands at the slab MIDPOINT',
 'MAJOR', 'alex:architect',
 'nlbApplySurface scales the slab to 2*length_m about the surface origin (L44717) and nlbBoundsM returns lo = -length_m (L51653), so s = 0 is the middle of the drawn ramp, not its foot; the h_ref line is parented to world (L49388) at y = h_ref_m * NLB_WORLD_PER_M. A zero authored as the number 0 reads in prose as "the bottom" and in pixels as "halfway up", and no gate compares the two.',
 'A skeleton naming a reference line by a geometric feature ("the ramp base", "the foot", "the ground") must derive that noun from the renderer''s own extent arithmetic and state the derivation, and must separately flag the line''s IN-FRAME visibility as probe-before-authoring for EVERY state that authors it - not only the state where it is comfortably inside the frame. A reference at the edge of the framed extent is the default case for h_ref_m = 0, not the exception.',
 'js_eval',
 'For every state authoring height_markers.show_h_ref_line: compute the slab extent from length_m and compare h_ref_m against it, and assert the skeleton''s prose noun matches (foot => h_ref_m <= -length_m*sin(theta); midpoint => h_ref_m ~ 0). Then at the state''s eye_capture_ms project marker_h_ref and marker_h_ref_label to NDC and assert both are inside [-1,1] on both axes and separated from the slab silhouette edge.',
 'OPEN', ARRAY['gravitational_potential_energy','potential_energy_definition']::text[], ARRAY[]::text[],
 'ch6 concept-7 founder_proxy Checkpoint A cycle 2 (2026-08-09)', 'incident')

ON CONFLICT (bug_class) DO UPDATE SET
  severity = EXCLUDED.severity, root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,
  concepts_affected = EXCLUDED.concepts_affected;
```

**Upsert-extension of the cycle-0 row (do NOT mint a sibling — same class, one layer deeper):**

```sql
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('paired_concept_pins_a_reference_the_sibling_later_reveals_as_an_arbitrary_choice_with_no_bridging_line',
 'Concept N pins a zero reference the sibling later reveals as free; after a coordinated ruling moved N''s reference, N+1 absorbed the ruling in its header and left the stale premise standing in the one state row that depends on it',
 'MAJOR', 'alex:architect',
 'Two skeletons authored in parallel each honoured their own boundary. The first defect lived in the SEQUENCE; the SECOND defect is the fix: a cross-concept ruling is absorbed where it is easy to write (header, boundary paragraph, misconception plan) and missed where it is load-bearing (a single narration duty inside one state row, and a claim of visual continuity that no one re-derived from the renderer''s extent arithmetic).',
 'When a cross-concept ruling changes a value in the SIBLING, the receiving skeleton re-reads every one of its own sentences that names that value and re-derives each from the sibling''s CURRENT authored numbers, listing them. A narration duty that quotes the sibling''s configuration cites the sibling''s live field value, never a remembered one. Any claim that two concepts SHOW the same thing is settled from the renderer''s geometry, not from a shared authored number. Check the shared instrument''s LABEL string and its DRAWN position across the pair.',
 'manual',
 'For a concept whose prerequisite shares its scenario: diff the shared instrument''s authored configuration, label string and derived drawn position across the two skeletons. Grep the later skeleton for every sentence naming the earlier concept and assert each is reproducible from the earlier concept''s CURRENT authored values. Where the drawn positions differ, assert the later concept makes no continuity claim.',
 'OPEN', ARRAY['gravitational_potential_energy','potential_energy_definition']::text[], ARRAY[]::text[],
 'ch6 concept-7 founder_proxy Checkpoint A cycle 2 (2026-08-09)', 'incident')
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,
  concepts_affected = EXCLUDED.concepts_affected,
  discovered_in_session = EXCLUDED.discovered_in_session;
```

**Deliberately NOT minted:** the three cycle-1 text errors are a **recurrence of the OPEN directive `prior_rulings_and_internal_ledgers_are_not_re_run_over_the_states_a_restructure_creates`**, which the skeleton itself carries at §0B.40. Cite the recurrence; do not create a sibling class.

---

## 10. Files the founder should look at first

1. `src/lib/renderers/field_3d_renderer.ts` **L50405–50449** — arm, home-hold, departure, `'first'` early-continue. The four branches that clear #5's ghost, in forty lines.
2. Same file, **L50642–50654** — the three lines where `formula_lines` overwrites `formula_base`. CARRY-IN 1 in one glance.
3. `docs/loop_runs/ch6/gravitational_potential_energy/skeleton.md` **§3 row S5** — the redesigned state: four latched numerals, and the one stale clause about #6 (CARRY-IN 2).
4. `docs/loop_runs/ch6/potential_energy_definition/skeleton.md` **§Home pose** (`h_ref_m = −3.05`, U₀ = 49.0) beside #7's `h_ref_m = 0` — the two lines that are not in the same place (CARRY-IN 3).
5. `docs/loop_runs/ch6/gravitational_potential_energy/skeleton.md` **§10(d)** — the folded-frame column that discharges §0B.16, and the one 50 ms mislabel in the S5 row.

---

```
RUBRIC (advisory, unratified; did not affect the verdict)
  Checkpoint-A subset (D1, D2, D8, D9, D10)
  D1 1 · D2 2 · D8 2 · D9 2 · D10 2   = 9/10   (cycle 0: 8/10)

  weakest: D1 information gain — S5 is no longer #6-S1 (it renders 8.6 J by three
           routes: mgΔh, 42.9 − 34.3, and −(−8.6)), but under route (a) #6-S3 now
           shows the SAME shape — launched body, 30° incline, U bar, signed gravity
           ledger, two latched two-clause stamps whose difference proves ΔU = −ΔW
           (88.2/−39.2 and 127.4/−78.4 ⇒ 39.2). The separator is one formula line,
           and its middle factor Δh is rendered as a symbol, never as a number.

           D8 misconception beats — the two pivots (S3, S4) are genuine and their
           visual_counters are engine-producible, so this stays a 2; but belief 1's
           planting narrative rests on a premise the geometry contradicts.

  D2 2: rings ordered qualitative→quantitative→derivation, advanced (S5) contiguous
        before explore, both cuts re-checked coherent, PRIMARY aha at S3 of 6.
  D9 2: six titles, all plain literal English, meaning in the first words.
  D10 2 (was 1): explore now exposes both terms of U = mgh; the θ sweep rotates the
        ramp with the cart riding it (nlbApplyParam L47361-47363 → nlbApplySurface)
        while the h = 0 line, parented to `world` (L49388), holds still.
```

---

## Standing

Report only. Nothing edited, no SQL applied, no one dispatched. **`DESIGN_OK` — physics-author may proceed without further Checkpoint-A re-review**, provided CARRY-INs C-1 through C-6 travel in its dispatch and Checkpoint B treats C-1, C-2 and C-3 as blocking evidence requirements. The `capture_mode: 'first'` home-armed checkpoint is cleared at source for this use and the chapter now has that ruling on record.
