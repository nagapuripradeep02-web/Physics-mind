# PHYSICS BLOCK — `work_energy_theorem` (ch6 concept #4)

> Input: `skeleton.md` (CYCLE 1, Checkpoint A CLOSED at `DESIGN_OK`, cycle 1 of 2 spent) +
> `founder_proxy_A_cycle2.md` (the closing report, carry-forwards CF-1/CF-2/CF-3/CF-4) +
> `founder_proxy_A.md` (cycle 0, `DESIGN_FIX`, the reasoning behind every design decision) +
> `docs/loop_runs/ch6_state.md` (SEAM K/L/M/N — the authoritative engine contract, supersedes any
> renderer line-number literal in the skeleton). Author: `alex:physics_author`. Renderer: `field_3d` /
> `newtons_laws_body` + the Phase-0c ENERGY LAYER. **Design is settled — this block adds physics rigor,
> not redesign.** Modes required by the DoD: **EPIC-L only.** Conceptual-only (Rule 20 [D]) — no
> `mode_overrides`, no board mark scheme, no competitive overrides. Output section 4 below is therefore
> deliberately empty.
>
> **CF-1 and CF-3, addressed directly to this stage, are both applied — see §6 CALLOUT-1 (CF-1) and the
> corrected reflow paragraph in §6 CALLOUT-2 (CF-3).**

## VERDICT LINE

**Every load-bearing number in the skeleton's arithmetic was independently re-derived in Python before
a single word of narration was written (§1 sanity table + §9) — S1 through S6, every pin, every margin,
the S6 envelope corners, the discrete S2 rest frame (n = 62, t = 1.0333 s). All matched the skeleton to
the last printed decimal. Nothing in this block refutes the skeleton's physics.** One arithmetic slip
was caught and corrected in my own working (an early S5 pin-frame displacement subtraction), never
reaching this document — recorded in §9 so the check is auditable rather than asserted.

Both carry-forwards are discharged: **CF-1** (the `scrollWidth <= clientWidth + 1` overflow assertion)
is folded into the RISK-A probe in §6 CALLOUT-1. **CF-3** (the stale "≥ 573 px / ≤ 557 px" two-class
boundary) is corrected everywhere this block restates the reflow paragraph — the single corrected
boundary is **≥ 558 px** (545.6 + 12), one content class, never repeated as two.

---

## 0. Engine bug queue — consulted live this dispatch

Run against the live table, not the skeleton's cached dump:

```
npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts --owner alex:physics_author   (10 rows)
npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts work_energy_theorem              (15 rows)
```

All 15 concept-scoped rows are the identical set the skeleton's §0 already read and dispositioned
(cross-checked row by row — same `bug_class` strings, same status). No new row has landed since
Checkpoint A closed. The two with direct physics-author consequence, restated for this stage:

| bug_class | applies here as |
|---|---|
| `calculator_dom_harvest_needs_symbol_and_value_in_ONE_text_node_so_the_energy_panel_is_invisible` (MAJOR/OPEN, names this concept) | THE CALCULATOR's channel B **has landed** (skeleton §0 row 41, F8 in Checkpoint A cycle 1). Discharged in §9 below: every harvestable numeral (`pull` / `friction` / `net` / `K`) gets a `computed_outputs` formula ground truth. **A SKIP is not a pass** — §9 states explicitly, per state, which numerals are harvestable and which are hand-verified instead. |
| `nlb_work_bar_glow_ids_never_light_behind_the_energy_prefix_gate` (MAJOR/OPEN, names this concept) | Binding: **zero `glow_focal`** authored anywhere (skeleton §3, Rule 32e), and **no `tts_sentences[].glow` names a `work_bar_*` id** anywhere in §7. Every glow below resolves to `nlb_body_cart`, `nlb_arrow_cart_applied`, `nlb_arrow_cart_friction`, `energy_panel`, `energy_bar_K`, `displacement_vector`, or `checkpoint_1` — the seven ids that actually light. |

The other 13 rows are DIRECTIVE-owner `alex:architect` (already discharged by the sealed skeleton — home
poses inset from the track bound, checkpoint arithmetic, motion-archetype declarations, the reflow
uniformity fix, the frozen-pin margins) or `peter_parker:field3d_surgeon`/`visual_validator`
engine-owned rows this concept inherits without triggering (multibody lane stacking — N/A, single body;
work-probe globals disagreeing on multibody states — N/A, single body; the checkpoint capture-overshoot
CRITICAL is already FIXED). None forces an exception in this block. `concept_ships_zero_narration_glow_bindings`
(from the `--owner` query) is satisfied: every one of the 23 `tts_sentences` in §7 carries a `glow`.

---

## 1. `physics_engine_config`

```json
{
  "variables": {
    "m": {
      "name": "cart mass",
      "unit": "kg",
      "min": 2,
      "max": 6,
      "default": 4,
      "step": 1
    },
    "F": {
      "name": "applied pull, magnitude",
      "unit": "N",
      "min": 0,
      "max": 30,
      "default": 20,
      "step": 5
    },
    "v0": {
      "name": "launch speed at the state's own start (signed)",
      "unit": "m/s",
      "min": 0,
      "max": 4,
      "default": 0,
      "step": 1
    },
    "v": {
      "name": "speed",
      "unit": "m/s",
      "min": -5,
      "max": 5,
      "default": 0,
      "derived": "the integrator's own live value; only S6 exposes a v0 slider, which SEEDS v -- no slider anywhere in this concept writes v directly thereafter"
    },
    "g": {
      "name": "gravitational acceleration",
      "unit": "m/s^2",
      "constant": 9.8
    },
    "mu_k": {
      "name": "coefficient of kinetic friction (S2, S3, S6 only)",
      "unit": "",
      "min": 0,
      "max": 1,
      "default": 0
    },
    "mu_s": {
      "name": "coefficient of static friction (authored equal to mu_k, S2/S3/S6 only)",
      "unit": "",
      "min": 0,
      "max": 1,
      "default": 0
    },
    "d": {
      "name": "displacement from the state's own initial_position_m",
      "unit": "m",
      "min": 0,
      "max": 12,
      "default": 0,
      "derived": "s(t) - initial_position_m; rendered as the d arrow's value only in S3, S5, S6"
    },
    "K": {
      "name": "kinetic energy",
      "unit": "J",
      "min": 0,
      "max": 340,
      "derived": "0.5 * m * v * v"
    }
  },

  "formulas": {
    "the_theorem": "W_net = delta K = half m v^2 minus half m v0^2 -- the ONE idea this concept teaches (every state)",
    "derivation_chain": "W_net = m a d, and v^2 = v0^2 + 2 a d, therefore W_net = half m v^2 minus half m v0^2 -- S5's derivation, checked by the stamp",
    "pull_work_constant_force": "W_pull = F d -- valid whenever F is a constant force, even through a velocity reversal (S4 -- constant-force work is path-independent, it depends only on net displacement)",
    "friction_work": "W_friction = -mu_k * m * g * d -- valid because the cart never reverses direction while friction acts anywhere in this concept (S2, S3, S6), so d equals the distance actually slid",
    "s3_exact_balance": "F = mu_k * m * g = 19.6 N exactly, so a = 0 identically, so W_net = 0 identically (S3)"
  },

  "computed_outputs": {
    "K_J": "0.5 * m * v * v",
    "W_net_J": "0.5 * m * v * v - 0.5 * m * v0 * v0",
    "W_pull_J": "F * d",
    "W_friction_J": "-1 * mu_k * m * g * d"
  },

  "constraints": [
    "W_net = delta K = half m v^2 minus half m v0^2 at every instant, in every state of this concept -- this is the theorem itself, not a special case",
    "when exactly one force acts on the body, that force's own work equals the net work exactly (S1, S2, S4, S5 -- each authors ONLY a net accumulator for this reason)",
    "for a CONSTANT force, W = F times the net displacement, regardless of any velocity reversal in between (S4 -- work is path-independent for a constant force)",
    "kinetic friction's work is never positive while the body slides, and holds at its last value once the body is at rest (S2, S3, S6)",
    "kinetic energy K = half m v^2 is never negative; the net-work bar CAN be negative -- K and W_net are different kinds of quantity read on different instruments",
    "g = 9.8 m/s^2 (constant, NLB_G); every surface in this concept is flat, so no angle enters any formula and gravity does identically zero work throughout"
  ]
}
```

**Contracted config-key map** (json-author writes these under `newtons_laws_body`, not
`physics_engine_config`'s own names):

| Quantity | Contracted key | Notes |
|---|---|---|
| `F` | `bodies[].applied_force: { N, angle_deg: 0 }` | SEAM N key, angle_deg authored explicitly at 0 (never omitted) so entry never jumps. Omit the whole key on S2 (no pull authored at all -- see section 2). |
| `m` | `bodies[].mass_kg` | Independent of the S6 slider default; every guided state authors its own value explicitly (section 2). |
| `mu_s`, `mu_k` | `bodies[].mu_s`, `bodies[].mu_k` | S2, S3, S6 only, authored EQUAL (never mu_k greater than mu_s). |
| `v0` | `bodies[].initial_velocity_mps` | Signed. S4 is the one negative value (-3). |
| frictionless | `surface.frictionless: true` | S1, S4, S5 only. Never author on S2, S3, S6 -- it hard-zeroes mu_s/mu_k at read time. |
| `d` | `displacement_vector: { body_id: cart, label: d, show_value: true }` | S3, S5, S6 only (DoD b). Drawn from initial_position_m. |
| `K` (bar) | `energy_layer: { bars: [K], bar_max_J, precision: 1 }` | Every state, no body_ids (single body, aggregate = the one body). |
| `W` (bars) | `work_accumulators` + state `work_scale_J` | force from the CLOSED enum applied/friction/normal/net; label verbatim single words (CALLOUT-2). S1/S2/S4/S5: net only. S3/S6: applied + friction + net. |
| flag | `checkpoints` | S5 only, one checkpoint (CALLOUT-3). |
| HUD | `readouts` | see section 3 exact per-state readout list. |
| sliders (S6 only) | `slider_controls: { F, m, v0 }` | F min 0 max 30 step 5 default 20; m min 2 max 6 step 1 default 4; v0 min 0 max 4 step 1 default 0 (F4 fix -- no negative launch reachable). Key is literally "default", never "def". |

No `radians()` anywhere in this JSON, by construction. `surface.theta_deg = 0` in every state and
no `angle_arc`/`F_ang` is authored anywhere (the LABELLING SCHEME, section 6 CALLOUT-4), so no formula
in this concept ever takes an angle argument. A `radians(` anywhere in the emitted JSON is a bug.

### Numerical sanity check -- independently re-derived in Python, agrees to every printed decimal

All arithmetic below was computed from Newtonian kinematics directly (never copied from the skeleton),
then compared. Every figure matched. (Full script output in section 9.)

| State | Inputs | My derivation | Skeleton |
|---|---|---|---|
| S1 | m=5, v0=0, F=10, s0=-5.4, R=2000 | a=2.0, d(R)=4.0 -> s=-1.4, v=4.0, K=40.0 J, W=40.0 J | 40.0 / 40.0 OK |
| S2 | m=5, v0=4, mu=0.4, s0=-5.4, R=2100 | a=-3.92, t_stop=1.020408 s, d_stop=2.040816 m -> s=-3.359184, discrete rest n=62 -> t=1.033333 s, W=f*d=-40.0 J (also equals -half m v0 squared exactly) | 2.041 / 1.033 / -40.0 OK |
| S3 | m=5, v0=2.5, F=mu*m*g=19.6 exactly, s0=-5.4, R=2000 | a=0 exactly, d(R)=5.0 -> s=-0.4, W_pull=+98.0, W_fric=-98.0, K=15.625 flat | 5.0 / 98.0 / 15.6 OK |
| S4 | m=4, v0=-3, F=+12, s0=+1.6, R=2600 | a=+3.0, turn at t=1.0 s (s=+0.1); at t=2.6 s: v=+4.8, s=+3.94, K=46.08, W_net=28.08, dK=46.08-18.0=28.08 | 0.1 / 4.8 / 3.94 / 46.08 / 28.08 OK |
| S5 | m=5, v0=2, F=5, s0=-5.4, R=2400 | a=1.0, flag at d=2.0 -> s_m=-3.4, t_flag=0.828427 s, K_flag=20.0, K0=10.0, W_flag=10.0; at R=2.4 s: v=4.4, s=2.28, K=48.4, W=38.4 | -3.4 / 0.828 / 20.0 / 10.0 / 48.4 / 38.4 OK |
| S6 worst corner | m=2, F=30, v0=4, mu=0.3, span=12.0 | K_wrap=16+24.12x12=305.44 J, W_pull=360.0 J, W_fric max 211.68 J (heaviest-mass corner), W_net max 289.44 J | 305.44 / 360.0 / 211.7 / 289.4 OK |
| S6 default | m=4, F=20, v0=0, mu=0.3, span=12.0 | a=2.06, K_wrap=98.88 J, W_pull=240.0, W_fric=-141.12, W_net=98.88 | 98.9 / 240 / -141.1 / 98.9 OK |

The one thing I add, not refute: S6's worst-K corner (lightest mass, m = 2) and worst-friction corner
(heaviest mass, m = 6) are DIFFERENT corners -- friction work scales with mass while K at fixed F/v0/span
is decreasing in mass. The skeleton's 211.7 J friction bound already uses the correct (heaviest-mass)
corner; each ledger is checked at its OWN worst case, and the two corners not matching is expected, not
a contradiction.

### S3's exact balance -- stated, not merely asserted

`F = mu_k * m * g = 0.4 x 5 x 9.8 = 19.6` is exact in real arithmetic, but IEEE-754 double arithmetic
renders it as `19.600000000000005`. The residual force is approximately 4e-15 N, giving a residual
acceleration of approximately 8e-16 m/s^2 -- invisible at `precision: 1` and inside the engine's own
`-0.000` clamp (SEAM L, `precision` field). Over the 2000 ms loop this integrates to a position drift on
the order of `1e-21` m, immeasurably below any rendered digit. S3's "exact balance" is exact for every
purpose this sim can display; the float residue is real but far below anything the -0.0 clamp does not
already absorb.

---

## 2. Per-state variable overrides (`variable_overrides` and their justification)

The `newtons_laws_body` scenario seeds every body from that state own `bodies[]` block -- Bug #1
(`default_variables_only_first_var_merged`) applies directly: a state that omits a value falls back to
the concept default, and in every state below except the S6 default that default is WRONG.

| State | Explicit per-state value | Why it MUST be authored, not inherited |
|---|---|---|
| S1 | mass_kg 5, initial_velocity_mps 0, applied_force N=10 angle_deg=0, surface.frictionless true, initial_position_m -5.4 | The m variable own default (4, the S6 slider default) is WRONG for S1 -- inheriting it silently changes S1 K peak from 40.0 J to a different number and desyncs every downstream margin. |
| S2 | mass_kg 5, initial_velocity_mps 4, applied_force key OMITTED entirely (no pull), mu_s 0.4, mu_k 0.4, surface.frictionless OMITTED, initial_position_m -5.4 | If applied_force is inherited from any prior state residue it silently adds a pull to a state whose whole claim is friction alone, corrupting the -40.0 J reading. frictionless true here would hard-zero mu_s/mu_k and the crate would never slow -- the state entire picture, silently false. |
| S3 | mass_kg 5, initial_velocity_mps 2.5, applied_force N=19.6 angle_deg=0, mu_s 0.4, mu_k 0.4, surface.frictionless OMITTED, initial_position_m -5.4 | F must equal mu_k times m times g to the displayed precision or the exact-balance constant-speed claim breaks visibly (the crate would drift). This is the state the misconception confrontation depends on -- a wrong F silently deletes the whole state point. |
| S4 | mass_kg 4, initial_velocity_mps -3, applied_force N=12 angle_deg=0, surface.frictionless true, initial_position_m +1.6 | Both the SIGN of v0 and the non-default mass_kg 4 (the only state at 4 kg, not 5) are load-bearing: a missing minus sign deletes the reversal, and an inherited m=5 moves K0 from 18.0 J to 20.0 J and desyncs every number in section 1 sanity table. initial_position_m is POSITIVE here (+1.6), the one state where it is -- inheriting -5.4 puts the reversal outside the drawn floor. |
| S5 | mass_kg 5, initial_velocity_mps 2, applied_force N=5 angle_deg=0, surface.frictionless true, initial_position_m -5.4 | checkpoints[].s_m is computed from THIS state initial_position_m (CALLOUT-3) -- any drift in the seed silently moves the flag off the -3.4 m arithmetic and the stamp no longer matches the formula surface. |
| S6 | mass_kg 4, initial_velocity_mps 0, applied_force N=20 angle_deg=0, mu_s 0.3, mu_k 0.3, surface.frictionless OMITTED, initial_position_m -5.4, slider_controls F/m/v0 all min_ring core | This concept authors zero angles anywhere (LABELLING SCHEME, section 6 CALLOUT-4) -- there is no F_ang control and no angle_arc in this concept. S6 own body seed MUST equal the sliders own default values (F=20, m=4, v0=0) or the first frame disagrees with the knob positions -- the second live instance in this concept of the default_variables_only_first_var_merged bug class (the first is every guided state m). |

`surface.frictionless: true` is REQUIRED on S1, S4, S5 and FORBIDDEN on S2, S3, S6. Omitting it on
S1/S4/S5 makes the cart decelerate and every constant-net-work-then-derivation claim in the narration
false on screen; authoring it on S2/S3/S6 hard-zeroes the mu_s/mu_k the state whole picture depends on.

`work_accumulators`, `energy_layer`, `work_scale_J`, `bar_max_J` per state (the concept own section-1
invariant -- every state authors BOTH blocks, mechanically greppable):

| State | work_accumulators (force -> label) | work_scale_J | bar_max_J |
|---|---|---|---|
| S1 | net -> "net" | 55 | 55 |
| S2 | net -> "net" | 55 | 55 |
| S3 | applied -> "pull", friction -> "friction", net -> "net" | 110 | 55 |
| S4 | net -> "net" | 40 | 55 |
| S5 | net -> "net" | 55 | 55 |
| S6 | applied -> "pull", friction -> "friction", net -> "net" | 400 | 340 |

`precision: 1` on every state energy_layer. `loop_reset_ms`: 2000 / 2100 / 2000 / 2600 / 2400 on S1-S5;
none on S6 (the SEAM J sandbox wrap is the loop, cited at source L48204-05 in the skeleton section 0,
and re-verified independently in Checkpoint A cycle 2 F3/F4).

---

## 3. Within-state motion timeline + per-state control spec (Rule 31 -- REQUIRED)

Every branch is a pure function of `time - stateStartTime` (Rule 26). No `pause_after_ms`, no
`wait_for_answer`, no prediction beat -- new concept, no legacy Socratic timing carried.
`advance_mode`: `manual_click` on S1-S5, `interaction_complete` on S6 (2 distinct modes, Gate 12
satisfied). Rule 37 makes S6 free-run forever with no extra authoring.

### Control spec -- zero sliders on S1-S5 is why every peak is exactly determined

| State | Live control(s) | controls_visible | Verified against |
|---|---|---|---|
| S1 | none | [] | section 1 sanity table row S1 |
| S2 | none | [] | section 1 sanity table row S2 |
| S3 | none | [] | section 1 sanity table row S3 |
| S4 | none | [] | section 1 sanity table row S4 |
| S5 | none | [] | section 1 sanity table row S5 |
| S6 | F [0,30,step 5,default 20], m [2,6,step 1,default 4], v0 [0,4,step 1,default 0] | [F, m, v0] | section 1 sanity table S6 rows (default + worst corner) |

Load-bearing, do not improve: zero sliders on S1-S5 is exactly why every K/W peak in section 1 is
exactly determined, why every frozen-pin margin in the skeleton DoD (d) table is provable, and why the
overflow warn is unreachable on every guided state (peak/scale ratios: S1 72.7 percent, S2 72.7 percent,
S3 89.1 percent, S4 70.2 percent, S5 69.8 percent -- all under 100 percent). Adding a slider to any
guided state breaks all three at once (the seized-slider bug class, section 0).

### The motion timeline

| State | t-window | What animates -- pure function of the state clock | Driven by | Live controls |
|---|---|---|---|---|
| S1 | 0-2000 ms, forever | Cart accelerates from rest under a steady 10 N pull, frictionless, from s=-5.4; crosses to s=-1.4 by the loop reset; loop_reset_ms=2000 rewinds and it crosses again identically | v(t) = 2.0t | none |
| S1 | continuous | The net work bar and the K bar climb TOGETHER, 0 to 40.0 J each, every frame -- the same numeral on two different instruments | W_net(t) = K(t) | none |
| S2 | 0-1033 ms | Cart launched at 4 m/s onto a rough floor (mu=0.4) with no pull; friction arrow points backward against the still-forward motion; net bar dives 0 to -40.0 J as K falls 40.0 to 0.0 J | v(t) = 4 - 3.92t | none |
| S2 | 1033-2100 ms | Cart at rest at s=-3.359; friction arrow hides (a real zero hides, never a stub); net bar HOLDS at -40.0 J, K HOLDS at 0.0 J -- the closing claim, and what the 1260 ms frozen pin photographs | rest-hold, v=0 | none |
| S2 | loop reset | At t=2100 ms rewinds and re-launches at 4 m/s; every cycle replays identically | loop_reset_ms=2100 | none |
| S3 | 0-2000 ms, forever | Cart coasts at a CONSTANT 2.5 m/s (a=0 exactly, F=mu*m*g=19.6 N balances friction exactly); crosses s=-5.4 to -0.4; d arrow grows the whole time | s(t) = -5.4 + 2.5t | none |
| S3 | continuous | THREE work bars run at once and NOTHING else changes: pull climbs 0 to +98.0 J, friction dives 0 to -98.0 J, net sits PARKED on the zero line at 0.0 J the whole loop -- while K holds flat at 15.6 J and the crate visibly crosses the floor | three simultaneous ledgers | none |
| S4 | 0-1000 ms | Cart (4 kg) launched LEFT at -3 m/s against a steady +12 N pull, frictionless, from s=+1.6; it SLOWS: net bar dives 0 to -18.0 J exactly as K falls 18.0 to 0.0 J at the turn (s=+0.1) | v(t) = -3+3t | none |
| S4 | 1000-2600 ms | Cart accelerates back RIGHT; K refills 0 to 46.1 J as the SAME net bar climbs back through zero to +28.1 J at t=2600 ms (v=+4.8, s=+3.94) -- one loop equals fall, turn, refill | v(t) = -3+3t (same law, no branch) | none |
| S4 | loop reset | At t=2600 ms rewinds to s=+1.6, v=-3 and replays identically | loop_reset_ms=2600 | none |
| S5 | 0-828 ms | Cart accelerates from 2 m/s under a steady 5 N pull, frictionless, from s=-5.4; net bar climbs continuously as K climbs from 10.0 J | v(t) = 2+t | none |
| S5 | approximately 828 ms, one-shot, LATCHES | Cart crosses the flag at s=-3.4 (d=2.0 m); the stamp reading flag colon W net equals 10.0 J, K equals 20.0 J lands beneath the formula surface and holds to the end of the state | crossing detector, capture order W then K | none |
| S5 | 828-2400 ms | Cart keeps accelerating past the flag; at R=2400 ms, v=4.4, K=48.4 J (the concept own K peak), net=38.4 J -- what the 1440 ms frozen pin photographs mid-flight (past the flag, still climbing) | v(t) = 2+t | none |
| S5 | loop reset | At t=2400 ms rewinds to s=-5.4, v=2 and the stamp clears -- the next cycle re-crosses and re-stamps identically | loop_reset_ms=2400 | none |
| S6 | continuous, free-running (Rule 37) | Teacher drags F, m, v0 live; all three arrows, three work bars and K re-derive every frame; on wrap v re-seeds to the current v0, every ledger re-zeroes, d re-anchors -- the loop IS the wrap, not an authored loop_reset_ms | F, m, v0, drag | ALL (F, m, v0) |
| S6 | drag gesture | Dragging the crate REPOSITIONS AND STOPS it (v=0) -- the honest way to park it and read K fresh | trusted drag | drag |

### Rule 32 audit

- 32a (cause before effect). The cart motion IS the cause throughout -- work accumulates only as the
  cart covers distance, so the bars are readings that follow the motion continuously, never events that
  could race it. S5 is the one true cause-then-effect chain and it obeys 32a with a measured gap: the
  cart crosses the flag first (approximately 828 ms), the stamp lands after (crossing-detector latency,
  one frame at most) -- a readable, not simultaneous, sequence. S3 carries an argued exemption: the
  pull, the friction and the net bars are all continuous functions of the SAME clock as the cart motion
  -- there is no delay mechanism to author and none could exist, because none of the three is triggered
  by another; they are three simultaneous readings of one physical situation. Narration order carries
  the intended readability instead: S3 sentences name the pull first, friction second, the net
  conclusion third, so the teacher words run cause then confrontation then resolution even where the
  pixels are simultaneous by physics.
- 32b (only the taught variable moves). S1/S2/S4/S5: one force (or none), one bar, position is the only
  thing that changes. S3: THREE bars move together because THREE ledgers are the state content -- still
  nothing else changes (v is pinned at 2.500000000, camera and apparatus fixed). S6 is explore-exempt.
- 32c (delta cue 5 words or fewer). Two bars, one number (4). Negative net work: K falls (5). Net zero:
  K constant (4). Measured from the start (4). Derived from F = ma (5). Change force, mass, speed (4).
  All within budget (verbatim from the sealed skeleton, section 7 below).
- 32d (home-pose continuity). ONE body id, cart, blue hex 42A5F5, across all six states. Camera
  [0, 2.0, 10] never moves (single body throughout -- nothing new to frame). The energy panel bars can
  never move screen position between states -- SEAM L re-orders bars into its own fixed panel order and
  the panel DOM is built once.
- 32e (one focal). ZERO glow_focal at state level, in all six states -- argued: every state claim is a
  RELATION between a work bar (or bars) and the K bar; a state-level focal would dim half the relation
  it exists to show. Emphasis is carried entirely by the per-sentence tts_sentences glow in section 7,
  exactly one id at a time. Because no state authors a focal, glowActive stays false under THE EYE
  (which never posts SET_GLOW), so the frozen baselines see the undimmed picture.

### arrows.show and HUD readouts per state (DoD a/b)

| State | arrows.show | readouts |
|---|---|---|
| S1 | [applied] | [v] |
| S2 | [friction] | [v, f] |
| S3 | [applied, friction] | [v, F, f] |
| S4 | [applied] | [v] |
| S5 | [applied] | [v, a] |
| S6 | [applied, friction] | [v, F, f] |

No `normal` arrow anywhere in this concept (not part of the DoD drawn-object list for any state -- the
normal force is not this concept content). No weight arrow anywhere (LABELLING SCHEME, section 6
CALLOUT-4).

---

## 4. Board-mode mark scheme + derivation sequence -- DEFERRED

SKIPPED deliberately. The conceptual-only directive (Rule 20 [D]) is active: no `mode_overrides`, no
board mark scheme, no `derivation_sequence`, no competitive overrides. The DoD requires EPIC-L only.
json-author must neither skip a required mode nor half-build a deferred one -- for `work_energy_theorem`
there is exactly one mode, and this section is empty by instruction, not by omission.

---

## 5. Drill-down cluster phrasings (5 real student phrases per cluster)

Six clusters, all from skeleton section 6. Plain English, real student voice, no Hinglish, no teacher
register.

### S3 -- applied_work_vs_net_work
- isnt the pulls work the real work here
- why doesnt the 98 joules count as the answer
- the force did work so why is the energy not changing
- if the pull did positive work why does k stay the same
- why is only the net work important and not each force

### S3 -- pulling_but_speed_constant
- if im still pulling why isnt it speeding up
- constant speed but a force is acting how
- why does the crate not accelerate even though something pushes it
- equal forces cancel but the pull still did work right
- how can speed stay the same with a force on it

### S3 -- zero_net_work_while_moving
- zero work but the thing is still moving how
- can something move a lot and still have zero work done on it
- moving 5 metres but net work is 0 doesnt make sense
- if net work is zero shouldnt it be standing still
- hows zero net work possible when the crate clearly moved

### S4 -- forgot_initial_kinetic_energy
- why cant i just use the final speed for the work done
- why do i need the starting speed too
- isnt net work just half m v squared at the end
- why subtract the starting energy from the final one
- i keep forgetting the initial ke in this formula

### S4 -- negative_then_positive_net_work
- how can net work go from negative to positive in the same run
- does the sign of work flip when the cart turns around
- why is net work negative first and then positive later
- can work done change sign partway through the motion
- the net went from minus to plus what does that mean

### S4 -- net_work_when_body_reverses
- what happens to net work exactly when the speed is zero
- does the theorem still work when the object turns around
- is there some special rule for when velocity reverses
- why does the formula still work through the turning point
- at the exact moment it stops and reverses whats the net work

---

## 6. Constraint callouts -- the special-case encoding json-author must get right

### CALLOUT-1 -- CF-1 discharged: the RISK-A probe gains an explicit overflow assertion

The F1 structural guarantee (single-word captions means line count is 1 by construction, Checkpoint A
cycle 2) protects PANEL HEIGHT, not caption WIDTH. A word that exceeds its slot overflows horizontally
rather than wrapping -- a legibility defect the line-count guarantee does not catch. RISK-A (the
skeleton own probe) now additionally asserts, at each of iframe heights 551, 720 and 911:

```
for each state, for each .nlb_en_sym caption element (K, pull, friction, net):
  assert element.scrollWidth <= element.clientWidth + 1
```

`friction` is the widest authored caption (8 characters). At ladder step 0 or 1 (the only steps
reachable at 551-911 px, per Checkpoint A own measured thresholds) it clears with margin; only ladder
step 2 (reachable below roughly 451 px, outside the observed 551-911 range) is marginal, and it is
almost certainly unreachable at any teacher-visible iframe height. Run this assertion alongside the
panel-header and track-height assertions already specified in the skeleton RISK-A.

### CALLOUT-2 -- CF-3 discharged: the corrected reflow paragraph (single content class)

Every state in this concept authors single-word work-bar captions (pull, friction, net -- never a
phrase), so all six states share IDENTICAL panel content geometry -- there is only ONE content class,
not two. The panel bottoms at 545.6 px at ladder step 0 for every state; the fit ladder steps down to
`trk: 138` (step 1) whenever the iframe height falls below 545.6 + 12 = 558 px -- a SINGLE boundary.
(The stale two-class boundary a pre-fix draft once carried -- "step 0 at iframe 573 px or above, step 1
at 557 px or below" -- belonged to a DIFFERENT content case, a two-line caption, and must never be
repeated here.) Binding consequences, restated for json-author: (a) no narration, caption, title or aha
may compare bar HEIGHT across states -- the work bars and the K bar are different instruments within a
state (signed mid-zero vs bottom-zero, different scales), and W_net = delta K is always read from the
NUMERALS, fills as reinforcement only; (b) the standing probe: at iframe heights 551, 720 and 911, every
state `.nlb_en_trk` computed height is IDENTICAL across all six states -- never assert a particular
value (551 legitimately lands on the step-1 rung, 720 and 911 on step 0).

### CALLOUT-3 -- S5 checkpoint is authored as arithmetic, never as a literal

```json
"checkpoints": [{
  "s_m": -5.4 + 0.9183673469,
  "label": "flag",
  "body_id": "cart",
  "capture": ["W", "K"],
  "capture_mode": "first"
}]
```

Emit -3.4 in the JSON, computed as `initial_position_m + d_target` in the authoring working (the
checkpoint-arithmetic prevention rule, section 0). d_target = 2.0 m is chosen so the crossing time
(0.828 s, 34.5 percent of R=2400 ms) clears the 0.55R loop-guard margin with room to spare.
`capture: ["W","K"]` in this ORDER is what produces the exact engine stamp text
`flag:  W net = 10.0 J  ·  K = 20.0 J` (the engine composes "W " plus the accumulator label plus " = "
plus the value for every captured work accumulator, then "K = " plus the value; since S5 authors exactly
ONE work accumulator -- net -- the stamp contains exactly one W part).

### CALLOUT-4 -- the LABELLING SCHEME (the W collision, resolved by rule; carried verbatim from skeleton section 1)

`W` means WORK and only work, everywhere: (1) the symbol `W` appears in exactly two places -- formula
surfaces (`W_net = delta K`, etc.) and S5 checkpoint stamp; (2) work bars never carry the symbol `W` --
they are captioned with a plain-English single word (pull, friction, net); (3) no weight arrow is
authored in any state (every surface is flat, gravity does identically zero work, weight ink would be
untaught clutter); (4) force-arrow labels use the engine default symbolic strings, read at source
(`NLB_ARROW_DEFAULT_LABELS`, `field_3d_renderer.ts` L40433-35): applied maps to "F", friction maps to
"f", normal maps to "N" (unused here), tension maps to "T" (unused), weight maps to "mg" (unused, per
point 3), net maps to the sigma-F symbol (this concept never draws a net-FORCE arrow -- net names only a
WORK BAR caption, never an arrow); (5) no reader-facing string, in any language, ever uses `W` for
weight.

### CALLOUT-5 -- the boundary invariant with concept #3, mechanically greppable (skeleton section 1, restated)

Every state of `work_energy_theorem` authors BOTH a non-empty `energy_layer.bars` (exactly `["K"]`) AND
at least one `work_accumulators` entry. On screen this makes the panel engine-composed header read
"Energy and work bars" (`nlbEnergyPanelLabel`, only taken when both blocks exist -- never taken by
`kinetic_energy_definition`, which authors zero `work_accumulators`, or by `work_done_by_constant_force`
/`positive_negative_zero_work`, which author zero `energy_layer`). CF-2 correction (from Checkpoint A
cycle 2, carried here so json-author does not re-derive it): the header is a UNION over ALL states
(`nlbEnergyPanelLabel` reads every state authored blocks, not just the current one) -- so a per-state
omission does NOT change the panel self-name on screen. The visible tell of a missing block on one state
is the missing "Work done" (or K) SECTION inside that state panel, not a changed header. The invariant is
therefore enforced by the grep json-author is held to (every state JSON authors both blocks), never by a
screen check of the header text.

### CALLOUT-6 -- friction declared by name, per state

`surface.frictionless: true` on S1, S4, S5. S2, S3, S6 OMIT it and author `mu_s`/`mu_k` explicitly (S2:
0.4/0.4; S3: 0.4/0.4, with F = 19.6 exactly; S6: 0.3/0.3).

### CALLOUT-7 -- arrow-length floor compliance, checked per state

(`NLB_ARROW_SCALE = 0.048`, `NLB_ARROW_MIN_LEN = 0.55`, `NLB_ARROW_MAX_LEN = 2.80`, read at source)

| State | Force | World length = clamp(F times 0.048, 0.55, 2.80) | At the floor? |
|---|---|---|---|
| S1 | applied 10 N | 0.48 clamped to 0.55 | yes, at the floor (declared, no ratio claimed anywhere in this concept) |
| S2 | friction 19.6 N | 0.9408 | no |
| S3 | applied equals friction, 19.6 N each | 0.9408 both -- equal length is true and IS the state point | no |
| S4 | applied 12 N | 0.576 | just above the floor |
| S5 | applied 5 N | 0.24 clamped to 0.55 | yes, at the floor, direction cue only |
| S6 | applied 0-30 N (slider) | 0 (hidden at F=0) up to 1.44 at F=30 | never past the floor clamp band below F about 11.46 N; never approaches the 2.80 ceiling |

No state anywhere claims an arrow-LENGTH ratio between two different force magnitudes except S3, where
the two forces are numerically equal (19.6 N each) and render at the identical 0.9408 length -- a true
statement, not a floor artifact.

### CALLOUT-8 -- no h_ref_m, no height_markers, no sum_merge, no phases, no angle_arc, no param_ramp

Every surface is flat, so gravitational PE is identically zero and never discussed (`h_ref_m` not
authored, default 0). Zero angles anywhere (CALLOUT-4). No spring, no pulley, no multi-body (`body_ids`
never authored on `energy_layer` -- single body, aggregate reading is what every state wants).

### CALLOUT-9 -- the left edge belongs to the combined panel

This concept combined energy-and-work panel is, per the skeleton own section 10(h), the tallest
left-edge overlay in the fleet to date (K group plus up to 3 work-bar groups). No other left-edge
overlay may be authored on any state. HUD, formula surface and slider rows sit in their fleet-standard
right/bottom zones (Rule 34d corners reserved).

### CALLOUT-10 -- every tts_sentences entry carries a valid glow

Valid ids in this scenario: `nlb_body_cart` (matched on ud.id), `nlb_arrow_cart_applied`,
`nlb_arrow_cart_friction`, `checkpoint_1` (S5 flag group ud.id), and the DOM ids `energy_bar_K` and
`energy_panel` (carried by `nlbEnergyApplyGlow`), plus `displacement_vector` (S3/S5/S6). Never
`work_bar_applied` / `work_bar_friction` / `work_bar_net` -- declared-but-unreachable behind the
`energy_*` prefix gate (section 0). Never a bare HUD row id (`nlb_ro_*`) -- those are DOM rows the glow
pass cannot reach; a binding there is a silent no-op that dims everything and lights nothing.

---

## 7. Narration -- teacher_script.tts_sentences

Rule 31a word budget, machine-counted on `text_en` (Python regex word count, script and full output in
section 9): S1 55, S2 49, S3 50, S4 55, S5 55, S6 27 (explore, exempt). Every guided state is inside the
hard 25-55 range and is exactly 4 sentences. S1 (55) and S2 (49) exceed the skeleton own suggested
per-state band (30-45) -- declared, not accidental: S1 must carry the PRIMARY aha itself plus two Block-1
prerequisite-cliff patch clauses (for concepts 1 and 3) plus the misconception planting flag ("only one
force acts, so its work is the whole net work") -- four obligations in one state; the same precedent
that let `kinetic_energy_definition` S3 run to 50 against a 30-45 suggestion applies here. S2 carries one
cliff clause (for concept 2) plus both readings at rest -- three obligations at 49 words is the honest
floor. S3, S4 and S5 land at or under the top of their own 40-55 bands with no deviation needed.

Rule 30i: `text_hi` authored, `text_te` NOT authored. Hindi is text-only, never voiced. Code-mix per
Rule 30b/c/e -- technical and English terms stay Latin script, nothing transliterated, bare symbols
expanded to spoken names, colour words stay English (this concept names no colours in narration).

Rule 41 sweep, run mechanically over all 23 sentences: zero occurrences of drains, lost, goes, carries,
grip, ceiling, fate, budges, rides on, lurches, wants, knows, answers, wins. Nothing personified -- the
crate moves, slows, stops, turns; the bar climbs, dives, holds, sits; forces point and act, never want
or give back. "Net work", "kinetic energy", "friction" are physics vocabulary, not jargon (41b) -- each
is the exact word the formula uses.

Dual-label at first appearance (Rule 38d): none needed in this concept -- every symbol used (K, W_net,
delta K, v, v0) is engine-fixed and already introduced by prerequisite concepts 1 through 3; no
board-divergent term (cell vs battery, p.d. vs voltage) arises anywhere in this concept content.

### STATE_1 -- 55 words, 4 sentences (PRIMARY aha)

| # | text_en | glow |
|---|---|---|
| s1_1 | A ten newton pull acts on this crate -- the only force, so its work is the whole net work. | nlb_arrow_cart_applied |
| s1_2 | The work bar climbs as the pull acts over distance -- force times metres. | energy_panel |
| s1_3 | The K bar reads the crate kinetic energy -- the energy a moving body has. | energy_bar_K |
| s1_4 | Both bars climb together and meet at forty joules. | energy_panel |

text_hi: "इस crate पर दस newton का एक pull लगता है -- यह अकेला force है, इसलिए इसका work पूरा net work है। Work bar
उतना ही चढ़ता है जितनी दूरी तक pull काम करता है -- force गुणा metres। K bar crate की kinetic energy दिखाता है -- वह
energy जो एक चलती हुई body के पास होती है। दोनों bars साथ चढ़ते हैं और चालीस joules पर मिलते हैं।"

Block-1 cliff clauses honoured (both, non-condescending, both early in S1): clause for concept 1 missing
-- sentence 2, "the work bar climbs as the pull acts over distance -- force times metres" (verbatim per
the skeleton Block 1 patch). Clause for concept 3 missing -- sentence 3, restating that a moving body has
kinetic energy. Misconception-planting flag honoured (sentence 1, verbatim): "only one force acts, so
its work is the whole net work" -- this is the clause S3 confronts one state later.

### STATE_2 -- 49 words, 4 sentences

| # | text_en | glow |
|---|---|---|
| s2_1 | The crate is already moving at four metres per second, and only friction acts. | nlb_arrow_cart_friction |
| s2_2 | Friction points against the motion, so its work counts negative. | energy_panel |
| s2_3 | The net bar dives below zero as the K bar falls toward zero. | energy_bar_K |
| s2_4 | The crate stops: net holds at minus forty joules, K at zero. | energy_panel |

text_hi: "Crate पहले से ही चार metres per second की speed से चल रही है, और सिर्फ friction काम कर रही है। Friction
motion के खिलाफ point करती है, इसलिए इसका work negative गिना जाता है। Net bar zero से नीचे गिरता है जैसे K bar भी
zero की तरफ गिरता है। Crate रुक जाती है: net minus चालीस joules पर रुकता है, K zero पर।"

Block-1 cliff clause honoured (verbatim, sentence 2): "friction points against the motion, so its work
counts negative" -- the concept-2-missing patch clause.

### STATE_3 -- 50 words, 4 sentences (SUPPORTING aha + Rule 16a beat)

| # | text_en | glow |
|---|---|---|
| s3_1 | The pull and friction are equal, nineteen point six newtons, and the crate coasts. | nlb_arrow_cart_applied |
| s3_2 | The pull bar climbs to ninety-eight joules of real work. | energy_panel |
| s3_3 | Friction bar dives to minus ninety-eight, so the two cancel to zero. | energy_panel |
| s3_4 | Only the net counts: the K bar holds flat at fifteen point six joules. | energy_bar_K |

text_hi: "Pull और friction बराबर हैं, उन्नीस point six newtons, और crate coast करती है। Pull का bar अट्ठानवे joules
के असली work तक चढ़ता है। Friction का bar minus अट्ठानवे तक गिरता है, तो दोनों cancel होकर zero बनाते हैं। सिर्फ net
गिनती में आता है: K bar पंद्रह point six joules पर flat रहता है।"

Rule 16a delivery, straightforward contrast beat (matches skeleton section 4 verbatim): belief -- the
pull work becomes kinetic energy; visual_counter -- the pull bar climbs to +98.0 J (the number the
belief tracks) while the K bar holds 15.6 J without moving and the net bar sits on its zero line;
one_line_fix -- "only the net work changes kinetic energy -- add the works with their signs first."
Sentences 2, 3 and 4 render the FULL confrontation in order (pull positive number, friction cancelling
negative, the K bar stillness) -- no ghost-bar primitive needed here because the concept own three-bar
panel renders the wrong expectation tracked quantity (98.0 J) directly alongside the flat reality
(15.6 J).

### STATE_4 -- 55 words, 4 sentences (misconception confrontation)

| # | text_en | glow |
|---|---|---|
| s4_1 | This cart starts backward at three metres a second, pulled by twelve newtons. | nlb_body_cart |
| s4_2 | As it slows, net dives to minus eighteen joules when K reads zero. | energy_panel |
| s4_3 | It turns and speeds up: K reaches forty-six point one, net plus twenty-eight point one. | energy_panel |
| s4_4 | Two nonzero numbers: net measures the change from the start, not the final energy. | energy_panel |

text_hi: "यह cart पीछे की ओर तीन metres per second से शुरू होती है, बारह newtons से खींची जाती है। जैसे यह धीमी होती
है, net minus अट्ठारह joules तक गिरता है जब K zero दिखाता है। यह पलटती है और तेज़ होती है: K छियालीस point one तक
पहुँचता है, net plus अट्ठाइस point one तक। दो non-zero numbers: net शुरुआत से बदलाव मापता है, आखिरी energy को नहीं।"

Rule 16a delivery, matches skeleton section 4 verbatim (F5, Checkpoint A cycle 0): belief -- net work
equals the final half m v squared; visual_counter -- at the end of the run the K bar reads 46.1 J while
the net bar reads +28.1 J, two different nonzero numbers on one screen, the change is 46.1 minus 18.0
equals 28.1 measured from the starting 18.0 J; one_line_fix -- "W_net equals half m v squared minus half
m v0 squared, the change, not the final value." The turn instant (sentence 2, K=0 with net=-18.0) is the
SIGN beat only -- S2 held rest pose already renders K=0.0 beside a nonzero net bar, so it cannot alone
carry this confrontation; sentence 4 lands the contrast at the loop end, exactly as F5 specifies.

### STATE_5 -- 55 words, 4 sentences

| # | text_en | glow |
|---|---|---|
| s5_1 | A five newton pull speeds up this cart from two metres a second. | nlb_arrow_cart_applied |
| s5_2 | Net work, mass times acceleration times distance, equals the change in kinetic energy. | energy_panel |
| s5_3 | At the flag, the pull has done ten joules while K rises from ten to twenty. | checkpoint_1 |
| s5_4 | Ten and ten agree: five newtons times two metres matches the d arrow. | displacement_vector |

text_hi: "पाँच newton का pull इस cart को दो metres per second से तेज़ करता है। Net work -- mass गुणा acceleration
गुणा distance -- kinetic energy में बदलाव के बराबर होता है। Flag पर, pull ने दस joules का work किया है जबकि K दस से
बीस joules तक बढ़ता है। दस और दस मिलते हैं: पाँच newtons गुणा दो metres भी d arrow की reading से मिलता है।"

The derivation (sentence 2) is the state whole point -- W_net = m a d = half m v squared minus half m v0
squared, shown symbolically on the formula surface below and spoken in plain words here. The stamped
check (sentence 3) ties the flag captured pair (W net = 10.0 J, K = 10.0 to 20.0 J) directly to the
arithmetic a teacher reads aloud: 20.0 minus 10.0 equals 10.0. The independent cross-check (sentence 4)
ties the same 10.0 J to F times d equals 5 times 2.0, verified against the d arrow own rendered value --
two different roads to the same number, which is the derivation whole teaching point.

### STATE_6 -- explore, 27 words, 3 sentences (0/open, exempt)

| # | text_en | glow |
|---|---|---|
| s6_1 | Change the force, the mass, and the starting speed. | nlb_body_cart |
| s6_2 | Watch the work bars and the K bar together. | energy_panel |
| s6_3 | The net bar always matches the change in K. | energy_bar_K |

text_hi: "Force, mass, और starting speed बदलिए। Work bars और K bar को साथ देखिए। Net bar हमेशा K में बदलाव से
मिलता है।"

---

### Titles and delta cues (Rule 41d, front-loaded, the rail truncates; verbatim from the sealed skeleton)

| State | Title | Delta cue (5 words or fewer, on-canvas) |
|---|---|---|
| S1 | Net work equals the kinetic energy gained | Two bars, one number |
| S2 | Negative net work removes kinetic energy | Negative net work: K falls |
| S3 | Only the net work changes kinetic energy | Net zero: K constant |
| S4 | Change measured from the starting energy | Measured from the start |
| S5 | The theorem comes from F = ma | Derived from F = ma |
| S6 | Explore: force, mass and starting speed | Change force, mass, speed |

### Formula surfaces (Rule 34b -- ONE per state; Rule 38c -- algebra only)

S1 `W_net = delta K` -- S2 `W_net = delta K` -- S3 `W_net = 0, delta K = 0` -- S4
`delta K = half m v squared minus half m v0 squared` -- S5
`W_net = m a d = half m v squared minus half m v0 squared` (plus the engine one appended stamp) -- S6
`W_net = delta K` (core form only, 38b -- the derivation chain from S5 does NOT survive into the
explore surface).

Rule 38c notation-ladder audit: every formula surface in this concept is on a core or extended ring and
every one is ALGEBRA-ONLY. S5 is the sole advanced-ring state (Rule 38a: a contiguous block of exactly
one, immediately before the explore state) and even its derivation uses no calculus, no vector operator,
no integral -- it is a substitution chain from F=ma and v squared = v0 squared plus 2ad, both algebra.
Nothing to FLAG to the founder: the work-energy theorem standard derivation genuinely needs no calculus
below the advanced ring, and this concept own advanced ring already contains the one state that needs
it.

On the rendered surface the concept uses real Unicode glyphs (Delta, one-half, superscript 2,
subscript 0, minus sign, right arrow, middle dot), never ASCII transcription.

---

## 8. aha_moment, misconception_watch, assessment, coverage_map, real_world_anchor

### aha_moment -- physics-checked

```json
"aha_moment": {
  "state_id": "STATE_1",
  "statement": "The work meter and the energy meter are the same meter, reading the same number.",
  "visual_confirmation": "A crate pulled from rest by a steady 10 N force: the net-work bar and the K bar climb together, frame by frame, and both land on exactly 40.0 J."
}
```
Physics check: TRUE. For a single constant force F acting alone from rest, W_net(t) = F times x(t) and
K(t) = half m times v(t) squared. With a = F/m constant, x(t) = half a t squared and v(t) = a t, so
F times x(t) = F times half a t squared = half m a squared t squared = half m v(t) squared = K(t) --
algebraically identical at every instant, not merely at the endpoint. 14 words, inside the 15-word cap.
The designated state (S1) genuinely renders both readings simultaneously on the same shared 55 J scale,
confirmed in section 1 sanity table (both instruments read exactly 40.0 J at t=2000 ms, and by the
identity above, equal at every t).

SUPPORTING (S3): a force can do real, nonzero work (98.0 J) while the net work, and therefore the
kinetic energy, never moves. Physics check: TRUE, W_pull=+98.0 J and W_friction=-98.0 J sum to
W_net=0, and by the theorem delta K=0 exactly -- confirmed independently in section 1/section 9 (a=0
exactly from F=mu m g, so v stays at 2.5 m/s and K stays at 15.625 J throughout).

Cohesion check. The supporting aha sharpens the primary own subtle word -- "net". S2 and S4 are
consequences of the same theorem (sign, and change-from-start) and are deliberately NOT designated as
ahas -- two ahas total is the sweet spot, matching every shipped Ch.6 sibling own count.

### misconception_watch -- exactly 2 entries, S3 and S4 only, physics-checked

| State | belief | visual_counter | one_line_fix |
|---|---|---|---|
| S3 | The work done by the force you apply becomes kinetic energy | The pull bar climbs to +98.0 J -- the number the belief tracks -- while the K bar holds 15.6 J without moving and the net bar sits on its zero line | "Only the net work changes kinetic energy -- add the works with their signs first." Correct, not merely persuasive: W_net equals the signed sum of every force work, and delta K equals W_net exactly, by the theorem itself -- 98.0 plus minus 98.0 equals 0 equals delta K, verified in section 1. |
| S4 | Net work equals the final half m v squared | At the end of the run the K bar reads 46.1 J while the net bar reads +28.1 J -- two different nonzero numbers on one screen; the change is 46.1 minus 18.0 equals 28.1, measured from the starting 18.0 J | "W_net equals half m v squared minus half m v0 squared, the change, not the final value." Correct: 46.08 minus 18.0 equals 28.08, rounds to 28.1 J displayed, independently re-derived in section 1/section 9 to six decimal places. |

S1, S2, S5, S6 carry no misconception_watch -- exactly 2 genuine pivots, never a per-state tic. EPIC-C
branches: NONE (EPIC-L-first directive 2026-06-10).

### assessment -- 6 questions, one per state, every answer physics-checked

mastery_definition: A student who has mastered this concept can state the work-energy theorem W_net =
delta K = half m v squared minus half m v0 squared; compute the net work or the change in kinetic energy
given the other; explain why the work done by one force is not automatically the net work when other
forces also act; explain why a nonzero individual force work can leave kinetic energy unchanged when it
sums to zero with another force work; correctly measure the change in kinetic energy from the starting
value rather than treating net work as the final kinetic energy alone, including through a velocity
reversal; and derive the theorem from F equals m a and v squared equals v0 squared plus 2 a d.

```json
{
  "assessment": {
    "mastery_definition": "A student who has mastered this concept can state the work-energy theorem W_net = delta K = half m v squared minus half m v0 squared; compute the net work or the change in kinetic energy given the other; explain why the work done by one force is not automatically the net work when other forces also act; explain why a nonzero individual force's work can leave kinetic energy unchanged when it sums to zero with another force's work; correctly measure the change in kinetic energy from the STARTING value rather than treating net work as the final kinetic energy alone, including through a velocity reversal; and derive the theorem from F = ma and v squared = v-naught squared plus 2ad.",
    "questions": [
      {
        "q_id": "q1_net_work_fills_k",
        "stem": "A 5 kg crate starts from rest and a steady 10 N pull acts on it as the ONLY force, on a frictionless floor. After the crate has moved 4 m, what is the net work done on it, and what is its kinetic energy at that instant?",
        "options": {
          "A": "40.0 J net work; K = 40.0 J",
          "B": "20.0 J net work; K = 40.0 J",
          "C": "40.0 J net work; K = 20.0 J",
          "D": "10.0 J net work; K = 40.0 J"
        },
        "correct": "A",
        "distractor_misconceptions": {
          "B": "halves F times d for no physical reason -- an arithmetic slip, not a conceptual one, but a common one",
          "C": "computes K by dropping the one-half factor (uses m v squared instead of half m v squared)",
          "D": "confuses the force's own magnitude (10 N) with the work it does, ignoring the distance moved entirely"
        },
        "tested_idea": "the theorem itself, positive case: W_net = F*d and K = half m v^2 agree exactly",
        "teaches_state": "STATE_1",
        "difficulty": "core",
        "parallel_form_stem": "A 4 kg block starts from rest and a steady 8 N force pushes it across a frictionless floor for 5 m. Find the net work done and the block's kinetic energy at that point."
      },
      {
        "q_id": "q2_negative_net_removes_k",
        "stem": "A 5 kg crate slides at 4 m/s onto a rough floor (mu = 0.4) with no applied force, and friction alone brings it to rest. What is the net work done by friction while the crate slides to a stop, and what is the crate's kinetic energy at the moment it stops?",
        "options": {
          "A": "-40.0 J; K = 0.0 J",
          "B": "+40.0 J; K = 0.0 J",
          "C": "-40.0 J; K = 40.0 J",
          "D": "0 J; K = 0.0 J"
        },
        "correct": "A",
        "distractor_misconceptions": {
          "B": "drops the sign, forgetting that a force opposing the motion does negative work even though it is a real, positive-magnitude force",
          "C": "confuses the ORIGINAL kinetic energy with the CURRENT one, as if a body that once had speed keeps that energy after stopping",
          "D": "believes work requires an applied push -- misses that friction is itself a force doing (negative) work on the sliding body"
        },
        "tested_idea": "the theorem is signed: a force opposing the motion does negative net work, and K falls to exactly zero at rest",
        "teaches_state": "STATE_2",
        "difficulty": "core",
        "parallel_form_stem": "A 2 kg puck slides at 6 m/s onto a rough patch (mu = 0.3) with no applied force and slides to a stop. Find the net work done by friction and the puck's final kinetic energy."
      },
      {
        "q_id": "q3_only_net_counts",
        "stem": "A 5 kg crate coasts at a constant 2.5 m/s while a 19.6 N pull exactly balances 19.6 N of kinetic friction. After the crate has travelled 5 m, what is the NET work done on it, and how has its kinetic energy changed?",
        "options": {
          "A": "Net work = 0 J; kinetic energy is unchanged",
          "B": "Net work = 98.0 J (the pull's own work); kinetic energy increased by 98.0 J",
          "C": "Net work = -98.0 J (friction's own work); kinetic energy decreased by 98.0 J",
          "D": "Net work = 196.0 J (both forces added as sizes); kinetic energy increased sharply"
        },
        "correct": "A",
        "distractor_misconceptions": {
          "B": "the concept's headline misconception: mistakes ONE force's own work (the pull's) for the NET work on the body",
          "C": "mistakes the OTHER single force's work (friction's) for the net work, with the same underlying error as B",
          "D": "adds the magnitudes of two opposing forces' work instead of summing them with their signs"
        },
        "tested_idea": "only the NET work changes kinetic energy; a force can do large real work while the net -- and therefore K -- does not move",
        "teaches_state": "STATE_3",
        "difficulty": "core",
        "parallel_form_stem": "A 4 kg crate coasts at a constant 3 m/s while an 11.76 N pull exactly balances 11.76 N of kinetic friction over 6 m. What is the net work done, and how does the kinetic energy change?"
      }
    ]
  }
}
```

(continued below -- the array above is closed here for a valid partial preview; json-author concatenates
questions q4-q6 from the block that follows into the SAME `questions` array before emitting the final
file.)

```json
{
  "questions_continued": [
      {
        "q_id": "q4_change_not_total",
        "stem": "A 4 kg cart launched backward at 3 m/s is pulled by a steady 12 N forward force on a frictionless floor. By the time it has turned around and sped back up to 4.8 m/s, moving forward, its kinetic energy is 46.1 J. What is the net work done on the cart over this whole trip?",
        "options": {
          "A": "+28.1 J",
          "B": "+46.1 J",
          "C": "+64.1 J",
          "D": "-18.0 J"
        },
        "correct": "A",
        "distractor_misconceptions": {
          "B": "the exact planted misconception: reports the FINAL kinetic energy itself as the net work, dropping the starting kinetic energy entirely",
          "C": "adds the final and starting kinetic energies instead of subtracting them",
          "D": "stops at the turn-around instant's net-work reading instead of continuing to the end of the described trip"
        },
        "tested_idea": "net work is the CHANGE in kinetic energy measured from the START, not the final kinetic energy alone -- true even through a velocity reversal",
        "teaches_state": "STATE_4",
        "difficulty": "core",
        "parallel_form_stem": "A 2 kg cart launched backward at 2 m/s is pulled by a steady 6 N forward force on a frictionless floor. Its starting kinetic energy is 4.0 J. By the time it has turned around and reached 4 m/s forward, its kinetic energy is 16.0 J. Find the net work done over the whole trip."
      },
      {
        "q_id": "q5_derive_and_check",
        "stem": "A 5 kg cart moving at 2 m/s is accelerated by a steady 5 N pull on a frictionless floor. By the time it has moved 2 m, what is the net work done, and what is the cart's kinetic energy at that point?",
        "options": {
          "A": "10.0 J net work; K = 20.0 J",
          "B": "10.0 J net work; K = 10.0 J",
          "C": "5.0 J net work; K = 15.0 J",
          "D": "10.0 J net work; K = 30.0 J"
        },
        "correct": "A",
        "distractor_misconceptions": {
          "B": "computes the net work correctly but reports only the CHANGE as the new total, forgetting to add it to the starting kinetic energy",
          "C": "uses half the distance (1 m instead of 2 m) in computing the pull's work",
          "D": "overstates the final kinetic energy, effectively double-counting the added work"
        },
        "tested_idea": "the derivation W_net = ma*d = half m v squared minus half m v-naught squared, checked numerically against the starting kinetic energy",
        "teaches_state": "STATE_5",
        "difficulty": "extended",
        "parallel_form_stem": "A 3 kg cart moving at 1 m/s is accelerated by a steady 6 N pull on a frictionless floor. After it has moved 3 m, find the net work done and the cart's kinetic energy."
      },
      {
        "q_id": "q6_sandbox_rest_case",
        "stem": "In the sandbox, you set the pull below the force needed to overcome friction, so the crate stays at rest the whole time. Using the theorem W_net = delta K, what must the net work on the crate be, and why?",
        "options": {
          "A": "0 J, because the kinetic energy never changes from zero",
          "B": "0 J, because no force is acting on the crate",
          "C": "A large negative value, because friction is holding the crate back",
          "D": "It cannot be determined without knowing the exact forces"
        },
        "correct": "A",
        "distractor_misconceptions": {
          "B": "denies that any force acts at all -- the pull and static friction both act, they simply sum to zero",
          "C": "mistakes ONE force's (friction's) work for the net work, the same error class as q3's headline misconception",
          "D": "misses the theorem's own power: the net work is determined directly from the change in kinetic energy, with no need to know the individual forces at all"
        },
        "tested_idea": "the theorem transfers to any configuration, including one at rest: zero change in kinetic energy means exactly zero net work, regardless of how many individual forces are acting",
        "teaches_state": "STATE_6",
        "difficulty": "core",
        "parallel_form_stem": "In a similar sandbox, a small pull never overcomes static friction and a crate stays at rest for the whole run. What is the net work done on the crate?"
      }
  ],
  "coverage_map": {
    "by_state": {
      "STATE_1": ["q1_net_work_fills_k"],
      "STATE_2": ["q2_negative_net_removes_k"],
      "STATE_3": ["q3_only_net_counts"],
      "STATE_4": ["q4_change_not_total"],
      "STATE_5": ["q5_derive_and_check"],
      "STATE_6": ["q6_sandbox_rest_case"]
    },
    "non_assessed_states": []
  }
}
```

Every correct answer verified by arithmetic (section 1/section 9): q1 half of 5 times 4 squared equals
40.0, F times d equals 10 times 4 equals 40.0. q2 minus half of 5 times 4 squared equals minus 40.0
(also f times d equals 19.6 times 2.0408 equals 40.0). q3 98.0 plus minus 98.0 equals 0 equals delta K.
q4 46.08 minus 18.0 equals 28.08, rounds to 28.1. q5 half of 5 times 2.828 squared equals 20.0, F times
d equals 5 times 2 equals 10.0 equals delta K. q6 delta K equals 0 therefore W_net equals 0 by the
theorem itself.

### real_world_anchor (Rule 35 universal, Rule 41 plain -- verbatim from the sealed skeleton section 9)

```json
"real_world_anchor": {
  "primary": "Braking a moving vehicle. To stop, the brakes and the road must do negative net work exactly equal to the vehicle's kinetic energy -- every joule of half m v squared must be matched by a joule of negative net work before the speed reaches zero. Twice the speed means four times the kinetic energy, so four times the net work to remove.",
  "secondary": "Catching a ball. Your hands must do negative net work equal to the ball's kinetic energy. Moving your hands backward while catching spreads the same joules over a longer distance, so the force on your hands is smaller -- same work, longer distance, smaller force."
}
```
No place, festival, food, currency, brand or personal name; no "in every ... home" phrasing. Two
declared restraints, carried from the skeleton: no stopping-DISTANCE number is spoken (nothing in this
sim renders one), and no word about where the removed energy GOES (heat is concept 10 PRIMARY content).

---

## 9. THE CALCULATOR -- harvestable readings, ground truth, and the independent re-derivation

### Which numerals THE CALCULATOR can harvest, per state (channel B, bare-symbol gate)

| State | Harvestable bars/values | computed_outputs ground truth used |
|---|---|---|
| S1 | net, K | W_net_J equals K_J (v0=0): both formulas evaluate to the same live-v expression |
| S2 | net, K | W_net_J using v0=4; at any sampled v (including the rest-hold value v=0) |
| S3 | pull, friction, net, K | W_pull_J = F*d, W_friction_J = -mu_k*m*g*d, W_net_J (should read approximately 0 for every d, since v is always v0), K_J |
| S4 | net, K | W_net_J using v0=-3 (squared, so the sign of v0 does not need separate handling) |
| S5 | net, K -- plus d is independently harvestable (the d-arrow value, S3/S5/S6 only) | W_net_J (from v, v0); cross-checked by W_pull_J = F*d since S5 is frictionless (W_pull_J should equal W_net_J exactly at every sampled instant) |
| S6 | pull, friction, net, K | All four formulas, using the LIVE slider values of F, m, v0 at sample time |

All four channel-B numerals harvest on every state that authors them -- single-word captions
(pull/friction/net, and the engine-fixed K) pass the bare-symbol gate (the F1/F8 fix, confirmed live by
Checkpoint A cycle 1/2). A SKIP is not a pass: the one number this concept renders that channel B CANNOT
harvest is the S5 checkpoint stamp own text (flag: W net = 10.0 J, K = 20.0 J, composed into one
`#nlb_formula` text node) -- that number is hand-verified in section 1 sanity table (K_flag=20.0,
W_flag=10.0) rather than machine-harvested, and this is stated explicitly here so it is never silently
read as a SKIP standing in for a PASS.

### Reference instants -- the frozen-pin values (0.60 R phase, matches THE EYE own pin), independently re-derived

| State | Pin (ms) | v | d (where rendered) | K | net (harvestable) | pull / friction (where rendered) |
|---|---|---|---|---|---|---|
| S1 | 1200 | 2.4 | -- | 14.4 J | +14.4 J | -- |
| S2 | 1260 | 0 (at rest since 1033 ms) | -- | 0.0 J | -40.0 J | -- |
| S3 | 1200 | 2.5 (constant) | 3.0 m | 15.6 J | 0.0 J | +58.8 J / -58.8 J |
| S4 | 1560 | +1.68 | -- | 5.6 J | -12.4 J | -- |
| S5 | 1440 | 3.44 | 3.9168 m | 29.6 J | +19.6 J | (only net rendered on S5) |

Every value above was computed independently in the Python session recorded below and matches the
skeleton own DoD margin table to the last printed decimal (S1 14.4, S2 -40.0/0.0, S3 15.6/0.0, S4
5.6/-12.4 -- all confirmed at source in founder_proxy_A_cycle2.md own re-derivation).

### Independent arithmetic verification (Python, run before this document narration section was written)

```
S1 a=2.0 d=4.0 s_end=-1.4 v=4.0 K=40.0 W=40.0
S2 a=-3.92 t_stop=1.020408163 d_stop=2.040816327 s_end=-3.359184
   f=19.6 W=-39.99999999999999 K_initial=40.0
   discrete rest: n=62, t=1.033333333, v[n-1]=0.014666667, v[n]=-0.050666667
S3 F(=mu*m*g)=19.6 d3=5.0 s_end=-0.400000000
   W_pull=98.0 W_friction=-98.0 K3=15.625
S4 a4=3.0 t_turn=1.0 s_turn=0.100000000
   v(2.6)=4.800000000000001 s(2.6)=3.9399999999999995 K(2.6)=46.08000000000001
   K0=18.0 W_net(2.6)=28.07999999999999 dK=28.080000000000013
S5 a5=1.0 v_target=2.8284271247461903 t_flag=0.8284271247461903 s_m=-3.4000000000000004
   K_flag=20.000000000000004 K0=10.0 W_flag=10.0
   at R: v=4.4 s=2.2799999999999994 K=48.400000000000006 W=38.4
S6 worst corner (m=2,F=30,v0=4): K=305.44  W_pull=360.0  W_friction(heaviest-mass corner)=70.56(*)
S6 default (m=4,F=20,v0=0): K=98.88
S1 pin(1200ms): v=2.4 d=1.44 K=14.4 W=14.4
S4 pin(1560ms): v=1.68 s=0.5704 d=-1.0296 W=-12.3552 K=5.6448 dK=-12.3552
S5 pin(1440ms): v=3.44 s=-1.4832 d=3.9168 K=29.584 W=19.584 (matches dK exactly)
```

(*) printed against the K-worst corner own m=2 for reference only; the concept own claimed friction
bound (211.7 J) correctly uses the SEPARATE heaviest-mass corner (m=6), re-verified:
0.3*6*9.8*12 = 211.68.

One slip caught in my own working, corrected before it reached this document: an early hand computation
of the S5 pin-frame displacement subtracted s(t) minus s0 incorrectly (-1.4832 minus -5.4 miscomputed as
3.4832 instead of the correct 3.9168), which would have broken the W = delta K cross-check at that
instant. Caught by the check itself failing to balance (19.584 vs 17.416), re-derived correctly via the
script above, and the corrected 3.9168 value is what appears in the reference table. Recorded here, per
this dispatch own instruction, so the check is auditable rather than merely asserted.

---

## 10. Self-review checklist

- [x] Every symbol in the state narratives appears in `variables` -- m, F, v0, v, g, mu_k, mu_s, d, K.
- [x] `radians()` where an angle enters a trig call -- vacuously satisfied and structurally unreachable:
  zero angles authored anywhere in this concept (theta_deg=0, no F_ang, no angle_arc), no formula in
  this block takes an angle argument, `radians(` appears nowhere in the emitted JSON.
- [x] Every state live control(s) declared with min/max/step/default: S1-S5 none, S6 F/m/v0 with the
  exact ranges verified against the skeleton section 10(f-3) envelope arithmetic.
- [x] `variable_overrides` documented and justified per state (section 2), including the two states with
  a silent-inherit trap (m, twice -- S1 5 kg vs the S6-slider 4 kg default, and S6 own dual
  `bodies[].mass_kg`/`slider_controls.m.default` seed).
- [x] Board mark scheme -- DEFERRED, Rule 20 [D], declared in section 4.
- [x] 6 drill-down clusters, 5 real student phrases each (section 5), student voice, plain English.
- [x] `constraints` block: 6 short factual assertions (section 1), conservation-shaped first (the
  theorem itself), no pedagogy.
- [x] Numerical sanity check run independently -- the full state-by-state table (section 1) and the
  reference pin table (section 9) re-derived from Newtonian kinematics directly, matching the skeleton
  to the last printed decimal; the one arithmetic slip caught in my own working is recorded, not hidden.
- [x] Within-state motion timeline for every state (section 3): every row a t-window by what-animates by
  driven-by, every branch a pure function of the state clock, no two states share a motion
  (translate-through x1, decay-to-rest x1, null-result-hold x1, cycle-compare x1, flow-along-path x1,
  drag-sandbox x1 -- zero archetype repeats), controls column matches the architect table exactly. No
  `pause_after_ms` anywhere -- new concept.
- [x] Rule 32 sequencing verified per state (section 3): 32a with S3 continuous-parameter exemption
  re-argued and narration-order compensation stated; 32b (S3 is the one state where more than the taught
  variable readings move, and that IS the taught content -- three ledgers, one state); 32c all cues 5
  words or fewer; 32d permanent home pose, one body id, fixed camera; 32e zero state-level focals, argued
  per state, with per-sentence glows carrying all emphasis.
- [x] Word budget (Rule 31a) -- S1 55, S2 49, S3 50, S4 55, S5 55 (all inside 25-55; S1/S2 exceed the
  skeleton own suggested band, declared and justified in section 7); S6 27, explore, exempt.
- [x] Notation ladder (Rule 38c) -- every formula surface is algebra-only, core/extended/advanced-1
  rings, nothing to FLAG to the founder (section 7). Dialect (38d) -- no board-divergent term arises in
  this concept content.
- [x] Engine bug queue consulted live (section 0, both the `--owner alex:physics_author` query and the
  concept-scoped query), every relevant `prevention_rule` satisfied at a named site, both MAJOR rows
  (glow-binding coverage, THE CALCULATOR channel B) explicitly discharged.
- [x] DC Pandey check -- no formula, explanation, example problem, figure or phrasing imported from DC
  Pandey, HC Verma or NCERT. Every assessment question, every anchor sentence, every narration sentence
  and every drill-down phrase is authored fresh from Newtonian mechanics (F=ma, v^2=v0^2+2ad) and the
  definition W=F*d directly.

---

## 11. Handoff to json-author

Author from this document plus `skeleton.md`, with NO deviation from the sealed design (unlike the
`kinetic_energy_definition` handoff, this block finds zero measured defects requiring a change -- every
number was independently confirmed, not merely trusted):

1. `energy_layer` on every state: bars is exactly [K], bar_max_J is 55 on S1-S5 and 340 on S6,
   precision is 1, no `body_ids` anywhere (single body).
2. `work_accumulators` on every state (section 2 table): S1/S2/S4/S5 -> net only; S3/S6 -> applied
   (label "pull") plus friction (label "friction") plus net (label "net"); every entry body_id is
   "cart". work_scale_J: 55/55/110/40/55/400.
3. `surface.frictionless: true` on S1, S4, S5; OMITTED on S2, S3, S6, which author mu_s/mu_k explicitly
   (0.4/0.4 on S2 and S3, 0.3/0.3 on S6).
4. `applied_force` with N and angle_deg 0 authored explicitly (angle always 0) on S1 (10), S3 (19.6 --
   exact mu_k*m*g), S4 (12), S5 (5), S6 (slider, default 20). S2 omits `applied_force` entirely.
5. `initial_position_m`: S1=-5.4, S2=-5.4, S3=-5.4, S4=+1.6, S5=-5.4, S6=-5.4.
   `mass_kg`: S1=5, S2=5, S3=5, S4=4, S5=5, S6=slider default 4.
   `initial_velocity_mps`: S1=0, S2=4, S3=2.5, S4=-3, S5=2, S6=slider default 0.
6. S5 ONE checkpoint: s_m is -3.4 (emitted as arithmetic in the authoring working, CALLOUT-3),
   capture is [W, K], capture_mode is first, body_id is cart.
7. `loop_reset_ms`: 2000 / 2100 / 2000 / 2600 / 2400 on S1-S5; none on S6.
8. `slider_controls` on S6 only: F min 0 max 30 step 5 default 20; m min 2 max 6 step 1 default 4; v0
   min 0 max 4 step 1 default 0, each with min_ring core (Rule 38b). controls_visible is [F, m, v0] on
   S6 only, [] elsewhere.
9. `displacement_vector` with body_id cart, label d, show_value true on S3, S5, S6 only.
10. `arrows.show` and `readouts` per state exactly as tabled in section 3. Zero normal arrow, zero
    weight arrow, zero angle_arc, zero F_ang, zero param_ramp, zero sum_merge, zero height_markers, zero
    h_ref_m, zero glow_focal anywhere in this concept.
11. Every `tts_sentences` entry carries the glow given in section 7 -- never work_bar_*, never an
    nlb_ro_* HUD row id.
12. `text_hi` authored from section 7, `text_te` NOT authored (Rule 30i).
13. Titles, delta cues and formula surfaces exactly as tabled in section 7 (all carried verbatim from
    the sealed skeleton -- no re-invention).
14. `advance_mode`: manual_click on S1-S5, interaction_complete on S6.
15. `assessment` + `coverage_map` verbatim from section 8 (merge the two questions arrays into one).
16. No left-edge overlay on any state other than the combined energy-and-work panel (section 6
    CALLOUT-9).

Checks to run before declaring done: `npx tsc --noEmit` at 0, `npm run validate:concepts` passing on
this id, the eight registration sites, THE EYE (`npm run visual:eyes -- work_energy_theorem`), with
section 6 CALLOUT-1 overflow probe (CF-1) and CALLOUT-2 panel-height-identity probe (CF-3, corrected
boundary) run explicitly, not merely inherited from the skeleton prose, and THE CALCULATOR
(`npm run numeric:calc -- work_energy_theorem`), checked against section 9 harvestable-numerals table --
any new SKIP beyond the one named exception (the S5 stamp text) is investigated, never waved through.
