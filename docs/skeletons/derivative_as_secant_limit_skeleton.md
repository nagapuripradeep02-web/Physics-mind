# ARCHITECT SKELETON — `derivative_as_secant_limit` — **AMENDMENT ROUND 1 (Checkpoint A cycle 1 `DESIGN_FIX` applied — all P1-1…P3-17 + the orchestrator id finding)**
## "The Derivative as the Limit of a Secant Slope"

> Subject: **mathematics** · Class 11 (Limits and Derivatives) / Class 12 (Continuity & Differentiability) · class_level 11 · `is_spine: true`
> Pipeline: `architect → mathematics_author → json_author → quality_auditor`
> Renderer: `parametric` (PCPL) — `renderer_pair.panel_a: "parametric"`, `panel_b: "none"`. JSON lives ONLY in `src/data/concepts/mathematics/derivative_as_secant_limit.json`; registered ONLY in `src/lib/mathematicsCatalog.ts`; validation = `npm run validate:mathematics`.
> **Concept id (AMENDED — orchestrator finding, verified myself):** the catalog RESERVES this id as a ghost row — `src/lib/mathematicsCatalog.ts:94` `concept_id: 'derivative_as_secant_limit'` — and two other ghosts name it as a prerequisite (`:102` `definite_integral_as_area`, `:156` `differential_equation_slope_fields`). Authoring under the round-0 id `derivative_as_limit_of_secant_slope` would have orphaned both edges. The round-0 collision check grepped `src/data/concepts/` only (0 hits, correctly) and could not see the registry reservation — generalisable lesson recorded as a scar candidate (§14; the orchestrator's SQL in `derivative_checkpoint_a_cycle1.md` carries it).
> Ranked-list authority: `MATHEMATICS_DISCUSSIONS.md` §6 **P1 #2** (breadth 7/7; capabilities 2, 4).
> Archetypes: **A — coordinate plane with a live function** + **H — limit approach** (`docs/patterns/mathematics.md` §1) — [NEEDS-SCENARIO] when written, LIVE at this SHA; §⓿ re-verifies each specific mechanism (scar `archetype_live_tier_unverified_against_renderer`, discharged and independently SUSTAINED at Checkpoint A).

> **Desk:** `Physics-mind-mathematics-derivative`, branch `feat/mathematics-derivative`, level with `origin/master`.
> **SHA probed against: `994bb8f`.** Citations are `symbol @line @994bb8f` in `src/lib/renderers/parametric_renderer.ts` unless another file is named.
> ⚠ **Execution status honesty:** the `cartesian_plane` family is compute-layer proven only; no p5 draw code has executed on any screen. Tiers: `measured` (node probe of the extracted shipped functions — outputs pasted §12) · `read` (cited body read in full) · `clone` (a shipped concept exhibits it).

> ## Amendment log — round 1 (Checkpoint A cycle 1 → `DESIGN_FIX`; authoritative record: `docs/skeletons/derivative_checkpoint_a_cycle1.md`)
> **The engine-fit verdict SURVIVED the attack** (all four watchpoints sustained; all eight §12 cells reproduced by the proxy; "ZERO renderer edits, engine purchase list EMPTY" stands). What failed was pictures, not mechanisms — three P1s were frames contradicting their own state's claim. Applied this round:
> **P1-1** — the plane is now EQUAL-SCALE BY CONSTRUCTION (k = 80 px/unit on both axes; new viewport {60, 78, 400, 372}; `equal_scale: true` authored as a belt), so S2's rise/run triangle reads 1.500 off the pixels (120 px / 80 px, measured) and slope 1 renders at 45.0° (measured). Round 0's trade argument used 44 px/unit where `PM_planeBuildTransform` @2079–2087 actually yields min(137.5, 84.545) = 84.545 — acknowledged wrong by ~2×; the trade was RE-derived with real numbers (§11) and the equal-scale direction accepted. The freed 270-px right column is now the instrument column, which also dissolves P1-2's collisions and P2-5's band proof. §⓿c's angle-arc reason RESTATED as pedagogy, not workaround.
> **P1-2** — the §11-callout-2 constraint is NARROWED to "no label expression may render the CHORD slope" (the h = 0 safety needs exactly that and no more; the tangent's `x₀` is defined at every h). The tangent number is now a placed `label` in the instrument column; `plot_point.readout.offset` is authored on P and Q; every readout pixel position at every pin is computed in §11 with separations ≥ 18 px (measured).
> **P1-3** — S4 rebuilt: the prose callouts are DELETED (sentences moved to narration where Rule 24/34a put them); the teaching residue is the NUMERIC LADDER the chord leaves behind — value rows revealed as the chord passes each h, surviving the vanish — plus a re-choreographed shrink (`hlog` + a 100 ms `hz` collapse to exact 0; measured, vanish at 13 500 ms, sub-frame `1.0000`-while-valid window of 10 ms). S4's frozen frame is now unmistakably not S1's.
> **P1-4** — the "teacher re-performs the h = 0 vanish" claim is WITHDRAWN as engine-false (guard 1e-12 vs drag quantum 1/80 = 0.0125 data units — re-derived for the NEW plane; min reachable slope readout `1.0063`). The explore payoff is re-claimed as the TRUE one: however close Q parks, a chord still exists and the number is still not 1.0000 — M3 by the teacher's own hand.
> **P2-5** ink-free-by-construction (all overlays off-plane; the one remaining on-plane label re-proved against the NAMED binding edge) · **P2-6** "chord (secant line)" dual-label per 38d · **P2-7** curriculum tags corrected by METHOD (0606 partial, IB AA SL partial / HL full) — the ring split now has named customers · **P2-8** `focal_sequence` tracks reveals in S1/S2/S4/S5/S7 · **P2-9** S1's Teaches line restated to what the canvas shows · **P2-10** transfer item 7 (`f(x) = 3x`) added · **P3-11…P3-17** all applied (per-state decimals; S7 HUD gains x₀/h chips; Q authored before P; S8 ghost domain matches trace; interval-honesty notes; S5 retitled; −0-clamp note) · **S5 ASSUMPTION flag CLOSED** by arithmetic re-derived on the new plane (max chord–tangent separation 0.55 px, measured this session).

---

## Engine bug queue consultation — LIVE SWEEP re-run 2026-08-06/07

- `derivative_as_secant_limit` → 0 DB rows, **but 8 scar candidates are FILED AS SQL against this id** in `derivative_checkpoint_a_cycle1.md` (7 proxy + 1 orchestrator) — every one is treated as BINDING below (§14) even though not yet applied to the DB. · `--pcpl --open` → 10 · `--owner alex:architect` → 74 · `--row-type directive` → 87 · inherited `unit_circle_to_sine_wave` digest → 38. Coverage boundary: owner + directive + pcpl + concept-id + the inherited digest + the checkpoint file.
- **Rule 40a: this skeleton buys NOTHING** — confirmed independently at Checkpoint A ("the engine purchase list is genuinely EMPTY"). One RIDE-ALONG recorded, not built: `secant_line`/`tangent_line` readouts hardcode `+10, −12` while `plot_point.readout` has `offset` (@3819/@3857 vs @3208–3210) — recommended to `MATHEMATICS_PHASE0_CARTESIAN_PLANE.md` §ledger as item 8, record-don't-build, same shape as founder-ruled item 7.

---

## ⓿ ENGINE FIT CHECK — every visual need → a named, contracted, line-cited feature

*(The full mechanism table of round 0 was independently re-derived and SUSTAINED at Checkpoint A — see `derivative_checkpoint_a_cycle1.md` "The four watchpoints" and "The arithmetic". Retained verbatim below with the four amended verdicts.)*

| Visual need | Named feature | Verified at (@994bb8f) | Tier |
|---|---|---|---|
| Frame, ranges, ticks, grid, transform | `cartesian_plane` (F1–F4, F6) | `drawCartesianPlane` @2168 · registry @2179 · `PM_planeResolve` @2135 · `PM_planeRangesOf` @2151 · **`PM_planeBuildTransform` @2079–2087 (`k = min(w/dx, h/dy)`, centred rect — the P1-1 correction)** | read |
| **Equal scale, guarded** | ranges/viewport in exact 400:372 = 5.0:4.65 ratio (k = 80 both axes, `measured`) + `equal_scale: true` as a belt (F5 — shrink-only, inert while the ratio matches) | @2079–2087 | measured |
| Curve, domain-driven draw-in, ghost style | `function_plot` + `x_domain.min_expr/max_expr` + `style` | @3049, @3064–3069, @3076–3077 | read |
| Points, readouts **with authored offsets** | `plot_point` + `readout.offset` | @3120, @3132, **offset @3204–3210** | read |
| Teacher drag on P/Q | `plot_point.drag` — slider-identical seizure | seize @3163 · inverse @2160/@3164 · clamp @3166–3169 · single-touch @3159 · hit radius = size + 8 ≈ 20 px @3157–3158 | read |
| Chord + live slope readout; **vanish at h = 0** | `secant_line`; guard `|Δx| < 1e-12 → valid:false` | @3696, @3704, @3708, @3773, readout @3805–3817 (midpoint + 10, −12) | read + measured |
| Chord/tangent extended + clipped | `extend:"frame"`, Liang-Barsky in DATA space | @3644, @3668 | read |
| Tangent, authored slope; segment mode | `tangent_line`, `slope_expr`; half-width 0.12 × x-span | @3745, @3743, @3826, readout @3857 (at-point + 10, −12) | read |
| f′ traced (F17) | `locus_trace` + `plane_id` on dedicated `u` | @2949, per-frame resample @2547 | read + clone |
| Tracking labels in DATA coords | `label` + `position_expr` + `plane_id` | @1813–1818, @1829–1832 | read |
| Timed reveal/disappear/fade | `PM_animationGate` | @805, @819–831 | read |
| Focal tracks the reveal | `focal_sequence` (windows; peers ×0.6) | @850, @870–881, @890 | read |
| Knob animation, holds, ping_pong, exact endpoints | `variable_choreography` | @1158/@1189/@1207 | **measured** (all §12 cells; proxy-reproduced) |
| Seizure + stand-down + per-state clear | @2877, @4961, @5424; `PM_stateLiveControlVars` @2983 | read |
| HUD precision | `label.text_expr` via `PM_interpolate` @1085 over `PM_liveExprVars` @1068 | read + clone |
| Draw order | CP-D slot @5249–5260 in pass @5186; **press claim = earlier-in-scene wins @5265 + @3159 (the P3-13 ordering rule)** | read |

**Gates:** Gate 9(d) both FATAL doors (`conceptGates.ts` @436 slider, @443 drag-bound, union @380) — `u` seizable nowhere → pass by construction. Assessment floor `.min(6)` (`conceptJson.ts` @328) — seven items authored. `depth_ring` is a real schema field (`conceptJson.ts` @105, proxy-verified).

### ⚠ WATCHPOINT (a) — "undefined at h = 0". **VERDICT SUSTAINED at Checkpoint A; constraint narrowed this round.**
Mechanisms unchanged: (1) timed gates on ladder rows (h is clock-pure in guided states); (2) the engine's own vanish at exact choreographed 0 (**measured: `hz`·10^`hlog` = 0 exactly at 13 500 ms → `valid:false`**); (3) the interpolate-ternary string fallback (probed, held in reserve). **The binding constraint is now:** *no `label`/`text_expr` may render the CHORD slope* — that alone preserves the h = 0 safety (`x₀ + h/2` → `1.0000` at h = 0). The TANGENT slope (`x₀`, defined at every h) MAY be a placed label — this is what un-strands S5 (P1-2).
**P1-4 correction (was FALSE):** the vanish is **choreography-only**. A teacher CANNOT reach it: guard 1e-12 (@3704) vs drag quantum = 1/scaleX = **1/80 = 0.0125 data units** (`PM_planeResolveInverse` @2110 does no snapping) — ten orders of magnitude apart. The finest parked chord reads `slope = 1.0063` (measured). The explore payoff is claimed as what a teacher CAN do: *however close Q parks, a chord still exists and its number is still not 1.0000* — M3's lesson by hand. Narration duty logged for `mathematics_author`: never say the teacher can make the chord vanish.

### ⚠ WATCHPOINT (b) — secant↔tangent handover. **VERDICT SUSTAINED; readout collision FIXED; ASSUMPTION flag CLOSED.**
Lines: co-presence + gates + `focal_sequence` + authored dim hue — unchanged, all read. **Readouts (the P1-2 fix):** the tangent primitive authors NO `readout` in S5/S6/S9 (optional — `PM_secantTangentReadout` returns '' without it, @3684); its number is a placed `label` in the instrument column. The chord keeps its primitive-owned on-chord readout (the only legal home for the chord slope under the narrowed constraint). Every pin's readout positions are computed in §11 — minimum separation 18.5 px (measured). **Flag closed:** at the S5 pin Δslope = 0.0020235; max chord–tangent separation anywhere in frame = 0.0020235 × 3.4 = 0.00688 data units = **0.55 px at 80 px/unit** (measured this session on the NEW plane) — under one pixel with 2 px strokes, everywhere; the lines read as one line while the numbers stay distinct. No first-pixel dependency remains.

### ⚠ WATCHPOINT (c) — ledger item 7 (`angle_arc` has no `plane_id`). **VERDICT SUSTAINED; reason RESTATED (proxy: right decision, wrong reason).**
`drawAngleArc` @4026–4151: zero plane references (read). **The reason no state draws a slope angle is PEDAGOGY:** every claimed syllabus teaches first principles as rise ÷ run and a number; θ = arctan(m) is notation Rule 41c does not need and no exam trace requires. (Round 0 argued it from the plane distortion — an accommodation to a problem P1-1 has now removed: on the equal-scale plane an arc WOULD measure truly. We still don't draw it, for the pedagogical reason.) Ledger item 7 untouched.

### ⚠ WATCHPOINT (d) — h control. **VERDICT SUSTAINED at Checkpoint A verbatim** ("dispatch premise correctly refuted; do not buy a caption-precision field"). Guided h/hlog: choreography-only. Explore h: the Q point (drag quantum note above). `u` never seizable. Slider caption trap @4580 (`toFixed(step < 1 ? 1 : 0)`) re-cited at the proxy's corrected line.

---

## 1. Atomic claim

This concept teaches that **the slope of a curve at a single point is defined as the limit of chord slopes — the one number the slope of a two-point chord approaches as the second point slides onto the first, which the chord itself can never show at h = 0 because two coincident points make no line.** It does not cover differentiation rules, limits in their own right, continuity/differentiability edge cases, or graph transformations (P1 #1). The one bridge it builds is S8: **each point's slope, collected, is itself a new function.**

## 2. State count + arc — 9 states (complex, justified)

**Count justification (Rule 11)** — unchanged from round 0 and unchallenged: apparatus, average rate, the shrink, the h = 0 void, the tangent as limit, point-dependence, the algebra, the derivative-as-function, explore; the exam test traces each (Block 1). S3 ("the number settles") and S4 ("it can never arrive, and here is why") stay separate — collapsing them is how "approaching = reaching" survives.

| # | Title (Rule 41d — first words carry) | Purpose | teaching_method | ring |
|---|---|---|---|---|
| S1 | The Curve and One Point | Apparatus + the question: the curve, P, its coordinates — what number should "steepness at P" be? | *(straightforward)* | core |
| S2 | A Chord Through Two Points | Slope needs two points: rise ÷ run over the gap h; average rate | *(straightforward)* | core |
| S3 | The Second Point Slides Closer | **PRIMARY AHA** — h shrinks, the slope readout settles on one number | *(straightforward)* | core |
| S4 | At h = 0 There Is No Chord | The void, framed by the ladder the chord left behind; 0/0; the limit named | *(straightforward)* | core |
| S5 | The Tangent: One Line Remains | The tangent as the limiting line: picture merges, numbers stay distinct | *(straightforward)* | core |
| S6 | A Different Point, a Different Slope | The derivative is AT a point: drag P, the tangent and its number follow | *(straightforward)* | core |
| S7 | The Algebra Behind the Number | Derivation: slope = x₀ + h/2, cancel h, shrink it; write lim, name f′ | derivation_first_principles | advanced |
| S8 | Every Slope Collected: a New Function | f′ traced as u sweeps — the slopes lie on the line y = x | derivation_first_principles | advanced |
| S9 | Explore: Drag Both Points | Teacher sandbox — P and Q draggable, chord + tangent + readouts live | exploration_sliders | core |

Hook moves from t = 0. Advanced ring {S7, S8} contiguous before explore ✓. Extended ring EMPTY, deliberately (§10i — and it now has named customers for its cut, P2-7).

## 3. Per-state choreography + control plan (Rule 31 — the control table, FIRST artifact)

**The function (hazard 7): `f(x) = x²/2`, P at x₀ (default 1).** Closed forms (proxy-verified algebraically): `m(x₀,h) = x₀ + h/2` exact · `m − tangent = h/2` exact · `f′(x) = x`.
Canvas values (measured): `m(1) = 1.5000 · m(0.5) = 1.2500 · m(0.1) = 1.0500 · m(0.01) = 1.0050 · m(0.001) = 1.0005` · tangent `1.0000`.

**PRECISION DOCTRINE (per-primitive, per-state — P3-11 decided):** the CHORD slope is **4 dp in every state** (the limit digits are its job). The TANGENT slope is **4 dp in S5** (the comparison state — `1.0020` vs `1.0000` must match precision) and **2 dp in S6/S9** (an at-a-glance instrument during a sweep, Rule 33d; `slope at P = 0.75`). h: 3 dp. Coordinates: 2 dp. Checked at every pinned instant by the proxy ("the doctrine holds at every asserted instant"); the one crossing window (S4's `1.0000`-while-valid) is now **10 ms — sub-frame** (measured, §12).

**The h-law:** guided shrink states choreograph `hlog` (equal decades); S4 adds the 100 ms `hz` collapse (h_eff = hz·10^hlog) so the endpoint is EXACTLY 0 — one choreography entry per variable, two variables (scar `pm_applychoreography…last_entry` clear). Neither is ever a slider or drag-bound. **The φ-law:** the only trace runs on dedicated `u`, never seizable (both Gate 9(d) doors pass).

| St | Teaches (one idea) | Archetype | Distinct motion | Delta cue (≤5 words) | Live controls | Words | Ring | The real NUMBER |
|---|---|---|---|---|---|---|---|---|
| S1 | The apparatus and the question: this curve, one point P on it, the coordinates that name it — what single number could mean "steepness right HERE"? *(P2-9: restated to what the canvas shows — the question, not an unrendered answer)* | `trace-locus` | Curve draws left→right (`xdraw` −2.1→2.1); P slides along it (x₀ −1.2→1) and stops; its coordinate readout runs live | The curve, one point | none | 28–36 (anchor inside) | core | P readout `(1.00, 0.50)` |
| S2 | Slope needs two points: rise ÷ run across the gap h — the average rate over the gap | `decompose` | Q appears at h = 1; dashed run draws, then rise, then the **chord (secant line)** snaps through both with its readout; `focal_sequence` P→Q→run→rise→chord (P2-8) | Two points make a chord | none | 32–39 | core | `run = h = 1.000`, `rise = 1.500`, `slope (gradient) = 1.5000` — and the TRIANGLE now shows it: 120 px over 80 px (P1-1, measured) |
| S3 | **PRIMARY AHA** — as the gap shrinks the slope readout stops wandering and settles on ONE number | `limit-approach` | Opening dwell at h = 1 (the M1 wrong-half); `hlog` 0→−2, holds at h = 0.5 / 0.1; chord rotates, readout counts 1.5000→1.0050 | The gap shrinks | none | 40–47 | core | pin: `h = 0.065`, `slope = 1.0325`; dwells `1.2500`, `1.0500` |
| S4 | At h = 0 the chord does not exist — 0/0 is not a number; the limit names what the values were heading for. **The residue is the LADDER (P1-3):** each value-row appears as the chord passes it and SURVIVES the vanish | `null-result-hold` | `hlog` −0.398→−3 over 3000–13000 (ladder rows fire at the measured crossings 3000/5314/9157/13000); `hz` 1→0 over 13400–13500 → chord + readout vanish at **13 500 exactly**; row 5 `h = 0 → 0⁄0 — no chord` @14 300; row 6 `slopes → 1.0000 — the limit` @17 500; `focal_sequence` sec→row5→row6 (whole frame dims for the 13 500–14 300 void beat, deliberately) | h = 0: no chord | none | 38–45 | core | the LADDER: `1.2000 / 1.0500 / 1.0050 / 1.0005 / 0⁄0 / → 1.0000`; `h = 0.000` |
| S5 | The tangent is the one line the chords settle onto — the picture merges, the numbers never do | `limit-approach` — declared companion of S3 (flip: S3 converges a NUMBER, S5 converges the PICTURE onto a drawn line) | Tangent (dim hue) appears at P first; chord fades back at h = 0.4 and sweeps onto it (`hlog` −0.398→−3); `focal_sequence` P→tan→sec→tan (P2-8) | One line remains | none | 35–40 | core | chord `1.0020` (on-chord, 4 dp) vs **tangent `1.0000` as a placed column label (P1-2)** — 0.55 px between the lines, ≥150 px between the numbers |
| S6 | The slope belongs to the POINT: move P and the number moves | `parameter-sweep` | Chord retired (fade-out); x₀ sweeps −1.4→1.4, tangent rides P through down-tilt → flat → up-tilt (**±54.5° visually on the equal-scale plane — the "repertoire of tilts" P1-1 restored**); a genuine P-drag seizes | Each point, its own slope | **draggable P** (x₀ ∈ [−1.6, 1.6]) | 26–32 | core | column label `slope at P = 0.75` (2 dp) at pin; `0.00` at the valley floor |
| S7 | The algebra says WHY: slope = x₀ + h/2, and only the limit removes the h | reveal-build | Chord restored (h = 0.8, x₀ = 1, declared entry); four ladder lines reveal 3000/8000/13000/18000; `focal_sequence` rides the lines | Cancel h, then shrink it | none | 40–46 | advanced | surface `slope = x₀ + h/2` vs chord `1.4000` — **verifiable on screen: column chips `x₀ = 1.00`, `h = 0.800` (P3-12)** |
| S8 | Collected, the slopes are a new function — for this curve they lie on a straight line | `accumulate` | u sweeps −1.6→1.6: marker rides f with a short tangent segment; a second point at height u traces f′; @17 000 the ghost line `f′(x) = x` reveals **with `x_domain [−1.6, 1.6]` matching the trace (P3-14)** | Slopes drawn as heights | none (φ-law) | 38–44 | advanced | head `(1.12, 1.12)`; end: the trace lies on `f′(x) = x` |
| S9 | Teacher sandbox | `drag-sandbox` | `xq` ping_pongs 1.9↔1.1 (8 s/leg, measured) until seized; P also draggable; **Q authored BEFORE P in scene_composition so Q wins the press claim near P (P3-13; @5265 + @3159, hit radius ≈ 20 px)**. **True payoff (P1-4): park Q as close as the pixels allow — |h| ≥ 0.0125, chord still there, `slope = 1.0063`, never `1.0000`** — M3 by the teacher's own hand | Drag both points | **ALL: draggable Q (xq ∈ [−1.9, 2.0]) · draggable P (x₀ ∈ [−1.6, 1.6])** | 0 / open | core | chord slope (4 dp, on-chord), column `slope at P` (2 dp), `h = xq − x₀` (3 dp) |

**Rule 32 plan.** ONE home frame all 9 states (§11); never pans/zooms/rescales. Cause-first by reveal order or single-driver lag. ONE glow focal at any instant, now reveal-tracking via `focal_sequence` where reveals exist (P2-8): S1 curve→P · S2 P→Q→run→rise→chord · S3 chord (static, present from entry) · S4 sec→row5→row6 · S5 P→tan→sec→tan · S6 tangent (static) · S7 the ladder lines · S8 the trace-head point (present from t 0) · S9 none. Declared pose resets: S5 opens on S4's void (tangent reveal is the one new thing); S7 restores the chord (declared entry).

**advance_mode (Gate 12):** S1–S8 `manual_click`, S9 `interaction_complete` ✓ 2 modes. No `wait_for_answer`.

**Control decision** — unchanged (S3/S4/S5 watch beats, argued; S6 P-drag; S9 both points, no sliders anywhere).

## 4. Misconception confrontation plan (Rule 16a — 3 genuine pivots)

`misconception_watch` on exactly S3, S4, S5.

| # | Wrong belief | State | Contrast beat (consequence first, then the mathematics — sequential) |
|---|---|---|---|
| M1 | "Average rate and the rate at a point are the same thing" | S3 | Opening dwell: the h = 1 chord reads `1.5000` — if average were the answer, the number would be done. Then Q slides and the number MOVES; only the settling value belongs to the point. `one_line_fix`: "A chord's slope is an average over its gap; the point's slope is the number those averages settle on." |
| M2 | "At h = 0 it's 0/0, so the slope at a point is meaningless" | S4 | Consequence performed by the engine: Q lands on P and the chord + readout vanish (@3704). **The mathematics stays on canvas as VALUES, not prose (P1-3):** the ladder rows `1.2000 / 1.0500 / 1.0050 / 1.0005`, then row 5 `h = 0 → 0⁄0 — no chord`, then row 6 `slopes → 1.0000 — the limit`. The two round-0 sentences move to NARRATION verbatim. `one_line_fix`: "h = 0 is excluded; the derivative is the number the slopes approach, not the slope you compute there." |
| M3 | "The chord eventually BECOMES the tangent — h reaches 0" | S5 | Picture seems to confirm (lines within 0.55 px, measured); the numbers refuse: `1.0020` vs `1.0000`, distinct at every rendered instant down to the floor. Reinforced by the teacher's own hand in S9 (the P1-4 true payoff). `one_line_fix`: "The chord approaches the tangent; only the limit IS the tangent." |
| — | Cue check: no cue states a wrong belief as fact. S2 pre-loads M1. S4's frozen frame ≠ S1's frame (the ladder — scar `state_whose_payoff_is_absence…` discharged). | | |

## 5. `has_prebuilt_deep_dive` states

**S3, S4, S5** (unchanged; cache-hint only; Rule 18).

## 6. Drill-down clusters — unchanged from round 0 (S3/S4/S5 × 3; json_author seeds 5 trigger_examples each).

## 7. `entry_state_map`

```
entry_state_map:
  foundational:        STATE_1 → STATE_5   # core — contains the PRIMARY aha (S3)
  point_variation:     STATE_6             # core
  derivative_function: STATE_7 → STATE_8   # ADVANCED — falls back to foundational under both cuts
  exploration:         STATE_9             # core
```

## 8. Prerequisites (advisory only — Rule 23) — GHOST RECONCILIATION

`prerequisites: []` in the authored JSON. **The catalog ghost (`mathematicsCatalog.ts:94`) carries `prerequisites: ['graph_transformations']` — I judge the ghost WRONG and recommend the edge be dropped when the row goes live:** nothing in this concept uses shifts/stretches/reflections; the genuine background is reading y = f(x) off a graph and straight-line slope, neither of which is what `graph_transformations` teaches. Rule 23 makes this advisory either way (soft suggestion, never a gate), so the stakes are a misleading "Builds on…" pill, not a block — but the pill would be misleading. Flagged for the founder/orchestrator in the FLAGS section; the catalog edit is NOT this desk's to make.

## 9. Real-world anchor (Rules 35 / 38f — universal)

**The speedometer.** Assigned to **S1**, inside its 28–36-word budget, verbatim:

> **"A car's speedometer shows your speed at this instant — one moment, not an average over the whole trip."** *(18 words.)*

No secondary anchor; the anchor is a sentence and is never drawn (axes stay x/y).

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) Every state by id:** as §2, with S4 = ladder + void, S5 = merge-vs-refuse, S9 = the reachable-closeness payoff.

**(b) Symbol-label table + term-introduction ledger** (defining state precedes every use):

| Quantity | On-canvas label | Primitive | Defined in | Used in |
|---|---|---|---|---|
| the curve | `y = x²/2` (curve-end) | `label` + `plane_id` | S1 | S1–S9 |
| the point | `P` + `(1.00, 0.50)` | `plot_point.readout` (offset {12, 20}) | S1 | S1–S9 |
| the second point | `Q` | `plot_point` (offset {12, −30}) | S2 | S2–S5, S9 |
| the gap | `h` (labels the run) + column chip `h = 1.000` | `label` | S2 | S2–S5, S7, S9 |
| rise / run | `rise = 1.500` / `run = h = 1.000` | `label` per segment | S2 | S2 |
| **the chord (dual-label, 38d — P2-6)** | `chord (secant line)` once in S2, bare "chord" after | `label` | S2 | S2–S5, S9 |
| slope (dual-label, 38d) | `slope (gradient) = 1.5000` → bare | **`secant_line.readout` ONLY (chord slope: 4 dp, primitive-owned, on-chord)** | S2 | S2–S5, S7, S9 |
| **the tangent + its number (P1-2)** | `tangent`; column label `tangent slope = 1.0000` (S5, 4 dp) / `slope at P = 0.75` (S6/S9, 2 dp) — a `label.text_expr` over `x0` (LEGAL under the narrowed constraint) | `label` | S5 | S5, S6, S8, S9 |
| **the S4 ladder (P1-3)** | rows `h = 0.4 → slope 1.2000` … `h = 0 → 0⁄0 — no chord` · `slopes → 1.0000 — the limit` | `label` per row, gate-timed at measured crossings | S4 | S4 |
| **x₀ and h as chips (P3-12)** | `x₀ = 1.00`, `h = 0.800` | column `label`s | S7 | S7 |
| `lim`, `h → 0` (38c ladder) | S7's surface only | formula surface | **S7 (advanced)** | S7, S8 |
| `f′(x)` | `f′(x₀) = x₀` chip; `f′(x) = x` curve-end | formula surface / `label` | **S7 (advanced)** | S7, S8 |

**Ladder semantics declared (one-quantity-one-readout):** the live chord slope has exactly ONE live readout (the primitive's own). Ladder rows are frozen RECORDS of values already rendered — each row's number equals the readout at the row's measured reveal instant, then the readout moves on. No second live implementation of slope exists anywhere (computePhysics derived = ∅).

**(c) Sign/direction plan** — unchanged; drawn intervals: `x_domain [−2.1, 2.1]`, x₀ ∈ [−1.6, 1.6], xq ∈ [−1.9, 2.0], h choreographed 1→0.001 (+ exact 0 in S4 only). **Interval honesty (P3-15):** assessment items 1 (x = 3) and 7 (f = 3x) are DELIBERATE off-window/off-function transfer — the window is right; do not "fix" the range to cover them.

**(d) Motion plan:** §3 + §12; S1–S8 one-shot-hold, S9 ping_pong-until-seized (Rule 37).

**(e) Modes:** conceptual only (Rule 20 [D]).

**(f) `assessment` + `coverage_map` + registry.** **SEVEN items** vs floor `.min(6)`:

| # | Item | State | Distractor |
|---|---|---|---|
| 1 | Average rate of f = x²/2 between x = 1 and x = 3 → **2.0** | S2 | 1.0 ("the slope at x = 1" — M1) |
| 2 | As h shrinks, the chord slope at x = 1 … → **approaches 1, never equals it at any h > 0** | S3 | "reaches 1 when h gets small enough" |
| 3 | Putting h = 0 straight into (f(1+h) − f(1))/h gives → **0/0 — undefined** | S4 | "0" — M2 |
| 4 | The tangent at P is → **the line whose slope is the limit of the chord slopes** | S5 | "the line through two very close points" — M3 |
| 5 | For f = x²/2, the slope at x = −1 → **−1** | S6 | "+1" |
| 6 | f′(x) for f = x²/2 → **x** | S7/S8 | "x²" |
| **7 (transfer — P2-10)** | For **f(x) = 3x**, the chord slope between x = 1 and x = 1 + h is → **3, for every h — the settling is instant** | S3 (method + M1) | "it depends on h, as it did for the parabola" |

`coverage_map.by_state`: 1→S2, 2→S3, 3→S4, 4→S5, 5→S6, 6→S7+S8, 7→S3; `non_assessed_states: [STATE_1, STATE_9]`. Ring tags: 1–5, 7 core; 6 advanced. json_author deliverables: drill-down migration; `computePhysics_derivative_as_secant_limit` + ENGINES twin (passthrough, derived = ∅ — **no slope computed outside the two line primitives**); no-literal-`{` sweep.

**(g) Register-triangle plan (Rule 33):** decimals per §3's doctrine (per-primitive per-state, P3-11 decided and stated); every state exposes a changing real number; graphical leads every core state; symbolic leads only S7/S8 (earned).

**(h) Canvas budget (Rule 34) — ONE formula surface per state:** S1 `y = x²/2` · S2 `slope = rise ÷ run` · S3 (S2's surface persists, dimmed) · S4 `(f(x₀+h) − f(x₀)) ⁄ h  at h = 0 → 0⁄0` (the ladder is HUD values, not a second surface) · S5 none new (the comparison IS the two numbers) · S6 none (readout only — the premature f′ surface stays deleted) · S7 the four-line ladder ending `f′(x₀) = x₀` (the only `lim`; advanced) · S8 `f′(x) = x` · S9 `slope = rise ÷ run`. **Formula-vs-HUD diff:** S7: `x₀ + h/2` = 1.00 + 0.400 = `1.4000` = the chord readout, now checkable on screen via the P3-12 chips ✓; S2: 1.500/1.000 = `1.5000` ✓ — and the PICTURE now agrees too (P1-1).

**(i) Curriculum-flex block (Rule 38) — cuts by RING ASSIGNMENT; tags corrected by METHOD (P2-7):**
- **(i-1) Cut 1 — hide advanced (S7, S8):** survivors S1–S6, S9; no survivor renders `lim`, `f′`, or `x₀ + h/2`; S9's controls map to S6 (P) and S2–S4 (Q), both core; `derivative_function` falls back to `foundational`. **COHERENT.** **Cut 2 — hide advanced + extended:** extended is EMPTY → Cut 2 ≡ Cut 1, **COHERENT by identity** (stated). Reverse check: payoff S3 and misconception companions S4/S5 all core ✓.
- **(i-2) Explore = CORE only (38b)** ✓ (rise÷run surface; no f′, no lim).
- **(i-3) `curriculum_tags` — by the METHOD taught, not the topic heading:** CBSE/NCERT **full** — `verified: true` under the 38g authoring-time allowance (my own reading of the NCERT Class-11 ch. 13 index, which examines first principles by name — this is NOT a teacher confirmation, stated honestly) · ICSE/ISC full · JEE full · **IB DP AA: SL partial (informal gradient-as-limit only; first principles is HL) / HL full** · AP Calculus AB/BC full · **Cambridge IGCSE 0606: partial (differentiation examined; first principles NOT examined)** · A-level Pure full. All non-CBSE cells `needs_teacher_verification: true`. **The ring split now has named customers: 0606 and AA SL are precisely the `no_advanced`/`core_only` audience** — the machinery P2-7 found audience-less now exists FOR someone.
- **(i-4) Presets:** `full` = S1–S9 · `no_advanced` = `core_only` = hide S7, S8.
- **(i-5) Graph-axis convention (38e):** x horizontal, y vertical, no conflict, no toggle. Dialect (38d): `slope (gradient)` and `chord (secant line)` each dual-labelled once in S2, bare after.

**Registration plan:** `src/data/concepts/mathematics/derivative_as_secant_limit.json` + the EXISTING catalog row at `mathematicsCatalog.ts:94` goes live (no new row — the reservation is the point). The 8 physics sites FORBIDDEN until a mathematics serving path exists.

## 11. On-canvas layout geometry (pixel plan) — RE-DERIVED (P1-1), all numbers measured or computed against named edges

Canvas 760×500. No camera, no zoom.

- **The one home plane — EQUAL SCALE BY CONSTRUCTION:** `viewport {x: 60, y: 78, w: 400, h: 372}` · `x_range [−2.4, 2.6]` (span 5.0) · `y_range [−1.95, 2.70]` (span 4.65) · **k = 400/5.0 = 372/4.65 = 80 px/unit EXACTLY on both axes (probe: `scaleX=80 scaleY=80 equal=true`)** · `equal_scale: true` authored as a belt (inert while the ratio holds; shrink-only if a future edit breaks it — @2079–2087).
  Derived: origin (0,0) → px **(252, 294)**; P(1, 0.5) → **(332, 254)**; Q(2, 2) → **(412, 134)**.
  **What the honest plane buys (measured):** S2's triangle = 120 px rise over 80 px run = **1.500 visually** ✓; slope 1 renders at **45.0°** ✓; S6's sweep spans ±54.5° of true tilt.
  **The round-0 error, corrected on the record:** round 0 rejected equal scale citing "44 px/unit slivers"; the real `PM_planeBuildTransform` figure for the old geometry was min(137.5, 84.545) = **84.545** px/unit (405.8×372 centred rect). The accepted design takes k = 80 — 5 % below that maximum — in exchange for ROUND exact-equal scales and a rect that sits flush-left so the freed 270 px is ONE usable column instead of two dead margins.
- **The instrument column: px x 470–740** (plane ink CANNOT enter: secant/tangent are Liang-Barsky-clipped to the DATA rect (@3644) and function_plot breaks at range exit (@3037) — every plane-resolved mark lies inside viewport x ≤ 460; **ink-free BY CONSTRUCTION, replacing the P2-5 band proof entirely**). Column zones: formula surface (480, 62–86) — clears `#fsTopControls` (y ≈ 10–40) by ≥ 22 px; HUD chips (480, 110–165); S4/S7 ladders (480, 195–350, ~28 px row pitch); S5 comparison label `tangent slope = 1.0000` at (480, 195).
- **Range containment (full control product, measured):** f(±2.1) = 2.205 ≤ 2.70, headroom 0.495 ≥ 5 %·4.65 = 0.233 ✓; trace min −1.6 ≥ −1.95, headroom 0.35 ✓; xq/x₀ ranges inside ✓.
- **Readout separations at pins (P1-2 — computed through the plane transform, probe output §12):**
  - S5 pin: chord readout (342.2, 241.8) — on-chord, primitive-owned; P readout (344.0, 274.0) — **Δy = 32.2 px** ✓; tangent number in column — ~150 px away ✓.
  - S9 worst case (Q parked at the quantum): chord readout y = 241.5, Q readout y = 223.0, P readout y = 274.0 — **separations 18.5 / 32.5 px** ✓ (threshold ≥ 14 vertical). Offsets authored: P `{12, 20}`, Q `{12, −30}`.
  - S6: tangent has NO primitive readout; column label + P readout only — no convergence pair exists.
- **The one remaining on-plane text, proved against the NAMED BINDING EDGE (P2-5 lesson):** the curve-end label `y = x²/2` at data (2.1, 2.52) → px (420, 92.4), label half-height 6 px → bottom edge py ≈ 98.4. The binding edge is the label's BOTTOM vs the highest chord below it: max chord y at x = 2.1 over the full corner product = 1.8·2.1 − 1.6 = 2.18 → py 119.6. **Clearance = 21.2 px above the highest reachable ink** ✓ (tangents lower still). Criterion stated against the edge the ink approaches, per the scar candidate.
- **S2 triangle px:** run (332, 254)→(412, 254); rise (412, 254)→(412, 134); labels perpendicular-offset (vector-label scar FIXED, relied on).
- **Colour plan (Rule 29):** curve cool hue; chord warm; tangent dim violet (brightens only by focal glow); f′ trace + ghost a third hue; ladder rows neutral with row 5/6 in the chord's warm hue. Brightness only, never size.

**Constraint callouts for `mathematics_author`:**
1. Every authored coordinate is DATA except the column/cue fixed positions (screen furniture, no `plane_id`).
2. **No label expression may render the CHORD slope** (narrowed per P1-2 — the tangent's `x₀` IS legal as `label.text_expr`); the chord slope exists on canvas only as `secant_line.readout`.
3. h-law + φ-law + one-choreography-entry-per-variable (§3). h_eff in S4 = `hz*pow(10,hlog)` — declared expression, used identically in `to_expr` and the h chip.
4. No slider anywhere (caption trap @4580).
5. Clock-pure motion; no `Math.random()`.
6. Bare `pow()/abs()`; Unicode in rendered text only; ASCII variable keys (`x0, xq, h, hlog, hz, u, xdraw`).
7. S8 trace: 176 samples ≤ 240 ✓; ghost f′ `x_domain [−1.6, 1.6]` (P3-14).
8. `position_expr` never alongside `animation`/surface attachment.
9. Reader nouns: **"chord (secant line)" once, then "chord"** (P2-6); "gap", "tangent", "slope (gradient)" once.
10. **S9 scene order: Q's plot_point BEFORE P's** (P3-13).
11. Narration duties: never "the chord reaches/becomes the tangent" (M3); never claim the teacher can vanish the chord (P1-4); S1 narrates the QUESTION (P2-9); the two S4 sentences live in narration, not on canvas (P1-3).
12. −0 clamp on the S9 h chip stays authored; note it never fires under drag (quantum 0.0125 > threshold 0.0005) — it guards the choreographed exact-0 path only (P3-17).

## 12. Per-state timing table — sub-beats, drivers, pins, MEASURED column

PASS condition: standard Rule 31 (25–55 words; explore 0); budgets sanity-checked ≤ 2.5 w/s of motion window. Pin = 0.6 × duration unless `eye_capture_ms`; ≥ 167 ms from the nearest boundary on the correct side; after the last asserted reveal.

| St | Dur | Sub-beats (ms) | Driver profile · entry | **Measured (probe)** | Pin → shows | Margin |
|---|---|---|---|---|---|---|
| S1 | 20 s | 0–1500 frame; 1500–8500 curve draws; 10000–16000 P slides; hold | `xdraw` −2.1→2.1 once 1500/7000 · `x0` −1.2→1 once 10000/6000 | `xdraw@8500 = 2.1000` exact · `x0@16000 = 1.0000` exact (proxy-reproduced) | **`eye_capture_ms: 17000`** → full curve, P at (1.00, 0.50) | 1000 |
| S2 | 22 s | Q 2500; run 7000; rise 11000; chord 15000 (+600); focal windows P/Q/run/rise/chord | reveals only; h = 1 static | reveal arithmetic | **`eye_capture_ms: 16500`** → triangle + `1.5000`, picture-ratio 1.5 | 900 |
| S3 | 24 s | 0–1500 M1 dwell; 1500–20500 sweep; hold | `hlog` 0→−2 once 1500/15000, holds {−0.30103, 2000} {−1, 2000} | plateaus **3758/5758** and **11000/13000**; **pin 14400 → h = 0.0651, slope = 1.0325**; end `1.0050` (proxy-reproduced) | 14400 (default) → mid-final-descent | 1400 |
| S4 | 24 s | 0–3000 hold h = 0.4; 3000–13000 `hlog` shrink — **ladder rows at measured crossings 3000 / 5313.8 / 9156.9 / 13000**; 13400–13500 `hz` collapse → **vanish at 13 500 EXACT**; row 5 @14300; row 6 @17500 (+600); hold | `hlog` −0.39794→−3 once 3000/10000 · `hz` 1→0 once 13400/**100** · entry h = 0.4 (declared) | **crossings 5313.8 / 9156.9 / 13000 measured; `h_eff(13500) = 0` exact → `valid=false`; `1.0000`-while-valid window = 10.0 ms (< 1 frame @ 60 Hz)** | **`eye_capture_ms: 19000`** → NO chord, full ladder incl. rows 5–6, `h = 0.000` — M2's correct half, and ≠ S1's frame | 900 |
| S5 | 22 s | tan 1500 (+800); 4000–16000 sweep; focal→tan @14000; hold | `hlog` −0.398→−3 once 4000/12000 | **pin 13200 → h = 0.00405, chord `1.0020` vs tangent `1.0000`**; end `1.0005`; **line separation ≤ 0.55 px everywhere (measured, flag closed)**; readout Δy = 32.2 px (measured) | 13200 (default) → merged lines, refused numbers | 800 |
| S6 | 20 s | fade chord 0–1500; 2000–15000 sweep; drag-seizable | `x0` −1.4→1.4 once 2000/13000 | `x0@12000 = 0.7538` → `0.75`; `@15000 = 1.4000` exact (proxy-reproduced) | 12000 (default) | 3000 |
| S7 | 24 s | chord @1000 (h = 0.8); ladder 3000/8000/13000/18000 (+600) | reveals only | arithmetic | **`eye_capture_ms: 19500`** → full ladder + chips `x₀ = 1.00`, `h = 0.800`, chord `1.4000` | 900 |
| S8 | 24 s | dim f 0–2500; 2500–16500 sweep; ghost @17000 (+600) | `u` −1.6→1.6 once 2500/14000 | `u@14400 = 1.1200`; `@16500 = 1.6000` exact; 176 samples (proxy-reproduced) | **`eye_capture_ms: 18500`** → trace on the revealed line | 900 |
| S9 | open | scene 0–2500; `xq` ping_pong until seized; free-run (Rule 37) | `xq` ping_pong 1.9↔1.1, 2500/8000 · x₀ entry 1.0 | legs measured 8 s (proxy-reproduced); **park quantum 0.0125 → min slope `1.0063` (measured)** | none | n/a |

**Probe output — NEW runs this round (node, functions extracted @994bb8f):**
```
S4 crossings: h=0.1 @5313.8  h=0.01 @9156.9  h=0.001 @13000
S4 t=13000 h_eff=0.00100  t=13400 h_eff=0.00100  t=13499 h_eff=1.0e-5 valid=true
S4 t=13500 h_eff=0 (exact) valid=FALSE ; 1.0000-while-valid window 13490.0–13500.0 = 10.0 ms
scaleX=80 scaleY=80 equal=true ; origin=(252,294) P=(332,254) Q(2,2)=(412,134)
S5 pin: chordReadout=(342.2,241.8) P.readout=(344.0,274.0) dy=32.2
S9 park: quantum=0.0125 → slope 1.0063 ; readout y-seps 18.5 / 32.5
S5 max line separation = 0.00688 data = 0.55 px
S2 run px=80 rise px=120 visual ratio=1.500 ; slope-1 angle 45.0°
f(2.1)=2.205 ≤ 2.70 headroom 0.495 (5% = 0.233)
```
*(Unchanged states S1/S3/S5-timing/S6/S8/S9-timing: round-0 probe values, independently reproduced to the digit by founder_proxy — `derivative_checkpoint_a_cycle1.md` §"The arithmetic".)*

## 13. THE UNION WALK — consumption, both directions

Per-state rows unchanged from round 0 EXCEPT: every state now also consumes **F5** (`equal_scale`, authored as the guard) — F5's Direction-2 claim grows from "#11 only" to "#2 + #11". Consumption: **F1–F8, F10, F11, F12, F13, F14, F17 = 14 of 17**. F9 still genuinely not consumed (containment, §11); F15/F16 remain #3's. Scriptability per knob as §3 (`xdraw`, `x0`, `hlog`, `hz`, `u`, `xq` — every knob cued). Shape check: flat `scene_composition`, no new per-state field (D9).

## 14. Scar compliance — additions this round

Round-0 dispositions stand (independently ratcheted at Checkpoint A: φ-law clear · archetype-tier discharged · pins clear · ping_pong endpoints clear · negative-zero clear · panel_b sentinel · annotation-hazard clear). **New rows this round — the 8 checkpoint scar candidates, treated as binding though not yet in the DB:**
`plane_unequal_axis_scales_render_a_rise_run_triangle…` — DISCHARGED by the equal-scale plane (probe: scaleX = scaleY = 80; triangle ratio 1.500) · `two_primitive_owned_readouts_converge_on_one_anchor_and_overprint` — DISCHARGED (§11 per-pin positions, min 18.5 px; tangent readouts moved to authored labels; the RIDE-ALONG ledger recommendation recorded) · `skeleton_promises_a_teacher_reachable_degenerate_state…` — DISCHARGED (quantum 0.0125 vs guard 1e-12 computed for the NEW plane; vanish declared choreography-only; explore narration re-aimed) · `state_whose_payoff_is_absence_carries_its_lesson_only_in_on_canvas_prose` — DISCHARGED (the ladder residue; frozen-frame diff vs S1 now non-trivial) · `hud_ink_free_proof_compares_against_the_far_edge…` — DISCHARGED (column off-plane by clip-construction; the one on-plane label proved against its BINDING edge, 21.2 px) · `focal_declaration_dims_the_very_element…` — DISCHARGED (focal_sequence tracks reveals in S1/S2/S4/S5/S7; the S4 whole-frame dim during the void beat is deliberate and declared) · `curriculum_tag_claims_full_for_a_board_that_does_not_examine_the_method…` — DISCHARGED (0606 partial, AA SL partial; the cut's customers named) · `id_collision_check_scans_the_concept_directories_but_not_the_registry…` — DISCHARGED (id adopted from the catalog reservation; inbound edges preserved; ghost-prerequisite discrepancy flagged rather than silently inherited).

## Block 1 — Pass-1 strategic checklist

**1. Prerequisite cliff** — straight-line slope; breaks at S2; patch sentence inside S2's budget: *"The chord's slope is rise divided by run — how far the curve climbs between the two points, divided by the gap h."*
**2. Exam-backwards trace** — *"Find f′(1) from first principles for f(x) = x²/2"*: quotient → S2; shrink → S3; h = 0 excluded → S4; limit definition → S5; algebra + lim → S7; general f′ → S8; S6 exercised by item 5; transfer by item 7. No idle state.
**3. Misconception entry mapping** — M1 planted by S2, confronted S3 (and re-probed by item 7); M2 planted by the textbook "put h = 0" shortcut, confronted S4; M3 planted by the phrase "becomes the tangent", confronted S5 and re-delivered by the teacher's own hand in S9 (the P1-4 re-claim). Narration-planting duties logged (§11 callout 11).

## Block 2 — Aha-moment designation

**PRIMARY aha:** *A point has its own slope — you can watch the two-point slopes settle onto it.* **S3** (∈ foundational ✓). **SUPPORTING (1):** *Collected, the slopes are themselves a function.* **S8**. Cohesion: S8 is the primary aha iterated. Wrong-belief setup: S1–S2 build "slope is a two-point thing"; S1–S6 treat slope as one number at one point. Foundational-coverage rule SATISFIED.

## Source check line

*Consulted the NCERT Class-11 Mathematics chapter index (Limits and Derivatives) and the named international specifications (IB DP AA guide — SL/HL split; AP Calculus CED; Cambridge 0606 syllabus — first-principles absence; A-level Pure) for SCOPE only, feeding §10(i-3). NCERT Exemplar for misconception BELIEFS only. No teaching method, example, or figure imported. HC Verma / DC Pandey not consulted (physics-only).*

## Self-review checklist — run (amendment round 1)

- [x] All 17 findings + the id correction applied; none re-litigated except where refuted WITH evidence (see FLAGS); every changed number re-probed, never arithmetic on the old profile (S4 re-choreographed and probed twice — 300 ms hz rejected on its own measured 30 ms `1.0000` window, 100 ms accepted at 10 ms).
- [x] The four watchpoint verdicts re-stated per the checkpoint record; S5 ASSUMPTION flag closed with the new-plane number (0.55 px, measured).
- [x] Equal-scale plane measured (`scaleX=80 scaleY=80 equal=true`); triangle ratio 1.500; 45.0°; containment re-walked; every readout separation computed at its pin; the one on-plane label proved against its binding edge.
- [x] Rule 24/34a: zero prose on canvas — S4's payload is values; sentences in narration.
- [x] Seven assessment items (≥ floor 6), transfer included, ring-tagged, no worked-pair reuse; interval-honesty notes for items 1/7.
- [x] Tags by method; ring cut has named customers; CBSE verified-status honestly attributed.
- [x] Id = the catalog reservation; ghost-prerequisite discrepancy flagged, not silently adopted; filename renamed.
- [x] Zero TBDs; zero renderer edits; zero STOP-flags.

## FLAGS — round 1 (for founder_proxy cycle 2)

**Refutations / judgment calls made against or beyond the proxy's direction — reviewable:**
1. **P1-1 implemented as a narrow flush-left viewport at k = 80, not the proxy's `equal_scale:true`-on-660-wide (k = 84.545).** Cost: 5 % linear scale. Bought: exact round equal scales (probe `equal=true`), and the 270-px free space lands as ONE usable instrument column instead of two dead ~127-px margins around a centred rect — the column is what dissolves P1-2/P2-5. `equal_scale: true` is still authored, as a belt.
2. **Ghost prerequisite refuted (§8):** `['graph_transformations']` on the catalog row is judged wrong; recommend dropping the edge when the row goes live. Advisory-only stakes (Rule 23); catalog edit not made from this desk.
3. **S4 hz = 100 ms (not in any finding):** chosen over 300 ms on a measured defect the proxy's precision-doctrine note implied — the `1.0000`-while-valid window shrinks 30 ms → 10 ms (sub-frame). Recorded so the number is not "tuned by feel".
4. **(Recorded)** the RIDE-ALONG readout-offset asymmetry → Phase-0 ledger item 8 recommendation; the 8 scar candidates await DB application by the orchestrator (`npm run log:lesson` is not this agent's to run).

*Handoff: returned to **founder_proxy Checkpoint A cycle 2** (final cycle). On `DESIGN_OK` → `mathematics_author`. Buildable at `994bb8f`; no engine dependency; no renderer edit.*
