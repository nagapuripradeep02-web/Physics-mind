# ARCHITECT SKELETON — `rolling_friction` (Laws of Motion / Friction, Class 11 — rolling vs sliding contrast arc)

> Engine: `newtons_laws_body` field_3d scenario (docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md §1/§2 Branch A/§3/§4)
> + SEAM G (`bodies[].shape: 'block' | 'wheel'` — spec §6 extension flag 3, landed and verified 36/36)
> + `param_ramp` (shipped; block_on_incline/friction_force precedent).
> HARD CONSTRAINT honored: every state is a pure `newtons_laws_body` config block using only enumerated
> modes/keys/arrow kinds. **ZERO renderer edits. ENGINE GAP CANDIDATES: none confirmed — 3 verify items in the last section.**
> NEW id. Physics is UNCHANGED Branch A: rolling resistance IS f = μᵣN, authored as `mu_s`/`mu_k` ≈ 0.002 on the
> wheel body. `shape` is per-BODY-ID (mesh built once from the union of all states): id "A" is a block in every
> state, id "B" is a wheel in every state. Sources per catalog: NCERT Ch.5 §5.9 (rolling friction paragraph),
> DCM1 §8.7 (scope only). Catalog flag A11 `v1?: FALSE (depends on rotation)` is RESOLVED by design: this arc
> needs no torque, no moment of inertia, no angular acceleration — only that the wheel visibly rolls (SEAM G's
> position-derived spin), so it is Class-11 safe (lom_e_design.md §0).
> **Rule 41 applied throughout** — the design doc's draft cues ("Same push, different fate", "Load punishes
> sliding more", "All yours") are re-worded below; every reader-facing string is basic literal English.

## 1. Atomic claim
This concept teaches that rolling contact resists motion two to three orders of magnitude less than sliding
contact — same mass, same push, opposite outcome — because rolling resistance obeys the SAME law f = μᵣN with
μᵣ ≈ 0.002 against a sliding μₖ ≈ 0.4 — and only that; it does NOT cover rotational dynamics (no torque, no
moment of inertia, no angular acceleration — Topic 15; the wheel's spin here is a rendered kinematic fact,
never a dynamics claim), and it does NOT re-teach static vs kinetic friction (sibling `friction_force` owns
that arc — to keep exactly ONE coefficient per body in this story, the block is deliberately authored
μₛ = μₖ = 0.40, declared below).

## 2. State count + arc — 5 states

Simple concept; §5 calibration: simple = 3–4, medium = 5–6 — this sits at the boundary: one comparison
phenomenon + one law + one misconception kill + one load consequence = 4 guided beats + the mandatory explore
state. Founder directive honored: simple concept, built effectively, no padding.

| State | Purpose (one line) | teaching_method |
|---|---|---|
| S1 | Same mass, same 20 N push: the wheel crosses the whole track in ~2.4 s while the block crawls (PRIMARY aha) | (straightforward beat — omit field) |
| S2 | Same law, different number: f = μN for both — 19.6 N for sliding, 0.10 N for rolling, ~200× apart | (straightforward beat) |
| S3 | Rule 16a: "rolling means frictionless" is false — the coasting wheel IS slowing, and raising μᵣ stops it | misconception_confrontation (16a contrast beat) |
| S4 | Double the load, same push: the block cannot move at all (μₛN = 39.2 N > 20 N) while the wheel still rolls | (straightforward beat) |
| S5 | Explore: teacher drives m, m₂, F, v₀; idle F-sweep re-runs the race until seized | exploration_sliders |

2 bodies ("A" block, "B" wheel — SEAM G), `theta_deg: 0` throughout, no pulley, no hanging body, no `train`.
`advance_mode`: S1–S4 `manual_click`, S5 `interaction_complete` → 2 distinct (Gate 12/Rule 15); never
`wait_for_answer`/`pause_after_ms`. Rule 20: NO `mode_overrides`. EPIC-C branches: ZERO. Rule 19: ≥3
primitives/state by construction (surface + 2 bodies + arrows + label sprites + HUD + ≥3 JSON annotations).

## 3. Per-state control table (Rule 31 — REQUIRED artifact) + depth rings (Rule 38a)

| S | Teaches | Archetype | Delta cue (≤5 words, Rule 41-clean) | controls_visible | depth_ring | EN words | Duration |
|---|---|---|---|---|---|---|---|
| 1 | Identical push, identical mass: the wheel accelerates ~50× harder because friction takes 19.6 N of the block's 20 N push and only 0.10 N of the wheel's | `side-by-side-race` (coined, lom_e_design: two bodies translating simultaneously under identical drive with divergent displacement — distinct from `two-speed-glide`'s invariant-readout grammar and from `cycle-compare`'s temporal A→B→A′) | "Same push, different result" | `['F']` | core | 35–45 | 12 s |
| 2 | One formula covers both: f = μN; only the coefficient differs — μₖ = 0.40 vs μᵣ = 0.002; both bodies glide at the same speed while the formula surface and f readouts build | `reveal-build` | "Same formula, far smaller μ" | `['m']` | core | 35–50 | 12 s |
| 3 | Rolling friction is NOT zero: the coasting wheel's f readout reads 0.10 N and it is slowing; ramp μᵣ up 60× (soft ground, low tyre pressure) and the wheel visibly stops | `ramp-track` (the ramped cause is μᵣ, the tracked effect is the wheel's falling speed; no in-concept archetype repeat — S1/S4 are the declared pair) | "Rolling still has friction" | `['mu_k']` | extended | 40–55 | 12 s |
| 4 | Both frictions grow with load, but only sliding's growth matters: at m = 10 kg the block's maximum static friction (39.2 N) exceeds the 20 N push — no motion — while the wheel's friction is still only 0.20 N (DECLARED contrast pair with S1 — the delta names the flip: doubled load flips the block from slow slide to no motion) | `side-by-side-race` (contrast pair of S1) | "Heavier load, wheel still rolls" | `['m']` | extended | 35–50 | 11 s |
| 5 | Everything, teacher-driven; idle F-sweep 15→45→15 N re-runs the race live: below 19.6 N the block stays at rest while the wheel rolls; above it both move, far apart | `drag-sandbox` | "Change the values yourself" | `['m','m2','F','v0']` (ALL for this concept; **mu sliders excluded** — μₖ = 0.40 and μᵣ = 0.002 are the two contact types being compared, the concept's identity constants; a shared μ slider would overwrite both bodies and erase the contrast. **theta excluded** — flat concept, incline belongs to `block_on_incline`) | core (explore, Rule 38b) | 0 / open | open |

**State-idea distinctness (the gap automated gates miss — answered per state, per the friction_force old-S4 cut):**
- S1 proves the PHENOMENON exists: a ~200× friction gap produces opposite outcomes. Not derivable — nothing precedes it.
- S2 proves the MECHANISM is the same law, not different physics: f = μN with a tiny coefficient. Not derivable from S1 — S1 shows outcomes, S2 shows why (the formula + the two numbers appear here first, μᵣ never pre-spoiled in S1's canvas).
- S3 proves the number is NONZERO and surface-dependent by a new MANIPULATION: the wheel decelerates under it, and ramping μᵣ 0.002→0.12 stops the wheel mid-track. Not a re-read of S2's readout — S2 shows a static number, S3 shows its consequence changing motion, driven by a variable the teacher owns.
- S4 proves the LOAD consequence: f = μN means both frictions double with N, but only the sliding side's growth crosses the push — motion → no motion is a new physical outcome under a new condition, and it is the real-world payoff (why every heavy thing has wheels). Not a number-reading: the block's outcome CLASS changes.
- S5 is the sandbox (Rule 31 explore-last).

No archetype repeat except the ONE declared S1/S4 pair. No static state: S1/S4 race, S2 dual glide + build,
S3 ramp-decay, S5 free-runs (Rule 37 player invariant).

## 4. Per-state engine spec (closed enums + SEAM G + shipped `param_ramp` only)

**Global numbers + the HARD ARITHMETIC (computed, not guessed):** g = 9.8. Body A (block): m = 5 kg,
μₛ = μₖ = 0.40 (deliberately equal — see §1). Body B (wheel, `shape: 'wheel'`): m = 5 kg, μₛ = μₖ = 0.002.
N = 49.0 N each at m = 5.

- **Break-away check (the lom-c/lom-d slider lesson, done up front):** block moves only when F > μₛmg =
  0.40·5·9.8 = **19.6 N**. Authored race push **F = 20.0 N** → drive 20.0 > 19.6, block genuinely moves ✓
  (margin 0.4 N is a fixed authored constant compared against 19.6 — deterministic, not a ramp grazing a
  threshold; float-safe).
- **The race:** block a = (20 − 19.6)/5 = **0.08 m/s²**; wheel f = 0.002·49 = 0.098 N, a = (20 − 0.098)/5 =
  **3.98 m/s²** — a **~50×** acceleration gap from a **200×** friction gap (19.6/0.098).
- **F slider range (slider_controls):** min 0, max **50 N**, step 0.5, default 20. Computed: the sandbox must
  unstick the heaviest block, μₛ·m_max·g = 0.40·10·9.8 = 39.2 N → max 50 clears it with margin. Widened NOW,
  not as a fix cycle. m/m₂ sliders: 1–10 kg, step 0.5, default 5. mu_k slider: 0–0.5, **step 0.002** (a 0.05
  step could never express the wheel's 0.002 — json_author note). v₀: −5…5 m/s, step 0.5, default 0.
- **Motion budget (track = `length_m: 6` → bounds −6…+6; both bodies home at −5 → 11 m run):**
  S1: wheel exhausts 11 m at √(2·11/3.98) = **2.35 s** (v = 9.4 m/s), halts at the bound, narrated; block at
  12 s has covered ½·0.08·12² = **5.76 m** → ends at +0.76, mid-track, visibly moving the whole state (v end
  0.96 m/s) — the frozen pin captures wheel-parked-far-ahead vs block-mid-crawl, a legible contrast frame.
  S2: both glide at 1.0 m/s → reach the bound at 11 s of a 12 s state, halt narrated.
  S3: wheel v₀ = 1.5 m/s from −5, F = 0. Phase 1 (0–3 s, μᵣ = 0.002): a = −0.0196 m/s², covers 4.41 m → at
  −0.59, v = 1.44. Phase 2 `param_ramp` μᵣ 0.002→0.12 across 3–9 s: a(τ) = −0.0196 − 0.193τ → v = 0 at
  τ = 3.77 s (t ≈ **6.8 s**), covering 3.57 m → stops at **+2.98**, inside the bound ✓; holds (drive 0 ≤ μₛN)
  for the remaining narration (reveal_hold).
  S4: block STUCK (drive 20 ≤ maxStat 39.2; f readout 20.00 static); wheel f = 0.196 N, a = 1.98 m/s² →
  exhausts 11 m at 3.33 s, halts narrated.
- **Arrow floor scar (~15 N min-length clamp — block_on_incline lesson): the wheel's friction (0.098–0.196 N)
  is NEVER drawn as an arrow in any guided state** — a min-clamped arrow beside the block's 19.6 N arrow would
  visually lie about a 200× ratio. The tiny value lives in the HUD f row, and the narration says so plainly:
  "the wheel's friction is too small to draw at this scale — read the number: 0.10 N." Every DRAWN arrow ≥ floor:
  S1 applied 20.0 both ✓ block friction 19.6 ✓ · S2 block applied 19.6 ✓ block friction 19.6 ✓ (wheel's 0.098 N
  applied also not drawn — HUD) · S3 weight 49 ✓ normal 49 ✓ (applied 0 zero-hidden; wheel friction not drawn) ·
  S4 applied 20 both ✓ weight 98 both ✓ block friction 20.0 ✓. Sandbox arrows live; engine min-clamp on small
  values accepted there and noted for eye_walker.

Common: inert `field_lines` block (type requires it). EVERY state authors a NEAR SIDE-ON `camera_position` on
ONE shared distance (projection-blindness scar; flat scene, z-lane separation must read). One short Unicode
formula line per state (`#nlb_formula` width scar). `glow_focal` always a specific id. `surface.theta_deg: 0`,
`length_m: 6` everywhere. S3's ramp: state's own `mu_k` = ramp `from` = 0.002 (the documented contract).
Two independent bodies, NO pulley → own z lanes (fix ff408ed).

| S | mode | config (key values) | arrows (show) | readouts (≤4 rows) | formula (one line) | glow_focal | motion notes |
|---|---|---|---|---|---|---|---|
| 1 | `accelerate_applied_force` | A block 5 kg μ .40/.40 at −5 lane 1, F 20 · B wheel 5 kg μ .002/.002 at −5 lane 2, F 20 | A: applied, friction · B: applied (equal-length 20 N pushes make "same push" VISIBLE; shapes make the compared variable VISIBLE — block vs spoked wheel) | `f`, `v` per body (4 rows) | `a = (F − f)/m` | phases: 0→6000 ms `nlb_body_B`, 6000 ms→ `nlb_arrow_A_friction` (one focal at a time; glow handoff only) | wheel finishes 2.35 s, parks; block crawls all 12 s; cause-first: both 20 N arrows visible from frame 0, displacement divergence follows as v builds |
| 2 | `accelerate_applied_force` | home pose (32d) · A: v₀ 1.0, F 19.6 (= fₖ → a = 0 glide) · B wheel: v₀ 1.0, F 0.098 (= fᵣ → a = 0 glide) | A: applied, friction (B's 0.098 N arrows sub-floor — HUD only; the absence IS the lesson, named in narration) | `f`, `F_applied` per body (4 rows) | `f = μN: μₖ = 0.40, μᵣ = 0.002` | `nlb_arrow_A_friction` | matched-speed glide, formula surface + labels build in sequence (reveal-build); m drag (block) scales block f with N live — true physics, glide breaks, acceptable; bound at 11 s, halt narrated |
| 3 | `coast_with_friction` | A block `ghost: true` parked at −5 lane 1 (home-pose continuity, never integrated) · B wheel: v₀ 1.5 at −5, F 0, μ .002/.002 · `param_ramp {param:'mu_k', from:0.002, to:0.12, start_ms:3000, end_ms:9000}` (single integrable body → the mu_k write is unambiguous by construction) | B: weight, normal (both 49 N ✓ floor; friction sub-floor → HUD) | `f`, `v`, `a` (3 rows, one body) | `fᵣ = μᵣN` | `nlb_body_B` | 0–3 s: near-constant coast, f pinned 0.10 N — NOT zero (the confrontation); 3–9 s: μᵣ climbs (cause: the slider value + f readout rise first), wheel visibly slows (effect), stops at ~6.8 s at +2.98, holds; teacher may seize the mu_k slider (trusted input cancels the ramp) |
| 4 | `accelerate_applied_force` | home pose · A block 10 kg at −5 lane 1, F 20, at rest · B wheel 10 kg at −5 lane 2, F 20 | A: applied, weight, friction (20.00 N static — the readout of a force that HOLDS) · B: applied, weight (98 N weight arrows are double S1's — the load is VISIBLE, not merely labelled; wheel friction 0.196 N sub-floor → HUD) | `f`, `v` per body (4 rows) | `f = μN (N = mg)` | `nlb_body_A` | block never moves (drive 20 ≤ 39.2) — a within-pair null outcome, not a static state: the wheel rolls off beside it (finishes 3.33 s); f rows read 20.00 vs 0.20; narration is careful: the wheel is slower than S1 because it is heavier (a = F/m), NOT because rolling friction grew — its friction doubled to 0.20 N and still does not matter |
| 5 | `sandbox` | A block 5 kg F 15 at −5 · B wheel 5 kg F 15 at −5 · `trusted_drag_seizes: true` · `idle_auto_sweep {param:'F', range:[15, 45]}` (range[0] = the state's own F — first frame must not step) | A: applied, friction · B: applied (live; engine zero-hides; min-clamp on tiny values noted) | `f`, `v` per body (4 rows) | `f = μN` | `nlb_body_B` | free-run (Rule 37); the F triangle crosses the block's 19.6 N break-away both ways → block sticks/slips while the wheel always runs; m/m₂ drags re-stage S4's flip live; v₀ restages S3's coast |

Rule 32 per state: cause first (S1/S4 the push arrows are on screen at frame 0 and displacement follows as
velocity builds; S3's slider value + f readout climb before the wheel visibly slows); only the taught variable
moves (S3's block is ghost-parked; S2's glide is the constant backdrop for the formula build); the same
floor + block + wheel apparatus persists from home pose −5/−5 across all five states; ONE specific-id glow
focal. Rule 33: N/A-macro — the taught variables are the on-screen forces; the real-number duty is met by live
`f`/`v`/`a`/`F_applied` readouts (33d). The microscopic origin of rolling resistance (contact-patch
deformation) is narration + deep-dive material ONLY — never an asserted visual we do not render. Rule 34:
prose in the strip below; on-canvas = delta cue + ONE Unicode formula + value-only HUD (μₖ, μᵣ, fᵣ, ₖ, ₛ, ², ≈,
×, − — never ASCII). Rule 41: every string in this skeleton passes the second-language-reader test; forces
never want, answer, win, or grip anywhere in titles, cues, or narration briefs.

State titles (Rule 41d — short, literal, first words carry meaning):
S1 "Same Push: Rolling Moves Much Farther" · S2 "Same Law, Much Smaller Coefficient" ·
S3 "Rolling Friction Is Not Zero" · S4 "Heavier Load: Sliding Stops, Rolling Continues" ·
S5 "Explore: Change Every Value".
Concept name: "Rolling Friction — Rolling Resists Motion Far Less Than Sliding".

## 5. Misconception plan (Rule 16a — pivots only; EPIC-C = zero)

1. **S3 — "a wheel has no friction / rolling means frictionless" (the concept's target belief; planted by
   everyday phrases like 'frictionless bearings').** THE pivot. Contrast beat: the coasting wheel's f readout
   reads 0.10 N — not zero — and the v readout is falling; then μᵣ ramps up 60× and the wheel stops mid-track.
   visual_counter = "the f readout is 0.10 N while the wheel coasts, and the v readout falls the whole time —
   zero friction would keep v constant forever"; one_line_fix = "rolling friction is small, not zero — f = μᵣN
   with μᵣ about 0.002, and it grows on soft or deformed surfaces." S2 is the planting-prevention beat (the
   nonzero 0.098 N appears on a readout before any coasting is shown); narration mentions ball bearings ONLY
   as a spoken example of making μᵣ small — never an asserted visual (per brief).

No other state carries a misconception_watch (founder guardrail 2026-07-04: 1–3 genuine pivots; this concept
has exactly one genuine wrong belief — S1/S4's content is surprising but not a held misconception).

## 6. `has_prebuilt_deep_dive` picks + drill-down clusters (cache hints, not gates)

- **S2** (why is μᵣ so small — the mechanism question a comparison always raises):
  `rolling_resistance_origin_deformation`, `mu_r_typical_values_tyres_rails`, `rolling_vs_ball_bearings`
- **S3** (the misconception's long tail): `rolling_friction_not_zero`, `why_rolling_objects_stop`,
  `mu_r_depends_on_surface_and_pressure`

All 5 states still show the Explain button; un-flagged states route to the feedback form (Rule 18). Same
states as the Pass-1 cliff sentences — cross-reference consistent.

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational:         STATE_1 → STATE_2   # the comparison + the law f = μᵣN
  rolling_has_friction: STATE_3             # "does a wheel have friction?"
  load_effect:          STATE_4             # heavier load, rolling vs sliding
  explore:              STATE_5
```

Default aspect = foundational. PRIMARY aha (S1) ⊂ foundational — coverage rule satisfied, no exit-pill.

## 8. Prerequisites (advisory only — Rule 23)

`friction_force` (this branch — f = μN, the sliding coefficients, break-away at μₛN; this concept's block IS
that concept's block), `normal_force` (this branch — N = mg on flat ground; both frictions ride on N),
`newton_second_law` (this chapter — the race is a = F_net/m read twice). `block_on_incline` is unrelated here
(flat concept, theta fixed 0, no theta control anywhere including the sandbox).

## 9. Real-world anchor (Rule 35/38f + Rule 41 plain English) + curriculum-flex block (Rule 38)

**Primary: a suitcase with wheels versus dragging the same suitcase.** Dragging it across the floor takes a
large steady pull, and stopping for a moment means starting again is hard. Tip it onto its wheels and one
finger keeps it moving. Same suitcase, same weight, same floor — the only change is rolling contact instead of
sliding contact. That single change divides the friction by about two hundred, and it is the whole reason
heavy objects are moved on wheels. **Secondary: a loaded trolley or cart** — the heavier the load, the more
dragging becomes impossible while rolling stays easy (S4's exact content). Both universal, culture-neutral,
age-appropriate, physics-true at depth; wheels/suitcases/trolleys exist on every syllabus's home ground (38f).
No places, brands, currency, festivals, or names anywhere in captions, labels, or narration. Ball bearings:
narration mention only.

**Curriculum-flex (Rule 38, i-1…i-5):**
- **Rings:** S1–S2 core, S3–S4 extended (contiguous), advanced ring EMPTY (declared — no calculus/derivation
  content in this concept; contiguity satisfied vacuously), S5 explore = core-only surface.
- **Cut check 1 (hide advanced):** no-op — identical lesson. **Cut check 2 (hide advanced+extended):**
  surviving S1→S2→S5 is coherent — S1 shows the phenomenon, S2 names the law and both coefficients, S5's
  formula `f = μN` and every symbol it uses (f, μ, N, m, F, v) is established in S1–S2; no surviving
  narration/caption/formula references S3's μᵣ-ramp or S4's load flip.
- **Explore = core-ring only (38b):** S5 formula/labels/readouts use only core symbols ✓.
- **`curriculum_tags`:** CBSE/NCERT (Ch.5 §5.9 names rolling friction and that it is much smaller than
  sliding) = verified-at-authoring (38g); IGCSE / IB / AP-Physics-1 / UK-A-level cells authored as claims with
  `needs_teacher_verification: true`.
- **Preset proposal (hide, never reorder — 38h/25d):** `full` = S1–S5; `core_intro` = S1, S2, S5.
- **Graph-axis conventions (38e):** N/A — no graph in this concept; decided as not-applicable, not deferred.

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** as tabled in §3/§4. **(b) Symbol-label table:** `mg` (weight arrows, S4) · `N` (normal arrow,
S3) · `F` (applied) · `f` (block friction arrow; engine label; HUD rows "f block" / "f wheel") · `μₖ = 0.40` /
`μᵣ = 0.002` (formula surface, S2 on) · `m` · `a` · `v` — narration names each once before relying on it; NO
`T` anywhere (uncoupled bodies); wheel body label "wheel", block "block" (plain words, Rule 41). **(c) RHR
plan:** N/A — no cross products (documented, not TBD). **(d) Motion plan:** the archetype + motion-budget
columns in §3/§4 — no static state; every burst's arithmetic shown; every halt choreographed as the end of the
run; the wheel's spin is SEAM G position-derived (visible via hub + crossed spokes), byte-stable under freeze.
**(e) Modes:** conceptual EPIC-L only (Rule 20 [D]). **(f) assessment + coverage_map + misconception_watch:**
authored. Assessment plan (4 items): (i) a 5 kg body is pushed with 20 N — find a sliding (μₖ = 0.4 → f =
19.6 N, a = 0.08 m/s²) and rolling (μᵣ = 0.002 → f ≈ 0.10 N, a ≈ 3.98 m/s²) → S1/S2; (ii) what is the rolling
friction force on a 5 kg wheel on level ground → f = μᵣN ≈ 0.10 N, not zero → S2; (iii) why does a freely
rolling wheel on level ground eventually stop → rolling friction is small but not zero → S3; (iv) the load is
doubled to 10 kg with the same 20 N push — what happens to each body → sliding body stays at rest (μₛN =
39.2 N > 20 N), wheeled body still accelerates (f = 0.20 N) → S4. `coverage_map` i→S1, ii→S2, iii→S3, iv→S4;
`non_assessed_states` = S5. **(g) Macro↔micro (Rule 33):** N/A-macro — live force readouts carry the
real-number duty (33d); the deformation mechanism stays narration/deep-dive, never an asserted visual.
**(h) Canvas budget (Rule 34):** ONE Unicode formula line per state as tabled, ≤5-word delta cues, value-only
HUD (max 4 rows everywhere). **(i) Curriculum-flex block:** §9 above, complete. Registration (spec §8): sites
1–6; NOT `PCPL_CONCEPTS`; new concept, no retrofit clause, no synonym redirects needed.

## Two-pass cognitive lens

**Block 1.** Prerequisite cliffs: `friction_force` missing → S1's "friction takes 19.6 of the block's 20
newtons" — one clause "sliding friction is the coefficient times the normal force, here 0.40 × 49 N";
`normal_force` missing → S2's N — one clause "the floor pushes up with N = mg, 49 newtons here";
`newton_second_law` missing → S1's acceleration gap — one clause "the leftover force divided by mass sets the
acceleration, a = F_net/m". Cliff states = the deep-dive picks (S2, S3) plus S1's clauses — divergence on S1
documented: S1 is the aha state, its cliffs are patched by clauses, not a deep-dive.

JEE-backwards trace: *"A 5 kg crate needs 20 N to keep sliding (μₖ = 0.4). The same crate on a wheeled
platform of negligible mass rolls with μᵣ = 0.002. Find the friction force and acceleration in each case, and
the minimum push to move each from rest."* Pieces: f = μN both regimes (S2) · sliding a = (F − μₖN)/m (S1) ·
rolling a = (F − μᵣN)/m (S1/S2) · minimum push = μₛN per contact type (S1's break-away arithmetic, S4's
threshold flip) — all delivered; no missing piece, no state added.

Misconception-entry mapping (16a): "rolling means frictionless" arrives from everyday speech, not from our
sentences; S2 prevents planting (the 0.098 N readout is on screen before any coasting claim), S3 confronts
with the contrast beat (nonzero readout + falling v, then the μᵣ ramp stops the wheel). 16b fallback: none
(EPIC-C = zero per directive).

**Block 2.** **PRIMARY aha (S1, the 10-year memory):** *same mass, same push — the wheel crosses the whole
track while the block crawls, because rolling friction is about two hundred times smaller; that is why heavy
things are moved on wheels.* **SUPPORTING aha (S4):** *load makes sliding impossible before it makes rolling
even noticeably harder — both frictions grow with weight, but only the sliding one matters.* Cohesion: S4 is
S1's consequence at scale and lands the anchor's payoff; 1 + 1 = sweet spot. Wrong-belief setup: students
arriving from `friction_force` carry the confident calibration "friction is roughly μ ≈ 0.4 territory" —
S1 breaks it by two orders of magnitude; S1–S3's fixed 5 kg comfort sets up S4's flip. Foundational-coverage:
satisfied (S1 ∈ foundational).

## Engine bug queue consultation (pre-authoring)

DB query not runnable from this read-only architect thread; consulted the committed scar surface —
`docs/loop_runs/lom/_engine/` scar rows, `docs/FIELD3D_SCENARIO_CHECKLIST.md` directives, and the
friction_force/normal_force skeletons' applied-scar lists. Applied here: **motion-bound scar** — every burst
COMPUTED against `length_m` (§4; S3 stops at +2.98, S1's block ends at +0.76, all halts narrated);
**projection-blindness scar** — per-state near side-on `camera_position`, ONE shared distance; **formula-width
scar** — longest string `f = μN: μₖ = 0.40, μᵣ = 0.002`, checked short; **HUD bleed scar** — ≤4 readout rows
everywhere; **arrow floor scar (~15 N)** — the wheel's sub-newton friction/applied arrows are NEVER drawn
(HUD-only, narrated), every drawn arrow ≥ floor (§4 table); **`param_ramp` contract** — S3's own mu_k = `from`
= 0.002, never in sandbox, trusted input seizes; **`idle_auto_sweep.range[0]`** = the state's own F (15);
**lane-offset fix ff408ed** for the two-body race; **deriveStateMeta reveal registration** — json_author must
confirm S3's ramp `end_ms` (9000) registers in the reveal-time derivation before THE EYE; **glow enum** —
specific ids only, never a zero-hidden or undrawn arrow as focal (S1's handoff is between two always-visible
elements); **slider-row position** — shared rows keep position (F row in S1/S5, m row in S2/S4/S5, mu_k row in
S3 only); **slider-widening lesson (lom-c/lom-d)** — F max = 50 N computed against the heaviest block's 39.2 N
break-away UP FRONT, mu_k step = 0.002 so the wheel's value is expressible. Pedagogy directives honored:
concrete-before-abstract (the race before the formula), visual-matches-narration (never say "no friction"
while an f arrow is visible; never draw a min-clamped tiny arrow that contradicts "200× smaller"),
don't-pre-spoil (μᵣ's numeric value first appears in S2; S1's canvas carries only the outcomes and readouts).
**FLAG to quality_auditor:** confirm no new FIXED rows for `alex:architect` since 2026-07-30.
**DC Pandey check:** consulted §8.7 table of contents for scope only (rolling friction is a named sub-item of
the friction block). No teaching method, example problem, or figure imported.

## ENGINE GAP CANDIDATES (checked against spec §1 before claiming — none confirmed; 3 VERIFY items for json_author)

1. **VERIFY (not a gap): multi-body write semantics of `nlbApplyParam('applied_force')`.** Spec §4 lists ONE
   `#nlb_f_slider`. S1/S4 author equal F per body as constants (no slider dependency); S5's sweep/slider must
   drive the race — design intent is the F write reaching BOTH bodies. If the live engine writes body A only,
   the sandbox still works (the wheel moves at any F ≥ 0.1 N; only the block's stick-slip needs the slider),
   so this degrades gracefully — but json_author must verify and record which behavior shipped.
2. **VERIFY (not a gap): `param_ramp`/slider target for `mu_k` with two bodies present.** S3 is designed so it
   cannot matter: the block is `ghost: true` (never integrated), the wheel is the only live body.
3. **VERIFY (not a gap): `ghost: true` + `shape: 'wheel'` interaction.** Not exercised — the ghost is always
   the BLOCK. Recorded so nobody authors a ghost wheel without checking SEAM G's spin-from-position on a
   never-integrated body.

Everything else is covered by the shipped surface: SEAM G renders the rolling wheel; Branch A already computes
f = μᵣN; no graph, no new geometry, no new readout keys, no `train`, no pulley. **ENGINE GAP: none.**

## ORCHESTRATOR RESOLUTION of the 3 VERIFY items (read directly from the committed renderer, 2026-07-30)

1. **`F` writes ONE body only.** `nlbApplyParam('F')` calls `nlbForceTargetBody()`, which returns the
   `action_reaction` driver if engaged, otherwise `nlbSliderBodies()[0]` = the FIRST NON-GHOST body in
   AUTHORED array order. With S5 authoring `[A, B]`, the F slider and the idle F-sweep move the BLOCK's push
   only, leaving the wheel at its authored 15 N. This is NOT graceful degradation: the concept's atomic claim
   is "SAME push, different outcome", so a teacher dragging F would silently create two different pushes while
   two visibly different-length applied arrows contradict the caption. **Resolution: founder decision pending
   (see lom_e_state.md). Until it is answered, S5 must not present itself as a same-push comparison while F is
   draggable.** The two candidate resolutions are (a) drop `F` from S5's `controls_visible` and drive the
   sandbox with `m`/`m2`/`v0` only, or (b) a small opt-in engine flag making the F slider write every
   non-ghost surface body. json_author MUST NOT guess — take the answer from the state file.
2. **`mu_s`/`mu_k` write EVERY non-ghost, non-hanging body** (the coefficients belong to the CONTACT — see the
   comment in `nlbApplyParam`). S3's ramp therefore reaches the wheel correctly, and the architect's
   ghost-block reasoning is right for an additional reason: the ghost is skipped by the write loop too.
   **Consequence for S5:** a shared μ slider would overwrite BOTH bodies and erase the very contrast the
   concept teaches — the architect's exclusion of μ from `controls_visible` in S5 is REQUIRED, not stylistic.
3. **`ghost: true` + `shape: 'wheel'` is never exercised** (the ghost is always the block). Left unexercised
   deliberately; recorded here so a future author checks SEAM G's position-derived spin on a never-integrated
   body before combining them.

## DROPPED / DEFERRED BEATS (designed around, per brief)

1. **Rolling dynamics (torque, moment of inertia, angular acceleration, why μᵣ exists mechanically as contact
   deformation + asymmetric N).** Out of scope by atomic claim — Topic 15; the deformation story survives only
   as S2/S3 deep-dive clusters and one plain narration sentence.
2. **Static vs kinetic distinction on the block.** Deliberately collapsed (μₛ = μₖ = 0.40) — sibling
   `friction_force` owns it; S4's use of the break-away threshold cites it in one clause, no re-teach.
3. **Ball bearings as a visual.** Narration mention only — the engine renders no bearing; asserting one would
   be the newton_third_law defect class.

---
*Handoff: physics_author (exact narration within the declared budgets — Rule 41 plain-language register
mandatory; S1 phase at_ms tuned to script beats; halt-line wording for S1/S2/S4; assessment item wording).*
