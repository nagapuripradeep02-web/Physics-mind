# ARCHITECT SKELETON — `derivative_as_limit_of_secant_slope` — ROUND 0 (0b-level)
## "The Derivative as the Limit of a Secant Slope"

> Subject: **mathematics** · chapter level: Class 11 (Limits and Derivatives) / Class 12 (Continuity & Differentiability) · class_level 11 · `is_spine: true`
> Pipeline: `architect → mathematics_author → json_author → quality_auditor`
> Renderer: `parametric` (PCPL) — `renderer_pair.panel_a: "parametric"`, `panel_b: "none"` (OPEN scar `renderer_pair_panel_b_is_required_by_schema…`: author the `"none"` sentinel, never `graph_interactive`). JSON lives ONLY in `src/data/concepts/mathematics/derivative_as_limit_of_secant_slope.json`; registered ONLY in `src/lib/mathematicsCatalog.ts`; validation = `npm run validate:mathematics`. Collision check: the id appears in **zero** files under `src/data/concepts/` (grep, this session).
> Ranked-list authority: `MATHEMATICS_DISCUSSIONS.md` §6 **P1 #2** (breadth 7/7; capabilities 2, 4).
> Archetypes: **A — coordinate plane with a live function** + **H — limit approach** (`docs/patterns/mathematics.md` §1). Both were `[NEEDS-SCENARIO]` when the pattern doc was written; **as of this desk's SHA they are LIVE** — CP-A…CP-D are merged to master (PRs #36–#40) and §⓿ below re-verifies every specific mechanism against renderer CODE, per `archetype_live_tier_unverified_against_renderer` (CRITICAL/FIXED).

> **Desk:** `/Users/karthikyerragadda/Desktop/Viditra/Physics-mind-mathematics-derivative`, branch `feat/mathematics-derivative`, level with `origin/master`.
> **SHA probed against: `994bb8f`.** Every renderer citation below is `symbol @line @994bb8f` in `src/lib/renderers/parametric_renderer.ts` unless another file is named. Re-resolve by symbol on any future touch.
> ⚠ **Execution status honesty:** the `cartesian_plane` family is **compute-layer proven only** (`check:cartesian-plane` green; no p5 draw code has yet executed on any screen). The sibling desk (`graph_transformations`) will be first pixel execution. Every claim below is therefore tiered `measured` (node probe of the extracted shipped function), `read` (cited body read in full), or `clone` (a shipped concept exhibits it) — and where a claim can only be settled by first pixels, it is flagged `ASSUMPTION — probe-before-authoring` explicitly.

> ## WHAT THIS DOCUMENT IS
> **The Phase-0d skeleton for concept #2 — the standing open item in `PROGRESS_MATHEMATICS.md`** ("#2 needs a 0b-level skeleton before its zero-edits claim is trusted"). The success test it must discharge: **#2 requires ZERO renderer edits.** §⓿ is the heart: every visual need maps to a NAMED contracted feature at a verified `file:line`, and the three dispatch watchpoints (a)/(b)/(c) each carry an explicit verdict with evidence. **Verdict summary: ZERO renderer edits needed; ZERO STOP-flags.** The engine purchase list for this concept is **empty**.

---

## Engine bug queue consultation — LIVE SWEEP RUN 2026-08-06

- `derivative_as_limit_of_secant_slope` → **0 rows** (new id) · `--pcpl --open` → **10 rows** (all read; dispositions §14) · `--owner alex:architect` → **74 rows** · `--row-type directive` → **87 rows** · inherited `unit_circle_to_sine_wave` digest → **38 rows** (all read; every AUTHORING-SIDE / OPEN clause disposed in §14).
- `--scenario` lane not run, with the reason: PCPL has no scenario dispatch (coverage boundary enumerated: owner + directive + pcpl + concept-id + the unit_circle inherited digest).
- **Rule 40a sweep: not applicable in the buying direction — this skeleton buys NOTHING.** Every mechanism named below already exists on master (PRs #36–#40); no new symbol is proposed, so there is nothing to sweep for double-building. This is the 0d alarm rule holding: if any state below had forced an engine edit, the correct action would be STOP + re-scope, never a per-concept extension.

---

## ⓿ ENGINE FIT CHECK — every visual need → a named, contracted, line-cited feature

**Evidence tiers:** `measured` = reproduced this session by the node probe (§12 — `PM_choreoBuildSegments @1158` / `PM_choreoSampleSegments @1189` / `PM_choreoValue @1207` extracted verbatim from the renderer at `994bb8f` and run; output pasted in §12) · `read` = cited body read in full this session · `clone` = a shipped surface exhibits it.

| Visual need | Named feature | Verified at (@994bb8f) | Tier |
|---|---|---|---|
| The frame: viewport, ranges, ticks, gridlines, data↔pixel transform | `cartesian_plane` (F1–F4, F6) | family header @2003 · `drawCartesianPlane` @2168 · registry write @2179 · `PM_planeResolve` @2135 · `PM_planeRangesOf` @2151 | read |
| The curve, drawn live, domain-driven | `function_plot` (F8) — `x_domain.min_expr/max_expr` | `drawFunctionPlot` @3049 · domain expr resolution @3064–3069 · sampler `PM_functionPlotSample` @3025, clamp [40,480] @3028 | read |
| Curve draws itself left→right (S1) | `x_domain.max_expr` bound to choreographed `xdraw` | @3068 + `PM_choreoValue` @1207 | measured (S1 row, §12) |
| Ghost/dim curve (S8's revealed f′ line; S8's dimmed f) | `function_plot.style: "ghost"` (0.35 alpha) / `"dashed"` | @3076–3077, @3087 | read |
| P and Q as live points with coordinate readouts | `plot_point` (F11) — one-scope resolve + own `decimals` | `PM_plotPointResolve` @3120 · `drawPlotPoint` @3132 | read |
| Teacher drags P / Q (S6, S9) | `plot_point.drag` (F12) — seizes exactly like a slider | seize `PM_userTouched[bind_variable]=true` @3163 · inverse transform @3164 (`PM_planeResolveInverse` @2160) · clamp @3166–3169 · same-frame re-resolve @3185–3188 · single-touch claim `PM_activeSliderId` @3159 | read |
| The chord with a live slope readout | `secant_line` (F13) — slope from DATA deltas only | `PM_secantLineCompute` @3696 · slope @3708 · `PM_secantTangentReadout` @3683 (own `decimals` @3685) · `drawSecantLine` @3773 | read |
| Chord extended across the frame | `extend: "frame"` — Liang-Barsky clip in DATA space | `PM_lineClipToRect` @3644 · `PM_extendLineToFrame` @3668 (diagonal-sized, no magic number) | read |
| **The chord VANISHES at h = 0** (S4's whole lesson) | `secant_line`'s own vertical-chord guard: `|Δx| < 1e-12 → valid:false → nothing drawn, readout gone` | @3704 (`return out` with `valid:false`; draw exits @3786) | read + measured (S4 row, §12: choreographed `h` returns exactly 0 at ramp end) |
| The tangent at P with authored slope | `tangent_line` (F14) — `slope_expr` authored, never differentiated (ledger item 5) | `PM_tangentLineCompute` @3745 · `drawTangentLine` @3826 | read |
| Short tangent segment riding the sweep (S8) | `tangent_line` `extend:"segment"` — half-width 0.12 × x-span | `PM_TANGENT_SEGMENT_HALF_WIDTH_FRAC` @3743, @3763–3766 | read |
| f′ traced into existence as u sweeps (F17) | `locus_trace` + `plane_id` (F7) | plane branch @2949 · per-frame resample header @2547-region (clone: `unit_circle_to_sine_wave` traces live) | read + clone |
| Labels that ride moving geometry, in DATA coords | `label` + `position_expr` + `plane_id` — the F11 tracking-label contract, BUILT | position_expr @1813–1818 · plane transform AFTER it @1829–1832 ("evaluates position_expr in DATA coordinates, never pixels" — the contract #3's skeleton routed to CP-A, now in the tree) | read |
| Timed reveals + timed disappearance | `PM_animationGate` — `appear_at_ms`/`animate_in_ms`/`disappear_at_ms`/`fade_out_ms` | @805; disappear @819, fade_out @820, fade branch @827–831. Consumed by every family member (D6 brackets: secant @3776, tangent @3829, function_plot @3052, plot_point @3135) | read |
| Focal handover mid-state (secant → tangent, S5) | `focal_sequence` (per-window focal switch; peers dim ×0.6) | `PM_focalEmphasis` @850, sequence branch @870–881, peer dim @890. Secant/tangent BOTH consume it (@3778/@3831 + glow bracket @3798–3801) | read |
| Animate any knob; holds; ping_pong; exact endpoints | `variable_choreography` | `PM_choreoValue` @1207 + builder/sampler @1158/@1189 | **measured** — every §12 boundary, hold plateau, pin value, ping_pong leg, and the exact-endpoint returns (`h = 0` exactly at ramp end) reproduced in node this session |
| Choreography yields to a genuine drag, per state | seizure: stand-down @2877 (`PM_choreoVarsAtTime`) and @4961 (`PM_applyChoreography`); per-state clear @5424; freeze does NOT clear @4936 | read |
| Which variables count as "this state's live controls" | `PM_stateLiveControlVars` @2983 — sliders AND `plot_point.drag.bind_variable`, centralised | read |
| HUD text with authored precision | `label.text_expr` via `PM_interpolate` @1085 (complex-expr path @1096–1104) over ONE scope `PM_liveExprVars` @1068 | read + clone (every shipped PCPL HUD) |
| Draw order (D12): plane → … → function_plot → secant/tangent → plot_point → labels | CP-D slot @5249–5260 inside the declared pass @5186 | read |
| Deterministic frozen frames | per-frame recompute, no accumulation (D7); `SET_TIME_FREEZE` seizure-safe @4936 | read + clone (7 baseline-locked PCPL concepts) |

**Machine gates verified at this SHA:** Gate 9(d) φ-law now covers **both seizure doors** — `locus_trace_sweep_parameter_is_a_slider` (`src/scripts/lib/conceptGates.ts` @436, FATAL) **and** `locus_trace_sweep_parameter_is_drag_bound` (@443, FATAL), unioned via `seizableVars` @380. The CP-B gate extension #3's skeleton requested is BUILT. Assessment floor: `questions: z.array(...).min(6)` (`src/schemas/conceptJson.ts` @328).

### ⚠ WATCHPOINT (a) — the "undefined at h = 0" callout. **VERDICT: BUILDABLE with verified mechanisms; no STOP-flag.**
`label` indeed has no conditional-visibility field — and none is needed, for three verified reasons, in preference order:
1. **In guided states, h is a pure function of the state clock**, so "condition h ≈ 0" ≡ "a known time window". The callout is a `label` with `appear_at_ms` / `disappear_at_ms` / `fade_out_ms` — ALL three exist in `PM_animationGate` (@819–831, `read`) and `drawLabel` consumes the gate. S4 authors the callout at `appear_at_ms: 12800` — **800 ms after the measured vanish instant (12000 ms), the Rule-32a cause-then-effect beat**. Deterministic, EYE-safe, no new mechanism.
2. **The engine itself performs the "undefined" visual**: `PM_secantLineCompute` returns `valid:false` at `|Δx| < 1e-12` (@3704) — chord AND its slope readout vanish together. The probe (§12, S4 row) confirms the choreographed `h` returns **exactly 0** at ramp end, so the vanish lands on a known millisecond. In the explore state this fires live and unscripted whenever the teacher parks Q on P — the h=0 lesson re-teaches itself under the teacher's own hand, for free.
3. **Fallback, probed and held in reserve:** `PM_interpolate`'s complex-expression path evaluates arbitrary JS returning a STRING (`new Function` @1096–1102; ternary probe this session: `h<0.005 ? "no chord" : ""` → `"no chord"` at h=0, `""` at h=0.4 — `measured`). A conditional `text_expr` label is therefore expressible today. The design does NOT use it (mechanism 1 is deterministic and precedented); recorded so downstream never re-derives it.

**One constraint this verdict creates (binding, §11 callouts):** no HUD label may print slope from an EXPRESSION — `x0 + h/2` evaluates to `1.0000` at h = 0 and would render S4's own claim false. Slope exists on canvas ONLY as the secant/tangent primitives' own readouts, which correctly vanish/persist.

### ⚠ WATCHPOINT (b) — secant↔tangent handover. **VERDICT: composed from verified pieces; no cross-fade primitive needed; no STOP-flag.**
There is no opacity field on `secant_line`/`tangent_line` (alpha = `gate.alpha × emph.alphaMul` only — @3796/@3848, `read`). The handover is therefore authored as **co-presence + three verified channels**:
- **Reveal:** tangent enters via `appear_at_ms + animate_in_ms` (alpha ramp @833–835) — drawTangentLine consumes the gate (@3829).
- **Hierarchy:** the tangent is authored in a **dimmer HEX** (`color` read at @3847) while the secant sweeps; brightness-by-color is authored data, not a mechanism.
- **Handover instant:** `focal_sequence` switches focal from `sec` to `tan` at 14 000 ms (S5) — the secant drops to ×0.6 alpha and the tangent takes the 12 px glow (@870–890, one glow focal at a time, Rule 32e). Where the secant must leave entirely (S6 opening), `disappear_at_ms + fade_out_ms` on the secant does it (@827–831).
- **The convergence itself is GEOMETRIC, not alpha:** the chord's clipped line rotates onto the tangent's clipped line as h → 0.001 — at the S5 pin the two lines are sub-pixel-coincident while the readouts still differ (`1.0020` vs `1.0000`, measured §12). The picture merges; the numbers refuse — which IS the lesson.

`ASSUMPTION — probe-before-authoring` (the one first-pixel item here): sub-pixel coincidence of two 2 px strokes rendering as "one line" is asserted from geometry (angular difference atan(0.002) over a 660 px frame < 0.7 px), not yet from pixels. `mathematics_author` verifies on the first EYE run of S5; no authoring decision depends on it (the numbers carry the claim either way).

### ⚠ WATCHPOINT (c) — ledger item 7, `drawAngleArc` has no `plane_id`. **VERDICT: designed WITHOUT it; no STOP-flag; ledger untouched.**
Verified this session: `drawAngleArc` @4026 body contains **zero** `plane`/`PM_planeResolve` references (`read`, full-body grep). **No state below wants a slope-angle arc.** Slope is taught as **rise ÷ run and as a number** — which is also the mathematically honest choice on this plane: x and y pixel scales differ (137.5 vs 84.5 px/unit, §11), so a drawn angle would measure the SCREEN, not the mathematics (the exact trap CP-D's own family header @3616–3633 records). The founder's record-don't-build ruling on ledger item 7 stands; nothing here needs reversing.

### ⚠ WATCHPOINT (d) — h as teacher control AND choreographed variable. **VERDICT: resolved; and I REFUTE one dispatch premise with evidence.**
The dispatch frames h as "a teacher-facing **slider**". An h slider is the WRONG control at this SHA: `drawCanvasSlider`'s caption precision is hardcoded `toFixed(step < 1 ? 1 : 0)` (@4580, `read`) — at the design's h floor (0.001) the caption would print `h: 0.0`, rendering the concept's central quantity false on its own control. Instead:
- **Guided states:** h (or `hlog`) is **choreography-only** — never a slider, never drag-bound. Deterministic motion, no seizure door, no caption.
- **Explore (S9):** the h control is **the Q point itself** — `plot_point.drag` on `xq`, with h = xq − x0 shown by a `label.text_expr` at authored 3-dp precision. Q's drag seizes through the SAME store and flag a slider would (`PM_stateLiveControlVars` @2983; seize @3163; stand-down @2877/@4961; per-state clear @5424) — so the "both choreographed AND teacher-live" contract is: **choreographed `ping_pong` on `xq` free-runs from t = 2500 until a genuine drag seizes it** (Rule 37; the exact S8 pattern of the #3 skeleton, now with the mechanism `read` at every line). Dragging the point IS dragging h, with a readout whose decimals are authored.
- **Gate 9(d) — shown explicitly:** the concept's ONLY `locus_trace` is S8's, parameterised on the dedicated sweep variable **`u`**; `u` is no state's `slider.variable` and no state's `plot_point.drag.bind_variable`, concept-wide. Intersection with `seizableVars` = ∅ in every state → both FATAL checks (@436, @443) pass by construction. `function_plot` is immune by design (its `x` is bound by the sampler, never read from scope — @3035, D3).

---

## 1. Atomic claim

This concept teaches that **the slope of a curve at a single point is defined as the limit of chord slopes — the one number the slope of a two-point chord approaches as the second point slides onto the first, which the chord itself can never show at h = 0 because two coincident points make no line.** It does not cover differentiation rules (product/chain), limits in their own right (ε-δ or algebra of limits), continuity/differentiability edge cases, or graph transformations (P1 #1). The one bridge it builds is S8: **each point's slope, collected, is itself a new function** — f′ as an object, authored as an observation about a traced curve, never as a rules toolkit.

## 2. State count + arc — 9 states (complex, justified)

**Count justification (Rule 11).** The concept carries: the apparatus, average rate (chord), the shrink, the h = 0 void, the tangent as limit, point-dependence, the algebra, the derivative-as-function, explore. Exam test — a student who watches all 9 can answer: average rate of f between two x-values; what the secant slope approaches at a point; why h = 0 is excluded and what the limit means; what the tangent is; f′(1) from first principles for x²/2; what f′ is as a function. Each traces to a named state (Block 1). Nothing is derivable from its predecessor: S3 is *the number settles*, S4 is *it can never arrive and here is why* — collapsing them is exactly how "approaching = reaching" survives.

| # | Title (Rule 41d) | Purpose | teaching_method | ring |
|---|---|---|---|---|
| S1 | The Curve and One Point | Apparatus: frame, y = x²/2 draws in, P arrives; the question "how steep HERE?" | *(straightforward)* | core |
| S2 | A Chord Through Two Points | Slope needs two points: rise ÷ run over the gap h; average rate | *(straightforward)* | core |
| S3 | The Second Point Slides Closer | **PRIMARY AHA** — h shrinks, the slope readout settles on one number | *(straightforward)* | core |
| S4 | At h = 0 There Is No Chord | The void: Q lands on P, the chord vanishes, 0/0 is not a number — hence the limit | *(straightforward)* | core |
| S5 | The Line the Chords Settle Onto | The tangent as the limiting line: picture merges, numbers stay distinct | *(straightforward)* | core |
| S6 | A Different Point, a Different Slope | The derivative is AT a point: drag P, the tangent and its number follow | *(straightforward)* | core |
| S7 | The Algebra Behind the Number | Derivation: slope = x₀ + h/2, cancel h, shrink it; write lim, name f′ | derivation_first_principles | advanced |
| S8 | Every Slope Collected: a New Function | f′ traced as u sweeps — the slopes lie on the line y = x | derivation_first_principles | advanced |
| S9 | Explore: Drag Both Points | Teacher sandbox — P and Q draggable, chord + tangent + readouts live | exploration_sliders | core |

The hook MOVES from t = 0 (curve draws in). Advanced ring = {S7, S8}, contiguous immediately before explore ✓. **Extended ring: EMPTY, deliberately** — both preset cuts coincide (§10i).

## 3. Per-state choreography + control plan (Rule 31 — the control table, FIRST artifact)

**The function, fixed once and never re-derived (hazard 7): `f(x) = x²/2`, P at x₀ (default 1).** Chosen over x² because the home frame must hold BOTH f and its derivative curve in one pose (Rule 32d): f′(x) = x fits the same window x²'s 2x would burst. Exact closed forms — the functional contract handed to `mathematics_author`:

```
f(x)        = x²/2
tangent(x₀) = x₀                          (slope_expr, AUTHORED — ledger item 5)
m(x₀, h)    = (f(x₀+h) − f(x₀))/h = x₀ + h/2     EXACT (the S7 surface)
m − tangent = h/2                          EXACT (the precision doctrine below)
f′(x)       = x                            (S8's revealed line)
```

Canvas values, probe-confirmed (§12): at x₀ = 1: `m(1) = 1.5000` · `m(0.5) = 1.2500` · `m(0.1) = 1.0500` · `m(0.01) = 1.0050` · `m(0.001) = 1.0005` · tangent `1.0000`. Float check `measured`: `((1.001)²/2 − 0.5)/0.001` renders `1.0005` at 4 dp — never colliding with `1.0000`.

**PRECISION DOCTRINE (the inherited highlight, decided here):** slope readouts render at **4 dp**; the guided h floor is **0.001**, so the secant−tangent difference at the floor is h/2 = 5·10⁻⁴ = **5 units in the last rendered digit**. No state ever renders `slope = 1.0000` on the secant while claiming it has not arrived. h displays at 3 dp (`h = 0.001`); in explore, h = xq − x₀ carries the negative-zero clamp `{(abs(xq-x0)<0.0005?0:(xq-x0)).toFixed(3)}` (scar `hud_prints_negative_zero…`, idiom).

**The h-law:** guided shrink states choreograph **`hlog`** (h = 10^hlog) so equal time buys equal decades (the #3 n-law, same `frac` value-fraction reason, `measured`); S4 choreographs plain `h` because it must land on EXACTLY 0 (probe: it does). Neither is ever a slider (caption trap @4580) or drag-bound. **The φ-law:** the only trace runs on dedicated `u` — never seizable anywhere (Gate 9(d) both doors pass, §⓿d).

| St | Teaches (one idea) | Archetype | Distinct motion | Rhythm claim | Delta cue (≤5 words) | Live controls | Words | Ring | Register | The real NUMBER |
|---|---|---|---|---|---|---|---|---|---|---|
| S1 | A curve is steep by different amounts at different places — what is the steepness at ONE point? | `trace-locus` | Curve draws left→right (`x_domain.max_expr` ← `xdraw`, −2.1→2.1); then P slides along the curve (x₀ −1.2→1) and stops | one edge travels, then one dot travels — two sequential journeys | The curve, one point | none | 28–36 (anchor inside) | core | graphical / numeric | P readout `(1.00, 0.50)` live while sliding |
| S2 | Slope needs two points: rise ÷ run across the gap h | `decompose` | Q appears at h = 1; dashed run segment draws, then rise segment, then the chord snaps through both points with its live readout | four discrete arrivals — nothing continuous | Two points make a chord | none | 32–39 | core | graphical / numeric | `run = h = 1.000`, `rise = 1.500`, chord readout `slope = 1.5000` |
| S3 | **PRIMARY AHA** — as the gap shrinks, the slope readout stops wandering and settles on ONE number | `limit-approach` | `hlog` 0→−2 (h: 1→0.01), holds at h = 0.5 and h = 0.1; Q slides along the curve into P, the chord rotates, the readout counts down 1.5000→1.0050 | one continuous slide with two dwells; the eye follows a digit stream | The gap shrinks | none (watch beat) | 40–47 | core | graphical / numeric | `h = 0.065`, `slope = 1.0325` at the pin; dwells render `1.2500`, `1.0500` |
| S4 | At h = 0 the chord does not exist — 0/0 is not a number; the limit is how we say what the values were heading for | `null-result-hold` | h 0.4→0 over 9 s: Q slides the last stretch and LANDS ON P — chord and readout vanish at the measured instant (12 000 ms); callout 1 @12 800; callout 2 ("the values were heading for 1.0000") @16 000; long hold on the void | motion ends in deliberate NOTHING — the void is the picture | h = 0: no chord | none | 35–41 | core | graphical+symbolic / numeric | `h = 0.000` beside NO slope readout (it vanished with the chord — §⓿a constraint) |
| S5 | The tangent is the one line the chords settle onto — the picture merges, the numbers never do | `limit-approach` — **declared companion pair with S3; the flip: S3 converges a NUMBER, S5 converges the PICTURE onto a drawn line** | Tangent (dim hue) appears at P first (reveal order); then the chord fades back in at h = 0.4 and sweeps down onto it (`hlog` −0.398→−3, h→0.001); focal hands over sec→tan @14 000 | a line lies in wait; a second line rotates onto it and seems to become it | One line remains | none | 35–40 | core | graphical / numeric | secant `1.0020` vs tangent `1.0000` at the pin — sub-pixel-same lines, visibly different numbers |
| S6 | The slope belongs to the POINT: move P and the number moves | `parameter-sweep` | Chord retired (fade-out); x₀ sweeps −1.4→1.4, the tangent rides P — steep-down, flat at 0, steep-up; a real P-drag seizes the sweep | one dot dragging a line through a whole repertoire of tilts | Each point, its own slope | **draggable P** (x₀ ∈ [−1.6, 1.6]) | 26–32 | core | graphical / numeric | tangent readout `slope = 0.75` at pin; `slope = 0.00` at the bottom of the valley |
| S7 | The algebra says WHY: slope = x₀ + h/2, and only the limit removes the h | reveal-build | Chord back at h = 0.8; four derivation lines reveal in narration sync (3/8/13/18 s): the quotient → cancel to x₀ + h/2 → "h → 0: slope → x₀" → `f′(x₀) = x₀` with the lim chip | four symbolic arrivals over a held picture | Cancel h, then shrink it | none | 40–46 | advanced | symbolic leads (earned: its graphical story played in S2–S5) / numeric | surface `slope = x₀ + h/2` vs chord readout `1.4000` at h = 0.8 — identity holds in rendered digits |
| S8 | Collected, the slopes are a new function — and for this curve they lie on a straight line | `accumulate` | u sweeps −1.6→1.6: a marker rides f with a short tangent segment (extend:'segment'); below/above it a second point at height u traces f′; at 17 s the ghost line y = x reveals through the trace | one head drawing a curve that did not exist before | Slopes drawn as heights | none (φ-law) | 38–44 | advanced | graphical+symbolic co-lead / numeric | trace head `(1.12, 1.12)`; end: the traced slopes lie on `f′(x) = x` |
| S9 | Teacher sandbox | `drag-sandbox` | `xq` ping_pongs 1.9↔1.1 (8 s/leg, measured) from t = 2500 until a genuine drag seizes it; P also draggable; chord + tangent + all readouts live; parking Q on P re-performs the S4 vanish, live | a handle already moving — discoverability | Drag both points | **ALL: draggable P (x₀ ∈ [−1.6, 1.6]) · draggable Q (xq ∈ [−1.9, 2.0])** | 0 / open | core | graphical / numeric | secant slope, tangent slope, h = xq − x₀ (3 dp, −0 clamped), both point readouts |

**Rule 32 plan.** ONE home frame in all 9 states (`x_range [−2.4, 2.4]`, `y_range [−1.9, 2.5]`, §11); never pans, zooms, or rescales. Cause-first is reveal order (S2, S5, S7) or a single driver with a readable lag on its effect (readout follows geometry from one evaluation — D8 @3120/@3683). Only the taught variable moves per guided state. Exactly ONE glow focal per state: S1 P · S2 the chord · S3 the chord · S4 P (the lone survivor) · S5 focal_sequence sec→tan · S6 the tangent · S7 focal_sequence over the four ladder lines · S8 the trace-head point · S9 none. Declared entry pose per state in §12; the two pose resets (S5 opens on S4's void; S7 restores the chord) are declared there with their reveal-order covers.

**advance_mode (Rule 15 / Gate 12):** S1–S8 `manual_click`, S9 `interaction_complete` → 2 distinct modes. No `wait_for_answer` anywhere.

**Control decision, argued.** S3/S4/S5 are watch beats with zero controls, deliberately: each is a timed convergence whose meaning lives in the sweep; a mid-sweep drag would decouple the readout from the narrated phase. S6 carries the P-drag because "your point, your slope" is what a teacher does by hand. S9 exposes both points and nothing else — h is the Q-point, not a slider (§⓿d).

## 4. Misconception confrontation plan (Rule 16a — 3 genuine pivots)

No EPIC-C branches. `misconception_watch` on exactly S3, S4, S5 — no per-state tic.

| # | Wrong belief | State | Contrast beat (consequence first, then the mathematics — sequential) |
|---|---|---|---|
| M1 | "Average rate and the rate at a point are the same thing" | S3 | Wrong expectation's consequence first: the state opens dwelling on the h = 1 chord reading `1.5000` labeled "average over the gap" — if average were the answer, the number would be done. Then Q slides: the number MOVES (1.5 → 1.25 → 1.05 → …), so the chord's number depends on the gap — and only the settling value belongs to the point. `one_line_fix`: "A chord's slope is an average over its gap; the point's slope is the number those averages settle on." |
| M2 | "At h = 0 the formula gives 0/0, so the slope at a point is meaningless" — **the strongest; the dispatch's pick** | S4 | Consequence first, performed by the ENGINE itself: Q lands on P and the chord + readout literally vanish (@3704) — the picture agrees that h = 0 gives nothing. Then the real mathematics, as two timed callouts: "Two points became one: no chord, no slope — 0/0 is not a number" (12 800 ms) and "But the values were heading somewhere: 1.0050, 1.0005, … → 1.0000. That number is the limit — the slope AT the point" (16 000 ms). `one_line_fix`: "h = 0 is excluded; the derivative is the number the slopes approach, not the slope you compute there." |
| M3 | "The chord eventually BECOMES the tangent — h reaches 0 at the end" | S5 | Consequence first: the picture seems to confirm it — by h = 0.004 the two lines are one line on screen. Then the numbers refuse: secant `1.0020`, tangent `1.0000`, still distinct at every rendered instant down to the floor (`1.0005` vs `1.0000`). `one_line_fix`: "The chord approaches the tangent; only the limit IS the tangent." |
| — | **Cue check:** no delta cue states a wrong belief as fact — "h = 0: no chord" and "One line remains" state truths. **S2 pre-loads M1** (it teaches the two-point slope with full confidence — the state M1 later interrogates). | | |

## 5. `has_prebuilt_deep_dive` states

**S3** (the aha) · **S4** (0/0 — the hardest idea, and the historically stickiest) · **S5** (approaching vs reaching — the exam-costly one). Cache-hint only; V1.0 ships zero authored deep-dives; other states' Explain button routes to the feedback form (Rule 18). These are the same states carrying Block-1 cliff/misconception weight — no divergence to document.

## 6. Drill-down clusters (3 per deep-dive state)

- **S3:** `slope_between_vs_slope_at` · `why_the_number_settles` · `closer_but_never_equal`
- **S4:** `zero_over_zero_meaning` · `why_h_cannot_be_zero` · `what_a_limit_means_here`
- **S5:** `is_the_tangent_ever_reached` · `tangent_touches_once_myth` · `reading_a_slope_off_a_line`

Each ships a migration seeding 5 `trigger_examples` — a json_author deliverable.

## 7. `entry_state_map` — ring-tagged with fallbacks

```
entry_state_map:
  foundational:        STATE_1 → STATE_5   # core — contains the PRIMARY aha (S3)
  point_variation:     STATE_6             # core
  derivative_function: STATE_7 → STATE_8   # ADVANCED — falls back to foundational under both cuts
  exploration:         STATE_9             # core
```

Default aspect = `foundational`. Every aspect either survives both preset cuts or declares its fallback — checklist item 4 of §10(i-1).

## 8. Prerequisites (advisory only — Rule 23)

`prerequisites: []` (no shipped mathematics concept precedes this). Advisory background: reading y = f(x) off a graph; the slope of a straight line as rise ÷ run. `graph_transformations` (P1 #1) is a SIBLING, not a prerequisite — no edge.

## 9. Real-world anchor (Rules 35 / 38f — universal)

**Primary and only anchor: the speedometer** — the canonical everyday derivative, on every vehicle in every country. Assigned to **S1**, inside its 28–36-word budget, verbatim:

> **"A car's speedometer shows your speed at this instant — one moment, not an average over the whole trip."** *(18 words.)*

No secondary anchor. The sim's curve is y = x²/2, not a speed graph, so **the anchor is a sentence and is never drawn** — stated so no downstream agent labels the axes "time" and "distance". (Scar `skeleton_anchor_specified_in_section_9_reaches_no_narration_line`: the sentence is quoted again in S1's state block, §12 note.)

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) Every state by id:** S1 apparatus + anchor · S2 chord/rise/run (`1.5000`) · S3 shrink to h = 0.01 / PRIMARY aha / M1 · S4 the void at h = 0 / M2 · S5 tangent as limit / M3 · S6 P-drag, slope = x₀ · S7 algebra x₀ + h/2, lim, f′ · S8 f′ traced onto y = x · S9 explore.

**(b) Symbol-label table + term-introduction ledger** (the defining state precedes every use, HUD included):

| Quantity | On-canvas label | Primitive | Defined in | Used in |
|---|---|---|---|---|
| the curve | `y = x²/2` (curve-end, bare) | `label` + `plane_id` | S1 | S1–S9 |
| the point | `P` + readout `(1.00, 0.50)` | `plot_point.readout` | S1 | S1–S9 |
| the second point | `Q` | `plot_point` | S2 | S2–S5, S9 |
| the gap | `h` (labels the run segment) | `label` | S2 | S2–S5, S7, S9 |
| rise / run | `rise = 1.500` / `run = h = 1.000` | `label` per segment | S2 | S2 |
| **slope (dual-label once, 38d)** | `slope (gradient) = 1.5000` → bare `slope =` thereafter | **`secant_line.readout` ONLY** (§⓿a constraint) | S2 | S2–S5, S9 |
| the tangent + its slope | `tangent` · `slope = 1.0000` | `tangent_line.readout` | S5 | S5, S6, S8, S9 |
| the sweep position (S8) | *(no symbol — the marker)* | `plot_point` on `u` | S8 | S8 |
| **`lim`, `h → 0` (notation ladder, 38c)** | inside S7's surface only | formula surface | **S7 (advanced)** | S7, S8 |
| **`f′(x)`** | `f′(x₀) = x₀` chip; `f′(x) = x` curve-end | formula surface / `label` | **S7 (advanced)** | S7, S8 |

Per-state HUD: S1 P readout · S2 rise, run/h, slope · S3 `h` (3 dp) + the chord readout · S4 `h = 0.000` + callouts (NO slope) · S5 both line readouts + `h` · S6 tangent readout + P readout · S7 chord readout + the ladder · S8 marker readout + trace-head readout · S9 all live. All mathematics real Unicode (`x²`, `f′`, `→`, `₀`, `−`); variable KEYS ASCII (`x0`, `xq`, `h`, `hlog`, `u`, `xdraw`).

**(c) Sign/direction plan:** x rightward, y upward; the canvas-y inversion lives ONLY in the plane transform (F1) — no authored expression carries a pixel or a flip. Negative slope is carried by the tangent's visible downhill tilt AND its signed readout (S6 sweeps through both signs; "negative slope" is the plain phrase — Rule 41). Drawn intervals declared: `x_domain [−2.1, 2.1]`; x₀ ∈ [−1.6, 1.6]; xq ∈ [−1.9, 2.0]; h ∈ {choreographed: 1 → 0.001, and exactly 0 in S4 only}. Interval honesty: no caption generalises past the drawn window; S8's "the slopes lie on a straight line" names THIS curve, not all curves.

**(d) Motion plan:** §3 + §12. Terminations: S1–S8 one-shot-hold (each claims a change); S9 ping_pong free-run until seized (Rule 37). Entry values stated per state in §12. No static state — S7's motion is its four timed symbolic arrivals (the #3 S2 precedent).

**(e) Modes:** conceptual only (Rule 20 [D]).

**(f) `assessment` + `coverage_map` + registry.** SIX items against the schema floor `min(6)` (`conceptJson.ts` @328):

| # | Item | State | Distractor |
|---|---|---|---|
| 1 | Average rate of f = x²/2 between x = 1 and x = 3 → **2.0** | S2 | 1.0 ("the slope at x = 1" — M1) |
| 2 | As h shrinks, the chord slope at x = 1 … → **approaches 1, never equals it at any h > 0** | S3 | "reaches 1 when h gets small enough" |
| 3 | Putting h = 0 straight into (f(1+h) − f(1))/h gives → **0/0 — undefined** | S4 | "0" — M2 |
| 4 | The tangent at P is → **the line whose slope is the limit of the chord slopes** | S5 | "the line through two very close points" — M3 |
| 5 | For f = x²/2, the slope at x = −1 → **−1** | S6 | "+1" (slope-is-always-positive) |
| 6 | f′(x) for f = x²/2 → **x** | S7/S8 | "x²" |

No item reuses a number a state renders as a worked pair (checked against §3's number column: 2.0 appears only as a coordinate, never a rendered slope; 1.25/1.05/1.5 avoided). `coverage_map.by_state`: items 1–6 → S2, S3, S4, S5, S6, S7+S8; **`non_assessed_states: [STATE_1, STATE_9]`**. Items ring-tagged: 1–5 core, 6 advanced (hidden with its states). **json_author deliverables:** the §6 drill-down migration; `computePhysics_derivative_as_limit_of_secant_slope` + TS twin in `ENGINES` (scar `…missing_physics_engine`) — **variables passthrough with EMPTY `derived`: no slope is ever computed outside the two line primitives** (one quantity, one readout — and the §⓿a h = 0 safety); the no-literal-`{` sweep on every rendered string.

**(g) Register-triangle plan (Rule 33, mathematics form).** Metrics: slope 4 dp (both line readouts) · h 3 dp with −0 clamp · coordinates 2 dp · x₀ 2 dp. Graphical lead on every core state; symbolic never leads before S7 (its story earned in S2–S5); the numeric register present in EVERY state (the number column, §3). Correlates: h → the visible gap between P and Q · slope → the chord's tilt AND its readout · the void → h = 0 · f′ → the traced height.

**(h) Canvas budget (Rule 34) — ONE formula surface per state:**
S1 `y = x²/2` · S2 `slope = rise ÷ run` · S3 (no new surface; S2's persists, dimmed — the readout is the story) · S4 `(f(x₀+h) − f(x₀)) ⁄ h  at h = 0 → 0⁄0` · S5 `tangent = the limiting line` (words, not an equation — no rendered pair satisfies an equality here, so none is asserted) · S6 **NO new symbolic surface** — RESOLVED by the §10h identity diff: a `slope at x₀ = x₀` surface would assert the derivative before S7 derives it, so S6 carries only its tangent readout (the number) · S7 the four-line ladder ending `f′(x₀) = x₀` (the ONLY surface carrying `lim`; advanced) · S8 `f′(x) = x` · S9 `slope = rise ÷ run` (core-taught, 38b). Top caption = delta cue only; prose in the strip below; value-only HUD. **Formula-vs-HUD identity diff:** S7's `slope = x₀ + h/2` at the held h = 0.8, x₀ = 1 → 1.4 vs the chord readout `1.4000` ✓ exact in rendered digits (float `measured` class); S2's `rise ÷ run` → 1.500/1.000 = 1.5 vs `1.5000` ✓.

**(i) Curriculum-flex block (Rule 38) — cuts argued by RING ASSIGNMENT alone (no `min_ring`, no hiding field — scar `skeleton_discharges_a_ring_cut_with_a_field_no_renderer_reads`):**

- **(i-1) BOTH cuts over four checklists (narration duty bound on mathematics_author, formula surfaces, HUD, routing map):**
  - **Cut 1 — hide advanced (drop S7, S8):** survivors S1–S6, S9. No survivor renders `lim`, `f′`, or `x₀ + h/2` (S6's surface was re-ruled numeric-only ABOVE precisely to make this true); no survivor's HUD shows a quantity S7/S8 introduced; S9's two controls map to S6 (P) and S2–S4 (Q), both core; `derivative_function` aspect falls back to `foundational`. **COHERENT.**
  - **Cut 2 — hide advanced + extended:** the extended ring is EMPTY, so Cut 2 ≡ Cut 1. **COHERENT by identity** — stated, not skipped.
  - **Reverse check:** the payoff state (S3) and both `misconception_watch` companions (S4, S5) are core ✓.
- **(i-2) Explore = CORE only (38b):** S9's surfaces and controls are S2/S6-taught; no f′, no lim, deliberately.
- **(i-3) `curriculum_tags`** — CLAIMS (38g), carried from the Phase-0 §0a row for #2; only CBSE `verified: true`: CBSE/NCERT full (Class 11 Limits & Derivatives — first-principles is examined by name) · ICSE/ISC full · JEE full · IB DP AA full · AP Calculus AB/BC full · Cambridge IGCSE 0606 full · A-level Pure full. **All non-CBSE cells ship `needs_teacher_verification: true`.**
- **(i-4) Presets:** `full` = S1–S9 · `no_advanced` = `core_only` = hide S7, S8 (identical; both names ship so the preset vocabulary matches the fleet).
- **(i-5) Graph-axis convention (38e):** x horizontal, y vertical — no board conflict, no toggle. Dialect (38d): "slope (gradient)" dual-labelled once in S2, then bare.

**Registration plan:** `src/data/concepts/mathematics/derivative_as_limit_of_secant_slope.json` + one row in `src/lib/mathematicsCatalog.ts` ONLY. The 8 physics registration sites are FORBIDDEN for this id until a mathematics serving path exists (precedent: `bohr_model_energy_levels`, `unit_circle_to_sine_wave`).

## 11. On-canvas layout geometry (pixel plan) — COMPUTED

Canvas 760×500 logical px (`createCanvas` clone from #3's §⓿). No camera, no zoom.

- **The one home plane (all 9 states):** `viewport {x: 70, y: 78, w: 660, h: 372}` (the #3-proven rect) · `x_range [−2.4, 2.4]` · `y_range [−1.9, 2.5]` · `equal_scale: false`.
  Derived: **137.5 px per x-unit**, **84.55 px per y-unit**; origin (0,0) at px **(400.0, 289.4)**; P(1, 0.5) at px **(537.5, 247.1)**; Q(2, 2) at px **(675, 120.4)**.
  **Unequal-scale decision, argued:** `equal_scale: true` (F5) would shrink the usable frame to 44 px/unit slivers; the 1.63× vertical compression is accepted because slope is taught as a NUMBER + rise/run, never as a screen angle — which is also why no angle arc exists (§⓿c) and why CP-D computes slope from data, never pixels (@3616–3633).
- **Range containment over the full control product:** `x_domain [−2.1, 2.1]` → f_max = 2.205 ≤ 2.5, headroom 0.295 > 5 % of span (0.22) ✓; xq ∈ [−1.9, 2.0] → f ≤ 2.0 ✓; x₀ ∈ [−1.6, 1.6] → f ≤ 1.28 ✓; S8 trace y = u ∈ [−1.6, 1.6] ≥ −1.9, headroom 0.3 ✓. Extended chords/tangents are frame-clipped by construction (Liang-Barsky @3644) — F9 break-on-exit is NOT consumed (the drawn function never exits; stated for the union walk).
- **Ticks:** `x_tick 1`, `y_tick 1`, `tick_decimals 0`, gridlines on.
- **HUD band (all states): px (330–465, 96–150) — top-middle, PROVEN ink-free** across the full control product: every chord's line is y(x) = (a+b)x/2 − ab/2 (exact for x²/2); maximising over the four corners of a ∈ [−1.6, 1.6], b ∈ [−1.9, 2.0] at |x| ≤ 0.47 gives max y = **1.688 < 2.3** — 0.6 data-units below the band. Tangents pass even lower (y(0) = −x₀²/2 ≤ 0). Computed, not eyeballed.
- **Delta cue** top-left (40, 55) · **formula surface** top-right (500, 62–84), clearing the review chrome `#fsTopControls` (top ≈ 10–40 px) by ≥ 22 px (Rule 34d; the #3 F16 check, cloned). **Measured worst-case note:** an extreme explore drag (x₀ = 1.6, xq = 2.0) runs the clipped chord to the frame top at px ≈ (713, 78), passing ~2 px under the surface's bottom edge at px x ≈ 706 — a moving stroke grazing a chip corner in one drag extreme, not a text-text collision; recorded as accepted with these numbers.
- **S4 callouts:** callout 1 at (537, 180) (above where P sits, in the now-empty chord corridor); callout 2 at (537, 330) (below P, empty). Both are `label`s, gate-timed (§⓿a).
- **S2 rise/run:** run = dashed `vector` (537.5, 247.1) → (675, 247.1); rise = dashed `vector` (675, 247.1) → (675, 120.4); labels perpendicular-offset (the midpoint-bisect scar is FIXED — relied upon, §14).
- **Colour plan (Rule 29):** curve one cool hue; chord a warm hue; tangent a distinct dim-authored violet that BRIGHTENS only by focal glow; f′ trace + ghost a third hue; apparatus neutral. Emphasis is brightness/glow only — never size.

**Constraint callouts for `mathematics_author`:**
1. Every authored coordinate is DATA (`plane_id` everywhere); a pixel literal in an expression is a defect — except the six fixed overlay positions above, which are screen furniture (no `plane_id`).
2. **Slope is NEVER computed in a label expression or in computePhysics** — only the two line primitives' own readouts render it (§⓿a; the h = 0 safety).
3. The h-law and φ-law (§3). One choreography entry per variable per state (`pm_applychoreography_silently_keeps_only_the_last_entry_per_variable`, OPEN).
4. No slider anywhere in this concept (caption trap @4580).
5. All motion a pure function of the state clock; no `Math.random()`.
6. Bare `pow()`/`abs()` idiom; never `Math.`; Unicode in rendered text only.
7. S8 trace budget: window 14 000 ms at `sample_ms: 80` → 176 samples ≤ 240 (`PM_LOCUS_TRACE_MAX_SAMPLES`) ✓.
8. A `position_expr` body/label must not also declare `animation` or a surface attachment.
9. Reader-facing nouns: "chord", "gap", "tangent", "slope (gradient once)". Never "secant" in reader-facing text — `secant_line` is the contract name only. (Rule 41c: "chord" is used by every claimed board's textbook; "secant" is jargon the lesson does not need.)

## 12. Per-state timing table — sub-beats, driver profiles, pins, MEASURED column

**PASS condition:** standard Rule 31 (25–55 EN words per guided state, explore 0) — the #3 skeleton's `words_max` formula is NOT ratified and is not used; budgets in §3 were nonetheless sanity-checked at ≤ 2.5 words/s of each state's motion window, so no state can be narration-starved. Pin = 0.6 × duration unless `eye_capture_ms` overrides; every pin ≥ 167 ms clear of the nearest sub-beat boundary on the correct side and after the state's last asserted reveal.

**Measured column:** `PM_choreoBuildSegments` @1158 / `PM_choreoSampleSegments` @1189 / `PM_choreoValue` @1207 extracted verbatim from the renderer at `994bb8f` and run in node this session (raw output below). S1's re-ranged `xdraw` endpoints and S4's 9 s re-timing are linear-map arithmetic ON the measured profile (`once` linearity + exact-endpoint return are what the probe established).

| St | Dur | Sub-beats (ms) | Driver profile | Entry pose | **Measured (probe)** | Pin → shows | Margin |
|---|---|---|---|---|---|---|---|
| S1 | 20 s | 0–1500 frame/ticks; 1500–8500 curve draws; 10000–16000 P slides; hold → 20000 | `xdraw` −2.1→2.1 `once` 1500/7000 · `x0` −1.2→1 `once` 10000/6000. Anchor sentence lands in the P-slide window | empty frame | `xdraw@5000 = 0.30→(re-ranged 0.0)`, `@8500 = end exact`; `x0@13000 = −0.10`, `@16000 = 1.0000` exact | **`eye_capture_ms: 17000`** → full curve, P at (1.00, 0.50) | 1000 ms |
| S2 | 22 s | Q reveals 2500; run 7000; rise 11000; chord + readout 15000 (+600 anim); hold → 22000 | no continuous driver — four gated reveals (h static = 1) | S1 end | reveal arithmetic (no choreo spec) | **`eye_capture_ms: 16500`** → chord, rise/run labels, `slope = 1.5000` | 900 ms |
| S3 | 24 s | 0–1500 dwell at h = 1 ("average" chip — the M1 wrong-half); 1500–20500 `hlog` sweep with dwells; hold → 24000 | `hlog` 0→−2 `once` 1500/15000, `holds: [{−0.30103, 2000}, {−1, 2000}]` | S2 end (h = 1) | plateau boundaries **3758 / 5758** (h = 0.5 dwell) and **11000 / 13000** (h = 0.1 dwell); end 20500 exact; **pin 14400 → h = 0.0651, slope = 1.0325** | 14400 → chord near-settled, readout mid-countdown — the aha frame; correct half (post-dwell) | 1400 ms |
| S4 | 24 s | 0–3000 hold h = 0.4; 3000–12000 h→0; **vanish at 12000 (measured-exact)**; callout 1 @12800; callout 2 @16000 (+600); hold → 24000 | `h` 0.4→0 `once` 3000/9000 — plain h, because the endpoint must be EXACTLY 0 | h = 0.4 (declared reset; the new thing = the landing) | probe: `h@ramp-end = 0` exactly → `secantValid = false` from that ms; `h@13200 = 0` | **`eye_capture_ms: 17500`** → NO chord, `h = 0.000`, BOTH callouts — the correct half of M2 | 900 ms after callout 2's anim end |
| S5 | 22 s | tangent reveals 1500 (+800); 4000–16000 `hlog` sweep; focal sec→tan @14000; hold → 22000 | `hlog` −0.398→−3 `once` 4000/12000. Reveal order satisfies 32a (the new line first, then the driver) | S4 end (void); chord fades back in with the sweep | **pin 13200 → h = 0.00405, secant 1.0020 vs tangent 1.0000**; end h = 0.00100 → 1.0005 | 13200 → lines coincident, numbers distinct — M3's correct half | 800 ms clear of the focal switch |
| S6 | 20 s | chord fade-out 0–1500; 2000–15000 `x0` sweep; hold → 20000; **a genuine P-drag seizes at any time** | `x0` −1.4→1.4 `once` 2000/13000; drag door = P (`plot_point.drag`) | S5 end minus chord (declared removal = the delta) | `x0@12000 = 0.7538` → tangent slope 0.75; `@15000 = 1.4000` exact | 12000 (default 0.6×) → mid-sweep, tangent tilted, readout live | 3000 ms |
| S7 | 24 s | chord restored @1000 (h = 0.8, x₀ = 1 — declared reset); ladder lines 3000 / 8000 / 13000 / 18000 (+600) | no continuous driver — four gated reveals; focal_sequence rides the lines | declared | reveal arithmetic | **`eye_capture_ms: 19500`** → full ladder incl. `f′(x₀) = x₀` + lim chip, chord at `1.4000` | 900 ms |
| S8 | 24 s | 0–2500 f dims to ghost; 2500–16500 `u` sweep; ghost `f′(x) = x` line reveals @17000 (+600); hold → 24000 | `u` −1.6→1.6 `once` 2500/14000 — **one driver** for marker, tangent segment, and trace head (correspondence: never staggered) | declared (S7's chord retired via fade-out) | `u@14400 = 1.1200` (marker (1.12, 0.63), head (1.12, 1.12)); `@16500 = 1.6000` exact | **`eye_capture_ms: 18500`** → complete trace lying on the revealed line | 900 ms |
| S9 | open | scene up 0–2500; `xq` ping_pong from 2500 until seized; free-run (Rule 37 — `interaction_complete` skips the freeze) | `xq` `ping_pong` 1.9↔1.1, 2500/8000; `x0` teacher-owned (entry 1.0) | S8 end minus f′ layer | ping_pong legs measured: `xq@2500 = 1.9 → @10500 = 1.1 → @18500 = 1.9` (8 s/leg, 16 s period); endpoints 1.1/1.9 keep h ∈ [0.1, 0.9] — **never degenerate uncommanded** (the h = 0 void fires only under a deliberate teacher drag) | none (explore) | n/a |

**Probe output (verbatim, node, 2026-08-06, functions extracted @994bb8f):**

```
S3 plateau boundaries ~ [3758, 5757.5, 11000, 13000]
S3 t=14400 hlog=-1.1867 h=0.0651 slope=1.0325 · t=20500 h=0.0100 slope=1.0050
S4 t=9999(pre-end) h=5.7e-5 valid=true · t=ramp-end h=0 valid=FALSE · t=13200 h=0 valid=FALSE
S5 t=13200 h=0.00405 secant=1.0020 tangent=1.0000 · t=16000 h=0.00100 secant=1.0005
S6 x0@12000=0.7538 @15000=1.4000 exact
S8 u@14400=1.1200 @16500=1.6000 exact
S9 xq ping_pong: 2500:1.9 6500:1.5 10500:1.1 14500:1.5 18500:1.9 26500:1.1
float: m(1,h).toFixed(4) → 1.5000/1.2500/1.0500/1.0050/1.0005 ; 1.0005 ≠ 1.0000 ✓
interpolate-ternary: h=0 → "no chord" ; h=0.4 → "" ✓
```

## 13. THE UNION WALK — #2 against the Phase-0 union (consumption walk, both directions)

| State | Rows CONSUMED (co-present) |
|---|---|
| S1 | F1 F2 F3 F4 F6 F7 F8 F11 |
| S2 | F1–F4 F6 F7 F8 F11 **F13** |
| S3 | F1–F4 F6 F8 F11 F13 |
| S4 | F1–F4 F6 F8 F11 F13 (its VANISH is F13's own validity guard) |
| S5 | F1–F4 F6 F8 F11 F13 **F14** |
| S6 | F1–F4 F6 F8 F11 **F12** F14 |
| S7 | F1–F4 F6 F7 F8 F11 F13 |
| S8 | F1–F4 F6 F7 F8 **F10** (two co-present `function_plot`s: ghost f + revealed f′ line) F11 F14 (segment mode) **F17** (`locus_trace` + F7 on `u`) |
| S9 | F1–F4 F6 F8 F11 F12 F13 F14 |

**Direction 2:** #2 consumes **F1–F4, F6, F7, F8, F10, F11, F12, F13, F14, F17 = 13 of 17** — one more than the 0a sketch implied (F10 via S8's two plots) and one less in another place (F9 break-on-exit NOT consumed: `x_domain [−2.1, 2.1]` keeps every drawn sample inside `y_range` by the §11 containment computation; F9 stays claimed by #1's tan x). **F13/F14's sole-driver claim is DISCHARGED here** — #2 is the concept the union bought them for, and both are consumed in five and four states respectively. F5 (`equal_scale`) deliberately not consumed (§11 argument). No state consumes anything outside the union; **the engine purchase list is EMPTY** — the 0d success test ("#2 requires zero renderer edits") holds at design time.

**Scriptability — every knob and its cue:** `xdraw` (S1, choreo → `x_domain.max_expr`) · `x0` (S1/S6 choreo; S6/S9 drag via P) · `hlog` (S3/S5 choreo → secant `to_expr: {x: "x0 + pow(10,hlog)", y: "(x0+pow(10,hlog))*(x0+pow(10,hlog))/2"}`) · `h` (S4/S7 choreo → same shape with plain `h`) · `u` (S8 choreo → marker/tangent/trace, never seizable) · `xq` (S9 ping_pong-until-seized via Q). Every knob that changes has a cue; every cue names its reader.

**Shape check:** one flat `scene_composition` per state expresses everything (D9 — no new per-state field); no state needs a second plane, no state needs two configs.

## 14. Scar compliance — inherited rows (the digest, 38) + open PCPL lane (10), disposed

**CRITICAL:** `archetype_live_tier_unverified_against_renderer` — discharged by §⓿ (every specific motion verified at file:line at THIS SHA, with tiers) · `pcpl_locus_trace_sweep_parameter…` (OPEN) — φ-law: one trace, on `u`, never seizable; both Gate 9(d) doors verified BUILT (@436/@443) · `review_site_private_config_assembler…` (FIXED) — binds forward via D9: everything in `scene_composition` · `pcpl_position_expr_authored_as_an_object_literal_string…` — the shape table is explicit here: `secant/tangent from_expr/to_expr/at_expr` = **objects of expression strings** (@3690–3695 — NOTE: the OPPOSITE of `vector`'s single-string shape; both shapes now coexist in one renderer, so the constraint callout to json_author names both); `label/body position_expr` = object; `vector from_expr` = single string; literal `position` authored beside every `position_expr`.

**DIRECTIVE:** `named_primitive_declared_without_the_surface…` — every readout names its surface primitive (§10b, all `*.readout` or `label.text_expr`) · `frozen_pin_unbudgeted_on_a_sequential_misconception_state…` — S3/S4/S5 pins land in the measured correct half with stated margins (§12) · `skeleton_anchor_…reaches_no_narration_line` — anchor verbatim in §9 AND S1's budget · `authoring_side_do_clause_of_an_open_scar…` — binds json_author: re-run every OPEN row's probe against the FINISHED JSON at handoff.

**MAJOR:** `formula_surface_states_an_identity_in_a_unit_the_hud_never_renders` — §10h diff run; S6's surface was DELETED by this check (it asserted f′ before S7 derives it; replaced by the numeric readout) · `pcpl_glow_focus_cannot_resolve_an_expression_driven_vector…` — no `glow_focus` primitives authored; focal targeting via `focal_primitive_id`/`focal_sequence`, which secant/tangent/plot_point all consume directly (verified @3778/@3831/@3137) · `eye_pixel_gates_pass_over_a_body_frozen…` — the expected-movers set per state is derivable from §12's driver column; eye_walker must check the CHORD and the READOUT move in S3/S5, and that S4's frozen frame contains NO chord · `skeleton_discharges_a_ring_cut_with_a_field…` — cuts by ring assignment only (§10i) · `correspondence_state_stages_cause_first…` — S8's marker/trace share ONE driver, declared in §12 · `skeleton_budgeted_frozen_pins_are_never_transcribed…` — every §12 `eye_capture_ms` cell is a REQUIRED JSON field; json_author checklist line "pin transcribed?" · `state_opens_on_the_degenerate_value…` — no state opens at h = 0 except S5, whose opening void is its predecessor's TAUGHT pose, not a degeneracy of S5's own claim (its claim is the tangent, revealed first); S9's ping_pong endpoints (1.1/1.9) keep the pair distinct · `concept_schema_assessment_minimum…` — 6 items vs `min(6)` ✓ · `subject_namespace_concepts_are_invisible…` — id resolution via the shared resolver; registration §10 · `pcpl_no_primitive_draws_a_circle_or_arc_at_a_live_radius` / `pcpl_drawlabel_has_no_position_expr…` (both FIXED) — relied upon where used · `narration_names_a_reference_line_the_scene_never_draws` — binds mathematics_author: every named reference (chord, tangent, run, rise, "the straight line the slopes lie on") is a drawn primitive in that state.

**MODERATE:** `pcpl_slider_label_stale_under_choreography` (FIXED) — no sliders exist here anyway · `formula_surface_footprint_overlaps_an_authored_curve_end_label` — the top-right surface rectangle is reserved; curve-end labels sit at the domain's right edge (px ≈ 640, y ≈ 103), 60 px clear · `hud_prints_negative_zero…` — clamp idiom authored on h in S9 (§3) · `pcpl_glow_focus_renders_a_halo_before_its_target…` — no glow_focus authored · `renderer_pair_panel_b…` — `"none"` sentinel authored · `pcpl_angle_arc_sweep_beyond_one_full_turn` / angle-arc label rows — no angle_arc authored · `pm_applychoreography_silently_keeps_only_the_last_entry…` — one entry per variable per state throughout §12 · `axis_tick_labels_reveal_before_the_axis…` — ticks/labels are the plane's own (one primitive, one gate) · `pcpl_has_no_outline_only_shape_primitive` — no outline bodies needed · `eye_walker_dispatched_against_a_stale_run_dir` — recorded for the EYE step · `pcpl_solver_cannot_register_expression_driven_vector_primitives_as_obstacles` (OPEN) — all labels near expression-driven geometry are placed by computation here (§11), verified across the full control range, never left to the solver.

**Open PCPL lane (10):** `direction_of_resultant…missing_physics_engine` — computePhysics + ENGINES twin authored (passthrough; §10f) · `normal_reaction_state5_computed_outputs_name_mismatch` — computed_outputs = ∅ derived, nothing to mismatch · field3d rows — N/A by surface · `frozen_frame_read_as_dense_series_continuation…` + H2-wobble row — recorded for the baseline step (five states pin mid-motion; tolerance from evidence, never 0.00 %).

---

## Block 1 — Pass-1 strategic checklist

**1. Prerequisite cliff.** Slope of a straight line. Breaks at **S2** without it. Patch sentence inside S2's budget: *"The chord's slope is rise divided by run — how far the curve climbs between the two points, divided by the gap h."* (Also carries the h definition.)

**2. Exam-backwards trace** (CBSE/JEE-Main style): *"Find f′(1) from first principles for f(x) = x²/2."* Pieces → states: the difference quotient as a chord slope → S2; the shrink and its behaviour → S3; why h = 0 is excluded → S4; the limit as the definition → S5; the algebra x₀ + h/2 and the lim notation → S7; the general f′ → S8. S6 is exercised by assessment item 5. No missing piece; no idle state.

**3. Misconception entry mapping (16a).** M1 is planted by S2 itself (a confidently-taught two-point slope) and confronted at S3's opening dwell. M2 is planted by every textbook's "put h = 0" shortcut and confronted at S4, where the engine itself performs the consequence. M3 is planted by the very phrase "the secant becomes the tangent" and confronted at S5, where the picture merges and the numbers refuse. Sentences that might plant: S3's narration must never say the readout "reaches" 1 (binds mathematics_author — `teach_visual_must_match_narration` family).

## Block 2 — Aha-moment designation

- **PRIMARY aha:** *A point has its own slope — you can watch the two-point slopes settle onto it.* State **S3** (inside `foundational` STATE_1→STATE_5 ✓).
- **SUPPORTING aha (1):** *Collected, the slopes are themselves a function — the curve's steepness has a shape of its own.* State **S8**.
- **Cohesion:** S8's aha is the PRIMARY aha iterated over every point — direct reinforcement, no stray aha.
- **Wrong-belief setup:** S1–S2 build "slope is a two-point thing" (confident, slightly wrong) → S3 breaks it; S1–S6 treat the slope as one number at one point → S8 makes it a curve.
- **Foundational-coverage rule:** SATISFIED — S3 ∈ foundational.

---

## Source check line

*Consulted the NCERT Class-11 Mathematics chapter index (Limits and Derivatives) and the named international specifications (IB DP AA guide, AP Calculus AB/BC CED, Cambridge 0606 syllabus, A-level Pure specifications) for SCOPE only, feeding §10(i-3). NCERT Exemplar consulted for misconception BELIEFS only (§4). No teaching method, no example problem, no figure imported. HC Verma and DC Pandey not consulted — physics-only, forbidden for mathematics.*

## Self-review checklist — run

- [x] Atomic claim one sentence; 9 states justified; nothing derivable from its predecessor.
- [x] Control table first; archetypes from the mathematics dialect + one physics-vocabulary import (`null-result-hold`, exactly fitting the h = 0 void); ONE declared companion pair (S3/S5) with its flip named; no static state; explore last, `interaction_complete`, all controls; budgets 25–55 with per-state motion-window sanity.
- [x] **ENGINE FIT CHECK complete — all four watchpoints carry explicit verdicts with line-cited evidence; ZERO renderer edits; ZERO STOP-flags; one first-pixel `ASSUMPTION` flagged (S5 sub-pixel coincidence), with no authoring decision resting on it.**
- [x] Probe-don't-grep: choreography boundaries, pins, endpoint exactness, ping_pong legs, float readout strings, and the interpolate-ternary fallback all `measured` this session; probe output pasted; behavioral claims without probes carry clone/read citations or the flag.
- [x] Misconception_watch on exactly 3 states; contrast beats sequential, consequence-first; pins archive the correct half with measured margins.
- [x] Rings: advanced {S7, S8} contiguous before explore; extended EMPTY and both cuts checked (Cut 2 by identity, stated); explore CORE-only; S6's premature f′ surface caught by the §10h diff and deleted; curriculum_tags claims-only; presets hide-never-reorder; 38e no conflict.
- [x] 6 assessment items vs `min(6)`; `non_assessed_states` declared; items ring-tagged; no worked-pair number reuse.
- [x] entry_state_map with fallbacks; PRIMARY aha in foundational; anchor universal, verbatim, inside S1's budget; Rule 41 titles/cues literal ("chord" not "secant" reader-facing).
- [x] Layout computed (px/unit, origin, HUD band ink-free PROVEN over the control product, chrome clearance, one measured accepted graze); zero TBDs.
- [x] Scar sweep run live (0 concept rows; pcpl-open, owner, directive lanes counted; inherited digest fully disposed in §14).

## FLAGS — for the orchestrator / founder_proxy Checkpoint A

1. **(Judgment, reviewable) f(x) = x²/2 over x².** Bought: f′ = x fits the single home frame (32d) and the derivation stays two-line. Cost: one `/2` on the S7 surface. Reversal = re-solving §11's ranges and re-running the §12 arithmetic.
2. **(Judgment, reviewable) No h slider anywhere** — refutes the dispatch's "h is a teacher-facing slider" premise on the measured caption-precision trap (@4580); the Q point is the h control. If the founder wants a literal slider, it must wait for an engine-side caption-precision field (a Rule-40 platform item — NOT bought here) or accept a 1-dp h.
3. **(Judgment, reviewable) "chord" as the reader-facing noun** (secant confined to the contract). Rule 41c argument in §11 callout 9.
4. **(Recorded, no action) The S5 first-pixel ASSUMPTION** and the explore-corner chip graze (§11) — both carried with numbers for the EYE step.

*Handoff: ready for **founder_proxy Checkpoint A**. On APPROVE → `mathematics_author`. Buildable NOW (CP-A…CP-D on master at `994bb8f`); no engine dependency outstanding.*
