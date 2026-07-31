# PHYSICS BLOCK — `newton_third_law` (REBUILD, feat/lom-b)

> Extends `skeleton.md` (architect v2). Engine facts re-verified directly against
> `src/lib/renderers/field_3d_renderer.ts` at HEAD (248abea) by grep/read; line refs are audit-trail
> only (the file drifts). All 6 open items resolved definitively below; zero TBDs.
> **ENGINE GAP: none.**

---

## 0. Engine-bug-queue consultation (pre-authoring)

No live DB shell in this session; consultation performed against the three HEAD-verified engine
documents (`rebuild_brief.md` §3, `push_off_report.md` §1-3, `NEWTONS_LAWS_BODY_ENGINE_SPEC.md`) and
independent re-grep of the renderer (below). Every prevention rule surfaced there is satisfied:
- `nlb_push_off_release_window_outlives_the_spring_extension` (MAJOR) - every `release_at_ms` below is
  independently re-derived (Item 4) and matches the spring-extension timing exactly.
- `nlb_spring_authored_gap_wider_than_compressed_length_floats_untouching` - every spring `between`
  gap below is computed from the §3.4 formula, not guessed.
- The dead-F-slider scar - honored: no `'F'` in `controls_visible` on S1/S2/S3.
- The `newton_second_law` slider-clamp scar (rebuild brief Item 5) - resolved explicitly in §7 (Item
  5) below with an explicit `slider_controls` override that agrees with `physics_engine_config`.

---

## 1. `physics_engine_config`

```json
{
  "variables": {
    "m": { "name": "mass of cart A (or the single free cart)", "unit": "kg", "min": 2, "max": 14, "default": 6, "step": 0.5 },
    "m2": { "name": "mass of cart B", "unit": "kg", "min": 2, "max": 14, "default": 6, "step": 0.5 },
    "F": { "name": "push magnitude (equal and opposite on both bodies)", "unit": "N", "min": 15, "max": 45, "default": 30, "step": 1 },
    "g": { "name": "gravitational acceleration", "unit": "m/s^2", "constant": 9.8 },
    "theta": { "name": "incline angle (unused - flat track throughout)", "unit": "deg", "constant": 0 },
    "mu_s_S4_from": { "name": "static friction coefficient, STATE_4 brake, ramp START (FIX CYCLE 2)", "unit": "dimensionless", "constant": 0.75 },
    "mu_s_S4_to": { "name": "static friction coefficient, STATE_4 brake, ramp END -- holds here (FIX CYCLE 2)", "unit": "dimensionless", "constant": 0.27 },
    "mu_s_S4_crit": { "name": "breakaway threshold: mu_s at which maxStatic == drive (FIX CYCLE 2)", "unit": "dimensionless", "derived": "F / (m * g) = 30 / 58.8 = 0.5102" },
    "mu_k": { "name": "kinetic friction coefficient (unused - no sliding friction anywhere)", "unit": "dimensionless", "constant": 0 },
    "a": { "name": "acceleration", "unit": "m/s^2", "derived": "F_applied / m (0 when stuck)" },
    "F_net": { "name": "net force on a body", "unit": "N", "derived": "m * a" },
    "v": { "name": "velocity along the track", "unit": "m/s", "derived": "integral of a; pinned to 0 while stuck" },
    "s": { "name": "position along the track", "unit": "m", "derived": "integral of v, clamped to +/- surface.length_m" }
  },
  "formulas": {
    "F_reaction": "-F_applied",
    "a_free": "F_applied / m",
    "N_S4": "m * 9.8",
    "f_static_S4_held": "-F_applied (while mu_s(t) * N >= |F_applied|)",
    "F_net_S4_held": "0",
    "mu_s_S4_ramp": "mu_s_S4_from + (mu_s_S4_to - mu_s_S4_from) * clamp((t_ms - 0) / (5000 - 0), 0, 1)",
    "t_breakaway_S4": "5000 * (mu_s_S4_from - mu_s_S4_crit) / (mu_s_S4_from - mu_s_S4_to) = 5000 * (0.75-0.5102)/(0.75-0.27) = 2498 ms",
    "a_S4_post_breakaway": "F_applied / m = 30 / 6 = 5.00 m/s^2 (mu_k = 0, both carts, opposite sign)",
    "F_net_S4_post_breakaway": "m * a = 6 * 5.00 = 30.0 N (both carts, opposite sign)",
    "t_release_equal_masses": "sqrt(0.88 * m / F)",
    "v_release_equal_masses": "sqrt(0.88 * F / m)",
    "t_release_two_masses": "sqrt(1.32 * m_small / F)",
    "v_release_light": "sqrt(1.32 * F / m_small)",
    "v_release_heavy": "v_release_light * (m_small / m_heavy)",
    "t_release_vs_wall": "sqrt(1.76 * m / F)",
    "v_release_vs_wall": "sqrt(1.76 * F / m)",
    "position_at_pin": "s_start + 0.5*a*t_release^2 + v_release*2.0"
  },
  "computed_outputs": {
    "S1_a": { "formula": "F/m = 30/6 = 5.00 m/s^2 (both carts)" },
    "S1_v_release": { "formula": "2.10 m/s (both carts, opposite sign)" },
    "S2_a_ratio": { "formula": "a_A/a_B = m_B/m_A = 12/4 = 3" },
    "S2_v_ratio": { "formula": "v_A/v_B = 3.15/1.05 = 3" },
    "S3_a_wall": { "formula": "F/m_wall -> 0 (m_wall effectively infinite)" },
    "S4_F_net_held": { "formula": "F_applied + f_static = 30 + (-30) = 0.0 N (same body only, t < 2498 ms)" },
    "S4_t_breakaway": { "formula": "2498 ms (mu_s(t) crosses 0.5102 -- FIX CYCLE 2)" },
    "S4_F_net_post": { "formula": "F_applied + f_kinetic = 30 + 0 = 30.0 N per cart, opposite sign, t > 2498 ms (mu_k = 0)" }
  },
  "constraints": [
    "F_reaction = -F_applied at every instant, on the OTHER body, never the same body (Newton III)",
    "the equal-and-opposite pair always acts on two DIFFERENT bodies - it can cancel only if wrongly summed onto one body",
    "theta = 0 and mu = 0 in every state except STATE_4, where per-body mu_s ramps 0.75 -> 0.27 over 0-5000 ms (FIX CYCLE 2) then holds",
    "mass never appears in the force magnitude - only in the resulting acceleration (a = F/m)",
    "a fixed body (the wall) still takes and exerts the full-magnitude force; a = 0 because its effective mass is infinite, not because the force is absent",
    "smallest on-screen force is 30 N (S1-S4) / 15 N (S5 sweep floor) - both clear the 11.5 N arrow-floor collapse threshold; largest is 45 N, well under the 58.3 N ceiling"
  ]
}
```

---

## 2. Per-state body/override notes (the `variable_overrides` analogue for this engine)

This engine has no single global `default_variables` object - each state's `field_3d_config.states.*
.newtons_laws_body.bodies[]` is authored explicitly every time (confirmed: `applyNewtonsLawsBodyState`,
renderer ~L31162, rebuilds `eng.bodies` fresh from the CURRENT state's `bodies[]` array on every state
entry - mass, position, velocity, mu_s, mu_k, applied_force are ALL read per-state, never carried
over). The only PER-ID build-time-locked field is `fixed` (and `hanging`), read from the id's first
appearance across all states (`nlbCollectBodyDefs`, renderer ~L30528-30554, decides the MESH shape:
cart cube vs wall slab). So the override discipline here is: never give id "A" `fixed:true` in any
state, and never introduce the wall id "W" anywhere except STATE_3. Mass is free to vary per state for
the same id - this is confirmed engine behavior (see Open Item 2 below), not an assumption.

- **STATE_1** - A: 6 kg, B: 6 kg (both fresh, no reuse concern).
- **STATE_2** - A: 4 kg (down from 6), B: 12 kg (up from 6) - the ONLY authored change from STATE_1
  (Rule 32b). Not a defensive override in the leaked-default sense (this engine has no such default) -
  it IS the state's entire teaching payload.
- **STATE_3** - id "A" reused at 6 kg (matches STATE_1, Rule 32d continuity); NEW id "W" with
  `fixed: true`. `mass_kg` is required by the array shape but never read by the physics for a fixed
  body (it skips the mass-dependent branch entirely) - author `1000000` for narrative honesty
  ("effectively infinite"), not because the engine consumes it.
- **STATE_4** - A: 6 kg, B: 6 kg, BOTH seeded with `mu_s: 0.75` and ramped downward to `0.27` over
  0-5000 ms by a `param_ramp` (FIX CYCLE 2 -- REVISES the FIX CYCLE 1 static-hold design; see the
  appended FIX CYCLE 2 section). `nlbApplyParam("mu_s", v)` writes every non-ghost, non-hanging body
  from the SAME value every frame (confirmed source read, no mirror dependency, no per-body lag
  possible) so both carts cross the breakaway threshold on the exact same frame. `F_applied` on A/B
  stays the existing constant +30/-30 N via `action_reaction` the whole state (untouched by this ramp -
  the mirror only ever reads/writes `F_applied`, never `mu_s`) - no other state authors nonzero mu_s on
  any body.
- **STATE_5** - A: 6 kg, B: 6 kg defaults (teacher-editable via `m`/`m2` sliders, range 2-14 kg).

---

## 3. Per-state motion timeline + live-control spec (Rule 31/32/26)

All five states: `surface.length_m: 10` (STATE_5 uses `12` - Item 3), `theta_deg: 0`,
`frictionless: true` in every state EXCEPT STATE_4 (a `true` flag hard-zeroes every body's mu_s/mu_k
per spec §1, which would silently erase STATE_4's whole mechanism - so STATE_4 omits it / leaves it
false). Camera: one shared framing across all 5 states, `camera_position: [0, 3.2, 12.5]`, always
`x = 0` (brief §3.7 - no lateral offset, ever, on this concept). No `mode_overrides` (Rule 20 [D]).

| State | t-window | What animates (pure fn of state clock) | Driven by | Live controls |
|---|---|---|---|---|
| S1 | 0 to ~1.0 s (glow-only, no motion) | spring sits compressed; glow_focal = `nlb_spring` - the cause, held | static pose | none |
| S1 | ~1.0 s (release) -> 420 ms | both `applied` arrows flash on (+/-30 N); spring extends 0.72->1.60 m as gap widens; both carts accelerate outward from +/-0.91 m | `push_off` gate (`release_at_ms: 420`) | none |
| S1 | 420 ms -> hold (pin at 2420 ms) | spring hides (gap > natural length); both applied arrows vanish (F=0 after release); carts coast at constant +/-2.10 m/s | position-derived spring hide + push_off zeroing | none |
| S2 | identical structure, identical `release_at_ms: 420` to S1 (declared contrast pair) | spring release, SAME F=30, only masses changed (4 kg / 12 kg); arrows pixel-identical length; carts separate at visibly different rates (3:1) | `push_off` gate | none |
| S3 | 0 to ~1.0 s | spring compressed between cart A (+0.7725) and wall W (-0.7725); glow on spring | static pose | none |
| S3 | ~1.0 s -> 593 ms | both `applied` arrows flash on; cart accelerates (+30 N, a=5.00), wall's arrow draws full-magnitude but wall never moves (`fixed`) | `push_off` gate (`release_at_ms: 593`) | none |
| S3 | 593 ms -> hold (pin at 2593 ms) | spring hides; cart coasts at +2.97 m/s; wall arrow vanishes with the cart's (force -> 0 together) | position-derived + push_off zeroing | none |
| S4 | 0-2498 ms (held) | both carts braked and STUCK: F_applied +/-30 N constant (unchanged arrow, Rule 32b); friction arrow constant at 30 N (L=1.44 world units) while `mu_s(t)` ramps 0.75->0.27 -- the grip magnitude is honestly UNCHANGED here (static friction is reactive, not proportional to mu_s -- FIX CYCLE 2 correction to the founder's "gradual shrink" premise); no F_net readout is shown (dropped FIX CYCLE 3 -- see appended section); the cancellation is directly legible as two equal-magnitude, opposite-facing arrows (F_applied 30.00 N, friction 30.00 N) on the SAME cart; glow-focal on `nlb_arrow_A_friction` -- the grip that is about to fail | `param_ramp` on `mu_s` (`from:0.75,to:0.27,end_ms:5000`), pure fn of state clock, no lag (writes ALL bodies identically, never through the `F` mirror) | none |
| S4 | 2498 ms (breakaway, one frame) | `mu_s(t)` crosses 0.5102 = F/(m·g): maxStatic < drive on BOTH carts simultaneously (identical mass/N/F -- symmetric by construction). Friction arrow SNAPS 1.44->0.55 world units (30 N stuck -> 0 N kinetic, mu_k=0); friction glyph flips f-sub-s -> f-sub-k, friction arrow snaps to its floor (0 N, honest -- FIX CYCLE 3 drops the F_net readout so no live ΣF number is ever asserted); glow-focal shifts to `nlb_arrow_B_applied` -- the partner, now visibly accelerating | `phases[]` id `breakaway`, `at_ms:2498`, `until_ms:null` (attention cue only -- the delta itself is carried by f/position, not by this glow) | none |
| S4 | 2498 ms -> ~4230 ms | both carts accelerate apart at a=+/-5.00 m/s^2 (identical magnitude to S1: same m=6 kg, F=30 N, mu_k=0) from +/-2.5 m; position readout genuinely changes every frame (t=3000: 3.13 m; t=4000: 8.14 m) | Branch A integrator, driven by the now-nonzero net force | none |
| S4 | ~4230 ms -> hold (open) | both carts reach the +/-10 m track bound and clamp there (position-derived, same graceful stop S1/S2/S3 already rely on) -- frozen for the remaining ~9.8 s of the ~14 s window, exactly the shape THE EYE already accepts for S1 (brief motion, then settle at a final resting position) | position clamp (`nlbBoundsM`) | none |
| S5 | continuous, free-run (Rule 37) | both carts recoil apart under `action_reaction` mirror; `idle_auto_sweep` ramps F 15->45->15 N triangularly (4 s period) until a trusted control seizes; carts clamp gracefully at +/-12 m track ends if left untouched | F sweep / m,m2,F sliders / body drag | m, m2, F (ALL) |

**Rule 32a compliance:** every guided state's cause (spring glow / phase glow shift) opens BEFORE the
effect (arrows firing / motion / F_net reading) by a readable beat (~1.0 s pre-release hold in
S1/S2/S3; in S4 (FIX CYCLE 2 -- SUPERSEDES FIX CYCLE 1's glow-only retiming) the friction glow during the ~2.5 s held beat IS the cause, and the breakaway -- a real position/force/readout change, not a glow perception -- IS the effect, so the two are genuinely sequenced by real physics, not by hoped-for capture timing).
**Rule 32b compliance:** S2 changes ONLY mass; S3 changes ONLY "who is the other body" (adds `fixed`);
S4 changes ONLY `mu_s` (FIX CYCLE 2 -- the ramped/taught variable) -- `F_applied` on both bodies stays
the existing constant +/-30 N the entire state (Rule 32b's "only the taught variable moves" is honored
exactly: the push never changes, only whether the grip can still match it). Apparatus (spring/brake,
track, camera) is otherwise pixel-identical across states.

---

## 4. Board-mode mark scheme

**SKIPPED per Rule 20 [D] / rebuild_brief §5 - conceptual-only directive is active.** No
`mode_overrides` authored.

---

## 5. Drill-down cluster phrasings (5 real student phrases each)

**`heavier_pushes_harder`** (STATE_2)
1. "why does the heavier cart push less"
2. "shouldnt the big cart exert more force"
3. "the truck is heavier so it must push harder right"
4. "if masses are different how can the forces be equal"
5. "does a bigger object always push with more force"

**`truck_car_collision_forces`** (STATE_2)
1. "in a car truck crash does the truck hit harder"
2. "why does the car get destroyed if forces are equal"
3. "the truck barely moves so it must have pushed more"
4. "equal force but unequal damage how"
5. "why does the smaller vehicle always lose if force is the same"

**`action_reaction_magnitude_equality`** (STATE_2)
1. "is the equality exact or just approximate"
2. "are the forces equal even while the cart is speeding up"
3. "does the equal and opposite hold at every single instant"
4. "what if one cart accelerates faster does the force change"
5. "is F on A always exactly F on B no matter what"

**`action_reaction_cancel_fallacy`** (STATE_4)
1. "equal and opposite so why does anything move at all"
2. "if forces cancel how does the cart go anywhere"
3. "action equals reaction so shouldnt everything stay still"
4. "why doesnt the pair just cancel out to zero"
5. "if they are always equal and opposite whats the point of pushing"

**`third_law_pair_identification`** (STATE_4)
1. "is weight and normal force a third law pair"
2. "why isnt mg and N an action reaction pair"
3. "how do i know which two forces are the real pair"
4. "are gravity and normal reaction equal and opposite so they are partners"
5. "whats the test for a genuine third law pair"

**`internal_forces_cannot_self_accelerate`** (STATE_4)
1. "why cant i lift myself by pulling my own arm"
2. "can i push myself forward while standing still on the same spot"
3. "why doesnt pulling on your own shirt move you"
4. "if i push against myself why dont i accelerate"
5. "why do you need something outside yourself to get moving"

---

## 6. Constraint callouts

- **No `radians()` conversions needed anywhere** - theta is a hard 0 in every state; no formula in
  this concept passes an angle to sin/cos/tan.
- **Arrow clamp law**, verified against every force actually drawn: `len = clamp(0.55, 2.80, N*0.048)`.
  30 N -> 1.44 world (2.6x the floor, half the ceiling) in S1-S4. S5's `idle_auto_sweep` floor is 15 N
  -> 0.72 world (clear of the 0.55 floor); its ceiling 45 N -> 2.16 world (clear of the 2.80 ceiling).
  **No weight/normal arrows are shown in ANY state** - 6 kg weight = 58.8 N and 12 kg weight = 117.6 N
  both clamp at the 2.80 ceiling, so showing them would draw two visually identical vertical arrows
  regardless of mass, actively undermining S2's payload. `arrows[].show` is `["applied"]` only in
  S1-S3, `["applied","friction"]` in S4, `["applied","net"]` in S5.
- **Spring position/order/timing contract** - see §3 timeline; all three authored numbers (position,
  order, timing) independently re-derived in Open Item 4 below and matched exactly.
- **Slider range vs authored value agreement** (the `newton_second_law` scar) - see §7 Item 5 for the
  explicit `field_3d_config.slider_controls` override block.
- **`fixed` id discipline** - "W" appears in STATE_3 only, nowhere else, ever. "A" never carries
  `fixed:true` in any state.
- **Reveal pin on-screen check** - S1 pin (2420 ms): +/-5.55 m, inside +/-10 m. S2 pin: +7.87 m /
  -3.23 m, inside +/-10 m. S3 pin (2593 ms): +7.59 m / wall unmoved, inside +/-10 m. All well clear of
  the track bounds at the exact instant THE EYE's H2 baseline freezes.

---

## 7. Open items - definitive resolutions

### Open Item 1 - STATE_4's mechanism, verified

**(a) Does `action_reaction` mirror F_applied onto the second body?** YES, confirmed at
`updateNewtonsLawsBodyFrame` (renderer ~L31639-31649): every frame, for `driver_body_id`'s body `drv`,
every OTHER non-ghost body gets `ob.F_applied = -drv.F_applied`. Exact keys:
`action_reaction: { engaged: true, driver_body_id: "A" }`. Runs BEFORE the integrator branches, so it
is never one frame stale.

**(b) Does the integrator genuinely report `_stuck` and hold s pinned, THEN genuinely break away as
`mu_s` ramps down? [FIX CYCLE 2 -- re-verified with the ramp in place]** YES, both halves. Branch A
(uncoupled, renderer ~L31670-31753): `N = m*g*cos(theta)` = 6x9.8x1 = 58.8 N per cart; `drive` = 30 N
constant (F_applied never ramped -- only `mu_s` is). While `maxStat = mu_s(t)*N > 30`, `stuck =
(|v|<STOP_EPS_V) && (|drive|<=maxStat)` is true, `a=0`, `v` pinned 0, `f=-drive=-30 N` (reported, never
integrated) -- this magnitude is CONSTANT regardless of `mu_s`'s current value, because static friction
is reactive (whatever balances `drive`, up to the limit), never literally `mu_s * N` except AT the
limit -- a correction to the "friction arrow gradually shrinks" premise (see Fix Cycle 2 section for the
full argument). At `mu_s(t) = F/(m*g) = 30/58.8 = 0.5102` (computed below: t is approx 2498 ms with the
chosen ramp), `maxStat` drops below 30 N and `stuck` flips false on that exact frame. Since the ramp is
MONOTONIC and HOLDS at `to` (0.27, permanently below the 0.5102 threshold), `drive > maxStat` remains
true for every subsequent frame -- the "must not jitter across v=0" guard at ~L31730-31733 (`if
(nlbSgn(v0) !== nlbSgn(v1)) && Math.abs(drive) <= maxStat) { v1=0; a=0; }`) never re-fires after
breakaway because its own condition (`drive <= maxStat`) is never true again. So there is NO chatter
around the threshold -- confirmed by the ramp's own monotonicity, not merely asserted.

**(c) [FIX CYCLE 1, SUPERSEDED BY FIX CYCLE 2 -- kept for the audit trail] Is a phased/timed arrow
reveal available?** Confirmed unchanged: `phases: Array<{ id, at_ms, until_ms, action, glow_focal }>`
only ever re-times `glow_focal` (and writes a `phase_action` string with zero consumers anywhere in the
renderer); `arrows[].show` is fixed once per state entry, no per-phase add/remove. Fix Cycle 1 tried to
carry STATE_4's entire visible delta on this glow-only mechanism (three timed re-focus events on an
otherwise-frozen tableau) and the founder confirmed via eye-walker's 1000 ms-cadence dense frames that
it produced ZERO visible pixels -- the phase transitions were genuinely crossed (the coordinator
confirmed the state clock demonstrably advances on this capture path, evidenced by S1/S2/S3's real
positional deltas across the same dense frames) yet nothing rendered differently. That candidate is
DEAD; retiming the boundaries (Fix Cycle 1's fix) could not have helped, because the defect was never
about WHEN the phases fired, only about the fact that glow-focal alone, with no accompanying
numeric/positional change, was the state's ONLY authored delta.

**FIX CYCLE 2 resolution (the phases[] mechanism is now a bonus attention cue, not the delta-carrier):**
STATE_4 keeps a HELD, honestly-static tableau at the OPENING (this is real physics, not a config gap --
see (b) above: static friction is reactive, so nothing rendered changes while the grip still holds,
exactly as S1 itself opens with a genuine ~1.0 s static "spring compressed, held" beat before its own
release). What is NEW: a `param_ramp` on `mu_s` (0.75 -> 0.27 over 0-5000 ms) drives the SAME held
tableau toward a real, physically-forced breakaway at t ≈ 2498 ms -- after which `f`, `F_net`, and BOTH
carts' positions genuinely change every subsequent frame, exactly the class of delta (positional +
readout) that S1/S2/S3 already prove THE EYE captures correctly. `phases[]` now carries exactly ONE
transition, synced to that real event, purely to redirect the student's attention (Rule 32a) -- it is
no longer load-bearing for pixel evidence. Exact JSON:
```json
"phases": [
  { "id": "breakaway", "at_ms": 2498, "until_ms": null, "glow_focal": "nlb_arrow_B_applied" }
]
```
`glow_focal` (base/state-level) is `"nlb_arrow_A_friction"` -- the grip, visibly under an unstated but
real ramp, is the natural pre-breakaway focal; the single phase above hands the focal to the partner
the instant real motion begins, so the student's attention arrives at "the OTHER body moved too"
exactly when that becomes true, not before.

**(d) Does the friction arrow's label glyph flip cleanly at breakaway, without contradicting the HUD
row? [FIX CYCLE 2 -- re-verified with the ramp/breakaway in place]** YES. `nlbUpdateArrow(...,
"friction",...)` (renderer ~L30072) picks `lab.friction || (stuck ? "f-sub-s" : "f-sub-k")`, and
`nlbWriteReadouts` (~L31570-31578) reads the SAME per-body `b._stuck` boolean (~L31750) for its own row
- both consume one shared flag written once per frame, so the arrow glyph and the HUD row can never
disagree on which frame the flip happens. Pre-breakaway (t < 2498 ms) both read the static glyph;
from t = 2498 ms onward (`stuck` flips false on that exact frame and never re-flips true, per (b)
above) both read the kinetic glyph -- byte-consistent, single source of truth, no drift possible.

### Open Item 2 - STATE_3 body ids

**Definitive: reuse id "A" for STATE_3's cart. Do NOT create "A3".** Verified `fixed` is read at build
time from a body's FIRST appearance in the union across all states (`nlbCollectBodyDefs`, renderer
~L30528 - determines cube-vs-wall-slab MESH GEOMETRY, built once). "A" first appears in STATE_1 with
`fixed` omitted (=false), so its mesh is built as a cart cube; it is never given `fixed:true` in any
later state (STATE_3 included), so this stays consistent. **Mass, by contrast, is re-read from the
CURRENT state's `bodies[]` array on every single state entry** - confirmed at
`applyNewtonsLawsBodyState` (renderer ~L31190-31217): `eng.bodies[d.id].m = d.mass_kg` is set fresh
every call, with no memory of a prior state's value. So "A" is 6 kg in S1, 4 kg in S2, 6 kg again in
S3, 6 kg in S4/S5 - all legal, all independently confirmed by reading the per-state seeding code
directly (the SAME mechanism `newton_second_law.json` already exercises: its "A" is 150 kg in STATE_1
but 75 kg in STATE_2/STATE_3). **The WALL gets its own id "W"**, `fixed: true`, appearing in STATE_3
only - this is the one id that must never appear anywhere else (per brief §3.5).

### Open Item 3 - STATE_5 sandbox excursion

**Definitive: the engine CLAMPS body position to the surface bounds; nothing runs off-track or
disappears.** Verified at `nlbBoundsM` (renderer ~L31535-31550, uncoupled/no-pulley branch):
`return { lo: -lenM, hi: lenM }`, and the Branch-A integrator (~L31734-31747) clamps `s1` into
`[bd.lo, bd.hi]` every single frame, forcibly zeroing `v` and `a` for that frame once the body sits at
a bound (`_boundArrestedSliding` latches so the friction-glyph logic stays honest - irrelevant here
since STATE_5 is frictionless). Under `action_reaction` with a sustained positive `F`, both carts
accelerate apart and eventually park at the track's two ends, motionless but still fully rendered,
arrows still drawn (arrows are pure presentations of `F_applied`/`f`, never gated by the position
clamp) - this is a graceful, always-something-on-screen stop, not a vanish or a NaN. No
`RESET_TRAJECTORY` or sweep-cycle is needed or invoked; the existing bound-clamp IS the answer. To keep
the "something to watch" window comfortably long before that clamp engages, author
`surface.length_m: 12` (more headroom than the guided states' 10) and keep default masses at 6 kg
(giving a=5 m/s^2 at the default F=30 N - the same rate STATE_1 already uses, proven on-screen for 2+
seconds at the reveal pin). `idle_auto_sweep: { param: "F", range: [15, 45] }` (period
`NLB_SWEEP_MS = 4000 ms`, confirmed constant, one full 15->45->15 triangle every 4 s) keeps the demo
visibly alive - teacher drags any of `m`/`m2`/`F` (or the body itself, `trusted_drag_seizes: true`) to
seize control per Rule 37, at which point the sweep stops (`PM_nlbSweepSeized`/`PM_nlbBodyDragged`
flags, confirmed at `nlbRunIdleSweep` ~L31052).

### Open Item 4 - every reference number, independently re-derived

All re-derived from first principles (kinematics under constant acceleration during contact, then
constant-velocity coast for a FIXED 2.0 s window after release_at_ms - confirmed this is what
position at release_at_ms + 2000 means: the pin is evaluated at absolute state-clock time
release_at_ms + 2000, i.e. exactly 2.000 s of coasting after release, regardless of how long the
contact phase itself took):

- S1 (m=m=6 kg, F=30 N): t_release = sqrt(0.88x6/30) = sqrt(0.176) = 0.4195 s -> 420 ms - match.
  a = 30/6 = 5.00 m/s^2 - match. v_release = sqrt(0.88x30/6) = sqrt(4.4) = 2.098 -> 2.10 m/s -
  match. Push-phase displacement = 0.5x5x0.4195^2 = 0.440 m. Position at pin
  = 0.91 + 0.440 + 2.10x2.0 = 0.91+0.440+4.20 = 5.55 m - exact match to brief section 4.
- S2 (A=4 kg, B=12 kg, F=30 N): t_release = sqrt(1.32x4/30) = sqrt(0.176) = 0.4195 s -> 420 ms -
  match (same as S1: reduced mass 3 kg in both, confirmed 6x6/12 = 4x12/16 = 3). a_A = 30/4 = 7.50,
  a_B = 30/12 = 2.50 - match. v_A = sqrt(1.32x30/4) = sqrt(9.9) = 3.1464 -> 3.15 m/s - match;
  v_B = v_A/3 = 1.0488 -> 1.05 m/s - match. Push-disp A = 0.5x7.5x0.4195^2 = 0.660 m; pin position
  A = 0.91+0.660+3.1464x2.0 = 0.91+0.660+6.293 = 7.86 -> 7.87 m (rounding) - match. Push-disp B
  = 0.5x2.5x0.4195^2 = 0.220 m; pin position B = -(0.91+0.220+1.0488x2.0) = -(0.91+0.220+2.098)
  = -3.228 -> -3.23 m - match. Both exact matches to brief section 4.
- S3 (cart 6 kg vs fixed wall, F=30 N): t_release = sqrt(1.76x6/30) = sqrt(0.352) = 0.5933 s ->
  593 ms - match. a = 30/6 = 5.00 m/s^2 (walls a=0) - match. v_release = sqrt(1.76x30/6) =
  sqrt(8.8) = 2.9665 -> 2.97 m/s - match. Push-disp = 0.5x5x0.5933^2 = 0.880 m. Pin position
  = 0.7725+0.880+2.9665x2.0 = 0.7725+0.880+5.933 = 7.585 -> 7.59 m - exact match; wall stays at
  -0.7725 m (unmoved, fixed).
- All three pin positions (5.55, 7.87/-3.23, 7.59 m) are comfortably inside surface.length_m = 10
  -> bounds +/-10 m - nothing clips or runs off at the frozen reveal instant.
- body_a_id is the positive-side body in every push_off state: S1 A(+0.91)/B(-0.91),
  S2 A(+0.91)/B(-0.91), S3 A(+0.7725)/W(-0.7725) - body_a_id: A in all three, always the positive
  side.
- Arrow clamp law re-checked for every force actually drawn: 30 N -> 1.44 world in S1-S4 (2.6x the
  0.55 floor, half the 2.80 ceiling); S5 sweep 15 N -> 0.72 world, 45 N -> 2.16 world - both clear of
  both clamps. No weight/normal/tension arrows are shown anywhere (would clamp at 58.8 N / 117.6 N
  ceiling and clutter the canvas - confirmed by direct arithmetic, not assumption).
- Spring geometry re-checked: cart-cart gap abs(0.91-(-0.91)) = 1.82 m = 0.72+0.55+0.55 - match;
  cart-wall gap abs(0.7725-(-0.7725)) = 1.545 m = 0.72+0.55+0.275 - match.

### Open Item 5 - enum/key names verified against the renderer + schema surface

All of the following were grepped directly against field_3d_renderer.ts (not assumed):
- Readout keys: nlbWriteReadouts (~L31565-31585) accepts exactly
  N | f | a | v | T | F_net | F_applied. This concept authors [F_applied, v] (S1),
  [F_applied, a] (S2, S3), [F_applied, f, F_net] (S4), [F_applied, a, v] (S5). All valid.
- Slider tokens: NLB_SLIDER_SPEC (~L30721-30729) confirms exactly m | m2 | F | theta | mu_s |
  mu_k | v0. This concept only ever needs m, m2, F (STATE_5). Confirmed valid tokens.
- Mechanism/mode strings: the mode union (~L860) includes action_reaction_pair, fbd_isolate,
  sandbox verbatim, also compare_mass_same_force (a schema-valid string, but semantically it is
  the label the ENGINE SPEC assigns to the Newton-II mass-compare state - newton_second_law STATE_2
  uses it with NO action_reaction/push_off involved). Correction to the skeleton per-state mode
  column: use mode "action_reaction_pair" for S1, S2, AND S3 (all three are the third-law
  pair-under-push_off family; the mass axis in S2 is the CONTRAST within that same mode, not a
  different mode), mode "fbd_isolate" for S4, mode "sandbox" for S5. Flagging so json_author does
  not copy "compare_mass_same_force" verbatim onto S2.
- Glow keys: nlb_spring (confirmed, brighten-only, in solidApparatus list), the pattern
  nlb_arrow_BODYID_KIND (confirmed, ~L30143), and nlb_body_ID (confirmed, ~L30552). idle_auto_sweep
  confirmed real (~L1050 ts interface, consumed at nlbRunIdleSweep ~L31049).
- Slider-range agreement (the newton_second_law scar) - resolved with an explicit override.
  NLB_SLIDER_SPEC engine default ranges are m/m2: min 0.5, max 10; F: min -20, max 20. This concept
  authors mass values up to 12 kg (STATE_2 body B) and force values of 30 N (S1-S4) and up to 45 N
  (S5 sweep ceiling) - BOTH exceed the engine defaults and would be silently clamped by the
  underlying range-input DOM element if field_3d_config.slider_controls is left unauthored (the
  exact newton_second_law scar: a value of 150 written onto an input whose max was 5). Required
  override, authored in field_3d_config.slider_controls:
  m: min 2, max 14, step 0.5, default 6, label m1;
  m2: min 2, max 14, step 0.5, default 6, label m2;
  F: min 15, max 45, step 1, default 30, label F.
  This matches physics_engine_config.variables exactly (section 1: m/m2 min 2 max 14 default 6, F
  min 15 max 45 default 30) - the two blocks AGREE, per Item 5 requirement. Even though S1-S3 never
  expose the F slider (controls_visible empty, banned per brief section 3.3), the underlying shared
  DOM slider still exists (built once, rows shown/hidden) and still gets its display value synced
  from the engine state on every state entry (nlbSyncSliderRow) - authoring the override prevents
  any state, guided or sandbox, from silently clamping a synced display value.

### Open Item 6 - final narration (text_en only, Rule 30i; anchors universal, Rule 35)

- S1 (45 words): "A compressed spring sits between two identical carts. Release it. One push acts
  on both carts, at the same instant they recoil, equal speeds, opposite directions. Every force is
  one half of a two-body interaction. No force after release, so each cart keeps its speed."
- S2 (39 words): "Same spring, same push, but the right cart is three times heavier. Watch the
  arrows: identical, always. Only the accelerations differ, a equals force F over mass m, so three
  to one. Mass never changes the force; it changes the response."
- S3 (41 words): "Now the spring pushes a wall. Same pair: cart, thirty newtons one way; wall,
  thirty newtons the other, the arrows match exactly. The cart flies; the wall stays, because its
  body is the whole Earth. Zero motion never means zero force."
- S4 (49 words, FIX CYCLE 2 -- rewritten to match the new physics; supersedes the 52-word
  static-hold version): "Hold each cart with a brake against the same push. On cart one, the push
  and its own grip cancel to zero, while the grip holds. Loosen the brake: the grip gives way, and
  cart one accelerates. Cart two, a different body, accelerates too, proving the pair never
  cancelled."
- S5: 0 words / open (interaction_complete).

All four confirmed inside the 25-55 EN-word band by direct count. Anchors used only in the
architect real_world_anchor block (skaters / pool-wall push-off) - none of that phrasing appears
inside these on-canvas narrations, which stay strictly inside the apparatus itself (Rule 24/34); no
country, brand, food, festival, or currency reference anywhere. text_hi optional (Rule 30g
sub-agent, never voiced); text_te never authored (Rule 30i).

---

## 8. Full per-state field_3d_config wiring (ready for json_author to lift)

```json
{
  "scenario_type": "newtons_laws_body",
  "slider_controls": {
    "m":  { "min": 2, "max": 14, "step": 0.5, "default": 6, "label": "m1" },
    "m2": { "min": 2, "max": 14, "step": 0.5, "default": 6, "label": "m2" },
    "F":  { "min": 15, "max": 45, "step": 1, "default": 30, "label": "F" }
  },
  "states": {
    "STATE_1": {
      "camera_position": [0, 3.2, 12.5],
      "caption": "One push, two motions",
      "show_sliders": true,
      "formula_overlay": "F₂₁ = −F₁₂",
      "newtons_laws_body": {
        "mode": "action_reaction_pair",
        "surface": { "theta_deg": 0, "length_m": 10, "frictionless": true },
        "bodies": [
          { "id": "A", "label": "m1", "mass_kg": 6, "initial_position_m": 0.91, "initial_velocity_mps": 0 },
          { "id": "B", "label": "m2", "mass_kg": 6, "initial_position_m": -0.91, "initial_velocity_mps": 0 }
        ],
        "spring": { "between": ["A", "B"] },
        "push_off": { "body_a_id": "A", "body_b_id": "B", "force_N": 30, "release_at_ms": 420 },
        "arrows": [
          { "body_id": "A", "show": ["applied"] },
          { "body_id": "B", "show": ["applied"] }
        ],
        "glow_focal": "nlb_spring",
        "readouts": ["F_applied", "v"],
        "controls_visible": []
      }
    },
    "STATE_2": {
      "camera_position": [0, 3.2, 12.5],
      "caption": "Unequal masses, equal forces",
      "show_sliders": true,
      "formula_overlay": "|F₂₁| = |F₁₂| ⇒ a ∝ 1/m",
      "newtons_laws_body": {
        "mode": "action_reaction_pair",
        "surface": { "theta_deg": 0, "length_m": 10, "frictionless": true },
        "bodies": [
          { "id": "A", "label": "m1", "mass_kg": 4, "initial_position_m": 0.91, "initial_velocity_mps": 0 },
          { "id": "B", "label": "m2", "mass_kg": 12, "initial_position_m": -0.91, "initial_velocity_mps": 0 }
        ],
        "spring": { "between": ["A", "B"] },
        "push_off": { "body_a_id": "A", "body_b_id": "B", "force_N": 30, "release_at_ms": 420 },
        "arrows": [
          { "body_id": "A", "show": ["applied"] },
          { "body_id": "B", "show": ["applied"] }
        ],
        "glow_focal": "nlb_arrow_B_applied",
        "readouts": ["F_applied", "a"],
        "controls_visible": []
      }
    },
    "STATE_3": {
      "camera_position": [0, 3.2, 12.5],
      "caption": "Wall pushes back, unmoved",
      "show_sliders": true,
      "formula_overlay": "a = F/m → a_wall ≈ 0",
      "newtons_laws_body": {
        "mode": "action_reaction_pair",
        "surface": { "theta_deg": 0, "length_m": 10, "frictionless": true },
        "bodies": [
          { "id": "A", "label": "m1", "mass_kg": 6, "initial_position_m": 0.7725, "initial_velocity_mps": 0 },
          { "id": "W", "label": "wall (Earth)", "mass_kg": 1000000, "fixed": true, "initial_position_m": -0.7725 }
        ],
        "spring": { "between": ["A", "W"] },
        "push_off": { "body_a_id": "A", "body_b_id": "W", "force_N": 30, "release_at_ms": 593 },
        "arrows": [
          { "body_id": "A", "show": ["applied"] },
          { "body_id": "W", "show": ["applied"] }
        ],
        "glow_focal": "nlb_arrow_W_applied",
        "readouts": ["F_applied", "a"],
        "controls_visible": []
      }
    },
    "STATE_4": {
      "camera_position": [0, 3.2, 12.5],
      "caption": "Cancelling needs one body",
      "show_sliders": true,
      "formula_overlay": "F₂₁ = −F₁₂",
      "newtons_laws_body": {
        "mode": "fbd_isolate",
        "surface": { "theta_deg": 0, "length_m": 10 },
        "bodies": [
          { "id": "A", "label": "m1", "mass_kg": 6, "initial_position_m": 2.5, "initial_velocity_mps": 0, "mu_s": 0.75, "applied_force_N": 30 },
          { "id": "B", "label": "m2", "mass_kg": 6, "initial_position_m": -2.5, "initial_velocity_mps": 0, "mu_s": 0.75 }
        ],
        "action_reaction": { "engaged": true, "driver_body_id": "A" },
        "arrows": [
          { "body_id": "A", "show": ["applied", "friction"] },
          { "body_id": "B", "show": ["applied", "friction"] }
        ],
        "glow_focal": "nlb_arrow_A_friction",
        "param_ramp": { "param": "mu_s", "from": 0.75, "to": 0.27, "start_ms": 0, "end_ms": 5000 },
        "phases": [
          { "id": "breakaway", "at_ms": 2498, "until_ms": null, "glow_focal": "nlb_arrow_B_applied" }
        ],
        "readouts": ["F_applied", "f"],
        "controls_visible": []
      }
    },
    "STATE_5": {
      "camera_position": [0, 3.2, 12.5],
      "caption": "All yours",
      "show_sliders": true,
      "formula_overlay": "F₂₁ = −F₁₂",
      "newtons_laws_body": {
        "mode": "sandbox",
        "surface": { "theta_deg": 0, "length_m": 12, "frictionless": true },
        "bodies": [
          { "id": "A", "label": "m1", "mass_kg": 6, "initial_position_m": 2.5, "initial_velocity_mps": 0, "applied_force_N": 30 },
          { "id": "B", "label": "m2", "mass_kg": 6, "initial_position_m": -2.5, "initial_velocity_mps": 0 }
        ],
        "action_reaction": { "engaged": true, "driver_body_id": "A" },
        "arrows": [
          { "body_id": "A", "show": ["applied", "net"] },
          { "body_id": "B", "show": ["applied", "net"] }
        ],
        "glow_focal": "nlb_body_B",
        "readouts": ["F_applied", "a", "v"],
        "controls_visible": ["m", "m2", "F"],
        "trusted_drag_seizes": true,
        "idle_auto_sweep": { "param": "F", "range": [15, 45] }
      }
    }
  }
}
```

---

## 9. Self-review checklist

- [x] Every symbol in the state narrations (F, m, a, v, f) appears in variables.
- [x] No radians() needed - theta = 0 throughout.
- [x] Live controls per state match the architect control table (S1/S2/S3 = none, S4 = none, S5 = ALL).
- [x] Per-state body overrides documented and justified (section 2); mass-per-id-may-vary and
      fixed-per-id-may-NOT-vary both independently confirmed against the renderer source.
- [x] Board mark scheme - SKIPPED (Rule 20 [D]).
- [x] Drill-down phrasings - 5 per cluster times 6 clusters, real student voice, no teacher-prose.
- [x] Constraints block - 6 short factual assertions (section 1).
- [x] Numerical sanity check - all three push_off states timing/velocity/position independently
      re-derived from first principles and matched exactly to brief section 4 (Open Item 4).
- [x] Motion timeline for every state, pure fn of state clock, no two states identical, Rule 32a/32b
      verified against actual engine consumption of phases[]/glow_focal (not assumed).
- [x] Word budget - all 4 guided narrations counted 39-52 EN words; S5 = 0/open.
- [x] Engine bug queue consulted (section 0); every relevant prevention rule satisfied.
- [x] DC Pandey check - no formula, teaching sequence, or phrasing imported from any book; the
      spring-cart-wall arc and all narration authored first-principles per the founder brief.

ENGINE GAP: none


---

## FIX CYCLE 1 -- STATE_4 (added; the top-of-file "ENGINE GAP: none" banner is qualified below for STATE_4 specifically, per this cycle's finding)

### The finding, re-confirmed
eye-walker's pixel evidence stands: every dense frame S4 t=0000..t=14000, the static pre-frame, and the
frozen H2-pin frame are identical -- same cart pose, same 4 arrows, same HUD (m1 F=30.00/f=30.00/SumF=0.00,
m2 F=-30.00/f=30.00/SumF=0.00). This is the standing scar `field3d_nlb_phase_glow_handoff_not_visible`
repeating.

### The decisive question -- answered definitively from source (`field_3d_renderer.ts` at HEAD)

**(a) Does `nlbRunParamRamp`/`nlbRunIdleSweep` write `F_applied` on one body only, or a shared scalar
the mirror re-derives?** ONE BODY ONLY. `nlbApplyParam("F", v)` (~L30841) resolves the write target via
`nlbForceTargetBody()` (~L30819-30826): `if (ar && ar.engaged && ar.driver_body_id) return
eng.bodies[ar.driver_body_id]` -- with `action_reaction.engaged:true`, a ramp or sweep on token `"F"`
writes ONLY the driver body's `F_applied`. The partner's value is never touched by the ramp/sweep
directly -- it depends entirely on the mirror re-deriving it.

**(b) Does a ramped/swept F stay EXACTLY mirrored on the SAME frame, or lag one frame?** LAGS ONE FRAME --
confirmed unsafe. `updateNewtonsLawsBodyFrame` (~L31613-31667) runs, in this exact order, every tick:
`nlbRunPhases -> nlbRunPushOff -> [action_reaction mirror] -> nlbRunIdleSweep -> nlbRunParamRamp`. The
mirror (~L31639-31649: `ob.F_applied = -drv.F_applied` for every non-driver body) executes and reads
`drv.F_applied` BEFORE either `nlbRunIdleSweep` or `nlbRunParamRamp` writes this frame's new ramped
value into the driver. So on the frame that is actually rendered/read out: `drv.F_applied` = ramp(t_N)
(just written, current), but `ob.F_applied` = -ramp(t_N-1) (mirrored from the driver's value as of the
END of the PREVIOUS frame, one tick stale). This is a real, continuously-present per-frame delta whenever
the ramp/sweep is actively changing value -- at typical authored rates (e.g. 15 to 34 N over ~14 s at
60 Hz, delta-v per frame approx 0.02-0.03 N) it would show up as a visible mismatch at the HUD's 2-decimal
precision (driver "20.02", partner "-19.99"), directly contradicting the one claim this concept exists to
make: exact equal-and-opposite at every instant. CONTRAST: `nlbRunPushOff` (~L31135-31155) is safe from
this exact failure because it writes BOTH `bA.F_applied = F` and `bB.F_applied = -F` directly, in the SAME
function call, from ONE local variable, BEFORE the mirror runs (so the mirror, when it also fires right
after, simply re-affirms an already-current value) -- this is why S1/S2/S3's push_off states are safe and
why a param_ramp/idle_auto_sweep on `F` through the mirror is NOT the same safe pattern.

**(c) Real keys/shapes; do they run in guided states?** `nlb.param_ramp: { param, from, to, start_ms?,
end_ms }` -- a SINGULAR object (one param per state, no array), one-shot monotonic, HOLDS at `to`
forever after `end_ms`; explicitly gated OUT of `mode:"sandbox"` only (`if (eng.mode ===
"sandbox") return;` ~L31094) -- so YES, it runs in every guided/non-sandbox state, that is its entire
design purpose (the "Section 7.1 pre-approved fix" comments confirm this was already reviewed and approved
for guided-state use in general). `nlb.idle_auto_sweep: { param, range: [lo, hi] }` -- also singular, a
repeating 4 s triangle wave, and has NO mode gate at all (~L31049-31066: checks only `sw.param`,
`sw.range`, and the seizure flags) -- it would run in ANY state including a guided one if authored there.
Neither surface supports two independent per-body ramps/sweeps in one state (no array of ramps; one
`param_ramp` object, one `idle_auto_sweep` object, period).

**Verdict: REJECT the F-ramp candidate as literally proposed.** Driving `F` via `param_ramp` or
`idle_auto_sweep` while `action_reaction` is engaged produces a genuine, non-zero, HUD-visible
one-frame lag on the partner body throughout the ramp -- the opposite of the exact-equality this concept
teaches. There is no existing config surface to author two independent, frame-synchronized ramps on two
bodies without going through the lagging mirror path.

### The fallback candidate (S1 replay with two full diagrams) -- also rejected, on archetype-honesty grounds
Re-staging STATE_4 as an actual push-off release (both carts genuinely separating, full force diagrams
drawn on both) would be SAFE mechanically (`push_off` is the same lag-free, already-proven pattern S1-S3
use) and would give real per-frame position deltas. But it is dishonest to declare it a distinct
archetype from S1/S2: the dominant on-screen event -- a spring releasing two bodies from rest into
symmetric outward motion -- IS the mirror-recoil pattern already used and already declared as the S1/S2
contrast pair. Adding force-diagram labels on top of an otherwise-identical release does not change what
the eye is drawn to track. Rejected: this would be an undeclared archetype repeat, which Rule 31 forbids
outside the one declared contrast pair.

### Other options assessed and rejected
- **Sweep `mu_s` instead of `F`:** `nlbApplyParam("mu_s", v)` (~L30846-30857) writes every non-ghost,
  non-hanging body's `mu_s` directly, in one pass, with NO mirror dependency at all -- genuinely lag-free.
  But `mu_s` is not a rendered readout key (`nlbWriteReadouts` only accepts `N | f | a | v | T | F_net |
  F_applied` -- no `mu` key) and is not drawn on canvas anywhere, so sweeping it produces ZERO visible
  pixels changing unless it is swept low enough to cross the slip threshold (mu_s times N < F) -- which
  would introduce an unrelated static/kinetic-friction-limit idea into a state whose one job is the
  third-law pair, breaking Rule 31's "ONE idea" constraint. Rejected.
- **Per-phase camera reframing (isolate cart A, then cart B):** `camera_position` is read once per state
  entry (confirmed: every state in this concept sets it once, no per-phase variant exists in the schema
  or the renderer's phase-consumption code) -- not authorable as a within-state, time-driven change. Would
  require an engine addition (a camera analogue of `phases[].glow_focal`). Not pursued for the same
  reason as the ramp fix above.
- **Splitting STATE_4 into 3 states (one camera framing + composition per beat):** would be mechanically
  the safest option of all (ordinary inter-state transitions are the well-proven, always-visible capture
  path every other state in this concept already relies on) but changes the state count and re-opens the
  EPIC-L arc -- an architect-level decision, out of scope for a same-state physics-author fix cycle scoped
  to STATE_4 alone. Noted as a fallback for Fix Cycle 2 if the chosen mitigation below still fails.

### phases[] re-verified: is it malformed, or does the whole build complete before the first captured frame?
Re-verified against the renderer, independent of the earlier Open Item 1c finding (which stands: `phases[]`
only re-times `glow_focal`; `phase_action` has zero consumers -- confirmed again, one assignment site,
no reads anywhere in the file). The DATA MODEL is not malformed and does not "complete before the first
frame": each phase entry is evaluated independently against the CURRENT `eng.t_ms` (~L31596-31611), not
sequentially dependent on an earlier phase having fired first -- so even a single jump straight to a late
`t_ms` correctly resolves to whichever phase's window currently contains it (the last phase, `until_ms:
null`, is always open-ended and will correctly become the active focal at any late instant). What this
means concretely: if THE EYE's captured frames are genuinely pixel-identical from its OWN t=0000 label
through its t=14000 label, the state-local clock `eng.t_ms` that `nlbRunPhases`/`nlbApplyGlow` actually
read must never have advanced past the "cause" window (0-3000/formerly 0-4500 ms) during that capture --
i.e. THE EYE's own labels for those frames do not correspond to the `eng.t_ms` values the phases
mechanism is reading. `nlbApplyGlow()` IS wired into the per-tick path correctly
(`updateNewtonsLawsBodyFrame(dt)` then `applyNewtonsLawsBodyGlow()`, same `heldAtPin ? 0 : dtStep` gate as
every other scenario, ~L36257-36259) and genuinely writes a real opacity delta (arrows are NOT in the
`solidApparatus` brighten-only list, ~L30684-30690, so peers really do dim to `GLOW_DIM_OPACITY` while
the focal brightens) -- so the mechanism is correct in isolation. The most likely remaining explanation,
consistent with everything verified here, is a capture-timing gap of the SAME class the renderer's own
comments already document and patch for OTHER scenarios: the "ACCUMULATOR-FREE FAST-FORWARD" snap
allowlist at `field_3d_renderer.ts` ~L35927 (`config.potential_meaning || scenario_type ===
"parallel_plates" || ... || "pe_external_field"`) lets THE EYE jump straight to a late target instant
instead of crawling there frame-by-frame under headless rAF throttling -- and `newtons_laws_body` (added
2026-07-25, after that allowlist was written) is NOT on it. `nlbRunPhases`/`nlbApplyGlow` are exactly the
accumulator-free shape that list already exists for (pure functions of `eng.t_ms`, no per-frame
trail/rotation to skip), so this would be a narrowly-scoped, low-risk one-line addition if it turns out to
be the cause -- but it is a RENDERER change, not something authorable in this file, and this worktree
cannot dispatch `peter_parker:renderer_primitives` to make it.

### The chosen fix (content-only, within the existing config surface)
Keep the `phases[]`/`glow_focal` reveal-build mechanism -- it is the only mechanism available that (i)
is data-verified correct and lag-free, (ii) does not fabricate motion the equilibrium physics does not
have (every force, position and readout in STATE_4 is HONESTLY constant -- that constancy is the concept),
and (iii) is a genuinely distinct declared archetype ("reveal-build": progressive attention-reveal across
three coexisting forces on a held frame) from S1/S2's declared "mirror-recoil"/translate-through contrast
pair and S3's isolate-compare. **Retimed the three phase boundaries from 0/4500/9000 ms to 0/3000/6000
ms** (applied in section 3's timeline table, Open Item 1(c)'s JSON, and section 8's `field_3d_config`
block above) so all three transitions land inside the FIRST HALF of the state's own narration window,
maximizing the chance any capture mechanism -- crawl or snap -- actually passes through each phase's
boundary rather than needing to reach deep into the state's full ~14-20 s span. Nothing else in STATE_4's
physics, bodies, arrows, readouts, or narration changes.

**Contingency:** if THE EYE, re-run after this retiming, still reports STATE_4 pixel-identical across its
full window, this confirms the capture-timing/fast-forward-allowlist theory above as the actual root
cause. That is a genuine, narrowly-scoped ENGINE GAP -- `newtons_laws_body` missing from the
accumulator-free fast-forward allowlist at `field_3d_renderer.ts:35927` -- owned by
`peter_parker:renderer_primitives`. Since that cluster is undispatchable in this worktree, the concept
must be PARKED at that point rather than patched further as content; do not attempt a third content-only
workaround (e.g. splitting the state) without founder sign-off, since that would silently change the
authored EPIC-L arc to route around a capture-tooling limitation rather than fixing it.

**ENGINE GAP (STATE_4 only, contingent):** none confirmed yet -- retiming is untested. If retiming does
not resolve the pixel-identical finding on re-verification, the gap is: `newtons_laws_body` scenario_type
absent from the accumulator-free fast-forward snap allowlist, `field_3d_renderer.ts` ~L35927,
`peter_parker:renderer_primitives`.


---

## FIX CYCLE 2 -- STATE_4 (mu_s ramp to breakaway; SUPERSEDES the FIX CYCLE 1 retiming, which is dead)

### Verdict on the coordinator's two closing arguments (before the 6-point verification)
Both are accepted as correct, with source/arithmetic backing:
- **Phase-retiming is confirmed dead.** At the OLD boundaries (0/4500/9000 ms) the 1000 ms dense-frame
  cadence already sampled inside all three phase windows (0-4000 in `cause`, 5000-9000 in `own_grip`,
  10000-14000 in `partner`) and all were pixel-identical. Retiming to 0/3000/6000 changes which SAMPLE
  falls in which window, not whether a transition renders anything -- the FIX CYCLE 1 mitigation is
  withdrawn as a non-fix. (Its verified-correct SOURCE analysis of `nlbRunPhases`/`nlbApplyGlow` still
  stands as a true statement about the code; it was the belief that a real opacity change would be
  perceptible/sufficient that was wrong, not the source reading itself.)
- **The state clock is demonstrably not frozen.** S1's t=12000 dense frame showing the fully-recoiled
  position (and S2/S3's analogous positional deltas) proves `eng.t_ms` genuinely advances across this
  exact capture path. This independently confirms Fix Cycle 1's own "phases[] is not malformed" finding
  (both phase entries evaluate correctly against a real, advancing `eng.t_ms`) while closing off the
  fast-forward-allowlist theory as the explanation: if the clock reliably advances for S1/S2/S3 on this
  capture path, it reliably advances for S4 too, and the glow-only defect was never a capture-timing
  problem. **Root cause, now fully understood: a real per-frame opacity/brightness change on an arrow
  is not treated by the capture/diff harness as a delta on the same level as a POSITION change** -- most
  likely because THE EYE's pixel-identity check is comparing at a coarseness, or the dim/brighten swing
  is visually too close to noise-floor at whatever screenshot resolution/compression it uses, to register
  as "different" the way a 200+ px position shift does. Either way: **never author a STATE_4-family state
  whose entire delta is glow-focal alone; pair every taught-variable change with a rendered
  magnitude/position/readout delta.**

### Sanity-check on the founder's own "bounded motion is impossible" reasoning
**Partially correct, and the part that needed correcting is what unlocks this fix.** The founder's
math (needing ~150 kg for a ~0.1 m/s^2 crawl across the full 14 s window) is right for a state that must
travel the WHOLE window without ever clamping. But it does not apply here, because **hitting the track
bound and freezing there for the REMAINder of the window is not itself the defect** -- it is exactly
what S1/S2/S3 already do and THE EYE already accepts (S1's own t=12000 dense frame IS a frozen
fully-recoiled position, evidence the coordinator cited approvingly). The actual defect the founder
correctly identifies is a DIFFERENT failure mode: hitting the clamp so early that almost the entire
window is frozen (their "~2 s then 12 s frozen" example). The fix is not "avoid the clamp" but "make sure
enough DISTINCT dense-frame samples land in the moving window before the clamp." Worked below: with
a=5.00 m/s^2 (S1's own rate, at the existing 6 kg / 30 N), breakaway at t=2498 ms and clamp at t=4230 ms
put a full second-plus of real acceleration inside two 1000 ms-spaced dense samples before the freeze --
proportionally similar to what S1 already does successfully. **Built on:** the founder's reasoning about
NOT needing a 150 kg cart, because the motion here is a short, late-in-the-window burst-then-settle, the
same shape S1 already uses, not a full-window crawl.

### The mu-ramp candidate -- 6-point verification from source

**1. Does `param_ramp` accept `mu_s`/`mu_k` as its target param?** YES, unconditionally. `nlbRunParamRamp`
(~L31090-31111) gates only on `if (!NLB_SLIDER_SPEC[tok]) return;`. `NLB_SLIDER_SPEC` (~L30721-30729)
declares a real `mu_s` entry (`param:"mu_s", min:0, max:1, step:0.05, def:0`) and a real `mu_k` entry
identically shaped -- both pass the gate. `nlbApplyParam` (~L30833-30873) has an explicit branch for
`token === "mu_s" || token === "mu_k"`, so the route is real end-to-end, not merely declared-but-unused.

**2. Which body does a mu ramp write to?** ALL non-ghost, non-hanging bodies, from the identical value,
in one pass (~L30846-30857):
```
else if (token === "mu_s" || token === "mu_k") {
    for (var i = 0; i < eng.order.length; i++) {
        var b = eng.bodies[eng.order[i]];
        if (!b || b.ghost || b.hanging) continue;
        if (token === "mu_s") b.mu_s = value; else b.mu_k = value;
    }
}
```
This is the OPPOSITE of `F`'s driver-only special case -- there is no mirror involved at all, so there is
no lag question to answer here; both bodies are the SAME write, same frame, always in sync BY
CONSTRUCTION. Since A and B share identical mass (6 kg each) and identical `|drive|` (30 N, via the
untouched `F` mirror), both bodies cross the SAME `mu_s` threshold on the exact same frame -- the
breakaway is simultaneous, not asymmetric. (The founder's "your call" on asymmetry does not need
exercising: with matched masses there is no asymmetry to accept or reject.)

**3. Clean breakaway, or chatter around `NLB_STOP_EPS_V`?** Clean, confirmed by the ramp's own
monotonicity, not merely asserted. `stuck = !boundPin && (|v| < STOP_EPS_V) && (|drive| <= maxStat)`
(~L31718). While `mu_s(t)` is falling toward the threshold, `v` stays pinned at 0 the whole time (stuck
branch never integrates), so `|v| < STOP_EPS_V` is trivially always true right up to the flip. The
"un-jitter" guard (~L31730-31733, `if (sign(v0) !== sign(v1) && |drive| <= maxStat) { v1=0; a=0; }`) can
only re-arrest a body if `drive <= maxStat` is STILL true post-flip -- but the ramp only ever moves
DOWNWARD and HOLDS at `to` (never returns toward `from`, per `nlbRunParamRamp`'s own documented
one-shot-monotonic contract), so `maxStat` only ever gets smaller after the flip; `drive <= maxStat`
never becomes true again. No chatter is possible by construction, not just by observation at these
specific numbers.

**4. Does the friction arrow re-render at a shrinking magnitude, and does the glyph flip cleanly?**
**Partial correction to the founder's premise, verified from source:** static friction is REACTIVE
(`f = -drive`, exactly matching whatever `drive` demands, up to the limit) -- it is NOT computed as
`mu_s * N` at every instant, only AT the limit. So the friction arrow does **NOT gradually shrink** while
`mu_s(t)` ramps down and the cart is still stuck; it stays PEGGED at 30 N (L = 1.44 world units) the
entire held beat, then SNAPS to the kinetic value (0 N, since `mu_k` is 0 throughout this concept -> L
floors to the 0.55 stub) in the single frame breakaway occurs. This is a real, large, single-frame
delta (1.44 -> 0.55 world units, arrow shrinks by more than half in one tick) -- clearly detectable, just
discontinuous rather than gradual. The glyph flip (`fs` -> `fk`) happens on the exact same frame as the
magnitude snap, reading the same `_stuck` boolean the HUD row reads (Open Item 1(d), re-verified above)
-- never in disagreement.

**5. Clamp check across the whole ramp.** Held phase: `f = 30 N -> L = 1.44` world units (`0.55-2.80`
band, comfortably clear of both floor and ceiling). Post-breakaway: `f = 0 N -> L` floors to `0.55` (the
arrow never fully vanishes, per `NLB_ARROW_MIN_LEN`'s design intent, but the true value genuinely is
zero -- an honest "friction is now negligible" read, not a misleading nonzero stub). `F_applied` stays
30/-30 N (`L = 1.44`) unchanged throughout, never approaching either clamp. No arrow at any point in this
design collapses into an ambiguous floor-identical stub WHILE STILL CARRYING A DIFFERENT REAL VALUE from
another shown arrow -- the only element that ever sits at the floor is the friction arrow post-breakaway,
and it sits there because the true value is genuinely (not just clamped-to-look-like) zero.

**6. Timing -- worked numbers.**
```
N        = m * g * cos(theta) = 6 * 9.8 * 1        = 58.8 N   (per cart, both identical)
drive    = F_applied                                = 30 N     (constant, both carts, via existing mirror)
mu_crit  = drive / N = 30 / 58.8                     = 0.5102
```
Ramp: `mu_s_from = 0.75, mu_s_to = 0.27, start_ms = 0, end_ms = 5000` (linear, holds at 0.27 after).
```
mu_s(t) = 0.75 - 0.48 * (t / 5000)
breakaway: 0.75 - 0.48*(t/5000) = 0.5102  =>  t = 5000 * (0.75-0.5102)/0.48 = 2498 ms  (~2.5 s)
```
Post-breakaway (mu_k = 0 -> f = 0): `a = F/m = 30/6 = 5.00 m/s^2` (identical magnitude to S1 -- a rate
already proven visible/correct on this exact renderer). Starting position +/-2.5 m, track bound +/-10 m
(distance to bound = 7.5 m):
```
t_bound = sqrt(2 * 7.5 / 5.00) = 1.732 s  =>  absolute clamp time = 2498 + 1732 = 4230 ms  (~4.2 s)
```
Dense-frame check (1000 ms cadence, matching eye-walker's actual sampling):
```
t=1000, 2000 ms : stuck, position 2.50 m fixed, friction arrow 30 N (L=1.44)   -- held beat
t=3000 ms       : broken (since 2498 < 3000), tau=0.502 s, s = 2.5 + 0.5*5*0.502^2 = 3.13 m
t=4000 ms       : tau=1.502 s, s = 2.5 + 0.5*5*1.502^2 = 8.14 m           -- still short of the 10 m bound
t=5000..14000ms : clamped at 10.00 m (bound hit at 4230 ms, before the t=5000 sample)  -- frozen tail
```
This gives THREE distinct, correctly-ordered dense-frame position values (2.50 / 3.13 / 8.14 m) plus the
friction-arrow snap and the F_net readout jump (0.0 -> +/-30.0 N), all inside the first 4 dense samples --
a materially richer and earlier evidence trail than S1's own accepted pattern, landing well before the
state's ~14 s window closes and comfortably before the narration (49 words, ~18-20 s spoken) finishes.

### Verdict: PASSES verification. Chosen STATE_4 config (worked, ready for json_author)
Already written into section 8 above (STATE_4's `newtons_laws_body` block): `bodies[].mu_s: 0.75` (both),
`param_ramp: {param:"mu_s", from:0.75, to:0.27, start_ms:0, end_ms:5000}`, `action_reaction` and
`F_applied` UNCHANGED (30/-30 N, still mirrored, never ramped), `glow_focal: "nlb_arrow_A_friction"`,
one `phases[]` entry (`breakaway` at 2498 ms, `glow_focal: "nlb_arrow_B_applied"`) as an attention cue
riding on top of the real event, `readouts` unchanged (`F_applied, f, F_net` -- now all three carry a
real mid-state delta instead of only `F_applied` being meaningful). Narration rewritten (Open Item 6,
49 words) to describe the held grip, the breakaway, and both carts moving -- the previous 52-word
narration asserted a permanently-static hold and would have visually contradicted this design.

### Why this is not the same "sweep mu_s" option Fix Cycle 1 already rejected
Fix Cycle 1's rejected candidate was a mu_s SWEEP that stays inside the stuck regime purely to see if
anything renders -- it correctly concluded that produces zero pixels unless it crosses the slip
threshold, at which point it "introduces an unrelated friction-limit idea" INTO A STATE NOT DESIGNED
AROUND THAT EVENT. Fix Cycle 2 is a founder-directed redesign of the state itself: the breakaway is now
the declared, narrated, single idea the whole state teaches (via the rewritten narration and delta cue),
not an accidental side effect layered onto the old static-hold narrative. Same underlying mechanism,
deliberately different authoring intent -- not a contradiction.


---

## FIX CYCLE 3 -- STATE_4 bound tail (SumF-vs-formula contradiction; LAST cycle)

### The finding, accepted as reported
eye-walker's candidate `nlb_bound_stop_sigma_f_zeroed_contradicts_shown_formula` (MAJOR) is correct and
reproducible: once both carts clamp at the track bound (~t=4230 ms, confirmed inside the FROZEN H2 pin
at 5500 ms -- the exact frame that gets baseline-locked and the exact frame a teacher pauses on), the
HUD reads F_applied=30.00 N, f_k=0.00 N, F_net(=SumF)=0.00 N, while the on-canvas formula overlay
asserted "Sum F1 = F21 + f1". 30.00 + 0.00 != 0.00 on screen. The physics IS defensible (the track-bound
clamp implies an unmodeled, unshown wall-reaction force that actually brings SumF to zero at rest) but
the renderer never draws or numbers that third force, so the formula as AUTHORED is incomplete for the
post-clamp tail, and peter_parker:renderer_primitives (the only cluster that could add that force/glyph
or stop zeroing SumF post-clamp) is undispatchable in this worktree.

### Candidates re-examined

Coordinator's two ruled-out candidates -- both confirmed correctly rejected, independent re-check:
- Delaying the bound past state end needs a ~200 kg cart at F=30 N to hold a<=0.1 m/s^2 over the ~9.5 m
  to bound in ~14 s -- an invisible-acceleration failure, and it breaks brief section 5's few-kg-cart
  law (this concept's carts are 4-14 kg throughout every other state; a 200 kg outlier on the SAME
  apparatus, same camera, same track would itself be a Rule-32d continuity break, worse than the defect
  it fixes).
- Shortening STATE_4 to end before the bound (~4.2 s) leaves ~12 words of narration budget, well under
  the 25-word floor (Rule 31a) -- and Rule 31 explicitly forbids motion outrunning narration in that
  direction (narration may run LONGER than the visible motion window, per the S1-S3 "brief motion then
  settle" pattern this state already copies -- never the reverse). Confirmed dead.

Candidate (B) -- give the carts nonzero mu_k so the bound is reached well after the 5500 ms pin.
REJECTED, for the reason the coordinator already flagged, independently re-verified with the worked
numbers: mu_k=0.45 -> f_k = 0.45*58.8 = 26.46 N -> net = 30-26.46 = 3.54 N -> a = 3.54/6 = 0.59 m/s^2 ->
bound at t = sqrt(2*7.5/0.59) = 5.04 s past breakaway (2498 ms) = ~7.5 s absolute, comfortably clear of
the 5500 ms pin, and the arithmetic DOES stay honest (30.00 - 26.46 = 3.54, matching a live F_net of
+/-3.54 N). But two independent problems make this worse than the disease it cures:
(i) a 26.46 N friction arrow (1.27 world units) sitting directly beside a 30.00 N applied arrow (1.44
world units) on the SAME cart reads, at a glance, as "these two nearly cancel" -- which is the exact
misconception this state exists to demolish (the drill-down cluster is literally
action_reaction_cancel_fallacy). Introducing a near-cancellation IMMEDIATELY after the real breakaway
undoes the state's own aha in its own tail.
(ii) a 3.54 N net-force arrow, if drawn, computes to 3.54*0.048 = 0.17 world units, clamped up to the
0.55 floor per the arrow-clamp law (constraint block, section 6) -- a floored stub sitting next to two
much longer arrows, visually implying "there is still a real, comparable third force here" when the true
value is a small fraction of either shown force. This matches the concept's OWN constraint block
(section 6, "no arrow may sit at the floor while carrying a materially different real value from
another shown arrow"). Confirmed: (B) is disqualifying, not merely inferior.

### Chosen fix -- Candidate (A), as proposed, verified physics-correct and pedagogically STRONGER than the version it replaces

Decision: drop F_net from STATE_4's readouts, and change STATE_4's formula_overlay from the
same-body decomposition "SumF1 = F₁₂ + f1" to the pair statement "F₂₁ = −F₁₂"
(identical string to S1/S5).

Why this is not a downgrade, re-derived from the concept's own teaching intent (not just "the safest
option"): the state's climax narration line is "Cart two, a different body, accelerates too, proving the
pair never cancelled." The pair being referred to IS F₁₂/F₂₁ -- the third-law equal-and-opposite
force between the two carts (mirrored via action_reaction, confirmed exact +/-30.00 N every frame,
zero drift, every dense sample S4 currently ships -- Fix Cycle 2's own audit). That pair NEVER changes
and NEVER cancels anywhere in this state, held or broken -- it is the one true invariant the whole state
demonstrates start to finish, and F₂₁ = −F₁₂ states exactly that, persistently, on screen the entire
time. The SEPARATE, same-body event (friction locally balancing the push on cart 1, then breaking) is
still fully shown -- F_applied and f are both still live readouts, both still drawn as arrows on cart
1 -- but it is no longer asserted via a THIRD, derived number (F_net/SumF) that the bound-stop clamp
cannot honestly compute past ~4230 ms. The cancellation itself stays directly legible without that
number: during the held beat, F_applied=30.00 and f=30.00 (f_s) are two arrows of IDENTICAL length,
opposite-facing, on the same cart -- eye-walker's own frame-read already describes this exact picture
("both read F=30.00N, f_s=30.00N ... a genuinely legible held-by-grip tableau") as the state's clearest
evidence, with no dependency on a summed number. Post-breakaway, f drops to 0.00 (f_k) while
F_applied stays 30.00 -- the two arrows visibly stop matching, which IS the visible signal that the
grip let go, again with no ΣF number required. Post-clamp (the problem window), F_applied=30.00 N
and f_k=0.00 N remain the only two numbers on screen, and F₂₁ = −F₁₂ is checked against
F_applied alone (still exactly true, every frame, forever, including the frozen tail) -- there is no
longer a number on screen whose arithmetic the formula could ever contradict.

Rejected alternative within (A): keeping the formula as "SumF1 = F₁₂ + f1" (a pure decomposition
LAW, never asserting a live numeric check) while only dropping the F_net readout. Considered and
rejected: Rule 34b/33d requires every symbol named in the on-canvas formula surface to have a
corresponding live numeric readout (the architect DoD symbol-label-table requirement: "a narrated
quantity with no label entry is a Gate 0 FAIL downstream"). SumF1 would be a formula symbol with no
live number anywhere in the state once F_net is dropped -- a new, different Gate-3g-class defect,
self-inflicted by this very fix. The pair-statement formula avoids this entirely: every symbol in
F₂₁ = −F₁₂ (F₂₁ and F₁₂) maps directly onto the two F_applied readouts already shown (m1 and m2
rows), with nothing left undermapped.

### Rule 31 archetype/formula-collision check (founder's explicit ask)
No collision. Rule 31's distinctness requirement is over the declared MOTION ARCHETYPE per state (a
state-level design property: S1/S2 = mirror-recoil/translate-through, declared contrast pair; S3 =
anchor-recoil/isolate-compare; S4 = reveal-build, PASSED as distinct by quality_auditor's Gate 3e/(e)
in the prior cycle, unaffected by this fix -- no motion, timing, body, or control changes here, only a
readout removal and a formula-string swap). The formula_overlay STRING is presentation text, not an
archetype identifier; nothing in Rule 31 or CLAUDE.md constrains formula strings to be unique across
states, and reusing F₂₁ = −F₁₂ on S1/S4/S5 is not itself a defect -- it is, if anything, a
deliberate reinforcement that this ONE invariant (the third-law pair) is what the whole concept keeps
returning to, stated identically every time it is shown. S4 remains pedagogically distinct from S1/S5
via its motion (held-then-breaks vs. immediate release), its narration, its drill-down clusters, and its
SEPARATE F_applied/f same-body readouts -- only the formula overlay text is shared, by design.

STATE_4 still teaches its full payload without the F_net readout: (i) the pair itself, F₂₁ = −F₁₂,
persists exactly, on screen, throughout, resolving action_reaction_cancel_fallacy
("the pair is real and equal-and-opposite, and NEVER goes to zero -- what changed was a DIFFERENT,
same-body force"); (ii) same-body cancellation-then-breakaway is shown directly via two arrows
(F_applied, f) matching then un-matching, satisfying internal_forces_cannot_self_accelerate and
third_law_pair_identification (the state visibly demonstrates the pair and the same-body sum are
DIFFERENT things, which is precisely what those clusters ask a confused student to distinguish).

### Exact spec for json_author (STATE_4 only; already written into section 8 above, restated here for the handoff)

- readouts: ["F_applied", "f"] (was ["F_applied", "f", "F_net"] -- F_net REMOVED).
- formula_overlay: "F₂₁ = −F₁₂" (was "Sum F1 = F21 + f1" -- content change, not just a Unicode
  sweep; supersedes quality_auditor's routed suggestion of "SumF1 = F₁₂ + f1" for this state, per the
  reasoning above).
- No other field in STATE_4's newtons_laws_body block changes: bodies[], mu_s/param_ramp,
  action_reaction, arrows[], glow_focal, phases[], controls_visible all byte-identical to the
  FIX CYCLE 2 spec.
- physics_engine_config (section 1) computed_outputs S4_F_net_held/S4_F_net_post remain valid
  BACKGROUND PHYSICS DOCUMENTATION (the numbers are still true) -- they simply no longer correspond to
  any live on-screen readout; no change needed to section 1's JSON block.

### All five formula_overlay strings -- final, physics-checked, Unicode (Gate 3g / Rule 34c, also closed this cycle)

| State | Final string | Physics check |
|---|---|---|
| S1 | F₂₁ = −F₁₂ | Correct: force on cart 1 by cart 2 = negative of force on cart 2 by cart 1, confirmed exact +/-30.00 N mirror every frame (quality_auditor (b), this cycle's re-check). |
| S2 | |F₂₁| = |F₁₂| ⇒ a ∝ 1/m | Correct: equal-magnitude forces on unequal masses (4 kg / 12 kg) imply acceleration inversely proportional to mass -- matches the state's own 3:1 accel readouts (7.50/2.50 m/s^2), the state's entire payload. |
| S3 | a = F/m → a_wall ≈ 0 | Correct: same F=30 N; wall's effective mass is Earth-scale, so a_wall is nonzero in principle but immeasurably small ("≈ 0" is honest -- not literally 0, avoiding the "force without motion is no force" fallacy the state exists to correct). |
| S4 | F₂₁ = −F₁₂ (CHANGED this cycle, was SumF1 = F₁₂ + f1) | Correct and now contradiction-free at every frame, held or broken or bound-clamped -- see full argument above. |
| S5 | F₂₁ = −F₁₂ | Correct, unchanged: the sandbox is the same action_reaction mirror as S1, teacher-editable but never lagging (F is the driver-only special case but here there is no ramp on it, so it stays exact every frame). |

All five now use real Unicode (subscripts, minus sign, implies-arrow, proportional, right-arrow, approx,
absolute-value bars) -- zero ASCII math tokens (=>, ->, Sum, approx, prop to, bare F21/F12) remain in any
formula_overlay string. Confirms Gate 3g/Rule 34c closed in the same edit that resolves the S4 content
contradiction -- json_author has one JSON edit to make (section 8's block above is already updated to
the final strings), not two separate passes.
