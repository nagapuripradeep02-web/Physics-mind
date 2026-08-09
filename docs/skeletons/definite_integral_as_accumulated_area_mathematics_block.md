# MATHEMATICS BLOCK — `definite_integral_as_accumulated_area`

> Author: `mathematics_author` · Desk: `Physics-mind-mathematics-definite-integral` @ `feat/mathematics-definite-integral`.
> Upstream: `definite_integral_as_accumulated_area_skeleton.md` — **AMENDMENT ROUND 2 (FINAL)**, founder-ratified F2/F9/F17 (2026-08-08), CP-A…CP-D on master, **CLEARED FOR `mathematics_author`**.
> Adds rigor; does **not** redesign. §2 (state count/arc), §3 (Rule-31 control table), §10 (Definition of Done), §11 (pixel plan), §12 (timing table), §13 (union walk) are NOT re-derived here — they are cited by number and extended only where this role's contract requires new material (domain/validity ledger, narration text, notation-ladder argument rows, drill-down phrasings, constraint callouts). Every place this document adds a number the skeleton did not already fix is flagged, never silent.

## Engine bug queue consultation (own sweep, not inherited)

```
query_engine_bug_queue.ts definite_integral_as_accumulated_area          → 0 rows
query_engine_bug_queue.ts --owner alex:mathematics_author                → 1 row
query_engine_bug_queue.ts --owner alex:physics_author                    → 14 rows (subject-neutral variable/formula/timeline classes checked below; field_3d-only rows N/A)
query_engine_bug_queue.ts --owner alex:chemistry_author                  → 11 rows (particle_field-only; N/A to PCPL)
query_engine_bug_queue.ts --owner alex:json_author                       → 135 rows (PCPL/mathematics-relevant rows checked below)
query_engine_bug_queue.ts --pcpl                                         → cross-checked against skeleton §14 PCPL lane; no new open row binds beyond what §14 already carries forward
```

| bug_class | Verdict |
|---|---|
| `narration_names_an_internal_choreography_variable_that_no_primitive_labels` (alex:mathematics_author, MAJOR/OPEN, filed against `derivative_as_secant_limit`'s "the sweep value u") | **Satisfied by construction.** No narration line below names `nlog`, `xdraw`, `fillx`, `beta` as bare identifiers. Where a rendered symbol is spoken (`β`, `A(β)` — both HUD chips on S7), the spoken form is the expanded word "beta" per Rule 30, never the choreography key. |
| `tts_sentence_glow_channel_unused_across_an_entire_subject_namespace` (alex:json_author, MAJOR/OPEN — `graph_transformations`, `derivative_as_secant_limit`, `unit_circle_to_sine_wave` all ship 0 glow bindings) | **Not silently fixed (owned by json_author) — mitigated here.** §3 below suggests one glow target per state, matching the state's own already-ratified Rule-32 `focal_primitive_id`/`focal_sequence` (skeleton §3's "Rule 32 plan" row). Carrying these into `tts_sentences[].glow` keeps this concept from becoming a fourth all-zero mathematics member. |
| `pcpl_radians_helper_missing` | **N/A, verified.** No angle/degree expression anywhere in this concept — every quantity is unitless, no `radians()`, no `PI/180`. |
| `pcpl_locus_trace_sweep_parameter_exposed_as_a_slider_collapses_the_curve` (φ law, Gate 9(d), FATAL) | **Satisfied.** `beta` is S7's only `locus_trace` sweep and is never a slider or a `plot_point.drag.bind_variable` (skeleton §⓿ doctrine box, re-confirmed at source below). |
| `pcpl_position_expr_authored_as_an_object_literal_string_pins_the_body_to_the_renderer_default` | **Binding, authoring-side.** The two tracking labels this concept needs (`y = x²` at the domain end `b`; `A(x)` at the trace head `beta`) must author `label.position_expr` as an **object** `{"x": "...", "y": "..."}`, never a single string — flagged for json_author's authoring pass, not fixable at the mathematics-block layer. |
| `hud_prints_negative_zero_on_a_value_only_instrument` | **Checked, one real risk found.** `area_below` is exactly `0.0000` at `c = 0` (S5's entry) and can arrive at that value from a tiny negative float. `area_below`'s formatter must clamp `|v| < 0.00005 → 0` before `.toFixed(4)` — added to Constraint callouts below. `gap` never risks this (proven strictly positive, §2). |
| `computed_output_divides_by_a_coefficient_whose_default_is_zero_and_evaluates_to_Infinity` | **N/A, verified.** Every `computed_outputs` formula (`exact`, `A_beta`, `area_total`, `area_below`) substituted at the declared defaults (`b=2, c=0, beta=0`) evaluates finite — see Numerical sanity check log. |
| `narration_names_a_reference_line_the_scene_never_draws` | **Checked per state.** Every geometric noun in the narration below ("the region", "four rectangles", "the inset", "the below-axis piece", "three readouts", "the traced curve") maps to a primitive declared in that same state's consumption row (skeleton §13a). |
| `narration_references_a_prerequisite_concepts_apparatus_that_is_not_on_screen` | **N/A.** No prior-concept apparatus is referenced; the one prerequisite (rectangle area, reading `y=f(x)`) is carried by S2's own patch sentence (Block 1), stated as an idea, never as another concept's fixture. |
| `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` | **Checked at S6.** S6's claim IS a relation between three co-present overlays (left/mid/right). The skeleton's own Rule-32 plan names the focal as "the three readouts" (all three together, not one dimming the other two) — this is exactly the escape clause the scar's `DO` names ("author no glow_focal" when the claim is a relation). Confirmed non-violating; no fix needed. |

No `FIX(engine)` — nothing below requires a renderer edit; every primitive this design needs already exists (source-verified next).

## Source verification (read, not trusted from citation)

Read `parametric_renderer.ts` directly at this desk's HEAD (`ad569ae`, 2026-08-08 — CP-A…CP-D long since merged, so every SPEC row in skeleton §⓿ was re-checked rather than trusted):

- `drawRiemannBars` / `PM_riemannBarsCompute` (@4082–4271): `sum_var`, `bars_drawn_var`, `max_bars_drawn`, `show_partition`, `reveal_stagger_ms`, signed colour fields (`color`, `color_positive`, `color_negative`) and `mode: left|right|midpoint|trapezoid` all **exist and are wired** exactly as skeleton §13c's deltas 2/3/4/7/8/9 specify. `max_bars_drawn` is confirmed **per-primitive and opt-in** (`PM_riemannBarsCompute`'s `barsDrawnCount` falls back to the full `n` when `max_bars_drawn` is unauthored — the comment at @4082 states this explicitly: *"max_bars_drawn caps only which rectangles are PLACED on screen... [the sum still runs the] full n iterations regardless"*) — this matters for §2f below.
- `drawRegionFill`, `drawFunctionPlot`, `drawPlotPoint`, `drawCartesianPlane`, `drawLocusTrace` all dispatch in the Pass-3 `if/else` chain (@5896–6224) — every SPEC row in skeleton §⓿'s "does not exist" table is now VERIFIED-LIVE.
- `plot_point`'s `drag.bind_variable` seize path is wired at @3163 (`else if (p.type === 'plot_point' && p.drag && ...)`), satisfying skeleton F5/F12 — the φ-law's second seizure door (§⓿ doctrine box) is closed by this same code path.
- `PM_buildEvalScope` (@1054–1073) whitelist: `sqrt atan2 atan asin acos sin cos tan abs min max pow log exp PI E round floor ceil sign`. **`min` and `sqrt` are both present** — this licenses `area_below`'s `min(b, sqrt(c))` and S1's proposed `x_domain.max_expr: "min(xdraw, b)"` as legal bare expressions (no `Math.` prefix), confirming §2f and the S1 recommendation in §3 are buildable as written.
- `label.position_expr` (skeleton F11) — precedence over the solver slot confirmed at the position-expr branch (@1880–1915); the object-literal-vs-string-literal trap (the `pcpl_position_expr_authored_as_an_object_literal_string_pins_the_body_to_the_renderer_default` row above) is a live authoring hazard on this concept's two tracking labels, flagged above.

**Conclusion: the union this skeleton requires (§13, 12 of 17 rows) is fully buildable today. No STOP condition — nothing here needs an archetype or primitive outside what is already live.**

---

## 1. `engine_config`

```jsonc
{
  "variables": {
    "b":     { "name": "interval upper bound", "min": 0.2, "max": 2.0, "default": 2.0 },
    "c":     { "name": "vertical lowering parameter", "min": 0, "max": 1, "default": 0 },
    "nlog":  { "name": "log10(n) — choreography convenience, NEVER rendered, NEVER a slider", "min": 0.60206, "max": 4, "default": 0.60206 },
    "n":     { "name": "number of rectangles — DERIVED from nlog in every guided state (round(pow(10,nlog))); an INDEPENDENT teacher slider ONLY in S8 (min 4, max 200, step 4)", "min": 4, "max": 10000, "default": 4 },
    "beta":  { "name": "S7 accumulation sweep parameter — phi-law: never a slider, never drag-bound", "min": 0, "max": 2.0, "default": 0 },
    "xdraw": { "name": "S1-only curve draw-in reveal bound", "min": 0, "max": 2.0, "default": 0 },
    "fillx": { "name": "S1-only region fill-in reveal bound", "min": 0, "max": 2.0, "default": 0 }
  },
  "formulas": {
    "f_at":        "x*x - c",
    "exact":       "pow(b,3)/3 - c*b",
    "gap_closed":  "(pow(b,3)*(3*n - 1)) / (6*n*n)",
    "A_beta":      "pow(beta,3)/3 - c*beta",
    "area_below":  "pow(min(b, sqrt(c)), 3)/3 - c*min(b, sqrt(c))",
    "area_total":  "exact - 2*area_below"
  },
  "computed_outputs": {
    "exact":       "the definite integral I(b,c), 4 dp — S3 first (as 'exact'), S4-S8 (as the value chip under the granted symbol, FLAG 1)",
    "A_beta":      "the accumulation function A(beta,c), 4 dp — S7 only",
    "area_total":  "the unsigned total area, 4 dp — S5 only (the dim, WRONG-for-the-question chip, M2)",
    "area_below":  "the below-axis subtotal, 4 dp, clamp |v|<0.00005 to 0 before formatting — S5 only"
  },
  "constraints": [
    "f(x) = x^2 - c is a polynomial: defined and continuous for EVERY real x, on every value of c the sim ever reaches (c in [0,1]) -- there is no excluded point anywhere in the function's own domain",
    "the DRAWN interval is x in [0, b] with b in [0.2, 2.0], authored as function_plot.x_domain = {min:0, max_expr:'b'} in every state except S1's reveal window (max_expr:'min(xdraw, b)', handing off to 'b' with no discontinuity since xdraw's ceiling equals b's own value at S1's static default 2.0)",
    "gap(n) = b^3(3n-1)/(6n^2) is EXACT, strictly positive for every integer n >= 1 (proven algebraically and verified by direct search over n in 1..200000), and is INDEPENDENT of c -- at S4's fixed b=2, c=0 this is 4/n - 4/(3n^2), the founder-ratified F2 surface",
    "canvas pixels = 220 x data units on x, 62 x data units on y, origin at px (180, 357) on the MAIN plane -- the S4 inset is a SEPARATE plane_id ('inset') with its own transform (920 px/x-unit, 145 px/y-unit); the two factors are never mixed in one expression",
    "'left <= integral <= right' (S6's formula surface) is TRUE only because f is increasing on the drawn interval at S6's fixed c=0 -- the one-surface-per-state rule (34b) cannot carry that hypothesis on canvas, so S6's narration states it in words",
    "max_bars_drawn is a PER-PRIMITIVE opt-in field, not a global engine cap -- authored ONLY on S4 (value 400, with the 'rectangles drawn: {n_drawn} of {n}' disclosure); S3 and S6 author NO max_bars_drawn, so their riemann_bars draw the true n (up to 1000 and ~501 respectively) with no silent truncation"
  ]
}
```

**`n` / `nlog` per-state semantics (never one global expression — mirrors the sibling `h`-law tables):**

| State | `n` semantics | Notes |
|---|---|---|
| S1 | n/a (no rectangles) | — |
| S2 | literal `4` | static reveal, no choreography |
| S3 | `round(pow(10, nlog))` | `nlog` 0.602→3.0 |
| S4 | `round(pow(10, nlog))` | `nlog` 2→4; `max_bars_drawn: 400` authored HERE ONLY |
| S5 | literal `4` (recommended — see FLAG 1) | riemann_bars drawn for the sign lesson; skeleton does not state a value, matches S2's apparatus (Rule 32d) |
| S6 | `round(pow(10, nlog))`, shared by all three co-present sets | `nlog` 0.903→2.7; no `max_bars_drawn` (see §2f) |
| S7 | n/a (accumulation is a `locus_trace` on `beta`, not a rectangle count) | — |
| S8 | independent slider, `4–200` step `4` | teacher-owned; pre-seizure default `4` |

---

## 2. Domain & validity ledger

### 2a. The function and the drawn interval

`f(x) = x² − c`. **Domain: all reals, every `c` the sim reaches (`c ∈ [0,1]`). No exclusions** — a polynomial has no division, no even root of a negative, no log of a non-positive, no piecewise switch. Range on the drawn interval `[0,b]`: `[−c, b²−c]` (minimum at `x=0`, since `f` is non-decreasing for `x≥0`).

| What | Interval | Where |
|---|---|---|
| Plane's visible frame | `x ∈ [−0.5, 2.5]`, `y ∈ [−1.5, 4.5]` | skeleton §11, all 8 states, fixed home pose |
| The curve (`function_plot.x_domain`) | `x ∈ [0, b]`, `b ∈ [0.2, 2.0]` — authored per state, never the plane's full frame | skeleton §11 A3 ruling |
| `b`'s drag range | `[0.2, 2.0]` | S5, S8 |
| `c`'s range | `[0, 1]` | S5, S8 |
| S4's inset | `x ∈ [1.75, 2.00]`, `y ∈ [3.0, 4.0]` — a SECOND, smaller drawn window inside the same `b=2` state | S4 only |
| S7's accumulation trace `A(x)` | `x ∈ [0, 2]` (β's own range) | S7 only |

The interval-honesty risk this concept was flagged for is real and is fully in **2c** below: a curve drawn on `[0,b]` under a claim quantified over `n → ∞`, and a finite-`n` sum under a caption that could be misread as the limit itself.

### 2b. Named theorem, hypotheses checked — the convergence claim S3/S4/item2 all depend on

> **Definition (the Riemann/definite integral as a limit of sums).** For `f` continuous on `[a,b]`, partition `[a,b]` into `n` equal subintervals of width `h=(b−a)/n`; for ANY choice of sample point `xᵢ` in each subinterval, `Sₙ = Σ f(xᵢ)·h → ∫ₐᵇ f(x)dx` as `n → ∞`. **Hypothesis:** `f` continuous on the closed, bounded interval `[a,b]`.
> **This setup:** `f(x)=x²−c` is a polynomial, continuous on all of ℝ, hence continuous on every `[0,b]` the sim ever draws (`b ∈ [0.2,2.0]`). The hypothesis is satisfied trivially at every rendered frame, for the left rule (S2–S5, S8), and for all three rules together (S6).

**Approaching is not reaching — proven, not asserted.** `gap(n) = b³(3n−1)/(6n²)`. For any `b>0` and any integer `n≥1`: `3n−1 ≥ 2 > 0`, so `gap(n) > 0` strictly — verified by direct evaluation over `n ∈ [1, 200000]` (Numerical sanity check log). **`Sₙ` (the left sum) equals `exact` at no rendered `n`, ever.** As `n→∞`, `gap(n)→0` (both terms `→0`) — this is the honest content of the delta cue "Gap shrinks like 4/n": the leading term dominates, and the exact two-term form proves the value never becomes zero at any finite `n` while still shrinking without bound. Item 2's "settles on one number" and item 3's "gap behaves like 4/n" are both checked, not rhetorical.

### 2c. Every generalisation claim, traced

| Claim | Named fact | Scope check | Verdict |
|---|---|---|---|
| S4: `gap = 4/n − 4/(3n²)`, "never zero" | `gap(n)=b³(3n−1)/(6n²)` at `b=2,c=0` | algebraic proof + search over `n∈[1,200000]` (2b) | **TRUE at every finite n**, and this instantiation is drawn only in S4, where `b`/`c` are held at their defaults (S4 exposes no controls) |
| S3/item 2: "the sum settles on one number" | Riemann's theorem for continuous `f` on `[0,b]` (2b) | hypothesis (continuity on a closed bounded interval) checked against THIS `f` and every reachable `b` | **TRUE** |
| S6 surface: `left ≤ ∫ ≤ right` | for `f` monotonically increasing on `[0,b]`, the left sum under-estimates and the right sum over-estimates every finite `n` | checked: `f'(x)=2x≥0` for `x≥0`, and S6 holds `c=0` throughout (no control exposes `c` in S6) so `f=x²` is strictly increasing on `(0,b]` | **TRUE, but conditional on "increasing" — a hypothesis the bare surface cannot carry (Rule 34b caps one relation); the narration states it in words ("because this curve keeps rising")** |
| S7: `A(x) = x³/3` | the accumulation function of `f(t)=t²` (this concept's own `f` at `c=0`) is its antiderivative by the Fundamental Theorem's construction, evaluated directly (not asserted, not proved here — this is the FTC *seed*, per §1's atomic claim) | true for THIS `f` only; not "every curve accumulates into a cube" | **TRUE for this curve; narration makes no wider claim (no "for every function" language authored)** |
| Anchor (S1): "the area under a speed graph is the distance travelled" | `distance = ∫ v dt` (FTC applied to velocity) | a general, universal fact about ANY speed-vs-time graph, stated as an ANALOGY ("works this way too"), never claiming the sim's own `y=x²` curve IS a speed curve (skeleton §9: "the sim's curve is `y=x²`... the anchor is a sentence and is never drawn") | **TRUE, correctly scoped as analogy** |
| Item 1: `∫₀¹x²dx` with 2 left rectangles | uses `b=1, c=0` | **fully reachable** inside the sim's own live range (`b∈[0.2,2.0]` includes 1.0) — NOT a transfer beyond the sim, unlike the sibling concept's analogous item | **TRUE, and directly reproducible in S8 by dragging `b` to 1.0** |
| Item 3: gap at `n=200` ≈ `0.02` | uses the taught closed form at `b=2,c=0`, `n=200` (reachable inside S4's own `n∈[100,10000]` sweep) | direct application of the state's own formula | **TRUE** (`gap(200)=0.019967`) |
| Item 4: `∫₀²(x²−2)dx`, i.e. `c=2` | `c`'s LIVE slider range is `[0,1]` — `c=2` is never reachable on screen | the underlying formula `I(b,c)=b³/3−c·b` is exact for every real `c` regardless of the sim's slider bounds; this is a **paper transfer**, testing the general skill, not a claim the sim renders (same class as the `derivative_as_secant_limit` sibling's item 1, which legitimately transfers to `x=3` outside the drawn curve window) | **Legitimate transfer; do not widen `c`'s range to cover it — flagged for visibility below** |
| Item 6: `A(3)` where `A(x)=x³/3` | `beta`'s LIVE range is `[0,2]` — `x=3` is never reachable on screen | same class as item 4: the antiderivative formula holds for every real `x`; the sim simply never sweeps that far | **Legitimate transfer; flagged for visibility below** |

### 2d. Exact-before-decimal

Every displayed number in this concept is a **terminating (or clearly-labelled recurring) decimal by algebraic construction** — `b³/3` type expressions round to a declared precision, never truncated mid-computation. The one genuinely repeating value is `8/3 = 2.6666...`, always displayed at the declared 4 dp (`2.6667`), and the formula surfaces carry the EXACT symbolic form (`b³/3 − c·b`, `4/n − 4/(3n²)`, `x³/3`) so the exact/decimal split is a legibility instrument, never an error-hiding one. `gap`'s 6 dp precision (vs 4 dp elsewhere) exists specifically so the HUD stays legible below `10⁻³` — declared once (§10g) and never changed mid-concept.

### 2e. `gap` is independent of `c` — verified, worth recording

`gap(n,b,c) = I(b,c) − L(n,b,c) = b³(3n−1)/(6n²)` — the `−c·b` term cancels identically between the exact integral and the left sum (a constant vertical shift moves every rectangle's height and the true area by the same amount). Verified numerically across `b ∈ {0.5, 1.3, 2.0}` and `c ∈ {0, 0.73}`: identical to 12 decimal places (Numerical sanity check log). This is why S4 — which never exposes `c` — can state the gap formula as a clean fact about `n` and `b` alone.

### 2f. `max_bars_drawn` — resolved by source-reading, not assumed

The skeleton's §10g "provenance is labelled" clause and the F4 cap-crossing measurement (6316.5 ms, `n=400`) apply to **S4 only** in the DoD table (§10b). Reading `PM_riemannBarsCompute` directly (Source verification, above) confirms `max_bars_drawn` is a **per-primitive opt-in field**, not a shared engine constant — when unauthored, `riemann_bars` draws the true `n`. S3 (max `n=1000`, crossing computed at `t≈17511 ms` if a 400-cap were applied) and S6 (max `n≈501`, crossing at `t≈19237 ms` if capped) therefore carry **no honesty risk at all** provided `max_bars_drawn` is **not** authored on their `riemann_bars` instances — they simply draw every rectangle their `n` calls for. This is stated as a constraint (§1) rather than left to inference, because copying S4's `max_bars_drawn: 400` onto S3/S6 "for consistency" would introduce exactly the silent-truncation defect this section was written to rule out.

---

## 3. Timeline + control spec + narration (Rule 31)

**Canonical primitive ids (proposed, for `json_author`):** `plane`, `plane_inset`, `curve`, `region`, `bars` (the single `riemann_bars` reused across S2–S5, S8), `bars_left`/`bars_mid`/`bars_right` (S6's three co-present sets), `sliver_inset` (S4's zoomed rectangle inside `plane_inset`), `zoomlink_1`/`zoomlink_2` (S4's two connector vectors), `bound_marker` (the draggable `plot_point` on `b`, S5/S8), `accum_trace` (S7's `locus_trace`, `A(x)`), `accum_head` (S7's non-draggable `plot_point` at the trace head), `fs` (the one formula surface), plus HUD labels named for what they print (`n_chip`, `Sn_chip`, `exact_chip`, `gap_chip`, `h_chip`, `b_chip`, `c_chip`, `total_area_chip`, `below_axis_chip`, `integral_chip`, `beta_chip`, `Abeta_chip`, `rectangles_drawn_chip`, `edge_readout`).

**Precision doctrine (carried from skeleton §10g, restated as the authoring contract):** `Sₙ`, `∫` (`exact`), `A(β)`, `total area`, below-axis subtotal → **4 dp**. `gap` → **6 dp**. `n` → integer. `h` → **4 dp**. `b`, `β` → **2 dp**. `c` → **1 dp** (`labelText`'s `toFixed(step<1?1:0)` caps it there regardless). Precision never changes mid-concept for a given instrument.

**`words_max` per state (F9, hard cap — this document's authored narration word count is ≤ this number in every row):**

| State | Motion window | `words_max = ⌊2.5×mw⌋` | Authored narration (hand count) |
|---|---|---|---|
| S1 | 18.0 s | **45** | 41 |
| S2 | 18.0 s (retimed, F9) | **45** | 41 |
| S3 | 20.0 s | **50** | 47 |
| S4 | 19.5 s | **48** | 47 |
| S5 | 18.0 s | **45** | 40 |
| S6 | 20.0 s | **50** | 49 |
| S7 | 20.0 s | **50** | 45 |
| S8 | open | **0 / open** | 0 |

### STATE_1 — "The Region Under the Curve"
`trace-locus` · core · `manual_click` · no controls · register: graphical / numeric · real number: live edge readout `x = 1.32`.
**Motion (skeleton §12, cited not re-derived):** `xdraw` 0→2 over 1200–9000 ms; `fillx` 0→2 over 9000–18000 ms; pin `eye_capture_ms: 18500`.
**Checked (python-verified):** `xdraw@5000=0.974`, `xdraw@9000=2.000`, `fillx@18500=2.000` — matches skeleton's probe output exactly.
**Primitives:** `plane`, `curve` (`x_domain.max_expr: "min(xdraw, b)"` during 1200–9000, settling to `"b"` — see §1 constraint 2), `region` (`region_fill.to_expr: "min(fillx, b)"`, same handoff logic), `edge_readout` (two sequential labels tracking `xdraw` then `fillx`, per skeleton F10).
**Suggested glow:** `region` (matches the skeleton's own Rule-32 plan: "S1 region").
**Narration (41 words):**
> "The curve draws left to right, then the region beneath it fills in — y equals x squared, bounding one exact area not yet measured. A speed graph works this way too: the area under it is the distance the vehicle travelled."

### STATE_2 — "Four Rectangles Estimate It"
`decompose` · core · no controls · register: graphical / numeric · real number: `Sₙ = 1.7500`, `h = 0.5000`.
**Motion (§12):** region dims to 0.25 (0–1200 ms); rectangles at 1200/5700/10200/14700 ms (`reveal_stagger_ms: 4500`, F9-retimed); `S₄` label at 18000 ms; `show_partition` draws the division lines so the zero-height first rectangle is countable.
**Checked:** `L(4) = 1.7500` (python-verified), `h = 0.5000`.
**Primitives:** `plane`, `curve`, `region` (dimmed), `bars` (`mode:"left"`, `sum_var:"S_n"`, `bars_drawn_var` unused — n never exceeds 4 here, `show_partition: true`, drawn AFTER `region` per skeleton A5b), `fs` (`Sₙ = Σ f(xᵢ)·h`).
**Suggested glow:** `bars`.
**Narration (41 words) — carries the Block-1 prerequisite patch verbatim, plants M3's setup (S2's own silent sampling choice):**
> "Four rectangles estimate the region, each as tall as the curve where it begins. Each rectangle's area is its width times its height, and its height is the curve's value at its left edge — which for the first one is zero."

### STATE_3 — "More Rectangles, Closer Sum" (PRIMARY AHA)
`refine` · core · no controls · register: graphical / numeric · real number: `Sₙ = 2.6353`, `exact = 2.6667`, `gap = 0.031413`.
**Motion (§12):** `nlog` 0.602→3.0, holds at `n=20` and `n=100`; boundaries 1000/5372.4/7372.4/11744.8/13744.8/20000; pin 14400 → `n=127`.
**Checked:** all boundary/pin values python-reproduced exactly against skeleton's probe output.
**Primitives:** `plane`, `curve`, `region`, `bars` (`mode:"left"`, no `max_bars_drawn` — §2f), `exact_chip`, `gap_chip`.
**Suggested glow:** `bars`.
**Narration (47 words):**
> "Watch the rectangles multiply and thin, from just four toward a thousand — pausing at twenty, then again at a hundred. Each time, the estimate climbs closer to a single number: the exact total the region is heading for, though the rectangle count itself never actually reaches it."

### STATE_4 — "The Gap Shrinks, Never Zero"
`limit-approach` · core · `derivation_first_principles` · no controls · **`misconception_watch`: M1** · register: symbolic+graphical co-lead / numeric · real number: `gap = 0.001736` at 6 dp.
**Motion (§12):** `plane_inset` + zoom-link reveal 0–1500 ms (n held at 100); `nlog` 2→4 over 1500–19500 ms (hold at `n=1000`); cap crossing at `n=400` measured `6316.5 ms`; `rectangles_drawn_chip` authored at `appear_at_ms: 6000` so provenance arrives with the phenomenon.
**Checked:** cap crossing, boundaries, pin (`n=2304, gap=0.001736`) all python-reproduced.
**Primitives:** `plane`, `curve` (static, held at its cap pose), `plane_inset`, `sliver_inset`, `zoomlink_1`, `zoomlink_2`, `bars` (`max_bars_drawn: 400`, `bars_drawn_var:"n_drawn"`), `rectangles_drawn_chip`, `fs` (`gap = 4/n − 4/(3n²)`, F2), `gap_chip` (6 dp, computed from `gap_closed` at THIS state's `n`, never from `exact − Sₙ` — "by construction" agreement with the surface, §1).
**Suggested glow:** `sliver_inset`.
**Narration (47 words) — contrast-beat order (consequence first, then the mathematics), confronts M1:**
> "The picture stops moving, but the numbers do not. Zoom into the last sliver: even at ten thousand rectangles, it is still there. Its exact size is four over n, minus four over three n squared — always positive. No count of rectangles ever makes that gap zero."

`one_line_fix` (carried verbatim from skeleton §4): *"No count of rectangles reaches it — the integral is the number they head for."*

### STATE_5 — "Below the Axis Counts Negative"
`parameter-sweep` · core · **draggable bound `b` (0.2–2.0)** · **`misconception_watch`: M2** · register: graphical / numeric · real number: `total area = 2.0000` (dim) vs `∫ = 0.6667` (bright), below-axis subtotal `−0.6667`.
**Motion (§12):** hold `c=0` 0–2000 ms; `c` 0→1 over 2000–14000 ms; `total_area_chip` (dim) 14000–16000 ms; the signed total brightens 16000–18000 ms.
**Checked:** `I(2,1)=0.6667`, `area_below(2,1)=−0.6667`, `area_total(2,1)=2.0000` — all python-verified against `computePhysics`'s closed forms (F7).
**Primitives:** `plane`, `curve`, `region` (signed: `color_positive`/`color_negative`), `bars` (`n=4` static — see FLAG 1; `signed` colour reused from `region_fill`'s field names per skeleton delta 8), `bound_marker` (`plot_point`, `drag.bind_variable:"b"`), `total_area_chip`, `integral_chip`, `below_axis_chip`.
**Suggested glow:** the below-axis rectangle group (`bars`, filtered to negative-hue members) — matches skeleton's Rule-32 plan: "S5 the below-axis lobe".
**Narration (40 words) — contrast-beat order (wrong-expectation chip first, then the real total), confronts M2:**
> "Lower the curve: part of it dips below the axis. If area only ever added, the total would read 2.0000 — dim, and wrong here. The real total is 0.6667, bright: the below-axis piece, minus 0.6667, subtracted from what is above."

`one_line_fix` (carried verbatim): *"Below the axis, the rectangle's height is negative — it subtracts."*

### STATE_6 — "Three Rules, One Limit"
`cycle-compare` · extended · no controls · **`misconception_watch`: M3** · register: graphical / numeric · real numbers: at `n=8`: `left 2.1875 · mid 2.65625 · right 3.1875`; at the pin (`n=96`): `2.6251 · 2.6666 · 2.7085`.
**Motion (§12):** left set 0–2000 ms, right set 2000–4000 ms, midpoint set 4000–6000 ms; `nlog` 0.903→2.7 over 6000–20000 ms with the three sets dimmed to 0.35 and the three readouts as focal; pin 14400 → `n=96`.
**Checked:** all values python-reproduced exactly (`L(8)=2.1875, M(8)=2.65625, R(8)=3.1875`; `L(96)=2.6251, M(96)=2.6666, R(96)=2.7085`).
**Primitives:** `plane`, `curve`, `region`, `bars_left`/`bars_mid`/`bars_right` (`render:"outline"` for left/right, `"filled"` for midpoint, per skeleton delta 4), three readout labels.
**Suggested glow:** the three readout labels together (matches "S6 the three readouts" — a RELATION glow, per the engine-bug-queue verdict above, never one bar set dimming the other two).
**Narration (49 words) — dual-label once (38d), states the increasing-`f` hypothesis in words (2c), confronts M3:**
> "Three rules sample the same rectangles differently: left sum (left Riemann sum), right sum, and midpoint. Because this curve keeps rising, left stays smallest and right stays largest — three different numbers, bracketing the truth. Add more rectangles: all three readouts draw closer, never landing on exactly the same value."

`one_line_fix` (carried verbatim): *"The sampling rule changes every finite sum and not the limit."*

### STATE_7 — "The Area So Far Is a Function"
`accumulate` · advanced · `derivation_first_principles` · no controls (φ law) · register: graphical+symbolic co-lead / numeric · real number: `β = 1.38`, `A(β) = 0.8718`, ending `A(2) = 2.6667`.
**Motion (§12):** `f` dims 0–2000 ms with the A-axis meaning labelled; `beta` 0→2 over 2000–20000 ms, ONE driver for both the fill edge and the trace head (never staggered — skeleton's correspondence-state note); pin 14400 → `β=1.3778, A(β)=0.8718`.
**Checked:** `A(1.3778)=0.8718`, `A(2)=2.6667` — python-verified.
**Primitives:** `plane`, `curve` (dimmed), `region` (`to_expr:"beta"`), `accum_trace` (`locus_trace`, `x_expr:"beta"`, `y_expr:"A_beta"`, sample budget `⌊18000/80⌋+1=226 ≤ 240` ✓), `accum_head` (`plot_point`, non-draggable — φ law), `beta_chip`, `Abeta_chip`.
**Suggested glow:** `accum_head`.
**Narration (45 words) — no over-generalisation (2c: TRUE for this curve only, no "every function" language):**
> "Sweep the upper bound rightward: the filled region grows, and its running total is traced at the same moment as a new curve, A of x. By x equals 2, that curve ends at 2.6667 — the same number the rectangles were heading for all along."

### STATE_8 — "Explore: Drag the Bound"
`drag-sandbox` · core · `interaction_complete` · **ALL controls**: `n` (4–200, step 4), `c` (0–1, step 0.1), draggable `b` (0.2–2.0) · 0 words / open (Rule 37 free-run).
**Motion (§12):** curves + region drawn 0–2500 ms; `b` `ping_pong` 0.6↔2.0 (9 s/leg) from 2500 ms until a real drag seizes it.
**Primitives:** `plane`, `curve`, `region`, `bars` (`mode:"left"`, teacher-controlled `n`), `bound_marker` (draggable), `n_chip`, `Sn_chip`, `integral_chip`, `b_chip`, `c_chip`. **No `area_total`/`area_below` chips** — per skeleton §10b, S8's HUD is `n, Sₙ, ∫, b, c` only (core-ring content, 38b — the sign-magnitude split is an S5 lesson, not re-taught here).
**No narration** — the teacher's own drag carries the payoff.

---

## 4. Notation ladder (Rule 38c)

**Core + extended (S1, S2, S3, S5, S6, S8): algebra and geometric forms ONLY.** "Rectangle area is width times height", "the curve's value at its left edge", "the estimate", "the exact total", plain fractions (`4/n`). **`lim` never appears on any core or extended surface.**

**`∫` — GRANTED on core S4 (FLAG 1, founder-ratified 2026-08-06, re-verified true on canvas after F3):** `S3` prints `exact` (a plain word, no symbol); `∫₀²x²dx`'s value chip first appears at **S4**, which is `core`. This is the concept's own defining state (§1's atomic claim: "the definite integral is... the single number a sum of rectangle areas approaches"), so `core_only` never ships a lesson about the definite integral that withholds its own name.

**`lim(n→∞)` — DENIED on every core surface**, including S4. S4's formula surface is the exact `gap = 4/n − 4/(3n²)` (F2) — an identity about the GAP, never a limit statement written in `lim` notation. The only surface anywhere in this concept licensed to carry `lim` is **S7 (advanced)**, and even there the authored surface is `A(x) = x³/3` (no `lim` actually rendered) — `lim` is PERMITTED at that ring, not mandated.

**F17 — `Σ` and `xᵢ` on S2's core surface, the required ledger rows (38c argument):**

| Quantity | On-canvas label | Primitive | Defined in | Used in | 38c argument |
|---|---|---|---|---|---|
| the sum sign | `Σ` (inside `Sₙ = Σ f(xᵢ)·h`) | formula surface (`fs`) | S2 | S2 only | Unlike `lim` (an operator with its own semantics, taught only informally here), `Σ` NAMES an addition the screen performs while the surface is read: four rectangles arrive one by one (staggered reveal), four areas visibly add. The symbol is read OFF the drawing — the 38c test for a core surface. |
| the sample point | `xᵢ` (same surface) | formula surface (`fs`) | S2 | S2 only | `xᵢ` is the left edge of each partition line that `show_partition` draws — a rendered mark, not an abstraction. Neither symbol appears on any OTHER core surface (S3 uses `Sₙ` and `exact` as bare words with no `Σ`; S6's surface is `left ≤ ∫ ≤ right`, no `Σ`). |

**Dialect (38d), once then bare:** "left sum (left Riemann sum)" — S6 only, term-only pairing at first appearance. Every other state says bare "left sum"/"sum". **Reader-facing noun is "rectangle" everywhere** — "bars"/"blocks"/"strips" never appear in any narration, title, cue, or label (A14).

**Cut-coherence, re-verified sentence by sentence against the NARRATION authored above (not only the design intent):**
- **Cut 1 (hide S7):** no surviving narration line (S1–S6, S8) names `A(x)`, "accumulation", or the FTC. None uses `lim`. **Coherent.**
- **Cut 2 (hide S6, S7):** no surviving narration names "midpoint" or "right sum" (those words appear only in my S6 draft, which is cut). S8's narration is 0 words (explore, silent) — no leaked vocabulary risk there. Every quantity S8's HUD prints (`n, Sₙ, ∫, b, c`) is introduced by a surviving core state, `∫` by S4 (core). **Coherent**, matching skeleton §10(i-1).

**Interval notation:** never rendered on canvas anywhere in this concept — no board-dialect conflict to declare (matches skeleton §10(i-5)).

---

## 5. Drill-down clusters (9 × 5)

**S3 — `why_thinner_rectangles_are_closer`**
1. "why does making the rectangles thinner make the total more accurate?"
2. "if four rectangles were already close, why do we even need a thousand?"
3. "does thinner always mean better, or could it go wrong somehow?"
4. "how thin do the rectangles have to get before the answer stops changing?"
5. "why does adding more pieces fix the gaps instead of just adding more error?"

**S3 — `does_the_sum_have_a_ceiling`**
1. "does the sum ever stop growing, or does it just keep climbing forever?"
2. "how do we know the number is settling and not still slowly rising?"
3. "could the sum overshoot the real answer and then come back down?"
4. "is there a highest possible value the sum can reach?"
5. "what stops the sum from just growing without any limit?"

**S3 — `rectangles_vs_the_smooth_region`**
1. "the rectangles have flat tops and the curve is round — how can they ever be the same shape?"
2. "even with a thousand rectangles, isn't there still a tiny gap along the top?"
3. "why do blocky shapes end up equalling a smooth curved area?"
4. "if I could zoom in forever, would I still see the rectangle corners?"
5. "is the region actually made of rectangles, or do the rectangles just estimate it?"

**S4 — `approaching_is_not_reaching`**
1. "if the gap never becomes exactly zero, how can we say we know the exact area?"
2. "isn't 'never reaching zero' the same as 'never actually finding the answer'?"
3. "how small does the gap have to get before we can just call it zero?"
4. "why can't we just say the gap is basically zero once it's really small?"
5. "does the gap ever jump back up, or does it only ever shrink?"

**S4 — `what_a_limit_means_here`**
1. "what does 'the limit' actually mean if no rectangle count ever gets there?"
2. "is the limit just a rounded version of the closest number we can compute?"
3. "why do we trust a number that no finite calculation ever produces exactly?"
4. "how is a limit different from just a really good approximation?"
5. "does the limit depend on which side we approach n from?"

**S4 — `why_define_it_as_a_limit`**
1. "why not just define the area as whatever a huge number of rectangles gives?"
2. "what goes wrong if we skip the limit and use n equals a million instead?"
3. "is defining it as a limit just a technicality, or does it actually matter?"
4. "why does the formula for the gap matter if the picture already looks the same?"
5. "couldn't we define the area some other way that avoids limits entirely?"

**S5 — `negative_area_meaning`**
1. "how can an area be negative if area is just a size?"
2. "does the region below the axis actually disappear, or is it still there?"
3. "is 'negative area' just a way of keeping score, not a real area?"
4. "why does going below the axis flip the sign instead of just measuring the same way?"
5. "if I flip the picture upside down, does the negative area become positive?"

**S5 — `signed_vs_total_area`**
1. "what's the difference between the total area and the answer the integral gives?"
2. "why would anyone want the signed answer instead of the actual amount of area?"
3. "if both numbers describe the same picture, why do they disagree?"
4. "which of the two numbers is the 'real' one — the total or the signed total?"
5. "does every problem need both numbers, or only some of them?"

**S5 — `where_the_sign_flips`**
1. "how does the formula know exactly where the curve crosses the axis?"
2. "what happens to the rectangles right at the point where the curve crosses zero?"
3. "does the sign flip suddenly at one point, or does it happen gradually?"
4. "if the curve barely dips below the axis, does the sign still flip?"
5. "why does one crossing point change the sign of an entire rectangle?"

---

## 6. Constraint callouts (domain first)

1. **`f(x)=x²−c` has no excluded point, ever** (2a). The entire honesty burden is the DRAWN interval `[0,b]` versus what any claim quantifies over — every `n→∞` claim is scoped to a fixed `[0,b]`; `A(x)` is drawn only on `[0,2]`; item 4/6 transfers beyond `c`'s and `β`'s live ranges are legitimate paper transfers, not sim claims (2c).
2. **`gap(n)=b³(3n−1)/(6n²)` is exact, always positive, independent of `c`** (2b, 2e) — verified over `n∈[1,200000]`. Its S4 instantiation (`b=2,c=0`) is the ONLY place this concept renders it; S4's `gap_chip` computes from this closed form directly ("by construction"), never from `exact − Sₙ`.
3. **`max_bars_drawn` is per-primitive and opt-in** (2f, source-verified) — author it ONLY on S4 (`400`, with the `rectangles drawn: {n_drawn} of {n}` disclosure); never on S3 or S6.
4. **Pixel↔data scale factor, declared once, reused verbatim:** main plane `220 px/x-unit`, `62 px/y-unit`, origin px `(180, 357)`; the S4 inset is a SEPARATE `plane_id` (`"inset"`) with `920 px/x-unit`, `145 px/y-unit` — never mixed with the main factor in one expression.
5. **`area_below` clamps `|v| < 0.00005 → 0` before `.toFixed(4)`** (engine-bug-queue check above) — the only quantity in this concept that can arrive at a signed-zero float (at `c=0`, S5's entry).
6. **The n-law and φ-law hold exactly as skeleton §3 states them:** `n` is never choreographed directly (only `nlog` is, via `n_expr:"round(pow(10,nlog))"`); `beta` is never a slider and never a `plot_point.drag.bind_variable` (verified against source, φ-law's second seizure door confirmed closed).
7. **Reader-facing noun is "rectangle"** — never "bars"/"blocks"/"strips" in any narration, title, cue, or label.

---

## Numerical sanity check — full log (python3, run not eyeballed)

```
I(2,0) = 2.6666666666666665
L(4)=1.75 R(4)=3.75 M(4)=2.625 T(4)=2.75
L(8)=2.1875 M(8)=2.65625 R(8)=3.1875 T(8)=2.6875
L(96)=2.625144675925926 M(96)=2.6665943287037037 R(96)=2.708478009259259
L(127)=2.6352532705065412
gap(100)=0.03986666666666672  4/100=0.04
gap(200)=0.019966666666666466
gap(4)=0.9166666666666665 gap(10)=0.3866666666666667 gap(1000)=0.003998666666666484 gap(10000)=0.0003999866666664076
gap positive for n in 1..200000: True
gap(n) closed-form check (4/n - 4/(3n^2) vs b^3(3n-1)/(6n^2)) — identical for n in {4,10,100,400,1000,10000}
gap independent of c: verified True across b in {0.5,1.3,2.0}, n in {4,37,250}, c in {0, 0.73} (matched to 1e-12)
area_below(2,1)=-0.6666666666666667
area_total(2,1)=2.0
I(2,1)=0.6666666666666665
I(2,2)=-1.3333333333333335   (assessment item 4)
A(2,0)=2.6666666666666665
A(1.3778,0)=0.8718409956506665   (S7 pin, matches skeleton probe)
A(3,0)=9.0   (assessment item 6)
item1 [0,1], n=2, f=x^2: left=0.125 right=0.625 mid=0.3125 trap=0.375
item3: gap(200)=0.019966666666666466
S3 n=400 crossing (if capped, which it is NOT — 2f): t≈17510.8 ms
S6 n=400 crossing (if capped, which it is NOT — 2f): t≈19236.97 ms; S6 ramp end n=501
```

Every number above independently reproduced the skeleton's own probe output (§12) to the digit; no divergence found.

---

## Self-review checklist

- [x] Every quantity referenced in the skeleton's narratives (`b`, `c`, `n`/`nlog`, `beta`, `xdraw`, `fillx`) appears in `variables` with a domain agreeing with §2's ledger.
- [x] Domain & validity ledger complete: domain/range/no-exclusions, drawn interval vs. full domain, boundary behaviour, and every "for all"/"always"/"never" claim traced to a named fact with hypotheses checked against THIS setup (2a–2f).
- [x] No narration or caption generalises beyond the interval drawn — S6 explicitly states its "increasing f" hypothesis in words; S7 makes no "every function" claim; item 4/6 transfers are flagged, not silently absorbed.
- [x] Every state's archetype is `[LIVE]` — source-verified against `parametric_renderer.ts` at this desk's HEAD (`ad569ae`), not merely cited; no archetype needs an unbuilt scenario.
- [x] Rule 31 timeline per state, pure function of the state clock; no two guided states share an archetype (`trace-locus`/`decompose`/`refine`/`limit-approach`/`parameter-sweep`/`cycle-compare`/`accumulate`/`drag-sandbox` — eight distinct); no static state; controls match the architect table verbatim; explore = ALL controls, 0 narration.
- [x] Rule 32 sequencing verified per state (cause-before-effect via reveal order, e.g. S1's curve-then-fill, S4's inset-then-frozen-main). Rule 33 register-triangle + a real number declared per state. Rule 34 one formula surface per state, transcribed with FLAG-1/F2 applied.
- [x] Word budget: every authored narration count is ≤ its `words_max` hard cap (F9 table above), and within the skeleton's design range in every state but S1/S2/S5 (2–5 words under the design floor, comfortably inside the Rule-31 25–55 band — motion outrunning narration is the legal asymmetry, never the reverse).
- [x] Notation ladder: `lim` absent from every core/extended surface; `∫` present only from S4 onward (core, FLAG 1); `Σ`/`xᵢ` argued and ledgered for S2 only (F17); dialect dual-label exactly once (S6).
- [x] Pixel↔data scale factor declared once per plane (main + inset) and reused verbatim.
- [x] Exact-before-decimal: formula surfaces carry exact symbolic forms; HUDs carry declared, constant precision; `gap`'s 6 dp is the one exception, declared once and never varying.
- [x] 45 drill-down phrasings across 9 clusters — plain English, real-student voice, no Hinglish, no textbook prose.
- [x] `constraints`: 6 in `engine_config` (domain-first) + 7 callouts.
- [x] Numerical sanity check RUN via `python3` — full log above; every skeleton-cited number independently reproduced to the digit; two new facts verified (`gap` is `c`-independent; `max_bars_drawn` is per-primitive, not global).
- [x] Engine bug queue consulted (own sweep); every relevant `prevention_rule` satisfied, mitigated, or FLAGged rather than silently resolved.
- [x] Rule 41 sweep: no idioms, no personification — "settles", "heads for", "draws closer" retained as literal, precedented house vocabulary (matching the `derivative_as_secant_limit` sibling's own retained set); a curve never "wants" or "chases" anywhere in this document.
- [x] Assessment answers re-verified (6/6, python-checked); every distractor traces to a named misconception or a measured wrong rule (item 1's `0.625`, F8).

**Source check line:** *Consulted the NCERT Class-12 Mathematics chapter index (Integrals) and the named international specifications (IB DP AA subject guide, AP Calculus AB/BC CED, Cambridge 0606 syllabus, A-level Pure specifications) for SCOPE only — unchanged by this pass, no new curriculum claim authored. NCERT Exemplar consulted for misconception BELIEFS only (M1/M2/M3, inherited from skeleton §4). No teaching method, example problem, or figure imported. HC Verma and DC Pandey not consulted — physics-only sources, forbidden for mathematics.*

---

## FLAGS

**1 — S5's `riemann_bars` count is unspecified by the skeleton.** No section of the skeleton states what `n` S5's rectangles are drawn at (S5's per-state HUD, §10b, shows no `n`/`Sₙ` readout at all — its numeric focus is the area totals). Recommended here: **static `n=4`**, matching S2's apparatus for Rule-32d home-pose continuity (the same four rectangles a viewer met first, now some hanging below the axis). Needs founder/json_author confirmation, not assumed as decided.

**2 — S1's `x_domain.max_expr` wiring.** The skeleton's A3 ruling authors `x_domain.max_expr:"b"` "in every state, not only S1", but S1 ALSO needs a draw-in reveal (`xdraw`) distinct from `b`. Recommended: `max_expr:"min(xdraw, b)"` — confirmed buildable (`min` is in `PM_buildEvalScope`'s whitelist, Source verification above), and the handoff is discontinuity-free because `xdraw`'s ceiling (2.0) equals `b`'s static default in S1 (S1 exposes no `b` control). This is a recommendation, not a re-derivation of an already-decided value — the skeleton left the exact expression unstated.

**3 — `max_bars_drawn` resolved, recorded for downstream.** What looked like a possible silent-truncation gap in S3/S6 (both cross `n=400` mid-ramp: measured `t≈17511 ms` and `t≈19237 ms` respectively) turned out, on reading the renderer source, to be a non-issue: `max_bars_drawn` is opt-in per primitive, not a global cap, and the skeleton's own DoD table (§10b) authors the disclosure mechanism on S4 only. Recorded as a constraint (§1, §2f) precisely so `json_author` does not "helpfully" copy S4's `max_bars_drawn:400` onto S3/S6 by pattern-matching — that copy WOULD introduce the defect this flag was raised to check for.

**4 — Assessment items 4 and 6 exceed the sim's live-draggable range.** Item 4 uses `c=2` (slider max is `1`); item 6 uses `x=3` (`beta`'s max is `2`). Both are mathematically sound (the closed-form antiderivatives hold for every real input) and both match the precedent set by `derivative_as_secant_limit`'s own item 1 (transfer beyond the drawn window, explicitly ruled legitimate there). Flagged for visibility only — not a defect, not proposed for correction, but the founder/quality_auditor should see it named rather than discover it independently.

**5 — S6's on-canvas surface cannot carry its own hypothesis.** `left ≤ ∫ ≤ right` is true only because `f` is increasing on the drawn interval; Rule 34b's one-surface-per-state cap means the qualifier cannot live on canvas. This document's authored narration states it in words ("because this curve keeps rising") — `quality_auditor` should verify this specific clause survives transcription into the final `text_en`, since dropping it would let the surface read as a universal inequality it is not.

**6 — Glow bindings suggested, not authored.** `tts_sentence_glow_channel_unused_across_an_entire_subject_namespace` (OPEN, owner `alex:json_author`) currently holds at zero across every shipped mathematics concept. §3 above suggests one glow target per state, each matching that state's own already-ratified Rule-32 focal (no new judgment call — just a transcription of an existing decision into the `tts_sentences[].glow` field). Left as a suggestion because authoring that field is `json_author`'s contract, not this role's.

**No STOP condition was raised.** Every primitive and archetype this design needs (`cartesian_plane`, `function_plot`, `region_fill`, `riemann_bars` with `show_partition`/`reveal_stagger_ms`/`sum_var`/`bars_drawn_var`/`max_bars_drawn`, `plot_point` with drag-seize, `locus_trace`, `label.position_expr`+`plane_id`) is confirmed live at this desk's HEAD (`ad569ae`, 2026-08-08) by direct source-reading, not by trusting the skeleton's citations.
