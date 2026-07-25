# ARCHITECT SKELETON — `free_body_diagram` (RETROFIT onto `newtons_laws_body` engine)
# Chapter: Laws of Motion (Class 11) · renderer: field_3d / scenario `newtons_laws_body` · 2026-07-25
# Engine contract: docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md §1/§3/§4/§6 row 4/§8.8 + docs/loop_runs/phase0_engine_report.md §6.
# CONFIGURATION ONLY — zero renderer edits. Any need beyond the closed enums = park with engine_gap.md.

## 1. Atomic claim
This concept teaches HOW to isolate one body and replace every interaction on it with a labeled
force arrow (the representational skill of drawing an FBD) — and only that; it does NOT cover
solving for acceleration (deferred to `newton_second_law`), incline sliding dynamics (deferred to
`block_on_incline`), or coupled/pulley systems (deferred to `connected_bodies`).

## 2. State count + arc — 6 states (medium; RETROFIT NOTE 2026-07-25 cycle 2 — see below)
§5 calibration: medium (5–6). **Cycle-2 correction:** the original 7-state design (below, struck
through in spirit) included a hanging-body/tension state (old S6, `fbd_isolate` variant with
`surface.hidden: true`, teaching `T = mg`). That state was DELETED after cycle-1 review — tension
is now deferred to a dedicated `tension_in_string` concept rather than folded in here, keeping this
concept's scope strictly to the flat/kinetic/incline force families the arc below actually needs.
The old S7 sandbox is renumbered STATE_6. a ≈ 0 in every guided state by design (spec §6: "the
cheapest concept" — no dynamics taught here).

Arc: isolate → build the two-force FBD → "moving needs no force" contrast → push vs friction →
incline decomposition (static, θ=30°) → sandbox.

- S1 hook — isolation IS the concept (fbd_isolate) — teaching_method: (straightforward beat, field omitted)
- S2 contact → arrow; N = mg (rest_equilibrium)
- S3 constant-v coast, net arrow ABSENT (coast_no_force) — misconception contrast
- S4 applied vs friction, balanced (coast_with_friction)
- S5 incline: mg splits, N shrinks, held static at θ=30° (incline_decompose) — **cycle-2 correction:**
  the earlier `idle_auto_sweep {theta, 0→30}` was removed; the state now authors a fixed `theta_deg:
  30` and shows the decomposition via the weight vector's cos/sin component draw-in, not a live tilt
  sweep (still satisfies Rule 31 distinct-motion via the component-arrow reveal, not the surface angle).
- S6 sandbox — teaching_method: exploration_sliders

`advance_mode`: S1–S5 `manual_click`, S6 `interaction_complete` → 2 distinct modes (Gate 12 / Rule 15).
Never `wait_for_answer` / `pause_after_ms`. Rule 20: NO `mode_overrides`. EPIC-C branches: ZERO.
Rule 19: every state ≥3 primitives by construction (surface + body/bodies + arrows + label sprites + HUD).

## 3. Per-state control table (Rule 31 — REQUIRED design artifact)

| S | Teaches | Archetype | Delta cue (≤5 words) | controls_visible | EN words |
|---|---|---|---|---|---|
| 1 | An FBD looks at ONE body; neighbors fade away | `isolate-dim` (coined: the concept's defining move — surrounding bodies dim to ghosts while one body brightens; no seed archetype names removal-by-dimming) | "One body at a time" | — | 35–50 |
| 2 | Every contact becomes one arrow; at rest N balances mg | `reveal-build` | "Each contact becomes an arrow" | m | 40–55 |
| 3 | A moving body carries NO forward force; ΣF = 0 | `translate-through` | "Moving — no forward force" | v0 | 35–50 |
| 4 | Applied and friction arrows; balanced pair at constant v | `translate-through` (DECLARED CONTRAST PAIR with S3 — same glide, delta = a push appears and friction answers it) | "Push in, friction answers" | F | 35–50 |
| 5 | On an incline mg stays vertical but splits; N = mg·cos θ < mg | `rotate/flip` | "Tilt: mg splits, N shrinks" | theta | 40–55 |
| 6 | Everything together, teacher-driven | `drag-sandbox` | "All yours" | m, F, theta, mu_s, mu_k, v0 (ALL) | 0 / open |

No archetype repeats except the one declared contrast pair (S3/S4). **Cycle-2 correction:** the
original 7-state table also carried a `reveal-build` DECLARED CONTRAST PAIR (S2/S6, the "N becomes
T" hanging-body swap); that row was removed with the S6 tension state (§2) — S2's `reveal-build`
now stands alone, unpaired, which is fine (Rule 31 only forbids an UNDECLARED repeat).

## 4. Per-state engine spec (closed enums only — spec §1/§6 + phase0 §6)

Common: `theta_deg: 0` unless stated; every state authors a NEAR SIDE-ON `camera_position`
(mandatory — the shared oblique default foreshortens exactly the decomposition angles; phase0 open
decision #2 mitigation). ONE short single-line formula per state (`#nlb_formula` has no width
bound — Rule 34d). Inert `field_lines` block required by the type. All labels Unicode (engine-side).
Body `A` (surface body, `hanging` never set) and body `H` (`hanging: true`, S6 only) never share an
id — `hanging` is constant per id across all states (phase0 hard constraint).

| S | mode | bodies | arrows (show) | readouts | formula (one short line) | glow_focal | camera |
|---|---|---|---|---|---|---|---|
| 1 | `fbd_isolate` | A (real, 2 kg) + G1, G2 `ghost:true` flanking it | A: `weight` (draws at end of beat) | — | *(none — hook)* | `nlb_body_A` | side-on, slightly elevated |
| 2 | `rest_equilibrium` | A | A: `weight`,`normal`,`net` (net hides — real zero) | `N`,`F_net` | `N = mg` | `nlb_arrow_A_normal` | strict side-on |
| 3 | `coast_no_force` | A (`initial_position_m: -5`, `initial_velocity_mps: 1.0`, frictionless) + G3 `ghost:true` frozen mid-track at `-3` (the wrong expectation: "it should have stopped") · `surface.length_m: 7` | A: `weight`,`normal`,`net` (net hidden — zero) | `v`,`F_net` | `ΣF = 0` | `nlb_body_A` | `[0.0, 1.3, 8.4]` (distance 8.500) — **cycle-3 fix:** unified onto the SAME distance as every other flat-ground state instead of pulling back to distance 11 (which shrank force arrows fleet-wide); coast travel re-budgeted down to a ±5 m traverse to fit the closer frame — see the cycle-3 framing arithmetic above |
| 4 | `coast_with_friction` | A (`initial_position_m: -5`, `initial_velocity_mps: 1.0`, `mu_k` set, `applied_force_N = μₖ·m·g` so a ≈ 0, v constant) · `surface.length_m: 7` | A: `weight`,`normal`,`applied`,`friction`,`net` (net hidden) | `F_applied`,`f`,`F_net` | `F = fₖ` | `nlb_arrow_A_friction` | `[0.0, 1.3, 8.4]` (distance 8.500) — same unified camera as S3 (Rule 32d home-pose continuity: both coast states share one apparatus/camera, now IDENTICAL to S1/S2/S6 too) |
| 5 | `incline_decompose` | A (`mu_s` holds it static) · `surface.theta_deg: 30` fixed (**cycle-2 correction:** no longer an `idle_auto_sweep` 0→30 — the state authors the tilt already at its taught value and shows the decomposition through the weight vector's cos/sin component reveal) | A: `weight`,`normal`,`friction` + `show_components: true` | `N` | `N = mg·cos θ` | `nlb_comp_A_cos` | side-on perpendicular to tilt axis, `[0.2, 1.4, 8.382]` (distance ≈8.500 — **cycle-3:** nudged from 8.32 onto the unified distance so the incline state carries zero scale change from its neighbours too) |
| 6 | `sandbox` | A | A: all of `weight`,`normal`,`friction`,`applied`,`net` + `show_components` (live with θ) | `N`,`f`,`a`,`v`,`F_net`,`F_applied` | `ΣF = ma` | `nlb_body_A` | `[0.0, 1.3, 8.4]` (distance 8.500 — **cycle-3:** unified, was distance 9.09) |

S6 extras: `trusted_drag_seizes: true`, `idle_auto_sweep {param:'F', range:[0,…]}` until a trusted
input seizes (Rule 37 free-run is a player invariant — no per-concept work).
Rule 32 per state: cause moves first (ghost-dim before arrows in S1; component split before N-shrink
readout in S5), only the taught variable moves, apparatus persists from home pose across every state,
exactly ONE specific-id glow focal (never a bare bodyId).
Rule 33: readouts are the live numeric instruments (N tracking mg·cos θ in S5 is the macro↔number link).
Rule 34: prose narration lives in the strip below; on-canvas = delta cue + the one formula + value HUD.

**Cycle-2 framing arithmetic (S3/S4 camera pullback) — SUPERSEDED by cycle-3, kept as authoring
history.** THE EYE's dense capture window for a guided state is a fixed 10 s regardless of authored
narration length (`DENSE_DEFAULT_DURATION_MS`), so a constant-velocity coast must budget its ENTIRE
travel against 10 s, not against how long the narration happens to run. With `v0 = 2.0 m/s`
unchanged, travel over 10 s = 20 m; authored symmetrically about the track centre that is
`initial_position_m: -10` → final `+10` m. The camera must keep both endpoints comfortably inside
frame: `camera_position` sits in the y-z plane (x=0) looking at the origin, so the visible
half-width in metres scales linearly with camera distance — empirically calibrated (Playwright
projection probe against the real renderer, not hand-waved) at roughly
`1.397 × camera_distance_world_units` before a right-side HUD overlay (the `#nlb_formula` /
`#nlb_readout` panel, a fixed-position DOM element independent of camera zoom) starts to occlude the
body. At the OLD camera `[0.0, 1.2, 8.5]` (distance 8.585) that predicts an occlusion onset ≈ 11.99 m
— matching eye-walker's observed "exits ≈ 12 m" almost exactly, confirming the model. The cycle-2
camera `[0.0, 1.5, 11.0]` (distance 11.10) pushed that onset to ≈ 15.5 m, giving the ±10 m endpoints
a ~5.5 m (≈35%) margin, but this pulled S3/S4 back to a visibly different scale than the static
states (S1/S2/S6 stayed near distance 8), producing a 45% apparent-size jump at the S2→S3 seam
(Rule 32d violation, flagged by eye-walker cycle-3).

**Cycle-3 correction — unify the whole flat-ground arc on ONE camera distance instead of pulling
S3/S4 back.** Rather than widen every state to distance 11 (which would shrink the body and its
force arrows in every state — this concept is entirely about reading force arrows), the coast
travel itself was re-budgeted DOWN to fit inside the tighter frame the static states already use.
Every flat-ground state (S1, S2, S3, S4, S6) now shares `camera_position: [0.0, 1.3, 8.4]`
(distance exactly `√(1.3² + 8.4²) = √72.25 = 8.500`) and `surface.length_m: 7`. S5 (incline) keeps
its own tilt-appropriate x/y offset but is nudged onto the same distance:
`[0.2, 1.4, 8.382]` → `√(0.2² + 1.4² + 8.382²) = √72.249 ≈ 8.500`. **Residual scale change across
every seam in the arc, including into/out of S5, is 0%** — the whole 6-state arc now reads as one
persistent piece of equipment.

Using the same calibration constant (`s_occlusion ≈ 1.397 × distance`), the occlusion onset at the
unified distance 8.500 is `1.397 × 8.500 ≈ 11.87 m`. The coast travel was re-budgeted from
`v0 = 2.0 m/s` / `±10 m` down to `v0 = 1.0 m/s` / `±5 m` (a 10 m traverse over the fixed 10 s dense
window, symmetric about the track centre: `s(t) = -5 + 1.0t`, `s(10) = +5`). Margins at distance
8.500: **occlusion margin** = `11.87 − 5 = 6.87 m` (≈137% of the 5 m half-travel — very
comfortable); **bound margin** = `surface.length_m 7 − 5 = 2 m` (40% of the half-travel, ≈29% of
the bound). Ghost G3 (the "should have stopped" marker) moves from `-6` (40% of the way from the
old start `-10` to centre `0`) to `-3` (the same 40% fraction of the new start `-5` to centre `0`),
preserving its read as an early-stop marker relative to the new start. S4 carries the identical
`s₀ = -5`, `v0 = 1.0 m/s` and camera (Rule 32d shared apparatus); its balance `F = fₖ = 5.880 N`
is unaffected by v0 (kinetic friction magnitude depends only on `μₖ, m, g`, not on speed).

## 5. Misconception plan (Rule 16a — pivots only, 3 hooks total, EPIC-C = zero)

1. **S3 — "a moving body must have a forward force on it."** Contrast beat: ghost G3 sits frozen
   mid-track (ghosts are never integrated — it IS the wrong expectation's consequence, dimmed to
   0.40) while real A glides past at constant v with the net arrow ABSENT and `F_net = 0.00` live.
   `misconception_watch`: belief as above; visual_counter = "the ghost that 'should have stopped'
   is passed by a body with zero net force"; one_line_fix = "force changes motion, it doesn't
   maintain it."
2. **S5 — "N always equals mg."** At the tilted 30° pose, the `N` readout reads 16.97 N against the
   flat-surface 19.60 N the student already saw in S2, while the dashed cos-component visibly shrinks
   against the still-vertical weight vector. visual_counter = the live N number reading lower than the
   S2 baseline; one_line_fix = "N matches only the perpendicular part of mg."
3. **S1 — "a good diagram shows every body's forces at once."** The hook shows the crowded
   three-body scene going unreadable, then the isolate-dim move; one_line_fix = "one FBD, one
   body — neighbors become forces, not pictures."
No other state carries a misconception_watch.

## 6. `has_prebuilt_deep_dive` picks + drill-down clusters
- **S2** (contact→arrow is where completeness errors start): `fbd_which_forces_to_include`,
  `third_law_pair_on_same_diagram`, `internal_forces_cancel_out`
- **S5** (the trig/decomposition wall): `normal_not_equal_mg`, `which_angle_gets_cos`,
  `choosing_tilted_axes`
All 6 states still show the Explain button; un-flagged states route to the feedback form (Rule 18).

## 7. entry_state_map (v2.2)
```
foundational: STATE_1 → STATE_4   # what an FBD is, contact→arrow, no-force-needed
incline:      STATE_5             # decomposition, N = mg·cos θ
```
Default aspect = foundational. PRIMARY aha (below) lives in S2 ⊂ foundational — coverage rule satisfied.
**Cycle-2 correction:** the earlier `tension: STATE_6` aspect was removed with the hanging-body state
(§2) — tension is deferred to a dedicated `tension_in_string` concept, not this one.

## 8. Prerequisites (advisory only, Rule 23)
`normal_reaction` (shipped gold), `field_forces` (shipped gold — gravity acts without contact,
patches the S1 "where does mg attach" cliff). **Cycle-2 correction:** `tension_in_string` dropped
from this list — it was only relevant to the deleted hanging-body state (§2).

## 9. Real-world anchor (Rule 35 — universal, culture-neutral, plain English)
Primary: **a phone resting on a tilted desk stand** — it visibly does not slide, yet nothing seems
to hold it; the FBD is the picture that names the invisible pushes (and the stand's tilt IS the S5
incline). Secondary: **a crate pushed at a steady pace across a rough loading-bay floor** (the
S3/S4 payoff: push and friction arrows equal and opposite, so it neither speeds up nor slows down).
Tertiary: every exam problem with forces starts the same way — isolate the one body, turn every
touch into a labeled arrow. **Cycle-2 correction:** the earlier secondary anchor ("a lamp hanging
from its cable", tied to the deleted S6 tension state) is replaced by the crate anchor above, which
matches the actual JSON's `real_world_anchor.secondary`. Both remaining anchors are objects/scenes
findable anywhere on Earth; both are physics-true at full depth.
DC Pandey check: consulted Laws of Motion table of contents for scope only (FBD is its own
sub-topic preceding applications) — no teaching sequence, example, or figure imported.

## 10. Definition of Done (Gate 0 — no TBDs)
(a) 6 states as tabled above (**cycle-2 correction:** was 7 — the hanging-body/tension state was
deleted, §2). (b) Symbol-label table (engine-supplied Unicode sprites): mg · N · fₛ/fₖ · F · ΣF ·
mg·sin θ · mg·cos θ — narration names each exactly once before relying on it (T dropped with the
tension state). (c) RHR plan: N/A (no cross products in this concept). (d) Motion plan: per-state
archetype column above — no static state; S1 dim-then-brighten, S2 phase-timed arrow draws
(`phases[]`, never hardcoded `*_at_ms`), S3/S4 glide (10 s coast, ±10 m about the track centre —
see §4 framing arithmetic), S5 static 30° tilt with component-arrow reveal, S6 free-run.
(e) Modes: conceptual only. (f) `assessment` + `coverage_map` authored; misconception_watch exactly
at S1/S3/S5. (g) Macro↔micro (Rule 33): N/A-macro — this concept's variable is the diagram itself;
the "real number" duty is met by live readouts (N, F_net) tracking every manipulation. (h) Canvas
budget (Rule 34): one short formula line per state as tabled, ≤5-word delta cues, value-only HUD.
Retrofit registration (spec §8.8): flip `CONCEPT_RENDERER_MAP` + `panelConfig.ts` from
`mechanics_2d` to `field_3d`; clear `simulation_cache` rows (Rule 9); do NOT touch the dormant
`MECHANICS_SCENARIO_MAP` string; do NOT add to `PCPL_CONCEPTS`.

## Two-pass lens
**Block 1.** Prerequisite cliff: `normal_reaction` missing → S2 breaks ("why does the table push?")
— S2 narration includes one clause "the table pushes back exactly as hard as it is pressed";
`field_forces` missing → S1's mg-with-no-contact confuses — S1 includes "gravity needs no touch."
JEE-backwards trace: "A block moves at constant velocity on a rough floor under a horizontal push.
Draw its FBD and state the relation between the forces." Needs: isolation (S1), weight+normal (S2),
no net force at constant v (S3), applied = friction (S4) — all delivered; the incline variant (S5)
covers the standard alternate. Misconception-entry mapping: §5 above (the S3 belief is typically
PLANTED by S4's applied arrow — S4's narration explicitly says the push balances friction, it does
not sustain motion).
**Block 2.** PRIMARY aha (S2): *every interaction you remove comes back as exactly one arrow — the
messy world becomes a two-arrow diagram.* SUPPORTING aha (S5): *mg never tilts; the surface's
geometry decides how it splits — so N is not a fixed partner of mg.* Cohesion: S5's aha is the
primary applied under rotation — it reinforces "arrows come from rules, not habit." Wrong-belief
setup: S1 builds "diagrams must show everything" confidence broken by S2's two-arrow payoff; S2's
N = mg comfort is the earned wrong belief S5 breaks.

## Engine-bug-queue consultation
DB query not runnable from this (read-only) architect context; consulted the committed scar surface
instead: `docs/loop_runs/lom/_engine/scar_candidates.sql` (14 rows) + phase0 report §5/§7. Applied:
per-state side-on `camera_position` everywhere (label-projection scar), short single-line formulas
(formula-width scar), `phases[]`/scenario-cue timing (no hardcoded *_at_ms), specific glow ids only.
**Cycle-2 note:** the original consultation also applied "own body id for the hanging body" and
`surface.hidden` (04aa6fa) for the since-deleted S6 tension state — moot now that S6 is gone from
this concept (kept here only as authoring history, not a live constraint). **Cycle-2 addition:** a
FIXED engine defect (`RESET_TRAJECTORY` silent no-op for `newtons_laws_body`, commit `cd8fe67`) was
the real cause of a since-corrected coast-framing finding — see §4's framing arithmetic note. FLAG to
quality_auditor: confirm no additional FIXED rows landed for `alex:architect` since 2026-07-25.
