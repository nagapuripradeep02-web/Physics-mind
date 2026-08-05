# 0c-3 — FROZEN SCOPE

**Frozen 2026-08-05 by Desk E (`feat/rotmech-0c3`), the sole engine owner for the Phase-0d run.**

Merged from five inputs: `findings_d.md` (§8, the nominated freeze source), `findings_c.md`
(PASS 1–15), `findings_a.md` (A-1…A-17), `findings_b.md` (B-1/B-2 — a **different subsystem**),
and this desk's own original six-item table in `rotmech_0c3_state.md`.

**Deduplicated and verified.** Every row below was checked against the code in this checkout
before being written down; rows that a findings file asserted but the code contradicts are
recorded in §D. Nothing here is copied on trust.

---

## §A — The headline numbers, stated plainly

| | |
|---|---|
| Distinct engine defects/capabilities across the four findings files | **31** |
| After dedup (same defect filed by two desks) | **26** |
| Not Desk E's (office / schema / contract / founder ruling) | **6** |
| **Engine rows Desk E owns** | **20** |
| Grouped into `bug_class` dispatches | **9** |
| Of those, **BLOCKING** an authoring desk right now | **6** |

**The office's estimate of "4–5 dispatches" does not survive the merge.** The honest number is
**9**, and that is already after aggressive grouping. §B explains each grouping; §E says what
would have to be dropped to reach five. This is the re-scope signal firing a second time and it
is reported, not absorbed.

---

## §B — The nine frozen `bug_class` dispatches, in blocking order

Sequence follows who is blocked, per the office directive. **One `bug_class` per dispatch,
~100-call ceiling, full verify chain after each.**

> **NAMING COLLISION — fixed here, read once.** Desk E's dispatch ids and THE EYE's gate ids both
> ran `D1…D7`/`D9` and they are **not the same thing** (Desk E's `D5` = the readout table; THE
> EYE's `[D5]` = "Dense motion present"). Dispatches are now **`E1…E9`**; THE EYE's gates keep
> their bracket form `[D5]` / `[D6]` / `[D7]`. **E1 landed in commit `7022169`, where it is still
> called D1.** Nothing else changed.

### E1 · `rbr_formula_surface_has_no_timed_reveal` — **BLOCKS DESK A** (already authored)
Source: findings_d §6c (ranked #7 HIGH, flagged cross-desk "read this one first").

`rbr.formula` is a plain `string` (`:1050`) written once per state entry as `textContent`
(`:50570–50573`). No timing, no term list. Desk A's `conservation_of_angular_momentum` is
authored and committed with S7 `motion_archetype: "equation-build"` and a timed assembly in S3
(0–4000 ms and 0–3200 ms) — both silently dead. Desk A cannot reach Checkpoint B.

> **RULE-40a CORRECTION — do NOT build `formula_at_ms`.** Desk D proposed that name. Verified in
> this checkout: **`formula_at_ms` is already taken** by the `pef` scenario (`:9149`, `:9200`;
> `deriveStateMeta.ts:1416`) and means *whole overlay appears at one instant*. Desk A needs
> **term-by-term assembly**, which is a different shape — and that shape **already exists** as
> `nlb.formula_lines?: Array<{ text, at_ms? }>` (`:1644`, implemented `:45148–45158` / `:45442` /
> `:46308`, registered in `deriveStateMeta.ts:2829–2833`).
> **Port `formula_lines` to rbr. Reuse the nlb semantics and the existing deriveStateMeta
> pattern.** Building `formula_at_ms` here would mint a third meaning for a name that already
> carries two — the exact Rule-40a failure this desk exists to prevent.

> **✅ E1 LANDED AND VERIFIED — 2026-08-05.** Built as a port of `nlb.formula_lines`, not as
> `formula_at_ms`. Two files: `field_3d_renderer.ts` (+76/−5 — decl `:1051-1068`, new
> `rbrRenderFormula(tMs)` `:50238-50276`, `eng` seed `:50568-50577`, apply `:50636-50640`, frame
> `:50833-50835`) and `deriveStateMeta.ts` (+23 — item (7) in the rbr block of
> `maxRevealForField3dState`, `:3210-3232`). Absent-field path proved byte-identical over 175
> cases driven against the **actually emitted** function text. Reveal is stateless and recomputed
> from state-local `tMs` each call — pin/rewind 3000→9000→3000 byte-identical, so no second
> instance of `hysteretic_state_cannot_be_latched_under_a_time_pin`.
> Registration proved against Desk A's real assemblies: S7 pins **4900** (was 1500 — it would
> have baselined one line into a four-line assembly), S3 pins **4100** (formula correctly
> out-voting its 2000 ms `param_ramp`).
> **Verified by this desk independently:** renderer-syntax OK ×3, tsc 0, validate **149 PASS /
> 0 FAIL** exit 0, `newton_second_law` **26/26**, `coulombs_law` **50/50 with H2 0.00%**.
> H2 on `newton_second_law` reads 0.22–0.34% — **explained, not re-baselined**: two consecutive
> runs with *no* code change differ in the same 63/64 frames and report the *identical*
> percentages, so the byte-level jitter is capture nondeterminism and the sub-0.35% delta is
> pre-existing baseline vintage. No re-baseline taken.
> **For `json_author`:** a state authoring both `formula` and `formula_lines` renders **only** the
> lines — drop the string when adding lines rather than leaving a misleading no-op.
> **Deferred, noticed during E1 (not this bug_class):** `#rbr_formula` is `top:40%` +
> `translateY(-50%)`, so a growing assembly walks the first line upward. Inherited verbatim from
> nlb (`#nlb_formula`, shipped through 0c-2); top-anchoring rbr alone would move pixels on every
> existing single-line rbr state. If Checkpoint B dislikes the jog it is one `bug_class` covering
> both scenarios, not an rbr-only fix.

### E2 · `nlb_rolling_branch_has_no_kinematic_gate` — **BLOCKS DESK B**
Source: findings_b B-1. Subsystem: `newtons_laws_body` / SEAM R, **not** rbr.

`rollHeld`'s `canRoll` (`:46828–46840`) is a *dynamic availability* test. On flat ground
`drive ≡ 0`, so it is true on frame 1 for a demonstrably sliding contact: `a = 0`, `f` reads a
dishonest `0.00 N`, the `_slipping` capture re-anchor never fires, ω stays frozen at its seed.
Two independent changes, neither sufficient alone: add the kinematic precondition
`|v − ωR| < NLB_STOP_EPS_V` to `rollHeld` (`:46834`), and gate the angular sub-block on
`_spinIndep` rather than `rolling` (`:46867`) to match the convention already chosen at `:46863`.
Blast radius verified nil: inert on inclines, and every pre-SEAM-R body has `rolling` falsy.

### E3 · `nlb_seam_r_slider_tokens_declared_but_unwired` — **BLOCKS DESK B**
Source: findings_b B-2.

`R`, `R2`, `omega0` are in the interface enum (`:1545–1548`) but absent from
`NLB_SLIDER_TOKENS` (`:42637`) and `NLB_SLIDER_SPEC` (`:42638–42653`); `nlbSliderTokensUsed`
(`:42683–42693`) drops an unknown token **in silence**. `pure_rolling` S1's only control is
inert; S8 silently loses two dials; `rolling_on_incline` S4's mandated live `R₂` is inert.
A radius write must also re-lift/re-scale the mesh and re-space the revolution marks — that is
union item (c)-1 and lands in the same dispatch or S1 gets a dial that moves nothing.
**Harden the silent skip to a warn** in the same pass.

### E4 · `rbr_torque_cannot_spin_a_body_up` — **BLOCKS DESK D (both concepts)**
Source: findings_d §1 (CRITICAL) + §6b + §7 + the doc fixes.

`rbrLAt` (`:49937`) subtracts unconditionally and `eng.tau` is `Math.abs()` at both assignment
sites (`:50520`, `:50532`). **No torque source can increase |L|**, so α is unreachable at any
authored value; a body authored at rest stays dead forever. This is physics, not display.

Ships together, because they are one change or they are a trap:
- **Signed torque** — sign authored, never derived from |L|; rest clamp survives as *brake-only*
  behaviour, not as a property of the integrator. Stays closed-form (`L = L₀ + τ·engaged_s`);
  **no per-frame accumulator** (the scenario is in `animate()`'s accumulator-free snap set).
- **`sources[]`** — Desk D's ruled drive-vs-brake tug. **This is the one row where a Desk-D
  design decision ADDS scope**; Desk D asked it be priced explicitly. Priced: per-source engaged
  windows (a split of `rbrBrakedSeconds`), τ_net summation, widened guards, and `sign(L)` never
  consulted at L = 0. A designed single-signed-control fallback exists in that skeleton's D-row.
- **ω₀ floor to 0 at BOTH sites** — `RBR_SLIDER_SPEC.omega0.min = 0.5` (`:49999`) **and** the
  live-write guard `if (!(value > 0)) return;` (`:50075`). Change one and the floor moves with
  nothing happening.
- **§6b `deriveStateMeta.ts:496–508`** — motion is declared from the seed alone, so a state
  seeded at rest falls through `undefined` and D5 **skips**. Correct today; wrong the instant
  signed torque lands. Must read the torque as well as the seed. **AMEND the existing branch —
  it is there; do not add one.**
- **§7 enum reconcile** — `'applied_torque'` is a live branch (`:50528`) absent from its own
  declared union (`:1000`), while two declared members are inert. One line.
- **Doc fixes in the same change:** the contract comment at `:947–949` (claims
  `applied_torque_Nm` gives #7's α "with no extra code path" — true only for the decelerating
  half) and `:953` / `:998` (both call `theta0_rad` unimplemented; it is fully wired — see §D).

### E5 · `rbr_readout_table_is_closed_and_skips_in_silence` — **BLOCKS DESK D (both concepts)**
Source: findings_d §2 + §5, endorsed by findings_c §2.2.

`RBR_RO_META` (`:50147–50154`) is exactly six rows; `rbrRebuildReadout` (`:50163`) and
`rbrWriteReadouts` (`:50236`) both `if (!meta) continue`. `field_3d_config` is **not modelled in
Zod at any depth**, so there is no enum to slip through either. Add `theta`, `alpha`, `tau` rows;
widen `reference_marks[].surface` (`:1024` / `:50167` / `:50259`) to `theta` + `alpha`; add the
applied-torque control token.
- **`tau` displays the NET RESOLVED torque, never the authored schedule value** (Desk D binding
  ruling; zero extra cost, invisible if got wrong — at the rest clamp the authored value prints
  τ = −1.53 beside α = 0.00, contradicting τ = Iα in the concept whose atomic claim *is* τ = Iα).
- **α is the per-step finite difference of ω**, from the same post-step snapshot as I/ω/L/KE
  (`:50219`), blanked across re-pins exactly as the other rows are. Desk D's canonical ruling.
- **Make the unknown-token skip a `console.warn`.** Desk D: *"worth more than the rows
  themselves."* Desk C independently endorsed it. It converts an invisible authoring error class
  into a visible one for every future rbr concept.
- **Rule 34c applies to all three new rows** — Unicode minus on a negative α
  (`rotational_kinematics` prints α = −0.50), θ/α/τ glyphs across all three text paths.
- **Units/dp is an OFFICE decision, not a build decision** (§C-3).

### E6 · `rbr_restart_arithmetic_and_repin_blank` — **BLOCKS DESK C + DESK A**
Source: findings_c F-C6 (CRITICAL) + F-C3 + C10 + findings_d §6 item 8.

- **F-C6, CRITICAL:** a one-shot `restart` (no `every_ms`) computes `at_ms + (1−1)×Infinity` =
  **NaN** (`:50547` / `:49883`); `rbrEffTime(1)` is NaN, so `:49918`'s `NaN >= -1` is **false**,
  the re-anchor branch is skipped, and L stays on the original anchor which the brake has already
  clamped to zero. **L = 0 for the entire state; the apparatus never turns.** Found on a build
  where all 23 EYE checks passed. `rbrCutTime(1)` must equal `at_ms` exactly whether or not
  `every_ms` is authored. Also: the `NaN`-swallowing rest clamp (`:49941`) should warn, not clamp.
- **F-C3:** the re-pin blank fires on **every** `input` event (`:50074`/`:50078`), so a drag
  renders `"—"` continuously and `rbrThetaReset` re-accumulates the whole grid per tick (O(n) to
  `RBR_GRID_MAX` 20000).
- **C10:** an opt-in per-state `omega_live` that does **not** restart — closed-form re-anchor
  `θ_new(t) = θ(t₀) + ω_new·(t − t₀)`, no blank, no badge. **C10 is NOT F-C3 — Desk C says
  explicitly do not merge them.** Both are wanted; they are two rows in one dispatch, not one row.
- **Per-run `{at_ms, r_m, omega0}` overrides on `restart`** (findings_d §6 item 8) — the cheap
  alternative to a second body, needed by `tau_eq_i_alpha` S5's same-τ/different-I compare.

### E7 · `rbr_l_arrow_occluded_and_magnitude_unreadable` — **BLOCKS DESK C**
Source: findings_c F-C8 (supersedes F-C7) + F-C2 + findings_a A-11 (mechanism corrected) + A-16.

`ArrowHelper`'s shaft is a zero-width `THREE.Line` on the axle centreline (`:50386`) inside an
opaque `CylinderGeometry(0.07, 0.07, 3.4)` (`:50304`); the cone radius 0.08 vs axle 0.07 leaves a
**0.010-unit crescent**. Measured: **15 px of ink** in S1 frozen; a **5.7× change in L moves a
7-pixel smear**. Recurrence of the **FIXED** scar
`field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line` — **amend that row
(upsert on `bug_class`), never mint a new one.** New constraint the original row did not name:
the apparatus line is *thicker than the arrow head*, so the clearance clause is **two-sided** —
`RBR_AXLE` geometry is in scope.
Rides along, same primitive: **F-C2** (`RBR_L_ARROW_MIN = 0.22` draws a visible stub at L = 0;
`RBR_L_ARROW_MAX = 1.80` clips everything above |L| = 9.00, so L 9.18 → 20.7 moves nothing) —
adopt the bounded/asymptotic map the pull arrow already has (`:49762–49794`). And **A-16** (the
sign-colour channel is dead: `RBR_NEG_COLOR`'s only consumer is the invisible shaft; `rbr_l_label`
is never recoloured; HUD digits take no sign colour).
> **CONTRACT CORRECTION — office directive 2026-08-05, from Desk C's Checkpoint B
> (`founder_proxy_B.md` §1). This supersedes any earlier reading of F-C7 and is BINDING on the
> E7 dispatch.**
>
> **F-C7's diagnosis is right about the SYMPTOM and wrong about the ROOT CAUSE.** The arrow is
> not merely pale-because-`MeshBasicMaterial`/`LineBasicMaterial`-have-no-`.emissive`; it is
> **occluded** — a zero-width `THREE.Line` shaft drawn inside an opaque axle. Fixing the material
> alone leaves an invisible arrow that is now invisible *and* brighter.
>
> **Worse, F-C7's own probe would PASS on a build where the arrow is still invisible.** Its probe
> asserts "sample rendered pixel luminance before and after the focal instant; assert a
> measurable increase" — and **fifteen occluded pixels getting brighter satisfies that**. A probe
> asserting a *delta* cannot detect a defect of *absence*. Do not carry that probe forward.
>
> **Build to the EXISTING prevention rule on the FIXED scar row
> `field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line`** — amend that row,
> never mint a new one:
> 1. A **real mesh cylinder shaft parented to the `ArrowHelper` group** (not a `Line`), carrying
>    `MeshPhongMaterial` — which gains the emissive channel and the thickness in one move, so
>    F-C7 is closed as a side effect rather than as a separate fix.
> 2. The **apparatus line made thinner AND dimmer than the shaft BY CONSTRUCTION**, with the
>    **ratio written into the constants** — not tuned by eye, not left implicit. Here the axle
>    (0.07) is currently *thicker than the arrow's cone* (0.08 radius), so the clearance clause is
>    **two-sided**: `RBR_AXLE` geometry is in scope, not just the arrow.
> 3. **A z-offset is explicitly NOT a fix for this class** — clause (d) of the existing row.
>
> **The probe must assert DRAWN GEOMETRY, not pixel luminance.** Assert the shaft mesh exists, is
> a cylinder (not a `Line`), its radius exceeds the axle radius by the constant-declared ratio,
> and its drawn length tracks |L|. Keep the pixel measurements below only as a **secondary
> absolute floor**, never as the primary assertion.

Secondary acceptance floors (findings_c PASS 15) — absolute, not deltas: S1 ink ≥ 400 px;
`len(6.51)/len(1.14) = 5.71 ± 0.10` fitted in pixels with intercept < 1 px; arrow-vs-axle
contrast ≥ 3:1; S4 flip changes ≥ 300 px.

### E8 · `rbr_live_param_drag_has_no_rendered_agent` — **BLOCKS DESK A's S8**
Source: findings_c F-C1 (confirmed on all four links by founder-proxy) = findings_a A-2.
**Same defect, filed independently by two desks — one row.**

`rbrApplyVisibility` decides pad visibility from the **authored** per-state config
(`:50626–50631`) and its sole call site is `applyRigidBodyRotationState` (`:50559`). A live
`tau_brake` drag goes through `rbrApplyParam` (`:50079–50088`), which sets `eng.tau` and
`eng.brakeOnMs` but never `padEngageMs` and never re-runs visibility. So a sandbox authored with
entry `tau_brake = 0` — the natural authoring, and exactly what
`conservation_of_angular_momentum` S8 does — applies real external torque with **no rendered
agent**. Recompute `padOn` from live `eng.tau`; engage/release on the 0-crossing with travel.

### E9 · `rbr_camera_pose_is_not_authorable` — **BLOCKS DESK C's #3**
Source: findings_c F-C4 (P1, on a **founder ruling**) + C8.

`spherical.phi = 1.16` is hardcoded in the scene builder (`:50476`); there is no camera field
anywhere in the rbr config (`:978–1060`) and `applyRigidBodyRotationState` never touches the
camera. φ = 1.16 rad = 23.5° elevation ⇒ a horizontal circle projects at **0.399 aspect**.
Concept #3 needs near-top-down (its atomic claim is that points trace *circles*; at 0.40 the
narration says "circle" while the screen shows an ellipse — Rules 41 and 24 break together, and
S1's chord gauges swing 1.0×→0.40× twice per revolution against constant numeric labels, a live
Rule 33d violation). Concept #9 needs the oblique pose that exists. **Desk C owns both, so one
fixed pose is provably wrong.**
**Do NOT nudge the default.** The comment at `:50469–50474` records that the pose was *solved*,
sweeping radius and elevation together, citing the scar
`camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed`. Add the
surface; every authored pose inherits the per-state framing obligation. Bound by Rule 32d (a pose
change is a declared move, never a teleport), Rule 36 + byte-stable frozen frames (closed form of
state-local t, or settled before the pin), Rule 29 (a pose change is not emphasis).
**Per the founder ruling both Desk C skeletons are designed ASSUMING this lands.** If it is
declined, `rigid_body_rotation` is not authorable as designed.

---

## §C — IN SCOPE but NOT dispatched yet (ranked, un-started)

These are real Desk-E rows that did not make the nine. They are frozen here so they are not
rediscovered, and they are **not** silently dropped.

| Row | Source | Why deferred |
|---|---|---|
| **C-1 · `point_markers[]` + traces + swept arc + chord gauge + `r_point`** (C1/C3/C4/C5/C6 + D§3 + D§4) | c, d | The single largest family in the merge — markers, per-marker tangential `v = ωr` arrows with a dedicated true-zero linear map, progressive circular traces, a fixed base-frame ray, a chord gauge that is **not** `show_r_line`, and a new `r_point` control with ramp/sweep plumbing. **This is 2–3 dispatches on its own**, not one. It blocks Desk C's #3 and Desk D's #4. It is the honest reason the count cannot be five. |
| **C-2 · `phases[].hold_glow`** (A-1, amended) | a | Scope it to exactly the unreachable list — `KE_bar`, `KE_tick`, `predicted_omega_chip`, `formula_surface`, per-sentence readout rows. `phases[]` already reaches every scene mesh. Do not over-build a general channel. |
| **C-3 · `glowTargets[0]` fallback in the rbr glow pass** (F-C5) | c | Parity with `force_rig` (`:49002–49003`). `tts_sentences[].glow` is a silent no-op on every rbr state. Tagged ride-along by Desk C — `phases[]` is a working substitute. **No back-compat constraint: no concept JSON consuming rbr exists on any branch** (Desk C verified and withdrew its earlier contrary claim). |
| **C-4 · `masses.r_m` dead at t = 0 in ramped/swept states** (A-3 + A-9) | a | `rbrRAt(0)` returns `ramp.from` (`:50538`) / `sweep.lo` (`:49859`), never `masses.r_m`. Engine question for Desk E: should `range` be order-sensitive at all, or should `masses.r_m` win at t = 0? Cost Desk A a wrong-L explore state. |
| **C-5 · latched match cue under a time pin** (A-6) | a | `eng.matched[mid]` (`:50276`) clears only at state apply (`:50512`), so a rewind never clears it — the co-glow reads "landed" at t = 0. Regresses OPEN scar `hysteretic_state_cannot_be_latched_under_a_time_pin`. THE EYE **structurally cannot verify** the beat S3 exists to deliver. |
| **C-6 · pull-arrow camouflage at the cause beat** (A-12, mechanism corrected) | a | **Not the min-length floor** — `rbrArrowLen(3.60) = 0.252` is above the 0.16 floor. It is colour+depth camouflage against the rod's own 0.20 tip overhang, and `F = mω²r` makes the arrow smallest exactly when it must be seen. |
| **C-7 · no `at_ms` reveal for pull arrows** (A-7) | a | `rbr_pull_arrow: rb.show_pull_arrows` (`:50609`) is boolean-only; S2's "arrows *appear*" beat is not expressible. |
| **C-8 · `min_ring` on rbr `controls_visible`** (A-8) | a | `bonding_scene` already implements `{ id, min_ring }` (`:55484–55492`); rbr's token is a bare string union (`:1051`). The pattern exists — cheap. Nothing breaks today, but the ring-gated explore claim must not be sealed as satisfied at Checkpoint C. |
| **C-9 · sparse slider panel renders full height** (A-5) | a | Confirmed regression of an OPEN scar. Carries a **tension**, not just a fix: skeleton E8 mandates `visibility:hidden` for row-position stability, which is exactly what preserves the height. The surgeon must satisfy both. |
| **C-10 · label defects** (A-10, A-13, A-17) | a | `rbrMakeLabel("R_drum", …)` (`:50340`) is an ASCII identifier on canvas (Rules 34c/41; physics block rules every reader-facing string says "turntable"); "R_drum"/"brake" collide during S5's pad window (scar `field3d_label_sprite_overlap` — the pad label needs to join the decollision set); S4's tick caption clips off-canvas (recurrence of the **FIXED** `graph_marker_label_clipped` — apply that row's existing rule, do not mint a class). |
| **C-11 · C7 free-flight decomposition** | c | #2's union row; #3 only *consumes* it (advanced ring, cleanly cuttable). Lowest priority in the merge. |

**Registration rider (C9) applies to every row above and every dispatch in §B:** `deriveStateMeta`
co-edit (`F3D_REVEAL_KEYS` / `maxRevealForField3dState` / `deriveHoldExpectations`, both config
shapes) + `RBR_ELEMENT_TYPES` + the overlay flags map (`:50586–50613`, overlays default OFF) + no
backticks + `check:renderer-syntax`. **Every new field optional; absent = byte-identical;
presence by `typeof`/`in`, never truthiness.**

---

## §D — NOT Desk E's, and NOT to be built

**Verified-already-exists — do not build (Rule 40a):**
1. **`rbr_drum_marker`** (`:50322–50327`, `RBR_ALWAYS_ON` `:50585`) — the rotating body's angular
   mark. Both Desk D §3 and Desk C C4 nearly re-specified it. `deriveStateMeta.ts:496–508`
   already reasons about it as the thing THE EYE watches move. **§B-E9/C-1 need only the FIXED
   base-frame ray — one ray, not two.**
2. **The `deriveMotionExpectations` rbr branch** — `deriveStateMeta.ts:496`. D4 **amends** it.
3. **`formula_lines`** (`:1644`) — port it; do not invent `formula_at_ms` (§B-D1).
4. **`theta0_rad` is fully wired**, not inert — `:50499` → `rbrThetaReset` `:49967` → `_th`
   `:49970` → `rbrThetaAt` `:49958`, driving the mesh at `:50666`. Independently confirmed three
   times: this desk's own pre-freeze pass, findings_c PASS 7, and findings_c PASS 8 finding 2.
   **Three source comments are wrong and are corrected in D4:** renderer `:953`, renderer `:998`,
   and `APPARATUS_CONTRACT.md:70`.
5. **Desk C withdrew C2** (tangential `v = ωr`) — but *only the ownership claim*. The row is
   **still wanted, by #4 `rotational_kinematics` alone** (founder ruling, master `2443a74`).
   Recorded so it is neither double-built nor dropped as retracted.
6. **F-C7 is superseded by F-C8** — do not fix the material without the geometry.

**Not Desk E — routed elsewhere:**

| Item | Source | Owner |
|---|---|---|
| `theta0_rad` mislabel in `APPARATUS_CONTRACT.md:70` + a both-directions re-verify of the whole declared-inert list | c PASS 7 | **Office** (contract §4 forbids a desk changing it) |
| `masses.r_m` missing from `APPARATUS_CONTRACT.md` §1 (engine fallback is 0.90, home pose is 0.80) | a A-3 | **Office** |
| θ/α **units and dp** — rad vs degrees vs revolutions; must be identical across all six turntable concepts | d §5 | **Office**, alongside the contract — Desk D explicitly declined to rule |
| Schema cannot express "explore state, zero authored narration" | a A-15 | **Office, on master** — `conceptJson.ts` is a Rule-40 platform file |
| `chapter` / `section` numbering for the rotmech set | a A-4 | **Office** — all eight concepts must agree |
| Two OPEN scars give contradictory instructions on narration glow | a A-14 | **Founder ruling**, not an engine fix |
| Does the 0c-2 two-timed-class fence bind 0c-1? Desk C's #3 adds 2 new timed classes on rbr | c PASS 5 | **Office** |
| `controls_visible` has no `'shape'` token; `rolling_on_incline` S8's "marble vs huge ring" walk is unachievable by any authoring | b | **Chapter-level decision** — never bought by a union item |
| `visual_eyes.ts` should refuse a green summary when the motion map is entirely `?` | c PASS 14 | **Office** (platform tooling) |
| Desk-local findings files are invisible to the standard pre-walk `engine_bug_queue` query | c PASS 13 | **Office** — process, real, unresolved |

---

## §E — What it would take to reach "4–5 dispatches"

Stated so the trade is the office's to make, not mine:

- **E1 + E2 + E3 + E4 + E5** is five, and it unblocks Desk A's Checkpoint B, Desk B's two JSONs,
  and Desk D's two concepts.
- It leaves **Desk C entirely blocked** — `angular_momentum` holds on E7 (F-C8, CRITICAL) and E6
  (F-C6, CRITICAL); `rigid_body_rotation` holds on E9 (camera, founder-ruled) and the whole C-1
  marker family.
- **E6 and E7 are the two the office sequence omitted**, and both are CRITICAL against a concept
  that is *already authored and validating*. They are not deferrable without telling Desk C its
  concept is parked.

**Recommendation: run all nine.** D1 first regardless — it is the smallest, it is a port of an
existing mechanism rather than a new build, and it unblocks a desk that is otherwise finished.

---

## §F — Verification standard for this build

Full chain after **every** dispatch:

```
npm run check:renderer-syntax
npx tsc --noEmit
npm run validate:concepts
```
then re-seed + `visual:eyes` on **both** canaries (`newton_second_law`, `coulombs_law`).
**An H2 diff I cannot explain is a FAIL, not a re-baseline.**

> **Verification-integrity pass, run before the first dispatch (from findings_c PASS 14).** Both
> canary seed scripts wrote `physics_config: { epic_l_path }` with `field_3d_config` **absent**,
> starving `deriveMotionExpectations`. Fixed in `_seed_newton_second_law_cache.ts` and
> `_seed_coulombs_law_cache.ts`; verified in the DB (`field_3d_config.states` = 4 and 8).
>
> **But the fix does NOT restore D5 on these two canaries, and PASS 14's advice over-generalises.**
> Measured after re-seeding: `coulombs_law` still reports `Motion map: STATE_1=? … STATE_8=?`.
> The cause is not the seed — it is that **neither canary's scenario has a motion branch at all**.
> `deriveStateMeta.ts:2880` states the `newtons_laws_body` omission is deliberate ("nothing is
> asserted about a repeating state's pixels … **Nothing to fix in either derivation**"), and
> `coulombs_law_force` has no branch either. PASS 14's defect is real but **specific to
> `rigid_body_rotation`**, which does have a branch (`:496`) that was being starved.
> The seed fix is kept — it feeds the correct input and costs nothing — but it buys no D5 here.
>
> **Standing limits on this build's regression evidence, stated so no dispatch over-claims:**
> 1. **D5 does not run on either canary, by design.** Coverage is the H1/H2 baseline diffs and the
>    other 26 (nsl) / 50 (coulombs_law) deterministic checks. Read the `Motion map:` line every
>    run; `?` means D5 abstained, not that motion was verified.
> 2. **Neither canary exercises `rbr` at all** (`newtons_laws_body` and `coulombs_law_force`).
>    So for the six rbr dispatches (E4–E9) the canaries prove only **no collateral damage outside
>    rbr** — they cannot prove the rbr change is correct.
> 3. **No rbr concept JSON exists on master or on this desk**, and guardrail 3 forbids seeding
>    another desk's concept. **There is therefore no way for this desk to EYE an rbr change.**
>    That is a structural hole in the verify chain for two thirds of the frozen scope, and it is
>    an office decision to close — see the report accompanying this freeze.
