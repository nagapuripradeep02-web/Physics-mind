# ARCHITECT SKELETON — `conservation_of_mechanical_energy` (CYCLE 2)

> Chapter: Class 11 Ch.6 Work, Energy and Power · renderer: `field_3d` / `newtons_laws_body` + NEW energy layer
> Phase-0 chapter opener (0b spec driver): this skeleton doubles as the energy-layer engine specification (0c build contract).
> Doctrine: Rules 16a · 19 · 25 · 31 · 32 · 34 · 35 · 36 · 38 · 41. Cycle 2 of 2 after `founder_proxy_A.md` `DESIGN_FIX` (F1–F16).
> Authored 2026-08-01 by `architect` (Fable 5). Cycle-1 archived at `skeleton_cycle1.md`.

## CYCLE 2 CHANGES (finding → what changed)

| Finding | Change in this revision |
|---|---|
| F1 (+ founder ruling 2026-08-01) | Engine spec now requires GENUINE spring physics: authored `k_N_per_m` + natural length, `F = −kx` inside the semi-implicit Euler integrator (affine in dt), `x` exposed to the layer. Slow-motion look achieved by the choreography spec's own `slow_factor` dt-multiplier applied OVER real physics during contact — never a scripted stroke. Additive build: the legacy scripted `spring_action` path (`newton_third_law`) keeps working and is in the surgeon's regression sample. Unblocks union #8. → spec notes 8, 8a–8d |
| F2 / F8 | Permanent home pose = incline θ=30° + fixed wall + spring at the base. NO θ ramp anywhere; no apparatus teleport at any click. S4 is now a genuine bounded oscillation (U→K→Uₛ→K→U) with all three segments simultaneously live. S8's `Uₛ` term now has a real spring and a real `k` behind it. |
| F3 | Clamp invariant written into the spec (note 17): a velocity zeroed by `nlbBoundsM`'s geometric clamp must NEVER render as an energy change; no energy-layer state may let a body reach the track bound (spring turnaround for S4/S5/S7/S8; `loop_reset_ms` before spring contact for S1/S2/S3/S6). S3's motion plan corrected (loop-relaunch at the authored launch line — the fictitious "natural slope oscillation" is gone). S7's motion plan corrected (perpetual spring-bounded oscillation past two flags — the impossible "one slow slide" is gone). |
| F4 | Note 2's Rule-36 claim restricted to the three DERIVED bars (K, U_grav, U_spring). `E_dissipated` specified in state-function form `E_total(t₀) − K − U_grav − U_spring` (fold-exact for free). `W` accumulator honesty note added (fold-exact only for position-independent F). Full `RESET_TRAJECTORY` coverage specified for every accumulator, latch, one-shot and baseline (note 18). |
| F5 | Union primitives specified: displacement vector `d`, angle arc, off-axis applied force `{N, angle_deg}` (note 19). |
| F6 | Signed `W` rendering specified: mid-scale zero baseline, sign-coloured, signed numeric; E-stack unsigned vs W signed noted (note 10). |
| F7 | S5 moved to `core`. Rings now: core S1–S5+S8 · extended S6 · advanced S7. Both Rule-38 cuts re-run (§10 i-1); `intro` preset = S1–S5+S8, so μₖ in the sandbox is always taught before reached. **Consequential self-catch:** S8's `m₂` slider removed (second body is S6/extended content; 38b forbids it in the core-ring sandbox — mass-independence still explorable via the single-body `m` slider). |
| F9 | S2 delta cue retitled: **"Total never changes"** (the word "height" removed — it collided with the taught variable `h`). |
| F10 | S2 now has one contextual control: **θ** (release height authored as a VERTICAL `h₀`, so changing θ re-routes the slide while `E = mgh₀` — the column top does not move). S4 additionally gets `k` (its taught variable). |
| F11 | `W` accumulators generalized to N concurrent named-force instances (≥2 side-by-side, for #5's gravity-vs-friction closed loop) (note 10). |
| F12 | Energy panel moved to the **LEFT** edge (unoccupied; bars sit beside the incline's high end) with a measure-and-reflow ladder requirement, never fixed CSS (note 1). |
| F13 | Per-state `camera_position` authored for all 8 states (§3 camera row) — side-on framing so the vertical "same height" claim reads directly on screen. |
| F14 | S6's glow focal changed to a MESH-level focal: the second block (2m) body mesh. DOM readouts carry live numbers, never glow. |
| F15 | Live bug-queue query still not runnable in this dispatch (no shell tool). Cycle-1's substitution carried forward; **FLAG stands for quality-auditor Gate 8** to run `query_engine_bug_queue.ts conservation_of_mechanical_energy` and `--field3d --open`. |
| F16 | Note 15 now names all THREE `deriveStateMeta.ts` co-edit sites and requires the frozen pin to land INSIDE a descent segment, provably offset from every `loop_reset_ms` boundary. |

**Kept verbatim per the review:** the 8-state arc and ordering · PRIMARY aha at S2 earned by S1 · S3's ghost marker · the aha split (S6 not promoted) · all physics (stop height, mass-independence, derivation chain) · roller coaster + trampoline anchors · plain-language audit · the stacked-column decision · the reserved `E_dissipated` slot.

---

## 1. Atomic claim

This concept teaches ONE idea: when only conservative forces act (gravity, ideal spring), kinetic and potential energy change continuously but their sum K + U stays exactly constant — and only that. It does NOT cover accounting for the energy lost to friction (deferred to `mechanical_energy_loss_with_friction`), the definition of K, U_grav or U_spring (prerequisites #3, #7, #8), the conservative/non-conservative classification itself (#5), or power (#11/#12). S5 shows only the BOUNDARY of the law (with friction the total visibly drops) — the destination of the lost energy is explicitly out of scope here.

## 2. State count + arc — 8 states (7 guided + 1 explore)

Complex concept (§5 table: 7–9) — justified: the only chapter concept exercising K, U_grav, U_spring and E_total simultaneously on a moving body, plus the law's validity boundary and its derivation. Fewer states would force two ideas into one beat; more would pad.

| # | id | Ring | Purpose (one line) | teaching_method |
|---|---|---|---|---|
| S1 | `trade` | core | Block slides down a frictionless incline: U bar shrinks, K bar grows — energy converts, it does not appear from nowhere | (straightforward beat) |
| S2 | `total_constant` | core | The two bars merge into one stacked column: the column top never moves during the slide, at ANY slope — **PRIMARY aha** | (straightforward beat) |
| S3 | `return_height` | core | Block launched up the slope stops exactly at the marked height where U equals its starting K, and returns — energy is not used up by moving | misconception_confrontation (16a contrast beat) |
| S4 | `spring_joins` | core | The block reaches the spring at the base: K ↔ Uₛ trade; the stacked total (now three segments) still stays constant through the whole bounce cycle | (straightforward beat) |
| S5 | `friction_boundary` | core | Turn friction on: the total column now visibly drops each pass — the law holds ONLY for conservative forces | misconception_confrontation (16a contrast beat) |
| S6 | `mass_free_speed` | extended | Two blocks, m and 2m, released from the same height: bars differ, bottom speed readouts identical — v depends on h, not m | (straightforward beat) |
| S7 | `derive` | advanced | Derivation: W_net = ΔK and W_grav = −ΔU combine into K₁ + U₁ = K₂ + U₂, stamped with live numbers at two checkpoints | derivation_first_principles |
| S8 | `explore` | core (explore) | Sandbox: drag the block, change m, θ, μₖ, v₀, k — bars live; total flat when μₖ = 0 | exploration_sliders |

Rule 38a: rings ordered qualitative → quantitative → derivation; advanced ring (S7) is one contiguous block immediately before the explore state. Hook MOVES at S1 (release + slide begins ~0.8 s in — no static setup state).

## 3. Per-state choreography + control table (Rule 31 — REQUIRED artifact)

**Home pose (Rule 32d — PERMANENT, never rebuilt):** incline at θ = 30° rising to the right, a **fixed wall at the base-left with the spring mounted against it** (coil at natural length, inert until S4), block at its release position on the slope, dashed `h = 0` reference line along the ground with label, **energy-bar panel fixed at the screen LEFT edge** (beside the incline's high end; the right edge already carries three overlay zones — F12). The θ never ramps; the apparatus never teleports; at every click the only visible change IS the state's new thing. Cause-before-effect (32a): in every guided state the block holds pose ~0.8 s, then moves; bars respond as motion develops — the block is always the visible cause.

**Bounding discipline (F3):** the block NEVER reaches a track bound in any state. S1/S2/S3/S6 use `loop_reset_ms` timed to fire before spring contact (the spring stays inert while Uₛ is untaught — Rule 25). S4/S5/S7/S8 are bounded by the spring itself — real physics turns the block around.

| # | Teaches | Archetype | Distinct motion | Delta (≤5-word cue) | Controls | Camera (authored, side-on unless noted) | Ring | Words |
|---|---|---|---|---|---|---|---|---|
| S1 | Descending converts U into K, continuously | `translate-through` | Block released from rest at vertical height h₀ slides down; U bar shrinks as K grows in exact mirror; `loop_reset_ms` restarts the slide just before spring contact | "U falls, K rises" | none | `[0, 2.2, 10]` → incline midpoint (height reads as pure vertical) | core | 40–50 |
| S2 | The sum K + U is constant during the whole motion, at any slope | `reveal-build` | One-shot `sum_merge` cue: the K and U bars slide together and stack into ONE column labelled E; the slide re-runs and the column top stays pinned while the internal split shifts; teacher drags θ — the slide re-routes, the top STILL does not move (E = mgh₀, h₀ fixed vertically) | "Total never changes" | θ | `[0, 2.2, 10]` → incline midpoint | core | 40–55 |
| S3 | Motion does not use energy up: all K returns as U at the exact predicted height | `cycle-compare` — declared contrast pair with S5 | Block launched up-slope with v₀ from an authored launch line (above the spring's free end); a dim ghost marker sits BELOW the true marker at the height students expect; block passes the ghost, stops exactly at the bright marker where U = initial K, slides back; `loop_reset_ms` re-launches it as it re-crosses the launch line — same height every cycle, spring never touched | "Same height every time" | none | `[0, 2.2, 10]` → framed on both markers | core | 40–55 |
| S4 | Uₛ is the third account in the same constant sum | `oscillate/track` | Block released from partway up slides into the spring: coil compresses under real `F = −kx` (playback slowed ×N during contact, `slow motion ×N` badge on), Uₛ segment grows as K shrinks, spring throws it back up to its release height; **perpetual bounded oscillation** — U→K→Uₛ→K→U, all three segments live, column top flat throughout | "Spring energy joins total" | k | `[1.5, 1.4, 8]` → base + spring framed | core | 40–55 |
| S5 | Conservation holds ONLY without friction: with μₖ > 0 the total drops | `cycle-compare` — contrast pair of S3 (delta names the flip: friction ON, height lost) | Same apparatus, μₖ > 0: the oscillation DECAYS — block stops below the marker, each bounce lower, the E column visibly shrinks step by step toward zero | "Friction: total drops" | μₖ | `[0, 2.2, 10]` → incline midpoint | core | 35–50 |
| S6 | Final speed depends on height, not mass: v = √(2gh) | `translate-through` — declared contrast pair with S1 (delta names the flip: two masses, one speed) | TWO blocks (m, 2m) in side-by-side lanes released from the same height; each has a compact bar group — the heavy block's bars twice as tall — but the two v readouts stay identical all the way down; `loop_reset_ms` before spring contact | "Same speed, any mass" | m₂ | `[0, 2.2, 12]` → wider, both lanes framed | extended | 35–50 |
| S7 | K₁ + U₁ = K₂ + U₂ derived from the work-energy theorem | `flow-along-path` | The S4 bounded oscillation runs past two authored checkpoint flags on the slope; on the FIRST descent, crossing flag ① stamps K₁, U₁ into the formula surface and crossing flag ② stamps K₂, U₂ (latched; the oscillation keeps looping under the completed equation); the two sums display equal | "K₁ + U₁ = K₂ + U₂" | none | `[0, 2.0, 10]` → both flags framed | advanced | 45–55 |
| S8 | Teacher's sandbox | `drag-sandbox` | Trusted drag on the block; all sliders live; real spring at the base bounds everything; bars and total update continuously; free-runs forever (Rule 37, automatic); contact runs REAL-TIME (no slow window in sandbox, per the choreography spec's Rule-37 clause) | "Change anything" | ALL: m, θ, μₖ, v₀, k (+ drag) | `[3, 2.5, 9]` → mild oblique (drag depth affordance) | core | 0 / open |

Archetype audit: `translate-through` ×2 (S1/S6, declared pair) · `cycle-compare` ×2 (S3/S5, declared pair) · reveal-build, oscillate/track, flow-along-path, drag-sandbox ×1 each. No static state; no undeclared repeat; drag-sandbox explore-only.

Glow focal (32e — exactly one, all MESH/canvas-level, F14): S1 = K bar · S2 = E column · S3 = true height marker · S4 = Uₛ segment · S5 = E column · S6 = **the second block's body mesh (2m)** — the two v readouts carry live numbers but never glow · S7 = formula surface · S8 = none/body.

## 4. Misconception confrontation plan (Rule 16a — 3 genuine pivots, no per-state tic)

| Wrong belief (real, documented) | State | `misconception_watch` beat |
|---|---|---|
| "Moving uses energy up — the block will not get back as high as it started" | S3 | `belief`: energy is consumed by motion · `visual_counter`: ghost marker at the expected lower stop height, block visibly passes it and stops at the true marker, every cycle · `one_line_fix`: with no friction, every joule of K becomes U again — nothing is used up |
| "When the block speeds up, its total energy increases — K is new energy" | S2 | `belief`: speeding up creates energy · `visual_counter`: K segment grows while the E column's top stays pinned — the growth comes out of U, same column · `one_line_fix`: K grows only by exactly what U loses |
| "Mechanical energy is always conserved" (over-generalization the sim itself could plant) | S5 | `belief`: the total column is always flat · `visual_counter`: μₖ slider on, total column steps down each bounce · `one_line_fix`: the constant-total rule needs conservative forces only; friction breaks it (full accounting: next concept) |

EPIC-C branches: NONE (EPIC-L-first directive 2026-06-10). S1, S4, S6, S7, S8 carry no misconception_watch — straightforward teaching.

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates)

- **S2 `total_constant`** — the PRIMARY aha; students accept the trade but not the EXACTNESS of the sum ("constant-ish" vs constant). Highest-investment state.
- **S4 `spring_joins`** — three-account bookkeeping is where multi-store problems (block-spring JEE staples) break down.
- **S7 `derive`** — the algebraic bridge from W_net = ΔK to conservation is the classic exam-derivation stumble.

These coincide with the Pass-1 cliff states (Block 1) — no divergence to document.

## 6. Drill-down clusters (3 candidates each; physics_author fleshes trigger_examples)

- S2: `sum_exactly_constant` (why the total is exact, not approximate) · `where_does_k_come_from` (K sourced from U, not created) · `total_bar_reading` (how to read a stacked energy column)
- S4: `spring_compression_energy` (½kx² at maximum compression, K = 0 instant) · `three_store_bookkeeping` (K + U + Uₛ in one sum) · `max_compression_calculation` (setting mgh = ½kx²)
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

`kinetic_energy_definition` (#3), `gravitational_potential_energy` (#7), `elastic_potential_energy_spring` (#8), `work_energy_theorem` (#4, needed only for the advanced ring S7). **All four are planned Ch.6 siblings not yet shipped** — this concept is deliberately built first as the Phase-0 engine driver; the prerequisite edges point forward to them. Shipped advisory: `block_on_incline` (incline geometry familiarity). Cliff patches: Block 1.

## 9. Real-world anchor (Rule 35 universal · Rule 38f widest-overlap · Rule 41 plain)

**Primary — the roller coaster's first drop.** A roller coaster is pulled slowly to its highest point, and from there no motor pushes it again: it is fastest at the bottom of the drop, slows as it climbs the next hill, and speeds up again on the way down — the same total energy, split differently between height and speed at every point. Universal (amusement rides exist worldwide, no brand or place named), age-perfect for Class 11, and physics-true at full depth: every later hill must be lower than the first — friction, the S5 boundary, is exactly why, giving the teacher a clean bridge to concept #10.

**Secondary — a trampoline bounce.** At the top of a bounce: all height energy. At the lowest point: all spring energy in the stretched surface. In between: speed. Universal, and it motivates the three-segment sum of S4 — which now, like the trampoline, is a REAL elastic bounce.

The source catalog's anchors for this topic (chairlift at a named resort, railway porter) are PRE-Rule-35 India-specific — NOT imported (survey ⚠ section).

## 10. Definition of Done (Gate 0 — no TBDs)

**(a) States:** the 8 states of §2, exactly as tabled in §3.

**(b) Symbol-label table** (every narrated quantity → exact on-canvas label, Unicode — Rule 34c):

| Narrated quantity | On-canvas label |
|---|---|
| kinetic energy | `K` (bar), value `K = 24.5 J` |
| gravitational potential energy | `U` (bar) — paired with `Uₛ` to keep the two labels distinct |
| spring potential energy | `Uₛ` |
| total mechanical energy | `E` (stacked column), header `E = K + U` (S2–S3), `E = K + U + Uₛ` (S4+) |
| height above reference | `h`, reference line label `h = 0` |
| speed | `v = 3.1 m/s` (readout) |
| mass, angle, friction, spring constant, compression | `m`, `θ`, `μₖ`, `k`, `x` (slider rows / formula only) |
| checkpoint states (S7) | flags `①`, `②`; terms `K₁ U₁ K₂ U₂` |
| slowed playback (S4 contact window) | badge `slow motion ×N` (Rule 24/34 honesty — per the choreography spec) |

**(c) Direction-rule plan:** N/A — no right-hand rule (mechanics, scalar energy). Direction content is arrow signage only: velocity arrow on the block (existing arrow overlay), weight arrow in S7's checkpoint beat.

**(d) Motion plan:** per §3 — every state's motion named. Loops: `loop_reset_ms` fired BEFORE spring contact (S1, S2, S6) and at the launch-line re-cross (S3); genuine spring-bounded perpetual oscillation (S4, S7); genuine decaying oscillation under friction (S5); free-run sandbox (S8). One-shots: `sum_merge` cue (S2), checkpoint stamps (S7, latched). **No state's motion depends on the track bound; the fictitious "natural slope oscillation" and "one slow slide" plans from cycle 1 are DELETED.**

**(e) Modes:** conceptual-only (Rule 20 [D] — no `mode_overrides`).

**(f)** `assessment` + `coverage_map` authored by physics_author; `misconception_watch` exactly as §4 (3 entries, S2/S3/S5 only).

**(g) Macro↔micro plan (Rule 33):** N/A-with-rationale — the taught variable (mechanical energy) and its mechanism (macroscopic motion against gravity/spring) live at the SAME level; no hidden microscopic mechanism in scope (the microscopic fate of friction-lost energy is deferred to #10). Rule 33d instruments DO apply: every bar carries a live numeric value; `v` readout live; S6 shows two tracking `v` readouts.

**(h) Canvas budget (Rule 34):** ONE formula surface per state (Cambria Math): S1 none (bars carry their own labels) · S2 `E = K + U` · S3 `½mv² = mgh` at the marker · S4 `E = K + U + Uₛ` · S5 formula stays `E = K + U + Uₛ` — the DROP is shown, never written · S6 `v = √(2gh)` · S7 the derivation surface (only multi-term build) · S8 `E = K + U + Uₛ` (core form). Caption = the ≤5-word delta cue only; prose in `#capStrip`; HUD value-only; corners reserved per 34d; energy panel at the LEFT edge with measure-and-reflow (spec note 1).

**(i) Curriculum-flex block (Rule 38):**
- (i-1) **Cut check 1** (hide advanced → S1–S6 + S8): coherent — nothing in S1–S6/S8 references the derivation or checkpoint flags. **Cut check 2** (hide advanced + extended → S1–S5 + S8): coherent — S1–S5 never mention mass-independence or √(2gh); S8's sliders (m, θ, μₖ, v₀, k) reference ONLY quantities taught in S1–S5 (μₖ by S5 — F7; k by S4); no second body appears in the sandbox (m₂ removed — 38b).
- (i-2) Explore state surfaces CORE content only: bars, stacked E column, `E = K + U + Uₛ`, single body — all established by S5. √(2gh) and the derivation surface never appear in S8.
- (i-3) `curriculum_tags`: CBSE/NCERT Class 11 Ch.6 (Work, Energy and Power) — **verified** at authoring. IB DP Physics, AP Physics 1, A-Level (AQA/OCR/Edexcel energy modules), JEE Main/Advanced, NEET — authored as claims with `needs_teacher_verification: true` (38g).
- (i-4) Preset proposal (hide, never reorder): `full` = S1–S8 · `standard` (hide advanced) = S1–S6, S8 · `intro` (hide advanced+extended) = **S1–S5, S8**.
- (i-5) Graph-axis convention: N/A — this concept ships energy BARS, no graph panel (the U(x) graph group is a later Phase-0 by survey decree). No axis-swap toggle needed.

**(Rule 41 audit of reader-facing strings):** titles — "Potential energy becomes kinetic energy" (S1), "The total energy stays constant" (S2), "The block returns to the same height" (S3), "Spring energy joins the total" (S4), "With friction the total drops" (S5), "Mass does not change the final speed" (S6), "Deriving K₁ + U₁ = K₂ + U₂" (S7), "Explore: change anything" (S8). All literal, front-loaded for rail truncation; no personification ("energy converts", never "energy wants/flows home"; "the spring pushes the block back", never "the spring answers").

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

**Prerequisite cliff.** (1) `kinetic_energy_definition` missing → breaks at **S1**: patch with one narration sentence "the K bar measures the energy of motion, one half m v squared" while the bar first grows. (2) `gravitational_potential_energy` missing → also **S1**: the `h = 0` line + "the U bar measures m g h above this line" clause. (3) `elastic_potential_energy_spring` missing → **S4**: one clause "the compressed spring stores one half k x squared" as Uₛ first grows. (4) `work_energy_theorem` missing → **S7**: S7 opens by restating "net work equals the change in K" in one sentence before combining — and S7 is advanced-ring, so syllabi lacking #4 typically hide it anyway.

**JEE-backwards trace.** Question: *"A 2 kg block is released from rest at height 5 m on a frictionless ramp and compresses a spring (k = 800 N/m) at the bottom. Find the maximum compression."* Needed knowledge → delivering state: U = mgh at release (S1) · total is conserved down the ramp (S2) · at max compression K = 0 and all energy is in the spring (S4 — the bounce's turning instant shows exactly this, on real `F = −kx` physics) · setting mgh = ½kx² between two checkpoints (S7; numerically prefigured by S6's √(2gh)). No missing piece. Friction variant deliberately out of scope (#10).

**Misconception entry mapping (16a).** (1) "energy is used up by motion" — confronted S3 (ghost-marker beat, §4); nothing earlier plants it, it arrives with the student. (2) "K is created when speeding up" — **S1 itself risks planting this** (K grows with no sum shown); flagged at the planting moment by S1's mirror choreography (U shrinks in exact mirror) and killed one click later by S2 — this adjacency is deliberate. (3) "conservation always holds" — **planted by S1–S4's frictionless world**; confronted immediately after, S5 (now core, so EVERY preset's audience that sees the frictionless world also sees its boundary — F7). No EPIC-C branches (fallback deferred).

### Block 2 — Aha-moment designation

- **PRIMARY aha (S2):** K and U trade continuously, but their sum never changes — the stacked column's top is pinned while its internal split shifts, even as the teacher changes the slope. The 10-year memory is that flat-topped column.
- **SUPPORTING aha (S3):** the block climbs back to exactly the marked height, every cycle — conservation makes an exact prediction, not an approximate one.
- **Cohesion check:** S3 is the primary aha replayed as a falsifiable prediction (it converts "the sum is constant" from a statement into a test the sim visibly passes) — it serves the primary directly. S6's mass-independence is a consequence beat, deliberately NOT designated an aha (keeps the 1+1 sweet spot).
- **Wrong-belief setup:** for the primary — S1 earns the confident-wrong-belief "K is appearing" by showing growth without the sum (1 state before S2). For the supporting — S1+S2 establish downhill conversion so the residual intuition "it won't ALL come back uphill" is live entering S3; the ghost marker gives that intuition a visible, falsified prediction.
- **Foundational-coverage:** S2 ∈ foundational range (S1–S4) ✓.

## ENGINE SPEC NOTES — energy-layer requirements (0c build contract)

Phrased as requirements; each is exercised by this concept unless marked *(union — other concepts)*. `peter_parker:field3d_surgeon` is a consulted party on cost before this spec is built; nothing goes to the surgeon under the cycle-1 text.

1. **`energy_layer` per-state config block** on `newtons_laws_body`: `bars: subset of ['K','U_grav','U_spring','E_total','E_dissipated']` in a FIXED panel order; panel DOM built once, bars shown/hidden per state (Rule 31/32d — same screen position across states). **Panel anchors at the LEFT screen edge** (the right edge already carries three overlay zones with one OPEN and one FIXED collision scar — F12), and lays out by a **measure-and-reflow ladder** (measure rendered extents, then place; never fixed CSS offsets). `E_dissipated` slot reserved in the panel order now *(union — #10)* even though this concept never shows it.
2. **The three energy bars are DERIVED, not accumulated** — K = ½mv², U_grav = mgh (above the authored reference), U_spring = ½kx², computed every frame from integrator state (v, s, x), never authored per-frame. **The Rule-36 frame-rate-independence-by-construction claim applies to these three bars ONLY** (F4). The layer's other mechanisms (W accumulator, checkpoint latch, one-shot cues) carry history and are covered by notes 10, 11 and 18.
3. **`E_dissipated` is a STATE FUNCTION, not a path integral** *(union — #10)*: `E_dissipated = E_total(t₀) − K − U_grav − U_spring`, where `E_total(t₀)` is captured once at state entry (and re-captured on `RESET_TRAJECTORY`). **Scope clause:** exact only when NO external work acts; when an applied force is present (#11/#12), `E_dissipated = E_total(t₀) + W_applied − (K + U_grav + U_spring)`. Fold-exact for free — it inherits the derived bars' frame-rate independence.
4. **Common linear joule scale** per state via authored `bar_max_J`; each bar carries a live value-only numeric (`K = 24.5 J`) per Rules 33d/34b. Unicode subscripts (`Uₛ`) — never ASCII.
5. **`E_total` renders as a STACKED column of its component segments** (K on U on Uₛ), so constancy reads as constant column height while the internal split shifts. Numeric total beneath. The stack is UNSIGNED (energies ≥ 0); signed rendering is the W bars' job (note 10). This is the layer's signature visual — prefer it over a fourth independent bar.
6. **One-shot `sum_merge` cue** (fired via the existing `scenario_cue` channel, never a hardcoded `*_at_ms`): the separate K and U bars slide together and stack into the E column (S2's reveal-build). Holds its end pose (scar rule: no fall-to-zero one-shots); re-arms on `RESET_TRAJECTORY` (note 18).
7. **Authored zero-reference line + height markers**: dashed 3D line at h = 0 with label, `depthTest:false` + high renderOrder (scar rule: overlays over busy geometry). Height markers: (a) a bright marker at a COMPUTED height (engine computes s = v₀²/(2g·sinθ) from state params — computed placement, never hand-guessed); (b) an optional DIM `ghost_marker` at an authored fraction of it (misconception beat, dim-peer style — never integrated into physics). *(General: any "predicted stop" beat chapter-wide.)*
8. **GENUINE spring physics (founder ruling 2026-08-01 — resolves the F1 directive collision):**
   - **8a.** Spring config gains `k_N_per_m` and `natural_length_m` (wall-mounted via the existing `fixed` wall anchor). While the block overlaps the spring's free end, the integrator applies `F = −kx` (semi-implicit Euler, strictly affine in dt — `v += (F/m)·dtPhysics; s += v·dtPhysics` — Rule 36 holds; no internal sub-stepping, no literal 0.016). Compression `x` is exposed to the energy layer for `Uₛ = ½kx²`. The exchange is elastic: K + Uₛ conserved to integrator precision (symplectic — bounded ripple, no drift).
   - **8b. Slow motion is a PLAYBACK modifier over the real physics, never a scripted stroke.** During the contact window, `dtPhysics = dt / slow_factor` (the choreography spec's own load-bearing implementation, verbatim) with the mandatory `slow motion ×N` badge; HUD/bars keep TRUE physical values. This preserves the 2026-07-30 directive's full intent (a real spring bounces too fast to teach from) while replacing only its mechanism: `spring_action`'s approach/compress/hold/release LOOK now emerges from real dynamics viewed slowly, not from a force ramp and a latch. **Ripple correction (Checkpoint-A cycle-2 must-fix):** the displayed total must be corrected for the integrator's symplectic ripple: `E_display = K + U_grav + U_spring + (dtPhysics/2)·k·x·v` (the shadow-Hamiltonian term; motion is unchanged, residual O(dt²) ≪ 0.1 J). `slow_factor` is a legibility choice, **NOT** the numerical remedy — at m=2 kg, k≈370 N/m, slow_factor 6 the raw ripple is ≈0.55 J (|ΔE| ≈ (ω·dt/2)·E is LINEAR in ω·dt), which would visibly breathe the column top in the concept's own three-account showcase state. Acceptance probe (not an assertion): at the authored k/m, `max|E_display − E(t₀)|` over a full contact cycle < 0.05 J. **Window detection:** with real physics the slow window is CONTACT-DETECTED (`x > 0`, latched against chatter), NOT the shipped closed-form phase machine keyed to `contact_from_ms`/`release_at_ms` — do not reuse the `push_off` gate.
   - **8c. The build is ADDITIVE.** `k_N_per_m` present → genuine-physics path; absent (legacy `spring_action` scripted cycle) → existing behavior untouched. `newton_third_law` owns the scripted apparatus and MUST be in the surgeon's regression EYE sample (alongside `electric_flux` + `magnetic_flux` per the choreography spec's own verify list).
   - **8d.** Rule 37/sandbox: no slow window in `mode: 'sandbox'` states — real time, trusted drag/slider cancels any in-progress window (existing seize flags). Unblocks union **#8 `elastic_potential_energy_spring`**.
9. **`loop_reset_ms` per state**: deterministic clock-based restart of body kinematics to the state's initial pose, driven off `PM_simTimeMs` modulo so THE EYE's dense frames stay deterministic; must satisfy the no-frozen-tail scar. **Authoring invariant: the reset fires BEFORE spring contact** in states where Uₛ is untaught (S1/S2/S6) or unwanted (S3's launch-line re-cross).
10. **`W` accumulators — N CONCURRENT named-force instances, SIGNED** *(union — #1, #2, #4, #5, #11, #12; used here only by S7's narration bridge)*: `work_accumulators: [{force, label}]` (≥2 concurrent — #5 shows gravity returning 0 and friction not, side by side in ONE state — F11). Each accumulates ∫F·ds per fixed step as F·Δs (linear in dt), resettable, exposable as a readout/bar. **Rendering is SIGNED (F6): mid-scale zero baseline, bar grows up for W > 0 and down for W < 0, sign-coloured, signed numeric (`W = −18.0 J`)** — distinct from the unsigned E stack. **Honesty note (F4): per-step accumulation is fold-exact only while F is position-independent** (gravity, constant friction, constant applied force — all of #1/#2/#4/#5's uses); for position-dependent forces (the spring) prefer the derived `Uₛ` and the state-function form, never the accumulator.
11. **Checkpoint flags with capture-on-pass**: authored positions along the surface; when the body's s crosses one, the current K and U values stamp into the state's formula surface (S7) — captured values LATCH and hold (end-pose rule); the latch re-arms on `RESET_TRAJECTORY` (note 18). *(General: #5's round-trip work test reuses the crossing detector.)*
12. **Per-body bar groups (max 2, compact)**: `energy_layer.body_id` selects the tracked body; S6 instantiates two compact side-by-side groups plus the two live `v` readouts. Default = single group, body A.
13. **Bars/segments/markers are glow-addressable** (`energy_bar_K`, `energy_col_E`, `marker_true`, …) through the existing `applyGlowEmphasis` path — brightness only, never size (Rule 29); exactly one focal (32e). Bar HEIGHT tracking real joules is the sanctioned magnitude exception, same class as arrow length. DOM HUD rows are NOT glow targets (F14) — states needing emphasis near a readout pick a mesh-level focal (S6 = body B).
14. **`P` readout (F·v instantaneous, W/Δt average)** *(union — #11, #12; not used in this concept)* — build in the same layer pass per the survey's union table.
15. **`deriveStateMeta.ts` co-edit is mandatory at all THREE sites (F16):** (i) per-state reveal/cue-time registration (`sum_merge`, checkpoint stamps — else THE EYE false-fails D7); (ii) state classification (loop vs hold vs `sandbox → interactive` — else D1p); (iii) the **frozen-pin time selection**: the `SET_TIME_FREEZE` pin MUST land inside a descent segment of the motion, provably offset from every `loop_reset_ms` boundary (author pin ≈ 55–65% of the loop period and assert it is not within ±150 ms of a reset), or the H2 baseline is minted on a restart frame. The `#sliders` exclusion chain already handles `nlb`; the energy panel joins the nlb-owned DOM, not the generic panel.
16. **Widget discovery (Rule 39g)**: the energy panel and marker overlays follow the discovery conventions (`.pm_hud` / inline `position:fixed` / `*_row` slider rows) so the ⚙ teacher toggles inherit them with zero curation.
17. **CLAMP INVARIANT (F3 — layer requirement):** `nlbBoundsM()` zeroes `v` at a track bound (renderer L42897–42901) — a GEOMETRIC clamp, not physics. **A velocity zeroed by the geometric clamp must never be presented as an energy change.** Two-part enforcement: (a) authoring invariant — no energy-layer state may allow a tracked body to reach the track bound (spring turnaround or `loop_reset_ms` fires first; §3 satisfies this in all 8 states); (b) engine guard — if the clamp fires while the energy layer is active, the layer HOLDS the last pre-clamp bar values and logs a console warning (so a mis-authored state fails loudly at THE EYE, never as a silently collapsing E column) — emit it with a UNIQUE console prefix and assert zero occurrences in the EYE run, or the console audit will not catch it. **(c) The sandbox wrap is also NOT physics.** `nlbSandboxWrap()` (renderer ~L42881) teleports `s` across the track and re-seeds `v` to authored `v₀` on reaching a bound in `mode:'sandbox'`. If it fires while the energy layer is active, the layer treats it as a state re-entry: re-capture `E_total(t₀)` (note 3), re-arm every latch/one-shot (note 18), and reset the bar baseline in the same frame — never render a wrap as an energy change.
18. **`RESET_TRAJECTORY` coverage — every piece of history restores (F4; scar `field3d_integrating_scenario_ignores_reset_trajectory_and_carries_stale_accumulator`):** on `RESET_TRAJECTORY` the layer must (a) zero every `W` accumulator (all N instances); (b) re-arm the S7 checkpoint latches and clear stamped values; (c) re-arm the `sum_merge` one-shot; (d) re-capture the `E_total(t₀)` baseline (note 3); (e) reset spring compression x and the slow-window/badge state; (f) zero the loop clock. THE EYE drives `RESET → pin → RESET → dense → RESET → frozen` — any stale carry-over is a determinism failure.
19. **Off-axis force geometry primitives** *(union — #1, #2; not used in this concept)* **(F5):** (a) **displacement vector `d`** — an arrow along the surface from the release point to the body's current position, labelled `d`, live length; (b) **angle arc** between any two addressable arrows (or an arrow and `d`), labelled `θ` with a live degree readout; (c) **applied force at an authored angle** — `applied_force: { N, angle_deg }` replacing the scalar-only drive: the along-surface component drives the integrator, the normal component feeds N (and thus friction). **`N = mg·cosθ − F·sin(angle_deg)` MUST clamp at ≥ 0 (lift-off) or `μN` reverses sign. `N` is read by ~10 shipped concepts — this requires a regression EYE sample WIDER than the choreography spec's list.** Together these draw the chapter's textbook opening picture (a case pulled by a handle at an angle).

Out of scope confirmed (survey + dispatch): U(x) graph panel, pendulum, vertical loop, walking stride, hanging chain — no state above requires any of them.

**Union-table closure check (the survey's STOP condition):** with notes 8 (#8), 10 (#1/#2/#4/#5/#11/#12 — signed, N concurrent), 14 (#11/#12), 19 (#1/#2), 3 (#10) in this build, all 11 sibling concepts are reachable as pure authored JSON after 0c lands.

## Compliance lines

- **DC Pandey check:** consulted only chapter scope alignment (Work, Energy and Power TOC placement); no teaching method, example problem, or figure imported. NCERT = syllabus backbone only; its Indian-context examples not imported (Rule 35).
- **Engine bug queue (F15):** live query script still unavailable in this dispatch (no shell tool). Cycle-1's substitution stands (scar-candidate corpus + founder_proxy's independent renderer verification of F1/F3), and the three cycle-1 candidate scar rows (`scar_candidates.sql`) are treated as binding directives by this revision. **FLAG for quality-auditor Gate 8:** run `query_engine_bug_queue.ts conservation_of_mechanical_energy` and `--field3d --open` against this skeleton before build.
- **Founder-directive reconciliation (F1):** ruled by the founder 2026-08-01 — genuine spring physics + `slow_factor` playback slowing, superseding the scripted-stroke MECHANISM of `NLB_SPRING_CHOREOGRAPHY_SPEC.md` while preserving its intent and its Rule-36/24/34/37 constraints verbatim; the scripted path remains live for legacy states (spec note 8c) and `newton_third_law` is in the regression sample. Recorded here as the audit trail; not re-litigated.

## Self-review checklist — all items verified

Atomic claim one sentence ✓ · 8 states within complex band with justification ✓ · control table complete with archetype/delta/controls/camera/ring/words, no undeclared repeats, no static state ✓ · Rule 32 plan (cause-first, one-variable, delta cues, PERMANENT home pose — no θ ramp, no teleport — single glow, all focals mesh/canvas-level) ✓ · bounding discipline: no state reaches the track bound; clamp invariant specified ✓ · Rule 33 declared N/A-with-rationale + live instruments ✓ · Rule 34 budget per state, panel left-edge with reflow ✓ · Rule 38 rings (S5 core) + BOTH cuts re-checked + S8 core-only controls (m₂ removed) + tags + presets + axis N/A ✓ · misconception_watch at 3 pivots only ✓ · deep-dive picks ×3 with clusters ✓ · entry_state_map with foundational containing PRIMARY aha ✓ · prerequisites advisory (forward edges flagged) ✓ · universal anchor ✓ · DoD zero TBDs ✓ · Block 1 + Block 2 complete ✓ · plain-language audit ✓ · ENGINE SPEC NOTES delivered with founder ruling, clamp invariant, RESET_TRAJECTORY coverage, honest Rule-36 scoping, and full union closure ✓.
