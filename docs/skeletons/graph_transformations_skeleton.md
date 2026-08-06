# ARCHITECT SKELETON — `graph_transformations` — ROUND 0
## "Graph Transformations — y = a·f(b(x − h)) + k"

> Subject: **mathematics** · chapter 2 (Class 11) · `is_spine: true` *(section number deliberately not carried — the FLAG-5 precedent; the catalog ghost at `src/lib/mathematicsCatalog.ts:88` holds the catalog claim)*
> Pipeline: `architect → mathematics_author → json_author → quality_auditor`
> Renderer: `parametric` (PCPL) — `renderer_pair.panel_a: "parametric"`, **`panel_b: "none"`** (scar `renderer_pair_panel_b_is_required_by_schema…`, OPEN — the documented sentinel). JSON lives ONLY at `src/data/concepts/mathematics/graph_transformations.json`; registered ONLY in `src/lib/mathematicsCatalog.ts`; validation = `npm run validate:mathematics`.
> Ranked-list authority: `MATHEMATICS_DISCUSSIONS.md` §6 **P1 #1** (breadth 7/7, capability 2). Archetype family **A — coordinate plane with a live function**, now **[LIVE]** (CP-A…CP-D merged, PRs #36–#40; verification below).
> Desk: `/Users/karthikyerragadda/Desktop/Viditra/Physics-mind-mathematics-graph-transformations`, branch `feat/mathematics-graph-transformations`, level with origin/master.
> **Master SHA probed against: `994bb8f`.** Every renderer citation below is `symbol @line @994bb8f` in `src/lib/renderers/parametric_renderer.ts` unless another file is named — resolved by symbol against THIS tree this session (the F1 stale-citation lesson applied).

> ## ⚠ WHAT THIS DOCUMENT IS
> **Phase 0d: the FIRST concept desk on the merged `cartesian_plane` engine — and the first time the family's p5 draw code has ever executed in a browser.** It executed twice this session, under a probe, with **zero console/page errors** (§⓿). Success test: **ZERO renderer edits** — met by construction; every state's every visual need maps to a shipped, cited, and (where behavioral) measured mechanism (§ENGINE FIT CHECK). No SPEC rows exist in this skeleton.

---

## Evidence-tier table for §⓿ claims (probe mandate `34c43c4`)

| Tier | Meaning | Used for |
|---|---|---|
| **measured-px** | Reproduced THIS SESSION by the inline Playwright probe (assembleParametricHtml → `page.setContent` → canvas `getImageData` bbox), on this desk @`994bb8f` | frame paint, ghost style, live redraw under sliders AND choreography, plot_point tracking, PARAM_UPDATE scoping |
| **measured-node** | Reproduced THIS SESSION by extracting `PM_choreoBuildSegments`/`PM_choreoSampleSegments`/`PM_choreoValue` verbatim from the renderer and running my exact per-state specs in node | every §12 boundary, hold window, pin value |
| **measured-gate** | `npm run check:cartesian-plane` run THIS SESSION on this desk: **ALL CARTESIAN-PLANE (CP-A + CP-B + CP-C1 + CP-C2 + CP-D) CHECKS PASS**, negative controls firing | transform correctness, D4 break, tick math, range containment machinery |
| **read** | Existence + behavior verified by reading the cited body @`994bb8f` | reveal gate, focal channel, seizure paths, Gate 9(d) |
| **clone** | A shipped surface already exhibits it | formula_box, label/annotation furniture, HUD `{expr}.toFixed` interpolation |

**Zero ASSUMPTION flags remain in this skeleton.** Every behavioral claim below carries one of the tiers above.

---

## Engine bug queue consultation — LIVE SWEEP RUN 2026-08-06

Run from the desk with `--env-file=../Physics-mind/.env.local` (the desk carries no `.env.local` — recorded so the next desk session doesn't re-diagnose it):

- `graph_transformations` (concept-id sweep) → **0 rows** (new id).
- `--pcpl --open` → 10 rows; every PCPL-relevant row dispositioned in §13.
- `--owner alex:architect` → sweep ran; the binding rows for a PCPL/mathematics concept are dispositioned by name in §13. The full 38-row `unit_circle_to_sine_wave` inheritance digest was read row-by-row; every row is dispositioned in §13.
- `--scenario` lane NOT run, with the reason: PCPL has no scenario dispatch (no authored `scenario_type` id set to derive). Coverage boundary enumerated: concept-id + pcpl + owner + the inherited digest.

**Rule 40a:** this concept adds NO engine mechanism — nothing to sweep for. The alarm rule is not tripped: every need lands on a shipped symbol (§ENGINE FIT CHECK).

**Id-collision check** (scar `chemistry_concept_id_collides_with_rostered_physics_id`): `grep -rn graph_transformations src/data/concepts/` → 0 hits; the id exists only as the mathematics catalog ghost. Single-namespace ✓.

---

## ⓿ Mechanism verification — ALL VERIFIED (no SPEC rows)

**The two probes run this session (both inline, no files written):**

*Probe 1 — pixel layer, first-ever browser execution of the family.* Synthetic config: `cartesian_plane` (viewport {70,78,660,372}, x [−6.5,6.5], y [−4,4], number ticks step 1, gridlines) + `function_plot` parent `sin(x)` style `ghost` + `function_plot` transform `a*sin(b*(x-h))+k` solid + `plot_point` at (`PI/2/b + h`, `a + k`) + sliders. Console/page errors: **none** (twice). Measurements, all landing on prediction:

```
transform identity : y px [216,311]   (predicted 217.5–310.5; y=0 axis at px 264, 46.5 px/y-unit)
k=1.5  → transform centroid −70.0 px vertical (predicted −69.75); ghost centroid UNCHANGED
point identity     : c(479.0, 217.0)  (predicted 479.7, 217.5 — data (π/2, 1))
h=2 (slider)       : point cx 581.0   (predicted +101.5 px = 2 × 50.77 px/x-unit)
b=2 (slider)       : point cx 439.5   (predicted 439.9 — data x = π/4)
a=−2               : point cy 350→ data y −2 ✓; crest-row scan confirms period halved at b=2
choreographed h (no slider): cx 483.0 @t≈0.9s / 534.0 @t≈4.9s / 581.0 @end
                     (predicted 483.7 / 534.5 / 581.0 — choreography drives the family at the pixel layer)
grid/tick furniture: 1333 non-background samples inside the viewport (frame genuinely paints)
```

*Probe 2 — choreography boundaries* (§12's measured column; functions extracted verbatim, run in node).

**Mechanism table:**

| Mechanism this design needs | Verified at (@`994bb8f`) | Evidence |
|---|---|---|
| Frame + data↔pixel transform + ticks/grid/axis labels (F1–F4, F6) | `drawCartesianPlane` @2168 · `PM_planeResolve` @2135 · `PM_planeRegistry` @4667 | measured-px + measured-gate |
| `function_plot` sampled over the x-DOMAIN against live vars (F8) | `drawFunctionPlot` @3049 · sampler `PM_functionPlotSample` @3025 (samples clamped [40,480] @3028) · `x_domain.min/max/min_expr/max_expr` @3062–3069 | measured-px |
| **Parent ghost** — `style: 'ghost'` = alpha ×0.35, one field | @3076–3077 | measured-px (ghost bbox present, unchanged under k) |
| Two plots on one frame (F10 — composition, no extra code) | probe 1 scene | measured-px |
| `plot_point` + one-scope readout (F11) | `drawPlotPoint` @3132 · `PM_plotPointResolve` @3120 (x, y and readout from ONE vars snapshot — D8) | measured-px |
| D4 break-on-discontinuity / range exit (F9) | sampler; gate §6/§16 | measured-gate — **UNCONSUMED here** (sin is bounded; declared in §13) |
| Reveal gating incl. **`disappear_at_ms` + `fade_out_ms`** (S3's guess-ghost exit) | `PM_animationGate` @805 (disappear/fade branch @819–833) — consumed by function_plot @3052 | read |
| Focal emphasis on a curve or a point (Rule 29/32e) — **no `glow_focus` primitive anywhere in this design** | `PM_focalEmphasis` @850, consumed by `drawFunctionPlot` @3054 and `drawPlotPoint` @3137 → `focal_primitive_id` may name either directly | read (dodges OPEN scar `pcpl_glow_focus_cannot_resolve_an_expression_driven_vector_or_a_locus_trace`) |
| Variable choreography, holds by VALUE fraction | `PM_choreoBuildSegments` @1158 · `PM_choreoSampleSegments` @1189 · `PM_choreoValue` @1207 · `PM_applyChoreography` @4951 | measured-node + measured-px (the h-ramp drove pixels) |
| **PARAM_UPDATE / slider scoping law** — an update applies ONLY to variables that are live controls of the CURRENT state | listener @5482 filtering through `PM_stateLiveControlVars` @2983 | measured-px (h/b inert without a slider; live with one) — **this is Rule 31c enforced by the engine**: a guided state's un-exposed parameters cannot be moved externally |
| Slider slots / caption follows choreography pre-seizure / seize on genuine drag | `drawCanvasSlider` @4510 · live-pre-seizure read @4544 · caption `toFixed(step<1?1:0)` @4580 · seize @4612 | read (+ scar `pcpl_slider_label_stale_under_choreography` FIXED, relied upon in S2–S5) |
| Gate 9(d) — BOTH seizure doors (slider AND `plot_point.drag.bind_variable`) | `src/scripts/lib/conceptGates.ts` @436, @443 | read |
| `vector` with `plane_id` (S5's width bracket in data coords) | plane branches @2716/@2748 | read |
| Labels / annotations / formula surface | `drawLabel` @1780 (plane branch @1830) · `drawAnnotation` @1864 · `drawFormulaBox` @4202 | read + clone |
| `check:cartesian-plane` | run this session | **ALL PASS**, negative controls firing |

**THE φ LAW: trivially satisfied — this concept authors ZERO `locus_trace` primitives.** No trace exists, so no sweep parameter exists; seizable ∩ trace-identifiers = ∅ vacuously in all 8 states. (The machine gate now covers both seizure doors regardless — @436/@443.)

---

## 1. Atomic claim

This concept teaches that **four numbers reshape any graph in four predictable ways — k slides it vertically, h slides it horizontally, a stretches it vertically, b squeezes it horizontally — and that numbers OUTSIDE the function act on y and read directly while numbers INSIDE act on x and read backwards.** It does not cover the derivative (P1 #2, `derivative_as_limit_of_secant_slope`), trigonometric identities or the origin of the sine shape (`unit_circle_to_sine_wave`, shipped), negative b / reflection in the y-axis (deferred — declared below), or transformations of specific families beyond the one parent drawn (generality is carried by the f-notation on the advanced state, never by a second apparatus).

## 2. Parent-function decision (dispatch-required, argued)

**Parent: f(x) = sin x, for all states. Not switchable in explore.**

- **The degeneracy audit is the decision.** For every power-law parent, horizontal stretch IS a vertical stretch — `(bx)² = b²x²`, `√(bx) = √b·√x`, `|bx| = b|x|` — so the b-state's one motion would be visually indistinguishable from the a-state's, on the concept whose PRIMARY aha is that inside and outside are different. For an exponential parent, `a·eˣ = e^(x+ln a)` — the a-state collapses into the h-state. **sin is the only standard parent whose horizontal actions (period, phase) cannot be produced by any vertical action.** Its ONE coincidence — `−sin x = sin(x−π)` at exactly a = −1 — is disambiguated on-screen by the tracked point P′, whose path in S4 is a vertical straight line (a h-shift would move it horizontally); declared in S4's row.
- Continuity: the fleet's only shipped mathematics concept is `unit_circle_to_sine_wave` — the student who has it knows exactly what this curve IS (advisory prerequisite, §9).
- Payoff: amplitude/period vocabulary feeds physics (waves, AC) — the widest cross-subject overlap (38f).
- **Parent switch in explore: considered and DECLINED.** A blend expression `(1−fsel)·sin(u) + fsel·(…)` is authorable today, but a parabola branch exits the frame across most of the four-slider control product (only D4 breaks would save it — a mostly-off-screen sandbox), and a fifth control on the explore state dilutes the four the concept is named after. Generality is asserted by S7's f-notation surface + narration, not demonstrated on a second apparatus.
- **Negative b: deferred, declared.** The b slider is [0.5, 3]. Reflection in the y-axis is not taught; no caption over-claims (`sin` being odd would render `sin(−bx)` = `−sin(bx)` — the a↔b ambiguity this parent otherwise avoids).

## 3. State count + arc — 8 states (complex, justified)

**Count justification (Rule 11).** Four parameters, each earning ONE state by the one-idea-one-motion rule; plus the apparatus state, the unifying aha state, the quantitative point-mapping state, and explore. Exam test — a student who watches all 8 can answer: the midline of `sin x + 2`; the shift direction of `sin(x − 1.5)`; the amplitude and orientation of `−2 sin x`; the period of `sin 4x`; whether a given change was an inside or outside edit; the image of a point under the full transform (including the divide-before-add order). Each traces to a named state (Block 1). No merge survives scrutiny: merging S4's flip into S2 puts two ideas in one state; merging S6 into S7 buries the qualitative aha under coordinate arithmetic.

| # | Title (Rule 41d) | Purpose | teaching_method | ring |
|---|---|---|---|---|
| S1 | The Parent Curve | The apparatus: frame, y = sin x drawn from its rule, the marked peak P | *(straightforward)* | core |
| S2 | Add k: The Curve Slides Up | Outside addition = vertical slide, direct | *(straightforward)* | core |
| S3 | Subtract h Inside: It Slides Right | Inside subtraction = horizontal slide — **the misconception beat** (x−h moves RIGHT) | *(straightforward)* | core |
| S4 | Multiply by a: Taller, Then Flipped | Outside multiplication = vertical stretch; negative a flips | *(straightforward)* | core |
| S5 | Multiply x by b: Squeezed Narrower | Inside multiplication = horizontal squeeze by 1/b | *(straightforward)* | core |
| S6 | Outside Acts on y, Inside Acts on x | **PRIMARY AHA** — the four moves replayed on one curve; outside direct, inside backwards | *(straightforward)* | core |
| S7 | Where One Point Lands | The mapping (x₀, y₀) → (x₀/b + h, a·y₀ + k), one hop per operation, order shown | derivation_first_principles | advanced |
| S8 | Explore: Four Sliders | Teacher sandbox — a, b, h, k live; core-ring content only | exploration_sliders | core |

The hook MOVES from t = 0 (S1's curve draws itself). Advanced ring = {S7}, contiguous immediately before explore ✓. **Extended ring is EMPTY, declared** — the two Rule-38 cuts therefore coincide (§11i).

## 4. Per-state choreography + control plan (Rule 31 — the control table, FIRST artifact)

**Fixed forms (hazard 7 — never re-derived):** transform `y = a·sin(b(x − h)) + k`; parent `y = sin x`; marked image point **P′ = (π/2/b + h, a + k)** — the image of the parent's peak P = (π/2, 1) under the full transform, at every instant, in every state (variables default a=1, b=1, h=0, k=0, so P′ opens ON P). All coordinates are DATA; **no authored expression contains a pixel literal** (the plane owns the transform — this is what P0 bought).

**Control ranges (containment computed):** a ∈ [−2, 2] step 0.5 · b ∈ [0.5, 3] step 0.5 · h ∈ [−2, 2] step 0.5 · k ∈ [−1.5, 1.5] step 0.5. Extremal drawn value over the FULL cross-product: |a|·1 + |k| = **3.5 ≤ y_range 4.0, headroom 12.5 %** (sin bounded; exact arithmetic — the gate-16 machinery exists and passes regardless). The curve never exits the frame; F9 is never consumed.

**The home pose (Rule 32d):** one frame, x ∈ [−6.5, 6.5], y ∈ [−4, 4], never pans/zooms/rescales. Parent curve always present; from S2 on it is the dim **ghost** and the bright transform copy opens **coincident with it at identity** and moves off. The per-state reset-to-identity at each click IS the return to the recognizable home pose, declared deliberate. **Degenerate-open scar, argued** (`state_opens_on_the_degenerate_value…`): the coincident open is the REFERENCE half of every parameter state's motion — the claim each state teaches is "this parameter moves the copy OFF the parent," which the t=0 frame renders true-by-setup, and no pin lands there (§12). Delta cues claim the motion, never "two curves," at t=0.

| St | Teaches (one idea) | Archetype | Distinct motion (rhythm claim) | Delta cue (≤5 words) | Live controls | Words ≤ | Ring | Register | The real NUMBER (33d) |
|---|---|---|---|---|---|---|---|---|---|
| S1 | A curve is drawn by its rule | `trace-locus` | Frame reveals (0–1000); the parent DRAWS left→right (`x_domain.max_expr` ← `xdraw`, −6.5→6.5 over 1000–13000) with a pen `plot_point` riding the draw edge, live coordinate readout; peak marker P + label appear at 13500. Rhythm: one edge travelling right, once | The curve follows its rule | none | 33 | core | graphical / numeric | pen readout `(x, sin x)` live; then `P = (1.57, 1.00)` |
| S2 | k added outside slides the copy vertically, by exactly k | `parameter-sweep` | Bright copy lifts OFF the ghost: k 0→1.5 (start 1500, dur 12000, hold 2000 ms at 0.75), P′ rises with it. Rhythm: one rigid vertical glide, ghost fixed | k = +1.5: straight up | **k slider** | 38 | core | graphical / numeric | slider caption `k: 0.8` (live, 1 dp) · P′ readout `(1.57, 1.75)` |
| S3 | h subtracted INSIDE slides it toward +x — the backwards one | `cycle-compare` | **Sequential 16a contrast:** a dashed grey GUESS curve (`sin(x + hg)`, hg 0→2 over 1200–4200) slides LEFT under the label "the guess: left" — the wrong belief drawn, first; it fades out (disappear 6500 + fade 800); then the REAL copy slides RIGHT (h 0→2 over 6800–15800), P′ moving with it. Rhythm: wrong half, gap, right half | x − h moves right | **h slider** | 39 | core | graphical / numeric | h caption live · P′ x: 1.57 → 3.57 |
| S4 | a multiplied outside scales every height; negative a flips | `parameter-sweep` — **DECLARED CONTRAST PAIR with S2; the delta names the flip: outside ADD slides, outside MULTIPLY stretches** | a 1→−2 (start 1500, dur 12000, hold 2000 ms at −1): heights shrink, pass through the flat line at a=0 (@5500 ms, pass-through — never dwelt on), flip, grow downward to double. **P′ travels a vertical straight line** — the on-screen disambiguation of a=−1 from a π-shift (parent-choice audit, §2). Rhythm: one continuous vertical breathe-through-zero | a = −2: flipped, doubled | **a slider** | 38 | core | graphical / numeric | a caption live · P′ y: 1 → −2 |
| S5 | b inside squeezes the width by 1/b | `densify/rarefy` *(mathematics-dialect coin, justified: the crests visibly thicken per unit length as b grows — spacing is the picture)* | b 1→3 (start 1500, dur 12000, hold 2500 ms at 2): crests crowd toward each other; a `vector` width-bracket (plane_id, data coords) under one period shrinks with label `width = 2π/b = {…}`; P′ moves horizontally only. Rhythm: continuous horizontal compression, two-stage | b = 2: half the width | **b slider** | 40 | core | graphical / numeric | b caption live · bracket `2π/b = 3.14` at the pin |
| S6 | **PRIMARY AHA** — outside acts on y and reads directly; inside acts on x and reads backwards | `reveal-build` | The full transform BUILDS on one curve, one number at a time, each staying: k 0→1 (2000–5000) · h 0→1 (7000–10000) · a 1→1.5 (12000–15000) · b 1→2 (17000–20000). As each acts, its value chip appears; after the two outside moves the chip "outside — acts on y, reads directly" appears (5500); after the first inside move, "inside — acts on x, reads backwards" (10500). Rhythm: four discrete arrivals building one object | Outside direct, inside backwards | none (timed build; a mid-build drag would decouple the chips from the phase being narrated — Rule 31c watch-beat) | 50 | core | graphical+symbolic co-lead / numeric | chips `k = 1.0 · h = 1.0 · a = 1.5 · b = 2.0` arriving in turn |
| S7 | One point's image, computed one operation at a time — divide by b, THEN add h; multiply by a, THEN add k | `decompose` | Curves dim to ghost; the POINT is the show: P hops through four positions as b (2000–4500), h (6500–9000), a (11000–13500), k (15500–18000) ramp in turn; an arithmetic chip lands after each hop: `x: 1.57 ÷ 2 = 0.79` → `+ 1 = 1.79` → `y: 1 × 1.5 = 1.5` → `+ 1 = 2.5`. Rhythm: one dot, four hops, four numbers — no whole-curve motion carries the state | Divide first, then add | none | 45 | advanced | numeric+symbolic co-lead / graphical | the four chips; final `P′ = (1.79, 2.50)` |
| S8 | Teacher sandbox | `drag-sandbox` | All four sliders; entry motion (Rule 37/A12 — no static explore): k runs `ping_pong` 0 ↔ 1 (start 2500, 4 s/leg) until a genuine drag seizes ANY slider; P′ and both curves live throughout | Four numbers, your hands | **ALL: a · b · h · k** | 0 / open | core | graphical / numeric | slider captions + P′ readout live |

**Rule 32 plan.** Cause-first is REVEAL ORDER throughout: each parameter state reveals its formula surface + the term it is about (0–1200 ms, both drivers held at identity) BEFORE the ramp starts at 1500 — never a stagger between two equated drivers (no equated drivers exist; P′ and the curve read one scope by construction, measured-px). Only the taught variable moves per state (S6/S7's staggered builds move one variable per sub-beat). Exactly ONE focal per state via `focal_primitive_id` (both target draw functions consume the channel, §⓿): S1 the pen point → P · S2–S3 the transform curve · S4 P′ · S5 the transform curve · S6 the transform curve · S7 P′ · S8 none. Apparatus persists; camera fixed; no teleport.

**advance_mode (Rule 15 / Gate 12):** S1–S7 `manual_click`, S8 `interaction_complete` → 2 distinct modes. No `wait_for_answer`.

**Control decision, argued (31c).** S2–S5 each expose exactly the slider they teach — and the engine now ENFORCES the scoping (PARAM_UPDATE applies only current-state live controls, measured-px §⓿). S1 is a watch beat (zero controls — the rule is the star). S6/S7 are timed builds (zero controls, argued in-row). S8 = ALL four. Slider slot discipline: each guided state's single slider sits in slot 0; S8 orders them a, b, h, k (formula order) — recorded for json_author so muscle memory holds within the state set. **P′ drag in S8: considered and DECLINED** — `plot_point.drag` binds the raw data coordinate, but h enters P′ as an offset (x = π/2/b + h), so a grab would snap the point by π/2/b; sliders carry S8.

## 5. Misconception confrontation plan (Rule 16a — 2 genuine pivots)

No EPIC-C branches. `misconception_watch` on exactly S3 and S5; the other six states carry NONE.

| # | Wrong belief (NCERT Exemplar belief-level) | State | Contrast beat (consequence first, then the mathematics — sequential) |
|---|---|---|---|
| M1 | "y = f(x − h) with h > 0 shifts the graph LEFT — minus means left" | S3 | The believed picture is DRAWN first: the dashed grey guess slides left (1200–4200 ms), labelled "the guess: left"; it fades; the real copy slides RIGHT to h = 2 with P′ tracking. `visual_counter`: the guess curve beside the real curve's rightward motion. `one_line_fix`: "x − h asks for a larger x to get the old value — the curve moves right." |
| M2 | "b = 2 stretches the graph wider — bigger number, bigger graph" | S5 | The width bracket under one period visibly SHRINKS as b grows, its label counting `2π/b` down: at b = 2 the bracket reads 3.14 — half the parent's 6.28. `visual_counter`: the shrinking bracket against the fixed ghost period. `one_line_fix`: "b multiplies x before sin acts — the width divides by b." |
| — | Cue check: no cue states a wrong belief as fact. S4's a = −1 ≡ π-shift coincidence is a design note (P′'s vertical path disambiguates), not a manufactured misconception. |

## 6. `has_prebuilt_deep_dive` states (cache hint, NOT a gate — Rule 18)

**S3** (the h-direction — the single most-documented confusion on this topic) · **S5** (the 1/b compression) · **S6** (the inside/outside unification). Same states as the Block-1 cliff/aha investments — no divergence. V1.0 ships zero authored deep-dives; other states' Explain button routes to the feedback form.

## 7. Drill-down clusters (3 per deep-dive state; mathematics_author writes 5 trigger phrasings each; json_author ships the seeding migration — scar `confusion_cluster_registry_unseeded_for_concept`)

- **S3:** `why_minus_h_moves_right` · `inside_shift_direction` · `moving_curve_vs_moving_axes`
- **S5:** `why_b_squeezes` · `period_from_b` · `horizontal_factor_is_one_over_b`
- **S6:** `inside_vs_outside_rule` · `which_number_does_what` · `order_of_transformations`

## 8. `entry_state_map` (ring-tagged, with fallbacks)

```
entry_state_map:
  foundational: STATE_1 → STATE_6   # core — contains the PRIMARY aha (S6)
  shifts:       STATE_2 → STATE_3   # core
  stretches:    STATE_4 → STATE_5   # core
  point_mapping: STATE_7            # ADVANCED — drops under both cuts → falls back to foundational
  exploration:  STATE_8             # core
```

Default aspect = `foundational`. Foundational-coverage rule: SATISFIED — S6 ∈ STATE_1→STATE_6; no exit-pill needed.

## 9. Prerequisites (advisory only — Rule 23)

`prerequisites: ['unit_circle_to_sine_wave']` — advisory, and it is a SHIPPED mathematics concept (the fleet's first cross-reference inside the subject). *(The catalog ghost at `mathematicsCatalog.ts:88` currently says `prerequisites: []` — recommend the founder align it; advisory either way.)* Assumed background beyond it: reading y = f(x) off a graph. Cliff patch: §Block-1.

## 10. Real-world anchor (Rules 35 / 38f — universal)

**Primary and only anchor: a voice recording on a phone screen.** Every phone's recorder draws exactly this waveform; it is culture-neutral, device-universal, and mathematics-true (the drawn trace IS a transformed sinusoid family). It also pays forward without pre-spoiling: S1's sentence names only the SHAPE; S4/S5's narration MAY then say "louder = taller, higher-pitched = narrower" as reinforcement (by then a and b are the current state's own content, so no reveal is spoiled).

**Anchor delivery** (scar `skeleton_anchor_specified_in_section_9_reaches_no_narration_line`): assigned to **S1**, inside its 33-word budget, verbatim:

> **"A voice recording on any phone draws this same wave on the screen."** *(13 words.)*

## 11. Definition of Done (Gate 0 — zero TBDs)

**(a) Every state by id:** S1 parent draws + P · S2 k-slide · S3 h-slide (M1, guess-ghost contrast) · S4 a-stretch/flip · S5 b-squeeze (M2, width bracket) · S6 four-move build / PRIMARY aha · S7 point mapping, operation order · S8 explore.

**(b) Symbol-label table + term-introduction ledger** (the DEFINING state precedes every use, HUD included):

| Quantity | On-canvas label | Primitive | Defined in | Used in |
|---|---|---|---|---|
| the parent | `y = sin x` (curve-end, bare) | `label` | S1 | S1–S8 |
| the marked peak | `P` | `plot_point` + readout | S1 | S1 (as P) |
| the moving copy's peak | `P′` + readout `(x, y)` 2 dp | `plot_point` | S2 | S2–S8 |
| vertical shift | `k` | slider caption (1 dp) + formula term | S2 | S2, S6–S8 |
| horizontal shift | `h` | slider caption + formula term | S3 | S3, S6–S8 |
| the guess curve | `the guess: left` | `label` (gated with its curve — one reveal unit, scar `axis_tick_labels_reveal_before…`) | S3 only | S3 |
| vertical stretch | `a` | slider caption + formula term | S4 | S4, S6–S8 |
| horizontal factor | `b` | slider caption + formula term | S5 | S5, S6–S8 |
| the width | `width = 2π/b = {…}` (2 dp) | `label` on the bracket `vector` (plane_id) | S5 | S5 |
| outside/inside chips | `outside — acts on y, reads directly` / `inside — acts on x, reads backwards` | `label` ×2, colour-coded | S6 | S6 |
| the general form | `f`, `(x₀, y₀)` | S7's formula surface ONLY | S7 | S7 |

Parameters render at 1 dp everywhere (the slider caption IS the value display in slider states — hardcoded `toFixed(step<1?1:0)` @4580 with step 0.5 → 1 dp; **no second readout of the same parameter exists in any state** — hazard 4 by construction). Coordinates render at 2 dp (`plot_point.readout.decimals: 2` — its OWN precision, @3125). All maths in real Unicode (π, ², −, →, ′). Object-anchored text = `label`; `annotation` ONLY for the delta cue.

**(c) Sign-convention plan (mathematics variant; RHR N/A):** x rightward, y upward; the canvas-y inversion lives ONLY in the plane transform, in no authored expression. Drawn intervals declared for the mathematics_author domain ledger: x ∈ [−6.5, 6.5] full-domain in S2–S8, [−6.5, xdraw] in S1; parameters on the §4 ranges; sin defined for all reals — no caption generalises past the frame. Formula-vs-HUD unit diff: all quantities unitless; every surface identity holds on the rendered numbers (S5's bracket 3.14 = 2π/2 at the pin ✓, measured-node).

**(d) Motion plan:** §4 + §12. Terminations declared: S1–S7 **one-shot-hold** (each claims a change; the trace/hop persists — no un-drawing); S8 `ping_pong` free-run until seized (Rule 37). The S4 pass through a = 0 is a pass-through, never a dwell or endpoint. No static state, S8 included.

**(e) Modes:** conceptual only (Rule 20 [D]).

**(f) `assessment` + `coverage_map` + registry — SIX items (schema floor `min(6)` satisfied at design time):**

| # | Item | State | Distractor |
|---|---|---|---|
| 1 | The midline of y = sin x + 2 sits at y = → **2** | S2 | 0 ("adding k changes the height, not the position") |
| 2 | y = sin(x − 1.5) is the sine curve moved → **right 1.5** | S3 | left 1.5 — *M1* |
| 3 | y = −2 sin x: amplitude and orientation → **2, flipped** | S4 | "amplitude −2" |
| 4 | The period of y = sin 4x → **π/2** | S5 | 8π — *M2* (b = 4 is outside every rendered range — no worked pair reused) |
| 5 | A copy of y = f(x) moved 3 right and 1 up → **y = f(x − 3) + 1** | S6 | y = f(x + 3) + 1 |
| 6 | Under y = 2 sin(2(x − 1)) + 1, the peak (π/2, 1) lands at → **(π/4 + 1, 3)** | S7 | (π/2 + 1, 3) — divide-by-b skipped (a = 2, k = 1: numbers no state renders; S7 renders a = 1.5 → 2.5) |

`coverage_map.by_state` maps 1–6 → S2…S7; `non_assessed_states: [STATE_1, STATE_8]`; item 6 ring-tagged `advanced` (hidden with S7). **json_author deliverables:** the drill-down migration (§7) · `computePhysics_graph_transformations` + TS twin registered in `ENGINES` (scar `parametric_computephysics_missing_silent_template_leak`) computing NOTHING the geometry already produces (P′, the bracket and all chips are pure expressions of a, b, h, k — the compute function is the echo-net carrier + the no-literal-`{` duty) · every §12 pin transcribed as `eye_capture_ms` (scar `skeleton_budgeted_frozen_pins_are_never_transcribed…` — the cell is a REQUIREMENT) · zero-clamp on any signed readout below its precision (scar `hud_prints_negative_zero…` — S4's a-caption passes −0.04 during the ramp; clamp before format).

**(g) Register-triangle plan (Rule 33, mathematics form):** per-state lead/support + the real number are §4 columns. The symbolic register never leads a core state — every formula surface appears only after (or as) its motion plays; S7's f-notation is advanced. Every taught variable has a rendered geometric correlate: k → the vertical gap ghost↔copy · h → the horizontal gap + P′'s x · a → P′'s height and the flip · b → the shrinking width bracket · the mapping → four chip'd hops. One quantity, one readout (see (b)).

**(h) Canvas budget (Rule 34) — ONE formula surface per state:**
S1 `y = sin x` · S2 `y = sin x + k` · S3 `y = sin(x − h)` · S4 `y = a·sin x` · S5 `y = sin(bx)` · **S6 `y = a·sin(b(x − h)) + k`** (every symbol defined by S2–S5 — the full form's first appearance IS the aha's surface) · **S7 `(x₀, y₀) → (x₀/b + h, a·y₀ + k)`** (advanced — the only f-notation/general surface) · S8 `y = a·sin(b(x − h)) + k` (derived by surviving core S6 under every preset). Top caption = the ≤5-word delta cue only (`annotation`, top-left (40, 55)); prose in the strip below; formula surface top-right ≈ (500, 62) — clearing the review chrome strip (y 10–40) by ≥22 px, the F16 numbers cloned; treated as a RESERVED RECTANGLE, no other text inside it (scar `formula_surface_footprint_overlaps…`).

**(i) Curriculum-flex block (Rule 38) — cuts by RING ASSIGNMENT alone; no field, no hiding mechanism (scar `skeleton_discharges_a_ring_cut_with_a_field_no_renderer_reads`):**

- **(i-1) BOTH cuts.** Extended ring is EMPTY, so Cut 1 (hide advanced: drop S7) and Cut 2 (hide advanced+extended: drop S7) are the SAME cut, checked once over four checklists: survivors S1–S6, S8 — no survivor's narration/caption/surface references the mapping, x₀/b + h, f-notation, or operation order (S6's chips are qualitative, not the mapping); S8's four controls map to S2/S5/S3/S2… precisely: a→S4, b→S5, h→S3, k→S2, all core ✓; S8's surface is derived by surviving S6 ✓; the `point_mapping` aspect falls back to `foundational` ✓. **COHERENT.**
- **(i-2) Explore = CORE-ring only (38b):** S8's controls, surface and labels are all core-taught ✓.
- **(i-3) `curriculum_tags`** — CLAIMS (38g): CBSE/NCERT **partial, verified at authoring against the Class-11 chapter index** (graphs of functions appear in Relations & Functions; the a·f(b(x−h))+k formalism is exam-practice, not a named NCERT section) · JEE full · ICSE/ISC full · IB DP (AA) full · AP Precalculus full (Unit 1) · Cambridge IGCSE 0606 full · A-level Pure full — **all six non-CBSE rows `needs_teacher_verification: true`.**
- **(i-4) Presets:** `full` = S1–S8 · `no_advanced` = `core_only` = hide S7. Hide, never reorder.
- **(i-5) Graph-axis convention (38e):** x horizontal, y vertical on every board — no conflict, no toggle. Dialect (38d): "parent curve" used bare (plain words, Rule 41); "stretch"/"squeeze" are the literal words every board's mark scheme accepts.

**Registration plan:** `src/data/concepts/mathematics/graph_transformations.json` + the existing catalog ghost flip in `src/lib/mathematicsCatalog.ts` ONLY. The 8 physics registration sites are FORBIDDEN for this id (documented exception to `production_routing_disconnect_pcpl_concepts_set`, precedent `unit_circle_to_sine_wave` / `bohr_model_energy_levels`).

## 12. Per-state timing table — MEASURED (probe output §⓿; pins = 0.60 × dur unless `eye_capture_ms` named; margin ≥ 167 ms)

Words ceiling = ⌊2.5 w/s × motion-window⌋ capped at 55 (standard Rule 31 — the sibling's escalated formula is NOT used, per dispatch).

| St | Dur | Sub-beats (ms) | Driver profile | Motion end | Words ≤ | **Measured (node probe)** | Pin → shows | Margin |
|---|---|---|---|---|---|---|---|---|
| S1 | 16 s | 0–1000 frame; 1000–13000 curve draws; 13500 P + label | `xdraw` −6.5→6.5, once, start 1000, dur 12000 | 13.5 s | 33 | `xdraw@13000 = 6.500` (complete); `@14500 = 6.500` | **`eye_capture_ms: 14500`** → full curve, P marked, readout | 1000 ms after P's reveal |
| S2 | 18 s | 0–1200 surface+term reveal; 1500–15500 lift (hold at 0.75: **7500–9500**) | `k` 0→1.5, once, start 1500, dur 12000, holds [{0.75, 2000}] | 15.5 s | 38 | hold verified 7500/9500 (0.7500 both edges); `k@10800 = 0.9125`; end `@15500 = 1.5000` | 10 800 → copy mid-lift, ghost beneath, k: 0.9 | 1300 ms past hold end |
| S3 (M1) | 20 s | 1200–4200 guess slides left; 6500(+800 fade) guess exits; 6800–15800 real slides right | `hg` 0→2 once start 1200 dur 3000; `h` 0→2 once start 6800 dur 9000 | 15.8 s | 39 | `hg@4200 = 2.000`; `h@6800 = 0.000`, `@12000 = 1.1556`, `@15800 = 2.000` | 12 000 → CORRECT half: real copy at h ≈ 1.16 moving right, guess ABSENT (gone by 7300) | 4700 ms after the correct half begins ✓ (misconception-state pin fully budgeted) |
| S4 | 20 s | 0–1200 surface; 1500–15500 sweep (a = 0 pass-through **@5500**; hold at −1: **9500–11500**) | `a` 1→−2, once, start 1500, dur 12000, holds [{−1, 2000}] | 15.5 s | 38 | zero-cross 5499/5501 → 0.0002/−0.0003; hold −1.000 both edges; `a@12000 = −1.1250`; end −2.000 | 12 000 → flipped half, a: −1.1, P′ below axis | 500 ms past hold end; 6.5 s past the flip |
| S5 (M2) | 20 s | 0–1200 surface; 1500–16000 squeeze (hold at 2: **7500–10000**); bracket live throughout | `b` 1→3, once, start 1500, dur 12000, holds [{2, 2500}] | 16.0 s | 40 | `b@7500 = 2.000`, `@9000 = 2.0000`, `@10000 = 2.000`; end 3.000 | **`eye_capture_ms: 9000`** → b = 2.0 exactly, bracket `2π/b = 3.14` vs ghost 6.28 — the M2 counter-frame | 1500 ms into the hold, 1000 ms before it ends |
| S6 (AHA) | 24 s | k 2000–5000 · outside-chip 5500 · h 7000–10000 · inside-chip 10500 · a 12000–15000 · b 17000–20000 | four `once` ramps (one entry per variable — scar `pm_applychoreography_silently_keeps_only_the_last_entry…` respected by design) | 20.0 s | 50 | `@14400: k=1.000 h=1.000 a=1.400 b=1.000`; all-end `@20000: 1.00/1.00/1.50/2.00` | 14 400 → both chips visible, three moves landed, a mid-ramp | 3900 ms past the inside-chip reveal |
| S7 | 22 s | b 2000–4500 · chip 4700 · h 6500–9000 · chip 9200 · a 11000–13500 · chip 13700 · k 15500–18000 · chip 18200 | four `once` ramps, one per variable | 18.2 s | 45 | `@19500: b=2.00 h=1.00 a=1.50 k=1.00` → P′ = (1.785, 2.50) exact | **`eye_capture_ms: 19500`** → all four chips + final P′ | 1300 ms past the last chip |
| S8 | open | 0–2500 scene settles; k `ping_pong` 0↔1 from 2500 (4 s/leg) until any genuine drag seizes | teacher-owned; Rule 37 free-run | n/a | 0 | cycle verified: `k@2500=0.000 → @6500=1.000 → @10500=0.000` | none (`interaction_complete` skips the pin) | n/a |

*(Probe: the three choreography functions extracted verbatim from `parametric_renderer.ts` @`994bb8f` and run in node against exactly these specs — output reproduced in §⓿. A future retiming re-runs the probe, never the arithmetic. The k=0 endpoint of S8's ping_pong parks the copy on the ghost between drags — deliberate: the sandbox's rest pose is the identity, and S8's cue claims the CONTROLS, not two curves.)*

## 13. Scar compliance — inherited rows, dispositioned

**CRITICAL/OPEN `pcpl_locus_trace_sweep_parameter_exposed_as_a_slider…` (the φ law)** — SATISFIED VACUOUSLY: zero `locus_trace` primitives; the curves are `function_plot` (domain-sampled, D3 — built precisely so THIS concept's four sliders can redraw the curve, measured-px). Gate 9(d) covers both seizure doors (@436/@443) and will pass with an empty intersection · **`archetype_live_tier_unverified_against_renderer`** — SATISFIED: archetype A's [LIVE] claim verified against renderer CODE with file:line AND executed pixels (§⓿), not the pattern doc · **`skeleton_certifies_a_state_buildable_from_a_mode_string_without_a_frame_probe`** — SATISFIED: the frame probe RAN (first browser execution; zero errors; every promised number measured) · **`named_primitive_declared_without_the_surface_that_can_render_it`** — SATISFIED: every mark names its primitive AND surface (guess curve = 2nd `function_plot`; bracket = `vector`+`plane_id`; chips = `label`s; nothing rides a value-only readout) · **`pcpl_glow_focus_cannot_resolve…` (OPEN) + `…renders_a_halo_before_its_target…` (OPEN)** — DODGED: no `glow_focus` anywhere; focal via `focal_primitive_id`, whose channel both target draw functions consume (verified @3054/@3137) · **`formula_surface_states_an_identity_in_a_unit_the_hud_never_renders`** — SATISFIED: unitless throughout; S5's surface/bracket/HUD agree at the pin (measured) · **`frozen_pin_unbudgeted_on_a_sequential_misconception_state…`** — SATISFIED: S3 fully budgeted; pin 4.7 s into the correct half · **`correspondence_state_stages_cause_first_as_a_head_start…`** — SATISFIED: no equated drivers exist; cause-first is reveal order; P′ and curve read one scope (D8, measured-px) · **`skeleton_discharges_a_ring_cut_with_a_field…`** — SATISFIED (§11 i-1, ring assignment only) · **`skeleton_anchor_…_reaches_no_narration_line`** — SATISFIED (§10, verbatim, budgeted) · **`concept_schema_assessment_minimum…`** — SATISFIED (6 ≥ min 6, states covered exactly once) · **`quantitative_check_state_reuses_the_exact_numbers…`** — SATISFIED (items 4/6 use b = 4 and a = 2, k = 1 — never rendered) · **`state_opens_on_the_degenerate_value…` / `ping_pong_endpoint_is_the_degenerate_case…`** — ARGUED (§4 home-pose box; §12 S8 note): the coincident identity is each state's designed reference, cues claim motion, no pin lands there · **`pm_applychoreography_silently_keeps_only_the_last_entry…` (OPEN)** — SATISFIED: one entry per variable per state everywhere (S4's non-monotonic wish redesigned into a single 1→−2 ramp for exactly this reason) · **`pcpl_slider_label_stale_under_choreography` (FIXED)** — RELIED UPON in S2–S5 (caption tracks choreography pre-seizure, @4544); a regression re-opens on this concept · **`hud_prints_negative_zero…`** — routed to json_author (§11f) · **`skeleton_budgeted_frozen_pins_are_never_transcribed…`** — routed with teeth (§11f) · **`formula_surface_footprint…`** — SATISFIED (§11h reserved rectangle) · **`pcpl_vector_label_at_segment_midpoint…` (FIXED)** — S5's bracket is horizontal; perpendicular-offset fix shipped besides · **`pcpl_angle_arc_sweep_beyond_one_full_turn` / angle-arc label rows** — N/A (no angle_arc) · **`pcpl_position_expr_object_literal_string…`** — N/A shape trap recorded for json_author anyway: `plot_point.x_expr/y_expr` are STRINGS (this family's own shape); body `position_expr` not used · **`pcpl_has_no_outline_only_shape_primitive`** — N/A (no outline bodies; ghost style covers the dim-curve need) · **`renderer_pair_panel_b…` (OPEN)** — `"none"` authored (§header) · **`subject_namespace_concepts_are_invisible_to_flat_scanning_tools` (OPEN)** — registration is catalog-only; every tool run this session resolved the namespace via the shared resolver path · **`review_site_private_config_assembler…` (FIXED)** — BINDS FORWARD: everything lives in `scene_composition` + `variable_choreography`; no new per-state field · **`eye_pixel_gates_pass_over_a_body_frozen_at_the_renderer_default…` (OPEN)** — RECORDED for eye_walker: the expected-movers set per state is exactly the §12 driver column (transform curve + P′ every parameter state; pen in S1; point in S7) — walk element-by-element · **`eye_h2_frozen_frames…wobble` / `frozen_frame_read_as_dense_series_continuation` (OPEN)** — RECORDED for the baseline step (five pins land mid-hold/mid-ramp) · **`authoring_side_do_clause_of_an_open_scar_is_not_re_checked…`** — the post-authoring re-sweep of every OPEN row against the FINISHED JSON is a named json_author handoff gate · **`narration_names_a_reference_line_the_scene_never_draws`** — BINDS mathematics_author: every narrated reference (the ghost, the bracket, the chips, "the flat line" in S4 if narrated) must be a drawn primitive in that state · **`teach_visual_must_match_narration`** — BINDS mathematics_author: S3's narration may not say the guess "was reasonable"; it is drawn, named wrong, and removed · `direction_of_resultant…missing_physics_engine` (OPEN) — N/A-by-id but the same class is pre-empted by the `computePhysics` deliverable (§11f) · remaining `--pcpl --open` rows (field3d/circuit/deep-dive families) — N/A by surface.

## Block 1 — Pass-1 strategic checklist

**1. Prerequisite cliff.** The sine shape itself. Breaks at **S1** for a student without `unit_circle_to_sine_wave`. Patch sentence, inside S1's budget: *"This is the sine curve — the height of a circling point, laid out flat."* (14 words; with the 13-word anchor, S1's 33-word budget leaves ~6 words of connective tissue — deliberately spartan, the state's star is the drawing motion.)

**2. Exam-backwards trace** (JEE-Main / board style): *"Sketch y = 3 sin(2x − π/2) + 1; state amplitude, period, phase shift and midline."* Pieces → states: midline k → **S2**; phase direction → **S3**; amplitude + sign → **S4**; period 2π/b → **S5**; recognising 2x − π/2 = 2(x − π/4) — factor b out BEFORE reading h — → **S7** (the divide-first order, and its assessment item 6 distractor is exactly this error). No missing piece; no idle state.

**3. Misconception entry mapping (16a).** M1 is planted by the minus sign itself (every textbook writes f(x − h) and every student reads "minus = left"); confronted at S3 with the belief DRAWN first. M2 is planted by "multiply = bigger"; confronted at S5 by the counting-down bracket. The planting risk inside this concept: S2's "+k slides up" builds the confident direct-reading rule that S3 then breaks — deliberate wrong-belief setup, see Block 2.

## Block 2 — Aha-moment designation

- **PRIMARY aha:** *Outside the function the numbers do what they say to y; inside, they act on x and do the opposite.* State **S6** (∈ foundational ✓).
- **SUPPORTING aha (1):** *b = 2 makes the curve half as wide — the inside number divides.* State **S5** — the sharpest single instance of the primary rule, met one state before it is named.
- **Wrong-belief setup:** S2 and S4 (the outside states) build "numbers do what they say" honestly and correctly; S3 breaks it first (h), S5 confirms the pattern (b), S6 names the law. The student is confident and slightly wrong exactly twice, at S3 and S5, and both are the deep-dive investments.
- **Cohesion:** the supporting aha is an instance of the primary — no stray aha.
- **Foundational-coverage rule:** SATISFIED (S6 inside STATE_1→STATE_6).

## Source check line

*Consulted the NCERT Class-11 Mathematics chapter index (Relations and Functions; Trigonometric Functions) and the named international specifications (IB DP AA guide, AP Precalculus CED, Cambridge 0606 syllabus, A-level Pure specifications) for SCOPE only, feeding §11(i-3). NCERT Exemplar consulted for misconception BELIEFS only (§5). No teaching method, no example problem, no figure imported. HC Verma and DC Pandey not consulted — physics-only, forbidden for mathematics.*

## Refutations / deviations from the dispatch premises (invited, exercised)

1. **The 0a union sketch claimed F9 (break-on-discontinuity) for concept #1** via an implied tan/1-x parent. **Refuted by the parent audit (§2):** sin is the only degeneracy-free standard parent, and it is bounded — F9 is UNCONSUMED here. F9 remains claimed by #2 and gate §6 tests it regardless; recorded so the union's Direction-2 accounting stays honest.
2. **The 0a sketch's S6 "inside-vs-outside order" and S7 "one named point mapped"** are kept but re-weighted: S6 is promoted to the PRIMARY aha (the sketch left the aha implicit) and S7 additionally carries the operation-ORDER lesson the exam trace demands.
3. Nothing else refuted: the concept ordering (#1 first), the isolation contract, and every inherited directive bind as written.

## Self-review checklist — run

- [x] Atomic claim one sentence; deferred scope named with ids. Parent decision argued with a full degeneracy audit; explore-switch considered and declined.
- [x] Control table FIRST; 8 distinct archetypes (one declared contrast pair S2↔S4 with the flip named; one justified dialect coin, `densify/rarefy`); no static state incl. S8; explore-last `interaction_complete` with ALL controls; word budgets ≤ min(55, 2.5 × motion window), all inside 25–55 (S1's 33 argued); ≥2 advance_modes.
- [x] **Probe-don't-grep:** zero ASSUMPTION flags — first-ever pixel execution run twice with zero errors; every behavioral number in §⓿/§12 measured (px, node, or gate) at `@994bb8f`; every citation by symbol @line @SHA.
- [x] Rule 32: cause = reveal order; one variable per beat; delta cues ≤5 words, unique; home pose + coincident-open argued against the degenerate-open scar; one focal per state on channel-verified primitives.
- [x] Rules 33/34/35/41: real number per state; one formula surface per state, Unicode, reserved rectangle, chrome clearance cloned with numbers; anchor universal, verbatim, budgeted; every title/cue/label literal plain English.
- [x] Rule 38: rings assigned (extended EMPTY, declared); both cuts checked (coincide) by ring assignment over narration/surfaces/controls/routing; explore core-only; tags as claims, six rows `needs_teacher_verification`; presets hide-only; axis convention decided.
- [x] Misconception guardrail: exactly 2 watches (S3, S5); 16a sequential contrast with the wrong picture drawn first and pin-budgeted.
- [x] Assessment 6 ≥ schema floor, states covered exactly once, no rendered worked pair reused, items ring-tagged.
- [x] Engine bug queue swept (concept-id, pcpl-open, owner, inherited digest) — every row dispositioned in §13; Rule 40a: no mechanism added; ZERO renderer edits required.
- [x] Blocks 1/2 complete; foundational contains the aha; deep-dive = cliff states.
- [x] Zero TBDs.

**Handoff: ready for Checkpoint A (founder-proxy), then `mathematics_author`.** Build note for the orchestrator: the desk needs `.env.local` (queue queries were run with `--env-file=../Physics-mind/.env.local`).
