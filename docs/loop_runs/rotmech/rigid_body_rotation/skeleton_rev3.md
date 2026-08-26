# Skeleton — `rigid_body_rotation` (rotmech · Class 11 Ch.7 · concept #3) — REV 3

> **Status:** Phase-0b DESIGN PASS on a BLOCKED concept (desk C, wave 2), **REV 3 — fix cycle 2 of
> 2 (the LAST cycle)** against founder-proxy Checkpoint A cycle 2 (`founder_proxy_A_cycle2.md`,
> verdict `DESIGN_FIX`, F1–F3 (P1) + F4–F8 (P2) + P3-a…P3-d, all routed `alex:architect`; the §7
> closure list is the cycle-2 gate). This concept renders on the
> **rbr scenario** (`field_3d_renderer.ts:939` / `:49736–50790`); "this concept" = the lesson,
> "the rbr scenario" = the renderer surface. Blocked on build **0c-3**; on merge the build starts
> at `json-author`.
> **Revision history:** REV 1 preserved at `skeleton_rev1.md` · REV 2 preserved at
> `skeleton_rev2.md` · cycle-1 report: `founder_proxy_A.md` · cycle-2 report:
> `founder_proxy_A_cycle2.md` · this file is the fix-cycle-2 resubmission. Cycle-1 findings are
> mapped in the FIX-CYCLE-1 RESPONSE table (carried forward; one cell cross-corrected at cycle 2
> — R3/F7); cycle-2 findings are mapped in the FIX-CYCLE-2 RESPONSE table at the end. Everything
> the cycle-2 report ENDORSES (its §7 closing paragraph) is preserved untouched: the R1 rebuild
> and the 6-state arc, the deletion bookkeeping, the C8 plan + arithmetic, C10, the C7 defer,
> the C2 withdrawal, the ladder re-tune, the coined archetypes, the ring cuts, the refusals,
> the S3 cut order, and the prerequisite ids.
> **THREE FOUNDER RULINGS implemented (2026-08-04), not re-litigated:**
> **(R1)** v = ωr belongs to #4 `rotational_kinematics` — matching `phase0_survey.md:42/43` and
> `:155/156`; the defective master pre-registration line for #3 is FIXED in commit `2443a74`
> ("Does NOT cover the formula v = ωr or the velocity arrow at radius r — those belong to
> rotational_kinematics"). #3 keeps the arc comparison as LENGTHS. Old S4 deleted; no v anywhere.
> **(R2)** the camera is an ENGINE gap, filed as **F-C4 (P1)** in `_engine/findings_c.md` PASS 4
> by the dispatching session. This skeleton designs ASSUMING per-state camera lands; every
> camera-dependent beat carries a visible **[CAM]** tag; C8 is BLOCKING; the authoring-side
> workaround (rewording "circle") was considered and REJECTED per the ruling.
> **(R3)** prerequisites are NAMED even where no concept JSON exists (Rule 23 advisory; no
> referential check) — carried as a stated assumption in §8.
> **Tiering discipline:** unchanged — every motion carries `[LIVE]` (verified in the renderer with
> file:line; founder-proxy §A spot-checked 23 ranges, zero false tags — those citations are
> UNCHANGED and carry forward) or `[NEEDS-0c-3]` (named engine row).
> **Bug-queue consultation (RE-RUN ATTEMPTED AGAIN at REV 3, 2026-08-04):** the dev Supabase
> project returned **Cloudflare 522 (connection timed out)** for a THIRD same-day reproduction
> (12:52 UTC this desk at REV 2 · 13:16 UTC founder-proxy's independent verification, §R-2 ·
> **13:40 UTC this desk at REV 3**) — the LIVE table is unreachable this session. The cycle-2
> report rules this handling honest and non-blocking (§R-2). Carried forward: the SAME-DAY REV 1 consultation (LIVE table via
> Bash: `--owner alex:architect` → 63 · `--row-type directive` → 83 · `--field3d --open` → 85 ·
> `rigid_body_rotation` → 1), whose full disposition list carries forward with the re-rulings
> named in SCAR AUDIT §"REV 2 re-rulings". The five candidate rows drafted in
> `founder_proxy_A.md` §C are NOT yet filed; this revision conforms to every one of their
> prevention rules (conformance stated row-by-row in the SCAR AUDIT). If the outage persists at
> 0d, the 0d session re-runs the four queries before json-author starts.
> **DC Pandey check:** chapter table of contents only. No teaching method, example problem, or
> figure imported. NCERT §7.1 (rigid body) / §7.6 confirm scope.
> **Namespace check:** unchanged from REV 1 — `rigid_body_rotation` in neither concepts
> directory; the scenario_type of the same name is a renderer identifier.
> **Apparatus contract:** obeyed field-for-field, all values authored explicitly (the engine
> default `RBR_DEF_R_MAX = 0.90` at `:50496` ≠ home r = 0.80, so omission would silently move the
> machine — REV 1's handling, endorsed at Checkpoint A, preserved). Home pose r = 0.80 m,
> ω = +1.50 rad/s, m = 2.0 kg, τ_brake = 0; I = 3.06 kg·m², L = 4.59 kg·m²/s, KE = 3.44 J;
> rod_half 1.00 m, drum 0.55 m, r range 0.15–0.90.
> **Cross-desk prior art (Rule 40a):** Desk D `findings_d.md` (commit `c677482`) — its §4
> tangential-arrow ask is now **Desk D's alone** (R1): see ENGINE REQUIREMENTS, C2 WITHDRAWN.

---

## 1. Atomic claim

This concept teaches ONE thing: **a rigid body is a body whose internal distances never change, so
when it turns on a fixed axle every point of it moves in its own circle around the axis, every
point sweeps the same angle in the same time — one shared angular speed ω — and therefore a point
farther from the axis traces a LONGER PATH in that same time.** The path-length claim is taught as
an **arc comparison**: arc lengths swept in one shared time window, compared as lengths
(0.81 m vs 1.62 m at radii 0.30 m vs 0.60 m — twice the radius, twice the arc).

**Boundary (founder ruling R1, 2026-08-04, Checkpoint A fix cycle 1 — implemented, not
re-litigated):** the formula **v = ωr, the tangential velocity arrow, any velocity numeric ladder
and any v label belong to `rotational_kinematics` (#4)** — per `phase0_survey.md:42/43` (spine
rows 3/4), `:155/156` (engine-need rows), and the corrected master pre-registration line (commit
`2443a74`, which fixed the defective "(v = ωr)" clause REV 1 was built on). This concept prints
NO v of any kind and carries NO formula surface. It also does not cover ω = dθ/dt, α, or the
kinematic equations (#4), how mass distribution enters (I = Σmr², #6 `moment_of_inertia`), or
L = Iω (#9 `angular_momentum`, this desk — none of its material taken). The advanced ring states
the decomposition *general motion = motion of the centre + rotation about the centre*; the
parabola of a thrown body's centre belongs to `motion_of_centre_of_mass` (#2) and is NOT staged.

## 2. State count + arc — 6 states (5 guided + 1 explore)

**Renumbering under R1 (old → new):** S1→S1 · S2→S2 · S3→S3 · **old S4 (v = ωr) DELETED** ·
old S5→**S4** (re-pointed per P2-4 + R1) · old S6→**S5** · old S7→**S6**. The walk, entry map,
rings, Rule-16a beats and both preset cuts are re-derived from scratch below, not renumbered in
place.

Complexity call: **medium**. Core = definition → circles → the same-time aha with the arc ratio
(3 guided beats); extended whole-body beat + advanced general-motion decomposition add two; one
explore. The quantitative payload that was old S4's formula state now lives INSIDE S3 as the
arc/radius ratio — S3 was already the aha state and the arcs were already quantitative; R1 makes
that the concept's whole quantitative content ("Yes, it loses a state and the numeric ladder.
That is correct.").

Apparatus discipline unchanged from REV 1 (endorsed): the ONE machine, masses never move
(sliding them is #10's aha), everything this concept adds is a MASSLESS annotation on the
spinning body (`rbrIOf` `:49865` reads only the mass pair). The drum face IS the disc for the
whole-body beat; `body_shape` variants stay NOT required (scoping finding, mirrored).

**Authored numeric ground truth (2 dp; audit re-run under P2-1 at the end of this block):**
marked points on the rod at r = **0.30 (P₁)** and **0.60 (P₂)** m, **both on the SAME arm of the rod** (F3a — the rod is symmetric, sides
= [1, −1] at `:50355`; on OPPOSITE arms the two points would cross a single fixed ray half a
revolution apart and S3's simultaneity counter would render a lie; the far mass on the opposite
arm is only what the 1.40 m gauge spans THROUGH the axis) — **old P₃ (0.90 m) is
DELETED**: it existed for the v ladder (gone under R1) and sat 0.011 m from the drawn mass
surface (mass sphere radius 0.16 world / 1.8 world-per-m = 0.089 m ⇒ the r = 0.80 mass spans
**0.711–0.889 m** along the rod — the P2-1 collision, now vacated). S1 gauges: **axle→P₁ =
0.30 m** and **P₂→far-mass = 1.40 m** (0.60 + 0.80, crossing the axis) — REV 1's P₁–P₂ chord
gauge is REPLACED: it read 0.30 m collinear-adjacent to the axle–P₁ span of the same length
(P2-1 item 2); the axle→P₁ gauge has no equal-length neighbour on its line AND is the very span
S3 re-names as the radius r₁. S3 compare window Δt = **1.80 s** ⇒ swept angle 2.70 rad ⇒ arcs
**s₁ = 0.81 m**, **s₂ = 1.62 m** (exactly 2×), beside radius gauges **r₁ = 0.30 m**, **r₂ =
0.60 m** (exactly 2×). S4 drum face: radial line of five dots r = 0.10…0.50 m + rim ring of
eight dots all at r = 0.50 m, authored at angles **22.5° + k·45°** (F4); labels **r = 0.10 m** (innermost line dot), **r = 0.50 m** (line's
end dot), **r = 0.50 m** (ONE rim dot at a DIFFERENT angle — P3-3). S5 glide: **v_glide =
0.40 m/s** for **3.5 s** ⇒ travel **1.40 m**; held gauge **P₁→far-mass = 1.10 m** (0.30 + 0.80 —
REV 1's 0.30 m glide gauge echoed r₁ and is replaced). One revolution = 4.19 s; ω HUD =
1.50 rad/s (S3–S6).

**Displayed-numeral audit (union, incl. the radii — P2-1 item 3 / P1-3c):** S1 {0.30, 1.40} ·
S3 {0.30, 0.60, 0.81, 1.62, ω 1.50} · S4 {0.10, 0.50, 0.50} · S5 {1.10, ω 1.50} · S6 live. The
S1/S3 0.30 is the SAME gauge on the SAME span deliberately re-shown (continuity: "the distance
you measured is the circle's radius"), not a confusable pair. The S4 in-frame 0.50/0.50 pair is
THE claim (same radius, same circle). No other numeral repeats anywhere; the REV 1 collisions
(0.90 m vs 0.90 m/s; chord-0.30 vs radius-0.30 in one frame) are all structurally gone.
**Clearances in metres (P2-1, stated not asserted):** rod markers max 0.60 vs mass inner edge
0.711 ⇒ **0.111 m**; drum dots max 0.50 vs drum radius 0.55 ⇒ 0.05 m; S6 r_point max **0.65** vs
0.711 ⇒ **0.061 m** (0.110 world — REV 1's 0.95 cap would have dragged the marker straight
through the drawn mass).
**Per-gauge SIGNED offsets (F3c — a two-gauge state must never stack its gauges):** S1
axle→P₁ at **+0.10 world**, P₂→far-mass at **−0.10 world**; S3 r₁ at **+0.10**, r₂ at
**−0.10** — each pair flanks the rod as two parallel bars (the C5 single default standoff is
overridden per gauge in both states), so "twice as long" reads directly as bar against bar.

| State | Title (Rule 41 — literal; rail first words pairwise distinct: A/Every/Outer/Same/Moving/Try) | Purpose | teaching_method | Ring |
|---|---|---|---|---|
| S1 | A rigid body: distances stay fixed | Definition shown as a held measurement [CAM] | *(straightforward beat)* | core (qualitative) |
| S2 | Every point moves in a circle | Per-point circular traces [CAM] | *(straightforward beat)* | core (qualitative) |
| S3 | Outer points travel farther in the same time | THE PRIMARY AHA + ω + the arc/radius ratio — the concept's whole quantitative payload (R1) [CAM] | *(straightforward beat)* | core (quantitative-by-ratio) |
| S4 | Same radius, same circle | Generalize to every point: the path depends on r ALONE, not angular position (P2-4 re-point, adapted under R1) [CAM] | *(straightforward beat)* | extended |
| S5 | Moving and spinning at once | General motion = slide of centre + spin about centre [CAM] | *(straightforward beat)* | advanced |
| S6 | Try it yourself | Sandbox [CAM] | `exploration_sliders` | *(explore — ring-gated controls)* |

**Rule 38a — honest restatement (P3-2):** the STRUCTURAL clauses hold — advanced ring = S5, a
contiguous single-state block immediately before the explore; both preset cuts coherent
(§10 i-1). The CONTENT ladder is qualitative (S1–S2) → quantitative-by-ratio (S3) → extended
qualitative (S4) → advanced decomposition (S5). **This concept has no derivation to stage**:
s = rθ ⇒ v = ωr needs dθ/dt, which is #4's material (R1) — stated plainly rather than ticking
38a's derivation rung on the ring order.
`advance_mode`: S1–S5 `manual_click`, S6 `interaction_complete` (Gate 12: 2 distinct modes) ✓.

## 3. Per-state choreography + control plan (Rule 31 control table)

**Coined archetypes (unchanged, endorsed at Checkpoint A):** `trace-draw` (S2) · `arc-compare`
(S3) · `populate-rule` (S4). Justifications as REV 1. Archetype-discharge rule unchanged: every
archetype discharges from authored within-state motion; the spin runs continuously in every
state `[LIVE :49945/:50671]`, so no state is static.

**THE CAMERA PLAN (R2 / F-C4 — read `_engine/findings_c.md` PASS 4; this skeleton is consistent
with it and does NOT re-file it).** Every state is authored against a **per-state camera pose
(C8, BLOCKING)**. Requirement: a circle in the rotation plane must read as a circle — projected
aspect = sin(elevation) ≥ 0.90 ⇒ elevation ≥ 64.2° ⇒ polar φ ≤ 0.45 rad. The pinned build pose
(φ = 1.16 at `:50476` = 23.5° elevation, aspect **0.399**) fails this in every state. Authored
poses:

| States | Pose (C8 fields) | Framing obligation |
|---|---|---|
| S1–S3, S6 | φ = **0.35 rad** (elevation 69.9°, circle aspect **0.94**), θ = π/4, **ONE shared radius, solved ONCE for the S1–S3 union of extents and reused — S6 RETURNS to it (F6)**; the solve sweeps radius AND elevation together (scar `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed` — the `:50469-50474` build comment records why single-axis nudging fails; **do not nudge the default, add the surface**, per F-C4) | full rod span (±1.8 world) + gauges + labels in frame, clear of the HUD zones (`:50435-50466`) |
| S4 | same φ = 0.35 rad, same θ — a **DOLLY only** (radius change, no new elevation — P3-a/F6), framing the drum face | drum face + dot line + rim ring + labels in frame |
| S5 | φ = 0.35 rad, larger radius + target shifted along the glide line | glide run (1.40 m = 2.52 world) + one rod length margin each end, checked at t = 0, at the pin, and at state end (REV 1's framed-extent scar disposition, kept) |

Pose applies at state entry with an 800 ms closed-form ease (a declared framing move, Rule 32d;
settled before every pin with **≥ 2.2 s worst-case margin** — S1's earliest registered pin is
≈ 3.0 s and the ease ends at 0.8 s; the REV 2 “≥ 3.5 s” figure rode the wrong pin formula and
is corrected with it, F2 — so THE EYE's frozen frames stay byte-stable — Rule 36 / the F-C4
binding-rules paragraph). **Framing-move accounting (F6):** S1→S2→S3 move the camera NOT AT
ALL (one shared pose, so the apparatus never dollies at a guided click — Rule 32d); the **S4
dolly** and the **S5 glide pose** are the concept's ONLY declared framing moves; S6 returns to
the already-seen shared pose (a return, not a new framing). **Axle legibility under the
near-top-down pose (P3-c):** the axle (`:50305-50309`, 3.4 world tall, y −1.1…2.3) is seen
close to end-on at 69.9° elevation — it foreshortens to ≈ cos 69.9° = 0.34 of its height,
≈ 1.2 world on screen, still a legible short cylinder whose end face reads as the hub; the
concept needs the rotation PLANE, so the trade is right — one clause here so Checkpoint B is
not surprised. **Blast radius, stated plainly: every state of this concept is
[CAM]-tagged** — S1 (gauge constancy must be visibly true: under the pinned pose the projected
gauge length oscillates 1.0×–0.40× beside frozen labels, a live Rule 33d violation), S2 (the
claim IS the word "circle"), S3 (arcs compared as lengths), S4 (the drum FACE is the picture),
S5 (planar looping curve + glide framing), S6 (live circle rescale). **If the founder declines
the C8 row, this concept is not authorable as designed and gets re-scoped at that point** (the
F-C4 desk position); no authoring-side rewording is taken.

| State | Teaches (one idea) | Archetype | Authored beat (cause then effect; tier tags inline) | Delta cue | Live controls | Words | Ring |
|---|---|---|---|---|---|---|---|
| S1 [CAM] | Rigid = every internal distance stays the same while the body moves | `null-result-hold` | Turntable spins at the home pose `[LIVE :49945/:50671]`, seen from the near-top-down authored pose `[NEEDS-0c-3 C8]`. Two marked points appear on the SAME arm of the rod (F3a) — P₁ (r = 0.30), P₂ (r = 0.60), dot + label `[NEEDS-0c-3 C1]`; then two distance gauges draw at an authored standoff from the rod (offset + end ticks, P2-2; SIGNED per-gauge offsets +0.10 / −0.10 world, flanking the rod — F3c) — axle→P₁ = 0.30 m, then P₂→far-mass = 1.40 m (crossing the axis to the far mass on the opposite arm), each with a live length label `[NEEDS-0c-3 C5]`. The body keeps turning; the numbers HOLD to the last digit — and under the near-top-down pose the drawn gauge length visibly holds too (the P3-6 enrichment: the one thing that COULD have changed — the picture — now demonstrably does not). Narration: "a rigid body: the distances between its points never change" | **"One body, fixed distances"** | none | 30–45 | core |
| S2 [CAM] | Every point of the body moves in its own circle about the axis | `trace-draw` (coined) | Gauges hide; P₁ and P₂ each paint a circular trace over one revolution (4.19 s), inner circle small, outer large, concentric `[NEEDS-0c-3 C3]` — and under the authored pose they READ as circles (aspect 0.94), which is the whole claim. Traces persist. Anchor (~8 words, no speed claim): "each point of a ceiling-fan blade draws its own circle" | **"Each point draws a circle"** | none | 25–45 | core |
| S3 [CAM] | All points sweep the turn together — one angular speed ω — so the outer point covers a longer arc in the same time; twice the radius, twice the arc (PRIMARY AHA + the quantitative ratio, R1) | `arc-compare` (coined) | The axle→P₁ gauge re-shows, now NAMED as the radius r₁ = 0.30 m (offset +0.10 world), joined by axle→P₂, r₂ = 0.60 m (offset −0.10 world — the pair flanks the rod as two parallel bars, so "twice as long" reads bar against bar, F3c) `[NEEDS-0c-3 C5 — axis-to-marker form, P1-3b]`; a fixed start line appears on the base frame, authored at **start_line.angle_deg = θ(compare_window.from_ms)** (F3b — the body is AT the ray when the window opens; consequence: the window opens at 1.0 s ⇒ the next simultaneous crossing lands at 1.0 + 2π/1.5 = **5.19 s**, the authored flash; authored at θ(0) instead, the flash belongs at 4.19 s and the arcs detach from the line) `[NEEDS-0c-3 C4]`. CAUSE: the compare window opens (1.0 s in) — EFFECT after a readable beat: both swept arcs highlight and GROW together for the same Δt = 1.80 s, the outer visibly outrunning the inner; at window close the labels land: s₁ = 0.81 m, s₂ = 1.62 m `[C4]`. Then BOTH points cross the start line at the SAME instant, staged as a legible EVENT: the authored `crossing_mark_at_ms` flashes the start line + both markers `[NEEDS-0c-3 C4 — closes P2-5 item 4]`. Narration lands the ratio ("twice as far out — 0.60 against 0.30 — and exactly twice the arc, 1.62 against 0.81") and introduces **angular speed ω** ("the body has one angular speed ω — how fast it turns"; gloss once, bare after — P2-8); the ω HUD row reveals only after that sentence (`readout_at_ms` `[LIVE :50234-50241]`, row `[LIVE :50149]`; **authored `readouts: ['omega']` in THIS state and re-declared in every later state — P1-3a**). Anchor (~11 words, a DISTANCE claim needing no cash-out clause — F5): "on a merry-go-round, the rider at the edge travels the longest way round" | **"Same time, longer outer path"** | none | 45–55 | core |
| S4 [CAM] | The path depends on the radius ALONE — every point at one radius shares one circle; not just marked points, EVERY point (P2-4 re-point, adapted under R1: the claim S3's collinear markers structurally cannot show) | `populate-rule` (coined) | Camera DOLLIES to the drum-face view — radius only, same φ/θ as the shared pose (P3-a) `[NEEDS-0c-3 C8]`. On the drum: a radial LINE of five dots (r = 0.10…0.50 m) authored at **90° from the rod** — and therefore permanently 90° from the always-on drum stripe (`:50320-50327`), since dots, rod and stripe all ride the one spin group `:50298-50302`: the separation NEVER closes (P2-3) `[NEEDS-0c-3 C1 — angle_deg obligation]`. The line sweeps and stays perfectly straight (rigidity at scale) while each line dot paints its circle `[C3]` — five nested concentric circles; the eight RIM dots (all r = 0.50 m, authored at **22.5° + k·45°** — F4: spaced FROM 90° two dots would sit at 0°/180° under the rod, and the always-on stripe tip (`RBR_DEF_DRUM_R·W·0.92` = 0.506 m, `:50322-50326`) lands ON the 0.50 m ring; at the 22.5° offset the nearest dot clears the rod diameter AND the stripe tip by 22.5° = chord 2·0.50·sin 11.25° ≈ **0.195 m**) then light up riding the OUTERMOST circle — eight different points, one shared path. Labels: r = 0.10 m, r = 0.50 m (line end), r = 0.50 m on ONE rim dot at a different angle (P3-3). Focal (32e): the marker GROUP token **`rbr_marker_rim`** during the same-radius beat (F1 — the glow pass matches ONE string via `ud.id === focal || ud.elementType === focal`, `:50776`, with `glowActive = !!focal` at `:50773`, so a non-matching focal dims everything and brightens nothing; therefore each C1 marker's elementType IS its authored group token: the eight rim dots carry `rbr_marker_rim` and brighten as the focal, the five line dots carry `rbr_marker_line` and stay non-focal); the stripe is acknowledged as a permanent bright 13th element (in `RBR_ALWAYS_ON` `:50585`, brighten-only `:50782-50788` — it CANNOT dim): at 90° separation it reads as the body's own clock-hand, never the focal; residual glare flagged to THE EYE. Occlusion budget for the drum-face pose: the rod + masses (0.35 world above the face) cover the rod's own diameter line; the LINE dots co-rotate at ±90° from the rod and stay clear of it at every instant; the RING dots clear the rod diameter by the authored 22.5° offset (F4 — the REV 2 "every dot clears" claim held for the line only) | **"Same radius, same circle"** | none | 30–50 | extended |
| S5 [CAM] | General motion = the centre slides + the body spins about the centre; distances STILL fixed | `translate-through` | The rod (masses + markers) lifts off the axle and glides at constant velocity while spinning `[NEEDS-0c-3 C7 — see the honest cost cell + defer recommendation]`; **authored bounds (P2-9), as inequalities:** v_glide < ω·r_P₂ = 1.50 × 0.60 = **0.90 m/s** (else P₂'s curve loses its loops and the picture silently changes) — authored v_glide = **0.40 m/s** ✓; glide run = 3.5 s ⇒ **1.40 m**, framed by the authored S5 pose (run + one rod length margin each end) `[C8]`. The centre point traces a straight line while P₂ traces a looping curve `[C3 on the translating frame]`; the P₁→far-mass gauge stays pinned at 1.10 m through the whole glide `[C5]`. A co-moving highlight circle shows P₂ still just circling the centre `[C7]`. Loop: blank at **t = 11.0 s**, 1.0 s, replay (P3-5 given its number). Wording literal: "take the rod off its axle and set it moving" | **"Slide plus spin combined"** | none | 35–55 | advanced |
| S6 [CAM] | Sandbox | `drag-sandbox` | Free-running (Rule 37). Controls: **ω₀** slider (row `[LIVE :49999]`) driven through the **NEW non-restarting live-ω path `[NEEDS-0c-3 C10]`** — dragging it visibly speeds/slows the spin with the ω readout tracking every step and the painted circles repainting at the new rate; **no blank, no "restarting" badge, no θ teleport** (the current apply path — `input` → `rbrApplyParam :50115-50122` → `rbrRestartNow :50075-50078` → `evRepinT` + `rbrThetaReset :50053-50064` → `rbrBlanked :49896-49899` → em-dash `:50243` — blanks continuously for the whole drag and re-bases θ by ≈ t·Δω per event; correct for #10 where ω₀ re-pins L, WRONG here where τ = 0 and ω₀ IS ω — P1-4). And **a draggable marker radius r_point** (range 0.00–**0.65** m — clearance 0.061 m to the drawn mass, P2-1) `[NEEDS-0c-3 C6]`: dragging slides one marker along the rod; its painted circle rescales live `[C3]` and a live axle→point radius gauge reads r continuously `[C5 axis form]`; at r = 0 the circle collapses to a dot ON the axle — the point at the axis goes nowhere (the true-zero, surviving R1 as a PATH fact, not a speed fact). No restart on r_point either (markers massless — C1 contract). Idle auto-sweep on r_point until first trusted input `[C6; sweep plumbing consumes only param "r" today — :49852/:49858]`. **No formula surface** (R1). Deliberately NOT exposed: r, m, τ_brake — unchanged, endorsed at Checkpoint A ("do not revisit") | **"Try it yourself"** | ω₀ *(min_ring: core)* · r_point *(min_ring: core)* | 0 / open | *(explore)* |

**Archetype audit:** null-result-hold (S1) · trace-draw (S2) · arc-compare (S3) · populate-rule
(S4) · translate-through (S5) · drag-sandbox (S6). No repeat, no static state.

**S3 narration cut order (P3-4 — the most loaded state, named for physics_author):** inside
45–55 words S3 must open the window, land the aha, land the ratio, introduce ω and carry the
anchor. If it will not fit: FIRST cut = the merry-go-round anchor (it moves to S4, where the
whole-body picture still supports it); SECOND = the radius-renaming sentence compresses to a
clause ("r₁ = 0.30 m — the radius"). The aha sentence and the crossing counter are NEVER cut.

**Rule 32 legibility plan:** unchanged in discipline (cause-first per beat; only the taught
annotation layer changes; delta cues double as captions; one glow focal via `phases[]`
`[LIVE :50647-50656]`; markers/traces/gauges join the brighten-only solid set — which is the HARDCODED elementType list at `:50782-50788`, so "join" is a per-family C9(b) code edit, never a default (F1b — an unlisted type takes the dim branch at opacity 0.40, the "turntable as glass" case), scar
`state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach`). Camera moves are
declared framing moves at state entry only (32d; the C8 ease).

**Rule 33 macro-micro:** N/A-with-justification unchanged. Instruments (33d): the ω HUD row
(live, 2 dp, re-declared per state) and the live C5 gauge/radius labels, each at the span it
measures — and under the authored poses their drawn lengths now agree with their numbers (the
P1-1/S1 33d violation is closed by C8, not by wording).

**Rule 34 canvas budget:** top caption = the delta cue only. **NO formula surface in ANY state**
(R1: the concept's relation is a ratio, carried by paired on-canvas numbers — 0.30/0.60 beside
0.81/1.62; the algebraic relation v = ωr is #4's). All labels real Unicode (ω, ₁ ₂, m). Marker
and gauge labels value-only; HUD value-only (`:50144-50154`).

**Readout metrics (scar `derived_readout_asserted_by_value_without_defining_its_metric`):**
ω = `PM_rbrOmega` = L(t)/I(t) `[LIVE :49945, :50231]`, constant 1.50 in S1–S5 (no torque
authored); under the S6 C10 control ω = the slider value, re-anchored closed-form. Arc
s_i = r_i × swept angle on the engine θ (`rbrThetaAt` `[LIVE :49952]`) (C4). Radius gauges:
axle→marker = r_i by construction (C5 axis form). Cross gauges: 1.40 m = 0.60 + 0.80 collinear
through the axis; 1.10 m = 0.30 + 0.80 — constant by construction; their constancy under spin
(S1) and glide (S5) IS the taught claim (C5).

**Pin table (F2 — restated against the REAL rule, read at `deriveStateMeta.ts:3445` / `:3423` /
`:3215`): pin = clamp(max(registered reveal candidates), 1500 ms, 60000 ms).** There is **no
duration or loop-period term anywhere in it** — the REV 2 formula `clamp(0.60R, 150, R−150)`
was not real, an exact recurrence of the A6 class filed against this desk on this run (owned in
the SCAR AUDIT below). The rbr block (`:3128-3213`) accepts six sources — `param_ramp.end_ms`,
`external_torque` engage/release, `restart.at_ms`, `reference_marks[].at_ms`, `readout_at_ms`,
`phases[]` — and this concept authors NONE of the first four, so **TODAY S1 and S2 register no
candidate → `!rbrFound` → cushion → the 1500 ms clamp floor: S1 would pin with a gauge unbuilt,
S2 with the traces a third painted** (the renderer's own
`field3d_scenario_missing_maxreveal_block…` comment names this failure class). The new C1/C3/C4
timed elements reach the pin ONLY through C9(a)'s registration. **C9 registration, not margin
arithmetic, is what makes the frozen frame photograph the claim.**

| State | Last asserted reveal (design est.) | The C9 key that registers it | Resulting pin = clamp(max, 1500, 60000) |
|---|---|---|---|
| S1 | second gauge label ~3.0 s | C1 `label_at_ms` / C5 gauge-label cue → `F3D_REVEAL_KEYS` / `maxRevealForField3dState` via C9(a) | ≈ 3.0 s (unregistered today: 1500 ms — a wrong frame) |
| S2 | both traces closed ~5.2 s | C3 trace-complete (one revolution from trace start) via C9(a) | ≈ 5.2 s (unregistered today: 1500 ms — a wrong frame) |
| S3 | crossing flash ~5.19 s (arc labels 3.2 s) | C4 `crossing_mark_at_ms` via C9(a); `readout_at_ms` is already a live source (`:3128-3213`) | ≈ 5.2 s |
| S4 | rim-dot label ~4.5 s | C1 `label_at_ms` via C9(a) | ≈ 4.5 s |
| S5 | co-moving highlight ~6.0 s (detach 0.8 s, glide 0.8–4.3 s) | C7 highlight/loop keys via C9(a) — registered only if C7 lands | ≈ 6.0 s — precedes the 11.0 s loop reset by 5.0 s |
| S6 | free-running, no pin contract (Rule 37) | — | — |

physics_author recomputes each reveal instant at the engine step size, and C9(a) registers each
one — that registration IS the pin. THE EYE reads DENSE frames across the S2
trace growth, the S3 compare window and the S6 slider sweeps (scar
`teach_read_dense_ramp_frames_not_just_frozen`).

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots, both at the aha)

| Wrong belief | At | `misconception_watch` beat |
|---|---|---|
| "A point farther from the axis takes longer to get around" (longer path conflated with more time) | **S3** | belief: the outer point has more distance, so it must finish later · visual_counter: after sweeping visibly different arcs (0.81 vs 1.62 m), BOTH points cross the fixed start line at the same flashed instant (`crossing_mark_at_ms`) · one_line_fix: every point of a rigid body sweeps each turn together — one body, one angular speed ω |
| "It is one object, so every point of it covers the same distance" (one body ⇒ one motion ⇒ one path) | **S3** | belief: one body means the points all travel equally · visual_counter: two arc labels on one body over one shared window — 0.81 m against 1.62 m, at radius gauges 0.30 m against 0.60 m · one_line_fix: one turn together, but the farther point sweeps the longer arc — twice the radius, twice the arc |

*(REV 1's second watch lived on the deleted v-ladder state as a SPEED claim; under R1 the same
genuine belief is confronted as a DISTANCE claim, and it lands at S3 where the arcs are — both
pivots at the single aha state, within the 1–3 guardrail. S1, S2, S4, S5, S6 carry NONE.)*
**Placement stated out loud (P3-d):** both watch beats sit on ONE state by design — this
concept has ONE genuine pivot (the time/distance split at the aha) and the two rows are the
two halves of one belief, both biting at that pivot. Exact placement, not spraying; the 1–3
guardrail is satisfied at 2.
Named buildable primitives per belief (scar `field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive`):
start line + swept-arc highlights + labels + crossing flash (C4) on live traces (C3) with radius
gauges (C5). EPIC-C branches: **zero**.

## 5. `has_prebuilt_deep_dive` states (2)

**S3** (the primary aha + both misconception pivots + the ratio — the historic sticking point)
and **S4** (the generalization; "does this only work for the marked points?" is where the
population claim gets probed). Cache-hint only; V1.0 ships zero authored deep-dives (Rule 18).
*(REV 1's old-S4 pick rode the deleted v = ωr state; the exam-use concentration it named now
belongs to #4's deep-dive plan.)*

## 6. Drill-down clusters

**S3:** `outer_point_takes_longer` · `one_omega_all_points` · `arc_length_vs_time`.
**S4:** `same_radius_same_path` · `marked_points_vs_all_points` · `path_depends_on_radius_only`.
*(REV 1's `v_equals_omega_r_use` / `axis_point_speed_zero` / `omega_vs_v_confusion` move to #4
with the relation — R1.)*

## 7. `entry_state_map`

```
entry_state_map:
  foundational:   STATE_1 -> STATE_3   # definition, circles, the aha + the arc/radius ratio
  whole_body:     STATE_4
  general_motion: STATE_5
```

Default `foundational`. PRIMARY aha (S3) inside the foundational range ✓ — and under R1 the
foundational slice carries the concept's ENTIRE quantitative payload (the ratio), so no
exit-pill is needed. Re-derived from the new numbering, not renumbered in place.

## 8. Prerequisites (advisory — Rule 23; named per founder ruling R3)

**Ruling R3 implemented:** prerequisites are NAMED even where no concept JSON exists — Rule 23
makes them advisory and never gating, the validator has no referential check, and suppressing a
real dependency would make the graph lie. Carried as a stated assumption: the JSON-less ids below
are pre-registered (`4b289d4`) but unauthored; the UI's "Builds on X" pill for them stays
inert until they ship.

- `uniform_circular_motion` — SHIPPED. A single particle circling; this concept extends it to
  every point of one body.
- `centre_of_mass` (#1) and `motion_of_centre_of_mass` (#2) — JSON-less, named per R3. Advisory
  for S5 only (the "centre" term and the slide-of-centre picture).

**Provenance of the example ids (corrected at cycle 2 — F7; the question is CLOSED):** founder
ruling R3 is a PRINCIPLE — name real prerequisites even where no concept JSON exists. It was
given in the context of #9 `angular_momentum`, where the example ids `torque` and
`moment_of_inertia` genuinely apply. Those two ids reached THIS concept's dispatch through an
error in the dispatch prompt — not from the founder. #3 precedes #5 `torque` and #6
`moment_of_inertia` in the approved order (`phase0_survey.md:42-46`); #3 is THEIR prerequisite,
so naming them here would invert the dependency graph — the exact lie R3 exists to prevent.
#3's real dependencies are the three named above. Endorsed at Checkpoint A cycle 2 (§R-3); no
future edit to this section is invited.

## 9. Real-world anchor (Rule 35 / 38f — universal, culture-neutral; unchanged from REV 1)

**Primary: a merry-go-round — the rider at the edge travels the longest way round, yet everyone
completes the turn together.** A DISTANCE claim (F5): it asserts exactly what this concept
teaches (path length), so the REV 2 cash-out clause ("covers more ground in the same time")
disappears with the speed claim — relieving S3's word budget — and it plants nothing of #4's
speed frame. Assigned to **S3**, ~11 words inside its budget — it lands ON the aha,
pre-spoiling nothing. **Secondary: a ceiling-fan blade — each point of the blade draws its own
circle.** Assigned to **S2**, ~8 words; deliberately no speed claim. Both widest-syllabus-overlap
devices (38f); no region constants; no country-specific culture. The word "fastest" now appears
nowhere in the concept.

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the 6 of §2, exactly as tabled in §3.

**(b) Symbol-label table + term-introduction ledger (rebuilt under P1-3: r now has rows; ω names
the states that RE-DECLARE its readout, since each state authors its own `readouts[]` —
`:50158`/`:50233`, a row not re-declared is gone):**

| Quantity | Label | DEFINED at | First PRINTED at | Re-declared / persists |
|---|---|---|---|---|
| Marked point 1 | `P₁` (dot + label) | S1 ("we mark two points of the body") | S1 | S1–S6 |
| Marked point 2 | `P₂` | S1, same sentence | S1 | S1–S5 |
| Axle→P₁ distance | `0.30 m` gauge label | S1 ("the distance from the axle to P₁") | S1 | re-shown S3 as r₁ |
| Cross-body distance | `1.40 m` gauge label | S1 | S1 | S1 only |
| Circular trace | (drawn path, per-marker colour) | S2 ("each point draws a circle") | S2 | persists S2–S4; translating frame S5; live S6 |
| Start line | label "start" | S3, the same-time sentence | S3 | S3 only |
| **Radius** | `r₁ = 0.30 m` / `r₂ = 0.60 m` axis-gauges | **S3** ("the distance from the axle IS the circle's radius") | **S3** | S3; live axis-gauge again S6 (`r = …` tracking the drag) |
| Arc lengths | `s₁ = 0.81 m` / `s₂ = 1.62 m` | S3, at window close | S3 | S3 only |
| Angular speed | `ω` HUD row `1.50 rad/s` | S3 — "angular speed ω — how fast the body turns" (gloss once, bare after; P2-8) | S3, after that sentence (`readout_at_ms`) | **`readouts: ['omega']` authored at S3, S4, S5, S6 — each state's own array (P1-3a)** |
| Drum dot radii | `r = 0.10 m` / `r = 0.50 m` / `r = 0.50 m` (rim, different angle) | S4 | S4 | S4 only |
| Centre point | label "centre" | S5 ("the centre point of the body") | S5 | S5 only |

**No v row of any kind, and no formula row — R1.** json_author notes preserved from REV 1
(endorsed): every glow target names a primitive the state builds; `readouts[]` may name ONLY
`omega` from `RBR_RO_META` (`:50147`) — any unknown token is skipped IN SILENCE
(`:50162`/`:50163`, `:50236`/`:50237`); the Desk D loud-warn ask stays endorsed.

**(c) Right-hand-rule plan:** N/A-with-justification — no direction rule taught; ω/L axial
direction belongs to `angular_momentum` (#9).

**(d) Motion plan:** S1 spin + marker/gauge reveals with held values · S2 traces painting over
one revolution · S3 radius gauges, window-open, arcs grow, labels, flashed simultaneous crossing
· S4 camera to drum face, line sweeping straight, five circles painting, rim ring lighting · S5
detach, glide + spin, straight centre trace vs looping point trace, held gauge, co-moving
circle, loop at 11.0 s · S6 free-run + live-ω drags + r_point drag/sweep with live circle
rescale. No passive state; every number's metric defined (§3); every stated agent is a rendered
object.

**(e) Modes:** conceptual-only (Rule 20 [D]).

**(f)** `assessment` + `coverage_map` authored at 0d; `misconception_watch` exactly the 2 of §4.

**(g) Macro-micro:** N/A-with-justification per §3.

**(h) Canvas budget:** per §3 — delta-cue caption, value-only labels/HUD, ZERO formula surfaces.
New DOM/sprite surfaces follow the rbr zone map (`:50435-50466`); any new panel at `top:52px+`.

**(i) Curriculum-flex (Rule 38) — re-walked from scratch on the new numbering:**
- **(i-1) Preset-cut coherence:** *Hide advanced (drop S5):* S1–S4 + S6 — coherent; no surviving
  state references the glide or the centre term (defined only at S5); both S6 controls map to
  surviving states (ω₀ → S3's ω; r_point → S2/S3's circle-and-radius picture) ✓. *Hide
  advanced+extended (drop S4–S5):* S1–S3 + S6 — coherent; definition, circles, the aha and the
  ratio all survive; nothing surviving references the drum-face population or the glide ✓.
- **(i-2)** Explore surfaces CORE content only: no formula surface at all (R1); both controls
  min_ring core; every explore visual (circles, radius gauge, ω readout) is established S1–S3 ✓.
- **(i-3) `curriculum_tags` (claims, not facts):** CBSE/NCERT — covered (NCERT Ch.7 §7.1/§7.6),
  marked verified (the one authoring-time verification 38g permits). JEE Main core+extended ·
  NEET core · IB DP / A-level / AP Physics 1 — every cell `needs_teacher_verification: true`.
- **(i-4) Presets:** `full` = S1–S6 · `no_general_motion` = hide S5 · `core_only` = hide S4–S5
  (hide, never reorder; controls unaffected — both core).
- **(i-5) Graph axes:** no graph in any ring — N/A by design.

**Teacher-usability walk (scar `directive_no_gate_asks_whether_a_teacher_could_use_it`):**
(1) *Principle stated and shown in the assessed representation?* Yes — S1 states the rigid-body
definition in its exam wording; S3 states and shows the ratio reasoning (twice the radius, twice
the arc) that exam items on this concept use. (2) *First thing a teacher tries after the aha?*
"What about a point even farther out, or right at the axle?" — the S6 r_point drag covers
0.00–0.65 m continuously; at 0 the circle collapses to a dot. (3) *Definition precedes use?*
Yes — ledger §10(b).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `uniform_circular_motion` → S2: patched by one clause ("each point moves
like the single circling ball you have seen — but now they are all fixed together").
`centre_of_mass` → S5: one clause ("the centre — the balance point of the body"). No other
cliff; the S1 definition is self-contained.

**JEE-backwards trace (REBUILT under R1 — the REV 1 trace used v = ωr ratios, which are now
#4's).** *"A disc rotates uniformly about a fixed axis through its centre. P is at r from the
axis, Q at 3r. In one full turn: (i) the ratio of the angles swept by P and Q; (ii) the ratio of
the path lengths they trace; (iii) what path does a point ON the axis trace?"* (i) 1:1 — one ω,
all points sweep together → S3 (the flashed simultaneous crossing). (ii) 1:3 — arc ∝ radius →
S3 (the 2× ratio performed on screen with radii and arcs both labelled; the reasoning is
identical at any ratio). (iii) no path — it stays put → S6 (r_point → 0, the circle collapses to
a dot) with S2's concentric picture behind it. Distractor "the outer point takes longer" → the
S3 watch beat. Conceptual variant "is the path of a rim point a circle?" → S2 (fixed axis: yes;
a ROLLING wheel is #11 `pure_rolling`, different scenario). **Boundary, stated honestly: any
question requiring the numeric v = ωr relation is #4's trace (R1)** — this concept's trace
covers time/angle/path-length/shape questions, and covers them completely. No missing piece
inside the ruled scope.

**Misconception entry mapping.** Both beliefs confronted proactively per §4, both at S3.
Planting risk unchanged: S2's narration must not say the points "move together" without
qualification — physics_author writes "they turn together" (a time claim, not a speed or
distance claim), and S3 makes the time/distance split explicit one click later. New planting
risk under R1: S3's ratio sentence must compare ARCS, never speeds — under F5 the anchor
itself is a distance claim ("travels the longest way round"), so the word "fastest" appears
nowhere in the concept at all (§9).

## Block 2 — Aha-moment designation

- **PRIMARY aha, at S3 (unchanged — it MOVES WITH its surviving state):** *every point of a
  spinning body finishes the turn at the same moment — so the outer point covers more distance
  in the same time.* The on-canvas carrier of "more distance" is the labelled arc pair; the
  ratio (twice the radius, twice the arc) is the quantitative half of the same beat (R1).
- **SUPPORTING aha, at S4 (replaces the deleted v = ωr supporting aha):** *the radius is the
  ONLY thing that matters — every point at one radius shares one circle, wherever it sits on
  the body.* Total = 2.
- **Cohesion check:** the supporting aha generalizes the primary's variable (r) across the whole
  body; nothing stands alone.
- **Wrong-belief setup.** Primary: S1+S2 deliberately build "it is one body moving as one thing"
  (the rigidity beat makes the student CONFIDENT in oneness) — S3 breaks the one-distance half
  while keeping the one-turn half. Supporting: S2–S3 work entirely on marked special points,
  quietly planting "this is about the marks" — S4 breaks it with the population.
- **Foundational coverage:** S3 inside foundational (S1–S3) ✓.

---

## ENGINE REQUIREMENTS (0c-3) — desk C rows, REV 3

**Context.** The frozen 0c-1 contract (`:939-1059`) and implementation (`:49736-50790`) were read
end-to-end at REV 1; founder-proxy §A re-verified 23 cited ranges with zero false tags — those
citations carry forward unchanged. [LIVE] machinery consumed as-is: the closed-form spin engine
(`rbrOmegaAt` `:49945`, `rbrThetaAt` `:49952`), the ω HUD row + `readout_at_ms` gating
(`:50147-50154`, `:50234-50241`), `phases[]` glow staging (`:50647-50656`), the ω₀ slider row
(`:49999`), the exact-token visibility gate (`:50581-50632`), the apparatus mesh set
(`:50288-50412`), and the Rule-37 free-run player invariant. **No longer consumed (R1/P1-4):**
the formula surface (`:50570-50574` — zero formula states now) and the restart + re-pin blank
path (`:50053-50064`, `:49896` — replaced by C10 for this concept's explore).

**Contract preamble binding every row (unchanged):** all new config fields optional, absent =
byte-identical; legal-zero fields resolved by `typeof`, never truthiness; all motion closed-form
in state-local ms, accumulator-free (`:969-976`); meshes built ONCE from the union, per-state
VALUES read at apply.

**Corrections on record for Desk E (the three cross-desk facts REV 1 got wrong):**
1. **C2 (tangential v arrow + live v label) is WITHDRAWN from this concept's ask** and from its
   "also serves" claims. Under founder ruling R1 it belongs to **Desk D's #4
   `rotational_kinematics` ALONE** (`findings_d.md` §4 remains its sole owner; the survey engine
   row `phase0_survey.md:156` is its pricing line). REV 1's claim that C2 was a shared #3/#4
   build is CORRECTED IN WRITING here so the row is neither built twice nor dropped: it has
   exactly one owning desk (D) and one consuming concept (#4).
2. **C7's REV 1 cost cell ("large — but bought by #2 regardless") was FALSE for this wave** —
   see the rewritten cell below (P1-5).
3. **C8 was filed OPTIONAL-P2; it is BLOCKING** (R2/F-C4) — see below (P1-1).

| Row | Capability (scriptable knobs stated) | Consumed by | Also serves | Cost / survey citation |
|---|---|---|---|---|
| **C1 — body point markers** | `point_markers[]: { id, r_m (0 legal), angle_deg, plane: 'rod' or 'drum', label?, label_at_ms?/cue? }`. Massless annotations rigidly attached to the spin group — `rbrIOf` (`:49865`) untouched; adding, moving or dragging a marker never changes I, ω or L. **Each marker's elementType IS an authored GROUP token** (S4: `rbr_marker_rim` = the eight rim dots, `rbr_marker_line` = the five line dots) so a state's `glow_focal` can name a marker GROUP through the existing one-string match `ud.id === focal || ud.elementType === focal` (`:50776`) — a focal cannot enumerate objects (F1a); every group token joins the brighten-only solid list (`:50782-50788`) + the exact-token visibility list (C9). **NEW obligations (P2-1/P2-3):** (a) authored `angle_deg` honoured on the drum plane — the S4 line is authored at 90° from the rod so it never closes with the rod or the always-on stripe (all co-rotating); (b) marker placement states clearance to the drawn mass extent (mass spans r ± 0.089 m; every authored marker/drag range clears it by ≥ 0.061 m, §2) | S1–S6 | **#4** (Desk D §3's "mark on the rotating body") · #6 precedent | small |
| **C2 — WITHDRAWN (R1)** | — | — | **Desk D #4 ONLY** (`findings_d.md` §4; `phase0_survey.md:156`) | not in this concept's ask |
| **C3 — circular trace per marker** | Progressive paint from closed-form θ; persists across the state; per-marker colour; pure function of state-local t (the `rbrThetaAt` `:49958` rebuild discipline; bring-up probe: pin, rewind, re-pin ⇒ byte-equal pixels). **NEW (S6): live rescale under a marker-radius change** — the trace redraws at the new r within the same closed-form contract (no history, so a rescale is a re-evaluation, not a mutation). **Interface obligation (P3-1):** `cm_path_trace` exists ONLY in the contract comment (`:952`) — the TS interface (`:990-993`) declares `particles/parts/axis_select/axis_pair` only; C3/C7 must DECLARE their members (`bodies[]`, `cm_marker`, `cm_path_trace`, `fragment_trigger`) in the type, per `deferred_enum_members_must_be_declared_not_merely_unimplemented` | S2, S3, S4 (drum), S5 (both frames), S6 (live) | **#4** (Desk D §4 "optional circular trace, same machinery") · #2 later (trace core on a translating point) | moderate · **approved-at-0a, undelivered: `phase0_survey.md:155` prices "per-point circular traces at different radii" INTO 0c-1, which shipped without it (P2-6) — undelivered approved scope, not new scope** |
| **C4 — fixed start line + swept-arc highlight + arc labels + crossing flash, ONE authored window** | `{ start_line: {angle_deg, label}, compare_window: {from_ms, to_ms}, arc_labels: [{marker_id, at_ms?}], crossing_mark_at_ms }`. The start line lives on the BASE frame (the drum stripe `:50322` rides the spin group — verified unusable as a fixed reference). The `crossing_mark_at_ms` flash (start line + both markers pulse, via the phases-channel pattern) makes the simultaneous crossing a legible EVENT (P2-5 item 4) — two collinear markers crossing a ray is not salient by itself. ONE window per state; this concept authors exactly one, in S3. **Authoring constraint (F3b): `start_line.angle_deg` MUST equal θ at `compare_window.from_ms`** — the contract exposes them as INDEPENDENT fields, so the relation is stated here because the schema will not: the window opens at 1.0 s ⇒ the crossing lands at 1.0 + 2π/1.5 = **5.19 s** (the authored flash); authored at θ(0) instead, the flash belongs at 4.19 s and the arcs detach from the line | S3 | **#4** (Desk D §3's fixed base reference + swept angle between two rays — same machinery, reused for θ) | small (rides C3) |
| **C5 — distance gauge: marker↔marker, marker↔mass, AND axis↔marker (the radius form, NAMED — P1-3b)** | A drawn segment + live length label. **The axis-to-marker RADIUS form is an explicit contract member** — without it Desk E builds only the two-point form and r never reaches the canvas. **Standoff contract (P2-2):** every gauge draws parallel to its span at an authored offset (default 0.10 world units ≈ 0.056 m, lateral to the span; authorable per gauge) with end ticks — **and per-gauge SIGNED offsets are AUTHORED wherever one state draws two gauges (F3c: both such states here draw nested/collinear spans that stack into one line at a single default): S1 axle→P₁ +0.10 / P₂→far-mass −0.10; S3 r₁ +0.10 / r₂ −0.10 world, each pair flanking the rod as two parallel bars** — never superimposed on the rod cylinder (`:50345-50351`; masses at the same rodY `:50676`). Constancy is the POINT: the gauge must keep reading through spin (S1) and through the C7 glide (S5); the axis form must track a dragged marker live (S6) | S1, S3, S5, S6 | #1 precedent (parts-distance); otherwise this-concept-only — priced accordingly | small |
| **C6 — live marker-radius control** | `controls_visible` token **`r_point`** + slider row (reserved-slot `visibility:hidden` pattern `:50033`/`:50137`) + `param_ramp`/`idle_auto_sweep` for `param: "r_point"` (plumbing consumes only `param === "r"` today — `:49852`/`:49858`; any other param is a silent no-op). Dragging moves the marker + its C3 circle + its C5 axis gauge live; NO restart (massless). Range authored 0.00–0.65 (mass clearance, §2). Enum-reopen discipline unchanged from REV 1: 0c-3 re-closes `controls_visible` against the REMAINING served set (#4's controls per Desk D §5, #14's κ) in the declared/implemented split | S6 | **#4** (draggable point radius is its explore beat too) | small-moderate |
| **C7 — free-flight decomposition (advanced)** | Detach at an authored instant; constant-velocity glide while spinning (torque-free, gravity-free); centre trace (straight) + point trace (looping) in the world frame; co-moving highlight circle; loop reset via a brief blank. **HONEST COST CELL (P1-5, rewritten):** large; approved at 0a as a #2/#3 shared row (`phase0_survey.md:197, 229`), **NOT delivered by 0c-1**, and **#2 `motion_of_centre_of_mass` is NOT in this wave** — `4b289d4` registers eight ids and neither #1 nor #2 is among them; no desk state file, no skeleton. **In this wave C7 has exactly ONE consumer state (S5), and that state is the cuttable advanced ring.** **RECOMMENDATION, stated out loud: DEFER C7 — ship this concept core+extended (the `no_general_motion` preset), and let S5 land when #2 is authored.** The cut is clean: §10(i-1), verified at Checkpoint A (no surviving state references the glide; "centre" is defined only at S5; both S6 controls map to surviving states) | S5 | #2 (core consumer, WHEN authored) · #3 advanced (here) | **large — DEFER-RECOMMENDED this wave** |
| **C8 — per-state camera pose — BLOCKING (R2/F-C4; promoted from REV 1's OPTIONAL-P2)** | Contract = `_engine/findings_c.md` PASS 4 (F-C4): a config surface letting each state declare its pose (φ/θ/radius), applied on state entry alongside `applyRigidBodyRotationState` (`:50480` never touches the camera today; no camera field in `:977-1059`; the single pinned pose `:50475-50477`). Per-state poses authored in §3 (φ = 0.35 rad / aspect 0.94 with ONE shared radius for S1–S3 + S6, the S4 dolly, wide glide framing for S5 — F6/P3-a); entry ease 800 ms closed-form (Rule 32d declared move; settles before every pin with ≥ 2.2 s worst-case margin per the F2 pin table — Rule 36 / THE EYE byte-stability); **acceptance test (P3-b, closable without a judgment call): at t = 0, at the pin, and at state end — the full rod span (±1.8 world), every authored gauge and every label inside the frame, clear of the `:50435-50466` DOM zones; S4 adds the drum face + dot line + rim ring; S5 the glide run + one rod length margin each end;** any solve sweeps radius AND elevation together (`:50469-50474`). The chapter-wide question (one machine, opposite pose needs: #3 near-top-down vs #9 oblique) and the "do not nudge the default — add the surface" constraint are F-C4's — read PASS 4; NOT re-filed here. The existing OPEN row `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` is about the camera TARGET; F-C4 is about the POSE — append, don't merge. **Fallback: NONE. REV 1's "default view acceptable" clause is DELETED per the ruling; if this row is declined, the concept is re-scoped** | S1–S6 (every state) | #1, #2, #4, fleet-wide (F-C4) | moderate; **BLOCKING** |
| **C9 — registration co-edit, SAME change, every row above** | Unchanged from REV 1: (a) `deriveStateMeta.ts` — every new timed element (trace growth end, window close, arc labels, crossing flash, marker label cues, glide loop if C7 lands, the C8 entry-ease settle) registered in `F3D_REVEAL_KEYS` / `maxRevealForField3dState` / `deriveHoldExpectations`, both config shapes; (b) every new elementType in `RBR_ELEMENT_TYPES` + the overlay `flags` map (`:50586-50613`; rbr children bypass the generic matcher `:50581-50584`) **+ the focal-match tokens + the brighten-only solid list at `:50782-50788` — for EVERY new family (markers, traces, gauges): a family registered for visibility only takes the dim branch at opacity 0.40, and a focal naming an unregistered token dims the whole scene and brightens nothing (F1b)**; (c) no literal backticks in the emitted template; `npm run check:renderer-syntax` after every seam. **Plus the P3-1 TS-interface declarations (see C3)** | all states | all rbr concepts | obligatory rider |
| **C10 — NEW (P1-4): non-restarting live ω control for the turntable family** | For a state that teaches no L (τ = 0, I constant — ω₀ IS ω), the ω₀ slider's `input` path must NOT call `rbrRestartNow`: instead a **closed-form re-anchor** — θ_new(t) = θ(t_event) + ω_new·(t − t_event), L becomes I·ω_new — with **no `evRepinT` blank, no `rbrThetaReset` re-base, no "restarting" badge**; readouts and C3 traces track continuously through the whole drag. Opt-in per state (e.g. `omega_live: true`), so #10's restart semantics (ω₀ re-pins L, a genuine discontinuity) stay the default. The full defective path is traced with line numbers in §3 S6. **Relation to F-C3 (`findings_c.md` PASS 3), stated so Desk E scopes both:** F-C3 debounces the blank so a drag is less noisy — the restart still fires; C10 makes the restart NOT FIRE at all where the physics has no discontinuity. Different rows, both real. Probe: synthetic 3 s drag across the ω₀ range; assert no readout ever shows the blank glyph and drawn θ stays monotone (the Candidate-C probe shape) | S6 | **#4** (its explore drags ω too) · every future rbr sandbox teaching no L | small-moderate; **new this revision — TO BE FILED by the dispatching session (scope limit: this desk does not write `findings_c.md`)** |

**Explicitly NOT required (scope 0c-3 down, not up — updated):** `body_shape` variants (drum
face = disc; rim dot-ring = ring picture) · **the formula surface for this concept (R1)** ·
theta/alpha/W/**v** HUD rows (ω suffices; the v-HUD refusal was endorsed at Checkpoint A — "do
not revisit"; it now survives R1 trivially, there being no v to read at all) ·
`reference_marks[]` · `ke_bar` · any new torque source · any graph panel · any second body ·
**C2 (withdrawn to Desk D)**.

**Timed-surface count (P2-7 — counted, not asserted; the office question filed, not answered):**
the scenario's existing timed classes: `readout_at_ms`, `phases[]` at/until, `external_torque`
engage/release, `restart`, `reference_marks[].at_ms`, `param_ramp`. NEW authored timed FIELD
classes in this revision's ACTIVE ask: **(1)** C1 `label_at_ms`/cue per marker; **(2)** the C4
compare family (`compare_window` from/to + `arc_labels[].at_ms` + `crossing_mark_at_ms` — one
grouped family with three instants, counted as one class). The C8 entry ease is a fixed 800 ms
renderer constant, not an authored field (listed for honesty, not counted). C7's detach + loop
instants leave with the C7 deferral; C2's arrow cues leave with C2. **Count = 2 new classes**
(down from REV 1's implied five, via R1 + the deferral). The founder-signed fence
(`phase0_survey_amendment.md`, repeated in `APPARATUS_CONTRACT.md` §2) says the timed surface is
exactly TWO field classes and a third is the STOP-and-re-scope alarm — **written for 0c-2, with
no equivalent stated for 0c-1. Office question, for the dispatching session to file alongside
C10: does the two-timed-class fence bind 0c-1, and does it count cumulatively with 0c-1's
existing surface?** Not answered locally. **Fallback honesty (F8): there is NO design fallback for the cumulative
branch.** The previously named fallback (fold the C1 label cues into the per-element reveal
pattern; reveal the S1 labels un-timed) reduces the NEW count 2 → 1 and is inert exactly where
it would be needed — the scenario's existing timed surface is already six classes, so
cumulatively 6 + 2 = 8 and dropping to 7 changes nothing. If the fence binds cumulatively, the
concept re-scopes — the same outcome as a declined C8.

## PER-STATE x ENGINE-ROW WALK (both directions, re-run from scratch on the new numbering)

**Old → new mapping (scar `signed_engine_union_drops_items_its_own_state_table_still_consumes` —
the renumber obligation REV 1 recorded, now discharged):** S1→S1 · S2→S2 · S3→S3 · old S4
DELETED (its C1 axle-marker, C2 arrows and C3-persist consumption die with it; nothing else
consumed them uniquely — checked row-by-row below) · old S5→S4 · old S6→S5 · old S7→S6.

| State | Consumes [NEEDS-0c-3] | Consumes [LIVE] |
|---|---|---|
| S1 | C8 (pose), C1 (P₁, P₂), C5 (axle→P₁, P₂→far-mass), C9 | spin engine, apparatus, glow phases |
| S2 | C8, C1, C3 (two traces), C9 | spin engine |
| S3 | C8, C1, C3 (persisting), C4 (start line + window + arc labels + crossing flash), C5 (axis form: r₁, r₂), C9 | ω HUD row + readout_at_ms (`readouts: ['omega']` authored), glow phases |
| S4 | C8 (drum-face pose), C1 (drum line + rim dots, angle_deg 90°), C3 (five nested circles), C9 | spin engine, ω readout re-declared, glow phases |
| S5 | C7 (glide + co-moving circle + loop blank — DEFER-RECOMMENDED; state cut with its ring if deferred), C8 (glide framing), C3 (both frames), C5 (gauge through glide), C1, C9 | ω readout re-declared |
| S6 | C10 (non-restarting live ω), C6 (r_point + sweep), C1, C3 (live rescale), C5 (live axis gauge), C8, C9 | ω₀ slider row, ω readout re-declared, Rule-37 free-run |

Reverse: **C1** ← S1–S6 · **C3** ← S2, S3, S4, S5, S6 · **C4** ← S3 · **C5** ← S1, S3, S5, S6 ·
**C6** ← S6 · **C7** ← S5 (sole consumer this wave — the P1-5 fact, now visible in the walk
itself) · **C8** ← S1–S6 · **C9** ← all · **C10** ← S6. Every row claimed by at least one state
✓; every state claims at least one row ✓; no unclaimed row, no unbacked state; **the forward
direction now closes (P2-5):** the four orphaned visuals are resolved — old S4's "straight
envelope" died with its state (R1); the explore's live-growth claim is owned by C10; r/ω
visibility is owned by C5-axis-form + per-state `readouts` re-declaration; the S3 simultaneous
crossing is owned by C4's `crossing_mark_at_ms`.

**[LIVE] vs [NEEDS-0c-3] split, counted (the headline Desk E scopes from — restated per P2-5):**
**7 [LIVE] surfaces** consumed (spin engine · apparatus meshes · ω HUD row + readout_at_ms ·
phases/glow · exact-token visibility gate · ω₀ slider row · Rule-37 free-run), each cited by
line; the formula surface and the restart/re-pin path are NO LONGER consumed. **Engine rows
asked: 8 ACTIVE this wave (C1, C3, C4, C5, C6, C8, C9, C10 — C8 BLOCKING) + 1 DEFER-RECOMMENDED
(C7, sole consumer S5) + C2 WITHDRAWN to Desk D.** Zero of the 6 states is fully buildable
today — every state needs at least C1 + C8.

---

## SCAR AUDIT — REV 3

**Consultation status:** LIVE-table re-run attempted AGAIN at REV 3 and blocked by the same
Supabase 522 outage (13:40 UTC — the third same-day reproduction; see header; founder-proxy
§R-2 rules this handling honest and non-blocking); the SAME-DAY REV 1 consultation (63 / 83 /
85 / 1 rows; superset disposition, both directions) **carries forward in full** — every REV 1
disposition stands except the re-rulings below. The boundary claim is unchanged: nothing
outside the four queried result sets is dispositioned. The 0d session re-runs the four queries
before json-author starts.

**REV 3 note (cycle 2 — the F2 recurrence, owned):** F2 is an exact RECURRENCE of
`skeleton_pin_table_uses_a_pin_formula_the_target_renderer_does_not_use` (drafted against this
desk at `angular_momentum/founder_proxy_A.md` §6, A6) — the REV 2 pin table was re-derived from
scratch on the new numbering and re-derived with the same wrong rule, which is exactly why the
prevention rule must be checkable, not remembered. The table is now restated against the
primary source (`deriveStateMeta.ts:3445` / `:3423` / `:3215`). Per the cycle-2 report §4, the
dispatching session AMENDS the existing A6 draft (adds `rigid_body_rotation` to
`concepts_affected` + the same-run recurrence note to `root_cause`) — **no second class is
minted** (`bug_class` is the upsert key). The two NEW cycle-2 candidate rows (F1's
visibility-vs-glow-pass class; F3's asserted-coincidence class — `founder_proxy_A_cycle2.md`
§4) are the dispatching session's to file; this revision conforms to both prevention rules in
advance — F1: the C9 rider now enumerates ALL FOUR surfaces per new family (element-type list,
flags map, focal-match tokens, brighten-only solid list) and the S4 focal subset carries its
own group token; F3: every asserted coincidence/distinctness is reduced to authored numbers
next to the claim (same arm; start_line.angle_deg = θ(from_ms) with the 5.19 s consequence;
±0.10 signed gauge offsets; the 22.5° ring offset with ≈ 0.195 m clearance).

**REV 2 re-rulings (dispositions the findings showed defective, or mooted by R1/R2):**

| bug_class (verbatim) | REV 2 verdict |
|---|---|
| `skeleton_authors_a_second_timed_action_after_the_engine_buy_was_scoped_to_one_instant` | RE-RULED (was disposed by assertion — P2-7): new timed field classes now COUNTED = 2 (C1 label cues; the C4 compare family); the fence question is filed to the office via the dispatching session, not answered locally |
| `velocity_arrows_routed_through_a_force_arrow_map_collapse_their_ratio_and_cannot_draw_a_true_zero` | TRANSFERS with C2 to Desk D's #4 (R1) — no velocity arrow exists in this concept; the prevention rule binds Desk D's build |
| `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` | N/A now — no arrow of any kind is authored by this concept (R1) |
| `architect_authors_a_force_triangle_whose_ratio_exceeds_the_renderer_arrow_maps_dynamic_range` | N/A now — no arrows, no ratio-bearing lengths beyond gauges/traces whose lengths are the real geometry (Rule 29 compliant by construction) |
| `authored_lumped_constant_inconsistent_with_the_drawn_apparatus_geometry` | RE-RULED with numbers (P2-1): mass extent 0.711–0.889 m computed from `RBR_MASS_R` 0.16 world / 1.8 world-per-m; P₃ deleted; every surviving marker/drag range clears the mass by ≥ 0.061 m; clearances stated in metres in §2 |
| `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` | RE-RULED: that OPEN row is about the camera TARGET; the POSE gap is F-C4 (P1, filed at PASS 4 by the dispatching session). C8 is BLOCKING and its contract matches F-C4; this desk appends, never merges the two |
| `teach_visual_must_match_narration` | RE-RULED: satisfied VIA C8 (the engine fix), never via rewording — narrating an ellipse as a circle was considered and REJECTED (R2). Under the authored poses every shape/length claim is true in pixels (aspect 0.94) |
| `oncanvas_formula_asserts_a_value_the_renderer_cannot_show` | Mooted structurally: no formula surface exists in any state (R1); every printed symbol resolves to a rendered value in its own state (ledger §10 b) |
| `skeleton_asserts_a_held_comparison_value_at_an_instant_the_faster_body_has_already_passed` | Strengthened: the compared event is simultaneous by construction AND now flashed as an authored event (`crossing_mark_at_ms`), so the pin photographs a marked instant, not an inference |
| `frozen_frame_read_as_dense_series_continuation_on_translating_body` | Carried, still flagged to the EYE session for S5 — unchanged, but S5 is now DEFER-RECOMMENDED with C7; the flag activates only if C7 lands |

**Conformance to the five UNFILED candidate rows of `founder_proxy_A.md` §C (prevention rules
obeyed in advance of filing):**

| Candidate | Conformance in this revision |
|---|---|
| A — `skeleton_asserts_a_planar_shape_claim_under_a_fixed_oblique_camera` | Camera elevation stated WITH numbers per state (§3: sin(elevation) = 0.94 ≥ 0.7); the camera row is BLOCKING, never optional; the reword-the-claim alternative explicitly rejected |
| B — `skeleton_claims_a_relation_the_approved_spine_assigns_to_a_different_concept` | §1 resolves nothing unilaterally: it cites the founder ruling, the survey lines and commit `2443a74`; the relation left the concept entirely |
| C — `explore_control_tagged_live_but_its_engine_path_blanks_the_readout_it_exists_to_drive` | Both S6 controls traced from DOM event to readout write with line numbers (§3 S6); the defective path is named and the fix is an ENGINE row (C10), not a wording change; C10 carries the candidate's own probe shape |
| D — `engine_row_costed_as_bought_by_a_concept_that_is_not_in_the_authoring_wave` | C7's cell states: approved-but-undelivered (survey :197/:229), sharing consumer not in this wave, ONE consumer state here, defer recommendation explicit |
| E — `formula_surface_symbol_carries_no_rendered_value_in_the_state_that_prints_it` | No formula surface anywhere; the ledger carries a row for every printed symbol naming the state where its live value renders; ω's readout row is re-declared per state |

All other REV 1 dispositions (sections A/B/C of the REV 1 SCAR AUDIT, `skeleton_rev1.md`) stand
as written and are not repeated here; the REV 1 file is preserved verbatim for the audit trail.

---

## FIX-CYCLE-1 RESPONSE (rulings R1–R3 + P1-1…P1-5 + P2-1…P2-9 + P3-1…P3-6 × what changed × where — carried forward from REV 2; the R3 cell cross-corrected at cycle 2, F7)

| Finding | What changed | Where |
|---|---|---|
| **R1 / P1-2 (P1)** | v = ωr removed ENTIRELY: old S4 deleted (state count 7→6, contiguous renumber with old→new mapping); no v formula surface, no tangential arrows, no velocity ladder, no v labels anywhere; S3 now carries the whole quantitative payload as the arc/radius RATIO (0.30/0.60 beside 0.81/1.62, "twice the radius, twice the arc"); §1 rewritten around the ruling with the `2443a74` + survey citations (nothing settled unilaterally); entry map, rings, 16a beats, deep-dive picks, clusters, aha designation, JEE trace and both 38a cuts re-derived from scratch | §1, §2, §3, §4–§7, §10, Blocks 1–2, walk |
| **R1 consequence — C2** | C2 removed from the engine ask and its shared-build claim CORRECTED IN WRITING: Desk D #4 is its sole owner (`findings_d.md` §4, survey :156) — so Desk E neither builds it twice nor drops it | ENGINE corrections item 1 + C2 row |
| **R2 / P1-1 (P1)** | C8 promoted OPTIONAL-P2 → **BLOCKING**, contract matched to F-C4 (PASS 4 — read, kept consistent, NOT re-filed); per-state poses authored with numbers (φ = 0.35 rad, aspect 0.94; requirement sin(elevation) ≥ 0.90 stated); REV 1's "default view acceptable" fallback DELETED; every camera-dependent beat carries a **[CAM]** tag (all six states — blast radius stated plainly); the re-scope-if-declined position written into §3; the target-vs-pose distinction vs the existing OPEN row kept | §3 camera plan + control table, C8 row, SCAR re-rulings |
| **P1-3 (P1)** | r given rendered values: C5 gains the NAMED axis-to-marker radius form; radius gauges r₁/r₂ printed at S3 (the state carrying the ratio), drum-dot r labels at S4, a live axis gauge at S6; ω's readout row authored `readouts: ['omega']` at S3 AND re-declared at S4/S5/S6 (each state authors its own array — `:50158`/`:50233`); ledger rebuilt with r rows + a re-declaration column; displayed-numeral audit re-run over the union INCLUDING the radii | §10(b), §2 audit, §3, C5 row, walk |
| **P1-4 (P1)** | NEW engine row **C10** — non-restarting live ω control (closed-form re-anchor, no blank, no θ re-base, opt-in `omega_live` so #10's restart default survives); S6's beat rewritten to what C10 actually does (readouts track every step; no dashes, no teleport); the defective path traced end-to-end with line numbers; F-C3 overlap stated (debounce ≠ don't-fire — different rows, both real); ω₀ NOT dropped from the explore (the rejected workaround) | §3 S6, C10 row, walk |
| **P1-5 (P1)** | C7 cost cell rewritten honestly (approved at 0a — survey :197/:229 — NOT delivered by 0c-1; #2 not in this wave per `4b289d4`; ONE consumer state here, and it is the cuttable ring) + the recommendation stated out loud: **DEFER C7**, ship core+extended, S5 lands when #2 is authored | C7 row, ENGINE corrections item 2, walk |
| **P2-1** | Ladder re-tuned against the union: P₃ (0.90) DELETED (its purpose died with the v ladder; the 0.011 m mass collision vacated); S1's ambiguous P₁P₂ chord replaced by the axle→P₁ gauge (no equal-length neighbour, and it BECOMES r₁ at S3); the 0.90-echo gone with v; clearances stated in metres (mass extent 0.711–0.889 computed; every marker/drag range clears ≥ 0.061 m); audit re-run over the union including radii | §2 |
| **P2-2** | Standoff written into the C5 contract with a number: parallel to the span at 0.10 world (~0.056 m) authored offset + end ticks, never superimposed on the rod cylinder | C5 row, §3 S1 |
| **P2-3** | S4 dot line authored at 90° from the rod — and, because dots, rod and stripe co-rotate in one spin group, 90° from the stripe FOREVER (the separation never closes); the stripe acknowledged as a permanent bright 13th element that CANNOT dim (RBR_ALWAYS_ON + brighten-only), read as the body's clock-hand, never the focal; occlusion budget for the drum-face pose stated (rod + masses cover the rod diameter; co-rotating dots at ±90° stay clear); residual glare flagged to THE EYE | §3 S4, C1 row |
| **P2-4** | S5-old re-pointed and ADAPTED under R1: with v gone, "same radius, same speed" becomes **"same radius, same CIRCLE"** — the claim S3's collinear markers structurally cannot show, carried by eight rim dots riding ONE shared painted circle; title + delta cue renamed to say it; the graded nested-circles line kept as the supporting half; state and archetype kept per the reviewer's instruction | §2 table, §3 S4 |
| **P2-5** | Forward walk closed, all four: (1) the "straight envelope" died with old S4 (R1 — no owning row needed); (2) the explore's live-growth claim owned by C10; (3) r/ω rendered per P1-3 (C5 axis form + per-state readouts); (4) the S3 crossing staged as an authored EVENT via C4's `crossing_mark_at_ms`. Row count re-stated for Desk E: 8 active + 1 defer-recommended + C2 withdrawn | walk, C4/C10 rows |
| **P2-6** | Survey citations added per row: C3 cites `phase0_survey.md:155` (approved into 0c-1, undelivered); C7 cites `:197`/`:229` — undelivered approved scope, not new scope | C3/C7 rows |
| **P2-7** | Timed classes COUNTED (2 active: C1 label cues; the C4 compare family — down from REV 1's implied five via R1 + the C7 deferral; the C8 ease is a renderer constant, listed not counted); the fence question (does the 0c-2 two-class fence bind 0c-1?) FILED to the office via the dispatching session, not answered locally; a design fallback named but not taken | ENGINE timed-surface block, SCAR re-rulings |
| **P2-8** | "Angular speed ω" leads everywhere; the "turning rate" coinage removed from §1/§3/§4/ledger; gloss once ("how fast the body turns"), bare after | §1, §3 S3, §4, §10(b) |
| **P2-9** | Both S5 bounds authored as inequalities: v_glide < ω·r_P₂ = 0.90 m/s (looping condition) with authored v_glide = 0.40 m/s; framed extent = glide run 1.40 m + one rod length margin each end, checked at t = 0 / pin / state end under the AUTHORED C8 pose (the fallback-camera ±1.1 m cap is moot under R2 — the fallback no longer exists; if C8 is declined the concept re-scopes, which subsumes the bound) | §3 S5 + camera plan |
| **P3-1** | Interface obligation written into C3 (and C9): `bodies[]`, `cm_marker`, `cm_path_trace`, `fragment_trigger` must be DECLARED in the TS interface (`:990-993`), not merely implemented — comment-only members (`:952`) don't count | C3/C9 rows |
| **P3-2** | 38a ticked honestly: structural clauses verified; the content ladder named as qualitative → quantitative-by-ratio → extended → advanced decomposition; "no derivation to stage" stated with the reason (dθ/dt is #4's) | §2 |
| **P3-3** | Stated: the labelled rim dot sits at a DIFFERENT angle from the line's end dot (both r = 0.50 — two distinct points, one shared circle; the in-frame 0.50/0.50 pair IS the claim) | §2, §3 S4 |
| **P3-4** | S3 cut order named for physics_author: first cut = the merry-go-round anchor (moves to S4); second = the radius-renaming sentence compresses to a clause; the aha sentence + the crossing counter are NEVER cut | §3 S3, Block 1 |
| **P3-5** | S5 loop reset given its number: t = 11.0 s (blank 1.0 s, replay); pin at 7.2 s precedes it by 3.8 s | §3 S5 + pin table |
| **P3-6** | S1 kept (load-bearing, per the note) and enriched by the camera fix: under the near-top-down pose the DRAWN gauge length visibly holds alongside the held numbers — the picture itself becomes the thing that could have changed and doesn't (under the pinned pose it was oscillating 1.0×–0.40×, i.e. lying) | §3 S1 |
| **R3** | Prerequisites NAMED though JSON-less: `centre_of_mass` + `motion_of_centre_of_mass` (advisory, S5 only) alongside shipped `uniform_circular_motion`; carried as a stated assumption per the ruling. **Flag, not re-litigation:** the ruling's example ids `torque`/`moment_of_inertia` do not genuinely apply to #3 (they are DOWNSTREAM of it — #3 is their prerequisite); they are carried by the sibling `angular_momentum` where they genuinely apply. *(cycle-2 correction — F7: the example ids arrived via a dispatch-prompt error, not from the founder; the question is CLOSED — see §8)* | §8 |

## FIX-CYCLE-2 RESPONSE (F1–F8 + P3-a…P3-d × what changed × where)

| Finding | What changed | Where |
|---|---|---|
| **F1 (P1)** | S4's focal is now an ADDRESSABLE token: each C1 marker's elementType IS its authored GROUP token — `rbr_marker_rim` (the eight rim dots) vs `rbr_marker_line` (the five line dots) — matched by the existing one-string `:50776` elementType test, so the rim group brightens as the focal and the line dots stay non-focal (a focal cannot enumerate objects); C9's rider (b) extended to **the focal-match tokens + the brighten-only solid list at `:50782-50788`** for EVERY new family; the Rule-32 plan states that "join the brighten-only set" is a per-family C9 code edit, never a default. Landed as contract text INSIDE C1 + C9 — the row count does not drift | §3 S4 focal, §3 Rule-32 plan, C1 row, C9 row |
| **F2 (P1)** | Pin table restated against the real rule: **pin = clamp(max(registered reveal candidates), 1500, 60000)** (`deriveStateMeta.ts:3445`/`:3423`/`:3215`) — no duration/loop-period term; each row now reads "last asserted reveal → the C9 key that registers it → resulting pin"; the today-state stated (S1/S2 register nothing → 1500 ms → a wrong frame); **"C9 registration, not margin arithmetic, is what makes the frozen frame photograph the claim"** stated in bold; the camera-ease settle figure corrected 3.5 s → 2.2 s worst case (it rode the wrong formula); the recurrence OWNED in the SCAR AUDIT — the dispatching session amends the A6 draft, no second class minted | §3 pin table, §3 camera plan, C8 row, SCAR AUDIT |
| **F3 (P1)** | (a) P₁/P₂ stated on the SAME arm, with the reason (on opposite arms of the symmetric rod, `sides = [1,−1]` `:50355`, they cross a fixed ray half a revolution apart — the counter would render a lie); (b) **`start_line.angle_deg` = θ(`compare_window.from_ms`)** stated as a C4 authoring constraint with the consequence shown (window opens 1.0 s ⇒ crossing at 1.0 + 2π/1.5 = 5.19 s = the authored flash; at θ(0) it belongs at 4.19 s); (c) per-gauge SIGNED offsets authored — S1 +0.10/−0.10, S3 r₁ +0.10 / r₂ −0.10 world, each pair flanking the rod as two parallel bars (the reviewer's suggested solve, taken as-is). Landed inside C4 + C5 — the row count does not drift | §2, §3 S1/S3, C4 row, C5 row |
| **F4 (P2)** | Rim ring authored at **22.5° + k·45°** — clears the rod diameter (0°/180°) and the 0.506 m stripe tip; clearance stated: 22.5° = chord 2·0.50·sin 11.25° ≈ **0.195 m** at r = 0.50; the REV 2 "dots stay clear at every instant" claim scoped to the LINE dots only | §2, §3 S4 |
| **F5 (P2)** | Anchor rewritten as a DISTANCE claim — "the rider at the edge travels the longest way round" — the cash-out clause disappears with the speed claim (relieving S3's budget); "fastest" now appears nowhere in the concept | §9, §3 S3, Block 1 |
| **F6 (P2)** | ONE shared camera radius solved once for S1–S3 and reused (S6 returns to it); the S4 dolly and the S5 glide pose are the ONLY declared framing moves — the apparatus never dollies at a guided click | §3 camera plan, C8 row |
| **F7 (P2)** | §8 flag rewritten: R3 is a PRINCIPLE, given in #9's context; the example ids arrived via a dispatch-prompt error, NOT from the founder; #3's real dependencies are the three named; the question is CLOSED — the "one-line cycle-2 edit" invitation deleted, and the cycle-1 response row cross-corrected so no future reader inverts the graph | §8, FIX-CYCLE-1 R3 row |
| **F8 (P2)** | Said out loud: the named fallback reduces the NEW count 2 → 1 and CANNOT discharge the cumulative branch — the existing surface is already six classes, 6 + 2 = 8, and 7 changes nothing; there is NO design fallback for the cumulative reading — under it the concept re-scopes, same as under a declined C8 | ENGINE timed-surface block |
| **P3-a** | Named: the S4 camera move is a DOLLY (radius only, same φ/θ) — not a new elevation; json_author invents nothing | §3 S4, camera pose table |
| **P3-b** | C8's acceptance test named (rod span + every gauge + every label in frame, clear of the `:50435-50466` zones, checked at t = 0 / the pin / state end) — Desk E closes the row without a judgment call | C8 row |
| **P3-c** | One clause added: at 69.9° elevation the 3.4-world axle foreshortens to ≈ cos 69.9° = 0.34 ≈ 1.2 world — a legible short cylinder whose end face reads as the hub; the plane matters more, the trade is right | §3 camera plan |
| **P3-d** | Said out loud: both watch beats on ONE state is deliberate exact placement — one genuine pivot, two halves of one belief — not spraying | §4 |

**Net changes vs REV 2 (cycle 2): document edits only** — no state change, no ring change, no
cost change, no new engine row. The ask stays **8 active (C8 BLOCKING) + C7 defer-recommended +
C2 withdrawn**; F1 lands as contract text inside C1 + C9, F3b inside C4, F3c inside C5.

**Net changes vs REV 1:** state count 7 → **6** (old S4 deleted under R1 — a founder-directed
deletion, not a silent one); everything founder-proxy verified and endorsed is preserved — the
tier discipline with all 23 verified citations, the apparatus-contract compliance (explicit
r = 0.80 vs the 0.90 engine default), the v-readout refusal ("do not revisit" — now trivially
satisfied, there being no v at all), the S6 r/m/τ_brake exclusions, the coined archetypes, the
populate-rule state (re-pointed, kept), the clean advanced-ring cut, both anchors, and the S3
PRIMARY aha (which moves WITH its surviving state). The engine ask is restated for Desk E as:
8 active rows (C8 BLOCKING) + C7 defer-recommended + C2 withdrawn + C10 new (to be filed by the
dispatching session with the P2-7 office question).

---

## Deliverable summary (for the dispatching session)

1. **6 states** — definition (held gauges, near-top-down) → circles (traces) → same-time aha +
   arc/radius ratio (the whole quantitative payload, R1) → same-radius-same-circle population
   (extended) → slide+spin decomposition (advanced, rides deferred C7) → sandbox (live ω via
   C10 + draggable r_point). Every state [CAM]-tagged on the blocking C8 row.
2. **Tier split:** 7 [LIVE] surfaces (cited); **8 active engine rows** (C1, C3, C4, C5, C6,
   C8-BLOCKING, C9, C10) + **C7 defer-recommended** (sole consumer = the cuttable S5) +
   **C2 withdrawn to Desk D #4** (R1). Zero states buildable today.
3. **Engine rows ranked by consumers:** C1 markers (#3, #4, #6 precedent) · C3 traces (#3, #4,
   #2 later; survey :155 undelivered-approved) · C10 live-ω (#3, #4, every future rbr sandbox
   teaching no L) · C4 start-ray/window/crossing (#3, + #4's swept-angle machinery) · C8 camera
   (#3 BLOCKING; #1/#2/#4/fleet — F-C4) · C6 r_point (#3, #4) · C5 gauges incl. the radius form
   (#3, weak #1) · C9 rides every row · C7 glide (defer: #2, its core consumer, not in wave).
4. **For the dispatcher to file** (this desk does not write `findings_c.md`): the **C10 row**
   (non-restarting live ω; overlaps but is not F-C3) and the **P2-7 office question** (does the
   two-timed-class fence bind 0c-1?). Plus, from cycle 2 (`founder_proxy_A_cycle2.md` §4): the
   two candidate scar rows (F1's visibility-vs-glow-pass class; F3's asserted-coincidence
   class) and the AMENDMENT to the A6 pin-formula draft (add `rigid_body_rotation` to
   `concepts_affected`; no second class — `bug_class` is the upsert key).
5. **Standing corrections:** C2's REV 1 shared-build claim corrected (Desk D sole owner); C7's
   REV 1 cost cell corrected (defer-recommended); C8's REV 1 optional-P2 filing corrected
   (blocking, F-C4).

*Handoff: founder-proxy Checkpoint A re-review (fix cycle 2 resubmission — the LAST cycle; the §7 closure list is the gate). On DESIGN_OK: physics
block (this desk, wave-2 design), then HOLD until 0c-3 merges; the build resumes at json-author.*
