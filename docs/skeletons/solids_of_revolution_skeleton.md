# ARCHITECT SKELETON — `solids_of_revolution` — **Phase 0b, round 1 (Checkpoint A cycle 1)**
## "Volume by Integration — a Flat Region Spun Into a Solid"

> Subject: **mathematics** · Class 12 / calculus level · class_level 12
> Pipeline: `architect → mathematics_author → json_author → quality_auditor`
> Renderer: **`field_3d`** — a NEW `scenario_type: "solid_of_revolution"`. JSON lives ONLY in
> `src/data/concepts/mathematics/`; validation = `npm run validate:mathematics`.
> Ranked-list authority: `MATHEMATICS_DISCUSSIONS.md` §6 P3 **#8** (breadth 5.5/7; capabilities 3, 2).
> Archetype: **F — sweep a region into a solid** (`docs/patterns/mathematics.md` §1),
> `[NEEDS-SCENARIO — a SEPARATE purchase from D/E]`. Declaring it discharges
> `archetype_live_tier_unverified_against_renderer`: the discharge is §⓿'s VERIFIED / SPEC split with
> an evidence tier on every row, because the tier is **not** live.
> Chapter position: **ACT III** of the 3D-geometry chapter (`MATHEMATICS_PHASE0_VECTORS_3D.md` §arc).
> Measured base: `master` @ `dfca9cf`, 2026-08-08.

> ## ⚠ WHAT THIS DOCUMENT IS
> **Phase 0b for a concept the 0a survey measured OUT of the `vector_geometry_3d` purchase**
> (`MATHEMATICS_PHASE0_VECTORS_3D.md` §ledger item 1). It therefore carries a double job: design the
> concept AND spec its own engine purchase (§ENGINE PURCHASE SPEC, §WHY SEPARATE).
> **No state below is certified buildable.** §⓿ splits every mechanism into VERIFIED (evidence tier
> per row) and SPEC (does not exist and this document is the request).

---

## Engine bug queue consultation — LIVE SWEEP, 2026-08-08 (`.env.local` present)

- `--owner alex:architect` → run · `--row-type directive` → run · `--field3d --open` → run ·
  `solids_of_revolution` → **0 rows** (new id; and see the 0a finding that `--field3d` derives its
  id set from authored files, so an unauthored concept is invisible to it — the boundary below is
  owner + directive + field3d-open + concept-id, enumerated per
  `scar_audit_claims_a_coverage_boundary_it_did_not_enumerate`).
- Disposition: §14.

**Rule 40a symbol sweep (`git fetch origin && git log --all -S`, all branches):**
`revolve_region` · `discStack` · `srProfile` · `SR_PUBLISH` · `revolution_scenario` · `disc_stack` ·
`profile_enum` → **0 hits each**. `solid_of_revolution` / `solids_of_revolution` → **1 hit each,
both the same commit `6d2342f` ("open mathematics as the third subject — foundation only"),
documentation, no code.** Nothing is being built twice.

---

## ⓿ Mechanism verification — VERIFIED vs SPEC

**Citation convention:** every line number is in `src/lib/renderers/field_3d_renderer.ts`
**at `dfca9cf`** unless stated. Re-resolve BY SYMBOL on any future touch — the sibling skeleton's
round-2 finding F1 was that five of five bare line numbers had gone stale in two commits.

**Evidence tiers:** `measured` = a number this document produced by running something ·
`read` = existence verified by reading the cited body · `clone` = a shipped scenario already
exhibits the behaviour.

**VERIFIED — nothing to build:**

| Mechanism | Verified at | Evidence | Consequence |
|---|---|---|---|
| Per-state `camera_position` with eased transition | `applyState` @67131, the **ungated** block @67195 → `animateCameraTo` | read (0a re-verified; resolved to the ENCLOSING FUNCTION, not the near-identical scenario-local copy @66995) | every state authors its camera free |
| ⚠ that ease is **frame-rate dependent** | `lerpSpherical` @4214 (`var t = 0.05` per **rendered frame**), called @71310 in `animate()`, outside the fixed-step accumulator | read | S2's tilt would arrive in **half** the wall-clock time on a 120 Hz tablet — **which is why no state in this concept uses it: every camera move authors `camera_steps` instead (next row). Round 0's FLAG 1 is withdrawn** |
| **⭐ Mid-state camera schedule `camera_steps`** — `[{at_ms, az, el, dist, ease_ms}]` | declared @60704, implemented @62213–62290, applied @64631 / @64858 | read (AMENDMENT A9; re-verified by symbol at cycle 1) | **The camera can move DURING a state, closed-form on state-local ms — frame-rate independent by construction, `SET_TIME_FREEZE`-reproducible, and it eases from rest to rest (Rule 32d).** S2's tilt and the S2→S3→S4 excursion ride it. **PORT it as `sr.camera_steps`; do not build it** |
| Closed-form clock ramp | `capRamp` @6678 (`capSmooth01` easing, pure function of `t`, no accumulation) | read + clone (`capacitance` ships on it) | the log-n ramp (SR10) is this function re-parameterised |
| Variable-arc reveal by `setDrawRange` | `acgThetaArc.geometry.setDrawRange(0, round(th/2π · 96) + 1)` @26055 (`ac_generator`); 49 `setDrawRange` sites fleet-wide | read + clone | **the θ-sweep mechanism for S2/S7 already exists as a technique** — for a LINE arc. Its extension to a triangle-strip surface is A4 |
| `CylinderGeometry` | 106 uses; `openEnded` used @35683, @36630 | measured (grep) | **a disc stack needs no new geometry class, and `LatheGeometry` (0 uses) is NOT needed** |
| `RingGeometry` | 10 uses (`@36678` a thin bright annulus in a cap plane) | read | the washer's annular cap face |
| Per-frame rebuilt geometry from sampled points | `BufferGeometry.setFromPoints` × 40 | measured | the region mesh and the revolution surface are conventional here, not novel |
| Pooled-mesh reposition-per-frame discipline | `molecular_geometry` header @55123 (`capReposition` / `mflFindById` child traversal) | read | the disc stack pools meshes and repositions; it does not allocate n meshes per frame |
| A closed enum table driving geometry from numeric coefficients | `MG_MOLECULES` @55242 | read + clone | **the exact pattern the profile enum copies** |
| Arrows / labels / glow / sliders / ⚙ widgets | `ArrowHelper` 205 · `createLabelSprite` 340 + `createWideLabelSprite` 60 · `applyGlowEmphasis` 129 · `show_sliders` 100 / `slider_controls` 424 / `visible_controls` 37 · Rule 39f auto-discovery | measured | axes, tick numbers, focal emphasis and the control panel are inherited |
| `SET_TIME_FREEZE` determinism contract | 124 sites | measured | binds every line of new code (D3 / SR-D2) |
| **ZERO expression evaluation** | `safeEval` **0** · `*_expr` **0** · `new Function` **0** · `PM_interpolate` **0** | **measured (grep, this document)** | blocker 1, resolved in §ENGINE PURCHASE SPEC |
| `thetaLength` | **0** | measured | a partial-θ *geometry parameter* has no precedent here; `setDrawRange` is the fleet's way and is what SR5 uses |
| `panel_b` in `build_review_site.ts` | **0 occurrences** | measured | **the panel-split option for blocker 2 is DEAD** — the review builder ships exactly three engine families (`field_3d_config` / `particle_field_config` / `physics_engine_config`, @3573, @3609–3612) and has no panel-B branch at all |

**SPEC — does not exist; this document is the request.** Rows map to §ENGINE PURCHASE SPEC.

| Needed | Row | Clone | States |
|---|---|---|---|
| Scenario shell + `apply…State()` + frame update + glow pass + `deriveStateMeta` registration | SR1 | `molecular_geometry` shell | all |
| Closed profile enum + `srF()` + `srIntegralF2()` closed forms | SR2 | `MG_MOLECULES` @55242 | all |
| Graph frame in the revolution plane: axes, tick marks, **numeric tick labels as DOM nodes positioned from `nlbProjPx`** (§c0) | SR3 | `ArrowHelper` + `setFromPoints` + `nlbProjPx` @41833 | all |
| Region mesh (between a profile and the axis, or between two profiles) | SR4 | `setFromPoints` triangle strip | S1, S2, S6, S7 |
| Revolution surface with a partial-θ reveal | SR5 | `acgThetaArc` @26055 (technique) — **A4** | S2, S5, S7 |
| Disc / washer stack at live n, pooled meshes, capped draw, **published** volume sum | SR6 | `CylinderGeometry` ×106 + `capReposition` pooling | S3–S9 |
| Axis-of-revolution selector (x or y) | SR7 | — | S7, (S9 is core-only, so not exposed) |
| Value-only DOM HUD + ONE Cambria formula surface | SR8 | `capacitance` / `ac_generator` @3002–3035 | all |
| Log-n ramp | SR10 | `capRamp` @6678 | S4, S8 |

---

## 1. Atomic claim

This concept teaches that **a flat region spun about a straight axis sweeps out a solid, and that
solid's volume is the total of thin circular slices — so any volume you can describe with one curve,
you can compute.** It does not cover techniques of integration, arc length, surface area of
revolution, the shell method (dropped on evidence — §ENGINE PURCHASE SPEC §b3), improper volumes,
solids with non-circular cross-sections, or the definition of the definite integral itself (that is
`definite_integral_as_accumulated_area`, which this concept **applies and never re-derives**).

## 2. State count + arc — **9 states** (complex, justified)

**Count justification (Rule 11).** Nine ideas, each of which a student must hold to answer an exam
question: the flat region; the sweep; the circular slice; the sum of slices; the sphere as the
payoff; the hollow solid; the axis dependence; the integral form; the sandbox. The exam test — a
student who watches all nine can answer: what solid does y = √x on [0,4] make about the x-axis and
what is its volume; why is the slice area πf(x)² and not πf(x); where does 4/3πr³ come from; a
region between two curves gives what slice shape and what volume; does spinning the same region
about the other axis give the same answer; what do the two limits on ∫ mean physically.
Every piece traces to a named state (Block 1).

**Deliberate non-duplication of the sibling concept.** `definite_integral_as_accumulated_area`
(P1 #3) owns the *limit* lesson and spends **two** states on it (its S3 refine + S4 the gap has a
formula, with an argued D1 that collapsing them is how "approaching = reaching" survives). This
concept **compresses that beat into ONE state (S4)** and cites the limit rather than re-deriving it.
That is the intended difference: the sibling teaches *why a sum becomes an exact number*; this one
teaches *that the third dimension costs nothing, because every slice is a circle whose area you
already know*.

**Chapter continuity (§arc rules 1–7).**
- **Rule 5 — the opening frame is one the student recognises.** S1 opens on the **plane region of
  Act II** (`lines_and_planes_in_space`): the same origin marker, the same axis style, the same
  region colour role. The first frame of Act III is Act II's last object, lying flat.
- **Rule 3 — the camera tilt means one thing.** Act I spends it on its S4 ("there is a dimension you
  have not seen yet"). **S2 re-uses it deliberately**, for the same meaning: the dimension the region
  is about to sweep into. It is spent exactly twice in the chapter and never decoratively.
- **Rule 4 — the notation ladder is chapter-wide.** `a·b` and `a×b` belong to Act I; this concept
  never draws them and never re-teaches them. **`∫` is this concept's and appears on exactly one
  state, S8, advanced ring** (Rule 38c).
- **Rule 2 — Act I's colour table, inherited VERBATIM (AMENDMENT A12).** Act I declares the chapter
  mapping (`docs/skeletons/vector_products_in_space_skeleton.md` ⓪, rows 1–5) and Act III reads its
  own column off that table. **No sixth role is invented and no role is re-pointed:**

  | Act I role | Colour | Act III uses it for |
  |---|---|---|
  | 1 · first direction | amber `#F5A623` | **the axis-perpendicular radius** — S3's labelled `r`, S4's `rᵢ`, S6's `R` |
  | 2 · second direction | cyan `#3FC8E4` | **the profile curve** f(x) |
  | 3 · third direction | magenta `#E15FA8` | **the second profile** g(x) (S6 only) |
  | 4 · derived object | green `#5BD97A` | **the axis of revolution** |
  | 5 · measured region | violet `#8B6FE8` @ 0.28 α | **the flat region and the disc / ring stack** |

  **Two conformance notes, stated rather than silently resolved.** (i) Act I's Act-III cell for role 2
  reads *"the profile curve's tangent"*; this concept draws no tangent, so cyan carries **the curve the
  tangent would belong to** — the same object family, not a re-point. (ii) Act I's Act-III cell for
  role 3 reads "—"; S6's inner profile is a second *curve*, i.e. the same KIND of object as role 2, so
  it takes the table's next direction role (magenta) rather than a new hue. Rule 29 is untouched:
  emphasis is brightness inside a role's own hue.

**Ring order (Rule 38a): qualitative → quantitative → derivation.** S1–S3 qualitative, S4–S7
quantitative, S8 derivation. **Advanced ring = {S8}, a contiguous block immediately before the
explore state ✓.**

| # | Title (Rule 41d — literal, front-loaded) | Purpose | teaching_method | ring |
|---|---|---|---|---|
| S1 | The Flat Region | The apparatus: Act II's plane seen face-on, the curve y = √x drawn, the region under it filled and its area read | *(straightforward)* | core |
| S2 | Turn It Into a Solid | The sweep: the region turns about the x-axis through a full circle and closes into a solid; the camera tilts as it goes | *(straightforward)* | core |
| S3 | Every Slice Is a Circle | The slice: cut the solid at one x and the face is a circle of radius f(x), so its area is π f(x)² | *(straightforward)* | core |
| S4 | Stack Thin Discs | The sum: n thin discs stack along the axis; as n grows the stack becomes the solid and the total settles on one number | *(straightforward)* | core |
| S5 | A Sphere From a Semicircle | **PRIMARY AHA** — spin a semicircle and the disc total reads the same as 4/3πr³, at every radius the slider can reach | *(straightforward)* | core |
| S6 | A Hole Through the Solid | Two curves bound the region, so each slice is a ring: subtract the inner circle's area, do not subtract the radii | *(straightforward)* | extended |
| S7 | The Axis Changes the Solid | The same region about the y-axis makes a different solid with a different volume | *(straightforward)* | extended |
| S8 | The Integral Form | Notation: the disc total at huge n is written V = π ∫ₐᵇ f(x)² dx, and a and b are the two ends of the solid | derivation_first_principles | advanced |
| S9 | Explore: Change the Curve | Teacher sandbox — the curve's coefficient, the far end, the disc count; core-ring content only | exploration_sliders | core |

The hook MOVES from t = 0 (S1's curve draws, then the region fills). No static state.

## 3. Per-state choreography + control plan (Rule 31 — the control table is the FIRST artifact)

**The functions, fixed once and never re-derived** (`patterns/mathematics.md` hazard 7 — every
authored number in this document comes from these and nowhere else). All arithmetic below is exact.

```
MAIN PROFILE (S1–S4, S7, S8, S9):  f(x) = a·√x   on [0, b],  authored a = 1, b = 4
  region area      A       = ∫₀⁴ √x dx = (2/3)·4^{3/2}          = 16/3      = 5.3333
  exact volume     V       = π ∫₀⁴ x dx = π·8                   = 8π        = 25.1327
  left disc sum    Vₙ      = π·Δx·Σ_{i=0}^{n−1} iΔx = 8π(n−1)/n
                   V₄ = 6π = 18.8496 · V₈ = 7π = 21.9911 · V₂₀ = 7.6π = 23.8761
                   V₁₀₀ = 7.92π = 24.8814 · V₁₀₀₀ = 7.992π = 25.1076
  gap              g(n)    = V − Vₙ = 8π/n   ← EXACT, one term (because f² is linear)
                   g(4) = 6.2832 · g(100) = 0.2513 · g(1000) = 0.0251
  slice at x       r = √x, area = πx;  at x = 1 → r = 1.00, area = 3.1416
                                        at x = 4 → r = 2.00, area = 12.5664
  the WRONG reading (M1): π × A = π·16/3 = 16.7552   (vs the true 25.1327)

SPHERE (S5):  f(x) = √(r² − x²) on [−r, r],  r swept 1.0 → 2.0 in steps of 0.01
  V(r)   = π ∫ (r² − x²) dx = (4/3)πr³
  r = 1.0 → 4.1888 · r = 1.5 → 14.1372 · r = 2.0 → 33.5103  ( = 32π/3 )
  ⚠ THE LEFT DISC SUM IS NOT (4/3)πr³ AT ANY FINITE n. Its closed form, derived and then
  verified against the literal sum to 1e-14 at r ∈ {1.0, 1.5, 2.0} × n ∈ {120, 316, 1000, 2000, 20000}:
      Vₙ(r) = (4/3)πr³ · (1 − 1/n²)          gap = (4/3)πr³/n²
      (the semicircle vanishes at both endpoints, so the LEFT rule here IS the trapezoid rule)
  measured gaps at r = 2:  n = 120 → 33.5080 (gap 2.33e-3) · n = 316 → 33.5100 (3.36e-4)
                           n = 1000 → 33.510288 (3.35e-5) · n = 20000 → 33.5103216 (8.38e-8)

RING (S6):  outer f(x) = √x, inner g(x) = x/2, on [0, 4]  (they MEET at x = 0 and at x = 4)
  V = π ∫₀⁴ (x − x²/4) dx = π(8 − 16/3)      = 8π/3   = 8.3776
  the WRONG reading (M2): π ∫₀⁴ (√x − x/2)² dx = π(8 − 12.8 + 16/3) = 0.5333π = 1.6755
  ⚠ THE LABELLED SLICE IS x = 1, NOT x = 4. At x = 4 the two curves meet: R = r = 2 and the ring
    is EMPTY — the worst possible slice to label. The widest radial gap is at x = 1
    (d/dx(√x − x/2) = 0 ⇒ √x = 1):   R = 1.000 · r = 0.500 · R − r = 0.500
       true ring area  π(R² − r²) = 0.75π = 2.3562
       wrong area (M2) π(R − r)²  = 0.25π = 0.7854      ← 3.0× too small AT THE SLICE
    (the largest ring AREA is a different x — x = 2, R = 1.4142, r = 1.000, area π = 3.1416 —
     and is deliberately NOT the labelled slice: M2 is an error about the two RADII, so the slice
     that shows the two radii furthest apart is the one that carries it)

Y-AXIS (S7):  the SAME region (under √x on [0,4]) revolved about the y-axis
  V = π ∫₀² (4² − (y²)²) dy = π(32 − 32/5)   = 128π/5 = 80.4248   (vs 25.1327 about x)

LIMITS (S8):  V(b) = π ∫₀ᵇ x dx = πb²/2      b = 2 → 2π = 6.2832 · b = 4 → 8π = 25.1327
```

> **Why f(x) = √x is the authored main profile, argued rather than left silent.** Its square is
> **linear**, so (i) the exact volume is 8π, a number a teacher can say; (ii) the left-disc gap is
> **exactly 8π/n**, one term — the sibling concept had to make a whole founder-level ruling out of a
> two-term gap formula, and this concept simply does not have that problem; (iii) the y-axis
> revolution (S7) is a clean 128π/5; (iv) the region is 4 wide × 2 tall, an aspect that frames well.
> **Hazard, declared:** with a linear integrand the *midpoint* rule would be exact. This concept uses
> the **left** rule in every state and never mentions midpoint — a state comparing sampling rules
> would be dishonest on this profile, and there is no such state (that lesson belongs to the sibling).

**The n-law.** `n` is never ramped linearly — the interesting decades flash past
(`MATHEMATICS_PHASE0_CARTESIAN_PLANE.md` 0b: a linear n-sweep is useless). **Every sweeping state
ramps `log₁₀n` and derives `n = round(10^L)`.** *(The mechanism differs from PCPL's: PCPL places
`holds` by **value fraction** (`frac` @1145 in `parametric_renderer.ts`), which is what forced the law
there. `field_3d` has no choreography engine at all, so SR10 authors its own ramp and places holds by
**time**. The log law is kept for the pedagogical reason, not the mechanical one — stated so a future
session does not "fix" a constraint whose cause it cannot find.)*

**Noun discipline (Rule 41).** The reader-facing word is **"disc"** (and **"ring"** for the annulus in
S6). "Washer", "shell", "cylinder", "slab" and "element" never appear in reader-facing text;
`disc_stack` is a contract name only. The board dialect note is in §10(i-5).

| St | Teaches (ONE idea) | Archetype | Distinct motion (rhythm claim) | Delta cue (≤5 words) | **→ hand-off (§arc rule 6)** | Live controls | Words | Ring | Register lead | The real NUMBER |
|---|---|---|---|---|---|---|---|---|---|---|
| S1 | A curve over an interval bounds a flat region with an area | `trace-locus` | The frame draws; the curve draws left→right; then the region fills beneath it. **Two travelling edges, one after the other** — nothing rotates, nothing is 3D | The flat region | *"This flat region is the last thing we built. Now turn it."* | none | **28–32** (anchor inside) | core | graphical | region area `A = 5.333`, live edge `x = 2.60` while it draws |
| S2 | Turning a flat region about a straight line sweeps out a solid | `sweep-revolve` **(new — justified)** | θ sweeps 0 → 2π: the region's copy rotates and its boundary paints a surface behind it, closing at 2π. The **camera tilts** from face-on to three-quarter **while** it sweeps. A single continuous turn, the only state whose picture gains a dimension | Turning makes a solid | *"We can see the solid. Now we need its size — so cut it open."* | none | **42–48** | core | graphical | `θ = 214°` live; no volume yet (`teach_do_not_prespoil_a_later_reveal`) |
| S3 | A cut across the solid is a circle of radius f(x), so its face area is π f(x)² | `decompose` | ONE thin disc separates from the solid and slides along the axis from x = 0 to x = 4; its radius grows as √x and the flat region's height marker travels with it. **One object travelling, everything else holding pose** (Rule 32b). Camera sits **12° off the axis at D = 8** so the face still reads as a circle at the worst position it reaches (§camera, measured) | One slice is a circle | *"One disc is a slice of the answer. Stack enough of them and you have all of it."* | **`x_cut`** (0–4, step 0.05) | **40–45** | core | graphical + numeric | `x = 1.00`, `r = 1.000`, **`face area = 3.1416`**; at x = 4 → `r = 2.000`, `12.5664` |
| S4 | Thin discs stacked along the axis add up to the solid's volume | `refine` | During the n = 4 hold ONE disc is labelled — its radius `rᵢ` (amber) and a thickness bracket `Δx` — **then** `log₁₀n` ramps 0.602 → 3.0 (n: 4 → 1000) with holds at n = 20 and n = 100: the staircase thins and fuses into the smooth solid while the total climbs. **The whole picture converging** — the widest motion in the concept | Many thin discs added | *"That number came from one curve. So try the curve everyone already knows."* | none (watch beat) | 48–55 | core | numeric + graphical | `rᵢ`, `Δx` on the labelled disc; then `n`, `Vₙ = 25.1076` beside **`settles on: 25.1327`**, `still missing: 0.0251`; and `discs drawn: 120 of 1000` once the cap engages |
| S5 | **PRIMARY AHA** — spinning a semicircle gives 4/3πr³ | `parameter-sweep` | The profile swaps to a semicircle and the solid re-forms as a ball; then **`r` sweeps 1.00 → 2.00 in steps of 0.01** and the ball grows while **the two readouts print the same four decimals at every one of the 101 radii the state can reach** (proved exhaustively, not sampled — §gate 13). One slow continuous growth — the only state where the solid itself changes size | A sphere from a semicircle | *"Every solid so far was filled. Real objects are hollow."* | **`r`** (1.00–2.00, step 0.01) | **42–50** | core | numeric + graphical | at **n = 20 000**: disc total `33.5103` beside `4/3πr³ = 33.5103`; at r = 1.50 both read `14.1372`; `discs drawn: 120 of 20000` |
| S6 | When two curves bound the region, each slice is a ring — subtract the inner circle's area | `cycle-compare` | Sequential, never co-resident (`contrast_ghost_coresident_with_the_real_set_fuses_both`): the **wrong** solid builds first from discs of radius (R − r), reads `1.6755`, and dissolves; then the ring stack builds, reads `8.3776`. Two builds, one after the other — the only state that builds the same solid twice | A hole through the solid | *"Same recipe, a ring instead of a disc. Now change the axis instead of the region."* | none | **45–50** | extended | numeric + graphical | wrong `1.6755` then true `8.3776`; **at the labelled slice x = 1.000: `R = 1.000`, `r = 0.500`, ring area `2.3562` against the wrong `0.7854`** |
| S7 | The same region about a different axis makes a different solid | `sweep-revolve` **— declared CONTRAST PAIR with S2; the delta names the flip: the axis** | The S1 region returns; the axis of revolution **swings from the x-axis to the y-axis**, and the region sweeps again about the new line — the solid re-forms as a bowl. **The bowl is built from RINGS, S6's own stack re-used**: at height y the slice runs from the curve out to the far edge, so `R = 4.000` (fixed) and `r = y²` (grows) — which is why S7 must follow S6 and why the two share the extended ring. Same sweep, different pivot: that is the entire delta | Same region, other axis | *"Both answers came from adding slices. There is a shorter way to write that."* | **`axis`** (x ⟷ y toggle) | **40–45** | extended | graphical + numeric | live `R = 4.000`, `r = y²` (0 → 4.000) as the stack builds; `about x: 25.1327` held dim beside `about y: 80.4248` bright |
| S8 | The disc total is written V = π ∫ₐᵇ f(x)² dx, and a and b are the two ends of the solid | `accumulate` | `b` sweeps 0 → 4: the solid grows from nothing along the axis while the upper limit on the integral sign and the value track it. **One end of the solid travelling** — no discs are drawn (n is past the cap, the picture is the smooth solid) | Limits are the two ends | *"That is the whole method. Now change the curve yourself."* | **`b`** (0.5–4.0) | **42–45** | advanced | symbolic + numeric | `b = 2.00 → V = 6.2832`; `b = 4.00 → V = 25.1327` |
| S9 | Teacher sandbox — the curve, its far end and the disc count under the teacher's hand | `drag-sandbox` | The solid **turns slowly and continuously** about its axis from t = 0 (Rule 37: `interaction_complete` skips the freeze, so the turn loops forever); every slider drag reshapes it live | Move the controls | — (last state) | **ALL CORE: `a` (0.8–1.4, step 0.05, **default 1.00**) · `b` (**1.0–4.0**, step 0.05, **default 4.00**) · `n` (4–120, step 4, **default 20**)** | 0 / open | core | graphical + numeric | `a`, `b`, `n`, `Vₙ` live |

**New archetype, justified once (Rule 31b).** **`sweep-revolve`** — a 2D region sweeping a 3D volume,
its boundary painting a surface as it goes. The physics seed vocabulary's `rotate/flip` is an
*orientation change of a rigid body* (the pole face turns, the dipole flips); nothing about that
rhythm is a *growing swept set*. `patterns/mathematics.md` §2's `rotate-to-reveal` is a **camera or
object turn that exposes hidden structure** — also not this. The new name is added to
`patterns/mathematics.md` §2 by the same edit that files this skeleton.

**Rule 32 legibility plan.**
- **32a cause-before-effect.** S3: the disc separates and *starts moving* before its radius readout
  changes. S4: the disc count changes first, the total follows a beat later. S5: `r` grows first,
  both readouts follow. **Satisfied by reveal order and driver order, never by staggering two
  drivers of quantities the state claims are equal** — S5's two readouts share ONE driver (`r`),
  because staggering them would draw the identity false (`patterns/mathematics.md` hazard 10).
- **32b one variable moves.** Guided states hold everything but the taught variable. S9 exempt.
- **32c delta cue** = the table column, ≤5 words, on-canvas top caption ONLY (Rule 34a).
- **32d home pose.** **One apparatus in all nine states**: origin marker, the two graph axes with
  ticks, the profile curve, the region, the readout panel in the same screen corner. It never
  rebuilds; the camera moves only to frame the new thing. The whole apparatus is authored in graph
  coordinates and then **translated by −(a+b)/2 along the graph's own x** so it sits on the world
  origin — which discharges `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable`
  (MAJOR/OPEN: `camera_position` is authorable, the camera *target* is not, so every scene must be
  centred by construction).
- **32e one glow focal at any instant.** S1 the region · S2 the swept surface · S3 the travelling
  disc · S4 the disc stack · S5 the two readouts · S6 the ring stack (and, during the wrong build,
  the wrong solid) · S7 the axis line · S8 the formula surface · S9 none.

**advance_mode (Rule 15 / Gate 12):** S1–S8 `manual_click`, S9 `interaction_complete` → **2 distinct
modes** ✓. No `wait_for_answer`, no `pause_after_ms`, no `narrative_socratic` anywhere (Rule 31).

**Control decision, argued.** Four guided states carry exactly one control each (S3 `x_cut`, S5 `r`,
S7 `axis`, S8 `b`), and each is the variable that state teaches — the visible row silently says
"this is what matters here" (Rule 31c). **S1, S2, S4 and S6 are control-free watch beats,
deliberately**: each is a *timed* build whose meaning lives in the sweep, and a mid-sweep drag would
decouple the readout from the phase being narrated. S9 exposes ALL core controls.

---

## <a id="camera"></a>3b. The camera contract — a NEW screen trap, found by walking these states

The chapter's screen-truth invariant (`MATHEMATICS_PHASE0_VECTORS_3D.md` §camera) states:
**projection preserves neither angle, nor collinearity, nor intersection.** Walking S3 adds a
fourth term to that list, and it is this concept's own trap:

> ### ⚠ **PROJECTION DOES NOT PRESERVE A CIRCLE.**
> A circular disc face viewed off-axis projects to an **ellipse**. So **S3 — whose entire lesson is
> "every slice is a circle" — draws an ellipse** under the three-quarter camera S2 just tilted to.
> This is the same failure class as the `b`/`a×b` collinearity (Act I) and the skew-lines trap
> (Act II), in a third geometry, and it is invisible to any per-object camera metric for the same
> reason: nothing about the disc *alone* is wrong.

> ### ⚠⚠ CYCLE-1 CORRECTION — **the round-0 remedy was solved at ONE pose and gated at that same pose. It failed.**
> This is **instance 5 of AMENDMENT A14's defect class**, and it is mine. Round 0 authored
> `camera_position [11.0, 1.6, 2.9]` and called it "15° off-axis, aspect cos 15° = 0.9659". **Measured
> at Checkpoint A cycle 1** (least-squares conic fit through 720 projected rim points, perspective,
> isotropic tangent-plane screen units): that pose is **16.76° off-axis**, and because the camera
> target is the origin while **the disc travels the full world x ∈ [−2, +2]**, its projected aspect
> runs **0.978 at x = 0 down to 0.9419 at x = 4** — *below the ≥ 0.95 floor the gate was written to
> assert*, at the exact position the DoD quotes (`r = 2.000`, `12.5664`). A metric evaluated at the
> authored pose is a sample that agrees with the design that produced it.

**The remedy, re-solved under THE WORST-CASE LAW (A14) and re-measured (A10):**
1. **S3's camera sits 12° off the axis of revolution at D = 8** — `camera_position [7.83, 0.80, 1.46]`
   — chosen by a scan over α ∈ [6°, 20°] × D ∈ [7, 20] maximising frame fill subject to
   **worst-case** aspect ≥ 0.960 over the disc's ENTIRE travel.

   | Quantity | Value | How |
   |---|---|---|
   | projection | **PerspectiveCamera, vertical FOV 60°** (`field_3d_renderer.ts:3733`), reference aspect **16:9** (the file's own solve aspect, `:57121`, `:57319`) | read |
   | axes swept | `x_cut` ∈ [0, 4] step 0.05 — **the state's only live control, swept end to end** (81 positions × 720 rim points) | measured |
   | **worst** projected circle aspect | **0.9661, at x = 4.000** (the far end of the travel) | measured, conic fit |
   | best / nominal aspect | 0.9963 at x = 0 · 0.9781 at x = 1 | measured |
   | max \|NDC\| over the whole solid | **(0.355, 0.609)** → the solid spans 61 % of frame height, 36 % of width | measured |
   | projected axial length ÷ face diameter at x = 4 | **16.8 %** (floor 8 %, so it never reads as a flat disc) | measured |

   **The shape ratio is projection-parameter-free** — it is measured in the isotropic tangent plane,
   which the renderer maps linearly to pixels (`bscProj` @56534 does exactly this) — so FOV and aspect
   govern the FRAMING row, not the aspect row. Both are stated because A10 requires all four numbers
   beside any camera claim.

   **The trade, stated rather than hidden:** circle fidelity forces a DISTANT camera (the parallax
   over the ±2 travel is what breaks the circle), and distance costs frame fill. D = 8 is the closest
   pose that holds 0.966; at the round-0 distance the picture is bigger and the circle is a lie.
   **A tracking camera was considered and REJECTED**: `camera_steps` could hold a constant 12° to the
   moving disc, but then the disc appears still and the SOLID slides — which destroys the one motion
   S3 exists to show.
2. **The claim is carried by a NUMBER, not by pixels**: S3's HUD reads `r = 1.000` and
   `face area = 3.1416` computed in 3D. If the projection lies, the arithmetic does not.
3. **The camera metric is scored PAIRWISE and in PERSPECTIVE** (0a D7; the OPEN rows
   `camera_metric_scored_foreshortening_not_pairwise_screen_separation` and
   `orthographic_separation_metric_underpredicts_perspective_overlap`) — here, over the pairs
   (disc face normal, view direction) and (axis line, profile curve).

**The explore camera — the CRITICAL scar, solved against the SLIDER RANGE, not the default.**
`field3d_explore_camera_fixed_while_its_own_dials_span_two_orders_of_radius` (CRITICAL/OPEN) is
exactly S9's shape.

> ### ⚠ CYCLE-1 CORRECTION — **round 0's range made the lesson unreachable in its own sandbox.**
> Round 0 bounded S9 at `b ∈ [1.5, 3.0]` to make the camera easy. **But every guided state teaches
> `b = 4`, and the headline answer `8π = 25.1327` needs `a = 1, b = 4` — which that range cannot
> reach.** A sandbox that cannot reproduce the lesson it follows is not a sandbox. Round 0 also
> declared `b ∈ [0.5, 4.0]` in §10c, contradicting itself, and authored **no slider defaults at all**
> (Rule 32d home pose). All three are fixed here; the camera is re-solved for the wider product
> rather than the range being bent to the camera.

Resolution, in this order:
- **The ranges serve the lesson; the camera is solved afterwards.** S9's product is
  **`a ∈ [0.8, 1.4] step 0.05` × `b ∈ [1.0, 4.0] step 0.05`**, profile fixed to `power(p = 0.5)`.
  **Defaults `a = 1.00`, `b = 4.00`, `n = 20`** — the exact configuration S1–S4 taught, so S9 opens on
  the lesson's own solid (Rule 32d) and the teacher's first drag is a departure from something
  recognised. Extent along the axis 1.0 → 4.0 (**4.0×**); maximum radius `a√b` runs
  `0.8·√1.0 = 0.800` → `1.4·√4.0 = 2.800`, diameter 1.60 → 5.60 (**3.5×**).
- **Framed extent includes the body radius at each end** (the directive
  `close_camera_framed_extent_is_authored_as_the_run_length_and_omits_the_body_radius`):
  `b + 2·r_max` = **9.60** at the max corner and **2.60** at the min corner → **3.7 : 1**. Still two
  orders of magnitude away from the CRITICAL scar's shape, so bounded ranges remain a sound
  resolution — but the ratio is now stated as measured, not as designed.
- **The camera is solved at the WORST corner over the FULL live product** (A14; and the OPEN row
  `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed`, which A11
  records recurring in Act I): **13 × 61 = 793 slider corners**, every one projected at FOV 60 /
  16:9. **`camera_position [5.42, 3.43, 6.32]` (D = 9.0):** worst **max \|NDC\| = (0.581, 0.707)** at
  `a = 1.40, b = 4.00`; at the MINIMUM corner (`a = 0.80, b = 1.00`) the solid still spans **17.7 %**
  of frame height — about 190 px on a 1080-line display, legible and **measured** rather than hoped.
  Gate section 12 asserts the worst corner, not the default.
- **A live "fit the camera to the current extent" mechanism is NOT bought here.** It is the durable
  fleet fix and it belongs to `field3d_surgeon` as its own row (alongside the un-authorable camera
  target), not smuggled into a mathematics scenario — the same reasoning the 0a survey applied to
  ledger item 3 (teacher-draggable vectors). Recorded in §ENGINE PURCHASE SPEC §e.

---

## 4. Misconception confrontation plan (Rule 16a — **3 genuine pivots, and only 3**)

No EPIC-C branches (EPIC-L-first directive). `misconception_watch` on **exactly S3, S6, S7**.
**S1, S2, S4, S5, S8 and S9 carry NONE** — they are straightforward teaching states, and adding a
watch to each would be manufacturing misconceptions (founder guardrail 2026-07-04).

| # | Wrong belief (genuine, exam-frequent) | State | Contrast beat — consequence FIRST, then the mathematics (sequential, no question, no pause) |
|---|---|---|---|
| M1 | **"Spinning an area gives π times that area"** — the missing square. The student computes `π ∫ f(x) dx` instead of `π ∫ f(x)² dx` | **S3** | The wrong expectation is shown as its consequence: the flat region's area strip is lifted and read as `π × 5.3333 = 16.7552`, a dim chip. Then the disc separates, its radius is marked `r = f(x)`, and the face area reads `π r² = 3.1416` at x = 1 — a *radius* is what spins, not an *area*. The state ends with the true total nowhere on screen yet (no pre-spoil). `one_line_fix`: "The curve's height is the radius, and a circle's area needs that radius squared." |
| M2 | **"For a region between two curves, subtract the radii and spin the difference"** — `π ∫ (R − r)² dx` instead of `π ∫ (R² − r²) dx`. The single most common washer error on every board that examines it | **S6** | Consequence first: the sim **builds the wrong solid** — discs of radius (R − r) — and reads `1.6755`. It dissolves. Then the ring stack builds, each ring a big circle with a small one removed, and reads `8.3776`. Five times bigger, and the picture shows why: the removed circle is not a *shorter* radius, it is a *missing middle*. **The labelled slice is `x = 1.000`** — `R = 1.000`, `r = 0.500`, true ring area `2.3562` against the wrong `0.7854` — chosen because it is where the two radii stand furthest apart, which is what M2 is an error about. *(Cycle-1 fix: round 0 labelled the slice at `x = 4`, where `R = √4 = 2` and `r = 4/2 = 2` are EQUAL and the ring is empty — the one slice on the interval that cannot show M2 at all.)* `one_line_fix`: "Take away the inner circle's area, not the inner radius." |
| M3 | **"The volume depends only on the region"** — so spinning about the other axis must give the same answer, or "just swap x and y in the same formula" | **S7** | Consequence first: the previous answer `25.1327` is held on screen, dim, labelled `about x`. Then the axis swings to the y-axis and the SAME region sweeps again — visibly a different shape (a bowl, not a horn) — and reads `80.4248`. `one_line_fix`: "The axis is part of the question — the same region gives a different solid about a different line." |
| — | **Cue check.** No delta cue states a wrong belief as fact (`delta_cue_restates_the_declared_misconception_verbatim`). "One slice is a circle", "A hole through the solid" and "Same region, other axis" each state the truth. **S1's region-area readout pre-loads M1**: the state that puts an *area* on screen is the state M1 later interrogates. | | |

---

## 5. `has_prebuilt_deep_dive` states

**S3** (the squaring — where M1 lives and where students historically stall) · **S4** (the sum and its
convergence, the concept's only numerical machinery) · **S6** (the ring; the most common exam error).
These are the same three states that carry Pass-1 cliff sentences (Block 1) — they do not diverge.
V1.0 ships **zero** authored deep-dives; every other state's Explain button routes to the feedback
form (Rule 18).

## 6. Drill-down clusters (3 per deep-dive state)

- **S3:** `why_the_radius_is_squared` · `what_the_slice_actually_is` · `area_versus_volume_confusion`
- **S4:** `why_thinner_discs_are_closer` · `does_the_disc_total_have_a_ceiling` · `discs_versus_the_smooth_solid`
- **S6:** `why_subtract_the_areas_not_the_radii` · `when_does_the_solid_have_a_hole` · `which_curve_is_the_outer_one`

Each cluster ships a migration seeding 5 `trigger_examples` — a **json_author deliverable**
(`confusion_cluster_registry_unseeded_for_concept`), recorded in §10f.

## 7. `entry_state_map` — ring-tagged, with fallbacks

```
entry_state_map:
  foundational: STATE_1 → STATE_5    # core — always available; CONTAINS the PRIMARY aha (S5)
  hollow:       STATE_6              # EXTENDED — drops under core_only  → falls back to foundational
  axis:         STATE_7              # EXTENDED — drops under core_only  → falls back to foundational
  notation:     STATE_8              # ADVANCED — drops under both cuts  → falls back to foundational
  exploration:  STATE_9              # core
```
Default aspect = `foundational`. **The routing map is item 4 on §10(i-1)'s cut checklist** — the
sibling's round-1 defect was routing two aspects at states a reduced preset hides
(`explore_controls_not_ring_gated_survive_the_ring_cut`, one level up).

## 8. Prerequisites (advisory only — Rule 23)

`prerequisites: [definite_integral_as_accumulated_area, lines_and_planes_in_space]`.

**Honest floor (§arc rule 7).** **NEITHER is shipped product.**
`definite_integral_as_accumulated_area` exists as a skeleton only (its own document escalates to the
founder and is not buildable until CP-A…CP-D land); `lines_and_planes_in_space` is Act II and is not
authored. `scalar_vs_vector` is the chapter's only baseline-locked prerequisite and is irrelevant
here. **So Rule 25's no-untaught-term applies with no rescue**: this concept teaches its own
foundation — S3 defines the slice, S4 defines the disc total, and the word "integral" is not used
before S8. The Act-II callback in §arc rule 5 is a *recognition* (the same frame, the same colours),
never a requirement; a teacher opening this concept first still gets a complete lesson.

**Collision check, all three namespaces (2026-08-08):** `solids_of_revolution` appears in no file
under `src/data/concepts/` (physics flat dir), `src/data/concepts/chemistry/` or
`src/data/concepts/mathematics/` — the mathematics dir holds exactly `derivative_as_secant_limit`,
`graph_transformations`, `unit_circle_to_sine_wave`. CLEAR, and independently re-verified against
the 0a survey's own clearance list.

## 9. Real-world anchor (Rules 35 / 38f — universal, culture-neutral)

**Primary and only anchor: a drinking glass.** Its outside surface is one curve turned about the
glass's own axis — which is exactly what this concept does — and it is the same object in every
country, every classroom, every price bracket. It is a *device with the widest possible syllabus
overlap* (Rule 38f) because it is not lab apparatus at all.

**Anchor delivery** (`real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget`
and `skeleton_anchor_specified_in_section_9_reaches_no_narration_line`): the anchor is a **state
assignment with words reserved**, not a paragraph.

- **S1, inside its 40–48 word budget, verbatim:**
  > **"The outside of a drinking glass is one curve turned all the way round."** *(13 words.)*
- **S6, inside its 45–55 word budget, verbatim** *(the hollow half is held back so it does not
  pre-spoil S6's own reveal — `teach_do_not_prespoil_a_later_reveal`)*:
  > **"A drinking glass is hollow, so the solid part is the material between two curves."**
  > *(14 words.)* *(Cycle-1 rewrite: round 0's sentence used the word "glass" in two senses — the
  > object and the material — inside one sentence, which Rule 41c forbids for a student reading in a
  > second language.)*

The sim's curve is `y = √x`, not a glass profile, so **the anchor is spoken and never drawn** —
stated here so no downstream agent labels the axes "height" and "width" or models a tumbler.

**No country-specific culture anywhere** in any caption, label, title, HUD string or narration line
(Rule 35a). No region-dependent constant appears in this concept at all (35b, vacuous).

---

## 10. Definition of Done (Gate 0 — **zero TBDs**)

**(a) Every state by id + one-line content:** S1 the flat region under y = √x on [0,4], area 5.3333 ·
S2 the region turns through 2π into a solid, camera tilts via `camera_steps` · S3 one disc slides
along the axis, `r = √x`, face area `πr²` (M1), ending at `x = 4.000`, `r = 2.000`, `12.5664` ·
S4 one disc labelled `rᵢ` and `Δx`, then n: 4 → 1000, `V₁₀₀₀ = 25.1076` against
`settles on: 25.1327`, `still missing: 0.0251` · S5 semicircle at **n = 20 000**, `r` 1.00 → 2.00 in
steps of 0.01, disc total and `4/3πr³` printing the same four decimals at all 101 reachable radii
(PRIMARY AHA) · S6 the wrong solid 1.6755 then the ring stack 8.3776, labelled slice `x = 1.000`
with `R = 1.000`, `r = 0.500` (M2) · S7 the same region about y, built as RINGS (`R = 4.000`,
`r = y²`) → 80.4248 against 25.1327 (M3) · S8 `V = π ∫₀ᵇ f(x)² dx`, b sweeps 0 → 4, V = πb²/2 ·
S9 explore (`a`, `b`, `n`), opening on `a = 1.00, b = 4.00, n = 20`.

**⭐ Rule 19 — ≥ 3 `scene_composition.primitives` per state, declared here rather than assumed
(cycle-1 addition: round 0 never stated it and the self-review never checked it).** Every state
carries at minimum the persistent apparatus of §32d — **the ticked frame (2 axes + tick set), the
labelled axis of revolution, and the profile curve** — which is three before any state-specific
object is added. Per state, the state-specific primitives on top: S1 the region fill + the area
readout · S2 the swept surface + the θ readout · S3 the travelling disc + its labelled radius
segment + the M1 dim chip · S4 the disc stack + the labelled `rᵢ`/`Δx` disc + the totals panel ·
S5 the ball + the two-value readout · S6 the wrong solid, then the ring stack + the two labelled
radii at `x = 1` · S7 the second axis + the ring-built bowl + the two totals · S8 the smooth solid +
the far-end marker + the formula surface · S9 the turning solid + the slider panel + the live
readout. **Minimum count across all nine states = 5.** ✓

**(b) Symbol-label table + term-introduction ledger** — the DEFINING state precedes every use, HUD
included. Re-run across all four symbol-rendering surfaces: this table, the per-state HUD list, §3's
number column and §10h's formula list.

| Quantity | On-canvas label | Surface | Defined in | Used in |
|---|---|---|---|---|
| the profile curve | `y = √x` (curve end, bare) | sprite label | S1 | S1–S4, S7–S9 |
| the interval ends | `0`, `4` (axis tick numbers) | tick sprites | S1 | all |
| the region's area | `area = 5.333` | HUD | S1 | S1, S3 (as M1's dim chip) |
| the axis of revolution | `axis` on the drawn line | sprite label | S1 | all |
| the turn angle | `θ = 214°` | HUD | S2 | S2, S7 |
| the slice radius | `r` (a drawn, labelled segment on the disc face) | sprite label | **S3** | S3–S9 |
| the slice face area | `face area = 3.1416` | HUD | **S3** | S3 |
| number of discs | `n` | HUD | **S4** | S4, S6–S9 |
| the disc total | `Vₙ` | HUD (over the **published** value) | **S4** | S4–S9 |
| **the value the totals settle on** | **`settles on: 25.1327`** | HUD | **S4 — by the PICTURE, see the note below** | S4, S5, S8 |
| the shortfall | **`still missing: 0.0251`** | HUD | S4 | S4 |
| **the thickness of one disc** | **`Δx`** — a drawn bracket across one disc, labelled | sprite label | **S4** (during the n = 4 hold, before the ramp) | S4, S6 |
| **the radius of the i-th disc** | **`rᵢ`** — S3's amber radius segment, on the labelled disc, with its index | sprite label | **S4** (same beat) | S4, S6 |
| discs actually drawn | `discs drawn: 120 of 1000` | HUD (over the published count) | **S4** | S4, S8 |
| the sphere radius | `r` (re-used deliberately — it is the same quantity, the slice radius at its widest) | slider + HUD | S5 | S5 |
| the outer / inner curves | `R`, `r` on the two curves, and as two distinct labelled segments on the labelled slice `x = 1.000` | sprite labels | **S6** | S6, S7 |
| **the integral sign** | **`V = π ∫₀ᵇ x dx`** | formula surface | **S8 (ADVANCED — the only state)** | S8 |
| the far end | `b` (a tick + a marker on the axis) | sprite label | S8 | S8, S9 |
| the curve's coefficient | `a` | slider caption | S9 | S9 |

> **⭐ `settles on:` — the cycle-1 fix for a core state displaying a quantity whose explanation was
> ringed out.** Round 0 printed `exact = 25.1327` on S4 (core) while its provenance — `V = πb²/2` from
> the integral — is S8, the ADVANCED state that the first preset cut removes. §10(i-1) claimed
> `core_ring_displays_a_quantity_whose_explanation_lives_in_a_cut_ring` was SATISFIED; it was not.
> **The label is changed to `settles on:`, which names exactly what the picture on S4 itself shows** —
> the totals climb and level off on that number — and the shortfall becomes `still missing:`, the
> distance between the two numbers on screen. **No formula is asserted on S4 and none is needed:** the
> quantity's explanation is S4's own converging stack, so it survives every preset cut. S8 later NAMES
> the same number as `πb²/2`; that is provenance arriving later for a number already earned, which is
> legal, whereas a value with no on-screen account is not. *(Rejected alternative: giving S4 a
> provenance line would import `∫` into the core ring and break Rule 38c.)*

Per-state HUD (value-only, Rule 34b): S1 `area`, the live draw edge · S2 `θ` · S3 `x`, `r`,
`face area`, and M1's dim `π × area` chip · S4 `rᵢ` and `Δx` (labels, during the opening hold), then
`n`, `Vₙ`, `settles on`, `still missing`, `discs drawn` · S5 `r`, disc total, `4/3πr³`,
`discs drawn: 120 of 20000` · S6 `R`, `r` at the labelled slice, and the wrong/true totals in
sequence · S7 `R = 4.000`, `r = y²`, `about x` (dim), `about y` (bright) · S8 `b`, `V` · S9 `a`, `b`,
`n`, `Vₙ`.
**All mathematics in real Unicode** (`∫`, `π`, `√`, `θ`, `²`, `₀`, `ᵇ`, `×`, `≈`, `°`) across **all
three** text paths — DOM overlays, any canvas-drawn text, and `createLabelSprite`/`createWideLabelSprite`
(Rule 34c; a sweep of one is a sweep of one third).

**(c) Axis-and-orientation plan** *(the mathematics substitute for the physics right-hand-rule row —
RHR is N/A here; what must be decided instead is every orientation the sim asserts)*: the graph's
+x runs right, +y runs up, and the third world axis is the depth the solid sweeps into. **The
revolution direction is +θ about the axis, counter-clockwise seen from +x looking back toward the
origin**, identical in S2, S5, S7 and S9 — a state that reversed it would assert a difference it does
not teach. The **axis of revolution is always drawn as a labelled line**, never implied by the
absence of geometry (`teach_distinct_reference_lines_for_two_radii`, generalised: S6 has TWO radii
`R` and `r` and draws both as distinct labelled segments on the same slice). Drawn intervals,
declared **per state, because two states expose `b` over different ranges and round 0 contradicted itself about which**: S8's `b` ramps/drags over **[0.5, 4.0]** (it must start near zero — the state's lesson is the solid growing from nothing), S9's `b` slider is **[1.0, 4.0] step 0.05, default 4.00** (a sandbox that opens on a degenerate sliver is not a sandbox, and the lower bound is set by the camera solve, §camera); `a ∈ [0.8, 1.4] step 0.05, default 1.00` (S9 only); `x_cut ∈ [0, 4] step 0.05` (S3); `r ∈ [1.00, 2.00] step 0.01` (S5);
`n ∈ {4 … 10³}` integer. **Interval honesty:** no caption generalises past the drawn interval; S8's
notation statement is about `[0, b]` only.

**(d) Motion plan.** §3's table plus §12's timing table. **Terminations declared:** S1–S8 are
**one-shot-hold** — each claims a change, so none returns toward its start
(`authored_beat_ends_by_undoing_the_state_own_claim`); S9 **free-runs** (Rule 37: the player skips
the freeze on `interaction_complete`, the turn phase wraps `% 1`, the sliders drive live motion).
Entry configuration = each ramp's `from` value, stated per state in §12. **No static state,
including S9** — whose slow continuous turn exists so THE EYE does not read it as
`motionFramesEqual: true`.

**(e) Modes:** conceptual only (Rule 20 [D] — no `mode_overrides`).

**(f) `assessment` + `coverage_map` + registry.** `misconception_watch` on **S3, S6, S7 only**.
**SEVEN items**, against the schema floor `questions: z.array(quizQuestionSchema).min(6)` — verified
in code at **`src/schemas/conceptJson.ts:328`** (`.min(6)`, relaxed from `.length(6)` on 2026-06-24).
*(This is the third occurrence of `concept_schema_assessment_minimum_exceeds_the_skeleton_authored_item_count`
if it recurs; the count is checked against the gate's bound HERE, at design time.)*

| # | Item | State | Answer | Distractor |
|---|---|---|---|---|
| 1 | The flat region under y = √x on [0,4] is turned one full turn about the x-axis. What does it sweep out? | S2 | **a solid that gets wider along the axis** | a flat disc (the region merely rotated inside its own plane) |
| 2 | Cut that solid across the axis at x = 4. The cut face is a circle, and its area is → | S3 | **12.5664** (= 4π) | **6.2832** (= 2π — the radius not squared, **M1**) |
| 3 | Four left discs give 18.85 and the exact volume is 25.13. One hundred discs give → | S4 | **24.88** (closer, still below) | 25.13 exactly |
| 4 | Spin the semicircle y = √(4 − x²) on [−2, 2] about the x-axis. Volume → | S5 | **33.51** (= 32π/3 = 4/3π·2³) | 50.27 (= 4π·2² — the surface area formula) |
| 5 | The region between y = √x and y = x/2 on [0,4], about the x-axis → | S6 | **8.38** (= 8π/3) | **1.68** (the (R − r)² error, **M2**) |
| 6 | The same region under y = √x on [0,4], spun about the **y**-axis instead → | S7 | **80.42** (larger) | **25.13** — the same as before (**M3**) |
| 7 | In V = π ∫₀ᵇ x dx, changing b from 4 to 2 changes the volume from 25.13 to → | S8 | **6.28** (= πb²/2) | 12.57 (half of 25.13 — linear scaling) |

*(Cycle-1 fix: round 0 mapped item 1 — "every cut across the axis is what shape?" — to **S2, the one
state that deliberately shows no slice at all**, pre-spoiling S3 in the assessment while testing S2
on something S2 never renders. Item 1 now asks what S2 actually shows (a region sweeping into a
solid) and the circle question moves onto item 2, which was already S3's.)*

No item re-uses a number as a *worked pair* the way its state rendered it
(`quantitative_check_state_reuses_the_exact_numbers_and_the_delta_cue_of_the_state_it_verifies`):
items 2, 4, 5, 6 all ask a value at a point or under a change the state showed but did not print as
its headline pair. `coverage_map.by_state` maps items 1–7 to S2…S8;
**`non_assessed_states: [STATE_1, STATE_9]`** (S1 is the apparatus, S9 is the sandbox). Items 5, 6 are
ring-tagged `extended` and item 7 `advanced`, and each is hidden by the preset that hides its state.

**json_author deliverables:** the drill-down migration (§6); and the concept registers **ONLY** at
`src/data/concepts/mathematics/solids_of_revolution.json` — mathematics concepts register nowhere
else until a mathematics serving path exists (precedent `bohr_model_energy_levels`; documented
exception to `production_routing_disconnect_pcpl_concepts_set`).

**(g) Register-triangle plan (Rule 33 in its mathematics form — `patterns/mathematics.md` §0).**
Per state, which register **leads** is declared in §3's table. **The symbolic register leads exactly
one state, S8, and S8 is advanced** — satisfying "the symbolic register never leads a core-ring
state". Metrics and precision: volumes and areas are unitless in the plane's own units, **4 dp**;
`still missing` **4 dp** (its smallest displayed value is 0.0251 at n = 1000 — legible at 4 dp, so no
6-dp surface is needed and none is authored); `n` integer; `r`, `R`, `x`, `b` **3 dp**; `θ` integer
degrees; `a` **2 dp** (slider step 0.05).

> **⭐ Precision is a LOAD-BEARING design parameter on S5, not a formatting choice.** S5's PRIMARY AHA
> is that two printed numbers read the same. That claim is about *rendered strings*, so it is decided
> by (display precision) against (the sum's gap), and round 0 decided neither. At 4 dp the disc total
> and `(4/3)πr³` disagree in the last digit whenever the gap straddles a rounding boundary — with
> **n = 1000 that is 13 of the 101 reachable radii** (measured). The parameters are therefore chosen
> together and **verified exhaustively rather than sampled**: `r` is quantised to the slider's own
> step (0.01) in **both** drive paths — the ramp and the drag — so the state has exactly **101
> reachable radii**, a finite set the gate enumerates; and `n = 20 000` puts the gap at
> `(4/3)πr³/n² ≤ 8.38e-8`, four orders below the 1e-4 display quantum. **Measured result: 0 of 101
> radii disagree at 4 dp** (and 0 at 3 dp; n = 5 000 also gives 0, so 20 000 carries a 4× margin
> against a future re-step). This is the A14 worst-case law applied to a NUMERIC claim instead of a
> camera: the claim is checked over everything that moves, exhaustively, because the set is finite by
> construction.
**One quantity, one readout, guaranteed by construction:** the disc-stack primitive computes the
volume total **once**, inside the loop that places the cylinders, and **publishes** it
(`volume_sum`, `discs_drawn` → `SR_PUB`, §ENGINE PURCHASE SPEC §d); it draws no text; exactly one
HUD line prints it; **no second implementation of a drawn quantity exists anywhere in the scenario**,
and gate section 5 asserts that statically. This is `cartesian_plane`'s D11 transplanted, and the
defect it prevents is the sigma/pi topology — a slider reading 1.000 beside a HUD reading 0.000 in
one frame.
**Correlates (33d in mathematics form — every state exposes a real number that changes as the picture
changes):** n → the disc count and their thickness · `Vₙ` → the stacked discs' total · `gap` → the
visible steps at the solid's surface · `r` → the drawn radius segment on the slice face · `θ` → how
far round the sweep has gone · `b` → where the solid's far end sits on the axis.
**Provenance is labelled:** the moment `n` passes `max_discs_drawn` the HUD reads
`discs drawn: 120 of 1000` while the total keeps computing at the true n — a picture drawn at 120
beside a number computed at 1000 is a provenance split unless the canvas says so.

**(h) Canvas budget (Rule 34) — ONE formula surface per state:**
S1 `y = √x` · S2 *(none — the sweep is the whole state; a formula here would pre-spoil S3)* ·
S3 **`face area = π r²`** · S4 **`Vₙ = Σ π rᵢ² Δx`** · S5 **`V = 4/3 π r³`** *(brought in only AFTER
the disc total has been read alone — `teach_concrete_before_abstract_compare`: the simple known case
first, then the derived one beside it, then the match highlighted)* · S6 **`V = Σ π (R² − r²) Δx`** ·
S7 *(none — the state's claim is a comparison of two numbers, not an identity; the ring formula it
uses is S6's, already on screen one state earlier and not re-printed)* ·
**S8 `V = π ∫₀ᵇ x dx`** ← the ONLY `∫` in the concept · **S9 NO formula surface at all.**

> **S9's missing formula surface is deliberate and is the discharge of an OPEN row.**
> `explore_state_formula_surface_asserts_a_relation_no_state_derives` (`alex:architect`, MODERATE,
> OPEN, on `uniform_circular_motion` + `capacitance`) instructs: where no surviving state under
> **every** preset derives the explore formula, **drop the overlay entirely — a value-only sandbox is
> Rule-34-clean.** S9 is core-ring; under `core_only` the surviving states are S1–S5, none of which
> writes `∫`; and `Vₙ = Σ π rᵢ² Δx` is already S4's surface, so re-printing it on S9 would be a
> duplicate rather than a derivation. **S9 shows values only.**

**Σ on a core surface, argued (38c).** `Σ π rᵢ² Δx` on S4 is a compact name for an addition the screen
performs while the surface is read: n discs arrive, n volumes add, and `rᵢ` is the radius each disc
is *drawn* at. The symbol is read OFF the drawing, which is the 38c test for a core surface. `∫` is a
different object — an operator with its own machinery — and is denied on every core surface, which
costs this concept nothing because its core lesson is a *sum*, not an integral.
**⭐ Every symbol on a formula surface has a DEFINING row in (b) — re-run in cycle 1, and it found two
misses.** Round 0's ledger claimed to have been re-run across §10h's formula list; `Δx` and `rᵢ`
appear on **two** core surfaces (S4, S6) and were defined **nowhere** — a Rule-25 no-untaught-term
break on the concept's most-used equation. Both now have a defining state (S4), a drawn referent (a
thickness bracket and the indexed amber radius segment on one labelled disc), and a beat of their own
before the ramp starts. **The full sweep, surface by surface:** S1 `y`, `√`, `x` (S1) · S3 `π`, `r`
(S3) · S4 `Σ` (read off the arriving discs, argued below), `π`, `rᵢ` (S4), `Δx` (S4) · S5 `V`, `π`,
`r` (S5, S3) · S6 `R`, `r` (S6), `π`, `Δx` (S4 — which survives every cut that keeps S6 ✓) ·
S8 `∫`, `b` (S8). **Zero undefined symbols.**

**Formula-vs-HUD diff** (`formula_surface_states_an_identity_in_a_unit_the_hud_never_renders`): every
surface is diffed against the HUD beneath it. S3: `π·2.000² = 12.5664` = the HUD's `face area` at the
pinned frame ✓. S4: `Σ π rᵢ² Δx` at n = 1000 = **25.1076** = the HUD's `Vₙ` ✓ (and `settles on` is a
separate, separately-labelled line, never the same symbol). S5: `4/3π·2.000³ = 33.5103` = both HUD
lines ✓ (and the disc sum at n = 20 000 prints the same four decimals at **all 101** reachable radii,
proved exhaustively — §10g). S6: `Σ π (R² − r²) Δx → 8.3776` = the HUD's true total, and at the
labelled slice `π(1.000² − 0.500²) = 2.3562` = the HUD's ring area ✓.
S8: `π ∫₀⁴ x dx = 8π = 25.1327` = the HUD ✓.
Top caption = the ≤5-word delta cue only; narration prose lives in the strip below the canvas; HUD is
value-only; **the HUD's top edge clears the review chrome's "Full screen" button (`top:52px`+) and
the `#*_sliders` panel does not sit at `top:12`** (`field3d_sliders_panel_top12_vs_fsbtn_top10`).
**No teaching string is ever authored as a `scene_composition` annotation** — `field_3d` never paints
them (`explore_state_discoverables_authored_only_as_unrendered_scene_composition_annotations` MAJOR,
`biot_state6_dotcross_lesson_not_rendered` CRITICAL). Every string above lives on a rendering path:
the state label, the formula overlay, the caption, a HUD line, a sprite label, or a `tts_sentences`
entry.

**(i) Curriculum-flex block (Rule 38) — cuts argued by RING ASSIGNMENT alone.**
*(No `min_ring` field is cited as a mechanism: it exists only in `field_3d_renderer.ts` @55484–55492
and is **inert even there**, deferring to a preset builder that does not exist —
`patterns/mathematics.md` hazard 11.)*

- **(i-1) BOTH cuts, in BOTH directions, over FOUR checklists — narration, formula surfaces, HUD
  quantities, and the routing map:**
  - **Cut 1 — hide advanced (drop S8):** survivors S1–S7, S9. **No survivor writes `∫`** (it is
    introduced on S8 and used nowhere else — the ledger in (b) makes this mechanical). No survivor
    names "integral", "limits of integration" or `b` as an integral bound; `b` survives only as S9's
    slider caption, where it is "the far end", a phrase S1's axis tick already supports. No survivor
    displays a quantity S8 introduced. The `notation` aspect falls back to `foundational`.
    **COHERENT.**
  - **Cut 2 — hide advanced + extended (drop S6, S7, S8):** survivors S1–S5, S9. No survivor names a
    ring, an inner curve, `R`, or a second axis. **S9's three controls (`a`, `b`, `n`) each map to a
    surviving core state** — `a` and `b` to S1's curve and interval, `n` to S4 — and S9 exposes **no**
    axis toggle and **no** inner-radius control, deliberately. Every quantity S9's HUD prints
    (`a`, `b`, `n`, `Vₙ`) is introduced by a surviving core state. `hollow`, `axis` and `notation`
    all fall back to `foundational`. **COHERENT.**
  - **Reverse check** (`declared_payoff_state_ringed_outside_the_core_preset` /
    `core_ring_displays_a_quantity_whose_explanation_lives_in_a_cut_ring`): **⚠ round 0 declared the
    second row SATISFIED and it was NOT** — S4 (core) printed `exact = 25.1327`, whose provenance
    `V = πb²/2` is S8 (advanced, the first thing cut). Fixed at cycle 1 by relabelling it
    **`settles on:`**, which the picture on S4 itself accounts for (§10b). **Re-run, quantity by
    quantity, over the core survivors:** `area` (S1) · `θ` (S2) · `x`, `r`, `face area` (S3) ·
    `rᵢ`, `Δx`, `n`, `Vₙ`, `settles on`, `still missing`, `discs drawn` (S4) · `r`, disc total,
    `4/3πr³` (S5) · `a`, `b`, `n`, `Vₙ` (S9). **Every one is introduced and accounted for by a
    state that survives `core_only`.** The PRIMARY aha is **S5, core** ✓ — it survives both cuts. The whiteboard-test justification (§Whiteboard) names S2, S4,
    S5 as the diamonds; **all three are core** ✓. `misconception_watch` states surviving `core_only`
    = **S3** ✓ (M2 and M3 leave with their states, which is correct — they are the *extended*
    lesson's errors and cannot be taught without it).
- **(i-2) Explore = CORE-ring only (38b):** S9's three controls are core-taught and it carries **no
  formula surface at all** (argued in (h)).
- **(i-3) `curriculum_tags` — CLAIMS, not facts (38g), and this concept's claims need correcting.**
  See §CURRICULUM CORRECTION below. Authored: **CBSE/NCERT — `partial`, and `verified: true` only for
  the negative claim** (volumes of revolution are **not** in the current Class-12 Application of
  Integrals scope, which is area-under-curves only) · ICSE/ISC `partial` · JEE `partial` ·
  IB DP AA HL `full` · AP Calculus AB/BC `full` · Cambridge IGCSE `absent` · A-level Pure `full`.
  **Every non-CBSE cell ships `needs_teacher_verification: true`, and no preset becomes
  teacher-visible until a teacher of that board confirms it.**
- **(i-4) Presets, derived from the rings (hide, never reorder — 38h / Rule 25d):**
  `full` = S1–S9 · `no_advanced` = hide S8 · `core_only` = hide S6, S7, S8.
- **(i-5) Graph-axis convention (38e):** x horizontal, y vertical; **no board conflict, no toggle
  needed.** The genuine cross-board difference here is *vocabulary*, not axes: **"disc method" /
  "washer method" (AP, US texts) vs "volume of revolution about the x-axis" (A-level, IB, ISC)**.
  Dialect ruling (38d): the reader-facing nouns are **"disc"** and **"ring"**, dual-labelled **once**
  on S6 — *"a ring (a washer)"* — then bare. "Shell" appears nowhere, because the shell method is not
  built (§ENGINE PURCHASE SPEC §b3).

---

## <a id="curriculum"></a>10b. ⚠ CURRICULUM CORRECTION — the 0a breadth row for this concept is very likely WRONG, in a way that inverts the wave's framing

`MATHEMATICS_DISCUSSIONS.md` §4 and `MATHEMATICS_PHASE0_VECTORS_3D.md` §0a both carry
**#8: CBSE `F` · JEE `F`**, and the survey concludes the whole 3D wave is *"a deliberate CBSE/JEE/IB-HL
depth play"* with *"the weakest international breadth mathematics has scheduled"*.

**Evidence gathered for this skeleton (2026-08-08, scope-only source consultation):** the **current
CBSE Class-12 Application of Integrals scope is areas under simple curves only** — the rationalised
NCERT chapter carries one exercise plus a miscellaneous exercise, both on area; **volume of a solid
of revolution is not in it.** The JEE Main integral-calculus scope likewise lists *areas of regions
bounded by simple curves*, and volume of revolution is not a named topic (no topics were deleted for
2025 or 2026, so this is not a recent removal — it was never there). Meanwhile the topic **is
required** on **AP Calculus AB/BC** (disc/washer, explicitly examined), **A-level Pure** (volumes of
revolution about the x- and y-axes), **IB DP AA HL**, and **ISC**.

**The consequence, stated plainly:** #8 is not the wave's CBSE/JEE depth play — **it is the wave's
INTERNATIONAL concept, and the only one of the three that AP and A-level examine at all.** #7 and #9
are absent from AP/IGCSE; #8 is absent from *India's* two biggest exams and present on the
English-speaking world's. That is the exact mirror image of the survey's framing, and it changes
three things:
1. **Rule 38f obligation flips.** The instruction *"build it deliberately for that audience, never by
   momentum"* now points at **AP / A-level / IB-HL**, not CBSE/JEE. This design already obeys that:
   the anchor is a drinking glass (not lab apparatus), the dialect ruling dual-labels the AP
   "washer" vocabulary, and the core ring is the disc method that AB examines.
2. **`curriculum_tags` must be authored as §10(i-3) states them**, not as the §4 table asserts.
3. **The scheduling argument improves.** A concept that fills an AP/A-level hole is breadth work, and
   the wave's recorded weakness (three concepts absent from IGCSE) is not a fair description of this
   one.

**Confidence and its limit (`ASSUMPTION` — flagged, not asserted).** The negative claims about CBSE
and JEE are from syllabus documents and secondary syllabus summaries, not from a teacher of those
boards, and **not one international `curriculum_tags` cell in this project has ever been confirmed by
a teacher of that board** (`MATHEMATICS_DISCUSSIONS.md` §7 item 1). Under 38g every cell here ships
`needs_teacher_verification: true` — **including the CBSE cell, whose claim is now a *negative* one
and therefore needs confirming just as much as a positive one.** → **FLAG 2**, for the founder.

---

## <a id="engine"></a>ENGINE PURCHASE SPEC

### (a) The union of features THIS design consumes

`EXISTS` = already in the renderer (§⓿). Walked state-by-state below, not asserted — the recorded
failure is a union table that records each state's **new** capability rather than every capability
**co-present** in it.

| # | Feature | Status |
|---|---|---|
| **SR1** | Scenario shell: new `scenario_type: "solid_of_revolution"` + `applySolidOfRevolutionState()` + per-frame update + glow pass + **`deriveStateMeta.ts` registration in the SAME change** | BUILD |
| **SR2** | **Closed profile enum** + `srF(profile, x)` + `srIntegralF2(profile, x0, x1)` (THREE-free, gate-runnable) | BUILD — **blocker 1, §b** |
| **SR3** | Graph frame in the revolution plane: two axes, tick marks, **numeric tick labels as DOM nodes** positioned per frame from `nlbProjPx` (§c0), declared as one Rule-39 widget `sr_ticks` | BUILD — **blocker 2, §c** |
| **SR4** | Region mesh between a profile and the axis, or between two profiles (triangle strip, rebuilt per frame) | BUILD |
| **SR5** | Revolution surface with a **partial-θ reveal** via `setDrawRange` | BUILD (technique cloned, **A4**) |
| **SR6** | Disc / ring stack: pooled `CylinderGeometry` at radii `f(xᵢ)` (and inner `g(xᵢ)`), live n, `max_discs_drawn` cap, **published** volume total + drawn count | BUILD — **§d** |
| **SR7** | Axis-of-revolution selector (x or y) | BUILD |
| **SR8** | Value-only DOM HUD + ONE Cambria formula surface, clearing `top:52px` | BUILD (panel), Rule 33d / 34b |
| **SR9** | Per-state contextual slider rows over one shared panel | **EXISTS** (`show_sliders` / `visible_controls`) — per-scenario wiring only |
| **SR10** | Log-n ramp, closed-form, clock-driven | BUILD (clone `capRamp` @6678) |
| **SR11** | Per-state `camera_position` with eased transition | **EXISTS** (`applyState` @67195) |
| **SR14** | **Mid-state camera schedule `sr.camera_steps`** — `[{at_ms, az, el, dist, ease_ms}]`, closed-form on state-local ms | **PORT, DO NOT BUILD** — `os.camera_steps` is declared @60704 and implemented @62213–62290 / @64631 / @64858 (AMENDMENT A9). Used by S2's tilt and the S2→S3→S4 excursion; **frame-rate independent by construction**, which is what dissolves round 0's FLAG 1 |
| **SR12** | Focal glow / peer dim | **EXISTS** (`applyGlowEmphasis`, 129 sites) |
| **SR13** | ⚙ teacher widget toggles | **EXISTS** (Rule 39f auto-discovery — follow the conventions and it is free) |

**Consumption walk — every feature each state consumes, co-present and not merely new:**

| State | Consumes |
|---|---|
| S1 | SR1 SR2 SR3 SR4 SR8 SR11 SR12 |
| S2 | SR1 SR2 SR3 SR4 **SR5** SR8 SR11 SR12 **SR14** |
| S3 | SR1 SR2 SR3 SR4 SR5 **SR6** SR8 **SR9** SR11 SR12 **SR14** |
| S4 | SR1 SR2 SR3 SR4 SR5 SR6 SR8 **SR10** SR11 SR12 **SR14** |
| S5 | SR1 SR2 SR3 SR4 SR5 SR6 SR8 SR9 SR11 SR12 |
| S6 | SR1 SR2 SR3 **SR4 (two profiles)** SR5 **SR6 (inner radius)** SR8 SR11 SR12 |
| S7 | SR1 SR2 SR3 SR4 SR5 SR6 **SR7** SR8 SR9 SR11 SR12 |
| S8 | SR1 SR2 SR3 SR5 SR6 SR8 SR9 SR10 SR11 SR12 |
| S9 | SR1 SR2 SR3 SR4 SR5 SR6 SR8 **SR9 (all rows)** SR11 SR13 |

**Both directions close:** no state consumes a feature outside the list, and **every feature is
consumed by at least one state** — SR7 by S7 alone and SR10 by S4/S8 alone, both kept because a
designed state needs them, not because they are nice to have.

### (b) BLOCKER 1 — profile enum vs expression evaluator: **RECOMMEND THE CLOSED ENUM**

**The measurement, re-run for this document:** `safeEval` **0**, `*_expr` **0**, `new Function` **0**,
`PM_interpolate` **0** in `field_3d_renderer.ts` @ `dfca9cf` (75,120 lines, 60 distinct
`scenario_type` names). Confirmed.

**b1 · The profile survey — which curves do the states and the boards actually need?**

| Family | Form | Covers | Needed by | Board evidence |
|---|---|---|---|---|
| `power` | `a·xᵖ + c` | line (p=1) → cone/frustum/cylinder · parabola (p=2) · **square root (p=0.5)** · reciprocal (p=−1) · cubic (p=3) | **S1–S4, S6 (both curves), S7, S8, S9** | the overwhelming majority of every board's exercises: AP AB/BC, A-level Pure, IB AA HL, ISC |
| `circle_arc` | `√(r² − (x−x₀)²) + c` | semicircle → **sphere**, spherical cap, torus profile | **S5 (the PRIMARY AHA)** | the sphere derivation is a named exercise on A-level Pure and IB HL and appears in every AP text |
| `sin` | `A·sin(ωx + φ) + c` | sine/cosine arches | — (none of my states) | AP BC and IB HL volume exercises |
| `exp` | `A·e^{kx} + c` | exponential horns | — (none of my states) | AP BC's most common non-polynomial volume integrand |

**Nine states need exactly TWO families.** `sin` and `exp` are bought anyway, because the marginal
cost is one table row plus one closed form each and because leaving them out is what forces the next
concept to reopen the engine (the alarm rule). **Total: four families, ~20 numeric coefficients, one
table in the `MG_MOLECULES` shape.**

> **⭐ Two enum families ship with ZERO rendering states — why that is safe, stated rather than
> assumed (cycle-1 addition).** `sin` and `exp` are exercised by gate sections 1 and 2 and by their
> negative controls, but **no authored state renders either**, so no human ever looks at them. That is
> normally a defect: an unrendered branch is an unreviewed branch. It is safe **here, and only here,
> because of the specific shape of what is being bought** —
> (i) a family is a **pure numeric function** `srF(profile, x)` plus a **closed-form** `srIntegralF2`,
> both THREE-free and both asserted against independently solved values to 1e-12 at 20 sampled x
> (gate §1–§2). There is no rendering *behaviour* to review: the geometry code is shared and is
> exercised by `power` and `circle_arc` on seven states. A family contributes numbers, not pixels.
> (ii) **`b4`'s own claim is what makes this checkable**: a fifth family is one table row and one
> closed form. If that claim is true, `sin` and `exp` cost almost nothing and their absence costs an
> engine dispatch; if it is false, shipping two unused families is exactly the experiment that proves
> it false **before** a concept depends on the answer.
> (iii) **The failure mode is bounded by SR-D8**: an unknown or malformed family THROWS at apply
> time. An unused family cannot silently degrade a rendered state, because it cannot be reached
> without being named, and naming it wrong stops the sim.
> **The commitment this buys, recorded so it is honoured:** the FIRST concept to author a `sin` or
> `exp` profile treats that family as **unreviewed** — it runs THE EYE on those states with the same
> attention a new mechanism gets, and does not inherit this concept's green gate as visual evidence.

**b2 · Why the enum, and it is not primarily about cost.** Four reasons, in order of weight:

1. **Every enum member has an ANALYTIC ∫f² dx, so the gate can assert the shipped volume against a
   closed form to 1e-12.** With an evaluator the gate would have to integrate numerically, and a
   numeric-quadrature gate **cannot distinguish an engine bug from quadrature error** — it would be
   the weaker check on the one number this concept exists to produce. The closed forms:
   `∫(a xᵖ + c)² dx = a²x^{2p+1}/(2p+1) + 2ac·x^{p+1}/(p+1) + c²x` ·
   `∫(√(r²−(x−x₀)²) + c)² dx` = the circle term + `2c·[the arc's area primitive]` + `c²x` ·
   `∫(A sin(ωx+φ) + c)² dx` = `A²(x/2 − sin(2ωx+2φ)/(4ω)) + (−2Ac/ω)cos(ωx+φ) + c²x` ·
   `∫(Ae^{kx} + c)² dx = A²e^{2kx}/(2k) + 2Ac·e^{kx}/k + c²x`. **This is the decisive argument.**
2. **An evaluator is a fleet-wide Rule-40 platform change across all 60 scenarios** — it adds an
   author-facing expression language, a whitelist/security surface, and a per-frame eval cost, to a
   renderer where **not one of the other 59 scenarios has ever asked for one.** Rule 40 says land such
   a change on master separately and immediately; a mathematics concept desk is the wrong place to
   originate it.
3. **The enum makes the silent-identity-fallback scar impossible to author.** An unknown profile name
   **throws at apply time**; there is no `profile || "line"` default (`patterns/mathematics.md`
   hazard 2 — `os.orbital || "1s"`: *a valid default is more dangerous than one that throws*). An
   evaluator's failure mode is a silently-wrong curve.
4. **Determinism is free.** A pure function of `(profile, x)` with no scope, no live variables and no
   caching satisfies `SET_TIME_FREEZE` byte-identity by construction.

**b3 · What the enum deliberately does NOT cover, declared now so a later build is a decision:**
non-elementary profiles (`ln x`, `tan x`, implicit curves); piecewise profiles; **and the shell
method (SR-F17 in the 0a walk), which this design DROPS on evidence** — AP's CED examines disc and
washer, A-level Pure and IB AA HL examine rotation about the axes, and none of the four named boards
requires shells. Dropping it removes a feature, a state and a vocabulary word. If a later concept
wants shells, that is its own scheduled purchase.

**b4 · The honest cost of being wrong.** If a future concept needs a profile outside the four
families, the enum forces an engine edit — the alarm rule firing. Mitigation: the enum's *shape* is
`{family, coefficients[]}`, so a fifth family is one table row and one closed form, not a redesign.
That is a far smaller blast radius than an evaluator's.

### (c) BLOCKER 2 — the ticked 2D frame: **build it IN `field_3d` as flat 3D geometry. It is not the `cartesian_plane` duplicate.**

**Options, all three evaluated:**

> ### ⚠ CYCLE-1 CORRECTION — **round 0's options table omitted the renderer's own graph mechanism (AMENDMENT A15).**
> `field_3d` already draws ticked axes with numeric scales **today**: `acgDrawGraph`, `capDrawGraph`
> (`:7170`), `accDrawViGraph`, `buildClBzGraph`, `tfrDrawTickBar`, the `rbrClampTickLabels` family and
> **161 `fillText` sites** (measured). So a **hybrid** was never priced. It is priced below, and
> pricing it changed the answer for the LABELS — though not for the frame.

**FOUR options, all priced. The decision splits: the frame is 3D geometry (unchanged); the tick
NUMBERS move off sprites and onto the DOM.**

| Option | Verdict |
|---|---|
| **Split panels** — `field_3d` for the solid, `parametric`/`cartesian_plane` for the region | **DEAD BY MEASUREMENT.** `grep -c panel_b src/scripts/build_review_site.ts` → **0**. The review builder ships exactly three engine families and has no panel-B branch (`@3573`, `@3609–3612`); a second panel does not render, on the teacher surface or the pilot app. This is the same measured fact that killed `graph_interactive_renderer.ts` as a mathematics surface (`patterns/mathematics.md` header) |
| **Rebuild `cartesian_plane` inside `field_3d`** | **REJECTED** — the exact duplicate Rule 40a exists to catch, and the 0a survey is right to name it |
| **A ticked frame as flat 3D geometry in the revolution plane** | **RECOMMENDED for the FRAME** (axes + tick marks), unchanged from round 0 — see c1/c2 |
| **⭐ HYBRID: 3D frame, tick SCALE drawn as screen-space text** (the A15 option) | **ADOPTED for the tick NUMBERS — as DOM, not as canvas.** See c3 |

**c0 · Pricing the hybrid, and why its DOM form beats its canvas form.** The hybrid's premise is
right: the tick *numbers* are the only part of the frame that must be READ, and reading is exactly
what a world-space sprite is bad at. But the two ways to draw screen-space text are not equal.

| | 3D sprites (round 0) | Canvas `fillText` overlay (the A15 form) | **DOM tick labels (adopted)** |
|---|---|---|---|
| Mechanism cost | **0** — `createLabelSprite` ×340 | a **new full-size transparent 2D canvas overlaid on the WebGL canvas**, kept in size-sync on every resize; the 161 existing `fillText` sites are all **inset graph PANES** (`cap_graph_canvas`, `:7171`), not scene overlays — so the aligned overlay is genuinely new | ~30 lines: one `pointer-events:none` container + N absolutely-positioned divs, written per frame from **`nlbProjPx` (`:41833`)**, which already converts world → device px and is used 7× |
| glyph height in device px | **not controllable** — set by world scale and camera distance; the OPEN scar `field3d_arrow_label_sprite_renders_at_under_half_the_body_label_glyph_height` is exactly this | authored directly ✓ | authored directly ✓ (CSS) |
| decollision | projection-blind — the OPEN scar `field3d_world_space_label_decollision_is_projection_blind_and_collides_on_screen` | screen-space ✓ | screen-space ✓ |
| readable by a DOM probe / THE EYE's DOM harvest | **NO** — `field3d_sprite_label_text_and_ink_box_are_invisible_to_every_dom_probe` | **NO** — canvas text is as opaque to a DOM probe as a sprite is | **YES** ✓ |
| `SET_TIME_FREEZE` determinism | ✓ | ✓ | ✓ — position is a pure function of the camera pose |

**The decision, and the reason the canvas form loses to the option A15 did not name.** The canvas
hybrid dissolves **two** of the three sprite scars and pays a new full-size overlay canvas for it.
DOM tick labels dissolve **all three** — including the one round 0 accepted as *"BOUNDED, not
solved"* — for a smaller change, because the projection helper already ships and no second drawing
surface is introduced. **`nlbProjPx` returns device pixels today; nothing in `field_3d` yet positions
a DOM element from it, so that loop is the one new mechanism (~30 lines), and it is named in SR3's
dispatch so it is built once and not re-derived per scenario.** As a free consequence the tick
container is a Rule-39 widget (`{key: 'sr_ticks', label: 'Axis numbers'}`), so a teacher can switch
the scale off. **A2 is thereby retired, not measured**: with the glyph height authored in CSS px there
is nothing left to probe.

**c1 · Why it is NOT the duplicate the survey feared.** What makes `cartesian_plane` a four-dispatch
purchase is (i) the **data↔pixel transform registry** (`PM_planeRegistry`, `PM_planeResolve`, a
Pass-0.25 pass, `plane_id` opt-in on four primitives), (ii) the **primitive family** — the domain
sampler with discontinuity breaking, `region_fill`, `riemann_bars` with published sums, `plot_point`
with drag-seize, `secant_line`/`tangent_line`, and (iii) the **composition rules** between them.
**None of (i) transfers, because in a 3D scene there is no transform to build: the mathematics
coordinates ARE the world coordinates**, one graph unit = one world unit, identity. And **none of
(ii) transfers**, because this concept draws no secant, no tangent, no draggable plotted point and no
2D Riemann rectangles — its "region_fill" is a triangle strip and its "riemann_bars" are cylinders.
**What is actually built is two things the renderer already does 245 times between them** — two
`ArrowHelper` axes and tick marks as `BufferGeometry.setFromPoints` segments — **plus the DOM tick
labels of c0**, whose projection helper (`nlbProjPx`, `:41833`) also already ships. Rule 40a returns
**0 hits** for every symbol proposed.

**c2 · The pedagogical clincher, which decides it independently of cost.** **The region that spins
must BE the region the frame ticks.** If the flat region lived on a 2D panel and the solid on a 3D
panel, the object the student watches sweep would be a *different object* from the one that was
measured — and this concept's entire claim ("this flat thing becomes that solid, and here is its
size") dies at the panel boundary. Rule 33's macro↔micro requirement is that the taught variable's
change be visible **at the level where it happens**; here both levels are one scene, so the honest
form is one scene.

**c3 · The trade-off, RE-STATED after c0 — and it is now much smaller than round 0 declared.**
Round 0 accepted three OPEN sprite scars as *"BOUNDED, not solved"*. With tick numbers on the DOM
(c0), **all three are dissolved for the tick set**, and what remains is a genuinely short list:
- **Dissolved:** `field3d_arrow_label_sprite_renders_at_under_half_the_body_label_glyph_height`
  (glyph height is CSS px, authored) · `field3d_world_space_label_decollision_is_projection_blind_and_collides_on_screen`
  (decollision runs in screen space, where the collision happens) ·
  `field3d_sprite_label_text_and_ink_box_are_invisible_to_every_dom_probe` (a DOM node is readable by
  THE EYE's DOM harvest, by the founder-drive probe, and by THE CALCULATOR).
- **Still authored as belt-and-braces, because they cost nothing:** (1) **S1's camera looks straight
  down the third axis**, so the frame reads as a true flat graph; (2) **ticks are sparse and
  integer-only** (`0 1 2 3 4` on x, `0 1 2` on y) — no decimal labels, no minor ticks; (3) **every
  number a student must READ lives in the DOM HUD** — the ticks give *scale*, the HUD gives *values*
  (Rule 33d/34b).
- **The residual sprite users, named so the boundary is enumerated rather than implied:** the curve
  label `y = √x`, the `axis` label, `r`/`rᵢ`/`Δx`/`R`/`b` on their objects. These ride their own 3D
  objects (they must move with the geometry), so they stay `createLabelSprite` and the three scars
  still apply to them — **bounded by the same division of labour: not one of them carries a number a
  student must read.** Every readable number is DOM (HUD or tick).
- **Residual, accepted:** grid lines are not drawn (a 3D grid reads as clutter under a tilted camera
  and Rule 34 forbids clutter); the frame gives axes, ticks and numbers only.
- **A2/A3 are RETIRED by this change, not deferred** — there is no sprite glyph height left to
  measure on the tick set.

### (d) The proposed `scenario_type` / JSON contract

**Name:** `scenario_type: "solid_of_revolution"`. It is a **scenario** name that happens to match the
concept id here, which is the trap the 0a survey caught on `vector_products_in_space` — so state the
reason it is safe: this scenario serves **one topic family** (volumes of revolution) and any sibling
concept that rides it (`volume_by_shells`, `area_of_a_surface_of_revolution`) is a *narrower* name
under the same generic. If a second concept ever authors this string and reads oddly, the rename
window is the same one the 0a survey names: **before it merges**. Rule 40a: 0 code hits today.

> **⚠ Per `AUTHORING_PIPELINE.md` §0c the DISPATCH REPORT's closed enums supersede this draft.**

```jsonc
// per state
"camera_position": [x, y, z],       // REQUIRED on every state (no fixed pose works — §camera)
"sr": {
  "mode": "region" | "sweep" | "slice" | "stack" | "compare" | "explore",

  // ── the profile(s) — the closed enum (§b) ────────────────────────────────
  "outer": { "family": "power",      "a": 1.0, "p": 0.5, "c": 0.0 },
  "inner": { "family": "power",      "a": 0.5, "p": 1.0, "c": 0.0 },   // omit = solid, no hole
  //          "circle_arc": { r, x0, c } | "sin": { A, omega, phi, c } | "exp": { A, k, c }
  "domain": [0.0, 4.0],              // [a, b] in graph units
  "axis": "x" | "y",                 // SR7 — the axis of revolution

  // ── the frame (SR3) ──────────────────────────────────────────────────────
  "frame": { "x_range": [0, 4], "y_range": [0, 2],
             "x_tick": 1, "y_tick": 1, "tick_decimals": 0, "show_frame": true },

  // ── the sweep (SR5) ──────────────────────────────────────────────────────
  "theta_ramp": { "from_deg": 0, "to_deg": 360, "start_ms": 1500, "duration_ms": 12000 },

  // ── the disc / ring stack (SR6) ──────────────────────────────────────────
  "discs": {
    "n": 4,                                  // static n …
    "n_ramp": { "log10_from": 0.602, "log10_to": 3.0, "start_ms": 2000,
                "duration_ms": 16000, "holds": [ {"at_ms": 7000, "hold_ms": 2000},
                                                 {"at_ms": 13000, "hold_ms": 2000} ] },
    "rule": "left",                          // the ONLY rule this concept uses (§3)
    "ease": "linear",                        // SR10 — DECLARED, not inherited: srRamp is linear
                                             // in its ramped variable; pacing is holds[], NOT
                                             // capSmooth01. (§12)
    "max_discs_drawn": 120,                  // ⚠ A1 — set from the perf probe, not from this draft
    // it PUBLISHES, it does not print (§d, the D11 analogue)
    "volume_var": "V_n",
    "drawn_var": "n_drawn"
  },

  // ── the wrong-solid contrast beat (S6, M2) ───────────────────────────────
  "contrast": { "kind": "radius_difference", "at_ms": 1500, "dissolve_at_ms": 9000 },

  // ── the mid-state camera schedule (SR14 — PORT of os.camera_steps, A9) ───
  "camera_steps": [ {"at_ms": 2000, "az": 0,  "el": 0,  "dist": 5.2, "ease_ms": 0},
                    {"at_ms": 11000,"az": 48, "el": 24, "dist": 7.6, "ease_ms": 9000} ],
  //   closed-form on state-local ms -> frame-rate independent, SET_TIME_FREEZE-safe.
  //   A state that authors camera_steps OWNS its camera for the whole state and
  //   does NOT also author camera_position (the renderer's own contract, :62241).

  // ── shared ───────────────────────────────────────────────────────────────
  "reveal_ms": 900,
  "controls": ["x_cut"],                     // Rule 31 per-state rows
  "readouts": ["r", "face_area"]             // SR8, value-only, Rule 33d
},

// concept-level
// concept-level sliders — RANGES, STEPS AND DEFAULTS ARE ALL AUTHORED (round 0 authored no defaults)
"config.slider_controls": {
  "a":     { "min": 0.8, "max": 1.4, "step": 0.05, "default": 1.00 },   // S9
  "b":     { "min": 1.0, "max": 4.0, "step": 0.05, "default": 4.00 },   // S9  (S8 uses [0.5,4.0])
  "n":     { "min": 4,   "max": 120, "step": 4,    "default": 20   },   // S9
  "r":     { "min": 1.00,"max": 2.00,"step": 0.01, "default": 1.00 },   // S5 — the step is
  //          LOAD-BEARING: it makes the reachable set finite so gate §13 can be exhaustive (§10g)
  "x_cut": { "min": 0.0, "max": 4.0, "step": 0.05, "default": 0.00 },   // S3
  "axis":  { "values": ["x", "y"], "default": "x" }                      // S7
},
"config.sr": { "color_outer":…, "color_inner":…, "color_axis":…, "color_region":…, "color_solid":… }
```

**Engine decisions — made now, not discovered later** *(numbered SR-D to avoid collision with the 0a
`vector_geometry_3d` D-list)*:

- **SR-D1 · Pure, THREE-free helpers.** `srF`, `srIntegralF2`, `srDiscSum`, `srWasherSum`,
  `srRamp`, `srProjectPoint`, `srPairwiseScreenSeparationDeg` take and return plain numbers/arrays
  and touch no THREE symbol — which is what lets the gate pull the shipped bodies out of the template
  literal by brace matching and run them **in node with no browser**, exactly as `check:sigma-pi` and
  `check:cartesian-plane` do.
- **SR-D2 · Recompute from scratch every frame, from the clock — never accumulate.** Every mesh is
  rebuilt (or a pooled mesh repositioned) per frame from `(profile, domain, θ, n)`; nothing caches
  between frames; **n is derived from the ramp's clock value, never from a frame counter.** A
  `SET_TIME_FREEZE` re-pin to the same `at_ms` must redraw byte-identical pixels.
- **SR-D3 · The stack PUBLISHES its total; it never prints it, and nothing else recomputes it.**
  The volume total is computed **once**, inside the loop that places the cylinders, and written into
  **`SR_PUB`** — a dedicated frame-scoped object declared **outside** any object another concern
  owns and replaces, cleared unconditionally at the top of the stack build every frame, and read by
  the HUD writer afterwards. This is `cartesian_plane`'s **D11 + its Amendment-3 scope map**
  transplanted, and the reason is that amendment's own: a render-pass output that lives inside an
  object a different concern reassigns mid-frame is silently erased. **`computePhysics`-style twins
  are forbidden**: nothing outside the placement loop may compute a disc total. Gate section 5
  asserts it statically.
- **SR-D4 · Every geometric claim carries a NUMERIC readout computed in 3D.** Circle, equal, larger,
  hollow — none may rest on pixels, because projection preserves none of them (§camera). S3's
  `face area`, S5's two equal readouts and S7's two totals are what make those states true under an
  adversarial camera.
- **SR-D5 · A cap that engages must say so.** Above `max_discs_drawn` the picture renders as the
  smooth revolution surface **while the total keeps computing at the true n**, and the HUD reads
  `discs drawn: 120 of 1000`. A picture drawn at 120 beside a number computed at 1000 is a provenance
  split unless the canvas declares it (`cartesian_plane` D7/D11).
- **SR-D6 · Register the new scenario in `deriveStateMeta.ts` in the SAME change.** Add `'sr'` to
  `F3D_REVEAL_KEYS`, a `maxRevealForField3dState` block returning `reveal_ms + cushion`, and an
  explicit guided→`reveal_hold` / explore→`interactive` split. Skipping it means THE EYE
  mis-classifies **every** state at the 1500 ms default — the first line of the field_3d scar
  checklist.
- **SR-D7 · Everything lives inside the state's `sr` block and `scene_composition`. No new top-level
  per-state field.** `build_review_site.ts` keeps a **private duplicate** of the config assembler that
  hand-picks per-state fields and silently dropped `variable_choreography` on every PCPL concept until
  `f98e9f7`; until that duplicate is deleted, any new per-state field is a defect waiting to be
  authored.
- **SR-D8 · An unknown profile family THROWS.** No `family || "power"` default anywhere (hazard 2).
- **SR-D9 · Plain English on every rendered string (Rule 41), and mathematics vocabulary is not
  jargon.** "disc", "ring", "axis", "radius", "volume" are the plain words. Banned here specifically:
  "the solid **grows** a hole", "the region **becomes** alive", "**All yours**" on the explore state,
  and any sentence in which a curve, a disc or an axis wants, knows, or refuses.
- **SR-D10 · The whole apparatus is authored in graph coordinates and translated onto the world
  origin** (§32d) — the standing workaround for the un-authorable camera target.

### (e) Deliberately NOT bought (the alarm-rule ledger for THIS purchase)

1. **A general expression evaluator in `field_3d`** — §b2. If a later concept chooses evaluator over
   enum, that is its own Phase 0.
2. **The shell method** — §b3, dropped on board evidence, not on cost.
3. **A live "fit the camera to the current extent" mechanism.** It is the durable fix for
   `field3d_explore_camera_fixed_while_its_own_dials_span_two_orders_of_radius` (CRITICAL/OPEN) and
   for `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` (MAJOR/OPEN), and
   it is **fleet-wide** — it belongs to `field3d_surgeon` as its own row, not smuggled into a
   mathematics scenario (the same reasoning the 0a survey applied to teacher-draggable vectors).
   Bounded slider ranges serve S9 today (§camera).
4. **A FIX for the frame-rate-dependent camera ease** (`lerpSpherical` @4214, `t = 0.05` per rendered
   frame). Still a Rule-40 platform defect shared by all 60 scenarios and still an open founder
   decision in the 0a ledger — **but this concept no longer needs it fixed.** Every camera move here
   authors `sr.camera_steps` (SR14, a PORT of the existing `os.camera_steps` per A9), which is
   closed-form on state-local ms and bypasses `lerpSpherical` entirely. Round 0's FLAG 1 is withdrawn.
5. **Grid lines in the 3D frame** — §c3, a deliberate Rule-34 clutter decision, not an oversight.
6. **A second `sr` mode for non-circular cross-sections** (square/triangle cross-sections, an AP BC
   sub-topic). Out of the atomic claim; recorded so a later build is scheduled, not alarming.

### (f) Dispatch plan — TWO dispatches to `field3d-surgeon`, one `bug_class` each, each landing on master separately (Rule 40)

| Dispatch | `bug_class` | Builds | Gate sections |
|---|---|---|---|
| **SR-A** | `field3d_cannot_draw_an_authored_curve_or_a_ticked_coordinate_frame_so_every_graph_claim_is_hardcoded_per_scenario` | SR1, SR2, SR3, SR4, SR8, SR10, SR-D6 registration | 1–2, 8–10 |
| **SR-B** | `field3d_cannot_sweep_a_region_into_a_solid_or_publish_the_volume_of_a_disc_stack` | SR5, SR6, SR7, SR-D3 publication, SR-D5 cap | 3–7, 11–12 |

**Mandatory in both dispatch prompts** (pre-paid scars, stated so the agent executes rather than
re-derives): SR-D2 no accumulation · SR-D7 no new per-state field · `deriveStateMeta` in the SAME
change · `npm run check:renderer-syntax` **and** `check:renderer-backticks` after every edit (the
renderer body is one template literal — a backtick in a comment terminates it) · sprite labels are
Rule 34c's third text path · `#*_sliders` panels clear `top:52px` · **no teaching string in a
`scene_composition` annotation** · Rule 41 plain language on every rendered string · Rule 39f widget
discovery conventions · **and the diagnosed root cause named up front with an explicit invitation to
refute it** (the standing Ch.6 lesson: the failure mode to design against is an agent that is wrong
*and* deferential).

### (g) The gate — `npm run check:solid-of-revolution` ($0, headless, no browser)

Modelled on `check:sigma-pi` / `check:cartesian-plane`: pull the shipped function bodies out of
`FIELD3D_RENDERER_CODE` by brace matching, run them in node, assert against values solved
**independently of the renderer**. **Every section carries a negative control — the deliberately
broken behaviour, asserted to FAIL — because a gate that has never failed is not known to work.**

| § | Asserts | Negative control |
|---|---|---|
| 1 | `srF` for all four families at 20 sampled x against closed forms, 1e-12; and that an out-of-domain `circle_arc` argument returns **non-finite**, never 0 | A `circle_arc` clamped to 0 outside its domain must fail (hazard 2) |
| 2 | `srIntegralF2` against independently solved closed forms for each family **including the constant offset c** (the cross-term), 1e-12 | Dropping the `2ac` cross-term must fail |
| 3 | The placement loop's disc total equals the independent series at n ∈ {4, 8, 20, 100, 1000, 5000}: `8π(n−1)/n` for the authored profile, to 1e-12; and `V − Vₙ = 8π/n` exactly | An off-by-one partition (n discs where n−1 are placed) must fail |
| 4 | The ring stack equals `π ∫(R² − r²)` = **8π/3 = 8.3776** to 1e-12 | **A `(R − r)²` implementation must fail — M2 mechanised** |
| 5 | **SR-D3 publication.** `SR_PUB.volume_var` equals the gate's independent series at every n × every family; `drawn_var = min(n, max_discs_drawn)`. **Plus a static assertion that no function outside the placement loop computes a disc total** | A build where the HUD recomputes the total must fail |
| 6 | **Axis swap.** The y-axis revolution of the authored region equals `π ∫₀²(16 − y⁴) dy` = **128π/5 = 80.4248** | A y-revolve that merely swaps symbols in the x-formula (returning 25.1327) must fail |
| 7 | **Determinism (SR-D2).** Two evaluations at the same `at_ms` produce identical vertex buffers and identical `SR_PUB`; no state carries across frames | An n derived from a frame counter must fail |
| 8 | **SR10 ramp, with its measurement SPACE named** (cycle-1 fix — round 0 asserted a threshold of 15 % and its negative control measured a different quantity, so one number was compared against two spaces). All fractions below are of the ramp's **ADVANCING PROGRESS TIME, holds excluded** (§12's hold semantics). (a) `srRamp` is LINEAR — `srRamp(f) == f` to 1e-15, i.e. it is NOT `capSmooth01`; (b) at 50 % progress the log ramp gives **n = 63** (the geometric mid of 4 and 1000), tolerance ±3; (c) **n = 8 is reached at 12.554 % of progress** (measured), asserted **≥ 10 %**; (d) `srRamp` at every authored ms boundary in §12 reproduces that row's stated value exactly | Three. A `capSmooth01`-eased ramp must fail (a). **A linear-n ramp must fail (b) — it gives n = 502 at 50 % progress — and must fail (c), reaching n = 8 at 0.402 % of the same progress clock.** A ramp whose holds are subtracted twice must fail (d) |
| 9 | `deriveStateMeta` returns `reveal_ms + cushion` for every guided state and `interactive` for S9 | A state with no `sr` block defaulting to 1500 ms must fail |
| 10 | **Fleet safety.** Every scenario other than `solid_of_revolution` emits byte-identical template output vs `HEAD~` | Touching a shared line must change it |
| 11 | **Screen truth — the concept's own trap (§camera), in PERSPECTIVE, at FOV 60 / aspect 16:9, and scored at the WORST CASE OVER EVERYTHING THAT MOVES (A14).** (a) **S3's slice face: the aspect is measured at all 81 positions of the full `x_cut` sweep, not at the authored pose**, by conic fit through 720 projected rim points; the assertion is on the **minimum**, ≥ 0.95 (design value **0.9661, at x = 4.000**). (b) S3's projected axial length ÷ face diameter ≥ 8 % at the same worst position (design 16.8 %). (c) At S2's post-tilt camera the solid's projected depth is ≥ 8 % of its projected length. (d) The pairwise screen separation of (axis line, profile curve) is ≥ 15° in every state, and (e) every state's max \|NDC\| ≤ 0.80 over its own swept range | **Four.** (i) **Round 0's own pose `[11.0, 1.6, 2.9]` must FAIL (a)** — it measures 0.9419 at x = 4 — so the gate carries the history of the defect it was written for and the fix cannot be silently reverted. (ii) An aspect scored **only at x = 0** must PASS where the swept metric fails — the vacuous pass *proved*, not assumed. (iii) An on-axis-only camera, whose projected depth is < 2 %, must fail (b)/(c). (iv) A per-object foreshortening metric scored alone must PASS where the pairwise one fails |
| 12 | **Explore camera containment across the FULL slider product, enumerated — not sampled, and not one axis at a time** (A11's `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed`). All **793** corners of `a ∈ [0.8,1.4] step 0.05 × b ∈ [1.0,4.0] step 0.05` are projected at FOV 60 / 16:9 with a one-body-radius axial margin; the assertion reports BOTH the max \|NDC\| (≤ 0.80; design **0.707** at `a = 1.40, b = 4.00`) AND the min-corner screen span (≥ 12 %; design **17.7 %**) — an angle-only or a fill-only report is not a solve | **Two.** Framing computed from the default slider values alone must fail at the `a = 1.40, b = 4.00` corner; **and a sweep of `b` with `a` held at its default must PASS where the full product fails** |
| 13 | **⭐ S5's PRIMARY AHA, asserted on the RENDERED STRINGS over the exhaustive reachable set.** For all **101** reachable radii (`r` = 1.00 … 2.00 step 0.01 — the quantisation is what makes the set finite, §10g), the disc total at n = 20 000 and `(4/3)πr³` **format to the identical 4-dp string**; and the analytic gap `(4/3)πr³/n²` ≤ 8.38e-8 at every one. **Plus: the disc sum equals `(4/3)πr³(1 − 1/n²)` to 1e-12** at r ∈ {1.0, 1.5, 2.0} × n ∈ {120, 316, 1000, 20000} — the closed form the state's claim rests on | **Two.** **n = 1000 must FAIL the string assertion** (it disagrees at 13 of the 101 radii — the measured number that killed round 0's `n` choice), and an unquantised `r` must fail because the reachable set is then not enumerable |

**Exit criteria for the engine phase:** gate green with **all negative controls firing** ·
`check:renderer-syntax` + `check:renderer-backticks` clean · `tsc` 0 ·
`validate:concepts` **151 PASS / 0 FAIL** (re-measure, never quote a commit message) ·
`validate:chemistry` 10/10 · `validate:mathematics` PASS · `npm test` green · **and THE EYE returns
every baseline-locked `field_3d` concept unchanged relative to a same-day pre-change run** — note
**relative**, not against the approved baselines, until the 2026-07-05 vintage condition
(`MATHEMATICS_PHASE0_VECTORS_3D.md` §eye) is resolved.

---

## <a id="separate"></a>WHY THIS IS A SEPARATE PURCHASE FROM #7 / #9 — the exclusion CONFIRMED, its stated grounds CORRECTED

**Verdict: the 0a survey's decision is RIGHT and I do not refute it. Its stated *reasons* are
overstated, and correcting them changes this concept's status from "blocked pending a founder ruling
and possibly an evaluator" to "schedulable now, two dispatches."**

**What the survey said the blockers were, and what they actually are:**

| 0a's stated blocker | Measured verdict here |
|---|---|
| "needs an authored `y = f(x)` and `field_3d` cannot evaluate expressions" | **Not a blocker — a design choice with a clear winner.** §b: four enum families cover every named board's exercises, and the enum is *better than* an evaluator because it makes the gate analytic. The survey itself offered the enum; what was missing was the evidence that it suffices, which §b1 supplies |
| "needs a ticked 2D frame, which is `cartesian_plane` on a different renderer — rebuilding it is the Rule-40a duplicate" | **Not a blocker, and not the duplicate.** §c: `cartesian_plane`'s cost is its pixel transform registry and its 2D primitive family, **neither of which exists in a 3D scene** where math units are world units. What is built is two arrows, some tick segments and numeric sprites — 545 fleet precedents between them, 0 Rule-40a hits. And the panel-split alternative the survey left open is **dead by measurement** (`panel_b` = 0 in `build_review_site.ts`) |

**The real reason the exclusion is right — geometry, not evaluation:**

- **Feature overlap is the shell and nothing else.** Of my thirteen SR rows, the ones #7/#9 also
  consume are SR1 (a scenario shell — but *a different scenario's* shell), SR8 (a readout panel,
  which is per-scenario DOM wiring, not shared code), SR9 and SR11–SR13 (**all already EXIST** and
  are inherited by any scenario). **The genuinely shared BUILD is one shell.** Every one of SR2–SR7 —
  the profile enum, the frame, the region mesh, the revolution surface, the disc stack, the axis
  selector — touches nothing #7 or #9 draws, and none of F3–F8, F11–F14 (their entire distinctive
  set) appears in my consumption walk.
- **The amortisation argument that merges #7 and #9 has no analogue here.** #9 rides #7 because
  **F12 IS F7** — a plane patch is literally the parallelogram quad translated, and the skew common
  perpendicular is literally `vgCross`. There is no such identity between a parallelepiped and a disc
  stack. Bundling would produce a `mode` enum whose branches share zero geometry, which is two
  scenarios in one switch statement — and it would double the blast radius of every future edit to
  either half, forever.
- **The gates are incompatible.** `check:vector-geometry-3d` asserts vector arithmetic and pairwise
  screen separation; `check:solid-of-revolution` asserts closed-form volume integrals and a
  projected-circle aspect ratio. One gate covering both would share only its harness.
- **And bundling would delay #7's ship** for a concept that is not next in the queue.

**What I DO dispute, and it is not the exclusion (§10b).** The 0a survey and
`MATHEMATICS_DISCUSSIONS.md` §4 both record this concept as **CBSE `F` / JEE `F`**, and conclude the
wave is a CBSE/JEE depth play with the weakest international breadth mathematics has scheduled.
**The evidence says the opposite for #8**: volumes of revolution are **not** in the current CBSE
Class-12 Application of Integrals scope (area under curves only) and are not a named JEE Main topic,
while they **are** examined on AP Calculus AB/BC, A-level Pure, IB AA HL and ISC. **#8 is the wave's
international concept, and the only one of the three that AP and A-level touch at all.** That does
not change the engine decision by one line — it changes the `curriculum_tags`, the Rule-38f audience
argument, and the sentence a later coverage review will read. → **FLAG 2.**

**The continuity that IS shared, and it costs nothing:** the chapter's apparatus family, colour
language, camera language and notation ladder (§arc rules 1–4) are **authored data and design
convention, not code.** A separate `scenario_type` does not break chapter continuity; it is how
continuity is kept cheap.

---

## <a id="whiteboard"></a>The whiteboard test, applied honestly to my own states

> *"If a good teacher with a whiteboard and 60 seconds produces the same understanding, it is not a
> diamond."* Mathematics' demo tier is most of the syllabus, so this bites hard here.

| State | Verdict | Reasoning |
|---|---|---|
| S1 | **SUPPORT — kept on INFORMATION GAIN, re-argued at cycle 1** | Round 0 justified S1 by **§arc rule 5** (chapter continuity), which is a storytelling contract manufacturing a state — the exact defect the whiteboard test exists to catch. **The honest justification was already inside this document and round 0 failed to use it.** (i) **S1 prints `area = 5.333`, and S3 re-uses that exact number as M1's dim chip** (Block 1 item 3): the concept's most common misconception is confronted *with the number that created it*, and that number has to be produced on screen, by the region itself, before it can be interrogated. Delete S1 and M1's contrast beat loses its referent. (ii) **S1's face-on camera `[0,0,5.2]` is what makes the whole 3D-frame decision honest** (§c3, §11): the case for a ticked frame inside `field_3d` rests on the concept having at least one state where the frame reads as a true flat graph. Delete S1 and blocker 2's answer weakens. **§arc rule 5 is a bonus, not the reason.** Also trimmed: round 0 spent 7.8 s drawing the curve; now 4.8 s (§12) |
| S2 | **DIAMOND (capability 3)** | A board gives one static three-quarter sketch and the phrase "imagine it spinning". *Imagining it* is precisely what the weaker half of a class cannot do, and it is the entire concept. Continuous, correct, from any angle |
| S3 | **SUPPORT-PLUS (capability 2, weakly)** | A static disc sketch does most of this. What a board cannot do is slide one disc along the axis with its radius **tracking the curve's height live**, which is the causal link M1 breaks. Kept, and honestly labelled: its lesson is 70 % board-reachable |
| S4 | **DIAMOND (capabilities 1 + 4)** | n = 4 → 1000, the staircase visibly fusing into the solid while the total climbs. A board draws four discs and asserts the trend |
| S5 | **DIAMOND (capabilities 3 + 4)** | Not because the sphere is hard, but because the two readouts **stay equal at every r as r sweeps** — an identity demonstrated over a continuum, which a board demonstrates at exactly one value |
| S6 | **DIAMOND (capability 4)** | The wrong solid is *built and shown to be five times too small*, then dissolved. A board can only say "don't do that" |
| S7 | **DIAMOND (capability 3)** | A board must draw two separate figures and assert they came from one region. The sim re-forms the **same** region about a new axis — the identity of the region is the lesson, and only continuity of the object carries it |
| S8 | **SUPPORT** | Notation. A board does notation at least as well. Kept because AP / A-level / IB examine the notation, and it is **advanced ring** — it is the first thing a reduced preset drops, which is exactly right for a support state |
| S9 | **INSTRUMENT, not a lesson** | The teacher's sandbox (Rule 31 explore-last). Judged by whether a teacher reaches for it, not by the whiteboard test |

**Score: five genuine diamonds (S2, S4, S5, S6, S7), one support-plus (S3), two support (S1, S8).
All five diamonds are core or extended; three of the five (S2, S4, S5) are CORE, so the `core_only`
preset is still a diamond lesson** — which is the reverse check §10(i-1) requires.

---

## 11. On-canvas layout + camera geometry (computed)

All positions in graph units; the apparatus is translated by `−(a+b)/2` along its own x onto the
world origin (SR-D10).

| State | `camera_position` (graph units, target = origin) | max \|NDC\| (FOV 60 / 16:9) | Why |
|---|---|---|---|
| S1 | `[0, 0, 5.2]` — straight down the third axis | (0.375, 0.666) | A **true face-on 2D read** of the frame. This is the state that makes the ticked frame honest |
| S2 | **`camera_steps`** (SR14): `[0,0,5.2]` → `[4.60, 3.07, 5.21]` scheduled across 2000–11000 ms | (0.413, 0.658) at the end pose | The chapter's tilt = "there is a dimension you have not seen yet" (§arc rule 3). **Closed-form on state-local ms — frame-rate independent by construction** (A9), which is what dissolves round 0's FLAG 1 |
| S3 | `[7.83, 0.80, 1.46]` — **12° off the x-axis at D = 8**, arrived via `camera_steps` from S2's end pose | (0.355, 0.609) | The slice face holds aspect **≥ 0.9661 at the WORST position it reaches** (§camera, measured over the full `x_cut` sweep) |
| S4 | `camera_steps` back to HOME `[4.60, 3.07, 5.21]` | (0.413, 0.658) | Rule 32d: the only change between S3 and S4 should be the discs, so the camera returns to the concept's home three-quarter pose along the same path it left by |
| S5 | `[4.60, 3.07, 5.21]` (HOME, held) | (0.266, 0.472) at r = 2.00; (0.129, 0.230) at r = 1.00 | Unchanged — the sphere's growth is the only motion (Rule 32b). The r = 1.00 figure is stated because it is the state's SMALLEST picture, and it is the one a round-0-style single-pose check would have missed |
| S6 | `[5.09, 2.39, 5.69]` — slightly wider | (0.390, 0.601) | The ring stack needs to show the hole's opening; framed for the outer radius 2.0 |
| S7 | `[6.02, 4.89, 6.77]` — raised and pulled back | (0.425, 0.663) over BOTH solids | The y-axis solid is 2 tall and **8 across** (outer radius 4) — much larger than the x-solid it is compared against, and the pose frames both without a second camera per half |
| S8 | `[4.60, 3.07, 5.21]` (HOME) | (0.413, 0.658) at b = 4.00 | Home pose; only the far end moves |
| S9 | `[5.42, 3.43, 6.32]` (D = 9.0) | **worst (0.581, 0.707)** over 793 slider corners | **Solved at the MAXIMUM corner of the full live product** (`a = 1.40, b = 4.00`), min corner spans 17.7 % of frame height (§camera) |

**Every number in this table is measured, not assumed** (A10): projection = `PerspectiveCamera(60, …)`
(`field_3d_renderer.ts:3733`), reference aspect **16:9** (`:57121`, `:57319`), target = world origin
(the camera target is not authorable — SR-D10 centres the apparatus instead), and each row's figure is
the **worst value over everything that moves in that state** — the full `x_cut` sweep on S3, the full
`r` sweep on S5, the full 793-corner slider product on S9 (A14).

**Overlay zones (Rule 34d, no collisions):** delta cue top-left · the ONE formula surface top-centre,
its top edge below the review chrome strip · the value-only HUD left, **`top:52px`+** so it clears the
"Full screen" button · the slider panel bottom, **not** at `top:12`
(`field3d_sliders_panel_top12_vs_fsbtn_top10`) · sprite labels ride their own objects and are
billboarded to camera-right so they read horizontal under the three-quarter poses.

## 12. Per-state timing table

> ### ⚠⚠ CYCLE-1 CORRECTION — **round 0's pin values were not derivable from round 0's own sub-beats, and the ramp's easing was never declared.**
> Three separate defects in one table. (i) **S3's stated pin was arithmetically wrong**: sub-beats slide
> `x` 0→4 over 2000–18000 ms, so pin 13200 is fraction 0.700 → `x = 2.800`, `r = 1.673`,
> `face area = 8.7965` — the table printed `1.400 / 1.183 / 4.398`, which is t = 7600 ms.
> (ii) **The easing function was undeclared** while SR10 named `capRamp` as the clone — whose easing is
> `capSmooth01` (`:6672`), under which S4's pin gives n ≈ 563, not the stated 316. Two of the three
> surviving rows only checked out under a linear ramp that no line of the document declared.
> (iii) **The table violated its own stated rule** — *"every pin lands after its state's last asserted
> reveal"* — while placing four pins mid-ramp at 0.60 × duration.
>
> **The fix removes the defect CLASS, not the three instances.** `srRamp`'s easing is declared below,
> AND **every pin is moved to after its ramp completes**. A pin placed after a monotone ramp ends
> returns the ramp's END value under *any* easing function — so the frozen baseline is now
> **invariant to the easing choice**, and a future re-time of the easing cannot silently move a
> baseline. Every pin value below is now also the exact number §10a's Definition of Done quotes for
> that state, which is the second thing round 0 did not have.

**⭐ SR10 · `srRamp` IS LINEAR — declared, not inherited.** `srRamp(t)` clones `capRamp`'s CLOCK
discipline (pure function of state-local ms, no accumulation, `SET_TIME_FREEZE`-reproducible,
`:6678`) and **explicitly NOT its `capSmooth01` easing (`:6672`)**. The ramped variable advances
linearly in its own parameter — `log₁₀n` for `n_ramp`, `x` for the disc slide, `r`, `b`, `θ` — and
**pacing is carried by the authored `holds[]`, not by easing**. The reason is a teaching claim, not a
preference: S4's lesson is that *each decade of n costs the same amount of screen time*, and an eased
ramp makes the first and last decades slower than the middle ones, which is a rate the narration does
not claim. *(Camera motion is the exception and does not use `srRamp` at all: it uses `sr.camera_steps`
— SR14 — which eases by design, starting and ending at rest per Rule 32d.)*

**Hold semantics, fixed here so a pin is computable from the table alone.** `duration_ms` is the total
WALL span of the ramp including holds; `holds: [{at_ms, hold_ms}]` are wall times measured from
`start_ms`; the ADVANCING span is `duration_ms − Σ hold_ms`, and the ramp's fraction at wall time `t`
is `(t − start_ms − Σ elapsed holds) ÷ advancing span`.

**Word budgets:** each state publishes `words_max = ⌊2.5 × motion_window_s⌋` (the safe speaking rate),
and §3's narration budget is ≤ that number — so authoring into the failure is impossible by
construction. Motion longer than narration is the legal asymmetry; never the reverse.

| St | Dur | Sub-beats (ms) | Driver | motion window | words_max | **Pin (post-ramp) → what the frozen frame shows** | Margin |
|---|---|---|---|---|---|---|---|
| S1 | **16 s** | frame 0–1200 · **curve draws 1200–6000** · region fills 6000–13000 · hold →16000 | draw edge, then fill edge | 13.0 s | **32** (§3: 28–32) | `eye_capture_ms: 13600` → whole curve, full region, `area = 5.333` | 600 ms |
| S2 | 26 s | region lifts 0–1500 · θ 0→360° 1500–19500 · `camera_steps` tilt 2000–11000 · hold →26000 | `theta_ramp` | 19.5 s | **48** (§3: 42–48) | `eye_capture_ms: 20200` → the closed solid, tilt complete, `θ = 360°` | 700 ms |
| S3 | 22 s | disc separates 0–2000 · slides x 0→4 over 2000–18000 · hold →22000 | `x_cut` (teacher may seize) | 18.0 s | **45** (§3: 40–45) | **`eye_capture_ms: 18800`** → `x = 4.000`, `r = 2.000`, `face area = 12.5664` — **and this is also the worst-case camera position (§camera), so the baseline photographs the case the gate asserts** | 800 ms |
| S4 | 26 s | label one disc (`rᵢ`, `Δx`) 0–2000 · `log₁₀n` ramp 2000–18000, advancing span 12000 ms, holds `{7000, 2000}` and `{13000, 2000}` · hold →26000 | `n_ramp` | 24.0 s | **55** (§3: 48–55) | **`eye_capture_ms: 18800`** → n = 1000, `Vₙ = 25.1076`, `settles on: 25.1327`, `still missing: 0.0251`, `discs drawn: 120 of 1000` | 800 ms |
| S5 | 24 s | profile swaps 0–2500 · ball re-forms 2500–6000 · `r` 1.00→2.00 over 6000–20000 (quantised to step 0.01) · hold →24000 | `r` | 20.0 s | **50** (§3: 42–50) | **`eye_capture_ms: 20800`** → `r = 2.00`, both readouts `33.5103`, `discs drawn: 120 of 20000` | 800 ms |
| S6 | 28 s | wrong solid builds 1500–7000, reads 7000–9000, dissolves 9000–11000 · ring stack builds 11000–20000 · hold →28000 | sequential builds | 20.0 s | **50** (§3: 45–50) | `eye_capture_ms: 21000` → the ring stack complete, `8.3776` bright, the wrong `1.6755` gone, the labelled slice at `x = 1.000` reading `R = 1.000`, `r = 0.500` | 1.0 s |
| S7 | 24 s | x-solid held 0–3000 · axis swings 3000–7000 · y-sweep 7000–18000 · hold →24000 | `axis` + θ | 18.0 s | **45** (§3: 40–45) | `eye_capture_ms: 19000` → the bowl closed, `about x: 25.1327` dim, `about y: 80.4248` bright | 1.0 s |
| S8 | 22 s | surface reveals 0–2500 · `b` 0→4 over 2500–18000 · hold →22000 | `b` | 18.0 s | **45** (§3: 42–45) | **`eye_capture_ms: 18800`** → `b = 4.000`, `V = 25.1327` | 800 ms |
| S9 | open | solid drawn 0–1500, then a continuous slow turn from 1500 | teacher-owned; Rule 37 free-run, no freeze | n/a | 0 / open | none (`interaction_complete` skips the pin) | n/a |

**Derivations for the four re-pinned rows, so the table is checkable without re-running anything.**
S3: the slide ends at 18000, pin 18800 → `x = 4.000`, `r = √4 = 2.000`, `π·4 = 12.5664`.
S4: the ramp ends at 18000 with `log₁₀n = 3.0` → n = 1000, `Vₙ = 8π·(999/1000) = 25.1076`,
`8π − Vₙ = 8π/1000 = 0.0251`. S5: `r` ends at 2.00, `(4/3)π·8·(1 − 1/20000²) = 33.51032155`, which
prints `33.5103`, as does `(4/3)π·8 = 33.51032164`. S8: `b` ends at 4.000, `π·4²/2 = 8π = 25.1327`.

**S1's retime, and why it is a trim rather than a cut.** Round 0 spent **7.8 s** drawing one curve —
the slowest beat in the concept, on its least load-bearing state. The draw is now 4.8 s and the fill
7.0 s, total window 13.0 s → `words_max = 32`, which S1's re-budgeted 28–32 words respects (the
13-word anchor sentence plus one 19-word content sentence). **Four seconds come off the concept's
runtime and nothing is lost** — S1's information gain is a NUMBER (`area = 5.333`) and a CAMERA POSE
(§whiteboard), neither of which needs 7.8 s of curve.

**S2's retime, called out because it changed a number in §3:** the first draft's 22 s duration gave a
13.5 s window and `words_max = 33`, below §3's 42–52 budget. **Duration raised to 26 s and the sweep
extended to 1500–19500** → window 19.5 s → `words_max = 48`. Motion was lengthened to fit the words
rather than the words cut to fit the motion.

**S7's pin, unchanged from round 0 and still correct:** a pin mid-sweep photographs a half-formed
solid, so `eye_capture_ms: 19000` sits after the y-sweep closes at 18000, margin 1.0 s.

---

## 13. ASSUMPTIONS — behavioural claims this document could not measure

Per the probe-don't-grep rule: every claim resting on renderer BEHAVIOUR carries clone evidence, a
measured number, or an explicit flag. These are the flags. **Each names the probe that settles it,
and `mathematics_author` / the SR dispatches must measure BEFORE authoring against it.**

| # | Claim | Status | The probe that settles it |
|---|---|---|---|
| **A1** | `max_discs_drawn: 120` — that ~120 pooled cylinders rebuilt per frame hold 60 fps | **ASSUMPTION — probe before authoring.** Clone evidence covers the *discipline* (pooled reposition-per-frame, `molecular_geometry` @55123) but **not the count** | In the scenario harness, place N cylinders and measure mean frame time at N ∈ {50, 120, 250, 400}; set `max_discs_drawn` to the largest N holding ≤ 16.6 ms with 30 % headroom. **The number in §d is a placeholder** |
| **A2** | ~~Tick-number sprites are legible at S1's camera distance~~ | **RETIRED at cycle 1, not deferred.** Tick numbers are no longer sprites — they are DOM nodes with a CSS-authored glyph height (§c0), so there is nothing left to measure | — |
| **A3** | The slice face projects at aspect ≥ 0.95 **at every position the disc reaches** | **MEASURED AT CYCLE 1 — and round 0's pose FAILED it.** Least-squares conic fit through 720 projected rim points, perspective, 81 positions across the full `x_cut` sweep: round 0's `[11.0, 1.6, 2.9]` measures **0.9419 at x = 4**; the re-solved `[7.83, 0.80, 1.46]` (12° off-axis, D = 8) measures **0.9661 worst**. FOV 60, reference aspect 16:9 (§camera) | Settled. Gate §11 re-runs the same sweep and carries round 0's pose as a negative control |
| **A4** | `setDrawRange` over a revolution **surface** (triangle strip ordered by θ) gives a clean partial sweep with no stray triangle | **ASSUMPTION.** Clone evidence is one dimension down: `acgThetaArc` @26055 does exactly this for a 96-segment **line** arc | Build the surface at 96 θ-segments, step the draw range 0 → full, and assert the rendered triangle count equals `2 × segments_drawn × (samples−1)` with no index reaching beyond the range |
| **A5** | ~~S2's camera tilt pacing~~ | **DISSOLVED at cycle 1 — the defect is ROUTED AROUND, not merely designed around.** Round 0 accepted `lerpSpherical` @4214 (per-**frame**, so the tilt lands in half the wall-clock time at 120 Hz) and made the tilt carry no timed claim. **AMENDMENT A9 supplies the real answer: `os.camera_steps` already exists** (@60704 declared, @62213–62290 implemented) and is closed-form on state-local ms — a state authoring it **bypasses `lerpSpherical` entirely**. S2, S3 and S4's camera moves are all `sr.camera_steps` (SR14). The platform defect is untouched and still fleet-wide, but this concept no longer depends on it | Settled for this concept. Gate §7's determinism section covers the camera pose as a pure function of `at_ms` |
| **A6** | The CBSE/JEE curriculum claims in §10b | **ASSUMPTION — syllabus documents and summaries, not a teacher.** Every cell ships `needs_teacher_verification: true`, **including the CBSE one** | A teacher of each board. **FLAG 2** |

---

## 14. Live scar-sweep disposition

**Coverage boundary, enumerated** (`scar_audit_claims_a_coverage_boundary_it_did_not_enumerate`):
`--owner alex:architect` + `--row-type directive` + `--field3d --open` + concept-id
(`solids_of_revolution` → 0 rows). Every row inside that boundary gets a verdict below or in the
N/A-with-reason families; none is left silent.

**Architect-owned rows that BIND, and their discharge:**
`concept_schema_assessment_minimum_exceeds_the_skeleton_authored_item_count` — **SATISFIED**: seven
items against the `.min(6)` floor **verified in code at `src/schemas/conceptJson.ts:328`**, each item
named to a state, `non_assessed_states` declared, states covered exactly once ·
`explore_state_formula_surface_asserts_a_relation_no_state_derives` — **SATISFIED by dropping the
overlay**, which is the row's own preferred remedy (§10h) ·
`skeleton_declares_an_engine_value_fixed_or_a_scar_N/A_without_reading_the_function_that_decides_it`
— **SATISFIED**: every engine claim in §⓿ quotes an enclosing function and a line, and the two
"EXISTS" claims (camera, sliders) were resolved to the enclosing function, not to the matching line ·
`call_site_enumeration_asserted_exhaustive_without_a_symbol_sweep` — **SATISFIED**: §⓿'s counts are
symbol sweeps with each hit classified, and the Rule-40a sweep classified both `solid_of_revolution`
hits to one documentation commit ·
`archetype_live_tier_unverified_against_renderer` — **SATISFIED**: archetype F is declared
`[NEEDS-SCENARIO]` and §⓿ carries a VERIFIED/SPEC split with an evidence tier per row, which is the
discharge that row prescribes when the tier is not live ·
`skeleton_certifies_a_state_buildable_from_a_mode_string_without_a_frame_probe` — **SATISFIED by
§13**: no state is certified buildable, every behavioural claim carries clone evidence or an
ASSUMPTION flag, and the four unmeasurable ones name their probes ·
`teach_concrete_before_abstract_compare` — **SATISFIED** (S5 shows the disc total ALONE, then brings
4/3πr³ beside it, then highlights the match; S7 holds the x-answer before the y-answer arrives) ·
`teach_do_not_prespoil_a_later_reveal` — **SATISFIED** (S2 shows no volume; `∫` first appears at S8;
the anchor's hollow half waits for S6) · `teach_distinct_reference_lines_for_two_radii` —
**SATISFIED** (S6 draws `R` and `r` as two labelled segments on one slice) ·
`teach_visual_must_match_narration` — **BINDS `mathematics_author`**, instance recorded: **S4's
narration may not say the disc total "reaches" or "equals" the exact volume at any finite n** — it
approaches; the gap is 8π/n and is positive at every n · `teach_coordinate_sim_with_graph` — **N/A
with reason**: no state pairs a 3D sim with a 2D graph; the frame and the solid are one scene, which
is the stronger form of what that row asks (§c2) ·
`nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control` —
**SATISFIED**: every archetype in §3 is produced by authored motion inside the state, not by the
difference between two states and not by a slider drag ·
`quantitative_check_state_reuses_the_exact_numbers_and_the_delta_cue_of_the_state_it_verifies` —
**SATISFIED** (§10f) · `ramp_endpoints_multiply_the_taught_variable_by_a_factor_no_rendered_string_claims`
— **SATISFIED**: `log₁₀n` is internal and `n` is what every rendered string shows ·
`taught_variable_has_no_rendered_physical_correlate_so_a_text_label_is_the_only_cause` —
**SATISFIED** (§10g correlates) · `rewind_path_assertion_stops_at_the_function_body_and_never_follows_its_calls`
— **N/A with reason**: no state authors a rewind, a loop reset or a re-entry path (all terminations
are one-shot-hold, §10d) · `real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget`
and `skeleton_anchor_specified_in_section_9_reaches_no_narration_line` — **SATISFIED** (§9: two named
states, verbatim sentences, word counts, inside the budgets) ·
`delta_cue_restates_the_declared_misconception_verbatim` — **SATISFIED** (§4 cue check) ·
`declared_payoff_state_ringed_outside_the_core_preset` / `core_ring_displays_a_quantity_whose_explanation_lives_in_a_cut_ring`
— **VIOLATED IN ROUND 0, FIXED AT CYCLE 1** (`exact` → `settles on`; §10b, §10i-1 reverse check),
and the quantity-by-quantity re-run is now recorded rather than asserted · `explore_controls_not_ring_gated_survive_the_ring_cut` —
**SATISFIED** (S9's three controls are all core-taught, and the routing map is checklist item 4) ·
`skeleton_discharges_a_ring_cut_with_a_field_no_renderer_reads` — **SATISFIED**: the cuts are argued
by ring assignment, and `min_ring` is explicitly NOT cited (inert, @55484–55492) ·
`teach_inverted_scenario_inverts_cutline_flags` — **N/A**: this scenario inverts no sibling ·
`hud_qualifier_appears_and_disappears_mid_sweep_and_the_skeleton_declares_the_label_constant` —
**SATISFIED and declared**: S4's `discs drawn: {n_drawn} of {n}` line is the one string whose shape
changes mid-sweep (it is truthful before the cap engages too, reading `120 of 120`), and its word
budget is reserved in S4's 55 words · `close_camera_framed_extent_is_authored_as_the_run_length_and_omits_the_body_radius`
— **SATISFIED** (§camera: framed extent = `b + 2·r_max = 7.85`, not `b`) ·
`nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows` — **SATISFIED**
(§12 margins, all ≥ 600 ms; S7 re-pinned) ·
`authored_beat_ends_by_undoing_the_state_own_claim` — **SATISFIED** (§10d terminations) ·
`derived_readout_asserted_by_value_without_defining_its_metric` — **SATISFIED** (§10g precisions) ·
`formula_surface_states_an_identity_in_a_unit_the_hud_never_renders` — **SATISFIED** (§10h diff) ·
`phase0_union_table_asserted_not_walked_state_by_state` and
`phase0_union_lists_capabilities_but_never_which_knobs_are_scriptable` — **SATISFIED** (§a's
consumption walk names co-present features, and §d's contract names every animated knob:
`theta_ramp`, `n_ramp`, `x_cut`, `r`, `b`, `axis`, `a`) ·
`phase0_config_enum_closed_against_the_spec_driver_not_the_served_concept_set` — **SATISFIED**: the
profile enum is closed against the **board exercise set** (§b1), not against this concept's own two
families · `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field`
— **SATISFIED**: `outer`/`inner` reuse one profile shape verbatim, and `volume_var`/`drawn_var`
copy `riemann_bars`' publication field naming deliberately ·
`explore_state_discoverables_authored_only_as_unrendered_scene_composition_annotations` /
`biot_state6_dotcross_lesson_not_rendered` — **SATISFIED** (§10h: no teaching string in an
annotation) · `field3d_explore_camera_fixed_while_its_own_dials_span_two_orders_of_radius`
(**CRITICAL**) — **SATISFIED by bounded ranges + max-corner framing** (§camera), with the durable
fleet fix declared as ledger item 3 rather than smuggled in ·
`field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` — **SATISFIED by
construction** (SR-D10) · `camera_metric_scored_foreshortening_not_pairwise_screen_separation` and
`orthographic_separation_metric_underpredicts_perspective_overlap` — **VIOLATED IN ROUND 0 IN A NEW
WAY, FIXED AT CYCLE 1.** Round 0's gate was pairwise and perspective, but it scored **the authored
pose** while the taught object travelled ±2 world units — AMENDMENT **A14 instance 5**, *the remedy
solved at one pose and gated at that same pose*. Gate §11 now sweeps the full `x_cut` range and
asserts the **minimum**, and carries round 0's own pose as a negative control ·
`camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed` (A11's
recurrence, MAJOR/OPEN) — **BINDS and is discharged by enumeration**: S9's solve enumerates all 793
corners of the live `a × b` product and gate §12's negative control is a one-axis sweep that must
PASS where the product fails ·
`field3d_sprite_label_text_and_ink_box_are_invisible_to_every_dom_probe` /
`field3d_world_space_label_decollision_is_projection_blind_and_collides_on_screen` /
`field3d_arrow_label_sprite_renders_at_under_half_the_body_label_glyph_height` — **DISSOLVED for the
tick set at cycle 1** (§c0: tick numbers are DOM nodes positioned from `nlbProjPx`, so glyph height is
CSS-authored, decollision is screen-space, and the text is probe-readable; A2 retired). **BOUNDED for
the six object-riding sprites that remain** (`y = √x`, `axis`, `r`/`rᵢ`/`Δx`/`R`/`b`), none of which
carries a number a student must read — the boundary is now enumerated, which is what round 0's
"BOUNDED, not solved" was missing · `field3d_sliders_panel_top12_vs_fsbtn_top10` — **SATISFIED** (§11 zones) ·
`field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus` — **BINDS `json_author`**:
every `visible_elements` token in this concept must be specific (`sr_axis_x`, `sr_disc_stack`,
`sr_region`), never a substring that also matches a sibling · `field3d_dt_accumulated_motion_invisible_to_eye_timepin`
and `eye_dense_frames_are_never_hashed_so_a_frozen_state_passes_31_of_31` — **RECORDED for the EYE
step**: this concept has four ramping states, so THE EYE must read **dense** frames, not only the
frozen ones · `field3d_focal_glow_pulse_phase_reads_absolute_time_so_frozen_h2_jitters` —
**RECORDED for the baseline step**: H2 tolerance is set from evidence, never assumed 0.00 % ·
`teach_field3d_explore_grab_and_move_field_point` (DIRECTIVE/OPEN — a reusable drag primitive) —
**spirit satisfied by S9's sliders; the primitive is deliberately not built per-scenario** (0a ledger
item 3) · `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` — **BINDS
`json_author`**: S5 and S7 each display a PAIR of numbers whose equality/difference is the lesson, so
the focal must be **both** readouts, never one · `authored_state_glow_focal_silently_voids_every_tts_sentence_glow_in_that_state`
— **BINDS `json_author`** on the same two states · `concept_ships_zero_narration_glow_bindings` —
**BINDS `mathematics_author`**.

**N/A-with-reason families** (no `newtons_laws_body`, no energy bars, no force arrows, no circuit, no
substance enum, no PCPL surface, no second body, no ambient field): every `nlb_*` row ·
`energy_layer_*` · `shared_bar_scale_*` · `architect_authors_a_force_triangle_*` ·
`velocity_arrows_routed_through_a_force_arrow_map_*` · `field3d_rule16a_belief_unbuildable_*` ·
`closed_enum_cannot_name_a_substance_the_design_teaches` · `chemistry_concept_id_collides_with_rostered_physics_id`
(checked, §8) · every `pcpl_*` and `parametric_*` row (different renderer) · `solenoid_*`, `biot_*`,
`cyclotron_*`, `mfl_*`, `ecp_*`, `radius_scenario_*`, `ghost_compare_*` (scenario-specific to
concepts this one does not touch) · `CACHE_UPSERT_CONFLICT_TARGET_MISSING` and
`field3d_particle_field_vestigial_dual_panel_config_gap` (serving path; mathematics registers
nowhere but its own file, §10f) · `calculator_*` rows (THE CALCULATOR is advisory and this concept
paints no symbol-and-value DOM node it harvests) · `paired_skeletons_cite_each_other_by_state_number_across_a_renumbering`
(this document cites no sibling by state number — the sibling references in §2 and §1 are by
CONCEPT and by lesson, deliberately) · `lesson_never_states_the_principle_it_is_named_after`
(S4 states the disc sum and S8 the integral form; under `core_only` S4 survives, so the principle is
stated in every preset).

---

## Block 1 — Pass-1 strategic checklist

**1. Prerequisite cliff.** Two prerequisites, neither shipped (§8).
- **The definite integral** — the concept breaks at **S4** without it: a student who has never seen a
  sum converge reads the disc total as "a better guess". Patch sentence, inside S4's 55-word budget:
  *"Each disc's volume is its circular face times its thickness, and adding them all is the whole
  solid — the thinner they are, the less of the solid is missed."* It carries the mechanism without
  condescending to a student who already knows it.
- **Reading `y = f(x)` off a graph, and the area of a circle** — the concept breaks at **S3** without
  the second. Patch sentence, inside S3's 50-word budget: *"The curve's height at this point is the
  circle's radius, and a circle of radius r has area π r²."*

**2. Exam-backwards trace** (AP Calculus AB / A-level Pure style, per §10b's corrected audience):
*"The region bounded by y = √x, the x-axis and x = 4 is rotated through 2π about the x-axis. Find the
volume. Then find the volume when the same region is rotated about the y-axis instead."*
Pieces → states: the region and its bounds → **S1**; what rotation produces → **S2**; the circular
cross-section and its area π f(x)² → **S3**; adding the slices to a total → **S4**; the second half,
about the y-axis → **S7**; and the notation the mark scheme expects → **S8**. **No missing piece, and
no idle state** — S5 is exercised by assessment item 4 and S6 by item 5.

**3. Misconception entry mapping (Rule 16a).**
- **M1** is planted by the phrase "the area under the curve", which every prior lesson (including the
  sibling concept, and **including this concept's own S1 readout**) puts in the student's head — and
  is confronted at **S3**, the first state where a radius exists. The planting is deliberate and
  flagged at the planting moment: S1 prints `area = 5.333` and S3 re-uses that exact number as M1's
  dim chip, so the wrong belief is confronted with the number that created it.
- **M2** is planted by the visual similarity between "the gap between two curves" and "the radius of
  the hole" — confronted at **S6** by building the wrong solid.
- **M3** is planted by **S1–S6 themselves**, all of which revolve about the x-axis without ever
  saying that the axis was a choice — confronted at **S7**, which makes the choice visible by
  changing it. *(This is the honest form: the lesson plants the belief, so the lesson removes it.)*

## Block 2 — Aha-moment designation

- **PRIMARY aha:** ***The formula for a sphere's volume is not a fact to memorise — it is what you get
  when you spin a semicircle and add up the discs.*** State **S5** (inside `foundational`,
  STATE_1 → STATE_5 ✓, and **core ring**, so it survives both preset cuts ✓).
- **SUPPORTING aha (1):** ***The same flat region gives a different solid about a different axis —
  the axis is part of the question.*** State **S7**. **Cohesion check:** it reinforces the primary
  rather than standing alone — the primary's claim is that the *curve plus the axis* determines the
  solid, and S7 is that claim's other half, proved by changing the axis while holding the curve. A
  third candidate (S6's ring) was considered and **rejected as an aha**: it is a correction of a
  method error, not a memory, and it belongs in the extended ring as a technique.
- **Wrong-belief setup (the 1–2 states before each aha that build the confident-wrong belief):**
  - For **S5**: **S3 and S4** build "a volume is something you compute by adding up little pieces —
    tedious, approximate, and unrelated to the formulas I was given in Class 9." The student is
    confident and slightly wrong. S5 breaks it by producing a formula they have known for years,
    exactly, at every radius.
  - For **S7**: **S1–S6** build "the region is the thing; the axis is just where it happens to sit."
    Six consecutive states revolve about the x-axis without comment. S7 breaks it in one motion.
- **Foundational-coverage rule:** **SATISFIED** — S5 ∈ STATE_1 → STATE_5. No exit-pill needed.

---

## Source check line

*Consulted the NCERT Class-12 Mathematics chapter index (Application of Integrals) and the named
international specifications (AP Calculus AB/BC Course & Exam Description, A-level Pure
specifications, IB DP AA subject guide, ISC syllabus) for **SCOPE ONLY**, feeding §10(i-3) and §10b.
NCERT Exemplar consulted for misconception **BELIEFS only** (§4). No teaching method, no example
problem, no figure, no explanation phrasing imported. HC Verma and DC Pandey not consulted — physics
sources, forbidden for mathematics.*

## Self-review checklist — run

- [x] Atomic claim is ONE sentence; state count justified against Rule 11 and against the sibling's
      lesson boundary (compressed the limit beat to one state, deliberately).
- [x] Control table FIRST, with the **`→ hand-off` column** on every state; no hand-off reads "and
      now, separately"; one new archetype coined with a one-line justification; no archetype repeat
      except the declared S2/S7 contrast pair whose delta names the flip; `drag-sandbox` on S9 only;
      no static state including S9; explore last with `interaction_complete` and ALL core controls.
- [x] Narration budgets 25–55 EN words, each ≤ the state's published `words_max` (§12); S2 retimed
      rather than truncated.
- [x] Rule 32 plan complete (cause-first by reveal order, one variable moves, ≤5-word delta cues,
      one apparatus from a home pose, exactly one glow focal per instant).
- [x] Rule 33 in mathematics form: register lead declared per state, symbolic leads only S8
      (advanced), every state exposes a changing real number, one quantity → one readout by
      publication.
- [x] Rule 34: one formula surface per state (two states carry none, argued), caption = delta cue
      only, HUD value-only, Unicode across all three text paths, zones cleared with numbers.
- [x] Rule 38: rings assigned, order qualitative → quantitative → derivation, advanced = {S8}
      contiguous before explore, **both cuts argued in both directions over four checklists** with
      the reverse payoff/misconception check, explore = core-only with **no** formula surface,
      `curriculum_tags` as claims with `needs_teacher_verification` everywhere (including CBSE, whose
      claim is negative), presets derived from rings, graph-axis convention decided (no conflict),
      dialect ruling made, anchor is a household object.
- [x] Rule 41: every rendered string checked — titles, delta cues, captions, labels, HUD, narration.
      No idiom, no metaphor, no personification. "Disc" and "ring", never "washer" outside one
      dual-label.
- [x] Rule 16a: exactly three `misconception_watch` states; six states carry none.
- [x] **Seven** assessment items against the code-verified `.min(6)` floor; `non_assessed_states`
      declared; items ring-tagged.
- [x] `entry_state_map` with ring tags and fallbacks; PRIMARY aha inside `foundational`.
- [x] Prerequisites advisory and **honestly labelled as not-shipped**.
- [x] Engine bug queue swept with the boundary enumerated; every row in the boundary dispositioned;
      Rule 40a sweep on all nine proposed symbols with both hits classified.
- [x] **Probe-don't-grep:** §⓿ carries an evidence tier per VERIFIED row; every behavioural claim is
      clone-backed, measured, or flagged in §13 with its probe named. **Zero unflagged unmeasured
      behavioural claims.**
- [x] **Rule 19 declared and counted** — ≥ 3 `scene_composition.primitives` on every state; the
      persistent apparatus supplies three before any state-specific object, minimum across the nine
      states is **5** (§10a). *(Cycle-1 addition: round 0 neither declared Rule 19 nor listed it
      here.)*
- [x] **A14 worst-case law applied to every projection claim** — S3's circle aspect swept over the
      whole `x_cut` range (worst 0.9661 at x = 4), S9's framing enumerated over all 793 corners of
      the live slider product, S5's r-sweep exhaustive over its 101 reachable values. **No number in
      this document is measured at the authored pose alone.** FOV 60, reference aspect 16:9, axes
      swept and worst value stated beside every camera figure (A10).
- [x] **Every pin is post-ramp**, so the frozen baselines are invariant to the ramp's easing
      function; `srRamp`'s easing is declared LINEAR rather than inherited from `capRamp`.
- [x] **Every displayed-equality claim is gated on the RENDERED STRINGS over a finite reachable
      set**, not on the underlying floats.
- [x] Zero TBDs.

---

## CYCLE 1 — CHECKPOINT A RESPONSE

Verdict at cycle 0: `DESIGN_FIX`. Every finding is dispositioned below. **Nothing is rejected**; two
findings are APPLIED-AND-STRENGTHENED, where the prescribed fix was necessary but measurably not
sufficient, and the stronger fix is shown with the measurement that forced it. Every number below was
produced by a probe run for this cycle, not carried from round 0.

### P1 — all closed

| # | Finding | Disposition |
|---|---|---|
| **P1-1** | S5's PRIMARY AHA asserts an equality false at every finite n, and n is never authored | **APPLIED AND STRENGTHENED.** The closed form is derived and published in §3: **`Vₙ(r) = (4/3)πr³(1 − 1/n²)`**, verified against the literal left sum to **1e-14** at r ∈ {1.0, 1.5, 2.0} × n ∈ {120, 316, 1000, 2000, 20000} (the semicircle vanishes at both endpoints, so the left rule here IS the trapezoid rule). **`n ≥ 1000` is necessary but NOT sufficient, measured:** at 4 dp, n = 1000 disagrees in the last digit at **13 of the 101 radii the state can reach**. The fix is therefore two-part — (i) `r` is **quantised to its slider step 0.01 in both drive paths**, making the reachable set exactly **101 values**, finite and enumerable; (ii) **n = 20 000**, putting the gap at ≤ **8.38e-8**, four orders below the 1e-4 display quantum. **Measured result: 0 of 101 radii disagree at 4 dp** (0 at 3 dp; n = 5 000 also gives 0, so 20 000 carries a 4× margin). New **gate section 13** asserts the identity **on the rendered strings over the exhaustive set**, with **n = 1000 as its negative control**. `discs drawn: 120 of 20000` added to S5's HUD (SR-D5). §14's binding on `mathematics_author` — never say the sum "equals" the exact value — now agrees with the payoff state instead of contradicting it |
| **P1-2** | S6's ring radii are geometrically impossible | **APPLIED, exactly as found.** With `R = √x`, `r = x/2` the curves **meet at x = 4** (R = r = 2, empty ring) — round 0 labelled the one slice on the interval that cannot show M2. The labelled slice moves to **x = 1.000: `R = 1.000`, `r = 0.500`**, the widest radial gap (`d/dx(√x − x/2) = 0 ⇒ x = 1`), true ring area **2.3562** against M2's wrong **0.7854**. §3's function block, §3's control table, §4's M2 beat, §10a, §10b and §12's S6 pin row are all re-authored. Recorded explicitly: the largest ring *area* is a different slice (x = 2, area π) and is deliberately not the labelled one, because M2 is an error about the two **radii** |
| **P1-3** | The explore state cannot reproduce the lesson | **APPLIED.** `b ∈ [1.0, 4.0] step 0.05`, `a ∈ [0.8, 1.4] step 0.05`, `n ∈ [4, 120] step 4`, **defaults `a = 1.00, b = 4.00, n = 20`** — so S9 opens on the exact solid S1–S4 taught (Rule 32d home pose) and `8π = 25.1327` is reachable. §10c's contradictory `b ∈ [0.5, 4.0]` is resolved by stating the range **per state**: S8 keeps [0.5, 4.0] because its lesson is the solid growing from nothing; S9 is [1.0, 4.0]. Camera re-solved below. Measured corner ratio **9.60 : 2.60 = 3.7 : 1**, confirming the CRITICAL scar's resolution survives |
| **P1-4** | The circle remedy is solved at one pose, and the gate scores that same pose | **APPLIED — and the finding is independently reproduced.** Measured by least-squares conic fit through 720 projected rim points, in perspective: round 0's `[11.0, 1.6, 2.9]` is **16.76° off-axis** (not 15°) and its projected aspect runs **0.9963 at x = 0 down to 0.9419 at x = 4** — below its own ≥ 0.95 floor, at the position the DoD quotes. *(My conic fit reads 0.9419 where the finding reads 0.9385; the two metrics differ slightly, both are below the floor, and the conclusion is identical.)* **Re-solved from the WORST disc position** by a scan over α ∈ [6°, 20°] × D ∈ [7, 20] maximising frame fill subject to worst-case aspect ≥ 0.960: **`[7.83, 0.80, 1.46]` — 12° off-axis, D = 8 — worst aspect 0.9661 at x = 4.000**. Gate §11 now **sweeps all 81 positions of the full `x_cut` range and asserts the minimum**, and carries round 0's own pose as a negative control so the fix cannot be silently reverted |
| **P1-5** | §12's pin values are not derivable from §12's own sub-beats, and the easing is undeclared | **APPLIED — and the defect CLASS is removed, not the three instances.** (a) **`srRamp` is declared LINEAR**: it clones `capRamp`'s clock discipline (`:6678`) and **explicitly not `capSmooth01`** (`:6672`), because S4's teaching claim is that each decade of n costs the same screen time. Hold semantics are pinned so a pin is computable from the table alone. (b) **Every pin moves to after its ramp completes** — a post-ramp pin returns the ramp's END value under *any* monotone easing, so the frozen baselines are now **invariant to the easing choice**, and each pin value is also the exact number §10a quotes. S3 → 18800 (`x = 4.000`, `r = 2.000`, `12.5664`); S4 → 18800 (n = 1000, `Vₙ = 25.1076`, `still missing 0.0251`); S5 → 20800 (`r = 2.00`, both `33.5103`); S8 → 18800 (`b = 4.000`, `25.1327`). Margins 800 ms. Round 0's arithmetic error is confirmed: pin 13200 on a 2000–18000 linear slide is fraction 0.700 → `x = 2.800`, `r = 1.673`, `8.7965`, not `1.400 / 1.183 / 4.398` |

### P2 — all closed

| # | Finding | Disposition |
|---|---|---|
| **P2-1** | `exact = 25.1327` is a core-HUD quantity no state derives in any preset | **APPLIED**, by the finding's first option. The label becomes **`settles on:`** and the shortfall **`still missing:`** — both name exactly what S4's own picture shows (totals climbing and levelling; the distance between two numbers on screen), so the explanation survives every cut. §10(i-1)'s reverse check is re-run **quantity by quantity** over the core survivors rather than asserted. The rejected alternative is recorded: a provenance line on S4 would import `∫` into the core ring and break Rule 38c |
| **P2-2** | `Δx` and `rᵢ` are on two core formula surfaces and defined nowhere | **APPLIED.** Both gain a defining state (**S4**), a **drawn referent** (a thickness bracket and the indexed amber radius segment on one labelled disc), and their own beat — the state's opening n = 4 hold, before the ramp starts. Symbol table rows added; S4's word budget raised to 48–55 to carry the clause. §10h now records the full surface-by-surface symbol sweep instead of claiming one was run |
| **P2-3** | Gate §8's threshold fails the design it certifies — two spaces, one threshold | **APPLIED.** The space is named: **fraction of the ramp's ADVANCING progress time, holds excluded**. In that one space, measured: the log ramp reaches **n = 8 at 12.554 %**; a linear-n ramp reaches n = 8 at **0.402 %**. The threshold drops from ≥ 15 % to **≥ 10 %** (a 31× separation from the negative control), and a **stronger, space-free assertion is added**: at 50 % progress the log ramp gives **n = 63** (the geometric mid of 4 and 1000, ±3) where a linear ramp gives **502**. A `capSmooth01`-eased ramp is a third negative control |
| **P2-4** | The ticked-frame options table omitted the renderer's own graph mechanism (A15) | **APPLIED — priced, and it changed the answer for the LABELS.** The hybrid is priced in a new §c0 against both alternatives. The 161 `fillText` sites are **all inset graph PANES** (`cap_graph_canvas`, `:7171`), not scene overlays — so the canvas hybrid must add a **new full-size overlay canvas kept in size-sync**, and canvas text is **as invisible to a DOM probe as a sprite is**, so it dissolves only two of the three sprite scars. **The option A15 did not name wins: DOM tick labels**, positioned per frame from **`nlbProjPx` (`:41833`, already ships, 7 projection sites)** — ~30 lines, glyph height authored in CSS px, screen-space decollision, **and probe-readable**, dissolving **all three** scars and retiring assumption A2 outright. **The 3D frame itself is unchanged** — §c2's "the region that spins must BE the region the frame ticks" is untouched. Free consequence: the tick container is a Rule-39 widget (`sr_ticks`, "Axis numbers") |
| **P2-5** | S1 is justified as filler even though a better justification exists | **APPLIED.** §whiteboard is re-argued from the two information-gain facts already in this document: S1 prints `area = 5.333` and **S3 re-uses that exact number as M1's dim chip**, so the misconception is confronted with the number that created it (delete S1 and M1's beat loses its referent); and S1's face-on camera is what makes the 3D-frame decision honest (delete S1 and blocker 2's answer weakens). **§arc rule 5 is demoted to a bonus.** The 7.8 s curve draw is trimmed to **4.8 s** (S1 now 16 s, window 13.0 s, budget 28–32 words = the 13-word anchor plus one content sentence) |
| **P2-6** | Two enum families ship with zero rendering states | **APPLIED — kept, with the safety argument stated.** A family contributes **numbers, not pixels**: a pure `srF` plus a closed-form `srIntegralF2`, both asserted to 1e-12 against independently solved values, with the geometry code shared and exercised on seven states by `power` and `circle_arc`. SR-D8 makes an unknown family THROW, so an unused family cannot silently degrade a rendered state. Shipping them is also the cheapest test of §b4's own claim that a fifth family is one row and one closed form. **The commitment this buys is recorded**: the first concept to author a `sin` or `exp` profile treats that family as **unreviewed** and does not inherit this concept's green gate as visual evidence |

### P3 — all closed

| Finding | Disposition |
|---|---|
| S6's anchor uses "glass" in two senses (Rule 41c) | **APPLIED** — *"A drinking glass is hollow, so the solid part is the material between two curves."* (14 words, inside S6's budget) |
| Assessment item 1 is mapped to S2, the one state that shows no slice | **APPLIED** — item 1 now asks what S2 actually renders (*a region turned one full turn sweeps out a solid that gets wider along the axis*; distractor: a flat disc, i.e. the region merely rotated inside its own plane), and the circle question moves onto item 2, which was already S3's |
| Rule 19 is nowhere declared | **APPLIED** — declared and counted in §10a (persistent apparatus supplies 3 before any state-specific object; minimum across the nine states is **5**) and added to the self-review checklist |
| S7's `80.4248` is asserted, never shown as a ring computation | **APPLIED** — S7's stack is now explicitly **S6's ring stack re-used**: at height y the slice runs from the curve out to the far edge, `R = 4.000` fixed and `r = y²` growing, both live in the HUD. This is also the reason S7 must follow S6 and why the two share the extended ring — stated rather than left as an ordering accident |
| The S2→S3→S4 excursion is the largest camera move and lands on the state most needing continuity | **APPLIED via F24.** All three moves use **`sr.camera_steps` (SR14)** — a **PORT** of the existing `os.camera_steps` (`:60704` declared, `:62213–62290` implemented), closed-form on state-local ms. **Consequence beyond the finding: round 0's FLAG 1 is WITHDRAWN and assumption A5 is dissolved** — no camera move in this concept touches the frame-rate-dependent `lerpSpherical` ease at all |

### Rulings applied without re-litigation

**Colour language** now reproduces Act I's table verbatim (`vector_products_in_space_skeleton.md` ⓪
rows 1–5), with two conformance notes stated rather than silently resolved: cyan carries the profile
*curve* where Act I's cell names its *tangent* (same object family), and S6's inner curve takes the
existing magenta direction role rather than a sixth hue. **F21–F24 numbering** untouched (this
document owns the SR-namespace and cites F24 only). **FOV 60 / reference aspect 16:9** stated beside
every camera number, with the axes swept and the worst value (A10). **The worst-case law** (A14) is
applied to every projection claim in the document, and to one numeric claim as well.

### What survived audit and was not reopened

The **profile enum** (§b) and the **ticked frame inside `field_3d`** (§c) are unchanged as decisions;
§c gains the priced hybrid and swaps the tick LABELS onto the DOM. The nine-state arc, the three
misconceptions, the drinking-glass anchor, the curriculum correction (§10b / A8) and both dispatch
boundaries stand.

### Rejected

**Nothing.** Two findings were applied in a stronger form than prescribed (P1-1's `n ≥ 1000`, which
measurement showed insufficient at 4 dp; P2-4's canvas hybrid, which loses to the DOM option it did
not name), and both departures are shown with the measurement that forced them rather than asserted.

## FLAGS — for the founder

1. **~~FLAG 1~~ — WITHDRAWN at cycle 1.** The frame-rate-dependent camera ease is real and still
   fleet-wide, but this concept no longer touches it: every camera move here is `sr.camera_steps`
   (SR14 / A9), which is closed-form on state-local ms. **Nothing in this skeleton blocks on, or is
   degraded by, `lerpSpherical`.** The platform decision remains open in the 0a ledger as item 4 and
   is somebody else's row. *(Round 0's text is kept below, struck, so the reasoning is auditable.)*
   ~~The frame-rate-dependent camera ease~~ (`lerpSpherical` @4214). ~~S2's tilt is this
   concept's one camera-timed beat. **Designed around** (the θ sweep carries the lesson; the tilt
   carries no timed claim), so this concept does **not** block on it — but it is the same open
   platform decision the 0a survey raised for #7's S4, and 0a's recommendation (fix it as its own
   small Rule-40 dispatch before any scenario work) applies here identically.~~
2. **FLAG 2 — the curriculum correction (§10b), and it is the finding I most want reviewed.**
   Volumes of revolution appear to be **outside** the current CBSE Class-12 and JEE Main scope and
   **inside** AP Calculus AB/BC, A-level Pure, IB AA HL and ISC. If that holds, #8 is the 3D wave's
   **international** concept rather than a CBSE/JEE depth play, which inverts the framing recorded in
   `MATHEMATICS_DISCUSSIONS.md` §4 and `MATHEMATICS_PHASE0_VECTORS_3D.md` §0a. It changes no engine
   decision. It changes the tags, the Rule-38f audience argument, and what a later coverage review
   concludes. **Needs a teacher of at least one of those boards** (Rule 38g).
3. **FLAG 3 — the shell method is DROPPED** (§b3), on board evidence rather than cost. This removes
   union row F17 from the 0a ledger's cost estimate for #8. If the founder wants shells (some AP
   courses teach them even though the CED does not require them), it is one more `sr.mode`, one more
   gate section, and one more state — and it should be scheduled, not smuggled.
4. **FLAG 4 — `max_discs_drawn: 120` is a placeholder** (A1). The perf probe runs in the SR-B
   dispatch **before** S4's timing table is authored against it, because S4's `discs drawn: 120 of n`
   HUD line names the number.

*Handoff: this document makes `solid_of_revolution` buildable — two dispatches, checkable before a
line of renderer code lands on master. **Not** handoff-ready to `mathematics_author` until SR-A and
SR-B are on master; ready for **founder_proxy Checkpoint A re-verdict** at cycle 1.*


---

## POST-BUILD CORRECTIONS — Checkpoint B round 1 (2026-08-28, quality-auditor FAIL → `alex:json_author`)

Three places where this document disagreed with itself or with the shipped engine, resolved in the
JSON and recorded here so the skeleton stops being a source of the same defect.

1. **S8's formula surface (§2 / §10a say `f(x)²`, §10b's symbol table says `x`).** The JSON had
   shipped the §10b form `V = π ∫₀ᵇ x dx` while the narration said "f of x squared" — the ear and the
   eye disagreed, and the bare `x` hid the SQUARE on the one state carrying the concept's only `∫`,
   in a concept whose flagship misconception (M1) IS the missing square. Resolved as
   **`V = π ∫₀ᵇ (√x)² dx`**: it shows the square, it uses only symbols already on screen (`√x` from
   S1, `²` from S3 — `f(x)` is defined on NO surface, so `f(x)²` would have been a Rule-25 untaught
   term), and the narration now says "root x squared". §10b's row is superseded.
2. **"washer" (§3 noun discipline vs §10(i-5) dialect ruling).** §3 says the word never appears in
   reader-facing text; §10(i-5) said dual-label it once on S6. The audit applied §3 + Rule 41c (a
   second-language student does not own hardware vocabulary) and DELETED `, or washer` from `s6_3`.
   **FLAG for the founder:** if the AP "washer method" term should be kept for that audience, that is
   an architect amendment to §3, not a silent re-insertion.
3. **S7's HUD (§10b claims `R = 4.000`, `r = y²`).** The JSON authors `readouts: ["theta",
   "V_about_x", "V_about_y"]` and that is CORRECT: the engine's `R` / `r_inner` keys compute
   `srF(outer, x_cut)` — the slice radii for the x-axis case — and would print WRONG numbers for the
   y-axis bowl. The DoD line is withdrawn; the fixed outer radius 4 and the growing inner radius are
   carried by the drawn ring stack, not by a readout.

Also applied in the same round: S8's `b` ramp now starts at 0.5 (§10c's range, "grows from nearly
nothing" — the 1.0 start showed a finite solid at t = 0); narration `5.333` → `5.3333` to match the
HUD's own decimals; three figurative constructions replaced ("paints" → "sweeps out", "staircase
thins / total climbs" → "steps get smaller / total increases", "not a horn" → "open at the top");
duplicate primitive ids removed from S5 / S7 `scene_composition`; advisory `prerequisites` authored.

4. **S8's `b` ramp (§10a / §3 say "b sweeps 0 → 4 … grows from nothing"; §10c says `[0.5, 4.0]`).**
   Round 1 authored `from: 0.5` to honour it and **regressed**: the `b` slider row is SHARED with
   S9, whose explore camera was solved over `b ∈ [1.0, 4.0]` (§3b, gate §12), so the range cannot
   be widened — and a ramp below the slider's `min` leaves the thumb frozen at 1.0 while the HUD
   reads 0.50…0.85 for 4.7 s, the exact "slider reads one value beside a HUD reading another"
   topology SR-D3 was written against. Reverted to `from: 1.0`; the "0 → 4" / "from nothing"
   line is withdrawn. The solid opens as the b = 1 solid and grows to b = 4.
5. **S2's camera timing note.** `osCamScheduleAt` treats `at_ms` as the ease START, so the
   two-step schedule the JSON first authored eased 11000→20000, not 2000→11000 as §11 states.
   Re-authored as ONE step at 2000 with `ease_ms 9000` from `camera_base`, which is what §11
   meant. (Checkpoint B round 2, N1.)
6. **S6's §12 sub-beats were prose with no driver behind them (founder-proxy Checkpoint B, cycle 1).**
   §12 authored "wrong solid builds 1500–7000 · reads 7000–9000 · dissolves 9000–11000". The JSON
   shipped a STATIC `discs.n` with `reveal.stack_at_ms 1500`, which is an INSTANT placement — three
   of the four sub-beats were never built, and the state held **13 byte-identical frames (8.4 s, a
   third of its length)** under live narration. THE EYE's D5 passed it, because D5 scores a state as
   a whole and this state moved elsewhere. Fixed by giving `discs` an `n_ramp` (n: 4 → 1000 over
   1500–7000), so the wrong solid builds and its total visibly climbs 1.6598 → 1.6744 → 1.6754 →
   1.6755 into the read window; and by cutting `duration` 28 → 22 s, since θ closes at 20000 and the
   pin is 21000 — the last 7 s were dead. **Durable rule: a sub-beat table that names MOTION must
   resolve to a named driver in the shipped JSON (a `*_ramp`, a `*_ms` window, or a `camera_steps`
   entry); an `at_ms` with no duration and no ramp is an instant placement that satisfies every gate.**
   The 2 s *dissolve* is still unauthorable — `srStackReveal` fades in only — and is filed as an
   engine ride-along rather than pretended.
