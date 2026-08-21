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
There is no `at_ms`, no `ramp_ms`, no `mode`, no `"ping_pong"` **field on an `animate[]` entry**
— but note (**⚠ CORRECTED 2026-08-21, QA pass-11 F9:**) that this is a statement about FIELD NAMES only: looping IS supported, at the state
level, by `vg.animate_loop_ms`, which wraps the clock the windows are evaluated against. The resolver (`vgAnimValue`,
`:12317–12338`) is documented in its own header as **one-shot-hold**: *"the value is 'from' for
ms <= start_ms, eases from -> to across [start_ms, start_ms+duration_ms], then HOLDS at 'to' forever —
never a returning triangle."* Authoring the skeleton's `{at_ms, ramp_ms, mode:"ping_pong"}` shape
produces **no motion at all** (every field the resolver reads is `undefined`, so `start_ms` falls back
to 0 and `duration_ms` to 0 — an instant, invisible jump at state-entry). **⚠ CORRECTED 2026-08-21, QA pass-11 F9:** ~~"**S9's 'λ ping-pongs until a slider is seized' cannot be built as literally stated** — see §4
S9 for the honest substitute … and the FLAG recommending a genuine `mode:"ping_pong"` engine
primitive"~~. **It CAN be built as literally stated, and ships that way.** The one-shot-hold quote above
describes `vgAnimValue`'s per-window behaviour, which is still true — but the state clock feeding it is
wrapped by `vg.animate_loop_ms` (F21b), so the windows repeat forever. Shipped S9:
`animate_loop_ms: 18000` + two 9 s `lambda` legs. This sentence was the SOURCE the §4 S9 paragraph
cited; pass-10 withdrew the citing text and left this one standing, which is how this family survived
four sweeps.

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
    "line2_offset": { "name": "S9 group-B only — slides M2's anchor along n̂c = normalize(d₁×d₂), the common-perpendicular direction (⚠ CORRECTED 2026-08-20, F1a: previously described/authored as 'along d2-hat', a vector PARALLEL to M2's own drawn direction — translating an anchor along an infinite line's OWN direction leaves the line pixel-identical, so that description named an INERT slider; the shipped offset.along is n̂c, the axis PERPENDICULAR to both directions — the same vector as M2's own rotate.about — which is what actually moves the skew gap and drives skew_distance live, matching S8's own formula)",
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
| Point-to-plane distance `D = \|n̂·(q−a)\|` (S3) | defined for every `q ∈ ℝ³`, every valid plane | `D ≥ 0` always (the `Math.abs` in `vgFootOnPlane`, `:12727`) — **never negative, never signed on screen** | `q` ranges via `q_height ∈ [0, 3]` | `D = 0` exactly when `q` lies IN the plane (foot = q); this concept never authors that case (`q_height`'s default 1.19 keeps `q` off the plane at every rendered frame — checked: distance 2.198 at default) |
| Line-plane meeting (S4, S9) | defined for every `(line, plane)` pair | **two cases, exhaustive, mutually exclusive**: `d̂·n̂ ≠ 0` (unique point) or `d̂·n̂ = 0` (no point, ever) — there is no third case (a line cannot meet a plane at 2+ points unless it LIES in the plane, which is `d̂·n̂=0` AND the anchor already on the plane — S4 authors `Lpar` off the plane, so this concept never renders the degenerate "line-in-plane" sub-case) | `λ` of the meeting point, when it exists, is unbounded in principle but must fall inside the line's OWN drawn span or the marker silently does not appear (`:12977`, same guard as above) — checked for `Lcut`: `λ=2.600` is well inside its own sphere-clip span | the epsilon that decides which case: `VG_MEET_EPS = 1e-9` on `\|d̂·n̂\|` (`:12605, :12778`) — see 2c |
| Skew-line shortest distance (S5, S8, S9) | defined for every `(line1, line2)` pair | `D ≥ 0`; **exists as a unique PERPENDICULAR SEGMENT only when `d1̂ × d2̂ ≠ 0`** (i.e. the two directions are not parallel) — the parallel/coincident case still has a well-defined DISTANCE (`\|w × d̂1\|`) but no unique common-perpendicular DIRECTION, and the engine returns `exists:false, dir:null` for it (`vgCommonPerp`, `:12746–12751`) | this concept's authored skew pair (M1/d1, M2/d2) has `‖d1×d2‖ = 0.936` (verified below) — always non-degenerate on screen; the drill-down cluster `parallel_lines_break_the_formula` (§7) is exactly the case this concept NEVER renders as a live state, only discusses | epsilon `crn < 1e-9` (`:12743`) — same order of magnitude as the line-plane epsilon, deliberately (both guard a cross/dot product of UNIT vectors, so both live on the same natural scale) |
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
> that independence rather than merely asserting it, which §4's S6 timeline does — **corrected
> 2026-08-20 (see §4 STATE_6's constraint note): only `M1`'s anchor slides; `M2`'s anchor stays
> fixed at its authored point through phase 1** — while `theta_deg`'s knob, and therefore the arc,
> is untouched — 32b compliant.

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
symbolic form** (`D=|n̂·(q−a)|/‖n‖`, not a decimal) per Rule 34b/38c — see §5.

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

**Per-group control visibility — how it actually works.** `vgEffectiveControls` (`field_3d_renderer.ts`,
declared just above the row-visibility pass) resolves `d.group_controls[group]` and falls back to the
flat `d.controls` only when a state authors no groups; the `scene_group` picker re-runs the
row-visibility pass **and nothing else** (Rule 39c — a full re-apply would re-seed knobs and clear
drag-seize flags). Shipped S9 authors
`group_controls: {"A":["lambda","lambda_span","half_extent","q_height"],"B":["theta_deg","line2_offset"]}`,
so each group shows exactly its own knobs. **⚠ CORRECTED 2026-08-21, QA pass-11 F9:** ~~"`d.controls` and `d.control_ranges` are both read
ONCE per STATE ENTRY, never re-evaluated when the `scene_group` select changes mid-state … S9's
`controls` array must therefore be the UNION of both groups' knobs … a side effect: `half_extent`
is still visible and live but has NO visible effect … `theta_deg` is visible but does nothing"~~ —
there is no union requirement and there are no dead sliders. (Pass-10 struck a condensed paraphrase of
this passage and left the passage itself, so a top-down reader still met nine lines of it first.) **⚠ CORRECTED 2026-08-21, QA pass-10 F8:** ~~"S9's `controls` array must therefore be the UNION of both groups' knobs … a side effect is a
'dead' slider … not fixable without a reactive per-group control-list mechanism the engine does not
have — recorded here so `quality_auditor` does not mistake it for a defect."~~ — **the mechanism exists
and ships.** S9 authors `group_controls: {"A":["lambda","lambda_span","half_extent","q_height"],
"B":["theta_deg","line2_offset"]}`, and `vgEffectiveControls` (`field_3d_renderer.ts:14942`, contract
at `:14922`) resolves the per-group list, with the row-visibility pass re-run on a group switch and
nothing else (Rule 39c). There is no dead slider, so there is nothing for the auditor to stand down on
— which is why a false "not fixable" note is worse than no note.


## 4. Within-state motion timeline + per-state control spec (Rule 31), on the SHIPPED `animate[]` surface

**Precision doctrine (2d) and role vocabulary (§1) apply to every state below without restatement.**
Every `animate[]` entry uses ONLY `{knob, from, to, start_ms, duration_ms, easing}` — no `at_ms`,
`ramp_ms`, or `mode`. Every camera move uses `vg.camera_mode` + either `vg.camera_steps`
(`{at_ms, az, el, dist, ease_ms}` — note this schedule DOES use `at_ms`, a genuinely different field
name from `animate[]`'s `start_ms`; the two mechanisms are not interchangeable and must not be
cross-authored) or `vg.camera_mode:"group"` + `vg.group_cameras`.

### STATE_1 — "One Number Names Every Point on a Line"
`parameter-sweep` · core · `manual_click` · register: **graphical leads, numeric supports** (Rule 33d
number: the live coordinate on the λ marker) · words ~~34–42~~ **⚠ CORRECTED: shipped final 52 words, within Rule 31's 25–55 law**.
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
- `value_readouts:[]` (**⚠ CORRECTED 2026-08-21, QA pass-9 F7:** was ~~`["lambda"]`~~ — the shipped array is EMPTY. The λ value the
  state teaches rides the marker's own coordinate label, not a HUD row; the closed row
  `vg_readout_token_authored_on_a_state_whose_constructs_never_publish_it` is exactly this state
  declaring a λ readout the engine could never emit) plus the coordinate label riding the marker
  (`a = (−0.80, 0.60, −0.50)` static, `λ`'s own live position — both DOM-readable, `:439–441`).
- `controls:["lambda"]`, `vg.control_ranges:{lambda:{min:-3.5,max:3.5}}` (§3).
**Checked:** at `eye_capture_ms:12000`, `u=(12000-4000)/13000=0.6154`, linear ⇒ `λ = −3.5+0.6154×7 =
0.808` — "mid-sweep", matches the skeleton's qualitative description.

### STATE_2 — "A Normal Direction Fixes a Whole Plane"
`reveal-build` · core · register: **graphical leads; the S2-only beat is symbolic-adjacent** (the
perpendicularity TEST, `n̂·v`, is a number, not a formula — kept off the formula surface per 38c, see §5)
· words ~~44–52~~ **⚠ CORRECTED: shipped final 55 words, at the Rule 31 cap**.
**Objects:** `P1` (same object, now BRIGHTENING back from ghost — `ghost_at_ms` simply absent/undefined
in S2's own `d`, so `vgGhostFactor` returns 1 for the whole state, i.e. full bright throughout; the
patch itself unfolds by ANIMATING THE KNOB: shipped `P1` carries **no timing fields at all** and DOES set
`bind_half_extent: true`, and the unfold is `animate:[{knob:"half_extent", from:0.4, to:3,
start_ms:0, duration_ms:4000, easing:"smoothstep"}]` — **⚠ CORRECTED 2026-08-21, QA pass-10 F8:** ~~"unfolds via `reveal_at_ms:2500,
grow_ms:4000` … `bind_half_extent:true` is NOT set here"~~, three wrong facts in one clause; the
skeleton §12 had it right ("0–4000 the patch unfolds (`half_extent` 0.4→3.0, smoothstep)")), `L1` retiring to ghost (`ghost_at_ms:0` on `L1` this state, engine 600 ms fade).
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
    reveal_at_ms:11150, grow_ms:0, readout:"n_dot_v", against:"P1" }
    /* **⚠ CORRECTED 2026-08-21, QA pass-9 F7:** was ~~reveal_at_ms:11200 with no grow_ms~~ — i.e. reveal EQUAL to its
       predecessor's hide_at_ms:11200, a zero-overlap hand-off. Shipped is 11150 + grow_ms:0, the same
       50 ms overlap + instantaneous lock as STATE_3's perp/cmp, and for the same reason: it closed
       construct_handoff_deletes_the_taught_object_and_its_number_at_the_very_beat_that_names_it. */
],
animate: [
  { knob:"half_extent", from:0.4, to:3, start_ms:0, duration_ms:4000, easing:"smoothstep" },
  { knob:"aux_a", from:0, to:1, start_ms:6500,  duration_ms:4000, easing:"smoothstep" },
  { knob:"aux_b", from:0, to:1, start_ms:11200, duration_ms:2800, easing:"smoothstep" }
]
/* **⚠ CORRECTED 2026-08-21, QA pass-10 F8:** the half_extent window was MISSING from this quoted array — it is the patch unfold itself,
   the state's opening beat. Three windows ship, not two. */
```
**Why this is safe (§2c's hazard-4 discipline, applied prophylactically).** Readout resolution in `vgResolveLinesPlanes` is **GATED ON ARRIVAL** — `if (vgArrived(sfrac))` guards
`segment_length`, and `n_dot_v` additionally requires its plane to have arrived
(`if (vgArrived(sfrac) && vgArrived(ctx.planes[o.against].frac))`). **⚠ CORRECTED 2026-08-21, QA pass-11 F9:** ~~"Readout resolution … is
UNCONDITIONAL — it runs every frame for EVERY authored segment regardless of `reveal_at_ms`/`hide_at_ms`"~~
— that was true when this block was written and is now false: the engine closed it at the value source
under the bug_class `vg_lines_planes_segment_readouts_compute_regardless_of_reveal_state` (Δ2b, "A
NUMBER MAY NOT PRECEDE ITS SUBJECT, AT THE SOURCE"). `out.readouts.n_dot_v` is still overwritten by
whichever matching segment is LAST in the array, so the array-order discipline below still applies. Both endpoints of `test_v_inplane`'s lerp are IN-PLANE addresses
(`{on:"P1", u:_, v:_}` with no third coordinate leaving the plane), so its `n̂·v` is **exactly 0 for
every value of `t`, not just for `t∈[0,1]`** — safe no matter what `aux_a` is doing before/after its own
window. `test_v_offplane`'s FIRST endpoint is the SAME in-plane point `test_v_inplane` ends on, so
before `aux_b`'s window opens (`t` holds at its `from=0`), `test_v_offplane` ALSO reads exactly
`n̂·v=0` — the two segments never disagree, and because `test_v_offplane` is listed second, its value
(correctly 0 during phase 1, correctly ramping during phase 2) is what survives into the HUD at every
frame. **This two-segment, ordered-array construction is a general recipe worth recording as a candidate
`engine_bug_queue` prevention row** (see FLAGS) — a naively-ordered or single-instrument version of this
exact beat would print a plausible-looking but silently wrong `n·v` during the wrong phase.
**Objects, continued:** `value_readouts:["n_dot_v"]`. `controls:["half_extent"]`. (**⚠ CORRECTED 2026-08-21, QA pass-9 F7:** was
~~`["n_norm","n_dot_v"]`~~ — `n_norm` is not authored on this state; it ships on S9 only.)
**Checked (qualitative):** phase 1 (6500–10500 ms) `n̂·v ≡ 0.000`; phase 2 (11200–14000 ms) ramps off
zero; both endpoints chosen so the tip visibly leaves the drawn patch by full reveal.

### STATE_3 — "The Perpendicular Is the Shortest Segment" (PRIMARY AHA)
`sweep-to-extremum` (coined, per skeleton) · core · **`misconception_watch`: M1** · register:
**graphical leads, numeric is the whole payoff** (Rule 33d: the falling→rising `distance` readout IS
the demonstration) · words ~~40–48~~ **⚠ CORRECTED: shipped final 54 words, within Rule 31's 25–55 law**.
**Objects:** `points:[{id:"q", position:[1.93,1.19,0.51], role:"neutral", label:"q", reveal_at_ms:0,
grow_ms:400}]` (**⚠ CORRECTED 2026-08-21, QA pass-9 F7:** was ~~grow_ms:2000~~). The sweeping comparison foot, **authored as an OFFSET from the TRUE FOOT** (not the
plane-address form `{on:"P1",u:s}`, which is measured from `P1`'s own anchor and would NOT put `s=0` at
the minimum — verified in §2e/Numerical sanity check: the plane-address form gives the true foot at
`s≈1.296`, not `0`):
```
points: [ { id:"foot_sweep", position:[1.2232,-0.8294,0.0051] /* the true foot, computed once */,
            role:"neutral", offset:{ along:[0.9435,-0.3312,0], zero:0, knob:"aux_a" } } ]
segments: [ { id:"cmp", role:"neutral", from:"q", to:"foot_sweep", reveal_at_ms:0, readout:"length" } ]
animate: [ { knob:"aux_a", from:-2.2, to:1.6, start_ms:2500, duration_ms:9500, easing:"linear" },
           { knob:"aux_a", from:1.6, to:0,   start_ms:12000, duration_ms:3500, easing:"smoothstep" } ]
```
(Linear easing on the first window so `s=0`, the true minimum, lands at the arithmetic midpoint of the
window's TIME, `t = 2500 + (0-(-2.2))/3.8 × 9500 = 8000 ms`, which is exactly the skeleton §12's
"≈ t 8000". **⚠ CORRECTED 2026-08-20, QA pass-8 F6:** ~~`t = 2000 + (0-(-2.2))/3.8 × 5000 = 4895 ms` —
close to, not exactly, the skeleton's "≈ t 5100"~~. That arithmetic was internally consistent with the
STALE window above it, so it read as sound while being 3105 ms wrong; and the "≈ t 5100" it reconciled
against no longer exists anywhere in the skeleton (`grep 5100` = 0 hits). Both halves are now shipped values.)
Then: `right_angle` mark via `perpendicular:{from:"q", to:"P1", foot_id:"true_foot", role:"derived",
reveal_at_ms:15450, grow_ms:0, show_right_angle:true}` — this SECOND object (the true perpendicular,
role `"derived"`/green) reveals at 15450 ms, 50 ms BEFORE `foot_sweep`'s segment (`role:"neutral"`) is
hidden (`hide_at_ms:15500` on `cmp` above) — **⚠ CORRECTED 2026-08-20, QA pass-8 F6:** ~~reveal 9000 /
grow 600 against hide 9000~~; the windows now OVERLAP by 50 ms with `grow_ms: 0`, so the lock is
instantaneous and the canvas is never empty at the aha instant (the fix that closed
`construct_handoff_deletes_the_taught_object_and_its_number_at_the_very_beat_that_names_it`) — the "segment turns green and locks" beat is two
DIFFERENT objects handing off, not one object changing colour (roles are static per object, confirmed
`§1`), matching Δ2's reveal-chain design exactly.
**`value_readouts:["segment_length","point_plane_distance"]`. `controls:[]`** (**⚠ CORRECTED 2026-08-21, QA pass-9 F7:** the shipped array
also carries `segment_length` FIRST — the sweeping segment's live length, which is the number the sweep
beat is read from; ~~`["point_plane_distance"]`~~ alone described only the locked value. Same defect the
STATE_4 cell below already caught and corrected for `angle_line_normal_deg`.) (no live slider on this state — the sweep is
choreography-only, matching the skeleton's control table). Formula surface `D = |n̂·(q−a)| / ‖n‖` is
present from state entry (no timed reveal exists on the vg formula surface; engine request Δ11 filed).
**Checked:** `s=−2.2→3.1086`, `s=0→2.1983`, `s=+1.6→2.7201` (§2e) — all three MATCH the skeleton to
the stated precision.

### STATE_4 — "A Line Meets a Plane Once, or Never"
`translate-through` · core · **`misconception_watch`: M2** · register: **graphical leads** · words
~~42–50~~ **⚠ CORRECTED: shipped final 53 words, within Rule 31's 25–55 law** (this document's
design-time estimate was stale, not a defect in the shipped narration — see the Final narration
ledger below).
**Objects:** `P1` static/bright. Two `lines[]`, SEQUENTIAL via `reveal_at_ms`/`hide_at_ms`:
`Lpar` (`role:"dir2"`/cyan, the `n̂·d̂=0` case) visible 0–9500 ms. ~~sliding bodily via
`offset:{along:<a translation direction in the plane's own frame>, zero:0, knob:"aux_a"}`,
`animate:[{knob:"aux_a", from:0, to:1, start_ms:2000, duration_ms:6000}]`~~ **⚠ CORRECTED (F-A,
2026-08-20 — this pass records a fix this document never carried at all):** `Lpar` slides SIDEWAYS,
staying above the plane at a CONSTANT height — `offset:{along:[0.379337,1.083821,-4.866357],
zero:0.5, knob:"aux_a"}`. This `along` vector is the IN-PLANE axis `n̂×û` (magnitude 5.000000,
`along·n̂ = −2.76×10⁻⁷` — zero to float precision), so the plane distance is translation-invariant
along it BY CONSTRUCTION. This is the taught fact, not incidental choreography: **constant distance
while sliding IS the visible signature of "n·d = 0 ⇒ parallel, never meets"** — a visibly CLOSING gap
here would argue FOR the misconception on the exact state built to kill it.
`animate:[{knob:"aux_a", from:0, to:0.55, start_ms:2000, duration_ms:6000, easing:"smoothstep"}]`
— bounded at displacement +0.25 wu off the `zero:0.5` home pose. The withdrawn `to:1` endpoint (a
full ±2.5-equivalent sweep) drove `Lpar` to **0.217 wu from the camera itself**, where it collapsed
end-on to **~6 px** — invisible while `s4_1`/`s4_2` narrate the constant-height claim. The re-solved
sweep keeps the image diagonal **≥ 78.9 px** across the whole slide (checked against pixels: 127.4 px
at t=0 → 74.4 px at t=8000, still visible to `hide_at_ms:9500`; the skeleton's own independent
re-solve, run `20260820-213712`, corroborates: 128.6/119/43 px predicted vs 127/118/40 px measured at
t=0/4000/6000 — a different sampling of the same bounded slide). `angle_arcs:[{id:"arc_par",
between:["Lpar","P1.normal"], readout:"angle_line_normal_deg", reveal_at_ms:500, hide_at_ms:9500}]`
— present for `Lpar`'s own window, reading `90.0°` throughout (perpendicular to the normal is the
algebraic content of `n·d=0`).
`Lcut` (`role:"dir1"`/amber) `reveal_at_ms:9500, grow_ms:800` — the CONTRAST slide, deliberately on
the OPPOSITE axis: it grows in LIFTED 1.4 units along `n̂` (state default `aux_b:1.4`) via
`offset:{along:[0.32152,0.91862,0.22966], zero:0, knob:"aux_b"}`, then
`animate:[{knob:"aux_b", from:1.4, to:0, start_ms:10500, duration_ms:4500, easing:"smoothstep"}]`
slides it bodily DOWN along `n̂` onto its home pose — the in-plane slide (`Lpar`) changes nothing, the
along-`n̂` slide (`Lcut`) closes the gap. ~~`intersection:{line:"Lcut", plane:"P1", id:"X",
role:"derived", reveal_at_ms:15000, grow_ms:600, show_right_angle:false}`~~ **⚠ CORRECTED: the
shipped surface is `intersections[]`, PLURAL, two entries** — `X_par` (`line:"Lpar", plane:"P1",
role:"derived", reveal_at_ms:1000, hide_at_ms:9500, grow_ms:600, show_right_angle:false` — authored
only so the token slot resolves; it never actually renders a marker, since no meeting point exists
to draw) and `X` (`line:"Lcut", plane:"P1", role:"derived", reveal_at_ms:15000, grow_ms:600,
show_right_angle:false` — the real snap-on marker, at `λ=2.600`) — **Δ4's `no_meeting_point` token is
authored on `Lpar`'s own window too**: ~~`value_readouts:["d_dot_n","no_meeting_point","lambda","intersection_point"]`~~
**⚠ CORRECTED — the shipped array also carries `angle_line_normal_deg` (arc_par's own token), first:**
`value_readouts:["angle_line_normal_deg","d_dot_n","no_meeting_point","lambda","intersection_point"]`
so the HUD prints the literal "no meeting point" row while `Lpar` is the active/visible line (Δ4's whole
point — a hidden marker alone teaches nothing; the token makes the ABSENCE a rendered fact, `:13624–13630`).
**`n·d` CORRECTED per §2e: `0.574`, not `0.624`** — both the parallel line's `0.000` and the cutting
line's `0.574` are what will actually render. `controls:[]`.
**Checked:** `Lpar`: `d̂·n̂ = 2.8×10⁻¹⁷`, `|·| ≤ 1e-9` ✓ (parallel case fires); `offset.along·n̂ =
−2.76×10⁻⁷` on a `|along| = 5.000000` vector ✓ (the constant-height claim, verified, not eyeballed).
`Lcut`: `d̂·n̂ = 0.5736` (matches `cos(55°)=sin(35°)` exactly, §2e), `λ=2.600` (scale-invariant,
unaffected by the `n·d` correction).
**Final narration (already shipped, matches this correction):** `s4_1` "This line is perpendicular
to the normal. Watch it slide sideways above the plane." · `s4_2` "Its height never changes, so it
never touches." — both describe the SIDEWAYS/constant-height picture; the withdrawn "slides toward
the plane" reading this document carried before this pass never matched either the shipped geometry
or the shipped narration.

### STATE_5 — "Two Lines That Never Meet" (SUPPORTING AHA)
`rotate-to-reveal` · core · **`misconception_watch`: M3** · register: **graphical leads, the LIVE
number is the whole confrontation** (Rule 32a: the true value is on screen from ≈1800 ms, ~200 ms before the false
picture ever appears unnumbered) · words ~~44–52~~ **⚠ CORRECTED: shipped final 55 words, at the Rule 31 cap**.
**Camera:** `camera_position` = the S5 entry pose in xyz (`R=13, az=146°, el=4°` converted:
`[R·cos(4°)·cos(146°), R·sin(4°), R·cos(4°)·sin(146°)] = [-10.751, 0.907, 7.252]`), `camera_mode:"steps"`,
`camera_steps:[{at_ms:5000, az:<S8's az -38>, el:<S8's el 56>, dist:13, ease_ms:12000},
{at_ms:20000, ease_ms:0}]` (the swing runs 5000–17000 ms, then a terminal hold step at 20000; skeleton
§12 records `at_ms: 5000, ease_ms: 12000; was 7500 / 9000`). **⚠ CORRECTED 2026-08-21, QA pass-9 F7:** was ~~a single step
`{at_ms:6000, ease_ms:7000}` "arrives by 13000 ms"~~ — both values and the step COUNT were stale.
**Objects:** `lines:[M1(role:"dir1"/amber), M2(role:"dir2"/cyan)]` both `reveal_at_ms:0`. **`value_
readouts:["skew_distance"]` live from ≈1800 ms** (**⚠ CORRECTED 2026-08-21, QA pass-13:** ~~"present from `t=0`" … "available
the instant `common_perpendicular` is authored, regardless of the SEGMENT's own reveal fraction"~~ — the
readout publishes under `if (vgArrived(cfrac))`, and `vgArrived` is `frac >= VG_SUBJECT_SHOWN_MIN`
(0.999), so with `common_perp` authored `reveal_at_ms:0, grow_ms:1800` the number lands at ≈1798 ms.
**The pedagogy is unaffected and still holds:** the crossing pulse reveals at 2000 ms, so the true value
still precedes the false picture — by ~200 ms, not by 2000 ms. The `res` object is still COMPUTED before
the `if (res.exists)` branch; it is the PUBLISH that waits. The readout and
the drawn segment are independent, confirmed at `:13092–13094`, computed BEFORE the `if(res.exists)`
segment-drawing branch). The crossing-pixel marker (§2e correction): `points:[{id:"crossing_mark",
position:[-1.7974,-0.9896,0.3909] /* on LINE 1, the point whose projection under THIS fixed entry pose
coincides with line 2's image — see §2e */, role:"neutral", reveal_at_ms:2000, grow_ms:300, hide_at_ms:3500}]` — a
1.5 s pulse, matching the skeleton's timing exactly, now on a VERIFIED position rather than an
unreconciled "t" value. `common_perpendicular:{between:["M1","M2"], id:"common_perp", role:"derived",
reveal_at_ms:0, grow_ms:1800}`. **⚠ CORRECTED 2026-08-21, QA pass-9 F7:** was ~~reveal_at_ms:3800, grow_ms:2200~~ — not cosmetic: it placed
the green common perpendicular growing at 3800–6000, i.e. AFTER the crossing pulse retires at 3500.
Shipped grows it 0–1800, BEFORE the pulse, which is what the misconception beat requires — the
`shortest distance = 1.800` readout is gated on the perpendicular ARRIVING, so the number can only be
live on the false-picture beat if the geometry reveals at 0 (the coupling the skeleton's S5 row carries
as a standing warning; "restoring" the documented 3800 ordering re-opens the CRITICAL row it closed).
**Checked:** distance `1.800` published at ≈1798 ms ✓ (**⚠ CORRECTED 2026-08-21, QA pass-13:** ~~"present at `t=0`"~~ — the
attestation was measured against the pre-PR-#93 ungated resolver); crossing marker position independently re-derived
(§2e), NOT copied from either contradictory skeleton citation.

### STATE_6 — "Directions Alone Fix the Angle"
`rotate/flip` · core · register: **numeric leads** (the only state where it does, per skeleton §10g —
the angle readout IS the subject) · words ~~38–46~~ **⚠ CORRECTED: shipped final 51 words, within Rule 31's 25–55 law**.
**Objects:** `M1`, `M2` re-drawn from one shared origin (`point:[0,0,0]` on a display-only copy — the
DoD's own note that this is a re-drawing, not the same objects, is preserved). `angle_arcs:[{id:"arc1",
between:["M1","M2"], readout:"angle_lines_deg"}]`.
**Two-phase choreography, CORRECTED 2026-08-20 — only `M1`'s anchor slides, `M2` does not:** phase 1
`M1`'s anchor slides via `offset` on an `aux_a`-driven knob (`M1` never rotates anywhere in this
concept, so it can never detach from the arc's apex); `M2` authors NO offset field at all and stays
fixed at its authored anchor point for the whole state — `M1`/`M2`'s `dir` fields are UNTOUCHED through
phase 1 — arc holds at `69.4°` (Rule 32b: only the anchor moves, the taught quantity — direction — does
not). Phase 2: `M2.rotate = {about: [0.2877,-0.8387,-0.4625] /* n̂c, the authored literal cross-product
axis, verified below */, zero: 69.3846, knob:"theta_deg"}`. ~~`animate:[{knob:"theta_deg", from:25,
to:115, start_ms:<phase-2 start>, duration_ms:<phase-2 span>, easing:"linear"}]`~~ **⚠ CORRECTED
(this pass): the shipped surface is TWO windows — a HOLD, then a RISE — never a single 25→115
sweep:** `animate:[{knob:"theta_deg", from:69.3846, to:69.3846, start_ms:0, duration_ms:10500,
easing:"linear"}, {knob:"theta_deg", from:69.3846, to:115, start_ms:10500, duration_ms:9000,
easing:"linear"}]`. `theta_deg` never scripts a fall to 25° at all — the FIRST window's `from` and
`to` are BOTH `69.3846`, so `vgAnimValue`'s own pre-roll (reading a knob's `from` before its
`start_ms`) can only ever read the correct default; this is what makes the earlier θ=25°
dead-config defect (pass-4 F1) structurally impossible now, not merely timed around. The window
then rises to `115°` over the remaining 9 s. Reaching `25°` on this state is TEACHER-DRIVEN ONLY,
via the live `theta_deg` slider (`controls:["theta_deg"]`,
`vg.control_ranges:{theta_deg:{min:25,max:115}}`) — never scripted. (The exact ms split is the
skeleton's own §12 FIX ROUND table, a `→JSON` directive owned by `json_author` — untouched by this
desk; only WHICH object carries the offset is this desk's own correction, both this pass and the
prior one.)
**`vg.control_ranges:{theta_deg:{min:25,max:115}}`** (§3 — stays inside the camera-verified sweep).
`controls:["theta_deg"]`.
**Why (closes the residue on the OPEN MAJOR scar `vg_offset_animate_ends_off_zero_so_a_rotated_line_
leaves_its_shared_arc_apex` for this state):** `vgObjOffset` translates an anchor by a FIXED WORLD
VECTOR that does not rotate with `dir` (`field_3d_renderer.ts:13079`); `vgObjRotate` rotates only `dir`
(`:13085`) — the two are independent, and `theta_deg` is a LIVE teacher slider with no timed
control-reveal to block an early drag. The original two-anchors-slide design put an offset on `M2` —
the object `theta_deg` rotates — so a drag at any point before `aux_a` returns to zero would carry
`M2`'s arm off the shared apex by up to ~1.05–1.07 world units (measured at the slider bounds θ=25°/
115°, the row's own filed negative control). Restricting the slide to `M1` (which never rotates)
removes the failure mode structurally rather than narrowing its window: `M2`'s arm now passes through
the shared apex at EVERY sampled `theta_deg`, for the full state, drag or no drag. Pedagogically
unchanged — translating a line along its own direction while that direction holds is still phase 1's
entire lesson; one line demonstrating it is sufficient.
**Checked, numerically (not just argued):** rotating `d̂2` about `n̂c=normalize(d̂1×d̂2)` by
`φ=(theta_deg−69.3846°)` reproduces `angle(d̂1, d̂2_rotated) = theta_deg` EXACTLY at every sampled value
— `25.0000°→25.0000°`, `90.0000°→90.0000°`, `115.0000°→115.0000°` (python3, Rodrigues rotation,
Numerical sanity check log). This is the authoring recipe that makes the readout and the picture
provably agree at every point of the sweep, not merely at the endpoints.

### STATE_7 — "Measure to the Normal, Then Subtract" (extended)
`decompose` · extended · register: **graphical leads** · words 40–48.
**Camera:** `camera_mode:"steps"`, `camera_steps:[{at_ms:0, az:140, el:26, dist:13, ease_ms:1800}, {at_ms:17000, ease_ms:0}]` (**⚠ CORRECTED 2026-08-21, QA pass-10 F8:** the
shipped array has **two** steps; the quoted literal closed after the first — the identical
step-count defect corrected on S5 this same round) off
the shared home pose (S2's own pose — the skeleton's own P1-2 correction, `az 140/el 26`, NOT S2's
reused pose, which the re-solve scored at `8.45°` minimum pairwise separation — genuinely unreadable).
**Objects** (**⚠ CORRECTED 2026-08-21, QA pass-12 F10:** the literal previously quoted here **closed early** — no reveal times, no radii, and
the whole `segments` array missing. Post-`d044dbb1` an arc's `reveal_at_ms` **is** the gate on its angle
token, so an author rebuilding S7 from the old literal would author arcs with no reveal time, both
tokens would publish at state entry, and
`vg_projection_publishes_both_angle_tokens_before_either_arc_is_drawn` would reproduce **on the state it
was closed for**. The correct values are transcribed from skeleton §12, not re-derived):
`lines:[{id:"Lcut", …, reveal_at_ms:0, grow_ms:1000}]`;
`projection:{line:"Lcut", plane:"P1", id:"shadow", role:"neutral", reveal_at_ms:4000, grow_ms:3000}`;
`segments:[{id:"normal_part", role:"neutral", from:[2.485307,−0.086981,0.263557],
to:[2.11647,−1.14078,0.0001], reveal_at_ms:2500, grow_ms:2500}]` — the "part along the normal" the
narration names, added by the 2026-08-20 fix round and previously absent from this document entirely;
`angle_arcs:[{id:"arc_normal", between:["Lcut","P1.normal"], readout:"angle_line_normal_deg",
radius:0.62, reveal_at_ms:8000, grow_ms:2500},
{id:"arc_plane", between:["Lcut","P1"], readout:"angle_line_plane_deg",
radius:0.95, reveal_at_ms:12000, grow_ms:3000}]` (the stepped radii are the fix for
`two_angle_arcs_sharing_an_arm_are_drawn_at_one_radius`: 0.62 sits INSIDE the normal arm, which the
shared 0.9 overran, and the 53 % step is what lets a reader see 55° and 35° as two arcs rather than one
continuous 90° curve — both arcs carry the reasoning as an authored `note`) — **the `L,P.normal` vs `L,P`
forms are the exact Δ5 mechanism** (`:13192–13206`) that keeps "angle to normal" and "angle to plane"
separately addressable, which is the state's entire point. `value_readouts:["angle_line_normal_deg",
"angle_line_plane_deg"]`. `controls:[]`.
**Checked:** `to_normal=55.00°`, `to_plane=35.00°`, sum `=90.00°` BY CONSTRUCTION (`vgLinePlaneAngles`,
`:12788–12793`) — not a coincidence of these particular numbers, true for every line/plane pair the
resolver is given.

### STATE_8 — "The Gap Runs Along d₁ × d₂" (advanced)
`overlay-match` (coined) · advanced · `derivation_first_principles` · register: **graphical leads,
symbolic surface writes LAST** (Rule 34b/38c) · words ~~44–52~~ **⚠ CORRECTED: shipped final 55 words, at the Rule 31 cap**.
**Camera:** static `az −38° / el 56° / dist 13` (arrived-at already, via S5's `camera_steps`).
**Objects:** S5's scene returns — `M1`/`M2` `reveal_at_ms:0, grow_ms:1500`, `common_perp`
`reveal_at_ms:1000, grow_ms:1000` (**⚠ CORRECTED 2026-08-21, QA pass-9 F7:** was ~~all `reveal_at_ms:0`, already-settled~~).
`vectors:[{id:"cross_vec", role:"derived", origin:[0,0,0], derive:"cross", of:["M1","M2"], scale:1,
reveal_at_ms:3000, grow_ms:3000}, {id:"a2_minus_a1", role:"third", origin:"M1", derive:"between",
of:["M1","M2"], reveal_at_ms:1000, grow_ms:1000}]` (**⚠ CORRECTED 2026-08-21, QA pass-9 F7:** both were ~~reveal_at_ms:2000~~. `a2_minus_a1`
matters most: it must complete WITH `common_perp` at 2000, because F13b publishes
`numerator_triple_product` on the perpendicular's arrival — a later reveal put the number on the HUD
11–13 s before the vector it names, an eye_walker MAJOR. The residual 4 s `cross_norm`-before-`cross_vec`
lead is the documented Δ12 engine item, not an authoring choice.) — **`role:"third"` is the magenta restoration**, exactly matching `VG_ROLE_COLOR.
third = "#E15FA8"`. The "translates onto the common perpendicular" beat: `cross_vec`'s `origin` address
ramps from `[0,0,0]` to `common_perp`'s own midpoint via `{lerp:[[0,0,0],"common_perp"], t:{knob:"aux_a"}}`
— **this is only possible because `vgAddr`'s `lerp` form accepts a DERIVED-point string id** (`ctx.
derived["common_perp"]`, populated at `:13099`) — ~~`animate:[{knob:"aux_a", from:0, to:1, start_ms:7000,
duration_ms:5000, easing:"smoothstep"}]`~~ **⚠ CORRECTED (this pass): the shipped window is
`start_ms:8500, duration_ms:7000`** (the `to:1` endpoint itself was never wrong):
`animate:[{knob:"aux_a", from:0, to:1, start_ms:8500, duration_ms:7000, easing:"smoothstep"}]`.
Formula surface + three HUD terms (`numerator_triple_product`, `cross_norm`, `skew_distance`)
~~fill in at 12000–15000 ms~~ **⚠ FLAGGED, not re-solved by this desk: that timing was computed off
the now-corrected animate window's OLD end (7000+5000=12000) and is unverified against the new one.
`common_perp` itself is `reveal_at_ms:1000, grow_ms:1000` (**⚠ CORRECTED 2026-08-21, QA pass-10 F8:** ~~"`reveal_at_ms:0`,
already-settled (inherited from S5)"~~ — the value this document had already struck 18 lines above, so
the conclusion that rested on it is withdrawn too: the three tokens are NOT live from state entry, they
publish on the perpendicular's arrival at 2000 ms, which is why `a2_minus_a1` must complete at 2000). This is the SAME area the handoff's
own Δ12 finding already names (`cross_norm` leads `cross_vec` by several seconds under the shipped
interim, `MATHEMATICS_LINES_AND_PLANES_HANDOFF.md` §0.03d) — a founder/`peter_parker:field3d_surgeon`
call, not something this desk re-solves by assertion.** `controls:[]`.
**Checked:** `1.6847/0.9360 = 1.8000` ✓ (§2e) — the three-term identity holds against the ACTUAL
resolved numbers, not a separately-typed decimal.

### STATE_9 — "Explore: Move Every Part"
`drag-sandbox` · core · `interaction_complete` · 0 words / open (Rule 37).
`scene_groups:[{key:"A",label:"line + plane"},{key:"B",label:"skew pair"}]`,
`camera_mode:"group"`, `group_cameras:{A:{az:138,el:20,dist:14}, B:{az:-58,el:64,dist:13}}`.
`controls:["scene_group","lambda","lambda_span","half_extent","q_height","theta_deg","line2_offset"]`
(**⚠ CORRECTED 2026-08-21, QA pass-11 F9:** ~~the UNION of both groups' knobs~~ — S9 authors `group_controls`, so each group resolves its
own list via `vgEffectiveControls`; the flat `controls` array is the no-groups fallback, not a union
requirement — §3). `vg.control_ranges:{half_extent:{min:1.5,max:4.5},
lambda_span:{min:2.5,max:5.0}, theta_deg:{min:25,max:115}}`. Every object in group A
(`L1`, `P1`, the perpendicular, `q`) authors `groups:["A"]`; every object in group B (`M1`, `M2`,
`common_perp` — **⚠ CORRECTED 2026-08-21, QA pass-10 F8:** ~~and `cross_vec`~~; shipped S9 authors NO `vectors` array at all, and this
document's own 2026-08-10 amendment below already removed it) authors `groups:["B"]` (`vgInGroup`, `:12848–12854` — an object naming no
`groups` belongs to EVERY group, so this must be authored explicitly on every S9 object or the wrong
group's apparatus stays visible).

**§ Rule 37 — the honest resolution of "λ ping-pongs until a slider is seized" (Diff 1, in full).**
**⚠ CORRECTED 2026-08-21, QA pass-10 F8:** ~~"`vg.animate[]` is one-shot-hold … there is **no engine primitive for an infinite loop**, so a
literal perpetual ping-pong CANNOT be authored"~~ — **FALSE, and the recommendation that followed it was
the exact construction the engine team filed as a bug.** The primitive EXISTS: `vg.animate_loop_ms`
declares a period and `vgLoopMs` wraps the state clock into it (`field_3d_renderer.ts:529`,
`:12438–12455`, `:15019`). Shipped S9 authors `animate_loop_ms: 18000` with two 9 s legs and loops
forever. The withdrawn advice — "8 legs of 9 s each, ≈72 s total" — is precisely
`vg_explore_animate_windows_are_finite_so_the_free_running_sandbox_freezes`, whose row records that #9's
STATE_9 once "hand-unrolled a ping-pong as EIGHT alternating windows ending at 72000 ms and froze at
lambda = -3.5 from 72 s onward … An authored loop that is merely LONG is a bug with a delay on it." The
player-level Rule 37 guarantee (the clock free-runs, never auto-freezes on `interaction_complete`) is
real and independent of this scenario — but it only produces visible motion for as long as some
authored `animate[]` window is still open or has not yet been superseded; past the last window's end,
`vgAnimValue` returns `to` and holds there **forever**, silently, with no further motion. **⚠ CORRECTED 2026-08-21, QA pass-11 F9:** the ELEVEN LINES that stood here are withdrawn in full — the pass-10 correction struck this
paragraph's opening sentence and left its **recommendation** live, which is the worse half.
~~"Honest substitute, buildable today: author a LONG but FINITE multi-window back-and-forth on lambda …
e.g. 8 legs of 9 s each (−3.5→3.5, 3.5→−3.5, ×4, ≈72 s total) … FLAGGED: a genuine infinite ping-pong
is a new animate[] mode value, a real, small engine change"~~. **The correct recipe is one line:**
author `vg.animate_loop_ms: 18000` beside two 9 s `lambda` legs, exactly as shipped S9 does — the
clock wraps (`vgLoopMs`) and the sweep runs forever. The withdrawn advice is verbatim the
`vg_explore_animate_windows_are_finite_so_the_free_running_sandbox_freezes` bug, whose row records this
very concept hand-unrolling eight legs to 72000 ms and freezing thereafter: **an authored loop that is
merely LONG is a bug with a delay on it.** No engine change is requested; nothing is FLAGged below.


## 5. Notation ladder (Rule 38c) — verified against the actual formula-surface assignments

**Core + extended (S1–S7, S9): algebraic and geometric forms only, verified line by line:**
`r = a + λd` (S1) — algebraic, vector-plus-scalar-multiple, no operator beyond `+`/scalar multiply.
`n·(r−a)=0` (S2) — a dot product, introduced ON canvas the same state it is first used (S2's own
one-beat `n̂·v` demonstration), never assumed. `D = |n·(q−a)|/‖n‖` (S3) — dot product + modulus + norm,
all already-established by S2. `λ = n·(a_P−a)/(n·d)` (S4, if surfaced — the skeleton's DoD table lists
it in the identity-check column, not necessarily on the rendered formula overlay; if `json_author`
promotes it to a formula surface it stays algebraic). `cos θ = |d1·d2|/(‖d1‖‖d2‖)` (S6), `sin θ =
|d·n|/(‖d‖‖n‖)` (S7) — both algebraic ratios of dot products and norms, no calculus, no vector
CALCULUS operator (`∇`, `∫`), no formal limit. **No core or extended surface names `d1×d2` or "cross
product" anywhere** — verified against §4's object list above: `S8` is the FIRST state to author
`cross_vec`/`a2_minus_a1`, and `S8` is the sole advanced-ring state, contiguous, immediately before the
explore state (Rule 38a) — matches the skeleton's own ring assignment exactly.

**Advanced-only (S8): `D = |(a2−a1)·(d1×d2)| / ‖d1×d2‖`.** Cross product notation, a scalar triple
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

**AMENDMENT 2026-08-10 (the §2c re-authoring after the xhigh review) — two corrections to this section:**

1. **The distance is `D` (capital), never `d`** — resolving
   `vg_one_symbol_carries_two_meanings_across_states_of_one_concept`: the ladder above quoted
   `D = |n·(q−a)|/‖n‖` (S3) and `D = |(a2−a1)·(d1×d2)|/‖d1×d2‖` (S8) while `d`/`d₁`/`d₂` are the
   concept's line DIRECTIONS from S1 onward — one symbol, two meanings, in the same S8 expression.
   The shipped formula surfaces now read `D = |n·(q − a)| ⁄ ‖n‖` and `D = |(a₂−a₁)·(d₁×d₂)| ⁄ ‖d₁×d₂‖`,
   and `physics_engine_config.formulas` records the same choice. Lowercase `d` is reserved
   concept-wide for directions; capital `D` is the distance (both S3's point–plane and S8's skew).
2. **The S9 group-B paragraph above is REFUTED and superseded** — the xhigh review confirmed
   (`vg_explore_state_surfaces_advanced_ring_content_under_a_reduced_preset`) that under
   `core_only`/`no_advanced` the hidden S8 leaves S9's group-B `d₁×d₂` arrow + `cross_norm` +
   `numerator_triple_product` rows introduced by NO surviving state — "manipulation of an
   already-taught relation" fails exactly when the teaching state is hidden. S9 now surfaces
   CORE-ring content only (Rule 38b as written): `cross_vec` and both advanced tokens (and the
   never-published `lambda`/`angle_lines_deg` tokens) are removed from S9; its readouts are
   `point_plane_distance` / `n_norm` / `skew_distance`.

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
  "the two-segment dot-product-intro recipe on S2 relies on BOTH segments reading n.v = 0 for every value of their own knob whenever their lerp endpoints are both in-plane addresses -- verified this holds unconditionally (not just at the intended t), which is what keeps the per-frame readout from ever printing a wrong value during either segment's idle window [CORRECTED 2026-08-21, QA pass-12: the clause formerly read 'the resolver's per-frame unconditional readout recomputation' — the resolver is NOT unconditional, it gates every publish on vgArrived; 'unconditionally' attaches to the MATHEMATICAL fact, never to the resolver. This wording now matches the shipped physics_engine_config.constraints entry in substance (a faithful paraphrase, not the identical string)]",
  "[PROPOSED — NOT IN THE SHIPPED ARRAY, noted 2026-08-21 QA pass-13: this doc lists NINE constraints, physics_engine_config.constraints ships EIGHT. Either ship this entry or drop it; it is true and worth shipping] STATE_6 phase 1 slides ONLY M1's anchor (M1 never rotates anywhere in this concept); M2 authors no offset field and stays fixed at its anchor until phase 2's theta_deg rotation -- vgObjOffset translates by a fixed world vector independent of vgObjRotate (field_3d_renderer.ts:13079/13085), so any offset authored on the object theta_deg rotates live (no timed control-reveal exists to block an early drag) would let a teacher's drag carry that object's arm off the shared arc apex by up to 1.07 world units -- the vg_offset_animate_ends_off_zero_so_a_rotated_line_leaves_its_shared_arc_apex row's own negative control; unreachable on this concept now that M2 never carries an offset"
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
5. **WITHDRAWN **⚠ CORRECTED 2026-08-21, QA pass-11 F9:**** ~~"A candidate `engine_bug_queue` row, found but not filed:
   `field3d_vg_segment_readout_computed_unconditionally_regardless_of_reveal_state` — `vgResolveLinesPlanes`
   computes a segment's readout every frame regardless of `reveal_at_ms`/`hide_at_ms`"~~ — **the row
   already exists and is FIXED**, as `vg_lines_planes_segment_readouts_compute_regardless_of_reveal_state`;
   the engine gates every readout on `vgArrived`. This FLAG is addressed to
   `founder_proxy`/`quality_auditor` by name, so left standing it would have asked Checkpoint B to open
   an engine request for a closed bug class — the same failure mode as the withdrawn FLAG 7. The
   surviving, still-true half: `n_dot_v` is overwritten by whichever matching segment is LAST in the
   array, so a multi-segment "same instrument, different phases" recipe still depends on array order
   (§4's S2 recipe is safe by construction; a future reuse should check).
6. **`camera_mode:"group"`/`group_cameras` (Δ10's actual mechanism) and `scene_group`/`scene_groups`
   (Δ10's selector) are all absent from the `vg` TypeScript type** (`:390–517`) though the frame driver
   reads all four at runtime — a fourth instance of the authorability gap Diff 3 named, confirmed by
   direct read of the `camera_mode?: 'authored' | 'steps' | 'auto_frame'` union, which excludes
   `'group'` outright. Recommend a platform-side (Rule 40) type-declaration fix; not a build blocker.
7. **WITHDRAWN **⚠ CORRECTED 2026-08-21, QA pass-10 F8:**** ~~"`vg.animate[]` has no infinite-loop primitive … a genuine infinite ping-pong
   is a small, real engine change"~~ — the primitive exists and ships. S9 authors
   `animate_loop_ms: 18000` (`vgLoopMs`, `field_3d_renderer.ts:12438–12455`) and ping-pongs forever on
   two 9 s legs. This FLAG was addressed to `founder_proxy`/`quality_auditor`, so left standing it
   would have carried a false engine-gap claim into Checkpoint B. No engine change is requested.
8. **The catalog prerequisite discrepancy the skeleton already flagged (its FLAG 1) is unresolved and
   out of this role's authoring scope** — `mathematicsCatalog.ts:139`'s `vector_dot_and_cross_product`
   vs the wave's actual Act I id `vector_products_in_space`. Carried forward, not re-argued.
9. ~~**The S9 explore state's `line2_offset` knob (group B) carries the SAME exposure the STATE_6 fix
   just closed, and is OUT OF SCOPE for this fix round.** `line2_offset` is authored to "slide the skew
   line M2's anchor along d2-hat" (§1 engine_config), and S9's group-B controls also expose `theta_deg`
   live, on the same object `M2`, with no per-window gating (S9 is a free sandbox by design — every
   control is live at once). A teacher who drags `line2_offset` off zero and then drags `theta_deg`
   reproduces STATE_6's now-fixed failure mode inside the explore state. This was NOT in this round's
   routed scope (the filed scar's negative control names only STATE_6) and this desk has not re-designed
   S9 to match — flagged for the next fix round or for `founder_proxy`, not silently carried as safe.**~~
   **⚠ WITHDRAWN, this pass (2026-08-20) — the premise was FALSE on two independent grounds.** §1
   `engine_config`'s "along d2-hat" was itself a stale, inert-slider description (F1a — see the §1
   correction above): the shipped `M2.offset.along = [0.287668,-0.838664,-0.462482] = n̂c =
   normalize(d₁×d₂)`, the SAME vector as `M2.rotate.about` — the axis PERPENDICULAR to both
   directions, never a vector parallel to `M2`'s own rotating direction. Because `n̂c` is invariant
   under a rotation performed ABOUT `n̂c` itself, `line2_offset` and `theta_deg` cannot desync the way
   the withdrawn STATE_6 design did (there, the offset ran along the object's OWN direction, which the
   SAME slider then rotated out from under it — a structurally different hazard). This is confirmed,
   not merely argued: `MATHEMATICS_LINES_AND_PLANES_HANDOFF.md` §0.03b ("Also closed") records
   `line2_offset` now driving `skew_distance` LIVE (`1.800 → 0.800 → 0.000 → 3.500`, trusted-event
   drive) with the OPEN MAJOR apex scar confirmed closed. Separately, and independent of the vector
   question: S9 authors NO `angle_arcs` at all (unlike STATE_6), so there is no shared arc apex for
   `M2` to detach from in the first place. **Not a silent clearance** — this is a re-read of
   already-recorded evidence (the handoff), not a fresh render verification by this desk; a future
   walk finding a live problem here would be a NEW finding, not a recurrence of this withdrawn one.



---

## FIX ROUND 2026-08-20 — pass-4 `quality_auditor` F3/F6 + architect F2-routed items (this desk's four)

Routed via the architect's Pass-1 pass after a pass-4 `quality_auditor` FAIL. Four items; all four
closed on this desk. `alex:json_author` applies §"final narration" below verbatim to `text_en` on the
named sentence ids — this desk does not touch the concept JSON (out of tool scope).

**1 · F3 — lowercase-`d`-as-DISTANCE sweep, closed and RE-VERIFIED with a whole-document regex pass.**
Architect's regex (`(^|[^a-zA-Z₁₂_\\])d *= *(\\)?\|` plus `\bd ≥ 0|\bd = 0\b`), run against this
file's full text:
- **Before:** 11 lines matched (223, 225, 306, 308, 350, 359, 523, 655, 665, 684, 839).
- Of those, **4 are legitimate `n·d`/`n.d` dot-product mentions** (306, 350, 359, 839) — the scar's own
  exclusion list names `n·d`/`d·n` explicitly; these were left untouched (the dot product between a
  normal and a direction is not the distance the scar is about, and correctly stays lowercase `d`).
- **7 lines carried true distance-as-lowercase-`d` instances (10 individual occurrences: 223 ×3, 225 ×1,
  308 ×1, 523 ×1, 655 ×1, 665 ×1, 684 ×2)** — every one fixed to capital `D` (223's row, 225's cell,
  308's Rule-34b symbolic-form parenthetical, 523–524's S3 formula-surface sentence — which also had a
  factual correction, see below — 655/665's notation-ladder body text, and 684's amendment-paragraph
  quotation, preserving its `d`/`d₁`/`d₂` direction references unchanged as directed).
- **523–524 carried a second, independent defect beyond capitalisation**: the sentence claimed the S3
  formula surface "writes at 11000–12500 ms", but the vg formula surface has **no timed-reveal field**
  (Δ11, confirmed nowhere in the `vg` type or resolver) — corrected to state it is present from state
  entry, per the architect's exact replacement text.
- **After:** re-running the identical regex over the edited file returns 4 hits — all 4 are the same
  legitimate `n·d`/`n.d` mentions, verified by string-matching each hit line against `n·d`/`n.d`/`d·n`/
  `d.n`. **True-positive count: 0.**
- **⚠ CORRECTED (pass-7 routing, 2026-08-20) — the claim below, as this document originally stated it,
  was FALSE and is retracted; a narrower, true claim replaces it.** This document originally said: *"The
  scar `a_fix_round_closes_the_reported_instances_of_a_restated_value_and_never_sweeps_the_document_for_
  the_rest` is satisfied — every instance was found by a document-wide regex sweep, not only the seven
  lines the routing message named, and the seven named lines matched the sweep's own output exactly."*
  That is true ONLY for the one value class this regex covers (lowercase-`d`-as-distance) — it is not a
  document-wide guarantee against the scar's GENERAL form, and the scar recurred a THIRD time inside
  this SAME document, on FOUR OTHER value classes this exact regex was never built to see: F-A's
  `animate to:1`/`offset zero:0`/singular `intersection` (STATE_4), the stale `theta_deg` 25→115 single
  window (STATE_6), STATE_8's `start_ms:7000`/`duration_ms:5000`, and `line2_offset`'s "along d2-hat"
  direction (repeated internally at §1, FLAG 9, and the Founder-call note — three sites, one wrong
  claim). A correctly-scoped sweep for ONE value class was mistaken for a general guarantee; that
  mistake is the third recurrence, not a fourth defect of a new kind. **The corrected claim: F3's own
  scope (lowercase-`d`-as-distance) is closed, verified by a true document-wide sweep FOR THAT VALUE
  CLASS ONLY.** The scar's general form is closed for THIS document only as of this pass's own sweep —
  see "THE SWEEP — before/after, this pass" below, which is the first sweep in this document's history
  to run every changed value class against the full text rather than the one the routing message named.
  **Process recommendation (a founder/process call, not an authoring fix):** a fix round that names N
  specific stale lines should routinely also grep-sweep the FULL document for every DISTINCT value/claim
  it is about to touch, not only the value class the routing message called out — that is the actual
  root cause of this recurring three times on one concept.

**2 · F6 — two Rule 41a idioms, replaced with literal wording; STATE_3/STATE_4 stay inside the 25–55
Rule-31 word budget.** Final text below. `s3_3`'s replacement is the auditor's own suggested literal
form, applied verbatim. `s4_3`'s replacement uses "crosses" — the exact plain verb the state's own
delta-cue caption already uses ("Crosses, or never touches"), so the narration now uses the SAME word
the on-canvas caption does rather than introducing a second word for the same event.

**3 · STATE_7 — sentences 4+5 merged into one, per the architect's exact directive**, folding the
standalone "always add to ninety" claim into the subtract-from-ninety sentence rather than dropping it.

**4 · STATE_6 `s6_2` — one word, "each" → "one", to match the geometry `mathematics_author` re-authored
this session** (§4 STATE_6, §2b, §7 above): only `M1`'s anchor slides in phase 1; `M2` never carries an
offset, so a live `theta_deg` drag can never carry it off the shared arc apex (closes the OPEN MAJOR
scar's residue on this state — see the "Why" paragraph in §4 STATE_6 and the new §7 constraint bullet).
The document's own §2b claim and §4 choreography text are updated in the same pass so the ledger and the
narration agree — a restated sentence with a stale ledger row behind it is exactly the failure mode F3
exists to catch, so this desk did not leave one standing.

### Final narration — `text_en`, ready for `json_author` to paste verbatim

| id | Final `text_en` | Words | State total |
|---|---|---|---|
| `s3_3` | "It reaches its smallest value at the perpendicular, and locks." | 10 | STATE_3: 54 (unchanged — `s3_3` is a 1-for-1 word-count swap) |
| `s4_3` | "A second line arrives, heading differently. It crosses, and a marker appears." | 12 | STATE_4: ~~54 (was 55)~~ **⚠ CORRECTED: shipped total is 53** — `s4_1`/`s4_2` were themselves later re-authored by the F-A fix (this same pass, §4 STATE_4 above) to the sideways/constant-height narration; the row below's "unchanged" claim is corrected alongside this one |
| `s7_1` | "This line splits: one part flat in the plane, one along the normal." | 13 | STATE_7: 47 (was 53; sentences 4+5 merged into one `s7_4`, `s7_5` retired) |
| `s7_2` | "The angle to the normal is fifty-five degrees." | 8 | — |
| `s7_3` | "The angle to the plane is the rest: thirty-five degrees." | 10 | — |
| `s7_4` | "Measure to the normal first, then subtract from ninety: that is the angle to the plane." | 16 | — |
| `s6_2` | "Slide one line along itself: the angle does not change." | 10 | STATE_6: 51 (unchanged — 1-for-1 word-count swap) |

`s3_1`, `s3_2`, `s3_4`, `s4_4`, `s6_1`, `s6_3`, `s6_4` are unchanged — not reproduced here to avoid
`json_author` overwriting a correct sentence with a byte-identical "fix". ~~`s4_1`, `s4_2` [previously
listed here as unchanged]~~ **⚠ CORRECTED — both HAVE changed, by the F-A fix (§4 STATE_4 above), and
the shipped JSON already carries the new text**: `s4_1` "This line is perpendicular to the normal.
Watch it slide sideways above the plane." (14 words) · `s4_2` "Its height never changes, so it never
touches." (8 words) — replacing an earlier "slides toward the plane" reading. `s4_1`+`s4_2`+`s4_3`
(12)+`s4_4` (19) = **53**, the STATE_4 total corrected in the ledger row above. STATE_7's `s7_5`
id is RETIRED (its content is folded into the rewritten `s7_4`); `json_author` should remove the
`s7_5` object from `tts_sentences` rather than leave an orphaned duplicate.

### Founder-call note

Item 4 (STATE_6) was routed as "one word" but the underlying geometry decision (M1 slides / M2 does
not) was already made by the routing message, not by this desk — this desk's own judgment call was to
ALSO correct §2b's claim text and §4's choreography paragraph to match (rather than leaving the ledger
describing "both anchors slide" beside a narration line that now says one line does). ~~and to flag
(not fix) the identical exposure sitting unaddressed in S9's `line2_offset`/`theta_deg` pair — a
founder/`quality_auditor` scoping decision, not an authoring one, since S9's own control-visibility
design is out of this round's routed scope.~~ **⚠ WITHDRAWN (this pass, 2026-08-20) — that flagged S9
exposure never existed under the shipped geometry; see FLAG 9's own correction above.** The premise
(`line2_offset` sliding `M2` along its own rotating direction `d̂₂`) was never what shipped: the real
`offset.along = n̂c` is invariant under `theta_deg`'s own rotation about that same axis, and S9
authors no `angle_arcs` for an apex to detach from in the first place. This document's own §1 name
for `line2_offset` was independently stale on the exact same premise (F1a) — three internal
repetitions of one wrong claim, all corrected in this same pass, which is itself the finding this
round's routing message opened with.


---

> **⚠ STANDING CAVEAT on renderer line citations (added 2026-08-21, QA pass-11).** The `:NNNNN`
> pointers into `field_3d_renderer.ts` throughout this document were correct when written and have
> since drifted — measured this round: 18 of 19 symbol-anchored citations are stale by roughly
> +160…+390 lines (e.g. `vgAnimValue` cited at `:12317–12338`, actually `:12478`; `vgInGroup` cited
> `:12848–12854`, actually `:13018`, where `:12848` is now `vgPlaneBasis`). Only `vgResolveLinesPlanes`
> still resolves. **Resolve every citation by SYMBOL NAME, never by line number.** The substance of the
> cited claims survives except where explicitly corrected above. Not swept individually: fixing 19
> pointers that drift again on the next renderer commit trades one stale surface for another — the
> durable fix is the symbol-name rule, plus the family sweep in the note below.
>
> **The sweep that closes the engine-facts class (QA pass-11 diagnosis).** A commit-diff over the
> concept JSON enumerates claims about the JSON, and structurally cannot reach a claim about the
> RENDERER — no diff of `lines_and_planes_in_space.json` contains the word `vgArrived`. Before any
> future round on this document, run
> `git log --oneline <last-verified-sha>..HEAD -- src/lib/renderers/field_3d_renderer.ts`; each commit
> there is a FAMILY, and each family has multiple sites found by grepping its vocabulary, not its
> values. The three that invalidated this document: `86eb9190` (readout arrival gating →
> "UNCONDITIONAL / regardless of"), `7c7e963c` (`animate_loop_ms` → "infinite / finite / ping_pong /
> 8 legs"), `5eace82d` (`vgEffectiveControls` → "read ONCE per STATE ENTRY / NO visible effect").
> This class recurred six times because each round corrected the site the routing message named and
> left the other sites of the same family standing.
>
> **Two method corrections learned at QA pass-12 — apply both or the sweep leaks.** (1) Grep each
> vocabulary **case-insensitively**: a lowercase "unconditional" in §7's constraints block survived an
> otherwise-correct family-1 sweep. (2) Enumerate the commits with
> `git log --oneline --full-history --no-merges <sha>..HEAD -- src/lib/renderers/field_3d_renderer.ts`
> — plain `git log -- <path>` simplified six `vector_geometry_3d` commits behind their merge nodes and
> would have hidden four of them, including `d044dbb1` (an arc's `reveal_at_ms` became the gate on its
> angle token), which was the fourth family and the last live build-recipe defect in this document.
> The full list swept clean at pass 12: `d044dbb1`, `4416c3c8`, `9cfe7ee0`, `3318c55b`, `7c7e963c`,
> `5eace82d`, `bb11bf4e` — plus `86eb9190`, which predates this document's first authoring commit and
> was therefore stale on the day it was written.

## FIX ROUND 2026-08-20 (pass 7) — record integrity: the four stale cells + THE SWEEP

Routed via `quality_auditor` pass 7 FAIL `[reason: pass-1]` — this document's own §4 had drifted from
the shipped truth on four cells (STATE_4's F-A sweep/offset/intersection surface, STATE_6's
`theta_deg` animate shape, STATE_8's timing, S9's `line2_offset` direction), plus stale per-state word
budgets, a stale ledger row, and a false document-wide sweep claim. Every cell was corrected AT ITS
OWN SITE, in place, using the strikethrough-then-correct convention this document and the skeleton
already established — see §1 (`line2_offset`), §4 STATE_4, §4 STATE_6, §4 STATE_8, the §4 word-budget
headers on S1/S2/S3/S5/S6/S8, FLAG 9, the Founder-call note, the sweep-claim paragraph above, and the
Final narration ledger's STATE_4 row + "unchanged" list. Nothing was silently overwritten — every wrong
number this document ever carried is still readable, struck through, beside its correction and the
date.

### THE SWEEP — before → after, this pass

**Method:** re-ran the routing message's own patterns (`to:\s*1\b` in an `aux_a`/`aux_b` animate
context, `from:\s*25\b`, `start_ms:\s*7000\b`, `along d2-hat`/`d̂₂`, `34–42`, `44–52`, `40–48`,
`38–46`, `slides bodily`/`sliding bodily`, `slides toward the plane`, plus `42–50` for STATE_4's own
budget) against all three files, both before any edit in this pass and after every edit above.

**Raw pattern-hit counts went UP, not down, and re-checking that number honestly matters as much as
reporting it.** Measured by re-running the routing message's own listed patterns, plus two variants this document's actual wording needed (`sliding bodily`, the participle form the block itself used, and `42–50`, STATE_4's own stale range), against the git-committed original
and the edited file: across all three files, **24 → 55** raw hits; restricted to this document's own
authored content (excluding this very meta-section, which quotes the pattern strings themselves for
documentation and would otherwise inflate its own count), **19 → 28**. This is expected and correct,
not a regression: the annotation convention QUOTES the old wrong value inside a `~~struck-through~~`
span next to its correction, so a value this pass fixed can appear MORE than once in the raw grep —
once as the dated historical record, sometimes again in the explanatory prose around it (e.g. "the
withdrawn `to:1` endpoint..."). A raw hit count is therefore the wrong metric for "is this fixed", the
same reason F3's own sweep (§ above) reported a **true-positive count** rather than a raw hit count.
Applying the same discipline, checked line by line against the edited file (every hit re-read, not
assumed from the pattern alone):

| pattern | BEFORE (true-positive / live-stale) | AFTER (true-positive / live-stale) |
|---|---|---|
| `to:\s*1\b` in the `aux_a` STATE_4 context | 1 (line 536) | **0** |
| `from:\s*25\b` (STATE_6 phase 2) | 1 (line 581) | **0** |
| `start_ms:\s*7000\b` (STATE_8) | 1 (line 631) | **0** |
| `along d2-hat` (§1 `line2_offset` + its FLAG-9 quote) | 2 (lines 175, 1007) | **0** |
| word-budget ranges not bracketing the shipped count (S1/S2/S3/S4/S5/S6/S8) | 7 | **0** |
| `sliding bodily` (STATE_4's own motion description) | 1 (line 534) | **0** |
| **Total true-positive, this document** | **13** | **0** |

Two further stale items this pass closed are outside those grep patterns (found by direct read, not
regex) and are counted separately, per the routing message's own instruction: the Final narration
ledger's `STATE_4: 54 (was 55)` row (shipped total is 53) and its adjacent claim that `s4_1`/`s4_2`
were unchanged (they were later re-authored by the F-A fix) — **2 more**, now corrected — and the §7
sweep-claim itself, which asserted a document-wide guarantee its own regex never covered — **1 more**,
now qualified rather than deleted (the underlying F3 work stands; only the overclaim is withdrawn).
**Grand total this pass: 16 stale record-integrity items closed, 0 remaining by this sweep's own
method.**

### Surviving hits — what they are and why each one is correct to leave standing

- **Inside a `~~struck-through~~` span, beside its `**⚠ CORRECTED**` replacement** — every pattern's
  own former wrong value, kept as the historical record this convention exists to preserve (§1, §4
  STATE_4/6/8, FLAG 9, Founder-call note, the sweep-claim paragraph, this section). Intentional by
  design — deleting these instead of striking them would repeat the exact failure this pass exists to
  fix (a correction a later reader cannot audit is not a correction — the skeleton's own stated law,
  quoted at its line 1071).
- **`docs/skeletons/lines_and_planes_in_space_skeleton.md`** — every hit there (S4's F-A record at
  lines 242/658, S2's own word-budget history at lines 400/1107) is the ARCHITECT's file, already
  correctly annotated with its own dated corrections, and out of this desk's edit scope (constraint:
  edit ONLY the mathematics block). Not touched; cited here only to confirm they are not silent
  survivors of THIS document's defect.
- **`s7_1`–`s7_4`'s own `40–48` header (STATE_7, block line 655)** — never stale: 47 already falls
  inside 40–48. Left untouched deliberately, same as the routing message's own table noted ("only S7
  40–48 contains its 47").
- **S2's own, unrelated `to:1` animate windows** (lines 476–477) — genuine, different, still-correct
  choreography (the two-segment dot-product intro), matched by the same loose pattern but never part of
  the four routed defects. **VERIFIED against the shipped JSON**, not dispositioned by reasoning.
  **⚠ CORRECTED 2026-08-20, QA pass-8 F6:** this bullet previously also cleared ~~S3's `start_ms:7000`
  window (lines 510–511) as "still-correct"~~. It was NOT: seven values in that one cell disagreed with
  the build (windows 2000/5000 + 7000/2000 vs shipped 2500/9500 + 12000/3500; `perp` 9000/600 vs
  15450/0; `cmp` hide 9000 vs 15500) — on the PRIMARY AHA state. The lesson is the one §7 already names,
  one step further: a surviving hit must be VERIFIED against the JSON, never cleared by argument. The S2
  and S3 hits matched the same pattern and read identically; only a JSON diff separates them.
- **`d̂₂` at line 1188 (Founder-call note)** — used to NAME the withdrawn, false premise ("along its own
  rotating direction `d̂₂` was never what shipped"), not to assert it as current.

**Not found anywhere, before or after: any surviving instance of `along d2-hat`, `from:25` inside a
live (non-struck) animate block, `start_ms:7000` inside a live STATE_8 block, or a word-budget range
that fails to bracket its state's own shipped `text_en` count**, per direct re-grep after every edit
above.

---

## FIX ROUND 2026-08-21 — Checkpoint B (founder-proxy), fix cycle 0 — F2 / F7 / F9 (this desk's three)

Routed via `founder_proxy`'s Checkpoint-B FIX on `lines_and_planes_in_space`. Three narration findings,
all mathematics-side. `alex:json_author` applies the two "Final narration" tables below verbatim to
`text_en` on the named sentence ids, plus the F7 glow table as new `glow` fields — this desk does not
touch the concept JSON (out of tool scope). **S6's `s6_3` is untouched in this pass** — a concurrent
`architect` pass owns its acute-fold directive separately; nothing below names it, and no glow was
proposed for it.

### 1 · F2 — `s8_4` named a labelled HUD number as a quantity the scene draws at a different length

**Verified from the shipped `vg` config** (not the skeleton's numbers — recomputed in python3 from
`M1.point=[-1.2,-0.9,0.6]`, `M1.dir=[1,0.15,0.35]`, `M2.point=[0.479887,-1.725775,-0.749677]`,
`M2.dir=[0.15,-0.5,1]`, matching `vgCommonPerp`'s own normalize-before-cross behaviour): the magenta
`a2_minus_a1` vector (`derive:"between", of:["M1","M2"], origin:"M1"`) is drawn at the TRUE separation
`|a2−a1| = 2.308`, while the HUD's `shortest distance = 1.800` is the PROJECTION of that same
separation onto the unit direction `d̂1×d̂2` — a strictly shorter number, and a different geometric
operation ("how far apart, along one direction only") than "how far apart" read plain. The old sentence
named the arrow's own quantity ("how far the lines start apart") then divided it by "this direction's
length" as if producing the HUD number by that division — neither operation is what the resolver
computes, and the phrasing is unspeakable as a ratio of two lengths in the first place (a length over a
length is a pure number, not the 1.800 the HUD prints in the same units as everything else on this
formula surface).

**Chosen fix — reframes the HUD number as a projection, not a ratio, matching the founder's reading
verbatim ("the gap between the starting points, measured along this perpendicular direction").** No
neighbour sentence needed a word trade: STATE_8's total DROPS from 55 to 54 (one word under the old
figure), because the replacement is one word shorter than the sentence it replaces.

**Numerical check, run (not eyeballed) — the plain-English reading reproduces the printed number:**
```
gap = a2 - a1                                = [ 1.679887, -0.825775, -1.349677],  |gap| = 2.3077  (the drawn arrow's own length)
d1_hat, d2_hat                                = normalize(M1.dir), normalize(M2.dir)
cross = d1_hat x d2_hat                       = [0.26925, -0.78496, -0.43287],      |cross| = 0.93597
projection of gap onto (cross/|cross|)        = 1.7999995988633581
HUD "shortest distance"                       = 1.800                               <- MATCH to printed precision
```
"the gap between the starting points [=`a2_minus_a1`, 2.308], measured along this [perpendicular]
direction [=`cross_vec`'s own direction]" is exactly `gap · (cross/|cross|)` — the projection — which
computes to 1.7999995988633581, matching the shipped `shortest distance = 1.800` HUD row to every
printed digit. The old sentence's claim (a length divided by a direction's length) has no such
correspondence to any number the resolver ever prints.

### Final narration — `text_en`, ready for `json_author` to paste verbatim (F2)

| id | Final `text_en` | Words | State total |
|---|---|---|---|
| `s8_4` | "The distance: the gap between the starting points, measured along this direction." | 12 | STATE_8: **54** (was 55) |

`s8_1`, `s8_2`, `s8_3`, `s8_5` are unchanged — not reproduced here to avoid `json_author` overwriting a
correct sentence with a byte-identical "fix".

### 2 · F9 — Rule 38d dialect: "dot product" dual-labelled once, then bare

**First use across all `text_en`, in state order:** `s2_2` — "A vector lying in the plane gives zero dot
product with the normal." (STATE_1 never says "dot product"; STATE_2's `s2_2` is the first occurrence
in any `text_en` string in the concept.) Every later bare "dot product"/"n·v" mention (S2's own `s2_3`,
S4's `n·d` narration, the mastery/assessment strings) stays bare, per the existing convention — dual-
label ONCE at first appearance, matching this concept's own established pattern for "normal
(perpendicular direction)" (S2) and "skew (never meeting, not parallel)" (S5).

**STATE_2 was already AT the Rule-31 cap (55/55)** — the dual label ("dot product ... also called the
scalar product") could not simply be inserted; it needed 5 words of room, traded from `s2_1` (−1, "a
whole plane" → "a plane") and `s2_4` (−2, "fully named" → "named"; "how far away" → "how far") to hold
the state at 55/55 with the new clause appended AFTER "dot product with the normal" rather than
interrupting that phrase (interrupting reads as: "...gives zero dot product, also called the scalar
product, with the normal." — grammatically legal but breaks the set phrase "dot product with the
normal" apart; appending after is the cleaner spoken reading and matches this concept's own
name-then-description convention, e.g. `s5_4`'s "called skew lines: not parallel, and never meeting").

### Final narration — `text_en`, ready for `json_author` to paste verbatim (F9)

| id | Final `text_en` | Words | State total |
|---|---|---|---|
| `s2_1` | "Naming a plane needs one more idea: a perpendicular direction, called the normal." | 13 | STATE_2: **55** (unchanged total — word traded out to make room for `s2_2`'s dual label) |
| `s2_2` | "A vector in the plane gives zero dot product with the normal — also called the scalar product." | 18 | — |
| `s2_3` | (unchanged) "Tip it out of the plane, and the reading leaves zero." | 11 | — |
| `s2_4` | "The plane is named. Take a point off it: how far is it?" | 13 | — |

`s2_3` is unchanged — listed here only for the state's word-total arithmetic, not for `json_author` to
rewrite.

### 3 · F7 — glow bindings, 21 new + 4 existing, S9 excluded

**Method.** For every non-explore sentence naming exactly one on-screen object as its subject, the
object's authored `id` — verified against the actual `stamp()` call sites in
`field_3d_renderer.ts` (lines: `vg_lp_line`/`vg_lp_seg`/`vg_lp_vec`/`vg_lp_point` stamp with the
object's OWN authored `id` verbatim, `:14552,14571,14606,14624,14636`; a plane's normal is the ONE
exception, stamped `P.id + ".normal"` at `:14571`, matching `s2_1`'s already-shipped `glow:"P1.normal"`
exactly — confirmed, not assumed). `L1`'s lambda marker is NOT `L1_lambda_marker` (the scene_composition
doc-only label) — the resolver auto-generates it as `res.lines[li].id + "_lambda"` (`:14596`), i.e.
`L1_lambda`; that is the id proposed below, not the doc label. Sentences whose subject is a real-world
anchor (Rule 35 opening analogies, before any literal object is on screen — `s1_1`/`s1_2`/`s5_1`/`s5_2`),
a pure forward-tease to a not-yet-drawn object in the NEXT state (`s4_4`, `s5_6`, `s8_5`), a
definitional two-object sentence with no single subject (`s5_4`), or `s6_3` (concurrent architect
pass, untouched) get NO binding, with the reason given inline.

| Sentence | `text_en` (unchanged unless noted) | Glow target | Status |
|---|---|---|---|
| `s1_1` | "A straight track has a starting post and one heading." | — | no binding — Rule-35 anchor analogy, before any literal object is drawn |
| `s1_2` | "After that, a single number, how far along you are, names every place on it." | — | no binding — same analogy beat as `s1_1` |
| `s1_3` | "A line works like this: one point, one direction d, and lambda slides along it." | `L1` | EXISTING (unchanged) |
| `s1_4` | "One number names this line. A plane needs more than a direction." | `L1_lambda` | NEW — subject is "one number", i.e. the λ marker, not the line itself (already glowed by `s1_3`) |
| `s2_1` | see F9 above | `P1.normal` | EXISTING (unchanged target; text trimmed) |
| `s2_2` | see F9 above | `test_v_inplane` | NEW |
| `s2_3` | "Tip it out of the plane, and the reading leaves zero." | `test_v_offplane` | NEW |
| `s2_4` | see F9 above | `P1` | NEW — "the plane is [fully] named" recaps `P1` before the forward tease |
| `s3_1` | "A point sits off the plane. A segment to it shows length, live." | `q` | NEW — names two objects (point, segment); bound to the point since it is the state's newly-introduced noun |
| `s3_2` | "Slide the landing spot, and the length changes: it falls, then rises." | `cmp` | NEW |
| `s3_3` | "It reaches its smallest value at the perpendicular, and locks." | `perp` | NEW |
| `s3_4` | "That perpendicular is the distance. Replace the point with a line: does it reach the plane, or miss it?" | `perp` | NEW — recap clause; the forward-tease half has no on-screen referent yet |
| `s4_1` | "This line is perpendicular to the normal. Watch it slide sideways above the plane." | `Lpar` | NEW |
| `s4_2` | "Its height never changes, so it never touches." | `Lpar` | NEW |
| `s4_3` | "A second line arrives, heading differently. It crosses, and a marker appears." | `X` | EXISTING (unchanged) |
| `s4_4` | "A line meets a plane two ways. Two lines in space add a third, one only three dimensions allow." | — | no binding — recap + forward tease, no single on-screen subject |
| `s5_1` | "On a flat map, two straight roads cross." | — | no binding — Rule-35 anchor analogy |
| `s5_2` | "On the ground, one runs over the other, and they never touch." | — | no binding — same analogy beat |
| `s5_3` | "These two lines cross on screen, but not in space." | `crossing_mark` | NEW |
| `s5_4` | "These are called skew lines: not parallel, and never meeting." | — | no binding — definitional statement about the class, no single object (also this state's own dual-label sentence, unrelated to F9) |
| `s5_5` | "The true gap lies between their nearest points." | `common_perp` | EXISTING (unchanged) |
| `s5_6` | "The angle must come from directions alone." | — | no binding — forward tease; `arc1` does not exist until STATE_6 |
| `s6_1` | "The two directions return, from one shared point, with the angle between them." | `arc1` | NEW |
| `s6_2` | "Slide one line along itself: the angle does not change." | `M1` | NEW — only `M1`'s anchor slides this state (§4 STATE_6, §2b) |
| `s6_3` | — | — | **untouched this pass** — concurrent `architect` s6_3 directive owns this sentence |
| `s6_4` | "The angle came from the two directions alone: no point on either line mattered." | `arc1` | NEW |
| `s7_1` | "This line splits: one part flat in the plane, one along the normal." | `Lcut` | NEW |
| `s7_2` | "The angle to the normal is fifty-five degrees." | `arc_normal` | NEW |
| `s7_3` | "The angle to the plane is the rest: thirty-five degrees." | `arc_plane` | NEW |
| `s7_4` | "Measure to the normal first, then subtract from ninety: that is the angle to the plane." | `arc_plane` | NEW — closing clause names the plane angle as the answer |
| `s8_1` | "The two lines return, gap already drawn." | `common_perp` | NEW |
| `s8_2` | "A new direction, perpendicular to both lines, is built here." | `cross_vec` | NEW |
| `s8_3` | "It slides onto the gap and lands exactly on top." | `cross_vec` | NEW — "it" = `cross_vec`, sliding onto `common_perp` |
| `s8_4` | see F2 above | `a2_minus_a1` | NEW — the sentence's whole subject, per F2's fix, is the magenta "gap between the starting points" arrow |
| `s8_5` | "Every measurement is now a number you can change. The last state gives the controls." | — | no binding — forward tease to STATE_9, no single object |
| `s9_1`, `s9_2` | — | — | **excluded per instruction** — explore state |

**Count:** 4 existing (unchanged) + 21 new + 9 deliberate no-binding + 1 untouched (`s6_3`) + 2 excluded
(`s9_1`/`s9_2`) = 37.

### Founder-call note

Three judgment calls in this round, none load-bearing, all flagged rather than silently decided:

1. **`P1` (a whole plane, not a point/line/vector) as a glow-focal target (`s2_4`) is untested on this
   concept** — every OTHER glow this desk proposed targets a line/point/segment/vector/arc, all thin
   primitives where `applyGlowEmphasis`'s brighten-toward-white behaviour reads clearly against a dark
   background. A translucent plane quad brightening is a different visual (a broad glow, not a focal
   line lighting up) — mechanically identical code path, but nobody has looked at it on screen. Worth a
   THE-EYE frame check on `s2_4`'s beat before trusting it renders legibly.
2. **Binding a sentence that names two on-screen objects to only ONE of them (Rule 32e) is this desk's
   own judgment every time it came up** (`s3_1`, `s7_1`, `s7_4`, `s8_1`) — the alternative (no binding
   at all, on the grounds that a two-object sentence has no single "correct" focal) would have been
   defensible too. `json_author`/`quality_auditor` should treat every "NEW" row above as a proposal to
   verify against the actual narration cadence (which object is being described at the SECOND the
   sentence plays), not a settled fact — this desk reasoned from grammar and object-reveal timing, not
   from a frame-by-frame audio sync pass.
3. **`s2_2`'s dual-label placement (appended after "with the normal" rather than inserted mid-clause)**
   is a style call favouring spoken clarity over proximity to the term it renames — the alternative
   (`"...zero dot product, also called the scalar product, with the normal."`) is also grammatically
   correct and 1 word cheaper. Flagging in case the founder prefers matching `s2_1`'s/`s5_4`'s exact
   syntactic shape (description-then-name) over this sentence's own (name-then-description, matching
   `s5_4` instead) — both patterns already coexist in this concept, so either choice is precedented.

### Source check

Consulted no textbook for this round — all three findings are narration-accuracy and dialect fixes
against the concept's own already-authored geometry and the shipped renderer's own `stamp()`/normalize
behaviour, verified by direct source read and a `python3` numerical re-derivation (§1 above), not by
citation.

### s6_3 / s6_4 — final (2026-08-21, applied by the dispatching session after json_author's word count)

The architect's s6_3 directive was **34 words**, not the 31 it cited, and it stated the rule that s6_4
already states — STATE_6 landed at **69**. Fixed by letting each sentence do one job:

| id | text_en | words |
|---|---|---|
| `s6_1` | "Both directions return from one shared point, with the angle between them." | 12 |
| `s6_2` | "Slide one line along itself: the angle does not change." | 10 |
| `s6_3` | "Turn one direction past perpendicular: the angle rises to ninety, then falls back to sixty-five." | 15 |
| `s6_4` | "The angle between two lines is the smaller one, never above ninety, and comes from directions alone." | 17 |

**STATE_6 = 54.** s6_3 narrates the beat (the number turns around); s6_4 states the rule and keeps the
"directions alone" close. STATE_4 trimmed to 55 by dropping "that" from s4_4. No glow on s6_3.

### F7 glow bindings — CORRECTED 2026-08-21 (quality_auditor, post-CP-B cycle 0)

Five of the 26 bindings named ANGLE ARCS (`arc1` ×2, `arc_normal`, `arc_plane` ×2). **An arc can never be a
glow focal**, and naming one is not a no-op — it is an inversion:

- `applyGlowEmphasis` matches the target against `userData.vgId` (glow branch in `field_3d_renderer.ts`,
  the `vg_lp_*` case).
- `vgId` is written only by `stamp()`, called for lines, planes (+`.normal`), points, segments and
  vectors — **never in the arc block**.
- An unmatched member is a non-focal PEER, and `vg_lp_arc` is absent from the `brightenOnly` list, so it
  takes `touchOp` → `GLOW_DIM_OPACITY = 0.4`.

Net effect: on the two states whose entire subject IS an angle arc, the arc dimmed to 40 % while its
lines held and nothing brightened — Rules 29/32e running backwards. Invisible to THE EYE by construction
(the capture path never sends `SET_GLOW`), but live in the product: `build_review_site.ts` fires the glow
on the STATE CLOCK, narration on or off.

Corrected: `s6_1`/`s6_4` unbound (each names the pair, not one object — same convention as the other nine
no-binding sentences); `s7_2` → `P1.normal`; `s7_3`/`s7_4` → `shadow` (the drawn carrier of "the angle to
the plane"). **All 24 surviving bindings verified to resolve** against the stampable id set, including the
renderer-injected `L1_lambda` (pushed into `pts` as `id + "_lambda"` before the point loop stamps it —
a first checker wrongly flagged it because it modelled only AUTHORED points).

Proposed row: `vg_angle_arcs_are_never_stamped_so_a_glow_that_names_an_arc_dims_the_very_object_the_sentence_is_about`
— the durable fix is one `stamp(al, A.id)` in the arc block plus `vg_lp_arc` in `brightenOnly`, which
would make arcs glowable fleet-wide. **Platform file, Rule 40, founder call** — not authorable here.
Note the concept's `focal_primitive_id` is `"arc1"`/`"arc_normal"`, i.e. the declared focal is an object
the glow mechanism cannot address; that field is schema-only and consumed by no renderer, so it is inert
rather than a second defect — but it is the same tell.

Also corrected: `s2_2`'s dual label attached to *the normal* ("the normal is also called the scalar
product") instead of to *dot product*. Now `"…gives zero dot product — also called scalar product — with
the normal."` STATE_2 stays at 55.
