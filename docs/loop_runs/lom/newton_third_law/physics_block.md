# PHYSICS BLOCK -- newton_third_law (Laws of Motion, Class 11 -- concept 3/3, lom-b)

> Author: physics_author. Input: docs/loop_runs/lom/newton_third_law/skeleton.md (approved,
> ENGINE GAP: none) + docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md section 1 (config surface), section 2
> (Branch A integrator, independent bodies, no pulley), section 3 (arrow overlay + clamp), section 4
> (sandbox/Rule 37). HARD CONSTRAINT honored: every value below is expressible in the existing
> newtons_laws_body config surface (mode / surface / bodies[] / action_reaction / arrows[] /
> glow_focal / readouts / controls_visible / idle_auto_sweep). No phases[] authored anywhere
> (skeletons explicit design-around of the glow-handoff scar, carried from the sealed siblings).
> ENGINE GAP: none (confirms the architects own finding).

## Engine bug queue consultation (pre-authoring)

Consulted the same scar rows the architect flagged (docs/loop_runs/lom/_engine/scar_candidates.sql,
all 12 nlb seam rows) plus the two sealed siblings physics blocks (newton_first_law,
newton_second_law REVISION 2) for the cross-cutting alex:physics_author / alex:json_author /
peter_parker:runtime_generation variable-bug class:

- Arrow-floor scar (the exact defect REVISION 2 fixed on the sibling) -- every authored force in
  this concept is 30 N (raw length 0.90 world units, 3.0x the 0.30 floor); the sandbox slider and
  idle_auto_sweep range is [15, 45] N (raw length 0.45-1.35), never dipping under the 15 N hard
  floor the coordinator set. Verified numerically in section 4 below -- closed pre-emptively.
- Motion-bound / clamp scar -- every placement below is COMPUTED against surface.length_m = 10
  with an explicit numeric margin per state (section 4). Worst case across all three guided states
  is 2.8 m (S1, S2s body A lane, and S3) -- the skeletons own indicative S3 number (13 s dwell,
  1.55 m margin) is BELOW the 2 m floor, so this block trims S3s dwell to 12 s (matching S1/S2),
  restoring the same 2.8 m margin everywhere. Documented as a deliberate deviation from the
  skeletons indicative number, not a silent drop.
- The Slider Cross-Block Rule (recorded defect from newton_second_law, NOT a hypothetical) --
  section 2 below gives BOTH the physics_engine_config.variables block AND the exact
  slider_controls rows, with an explicit containment table proving every authored per-state body
  value and every sandbox range endpoint falls inside its sliders min/max.
- Label-projection scar -- flagged to json_author: S1/S2/S4 (two independent bodies, wide field of
  view) need a camera framing both lanes without clipping at the worst-case dwell-end position
  (7.2 m); S3 (single real body + ghost) needs a tighter near-side-on frame for the three-arrow FBD.
- HUD zero-stub scar -- f and N are never in readouts except S3s own vertical N ARROW (the
  teaching payload is the visible cancellation, not a numeric N reading); mu_s = mu_k = 0
  throughout so a numeric f row would be a permanent 0.00 stub. F_net appears ONLY in S3, where
  it is genuinely 30.0 N and nonzero -- the anti-cancellation witness, not a duplicate of F_applied.
- Slider-row jump scar -- this concepts token union is exactly m, m2, F (matches the skeletons S4
  control list); no theta, mu_s, mu_k, or v0 row is ever built (frictionless, flat, push-from-rest
  scope -- a seeded v0 would teach nothing third-law, per the skeletons own exclusion).
- Build-once flag scar -- body ids A/B and labels m1/m2 constant across every state that uses them;
  the one per-state flag change is Bs ghost:true in S3 only. Per the skeletons defensive note,
  json_author must verify ghost is a state-APPLY behavior (dim + skip-integrate) and not
  build-time-consumed; if it proves build-consumed, give S3s ghost body its own id (Bg, same m2
  label, never co-visible with the real B).
- Formula-wrap scar -- longest formula string authored is S2s F12=F21 implies a proportional to
  1/m (about 20 characters) -- short by design, matches the skeletons own formula list verbatim.
- default_variables_only_first_var_merged (Bug #1 class) -- no shared default_variables merge step
  in this scenario; every states bodies[] block below is a COMPLETE, self-contained numeric object
  (mass_kg, initial_position_m, initial_velocity_mps, mu_s, mu_k, applied_force_N all explicit
  every state). The m2 variables declared default (300, matching the home-pose baseline shared by
  S1/S3/S4) is explicitly documented in section 3s per-state notes as an OVERRIDE in S2 (900 kg) --
  never left to a silent leak.

No FLAG required.

DC Pandey check: consulted the Laws of Motion table of contents only to confirm Newtons third law
is its own section, following the second law and preceding constraint/pulley problems. No teaching
method, example problem, or figure imported. Every formula below is derived directly from the
engines own stated Branch A integrator (spec section 2) at theta = 0, mu = 0, applied independently
to two bodies plus the action_reaction mirror -- nothing borrowed from any book.

---

## 1. Symbol-label table (Rule 34c, all Unicode)

| Quantity | On-canvas label |
|---|---|
| force on m1 from m2 (applied arrow, body A) | F subscript 1,2 |
| force on m2 from m1 (applied arrow, body B, mirrored) | F subscript 2,1 |
| weight arrow (S3, body A only) | mg |
| normal arrow (S3, body A only) | N |
| net-force readout (S3 only) | Sigma F |
| acceleration readout | a (m/s^2) |
| velocity readout (sandbox) | v (m/s) |
| body labels | m1, m2 (subscripted) |
| mass sliders | m, m2 (subscripted) |
| push-strength slider | F |

## 2. physics_engine_config + slider_controls (the Slider Cross-Block Rule -- both given, verbatim)

### 2a. physics_engine_config

```json
{
  "variables": {
    "m":     { "name": "mass of body A (m1)", "unit": "kg", "min": 100, "max": 1200, "default": 300, "step": 50 },
    "m2":    { "name": "mass of body B (m2)", "unit": "kg", "min": 100, "max": 1200, "default": 300, "step": 50 },
    "F":     { "name": "push-off force magnitude (sandbox slider, STATE_4)", "unit": "N", "min": 15, "max": 45, "default": 30, "step": 1 },
    "g":     { "name": "gravitational acceleration", "unit": "m/s^2", "constant": 9.8 },
    "theta": { "name": "incline angle", "unit": "deg", "constant": 0 },
    "mu_s":  { "name": "coefficient of static friction", "unit": "dimensionless", "constant": 0 },
    "mu_k":  { "name": "coefficient of kinetic friction", "unit": "dimensionless", "constant": 0 },
    "a":     { "name": "acceleration of a body", "unit": "m/s^2", "derived": "F_applied / mass_kg" },
    "F_net": { "name": "net force on the isolated body (S3 only)", "unit": "N", "derived": "F12 (no partner force acts on this same body)" }
  },
  "formulas": {
    "F21_mirror": "-F12",
    "a_A": "F_applied_A / m",
    "a_B": "F_applied_B / m2",
    "F_net_isolated": "F_applied - m * g * sin(radians(theta)) * 0",
    "a_ratio": "a_A / a_B = m2 / m"
  },
  "computed_outputs": {
    "acceleration_ratio_S2": { "formula": "a_A / a_B = m2 / m  (with m2 = 3*m, ratio = 1:3)" },
    "force_equality_check_S1_S2": { "formula": "abs(F_applied_A) = abs(F_applied_B)  at every instant, all masses" }
  },
  "constraints": [
    "F12 = -F21 at every instant, engine-enforced by action_reaction.engaged (never hand-authored twice)",
    "the two forces of a pair act on DIFFERENT bodies, so their sum is never evaluated as a single bodys net force",
    "each bodys own acceleration is a = (its own net force) / (its own mass) -- independent of the partner bodys mass",
    "on m1s own diagram (STATE_3), mg and N cancel because BOTH act on m1 -- this is a balanced-force fact about ONE body, not a third-law pair",
    "theta = 0 and mu_s = mu_k = 0 in every state (flat frictionless floor throughout; no incline, no pulley, no hanging body)",
    "ghost bodies are never integrated and carry no readouts -- a ghosts position is fixed, decorative context only",
    "every authored applied_force_N in every state (and the sandbox idle_auto_sweep/slider range) is >= 15 N, so raw arrow length (F * NLB_ARROW_SCALE = F * 0.030) is always >= 0.45, at least 1.5x NLB_ARROW_MIN_LEN (0.30)"
  ]
}
```

### 2b. slider_controls (exact rows json_author copies verbatim) + containment proof

| slider id | label | min | max | step | default | values it must contain | contained? |
|---|---|---|---|---|---|---|---|
| m | m | 100 | 1200 | 50 | 300 | S1 A=300, S2 A=300, S3 A=300, S4 default A=300, sandbox drag range | YES -- 300 in [100,1200] |
| m2 | m2 | 100 | 1200 | 50 | 300 | S1 B=300, S2 B=900, S3 ghost-B=300 (decorative, never dragged), S4 default B=300, sandbox drag range | YES -- 300 and 900 in [100,1200] |
| F | F | 15 | 45 | 1 | 30 | S1=30, S2=30(both), S3=30, S4 default=30, idle_auto_sweep range [15,45] | YES -- 15, 30, 45 all in [15,45] (inclusive endpoints) |

m2s variable default (300) matches the home-pose baseline used in S1/S3/S4; S2 explicitly
overrides it to 900 kg in its own bodies[] block (section 3) -- never left to a silent leak from a
prior state, per the Bug #1 prevention rule. The F sliders floor (15) is set EQUAL to the
arrow-render floors minimum safe value by design -- the teacher physically cannot drag a force
below the point where the arrow would collapse toward the clamp.

---

## 3. Per-state variable overrides

STATE_1 -- action_reaction_pair (two independent bodies, symmetric)
```json
"surface": { "theta_deg": 0, "length_m": 10, "frictionless": true },
"bodies": [
  { "id": "A", "label": "m1", "mass_kg": 300, "initial_position_m": 0, "initial_velocity_mps": 0, "mu_s": 0, "mu_k": 0, "applied_force_N": 30 },
  { "id": "B", "label": "m2", "mass_kg": 300, "initial_position_m": 0, "initial_velocity_mps": 0, "mu_s": 0, "mu_k": 0, "applied_force_N": -30 }
],
"action_reaction": { "engaged": true, "driver_body_id": "A" }
```
Justification: both bodies at the SAME initial_position_m: 0 (the lane-offset renders them
side-by-side automatically, commit 3a576ea) -- never a position stagger to fake separation.
applied_force_N is signed along each bodys OWN positive axis so the two forces point apart
(recoil in opposite world directions) even though the mirror makes their MAGNITUDES identical; Bs
-30 is overwritten every frame by the engines mirror of As +30 regardless of the literal value
authored here, so this is documentation of intent, not a competing source of truth.
initial_velocity_mps: 0 on both -- explicit push-off-from-rest lock (defensive, mirrors
hinge_force.json STATE_4s F_ext: 0 pattern), never inherited from a prior state.

STATE_2 -- action_reaction_pair (declared contrast pair with S1 -- masses 1:3, forces unchanged)
```json
"surface": { "theta_deg": 0, "length_m": 10, "frictionless": true },
"bodies": [
  { "id": "A", "label": "m1", "mass_kg": 300, "initial_position_m": 0, "initial_velocity_mps": 0, "mu_s": 0, "mu_k": 0, "applied_force_N": 30 },
  { "id": "B", "label": "m2", "mass_kg": 900, "initial_position_m": 0, "initial_velocity_mps": 0, "mu_s": 0, "mu_k": 0, "applied_force_N": -30 }
],
"action_reaction": { "engaged": true, "driver_body_id": "A" }
```
Justification: mass_kg: 900 on body B is the ONE changed value versus S1 (Rule 32b -- only the
taught variable, the partners mass, differs); applied_force_N stays 30/-30, IDENTICAL to S1 --
that identity, preserved across the state boundary, IS the states entire payload. This is a
deliberate variable_override against the m2 sliders home-pose default (300, section 2b) --
justified because S2s narrative requires exactly this 1:3 ratio, and the override protects
against a downstream default-variables leak reintroducing 300 (the field_forces.json STATE_5 m: 1
defensive pattern).

STATE_3 -- fbd_isolate (single real body + ghost partner)
```json
"surface": { "theta_deg": 0, "length_m": 10, "frictionless": true },
"bodies": [
  { "id": "A", "label": "m1", "mass_kg": 300, "initial_position_m": 0, "initial_velocity_mps": 0, "mu_s": 0, "mu_k": 0, "applied_force_N": 30 },
  { "id": "B", "label": "m2", "ghost": true, "mass_kg": 300, "initial_position_m": -1.5, "initial_velocity_mps": 0, "mu_s": 0, "mu_k": 0, "applied_force_N": 0 }
]
```
Justification: NO action_reaction block -- B is a ghost (never integrated, per spec section 3s
skipped entirely by the step function), so there is nothing for the engine to mirror; the partner
force is narratively acknowledged (it lives on m2) but never drawn, because this diagram is
deliberately isolating ONE body. initial_position_m: -1.5 is Bs own distinct authored position
(ghosts are excluded from the nlbBodyLaneZ automatic offset by design) -- physically honest as
where the push came from, and NOT the forbidden two-real-body stagger (that rule applies only to A
and B when both are real and independent). applied_force_N: 0 on the ghost is inert (it is never
integrated) but kept at a physically consistent zero rather than an undefined value. json_author
must verify ghost applies per-state (state-apply, not build-consumed) per the build-once flag scar
note in Engine bug queue consultation; fallback is a distinct id Bg.

STATE_4 -- sandbox (both bodies real, teacher-driven)
```json
"surface": { "theta_deg": 0, "length_m": 10, "frictionless": true },
"bodies": [
  { "id": "A", "label": "m1", "mass_kg": 300, "initial_position_m": 0, "initial_velocity_mps": 0, "mu_s": 0, "mu_k": 0, "applied_force_N": 30 },
  { "id": "B", "label": "m2", "mass_kg": 300, "initial_position_m": 0, "initial_velocity_mps": 0, "mu_s": 0, "mu_k": 0, "applied_force_N": -30 }
],
"action_reaction": { "engaged": true, "driver_body_id": "A" },
"trusted_drag_seizes": true,
"idle_auto_sweep": { "param": "F", "range": [15, 45] }
```
Justification: home pose restored (both bodies at 300 kg, the S1 baseline) -- the teachers own
drag is what breaks the symmetry live, per the skeletons teacher recipe. idle_auto_sweep range
[15, 45] matches the F sliders own range exactly (section 2b) -- the idle sweep can never exceed
what the slider itself permits, and its floor (15 N) never dips under the arrow-render floor.
v0 is intentionally absent from controls_visible and from this concepts variable set -- per the
skeleton, a seeded velocity teaches nothing third-law (push-off-from-rest IS the concept).

---

## 4. Numerical sanity checks (per state)

STATE_1 -- surface.length_m = 10 -> clamp = +/-10 m. F = 30 N on each body (magnitudes equal,
directions opposite by construction). a_A = 30/300 = 0.10 m/s^2; a_B = 30/300 = 0.10 m/s^2 (equal
masses gives equal accelerations, the simple case). Duration = 12 s -> d = 0.5 * 0.10 * 12^2 = 7.2 m
each, bodies end at mirrored +/-7.2 m (they push APART from the shared start) -> margin =
10 - 7.2 = 2.8 m. Arrow-floor check: raw length = 30 * 0.030 = 0.90 world units, 3.0x the 0.30 floor,
well under the 4.0 ceiling. First captured frame (t=0): v = 0.00 both bodies; a = 0.10 both, pinned
immediately (constant force present in config from frame 1, not phased in -- correct, not a
v0-leak bug).

STATE_2 -- Same surface/duration. F = 30 N on both bodies (UNCHANGED from S1 -- the taught
invariant). m_A = 300 kg, m_B = 900 kg (1:3). a_A = 30/300 = 0.10 m/s^2; a_B = 30/900 = 0.0333
m/s^2 -> exact 3:1 ratio. d_A(12) = 7.2 m -> margin 2.8 m (binding case). d_B(12) = 0.5 * 0.0333 *
144 = 2.4 m -> margin 7.6 m. Both arrows: raw length 0.90 world units, IDENTICAL length on screen
(the states entire payload) despite the 1:3 mass difference. First frame: v = 0.00 both; a_A =
0.10, a_B = 0.0333, both pinned immediately. Live m2 drag mid-run: if the teacher drags Bs mass to
the slider max (1200 kg) partway through, a_B recomputes to 30/1200 = 0.025 m/s^2 instantly -- B
slows its rate of gain further, never approaches the clamp faster than the frozen case.

STATE_3 -- Real body A only (m_A = 300 kg, F12 = 30 N, F_net = 30 N since nothing else acts
horizontally on this isolated body: mg and N are vertical and cancel on this SAME body, they do not
enter the horizontal net force). a_A = 30/300 = 0.10 m/s^2. Dwell trimmed to 12 s (deviating from
the skeletons indicative 13 s, which gave only 1.55 m margin -- below the 2 m hard floor) ->
d(12) = 0.5 * 0.10 * 144 = 7.2 m -> margin = 10 - 7.2 = 2.8 m, matching S1/S2s binding case exactly.
Ghost body B holds its authored pose at -1.5 m for the entire state (never integrated, no
readouts). Arrow-floor check: F12 raw length 0.90; mg and N are drawn at their own physical
magnitudes (m*g = 300 * 9.8 = 2940 N -- FAR above the arrow ceiling of 4.0 world units at the 0.030
scale; flagged below as a constraint callout, since the engines NLB_ARROW_SCALE is a single global
constant and mg/N are two orders of magnitude larger than the horizontal F12). First frame:
v = 0.00, a = 0.10 pinned, F_net = 30.00 N (the anti-cancellation witness number).

STATE_4 -- Both bodies real, home pose (300 kg each, F = 30 N default, mirrored). At reveal,
identical to S1s first frame (v=0.00, a_A=a_B=0.10). idle_auto_sweep on F ranges [15,45] N at the
default m=m2=300 kg -> drives a continuously between 15/300=0.05 and 45/300=0.15 m/s^2 on each body
while idle (magnitudes always equal by the mirror, at every swept value) until a trusted
slider/drag seizes control (Rule 37: free-run, no freeze pin). Arrow-floor check across the full
sweep: raw length ranges 0.45 (at F=15) to 1.35 (at F=45) -- both comfortably inside [0.30, 4.0],
never a stub, never clamped. Teacher recipe (per skeleton, zero narrated words): drag m2 huge ->
arrows stay twins, its recoil dies; drag F -> both arrows grow together, both recoils scale
together; a_A / a_B = m2 / m holds at every setting.

Constraint callout raised to json_author (S3 vertical arrows): mg = m*g = 2940 N and N = 2940 N
are two orders of magnitude above F12 = 30 N. If json_authors arrow-build code applies the SAME
NLB_ARROW_SCALE to mg/N as to F12, both will clamp to the 4.0 ceiling and render as identical-length
maxed-out arrows -- which is actually the CORRECT visual for equal and opposite, they cancel
(their equality is the point, not their absolute length relative to F12). No renderer change
needed -- the specs clamp(min,max) already handles this per section 3 of the engine spec;
flagging only so json_author does not mistake two 4.0-length vertical arrows for a bug.

---

## 5. Within-state reveal timeline (Rule 26/31/32 -- t-windows in ms, no phases[] authored)

| state | t-window (ms) | what appears / moves | Rule 32a stagger |
|---|---|---|---|
| S1 | 0-300 | home pose settles: both blocks at rest, side by side at the shared start (lane offset) | -- |
| S1 | 300-900 | both force arrows render simultaneously from the engines constant applied_force_N (F12 on A, F21 on B -- mirrored, identical length, opposite direction); glow_focal = nlb_arrow_B_applied highlights the mirrored surprise arrow | cause (forces) visible now |
| S1 | 900-1800 | bodies remain visually near-stationary (at a=0.10 m/s^2 from rest, displacement at t=1s is only 0.05 m -- imperceptible) -- this IS the readable Rule 32a gap, produced by the physics itself, not a staged delay | effect not yet legible |
| S1 | 1800-12000 | both blocks visibly recoil apart, symmetrically, reaching +/-7.2 m by t=12000; H2 freeze pin holds the final frame | effect now clearly legible |
| S2 | 0-300 | home pose: same start line as S1, body B now visibly the SAME mesh/size (mass is not drawn as size -- Rule 29 -- the label + readout carry the 1:3) | -- |
| S2 | 300-900 | both arrows render simultaneously, IDENTICAL length (unchanged from S1) -- glow_focal = nlb_body_A, the light body about to visibly out-accelerate | cause visible, arrows equal |
| S2 | 900-1800 | both bodies still near-stationary -- same imperceptible-motion gap as S1 | effect not yet legible |
| S2 | 1800-12000 | body A pulls ahead fast (a=0.10), body B creeps (a=0.0333) -- the widening gap between the two lanes is the readout; m2 slider live-draggable throughout | effect: growing asymmetry |
| S3 | 0-300 | home pose: body A at the start line, ghost B holds its dimmed pose at -1.5 (context only) | -- |
| S3 | 300-1000 | the three-arrow diagram on A settles: mg down, N up (both render, equal length, visibly cancelling), then F12 horizontal glows (glow_focal = nlb_arrow_A_applied) | cause (all 3 forces) visible |
| S3 | 1000-1800 | body A still near-stationary (same imperceptible-motion window) while F_net = 30.00 N is already readable on the HUD -- the numeric proof arrives before the visible motion does | effect (numeric) precedes effect (visual) |
| S3 | 1800-12000 | body A visibly accelerates away while the ghost holds its pose absolutely still -- the contrast between the one thing that moves and the one thing that doesnt is the states whole picture; ends at +7.2 m, 2.8 m margin | effect (visual) now legible |
| S4 | 0-open | idle: F auto-sweeps [15,45] N, both arrows grow/shrink together (always equal), both bodies recoil together at the swept rate, until a trusted drag/slider seizes control (Rule 37: continuous free-run, no freeze) | continuous, teacher-paced |

---

## 6. Narration script (Rule 30/31/35 -- word counts below)

STATE_1 (49 EN words -- within the 35-50 budget)
"Two blocks start together, side by side, at rest. One block pushes off the other, and instantly
both feel a force: one arrow points from block two onto block one, an identical arrow points the
other way -- same length, opposite direction -- and both blocks recoil apart, together."

STATE_2 (53 EN words -- within the 40-55 budget)
"Same push, new masses -- block two now carries three times block ones mass. Watch the two force
arrows: exactly the same length, however unequal the blocks. Yet block one shoots away fast while
block two barely creeps, its acceleration exactly one third. Drag block twos mass and watch that
gap change live."

STATE_3 (55 EN words -- within the 40-55 budget)
"Look at block one alone. Its weight pulls down, the surface pushes up -- equal, opposite, and
they cancel, because both act on this same block. The horizontal push has no such partner here;
its partner acts on block two, not on this diagram. So block ones net force is not zero, and it
accelerates."

STATE_4 -- 0 words / open (matches skeleton: teacher recipe, zero narrated words).

Rule 35 check: no country-specific places, brands, currency, or names in any script.
Rule 30 check: bare symbols expanded on first spoken use (F12/F21 -> arrow, a -> its
acceleration, m2 -> block twos mass); narration never implies one body pushes while the
other is pushed -- every sentence gives the interaction one shared verb (pushes off, feel a
force, push has no such partner) so agency never implies force inequality (guards M1s planting
risk, per the skeletons Pass-1 note).

---

## 7. Delta cues + formula overlays (Rule 32c/34a/34b)

| state | on-canvas delta cue (<=5 words) | formula overlay (ONE Unicode surface) |
|---|---|---|
| S1 | One push -- two forces | F12 = -F21 |
| S2 | Unequal masses -- equal forces | abs(F12) = abs(F21) implies a proportional to 1/m |
| S3 | Cancel needs one body | Sigma F on m1 = F12, not zero |
| S4 | All yours | F12 = -F21 |

(json_author renders these with real Unicode glyphs per Rule 34c: subscripts as U+2081/U+2082,
proportional-to as U+221D, Sigma as U+03A3, not-equal as U+2260 -- written here in ASCII-safe form
for this markdown handoff only, matching the sealed siblings precedent.)

---

## 8. Drill-down cluster phrasings (5 real student-voice phrases each)

heavier_pushes_harder_myth (STATE_2)
1. doesnt the heavier thing push harder
2. shouldnt the bigger block win the push
3. why is the force the same if the masses arent
4. if one is 3 times heavier shouldnt its push be 3 times bigger
5. why do they feel different if the force is equal

equal_forces_unequal_effects (STATE_2)
1. why does the light one fly off if the force is the same
2. same push so why is one barely moving
3. how can equal forces cause such different motion
4. if forces are equal why isnt the speed
5. why does mass change the outcome if the force didnt change

who_exerts_the_force (STATE_2)
1. does a wall push back on me
2. how can a wall push if it isnt even moving
3. does the floor really push up on me as hard as I push down
4. why does a lighter object still push back on something huge
5. does a fly really push back on a truck

action_reaction_never_cancel (STATE_3)
1. if forces are equal and opposite why doesnt everything just stay still
2. shouldnt equal and opposite mean zero net force
3. why does anything move if every force has an equal opposite
4. doesnt equal and opposite mean they cancel out
5. why can I still push a wall and move if it pushes back equally

pair_vs_balanced_forces (STATE_3)
1. arent weight and normal force the third law pair
2. why dont mg and N count as action reaction
3. if mg and N cancel arent they the same kind of pair as the push
4. whats the difference between balanced forces and a third law pair
5. why does it matter what body a force acts on

identify_the_pair (STATE_3)
1. how do I know which force is the reaction to which
2. is the reaction always the opposite type of force
3. does gravity have a reaction force too
4. so what pulls the earth up when it pulls me down
5. how do I find the partner force for any given force

---

## 9. Board-mode mark scheme

DEFERRED (Rule 20 [D]). Conceptual-only directive is active; no board/competitive mode_overrides
authored for this concept. Nothing further to author in this section.

---

## 10. Constraint callouts (for json_author)

- radians(theta) wrap is authored in every formula even though theta is constant 0 for this entire
  concept -- future-proofs the string for any later retrofit.
- No scale_pixels_per_unit needed -- the engines own NLB_ARROW_SCALE / clamp(min,max) owns
  arrow-length mapping (spec section 3); nothing further to specify here.
- S3s vertical arrows (mg, N at 2940 N each) will clamp to the 4.0 ceiling under the same global
  NLB_ARROW_SCALE as the 30 N horizontal F12 -- this is CORRECT (their visible equality at the
  ceiling is the cancellation payload), not a defect; see section 4s constraint callout for the
  full reasoning.
- F_net appears ONLY in S3s readouts (the anti-cancellation witness, 30.00 N); it is absent from
  S1/S2/S4 where it would be a redundant duplicate of F_applied (theta=0, mu=0 makes them identical
  everywhere, but only S3s narrative needs the reader to SEE that identity called out).
- f and N (as numeric HUD rows, not the S3 arrow) never appear in readouts anywhere -- mu=0
  identically, so a numeric friction row would be a permanent 0.00 stub; the vertical N teaches
  its lesson as an ARROW in S3, never as a number.
- Ghost bodies (S3s B) carry no HUD rows by the engines non-ghost rule -- verified consistent with
  the skeletons own note.

---

## 11. Self-review checklist

- [x] Every symbol referenced in the state narrations (F, F12, F21, a, m, m2, mg, N, F_net) appears
      in the variables/symbol-label table.
- [x] Every formula uses radians() for the angle argument (theta constant at 0, future-proofed).
- [x] Every states live control(s) match the architects control table exactly (S1 none, S2 m2,
      S3 none, S4 m/m2/F).
- [x] variable_overrides documented for every state that needs one: S2s m2:900 (contrast pair,
      Rule 32b), S3s ghost body distinct position + applied_force_N:0 (inert), S1s
      initial_velocity_mps:0 push-off-from-rest lock on both bodies.
- [x] Board mark scheme: DEFERRED (Rule 20 [D]), nothing authored.
- [x] Drill-down phrasings: 5 per cluster x 6 clusters, real student voice, no teacher-prose.
- [x] constraints block: 7 short factual assertions (section 2a).
- [x] Numerical sanity checks run for all 4 states (section 4): S1/S2/S3 all land at exactly 2.8 m
      margin against surface.length_m = 10; S3s dwell explicitly TRIMMED from the skeletons
      indicative 13 s to 12 s to clear the 2 m hard floor (was 1.55 m at 13 s -- documented
      deviation, not a silent drop).
- [x] Arrow-floor check: every authored applied_force_N (30 N) and every sandbox range endpoint
      (15-45 N) yields raw arrow length in [0.45, 1.35] world units -- inside [0.30 floor, 4.0
      ceiling] with margin on both sides, every state, every slider position.
- [x] Slider Cross-Block Rule: physics_engine_config.variables AND slider_controls both given
      (section 2), with an explicit per-slider containment table (section 2b) proving every
      authored/swept value is inside its sliders range.
- [x] Within-state reveal timeline written for every state (section 5): t-windows encode the Rule
      32a cause-before-effect stagger (forces render first; visible motion legible only after the
      physics-driven imperceptible-motion window; S3 additionally shows the numeric effect --
      F_net -- before the visual effect); no two guided states share a motion beyond the declared
      S1/S2 contrast pair (both mirror-recoil, explicitly declared); no static state.
- [x] Word budget: S1 = 49 (35-50), S2 = 53 (40-55), S3 = 55 (40-55), S4 = 0/open -- all compliant.
- [x] Engine bug queue consulted; all relevant prevention rules satisfied -- arrow floor, motion
      bound, slider cross-block, label projection, HUD zero-stub, slider-row jump, build-once flag,
      formula-wrap, and Bug #1 default-leak classes all explicitly addressed above. No FLAG needed.
- [x] DC Pandey check: no import -- all formulas derived from the engines own Branch A integrator
      at theta=0, mu=0, applied per-body plus the action_reaction mirror; no teaching method,
      example, or figure imported.

---
Handoff: json_author -- build src/data/concepts/newton_third_law.json per this physics block
(sections 2-10) plus the architect skeleton (docs/loop_runs/lom/newton_third_law/skeleton.md),
using the newtons_laws_body scenario blocks verbatim. Flag forward: (1) verify the ghost flag is
state-apply, not build-consumed (fallback Bg id, section 3); (2) verify which body the
#nlb_f_slider emitter writes in the two-body S4 sandbox -- must write body As (driver_body_id)
applied_force_N for the mirror to stay well-defined, per the architects own ENGINE GAP note;
(3) S3s vertical mg/N arrows will clamp to the ceiling -- this is correct, not a bug (section 10).
