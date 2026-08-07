# SKELETON — `pure_rolling` (chapter `rotmech`, Class 11 Ch.7 — Systems of Particles & Rotational Motion) — REV 2 (fix cycle 1 response)

> **Phase-0 role:** 0b skeleton for concept **#11** of the 14-concept spine (★ Diamond, **V1**), second consumer of build **0c-2** (bounded rotational extension to `newtons_laws_body`). Sibling: `rolling_on_incline` (#12, REV 4, amended in parallel to the same founder ruling). founder-proxy Checkpoint A: REV 1 → `DESIGN_FIX` (`founder_proxy_A.md`). This is the cycle-1 revision, built around the **FOUNDER RULING (2026-08-02, binding)**: two-phase Rule-16a contrast beats stay ONE state on a new per-body **`bodies[].activate_at_ms`** (hidden and un-integrated before that instant, seeded at authored s₀/v₀ then integrated); three-phase states SPLIT into separate states (the A5 three-phase config shape is DELETED from the union); `lane_gap_m = 0` / single-lane semantics is bought and #11 is a declared consumer of the sibling's (b)-10; the engine buy is **`activate_at_ms` only — no general choreography DSL, no other timed actions**. REV 1 preserved at `skeleton_rev1.md`.
> Survey: `docs/loop_runs/rotmech/phase0_survey.md` (founder-approved 2026-08-02). The closing **"0c-2 ENGINE UNION — pure_rolling contribution"** remains the load-bearing artifact.

## FIX-CYCLE-1 RESPONSE (finding × what changed × where it now reads)

| Finding | What changed | Where |
|---|---|---|
| **FOUNDER RULING — phases vs states** | S4 (skid-vs-roll) keeps its two phases in ONE state on `bodies[].activate_at_ms` (the wrong picture and its kill land back-to-back, no click between). Old S5 SPLIT into three states — slide-without-spin, spin-in-place, the sum 2v/v/0 — each one idea + one complete motion. The A5 three-phase config shape is DELETED; the config-contract max drops to TWO sequential phase bodies per state (#11 S3 = #12 S3, same mechanism) | §2; §3 S3/S4/S5/S6 rows; union (c)/flags; shape note |
| **State-count absorption (D1 offset / P3-5)** | Old S1 FOLDED into old S2: nothing a student could answer from S1 is unanswerable from the merged state — same wheel, same track, same live v and ω; the merged S1 carries the ω dual-label, the 8-word anchor, the marks, the bracket and the relation. Net: 7 → **8 states**, calibration stated honestly | §2 + calibration note; §3 S1 row |
| **P1-A(a)** no activation time | `activate_at_ms` is now a NAMED, narrowly-scoped union item (E9): hidden + un-integrated before the instant, seeded at authored s₀/v₀ on it, activation a pure function of state-local t (pin/rewind byte-stable). Consumers: #11 S3; #12 S3/S6 | Union (c)-5; §3 S3 row; E9 |
| **P1-A(b)** lane derivation | The "no two bodies co-present" discharge is RETRACTED — `nlbBodyLaneZ` (`:39992–40001`) counts DECLARED bodies, never visibility. #11 now **consumes (b)-10** with `lane_gap_m = 0` (explicit single-lane) authored on S3; stated in the union WALK | §3 S3 row + home-pose ¶; union (b) table + WALK |
| **P1-A(3)** loop_reset vs held starts | S3 re-derived against the HELD phase-B start: R = 4000 (not 4200 — at 4200 phase B ends exactly ON the bound); phase B activates 1500, pin 2400 → phase-B t = 900 ms, s = +0.60, rolling; phase B ends s = −2.6, 0.4 m inside the bound, no clamp. The split S4/S5/S6 each re-derived fresh | §3 timing table |
| **P1-B** velocity channel + zero vector | Second, INDEPENDENT velocity channel authored: **`velocity_scale = 0.92` wu·s/m, `velocity_min_len = 0.25` wu** (defaults = today's constants when absent, sibling clause (b)-19). Smallest nonzero drawn velocity (S2 centre, 0.6 m/s) renders 0.552 wu = **2.2× the floor** (> 1.5×); largest (S6 top, 2.0) = 1.84 wu < MAX 2.80; the 2 : 1 ratio renders exactly. **Zero-contact representation specified: a labelled stationary marker (dot + `0.00 m/s`) — never a stub, never a floored arrow** — consumed by S2 (contact), S5 (centre), S6 (contact), S8. The sibling's force channel (0.30/0.25) is unaffected | §3 velocity-map ¶; S2/S5/S6 rows; DoD (b); union (c)-6/E11 |
| **P1-C** pin budget = reveal COMPLETION | Every state's "last asserted event" is now the completion of its reveal chain, re-solved: S1 formula line 2 at 2600 ms (52% of R 5000); S6 (the sum state) five reveals budgeted 600/1000/1400/1800/2400, R = 4800 ⇒ pin 2880, 480 ms after the chain completes. **S1's bracket second endpoint fixed: a mark `0` is stamped at the release point (home pose), so the bracket draws mark 0 → mark 1** — declared, with the mark-count envelope restated | §3 timing table; S1 row; DoD (b) |
| **P1-D** marks are their OWN primitive | The "(a)-5 may ride" line is DROPPED. Revolution marks + bracket = own primitive: own mesh, turn-count trigger, live respace under an R drag, **no `checkpoints` reuse, no formula-surface stamp, no `energy_active` side effect, no `NLB_CP_MAX` cap** (four collisions quoted with lines: enum `:1500`, stamp target `:1487`, `energy_active` `:42747`, `NLB_CP_MAX = 3` `:43547`). R envelope restated at both ends WITH mark counts and positions | §3 S1 row + marks ¶; union (a)-5 amended, (c)-1 rewritten; E12 |
| **P1-E** glow channel per state | Per-state glow CHANNEL table added (state-level vs `phases[].glow_focal`, `nlbRunPhases` `:45296–45310`). **S6 (the sum) authors NO state-level `glow_focal`** — emphasis runs on `phases[]` windows with hand-back, all three arrows at equal brightness by 2400 ms < the 2880 pin. Consistent with the sibling's glow table | §3 glow table |
| **P1-F** sweep recurrence | Scar audit REBUILT on the eleven-concept sweep (`grep -rl` run live this cycle, 11 ids; per-id queries all read; owner queries reach the id-less rows). The seven named missing rows all dispositioned. `--field3d --open` again NOT used as coverage (script line 23, zero nlb ids) | Header + SCAR AUDIT |
| **P2-1** branch priority | A1 restated: the rolling branch must **SUPERSEDE** Branch A's `f = −sign(v)·μ_k·N` (`:45497–45499`) while the rolling condition holds — a body carrying μ_k that is rolling reads `f 0.00 N`, not a kinetic decel. "Formula-automatic" deleted | Union flag A1; S3/S7 rows |
| **P2-2** A5 insufficiency | Resolved by deletion (founder ruling): the three-phase shape no longer exists; `activate_at_ms` (E9) is the real item | Union flags |
| **P2-3** S2 camera vs the run | S2's camera **target = the run midpoint s = +0.9** (run [+2.4, −0.6]), framed extent ≈ 3.4 m ≈ [+2.6, −0.8] stated in metres — the wheel and the full cusp stay in frame for the whole state. Body-rect ∩ `nlbPanelRects()` = ∅ acceptance added (the screen-anchor row) | §3 camera plan |
| **P2-4** ω re-seed on wrap | A4 widened: on every S8 wrap, ω re-seeds to the authored ω₀ alongside v (the `:45547–45557` reasoning applied) — every lap replays the same lesson; trail/trace break unchanged | Union flag A4; S8 row; E13 |
| **P2-5** S1 R-drag seize | Declared: a trusted R drag SEIZES the loop (`:1553`); the wheel then rolls to the −3.0 bound (≈6.0 s at 0.9 m/s) and holds; marks + bracket hold their picture at the bound — and with marks as their own primitive, `energy_active` stays false, so the bound stop renders no energy event (the claim P1-D restored) | §3 S1 row |
| **P2-6** reduced-preset sandbox | S8 now surfaces the **turns counter + revolution marks (core, defined in S1)** — under *hide advanced* the R dial visibly changes distance-per-turn, the one thing the reduced lesson owns | §3 S8 row + min_ring ¶ |
| **P2-7** visible-elements matcher | Marks, bracket, velocity arrows, zero markers, cycloid trace, skid trail all registered with the generic matcher — build-sheet item, surgeon duty | Union (c)-8/E14; SCAR AUDIT |
| **P2-8** narration glow bindings | `concept_ships_zero_narration_glow_bindings` (MAJOR/OPEN) routed: physics_author authors a `glow` on every `tts_sentences[]` entry naming exactly one on-canvas element | SCAR AUDIT routed set |
| **P3-1** off-by-one citations | Corrected: `theta_deg` "0 = flat ground" `:940`; `length_m` half-length `:941`; θ-arc collapse `:40071–40079` | Header |
| **P3-2** "≥ 2.25 m" slip | Corrected: mark 1 (+0.8292) is **2.171 m** from the +3.0 bound; mark 2 (−0.7416) is 2.258 m from −3.0 | Home-pose ¶ |
| **P3-3** stray `5` | Envelope formula corrected: d = v₀²k(2+k)/(2μ_k g(1+k)²) = 0.567·v₀² | §3 S7 envelope |
| **P3-4** k = 0.5 on a wheel mesh | Modelling declared: "the wheel is treated as a uniform disc (k = 0.5)" goes in the physics block + one narration-safe line; timing dependence noted (k = 1 would put t_c at 2041 ms = 60.0% of R = 3400 — ON the pin, breaking the 55% rule — the declaration is load-bearing, not cosmetic) | §3 S7 row; DoD (d) note |
| **P3-5** D1 thin state | Fold executed (see State-count absorption above) | §2 |
| **P3-6** frozen-frame reading row | Dispositioned: routed to eye_walker/quality_auditor as a READING directive — 7 of 8 states are translating bodies read from frozen frames (S5 spins in place); frozen = the state pinned at 0.60R, compared only against the dense frame at that time | SCAR AUDIT |
| **P3-7** shared anchor | Deliberate line added: the bicycle wheel is #11's primary and #12's secondary **by design** — chapter coherence, the same remembered object on the flat and then on the slope | §9 |
| Proxy build-sheet additions 1–6 | 1 → (c)-5/E9 (narrow scope stated) · 2 → (b)-10 consumed/E10 · 3 → (c)-6/E11 · 4 → (c)-1 rewritten/E12 · 5 → A4 widened/E13 · 6 → (c)-8/E14 — all carried | Union |

**What was NOT churned (credit preserved verbatim):** A2 (now carried in the build sheet in its own words, widened by the two-channel ruling) · A3 (goes to #12's F8 verbatim — landed there in the sibling's REV 4) · every §3 number that survives the restructure, re-checked · the S7 (old S6) capture derivation and envelope · **the μ_k `min_ring` argument, kept verbatim** · both ring cuts · the θ = 0 reading · one-`length_m` discipline · home-pose mark arithmetic · the term ledger · do-not-prespoil on `k` and the top arrow · the closed-enum diffs on `controls_visible`/`readouts`.

> **Engine bug queue consultation (REV 2 — run live this cycle, provenance stated):** ① `grep -rl "newtons_laws_body" src/data/concepts/*.json` → eleven ids (`block_on_incline, connected_bodies, free_body_diagram, friction_force, newton_first_law, newton_second_law, newton_third_law, normal_force, rolling_friction, tension_force, work_done_by_constant_force`); ② `query_engine_bug_queue.ts <id>` per id — all returned rows read; ③ `--owner alex:architect` (32) + `--row-type directive` (47); ④ `--owner alex:json_author` + `--owner alex:physics_author` — these reach the glow-relation and narration-binding rows no nlb concept id carries; ⑤ `pure_rolling` / `rolling_on_incline` → 0 rows each (Checkpoint A's candidate scar rows are not yet filed — orchestrating session's `log:lesson` duty, noted). `--field3d --open` NOT used as coverage (`query_engine_bug_queue.ts:23` — hardcoded 22-id list, zero nlb). Scenario-scoped rows carrying no queryable id (`field3d_nlb_physics_clock_not_state_local`, `nlb_multibody_sandbox_wrap_reanchors_only_the_wrapping_body`, `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable`, `authored_state_glow_focal_silently_voids_every_tts_sentence_glow`) are carried from Checkpoint A's own live re-verification (2026-08-02), stated as such.
> **Renderer citations (corrected, P3-1):** `theta_deg` "0 = flat ground, SAME code path" `:940` · `length_m` half-length `:941` (readers `:40061–40067`, `:44176`) · θ-arc collapse `:40071–40079` · `NLB_LANE_GAP = 0.85` `:39610` · `nlbBodyLaneZ` over DECLARED bodies `:39992–40001` · slab `BoxGeometry(1, 0.18, 1.6)` `:41417`, depth const `:39621`, only x scaled `:40068` · visibility once per apply `:44766–44771` · `phases[]` `:1583`/`:45290–45311` (`eng.phase_action` written, never read) · arrow map `:40602–40606`, constants `:39661–39664` · `checkpoints` `:1494–1502`, stamp target `:1487`/`:44373`/`:44797`, `energy_active` `:42747`, `NLB_CP_MAX = 3` `:43547` · Branch A kinetic friction `:45497–45499` · bound clamp `:45582–45591` · sandbox wrap `:42185`/`:45568–45573` · pin phase 0.60R fixed (`deriveStateMeta.ts:2937–2957`) · lift `NLB_BODY_SIZE/2` `:40015` · spin divisor `NLB_WHEEL_R` `:40053` · `controls_visible` `:1340` · `readouts` `:1336` · `nlbGravAlong` `:45093–45096`.

## 1. Atomic claim

This concept teaches the rolling-without-slipping condition v = Rω and its direct consequence: the contact point of a rolling body is instantaneously at rest, so the friction at a rolling contact is static, never kinetic. It does NOT teach the incline race or the shape factor I/mR² (deferred to `rolling_on_incline`), and it does NOT teach rotational kinetic energy (deferred to `rotational_work_energy`).

## 2. State count + arc

**8 states.** Calibration, stated honestly: `pure_rolling` is medium (5–6 band). It lands at 8 for two declared reasons, neither of which is padding: (i) the founder ruling (2026-08-02) splits the slide/spin/sum decomposition into three one-idea states — Rule 31's "one idea + one complete motion" applied to what genuinely is three ideas; (ii) the advanced ring carries the slipping→rolling capture as its own ring-gated state. The offset: old S1 is folded into S1 below (P3-5/D1 — a student could answer nothing from old S1 that the merged state does not teach). The core block is **3 states + explore = 4 under the deepest preset cut**, inside the band; the full-preset 8 is the JEE-complete lesson. Rings: core S1–S3, extended S4–S6, advanced S7 (contiguous, immediately before explore), explore S8.

| State | Title (Rule 41 — literal, rail-truncation-safe) | Purpose | teaching_method | depth_ring |
|---|---|---|---|---|
| STATE_1 | One turn, one circumference | Hook + condition: the wheel rolls with v and ω both live; each full turn advances exactly 2πR ⇒ v = Rω | straightforward beat | core |
| STATE_2 | The contact point is at rest | PRIMARY aha: the rim point's cycloid comes to a cusp; contact marker holds `0.00 m/s` | straightforward beat (16a) | core |
| STATE_3 | No sliding, no kinetic friction | RM-G7 kill: a locked wheel skids, slows, stops; the rolling wheel does not — two phases, ONE state (`activate_at_ms`) | straightforward beat (16a) | core |
| STATE_4 | Sliding without turning | Part-motion A: every point moves at the same v | straightforward beat | extended |
| STATE_5 | Turning without moving | Part-motion B: rim ±Rω, centre at rest | straightforward beat | extended |
| STATE_6 | Slide plus spin makes rolling | The sum: the point speeds come out 2v / v / 0 | straightforward beat | extended |
| STATE_7 | Sliding becomes rolling | A wheel launched moving but not spinning: kinetic friction spins it up until v = Rω, then rolling holds | straightforward beat | advanced |
| STATE_8 | Roll it yourself | Sandbox — controls per `min_ring`, core-ring content only | exploration_sliders | explore |

The hook MOVES (S1 rolls from its first frame). No `narrative_socratic`, no `wait_for_answer`, no `pause_after_ms`.

## 3. Per-state choreography + control plan (Rule 31 control table)

Every state: flat ground (`theta_deg = 0` — same code path, `:940`; no θ-arc renders, `:40071–40079`), centre lane. **Body co-presence, stated against the reader (P1-A(b) retraction):** S3 is the ONLY state declaring two bodies; because `nlbBodyLaneZ` (`:39992–40001`) lanes every DECLARED body regardless of visibility, S3 authors **`lane_gap_m = 0` (single-lane semantics, sibling item (b)-10 — #11 is now a declared consumer)** so both phase bodies sit on the centre line of the 1.6 wu slab; they are never co-VISIBLE (phase A dissolves before phase B activates), so z-coincidence can never occlude. Every other state declares exactly one body. Wheel: `shape: 'wheel'` (SEAM G — tyre + hub + crossed spokes), m = 1 kg, `radius_m = 0.25` ((b)-9), k = 0.5 authored on the body — **modelled as a uniform disc, declared in the physics block (P3-4)**; no k chip ever renders (do-not-prespoil — k is #12's reveal).

**VELOCITY-ARROW MAP (P1-B — the second channel; supersedes routing velocities through the force map):** authored **`velocity_scale = 0.92` wu per m/s · `velocity_min_len = 0.25` wu** (fleet defaults preserved when absent — the sibling's back-compat clause (b)-19). Rendered lengths at the authored poses:

| Arrow | value (m/s) | Rendered L (wu) | Clamp? |
|---|---|---|---|
| S2 centre | 0.6 | **0.552** | no — **2.2× the 0.25 floor** (> the scar row's 1.5×) |
| S4 top/centre/bottom | 1.0 each | 0.92 each | no — equal by physics, equal in pixels |
| S5 top / bottom | ±1.0 | 0.92 each | no |
| S6 top | 2.0 | **1.84** | no (< MAX 2.80) |
| S6 centre | 1.0 | **0.92** | no — ratio **2 : 1 rendered exactly** |
| any exact zero (S2/S5/S6/S8 contact or centre) | 0.0 | **labelled stationary MARKER: dot + `0.00 m/s`** | never a stub, never a floored arrow (the design decision P1-B demanded, made here) |

This closes `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` for #11 (the sibling's force channel 0.30/0.25 closes it for #12; `concepts_affected` should widen to both). #11 draws **no force arrows** — its `f_k 1.96 N` / `f 0.00 N` are readouts — so #11 needs no mass/θ decision and the concepts agree on apparatus scale.

| State | Teaches | Archetype | Distinct motion | Delta cue | Live controls | Words | Ring |
|---|---|---|---|---|---|---|---|
| S1 | Rolling has both v and ω, bound by v = Rω | `reveal-build` | The wheel rolls at 0.9 m/s (readouts `v` and `ω` live from frame 1, ω dual-labelled once); **mark `0` stamps at the release point**; at the first COMPLETED turn (CAUSE: the marked spoke returns upright; EFFECT one readable beat later) mark `1` stamps and the bracket `2πR = 1.57 m` draws **mark 0 → mark 1**; the formula surface then builds `one turn → 2πR` → `v = Rω`; readouts `v 0.90` and `Rω 0.90` sit equal. Concrete before abstract. Closing sentence = the primary anchor (8 words). R drag = Rule-31 extra: re-lifts, re-scales, respaces marks + bracket live; **a trusted R drag SEIZES the loop (`:1553`) — the wheel then rolls to the −3.0 bound (≈6.0 s) and holds; marks + bracket hold their picture; `energy_active` is false (marks are their own primitive, P1-D), so the bound stop renders no energy event — declared, not accidental** | "One turn, one circumference" | R (0.15–0.35 m) | 45–55 | core |
| S2 | The contact point is instantaneously at rest | `flow-along-path` | Slow roll (0.6 m/s), camera target at the **run midpoint s = +0.9** (P2-3; framed extent ≈ 3.4 m ≈ [+2.6, −0.8] — the wheel never leaves frame). A marked rim dot streams along its cycloid; at the ground touch the trace comes to a CUSP and the dot visibly stops while the wheel keeps moving. Centre arrow 0.552 wu; **contact = the zero MARKER (dot + `0.00 m/s`)** — top arrow deliberately NOT shown (S6's reveal). Body-rect ∩ `nlbPanelRects()` = ∅ under this close camera (the screen-anchor row's own acceptance) | "Contact point speed: zero" | none | 35–50 | core |
| S3 | Sliding contact = kinetic friction; rolling contact = none | `cycle-compare` — two-phase 16a contrast, ONE state (founder ruling), `activate_at_ms` + `lane_gap_m = 0` | Phase A (t = 0): `nlb_wheel_locked` (`rotation_locked`) skids in at 2.0 m/s, μ_k = 0.2 → 1.96 m/s², skid trail, `f_k 1.96 N`, stops at 1020 ms (s = +1.38), holds, DISSOLVES at 1400. Phase B: `nlb_wheel_roll` has **`activate_at_ms = 1500`** — hidden and un-integrated before it, seeded at s₀ = +2.4, v₀ = 2.0 on that instant — and crosses at constant speed: no trail, `contact 0.00`, `f 0.00 N` (honest ONLY under the A1 branch-priority rule: the rolling branch supersedes Branch A's `f = −sign(v)·μ_k·N` `:45497–45499` while rolling holds). Activation is a pure function of state-local t (pin/rewind byte-stable — the hysteretic-state scar applied). Wrong picture first, kill after, back-to-back, no click. Secondary anchor (≤12 words) closes | "Skid slows; roll does not" | none | 40–55 | core |
| S4 | Pure translation: every point at the same v | `translate-through` | Frictionless flag. The wheel SLIDES at 1.0 m/s with spokes visibly NOT turning; velocity arrows reveal at top/centre/bottom (600/900/1200 ms) — all exactly equal (0.92 wu each). One idea: no turn ⇒ one speed everywhere | "Sliding: one speed everywhere" | none | 25–35 | extended |
| S5 | Pure rotation: rim ±Rω, centre at rest | `rotate/flip` | Frictionless flag. The wheel SPINS IN PLACE at the home pose, ω = 4 rad/s, v = 0 (consumes (c)-2's `omega0_rad_s` with v₀ = 0): top arrow 0.92 wu forward, bottom arrow 0.92 wu BACKWARD, **centre = the zero marker (`0.00 m/s`)**. One idea: pure turn ⇒ opposite rim speeds, still centre | "Turning: the rim, not the centre" | none | 25–35 | extended |
| S6 | The sum: 2v / v / 0 | `superpose-combine` (coined — the state's motion IS S4's and S5's motions performed simultaneously; nearest neighbour it is NOT: `reveal-build`, whose build constructs a scene, where this build is an addition of two already-shown motions) | The rolling wheel (v = 1.0, ω = 4.0, v = Rω ✓) rolls; arrows reveal in sequence — top 1.84 wu (600 ms), centre 0.92 (1000), **contact = zero marker** (1400) — then the formula surface builds `v + Rω = 2v` (1800) and `v − Rω = 0` (2400). The payoff is the SET and the two equations: **no state-level glow_focal** (P1-E); `phases[]` windows hand back to all three at equal brightness by 2400 ms, before the 2880 pin | "Slide plus spin: roll" | none | 40–55 | extended |
| S7 | Kinetic friction drives a slipping body TO rolling | `regime-switch` (shared coin with sibling S7, honestly differentiated: theirs = steady → threshold → FAILURE of rolling; this = convergence → capture → steady rolling) | Launch v₀ = 2.0, ω₀ = 0 ((c)-2) on μ_k = 0.05: contact slides (trail, spokes lag), kinetic friction slows v AND spins ω up; `v` and `Rω` readouts CONVERGE while the focal `contact` counts DOWN; capture at **t_c = v₀k/(μ_k g(1+k)) = 1361 ms** (closed-form — modelled as a uniform disc, k = 0.5; at k = 1 t_c would be 2041 ms = 60.0% of R, ON the pin — the modelling declaration is load-bearing, P3-4), trail stops, rolling persists (branch priority per A1: post-capture, `f 0.00`). v₀ slider = Rule-31 extra (envelope below) | "Sliding becomes rolling" | v₀ (1.0–2.5 m/s) | 35–50 | advanced |
| S8 | Everything, teacher-driven | `drag-sandbox` | One wheel, sandbox wrap, trusted drag; readouts v, Rω, contact live; rim trace on; **turns counter + revolution marks ON (core furniture from S1 — under the reduced preset the R dial visibly changes distance-per-turn, P2-6)**. On every wrap: v AND **ω re-seed to the authored seeds** (P2-4/A4 — each lap replays the same lesson); trail/trace break at the wrap. CORE content only (38b): contact marker + centre arrow, v = Rω furniture — no top arrow, no formula surface, no k | "All controls live" | see min_ring table | 0 / open | explore |

**S8 explore controls with `min_ring` (μ_k paragraph kept verbatim per Checkpoint A ruling 6):**

| Control | `min_ring` | Guided state that teaches it |
|---|---|---|
| v₀ (0.5–2.5 m/s) | core | S1 (speed is S1's defined variable) |
| R (0.15–0.35 m) | core | S1 |
| ω₀ starting spin (0–12 rad/s) | **advanced** | S7 (a v–ω mismatch is S7's lesson) |
| μ_k (0.02–0.30) | **advanced** | deliberately advanced, NOT S3: with ω₀ hidden the sandbox always starts rolling, where μ_k does nothing visible on level ground (f = 0) — a dial that changes nothing fails the teacher test; its sandbox lesson (capture time) is S7's |

*Hide advanced* → v₀ + R survive; the sandbox always starts rolling (ω₀ defaults to v₀/R), every surviving readout is taught, **and the turns counter gives the R dial a visible consequence** ✓. *Hide advanced+extended* → same set ✓. Full preset: a teacher authors a v–ω mismatch and watches capture — the explaining cue (converging v / Rω / contact) is CORE furniture, so no ring-suppressed-cue defect is possible.

**Revolution marks — own primitive (P1-D):** own mesh + turn-count trigger + live respace under an R drag; **no `checkpoints` reuse** (four collisions in code: `capture` is a closed energy enum `:1500`; stamps render into the state's ONE formula surface `:1487`/`:44373`/`:44797`, which S1 authors; `checkpoint_state` flips `eng.energy_active` `:42747`, falsifying the no-energy-layer claim and arming the clamp guard `:45595` whose warning THE EYE asserts zero of; `NLB_CP_MAX = 3` `:43547`). **R-slider envelope with mark counts at both ends:** run = 4.5 m; at R = 0.15 (2πR = 0.9425 m) → marks 0–4, **5 marks**, positions +2.4 / +1.457 / +0.515 / −0.428 / −1.370; at R = 0.35 (2πR = 2.199 m) → marks 0–2, **3 marks**, +2.4 / +0.201 / −1.998; at the authored R = 0.25 → marks 0/1/2 at **+2.4 / +0.829 / −0.742** (mark 1 is 2.171 m from the +3.0 bound; mark 2 is 2.258 m from −3.0 — P3-2 corrected). All in-bounds across the whole envelope.

**Home pose + track geometry:** `length_m` is a half-length (`:941`; readers `:40061–40067`, `:44176`) → **`surface.length_m = 3.0`, ONE value concept-wide**, 6.0 m track, s ∈ [−3.0, +3.0]. **`initial_position_m = +2.4`** every state (0.6 m inset ≥ 2× the 0.25 m radius). All motion toward −s; readouts display magnitudes.

**Loop-reset / frozen-pin timing (g = 9.8; last asserted event = the COMPLETION of the state's reveal chain, P1-C; pin phase fixed at 0.60R — `deriveStateMeta.ts:2937–2957`; json_author re-verifies at h = 1/60; the table is CONDITIONAL on the state-local clock, (b)-11/E1):**

| State | R (ms) | Reveal chain → last asserted event | Time (% R) | Pin 0.60R | What the pin photographs · margin |
|---|---|---|---|---|---|
| S1 | 5000 | mark 0 @ 0 · mark 1 @ 1745 · bracket 1745–2050 · formula L1 @ 2300 · **L2 @ 2600** | 2600 (52.0%) ✓ | 3000 | wheel at s = −0.30, marks 0+1, full bracket (BOTH endpoints), full formula, equal readouts · 400 ms ✓ (mark 2 @ 3490 NOT asserted; run ends s = −2.1 ✓) |
| S2 | 5000 | centre arrow @ 500 · contact marker @ 800 · **first cusp @ 1309** (πR/v) | 1309 (26.2%) ✓ | 3000 | one full cycloid arch + cusp, marker `0.00`, wheel at s = +0.6 — inside the framed extent · 1691 ms ✓ (run ends s = −0.6 ✓) |
| S3 | 4000 | A: stop @ 1020 (s = +1.38) · dissolve 1400 · **B activates 1500 (HELD until then), readouts settle @ 1800** | 1800 (45.0%) ✓ | 2400 | phase B ROLLING at s = +0.60 (t_B = 900 ms), `contact 0.00`, `f 0.00`, no trail, no skidder · 600 ms ✓ (B ends s = −2.6 @ 4000, 0.4 m inside the bound — **no phase ends against the bound**, P1-A(3)) |
| S4 | 4000 | three equal arrows @ 600/900/**1200** | 1200 (30.0%) ✓ | 2400 | mid-slide at s = 0.0, spokes still, three equal arrows · 1200 ms ✓ (ends s = −1.6 ✓) |
| S5 | 4000 | rim arrows + centre marker by **1200** | 1200 (30.0%) ✓ | 2400 | mid-spin at the home pose, ±0.92 wu arrows, centre `0.00` · 1200 ms ✓ (no translation — no bound) |
| S6 | 4800 | arrows @ 600/1000/1400 · formula L1 @ 1800 · **L2 @ 2400** (glow hand-back complete 2400) | 2400 (50.0%) ✓ | 2880 | rolling at s = −0.48, all three arrows at EQUAL brightness + both formula lines · 480 ms ✓ (ends s = −2.4 ✓) |
| S7 | 3400 | **capture @ 1361** (t_c closed-form; slide = 2.722 − 0.454 = 2.268 m → capture at s = +0.132; v_roll = v₀/(1+k) = 1.333 m/s) | 1361 (40.0%) ✓ | 2040 | post-capture rolling at s = −0.77, trail ended, contact 0.00 · 679 ms ✓ (ends s = −2.586, 0.414 m inside — no clamp) |
| S8 | — | free-run sandbox (Rule 37); synchronised single-body wrap with v + ω re-seed | — | — | — |

**S7 slider envelope (P3-3 corrected):** slide distance **d(v₀) = v₀²k(2+k)/(2μ_k g(1+k)²) = 0.567·v₀²** at μ_k = 0.05, k = 0.5. Over v₀ ∈ [1.0, 2.5]: d_max = 3.543 m → capture completes at s ≥ −1.143, always ≥ 1.857 m before the −3.0 bound ✓. A trusted v₀ drag SEIZES the loop; the wheel then rolls to the track end and stops under the geometric bound — honest, readable, and with **no energy layer authored anywhere in this concept (true again now that marks bypass `checkpoints`, P1-D)** no false energy event renders; declared.

**Per-state glow plan (P1-E — channel named per state; Rule 32e caps at one, it does not require one; consistent with the sibling's table):**

| State | Channel | Emphasis |
|---|---|---|
| S1 | `phases[].glow_focal` (`nlbRunPhases` `:45296–45310`) | bracket window at its draw → formula-line windows → hand-back after 2600 |
| S2 | state-level | the rim dot |
| S3 | `phases[]` | phase A: the f_k readout · phase B: the contact readout (the sibling S3 pattern) |
| S4 | `phases[]` | per-arrow reveal windows, hand-back to all three EQUAL by 1200 (the payoff is equality — no single arrow may stay focal) |
| S5 | state-level | the bottom (backward) arrow — the one surprising element |
| S6 | **NO state-level `glow_focal`** — a relation among three arrows + two lines | `phases[]` windows per reveal; **hand-back complete by 2400 ms: all three arrows equal brightness before the 2880 pin** |
| S7 | state-level | the contact readout (counts down to 0.00 — the capture IS its story) |
| S8 | none | sandbox |

**Camera plan (per-state `camera_position`, target per (b)-13):** S1 near side-on (marks + bracket undistorted); S2 closed, **target s = +0.9 (run midpoint, P2-3)**, framed extent stated above, body-rect/DOM-overlay acceptance; S3 wide (the 5.4 m phase-B run); S4/S5/S6 side-on medium (the arrow fans are what foreshortening destroys); S7/S8 wide, mild yaw. S3's two declared bodies are z-coincident (`lane_gap_m = 0`) and never co-visible, so nothing can occlude; every other state is single-body — the occlusion warning (b)-12 stays a sibling-only consumer.

**Rule 32 legibility:** cause before effect everywhere (S1 spoke-upright → mark a beat later; S3 skid → slow → stop → dissolve → activation; S7 friction acts → readouts converge → capture). Only the taught variable moves per state. Same apparatus from the home pose; S3's phase bodies are distinct ids (`nlb_wheel_locked`, `nlb_wheel_roll`), `rotation_locked` constant per id. Single glow focal per instant via the channel table. Body labels are mass symbols or absent; the brighten-only label row is engine-side (sibling E6), no #11 state depends on it (no compared body labels here).

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots)

| Wrong belief | Source | At | `misconception_watch` beat |
|---|---|---|---|
| "Every point of the wheel moves at the wheel's speed — the bottom slides along the road" | PER + catalog (the pure-rolling classic) | STATE_2 | `belief`: the contact point moves forward at v like the rest of the wheel. `visual_counter`: the rim dot's cycloid comes to a CUSP — the dot visibly stops at each ground touch — while the centre arrow holds 0.552 wu and the contact MARKER holds `0.00 m/s`. `one_line_fix`: the turn carries the bottom point backward at exactly the speed the wheel moves forward, so at the ground the two cancel to zero. **Named primitives:** rim dot + cycloid trace + zero marker ((b)-3 as amended by A2 + the velocity channel) |
| "A rolling wheel slides against the road — its friction is kinetic and always slows it" (RM-G7) | RM-G7 | STATE_3 | `belief`: rolling contact is sliding contact, so kinetic friction acts and drains speed. `visual_counter`: the locked wheel skids ALONE first — slows at 1.96 m/s², leaves a trail, stops — and dissolves; only then the rolling wheel activates and crosses at constant speed, no trail, `f 0.00 N`. Wrong picture first, real physics after, back-to-back in one state (the founder's stated reason for `activate_at_ms`). `one_line_fix`: kinetic friction needs a sliding contact; a rolling contact point is at rest, so only static friction can ever act there — and on level ground at steady speed even that is zero. **Named primitives:** `rotation_locked` + skid trail + f_k readout + `activate_at_ms` ((b)-4/(b)-7/(c)-5) |

No other state carries a `misconception_watch` (S4–S6 are straightforward teaching). EPIC-C branches: ZERO.

## 5. `has_prebuilt_deep_dive` states

- **STATE_2** — the PRIMARY aha and the historically stickiest claim.
- **STATE_7** — the exam-heavy state (sliding-then-rolling problem class), importing the most prerequisite machinery.

Divergence note: the S1 prerequisite cliff is patched by one narration sentence and needs no deep-dive; flags and cliffs deliberately differ at S1. All other states un-flagged (Rule 18).

## 6. Drill-down clusters

**STATE_2:** `why_the_contact_point_is_at_rest` · `cycloid_path_of_a_rim_point` · `backward_turn_speed_cancels_forward_speed`.
**STATE_7:** `time_for_sliding_to_become_rolling` · `friction_direction_during_slipping` · `final_speed_after_rolling_begins`.

## 7. `entry_state_map`

```
entry_state_map:
  foundational: STATE_1 → STATE_3
  point_speeds: STATE_4 → STATE_6
  slipping:     STATE_7
```
Default `foundational`. Cross-slice pill after S3: "How fast is the TOP of the wheel moving?" → STATE_4. PRIMARY aha (S2) inside foundational ✓.

## 8. Prerequisites (advisory, Rule 23)

`rotational_kinematics` (#4 — ω and v = ωr; cliff at S1) · `friction_force` (SHIPPED, same scenario — static/kinetic vocabulary; S3's skidding half IS the patch) · `tau_eq_i_alpha` (#7 — S7's spin-up; one patch sentence) · `moment_of_inertia` (#6 — S7 consumes k silently; covered by #7's patch sentence). Successor: `rolling_on_incline` (#12) recaps this concept in its S2, on the same wheel radius.

Namespace check: `pure_rolling` collides with no rostered physics or chemistry id (bug-queue per-id query 0 rows; no JSON of that name in either directory).

## 9. Real-world anchor (Rule 35 / 38f — universal, culture-neutral)

**Primary (STATE_1, 8 words inside its budget):** *"A bicycle wheel crosses the road exactly this way."* Widest-syllabus-overlap rolling device on Earth (38f); no place, brand, or culture; physics-true at every depth. **Secondary (STATE_3, ≤12 words):** *"A braked, locked wheel leaves a skid mark; a rolling wheel leaves none."* **Deliberate chapter coherence (P3-7):** the bicycle wheel is #11's primary and #12's secondary BY DESIGN — the same remembered object first on the flat, then on the slope; shared, not duplicated by momentum.

**DC Pandey check:** consulted chapter table of contents only (rolling motion scope + JEE presence). No teaching sequence, example problem, figure, or phrasing imported. NCERT §7.14's translation-plus-rotation decomposition is re-derived from first principles as S4–S6, not copied.

## 10. Definition of Done (Gate 0 — no TBDs)

**(a) States:** the 8 of §2, exactly as tabled in §3, including geometry, timing table, glow table, camera plan.

**(b) Symbol-label table:**

| Quantity | On-canvas label |
|---|---|
| Centre speed | `v 0.90 m/s` (metric: \|v\|) |
| Turn rate | `ω 3.6 rad/s` (dual-label once in S1: "turn rate ω (angular velocity)", then bare — 38d) |
| Radius | R (slider row "Radius R"; drives lift + scale + spin + mark respace, (b)-9) |
| Rolling-condition readout | `Rω 0.90 m/s` beside v (metric: \|ω\|·R) |
| Contact-point speed | `contact 0.00 m/s` (metric: \|v − ωR\|) |
| Circumference bracket | `2πR = 1.57 m`, drawn **mark 0 → mark 1** (derived from authored R — drives mark spacing, never a display string) |
| Revolution marks | ground ticks `0`, `1`, `2`, … at s_n = 2.4 − n·2πR — **own primitive** (P1-D): turn-count trigger, live respace, no stamp, no `energy_active`, no cap |
| Turns counter (S8) | `turns 3` (integer count since lap start — core furniture) |
| Friction readouts (S3/S7) | `f_k 1.96 N` on the skidder · `f 0.00 N` on the roller (metric: the integrator's own \|f\|; honest via the A1 branch-priority rule) |
| Velocity arrows (S2/S4/S5/S6) | value-labelled arrows, lengths through the **velocity channel** (0.92 wu·s/m, floor 0.25) — computed from live (v, ω) as v, v ± ωR, never constants (A2) |
| Zero-velocity marker | dot + `0.00 m/s` — the specified rendering of every exact-zero point speed (never a stub, never a floored arrow) |
| Skid trail | drawn during \|v − ωR\| > 0 only; breaks at every wrap/reset (A4) |
| Sliders | `Speed v₀` · `Radius R` · `Starting spin ω₀` · `Friction μ_k` |
| Formula surfaces | S1: `one turn → 2πR` ⇒ `v = Rω` · S6: `v + Rω = 2v` then `v − Rω = 0` — on `#nlb_formula` (Cambria Math); longest line `v + Rω = 2v` verified in pixels against the 340 px max-width ((b)-14) |

All Unicode across all three text paths (Rule 34c). **k = I/mR² never renders.**

**(b′) Term-introduction ledger:**

| Symbol/term | DEFINED in | First USED in | ✓ |
|---|---|---|---|
| v, ω (dual-label), R, 2πR, marks, bracket, v = Rω, Rω readout, turns | S1 | S1 (Rω re-used S2–S8; marks/turns re-used S8) | ✓ |
| contact readout, rim dot, cycloid trace, zero marker | S2 | S2 (re-used S5/S6/S7/S8) | ✓ |
| f_k, skid trail, μ_k, `f 0.00 N` | S3 | S3 (re-used S7) | ✓ |
| point-speed arrows (velocity channel) | S4 | S4 (re-used S5/S6; centre arrow pre-figured in S2) | ✓ |
| top-point arrow, 2v | S6 | S6 — **must not render in S1–S5 or S8** | ✓ |
| ω₀ (starting spin, as a SYMBOL) | S7 (a launch with zero spin) | S7 + S8 slider (S5 shows spin-in-place without naming the symbol) | ✓ |

**(c) Right-hand-rule plan:** N/A — no direction rule taught (the ω-vector belongs to `angular_momentum`, 0c-1). Declared deliberately.

**(d) Motion plan:** per §3; nothing static, nothing asserted-but-unrendered (the zero-friction claim is a rendered `f 0.00 N`; the stop is integrated; the cusp is traced; every zero point-speed is a rendered marker). Spin position-driven through the body's own `radius_m` when rolling ((b)-9), integrator-driven when slipping ((b)-5 + (c)-3). **Modelling declaration (P3-4): the wheel is treated as a uniform disc, k = 0.5** — stated in the physics block and available to narration; the S7 timing depends on it. Every archetype discharged by the authored beat with zero teacher input; the S1 R slider and S7 v₀ slider are Rule-31 extras only.

**(e) Modes:** reuses sibling modes `rolling_contact` (S2) and `rolling_friction_contrast` (S3) at θ = 0; adds `rolling_intro_circumference` (S1), `rolling_slide_only` (S4), `rolling_spin_only` (S5), `rolling_sum` (S6), `rolling_capture` (S7); reuses `sandbox` (S8). deriveStateMeta co-edit at all three sites (shared duty F10).

**(f)** `assessment` + `coverage_map` span: v = Rω (S1), contact at rest (S2), friction type (S3), point speeds 0/v/2v (S4–S6), capture time + final speed (S7). `misconception_watch` = exactly §4's two beats.

**(g) Macro↔micro (Rule 33):** lattice/carrier N/A — the mechanism is contact-scale and is itself the taught picture. 33d met: every instrument shows a live numeric value tracking the motion (v, ω, Rω, contact, f, turns); every derived readout specified by METRIC; the numbers in this document are CHECK values.

**(h) Canvas budget (Rule 34):** ONE formula surface max per state (S1, S6 only); caption = the ≤5-word delta cue only; prose in the strip below; HUD value-only; panels at `top:52px+`; S8 readout load = one wheel × (v, Rω, contact, turns) + trace — under the collision threshold, zone sized off actual rendered neighbour height ((b)-14).

**(i) Curriculum-flex (Rule 38):**
- **(i-1) Preset-cut coherence over states AND controls:** *Hide advanced (S1–S6 + S8):* condition → contact at rest → friction type → slide → spin → sum → sandbox (v₀, R). No surviving narration references slipping, capture, ω₀-as-symbol, or μ_k's sandbox role. *Hide advanced+extended (S1–S3 + S8):* a complete qualitative-plus-v=Rω lesson; no surviving state or control references 2v, superposition, or slipping; the S8 turns counter keeps the R dial consequential (P2-6). Verified against every §3 caption, formula, control and the min_ring table.
- **(i-2)** S8 surfaces CORE content only under EVERY preset: v, Rω, contact readouts, centre arrow + zero marker, trace, marks + turns. No explore formula surface exists; the one relation on show, v = Rω, is derived in core S1.
- **(i-3) `curriculum_tags` (claims, not facts):** CBSE/NCERT §7.14 core+extended — **verified at authoring**; advanced S7 = JEE Main/Advanced (sliding-to-rolling class) — verified against the DCP index. AP Physics C full · AP Physics 1 core only · IB DP core+extended · A-level core only — every one `needs_teacher_verification`.
- **(i-4) Presets:** `full` = S1–S8; `mainstream` = hide S7 (sandbox loses ω₀, μ_k); `qualitative` = hide S4–S7.
- **(i-5) Graph axes:** no graph panel — N/A, declared (S7's convergence is carried by readouts; a v/Rω-vs-t graph would be new nlb wiring, deliberately NOT requested — union discipline).
- **Notation ladder (38c):** all surfaces algebra-only. **Dialect (38d):** "turn rate ω (angular velocity)" once, then bare.

**(j) Teacher-walk answers:** (1) S1 states v = Rω and shows the equal readouts + the bracket; S2 shows the cusp + `0.00` the exam diagram asserts; S4–S6 build the 0/v/2v figure students are examined on; S7 shows the capture the JEE problem asks for. (2) Drag R in S1 and watch marks + bracket respace live; in S8 at full preset set ω₀ = 0 and watch capture; under the reduced preset drag R and watch distance-per-turn. All in range, envelopes stated. (3) Term ledger (b′). Declared omissions: k and the incline are roster design (#12); rotational KE is #8; the ω-vector is #9 — decisions, not exemptions.

---

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

1. **Prerequisite cliff.** `rotational_kinematics` → **S1**: patch sentence inside the dual-label — "the turn rate ω counts how much angle the wheel turns each second" — then the bracket makes v = Rω geometric, not recalled. `friction_force` (shipped) → **S3**: the skidding phase-A IS the patch. `tau_eq_i_alpha` → **S7**: one sentence — "friction's turning effect on the rim speeds the spin up, a torque doing to ω what a force does to v." `moment_of_inertia` → S7 consumes k = 0.5 silently; the modelling line ("treated as a uniform disc") plus #7's patch sentence cover it.
2. **JEE-backwards trace.** *"A wheel is projected along a level floor at v₀ with no spin; friction coefficient μ_k. Find (i) the time when pure rolling begins, (ii) the speed then, (iii) the speed of the highest point at that moment."* v = Rω as the capture condition → S1; contact-at-rest legitimising "pure rolling" → S2; kinetic while sliding, static after → S3; spin-up + t_c + v_roll → S7; top point 2v → S6. No missing piece. (M1–M6 carve-out N/A — Ch.7 mechanics.)
3. **Misconception entry mapping.** Contact-moves-at-v → S2 (16a beat). *Planting risk:* S1's narration must say "the wheel's CENTRE moves at v" from the first sentence, so the over-generalisation is never planted. RM-G7 → S3. *Planting risk:* S1–S2 stay friction-neutral; friction enters only at S3.

### Block 2 — Aha-moment designation

- **PRIMARY aha, at STATE_2:** "the point where a rolling wheel touches the road is, at that instant, NOT MOVING — the wheel crosses the road on a point at rest." The 10-year memory.
- **SUPPORTING aha, at STATE_3:** "because the contact never slides, rolling does not slow the way skidding does" — the primary's payoff, and the reason wheels and ball bearings exist. Cohesion ✓.
- **Wrong-belief setup:** primary — S1 builds a confident "the wheel moves at v" picture (readouts, marks, bracket all speak of one speed); S2 breaks it at the cusp. Supporting — everyday "friction slows moving things" plus S2's fresh contact story sets up "so friction must act down there"; S3's `f 0.00 N` breaks it.
- **Foundational coverage:** S2 ∈ foundational (S1–S3) ✓.

---

## SCAR AUDIT (rebuilt on the eleven-concept sweep — queries in the header; a row not reached by a stated query is not dispositioned)

**OPEN rows returned by the live per-id sweep — including the seven Checkpoint A named as missing:**

| bug_class (status/owner) | Verdict for pure_rolling |
|---|---|
| `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` (MAJOR/OPEN, alex:physics_author) | **CLOSED for this design by the velocity channel (P1-B)** — smallest nonzero drawn velocity (0.6 m/s) renders at 2.2× the floor; every exact zero is a marker, never a floored arrow; #11 draws no force arrows. `concepts_affected` should widen to both rolling concepts (UPSERT note carried) |
| `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` (MAJOR/OPEN, alex:json_author — reached via the owner query) | **applied** — S6 authors NO state-level focal; S4's hand-back ends with three equal arrows (§3 glow table) |
| `field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus` (DIRECTIVE/OPEN, peter_parker:renderer_primitives) | **build-sheet item (c)-8/E14** — marks, bracket, velocity arrows, zero markers, cycloid trace, skid trail, turns counter all registered; bring-up probe asserts apparatus existence + visibility |
| `field3d_nlb_body_screen_anchor_lands_under_the_dom_slider_panel` (MAJOR/OPEN, field3d_surgeon) | **applied** — S2's close camera carries the row's own acceptance: body rects ∩ `nlbPanelRects()` = ∅ under the authored camera ((b)-13/(b)-14) |
| `frozen_frame_read_as_dense_series_continuation_on_translating_body` (MODERATE/OPEN, ambiguous) | **routed to eye_walker/quality_auditor as a READING directive** — 7 of 8 states are translating bodies read from frozen frames (S5 spins in place); frozen = the state pinned at 0.60R, compared only against the dense frame at that time |
| `concept_ships_zero_narration_glow_bindings` (MAJOR/OPEN, alex:physics_author — reached via the owner query) | **routed (P2-8)** — physics_author authors a `glow` on every `tts_sentences[]` entry naming exactly one on-canvas element |
| `authored_state_glow_focal_silently_voids_every_tts_sentence_glow` (MAJOR/OPEN, **FOUNDER PENDING**) | **not chased** (per Checkpoint A's explicit instruction) — nlb's `phases[]` channel is independent of `SET_GLOW`; the glow table names channels so the pending ruling lands cleanly whichever way it goes |
| `nlb_body_label_is_brighten_only_so_static_text_outranks_the_state_focal` (MAJOR/OPEN, field3d_surgeon) | **milder here than #12** — no #11 state compares body labels (mass symbols or absent); the sibling's E6 precondition is #12-blocking only; #11 rides the fix when it lands |
| `nlb_friction_vector_first_frame_reveal_tint_bypasses_seam_q_ink_fix` (MODERATE/OPEN, field3d_surgeon) | **surgeon ride-along** — #11 draws no friction ARROWS (readouts only), but the velocity arrows' t = 0 reveal ink must clear the same contrast floor; folded into the E14/E8 duty |
| `field3d_sprite_label_text_and_ink_box_are_invisible_to_every_dom_probe` (MODERATE/OPEN, field3d_surgeon) | **applied to (b)-14** — every label-decollision acceptance uses the sprite projection probe (`_pmText` + measureText), never a DOM probe |
| `the_eye_passes_a_frame_in_which_one_compared_body_is_hidden_behind_another` (MAJOR/OPEN) | **sibling-only consumer stands, on corrected grounds:** S3's two bodies are z-coincident by authored `lane_gap_m = 0` and never co-visible; every other state single-body |
| `nlb_angle_arc_radius_overruns_the_neighbouring_lane_body` (MAJOR/OPEN) | **N/A at θ = 0** — the arc collapses and hides (`:40071–40079`) |
| `nlb_coupled_sandbox_F_slider_exceeds_string_tautness_bound` (MODERATE/OPEN) | **N/A** — no coupled bodies, no string, no F slider |
| `nlb_multibody_lane_gap_is_along_z_so_a_head_on_camera_stacks_the_compared_bodies` (DIRECTIVE/OPEN, alex:architect) | **applied via the (b)-10 consumption** — S3 authors lane geometry explicitly (gap 0, single lane) with the lane function's lines quoted; cameras side-on/wide, never head-on down the z axis |
| `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate` (DIRECTIVE/OPEN) | **satisfied** — mark positions are track coordinates on the home pose (s_n = 2.4 − n·2πR) |
| `nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula` + `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows` (DIRECTIVE/OPEN) | **satisfied** — timing table budgets every state to the COMPLETION of its reveal chain (P1-C); every pin margin ≥ 400 ms ≥ 167 ms |
| `nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm` (DIRECTIVE/OPEN) | **satisfied** — home pose +2.4; every loop end ≥ 0.4 m inside the bound; the only bound stops are declared seize behaviours |
| `field3d_param_ramp_authoring_contract` (DIRECTIVE/OPEN) | **N/A** — no param_ramp authored |

**Scenario-scoped rows (carried from Checkpoint A's live re-verification, stated as such):** `field3d_nlb_physics_clock_not_state_local` (CRITICAL/OPEN) → **(b)-11/E1 precondition of the entire timing table — owner `peter_parker:renderer_primitives` → pcpl-surgeon** (routing correction carried) · `nlb_multibody_sandbox_wrap_reanchors_only_the_wrapping_body` → genuinely N/A (S8 single-body) but the wrap's ω gap is real → E13 · `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` → (b)-13, S2's midpoint target is its consumer.

**Recurrence-ratchet rows:** `architect_scar_audit_claims_completeness_while_skipping_open_rows_on_the_scenario_it_extends` — **the sweep is now the eleven-id grep, run live; no hand-list anywhere in this audit** (P1-F closed; UPSERT should add `pure_rolling` per Checkpoint A). `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` — the inverted form is answered: the lane N/A is retracted and re-decided by quoting the reader (`:39992–40001`), and the marks reuse claim is re-decided by the four-part diff (P1-D). `closed_enum_cannot_name_a_substance_the_design_teaches` — now applied to all THREE enums this design touches: `controls_visible` `:1340` (lacks R, omega0 → (b)-8/(c)-2), `readouts` `:1336` (lacks ω/Rω/contact/turns → (b)-3/(c)-4 + the turns token), `checkpoints.capture` `:1500` (lacks any turn-count member — one of the four reasons marks are their own primitive).

**All other REV 1 dispositions** (the satisfied/N/A-with-reason/routed sets not named above) stand, re-checked against the REV 2 deltas; the geometry that moved (S3's hold, the S4–S6 split, S1's fold) is covered row-by-row above. `teach_reveal_synced_to_narration` / `teach_show_quantity_live_when_named` / `teach_color_each_element_by_its_own_sign` remain routed to physics_author. `hysteretic_state_cannot_be_latched_under_a_time_pin` now ALSO binds `activate_at_ms` (activation = pure function of state-local t) alongside (c)-3's closed-form capture.

---

# 0c-2 ENGINE UNION — pure_rolling contribution (REV 2 — reflects the founder ruling)

> **Union closure statement:** the union is measured over BOTH concepts. Per the founder ruling: **A5 is DELETED** (three-phase states split into states; the config-contract sequential-phase maximum drops to TWO bodies per state — #11 S3 and #12 S3, same mechanism); **`activate_at_ms` is bought, narrowly scoped** — per-body activation ONLY (hidden + un-integrated before the instant, seeded at authored s₀/v₀ on it, pure function of state-local t). **It is NOT a choreography DSL: no other timed actions, no timed property changes, no per-body timelines beyond the single activation instant — stated here so the item cannot grow by default.** **#11 is a declared consumer of (b)-10** (`lane_gap_m = 0` / single-lane on S3).

## (a) Already exists today (verified in code, file:line — citations corrected per P3-1)

1. Flat surface — `theta_deg = 0` same code path (`:940`); θ-arc collapses and hides (`:40071–40079`).
2. Bodies with mass / `initial_position_m` / initial velocity; `v0` token (`:1340`); `mu_s`/`mu_k` per body + `surface.frictionless`.
3. Wheel mesh, tyre + hub + crossed spokes (SEAM G); lift `NLB_BODY_SIZE/2` (`:40015`) and spin divisor `NLB_WHEEL_R` (`:40053`) both replaced by (b)-9.
4. SEAM M readouts + `#nlb_formula`; scenario_cue channel + ghost/dissolve; per-state `camera_position`; fixed-step integrator + `loop_reset_ms`; sandbox wrap + `trusted_drag_seizes`.
5. Checkpoint marker machinery — **explicitly NOT the substrate for revolution marks** (P1-D: closed `capture` enum `:1500`; stamps target the ONE formula surface `:1487`; `energy_active` side effect `:42747`; `NLB_CP_MAX = 3` `:43547`). Cited only as the crossing-interpolation precedent the sibling's finish mechanism reuses.

## (b) In the sibling's union (shared — consumed by pure_rolling)

| Sibling item | pure_rolling consumption |
|---|---|
| (b)-2 rolling acceleration branch, **θ = 0 first-class (A1 as restated)** | S1–S6's substrate; S3/S7's `f 0.00 N` depends on the branch-priority rule below |
| (b)-3 contact-point picture (arrows **computed from live (v, ω)** — A2; cycloid/rim trace; contact readout) | S2 (whole state), S4–S6, S7, S8 — through the velocity channel (c)-6 |
| (b)-4 static/kinetic friction call-out | S3, S7 |
| (b)-5 slip regime (independent ω integration, α from friction torque, skid trail, spin lag) | S5 (spin-in-place via ω₀ + frictionless), S7's slide phase |
| (b)-7 `rotation_locked` per-body flag + sequential contrast cueing | S3 phase A |
| (b)-8 `controls_visible` token `R` | S1, S8 |
| (b)-9 per-body `radius_m` | every state; S1's R slider is the live-re-lift consumer |
| **(b)-10 lane geometry — NOW CONSUMED (P1-A(b), founder ruling)** | **S3: `lane_gap_m = 0` / explicit single-lane** — both declared phase bodies at z = 0, on the slab |
| (b)-11 state-local physics clock (CRITICAL; → pcpl-surgeon) | precondition of the entire timing table |
| (b)-13 camera target authoring | S2's run-midpoint target (+ body-rect/DOM acceptance) |
| (b)-14 overlay verifications in pixels (sprite projection probe, never DOM) | formula surfaces, label decollision, readout zone |
| (b)-19 back-compat clause | governs `velocity_scale`/`velocity_min_len`, `activate_at_ms`, `lane_gap_m`, marks — absent ⇒ today's behaviour byte-identically |
| Explicitly NOT consumed | (b)-1 k chips · (b)-6 KE readouts · (b)-12 occlusion warning (S3's phase bodies never co-visible; all else single-body) · (b)-15 centre markers · (b)-16/17/18 finish/restart/force-map (#12-only) · F8 non-wheel meshes |

## (c) NEW — needed by `pure_rolling` (amended per the ruling)

1. **Revolution marks + circumference bracket — OWN primitive (P1-D rewrite).** Ground mark stamped at each completed revolution (mark 0 at the release point; s_n = initial − n·2πR), labelled bracket mark 0 → mark 1, marks AND bracket respacing live under an R drag, **plus a turns-counter readout**. Own mesh, own turn-count trigger, **no `checkpoints` reuse, no formula-surface stamp, no `energy_active` side effect, no `NLB_CP_MAX` cap** (the four line-numbered reasons in (a)-5). Consumers: S1, S8.
2. **Authorable initial spin, decoupled from v.** `bodies[].omega0_rad_s` (default v₀/R) + `controls_visible` token `'omega0'`. Consumers: S5 (v = 0, ω = 4, frictionless), S7 (v = 2.0, ω = 0), S8.
3. **Slip-to-roll CAPTURE** — closed-form in state-local t (t_c = v₀k/(μ_k g(1+k))), never a per-frame latch (pin/rewind byte-stable). **Plus the A1 branch-priority rule: while the rolling condition holds, the rolling branch SUPERSEDES Branch A's `f = −sign(v)·μ_k·N` (`:45497–45499`)** — a rolling body carrying μ_k reads `f 0.00 N` on level ground, and post-capture rolling persists. The (c) centerpiece; S7/S8 payoff.
4. **Bare-ω readout token** (+ the turns token from (c)-1) — enum-diff honesty on `readouts` `:1336`. Consumer: S1 (and S8).
5. **Per-body `activate_at_ms` (P1-A(a), founder-bought, NARROW).** Hidden and un-integrated before the instant; seeded at authored s₀/v₀ on it; activation a pure function of state-local t. **Scope guard: this single field is the entire buy — no other timed actions, ever, without a new founder signature.** Consumers: #11 S3; #12 S3/S6.
6. **Two-channel vector map — the velocity channel (P1-B).** `velocity_scale`/`velocity_min_len` independent of the sibling's `force_scale`/`force_min_len` (E5), defaults = today's constants; authored 0.92 wu·s/m / 0.25 wu; **plus the zero-vector marker: dot + value, never a stub, never a floored arrow.** Consumers: S2/S4/S5/S6/S8 (#12 unaffected — force channel only).
7. **ω re-seed on the sandbox wrap (A4 widened, P2-4).** On wrap: v AND ω re-seed to the authored seeds (the `:45547–45557` reasoning); trail/trace break at wrap and reset. Consumer: S8 (#12's synchronised restart takes the same discipline).
8. **Visible-elements matcher registration (P2-7)** for every new element type: marks, bracket, velocity arrows, zero markers, cycloid trace, skid trail, turns counter.

## Survey/build-sheet AMENDMENT FLAGS (updated)

- **A1 (restated, P2-1)** — (b)-2 states θ = 0 first-class AND the **branch-priority rule**: the rolling branch supersedes the sliding-friction path while rolling holds (`:45497–45499`). Not "formula-automatic" — it is what the surgeon would get wrong.
- **A2 (stands, widened)** — point-speed arrows computed from live (v, ω); carried WITH the two-channel map + zero marker ((c)-6). The alarm-rule catch, verified both ways by Checkpoint A.
- **A3 (stands)** — rotation markers on the sibling's F8 meshes; landed in #12 REV 4. #11 needs nothing (wheel only).
- **A4 (stands, widened)** — trail/trace break at every wrap/reset/halt + **ω re-seed on wrap** ((c)-7).
- **A5 — DELETED (founder ruling).** The three-phase config shape no longer exists; the sequential-phase maximum is TWO bodies per state, served by (c)-5 + (b)-10.

**Union WALK (state × row, both directions):**

| State | Rows consumed |
|---|---|
| S1 | (a)1,2,3,4 · (b)2@θ0,8,9,11,14 · (c)1,4 |
| S2 | (a)1,2,3,4 · (b)2,3,9,11,13,14 · (c)6 |
| S3 | (a)1,2,3,4 · (b)2,4,5,7,**10(gap 0)**,9,11 · (c)3(branch priority),**5** |
| S4 | (a)1(frictionless),2,3,4 · (b)3,9,11,14 · (c)6 |
| S5 | (a)1(frictionless),2,3,4 · (b)3,5,9,11,14 · (c)2,6 |
| S6 | (a)1,2,3,4 · (b)3,9,11,14 · (c)6 · A2 |
| S7 | (a)1,2,3,4 · (b)2,3,4,5,9,11 · (c)2,3 · A2 |
| S8 | (a)1,2,3,4 · (b)2,3,5,8,9 · (c)1,2,3,4,6,7 · A4 |

Reverse: every (a), consumed-(b), and (c) row is claimed by ≥1 state; every state claims ≥1 row. Both directions closed. Nothing else: no energy bars, no graph panel, no new meshes, no RHR hand, no finish lines (#12-only), **no choreography layer beyond the single activation field**. If the surgeon finds any FURTHER capability needed, that is the alarm rule firing — STOP and re-scope with the survey.

**`engine_queue` mapping (numbering per Checkpoint A):** E9 `activate_at_ms` (narrow — blocking) · E10 `lane_gap_m = 0`/single-lane (blocking; the (b)-10 consumption) · E11 velocity channel + zero marker (blocking; supersedes routing velocities through E5's force channel — E5 itself unaffected) · E12 marks-own-primitive (blocking) · E13 ω re-seed + trail break (ride-along) · E14 visible-elements registration (ride-along) · E1 state-local clock (**`peter_parker:renderer_primitives` → pcpl-surgeon**, blocking, shared).

---

**Files referenced (absolute):**
- `docs/loop_runs/rotmech/pure_rolling/founder_proxy_A.md` (the fix list this revision answers)
- `docs/loop_runs/rotmech/pure_rolling/skeleton_rev1.md` (REV 1, preserved)
- `docs/loop_runs/rotmech/rolling_on_incline/skeleton.md` (sibling; shared items cited by its (b)/U numbering)
- `docs/loop_runs/rotmech/rolling_on_incline/founder_proxy_A_cycle2.md` (shared rulings: glow channel, back-compat clause, finish semantics)
- `src/lib/renderers/field_3d_renderer.ts` (all verification line numbers as corrected in the header)
- `src/scripts/query_engine_bug_queue.ts` (line 23 — the `--field3d` list gap, again not used as coverage)
