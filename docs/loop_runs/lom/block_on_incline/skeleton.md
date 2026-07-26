# ARCHITECT SKELETON — `block_on_incline` (NEW, on the frozen `newtons_laws_body` engine + pre-approved `param_ramp`)
# Chapter: Laws of Motion (Class 11) · renderer: field_3d / scenario `newtons_laws_body` · 2026-07-26
# Engine contract: docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md §1/§2 Branch A/§3/§4/§6 row 5 +
# docs/CHAPTER_LOOP.md §7.1 (`param_ramp` — founder pre-approved, the ONE authorized engine item) +
# free_body_diagram/engine_gap.md (GAPs 1–3) + connected_bodies/engine_gap.md (FIXES 1–3, carries).
# CONFIGURATION ONLY beyond `param_ramp`. Anything else outside the closed enums = DROPPED BEAT (end).
# Runaway-guard status: released by founder (commit 074639e) — the §7.1 param_ramp dispatch is authorized.

## 1. Atomic claim
This concept teaches single-body incline dynamics with friction — mg resolved along/perpendicular to
the slope, static friction adjusting up to its ceiling until the ramp reaches tan θ = μₛ (break-away),
then kinetic sliding at a = g(sin θ − μₖ·cos θ) — and only that; it does NOT cover drawing the FBD
itself (prerequisite `free_body_diagram`), coupled/pulley systems (done in `connected_bodies`), or
work/energy on inclines (later chapter).

## 2. State count + arc — 5 states (medium; §5 calibration 5–6: one body, Branch A, but a two-regime
friction story with a threshold crossing)
Arc: gravity splits → static friction answers → TILT UNTIL GRIP FAILS (the central beat, PRIMARY aha)
→ moving friction is weaker (two-fate contrast) → sandbox.

- S1 hook + decomposition — mg never tilts; it splits; N matches only the cos part (incline_decompose)
- S2 static friction is an ANSWERING force — ramp gently, fₛ tracks mg·sin θ in lockstep, block never
  moves (incline_decompose + param_ramp 20°→23.5°)
- S3 THE BREAK-AWAY — param_ramp 0°→35°; the block sits still for 8.3 s and lets go exactly at
  tan θ = μₛ (incline_slide + param_ramp; PRIMARY aha)
- S4 kinetic < static — same tilt, two fates: the resting block holds forever, the nudged one keeps
  accelerating (incline_slide, two independent bodies, no pulley)
- S5 sandbox — teaching_method: exploration_sliders (all other states: straightforward beat, field omitted)

`advance_mode`: S1–S4 `manual_click`, S5 `interaction_complete` → 2 distinct (Gate 12 / Rule 15).
Never `wait_for_answer` / `pause_after_ms`. Rule 20: NO `mode_overrides`. EPIC-C branches: ZERO.
Rule 19: ≥3 primitives per state by construction (surface + body/bodies + arrows + label sprites + HUD).
Carried items honoured (CHAPTER_LOOP §7.2): NO tension arrow, NO `T` readout anywhere (uncoupled body,
T = 0 by model); frozen-pin timing on coast states NOT redesigned around (deferred founder call).

## 3. Per-state control table (Rule 31 — REQUIRED design artifact)

| S | Teaches | Archetype | Delta cue (≤5 words) | controls_visible | EN words | Duration |
|---|---|---|---|---|---|---|
| 1 | Gravity never tilts — mg stays vertical and SPLITS into mg·sin θ (along) + mg·cos θ (into); N matches only the cos part | `reveal-build` | "Gravity splits on the slope" | — | 35–50 | ~10 s |
| 2 | Static friction is not a number, it's an ANSWER: as tilt grows, fₛ rises to match mg·sin θ exactly; ΣF stays 0 and the block stays still | `ramp-track` (coined: a monotonically driven parameter with force arrows + readouts tracking it in lockstep while the body holds — no seed archetype names monotone driven tracking) — DECLARED CONTRAST PAIR with S3 | "Friction rises to match" | theta | 30–45 | ~12 s |
| 3 | Grip has a ceiling: tilt from flat and the block releases at exactly tan θc = μₛ — mass never appears | `ramp-track` (contrast pair of S2 — same tilt choreography, delta names the flip: this time the ramp CROSSES the threshold and friction loses) | "Tilt until grip fails" | mu_s | 45–55 | ~15 s |
| 4 | Once moving, friction drops to μₖN < μₛN: at one same tilt a resting block holds while a nudged block keeps speeding up | `two-fate-contrast` (coined: two identical bodies under identical conditions except initial motion, visibly diverging outcomes — no seed archetype names a same-cause/two-outcomes split; `null-result-hold` covers only the resting half) | "Moving friction is weaker" | mu_k | 40–55 | ~12 s |
| 5 | Everything together, teacher-driven | `drag-sandbox` | "All yours" | m, theta, mu_s, mu_k, v0 (ALL for this concept; F excluded — no applied force in the approved arrow row) | 0 / open | open |

No archetype repeat except the ONE declared contrast pair (S2/S3). No static state: S1's motion is the
phased component draw-in (fbd S2/S5 precedent), S2/S3 are live ramps, S4 translates, S5 free-runs.

## 4. Per-state engine spec (closed enums + `param_ramp` only)

**Global numbers (chosen for the ~15 N arrow-length floor — the concept-2 lesson):** m = 5 kg
(mg = 49.0 N), μₛ = 0.45, μₖ = 0.38, g = 9.8. θc = tan⁻¹(0.45) = **24.23°**.
Floor check of every arrow planned in every guided state (dwell values):
- S1 (θ=20°): mg 49.0 ✓ · mg·sinθ 16.76 ✓ · mg·cosθ 46.04 ✓ · N 46.04 ✓ · fₛ 16.76 ✓
- S2 (20°→23.5°): mg·sinθ 16.76→19.55 ✓ · mg·cosθ 46.04→44.94 ✓ · N ditto ✓ · fₛ = demand 16.76→19.55 ✓
  (no-slip margin at 23.5°: ceiling μₛN = 20.22 N vs demand 19.55 N → 0.67 N margin — deliberately not
  ramped to 24°, where the margin would be a float-fragile 0.21 N)
- S3 (ramp 0→35°): weight 49.0 ✓ · N 49.0→40.14 ✓ · friction arrow PHASE-GATED to appear at
  fₛ = 15.0 N (θ = 17.83°, t ≈ 6113 ms) so it is never drawn sub-floor; after break-away
  fₖ = μₖmg·cosθ = 16.98 N (at 24.23°) → 15.25 N (at 35°) ✓ — μₖ = 0.38 chosen precisely so fₖ
  clears 15 N even at 35° (μₖ = 0.30 would give 14.05 N ✗)
- S4 (θ=22°): A: fₛ = 18.35 ✓ (ceiling 20.44 — holds) · B: fₖ = 17.26 ✓ · N 45.43 ✓ · weights 49.0 ✓
- **`net` arrow: NEVER shown in guided states** — |ΣF| = m·a peaks at 12.85 N (S3, θ=35°) and is
  1.09 N in S4, all below the floor; ΣF is carried by the `F_net`/`a` readouts instead. Sandbox may
  show `net` live (teacher-driven; engine hides a real zero) — noted, not floor-gated.

Common: inert `field_lines` block (type requires it). EVERY state authors a NEAR SIDE-ON
`camera_position` perpendicular to the tilt axis (projection-blindness scar), all five on ONE shared
camera distance — json_author recalibrates the FBD Playwright projection probe for the taller 35°
scene (fbd cycle-3 lesson: unify distance, budget travel to fit; do NOT pull back per state). One
short Unicode formula line per state (`#nlb_formula` width scar). `glow_focal` always a specific id.
Single body id `A` everywhere except S4's second body `B` (both surface bodies; `hanging` never
authored — constant-flag scar N/A). `surface.length_m: 7`.

| S | mode | config (key values) | arrows (show) | readouts | formula (one line) | glow_focal | motion budget (computed) |
|---|---|---|---|---|---|---|---|
| 1 | `incline_decompose` | θ=20 fixed · A: 5 kg, μₛ .45, μₖ .38, at rest, `initial_position_m: +2` · `show_components: true` | weight + components, normal, friction | `N` | `N = mg·cos θ` | `nlb_comp_A_sin` | no translation; components + right-angle marker draw in via `phases[]` (never hardcoded `*_at_ms`); N draws matching the cos component; ~10 s |
| 2 | `incline_decompose` | same rig, home pose (Rule 32d) · `param_ramp {param:'theta', from:20, to:23.5, start_ms:1000, end_ms:8000}` (0.357°/s) | weight + components, normal, friction | `f`, `F_net` | `fₛ = mg·sin θ` | `nlb_arrow_A_friction` | block never moves (23.5° < θc, margin above); sin-component + friction arrows grow in lockstep; `F_net` reads 0.00 throughout — the held proof; hold at 23.5° after 8 s |
| 3 | `incline_slide` | reset to θ=0 flat · A at `initial_position_m: +4.5` · `param_ramp {param:'theta', from:0, to:35, start_ms:0, end_ms:12000}` (2.9167°/s) | weight, normal, friction (phased in at ~6113 ms; components NOT shown — S1/S2 own them, declutter the beat) | `N`, `f`, `a` | `tan θc = μₛ` | `nlb_body_A` | **break-away at t = 24.23/2.9167 = 8308 ms**; still-time 0→8.3 s (with the 6.1 s friction-arrow entry as sub-beat); slide 8.3 s→: stepwise a = g(sinθ−0.38cosθ) gives s ≈ 1.38 m at t=10 s (dense capture shows mid-slide), s ≈ 8.87 m, v ≈ 5.9 m/s at the 12000 ms frozen pin (still ON the 11.5 m run — the pin captures live sliding), halt at the down-slope bound ≈ 12.4 s, narrated "the run ends at the ramp base" (readouts held correct by recompute — fix bc649d4) |
| 4 | `incline_slide` | θ=22 fixed (INSIDE the hysteresis window: tan⁻¹μₖ = 20.81° < 22° < 24.23° = tan⁻¹μₛ) · A: rest, `+1.5`, lane 1 · B: `+4.5`, `initial_velocity_mps: −0.4` (down-slope), lane 2 (two independent bodies, NO pulley — Branch A each; lane offset = fix ff408ed) | A: weight, normal, friction · B: weight, normal, friction | `f`, `a`, `v` (per body; 6 HUD rows — flag json_author to rect-check vs the open `nlb_formula_and_readout_zones` scar) | `fₖ = μₖ·N` | `nlb_arrow_B_friction` | A holds forever (18.35 ≤ 20.44); B: a = 9.8(sin22° − 0.38·cos22°) = 0.218 m/s², s(t) = 0.4t + 0.109t² → reaches the 11.5 m bound at t ≈ 8.6 s, v grows 0.4 → 2.27 m/s (visible speeding-up), halt narrated |
| 5 | `sandbox` | A only, θ=20 start · `trusted_drag_seizes: true` · `idle_auto_sweep {param:'theta', range:[20, 35]}` (range[0] = the state's own value — first frame must not step) | weight + components, normal, friction, net (live) | `N`, `f`, `a`, `v` (4 rows — dodges the HUD-bleed scar) | `a = g(sin θ − μₖ·cos θ)` | `nlb_body_A` | free-run (Rule 37 is a player invariant); μ sliders reach 0 → the frictionless a = g·sin θ case is reachable here (see DROPPED BEATS) |

Rule 32 per state: cause first (S2/S3 the ramp tilts before arrows/readouts respond; S3 the tilt is
8.3 s of cause before the slip; S4 nothing moves B but its seeded motion — the divergence IS the
readable beat); only the taught variable moves; the ramp+block apparatus persists from home pose
(S3's reset to flat is the delta cue's named change); ONE specific-id glow focal.
Rule 33: N/A-macro — the taught variables are the on-screen forces themselves; the real-number duty
is met by live `N`/`f`/`a`/`v` readouts tracking every tilt (Rule 33d).
Rule 34: prose narration in the strip below; on-canvas = delta cue + ONE Unicode formula + value-only
HUD (θ, μₛ, μₖ, mg·sin θ, mg·cos θ, N, fₛ, fₖ, ΣF, °, · — never ASCII).

**`param_ramp` dispatch note (the §3b engine item, pre-approved §7.1, guard released 074639e):** ONE
bug_class, minimal diff, field3d-surgeon. The ramp must (a) evaluate θ(t) linearly off the state
clock (Rule 36: fold-exact, dt=0 under SET_TIME_FREEZE → byte-stable), (b) rebase on state entry AND
on RESET_TRAJECTORY exactly as `nlbSeedKinematics()` does (scar: integrating scenarios must
implement the reset explicitly), (c) be cancelled by a trusted drag of ITS OWN param slider, and
(d) **register in deriveStateMeta**: the reveal-ms block must take max over `param_ramp.end_ms` —
seam-F scar says there are THREE sites, and missing this one pins S3's frozen frame at 1500 ms
mid-flat, gutting the baseline. If the fix fails twice: PARK (do not weaken the beat — §7.1).

## 5. Misconception plan (Rule 16a — pivots only, 3 hooks, EPIC-C = zero)
1. **S3 — "a steeper ramp grips MORE."** THE pivot. Contrast beat: as the ramp tilts, the `N`
   readout visibly FALLS (49.0 → 40.1 N) — the grip budget μₛN shrinks while the demand grows —
   and at exactly 24.23° the block lets go. visual_counter = "the N readout falling through the
   whole tilt, then the slip itself — if steeper meant more grip, the block would never release";
   one_line_fix = "tilting steals from N, and friction's ceiling is μₛN."
2. **S4 — "friction is one fixed force."** Contrast beat: two identical blocks at the SAME 22° —
   the resting one is held by fₛ = 18.35 N (adjusted to demand), the moving one gets only
   fₖ = 17.26 N and keeps speeding up. visual_counter = "same tilt, two different friction readouts,
   two different fates"; one_line_fix = "static friction adjusts up to μₛN; sliding friction is a
   smaller, fixed μₖN." (S2 plants the groundwork straightforwardly — fₛ tracking demand — and its
   narration flags "friction is answering, not fixed" at the planting moment; the watch sits here.)
3. **S1 — "the block slides because gravity pulls it down the slope."** Contrast beat: the weight
   arrow stays exactly vertical while the dashed along/into pair draws out of it. visual_counter =
   "mg never rotates — only its dashed shadow lies along the slope"; one_line_fix = "gravity never
   tilts; the slope splits its effect."
No other state carries a misconception_watch.

## 6. `has_prebuilt_deep_dive` picks + drill-down clusters
- **S3** (the threshold — the exam's favourite): `tan_theta_equals_mu_threshold`,
  `mass_cancels_in_breakaway_angle`, `static_friction_maximum_vs_actual`
- **S4** (the two-regime wall): `kinetic_less_than_static`, `a_equals_g_sin_minus_mu_cos`,
  `friction_direction_on_incline`
All 5 states still show the Explain button; un-flagged states route to the feedback form (Rule 18).

## 7. entry_state_map (v2.2)
```
foundational:    STATE_1 → STATE_3   # decomposition, adjusting friction, the break-away threshold
kinetic_sliding: STATE_4             # μₖ < μₛ, a = g(sin θ − μₖ cos θ)
```
Default aspect = foundational. PRIMARY aha (S3) ⊂ foundational — coverage rule satisfied.

## 8. Prerequisites (advisory only, Rule 23)
`free_body_diagram` (this chapter, sealed on this branch — supplies the arrow vocabulary and
N = mg·cos θ), `normal_reaction` (shipped gold), `newton_second_law` (this chapter's plan — may not
yet be authored; S3/S4 assume F = ma, cliff patch in Block 1), `vector_resolution` (legacy PCPL —
advisory pointer only).

## 9. Real-world anchor (Rule 35 — universal, culture-neutral, plain English)
Primary: **a box on a delivery van's loading ramp** — set the ramp shallow and the box sits; raise
the ramp end slowly and nothing happens, nothing happens… then at one exact angle the box lets go
and slides the rest of the way down, faster and faster. Every mover on Earth angles the ramp by this
physics, and it is S3 frame-for-frame. Secondary: **a phone on an adjustable dashboard or desk
stand** — tilt the stand past one point and the phone suddenly slips off, and once slipping it never
re-grips (the S4 payoff: kinetic friction is weaker than the static grip that just failed). Both are
findable anywhere on Earth, age-appropriate, physics-true at full depth.
DC Pandey check: consulted the Laws of Motion table of contents for scope only (friction on an
incline is its own sub-topic after FBD) — no teaching sequence, example problem, or figure imported.

## 10. Definition of Done (Gate 0 — no TBDs)
(a) 5 states as tabled. (b) Symbol-label table (engine Unicode sprites): mg · mg·sin θ · mg·cos θ ·
N · fₛ · fₖ · ΣF (sandbox only) · θ · μₛ · μₖ · a · v — narration names each once before relying on
it; NO T anywhere (§7.2 carried item). (c) RHR plan: N/A (no cross products). (d) Motion plan = the
archetype + motion-budget columns above — no static state; every burst's arithmetic is in §4 and
each halt is choreographed as the end of the run. (e) Modes: conceptual only. (f) `assessment` +
`coverage_map` authored; misconception_watch exactly at S1/S3/S4. (g) Macro↔micro (Rule 33):
N/A-macro — live force readouts carry the real-number duty. (h) Canvas budget (Rule 34): one Unicode
formula line per state as tabled, ≤5-word delta cues, value-only HUD (S5 capped at 4 rows).
Registration (spec §8): sites 1–6; NOT `PCPL_CONCEPTS`; new concept (no retrofit clause).

## Two-pass lens
**Block 1.** Prerequisite cliffs: `free_body_diagram` missing → S1 breaks ("what are these
arrows?") — S1 narration includes one clause "each arrow is one force on the block, nothing else";
`newton_second_law` missing → S3/S4's "it accelerates because ΣF > 0" — S3 includes "an unbalanced
force means speeding up, F = ma"; `normal_reaction` missing → S1's N — one clause "the ramp pushes
back only against the part pressing into it."
JEE-backwards trace: "A block on an incline begins to slip when the angle reaches 24°, and then
slides down; with μₖ = 0.38, find μₛ and the acceleration at 30°." Needs: tan θc = μₛ (S3),
N = mg·cos θ (S1), fₛ adjusts below threshold (S2), a = g(sin θ − μₖ cos θ) (S4 narration + S5
formula surface) — all delivered; the mass-independence trap ("does the answer change for 10 kg?")
is delivered by S3's formula + narration (mass cancels) and explorable in S5's m slider.
Misconception-entry mapping: the "friction always keeps up" belief is PLANTED by S2's lockstep
tracking BY DESIGN (the earned wrong belief); S2's narration flags it at the planting moment ("so
far, friction always finds the answer — watch what happens next") and S3 breaks it. The "steeper =
more grip" belief arrives from daily life; S3 confronts it (§5). The "gravity acts down the slope"
belief is confronted at S1 before anything plants it.
**Block 2.** PRIMARY aha (S3): *the block lets go at ONE exact angle set only by μₛ — tan θc = μₛ,
and the mass never appears.* SUPPORTING aha (S4): *the grip that just failed doesn't come back —
moving friction is weaker, which is why slipping is sudden and self-feeding.* Cohesion: S4 is the
other side of S3's threshold — what the ceiling breaks INTO; it explains why S3's release looks like
a snap, not an ease. Wrong-belief setup: S2 builds the confident "friction always keeps up" broken
by S3; S3's 8.3 s of stillness builds "it will hold" broken mid-state; S1–S3's one-block comfort is
the setup for S4's two-fate split. Foundational-coverage rule: satisfied (S3 ∈ foundational).

## Engine-bug-queue consultation
DB query not runnable from this read-only architect context (no Bash tool); consulted the committed
scar surface: `docs/loop_runs/lom/_engine/scar_candidates.sql` (19 rows incl. connected_bodies
block), phase0 report references, both engine_gap.md files. Applied: per-state side-on
`camera_position` on ONE recalibrated shared distance (projection-blindness + fbd cycle-3 scale
scars); short single-line formulas (formula-width scar); `phases[]` for the S1 draw-in and the S3
friction-arrow entry (no hardcoded `*_at_ms`); specific glow ids only; inert `field_lines`;
`idle_auto_sweep.range[0]` = the state's own value; halted-state readouts trusted per fix `bc649d4`
(veto zeros motion only); RESET_TRAJECTORY rewind inherited (`cd8fe67`) but json_author must prove
the S3 ramp rebases under THE EYE's real message order (first `param_ramp` concept = first ramp
rewind ever exercised); down-slope bound = surface end (no pulley → the post-base bound scar is
N/A); slider-row `visibility:hidden` scar is engine-side (verify shared-row pixel position across
S2/S3/S5's theta row). FLAG to quality_auditor: confirm no new FIXED rows for `alex:architect`
since 2026-07-26.

## DROPPED BEATS (engine surface has no key — noted per the brief, not worked around with invented config)
1. **A live "grip ceiling" instrument (μₛN racing mg·sin θ).** The `readouts` enum has no
   `f_max`/`μₛN` key. Dropped; the race is carried by the falling `N` readout, the `f` readout, the
   `tan θc = μₛ` formula, and narration. (Candidate for a future founder-reviewed enum addition —
   NOT requested in-loop.)
2. **A repeating slide loop for S3/S4.** Known open gap (connected_bodies GAP CANDIDATE 1,
   `run_loop`); each slide runs once per state entry and the halt at the ramp base is choreographed
   and narrated, per sealed precedent. Teacher replay (state re-entry) re-runs it via the fixed
   RESET_TRAJECTORY path.
3. **A dedicated frictionless state (a = g·sin θ).** The from-rest burst covers the whole 11.5 m run
   in 2.6 s at θ=20° — too short to carry a narrated state with no loop. Folded into S5, where the
   μ sliders reach 0 and the sandbox formula `a = g(sin θ − μₖ·cos θ)` degrades to g·sin θ live.
