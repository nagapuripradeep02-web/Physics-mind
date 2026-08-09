# Mathematics patterns library — v0.1 (seed)

> **Status: SEED (2026-08-04, `MATHEMATICS_BUILD_PLAN.md` Phase 2).** Sibling of
> `patterns/chemistry.md` and `patterns/magnetism.md`, which grew section-by-section as each diamond
> shipped. This file starts with the representation lens + archetype catalog + source roles — what
> the architect needs BEFORE the first mathematics skeleton — and grows its primitives / choreography
> / overlay sections the same way, one shipped concept at a time.
>
> **Consumers:** `architect` (skeleton archetype declarations) · `mathematics_author` (every Rule-31
> timeline must cite an archetype here) · `quality_auditor` (audits the declaration).
>
> **Hard interim rule — THREE tiers, measured against the live tree 2026-08-04
> (`MATHEMATICS_DISCUSSIONS.md` §3), not surveyed:**
> - **[LIVE]** — maps to a renderer + capability that EXISTS today and that
>   `build_review_site.ts` can actually ship. May appear in a skeleton now.
> - **[NEEDS-SCENARIO]** — the renderer exists, the specific scenario does not. A modest scenario
>   build unlocks it. A concept needing one is NOT buildable until that scenario ships on master —
>   do not schedule it ahead of the build.
> - **[PHASE-5]** — needs a net-new surface. Design target only.
>
> **⚠ The one thing to internalise before reading further.** `build_review_site.ts:3603` ships exactly
> three engine families: `field_3d_config`, `particle_field_config`, `physics_engine_config`
> (PCPL/parametric). **`graph_interactive_renderer.ts` is NOT one of them** — it is a real Plotly
> plotter named as `panel_b` on 48 shipped physics concepts, and the review builder has no panel-B
> branch at all. Never plan a mathematics archetype onto it.
>
> **And the corollary that shapes this whole file:** the PCPL `axes` primitive
> (`parametric_renderer.ts:2668`) is two labelled arrows — no grid, no ticks, no numeric scale, no
> data↔pixel transform. **Nothing shippable draws a coordinate plane today.** That is archetype **A**
> below, and it is [NEEDS-SCENARIO].

---

## 0. The representation lens (the mathematics-specific teaching triangle)

Mathematical understanding lives on three registers at once — **graphical** (the shape: a curve, a
vector, a solid), **symbolic** (the notation: `f(x)`, `dy/dx`, `∫`), and **numeric** (the value: a
slope of 2.75, an area of 4.19, a coordinate). The classic student failure is fluency in the symbolic
register with no connection to the other two — the student who differentiates correctly and cannot
say what the answer *means*.

This is chemistry's macro/particulate/symbolic triangle with different vertices, and Rule 33
(macro↔micro) generalises onto it:

- **Every mathematics skeleton DECLARES, per state, which register leads and which support.**
- **The symbolic register NEVER leads a core-ring state.** Notation enters as a *label on graphical
  action already seen* (Rule 25 foundation-first). `dy/dx` appears on the state where a tangent has
  already been watched to settle — never before it.
- **The numeric register is not optional.** Rule 33d in mathematics form: every state exposes a real
  number that changes as the picture changes — the slope readout, the running sum, the coordinate.
  A curve that moves under a caption with no number attached is decorative.
- **The equation surface (ONE per state, Rule 34b)** is the symbolic vertex earning its place: it
  appears only after its graphical story has played.

---

## 1. Archetype catalog

### A — Coordinate plane with a live function **[NEEDS-SCENARIO — `cartesian_plane`]**
Axes with a declared data range, numeric ticks and gridlines; `y = f(x)` plotted across the range and
re-evaluated live against slider values; a movable point with a coordinate readout.
- **Status:** the single most fundamental mathematics visual, and it does not exist. `drawAxes` is a
  free-body-diagram orientation indicator inherited from physics; `graph_interactive` cannot ship.
- **Blocks:** ranked-list P1 #1 (graph transformations), #2 (the derivative), #3 (the definite
  integral), P3 #11 (Argand plane), #12 (slope fields). This is why P0 exists.
- **Partial credit available today:** see archetype B — PCPL `locus_trace` already draws the *curve*
  correctly and live. What archetype A adds is the **frame** (scale, ticks, numbers, transform).
- **Signature beats:** set the frame → trace the curve → move one parameter → the family sweeps.

### B — Traced locus / parametric curve **[LIVE — verified 2026-08-04]**
A curve drawn out over the state clock from a defining condition, redrawing live when a parameter
changes.
- **Maps to:** `parametric` (PCPL) `locus_trace` (`parametric_renderer.ts:2356`) — takes `x_expr` /
  `y_expr`, samples them across the state clock, draws the path. Its sampler calls
  `PM_choreoVarsAtTime` (`:2311`), which merges **live slider values** under the drag-seize guard, so
  a slider drag redraws the whole curve. Capability 2 works today.
- **Caveats, both build-relevant:** (1) coordinates are **raw pixels** — until archetype A lands,
  every authored expression carries its own scale factor by hand, so declare the pixel↔math mapping
  once in the concept's `constraints` and reuse it verbatim in every expression; (2) the sweep
  parameter is **time**, so an `x` range is authored as a time-parameterised expression; (3)
  `PM_LOCUS_TRACE_MAX_SAMPLES` caps the sample count — check it before authoring a dense curve.
- **Serves:** conics as loci, the unit circle, spirals, cycloids, any "the condition draws the shape"
  beat.
- **Signature beats:** state the defining condition → trace it → change the constant → the shape
  morphs (parabola ↔ ellipse ↔ hyperbola).

### C — Rotation unrolled into a wave **[LIVE]**
A rotating radius on a circle, its projection carried horizontally to trace a sinusoid.
- **Maps to:** `parametric` — `body` with `position_expr` (the rotating point, the pen), `vector`
  (the radius), a dashed `vector` with `from_expr`/`to_expr` (the projection carrier),
  `locus_trace` (the unrolling wave), `angle_arc` (θ), canvas `slider` (θ), `formula_box`.
- **⚠ ERRATUM, corrected 2026-08-04 during the `unit_circle_to_sine_wave` build.** This row
  previously named `animated_path` as the projection carrier. It cannot be: `drawAnimatedPath`
  (`premium_primitives.ts:178`) resolves `from`/`to` ONCE through `PM_resolveEndpoint`, which accepts
  literals and anchors only — no expressions — so it cannot track a moving point. The live carrier is
  a dashed `vector` with `from_expr`/`to_expr`, verified consumed at `parametric_renderer.ts:2199-2211`
  via `PM_safeEvalPoint`. `animated_path` remains right for what it is: a one-shot draw-in between two
  STATIC endpoints (e.g. revealing the wave's axis).
- **The moving point is a `body` with `position_expr`,** not an arrowhead: `:1218-1222`, evaluated
  against `PM_liveExprVars()`, falling back to the authored position on a non-finite eval. It
  registers in `PM_bodyRegistry`, so `glow_focus` tracks it by id for free. Guard: a body using
  `position_expr` must declare NO `animation` and NO surface attachment — `:1218` gates on
  `!attachedPos && !(spec.id && PM_motionState[spec.id])`, and either one silently disables the
  expression.
- **Why it is a diamond and not a board sketch:** the *continuity* of the correspondence is the whole
  lesson, and a board can only show two or three frozen positions.
- **Reference target:** ranked-list P1 #4 — the recommended first mathematics concept.

### D — 3D vectors and their products **[NEEDS-SCENARIO — `vector_geometry_3d`]**
Two vectors in space, the angle between them, the cross product perpendicular to their plane, the
parallelogram whose area it measures.
- **⚠ RE-TIERED 2026-08-08 from `[LIVE — reuse, verified 2026-08-04]`.** That tag meant *somebody read
  the renderer and saw vector-looking symbols in it* — **not** that a concept had ever been built on
  it, and it is what scheduled this concept into a tier headed *"the cheapest available (no new
  engine)"*. Measured against `field_3d_renderer.ts` @ `dfca9cf`: **60 distinct hard-coded
  `scenario_type` names and not one generic two-vector scenario a JSON author can target**;
  `parallelogram` **0**; `parallelepiped` **0**. **And the old reuse number was a composite of unlike
  symbols:** the "193 occurrences of `crossProduct` / `PlaneGeometry` / `ArrowHelper`" is
  `ArrowHelper` **205** + `PlaneGeometry` **10** + `crossProduct` **0** — *there is no symbol called
  `crossProduct` in the file.* The archetype's arrow-drawing is genuinely reusable; its **wiring is
  not**. Full survey: `docs/MATHEMATICS_PHASE0_VECTORS_3D.md`.
- **Maps to:** `field_3d`, via a NEW `scenario_type` (`vector_geometry_3d`, `mode: "products"`),
  planned as dispatches VG-A/VG-B. Not buildable until it lands on master.
- **Free already, do not rebuild:** per-state `camera_position` with eased transition
  (`applyState:67195`, ungated), `ArrowHelper`, `applyGlowEmphasis`, `show_sliders`/`visible_controls`,
  the Rule-39f ⚙ widget auto-discovery.
- **Serves:** dot & cross product, vector projection, the scalar triple product as a volume.
- **The camera is the real cost, and it is solved — carry it, do not re-derive it.** No fixed pose
  works: `b` goes screen-collinear with `a×b` at exactly θ ≡ camera azimuth (mod 180°), and an
  exhaustive az × el search found **zero** feasible fixed poses. See the invariant under E.

### E — Lines and planes in space **[NEEDS-SCENARIO — shares D's purchase]**
A line through a point in a direction; a plane by point + normal; their intersection, the angle
between them, the shortest distance between skew lines.
- **⚠ RE-TIERED 2026-08-08 from `[LIVE — reuse]`,** same reason as D — proven by code-reading, never
  wired end to end.
- **Maps to:** the SAME new scenario as D (`vector_geometry_3d`, `mode: "lines_planes"`, dispatch
  VG-C). **A plane patch *is* the parallelogram quad translated, and the common perpendicular of two
  skew lines *is* `d₁ × d₂`** — which is why D and E are one engine purchase and must be surveyed
  together.
- **⚠ THE SKEW TRAP — an E-specific screen failure, and it has no in-plane remedy.** **Two skew lines
  ALWAYS project to intersecting lines.** Projection preserves non-intersection no better than it
  preserves perpendicularity, so the state whose entire lesson is *"these lines do not meet"* draws
  them meeting, at a pixel where the 3D lines are far apart.
- **THE SCREEN-TRUTH INVARIANT (governs D and E both, and any future 3D archetype):** *projection
  preserves neither angle, nor collinearity, nor intersection.* Therefore (1) the camera is scored
  **PAIRWISE** over every rendered pair, never per-object — a per-object foreshortening margin passes
  **vacuously** on the real `b`/`a×b` collinearity; (2) the camera azimuth (mod 180°) stays outside
  every angle range the state sweeps, and away from 0°/180°; (3) **every geometric claim —
  perpendicular, parallel, zero, equal, non-intersecting — carries a NUMERIC readout computed in 3D**,
  so the claim never rests on pixels. Related OPEN scar:
  `camera_metric_scored_foreshortening_not_pairwise_screen_separation`.
- **Curriculum note (Rule 38f):** strong CBSE/JEE/IB-HL, **absent from AP and IGCSE**. Build it
  deliberately for that audience, never by momentum.

### F — Sweep a region into a solid **[NEEDS-SCENARIO — a SEPARATE purchase from D/E]**
A plane region rotated about an axis, the solid sweeping out; disc and shell decomposition.
- **Maps to:** `field_3d` with a new revolution scenario. **`LatheGeometry` is NOT needed** — a disc
  stack is `CylinderGeometry`, of which the renderer already has 106 uses.
- **⚠ Measured OUT of D/E's purchase 2026-08-08, on two blockers, not on preference**
  (`MATHEMATICS_PHASE0_VECTORS_3D.md` §ledger 1):
  **(1) `field_3d` has ZERO expression evaluation** — no `safeEval`, no `*_expr`, no `new Function`;
  all 60 scenarios compute geometry from numeric parameters in hard-coded JS. A solid of revolution
  rotates an **authored** `y = f(x)`, so it needs either a **closed profile enum** (`line`,
  `parabola`, `sqrt`, `sin`, `reciprocal`, `circle_arc` with numeric coefficients — the
  `MG_MOLECULES` table pattern, cheap, and it covers every board's exercises) or a fleet-wide
  evaluator (a Rule-40 platform change across all 60 scenarios).
  **(2) It needs a ticked 2D coordinate frame beside the solid** so the region and the solid read
  together under Rule 33 — and that is **`cartesian_plane` on `parametric_renderer.ts`**, just bought
  across four dispatches. Rebuilding it inside `field_3d` is the exact duplicate Rule 40a exists to
  catch.
- Its overlap with D/E is the scenario shell only (5 of ~11 needs). **Schedule it as its own small
  Phase 0**, never as a rider on D/E.

### G — Many trials at once **[NEEDS-SCENARIO]**
A population of outcomes generated and binned live: a 1000-cell grid filling by category, a histogram
building from repeated samples, a random walk.
- **Maps to:** `particle_field`. `gas_box` is the nearest existing shape (a population of discs with
  per-species counts and a live histogram), but its physics is kinetic, not statistical.
- **⚠ Determinism constraint, non-negotiable:** THE EYE's `SET_TIME_FREEZE` must reproduce
  byte-identical pixels (Rules 26/36). **A `Math.random()` sampler breaks the frozen-baseline
  contract.** Required form is a seeded deterministic sequence — the same constraint the
  `bonding_scene` Phase-0 recorded against a molecular-dynamics integrator, and it must be settled
  before this scenario is designed, not discovered mid-build.
- **Serves:** conditional probability / base rates, the normal distribution, sampling and the CLT.

### H — Limit approach **[NEEDS-SCENARIO — rides on A]**
A quantity driven continuously toward a boundary it never reaches, with the value read live: a secant
becoming a tangent as `h → 0`, a Riemann sum converging as `n → ∞`, a sequence approaching its limit.
- **Maps to:** `cartesian_plane` (archetype A) plus a driven parameter.
- **Why it is the strongest mathematics diamond class:** it is Capability 2 *and* 4 at once. The
  student's intuition is that "approaching" and "reaching" are the same; only watching the gap shrink
  while the value settles separates them.
- **Rule 32a obligation:** the CAUSE (h shrinking) moves visibly first; the EFFECT (the slope readout
  settling) responds after a readable beat. Never simultaneous.

### I — Build-up / accumulation **[NEEDS-SCENARIO — rides on A]**
A quantity accumulating across the domain with a running total: area filling left-to-right under a
curve, the antiderivative drawn as the accumulation function.
- **Maps to:** `cartesian_plane` shaded-region support + a live sum readout.

---

## 2. Motion archetypes (Rule 31b vocabulary, mathematics dialect)

Every state DECLARES one archetype plus a one-line delta. The physics seed vocabulary
(`CLAUDE_RULES.md` Rule 31b) applies; these are the mathematics-native additions the architect may
cite without a fresh justification:

`parameter-sweep` (one constant driven across its range, the object responding continuously) ·
`limit-approach` (a quantity driven toward a boundary it never reaches) ·
`accumulate` (a running total building across the domain) ·
`refine` (a partition or approximation getting finer, n → larger) ·
`trace-locus` (a curve drawn out from its defining condition) ·
`unroll` (a rotation carried into a linear plot) ·
`rotate-to-reveal` (a 3D camera or object turn that exposes structure a fixed view hides) ·
`decompose` (an object split into the pieces a formula sums) ·
`drag-sandbox` (reserved for the final explore state).

**No two guided states share an archetype**, except a declared contrast pair whose delta names the
flip. The chemistry lesson applies verbatim: *an archetype is a claim about RHYTHM, not a label* —
two states animating the same element count are the same motion unless their per-element timing
differs.

---

## 3. Sources — mathematics roles (Rule 35 discipline unchanged)

- **NCERT Mathematics** = the syllabus backbone — coverage + sequencing, chapter indexes ONLY.
- **NCERT Exemplar** = misconception *belief* source (which wrong beliefs are common) — belief only,
  never prose, figures, or problem text.
- **International specifications** (IB subject guide, AP Course & Exam Description, Cambridge
  syllabus, A-level specification) = **scope and coverage claims ONLY**, for `curriculum_tags`.
  Never a teaching sequence, never an example, never a figure.
- **HC Verma and DC Pandey are physics-only** and do not apply to mathematics.
- Teaching method, examples, anchors, phrasing: **authored from first principles.** Real-world
  anchors are UNIVERSAL (Rule 35).
- Required **source check line** in the author's self-review: *"Consulted NCERT chapter index and the
  named international specifications for scope only. No teaching method, no example problem, no
  figure imported."*

---

## 4. Mathematics-specific authoring hazards (seeded from the sibling subjects' scars)

Recorded up front because each has already cost a session in physics or chemistry:

1. **A curve drawn on `[a, b]` under a caption saying "for all x".** The mathematics analogue of a
   visual that violates conservation: locally true, globally false. Every displayed relation carries
   its domain in the author's ledger, and the caption never over-claims beyond the drawn interval.
2. **A silent identity fallback.** `os.orbital || "1s"` activated a hydrogen swarm through every
   molecular orbital in `sigma_pi_bonding` because a valid default is more dangerous than one that
   throws. In mathematics the equivalent is a default domain or a default range silently substituting
   for an unset one.
3. **An authored field that no-ops.** Nine `orbital_shapes.mode` strings were decoration; three
   states were byte-static under captions describing motion. Verify the renderer actually reads every
   field you author.
4. **Two instruments for one quantity will eventually disagree.** A slider printing `S/S₀ = 1.000`
   while the HUD read `0.000` in the same frame, on the primary-aha state. One quantity, one readout.
5. **`deriveStateMeta` is blind to `scene_composition` `at_ms`**, so a frozen baseline can be pinned
   before its own labels appear. Author `eye_capture_ms` on any state whose lesson lands late.
6. **A backtick inside a JS comment terminates the enclosing TS template literal** — hit twice in one
   chemistry session. `npm run check:renderer-backticks` exists for exactly this; run it on every
   renderer edit.
7. **Pixel-coordinate scale factors (archetype B).** Until `cartesian_plane` lands, a PCPL mathematics
   concept hand-carries its data↔pixel mapping in every expression. Declare it once in `constraints`
   and never re-derive it inline — a mismatched factor between two expressions is invisible to every
   gate and wrong on screen.

*(Hazards 8–11 added 2026-08-04 from the `unit_circle_to_sine_wave` Checkpoint-A gate — all four were
caught at DESIGN time, before any JSON existed, and each produces a file that passes the validator,
`tsc` and THE EYE while being wrong. Scar rows filed; see `engine_bug_queue`.)*

8. **THE φ LAW — a `locus_trace`'s sweep parameter must NEVER be a slider variable in the same state.**
   `PM_choreoVarsAtTime` merges the live slider value into **every historical sample** of the trace
   (`parametric_renderer.ts:2321-2325`) and then skips choreography for any seized variable (`:2329`).
   So the instant a teacher drags that slider, all N samples evaluate at one parameter value and the
   curve **collapses to a point and disappears**. If the variable is a slider and never choreographed,
   the curve never draws at all. Author traces on a dedicated sweep variable (`phi`) that is never
   exposed as a slider anywhere; teacher-facing sliders drive markers, segments and readouts through
   the live expression path instead. Scar:
   `pcpl_locus_trace_sweep_parameter_exposed_as_a_slider_collapses_the_curve` (CRITICAL).
   *(2026-08-06: the φ LAW is now MACHINE-ENFORCED — Gate 9(d)
   `locus_trace_sweep_parameter_is_a_slider`, FATAL, runs in both `validate:concepts` and
   `validate:mathematics`. The law above remains the design rule; the gate catches the violation.)*
9. **Circles and arcs at a live radius — [LIVE] as of 2026-08-06** (`body.size_expr` +
   `angle_arc.radius_expr`, commit `cbb31fb`; scar
   `pcpl_no_primitive_draws_a_circle_or_arc_at_a_live_radius` FIXED). Radius/amplitude-scaling
   lessons are now buildable: author `size_expr` (string form for a circle's diameter, `{w,h}` form
   for a rect, mirroring the authored `size`'s own shape) or `radius_expr` on an angle_arc — same
   `PM_liveExprVars` scope as `position_expr`, opt-in, non-finite/shape-mismatch falls back to the
   authored literal. Verified live: `src/scripts/_verify_size_expr_probe.ts` (circle 40→90 px under
   PARAM_UPDATE; malformed expression stays put). The OLD trap still holds for the OLD workaround:
   NEVER trace a circle under a ramping radius via `locus_trace` (history accumulates → spiral,
   `field3d_orbit_spiral_on_radius_ramp`) — use `size_expr`, that is what it is for.
12. **Object-anchored text — a `label` CAN track a moving object as of 2026-08-06**
    (`label.position_expr`, commit `b99e927`; scar
    `pcpl_drawlabel_has_no_position_expr_so_object_anchored_text_cannot_track` FIXED). Precedence:
    a finite `position_expr` beats the de-overlap solver's slot beats the literal `position` (the
    solver cannot see expression-driven geometry, so its slot is stale the instant the variable
    moves). Verified: `src/scripts/_verify_label_position_expr_probe.ts`. **`annotation` primitives
    still CANNOT track** — `drawAnnotation` carries the identical gap, OPEN as
    `pcpl_drawannotation_has_no_position_expr_so_a_callout_cannot_track`; a callout naming a moving
    object stays fixed-position text (or rides the owning primitive's own label field) until that
    row closes.
10. **Cause-before-effect (Rule 32a) by staggering the drivers of two quantities you claim are EQUAL
    draws the equality false.** `PM_choreoValue` returns `from` before `start_ms` (`:1110`), so a later
    `start_ms` is an *angular head start*, not a reveal delay — the two elements stay permanently
    offset and the connector between them joins two different values for the rest of the state. In a
    correspondence state, satisfy 32a by **reveal order** (the new element appears first, both drivers
    held), never by staggering. Corollary, and the wider lesson: **a per-state timing table with
    sub-beat boundaries is a defect detector, not paperwork** — this hazard and hazard 11 were both
    invisible until one existed.
11. **A ring cut is discharged by RING ASSIGNMENT, never by a field.** `min_ring` reads well and does
    nothing: it exists only in `field_3d_renderer.ts:55484-55492` and is inert even there (its own
    comment defers to a "Rule-38h preset builder" that does not exist anywhere in the product). Before
    citing ANY authored field as a mechanism in a gate verdict, grep the *target* renderer and the
    schema for it and quote the reader by file:line — presence in a sibling renderer is not presence
    in yours. Related: check every formula surface against the HUD metric of the symbols it names —
    an identity asserted in radians above a degrees-only readout renders itself false by 57.3×.
