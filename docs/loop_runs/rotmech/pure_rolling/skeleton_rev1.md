# SKELETON — `pure_rolling` (chapter `rotmech`, Class 11 Ch.7 — Systems of Particles & Rotational Motion) — REV 1

> **Phase-0 role:** 0b skeleton for concept **#11** of the 14-concept spine (★ Diamond, **V1**), second consumer of build **0c-2** (bounded rotational extension to `newtons_laws_body`). Sibling: `rolling_on_incline` (#12, REV 3, through founder-proxy fix cycle 1). This skeleton exists so the 0c-2 union is measured against BOTH concepts before the surgeon dispatch — it resolves the sibling's declared union-scope limit (P2-5). The closing section **"0c-2 ENGINE UNION — pure_rolling contribution"** is the load-bearing artifact.
> Survey: `docs/loop_runs/rotmech/phase0_survey.md` (founder-approved 2026-08-02).
>
> **Engine bug queue consultation (live, queries stated):** `--owner alex:architect` (32 rows) · `--row-type directive` (47 rows) · `pure_rolling` / `rolling_on_incline` / `newtons_laws_body` (0 rows each — new ids; scenario names are not concept ids) · `friction_force` (4 rows) / `work_done_by_constant_force` (27 rows — the nlb fleet rows) · direct read-only SELECT by `bug_class` for the eight scenario-scoped rows the sibling's Checkpoint A named (clock, occlusion, camera target, ground plane, label bleed, formula zones, formula wrap, param_ramp contract) — **all eight returned and dispositioned below**. `--field3d --open` was NOT used as coverage (its hardcoded concept list at script line 23 contains zero nlb concepts — the sibling's REV 2 root cause).
> **Renderer claims re-verified in code this session:** `length_m` half-length `:940` (readers `:40061–40067`, `:44176`); `nlbGravAlong` sign `:45093–45096` (+s = up-slope; irrelevant sign-wise at θ = 0 but fixes the s-axis convention); contact lift `NLB_BODY_SIZE/2` `:40015`; spin divisor `NLB_WHEEL_R` `:40053`; `NLB_LANE_GAP = 0.85` `:39610`; lane derivation + `fixed` early-out `:39998–40005`; `controls_visible` closed enum `:1340`; `readouts` closed enum `:1336`; θ-arc "theta = 0 is NOT special-cased… the arc simply collapses and hides" `:40070–40078` (flat states carry no arc — the arc-overrun scar self-resolves at θ = 0); energy-panel `slice(0,2)` `:43247/:43356` (SEAM L untouched by this design); `surface.theta_deg` "0 = flat ground, SAME code path" `:939`.

## 1. Atomic claim

This concept teaches the rolling-without-slipping condition v = Rω and its direct consequence: the contact point of a rolling body is instantaneously at rest, so the friction at a rolling contact is static, never kinetic. It does NOT teach the incline race or the shape factor I/mR² (deferred to `rolling_on_incline`, which follows it and recaps this concept in one beat), and it does NOT teach rotational kinetic energy (deferred to `rotational_work_energy`).

## 2. State count + arc

**7 states.** Calibration note: `pure_rolling` is medium (5–6 band); it lands at 7 because the advanced ring carries the slipping→rolling capture — the JEE-classic payoff the concept is examined on — as its own ring-gated state. The core block alone is 4 states + explore, inside the band under every reduced preset. Rings: core S1–S4, extended S5, advanced S6 (contiguous, immediately before explore), explore S7.

| State | Title (Rule 41 — literal, rail-truncation-safe) | Purpose | teaching_method | depth_ring |
|---|---|---|---|---|
| STATE_1 | Rolling: moving and turning together | Hook — a wheel crosses the track; both v and ω are live from the first second | straightforward beat | core |
| STATE_2 | One turn, one circumference | The condition, concretely: each full turn advances exactly 2πR, so v = Rω | straightforward beat | core |
| STATE_3 | The contact point is at rest | PRIMARY aha: the rim point's cycloid comes to a cusp; contact readout holds 0.00 m/s | straightforward beat (16a) | core |
| STATE_4 | No sliding, no kinetic friction | RM-G7 kill: a locked wheel skids, slows and stops; the rolling wheel does not — SEQUENTIAL contrast | straightforward beat (16a) | core |
| STATE_5 | Rolling = sliding plus spinning | The decomposition: pure slide + pure spin added give the 0 / v / 2v point speeds | straightforward beat | extended |
| STATE_6 | Sliding becomes rolling | A wheel launched moving but not spinning: kinetic friction spins it up until v = Rω, then rolling holds | straightforward beat | advanced |
| STATE_7 | Roll it yourself | Sandbox — controls per `min_ring`, core-ring content only | exploration_sliders | explore |

The hook MOVES (S1 is a full roll). No `narrative_socratic`, no `wait_for_answer`, no `pause_after_ms`.

## 3. Per-state choreography + control plan (Rule 31 control table)

Every state: flat ground (`theta_deg = 0` — same code path, `:939`; no θ-arc renders, `:40070`), single body, centre lane — **no two bodies are ever co-present in any frame of this concept** (S4/S5's compares are sequential dissolves). Wheel: `shape: 'wheel'` (SEAM G — tyre + hub + crossed spokes make spin legible with the existing mesh; no new mesh needed), m = 1 kg, `radius_m = 0.25` ((b)-9), k = 0.5 authored on the body (consumed by the integrator only — **no k chip ever renders in this concept**; k is `rolling_on_incline`'s taught quantity, Rule: do-not-prespoil).

| State | Teaches | Archetype | Distinct motion | Delta cue | Live controls | Words | Ring |
|---|---|---|---|---|---|---|---|
| S1 | Rolling has both v and ω | `translate-through` | The wheel rolls the track toward −s at v = 1.2 m/s; spokes turn; readouts `v` and `ω` appear and hold nonzero together. Closing sentence = the primary anchor (8 words) | "Moving and turning together" | none | 30–40 | core |
| S2 | v = Rω, from geometry first | `reveal-build` | The wheel rolls at 0.9 m/s; at each COMPLETED turn a ground mark stamps (CAUSE: the marked spoke returns upright; EFFECT: the mark, one readable beat later) and a bracket labelled `2πR = 1.57 m` draws between marks; then the formula surface builds `one turn → 2πR` → `v = Rω`; readouts `v 0.90` and `Rω 0.90` sit equal. Concrete before abstract: the bracket precedes the formula. The R slider is the Rule-31 extra — a drag re-lifts and re-scales the wheel and respaces the marks live | "One turn, one circumference" | R (0.15–0.35 m) | 35–50 | core |
| S3 | The contact point is instantaneously at rest | `flow-along-path` | Slow roll (0.6 m/s), camera closed on the contact ((b)-13 target). A marked rim dot (starts at top) streams along its cycloid; at the ground touch the trace comes to a CUSP and the dot visibly stops while the wheel keeps moving; arrows: centre = v, contact ≈ 0 (**top arrow deliberately NOT shown — it is S5's reveal**); readout `contact 0.00 m/s` holds zero the whole state | "Contact point speed: zero" | none | 35–50 | core |
| S4 | Sliding contact = kinetic friction; rolling contact = none | `cycle-compare` — sequential contrast beat (16a), never co-present | Phase A (0–1500 ms): a `rotation_locked` wheel (`nlb_wheel_locked`, its own id) skids in at 2.0 m/s, μ_k = 0.2 → slows at 1.96 m/s², leaves a skid trail, `f_k 1.96 N` readout, stops at 1020 ms, holds, DISSOLVES. Phase B (1500 ms→): the rolling wheel assembles at the home pose and crosses at a constant 2.0 m/s — no trail, `contact 0.00`, `f 0.00 N` (honest: level ground, steady speed ⇒ zero friction needed). Secondary anchor (≤12 words) closes the narration | "Skid slows; roll does not" | none | 40–55 | core |
| S5 | The 0 / v / 2v point-speed field, by superposition | `superpose-combine` (coined — rhythm: part-motion A alone → part-motion B alone → their SUM as one motion; nearest neighbour it is NOT: `cycle-compare`, whose payoff is a contrast, where this beat's payoff is an addition) | Frictionless surface flag (honest for all three phases). Phase A (0–1400 ms): a wheel SLIDES without turning at 1.0 m/s — arrows at top/centre/bottom all equal v; dissolve. Phase B (1400–2800 ms): a wheel SPINS in place at the home pose, ω = 4 rad/s — rim arrows ±Rω = 1.0 m/s, centre 0; dissolve. Phase C (2800 ms→): the rolling wheel (v = 1.0, ω = 4, v = Rω ✓) rolls with the summed arrows: top 2.0, centre 1.0, contact 0.0, while the formula surface builds `v + Rω = 2v` then `v − Rω = 0` | "Slide plus spin: roll" | none | 40–55 | extended |
| S6 | Kinetic friction drives a slipping body TO rolling | `regime-switch` (shared coin with sibling S7, honestly differentiated: their rhythm is steady → threshold → sudden FAILURE of rolling; this one is visible convergence → capture → steady rolling — the same law-in-force change, opposite direction) | The wheel launches at v₀ = 2.0 m/s with ZERO spin (`omega0 = 0`, (c)-2) on μ_k = 0.05: contact slides (skid trail, spokes visibly lag), kinetic friction slows v AND spins ω up; readouts `v` and `Rω` visibly CONVERGE while the focal `contact` readout counts DOWN; at **capture (t = 1361 ms**, closed-form, below) contact hits 0.00, the trail stops, and rolling persists to the loop end. The v₀ slider is the Rule-31 extra (envelope below) | "Sliding becomes rolling" | v₀ (1.0–2.5 m/s) | 35–50 | advanced |
| S7 | Everything, teacher-driven | `drag-sandbox` | One wheel, sandbox wrap, trusted drag; readouts v, Rω, contact live; rim-point trace on. CORE content only (38b): contact + centre arrows, v = Rω furniture — **no top arrow, no formula surface, no k anywhere** | "All controls live" | see min_ring table | 0 / open | explore |

**S7 explore controls with `min_ring`:**

| Control | `min_ring` | Guided state that teaches it |
|---|---|---|
| v₀ (0.5–2.5 m/s) | core | S1 (speed is S1's defined variable) |
| R (0.15–0.35 m) | core | S2 |
| ω₀ starting spin (0–12 rad/s) | **advanced** | S6 (a v–ω mismatch is S6's lesson) |
| μ_k (0.02–0.30) | **advanced** | deliberately advanced, NOT S4: with ω₀ hidden the sandbox always starts rolling, where μ_k does nothing visible on level ground (f = 0) — a dial that changes nothing fails the teacher test; its sandbox lesson (capture time) is S6's |

*Hide advanced* → v₀ + R survive; the sandbox always starts rolling (ω₀ defaults to v₀/R) and every surviving readout is taught ✓. *Hide advanced+extended* → same set ✓. Under the FULL preset a teacher can author a v–ω mismatch and watch capture — the cue that explains it is the converging v / Rω / contact readouts, all CORE furniture, so no ring-suppressed-cue defect is possible.

**Home pose + track geometry (both sides quoted):** `length_m` is a half-length (declaration `:940`; readers `:40061–40067`, `:44176`) → **`surface.length_m = 3.0`, ONE value concept-wide** (the ground-plane row: sized once, never per state), rendering a 6.0 m flat track, s ∈ [−3.0, +3.0]. **`initial_position_m = +2.4`** every state (0.6 m inset from +3.0 ≥ 2× the wheel radius 0.25 — the track-bound scar). All motion toward −s (v₀ authored negative; readouts display magnitudes — metric |v|, |ω|R). S2's revolution marks are arithmetic on the home pose (the checkpoint-coordinate scar): mark n at **s_n = 2.4 − 1.5708·n** (marks at +0.829, −0.742; both ≥ 2.25 m inside the bounds).

**Loop-reset / frozen-pin timing (g = 9.8; all numbers re-derivable from the declared geometry; json_author re-verifies at h = 1/60; the whole table is CONDITIONAL on the state-local clock, (b)-11):**

| State | R (ms) | Last asserted event | Event time | < 55% R? | Pin 0.60R | What the pin photographs · margin |
|---|---|---|---|---|---|---|
| S1 | 4000 | none discrete (continuous roll; 1.2 m/s × 4.0 s = 4.8 m → ends s = −2.4, 0.6 m inside the bound) | — | ✓ | 2400 | mid-roll at s = −0.48, both readouts live |
| S2 | 5000 | mark 1 stamps (d = 2πR = 1.5708 m at 0.9 m/s) | 1745 ms (34.9%) | ✓ | 3000 | wheel mid-2nd turn, mark 1 + bracket stamped · 1255 ms ✓ (mark 2 at 3490 ms = 69.8% is NOT asserted) |
| S3 | 5000 | first cusp (dot starts at top; half turn = πR/v = π·0.25/0.6) | 1309 ms (26.2%) | ✓ | 3000 | one full cycloid arch + cusp in trace, contact 0.00 · 1691 ms ✓ (run 3.0 m → ends s = −0.6 ✓) |
| S4 | 4500 | skidder stops at 1020 ms (v²/2a: 2.0²/3.92 = 1.02 m); dissolve cue 1500 ms | 1500 ms (33.3%) | ✓ | 2700 | phase B mid-track (t_B = 1200 ms → s = 0.0), rolling, contact 0.00, no trail · 1200 ms past phase-B start ✓ (B ends s = −2.4 at 3900 ms, 0.6 m inside the bound; hold to reset) |
| S5 | 5600 | phase C assembles at 2800 ms | 2800 ms (50%) | ✓ | 3360 | phase C rolling (s = 1.84) with all three summed arrows + formula · 560 ms ✓ (C runs 2.8 s × 1.0 = 2.8 m → ends s = −0.4 ✓) |
| S6 | 3400 | capture: t_c = v₀k/(μ_k·g·(1+k)) = 2.0·0.5/(0.05·9.8·1.5) = **1361 ms**; slide distance v₀t_c − ½μ_k g t_c² = 2.722 − 0.454 = 2.268 m → capture at s = +0.132; v_roll = v₀/(1+k) = 1.333 m/s | 1361 ms (40.0%) | ✓ | 2040 | post-capture rolling at s = −0.77, trail ended, contact 0.00 · 679 ms ✓ (loop end 3400 ms → s = −2.58, 0.42 m inside the bound — no clamp) |
| S7 | — | free-run sandbox (Rule 37) | — | — | — | — |

**S6 slider envelope (the envelope discipline, computed — never the authored point):** slide distance d(v₀) = 5v₀²k(2+k)/(2μ_k g(1+k)²)… numerically d = 0.567·v₀² at the authored μ_k = 0.05, k = 0.5. Over the full v₀ range 1.0–2.5: d_max = 3.54 m → capture completes at s ≥ −1.14, always ≥ 1.86 m before the −3.0 bound ✓. A trusted v₀ drag SEIZES the loop (the seized-run scar): the wheel then rolls to the track end and stops under the geometric bound — an honest, readable end picture (**no energy layer is authored anywhere in this concept, so the bound stop renders no false energy event**); declared, not accidental.

**Camera plan (per the world-space-label row's corollary — every state authors its own `camera_position`):** S1/S4/S6/S7 wide, mild yaw (~30°), low elevation; S2 near side-on (marks + bracket read undistorted); S3 closed on the contact — position AND target ((b)-13, the camera-target row); S5 side-on medium (the three arrow fans are exactly what foreshortening would destroy). Single body per instant everywhere ⇒ the lane/occlusion machinery ((b)-10/(b)-12) is consumed by the SIBLING only; `PM_NLB_LANE_OCCLUSION` has nothing to fire on here.

**Rule 32 legibility:** cause before effect everywhere (S2 spoke-upright → mark stamps a beat later; S4 skid → slowing → stop → THEN the dissolve; S6 friction acts → readouts converge → THEN capture). Only the taught variable moves per state. Same apparatus persists from the home pose (S4/S5 phase bodies are distinct ids — `nlb_wheel_locked`, `nlb_wheel_slide`, `nlb_wheel_spin` — shown/dissolved on the scenario_cue channel; `rotation_locked` constant per id, never a per-state build branch). Exactly ONE glow focal per instant: S1 the wheel · S2 the 2πR bracket · S3 the rim dot · S4 phase A the f_k readout, phase B the contact readout · S5 the currently-revealed arrow · S6 the contact readout (it counts down to 0.00 — the capture IS the focal's story). Body labels are mass symbols or absent (the word-label scar); the brighten-only label row is engine-side and noted for the surgeon.

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots)

| Wrong belief | Source | At | `misconception_watch` beat |
|---|---|---|---|
| "Every point of the wheel moves at the wheel's speed — the bottom slides along the road" | PER + catalog (the pure-rolling classic) | STATE_3 | `belief`: the contact point moves forward at v like the rest of the wheel. `visual_counter`: the rim dot's cycloid comes to a CUSP — the dot visibly stops at each ground touch — while the centre readout holds v and the contact readout holds 0.00. `one_line_fix`: the turn carries the bottom point backward at exactly the speed the wheel moves forward, so at the ground the two cancel to zero. **Named primitives:** rim dot + cycloid trace + contact readout ((b)-3) |
| "A rolling wheel slides against the road — its friction is kinetic and always slows it" (RM-G7) | RM-G7 | STATE_4 | `belief`: rolling contact is sliding contact, so kinetic friction acts and drains speed. `visual_counter`: the locked wheel skids ALONE first — slows at 1.96 m/s², leaves a trail, stops — and dissolves; only then the rolling wheel crosses at constant speed, no trail, `f 0.00 N`. Wrong picture first, real physics after, back-to-back in motion. `one_line_fix`: kinetic friction needs a sliding contact; a rolling contact point is at rest, so only static friction can ever act there — and on level ground at steady speed even that is zero. **Named primitives:** `rotation_locked` flag + skid-trail + f_k readout ((b)-4/(b)-7) |

No other state carries a `misconception_watch`. EPIC-C branches: ZERO.

## 5. `has_prebuilt_deep_dive` states

- **STATE_3** — the PRIMARY aha and the historically stickiest claim ("the wheel is moving, how can part of it be at rest?" survives one viewing).
- **STATE_6** — the exam-heavy state (the sliding-then-rolling problem class) and the one importing the most prerequisite machinery.

Divergence note (Block-1 cross-reference): the S2 prerequisite cliff is patched by one narration sentence and needs no deep-dive; the stuck points are S3's counterintuitive claim and S6's dynamics — flags and cliffs deliberately differ at S2. All other states un-flagged (Rule 18).

## 6. Drill-down clusters

**STATE_3:** `why_the_contact_point_is_at_rest` · `cycloid_path_of_a_rim_point` · `backward_turn_speed_cancels_forward_speed`.
**STATE_6:** `time_for_sliding_to_become_rolling` · `friction_direction_during_slipping` · `final_speed_after_rolling_begins`.

## 7. `entry_state_map`

```
entry_state_map:
  foundational: STATE_1 → STATE_4
  point_speeds: STATE_5
  slipping:     STATE_6
```
Default `foundational`. Cross-slice pill after S4: "How fast is the TOP of the wheel moving?" → STATE_5. PRIMARY aha (S3) inside foundational ✓.

## 8. Prerequisites (advisory, Rule 23)

`rotational_kinematics` (#4, this chapter — ω and v = ωr; cliff at S1/S2) · `friction_force` (SHIPPED, same scenario — static/kinetic vocabulary; S4's skidding half IS the patch) · `tau_eq_i_alpha` (#7 — S6's spin-up; one patch sentence) · `moment_of_inertia` (#6 — S6 consumes k silently, never on canvas; covered by #7's patch sentence). Successor: `rolling_on_incline` (#12) recaps this concept in its S2.

Namespace check: `pure_rolling` collides with no rostered physics or chemistry id (bug-queue query + roster grep — 0 rows, no JSON of that name in either directory).

## 9. Real-world anchor (Rule 35 / 38f — universal, culture-neutral)

**Primary (assigned to STATE_1, 8 words inside its 30–40 budget):** the closing sentence — *"A bicycle wheel crosses the road exactly this way."* The bicycle wheel is the widest-syllabus-overlap rolling device on Earth (38f); no place, brand, or culture; physics-true at every depth. **Secondary (assigned to STATE_4, ≤12 words inside its 40–55 budget):** *"A braked, locked wheel leaves a skid mark; a rolling wheel leaves none."* — the everyday evidence that rolling contact does not slide, checkable on any road anywhere; the hook and the misconception kill are the same object. (The catalog's 12 anchors are ALL India-specific — none imported; the bullock-cart/potter's-wheel row maps to the survey's bicycle-wheel replacement.)

**DC Pandey check:** consulted chapter table of contents only, to confirm rolling motion's scope and its JEE presence (the sliding-to-rolling problem class). No teaching sequence, example problem, figure, or phrasing imported. NCERT: rolling motion is §7.14; its translation-plus-rotation decomposition figure is re-derived here from first principles as S5, not copied.

## 10. Definition of Done (Gate 0 — no TBDs)

**(a) States:** the 7 of §2, exactly as tabled in §3, including geometry, timing table, and camera plan.

**(b) Symbol-label table:**

| Quantity | On-canvas label |
|---|---|
| Centre speed | `v 1.20 m/s` (metric: \|v\|) |
| Turn rate | `ω 4.8 rad/s` (dual-label once in S1: "turn rate ω (angular velocity)", then bare — 38d) |
| Radius | R (slider row "Radius R"; drives lift + scale + spin, (b)-9) |
| Rolling-condition readout | `Rω 1.20 m/s` beside v (metric: \|ω\|·R) |
| Contact-point speed | `contact 0.00 m/s` (metric: \|v − ωR\|) |
| Circumference bracket | `2πR = 1.57 m` between revolution marks (derived from authored R — drives mark spacing, never a display string) |
| Revolution marks | ground ticks `1`, `2` at s_n = 2.4 − 1.5708·n |
| Friction readouts (S4/S6) | `f_k 1.96 N` on the skidder · `f 0.00 N` on the roller (metric: the integrator's own \|f\|) |
| Point-speed arrows (S3/S5/S7) | value-labelled arrows at contact/centre/top, lengths ∝ \|v ∓ ωR\| and \|v\| — computed from the live (v, ω), never constants (union amendment A2) |
| Skid trail | drawn during \|v − ωR\| > 0 only; breaks at any wrap/reset (amendment A4) |
| Sliders | `Speed v₀` · `Radius R` · `Starting spin ω₀` · `Friction μ_k` |
| Formula surfaces | S2: `one turn → 2πR` ⇒ `v = Rω` · S5: `v + Rω = 2v` then `v − Rω = 0` — on `#nlb_formula` (Cambria Math); longest line `v + Rω = 2v` verified in pixels against the 340 px max-width ((b)-14) |

All Unicode across all three text paths (Rule 34c). **k = I/mR² never renders** (do-not-prespoil — it is #12's reveal).

**(b′) Term-introduction ledger:**

| Symbol/term | DEFINED in | First USED in | ✓ |
|---|---|---|---|
| v, ω (dual-label) | S1 | S1 | ✓ |
| R, 2πR, marks, v = Rω, Rω readout | S2 | S2 (Rω re-used S3–S7) | ✓ |
| contact readout, rim dot, cycloid trace | S3 | S3 (re-used S6/S7) | ✓ |
| f_k, skid trail, μ_k, `f 0.00 N` | S4 | S4 (re-used S6) | ✓ |
| top-point arrows, 2v | S5 | S5 — **must not render in S1–S4 or S7** | ✓ |
| ω₀ (starting spin) | S6 (a launch with zero spin) | S6 + S7 slider | ✓ |

**(c) Right-hand-rule plan:** N/A — no direction rule taught (ω as a vector belongs to `angular_momentum`, 0c-1). Declared deliberately.

**(d) Motion plan:** per §3; nothing static, nothing asserted-but-unrendered (the zero-friction claim is a rendered `f 0.00 N` readout, the stop is integrated, the cusp is traced). Spin is position-driven through the body's OWN `radius_m` when rolling ((b)-9) and integrator-driven when slipping ((b)-5 + (c)-3). Every archetype is discharged by the AUTHORED beat with zero teacher input; the S2 R slider and S6 v₀ slider are Rule-31 extras only (the archetype-from-a-control scar).

**(e) Modes:** reuses sibling modes `rolling_contact` (S3) and `rolling_friction_contrast` (S4) with θ = 0; adds `rolling_intro` (S1), `rolling_circumference` (S2), `rolling_decompose` (S5), `rolling_capture` (S6); reuses `sandbox` (S7). deriveStateMeta co-edit at all three sites for the new modes (shared duty F10 on the sibling's sheet).

**(f)** `assessment` + `coverage_map` span: both-motions (S1), v = Rω (S2), contact at rest (S3), friction type (S4), point speeds 0/v/2v (S5), capture time and final speed (S6). `misconception_watch` = exactly the two beats of §4.

**(g) Macro↔micro (Rule 33):** lattice/carrier structure N/A — the mechanism is contact-scale and is itself the taught picture. 33d met: every instrument shows a live numeric value tracking the motion (v, ω, Rω, contact, f), no decorative dials. Every derived readout specified by METRIC (table (b)), never by display strings; the numbers in this document are CHECK values those metrics must reproduce.

**(h) Canvas budget (Rule 34):** ONE formula surface max per state (S2, S5 only; S1/S3/S4/S6/S7 none — S6's relation is carried by the converging readouts); caption = the ≤5-word delta cue only; prose in the strip below; HUD value-only; new top-anchored panels at `top:52px+` both edges; S7 readout load = one wheel × (v, Rω, contact) + trace — well under the readout-zone collision threshold, and the zone is sized off actual rendered neighbour height anyway ((b)-14).

**(i) Curriculum-flex (Rule 38):**
- **(i-1) Preset-cut coherence over states AND controls:** *Hide advanced (S1–S5 + S7):* both-motions → condition → contact at rest → friction type → point speeds → sandbox (v₀, R). No surviving narration references slipping, capture, ω₀, or μ_k's sandbox role. *Hide advanced+extended (S1–S4 + S7):* a complete qualitative-plus-v=Rω lesson; no surviving state or control references 2v, superposition, or slipping. Verified against every §3 caption, formula, control and the min_ring table.
- **(i-2)** S7 surfaces CORE content only under EVERY preset: v, Rω, contact readouts, contact/centre arrows, trace. No explore formula surface exists, so no explore relation needs a deriving state (the explore-formula scar); the one relation on show, v = Rω, is derived in core S2.
- **(i-3) `curriculum_tags` (claims, not facts):** CBSE/NCERT §7.14 core+extended — **verified at authoring**; advanced S6 = JEE Main/Advanced (sliding-to-rolling problem class) — verified against the DCP index. AP Physics C full · AP Physics 1 core only · IB DP core+extended · A-level core only — every one `needs_teacher_verification`.
- **(i-4) Presets:** `full` = S1–S7; `mainstream` = hide S6 (sandbox loses ω₀, μ_k); `qualitative` = hide S5–S6.
- **(i-5) Graph axes:** no graph panel — N/A, declared (S6's convergence is carried by readouts; a v/Rω-vs-t graph would be new nlb wiring and is deliberately NOT requested — union discipline).
- **Notation ladder (38c):** all surfaces algebra-only; nothing calculus-form anywhere. **Dialect (38d):** "turn rate ω (angular velocity)" once, then bare.

**(j) Teacher-walk answers:** (1) *States and shows the named thing in the assessed representation?* Yes — S2 states v = Rω and shows the equal readouts; S3 shows the cusp + 0.00 the exam diagram asserts; S5 shows the 0/v/2v figure students are examined on; S6 shows the capture the JEE problem asks for. (2) *First thing a teacher tries, demonstrable in range?* Drag R in S2 and watch the marks respace with the bracket value; in S7 set ω₀ = 0 at full preset and watch capture. Both in range, envelopes stated. (3) *Term ledger:* table (b′). Declared omissions re-examined: k and the incline are roster design (#12); rotational KE is #8; the ω-vector is #9 — decisions, not exemptions.

---

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

1. **Prerequisite cliff.** `rotational_kinematics` → **S1/S2**: patch sentence in S1 — "the turn rate ω counts how much angle the wheel turns each second" — inside the dual-label; S2's bracket then makes v = Rω geometric, not recalled. `friction_force` (shipped) → **S4**: the skidding phase-A IS the patch (f_k shown acting, with its number). `tau_eq_i_alpha` → **S6**: one sentence — "friction's turning effect on the rim speeds the spin up, a torque doing to ω what a force does to v." `moment_of_inertia` → S6 consumes k = 0.5 silently inside the integrator; no on-canvas k means no second patch needed.
2. **JEE-backwards trace.** *"A wheel is projected along a level floor at v₀ with no spin; friction coefficient μ_k. Find (i) the time when pure rolling begins, (ii) the speed then, (iii) the speed of the highest point of the wheel at that moment."* v = Rω as the capture condition → S2; contact-at-rest legitimising "pure rolling" → S3; kinetic friction while sliding, static after → S4; ω spin-up + capture t_c = v₀k/(μg(1+k)), v_roll = v₀/(1+k) → S6; top point 2v → S5. No missing piece. (M1–M6 carve-out N/A — this is Ch.7 mechanics, not magnetism.)
3. **Misconception entry mapping.** Contact-moves-at-v → S3 (16a beat, §4). *Planting risk:* S1/S2's narration says "the wheel moves at v" — physics_author must say "the wheel's CENTRE moves at v" from S1 onward, so the over-generalisation is never planted. RM-G7 → S4. *Planting risk:* S1–S3 must stay friction-neutral (no "the tyre pushes on the road" phrasing, also Rule 41); friction enters the concept only at S4.

### Block 2 — Aha-moment designation

- **PRIMARY aha, at STATE_3:** "the point where a rolling wheel touches the road is, at that instant, NOT MOVING — the wheel crosses the road on a point at rest." The 10-year memory.
- **SUPPORTING aha, at STATE_4:** "because the contact never slides, rolling does not slow the way skidding does" — the direct consequence, and the reason wheels and ball bearings exist. Cohesion: the supporting aha is the primary's payoff ✓.
- **Wrong-belief setup:** primary — S1 and S2 build a confident "the wheel moves at v" picture (readouts, marks, the bracket all speak of one speed); the student silently extends it to every point; S3 breaks it at the cusp. Supporting — everyday "friction slows moving things" plus S3's freshly-learned contact story sets up "so friction must act down there"; S4's `f 0.00 N` breaks it.
- **Foundational coverage:** S3 ∈ foundational (S1–S4) ✓.

---

## SCAR AUDIT (queries stated in the header; dispositions)

| bug_class | Verdict for pure_rolling |
|---|---|
| `field3d_nlb_physics_clock_not_state_local` (CRITICAL/OPEN) | **precondition** — shared build item (b)-11; the ENTIRE §3 timing table, every pin margin, and S6's capture instant are conditional on it |
| `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate` | **satisfied** — S2 marks authored as arithmetic on the home pose (s_n = 2.4 − 1.5708n); `initial_position_m` stated in the home-pose paragraph |
| `nlb_static_state_authored_on_the_track_bound…` | **satisfied** — home pose +2.4, 0.6 m inset; every loop end ≥ 0.42 m inside the bound (table) |
| `nlb_loop_reset_clears_checkpoint_stamp…` + `nlb_frozen_pin_lands_within_one_frame…` | **satisfied** — timing table: every asserted event < 55% R, every pin margin ≥ 560 ms ≥ 167 ms; discrete events computed from the authored physics, json_author re-verifies at h = 1/60 |
| `nlb_multibody_lane_gap…` + `the_eye_passes_a_frame_in_which_one_compared_body_is_hidden…` | **N/A by construction** — no frame in this concept ever contains two bodies; S4/S5 compares are sequential dissolves (the contrast-ghost scar's required order). The occlusion warning (b)-12 is consumed by the sibling only |
| `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` (MAJOR/OPEN) | **build-item, shared** — S3's close-on-contact is exactly a target change; (b)-13 |
| `field3d_release_widens_ground_plane_per_state…` | **satisfied** — ONE `length_m = 3.0` concept-wide |
| `nlb_camera_rotated_body_label_bleed…` / `field3d_world_space_label_decollision…` / `nlb_formula_and_readout_zones…` / `field3d_edge_anchored_formula_surface_wraps…` | **satisfied via (b)-14 (shared)** — labels verified in screen space under every authored camera; formula surfaces short (longest `v + Rω = 2v`), still verified in pixels; per-state cameras authored incl. near side-on for the arrow states (the row's corollary, applied) |
| `nlb_angle_arc_radius_overruns_the_neighbouring_lane_body` | **N/A at θ = 0** — the arc collapses and hides (`:40070–40078`, quoted); no incline state exists |
| `nlb_frictionless_state_with_an_opposing_applied_force_reverses…` | **N/A on its letter** (no applied forces, no work accumulators) — **its envelope lesson applied**: S6's v₀ slider envelope computed over the full range (capture in-track ∀ v₀ ≤ 2.5; seized-run end behaviour declared); S5's frictionless phases have no opposing force, nothing reverses |
| `nlb_seized_slider_run_overruns_a_loop_sized_work_scale` | **N/A on its letter** (no work_scale) — its seize lesson applied to S6 (bound-stop declared, no energy layer to misrender) |
| `geometric_track_clamp_rendered_as_an_energy_change` / `field3d_path_integral_accumulator_bills_a_teleport` | **satisfied** — no energy layer anywhere; trail-wrap discipline (amendment A4) keeps the trail from drawing a teleport segment |
| `nlb_sandbox_wrap_remaps_s_but_not_s0…` | **satisfied** — S7 readouts are instantaneous (v, Rω, contact), no interval accumulator; trace breaks at wrap (A4) |
| `hysteretic_state_cannot_be_latched_under_a_time_pin` | **applied to (c)-3** — the capture regime must be a CLOSED-FORM function of state-local t for authored params (t_c analytic), never a per-frame latch, so pins and rewinds are byte-stable |
| `archetype_live_tier_unverified_against_renderer` | **satisfied** — every capability verified against code with file:line (header); all rolling motions are tier [NEEDS-SCENARIO] pending 0c-2 |
| `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control` | **satisfied** — every archetype discharged by the authored beat (S2 stamps, S3 cusp, S4 two phases, S5 three phases, S6 capture) with zero teacher input |
| `contrast_ghost_coresident_with_the_real_set_fuses_both` | **satisfied** — S4 and S5 are strictly sequential; at no instant are two wheels visible |
| `symbol_printed_on_canvas_before_the_lesson_defines_it` | **satisfied** — ledger (b′); the k symbol never prints |
| `teach_do_not_prespoil_a_later_reveal` | **satisfied** — top arrow and 2v absent from S1–S4 AND from S7 (explore stays core); k absent everywhere (it is #12's reveal) |
| `teach_concrete_before_abstract_compare` | **satisfied** — S2's bracket precedes its formula; S5 shows both part-motions alone before the sum |
| `teach_visual_must_match_narration` | **satisfied** — "at rest" is a traced cusp + a 0.00 readout; "no friction" is a rendered `f 0.00 N`; "spins up" is converging readouts + lagging spokes |
| `derived_readout_asserted_by_value_without_defining_its_metric` / `derivation_principle_applied_to_one_beat_but_not_its_sibling` | **satisfied** — every readout metric-defined (table b); the bracket value derives from authored R and drives mark spacing; capture derives from the integrator |
| `oncanvas_formula_asserts_a_value_the_renderer_cannot_show` / `lesson_never_states_the_principle_it_is_named_after` / `concept_taught_its_own_quantity_without_the_canonical_picture` | **satisfied** — S2 STATES the condition, S3/S5 SHOW the assessed pictures (cusp diagram, 0/v/2v figure); every formula value is drawn |
| `explore_state_formula_surface_asserts_a_relation_no_state_derives` / `explore_controls_not_ring_gated_survive_the_ring_cut` | **satisfied** — no explore formula; min_ring table with the μ_k ring decision reasoned |
| `phase0_union_table_asserted_not_walked_state_by_state` | **satisfied** — WALK below, both directions |
| `closed_enum_cannot_name_a_substance_the_design_teaches` | **satisfied** — enum diffs done in code: `controls_visible` `:1340` lacks `R`, `omega0` (→ (b)-8 + (c)-2); `readouts` `:1336` lacks ω/Rω/contact/f-as-authored (→ shared (b)-3/(b)-4 readouts + (c)-4); mode additions enumerated (DoD e) |
| `state_added_at_review_outruns_the_config_contract_shape` | **applied at design time** — the SHAPE question asked now: S5 needs THREE sequential phase bodies in ONE state config (three body defs + dissolve cues on the scenario_cue channel — one more phase than the sibling's two-phase S3, same mechanism); declared to the surgeon as a shape requirement, not discovered at review |
| `field3d_rule16a_belief_unbuildable_for_want_of_a_primitive` | **satisfied** — both 16a beats name their primitives (§4) |
| `real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget` | **satisfied** — S1 primary (8 words), S4 secondary (≤12 words), both inside stated budgets |
| `field3d_param_ramp_authoring_contract` | **N/A** — no param_ramp authored in this concept |
| `spec_semi_implicit_euler_position_not_step_count_invariant` / `derivestatemeta_new_scenario_key_absent…` / `field3d_build_once_body_reads_a_per_state_flag…` / `nlb_friction_vector_first_frame_reveal_tint…` / `nlb_body_label_is_brighten_only…` | **engine-side, noted for the surgeon** — dt-fold exactness for the new ω integrator; F3D_REVEAL_KEYS for the new modes; per-state flags never read from the union build body (`rotation_locked` constant per id); friction-readout ink at t=0 of each phase; labels dim as emphasis peers |
| `chemistry_concept_id_collides_with_rostered_physics_id` | **satisfied** — namespace checked (§8) |
| `directive_no_gate_asks_whether_a_teacher_could_use_it` | **satisfied** — DoD (j); the μ_k min_ring decision exists because of this row |
| `teach_coordinate_sim_with_graph` / `teach_distinct_reference_lines_for_two_radii` / `teach_inverted_scenario_inverts_cutline_flags` / `teach_field3d_explore_grab_and_move_field_point` | **N/A with reason** — no graph; one radius; not an inverted scenario; nlb explore drag already exists (a)-10 |
| `teach_reveal_synced_to_narration` / `teach_show_quantity_live_when_named` / `teach_color_each_element_by_its_own_sign` | **routed** — physics_author directives, carried forward to the next pipeline stage |

A row not queried is not dispositioned; every disposition traces to the queries stated in the header.

---

# 0c-2 ENGINE UNION — pure_rolling contribution

> **Union closure statement:** with this skeleton, the 0c-2 union is now measured over BOTH of its concepts — resolving the sibling's P2-5 limit. The survey's 0c-2 row and the sibling's build sheet should be amended with categories (c) and the flags below BEFORE the surgeon dispatch, so the Phase-0 success test (zero renderer edits after 0c lands) is judged against a true union.

## (a) Already exists today (verified in code this session, file:line)

1. Flat surface — `theta_deg = 0` is the same code path (`:939`); the θ-arc collapses and hides at 0 (`:40070–40078`).
2. Bodies with mass / `initial_position_m` / initial velocity; `v0` slider token exists (`:1340`); `mu_s`/`mu_k` per body + `surface.frictionless` flag.
3. Wheel mesh with tyre + hub + crossed spokes (SEAM G) — spin is legible on the existing mesh; **but** lift is the constant `NLB_BODY_SIZE/2` (`:40015`) and spin divides by the constant `NLB_WHEEL_R` (`:40053`) — both replaced by (b)-9.
4. SEAM M readout machinery + `#nlb_formula` Cambria panel; scenario_cue channel + ghost/dissolve machinery; per-state `camera_position`; fixed-step integrator + `loop_reset_ms`; sandbox wrap + `trusted_drag_seizes`.
5. Checkpoint marker machinery (position-coordinate markers with crossing interpolation, capture-overshoot fix already FIXED) — the substrate (c)-1 may ride.

## (b) Already in `rolling_on_incline`'s union (shared — consumed by pure_rolling, no new scope)

| Sibling item | pure_rolling consumption |
|---|---|
| (b)-2 rolling acceleration branch | **with the θ = 0 flat case first-class** (see flag A1): a = 0, f_s = 0 at level constant-v — S1–S5's substrate |
| (b)-3 contact-point picture: 0/v/2v arrows, cycloid/rim trace, contact readout, replayable-pure-function traces | S3 (its whole state), S6, S7 — **subject to amendment A2** (arrows computed from live (v, ω)) |
| (b)-4 static/kinetic friction call-out | S4, S6 |
| (b)-5 slip regime: independent ω integration, α from kinetic-friction torque, skid trail, spin lag | S6's slide phase (entered from initial conditions rather than a μ drop — see (c)-2/(c)-3) |
| (b)-7 `rotation_locked` per-body flag + sequential contrast cueing | S4's phase A verbatim |
| (b)-8 `controls_visible` token extension (`R`) | S2, S7 |
| (b)-9 per-body `radius_m` (mesh scale, contact lift, spin ω = v/R, live re-lift under an R drag) | every state; S2's R slider is its live-re-lift consumer |
| (b)-11 state-local physics clock (CRITICAL) | precondition of the entire timing table |
| (b)-13 camera target authoring | S3 close-on-contact |
| (b)-14 overlay verifications in pixels | formula surfaces, label decollision, readout zone |
| Explicitly NOT consumed | (b)-1 k chips (k never renders here) · (b)-6 KE readouts · (b)-10 lane geometry · (b)-12 occlusion warning · (b)-15 centre markers · F8 non-wheel meshes — all remain justified by the sibling alone |

## (c) NEW — needed by `pure_rolling` alone (the point of this dispatch)

1. **Revolution marks + circumference bracket (S2).** A ground mark stamped at each completed wheel revolution (positions = arithmetic on the home pose, s_n = initial − n·2πR — may ride the existing checkpoint marker meshes, (a)-5) plus a labelled distance bracket `2πR = 1.57 m` between consecutive marks, with marks AND bracket respacing live under an R drag. The stamping semantics (turn-count trigger instead of a work stamp) and the live respace are new.
2. **Authorable initial spin, decoupled from v.** `bodies[].omega0_rad_s` (default: v₀/R, i.e. rolling) + `controls_visible` token `'omega0'`. Required by S6 (v = v₀, ω = 0), S5's phase B (v = 0, ω = ω₀ on frictionless — spin-in-place), and the S7 sandbox. Rides (b)-5's independent-ω integrator; the new surface is the CONFIG entry point, small but absent from the sibling's sheet.
3. **Slip-to-roll CAPTURE — the regime transition in the direction the sibling never builds.** When v − ωR crosses zero under kinetic friction, the body enters (and stays in) the rolling branch. Must be specified as a closed-form function of state-local t for authored constants (t_c = v₀k/(μ_k g(1+k)) — analytic), never a per-frame latch, so time pins and rewinds reproduce it byte-stably (the hysteretic-state scar). The sibling's (b)-5 covers only rolling→slipping; this is the (c) centerpiece and the S6/S7 payoff.
4. **Bare-ω readout token.** The sibling displays Rω but never ω itself; S1's "moving AND turning" needs `ω x.x rad/s` as a readout. One token on the (already-extending) readout list — listed for enum-diff honesty (the closed-enum scar).

## Survey/build-sheet AMENDMENT FLAGS (report-only; the dispatching session decides)

- **A1 — (b)-2 must state θ = 0 as a first-class case.** The sibling specced the rolling branch entirely at θ = 25°. pure_rolling lives at θ = 0, where the branch must give a = 0, f_s = 0 exactly (level constant-v rolling), and S4's rendered `f 0.00 N` depends on it. Formula-automatic, but the build sheet should say it so the surgeon tests it.
- **A2 — (b)-3's point-speed arrows must be COMPUTED from the live (v, ω) as v ± ωR, never hardcoded 0/v/2v.** S5's phases (all-v; ±ωR; summed) and S6's slipping body (contact ≠ 0) are exactly the cases literal constants would render falsely. If the surgeon builds (b)-3 against the sibling's rolling-only states, pure_rolling breaks — this is the alarm-rule class this skeleton exists to catch early.
- **A3 — spin-legibility marker on the non-wheel rolling meshes (serves the SIBLING, surfaced here).** The wheel's crossed spokes make spin visible; the sibling's F8 spheres/rings/hollow spheres have no stated rotation marker, yet sibling S4's payoff is "the small sphere visibly spins 3× faster." A uniform sphere spinning is invisible. F8 should add a contrasting stripe/rim dot per mesh. pure_rolling itself needs nothing (wheel only).
- **A4 — trail/trace wrap discipline (shared, unstated in the sibling's sheet).** Skid trails and rim traces must break at any sandbox wrap or loop reset and never draw the teleport segment — the trail is a new consumer of the teleport-billing scar family. Applies to the sibling's S8 full-preset slip sandbox as well as S7 here.
- **A5 — config SHAPE: one state must express THREE sequential phase bodies** (S5: slide ghost → spin ghost → rolling wheel, dissolve-cued). Same mechanism as the sibling's two-phase S3, one more phase — a shape check for the config contract, declared now per the config-shape scar.

**Union WALK (state × row, both directions):**

| State | Rows consumed |
|---|---|
| S1 | (a)1,2,3 · (b)2@θ0,9,11 · (c)4 |
| S2 | (a)1,2,3,4,5 · (b)2,8,9,11,14 · (c)1 |
| S3 | (a)1,2,3,4 · (b)2,3,9,11,13,14 · — |
| S4 | (a)1,2,3,4 · (b)2,4,5,7,9,11 · — |
| S5 | (a)1(frictionless),2,3,4 · (b)3,9,11,14 · (c)2 · A2, A5 |
| S6 | (a)1,2,3,4 · (b)2,3,4,5,9,11 · (c)2,3 · A2 |
| S7 | (a)1,2,3,4 · (b)2,3,5,8,9 · (c)2,3,4 · A4 |

Reverse: every (a), consumed-(b), and (c) row is claimed by ≥1 state; every state claims ≥1 row. Both directions closed. Nothing else: no energy bars, no lanes, no graph panel, no new meshes, no RHR hand. If Checkpoint A or the surgeon finds any FURTHER capability needed, that is the alarm rule firing — STOP and re-scope with the survey.

---

**Files referenced (absolute):**
- `C:\Tutor\physics-mind\docs\loop_runs\rotmech\phase0_survey.md` (authorising survey)
- `C:\Tutor\physics-mind\docs\loop_runs\rotmech\rolling_on_incline\skeleton.md` (sibling REV 3; shared union items (b)-1…15 cited by its numbering)
- `C:\Tutor\physics-mind\docs\loop_runs\rotmech\rolling_on_incline\founder_proxy_A.md` (defect classes avoided: projected-vs-unprojected framing — moot here, single body; track model quoted both sides; scar audit queries stated; ring-suppressed cues; unrenderable timing — every event re-derived on the true 6 m track)
- `C:\Tutor\physics-mind\src\lib\renderers\field_3d_renderer.ts` (all verification line numbers as quoted in the header)
