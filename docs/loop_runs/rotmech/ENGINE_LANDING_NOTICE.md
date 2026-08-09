# ⚠ ENGINE LANDING NOTICE — 0c-3 group 1 (E1–E5, E7)

**From:** Desk E (`feat/rotmech-0c3`), sole engine owner for the Phase-0d run
**Status:** PR [#29](https://github.com/nagapuripradeep02-web/Physics-mind/pull/29) — **still OPEN,
MERGEABLE, CLEAN, CI green, awaiting founder merge as of 2026-08-06.**
**Read this the moment `desk:audit` shows you behind master.**

> ⚠ **NOTHING BELOW HAS REACHED MASTER YET.** Verified 2026-08-06: `origin/master` is at `914124b`
> and contains **neither E1 (`7022169`) nor E5 (`df87b6d`)** — `git merge-base --is-ancestor`
> returns false for both. Every dispatch is stacked on `feat/rotmech-0c3` behind one unmerged PR.
> **Until #29 merges, no desk can sync, and no verifier can run its acceptance.** Sections §1–§7
> describe what lands *when it lands*.

Six engine dispatches land together (E1–E5 and E7). **Shared rbr and nlb code has changed underneath work some
desks have already sealed.** This notice is the containment: what moved, what you must re-verify,
and what is newly authorable.

---

## §0 — ⚠ READ FIRST: how to read the back-compat numbers in this notice and in PR #29

**Correction issued 2026-08-06 by Desk E, against its own shipped work.**

Every dispatch below quotes a byte-identical A/B as its back-compat evidence — E2's *26 body-states
× 300 frames, 25 identical*, E3's *11 concepts / 58 states / 94 bodies / 0 differing*, E4's *125,280
L samples all `Object.is`-equal*. **Those numbers are real. They do not prove what the PR body
claimed, and desks are currently reading them as correctness proofs.**

> **A byte-identical A/B proves NON-REGRESSION against previous behaviour, never CORRECTNESS. When
> the baseline is dead, "0 differing" and "17/17 identical" are the EXPECTED output of a broken
> state, and the method cannot distinguish that from a healthy one.**

This is not hypothetical. **E2 reported "`rolling_on_incline` 17/17 identical" as proof its blast
radius was nil, and shipped.** Desk B then established by *runtime* — MD5 over dumped frames — that
`rolling_on_incline` is **entirely non-functional**: STATE_8, the Rule-37 sandbox *guaranteed* to
run continuously, is **one hash across 10.5 s**. Those 17 states were identical because they were
**dead before and after**. E2's A/B could not have caught it: it drove the branch-selection logic
and never asked whether `b.v` advanced.

**What this does and does not mean.** None of E1–E5 or E7 is known to be wrong, and each also
carries evidence beyond its A/B. But **no A/B number in this notice should be read as "these states
work"** — only as "this change did not alter them." Where a dispatch's acceptance depends on
correctness, the gate is a **runtime observation** (frames, hashes, or a verifier desk on a real
concept), which is exactly why §5's verifier assignments exist.

**Standing change to Desk E's verify chain, effective now:** every A/B must **assert liveness on the
quantity under test** before the comparison means anything, and must carry a **negative control** —
a case that MUST differ, shown differing in the same run. Desk B's STATE_7 `param_ramp` differing at
every timestamp while STATE_8 held one hash is what turned "one hash" from a suspicion into a
finding. **That is the shape to copy.** Filed as
`byte_identical_ab_against_a_dead_baseline_reads_as_proof_of_correctness` (CRITICAL, directive) in
`_engine/scar_candidates_0c3.sql` — candidate text, not applied.

**Same family as the two traps in §4**: a check that *cannot fail* is being read as a check that
*passed*.

---

## §1 — MANDATORY on sync. This is desk contract guardrail 6, not a suggestion.

The moment you `npm run desk:sync` past this merge:

1. **Re-seed and re-EYE every concept you have already sealed**, and **diff against your OWN
   earlier frames** — not against a fresh baseline. Shared engine code changed under sealed work
   and nothing else catches that drift.
2. **Read the `Motion map:` line on every EYE run.** If it shows `?`, `[D5]` did not run — see §4.
3. **Re-seed before every EYE run, always.** The renderer changed, so a cached `sim_html` is
   stale. A stale seed silently re-tests the old engine: this desk hit exactly that and caught it
   only because the assembled `sim_html` byte count had not moved.

**An H2 diff you cannot explain is a FAIL, not a re-baseline.** Note that on this desk's canaries
a stable sub-0.35% H2 delta proved to be pre-existing baseline vintage, *demonstrated* by two
consecutive no-change runs reporting identical percentages. Use that method before concluding
anything: run twice with no change and compare.

---

## §2 — What changed, by subsystem

### `newtons_laws_body` / SEAM R — **Desk B**
- **E2 `nlb_rolling_branch_has_no_kinematic_gate`.** The rolling branch had only a *dynamic
  availability* gate; on flat ground `drive ≡ 0` made it vacuous, so `rollHeld` was true on frame 1
  for a sliding contact — no deceleration, no spin-up, no capture, a dishonest `f 0.00 N`. A real
  v–ω mismatch now falls through to the existing `_slipping` / `nlbRollSeg` closed-form capture.
  **Blast radius measured: 26 body-states × 300 frames on both clocks → 25 identical, 1 differing
  (the target). `rolling_on_incline` 17/17 identical**, including its μ_s `param_ramp` slip state.
- **E3 `nlb_seam_r_slider_tokens_declared_but_unwired`.** `R`, `R2`, `omega0` were in the enum but
  in neither `NLB_SLIDER_TOKENS` nor `NLB_SLIDER_SPEC`, and unknown tokens were dropped in
  silence. Now wired end to end; a radius write re-lifts, re-scales and re-spaces (marks move by
  exactly 2πR); unknown tokens now **warn**. **A/B: 11 concepts, 58 states, 94 bodies, 0
  differing.**
- **Two build-time geometry defects fixed as prerequisites:** a SEAM-G `wheel` was *drawn* at the
  constant `NLB_WHEEL_R` while its lift/spin radius already used `radius_m` — a wheel authoring
  `radius_m: 0.25` stood on a 0.25 m axle while drawn at 0.55 m, **sunk through the track before
  any slider existed**; and state apply never re-resolved drawn radius. Both are no-ops on master
  (no committed concept authors `radius_m`), but they change what happens the moment you do.

### `rigid_body_rotation` (rbr) — **Desks A, C, D**
- **E1 `rbr_formula_surface_has_no_timed_reveal`.** `formula_lines: [{ text, at_ms? }]` ported from
  the nlb scenario. **`formula_at_ms` was deliberately NOT built** — that name is already taken by
  the `pef` scenario meaning *whole overlay at one instant*.
- **E4 `rbr_torque_cannot_spin_a_body_up`.** `rbrLAt` subtracted unconditionally and `eng.tau` was
  `Math.abs()` at both config sites, so **no torque could increase |L|** — α was unreachable at any
  authored value and a rest-seeded body stayed dead forever. `rbrLAt` is now a breakpoint walk over
  per-source engaged windows. **The rest clamp is now a property of the `brake` *kind*, not of the
  integrator.** `sources[]` (drive-vs-brake tug) is in. `omega0` slider floor lowered to 0 at both
  sites. The `source` union now declares `'applied_torque'`, which was a live branch missing from
  its own enum.
  **`brake` byte-identical: 125,280 L samples + 125,280 θ samples, all `Object.is`-equal.**

### THE EYE (`deriveStateMeta.ts`) — **everyone**
The rbr motion branch is **amended in place** to declare motion from the torque as well as the
seed. Without it `[D5]` would have gone silent on exactly the rest-seeded states E4 enables.
`sources[]` engage/release instants are registered for reveal-pinning.

---

## §3 — Newly authorable (was silently dead before)

| You can now author | Desk | Was |
|---|---|---|
| `formula_lines: [{text, at_ms?}]` on an rbr state — term-by-term assembly | A, D | the whole equation flashed at t = 0 |
| signed `applied_torque_Nm`; `sources[]` with `kind: drive\|brake`; `omega0_rad_s: 0` + a slider that reaches 0 | D | α unreachable; rest-seeded body dead |
| `controls_visible` `R`, `R2`, `omega0` on nlb; live radius respace | B | token silently dropped |

**Contract note for `json_author`:** a state authoring **both** `formula` and `formula_lines`
renders **only the lines** — drop the string rather than leaving a misleading no-op.
Full `sources[]` shape is in `FROZEN_SCOPE_0c3.md` §B E4 and the E4 commit body (`bf7dac1`).

---

## §4 — Two traps that make a green run meaningless. Both are live.

1. **THE EYE's three dense-motion gates ALL pass on a scene that never moved.** `[D5]` abstains
   whenever `deriveMotionExpectations` returns `undefined` (no `newtons_laws_body` branch exists,
   deliberately); `[D7]` computes `stuck = tailFrozen && earlierMoved`, so a scene that never
   moved has `earlierMoved === false` and it reports the actively misleading *"OK — no frozen
   tail"*; `[D6]` needs a nonzero median to search at all. **Desk B measured two concepts at 35/35
   PASS whose frames are MD5-identical across t=0/5000/10000/frozen.**
   **Until this is fixed, `md5sum` your dense frames — WITHIN ONE RUN ONLY.** One hash across the
   series = a dead scene, whatever the headline says. Filed as
   `eye_dense_motion_gates_all_pass_by_construction_on_a_totally_static_scene` in
   `_engine/scar_candidates_0c3.sql` (CRITICAL, `peter_parker:visual_validator`, **not applied**).

> ### 🔬 §4.1 — THE md5 QUESTION, RESOLVED 2026-08-06. Desk C is right about its experiment and the remedy is SOUND — they are different tests.
>
> Desk C (PASS 17) found PNG encoding nondeterministic **across runs** and concluded the md5 check
> "can only return all-clear". **Desk B used md5 *within a single run* on adjacent timestamps and
> correctly caught two dead scenes.** Those are different tests, and I measured both on this desk's
> own frames rather than adjudicating from either report.
>
> **Measured — within one run, on 118 adjacent dense-frame pairs of `coulombs_law`:**
> **88 pairs were pixel-identical (0 of 921600 differing). All 88 produced EQUAL md5. Zero
> mismatches.** So within a run the encoder is a deterministic function of the pixels.
>
> **Measured — across two runs of an unchanged build, same file:** bytes differ, **and 238 px of
> 921600 genuinely differ** (0.026%) — so cross-run is worse than Desk C reported: not merely
> re-encoding noise, there is real render jitter, almost certainly the OPEN scar
> `field3d_focal_glow_pulse_phase_reads_absolute_time_so_frozen_h2_jitters`.
>
> | comparison | md5 EQUAL ⟹ | md5 DIFFERENT ⟹ | verdict |
> |---|---|---|---|
> | **within one run** | pixels identical | pixels differ | **SOUND both ways** |
> | **across runs** | (never happens) | nothing | **WORTHLESS — never do it** |
>
> ### The ruling
> 1. **The §4 remedy is SCOPED TO WITHIN-RUN and it stands.** Compare adjacent frames of **one
>    capture**. A repeated hash across a series is proof of a dead scene.
> 2. **Desk B's dead-scene findings need NO re-derivation.** Its method was the sound one, and
>    `rolling_on_incline` S8's single hash across 10.5 s was a true reading — since confirmed
>    independently by the E11 fix, after which S8 gives **260 distinct positions in 260 frames**.
> 3. **NEVER md5 across runs**, and never quote a cross-run hash difference as evidence of anything.
> 4. **One honest limit, and it is Desk C's underlying point:** within-run md5 *difference* proves
>    **pixels changed**, not that the **taught motion** happened — a glow pulse or a caption timer
>    changes pixels too. So it is a strong **deadness detector** and a weak liveness proof. Use it to
>    disprove death, never to certify life; for that, measure the physical quantity.
2. **Your seed script probably disarms `[D5]` on rbr concepts.** The cloned exemplar writes
   `physics_config: { epic_l_path }` with `field_3d_config` **absent**, starving
   `deriveMotionExpectations`. Add it (this desk fixed both its canary seeds; Desk C fixed its
   own). **Caveat, because PASS 14 over-generalised:** this only restores `[D5]` for scenarios that
   *have* a motion branch — `rigid_body_rotation` does, `newtons_laws_body` and `coulombs_law_force`
   do not, and for those the `?` is by design.

---

## §4.2 — THE HARNESS LEDGER. Six findings, in BOTH directions. Read before trusting any gate result.

This chapter has now found **six** ways the verification harness reports the wrong answer — and
they do **not** all point the same way. Three make a broken thing look fine; three make a fine thing
look broken. Both cost real cycles.

| # | Finding | Direction | Mechanism |
|---|---|---|---|
| 1 | **B-4** — dense gates pass on a dead scene | **false PASS** | `[D5]` abstains when motion is undeclared; `[D7]` needs `earlierMoved`, so a scene that never moved reports "OK — no frozen tail"; `[D6]` needs a nonzero median. 35/35 on MD5-identical frames. |
| 2 | **E2** — byte-identical A/B against a dead baseline | **false PASS** | "17/17 identical" was the expected output of a corpse. Proves non-regression, never correctness. |
| 3 | **B-11** — hybrid frozen frame | **false PASS** | a frozen capture that blends states reads as a coherent pose that never existed. |
| 4 | **Desk C criterion-4** — a bare delta cannot distinguish "flipped" from "disappeared" | **false PASS** | F-C7's luminance-delta probe would have gone green on an invisible arrow: 15 occluded px getting brighter satisfies "assert a measurable increase". |
| 5 | **eye-walker aliasing** — 1 Hz sampling on a 4.19 s rotor | **false FAIL** | the sampling period beat against the rotation period, so a steady spin read as stillness. A phantom regression. |
| 6 | **§4.1 md5** — cross-run vs within-run | **both** | cross-run: byte AND pixel jitter ⇒ worthless. Within-run: deterministic, 88/88 ⇒ sound. Conflating them would have discarded a working check. |

**Two more this session, same family:** Desk A lost five founder-proxy probes to a **review site
built before its merge** — the agents were served a pre-E7 bundle and chased a phantom regression
(**false FAIL**). And **PNG cross-run jitter** is itself downstream of the OPEN glow-phase scar.

> ### 📏 STANDING RULE — vector verification (from Desk C, adopted chapter-wide)
> **Measure ABSOLUTE INK at the pose pointing AWAY from the camera, plus a RATIO against the
> favourable pose. NEVER a delta.**
>
> A delta cannot tell "it flipped" from "it disappeared", and the unfavourable pose is exactly where
> a vector dies — which is how **F-C9** (S4's reversed L vector, 48.8% of the up vector's ink) went
> unnoticed while E7's own acceptance passed at 1579 px on the favourable pose.

> ### 📏 STANDING RULE — every A/B (Desk E, from finding 2)
> **Assert LIVENESS on the quantity under test before the comparison means anything, and carry a
> PAIRED POSITIVE CONTROL** — a case that must differ, shown differing in the same run. An A/B
> licenses *"this change did not alter X"*, never *"X is correct"*.

> ### 📏 STANDING RULE — order of operations (from Desk A's lost probes)
> **`sync` → `rebuild` → `re-seed` → `EYE`.** A review site or cache built before a merge serves the
> **old bundle**, and every downstream reading is about code that is no longer there. Re-seed before
> **every** EYE run — a stale `sim_html` silently re-tests the old engine. This desk hit exactly
> that and caught it only because the assembled byte count had not moved.

---

## §5 — Verification partners. A dispatch is LANDED, not VERIFIED, until its partner confirms it.

Desk E's canaries are `newton_second_law` and `coulombs_law` — **neither exercises rbr**, so for
E1 and E4 they prove only *no collateral damage outside rbr*. This desk will never seed an rbr
concept: its checkout holds unmerged engine code, and seeding one would leave the desk that later
EYEs it silently testing code on no reviewed branch.

| Dispatch | Verifier | On |
|---|---|---|
| E2, E3 | **Desk B** | `pure_rolling`, `rolling_on_incline` |
| E1, E4, E5 | **Desk A** | `conservation_of_angular_momentum` — Desk D cannot verify its own blockers while blocked on them |
| E7 | **Desk C** | `angular_momentum` |
| E6, E8, E9 | **Desk D** once E4/E5 clear it | its two concepts |

**Please report back what you find** — to `_engine/findings_<desk>.md` as usual. A confirmation is
as valuable as a defect.

---

## §6 — ⚠ Desk B: one defect this merge does NOT fix, and it is yours

`pure_rolling` STATE_7 will **still read as broken** after you sync. The cause is **authoring, not
engine**: it authors `initial_position_m: 2.4` on a `surface.length_m: 3` track (bounds ±3) while
travelling in **+s**, leaving 0.6 m of runway — so it hits the bound at **~309 ms**, long before
the capture at `t_c` = 1361 ms. Probed with the authored numbers: `t=500 roll=0 v=0.0000
Rw=0.1307` — dead at the wall, spin barely started.

Every state of both your concepts authors `s0 = 2.4`. That is correct on the **incline** (gravity
drives −s, so 2.4 is the top) and backwards on the **flat** states, where motion is +s.
`pure_rolling` S1/S2/S3/S6/S7/S8 all launch forward from 2.4.

**Fix: `s0 = −2.4`, or a longer `length_m`. Owner `alex:json_author`, Desk B.**

Related, same desk: STATE_7 pins at 1500 ms while its only phase window closes at `until_ms: 1361`,
so the frozen frame is taken after the focal is handed back. Authoring-side — extend the window
past capture, or add a second phase ≥ 1500 ms. A `deriveStateMeta` change would move the pin for
the whole nlb fleet and is deliberately **not** taken.

---

## §6b — APPENDED 2026-08-05: **E5 has landed too** (`df87b6d`)

**E5 `rbr_authored_token_silently_skipped_when_the_engine_lacks_the_row`** — the highest-leverage
row in the scope. **It unblocks both of Desk D's concepts AND Desk A's `rotational_work_energy`.**

This is Desk E's **E5** and Desk A's **W-5** reconciled into one `bug_class` — they were the same
row stated from two sides. Four deltas, so nobody re-derives them:
- **`W` is IN.** Desk E's row list had dropped it; `rotational_work_energy` needs it.
- **`v` is OUT.** `findings_c` §2.2 declines a `v` HUD row (v is per-point, carried by per-marker
  labels), and the founder ruled `v = ωr` belongs to concept #4 (master `2443a74`).
- **`min_ring` folded in** — same `controls_visible` surface, and re-entering it later costs a
  whole dispatch.
- **The loud-warn ask is the point**, per Desk A's own tally.

### What you can author now

`readouts` gains **`theta` · `alpha` · `tau` · `W`**, and `reference_marks[].surface` gains all
four. `controls_visible` gains `tau_applied` and the ring-gated `{ id, min_ring }` form.

**Three semantics you must author against — getting these wrong is silent:**
1. **`tau` prints the RESOLVED net torque, never your authored value.** At a static hold it prints
   `0.00`. It equals `I·α` **only while I is constant** — so *a state teaching τ = Iα must not run
   a `param_ramp` on `r`.*
2. **`alpha` needs no torque authoring at all** — it is the finite difference of ω, so
   `rotational_kinematics` can print it with `external_torque` absent entirely. That is deliberate:
   it keeps torque out of a concept taught *before* `torque` and `moment_of_inertia` exist (Rule 25).
3. **`W` is SIGNED and re-zeroes at a restart / sandbox re-pin.** It is the integral of τ dθ, so it
   is deliberately non-monotonic — which is exactly why it equals ΔKE at constant I and can be
   checked on screen. Author it in states without a `restart` block for a clean cumulative reading.

**Units are fixed and fleet-wide: θ rad · α rad/s² · τ N·m · W J, all dp 2.** Author every
`reference_marks.value` in **SI (θ in radians)**, never in display units. Ruled by Desk E because
the office had not and three concepts were blocked: τ = Iα holds only in radians, so a degrees θ
beside a rad/s² α would be incoherent on the same HUD. Reversible in **one constant**
(`RBR_THETA_DISPLAY`) with **no concept-JSON change** if the office prefers degrees.

### 🔔 The console is now a real gate — check it once per new concept

Every closed surface (`readouts`, `reference_marks[].surface`, `controls_visible`) now emits
`[PM_RBR_TOKEN] [STATE_N] …` **once per distinct unknown token per state**. Desk A's analysis is
that **six separate defects in this chapter are one class** — something authored, accepted by every
gate, that silently does nothing — and that one warn per class would have caught five of six at
authoring time, before a gate cycle was spent on them. **Read the console.**

### Known, deliberately not fixed in E5 (reported so you do not chase them)
- **`rbrDLdtAt` has no anchor clamp**, so a state authoring `dLdt` across a `restart` shows **one**
  spiked frame after the blank. Left alone to preserve E4's byte-identity guarantee for
  `conservation_of_angular_momentum`. Its own dispatch.
- **`rbrThetaAt` is forward Euler on a 16 ms grid**, so θ lags the closed form by ½αht (0.8 % at
  t = 2 s). Pre-existing; W inherits it exactly, which is *why* W reads as τ·θ on screen.
- **`readout_at_ms` keys are still unvalidated** — an `at_ms` for a token absent from `readouts[]`
  is inert and silent. Same class, one line, not in the named scope.

---

## §6c — APPENDED 2026-08-06: **E7 has landed** (`14b2943`) — ⚠ **it changes how every rbr concept LOOKS**

**E7 `rbr_arrowhelper_shafts_not_separable_from_the_apparatus_they_run_along`.** Both rbr arrows
were `ArrowHelper`s whose shaft is a **zero-width `THREE.Line`** running collinear with an opaque
cylinder — the L arrow inside the axle, the pull arrow along the rod. Before: **15 px of ink** in S1,
a 5.7× change in L moving a **7-pixel smear**, and in S6 the arrow **entirely absent**.

**Rule 40a paid off:** the mechanism already existed **three times** (`gsphMakeThickVector`,
`glnMakeThickVector`, `gssMakeThickVector`). The eldest was lifted; no fourth was written.

### 🎨 Desk A, C, D — YOUR BASELINES WILL MOVE, and this is expected
Separability had to be bought in **colour as well as geometry**: the old axle `#90A4AE` and the L
arrow `#42A5F5` measured **1.02:1** relative luminance — *no tonal separation at all* — and
geometry alone left it at 2.2:1. So **`RBR_AXLE_COLOR` → `#1F2A30` and `RBR_ROD_COLOR` → `#26333A`**,
and both arrows are now thick emissive meshes. **Every rbr frame changes.** Treat H2 diffs on rbr
concepts as **expected re-baseline material** (the Rule-34e shape), not as a fix cycle — but read
them, and confirm the *only* changes are the apparatus tone and the arrows.

Ratios are now declared, not eyeballed: `RBR_SEP_RADIUS_RATIO 2.0` · `RBR_SEP_EMISSIVE_RATIO 6.0` ·
`RBR_SEP_HEAD_RATIO 3.1`. Axle 0.07 → **0.045**, rod 0.05 → **0.040**, shafts 0.090 / 0.080.

### What else changed on the L arrow
The raw clamp is replaced by a bounded map: **true zero below ε** (the old `RBR_L_ARROW_MIN` drew a
visible stub beside `L = 0.00` — a rendered lie), **exact 0.20 proportionality across the entire
reachable slider band**, asymptotic above a knee at 10.0 instead of the old hard clip at 1.80 that
froze L 9.18 → 20.7. **Sign colour now reaches the screen** — `RBR_NEG_COLOR` had exactly one
consumer and it was the invisible shaft; the shaft and the `L` label both recolour now.
**F-C7 closes as a side effect** (`MeshPhongMaterial` has `.emissive`, so the focal brighten is no
longer a silent no-op). **Desk C: your `rbr_l_arrow` focal handoffs were authored correctly all
along and now become legible for free — do not "fix" the JSON.**

### ✅ Desk C — E7 is ACCEPTED and the floor is AMENDED. **Close the amendment request; stop carrying it.**
**Founder ruling 2026-08-06.** The implementation is correct; the fourth floor was mis-specified.
**Floor 4 is now measured on WORLD length, intercept < 1 px — already proven and passing** at
5.7105 against a true 5.7105, intercept 0. A pixel-length ratio cannot equal a world-length ratio
under a perspective camera unless both vectors sit equidistant from it and parallel to the image
plane, which they do not; the 6.13 reading was **foreshortening behaving correctly, not a defect.**
**The other three floors stay as pixel measurements** — ink, contrast and flip magnitude are
genuinely screen properties — and all three passed with room (**15 → 1579 px**, **4.36:1**,
**5341 px**). Still open and separate from acceptance: the **negative-L branch occluded by the drum
disc** — measure its own absolute ink and route separately.

<details><summary>Superseded — the original request, kept for the record</summary>

### ~~🔔 Desk C — one acceptance floor FAILED as literally written, and I believe the floor is wrong~~

| Floor | Result |
|---|---|
| S1 arrow ink ≥ 400 px | **1579 px** ✅ (was 15) |
| arrow-vs-axle contrast ≥ 3:1 | **4.36:1** ✅ |
| S4 spin flip ≥ 300 px | **5341 px** ✅ |
| pixel length ratio 5.71 ± 0.10, intercept < 1 px | **6.13, intercept −1.44 px** ❌ |

**The build's drawn WORLD length is exactly proportional** — 0.228 / 0.918 / 1.302 world units for
L = 1.14 / 4.59 / 6.51, a ratio of **5.7105 against a true 5.7105, intercept 0**. I re-derived this
independently. The pixel deviation is **perspective foreshortening**: the arrow points along the
camera-up axis, so a longer arrow's tip sits nearer the camera (gain up to **1.157×** over its
span), and a cone projects width as well as length so a bbox reading carries a head-radius
intercept that has nothing to do with magnitude. **No build can pass the pixel form of this
criterion under a perspective camera.**

**Ask:** amend the floor to measure **world length** (or treat the pixel ratio as monotonicity
evidence only). This is the same lesson as the contract correction that demoted pixel *luminance* —
now extended to pixel *length*. ~~**Please confirm or overrule in your acceptance run.**~~
**RULED — accepted, floor amended to world length. See the box above.**

</details>

### 🔎 Desk C — one thing E7 did NOT fix, reported not absorbed
**The negative-L arrow is substantially occluded by the DRUM DISC.** At `spin_sign −1` the arrow
points down, under a radius-0.99 disc, with the camera looking down — so only the cone head clears
the drum silhouette (the sign is still readable from the head plus the now-amber `L` label). This is
**strictly better than before** (it was *entirely* absent) and it clears the S4 floor at 5341 px,
but it is occlusion by a **disc the vector passes through**, not by the collinear line this
`bug_class` covers. `depthTest:false` would mask it and was **rejected** — rbr spins, so an
always-on-top arrow would invert depth every half turn. **Measure the negative branch's own absolute
ink in your acceptance run and route it separately if it falls short.**

---

## §6d — APPENDED 2026-08-06: **E11 — `rolling_on_incline` is ALIVE.** 🎉 Desk B, this is yours

**One added term** at `field_3d_renderer.ts:47369`:
```js
if (!rollHeld && nlbSgn(v0) !== nlbSgn(v1) && Math.abs(drive) <= maxStat) { v1 = 0; a = 0; }
```

**All 8 `rolling_on_incline` states now render their physics.** The rest clamp asked the *sliding*
question `μ_s ≥ tan θ` — correct for a block. A rolling body's static gate is the strictly weaker
`μ_s ≥ (k/(1+k))·tan θ`, which the rolling branch had **already evaluated and passed** (`canRoll`).
The clamp asked the block question a second time and overruled the rolling branch's own answer.
`nlbSgn(0) = 0` made its sign half true on the first integrated frame, `v1 = 0` reproduced `v0 = 0`
next frame, and the body was pinned forever. Every state authors μ_s 0.50 or 0.90 — both above
tan 25° = 0.4663 — so the magnitude half was permanently armed too.

### ✅ Desk B — what to expect on your re-walk, and one correction to B-3

Independently derived physics, matching to the millisecond (`t = √(2d/a)`, `a = g sinθ/(1+k)`,
d = 4.5 m):

| body | k | a | halt | authored |
|---|---|---|---|---|
| solid sphere | 0.400 | 2.9583 | 1744 ms | 1744 |
| disc | 0.500 | 2.7611 | 1805 ms | 1805 |
| hollow sphere | 0.667 | 2.4850 | 1903 ms | 1903 |
| ring | 1.000 | 2.0708 | 2085 ms | 2085 |

S4's mass/radius cancellation is an **exact tie at 1760 ms**; S5's energy split reads
**6.99 / 2.80 J** (sphere) and **4.85 / 4.85 J** (ring), each summing to ≈ mgh; S3 and S6 start on
their authored `activate_at_ms` (1504 / 2512 ms).
**S8 gives 260 distinct positions in 260 frames — your MD5 target is ~260 distinct hashes, not one.**

> **Correction to B-3, offered with thanks — your data was right, one prose reading was not.**
> B-3 states S7's "mesh is pixel-identical throughout." **S7 was in fact travelling from t = 688 ms**,
> releasing on the exact frame μ_s crosses tan θ. Your own negative control said so — you recorded
> that S7's hashes differ at every timestamp — so the two halves of that section contradicted each
> other. **The MD5 half was correct.** Worth a line in `findings_b.md` so the record matches.
>
> This cost a wrong turn on my side too: I built a two-class re-scope on that prose reading and
> struck it after the runtime disproved it. **The lesson I'm taking: a sibling desk's runtime claim
> needs the same scepticism as an agent's — and an internal contradiction inside one finding is the
> cheapest possible tell.**

**Also worth your check:** S7's authored beat times are verifiable against narration for the first
time (its slip beat at μ_min = 0.233 / 1193 ms, its 1968 ms halt latch), since the ring previously
sat still until 688 ms.

### Still open, reported not fixed
- **E11b (general).** A **non-rolling** body launched from rest with `|drive| ≤ μ_s·N` is still
  clamped by this guard. Whether `nlbSgn(0) = 0` should make that fire on frame 1 is a separate,
  **fleet-wide** question about blocks and carts. **Nothing needs it** — S6 moves at 2512 ms.
- **A backward pin *within one state entry* does not rewind** on `newtons_laws_body` (it steps
  `s`/`v` rather than closing them in `t`). **Pre-existing** — demonstrated on the unmodified
  renderer — and harmless to THE EYE, which enters fresh per pin.

---

## §6e — APPENDED 2026-08-07: **F-C9 — the reversed L vector is back.** Desk C, `angular_momentum` should be clear for a Checkpoint B retry

**Four lines** — `depthTest`/`depthWrite` off and `renderOrder 998` on the L arrow's own material
and meshes. **This is NOT an E7 regression:** E7's world-length map is verified correct (slope
0.200000 exactly, intercept 1.5e-15, 7/7 pins both signs) and is **byte-untouched**. It is a second
distinct defect on the same primitive, and it was invisible to E7's acceptance **because that
acceptance measured the favourable pose** — which is precisely why §4.2's standing rule now exists.

The anchor was already correctly sign-mirrored. The cause is **silhouette**: the camera sits 23.5°
above the rotation plane, so the drum's opaque disc projects over anything below it near the axis —
exactly where the down vector lives.

### Acceptance — absolute ink at the UNFAVOURABLE pose, per §4.2. Never a delta.

| measure | before | after |
|---|---|---|
| **down-pose ink (absolute)** | 720 px | **1294 px** |
| ratio down / up | 48.2% *(Desk C measured 48.8%)* | **84.1%** |
| **shaft (non-head) ink at down** | 51 px | **545 px — 10.7×** |
| bbox height at down | 23 rows | **61 rows** |
| up pose (must not regress) | 1494–1507 px | **1539 px — no regression** |

The residual 16% is **perspective, not leftover occlusion**, proved three ways: the row-width
profile is unbroken, the tail renders at its predicted anchor row (371 measured vs 371.4
predicted), and shaft ink equals width × length exactly (0.696 predicted vs 0.699 measured).

**Desk C — two asks.** (1) Re-run on the **real** `angular_momentum` config: the surgeon rebuilt the
beat synthetically because your JSON is not in this worktree, so the *ratios* match yours closely
(48.2 vs 48.8%) but the *absolute* numbers use a different mask. (2) The measurement rig is
reproducible with **no DB and no seed** — `assembleField3DHtml` → headless chromium at 1280×720,
`SET_TIME_FREEZE`, arrow isolated by rendering the same state twice with
`visible_elements ["all","rbr_l_arrow"]` vs `["all"]` and `show_l_arrow:false`, diff on
max per-channel Δ > 12.

### ⚠ A trade was taken deliberately — founder-proxy should review it

The alternation question was **measured over a full revolution at 12 pins**, not assumed:
- **Against the drum / axle / R_drum torus — NO alternation.** They are solids of revolution about
  the very axis the arrow lies on, and it lives in `root`. Down-pose ink is flat within **0.6%**
  across all 12 pins. **That is what makes the targeted `depthTest` route legitimate here, where it
  was correctly rejected fleet-wide in E7.**
- **Against the `spin` group — YES.** The up pose showed a **6.3%** spread with minima at exactly
  the two angles a mass lies between camera and axis. Post-fix the up pose is flat at 1539 px, and
  **the flatness IS the inversion**: the arrow now draws over the rod and the masses where they
  genuinely cross it.

**Trade: ~90 px of partial overdraw twice a turn, against 774 px lost on every negative-L frame.**
Filed as `rbr_axial_overlay_drawn_over_the_spin_group_members_that_genuinely_cross_it`
(MAJOR, OPEN, Candidate 10) rather than buried. A geometric offset was rejected **on evidence**
rather than by inheriting E7's clause (d): clearance needs `R_drum·tan(elevation) + 0.10` = 0.53 at
23.5° but **1.81 at 60°**, longer than the whole arrow, so no fixed offset survives a teacher orbit.

---

## §7 — Still blocked after this merge

> ### ⛔ CORRECTION 2026-08-06 — the paragraph below was WRONG. **Desk D is NOT unblocked.**
> I wrote that E4 + E5 unblocked Desk D's two concepts. **The founder overruled it** (ruling 3):
> `findings_d` §4b — **the drive torque has no rendered actuator** — is now accepted as **BLOCKING**,
> not the MEDIUM this desk had filed it as. The brake pad's travel path is gated on the
> `rbr_brake_pad` mesh and on `eng.padEngageMs`, which only the `brake` branch ever assigns; a drive
> leaves it null and there is no drive-wheel mesh at all. **Measured cost: the Rule-32a cause beat
> is lost on 11 of 17 states across Desk D's two concepts** — a torque spins the turntable with
> nothing visibly doing it (Rule 24 / §10(d): no stated agent without a rendered object).
>
> **Desk D: do NOT start `json-author` on the strength of E4 + E5.** Your concepts unblock when
> **E10** lands (`rbr_drive_torque_has_no_rendered_actuator`, `FROZEN_SCOPE_0c3.md` §B).
>
> Two things Desk D should know now, because they change the authoring: **(a)** the travel field
> moves **per-entry onto `sources[]`** — `pad_travel_ms` is singular and top-level and cannot
> address the list E4 created; **(b)** founder ruling 4: **`rotational_kinematics`'s explore control
> is α, not τ.** A τ-labelled slider puts an untaught term in the sandbox of a concept whose Rule-25
> compliance depends on never naming torque. `tau_eq_i_alpha` is unaffected — τ is what it teaches.

~~**Desk D's two concepts are UNBLOCKED by E4 + E5**~~ — E4 + E5 remove two of the three blockers
(signed torque makes α producible; E5 gives it somewhere to print), but **E10 remains**.
**Desk A's `rotational_work_energy` IS unblocked by E5** (the `W` row) — that half stands.

### 📌 Desk C — two rulings for you
- **The 0c-2 two-timed-class fence is NON-CUMULATIVE and binds 0c-2 only** (founder, 2026-08-06),
  answering your PASS 5 office question. Your `rigid_body_rotation` design's two new timed classes
  on rbr are **a build, not a Phase-0 alarm. The sealed design is NOT invalidated**, and the
  named-but-not-taken fallback stays untaken.
- **Your PASS 16 is accepted and my §C C-3 premise is struck.** `angular_momentum.json`
  (`7877393`, on `origin/feat/rotmech-c`) does consume the rbr scenario — I re-verified `:588`
  myself. E7 therefore has a real back-compat surface and your five cited sites are now recorded as
  E7 acceptance in `FROZEN_SCOPE_0c3.md` §B. Thank you — that correction is exactly what a named
  verifier is for, and it caught a stale generalisation of mine.

`rigid_body_rotation` (Desk C) remains blocked. **E7 has now landed** (§6c). Outstanding:
**E6** (a one-shot `restart` with no `every_ms` still computes `NaN` and zeroes L for the whole
state), **E8** (live `tau_brake` drag has no rendered agent), **E9** (camera pose not authorable),
and **E10** (the drive torque has no rendered actuator — new, founder ruling 3, and it is what now
blocks Desk D). See `_engine/FROZEN_SCOPE_0c3.md` §B.

**Desk C:** `angular_momentum`'s `every_ms: 99000` workaround must stay until **E6** lands, and its
authored `rbr_l_arrow` focal handoff stays correct-but-illegible until **E7**. Do not "fix" either
in the JSON — both are right as authored.
