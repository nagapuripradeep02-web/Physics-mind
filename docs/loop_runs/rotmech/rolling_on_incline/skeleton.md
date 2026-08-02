# SKELETON — `rolling_on_incline` (chapter `rotmech`, Class 11 Ch.7 — Systems of Particles & Rotational Motion) — REV 4 (fix cycle 2 response — FINAL cycle)

> ⚠️ **HOLD (orchestrating session, 2026-08-02, after this document was authored):** `pure_rolling`'s Checkpoint A (cycle 1) proved that **`newtons_laws_body` has no per-body activation time** (visibility is set once per state apply, `:44766–44771`; `phases[]` drives only `glow_focal`, and `eng.phase_action` is written and never read) and that **lane z derives from a state's DECLARED body list, not co-presence** (`nlbBodyLaneZ`, `:39992–40001`). S3's two-phase block/disc schedule and S6's held-then-released disc below are authored against a mechanism that does not exist. This document is **NOT submitted for cycle-2 verification** pending the founder ruling on *phases-within-a-state vs separate states* — see `../pure_rolling/founder_proxy_A.md` §"What the 0c-2 union now totals". Everything else in REV 4 stands.

> **Phase-0 role:** 0b spec driver for build **0c-2** (bounded rotational extension to `newtons_laws_body`). founder-proxy Checkpoint A: REV 2 → `DESIGN_FIX` (`founder_proxy_A.md`), REV 3 → `DESIGN_FIX` (`founder_proxy_A_cycle2.md`, all seventeen cycle-1 fixes verified landed). This is the cycle-2 revision — the last permitted. REV 3 preserved at `skeleton_rev3.md`.
> Survey: `docs/loop_runs/rotmech/phase0_survey.md`. Concept #12 of 14, ★ Diamond, V1. Sibling: `pure_rolling` (#11, REV 1 skeleton EXISTS — `docs/loop_runs/rotmech/pure_rolling/skeleton.md`), so the 0c-2 union is now measured over BOTH consumers; REV 3's P2-5 one-of-two limit is RESOLVED, and its recommendation (author #11 before dispatch) is satisfied.
> **FOUNDER RULING 1 (2026-08-02, binding):** the survey's 0c-2 row amendment is SIGNED-in-principle — the union is enumerated honestly and completely below (closing build sheet), not shrunk. **FOUNDER RULING 2 (2026-08-02, binding):** P1-B resolves by option (iii) — `arrow_scale`/`min_len` become authorable per-concept fields defaulting to today's `0.048`/`0.55` (`:39661–39662`), engine item **E5, blocking**; the authored values below bind BOTH rolling concepts.
> **Routing correction (carried):** `field3d_nlb_physics_clock_not_state_local` is owned `peter_parker:renderer_primitives` → dispatches the **pcpl-surgeon** agent (2026-07-31 rename table), NOT field3d-surgeon. E1 must be dispatched on that tag.

## FIX-CYCLE-2 RESPONSE (finding × what changed × where it now reads)

| Finding | What changed | Where |
|---|---|---|
| **P1-A(1)** finish semantics | Authored explicitly: **per-body HALT-AND-LATCH at its own CoM crossing of `s_finish`** — the body halts AT the line (position pinned to `s_finish`, v→0, a→0), and its compared readouts + chips LATCH at the crossing-interpolated values. One mechanism, both sub-needs: S1's lineup and S5's honest split. S5's held frame now reads sphere `7.0 / 2.8` beside ring `4.9 / 4.9` — the 14.0 J frame is impossible by construction | §3 finish-semantics ¶; S1/S2/S5/S6/S7 rows; (b)-16 |
| **P1-A(2)** checkpoints enum diff | `checkpoints.capture` (`:1494–1500`) diffed: closed, lacks `KE_trans`/`KE_rot`; stamps target the ONE formula surface (`:1487`) which S1/S5 don't author; `NLB_CP_MAX = 3` (`:43547`) < 4 bodies; `eng.energy_active` coupling (`:42747`). Decision: F9/finish **reuses the crossing interpolator, bypasses the stamp rendering** — reasons with line numbers stated | §3 finish-semantics ¶; (b)-16 with the four line-numbered reasons |
| **P1-A(3)** S8 per-body wrap | S8 stays `mode:'sandbox'` but the build adds a **synchronised all-body race restart** ((b)-17/E4): all four re-anchor to the start line together each lap; Rule 37 free-run preserved; DoD (j)(2)'s marble-vs-ring demo now achievable | §3 S8 row; (b)-17; DoD (j)(2) |
| **P1-A(4)** loop_reset re-derivation | Full timing table re-derived against halted geometry for ALL EIGHT states (S2/S3/S6 added per P1-D): S1 R 4000/pin 2400 (315 ms after ring's crossing — a finished race, not a heap); S4 3500/2100; S5 4500/2700 (photographs the latched splits); S7 4000/2400 | §3 timing table |
| **P1-B / RULING 2** arrow map | Option (iii) taken: authored **`arrow_scale = 0.30` wu/N, `min_len = 0.25` wu** for BOTH rolling concepts (defaults preserved fleet-wide). Three S6 lengths tabled at m = 1 kg: 1.243 / 2.665 / 0.414 wu — all UNCLAMPED, smallest = 1.66× floor (> the scar row's 1.5×), largest < MAX 2.80; true ratios 6.43:1 and 3.00:1 rendered exactly. #11's `f_k 1.96 N` → 0.588 wu (2.35× floor); `f 0.00 N` ≤ `NLB_ARROW_EPS = 0.05` → arrow HIDES (`:39664–39665`, honest zero; the readout carries it). S6's θ slider narrowed to 20°–40° so no arrow clamps anywhere in the drag range; S3's near-equal f_k/f_s lengths declared honest-by-physics | §3 arrow-map ¶ + table; S6 row; min_ring table; (b)-18/E5 |
| **P1-C** glow ruling | Per-state glow **channel table** added. S4 and S5 author **NO state-level `glow_focal`** — emphasis runs on `phases[].glow_focal` (`nlbRunPhases`, `:45296–45310`), named explicitly, windowed with hand-back; `nlb_body_label` brighten-only removal is a named blocking precondition for S4 (E6); the pending-founder SET_GLOW row explicitly NOT chased (nlb's phases channel is independent of SET_GLOW). Joint with #11 (its sequenced-arrow states use the same channel) | §3 glow table; (b)-14 precondition note; E6 |
| **P1-D** S2/S3/S6 timing | All three added to the timing table with sub-beat schedules. **S3:** A 0–1200 skid / 1200–1500 hold+dissolve / B release 1500; R = 3200 ⇒ pin 1920 = **420 ms after the rolling half begins** (≥167 ✓), loop ends with the disc mid-track at s = −1.59 (no clamp). **S2:** "rolls slowly"/"visible pause" claims DELETED; recap re-authored on a disc of **R = 0.25 m — matching #11's wheel radius** so the recap picture IS #11's picture, now inclined; 1.27 revolutions, one cusp (754 ms), halt-latch at 1204 ms; evidence = trace-cusp shape + `contact 0.00` + latched equal readouts (the slow dwell payoff belongs to #11 S3 and is not re-claimed here). **S6:** arrows 0/450/900–1350, formula 1350–2500, release 2500 (54.3% R), pin 2760 (a-match live, margin 260 ms), finish halt 4305 | §3 S2/S3/S6 rows + timing table |
| **P1-E** back-compat clause | One clause, cross-cutting ((b)-19): **every field 0c-2 adds to the shared scenario is OPTIONAL; absent ⇒ today's constant/behaviour byte-identically** — covering `radius_m`, `lane_gap_m` + assignment, `arrow_scale`, `min_len`, `finish_line`, `race_restart`, `omega0_rad_s`, all mode additions. Acceptance: THE EYE **zero-pixel diff** on `rolling_friction` (`shape:'wheel'` path) and `work_done_by_constant_force` (two-body lane compare) | (b)-19; every affected build row cross-references it |
| **P2-1** scar sweep | Hand-list replaced by the eleven-concept sweep (`grep -rl "newtons_laws_body" src/data/concepts/*.json` — 11 ids, run live this cycle) + per-id queue queries; the five named OPEN rows dispositioned, plus **four further OPEN rows the sweep surfaced that REV 3 never held**: `field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus`, `field3d_sprite_label_text_and_ink_box_are_invisible_to_every_dom_probe`, `nlb_friction_vector_first_frame_reveal_tint_bypasses_seam_q_ink_fix`, plus the arrow-floor row now closed by E5 | SCAR AUDIT (rebuilt) |
| **P2-2** radius clause | `one_line_fix` now answers BOTH: "…and making the body bigger raises the turning push and the turning resistance by the same amount, so R drops out the same way — only the shape factor k survives." Still formula-free (core state), Rule-41 literal | §4 row 2 |
| **P2-3** framing worst case | Estimates re-quoted at **t = 0** (the far end — the worst case for an approaching race, and the probe's first sample): s ≈ 187 px/m; S1 clearance ≈ 66 px, S4 ≈ 109 px. Criterion stated: disjoint at t = 0 and every 100 ms sample | §3 framing plan |
| **P2-4** frame-fit bound | 6 sin ψ restated as a conservative UPPER BOUND (omits the cos 25° compression; true horizontal along-track extent 5.44 m ⇒ smaller) — a bound, not a value | §3 framing plan |
| **P2-5** union scope | SUPERSEDED by Ruling 1 + #11's skeleton: union now enumerated over both consumers; #11's (c)-1…4 and A1–A5 incorporated; the survey amendment is the closing build sheet | Closing build sheet |
| **P3-1** invisible wall | Every translating state now ends at an authored finish halt (S1/S2/S4/S5/S6/S7), a synchronised restart (S8), or mid-track (S3, clearance 1.41 m) — **the bound clamp (`:45582–45591`) is never the on-screen stop in any state**; the FIXED `nlb_uncoupled_readouts_flip_to_static_on_bound_halt` principle (a geometric stop never upgrades friction TYPE) is carried into the halt spec for S7 | §3 finish-semantics ¶; timing table |
| **P3-2** S1 title | Retitled to state a result: **"Four shapes, one finish order"** (first words carry the meaning; Rule 41d) | §2 table |
| **#11 A1** | AGREE — (b)-2 now states θ = 0 as a first-class case (a = 0, f_s = 0 at level constant-v) with a surgeon test duty | (b)-2 |
| **#11 A2** | AGREE — (b)-3 amended: point-speed arrows **computed from live (v, ω) as v ± ωR and v**, never hardcoded 0/v/2v; the hardcoded version would render #11's S5/S6 falsely and adds nothing here | (b)-3 |
| **#11 A3** | AGREE — F8 amended: every non-wheel mesh carries a **rotation marker** (contrasting meridian stripe on solid/hollow spheres, radial face-stripe on the disc, one contrasting arc segment on the ring) — without it S4's "spins 3× faster" payoff is invisible on a uniform sphere. Markers are geometry, not emphasis (Rule 29 untouched) | F8 |
| **#11 A4** | AGREE — trail/trace wrap discipline adopted: skid trails and rim traces break at every finish halt, loop reset and synchronised restart; the teleport segment is never drawn. Applies to S2/S3/S7/S8 | (b)-3 constraint; S8 row |
| **#11 A5** | AGREE/NOTED — config shape must express up to THREE sequential phase bodies in one state (#11 S5 sets the max; my S3 needs two on the same mechanism). Declared as a config-contract shape requirement | Build sheet, shape note |
| Proxy's 5-item additions list | 1→(b)-16/E3 · 2→(b)-17/E4 · 3→(b)-18/E5 (Ruling 2) · 4→E6 precondition · 5→(b)-19 — all carried | Build sheet |

**Engine bug queue consultation (REV 4 — provenance stated):** the **eleven-concept sweep ran live this cycle** — `grep -rl "newtons_laws_body" src/data/concepts/*.json` → `block_on_incline, connected_bodies, free_body_diagram, friction_force, newton_first_law, newton_second_law, newton_third_law, normal_force, rolling_friction, tension_force, work_done_by_constant_force` — followed by `query_engine_bug_queue.ts <id>` per id (11 queries, full row text read). `--owner alex:architect` (32 rows) and `--row-type directive` (47 rows) carry from REV 3 (same date); the scenario-scoped rows not tagged to any of the eleven ids (clock, occlusion, camera target, glow-relation, per-body-wrap) carry from REV 3's direct SELECT **as re-verified live by Checkpoint A cycle 2 (2026-08-02)**. Renderer citations re-read in code this session: arrow map `:39661–39665` + clamp `:40602–40607`; `checkpoints` `:1484–1502`; `NLB_CP_MAX = 3` `:43547`; per-body wrap `:45568–45581`; bound clamp + friction-type-latch comment `:45582–45594`. All rolling motions remain tier **[NEEDS-SCENARIO]**.

## 1. Atomic claim

This concept teaches that a body rolling without slipping down an incline accelerates at a rate set ONLY by the dimensionless shape factor k = I/mR² — so four shapes released together always finish in the fixed order solid sphere, disc, hollow sphere, ring, regardless of mass or radius. It does NOT teach the rolling constraint itself or contact-point kinematics in depth (`pure_rolling` #11, which precedes it; here one compact recap beat), and it does NOT teach rotational kinetic energy as a topic (`rotational_work_energy`); the energy split appears only as the extended-ring explanation of the race.

## 2. State count + arc

**8 states** (complex — 7–9 band). Rings: core S1–S4, extended S5, advanced S6–S7 (contiguous, immediately before explore), explore S8.

| State | Title (Rule 41 — literal, rail-truncation-safe) | Purpose | teaching_method | depth_ring |
|---|---|---|---|---|
| STATE_1 | **Four shapes, one finish order** (P3-2 — states the result) | Hook — four bodies released together finish in a fixed order, every time | straightforward beat | core |
| STATE_2 | Rolling links v and ω | Recap of #11: v = Rω on screen — cycloid cusp + equal readouts, on #11's own wheel radius | straightforward beat | core |
| STATE_3 | The friction is static | RM-G7 kill: contact speed 0.00 ⇒ static, not kinetic — SEQUENTIAL contrast with a skidding block | straightforward beat (16a) | core |
| STATE_4 | Mass and radius cancel | Second kill: a heavy large sphere and a light small sphere TIE — only k = I/mR² matters | straightforward beat (16a) | core |
| STATE_5 | The same energy, split two ways | WHY (AP/IB/NCERT route): same drop = same total KE; the ring puts more into spinning | straightforward beat | extended |
| STATE_6 | One formula ranks all four | a = g sin θ/(1 + I/mR²) built from the CoM equations | derivation_first_principles | advanced |
| STATE_7 | Low friction: rolling becomes slipping | Regime switch: μ_s below (k/(1+k))·tan θ → contact slides, friction flips kinetic | straightforward beat | advanced |
| STATE_8 | Try every variable | Sandbox — controls per `min_ring`, core-ring readouts only; synchronised race restart | exploration_sliders | explore |

The hook MOVES (S1 is the race itself). No `narrative_socratic`, no `wait_for_answer`, no `pause_after_ms`.

## 3. Per-state choreography + control plan (Rule 31 control table)

**FINISH-LINE SEMANTICS (P1-A — the concept-wide rule, stated once and consumed everywhere):** any state may author a `finish_line` at a track coordinate `s_finish`. When a body's **CoM track coordinate crosses `s_finish`** (crossing-interpolated — the FIXED `nlb_checkpoint_capture_overshoots_exact_crossing_value` machinery, `:44240–44262`), that body **HALTS at the line** (position pinned to `s_finish`, v → 0, a → 0) **and its compared readouts, chips and labels LATCH at their crossing-instant values** and hold to state end. The halt is a FINISH, not a wall: the friction TYPE and every label latch as they were at crossing, never re-derived at rest (the FIXED `nlb_uncoupled_readouts_flip_to_static_on_bound_halt` principle, comment at `:45584–45590`, applied to the new mechanism — S7's ring holds `f_k`). Trails and traces break at the halt and at every reset (A4). Consequence checked per state below: **no state ever reaches the track-bound clamp (`:45582–45591`) on screen** (P3-1). Mechanism = (b)-16/E3; its relationship to `checkpoints` is specified there with line numbers.

**ARROW MAP (RULING 2 — authored per-concept, binding both rolling concepts):** authored **`arrow_scale = 0.30` wu/N · `min_len = 0.25` wu** (defaults `0.048`/`0.55` preserved fleet-wide when absent — (b)-19). `NLB_ARROW_MAX_LEN = 2.80` and `NLB_ARROW_EPS = 0.05 N` unchanged (`:39663–39665`). Rendered lengths at the authored poses:

| State | Arrow | F (N) | Rendered L (wu) | Clamp? |
|---|---|---|---|---|
| S6 (disc, m = 1 kg, θ = 25°) | mg sin θ | 4.1417 | **1.243** | no |
| S6 | N = mg cos θ | 8.8818 | **2.665** | no (< 2.80, margin 0.135) |
| S6 | f_s = k·mg sin θ/(1+k) | 1.3806 | **0.414** | no — **1.66× the 0.25 floor** (> the scar row's 1.5× margin) |
| S3 | f_k = μ_k·mg cos θ | 1.3323 | 0.400 | no |
| S3 | f_s (rolling half) | 1.3806 | 0.414 | no |
| #11 S4 | f_k | 1.96 | 0.588 (2.35× floor) | no |
| #11 S4 | f (roller) | 0.00 | **arrow HIDES** (≤ EPS `:39664–39665`) | honest zero; readout `f 0.00 N` carries it |

True ratios rendered exactly: N : f_s = **6.43 : 1**, mg sin θ : f_s = **3.00 : 1** — no clamp anywhere. **Drag-range honesty:** S6's θ slider is authored **20°–40°** (narrowed from an unstated range; S8's θ row matches, see min_ring) — across that whole range no S6 arrow clamps (at 20°: N = 2.763 ≤ 2.80, f_s = 0.335 > 0.25; at 40°: N = 2.252, f_s = 0.630); the 1.5× margin is guaranteed at the authored pose (25°), and the floor never engages in-range. **S3's f_k (1.33 N) and f_s (1.38 N) render at near-equal length because the forces ARE near-equal — declared honest: S3's taught contrast is the friction TYPE (label, trail, contact readout), never a length ratio.** The same authored values serve #11 (its only non-hidden friction arrow, f_k = 1.96 N, clears at 2.35×), so the two concepts agree on apparatus scale — Rule 32d across the chapter. This closes `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` (MAJOR/OPEN) for both concepts. Engine item **(b)-18/E5, blocking**.

*(Orchestrating-session note: `pure_rolling`'s Checkpoint A widened this to a **two-channel** map — a separate `velocity_scale`/`velocity_min_len` plus a defined zero-vector marker — because #11 draws VELOCITY arrows through the same clamp, where 2 : 1 : 0 collapses to 1 : 1 : nothing. The force channel below is unaffected; the velocity channel is an addition, not a correction.)*

| State | Teaches | Archetype | Distinct motion | Delta cue | Live controls | Words | Ring |
|---|---|---|---|---|---|---|---|
| S1 | Shape decides the finish order | `translate-through` | Four visibly different bodies (equal m = 1 kg, R = 0.15 m; rotation markers per F8/A3) roll from a common start line, released simultaneously, approaching the camera; they separate; **each body HALTS AT the finish line as its CoM crosses `s_finish = −2.1`** (crossings 1744 / 1805 / 1903 / 2085 ms) and its chip stamps 1-2-3-4 at the crossing; by 2085 ms the frame is a finish-line LINEUP — four halted bodies, four chips; loop resets, same order every time | "Four shapes, one ramp" | none | 40–50 (incl. ≤12-word anchor) | core |
| S2 | v = Rω in action (recap of #11) | `flow-along-path` | ONE recap disc at **R = 0.25 m — #11's own wheel radius, so this recap shows the SAME-scale picture the student already knows, now on the incline** (P1-D; distinct body id `nlb_disc_recap`, radius per (b)-9); released from rest, rolls 2.0 m (+2.4 → +0.4) in 1204 ms (1.27 revolutions — the cycloid draws one full arch); the marked rim dot's trace comes to a **cusp** at the ground touch (754 ms) while `contact 0.00 m/s` holds; **halt-latches at s = +0.4** with v and Rω readouts equal (3.32 = 3.32). No "rolls slowly" and no "pauses at each touch" claim — the dwell payoff is #11 S3's and is not re-claimed; S2's evidence is the trace's cusp SHAPE + the readouts | "v equals R ω" | none | 30–45 | core |
| S3 | The contact friction is STATIC | `null-result-hold` | **SEQUENTIAL, never co-present** (sub-beat schedule in the timing table): 0–1200 ms the locked block ALONE skids (μ_k = 0.15, a = 2.809 m/s², 2.02 m → s = +0.38) — contact slides, f_k label + arrow (0.400 wu), skid trail; 1200–1500 ms hold + DISSOLVE; from 1500 ms the rolling disc assembles at home and descends (μ_s = 0.50) — `contact 0.00`, f_s label + arrow, no trail; loop ends with the disc mid-track at s = −1.59 (1.41 m clear of the bound). Cues on the scenario_cue channel | "Contact point speed: zero" | none | 40–55 | core |
| S4 | Only k matters — mass and radius cancel | `translate-through` — declared contrast pair with S1 | A large heavy sphere (5 kg, R = 0.30) races a small light one (0.5 kg, R = 0.10), released simultaneously, approaching the camera; centres stay exactly abreast (centre markers, CoM tie metric — P1-8); **both halt at the line in the SAME frame (1745 ms) and both chips stamp "TIE" at the crossing**; the small sphere visibly spins 3× faster (per-body radius + rotation markers — (b)-9, A3); both k chips read 0.40; m₂/R₂ re-drag re-runs and it still ties | "Mass and radius cancel" | m₂, R₂ | 35–50 | core |
| S5 | WHY: the energy split | `cycle-compare` — count-up, arrive, HOLD | Solid sphere beside ring, same 1.00 m drop (d = 2.366 m): release → value-only readouts count up, DERIVED live (KE_trans = ½mv², KE_rot = ½k·mv²) → **the sphere halt-latches at ITS crossing (1265 ms): `KE_trans 7.0 J · KE_rot 2.8 J` — frozen at the line; the ring at 1512 ms: `4.9 J · 4.9 J`** → from 1512 ms the frame is the held side-by-side: both bodies AT the line, totals identical (mgh = 9.8 J), splits different, sphere's chip first. The 14.0 J frame is impossible: the sphere cannot run past its finish. NO energy bars — SEAM-M readouts only | "Same energy, different split" | none | 40–55 | extended |
| S6 | a = g sin θ/(1 + I/mR²) | `reveal-build` | Disc HELD at home (v₀ = 0 + release cue, never `fixed`); arrows draw in sequence — mg sin θ (450 ms), N (900), f_s (1350) — at the Ruling-2 lengths tabled above; the surface builds f·R = I_cm·α → f = k·m·a → a = g sin θ/(1+k) (1350–2500 ms, CoM route, f_s arrow consumed, no parallel-axis); **release at 2500 ms** — live a readout 2.76 matches the formula; **finish halt at 4305 ms**. θ slider **20°–40°** (arrow-honest range, above) | "One formula ranks all" | θ (20°–40°) | 45–55 | advanced |
| S7 | The slipping condition | `regime-switch` (coined, REV 3 justification stands) | Ring rolls at μ_s = 0.50; authored `param_ramp` 0.50 → 0.05 over 600–1600 ms; crosses μ_min = 0.233 at ≈1193 ms (s ≈ +0.93) → contact jumps off zero, label flips f_s → f_k, skid trail, spin lags; skids 3.026 m at 3.698 m/s²; **halt-latches at the finish (≈1968 ms) holding the slip picture — `f_k` label LATCHED as-at-crossing (never upgraded to static at rest)** — until reset. μ_min tick rides the μ_s row | "Too little friction: slipping" | μ_s | 35–50 | advanced |
| S8 | Everything, teacher-driven | `drag-sandbox` | Teacher drives the ring-gated set; the four-body race re-runs live under a **SYNCHRONISED restart ((b)-17/E4): each lap ends when the LAST body crosses the finish; after a short hold ALL bodies re-anchor to the start line together and chips re-stamp — a start line and a finish order exist on every lap** (the per-body wrap at `:45569–45577` desynchronises permanently and is replaced for race states). Rule 37: the clock free-runs; the race loops forever. Trails/traces break at each restart (A4). Core-ring content only: v = Rω, contact, k chips, centre markers, finish chips | "All controls live" | see min_ring table | 0 / open | explore |

**S8 explore controls with `min_ring`:**

| Control | `min_ring` | Guided state that teaches it |
|---|---|---|
| shape (per lane) | core | S1, S4 |
| m (selected body) | core | S4 |
| R (selected body) | core | S4 |
| θ (**20°–40°** — matched to S6's arrow-honest range; nothing taught depended on <20°) | **advanced** | S6 |
| μ_s (0.05–1.00, μ_min tick riding the row) | **advanced** | S7 |

*Hide advanced* → shape + m + R ✓. *Hide advanced+extended* → same ✓. No control survives whose lesson is hidden.

**Slip envelope (P1-6, re-checked at the narrowed θ range):** μ_min = (k/(1+k))·tan θ. At 25°: 0.133 / 0.155 / 0.187 / 0.233 — authored μ_s = 0.50 clears every shape in every guided state. Full-product maximum: ring at 40° = **0.420** > the 0.05 floor — slip reachable in the full-preset sandbox by design, cue riding the row (unchanged; the θ floor moving 10°→20° only RAISES the low end's μ_min, changing nothing). Reduced presets (fixed θ = 25°, μ_s = 0.50): worst case 0.233 < 0.50 — provably slip-free.

**Per-state glow plan (P1-C — channel named per state; Rule 32e caps at one, it does not require one):**

| State | Channel | Emphasis |
|---|---|---|
| S1 | `phases[].glow_focal` (`nlbRunPhases`, `:45296–45310`) | each finish chip glows in a window at its body's crossing (1744/1805/1903/2085 ms), hand-back after |
| S2 | state-level | the rim dot |
| S3 | `phases[]` | phase A: the f_k readout · phase B: the contact readout (sequential halves — same pattern as #11's S4) |
| S4 | **NO state-level `glow_focal`** — a relation between two k chips | `phases[]`: chip A window → chip B window → hand-back (both full-bright for the tie run + TIE stamp; mass labels `m 5 kg`/`m 0.5 kg` visible but DIMMED as emphasis peers — **precondition E6**, `nlb_body_label` out of the brighten-only set) |
| S5 | **NO state-level `glow_focal`** — a relation between two KE pairs | `phases[]` during the hold: sphere pair window → ring pair window → hand-back (both pairs full-bright for the pinned frame at 2700 ms — the payoff frame carries NO dimmed half) |
| S6 | `phases[]` | each arrow as it draws → each formula line as it builds → the a readout at release |
| S7 | state-level | the friction label (one id; flips f_s → f_k at onset) |
| S8 | none | sandbox |

The pending-founder row `authored_state_glow_focal_silently_voids_every_tts_sentence_glow_in_that_state` is deliberately NOT chased (per Checkpoint A P1-C(c)): nlb's `phases[]` channel is independent of `SET_GLOW`. This ruling is joint with #11 — its sequenced states use the same channel the same way.

**Multi-body framing plan (P2-3/P2-4 amendments; REV 3 core preserved):** ψ ≡ camera-view-axis-vs-track-axis, authored ψ = 35°, elevation 22°; race approaches the camera (+s up-slope, `:45093–45096`), so **t = 0 is the far end and the worst case — and it is where the probe samples first**. Estimates now quoted at t = 0 (s ≈ 187 px/m ≈ 0.85× the 220 mid-run reference): S1 adjacent separation ≈ 0.8 × 187 × 0.819 ≈ **123 px** vs body diameter ≈ 56 px → clearance ≈ **66 px**; S4 separation ≈ 184 px vs half-width sum 75 px → clearance ≈ **109 px**. These are design estimates; **the acceptance criterion is bbox disjointness under the projection probe at t = 0 and every 100 ms sample**, gated by (b)-12 (`PM_NLB_LANE_OCCLUSION`). Frame-fit: "6 sin ψ + 2.4 cos ψ" is a conservative UPPER BOUND on required screen-x (it treats the along-track run as horizontal, omitting the cos 25° compression; the true horizontal extent is 5.44 m, so the actual need is smaller) — a bound, not a value (P2-4). Lanes: S1 `lane_gap_m` = 0.8, speed-ordered in the drift direction; S4/S5 = 1.2; S3 sequential single-body; S2/S6/S7 single body, camera closed on the contact (position AND target — (b)-13); **body meshes must also clear every DOM overlay rect under those close cameras** (`field3d_nlb_body_screen_anchor_lands_under_the_dom_slider_panel`, MAJOR/OPEN — a FRAMING-level acceptance added to (b)-13/(b)-14: assert body rects ∩ `nlbPanelRects()` = ∅, per the row's own probe). No release stagger.

**Home pose + track geometry (unchanged from REV 3 — verified independently by Checkpoint A):** `surface.length_m = 3.0` (half-length, `:941`; readers `:40060–40067`/`:44176`) → 6.0 m plank, s ∈ [−3.0, +3.0]; θ default 25°; home pose `initial_position_m = +2.4` every state; `s_finish = −2.1` (S1/S4/S6/S7/S8), `+0.034` (S5), `+0.4` (S2); all crossings on the CoM track coordinate.

**Loop-reset / frozen-pin timing (P1-A(4) + P1-D — ALL EIGHT states, derived against the halted geometry; g sin θ = 4.1417; a = 2.958 / 2.761 / 2.485 / 2.071; json_author re-verifies at h = 1/60; the table is CONDITIONAL on the state-local clock, (b)-11/E1):**

| State | R (ms) | Sub-beats / last asserted event | Event time (% R) | Pin 0.60R | What the pin photographs · margin |
|---|---|---|---|---|---|
| S1 | 4000 | crossings + chip stamps 1744 / 1805 / 1903 / 2085; all four HALTED at the line from 2085 | 2085 (52.1%) ✓ | 2400 | the finished race: four bodies AT the line, chips 1-2-3-4 · 315 ms ✓; hold 1915 ms (48%) — a lineup, never a heap |
| S2 | 3000 | cusp 754; halt-latch at s = +0.4 at 1204 (v = Rω = 3.32 latched) | 1204 (40.1%) ✓ | 1800 | full one-arch cycloid + cusp + equal latched readouts · 596 ms ✓ |
| S3 | 3200 | **A: skid 0–1200 (block → s = +0.38) · hold+dissolve 1200–1500 · B: disc releases 1500** | 1500 (46.9%) ✓ | 1920 | the ROLLING half — disc descending (s ≈ +2.16), `contact 0.00` + f_s, **no block, no trail** · **420 ms after the rolling half begins ✓ (≥167)**; loop ends disc mid-track s = −1.59, 1.41 m clear — no clamp |
| S4 | 3500 | tie crossing + double-TIE stamp + halt 1745 | 1745 (49.9%) ✓ | 2100 | both bodies halted abreast at the line, TIE chips · 355 ms ✓ |
| S5 | 4500 | sphere halt-latch 1265 (7.0/2.8); ring 1512 (4.9/4.9); held side-by-side from 1512 | 1512 (33.6%) ✓ | 2700 | the held split: 7.0/2.8 beside 4.9/4.9, both at the line · 1188 ms ✓ — **the frame the state exists for** |
| S6 | 4600 | arrows 450/900/1350 · formula 1350–2500 · **release 2500** (live a = 2.76 matches); finish halt 4305 (housekeeping, declared) | 2500 (54.3%) ✓ | 2760 | disc just released and rolling, full formula + arrows + matching a readout · 260 ms after release ✓ |
| S7 | 4000 | slip onset 1193 (29.8%); halt-latch at finish 1968 (49.2%) holding the slip picture, f_k latched | 1968 (49.2%) ✓ | 2400 | the held slip picture · 432 ms ✓ |
| S8 | — | free-run sandbox; synchronised restart each lap (Rule 37) | — | — | — |

**Rule 32 legibility:** unchanged from REV 3 (cause before effect; one taught variable per state; union-built body set with distinct ids — `nlb_block`, `nlb_disc_recap` etc.; home pose persists; the glow table above supplies the single-focal-per-instant discipline).

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots)

| Wrong belief | Source | At | `misconception_watch` beat |
|---|---|---|---|
| "Rolling friction is kinetic friction" | RM-G7 | STATE_3 | `belief`: the contact scrubs like a sliding block. `visual_counter`: the skidding locked block (f_k + trail) FIRST and ALONE, dissolving before the rolling disc assembles. `one_line_fix`: the contact point is instantaneously at rest, so the friction is static; kinetic appears only when the body slips (S7 closes the loop). Named primitives: `rotation_locked` + skid trail + f_k label/arrow |
| "The heavier (or bigger) body wins" | PER + catalog | STATE_4 | `belief`: 5 kg beats 0.5 kg downhill. `visual_counter`: centre markers exactly abreast for the full descent — a dead tie, double-stamped "TIE", re-runnable at any m₂/R₂. `one_line_fix` (**P2-2 — mass AND radius, ring-safe, formula-free**): "doubling the mass doubles both the pull down the slope and the resistance to speeding up, and making the body bigger raises the turning push and the turning resistance by the same amount — so mass and radius both drop out, and only the shape factor k survives." (The formula appears first in S6, advanced.) |

No other state carries a `misconception_watch`. EPIC-C branches: ZERO.

## 5. `has_prebuilt_deep_dive` states

- **STATE_4** — the PRIMARY aha and the stickiest point. — **STATE_6** — the derivation; home of the ALTERNATIVE contact-point route (parallel-axis lives there, not the main state). All others un-flagged (Rule 18).

## 6. Drill-down clusters

**STATE_4:** `why_mass_cancels` · `shape_factor_table` · `same_shape_always_ties`. **STATE_6:** `torque_about_contact_point` · `why_one_plus_k` · `rolling_vs_frictionless_slider`.

## 7. `entry_state_map`

```
entry_state_map:
  foundational: STATE_1 → STATE_4
  energy:       STATE_5
  derivation:   STATE_6 → STATE_7
```
Default `foundational`. Cross-slice pill: "See WHY the sphere wins? (energy)" → STATE_5. PRIMARY aha (S4) inside foundational ✓.

## 8. Prerequisites (advisory, Rule 23)

`pure_rolling` (#11 — S2 is its compact recap, now at its own wheel radius) · `moment_of_inertia` (#6 — S4's cliff) · `tau_eq_i_alpha` (#7 — S6's cliff) · `friction_force` (SHIPPED, same scenario) · `rotational_work_energy` (#8 — advisory for S5). Namespace check: no collision (unchanged).

## 9. Real-world anchor (Rule 35 / 38f — unchanged from REV 3, verified clean by Checkpoint A)

**Primary (STATE_1, ≤12 words):** *"Try it at home: a food can beats a roll of tape."* **Secondary (S8 opening caption option):** a bicycle wheel on a sloped path (38f — and now the SAME device as #11's primary anchor, deliberate cross-concept continuity). **DC Pandey check:** chapter table of contents only; nothing imported. NCERT §7.14 noted (energy route → S5 ringed extended).

## 10. Definition of Done (Gate 0 — no TBDs)

**(a) States:** the 8 of §2, exactly as tabled in §3 — including the finish-semantics rule, the authored arrow map, the glow channel table, and the eight-state timing table.

**(b) Symbol-label table:** as REV 3, with these amendments: **Finish chips** row now reads "`1` `2` `3` `4` and `TIE` — stamped crossing-interpolated at the body's own CoM crossing; body halts at the line; chip and readouts latch"; **NEW row — Rotation markers (A3):** contrasting meridian stripe (solid + hollow sphere), radial face-stripe (disc), one contrasting arc segment (ring) — geometry, not emphasis (Rule 29 untouched); **Energy readouts (S5)** row now reads "count up live, LATCH at the body's own crossing"; **S6 formula surface** unchanged (pixel-verified at the longest line, (b)-14). All Unicode across all three text paths (Rule 34c).

**(b′) Term-introduction ledger:** unchanged from REV 3 (S2's recap disc introduces nothing new — v, ω, R, v = Rω all defined there as before; k chips still first render in S4).

**(c) RHR plan:** N/A — declared deliberately (unchanged).

**(d) Motion plan:** per §3; nothing static, nothing asserted-but-unrendered. Spin driven by position through the body's OWN `radius_m`; **rotation legible on every mesh via the A3 markers**; halts are finishes with latched labels, never re-derived rest states. Every archetype discharged by the authored beat with zero teacher input.

**(e) Modes:** 0c-2 adds `rolling_race`, `rolling_contact`, `rolling_friction_contrast`, `rolling_energy_split`, `rolling_derive`, `rolling_slip`, reusing `sandbox` (+ the S8 `race_restart: 'synchronized'` flag, (b)-17). deriveStateMeta co-edit at all three sites (F10).

**(f)** `assessment` + `coverage_map`: unchanged span; `misconception_watch` = exactly §4's two beats.

**(g) Macro↔micro (Rule 33):** unchanged — every readout metric-defined (contact = |v − ωR|; KE_trans = ½mv²; KE_rot = ½k·mv²; latched values = the crossing-interpolated metrics); document numbers are CHECK values.

**(h) Canvas budget (Rule 34):** unchanged (S2 `v = Rω`; S5 none — its latched pairs are SEAM-M readouts, not a formula surface, which is exactly why (b)-16 routes finish stamps to body rows rather than the formula surface; S6 the formula; S7 the μ_min inequality; S1/S3/S4/S8 none).

**(i) Curriculum-flex (Rule 38):** (i-1)–(i-5) unchanged from REV 3, re-checked against the REV 4 deltas: the narrowed θ range (20°–40°) appears only in advanced-ring rows so both cuts are unaffected; the finish-halt rule is ring-neutral apparatus behaviour; S8 still surfaces core content only.

**(j) Teacher-walk answers:** (1) unchanged. (2) Re-run S4 at the extremes — all tie; **then S8 pit a marble against a huge ring — NOW ACHIEVABLE: the synchronised restart gives every lap a start line and a finish order ((b)-17/E4)**. (3) Ledger (b′); declared omissions unchanged — decisions, not exemptions.

---

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

1. **Prerequisite cliff.** Unchanged from REV 3, one amendment: the `pure_rolling` → S2 patch now explicitly rides the SAME wheel radius as #11 (R = 0.25 m), so the recap is visually the remembered object.
2. **JEE-backwards trace.** Unchanged (verified complete by Checkpoint A cycle 1): constraint → S2; KE split → S5; formula → S6; k per shape → S4 + S1; μ_min → S7; friction-static legitimises the energy route → S3.
3. **Misconception entry mapping.** Unchanged: RM-G7 → S3 (S1 phrased friction-neutrally); heavier-wins → S4 (S1 shows four EQUAL m, R bodies).

### Block 2 — Aha-moment designation

Unchanged from REV 3 (verified by Checkpoint A): PRIMARY at S4 (mass and radius cancel — only shape decides), SUPPORTING at S3 (rolling friction is static), wrong-belief setups S1/S2 and S1 respectively, S4 ∈ foundational ✓. The finish-semantics fix strengthens the primary: the TIE is now stamped at a latched, crossing-exact instant, so the payoff frame is arithmetically honest.

---

## SCAR AUDIT (P2-1 — rebuilt on the eleven-concept sweep)

**Queries (provenance stated):** ① `grep -rl "newtons_laws_body" src/data/concepts/*.json` → the eleven ids (listed in the header) — **run live this cycle**; ② `query_engine_bug_queue.ts <id>` for EACH of the eleven — **run live this cycle**, all returned rows read in full; ③ `--owner alex:architect` (32) + `--row-type directive` (47) — carried from REV 3 (same date); ④ direct read-only SELECT for scenario-scoped rows not tagged to any of the eleven ids — carried from REV 3 as re-verified live by Checkpoint A cycle 2 (2026-08-02); ⑤ `rolling_on_incline` → 0 rows (new id). `--field3d --open` NOT used as coverage (script line 23's list contains zero nlb ids — the recorded root cause). A row not reached by ①–④ is not dispositioned.

**OPEN rows returned by the live sweep — dispositions (including the four REV 3 never held):**

| bug_class (status/owner) | Verdict |
|---|---|
| `nlb_body_label_is_brighten_only_so_static_text_outranks_the_state_focal` (MAJOR/OPEN, field3d_surgeon) | **build precondition E6, blocking for S4** — labels become emphasis peers and dim; §3 glow table depends on it |
| `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` (MAJOR/OPEN, alex:physics_author) | **CLOSED for this design by Ruling 2 / (b)-18** — the arrow table shows every compared arrow unclamped with ≥1.5× floor margin at the authored pose and across the whole S6 drag range; note the row's DO quotes a stale `NLB_ARROW_SCALE = 0.030` — current code is 0.048 (`:39661`), applied here |
| `field3d_nlb_body_screen_anchor_lands_under_the_dom_slider_panel` (MAJOR/OPEN, field3d_surgeon) | **applied** — S2/S6/S7's close cameras get the row's own acceptance: body mesh rects ∩ `nlbPanelRects()` = ∅ under every authored camera; a clamped label dodge = wrong anchor, fixed at framing level ((b)-13/(b)-14) |
| `frozen_frame_read_as_dense_series_continuation_on_translating_body` (MODERATE/OPEN, ambiguous) | **routed to eye_walker/quality_auditor as a READING directive** — all 8 states translate; frozen = the state re-entered and pinned at maxRevealMs, compared only against the dense frame at that time; carried into the DoD for downstream honesty |
| `field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus` (DIRECTIVE/OPEN, renderer_primitives) | **surgeon duty, ride-along** — the new rolling MODES must force apparatus visible inside the per-scenario apply, and the bring-up probe asserts apparatus EXISTENCE + visibility (mesh count > 0 ∧ visible), never just dynamics — added to E8 |
| `field3d_sprite_label_text_and_ink_box_are_invisible_to_every_dom_probe` (MODERATE/OPEN, field3d_surgeon) | **applied to (b)-14** — every label-decollision acceptance in this design must use the row's projection probe (sprite `_pmText` + measureText ink rects), never a DOM probe; added to E8 |
| `nlb_friction_vector_first_frame_reveal_tint_bypasses_seam_q_ink_fix` (MODERATE/OPEN, field3d_surgeon) | **surgeon duty, ride-along (E8)** — S3/S6/S7 draw friction arrows; their t = 0 reveal ink must clear the same contrast floor as the settled colour, per the row's probe |
| `nlb_multibody_lane_gap_is_along_z_so_a_head_on_camera_stacks_the_compared_bodies` (DIRECTIVE/OPEN, alex:architect) | **satisfied** — framing plan: ψ = 35°, approach-camera, t = 0 worst-case estimates, probe acceptance, (b)-12 gate |
| `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate` (DIRECTIVE/OPEN, alex:architect) | **satisfied** — every `s_finish` is a track coordinate on the corrected model |
| `field3d_param_ramp_authoring_contract` (DIRECTIVE/OPEN, field3d_surgeon) | **satisfied** — S7's ramp authored per contract (closed-form t_ms, thumb + label lockstep, `from` = authored value) |

**Scenario-scoped rows (query path ④):** `field3d_nlb_physics_clock_not_state_local` (CRITICAL/OPEN) → **(b)-11/E1, precondition of the entire timing table — owner `peter_parker:renderer_primitives` → pcpl-surgeon** (routing correction; note `RESET_TRAJECTORY` exists `:45002–45018`, the gap is THE EYE's `SET_STATE` path) · `the_eye_passes_a_frame_in_which_one_compared_body_is_hidden_behind_another` (MAJOR/OPEN) → (b)-12/E2 · `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` (MAJOR/OPEN) → (b)-13 · `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` (MAJOR/OPEN, alex:json_author) → **applied**: S4/S5 author no state-level focal (§3 glow table) · `authored_state_glow_focal_silently_voids_every_tts_sentence_glow` (MAJOR/OPEN, FOUNDER PENDING) → **not chased**, phases channel independent · `nlb_multibody_sandbox_wrap_reanchors_only_the_wrapping_body` (MODERATE/OPEN) → **(b)-17/E4** (and E4 must re-anchor `_dsp0`/seeds for ALL bodies — the FIXED `nlb_sandbox_wrap_remaps_s_but_not_s0` lesson applied to the synchronised form).

**FIXED rows cited as design principles:** `nlb_checkpoint_capture_overshoots_exact_crossing_value` (crossing interpolation — reused by (b)-16) · `nlb_uncoupled_readouts_flip_to_static_on_bound_halt` (a geometric/finish stop never upgrades friction type — S7's latch spec) · `geometric_track_clamp_rendered_as_an_energy_change` (moot here: no state reaches the clamp, and no energy bars exist).

**All other REV 3 dispositions** (the corrected-verdict table, the N/A-with-reason set, the routed physics_author directives): **unchanged**, re-checked against the REV 4 deltas — the only geometry that moved is end-of-run behaviour, which every affected row above now covers.

---

# THE 0c-2 BUILD SHEET — as signed (Ruling 1: the survey's 0c-2 row amendment, enumerated honestly over BOTH consumers)

> Consumers: `rolling_on_incline` (#12, this document) + `pure_rolling` (#11, REV 1). No new `scenario_type`; everything below extends `newtons_laws_body`. **Cross-cutting clause (b)-19 governs every item:** every added config field is OPTIONAL; absent ⇒ today's constant/behaviour **byte-identically** — acceptance: THE EYE zero-pixel diff on `rolling_friction` (`shape:'wheel'` code path) and `work_done_by_constant_force` (two-body lane compare) against pre-build baselines. If the surgeon finds any FURTHER capability needed, that is the alarm rule firing — STOP and re-scope with the survey.

**The signed union (the ~9-item amendment of the survey's "shape factor · acceleration branch · N bodies racing" row):**

| # | Union item | Consumed by | Engine queue | Owner | Tag |
|---|---|---|---|---|---|
| U1 | **Rolling physics branch**: per-body k = I/mR² (2/5, 1/2, 2/3, 1); a = g sin θ/(1+k) with f_s = k·m·a; **θ = 0 first-class (A1**: a = 0, f_s = 0 at level constant-v — surgeon test duty); slip in BOTH directions — rolling→slipping past μ_min ((b)-5) AND slipping→rolling capture, closed-form in state-local t, never a per-frame latch (#11 (c)-3); independent ω integrator with `omega0_rad_s` authoring + `'omega0'` control token (#11 (c)-2); dt-fold exactness | #12 all states; #11 all states | E9 | field3d_surgeon | **blocking** |
| U2 | **Contact-point picture**: rim dot + cycloid trace + skid trail (replayable pure functions of state-local t; **wrap/halt/reset break discipline, A4**); point-speed arrows **computed from live (v, ω) as v ± ωR and v — never hardcoded 0/v/2v (A2)**; contact-speed readout; static/kinetic call-out ((b)-3/(b)-4) | #12 S2/S3/S7/S8; #11 S3/S5/S6/S7 | E10 | field3d_surgeon | **blocking** |
| U3 | **Per-body `radius_m`** [optional, default = today's `NLB_BODY_SIZE/2` lift `:40015` + `NLB_WHEEL_R` divisor `:40053`]: mesh scale, contact lift, spin ω = v/R, live re-lift under R/R₂ drag; Rule-29 ruling as stated in (b)-9 | both, every state | E7a | field3d_surgeon | **blocking** |
| U4 | **Rolling apparatus set**: four meshes `solid_sphere/disc/hollow_sphere/ring` (silhouette + colour distinctness, ≥60 px at reference scale) **each with a rotation marker (A3**: meridian stripe / face-stripe / arc segment — geometry, not emphasis); k chips; KE_trans/KE_rot as SEAM-M value-only readouts, count-up, **no SEAM-L change ever** ((b)-1/6, F8); bare-ω readout token (#11 (c)-4); revolution marks + live-respacing `2πR` bracket (#11 (c)-1); `controls_visible` token extension `R/R2/omega0/shape` ((b)-8, `:1340`) | #12 S1/S4/S5/S8; #11 S1/S2/S7 | E11 | field3d_surgeon | **blocking** |
| U5 | **Finish-line halt-and-latch ((b)-16)**: per-state `finish_line {s_m, bodies, halt, stamp}`; body halts AT `s_finish` on its own CoM crossing; readouts/chips/labels latch at crossing-interpolated values (reuses the `:44240–44262` interpolator); stamps render to **finish chips + per-body readout rows, NOT the formula surface**. Bypasses `checkpoints` rendering because: `capture` enum closed without `KE_trans/KE_rot` (`:1494–1500`); stamps target the ONE formula surface (`:1487`) which S1/S5 author none of; `NLB_CP_MAX = 3` (`:43547`) < 4 bodies; `checkpoint_state` flips `eng.energy_active` (`:42747`) against the founder's no-bars ruling. The existing enum is left untouched; `finish_line.stamp` is its own enum ⊇ {order, t, v, KE_trans, KE_rot}. Expectation: at t = 1512 ms in S5 the sphere reads 7.0/2.8. Friction type latches as-at-crossing (the FIXED bound-halt principle) | #12 S1/S2/S4/S5/S6/S7 | E3 | field3d_surgeon | **blocking** |
| U6 | **Synchronised all-body race restart ((b)-17)** for `mode:'sandbox'` race states (`race_restart:'synchronized'`): lap ends at the LAST body's crossing; hold; ALL bodies re-anchor to the start line together (including `_dsp0`/seeds for every body — the `nlb_sandbox_wrap_remaps_s_but_not_s0` lesson); chips re-stamp per lap; Rule 37 free-run preserved. The per-body wrap (`:45569–45577`) remains the default for non-race sandboxes ((b)-19) | #12 S8 | E4 | field3d_surgeon | **blocking** |
| U7 | **Authorable arrow map ((b)-18, RULING 2)**: per-concept `arrow_scale`/`min_len`, defaults **0.048/0.55** (`:39661–39662`), clamp site `:40602–40607`; authored 0.30/0.25 for both rolling concepts (table in §3) | #12 S3/S6; #11 S4 | E5 | field3d_surgeon | **blocking** |
| U8 | **Race framing surfaces**: authorable `lane_gap_m` + explicit speed-ordered lane assignment [optional, default `NLB_LANE_GAP = 0.85` `:39610`/`:39998–40001`] ((b)-10); `PM_NLB_LANE_OCCLUSION` → `manifest.warnings` ((b)-12); camera **target** authoring per state ((b)-13) + body-rect-vs-DOM-overlay acceptance | #12 S1/S4/S5/S8 (+#11 S3 target) | E7b + E2 + E8a | field3d_surgeon | E2/E7b **blocking**; target ride-along per its row |
| U9 | **State-local physics clock rebase ((b)-11)** — `RESET_TRAJECTORY` exists (`:45002–45018`); fix the `SET_STATE`-without-reset path THE EYE uses; probe: `PM_nlbTimeMs` = 0 at reveal start on two pinned states | both, every timed state | E1 | **`peter_parker:renderer_primitives` → pcpl-surgeon** | **blocking** |

**Ride-along duties (E8, field3d_surgeon — one dispatch, non-blocking):** `nlb_body_label` out of the brighten-only set (**E6 — blocking for S4**, listed here for locality; labels dim as emphasis peers per the row's DO); θ-arc clamp vs outer lane; `#nlb_formula` pixel check at each concept's longest line (340 px); readout zone sized off actual rendered neighbour height; **label decollision via the sprite projection probe** (`_pmText` + measureText — never DOM); friction-arrow t = 0 ink floor; new-mode apparatus-visibility bring-up probe (the generic `visible_elements` matcher row); new modes + `deriveStateMeta` co-edit at all three sites, proven against both config shapes — **including the A5 shape requirement: one state expresses up to THREE sequential phase bodies (#11 S5; #12 S3 uses two on the same mechanism)**.

**Registration duty (json_author, per concept):** `concept_panel_config` insert in the same session; motion declared consistently in `epic_l_path` AND `field_3d_config` (F14 — unchanged).

**What is deliberately NOT in the union:** no energy bars / SEAM-L change; no zoom inset; no graph panel; no RHR hand; no new `scenario_type`. #11 consumes nothing beyond U1–U4 + E1 + shared ride-alongs; U5–U8 are #12-only; both facts are recorded so the Phase-0 success test (zero renderer edits after 0c-2 lands) is judged against this exact list.

*(Orchestrating-session note: `pure_rolling`'s Checkpoint A adds six further items to this sheet — per-body `activate_at_ms`; `lane_gap_m = 0`/single-lane semantics with #11 declared a consumer of U8; the two-channel vector map superseding U7; revolution marks as their OWN primitive rather than riding `checkpoints`, which rewrites part of U4; ω re-seed on the sandbox wrap; and visible-elements registration for all new apparatus. Total across both concepts ≈ 33 named items over ~28 capabilities. The first of those is the founder decision this document is held for.)*
