# 0c-3 — FROZEN SCOPE

**Frozen 2026-08-05 by Desk E (`feat/rotmech-0c3`), the sole engine owner for the Phase-0d run.**

Merged from five inputs: `findings_d.md` (§8, the nominated freeze source), `findings_c.md`
(PASS 1–15), `findings_a.md` (A-1…A-17), `findings_b.md` (B-1/B-2 — a **different subsystem**),
and this desk's own original six-item table in `rotmech_0c3_state.md`.

**Deduplicated and verified.** Every row below was checked against the code in this checkout
before being written down; rows that a findings file asserted but the code contradicts are
recorded in §D. Nothing here is copied on trust.

---

## §0 — FOUNDER RULINGS, 2026-08-06. These bind every remaining dispatch.

**1 · Units CONFIRMED — Desk E's ruling stands.** θ **rad** · α **rad/s²** · τ **N·m** · W **J**,
all **dp 2**, and every `reference_marks.value` authored in **SI** (θ in radians), never in display
units. Rationale upheld: **τ = Iα holds only in radians**, so a degrees θ beside a rad/s² α would
be internally incoherent on the same HUD in the concept whose atomic claim *is* τ = Iα.
`RBR_THETA_DISPLAY` stays a single flip point, but the flip is **not** taken. Fleet-wide, no
per-concept override (`APPARATUS_CONTRACT.md` §3).

**2 · The two-timed-class fence is NON-CUMULATIVE and binds 0c-2 ONLY.** Desk C raised (PASS 5)
whether the 0c-2 founder-signed fence — *the timed surface is exactly two field classes, and needing
a third is the Phase-0 alarm* — also bound 0c-1/rbr, which would have made `rigid_body_rotation`'s
two new timed classes (C1 marker label cues, the C4 compare family) an alarm rather than a build.
**It does not. The fence is per-build, not cumulative across builds.**
**`rigid_body_rotation`'s sealed design is NOT invalidated** and its named-but-not-taken fallback
stays untaken. → **Told to Desk C in `ENGINE_LANDING_NOTICE.md`.**

**3 · findings_d §4b ACCEPTED INTO SCOPE as BLOCKING — the drive torque has no rendered actuator.**
The brake pad travels (park → contact) on `pad_travel_ms`, but that whole path is gated on the
`rbr_brake_pad` mesh and on `eng.padEngageMs`, which is assigned **only inside the `brake` branch**.
A drive sets its windows and leaves `padEngageMs` null, so the actuator never travels — **and there
is no drive-wheel mesh at all.** Cost measured by the founder: the **Rule-32a cause beat on 11 of 17
states** across Desk D's two concepts. Rule 24 / §10(d) — *no stated agent without a rendered
object* — so a torque that spins the turntable with nothing visibly doing it is a rendered lie.
**The ask includes a PER-ENTRY travel field on `sources[]`**: `pad_travel_ms` is **singular and
top-level** and therefore cannot address a list, which E4 made `sources[]` into. One actuator mesh
with the rim force arrow layered on it — Desk D's two skeletons forked here (floating tangential
arrow vs motor wheel that translates in) and the reconciled ask is ONE mesh.
**Filed as E10** (§B). **This is the SEVENTH capability and it is being ADDED, not absorbed** — it
is recorded here as a scope growth with a founder decision behind it, per the desk contract's
re-scope rule.

**4 · `rotational_kinematics`'s explore control is α, NOT τ.** A τ-labelled slider would put an
**untaught term** in the sandbox of a concept whose **Rule-25 compliance depends on never naming
torque** — it is taught before `torque` and `moment_of_inertia` exist. E5 already protects the
readout half (α is the finite difference of ω and needs no torque authoring); this ruling extends
the same discipline to the **control** half. **E10 must therefore expose the drive control to that
concept as α, not as `tau_applied`** — either an α-labelled control that resolves to τ = Iα
internally, or `tau_applied` suppressed for that concept with an α control in its place.
`tau_eq_i_alpha` is unaffected — τ is exactly what it teaches.

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

> **✅ E2 LANDED AND VERIFIED — 2026-08-05, commit `1a889bc`.** Routed a genuine v–ω mismatch
> into the **existing** `_slipping` / `nlbRollSeg` closed-form capture rather than writing new
> capture code. Three measured prerequisites landed with it, each reported rather than buried:
> a crossing prediction (the 0.01 m/s band is narrower than one step of contact closure — **76 of
> 126** grid cells never captured on a band test alone), a capture that snaps ω to `v/R` (anchoring
> at the pre-capture ω leaves a **permanent 0.0087 m/s** residual, since `α = a/R` keeps `v` and
> `ωR` parallel), and a seed-safe ω read (`b.omega` is 0 at apply while `b.omega0` holds the seed).
> Measured: capture at **1366.7 ms** vs analytic `t_c` **1360.5 ms** (one step); post-capture
> `max|contact|` and `max|f|` both exactly 0; holds across four dt schedules; rewind bit-for-bit.
> Back-compat by explicit A/B over **26 body-states × 300 frames on both clocks: 25 identical, 1
> differing — `pure_rolling` STATE_7, the target.** `rolling_on_incline` **17 of 17 identical**,
> including its μ_s `param_ramp` slip state.
>
> > ### ⚠ CORRECTION 2026-08-06 — **do not read "17/17 identical" as evidence of health.**
> > Those 17 states were identical because `rolling_on_incline` was **entirely non-functional both
> > before and after E2** — a separate defect (E11) pinned every rolling body at v = 0. **E2 is
> > necessary but not sufficient: adding the kinematic precondition alone left every incline rolling
> > state exactly as dead as before**, and E2's own A/B could not have detected that, because it
> > drove the branch-selection logic and never asked whether `b.v` advanced.
> > E2 is **not wrong** — the kinematic gate is real and still required for the flat-track capture —
> > but its blast-radius claim licensed only *"this change did not alter those states"*, never
> > *"those states work"*. Fixed by **E11** (`!rollHeld` on the rest clamp); all 8 states now live.
> > General class filed as `byte_identical_ab_against_a_dead_baseline_reads_as_proof_of_correctness`
> > (CRITICAL, directive) — see §F for the standing verify-chain change.
> Verified by this desk: renderer-syntax OK, tsc 0, validate 149 PASS / 0 FAIL,
> `newton_second_law` 26/26 with H2 **identical to the digit**, `coulombs_law` 50/50 at H2 0.00%.

> **✅ E3 LANDED AND VERIFIED — 2026-08-05, commit `c2b9aeb`.** See the E3 section below for the
> defect. Back-compat by explicit A/B against the pre-change **emitted** code: **11 concepts, 58
> states, 94 bodies, 0 differing**. Verified by this desk: renderer-syntax OK, tsc 0, validate
> 149 PASS / 0 FAIL, `newton_second_law` 26/26, `coulombs_law` 50/50 — H2 identical to the digit
> on both canaries across all three dispatches.
> **Two build-time geometry defects were fixed as prerequisites** (not separately): a SEAM-G
> `wheel` was DRAWN at the constant `NLB_WHEEL_R` while its `_liftY`/`_spinR` already used
> `radius_m` — so a wheel authoring `radius_m: 0.25` stood on a 0.25 m axle while drawn at 0.55 m,
> **sunk through the track before any slider existed**; and state apply never re-resolved drawn
> radius. Without the first, the initial `R` touch would snap the wheel; without the second, a
> drag would leak size into the next state. Both are no-ops on master (no committed concept
> authors `radius_m` — grepped, not assumed).

> ### ⚠ DESK B — ENGINE UNBLOCKED, BUT ONE AUTHORING DEFECT REMAINS. Read before re-walking.
> E2 + E3 close both engine blockers. **`pure_rolling` STATE_7 will still read as broken**, and
> the cause is authoring, not engine: it authors `initial_position_m: 2.4` on a
> `surface.length_m: 3` track (bounds ±3) while travelling in **+s**, leaving **0.6 m** of track.
> The wheel hits the bound at **~309 ms**, long before the capture at `t_c` = 1361 ms — probed
> with the authored numbers: `t=500 roll=0 v=0.0000 Rw=0.1307`, dead at the wall with spin barely
> started. Every state of both concepts authors `s0 = 2.4`, which is correct on the **incline**
> (gravity drives −s, so 2.4 is the top) but backwards on the **flat** states, where motion is +s.
> `pure_rolling` S1/S2/S3/S6/S7/S8 all launch forward from 2.4.
> **Fix is `s0 = −2.4` or a longer `length_m`. Owner: `alex:json_author` on Desk B — not Desk E.**
> Related, same desk: STATE_7 pins at 1500 ms while its only phase window closes at
> `until_ms: 1361`, so the frozen frame is taken after the focal is handed back
> (`eye_frozen_candidate_offset_falls_outside_engine_display_band`). Authoring-side — extend the
> window past capture or add a second phase ≥ 1500 ms. A `deriveStateMeta` change would move the
> pin for the whole nlb fleet and is deliberately NOT taken.

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

> ### ✅ E7 ACCEPTED — founder ruling 2026-08-06. The FOURTH FLOOR IS AMENDED; the other three stand.
>
> **The implementation is correct. The fourth acceptance floor was mis-specified.**
>
> **AMENDED — floor 4 is measured on WORLD length, intercept < 1 px:**
> `len(L=6.51)/len(L=1.14) = 5.71 ± 0.10` **in world units**. **Already proven and passing:**
> 0.228 / 0.918 / 1.302 world units for L = 1.14 / 4.59 / 6.51 → **5.7105 against a true 5.7105,
> intercept 0.**
>
> **Why the pixel form was unsatisfiable, not merely inconvenient:** a pixel-length ratio cannot
> equal a world-length ratio under a perspective camera unless both vectors sit **equidistant from
> the camera and parallel to the image plane** — which these do not, since the arrow points along
> the camera-up axis so the longer arrow's tip sits nearer the camera (gain up to 1.157× across its
> span). The 6.13 reading is **foreshortening behaving correctly, not an arrow defect.** A cone also
> projects width as well as length, so a bbox reading carries a head-radius intercept unrelated to
> magnitude.
>
> **The other three floors REMAIN PIXEL MEASUREMENTS and are not amended** — ink, contrast and flip
> magnitude are genuinely screen properties, and all three passed with room:
> **ink 15 px → 1579 px** (floor 400) · **contrast 4.36:1** (floor 3:1) · **S4 flip 5341 px**
> (floor 300).
>
> **Desk C: the amendment request is CLOSED — stop carrying it.** The generalisable lesson now has
> two instances: the contract correction demoted pixel *luminance* (F-C7's probe would have passed
> on an invisible arrow), and this demotes pixel *length*. **Assert the physical quantity; use
> pixels only for properties that are genuinely of the screen.**
>
> Still open and separate from acceptance: the **negative-L branch is occluded by the drum disc**
> it passes through (a different object from the collinear line E7's `bug_class` covers). Strictly
> better than before — it was entirely absent — and it clears the S4 floor at 5341 px. Desk C to
> measure the negative branch's own absolute ink and route separately.

Original floors, for the record (findings_c PASS 15; confirmed identical across `founder_proxy_B.md`
§6 and this document at PASS 16 — no reconciliation was needed): S1 ink ≥ 400 px; `5.71 ± 0.10`
fitted **in pixels** with intercept < 1 px; arrow-vs-axle contrast ≥ 3:1; S4 flip ≥ 300 px.
**Floor 4's pixel basis is superseded by the ruling above.**

> ### ⚠ CORRECTION 2026-08-06 — **E7 HAS a back-compat surface. My own §C C-3 premise was wrong.**
> Filed by Desk C (PASS 16) as E7's named verifier; **I re-verified it in this checkout before
> recording it.**
>
> §C C-3 claimed *"no concept JSON consuming rbr exists on any branch."* **False.**
> `src/data/concepts/angular_momentum.json` on `origin/feat/rotmech-c` (commit `7877393`,
> **2026-08-05 01:31:12 +0200**) carries `"scenario_type": "rigid_body_rotation"` at `:588`. This
> document was last written at `6c5ed6d`, 14:06 the same day — **the JSON preceded it by ~12½
> hours. Not a race; a stale premise, and mine.**
>
> What Desk C actually withdrew earlier was narrower — it concerned
> `conservation_of_angular_momentum`'s "already-approved states" (Desk A's concept, which genuinely
> has no JSON anywhere). I generalised that to *no rbr JSON anywhere*, and the generalisation was
> false.
>
> **E7 rebuilds the exact primitive this JSON consumes**, so the registration rider's
> **"absent = byte-identical"** clause can no longer be discharged against an empty consumer set.
> Committed authoring E7 must not regress:
>
> | `angular_momentum.json` | Field | Surface |
> |---|---|---|
> | `:628` `:671` `:759` `:790` | `show_l_arrow: true` (4 states) | the arrow renders wherever asked |
> | `:718` | `show_l_arrow: false` | S3 stays clean |
> | `:641` | `phases[]` → `glow_focal: rbr_l_arrow` @ 15200 ms | S1 focal handoff |
> | `:684` | `phases[]` → `glow_focal: rbr_l_arrow` @ 12600 ms | S2 focal handoff |
> | `:766` | state-level `glow_focal: rbr_l_arrow` | **S4 — where the ≥ 300 px flip criterion is measured** |
>
> **This strengthens E7's verification rather than adding scope.** It is the first time an rbr A/B
> can be run against *real authored states* instead of asserted vacuously — which is exactly what
> §F asks for and what this desk correctly said it could not do itself (it will never seed an rbr
> concept). Desk C is the verifier and has the seed key.

> ### 🔨 RULING 2026-08-05 — **C-6 MERGES INTO E7.** E7 now has TWO consumers, one mechanism.
>
> Asked to rule on C-6 (pull-arrow camouflage, A-12), I checked the geometry in this checkout
> rather than reasoning from the findings text. **C-6 is not merely the same *class* as E7 — it is
> the same *scar*, on a second consumer:**
>
> - The pull arrow is **also a `THREE.ArrowHelper`** (`:50918`), so its shaft is also a zero-width
>   `THREE.Line`, exactly like the L arrow.
> - It is built with direction `(−side, 0, 0)` — **radial, i.e. collinear with the rod** — and the
>   rod is an opaque `CylinderGeometry(0.05, 0.05, 2·rod_half·W)` (`:50901`).
> - So both rbr arrows are `ArrowHelper`s whose zero-width shaft runs **collinear with an opaque
>   cylinder**: the L arrow inside the axle (r = 0.07), the pull arrow along the rod (r = 0.05).
>   That is verbatim the FIXED scar `field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line`.
>
> **A-12 called it "camouflage" — that is the SYMPTOM.** The mechanism is the shaft. Confirmed
> A-12's own correction while I was there: `RBR_ARROW_SCALE = 0.070`/N (`:50200`) gives
> `rbrArrowLen(3.60) = 0.252`, comfortably above `RBR_ARROW_MIN_LEN = 0.16` (`:50205`) — **so
> tuning the floor is the wrong fix**, exactly as A-12 says.
>
> **Consequence for the E7 dispatch:**
> 1. Widen the `bug_class` to `rbr_arrowhelper_shafts_not_separable_from_the_apparatus_they_run_along`,
>    naming **both** consumers. Still ONE `bug_class`, so Amendment 4 holds — this is one mechanism
>    at the right altitude, not two rows smuggled into one dispatch.
> 2. **One mesh-cylinder shaft mechanism, two consumers.** Same argument findings_d §4 made for the
>    tangential vector: price one mechanism with two consumers, never two mechanisms.
> 3. **The two magnitude→length maps must NOT be shared** — F in newtons (`rbrArrowLen`, knee +
>    asymptote, `:50239`) versus L in kg·m²/s (`RBR_L_ARROW_SCALE`, currently a raw clamp). Same
>    caution findings_d §4 raised for m/s vs N. Separability is shared; scaling is not.
> 4. Separability ratios go **in the constants** for both, and the **drawn-geometry** probe runs on
>    both. The pull arrow's absolute floor is measured at its **worst** instant — the S2 cause beat,
>    r = 0.80, F ≈ 3.60 N — because `F = mω²r` with `ω ∝ 1/I` makes the arrow **smallest exactly
>    when it must be seen**, and largest after the slide is over.
>
> **Cost of the ruling, stated:** E7 grows. If it approaches the ~100-call ceiling the surgeon
> **splits and hands off, L arrow first** — it is the one blocking Desk C (`angular_momentum`
> holds for it), whereas the pull arrow degrades a beat on Desk A's already-authored concept.
> **Rejected alternative:** a separate C-6 dispatch would mean a second ~100-call entry into the
> same code region to apply the same prevention rule to the same primitive — the cost here is
> entering the region, not the lines changed.

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

### E10 · `rbr_drive_torque_has_no_rendered_actuator` — **BLOCKS DESK D (both concepts)**
**ADDED 2026-08-06 by founder ruling 3 (§0). Source: findings_d §4b, previously ranked MEDIUM and
NOT filed as blocking by this desk. The founder overruled that and accepted it as BLOCKING.**

**This is the SEVENTH capability. It is reported as scope growth, not absorbed** — per the desk
contract, a seventh capability appearing mid-build is a re-scope signal. The signal is recorded and
the founder took the decision; the count is now **ten dispatches, not nine.**

The brake pad travels park-pose → contact-pose on `pad_travel_ms`, but the whole travel block is
gated on the `rbr_brake_pad` mesh and driven by `eng.padEngageMs`, which is assigned **only inside
the `brake` branch**. A drive sets its engage/release windows and leaves `padEngageMs` null, so the
actuator never travels — **and no drive-wheel mesh exists at all.**

**Cost, measured by the founder: the Rule-32a cause beat is lost on 11 of 17 states across Desk D's
two concepts.** Rule 24 / §10(d) — *no stated agent without a rendered object*. A torque that spins
the turntable with nothing visibly doing it is a rendered lie, and Rule 32a requires the cause to
move **before** the effect.

Build notes, decided:
- **A PER-ENTRY travel field on `sources[]`.** `pad_travel_ms` is **singular and top-level** and
  therefore cannot address a list — E4 turned the single torque source into `sources[]`, so the
  travel timing must move onto the entry. This is the concrete reason E10 could not simply reuse
  the pad path.
- **ONE actuator mesh, with the rim force arrow layered on it.** Desk D's two skeletons forked here
  (a floating tangential arrow vs a motor wheel that translates in); the reconciled ask is one mesh.
- **Lift the travel logic off the `rbr_brake_pad` mesh** onto whichever actuator the state's torque
  source names, rather than duplicating it.
- **Ruling 4 binds this row:** `rotational_kinematics` must get its drive control as **α, not τ** —
  either an α-labelled control resolving to τ = Iα internally, or `tau_applied` suppressed for that
  concept with an α control in its place. Naming torque in that sandbox breaks its Rule-25
  compliance. `tau_eq_i_alpha` is unaffected.
- E8 (`rbr_live_param_drag_has_no_rendered_agent`) is the **brake** half of the same "no rendered
  agent" family. Sequence E10 and E8 adjacently; keep them separate `bug_class`es (different
  branch, different mesh, different trigger) unless the surgeon finds one mechanism serves both.

### E11 · `nlb_rest_guard_pins_any_body_released_from_rest_that_can_roll` — **CRITICAL · BLOCKS DESK B ENTIRELY · NEXT DISPATCH**
**Added 2026-08-06 from Desk B's `findings_b.md` B-3 (revised), verified by RUNTIME — the opposite
provenance to B-1/B-2, which is exactly why it outranks them.**

**`rolling_on_incline` is entirely non-functional — not one of its 8 states renders its physics.**
`STATE_8` (the Rule-37 sandbox, guaranteed to run continuously) is **one MD5 across 10.5 s**:
`t=0`, `t=5000`, `t=10000` and the frozen pin are **byte-identical**. Negative control passes:
STATE_7's `param_ramp` produces a different hash at every timestamp, so the harness sees change
when there is any.

#### ⚠ This supersedes E2's blast-radius claim, and E2's evidence was measuring a corpse
E2 (`1a889bc`, shipped) reported *"`rolling_on_incline` 17/17 identical"* as proof of nil blast
radius. **Those 17 states were identical because they were dead before AND after.** A
byte-identical A/B against a broken baseline proves non-regression, not correctness — and nothing
in E2's probe could have distinguished the two, because it drove the branch logic and never asked
whether `b.v` advanced. Desk B states it plainly: **"B-1 must not be closed by a fix that only
adds the kinematic precondition. That fix, alone, would leave every incline rolling state exactly
as dead as it is now."** E2 is **necessary but not sufficient**; it is not wrong, and it is not
the whole story.

#### Desk B's isolation of the defect — force model CORRECT, transport BROKEN
- **S6** (held → released at `activate_at_ms: 2500`): before, `a = 0.00, f_s = 4.14 N` — exactly
  `mg sin 25°`. After, `a = −2.76, f = 1.38 N` — exactly `g sin θ/(1+k)` for a disc and `k·m·a`.
  **The release fires on schedule with correct magnitudes, and the mesh is pixel-identical either
  side of it.**
- **S3 positive control, same frame, same instant:** a `rotation_locked` block beside a `rolling`
  disc. The **block** integrates correctly (`contact` 0.09 → 2.88 → 4.18, tracking
  `a = g(sinθ − μ_k cosθ) = 2.809`). Only the `rolling` disc stays frozen at `contact = 0.00`.
- **The split falls exactly along "reads from persistent state" (`v`, `ω`, `Rω`, `contact`,
  `KE_*` — all frozen at seed) vs "computed from a formula" (`a`, `f` — all correct).**
- **REFUTED, do not re-derive:** excess static friction holding the bodies `stuck`. S6's release
  and S7's μ_s ramp both drive the body out of the static regime with correct post-slip numbers,
  and neither moves.

> ### ✅ E11 RESOLVED 2026-08-06 — ONE LINE. **The re-scope below was WRONG; I am striking it.**
>
> **`if (!rollHeld && nlbSgn(v0) !== nlbSgn(v1) && Math.abs(drive) <= maxStat) { v1 = 0; a = 0; }`**
> — one added term at `:47369`. **All 8 `rolling_on_incline` states are live.**
>
> **The original hypothesis was right and my refutation of it was wrong.** The re-scope below rests
> on Desk B's claim that S7 does not move. **S7 does move — from t = 688 ms.** The surgeon drove the
> real emitted renderer over the real authored config and caught it.
>
> **The signature is conclusive.** S7 releases on the exact frame `maxStat` crosses below `drive`:
> `maxStat = μ_s·N` and `drive = mg sin θ`, so the crossing is `μ_s = tan θ` = **0.466308**, and the
> measured release is at **μ_s = 0.466308**. `|drive| ≤ maxStat` is the only expression in the file
> with that threshold. It releases with `a = −2.0708 = g sinθ/(1+k)` for a ring — the **rolling**
> value, not the kinetic −3.6976 — so the rolling branch was computing correctly the whole time and
> only the clamp suppressed it. Every other state authors μ_s 0.50 or 0.90, both above tan 25°, so
> the guard was permanently armed; S7 escaped only because its `param_ramp` walks μ_s under tan θ.
>
> **Why the guard is wrong here, physically:** it asks the *sliding* question `μ_s ≥ tan θ` — right
> for a block. A rolling body's static gate is the strictly weaker `μ_s ≥ (k/(1+k))·tan θ`, which
> the rolling branch had **already evaluated and passed** (`canRoll`). The clamp asked the block
> question a second time and overruled the rolling branch's own answer. There is no rolling case it
> can be right about: a body released from rest on any θ > 0 either rolls or slips, never stays put.
>
> **My error, recorded because it is the more useful half.** I verified the *arithmetic* of my
> hypothesis and then accepted the *observation* that appeared to refute it without testing it —
> from a findings file whose own negative control contradicted it in the same section (Desk B
> reported S7's hashes differ at every timestamp **and** "the mesh is pixel-identical throughout";
> both cannot be true). **A sibling desk's runtime claim needs the same scepticism as an agent's.**
> Desk B's prose reading was wrong; its MD5 data was right.
>
> **E11a and E11b therefore collapse into one line, and E11b as a general class remains open but is
> no longer blocking:** a **non-rolling** body launched from rest with `|drive| ≤ μ_s·N` is still
> clamped, and whether `nlbSgn(0) = 0` should make that fire on frame 1 is a genuinely separate,
> fleet-wide question about blocks and carts. Nothing needs it to make S6 move — S6 moves at
> t = 2512 ms.
>
> <details><summary>Struck — the two-class re-scope, kept for the record</summary>
>
> ### ~~RE-SCOPE 2026-08-06, BEFORE DISPATCH — E11 SPLITS INTO TWO CLASSES. The falsifier fired.~~
>
> The founder's decision tree said: if the guard genuinely releases and the body still does not
> move, a second mechanism exists — an Amendment 4 re-scope signal, to be taken **before** the
> dispatch rather than 80 calls into it. **I resolved the falsifier from code + arithmetic rather
> than waiting on Desk B, and it fired.**
>
> **The resolution.** `nlbRunParamRamp` (`:43416`) calls `nlbApplyParam(tok, v)`, and the
> `mu_s` branch (`:43088–43098`) writes `b.mu_s` on **every non-ghost, non-hanging body**. So at
> S7's ramp end μ_s genuinely reaches 0.05 — the ramp is not stale, not scoped away, not
> churn-guarded out. Therefore:
>
> | quantity at S7 ramp end | value |
> |---|---|
> | `maxStat = μ_s·N` | **0.444 N** |
> | `drive = mg sin 25°` | **4.142 N** |
> | `a` (kinetic branch, `canRoll` now false) | **3.70** — Desk B independently measured **−3.70** |
> | `|drive| ≤ maxStat` | **FALSE** |
> | **rest guard fires?** | **NO** |
> | `v1` | **0.0616** → the body **should move** |
>
> **Desk B's runtime says it does not move.** So the rest guard is *not* what pins S7, and a
> **second, independent mechanism** prevents computed motion from reaching persistent state.
>
> **Split, and the order matters:**
> - **E11a · `nlb_computed_motion_never_reaches_persistent_body_state` — TRANSPORT. TAKE THIS
>   FIRST.** S7 is the clean instance: the guard released, `a` is correct to the decimal, and the
>   body is still frozen. Desk B's positive control isolates it further — a `rotation_locked` block
>   integrates correctly beside a frozen `rolling` disc in the same state at the same instant, and
>   the readout split falls exactly along *reads persistent state* (frozen) vs *computed from a
>   formula* (correct).
> - **E11b · `nlb_rest_guard_pins_a_body_released_from_rest_that_can_roll` — the guard.** Real,
>   arithmetic-confirmed for the μ_s = 0.5 guided states (S6 and friends), but **secondary**: if
>   transport is broken, fixing the guard alone changes nothing on screen. **That is E2's lesson
>   repeating, and taking the guard first would repeat it a second time.**
>
> Both retain the same acceptance: **RUNTIME, never a probe.**

</details>

#### 🔬 The hypothesis — CONFIRMED as the whole defect, not a partial one.

The rest guard immediately after the branch selection (`field_3d_renderer.ts:47337`):
```js
var v0 = b.v;
var v1 = v0 + a * hPhys;
if (nlbSgn(v0) !== nlbSgn(v1) && Math.abs(drive) <= maxStat) { v1 = 0; a = 0; }
```
`nlbSgn(0) === 0` (`:46293`). For **any body released from rest**, `v0 = 0` ⇒ `nlbSgn(v0) = 0`
while `nlbSgn(v1) = ±1`, so **the sign test is ALWAYS true on the first step**. The guard then
fires whenever `|drive| ≤ maxStat` — and for a body that *can roll*, having enough static friction
is precisely what `canRoll` asserts. So the guard pins it at `v = 0`, `a = 0` **every frame,
forever**, and `v0` stays 0 so the condition never stops holding.

Reproduced against Desk B's own measured state (m = 1, θ = 25°, k = 0.5, disc):
`drive = mg sin 25° = 4.142 N` (Desk B measured `f_s = 4.14`) · `aRoll = 2.76` (Desk B measured
`a = −2.76`) · at **μ_s = 0.5**, `maxStat = 4.44` ⇒ `drive ≤ maxStat` ⇒ **guard fires** ⇒ dead.

It also explains the flat/incline split with no second defect: `pure_rolling`'s working states are
**launched with v₀ ≠ 0**, so `nlbSgn(v0) = ±1 = nlbSgn(v1)` and the guard never fires.

**Its own falsifier — test this before anything else.** At S7's ramp end (μ_s = 0.05) `maxStat`
falls to 0.44 < drive 4.142, so the guard should **stop** firing and the body should move. **Desk B
reports S7 does not move.** So either a second mechanism pins S7, or this hypothesis is incomplete.
That discriminator is the cheapest first experiment in the dispatch.

**Fix shape (surgeon's call):** the guard is for *kinetic jitter across v = 0*, so it must not
treat "at rest and about to start" as "has come to rest" — e.g. require `v0 ≠ 0` before it can
arrest, or test the post-step contact rather than the sign flip. **Whatever the shape, the
acceptance is RUNTIME, not a probe:** Desk B must see distinct frame hashes across `STATE_8`'s
10.5 s. A byte-identical A/B is exactly what failed to catch this.

---

## §C — IN SCOPE but NOT dispatched yet (ranked, un-started)

These are real Desk-E rows that did not make the nine. They are frozen here so they are not
rediscovered, and they are **not** silently dropped.

| Row | Source | Why deferred |
|---|---|---|
| **C-1 · `point_markers[]` + traces + swept arc + chord gauge + `r_point`** (C1/C3/C4/C5/C6 + D§3 + D§4) | c, d | The single largest family in the merge — markers, per-marker tangential `v = ωr` arrows with a dedicated true-zero linear map, progressive circular traces, a fixed base-frame ray, a chord gauge that is **not** `show_r_line`, and a new `r_point` control with ramp/sweep plumbing. **This is 2–3 dispatches on its own**, not one. It blocks Desk C's #3 and Desk D's #4. It is the honest reason the count cannot be five. |
| **C-2 · `phases[].hold_glow`** (A-1, amended) | a | Scope it to exactly the unreachable list — `KE_bar`, `KE_tick`, `predicted_omega_chip`, `formula_surface`, per-sentence readout rows. `phases[]` already reaches every scene mesh. Do not over-build a general channel. |
| **C-3 · `glowTargets[0]` fallback in the rbr glow pass** (F-C5) | c | Parity with `force_rig` (`:49002–49003`). `tts_sentences[].glow` is a silent no-op on every rbr state. Tagged ride-along by Desk C — `phases[]` is a working substitute. ⚠ **The old "no back-compat constraint" clause here was WRONG and is struck — see the correction under §B E7.** |
| **C-4 · `masses.r_m` dead at t = 0 in ramped/swept states** (A-3 + A-9) | a | `rbrRAt(0)` returns `ramp.from` (`:50538`) / `sweep.lo` (`:49859`), never `masses.r_m`. Engine question for Desk E: should `range` be order-sensitive at all, or should `masses.r_m` win at t = 0? Cost Desk A a wrong-L explore state. |
| **C-5 · latched match cue under a time pin** (A-6) | a | `eng.matched[mid]` (`:50276`) clears only at state apply (`:50512`), so a rewind never clears it — the co-glow reads "landed" at t = 0. Regresses OPEN scar `hysteretic_state_cannot_be_latched_under_a_time_pin`. THE EYE **structurally cannot verify** the beat S3 exists to deliver. |
| ~~**C-6 · pull-arrow camouflage at the cause beat**~~ (A-12) | a | **RULED 2026-08-05 — MERGED INTO E7. No longer a separate row.** See the ruling below. |
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

> ### ⛳ MERGE STRATEGY — office ruling 2026-08-05. This is what closes the rbr verification hole.
>
> **Land each dispatch, or each tight group, to master as its OWN PR via `git-steward` — never
> one PR at the end.** Rule 40 asks for exactly this ("engine is platform and lands separately
> and immediately"), and it dissolves the hole rather than working around it: once a fix is on
> master, **each authoring desk syncs and verifies it on its own concept with its own seed key.**
> The cache one-owner rule is never bent and this desk never seeds an rbr concept.
>
> **Two options were considered and REJECTED by the office, both for good reasons worth keeping:**
> 1. **Granting this desk an rbr seed key — rejected.** This checkout holds unmerged, unreviewed
>    engine code; seeding an rbr concept here is *the most dangerous form* of the one-owner
>    violation, because the desk that later EYEs that concept would be silently testing code that
>    exists on no reviewed branch.
> 2. **Relying on emitted-code probes as the gate — rejected.** That is precisely the F-C7 failure
>    Desk C caught: a probe that passes on a broken build. F-C7's luminance-delta probe would have
>    gone green with the L arrow still invisible.
>
> **Emitted-code probes stay as this desk's LOCAL SMOKE TEST — never as the gate.** They are
> necessary (they caught real defects in E2 and E3) and they are not sufficient.
>
> **rbr verification partners, assigned by the office:**
>
> | Dispatch | Verifying desk | Why |
> |---|---|---|
> | E4, E5 | **Desk A** | its turntable exercises the same rbr integrator, and **Desk D cannot verify its own blockers while blocked on them** |
> | E7 | **Desk C** | `angular_momentum` is authored, validating, and holds for this fix |
> | E6, E8, E9 | **Desk D** once its blockers clear (E4/E5), else Desk A/C by surface |
>
> **Consequence for this desk's own reporting: a dispatch is LANDED, not VERIFIED, until its
> partner desk confirms it on a real concept.** Say which of the two a result is, every time.

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
