# ARCHITECT SKELETON — `connected_bodies` (NEW, on the frozen `newtons_laws_body` engine)
# Chapter: Laws of Motion (Class 11) · renderer: field_3d / scenario `newtons_laws_body` · 2026-07-25
# Engine contract: docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md §1/§2 Branch B/§3/§4/§6 row 6 +
# docs/loop_runs/phase0_engine_report.md §6 + docs/loop_runs/lom/free_body_diagram/engine_gap.md (GAPs 1–3).
# CONFIGURATION ONLY — zero renderer edits. Anything beyond the closed enums = ENGINE GAP CANDIDATES (end).

## 1. Atomic claim
This concept teaches how an inextensible string over an ideal pulley couples two bodies — one shared
|a|, one T throughout, T ≠ either weight, solved by one equation per body — and only that; it does
NOT cover drawing the FBD itself (prerequisite `free_body_diagram`), single-body incline dynamics
(deferred to `block_on_incline`), or multi-pulley / massive-string systems (out of chapter scope).

## 2. State count + arc — 7 states (complex; §5 calibration 7–9 justified: coupled Branch B physics
plus two structural variants — incline+hanging and Atwood — that JEE treats as standard)
Arc: shared speed → same T both ends (earns the wrong belief) → T ≠ m₂g (breaks it) → one equation
per body → incline variant → Atwood/counterweight → sandbox.

- S1 hook — one rope, one motion: both v readouts identical (connected_incline_hanging, θ=0)
- S2 the rope pulls BOTH ways with one T; balanced glide reads T = m₂g — the earned wrong belief
- S3 release frictionless: T drops below m₂g the moment a ≠ 0 — misconception contrast (PRIMARY aha)
- S4 solve it: one equation per body, eliminate T (phases[] glow-walk) — teaching_method omitted
  (straightforward beat) on S1–S6; S7 teaching_method: exploration_sliders
- S5 same rig on a slope + friction: slope steals from the pull, a shrinks, T rises (θ=30 static — GAP 1)
- S6 Atwood: both hanging (surface.hidden), near-equal masses creep; T sits BETWEEN the two weights
- S7 sandbox

`advance_mode`: S1–S6 `manual_click`, S7 `interaction_complete` → 2 distinct (Gate 12 / Rule 15).
Never `wait_for_answer` / `pause_after_ms`. Rule 20: NO `mode_overrides`. EPIC-C branches: ZERO.
Rule 19: ≥3 primitives per state by construction (surface + 2 bodies + pulley post/wheel/ropes +
arrows + label sprites + HUD).

## 3. Per-state control table (Rule 31 — REQUIRED design artifact)

| S | Teaches | Archetype | Delta cue (≤5 words) | controls_visible | EN words |
|---|---|---|---|---|---|
| 1 | The string makes two bodies ONE system: same speed, same \|a\|, always | `coupled-glide` (coined: two bodies rigidly linked by an inextensible rope move as one continuous motion that turns the corner at the pulley — no seed archetype names constraint-coupled motion) | "One rope, one motion" | — | 30–45 |
| 2 | The ideal rope carries ONE tension — it pulls A forward and B up with the same T | `reveal-build` | "Same T at both ends" | — | 35–50 |
| 3 | T is NOT the hanging weight — the moment a ≠ 0, T = m₂(g−a) < m₂g | `translate-through` (real A slides past its frozen ghost — the wrong expectation's consequence) | "T is not m₂g" | m2 | 40–55 |
| 4 | One equation per body, add them, T cancels: a = m₂g/(m₁+m₂) | `glow-walk` (coined: phased focal traversal — the emphasis travels arrow→arrow→formula in derivation order via phases[], engine-native glow choreography; the traveling focus IS the motion after the opening release) | "Two bodies, two equations" | m, m2 | 40–55 |
| 5 | On a slope, gravity's along-slope pull + friction oppose the drive: a shrinks, T rises | `coupled-glide` (DECLARED CONTRAST PAIR with S1 — same coupled glide, delta names the flip: constant-v flat run becomes a slow uphill creep because the slope and friction now steal from m₂g) | "Slope steals the pull" | theta, mu_k | 35–50 |
| 6 | Two hanging weights: the DIFFERENCE drives; T lies between the two weights | `mirror-descent` (coined: anti-symmetric paired vertical motion — one body down, its partner exactly mirrored up; the pulley's sign reversal is the taught content and no seed archetype names it) | "Only the difference drives" | m, m2 | 30–45 |
| 7 | Everything together, teacher-driven | `drag-sandbox` | "All yours" | m, m2, theta, mu_s, mu_k, v0, F (ALL) | 0 / open |

No archetype repeat except the one declared contrast pair (S1/S5).

## 4. Per-state engine spec (closed enums only — spec §1/§2/§6 row 6 + phase0 §6)

Common: inert `field_lines` block (type requires it). EVERY state authors a NEAR SIDE-ON
`camera_position` (phase0 open-decision-2 mitigation). Body ids: `A` (surface body, `hanging` never
set) + `B` (`hanging: true` always) for S1–S5/S7; the Atwood state uses its OWN ids `P`,`Q` (both
`hanging: true`) — a body id's hanging flag is CONSTANT across states (phase0 hard constraint; the
bring-up hit exactly this bug). `pulley.post_position_m` at/near default = `surface.length_m`
(phase0: a mid-ramp post puts rope over the slab). ONE short formula line per state. `glow_focal`
always a specific id, never a bare bodyId.

**Motion-budget arithmetic (compute, don't guess — the FBD framing lesson, coupled edition).** The
dense window = the authored `duration` (clamped 3–60 s; MUST cover real narration — Ch.4 scar
`field3d_state_duration_field_clamps_eye_capture_window`). A from-rest run at acceleration a covers
½at² — so ANY visibly-accelerating state exhausts a ~2 m run budget in t = √(4/a) seconds and then
halts at the track bound (GAP 3 fix makes replay rewind correctly, but there is NO loop — see GAP
CANDIDATE 1). Constant-v states are budgeted like FBD S3: v·duration ≤ run budget. Frame budget:
the scene must hold the pulley corner + B's full drop; json_author calibrates ONE shared camera
distance for S1–S5/S7 with the FBD Playwright projection probe (`s_occlusion ≈ 1.397 × distance`
was flat-ground; recalibrate for the taller pulley scene) — S6 gets its own vertical framing.

| S | mode | bodies / numbers (g = 9.8) | arrows (show) | readouts | formula (one line) | glow_focal | motion budget |
|---|---|---|---|---|---|---|---|
| 1 | `connected_incline_hanging`, θ=0 | A: 4 kg, `mu_k: 0.5` (exact balance: μₖm₁g = 19.6 = m₂g → a = 0), `initial_velocity_mps: 0.35`, `initial_position_m: −4.2` · B: 2 kg, `hanging: true` · `surface.length_m: 7`, pulley default | A: tension · B: weight, tension | `v`, `a` | `\|a₁\| = \|a₂\| = a` | `nlb_rope_a` | constant v 0.35 m/s × 12 s = 4.2 m ✓ full-duration motion |
| 2 | same config as S1 (identical numbers — Rule 32d home pose; glide continues) | A: weight, normal, friction, tension · B: weight, tension | `T` | `T₁ = T₂ = T` | `nlb_arrow_A_tension` | glide continues; T arrows draw in via `phases[]` (glow + arrow visibility timing — never hardcoded `*_at_ms`). **T reads 19.60 N = m₂g here — deliberate: this balanced case EARNS the wrong belief S3 breaks** |
| 3 | `connected_incline_hanging`, θ=0, `surface.frictionless: true` | A: 4 kg from rest, run budget 2.0 m · B: 2 kg · ghost A′ (`ghost: true`, dim) frozen at A's start pose = "the world where T = m₂g and nothing ever moves" | A: tension · B: weight, tension (visibly unequal: 19.6 vs 13.1) | `T`, `a` | `T = m₂(g − a)` | `nlb_arrow_B_tension` | a = m₂g/(m₁+m₂) = 3.27 m/s²; T = 13.07 N vs m₂g = 19.60 N; run 2.0 m done in 1.11 s, then halts at bound ("end of its run") — see GAP CANDIDATES 1–2 |
| 4 | same rig, `mu_k: 0.4` on A | A: 4 kg, μₖ=0.4 · B: 2 kg | A: weight, normal, friction, tension, net · B: weight, tension, net | `a`, `T`, `F_net` | `a = m₂g ∕ (m₁ + m₂)` (frictionless headline; friction variant spoken) | phased: `phases[]` walk `nlb_arrow_A_tension` → `nlb_arrow_B_weight` → `nlb_arrow_A_net`, ONE focal at any instant (32e by construction) | a = (19.6 − 15.68)/6 = 0.65 m/s²; run 2.0 m in 2.47 s, glow-walk continues over the settled rig |
| 5 | `connected_incline_hanging`, `surface.theta_deg: 30` (static tilt — GAP 1: no ramp) | A: 4 kg, `mu_k: 0.2`, `show_components: true` · B: 3 kg | A: weight + components, normal, friction, tension · B: weight, tension | `a`, `T`, `f` | `a = (m₂g − m₁g·sinθ − f) ∕ (m₁+m₂)` | `nlb_comp_A_sin` | D = 29.4 − 19.6 − 6.79 → a = 0.43 m/s²; T = 28.1 N; run 2.0 m creep in 3.05 s |
| 6 | `connected_atwood`, `surface.hidden: true` (exists in renderer, ~L30821) | P: 2.1 kg, `hanging: true` · Q: 2.0 kg, `hanging: true` — OWN ids, never reuse A/B | P: weight, tension · Q: weight, tension | `a`, `T` | `a = (m₁ − m₂)g ∕ (m₁ + m₂)` | `nlb_pulley_wheel` | a = 0.98/4.1 = 0.239 m/s²; T = 20.08 N (BETWEEN 20.58 and 19.60); 1.5 m mirror creep in 3.54 s |
| 7 | `sandbox` | A + B (table rig) | all six kinds live | `a`, `v`, `T`, `f`, `F_net` | `a = ΣF ∕ Σm` | `nlb_body_A` | `trusted_drag_seizes: true`; `idle_auto_sweep {param:'m', range:[<state's own m₁>, …]}` — range[0] = the state's own value (phase0: first frame must not step) |

Rule 32 per state: cause first (B's weight arrow glows before the rig moves in S3; tilt is already
posed in S5 so the CAUSE shown moving is the component arrows drawing before the creep starts);
only the taught variable's motion changes; apparatus persists — pulley post + wheel + ropes are the
home-pose anchor in every state including S6 (where the slab hiding IS the one visible change,
named by the delta cue and narration); ONE specific-id glow focal.
Rule 33: N/A-macro (the taught variable is the constraint itself); the real-number duty is met by
live `T`/`a`/`v` readouts (`N`/`f` auto-suppressed on hanging bodies — engine).
Rule 34: prose in the strip below; on-canvas = delta cue + the ONE formula line + value-only HUD;
all labels Unicode (engine sprites: T, m₁g, m₂g, N, fₖ, ΣF).

## 5. Misconception plan (Rule 16a — pivots only, 3 hooks, EPIC-C = zero)
1. **S3 — "the string's tension equals the hanging weight, T = m₂g."** THE pivot. S2 deliberately
   earned it (balanced glide, T = 19.60 = m₂g). Contrast beat: ghost A′ holds frozen at the start
   (the wrong expectation's consequence — if T balanced m₂g nothing would ever accelerate) while
   the real rig releases and runs; on B the weight arrow (19.6 N) visibly outreaches the tension
   arrow (13.1 N). visual_counter = "the frozen ghost vs the moving rig + T reading 13.07 against
   m₂g = 19.60"; one_line_fix = "T equals m₂g only when a = 0 — acceleration eats the difference."
2. **S1 — "each body has its own motion; the hanging one falls at g."** visual_counter = both `v`
   readouts identical every instant, and `a` reading far below 9.8; one_line_fix = "an inextensible
   rope makes one system — one speed, one acceleration."
3. **S6 — "the heavier side plummets, and each side of the rope has its own tension."**
   visual_counter = the 2.1 vs 2.0 kg pair creeping at 0.24 m/s² with ONE T readout (20.08 N)
   sitting between the two weights; one_line_fix = "only the mass DIFFERENCE drives; an ideal
   rope has one tension."
No other state carries a misconception_watch.

## 6. `has_prebuilt_deep_dive` picks + drill-down clusters
- **S3** (the tension wall — most-documented error in this topic): `tension_equals_hanging_weight`,
  `tension_same_throughout_massless_string`, `rope_pulls_both_ends_equally`
- **S4** (the method wall — setting up per-body equations): `which_body_gets_which_equation`,
  `sign_convention_along_the_string`, `system_method_vs_free_body_method`
All 7 states still show the Explain button; un-flagged states route to the feedback form (Rule 18).

## 7. entry_state_map (v2.2)
```
foundational: STATE_1 → STATE_4   # constraint, one T, T ≠ m₂g, solving the pair
incline:      STATE_5             # slope + friction variant
atwood:       STATE_6             # both-hanging / counterweight
```
Default aspect = foundational. PRIMARY aha (S3) ⊂ foundational — coverage rule satisfied.

## 8. Prerequisites (advisory only, Rule 23)
`free_body_diagram` (this chapter — retrofit in flight on feat/lom-a; supplies the arrow
vocabulary), `newton_second_law` (this chapter — planned, may not yet be authored: S4 assumes
F = ma per body; its cliff patch is in Block 1), `normal_reaction` (shipped gold — S5's N),
`tension_in_string` (legacy Socratic-era JSON — advisory pointer only, not gold).

## 9. Real-world anchor (Rule 35 — universal, culture-neutral, plain English)
Primary: **an elevator car and its counterweight**, hanging on opposite sides of a pulley at the
top of the shaft — nearly equal masses, so the motor only ever supplies the small difference; the
cable's tension is neither weight. This is S6 made real, and every student has stood inside the
physics. Secondary: **a gym cable machine** — you pull one end of a cable over pulleys and a weight
stack rises at the other; one cable, one tension, and the stack accelerates only while your pull
beats its weight (the S3 payoff). Both are findable anywhere on Earth, age-appropriate, and
physics-true at full depth (ideal-string idealization stated honestly in narration).
DC Pandey check: consulted the Laws of Motion table of contents for scope only (connected
bodies/pulleys is its own sub-topic after FBD and Newton's laws) — no teaching sequence, example
problem, or figure imported.

## 10. Definition of Done (Gate 0 — no TBDs)
(a) 7 states as tabled. (b) Symbol-label table (engine Unicode sprites): m₁ · m₂ · T · m₁g · m₂g ·
N · fₖ · ΣF · a · θ · m₁g·sinθ · m₁g·cosθ — narration names each once before relying on it.
(c) RHR plan: N/A (no cross products). (d) Motion plan = the archetype + motion-budget columns
above — no static state; every burst state's budget arithmetic is in §4 and the halt is
choreographed as the end of the run (see GAP CANDIDATES). (e) Modes: conceptual only.
(f) `assessment` + `coverage_map` authored; misconception_watch exactly at S1/S3/S6.
(g) Macro↔micro (Rule 33): N/A-macro — live T/a/v readouts carry the real-number duty.
(h) Canvas budget (Rule 34): one formula line per state as tabled, ≤5-word delta cues, value-only
HUD. Registration (spec §8): all sites 1–6; NOT `PCPL_CONCEPTS`; new concept (no retrofit clause).

## Two-pass lens
**Block 1.** Prerequisite cliffs: `newton_second_law` missing → S4 breaks ("why does ΣF = ma per
body?") — S4 narration includes one clause "each body obeys F = ma on its own"; `free_body_diagram`
missing → S2's arrow census confuses — S2 opens "read each body's arrows, one body at a time";
`normal_reaction` missing → S5's N — one clause "the slope pushes back perpendicular to itself."
JEE-backwards trace: "A 4 kg block on a rough table (μₖ = 0.4) is connected over a light pulley to
a hanging 2 kg block. Find the acceleration and the tension." Needs: shared-a constraint (S1), one
T (S2), T ≠ m₂g (S3), per-body equations + elimination (S4), friction term (S4/S5 variant) — all
delivered; the incline (S5) and Atwood (S6) variants cover the standard alternates.
Misconception-entry mapping: the T = m₂g belief is PLANTED by S2's balanced glide **by design**
(the earned wrong belief) and by every "the weight pulls the rope" intuition; S2's narration flags
it at the planting moment ("here — and only here — T happens to equal m₂g") and S3 confronts it
(§5). The falls-at-g belief is confronted at S1 before anything plants it.
**Block 2.** PRIMARY aha (S3): *the rope's tension is not the hanging weight — if it were, nothing
would ever move; acceleration is exactly the difference.* SUPPORTING aha (S6): *only the mass
difference drives an Atwood pair — which is why an elevator's counterweight makes a heavy car
cheap to lift.* Cohesion: S6 is the primary re-applied symmetrically — T sits between the weights
for the same T = m(g±a) reason. Wrong-belief setup: S1–S2 build the confident-wrong T = m₂g
(explicitly earned in S2) broken by S3; S1–S5's "surface rig" comfort is the setup S6's
slab-vanishing reframe breaks. Foundational-coverage rule: satisfied (S3 ∈ foundational).

## Engine-bug-queue consultation
DB query not runnable from this read-only architect context; consulted the committed scar surface:
`docs/loop_runs/lom/_engine/scar_candidates.sql` (14 rows), phase0 report §5–§7, and
`free_body_diagram/engine_gap.md` (GAPs 1–3). Applied: per-state side-on `camera_position` +
ONE calibrated shared camera distance across the table-rig states (FBD cycle-3 scale-continuity
scar); short single-line formulas (formula-width scar); `phases[]` for all glow/arrow timing
(no hardcoded `*_at_ms`); specific glow ids only; inert `field_lines`; constant per-id `hanging`
flag with dedicated Atwood ids P/Q (phase0 bring-up scar); `pulley.post_position_m` at default;
`idle_auto_sweep.range[0]` = the state's own value; GAP 3 (`RESET_TRAJECTORY`) is FIXED
(`cd8fe67`) and inherited — but json_author must still prove the rewind under THE EYE's real
message order, since this is the chapter's first ACCELERATING multi-state concept. FLAG to
quality_auditor: confirm no new FIXED rows for `alex:architect` since 2026-07-25.

## ENGINE GAP CANDIDATES (designed around — founder call whether any warrants an amendment)
1. **(MAJOR, new) No motion loop/replay for an integrating guided state.** Wanted: the S3/S4/S5/S6
   release runs repeating each dwell (Rule 31: "motion may outrun narration, never the reverse" —
   a visible acceleration a exhausts any in-frame run budget R in √(2R/a) ≈ 1–3.5 s, then the rig
   halts at the track bound for the remaining ~8–10 s of narration; ½at² makes this physically
   unavoidable, not a tuning problem). Engine offers: one run per SET_STATE/RESET; `idle_auto_sweep`
   is a param triangle (GAP 1 family), `phases[]` is glow-only. Designed instead: constant-v
   full-duration beats where the idea permits (S1/S2), short choreographed bursts elsewhere with
   the halt narrated as "the end of its run", and the glow-walk carrying S4's back half. Minimal
   fix if wanted: `run_loop?: { period_ms: number }` that re-seeds via the (now-real, cd8fe67)
   RESET_TRAJECTORY path — cheap, and it would also serve `block_on_incline`'s slide beats.
2. **(MINOR, new) No floor/landing object.** A halted hanging body freezes MID-AIR at the coupled
   track bound — there is nothing for B to visibly land on, so the stop reads as a glitch rather
   than an arrival. Designed instead: run budgets kept short, delta cue + narration name the end
   of the run. Minimal fix: an optional static floor slab at a configurable drop, purely visual.
3. **(RECURRENCE of GAP 1) No monotonic θ-ramp for S5.** Wanted: tilt 0°→30° while `a` visibly
   falls and `T` rises. Designed instead: static θ = 30° with the component-arrow draw-in as the
   cause beat (same resolution as FBD S5). NOTE: a `param_ramp` engine fix is already
   founder-pre-approved for `block_on_incline` (commit 2998e54, not yet built). If it lands before
   this concept's json pass, S5 should adopt `param_ramp {param:'theta', from:0, to:30}` — flagged
   for the founder/json_author to check at authoring time.
