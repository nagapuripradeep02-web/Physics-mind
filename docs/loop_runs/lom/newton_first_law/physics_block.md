# PHYSICS BLOCK — `newton_first_law` (Laws of Motion, Class 11)

> Author: physics_author. Input: `docs/loop_runs/lom/newton_first_law/skeleton.md` (approved,
> ENGINE GAP: none) + `docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md` §1/§2 (`newtons_laws_body` scenario,
> Branch A — independent bodies, theta = 0, 1 body, `g = 9.8`, `STOP_EPS_V = 0.01`).
> HARD CONSTRAINT honored: every value below is expressible in spec §1's config surface
> (`mode` / `surface` / `bodies[]` / `arrows[]` / `glow_focal` / `readouts` / `controls_visible` /
> `idle_auto_sweep` / `phases[]`). **ENGINE GAP: none** (confirms the architect's own finding).

## Engine bug queue consultation (pre-authoring)

Consulted the same scar rows the architect flagged (`docs/loop_runs/lom/_engine/scar_candidates.sql`,
all 12 `nlb` seam rows) plus the cross-cutting alex:physics_author / alex:json_author /
peter_parker:runtime_generation variable-bug class. Relevant prevention rules and compliance:

- Motion-bound / clamp scar: every placement below is COMPUTED against surface.length_m
  with an explicit numeric margin stated per state.
- Label-projection scar: flagging to json_author: each state needs its own near-side-on
  camera_position; no new physics implication.
- HUD zero-stub scar: F_net = 0.00 in S1/S3 is the TAUGHT value (genuine physics, not a
  stub); documented explicitly in the computed-numbers tables below.
- Slider-row jump scar: controls_visible per state is the exact token set from the architects
  table; no theta row is ever authored for this concept.
- Formula-wrap scar: longest formula string authored is `SigmaF = 0 <=> v constant` — short by design.
- default_variables_only_first_var_merged (Bug #1 class): this scenario has NO shared
  default_variables merge step; every states bodies[] block below is a COMPLETE, self-contained
  numeric object (mass_kg, initial_position_m, initial_velocity_mps, mu_s, mu_k, applied_force_N all
  explicit every state) — nothing is left to fall back to a prior states leaked value.

No FLAG required.

DC Pandey check: no formula, explanation, or example problem imported from any book. All formulas
below are derived directly from Newtons second law plus the engines own stated integrator (spec 2).

---

## 1. physics_engine_config

```json
{
  "variables": {
    "m":     { "name": "mass", "unit": "kg", "min": 0.5, "max": 5, "default": 2, "step": 0.5 },
    "F":     { "name": "applied force", "unit": "N", "min": -4, "max": 4, "default": 0, "step": 0.5 },
    "mu_s":  { "name": "coefficient of static friction", "unit": "dimensionless", "min": 0, "max": 1, "default": 0, "step": 0.05 },
    "mu_k":  { "name": "coefficient of kinetic friction", "unit": "dimensionless", "min": 0, "max": 1, "default": 0, "step": 0.05 },
    "v0":    { "name": "initial velocity", "unit": "m/s", "min": -3, "max": 3, "default": 0, "step": 0.5 },
    "g":     { "name": "gravitational acceleration", "unit": "m/s^2", "constant": 9.8 },
    "theta": { "name": "incline angle", "unit": "deg", "constant": 0 },
    "N":     { "name": "normal force", "unit": "N", "derived": "m * g * cos(radians(theta))" },
    "w":     { "name": "weight", "unit": "N", "derived": "m * g" }
  },
  "formulas": {
    "N": "m * g * cos(radians(theta))",
    "drive": "F - m * g * sin(radians(theta))",
    "static_hold_condition": "abs(drive) <= mu_s * N",
    "kinetic_friction": "-sign(v) * mu_k * N",
    "a_moving": "(drive + kinetic_friction) / m",
    "a_static_hold": "0",
    "sum_F": "m * a"
  },
  "computed_outputs": {
    "weight_N": "m * g",
    "normal_N": "m * g * cos(radians(theta))",
    "F_net_N": "drive + kinetic_friction (0 if static-held)",
    "stop_time_s": "v0 / (mu_k * g)",
    "stop_distance_m": "v0^2 / (2 * mu_k * g)"
  },
  "constraints": [
    "g = 9.8 m/s^2 (Earths surface, constant, theta = 0 throughout this concept)",
    "ideal rigid body, no deformation, no air resistance or drag anywhere in this concept",
    "under kinetic friction with theta = 0, deceleration a = -mu_k * g is mass-independent (m cancels)",
    "static-hold condition abs(drive) <= mu_s * N is never near its threshold in any authored state",
    "STOP_EPS_V = 0.01 m/s: velocity below this is treated as exactly zero by the engine",
    "mass and weight are not the same physical quantity (w = m*g, not m itself)"
  ]
}
```

---

## 2. Per-state variable overrides (full bodies[] blocks — self-contained, no carried defaults)

STATE_1 — coast_no_force
```json
"surface": { "theta_deg": 0, "length_m": 10, "frictionless": true },
"bodies": [{ "id": "A", "label": "m", "mass_kg": 2, "initial_position_m": -8,
             "initial_velocity_mps": 1.0, "mu_s": 0, "mu_k": 0, "applied_force_N": 0 }]
```
Justification: frictionless: true hard-zeroes mu_s/mu_k for this state regardless of any prior
states value (defensive — mirrors the field_forces.json STATE_5 m: 1 pattern) even though
mu_s/mu_k are also explicitly 0 on the body. Belt-and-braces against the Bug #1 leak class.

STATE_2 — coast_with_friction
```json
"surface": { "theta_deg": 0, "length_m": 10, "frictionless": false },
"bodies": [{ "id": "A", "label": "m", "mass_kg": 2, "initial_position_m": -8,
             "initial_velocity_mps": 1.0, "mu_s": 0.4, "mu_k": 0.025, "applied_force_N": 0 }]
```
Justification: initial_position_m and initial_velocity_mps are IDENTICAL to STATE_1 (Rule 32b —
only the taught variable, friction, changes). mu_s = 0.4 is authored explicitly even though it never
binds in this state (drive = 0 once F = 0, so the static condition is trivially satisfied at rest) —
declared so no downstream state mu_s leaks in; it exists only so the body has a physically sensible
resting coefficient once it stops, not to gate any motion here.

STATE_3 — rest_equilibrium
```json
"surface": { "theta_deg": 0, "length_m": 10, "frictionless": false },
"bodies": [{ "id": "A", "label": "m", "mass_kg": 2, "initial_position_m": 0,
             "initial_velocity_mps": 0, "mu_s": 0.5, "mu_k": 0.3, "applied_force_N": 0 }]
```
Justification: initial_velocity_mps: 0 and applied_force_N: 0 are explicit overrides (STATE_1/2
both used v0 = 1.0 — without this override a leaked v0 would break the rest narrative, the exact
hinge_force.json STATE_4 F_ext: 0 defensive pattern). mu_s = 0.5 genuinely exercises the
static-hold branch (abs(drive) = 0 <= mu_s*N is true for ANY mu_s >= 0, so this is not threshold-critical,
but it must be non-zero and present so json_author never emits a bare frictionless body at rest).

STATE_4 — sandbox
```json
"surface": { "theta_deg": 0, "length_m": 10, "frictionless": false },
"bodies": [{ "id": "A", "label": "m", "mass_kg": 2, "initial_position_m": 0,
             "initial_velocity_mps": 0, "mu_s": 0, "mu_k": 0, "applied_force_N": 0 }],
"trusted_drag_seizes": true,
"idle_auto_sweep": { "param": "F", "range": [-4, 4] }
```
Justification: sandbox defaults reset to mu_s = mu_k = 0 (explicit override against STATE_3's 0.5/0.3
leaking forward) so the idle_auto_sweep on F immediately demonstrates a = F/m with no static
threshold in the way; the teacher can then drag mu_s/mu_k up live to explore the threshold
behavior deliberately, on their own initiative.

---

## 3. Within-state motion timeline + per-state control spec (Rule 31/32/26)

| state | t-window | what animates (pure fn of state clock) | driven by | live control(s) |
|---|---|---|---|---|
| S1 | 0-16000 ms | body A translates s(t) = -8 + 1.0*t (t in s) at constant v; readouts v = 1.00 and F_net = 0.00 hold constant the entire window | initial_velocity_mps, frictionless (drive = 0) | none |
| S1 | 0-16000 ms | weight + normal arrows shown small, static, unglowed (context only); net arrow stays hidden (engine zero-hides, F_net = 0.00) | static geometry | none |
| S2 | 0-~4080 ms | friction arrow fk appears GLOWING from t = 0 (cause visible frame 1), pointing backward; body A decelerates per the integrator, s(t) following a = -0.245 m/s^2 until v reaches STOP_EPS_V | mu_k, integrator | none |
| S2 | ~4080-14000 ms | body A holds at rest at s ~= -5.96; fk arrow and f readout drop to 0/hidden (engine zero-hides) the instant it stops — the readout going quiet IS the beat | integrator stop condition | none |
| S3 | 0-4000 ms | body static; glow_focal = weight arrow mg (phase "focal_weight") | phases[0] | m |
| S3 | 4000-12000 ms | glow handoff (phase action inert — glow ONLY) to normal arrow N (phase "focal_normal"); body stays static, F_net = 0.00 throughout | phases[1] | m |
| S3 | continuous | if the teacher drags m, BOTH weight and normal arrow lengths rescale live (len proportional to magnitude, Rule 29 exception) and the N readout updates live; body never moves | m slider | m |
| S4 | open, continuous | idle: F auto-sweeps -4 to 4 to -4 N (idle_auto_sweep) driving a = F/m live until a trusted slider/drag seizes control; body position/velocity respond continuously per the integrator (Rule 37: free-run, no freeze) | F (idle) then any slider once seized | m, F, mu_s, mu_k, v0 (ALL) |

Rule 32 sequencing check: S2's cause (friction arrow, glowing) opens at t = 0 alongside the launch —
the effect (visible deceleration) is continuous from the same instant because friction here is not a
discrete triggered event but a constant force present from launch; the gap is legible instead via
the CONTRAST with S1 (identical launch, only the arrow and resulting decel differ) — this is the
declared contrast-pair mechanism the skeleton names, not a violated 32a (32a's ~0.5-1s gap applies to
discrete cause-to-effect events; a continuously-acting force from t=0 is the correct legibility pattern
here, matching coast_with_friction's own mode name). S3's cause (weight, always present) precedes
its glow-handoff to the effect-framing arrow (normal) by the full 4000 ms phase-1 window — compliant.

---

## 4. Board-mode mark scheme

DEFERRED (Rule 20 [D]). Conceptual-only directive is active; no board/competitive mode_overrides
authored for this concept. Nothing further to author in this section.

---

## 5. Drill-down cluster phrasings (5 real student-voice phrases each)

motion_needs_force_myth (STATE_1)
1. why does it need force to keep going
2. doesnt something have to keep pushing it
3. why isnt there a force in the direction of motion
4. wont it slow down eventually anyway
5. how can it move with no force at all

frictionless_idealization (STATE_1)
1. is there really a frictionless floor anywhere
2. where would you ever find zero friction
3. is space actually frictionless
4. why do we pretend friction is zero
5. does ice count as frictionless

galileo_inclined_plane_argument (STATE_1)
1. why did galileo use a ramp for this
2. whats the ball rolling forever argument
3. how did anyone prove this without space travel
4. why cant you test this on earth directly
5. what did galileo actually imagine happening

rest_means_no_forces (STATE_3)
1. if its not moving arent there just no forces
2. why would forces be there if nothing happens
3. so at rest nothing is pushing on it right
4. how can two forces be huge but do nothing
5. doesnt zero motion mean zero force

balanced_vs_zero_forces (STATE_3)
1. how can mg and N cancel if theyre different things
2. why dont the forces just add up instead
3. if forces are equal why arent they zero individually
4. why does the net force matter more than each force alone
5. so the forces are still fighting each other

net_force_vs_individual_forces (STATE_3)
1. why only the total force decides motion
2. what if one force is huge but net is small
3. why doesnt mg alone move the block down
4. does every force count separately for motion
5. why do we add forces before deciding what happens

---

## 6. Constraint callouts

- radians(theta) wrap required in every formula per PM_interpolate convention even though
  theta = 0 is constant this concept — future-proofs the formula string if a later retrofit
  reuses it (block_on_incline is the concept that actually varies theta).
- Slider steps: m 0.5, F 0.5, mu_s/mu_k 0.05, v0 0.5 — chosen so the S4 idle sweep and
  manual drags land on readable round numbers.
- No scale_pixels_per_unit needed — the engines own NLB_ARROW_SCALE / clamp(min,max) owns
  arrow-length mapping (spec 3); nothing for physics_author to specify here.
- F_net readout in S1/S3 legitimately prints 0.00 — this is the TAUGHT value, not a stub (HUD
  zero-stub scar, addressed above).

---

## 7. Numerical sanity checks (computed, not guessed)

STATE_1 — frictionless coast
- surface.length_m = 10 -> visible clamp = +/-10 m.
- initial_position_m = -8, initial_velocity_mps = 1.0, applied_force_N = 0, frictionless.
- drive = 0 - 2*9.8*sin(0) = 0 => a = 0 => v(t) = 1.0 m/s constant => s(t) = -8 + 1.0*t.
- Narration window = 16 s (40-50-word budget ~ 16 s) => s(16) = -8 + 16 = +8 m.
- Clamp check: +8 m vs +/-10 m bound -> 2 m margin, never touches the clamp. (The architect
  skeletons own arithmetic assumed a 14 s window ending at +7 against a length_m = 9 clamp — that
  pairing leaves only a 2 m margin on a different number set and does not match this states actual
  authored duration of ~16 s; recomputed here against the states real 16 s narration window with
  length_m = 10 / s0 = -8 for a clean, unambiguous 2 m margin at the frame the review player freezes on.)
- F_net(t) = 0.00 for all t — the taught value.

STATE_2 — same launch + friction
- Identical launch: initial_position_m = -8, initial_velocity_mps = 1.0.
- mu_k = 0.025 => a = -mu_k*g = -0.245 m/s^2 (mass-independent, drive = 0, theta = 0).
- t_stop = v0 / (mu_k*g) = 1.0 / 0.245 = 4.08 s.
- d_stop = v0^2 / (2*mu_k*g) = 1.0 / 0.49 = 2.04 m.
- Stop position: -8 + 2.04 = -5.96 m — well inside the +/-10 m bound (4+ m margin either side).
- Contrast with S1: 16 m of travel (frictionless) vs 2.04 m of travel (friction) — same launch,
  visibly different outcome, the entire pedagogical point.
- Narration window ~14 s > t_stop (4.08 s) => the "it stopped" beat is fully on screen with ~10 s
  of held rest afterward before the state ends.
- f magnitude while moving: mu_k*N = 0.025 * (2*9.8) = 0.49 N; drops to 0 (hidden) at t_stop.

STATE_3 — rest equilibrium
- v0 = 0, F = 0, mu_s = 0.5 (mu_s > 0, static branch genuinely engaged: abs(drive) = 0 <= mu_s*N
  for any mu_s >= 0, so the block is provably held at rest, not merely coincidentally still).
- N = m*g*cos(0) = m*g. At default m = 2 kg: N = 19.6 N (= weight, w = 19.6 N).
- At slider ends: m = 0.5 kg -> N = 4.9 N; m = 5 kg -> N = 49.0 N.
- F_net = 0.00 throughout, for every value of m on the slider — the supporting-aha demonstration
  (mass-independence of the balance) is literally visible as the readout never leaving 0.00.

STATE_4 — sandbox
- Defaults: m = 2 kg, F = 0 N, mu_s = 0, mu_k = 0, v0 = 0.
- idle_auto_sweep: F ranges [-4, 4] N => with defaults (mu = 0) this drives a = F/m directly
  from -2 to +2 m/s^2 at m = 2 kg — an immediate, frictionless demonstration that any nonzero
  F (hence nonzero net force) changes v, while F = 0 leaves v exactly constant.
  Teacher can then drag mu_s/mu_k up from 0 to reintroduce a static threshold and watch small
  |F| fail to move the block at all (abs(drive) <= mu_s*N holds) — the full concept in one control set.

---

## 8. Narration scripts (Rule 30/31/35)

STATE_1 (47 EN words - within 40-50 budget)
"Watch the number v - it never changes. This block was set moving once, and now glides forever
on a frictionless floor, exactly like a space probe coasting between planets. Net force reads
zero the whole time: nothing pushes it, nothing drags it, so nothing changes its velocity."

STATE_2 (48 EN words - within 40-50 budget)
"Same launch, same starting speed - but now a real backward force, friction, pushes from the
surface. Watch the arrow fk glow from the very first frame. The block visibly slows and stops in
about four seconds, not because motion wears off, but because this named force stops it."

STATE_3 (44 EN words - within 35-45 budget)
"This block sits still, yet two real forces act on it: weight mg pulling down, and normal force N
pushing up exactly as hard. They balance exactly - net force SigmaF stays zero - so the block never
moves. Rest means balanced forces, never absent ones."

STATE_4 - 0 words / open (matches skeleton: teacher recipe narrated zero words).

Rule 35 check: all three scripts use the universal space-probe anchor (STATE_1) or apparatus-only
language (STATE_2/3) - no country-specific places, brands, currency, or names anywhere.
Rule 30 check: every bare symbol is expanded on first use in narration (v -> "the number v",
mg -> "weight mg", N -> "normal force N", SigmaF -> "net force SigmaF", fk -> "the arrow fk").

---

## 9. Delta cues + formula overlays (Rule 32c/34a/34b - matches skeleton exactly)

| state | on-canvas delta cue (<=5 words) | formula overlay (ONE Unicode surface) |
|---|---|---|
| S1 | "No force - never slows" | SigmaF = 0 => v = constant |
| S2 | "Friction on - block stops" | SigmaF != 0 => v changes |
| S3 | "At rest - forces balance" | N = mg => SigmaF = 0 |
| S4 | "All yours" | SigmaF = 0 <=> v constant |

(json_author renders these with real Unicode glyphs per Rule 34c: Sigma-F as U+03A3 F, => as U+21D2,
!= as U+2260, <=> as U+21D4 - written here in ASCII-safe form for this markdown handoff only.)

---

## 10. Self-review checklist

- [x] Every symbol in the state narratives (v, mg, N, SigmaF, fk, m, F) appears in variables.
- [x] Every formula uses radians() for the angle argument (theta constant at 0, future-proofed).
- [x] Every state's live control(s) match the architect's control table exactly (S1 none, S2 none,
      S3 m, S4 all five).
- [x] variable_overrides documented for all four states, each justified against the Bug #1 leak class.
- [x] Board mark scheme: DEFERRED (Rule 20 [D]), nothing authored (section 4).
- [x] Drill-down phrasings: 5 per cluster x 6 clusters, real student voice, no teacher-prose.
- [x] constraints block: 6 short factual assertions.
- [x] Numerical sanity checks run for all 4 states with explicit clamp-margin arithmetic (section 7).
- [x] Within-state motion timeline written for every state; no two states share a motion; no static
      state (S3's "nothing moves" is the deliberate null-result-hold beat, itself a declared archetype).
- [x] Rule 32 sequencing verified: S2 cause-arrow visible from frame 1 (continuous-force pattern,
      contrast-pair mechanism, not a discrete-event violation); S3 phase handoff at 4000 ms inside a
      12000 ms narration window (glow-only, one focal at a time).
- [x] Word budget: S1 = 47, S2 = 48 (both 40-50), S3 = 44 (35-45), S4 = 0/open - all compliant.
- [x] Engine bug queue consulted; all relevant prevention rules satisfied, no exception needed.
- [x] DC Pandey check: no import - all formulas derived from F = ma plus the engine's own stated
      integrator; no teaching method/example/figure imported.

---
Handoff: json_author - build src/data/concepts/newton_first_law.json per this physics block plus
the architect skeleton, using the newtons_laws_body scenario blocks in sections 2/3/9 verbatim.
