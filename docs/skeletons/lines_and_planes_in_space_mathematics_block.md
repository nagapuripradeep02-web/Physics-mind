# MATHEMATICS BLOCK — `lines_and_planes_in_space`

> Author: `mathematics_author` (this desk). Upstream: `docs/skeletons/lines_and_planes_in_space_skeleton.md`
> — Checkpoint-A `DESIGN_OK`, CYCLE 1. Adds rigor; does not redesign. §2/§3/§10/§11/§12/§13 are cited
> by number and extended only where numbers needed re-verification or the skeleton's own arithmetic
> disagreed with itself or with the shipped engine — every such place is flagged, never silently fixed.

## ⚠ STATUS CORRECTION — the skeleton's banner is stale; verified against `master` this session

The skeleton's own banner (its lines 6, 12–24) says `vector_geometry_3d` "does not exist on master",
that `lines_planes` is "dispatch VG-C, not yet dispatched", and forbids marking any state `buildable`.
**All three claims are now false.** Verified this session by direct source read (not by trusting the
skeleton's own June-era citations):

- `vgResolveLinesPlanes` — the pure resolver for the entire `lines_planes` half — is implemented at
  `field_3d_renderer.ts:12935–13252`, called from the per-frame driver at `:14453–14464`.
- Every one of the ten "ENGINE DELTAS" the skeleton requested is now SHIPPED: Δ1 `d.points[]` (`:13016`),
  `d.segments[]` (`:13067`), `d.projection` (`:13145`); Δ2 per-object `reveal_at_ms`/`hide_at_ms`
  (`vgRevealFrac`, `:12822`); Δ4 the `no_meeting_point` token (`:13124`, `:13138`, `:13630`); Δ5
  `d.angle_arcs` with a subject (`:13182–13223`); Δ6 the 13-token `lines_planes` half of
  `value_readouts` (`:457–474`); Δ8.3 `span_u`/`span_v` on planes (`:12675–12703`); Δ9 `vg.camera_steps`
  + `camera_mode:"steps"` (`:492`, `:12355–12399`, `:14523–14524`); Δ10 `d.scene_groups` +
  `scene_group`, `camera_mode:"group"` + `d.group_cameras` (`:12841–12854`, `:14315–14335`,
  `:14525–14537`).
- `LP_KNOBS` (`:14437–14451`) is exactly the nine keys the task brief names: `lambda`, `lambda_span`,
  `half_extent`, `q_height`, `line2_offset`, `theta_deg`, `aux_a`, `aux_b`, `scene_group`.
- The gate `npm run check:vector-geometry-3d` (`src/scripts/check_vector_geometry_3d.ts`, 3335 lines)
  exists and exercises this resolver headlessly.

**Every state below is authored as `buildable` on that basis.** The skeleton's own prohibition was
correct for the document it was written into (Round 0, before VG-A…VG-C landed); it is simply out of
date for the codebase this block is written against.

## THREE DIFFS the task brief named, each independently re-verified — plus a FOURTH found

**Diff 1 — `animate[]` field names.** CONFIRMED. The shipped type (`field_3d_renderer.ts:481–485`) is:
```ts
animate?: Array<{
    knob: string; from: number; to: number;
    start_ms?: number; duration_ms?: number;
    easing?: 'linear' | 'smoothstep' | 'ease_out_cubic';
}>;
```
There is no `at_ms`, no `ramp_ms`, no `mode`, no `"ping_pong"`. The resolver (`vgAnimValue`,
`:12317–12338`) is documented in its own header as **one-shot-hold**: *"the value is 'from' for
ms <= start_ms, eases from -> to across [start_ms, start_ms+duration_ms], then HOLDS at 'to' forever —
never a returning triangle."* Authoring the skeleton's `{at_ms, ramp_ms, mode:"ping_pong"}` shape
produces **no motion at all** (every field the resolver reads is `undefined`, so `start_ms` falls back
to 0 and `duration_ms` to 0 — an instant, invisible jump at state-entry). **S9's "λ ping-pongs until a
slider is seized" cannot be built as literally stated** — see §4 S9 below for the honest substitute
(a long, finite, multi-window back-and-forth built from ordinary one-shot windows, not a true infinite
loop) and the FLAG recommending a genuine `mode:"ping_pong"` engine primitive if the founder wants the
real thing.

**Diff 2 — `camera_gate.exempt_pairs` / `min_screen_length_frac` (Δ7).** CONFIRMED NEVER BUILT.
```
grep -n "exempt_pairs\|min_screen_length_frac\|camera_gate" field_3d_renderer.ts check_vector_geometry_3d.ts
→ zero hits, both files
```
The three by-construction-parallel pairs the skeleton discharges "against" this mechanism (S1's `d̂` on
its own line, S3's perpendicular ∥ `n`, S8's `d₁×d₂` at 0.00° to the common perpendicular) are
**discharged against nothing that exists.** Carried forward as an OPEN risk — see FLAGS. It does not
block authoring (a camera solve producing a low pairwise separation on a DESIGN-INTENDED-parallel pair
is a false alarm a human reviewer can read past; it just means `check:vector-geometry-3d`, if it ever
scores this concept's poses automatically, will need a human override on those three pairs rather than
an authored one).

**Diff 3 — `scene_group`/`scene_groups` absent from the `vg` TS type.** CONFIRMED, and **a fourth
instance found in the same family**: `camera_mode` is typed `'authored' | 'steps' | 'auto_frame'`
(`:491`) — **`'group'` is not in the union**, even though the frame driver dispatches on it at
`:14525` (`else if (camMode === "group")`) and reads `d.group_cameras` (`:14532`), neither of which
appears anywhere in the `vg?` type block (`:390–517`). All four fields (`scene_group`, `scene_groups`,
`camera_mode:"group"`, `group_cameras`) validate and run only because Zod is `.passthrough()` on this
config; a `tsc`-checked author (or an IDE autocomplete) would never discover them. Authorability defect
only — not a build blocker, flagged for `json_author`/the surgeon to add to the type declaration on a
future platform pass (Rule 40).

---

## Engine bug queue consultation (own sweep)

```
query_engine_bug_queue.ts lines_and_planes_in_space                      → 0 rows
query_engine_bug_queue.ts --owner alex:mathematics_author                → (none scenario-specific)
query_engine_bug_queue.ts --scenario vector_geometry_3d                  → now runnable (a concept
                                                                             authors this scenario) —
                                                                             re-run recommended by json_author
```
Live `.env.local` was not available at this desk; the dispositions below are argued from direct source
reading (cited by file:line throughout) rather than from a fresh live query, and every `prevention_rule`
named in `patterns/mathematics.md` §4 (hazards 1–11) is checked explicitly against this concept in §2/§7
below. `mathematics_author`'s own prevention rule (`field3d_vg_value_readouts_type_union_omits_every_
lines_planes_token_the_renderer_already_prints`) is **already fixed** — Δ6's union is the 13-token list
verified present at `:462–474`.

## Source verification (read, not trusted from citation)

Every claim in this document that names a file:line was read directly at this session's HEAD, not
copied from the skeleton's own citations (several of which were stale — see FLAGS). Load-bearing reads:
`vg` type (`:390–517`), `vgAnimValue`/`vgAnimKnobs` (`:12260–12353`), `vgCamScheduleAt`/
`vgCamBaseFromState` (`:12355–12418`), `VG_MEET_EPS`/`vgCommonPerp`/`vgLinePlaneMeet` (`:12605,
12730–12783`), `vgResolveLinesPlanes` in full (`:12935–13252`), `vgProjectPoint`/
`vgPairwiseScreenSeparationDeg` (`:13254–13334`), `VG_ROW_RANGE`/`vgControlRange`/`vgSc` defaults
(`:13340–13520`), `VG_ROLE_COLOR`/`vgRoleColor` (`:13914–13927`), `VG_READOUT_LABEL`/`VG_READOUT_DP`/
`vgFx` (`:13598–13720`), the per-frame driver and `LP_KNOBS` (`:14404–14620`), the plane-quad opacity
constant (`:13964`). Cross-referenced against `check_vector_geometry_3d.ts`'s own camera constants
(`:269–280`, confirms `FOV=60`, `ASPECT=16/9`, `TARGET=[0,0,0]`, `UP=[0,1,0]`, and the exact
az/el/dist → world-position formula, byte-identical to what I independently derived from Act I's shipped
camera poses below). Also read: the banked Act I concept,
`Physics-mind-mathematics-vector-products/src/data/concepts/mathematics/vector_products_in_space.json`
(`field_3d_config.vg`, `field_3d_config.states`, `physics_engine_config.variables`) — this is the ground
truth for the chapter-seam claims in §3 and §4, and it disagrees with the skeleton on one material
number (see below).


## ⭐ A FOURTH refutation — Act I's S5 final frame is at **R = 16**, not R = 9 (§5/§14/FLAG 6 are wrong)

The skeleton's §arc rule 5 ruling requires S1 to enter "at Act I's S5 final frame, unchanged — same
pose, same colours, same objects present" and §5/§14/FLAG-6 assert that pose is **az 90° / el 30° / R 9**
(FLAG 6: *"Act I frames a `|a| ≤ 3` apparatus at R 9"*). I read Act I's own shipped JSON instead of
trusting that citation:

```
Physics-mind-mathematics-vector-products/…/vector_products_in_space.json
  field_3d_config.states.STATE_5.camera_position = [0.0, 8.0, 13.8564]
  STATE_5.label = "The cross product's length is an area"
  STATE_5.caption = "The parallelogram appears"   ← the exact content §arc rule 5 names
  STATE_5.vg = { mode:"products", a_mag:3.0, b_mag:2.0 (ramping to 2.5), show_parallelogram:true, … }
```
Converting `[x,y,z] → (R, az, el)` with the renderer's own formula (`updateCameraFromSpherical`,
`field_3d_renderer.ts:4385–4391`, and independently corroborated against `check_vector_geometry_3d.ts`'s
`camPosFromAzEl`, `:277–280` — the two are algebraically inverse and I ran both):

```
x = R·cos(el)·cos(az)   y = R·sin(el)   z = R·cos(el)·sin(az)
[0.0, 8.0, 13.8564]  →  R = 16.0000   el = 30.0000°   az = 90.0000°   (python3, exact to the printed digits)
```

**az/el match the skeleton exactly. R does not — the real value is 16, not 9.** `|a|≤3` is correct
(verified: `a_mag` constant 3.0, `b_mag` ramps 2.0→2.5 in this exact state), so the *apparatus size*
half of FLAG 6's reasoning was right; only the *radius* was assumed rather than read. Consequence:
**S1's entry `camera_position` must be `[0.0, 8.0, 13.8564]` (R 16), not an R-9 pose**, and the
`camera_steps` ease direction is a **pull-in to R 13** (16→13), not the skeleton's stated "R 9 → 13"
pull-back. This does not introduce a NEW framing risk — a *larger* entry radius only shrinks the
apparatus further inside the frame (entry fill would be smaller than the skeleton's claimed 0.223, not
larger), so there is no off-frame hazard — but it is a real correction to the choreography's *direction
of motion* (the camera now moves IN as the line extends and λ begins sweeping, not out), and the exact
fill/min-pairwise-separation numbers in the skeleton's §5/§14 S1 row should be treated as unverified
until re-solved at R 16 by whoever owns the camera-solve step next. **FLAG 6's own hedge — "if the
founder reads 'same pose' as including R, only the ease is at issue" — resolves in the "yes, it does"
direction: R is part of the pose, and the correction is authored below.**

---

## 1. `engine_config`

The shape below mirrors Act I's own `physics_engine_config` (`variables`/`formulas`/`computed_outputs`/
`constraints`) plus the scenario's own `field_3d_config.vg` body — the two live as separate top-level
JSON keys in the shipped shape, and `mathematics_author` specs both because the `vg.animate[]`/
`camera_steps` timelines in §4 are only checkable against a declared domain.

```jsonc
// physics_engine_config.variables — UNITLESS by definition (mathematics quantities carry no unit;
// "unit":"unitless" is Act I's own house convention, kept here for shape-parity, not required by schema)
{
  "variables": {
    "lambda":       { "name": "position along a line (arc length from its anchor, unit direction)",
                       "unit": "unitless", "min": -3.5, "max": 3.5, "default": 0.0 },
    "lambda_span":  { "name": "half-length each drawn line extends either side of its anchor (S9 only)",
                       "unit": "unitless", "min": 2.5, "max": 5.0, "default": 4.0 },
    "half_extent":  { "name": "plane patch half-width (S2 breathing range 1.5-3.0; S9 up to 4.5 — REQUIRES a per-state vg.control_ranges override, see §3)",
                       "unit": "unitless", "min": 1.5, "max": 4.5, "default": 3.0 },
    "q_height":     { "name": "the free point q's authored offset along +y from its base (x,z) position",
                       "unit": "unitless", "min": 0.0, "max": 3.0, "default": 1.19 },
    "line2_offset": { "name": "S9 group-B only: slides the skew line M2's anchor along d2-hat",
                       "unit": "unitless", "min": -2.5, "max": 2.5, "default": 0.0 },
    "theta_deg":    { "name": "angle between the two skew directions d1, d2 (S6 sweep; camera fidelity VERIFIED only on this exact interval, see §2b)",
                       "unit": "deg", "min": 25, "max": 115, "default": 69.3846 },
    "aux_a":        { "name": "S3-only scratch parameter: in-plane sweep coordinate s along basis.u through the true foot",
                       "unit": "unitless", "min": -2.2, "max": 1.6, "default": 0.0 },
    "aux_b":        { "name": "S2-only scratch parameter: 0-1 lerp fraction for the dot-product test-vector sweep",
                       "unit": "unitless", "min": 0, "max": 1, "default": 0 }
  }
}
```

**`scene_group` is an enum control (`"A"|"B"`), never a numeric variable — declared under `controls` in
§3/§4, not here.** See §3 for the full reconciliation of every knob's ENGINE default range against the
domain stated above (several require an authored `vg.control_ranges` override; two do not need one).

**`vg` (concept-wide, `field_3d_config.vg`):**
```jsonc
{
  "mode": "lines_planes"
  // No color_* overrides authored. VG_ROLE_COLOR's DEFAULTS (field_3d_renderer.ts:13915-13917) are
  // dir1 #F5A623 (amber) / dir2 #3FC8E4 (cyan) / third #E15FA8 (magenta) / derived #5BD97A (green) /
  // region #8B6FE8 (violet) / neutral #D8DEE9 -- an EXACT, verified match to skeleton §3's restored
  // Act-I role table and to Act I's own vg.color_a/b/c/cross/derived hex literals. Overriding would be
  // redundant; the closed 6-role enum (13919-13923: "cannot invent a sixth") is the mechanism that KEEPS
  // "green never means an input" true across both acts without per-concept authoring.
}
```
Every drawn object below authors `role` from EXACTLY that six-token set (`dir1`/`dir2`/`third`/
`derived`/`region`/`neutral`) — never a bare hex, never a seventh word.

**`computed_outputs` / `constraints`:** the `lines_planes` half computes everything inside
`vgResolveLinesPlanes` (a pure function of the authored scene + live knobs + state-ms, §ⓘ above) — there
are no author-side formula strings to evaluate (unlike Act I's `products` mode, which is expression-based
in `physics_engine_config.formulas`). `computed_outputs` is therefore empty for this concept; every
number a teacher reads comes from `vg.value_readouts` tokens resolved inside the renderer itself.
`constraints` (domain-first, the eight assertions this design depends on) is given as its own section,
§6, after the ledger and timeline establish what each one is protecting.


## 2. Domain & validity ledger — THE CENTRAL ARTIFACT

### 2a. Every relation, its domain/range, its excluded points, its drawn interval, its boundary behaviour

| Relation | Domain | Range / excluded points | Drawn interval | Boundary behaviour |
|---|---|---|---|---|
| Line `r = a + λd̂` (S1, S4–S9) | `λ ∈ ℝ` — no exclusion (a line has no undefined point) | every point on the line | `λ ∈ [−3.5, 3.5]` guided (S1); the line's DRAWN geometry is clipped to the bounding sphere `‖p‖ ≤ R` (default `R = 4.5`, `VG_SCENE_RADIUS`, `field_3d_renderer.ts:12606`) whenever no `lambda_span` is bound — the marker itself is HIDDEN, never clamped, once `λ` leaves the drawn span (`:12977`: *"a lambda past the drawn end is not clamped back onto the line"*) | a line missing the bounding sphere entirely (`vgSphereClipSpan` discriminant `≤ 0`) is drawn as **nothing** — `vgLineEnds` returns `null` (`:12638,12653`) rather than a degenerate stub. No line in this concept's authored scene misses the sphere (checked: every anchor lies within `R=4.5`, guaranteeing a non-empty clip) |
| Plane `n̂·(r − a) = 0` (S2–S4, S7, S9) | `r ∈ ℝ³` — no exclusion | the whole plane; `n ≠ 0` is a HARD precondition (`vgPlaneBasis` returns `null` and the plane draws nothing if `‖n‖ < 0.5`, `:12682`) | patch clipped to `half_extent ∈ [1.5, 4.5]` (a finite parallelogram, never the infinite plane) | an authored `half_extent` outside its slider range is silently accepted by the resolver (it only reads `d.half_extent`/the `half_extent` knob as a number) but the SLIDER that exposes it clamps at its own bounds — see §3 |
| Point-to-plane distance `d = \|n̂·(q−a)\|` (S3) | defined for every `q ∈ ℝ³`, every valid plane | `d ≥ 0` always (the `Math.abs` in `vgFootOnPlane`, `:12727`) — **never negative, never signed on screen** | `q` ranges via `q_height ∈ [0, 3]` | `d = 0` exactly when `q` lies IN the plane (foot = q); this concept never authors that case (`q_height`'s default 1.19 keeps `q` off the plane at every rendered frame — checked: distance 2.198 at default) |
| Line-plane meeting (S4, S9) | defined for every `(line, plane)` pair | **two cases, exhaustive, mutually exclusive**: `d̂·n̂ ≠ 0` (unique point) or `d̂·n̂ = 0` (no point, ever) — there is no third case (a line cannot meet a plane at 2+ points unless it LIES in the plane, which is `d̂·n̂=0` AND the anchor already on the plane — S4 authors `Lpar` off the plane, so this concept never renders the degenerate "line-in-plane" sub-case) | `λ` of the meeting point, when it exists, is unbounded in principle but must fall inside the line's OWN drawn span or the marker silently does not appear (`:12977`, same guard as above) — checked for `Lcut`: `λ=2.600` is well inside its own sphere-clip span | the epsilon that decides which case: `VG_MEET_EPS = 1e-9` on `\|d̂·n̂\|` (`:12605, :12778`) — see 2c |
| Skew-line shortest distance (S5, S8, S9) | defined for every `(line1, line2)` pair | `d ≥ 0`; **exists as a unique PERPENDICULAR SEGMENT only when `d1̂ × d2̂ ≠ 0`** (i.e. the two directions are not parallel) — the parallel/coincident case still has a well-defined DISTANCE (`\|w × d̂1\|`) but no unique common-perpendicular DIRECTION, and the engine returns `exists:false, dir:null` for it (`vgCommonPerp`, `:12746–12751`) | this concept's authored skew pair (M1/d1, M2/d2) has `‖d1×d2‖ = 0.936` (verified below) — always non-degenerate on screen; the drill-down cluster `parallel_lines_break_the_formula` (§7) is exactly the case this concept NEVER renders as a live state, only discusses | epsilon `crn < 1e-9` (`:12743`) — same order of magnitude as the line-plane epsilon, deliberately (both guard a cross/dot product of UNIT vectors, so both live on the same natural scale) |
| Angle between two lines (S6, S9) | `θ ∈ [0°, 180°]`, undirected, over the FULL range (`vgAngleDeg`, `:12620–12625`) — **deliberately not folded to the acute [0°,90°] convention**, because S6's readout must track a continuous rotation through 90° without doubling back | `d̂1·d̂2 ∈ [−1, 1]` always (Cauchy–Schwarz, both unit) | `θ ∈ [25°, 115°]` is the ONLY interval the camera fidelity was measured over (§14 P2-2: `worst |screen−true| = 0.88°`, S6 pose; `3.70°`, S9-B pose) — **outside `[25°,115°]` the arc's on-screen accuracy is UNMEASURED**, see 2b | `θ=0°`/`180°` (coincident/anti-parallel directions) never arise on this concept's swept range |
| Angle line-to-plane (S7) | `θ_normal, θ_plane ∈ [0°, 90°]` each, **`θ_normal + θ_plane = 90°` by construction** (`vgLinePlaneAngles`, `:12788–12793`: `to_plane = 90 − to_normal`, a subtraction, never a second measurement) | `\|d̂·n̂\| ∈ [0,1]` | S7 renders exactly one static configuration (`Lcut`, `35.00°`/`55.00°`) — no sweep | the identity `35+55=90` holds by CONSTRUCTION for every line/plane pair this resolver is ever given, not only for `Lcut` — it is not a fact special to this concept's numbers |

### 2b. Named theorem, hypotheses checked, for every "always/never" claim on screen

> **Claim (S3, PRIMARY aha): "the perpendicular segment from a point to a plane is shorter than every
> other segment from that point to the plane."**
> **Theorem.** For a plane `P` with unit normal `n̂` and a point `q ∉ P`, let `F` be the foot of the
> perpendicular from `q`. For any OTHER point `G ∈ P`, `G ≠ F`: `‖q−G‖² = ‖q−F‖² + ‖F−G‖² > ‖q−F‖²`
> (Pythagoras — `q−F` is parallel to `n̂` and `F−G` lies in `P`, hence perpendicular to `q−F`).
> **Hypotheses:** `P` a plane, `q` any point not on it. No further condition.
> **This setup:** S3's plane (`P1`) and point (`q`, default `(1.93,1.19,0.51)`, `q_height` range
> `[0,3]`, never `0` at any authored default) satisfy the hypothesis trivially at every rendered frame.
> **Verified, not just cited** — three sample feet, all on the SAME straight in-plane path through the
> true foot: `s=−2.2 → 3.1086`, `s=0 (the true foot) → 2.1983`, `s=+1.6 → 2.7201` (python3, §
> Numerical sanity check) — every "wrong" foot is strictly farther, confirming the theorem's inequality
> is not merely asserted but demonstrated by the state's own three sampled points.

> **Claim (S4): "a line meets a plane at exactly one point, unless `d̂·n̂ = 0`, in which case it never
> meets."**
> **Theorem.** Substituting `r=a+λd̂` into `n̂·(r−p)=0` gives `λ(d̂·n̂) = n̂·(p−a)`, linear in `λ`. If
> `d̂·n̂ ≠ 0` this has the UNIQUE solution `λ=n̂·(p−a)/(d̂·n̂)`. If `d̂·n̂=0` and `n̂·(p−a)≠0` there is no
> solution (parallel, off the plane). If `d̂·n̂=0` AND `n̂·(p−a)=0` the ENTIRE line lies in the plane —
> the theorem's third, degenerate case, which this concept never renders (checked: `Lpar`'s anchor
> `(0,−0.4,0)+1.4n̂` is offset OFF the plane by construction, so `n̂·(p−a) = 1.4 ≠ 0` at every frame).
> **Hypotheses:** none beyond `d̂, n̂` both well-defined unit vectors (`‖d‖,‖n‖ ≥ 0.5` pre-check,
> `vgLinePlaneMeet:12776`). **This setup satisfies them; the third (in-plane) case is a real omission,
> not a bug** — flagged in §7 constraint callouts so `quality_auditor` can confirm the narration never
> implies "meets once or never" is exhaustive of every geometric possibility, only of the two this
> concept's own drawn examples ever produce.

> **Claim (S5/S8, SUPPORTING aha): "two lines that are not parallel and share no point are skew, and
> the gap between them is a well-defined perpendicular length."**
> **Theorem.** For two lines with directions `d̂1, d̂2` and `d̂1×d̂2 ≠ 0`, the shortest distance is
> achieved along the UNIQUE common perpendicular direction `n̂c = (d̂1×d̂2)/‖d̂1×d̂2‖`, and equals
> `\|(a2−a1)·n̂c\|`. **Hypotheses:** `d̂1×d̂2 ≠ 0` (not parallel). **This setup:** verified directly —
> `‖d1×d2‖ = 0.936 ≠ 0`; the two computed feet `F1=(0.108,−0.704,1.058)`, `F2=(0.626,−2.213,0.225)`
> satisfy `(F2−F1)·d̂1 = −2.2×10⁻¹⁶ ≈ 0`, `(F2−F1)·d̂2 = 0.0×10⁺⁰⁰` (both orthogonality checks pass to
> float precision — python3, §Numerical sanity check), and `‖F2−F1‖ = 1.8000000000000003 ≈ 1.800`
> (authored exactly). **The claim "not parallel and no common point ⇒ skew, with a real, measurable gap"
> is demonstrated on THIS pair, not merely asserted.**

> **Claim (S6): "the angle between two lines depends on their directions alone — sliding either line
> along itself never changes it."**
> **Fact, not a theorem with hypotheses to check — an algebraic identity.** `vgAngleDeg(d̂1,d̂2)`
> (`:12620–12625`) is a pure function of the two DIRECTION vectors; it never reads either anchor. Sliding
> an anchor `a1 → a1+t·d̂1` cannot change the printed angle because the anchor is not one of the
> function's inputs — this is true by CONSTRUCTION of the readout, not by a geometric argument that could
> have exceptions. **The claim is universally true and needs no scope check** — the only thing this
> ledger must confirm is that S6's choreography (anchors sliding while the arc holds) actually EXERCISES
> that independence rather than merely asserting it, which §4's S6 timeline does (both anchors slide
> 0–8000 ms while `theta_deg`'s knob, and therefore the arc, is untouched — 32b compliant).

### 2c. Degeneracy epsilon — the exact scar this concept's own §11 flags, discharged

`VG_MEET_EPS = 1e-9` (`field_3d_renderer.ts:12605`) gates BOTH degeneracy checks this concept uses:
`vgLinePlaneMeet` (`\|d̂·n̂\| ≤ 1e-9 ⇒ no meeting point`, `:12778`) and `vgCommonPerp` (`crn < 1e-9 ⇒
parallel, no common perpendicular`, `:12743`). **Both operands are always UNIT vectors** (both functions
normalize before the dot/cross), so the tested quantity is bounded in `[−1,1]` (dot) or `[0,1]` (cross
magnitude) — `1e-9` on that scale is an angular tolerance of roughly `5.7×10⁻⁸` degrees off exactly
parallel/perpendicular, tight enough that no GENUINE near-miss (any real angle differing by a
measurable fraction of a degree) is ever misclassified, while a line AUTHORED to be exactly parallel
(via literal numbers satisfying the algebraic constraint) reliably falls below it: this concept's own
`Lpar` measures `d̂·n̂ = 2.8×10⁻¹⁷` — eight orders of magnitude inside the epsilon, and NOT exactly `0`
(ordinary double-precision round-off), which is precisely the scar the skeleton's own dispositioning
table names: `parallel_direction_cross_product_is_1e-17_not_zero_so_an_exact_zero_guard_ships_a_
plausible_wrong_distance`. **Verified discharged, not merely cited**: the guard is `≤ VG_MEET_EPS`
(an inequality), never `=== 0` (an exact-equality test), at both call sites. No authoring action is
needed — this is a property of the shipped resolver, correct by construction, for any concept that uses
it.

### 2d. Exact-before-decimal / precision doctrine — engine-VERIFIED, not just asserted

The skeleton's own doctrine (§10h: "distances/dot products 3 dp, angles 1 dp, coordinates 2 dp, λ
3 dp") is not merely a design intention — it is **already the shipped default** for every
`lines_planes` token: `VG_READOUT_DP = {point_plane_distance:3, skew_distance:3, d_dot_n:3, n_dot_v:3,
n_norm:3, cross_norm:3, numerator_triple_product:3, lambda:3, angle_lines_deg:1, angle_line_plane_deg:1,
angle_line_normal_deg:1}` (`:13654–13658`); coordinates print via `vgFmtPoint` at a HARDCODED 2 dp
(`:13634–13636`); neither table is authorable per-concept, so there is no way to accidentally ship a
different precision. `vgFx` clamps `|v| < 0.5×10⁻ᵈᵉᶜ → 0` before formatting (`:13646–13649`) — a
negative-zero guard already in place for the one place it could bite this concept (`n·d = 0.000` on the
parallel line, `S4`; already exactly at the epsilon-guarded case). **Formula surfaces carry the exact
symbolic form** (`d=|n̂·(q−a)|/‖n‖`, not a decimal) per Rule 34b/38c — see §5.

### 2e. Numeric verification results — every derived number in the skeleton re-run, disagreements reported

Recomputed independently in python3 (full log in the Numerical sanity check section) from the RAW
authored geometry in §11 of the skeleton, replicating the shipped resolver's own formulas
(`vgFootOnPlane`, `vgCommonPerp`, `vgLinePlaneMeet`, `vgLinePlaneAngles`, `vgAngleDeg`) rather than
trusting the skeleton's printed arithmetic.

**Discriminating check chosen, and why.** Per the task brief's own precedent (a vector construction that
validated on Volume — a quantity invariant under the very error that had been made — and passed while
wrong), I chose the S5/S8 skew-pair reconstruction to validate against **five INDEPENDENT numbers that
do NOT share a common error mode**: the shortest distance (1.800), the cross-product norm (0.936), the
numerator (1.685), BOTH feet as full 3-vectors (not just their separation), and the angle between
directions (69.38°). A construction that gets M2's anchor point wrong by any single-axis error would
match the DISTANCE (which several different wrong M2's could coincidentally reproduce — distance alone
does not discriminate) but would almost certainly NOT reproduce two independent 3-vector feet to three
decimal places AND the cross-norm AND the numerator simultaneously — five numbers derived from four
different sub-computations (`cross`, `dot`, two linear solves for `t1`/`t2`) sharing no algebraic
identity that could make them agree for the wrong reason. All five matched to the precision printed:

| Quantity | Skeleton's stated value | Recomputed (python3) | Verdict |
|---|---|---|---|
| Skew shortest distance | 1.800 | 1.8000000000000003 | ✓ MATCH |
| `‖d1×d2‖` | 0.936 | 0.935965050771015 | ✓ MATCH |
| `(a2−a1)·(d1×d2)` | 1.685 | 1.6847370913878272 | ✓ MATCH |
| Foot 1 | (0.11, −0.70, 1.06) | (0.10835, −0.70375, 1.05792) | ✓ MATCH |
| Foot 2 | (0.63, −2.21, 0.23) | (0.62616, −2.21334, 0.22546) | ✓ MATCH |
| `d1·d2` / angle | 0.352 / 69.4° | 0.352093 / 69.3846° | ✓ MATCH |
| S3 comparison feet (`s=−2.2,0,+1.6`) | 3.110 / 2.200 / 2.721 | 3.1086 / 2.1983 / 2.7201 | ✓ MATCH |

**Two DISAGREEMENTS found and reported, not adopted:**

1. **S4/S7's `n·d` is printed as `0.624` throughout §3/§10(b)/§10(h) of the skeleton, but the value the
   SHIPPED ENGINE will actually render is `0.574`.** `vgLinePlaneMeet`'s `d_dot_n` field (`:12777`,
   `dn = vgDotVec(d,n)`) is computed from **two already-normalized unit vectors** — this is the exact
   quantity the S4/S7 HUD row `n·d` prints (`VG_READOUT_LABEL.d_dot_n = "n·d"`, `:13620`). The skeleton's
   OWN §11 independently derives `Lcut`'s angle to the normal as `55.00°`, and `cos(55°) = sin(35°) =
   0.573576…` — **this is exactly the value §11 itself states**, written as "`n·d̂ = 0.5736`"
   (skeleton line 568). The `0.624` figure recurring elsewhere in the SAME document only arises from
   `d̂ · n_raw` (a unit direction dotted with the UN-normalized normal, `‖n_raw‖=1.0886`: indeed
   `0.5736 × 1.0886 = 0.6245 ≈ 0.624`) — a different, internally-inconsistent convention that the engine
   never computes for this readout. **`0.624` will never appear on the rendered HUD; `n·d = 0.574`
   (3 dp) will.** This is precisely the `patterns/mathematics.md` hazard-4 risk ("two instruments for
   one quantity will eventually disagree") baked into the design document itself, and precisely the
   `formula_surface_states_an_identity_in_a_unit_the_hud_never_renders` bug class the skeleton's own
   queue-consultation table claims to have satisfied (line 77: *"every surface identity evaluated
   against its own HUD numbers this session"*) — it was not, for this one token. `λ = 2.600` is
   UNAFFECTED (the ratio `λ = n·(p−a)/(n·d)` is scale-invariant in `n`, so using `n_raw` vs `n̂`
   consistently in both numerator and denominator cancels — verified: the skeleton's own printed
   `1.617/0.6244 = 2.590` and the corrected `(1.617/1.0886)/0.5736 = 1.485/0.5736 = 2.589` agree to
   the fourth decimal). **Fix: replace every `n·d = 0.624` occurrence with `n·d = 0.574` (§3 S4 delta
   text, §10(b)'s defined-in row, §10(h)'s S4/S7 identity-check text); leave `λ = 2.600` as authored.**

2. **§4 and §14 both state the two skew lines' screen images cross "at `t = 0.815` along line 1"; §3's
   own S5 control-table row and §14's own probe-output block state `t = 0.495` for the SAME event, in
   the SAME document.** These two numbers cannot both be right. I independently re-derived the crossing
   from first principles: projected both lines through the S5 camera pose (`R=13, az=146°, el=4°`,
   `TARGET=[0,0,0]`, `UP=[0,1,0]`, `FOV=60°` — the exact model in `vgProjectPoint`/`camPosFromAzEl`,
   verified against `check_vector_geometry_3d.ts:277–280`), solved the 2D screen-line intersection
   analytically (both `camX(s)`, `camY(s)`, `camZ(s)` are affine in the arc-length parameter `s`, so the
   screen coordinates are an exact rational function of `s`, solvable in closed form rather than by
   root-finding), and inverted back onto each 3D line. **Result: the crossing occurs at `s₁ ≈ −0.639`
   (raw arc length from `M1`) on line 1, which is `≈ 0.305` as a fraction of line 1's own
   sphere-clipped drawn span (`[−3.278, 5.381]` at the default `R=4.5`).** This matches NEITHER `0.495`
   nor `0.815`, under any of the normalizations I tried (raw arc length, fraction of drawn span, fraction
   of the OTHER line's span). **The qualitative claim is confirmed true independently — the two lines'
   screen images genuinely do cross at this camera pose (two distinct 3D points, `‖P1−P2‖ = 2.805`,
   project to the identical screen pixel `(sx,sy)=(−0.0599,−0.0974)`) — but neither cited parameter value
   should be trusted, and the two citations contradict each other within the same skeleton.** Practical
   consequence for authoring: the crossing-pixel marker (§4 S3 control table: *"a marker pulses at the
   crossing pixel"*) must be authored as a literal 3D point AT one of the two computed crossing points
   (either works — they project to the same pixel under the FIXED S5 entry pose; I recommend the point ON
   LINE 1, `(−1.797, −0.990, 0.391)`, since S5's narration order draws line 1 first), **not derived from
   either "t" value in the skeleton**, and the marker must be a `points[]` entry with `hide_at_ms` set to
   remove it once the 1.5 s pulse ends (§4). Full derivation in the Numerical sanity check log.


## 3. Quantity declarations — `LP_KNOBS` reconciled against the skeleton's §10(c) drawn intervals

Every one of the nine `LP_KNOBS` keys, its ENGINE-SHIPPED default slider range (read from `vgSc(...)`
calls, `field_3d_renderer.ts:13500–13504`, and `VG_ROW_RANGE`, populated at `:13508`), the skeleton's
§10(c) domain, and the verdict:

| Knob | Engine default range (step, default) | Skeleton domain (§10c) | Verdict |
|---|---|---|---|
| `lambda` | `[−5.0, 5.0]` (0.05, `0.0`) | `[−3.5, 3.5]` guided | **Engine range is WIDER than the guided design domain.** No override is REQUIRED for S1 to function (the marker simply vanishes past the line's drawn span if dragged beyond it — by design, `:12977`), but a teacher dragging S1's live `lambda` row past `±3.5` sees the marker disappear before the slider hits its own end-stop, which reads as a defect if unexplained. **Recommend** `vg.control_ranges: {lambda:{min:-3.5,max:3.5}}` on S1 only, so the slider's own end-stops match the line's own visible extent. |
| `lambda_span` | `[1.0, 5.0]` (0.1, `4.0`) | `[2.5, 5.0]` explore | Engine range is wider (permits down to 1.0). **Recommend** `vg.control_ranges:{lambda_span:{min:2.5,max:5.0}}` on S9 (both groups) to honour the architect's stated floor — not load-bearing (nothing breaks below 2.5, the drawn lines just get short), a design-intent match only. |
| `half_extent` | **`[1.0, 3.0]`** (0.05, `3.0`) | `[1.5, 4.5]` | **MUST override.** The engine's shipped ceiling (3.0) is BELOW the skeleton's stated upper domain (4.5) — without `vg.control_ranges:{half_extent:{min:1.5,max:4.5}}` on S9, the explore slider physically cannot reach 4.5 and the S9-A camera solve's own swept range (which the skeleton's worst-case law assumed covered up to 4.5) is not actually reachable by a teacher. S2's own breathing range (`1.5↔3.0`, §12) fits inside the ENGINE default with no override needed there. |
| `q_height` | `[0.0, 3.0]` (0.05, `1.19`) | not separately stated | Engine default matches the authored point `q`'s y-coordinate (`1.19`) exactly at its default — no override needed. |
| `line2_offset` | `[−2.5, 2.5]` (0.05, `0.0`) | not separately stated | Engine default adopted as-is — no override needed. |
| `theta_deg` | `[20, 160]` (1, `60`) — **SHARED with Act I's `products` mode row** | `[25, 115]` | **MUST override for legibility, not correctness.** The engine will happily accept `theta_deg` outside `[25,115]`, but the camera fidelity claim (§14 P2-2: worst screen-vs-true error `0.88°`/`3.70°`) was measured ONLY over `[25°,115°]` — dragging past it (down to 20° or up to 160°) puts the arc's on-screen accuracy in genuinely unmeasured territory, and may also push the exempt-pair risk (Δ7, still OPEN) into a regime nobody has scored. **Recommend** `vg.control_ranges:{theta_deg:{min:25,max:115}}` on S6 AND on S9's group-B rows. Note the default value: at `theta_deg=69.3846°` (the base configuration, not `60`) `d2` sits at its AUTHORED pose — S6 and S9-B should NOT inherit the products-mode default of `60`, or the sandbox opens on a `d2` that has silently rotated off its authored position (`typeof`/`in`-checked presence per the shipped `optional_config_field_with_a_legal_zero_value_is_resolved_by_truthiness` prevention rule — `d.theta_deg` must be explicitly authored as `69.3846`, never left to the shared default). |
| `aux_a` | **not a slider-bound knob at all** (absent from `VG_ROW_DEC`/`rowIds`/`sliderIds`, `:13354–13364, 13386`) | `[−2.2, 1.6]` internal (S3's comparison-foot sweep coordinate) | Never exposed to the teacher; driven exclusively by `vg.animate[]` (S3 only). No slider row exists to range-check. |
| `aux_b` | not slider-bound (same as `aux_a`) | `[0, 1]` internal (S2's dot-product test-vector sweep fraction) | Never exposed; `vg.animate[]`-only (S2 only). |
| `scene_group` | not a numeric knob — a `<select>` (`vg_scene_group_select`, `:13512–13520`) | `"A" \| "B"` | S9 only; option labels authored via `d.scene_groups:[{key,label},…]`. |

**A UX consequence of the control-visibility mechanism worth flagging, not fixing:** `d.controls`
(which rows are shown/enabled) and `d.control_ranges` are both read ONCE per STATE ENTRY
(`applyVectorGeometry3DState`, `:14384–14401`), never re-evaluated when the `scene_group` `<select>`
changes mid-state. **S9's `controls` array must therefore be the UNION of both groups' knobs**
(`lambda, lambda_span, half_extent, q_height, theta_deg, line2_offset` — everything either group uses),
so whichever group is selected has its relevant sliders visible. A side effect: while group B is
selected, `half_extent`'s slider is still visible and live but has NO visible effect (group B's objects
don't include the plane); while group A is selected, `theta_deg` is visible but does nothing (group A's
objects don't include the skew pair). This is harmless (a "dead" slider, not a wrong number) and is not
fixable without a reactive per-group control-list mechanism the engine does not have — recorded here so
`quality_auditor` does not mistake it for a defect.


## 4. Within-state motion timeline + per-state control spec (Rule 31), on the SHIPPED `animate[]` surface

**Precision doctrine (2d) and role vocabulary (§1) apply to every state below without restatement.**
Every `animate[]` entry uses ONLY `{knob, from, to, start_ms, duration_ms, easing}` — no `at_ms`,
`ramp_ms`, or `mode`. Every camera move uses `vg.camera_mode` + either `vg.camera_steps`
(`{at_ms, az, el, dist, ease_ms}` — note this schedule DOES use `at_ms`, a genuinely different field
name from `animate[]`'s `start_ms`; the two mechanisms are not interchangeable and must not be
cross-authored) or `vg.camera_mode:"group"` + `vg.group_cameras`.

### STATE_1 — "One Number Names Every Point on a Line"
`parameter-sweep` · core · `manual_click` · register: **graphical leads, numeric supports** (Rule 33d
number: the live coordinate on the λ marker) · words 34–42.
**Camera (CORRECTED, §⭐ above):** `camera_position:[0.0, 8.0, 13.8564]` (R16/az90/el30, Act I's
STATE_5 literal, verbatim) · `camera_mode:"steps"` · `camera_steps:[{at_ms:0, az:94, el:6, dist:13,
ease_ms:4000}]` (the ease spans the dim-down + line-extend window, arriving at Act II's working pose by
the time λ begins sweeping).
**Objects:**
- `planes:[{id:"P1", point:[0,-0.4,0], normal:[0.35,1,0.25], span_u:<authored so the derived basis.u
  lands at (0.943,-0.331,0), matching Act I's parallelogram edge>, half_extent:3.0, role:"region",
  show_normal:true, normal_label:"n", ghost_at_ms:300, ghost_opacity:0.25}]` — enters FULL BRIGHT
  (Act I's own final frame, unchanged), dims to ghost starting 300 ms in (the engine's ghost fade is a
  FIXED 600 ms, `vgGhostFactor`, `:12833–12839` — not authorable; `ghost_at_ms` only sets WHEN it
  starts, so 300 ms leaves a brief bright hold before the 600 ms fade completes by ~900 ms, comfortably
  inside the skeleton's stated "0–2000" window).
- `lines:[{id:"L1", point:[-0.8,0.6,-0.5], dir:[1,0.35,0.6], role:"dir1", label:"d", reveal_at_ms:2000,
  grow_ms:2000, show_lambda_marker:true, lambda:{knob:"lambda"}}]` — extends 2000–4000 ms.
- `animate:[{knob:"lambda", from:-3.5, to:3.5, start_ms:4000, duration_ms:13000, easing:"linear"}]` —
  the one-shot-hold naturally supplies the "hold" phase for free once `duration_ms` elapses (17000 ms):
  no extra authoring needed for the hold.
- `value_readouts:["lambda"]` (HUD row `λ = …`, 3 dp) plus the coordinate label riding the marker
  (`a = (−0.80, 0.60, −0.50)` static, `λ`'s own live position — both DOM-readable, `:439–441`).
- `controls:["lambda"]`, `vg.control_ranges:{lambda:{min:-3.5,max:3.5}}` (§3).
**Checked:** at `eye_capture_ms:12000`, `u=(12000-4000)/13000=0.6154`, linear ⇒ `λ = −3.5+0.6154×7 =
0.808` — "mid-sweep", matches the skeleton's qualitative description.

### STATE_2 — "A Normal Direction Fixes a Whole Plane"
`reveal-build` · core · register: **graphical leads; the S2-only beat is symbolic-adjacent** (the
perpendicularity TEST, `n̂·v`, is a number, not a formula — kept off the formula surface per 38c, see §5)
· words 44–52.
**Objects:** `P1` (same object, now BRIGHTENING back from ghost — `ghost_at_ms` simply absent/undefined
in S2's own `d`, so `vgGhostFactor` returns 1 for the whole state, i.e. full bright throughout; the
patch itself unfolds via `reveal_at_ms:2500, grow_ms:4000` acting on `half_extent`'s own `frac` scaling,
`bind_half_extent:true` is NOT set here — `half_extent` breathes on an AUTHORED literal via a SEPARATE
mechanism, see below), `L1` retiring to ghost (`ghost_at_ms:0` on `L1` this state, engine 600 ms fade).
**The dot-product introduction beat (6500–15000 ms), SAFE two-segment recipe (avoids the
readout-collision hazard below):**
```
segments: [
  { id:"test_v_inplane", role:"neutral", from:"P1",
    to: { lerp: [ {on:"P1", u:-1.3, v:0.6}, {on:"P1", u:1.1, v:-0.8} ], t:{knob:"aux_a"} },
    reveal_at_ms:6500, hide_at_ms:11200, readout:"n_dot_v", against:"P1" },
  { id:"test_v_offplane", role:"neutral", from:"P1",
    to: { lerp: [ {on:"P1", u:1.1, v:-0.8}, <literal off-plane point = P1.point+1.1u-0.8v+1.8n̂> ],
          t:{knob:"aux_b"} },
    reveal_at_ms:11200, readout:"n_dot_v", against:"P1" }
],
animate: [
  { knob:"aux_a", from:0, to:1, start_ms:6500,  duration_ms:4000, easing:"smoothstep" },
  { knob:"aux_b", from:0, to:1, start_ms:11200, duration_ms:2800, easing:"smoothstep" }
]
```
**Why this is safe (§2c's hazard-4 discipline, applied prophylactically).** Readout resolution in
`vgResolveLinesPlanes` is UNCONDITIONAL — it runs every frame for EVERY authored segment regardless of
`reveal_at_ms`/`hide_at_ms` (`:13066–13083`), and `out.readouts.n_dot_v` is overwritten by whichever
matching segment is LAST in the array. Both endpoints of `test_v_inplane`'s lerp are IN-PLANE addresses
(`{on:"P1", u:_, v:_}` with no third coordinate leaving the plane), so its `n̂·v` is **exactly 0 for
every value of `t`, not just for `t∈[0,1]`** — safe no matter what `aux_a` is doing before/after its own
window. `test_v_offplane`'s FIRST endpoint is the SAME in-plane point `test_v_inplane` ends on, so
before `aux_b`'s window opens (`t` holds at its `from=0`), `test_v_offplane` ALSO reads exactly
`n̂·v=0` — the two segments never disagree, and because `test_v_offplane` is listed second, its value
(correctly 0 during phase 1, correctly ramping during phase 2) is what survives into the HUD at every
frame. **This two-segment, ordered-array construction is a general recipe worth recording as a candidate
`engine_bug_queue` prevention row** (see FLAGS) — a naively-ordered or single-instrument version of this
exact beat would print a plausible-looking but silently wrong `n·v` during the wrong phase.
**Objects, continued:** `value_readouts:["n_norm","n_dot_v"]`. `controls:["half_extent"]`.
**Checked (qualitative):** phase 1 (6500–10500 ms) `n̂·v ≡ 0.000`; phase 2 (11200–14000 ms) ramps off
zero; both endpoints chosen so the tip visibly leaves the drawn patch by full reveal.

### STATE_3 — "The Perpendicular Is the Shortest Segment" (PRIMARY AHA)
`sweep-to-extremum` (coined, per skeleton) · core · **`misconception_watch`: M1** · register:
**graphical leads, numeric is the whole payoff** (Rule 33d: the falling→rising `distance` readout IS
the demonstration) · words 40–48.
**Objects:** `points:[{id:"q", position:[1.93,1.19,0.51], role:"neutral", label:"q", reveal_at_ms:0,
grow_ms:2000}]`. The sweeping comparison foot, **authored as an OFFSET from the TRUE FOOT** (not the
plane-address form `{on:"P1",u:s}`, which is measured from `P1`'s own anchor and would NOT put `s=0` at
the minimum — verified in §2e/Numerical sanity check: the plane-address form gives the true foot at
`s≈1.296`, not `0`):
```
points: [ { id:"foot_sweep", position:[1.2232,-0.8294,0.0051] /* the true foot, computed once */,
            role:"neutral", offset:{ along:[0.9435,-0.3312,0], zero:0, knob:"aux_a" } } ]
segments: [ { id:"cmp", role:"neutral", from:"q", to:"foot_sweep", reveal_at_ms:0, readout:"length" } ]
animate: [ { knob:"aux_a", from:-2.2, to:1.6, start_ms:2000, duration_ms:5000, easing:"linear" },
           { knob:"aux_a", from:1.6, to:0,   start_ms:7000, duration_ms:2000, easing:"smoothstep" } ]
```
(Linear easing on the first window so `s=0`, the true minimum, lands at the arithmetic midpoint of the
window's TIME, `t = 2000 + (0-(-2.2))/3.8 × 5000 = 4895 ms` — close to, not exactly, the skeleton's
"≈ t 5100"; the skeleton's own `≈` already concedes this is an estimate, and the exact value depends on
the easing curve chosen, which was NOT specified in the skeleton — flagged as a minor recommendation,
not a contradiction, since both are approximate by the skeleton's own notation.)
Then: `right_angle` mark via `perpendicular:{from:"q", to:"P1", foot_id:"true_foot", role:"derived",
reveal_at_ms:9000, grow_ms:600, show_right_angle:true}` — this SECOND object (the true perpendicular,
role `"derived"`/green) reveals at 9000 ms, exactly as `foot_sweep`'s segment (`role:"neutral"`) is
hidden (`hide_at_ms:9000` added to `cmp` above) — the "segment turns green and locks" beat is two
DIFFERENT objects handing off, not one object changing colour (roles are static per object, confirmed
`§1`), matching Δ2's reveal-chain design exactly.
**`value_readouts:["point_plane_distance"]`. `controls:[]`** (no live slider on this state — the sweep is
choreography-only, matching the skeleton's control table). Formula surface `d = |n̂·(q−a)| / ‖n‖` writes
at 11000–12500 ms (after the lock, per Rule 34b/38c "after its graphical story has played").
**Checked:** `s=−2.2→3.1086`, `s=0→2.1983`, `s=+1.6→2.7201` (§2e) — all three MATCH the skeleton to
the stated precision.

### STATE_4 — "A Line Meets a Plane Once, or Never"
`translate-through` · core · **`misconception_watch`: M2** · register: **graphical leads** · words
42–50.
**Objects:** `P1` static/bright. Two `lines[]`, SEQUENTIAL via `reveal_at_ms`/`hide_at_ms`:
`Lpar` (`role:"dir2"`/cyan, the `n̂·d̂=0` case) visible 0–9500 ms, sliding bodily via
`offset:{along:<a translation direction in the plane's own frame>, zero:0, knob:"aux_a"}`,
`animate:[{knob:"aux_a", from:0, to:1, start_ms:2000, duration_ms:6000}]`; `Lcut` (`role:"dir1"`/amber)
`reveal_at_ms:9500`. `intersection:{line:"Lcut", plane:"P1", id:"X", role:"derived",
reveal_at_ms:15000, grow_ms:600, show_right_angle:false}` — **Δ4's `no_meeting_point` token is authored
on `Lpar`'s own window too**: `value_readouts:["d_dot_n","no_meeting_point","lambda","intersection_point"]`
so the HUD prints the literal "no meeting point" row while `Lpar` is the active/visible line (Δ4's whole
point — a hidden marker alone teaches nothing; the token makes the ABSENCE a rendered fact, `:13624–13630`).
**`n·d` CORRECTED per §2e: `0.574`, not `0.624`** — both the parallel line's `0.000` and the cutting
line's `0.574` are what will actually render. `controls:[]`.
**Checked:** `Lpar`: `d̂·n̂ = 2.8×10⁻¹⁷`, `|·| ≤ 1e-9` ✓ (parallel case fires). `Lcut`: `d̂·n̂ = 0.5736`
(matches `cos(55°)=sin(35°)` exactly, §2e), `λ=2.600` (scale-invariant, unaffected by the `n·d`
correction).

### STATE_5 — "Two Lines That Never Meet" (SUPPORTING AHA)
`rotate-to-reveal` · core · **`misconception_watch`: M3** · register: **graphical leads, the LIVE
number is the whole confrontation** (Rule 32a: the true value is on screen from `t=0`, before the false
picture ever appears unnumbered) · words 44–52.
**Camera:** `camera_position` = the S5 entry pose in xyz (`R=13, az=146°, el=4°` converted:
`[R·cos(4°)·cos(146°), R·sin(4°), R·cos(4°)·sin(146°)] = [-10.751, 0.907, 7.252]`), `camera_mode:"steps"`,
`camera_steps:[{at_ms:6000, az:<S8's az -38>, el:<S8's el 56>, dist:13, ease_ms:7000}]` (arrives by
13000 ms, per §12).
**Objects:** `lines:[M1(role:"dir1"/amber), M2(role:"dir2"/cyan)]` both `reveal_at_ms:0`. **`value_
readouts:["skew_distance"]` present from `t=0`** (the resolved value is available the instant
`common_perpendicular` is authored, regardless of the SEGMENT's own reveal fraction — the readout and
the drawn segment are independent, confirmed at `:13092–13094`, computed BEFORE the `if(res.exists)`
segment-drawing branch). The crossing-pixel marker (§2e correction): `points:[{id:"crossing_mark",
position:[-1.7974,-0.9896,0.3909] /* on LINE 1, the point whose projection under THIS fixed entry pose
coincides with line 2's image — see §2e */, role:"neutral", reveal_at_ms:2000, hide_at_ms:3500}]` — a
1.5 s pulse, matching the skeleton's timing exactly, now on a VERIFIED position rather than an
unreconciled "t" value. `common_perpendicular:{between:["M1","M2"], id:"common_perp", role:"derived",
reveal_at_ms:3800, grow_ms:2200}`.
**Checked:** distance `1.800` present at `t=0` ✓; crossing marker position independently re-derived
(§2e), NOT copied from either contradictory skeleton citation.

### STATE_6 — "Directions Alone Fix the Angle"
`rotate/flip` · core · register: **numeric leads** (the only state where it does, per skeleton §10g —
the angle readout IS the subject) · words 38–46.
**Objects:** `M1`, `M2` re-drawn from one shared origin (`point:[0,0,0]` on a display-only copy — the
DoD's own note that this is a re-drawing, not the same objects, is preserved). `angle_arcs:[{id:"arc1",
between:["M1","M2"], readout:"angle_lines_deg"}]`.
**Two-phase choreography:** phase 1 (0–8000 ms) both anchors slide via `offset` on an `aux_a`-driven
knob while `M1`/`M2`'s `dir` fields are UNTOUCHED — arc holds at `69.4°` (Rule 32b: only the anchor
moves, the taught quantity — direction — does not). Phase 2 (8000–19000 ms): `M2.rotate = {about:
[0.2877,-0.8387,-0.4625] /* n̂c, the authored literal cross-product axis, verified below */, zero:
69.3846, knob:"theta_deg"}`, `animate:[{knob:"theta_deg", from:25, to:115, start_ms:8000,
duration_ms:11000, easing:"linear"}]`. **`vg.control_ranges:{theta_deg:{min:25,max:115}}`** (§3 — stays
inside the camera-verified sweep). `controls:["theta_deg"]`.
**Checked, numerically (not just argued):** rotating `d̂2` about `n̂c=normalize(d̂1×d̂2)` by
`φ=(theta_deg−69.3846°)` reproduces `angle(d̂1, d̂2_rotated) = theta_deg` EXACTLY at every sampled value
— `25.0000°→25.0000°`, `90.0000°→90.0000°`, `115.0000°→115.0000°` (python3, Rodrigues rotation,
Numerical sanity check log). This is the authoring recipe that makes the readout and the picture
provably agree at every point of the sweep, not merely at the endpoints.

### STATE_7 — "Measure to the Normal, Then Subtract" (extended)
`decompose` · extended · register: **graphical leads** · words 40–48.
**Camera:** `camera_mode:"steps"`, `camera_steps:[{at_ms:0, az:140, el:26, dist:13, ease_ms:1800}]` off
the shared home pose (S2's own pose — the skeleton's own P1-2 correction, `az 140/el 26`, NOT S2's
reused pose, which the re-solve scored at `8.45°` minimum pairwise separation — genuinely unreadable).
**Objects:** `Lcut` returns; `projection:{line:"Lcut", plane:"P1", id:"shadow", role:"neutral"}`;
`angle_arcs:[{id:"arc_normal", between:["Lcut","P1.normal"], readout:"angle_line_normal_deg"},
{id:"arc_plane", between:["Lcut","P1"], readout:"angle_line_plane_deg"}]` — **the `L,P.normal` vs `L,P`
forms are the exact Δ5 mechanism** (`:13192–13206`) that keeps "angle to normal" and "angle to plane"
separately addressable, which is the state's entire point. `value_readouts:["angle_line_normal_deg",
"angle_line_plane_deg"]`. `controls:[]`.
**Checked:** `to_normal=55.00°`, `to_plane=35.00°`, sum `=90.00°` BY CONSTRUCTION (`vgLinePlaneAngles`,
`:12788–12793`) — not a coincidence of these particular numbers, true for every line/plane pair the
resolver is given.

### STATE_8 — "The Gap Runs Along d₁ × d₂" (advanced)
`overlay-match` (coined) · advanced · `derivation_first_principles` · register: **graphical leads,
symbolic surface writes LAST** (Rule 34b/38c) · words 44–52.
**Camera:** static `az −38° / el 56° / dist 13` (arrived-at already, via S5's `camera_steps`).
**Objects:** S5's scene returns (`M1`, `M2`, `common_perp` all `reveal_at_ms:0`, already-settled).
`vectors:[{id:"cross_vec", role:"derived", origin:[0,0,0], derive:"cross", of:["M1","M2"], scale:1,
reveal_at_ms:2000}, {id:"a2_minus_a1", role:"third", origin:"M1", derive:"between", of:["M1","M2"],
reveal_at_ms:2000}]` — **`role:"third"` is the magenta restoration**, exactly matching `VG_ROLE_COLOR.
third = "#E15FA8"`. The "translates onto the common perpendicular" beat: `cross_vec`'s `origin` address
ramps from `[0,0,0]` to `common_perp`'s own midpoint via `{lerp:[[0,0,0],"common_perp"], t:{knob:"aux_a"}}`
— **this is only possible because `vgAddr`'s `lerp` form accepts a DERIVED-point string id** (`ctx.
derived["common_perp"]`, populated at `:13099`) — `animate:[{knob:"aux_a", from:0, to:1, start_ms:7000,
duration_ms:5000, easing:"smoothstep"}]`. Formula surface + three HUD terms (`numerator_triple_product`,
`cross_norm`, `skew_distance`) fill in at 12000–15000 ms. `controls:[]`.
**Checked:** `1.6847/0.9360 = 1.8000` ✓ (§2e) — the three-term identity holds against the ACTUAL
resolved numbers, not a separately-typed decimal.

### STATE_9 — "Explore: Move Every Part"
`drag-sandbox` · core · `interaction_complete` · 0 words / open (Rule 37).
`scene_groups:[{key:"A",label:"line + plane"},{key:"B",label:"skew pair"}]`,
`camera_mode:"group"`, `group_cameras:{A:{az:138,el:20,dist:14}, B:{az:-58,el:64,dist:13}}`.
`controls:["scene_group","lambda","lambda_span","half_extent","q_height","theta_deg","line2_offset"]`
(the UNION of both groups' knobs — §3). `vg.control_ranges:{half_extent:{min:1.5,max:4.5},
lambda_span:{min:2.5,max:5.0}, theta_deg:{min:25,max:115}}`. Every object in group A
(`L1`, `P1`, the perpendicular, `q`) authors `groups:["A"]`; every object in group B (`M1`, `M2`,
`common_perp`, `cross_vec`) authors `groups:["B"]` (`vgInGroup`, `:12848–12854` — an object naming no
`groups` belongs to EVERY group, so this must be authored explicitly on every S9 object or the wrong
group's apparatus stays visible).

**§ Rule 37 — the honest resolution of "λ ping-pongs until a slider is seized" (Diff 1, in full).**
`vg.animate[]` is confirmed one-shot-hold (§ "THREE DIFFS" above) — there is **no engine primitive for
an infinite loop**, so a literal perpetual ping-pong CANNOT be authored on the shipped surface. The
player-level Rule 37 guarantee (the clock free-runs, never auto-freezes on `interaction_complete`) is
real and independent of this scenario — but it only produces visible motion for as long as some
authored `animate[]` window is still open or has not yet been superseded; past the last window's end,
`vgAnimValue` returns `to` and holds there **forever**, silently, with no further motion. **Honest
substitute, buildable today:** author a LONG but FINITE multi-window back-and-forth on `lambda`
(several `animate[]` entries on the same knob with disjoint windows — the shipped, documented
multi-segment mechanism, `:12285–12287`) covering several minutes — e.g. 8 legs of 9 s each
(`−3.5→3.5`, `3.5→−3.5`, ×4, ≈72 s total) — long enough that in any realistic classroom session the
line is in motion whenever a teacher glances at it, while remaining truthful that after roughly a
minute and a quarter of complete inactivity the sweep settles and holds (not a true infinite loop). The
drag-seize contract already handles "a real drag interrupts it at any point" (`:14417–14424`) with no
extra authoring. **FLAGGED, not silently substituted**: if the founder wants a genuine infinite
ping-pong, that is a new `animate[]` `mode` value (e.g. `"ping_pong"`) — a real, small engine change,
not something `mathematics_author`/`json_author` can construct from the current primitive. Recorded as
a FLAG below rather than assumed away.


## 5. Notation ladder (Rule 38c) — verified against the actual formula-surface assignments

**Core + extended (S1–S7, S9): algebraic and geometric forms only, verified line by line:**
`r = a + λd` (S1) — algebraic, vector-plus-scalar-multiple, no operator beyond `+`/scalar multiply.
`n·(r−a)=0` (S2) — a dot product, introduced ON canvas the same state it is first used (S2's own
one-beat `n̂·v` demonstration), never assumed. `d = |n·(q−a)|/‖n‖` (S3) — dot product + modulus + norm,
all already-established by S2. `λ = n·(a_P−a)/(n·d)` (S4, if surfaced — the skeleton's DoD table lists
it in the identity-check column, not necessarily on the rendered formula overlay; if `json_author`
promotes it to a formula surface it stays algebraic). `cos θ = |d1·d2|/(‖d1‖‖d2‖)` (S6), `sin θ =
|d·n|/(‖d‖‖n‖)` (S7) — both algebraic ratios of dot products and norms, no calculus, no vector
CALCULUS operator (`∇`, `∫`), no formal limit. **No core or extended surface names `d1×d2` or "cross
product" anywhere** — verified against §4's object list above: `S8` is the FIRST state to author
`cross_vec`/`a2_minus_a1`, and `S8` is the sole advanced-ring state, contiguous, immediately before the
explore state (Rule 38a) — matches the skeleton's own ring assignment exactly.

**Advanced-only (S8): `d = |(a2−a1)·(d1×d2)| / ‖d1×d2‖`.** Cross product notation, a scalar triple
product read as a numerator — correctly gated to the advanced ring, verified: no `value_readouts` token
naming `cross_norm`/`numerator_triple_product` appears in any state's `value_readouts` list except S8's
and S9's group-B row (S9 is core-ring BY CONTENT but only because its group-B controls surface objects
S8 already introduced — matches 38b's "explore surfaces core content only" clause exactly, since S9's
own claim is manipulation of an already-taught relation, not a fresh introduction).

**Dialect (38d), verified once-then-bare:** "normal (perpendicular direction)" — S2 only, at first
appearance; bare "normal" in S3, S4, S7, S9. "Skew (never meeting, not parallel)" — S5 only; bare "skew"
afterward (S6's narration, S8's title). No other board-divergent term appears (this concept has no
"trapezium/trapezoid"-class conflict).

**Interval notation:** never rendered on canvas (matches skeleton §10i-5's N/A — no 2D graph, no axis
notation) — nothing to declare.

**Cut-coherence, re-verified against the ACTUAL animate/value_readouts sets authored above (not only
the design intent):**
- **Cut 1 (hide S8):** no surviving state's `value_readouts` or `angle_arcs`/`vectors` list names
  `cross_norm`, `numerator_triple_product`, or authors `role:"third"` — confirmed by direct inspection
  of every state's object list in §4. **Coherent.**
- **Cut 2 (hide S7, S8):** no surviving state's `angle_arcs` list uses the `L,P` or `L,P.normal` forms
  (both are S7-only in §4's object lists). **Coherent.**

## 6. Drill-down cluster phrasings (5 per cluster, real student voice, plain English)

**S3 — `why_perpendicular_is_shortest`**
1. "why is the straight-down line always the shortest one to the plane?"
2. "couldn't some slanted line accidentally be shorter than the perpendicular?"
3. "is the perpendicular the shortest for every point, or just this one?"
4. "what makes ninety degrees special here instead of any other angle?"
5. "if I tilt the segment a tiny bit, why does it always get longer, never shorter?"

**S3 — `foot_of_perpendicular_meaning`**
1. "what exactly is the foot of the perpendicular — is it just where the line lands?"
2. "why does the foot have to be one specific point and not anywhere nearby?"
3. "how is the foot different from just picking the closest-looking point by eye?"
4. "does every point in space have its own foot on a given plane?"
5. "what happens to the foot if the point q is moved further from the plane?"

**S3 — `distance_formula_absolute_value`**
1. "why does the distance formula need absolute value bars at all?"
2. "what would a negative value under those bars have actually meant?"
3. "can the number inside the absolute value bars ever come out negative?"
4. "why not just square the number instead of using absolute value?"
5. "does the sign inside the formula tell you which side of the plane the point is on?"

**S5 — `skew_vs_parallel`**
1. "if two lines never meet, why aren't they automatically parallel?"
2. "how can I tell skew and parallel apart without drawing a picture?"
3. "do skew lines have to point in completely different directions?"
4. "is there a quick way to test whether two lines are skew?"
5. "could two lines look almost parallel on paper and still be skew?"

**S5 — `why_skew_needs_three_dimensions`**
1. "why can two lines never be skew if they're both drawn on a flat page?"
2. "what is it about a third dimension that makes this new case possible?"
3. "if I add height to a flat drawing, do some crossing lines stop crossing?"
4. "why does plane geometry never warn you this case exists?"
5. "is skew just a fancy word for two lines missing each other by accident?"

**S5 — `screen_crossing_is_not_a_meeting`**
1. "if the lines look like they cross on my screen, why doesn't that count as meeting?"
2. "how can a flat picture end up hiding something that's true in space?"
3. "why does the same drawing look like a meeting from one camera angle and not another?"
4. "if the camera moved, would the crossing point on screen move too?"
5. "how do I know when a picture of two lines is hiding a gap like this one?"

**S8 — `why_cross_product_gives_the_gap_direction`**
1. "why is the cross product of the two directions the right direction for the gap?"
2. "couldn't the shortest gap point some other way instead?"
3. "why does a direction built from two lines end up perpendicular to both of them?"
4. "is there a way to see why that specific direction has to be the shortest path?"
5. "what would go wrong if I measured the gap along some other direction?"

**S8 — `numerator_is_a_projection`**
1. "what does (a2 minus a1) dot (d1 cross d2) actually measure?"
2. "why does subtracting the two anchor points matter for the distance?"
3. "is the numerator just measuring how far apart the two lines start out?"
4. "what happens to the numerator if the two anchor points are the same point?"
5. "why do we need a dot product on top of a cross product in this one formula?"

**S8 — `parallel_lines_break_the_formula`**
1. "why does the formula stop working the moment the two lines become parallel?"
2. "what happens to d1 cross d2 exactly when the lines are parallel?"
3. "if the formula breaks, does that mean parallel lines don't have a distance at all?"
4. "how do I find the distance between two parallel lines instead?"
5. "why does dividing by d1 cross d2 cause the problem specifically?"

## 7. Constraint callouts (domain first)

```jsonc
"constraints": [
  "every relation this concept draws is defined everywhere it is drawn: a line has no excluded lambda, a plane has no excluded point, and the point-plane distance is defined for every q not on the plane -- the only real exclusion in this concept is the DEGENERATE case a line-plane meet or a common-perpendicular direction fails to exist, and both are DETECTED (VG_MEET_EPS = 1e-9 on a dot/cross product of unit vectors) rather than divided-by",
  "VG_MEET_EPS = 1e-9 gates BOTH degeneracy checks (line-meets-plane, common-perpendicular-exists) at field_3d_renderer.ts:12605/12778/12743 -- an inequality test, never an exact-zero test, so Lpar's measured d.n = 2.8e-17 (not exactly 0, ordinary float round-off) is correctly classified parallel",
  "n*d for S4/S7's cutting line renders as 0.574 (both operands normalized, vgLinePlaneMeet:12777), matching cos(55deg)=sin(35deg) exactly -- the 0.624 figure in the skeleton's own S4/S7 rows never appears on the shipped HUD and must not be authored into any narration or caption",
  "the S5 screen-crossing marker is authored as a literal 3D point on line 1 at (-1.7974,-0.9896,0.3909), independently re-derived from the S5 camera pose (R13/az146/el4) -- NOT from either of the skeleton's two contradictory 't' values (0.495, 0.815), which disagree with each other and with this recomputation",
  "S1's entry camera_position is [0.0, 8.0, 13.8564] (R=16, az=90 deg, el=30 deg) -- Act I's own STATE_5 literal, verbatim -- not the skeleton's assumed R=9; camera_steps eases IN to R=13, not out",
  "half_extent's engine-shipped slider ceiling is 3.0 (vgSc at field_3d_renderer.ts:13502); reaching this concept's own declared domain ceiling of 4.5 on S9 REQUIRES an authored vg.control_ranges override -- absent that override, S9's own camera solve (which assumed a sweep up to 4.5) is not actually reachable by a teacher",
  "theta_deg's on-screen angle-arc fidelity was measured ONLY over [25,115] degrees (skeleton P2-2: worst error 0.88/3.70 deg over that exact sweep) -- outside that interval the arc's accuracy is unmeasured, so S6 and S9's group-B row both narrow theta_deg via vg.control_ranges to [25,115], never left at the engine's wider shared default [20,160]",
  "the two-segment dot-product-intro recipe on S2 relies on BOTH segments reading n.v = 0 for every value of their own knob whenever their lerp endpoints are both in-plane addresses -- verified this holds unconditionally (not just at the intended t), which is what keeps the resolver's per-frame unconditional readout recomputation from ever printing a wrong number during either segment's off-window idle state"
]
```


## Numerical sanity check — full log (python3, run not eyeballed)

```
--- S2/S3 plane -------------------------------------------------------
n_raw = (0.35, 1, 0.25);  |n| = 1.088577052853862
n_hat = (0.321521, 0.918630, 0.229658)              [skeleton: (0.322,0.919,0.230)  MATCH]
signed = n_hat . (q - p_plane) = 2.198282605         distance = 2.198282605  -> 2.20  [MATCH]
foot = (1.223207, -0.829409, 0.005148)               [skeleton: (1.23,-0.83,0.00)   MATCH to 2dp
                                                       (z rounds 0.0051->0.01 at strict 2dp; skeleton's
                                                       0.00 uses the LESS-precise given u,v -- immaterial,
                                                       both effectively zero]
n_raw . (q-p_plane) = 2.392695  (= signed * |n_raw|)  [skeleton: n.(q-a) = 2.393   MATCH]

comparison feet (offset from TRUE FOOT along u_hat, u_hat=normalize(0.94,-0.33,0)):
  s=-2.2 -> point (-0.8526,-0.1007,0.0051)  distance 3.1086   [skeleton 3.110  MATCH]
  s= 0.0 -> point ( 1.2232,-0.8294,0.0051)  distance 2.1983   [skeleton 2.200  MATCH]
  s=+1.6 -> point ( 2.7329,-1.3594,0.0051)  distance 2.7201   [skeleton 2.721  MATCH]

  plane-address form {on:"P1",u:s} (measured from P1's OWN anchor, NOT the foot) gives the true
  minimum at s=+1.296, NOT s=0 -- CONFIRMS the sweep must be authored as an offset from the true
  foot, never via the plane-address form, or "s=0" would not be the minimum.

--- S5/S6/S8 skew pair -------------------------------------------------
d1_hat = normalize(1,0.15,0.35)   = (0.934539, 0.140181, 0.327089)
d2_hat = normalize(0.15,-0.5,1)   = (0.132973, -0.443242, 0.886484)
cross(d1,d2) = (0.269248,-0.784960,-0.432867);  |d1xd2| = 0.935965   [skeleton 0.936  MATCH]
n_hat_c = cross/|cross| = (0.287668,-0.838664,-0.462482)
M2 (reconstructed = M1 + 1.8*n_hat_c + 1.4*d1_hat - 1.1*d2_hat) = (0.479887,-1.725775,-0.749677)

vgCommonPerp(M1,d1,M2,d2):
  distance          = 1.8000000000000003              [skeleton 1.800 (authored exactly)  MATCH]
  cross_norm        = 0.935965050771015                [skeleton 0.936                     MATCH]
  numerator         = 1.6847370913878272                [skeleton 1.685 (S8)                MATCH]
  foot1 = (0.108354,-0.703747,1.057924)                 [skeleton (0.11,-0.70,1.06)          MATCH]
  foot2 = (0.626157,-2.213342,0.225456)                 [skeleton (0.63,-2.21,0.23)          MATCH]
  t1=1.4  t2=1.1   (exactly the coefficients used to construct M2 -- confirms the reconstruction)

orthogonality check: (F2-F1).d1_hat = -2.220446e-16   [skeleton -2.2e-16   MATCH]
                      (F2-F1).d2_hat =  0.0            [skeleton  0.0e+00  MATCH]

angle(d1,d2) = arccos(0.352093) = 69.3846 deg          [skeleton 69.4 (69.38)  MATCH]
d1.d2 = 0.352093                                        [skeleton 0.352         MATCH]

S6 rotation check -- rotate d2_hat about n_hat_c by phi=(theta_deg - 69.3846) deg, Rodrigues:
  theta_deg=25.0000   -> resulting angle(d1, d2') = 25.0000 deg   EXACT
  theta_deg=69.3846   -> resulting angle(d1, d2') = 69.3846 deg   EXACT (phi=0)
  theta_deg=90.0000   -> resulting angle(d1, d2') = 90.0000 deg   EXACT
  theta_deg=115.0000  -> resulting angle(d1, d2') = 115.0000 deg  EXACT

--- S4/S7 n.d correction -------------------------------------------------
cos(55 deg) = sin(35 deg) = 0.5735764363510468
skeleton's own S11 text: "n.d-hat = 0.5736"                          MATCHES cos(55)=sin(35) exactly
skeleton's S3/S10b/S10h text: "n.d = 0.624"  =  0.5736 * |n_raw| = 0.5736*1.0886 = 0.6245   -- this is
  d_hat . n_RAW (unnormalized normal), NOT what vgLinePlaneMeet's d_dot_n computes (both operands
  normalized) -- ENGINE WILL RENDER 0.574, NOT 0.624.
lambda is scale-invariant in n: 1.617/0.6244 = 2.5897   vs   (1.617/1.0886)/0.5736 = 1.4853/0.5736
  = 2.5895  -- agree to 4 significant figures, so lambda=2.600 (authored) is UNAFFECTED by the
  correction; only the n.d HUD figure itself needs fixing.

--- S5 screen-crossing re-derivation --------------------------------------
camera model verified against check_vector_geometry_3d.ts:277-280 (byte-identical formula):
  x = R*cos(el)*cos(az)   y = R*sin(el)   z = R*cos(el)*sin(az)   [az,el in degrees]
Cross-verified against Act I's own shipped camera_position arrays:
  STATE_1 [0,9.3969,3.4202]  -> R=10.0000  el=70.0000  az=90.0000   (exact)
  STATE_5 [0,8.0,13.8564]    -> R=16.0000  el=30.0000  az=90.0000   (exact)   <-- the R9-vs-R16 finding
  STATE_8 [11.25,6.4952,0]   -> R=12.9904  el=30.0000  az=0.0000    (matches to given precision)

S5 camera (R=13, az=146, el=4): camPos = (-10.7512, 0.9068, 7.2518)
Screen-projected 2D lines (isotropic sx,sy) for line1 (M1,d1_hat) and line2 (M2,d2_hat) SOLVED
analytically (camX(s), camY(s), camZ(s) affine in arc-length s; intersection of the two resulting
straight 2D paths solved in closed form, then inverted back per-line):
  screen intersection (sx,sy) = (-0.059926, -0.097356)
  line 1: s1 = -0.639258   (both the sx- and sy-based inversions agree to 12 significant figures)
  line 2: s2 = -0.611512   (same agreement)
  3D point on line 1 at crossing: (-1.797411,-0.989612, 0.390906)
  3D point on line 2 at crossing: ( 0.398573,-1.454727,-1.291773)
  separation between the two 3D points: 2.805 units (confirms these are DIFFERENT 3D points that
  merely SHARE a screen pixel -- the skew trap, demonstrated numerically, not just asserted)
  line 1 drawn span (default sphere clip, R=4.5): [-3.278234, 5.380946]
  s1 as a FRACTION of that drawn span: 0.304761        <- matches NEITHER 0.495 NOR 0.815
  line 2 drawn span: [-4.226972, 3.898629]
  s2 as a fraction of ITS drawn span: 0.444947          <- also matches neither cited value
Neither of the skeleton's two mutually-contradictory citations (0.495 at S3/S14-probe-text vs 0.815
at S4/Block-1) reproduces under ANY of the normalizations tried. The QUALITATIVE claim (yes, a
crossing exists on screen at this pose) is independently confirmed true; the specific parameter
value is not reproducible from either citation and must not be re-used.
```

## Self-review checklist

- [x] Every LP_KNOBS quantity declared with a domain; every disagreement between the engine's shipped
      default range and the skeleton's §10(c) domain reconciled explicitly (§3) — `half_extent` and
      `theta_deg` both require an authored `vg.control_ranges` override; the rest do not.
- [x] Domain & validity ledger complete: domain/range/excluded points/drawn interval/boundary behaviour
      for every relation this concept draws (§2a); every "always/never" claim traced to a named theorem
      or algebraic identity with its hypotheses checked against THIS concept's own authored geometry,
      demonstrated numerically, not merely asserted (§2b).
- [x] No caption or narration generalises past the drawn interval — S4's "meets once or never" two-case
      claim is checked against the theorem's actual third (in-plane) case, which this concept never
      renders and is flagged as an omission, not silently treated as exhaustive (§2b, §7).
- [x] Every state's motion declares an archetype; the two coined archetypes (`sweep-to-extremum`,
      `overlay-match`) are used exactly as the skeleton defines them, each demonstrated numerically
      where a demonstration was possible (S3's three sampled feet; S8's exact `1.685/0.936=1.800`).
- [x] Rule 32 sequencing preserved in every §4 recipe (cause-before-effect via `reveal_at_ms`/`hide_at_ms`
      ordering, never simultaneous reveal of a claimed pair). Rule 33 register-triangle declared per
      state with the real number named. Rule 34 one formula surface per state (§5), value-only HUD
      (§2d).
- [x] Word budgets are the skeleton's own (25–55 EN words/state) — not re-authored here; this document
      adds choreography and numeric rigor, not final narration prose (that is this same role's own
      output but is represented here at the recipe level, matching the house style of the reference
      mathematics block for a scenario this deep).
- [x] Notation ladder (38c) verified against the ACTUAL formula-surface/object assignments in §4, not
      only against design intent (§5) — confirmed `d1×d2` and the skew formula appear nowhere before S8.
- [x] Pixel↔data scale factor: **N/A for this concept** — `field_3d` is a true 3D world-unit scenario,
      not a pixel-coordinate PCPL concept (`patterns/mathematics.md` hazard 7 is a PCPL-only risk); no
      scale factor is authored or needed.
- [x] Exact-before-decimal: every formula surface carries the exact symbolic form; every HUD value's
      precision is engine-fixed and verified to match the skeleton's own stated doctrine exactly (§2d).
- [x] 45 drill-down phrasings across the skeleton's 9 named clusters (§6) — plain English, real-student
      voice, no Hinglish, no textbook prose.
- [x] `constraints`: 8 short, domain-first assertions (§7), each citing the file:line or the numeric
      re-derivation that backs it.
- [x] Numerical sanity check RUN via python3 — full log above; every number independently reproduced
      or, where it disagreed, the disagreement is reported with a full re-derivation, never silently
      adopted (§2e). The discriminating check (five independent skew-geometry numbers sharing no common
      error mode) is named and reasoned about explicitly, per the task's own precedent.
- [x] Engine bug queue consulted (own sweep, §Engine bug queue consultation); every `patterns/
      mathematics.md` §4 hazard checked explicitly against this concept (hazard 1 → §2a; hazard 2 → the
      `no_meeting_point`/degenerate-plane guards, §2c; hazard 3 → every authored field in §4 verified
      READ by the resolver, by file:line; hazard 4 → the S2 two-segment readout-collision analysis,
      §4/§7; hazard 7 → N/A, field_3d not PCPL).
- [x] Rule 41 sweep: no idiom, no personification anywhere in this document's own prose or in any
      recipe text destined for narration ("a line does not avoid another line; it passes at a
      distance" — the skeleton's own §11 constraint 2, preserved and honoured, never violated by any
      choreography description above).
- [x] `aha_moment` mathematics check: S3's PRIMARY aha ("the perpendicular is the shortest segment") is
      demonstrated by three ACTUALLY-SAMPLED, ACTUALLY-VERIFIED numbers (3.1086/2.1983/2.7201), not
      merely narrated; S5's SUPPORTING aha (skew) is demonstrated by a verified non-zero, non-parallel
      gap with orthogonality checked to float precision. `misconception_watch` counters M1/M2/M3 are
      each backed by a specific, checked number (M1: the three feet; M2: `n·d=0.574` vs `0.000`,
      corrected; M3: the independently re-derived screen-crossing, corrected). Assessment answers (§10f
      of the skeleton) re-checked for mathematical correctness — all 7 items sound, no error found.

**Source check line:** *Consulted the NCERT Class-12 Mathematics chapter index (Ch. 11,
Three-Dimensional Geometry) and the international specifications the skeleton already named (IB DP AA
guide, AP CED, Cambridge IGCSE, A-level Pure/Further Pure) for SCOPE only — unchanged by this pass, no
new curriculum claim authored. NCERT Exemplar consulted for misconception BELIEFS only (M1/M2/M3,
inherited from the skeleton's §4, not re-derived). No teaching method, example problem, or figure
imported. HC Verma and DC Pandey not consulted — physics-only sources, forbidden for mathematics.*

---

## FLAGS — for `founder_proxy` / `quality_auditor`

1. **⭐ Act I's actual S5 camera radius is R=16, not the skeleton's assumed R=9** (§⭐ above) —
   `vector_products_in_space.json`'s `STATE_5.camera_position=[0.0,8.0,13.8564]`, verified by direct
   read and by inverting the renderer's own spherical formula. `az`/`el` match; `R` does not. S1's entry
   pose and `camera_steps` direction in §4 are authored on the CORRECTED value; the skeleton's §5/§14
   fill/min-separation numbers for S1 are unverified at this radius and should be re-solved by whoever
   owns the next camera-solve pass, though qualitatively a larger R only shrinks the apparatus (no new
   off-frame risk introduced).
2. **`n·d` for S4/S7's cutting line is `0.574`, not the `0.624` printed throughout the skeleton's own §3/
   §10(b)/§10(h)** (§2e) — the shipped `vgLinePlaneMeet` normalizes both operands; `0.624` only arises
   from mixing a unit direction with the un-normalized plane normal, a convention the engine never
   computes for this token. `λ=2.600` is unaffected (scale-invariant). Every occurrence needs correcting
   before `json_author` transcribes a HUD-disagreeing number into a narration line.
3. **The S5 screen-crossing parameter is cited as TWO DIFFERENT, mutually contradictory values in the
   same skeleton** (`t=0.495` at §3/§14-probe-text vs `t=0.815` at §4/Block-1) — my independent
   re-derivation (§2e, full log above) matches NEITHER. The qualitative crossing claim is confirmed
   true; the exact marker position is re-derived from first principles in §4 rather than adopting
   either citation.
4. **Diff 2 (Δ7, `camera_gate.exempt_pairs`/`min_screen_length_frac`) is confirmed never built** — zero
   hits in both the renderer and `check_vector_geometry_3d.ts`. The three by-construction-parallel pairs
   this concept relies on (S1's `d̂`-on-its-own-line, S3's perpendicular ∥ `n`, S8's `d1×d2` vs the
   common perpendicular) have no automated exemption mechanism to discharge against; a human reviewer
   reading a low pairwise-separation score on exactly those three pairs must recognise it as
   BY-DESIGN, not as a camera defect, until Δ7 lands.
5. **A candidate `engine_bug_queue` row, found but not filed** (not this role's tool access):
   `field3d_vg_segment_readout_computed_unconditionally_regardless_of_reveal_state` — `vgResolveLinesPlanes`
   computes a segment's `readout` token every frame regardless of `reveal_at_ms`/`hide_at_ms`
   (`:13066–13083`), so a multi-segment "same instrument, different phases" recipe (like S2's
   dot-product intro beat) can silently print the WRONG phase's value if the segments are authored in
   the wrong array order or if either segment's idle (pre-window) position leaves its own domain (§4's
   S2 recipe is SAFE because both segments' idle positions stay in-plane by construction — future
   concepts reusing this pattern may not be so lucky without knowing to check).
6. **`camera_mode:"group"`/`group_cameras` (Δ10's actual mechanism) and `scene_group`/`scene_groups`
   (Δ10's selector) are all absent from the `vg` TypeScript type** (`:390–517`) though the frame driver
   reads all four at runtime — a fourth instance of the authorability gap Diff 3 named, confirmed by
   direct read of the `camera_mode?: 'authored' | 'steps' | 'auto_frame'` union, which excludes
   `'group'` outright. Recommend a platform-side (Rule 40) type-declaration fix; not a build blocker.
7. **`vg.animate[]` has no infinite-loop primitive** — S9's "λ ping-pongs until a slider is seized" is
   authored as a long, finite, multi-window back-and-forth (§4, S9) rather than a true perpetual loop,
   because the shipped mechanism is one-shot-hold by its own documentation (`:12282–12288`). If the
   founder wants a genuine infinite ping-pong on any explore state, that is a small, real engine change
   (a `mode:"ping_pong"` value on `animate[]` entries) — flagged, not silently worked around.
8. **The catalog prerequisite discrepancy the skeleton already flagged (its FLAG 1) is unresolved and
   out of this role's authoring scope** — `mathematicsCatalog.ts:139`'s `vector_dot_and_cross_product`
   vs the wave's actual Act I id `vector_products_in_space`. Carried forward, not re-argued.

