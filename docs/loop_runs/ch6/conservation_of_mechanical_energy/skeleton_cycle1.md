# ARCHITECT SKELETON — `conservation_of_mechanical_energy`

> Chapter: Class 11 Ch.6 Work, Energy and Power · renderer: `field_3d` / `newtons_laws_body` + NEW energy layer
> Phase-0 chapter opener (0b spec driver): this skeleton doubles as the energy-layer engine specification.
> Doctrine: Rules 16a · 19 · 25 · 31 · 32 · 33 · 34 · 35 · 38 · 41. Bug-queue directives applied from `docs/FIELD3D_SCENARIO_CHECKLIST.md`.
> Authored 2026-08-01 by `architect` (Fable 5). Bug-queue LIVE query not run in that dispatch (no shell tool) — quality-auditor must run it at Gate 8.

## 1. Atomic claim

This concept teaches ONE idea: when only conservative forces act (gravity, ideal spring), kinetic and potential energy change continuously but their sum K + U stays exactly constant — and only that. It does NOT cover accounting for the energy lost to friction (deferred to `mechanical_energy_loss_with_friction`), the definition of K, U_grav or U_spring (prerequisites #3, #7, #8), the conservative/non-conservative classification itself (#5), or power (#11/#12). State 5 shows only the boundary of the law (with friction the total visibly drops) — the destination of the lost energy is explicitly out of scope here.

## 2. State count + arc — 8 states (7 guided + 1 explore)

Complex concept (§5 table: 7–9) — justified: it is the only chapter concept exercising K, U_grav, U_spring and E_total simultaneously on a moving body, plus the law's validity boundary and its derivation. Fewer states would force two ideas into one beat; more would pad.

| # | id | Ring | Purpose (one line) | teaching_method |
|---|---|---|---|---|
| S1 | `trade` | core | Block slides down a frictionless incline: U_grav bar shrinks, K bar grows — energy converts, it does not appear from nowhere | (straightforward beat) |
| S2 | `total_constant` | core | The two bars merge into one stacked column: its total height never changes during the slide — **PRIMARY aha** | (straightforward beat) |
| S3 | `return_height` | core | Block launched up the slope stops exactly at the marked height where U equals its starting K, and returns — energy is not used up by moving | misconception_confrontation (16a contrast beat) |
| S4 | `spring_joins` | core | On flat ground, block bounces off a spring: K ↔ U_spring trade; the stacked total (now three segments) still stays constant | (straightforward beat) |
| S5 | `friction_boundary` | extended | Turn friction on: the total column now visibly drops each pass — the law holds ONLY for conservative forces | misconception_confrontation (16a contrast beat) |
| S6 | `mass_free_speed` | extended | Two blocks, m and 2m, released from the same height: bars differ, bottom speed readouts identical — v depends on h, not m | (straightforward beat) |
| S7 | `derive` | advanced | Derivation: W_net = ΔK and W_grav = −ΔU combine into K₁ + U₁ = K₂ + U₂, stamped with live numbers at two checkpoints | derivation_first_principles |
| S8 | `explore` | core (explore) | Sandbox: drag the block, change m, θ, μₖ, v₀ — bars live; total flat when μ = 0 | exploration_sliders |

Rule 38a: advanced ring (S7) is one contiguous block immediately before the explore state. Hook MOVES at S1 (release + slide begins ~0.8 s in — no static setup state).

## 3. Per-state choreography + control table (Rule 31 — REQUIRED artifact)

Home pose (Rule 32d): incline at θ = 30° rising to the right, block at the top, dashed **h = 0** reference line along the ground with label, energy-bar panel fixed at screen right. Apparatus persists across all states; S4's flat-ground + spring is reached by ramping θ→0 within the same scene (camera holds), never a teleport-rebuild. Cause-before-effect (32a): in every guided state the block holds home pose ~0.8 s, then moves; bars respond as motion develops — the block is always the visible cause.

| # | Teaches | Archetype | Distinct motion | Delta (≤5-word cue) | Live controls | Ring | Words |
|---|---|---|---|---|---|---|---|
| S1 | Descending converts U_grav into K, continuously | `translate-through` | Block released from rest slides down the frictionless incline; U bar shrinks as K bar grows in mirror; loops via `loop_reset_ms` | "U falls, K rises" | none | core | 40–50 |
| S2 | The sum K + U is constant during the whole motion | `reveal-build` | One-shot cue: the K and U bars slide together and stack into ONE column labelled E; the slide re-runs and the column's total height does not change while its internal split shifts | "Total height stays constant" | none | core | 40–55 |
| S3 | Motion does not use energy up: all K returns as U at the exact predicted height | `cycle-compare` — declared contrast pair with S5 | Block launched up-slope from the bottom with v₀; a dim ghost marker sits BELOW the true marker at the height students expect ("some energy is lost moving"); block passes the ghost and stops exactly at the bright marker where U = initial K, then slides back; loop repeats, same height every cycle | "Same height every time" | none | core | 40–55 |
| S4 | U_spring is the third account in the same constant sum | `oscillate/track` | θ ramps to 0 (flat), block glides into the spring: spring compresses, U_spring segment grows as K shrinks, spring pushes it back; block bounces perpetually; E column now has three segments, total height still flat | "Spring energy joins total" | none | core | 40–55 |
| S5 | Conservation holds ONLY without friction: with μₖ > 0 the total drops | `cycle-compare` — contrast pair of S3 (delta names the flip: friction ON, height lost) | Same up-and-back launch as S3, now with μₖ > 0: block stops below the marker, returns slower, each pass lower; the E column visibly shrinks step by step | "Friction: total drops" | μₖ | extended | 35–50 |
| S6 | Final speed depends on height, not mass: v = √(2gh) | `translate-through` — declared contrast pair with S1 (delta names the flip: two masses, one speed) | TWO blocks (m, 2m) side by side released from the same height; each has a compact bar pair — the heavy block's bars are twice as tall — but the two v readouts stay identical all the way down | "Same speed, any mass" | m₂ (second mass) | extended | 35–50 |
| S7 | K₁ + U₁ = K₂ + U₂ derived from the work-energy theorem | `flow-along-path` | One slow slide past two authored checkpoint flags; passing flag 1 stamps K₁, U₁ live numbers into the formula surface, passing flag 2 stamps K₂, U₂; the two sums display equal | "K₁ + U₁ = K₂ + U₂" | none | advanced | 45–55 |
| S8 | Teacher's sandbox | `drag-sandbox` | Trusted drag on the block; all sliders live; bars and total update continuously; free-runs forever (Rule 37, automatic) | "Change anything" | ALL: m, m₂, θ, μₖ, v₀ (+ drag) | core | 0 / open |

Archetype audit: `translate-through` ×2 (S1/S6, declared pair) · `cycle-compare` ×2 (S3/S5, declared pair) · reveal-build, oscillate/track, flow-along-path, drag-sandbox ×1 each. No static state; no undeclared repeat; drag-sandbox explore-only. Glow focal (32e, exactly one per state): S1 = K bar · S2 = E column · S3 = true height marker · S4 = U_spring segment · S5 = E column · S6 = v readouts group · S7 = formula surface · S8 = none/body.

## 4. Misconception confrontation plan (Rule 16a — 3 genuine pivots, no per-state tic)

| Wrong belief (real, documented) | State | `misconception_watch` beat |
|---|---|---|
| "Moving uses energy up — the block will not get back as high as it started" | S3 | `belief`: energy is consumed by motion · `visual_counter`: ghost marker at the expected lower stop height, block visibly passes it and stops at the true marker, every cycle · `one_line_fix`: with no friction, every joule of K becomes U again — nothing is used up |
| "When the block speeds up, its total energy increases — K is new energy" | S2 | `belief`: speeding up creates energy · `visual_counter`: K segment grows while the E column's total height stays pinned — the growth comes out of U, same column · `one_line_fix`: K grows only by exactly what U loses |
| "Mechanical energy is always conserved" (over-generalization the sim itself could plant) | S5 | `belief`: the total bar is always flat · `visual_counter`: μₖ slider on, total column steps down each pass · `one_line_fix`: the constant-total rule needs conservative forces only; friction breaks it (full accounting: next concept) |

EPIC-C branches: NONE (EPIC-L-first directive 2026-06-10). S1, S4, S6, S7, S8 carry no misconception_watch — straightforward teaching.

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates)

- **S2 `total_constant`** — the PRIMARY aha; historically students accept the trade but not the exactness of the sum ("constant-ish" vs constant). Highest-investment state.
- **S4 `spring_joins`** — three-account bookkeeping is where multi-store problems (block-spring JEE staples) break down.
- **S7 `derive`** — the algebraic bridge from W_net = ΔK to conservation is the classic exam-derivation stumble.

These coincide with the Pass-1 cliff states (see Block 1) — no divergence to document.

## 6. Drill-down clusters (3 candidates each; physics_author fleshes trigger_examples)

- S2: `sum_exactly_constant` (why the total is exact, not approximate) · `where_does_k_come_from` (K sourced from U, not created) · `total_bar_reading` (how to read a stacked energy column)
- S4: `spring_compression_energy` (½kx² at maximum compression, K = 0 instant) · `three_store_bookkeeping` (K + U_grav + U_spring in one sum) · `max_compression_calculation` (setting mgh = ½kx²)
- S7: `work_energy_to_conservation` (the two theorems combined) · `checkpoint_equation_setup` (choosing states 1 and 2) · `reference_level_choice` (h = 0 is a choice; ΔU is what matters)

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational: STATE_1 → STATE_4   # "what is conservation of energy" — contains PRIMARY aha (S2) ✓
  friction:     STATE_5             # "does it hold with friction"
  quantitative: STATE_6             # "find the speed at the bottom / does mass matter"
  derivation:   STATE_7             # "derive / prove conservation"
```

Default aspect `foundational`. Foundational-coverage rule satisfied directly (S2 inside the range — no exit-pill needed). Cross-slice pill after foundational: "With friction?" → STATE_5.

## 8. Prerequisites (advisory — Rule 23)

`kinetic_energy_definition` (#3), `gravitational_potential_energy` (#7), `elastic_potential_energy_spring` (#8), `work_energy_theorem` (#4, needed only for the advanced ring S7). **All four are planned Ch.6 siblings not yet shipped** — this concept is deliberately built first as the Phase-0 engine driver; the prerequisite edges point forward to them. Shipped advisory: `block_on_incline` (incline geometry familiarity). Cliff patches: see Block 1.

## 9. Real-world anchor (Rule 35 universal · Rule 38f widest-overlap · Rule 41 plain)

**Primary — the roller coaster's first drop.** A roller coaster is pulled slowly to its highest point, and from there no motor pushes it again: it is fastest at the bottom of the drop, slows as it climbs the next hill, and speeds up again on the way down — the same total energy, split differently between height and speed at every point. Universal (amusement rides exist worldwide, no brand or place named), age-perfect for Class 11, and physics-true at full depth: every later hill on the track must be lower than the first (friction — the S5 boundary — is exactly why, giving the teacher a clean bridge to concept #10).

**Secondary — a trampoline bounce.** At the top of a bounce: all height energy. At the lowest point: all spring energy in the stretched surface. In between: speed. Universal, and it motivates the three-segment sum of S4.

The source catalog's anchors for this topic (chairlift at a named resort, railway porter) are PRE-Rule-35 India-specific — NOT imported (survey ⚠ section).

## 10. Definition of Done (Gate 0 — no TBDs)

**(a) States:** the 8 states of §2, exactly as tabled in §3.

**(b) Symbol-label table** (every narrated quantity → exact on-canvas label, Unicode — Rule 34c):

| Narrated quantity | On-canvas label |
|---|---|
| kinetic energy | `K` (bar), value `K = 24.5 J` |
| gravitational potential energy | `U` (bar; S4+ segment label `U₉` avoided — use `U` and `Uₛ` to keep two distinct labels) |
| spring potential energy | `Uₛ` |
| total mechanical energy | `E` (stacked column), `E = K + U` header on the column (S2+), `E = K + U + Uₛ` (S4+) |
| height above reference | `h`, reference line label `h = 0` |
| speed | `v = 3.1 m/s` (readout) |
| mass, angle, friction, spring constant, compression | `m`, `θ`, `μₖ`, `k`, `x` (slider rows / formula only) |
| checkpoint states (S7) | flags `①`, `②`; terms `K₁ U₁ K₂ U₂` |

**(c) Direction-rule plan:** N/A — no right-hand rule in this concept (mechanics, scalar energy). The direction content is arrow signage only: velocity arrow on the block (existing engine arrow overlay), weight arrow in S7's checkpoint beat.

**(d) Motion plan:** per §3 — every state's motion named; loops via `loop_reset_ms` (S1, S2, S6), natural physics loops (S3 slope oscillation, S4 spring bounce, S5 decaying passes), one-shot ramp + re-run (S2 merge cue, S4 θ-ramp), free-run sandbox (S8).

**(e) Modes:** conceptual-only (Rule 20 [D] — no `mode_overrides`).

**(f)** `assessment` + `coverage_map` authored by physics_author; `misconception_watch` exactly as §4 (3 entries, S2/S3/S5 only).

**(g) Macro↔micro plan (Rule 33):** N/A-with-rationale — the taught variable (mechanical energy) and its mechanism (macroscopic motion against gravity/spring) live at the SAME level; there is no hidden microscopic mechanism in scope (the microscopic fate of friction-lost energy is deliberately deferred to #10). Rule 33d instruments DO apply: every bar carries a live numeric value; `v` readout is live; S6 shows two tracking `v` readouts.

**(h) Canvas budget (Rule 34):** ONE formula surface per state (Cambria Math): S1 none (bars carry their own labels) · S2 `E = K + U` · S3 `K → U → K` … use literal `½mv² = mgh` at the marker · S4 `E = K + U + Uₛ` · S5 `E decreases` never — formula stays `E = K + U`, the DROP is shown not written · S6 `v = √(2gh)` · S7 the derivation surface (only state with a multi-term build) · S8 `E = K + U + Uₛ` (core form). Caption = the ≤5-word delta cue only; prose in `#capStrip`; HUD value-only; corners reserved per 34d.

**(i) Curriculum-flex block (Rule 38):**
- (i-1) Cut check 1 (hide advanced → S1–S6 + S8): coherent — nothing in S1–S6/S8 references the derivation or checkpoint flags. Cut check 2 (hide advanced + extended → S1–S4 + S8): coherent — S1–S4 never mention friction, mass-independence, or √(2gh); S8's sliders include μₖ but the sandbox is ring-neutral manipulation of core content (bars + total), no hidden-ring formula appears.
- (i-2) Explore state surfaces CORE content only: bars, stacked E column, `E = K + U + Uₛ` — all established by S4. The √(2gh) and derivation surfaces never appear in S8.
- (i-3) `curriculum_tags`: CBSE/NCERT Class 11 Ch.6 (Work, Energy and Power) — **verified** at authoring. IB DP Physics (Topic: work/energy/power), AP Physics 1 (energy), A-Level (AQA/OCR/Edexcel energy modules), JEE Main/Advanced, NEET — all authored as claims with `needs_teacher_verification: true` (38g).
- (i-4) Preset proposal (hide, never reorder): `full` = S1–S8 · `standard` (hide advanced) = S1–S6, S8 · `intro` (hide advanced+extended) = S1–S4, S8.
- (i-5) Graph-axis convention: N/A — this concept ships energy BARS, no graph panel (the U(x) graph group is a later Phase-0 by survey decree). No axis-swap toggle needed.

**(Rule 41 audit of reader-facing strings):** titles — "Potential energy becomes kinetic energy" (S1), "The total energy stays constant" (S2), "The block returns to the same height" (S3), "Spring energy joins the total" (S4), "With friction the total drops" (S5), "Mass does not change the final speed" (S6), "Deriving K₁ + U₁ = K₂ + U₂" (S7), "Explore: change anything" (S8). All literal, front-loaded for rail truncation; no personification anywhere ("energy converts", never "energy wants/flows home/hides").

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

**Prerequisite cliff.** (1) `kinetic_energy_definition` missing → concept breaks at **S1**: patch with one narration sentence "the K bar measures the energy of motion, one half m v squared" while the bar first grows — informative to novices, invisible cost to prepared students. (2) `gravitational_potential_energy` missing → also **S1**: the `h = 0` line + "the U bar measures m g h above this line" clause. (3) `elastic_potential_energy_spring` missing → **S4**: one clause "the compressed spring stores one half k x squared" as Uₛ first grows. (4) `work_energy_theorem` missing → **S7** breaks: S7 opens by restating "net work equals the change in K" in one sentence before combining — and S7 is advanced-ring, so syllabi that would lack #4 typically hide it anyway.

**JEE-backwards trace.** Question: *"A 2 kg block is released from rest at height 5 m on a frictionless ramp and compresses a spring (k = 800 N/m) at the bottom. Find the maximum compression."* Needed knowledge → delivering state: U = mgh at release (S1) · total is conserved down the ramp (S2) · at max compression K = 0 and all energy is in the spring (S4 — the bounce's turning instant shows exactly this) · setting mgh = ½kx² as an equation between two checkpoints (S7; numerically prefigured by S6's √(2gh)). No missing piece. Friction variant of the same question is deliberately out of scope (#10).

**Misconception entry mapping (16a).** Beliefs, planting risk, confrontation: (1) "energy is used up by motion" — confronted S3 (ghost marker beat, §4); nothing earlier plants it, it arrives with the student. (2) "K is created when speeding up" — **S1 itself risks planting this** (K bar grows with no sum shown); flagged at the planting moment by S1's mirror choreography (U shrinks in exact mirror) and killed one click later by S2 — this adjacency is deliberate. (3) "conservation always holds" — **planted by S1–S4's frictionless world**; confronted immediately after, S5. No EPIC-C branches (fallback deferred).

### Block 2 — Aha-moment designation

- **PRIMARY aha (S2):** K and U trade continuously, but their sum never changes — the stacked column's height is pinned while its internal split shifts. The 10-year memory is that flat-topped column.
- **SUPPORTING aha (S3):** the block climbs back to exactly the marked height, every cycle — conservation makes an exact prediction, not an approximate one.
- **Cohesion check:** S3 is the primary aha replayed as a falsifiable prediction (it converts "the sum is constant" from a statement into a test the sim visibly passes) — it serves the primary directly. S6's mass-independence is a consequence beat, deliberately NOT designated an aha (keeps the sweet-spot 1+1).
- **Wrong-belief setup:** for the primary — S1 earns the confident-wrong-belief "K is appearing" by showing growth without the sum (1 state before S2). For the supporting — S1+S2 establish downhill conversion so the student's residual intuition "it won't ALL come back uphill" is live entering S3; the ghost marker gives that intuition a visible, falsified prediction.
- **Foundational-coverage:** S2 ∈ foundational range (S1–S4) ✓.

## ENGINE SPEC NOTES — energy-layer requirements (0c build contract)

Phrased as requirements; each is exercised by this concept unless marked *(union — other concepts)*. General options chosen deliberately per the Phase-0 reuse mandate.

1. **`energy_layer` per-state config block** on `newtons_laws_body`: `bars: subset of ['K','U_grav','U_spring','E_total','E_dissipated']` in a FIXED panel order; panel DOM built once, bars shown/hidden per state (Rule 31/32d — same screen position across states). `E_dissipated` slot reserved in the panel order now *(union — #10)* even though this concept never shows it.
2. **Bars are engine-computed every frame from integrator state** — K = ½mv², U_grav = mgh(above the authored reference), U_spring = ½kx² — never authored per-frame. Because each is derived from (v, s, x) rather than accumulated, the layer is Rule-36 frame-rate independent by construction and byte-stable under `SET_TIME_FREEZE` with zero special-case code.
3. **Common linear joule scale** per state via authored `bar_max_J`; each bar carries a live value-only numeric (`K = 24.5 J`) per Rules 33d/34b. Unicode subscripts (`Uₛ`) — never ASCII.
4. **`E_total` renders as a STACKED column of its component segments** (K on U on Uₛ), so constancy reads as constant column height while the internal split shifts. Numeric total beneath. This is the layer's signature visual — prefer it over a fourth independent bar.
5. **One-shot `sum_merge` cue** (fired via the existing `scenario_cue` channel, never a hardcoded `*_at_ms`): the separate K and U bars slide together and stack into the E column (S2's reveal-build). Holds its end pose (scar rule: no fall-to-zero one-shots).
6. **Authored zero-reference line**: dashed 3D line at h = 0 with label, `depthTest:false` + high renderOrder (scar rule: overlays over busy geometry). U_grav measured from it.
7. **Height marker primitives**: (a) a bright authored marker line at a computed height (engine computes s = v₀²/(2g·sinθ) from state params — computed placement, never hand-guessed pixels); (b) an optional DIM `ghost_marker` at an authored fraction of it (misconception beat, rendered in the dim-peer style — never integrated into physics). *(General: any "predicted stop" beat chapter-wide.)*
8. **Spring contact phase**: while the block overlaps the spring, a = −kx/m (semi-implicit Euler, affine in dt), exact elastic exchange so K + Uₛ is conserved to integrator precision; compression x exposed to the layer. Reuses the existing `nlbSpring*` geometry.
9. **`loop_reset_ms` per state**: deterministic clock-based restart of body kinematics to the state's initial pose (for guided slide states S1/S2/S6). Restart driven off `PM_simTimeMs` modulo, so THE EYE's dense frames stay deterministic; must satisfy the no-frozen-tail scar (motion sustained ≥0.1%/frame or `reveal_hold`).
10. **`W` accumulator** *(union — #1, #2, #4, #5, #11, #12; used here only by S7's narration bridge)*: running ∫F·ds for a NAMED force with sign, accumulated per fixed step as F·Δs (linear in dt), resettable per state, exposable as a readout/bar.
11. **Checkpoint flags with capture-on-pass**: authored positions along the surface; when the body's s crosses one, the current K and U values stamp into the state's formula surface (S7) — captured values HOLD (end-pose rule). *(General: #5's round-trip work test reuses the crossing detector.)*
12. **Per-body bar groups (max 2, compact)**: `energy_layer.body_id` selects the tracked body; S6 instantiates two compact side-by-side groups plus the two live `v` readouts. Default = single group, body A.
13. **Bars/segments/markers are glow-addressable** (`energy_bar_K`, `energy_col_E`, `marker_true`, …) through the existing `applyGlowEmphasis` path — brightness only, never size (Rule 29); exactly one focal (32e). Bar HEIGHT tracking real joules is the sanctioned magnitude exception, same class as arrow length.
14. **`P` readout (F·v instantaneous, W/Δt average)** *(union — #11, #12; not used in this concept)* — build in the same layer pass per the survey's union table.
15. **`deriveStateMeta.ts` co-edit is mandatory**: register energy-layer cue/ramp reveal times and the loop/hold classifications (`sandbox → interactive`), or THE EYE false-fails D7/D1p (the exact `kt` scar). The `#sliders` exclusion chain already handles `nlb`; the energy panel must join the nlb-owned DOM, not the generic panel.
16. **Widget discovery (Rule 39g)**: the energy panel and marker overlays follow the discovery conventions (`.pm_hud` / inline `position:fixed` / `*_row` slider rows) so the ⚙ teacher toggles inherit them with zero curation.

Out of scope confirmed (survey + dispatch): U(x) graph panel, pendulum, vertical loop, walking stride, hanging chain — no state above requires any of them.

## Compliance lines

- **DC Pandey check:** consulted only chapter scope alignment (Work, Energy and Power TOC placement); no teaching method, example problem, or figure imported. NCERT = syllabus backbone only; its Indian-context examples not imported (Rule 35).
- **Engine bug queue:** live query script unavailable in this dispatch (no shell tool) — consulted the canonical distillation `docs/FIELD3D_SCENARIO_CHECKLIST.md`; all architect-class directive rows applied (concrete-before-abstract: S1 two bars before S2 sum; quantity drawn when named: bars/markers grow on their narration beat; don't pre-spoil: √(2gh) gated to S6, derivation to S7; sliders in guided states only where Rule 31 contextual — S5 μₖ, S6 m₂ — full set explore-only per the stricter energy-layer reading is deliberately relaxed to Rule 31's contextual-controls doctrine, which supersedes the older last-state-only line). **FLAG for quality-auditor Gate 8:** run `query_engine_bug_queue.ts conservation_of_mechanical_energy` and `--field3d --open` against this skeleton.

## Self-review checklist — all items verified

Atomic claim one sentence ✓ · 8 states within complex band with justification ✓ · control table complete with archetype/delta/controls/ring/words, no undeclared repeats, no static state ✓ · Rule 32 plan (cause-first, one-variable, delta cues, home pose, single glow) ✓ · Rule 33 declared N/A-with-rationale + live instruments ✓ · Rule 34 budget per state ✓ · Rule 38 rings + both cuts checked + tags + presets + axis N/A ✓ · misconception_watch at 3 pivots only ✓ · deep-dive picks ×3 with clusters ✓ · entry_state_map with foundational containing PRIMARY aha ✓ · prerequisites advisory (forward edges flagged) ✓ · universal anchor ✓ · DoD zero TBDs ✓ · Block 1 + Block 2 complete ✓ · plain-language audit ✓ · ENGINE SPEC NOTES delivered for the surgeon ✓.
