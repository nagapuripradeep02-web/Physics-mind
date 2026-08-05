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
- **Maps to:** `parametric` — `body` (the circle, the rotating point), `vector` (the radius),
  `animated_path` (the projection carrier), `locus_trace` (the unrolling wave), `angle_arc` (θ),
  canvas `slider` (θ or ω), `formula_box`.
- **Why it is a diamond and not a board sketch:** the *continuity* of the correspondence is the whole
  lesson, and a board can only show two or three frozen positions.
- **Reference target:** ranked-list P1 #4 — the recommended first mathematics concept.

### D — 3D vectors and their products **[LIVE — reuse, verified 2026-08-04]**
Two vectors in space, the angle between them, the cross product perpendicular to their plane, the
parallelogram whose area it measures.
- **Maps to:** `field_3d`. The machinery is already there for magnetism — 193 occurrences of
  `crossProduct` / `PlaneGeometry` / `ArrowHelper` in `field_3d_renderer.ts`. Rule 40a sweep found
  0 hits for `vectorTriad`, so nothing is being built twice, but **run the sweep again before adding
  any mechanism** — the reuse is the point.
- **Serves:** dot & cross product, vector projection, the scalar triple product as a volume.

### E — Lines and planes in space **[LIVE — reuse]**
A line through a point in a direction; a plane by point + normal; their intersection, the angle
between them, the shortest distance between skew lines.
- **Maps to:** `field_3d`, same machinery as D. Camera work is the real cost — a solved home pose per
  state, per the hybridisation lesson (an unsolved camera foreshortened an sp³ lobe to *exactly*
  0.000 under a caption counting four).
- **Curriculum note (Rule 38f):** strong CBSE/JEE/IB-HL, **absent from AP and IGCSE**. Build it
  deliberately for that audience, never by momentum.

### F — Sweep a region into a solid **[NEEDS-SCENARIO]**
A plane region rotated about an axis, the solid sweeping out; disc and shell decomposition.
- **Maps to:** `field_3d` with a new lathe/revolution scenario. `LatheGeometry` is standard Three.js,
  so this is a case, not a file — but it is unbuilt and must not be scheduled before it lands.

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
