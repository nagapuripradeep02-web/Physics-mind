# MATHEMATICS BLOCK — `unit_circle_to_sine_wave`

> Produced by `mathematics_author`, second in the pipeline (`architect → mathematics_author →
> json_author → quality_auditor`). Consumes `docs/skeletons/unit_circle_to_sine_wave_skeleton.md`
> (amendment round 1, Checkpoint-A approved, 16 findings + 8 round-2 acceptance criteria discharged).
> Every timing/geometry number below **encodes** §11/§12 of the skeleton — nothing is re-timed or
> re-pixel-planned. This file is the handoff artifact for `json_author`.

> **Revision note (same session):** §1/§1b/§1c originally resolved `theta`/`phi`/`phi_r` as
> radians-native throughout, reasoning from the verified `position_expr`/bare-`cos()` fact alone. That
> resolution did not account for the canvas slider's own caption formatter
> (`parametric_renderer.ts:3068-3069`), which hardcodes precision (0dp if `step≥1`, else 1dp) with no
> unit-conversion field — a radian `theta` would therefore print its OWN drag caption as `θ: 3.9`, not
> the `θ: 210°` the S3/S7/S8 "park it at a named angle" control explicitly wants, and would depart from
> the fleet-wide convention every other angle-driven PCPL concept already uses (`resultant_direction`,
> `newton_second_law_direction`: degree-valued slider variable + an internal `*Math.PI/180` conversion
> at the trig call). **Superseded below: `theta`, `phi`, `phi_r` are now DEGREES-native everywhere** —
> the slider's own caption reads the taught angle directly, `drawAngleArc` (natively degrees) needs no
> conversion at all, and the derived key `s` now does double duty as both the taught arc-length AND the
> honest radian value (since `s = theta·π/180` and, with `r ≡ 1`, arc length in radius-lengths equals
> radian measure exactly). Nothing else in this document changes — the mathematics, the domain ledger's
> arguments, the timing windows, the drill-downs, and the constraint list are all unit-independent and
> stand as originally written. Re-verified below with a fresh numerical sanity check in the new units.

## Engine bug queue consultation (pre-authoring, run this session)

Query run per spec (`.agents/mathematics_author/CLAUDE.md` §"Engine bug queue consultation"):
`status=FIXED AND subject IN ('mathematics','subject_neutral') AND owner_cluster IN
(alex:mathematics_author, alex:physics_author, alex:chemistry_author, alex:json_author, or
peter_parker:runtime_generation+bug_class LIKE '%variable%')` → **17 rows** (of 48 total FIXED
mathematics/subject_neutral rows; none owned by `alex:mathematics_author` yet — expected, this is the
first mathematics concept). Rows binding THIS handoff, each discharged below:

| bug_class | Discharge |
|---|---|
| `derived_contract_value_computed_but_never_surfaced` | Every `computed_outputs` entry below (`sin_theta`, `cos_theta`, `s`) is bound to a rendered HUD string in the §10(b) ledger's per-state HUD column — none is declared-but-orphaned. |
| `core_ring_state_shows_value_whose_only_derivation_is_higher_ring` | S8 (explore, core) prints `sin θ`/`cos θ` — both first shown as concrete values in S3 (core) and S5 (core) respectively, never only in extended/advanced. Re-verified against both ring cuts, §"Notation ladder" below. |
| `explore_state_surfaces_non_core_ring_symbol` | S8's symbol set {θ, sin θ, cos θ, the y=sinθ/x=cosθ formula surfaces} — every symbol traces to a core-ring first-use (§10 b term ledger, unchanged). |
| `authored_indicator_hardcoded_to_default_variable_value` | Every position-encoding primitive (point, pens, tracking dots, both radius vectors) is bound via `position_expr`/`from_expr`/`to_expr` against a live variable — **zero** hardcoded `animation.translate` indicators anywhere in this design (confirmed: `position_expr` and `animation` are mutually exclusive per §11 callout 11, and this design never mixes them on one body). |
| `authored_annotation_asserts_a_value_its_own_state_control_can_falsify` | The one free-floating `annotation` per state is the ≤5-word delta cue (word-only, Rule 34a) — never a number. All numbers live on the HUD (`label`s bound to `computed_outputs`), which recomputes live under every drag — nothing to falsify. |
| `authored_content_collides_renderer_owned_control_zone` | §11's zone plan already reserves y≈445–470 for the renderer's own slider band on S3/S7/S8 — carried forward verbatim, see Constraint Callout 9 below. |
| `ascii_minus_in_oncanvas_math_from_tofixed` | **BINDS directly** — `sin_theta`/`cos_theta` are negative for roughly half the domain (S3 M1's whole point). Flagged as **Constraint Callout 4** below: every interpolated negative decimal must post-process `toFixed()`'s ASCII `-` into U+2212 (`−`). This is a `json_author` implementation duty, recorded here so it is not missed. |
| `animated_path_missing_disappear_gating_labels_accumulate` | N/A-with-reason: the one `animated_path` in this design (S4's axis reveal, 0–800 ms) is **not transient** — it draws the permanent wave baseline, never disappears, so no `disappear_at_ms` applies. |
| `coincident_text_primitives_render_superimposed` | Already satisfied by skeleton §11 zones (≥40 px separation) — no new text primitive introduced here. |
| `concept_json_duplicate_key_silently_discards_authored_value` / `authored_key_written_at_the_wrong_nesting_level_is_a_silent_noop` / `review_site_build_is_stale_against_the_concept_under_review` / `engine_retime_leaves_every_annotation_timed_against_the_old_behaviour_stale` / `smooth_camera_zoom_clips_content_on_full_canvas` / `state_inherits_a_camera_solved_for_a_different_enclosure_contour` / `reveal_complete_frame_delta_invisible_across_states` / `countability_metric_that_ignores_the_back_lobes_under_calls_fusion` | N/A-with-reason: general JSON-authoring hygiene / camera / chemistry-specific rows this pure-2D-PCPL, no-camera, single-touch concept does not exercise. Recorded so `json_author` sees the full sweep, not silence. |

**Directive rows** (already dispositioned in skeleton §13, restated as binding on this handoff):
`teach_visual_must_match_narration` / `narration_attributes_an_effect_to_a_cause_the_model_does_not_contain` —
**the model contains ROTATION and PROJECTION only.** No `teacher_script` sentence in any state may say
the point "speeds up", "slows down", "takes θ seconds", or otherwise invoke time/rate/angular velocity
as a cause. Every narration verb below is checked against this: *turns, sweeps, reaches, sits, carries,
lands, repeats, mirrors* — never *speeds, accelerates, takes time to*. `teach_reveal_synced_to_narration`
/ `teach_show_quantity_live_when_named` / `teach_color_each_element_by_its_own_sign` — satisfied
structurally: every HUD quantity named in a script sentence is already live at that instant (per the
§12 sub-beat table), and sign is shown by segment direction + the readout's own signed decimal, never a
separate color-coded sign convention (colour is reserved for the sine/cosine family distinction, Rule 29).

## Numerical sanity check — RUN, not eyeballed (re-run in the revised units, this session)

```
$ python3 -c "..."   (full script + output below; re-verifies every pin value in DEGREES-native theta)

9.0 rad in degrees = 515.662015617741   (S6's continuation ceiling, exact)

=== S2 pin @ 12600ms, theta&phi ramp 0->360 over 0..19800 (degrees) ===
theta=229.0909 deg -> round 229, s(rad)=3.9984 -> 4.00
expected: theta rounds to 229°, s=4.00                                        ✓ MATCH

=== S3 pin @ 12600ms, hold 0 thru 0-1000, ramp 0->360 over 1000..20000 (deg) ===
theta=219.79 deg (round 220), sin=-0.6400                                     ✓ MATCH ("θ ≈ 220°")

=== S4 pin @ 12600ms, hold 0 thru 0-800, ramp 0->360 over 800..20000 (deg) ===
theta=phi=221.25 deg (round 221), sin=-0.6593 (round -0.66)
pen=(477.6,302.5) point=(67.3,302.5) equal y? True                            ✓ MATCH (equal heights)

=== S5: cos(0 deg) = 1.0 ===                                                  ✓ EXACT
=== S5 pin @ 12600ms, hold 0 thru 0-4000, ramp 0->360 over 4000..19800 (deg) ===
theta=195.95 deg (round 196), cos=-0.9615 (round -0.96)                       ✓ MATCH

=== S6 pin @ 11400ms, hold 360 thru 0-3000, ramp 360->515.662 over 3000..18000 (deg) ===
theta=447.17 deg (round 447), x=659.0                                        ✓ MATCH ("θ≈447°, x≈659")

=== S6 axis extent: x at theta=515.662 deg = 714.0 (≤720) ===                 ✓ MATCH

=== S7 default slider theta=45° exact-value check ===
sin(45°)=0.7071067811865475  sin(135°)=0.7071067811865476  equal: True        ✓ EXACT identity

=== S3 M1 check: sin(210°) = -0.5000000000000001 ===                          ✓ exact -1/2

=== ASCII-minus still live: f"{sin(221°):.2f}" = "-0.66" ===                  ✓ Callout 4 unchanged
```

Every pin value the skeleton asserts is reproduced exactly in the revised degree-native units — same
numbers as the radian-native draft (as they must be: only the internal representation changed, not the
angle any state actually shows). The exact-value spot checks (sin 210° = −1/2, cos 0 = 1, sin 45° =
cos 45° = √2/2) and the ASCII-minus hazard both remain live and unchanged.

---

## §1 — `engine_config`

### 1a. The compute contract (the deliverable for both `computePhysics_unit_circle_to_sine_wave`
in `parametric_renderer.ts` AND the TS engine in `src/lib/physicsEngine/concepts/`, registered in
`ENGINES` — scar `parametric_computephysics_missing_silent_template_leak`, CRITICAL/FIXED)

**Inputs (raw vars, all DEGREES, all optional with these exact defaults):**

```js
theta  // default 0   — the point's angle, DEGREES, anticlockwise from the rightmost point
phi    // default 0   — sweep parameter for the BRIGHT drawn curve (choreography-only, never a slider)
phi_r  // default 0   — sweep parameter for the DIM recap curve (choreography-only, never a slider)
```

**Implementation (identical logic in both files — this IS the shared formula contract):**

```js
function computePhysics_unit_circle_to_sine_wave(vars) {
  var theta = (vars && typeof vars.theta === 'number' && isFinite(vars.theta)) ? vars.theta : 0;
  var phi   = (vars && typeof vars.phi   === 'number' && isFinite(vars.phi))   ? vars.phi   : 0;
  var phi_r = (vars && typeof vars.phi_r === 'number' && isFinite(vars.phi_r)) ? vars.phi_r : 0;

  var theta_rad = theta * Math.PI / 180;
  var sin_theta = Math.sin(theta_rad);
  var cos_theta = Math.cos(theta_rad);
  // s does DOUBLE DUTY: it is the radian measure of theta AND the arc length in
  // radius-lengths (r ≡ 1 always in this concept, so arc length = theta_rad * r = theta_rad
  // exactly). This is the state S2 teaches, expressed in one derived key.
  var s = theta_rad;

  return {
    concept_id: 'unit_circle_to_sine_wave',
    variables: { theta: theta, phi: phi, phi_r: phi_r },
    derived: { sin_theta: sin_theta, cos_theta: cos_theta, s: s },
    forces: []
  };
}
```

Register in the `computePhysics` dispatch chain (`parametric_renderer.ts:606+`):
`else if (conceptId === 'unit_circle_to_sine_wave') result = computePhysics_unit_circle_to_sine_wave(vars);`
— placed in the mathematics-namespace block alongside `bohr_model_energy_levels` /
`law_of_conservation_of_mass` (both already gated by exact `conceptId` string match, same pattern).

**Naming subtlety — read this before wiring any HUD string.** The engine variable named `theta` holds
**degrees** (a UI/rendering convenience, matching the slider's native units). The mathematical symbol
θ, wherever it appears in a symbolic formula surface (`s = θ (r=1)`, `sin(π−θ)=sinθ`), denotes the
**radian** angle by the standard mathematical convention — and that value is the derived key `s`, not
the raw engine variable `theta`. Concretely: the dual-unit HUD's radian slot is `{s.toFixed(2)}`, and
its degree slot is `{theta.toFixed(0)}` — **never the reverse.** `json_author` must not write
`angle_value_expr: "s"` (drawAngleArc wants degrees, and `s` is radians) nor `{theta}` where a radian
value is intended.

`derived` carries exactly three display keys (`sin_theta`, `cos_theta`, `s`) — matching the §10(b)
per-state HUD ledger column, zero orphaned computed values (discharges
`derived_contract_value_computed_but_never_surfaced`). Every GEOMETRY-facing field (see 1b) is written
as a literal inline expression on the raw vars (`theta`/`phi`/`phi_r`, degrees) with the `*PI/180`
conversion baked directly into the trig call — exactly the same idiom already shipped in
`newton_second_law_direction`'s `computePhysics_newton_second_law_direction` (`var theta_rad =
theta_F * Math.PI / 180;` before every `Math.cos`/`Math.sin`) and `resultant_direction`'s
`theta * PI / 180` formulas. This is the FLEET convention, not a new pattern.

### 1b. Geometry expression contract (every `*_expr` field, literal, verbatim — json_author copies
these directly). **Degrees-native `theta`/`phi`/`phi_r`; every trig call converts inline via
`*PI/180`; `drawAngleArc` needs NO conversion at all (natively degrees).**

| Primitive | Field | Expression | Used in |
|---|---|---|---|
| point body | `position_expr` | `{x: 150 + 110*cos(theta*PI/180), y: 230 - 110*sin(theta*PI/180)}` | S1–S8 (every state) |
| radius vector (centre→point) | `from_expr` / `to_expr` | `{x:150,y:230}` / `{x: 150+110*cos(theta*PI/180), y: 230-110*sin(theta*PI/180)}` | S1, S3–S5, S7 |
| height segment (point→foot) | `from_expr` / `to_expr` | `{x: 150+110*cos(theta*PI/180), y: 230-110*sin(theta*PI/180)}` / `{x: 150+110*cos(theta*PI/180), y: 230}` | S3–S8 |
| horizontal segment (centre→foot) | `from_expr` / `to_expr` | `{x:150,y:230}` / `{x: 150+110*cos(theta*PI/180), y: 230}` | S5, S8 |
| carrier (point→pen, dashed) | `from_expr` / `to_expr` | `{x: 150+110*cos(theta*PI/180), y: 230-110*sin(theta*PI/180)}` / `{x: 300+46*phi*PI/180, y: 230-110*sin(phi*PI/180)}` | S4 only |
| sine pen | `position_expr` | `{x: 300 + 46*phi*PI/180, y: 230 - 110*sin(phi*PI/180)}` | S4, S6 (continuation pen), S8 (draw phase) |
| cosine pen | `position_expr` | `{x: 300 + 46*phi*PI/180, y: 230 - 110*cos(phi*PI/180)}` | S5, S8 (draw phase) |
| sine tracking dot (post-draw, theta-live) | `position_expr` | `{x: 300 + 46*theta*PI/180, y: 230 - 110*sin(theta*PI/180)}` | S8 only, `appear_at_ms: 3000` |
| cosine tracking dot | `position_expr` | `{x: 300 + 46*theta*PI/180, y: 230 - 110*cos(theta*PI/180)}` | S8 only, `appear_at_ms: 3000` |
| sine `locus_trace` (bright) | `x_expr` / `y_expr` | `"300 + 46*phi*PI/180"` / `"230 - 110*sin(phi*PI/180)"` | S4, S8 |
| cosine `locus_trace` (bright) | `x_expr` / `y_expr` | `"300 + 46*phi*PI/180"` / `"230 - 110*cos(phi*PI/180)"` | S5, S8 |
| sine recap `locus_trace` (dim, φ_r) | `x_expr` / `y_expr` | `"300 + 46*phi_r*PI/180"` / `"230 - 110*sin(phi_r*PI/180)"` | S5, S6, S7 |
| rim `locus_trace` (on the circle itself) | `x_expr` / `y_expr` | `"150 + 110*cos(phi*PI/180)"` / `"230 - 110*sin(phi*PI/180)"` | S2 only |
| S6 continuation `locus_trace` (bright, phi 360°→515.662°) | `x_expr` / `y_expr` | `"300 + 46*phi*PI/180"` / `"230 - 110*sin(phi*PI/180)"` | S6 (same formula as the sine trace — only the window differs) |
| main angle arc (θ) | `angle_value_expr` | `"theta"` (bare — `drawAngleArc` is natively degrees, no conversion needed) | S1–S8 |
| mirror angle arc (π−θ) | `angle_value_expr` | `"180 - theta"` (degrees: π−θ ↔ 180°−theta) | S7 only |
| mirror point | `position_expr` | `{x: 150 + 110*cos((180-theta)*PI/180), y: 230 - 110*sin((180-theta)*PI/180)}` | S7 only |
| mirror radius vector | `from_expr` / `to_expr` | `{x:150,y:230}` / `{x: 150+110*cos((180-theta)*PI/180), y: 230-110*sin((180-theta)*PI/180)}` | S7 only |
| mirror height segment | `from_expr` / `to_expr` | `{x: 150+110*cos((180-theta)*PI/180), y: 230-110*sin((180-theta)*PI/180)}` / `{x: 150+110*cos((180-theta)*PI/180), y: 230}` | S7 only |

**The angle-arc row is the concrete payoff of going degrees-native:** `angle_value_expr: "theta"` is a
BARE variable reference — simpler than the radian-native draft's `"theta * 180 / PI"` — and
`drawAngleArc`'s `toDeg` is consumed exactly as authored, unconditionally in degrees
(`parametric_renderer.ts:2589-2606`), confirmed against the renderer code. `to_deg_expr` (the bare-name
lookup variant) would ALSO now work trivially (`to_deg_expr: "theta"`), but `angle_value_expr` is used
uniformly for both arcs (the mirror arc needs a full expression, `"180 - theta"`, which only
`angle_value_expr`/`PM_safeEval` supports) — one mechanism, not two, for consistency.

### 1c. Slider units (revised — degrees-native, matching the renderer's own caption formatter and the
fleet-wide convention)

**Decision: `theta`, and by the equality invariant `phi`/`phi_r` alongside it, are DEGREES everywhere —
choreographed and slider-driven alike.** The canvas slider's built-in caption
(`parametric_renderer.ts:3068-3070`) hardcodes its own precision (`toFixed(1)` if `step<1`, else
`toFixed(0)`) with **no unit-conversion field** — it prints the RAW stored value with only a suffix
string appended. A radian-valued `theta` would therefore print its own drag caption as `θ: 3.9`,
un-recoverable to "210°" without a second read; a degree-valued `theta` with `step:1` prints exactly
`θ: 210°` — precisely the "park it at 210° for me" beat S3's slider exists for, using the renderer's
OWN caption, no secondary HUD lookup required for that specific number. It also matches how every other
angle-driven PCPL/mechanics_2d concept in this codebase already authors an angle slider
(`resultant_direction.json`'s `theta`, `unit:"deg"`, formulas doing `theta * PI / 180`;
`newton_second_law_direction`'s `theta_F` with an internal `theta_rad = theta_F * Math.PI / 180`) — this
is the fleet convention, not a bespoke choice for this concept.

| State | `min` | `max` | `step` | `default` | `unit` |
|---|---|---|---|---|---|
| S3 | 0 | 360 | 1 | 0 | `"deg"` |
| S7 | 0 | 90 | 1 | 45 (= π/4 — matches §3's own "θ = 0.79 rad (45°)" example, and is an EXACT value: sin 45° = cos 45° = √2/2, verified above) | `"deg"` |
| S8 | 0 | 360 | 1 | 0 | `"deg"` |

The renderer's own slider caption now reads correctly (`θ: 210°`) with zero extra authoring. The
**radian** half of the dual-unit requirement (§10 b / F19) is delivered by a SEPARATE, concept-authored
HUD `label`, using the derived `s` key (which IS the radian value, §1a's naming-subtlety note):

```
text: "θ = {s.toFixed(2)} rad ({theta.toFixed(0)}°)"
```

This is the literal string every state's dual-unit HUD row uses (S1–S8) — `s` supplies the radian slot,
`theta` supplies the degree slot directly (no conversion needed for that half either, since `theta` is
already degrees). Resolves via `PM_interpolate`'s "complex JS expression" path (dotted `.toFixed()`
calls bypass the bare-identifier fast path — the same documented `{((2*m1*m2*9.8)/(m1+m2)).toFixed(2)}`
precedent as before).

### 1d. `variables`

```json
"variables": {
  "theta": {
    "name": "angle of the point from the positive horizontal axis, DEGREES, anticlockwise",
    "min": 0,
    "max": 515.662015617741,
    "default": 0
  },
  "phi": {
    "name": "sweep parameter for the bright drawn curve, DEGREES — choreography-only, NEVER a slider (F1, the phi law)",
    "min": 0,
    "max": 515.662015617741,
    "default": 0
  },
  "phi_r": {
    "name": "sweep parameter for the dim recap curve, DEGREES — choreography-only, NEVER a slider (F1, the phi law)",
    "min": 0,
    "max": 360,
    "default": 0
  }
}
```

`max: 515.662015617741` = 9.0 rad exactly (`9.0 * 180 / π`) — S6's continuation ceiling; every other
state restricts its own slider/choreography to `[0, 360]` or `[0, 90]` (§1c), never a change to the
domain of sin/cos themselves (§2). `phi.max` mirrors `theta.max` for the same reason (S6's continuation
trace); `phi_r.max = 360` — no state ever drives a recap past one full loop.

### 1e. `formulas`

```json
"formulas": {
  "sin_theta": "sin(theta * PI / 180)",
  "cos_theta": "cos(theta * PI / 180)",
  "s": "theta * PI / 180"
}
```

### 1f. `computed_outputs`

```json
"computed_outputs": {
  "sin_theta": {
    "formula": "sin(theta * PI / 180)",
    "role": "the signed height y = sin θ (r=1); drives the sin θ HUD row on S3/S4/S7/S8. S7 uses this SAME key for BOTH the point's height and the mirror point's height — sin(π−θ) ≡ sin θ is an exact identity, so one canonical value legitimately drives both readouts and they can never visually disagree (hazard-4-safe by construction, not by discipline)"
  },
  "cos_theta": {
    "formula": "cos(theta * PI / 180)",
    "role": "the signed horizontal distance x = cos θ (r=1); drives the cos θ HUD row on S5/S8"
  },
  "s": {
    "formula": "theta * PI / 180",
    "role": "DOUBLE DUTY: the radian measure of theta (the mathematical symbol θ in every formula surface means THIS value, not the raw engine variable) AND the arc length in radius-lengths (r≡1) that S2 teaches. Drives S2's s = θ readout AND the radian slot of the dual-unit HUD in every state — the formula surface s = θ (r=1) reads TRUE against this exact value, F19"
  }
}
```

### 1g. `constraints`

```json
"constraints": [
  "domain: sin θ and cos θ are defined for EVERY real θ, no excluded points, no asymptotes (this concept deliberately never introduces tan θ, which would add excluded points at θ = π/2 + kπ)",
  "r ≡ 1 in every state, always — no primitive in this concept draws a circle or arc at a live radius (body.size and angle_arc.radius are both number-only in this renderer; F2 cut the amplitude state for exactly this reason)",
  "the two scale factors are declared ONCE and reused verbatim in every expression: S_v = 110 px/unit (circle radius AND both wave ordinates), S_h = 46 px/rad (wave horizontal axis) — applied to the RADIAN conversion of theta/phi (e.g. 46*phi*PI/180), never to the raw degree number; circle centre (150,230), wave origin x0=300, baseline y=230",
  "phi and phi_r are choreography-only in every state — NEVER authored as a slider variable (the phi law, F1); every locus_trace x_expr/y_expr references ONLY phi or phi_r, never theta",
  "wherever a pen or carrier is on screen, theta and that trace's own sweep parameter are numerically EQUAL at every instant (the equality invariant, F18) — enforced by giving theta and phi/phi_r the SAME from/to/start_ms/duration_ms in every state where both are choreographed together, now literally equal since both are degrees",
  "theta, phi and phi_r are DEGREES everywhere — native to the slider caption and to drawAngleArc; every trig-consuming expression converts inline via *PI/180; the derived key s is the honest radian value (and, since r≡1, simultaneously the taught arc length) — never confuse the engine variable theta (degrees) with the mathematical symbol θ in a formula surface (radians, i.e. s)"
]
```

---

## §2 — Domain & validity ledger (THE CENTRAL ARTIFACT — unchanged by the units revision; the
mathematics is unit-independent. One footnote added.)

**Unit note:** every angle below is stated in **radians**, the standard mathematical convention for
domain/range/period statements (matching how the formula surfaces themselves are written —
`sin(θ+2π)=sinθ`, never `sin(θ+360°)=sinθ`). The concept JSON's authored engine variable `theta` is
degrees (§1c); convert via `s = theta·π/180` wherever this ledger's radian statements need to be
checked against the authored value. This is a presentation choice for THIS ledger only and does not
change any argument below.

**Relations displayed in this concept: sin θ, cos θ, and the identities s = θ (r=1),
sin(θ+2π) = sin θ, sin(π−θ) = sin θ.** No other function appears (deliberately — no tan θ, no
amplitude scaling; F2 cut both).

### 2a. sin θ, cos θ — the base relations

- **Domain:** all real θ (both are total functions — no division, no even root, no log, no undefined
  point anywhere).
- **Range:** [−1, 1] for both.
- **Excluded points:** **none.** This is a structural safety property of this concept, not an accident
  — the only two functions on screen (sin, cos) are entire; nothing in this design can ever produce a
  guard value, a NaN, or a division-by-zero on canvas.
- **Interval actually drawn** (per state — this is where the domain/drawn-interval gap is tracked):

| State | θ drawn on (radians / as authored in degrees) | Why this interval and not the full domain |
|---|---|---|
| S1 | [0, 2π] / [0°,360°], looping forever | The apparatus tour — one full revolution is the complete lesson (the anchor is a clock's second hand, which itself completes one loop per minute) |
| S2 | [0, 2π] / [0°,360°] | The radian is established over exactly one revolution; nothing beyond it is needed to prove s = θ |
| S3 | [0, 2π] / [0°,360°] | One full loop is sufficient to demonstrate "any angle, any sign" (see the licensing note below — the claim is definitional, not exhaustive) |
| S4 | [0, 2π] / [0°,360°] | The unroll's ENTIRE lesson lives inside one loop — the wave IS what one revolution looks like laid sideways |
| S5 | [0, 2π] / [0°,360°] | Same reasoning as S4, cosine |
| S6 | [0, 9.0 rad] / [0°,515.66°] (≈1.43 periods) | Deliberately extends PAST one loop — this is the ONE state whose entire job is to show what happens beyond [0,2π] (see 2b below, the load-bearing case) |
| S7 | [0, π/2] / [0°,90°] (slider-restricted) | Apparatus choice, NOT a domain restriction of the identity — see 2c below |
| S8 | [0, 2π] / [0°,360°] always, every preset | Deliberately capped so the sandbox never exhibits periodicity — S8 makes no periodicity claim (its caption is "Drag the angle yourself", control-range-invariant) |

- **Behaviour at every drawn boundary:** finite everywhere. sin/cos never diverge, so every boundary
  is an ordinary finite value, continuously connecting to whatever the next state shows at the same θ
  (S4 ends at (2π, 0); S6 opens holding at the SAME point, per §12's "no jump" discipline — this is
  deliberately verified, not incidental).

### 2b. S6 — the periodicity claim: the load-bearing distinction of this entire ledger

**The claim `sin(θ + 2π) = sin θ` is genuinely universal — true for every real θ, without exception.**
This is NOT licensed by the drawing (which can only ever show a finite interval) — it is licensed by
**the construction itself**: the point's position on the circle depends on θ *only through* the pair
`(cos θ, sin θ)`, and advancing θ by exactly one full revolution (2π) returns the point to the
*identical* position on the circle, because a full turn is what "one revolution" *means*. Since the
height is read directly off the point's position, an identical position forces an identical height —
for **any** starting angle, not merely the ones drawn.

**What S6 actually draws is a REPRESENTATIVE INSTANCE of this argument, not an exhaustive check.** The
sim extends the drawn interval from [0, 2π] to [0, 9.0 rad] (515.66° as authored) — i.e. it demonstrates
the argument on ONE extra partial revolution (θ ∈ [2π, 9.0], ≈0.43 of a second period) and lets the
student watch the new crest rise at exactly the heights the point already passed through on its first
loop. This is sufficient to *demonstrate the mechanism* (same circle, same construction, therefore same
output) — it is not, and cannot be, a proof by exhaustion over all real θ (no drawing can be). **The
caption/narration is licensed to state the identity as universal ONLY because the argument it
demonstrates is angle-invariant by construction — never because "we checked and it worked here."** This
is exactly the distinction the `mathematics_author` role exists to police: `json_author` must not phrase
S6's caption as "the wave repeats on the screen" (an interval-bound, weaker claim) but as
"sin(θ+2π) = sin θ for every θ" WITH the geometric argument visible (the point returning to the same
position) as the thing that licenses it — the interval [0,9.0 rad] is the *demonstration*, the full
revolution *construction* is the *proof*.

**No caption anywhere in S6 may say "the wave repeats forever" as an empirical observation of the
drawing** (false framing — the drawing only ever shows a finite interval) — it must say the identity IS
true for every θ, evidenced by (not merely observed on) the shown continuation.

### 2c. S7 — sin(π−θ) = sin θ: a cosmetic domain restriction, not a mathematical one

**The identity itself is universal — true for every real θ**, provable directly and identically for ANY
θ: reflecting the point `(cos θ, sin θ)` about the vertical axis (through the centre) maps it to
`(−cos θ, sin θ)`, which is EXACTLY `(cos(π−θ), sin(π−θ))` by the standard reflection identity — the
y-coordinate (the height) is untouched by this reflection for any θ whatsoever, in any quadrant.

**The sim restricts its slider to θ ∈ [0°, 90°] purely as an apparatus choice** — to keep the two radii
and their arcs comfortably separated inside the circle without the two points coinciding (at θ=90°,
both points sit at the top — the natural edge of the useful drawing range) or crossing awkwardly (for
θ>90°, π−θ<θ and the "mirror" framing inverts, which is a DIFFERENT, not-yet-taught case). **This
restriction must never be stated or implied as a restriction of the identity's validity** — the identity
holds for every real θ; only the CHOSEN DEMONSTRATION WINDOW is restricted, for legibility.
`json_author`'s S7 caption/narration must not say "for angles up to 90°" as though that were a
hypothesis of the theorem — it may only say it as the range this particular apparatus explores.

### 2d. s = θ (arc length = angle, r=1) — S2

**Domain:** true for every θ ≥ 0 (this concept never authors negative θ, so the signed-arc-length case
is out of scope, not a gap — S1's sweep is anticlockwise-only throughout, per §10(c)). **Drawn on
[0, 2π] / [0°,360°].** Boundary: at θ=2π (360°), s=2π ≈ 6.28, matching the full circumference
C = 2πr = 2π (r≡1) exactly — this IS the geometric definition of the radian, not a coincidence the sim
happens to reproduce; the formula surface `s = θ (r = 1)` is licensed as universally true (for θ≥0) by
the SAME construction argument as 2b — the definition of radian measure is "arc length per unit
radius," which is angle- and radius-invariant by definition, not merely true on the interval shown.
**Reminder (§1a naming subtlety):** the θ in this formula surface is the RADIAN value, i.e. the derived
key `s` — the raw engine variable `theta` (degrees) is a different number at every non-trivial instant.

### 2e. No formal limit/calculus machinery anywhere (Rule 38c clean pass)

Every relation in this concept is a ratio/length/geometric definition (height, horizontal distance, arc
length, reflection symmetry) — nothing approaches a boundary, nothing accumulates, nothing is
differentiated or integrated. **Clean pass, no flag needed:** the notation ladder (§4) confirms no state,
core or advanced, needs `lim`, `∫`, or derivative-operator notation, so the "advanced-ring-only"
restriction is satisfied vacuously (nothing in the concept ever wants that notation in the first place).

---

## §3 — Rule 31 timelines + per-state control spec (encoding §12, not re-timing it; revised to
degree-valued `from`/`to` endpoints)

**`variable_choreography` per state** — every entry uses the verified `PM_choreoValue` contract
(`mode:'once'` ramps then HOLDS at `to`; `mode:'loop'` cycles continuously from `start_ms`; a real drag
seizes and the choreography stands down for that variable, per `:3102`/`:3430`). Endpoint constants:
2π → 360°, π/2 → 90°, π/4 → 45°, 9.0 rad → 515.662015617741°.

| St | `theta` choreography | `phi` choreography | `phi_r` choreography | Live control |
|---|---|---|---|---|
| S1 | `{mode:'loop', from:0, to:360, start_ms:0, duration_ms:12000}` | none | none | none |
| S2 | `{mode:'once', from:0, to:360, start_ms:0, duration_ms:19800}` | **same** (θ≡φ, equality invariant, now literally equal in degrees) | none | none |
| S3 | `{mode:'once', from:0, to:360, start_ms:1000, duration_ms:19000}` | none (F1/F9-safe, no trace) | none | **θ slider**, [0°, 360°], step 1° (§1c) |
| S4 | `{mode:'once', from:0, to:360, start_ms:800, duration_ms:19200}` | **same** (θ≡φ) | none | none (F13) |
| S5 | `{mode:'once', from:0, to:360, start_ms:4000, duration_ms:15800}` | **same** (θ≡φ, from 4000 ms) | `{mode:'once', from:0, to:360, start_ms:2000, duration_ms:2400}` (recap, pen-free) | none (F13) |
| S6 | `{mode:'once', from:360, to:515.662015617741, start_ms:3000, duration_ms:15000}` | **same** (θ≡φ, from 3000 ms) | `{mode:'once', from:0, to:360, start_ms:0, duration_ms:3000}` (recap, pen-free) | none (F13, timed two-pass) |
| S7 | `{mode:'once', from:0, to:0, start_ms:0, duration_ms:4000}` hold, then `{mode:'ping_pong', from:0, to:90, start_ms:4000, duration_ms:4000}` (2 entries; mirror π−θ is DERIVED, never independently driven) | none (no new bright trace in S7) | `{mode:'once', from:0, to:360, start_ms:0, duration_ms:2400}` (recap, pen-free) | **θ slider**, [0°, 90°], default 45° (§1c) |
| S8 | `{mode:'loop', from:0, to:360, start_ms:3000, duration_ms:8000}` (period is a teacher-legible pace, my authoring choice — not pinned by the skeleton; overridable at review) | `{mode:'once', from:0, to:360, start_ms:0, duration_ms:3000}` (both sine+cosine curves draw together on this one phi) | none | **ALL: θ slider**, [0°, 360°] (§1c) |

Ping-pong leg duration for S7 (`duration_ms:4000`) is my own authoring judgment (the skeleton pins the
window 4000–20000+ but not a per-leg rate) — 4000 ms gives 4 legs (2 round trips) inside the remaining
≈16 s, a readable pace; `json_author`/founder may retune without touching the mathematics.

**Controls recap (matches architect's table exactly):** S1/S2/S4/S5/S6 zero controls (watch-beats or a
choreography whose lesson would be falsified by a mid-state scrub, F13). S3/S7/S8 carry the θ slider,
authored in degrees per §1c. S8 = ALL (θ only — the concept's complete control set after the F2
amplitude cut, Rule 31c literally satisfied: ALL = {θ}).

**Register-triangle lead/support (Rule 33) + the real NUMBER, carried forward from architect §3, bound
to the derived keys declared in §1f:**

| St | Register lead/support | The real NUMBER (bound key) |
|---|---|---|
| S1 | graphical / numeric | `theta` (dual-unit HUD only, no sin/cos row) |
| S2 | graphical / numeric | `s`, `theta` — formula surface `s = θ (r=1)` reads TRUE against the HUD (F19) |
| S3 | graphical / numeric | `sin_theta`, `theta` |
| S4 | graphical / numeric | `theta`≡`phi`, `sin_theta` |
| S5 | graphical / numeric | `cos_theta`, `theta` |
| S6 | graphical / numeric | `theta` (past 360°), `sin_theta` |
| S7 | graphical+symbolic co-lead / numeric | `sin_theta` (bound to BOTH readouts, §1f) |
| S8 | graphical / numeric | `theta`, `sin_theta`, `cos_theta` |

Word budget: unchanged from architect §3 (35–45 / 35–55 / 40–55 / 40–55 / 40–55 / 30–50 / 35–55 / 0-open
across S1–S8) — all within the 25–55 EN-word guided-state band; none of my additions touch narration
text, so no re-check against the ceiling is needed (§12's ceiling-vs-motion-window check already ran).

---

## §4 — Notation ladder (Rule 38c) — unaffected by the units revision

**Core/extended states (S1–S6, S8) — algebra + geometry only, exactly as required:** `s = θ`,
`y = sin θ`, `x = cos θ`, `sin(θ+2π) = sin θ` — every symbol is a named length or a named ratio, no
operator notation of any kind. All formula surfaces are written in the standard mathematical (radian)
convention regardless of the engine's degree-native `theta` variable (§1a naming subtlety) — this is a
presentation-layer fact, not a notation-ladder concern.

**Advanced state (S7) — still algebra/geometry-only, NOT calculus:** `sin(π − θ) = sin θ` is an
algebraic identity proved by a reflection argument (§2c) — it does not need, and does not use, limit,
derivative, or integral notation. Placing it at the advanced ring is a curriculum-sequencing choice
(the architect's, already made), not a notational-complexity requirement.

**No formal limit notation, integral-sign machinery, derivative-operator notation, vector-operator
forms, or induction structure appears anywhere in this concept, on any ring.** Clean pass — nothing to
flag (§2e).

**Dialect (38d):** no board-divergent term appears in this concept. "Radian", "sine", "cosine", "period"
and "arc length" carry the same meaning and the same name on every syllabus this concept targets
(CBSE/ICSE/IB/AP/Cambridge/A-level — §10 i-3 of the skeleton). **No dual-labeling needed; clean pass.**
If `json_author` encounters a genuine board conflict while wording a caption, flag it — none is
anticipated here.

**Interval notation / decimal convention (38e):** this design uses `[a, b]` internally (this ledger,
`json_author`'s own working notes) but **never on canvas** — on-canvas text is exclusively the dual-unit
HUD (`θ = X.XX rad (YYY°)`) and the symbolic formula surfaces, neither of which uses interval notation.
Decimal precision: 2 dp for the radian slot (`s`) and every sin/cos readout, 0 dp (integer, parenthetical)
for the degree slot (`theta`, matching the renderer's own slider-caption precision rule for `step≥1`),
constant across all 8 states (§1c/§10 g) — never 1 dp in one state and 2 dp in another.

---

## §5 — Drill-down cluster phrasings (5 per cluster, genuine student voice, plain English) —
unaffected by the units revision

### S2 — `radian_vs_degree`
1. "why do we need radians when degrees already work fine"
2. "what even is one radian, like what does it actually look like"
3. "is a radian a made-up unit or does it mean something real"
4. "why does pi keep showing up if radians are supposed to be simpler than degrees"
5. "how do I convert between degrees and radians without just memorizing a formula"

### S2 — `arc_length_equals_angle`
1. "why is the arc length the same number as the angle, that feels like a coincidence"
2. "does this only work because the radius is exactly 1"
3. "if the circle were bigger would the arc length still equal the angle"
4. "so is a radian just the angle where the arc length matches the radius"
5. "why does going all the way around give exactly 2 pi and not some other number"

### S2 — `why_pi_appears_on_the_axis`
1. "why is the x-axis measured in pi instead of normal numbers"
2. "what does 'pi over 2' even mean as a position on the axis"
3. "is pi a length here or an angle, I keep mixing them up"
4. "why not just label the axis 90, 180, 270, 360 like degrees"
5. "where does the number pi actually come from in this circle"

### S4 — `wave_is_not_the_path`
1. "isn't the wavy graph just the circle stretched out flat"
2. "so the point never actually moves like a wave, it's always going in a circle"
3. "what is the sideways axis on the graph measuring if it's not distance"
4. "why does the wave look like it's moving right when the point is just going in circles"
5. "is the curvy line the point's real path or is it something else completely"

### S4 — `x_axis_is_angle`
1. "what is on the bottom axis of the wave graph, is it time or the angle"
2. "why does the horizontal position on the graph mean the same thing as the angle on the circle"
3. "so the wave has nothing to do with distance along the ground"
4. "why does moving right on the graph match spinning the point further round"
5. "if the point went faster would the graph's x-axis change, or is it still just the angle"

### S4 — `height_to_graph_mapping`
1. "how does the up-down position on the circle turn into a point on the flat graph"
2. "why do the point and the dot on the wave always sit at the same height"
3. "what exactly gets carried over sideways to make the wave, the height or something else"
4. "does the wave curve get taller if the circle is bigger"
5. "why does the wave dip below the line when the point is in the bottom half"

### S5 — `cosine_phase_shift`
1. "why is cosine the same wave as sine but just shifted over"
2. "how much is cosine actually shifted from sine, is it exactly a quarter turn"
3. "if sine and cosine come from the same circle, why do they look different on the graph"
4. "does the shift between sine and cosine ever change or is it always the same amount"
5. "why does shifting sine over turn it into cosine"

### S5 — `cosine_starts_at_one`
1. "why does cosine start at 1 when sine starts at 0, don't they come from the same point"
2. "at angle zero, why is the point all the way to the right instead of at the top"
3. "so cos of 0 is 1, but doesn't 0 usually mean nothing, why is it the biggest value"
4. "does cosine ever start at 0 like sine does"
5. "why does everyone assume both waves start at zero, where does that idea even come from"

### S5 — `sin_cos_same_circle`
1. "if sine and cosine both come from the same circle, why do we need two separate functions"
2. "does the circle prove that sine and cosine are basically the same thing"
3. "why does one direction give sine and the other gives cosine"
4. "is there a way to get cosine directly from sine's formula instead of drawing it separately"
5. "why do sine and cosine always seem to be connected no matter what angle you pick"

---

## §6 — Constraint callouts (special-case algebra `json_author` must encode)

1. **The two scale factors, declared once, reused verbatim:** `S_v = 110` px/unit (circle radius AND
   both wave ordinates share it), `S_h = 46` px/rad (wave horizontal axis only, applied to the RADIAN
   conversion `phi*PI/180`, never to the raw degree number — §1b). Circle centre `(150, 230)`, wave
   origin `x0 = 300`, baseline `y = 230`. Never re-derive inline — copy from §1b.
2. **The φ law (F1):** `phi`/`phi_r` are choreography-only, NEVER a slider variable, in any state; every
   `locus_trace` `x_expr`/`y_expr` references ONLY `phi`/`phi_r` (§1b table — every row checked).
   `theta` never appears inside a trace expression.
3. **The equality invariant (F18):** wherever a pen or carrier is on screen, `theta` and that trace's
   own parameter are numerically equal at every instant — enforced by giving them IDENTICAL
   `from`/`to`/`start_ms`/`duration_ms` (§3 table — every joint row matches by construction), now
   literally equal in degrees (not merely proportional).
4. **ASCII-minus → Unicode minus, mandatory (engine_bug_queue `ascii_minus_in_oncanvas_math_from_tofixed`,
   verified live in this concept — sanity check above): every interpolated string built from
   `sin_theta`/`cos_theta` (both genuinely negative across roughly half the domain — S3's whole
   misconception beat depends on this) must post-process `toFixed()`'s ASCII `-` into U+2212 (`−`)
   before it reaches canvas. `theta` and `s` are never negative in this concept (θ ≥ 0 throughout) and
   need no such post-processing.
5. **Degree-native sliders, radian HUD (§1c, restated as the constraint):** every slider (`theta` on
   S3/S7/S8) is authored with `min`/`max`/`step`/`default` in **degrees** and `unit:'deg'` — the
   renderer's own caption then reads the taught angle directly (`θ: 210°`). The dual-unit radian display
   is a SEPARATE authored HUD label: `"θ = {s.toFixed(2)} rad ({theta.toFixed(0)}°)"`. Every trig call
   in §1b converts `theta`/`phi`/`phi_r` via an inline `*PI/180` — `drawAngleArc`'s `angle_value_expr`
   needs NO conversion (natively degrees).
6. **`r ≡ 1`, always (F2 discharge):** no primitive anywhere draws at a live radius; `body.size` stays a
   literal number (`16` for the point/pen/dot bodies, an authoring choice for `json_author`, not
   gate-critical) and `angle_arc.radius` stays a literal number for both arcs in every state.
7. **Guard value at every excluded point (§2 requirement) — N/A, explicitly:** sin θ and cos θ have no
   excluded points anywhere in this concept (§2a); there is no guard/fallback value to author.
8. **Locus sample budgets — all pre-verified ≤ 240** (§12 of the skeleton; not re-derived here, and
   unaffected by the units revision since sample counts depend only on `sample_ms`/window duration, not
   on degrees vs radians): S2 233, S4 226, S5 96+198, S6 120+215, S7 96, S8 120+120. `json_author` copies
   `sample_ms` from §12 directly.
9. **Renderer-owned control zone:** author nothing below y≈450 on S3/S7/S8 (the states with a canvas
   slider) — the slider band occupies y≈445–470; every HUD/label in §1b's zone plan already clears it
   (§11 of the skeleton).
10. **Variable KEYS stay ASCII** (`theta`, `phi`, `phi_r`) in every expression string — Unicode (θ φ π °
    − √) is for rendered TEXT only, never a variable name (Rule 34c / a Unicode key silently misses
    `PM_interpolate`'s `/^\w+$/` fast path).
11. **One expression idiom, bare, throughout:** `sin(...)`/`cos(...)`, never `Math.sin`/`Math.cos` — the
    ARGUMENT now carries the `*PI/180` conversion (e.g. `sin(theta*PI/180)`), but the function call
    itself stays bare, matching every other expression in this concept (verified: `PM_buildEvalScope`
    injects bare `sin`, `cos`, `PI` etc. into every eval scope).
12. **`position_expr` exclusivity:** every body listed in §1b carries `position_expr` and declares
    neither an `animation` block nor a surface attachment (the `:1218` guard silently disables
    `position_expr` if either is present) — checked against every row of §1b's table.

---

## Source check line

*Consulted the NCERT Class-11 Mathematics chapter index (Ch. 3 — Trigonometric Functions) and the named
international specifications (IB DP AA subject guide, AP Precalculus CED, Cambridge 0606/0580 syllabus,
A-level Pure specifications) for scope only — unchanged from the architect's own source check, no new
scope claim made here. NCERT Exemplar not re-consulted (the three `misconception_watch` beliefs are the
architect's, carried forward verbatim). No teaching method, no example problem, no figure imported. HC
Verma and DC Pandey not consulted — physics-only sources, forbidden for mathematics.*

## Self-review checklist — run (and re-run after the degrees-native revision)

- [x] Every quantity in the skeleton's narratives (θ, radian/s, sin θ, cos θ, the two heights) appears
      in `variables`/`computed_outputs` with a domain agreeing with §2.
- [x] Domain & validity ledger complete for sin θ, cos θ, s=θ, and both identities; S6's universal-vs-
      drawn distinction and S7's cosmetic-restriction distinction are the two hardest cases and are
      argued explicitly (§2b, §2c) — both unit-independent, unaffected by the revision.
- [x] No caption instruction generalises beyond what §2 licenses (S6/S7 captioning constraints stated
      explicitly for json_author).
- [x] Every state's motion declares archetype C (rotation unrolled) or its dialect variants
      (accumulate/oscillate-track/unroll/cycle-compare/reveal-build/drag-sandbox) from
      `docs/patterns/mathematics.md` §2 — all [LIVE]; nothing needs A/F/G/H/I.
- [x] Rule 31 timeline: §3 table gives every state's `variable_choreography` in the revised degree
      units, pure functions of the state clock (`PM_choreoValue`), no `Math.random()` anywhere;
      controls match the architect table exactly; S8 = ALL(=θ).
- [x] Rule 32 (cause-first structural via reveal order, F4/F18 — no runtime lag encoded anywhere in §3);
      Rule 33 register-triangle + real NUMBER per state (§3); Rule 34 (ONE formula surface per state per
      skeleton §10 h, unchanged; Unicode-only text; value-only HUD; ASCII-minus fix flagged, Callout 4).
- [x] Word budget unchanged from architect (no narration text touched by this block).
- [x] Notation ladder: no formal limit/integral/operator notation anywhere — clean pass, nothing to flag
      (§4/§2e).
- [x] Pixel↔data scale factors declared exactly once (§1b/§6-1) and reused verbatim in every expression
      in the §1b table, now with the degree→radian conversion baked into every trig call consistently
      (13-row table re-audited: every `sin(...)`/`cos(...)` call carries `*PI/180`; every
      `angle_value_expr` deliberately does NOT, since `drawAngleArc` is natively degrees).
- [x] Exact forms on formula surfaces (unchanged, symbolic, radian convention, from skeleton §10 h);
      decimals on the HUD; precision constant (2dp radian slot via `s`, 0dp degree slot via `theta`)
      across all 8 states.
- [x] Drill-down phrasings: 45 total (5×9 clusters), genuine student voice, no textbook prose, no
      Hinglish — unaffected by the units revision.
- [x] `constraints` block: 6 assertions, domain/validity-adjacent items first (§1g), revised for
      degrees-native units.
- [x] Numerical sanity check RUN (python3, pasted above) TWICE — once for the radian-native draft, once
      for the revised degree-native design — every skeleton-asserted pin value reproduced exactly both
      times (as it must: the angle any state shows never changed, only its internal representation).
- [x] Engine bug queue consulted (17 rows, live query); every relevant row discharged by name above;
      directive rows (`teach_visual_must_match_narration` etc.) discharged with the no-time/no-rate-cause
      narration constraint.
- [x] Source check line present.
- [x] Plain-language sweep: no new reader-facing strings authored in this block beyond the dual-unit HUD
      template and the drill-down phrasings (both plain English, no idiom/metaphor/personification —
      "turns", "sweeps", "carries", "lands", never "wants"/"tries"/"escapes").
- [x] `aha_moment`/misconception mathematics check: M1 (sin θ signed, any angle) — true, S3 demonstrates
      it structurally as a definitional generalisation (§2a note), not an exhaustive check. M2 (wave ≠
      path) — true, S4's two-zone coresident design (unchanged from architect). M3 (cos 0 = 1, not 0) —
      exact, verified (`cos(0°)=1.0` in the sanity run). Assessment items (§10 f, unchanged) verified
      against the same formula contract: item 1 (sign of sin 210° = −0.5 exact) ✓; item 3 (cos 0 = 1) ✓;
      item 4 (sin(π−θ) = sin θ, S7) ✓ by the §2c argument.

## Escalations

**None.** No mathematical error found in the skeleton; no theorem cited outside its hypotheses (S6/S7's
domain-vs-drawn-interval distinctions are ledgered above precisely because the skeleton's own claims are
correct and the risk was in HOW json_author might caption them, not in the underlying mathematics); no
motion needs an archetype outside [LIVE] archetype C. One implementation-level ambiguity was found,
resolved, and then RE-resolved within this role's remit after new engine information (§1c: the slider
caption formatter's hardcoded precision + fleet convention decided the degrees-native question) — not an
escalation, a documented constraint-callout resolution, corrected once before handoff.

*Handoff-ready to `json_author`.*
