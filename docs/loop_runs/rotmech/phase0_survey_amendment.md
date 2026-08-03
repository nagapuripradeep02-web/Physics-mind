# PHASE-0 SURVEY AMENDMENT — Class 11 Ch.7 `rotmech`

**For founder signature. One document, both engine rows.** Amends `phase0_survey.md` (approved 2026-08-02). Everything below was raised at **0b, before any code** — which is where the alarm rule is supposed to fire. No new `scenario_type` is forced; nothing leaves the `field_3d` family.

**Status of the three spec drivers, all `DESIGN_OK`:**

| Concept | Build | Design | Physics block |
|---|---|---|---|
| `conservation_of_angular_momentum` (#10) | 0c-1 | skeleton REV 4 | ✅ |
| `rolling_on_incline` (#12) | 0c-2 | skeleton REV 6 (amended) | ✅ |
| `pure_rolling` (#11) | 0c-2 | skeleton REV 3 (amended) | ✅ |

---

## Part 1 — 0c-1 addenda (`rigid_body_rotation`, a NEW scenario_type serving 12 concepts)

The survey's 0c-1 row is unchanged in substance. Four items were raised during review that it does not name:

| # | Addendum | Why it is not in the original row |
|---|---|---|
| A | **`reference_marks[]` with TWO declared surface forms** — a labelled value **chip** + match cue beside a value-only readout (S3's prediction), and a labelled **tick** on a bar scale (S4's energy mark) | The primitive was named generically ("a mark on any readout or bar"); a value-only readout has no scale for a tick to sit on, so the two forms had to be separated |
| B | **Visible brake actuator + `brake_drum_radius_m` + a drawn drum reference line** | The survey authorises a torque source; it does not authorise the *rendered agent*. The design requires the pad to be a real object, not an implication |
| C | **Re-pin cue** — a ≥0.5 s hold with readouts blanked, fired whenever a restart re-initialises L | Needed so a discontinuity reads as a restart rather than an uncaused torque |
| D | **Bounded/asymptotic mapping for the pull-force arrow** *(founder-ruled 2026-08-02)* | The guided states span 3.60–19.35 N, which a linear scale handles. The explore state's slider corners (m 5.0, r 0.90, ω₀ 3.0) reach **hundreds of newtons**, where a fixed linear scale clips. Bounded mapping keeps guided-state lengths comparable and degrades gracefully at the corners |

**A, B and C are additions to the union table. D is the founder's ruling on the S8 arrow-scale question.** F5 (the radial force arrow itself) is **not** an addendum — survey row #5 already authorises force-applied-at-a-point.

---

## Part 2 — 0c-2 (a bounded EXTENSION of `newtons_laws_body`, serving #11 + #12)

The survey's 0c-2 row reads: *"per-body shape factor · the acceleration branch · N bodies racing one incline"* plus the advanced-sweep addition *"rolling-vs-slipping regime switch."* **Five bullets.** Measured against both consumers, the honest union is **16 items**. That growth is the alarm rule firing correctly, at 0b, before code — and every item below was traced to a code fact, not a preference.

| # | Item | Consumers | Engine | Tag |
|---|---|---|---|---|
| U1 | Rolling physics branch: per-body k, a = g sin θ/(1+k), f_s = k·m·a; **branch priority** (the rolling branch supersedes the kinetic path while rolling holds); slip in BOTH directions; independent ω integrator + `omega0_rad_s`; the μ_min tick on the μ_s row | both | E15 | blocking |
| U2 | Contact-point picture: rim dot, cycloid trace, skid trail; point-speed arrows **computed from live (v, ω)**, never hardcoded; contact readout; static/kinetic call-out | both | E16 | blocking |
| U3 | Per-body `radius_m` (optional; absent ⇒ today's constants) | both | E7a | blocking |
| U4 | Rolling apparatus: four meshes **each with a rotation marker**; k chips; KE readouts; **`readouts` enum extension — `contact`, `Rω` AND bare `ω`** (see the closure below) | both | E17 | blocking |
| U5 | Finish-line halt-and-latch (bypasses `checkpoints` for four line-numbered reasons) | #12 | E3 | blocking |
| U6 | Synchronised all-body race restart (+ ω re-seed) | #12 | E4 | blocking |
| U7 | **Two-channel** authorable vector map (force + velocity) + zero-vector marker | both | E11 | blocking |
| U8 | Lane geometry incl. **`lane_gap_m = 0` legal**; occlusion warning; camera target authoring | both | E2 + E10 | blocking |
| U9 | State-local physics clock rebase | both | **E1** | blocking |
| U10 | Per-body **`activate_at_ms`** + `single_lane: true` retirement + `visible_before_activation` | both | E9 | blocking |
| U11 | Revolution marks + circumference bracket as their OWN primitive (never `checkpoints`) | #11 | E12 | blocking |
| U12 | ω re-seed on the sandbox wrap | both | E13 | ride-along |
| U13 | Visible-elements matcher registration for every new element type | both | E14 | ride-along |
| U14 | Per-body `rotation_locked` | both | E19 | blocking |
| U15 | Centre markers + CoM crossing metric | #12 | E20 | blocking |
| U16 | **Per-line formula reveal** (`formula_overlay[].at_ms`) *(founder-ruled 2026-08-02)* | both | E18 | blocking |

**Closing the last gap before dispatch.** `pure_rolling`'s physics block found that U4's readout-token item was scoped to **bare `ω` only**, while the concept also needs **`contact`** and **`Rω`**. That is the same class of defect a review caught two rounds ago (a build item the state table consumes with no dispatch number). **U4 above is written to cover all three tokens** — declaration + reader + validator co-edit. Dispatching against the un-widened list would have built one token of three, surfacing at bring-up.

**The timed surface is exactly TWO field classes** — `bodies[].activate_at_ms` and `formula_overlay[].at_ms` — and nothing else. No per-arrow reveal, no per-label reveal, no choreography DSL. **A third timed class is the alarm rule: STOP and re-scope.**

**Cross-cutting back-compat clause.** Every field 0c-2 adds is OPTIONAL; absent ⇒ today's behaviour byte-identically. Presence is resolved by `typeof`/`in`, **never truthiness** — `lane_gap_m = 0`, `activate_at_ms = 0` and `visible_before_activation: false` are all legal falsy values, and `x || DEFAULT` silently restores the constant, reproducing the exact defect the field was bought to fix. Acceptance: same-session A/B THE EYE runs on `rolling_friction` and `work_done_by_constant_force`; criterion — H2 passes its tolerance AND any non-zero percentage reproduces on the pre-change renderer **or has max channel delta ≤ 3**.

---

## Part 3 — dispatch order

**E1 (the state-local clock) is a precondition of both builds** — every timing row, every `activate_at_ms` and every `formula_overlay[].at_ms` depends on it. It is owned by `peter_parker:renderer_primitives`, which dispatches **pcpl-surgeon**, *not* field3d-surgeon. Run it first or alongside; do not run either 0c build to completion without it.

Then 0c-1 and 0c-2 are independent of each other and may run in either order or in parallel.

---

## Signature

By approving this document the founder signs:
- the four **0c-1 addenda** (Part 1), including ruling **D** (bounded arrow mapping);
- the **16-item 0c-2 union** (Part 2), including the two founder rulings already given (formula-line reveal bought, per-arrow reveal refused) and the U4 token widening;
- the **two-timed-class fence** and the declaration that a third class stops the build;
- the dispatch order in Part 3.

*Everything here was found before a line of engine code was written. Finding it after 0c had landed is what cost Class-12 Ch.7 ~1,296M tokens for six concepts.*
