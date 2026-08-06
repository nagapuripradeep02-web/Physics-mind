# Phase 0 — `cartesian_plane` (the engine gate in front of every P1 mathematics diamond)

**Status: 0a COMPLETE · **0b COMPLETE + Checkpoint A cycle 0 (`DESIGN_FIX`, applied)** · 0c NOT DISPATCHED · 0d BLOCKED on 0c.**

> ### ⚠ AMENDMENT 1 — 2026-08-06, from 0b + Checkpoint A. **The contract below is the amended one; CP-A…CP-D dispatch from this version.**
> Designing the spec driver (`docs/skeletons/definite_integral_as_accumulated_area_skeleton.md`) and putting it through the design gate changed the purchase order. **Nine deltas plus one, against the six this document originally carried:**
> **ADDED** — `function_plot.x_domain.min_expr/max_expr` · `riemann_bars.color` · `riemann_bars.signed` + `color_positive`/`color_negative` (field names copied verbatim from `region_fill`) · `riemann_bars.render` · `riemann_bars.opacity` + a declared draw order · `riemann_bars.reveal_stagger_ms` · `riemann_bars.show_partition`.
> **REPLACED** — `riemann_bars.readout` is gone; the primitive **publishes** its sum and its drawn count into the live variable scope (`sum_var`, `bars_drawn_var`) and draws no text. See **D11**, which is the resolution of the design's largest recorded risk.
> **REVERSED** — `trapezoid` stays in the `mode` enum (0b proposed dropping it; the gate table below already asserts it, and three claimed boards examine the trapezium rule by name).
> **Three of these came from a walk this document did not run**: the 0a union walk recorded each state's *new* capability rather than every capability co-present in it, so composition questions — what colour is a rectangle, what happens when a fill and a partition occupy one interval — were never asked. That correction is why `color`, signed colour and draw order exist as fields at all.

Doctrine: `docs/AUTHORING_PIPELINE.md` §0 · model: `docs/CHEMISTRY_PHASE0_BONDING.md` ·
mandate: `docs/MATHEMATICS_DISCUSSIONS.md` §6 (P0) + §7 open item 4 ·
phase mechanics: `docs/MATHEMATICS_BUILD_PLAN.md` Phase P0.
Runs ONCE for the graphing half of mathematics, **before any concept desk opens**.

> **The one-line result.** The five graph-bound concepts need **ONE new primitive family on
> `parametric_renderer.ts`** — a `cartesian_plane` frame that owns a data↔pixel transform, plus four
> marks that resolve through it. It is a **new CASE, not a new file** and **not a new renderer**. It
> lands on master in **four sequenced `pcpl-surgeon` dispatches**, after which concepts #1, #2, #3 and
> #11 are **pure JSON with zero renderer edits**. #12 (slope fields) is deliberately **out of scope**
> and ledgered.

> **Second result, and it changes the shape of the build.** The frame must not be a private playground
> for new primitives. Existing PCPL primitives (`body`, `vector`, `label`, `locus_trace`) opt into the
> plane by naming `plane_id`, after which their authored coordinates are **data**, not pixels. That is
> what removes the hand-carried scale factors measured in §0a.3 — and it is additive and inert when
> `plane_id` is absent, which is the safety argument the fleet needs.

---

## 0a — SURVEY

### The concepts this engine must serve

Five, from the ranked list (`MATHEMATICS_DISCUSSIONS.md` §6). Breadth and capability numbers are
carried from §4 there and are **not re-derived** here; what is added is the *engine* consequence.

| # | Concept | Rank | Breadth | Cap. | The engine sentence |
|---|---|---|---|---|---|
| 1 | **Graph transformations** `y = a·f(b(x−h))+k` | P1 | 7/7 | 2 | Two curves on one frame — parent ghost + live transform — redrawn on every drag of four sliders |
| 2 | **Derivative as the limit of a secant slope** | P1 | 7/7 | 2, 4 | A chord between two curve points whose separation shrinks continuously, with the slope read as a real number |
| 3 | **Definite integral as accumulated area** | P1 | 6.5/7 | 1, 2, 4 | n rectangles under a curve, n swept 4 → 1000, the sum converging on screen |
| 11 | **Complex numbers & the Argand plane** | P3 | 4/7 | 2 | A plane with **equal scale on both axes**, a movable point, and a vector from the origin |
| 12 | **Differential equations & slope fields** | P3 | 5/7 | 2 | A grid of short segments at slope `g(x, y)` — **the one need this build does not meet (§ledger)** |

**Curriculum reach — Rule 38g CLAIMS, not facts.** Carried verbatim from `MATHEMATICS_DISCUSSIONS.md`
§4; every non-CBSE cell ships `needs_teacher_verification: true` and no preset is teacher-visible
until a teacher of that board confirms it. The standing gap is unchanged and this wave enlarges it:
**ten chemistry concepts deep, not one international cell has ever been teacher-confirmed.**

| # | CBSE | ICSE | JEE | IB DP | AP | IGCSE | A-lvl |
|---|---|---|---|---|---|---|---|
| 1 | F | F | P | F | F (Precalc) | F (0606) | F |
| 2 | F | F | F | F | F (Calc AB/BC) | F (0606) | F |
| 3 | F | F | F | F | F (Calc AB/BC) | P (0606) | F |
| 11 | F | F | F | F (HL) | — | — | P (FM) |
| 12 | F | P | P | F (HL) | F (Calc BC) | — | F |

---

### The FIRST question: does an existing family stretch?

The cheapest Phase 0 is the one you discover you don't need, so this was measured against the live
tree (2026-08-06, `master` @ `9517cf4`) before any design was drawn.

**Candidate A — `graph_interactive_renderer.ts` (504 lines, Plotly). REJECTED: unreachable.**
It is a genuine Cartesian plotter (`range`, `tickfont`, `makeEvaluator(expr)`, slider-bound
annotations). **Re-verified independently this session, not taken on the §3a report:** `grep -n
"panel_b" src/scripts/build_review_site.ts` returns **zero hits** — the teacher surface has no
panel-B branch at all — while **46 of 150 flat concept files** author
`renderer_pair.panel_b === "graph_interactive"`. (§3a of DISCUSSIONS says 48; the difference is
counting method — 46 is the exact `panel_b` field match, and both numbers say the same thing.) A
renderer the product cannot mount cannot carry a mathematics concept. This remains a **pre-existing
physics scar and a founder call**, unchanged by this document.

**Candidate B — `particle_field_renderer.ts` `drawVIGraph` (`:6425`). REJECTED as a surface, ACCEPTED
as a pattern.** This is the fleet's proof that the transform is small and already understood: it
builds `toX(i)` / `toY(v)` closures over a padded rect, draws two axis lines with titles, samples a
curve at N=48 and paints an operating point. But it is **bolted to the circuit scenario** (ranges
derived from `sliderDefs()`, curve from `ohmicCurrentAt`), it is a fixed 244×178 inset at one corner,
and — decisively for mathematics — **it has no tick marks and no numbers along either axis.** It also
lives in the wrong renderer: `particle_field` is the Ch.3 circuit engine. Reuse the *shape* of its
transform in CP-A; do not reuse the code (different template, different renderer).

**Candidate C — PCPL (`parametric_renderer.ts`, 4160 lines). ACCEPTED — it has the marks and lacks
the frame.** Measured:

- ✅ `locus_trace` (`:2445`) traces an arbitrary parametric curve and re-samples through
  `PM_choreoVarsAtTime` (`:2400`), which merges live slider values under the drag-seize guard. Drag a
  slider → the curve redraws. Capability 2 is live today.
- ✅ `body.position_expr`, `vector.from_expr/to_expr`, `angle_arc.angle_value_expr`,
  `label.text_expr` all evaluate through `PM_safeEval` / `PM_interpolate` against
  `PM_liveExprVars()`, so every mark can already be a function of the live variables.
- ✅ `PM_animationGate` (`:771`) + `PM_focalEmphasis` (`:816`) give reveal timing and Rule-29/32e
  emphasis to any primitive that asks.
- ✅ Deterministic under `SET_TIME_FREEZE` by construction (`draw()` catch-up, `:3717`), which is
  what makes H2 baselines byte-stable.
- ❌ **`drawAxes` (`:2764`) is not a graph.** Read in full: two arrows of a fixed pixel `length` with
  a label at each tip. No gridlines, no ticks, no numeric scale, **no data↔pixel transform**. It is a
  free-body-diagram orientation indicator inherited from physics.

**Verdict: no family stretches to the frame. Build the frame in PCPL, as a new case.**

---

### <a id="cost"></a>The cost of not having it — measured on a shipped file, not asserted

`src/data/concepts/mathematics/unit_circle_to_sine_wave.json` is the fleet's only mathematics
concept, and it is *not* one of the five graphing concepts. It still paid the whole tax:

| Measurement | Value |
|---|---|
| Primitives across its 8 states | **192** |
| Primitives that are hand-built axis furniture (ticks, tick labels, axis lines) | **71 — 37.0 %** |
| Occurrences of the baked-in origin literals `150` / `230` | **99 / 130** |
| Occurrences of the baked-in scale literal `110` (px per unit) | **79** |
| Inline `PI/180` degree→radian conversions inside authored expressions | **96** |
| `*_expr` fields carrying hand-computed geometry | **98** |

Concretely, its π-axis ticks are five `animated_path` primitives at hand-computed x = 300, 372.3,
444.5, 516.8, 589.0 (i.e. `300 + 46·(π/2)·k`, solved by the author), each with a hand-placed label
below it; its sine curve is `x_expr: "300 + 46*phi*PI/180"`, `y_expr: "230 - 110*sin(phi*PI/180)"`.

**The reading:** on a concept whose lesson is not even graphing, **more than a third of the authored
scene is a coordinate frame drawn by hand**, and the origin and scale are copied into ~200 places
where a single wrong digit is invisible to `tsc`, to the validator, and to THE EYE. Concepts #1/#2/#3
are strictly harder — a curve there must move on every drag, so the hand-carried scale factor is not
merely tedious, it is **the** correctness surface. This is the measured justification for P0.

---

### <a id="union"></a>The union of engine needs

Derived from state sketches for all five concepts (§walk below). **F-rows are features; a ✓ means at
least one designed state consumes it.**

| Feature | #1 | #2 | #3 | #11 | #12 | Dispatch |
|---|---|---|---|---|---|---|
| **F1** Frame: viewport rect + `x_range`/`y_range` + data↔pixel transform | ✓ | ✓ | ✓ | ✓ | ✓ | CP-A |
| **F2** Axis lines with an origin that is *inside* the frame when the range straddles 0 | ✓ | ✓ | ✓ | ✓ | ✓ | CP-A |
| **F3** Numeric ticks + tick labels, authored step, decimal **or π-multiple** label mode | ✓ | ✓ | ✓ | ✓ | ✓ | CP-A |
| **F4** Gridlines (opt-in, dim, behind everything) | ✓ | ✓ | ✓ | ✓ | ✓ | CP-A |
| **F5** `equal_scale` — identical px/unit on both axes (a circle must not read as an ellipse) | — | — | — | ✓ | — | CP-A |
| **F6** Axis titles + a quadrant-safe label placement that never lands on the slider band | ✓ | ✓ | ✓ | ✓ | ✓ | CP-A |
| **F7** `plane_id` opt-in for existing primitives (`body`, `vector`, `label`, `locus_trace`) | ✓ | ✓ | ✓ | ✓ | ✓ | CP-A |
| **F8** `function_plot` — sample `y_expr` across the **x-domain** every frame, live vars | ✓ | ✓ | ✓ | — | ✓ | CP-B |
| **F9** Break the polyline at non-finite values and at range exits (no fake asymptote, no silent clamp) | ✓ | ✓ | ✓ | — | — | CP-B |
| **F10** Two or more plots on one frame (parent ghost vs transform; f vs f′) | ✓ | ✓ | — | — | ✓ | CP-B (composition only — no extra code) |
| **F11** `plot_point` — a point at (x_expr, y_expr) in data coords with a live coordinate readout | ✓ | ✓ | ✓ | ✓ | — | CP-B |
| **F12** `plot_point` **draggable**, seizing a bound variable through the existing drag-seize path | — | ✓ | ✓ | ✓ | — | CP-B |
| **F13** `secant_line` through two curve points, extended to the frame edge, with a live slope readout | — | ✓ | — | — | — | CP-D |
| **F14** `tangent_line` at one point from a declared slope expression | — | ✓ | — | — | ✓ | CP-D |
| **F15** `region_fill` between a curve and the x-axis over `[a, b]`, **signed** (two colours) | — | — | ✓ | — | — | CP-C |
| **F16** `riemann_bars` — n rectangles, `left`/`right`/`midpoint`/`trapezoid`, a **published** sum + drawn count, signed colour, a drawn partition, staggered reveal | — | — | ✓ | — | — | CP-C |
| **F17** An accumulated quantity traced as a swept bound moves (A(b), f′ as P moves) | — | ✓ | ✓ | — | — | none — `locus_trace` + F7 |
| **F18** Slope-field grid of segments at `g(x, y)` | — | — | — | — | ✓ | **NOT BUILT — §ledger** |

**Two rows earn their place by removing work rather than adding it.** F10 and F17 are satisfied by
*composition* — two `function_plot` primitives, and the existing `locus_trace` once it can read data
coordinates (F7). Neither gets renderer code. Stating that here is the point of a union table: it is
as much a list of what NOT to build.

---

### <a id="walk"></a>The union WALK

The chemistry precedent's most expensive lesson was that a union table *asserted* rather than walked
state-by-state missed seven designed states consuming capabilities the union did not list
(`CHEMISTRY_PHASE0_BONDING.md`, Checkpoint A cycle 1). So the sketches below exist to be walked
against the table — **every state names the features it consumes, and no state may name one that is
not an F-row.**

> ⚠ These are **survey-altitude sketches, not skeletons.** State counts stay complexity-driven
> (Rule 11) and are the architect's call in 0b. The walk's job here is coverage, not pedagogy.

**#1 Graph transformations** — 8 sketched states.
S1 parent curve on the frame `F1–F4,F6,F8`; S2 vertical shift k, parent kept as a dim ghost
`F8,F10`; S3 horizontal shift h — **the misconception beat** (`x−h` moves the curve *right*),
Rule 16a `F8,F10`; S4 vertical stretch a, with a<0 as the reflection `F8,F10`; S5 horizontal stretch
b and the `1/b` surprise `F8,F10`; S6 inside-vs-outside order `F8,F10`; S7 one named point mapped
`(x₀, f(x₀)) → (x₀/b + h, a·f(x₀) + k)` with both points labelled numerically `F11`; S8 explore, all
four sliders `F8,F10,F11`. **Consumes: F1,F2,F3,F4,F6,F7,F8,F9,F10,F11. In the set.**

**#2 Derivative as the limit of a secant slope** — 9 sketched states.
S1 curve + fixed point P `F1–F4,F8,F11`; S2 second point Q at separation h, chord drawn, slope
readout `Δy/Δx` `F13`; S3 h shrinks continuously under choreography — the chord rotates, the readout
counts down `F13`; S4 **approaching is not reaching** (the defect class the eye_walker mathematics
addendum names): h small, never 0, the quotient at h=0 shown as undefined `F13`; S5 the tangent as
the limiting line `F14`; S6 slope at a different P — drag P along the curve `F12,F14`; S7 the
derivative as a NEW function: f′ traced as P sweeps `F17` (`locus_trace` + F7); S8 f and f′ on one
frame `F10`; S9 explore `F8,F11,F12,F13,F14`. **Consumes: F1–F4,F6,F7,F8,F9,F10,F11,F12,F13,F14,F17.
In the set.**

**#3 Definite integral as accumulated area** — 9 sketched states.
S1 curve + shaded region over `[a,b]` `F15`; S2 n = 4 left rectangles, over/undershoot visible, live
sum `F16`; S3 n swept 4 → 1000, the sum converging `F16`; S4 left vs right as a declared contrast
pair bracketing the value `F16`; S5 midpoint/trapezoid `F16`; S6 signed area below the axis — the
counterintuitive beat `F15`; S7 movable bound b `F12`; S8 A(b) traced as b sweeps — the FTC seed
`F17`; S9 explore `F8,F12,F15,F16`. **Consumes: F1–F4,F6,F7,F8,F9,F11,F12,F15,F16,F17. In the set.**

**#11 Complex numbers & the Argand plane** — sketched at 7.
Frame with `equal_scale` `F5`; z as a movable point with a vector from the origin `F11,F12,F7`;
`arg z` on an `angle_arc` and `|z|` as a label — both existing primitives via F7; multiplication as
rotation + scale = three plot_points bound by expressions `F11`. **Consumes: F1–F7,F11,F12. In the
set, and it needs no F8 at all** — which is the useful finding: the frame alone carries a whole
concept.

**#12 Differential equations & slope fields** — sketched at 7.
Frame + solution curves `F1–F4,F8`; a particular solution through a movable initial condition
`F11,F12`; the tangent at a point `F14`; **and the field itself `F18`, which this build does not
provide.** #12 is therefore **not** unblocked by P0 — declared, not discovered (§ledger).

**Walk result: 17 of 18 features are consumed by at least one sketched state; every sketched state's
needs are inside the set except #12's F18, which is deliberately excluded.** The reverse check — no
feature exists that no state uses — passes: F5 is used only by #11 and F13/F14 only by #2, and both
are kept because their concept is on the ranked list, not because they are nice to have.

**0b must re-run this walk against a real skeleton.** Sketches are not skeletons, and the chemistry
precedent is explicit about the difference.

---

## The engine decision — ONE primitive family, four dispatches

`cartesian_plane` is **a primitive family on `parametric_renderer.ts`**, not a `scenario_type`. PCPL
has no scenario dispatch (its only `scenario_type` is a *variable* inside
`computePhysics_normal_reaction`, `:251`); the renderer is primitive-driven, and the frame is a
primitive that registers a transform other primitives resolve against — structurally identical to
how `drawSurface` populates `PM_surfaceRegistry` in Pass 0 and bodies resolve `attach_to_surface`
against it. **Nothing new is invented; an existing pattern is instanced.**

### <a id="contract"></a>Config contract (the authoritative shape `json_author` will target)

> ⚠ Per `AUTHORING_PIPELINE.md` §0c, **the dispatch REPORT's closed enums supersede this draft.**
> This is the contract the surgeon is asked to build, not the contract until they report.

```jsonc
// F1–F7 — the frame. One per state (more than one is legal; ids must be unique).
{
  "type": "cartesian_plane",
  "id": "plane",                       // REQUIRED — the plane_id other primitives name
  "viewport": { "x": 70, "y": 78, "w": 660, "h": 372 },   // px; default = this rect (§D10)
  "x_range": { "min": -6.5, "max": 6.5 },
  "y_range": { "min": -4, "max": 4 },
  "equal_scale": false,                // F5 — true shrinks the longer axis's px extent about the viewport centre
  "x_tick": 1, "y_tick": 1,            // data-units per tick; 0 = no ticks
  "x_tick_labels": "number",           // "number" | "pi" | "none"   (F3)
  "y_tick_labels": "number",
  "tick_decimals": 0,                  // fixed precision for tick text (never inherits the slider formatter, §D8)
  "gridlines": true,                   // F4
  "x_label": "x", "y_label": "y",      // F6
  "color": "#94A3B8", "grid_color": "#1E293B",
  "appear_at_ms": 0, "animate_in_ms": 0 // PM_animationGate (§D6)
}

// F8–F10 — a curve. Sampled across the DOMAIN, not the clock (§D3).
{
  "type": "function_plot", "id": "parent", "plane_id": "plane",
  "y_expr": "sin(x)",                  // 'x' is bound by the sampler; every other name from PM_liveExprVars()
  // AMENDMENT 1 — min_expr/max_expr added. A plot whose domain end is a VARIABLE is
  // how a curve draws itself left-to-right (the reveal gate only fades, and a fade is
  // not a motion — Rule 31 bans a static state), and it is also how a plot stays inside
  // the frame when a teacher control extends the drawn interval. Numbers stay legal.
  // Authoring the domain is the DEFAULT, not the exception: leaving it to the plane's
  // x_range is what let the spec driver's curve exit the frame top on every state.
  "x_domain": { "min": 0, "max_expr": "b" },  // or {min,max} numbers; defaults to the plane's x_range
  "samples": 240,                      // closed range 40..480; default 240 (§D3)
  "color": "#38BDF8", "stroke_weight": 3, "style": "solid",  // "solid" | "dashed" | "ghost"
  "appear_at_ms": 0, "animate_in_ms": 0, "focal_id": "parent"
}

// F11–F12 — a point, optionally draggable, with a real readout (Rule 33d).
{
  "type": "plot_point", "id": "P", "plane_id": "plane",
  "x_expr": "x0", "y_expr": "sin(x0)",
  "drag": { "bind_variable": "x0", "axis": "x", "min": -6.5, "max": 6.5 },  // omit = static
  "readout": { "format": "P = ({x}, {y})", "decimals": 2, "offset": { "x": 10, "y": -12 } },
  "size": 12, "color": "#FBBF24"
}

// F13–F14 — chord and tangent.
{
  "type": "secant_line", "id": "sec", "plane_id": "plane",
  "from_expr": { "x": "x0", "y": "f0" }, "to_expr": { "x": "x0 + h", "y": "f1" },
  "extend": "frame",                   // "segment" | "frame"
  "readout": { "format": "slope = {m}", "decimals": 3 },
  "color": "#F472B6"
}
{ "type": "tangent_line", "id": "tan", "plane_id": "plane",
  "at_expr": { "x": "x0", "y": "f0" }, "slope_expr": "cos(x0)", "extend": "frame" }

// F15 — signed region.
{ "type": "region_fill", "id": "area", "plane_id": "plane",
  "y_expr": "sin(x)", "from_expr": "a", "to_expr": "b",
  "baseline": 0, "signed": true,
  "color_positive": "#22D3EE", "color_negative": "#F87171", "opacity": 0.28 }

// F16 — the partition. AMENDMENT 1 rewrote this object; every added field is
// mapped to the state that forced it in the spec driver's §13c.
{ "type": "riemann_bars", "id": "bars", "plane_id": "plane",
  "y_expr": "x*x - c", "from_expr": "0", "to_expr": "b",
  "n_expr": "round(pow(10, nlog))",    // an EXPRESSION, so n is animated by animating a variable
  "mode": "left",                      // "left" | "right" | "midpoint" | "trapezoid"  (trapezoid KEPT)
  "max_bars_drawn": 400,               // §D7 — above this the rectangles fuse into the region fill

  // ── it PUBLISHES, it does not print (§D11) ──────────────────────────────
  "sum_var": "S_n",                    // the sum, computed once in the loop that places the rectangles
  "bars_drawn_var": "n_drawn",         // how many were actually drawn; differs from n above the cap

  // ── appearance + composition (§D12) ────────────────────────────────────
  "color": "#22D3EE",
  "signed": true,                      // field NAMES copied verbatim from region_fill — one concept,
  "color_positive": "#22D3EE",         // one name. Two names in one family is how a shared engine
  "color_negative": "#F87171",         // build ends up with two semantics for one bought field.
  "render": "filled",                  // "filled" | "outline" — three co-present sets need outlines
  "opacity": 1.0,                      // rectangles draw AFTER region_fill and are opaque by default
  "show_partition": true,              // draw the n−1 division lines: a ZERO-HEIGHT rectangle is
                                       // otherwise invisible, so "four rectangles" renders as three
  "appear_at_ms": 1200,
  "reveal_stagger_ms": 3500 }          // rectangle i's gate opens at appear_at_ms + i × stagger
```

**Draw order, declared rather than left to array position (§D12):** within the primitive pass,
`cartesian_plane` → `region_fill` → `riemann_bars` → `function_plot` → `secant_line`/`tangent_line` →
`plot_point` → labels. A partition drawn *under* its own region fill composites into a band with no
readable boundary, and the "missed sliver above each rectangle" reading — the whole point of a
first-partition state — depends on this order.

### <a id="decisions"></a>Twelve engine decisions — made now, not discovered later *(D11–D12 added by AMENDMENT 1)*

**D1 · The transform lives in a registry, not in each primitive.** `drawCartesianPlane` runs in a new
**Pass 0.25** (after surfaces, before bodies) and writes `PM_planeRegistry[id] = { toPx(x,y),
toData(px,py), viewport, xRange, yRange }`. Every consumer resolves through
`PM_planeResolve(spec, x, y)`. One transform, one place, testable in node without a browser.

**D2 · `equal_scale` shrinks, never grows.** With `equal_scale: true` the engine takes
`k = min(w/Δx, h/Δy)` and centres the resulting smaller rect inside the authored viewport. Growing
the viewport instead would silently invade the slider band and the caption zone (Rule 34d). #11's
circles and rotations are the reason this exists; it must be a declared flag, never inferred.

**D3 · A function plot is NOT a `locus_trace`, and reusing one would ship a CRITICAL defect.**
`locus_trace` samples over **time** (`start_ms → min(now, end_ms)`) and each sample calls
`PM_choreoVarsAtTime`, which merges the **live slider value** into every historical sample. The
recorded scar `pcpl_locus_trace_sweep_parameter_exposed_as_a_slider_collapses_the_curve`
(CRITICAL/OPEN) is exactly that: a trace parameterised on a slider variable collapses to a point on
the first drag. Concept #1's parameters `a, b, h, k` **are** sliders. So `function_plot` samples over
the **x-domain**, every frame, against `PM_liveExprVars()`, with `x` bound by the sampler and never
read from the variable scope. Time-swept accumulation (F17) stays `locus_trace`'s job — the two
primitives answer two different questions and must not be merged.

**D4 · Discontinuities break the line; they are never drawn and never clamped.** A sample that is
non-finite, or whose y leaves `y_range`, **ends the current polyline** and starts a new one at the
next in-range sample. `tan x` must not sprout a vertical line at π/2, and `1/x` must not be flattened
onto the frame edge. This is a mathematics-correctness requirement, not a cosmetic one: it is the
`mathematics_author` domain-and-validity ledger made mechanical, and the gate carries a negative
control for it.

**D5 · Ticks are authored, never auto-"nice".** `x_tick` is a data step and `x_tick_labels` is a
closed enum `number | pi | none`. π-mode prints `π/2, π, 3π/2, 2π` — the exact labels
`unit_circle_to_sine_wave` hand-built at five computed pixel positions (§cost). An auto-tick
algorithm invents labels an author did not choose and cannot be checked by a gate that does not
re-implement it.

**D6 · Every new draw function opens with both standard brackets.** `PM_animationGate(spec)` then
`PM_focalEmphasis(spec)`, before any drawing. This is the **third recurrence** of the same omission
class on this renderer — `drawAngleArc`/`drawLocusTrace` missed the focal channel until 2026-07-24
(`3c052d5`), and `drawVector` missed **both** brackets until 2026-08-05 (`084f06c`), which is why
`appear_at_ms` on a vector was silently inert for the life of the fleet. Six primitives already do it
correctly (`drawBody :1212`, `drawLabel :1676`, `drawAnnotation :1716`, `drawSurface :1780`,
`drawForceArrow :1855`, `drawFormulaBox :2814`). It is a checklist item in every CP dispatch and a
gate section.

**D7 · Determinism: recompute from scratch, every frame, from the clock — never accumulate.**
`locus_trace`'s own header states the rule and the reason: a `SET_TIME_FREEZE` re-pin to the same
`at_ms` must redraw byte-identical pixels or H2 baselines are worthless. So `riemann_bars` derives
n from `n_expr` (a variable), never from a frame counter; `region_fill` re-integrates each frame;
nothing caches between frames. `max_bars_drawn` exists because 1000 rectangles at ~0.66 px each is
not a picture — above the cap the rectangles render as the fused region while **the sum keeps
computing at the true n**, which is precisely the convergence beat the spec driver's limit state
teaches. The moment the cap engages, the canvas must say so (`bars_drawn_var`, D11): a picture drawn
at 400 beside a number computed at 10 000 is a provenance split, and it is the same defect class
whether it is caused by the engine or by a teacher's drag.

**D8 · Readouts carry their own precision.** `drawCanvasSlider`'s caption formatter is hardcoded to
`toFixed(step < 1 ? 1 : 0)` (`:3180`) — acceptable for a slider, wrong for a coordinate pair or a
Riemann sum that must show four decimals converging. Every readout in this family declares
`decimals`. And the readout and the picture must read the **same** scope in the same frame: the
recorded sigma/pi failure (slider `1.000` beside HUD `0.000` in one frame) and this month's
`pcpl_slider_label_stale_under_choreography` are the same defect class twice.

**D11 · A primitive that computes a quantity while placing its own pixels PUBLISHES it; it never
prints it, and nothing else ever recomputes it.** (AMENDMENT 1 — this replaces the original
`riemann_bars.readout`.) The first draft removed the primitive's readout to satisfy "one quantity,
one readout" and had the sum computed in `computePhysics_<id>` instead. That does not remove the
second implementation — it **relocates** it: the renderer's loop places the pixels, the engine twin
produces the number, and the only thing making them agree is a gate assertion that no *future*
concept using `riemann_bars` inherits. That is the sigma/pi topology (a slider reading `1.000` beside
a HUD reading `0.000` in one frame) rebuilt under the rule written to prevent it. So: the primitive
computes the sum **once**, inside the loop that places the rectangles, and writes it into the live
expression scope under an authored key (`sum_var`); it draws no text; exactly one authored `label`
prints it via `text_expr`. `computePhysics_<id>` computes only what the geometry cannot produce (the
exact value, the accumulation function) and **never a Riemann sum**. Publication is
determinism-safe — recomputed from scratch every frame from the clock (D7), never accumulated — and
requires one pass-ordering line in the dispatch, alongside the Pass-0.25 plane registry. The gate
then asserts a *published* value against independently solved closed forms, which is what a
negative-controlled gate is for; it stops reconciling two internal implementations against each
other.

**D12 · Composition between primitives is declared in the contract, not discovered on screen.**
(AMENDMENT 1.) Two primitives sharing one interval need three things settled before either is built:
**draw order** (fixed above, not array position), **opacity** (rectangles opaque by default over a
translucent region), and **colour, including signed colour** (`signed` / `color_positive` /
`color_negative` on `riemann_bars`, the same field names `region_fill` uses). None of the three was
in the first draft, because the 0a union walk asked what each state *introduced* rather than what was
*co-present* in it. A capability walk that never asks "what else is on screen here" cannot generate a
composition rule, and composition is most of what makes a two-primitive frame readable.

**D9 · Everything lives in `scene_composition`. No new per-state field. Ever.**
`build_review_site.ts` keeps a **private duplicate** of the parametric config assembler that
hand-picks per-state fields; it silently dropped `variable_choreography` and shipped **dead
choreography on every PCPL concept** — clock running, physics frozen — until `f98e9f7` on 2026-08-06.
THE EYE never saw it, because the cache path uses the *shared* assembler. Until that duplicate is
deleted, **any new per-state field is a defect waiting to be authored**. `scene_composition` is
carried by both assemblers, so the whole family rides inside it. (The duplicate's removal is filed as
`review_site_private_config_assembler_drops_variable_choreography` and stays a separate follow-up.)

### <a id="reuse"></a>Reuse contract — what `cartesian_plane` must NOT re-derive

| Do not build | Use | Why |
|---|---|---|
| A reveal/opacity timer | `PM_animationGate` `:771` | D6; the authored `appear_at_ms`/`animate_in_ms` contract already exists |
| A focal glow / peer dim | `PM_focalEmphasis` `:816` | Rule 29 + 32e are one funnel or they are nothing |
| An expression evaluator | `PM_safeEval` `:954`, `PM_safeEvalPoint` `:968`, `PM_interpolate` `:1031` | The Math whitelist (`sqrt atan2 atan asin acos sin cos tan abs min max pow log exp PI E round floor ceil sign`) is the authored language; a second evaluator forks it |
| A live variable scope | `PM_liveExprVars()` `:1020` | Picture and readout must read one scope (D8) |
| A time-swept trace | `locus_trace` + `plane_id` | F17; it is already deterministic and already merges choreography |
| A slider, or slider layout | `type: "slider"` + `PM_resolveSliderSlot` `:3109` | Rule 31 muscle-memory: a shared slider keeps its screen position across states |
| A drag-seize mechanism | `PM_userTouched` + the existing drag path | F12 must yield to and from choreography exactly as sliders do |
| A canvas fit / density path | `PM_fitCanvas` `:3584` | Byte-identical output at native 760×500 is a baseline guarantee |

### <a id="ledger"></a>What this build is deliberately NOT doing (the alarm-rule ledger)

The alarm rule says a later concept forcing an engine edit means Phase 0 under-generalized. These are
declared **now** so that if they are built later it is a scheduled decision, not an alarm:

1. **F18 slope fields (#12, P3).** One additive primitive (`slope_field`: a grid of unit segments at
   `g(x,y)`). Excluded because #12 is P3 and the frame it needs is already in scope — the marginal
   cost when it is scheduled is one dispatch, not a re-scope.
2. **Polar / log axes.** No ranked concept needs them.
3. **Teacher-draggable pan and zoom of the plane.** The teacher pen and the state rail are the
   interaction surface; a pannable frame breaks Rule 32d home-pose continuity and every H2 baseline.
4. **Auto-fitting the range to the data.** D5's reasoning: an author who did not choose the window
   cannot be held to what it shows.
5. **Curve intersection solving, root finding, numeric differentiation of an arbitrary expression.**
   #2 authors `slope_expr` explicitly (`cos(x0)` for `sin`), which keeps the mathematics in the
   concept JSON where the `mathematics_author` role can put a domain ledger on it, and keeps the
   engine out of the business of being a CAS.
6. **A `panel_b` branch for `graph_interactive`.** Pre-existing, 46 physics concepts, founder call —
   explicitly not smuggled into a mathematics engine build.

---

## 0b — DEEPEST-CONCEPT DESIGN — **DONE 2026-08-06** → `docs/skeletons/definite_integral_as_accumulated_area_skeleton.md` (amendment round 1)

**The deepest concept is #3, the definite integral** — it consumes 12 of the 17 in-scope features,
including every one that is unique to a single concept (F15, F16) and the only one that couples the
frame to a swept accumulation (F17). #1 ships first; #3 **specs the engine**. That distinction is the
chemistry precedent applied (`hydrogen_bonding` shipped first; the wave was specced on the lattice).

0b produced: the full architect skeleton for #3, the exact functional forms
(`L(n) = b³(n−1)(2n−1)/(6n²) − cb`, `gap(n) = 4/n − 4/(3n²)`, `A(β) = β³/3 − cβ`), and a re-run of the
§walk against real states. **Checkpoint A returned `DESIGN_FIX` with 19 findings; all are applied in
amendment round 1, and ten of them changed this document** (the amendment box at the top).

**What 0b bought that 0a could not have known**, recorded because it is the argument for ever running
a 0b at all: a linear `n: 4 → 1000` choreography is useless (`holds` are placed by *value* fraction,
`parametric_renderer.ts:1111`, so the interesting decades flash past in 60 ms) · a left-rule partition
has a **zero-height first rectangle**, so "four rectangles" renders as three · an inset placed in the
free *caption* zone lands on top of the ink it magnifies · a control range wider than the frame's
y-range clips the picture while the number keeps printing · and the composition rules for two
primitives sharing one interval did not exist anywhere.

→ **Checkpoint A cycle 1 is pending on the amended skeleton** (budget: one more cycle, then ESCALATE).
Dispatch of CP-A…CP-D waits on it.

## 0c — ENGINE ONCE (planned, NOT dispatched)

Four dispatches to **`pcpl-surgeon`** (`peter_parker:renderer_primitives`), sequential, **one
`bug_class` each**, each landing on **master** separately and immediately (Rule 40), each inside the
~100-tool-call / ~45-min ceiling:

| Dispatch | `bug_class` | Builds | Gate sections |
|---|---|---|---|
| **CP-A** | `pcpl_has_no_coordinate_frame_so_every_graph_expression_carries_its_own_scale` | F1–F7: the plane, the registry, the transform, ticks/grid/labels, `equal_scale`, **multi-plane**, `plane_id` opt-in for `body`/`vector`/`label`/`locus_trace` | 1–4, 11, **15** |
| **CP-B** | `pcpl_cannot_plot_y_equals_f_of_x_across_a_domain` | F8–F12: `function_plot` (domain sampler with `min_expr`/`max_expr`, break-on-discontinuity), `plot_point` + drag + readout | 5–7, **16** |
| **CP-C** | `pcpl_cannot_shade_or_partition_the_region_under_a_curve` | F15–F16: `region_fill` (signed), `riemann_bars` (4 modes, **published** sum + drawn count, signed colour, `render`, `opacity`, `show_partition`, `reveal_stagger_ms`, `max_bars_drawn`) | 8–9, **12–14** |
| **CP-D** | `pcpl_cannot_draw_a_secant_or_tangent_with_a_live_slope` | F13–F14: `secant_line`, `tangent_line`, slope readouts | 10 |

**CP-C grew at Amendment 1 and is now the largest of the four.** If it exceeds the ~45-min dispatch
ceiling, split it as **CP-C1** (`region_fill` + `riemann_bars` geometry, publication, modes — gate
sections 8, 9, 12) and **CP-C2** (signed colour, `render`, `opacity`, draw order, `show_partition`,
`reveal_stagger_ms` — gate sections 13, 14), one `bug_class` each. Do not let it run long: a bundle
is what the one-`bug_class`-per-dispatch rule exists to prevent.

**Mandatory in every dispatch** (pre-paid scars, stated in the prompt so the agent executes rather
than re-derives): both brackets per D6 · no accumulation per D7 · `scene_composition` only per D9 ·
`check:renderer-syntax` **and** `check:renderer-backticks` after every edit (the renderer body is one
template literal — a backtick in a comment terminates it) · `npm test` 327/327 · and the diagnosed
root cause named up front **with an explicit invitation to refute it** (the standing lesson from Ch.6:
the failure mode to design against is an agent that is wrong *and* deferential).

### The gate — `npm run check:cartesian-plane` ($0, headless, no browser)

Modelled on `check:sigma-pi` / `check:bonding-scene`: pull the shipped function bodies out of
`PARAMETRIC_RENDERER_CODE` by brace matching, run them in node, and assert against values solved
**independently of the renderer**. **Every section carries a negative control** — the pre-fix or
deliberately-broken behaviour, asserted to FAIL — because a gate that has never failed is not known
to work.

| § | Asserts | Negative control |
|---|---|---|
| 1 | `toPx`/`toData` round-trip to <1e-9 across 4 quadrants; corners map to the viewport corners | A transform with the y-flip dropped must fail |
| 2 | Origin lands inside the viewport when the range straddles 0; on the edge when it does not | Range `[1,5]` must not paint an axis through the middle |
| 3 | Tick positions for step 1 on `[-6.5, 6.5]`; π-mode labels read `π/2, π, 3π/2, 2π` at the right px | Decimal mode on the same range must not emit `π` |
| 4 | `equal_scale` gives px/unit equal to 1e-12 and the rect stays inside the authored viewport | Non-square range with the flag off must differ |
| 5 | `function_plot` samples `sin` at 240 points to <1e-12 of `Math.sin`; endpoints included | An off-by-one sampler missing `x_max` must fail |
| 6 | **D4:** `tan(x)` over `[0, π]` yields ≥2 polylines and no segment crosses the frame; `1/x` breaks at 0 | A clamping sampler must fail |
| 7 | `plot_point` readout string and its px position derive from one evaluation (D8) | Two-scope evaluation must fail |
| 8 | `region_fill` signed integral of `sin` over `[0, 2π]` = 0 to <1e-6, and the two colour bands have equal area | An unsigned fill must fail |
| 9 | Riemann sums for `x²` on `[0,1]`: left(4)=0.21875, right(4)=0.46875, mid(4)=0.328125, **trap(4)=0.34375**, and left(1000) → 1/3 within 1e-3; `max_bars_drawn` changes **pixels only, never the published sum** | A sum computed from the drawn (capped) rectangle count must fail |
| 10 | Secant slope for `sin` at x₀=1, h=0.001 vs `cos(1)` within 1e-3; tangent slope reproduces `slope_expr` exactly | A secant using Δx from pixels rather than data must fail |
| 11 | **Fleet safety:** every primitive with no `plane_id` produces byte-identical geometry to `HEAD~` | Adding a `plane_id` must change it |
| **12** | **D11 publication.** The value published to `sum_var` equals the closed form solved independently in this gate, to 1e-12, at n ∈ {4, 8, 100, 1000} × every `mode` × `c` ∈ {0, 1}; `bars_drawn_var` equals `min(n, max_bars_drawn)`. **And a static assertion: no `computePhysics_*` in the renderer re-derives a Riemann sum** | A build where the label reads a recomputed value rather than the published one must fail |
| **13** | **A4 partition.** `show_partition` emits exactly `n − 1` interior division lines, **including where a rectangle has zero height** — the left rule on `x²` over `[0, 2]` at n = 4 has `f(0) = 0`, so the partition, not the rectangle, is what makes the count readable | n = 4 rendering three countable rectangles must fail |
| **14** | **D12 composition.** Draw order is `region_fill` before `riemann_bars`; rectangles at `opacity: 1.0` fully occlude the fill beneath them; `signed: true` assigns `color_negative` to every rectangle whose `f(xᵢ) < baseline` and to no other | Reversed order, or a signed set drawn in one colour, must fail |
| **15** | **A2 inset placement.** For a state declaring two planes: the inset viewport intersects **zero** drawn ink of the parent over the full range of every control the state exposes, and each zoom-link connector has >20 px of visible length outside the inset | An inset overlapping the parent's curve must fail |
| **16** | **A3 range containment.** For every concept: evaluating the drawn function over the cross-product of all control ranges (bound × offset × parameter) stays inside `y_range` with ≥5 % headroom, and the sampled polyline never exits the frame unless F9 break-on-range-exit is explicitly claimed | A control range driving the curve out of the frame must fail |

**Exit criteria for 0c** (from `MATHEMATICS_BUILD_PLAN.md` Phase P0, plus this survey):
gate green with all negative controls firing · `check:renderer-syntax` + `check:renderer-backticks`
clean · `tsc` 0 · `validate:concepts` 149/149 · `validate:chemistry` 10/10 ·
`validate:mathematics` PASS · `npm test` 327/327 · **and THE EYE returns every baseline-locked PCPL
concept unchanged** — the 7 named in §risk below — which is the regression-bearing-edit check the
bonding wave used.

## 0d — THE CONCEPT DESKS (pure JSON)

One desk per concept, in ranked order **#1 → #2 → #3**, each `feat/mathematics-<concept>`, opened
only after CP-A…CP-D are on master. **Success test: #2 and #3 require ZERO renderer edits.**
**⚠ Alarm rule:** a later concept forcing an engine edit means this survey under-generalized — stop,
re-scope with the surgeon, and amend this document. Never extend the engine per concept.

---

### <a id="risk"></a>The fleet-safety measurement (why F7 is safe)

CP-A wires `plane_id` into four **shipped** primitives, so the blast radius was measured rather than
estimated. Baseline-locked concepts assembled by `parametric_renderer.ts`:

| Concept | Namespace |
|---|---|
| `free_body_diagram`, `resultant_direction`, `scalar_vs_vector`, `vector_addition_law` | physics (`PCPL_CONCEPTS`) |
| `bohr_model_energy_levels`, `law_of_conservation_of_mass` | chemistry |
| `unit_circle_to_sine_wave` | mathematics |

**Seven concepts.** None of them authors `plane_id` — it does not exist yet — so if the resolution is
written as *inert when absent*, every one of them must come back from THE EYE at 0.00 % pixel drift.
Gate section 11 asserts exactly that, and it is the cheapest possible proof that a shared-engine edit
did not move the fleet.

---

## OPEN DECISIONS — founder

1. ~~**Sequence.** Does 0b run next, or does CP-A dispatch immediately?~~ **ANSWERED — 0b ran, and it
   paid for itself.** Ten deltas to this document, four of which fix defects that would otherwise have
   been found in a built engine or on a teacher's screen. **The live decision is now the two rulings
   Checkpoint A made that a founder may want to reverse before dispatch:** (a) **`∫` on a core state**
   with `lim(n→∞)` denied on core — this decides what the `core_only` preset of the definite integral
   contains, and the reversal costs two formula surfaces and one ledger row; (b) **`reveal_stagger_ms`
   bought** rather than worked around, which enlarges CP-C.
2. **Does #12 stay excluded?** §ledger item 1. Including F18 now is roughly one extra dispatch;
   excluding it leaves #12 blocked until a later scheduled build.
3. **Two pre-existing items this survey touched but did not act on:** the `graph_interactive`
   panel-B gap (46 physics concepts authoring a panel that never paints) and the
   `build_review_site.ts` private assembler duplicate (D9). Both are scar rows, both are founder
   calls, and neither belongs inside a mathematics engine build.
4. **Rule 38g, restated because it now covers five more files:** every international cell in §0a
   ships `needs_teacher_verification: true`. The subject's intersection thesis is still unverified by
   any teacher of any non-CBSE board.

*This document builds nothing. It makes `cartesian_plane` buildable — and checkable before a line of
renderer code exists.*
