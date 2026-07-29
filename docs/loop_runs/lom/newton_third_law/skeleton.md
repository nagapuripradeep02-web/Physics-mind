# ARCHITECT SKELETON v2 — `newton_third_law` (Laws of Motion, Class 11 — REBUILD, feat/lom-b)

> RE-AUTHOR of a sealed, founder-rejected concept. `concept_id` stays `newton_third_law`; all 4
> existing registration sites stay untouched. Engine: field_3d `newtons_laws_body` at HEAD 248abea
> (push_off + spring + fixed landed; see docs/loop_runs/push_off_report.md).
> The 5-state arc is FOUNDER-APPROVED (rebuild_brief.md §2) and is not renegotiated here.
> Controlling numbers: brief §4 verified reference set — physics_author owns them and must
> re-verify §3.2 / §3.4 / §3.8 for ANY change.
> **ENGINE GAP: none** (see §12; brief §3.6 re-read — STATE_4 is two REAL bodies, not ghosts).

## 1. Atomic claim

This concept teaches ONE idea: every force is one half of a single two-body interaction — the two
halves are always equal in magnitude, opposite in direction, act at the same instant, and act on
DIFFERENT bodies (which is why they can never cancel) — and only that. It does NOT cover how much
a force accelerates a body (`newton_second_law`; used here only as the read-off a = F/m), complete
force diagrams (`free_body_diagram`), friction physics or inclines (`block_on_incline`),
string-coupled bodies (`connected_bodies`), or momentum conservation (a later chapter's atomic).

## 2. State count + arc — 5 states (FIXED by founder; brief §2)

| State | Purpose (one line) | teaching_method |
|---|---|---|
| STATE_1 | The interaction is ON SCREEN: one compressed spring releases → two equal carts recoil at the same instant, equal and opposite | (straightforward motion beat — field omitted) |
| STATE_2 | Contrast pair of S1: masses 1:3, same spring, same force — the two arrows stay PIXEL-IDENTICAL while the accelerations split 3:1 | misconception_confrontation (16a contrast beat) |
| STATE_3 | Same pair against a `fixed` wall: the wall's 30 N arrow is pixel-identical to the cart's, yet the wall never moves — its body is the Earth | misconception_confrontation (16a) |
| STATE_4 | Isolate each cart's OWN diagram (two REAL separated bodies): cancellation happens between forces on ONE body; a third-law pair never shares one | misconception_confrontation (16a) |
| STATE_5 | Sandbox: mass-ratio + force sliders; forces always equal, accelerations always m₂:m₁ | exploration_sliders |

Reconstruction grading of the v1 states (all v1 states re-earned or died):
v1 S1 (asserted pair, 300 kg) → REPLACED by new S1 (spring push_off — the cause is now an object).
v1 S2 (1:3 beat) → KEPT as new S2, now spring-driven (PRIMARY aha survives here).
v1 S3 (fbd_isolate with ghost partner) → REBUILT as new S4 with two REAL bodies (brief §3.6: ghosts carry no arrows).
v1 S4 (sandbox) → new S5. New S3 (wall) is NET-NEW (kills the third misconception the v1 arc never touched).

## 3. Per-state choreography + control plan (Rule 31 control table — FIRST design artifact)

| State | Teaches | Motion archetype | Delta (= ≤5-word cue, Rule 34a) | mode / mechanism | controls_visible | glow_focal (ONE, Rule 32e) | readouts | Narration | advance_mode |
|---|---|---|---|---|---|---|---|---|---|
| S1 | One push = two forces, two motions, same instant | **`mirror-recoil`** (coined: one spring release drives two touching bodies apart symmetrically, then both coast; no seed archetype covers a single visible interaction object ejecting two bodies oppositely) | "One push, two motions" | `action_reaction_pair` + `push_off` + `spring` | `[]` (pure watch beat) | **`nlb_spring`** (point at the CAUSE — founder-mandated) | `['F_applied','v']` (±30.0 N during contact; ±2.10 m/s equal after) | 30–45 EN words / ~12 s | `manual_click` |
| S2 | Force magnitudes are mass-blind: arrows identical, accelerations 3:1 | `mirror-recoil` — **declared contrast pair with S1**; the delta names the flip: masses now 1:3, everything else byte-identical (same F, same release_at_ms = 420) | "Unequal masses, equal forces" | `compare_mass_same_force` + `push_off` + `spring` | `[]` — see justification below | `nlb_arrow_B_applied` (the HEAVY cart's arrow — the misconception says it should be bigger; it is pixel-identical) | `['F_applied','a']` (identical F rows; 7.50 vs 2.50 — the whole argument in four numbers) | 35–55 EN words / ~12 s | `manual_click` |
| S3 | Zero motion ≠ zero force: the wall's reaction is full-magnitude, its body is the Earth | **`anchor-recoil`** (coined: one body recoils off a spring while its partner — Earth-anchored — holds pose under a full-magnitude arrow; no seed archetype pairs a real recoil with a deliberate null on the partner) | "Wall pushes back, unmoved" | `action_reaction_pair` + `push_off` + `spring` + wall body `fixed: true` | `[]` | `nlb_arrow_W_applied` (the wall's 30 N arrow — the force the misconception says doesn't exist) | `['F_applied','a']` (30.0 / 30.0 N; 5.00 / 0.00 m/s²) | 35–55 EN words / ~13 s | `manual_click` |
| S4 | Cancellation is a ONE-body affair; the pair lives on different bodies | `reveal-build` (seed: the two isolation diagrams construct arrow-by-arrow on a held tableau) | "Cancelling needs one body" | `fbd_isolate` + `action_reaction` (driver A), both carts brake-pinned by static friction (see §3-note) | `[]` | `nlb_arrow_A_applied` (F₂₁ — the pair-half whose partner is NOT in this diagram) | `['F_applied','f','F_net']` (30.0 / 30.0 / **0.0** — zero because the GRIP on this same cart balanced it, never the partner force) | 40–55 EN words / ~14 s | `manual_click` |
| S5 | All of it, live: any masses, any push — F always equal, a always m₂:m₁ | `drag-sandbox` (explore only) | "All yours" | `sandbox` + `action_reaction` | `['m','m2','F']` (ALL for this concept; theta/μ/v0 excluded — flat, frictionless, from-rest IS the concept) | `nlb_body_B` (drag target) | `['F_applied','a','v']` | 0 / open | `interaction_complete` |

Rule 15: `manual_click` + `interaction_complete` = 2 distinct modes. No `wait_for_answer`, no `pause_after_ms`.

**Why S2/S3 expose zero controls (Rule 31c documented exception):** the taught variable in S2 is the
mass ratio, but a live `m2` drag is DEAD in a push_off state — during the 420 ms contact it desyncs the
§3.4 timing contract (scar `nlb_push_off_release_window_outlives_the_spring_extension`, MAJOR), and
after release it changes nothing (velocities already set). A dead/desynced control is a recorded scar
class (the dead-F-slider row); zero controls on a watch-beat is explicitly legal (Rule 31). Live mass
play belongs to S5, which is exactly what the sandbox's `action_reaction` mechanism is for.

**Hard bans honored:** no `'F'` in `controls_visible` on S1/S2/S3 (brief §3.3); `'F'` in S5 is expected.
STATE_5 authors `action_reaction`, never `push_off` (inert in sandbox, brief §3.3).

### Per-state choreography detail (Rule 32; placements COMPUTED from brief §4, never guessed)

All states: `surface.length_m: 10` (brief §4 — default 6 runs S2's light cart off before the reveal
pin), θ = 0, spring states frictionless. **ONE shared camera across all five states (Rule 32d):**
centered on s = 0, **camera x = 0 ALWAYS** (a lateral x offset broke S1's symmetry by ~28% in v1 —
brief §3.7), elevation-only framing, indicative `[0, 3.5, 13]` → target `[0, 0.6, 0]`.

**Camera / lane note (brief §3.7 — the old rule is INVERTED here):** S1, S2, S3 are `push_off` /
`fixed` states → the engine forces EVERY body into lane z = 0, head-on along the track axis `s`.
The 2026-07-25 "elevate to 55° to open the z lane" rule does NOT apply to them — there is no z lane
to open; separation is along `s` and reads best near side-on. S4/S5 (no push_off, no fixed) DO get
the 0.85-world z-lane stagger — their `s` positions are authored well apart (∓2.5 m) so the z offset
is never load-bearing, letting the SAME low-elevation shared camera serve all five states. Never any
camera x offset anywhere in this concept.

- **S1** — bodies A (m₁, 6 kg, s = **+0.91**) and B (m₂, 6 kg, s = **−0.91**) sandwiching the
  compressed spring (gap exactly 0.72 m — §3.4 position contract). `push_off: { body_a_id: "A"
  (POSITIVE side — order contract), body_b_id: "B", force_N: 30, release_at_ms: 420 }`,
  `spring: { between: ["A","B"] }`. Cause first (32a): spring glows (focal) at the held pose, a
  readable beat, then release — both 30 N arrows flash on, spring extends, carts drive apart, spring
  hides at natural length, carts coast at ±2.10 m/s. At the frozen pin (release+2000 = 2420 ms,
  §3.8): carts at ±5.55 m, symmetric, both on the ±10 track. Motion loops nothing; the coast IS the
  persistence of the interaction.
- **S2** — home pose restored (32d): same track, same spring, same start positions ±0.91, same
  F = 30, same release 420 (reduced mass 3 kg in both S1 and S2 — frame-for-frame comparable, brief
  §4). ONLY change (32b): A = 4 kg, B = 12 kg (labels m₁/m₂ + HUD carry the 1:3 — cart MESH SIZE is
  mass-independent by Rule 29/NLB_BODY_SIZE; nobody requests size scaling). Arrows identical 1.44
  world; a = 7.50 vs 2.50; distances at pin 6.96 m vs 2.32 m from the start line — exactly 3:1 in
  pixels. Pin positions +7.87 / −3.23, on-track. **No weight arrows anywhere in S1/S2** (58.8 N and
  117.6 N both clamp at the 2.80 ceiling — brief §4; the payload is the horizontal pair, Rule 34).
- **S3** — cart A3 (6 kg — same cart mass as S1, Rule 32d) at s = **+0.7725**; NEW body id **"W"**
  (`fixed: true`, wall slab) at s = **−0.7725** (gap = 0.72 + 0.55 + 0.275 = wall contract §3.4;
  id "W" used in NO other state — `fixed` is build-time-consumed, brief §3.5). `push_off:
  { body_a_id: "A3" (positive side), body_b_id: "W", force_N: 30, release_at_ms: 593 }` (drops the
  wall's 1/m term). Cause first: spring holds, beat, release — cart's +30 N arrow AND the wall's
  −30 N arrow (full magnitude, full brightness, pixel-identical — the engine draws fixed-body arrows
  normally) appear together as one pair; cart recoils to +7.59 m at the pin; the wall holds. Note:
  A3 is a distinct id from A if json_author finds ANY build-consumed flag divergence; otherwise
  reuse "A" (json_author verifies per the build-once-flag scar).
- **S4** — two REAL bodies (brief §3.6: `ghost` carries NO arrows — this state is why): A (6 kg,
  s = +2.5) and B (6 kg, s = −2.5), z-lane staggered by the engine, no spring (it cannot span 5 m
  and would float — spring-float scar), no push_off. `action_reaction: { engaged: true,
  driver_body_id: "A" }` with applied +30 N on A (mirrored −30 on B every frame — the equality stays
  engine-enforced). **Both carts are brake-pinned by static friction** (μ_s = 0.6 per body →
  max-static 35.3 N > 30 N drive; carts hold pose all state): this is the ONLY few-kg design in
  which the pair's arrows stay on screen for a full narration without the carts leaving the ±10 m
  track (sustained 30 N on 6 kg = 5 m/s² exits in ~2 s; heavy carts are banned by brief §5). The
  grip is not a cheat — it IS the lesson's counterexample: reveal-build order (32a): F₂₁ appears on
  cart 1 (cause, glowing) → beat → its grip arrow f₁ appears on the SAME cart and F_net reads 0.0
  (same-body cancellation, shown honestly) → beat → F₁₂ appears on cart 2 (the partner force,
  visibly on a DIFFERENT body, in a different lane) with its own f₂. Narration lands: what balanced
  cart 1 was its own grip — the partner force was never in this diagram; back in State 1 the track
  was slick, nothing balanced the push, and BOTH carts flew. Framing annotation: "State 1's push,
  held still to read each diagram." Arrows shown per cart: `['applied','friction']` only (no
  weight/normal — 58.8 N clamps and clutters; Rule 34). If phases-gated arrow reveal is unavailable,
  the all-at-t0 fallback is acceptable — physics_author verifies against the v1 beat-reveal pattern.
- **S5** — sandbox: A and B (defaults 6 kg / 6 kg) at ∓2.5, μ = 0, `action_reaction` engaged,
  `trusted_drag_seizes: true`, `idle_auto_sweep: { param: 'F', range: [15, 45] }` (minimum clears
  the 11.5 N arrow floor with margin). Teacher recipe: drag m₂ huge — the arrows stay twins while
  its recoil dies; drag F — both arrows grow together. Rule 37 free-run is automatic via
  `interaction_complete`. **json_author build-note:** verify the engine's existing sandbox rebase
  behavior for off-track excursion (sweep-cycle / drag rebase, as the shipped sibling sandboxes do);
  if excursion is unbounded, default masses toward the m-slider's upper range so free-run a stays
  ~1 m/s² — a numeric authoring choice, not an engine change.

**Arrow-law compliance (brief §3.2):** every authored force in every state is 30 N → 1.44 world,
2.6× the 0.55 floor, half the 2.80 ceiling. The only sub-30 forces possible are S5's sweep floor
(15 N ≥ 15 ✓). No weight/normal arrows are shown in any state (all would clamp at ≥58.8 N).

**Formula surface per state (Rule 34b — ONE, math-serif Unicode, `#nlb_formula`):**
S1 `F₂₁ = −F₁₂` · S2 `|F₂₁| = |F₁₂| ⇒ a ∝ 1/m` · S3 `a = F/m → a_wall ≈ 0 (m = Earth)` ·
S4 `ΣF₁ = F₂₁ + f₁` (cancellation lives inside ONE diagram; physics_author may refine wording) ·
S5 `F₂₁ = −F₁₂`. Convention declared once and kept: **F₂₁ = force ON cart 1 BY cart 2** (legend in
the S1 caption zone; labels stay symbolic per Rule 24).

**Narration intents (physics_author writes final text_en; Rule 30i — English only, never text_te):**
- S1 (~40 w): "A compressed spring sits between two identical carts. Release it. One push acts on
  both carts — at the same instant they recoil, equal speeds, opposite directions. Every force is
  one half of a two-body interaction. No force after release, so each cart keeps its speed."
- S2 (~38 w): "Same spring, same push — but the right cart is three times heavier. Watch the
  arrows: identical, always. Only the accelerations differ — a equals F over m, so three to one.
  Mass never changes the force; it changes the response."
- S3 (~44 w): "Now the spring pushes a wall. Same pair: cart, thirty newtons one way; wall, thirty
  newtons the other — the arrows match exactly. The cart flies; the wall stays, because its body is
  the whole Earth. Zero motion never means zero force."
- S4 (~52 w): "Hold each cart with a brake and read its diagram alone. On cart one, the partner's
  push and its own grip — two forces on ONE body — cancel, and it holds. Its third-law partner
  isn't here at all; it acts on cart two. Pair forces live on different bodies, so they never cancel."
- S5: 0 / open.

## 4. Misconception confrontation plan (Rule 16a — exactly 3 genuine pivots; no per-state tic)

| # | Wrong belief (brief §2) | State | `misconception_watch` beat |
|---|---|---|---|
| M1 | "The heavier one pushes harder" (planted by lived experience — the heavier person wins every shoving match) | STATE_2 | belief: unequal bodies exert unequal forces on each other · visual_counter: masses 1:3, both applied arrows pixel-identical (1.44 world) and both F readouts 30.0 N; the ONLY unequal numbers are a = 7.50 vs 2.50, and the distances at the frozen pin are 6.96 m vs 2.32 m — exactly 3:1 · one_line_fix: "Forces are always equal — mass decides who MOVES more, never who PUSHES more." |
| M2 | "If nothing moves, there was no force" | STATE_3 | belief: a motionless wall exerts/receives no force · visual_counter: the wall's 30 N arrow is drawn at full magnitude and full brightness, pixel-identical to the cart's, while a = 0.00 on its HUD row — because its body is the Earth · one_line_fix: "The wall pushes back with the full 30 N — its acceleration is invisible only because its mass is the planet's." |
| M3 | "Equal and opposite means they cancel, so nothing should move" | STATE_4 | belief: the action–reaction pair sums to zero on a body · visual_counter: on cart 1's own diagram, the push F₂₁ and the grip f₁ — which DO share the body — cancel to F_net 0.0; the pair's partner F₁₂ is drawn on cart 2, a different body in a different lane, and back in S1 (slick track, no grip) both carts accelerated · one_line_fix: "Forces cancel only on the SAME body — a third-law pair never shares one." |

EPIC-C branches: ZERO (EPIC-L-first directive 2026-06-10). No board/competitive `mode_overrides` (Rule 20 [D]).

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates)

- **STATE_2** — force-equality-under-asymmetry is THE documented third-law cliff ("but the truck
  destroys the car — surely it pushed harder"); many phrasings of one confusion.
- **STATE_4** — the cancellation fallacy plus the chronic pair-identification error (calling mg and
  N a third-law pair) both live here.
(Same two states carry the Pass-1 cliff sentences — cross-reference consistent.)

## 6. Drill-down clusters (physics_author fleshes trigger_examples)

STATE_2: `heavier_pushes_harder` (mass ↔ force conflation) · `truck_car_collision_forces` (the
collision-asymmetry phrasing of M1) · `action_reaction_magnitude_equality` (is the equality exact,
always, even mid-motion?).
STATE_4: `action_reaction_cancel_fallacy` (M3's direct phrasings) · `third_law_pair_identification`
(mg/N mislabeled as a pair — the pair test: same interaction, two bodies, swapped subscripts) ·
`internal_forces_cannot_self_accelerate` (why you can't lift yourself by your bootstraps).

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational:  STATE_1 → STATE_2   # "what is the third law", equal/opposite, mass-blindness (PRIMARY aha inside)
  static_partner: STATE_3            # "does a wall/table/Earth push back?"
  cancellation:  STATE_4 → STATE_5   # "why don't action and reaction cancel?"
```
Default aspect = foundational. PRIMARY aha (S2) is inside the foundational range — no exit-pill needed.

## 8. Prerequisites (advisory only — Rule 23)

- `newton_second_law` (shipped, this chapter) — S2 reads off a = F/m.
- `newton_first_law` (shipped, this chapter) — S1's coast (constant v after release) is a Newton-I echo.
Both patched in-state (Block 1 below); neither gates entry.

## 9. Real-world anchor (Rule 35 — universal, culture-neutral, physics-true)

**Primary: two ice skaters pushing apart on a rink.** A light skater and a heavy skater press
palms and push — one shove, and BOTH glide away at the same instant; the lighter one always leaves
faster, yet neither "pushed harder." It is the concept's exact geometry (S1/S2: one interaction,
two recoils, mass-blind force), it is something a Class-11 student anywhere has seen or felt (any
slippery floor works — the physics is honest at every depth: near-frictionless surface = our μ = 0
track), and it survives the whole lesson without breaking.
**Secondary: a swimmer's turn — pushing off the pool wall** (S3: you push the wall, the wall's
equal push is what launches you; the wall never moves because its body is the Earth). Both anchors
are place-, brand-, and culture-free; plain English throughout.

## 10. Definition of Done (Gate 0 — zero TBDs)

(a) **States:** S1 spring release, equal carts, symmetric recoil · S2 same push, 1:3 masses,
identical arrows / 3:1 accelerations · S3 cart vs fixed wall, full-magnitude unmoved reaction ·
S4 two real braked carts, per-body diagrams, same-body-cancel vs cross-body pair · S5 sandbox.
(b) **Symbol-label table:** F₂₁ = "F₂₁" (force on cart 1 by cart 2) · F₁₂ = "F₁₂" · f₁/f₂ = "f"
(grip, S4 only) · masses "m₁", "m₂" · velocities/accelerations HUD-only ("v", "a", value-only) ·
wall label "wall (Earth)" · spring = unlabeled apparatus. No mg/N labels ship (arrows not shown).
(c) **Right-hand-rule plan:** N/A — no magnetism, no cross products in this concept.
(d) **Motion plan:** S1 spring release → symmetric recoil + coast · S2 same release → 3:1 split
recoil · S3 one-sided recoil off the wall · S4 sequential reveal-build of two FBDs on a held
tableau · S5 teacher-driven sweep/drag. No static state; every beat above is on the state clock.
(e) **Modes:** conceptual-only (Rule 20 [D] — no mode_overrides).
(f) **assessment + coverage_map + misconception_watch:** authored (M1→S2, M2→S3, M3→S4; 2026-05-30+
mandate); assessment items span pair-equality, wall-reaction, and non-cancellation.
(g) **Macro↔micro plan (Rule 33):** N/A-justified — the taught variable (contact force pair) and
its mechanism are BOTH macroscopic at this level; no micro band. Instruments: the value-only HUD
rows (F, a, v, f, F_net) are the live numeric readouts per 33d.
(h) **Canvas budget (Rule 34):** one `#nlb_formula` surface per state (§3 list, Unicode subscripts
F₂₁/F₁₂/ΣF₁); on-canvas caption = the ≤5-word delta cue only; HUD value-only; overlays in distinct
corners clearing the review chrome.

## 11. Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist
1. **Prerequisite cliffs.** `newton_second_law` breaks S2 for a student who can't read a = F/m: one
   narration clause patches it ("a equals F over m, so three to one") without condescension.
   `newton_first_law` breaks S1's coast ("why do they keep moving after the spring stops?"): one
   clause ("no force after release, so each cart keeps its speed").
2. **JEE-backwards trace.** Q: "A 4 kg and a 12 kg cart on a frictionless track are pushed apart by
   a compressed spring. (i) Compare the forces on each cart during the push. (ii) The 4 kg cart
   leaves at 3.15 m/s — find the 12 kg cart's speed. (iii) Why don't the equal and opposite forces
   prevent motion?" — (i) needs pair equality + simultaneity → S1; (ii) needs mass-blind F ⇒
   a ∝ 1/m ⇒ v ratio 3:1 → S2 (answer 1.05 m/s, literally the S2 reference numbers); (iii) needs
   different-bodies non-cancellation → S4. The horse-and-cart classic additionally needs S4's
   same-body-balancer idea (external grip), covered. No missing piece; momentum conservation is
   explicitly deferred to its own atomic.
3. **Misconception entry mapping (16a).** M1 planted by S1? — S1's symmetric recoil could read as
   "symmetric because the carts are identical"; that IS the setup, deliberately earned, and S2
   breaks it immediately (declared contrast pair). M2 planted nowhere upstream; confronted at S3.
   M3 risk-point is S2's "equal and opposite" phrasing — S2's narration says "opposite directions"
   on two moving carts (motion visibly not cancelled), and S4 confronts the residue head-on. 16b
   branches deferred (no real students).

### Block 2 — Aha designation
- **PRIMARY aha (S2):** the two arrows stay pixel-identical while the accelerations split 3:1 —
  *mass decides who moves, never who pushes*. The 10-year memory is that single frame.
- **SUPPORTING aha (S4, 1 of 1):** forces cancel only inside one body's diagram — a third-law pair
  never shares a body. It exists to protect the primary from the "then nothing should move"
  rebound; clear cohesion, no orphan ahas (S3 is a confrontation beat, not a separate aha).
- **Wrong-belief setup.** For the primary: S1 earns confident symmetry with identical carts, so the
  student walks into S2 sure the heavier cart will "win the push." For the supporting: S1–S3 have
  hammered "equal and opposite" three times, so by S4 the student confidently expects a sum of zero.
- **Foundational coverage:** PRIMARY aha state (S2) is inside `foundational` — rule satisfied.

## 12. Compliance notes

- **DC Pandey check:** scope confirmed against the Laws of Motion chapter plan / NCERT LoM index
  only (third law is one atomic within the chapter's 6-concept spine). No teaching sequence,
  example problem, phrasing, or figure imported; the spring–cart–wall arc is authored first-
  principles per the founder brief.
- **Scar/bug-queue consultation:** the live SQL queue was not directly queryable from this agent
  (no shell tool); consultation performed via rebuild_brief §3 (HEAD-verified renderer facts),
  push_off_report §3 scar_candidates (spring-float, release-window-outlives-extension, dead-F-
  slider), and the v1 skeleton's embedded scar annotations (arrow floor/ceiling, build-once flags,
  formula wrap, HUD/clamp contradiction, camera projection). Every prevention rule is satisfied in
  §3 above; json_author should re-run the queue query at build time as backstop.
- **Registration:** all 4 existing sites stay; nothing added; PCPL_CONCEPTS untouched.
- **TTS:** all scripts are rewritten → text_en fresh; text_hi optional (Rule 30g sub-agent), never
  voiced; audio on-demand only (Rule 30h). Old baselines replaced via `visual:approve` after
  founder OK (expected H2 fails on first EYE run are the old-arc vintage, not defects).

**ENGINE GAP: none.**
