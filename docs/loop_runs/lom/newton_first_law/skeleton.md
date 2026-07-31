# ARCHITECT SKELETON — `newton_first_law` (Laws of Motion, Class 11 — concept 1/3, lom-b)

> Engine: `newtons_laws_body` field_3d scenario (docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md §1/§6).
> HARD CONSTRAINT honored: every state below is a pure `newtons_laws_body` config block —
> only enumerated modes, keys, and arrow kinds. NO renderer edits requested. **ENGINE GAP: none.**

## 1. Atomic claim

This concept teaches ONE idea: a body's velocity stays exactly constant (including v = 0) unless a
NET external force acts on it — and only that. It does NOT cover how much a net force changes
velocity (deferred to `newton_second_law`), force pairs (`newton_third_law`), drawing all forces on
a body (`free_body_diagram`), or the friction threshold model (`block_on_incline` /
`friction_static_kinetic`).

## 2. State count + arc — 4 states (founder-approved §6 spine; simplest concept in the chapter)

| State | Purpose (one line) | teaching_method |
|---|---|---|
| STATE_1 | The aha: on a frictionless floor a moving block coasts at constant v forever — zero force needed to KEEP moving | (straightforward motion beat — no field / omit) |
| STATE_2 | Contrast pair of S1: identical launch, friction switched on — a REAL visible backward force stops it, not "natural tiredness" | misconception_confrontation (16a contrast beat, no predict-pause) |
| STATE_3 | Rest is the same law: mg and N both act, they balance, ΣF = 0, v stays 0 — rest = balanced forces, not absent forces | (straightforward motion beat) |
| STATE_4 | Explore: teacher drives m, F, μₛ, μₖ, v₀ and watches when v changes vs when it doesn't | exploration_sliders |

1 body ("A"), theta_deg = 0 throughout, no pulley, frictionless except STATE_2 (and sandbox sliders).

## 3. Per-state choreography + control plan (Rule 31 — REQUIRED control table)

| State | Teaches | Motion archetype | Delta line (≤5-word on-canvas cue, Rule 32c) | `newtons_laws_body.mode` | `controls_visible` | `glow_focal` | `readouts` | Narration budget / duration | `advance_mode` |
|---|---|---|---|---|---|---|---|---|---|
| STATE_1 | Constant v needs ZERO net force | translate-through | "No force — never slows" | `coast_no_force` | `[]` (watch beat) | body A mesh (json_author binds exact id; arrows use `nlb_arrow_A_<kind>` per spec §3) | `['v','F_net']` | 40–50 EN words / ~16 s | `manual_click` |
| STATE_2 | Friction — a real backward force — is what stops everyday objects | translate-through (**declared contrast pair with S1** — delta names the flip: friction ON) | "Friction on — block stops" | `coast_with_friction` | `[]` (pure contrast beat) | `nlb_arrow_A_friction` | `['v','f','F_net']` | 40–50 EN words / ~14 s | `manual_click` |
| STATE_3 | Rest = balanced forces (ΣF = 0), the v = 0 case of the SAME law | null-result-hold | "At rest — forces balance" | `rest_equilibrium` | `['m']` (mass changes mg AND N together — still balanced, still at rest) | base focal `nlb_arrow_A_weight`, phase handoff to `nlb_arrow_A_normal` (the net arrow hides at zero by engine rule — never the focal) | `['N','F_net']` | 35–45 EN words / ~12 s | `manual_click` |
| STATE_4 | All of it, teacher-driven: when does v change? | drag-sandbox | "All yours" | `sandbox` | `['m','F','mu_s','mu_k','v0']` (ALL for this concept; **theta excluded** — flat-ground concept, incline belongs to `block_on_incline`) | body A mesh | `['v','a','f','F_net','F_applied','N']` | 0 / open | `interaction_complete` |

Rule 15: `manual_click` + `interaction_complete` = 2 distinct advance modes. No `wait_for_answer`, no `pause_after_ms`.

**Per-state choreography detail (Rule 32 legibility):**

- **STATE_1** — Home pose established: long flat surface, block at left. Cause first: the block is
  ALREADY moving at launch (initial_velocity seeds it; the "cause" being taught is the ABSENCE of
  force — F_net readout reads 0.00 from t = 0). Block glides the full visible length at constant v;
  `v` readout never changes. Arrows: `weight` + `normal` shown small and balanced (context), `net`
  named but HIDDEN by the engine's zero-hides rule — narration points at the empty space + F_net = 0.00.
  **Placement is COMPUTED, not guessed** (motion-bound scar): `surface.length_m: 9`,
  `initial_position_m: -7`, `initial_velocity_mps: 1.0` → 14 s of travel ends at +7, never touching
  the ±9 clamp, so the "never stops" story is never contradicted by the bound.
  Camera: authored side-on-ish `camera_position` (label-projection scar — the default oblique
  3/4 camera foreshortens the arrow labels).
- **STATE_2** — SAME apparatus, SAME home pose, SAME launch point and v₀ = 1.0 (Rule 32b: only the
  taught variable — friction — changes). Cause first: the friction arrow `fₖ` appears glowing AT
  launch pointing backward (the cause is visible from frame 1), THEN the block visibly decelerates
  and dies within ~1.5–2.5 m of its start while S1's identical launch crossed ~14 m.
  `mu_k` ≈ 0.03–0.05 (physics_author computes the exact value so stop time ≈ 3–5 s — long enough to
  read, short enough to contrast). At stop, `f` and the friction arrow go to zero/hidden (engine
  zero-hides rule) — the readout row going quiet IS part of the story.
- **STATE_3** — Block sits at surface center, v = 0. Choreography = glow handoff via `phases[]`
  (glow-only phases — verified: `action` strings are inert in the engine, so NO arrow reveal-build
  is designed): base focal = weight arrow (mg, downward), phase at ~4000 ms hands focal to the
  normal arrow (N, upward, equal length), F_net readout holds 0.00 throughout. The deliberate
  "nothing moves" IS the beat (null-result-hold): huge forces present, zero net, zero motion.
  `m` slider live: dragging mass grows BOTH arrows together, N readout tracks, F_net stays 0.00,
  block never moves. One phase glow at a time (Rule 32e — phases hand off, never overlap).
- **STATE_4** — `trusted_drag_seizes: true`, `idle_auto_sweep: { param: 'F', range: [-4, 4] }`
  (motion until the teacher seizes; Rule 37 free-run is automatic via `interaction_complete`).
  Teacher recipe narrated zero words; the sim answers: F = 0 + μ = 0 → v frozen constant;
  any nonzero ΣF → v drifts.

**Formula surface per state (Rule 34b — ONE, via state-level `formula_overlay` → `#nlb_formula`, Unicode):**
S1: `ΣF = 0 ⇒ v = constant` · S2: `ΣF ≠ 0 ⇒ v changes` · S3: `N = mg ⇒ ΣF = 0` · S4: `ΣF = 0 ⇔ v constant`

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots, no per-state tic)

| # | Wrong belief | Confronted at | `misconception_watch` beat |
|---|---|---|---|
| M1 | "Moving things stop on their own; keeping something moving needs a continuous push" (the Aristotelian default — every object the student has ever pushed stopped) | STATE_1 + STATE_2 as a contrast PAIR | belief: motion needs a sustained force · visual_counter: two identical launches, the ONLY change is friction — frictionless glide never slows (F_net = 0.00 the whole way); with friction a NAMED, visible backward arrow does the stopping · one_line_fix: "Things don't stop on their own — a real backward force stops them." |
| M2 | "An object at rest has no forces acting on it" | STATE_3 | belief: rest = no forces · visual_counter: two full-length arrows (mg down, N up) on the resting block with ΣF readout pinned at 0.00 — big forces, zero net · one_line_fix: "Rest is balanced forces, not absent forces." |

EPIC-C branches: ZERO (EPIC-L-first directive 2026-06-10). No board/competitive `mode_overrides` (Rule 20 [D]).

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates)

- **STATE_1** — the core abstraction (idealization: "where is this frictionless floor in real life?"
  is the historically documented sticking point; Galileo's argument lives here).
- **STATE_3** — "balanced vs absent" is the second documented cliff; multiple phrasings of the same
  confusion ("if forces act, why doesn't it move?").

(These are the same states carrying the Pass-1 cliff sentences — cross-reference consistent.)

## 6. Drill-down clusters (3 candidates each; physics_author fleshes trigger_examples)

STATE_1: `motion_needs_force_myth` (why everyday pushing experience misleads) ·
`frictionless_idealization` (where near-frictionless surfaces actually exist — ice, air tracks, space) ·
`galileo_inclined_plane_argument` (the limiting-case reasoning behind the law).

STATE_3: `rest_means_no_forces` (forces present but hidden at rest) ·
`balanced_vs_zero_forces` (ΣF = 0 with large individual forces) ·
`net_force_vs_individual_forces` (why only the SUM decides the motion).

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational:      STATE_1 → STATE_3   # "what is Newton's first law / inertia"
  friction_stopping: STATE_2             # "why do things stop then?"
  rest_equilibrium:  STATE_3             # "is a resting object force-free?"
  explore:           STATE_4
```
PRIMARY aha (S1–S2 pair) is inside `foundational` — foundational-coverage rule satisfied, no exit-pill needed.

## 8. Prerequisites (advisory only — Rule 23)

- `instantaneous_velocity` (shipped, kinematics track) — "velocity" as a quantity that can be read
  off and be constant.
- `friction_static_kinetic` (shipped, field_3d) — helps STATE_2 but is patched inline (see cliff plan).
- `normal_reaction` (LEGACY Socratic-era JSON, not product) — advisory pointer only; STATE_3
  patches the gap inline.

## 9. Real-world anchor (Rule 35 — universal, culture-neutral, physics-true)

**Primary:** a space probe coasting between planets — engines shut off years ago, and it has not
slowed by a single meter per second: nothing out there pushes it OR drags it, so it keeps its
velocity. **Secondary:** slide the same object across a rough table (dies in half a meter) and then
across smooth ice (glides far) — the closer the floor gets to frictionless, the closer real life
gets to the space probe. Why it hooks a Class 10–12 student: it flips a lifetime of experience —
every push they've ever made "wore off" — and reveals that the wearing-off was always a hidden,
nameable force, never a property of motion itself. No places, brands, currency, or country-specific
context anywhere in captions, labels, or narration.

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** S1 frictionless coast at constant v (F_net = 0.00) · S2 identical launch + friction
arrow → stops · S3 rest with mg/N balanced, ΣF = 0, m slider live · S4 sandbox, all controls,
idle F-sweep, trusted drag.

**(b) Symbol-label table (all Unicode, Rule 34c):**
| Quantity | On-canvas label |
|---|---|
| velocity readout | `v` (m/s) |
| weight arrow | `mg` |
| normal arrow | `N` |
| kinetic/static friction arrow + readout | `fₖ` / `fₛ` (engine supplies the subscript glyph) |
| net force arrow + readout | `ΣF` |
| applied force (sandbox) | `F` |
| friction coefficients (sliders) | `μₛ`, `μₖ` |
| mass (slider + body label) | `m` |

**(c) Right-hand-rule plan:** N/A — no cross products in this concept (documented, not TBD).

**(d) Motion plan:** S1 block translates full surface at constant v (engine integrator, drive = 0);
S2 block decelerates to rest under fₖ (integrator, cause-arrow visible from frame 1); S3 glow
handoff weight→normal via glow-only `phases[]` + live m-slider arrow rescale (null-result beat —
declared `reveal_hold` class by the engine's mode mapping); S4 idle_auto_sweep on F until seized,
free-running clock (Rule 37 automatic).

**(e) Modes:** conceptual EPIC-L only (Rule 20 [D] — no board/competitive overrides).

**(f) assessment + coverage_map + misconception_watch:** authored (concept post-2026-05-30).
Assessment plan (3 items): (i) net force needed to keep a hovering/coasting object at constant
velocity → zero; (ii) identify what stops a sliding object → friction, not "running out of force";
(iii) resting object: which is true → forces act and balance. `coverage_map` maps i→S1, ii→S2, iii→S3.

**(g) Macro↔micro plan (Rule 33):** NOT TRIGGERED — the taught variable (velocity of a visible
block) is directly macroscopic; no micro mechanism band. Instruments: value-only HUD readouts
(`v`, `f`, `ΣF`, `N`) are the live numerics per 33d.

**(h) Canvas budget (Rule 34):** per state — ONE `formula_overlay` string (§3 table), top caption =
the ≤5-word delta cue only, value-only HUD (engine `#nlb_readout` rows), narration prose in the
strip below the canvas. HUD/formula/slider zones are engine-reserved (bottom-anchored panel,
top:52px HUD — seam E rows).

---

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs:** (1) `instantaneous_velocity` — breaks at STATE_1 if "constant v" is fuzzy;
patch: S1 narration explicitly anchors on the readout ("watch the number v — it never changes").
(2) friction-as-a-force — breaks at STATE_2; patch: one clause names friction as "a real backward
force from the surface", pointing at the glowing fₖ arrow (doesn't condescend — it's the beat's cue
line anyway). (3) normal force — breaks at STATE_3; patch: one clause: "the floor pushes up exactly
as hard as gravity pulls down", co-timed with the N-arrow glow handoff.

**JEE-backwards trace:** *"A block moves on a frictionless horizontal surface at constant 2 m/s.
The net force required to keep it moving is: (A) mg (B) 2m (C) zero (D) depends on mass."*
Pieces: constant v ⇔ ΣF = 0 → STATE_1; distractor A (weight must be 'overcome') killed by STATE_3
(mg is cancelled by N, contributes zero net); distractor "motion consumes force" killed by STATE_2;
mass-independence seen live via the S3/S4 m slider. No missing piece — no state added.

**Misconception entry mapping (16a):** M1 → planted by all prior lived experience (not by our
sentences); confronted proactively by the S1/S2 contrast pair (misconception_watch on STATE_2, the
state that names the hidden force). Planting-risk check: S1 must NEVER say "the block is given a
push that keeps it going" — narration says it "was set moving" (one-time launch), preventing a
sustained-push reading. M2 → planted if S1/S2 show only moving bodies; confronted at STATE_3
(misconception_watch there). No EPIC-C branches (deferred).

### Block 2 — Aha-moment designation

- **PRIMARY aha (the 10-year memory):** *Nothing is needed to keep a thing moving — force is only
  needed to CHANGE motion; everything you ever watched stop was stopped by a hidden, visible-here
  force called friction.* Lands across the STATE_1→STATE_2 contrast pair; surviving/home state = STATE_1.
- **SUPPORTING aha (1):** *Rest and uniform motion are the SAME state of the law — a resting object
  is a fully-forced, perfectly balanced object (ΣF = 0), not a force-free one.* (STATE_3.)
- **Cohesion check:** the supporting aha generalizes the primary (ΣF = 0 covers v = 0 and
  v = constant identically) — it reinforces, doesn't stand alone. 1 + 1 = sweet spot.
- **Wrong-belief setup:** the primary aha's confident-wrong-belief (M1) is pre-earned by lived
  experience — no in-sim setup states needed; STATE_2 makes the old belief's evidence (things stop)
  reappear WITH its true cause visible. The supporting aha's wrong belief (M2) is set up by S1–S2
  themselves (two states of moving bodies make "force ⇒ motion" feel confirmed) — S3 breaks it.
- **Foundational-coverage:** PRIMARY aha states (S1–S2) ⊂ `foundational` range. Satisfied.

---

## Engine bug queue consultation (pre-authoring)

Script not runnable in the architect thread (no shell); consulted
`docs/loop_runs/lom/_engine/scar_candidates.sql` (all 12 nlb seam rows) +
`docs/FIELD3D_SCENARIO_CHECKLIST.md`. Relevant rows and how this skeleton satisfies each:

- **Motion-bound / clamp scar** (`field3d_motion_bound_derived_from_old_apparatus…`): S1/S2
  placements COMPUTED against surface.length_m so the coast never hits the clamp (§3). No pulley here.
- **Label projection scar** (`…world_space_label_decollision_is_projection_blind…`): every state
  authors its own `camera_position` (near side-on) — the oblique default is for field scenarios.
- **HUD zero-stub scar** (`…readout_enum_prints_zero_stub_rows…`): single flat surface body — N and
  f are legitimately meaningful; F_net = 0.00 in S1/S3 is the TAUGHT value, not a stub. No hanging body.
- **Slider-row jump scar** (`…per_state_slider_rows_collapsed…`): engine-side (visibility:hidden);
  authoring only names tokens some state uses — `['m','F','mu_s','mu_k','v0']` union, no theta row ever built.
- **Formula-wrap scar** (`…formula_surface_wraps_back…`): longest authored formula is
  `ΣF = 0 ⇔ v constant` — short by design; verified against the concept's longest string.
- **Pick-proxy / sandbox scars** (seam E): engine-side; sandbox authored exactly per spec §4
  (trusted_drag_seizes + idle_auto_sweep) so the founder hand-tests the drag (THE EYE can't).
- **F3D_REVEAL_KEYS / deriveStateMeta scar** (seam F): engine-side, flagged for json_author's
  self-verify — confirm the cached-shape derivation before THE EYE.
- **Pedagogy directives** (checklist): concrete-before-abstract (real coast before the ΣF = 0
  statement), visual-matches-narration (never SAY "no force" while a net arrow is visible — engine
  zero-hides guarantees it), don't-pre-spoil (F = ma never appears; a-readout only in sandbox),
  no reveal desync (glow phases at authored at_ms tuned to narration beats by physics_author).

**DC Pandey check:** consulted Laws of Motion table of contents only to confirm "Newton's first law
/ inertia" is a standalone lead section before second-law problems. No teaching method, no example
problem, no figure reference imported.

## ENGINE GAP

None. All four states are expressible with spec §1 as shipped. Two non-gap notes for downstream
agents: (1) `phases[].action` is inert in the live renderer (verified by grep — stored, never
consumed), so no state relies on phase actions; phases are used for glow handoff ONLY (STATE_3).
(2) The net-force arrow auto-hides at ΣF = 0 (spec §3 zero-hides) — S1/S3 narration is written to
treat the ABSENCE + the 0.00 readout as the visual, which is the engine's intended behavior.

---
*Handoff: physics_author (motion timelines, exact μₖ/v₀/placement numbers, narration scripts within
the declared budgets, phase at_ms tuned to script beats).*
