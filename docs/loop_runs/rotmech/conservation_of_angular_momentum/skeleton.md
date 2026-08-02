# Skeleton — `conservation_of_angular_momentum` (rotmech · Class 11 Ch.7 · 0b spec driver for build 0c-1) — REV 4

> **Status:** Phase-0b deepest-concept design (AUTHORING_PIPELINE.md §0). This skeleton + the physics block ARE the real spec for the NEW field_3d `scenario_type` (working name `rigid_body_rotation`). Rule 12 does not apply — the scenario does not exist yet. Literal config/key names below are guesses; the field3d-surgeon dispatch report's closed enums supersede them. Physics, geometry, and what-must-be-visible are exact.
> **Renderer-readiness declaration (scar `archetype_live_tier_unverified_against_renderer`):** because the scenario does not exist, **every motion specified here is `[NEEDS-SCENARIO]`** — no archetype is claimed `[LIVE]`. The verification obligation transfers to the 0c-1 build and its bring-up probes. Exception now on record: the **ramp SHAPE claim is verified against renderer CODE this session** — `nlbRunParamRamp`, `src/lib/renderers/field_3d_renderer.ts:42295–42338` (comment L42296–42298: *"ONE-SHOT monotonic reveal … then HOLDS at 'to' forever — the deliberate opposite of nlbRunIdleSweep's repeating triangle"*; code L42330: `else if (tMs >= t1) v = pr.to; // HOLDS at "to" — never returns toward "from"`). The grip-rule hand reference remains visual-vocabulary precedent only, not a reuse claim.
> **Bug-queue consultation (2026-08-02, REV 4, LIVE table via Bash):** queries re-run this session — see SCAR AUDIT §"Queries run". Universe unchanged vs the reviewer's cycle-2 pull (32 / 47 / 30 / 0 / 0 / 0). **The superset diff was executed mechanically this time:** all result `bug_class` strings extracted and diffed against this document; every row now appears VERBATIM with an explicit verdict (REV 3's `…`-abbreviated names silently defeated verbatim matching — that practice is retired).
> **DC Pandey check:** chapter table of contents only. No teaching method, example problem, or figure imported.
> **Namespace check:** `conservation_of_angular_momentum` appears in neither `src/data/concepts/` nor `chemistry/` — no collision.
> **Revision history:** REV 2 at `skeleton_rev2.md`; REV 3 at `skeleton_rev3.md`. Checkpoint A reports: `founder_proxy_A.md` (cycle 1), `founder_proxy_A_cycle2.md` (cycle 2 — the authoritative fix list for this revision). **This is fix cycle 2 of 2 — the last.**

---

## FIX-CYCLE-2 RESPONSE (finding → what changed → where it now reads)

| Finding | What changed | Where |
|---|---|---|
| **P1-1 (P1)** | (1) "Loop period" language DELETED for S1–S5/S7 — the §3 pin table column is now **"State duration R"**, and a declared **one-shot-hold contract** names the proven shape by file:line: each ramp holds at its end value for the remainder of the state and never returns toward its start; **S6 is the only looping state; S8's idle sweep is the repeating triangle (`nlbRunIdleSweep`), not a ramp**. E4's `↔` replaced by directed `→` per state. S4's "rest of the loop" → "remainder of the state". Archetype-discharge rule re-worded off "loop reset". (2) **ENTRY CONFIG column** added to the §3 table — (r, ω, brake) at t = 0 for all eight states, with the rule *"in every ramped state the authored entry r EQUALS `param_ramp.from`"*. (3) State entry declared an **instantaneous single-frame re-pose, never an animated slide** (the S4→S5 r 0.20→0.80 re-pose named explicitly). (4) `field3d_param_ramp_authoring_contract` dispositioned as BINDING in the SCAR AUDIT | §3 "One-shot-hold contract" block + control table ENTRY CONFIG column + pin table; E4; SCAR AUDIT row 31 |
| **P1-2 (P1)** | The prediction mark's host surface is now NAMED per consumption site: **on S3's value-only ω readout the mark is a static labelled VALUE CHIP** (`predicted ω = 1.50`) adjacent to the live readout, **with a match cue** — hold-glow on both, fired once when \|ω − 1.50\| < 0.01 — as ω sweeps down to meet it; **on S4's KE bar the mark is a labelled TICK on the bar scale**. F1 re-written as `reference_marks[]` with TWO declared surface forms; ledger row updated | §3 S3 row; F1; §10(b) "Predicted speed mark" row; E-c carried |
| **P1-3 (P1)** | Enum closure re-executed as a **shown, both-direction DIFF against `phase0_survey.md:223–232`**: added `axis_pair {a, b}` + `d_draw` + the perpendicular-axis triple (#6, survey L228) · `cm_marker` + `cm_path_trace` + multi-body list (#2/#3, L229) · `parts[] {mass, centroid}` (#1, L230) · `cross_product_construction {inputs, result, rhr_hand}` (#5/#9, L227); rolling-vs-slipping (#12, L231) recorded as correctly EXCLUDED (0c-2). Then `deferred_enum_members_must_be_declared_not_merely_unimplemented` applied to the **WHOLE** list: explicit IMPLEMENTED and DEFERRED sets, union = the frozen contract, intersection empty | "Enum-closure contract" block (fully rewritten) |
| **P2-4** | Decision stated in S3's row: the −r̂ arrows **stay inward and SHORTEN** during the outward slide (outward motion means the applied centripetal hold is *less* than mω²r — the agent eases its grip; it never pushes outward) — a second kill on "something pushed them out". Same one-line decision added for S8's live r-drag (arrows track: lengthen inward, shorten outward, always −r̂). Walk table now claims **F5 at S3 and S8**; `derivation_principle_applied_to_one_beat_but_not_its_sibling` re-dispositioned honestly | §3 S3 + S8 rows; walk table; SCAR AUDIT row 13 |
| **P2-5** | S5 fully numbered: **τ_brake = 0.92 N·m** (default), engagement **2.5 s**, ΔL = τ·t = 2.30 ⇒ **L decays 4.59 → 2.29**; held readings **I 3.06 · ω 0.75 · L 2.29 · KE 0.86** — checked pairwise distinct at 2 dp (the F-8 check re-run). Slider range **[0, 2.0] N·m**; at the 2.0 max the platform reaches rest INSIDE the engagement window (4.59/2.0 = 2.29 s < 2.5 s) and the rest clamp holds it — a legible extreme, never a reversal, so F2's probe now has a defined domain | §2 ground truth; §3 S5 row + pin table; F2 |
| **P2-6** | Route (b) taken: the brake surface moves to a **drum at R_drum = 0.55 m** — the drum IS the turntable platform; the rod rides **0.25 m vertically above** the drum's pad plane, so the pad (travelling in the drum plane) never fouls the masses at ANY r, including r = 0.20 < R_drum. Implied-mass check stated per the new scar row: I_frame = 0.50 ⇒ drum ≈ 2.3 kg + rod ≈ 0.45 kg ⇒ a ≈ 2.8 kg apparatus — classroom-plausible. **Bonus recorded:** masses at home r = 0.80 visibly travel OUTSIDE the braked radius — the stool picture — strengthening `teach_distinct_reference_lines_for_two_radii`. `rim_radius_m` → `brake_drum_radius_m = 0.55` | §2 geometry; §3 S5; §10(b) `R_drum` row; F2 |
| **P2-7** | The five named rows dispositioned (`field3d_param_ramp_authoring_contract` · `derived_energy_sum_pairs_prestep_position_with_poststep_velocity` · `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed` (restored from REV 2) · `field3d_measured_overlay_fit_runs_once_against_a_sibling_blanked_on_entry` · `teach_auditor_reads_field3d_sliders_from_config_not_scene_composition`); **E8 gains the ONE-post-step-snapshot requirement** (I, ω, L, KE, dL/dt published from one snapshot per frame) + the same-frame consistency probe. Beyond the five: the mechanical diff surfaced further rows REV 3 covered only via wildcards ("layout/kerning/z-order rows") or ellipses — ALL now verbatim with verdicts | SCAR AUDIT (complete 77-row table); E8 |
| **P3 (all)** | `entry_state_map` regains **`external_torque: STATE_5`** · rest clamp restated **on L** ("if τ_ext·h would carry L through zero, set L = 0" — never clamp derived ω) in E2 + F2 · **E2's dt-fold probe corrected** to the frame-dt fold with h held fixed (20 steps at dt = h vs 10 at dt = 2h, \|Δθ\| and \|Δω\| < 1e-12, n = round(dt/h)) — the cycle-1 wording is retired · S3 overrun fallback stated (cut the subscript clause, label "before/after" on the formula surface) · §4 "4.6×" → **4.64×** · S6's walk row gains **E1** · S6 re-pin cue **holds ≥ 0.5 s with readouts BLANKED across the cut** (no frame shows +4.59 → −4.59 live) · physics_author note: **never narrate the S1 axle arrow's DIRECTION before S6** | §7; E2; F2; §3 S3/S6; §4; walk table; §3 S1 note |
| *(Ruling 5 carried)* | Survey-addenda note added: the dispatching session appends **F1 `reference_marks[]`**, the **visible brake actuator + `brake_drum_radius_m` + drawn drum line**, and the **re-pin cue** to `phase0_survey.md`'s 0c-1 union table as an explicit addendum | "Survey addenda" note after the engine rows |

---

## 1. Atomic claim

This concept teaches ONE thing: **when the net external torque on a system is zero, its angular momentum L = Iω stays constant — so if the mass distribution changes and I falls, ω must rise (and kinetic energy is NOT conserved while this happens)**. It does not cover what angular momentum is or its formula (`angular_momentum`), how I is computed (`moment_of_inertia`), or how a nonzero torque produces α (`tau_eq_i_alpha`). Kepler's 2nd law is deferred to Gravitation.

## 2. State count + arc — 8 states (7 guided + 1 explore)

Complexity call: **complex (7–9 band)**. The concept needs the conservation event (a qualitative aha + a quantitative check), its energy consequence, its boundary condition (τ_ext ≠ 0 — core, F-9), its vector nature, and the advanced derivation.

The apparatus is ONE machine throughout (Rule 32d): a **turntable on a vertical axle carrying a horizontal rod with two equal masses that slide symmetrically**. The turntable is ALWAYS spinning from S1 onward. States **re-initialise their authored entry configuration on entry** as an **instantaneous single-frame re-pose — never an animated slide** (P1-1; the S4 → S5 re-pose, r 0.20 → 0.80, can therefore never be read as a taught radial motion). HUD (value-only): `I`, `ω`, `L`, plus `KE` from S4.

**Apparatus geometry (F-7b, revised P2-6):** the rotating platform is a **brake drum of radius R_drum = 0.55 m** on the vertical axle; the pad approaches **in the drum's plane**. The rod (half-length **1.0 m**) is mounted on the axle **0.25 m vertically above the drum's pad plane** — the masses ride on the rod, vertically clear of the pad's track at every r (including r = 0.20 < R_drum), so the pad never fouls them; the rod tips overhang the drum edge. Sliding-mass clamp **r ∈ [0.15, 0.90] m** (F-12c; taught poses strictly inside: 0.20 and 0.80). At home r = 0.80 the masses sit visibly **outside** the braked radius — the stool-with-outstretched-arms picture. Where both r and R_drum are on screen (S5, S8-with-brake) they are drawn as **two distinct, separately-labelled reference lines** (scar `teach_distinct_reference_lines_for_two_radii` — BINDING, and strengthened by this geometry: the masses cross the braked radius during every slide). **Implied-mass plausibility check (scar `authored_lumped_constant_inconsistent_with_the_drawn_apparatus_geometry`):** I_frame = 0.50 kg·m² backs out to drum ≈ 2.3 kg (I ≈ 0.35 at R = 0.55) + rod ≈ 0.45 kg (I = M·L²/12 ≈ 0.15) — an apparatus of ≈ 2.8 kg at 1.1 m across, a real classroom object. *(Supersedes REV 3's R_rim = 1.2 m, which implied a sub-kilogram 2.4 m turntable.)*

**Authored numeric ground truth (F-8; S5 numbers added per P2-5):** each sliding mass **m = 2.0 kg**; frame inertia **I_frame = 0.50 kg·m²**. Then I(0.80) = 0.50 + 2·2.0·0.80² = **3.06 kg·m²**; with **ω₀ = 1.50 rad/s**, **L = 4.59 kg·m²/s**; I(0.20) = **0.66 kg·m²** → ω = **6.95 rad/s**; **KE₁ = 3.44 J**; **KE₂ = L²/2I₂ = 15.96 J**; ratio = I₁/I₂ = **4.64**. Top spin = **1.11 rev/s**. **S5 (brake):** τ_brake default **0.92 N·m**, engaged **2.5 s** ⇒ ΔL = 2.30 ⇒ **L 4.59 → 2.29**; held readings **ω = 2.29/3.06 = 0.75 rad/s**, **KE = 2.29²/6.12 = 0.86 J** — the four held readouts (3.06 / 0.75 / 2.29 / 0.86) pairwise distinct at 2 dp (F-8 check re-run). KE₁ (3.44) ≠ L (4.59) — no numeric collision anywhere on the HUD. **HUD decimal places: exactly 2 everywhere**, narration uses the SAME 2-dp figures.

| State | Title (Rule 41 — literal, first words carry meaning) | Purpose | teaching_method | Ring |
|---|---|---|---|---|
| S1 | Steady spin, constant L | Baseline: no external torque → I, ω, L steady; L readout established; the LAW stated in words | *(straightforward beat)* | core (qualitative) |
| S2 | Masses pulled in — spin speeds up | THE PRIMARY AHA: I drops, ω rises, L pinned; the inward pull arrows are ON SCREEN (F-4) | *(straightforward beat)* | core (qualitative) |
| S3 | The equation predicts the new speed | **Quantitative beat (F-5):** I₁ω₁ = I₂ω₂ predicts 1.50 rad/s BEFORE the push-out; the live readout lands on the prediction | *(straightforward beat)* | core (quantitative) |
| S4 | Kinetic energy is not conserved | KE rises during pull-in and the gap HOLDS open (F-1); the visible pull does the work (F-4) | `misconception_confrontation` | core (quantitative) |
| S5 | External torque changes L | Core (F-9): a brake pad touches the drum → L visibly decays; conservation needs τ_ext = 0 | *(straightforward beat)* | core (condition) |
| S6 | L is a vector along the axis | Grip rule; a RESTARTED run with opposite spin (F-2) → L points the other way | *(straightforward beat)* | extended |
| S7 | Why L stays constant | τ_ext = dL/dt, so τ_ext = 0 ⇒ L constant | `derivation_first_principles` | advanced |
| S8 | Try it yourself | Sandbox | `exploration_sliders` | *(explore — ring-gated controls)* |

**Rule 38a — BOTH clauses:** ladder = **qualitative (S1–S2) → quantitative (S3–S4) → condition (S5, core) → extended (S6) → derivation (S7)** — rings monotone, advanced contiguous immediately before explore ✓. `advance_mode`: S1–S7 `manual_click`, S8 `interaction_complete` ✓.

## 3. Per-state choreography + control plan (Rule 31 control table)

**One-shot-hold contract (P1-1 — the beat-termination declaration):** **S1–S5 and S7's authored beats are ONE-SHOT — each ramp holds at its end value for the remainder of the state and never returns toward its start** (shape: `nlbRunParamRamp`, `field_3d_renderer.ts:42295–42338`, a closed form of `eng.t_ms` so a `SET_TIME_FREEZE` rewind reproduces it exactly). **S6 is the only looping state** (its two-run A→cut→B cycle repeats). **S8's idle sweep is the repeating-triangle shape (`nlbRunIdleSweep`), not a ramp.** In every ramped state the **authored entry value of the ramped parameter EQUALS `param_ramp.from`** (OPEN scar `field3d_param_ramp_authoring_contract` — its probe carries into E4), and state entry is a **single-frame re-pose** (§2).

**Coined archetypes (three, each justified once):**
- `radial-slide` — mass elements translate radially WITHIN the rotating body, changing its shape while it spins. Declared by S2/S3 as a contrast pair.
- `diverge-from-mark` — a live readout departs from a static reference mark and HOLDS the gap. The distinct picture is the opening gap itself.
- `equation-build` (S7) — the equation assembles term-by-term on the single formula surface, synced to narration.

**Vehicle-vs-archetype note (honest):** the radial slide is the apparatus's ONLY way to change I, so it also appears as the *vehicle* inside S4 and S7. Each state's DECLARED archetype names its distinct new on-screen picture (S4: the bar-vs-tick gap opening and holding; S7: the equation assembling beside a dL/dt readout pinned at 0.00 while I and ω sweep). Declared-archetype repeats: none except the S2/S3 pair.

**Archetype-discharge rule:** every archetype is discharged by motion the AUTHORED beat produces with NO teacher input, **within the state's duration** (one-shot states discharge once and hold; S6 discharges each cycle). The S6 toggle and S5 slider are Rule-31 contextual controls layered ON TOP of an authored beat.

| State | Teaches (one idea) | Archetype | **ENTRY CONFIG** (r · ω · brake, at t = 0; ramped-param entry = `ramp.from`) | Authored beat (no teacher input; cause → effect) | Delta cue | Live controls | Words | Ring |
|---|---|---|---|---|---|---|---|---|
| S1 | With no external torque, L = Iω does not change | `reveal-build` | r 0.80 · ω +1.50 · brake off *(no ramp)* | Turntable spins steadily at ω₀ = 1.50, masses at r = 0.80; the L arrow draws in along the axle (**MAGNITUDE indicator here**, length ∝ \|L\| — direction semantics taught only in S6; **physics_author: do NOT narrate the arrow's direction before S6**), then I / ω / L readouts build one by one, **each only AFTER the narration sentence defining it** (ledger §10b). Narration states the law with the plain physics word: "with no external torque, L = Iω stays the same" — never "outside twist" | **"No torque: L constant"** | none | 30–45 | core |
| S2 | Pull the masses in → I falls → ω must rise | `radial-slide` | r 0.80 (= ramp.from) · ω +1.50 · brake off | CAUSE first — **a radial force arrow appears on each mass pointing along −r̂ toward the axis (F5)**, and the masses slide inward under them (ramp r: 0.80 → 0.20 over ~2 s, one-shot-hold). After a ~0.7 s beat the EFFECT follows: spin visibly speeds up (1.50 → 6.95), ω climbs, I falls, **L sits at 4.59 with a hold-glow**. One full slow revolution before (4.19 s), several fast after; ends HELD at r = 0.20. Anchor here: ~8 words — "like a person on a rotating stool pulling their arms in" | **"Masses in: spin faster"** | none | 35–55 | core |
| S3 | The trade is EXACT: I₁ω₁ = I₂ω₂ predicts the new speed before it happens (F-5) | `radial-slide` (declared contrast pair of S2 — delta names the flip AND the payload) | r 0.20 (= ramp.from) · ω +6.95 · brake off *(continuity from S2's held end)* | The formula surface shows **I₁ω₁ = I₂ω₂** (symbolic; one clause defines the subscripts — **overrun fallback:** if physics_author exceeds 55 words, cut the subscript clause and label "before/after" on the formula surface instead). The PREDICTION lands as a **static labelled VALUE CHIP adjacent to the live ω readout — `predicted ω = 1.50` (F1 chip form; P1-2)**. THEN the masses slide OUT (ramp r: 0.20 → 0.80, one-shot-hold), spin slows — **the −r̂ arrows STAY INWARD and SHORTEN as the masses move out (P2-4: outward motion means the centripetal hold is *less* than mω²r; the agent eases its grip, it never pushes outward)** — and **the live ω readout meets the chip: the MATCH CUE fires once when \|ω − 1.50\| < 0.01, hold-glowing chip and readout together**. L never moves. Ends HELD at the global home pose. Secondary anchor (~10 words): "like a diver stretching out to slow the somersault before the water" | **"Equation predicts the slow-down"** | none | 35–55 | core |
| S4 | L is conserved but kinetic energy is NOT | `diverge-from-mark` | r 0.80 (= ramp.from) · ω +1.50 · brake off | SEQUENTIAL contrast: the thin static tick appears FIRST at KE = 3.44 J on the **bar scale** (F1 tick form), labelled "if energy stayed constant", on its own beat with nothing else changing. THEN the pull-in runs ONCE — the −r̂ arrows appear (F5), masses slide in (ramp r: 0.80 → 0.20, one-shot-hold), the KE bar climbs past the tick to 15.96 J while L stays flat — **and HOLDS there with the gap open for the remainder of the state (F-1 + P1-1: no push-out, no return; the beat never undoes its own claim)**. The gap IS the work done by the visible pull (W = ΔKE; nothing off-screen is credited). Bar scale 1.1× the 15.96 J peak | **"Kinetic energy goes up"** | none | 40–55 | core |
| S5 | Conservation holds ONLY while τ_ext = 0 (core, F-9) | `translate-through` | r 0.80 · ω +1.50 · brake pad disengaged (τ = 0 at entry; the engage IS the beat) — **single-frame re-pose from S4's held r = 0.20** | Authored beat: brake pad translates in and touches the **drum at R_drum = 0.55 m** (cause) — **R_drum drawn as its own labelled reference line, visually distinct from the r line; the masses at r = 0.80 sit visibly OUTSIDE the braked radius (P2-6)**; after a readable beat ω AND L decay together (effect): **τ_brake = 0.92 N·m for 2.5 s ⇒ L 4.59 → 2.29**; the hold-glow breaks. On the authored cue the brake releases → decay stops, **L holds at 2.29, ω at 0.75, KE at 0.86** (one-shot: held for the remainder of the state). **Brake contract:** frictional — opposes ω; **rest clamp on L: if τ_ext·h would carry L through zero, set L = 0** (never clamp derived ω); NEVER reverses spin at any reachable slider value. **Slider domain: τ_brake ∈ [0, 2.0] N·m, default 0.92** — at the 2.0 max the platform reaches rest inside the window (2.29 s < 2.5 s) and holds. L(t) closed-form piecewise in state-local t, so time-pin rewinds replay it exactly | **"External torque changes L"** | brake-torque slider *(min_ring: core)* | 30–50 | core |
| S6 | L is a vector along the rotation axis | `cycle-compare` | r 0.80 · run A ω +1.50 · brake off | Camera reframes to see the axle side-on. **The ONLY looping state (P1-1).** Authored loop, **two RUNS, never a continuous reversal (F-2)**: run A — spin at +ω₀, hand curls with it, L arrow up (~4 s). Then a HARD CUT restart cue ("run it again the other way"): run B launches at **−ω₀** — hand curls the other way, arrow down (~6 s); the cycle repeats. **L never crosses zero on screen** — across the cut the **re-pin cue holds ≥ 0.5 s and the readouts BLANK, then re-pin at ω = −1.50, L = −4.59** (no single frame shows a live +4.59 → −4.59 transition; P3) — clearly a restart, not an uncaused torque. The toggle drives the SAME restart mechanism live | **"L points along axis"** | spin-direction toggle (= restart) *(min_ring: extended)* | 30–45 | extended |
| S7 | τ_ext = dL/dt ⇒ τ_ext = 0 ⇒ L constant | `equation-build` | r 0.80 (= replay ramp.from) · ω +1.50 · brake off | The equation builds term by term, synced to narration; alongside it a slow authored replay of S2's pull-in (ramp r: 0.80 → 0.20, one-shot-hold) with a **dL/dt readout showing 0.00**. **Honest framing (F-3/F-11):** dL/dt = per-step (L_k − L_{k−1})/h of the engine's own L state — under the single L-integrator this equals τ_ext by construction, so it is presented as an ILLUSTRATION of the law the engine integrates, never sold as an independent measurement. Calculus notation allowed here only | **"Torque equals dL/dt"** | none | 35–55 | advanced |
| S8 | Sandbox | `drag-sandbox` | r 0.80 · ω +1.50 · brake 0 · idle sweep armed | Free-running (Rule 37). **Control semantics (F-6):** `r` is the ONLY live-drag control preserving L — **during a drag the −r̂ arrows track it: lengthen pulling in, shorten easing out, always inward (P2-4)**; **`m` and `ω₀` RE-INITIALISE the state** — L re-pins from the new I·ω₀ with a brief re-pin cue (L visibly jumps AT the flash, attributed to the restart, never silently); the **direction control is a restart** (no easing through zero anywhere); the brake applies live τ_ext while held > 0 (**r-drag DURING braking is correct by construction** — F-3). **Idle auto-sweep (repeating triangle, `nlbRunIdleSweep` shape — NOT a ramp):** until first trusted input, r oscillates 0.80 → 0.20 → 0.80 on the state clock, thumb + numeric label in lockstep | **"Try it yourself"** | ALL, ring-gated: r *(core)*, ω₀ *(core)*, m *(core)*, brake-torque *(core)*, spin-direction *(extended)* | 0 / open | *(explore)* |

**Archetype audit:** reveal-build (S1), radial-slide ×2 (S2/S3 declared pair), diverge-from-mark (S4), translate-through (S5), cycle-compare (S6), equation-build (S7), drag-sandbox (S8). No declared repeat outside the pair; no static state.

**Explore controls — ring-gated (scar `explore_controls_not_ring_gated_survive_the_ring_cut`):** *Hide advanced (drop S7):* S8 keeps r/ω₀/m/brake/spin-direction, each mapping to a surviving state ✓. *Hide advanced+extended (drop S6–S7):* S8 keeps r/ω₀/m/brake (core, taught by S1–S5); spin-direction is CUT with S6's ring ✓. S8's formula surface stays `L = Iω` (core) under every preset ✓.

**Readout metrics (F-3):** `I` = I_frame + Σmᵢrᵢ(t)², recomputed every fixed step. **`L` = the engine's single integrated state** — `L += τ_ext·h` (rest clamp on L), so dL/dt = τ_ext is the engine's law. `ω` = L/I(t), derived each step. `KE` = ½I(t)ω(t)². `dL/dt` (S7 only) = per-step finite difference of L. **One post-step snapshot (P2-7):** all five publish from ONE post-step snapshot per frame — never a pre-step value beside a post-step one (scar `derived_energy_sum_pairs_prestep_position_with_poststep_velocity`; probe in E8). **Honest framing carried into narration:** the L readout displays the quantity the engine integrates; its flatness in torque-free states is the law being simulated, and is PRESENTED as such. What DOES independently confirm the physics on screen: S3's live ω readout meeting the pre-computed prediction chip, and S8's E-a probe.

**Rule 33 macro↔micro:** N/A-with-justification — the taught variable (I) IS the visible mechanism. Instruments (33d): value-only HUD, live 2-dp numbers.

**Rule 34 canvas budget:** top caption = the ≤5-word delta cue only; ONE formula surface per state (S1/S8 `L = Iω` · S2 `ω = L / I` · S3 `I₁ω₁ = I₂ω₂` · S4 `KE = ½Iω²` · S5 `τ_ext ≠ 0 ⇒ L changes` · S6 none · S7 `τ_ext = dL/dt`); all math real Unicode. All surfaces SYMBOLIC — numeric claims live only in the HUD and in reference marks/chips the live readouts meet on screen.

**Pin-margin discipline (F-7a; column renamed per P1-1 — these are STATE DURATIONS, not loop periods; one-shot states hold their end configuration from end-config time to R):**

| State | End-config reached (design est.) | **State duration R (min)** | Pin at 0.60R | Margin |
|---|---|---|---|---|
| S1 | instruments built ~4.0 s | ≥ 8 s | 4.8 s | ✓ |
| S2 | pre-roll revolution 4.19 s + 0.7 s + 2 s ramp = **6.89 s**, then HELD | **≥ 12.6 s (author 13 s)** | 7.8 s | 0.9 s ✓ |
| S3 | prediction build ~3 s + 2 s slide = ~5.2 s, then HELD on the met chip | ≥ 10 s | 6.0 s | 0.8 s ✓ |
| S4 | tick ~2.5 s + 0.7 s + 2 s ramp = ~5.2 s; **end-config = the HELD-OPEN gap — the pin photographs the claim by construction** | ≥ 10 s | 6.0 s | 0.8 s ✓ |
| S5 | engage 1.5 s + decay 2.5 s + release 1 s = ~5.0 s, then HELD (L 2.29 / ω 0.75 / KE 0.86) | ≥ 10 s | 6.0 s | 1.0 s ✓ |
| S6 | run A ~4 s → cut → run B; end-config = run-B-in-progress, arrow down *(looping state)* | ≥ 10 s | 6.0 s | ~2 s into run B ✓ |
| S7 | equation complete + replay ~6.0 s, then HELD | ≥ 11 s | 6.6 s | 0.6 s ✓ |

physics_author recomputes exactly at the engine's step size. THE EYE must read DENSE frames across the S2/S3/S4/S5 ramp windows, not only the frozen end-state.

## 4. Misconception confrontation plan (Rule 16a — 3 genuine pivots)

| Wrong belief | At | `misconception_watch` beat |
|---|---|---|
| "A spin rate cannot change unless something pushes or a motor acts" | **S2** | belief: nothing external touched it, so ω must stay 1.50 · visual_counter: masses slide in under the visible −r̂ arrows and the spin speeds up **4.64×** while L never moves · one_line_fix: no external torque fixes L, not ω — change I and ω must change with it (the inward pull points AT the axis, so it exerts no torque about it) |
| **"If angular momentum is conserved, energy is conserved too"** | **S4** | belief: KE should stay at 3.44 J · visual_counter: the static tick drawn FIRST, alone; then the KE bar climbs past it to 15.96 J while L stays flat, **and the gap stays open** — sequential, never undone (F-1) · one_line_fix: the visible inward pull does real work, and that work becomes extra kinetic energy; KE = L²/2I rises as I falls |
| "L is just a number" (RM-G6) | **S6** | belief: L has size but no direction · visual_counter: two restarted runs — spin one way, arrow up; the other way, arrow down (never easing through zero, F-2) · one_line_fix: L points along the rotation axis by the right-hand grip rule |
| | | Named primitives for each wrong picture (scar `field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive`): S2 needs the hold-glow (E8) + −r̂ arrows (**F5**); S4 needs the bar tick (**F1** tick form) + arrows (**F5**); S6 needs the flippable hand + arrow (E5/E7 on a signable ω₀) |

S1, S3, S5, S7, S8 carry NO misconception_watch. EPIC-C branches: **zero**.

## 5. `has_prebuilt_deep_dive` states (2)

**S2** (the primary aha; "why does it speed up" is the historic sticking point) and **S4** (energy bookkeeping, where exam mistakes concentrate). V1.0 ships zero authored deep-dives (Rule 18); the flag marks investment priority.

## 6. Drill-down clusters

**S2:** `why_omega_rises` · `L_vs_omega_confusion` · `internal_forces_no_torque` (with its picture: the rendered −r̂ arrows point straight at the axis, zero moment arm — F-4).
**S4:** `ke_not_conserved` · `who_does_the_work` (the visible inward pull) · `ke_ratio_formula` (KE = L²/2I, KE₂/KE₁ = I₁/I₂).

## 7. `entry_state_map`

```
entry_state_map:
  foundational:    STATE_1 → STATE_5   # the trade, the energy story, AND the law's condition (F-9)
  external_torque: STATE_5             # "when is L not conserved" routes straight to the brake (P3 — restored; aspects need not be disjoint from foundational)
  vector_nature:   STATE_6
  derivation:      STATE_7
```

Default `foundational`. PRIMARY aha (S2) inside the foundational range ✓. S4's energy beat and S5's boundary condition both land inside foundational, so the silent student meets the aha, the key misconception AND the law's condition on the default slice.

## 8. Prerequisites (advisory — Rule 23)

`angular_momentum` (#9) · `moment_of_inertia` (#6) · `tau_eq_i_alpha` (#7) · `rotational_work_energy` (#8). All in-chapter, NOT yet shipped; they precede this concept in the approved teaching order, so at 0d they will exist. No cross-chapter prerequisites.

## 9. Real-world anchor (Rule 35 / 38f — universal, culture-neutral)

**Primary: a person on a rotating stool, a mass in each hand, arms out — pulling them in makes them spin visibly faster.** Assigned to **S2**, ~8 words reserved. Placement pre-spoils nothing — it lands ON the aha it illustrates. The canonical demonstration, physically the EXACT system rendered (and now literally pictured: at home r = 0.80 the masses ride outside the braked platform radius, arms beyond the stool — P2-6), recognisable in any classroom in any country. **Secondary: a diver stretching out to slow the somersault before entering the water.** Assigned to **S3**, ~10 words — it fits the slow-down beat exactly. Both per the founder-approved survey table; the catalog's Bharatnatyam/Kathak/ISRO anchors are NOT imported. No region constants. The apparatus stays the abstract turntable (no human mesh — **the agent that does the work is nonetheless ON SCREEN as the rendered −r̂ arrows, F-4**).

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the 8 of §2, exactly as tabled in §3.

**(b) Symbol-label table + term-introduction ledger:**

| Quantity | Label | DEFINED at | First PRINTED at | ✓ |
|---|---|---|---|---|
| Angular momentum | `L` (axle arrow + HUD `4.59 kg·m²/s`) | S1 sentence 1–2 | S1, after it | ✓ |
| Moment of inertia | `I` (HUD `3.06 kg·m²`) | S1, same sentence | S1 | ✓ |
| Angular speed | `ω` (HUD `1.50 rad/s`) | S1, same sentence | S1 | ✓ |
| Each sliding mass | `m` | S1 ("two equal masses, m each") | S1 tag | ✓ |
| Mass radius | `r` (line from axle) | S2, first "radius" sentence | S2 | ✓ |
| Inward pull force | −r̂ arrows (label "pull") | S2, the sentence naming the pull (F-4) | S2 (tracked live in S3/S8 — P2-4) | ✓ |
| Before/after subscripts | `I₁ω₁ = I₂ω₂` | S3, one clause (overrun fallback: "before/after" labels on the formula surface) | S3 | ✓ |
| Predicted speed mark | **value chip `predicted ω = 1.50` adjacent to the live ω readout (F1 chip form — P1-2)** | S3, the prediction sentence | S3 | ✓ |
| Kinetic energy | `KE` (HUD + bar with tick) | S4 opening | S4 — never earlier | ✓ |
| External torque | `τ_ext` (at the pad) | S5 | S5 | ✓ |
| Braked (drum) radius | `R_drum` reference line (distinct style + label from `r`) | S5, "at the drum" | S5 | ✓ (P2-6) |
| Rate of change of L | `dL/dt` | S7 | S7 only | ✓ |

json_author note: every teacher_script glow target must name a primitive the state builds — glow-target set ⊆ built object ids (scars `ecp_glow_targets_missing_primitives`, `solenoid_focal_primitive_on_title_not_physics`: focal glow attaches to physics primitives, never titles).

**(c) Right-hand-rule plan:** S6 uses the **grip rule** — grip, not cross-product, because this teaches circulation→axis direction, not a single r × p (that belongs to #5/#9). One full curl per RUN, flipping between the two restarted runs (F-2).

**(d) Motion plan:** S1 spin + instrument build · S2 arrows → slide-in → spin-up (cause 0.7 s before effect), held · S3 prediction chip → slide-out with shortening arrows → ω meets the chip (match cue), held · S4 tick first, then arrows + pull-in, bar climbs and the gap HOLDS · S5 pad translate-in to the drum + joint decay (rest clamp on L) + release-and-hold · S6 run A → hard-cut restart (cue ≥ 0.5 s, readouts blanked) → run B, arrow flipped — the only looping state · S7 equation build + replay with dL/dt = 0.00, held · S8 free-running sandbox with idle triangle sweep. **All guided beats one-shot-hold except S6 (P1-1); every state entry a single-frame re-pose.** No passive state. **No claim without a rendered measurement:** every number stated is produced by the §3 metrics; every stated agent (the pull, the brake) is a rendered object.

**(e) Modes:** conceptual-only (Rule 20 [D]).

**(f)** `assessment` + `coverage_map` authored; `misconception_watch` exactly the 3 of §4.

**(g) Macro↔micro:** N/A-with-justification per §3.

**(h) Canvas budget:** per §3. New DOM panels at `top:52px+` BOTH edges (scars `field3d_sliders_panel_top12_vs_fsbtn_top10`, `cyclotron_timers_sliders_fullscreen_button_corner_collision`); caption/HUD/formula/slider zones distinct so nothing clips (`caption_clipped_by_adjacent_stat_box`).

**(i) Curriculum-flex (Rule 38):**
- **(i-1) Preset-cut coherence:** *Hide advanced (drop S7):* S1–S6 + S8 coherent; S8's five controls all map to surviving states. *Hide advanced+extended (drop S6–S7):* S1–S5 + S8 — coherent; **the law's condition survives in S5 (F-9)**; S1's axle arrow is a magnitude indicator only and no surviving state narrates its DIRECTION (direction semantics live entirely in S6); S8 keeps r/ω₀/m/brake, spin-direction cut with its ring.
- **(i-2)** Explore = core content only: `L = Iω` (stated by S1, surviving every preset) ✓.
- **(i-3) `curriculum_tags` (claims, not facts):** CBSE/NCERT covered, marked verified. JEE Main/Advanced core+extended+advanced · NEET core+extended · IB DP / A-level / AP Physics C — every cell `needs_teacher_verification: true`.
- **(i-4) Presets:** `full` = S1–S8 · `no_derivation` = hide S7 · `core_only` = hide S6–S7 (controls auto-cut by min_ring; the smallest preset RETAINS the condition beat — F-9).
- **(i-5) Graph axes:** no graph in any ring → N/A by design (scar `graph_title_caption_zorder_overlap` therefore N/A).

**Teacher-usability walk:** (1) *Does anything state the law and show it in the assessed representation?* Yes — S1 states it; S3 shows **I₁ω₁ = I₂ω₂** AND demonstrates it predictively (the readout meets the pre-computed chip — the exam's use of the equation, performed on screen); S7 formalizes. (2) *First thing a teacher tries after the aha, demonstrable in range?* Drag the masses and watch L hold — S8's r slider over [0.15, 0.90]; and "what if something DOES touch it" — S5's brake, **τ_brake ∈ [0, 2.0] N·m, default 0.92** (P2-5 — the dial now has a stated domain). (3) *Definition precedes use?* Yes — ledger §10(b).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `angular_momentum` → S1, patched by the one-breath restatement. `moment_of_inertia` → S2, patched by the `r` line shrinking WITH the I readout. `rotational_work_energy` → S4, one clause re-anchors KE = ½Iω². `tau_eq_i_alpha` → S5, one clause as the brake engages.

**JEE-backwards trace.** *"…I = 3.06 kg·m², ω = 1.5 rad/s; pulling in reduces I to 0.66. Find (i) the new ω, (ii) the KE ratio, (iii) where the extra energy came from."* (i) I₁ω₁ = I₂ω₂ used PREDICTIVELY → S1–S3 (S3 performs exactly this skill on screen; its instance predicts the slow-down where the exam item computes the speed-up — the skill transfers, noted per the cycle-2 rubric comment). (ii) KE = L²/2I ⇒ ratio I₁/I₂ → S4 (3.44 → 15.96 J shown). (iii) work done by the pull → S4, with the pull RENDERED (F-4). Condition distractor ("platform has friction") → S5. Direction variant → S6. No missing piece.

**Misconception entry mapping.** All three confronted proactively per §4. Planting risk: S2's narration could plant "energy for free" if it says the spin-up "costs nothing" — physics_author says "no external torque" (torque-free ≠ effort-free; the pull arrows are right there doing work) and S4 detonates the residue two clicks later.

## Block 2 — Aha-moment designation

- **PRIMARY aha, at S2:** *pull your arms in and you spin faster all by yourself — because L = Iω cannot change when nothing outside twists you.*
- **SUPPORTING aha, at S4:** *the speed-up is not free — kinetic energy goes UP, paid for by the real work of the visible inward pull.* Total = 2.
- **Wrong-belief setup.** Primary: S1 builds "nothing external acts, so nothing about the spin will change" before S2 breaks the ω half while keeping the L half. Supporting: S2+S3 build "the trade is exact and reversible, so nothing is gained or lost" — S3's predictive exactness makes that belief MORE confident, and S4 then shows exactly what is NOT conserved inside the exact-looking trade.
- **Foundational coverage:** S2 ∈ foundational (S1–S5) ✓.

---

## ENGINE REQUIREMENTS (for `field3d-surgeon`, build 0c-1) — REVISED per Checkpoint A cycles 1+2

All rows `[NEEDS-SCENARIO]`. **Changes vs REV 3: beat-termination + entry-pose contract added (P1-1); F1 split into two declared surface forms (P1-2); enum closure re-diffed with IMPLEMENTED/DEFERRED sets (P1-3); F5 consumed at S3/S8 (P2-4); brake numbers + slider domain (P2-5); rim → drum geometry (P2-6); E8 post-step snapshot + per-frame overlay re-fit (P2-7); E2 fold probe corrected + rest clamp restated on L (P3).**

1. **E1 — Live-recomputed I** — `I(t) = I_frame + Σ mᵢ rᵢ(t)²`, rᵢ varying DURING rotation. Never an authored constant.
2. **E2 — THE single angular-momentum integrator:**
   ```
   L(t+h) = L(t) + τ_ext·h        (rest clamp ON L: if τ_ext·h would carry L through zero, set L = 0
                                    — never clamp ω, a derived quantity)
   ω(t)   = L(t) / I(t)
   θ(t+h) = θ(t) + ω·h            (step-count-invariant form)
   ```
   No mode flag exists. τ_ext = 0 ⇒ L constant by construction, zero accumulation error; I constant ⇒ dω/dt = τ/I identically; **r dragged WHILE braking is automatically correct** (the α = (τ − ω·dI/dt)/I coupling emerges from the definition). **ω₀ is signable** — direction changes are RESTARTS; no easing-through-zero mechanism is built. Integrator discipline: sub-step count from real dt; dt = 0 under a pin takes zero steps. **Bring-up probes (P3 — corrected):** (a) drag `r` with `τ_brake > 0` for 20 s, assert ω(t) matches (L₀ + ∫τ)/I(t) to 1e-9; (b) **frame-dt fold with h held fixed** — 20 steps at dt = h vs 10 steps at dt = 2h (n = round(dt/h)), assert **\|θ_a − θ_b\| < 1e-12 and \|ω_a − ω_b\| < 1e-12** (per `explicit_linear_drag_is_unstable_at_the_damping_a_legible_settle_requires`; the cycle-1 "(h, h/2, h/4) reproduces θ" wording is retired — it folded the integrator step, which no fleet integrator satisfies).
3. ~~**E3**~~ — **DELETED** (merged into E2; tombstone so REV-2 cross-references don't dangle).
4. **E4 — Radial mass translation choreography** — symmetric slide on an authored **one-shot-hold ramp (`nlbRunParamRamp` shape, `field_3d_renderer.ts:42295–42338`), directed per state: S2 r 0.80 → 0.20 · S3 r 0.20 → 0.80 · S4 r 0.80 → 0.20 · S7 (replay) r 0.80 → 0.20**, each over ~2 s, clamp [0.15, 0.90], **held at `to` for the remainder of the state** (P1-1); **authored entry r = `param_ramp.from` in every ramped state; state entry = single-frame re-pose** (probe per the OPEN `field3d_param_ramp_authoring_contract` row: for every ramped state assert the authored entry value equals `ramp.from`; at t > end_ms assert the ramped param equals `to` and never re-approaches `from`). Live-drivable by the S8 slider (trusted-drag seizes); S8 runs an **idle auto-sweep (repeating triangle, `nlbRunIdleSweep` shape)** until first trusted input, thumb + label in lockstep.
5. **E5 — L vector along the axis** — arrow on the axle, length ∝ |L|, sign follows ω's sign (S1 magnitude; S6 direction). Label/sprite decollision applies (`field3d_label_sprite_overlap`, `radius_scenario_F_r_label_kerning_collision`, `solenoid_state3_annotation_orphaned_from_referent`): the `r` line, `R_drum` line, "pull" arrows and L arrow carry labels anchored to their referents, kern-checked, hysteretic if de-collided (`field3d_hard_threshold_label_decollision_pops_when_the_pair_separates`).
6. **E6 — KE_rot readout** — ½Iω² live; S4 bar scaled 1.1× the reachable peak (15.96 J → ~17.6 J full scale).
7. **E7 — Grip-rule hand tracking spin sign** — curl + thumb along axis, flips between runs of opposite ω₀ (the flip is BUILT and claimed at S6 — `solenoid_state7_hand_flip_unimplemented`; curl gestures sequenced one-per-run — `solenoid_state5_gesture_sequencing_absent`).
8. **E8 — Value-only HUD instruments** I / ω / L / KE, 2-dp, live per §3 metrics. **ONE post-step snapshot per frame publishes I, ω, L, KE and (S7) dL/dt — never a pre-step value beside a post-step one** (scar `derived_energy_sum_pairs_prestep_position_with_poststep_velocity`; **probe: assert all five HUD values consistent with the SAME published L and I in one frame snapshot**). Overlays whose position depends on a sibling that can appear MID-STATE (the S4 KE bar, the S3 chip) **re-measure per frame, churn-guarded, rounded to whole pixels — never once at entry** (scar `field3d_measured_overlay_fit_runs_once_against_a_sibling_blanked_on_entry`). Hold-glow on the pinned readout (brightness only, Rule 29) + a **re-pin cue** fired whenever a restart re-initialises L (S6 runs; S8 m/ω₀/direction — F-6): **the cue holds ≥ 0.5 s and the readouts blank across the cut** (P3). New top-anchored DOM panels at `top:52px+` BOTH edges; caption/formula/HUD/slider zones distinct. Per-state control rows hide with `visibility:hidden` + disabled input, never `display:none`; rows built only for tokens THIS concept names; thumbs re-synced on state entry.
9. **E9 — deriveStateMeta.ts co-edit in the SAME change, THREE sites:** `F3D_REVEAL_KEYS` · reveal-ms in `maxRevealForField3dState` · hold classification in `deriveHoldExpectations` — proven against BOTH config shapes. Continuous-spin states classified so the always-rotating home pose never reads as a frozen tail. Plus: no literal backticks in the renderer template body; apparatus not blanked by the generic `visible_elements` matcher; no per-state flag selects a build-time mesh branch.

**Finding rows:**

- **F1 — Generic `reference_marks[]` with TWO declared surface forms (P1-2):** each mark = value + label + own reveal cue + **a declared host-surface form**: **(chip form)** on a value-only numeric readout the mark renders as a **static labelled value chip adjacent to the live readout** (`predicted ω = 1.50`), with a **match cue — hold-glow on both, fired once when \|live − mark\| < 0.01** — as the live value sweeps to meet it; **(tick form)** on a bar the mark renders as a **labelled tick on the bar scale**. Consumed TWICE here: S3 chip form (ω), S4 tick form (KE, revealed FIRST, alone). Renderer verified absent (0 hits, both cycles). Reusable by #12's rolling race. Cost: small.
- **F2 — `τ_ext` as a SOURCE LIST, not brake-only:** `external_torque: { source: brake | applied_force_at_point | torsion_spring, … }`. This concept builds the **brake**: pad translates in, contacts the **drum at `brake_drum_radius_m` = 0.55** (drawn as its own labelled reference line, distinct from the r line; the rod and masses ride 0.25 m vertically above the pad plane — P2-6), applies an authored opposing τ, releases on cue, magnitude drivable by the S5/S8 slider over **[0, 2.0] N·m, default 0.92** (P2-5). **Frictional contract:** opposes ω; **rest clamp ON L** (E2 wording); NEVER reverses spin at any reachable slider value (seize slider 20 s at any value in [0, 2.0], ω monotone-decaying to ≥0, no rendered sign flip; at the 2.0 max the stop lands inside the engagement window and holds). **Time-pin contract:** S5's L(t) closed-form piecewise, replayed not latched (`hysteretic_state_cannot_be_latched_under_a_time_pin`). `applied_force_at_point` (#5, #7) and `torsion_spring` (τ = −κθ, #14) are DECLARED list members built under their own concepts' rows. #13's flywheel reuses the brake. Cost: small.
- ~~**F3**~~ — **DELETED** (no mode to switch). Contract-shape check retained: every §3 state is expressible as ONE config object under the single-integrator + τ_ext-source shape (`state_added_at_review_outruns_the_config_contract_shape`).
- ~~**F4**~~ — **DELETED** (direction changes are restarts on E2's signable ω₀; build no easing-through-zero choreography).
- **F5 — Radial force arrow attachable to any mass, along −r̂, with authored reveal cue.** Renders the agent doing the work in S2/S4; **in S3 and S8 the arrows persist and TRACK the motion — shortening during outward slides, lengthening inward, always along −r̂ (P2-4: the agent eases its hold; it never pushes outward)**. Visually it is the survey's #5 "force applied at a point on the body" pointed at the axis — reuse that machinery, build once. Also the picture for `internal_forces_no_torque` (arrow through the axis ⇒ zero moment arm). Cost: one arrow.

**Camera note (restored — scar `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed`, dropped in REV 3 by error):** S6's side-on reframe and any 0c-1 camera solve must sweep EVERY free coordinate before reporting an empty feasible band, report the feasible-region size, and take the robust interior, never the argmax.

**Survey addenda (Ruling 5, carried):** three built items are absent from `phase0_survey.md`'s union + closing additions and were raised at 0b before any code — **the dispatching session should append them to the survey's 0c-1 union table as an explicit addendum for the founder's awareness**: (1) `reference_marks[]` with the two surface forms (F1); (2) the visible brake actuator + `brake_drum_radius_m` + drawn drum reference line (F2); (3) the re-pin cue (E8). F5 is NOT an addendum — survey row #5 already authorises force-applied-at-a-point.

### Enum-closure contract (P1-3 — a shown, BOTH-direction diff against `phase0_survey.md`, union table + closing additions L223–232)

**Direction 1 — every survey union/closing row maps to ≥1 declared token (closing additions cited by line):**

| Survey capability (line) | Declared token(s) |
|---|---|
| Composite body as a parts list, per-part mass + centroid (#1 — L230) | `parts[] {mass, centroid}` |
| Multi-body system + live CoM marker and path trace (#2, #3 — L229) | `bodies[]` (multi-body list) + `cm_marker` + `cm_path_trace` + `fragment_trigger` |
| Particle set (#1, #2) | `particle_mass[i]` / `particle_pos[i]` |
| Body shape (#1, #3) | `body_shape` |
| θ₀ / ω₀ / α-drive (#4, #7) | `θ₀` / `ω₀ (signed)` / `α_drive` |
| Live cross-product construction, r × F and r × p, ⊥ result + RHR (#5, #9 — L227) | `cross_product_construction {inputs, result, rhr_hand}` (inputs: `F_applied`, `F_point`, `F_angle`) |
| Parallel-axis + perpendicular-axis geometry, two axes at once with d drawn (#6 — L228) | `axis_select` + **`axis_pair {a, b}` + `d_draw` + the perpendicular-axis triple** |
| Varying-τ work/power (#8) | covered by the τ_ext source list + existing bar/accumulator (survey: no new build) |
| Live-varying I (#10 — this concept) | `r` · `m` |
| Brake / flywheel (#13) | `τ_brake` + `brake_drum_radius_m` |
| Torsion spring (#14) | `κ` (via `torsion_spring` source) |
| Rolling-vs-slipping regime switch (#12 — L231) | **correctly EXCLUDED — 0c-2's enum, not 0c-1's** ✓ |

**Direction 2 — every declared token maps to ≥1 survey row (no orphan tokens):** `particle_mass[i]`/`particle_pos[i]` → #1/#2 · `body_shape` → #1/#3 · `parts[]` → #1 · `bodies[]`/`cm_marker`/`cm_path_trace`/`fragment_trigger` → #2/#3 · `axis_select`/`axis_pair`/`d_draw`/perp-triple → #6 · `θ₀`/`ω₀`/`α_drive` → #4/#7 · `cross_product_construction` + `F_applied`/`F_point`/`F_angle` → #5/#9 · `r`/`m` → #10 · `τ_brake`/`brake_drum_radius_m` → #10/#13 · `κ` → #14 · `spin_sign` → #10 (S6/S8 restart control) · `reference_marks[]`/re-pin cue → survey addenda above ✓.

**IMPLEMENTED / DEFERRED split (scar `deferred_enum_members_must_be_declared_not_merely_unimplemented`, applied to the WHOLE list):**

- **IMPLEMENTED at 0c-1 under THIS spec driver:** `r` · `ω₀ (signed)` · `m` · `spin_sign` · `τ_brake` + `brake_drum_radius_m` (brake source) · `reference_marks[]` (both surface forms) · radial force arrow (F5) · re-pin cue.
- **DEFERRED (declared enum members, built under their own concepts' 0c-1 rows — declared now so the enum never reopens):** `particle_mass[i]` / `particle_pos[i]` · `body_shape` · `parts[] {mass, centroid}` · `bodies[]` + `cm_marker` + `cm_path_trace` + `fragment_trigger` · `axis_select` · `axis_pair {a, b}` + `d_draw` + perpendicular-axis triple · `θ₀` / `α_drive` · `cross_product_construction {inputs: F_applied, F_point, F_angle; result; rhr_hand}` · `torsion_spring` (`κ`) · `applied_force_at_point`.
- **Union of the two sets = the frozen 0c-1 contract; intersection = ∅** (checked by inspection: no token appears in both). Rolling-vs-slipping is a member of NEITHER — it belongs to 0c-2 (survey L231).

**Per-state × engine-row WALK (both directions; F5 at S3/S8 added per P2-4; E1 at S6 per P3):**

| State | Consumes |
|---|---|
| S1 | E1, E2, E5 (magnitude), E8, E9 |
| S2 | E1, E2, E4, **F5**, E8, E9 |
| S3 | E1, E2, E4, **F1 (chip form)**, **F5 (shortening)**, E8, E9 |
| S4 | E1, E2, E4 (pull-in, held), E6, **F1 (tick form)**, **F5**, E8, E9 |
| S5 | E1, E2 (τ_ext = brake), **F2** (incl. drum line), E8, E9 |
| S6 | **E1**, E2 (signable ω₀, restart), E5, E7, E8 (re-pin cue), E9 |
| S7 | E1, E2, E4 (replay), E8 (dL/dt), E9 |
| S8 | E1, E2 (live brake + restart), E4 (slider + idle sweep), **F2**, **F5 (live tracking)**, E8, E9 |

Reverse: every live row E1, E2, E4–E9, F1, F2, F5 claimed by ≥1 state ✓; every state claims ≥1 row ✓; deleted rows E3/F3/F4 claimed by none ✓.

**Registration note:** json_author inserts the `concept_panel_config` row (default_panel_count=1) in the SAME session at 0d — where `field3d_particle_field_vestigial_dual_panel_config_gap` and `teach_auditor_reads_field3d_sliders_from_config_not_scene_composition` also bind (the 0d auditor reads the control surface from `field_3d_config` + rendered frames, never scene_composition placeholders).

**Explicitly NOT required:** graphs/curve panels, energy bars beyond the KE readout+marks, a human figure mesh, precession machinery, multi-body fragmentation (#2), the r × p construction (#5/#9), any eased spin-reversal mechanism (deleted F4), any integrator-mode enum (deleted F3).

---

## SCAR AUDIT

**Queries run (this session, REV 4 — LIVE table via Bash):**

```
query_engine_bug_queue.ts --owner alex:architect                      → 32 rows
query_engine_bug_queue.ts --row-type directive                        → 47 rows
query_engine_bug_queue.ts --field3d --open                            → 30 rows
query_engine_bug_queue.ts newtons_laws_body                           → 0 rows (script's FIELD3D list, query_engine_bug_queue.ts:23, has no nlb concepts — family rows surface via --owner/--row-type)
query_engine_bug_queue.ts conservation_of_angular_momentum            → 0 rows (concept not yet authored — expected)
query_engine_bug_queue.ts rigid_body_rotation                         → 0 rows (scenario not yet built — expected)
```

**Superset discipline (P2-7 — executed mechanically this session):** the three list queries' result `bug_class` strings were extracted, deduplicated (**77 unique rows**), and diffed against this document. **Every row appears below VERBATIM with an explicit verdict** — no ellipses, no wildcards (REV 3's `…`-abbreviations and "layout/kerning rows" wildcard are what made its declared boundary false). Not queried: nothing beyond the six commands above; any row outside those result sets is NOT dispositioned here.

**Complete disposition table (77 rows; B = binds this design, 0c/0d = binds the named later stage, N/A = with reason):**

| # | bug_class (verbatim) | Verdict |
|---|---|---|
| 1 | `archetype_live_tier_unverified_against_renderer` | B-satisfied — blanket [NEEDS-SCENARIO]; the one renderer claim made (ramp hold shape) verified at file:line in the header |
| 2 | `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` | N/A — no engine limit invoked (scenario doesn't exist); the ramp-shape citation quotes both comment (L42296–98) and code (L42330) per the row's DO |
| 3 | `CACHE_UPSERT_CONFLICT_TARGET_MISSING` | 0d — serving/cache path; binds the registration session, not this skeleton |
| 4 | `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed` | B — restored (dropped in REV 3 by error): S6 reframe + any 0c-1 camera solve sweeps every free coordinate; carried as the Camera note |
| 5 | `caption_clipped_by_adjacent_stat_box` | B — §10(h)/E8: caption/HUD/formula/slider zones distinct, nothing adjacent to the caption |
| 6 | `chemistry_concept_id_collides_with_rostered_physics_id` | B-satisfied — namespace check in the header (both trees) |
| 7 | `closed_enum_cannot_name_a_substance_the_design_teaches` | B-satisfied — enum closed against the 12-concept union via the shown both-direction diff (P1-3) |
| 8 | `concept_taught_its_own_quantity_without_the_canonical_picture` | B-satisfied — S3 shows AND uses the assessed form I₁ω₁ = I₂ω₂ |
| 9 | `contact_detected_slow_window_arms_one_frame_late_and_buries_the_body_at_full_dt` | N/A-with-adoption — no contact DETECTION exists (pad engagement is an authored cue); the analogous discrete event (rest clamp) has its event time computed at engine step size per row 47's DO |
| 10 | `contrast_ghost_coresident_with_the_real_set_fuses_both` | N/A — no ghost overlays; every contrast is sequential in time, never co-resident |
| 11 | `cyclotron_timers_sliders_fullscreen_button_corner_collision` | B — E8: `top:52px+` both edges; corner zones reserved |
| 12 | `deferred_enum_members_must_be_declared_not_merely_unimplemented` | B-satisfied — applied to the WHOLE token list: explicit IMPLEMENTED/DEFERRED sets, union = contract, intersection ∅ |
| 13 | `derivation_principle_applied_to_one_beat_but_not_its_sibling` | B — was carried "satisfied" and was not (P2-4); NOW satisfied: F5 arrows on BOTH beats of the S2/S3 pair (shortening outward) and on S8's drag; dispatching session appends this concept to the row |
| 14 | `derived_energy_sum_pairs_prestep_position_with_poststep_velocity` | B — E8's one-post-step-snapshot requirement + same-frame consistency probe (P2-7) |
| 15 | `derived_readout_asserted_by_value_without_defining_its_metric` | B-satisfied — §3 metrics block defines every readout; REV-2 tautology retired with the mode enum |
| 16 | `derivestatemeta_new_scenario_key_absent_from_f3d_reveal_keys_falls_through_to_pcpl` | 0c — E9 three-site co-edit in the SAME change |
| 17 | `directive_no_gate_asks_whether_a_teacher_could_use_it` | B-satisfied — Teacher-usability walk (§10), now with the brake dial's stated domain |
| 18 | `ecp_glow_targets_missing_primitives` | 0d — json_author note §10(b): glow-target set ⊆ built ids |
| 19 | `explicit_linear_drag_is_unstable_at_the_damping_a_legible_settle_requires` | B — the brake is constant-magnitude frictional, not linear drag; its fold probe adopted VERBATIM in E2 (P3 correction) |
| 20 | `explore_controls_not_ring_gated_survive_the_ring_cut` | B-satisfied — min_ring gating, both cuts walked (§3) |
| 21 | `explore_state_formula_surface_asserts_a_relation_no_state_derives` | B-satisfied — S8's `L = Iω` stated by S1, surviving every preset |
| 22 | `eye_motion_map_reads_cached_physics_config_which_holds_only_epic_l_path` | 0d — THE EYE session; noted |
| 23 | `field3d_build_once_body_reads_a_per_state_flag_from_the_union_def_and_mis_renders_silently` | 0c — E9: no per-state flag selects a build-time mesh branch |
| 24 | `field3d_formula_overlay_generic_not_cambria_math` | B — Rule 34b math-serif formula surface (§3 canvas budget) |
| 25 | `field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus` | 0c — E9 |
| 26 | `field3d_hanging_body_gravity_sign_inverted_vs_own_axis` | B-adopted — its general prevention (execute every closed-form checksum numerically before closing a seam) = the E-a probe discipline |
| 27 | `field3d_hard_threshold_label_decollision_pops_when_the_pair_separates` | 0c — E5 label note: decollision hysteretic |
| 28 | `field3d_label_sprite_overlap` | 0c — E5 label note: r / R_drum / pull / L labels decollided |
| 29 | `field3d_measured_overlay_fit_runs_once_against_a_sibling_blanked_on_entry` | B — E8: mid-state-appearing siblings (S4 bar, S3 chip) ⇒ per-frame churn-guarded re-measure (P2-7) |
| 30 | `field3d_newtons_laws_body_surface_slab_cannot_be_hidden_for_a_both_hanging_atwood_state` | N/A — nlb-only apparatus flag; the new scenario owns its apparatus visibility |
| 31 | `field3d_param_ramp_authoring_contract` | **B — the P1-1 row:** ENTRY CONFIG column + entry-r-equals-`from` rule + single-frame re-pose; its probe carried verbatim into E4 |
| 32 | `field3d_particle_field_vestigial_dual_panel_config_gap` | 0d — registration note (default_panel_count=1) |
| 33 | `field3d_per_state_slider_rows_collapsed_in_a_bottom_anchored_panel_make_shared_rows_jump` | B — E8: `visibility:hidden`, never `display:none`; shared rows keep position |
| 34 | `field3d_pinned_rewind_reproduces_the_instant_but_not_the_last_float_bit` | B-inherited — closed-form/replay contracts (F2, ramp shape reads only `eng.t_ms`) |
| 35 | `field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive` | B-satisfied — every misconception picture names its primitive (§4: F1 both forms, F5, E5/E7) |
| 36 | `field3d_sliders_panel_top12_vs_fsbtn_top10` | B — E8 `top:52px+` |
| 37 | `ghost_compare_b_handoff_instant_snap` | B — S6's cut is a NARRATED restart with re-pin cue ≥ 0.5 s + blanked readouts — the honest form of a discontinuity, never a snap posing as physics |
| 38 | `ghost_compare_cause_invisible_slider_frozen` | B — S8 idle sweep moves thumb + numeric label in lockstep |
| 39 | `graph_title_caption_zorder_overlap` | N/A — no graph in any ring (§10 i-5) |
| 40 | `hysteretic_state_cannot_be_latched_under_a_time_pin` | B — F2: S5's L(t) closed-form piecewise, replayed not latched |
| 41 | `lesson_never_states_the_principle_it_is_named_after` | B-satisfied — S1 states, S3 shows in the assessed representation, S7 derives |
| 42 | `magnetic_flux_loop_scenario_new_build` | N/A — precedent record of a prior new-scenario build; informs E9's checklist, no action |
| 43 | `narration_attributes_an_effect_to_a_cause_the_model_does_not_contain` | B-satisfied — every stated agent is rendered (F5 arrows, F2 pad) |
| 44 | `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate` | N/A — no checkpoints in this design |
| 45 | `nlb_frictionless_state_with_an_opposing_applied_force_reverses_and_unwinds_its_own_work_ledger` | B — F2 frictional contract: rest clamp on L, never reverses; 20 s seize probe over the DEFINED domain [0, 2.0] |
| 46 | `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows` | B — per-state duration table with pre-roll included, margins stated; physics_author recomputes at engine step size |
| 47 | `nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula` | B — transferable half answered STRUCTURALLY by P1-1: one-shot-hold beats mean the pin can only photograph the held claim; S6 (the one looping state) has its pin phase stated |
| 48 | `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control` | B-satisfied — archetype-discharge rule (§3, re-worded off "loop reset") |
| 49 | `nlb_multibody_lane_gap_is_along_z_so_a_head_on_camera_stacks_the_compared_bodies` | N/A — single body, no lanes; camera obligations live under row 4 |
| 50 | `nlb_seized_slider_run_overruns_a_loop_sized_work_scale` | N/A-by-construction — the only fixed-scale bar (S4) lives in a sliderless state; S8's HUD is value-only; noted for json_author |
| 51 | `nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm` | B-satisfied — clamp [0.15, 0.90], taught poses strictly inside |
| 52 | `oncanvas_formula_asserts_a_value_the_renderer_cannot_show` | B-satisfied — all formula surfaces symbolic; numbers only in HUD + marks the live readouts meet |
| 53 | `phase0_union_table_asserted_not_walked_state_by_state` | B-satisfied — per-state × engine-row walk, both directions, F5/E1 claims corrected this cycle |
| 54 | `ppc_probe_points_primitive_new_build` | N/A — precedent record (2D probe-points primitive); no probe points in this design |
| 55 | `radius_scenario_F_r_label_kerning_collision` | 0c — E5 label note: "pull" / `r` / `R_drum` kerning checked |
| 56 | `real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget` | B-satisfied — anchors state-assigned with word budgets (S2 ~8, S3 ~10) |
| 57 | `solenoid_focal_primitive_on_title_not_physics` | 0d — §10(b) json_author note: glow focal on physics primitives, never titles |
| 58 | `solenoid_state3_annotation_orphaned_from_referent` | 0c — E5 label note: labels anchored to referents |
| 59 | `solenoid_state4_outside_fade_narrated_not_shown` | B-satisfied — DoD (d): no claim without a rendered measurement/agent |
| 60 | `solenoid_state5_gesture_sequencing_absent` | B — E7: one full curl per run, sequenced, flips between runs |
| 61 | `solenoid_state7_hand_flip_unimplemented` | B — E7 builds the flip explicitly; walk claims it at S6 |
| 62 | `spec_semi_implicit_euler_position_not_step_count_invariant` | B — E2's θ update in step-count-invariant form; corrected frame-dt fold probe (P3) |
| 63 | `state_added_at_review_outruns_the_config_contract_shape` | B — F3-tombstone check: every state expressible as ONE config object under the frozen shape |
| 64 | `symbol_printed_on_canvas_before_the_lesson_defines_it` | B-satisfied — §10(b) ledger, DEFINED/PRINTED columns (chip, drum line, arrows included) |
| 65 | `teach_auditor_reads_field3d_sliders_from_config_not_scene_composition` | 0d — the audit reads controls from `field_3d_config` + frames (registration note) |
| 66 | `teach_color_each_element_by_its_own_sign` | 0b/physics_author — noted: sign-carrying elements (L arrow ±, ω readout sign in S6) colored by their own sign, consistently across runs |
| 67 | `teach_concrete_before_abstract_compare` | B-satisfied — concrete S2 precedes the equation (S3); anchor lands ON the aha |
| 68 | `teach_coordinate_sim_with_graph` | N/A — no graph |
| 69 | `teach_distinct_reference_lines_for_two_radii` | B — r + `R_drum` as distinct labelled lines; STRENGTHENED by P2-6 (masses cross and sit outside the braked radius) |
| 70 | `teach_do_not_prespoil_a_later_reveal` | B-satisfied — KE never printed before S4; dL/dt S7-only; direction semantics S6-only |
| 71 | `teach_field3d_explore_grab_and_move_field_point` | B-satisfied — S8's r is a live grab-drag with idle sweep until trusted input |
| 72 | `teach_inverted_scenario_inverts_cutline_flags` | N/A — no sibling inversion; noted for #7/#13/#14 |
| 73 | `teach_read_dense_ramp_frames_not_just_frozen` | B — §3: THE EYE reads dense frames across the S2/S3/S4/S5 ramp windows |
| 74 | `teach_reveal_synced_to_narration` | B/physics_author — S1's instrument build sentence-synced (§3 S1); carried to the physics block |
| 75 | `teach_show_quantity_live_when_named` | B-satisfied — HUD live from S1; KE live from S4; dL/dt live in S7 |
| 76 | `teach_visual_must_match_narration` | B — claim-by-claim audit carried; dispatching session appends this concept to the row (standing recommendation, both cycles) |
| 77 | `verification_via_applystate_bypasses_player_false_hang` | 0d — validator-side; verification drives the real player |

**The six REV-2 failing dispositions remain re-done as REV 3 recorded them** (verified LANDED by the cycle-2 report's Pass-1 table); rows 13, 31, 14, 4, 29, 65 above are the cycle-2 additions/corrections.

---

## FIX-CYCLE-1 RESPONSE

Preserved in `skeleton_rev3.md`; all twelve fixes verified LANDED in the cycle-2 report ("none is a paper claim") — carried structurally intact here, un-churned per the cycle-2 dispatch.

---

*Handoff: → founder-proxy Checkpoint A re-submission (**fix cycle 2 of 2 — the last**). On `DESIGN_OK`: physics_author, then 0c-1 dispatch to field3d-surgeon on `feat/rotmech-engine`. The dispatching session also: (1) appends the three survey addenda (F1, brake actuator + drum geometry, re-pin cue) to `phase0_survey.md`'s 0c-1 union table; (2) appends `conservation_of_angular_momentum` to the OPEN `teach_visual_must_match_narration` and `derivation_principle_applied_to_one_beat_but_not_its_sibling` rows; (3) files the cycle-2 candidate scar rows per the report's SQL.*

---

## Notes to the reviewer (verification aids)

- **P1-1:** the one-shot-hold contract opens §3; the ENTRY CONFIG column is in the §3 table (rule stated in the column header); the single-frame re-pose is in §2 + named at S5's entry cell; E4 carries the directed ramps + both probes; SCAR AUDIT row 31 dispositions the OPEN row. The renderer citation was re-verified against source this session (comment L42296–98, hold branch L42330).
- **P1-2:** chip form + match cue at §3 S3, tick form at §3 S4, both declared in F1, ledger row updated. The report's wording was adopted essentially verbatim.
- **P1-3:** the enum block is now a two-direction diff table citing survey lines L227–231, with the four added token groups and the IMPLEMENTED/DEFERRED split; #12 recorded as correctly excluded.
- **Arithmetic added this cycle (S5):** ΔL = 0.92 × 2.5 = 2.30; L 4.59 − 2.30 = 2.29; ω = 2.29/3.06 = 0.7484 → 0.75; KE = 2.29²/6.12 = 0.8569 → 0.86; max-τ stop time 4.59/2.0 = 2.295 s < 2.5 s. Held quadruple (3.06, 0.75, 2.29, 0.86) pairwise distinct at 2 dp. Implied drum mass 2·0.35/0.55² ≈ 2.3 kg.
- The superset diff is reproducible: extract `bug_class` strings from the three list queries, dedupe (77), grep each verbatim against this document — zero misses by construction.
