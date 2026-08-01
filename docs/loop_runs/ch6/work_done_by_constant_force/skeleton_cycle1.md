# ARCHITECT SKELETON — `work_done_by_constant_force`

> Chapter: Class 11 Ch.6 Work, Energy and Power · concept **#1** of 12 (approved teaching order, founder 2026-08-01)
> Renderer: `field_3d` / `newtons_laws_body` + energy layer (Phase-0c COMPLETE, PR #14 merge commit `5dd8287`) — **this is a 0d pure-JSON concept; SEAM N was built for it. Design target: ZERO renderer edits.**
> Authoritative config contracts: `docs/loop_runs/ch6_state.md` §"SEAM K/L/M/N RESULT" — per 0c doctrine those REPORTS supersede any literal in this skeleton.
> Doctrine: Rules 16a · 19 · 23 · 24 · 25 · 31 · 32 · 33 · 34 · 35 · 38 · 41. Conceptual-only (Rule 20 [D]); EPIC-C branches: none.
> Authored 2026-08-01 by `architect` (Fable 5). Shape cloned from the Checkpoint-A-passed exemplar `conservation_of_mechanical_energy/skeleton.md`.

## 1. Atomic claim

This concept teaches ONE idea: work done by a constant force is `W = F·d·cos θ` — force, the displacement it acts through, and only the component of the force along that displacement — and only that. It does NOT cover the sign taxonomy of work (positive vs negative vs zero work across the three angle regimes, friction's negative work, the normal force's zero work — ALL deferred to `positive_negative_zero_work`, #2), kinetic energy (#3), the work–energy theorem (#4), or power (#11/#12). **Boundary decision, stated deliberately:** #1 owns the definition, the joule, the "no displacement → no work" case (zero via `d = 0`, which is definitional), and the cos θ resolution for 0° ≤ θ < 90°; #2 owns everything at and past 90° (zero via θ = 90° and negative work — SEAM N's verified 120° → −20 N case is #2's arc, not touched here).

## 2. State count + arc — 6 states (5 guided + 1 explore)

Medium-simple concept, at the low end of medium (§5 calibration: simple 3–4, medium 5–6) — justified: it is the chapter's definitional opener carrying four separable ideas (product definition + unit · displacement requirement · angle resolution · numeric verification) plus one advanced notation state and the explore. Fewer states would fuse the misconception beat into the definition beat; more would pad (the sign cases that could fill states 7–8 belong to #2 by the approved decomposition).

| # | id | Ring | Purpose (one line) | teaching_method |
|---|---|---|---|---|
| S1 | `pull_and_move` | core | A steady pull moves a crate along the floor; the work meter grows with the distance — `W = F·d`, and 20 N through 1 m stamps 20 J: the joule | (straightforward beat) |
| S2 | `force_without_motion` | core | The same hard pull on a crate that does not move: the work meter holds exactly 0.0 J — **PRIMARY aha**, 16a contrast beat | misconception_confrontation |
| S3 | `tilted_pull` | core | The same pull tilted upward: the crate still moves, but the work meter climbs slower for the same floor distance — only the along-motion part counts: `W = F·d·cos θ` | misconception_confrontation (16a beat #2) |
| S4 | `numbers_agree` | extended | The formula predicts, the meter measures: at the flag, `40 × 2.0 × cos 60° = 40 J` stamps and the running total reads the same number | (straightforward beat) |
| S5 | `scalar_product` | advanced | The same picture in vector notation: the angle re-anchored between the F arrow and the d arrow, `W = F⃗·d⃗` — one number from two arrows | derivation_first_principles |
| S6 | `explore` | core (explore) | Sandbox: drag the crate, change F, θ, m — work meter, d arrow and angle arc all live | exploration_sliders |

Rule 38a: qualitative (S1–S3) → quantitative (S4) → notation/derivation (S5); the advanced ring (S5) is one contiguous block immediately before the explore state. The hook MOVES at S1 (pull begins ~0.8 s in — no static setup state).

## 3. Per-state choreography + control table (Rule 31 — REQUIRED artifact)

**Home pose (Rule 32d — PERMANENT, never rebuilt):** flat floor (`surface.theta_deg: 0` — same code path as the shipped concepts), one crate (m = 5 kg) at the left third of the track, **work-meter panel at the screen LEFT edge** (this is SEAM L's measured panel; SEAM M's work bars live inside it and inherit its reflow ladder — F12 precedent), formula surface top-centre, HUD value-only. The apparatus never teleports; θ of the SURFACE never changes (the angle in this concept is the angle of the PULL, not of the floor); at every click the only visible change IS the state's new thing. Cause-before-effect (32a): in every guided state the force arrow appears/acts first, the crate responds, the meter follows.

**Bounding discipline (exemplar-F3 discipline):** the crate NEVER reaches the track bound in any guided state — `loop_reset_ms` is authored to fire first (physics-author computes: loop distance < track half-extent at each state's acceleration). The geometric clamp (`nlbBoundsM`) must never fire; a clamped stop would render as "force applied, no work" without the physics that S2 earns honestly through static friction.

| # | Teaches | Archetype | Distinct motion | Delta (≤5-word cue) | Controls | Camera (side-on) | Ring | Words |
|---|---|---|---|---|---|---|---|---|
| S1 | Work = force × distance moved; the joule | `translate-through` | Steady 20 N pull at 0° starts the crate from rest; `d` arrow stretches from the release point with live value; the signed work bar climbs in step with it; crossing the flag at s = 1 m stamps `W = 20.0 J` under the formula — "20 newtons through 1 metre is 20 joules"; `loop_reset_ms` restarts before the bound | "Force times distance" | none | `[0, 2.0, 10]` → crate + flag framed | core | 40–55 |
| S2 | No displacement → no work, whatever the force | `null-result-hold` | Rough floor (μₛ high, this state only): the pull RAMPS up (`param_ramp` on the legacy scalar `applied_force_N`, 0 → just under μₛmg); the F arrow grows large, the `f` readout climbs to match it, the crate never moves, **no `d` arrow ever appears** (engine hides it below 0.02 m — the hide IS the lesson), the work bar stays parked on its zero line at `0.0 J` | "No distance, no work" | none | `[0, 2.0, 10]` → crate centred | core | 35–50 |
| S3 | Only the along-motion component of the pull does work: cos θ | `translate-through` — **declared contrast pair with S1** (delta names the flip: same force, now tilted) | Same 20 N pull, now at 60° above the floor (`applied_force: {N: 20, angle_deg: 60}`); `angle_arc` from `'applied'` to `'surface'` with live `θ = 60°`; crate moves, `d` arrow stretches, but the work bar climbs at HALF the joules per metre of S1 (cos 60° = ½); formula surface becomes `W = F·d·cos θ` | "Tilted pull: less work" | none — see the deliberate-decision note below | `[0, 2.0, 10]` → arc + crate framed | core | 40–55 |
| S4 | The formula's prediction equals the meter's measurement | `flow-along-path` | 40 N at 60°: the crate flows past the checkpoint flag at s = 2.0 m; crossing stamps `W = 40.0 J` under the formula (latched, end-pose rule); the live work bar reads the same 40.0 J at that instant — prediction and measurement are one number; loop re-runs, stamp holds | "The numbers agree" | none | `[0, 2.0, 10]` → flag + meter both framed | extended | 40–55 |
| S5 | W is a scalar product of two vectors: `W = F⃗·d⃗ = F·d·cos θ` | `reveal-build` | Same 40 N / 60° run; the angle arc RE-ANCHORS from `'applied'`↔`'surface'` to `'applied'`↔`'displacement'` (the θ between the two arrows themselves); the vector formula surface builds its three factors live as the pull runs — \|F\| fixed, \|d\| growing, cos θ fixed — collapsing two arrows into one signed number | "Two arrows, one number" | none | `[0, 2.0, 10]` → both arrows + arc framed | advanced | 35–50 |
| S6 | Teacher's sandbox | `drag-sandbox` | `mode: 'sandbox'`: trusted drag on the crate; F, θ, m sliders live; work bar, `d` arrow, angle arc and HUD all update continuously; free-runs forever (Rule 37, automatic) | "Change anything" | ALL: F (applied-force magnitude), `F_ang` (θ), m (+ drag) | `[3, 2.5, 9]` → mild oblique (drag depth) | core | 0 / open |

Archetype audit: `translate-through` ×2 (S1/S3, **declared pair**) · `null-result-hold`, `flow-along-path`, `reveal-build`, `drag-sandbox` ×1 each. No static state (S2's CAUSE — the ramping force arrow and the tracking `f` readout — moves throughout; the stillness of the crate is the taught content, the Rule 16a contrast pattern's canonical form); no undeclared repeat; drag-sandbox explore-only.

**Glow focal (32e — exactly one per state):** S1 = `displacement_vector` (the growing d is the new thing) · S2 = `work_bar_applied` (the zero bar IS the point) · S3 = `angle_arc` · S4 = `checkpoint_1` · S5 = the formula surface · S6 = none/body.

**Deliberate design decision (for Checkpoint A):** S3 carries NO θ slider. The `'F_ang'` control token's range is **engine-fixed at −90…180** (SEAM N contract) and per-state range clamping is not a contracted mechanism; putting it on the guided cos-θ state would let one drag past 90° flip the work bar negative — pre-spoiling #2's entire arc (the recorded don't-pre-spoil directive). This is designing WITHIN the built engine per 0d doctrine, not a gap: the θ manipulation lives in S6, where a curious teacher dragging past 90° sees the bar dip below zero — declared acceptable in the open sandbox (the narration never addresses it; #2 formalizes it one concept later). A per-state slider-range override would be a nice-to-have future token feature, NOT needed for this chapter — do not open a surgeon dispatch for it.

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots, no per-state tic)

| Wrong belief (real, documented) | State | `misconception_watch` beat |
|---|---|---|
| "Pushing hard IS doing work — effort equals work, even if nothing moves" (the everyday meaning of the word) | S2 | `belief`: applying a force is doing work · `visual_counter`: the F arrow ramps large, the friction readout climbs to match, the crate never moves, no d arrow ever appears, the work meter holds exactly 0.0 J · `one_line_fix`: work needs displacement — zero distance means zero work, whatever the force |
| "The whole force does work: W = F·d for any direction of pull" | S3 | `belief`: all of F counts regardless of its direction · `visual_counter`: the identical 20 N pull, tilted to 60°, buys only half the joules per metre — the bar-vs-d-arrow pairing visibly slows while F stays 20 N · `one_line_fix`: only the component of the force along the motion does work — that is the cos θ |

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

**(b) Symbol-label table** (every narrated quantity → exact on-canvas label, Unicode — Rule 34c):

| Narrated quantity | On-canvas label |
|---|---|
| work done by the pull | signed work bar, label "Work by the pull" (SEAM M plain-English label), value `W = 20.0 J` |
| applied force | F arrow (full \|F\| length per SEAM N — the arrow is the handle), HUD `F = 20 N` |
| displacement | `d` arrow along the surface, live value `d = 1.00 m` (SEAM N `show_value: true` default) |
| angle of the pull | arc label `θ`, live integer readout `θ = 60°` (½° endpoint quantization, per contract) |
| friction (S2 only) | HUD `f = 18.5 N` (existing readout) |
| mass | `m` (slider row only) |
| the unit | narration "joule"; on-canvas only as `J` in values (`1 N·m = 1 J` appears once, inside S1's formula surface line) |
| checkpoint flag (S1, S4) | flag `①` with plain label "flag at 1 m" / "flag at 2 m"; stamp `W = 40.0 J` |
| vector form (S5) | `W = F⃗ · d⃗ = F d cos θ` (combining-arrow U+20D7; glyph fallback: bold upright **F**·**d** — see FIT CHECK item V2) |

**(c) Direction-rule plan:** N/A — no right-hand rule (scalar quantity, coplanar mechanics). Direction content is arrow signage only: the F arrow at its authored angle, the d arrow along the surface, and the arc between them (S5).

**(d) Motion plan:** per §3 — every state's motion named. Loops: `loop_reset_ms` on S1/S3/S4/S5 timed to fire BEFORE the track bound (clamp never fires); S2 is a `param_ramp` beat holding pose by real static friction (no loop needed — the ramp is the motion); S6 free-runs (Rule 37, automatic). One-shots: checkpoint stamps S1 (`s_m: 1.0, capture: ['W']`) and S4 (`s_m: 2.0, capture: ['W']`), `capture_mode: 'first'`, latched under `formula_base` (SEAM M end-pose rule), re-armed on `RESET_TRAJECTORY`.

**(e) Modes:** conceptual-only (Rule 20 [D] — no `mode_overrides`).

**(f)** `assessment` + `coverage_map` authored by physics_author; `misconception_watch` exactly as §4 (2 entries, S2/S3 only).

**(g) Macro↔micro plan (Rule 33):** N/A-with-rationale — the taught variable (work by a visible force through a visible displacement) and its mechanism live at the same macroscopic level; no hidden microscopic story is in scope (where friction's work GOES is #10's micro story, not #1's). Rule 33d instruments DO apply: the work bar carries a live signed numeric, `d` carries its live value, the arc its live degrees, HUD `F`/`f` live — every number a teacher reads at a glance.

**(h) Canvas budget (Rule 34):** ONE formula surface per state (Cambria Math): S1 `W = F·d  (1 N·m = 1 J)` · S2 `W = F·d` retained — its d is zero, that is the story · S3 `W = F·d·cos θ` · S4 `W = F·d·cos θ` + the latched stamp beneath (stored separately as `formula_base` per SEAM M, so the stamp can never eat it) · S5 `W = F⃗ · d⃗ = F d cos θ` (the only multi-term build) · S6 `W = F·d·cos θ` (core form). Caption = the ≤5-word delta cue only; prose in `#capStrip`; HUD value-only; work panel at the LEFT edge inside SEAM L's measured, per-frame-reflow panel (the mid-state-appearing-sibling scar is already engineered out there); corners reserved per 34d.

**(i) Curriculum-flex block (Rule 38):**
- (i-1) **Cut check 1** (hide advanced → S1–S4 + S6): coherent — nothing in S1–S4/S6 references the scalar product, vector notation, or the applied↔displacement arc. **Cut check 2** (hide advanced + extended → S1–S3 + S6): coherent — S1–S3 never reference the checkpoint-stamp verification (S1's own 1 m stamp is self-contained and taught in S1); S6's formula and controls use only quantities established by S3 (F by S1, θ by S3, m from prerequisite mechanics).
- (i-2) Explore state surfaces CORE content only: `W = F·d·cos θ`, the work bar, d arrow, applied↔surface arc — all established by S3. The vector-form surface and checkpoint stamps never appear in S6.
- (i-3) `curriculum_tags`: CBSE/NCERT Class 11 Ch.6 (Work, Energy and Power) — **verified** at authoring (38g). IB DP Physics, AP Physics 1, A-Level (AQA/OCR/Edexcel work-energy modules), JEE Main/Advanced, NEET — authored as claims with `needs_teacher_verification: true`.
- (i-4) Preset proposal (hide, never reorder — 38h/25d): `full` = S1–S6 · `standard` (hide advanced) = S1–S4, S6 · `intro` (hide advanced+extended) = S1–S3, S6.
- (i-5) Graph-axis convention: N/A — no graph panel in this concept (the work bar is a signed meter, not a plot). No axis-swap toggle needed.

**(Rule 41 audit of reader-facing strings):** titles — "Work equals force times distance" (S1), "A force with no motion does no work" (S2), "A tilted pull does less work" (S3), "Check the numbers: W = F·d·cos θ" (S4), "Work as a scalar product" (S5), "Explore: change force and angle" (S6). All literal, front-loaded for rail truncation. Banned-register sweep done: no "effort pays off", no "the force fights the friction", no "the crate refuses" — the crate "does not move", friction "balances the pull", the meter "reads zero". "Work by the pull" (bar label) uses the word the formula uses.

## ENGINE FIT CHECK (0d — every state mapped to a built, contracted block)

| # | Needs | Engine block (authoritative contract source) | Status |
|---|---|---|---|
| S1 | 0° pull · d arrow · signed W bar · 1 m stamp · loop | `bodies[].applied_force_N` (legacy scalar — SEAM N proves this path bit-identical) · `displacement_vector {body_id, label:'d', show_value:true}` (SEAM N) · `work_accumulators: [{force:'applied', label}]` + `work_scale_J` (SEAM M) · `checkpoints: [{s_m:1.0, capture:['W'], label}]` (SEAM M) · `loop_reset_ms` (SEAM K) | ✅ all built |
| S2 | force ramp · static hold · f readout · W parked at 0 · hidden d | `param_ramp` on `applied_force_N` (pre-existing, shipped-concept mechanism) · `mu_s` per-state (pre-existing) · `readouts: ['F_applied','f']` (pre-existing) · work bar zero-baseline park (SEAM M signed rendering) · d auto-hides below 0.02 m (SEAM N) | ✅ all built |
| S3 | angled pull · θ arc to surface · slower W | `applied_force: {N:20, angle_deg:60}` (SEAM N; N = mg − F sin θ = 31.7 N > 0, no lift-off) · `angle_arc {from:'applied', to:'surface', show_value:true}` — `'surface'` exists in the closed enum precisely for this state (SEAM N) · same accumulator; SEAM N verified `W_applied ≡ F·d·cos θ` to the last printed digit | ✅ all built |
| S4 | 40 N/60° · 2 m stamp vs live bar | Same blocks as S3 + `checkpoints` (SEAM M; stamp appends under `formula_base`, latch + `RESET_TRAJECTORY` re-arm contracted). N = 14.4 N > 0 ✓ | ✅ all built |
| S5 | arc between F and d · vector formula | `angle_arc {from:'applied', to:'displacement'}` — `'displacement'` is in the closed enum (SEAM N) · formula surface = authored `formula_overlay` (existing) | ✅ built (see V2) |
| S6 | sandbox · F/θ/m sliders · drag | `mode:'sandbox'` + `trusted_drag_seizes` (pre-existing) · `controls_visible: ['F_ang', <existing applied-force magnitude token>, <existing m token>]` (SEAM N + pre-existing tokens — json-author uses the exact shipped token names) · Rule 37 free-run automatic | ✅ built (see V1) |
| — | `deriveStateMeta.ts` co-edit | None expected: no new scenario_type, no new reveal key, no new cue time — checkpoints and `loop_reset_ms` were registered by SEAM M's +58 lines (reveal floor, frozen-pin-at-60%-phase rule, `reveal_hold` classification). Frozen pins land mid-slide, offset ≥1000 ms from every loop boundary by the contracted pin formula. | ✅ zero edits — the 0d success test holds on paper |

**🔶 VERIFY-BEFORE-BUILD V1 (the one honest amber — do not skip):** the **wrap semantics of `work_accumulators` are uncontracted in two places**. (a) On a `loop_reset_ms` wrap (S1/S3/S4/S5): the contract states the RESET_TRAJECTORY behaviour (ledger re-zeroes — proven to the digit) and the checkpoint `_side` re-adoption on wrap, but does NOT state whether the W ledger re-zeroes each loop cycle. If it does not, the bar climbs across cycles while the d arrow resets — bar and arrow would contradict each other, which fails the concept's own claim. (b) On `nlbSandboxWrap` (S6): the teleport re-seeds `s` outside the integrator; if the accumulator sums `F·Δs` only over integrator steps (likely, and consistent with how checkpoints adopt-without-firing on wrap) the teleport contributes nothing — but it is not written down. **json-author must probe both with a 2-minute driver before authoring around them. If the ledger does NOT re-zero on loop wrap and does not ignore the sandbox teleport, that is a genuine 0d ALARM: STOP and re-scope with `peter_parker:field3d_surgeon` — do not fix in JSON, do not extend the engine per concept.** (My read of the SEAM M report says both behave correctly; the ALARM RULE says verify, not read.)

**✅ V1 RESOLVED 2026-08-01 by the dispatching session — NOT an alarm; json-author needs no probe.**
Read directly from the shipped code rather than inferred from the SEAM M report, exactly as the
ALARM RULE demands ("verify, not read"):

- **(a) Loop-reset wrap — the ledger DOES re-zero every cycle.** `nlbRunLoopReset` (renderer
  L43014–43027) calls `nlbResetTrajectory()`, commented in place as *"the ONE rewind path"*, which
  funnels through `nlbSpringPhysReset` — SEAM M note 18a zeroes every `W` accumulator there. It
  preserves `eng.t_ms` across the rewind so the master clock stays monotonic, and re-adopts
  `_loop_cycle` AFTER the rewind (which nulls it). **The ledger restarts from 0 at the same instant
  the `d` arrow does**, so the bar and the arrow cannot contradict each other. The accumulator's own
  header states it: *"The wrap ALSO funnels through `nlbSpringPhysReset`, so the ledger restarts from
  0 at the same instant the energy baseline does."*
- **(b) Sandbox teleport — contributes exactly nothing.** `nlbRunWorkAccum` (L44145+) discards it
  structurally: `if (!isFinite(ds) || Math.abs(ds) > span * 0.5) { b._s_pre = b.s; continue; }` —
  *"A TELEPORT (the sandbox wrap, a loop reset, a bound clamp remap) is not a displacement and must
  never be paid for."*
- **Bonus finding relevant to S6:** `b._s_pre` is re-stamped after every input hook, so **a teacher's
  drag between frames is not counted as work done by any of these forces**. The sandbox's drag
  affordance cannot inflate the meter — which the S6 design silently depends on.
- Also confirmed for the withheld #2 content: `nlbWorkForceAlong` returns `0` for `'normal'`
  unconditionally (L44132, *"exactly zero work, always"*).

**Consequence: the 0d success test holds for concept #1 — ZERO renderer edits, verified against
source, not asserted.**

**🔶 V2 (minor):** the S5 combining-arrow glyphs (`F⃗`, `d⃗`, U+20D7) must be visually verified in the Cambria Math formula surface at THE EYE; contracted fallback authored in the DoD (bold upright **F**·**d**). Not an engine gap either way — pure JSON text choice.

**No red alarms.** Every state renders on `applied_force` / `applied_force_N`, `displacement_vector`, `angle_arc`, `work_accumulators` + `checkpoints`, `param_ramp`, `loop_reset_ms`, `mode:'sandbox'`. Not used (correctly): `energy_layer` (no K/U content in #1 — bars would pre-teach #3/#7), `height_markers`, `sum_merge`, spring, `P`/`P_avg`, the `'normal'`/`'friction'`/`'gravity'`/`'net'` work bars (their zero/negative stories are #2's arc — deliberately withheld here).

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
- **Engine bug queue:** live query unrunnable in the architect dispatch (no shell tool). Directive corpus applied from the seam reports + recorded scars: no-frozen-tail (loops fire before bounds), RESET_TRAJECTORY coverage (stamps/ledgers contracted to re-arm), reveal-synced/no hardcoded `*_at_ms` (checkpoint stamps are crossing-triggered, not time-stamped), don't-pre-spoil (F_ang withheld from guided states; negative work never shown), concrete-before-abstract (suitcase pull → meter → formula → vector notation last). **FLAG for quality-auditor Gate 8:** run `query_engine_bug_queue.ts work_done_by_constant_force` and `--field3d --open` against this skeleton before build.
- **Boundary reconciliation with #2:** recorded in §1; SEAM N's negative-work capability (120° → −20 N) and the `'normal'` zero-bar are verified available and deliberately UNUSED here — they are #2's opening moves.

## Self-review checklist — all items verified

Atomic claim one sentence with explicit #2 boundary ✓ · 6 states in the medium band with justification ✓ · control table complete with archetype/delta/controls/camera/ring/words, one declared pair, no static state (S2's cause ramps), drag-sandbox explore-only ✓ · Rule 32 plan (cause-first, one-variable, ≤5-word cues, permanent home pose — flat floor never changes, no teleport — single named focal per state) ✓ · every state distinct by IDEA, not just archetype (S3 = the angle exists; S4 = the formula's number is the meter's number; S5 = the notation) ✓ · Rule 33 N/A-with-rationale + live instruments ✓ · Rule 34 one formula surface per state, stamps under `formula_base` ✓ · Rule 35/38f/41 anchor + full plain-language title audit ✓ · Rule 38 rings ordered, advanced contiguous before explore, BOTH cuts run, explore core-only, tags as claims, presets, axis N/A ✓ · misconception_watch at 2 genuine pivots only ✓ · deep-dive picks ×2 with 3 clusters each ✓ · entry_state_map with foundational containing PRIMARY aha ✓ · prerequisites advisory, forward-edge status stated ✓ · DoD zero TBDs ✓ · Block 1 + Block 2 complete ✓ · **ENGINE FIT CHECK: every state mapped to a built contract, zero renderer edits expected, two amber VERIFY items named loudly with explicit STOP-and-re-scope escalation, zero silent design-arounds** ✓.

---

**Handoff:** route to founder-proxy Checkpoint A. The three decisions most worth its scrutiny, made explicit above: (1) PRIMARY aha placed on the d=0 beat (S2) rather than the formula beat — argued in Block 2; (2) no θ slider on any guided state because the `'F_ang'` token's range is engine-fixed past 90° — argued in §3; (3) the θ=90° endpoint ceded entirely to #2 — argued in §1. Physics-author's inputs after A: exact per-state m/F/loop timings against the track extent (constraint: clamp never fires), narration within the tabled word budgets, `assessment` + `coverage_map`, and the V1 wrap-semantics probe result recorded before json-author starts.
