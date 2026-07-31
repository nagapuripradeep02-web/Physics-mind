# ARCHITECT SKELETON — `newton_third_law` (Laws of Motion, Class 11 — concept 3/3, lom-b)

> Engine: `newtons_laws_body` field_3d scenario (docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md §1/§6).
> HARD CONSTRAINT honored: every state below is a pure `newtons_laws_body` config block —
> only enumerated modes, keys, and arrow kinds. NO renderer edits requested. **ENGINE GAP: none.**
> Scene constraints honored: theta_deg = 0, μ = 0 (frictionless) everywhere, no pulley, no hanging
> body. Two INDEPENDENT bodies rely on the automatic `nlbBodyLaneZ` side-by-side lane separation
> (engine fix landed on this branch, commit 3a576ea) — the two bodies are authored at the SAME
> `initial_position_m`, never staggered to fake separation.

## 1. Atomic claim

This concept teaches ONE idea: forces come in pairs — when body 1 pushes body 2, body 2
simultaneously pushes body 1 with EQUAL magnitude and OPPOSITE direction, and because the two
forces act on DIFFERENT bodies they never cancel — and only that. It does NOT cover how much a
force accelerates a body (done in `newton_second_law`; used here only as the read-off a = F/m),
drawing complete force diagrams (`free_body_diagram`), friction or inclines (`block_on_incline`),
string-coupled bodies (`connected_bodies`), or momentum conservation (a later chapter's atomic).

## 2. State count + arc — 4 states (simple-to-medium tier; matches the founder-approved chapter spine — the concept has exactly three teaching loads + explore)

| State | Purpose (one line) | teaching_method |
|---|---|---|
| STATE_1 | The pair exists: one push, TWO equal-and-opposite force arrows on two bodies — both recoil symmetrically | (straightforward motion beat — omit field) |
| STATE_2 | Contrast pair of S1: masses now 1:3 — the arrows stay IDENTICAL while the accelerations split 3:1; equal forces, unequal effects | misconception_confrontation (16a contrast beat, no predict-pause) |
| STATE_3 | Why the pair never cancels: isolate m₁'s own diagram — mg and N cancel because they share a body; the pair's two forces never share one, so ΣF ≠ 0 and m₁ accelerates | misconception_confrontation (16a) |
| STATE_4 | Explore: teacher drives both masses and the push strength, watches equal-F / unequal-a recoil live | exploration_sliders |

Two bodies ("A" = m₁, "B" = m₂), theta_deg = 0 throughout, μ = 0 throughout, no pulley, no hanging.
`action_reaction.engaged: true` with `driver_body_id: "A"` in S1/S2/S4 — the engine MIRRORS B's
applied force each frame, so equal-and-opposite is engine-enforced, never hand-authored twice.

## 3. Per-state choreography + control plan (Rule 31 — REQUIRED control table)

| State | Teaches | Motion archetype | Delta line (≤5-word cue, Rule 32c) | `newtons_laws_body.mode` | `controls_visible` | `glow_focal` | `readouts` | Narration budget / duration | `advance_mode` |
|---|---|---|---|---|---|---|---|---|---|
| STATE_1 | One interaction = TWO forces, equal and opposite, one on each body | **`mirror-recoil`** (coined: two bodies driven APART from a shared start by one engine-enforced equal-opposite pair; no seed archetype covers two bodies moving oppositely from a single interaction — `side-by-side-race` is same-direction parallel comparison, this is its mirror) | "One push — two forces" | `action_reaction_pair` | `[]` (pure watch beat) | `nlb_arrow_B_applied` (the SURPRISE arrow — the reaction on the OTHER body; A's push is expected, B's equal arrow is the revelation) | `['F_applied','a']` (per body: +30.0 / −30.0 N, ±0.10 m/s²) | 35–50 EN words / ~12 s | `manual_click` |
| STATE_2 | The magnitudes are equal NO MATTER the masses — "stronger/heavier pushes harder" is false; equal F, a ∝ 1/m | `mirror-recoil` (**declared contrast pair with STATE_1** — delta names the flip: masses now 1:3, forces STILL identical) | "Unequal masses — equal forces" | `action_reaction_pair` | `['m2']` (the taught variable IS the partner's mass; dragging m₂ live changes ONLY its recoil — its arrow never changes length) | `nlb_body_A` (the light body flying away — the unequal-a payload in motion) | `['F_applied','a']` (identical F rows, 3:1 a rows — the whole argument in four numbers) | 40–55 EN words / ~12 s | `manual_click` |
| STATE_3 | Cancellation is a SAME-BODY question: mg and N cancel on m₁ because both act on it; the pair's partner force acts on m₂'s diagram, never here — so ΣF on m₁ ≠ 0 and it accelerates | **`isolate-and-run`** (coined: one body of an interacting pair is isolated — partner dimmed to a ghost — and integrated under only the forces ON IT; no seed archetype covers per-body isolation followed by single-body motion) | "Cancel needs one body" | `fbd_isolate` | `[]` (pure watch beat) | `nlb_arrow_A_applied` (labeled `F₁₂` — the un-cancelled horizontal force) | `['F_applied','F_net','a']` (F_net = 30.0 N ≠ 0 is the anti-cancel witness; ghost gets NO HUD rows by engine rule) | 40–55 EN words / ~13 s | `manual_click` |
| STATE_4 | All of it: pick any two masses, any push — forces always equal, accelerations always m₂:m₁ | `drag-sandbox` | "All yours" | `sandbox` | `['m','m2','F']` (ALL for this concept; **μₛ/μₖ excluded** — frictionless concept; **theta excluded** — flat-ground concept; **v0 excluded** — push-off-from-rest IS the concept, a seeded velocity teaches nothing third-law) | `nlb_body_B` | `['F_applied','a','v']` | 0 / open | `interaction_complete` |

Rule 15: `manual_click` + `interaction_complete` = 2 distinct advance modes. No `wait_for_answer`, no `pause_after_ms`.

**Arrow-floor compliance (cycle-2 scar `field3d_nlb_arrow_min_length_floor…`, routed alex:physics_author):**
every on-screen force in every state is **30 N** → raw length 0.90 world units = 3.0× the 0.30 floor.
Where two arrows are compared for EQUALITY (S1, S2 — the concept's entire payload is that the two
lengths match), both are 30 N. The sandbox `idle_auto_sweep` range is `[15, 45]` N — its MINIMUM
clears the floor with margin (0.45 = 1.5× floor), so the swept arrow never freezes into a stub and
never passes through the sub-floor band. Mass/force scale follows the sibling's ×75-class principle:
forces in tens of newtons, masses in hundreds of kg, accelerations ~0.03–0.15 m/s² so nothing clamps.

**Per-state choreography detail (Rule 32 legibility; placements COMPUTED, not guessed — motion-bound scar):**

- **STATE_1** — Home pose: flat surface, `surface.length_m: 10`, TWO equal blocks (`m₁`, `m₂`,
  300 kg each) side by side at `initial_position_m: 0` — the lane offset renders them cleanly
  side-by-side at the shared start (commit 3a576ea; eye_walker verifies two distinct blocks +
  legible labels at t = 0, the exact cycle-2 failure frame). Cause first (32a): A's applied arrow
  `F₁₂` appears; a readable beat later B's mirrored arrow `F₂₁` appears — SAME length, opposite
  direction (the glow focal); another beat, then BOTH blocks recoil apart symmetrically.
  Indicative numbers: F = 30 N, m = 300 kg each → a = ±0.10 m/s²; d(12 s) = 7.2 m each — blocks
  end at ±7.2 of the ±10 clamp, 2.8 m margin (physics_author finalizes under the hard
  dwell + frozen-pin-margin constraint; a clamped block under a live arrow is the HUD/caption
  contradiction scar). Camera: authored near side-on framing both lanes (projection scar), e.g.
  `[0, 2.8, 13]`.
- **STATE_2** — SAME apparatus, SAME shared start line, home pose restored (32d). The ONLY change
  (32b): m₂ is now 900 kg (visibly the same block mesh, label unchanged; the narration + the m₂
  readout carry the 1:3). Cause first: both arrows appear together — IDENTICAL length, as always —
  beat, then both blocks launch: m₁ flies (a = 0.10), m₂ barely creeps (a = 0.033). d(12 s):
  7.2 m vs 2.4 m — clamp-safe. Dragging the `m₂` slider live re-scales ONLY B's recoil
  (integrator reads mass per frame); its arrow length NEVER changes — the visible control silently
  says "mass is the only dial here, and the force ignores it."
- **STATE_3** — SAME apparatus; m₁ (300 kg) at `initial_position_m: 0`, and m₂ is now a **`ghost`**
  body (dimmed, never integrated) holding pose just behind at −1.5 — the partner we are deliberately
  ignoring. (Ghost bodies are excluded from the lane offset by design, so the ghost's DISTINCT
  authored position is required and physically honest: it is "where the push came from".) Arrows on
  A only: `mg` down, `N` up (equal, vertical — they visibly cancel ON THIS BODY), and the horizontal
  `F₁₂` (glowing): its partner is NOT in this diagram — it lives on m₂. Cause first: the three-arrow
  diagram settles, beat, then A accelerates away while the ghost holds pose; `F_net = 30.0 N` and
  `a = 0.10` prove nothing cancelled. F = 30 N, a = 0.10, d(13 s) = 8.45 m → ends +8.45 of ±10,
  1.55 m margin — physics_author trims dwell or extends `length_m` to hold ≥2 m margin.
- **STATE_4** — Both bodies real again at the shared start, `action_reaction` engaged,
  `trusted_drag_seizes: true`, `idle_auto_sweep: { param: 'F', range: [15, 45] }` (floor-safe;
  Rule 37 free-run automatic via `interaction_complete`). Teacher recipe, zero words narrated:
  drag m₂ huge — arrows stay twins, its recoil dies; drag F — both arrows grow together, both
  recoils scale together; the ratio a₁/a₂ = m₂/m₁ holds at every setting.

**Formula surface per state (Rule 34b — ONE per state, via `formula_overlay` → `#nlb_formula`, Unicode):**
S1: `F₁₂ = −F₂₁` · S2: `|F₁₂| = |F₂₁| ⇒ a ∝ 1/m` · S3: `ΣF on m₁ = F₁₂ ≠ 0` · S4: `F₁₂ = −F₂₁`
(Longest string is S2's ~20 characters — comfortably inside the formula-wrap scar bound; verified
against the sibling's accepted `constant F ⇒ constant a`.)

**Body ids/labels (build-once discipline):** A = `m₁`, B = `m₂`, constant across all states.
Defensive note (build-once-flag scar `field3d_build_once_body_reads_a_per_state_flag…`): S3 flips
B to `ghost: true` while S1/S2/S4 have B real. The scar's recorded failure mode is the `hanging`
flag consumed at BUILD time; `ghost` is spec'd as state-apply behavior (dim + skip-integrate,
spec §3), so id reuse should be safe — **json_author MUST verify ghost is applied per-state (not
build-consumed) during self-review; if it is build-consumed, give S3's ghost its own id (`Bg`,
same `m₂` label — never co-visible with B) per the scar's distinct-ids prevention.** No body ever
hangs; no other build-time-consumed flag varies.

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots, no per-state tic)

| # | Wrong belief | Confronted at | `misconception_watch` beat |
|---|---|---|---|
| M1 | "The bigger/stronger/heavier one pushes harder — the winner of a push exerts the greater force" (planted by lived experience: the heavier person 'wins' every shoving match, so their force must be larger) | STATE_2 | belief: unequal bodies exert unequal forces on each other · visual_counter: masses 1:3, yet the two applied-force arrows are pixel-identical in length and the two F readouts read the same 30.0 N — the ONLY unequal thing is the accelerations (0.10 vs 0.033, exactly 3:1) · one_line_fix: "The forces are always equal — mass decides who MOVES more, never who PUSHES more." |
| M2 | "Equal and opposite forces cancel — so if every action has an equal reaction, nothing should ever move" | STATE_3 | belief: the action–reaction pair sums to zero on the moving body · visual_counter: on m₁'s own diagram, mg and N — which DO share this body — cancel visibly, while `F₁₂`'s partner is nowhere in this diagram (it acts on the dimmed ghost m₂); `F_net = 30.0 N` and m₁ accelerates · one_line_fix: "Forces cancel only when they act on the SAME body — a third-law pair never does." |

EPIC-C branches: ZERO (EPIC-L-first directive 2026-06-10). No board/competitive `mode_overrides` (Rule 20 [D]).

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates)

- **STATE_2** — force-equality-under-asymmetry is THE documented third-law cliff ("but the truck
  destroys the car — surely it pushed harder"); many phrasings of one confusion.
- **STATE_3** — the cancellation fallacy plus the chronic pair-identification error (calling mg/N
  a third-law pair) both live here; multiple documented phrasings.

(Same states carry the Pass-1 cliff sentences — cross-reference consistent.)

## 6. Drill-down clusters (3 candidates each; physics_author fleshes trigger_examples)

STATE_2: `heavier_pushes_harder_myth` (collision damage ≠ force inequality — a = F/m does the
damage arithmetic) · `equal_forces_unequal_effects` (why the same 30 N wrecks the light body's
motion and barely dents the heavy one's) · `who_exerts_the_force` (walls, floors, and planets push
back exactly as hard as they are pushed).

STATE_3: `action_reaction_never_cancel` (the different-bodies argument itself) ·
`pair_vs_balanced_forces` (mg and N are NOT a third-law pair — both act on one body; mg's true
partner is the body's pull ON the planet) · `identify_the_pair` (the swap rule: "A on B" ↔ "B on
A", always the same interaction type).

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational:   STATE_1 → STATE_3   # "what is Newton's third law / action-reaction"
  unequal_masses: STATE_2             # "does the heavier one push harder?"
  why_no_cancel:  STATE_3             # "why don't the equal forces cancel?"
  explore:        STATE_4
```
PRIMARY aha (STATE_3) is inside `foundational` — foundational-coverage rule satisfied, no exit-pill needed.

## 8. Prerequisites (advisory only — Rule 23)

- `newton_second_law` (SEALED, this worktree) — a = F/m is the read-off that turns equal forces
  into the visible 3:1 acceleration proof; S2 leans on it in one clause.
- `newton_first_law` (SEALED, this worktree) — ΣF = 0 ⇔ no change of motion is what makes
  "if they cancelled, nothing would move" a meaningful (and then broken) expectation in S3.
- `free_body_diagram` (this chapter, worktree A — may not yet be shipped; advisory pointer only)
  — S3 patches the isolate-one-body idea inline (see cliff plan), so it is NOT required first.

## 9. Real-world anchor (Rule 35 — universal, culture-neutral, physics-true)

**Primary:** two people on smooth-rolling chairs push off each other's palms — BOTH roll away, and
the lighter person always rolls away faster, no matter who did the pushing: the push you give is
exactly the push you get back. **Secondary:** a rocket in empty space — it hurls exhaust gas
backward, and the gas pushes the rocket forward with the same force; nothing external to "push
against" is needed. Why it hooks a Class 10–12 student: the chair push-off is a felt-in-the-body
experiment they can rerun at a desk — including the surprise that pushing someone means launching
yourself — and the rocket kills the "it pushes on the air" folk theory with the most dramatic
machine they know. Both exhibit the genuine physics at every depth (the pair is engine-enforced in
the sim exactly as momentum bookkeeping enforces it in the rocket). No places, brands, currency,
or country-specific context anywhere in captions, labels, or narration.

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** S1 equal-mass pair recoils symmetrically under engine-mirrored ±30 N twin arrows ·
S2 1:3 masses, identical arrows, 3:1 accelerations, live m₂ slider · S3 fbd_isolate — m₁'s
three-arrow diagram (mg/N cancel, F₁₂ un-partnered), ghost m₂ holds pose, m₁ accelerates,
F_net = 30.0 N · S4 two-body action_reaction sandbox, controls m/m₂/F, idle F-sweep [15,45],
trusted drag.

**(b) Symbol-label table (all Unicode, Rule 34c):**
| Quantity | On-canvas label |
|---|---|
| force on m₁ from m₂ (applied arrow, body A; via `arrows[].labels.applied`) | `F₁₂` |
| force on m₂ from m₁ (applied arrow, body B) | `F₂₁` |
| weight arrow (S3) | `mg` |
| normal arrow (S3) | `N` |
| net-force readout | `ΣF` |
| acceleration readout | `a` (m/s²) |
| velocity readout (sandbox) | `v` (m/s) |
| body labels | `m₁`, `m₂` |
| mass sliders | `m`, `m₂` |
| push-strength slider | `F` |

**(c) Right-hand-rule plan:** N/A — no cross products in this concept (documented, not TBD).

**(d) Motion plan:** S1 both bodies integrate apart from the shared start under the engine-mirrored
pair (Branch A, independent bodies; arrows appear cause-first with a readable stagger — A's then
B's — before motion); S2 same launch, masses 1:3 (contrast pair; only m₂ changed); S3 single real
body integrates under F₁₂ while the ghost holds pose (fbd_isolate; ghost never integrated);
S4 idle F-sweep until seized, free-running clock (Rule 37 automatic). Every placement computed
against `surface.length_m` with ≥1.5–2.8 m clamp margin (§3 indicative numbers; physics_author
finalizes under dwell + frozen-pin margin).

**(e) Modes:** conceptual EPIC-L only (Rule 20 [D] — no board/competitive overrides).

**(f) assessment + coverage_map + misconception_watch:** authored (concept post-2026-05-30).
Assessment plan (3 items): (i) a light and a heavy body push off each other — compare the forces
they exert → equal in magnitude, opposite in direction (S1/S2); (ii) why don't the equal-and-
opposite pair forces cancel → they act on different bodies (S3); (iii) masses m and 3m push off —
ratio of accelerations → 3:1, lighter one larger (S2). `coverage_map` maps i→S1+S2, ii→S3, iii→S2;
S4 in `non_assessed_states`.

**(g) Macro↔micro plan (Rule 33):** NOT TRIGGERED — the taught variables (forces on and
accelerations of two visible blocks) are directly macroscopic; no micro band. Instruments:
value-only HUD readouts (`F`, `a`, `v`, `ΣF`) are the live numerics per 33d — the identical
F rows beside the 3:1 a rows ARE the concept's star witness.

**(h) Canvas budget (Rule 34):** per state — ONE `formula_overlay` string (§3 list), top caption =
the ≤5-word delta cue only, value-only HUD (engine `#nlb_readout` rows), narration prose in the
strip below the canvas. **`readouts` never includes `N` or `f`** except S3's on-canvas N ARROW
(where the vertical cancellation is the teaching); the HUD stays horizontal-only (`F_applied`,
`F_net`, `a`) — μ = 0 makes `f` identically zero (zero-stub scar) and a numeric N row teaches
nothing here. HUD/formula/slider zones are engine-reserved (bottom-anchored panel, top:52px HUD).

---

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs:** (1) `newton_second_law` — breaks at STATE_2 if a = F/m is not available
(the 3:1 acceleration split would read as arbitrary); patch: one S2 clause — "same force, three
times the mass — so, exactly as last time, one third the acceleration" — which doubles as the
delta framing for students who have it. (2) `newton_first_law` — breaks at STATE_3 if "ΣF = 0 ⇒
no change of motion" is missing (the cancellation fallacy has no bite without it); patch: one S3
clause anchors it — "if these really cancelled, m₁ could never start moving — but watch." (3)
free-body isolation — breaks at STATE_3 if drawing ONE body's forces is unfamiliar; patch: the
choreography does the isolating (partner dims to a ghost, only forces ON m₁ are drawn), and the
narration names the move in one clause ("look at m₁'s forces alone").

**JEE-backwards trace:** *"A horse pulls a cart with force F; by Newton's third law the cart pulls
the horse back with force F. Which statement explains why the system can still accelerate? (A) the
horse pulls slightly harder (B) the third-law pair acts on different bodies, so each body's own net
force can be nonzero (C) the forces cancel and the ground moves them (D) the third law fails for
living things."* Pieces: pair equality even between unequal agents → S1/S2 (kills A, D); the pair
acts on different bodies so cancellation never happens within one body → S3 (delivers B, kills C);
each body then obeys its own a = ΣF/m → S2 + the `newton_second_law` prerequisite. No missing
piece — no state added. (Friction/ground details belong to `block_on_incline`/`free_body_diagram`,
advisory.)

**Misconception entry mapping (16a):** M1 → planted by lived experience (shoving matches are won
by the heavier party) and NEVER by our sentences; confronted proactively at STATE_2
(`misconception_watch` there; the contrast beat is the identical-arrows-beside-3:1-readouts frame).
Planting-risk check: S1 must never say m₁ "pushes" and m₂ "is pushed" as if asymmetric — narration
gives the interaction one verb ("they push off each other") so agency never implies force
inequality. M2 → planted the moment "equal and opposite" is stated in S1 (a student fresh from
`newton_first_law`'s balanced-forces beat will naturally sum the pair to zero); confronted one
state later at STATE_3 (`misconception_watch` there). Second planting risk, S3-specific: showing
mg/N cancelling could plant "mg and N are the third-law pair" — guarded by one narration clause
("mg and N both act on m₁ — that is exactly why they CAN cancel; a third-law pair never shares a
body") and offloaded fully to the `pair_vs_balanced_forces` drill-down. No EPIC-C branches
(deferred).

### Block 2 — Aha-moment designation

- **PRIMARY aha (the 10-year memory):** *Equal-and-opposite forces from an interaction NEVER
  cancel, because they never act on the same body — each body feels exactly one of them, and
  moves by it.* Lands at STATE_3.
- **SUPPORTING aha (1):** *The two forces are equal no matter how unequal the bodies — the truck
  and the fly trade identical forces; mass only decides who accelerates more (a ∝ 1/m).* Lands at
  STATE_2 (set up by S1's symmetric case).
- **Cohesion check:** the supporting aha supplies the equality that makes the primary's paradox
  sharp (only EQUAL forces tempt anyone to cancel them) — it sets up the primary, never stands
  alone. 1 + 1 = sweet spot.
- **Wrong-belief setup:** the primary aha's confident-wrong-belief (M2) is manufactured in-sim by
  S1 itself — the state that proudly announces "equal and opposite" hands the student the
  cancellation trap, and S3 springs it. The supporting aha's wrong belief (M1) is pre-earned by
  lived experience and by S1's symmetric case ("equal bodies, equal forces" feels like the
  reason) — S2 breaks it by making the bodies unequal while the arrows refuse to change.
- **Foundational-coverage:** PRIMARY aha state (S3) ⊂ `foundational` range. Satisfied.

---

## Engine bug queue consultation (pre-authoring)

Script not runnable in the architect thread (no shell); consulted
`docs/loop_runs/lom/_engine/scar_candidates.sql` (ALL rows, including the cycle-2 rows naming
`newton_third_law`) + the two sealed sibling skeletons. Relevant rows and how this skeleton
satisfies each:

- **`field3d_nlb_two_body_lane_offset_missing_causes_full_occlusion` (CRITICAL, names this
  concept; fix landed, commit 3a576ea):** S1/S2/S4 author both independent bodies at the SAME
  `initial_position_m: 0` and RELY on `nlbBodyLaneZ` — never a position stagger. Downstream
  verify (eye_walker): two distinct blocks + two legible labels at t = 0 AND at the H2 frozen pin
  of S1/S2 (the exact frames that failed on `newton_second_law`).
- **`field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` (MAJOR, names
  this concept; owner alex:physics_author):** every authored force is 30 N (3× floor); the
  equality-comparison pair (S1/S2) is 30 N on BOTH arrows; the sandbox sweep range [15, 45] N
  never dips below the floor. Hard rule handed to physics_author: no state and no sweep may
  author a nonzero on-screen force under 15 N.
- **`field3d_nlb_physics_clock_not_state_local` + `…ignores_reset_trajectory…` (FIXED):** all
  three guided states are integrator states and depend on the fix. Downstream verify: v = 0.00
  and both bodies at the start line at each state's first captured frame.
- **Motion-bound / clamp scar:** all placements computed (§3): worst case S3 ends at +8.45 of
  ±10 (physics_author holds ≥2 m margin by trimming dwell or extending length_m); S1/S2 worst
  case ±7.2 of ±10. No pulley, no post.
- **Label projection scar:** every state authors its own near side-on `camera_position`; S1/S2/S4
  frame both lanes; S3 frames the three-arrow diagram side-on.
- **HUD zero-stub scar:** `f` and `N` never in `readouts` (μ = 0; N teaches nothing numerically
  here); ghost bodies get no HUD rows by the engine's non-ghost rule. All declared keys are live
  meaningful values on every real body shown.
- **Glow-handoff scar (`field3d_nlb_phase_glow_handoff_not_visible` — OPEN, owner ambiguous):**
  NO `phases[]` glow handoffs anywhere — one static `glow_focal` per state. The cause-first arrow
  stagger in S1 is a reveal-timing matter for physics_author within the state timeline, not a
  glow phase. Designed around, not re-hit.
- **Slider-row jump scar:** engine-side (visibility:hidden); this concept's token union is
  `{m, m2, F}` — no μ, theta, or v0 row is ever built.
- **Build-once flag scar:** ids A/B stable, labels constant, no body ever hangs; the ONE per-state
  flag change (B ghost in S3) is flagged with an explicit json_author verification + distinct-id
  fallback (§3).
- **Formula-wrap scar:** longest formula is S2's `|F₁₂| = |F₂₁| ⇒ a ∝ 1/m` — short by design.
- **Pick-proxy / sandbox scars (seam E):** engine-side; sandbox authored exactly per spec §4;
  founder hand-tests the trusted drag (THE EYE cannot fire trusted events).
- **F3D_REVEAL_KEYS / deriveStateMeta scar (seam F):** engine-side, already landed (siblings
  sealed through THE EYE); flagged forward for json_author's cache re-seed self-check anyway.
- **Pedagogy directives (checklist):** concrete-before-abstract (two blocks recoil before
  `F₁₂ = −F₂₁` appears — the formula surface in S1 arrives with the reveal, not before it),
  visual-matches-narration (never narrate "the reaction" while only one arrow is on screen —
  S1's script names each arrow as it appears; S3 never says "cancel" of the pair while showing
  arrows that DO cancel without the same-body clause), don't-pre-spoil (the no-cancel argument is
  not narrated in S1/S2; S3 owns it), reveal-sync N/A (no phase reveals authored).

**DC Pandey check:** consulted Laws of Motion table of contents only to confirm "Newton's third
law" is its own section following the second law and preceding constraint/pulley problems. No
teaching method, no example problem, no figure reference imported.

## Self-review notes

- Atomic claim = one sentence. 4 states sits in the simple-to-medium §5 band; the concept has
  exactly three teaching loads (pair exists+equal · equality survives asymmetry · different-bodies
  no-cancel) + explore — no padding, no truncation.
- Two coined archetypes (`mirror-recoil`, `isolate-and-run`), each with a one-line justification;
  the single archetype repeat is the declared S1/S2 contrast pair whose delta names the flip
  (masses 1:3, forces unchanged). Zero archetype overlap with either sibling's guided sets
  (translate-through/null-result-hold; accelerate-run/side-by-side-race) — sandbox excepted.
- 2 misconception pivots (guardrail 1–3), 2 deep-dive picks, ≥2 advance modes; ≥3 primitives/state
  is a json_author obligation flagged forward.
- All narration budgets 35–55 EN words; explore = 0/open. All four glow focals distinct.

## ENGINE GAP

None. All four states use existing modes (`action_reaction_pair`, `fbd_isolate`, `sandbox`) and
existing keys only; equal-and-opposite is enforced by the shipped `action_reaction` mirror. Three
non-gap defensive notes for downstream agents: (1) **F-slider binding in a two-body sandbox** —
the spec does not define which body `#nlb_f_slider` writes. With `action_reaction` engaged the
mirror makes the RESULT well-defined only if the slider writes the DRIVER body's
`applied_force_N` (a write to the mirrored body would be silently overwritten each frame).
json_author must verify which body the emitter writes and author `driver_body_id` to BE that
body; if the binding proves inert either way, drop `F` from S4's controls (m/m₂ + the idle F-sweep
still carry the state) — a design choice within the existing surface, not a gap. (2) **Ghost flag
per-state application** — verified fallback documented in §3 (distinct id `Bg`). (3) **Ghost lane
offset** — ghosts are excluded from `nlbBodyLaneZ` by design, so S3's ghost is authored at its own
distinct position (−1.5, "where the push came from"); this is NOT the forbidden stagger, which
applies to the two REAL independent bodies only.

---
*Handoff: physics_author (exact F/m/dwell/placement values under the clamp-margin + ≥15 N
arrow-floor constraints, S1 arrow-stagger timing, motion timelines, narration scripts within the
declared budgets).*
