# ARCHITECT SKELETON — `work_done_by_constant_force` (CYCLE 2)

> Chapter: Class 11 Ch.6 Work, Energy and Power · concept **#1** of 12 (approved teaching order, founder 2026-08-01)
> Renderer: `field_3d` / `newtons_laws_body` + energy layer (Phase-0c COMPLETE, PR #14 merge commit `5dd8287`) — **this is a 0d pure-JSON concept; SEAM N was built for it. Design target: ZERO renderer edits.**
> Authoritative config contracts: `docs/loop_runs/ch6_state.md` §"SEAM K/L/M/N RESULT" — per 0c doctrine those REPORTS supersede any literal in this skeleton.
> Doctrine: Rules 16a · 19 · 23 · 24 · 25 · 31 · 32 · 33 · 34 · 35 · 38 · 41. Conceptual-only (Rule 20 [D]); EPIC-C branches: none.
> Cycle 1 authored 2026-08-01; **cycle 2 revised 2026-08-01 against Checkpoint A `DESIGN_FIX` (`founder_proxy_A.md` — 3 P1, 5 P2, 3 P3). This is the final cycle; no cycle 3 exists.**
> Line numbers quoted below are the Checkpoint-A machine-extracted evidence, verified against the post-merge 2026-08-01 build (the dispatching session independently re-verified F1 and F3 at source).

## CYCLE 2 CHANGES

| Finding | What changed |
|---|---|
| **F1 (P1)** | Home pose re-pinned: `initial_position_m = −length_m` (the left bound) for ALL states. `checkpoints.s_m` is an ABSOLUTE track coordinate (`b.s >= cp.s_m`, L44203; seeds from `initial_position_m`, L44543; track spans −`length_m`…+`length_m`, `NLB_DEFAULT_LEN_M = 6` is a half-length). Flag position is now authored as ARITHMETIC, never a literal: `s_m = initial_position_m + d_target` — stated once in §3's home-pose paragraph so physics-author and json-author cannot diverge. |
| **F2 (P1)** | Both false "stamp holds" claims corrected: `nlbRunLoopReset` → `nlbResetTrajectory()` WIPES the stamp every loop cycle (L43023 · L42989-92 · L43002) — it re-fires at each cycle's crossing. New authoring invariant beside the bounding discipline: **the checkpoint crossing must occur before 55% of `loop_reset_ms`** (frozen pin sits at 60% of loop phase per SEAM M), physics-author computes the crossing time against the state's authored acceleration. |
| **F3 (P1)** | Decision 2 RE-MADE on the true contract. `slider_controls` is a built per-CONCEPT range/label override (top-level config key L1877; `nlbSc(token)` merges `config.slider_controls[token]` over `NLB_SLIDER_SPEC[token]`). Adopted: `slider_controls.F_ang: { min: 0, max: 85 }` and `slider_controls.F: { min: 0, max: 60 }` concept-wide. **S3 now carries the θ slider** (the taught variable, in the teacher's hands — Rule 31 restored right-side-up) and the sandbox is CLOSED to the ≥90° regime, making Decision 3's cession mechanically true. §1 and §3 now agree. |
| **F4 (P2)** | S5's "arc re-anchor" delta DROPPED (verified pixel no-op: `'surface'` returns `axis.clone()` L43964; `'displacement'` returns `nlbSignedDir(axis, +ds)` ≡ `axis` L43984). S5 now runs at a **different θ (20 N at 30°)** so the arc reads a new number, the F arrow tilts differently, and the bar climbs at a third distinct slope — `W = F⃗·d⃗` demonstrated as *general*, not a re-caption of S4. S5's topic-label title replaced with a result-stating one. |
| **F5 (P2)** | §10(b) rewritten to the engine's REAL strings: panel header is engine-hardcoded `"Work done"` (L43198, not authorable); bar caption = the force label (L43551) — authored `label: "by the pull"` so the stamp (`head + ":  W " + label + " = " + value`, L44215-44236) reads `flag at 2 m:  W by the pull = 40.0 J` — real English (Rule 41). Bar numeric is bare (`40.0 J`). |
| **F6 (P2)** | Same fix as F1 closes it: with `initial_position_m = −length_m`, the S6 sandbox wrap lands the crate on its release point, `\|Δs\|` falls below `NLB_DISP_MIN_M = 0.02` and the `d` arrow hides in the same frame the ledger zeroes (the wrap does not remap `b.s0`, L45428 — engine-side `b.s0 -= span` is a filed **ride-along** scar candidate, deliberately NOT requested here). |
| **F7 (P2)** | S1's checkpoint stamp DROPPED entirely. S1 teaches from live numbers only (bar + `d` value + HUD `F`); S4 is the sole checkpoint state, keeping its stamp device un-spent. |
| **F8 (P2)** | Three constraints promoted into the DoD: (a) S2's ramp ceiling ≤ 0.85·μₛN with the arithmetic authored (μₛ = 0.9, m = 5 kg → maxStat = 44.1 N → ramp target 36 N); (b) S1/S3/S4/S5 (and S6) explicitly frictionless; (c) `work_scale_J` specified, sized above the LOOP's peak (never the flag's value — the overflow warn L44373 is asserted zero by THE EYE), and SHARED across S1/S3/S4/S5. |
| **F9 (P3)** | Token names corrected: `param_ramp.param: 'F'` (closed enum `'theta'\|'F'\|'mu_s'\|'mu_k'\|'m'`, L1577); the `F` slider's default −20…+20 N (L41881) is widened via `slider_controls.F` (see F3). |
| **F10 (P3)** | The "pull begins ~0.8 s in" claim DROPPED (no contracted delay mechanism for a constant force). S1's cause-before-effect beat is carried by rest-start dynamics instead: the F arrow is present at entry, the crate accelerates from v = 0, so `d` and the bar visibly lag the cause. |
| **F11 (P3)** | Recorded as an ACCEPTED limitation (not routed, per the reviewer's explicit decline): the `F cos θ` component is never drawn as an object (`show_components` is weight-only and incline-gated — config type L1319, reader L40862). S3's `one_line_fix` re-worded to name what IS drawn: the arc, the tilted full-\|F\| arrow, and the two bar slopes. |
| (endorsed) | Kept VERBATIM: the arc grammar, PRIMARY aha at S2 (Decision 1), the 2 misconception pivots, the suitcase/stalled-car anchors, the Rule-41 title audit (minus S5's replaced title), the §1 boundary with #2 (Decision 3 — now mechanically enforced), and the verified no-`energy_layer` panel path (L42747 · L43241). |

## 1. Atomic claim

This concept teaches ONE idea: work done by a constant force is `W = F·d·cos θ` — force, the displacement it acts through, and only the component of the force along that displacement — and only that. It does NOT cover the sign taxonomy of work (positive vs negative vs zero work across the three angle regimes, friction's negative work, the normal force's zero work — ALL deferred to `positive_negative_zero_work`, #2), kinetic energy (#3), the work–energy theorem (#4), or power (#11/#12). **Boundary decision, stated deliberately:** #1 owns the definition, the joule, the "no displacement → no work" case (zero via `d = 0`, which is definitional), and the cos θ resolution for 0° ≤ θ < 90°; #2 owns everything at and past 90° (zero via θ = 90° and negative work — SEAM N's verified 120° → −20 N case is #2's arc, not touched here). **The cession is mechanically enforced, not merely claimed:** `slider_controls` clamps `F_ang` to 0…85° and `F` to 0…60 N concept-wide, so no state — guided or sandbox — can reach the ≥90° regime or a backward pull.

## 2. State count + arc — 6 states (5 guided + 1 explore)

Medium-simple concept, at the low end of medium (§5 calibration: simple 3–4, medium 5–6) — justified: it is the chapter's definitional opener carrying four separable ideas (product definition + unit · displacement requirement · angle resolution · numeric verification) plus one advanced notation state and the explore. Fewer states would fuse the misconception beat into the definition beat; more would pad (the sign cases that could fill states 7–8 belong to #2 by the approved decomposition).

| # | id | Ring | Purpose (one line) | teaching_method |
|---|---|---|---|---|
| S1 | `pull_and_move` | core | A steady pull moves a crate along the floor; the work meter grows with the distance — `W = F·d`, and when `d` reads 1.00 m the bar reads 20.0 J live: the joule | (straightforward beat) |
| S2 | `force_without_motion` | core | The same hard pull on a crate that does not move: the work meter holds exactly 0.0 J — **PRIMARY aha**, 16a contrast beat | misconception_confrontation |
| S3 | `tilted_pull` | core | The same pull tilted upward — with the θ slider in the teacher's hand: the crate still moves, but the meter climbs slower for the same floor distance — only the along-motion part counts: `W = F·d·cos θ` | misconception_confrontation (16a beat #2) |
| S4 | `numbers_agree` | extended | The formula predicts, the meter measures: at the flag, `40 × 2.0 × cos 60° = 40 J` stamps and the live bar reads the same number at that instant | (straightforward beat) |
| S5 | `scalar_product` | advanced | The same physics at a THIRD angle (20 N at 30°) written in vector notation: `W = F⃗·d⃗` — one number from two arrows, at any angle | derivation_first_principles |
| S6 | `explore` | core (explore) | Sandbox: drag the crate, change F, θ, m — work meter, d arrow and angle arc all live; clamped to 0…85° so #2's regime stays #2's | exploration_sliders |

Rule 38a: qualitative (S1–S3) → quantitative (S4) → notation/derivation (S5); the advanced ring (S5) is one contiguous block immediately before the explore state. The hook MOVES at S1 from the first frame — the crate accelerates from rest under a visible force (no static setup state).

## 3. Per-state choreography + control table (Rule 31 — REQUIRED artifact)

**Home pose (Rule 32d — PERMANENT, never rebuilt):** flat floor (`surface.theta_deg: 0`), one crate (m = 5 kg) **released from the LEFT BOUND of the track: `initial_position_m = −length_m`** (F1/F6 — this pins `b.s`'s seed, maximises run length, and makes the S6 wrap land the crate on its own release point). **Flag positions are ARITHMETIC, never literals: `s_m = initial_position_m + d_target`** (with the default `length_m = 6`, S4's flag at `d_target = 2.0` is `s_m = −4.0`) — `checkpoints.s_m` is an absolute track coordinate (`b.s >= cp.s_m`, L44203; seed L44543), NOT a displacement; physics-author and json-author compute from this one formula and never write a bare flag literal. Work-meter panel at the screen LEFT edge (SEAM L's measured panel; SEAM M's work bars live inside it and inherit its reflow ladder), formula surface top-centre, HUD value-only. The apparatus never teleports; θ of the SURFACE never changes (the angle in this concept is the angle of the PULL, not of the floor); at every click the only visible change IS the state's new thing. Cause-before-effect (32a): in every guided state the force arrow is the first thing acting; the crate responds from rest, and the meter follows the crate.

**Bounding discipline (exemplar-F3 discipline):** the crate NEVER reaches the right track bound in any authored guided run — `loop_reset_ms` fires first (physics-author computes: loop distance < track span at each state's acceleration). The geometric clamp (`nlbBoundsM`) must never fire in an authored run. **Checkpoint-vs-loop invariant (F2):** the loop reset wipes the stamp every cycle (`nlbRunLoopReset` → `nlbResetTrajectory()`, L43023; `cp.text`/`cp._side`/`cp._count` cleared L42989-92; `formula_base` re-rendered with no stamp L43002) and re-fires it at each cycle's crossing — so **S4's flag crossing must occur before 55% of `loop_reset_ms`** (the frozen pin lands at 60% of loop phase per SEAM M's contracted formula), with physics-author computing the crossing time from the authored acceleration. The live-teacher consequence is stated honestly: the stamp blinks off at each loop boundary and re-stamps within the same cycle — acceptable; the frozen frame and every ≥55%-phase instant show it stamped. *(Seizure note: per SEAM K, `loop_reset_ms` goes inert once a trusted control is seized — after the teacher touches S3's θ slider the loop stops rewinding and the crate may eventually reach the bound under teacher control; that is teacher-driven and acceptable. The AUTHORED auto-run never clamps.)*

| # | Teaches | Archetype | Distinct motion | Delta (≤5-word cue) | Controls | Camera (side-on) | Ring | Words |
|---|---|---|---|---|---|---|---|---|
| S1 | Work = force × distance moved; the joule | `translate-through` | Steady 20 N pull at 0° from the first frame; the crate accelerates from rest (cause visible before effect — `d` and the bar start at zero and lag the arrow); `d` arrow appears past 0.02 m and stretches with live value; the signed work bar climbs in step; when `d` reads 1.00 m the bar reads 20.0 J live — "20 newtons through 1 metre is 20 joules"; `loop_reset_ms` restarts before the bound. No checkpoint (F7 — the stamp is S4's device) | "Force times distance" | none | `[0, 2.0, 10]` → crate + run framed | core | 40–55 |
| S2 | No displacement → no work, whatever the force | `null-result-hold` | Rough floor (μₛ = 0.9, this state only): the pull RAMPS up (`param_ramp` on `'F'`, 0 → 36 N — ceiling arithmetic in DoD (f)); the F arrow grows large, the `f` readout climbs to match it (engine reports `f = −drive` in static hold, L45362), the crate never moves, **no `d` arrow ever appears** (hidden below 0.02 m — the hide IS the lesson), the work bar stays parked on its zero line at `0.0 J` | "No distance, no work" | none | `[0, 2.0, 10]` → crate centred | core | 35–50 |
| S3 | Only the along-motion component of the pull does work: cos θ | `translate-through` — **declared contrast pair with S1** (delta names the flip: same force, now tilted) | Same 20 N pull, authored at 60° (`applied_force: {N: 20, angle_deg: 60}`); `angle_arc {from:'applied', to:'surface'}` with live `θ = 60°`; crate moves, `d` arrow stretches, but the work bar climbs at HALF the joules per metre of S1 (cos 60° = ½); formula surface becomes `W = F·d·cos θ`. **The θ slider is LIVE in the teacher's hand** (clamped 0…85 concept-wide) — tilting it mid-run visibly changes the bar's climb rate against the same `d` | "Tilted pull: less work" | `F_ang` (θ, 0…85) | `[0, 2.0, 10]` → arc + crate framed | core | 40–55 |
| S4 | The formula's prediction equals the meter's measurement | `flow-along-path` | 40 N at 60°: the crate flows past the checkpoint flag at `s_m = initial_position_m + 2.0`; crossing stamps `flag at 2 m:  W by the pull = 40.0 J` under the formula; the live bar reads the same 40.0 J at that instant — prediction and measurement are one number. Crossing authored before 55% of `loop_reset_ms` (F2 invariant); the stamp re-fires each cycle at the crossing | "The numbers agree" | none | `[0, 2.0, 10]` → flag + meter both framed | extended | 40–55 |
| S5 | W is a scalar product of two vectors: `W = F⃗·d⃗ = F·d·cos θ` — at ANY angle | `reveal-build` | **A third angle: 20 N at 30°** (F4 — new arc number `θ = 30°`, new F-arrow tilt, a third distinct bar slope: 17.3 J/m vs S1's 20 and S3's 10); the vector formula surface builds its three factors live as the pull runs — \|F\| fixed, \|d\| growing, cos θ fixed — collapsing two arrows into one signed number. Arc authored `{from:'applied', to:'displacement'}` for semantic honesty; on a flat forward run this renders pixel-identically to `'surface'` (L43964/L43984) and is NOT claimed as a visual delta | "Any angle, one number" | none | `[0, 2.0, 10]` → both arrows + arc framed | advanced | 35–50 |
| S6 | Teacher's sandbox | `drag-sandbox` | `mode: 'sandbox'`: trusted drag on the crate; F, θ, m sliders live (F 0…60 N, θ 0…85° — the concept-wide clamp closes #2's regime here too); work bar, `d` arrow, angle arc and HUD update continuously; free-runs forever (Rule 37, automatic). On wrap the ledger zeroes AND the `d` arrow hides in the same frame (home pose at the left bound — F6) | "Change anything" | ALL: `F` (0…60), `F_ang` (0…85), `m` (+ drag) | `[3, 2.5, 9]` → mild oblique (drag depth) | core | 0 / open |

Archetype audit: `translate-through` ×2 (S1/S3, **declared pair**) · `null-result-hold`, `flow-along-path`, `reveal-build`, `drag-sandbox` ×1 each. No static state (S2's CAUSE — the ramping force arrow and the tracking `f` readout — moves throughout; the stillness of the crate is the taught content, the Rule 16a contrast pattern's canonical form); no undeclared repeat; drag-sandbox explore-only. S5's distinctness is now carried by its own picture (third angle, third slope), not by a no-op re-anchor.

**Glow focal (32e — exactly one per state):** S1 = `displacement_vector` (the growing d is the new thing) · S2 = `work_bar_applied` (the zero bar IS the point) · S3 = `angle_arc` · S4 = `checkpoint_1` · S5 = the formula surface · S6 = none/body.

**Decision 2, re-made on the true contract (F3):** `slider_controls` is a built, contracted per-CONCEPT override — top-level config key (L1877), read by `nlbSc(token)` which merges `config.slider_controls[token]` over `NLB_SLIDER_SPEC[token]` (*"Per-concept min/max/step/default/label override, keyed by the SAME token the per-state `controls_visible[]` uses"*). The cycle-1 premise ("range engine-fixed at −90…180") was false — −90…180 is the `F_ang` DEFAULT (L41893). Adopted, two JSON lines, zero renderer edits: `slider_controls.F_ang: { min: 0, max: 85, step: 5, def: 60 }` and `slider_controls.F: { min: 0, max: 60, step: 5, def: 20 }` (the `F` default range is −20…+20, L41881 — too narrow for S4's 40 N and negative F would be a backward pull, #2's regime). Consequences: (a) S3 — the state that TEACHES θ — gets the θ slider, restoring Rule 31's contextual-control logic; (b) the sandbox cannot reach 90°+ or a negative pull, so §1's cession to #2 is enforced by the config, not by hope; (c) the cycle-1 "teacher drags past 90°, bar dips negative, acceptable" text is DELETED — it contradicted §1 and is now impossible.

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots, no per-state tic)

| Wrong belief (real, documented) | State | `misconception_watch` beat |
|---|---|---|
| "Pushing hard IS doing work — effort equals work, even if nothing moves" (the everyday meaning of the word) | S2 | `belief`: applying a force is doing work · `visual_counter`: the F arrow ramps large, the friction readout climbs to match, the crate never moves, no d arrow ever appears, the work meter holds exactly 0.0 J · `one_line_fix`: work needs displacement — zero distance means zero work, whatever the force |
| "The whole force does work: W = F·d for any direction of pull" | S3 | `belief`: all of F counts regardless of its direction · `visual_counter`: the identical 20 N pull, tilted to 60°, buys only half the joules per metre — the arc shows the tilt, the full-length F arrow leans away from the motion, and the bar visibly climbs slower against the same growing `d` · `one_line_fix`: tilting the pull leaves less of it pointing along the motion — the work per metre falls by cos θ *(F11 accepted limitation: the `F cos θ` component is never drawn as an object — `show_components` resolves the weight only and is incline-gated (config L1319, reader L40862); the narration names only what IS on canvas: the arc, the tilted arrow, the two slopes)* |

S1, S4, S5, S6 carry no `misconception_watch` — straightforward teaching. EPIC-C branches: NONE (EPIC-L-first directive 2026-06-10).

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates)

- **S2 `force_without_motion`** — the everyday-language collision ("I carried a heavy bag all day and did no work?!") is the concept's historically stickiest point; highest-investment state.
- **S3 `tilted_pull`** — the mathematical abstraction (component resolution, trigonometry) with multiple documented confusion phrasings ("why cos not sin", "where did part of my force go").

Two picks (spec allows 2–3); both coincide with the Pass-1 cliff states (Block 1) — no divergence to document.

## 6. Drill-down clusters (3 candidates each; physics_author fleshes trigger_examples)

- S2: `work_vs_effort` (physics work vs everyday tiredness — muscles burn energy, physics work on the crate is zero) · `holding_is_not_working` (holding a weight stationary, d = 0) · `force_needs_displacement` (both factors of the product must be nonzero)
- S3: `why_cos_theta` (projection of F onto the motion direction — why cosine and not sine) · `component_does_the_work` (F cos θ as the effective force) · `same_force_less_work` (how the same 20 N can buy fewer joules)

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational: STATE_1 → STATE_3   # "what is work / define work" — contains PRIMARY aha (S2) ✓
  quantitative: STATE_4             # "calculate the work done by ..."
  vector_form:  STATE_5             # "work as a dot / scalar product"
```

Default aspect `foundational`. Foundational-coverage rule satisfied directly (S2 inside the range — no exit-pill needed). Cross-slice pill after foundational: "Check it with numbers?" → STATE_4.

## 8. Prerequisites (advisory — Rule 23)

Shipped: `newton_second_law` (a constant force produces the motion the states show), `friction_force` (S2's static hold — students met μₛ in Ch.5). Advisory for S5 only: the vectors-chapter scalar/vector groundwork (`scalar_vs_vector`, PCPL track) — and S5 is advanced-ring, so syllabi without it typically hide the state anyway. **This is concept #1 of Ch.6: no chapter-internal prerequisite exists; the forward edges point from this concept to #2–#12.** Cliff patches: Block 1.

## 9. Real-world anchor (Rule 35 universal · Rule 38f widest-overlap · Rule 41 plain)

**Primary — a rolling suitcase pulled by its tilted handle.** Everyone who has crossed an airport or a train station has pulled a wheeled suitcase: the hand pulls along the slanted handle, but the case moves horizontally along the floor. The pull and the motion point in different directions — and only the along-the-floor part of the pull moves the case. That is `W = F·d·cos θ` acting in the student's own hand, on every syllabus, in every country: no place, brand, currency or festival named. It is physics-true at full depth (the handle angle genuinely sets cos θ; the vertical part of the pull genuinely lightens the load on the wheels — which is exactly SEAM N's `N = mg − F sin θ` physics running under S3).

**Secondary — pushing against a stalled car (or a wall) that does not move.** Arms shaking, fully tired — and the physics work done on the car is exactly zero, because it moved zero distance. Universal, and it IS S2's beat: the body burns energy internally, but no force moved its point of application through any displacement.

The source catalog's anchors for this topic (railway-station porter, named-resort chairlift, ISRO casings) are PRE-Rule-35 India-specific — NOT imported (survey ⚠ section).

## 10. Definition of Done (Gate 0 — no TBDs)

**(a) States:** the 6 states of §2, exactly as tabled in §3.

**(b) Symbol-label table — the ENGINE'S REAL strings (F5), every narrated quantity → exact on-canvas text, Unicode (Rule 34c):**

| Narrated quantity | On-canvas rendering (engine-true) |
|---|---|
| work-panel header | **engine-hardcoded `"Work done"`** (`nlb_wk_cap`, L43198) — NOT authorable; do not author a duplicate "Work…" heading anywhere |
| work done by the pull | signed work bar; authored accumulator `label: "by the pull"` → bar caption reads `by the pull` under the `Work done` header; the bar's own numeric is BARE: `20.0 J` (never `W = 20.0 J`) |
| checkpoint stamp (S4 only) | `nlbCpStampText` = `head + ":  W " + label + " = " + value` (L44215-44236) → renders **`flag at 2 m:  W by the pull = 40.0 J`** — the label is chosen so `"W " + label` is English (Rule 41) |
| applied force | F arrow (full \|F\| length per SEAM N — the arrow is the handle), HUD `F = 20 N` |
| displacement | `d` arrow along the surface, live value `d = 1.00 m` (SEAM N `show_value: true` default) |
| angle of the pull | arc label `θ`, live integer readout `θ = 60°` (½° endpoint quantization, per contract) |
| friction (S2 only) | HUD `f = 36.0 N` at ramp top (engine reports `f = −drive` in static hold, L45362) |
| mass | `m` (slider row only) |
| the unit | narration "joule"; on-canvas only as `J` in values (`1 N·m = 1 J` appears once, inside S1's formula surface line) |
| checkpoint flag (S4 only) | flag `①` with plain label `flag at 2 m`; position authored as arithmetic `s_m = initial_position_m + 2.0` |
| vector form (S5) | `W = F⃗ · d⃗ = F d cos θ` (combining-arrow U+20D7; glyph fallback: bold upright **F**·**d** — see FIT CHECK item V2) |

**(c) Direction-rule plan:** N/A — no right-hand rule (scalar quantity, coplanar mechanics). Direction content is arrow signage only: the F arrow at its authored angle, the d arrow along the surface, and the arc between them.

**(d) Motion plan:** per §3 — every state's motion named. Loops: `loop_reset_ms` on S1/S3/S4/S5 timed to fire BEFORE the track bound (clamp never fires in an authored run); **the loop reset WIPES the checkpoint stamp and every ledger each cycle (the ONE rewind path, L43023) — S4's crossing is therefore authored before 55% of `loop_reset_ms`** (F2 invariant; frozen pin at 60% of loop phase photographs a stamped surface), with physics-author computing crossing time from the authored acceleration; S2 is a `param_ramp` beat on `'F'` holding pose by real static friction (no loop needed — the ramp is the motion; the enum is `'theta'|'F'|'mu_s'|'mu_k'|'m'`, L1577 — F9); S6 free-runs (Rule 37, automatic). One-shot: checkpoint S4 ONLY (`s_m = initial_position_m + 2.0`, `capture: ['W']`, `capture_mode: 'first'` — re-fires per cycle after each loop's re-arm). No delayed-start claim on S1 (F10 — no contracted delay mechanism for a constant force; the cause-first beat is carried by rest-start dynamics).

**(e) Modes:** conceptual-only (Rule 20 [D] — no `mode_overrides`).

**(f)** `assessment` + `coverage_map` authored by physics_author; `misconception_watch` exactly as §4 (2 entries, S2/S3 only). **F8 constraints (promoted from unstated to binding):**
- **(f-1) S2 ramp ceiling:** the static hold is exact (`stuck = … && |drive| ≤ maxStat`, `maxStat = μₛ·N`, L45338/L45358) — a target near μₛN breaks the crate free at the end of the PRIMARY aha state, on the frozen pin. Authored arithmetic: m = 5 kg, μₛ = 0.9 → `maxStat = 0.9 × 49 = 44.1 N`; ramp target **36 N = 0.82·maxStat ≤ the 0.85 ceiling** ✓. The crate cannot creep.
- **(f-2) Friction declared everywhere:** S1/S3/S4/S5 **and S6** are explicitly frictionless (μₛ = μₖ = 0 via the shipped surface keys — json-author uses the exact contract names); S2 alone authors μₛ = 0.9. Without this, S3's 10 N along-drive against μ·31.7 N kills the "half the joules per metre" comparison.
- **(f-3) `work_scale_J`:** ONE shared value across **S1/S3/S4/S5**, sized ≥ 1.1× the largest LOOP peak among them (never the flag's value — overflow clamps the bar and fires `NLB_ENERGY_SCALE_WARN_PREFIX`, L44373, which THE EYE's console audit asserts zero of). Because displacement grows quadratically from rest, the loop peak exceeds the flag value by ≥ (1/0.55)² ≈ 3.3× — physics-author balances stamp legibility by placing S4's crossing close under the 55% bound and MAY author a small initial velocity on S4 to flatten the quadratic (the `b.v0` seed is contracted — the sandbox wrap restores it). S6 authors its OWN larger `work_scale_J` sized to the slider maxima × track span (worst lap ≈ 60 N × 12 m = 720 J → scale ≈ 800 J) so the warn can never fire under any teacher input; the guided-vs-explore scale difference is a declared, acceptable deviation (Rule 32d slope comparability holds within the guided set; explore is exempt from the one-variable rule). Blocks are per-state (SEAM M: "each block is its own gate"), so per-state scales are contracted — physics-author verifies this at authoring, not assumes it.

**(g) Macro↔micro plan (Rule 33):** N/A-with-rationale — the taught variable (work by a visible force through a visible displacement) and its mechanism live at the same macroscopic level; no hidden microscopic story is in scope (where friction's work GOES is #10's micro story, not #1's). Rule 33d instruments DO apply: the work bar carries a live signed numeric, `d` carries its live value, the arc its live degrees, HUD `F`/`f` live — every number a teacher reads at a glance.

**(h) Canvas budget (Rule 34):** ONE formula surface per state (Cambria Math): S1 `W = F·d  (1 N·m = 1 J)` · S2 `W = F·d` retained — its d is zero, that is the story · S3 `W = F·d·cos θ` · S4 `W = F·d·cos θ` + the latched stamp beneath (stored separately as `formula_base` per SEAM M, so the stamp can never eat it) · S5 `W = F⃗ · d⃗ = F d cos θ` (the only multi-term build) · S6 `W = F·d·cos θ` (core form). Caption = the ≤5-word delta cue only; prose in `#capStrip`; HUD value-only; work panel at the LEFT edge inside SEAM L's measured, per-frame-reflow panel (the mid-state-appearing-sibling scar is already engineered out there); corners reserved per 34d. The panel's own header is the engine's hardcoded `Work done` — nothing authored may duplicate it (F5).

**(i) Curriculum-flex block (Rule 38):**
- (i-1) **Cut check 1** (hide advanced → S1–S4 + S6): coherent — nothing in S1–S4/S6 references the scalar product, vector notation, or S5's 30° run. **Cut check 2** (hide advanced + extended → S1–S3 + S6): coherent — S1–S3 never reference the checkpoint-stamp verification (the sole flag lives in S4); S6's formula and controls use only quantities established by S3 (F by S1, θ by S3, m from prerequisite mechanics).
- (i-2) Explore state surfaces CORE content only: `W = F·d·cos θ`, the work bar, d arrow, applied↔surface arc — all established by S3. The vector-form surface and the checkpoint stamp never appear in S6.
- (i-3) `curriculum_tags`: CBSE/NCERT Class 11 Ch.6 (Work, Energy and Power) — **verified** at authoring (38g). IB DP Physics, AP Physics 1, A-Level (AQA/OCR/Edexcel work-energy modules), JEE Main/Advanced, NEET — authored as claims with `needs_teacher_verification: true`.
- (i-4) Preset proposal (hide, never reorder — 38h/25d): `full` = S1–S6 · `standard` (hide advanced) = S1–S4, S6 · `intro` (hide advanced+extended) = S1–S3, S6.
- (i-5) Graph-axis convention: N/A — no graph panel in this concept (the work bar is a signed meter, not a plot). No axis-swap toggle needed.

**(Rule 41 audit of reader-facing strings):** titles — "Work equals force times distance" (S1), "A force with no motion does no work" (S2), "A tilted pull does less work" (S3), "Check the numbers: W = F·d·cos θ" (S4), **"W = F⃗·d⃗: two vectors give one number" (S5 — replaces the cycle-1 topic-label "Work as a scalar product", F4)**, "Explore: change force and angle" (S6). All literal, front-loaded for rail truncation. Banned-register sweep done: no "effort pays off", no "the force fights the friction", no "the crate refuses" — the crate "does not move", friction "balances the pull", the meter "reads zero". Bar label "by the pull" composes with the engine's `W` prefix into the formula's own words (F5).

## ENGINE FIT CHECK (0d — every state mapped to a built, contracted block)

> Scar-candidate-#4 discipline applied: **every row asserting a limit or an absent mechanism quotes BOTH the config-type line and the reader-function line behind it.** Line numbers are the Checkpoint-A machine-extracted evidence against the post-merge 2026-08-01 build.

| # | Needs | Engine block (authoritative contract source) | Status |
|---|---|---|---|
| S1 | 0° pull · d arrow · signed W bar · loop | `bodies[].applied_force_N` (legacy scalar — SEAM N proves this path bit-identical) · `displacement_vector {body_id, label:'d', show_value:true}` (SEAM N; hides below `NLB_DISP_MIN_M = 0.02`) · `work_accumulators: [{force:'applied', label:'by the pull'}]` + per-state `work_scale_J` (SEAM M) · `loop_reset_ms` (SEAM K). No checkpoint (F7) | ✅ all built |
| S2 | force ramp · static hold · f readout · W parked at 0 · hidden d | `param_ramp.param: 'F'` — closed enum `'theta'\|'F'\|'mu_s'\|'mu_k'\|'m'` (config type L1577; F9) · `mu_s` per-state; static hold exact: `maxStat = b.mu_s * N` and `stuck` test (reader L45338/L45358), `f` reported as `−drive` (L45362) · work bar zero-baseline park (SEAM M signed rendering) · d auto-hide (SEAM N) | ✅ all built |
| S3 | angled pull · θ arc · slower W · **live θ slider** | `applied_force: {N:20, angle_deg:60}` (SEAM N; N = mg − F sin θ = 31.7 N > 0, no lift-off) · `angle_arc {from:'applied', to:'surface', show_value:true}` (closed enum, SEAM N) · SEAM N verified `W_applied ≡ F·d·cos θ` to the last printed digit · **`controls_visible: ['F_ang']` + concept-wide `slider_controls.F_ang {min:0, max:85}`** — `slider_controls` is a top-level config key (config type L1877) read by `nlbSc(token)` merging over `NLB_SLIDER_SPEC` defaults (reader L41894+; default −90…180 at L41893 is a DEFAULT, not a fixed range — F3) | ✅ all built |
| S4 | 40 N/60° · flag stamp vs live bar | Same blocks as S3 + `checkpoints: [{s_m: initial_position_m + 2.0, capture:['W'], label:'flag at 2 m'}]` — `s_m` is ABSOLUTE (`b.s >= cp.s_m`, reader L44203; `b.s` seeds from `initial_position_m`, L44543; track −`length_m`…+`length_m`, `NLB_DEFAULT_LEN_M = 6` half-length, L39622/L45050 — F1). Stamp is WIPED per loop cycle (`nlbRunLoopReset` → `nlbResetTrajectory()`, L43023; cp fields cleared L42989-92; `formula_base` re-rendered stampless L43002 — F2) → crossing authored < 55% of `loop_reset_ms`. Stamp text = `head + ":  W " + label + " = " + value` (L44215-44236 — F5). N = 14.4 N > 0 ✓. `slider_controls.F {min:0,max:60}` widens the default −20…+20 (L41881 — F9) | ✅ all built |
| S5 | third angle (20 N/30°) · arc between F and d · vector formula | Same motion blocks at 30° (a = 20·cos30/5 = 3.46 m/s², N = 49 − 10 = 39 N > 0) · `angle_arc {from:'applied', to:'displacement'}` — `'displacement'` in the closed enum (SEAM N); **on a flat forward run it is pixel-identical to `'surface'`** (`'surface'` → `axis.clone()`, L43964; `'displacement'` → `nlbSignedDir(axis, +ds)` ≡ `axis`, L43984 — F4): authored for semantic honesty, NOT claimed as a delta · formula surface = authored `formula_overlay` | ✅ built (see V2) |
| S6 | sandbox · clamped F/θ/m sliders · drag · honest wrap | `mode:'sandbox'` + `trusted_drag_seizes` (pre-existing) · `controls_visible: ['F','F_ang','m']` under the concept-wide `slider_controls` clamps · Rule 37 free-run automatic · **wrap gap covered by the home pose:** the wrap remaps `b.s` but not `b.s0` (reader L45428) while `b.s0` is the `d` arrow's origin — with `initial_position_m = −length_m` the wrap lands on the release point, `\|Δs\| < 0.02` and the arrow hides in the frame the ledger zeroes (F6; engine `b.s0 -= span` = filed ride-along scar, NOT requested) | ✅ all built |
| — | teach W before K — NO `energy_layer` | `eng.energy_active = !!(eng.energy_layer \|\| eng.work_state \|\| eng.checkpoint_state)` (L42747) + panel gate `if (!cfg && !hasWk) { hide }` (L43241) — the work panel lights with no energy bars. Verified TRUE by Checkpoint A; the biggest fit risk, and it holds | ✅ verified |
| — | `deriveStateMeta.ts` co-edit | None: no new scenario_type, reveal key, or cue time — checkpoints and `loop_reset_ms` registered by SEAM M's +58 lines (reveal floor, frozen-pin-at-60%-phase rule, `reveal_hold`). The pin lands mid-slide with ≥1000 ms boundary clearance; the F2 invariant guarantees it lands on a STAMPED surface | ✅ zero edits |

**Accepted limitation (F11 — recorded, deliberately NOT routed):** the `F cos θ` component is never drawn as an object. `show_components` resolves the WEIGHT only and is gated on an inclined surface (config type L1319; reader L40862) — inert on a flat floor, and it cannot decompose the applied force. Drawing it would be an engine edit (0d ALARM territory); the reviewer explicitly declined to route it. The arc, the full-\|F\| arrow at its true tilt, and the distinct bar slopes carry the lesson. Recorded so #2 does not rediscover it.

**✅ V1 RESOLVED 2026-08-01 by the dispatching session — NOT an alarm; json-author needs no probe.**
Read directly from the shipped code rather than inferred from the SEAM M report, exactly as the ALARM RULE demands ("verify, not read"):

- **(a) Loop-reset wrap — the ledger DOES re-zero every cycle.** `nlbRunLoopReset` calls `nlbResetTrajectory()`, commented in place as *"the ONE rewind path"*, funnelling through `nlbSpringPhysReset` — SEAM M note 18a zeroes every `W` accumulator there. **The ledger restarts from 0 at the same instant the `d` arrow does**, so bar and arrow cannot contradict each other. *(Cycle-2 note: the SAME path is what wipes the checkpoint stamp — the F2 invariant is the flip side of this verified behaviour.)*
- **(b) Sandbox teleport — contributes exactly nothing.** `nlbRunWorkAccum` (L44145+) discards it structurally: `if (!isFinite(ds) || Math.abs(ds) > span * 0.5) { b._s_pre = b.s; continue; }` — *"A TELEPORT … is not a displacement and must never be paid for."*
- **Bonus finding relevant to S6:** `b._s_pre` is re-stamped after every input hook, so a teacher's drag between frames is not counted as work done by any of these forces.
- Also confirmed for the withheld #2 content: `nlbWorkForceAlong` returns `0` for `'normal'` unconditionally (L44132).

**🔶 V2 (minor):** the S5 combining-arrow glyphs (`F⃗`, `d⃗`, U+20D7) must be visually verified in the Cambria Math formula surface at THE EYE; contracted fallback authored in the DoD (bold upright **F**·**d**). Not an engine gap either way — pure JSON text choice.

**No red alarms. The 0d success test holds — ZERO renderer edits, verified against source, not asserted.** Not used (correctly): `energy_layer` (no K/U content in #1), `height_markers`, `sum_merge`, spring, `P`/`P_avg`, the `'normal'`/`'friction'`/`'gravity'`/`'net'` work bars (their zero/negative stories are #2's arc — deliberately withheld here).

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

**Prerequisite cliff.** (1) `newton_second_law` missing → breaks at **S1** (why does the crate speed up?): patch with one narration clause "the steady pull keeps the crate speeding up" — the state's claim needs only that force causes the motion, not F = ma. (2) `friction_force` missing → breaks at **S2** (why doesn't it move?): patch with one sentence "the rough floor pushes back with an equal friction force, so the crate stays still" while the `f` readout tracks the ramp — sufficient without re-teaching Ch.5. (3) Vector groundwork missing → **S5**: S5 opens by restating "F and d are both vectors — arrows with direction" in one clause; and S5 is advanced-ring, hidden on syllabi that lack it.

**JEE-backwards trace.** Question: *"A crate is pulled 10 m across a horizontal floor by a 50 N force directed 37° above the horizontal. Find the work done by the applied force."* Needed knowledge → delivering state: work = force through a displacement, in joules (S1) · the pull's angle matters and enters as cos θ (S3) · substituting numbers `W = 50 × 10 × cos 37° = 400 J` (S4 — the stamp-vs-meter beat is exactly this substitution performed live). "Also find the work done by the normal force / by friction" is the standard follow-up — **deliberately out of scope, delivered by #2** (the decomposition boundary, §1). No missing piece within scope.

**Misconception entry mapping (16a).** (1) "effort = work" — arrives with the student (the everyday word), confronted at **S2**; nothing earlier plants it, but **S1 deliberately EARNS its confident over-extension** ("force produces work") one click before S2 breaks the unstated half of it. (2) "all of F counts" — **S1 itself risks planting this** (at 0° the whole force IS along the motion, so `W = F·d` is silently complete); flagged at the planting moment by S1's narration saying "the pull points along the motion" (naming the condition), and killed two clicks later by S3. This adjacency is deliberate. No EPIC-C branches (fallback deferred).

### Block 2 — Aha-moment designation

- **PRIMARY aha (S2):** you can push with all your strength and do exactly zero work — the physics word "work" is not the everyday word "effort"; no displacement, no work. The 10-year memory is the large force arrow over the meter frozen at 0.0 J.
- **SUPPORTING aha (S3):** of the force you apply, only the part pointing along the motion does any work — the same 20 N buys half the joules when tilted to 60°.
- **Cohesion check:** both ahas draw the same boundary — *which* force, through *which* distance, actually counts. S3 is the primary's refinement from "the whole force counts only if something moves" to "and only its along-motion component even then." S4's numbers-agree beat is a consequence/verification beat, deliberately NOT designated an aha (keeps the 1+1 sweet spot).
- **Wrong-belief setup:** for the primary — S1 builds the confident belief "applying a force does work" (true as far as S1 shows it: 1 state before S2). For the supporting — S1+S2 establish "force through distance = work" with the force always aligned, so the residual "so F times d, done" is live and confident entering S3.
- **Foundational-coverage:** S2 ∈ foundational range (S1–S3) ✓.

## Compliance lines

- **DC Pandey / source check:** consulted chapter scope alignment only (Work, Energy and Power TOC placement; the angled-pull opening picture is the universal textbook framing, re-composed fresh). No teaching method, example problem, or figure imported. NCERT = syllabus backbone only; its Indian-context examples not imported (Rule 35; survey ⚠ applied — porter/chairlift/ISRO anchors NOT used).
- **Engine bug queue:** live query unrunnable in the architect dispatch (no shell tool). Directive corpus applied from the seam reports + recorded scars: no-frozen-tail (loops fire before bounds), RESET_TRAJECTORY coverage (ledgers verified to re-arm; the stamp's per-cycle wipe now DESIGNED AROUND, not assumed away — F2), reveal-synced/no hardcoded `*_at_ms` (the stamp is crossing-triggered, not time-stamped), don't-pre-spoil (θ and F clamped concept-wide so the ≥90°/negative regime is unreachable — stronger than cycle 1's withholding), concrete-before-abstract (suitcase pull → meter → formula → vector notation last), `field3d_path_integral_accumulator_bills_a_teleport_as_displacement` (the arrow half now covered by the left-bound home pose — F6). **FLAG for quality-auditor Gate 8:** run `query_engine_bug_queue.ts work_done_by_constant_force` and `--field3d --open` against this skeleton before build.
- **Boundary reconciliation with #2:** recorded in §1; SEAM N's negative-work capability (120° → −20 N) and the `'normal'` zero-bar are verified available and deliberately UNUSED here — and now UNREACHABLE from every control in this concept (the `slider_controls` clamp). They are #2's opening moves.

## Self-review checklist — all items verified

Atomic claim one sentence with explicit, mechanically-enforced #2 boundary ✓ · 6 states in the medium band with justification ✓ · control table complete with archetype/delta/controls/camera/ring/words, one declared pair, no static state, drag-sandbox explore-only ✓ · Rule 32 plan (cause-first via rest-start, one-variable, ≤5-word cues, permanent left-bound home pose — no teleport — single named focal per state) ✓ · every state distinct by IDEA **and PICTURE** (S5 now carries its own θ, arc number and slope — F4) ✓ · Rule 33 N/A-with-rationale + live instruments ✓ · Rule 34 one formula surface per state, stamp under `formula_base`, no authored duplicate of the hardcoded panel header ✓ · Rule 35/38f/41 anchor + full plain-language audit against the ENGINE'S composed strings ✓ · Rule 38 rings ordered, advanced contiguous before explore, BOTH cuts run, explore core-only, tags as claims, presets, axis N/A ✓ · misconception_watch at 2 genuine pivots only, S3's fix naming only what is drawn ✓ · deep-dive picks ×2 with 3 clusters each ✓ · entry_state_map with foundational containing PRIMARY aha ✓ · prerequisites advisory ✓ · DoD zero TBDs, F8's three constraints now binding with arithmetic ✓ · Block 1 + Block 2 complete ✓ · **ENGINE FIT CHECK: every state mapped to a built contract; every asserted limit/absence quotes its config-type line AND reader-function line (scar candidate #4); zero renderer edits; the false cycle-1 premise (fixed `F_ang` range) purged and the decision re-made on the verified `slider_controls` contract** ✓.

---

**Handoff:** Checkpoint A cycle 2 of 2 — all 3 P1, all 5 P2, and F9/F10 addressed; F11 recorded as the reviewer's accepted limitation. Physics-author's inputs: exact per-state `length_m`/m/F/`loop_reset_ms` against the F2 crossing-before-55% invariant and the bounding discipline (clamp never fires in an authored run; optional small `v0` on S4 to flatten the quadratic loop peak), the shared guided `work_scale_J` (≥1.1× the largest guided loop peak) + S6's own sandbox scale (≥ slider-maxima × span), narration within the tabled word budgets, `assessment` + `coverage_map`. json-author authors flags and the home pose from the §3 arithmetic ONLY (`initial_position_m = −length_m`; `s_m = initial_position_m + d_target`), the two `slider_controls` clamps, and the accumulator `label: "by the pull"` verbatim.

---

## Dispatching-session arithmetic verification (2026-08-01, cycle 2)

Every number in the cycle-2 revision recomputed independently before persistence:

| State | F, θ | N = mg − F sin θ | lift-off? | bar slope F cos θ | a = slope/m |
|---|---|---|---|---|---|
| S1 | 20 N, 0° | 49.00 N | no | **20.00 J/m** | 4.000 m/s² |
| S3 | 20 N, 60° | 31.68 N | no | **10.00 J/m** | 2.000 m/s² |
| S4 | 40 N, 60° | 14.36 N | no | **20.00 J/m** | 4.000 m/s² |
| S5 | 20 N, 30° | 39.00 N | no | **17.32 J/m** | 3.464 m/s² |

All N > 0, so the SEAM N lift-off clamp never fires anywhere ✓. S2 ramp: `maxStat = 0.9 × 49 = 44.10 N`, target 36 N = **0.816·maxStat**, inside the authored ≤0.85 ceiling ✓. S4 stamp `40 × 2.0 × cos 60° = 40.0 J` ✓. S6 worst lap `60 N × 12 m = 720 J`, so the authored ≈800 J sandbox scale cannot overflow ✓.

**⚠ One observation raised to Checkpoint A cycle-2 review, not resolved here:** S4's bar slope (20.00 J/m) and acceleration (4.000 m/s²) are **identical to S1's** — doubling F while halving cos θ lands back on S1's numbers exactly. S4's declared delta is the stamp/prediction agreement, not the slope, so this is not a claimed-delta failure like F4 was. But S4 and S1 will *move* at the same rate and their bars will *climb* at the same rate, differing only by the arc, the arrow tilt and the stamp — which is adjacent to the F4/R1 information-gain class the reviewer flagged. Flagged for the reviewer to rule on; a one-line fix exists if wanted (e.g. S4 at 40 N/45° → 28.28 J/m, a fourth distinct slope, stamp `40 × 2.0 × cos 45° = 56.6 J`).
