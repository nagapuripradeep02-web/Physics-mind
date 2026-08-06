# ARCHITECT SKELETON — `definite_integral_as_accumulated_area` — **AMENDMENT ROUND 1 (Checkpoint A `DESIGN_FIX` applied)**
## "The Definite Integral as Accumulated Area"

> Subject: **mathematics** · **chapter 7 (Class 12, Integrals)** · class_level 12 · `is_spine: true`
> *(§ numbering deliberately NOT carried — Checkpoint A FLAG-5 ruling: a section number that is a claim inside a catalog key gets copied forward and never re-checked. Chapter level only, which is verifiable from the NCERT chapter index.)*
> Pipeline: `architect → mathematics_author → json_author → quality_auditor`
> Renderer: `parametric` (PCPL) — `renderer_pair.panel_a: "parametric"`, **no `panel_b`**. JSON lives ONLY in `src/data/concepts/mathematics/`; validation = `npm run validate:mathematics`.
> Ranked-list authority: `MATHEMATICS_DISCUSSIONS.md` §6 **P1 #3** (breadth 6.5/7; capabilities 1, 2, 4).
> Archetypes: **A — coordinate plane with a live function** + **H — limit approach** + **I — build-up / accumulation** (`docs/patterns/mathematics.md` §1), all three `[NEEDS-SCENARIO]` — which is why this document exists. *(Round-1: naming these discharges `archetype_live_tier_unverified_against_renderer` — the discharge is §⓿'s VERIFIED/SPEC split, which is what that scar asks for when the tier is NOT live.)*

> ## ⚠ WHAT THIS DOCUMENT IS
> **Phase 0b (`AUTHORING_PIPELINE.md` §0): the design of the chapter's most demanding concept, whose job is to be the ENGINE'S REAL SPEC.** It consumes 13 of the 17 in-scope `cartesian_plane` union rows and is the sole driver of two. **It is NOT the first concept to be built** — #1 `graph_transformations` ships first. **No state below is certified buildable**: §⓿ splits every mechanism into VERIFIED (read at file:line) and SPEC (does not exist).

> ## Amendment log — Checkpoint A cycle 0 → `DESIGN_FIX`, 19 findings, all applied
> **A1 (P1)** — §12 quoted Rule 31 backwards and declared *narration longer than motion* legal on five states (S1 by 11.8 s). It is the banned direction. **Every state retimed**; §12 recomputed from scratch, not patched. Also caught in round 1: **S2 failed the same check and the round-0 table marked it ✓** — Checkpoint A's own affected-list missed it. **A2 (P1)** — S4's magnifying inset was drawn on top of the ink it magnifies (its rect contained the curve endpoint at px (620, 109)); moved and re-solved against the ink. **A3 (P1)** — `b ∈ [0.2, 2.5]` drove f out of the frame (f(2.5) = 6.25 > y_max 4.5) and the default `x_domain` let the curve exit at x = 2.121 on every state; b capped at 2.0, `x_domain` authored everywhere. **A4 (P1)** — the left rule's first rectangle has **zero height**, so "four rectangles" was three on screen; `show_partition` bought, cue and narration re-authored. **A5 (P1)** — the union walk recorded each state's NEW row, not every row it consumes; re-run as a consumption walk, which surfaced **three contract fields the design uses and neither document declared**. **A6 (P1)** — FLAG 2 ruled: delta 2 relocated the second implementation instead of removing it; replaced by a **publication contract** (`sum_var`). **A7 (P1)** — FLAG 1 ruled SPLIT: **∫ granted on core S4, `lim(n→∞)` denied on every core surface**; fixes a Rule-34b double formula surface on S4 and a Rule-38b violation on S8. **A8–A14, P3 15–19** — rhythm differentiation, cap token 2.37 s late on an arithmetic slip, `trapezoid` kept (the 0a gate already asserts it), `reveal_stagger_ms` bought, S8 given Rule-37 motion, `entry_state_map` ring-tagged, one noun for one object, pin values recomputed, vacuous contrast-pair declaration deleted, two scar rows named, chip renamed, 38a order argued.
> **Reviewer contradiction resolved rather than obeyed twice:** A4 proposed the cue *"Four strips, left heights"* while A14 banned "strips" in favour of "rectangles". Resolved toward A14 (the general rule beats the local phrasing): **"Four rectangles, left heights."**

---

## Engine bug queue consultation — LIVE SWEEP RUN 2026-08-06

- `--owner alex:architect` → **74 rows** · `--row-type directive` → **86** · `--pcpl` → **55** · `definite_integral_as_accumulated_area` → **0** (new id).
- `--scenario` lane not run, with the reason: it derives its id set from authored `field_3d` scenario names, and PCPL has no scenario dispatch at all (its only `scenario_type` is a *variable* inside `computePhysics_normal_reaction`, `parametric_renderer.ts:251`). Coverage boundary enumerated per `scar_audit_claims_a_coverage_boundary_it_did_not_enumerate`: owner + directive + pcpl + concept-id.

**Rule 40a sweep (`git log --all -S`, all branches):** `plot_point` · `region_fill` · `riemann_bars` · `secant_line` · `plane_id` · `PM_planeRegistry` → **0 hits each**. `cartesian_plane` (5), `function_plot` (1), `tangent_line` (1) → **all documentation** (`6d2342f`, `cb49ba4`, `3b23caa`, `ac025bd`, `2d4cb06`). Nothing is being built twice.

---

## ⓿ Mechanism verification — VERIFIED vs SPEC

**VERIFIED — read in `src/lib/renderers/parametric_renderer.ts` (2026-08-06), and independently re-read at every cited line by Checkpoint A:**

| Mechanism | Verified at | Consequence |
|---|---|---|
| Animate any numeric knob | `PM_choreoValue :1153` · builder `:1104` · applied `PM_applyChoreography :3530` · spec `{variable, mode:'once'\|'loop'\|'ping_pong', from, to, start_ms, duration_ms, holds:[{at_value,hold_ms}]}` | **Every animated knob in PCPL is a VARIABLE** — the whole scriptability answer (§13b) |
| ⚠ `holds` are placed by **VALUE fraction**, not time | `:1111` — `frac = (hold.at_value − from) / span` | **A linear `n: 4 → 1000` ramp is useless** (n = 8 lands 0.4 % in). Forced the n-law |
| Expression scope | `PM_liveExprVars :1020` · `PM_safeEval :954` · `PM_buildEvalScope :931` | whitelist contains `pow round log exp floor abs` → `round(pow(10, nlog))` is legal today |
| Text interpolation with `.toFixed()` | `PM_interpolate :1031` | every readout below is a `label.text_expr` |
| The two brackets | `PM_animationGate :771` · `PM_focalEmphasis :816` | per-primitive reveal + focal |
| Trace: freeze-deterministic, clamped at `end_ms`, resampled from scratch | `drawLocusTrace :2445` · `PM_LOCUS_TRACE_MAX_SAMPLES = 240 :2443` | S7's accumulation curve; budget §12 |
| ⚠ **THE φ LAW** | `PM_choreoVarsAtTime :2400`, slider merge `:2410`, seize guard `:2418` | S7's sweep runs on `beta`; S7 exposes no slider |
| Drag-seize | real drag only `:3212` · stand-down `:3540` · caption follows choreography until seized `:3156` | b and n behave under a teacher's hand; S8's `ping_pong` yields instantly (A12) |
| Slider geometry | `PM_resolveSliderSlot :3109` · `CONTROL_ZONE {30,460,700,40}` `:3066` | fixes the viewport's bottom edge at y = 450 |
| ⚠ Slider caption precision hardcoded `toFixed(step < 1 ? 1 : 0)` | `:3180` | no slider carries a >1 dp quantity |
| Bodies / labels / annotations / formula surface | `:1212` · `:1676` · `:1716` · `:2814` | non-plane furniture is shipped |
| Canvas 760×500 | `createCanvas :3617` · `PM_fitCanvas :3584` | §11 |
| Primitive dispatch (Pass 3) | `:3830-3848` | **a new `type` not added here draws nothing, silently** |

**SPEC — does not exist; this document is the request.** Rows map to `docs/MATHEMATICS_PHASE0_CARTESIAN_PLANE.md`:

| Needed | Union row | Clones | States |
|---|---|---|---|
| frame + data↔pixel transform + ticks/grid | F1–F4, F6 | `PM_surfaceRegistry`'s Pass-0 pattern; `drawVIGraph`'s `toX`/`toY` shape (`particle_field_renderer.ts:6425`) | all |
| `plane_id` opt-in on `vector`/`label`/`body`/`locus_trace` | F7 | `attach_to_surface` resolution (Pass 0.5) | S1, S4, S5, S7 |
| `function_plot` (samples the DOMAIN) | F8 | `drawLocusTrace`'s sampler, re-parameterised on x | all |
| `plot_point` (+ readout, + drag) | F11, F12 | `drawBody` + the slider drag path | S5, S7, S8 |
| `region_fill` (signed) | F15 | — | S1, S2, S3, S5, S7 |
| `riemann_bars` | F16 | — | S2, S3, S4, S6, S8 |
| accumulation trace in data coords | F17 | `locus_trace` + F7 — **no new primitive** | S7 |

---

## 1. Atomic claim

This concept teaches that **the definite integral is the exact total accumulated under a curve across an interval — the single number a sum of rectangle areas approaches as the rectangles get thinner — and that a piece lying below the axis subtracts from that total.** It does not cover techniques of integration, the proof of the Fundamental Theorem, improper integrals, volumes of revolution (P3 #8), the derivative (P1 #2), or area between two curves. The one bridge it builds is S7: **the total accumulated so far is itself a function of where you stop** — the FTC *seed*, authored as an observation about a plotted curve, never as the theorem.

## 2. State count + arc — 8 states (complex, justified)

**Count justification (Rule 11).** The concept carries the region, the partition, refinement, the limit, the sign convention, the independence of the sampling rule, and the accumulation function. Exam test — a student who watches all 8 can answer: estimate ∫₀¹x²dx with two rectangles; what happens to Sₙ as n grows; is ∫₀²(x²−2)dx positive or negative; which of left/right/midpoint over-estimates an increasing function; if A(x) is the area from 0 to x under y = x², what is A(3). Each traces to a named state (Block 1). **D1 check (Checkpoint A):** nothing is derivable from its predecessor — S3 is *the sum gets closer*, S4 is *it never arrives and the gap is 4/n*, and collapsing them is exactly how "approaching = reaching" survives a lesson.

**Ring order (P3-19, argued rather than left silent).** S4 carries `derivation_first_principles` and sits before the quantitative S5/S6, which inverts Rule 38a's `qualitative → quantitative → derivation` at first reading. It is deliberate: S4 completes the **core definition** (what the integral *is*), and S5/S6 are corollaries of that definition, not deeper quantitative work. The 38a constraint that binds mechanically — *the advanced ring is a contiguous block immediately before explore* — holds exactly: advanced = {S7}.

| # | Title (Rule 41d) | Purpose | teaching_method | ring |
|---|---|---|---|---|
| S1 | The Region Under the Curve | The apparatus: the frame, y = x² on [0, 2], the region named but not measured | *(straightforward)* | core |
| S2 | Four Rectangles Estimate It | The partition: four rectangles as tall as the curve at their left edges — including one of zero height | *(straightforward)* | core |
| S3 | More Rectangles, Closer Sum | **PRIMARY AHA** — n grows, rectangles thin, the sum climbs toward one number | *(straightforward)* | core |
| S4 | The Gap Shrinks, Never Zero | The limit: the gap is exactly 4/n — it halves forever and is never 0 | derivation_first_principles | core |
| S5 | Below the Axis Counts Negative | The sign convention: lower the curve, and the part beneath the axis subtracts | *(straightforward)* | core |
| S6 | Three Rules, One Limit | Left, right and midpoint give three different sums at every finite n — and all three head for the same number | *(straightforward)* | extended |
| S7 | The Area So Far Is a Function | Accumulation: sweep the upper bound and plot the running total, A(x) = x³/3 | derivation_first_principles | advanced |
| S8 | Explore: Drag the Bound | Teacher sandbox — n, c and a draggable upper bound; core-ring content only | exploration_sliders | core |

The hook MOVES from t = 0. Advanced ring = {S7}, contiguous immediately before explore ✓.

## 3. Per-state choreography + control plan (Rule 31 — the control table, FIRST artifact)

**The function, fixed once and never re-derived (hazard 7).** `f(x) = x² − c` on `[0, b]`. Exact closed forms — the concept's functional contract, handed to `mathematics_author`:

```
I(b, c) = b³/3 − c·b                       exact integral
L(n)    = b³(n−1)(2n−1)/(6n²) − c·b        left sum
R(n)    = b³(n+1)(2n+1)/(6n²) − c·b        right sum
M(n)    = b³(4n² − 1)/(12n²)  − c·b        midpoint sum
T(n)    = (L(n) + R(n))/2                  trapezium rule   ← kept, A10
gap(n)  = I − L(n) = 4/n − 4/(3n²)         (at b = 2, c = 0)
A(β, c) = β³/3 − c·β                       accumulation (S7)
```
Canvas values, all exact: `I(2,0) = 2.6667` · `L(4) = 1.7500` · `R(4) = 3.7500` · `M(4) = 2.6250` · `L(8) = 2.1875` · `M(8) = 2.65625` · `R(8) = 3.1875` · `T(8) = 2.6875` · `L(96) = 2.6251` · `M(96) = 2.6666` · `R(96) = 2.7085` · `L(127) = 2.6353` · `I(2,1) = 0.6667` with the below-axis piece `−0.6667`, the above-axis piece `+1.3333`, total area `2.0000`.

**The n-law (forced by `:1111`).** `n` is never choreographed. Every sweeping state choreographs **`nlog`** with `n_expr: "round(pow(10, nlog))"`, so equal time buys equal decades. `nlog` is choreography-only and never a slider (its caption would print `1.8` — `:3180`). The teacher-facing `n` slider exists only in S8, linear, over a range where every value is drawable.

**The φ law.** The only `locus_trace` is S7's accumulation curve; it runs on **`beta`**; S7 exposes no slider. Slider-variable ∩ trace-identifier = ∅ in every state.

**Noun discipline (A14, Rule 41).** The reader-facing word is **"rectangle"** — in every title, cue, label and narration line. "Bars", "blocks" and "strips" never appear in reader-facing text; `riemann_bars` keeps its primitive name in the contract only. Sampling-rule dialect (38d): **dual-label once in S6** — *"left sum (left Riemann sum)"* — then bare.

| St | Teaches (one idea) | Archetype | Distinct motion | **Rhythm claim (A8)** | Delta cue (≤5 words) | Live controls | Words | Ring | Register | The real NUMBER |
|---|---|---|---|---|---|---|---|---|---|---|
| S1 | A curve over an interval bounds a region, and that region has one exact size | `trace-locus` | Frame reveals; the curve DRAWS left→right (`x_domain.max_expr` ← `xdraw`, 0→2); then the region fills beneath it on its own driver | one edge travelling right, twice — first the curve, then the fill | The region under the curve | none | 40–50 (anchor inside) | core | graphical / numeric | `a = 0.00`, `b = 2.00`; **no area number yet** |
| S2 | A rectangle as tall as the curve at its left edge is one piece of an estimate | `decompose` | The smooth fill dims to 0.25; four rectangles appear left→right (`reveal_stagger_ms`), the dim region above each top being the missed sliver; `show_partition` draws the division lines so the **zero-height first rectangle is still countable** | four discrete arrivals, 3.5 s apart — nothing continuous | Four rectangles, left heights | none | 40–43 | core | graphical / numeric | `S₄ = 1.7500`, width `h = 0.5000` |
| S3 | **PRIMARY AHA** — thinner rectangles, closer sum | `refine` | `nlog` 0.602 → 3.0 (n: 4 → 1000), holds at n = 20 and n = 100; rectangles thin continuously and become the region | the whole partition converging; motion fills the frame | More rectangles, closer sum | none (watch beat) | 45–55 | core | graphical / numeric | `Sₙ = 2.6353` beside `∫₀² x² dx = 2.6667` and `gap = 0.031413` |
| S4 | The gap is exactly 4/n — it halves forever and reaches zero at no finite n | `limit-approach` | A **second plane** (inset over empty canvas, §11) with a drawn zoom-link shows the last rectangle's sliver; `nlog` 2 → 4 (n: 100 → 10 000); the main picture is **held visually static at the cap** while only the inset and the digits move | the frame has stopped; the inset and the number have not — the rhythm IS the lesson | Gap shrinks like 4/n | none | 40–50 | core | symbolic+graphical co-lead / numeric | `gap = 0.001736` at 6 dp, with `n` and `rectangles drawn` |
| S5 | A piece of the region below the axis subtracts from the total | `parameter-sweep` | `c` ramps 0 → 1: the curve lowers through the axis; the part below flips to the negative colour, its rectangles hang downward, and the total falls 2.6667 → 0.6667 | one slow continuous descent — the only state where the curve itself moves | Below the axis, negative | **draggable bound** `b` (0.2–**2.0**) | 45–50 | core | graphical / numeric | `total area = 2.0000` (dim) against `∫ = 0.6667` (bright) |
| S6 | Where inside each rectangle you sample changes every finite sum and not the limit | `cycle-compare` | At n = 8 the left set (outline) is joined by the right set (outline), bracketing, then the midpoint set (filled); then `nlog` sweeps and **the rectangles dim to 0.35 while the three readouts become the focal** | three numbers converging — the eye follows digits, not geometry; sweep 14 s against S3's 19 s | Three sampling rules | none | 40–50 | extended | graphical / numeric | at n = 8: `left 2.1875 · mid 2.65625 · right 3.1875`; at the pin (n = 96): `2.6251 · 2.6666 · 2.7085` |
| S7 | The total accumulated so far is itself a function of where you stop | `accumulate` | `beta` sweeps 0 → 2: the fill grows rightward while A(x) = x³/3 is traced on the same frame in data coordinates, its head marked; A ends at 2.6667 — the number S3 and S4 converged on | one head travelling right, drawing a curve that did not exist before | Area so far, plotted | none (φ law) | 35–50 | advanced | graphical+symbolic co-lead / numeric | `β = 1.38`, `A(β) = 0.8718`, ending `A(2) = 2.6667` |
| S8 | Teacher sandbox — the estimate, the bound and the sign under the teacher's hand | `drag-sandbox` | **The bound sweeps on a `ping_pong` (0.6 ↔ 2.0, 9 s) from t = 2500 until a real drag seizes it** (Rule 37: the explore state keeps moving; `:3540` stands choreography down on a real drag `:3212`) | a handle already moving — which is also what makes it discoverable | Drag the upper bound | **ALL: `n` (4–200, step 4) · `c` (0–1, step 0.1) · draggable bound `b` (0.2–2.0)** | 0 / open | core | graphical / numeric | `n`, `Sₙ`, `∫`, `b`, `c` live |

**Rule 32 plan.** Home pose = one frame, `x ∈ [−0.5, 2.5]`, `y ∈ [−1.5, 4.5]`, identical in all 8 states; it never pans, zooms or rescales (S4's inset is a SECOND plane over empty canvas — Rule 29 bans growing an element for emphasis; Rule 33 is the pattern an inset with an explicit zoom-link belongs to). Cause-first is REVEAL ORDER throughout. Exactly ONE glow focal per state: S1 region · S2 the rectangle set · S3 the rectangle set · S4 the inset sliver · S5 the below-axis lobe · S6 **the three readouts** · S7 the A-curve head · S8 none.

**advance_mode (Rule 15 / Gate 12):** S1–S7 `manual_click`, S8 `interaction_complete` → 2 distinct modes.

**Control decision, argued.** One guided state carries a live control (S5's bound), plus explore. **S3, S4, S6 are watch beats with zero controls, deliberately**: each is a *timed* comparison whose meaning lives in the sweep, and a mid-sweep drag would decouple the readout from the phase being narrated. Rule 31c permits a control-free watch beat; every archetype is produced by authored choreography with no teacher input. **S5 gets the bound** because the sign lesson is what a teacher sweeps by hand ("take b back to 1 — now the whole thing is negative"), and S5 has no trace, so the φ law does not apply. *(P3-16: the round-0 "declared contrast pair S2/S6" is **deleted** — a contrast pair exists to license an archetype repeat, and `decompose` vs `cycle-compare` is no repeat, so the declaration licensed nothing and could have read downstream as authorisation for one. The delta line stands on its own.)*

## 4. Misconception confrontation plan (Rule 16a — 3 genuine pivots)

No EPIC-C branches. `misconception_watch` on exactly S4, S5, S6.

| # | Wrong belief | State | Contrast beat (consequence first, then the mathematics — sequential) |
|---|---|---|---|
| M1 | "Adding up rectangles is only ever an approximation, so the 'exact area' is a fiction" — *approaching read as failing to arrive* | S4 | The gap is shown as a number and named by the formula on the state's one surface, `gap = 4/n`. Wrong expectation's consequence first: at n = 10 000 **the picture has stopped changing and the number has not**. Then: no finite n reaches it, which is why the integral is *defined* as the limit. `one_line_fix`: "No count of rectangles reaches it — the integral is the number they head for." |
| M2 | "Area is a size, so it is always positive; an integral cannot be negative" | S5 | The curve lowers until part of the region is under the axis. Wrong expectation first, as a dim chip: **`total area = 2.0000`** *(P3-18: renamed from "every piece positive" — it is not a wrong number, it is the unsigned area, the real named quantity Block-1's exam trace asks for)*. Then the real total, bright: **`∫ = 0.6667`**, with the below-axis rectangles drawn downward in the negative colour and their subtotal `−0.6667` beside them. `one_line_fix`: "Below the axis, the rectangle's height is negative — it subtracts." |
| M3 | "Left rectangles and right rectangles give different answers, so one of them must be the wrong method" | S6 | Three sums together at n = 8 — 2.1875, 2.65625, 3.1875 — all correct, all different; then n grows and the three readouts close on one another **without ever meeting**. `one_line_fix`: "The sampling rule changes every finite sum and not the limit." |

**Cue check.** No cue states a wrong belief as fact; read sound-off for sign, "Gap shrinks like 4/n" names the mechanism and "Below the axis, negative" states the truth. **S2's zero-height rectangle pre-loads M3**: the state that makes a silent sampling choice is the state M3 later interrogates.

## 5. `has_prebuilt_deep_dive` states

**S3** (the aha) · **S4** (the limit — the hardest idea here) · **S5** (sign; the most common exam error). V1.0 ships zero authored deep-dives; every other state's Explain button routes to the feedback form.

## 6. Drill-down clusters (3 per deep-dive state)

- **S3:** `why_thinner_rectangles_are_closer` · `does_the_sum_have_a_ceiling` · `rectangles_vs_the_smooth_region`
- **S4:** `approaching_is_not_reaching` · `what_a_limit_means_here` · `why_define_it_as_a_limit`
- **S5:** `negative_area_meaning` · `signed_vs_total_area` · `where_the_sign_flips`

Each cluster ships a migration seeding 5 `trigger_examples` — a **json_author deliverable** (scar `confusion_cluster_registry_unseeded_for_concept`), recorded in §10f.

## 7. `entry_state_map` — **ring-tagged with fallbacks (A13)**

```
entry_state_map:
  foundational: STATE_1 → STATE_4    # core — always available (contains the PRIMARY aha, S3)
  sign:         STATE_5              # core — always available
  method:       STATE_6              # EXTENDED — drops under core_only → falls back to foundational
  accumulation: STATE_7              # ADVANCED  — drops under no_advanced and core_only → foundational
  exploration:  STATE_8              # core
```
Default aspect = `foundational`. **The round-0 map routed two aspects at states the reduced presets hide** — `explore_controls_not_ring_gated_survive_the_ring_cut` one level up. The routing map is now item 4 on §10(i-1)'s cut checklist.

## 8. Prerequisites (advisory only — Rule 23)

`prerequisites: []`. Advisory background: reading `y = f(x)` off a graph; the area of a rectangle. **Collision check:** `definite_integral_as_accumulated_area` appears in no physics, chemistry or mathematics file (`area_vector.json` is the nearest name, a different id). All three directories checked.

## 9. Real-world anchor (Rules 35 / 38f — universal)

**Primary and only anchor: a vehicle's speed graph.** The area under a speed-against-time graph is the distance travelled — the interpretation every board uses, culture-neutral, true of any vehicle anywhere.

**Anchor delivery** (scar `skeleton_anchor_specified_in_section_9_reaches_no_narration_line`): assigned to **S1**, inside its 40–50 word budget, verbatim:

> **"A speed graph works this way too: the area under it is the distance the vehicle travelled."** *(17 words.)*

No secondary anchor. The sim's curve is `y = x²`, not a speed curve, so **the anchor is a sentence and is never drawn** — stated so no downstream agent labels the axes "speed" and "time".

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) Every state by id:** S1 region · S2 four left rectangles, one of zero height (S₄ = 1.75) · S3 refinement to n = 1000 / PRIMARY aha · S4 the limit, gap = 4/n (M1) · S5 sign (M2) · S6 three sampling rules (M3) · S7 accumulation A(x) = x³/3 · S8 explore.

**(b) Symbol-label table + term-introduction ledger** (the DEFINING state precedes every use, HUD included):

| Quantity | On-canvas label | Primitive | Defined in | Used in |
|---|---|---|---|---|
| the function | `y = x²` (curve-end, bare) | `label` | S1 | S1–S8 |
| interval ends | `a`, `b` (axis marks) | `label` + `plane_id` | S1 | S1–S8 |
| the region | *(no symbol — a filled area)* | `region_fill` | S1 | S1, S2, S3, S5, S7 |
| number of rectangles | `n` | HUD | S2 | S2–S8 |
| rectangle width | `h` | HUD | S2 | S2, S3 |
| **the zero-height rectangle** | the partition line at x = 0 | `riemann_bars.show_partition` | **S2** | S2 |
| the estimate | `Sₙ` | HUD (one label over the published value) | S2 | S2–S8 |
| the exact total | **`∫₀² x² dx` value chip** | value chip | **S4** (A7: the symbol names a number S3 already showed as `exact`) | S4–S8 |
| the shortfall | `gap` | HUD | S3 | S3, S4 |
| rectangles actually drawn | `rectangles drawn: {n_drawn} of {n}` | `label` over the published count | S4 | S4 |
| the lowering parameter | `c` | slider + HUD | S5 | S5, S8 |
| sampling rules | `left sum (left Riemann sum)` → bare; `right`, `midpoint` | `label` per set | S6 | S6 |
| the area-so-far | `A(x)` (curve-end) | `label` | S7 | S7 |

Per-state HUD: S1 `a`, `b` · S2 `n`, `h`, `Sₙ` · S3 `n`, `Sₙ`, `∫₀²x²dx`, `gap` · S4 `n`, `gap`, `rectangles drawn` · S5 `c`, `b`, total area and `∫` · S6 the three sums + `n` · S7 `β`, `A(β)` · S8 `n`, `Sₙ`, `∫`, `b`, `c`. All mathematics in real Unicode (`∫`, `Σ`, `β`, `₀`, `²`, `→`, `≈`). Object-anchored text is ALWAYS `label`; `annotation` ONLY for the free-floating delta cue. ≥40 px between any two text primitives, **re-verified for S4 specifically** (§11), which is the state that broke it in round 0.

**⚠ FLAG 1 — RULED (Checkpoint A): `∫` GRANTED on core S4; `lim(n→∞)` DENIED on every core surface.** Reasoning on the record: holding `∫` to advanced would make the `core_only` preset of *the definite integral* a lesson that never writes an integral sign — tripping `lesson_never_states_the_principle_it_is_named_after`, and leaving the narrowest claimed board (IGCSE 0606, which examines integral notation and **not** the limit-of-a-sum definition) served by the preset that omits the notation it examines. Rule 38c's operative harm is *machinery*; by S4 the object exists numerically and the symbol is a **name** for it. `lim` is a different object — an operator with its own semantics, taught only informally here — and is machinery. Consequences applied in (h).

**(c) Sign-convention plan:** x rightward, y upward, and **the canvas-y inversion lives only inside the plane's transform — it appears in no authored expression**, which is the entire point of F1. A rectangle's contribution is `f(xᵢ)·h` with its own sign; "negative area" is never said (Rule 41 — it is *a negative contribution*). Drawn intervals, declared: `x ∈ [0, b]` with **`b ∈ [0.2, 2.0]`** (A3), `y = x² − c` with `c ∈ [0, 1]`, `n ∈ {4 … 10⁴}` integer. **Interval honesty:** no caption generalises past the drawn interval; S4's limit statement is about `n → ∞` at fixed `[0, 2]`; S7's A(x) is drawn on `[0, 2]` only.

**(d) Motion plan:** §3 + §12. Terminations DECLARED: S1–S7 **one-shot-hold** (each claims a CHANGE, so none returns toward its start); S8 **`ping_pong` free-run** until a real drag seizes it (Rule 37). Entry configuration = the ramp's `from` value, stated per state in §12. No static state — **including S8, which round 0 declared "nothing self-animates" and which THE EYE would have read as `motionFramesEqual: true`** (A12).

**(e) Modes:** conceptual only (Rule 20 [D]).

**(f) `assessment` + `coverage_map` + registry.** `misconception_watch` on S4/S5/S6 only. **SIX items, matching the schema floor `questions: z.array(quizQuestionSchema).min(6)` (`src/schemas/conceptJson.ts:328`)**:

| # | Item | State | Distractor |
|---|---|---|---|
| 1 | Estimate ∫₀¹x²dx with 2 left rectangles → **0.125** | S2 | 0.375 (the right sum) |
| 2 | As n grows with the interval fixed, Sₙ … → **settles on one number** | S3 | "keeps growing without bound" |
| 3 | The left-sum gap on [0,2] behaves like 4/n; at n = 200 it is about → **0.02** | S4 | 0 — *M1* |
| 4 | Is ∫₀²(x²−2)dx positive, negative or zero? → **negative** (−4/3) | S5 | "positive — area is always positive", *M2* |
| 5 | For an increasing f, which of left / right / midpoint is largest? → **right** | S6 | "they are all equal", *M3* |
| 6 | If A(x) is the area from 0 to x under y = x², A(3) = → **9** | S7 | 27 |

No item reuses a number a state rendered as a worked pair. `coverage_map.by_state` maps 1–6 to S2…S7; **`non_assessed_states: [STATE_1, STATE_8]`**. Items 5 and 6 are ring-tagged `extended` / `advanced` and hidden by the preset that hides their state. **json_author deliverables:** the drill-down migration (§6) and `computePhysics_definite_integral_as_accumulated_area` + its TS twin registered in `ENGINES` (scar `parametric_computephysics_missing_silent_template_leak`), which under A6 computes **only** the closed forms the geometry cannot produce (`exact`, `A_beta`) — **never a Riemann sum** — plus the duty: assert no literal `{` survives in any rendered string.

**(g) Register-triangle plan (Rule 33, mathematics form).** Metrics: `Sₙ`, `∫`, `A(β)` are areas in the plane's own units — unitless, **4 dp**; `gap` **6 dp** (it must stay legible at 1.7·10⁻³ and below); `n` integer; `h` 4 dp; `b`, `β` 2 dp; `c` 1 dp (its slider caption is capped at 1 dp by `:3180`). **One quantity, one readout, guaranteed by construction (A6):** `riemann_bars` computes the sum once inside the loop that places the rectangles and **publishes** it (`sum_var: "S_n"`); it draws no text; exactly one `label` prints it. `gap` is a `label` over the published value. **No second implementation of a drawn quantity exists anywhere.** Correlates: n → rectangle count and width · Sₙ → total rectangle area · gap → the visible slivers, magnified in S4 · sign → rectangles hanging below the axis in the negative colour · A(β) → the second plotted curve. **Provenance is labelled**: when `n > max_bars_drawn` the canvas reads `rectangles drawn: 400 of 10000` from the published count — and it appears **at the crossing, not 2.37 s after it** (A9).

**(h) Canvas budget (Rule 34) — ONE formula surface per state, with FLAG 1 applied:**
S1 `y = x²` · S2 `Sₙ = Σ f(xᵢ)·h` · S3 `Sₙ → exact` (an arrow, never an equality — no rendered pair satisfies equality) · **S4 `gap = 4/n`** ← A7: round 0 authored `∫₀²x²dx = lim(n→∞)Sₙ` here *while* §4 required the gap "as a formula", which is **two formula surfaces on one state** (Rule 34b). The gap formula IS the lesson (§10g); `∫` enters as the value chip instead · S5 `f(x) = x² − c` · S6 `left ≤ ∫ ≤ right` · S7 `A(x) = x³/3` — **the only surface that may carry `lim`, and it is advanced** · **S8 `∫₀ᵇ (x² − c) dx`** ← A7: round 0's `= lim(n→∞) Sₙ` put an advanced operator on a core sandbox (Rule 38b). Top caption = the delta cue only; prose in the strip below; value-only HUD.
**Formula-vs-HUD unit diff** (`formula_surface_states_an_identity_in_a_unit_the_hud_never_renders`): each surface diffed against its own HUD. S6's `left ≤ ∫ ≤ right` holds numerically at every n for an increasing f — at n = 8: 2.1875 ≤ 2.6667 ≤ 3.1875 ✓; at n = 96: 2.6251 ≤ 2.6667 ≤ 2.7085 ✓.

**(i) Curriculum-flex block (Rule 38) — cuts argued by RING ASSIGNMENT alone; no `min_ring`, no hiding field:**

- **(i-1) BOTH cuts, in BOTH directions, over FOUR checklists — narration, formula surfaces, HUD quantities, and (A13) the routing map:**
  - **Cut 1 — hide advanced (drop S7):** survivors S1–S6, S8. No survivor names A(x), accumulation or the FTC; **no survivor carries `lim`** (A7 removed the two that did). No survivor displays a quantity S7 introduced. S8's controls map to S3, S5, S5. The `accumulation` aspect falls back to `foundational`. **COHERENT.**
  - **Cut 2 — hide advanced + extended (drop S6, S7):** survivors S1–S5, S8. No survivor names midpoint or right-hand sampling; S8's rectangles are left-rule only and its HUD prints no rule name. Every quantity S8 displays (n, Sₙ, ∫, b, c) is introduced by a surviving core state — **including `∫`, which S4 introduces and S4 is core** (this is what the FLAG-1 ruling buys). `method` and `accumulation` both fall back to `foundational`. **COHERENT.**
  - **Reverse check** (`declared_payoff_state_ringed_outside_the_core_preset`): the whiteboard-test justification is *"n = 4 → 1000, the sum converging on screen"* = **S3, core** ✓; `misconception_watch` states surviving core-only = **S4 and S5** ✓.
- **(i-2) Explore = CORE-ring only (38b):** S8's three controls and its formula surface are core-taught; no sampling-rule control is exposed, deliberately.
- **(i-3) `curriculum_tags`** — CLAIMS (38g); only CBSE `verified: true`: CBSE/NCERT **full, verified** (Class 12, Integrals) · ICSE/ISC full · JEE full · IB DP (AA) full · AP Calculus AB/BC **full** · Cambridge IGCSE 0606 **partial** (integration examined; the limit-of-a-sum definition is not) · A-level Pure full. **All six non-CBSE rows ship `needs_teacher_verification: true`.**
- **(i-4) Presets:** `full` = S1–S8 · `no_advanced` = hide S7 · `core_only` = hide S6, S7.
- **(i-5) Graph-axis convention (38e):** x horizontal, y vertical — no board conflict, no toggle. **Trapezium-rule note:** IGCSE 0606, A-level Pure and ISC examine the trapezium rule by that name; the `trapezoid` mode is retained in the engine (A10) and is available to a later concept, though no state here draws it.

**Registration plan:** `src/data/concepts/mathematics/definite_integral_as_accumulated_area.json` ONLY. Documented exception to `production_routing_disconnect_pcpl_concepts_set`: mathematics concepts register nowhere else until a mathematics serving path exists (precedent `bohr_model_energy_levels`).

## 11. On-canvas layout geometry (pixel plan) — COMPUTED, and re-solved against the ink

Canvas 760×500 logical px. No camera, no zoom.

- **Main plane** — `viewport {x: 70, y: 78, w: 660, h: 372}`, `x_range [−0.5, 2.5]`, `y_range [−1.5, 4.5]`, `equal_scale: false`.
  Derived: **220 px per x-unit**, **62 px per y-unit**; data origin (0,0) at px **(180, 357)**; `x = 2` → px 620; `y = 4` → px 109; `y = −1` (c = 1) → px 419, clearing `CONTROL_ZONE.y = 460` by 41 px.
- **⚠ Range containment, solved over the FULL control product (A3).** With `b ∈ [0.2, 2.0]` and `c ∈ [0, 1]`, the extremal drawn value is `f(2.0, c=0) = 4.0` ≤ 4.5 with 0.5 units of headroom, and the minimum is `f(0, c=1) = −1.0` ≥ −1.5. **`x_domain: {min: 0, max_expr: "b"}` is authored on the `function_plot` in EVERY state**, not only S1 — the curve is drawn where the region is, and the round-0 default (`x_range`, which let the curve exit the frame top at x = 2.121 on every state) is gone.
- **Ticks:** `x_tick 0.5` → 7; `y_tick 1` → 6; `tick_decimals` 1 on x, 0 on y; gridlines on.
- **The inset plane (S4 only) — moved (A2).** Round 0 placed it at `{470, 92, 220, 140}`, a rect whose pixel span (x 470–690, y 92–232) **contains the curve endpoint (620, 109)**: the magnifier covered the ink it magnifies and both zoom-link vectors ran from under it to its own edge. Re-solved against the ink rather than against free caption space:
  **`viewport {x: 200, y: 88, w: 230, h: 145}`** (px x 200–430, y 88–233), `x_range [1.75, 2.0]`, `y_range [3.0, 4.0]` → 920 px/x-unit, 145 px/y-unit. Over `x ∈ [200, 430]` px the curve's lowest point is at the right edge (data x = 1.136 → y = 1.291 → px y **277**), so the inset clears all ink by **44 px** at every value of b and c. Zoom-link: two `vector`s with `plane_id: "plane"` from the main plane's corner marks at px (565, 167) and (620, 109) to the inset's bottom-right corner (430, 233) — both with real length across empty canvas.
  S4's HUD moves to the lower-left inside the plane, **(200, 250–320)**, below the curve for x < 0.75; S4's formula surface returns to the now-free top-right (500, 62).
- **Zones (34d):** delta cue top-left (40, 55) · formula surface top-right ≈ (500, 62) · HUD left-inside the plane (92, 96–170) where the curve is low, **S4 excepted as above** · slider band = the engine's own slots · curve-end labels at the right edge of the plotted domain.
- **Colour plan (Rule 29):** the curve one hue; the region a translucent version of it; positive rectangles the same hue; **below-axis rectangles and the negative subtotal a second, warm hue** (sign carried by colour AND direction); the accumulation curve a third; apparatus neutral. **Composition, declared (A5b):** `riemann_bars` draws AFTER `region_fill` and is opaque (`opacity: 1.0` default) so S2's dim region reads as the missed sliver above each rectangle rather than compositing into an unreadable middle band.

**Constraint callouts for `mathematics_author`:**
1. **No hand-carried scale factors.** Every authored coordinate is DATA. An expression containing a pixel literal is a defect.
2. **The n-law:** never choreograph `n`; never expose `nlog`.
3. **The φ law:** S7's trace runs on `beta`; S7 exposes no slider.
4. Slider captions are capped at 1 dp — no 4-dp quantity is a slider.
5. All motion is a pure function of the state clock. No `Math.random()`.
6. Variable KEYS stay ASCII (`n`, `nlog`, `beta`, `b`, `c`, `xdraw`, `fillx`, `S_n`, `n_drawn`); Unicode is for rendered text only.
7. One expression idiom: bare `pow(...)`, `round(...)`, `abs(...)` — never `Math.`.
8. A `position_expr` body must not also declare an `animation` or a surface attachment (`:1212`).
9. Locus sample budget ≤ 240 (`:2443`).
10. **Reader-facing noun is "rectangle".**

## 12. Per-state timing table — RE-DERIVED FROM SCRATCH (A1)

PASS condition, stated the right way round: **`motion_window ≥ words_max ÷ 2.8`.** Motion longer than narration is the legal asymmetry; narration longer is the ban (Rule 31, `narration_outruns_choreography`). Pin = 0.60 × duration unless `eye_capture_ms` overrides; margin ≥167 ms from the nearest sub-beat boundary on the correct side; every pin lands after its state's last asserted reveal.

| St | Dur | Sub-beats (ms) | Driver profile per window | Motion vs ceiling | Pin → shows | Margin |
|---|---|---|---|---|---|---|
| S1 | 20 s | 0–1200 frame/axes/ticks; 1200–9000 curve draws; 9000–18000 region fills; hold →20000 | `xdraw` 0→2 over 1200–9000; `fillx` 0→2 over 9000–18000. Entry `xdraw = 0`, `fillx = 0` | **18.0 ≥ 17.86** ✓ (40–50 w) | **`eye_capture_ms: 18500`** → whole curve, full region, both bounds marked | 500 ms |
| S2 | 22 s | region dims 0–1200; rectangles at 1200 / 4700 / 8200 / 11700 (`appear_at_ms: 1200`, `reveal_stagger_ms: 3500`); `S₄` label 15500; hold →22000 | no continuous driver — one `riemann_bars` with a staggered reveal (A11). Entry: rectangles hidden | **15.5 ≥ 15.36** ✓ (40–43 w) | **`eye_capture_ms: 16500`** → four partition lines, three visible rectangles + the zero-height one marked, `S₄ = 1.7500` | 1000 ms |
| S3 | 24 s | 0–1000 hold at n = 4; 1000–20000 `nlog` sweep; hold →24000 | `nlog` 0.602→3.0, `once`, `duration_ms: 15000`, `holds: [{1.301, 2000}, {2.0, 2000}]` → boundaries **1000 / 5372 / 7372 / 11745 / 13745 / 20000** (value-fraction placement, `:1111`, computed). Entry `nlog = 0.602` (n = 4, S2's end pose) | **20.0 ≥ 19.64** ✓ (45–55 w) | 14 400 → `nlog = 2.1047`, **n = 127**, `Sₙ = 2.6353`, `gap = 0.031413` | 655 ms |
| S4 | 24 s | 0–1500 inset + zoom-link (n held 100); 1500–19500 `nlog` 2→4 with a hold at 3; **cap label from 3800**; hold →24000 | `nlog` 2→4, `duration_ms: 16000`, `holds: [{3, 2000}]` → 1500 / 9500 / 11500 / 19500. **The cap crossing is at `nlog = 2.60206` ⇒ 1500 + 0.30103 × 8000 = 3908 ms** (round 0 wrote 5231 for `1500 + 0.301·5750`, which is 3231 — two errors compounding, A9). The label is authored at **3800**, before the crossing, and reads `rectangles drawn: {n_drawn} of {n}` — true at every instant, including while n_drawn = n | **19.5 ≥ 17.86** ✓ (40–50 w) | 14 400 → `nlog = 3.3625`, **n = 2304**, `gap = 0.001736`, inset sliver sub-pixel, cap label present | 2.9 s |
| S5 | 24 s | 0–2000 hold at c = 0; 2000–14000 `c` 0→1; 14000–16000 the dim `total area` chip; 16000–18000 the signed total brightens; hold →24000 | `c` 0→1 `once`. `b` is the teacher's, not choreographed (entry 2.0); a real drag seizes (`:3212`) without touching `c` | **18.0 ≥ 17.86** ✓ (45–50 w) | **`eye_capture_ms: 19000`** → curve lowered, below-axis rectangles in the negative hue, `total area = 2.0000` dim vs `∫ = 0.6667` bright — the CORRECT half | 1000 ms |
| S6 | 24 s | left set 0–2000; right set 2000–4000; midpoint set 4000–6000; 6000–20000 `nlog` sweep **with the rectangle sets dimmed to 0.35 and the three readouts as the focal** (A8); hold →24000 | `nlog` 0.903→2.7, `once`, `duration_ms: 14000`, no holds. Entry `nlog = 0.903` (n = 8) — all three sets share ONE n, so no set is ever drawn at a different partition | **20.0 ≥ 17.86** ✓ (40–50 w) | 14 400 → `nlog = 1.9812`, **n = 96**: `2.6251 · 2.6666 · 2.7085`, visibly closing, still distinct | 8.4 s |
| S7 | 24 s | 0–2000 f dims, the A-axis meaning labelled; 2000–20000 `beta` 0→2; hold →24000 | `beta` 0→2 `once`. **One driver for the fill edge and the trace head** — they are the same quantity and are never staggered (`correspondence_state_stages_cause_first_as_a_head_start…`) | **20.0 ≥ 17.86** ✓ (35–50 w) | 14 400 → `β = 1.3778`, `A(β) = 0.8718`, fill edge and trace head at one x | 5.6 s |
| S8 | open | curves and region drawn 0–2500, then `b` `ping_pong` 0.6 ↔ 2.0 from 2500 until seized | teacher-owned; Rule 37 free-run, no freeze | n/a | none (`interaction_complete` skips the pin) | n/a |

**Trace budget:** S7's window is 18 000 ms; `sample_ms: 80` → `floor(18000/80) + 1 = 226` ≤ 240 ✓.

## 13. THE UNION WALK — the 0b deliverable

### (a) State × union row — a CONSUMPTION walk (A5)

Round 0 recorded each state's **new** row; the 0a standard is *"every state names the features it consumes."* Re-run:

| State | Rows CONSUMED (co-present, not merely introduced) |
|---|---|
| S1 | F1 F2 F3 F4 F6 F7 F8 F15 |
| S2 | F1 F2 F3 F4 F6 **F8 F15** F16 |
| S3 | F1 F2 F3 F4 F6 **F8 F15** F16 |
| S4 | F1 F2 F3 F4 F6 F7 **F8** F16 · **two planes** |
| S5 | F1 F2 F3 F4 F6 F8 F11 F12 F15 F16 |
| S6 | F1 F2 F3 F4 F6 **F8** F16 |
| S7 | F1 F2 F3 F4 F6 F7 F8 F10 F11 F15 F17 |
| S8 | F1 F2 F3 F4 F6 F8 F11 F12 F15 F16 |

**Direction 2 — every row claimed, across the SERVED CONCEPT SET:**

| Row | This concept | Elsewhere in the served set |
|---|---|---|
| F1 F2 F3 F4 F6 | every state | #1, #2, #11, #12 |
| **F5** `equal_scale` | ✗ | **#11 Argand only** |
| F7 `plane_id` | S1, S4, S5, S7 | #2, #11 |
| F8 `function_plot` | **every state** (A5) | #1, #2, #12 |
| **F9** break on discontinuity / range exit | ✗ — **and now genuinely ✗**: with `x_domain.max_expr = b` and `b ≤ 2.0`, the curve never leaves the frame (round 0 claimed ✗ while the default domain let it exit at x = 2.121 — A3) | **#1 (tan x, 1/x), #2** — gate §6 tests it regardless |
| F10 multi-curve | S7 | #1, #2 |
| F11 `plot_point` + readout | S5, S7, S8 | #1, #2, #11 |
| F12 draggable point | S5, S8 | #2, #11 |
| **F13 / F14** secant / tangent | ✗ | **#2** (F14 also #12) |
| F15 `region_fill` signed | S1, S2, S3, S5, S7 | **sole driver** |
| F16 `riemann_bars` | S2, S3, S4, S6, S8 | **sole driver** |
| F17 accumulation trace | S7 | #2 |

**Walk result: no state consumes a capability outside the union; no union row is unclaimed across the served set.** F5, F9, F13, F14 are claimed by siblings and not here — stated, because a spec driver that silently drops them is the recorded failure.

### (b) SCRIPTABILITY — every knob a state animates, and its cue

| Knob | State | Cue | Read by |
|---|---|---|---|
| `xdraw` | S1 | `variable_choreography` | `function_plot.x_domain.max_expr` — **delta 1** |
| `fillx` | S1 | `variable_choreography` | `region_fill.to_expr` ✓ |
| rectangle reveal (4, staggered) | S2 | `appear_at_ms` + **`reveal_stagger_ms`** — **delta 7** (A11) | `riemann_bars` |
| `nlog` → `n` | S3, S4, S6 | `variable_choreography` | `riemann_bars.n_expr` ✓ |
| `c` | S5 | `variable_choreography` | `function_plot` / `region_fill` / `riemann_bars` `y_expr` ✓ |
| `b` | S5, S8 | **teacher drag** (`plot_point.drag.bind_variable`) **+ `ping_pong` choreography in S8** until seized (A12) | `x_domain.max_expr`, `region_fill.to_expr`, `riemann_bars.to_expr` ✓ |
| `beta` | S7 | `variable_choreography` | `region_fill.to_expr` + `locus_trace.x_expr/y_expr` ✓ |
| sampling rule | S6 | **not animated** — three co-present primitives with fixed `mode` | — |

Every knob that changes has a cue.

### (c) Contract deltas against `MATHEMATICS_PHASE0_CARTESIAN_PLANE.md` §contract — the diff, both directions

**Nine deltas** (round 0 had six; A5b added three, A6 rewrote one, A10 reversed one, A11 added one).

| # | Delta | Forced by | Direction |
|---|---|---|---|
| 1 | `function_plot.x_domain` gains `min_expr` / `max_expr` | S1's left-to-right draw; **and every other state under A3** (the curve is drawn where the region is) | ADD, additive |
| 2 | **REVISED (A6).** `riemann_bars` computes its sum once, in the loop that places the rectangles, and **publishes** it: `sum_var: "S_n"`. It draws no text. One `label` prints it. `computePhysics_<id>` computes **only** `exact` and `A_beta` — never a Riemann sum | FLAG 2. Round 0 deleted the primitive's readout, which **relocated** the second implementation into the physics twin rather than removing it, and closed the gap with a gate no future consumer of `riemann_bars` inherits. Publication satisfies hazard 4 by construction and makes `gap` expressible at all | REPLACE |
| 3 | **REVERSED (A10).** `riemann_bars.mode` keeps **`left \| right \| midpoint \| trapezoid`** | The 0a gate table already asserts `trap(4) = 0.34375`; dropping the token would have shipped a gate asserting a mode that does not exist. Trapezium is ~3 lines in a loop that must exist anyway, and IGCSE 0606 / A-level Pure / ISC examine it by name | KEEP |
| 4 | `riemann_bars.render: "filled" \| "outline"` | S6's three co-present sets | ADD |
| 5 | **FOLDED into delta 2 (A6/A9).** `bars_drawn_var: "n_drawn"`; an authored `label` prints `rectangles drawn: {n_drawn} of {n}` | Round 0's `cap_notice` had the primitive printing text while delta 2 said it prints nothing — a contradiction in one table | REPLACE |
| 6 | **Multiple `cartesian_plane` primitives per state**, with `plane_id` resolution across planes | S4's inset + zoom-link | CONFIRM + gate |
| **7** | **`riemann_bars.reveal_stagger_ms`** — rectangle i's gate opens at `appear_at_ms + i × stagger` | S2. **A11 reversed round 0's workaround** (four independent single-bar primitives): under delta 2 four primitives publish four unrelated sums; primitive identity breaks across S2→S3 (Rule 32d / focal-by-id); it does not generalise to S6's 3n sets; and the stated reason was "zero engine cost", which the PRIME DIRECTIVE forbids as a tiebreaker. Cost: two lines inside a loop, a pure function of the clock, D7-deterministic | ADD |
| **8** | **`riemann_bars.color`**, plus **`signed` / `color_positive` / `color_negative` reusing `region_fill`'s field names verbatim** | S6 needs three hues; S5 carries the sign by colour *and* direction. Round 0's contract gave `riemann_bars` no colour field at all. **Names are copied from `region_fill` deliberately — two names for one concept in one family is how `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field` happens** | ADD |
| **9** | **Draw order + `opacity`:** `riemann_bars` draws AFTER `region_fill`; `opacity` defaults to 1.0 | S2's missed-sliver reading requires the dim region visible above opaque rectangles; two translucent fills composite into an unreadable band | ADD + gate |
| — | **`riemann_bars.show_partition`** | S2's zero-height first rectangle (A4): with the left rule at n = 4 on [0, 2] the first sample is f(0) = 0, so **four rectangles render as three**. Division lines make the partition countable | ADD |

**Deliberately NOT bought — one item, and it is a design finding, not a saving:**
**Animating a string knob (`mode`).** S6's lesson is that the three rules *bracket* the value **simultaneously**; animating `mode` would show them one at a time, which is the worse picture. The co-present design is better, not cheaper.

### (d) Shape check

Can ONE config object express every state? **S4 needs two planes; S6 needs three co-present `riemann_bars` over one interval.** Both are answered by the contract being a **flat list of independent primitives inside `scene_composition`** rather than a per-state config object — the same property that satisfies D9 (no new per-state field while `build_review_site.ts` keeps its private assembler duplicate). No state requires a second config block.

## 14. Live scar-sweep disposition

**Owner lane (74) — binding rows and their discharge.** `phase0_union_table_asserted_not_walked_state_by_state` — **SATISFIED at round 1**; round 0's walk recorded new rows rather than consumed rows and Checkpoint A caught it; §13a is now a consumption walk · `phase0_union_lists_capabilities_but_never_which_knobs_are_scriptable` — SATISFIED (§13b) · `phase0_config_enum_closed_against_the_spec_driver_not_the_served_concept_set` — SATISFIED (§13a Direction 2; and A10 reversed the one enum this design had closed against itself rather than against the gate) · `signed_engine_union_drops_items_its_own_state_table_still_consumes` — **SATISFIED at round 1**; three consumed fields (colour, signed colour, draw order) were absent from both documents and are now deltas 8–9 · `state_added_at_review_outruns_the_config_contract_shape` — SATISFIED (§13d) · `engine_extension_replaces_a_shared_constant_without_an_absent_field_fallback_clause` — SATISFIED and named: every field is optional, absence reproduces today byte-identically, regression pair = the **7 baseline-locked parametric concepts** (Phase-0 doc §risk), asserted by gate section 11 · `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field` — SATISFIED by delta 8's verbatim field-name reuse · `skeleton_authors_a_second_timed_action_after_the_engine_buy_was_scoped_to_one_instant` — SATISFIED (every millisecond in §12 is a reveal window, a choreography window or a hold) · `skeleton_certifies_a_state_buildable_from_a_mode_string_without_a_frame_probe` — SATISFIED (§⓿) · `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` — SATISFIED (every limit quotes its reader: `:1111`, `:3180`, `:2443`, `:3212`, `:3830`) · `rewind_path_assertion_stops_at_the_function_body_and_never_follows_its_calls` — SATISFIED (the n-law followed `PM_choreoValue → PM_choreoBuildSegments → the frac line`) · `call_site_enumeration_asserted_exhaustive_without_a_symbol_sweep` — SATISFIED (the Rule-40a table) · `named_primitive_declared_without_the_surface_that_can_render_it` — SATISFIED (§⓿ SPEC table; `∫` is a value **chip** beside the sum, never a mark on a value-only readout) · **`archetype_live_tier_unverified_against_renderer` (CRITICAL/FIXED) — SATISFIED, and named this round** (P3-17): all three declared archetypes are `[NEEDS-SCENARIO]`, and §⓿'s VERIFIED/SPEC split is the discharge that scar prescribes · **`narration_attributes_an_effect_to_a_cause_the_model_does_not_contain` (MAJOR/FIXED) — BINDS `mathematics_author`** (P3-17): the model contains only sampling and summation, so narration may not attribute convergence to any cause outside it · `existing_hud_line_reused_for_a_different_physical_quantity` — SATISFIED (delta 5 + A9's corrected timing) · `formula_surface_states_an_identity_in_a_unit_the_hud_never_renders` — SATISFIED (§10h) · `correspondence_state_stages_cause_first_as_a_head_start…` — SATISFIED (§12 driver column; S7 shares one driver) · `frozen_pin_unbudgeted…` + `nlb_frozen_pin_lands_within_one_frame…` — SATISFIED (§12 margins; three states carry `eye_capture_ms`) · `skeleton_pin_budget_names_the_phase_start_instead_of_the_last_asserted_reveal` — SATISFIED · `authored_beat_ends_by_undoing_the_state_own_claim` — SATISFIED (§10d) · `explore_controls_not_ring_gated_survive_the_ring_cut` — **SATISFIED at round 1** for controls *and*, after A13, for the routing map · `declared_payoff_state_ringed_outside_the_core_preset` / `core_ring_displays_a_quantity_whose_explanation_lives_in_a_cut_ring` — SATISFIED (§10i-1 reverse check; `∫` is core because S4 is core) · `skeleton_discharges_a_ring_cut_with_a_field_no_renderer_reads` — SATISFIED · `explore_state_formula_surface_asserts_a_relation_no_state_derives` — **SATISFIED at round 1**: S8's surface no longer carries `lim` · `delta_cue_restates_the_declared_misconception_verbatim` — SATISFIED (§4) · `concept_schema_assessment_minimum_exceeds_the_skeleton_authored_item_count` — SATISFIED (six items against `min(6)`) · `quantitative_check_state_reuses_the_exact_numbers…` — SATISFIED · `symbol_printed_on_canvas_before_the_lesson_defines_it` / `teach_do_not_prespoil_a_later_reveal` — SATISFIED (§10b) · `derived_readout_asserted_by_value_without_defining_its_metric` — SATISFIED (§10g) · `taught_variable_has_no_rendered_physical_correlate…` / `oncanvas_formula_asserts_a_value_the_renderer_cannot_show` — SATISFIED (§10g) · anchor rows — SATISFIED (§9) · `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control` — SATISFIED (§3) · `teach_coordinate_sim_with_graph` — SATISFIED (S7, S8) · `teach_concrete_before_abstract_compare` — SATISFIED · **`teach_visual_must_match_narration` — BINDS `mathematics_author`**, instance recorded: **S6's narration may not say the three sums "agree" at any finite n** — they converge and never meet · `teach_distinct_reference_lines_for_two_radii` — SATISFIED in spirit (three sets, three hues, three labels) · `derivation_principle_applied_to_one_beat_but_not_its_sibling` — SATISFIED · `prior_rulings_and_internal_ledgers_are_not_re_run_over_the_states_a_restructure_creates` — **SATISFIED, and stated as done**: A1/A7/A12 changed timings, formula surfaces and S8's motion, so §10b, §10h, §10i, §12 and §13 were **re-derived from scratch**, not patched · `architect_reuses_a_marker_mechanism_without_diffing_the_side_effects…` — SATISFIED (`plot_point` is specced NEW so it does not inherit `drawBody`'s registry effects by accident; if the surgeon implements it as a body variant, the effect must be declared in the dispatch report) · `taught_delta_smaller_than_the_instruments_own_live_noise` / `skeleton_asserts_a_held_comparison_value_at_an_instant_the_faster_body_has_already_passed` — N/A-with-reason.

**N/A-with-reason families** (no field_3d surface, no `newtons_laws_body`, no camera, no energy bars, no closed substance enums): every `nlb_*` row, `energy_layer_*`, `shared_bar_scale_*`, `close_camera_framed_extent_*`, `architect_authors_a_force_triangle_*`, `velocity_arrows_routed_through_a_force_arrow_map_*`, `field3d_rule16a_belief_unbuildable_*`, `closed_enum_cannot_name_a_substance_the_design_teaches`, `teach_field3d_explore_grab_and_move_field_point` (spirit satisfied by S8), `teach_inverted_scenario_inverts_cutline_flags`, `paired_skeletons_cite_each_other_by_state_number_across_a_renumbering`, `chemistry_concept_id_collides_with_rostered_physics_id` (checked, §8), `contrast_ghost_coresident_with_the_real_set_fuses_both` (S5's two totals are two labelled numbers), `lesson_never_states_the_principle_it_is_named_after` (S4 states its definition — and the FLAG-1 ruling is what keeps this true under `core_only`), `concept_taught_its_own_quantity_without_the_canonical_picture`, `skeleton_authors_a_timed_reveal_chain…` / `…no_per_body_activation_time` (`appear_at_ms` verified `:771`), `ramp_endpoints_multiply_the_taught_variable_by_a_factor_no_rendered_string_claims` (`nlog` is rendered as n everywhere), `authored_lumped_constant_inconsistent_with_the_drawn_apparatus_geometry` (no lumped constants — the plane owns the transform).

**PCPL lane (55) — OPEN rows.** `pcpl_locus_trace_sweep_parameter_exposed_as_a_slider_collapses_the_curve` (CRITICAL/OPEN) — **BINDS → the φ law**; slider ∩ trace identifiers = ∅ in all 8 states · `review_site_private_config_assembler_drops_variable_choreography` (CRITICAL/FIXED 2026-08-06) — **BINDS FORWARD**: D9 — no new per-state field; everything lives in `scene_composition` · `normal_reaction_state5_computed_outputs_name_mismatch` (MAJOR/OPEN) — **BINDS json_author**: every `computed_outputs` key used in an expression must exist by that exact name (`exact`, `A_beta`; `S_n` and `n_drawn` are **published by the primitive**, not computed outputs — delta 2) · `eye_h2_frozen_frames_of_moving_elements_wobble_sub_perceptually_so_zero_percent_is_not_a_valid_gate` (MODERATE/OPEN) — **RECORDED for the baseline step**: five states pin mid-sweep, so this concept's H2 tolerance is set from evidence, never assumed 0.00 % · `frozen_frame_read_as_dense_series_continuation_on_translating_body` (MODERATE/OPEN) — RECORDED for eye_walker · `pcpl_slider_label_stale_under_choreography` (FIXED `084f06c`) — **relied upon**: S5's `b` and S8's `n` captions track live values; a regression would print two different bounds in one frame · remaining rows N/A by surface or feature.

---

## Block 1 — Pass-1 strategic checklist

**1. Prerequisite cliff.** Reading `y = f(x)` off a graph, and the area of a rectangle. Breaks at **S2** without the second. Patch sentence, inside S2's budget: *"Each rectangle's area is its width times its height, and its height is the curve's value at its left edge — which for the first one is zero."* One sentence carries both the prerequisite and the zero-height fact (A4).

**2. Exam-backwards trace** (CBSE/JEE-Main style): *"Evaluate ∫₀²(x² − 1)dx and explain why the answer is smaller than the total area enclosed between the curve and the axis."* Pieces → states: the region and its bounds → **S1**; the sum and its width → **S2**; convergence → **S3**; the limit as the definition → **S4**; **the signed-vs-total distinction → S5, whose dim chip is literally named `total area`** (P3-18); the accumulation view that makes the arithmetic checkable → **S7**. S6 is exercised by assessment item 5. No missing piece; no idle state.

**3. Misconception entry mapping (16a).** M1 is planted by every "approximately equals" in a textbook table and confronted at S4, where the gap is first given a formula. M2 is planted by "area" being a size word and confronted at S5, the first time the region crosses the axis. M3 is planted by **S2 itself**, which uses one sampling rule without justifying it — and whose zero-height first rectangle makes the choice visible — and is confronted at S6.

## Block 2 — Aha-moment designation

- **PRIMARY aha:** *A pile of rectangles is not an approximation of the area — it becomes the area, and you can watch it happen.* State **S3** (inside `foundational` ✓).
- **SUPPORTING aha (1):** *The total accumulated so far is itself a function — the area has a shape.* State **S7**.
- **Wrong-belief setup.** S1 and S2 build "the region is one fixed thing and my rectangles are a rough stand-in", so the student is confident and slightly wrong when S3 makes the stand-in converge and S4 shows the gap is a *formula*, not a fudge. The supporting aha's setup is S1–S6 treating the bound as fixed at 2; S7 makes it a variable and the area becomes a curve.
- **Foundational-coverage rule:** SATISFIED — S3 ∈ STATE_1 → STATE_4.

---

## Source check line

*Consulted the NCERT Class-12 Mathematics chapter index (Integrals) and the named international specifications (IB DP AA subject guide, AP Calculus AB/BC CED, Cambridge 0606 syllabus, A-level Pure specifications) for SCOPE only, feeding §10(i-3). NCERT Exemplar consulted for misconception BELIEFS only (§4). No teaching method, no example problem, no figure imported. HC Verma and DC Pandey not consulted — physics-only sources, forbidden for mathematics.*

## Self-review checklist — run (amendment round 1)

- [x] **All 19 Checkpoint-A findings applied**, and the two reviewer slips corrected rather than copied: its affected-list for A1 omitted S2 (which also failed), and its A4 cue contradicted its own A14 noun rule (resolved toward "rectangles").
- [x] §12 re-derived from scratch with every value recomputed, not typed: S3 boundaries 1000/5372/7372/11745/13745/20000, pin n = 127 · S4 cap crossing 3908 ms, pin n = 2304 · S6 pin n = 96 · S7 pin β = 1.3778, 226 samples. **Every state now passes `motion ≥ words_max ÷ 2.8`.**
- [x] Atomic claim one sentence; state count justified; D1 answered (nothing derivable from its predecessor).
- [x] Control table first; archetypes from the mathematics dialect **with a rhythm claim per state** (a label is not a rhythm); no static state — including S8; explore last, `interaction_complete`, ALL controls.
- [x] Both ring cuts argued by ring assignment over four checklists (narration, surfaces, HUD, routing), in both directions, with the reverse payoff/misconception check.
- [x] Six assessment items against `min(6)`, `non_assessed_states` declared, items ring-tagged.
- [x] Union walked as a CONSUMPTION walk in both directions; scriptability per knob; nine contract deltas diffed both ways with their forcing states; shape check run.
- [x] Rule 40a symbol sweep on all nine proposed symbols; every hit classified.
- [x] Geometry re-solved against the ink: inset clearance 44 px; range containment over the full control product; `x_domain` authored everywhere.
- [x] Zero TBDs.

## FLAGS — round 1

1. **RULED (FLAG 1, Checkpoint A):** `∫` on core S4, `lim(n→∞)` denied on core. Applied in §10b/§10h/§10i. *Founder may reverse; the cost of reversal is two formula surfaces and one ledger row.*
2. **RESOLVED (FLAG 2):** the two-implementation risk is gone by construction — `riemann_bars` publishes, `computePhysics_<id>` never computes a Riemann sum. Gate section 9 now checks a **published** value against independently solved closed forms instead of reconciling two internal implementations.
3. **RESOLVED (FLAG 3):** the Rule-31 inversion is corrected and every state retimed.
4. **RULED (FLAG 4):** the draggable bound stays (F12), with the `ping_pong` in S8 answering discoverability mechanically rather than by retreating to a slider. Range capped at 2.0.
5. **RULED (FLAG 5):** section numbering dropped entirely; chapter level only.
6. **NEW — the engine purchase grew, and the founder should see it before dispatch.** Round 0 asked for 6 contract deltas; round 1 asks for **9 plus `show_partition`**. Three came from the consumption walk (colour, signed colour, draw order), one from reversing a workaround (`reveal_stagger_ms`), one from a zero-height rectangle (`show_partition`), and one enum was un-dropped (`trapezoid`). **All of them land in CP-C's dispatch scope**, and `MATHEMATICS_PHASE0_CARTESIAN_PLANE.md` §contract + its gate table must be amended before CP-C is written.

*Handoff: back to **founder_proxy Checkpoint A, cycle 1** (budget: one more cycle, then ESCALATE). Not handoff-ready to `mathematics_author` until that returns, and not buildable until CP-A…CP-D land on master.*
