# ARCHITECT SKELETON — `positive_negative_zero_work`

> Chapter: Class 11 Ch.6 Work, Energy and Power · concept **#2** of 12 (approved teaching order, founder 2026-08-01)
> Renderer: `field_3d` / `newtons_laws_body` + SEAM K/L/M/N energy layer (Phase-0c COMPLETE, on master since PR #14/#15). **0d pure-JSON concept — SEAM N's negative-work case and SEAM M's always-zero `'normal'` bar were built FOR this concept. Design target: ZERO renderer edits.**
> Authoritative config contracts: `docs/loop_runs/ch6_state.md` §"SEAM K/L/M/N RESULT" — those REPORTS supersede any literal here.
> Doctrine: Rules 16a · 19 · 23 · 24 · 25 · 31 · 32 · 33 · 34 · 35 · 38 · 41. Conceptual-only (Rule 20 [D]); EPIC-C branches: none.
> Line numbers below were read from the renderer THIS session (2026-08-02 desk, branch `feat/ch6-concept-2`), not inherited from concept #1's stale quotes.

## 0. Session verification record — every inherited claim re-checked at source

Per the standing lesson ("wrong AND deferential is the failure mode"), every engine claim in the dispatch brief was re-verified before designing. **All held; nothing refuted.** Five load-bearing confirmations:

1. **`show_components` resolves the WEIGHT only and hard-hides on flat ground — CONFIRMED.** Config type L1319 ("resolve weight into mg·sinθ + mg·cosθ"); reader L40862–40865: `var comps = !!spec.show_components && !b.hanging && Math.abs(th) > NLB_COMP_MIN_THETA`. No applied-force component object exists on a flat floor. Designed around (same F11 acceptance as #1; §"Accepted limitations" below).
2. **`work_bar_*` glow ids are STILL inert (E1 ride-along NOT landed).** `nlbEnergyApplyGlow` gates on `energy_panel | energy_bar_* | energy_seg_* | energy_col_E` only (L43494–43496); the `work_bar_*` map at L43560–43561 is unreachable. **No `work_bar_*` focal is authored anywhere in this skeleton.** If E1 lands before json-author, S4's focal MAY upgrade to `work_bar_net` — recorded as optional, never depended on.
3. **The sandbox wrap now re-anchors the `d` origin — CONFIRMED FIXED.** `b._dsp0 = s1` is set inside both wrap branches (L45571–45572) and the `d` arrow reads `(b._dsp0 != null) ? b._dsp0 : (b.s0 || 0)` (L44018); loop resets clear `_dsp0` (L43000). Concept #1's "short stub after wrap" residual is GONE — S6's `d` arrow and ledger re-zero in the same frame by engine behavior.
4. **Checkpoint capture interpolates to the exact crossing — CONFIRMED FIXED** (note 11b block, L44262+). Irrelevant here anyway: this concept authors ZERO checkpoints.
5. **`'normal'` returns a hard 0 in the accumulator by design** (L44161: `return 0; // 'normal' — exactly zero work, always`) — the zero is stated in code, not emergent. And the engine's own config comment (L1337–1339) describes `'F_ang'` as "the one control that sweeps W = F·d·cos θ through positive → zero → negative without touching anything else" — the engine was built expecting exactly this concept's S5.

Additional contract facts read for this design: nlb `mode` enum includes `'coast_no_force'` and `'coast_with_friction'` (L933–937); `controls_visible` tokens `'m'|'m2'|'F'|'F_ang'|'theta'|'mu_s'|'mu_k'|'v0'` (L1340); `readouts` includes `'v'` (L1336); `work_accumulators.force` CLOSED enum `'gravity'|'friction'|'applied'|'normal'|'net'` (L1474–1477); a force at or below `NLB_ARROW_EPS = 0.05 N` HIDES its arrow, never a stub (L39664–39665); glow mesh-side: solid apparatus (body/label/slab/pulley/rope/spring) is brighten-only and never dims, overlays dim to 0.4, and the ONE focal string is carried to the DOM panel via `nlbEnergyApplyGlow(focal)` (L41819, L41837–41848).

**Not done (no shell tool in this dispatch):** the live `query_engine_bug_queue.ts` run and the FIELD3D-constant fix in that script. The 11 inherited rows were supplied in the dispatch and are honoured in §"Scar compliance" below. **FLAG for quality-auditor Gate 8:** re-run `npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts positive_negative_zero_work` against this skeleton before build; the dispatching session still owes the script's stale-`FIELD3D` fix.

## 1. Atomic claim

This concept teaches ONE idea: **the work done by a force on a moving body carries a SIGN, and the angle between the force and the displacement decides it** — θ < 90° → W > 0 (the force helps the motion; the body speeds up), θ = 90° → W = 0 (a force can act the whole way and do nothing; the normal force is the canonical case), θ > 90° → W < 0 (the force opposes the motion; friction is the canonical case; the body slows down) — and the NET work is the signed sum over all forces acting. It does NOT cover kinetic energy as a quantity (#3), the work–energy theorem (#4 — "speeds up"/"slows down" is used only as an on-screen OBSERVABLE via the `v` readout; ΔK = W is never written, spoken, or implied by a formula surface), power (#11/#12), or the definition/joule/cos-θ resolution for 0° ≤ θ < 90° (owned by `work_done_by_constant_force`, #1, and assumed as prerequisite). **Boundary mechanics:** #1 clamped its `F_ang` to 0…85° to cede this regime; #2 opens it — concept-wide `slider_controls.F_ang: { min: 0, max: 180 }` (negative angles — a pull pressing INTO the floor — change N but not the sign story, and stay excluded).

## 2. State count + arc — 6 states (5 guided + 1 explore)

Medium concept (§5 calibration: medium 5–6) — justified: three sign cases that must each be its own beat (each carries its own canonical force and its own misconception), plus the net-sum ledger (the PRIMARY aha), plus the quantitative angle rule, plus explore. Fewer would fuse two sign cases into one state (two ideas); more would pad — the round-trip and energy-fate stories belong to #5 and #10.

| # | id | Ring | Purpose (one line) | teaching_method |
|---|---|---|---|---|
| S1 | `positive_work` | core | A forward pull on a moving crate: the signed bar climbs UP from its mid-height zero line, green, and the speed readout rises — positive work, the sign convention named | (straightforward beat) |
| S2 | `negative_work_friction` | core | A crate slides with no pull; friction points backward while the crate still moves forward — the bar dives BELOW zero, red, and the crate slows to a stop | misconception_confrontation |
| S3 | `zero_work_normal` | core | The crate coasts; the normal force pushes up the whole way and its bar never leaves the zero line while d grows — a force can act and do nothing | misconception_confrontation |
| S4 | `net_work_ledger` | core | One moving crate, three forces, four signed bars at once — green up, red down, one parked on zero, and the net bar is their signed sum — **PRIMARY aha** | (straightforward beat) |
| S5 | `angle_decides_sign` | extended | The SAME formula from #1 goes negative: a 25 N pull at 120° on a forward-moving crate does negative work; the θ slider crosses 90° live and the bar's direction flips | (straightforward beat + watch entry) |
| S6 | `explore` | core (explore) | Sandbox: drag the crate; F, θ (0–180°), m sliders; rough floor authored in — all four bars, d, arc and HUD live | exploration_sliders |

Rule 38a: qualitative cases (S1–S3) → the unifying ledger (S4, still qualitative/core) → quantitative angle rule (S5, extended, the sole extended state, contiguous, immediately before explore; **no advanced ring exists** — this concept has no derivation of its own; #1's advanced state already owns the dot-product notation, and both preset cuts below remain well-defined with an empty advanced block). The hook MOVES at S1 from the first frame.

## 3. Per-state choreography + control table (Rule 31 — REQUIRED artifact)

**Home pose (Rule 32d — PERMANENT, never rebuilt):** flat floor (`surface.theta_deg: 0`, `length_m: 6`, track −6…+6 m), one crate (`id: "crate"`, label `m`, m = 5 kg), **`initial_position_m = −5.4` in ALL six states** — the same rig and pose the teacher just left in concept #1 (deliberate cross-concept continuity; within-concept distinctness is carried by each state's own motion). Scar-4 bound check: |−5.4| = 5.4 < `length_m` − 0.55 = 5.45 ✓ (0.05 m margin, the shipped #1 value). Work panel at the screen LEFT edge (SEAM L measured panel, SEAM M signed bars inside it: mid-height zero baseline, green `#66BB6A` up for W > 0, red `#EF5350` down for W < 0); ONE formula surface top-centre; HUD value-only. **Zero checkpoints and zero multi-body states anywhere in this concept** (scars 1/2/3/6/7 satisfied by construction — see §"Scar compliance"). Cause-before-effect (32a): in every guided state the force arrow(s) exist from the first frame, the crate's motion responds, and the bars follow the crate.

**Bounding discipline:** in every authored auto-run the crate never reaches a track bound — `loop_reset_ms` (or a friction stop) ends the run first; the arithmetic per state is in the table and re-verified in §"Arithmetic". The geometric clamp/`[PM_NLB_ENERGY_CLAMP]` can fire only on a teacher-SEIZED run (one trusted slider input latches `PM_nlbSweepSeized` and the loop stops re-arming for the rest of the visit; the crate then runs the remaining track once and arrests at the bound — fleet-normal, accepted for S3/S5 exactly as #1's Patch 4 accepted it for its S3; re-clicking the state in the rail re-arms the loop; THE EYE never drags a slider, so baselines never see it). No narration may promise an endless loop on S3/S5.

| # | Teaches | Archetype | Distinct motion | Delta (≤5-word cue) | Controls | Ring | Words |
|---|---|---|---|---|---|---|---|
| S1 | W > 0 when the force points along the motion; the bar-up sign convention | `translate-through` | Steady 20 N pull at 0° from the first frame; crate accelerates from rest (a = 4.000 m/s²); the signed bar climbs UP from the mid-height zero line at 20.0 J/m while the `v` readout rises — "positive work goes with speeding up" as an observable; `loop_reset_ms: 2000` restarts before the bound (d_loop = 8.0 m, end −5.4+8.0 = +2.6 < +5.45 ✓) | "Bar up: positive work" | none | core | 30–45 |
| S2 | W < 0 when the force points against the motion; friction's work is real, negative joules | `translate-through` — **declared contrast pair with S1** (same motion class; the delta names the flip: bar direction and speed direction both reverse) | Crate LAUNCHED at v₀ = 6 m/s with NO pull (`mode: 'coast_with_friction'`, μₖ = μₛ = 0.4 this state only → f = 19.6 N backward); the friction arrow points against the still-forward motion; the bar dives BELOW the zero line at −19.6 J/m as `v` falls; the crate stops at d = 4.59 m, t = 1.53 s, bar at **−90.0 J** — and at rest the friction force, its arrow and its arc all VANISH (a zero force hides, L39664) **while the bar holds at −90.0 J: the force is gone, the work it did is still counted**; `loop_reset_ms: 2600` re-runs it | "Bar down: negative work" | none | core | 40–55 |
| S3 | W = 0 when the force is perpendicular — acting the whole way and doing nothing | `null-result-hold` | Crate coasts at constant v₀ = 3 m/s (`mode: 'coast_no_force'`, frictionless); the normal-force arrow pushes up for the entire run, the `angle_arc {from:'normal', to:'displacement'}` reads a live **90°**, `d` grows past 4 m — and the normal-force bar sits parked EXACTLY on the zero line at `0.0 J` throughout (engine-guaranteed, L44161). The **m slider is live**: heavier crate → the N arrow and readout visibly grow — and the bar still never moves. `loop_reset_ms: 2400` (d_loop = 7.2 m, end +1.8 ✓) | "Bar stays at zero" | `m` (0.5…10) | core | 35–50 |
| S4 | Every force keeps its own SIGNED work account; the net is their sum | `ledger-split` (**coined** — no existing archetype names one motion feeding several signed instrument accounts that diverge simultaneously; the distinct picture IS the four-bar split, not the translation) | 30 N pull at 0° on a rough floor (μₖ = μₛ = 0.4 → f = 19.6 N; breakaway immediate: 30 > maxStat 19.6 ✓); a = 2.08 m/s²; three force arrows (applied, friction, normal) and FOUR bars move at once: `by the pull` up at +30 J/m, `by friction` down at −19.6 J/m, `by the normal force` parked at 0, `net` up at +10.4 J/m — visibly the signed sum; `v` rises (net positive ↔ speeds up, observable only); `loop_reset_ms: 2000` (d_loop = 4.16 m, end −1.24 ✓) | "Four bars, one sum" | none | core | 40–55 |
| S5 | The angle decides the sign: the SAME `W = F·d·cos θ` goes negative past 90° | `rotate/flip` (the taught change is the PULL'S ORIENTATION — between states the arrow rotated past 90°; within the state the teacher rotates it live; the crate's deceleration is acknowledged as visually adjacent to S2's, distinguished by the tilted up-and-back 25 N arrow, the live 120° arc, and the θ slider) | Crate launched at v₀ = 6 m/s; 25 N pull authored at **120°** (SEAM N: along = 25·cos 120° = **−12.5 N**, verified representable; N = 49 − 25·sin 120° = 27.3 N > 0, no lift-off) — the pull leans up-and-backward while the crate still moves forward; arc reads 120°; the bar dives at −12.5 J/m; HUD shows the FULL pull `F = 25 N` (positive — the sign lives in the angle, not in F); crate stops at d = 7.2 m, t = 2.4 s, bar −90.0 J; **`loop_reset_ms: 2400 = t_stop`** (invariant: `loop_reset_ms ≤ 1000·m·v₀/|F cos θ|`, so the loop never shows the backward re-acceleration whose W would tick positive; one-frame overshoot ≈ 0.3 mm ≈ +0.004 J, invisible at 1 dp). **The θ slider is live (0…180°):** dragging below 90° turns the bar green mid-run; at exactly 90° the bar freezes while the crate coasts — the whole taxonomy under one finger | "Past 90°: negative work" | `F_ang` (θ, 0…180) | extended | 40–55 |
| S6 | Teacher's sandbox — the full taxonomy under all dials | `drag-sandbox` | `mode: 'sandbox'`, `trusted_drag_seizes: true`; rough floor authored in (μₖ = μₛ = 0.3) so all four bars live; F, θ, m sliders + drag; free-runs forever (Rule 37 automatic); on wrap the ledger AND the `d` arrow re-zero in the same frame (verified engine behavior, `_dsp0` L45571). Named discoverables for the narration: set F below μₛN (e.g. m = 10 → maxStat 29.4 N > F = 20 N) → the crate holds still and every bar parks (static friction does no work either); set θ = 90° → the pull acts, the crate coasts, its bar freezes. Lift-off corner (F = 60, θ = 90°, small m → N clamps to 0, arrows hide) is engine-verified graceful (SEAM N negative control) | "Change anything" | ALL: `F` (0…60), `F_ang` (0…180), `m` (0.5…10) + drag | core | 0 / open |

Archetype audit: `translate-through` ×2 (S1/S2, **declared contrast pair** — delta names the flip: force along vs against motion, bar up vs down, v rising vs falling) · `null-result-hold` ×1 (S3 — the canonical 16a form: the bar's stillness IS the taught content while the crate, arrows and d all move) · `ledger-split` ×1 (coined, justification in-table) · `rotate/flip` ×1 (S5, justification in-table) · `drag-sandbox` explore-only. No static state; no undeclared repeat.

**Glow focal (32e — exactly ONE per state; every id verified registered this session; NO `work_bar_*` anywhere — scar 5):**
S1 = `displacement_vector` (the d↔bar pairing is the lesson) · S2 = `nlb_arrow_crate_friction` (`nlb_arrow_<bodyId>_<kind>`, kind `'friction'` ∈ `NLB_ARROW_KINDS` L39668) · S3 = `nlb_arrow_crate_normal` (the acting-yet-idle force) · S4 = **`energy_panel`** — verified behavior: the DOM panel lights ALL its slots (the four work bars — the state's payoff) while mesh-side the overlay arrows dim to 0.4 and the crate/slab/labels stay full-bright solid (brighten-only carve-out, L41837–41843); the dimmed arrows are the accepted cost in the one state whose ten-year memory is the PANEL, and the arrows were each individually focal in S1–S3 · S5 = `angle_arc` · S6 = `nlb_body_crate`. (If ride-along E1 lands before json-author, S4 may upgrade to `work_bar_net` — optional, not depended on.)

**`slider_controls` (concept-wide, per-concept contract):** `F: {min: 0, max: 60, step: 5, default: 20}` · `F_ang: {min: 0, max: 180, step: 5, default: 0}` · `m: {min: 0.5, max: 10, step: 0.5, default: 5}`. The key is `default`, never `def` (#1's N6).

**`work_scale_J` (the scar-row sizing rule applied):** states with controls are sized to 1.1× the peak reachable at slider-clamp extremes over the full remaining track; the sandbox over a full post-wrap lap (2 × `length_m` = 12 m).
- **Shared guided scale S1–S4 = 180 J** (= 1.1 × S1's loop peak 160 J, the largest; S2 |−90| ✓, S4 applied peak 124.8 ✓ all inside). S3 has a control (`m`) but its only bar is `'normal'`, whose reachable peak is **exactly 0 at every slider value** (L44161) — the extremes rule is satisfied by any scale; it shares 180 for Rule 32d slope comparability (S1's +20 J/m and S2's −19.6 J/m render as near-mirror slopes on one scale — deliberately).
- **S5 = 315 J** (own scale — it has a control: extremes over the remaining 11.4 m at θ = 0 give 25 × 11.4 = 285 J; × 1.1 = 313.5 → 315. The |negative| branch is bounded by the launch KE, 90 J ✓).
- **S6 = 792 J** (1.1 × 60 N × 12 m; friction extreme 0.3 × 10 × 9.8 × 12 = 353 J ✓ inside). Declared deviation from the shared guided scale: explore is exempt from cross-state slope comparability (32b/32d explore exemption), same as #1.

## 4. Misconception confrontation plan (Rule 16a — 3 genuine pivots, at the guideline max, no per-state tic)

| Wrong belief (real, documented) | State | `misconception_watch` beat |
|---|---|---|
| "Work is always positive — friction does no work, it just slows things down" | S2 | `belief`: work can only accumulate upward; friction merely slows, contributing no work · `visual_counter`: the friction arrow points backward while the crate still moves forward; the friction bar dives below the zero line to −90.0 J as the speed readout falls to zero · `one_line_fix`: a force pointing against the motion does negative work — the joules are real and carry a minus sign |
| "A force that acts on a moving body must do some work on it" | S3 | `belief`: acting force → joules appear · `visual_counter`: the normal-force arrow pushes up for the whole run, the arc reads 90°, d grows past 4 m — and the normal-force bar sits parked exactly on the zero line · `one_line_fix`: a force at right angles to the motion does zero work, however long it acts |
| "Negative work means the force itself is negative, or points downward" | S5 | `belief`: the minus sign belongs to the force · `visual_counter`: the HUD reads the full pull F = 25 N — positive — the entire time; only the arc past 90° sends the bar below zero, and dragging θ back under 90° turns the same 25 N pull's bar green · `one_line_fix`: the sign of work comes from the angle between the force and the motion, not from the force's own size |

The 16a contrast shape: S1→S2 is a back-to-back contrast pair (the climb the student just watched, reversed); S3 is the canonical null-result-hold. S1, S4, S6 carry NO watch entry — straightforward teaching. EPIC-C branches: NONE (EPIC-L-first directive 2026-06-10).

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates) — 3 picks

- **S2 `negative_work_friction`** — "how can work be negative?" is the single most-asked confusion on this topic; multiple documented phrasings.
- **S3 `zero_work_normal`** — the mathematical abstraction (perpendicularity → zero) plus the exam-staple "carrying a bag" case.
- **S5 `angle_decides_sign`** — the cos-θ sign abstraction; "why does the sign flip at 90°".

Divergence note (Block-1 cross-ref): the Pass-1 cliff states are S1/S2/S3; S5 is picked instead of S1 because S1 is a convention-naming beat with no documented confusion corpus, while S5 carries the concept's abstraction — documented per the spec's divergence clause.

## 6. Drill-down clusters (3 candidates each)

- S2: `how_work_can_be_negative` (the signed product, force against displacement) · `friction_always_opposes_sliding` (why kinetic friction's angle is always 180°) · `slowing_down_and_negative_work` (the observable link, without ΔK)
- S3: `why_ninety_degrees_means_zero` (cos 90° = 0, the perpendicular projection is nothing) · `force_without_work` (acting ≠ working — the S2/#1-S2 family completed) · `carrying_a_bag_zero_work` (the classic: the upward hold on a bag carried on level ground does zero work)
- S5: `sign_of_cos_theta` (cos θ through the three regimes) · `negative_work_vs_negative_force` (|F| stays positive; the angle carries the sign) · `ninety_degrees_the_dividing_line` (the boundary case as a limit from both sides)

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational: STATE_1 → STATE_4   # "positive/negative/zero work", "net work" — contains PRIMARY aha (S4) ✓
  angle_rule:   STATE_5             # "sign of work from the angle", "work at 120°/obtuse angle"
```

Default aspect `foundational`. Foundational-coverage rule satisfied directly (S4 inside the range — no exit-pill needed). Cross-slice pill after foundational: "See how the angle decides the sign?" → STATE_5.

## 8. Prerequisites (advisory — Rule 23)

Shipped: `work_done_by_constant_force` (#1 — the definition, the joule, cos θ for θ < 90°; this concept opens from its exact rig and home pose), `friction_force` (S2/S4's μ), `normal_force` (S3's N), `newton_second_law` (why the crate speeds up/slows down). Forward edges: #3 `kinetic_energy_definition` and #4 `work_energy_theorem` build directly on S4's net-work ledger.

## 9. Real-world anchor (Rule 35 universal · Rule 38f widest-overlap · Rule 41 plain)

**Primary — carrying a bag across a level floor.** Your hand pulls the bag upward the whole way, and the bag moves horizontally: the force and the motion are at right angles, so the hand's upward force does exactly zero work on the bag, no matter how far you walk or how heavy the bag is. Every student on every syllabus has carried a bag; it is physics-true at full depth (it IS S3's perpendicular case) and it completes the arc #1's stalled-car anchor opened: there, zero work because nothing moved; here, zero work while everything moves.

**Secondary — braking on a bicycle.** The brake's friction force points backward while the bicycle still rolls forward — that force does negative work, and the bicycle slows. Universal, brand-free, and it is S2's beat in the student's own hands.

The source catalog's anchors for this topic are PRE-Rule-35 and India-specific (porter, chairlift, ISRO) — NOT imported (survey ⚠ section).

## 10. Definition of Done (Gate 0 — no TBDs)

**(a) States:** the 6 states of §2, exactly as tabled in §3.

**(b) Symbol-label table — engine-true strings, Unicode (Rule 34c):**

| Narrated quantity | On-canvas rendering (engine-true) |
|---|---|
| work-panel header | engine-hardcoded `"Work done"` — never author a duplicate heading |
| work by the pull | signed bar, authored `label: "by the pull"`; bar numeric BARE (`57.6 J`, `−90.0 J` with U+2212 minus, engine −0.0-clamped) |
| work by friction | signed bar, `label: "by friction"` |
| work by the normal force | signed bar, `label: "by the normal force"` (SEAM L fit ladder reflows the panel; SEAM M plain-English label rule) |
| net work | signed bar, `label: "net — the sum"` |
| applied force | F arrow at full \|F\| (SEAM N: the arrow is the handle), HUD `F = 25 N` |
| friction force | friction arrow (hides at f ≤ 0.05 N — the vanish IS an S2 beat), HUD `f = 19.6 N` |
| normal force | N arrow up, HUD `N = 49.0 N` (S3, live under the m slider) |
| speed | HUD `v = 4.8 m/s` (the speeds-up/slows-down observable) |
| displacement | `d` arrow along the surface, live value (SEAM N `show_value: true` default) |
| angle | arc label `θ`, live integer readout (`θ = 90°`, `θ = 120°`; ½° endpoint quantization per contract) |
| formula surfaces | see (h) — real Unicode: `θ`, `°`, `·`, `−`, `Σ`, `Wₙₑₜ` (U+2099/U+2091/U+209C) |

**(c) Direction-rule plan:** N/A — no right-hand rule (scalar sign taxonomy, coplanar mechanics). Direction content = arrow signage + the three arcs: S2 friction↔displacement (180° while sliding; hides at rest — honest, the quantity is zero), S3 normal↔displacement (90°), S5 applied↔displacement (120°, live). All arcs single-body (scar 6 N/A). S1 has NO arc (a 0° arc is degenerate; narration says "force and motion point the same way"). S4 has NO arc (three forces — arcs would clutter; the bars carry the signs).

**(d) Motion plan:** per §3. Loops: S1 2000 · S2 2600 · S3 2400 · S4 2000 · S5 2400 ms — each verified to end before the track bound (arithmetic in §"Arithmetic"); frozen pins at `clamp(0.60R, 150, R−150)`: S1/S4 1200 ms, S2 1560 ms (the crate has just stopped — the frozen frame shows the full −90.0 J bar with the friction arrow vanished, the state's best single picture; loop states keep `reveal_hold`, which relaxes pixelGate and never asserts stillness, so the stopped crate cannot false-fail THE EYE), S3 1440 ms, S5 1440 ms (mid-dive: v = 2.4 m/s, W = −75.6 J, arc 120°). S5's loop invariant: `loop_reset_ms ≤ 1000·m·v₀/|F cos θ|` (= 2400 ms exactly) so the loop never shows backward re-acceleration. No `param_ramp` anywhere (and note: `param_ramp.param` has NO `'F_ang'` member — an authored in-state angle sweep is NOT contracted; the θ crossing is teacher-driven by design, see Accepted limitations). No checkpoints. S6 free-runs (Rule 37 automatic) with the engine-fixed wrap re-anchor.

**(e) Modes:** conceptual-only (Rule 20 [D] — no `mode_overrides`). Scenario `mode` per state: S1 `accelerate_applied_force` · S2 `coast_with_friction` · S3 `coast_no_force` · S4 `accelerate_applied_force` · S5 `accelerate_applied_force` (with `initial_velocity_mps: 6`) · S6 `sandbox` — json-author verifies each mode's choreography defaults against the authored body params (the physics is parametric; the mode names the beat).

**(f)** `assessment` (6 questions, backward-designed: q1 sign convention/S1 · q2 friction's negative joules/S2 · q3 zero work by a perpendicular force incl. the carried-bag form/S3 · q4 net work as signed sum, incl. the constant-velocity net-zero variant/S4 · q5 sign from an obtuse angle, computed/S5 · q6 sandbox-class transfer/S6) + `coverage_map` authored by physics_author; `misconception_watch` exactly as §4 (3 entries: S2, S3, S5). Binding constraints:
- **(f-1) Friction declared by name everywhere:** S1/S3/S5 author `surface.frictionless: true`; S2 and S4 author `mu_s = mu_k = 0.4` on the crate; S6 authors `mu_s = mu_k = 0.3` (equal, never μₖ > μₛ).
- **(f-2) Breakaway/hold arithmetic:** S4 starts moving frame 1 (30 N > maxStat = 0.4 × 49 = 19.6 N ✓); S2's stopped crate stays stopped (zero drive ≤ maxStat ✓ — kinetic friction genuinely self-terminates, no ramp ceiling needed).
- **(f-3) `work_scale_J`** exactly as §3's block: 180 shared (S1–S4) · 315 (S5) · 792 (S6), with the extremes arithmetic stated there.
- **(f-4) Boundary discipline with #4:** no narration sentence, caption, or formula surface may contain "kinetic energy", "energy", or ΔK; "speeds up"/"slows down" + the `v` readout is the entire permitted observable.

**(g) Macro↔micro plan (Rule 33):** N/A-with-rationale — the taught variable (the sign of a visible force's work through a visible displacement) lives entirely at the macroscopic level; where friction's negative work GOES is #10's micro story, deliberately out of scope. Rule 33d instruments DO apply and are the concept's spine: four signed numeric bars, live `v`, live `d`, live arc degrees, HUD F/f/N — every number a teacher reads at a glance.

**(h) Canvas budget (Rule 34):** ONE formula surface per state (math-serif Unicode): S1 `W = F·d·cos θ > 0  (θ < 90°)` · S2 `W = f·d·cos 180° = −f·d` · S3 `W = N·d·cos 90° = 0` · S4 `Wₙₑₜ = ΣW` · S5 `W = F·d·cos θ` (the cos carries the sign — narration states it; the bar shows it) · S6 `W = F·d·cos θ`. Caption = the ≤5-word delta cue only; prose in `#capStrip`; HUD value-only; corners reserved per 34d (panel left edge, formula top-centre, sliders in their engine rows).

**(i) Curriculum-flex block (Rule 38):**
- (i-1) **Cut check 1** (hide advanced): no advanced states exist — the cut is the identity, trivially coherent. **Cut check 2** (hide advanced + extended → S1–S4 + S6): coherent — S1–S4 teach the full sign taxonomy by canonical cases plus the net sum without ever citing the cos-θ sign rule, obtuse angles, or S5's 120° run; S4's surface (`Wₙₑₜ = ΣW`) and S6's surface (`W = F·d·cos θ`, established in #1 and used in S2/S3's core surfaces) reference nothing hidden. S6's θ slider does reach past 90° in the reduced preset — a discoverable, not a reference: the red-bar sign convention is core (S2).
- (i-2) Explore surfaces CORE content only: the four bars, d, arc, `W = F·d·cos θ` — all established by S1–S4 (+ prerequisite #1).
- (i-3) `curriculum_tags`: CBSE/NCERT Class 11 Ch.6 (Work, Energy and Power — positive/negative/zero work) — **verified** at authoring (38g). IB DP Physics, AP Physics 1, A-Level (AQA/OCR/Edexcel), JEE Main/Advanced, NEET — claims with `needs_teacher_verification: true`.
- (i-4) Presets (hide, never reorder — 38h/25d): `full` = S1–S6 · `standard` = S1–S6 (no advanced to hide) · `intro` (hide extended) = S1–S4, S6.
- (i-5) Graph-axis convention: N/A — no graph panel (signed meters, not plots).

**(Rule 41 audit of reader-facing strings):** titles — "Force along motion: positive work" (S1) · "Force against motion: negative work" (S2) · "Force at right angles: zero work" (S3) · "Net work is the signed sum" (S4) · "The angle decides the sign" (S5) · "Explore: change force, angle, mass" (S6). All literal, front-loaded for rail truncation. Banned-register sweep done on every string in this skeleton: no "fights", "steals", "eats", "wins". **Self-caught: an earlier draft of §3's S2 row used "its work stays on the books" — that is an idiom (Rule 41a) and must NOT appear in narration; the corrected wording is "the bar keeps its reading: the work was done".** Forces "point", "push", "act", "do work"; bars "climb", "dive" (literal motion of the bar — acceptable), "stay at zero"; the crate "speeds up", "slows down", "stops".

## ENGINE FIT CHECK (0d — every beat mapped to a built, contracted block)

| # | Needs | Engine block (contract source) + arithmetic | Status |
|---|---|---|---|
| S1 | 0° pull · signed bar up · v readout · loop | `applied_force: {N: 20, angle_deg: 0}` (SEAM N; bit-identical legacy path at 0°) · `work_accumulators: [{force:'applied', label:'by the pull'}]`, `work_scale_J: 180` (SEAM M signed rendering) · `readouts: ['F_applied','v']` (`'v'` ∈ enum L1336) · `displacement_vector` (SEAM N) · `loop_reset_ms: 2000` (SEAM K). a = 20/5 = 4.000; d_loop = ½·4·2² = 8.0 m ✓ | ✅ all built |
| S2 | launched coast · kinetic friction integrates a signed ledger · stop-and-hold · arrow/arc vanish at rest | `mode: 'coast_with_friction'` (L933) · `initial_velocity_mps: 6`, `mu_s: 0.4, mu_k: 0.4` · accumulator `{force:'friction'}` — `nlbWorkForceAlong` returns `b.f` (L44156), signed negative against forward ds · stop: t = 6/3.92 = 1.531 s, d = 36/7.84 = 4.592 m, W = −19.6 × 4.592 = **−90.0 J** (≡ −½·5·36 ✓) · zero-force arrow hide at L39664 · arc `{from:'friction', to:'displacement'}` (`'friction'` ∈ closed arc enum; hides when the quantity is zero — contracted honesty) | ✅ all built |
| S3 | constant-v coast · normal bar parked at 0 · 90° arc · live m slider | `mode: 'coast_no_force'` (L933), `frictionless: true`, `initial_velocity_mps: 3` · accumulator `{force:'normal'}` — **hard 0 by design, L44161** (the mechanism built "precisely because it is always exactly 0") · arc `{from:'normal', to:'displacement'}` reads 90° · `controls_visible: ['m']` (L1340) — N readout tracks m·g live; W stays 0 at every m (the extremes-sizing rule is satisfied by any scale) · seizure-then-arrest on teacher touch accepted per bounding ¶ | ✅ all built |
| S4 | three forces · four signed bars · net = signed sum | `applied_force: {N: 30, angle_deg: 0}` + `mu_s/mu_k: 0.4` · `work_accumulators` ×4: `applied / friction / normal / net` — exactly the closed enum's teaching members (L1474–1477), at the 1–4 max · slopes +30.0 / −19.6 / 0 / +10.4 J/m; a = (30−19.6)/5 = 2.08; loop peak: applied 30 × 4.16 = 124.8 J < 180 ✓ · arrows `show: ['applied','friction','normal']` · focal `energy_panel` (verified L43494 + mesh-side L41837–48) | ✅ all built |
| S5 | obtuse-angle pull · genuinely negative along-component · live θ slider through 90° | `applied_force: {N: 25, angle_deg: 120}` — SEAM N verified the (90°, 180°] regime (report: 120° → −20 N at 40 N; here 25·cos 120° = −12.5 N) · N = 49 − 21.65 = 27.3 > 0 ✓; slider worst case θ = 90°: N = 24 > 0 ✓ no lift-off anywhere on the range · arc `{from:'applied', to:'displacement'}` = 120° live · `controls_visible: ['F_ang']` under concept-wide `slider_controls.F_ang {min: 0, max: 180}` (per-concept override, `nlbSc` merge) — the engine's own comment names this control as the positive→zero→negative sweep (L1337–39) · stop: t = 5·6/12.5 = 2.4 s, d = 6²·5/(2·12.5) = 7.2 m, end +1.8 ✓ · scale 315 per extremes rule | ✅ all built |
| S6 | sandbox · 4 bars · honest wrap · clamped sliders | `mode: 'sandbox'` + `trusted_drag_seizes` · `controls_visible: ['F','F_ang','m']` · wrap re-anchor **engine-fixed**: `b._dsp0 = s1` (L45571–72), d-arrow reader L44018, loop-reset clear L43000 — bar and arrow re-zero in the same frame, no home-pose workaround needed · `work_scale_J: 792` per the sandbox lap rule · drag never bills work (`_s_pre` re-stamp, L44164–66) | ✅ all built |
| — | teach the sign taxonomy with NO `energy_layer` | `energy_active` from `work_accumulators` alone (verified for #1 and unchanged) — no K/U bars exist anywhere in this concept, so #3/#7 are not pre-taught | ✅ verified |
| — | `deriveStateMeta.ts` co-edit | None: no new scenario_type, reveal key, or cue time; `loop_reset_ms` states keep `reveal_hold` (SEAM L site ii); the SEAM M frozen-pin rule covers every loop state (pin arithmetic in DoD (d)) | ✅ zero edits |

**Not used (correctly):** `energy_layer`, `checkpoints`, `height_markers`, `sum_merge`, spring, `P`/`P_avg`, `param_ramp`, `'gravity'` accumulator (on a flat floor its zero duplicates S3's story — one canonical zero case, not two), multi-body, `v0`/`mu_k` slider tokens.

**Accepted limitations (recorded, deliberately NOT routed — the alarm rule does NOT fire):**
1. **No drawn F-component object** (inherited F11, re-verified this session at L1319/L40862–65): the along-motion component `F cos θ` is never an on-canvas object on a flat floor. S5 teaches the sign by the arc + the full-|F| arrow + the bar's direction — the same acceptance the #1 reviewer explicitly declined to route. Engine ride-along E2 remains filed; if it lands first, S5 gains the projection picture with no design change.
2. **No authored in-state angle sweep**: `param_ramp.param`'s closed enum (`'theta'|'F'|'mu_s'|'mu_k'|'m'`) has no `'F_ang'` member, so the 0°→180° crossing cannot be an authored ramp. Designed around: the crossing is TEACHER-driven (S5's live slider — arguably the better pedagogy: the taught variable in the teacher's hand, Rule 31), and the authored beat shows the flipped-orientation consequence at a fixed 120°. This is a JSON-expressible design, not an engine gap requiring an edit; noted so founder-proxy sees the one place a ramp was considered and rejected.
3. **`work_bar_*` glow ids still inert** (E1 ride-along open, re-verified L43494–96): the concept's payoff bars cannot be individually glowed. S4 uses the contracted `energy_panel` whole-panel focal instead; individual-bar glow upgrades are recorded as optional-on-E1.

## Scar compliance — the 11 inherited rows, one line each

| Row | Honoured by |
|---|---|
| 1 multibody z-lane camera stack | **Zero multi-body states by design** — screen-separation arithmetic N/A; stated, not skipped |
| 2 `s_m` is absolute, author as arithmetic | **Zero checkpoints**; home pose `initial_position_m = −5.4` stated in §3 regardless |
| 3 loop reset wipes stamps / pin at 60% | Zero checkpoints; pin arithmetic still authored per loop state (DoD d) |
| 4 never home-pose on a bound | \|−5.4\| = 5.4 < 6 − 0.55 = 5.45 ✓ every state; withdrawn-mitigation corollary noted (no bound seeding anywhere) |
| 5 `work_bar_*` focals never light | Re-verified inert this session; **no such focal authored**; S4 = `energy_panel` (verified channel) |
| 6 angle_arc lane overrun in multi-body | Single body in every arc state |
| 7 one `displacement_vector` per state | Single body everywhere — no compare state measures anything it can't show |
| 8 work probe globals disagree multibody | Single body: `PM_nlbWork` (per-force mirror) and `PM_nlbWorkApplied` agree; verification claims scoped accordingly |
| FIXED: checkpoint crossing interpolation | Relied on: nothing (no checkpoints) |
| FIXED: sandbox wrap re-anchors d origin | Relied on: S6's clean same-frame bar+arrow re-zero (verified `_dsp0`, L45571/L44018) |
| Directive: `work_scale_J` extremes sizing | Applied with arithmetic: 180 / 315 / 792 (§3) |

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

**Prerequisite cliff.** (1) `work_done_by_constant_force` missing → breaks at **S1** (what is this bar?): patch clause "the work meter measures force times distance moved, exactly as before" — one clause re-anchors `W = F·d·cos θ` without re-teaching it. (2) `friction_force` missing → breaks at **S2** (why does it slow?): patch clause "the rough floor's friction force pushes backward on the sliding crate" while the `f` readout shows 19.6 N. (3) `normal_force` missing → breaks at **S3** (what is this upward arrow?): patch clause "the floor pushes up with the normal force, balancing the weight" — sufficient without re-teaching Ch.5.

**JEE-backwards trace.** Question: *"A block is dragged 5 m across a rough horizontal floor at constant velocity by a horizontal 20 N force. Find the work done by (a) the applied force, (b) friction, (c) the normal force, (d) all forces together."* Pieces → states: (a) +100 J, force along motion (S1); (b) −100 J, friction's negative work at 180° (S2); (c) 0, perpendicular (S3); (d) net = signed sum = 0 (S4 — and the constant-velocity net-zero variant is named in S4's assessment question and discoverable in S6 by setting F = μₖN). The follow-up "hence find the change in kinetic energy" is **deliberately out of scope — #4's atomic claim**. No missing piece within scope.

**Misconception entry mapping (16a).** (1) "work is always positive" — arrives with the student AND is reinforced by #1 (every worked case there had W ≥ 0) and by our S1, which deliberately EARNS it one click before S2 breaks it (the planting is flagged by design: S1's narration names its own condition — "the pull points along the motion"). (2) "an acting force must do work" — planted by S1+S2 ("forces produce joules, positive or negative"); S3's null-result-hold breaks it two clicks later. (3) "negative work = negative force" — risk of planting at S2 (friction "opposes", bar dives); S5 defuses it with the HUD's persistently positive F = 25 N. No EPIC-C branches (fallback deferred).

### Block 2 — Aha-moment designation

- **PRIMARY aha (S4):** one moving crate, four work accounts at once — the pull's bar climbs green, friction's dives red, the normal force's never leaves zero, and the net bar is their signed sum. The 10-year memory is the four-bar ledger over a single sliding crate.
- **SUPPORTING aha (S2):** work can be NEGATIVE — the meter that only ever climbed in concept #1 dives below its zero line, and the joules it counts down are real.
- **Cohesion check:** S2 supplies the sign that makes S4's ledger possible (without negative entries a "signed sum" is just a sum); S3 supplies the zero row. Both feed the primary directly. S5 is the primary's quantitative generalization, deliberately NOT designated an aha (keeps the 1+1 sweet spot).
- **Wrong-belief setup:** for the supporting aha — S1 (one state before) rebuilds the confident #1-era picture "the work bar climbs as things move". For the primary — S1–S3 teach the cases one force at a time, earning "one force, one story at a time"; S4 breaks it by running all the accounts simultaneously and summing them.
- **Foundational-coverage:** S4 ∈ foundational range (S1–S4) ✓.

## Arithmetic (recomputed independently before writing — nothing asserted unmeasured)

| State | Config | N = mg − F sin θ | a (m/s²) | bar slope(s) J/m | loop / stop | loop-end pos (from −5.4) | pin (60%) picture |
|---|---|---|---|---|---|---|---|
| S1 | 20 N @ 0°, frictionless | 49.0 | +4.000 | +20.0 | R = 2000 ms, d = 8.00 m | +2.6 < +5.45 ✓ | d 2.88 m, W +57.6 J, v 4.8 |
| S2 | v₀ 6, μ 0.4 | 49.0 | −3.920 | −19.6 | stop t = 1.531 s, d = 4.592 m; R = 2600 | −0.81 ✓ | t 1560 ms: stopped, W −90.0 J, arrow hidden |
| S3 | v₀ 3, coast | 49.0 (m = 5) | 0 | 0 (exact) | R = 2400, d = 7.20 m | +1.8 ✓ | d 4.32 m, W 0.0 J, θ 90° |
| S4 | 30 N @ 0°, μ 0.4 | 49.0 | +2.080 | +30.0 / −19.6 / 0 / +10.4 | R = 2000, d = 4.16 m | −1.24 ✓ | d 1.50 m: +44.9 / −29.4 / 0.0 / +15.6 J |
| S5 | 25 N @ 120°, v₀ 6 | 49 − 21.65 = **27.3 > 0** ✓ | −2.500 | −12.5 | stop t = 2.4 s, d = 7.20 m; R = 2400 = t_stop | +1.8 ✓ | t 1440 ms: v 2.4, d 6.05 m, W −75.6 J, arc 120° |

Cross-checks: S2's W at stop = −½mv₀² = −90.0 J ✓ (independent route agrees). S4's net slope 30.0 − 19.6 = 10.4 ✓. S4 breakaway 30 > μₛmg = 19.6 ✓; S2's stopped crate holds (drive 0) ✓. S5 slider worst-case N (θ = 90°): 49 − 25 = 24 > 0 ✓. Scales: 1.1 × 160 = 176 → 180; 1.1 × 25 × 11.4 = 313.5 → 315; 1.1 × 60 × 12 = 792 exactly. Advance modes: `manual_click` ×5 + `interaction_complete` = 2 distinct ✓ (Gate 12).

## Compliance lines

- **DC Pandey / source check:** consulted chapter table-of-contents scope only (NCERT Ch.6 "Work" covers positive/negative work; sign-of-work is a standard sub-topic). No teaching method, example problem, or figure imported. NCERT Indian-context examples not imported (Rule 35).
- **Engine bug queue:** live query not runnable in this dispatch (no shell tool); the 11 inherited rows applied per §"Scar compliance"; field_3d directive corpus applied (concrete-before-abstract: cases → ledger → rule; reveal-synced/no hardcoded `*_at_ms`: nothing time-stamped, everything crossing/loop/clock-driven; visual-must-match-narration: every narrated number appears in §"Arithmetic" and on an instrument; don't-pre-spoil: gravity's zero bar withheld, K/U bars withheld, net-zero constant-velocity case reserved for S6/assessment). **FLAG:** Gate 8 re-runs the queue; the dispatching session owes the script's `FIELD3D`-constant fix. *(Dispatching session note 2026-08-02: the `FIELD3D` fix LANDED as commit `a306581` — the constant is now derived from the concept JSONs; `--field3d --open` returns 73 rows including 16 `nlb_*` scars it previously hid. The live query was also run before this dispatch and returned exactly the 11 rows supplied.)*
- **Boundary reconciliation:** with #1 — this concept opens the `F_ang` regime #1 mechanically ceded (its 0…85 clamp vs our 0…180). With #3/#4 — no "energy" word, no ΔK, no K bar anywhere (DoD f-4). With #10 — where friction's joules GO is never asked or answered.

## Self-review checklist — all items verified

Atomic claim one sentence with explicit #1/#3/#4 boundaries ✓ · 6 states, medium band, justified ✓ · control table complete (teaches × archetype × distinct motion × delta × controls × ring × words), ONE declared contrast pair (S1/S2), one coined archetype with justification (`ledger-split`), no static state, drag-sandbox explore-only ✓ · Rule 32 (cause-first, one-variable, ≤5-word cues, permanent home pose, single verified focal per state — no `work_bar_*`) ✓ · Rule 33 N/A-with-rationale + live instruments ✓ · Rule 34 one formula surface per state, Unicode audited (θ ° · − Σ Wₙₑₜ) ✓ · Rule 35/38f/41 universal anchors + plain-language sweep (one design-prose idiom self-caught and quarantined in §10) ✓ · Rule 38 rings ordered, extended contiguous before explore, empty advanced ring declared, both cuts checked, explore core-only, tags as claims, presets, axes N/A ✓ · misconception_watch at 3 genuine pivots only ✓ · deep-dive picks ×3 with 3 clusters each + divergence documented ✓ · entry_state_map with PRIMARY aha in foundational ✓ · prerequisites advisory ✓ · DoD zero TBDs ✓ · Block 1 + Block 2 complete ✓ · ENGINE FIT CHECK: every state mapped to a verified contract, all line numbers read THIS session, zero renderer edits, alarm rule NOT fired, three accepted limitations recorded ✓ · Scar compliance table covers all 11 rows ✓.

**Handoff:** to founder-proxy Checkpoint A, then physics-author. Physics-author's inputs: narration within the tabled word budgets under the f-4 vocabulary ban; the S5 loop invariant (`R ≤ 1000·m·v₀/|F cos θ|`); the three `work_scale_J` values as computed; `assessment` + `coverage_map` per DoD (f). json-author authors the home pose (−5.4 everywhere), the three `slider_controls` entries (key `default`, never `def`), the four accumulator labels verbatim, and the six modes of DoD (e).
