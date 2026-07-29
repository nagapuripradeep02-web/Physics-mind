# ARCHITECT SKELETON — `normal_force` (Laws of Motion, Class 11 — `normal_force_atomic`, pilot T11)
# Renderer: field_3d / scenario `newtons_laws_body` · 2026-07-29
# Engine contract: docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md §1 (closed enums) / §2 Branch A / §3 / §4.
# HARD CONSTRAINT honored: every state below is a pure `newtons_laws_body` config block from the
# brief's enumerated surface. NO renderer edits requested. **ENGINE GAP: none designed-in** — three
# inexpressible beats named + designed around in §9 (incl. one the dispatch brief believed expressible).

## 1. Atomic claim

This concept teaches ONE idea: the normal force is a contact force perpendicular to the surface whose magnitude ADJUSTS to exactly what is needed to stop the body sinking into the surface — it is NOT a fixed "mg" — and only that. It does NOT cover the friction threshold model itself (`block_on_incline`, shipped, owns tan θc = μₛ), the accelerating-lift case N = m(g ± a) (deferred with its nano to `pseudo_force` — §9), drawing complete FBDs (`free_body_diagram`, shipped), or tension partially carrying weight (§9 deferred beat).

## 2. State count + arc — 5 states (medium; §5 calibration 5–6 — one body flat/tilt story plus a two-body compare beat and the friction-ceiling link; matches the legacy `normal_reaction` 5-state precedent)

| State | Purpose (one line) | teaching_method | depth_ring |
|---|---|---|---|
| STATE_1 | Flat floor: N answers mg exactly — sweep the mass and N copies mg in lockstep; the special case is established HONESTLY (and deliberately plants the wrong belief, flagged at planting) | (straightforward beat — field omitted) | core |
| STATE_2 | THE confrontation (PRIMARY aha): tilt the floor — N detaches from mg, shrinks to mg·cos θ, and the block STILL never sinks; N was never "mg", it was "whatever presses in" | misconception_confrontation (16a contrast beat, no predict-pause) | core |
| STATE_3 | The limit: surface vertical → nothing presses in → N = 0 → nothing opposes gravity → the block falls at full g; a contact force exists only while something pushes into the contact | (straightforward beat) | core |
| STATE_4 | The consequence: friction's ceiling RIDES on N (f_max = μₛN) — same push on a light and a heavy block: the small-N block tears loose, the big-N block never budges | (straightforward beat) | extended |
| STATE_5 | Explore: teacher drives m, θ, F, v₀ and watches N answer live (CORE-ring sandbox) | exploration_sliders | core (explore) |

1 body ("A") everywhere except S4's independent second body ("B", no pulley). No pulley anywhere. `advance_mode`: S1–S4 `manual_click`, S5 `interaction_complete` → 2 distinct (Gate 12 / Rule 15). Never `wait_for_answer` / `pause_after_ms`. Rule 20: NO `mode_overrides`. EPIC-C branches: ZERO. Rule 19: ≥3 primitives/state by construction (surface + body + arrows + label sprites + HUD).

**Rule 38a ring layout:** core (S1–S3) → extended (S4) → explore (S5, core-only). **Advanced ring: EMPTY — declared, not TBD** (this atomic has no derivation/calculus content; the contiguous-before-explore requirement is vacuously satisfied). Both preset cuts checked in §10(i).

## 3. Per-state control table (Rule 31 — REQUIRED design artifact)

| S | Teaches | Archetype | Delta cue (≤5 words, Rule 32c) | controls_visible | depth_ring | EN words | Duration |
|---|---|---|---|---|---|---|---|
| 1 | On flat ground N = mg — because mg is exactly what presses in; sweep m and N tracks mg perfectly | `oscillate/track` (m sweeps, N arrow + readout track mg in lockstep) — **DECLARED CONTRAST PAIR with S2** | "Floor answers weight exactly" | `['m']` | core | 35–50 | ~12 s |
| 2 | Tilt → N = mg·cos θ < mg, yet the block never sinks: N equals the press-in, not the weight | `oscillate/track` (θ sweeps, N DETACHES from mg — contrast pair of S1; delta names the flip: same sweep choreography, N stops copying mg) | "Tilt — N drops below mg" | `['theta']` | core | 45–55 | ~14 s |
| 3 | θ = 90°: nothing presses into the surface → N = 0 → the surface holds nothing; block falls at g | `translate-through` (block falls the length of the vertical surface, unopposed) | "Vertical — N is zero" | `[]` (watch beat) | core | 30–45 | ~10 s |
| 4 | f_max = μₛN: grip ceiling is set by N — same push, light block (small N) slides, heavy block (big N) holds | `two-fate-contrast` (**declared cross-concept echo of `block_on_incline` S4** — same two-fate choreography, the flip is the cause: there the bodies differed in initial motion; here they differ in N) | "Grip ceiling rides on N" | `['F']` | extended | 45–55 | ~14 s |
| 5 | Everything, teacher-driven: N answers whatever the setup demands | `drag-sandbox` | "All yours" | `['m','theta','F','v0']` (all CORE-ring controls; **μₛ/μₖ excluded by Rule 38b** — they are S4/extended-ring content and the explore state must stay coherent under the core-only preset; F excluded nowhere — it proves live that an along-surface push does NOT change N) | core | 0 / open | open |

No archetype repeat except the ONE declared within-concept contrast pair (S1/S2) + the ONE declared cross-concept echo (S4, per the chapter-continuity instruction). No static state: S1/S2 sweep from t = 0 (`idle_auto_sweep`), S3 falls, S4 splits fates, S5 free-runs.

## 4. Per-state engine spec (closed §1 enums ONLY — zero renderer edits)

**Global numbers (≥ ~15 N arrow-length floor respected at every dwell/focal value — the concept-2 lesson):** g = 9.8. S1–S3, S5: body A m = 5 kg (mg = 49.0 N). S4: A = 4 kg, B = 8 kg.

Floor check of every planned arrow at its dwell values:
- S1 (m 5→10 sweep): mg 49.0→98.0 ✓ · N same ✓
- S2 (θ 0↔40°): mg 49.0 ✓ · N 49.0→37.5 ✓ · mg·cos θ 49.0→37.5 ✓ · mg·sin θ and fₛ grow 0→31.5 (sub-floor below θ ≈ 17.8° — both are CONTEXT arrows growing honestly from zero, never the focal; documented caveat, mirrors the engine's real magnitudes)
- S3: mg 49.0 ✓ · N = 0 → arrow HIDDEN by the engine zero-hides rule (spec §3) — the absence + the 0.00 readout IS the visual (newton_first_law S1 precedent)
- S4 (θ = 0): weights 39.2 / 78.4 ✓ · N 39.2 / 78.4 ✓ · applied 22.0 both ✓ · friction: A fₖ = 0.45·39.2 = 17.64 ✓, B fₛ = 22.0 ✓ (μₖ = 0.45 chosen precisely so A's kinetic arrow clears the floor)
- `net` arrow: NEVER shown in guided states (S4's |ΣF_A| = 4.36 N is sub-floor; ΣF is carried by readouts). Sandbox may show it live (engine hides a real zero).

Common: inert `field_lines` block (type requires it). EVERY state authors the chapter's shared NEAR SIDE-ON `camera_position` `[0, 1.87, 9.1]` (projection-blindness scar; one shared distance — fbd cycle-3 lesson). **json_author must verify S3's vertical 7 m surface fits this shared frame via the Playwright projection probe; if it clips, recalibrate the ONE shared distance for all five states, never per-state.** One short Unicode formula line per state (`#nlb_formula` width scar). `glow_focal` always a specific id. `surface.length_m: 7` throughout.

| S | mode | config (key values) | arrows (show) | readouts | formula (one line) | glow_focal | motion budget (computed) |
|---|---|---|---|---|---|---|---|
| 1 | `rest_equilibrium` | θ=0 · A: 5 kg at rest, `initial_position_m: 0`, μₛ .9 μₖ .7 (inert on flat, seeds S2 continuity) · `idle_auto_sweep {param:'m', range:[5,10]}` (range[0] = the state's own value — scar) | weight, normal | `N`, `F_net` | `ΣF = 0 ⇒ N = mg` | base `nlb_arrow_A_weight`, phase handoff at ~3500 ms to `nlb_arrow_A_normal` (glow-only phases — `action` strings are inert, verified in the NFL run) | block never moves; m sweeps 5↔10 kg from t=0 — BOTH arrows grow/shrink together, N readout tracks 49.0↔98.0 in lockstep, F_net pinned 0.00; trusted m-slider drag seizes the sweep |
| 2 | `incline_decompose` | SAME rig, home pose (Rule 32d — starts at θ=0, S1's exact pose) · A: 5 kg, μₛ .9, μₖ .7, at rest, `initial_position_m: +2` · `show_components: true` · `idle_auto_sweep {param:'theta', range:[0,40]}` | weight + components, normal, friction (context) | `N` | `N = mg·cos θ` | `nlb_arrow_A_normal` | cause first: the SURFACE tilts (θ sweeps 0↔40° from t=0), then N responds — arrow shrinks, readout falls 49.0↔37.5 while the mg arrow stays 49.0 and exactly vertical; block never slides (no-slip margin at 40°: ceiling μₛN = 33.8 N vs demand mg·sin40° = 31.5 N → 2.3 N margin — deliberately not swept to 42°, where tan θ = 0.90 makes the margin float-fragile); trusted θ-drag seizes |
| 3 | `incline_slide` | θ=90 fixed · `surface.frictionless: true` (declutter: at N = 0 friction is zero anyway; keep the beat pure-core) · A: 5 kg, `initial_position_m: +5`, v₀ = 0 | weight (normal named in `show` but auto-hidden at zero — spec §3) | `N`, `a` | `θ = 90° ⇒ N = 0` | `nlb_arrow_A_weight` (the ONLY force left) | drive = −mg·sin90° = −49 N, a = 9.8 m/s²; falls +5 → −7 bound = 12 m in t = √(2·12/9.8) ≈ **1.56 s**, then halts at the bound, narrated "the run ends at the base"; N readout reads 0.00 from frame 1 (the cause visible first); remaining dwell holds the fallen pose + 0.00 — the quiet readout IS the story. **json_author: verify θ=90 renders sanely; authored fallback if the vertical surface misbehaves: θ=80 (N = 8.5 N, narration "almost vertical — N almost gone")** |
| 4 | `compare_mass_same_force` | θ=0 · A: 4 kg, `initial_position_m: −5`, lane 1 · B: 8 kg, `initial_position_m: −5`, lane 2 · both: μₛ .5, μₖ .45, `applied_force_N: 22` · two independent bodies, NO pulley (Branch A each) | per body: weight, normal, applied, friction | `N`, `f` (per body — 4 HUD rows, dodges the HUD-bleed scar) | `f_max = μₛ·N` | `nlb_arrow_B_normal` (the big N that saves B) | cause first: phase 0–1500 ms glows the two equal applied arrows (identical push named before any motion is read); A: ceiling μₛN = 19.6 < 22 → slides, a = (22 − 17.64)/4 = 1.09 m/s², travels 12 m to the +7 bound in ≈ 4.7 s, halt narrated; B: 22 ≤ 39.2 → NEVER moves, f readout pinned 22.0; F-slider live: below 19.6 both hold, 19.6–39.2 the fates split, above 39.2 both slide |
| 5 | `sandbox` | θ=0 start (home pose) · A only: 5 kg · `surface.frictionless: true` (core-ring sandbox — no μ) · `trusted_drag_seizes: true` · `idle_auto_sweep {param:'theta', range:[0,40]}` | weight + components, normal, net (live; engine hides a real zero) | `N`, `a`, `v`, `F_net` (4 rows) | `N = mg·cos θ` | `nlb_body_A` | free-run (Rule 37 is a player invariant); teacher recipe the sim answers wordlessly: drag m → N tracks; tilt → N falls and (frictionless) the block slides while N reads mg·cos θ live; push F → the block accelerates but **N does not move** — the along-surface push never enters N, the last quiet proof |

Rule 32 per state: cause before effect (S1/S2 the sweep drives, arrows/readouts answer; S3 the 0.00 readout precedes the reading of the fall; S4 the applied-arrow glow precedes reading the split); only the taught variable moves; the same ramp+block apparatus persists from the flat home pose (S3's snap to vertical and S4's second body are each the delta cue's named change); exactly ONE specific-id glow focal per instant (phases hand off, never overlap).
Rule 33: N/A-macro — the taught variable is a directly visible force on a visible block; the real-number duty is met by the live `N`/`f`/`a`/`v` readouts tracking every sweep (33d).
Rule 34: prose narration in the strip below; on-canvas = the ≤5-word delta cue + ONE Unicode formula line + value-only HUD (θ, ·, ₛ, ₖ, ⇒, ° — never ASCII).

**`idle_auto_sweep` in guided states (S1/S2) — design note for downstream agents:** the key is per-state in the §1 surface with no sandbox-only restriction (only `trusted_drag_seizes` carries that comment); range[0] = the state's own value (scar) so the first frame never steps; the sweep runs on the state clock (Rule 36 engine-side) so THE EYE's frozen pin is byte-stable; a trusted drag of the state's own contextual slider seizes it — exactly the Rule 31c synergy. json_author self-verifies `deriveStateMeta` classifies S1/S2 as `reveal_hold` (spec site 13) and that the frozen frame lands at a readable sweep phase.

## 5. Misconception plan (Rule 16a — pivots only, 2 hooks, EPIC-C = zero)

1. **S2 — "N = mg always" (catalog NL-G6, the concept's named cognitive_error_target).** THE pivot. Contrast beat: S1 has just EARNED the belief (m-sweep showed N copying mg perfectly — and S1's narration flags the condition at the planting moment: "on this flat floor, N copies mg exactly — keep your eye on the word *flat*"). S2 shows the wrong expectation's consequence first — if N were always mg, the N readout would sit at 49.0 through the whole tilt — then the real physics: the readout falls to 37.5 while mg stays 49.0 and the block still never sinks. `visual_counter`: "the N arrow shrinking away from the unchanged mg arrow through the tilt, F-block never sinking"; `one_line_fix`: "N equals whatever presses INTO the surface — mg·cos θ here — never automatically mg."
2. **S1 — "N and mg are an action–reaction pair" (they balance, so students assume they're 3rd-law partners).** Contrast beat inside S1's dwell: both arrows attach to the SAME block — and a third-law pair NEVER shares a body (taught in shipped `newton_third_law`); N's true partner is the block pressing down on the floor, off-stage. `visual_counter`: "two balanced arrows rooted on one body"; `one_line_fix`: "N and mg balance by Newton's SECOND law here; N's third-law twin acts on the floor." (One clause + the already-present visual; no extra state.)

No other state carries a misconception_watch (founder guardrail 2026-07-04). S3 and S4 are straightforward teaching.

## 6. `has_prebuilt_deep_dive` picks + drill-down clusters

- **S2** (the core abstraction + the documented cliff — same state carrying the primary misconception and the mg·cos θ math): `n_equals_mg_conditions` (the exact conditions under which N = mg holds) · `mg_cos_theta_geometry` (why only the perpendicular component loads the surface) · `why_the_block_never_sinks` (N as a constraint-enforcing "answering" force, rigid-surface idealization).
- **S4** (the friction-link wall, feeder into T12): `grip_ceiling_mu_n` (f_max = μₛN, why the ceiling scales with N not weight) · `heavier_is_harder_to_slide` (everyday box-pushing quantified) · `normal_vs_weight_in_friction_formulas` (why f = μmg is only the flat-ground shortcut).

All 5 states still show the Explain button; un-flagged states route to the feedback form (Rule 18). Deep-dive picks coincide with the Block-1 cliff states — cross-reference consistent.

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational:   STATE_1 → STATE_3   # "what is the normal force / is N always mg / when is N zero"
  friction_link:  STATE_4             # "why is a heavier box harder to slide"
  explore:        STATE_5
```
Default aspect = foundational. PRIMARY aha (S2) ⊂ foundational — foundational-coverage rule satisfied, no exit-pill needed.

## 8. Prerequisites (advisory only — Rule 23)

- `newton_second_law` (shipped, this engine) — "ΣF = 0 at rest" and "unbalanced force → acceleration" (S3); cliff patch in Block 1.
- `free_body_diagram` (shipped, this engine) — the arrow vocabulary; supplies the same-machine apparatus (Rule 32d chapter continuity).
- `newton_third_law` (shipped, this engine) — makes the S1 pair-clarification one clause instead of a lesson.
- `vector_resolution` (legacy PCPL — advisory pointer only) — mg·cos θ; S2 patches inline.
- **Sibling note, flagged to founder:** the legacy Socratic-era `normal_reaction.json` (old gold, pre-Rule-31, NOT this engine) covers overlapping ground incl. the elevator beat. Recommend a `CONCEPT_SYNONYMS` decision (`normal_reaction` → `normal_force`) at registration time — founder call, not assumed here. Also note shipped `block_on_incline` already owns the tan θc = μₛ threshold arc; this concept links to it (S4 narration cross-reference) and never re-teaches it.

## 9. Real-world anchor (Rule 35/38f — universal, culture-neutral, plain English) + deferred beats

**Primary: a bathroom scale.** A scale does not read your weight — it reads the normal force it pushes back with. On a level floor the two happen to match, which is why the belief "N = mg" feels so safe. Put the same scale on a sloped surface and the reading drops, with you unchanged — the scale answers only what presses into it. Universal household device on every syllabus (38f), physics-true at full depth, and it is S1→S2 frame-for-frame. **Secondary: sliding a full versus empty storage box across the same floor** — the heavier box presses harder into the floor, and the floor grips it harder in return; that everyone instinctively unloads a box before sliding it IS f_max = μₛN (S4). Hooks a Class 10–12 student because it re-labels a number they have read all their lives (the scale) as a force that negotiates, not a constant. No places, brands, currency, or country-specific context anywhere in captions, labels, or narration. *(The elevator/scale-in-a-lift reading is deliberately NOT used — see deferred beat 2.)*

**Deferred beats (engine surface has no key — named per the brief, not worked around with invented config):**
1. **Press-down → N > mg.** The dispatch brief listed this as expressible; per spec §2 Branch A it is NOT: `N = m·g·cos θ` only, and `applied_force_N` is along-axis and never enters N. Would need a perpendicular applied-force key (e.g. `applied_force_perp_N` folding into N). Designed around: the "N adjusts" evidence is carried by tilt-shrink (S2), the zero limit (S3), and S5's quiet proof that an along-axis push leaves N untouched. **FLAG to quality_auditor: brief/spec conflict resolved in the spec's favor — Gate 8 should review this exception explicitly.**
2. **Elevator/lift beat (`normal_force_in_lift_problem_nano`, N = m(g ± a)).** Excluded per dispatch: no accelerating-frame/enclosure support in the engine. Deferred to the future `pseudo_force` concept, which pays for that engine delta.
3. **String partially carrying the weight (N = mg − T on flat ground)** — the cleanest flat-ground "N below mg" beat; needs a vertical single-body tension key (the `pulley` block only couples two bodies). Deferred; candidate for a founder-reviewed enum addition, NOT requested in-loop.
4. **Continuous tilt-to-vertical for S3.** `param_ramp` exists on the lom engine branch (shipped in `block_on_incline` S2/S3) but is OUTSIDE this brief's enumerated surface — S3 is therefore authored as a fixed θ=90 state (the snap is the delta cue's named change). Optional founder-approved upgrade later; noted, not designed.

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** S1 flat lockstep m-sweep (N copies mg, F_net 0.00, glow handoff weight→normal) · S2 θ-sweep 0↔40°, N detaches to mg·cos θ, block never slides · S3 θ=90, N=0, 1.56 s fall to the bound, halt narrated · S4 same 22 N push, 4 kg slides / 8 kg holds, F slider live · S5 core-ring sandbox, frictionless, idle θ-sweep, trusted drag.

**(b) Symbol-label table (engine Unicode sprites, Rule 34c):**
| Quantity | On-canvas label |
|---|---|
| weight arrow | `mg` |
| normal arrow + readout | `N` |
| weight components (dashed, S2/S5) | `mg·sin θ`, `mg·cos θ` |
| static / kinetic friction | `fₛ` / `fₖ` |
| applied push (S4/S5) | `F` |
| net force (S5 only, live) | `ΣF` |
| angle / coefficients / mass | `θ`, `μₛ`, `μₖ` (S4 narration only — no μ slider outside S4's authored bodies), `m` |
| acceleration / velocity readouts | `a`, `v` |
Narration names each symbol once before relying on it. No `T` anywhere (no string in this concept).

**(c) Right-hand-rule plan:** N/A — no cross products (documented, not TBD).

**(d) Motion plan:** = the archetype + motion-budget columns of §3/§4 — no static state; every travel/halt is computed there (S3 fall 1.56 s to the −7 bound; S4 A reaches +7 at ≈ 4.7 s); halts choreographed as the end of the run (block_on_incline precedent, fix `bc649d4` readout trust).

**(e) Modes:** conceptual EPIC-L only (Rule 20 [D] — no board/competitive overrides).

**(f) assessment + coverage_map + misconception_watch:** authored (post-2026-05-30). Assessment plan (3 items): (i) 5 kg block at rest on a 37° slope — N? → mg·cos 37°, not mg (→ S2); (ii) true/false: the normal force on a resting body always equals its weight → false, N equals the perpendicular press-in (→ S1–S3); (iii) the same push slides the empty box but not the full one — why? → f_max = μₛN is larger for the larger N (→ S4). `coverage_map`: i→S2, ii→S1–S3, iii→S4. misconception_watch exactly at S1 + S2 (§5).

**(g) Macro↔micro plan (Rule 33):** NOT TRIGGERED — the taught variable is a directly visible force on a visible block; instruments = value-only `N`/`f`/`a`/`v` HUD rows tracking live (33d).

**(h) Canvas budget (Rule 34):** per state — ONE `formula_overlay` Unicode line (§4 table; longest is `f_max = μₛ·N` — clears the formula-width scar), top caption = the ≤5-word delta cue only, value-only HUD (≤4 rows every state), narration prose in the strip below.

**(i) Curriculum-flex block (Rule 38):**
- *(i-1) Preset-cut coherence:* **hide advanced** → no change (advanced ring empty). **Hide advanced+extended** → surviving S1, S2, S3, S5: no surviving narration/caption/formula references S4's content (μₛ, f_max, grip ceiling appear ONLY in S4's surfaces; S2's context friction arrow + its single clause "the surface's grip holds it against sliding — a later lesson" is prerequisite-level existence, not the hidden quantitative link — checked and declared coherent).
- *(i-2)* Explore state = CORE only: frictionless, formula `N = mg·cos θ`, controls `m/theta/F/v0`, no μ slider, no f readout (38b).
- *(i-3) `curriculum_tags` (claims, not facts):* CBSE/NCERT: core+extended, **verified** (NCERT Ch.5 §5.10.1–5.10.2, normal force + friction intro) · JEE-Main/Advanced: core+extended, `needs_teacher_verification` · CIE/IB/AP-Physics-1: core rings, `needs_teacher_verification` (all cells except CBSE/NCERT unverified per 38g).
- *(i-4) Preset proposal (hide, never reorder — 38h/25d):* `full` = S1–S5; `core_only` = S1,S2,S3,S5.
- *(i-5) Graph-axis conventions:* N/A — no graph in this concept (documented).

Registration (engine spec §8): sites 1–6; **NOT `PCPL_CONCEPTS`**; new concept (no retrofit clause), plus the §8 sibling-synonym founder decision.

---

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs:** (1) `newton_second_law` — breaks at STATE_3 ("why does zero N mean it falls?"); patch: one S3 clause "with nothing pushing back, gravity is unbalanced — an unbalanced force means acceleration, F = ma." (2) `vector_resolution` — breaks at STATE_2 (mg·cos θ); patch: one clause co-timed with the dashed components: "only the dashed part of gravity pressing INTO the surface is what the surface must answer." (3) `newton_third_law` — breaks at STATE_1's pair-clarification; patch: the §5.2 one-liner is itself the patch ("a third-law pair never sits on one body"). None condescend — each is the beat's cue line.

**JEE-backwards trace:** *"A 5 kg block rests on a rough 37° incline. The normal force on the block is (g = 10): (A) 50 N (B) 40 N (C) 30 N (D) zero."* Pieces: N ⊥ surface and equal to the perpendicular press-in → S2 (answer B = mg·cos 37°); distractor A (N = mg) killed by the S1/S2 contrast pair; distractor D killed by S3 (N = 0 happens only when nothing presses in — here mg·cos θ does); the follow-up trap "maximum friction available?" → μₛN with the S2-shrunk N, delivered by S4's formula + narration. No missing piece — no state added. (Carve-out N/A — not a magnetism concept.)

**Misconception entry mapping (16a):** "N = mg always" is planted by every flat-ground problem the student has ever solved AND deliberately re-earned by S1's lockstep sweep — S1 flags the condition at the planting moment ("keep your eye on the word *flat*"); confronted proactively at S2 (misconception_watch there, contrast beat §5.1). "N–mg are 3rd-law partners" is planted the instant two balanced arrows appear (S1) — confronted at the planting state itself (§5.2). Planting-risk check: S4's narration must say "the floor grips the heavy block harder" — never "the heavier block's WEIGHT grips more" (which would re-plant N≡weight through the back door); on flat ground they coincide, so the narration says "bigger N" explicitly, with the N arrows glowing, not the weights. No EPIC-C branches (deferred).

### Block 2 — Aha-moment designation

- **PRIMARY aha (the 10-year memory):** *The floor's push is not a stored number — it is an on-demand ANSWER, exactly as large as whatever presses into the surface, and "mg" was only ever the flat-ground answer.* Lands at STATE_2 (the tilt where N walks away from mg while the block still doesn't sink).
- **SUPPORTING aha (1):** *A contact force can die completely: turn the surface vertical, nothing presses in, N = 0, and the surface holds nothing — contact forces exist only while contact is loaded.* (STATE_3.)
- **Cohesion check:** the supporting aha is the limiting case of the primary (the "answer" answered with zero) — it reinforces, doesn't stand alone. 1 + 1 = sweet spot.
- **Wrong-belief setup:** the primary aha's confident-wrong-belief is EARNED by S1 by design (the lockstep m-sweep is the strongest possible evidence for N = mg — one state of confident rightness, then S2 breaks it). The supporting aha's setup: S1–S2 always show a loaded, present N (two states of "the surface always answers") — S3 shows the answer can be nothing.
- **Foundational-coverage:** PRIMARY aha state (S2) ⊂ `foundational` range. Satisfied.

---

## Engine-bug-queue consultation (pre-authoring)

DB query not runnable from this read-only architect thread (no shell); consulted the committed scar surface exactly as the two chapter exemplars did — the nlb seam rows + FIELD3D checklist directives as documented in `newton_first_law/skeleton.md` and `block_on_incline/skeleton.md` (both post-date every relevant FIXED row). Applied here:

- **Motion-bound / computed-placement scar:** S3 (+5 → −7, 12 m, 1.56 s) and S4 (−5 → +7, 4.7 s) placements COMPUTED against `surface.length_m: 7`; halts choreographed, never accidental. S1/S2/S5 bodies never translate past a bound.
- **Label-projection scar:** every state authors the shared near side-on `camera_position [0, 1.87, 9.1]`; json_author re-runs the projection probe for the θ=90 tall scene (ONE shared distance, §4 note).
- **HUD zero-stub scar:** every readout row is meaningful in its state; S3's N = 0.00 and S1's F_net = 0.00 are TAUGHT values, not stubs. No hanging body anywhere.
- **Slider-row jump scar:** engine-side (`visibility:hidden`); the concept's row union is `['m','theta','F','v0']` + S4's `['F']` — no μ row is ever built (μ values are authored body constants, S4 has no μ slider; keeps the 38b cut trivial).
- **Formula-width scar:** longest line `f_max = μₛ·N` / `N = mg·cos θ` — short by design.
- **`idle_auto_sweep.range[0]` scar:** range[0] = the state's own seeded value in S1 (m=5), S2 (θ=0), S5 (θ=0).
- **Zero-hides rule (spec §3):** S3's normal arrow and S5's net arrow rely on it deliberately; narration written to treat absence + 0.00 as the visual (NFL precedent).
- **deriveStateMeta / seam-F scar:** phases authored in S1 (glow handoff ~3500 ms) and S4 (applied glow 0–1500 ms) — json_author self-verifies the reveal-ms derivation + `reveal_hold` classification for the sweeping guided states before THE EYE.
- **Pedagogy directives (checklist):** concrete-before-abstract (the sweep is watched before `N = mg·cos θ` appears); visual-matches-narration (never say "no force presses back" while an N arrow is visible — zero-hides guarantees it); don't-pre-spoil (f_max = μₛN appears nowhere before S4; the a-readout appears only in S3/S5).

**FLAG to quality_auditor:** (1) confirm no new FIXED rows for `alex:architect` since 2026-07-26 (the exemplars' consultation date); (2) review the §9.1 brief/spec conflict exception explicitly.

**DC Pandey check:** consulted the Laws of Motion table of contents only, to confirm "normal reaction/contact force" is a §8.8 common-forces sub-topic preceding the incline sections. No teaching method, no example problem, no figure reference imported.

---
*Handoff: physics_author (exact narration scripts within the declared budgets, phase at_ms tuned to script beats, the θ=90 render verification handshake with json_author, and the S2 sweep-speed choice so one full 0↔40° cycle completes inside the ~14 s dwell).*
