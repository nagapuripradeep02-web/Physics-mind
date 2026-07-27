# PHYSICS BLOCK — `free_body_diagram`

> Stage 2 artifact. Input: `skeleton.md`. Engine: `newtons_laws_body` (field_3d), configuration only.
> `g = 9.8 m/s²` is the engine's hardcoded constant (spec §2). Slider ranges/steps/defaults quoted
> verbatim from the engine's own slider config (`field_3d_renderer.ts` ~30356-30362) — not authorable.
> No value below requires a renderer change.
>
> **Cycle-2 correction (stale-doc pass, post `cd8fe67`):** the concept shipped as 6 states, not the
> 7 states this file originally described — the hanging-body/tension state (old S6, `fbd_isolate`
> variant, `T = mg`) was deleted after cycle-1 review; the old S7 sandbox is STATE_6. S5's incline is
> a fixed `theta_deg: 30`, not an `idle_auto_sweep` 0→30. S3/S4's coast numbers were also re-budgeted
> for camera framing (§3 below) once `RESET_TRAJECTORY` stopped silently no-op'ing the body's clock.
> Every S6-hanging/tension reference below is struck through in spirit and kept only as authoring
> history where it explains a design decision; do not treat it as current.
>
> **Cycle-3 correction (Rule 32d apparatus-scale continuity):** the cycle-2 camera pullback on S3/S4
> to `[0.0, 1.5, 11.0]` fixed the off-canvas coast but left S3/S4 at a visibly different scale than
> the static states (S1/S2/S6 stayed near distance 8), a ~45% apparent-size jump at the S2→S3 seam.
> Cycle-3 unifies EVERY flat-ground state (S1, S2, S3, S4, S6) on ONE camera distance (`8.500`,
> `camera_position: [0.0, 1.3, 8.4]`) and ONE `surface.length_m` (`7`), and nudges S5's incline
> camera onto the same distance (`[0.2, 1.4, 8.382]`, distance ≈8.500) rather than widening the
> whole arc to distance 11 (which would have shrunk every force arrow — this concept is entirely
> about reading force arrows). The coast itself was re-budgeted DOWN instead: `v0` drops from
> `2.0 → 1.0 m/s`, `initial_position_m` from `-10 → -5` (traverse `±5 m` over the fixed 10 s dense
> window), ghost G3 from `-6 → -3` (same 40%-of-the-way fraction), `surface.length_m` from
> `13 → 7`. Every numeric worksheet, framing-arithmetic note, and control-spec row below that
> quotes the old `v0=2.0`/`±10 m`/`length_m=13`/camera-11.10 values is CYCLE-2, superseded — the
> live JSON and the corrected numbers are in §3's "Cycle-3 framing worksheet" further down.

**Engine bug queue consultation:** DB not reachable from the authoring context (read-only). Consulted the
committed scar surface the architect already applied (`docs/loop_runs/lom/_engine/scar_candidates.sql`,
phase0 report §5/§7) — per-state side-on camera, short single-line formulas, `phases[]`/cue timing,
specific glow ids, own body id for the hanging body, `surface.hidden` for S6. All satisfied below.
FLAG to quality_auditor: confirm no additional FIXED rows landed for `alex:physics_author`/`alex:json_author`
since 2026-07-25.

## 1. Variable declarations

All variables map 1:1 to the engine's closed `controls_visible` enum (`m|m2|F|theta|mu_s|mu_k|v0`);
ranges/steps/defaults are the engine's own slider config.

| symbol | name | unit | min | max | step | default | notes |
|---|---|---|---|---|---|---|---|
| `m` | mass of body A (or H) | kg | 0.5 | 10 | 0.5 | **2** | maps to engine param `mass_a` = first non-ghost body in state's authored `bodies[]` order. Used every guided state. |
| `m2` | mass of second body | kg | 0.5 | 10 | 0.5 | 4 | **unused** — this concept never authors a 2nd non-ghost body (no `connected_atwood`); `m2` row stays reserved/hidden the whole concept, never in any state's `controls_visible`. |
| `F` | applied force | N | −20 | 20 | 0.5 | 0 | S4 override `5.880` (exact `μₖ·m·g` balance); S6 default 0, idle-swept 0→8. |
| `theta` | incline angle | ° | 0 | 60 | 1 | 0 | S5 override: fixed `theta_deg: 30` (**cycle-2 correction:** no longer an `idle_auto_sweep` 0→30 — the state authors the tilt already at its taught value). All other states `theta_deg: 0`. |
| `mu_s` | static-friction coefficient | (none) | 0 | 1 | 0.05 | 0 | S5 override `0.70` (margin over `tan 30° = 0.5774`). |
| `mu_k` | kinetic-friction coefficient | (none) | 0 | 1 | 0.05 | 0 | S4 override `0.30`. |
| `v0` | initial velocity | m/s | −5 | 5 | 0.5 | 0 | S3 override `2.0` (`initial_velocity_mps`), carried into S4 for glide continuity (Rule 32d). |
| `g` | gravitational acceleration | m/s² | — | — | — | **9.8 (engine constant)** | hardcoded in the integrator, not a JSON variable — declared here for the `constraints` block. |

**Per-state variable_overrides** (only where they differ from the row defaults above):
- **S3**: `v0: 1.0` (**cycle-3**, was `2.0`), `mu_s: 0`, `mu_k: 0` (or `surface.frictionless: true`) — the "moving needs no force" beat requires a genuine zero-friction glide. **Cycle-3** (supersedes cycle-2): `initial_position_m: -5` (was `-10`, and `-2` before that), `surface.length_m: 7` (was `13`, and `22` before that), `camera_position: [0.0, 1.3, 8.4]` (distance 8.500 — was `[0.0, 1.5, 11.0]`, and `[0.0, 1.2, 8.5]` before that) — see §3's cycle-3 framing worksheet. Ghost G3 `initial_position_m: -3` (was `-6`).
- **S4**: `mu_k: 0.30`, `F: 5.880` (= `μₖ·m·g` at `m=2`, unaffected by v0), `v0: 1.0` (carried, **cycle-3**) — locks the exact balance; a default `F=0` would leave the block decelerating, breaking "balanced pair at constant v." **Cycle-3**: same `initial_position_m: -5`, `surface.length_m: 7`, `camera_position: [0.0, 1.3, 8.4]` as S3 (Rule 32d — shared apparatus/camera, now identical to S1/S2/S6 as well).
- **S5**: `mu_s: 0.70`, `theta_deg: 30` fixed (**cycle-2 correction:** no sweep — see theta row above).
- **S6** (was S7 before the tension state's deletion renumbered it): no overrides — every variable at its published default; `idle_auto_sweep: {param:'F', range:[0, 8]}` (range[0] = the state's own `F=0`, so frame 1 doesn't step).

**Cycle-2 struck:** the old S6 hanging-body state's `m: 2.0` defensive override (for the "N becomes T"
S2↔S6 payoff) no longer exists — that state was deleted; tension is deferred to a dedicated
`tension_in_string` concept.

## 2. Formulas — the small set this concept renders

| formula | exact `#nlb_formula` line (Unicode, Rule 34c) | carried by state |
|---|---|---|
| weight | `mg` (label only, no equation surface — S1 is the hook) | S1 |
| Normal, flat | `N = mg` | S2 |
| net force, coasting | `ΣF = 0` | S3 |
| applied = kinetic friction | `F = fₖ` | S4 |
| Normal, incline | `N = mg·cos θ` | S5 |
| along-slope component | *(shown as a labeled dashed arrow via `show_components`, not a second formula surface — Rule 34b: ONE formula per state)* | S5 (visual only) |
| second law, general | `ΣF = ma` | S6 |
| static-friction bound | `fₛ ≤ μₛN` | *(constraint only — never on-canvas; verified numerically in the S5 worksheet)* |
| kinetic friction | `fₖ = μₖN` | *(constraint only — the S4 rendered form is `F = fₖ`; `fₖ=μₖN` is prose narration)* |

## 3. Per-state numeric worksheet (4 s.f., `g = 9.8`)

**S1 — `fbd_isolate` (hook):** m = 2.000 kg → `mg = 19.60 N` (drawn at the END of the beat only, per the
reveal timeline). No readouts, no formula surface. G1/G2 ghosts carry no numbers (never integrated).

**S2 — `rest_equilibrium`:** m = 2.000 kg (default).
`mg = 2.000 × 9.8 = 19.60 N`. Flat (θ=0): `N = mg·cos 0° = 19.60 N`.
`ΣF = N − mg = 19.60 − 19.60 = 0.000 N` → net arrow **hidden** (magnitude 0.000 N < `NLB_ARROW_EPS = 0.05`).
Readouts: `N = 19.60 N`, `F_net = 0.00 N`.

**S3 — `coast_no_force`:** m = 2.000 kg, v0 = 1.000 m/s (**cycle-3**, was 2.000), frictionless (μₛ=μₖ=0), θ=0.
`drive = F_applied − mg·sin 0° = 0 − 0 = 0.000 N`. `|v| = 1.000 m/s > STOP_EPS_V (0.01)` → kinetic branch:
`f = −sign(v)·μₖN = 0` (μₖ=0). `a = (drive + f)/m = 0.000 m/s²`. `v` stays exactly **1.000 m/s** — genuine
constant velocity, zero force. `F_net = 0.00 N` → net arrow hidden. Ghost G3 (frozen, dimmed 0.40,
positioned at `-3` m, **cycle-3**, was `-6` m) never updates — its position is the "should have
stopped" reference frame, still 40% of the way from the new start `-5` m to the track centre `0`
(the same fraction the cycle-2 ghost held relative to its `-10` m start).

**Cycle-3 framing worksheet (S3/S4 coast, replaces the cycle-2 `-10`-start / distance-11.10 numbers
— SUPERSEDES the cycle-2 note kept below for the calibration history it still explains).** Eye-walker
flagged the cycle-2 fix itself as a Rule 32d regression: pulling only S3/S4 back to distance 11.10
left them visibly larger-scaled than the static states (S1/S2/S6 sit near distance 8), a ~45%
apparent-size jump at the S2→S3 seam. Rather than widen the WHOLE arc to distance 11 (shrinking every
force arrow — this concept is entirely about reading force arrows), the coast travel is re-budgeted
DOWN to fit inside the tighter frame the static states already use.

Unified camera for every flat-ground state (S1, S2, S3, S4, S6): `camera_position: [0.0, 1.3, 8.4]`,
`distance = √(1.3² + 8.4²) = √(1.69 + 70.56) = √72.25 = 8.500` exactly. Using the same calibration
constant derived in cycle-2 (`s_occlusion ≈ 1.397 × distance`, from the Playwright projection probe
against the real renderer — see the cycle-2 note below for the derivation), the occlusion onset at
distance 8.500 is `1.397 × 8.500 ≈ 11.87 m`.

`s(t) = s₀ + v₀t` with `v0 = 1.000 m/s` (down from 2.000) and `s₀ = -5.000 m` (up from `-10.000 m`)
gives `s(10) = -5.000 + 1.000×10 = +5.000 m` — a clean, symmetric `±5 m` traverse about the track
centre over the same fixed 10 s dense window, same "start left of centre, cross the frame, end right
of centre" shape, just a tighter traverse to match the tighter frame.

`surface.length_m` moved to `7` (bound at `±7 m`). Margins at distance 8.500:
- **occlusion margin** = `11.87 − 5.000 = 6.87 m` (≈137% of the 5 m half-travel — very comfortable,
  larger margin than the cycle-2 arrangement had).
- **bound margin** = `7 − 5.000 = 2.000 m` (40% of the 5 m half-travel, ≈29% of the 7 m bound).

S5's incline camera is nudged from `[0.2, 1.4, 8.2]` (distance 8.32) onto the same distance:
`[0.2, 1.4, 8.382]` → `√(0.2² + 1.4² + 8.382²) = √(0.04 + 1.96 + 70.258) = √72.258 ≈ 8.500`. S6's
sandbox camera is likewise unified from `[0.0, 1.3, 9.0]` (distance 9.09) to `[0.0, 1.3, 8.4]`
(distance 8.500). **Residual scale change across every seam in the 6-state arc, S1 through S6, is
now 0%** — the whole arc reads as one persistent piece of equipment (Rule 32d).

**Cycle-2 framing worksheet (S3/S4 coast, superseded by cycle-3 above — kept for the calibration
derivation it still explains).** THE EYE's dense capture window is a fixed 10 s regardless of
authored narration length. Camera: `camera_position` lies in the y-z plane (x=0) looking at the
world origin, so a body's screen x-position (NDC) is exactly linear in its physical position for a
fixed camera distance: `ndc_x(s) = (s × NLB_WORLD_PER_M) / (distance × tan(30°) × aspect)`, with
`NLB_WORLD_PER_M = 0.5`, `aspect = 1280/720`, giving `ndc_x(s) ≈ (0.5×s) / (distance × 1.0267)`.
Calibrating against the OLD camera `[0.0, 1.2, 8.5]` (`distance = 8.585`) and the reported occlusion
onset `s ≈ 12 m` (a fixed-position right-side `#nlb_formula`/`#nlb_readout` DOM overlay, independent
of camera zoom, not the true camera frustum edge — verified separately by Playwright projection
probe against the real renderer: the true geometric frustum edge at that camera was `s ≈ 17.5 m`,
i.e. well past the reported occlusion) gives an occlusion-threshold NDC ≈
`(0.5×12)/(8.585×1.0267) = 0.681`. Solving `s_occlusion = 0.681 × distance × 1.0267 / 0.5 ≈ 1.397 ×
distance` is the calibration constant reused directly in the cycle-3 worksheet above. The cycle-2
choice — pulling the camera back to `[0.0, 1.5, 11.0]` (distance 11.10, `s_occlusion ≈ 15.5 m`) while
keeping the `±10 m` / `v0=2.0` travel — is no longer the live configuration; cycle-3 replaces it.

**S4 — `coast_with_friction`:** m = 2.000 kg, v0 = 1.000 m/s (carried, **cycle-3**, was 2.000), μₖ = 0.30, θ=0. Same
`s₀ = -5.000 m` → `s(10) = +5.000 m` traverse and same unified camera as S3 (Rule 32d — shared
apparatus/camera between the two coast states, now identical to S1/S2/S6 as well).
`N = mg = 19.60 N`. `fₖ = μₖ·N = 0.30 × 19.60 = 5.880 N`.
Set `F = 5.880 N` exactly. `drive = F − mg·sin 0° = 5.880 N`. `vSign = sign(v) = +1`, `f = −vSign·μₖN = −5.880 N`.
`a = (drive + f)/m = (5.880 − 5.880)/2.000 = 0.000 m/s²`. `v` holds at **1.000 m/s**. `a = 0` here is
set entirely by the `F = fₖ` balance (μₖ, m, g) and is independent of `v0`/`s₀` — confirmed unaffected
by the cycle-3 position/camera change (kinetic friction magnitude depends only on μₖ, N; not on speed).
Readouts: `F_applied = 5.88 N`, `f = 5.88 N` (equal, opposite arrows), `F_net = 0.00 N`.

**S5 — `incline_decompose`:** m = 2.000 kg, μₛ = 0.70, `theta_deg: 30` fixed (**cycle-2 correction:**
no longer an `idle_auto_sweep` 0°→30° — the state authors the tilt already at its taught value; the
checkpoints below remain useful as the DERIVATION proof that the static hold is safe across the
whole 0°–30° range the formula covers, not a description of an on-screen animated sweep).
`mg = 19.60 N` constant throughout. Checkpoints:

| θ | cos θ | sin θ | N = mg·cos θ | mg·sin θ (drive) | μₛ·N (max static) | holds? |
|---|---|---|---|---|---|---|
| 0° | 1.0000 | 0.0000 | 19.60 N | 0.000 N | 13.72 N | yes (0 ≤ 13.72) |
| 10° | 0.9848 | 0.1736 | 19.30 N | 3.402 N | 13.51 N | yes |
| 20° | 0.9397 | 0.3420 | 18.42 N | 6.703 N | 12.89 N | yes |
| 30° | 0.8660 | 0.5000 | 16.97 N | 9.800 N | 11.88 N | yes (9.800 ≤ 11.88, margin 2.08 N) |

Static-hold proof: `μₛ = 0.70 > tan 30° = 0.5774`, and `tan θ` is monotonic increasing on [0°,30°], so the
worst case is θ=30° — checked above with margin. `a = 0.000 m/s²` at every sample (static branch:
`|drive| ≤ maxStatic`). Reported friction magnitude equals the drive it balances:
`fₛ(30°) = 9.800 N ≤ μₛN = 11.88 N` ✓ (constraint satisfied, never at the limit).
Readout: `N` only (falls 19.60 → 16.97 N live — the S5 misconception counter).

**Cycle-2 struck — S6 hanging (body H):** the cycle-1 hanging-body/tension state (`T = mg = 19.60 N`,
the "table's N becomes string's T" S2↔S6 payoff) was deleted after cycle-1 review; tension is
deferred to a dedicated `tension_in_string` concept. The old S7 sandbox is renumbered STATE_6 below.

**S6 — `sandbox`:** all variables at published default — m=2.000 kg, F=0.000 N, θ=0°, μₛ=0, μₖ=0, v0=0.000 m/s.
At entry: `mg=19.60 N`, `N=19.60 N`, `ΣF=ma=0.000 N`, `a=0.000 m/s²`. `idle_auto_sweep {param:'F', range:[0,8]}`
— a 4000 ms triangle from 0→8 N and back, giving `a = F/m` up to `8/2.000 = 4.000 m/s²` at the peak
(μ=0 default, so `drive=F` exactly) until a trusted slider/drag seizes control (Rule 37).

## 4. Within-state motion / reveal timeline (Rule 26/31/32 — phase-fraction timing, never `*_at_ms`)

| S | t-window (phase) | what animates | driven by | duration |
|---|---|---|---|---|
| S1 | phase `dim` (0 → ~40%) | G1, G2 ghosts fade to 0.40 opacity around static A (`isolate-dim`) | scenario_cue, pure fn of state clock | ~4–5 s |
| S1 | phase `weight_draw` (~40% → 100%, ≥0.5–1 s AFTER dim settles — Rule 32a gap) | `weight` arrow on A draws from 0 to full length (`mg=19.60 N`) | fixed `mg` | continues to state end |
| S2 | phase `normal_draw` (0 → ~35%) | `normal` arrow on A draws to `19.60 N` (cause: contact is named) | `N` computed | ~4–5 s |
| S2 | phase `weight_present` (parallel, apparatus already home-posed) | `weight` arrow static at `19.60 N` (already drawn from S1's home pose — Rule 32d) | fixed | — |
| S2 | continuous, after both arrows settle (~0.5–1 s gap, Rule 32a) | `net` arrow attempted at `ΣF`, evaluates to 0 → stays hidden; `N`, `F_net` readouts update live | computed `ΣF` | rest of state |
| S3 | 0 → 100% (10 s dense window, **cycle-3**: `s₀=-5 → s(10)=+5`, see §3 cycle-3 framing worksheet) | A translates at constant `v0=1.0 m/s` (`translate-through`), ghost G3 frozen mid-track at `-3` m (never moves — it IS the counter-example, dimmed from t=0) | `s = s₀ + v₀t` | ~10 s |
| S3 | continuous | `v`, `F_net` readouts hold at `1.0 m/s` / `0.00 N` throughout — the delta IS the absence of change | computed | whole state |
| S4 | 0 → 100% (cause-then-effect: `applied` arrow draws first, `friction` answers ~0.5–1 s later — Rule 32a, and this is the declared S3/S4 contrast; **cycle-3**: same `s₀=-5 → +5` traverse and unified camera as S3) | A continues the same glide (home pose from S3); `applied` arrow grows to `5.88 N`, then `friction` arrow grows to `5.88 N` opposing it | `F` (set), computed `fₖ` | ~10 s |
| S4 | continuous | `F_applied`, `f`, `F_net` readouts — `F_net` holds `0.00 N` once both arrows settle | computed | whole state |
| S5 | 0 → 100% (**cycle-2 correction:** the surface is fixed at `theta_deg: 30` for the whole state, not an animated 0°→30° sweep) | `weight` arrow stays vertical (never rotates — the S5 aha) at the tilted home pose while its dashed `sin`/`cos` components draw in ~0.5–1 s after state entry (Rule 32a); `normal` arrow settles at `16.97 N`, visibly below the S2 baseline of `19.60 N` | `theta_deg` fixed, component reveal via engine mode | ~4–5 s |
| S5 | continuous | `N` readout is the live numeric instrument reading `mg·cos 30° = 16.97 N` (Rule 33) — below the S2 baseline IS the misconception counter | computed `N` | whole state |
| S6 | open, continuous, never auto-freezes (Rule 37) | all arrows + `show_components` live-redraw every frame from current slider/drag state; `idle_auto_sweep` on `F` runs a 4000 ms triangle until a trusted input seizes | `m,F,theta,mu_s,mu_k,v0` (ALL, live) | open |

**Cycle-2 struck:** the old S6 hanging-body `support_swap`/`tension_draw` phase rows (table absent
from frame 1, `tension` arrow draw to `19.60 N`) no longer apply — that state was deleted; the old
S7 sandbox row above is renumbered STATE_6.

## 5. Per-state control spec (Rule 31 — closed enum `m|m2|F|theta|mu_s|mu_k|v0`)

| S | `controls_visible` | validated against closed enum |
|---|---|---|
| S1 | *(none)* | — matches architect table's `—` |
| S2 | `["m"]` | ✓ |
| S3 | `["v0"]` | ✓ |
| S4 | `["F"]` | ✓ |
| S5 | `["theta"]` | ✓ |
| S6 | `["m","F","theta","mu_s","mu_k","v0"]` | ✓ ALL six — `m2` correctly excluded (no 2nd non-ghost body ever exists in this concept) |

**Cycle-2 struck:** the old S6 hanging-body row (`["m"]`, targeting body H) no longer applies — that
state was deleted; the old S7 sandbox row above is renumbered STATE_6.

Slider rows for every token this concept ever uses (`m,F,theta,mu_s,mu_k,v0`) are built once and shown/hidden
per state (engine-level, no authoring needed); `m2`'s row stays reserved/hidden the entire concept.

## 6. Physical constraints / correctness guards

1. `N = mg·cos θ` — **not** `N = mg` — whenever `θ ≠ 0` (S5); a state that shows `N = mg` on a tilted surface is a physics error.
2. On a `hanging: true` body, `N ≡ 0` and `f ≡ 0` by construction — these readouts are suppressed, never printed as `0.00` (phase0 §5 fix). **Cycle-2 struck:** this concept no longer authors any `hanging: true` body (the tension state was deleted) — item kept as a general engine fact for future retrofits, not a live constraint here.
3. A body at rest reports `fₛ`, a body in kinetic motion reports `fₖ` — never conflate; S5 is static (`fₛ`), S4 is kinetic (`fₖ`), both must satisfy their bound: `fₛ ≤ μₛN` (checked at every S5 sample, never at the limit) and `fₖ = μₖN` exactly (S4: `5.880 = 0.30 × 19.60`).
4. The `net` arrow must be a **genuine** zero (`|ΣF| < NLB_ARROW_EPS = 0.05 N`), never a small non-zero residue that draws a stub — S2/S3/S4/S5 all verified at exactly `0.000 N`.
5. Ghost bodies (`ghost: true`, S1's G1/G2 and S3's G3) are never integrated — position/opacity fixed for the whole state; never a slider target (`nlbSliderBodies()` skips ghosts).
6. `hanging` is constant per body id across every state it appears in. **Cycle-2 struck:** this concept's only body is `A` (never hanging) — the earlier hanging body `H` no longer exists here (deleted with the tension state).
7. `w = mg` and `g = 9.8 m/s²` (engine constant) hold in every state; mass and weight are never treated as the same quantity in narration.
8. **Cycle-2 addition:** a guided state's authored coast/travel must fit THE EYE's fixed 10 s dense capture window inside the state's `camera_position` frame — budget travel against 10 s, not against narration length; verify with a real camera-projection check (see §3 framing worksheet), not hand-waved trig.
9. **Cycle-3 addition (Rule 32d):** every flat-ground state's `camera_position` must resolve to the SAME distance (and the SAME `surface.length_m`) so the apparatus reads as one persistent piece of equipment across the whole arc — never fix an occlusion finding by pulling back only the offending state(s); re-budget the travel/coast numbers to fit the shared frame instead, and re-derive the occlusion/bound margins at that shared distance (see §3 cycle-3 framing worksheet).

## 7. Drill-down cluster phrasings (5 real student-voice phrases each)

**`fbd_which_forces_to_include`**
- "do I draw the push force too"
- "why not include the force I'm applying with my hand"
- "should air resistance go on the diagram"
- "why isn't the weight of my hand on the block's FBD"
- "do I draw forces on things touching it or just on it"

**`third_law_pair_on_same_diagram`**
- "why isn't the reaction force on my diagram"
- "table pushes back so why only one arrow"
- "shouldn't both forces of the pair show up"
- "where did the other half of newtons third law go"
- "if every force has a pair why does the FBD only have one"

**`internal_forces_cancel_out`**
- "why don't the forces inside the block count"
- "does gravity on each atom show up separately"
- "why is it just one weight arrow not a thousand tiny ones"
- "do internal forces between the block's own parts matter"
- "why don't forces the block exerts on itself appear"

**`normal_not_equal_mg`**
- "why is N not just mg here"
- "isn't normal force always equal to weight"
- "why did N get smaller when nothing changed but the tilt"
- "shouldn't the table always push back with the full weight"
- "why does tilting the surface change N if mass didn't change"

**`which_angle_gets_cos`**
- "why is it cos theta and not sin theta for N"
- "how do I know which one gets sin and which gets cos"
- "why does the along-slope part use sin"
- "I keep mixing up which component is cos and which is sin"
- "is there a rule for cos vs sin on an incline"

**`choosing_tilted_axes`**
- "why do axes tilt with the incline"
- "why not just use normal horizontal and vertical axes"
- "who decided the x axis runs along the slope"
- "does the direction of the axes actually matter"
- "why does tilting the axes make the problem easier"

---

**DC Pandey check:** consulted only for Laws of Motion table-of-contents scope (confirms FBD as its own
sub-topic) — no formula, numeric example, or derivation imported from any book; every number above was
derived from `N = m·g·cos θ`, `f ≤ μN`, and `ΣF = ma` directly against the engine's own integrator (spec §2)
and slider config.
