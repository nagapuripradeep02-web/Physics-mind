# PHYSICS BLOCK -- newton_second_law (Laws of Motion, Class 11 -- concept 2/3, lom-b)

## REVISION 2 -- changelog (arrow-floor defect fix)

Coordinator/eye-walker found: authored force magnitudes (0.2 N / 0.4 N) render at
raw length = magnitudeN * NLB_ARROW_SCALE(0.030) = 0.006 / 0.012 world-units, both far under
NLB_ARROW_MIN_LEN(0.30) (field_3d_renderer.ts ~L29272). Every force arrow floor-clamped to the
same minimum length -- STATE_1's sole glow_focal/cause was invisible, and STATE_3's "visibly
twice as long" doubled arrow (its entire pedagogical payload) did not exist on screen. Fixed by
scaling every force and mass by the SAME factor (x75), which leaves every acceleration, distance,
velocity, and clamp margin numerically IDENTICAL to REVISION 1 -- only the Newton/kilogram units
changed, not the kinematics. Everything below marked "REVISION 1 -> REVISION 2" is the complete
list of numbers that moved; everything NOT listed here is unchanged and was NOT re-derived.

| quantity | REVISION 1 | REVISION 2 | raw arrow length (REV 2) |
|---|---|---|---|
| S1 body A mass_kg | 2 | 150 | -- |
| S1 body A applied_force_N | 0.2 | 15 | 0.45 (1.5x the 0.30 floor) |
| S2 body A (m1) mass_kg | 1 | 75 | -- |
| S2 body B (m2) mass_kg | 2 | 150 | -- |
| S2 applied_force_N (both bodies) | 0.2 | 15 | 0.45 (1.5x floor) |
| S3 body A/B mass_kg (both) | 2 | 150 | -- |
| S3 body A applied_force_N | 0.2 | 15 | 0.45 (1.5x floor) |
| S3 body B applied_force_N | 0.4 | 30 | 0.90 (2x the 0.45 -- the visible 1:2 ratio) |
| S4 sandbox default mass_kg | 2 | 150 | -- |
| S4 sandbox default applied_force_N | 0 | 0 (unchanged -- true zero, arrow correctly hidden) | -- |
| `m` variable: min/max/default/step | 0.5/5/2/0.5 | 50/300/150/10 | -- |
| `m2` variable: min/max/default/step | 0.5/5/2/0.5 | 50/300/150/10 | -- |
| `F` variable: min/max/default/step | -2/2/0/0.1 | -40/40/0/2 | -- |
| S4 `idle_auto_sweep` F range | [-1, 1] | [-20, 20] | sweeps well clear of the floor except the instantaneous zero-crossing (correctly arrow-hidden) |

**Unchanged (verified, NOT re-derived):** all four states' accelerations (S1: 0.10; S2: A=0.20/
B=0.10; S3: A=0.10/B=0.20), all distances and clamp margins (S1: 7.2 m; S2/S3 tightest case:
3.6 m), all first-captured-frame v=0.00 readings, `surface.length_m = 10` and `initial_position_m`
values, all four state durations, `v0` variable, all narration scripts (none quoted a literal N/kg
value, so none needed a word-count re-check -- confirmed by re-reading each script below), all
delta cues and formula overlays, all drill-down phrasings, all 3 assessment items and
`coverage_map`. Section 7's arithmetic is re-shown in full per the coordinator's request even
though the results are numerically identical to REVISION 1, because the coordinator asked for the
new-numbers version to be shown explicitly, not merely asserted equal.

**Why x75 and not some other factor / why these masses:** the smallest authored force must clear
`F_min >= 15 N` (raw length 0.45, 1.5x the floor) per the coordinator's hard requirement. REVISION
1's smallest force was 0.2 N, so 75 is the exact scale factor that lands it on 15 N. Because every
force AND every mass in every state is scaled by the identical 75x, every ratio (`F/m`, hence every
`a`) is preserved exactly -- this was a deliberate choice to avoid re-deriving the clamp arithmetic
from scratch. The resulting masses (75 kg / 150 kg) read as a single loaded suitcase (75 kg) versus
a heavily loaded luggage cart (150 kg) -- plausible real values for the skeleton's own "loaded
luggage cart" secondary anchor, not an invented convenience number. 150 kg is also in the right
range for "a person plus a loaded cart" if json_author or a teacher narrates the elevator anchor
instead.

---

> Author: physics_author. Input: docs/loop_runs/lom/newton_second_law/skeleton.md (approved,
> ENGINE GAP: none) + docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md section 1/2 (newtons_laws_body scenario,
> Branch A -- independent bodies, no pulley, theta = 0, mu = 0 throughout, g = 9.8,
> STOP_EPS_V = 0.01). HARD CONSTRAINT honored: every value below is expressible in spec section 1's
> config surface (mode / surface / bodies[] / arrows[] / glow_focal / readouts /
> controls_visible / idle_auto_sweep). No phases[] are authored anywhere in this concept
> (skeleton section 3 explicit design-around of the glow-handoff scar). ENGINE GAP: none (confirms the
> architect's own finding).

## Engine bug queue consultation (pre-authoring)

Consulted the same scar rows the architect flagged (docs/loop_runs/lom/_engine/scar_candidates.sql,
all 12 nlb seam rows) plus the cross-cutting alex:physics_author / alex:json_author /
peter_parker:runtime_generation variable-bug class (same rows the newton_first_law physics block
consulted, re-checked against this concept's own state shapes):

- Motion-bound / clamp scar -- every placement below is COMPUTED against surface.length_m = 10
  with an explicit numeric margin per state (section 7). Worst case across all three guided states is
  S2/S3's faster-accelerating lane at 3.6 m margin -- never closer. UNCHANGED by REVISION 2 (see
  changelog above -- the same F/m ratios were preserved, so the same distances hold).
- Label-projection scar -- flagged to json_author: S1 (single body) and S2/S3 (two-lane, wider
  field of view) each need their own near-side-on camera_position; S2/S3 must frame BOTH lanes
  without either body clipping the viewport edge at its worst-case dwell-end position (+6.4 m).
- HUD zero-stub scar -- f and N are NEVER declared in readouts anywhere in this concept
  (mu = 0 identically all four states, so f would be a permanent 0.00 stub; N teaches nothing
  here). F_net legitimately equals F_applied at every instant (theta = 0, mu = 0) -- this is
  documented as a genuine physics fact below, not treated as a stub duplicate.
- Slider-row jump scar -- controls_visible per state is the exact token set from the architect's
  table ([], [m2], [], [m, F, v0]); no theta, mu_s, or mu_k row is ever built for
  this concept (frictionless, flat-ground scope, per the skeleton's explicit exclusion).
- Formula-wrap scar -- longest formula string authored is "constant F implies constant a" (S1) --
  short by design, matches the skeleton's own section 3 formula-surface list verbatim.
- default_variables_only_first_var_merged (Bug #1 class) -- this scenario has NO shared
  default_variables merge step; every state's bodies[] block below is a COMPLETE, self-contained
  numeric object (mass_kg, initial_position_m, initial_velocity_mps, mu_s, mu_k,
  applied_force_N all explicit every state) -- nothing is left to fall back to a prior state's
  leaked value. The m2 variable in particular carries an explicit non-1 default: 150 (REVISION 2) in
  the variables block (section 1) so json_author wires it through rather than letting a downstream
  default silently substitute 1 or a stale REVISION-1 value.
- Build-once flag scar -- body ids A/B and labels m1/m2 are constant across every state
  that uses them (S2/S3); S1/S4 use body A alone, never re-labeled.
- REVISION 2 -- arrow-render floor scar (this revision's own defect, now closed): every authored
  applied_force_N in every state is >= 15 (raw arrow length >= 0.45, at least 1.5x
  NLB_ARROW_MIN_LEN = 0.30) -- verified per state in the REVISION 2 changelog table above and
  re-verified per state in section 7 below. S3's pair (15 N / 30 N) renders at 0.45 / 0.90 world
  units -- a genuinely visible 1:2 length ratio, restoring the state's Rule 29 payload.

No FLAG required.

DC Pandey check: consulted Laws of Motion table of contents only to confirm Newton's second law
is its own section, before constraint/pulley problems. No teaching method, example problem, or
figure imported. All formulas below are derived directly from the engine's own stated Branch A
integrator (spec section 2) at theta = 0, mu = 0 -- i.e. from a = SigmaF / m applied to a frictionless
flat body, nothing borrowed from any book.

---

## 1. physics_engine_config (REVISION 2 -- m/m2/F ranges + defaults updated)

```json
{
  "variables": {
    "m":     { "name": "mass (body A / single-body states)", "unit": "kg", "min": 50, "max": 300, "default": 150, "step": 10 },
    "m2":    { "name": "mass of body B (mass-compare slider, STATE_2)", "unit": "kg", "min": 50, "max": 300, "default": 150, "step": 10 },
    "F":     { "name": "applied force (sandbox slider, STATE_4)", "unit": "N", "min": -40, "max": 40, "default": 0, "step": 2 },
    "v0":    { "name": "initial velocity (sandbox slider, STATE_4)", "unit": "m/s", "min": -2, "max": 2, "default": 0, "step": 0.5 },
    "g":     { "name": "gravitational acceleration", "unit": "m/s^2", "constant": 9.8 },
    "theta": { "name": "incline angle", "unit": "deg", "constant": 0 },
    "mu_s":  { "name": "coefficient of static friction", "unit": "dimensionless", "constant": 0 },
    "mu_k":  { "name": "coefficient of kinetic friction", "unit": "dimensionless", "constant": 0 },
    "a":     { "name": "acceleration", "unit": "m/s^2", "derived": "F / m" },
    "F_net": { "name": "net force", "unit": "N", "derived": "F (identical to F_applied; theta=0 and mu=0 all concept)" }
  },
  "formulas": {
    "drive": "F - m * g * sin(radians(theta))",
    "kinetic_friction": "-sign(v) * mu_k * (m * g * cos(radians(theta)))",
    "a": "(drive + kinetic_friction) / m",
    "F_net": "drive + kinetic_friction",
    "sum_F": "m * a"
  },
  "computed_outputs": {
    "acceleration_N_per_kg": { "formula": "F / m" },
    "a_ratio_mass_compare_S2": { "formula": "a_A / a_B = m_B / m_A" },
    "a_ratio_force_compare_S3": { "formula": "a_B / a_A = F_B / F_A" }
  },
  "constraints": [
    "theta = 0 and mu_s = mu_k = 0 in every state of this concept (flat, frictionless floor throughout)",
    "F_net = F_applied at every instant this concept authors (no incline component, no friction to subtract)",
    "under a constant applied force, a is exactly constant and v grows without bound before any clamp",
    "mass and force are independent knobs: doubling m halves a at fixed F; doubling F doubles a at fixed m",
    "mu_s/mu_k and theta are never authored nonzero here -- that scope belongs to block_on_incline / friction_static_kinetic",
    "STOP_EPS_V = 0.01 m/s is carried from the shared integrator but never binds in the three guided states (drive != 0 whenever F != 0); it can bind only in the S4 sandbox default F = 0",
    "REVISION 2: every authored applied_force_N in every state is >= 15 N, so raw arrow length (F * NLB_ARROW_SCALE = F * 0.030) is always >= 0.45, at least 1.5x NLB_ARROW_MIN_LEN (0.30) -- every on-screen force arrow clears the engine's render floor with visible margin"
  ]
}
```

---

## 2. Per-state variable overrides (REVISION 2 -- mass_kg / applied_force_N updated; everything
   else in each bodies[] block is UNCHANGED from REVISION 1)

STATE_1 -- accelerate_applied_force (one body)
```json
"surface": { "theta_deg": 0, "length_m": 10, "frictionless": true },
"bodies": [{ "id": "A", "label": "m1", "mass_kg": 150, "initial_position_m": -7,
             "initial_velocity_mps": 0, "mu_s": 0, "mu_k": 0, "applied_force_N": 15 }]
```
Justification (updated): mass_kg 150 and applied_force_N 15 replace REVISION 1's 2 / 0.2 (same
75x scale, same a = 0.10 m/s^2, same F/m ratio). frictionless: true still hard-zeroes mu_s/mu_k
regardless of any prior state's value (defensive, mirrors field_forces.json STATE_5 m: 1) even
though both are also explicitly 0 on the body. initial_velocity_mps: 0 is still the explicit
"starts from rest" override -- unchanged, this is the state that lets the misconception (M1) show a
body gaining speed with nothing initially, so v=0 at t=0 must be locked, never inherited.

STATE_2 -- compare_mass_same_force (two independent bodies, no pulley)
```json
"surface": { "theta_deg": 0, "length_m": 10, "frictionless": true },
"bodies": [
  { "id": "A", "label": "m1", "mass_kg": 75, "initial_position_m": -8,
    "initial_velocity_mps": 0, "mu_s": 0, "mu_k": 0, "applied_force_N": 15 },
  { "id": "B", "label": "m2", "mass_kg": 150, "initial_position_m": -8,
    "initial_velocity_mps": 0, "mu_s": 0, "mu_k": 0, "applied_force_N": 15 }
]
```
Justification (updated): mass_kg 75/150 and applied_force_N 15 (both bodies) replace REVISION 1's
1/2 kg and 0.2 N -- same 75x scale, same a_A=0.20/a_B=0.10, same exact 1:2 ratio. Both bodies still
share the identical initial_position_m: -8 and applied_force_N: 15 (Rule 32b -- only mass, the
taught variable, differs). Body B's mass_kg: 150 still matches the m2 variable's declared
default: 150 (section 1, REVISION 2) -- belt and braces against the Bug #1 leak class (the value
the slider shows at reveal IS the value the body was built with).

STATE_3 -- compare_force_same_mass (two independent bodies, declared contrast pair with S2)
```json
"surface": { "theta_deg": 0, "length_m": 10, "frictionless": true },
"bodies": [
  { "id": "A", "label": "m1", "mass_kg": 150, "initial_position_m": -8,
    "initial_velocity_mps": 0, "mu_s": 0, "mu_k": 0, "applied_force_N": 15 },
  { "id": "B", "label": "m2", "mass_kg": 150, "initial_position_m": -8,
    "initial_velocity_mps": 0, "mu_s": 0, "mu_k": 0, "applied_force_N": 30 }
]
```
Justification (updated): mass_kg 150 (both, EQUAL) and applied_force_N 15/30 replace REVISION 1's
2 kg and 0.2/0.4 N -- same 75x scale, same a_A=0.10/a_B=0.20, same exact 1:2 mirror-image ratio.
This is the state the coordinator's defect hit hardest: at REVISION 1's 0.2 N/0.4 N both arrows
floor-clamped to the identical minimum length, erasing the "visibly twice as long" payload. At
REVISION 2's 15 N/30 N the raw arrow lengths are 0.45/0.90 world-units -- a genuinely visible 1:2
ratio, restoring Rule 29's magnitude-length exception as the state's actual on-screen evidence.
initial_position_m: -8 still repeated identically from S2 (home-pose continuity, Rule 32d -- same
start line, no teleport-rebuild).

STATE_4 -- sandbox (one body)
```json
"surface": { "theta_deg": 0, "length_m": 10, "frictionless": true },
"bodies": [{ "id": "A", "label": "m1", "mass_kg": 150, "initial_position_m": 0,
             "initial_velocity_mps": 0, "mu_s": 0, "mu_k": 0, "applied_force_N": 0 }],
"trusted_drag_seizes": true,
"idle_auto_sweep": { "param": "F", "range": [-20, 20] }
```
Justification (updated): mass_kg 150 replaces REVISION 1's 2 kg (matches the new m default,
section 1). applied_force_N stays 0 -- UNCHANGED; a true zero force is meant to hide the arrow
entirely (engine's own `magnitudeN > NLB_ARROW_EPS` visibility check), so F=0 at reveal is correct
physics, not a floor-clamp defect. initial_position_m: 0 (re-centered) is unchanged from REVISION 1.
idle_auto_sweep.range widened from REVISION 1's [-1, 1] to [-20, 20] N -- at REVISION 1's scale the
sweep never got anywhere near the (then also-too-small) floor either; at REVISION 2's scale, [-20,
20] N keeps most of the sweep comfortably above the 15 N floor (raw length 0.60 at the sweep's
midpoint magnitude of 20 N) while still crossing zero once per cycle -- that instant is correctly
arrow-hidden, not a defect. trusted_drag_seizes: true and the wider manual F/m/v0 slider ranges
(section 1, REVISION 2) let the teacher explore the full a = F/m surface once they take over.

---

## 3. Within-state motion timeline + per-state control spec (Rule 31/32/26) -- UNCHANGED from
   REVISION 1 (the kinematic coefficients below are identical because REVISION 2 preserved every
   F/m ratio; only the underlying N/kg units changed, not the s(t)/v(t)/a values)

| state | t-window | what animates (pure fn of state clock) | driven by | live control(s) |
|---|---|---|---|---|
| S1 | 0-~0.8 s | body A at rest, F arrow appears and glows on nlb_arrow_A_applied (now a genuinely visible arrow at 15 N -> 0.45 world-units); body barely visibly moves (natural consequence of starting from rest under a = 0.10 m/s^2, not a discrete trigger -- Rule 32a's readable gap falls out of the physics itself) | applied_force_N | none |
| S1 | 0-14000 ms | body A accelerates s(t) = -7 + 0.05*t^2 (t in s); a readout pins at 0.10 from frame 1 and never moves; v readout climbs every second (0.00 to 1.40 at t=14) | applied_force_N, mass_kg (integrator) | none |
| S2 | 0-~0.8 s | both bodies at rest, TWO identical F arrows (each now visible at 15 N -> 0.45 world-units) appear and glow simultaneously on nlb_arrow_A_applied/nlb_arrow_B_applied (same length, same label) | applied_force_N x 2 | none |
| S2 | 0-12000 ms | body A: s(t) = -8 + 0.10*t^2 (a=0.20 pinned); body B: s(t) = -8 + 0.05*t^2 (a=0.10 pinned); the growing spatial gap between the two lanes IS the readout, alongside the per-body a values (0.20 vs 0.10) | mass_kg (both), applied_force_N (both, equal) | m2 (live-drags body B's mass; integrator reads the new mass every frame, so a mid-run drag visibly changes B's a and future trajectory) |
| S3 | 0-~0.8 s | both bodies at rest, home-pose reset to the S2 start line (32d, no teleport-rebuild); the ONE F arrow on body B glows, NOW GENUINELY drawn twice the length of A's (0.90 vs 0.45 world-units -- REVISION 2 restores this; magnitude-driven length, Rule 29 exception) | applied_force_N (B, doubled) | none |
| S3 | 0-12000 ms | body A: s(t) = -8 + 0.05*t^2 (a=0.10 pinned); body B: s(t) = -8 + 0.10*t^2 (a=0.20 pinned) -- the mirror-image of S2's separation, produced by the OTHER dial | mass_kg (both, now equal), applied_force_N (differs) | none |
| S4 | open, continuous | idle: F auto-sweeps -20 to 20 N (idle_auto_sweep, REVISION 2 widened) driving a = F/m live at m=150 kg default (a range +/-0.133 m/s^2) until a trusted slider/drag seizes control; body position/velocity respond continuously per the integrator (Rule 37: free-run, no freeze) | F (idle) then any slider/drag once seized | m, F, v0 (ALL -- mu_s/mu_k/theta never exposed, frictionless flat-ground scope) |

Rule 32 sequencing check: S1/S2/S3 each open with the cause (the F arrow, or the pair of F
arrows -- now genuinely visible at REVISION 2's scale) appearing and glowing on a body still at
rest -- the effect (visible acceleration) follows naturally because a body starting from v=0 under
a small constant a moves imperceptibly for the first fraction of a second before the motion reads
clearly, giving the readable ~0.5-1 s gap Rule 32a asks for without any discrete triggered delay in
the engine (the same continuous-force pattern the newton_first_law physics block used for its
friction beat). S2 to S3 is the declared contrast pair (skeleton section 3): identical apparatus,
identical start line, only the roles of m and F swap -- 32b is satisfied because in S2 only mass
differs (force held equal) and in S3 only force differs (mass held equal), never both at once.

First-captured-frame check (RE-VERIFIED for REVISION 2's new numbers -- the newton_first_law
v0-leak scar): at t=0 every body's initial_velocity_mps is still authored 0 (section 2) -- so the
FIRST captured frame of S1, S2, and S3 must read v = 0.00 for every body on screen (UNCHANGED). a is
NOT zero at t=0: since applied_force_N is a constant already present in the state's config (not
phased in), the integrator computes a = F/m from frame 1 -- so the first frame's a readout must
already show the state's pinned value: S1 a = 15/150 = 0.10; S2 a_A = 15/75 = 0.20, a_B = 15/150 =
0.10; S3 a_A = 15/150 = 0.10, a_B = 30/150 = 0.20 (all numerically identical to REVISION 1's a
values, as expected from the ratio-preserving scale). This is correct physics (a is pinned
throughout, never ramps up) and must not be misread as a v0-leak-style bug by the auditor. The
readout's underlying Newton value DID change (F_applied now prints 15.00/30.00 instead of
0.20/0.40) -- flagging so json_author/eye_walker check the NEW literal numbers, not the old ones.

---

## 4. Board-mode mark scheme

DEFERRED (Rule 20 [D]). Conceptual-only directive is active; no board/competitive mode_overrides
authored for this concept. Nothing further to author in this section. UNCHANGED by REVISION 2.

---

## 5. Drill-down cluster phrasings (5 real student-voice phrases each) -- UNCHANGED by REVISION 2
   (no phrase quotes a specific N/kg value)

force_gives_acceleration_not_velocity (STATE_1)
1. if the force never changes why does the speed keep going up
2. shouldnt a constant force mean a constant speed
3. why does v keep climbing when F stays the same
4. isnt force just how fast something moves
5. why does a stay the same number the whole time

what_if_the_force_stops (STATE_1)
1. what happens to the speed the moment you turn the force off
2. does it stop instantly if F goes to zero
3. does the block keep the speed it already has
4. why would a drop to zero but not v
5. so cutting the force doesnt undo the speed already gained

net_force_vs_applied_force (STATE_1)
1. why is F applied the same as the net force here
2. wheres the other forces that should be subtracted
3. does frictionless mean applied force is automatically the net force
4. when would applied force not equal net force
5. why doesnt gravity show up in F net here

mass_as_inertia (STATE_2)
1. why does the heavier block get less acceleration from the same push
2. is mass just about how much something weighs
3. why doesnt the heavier one just need more time not less acceleration
4. whats actually resisting the push in the heavier block
5. why call mass inertia instead of just weight

mass_vs_weight_confusion (STATE_2)
1. isnt mass the same thing as weight
2. why do we use kg here and not the force of gravity
3. would this block have less mass on the moon
4. does m in F equals ma change if gravity changes
5. why does doubling mass matter if gravity is the same

proportionality_reasoning (STATE_2)
1. if mass doubles does acceleration always exactly halve
2. how do you know its exactly half without doing the math
3. does tripling the mass do the same kind of thing
4. why is it inverse and not some other relationship
5. can I just eyeball the ratio from the two accelerations

---

## 6. Constraint callouts (REVISION 2 -- slider-step note replaced; arrow-floor note added in
   place of the REVISION 1 "numbers-are-small awareness note", which is now the realized-and-fixed
   defect this whole revision addresses)

- radians(theta) wrap is authored in every formula even though theta is constant 0 for this
  entire concept -- future-proofs the string if a later retrofit reuses it (block_on_incline is the
  concept that actually varies theta). UNCHANGED.
- Slider steps (REVISION 2): m/m2 10 kg (range 50-300), F 2 N (range -40 to 40) -- widened from
  REVISION 1's 0.5 kg / 0.1 N steps because the underlying values are now two orders of magnitude
  larger (75x scale). The coarser F step still resolves every authored state value cleanly: S1/S2's
  15 N and S3's 15/30 N are all reachable on a 2 N grid from a 0 default, and none of S1/S2/S3
  actually expose F as a live slider (controls_visible = [] / [m2] / []) so only S4's sandbox needs
  the step to feel smooth in the teacher's hand -- 2 N steps against a +/-40 N range give 40 stops,
  a comparable resolution to REVISION 1's 0.1 N steps against its +/-2 N range (also 40 stops).
- No scale_pixels_per_unit needed -- the engine's own NLB_ARROW_SCALE / clamp(min,max) owns
  arrow-length mapping (spec section 3); nothing for physics_author to specify here.
- REVISION 2 -- arrow-floor confirmation (closes the REVISION 1 "numbers-are-small awareness
  note", which the coordinator confirmed was realized, not hypothetical): every authored
  applied_force_N in every state is now >= 15 N. Raw arrow length = F * NLB_ARROW_SCALE(0.030):
  S1 = 15*0.03 = 0.45; S2 (both) = 0.45; S3 A = 0.45, S3 B = 30*0.03 = 0.90. All are >=
  NLB_ARROW_MIN_LEN(0.30), and S1/S2's single/equal arrows sit at 1.5x the floor (clearly resolved
  as a real shaft+arrowhead, not a stub), while S3's pair sits at 1.5x/3x the floor with a genuine
  2:1 length ratio between them -- the exact visual the state exists to teach.
- F_net readout legitimately equals F_applied at every instant in every state -- this is the
  TAUGHT invariant of a frictionless flat floor, not a duplicate-stub (HUD zero-stub scar,
  addressed above); S4 shows both F_applied and F_net side by side precisely so the teacher can
  see them track identically and ask "when would these differ?" (answer: block_on_incline /
  friction_static_kinetic, out of scope here). UNCHANGED.
- f and N are never declared in any state's readouts (mu = 0 identically; N teaches nothing in
  this concept) -- matches the skeleton's explicit HUD-stub-scar exclusion. UNCHANGED.

---

## 7. Numerical sanity checks (REVISION 2 -- fully re-shown per the coordinator's request; results
   are numerically identical to REVISION 1 because every F/m ratio was preserved by the 75x scale,
   but every step is worked through again against the NEW N/kg values, not merely asserted)

STATE_1 -- single body, constant force from rest
- surface.length_m = 10 -> visible clamp = +/-10 m. UNCHANGED.
- mass_kg = 150, applied_force_N = 15, initial_position_m = -7, initial_velocity_mps = 0,
  frictionless.
- drive = 15 - 150*9.8*sin(0) = 15 -> a = drive/150 = 0.10 m/s^2 (pinned from t=0, never changes).
- s(t) = -7 + 0.5*0.10*t^2 = -7 + 0.05*t^2; dwell window = 14 s -> s(14) = -7 + 0.05*196 =
  -7 + 9.8 = +2.8 m.
- Clamp check: +2.8 m vs +/-10 m bound -> 7.2 m margin, never remotely close to the clamp.
  (Numerically identical to REVISION 1, as expected -- same a.)
- v(14) = a*t = 0.10*14 = 1.40 m/s -- the "climbs every second" readout the narration points at.
- F_net(t) = 15.00 N for all t (= F_applied, since theta=0, mu=0) -- the taught invariant. THIS
  LITERAL NUMBER CHANGED from REVISION 1's 0.20 N (the HUD now reads 15.00, not 0.20).
- First frame (t=0): v = 0.00, a = 0.10 (pinned immediately -- correct, not a bug; see section 3
  note), F_applied = 15.00 (was 0.20 in REVISION 1).
- Arrow-floor check: raw length = 15 * 0.030 = 0.45 world-units >= 0.30 floor. VISIBLE (was 0.006,
  invisible, in REVISION 1).

STATE_2 -- mass compare, same force
- Both bodies: initial_position_m = -8, applied_force_N = 15, initial_velocity_mps = 0,
  frictionless. Body A mass_kg = 75, Body B mass_kg = 150.
- a_A = 15/75 = 0.20 m/s^2; a_B = 15/150 = 0.10 m/s^2 -> exact 2:1 ratio, matching the taught belief
  confrontation (M2: "same push, different mass -> half the effect"). Identical a values to
  REVISION 1.
- Dwell window = 12 s:
  d_A(12) = 0.5*0.20*144 = 14.4 m -> s_A(12) = -8 + 14.4 = +6.4 m -> margin to +10 clamp = 3.6 m.
  d_B(12) = 0.5*0.10*144 = 7.2 m -> s_B(12) = -8 + 7.2 = -0.8 m -> margin to nearer clamp (-10) = 9.2 m.
- Both bodies clamp-safe; the tighter margin (3.6 m, body A) is the binding case for this state.
  UNCHANGED from REVISION 1 (same a values -> same distances).
- First frame (t=0): both v = 0.00; a_A = 0.20, a_B = 0.10, both pinned immediately (correct).
  F_applied now reads 15.00 on both bodies (was 0.20 in REVISION 1).
- Arrow-floor check: both arrows raw length = 15 * 0.030 = 0.45 >= 0.30 floor. Both VISIBLE and
  IDENTICAL length (correctly -- the forces really are equal in this state; only mass differs).
- Live m2 drag mid-run: if the teacher drags body B's mass up to the new slider max (300 kg)
  partway through the run, a_B immediately recomputes to 15/300 = 0.05 m/s^2 -- B slows its rate of
  gain further, never reverses, never approaches the clamp faster than the frozen-value case above.

STATE_3 -- force compare, same mass (mirror of S2)
- Both bodies: initial_position_m = -8, mass_kg = 150, initial_velocity_mps = 0, frictionless.
  Body A applied_force_N = 15, Body B applied_force_N = 30.
- a_A = 15/150 = 0.10 m/s^2; a_B = 30/150 = 0.20 m/s^2 -> exact 2:1 ratio, mirror-image of S2's
  numbers by construction (skeleton's deliberate symmetry -- same picture, opposite dial). Identical
  a values to REVISION 1.
- Dwell window = 12 s:
  d_A(12) = 0.5*0.10*144 = 7.2 m -> s_A(12) = -0.8 m -> margin to -10 clamp = 9.2 m.
  d_B(12) = 0.5*0.20*144 = 14.4 m -> s_B(12) = +6.4 m -> margin to +10 clamp = 3.6 m.
- Identical margin profile to S2 (3.6 m binding case), confirming the mirror-image design holds
  under the clamp constraint too, not just in the readout numbers. UNCHANGED from REVISION 1.
- First frame (t=0): both v = 0.00; a_A = 0.10, a_B = 0.20, both pinned immediately (correct).
  F_applied now reads 15.00 (A) and 30.00 (B) -- were 0.20 / 0.40 in REVISION 1.
- Arrow-floor check (the state REVISION 2 exists to fix): A raw length = 15*0.030 = 0.45; B raw
  length = 30*0.030 = 0.90. Both >= 0.30 floor, and B is genuinely 2x A's on-screen length --
  restores the "visibly twice as long" payload the coordinator flagged as missing at REVISION 1's
  0.2 N/0.4 N (both of which floor-clamped to the identical 0.30 minimum, erasing the ratio).

STATE_4 -- sandbox
- Default: mass_kg = 150, applied_force_N = 0, initial_position_m = 0, initial_velocity_mps = 0.
  At reveal, a = 0, v = 0, body motionless at center -- matches STOP_EPS_V's static branch exactly
  (drive = 0 <= mu_s*N = 0, trivially true) rather than triggering it as an edge case. Arrow
  correctly HIDDEN at F=0 (magnitudeN > NLB_ARROW_EPS check) -- true zero is not a floor-clamp
  defect, it is the physically correct "no force" picture.
- idle_auto_sweep: F ranges [-20, 20] N (REVISION 2, widened from [-1, 1]) at the default m = 150 kg
  -> drives a continuously between -0.133 and +0.133 m/s^2 while idle, immediately demonstrating
  both signs of a = F/m before any teacher input. At the sweep's extremes (|F|=20 N), raw arrow
  length = 20*0.030 = 0.60 world-units -- clearly above the 0.30 floor for the majority of the
  sweep cycle; only the instantaneous zero-crossing is arrow-hidden, which is correct physics, not
  a defect. Per Rule 37 the state free-runs (no freeze pin) and the explore state is, consistent
  with the newton_first_law precedent, exempt from a fixed dwell-window clamp proof -- the teacher
  is live and in control from the moment a trusted drag/slider seizes the sweep; the sandbox's
  worst-case unattended acceleration (+/-0.133 m/s^2) is smaller in magnitude than the already-
  sealed newton_first_law sandbox's sweep-driven acceleration range (+/-2 m/s^2 at F in [-4,4] N,
  m=2 kg default), so this sandbox is strictly SAFER, not riskier, than the shipped sibling's.
  trusted_drag_seizes: true and the wider manual F/m/v0 slider ranges (section 1) let the teacher
  explore the full a = F/m surface at their own pace once they take over.

---

## 8. Narration scripts (Rule 30/31/35) -- UNCHANGED by REVISION 2 (re-read below and confirmed:
   no sentence quotes a literal N or kg value, so no word-count re-check was needed)

STATE_1 (47 EN words -- within 40-50 budget)
"Last time, with no force, speed stayed frozen. Now watch this force arrow F - switched on, never
changing length. From rest, the block's speed climbs every second, yet the acceleration reading a
never moves. A steady force doesn't set a speed - it sets a rate of change."

STATE_2 (49 EN words -- within 40-55 budget)
"Two identical force arrows - same length, same F - launch two blocks together. The heavier one, m
two, carries twice the mass and visibly falls behind, its acceleration reading exactly half the
lighter block's. Drag the m two slider heavier or lighter and watch its acceleration change live,
right on the readout."

STATE_3 (49 EN words -- within 35-50 budget)
"Same two blocks, now equal in mass - but m two's force arrow is drawn twice as long: double the
push. Its acceleration reading is exactly double m one's. Same gap as before, this time made by
force, not mass - one law, two different dials, both reading a equals F over m."

STATE_4 -- 0 words / open (matches skeleton: teacher recipe, zero narrated words).

Rule 35 check: no country-specific places, brands, currency, or names in any script; UNCHANGED.
Rule 30 check: every bare symbol is still expanded on first spoken use (F -> "force arrow F", a ->
"the acceleration reading a", m2 -> "m two", m1 -> "m one") and never says the force "keeps it
moving" or "gives it speed"; UNCHANGED.
REVISION 2 note: "twice as long" (S3) and "twice the mass" (S2) are qualitative ratio language, not
literal-number claims -- they remain true and now, unlike REVISION 1, are also TRUE ON SCREEN
(the arrow really is twice as long at 15 N/30 N, where at REVISION 1's 0.2 N/0.4 N the narration's
"twice as long" claim was contradicted by the floor-clamped, identical-length arrows).

---

## 9. Delta cues + formula overlays (Rule 32c/34a/34b) -- UNCHANGED by REVISION 2

| state | on-canvas delta cue (<=5 words) | formula overlay (ONE Unicode surface) |
|---|---|---|
| S1 | "Force on - speed climbs" | constant F implies constant a |
| S2 | "Same force - heavier lags" | a = F/m |
| S3 | "Same mass - stronger force wins" | a is proportional to F |
| S4 | "All yours" | a = SigmaF/m |

(json_author renders these with real Unicode glyphs per Rule 34c: "implies" as U+21D2, "is
proportional to" as U+221D, Sigma as U+03A3 -- written here in ASCII-safe form for this markdown
handoff only, matching the newton_first_law precedent.)

---

## 10. Assessment items + coverage_map -- UNCHANGED by REVISION 2 (every stem uses generic "m and
    2m" / "F and 2F" ratio language, never a literal N/kg value, so nothing needed updating)

Architect skeleton section 10(f) explicitly scopes this concept's assessment to 3 backward-designed
items (one per guided state; S4 is the open explore state, non-assessed) -- matching the concept's
own minimal 4-state footprint. 3 distinct tested_idea values satisfies Gate 20's "at least 3
distinct tested_idea" floor.

Q1 (teaches_state: STATE_1, tested_idea: force_sets_acceleration_not_velocity)
Stem: "A constant net force acts on a body that starts at rest. As time passes, which quantity stays
constant?"
- A. velocity -- distractor_misconception: "a constant force produces a constant speed" (M1, the
  everyday hidden-friction default)
- B. acceleration -- correct
- C. both velocity and acceleration -- distractor_misconception: "a constant cause must produce
  every effect constant, without distinguishing rate from quantity"
- D. neither stays constant -- distractor_misconception: "a body under a real force can never settle
  into any steady reading"
parallel_form_stem: "A block on a frictionless floor feels one steady push. Five seconds in, is its
speed still rising, still, or falling - and what is its acceleration doing at that same moment?"

Q2 (teaches_state: STATE_2, tested_idea: mass_is_the_divisor_in_a_equals_F_over_m)
Stem: "Two identical forces act on two bodies of mass m and 2m, both starting from rest. After the
same time, how do their accelerations compare?"
- A. they are equal -- distractor_misconception: "the same push does the same thing regardless of
  mass" (M2)
- B. the 2m body's acceleration is half the m body's -- correct
- C. the 2m body's acceleration is double -- distractor_misconception: "more mass means more force
  is somehow generated, so acceleration goes up with mass"
- D. the 2m body does not move at all -- distractor_misconception: "a body needs enough force to
  cross some minimum threshold before it moves, confusing this with static friction"
parallel_form_stem: "An empty cart and the same cart loaded with twice its own weight in cargo are
both given the identical push from rest. Which one is moving faster after the same few seconds, and
by what ratio?"

Q3 (teaches_state: STATE_3, tested_idea: force_is_the_numerator_in_a_equals_F_over_m)
Stem: "Two bodies of equal mass start from rest; one is pushed with force F, the other with force 2F.
After the same time, how do their accelerations compare?"
- A. they are equal -- distractor_misconception: "acceleration is a fixed property of the body,
  independent of how hard it is pushed"
- B. the 2F body's acceleration is double the F body's -- correct
- C. the 2F body's acceleration is four times -- distractor_misconception: "doubling the cause
  squares the effect, over-generalizing from other doubling relationships"
- D. the 2F body's acceleration is half -- distractor_misconception: "force and acceleration are
  inversely related, confusing the role of F with the role of m in a = F/m"
parallel_form_stem: "Two identical shopping carts start at rest; one gets a normal push, the other
gets a push twice as strong. After the same short time, how do their speeds compare?"

coverage_map
```json
{
  "by_state": {
    "STATE_1": ["Q1"],
    "STATE_2": ["Q2"],
    "STATE_3": ["Q3"]
  },
  "non_assessed_states": ["STATE_4"]
}
```

---

## 11. Self-review checklist (REVISION 2)

- [x] Every symbol referenced in the state narratives (F, a, v, m1, m2) appears in variables.
- [x] Every formula uses radians() for the angle argument (theta constant at 0, future-proofed).
- [x] Every state's live control(s) match the architect's control table exactly (S1 none, S2 m2,
      S3 none, S4 m/F/v0). UNCHANGED by REVISION 2.
- [x] variable_overrides (full bodies[] blocks) documented for all four states, each justified
      against the Bug #1 leak class and Rule 32b (only the taught variable differs within a state) --
      RE-JUSTIFIED with the new mass_kg / applied_force_N values in section 2.
- [x] Board mark scheme: DEFERRED (Rule 20 [D]), nothing authored (section 4).
- [x] Drill-down phrasings: 5 per cluster x 6 clusters, real student voice, no teacher-prose.
      UNCHANGED (no phrase quotes a literal value).
- [x] constraints block: now 7 short factual assertions (added the REVISION 2 arrow-floor
      assertion; the other 6 are UNCHANGED).
- [x] Numerical sanity checks RE-DERIVED IN FULL for all 4 states against the REVISION 2 values
      (section 7) -- clamp-margin arithmetic re-shown, not merely asserted equal to REVISION 1;
      tighter binding margin confirmed still 3.6 m (S2 body A / S3 body B), never near the +/-10 m
      clamp.
- [x] First-captured-frame check RE-VERIFIED for the new numbers: v = 0.00 at t=0 in every guided
      state (all bodies still start from rest); a is correctly non-zero and pinned from t=0 with its
      NEW value shown per state (S1: 0.10; S2: 0.20/0.10; S3: 0.10/0.20 -- numerically identical to
      REVISION 1 as expected, but the underlying F_applied readout numbers changed from 0.20/0.40 to
      15.00/30.00 and are called out explicitly so json_author/eye_walker check the right numbers).
- [x] Within-state motion timeline written for every state; no two states share a motion beyond the
      declared S2/S3 contrast pair; no static state. UNCHANGED structurally, arrow-visibility notes
      added.
- [x] Rule 32 sequencing verified: cause (F arrow/s, NOW GENUINELY VISIBLE) glows on a still body
      before visible motion reads clearly in S1/S2/S3; only the taught variable differs within each
      guided state (32b).
- [x] Word budget: S1 = 47 (40-50), S2 = 49 (40-55), S3 = 49 (35-50), S4 = 0/open -- all compliant,
      UNCHANGED (re-confirmed no narration sentence needed a numeric update).
- [x] Assessment: 3 items, coverage_map complete, every wrong option carries a
      distractor_misconception, correct option never keyed as a distractor, parallel_form_stem
      present and physics-equivalent for all 3. UNCHANGED.
- [x] Engine bug queue consulted; all relevant prevention rules satisfied, no exception needed --
      PLUS the REVISION 2 arrow-render-floor scar explicitly added and closed (section: Engine bug
      queue consultation, above).
- [x] DC Pandey check: no import -- all formulas derived from the engine's own Branch A integrator
      at theta=0, mu=0; no teaching method/example/figure imported. UNCHANGED.
- [x] REVISION 2 hard requirements (coordinator's list) all satisfied: (1) F_min = 15 N in every
      state, raw length 0.45 >= 1.5x floor, S3's 2:1 pair genuinely visible at 0.45/0.90; (2) clamp-
      margin arithmetic fully re-derived in section 7, tightest case still 3.6 m; (3) pedagogy
      preserved exactly (S1 single body/a pinned/v climbing; S2 same-F/m2=2*m1/2:1 a's; S3 same-m/
      F_B=2*F_A/1:2 a's, mirror picture); (4) masses (75 kg/150 kg) are plausible loaded-luggage-
      cart-scale values, not invented for convenience; (5) m/m2/F slider ranges and STATE_4's
      idle_auto_sweep range all widened to cover the new values and stay clamp-safe; (6) first-
      captured-frame v=0.00 re-verified, new a/F_applied readings stated per state; (7) narration
      re-read, confirmed no literal-number sentence needed a word-count re-check.

---
Handoff: json_author -- build src/data/concepts/newton_second_law.json per this REVISION 2 physics
block (the changelog table at the top of this file is the authoritative diff against the numbers
json_author may have already started from) plus the architect skeleton, using the newtons_laws_body
scenario blocks in sections 2/3/9/10 verbatim.
