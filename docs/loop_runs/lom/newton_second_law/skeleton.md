# ARCHITECT SKELETON — `newton_second_law` (Laws of Motion, Class 11 — concept 2/3, lom-b)

> Engine: `newtons_laws_body` field_3d scenario (docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md §1/§6).
> HARD CONSTRAINT honored: every state below is a pure `newtons_laws_body` config block —
> only enumerated modes, keys, and arrow kinds. NO renderer edits requested. **ENGINE GAP: none.**
> Scene constraints honored: theta_deg = 0, μ = 0 (frictionless) everywhere, no pulley, no hanging
> body. Bodies per spec §6: "2 then 1" — two independent side-by-side bodies in the compare states.

> INPUT DISCREPANCY RESOLVED (architect, 2026-07-25): the dispatch prompt said "single body", but the
> founder-approved engine spec §6 maps `newton_second_law` to "**2 then 1**" bodies (same-F/different-m,
> then different-F/same-m), and the state file says "plain single/two-body cases". The spec §6 mapping
> is followed: two INDEPENDENT side-by-side bodies (no pulley — Branch A, each integrated as its own
> single-body case), flat ground, μ = 0 throughout. This is exactly what the engine's "two bodies with
> NO `pulley`" path exists for.

## 1. Atomic claim

This concept teaches ONE idea: a net force gives a body ACCELERATION — proportional to the force
and inversely proportional to the mass (a = ΣF/m) — and only that. It does NOT cover why zero net
force means constant velocity (done in `newton_first_law`), force pairs (`newton_third_law`),
drawing all forces on a body (`free_body_diagram`), friction or inclines
(`block_on_incline` / worktree A), or the vector/arbitrary-direction form of the law (legacy
sibling `newton_second_law_direction`, advisory only).

## 2. State count + arc — 4 states (simple tier per §5 table; founder: deliberately one of the simplest in the chapter)

| State | Purpose (one line) | teaching_method |
|---|---|---|
| STATE_1 | The aha: switch a steady force ON — the block's speed never stops climbing while `a` holds constant; force buys acceleration, not velocity | (straightforward motion beat — omit field) + misconception_watch M1 |
| STATE_2 | Same force, different mass: two identical force arrows, the double-mass block gets exactly HALF the acceleration — mass is resistance to acceleration | misconception_confrontation (16a contrast beat, no predict-pause) |
| STATE_3 | Declared contrast pair of S2 — the flip: same mass, different force — double the force, exactly double the acceleration; together they READ as a = F/m | (straightforward motion beat — omit field) |
| STATE_4 | Explore: teacher drives m, F, v₀ on one body and watches `a` obey a = F/m live | exploration_sliders |

Deliberately does NOT reuse `newton_first_law`'s beat shapes: no coast beat, no null-result-hold
rest beat — every guided state here has a body actively accelerating under a visible cause.

## 3. Per-state choreography + control plan (Rule 31 — REQUIRED control table)

| State | Teaches | Motion archetype | Delta line (≤5-word cue, Rule 32c) | `newtons_laws_body.mode` | `controls_visible` | `glow_focal` | `readouts` | Narration budget / duration | `advance_mode` |
|---|---|---|---|---|---|---|---|---|---|
| STATE_1 | A steady force produces steady ACCELERATION — v climbs without limit while a is pinned | **`accelerate-run`** (coined: a body speeds up from rest under one constant visible cause while readouts track the changing rate — not in the seed vocabulary; `translate-through` is constant-v passage, this is the opposite) | "Force on — speed climbs" | `accelerate_applied_force` | `[]` (pure watch beat — cleanest cause→effect) | `nlb_arrow_A_applied` | `['v','a','F_applied']` | 40–50 EN words / ~14 s | `manual_click` |
| STATE_2 | Mass divides the effect: same F, double m → half a | **`side-by-side-race`** (coined: two bodies launched simultaneously differing in exactly ONE parameter; the growing spatial gap IS the readout — no seed archetype covers simultaneous parallel comparison) | "Same force — heavier lags" | `compare_mass_same_force` | `['m2']` (the taught variable IS the second body's mass — dragging m₂ live changes its a = F/m₂ mid-run) | `nlb_body_B` (the varied body) | `['v','a']` (state-level enum prints per body — here that coarseness works FOR us: both bodies' a values sit side by side, 0.20 vs 0.10) | 40–55 EN words / ~12 s | `manual_click` |
| STATE_3 | Force multiplies the effect: same m, double F → double a | `side-by-side-race` (**declared contrast pair with STATE_2** — delta names the flip: now MASS is equal and FORCE differs) | "Same mass — stronger force wins" | `compare_force_same_mass` | `[]` (pure contrast watch beat; see engine note (2) below on why no F slider here) | `nlb_arrow_B_applied` (the doubled force arrow — visibly twice as long, Rule 29 magnitude-length exception) | `['v','a']` | 35–50 EN words / ~12 s | `manual_click` |
| STATE_4 | All of it: a = ΣF/m read live off the instruments | `drag-sandbox` | "All yours" | `sandbox` | `['m','F','v0']` (ALL for this concept; **μₛ/μₖ excluded** — frictionless concept, friction lives in `newton_first_law`'s sandbox and `block_on_incline`; **theta excluded** — flat-ground concept) | `nlb_body_A` | `['v','a','F_applied','F_net']` | 0 / open | `interaction_complete` |

Rule 15: `manual_click` + `interaction_complete` = 2 distinct advance modes. No `wait_for_answer`, no `pause_after_ms`.

**Per-state choreography detail (Rule 32 legibility):**

- **STATE_1** — Home pose: flat surface, body A ("m₁") at the left, AT REST, v = 0.00. Cause first
  (32a): the applied-force arrow `F` appears glowing on the resting block, holds a readable beat
  (~0.8 s), THEN the block starts moving and visibly gains speed. The two readouts tell the whole
  story: `a` pins at one value from the moment F appears and NEVER changes; `v` climbs every
  second by the same amount. **Placement COMPUTED, not guessed** (motion-bound scar): indicative
  numbers `surface.length_m: 10`, `initial_position_m: -8` (18 m of travel available),
  `mass_kg: 2`, `applied_force_N: 0.3` → a = 0.15 m/s², distance(14 s) = 14.7 m, ends at +6.7
  with 3.3 m of clamp margin; v(14 s) = 2.1 m/s. Physics_author finalizes exact values under the
  hard constraint: the block must NEVER touch the ±length_m clamp within state dwell + frozen-pin
  margin (a clamped block would show v = 0 under a live F arrow — a HUD/caption contradiction,
  the exact scar class that parked `newton_first_law`). Camera: authored near side-on (projection
  scar), e.g. `[0, 2.6, 12]`.
- **STATE_2** — SAME apparatus + home-pose start line; the NEW thing is body B ("m₂", double mass)
  appearing in the adjacent lane (engine's independent side-by-side path). Cause first: TWO
  identical applied-force arrows — same length, same label F — appear on both resting blocks,
  beat, then both launch simultaneously. Only the taught variable differs (32b): m₁ = 1 kg,
  m₂ = 2 kg, F = 0.2 N each → a = 0.20 vs 0.10 m/s². The gap between the blocks grows every
  second; at any instant m₁ has covered exactly TWICE the distance, and the per-body `a` readouts
  show 0.20 vs 0.10 — the clean 2:1 the narration points at. 12 s run: d₁ = 14.4 m (ends +6.4,
  clamp-safe), d₂ = 7.2 m. Dragging the `m₂` slider live changes B's acceleration mid-run
  (integrator reads mass per frame) — heavier = lags harder, lighter = catches up.
- **STATE_3** — SAME two-lane apparatus, blocks back at the start line (home-pose continuity 32d
  — no teleport-rebuild, just the per-state reset). The flip (named by the delta cue): masses now
  EQUAL (2 kg each), forces DIFFERENT — F_A = 0.2 N, F_B = 0.4 N → a = 0.10 vs 0.20 m/s². The
  doubled arrow on B is visibly twice as long (magnitude-driven length, Rule 29 exception) and is
  the single glow focal. Mirror-image numbers to S2 on purpose: the SAME 2:1 separation picture,
  produced by the OTHER knob — that symmetry is what makes a = F/m legible as one law with two
  dials. 12 s run, both clamp-safe (max d = 14.4 m).
- **STATE_4** — Back to ONE body (spec §6 "2 then 1"). `trusted_drag_seizes: true`,
  `idle_auto_sweep: { param: 'F', range: [-2, 2] }` (kept modest so the auto-sweep doesn't slam
  the clamp; Rule 37 free-run automatic via `interaction_complete`). Teacher recipe, zero words
  narrated: set F, read a; double m, watch a halve; reverse F's sign, watch the block brake then
  accelerate backward — `a = ΣF/m` obeyed live on the HUD.

**Formula surface per state (Rule 34b — ONE per state, via `formula_overlay` → `#nlb_formula`, Unicode):**
S1: `constant F ⇒ constant a` · S2: `a = F/m` · S3: `a ∝ F` · S4: `a = ΣF/m`
(Longest string is `constant F ⇒ constant a` — short by design; formula-wrap scar satisfied.)

**Body labels (Unicode, consistent across ALL states):** body A = `m₁`, body B = `m₂` — never
re-labeled per state, so the build-once union meshes carry one stable label each (defensive
against the build-once/per-state-flag scar class; ids A/B and all build-time-consumed flags are
identical in every state — no body ever hangs).

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots, no per-state tic)

| # | Wrong belief | Confronted at | `misconception_watch` beat |
|---|---|---|---|
| M1 | "A constant force produces a constant speed — force is what velocity is made of" (the everyday default: steadily pushed furniture moves at steady speed, because hidden friction cancels the push) | STATE_1 | belief: constant force → constant velocity · visual_counter: the F arrow never changes length and the `a` readout never changes value, yet `v` climbs every single second without limit — the wrong expectation (v flat) is directly contradicted by the live readout pair · one_line_fix: "Force sets acceleration, not velocity — hold the force and the speed keeps climbing." |
| M2 | "The same push moves everything the same way — mass doesn't really matter, heavy things are just slower to get going" | STATE_2 | belief: force alone decides the motion · visual_counter: two IDENTICAL force arrows, the only difference is mass — and the double-mass block gets exactly half the acceleration at every instant (a readouts 0.20 vs 0.10, distances 2:1) · one_line_fix: "Mass is resistance to acceleration — double the mass, half the acceleration." |

EPIC-C branches: ZERO (EPIC-L-first directive 2026-06-10). No board/competitive `mode_overrides` (Rule 20 [D]).

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates)

- **STATE_1** — the core abstraction: force↔acceleration (not velocity) is THE documented Newton-II
  cliff; "if the force is constant why does it keep speeding up?" has many phrasings.
- **STATE_2** — mass-as-inertia: "why does the same push do less to a heavier thing" plus the
  chronic mass/weight conflation both live here.

(Same states carry the Pass-1 cliff sentences — cross-reference consistent.)

## 6. Drill-down clusters (3 candidates each; physics_author fleshes trigger_examples)

STATE_1: `force_gives_acceleration_not_velocity` (the F↔v vs F↔a confusion itself) ·
`what_if_the_force_stops` (cut F → a goes to zero but v KEEPS — the bridge back to `newton_first_law`) ·
`net_force_vs_applied_force` (why frictionless makes F_applied = ΣF here, and when it wouldn't).

STATE_2: `mass_as_inertia` (mass as reluctance to change motion, not "heaviness") ·
`mass_vs_weight_confusion` (m in a = F/m is kilograms, not the pull of gravity) ·
`proportionality_reasoning` (double/halve reasoning on a = F/m without plugging numbers).

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational:     STATE_1 → STATE_3   # "what is Newton's second law / F = ma"
  mass_dependence:  STATE_2             # "why does mass make it slower?"
  force_dependence: STATE_3             # "what does a bigger force do?"
  explore:          STATE_4
```
PRIMARY aha (STATE_1) is inside `foundational` — foundational-coverage rule satisfied, no exit-pill needed.

## 8. Prerequisites (advisory only — Rule 23)

- `newton_first_law` (shipped + SEALED, this worktree) — zero net force ⇒ v constant is the
  baseline this concept adds to; the S1 narration leans on it in one clause.
- `instantaneous_velocity` (shipped, kinematics track) — reading v as a live number.
- Acceleration-as-rate-of-change: no shipped atomic cited; patched inline at S1 (see cliff plan) —
  `a` is anchored on the readout behavior ("v climbs by the same amount every second"), never on
  an untaught definition. (`newton_second_law_direction` is a legacy sibling, NOT a prerequisite.)

## 9. Real-world anchor (Rule 35 — universal, culture-neutral, physics-true)

**Primary:** an elevator starting to rise — the motor applies a steady extra force, and for those
first moments you feel the floor press harder while the elevator's speed climbs from zero; the
same steady force, speed rising the whole time it acts. **Secondary:** pushing a loaded luggage
cart versus an empty one with the same effort — the empty cart gains speed twice as fast; the
load didn't change your push, it changed what your push achieves. Why it hooks a Class 10–12
student: both are felt-in-the-body experiences where the FORCE is steady but the SPEED is visibly
changing — the exact split between F and a this concept exists to teach — and the cart comparison
is a literal a = F/m experiment they have already performed without naming it. No places, brands,
currency, or country-specific context anywhere in captions, labels, or narration.

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** S1 single body accelerates from rest under a constant glowing F arrow (a pinned,
v climbing) · S2 two-lane race, same F / m₁ vs m₂ = 1:2, a readouts 2:1, live m₂ slider ·
S3 two-lane race, same m / F ratio 1:2, doubled arrow glows, a readouts 1:2 · S4 single-body
sandbox, controls m/F/v₀, idle F-sweep, trusted drag.

**(b) Symbol-label table (all Unicode, Rule 34c):**
| Quantity | On-canvas label |
|---|---|
| velocity readout | `v` (m/s) |
| acceleration readout | `a` (m/s²) |
| applied-force arrow + readout | `F` |
| net-force arrow + readout | `ΣF` |
| body labels | `m₁`, `m₂` |
| mass sliders | `m`, `m₂` |
| initial-velocity slider (sandbox) | `v₀` |

**(c) Right-hand-rule plan:** N/A — no cross products in this concept (documented, not TBD).

**(d) Motion plan:** S1 body A integrates from rest under constant F (engine Branch A; cause-arrow
visible one beat before motion); S2 bodies A+B integrate simultaneously under equal F, unequal m
(independent side-by-side path); S3 same pair, equal m, unequal F (contrast pair); S4
idle_auto_sweep on F until seized, free-running clock (Rule 37 automatic). Every state's placement
computed against `surface.length_m` so no body reaches the clamp inside its dwell + frozen-pin
margin (§3 indicative numbers; physics_author finalizes).

**(e) Modes:** conceptual EPIC-L only (Rule 20 [D] — no board/competitive overrides).

**(f) assessment + coverage_map + misconception_watch:** authored (concept post-2026-05-30).
Assessment plan (3 items): (i) a constant net force acts on a body — what stays constant? →
acceleration, while velocity keeps changing (S1); (ii) same force, mass doubled → acceleration
halves (S2); (iii) same mass, force doubled → acceleration doubles (S3). `coverage_map` maps
i→S1, ii→S2, iii→S3; S4 in `non_assessed_states`.

**(g) Macro↔micro plan (Rule 33):** NOT TRIGGERED — the taught variables (force on, acceleration
of, a visible block) are directly macroscopic; no micro band. Instruments: value-only HUD readouts
(`v`, `a`, `F_applied`, `ΣF`) are the live numerics per 33d — and in this concept the `a` readout
is itself the star witness (pinned in S1, 2:1 in S2/S3).

**(h) Canvas budget (Rule 34):** per state — ONE `formula_overlay` string (§3 list), top caption =
the ≤5-word delta cue only, value-only HUD (engine `#nlb_readout` rows), narration prose in the
strip below the canvas. HUD/formula/slider zones are engine-reserved (bottom-anchored panel,
top:52px HUD). **`readouts` never includes `f` or `N`** — μ = 0 makes f identically zero (a
permanent "0.00" stub row, the HUD-stub scar class) and N teaches nothing here.

---

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs:** (1) `newton_first_law` — breaks at STATE_1 if the student never learned
that zero force means v holds; patch: one S1 clause — "last time, with no force, v stayed frozen;
now watch what a force ADDS" — which also serves students who have it as the delta framing.
(2) acceleration as a quantity — breaks at STATE_1 if `a` is an unfamiliar symbol; patch: S1
narration defines it operationally off the readout ("v climbs by the same amount every second —
that steady climb rate is the acceleration a"), co-timed with the a-readout glowing frame.
(3) `instantaneous_velocity` — breaks at S2/S3 if reading v/a off a HUD is unfamiliar; patched by
S1 having already anchored both readouts before the two-body states use them.

**JEE-backwards trace:** *"A constant net force of 6 N acts on a 2 kg body initially at rest.
Which statement is true after 4 s? (A) velocity is constant at 3 m/s (B) acceleration is 3 m/s²
and velocity is 12 m/s and still increasing (C) the body moves at constant 12 m/s (D) acceleration
increases with time."* Pieces: constant F ⇒ constant a, v keeps climbing → STATE_1 (kills A, C,
D); a = F/m = 3 m/s² numerically → S2/S3 proportionality read as a = F/m (and live on the S4 HUD);
v = a·t arithmetic is prerequisite kinematics, flagged advisory, not taught here. No missing
piece — no state added.

**Misconception entry mapping (16a):** M1 → planted by lived experience (steady pushes produce
steady speeds because hidden friction cancels them — this concept's frictionless floor removes
the concealer); confronted proactively at STATE_1 (`misconception_watch` there; the contrast beat
is the readout pair — the wrong expectation "v goes flat" is on screen as the a-row that DOES stay
flat, beside the v-row that refuses to). Planting-risk check: S1 must never phrase F as "keeping
it moving" or "giving it speed" — narration says the force "keeps CHANGING its speed". M2 →
planted if S1's single body lets "force alone decides" feel confirmed; confronted at STATE_2
(`misconception_watch` there — identical arrows, only mass differs, effect halves). No EPIC-C
branches (deferred).

### Block 2 — Aha-moment designation

- **PRIMARY aha (the 10-year memory):** *A force does not give a body speed — it gives it a RATE
  of gaining speed; hold a steady force on a frictionless floor and the speed climbs forever while
  the acceleration never moves.* Lands at STATE_1.
- **SUPPORTING aha (1):** *Mass is the exchange rate between force and acceleration — the same
  push does exactly half as much to twice the mass, and the two race states are the same 2:1
  picture produced by opposite dials: a = F/m.* Lands across the STATE_2→STATE_3 contrast pair.
- **Cohesion check:** the supporting aha quantifies the primary (once force↔acceleration is
  accepted, m is the divisor that scales it) — it reinforces, never stands alone. 1 + 1 = sweet
  spot.
- **Wrong-belief setup:** the primary aha's confident-wrong-belief (M1) is pre-earned by lived
  experience AND by the just-watched `newton_first_law` (a student fresh from "no force → v
  constant" naturally over-generalizes to "force → a new constant v") — STATE_1 breaks it in the
  first minute. The supporting aha's wrong belief (M2) is set up by S1 itself (one body, one mass
  → "the force decides everything" feels confirmed) — S2 breaks it, S3 completes the flip.
- **Foundational-coverage:** PRIMARY aha state (S1) ⊂ `foundational` range. Satisfied.

---

## Engine bug queue consultation (pre-authoring)

Script not runnable in the architect thread (no shell); consulted
`docs/loop_runs/lom/_engine/scar_candidates.sql` (ALL rows) + the lom-b state file. Relevant rows
and how this skeleton satisfies each:

- **`field3d_nlb_physics_clock_not_state_local` / `…ignores_reset_trajectory…` (FIXED, 3e1b159
  cherry-pick):** all three guided states here are integrator states and depend on that fix.
  Downstream verify (eye_walker): v at the first captured frame of S1 must read 0.00 (the authored
  rest start) and both S2/S3 blocks must sit at the start line at reveal start.
- **Motion-bound / clamp scar (`field3d_motion_bound_derived_from_old_apparatus…`):** ALL
  placements computed (§3): worst case S2's light body ends at +6.4 of a ±10 surface; S1 ends at
  +6.7. Hard rule handed to physics_author: no body reaches the clamp within dwell + margin —
  a clamped block under a live F arrow is a HUD/caption contradiction. No pulley, no post.
- **Label projection scar (`…projection_blind…`):** every state authors its own near side-on
  `camera_position`; S2/S3 frame both lanes.
- **HUD zero-stub scar (`…readout_enum_prints_zero_stub_rows…`):** `f` and `N` are NEVER declared
  in `readouts` — μ = 0 makes f identically zero all concept. Declared keys (`v`,`a`,`F_applied`,
  `ΣF`) are live, meaningful values on every body shown. The state-level-enum-per-body coarseness
  is used deliberately in S2/S3 (paired a readouts ARE the comparison).
- **Glow-handoff scar (`field3d_nlb_phase_glow_handoff_not_visible` — OPEN, owner ambiguous):**
  this concept authors **NO `phases[]` glow handoffs anywhere** — one static `glow_focal` per
  state. The unresolved scar is designed around, not re-hit.
- **Slider-row jump scar (`…per_state_slider_rows_collapsed…`):** engine-side
  (visibility:hidden); this concept's token union is `{m, m2, F, v0}` — no μ or theta row is ever
  built.
- **Build-once flag scar (`…build_once_body_reads_a_per_state_flag…`):** body ids A/B are stable,
  never hang, never ghost, labels constant (`m₁`/`m₂`) across all states — no build-time flag
  conflicts possible.
- **Formula-wrap scar:** longest authored formula is `constant F ⇒ constant a` — short by design.
- **Pick-proxy / sandbox scars (seam E):** engine-side; sandbox authored exactly per spec §4
  (`trusted_drag_seizes` + `idle_auto_sweep`); founder hand-tests the drag (THE EYE can't fire
  trusted events).
- **F3D_REVEAL_KEYS / deriveStateMeta scar (seam F):** engine-side, already landed for
  `newtons_laws_body` (newton_first_law sealed through THE EYE 19/19); flagged for json_author's
  cache re-seed self-check anyway.
- **Pedagogy directives (checklist):** concrete-before-abstract (a real accelerating block before
  a = F/m appears in S2), visual-matches-narration (never say "constant" of anything whose readout
  is changing — S1's script is built around which row moves and which doesn't), don't-pre-spoil
  (a = F/m is not written in S1; S1's surface is `constant F ⇒ constant a`), reveal-sync N/A
  (no phase reveals authored).

**DC Pandey check:** consulted Laws of Motion table of contents only to confirm "Newton's second
law" is its own section immediately after the first law, before constraint/pulley problems. No
teaching method, no example problem, no figure reference imported.

## Self-review notes

- Atomic claim = one sentence. 4 states matches the "simple" §5 band; founder scoped this as one
  of the chapter's simplest. All narration budgets 35–55 EN words; explore = 0/open.
- Two coined archetypes (`accelerate-run`, `side-by-side-race`), each with a one-line
  justification; single archetype repeat is the declared S2/S3 contrast pair whose delta names
  the flip. Zero overlap with `newton_first_law`'s archetype set (translate-through,
  null-result-hold, drag-sandbox — sandbox excepted, as every concept's explore state is
  necessarily `drag-sandbox`).
- 2 misconception pivots (guardrail 1–3), 2 deep-dive picks, ≥2 advance modes, ≥3 primitives/state
  is a json_author obligation flagged forward.

## ENGINE GAP

None. All four states use existing modes (`accelerate_applied_force`, `compare_mass_same_force`,
`compare_force_same_mass`, `sandbox`) and existing keys only. Two non-gap defensive notes for
downstream agents: (1) `phases[].action` is inert and the arrow glow-handoff scar is unresolved —
this concept deliberately authors no phases at all. (2) The explorer surface has ONE `F` slider
(`#nlb_f_slider`) and the spec does not define which body it drives in a two-body state — so the
two-body states expose only `['m2']` (S2) or `[]` (S3), and `F` appears only in the single-body
sandbox where the binding is unambiguous. This is a design choice within the existing surface,
not a gap.

---
*Handoff: physics_author (exact F/m/v₀/placement values under the clamp-margin constraint, motion
timelines, narration scripts within the declared budgets).*
