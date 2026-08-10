# PHYSICS BLOCK — `conservative_vs_nonconservative_forces` (ch6 concept #5)

> Input: `skeleton.md` (cycle 1, sealed) + `founder_proxy_A_cycle2.md` (`DESIGN_OK`, CF-1..CF-7 carried
> forward) + `founder_proxy_A.md` (cycle 0, superseded findings) + `ch6_state.md` (SEAM K/L/M/N —
> authoritative JSON contracts; skeleton literals are guesses, the SEAM REPORTS govern).
> Author: `alex:physics_author`, 2026-08-07. Renderer: `field_3d` / `newtons_laws_body` + SEAM M's
> `work_accumulators` / `checkpoints` layer. **0d pure-JSON concept — zero renderer edits.**
> Modes required by the DoD: **EPIC-L only.** Conceptual-only (Rule 20 [D]) — no `mode_overrides`,
> no board mark scheme, no competitive overrides, no `derivation_sequence`. Output section 4 is
> therefore deliberately empty.

## VERDICT LINE

Checkpoint A is CLOSED at `DESIGN_OK` (2 cycles). **This block does not re-litigate the design** — it
adds the physics rigor layer on top of a sealed skeleton, per the dispatch. Every headline number in
`skeleton.md`'s section "Arithmetic" was independently re-derived TWICE already (architect cycle 1,
founder-proxy cycle 2) and is reused here **verbatim, never recomputed differently**, per the dispatch's
explicit instruction. What this block adds that neither prior pass did:

1. A `physics_engine_config` (section 1) in the schema shape `src/schemas/conceptJson.ts` expects, with
   every symbol the narration or the formula surfaces will need.
2. **A source-verified answer to the THE-CALCULATOR harvest question** the dispatch asked me to check
   rather than assume (section 6, CALLOUT-5) — I read `readoutHarvest.ts` and the two
   `field_3d_renderer.ts` render sites (`nlbCpStampText`/`nlbRenderStamps` L46184-46273,
   `nlbUpdateWorkPanel`/the bar template L45006-45032/L46369-46398) and traced the parser against the
   ACTUAL authored stamp/label strings, not a guess.
3. Narration (section 7) that discharges **CF-5** (the latch-narration duty) with an explicit placement
   rule and the pacing arithmetic that makes it reliable on a LOOPING state, not merely a hope.
4. A physics check on `aha_moment`, `misconception_watch`, `assessment` and `real_world_anchor` (section 8).
5. Independent light arithmetic re-verification (section 9) — a spot-check, not a third full re-derivation,
   run with Python and cross-validated via the work-energy theorem (`deltaK = sum W`) as an INDEPENDENT
   route the two prior passes did not use for S2's headline number.

**No live-engine Playwright probe suite was run for this block** (unlike the `kinetic_energy_definition`
precedent's section 9 "THE FOUR PROBES") — that is json-author's/quality-auditor's/THE EYE's gate, and
outside `physics_author`'s tool set (Read/Grep/Glob/calculator only, per the role spec). Every DOM/render
claim below is instead grounded in a direct `Read` of the renderer source at the cited line numbers, not
inference.

---

## 0. Engine bug queue — consulted LIVE this dispatch, per the bug-queue contract

`npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts --owner alex:physics_author` (10
rows) and `... conservative_vs_nonconservative_forces` (5 concept-named rows, all already disposed by
the architect in `skeleton.md` section 0 and "Scar compliance").

| Row | Disposition in THIS block |
|---|---|
| `DUALPANEL_EQUATION_INCOHERENT` / `DUALPANEL_RANGE_OFF` / `DUALPANEL_LIVEDOT_OFF_GRAPH` | **N/A.** No Panel B, no graph, no `live_dot` anywhere in this concept (single work-bar panel only). |
| `concept_ships_zero_narration_glow_bindings` | **SATISFIED with a declared partial.** S1/S2/S4 (no state focal) carry a `glow` on every `tts_sentences` entry, from the verified id list (section 3, section 7). S3/S5 author a state-level focal and **deliberately** carry zero per-sentence bindings — this is the architect's own DoD (f-5) instruction, not an omission, and matches the row's own "partial bindings name which sentences carry none and why" clause. |
| `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` | **N/A to this concept's own claim.** No two force MAGNITUDES are compared by arrow LENGTH here — the weight arrow is a single constant 24.5 N throughout, and the friction arrow (S3/S5) is a single constant 12.7 N. The 0.048 scale factor puts 24.5 N at 1.176 world units and 12.7 N at 0.611 world units, both clear of the ~0.55 floor with margin; no arrow in this concept changes length at all — the flip in S3 is orientation only, per skeleton section 3. |
| `teach_color_each_element_by_its_own_sign` | **SATISFIED.** The block is one object; the two work bars are told apart by their captions ("gravity"/"friction"), never by needing a shared colour convention. |
| `pcpl_radians_helper_missing` | **N/A** — this is a `field_3d` concept (`newtons_laws_body`), not a PCPL/`parametric_renderer` one. Every angle argument in section 1's formulas uses `radians(theta_deg)`, the field_3d/mechanics_2d dialect, correctly. |
| `narration_references_a_prerequisite_concepts_apparatus_that_is_not_on_screen` | **SATISFIED.** S1's meter-recap sentence names the IDEA ("the meter tracks work with its sign") never #1/#2's own apparatus by name. S2's friction-force bridge names the rough slope and the visible HUD `f`, never `friction_force`'s or `block_on_incline`'s specific rig. |
| `teach_reveal_synced_to_narration` | **SATISFIED with a declared exception, same shape as the sibling.** No `phases`, no authored `at_ms` anywhere in this concept — every visual event (the latch, the pass-2 stamps) is physics-driven off the crossing detector, not a hardcoded timer. **This is correct and required here specifically**: the whole design (Checkpoint A cycle 2, "capture-semantics acceptance") depends on the stamp being a RECURRING physics event, not a one-shot authored reveal — see section 7's CF-5 discharge for the pacing argument that makes this land reliably anyway. |
| `teach_show_quantity_live_when_named` | **SATISFIED.** Every per-sentence `glow` in section 7 lights the on-canvas element the sentence is naming at that beat (section 3's control table + section 7's glow map). |

Inherited/declared, NOT re-routed here (already disposed by the architect at source, verified again in
section 6 of this block): `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate`,
`nlb_checkpoint_capture_overshoots_exact_crossing_value` (FIXED), `nlb_frictionless_state_with_an_
opposing_applied_force_reverses_and_unwinds_its_own_work_ledger`, `nlb_loop_reset_clears_checkpoint_
stamp_and_frozen_pin_can_photograph_an_empty_formula`, `nlb_static_state_authored_on_the_track_bound_
fires_a_false_clamp_alarm`. This block's own re-derivations in section 9 land on the same numbers the
architect disposed these rows against — nothing here contradicts a disposition already made.

---

## 1. `physics_engine_config`

```json
{
  "variables": {
    "m": { "name": "block mass", "unit": "kg", "constant": 5 },
    "theta_deg": { "name": "incline angle", "unit": "deg", "min": 5, "max": 45, "step": 5, "default": 30 },
    "mu_s": { "name": "coefficient of static friction", "unit": "", "min": 0, "max": 0.6, "step": 0.05, "default": 0.3 },
    "mu_k": { "name": "coefficient of kinetic friction", "unit": "", "min": 0, "max": 0.6, "step": 0.05, "default": 0.3 },
    "v0": { "name": "launch speed", "unit": "m/s", "min": 0, "max": 6, "step": 0.5, "default": 4 },
    "g": { "name": "gravitational acceleration", "unit": "m/s^2", "constant": 9.8 },
    "N": { "name": "normal force", "unit": "N", "derived": "m * g * cos(radians(theta_deg))" },
    "f": { "name": "kinetic friction force magnitude", "unit": "N", "derived": "mu_k * N" },
    "s": { "name": "position along the track", "unit": "m", "min": -6, "max": 6, "derived": "the integrator's own live value; no slider anywhere in this concept writes s directly" },
    "d": { "name": "displacement from the home pose", "unit": "m", "derived": "s - initial_position_m" },
    "W_gravity": { "name": "work done by gravity, running ledger", "unit": "J", "derived": "-m * g * sin(radians(theta_deg)) * (s - initial_position_m)" },
    "W_friction": { "name": "work done by friction, running ledger", "unit": "J", "derived": "engine-integrated per step as -f * abs(ds), never a closed form in s alone because it depends on total PATH traveled, not net displacement" }
  },

  "formulas": {
    "N": "m * g * cos(radians(theta_deg))",
    "weight": "m * g",
    "mg_sin_theta": "m * g * sin(radians(theta_deg))",
    "f_kinetic": "mu_k * m * g * cos(radians(theta_deg))",
    "a_up_rough": "g * (sin(radians(theta_deg)) + mu_k * cos(radians(theta_deg)))",
    "a_down_rough": "g * (sin(radians(theta_deg)) - mu_k * cos(radians(theta_deg)))",
    "a_frictionless": "g * sin(radians(theta_deg))",
    "d_up": "(v0 * v0) / (2 * a_up_rough)",
    "W_gravity_leg": "-(m * g * sin(radians(theta_deg))) * d",
    "W_gravity_round_trip": "0",
    "W_friction_leg": "-(mu_k * m * g * cos(radians(theta_deg))) * d",
    "W_friction_round_trip": "-2 * mu_k * m * g * cos(radians(theta_deg)) * d_up",
    "slide_back_condition": "tan(radians(theta_deg)) > mu_s"
  },

  "computed_outputs": {
    "N_frictionless_states": 42.4352,
    "f_rough_states_mu_0_3": 12.7306,
    "S1_apex_W_gravity_J": -40.0,
    "S1_latch_W_gravity_J": 0.0,
    "S2_flag_out_W_gravity_J": -4.9,
    "S2_flag_out_W_friction_J": -2.5,
    "S2_flag_return_W_friction_J": -24.8,
    "S2_latch_W_gravity_J": 0.0,
    "S2_latch_W_friction_J": -27.4,
    "S3_flag_pass1_W_friction_J": -7.0,
    "S3_flag_pass2_W_friction_J": -8.4,
    "S4_flagA_W_gravity_J": -14.7,
    "S4_flagB_W_gravity_J": -29.4
  },

  "constraints": [
    "gravity's work over any closed path on this incline sums to exactly zero: W_gravity_round_trip = 0, because W_gravity depends only on (s - s0), never on the path taken to get there",
    "friction's work is never positive while the block is sliding: W_friction_leg <= 0 on every leg, because kinetic friction always opposes the instantaneous velocity",
    "friction's round-trip work is strictly more negative than either leg alone: W_friction_round_trip = -2*mu_k*m*g*cos(theta)*d_up, never zero and never positive for any real trip",
    "the round trip can only happen if tan(theta) > mu_s (this concept's guided states: tan30 = 0.577 > mu 0.3, margin 1.92x); otherwise the block sticks at the top and never returns",
    "N = m*g*cos(theta) > 0 at every authored theta in this concept (5 deg to 45 deg on S5's slider, fixed 30 deg on S1-S4); no applied force anywhere, so N never clamps to zero and lift-off is never reachable",
    "g = 9.8 m/s^2 (engine constant NLB_G); m = 5 kg fixed in every one of the five states, never a slider anywhere in this concept"
  ]
}
```

**Notes binding on json-author.**

- **`radians(theta_deg)` in every trig call, no exceptions.** `theta_deg` is authored in DEGREES on the
  S5 slider (5 to 45, step 5); every formula above wraps it. A bare `sin(theta_deg)` anywhere in the
  emitted JSON is a bug.
- **`m` is a `constant`, not a `default`.** Unlike `kinetic_energy_definition`'s `m` (a slider, 1-6 kg),
  this concept never exposes mass on any control -- `slider_controls` in the skeleton is exactly
  `theta, mu_s, mu_k, v0` (section 3 of `skeleton.md`, verbatim), and mass stays 5 kg in every one of the
  five states including S5. **If json-author is tempted to add an `m` slider "for completeness," don't** --
  it is not in the sealed design and every stamped numeral in section 1's `computed_outputs` assumes
  m = 5 exactly.
- `min`/`max`/`step`/`default` on `theta_deg`, `mu_s`, `mu_k`, `v0` ARE the S5 `slider_controls` block,
  with the key `default`, never `def` (the same `nlbSc` reader as every other nlb concept this chapter).
- `s`, `d`, `W_gravity`, `W_friction` are declared for DOCUMENTATION only. No state authors a slider on
  any of them -- they are the integrator's own live values and the engine's own ledger accumulators
  (SEAM M `work_accumulators`), never something json-author writes a formula string for in the JSON.
- **`W_friction` has no closed form in `s` alone** -- this is the one formula in this block that is
  genuinely NOT `F * d`. Path-length dependence is the entire physics point of this concept: write the
  PER-LEG form (`W_friction_leg`) for a single monotone leg, and the ROUND-TRIP form
  (`-2*mu_k*m*g*cos(theta)*d_up`) for the closed-path total, and do not attempt a single formula that
  covers both -- the engine itself does not (it integrates `-f * abs(ds)` per step, SEAM M L46067-46069).

---

## 2. Per-state variable notes (`variable_overrides` and their justification)

Same pattern as the `kinetic_energy_definition` precedent: `newtons_laws_body` seeds every body from that
state's own `bodies[]` block, so the defensive `variable_overrides` pattern is expressed here as
**per-state body seeds that MUST be authored explicitly on every state, never inherited.** Bug #1
`default_variables_only_first_var_merged` applies directly -- a state that omits a value gets the concept
default, and every stamped numeral in section 1 depends on the RIGHT value being seeded, not the wrong
one silently surviving from a sibling state.

| State | initial_position_m | mass_kg | initial_velocity_mps | theta_deg | surface.frictionless | mu_s / mu_k | Why this MUST be authored, not inherited |
|---|---|---|---|---|---|---|---|
| S1 | -3.6 | 5 | 4 | 30 | true | (n/a) | If `frictionless` is silently absent here, the block decelerates under a hidden friction default and the round trip never returns to exactly `s0` -- the SUPPORTING aha (gravity's -40.0 J recovering to 0.0 J) becomes a number the engine cannot actually produce. |
| S2 | -3.6 | 5 | 4 | 30 | absent | 0.3 / 0.3 | This is the PRIMARY-aha state. If `mu_s`/`mu_k` are inherited as 0 (frictionless) from a sibling default, the friction bar sits at zero all state and the entire concept's title claim disappears with zero error surfaced anywhere in the gates. |
| S3 | -3.6 | 5 | 3 (NOT 4) | 30 | absent | 0.3 / 0.3 | The slower launch is deliberate (Checkpoint A cycle 1 F2): it is what makes the two-pass flag at +0.55 m land its pass-2 stamp inside the frozen pin with margin. Seeding v0 = 4 here (S2's value) breaks the pin-margin arithmetic in `skeleton.md` "Arithmetic" silently. |
| S4 | -3.6 | 5 | 5 (NOT 4) | 30 | true | (n/a) | The faster launch is what makes S4's flight visibly longer than S1's (2.551 m vs 1.633 m apex) -- the "quantitative check state reuses the exact numbers of an earlier state" scar exists precisely for this: v0 = 4 here would silently re-render S1's own numbers under a different title. |
| S5 | -3.6 | 5 | 4 (slider default) | 30 (slider default) | absent | 0.3 / 0.3 (slider defaults) | Per skeleton section 3 S5 row: "opens MOVING (v0 = 4 up the mu = 0.3 slope -- the S2 trip)". The explore state's FIRST FRAME must match S2's own launch exactly, or the opening picture contradicts the state the teacher just left. |

**`surface.frictionless: true` is REQUIRED on S1 and S4, and FORBIDDEN on S2, S3 and S5.** This is the
single highest-leverage boolean in the whole concept: get it backwards on any one state and that state's
entire claim silently inverts while every deterministic gate (`tsc`, `validate:concepts`, THE EYE's pixel
diff) still passes, because a frictionless block that should be rough still renders a valid,
self-consistent picture -- just the WRONG one. `mass_kg: 5` is identical across all five states and is
the one value safe to treat as "boring," but author it explicitly on every state's `bodies[]` block
anyway, per the same bug-#1 discipline the sibling concept used -- a body block with no `mass_kg` key
does not reliably fall back to 5.

---

## 3. Within-state motion timeline + per-state control spec (Rule 31 -- REQUIRED)

**Every branch below is a pure function of `time - stateStartTime` (Rule 26).** No `pause_after_ms`, no
`wait_for_answer`, no prediction beat -- this is a new concept. `advance_mode`: `manual_click` on S1
through S4, `interaction_complete` on S5 (2 distinct modes, Gate 12 satisfied -- matches skeleton
"Arithmetic" advance-mode tally). Rule 37 makes S5 free-run forever with no extra authoring once
`interaction_complete` is set.

### The control spec, first -- it is what makes every stamped numeral exactly determined

| State | Live control(s) | controls_visible | Why zero on S1-S4 (CRITICAL-scar discipline, skeleton section 3) |
|---|---|---|---|
| S1 | none | [] | A live mu/theta/v0 dial on a round-trip ledger state either falsifies a stamped numeral mid-loop or seizes the loop past the point where the reset can re-arm it. |
| S2 | none | [] | Same -- and S2's stamped numerals (-4.9 / -2.5 / -24.8 / 0.0 / -27.4) are DoD-asserted and narrated VERBATIM (section 7); any slider falsifies at least one of them. |
| S3 | none | [] | Same, plus: the two-pass flag's pin-margin arithmetic (189 ms net, skeleton F2) assumes the exact v0 = 3, mu = 0.3 launch -- a slider breaks the margin computation, not just the number. |
| S4 | none | [] | Same -- the "(pass 2)" identical-reading claim requires the exact frictionless v0 = 5 launch on every cycle. |
| S5 | theta [5,45] step 5, mu_s [0,0.6] step 0.05, mu_k [0,0.6] step 0.05, v0 [0,6] step 0.5 | ["theta","mu_s","mu_k","v0"] | The sandbox is the ONLY state where a live dial cannot falsify a narrated number, because S5 narrates no fixed numeral -- only the qualitative pattern (section 7). |

**This is load-bearing, per the CRITICAL-scar section of `skeleton.md`, and must not be "improved."** Zero
sliders on S1-S4 is precisely why the friction ledger is provably monotone non-increasing between resets
and why the round-trip 0.0 J / -27.4 J numbers are exactly reproducible every cycle, not merely typical.

### The motion timeline

| State | t-window | What animates -- a pure function of the state clock | Driven by | Live controls |
|---|---|---|---|---|
| S1 | 0 to 816 ms (up-leg), 816 to 1633 ms (down-leg), loop R = 1850 ms | The block translates up the slope under constant deceleration a = g sinθ = 4.9 m/s^2, s(t) = s0 + v0*t - 0.5*4.9*t^2; at t = 816 ms it turns (v = 0, apex s = s0 + 1.6327); on the down-leg s(t) = s_top - 0.5*4.9*(t-816)^2. | s(t), v(t) | none |
| S1 | continuous | Gravity's work bar tracks W(t) = -24.5*(s(t) - s0) -- falls to -40.0 J at the apex, climbs back as the block descends. The d arrow grows to 1.6327 m, shrinks, and vanishes (abs(Δs) < 0.02 m) at the recross. | W_gravity(t) | none |
| S1 | t = 1632.7 ms, once per cycle, LATCHES | The start-line flag (s_m = -3.6 + 0.0, 'first') fires as the block re-crosses s0; the stamp "back at the start: W gravity = 0.0 J" appends under the formula surface and holds for the 217 ms tail to the reset. | the crossing detector, f = nlbCpFrac interpolated exactly to s_m | none |
| S1 | 1633 to 1850 ms (tail), every cycle | The block runs on below s0 (down-slope of its own start line); gravity's bar swings GREEN, up to +24.1 J, while the latched stamp text still reads 0.0 J -- both true, at the SAME time, for different reasons (section 7's CF-5 note explains why this does not contradict). At 1850 ms the full reset re-arms everything and the trip repeats. | s(t), W_gravity(t) | none |
| S2 | 0 to 537 ms (up), 537 to 1493 ms (down), loop R = 1700 ms | Same kinematic shape as S1 but under a_up = 7.446, a_down = 2.354 m/s^2 (friction now resists the up-leg and resists the down-leg too -- it OPPOSES motion both ways, so it always subtracts from the driving acceleration going up and from the accelerating pull going down). Apex at t = 537 ms, s = s0 + 1.0744. | s(t), v(t) | none |
| S2 | continuous | TWO bars run: gravity's repeats S1's fall-and-return shape exactly (position-only); friction's bar falls to -13.7 J at the apex and KEEPS falling through the whole down-leg (never climbs -- it is monotone non-increasing, because W_friction's per-step increment is -f*abs(ds), never positive). | W_gravity(t), W_friction(t) | none |
| S2 | t = 52.6 ms, every up-crossing | Interior flag (s_m = -3.6 + 0.2, 'every') stamps "at the flag: W gravity = -4.9 J, W friction = -2.5 J". | crossing detector | none |
| S2 | t = 1399.2 ms, the SAME flag's return crossing | The line is REPLACED ('every' semantics, nlbCpStampText L46184-46227): "at the flag (pass 2): W gravity = -4.9 J, W friction = -24.8 J" -- gravity's number identical, friction's ten times larger. | crossing detector | none |
| S2 | t = 1492.7 ms, once per cycle, LATCHES | The start-line flag ('first') fires; the stamp "back at the start: W gravity = 0.0 J, W friction = -27.4 J" appends and holds for the 207 ms tail. This is the PRIMARY aha, rendered as one line. | crossing detector | none |
| S3 | 0 to 403 ms (up), loop R = 1400 ms | The block slides up at a_up = 7.446 m/s^2 under the slower v0 = 3 launch; the friction ARROW debuts here, pointing DOWN-slope (opposing the upward motion). | s(t) | none |
| S3 | t = 403 ms, once per cycle | At v = 0 the friction arrow FLIPS 180 degrees to point UP-slope; the weight arrow's direction does not change at all through the whole cycle (Rule 32b: only the taught variable -- friction's direction -- moves). | the sign of v(t) | none |
| S3 | 403 to 1119.5 ms (down) | The block accelerates back down at a_down = 2.354 m/s^2; the friction bar keeps FALLING through the reversal (it does not climb back -- the direction flip does not undo the loss, it is the loss's own cause). | s(t), W_friction(t) | none |
| S3 | t = 282.1 ms, out-crossing of the flag at s_m = -3.6 + 0.55 | Stamps "the same spot: W friction = -7.0 J". | crossing detector | none |
| S3 | t = 617.7 ms, the SAME flag's return crossing | Replaces the line: "the same spot (pass 2): W friction = -8.4 J" -- same place, motion reversed, loss LARGER. This is the frozen-pin instant (pin at 840 ms, margin 189 ms net). | crossing detector | none |
| S4 | 0 to 1020 ms (up), 1020 to 2041 ms (down), loop R = 2100 ms | Frictionless, faster launch (v0 = 5); the block flies to s0 + 2.551 -- visibly higher and slower-turning than S1's own flight. | s(t), v(t) | none |
| S4 | t = 128.0 ms, flag A (s_m = -3.6 + 0.6) | Stamps "flag A: W gravity = -14.7 J". | crossing detector | none |
| S4 | t = 277.8 ms, flag B (s_m = -3.6 + 1.2) | Stamps "flag B: W gravity = -29.4 J". | crossing detector | none |
| S4 | t = 1763 ms, flag B's return crossing | Replaces: "flag B (pass 2): W gravity = -29.4 J" -- IDENTICAL number, only the head text changes. | crossing detector | none |
| S4 | t = 1913 ms, flag A's return crossing | Replaces: "flag A (pass 2): W gravity = -14.7 J" -- again identical. Both flags now read exactly what they read on the way out -- the state's whole claim, in two numbers that refuse to change. | crossing detector | none |
| S5 | continuous, free-running (Rule 37) | The block runs the S2 trip and continues past the track end; the sandbox WRAP re-zeros both ledgers and the d arrow origin in one frame (verified engine behaviour -- #2's own confirmation). A theta/mu_s/mu_k/v0 drag re-derives every subsequent frame live; a body drag reparks the block at v = 0. | theta, mu_s, mu_k, v0, drag | ALL (theta, mu_s, mu_k, v0) |

### Rule 32 audit

- **32a (cause before effect).** S1/S2/S4: the block's position IS the cause and the work bars are pure
  READINGS of it -- there is no separate "cause object" to sequence before the reading, so the ordering
  requirement is satisfied by construction (the bar cannot move before the block does; `nlbUpdateWorkPanel`
  reads `wk[i].W`, which is only ever updated inside the same-frame integration step that also moves
  `b.s`). **S3 is the one genuine cause-to-effect chain and it is authored to obey 32a with margin**: the
  friction arrow's flip (the cause, a discrete visible event at v = 0) precedes the bar's continued fall
  through the reversal (the effect, continuous from that instant on) -- by definition simultaneous at the
  flip instant, but the READING of "it kept falling instead of climbing" only becomes visible over the
  ~716 ms down-leg that follows, which is a readable multi-hundred-ms gap in the sense Rule 32a asks for.
- **32b (only the taught variable moves).** S1/S2/S4: position and the ledger(s) it drives are the only
  things that change; the weight arrow (and, in S2/S3, the incline) hold their pose. S3: ONLY the friction
  arrow's orientation changes (a discrete flip); the weight arrow's direction is invariant through the
  whole cycle, which is itself the state's counter-evidence to the "forces keep a fixed direction"
  misconception. S5 is explore-exempt.
- **32c (delta cue at most 5 words).** "Gravity's work returns to zero" (5), "Friction: negative both
  ways" (4), "Friction flips at turnaround" (4), "Same place, same number" (4), "Change anything" (2). All
  within budget (verbatim from `skeleton.md` section 3, unchanged -- the architect already satisfied this).
- **32d (home pose continuity).** `initial_position_m = -3.6` in ALL FIVE states (skeleton section 3
  paragraph 1, Rule 32d-mandated); one camera for S1-S4; the panel never moves between states (SEAM L's
  fixed panel order).
- **32e (one focal).** S1/S2/S4 author **zero** state-level `glow_focal` (the RELATION is the claim, not
  a single object -- narration glow carries emphasis instead, section 7). S3 = `nlb_arrow_block_friction`
  (the flip IS a single-object claim). S5 = `nlb_body_block`. Never more than one at a time, per state.

---

## 4. Board-mode mark scheme + derivation sequence -- DEFERRED

**SKIPPED deliberately.** The conceptual-only directive (Rule 20 [D]) is active: no `mode_overrides`, no
board mark scheme, no `derivation_sequence`, no competitive overrides are authored for this concept. The
DoD requires **EPIC-L only** (this concept's phase -- Class 11 Ch.6 -- has not opened board/competitive
mode; see section 10 below). json-author must neither skip a required mode nor half-build a deferred one
-- for `conservative_vs_nonconservative_forces` there is exactly one mode, and this section is empty by
instruction, not by omission.

---

## 5. Drill-down cluster phrasings (5 real student phrases per cluster)

Nine clusters, all from `skeleton.md` section 6. These become `trigger_examples TEXT[]` in the Supabase
seed. Plain English, real student voice, no Hinglish, no teacher register.

### S2 -- why_friction_work_never_cancels
- "why doesnt friction cancel on the way back"
- "shouldnt going back undo the loss from going out"
- "if I retrace my path why does friction still take more"
- "why does friction add up instead of cancelling"
- "going there and back should be zero work right"

### S2 -- round_trip_work_test
- "what does it mean for work to be zero over a loop"
- "how do you test if a force is conservative"
- "why is the round trip test the definition"
- "if it doesnt return to zero what does that tell you"
- "is a closed path just going back to where you started"

### S2 -- friction_work_out_and_back
- "how do you calculate friction work for the whole trip"
- "why do you multiply by two for friction over a round trip"
- "is the total friction work just twice the one way loss"
- "why does the up trip and the down trip both count negative"
- "how is minus two mu mg cos theta d calculated"

### S3 -- friction_direction_follows_motion
- "why does friction flip direction"
- "does friction always point the opposite way youre moving"
- "how does friction know which way to point"
- "why does the friction arrow turn around at the top"
- "does friction change direction only when you reverse or also when you slow down"

### S3 -- gravity_direction_is_fixed
- "why doesnt gravity change direction like friction does"
- "gravity always points down so why does that matter here"
- "why is gravity the same arrow going up and coming down"
- "how come one force flips and the other doesnt"
- "is gravity conservative just because it never changes direction"

### S3 -- angle_to_motion_decides_sign
- "why is friction work negative both times"
- "does the angle between force and motion decide the sign"
- "why is cos 180 the reason friction is always negative"
- "if force and motion are opposite is work always negative"
- "how do you tell if work is positive or negative from the angle"

### S4 -- path_independence_of_gravity_work
- "why doesnt the path matter for gravitys work"
- "does it matter how you get from a to b for gravity"
- "if I go the long way does gravity do more work"
- "why is work by gravity only about start and end point"
- "two different routes same height change same work?"

### S4 -- work_as_a_number_per_place
- "what do you mean each point has one number"
- "is work like a value stored at every position"
- "why does the same spot always give the same reading"
- "how can a place have a fixed work value"
- "is this like height has one value no matter how you get there"

### S4 -- closed_path_zero_equals_path_independence
- "how is zero on a loop the same idea as path doesnt matter"
- "why are closed loop zero and path independence the same rule"
- "if two paths give different work does that break the loop test too"
- "are these just two ways of saying the same thing"
- "does path independence prove the loop total is zero"

---

## 6. Constraint callouts -- the special-case encoding json-author must get right

### CALLOUT-1 -- every checkpoint s_m is arithmetic on the home pose, never a bare literal
Per `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate` (DIRECTIVE, names this concept):
```
S1 flag           s_m = -3.6 + 0.0  = -3.6   (capture_mode: 'first', label: "back at the start")
S2 flag-1         s_m = -3.6 + 0.2  = -3.4   (capture_mode: 'every', label: "at the flag")
S2 flag-2         s_m = -3.6 + 0.0  = -3.6   (capture_mode: 'first', label: "back at the start")
S3 flag           s_m = -3.6 + 0.55 = -3.05  (capture_mode: 'every', label: "the same spot")
S4 flag A         s_m = -3.6 + 0.6  = -3.0   (capture_mode: 'every', label: "flag A")
S4 flag B         s_m = -3.6 + 1.2  = -2.4   (capture_mode: 'every', label: "flag B")
```
`capture: ["W"]` on **every one of the six checkpoints, no exceptions** -- this is what stamps EVERY
authored accumulator on one line (SEAM M L46217-46223 loops `eng.work_state`, not just the first).
Per-state checkpoint count: S1 = 1, S2 = 2, S3 = 1, S4 = 2, S5 = 0 -- all under the contract max of 3.

### CALLOUT-2 -- accumulator order is load-bearing, and it is NOT alphabetical
```
S1:  work_accumulators: [ { force: "gravity", label: "gravity" } ]
S2:  work_accumulators: [ { force: "gravity", label: "gravity" }, { force: "friction", label: "friction" } ]
S3:  work_accumulators: [ { force: "friction", label: "friction" } ]
S4:  work_accumulators: [ { force: "gravity", label: "gravity" } ]
S5:  work_accumulators: [ { force: "gravity", label: "gravity" }, { force: "friction", label: "friction" } ]
```
Stamps print in AUTHORED array order (`nlbCpStampText` loops `cp.capture`, and within `'W'`, loops
`eng.work_state` in array order -- L46217-46223). Reversing S2/S5's order would print
"... W friction = ... , W gravity = ..." which still parses correctly (CALLOUT-5 below shows the
symbol-tail regex is order-independent) but breaks every narrated sentence in section 7 that says
"gravity's number, then friction's" -- **author the order exactly as tabled, gravity first.**

### CALLOUT-3 -- capture_mode per checkpoint, and why the two modes are not interchangeable
`'first'` on the two START-LINE flags (S1's only flag, S2's second flag): fires exactly once per loop,
on the RETURN crossing (because a flag seeded exactly on the home pose adopts side +1 without firing --
`skeleton.md` section 0.5, re-verified at source by the architect this cycle), and LATCHES until the
reset. This is the mechanism the entire round-trip claim runs on -- **do not change either of these two
flags to 'every'**, or the stamp would flip on the OUT-crossing too and the "back at the start" wording
would be showing at the wrong moment (t about 0, before the trip has happened at all).
`'every'` on all four interior flags (S2's first, S3's, both of S4's): re-stamps at every crossing, with
" (pass N)" appended once `_count > 1`. This is what makes the pass-1 to pass-2 comparison possible at
all -- a `'first'` flag here would freeze at the OUT reading and never show the return number.

### CALLOUT-4 -- surface.frictionless / mu_s / mu_k, per state
`surface.frictionless: true` on **S1 and S4 only**. **S2, S3 author `mu_s: 0.3, mu_k: 0.3` explicitly**
(equal -- never `mu_k > mu_s`, which is unphysical). **S5 defaults `mu_s: 0.3, mu_k: 0.3` as its slider
starting values**, and authors NO `frictionless` key (the sandbox must be able to reach zero friction via
the slider reaching 0, not via a hardcoded boolean it can never turn back off).

### CALLOUT-5 -- THE CALCULATOR harvest, VERIFIED at source, not assumed
The dispatch asked me to check this rather than assume it. I read `readoutHarvest.ts` (the parser) and
`field_3d_renderer.ts`'s `nlbCpStampText`/`nlbRenderStamps` (L46184-46273) and `nlbUpdateWorkPanel` plus
the bar's HTML template (L45006-45032, L46369-46398, L46360-46361). Two DIFFERENT harvest paths exist and
both are safe for this concept, for two DIFFERENT reasons:

**(a) The stamp text, in `#nlb_formula`.** `nlbRenderStamps` assigns the WHOLE formula-plus-stamps blob
via `ff.textContent = txt` (L46272) -- a SINGLE text node, joined with a newline between checkpoint lines.
`readoutHarvest.ts`'s Channel A collapses all whitespace and then `chunk()` splits on " middot " (the
authored separator) -- so a compound line like "at the flag:  W gravity = -4.9 J  middot  W friction =
-2.5 J" becomes two chunks, each parsed independently by `parseChunk`. **The symbol captured is NOT
"W gravity" -- it is only the trailing contiguous token immediately before "="** (`SYMBOL_TAIL_RE` matches
the maximal run of symbol characters ending at the string's tail; "W" is a separate word, dropped). So
"...W gravity = -4.9 J" parses to `{symbol: "gravity", value: -4.9}` and the multi-word prefixes ("at the
flag:", "back at the start:", "the same spot:", "flag A:", "flag B:") are silently and correctly
discarded -- **the compound, human-readable stamp lines harvest fine, exactly as `skeleton.md` section
0.11 claimed**, and I confirmed the mechanism rather than trusting the claim.

**(b) The live bar reading, via the sibling-composition heuristic (`readoutHarvest.ts` L180-202, labelled
"channel B" in its own comment).** The bar's HTML template puts the symbol in one `nlb_en_sym` div and
the value in the very next sibling `nlb_en_val` div (L45025-45026), and `y.textContent = e.label`
(L46360-46361) writes the authored `label` field VERBATIM into the symbol div. This channel only composes
the pair if the symbol node's direct text is 12 characters or fewer, contains no "=", and contains NO
WHITESPACE (L192). **"gravity" (7 chars) and "friction" (8 chars) both qualify** -- this is why
CALLOUT-2's labels must stay exactly "gravity"/"friction", never a multi-word variant like "gravity's
work". **If json-author (or a future editor) ever authors a multi-word accumulator label, the LIVE BAR
reading silently drops out of THE CALCULATOR's harvest** -- the STAMP text would still harvest fine (per
(a) above, which does not care about the prefix), but the continuously-updating bar value would not. Both
paths are safe with the labels as sealed; only (b) is fragile to a future edit.

### CALLOUT-6 -- work_scale_J, shared and zero-overflow-audited
`70` on **S1, S2, S3, S4** (one shared linear scale, Rule 32d) and `460` on **S5 only** (declared explore
exemption). Every live extreme, including the loop TAILS (not just the teaching peaks), stays inside 70 J
with margin: S1 -40.0 / +24.1, S2 -33.9 / +12.7, S3 -22.6, S4 -62.5 / +7.5 -- all independently
re-verified in section 9 below. **Never raise or lower these two numbers without re-running the
zero-overflow audit** -- `nlbUpdateWorkPanel`'s `frac > 1` clamp fires `NLB_ENERGY_SCALE_WARN_PREFIX`
(L46386-46398), a console assertion THE EYE treats as a hard fail.

### CALLOUT-7 -- angle_arc: never authored, anywhere, in this concept
Per Checkpoint A cycle-1 finding F1 (BLOCKING, applied): `angle_arc`'s `'displacement'` token measures NET
displacement from the state's SEED position, not instantaneous motion -- on S3's down-leg this reads
PARALLEL to the post-flip friction direction and the arc HIDES (`NLB_FANG_MIN_DEG` floor not cleared,
`field_3d_renderer.ts` L45835-45927). **No token in the closed enum expresses "angle to the motion."** Do
not add an `angle_arc` block to S3 or anywhere else in this concept under any circumstance -- the
mechanism is carried entirely by the friction ARROW's orientation flip plus the two-pass flag (section 3).

### CALLOUT-8 -- displacement_vector: S1 and S5 only
`{ body_id: "block", label: "d", show_value: true }` on **S1 and S5 only.** S2, S3, S4 author NO
displacement vector (per DoD (b)'s term-introduction ledger -- only S1 and S5 render `d`). Hides below
`abs(delta-s) < 0.02 m` -- this IS the "vanishing at the recross" beat S1's narration and control table
both name.

### CALLOUT-9 -- glow ids, the verified closed list, and the two state-focal opt-outs
Valid glow ids in this scenario, verified against `skeleton.md` section 3's own live-verified list:
`nlb_body_block`, `nlb_arrow_block_weight`, `nlb_arrow_block_friction` (S3, S5 only -- not present in
S1/S2/S4), `displacement_vector` (S1, S5 only), `checkpoint_1`, `checkpoint_2` (index-based PER STATE,
not a global id -- S1/S3 have only `checkpoint_1`; S2/S4 have both). **`work_bar_*` glow ids are INERT**
(`nlbEnergyApplyGlow` gates on `energy_*` prefixes only -- MAJOR/OPEN engine row) -- **never author a
`work_bar_gravity`/`work_bar_friction` glow anywhere in this concept**, on a state focal OR a per-sentence
binding; either one silently dims everything and lights nothing. S1/S2/S4 author **zero** state-level
`glow_focal` and carry per-sentence bindings instead (section 7). S3 = `nlb_arrow_block_friction`; S5 =
`nlb_body_block` -- both opt OUT of per-sentence glow (the
`authored_state_glow_focal_silently_voids_every_tts_sentence_glow_in_that_state` OPEN row), declared, not
an oversight.

### CALLOUT-10 -- the #3/#4 boundary does NOT apply here; "work" is this concept's own word
Unlike `kinetic_energy_definition` (which had to ban "work"/`W` entirely to protect the #3/#4 boundary),
**this concept is itself about WORK** (position 5, after #1's meter and #2's sign taxonomy) -- "work",
"W", "joule(s)" are this concept's own vocabulary and MUST appear freely. The banned vocabulary here is
the DOWNSTREAM boundary instead: no "energy", "kinetic", "potential", "stored", "heat", "lost", "delta-K"
ANYWHERE except the single mandated S4 closing sentence (section 7, verbatim per skeleton f-2) that hands
the property to #6. Also banned (Rule 41a, skeleton f-2): "gives", "gives back", "pays", "owes",
"charges", "eats", "remembers", "undo" (say "cancel"), "account", "closes" (say "ledger"/"total"/"returns
to zero").

---

## 7. Narration -- `teacher_script.tts_sentences`

**Rule 31a word budget, counted on `text_en`:** S1 **53** words, S2 **55**, S3 **50**, S4 **55**, S5 **32
(explore, exempt)**. Every guided state is inside the global 25-55 band; S2 and S4 sit at the top of the
55 cap deliberately (S2 is the PRIMARY aha and must state the classification AND the latch reading in one
breath; S4 must carry the two-flag pass-2 comparison AND the mandated forward-bridge sentence verbatim --
both genuinely dense obligations, the same declared-deviation pattern `kinetic_energy_definition`'s own
S3 used against its narrower architect band). S3 sits at 50, matching that sibling's own S3 exactly, for
the same reason (two obligations -- the arrow flip AND the two-pass stamp -- packed into a narrower
suggested band).

**Rule 30i:** `text_hi` authored below, `text_te` NOT authored. Hindi is text-only and is never voiced.
Code-mix per Rule 30b/c/e -- technical and English terms stay in Latin script, nothing is transliterated,
bare symbols are expanded to their spoken names (none occur in this concept's narration -- no bare F, N,
or W is spoken aloud anywhere below), colour words stay English (none occur here either).

**Rule 41 sweep, run mechanically over all 19 `text_en` strings below:** zero occurrences of the banned
list (gives, gives back, pays, owes, charges, eats, remembers, undo, account, closes). "Conservative" and
"non-conservative" ARE the plain physics words this concept is named after and appear exactly once each,
both in S2's closing sentence. Nothing is personified: the bar "falls"/"climbs"/"reads"; the arrow
"points"/"flips"; the block "slides"/"turns"/"stops". No occurrence of "returns with the same speed"
(that observation belongs to #9, never claimed here). No occurrence of "energy", "kinetic", "potential",
"stored", "heat", "lost", or a delta-K symbol except the single mandated S4 closing sentence.

**CF-5 discharge -- the latch-narration duty, with the pacing argument that makes it reliable.**
Founder-proxy's carry-forward requires the sentence naming the latched line to land inside its ~200 ms
window, authored as the sentence that FOLLOWS the bar's zero crossing. Concretely: in S1, sentence 3, and
in S2, sentence 3, are that sentence, and each is placed immediately after a sentence describing the
climb/return in progress (never before it) -- so narratively the crossing is always set up before it is
named, matching CF-5's "bar and stamp read zero at the same instant" framing. **The reason this survives
contact with a real TTS clock, not just word order:** S1/S2 are declared LOOPING beats (`loop_reset_ms`
1850/1700 ms) that keep recurring for the entire duration narration plays, and a single sentence at
Sarvam bulbul's natural pace takes roughly 4 to 6 seconds to speak -- several times longer than one loop
period. By the time sentence 3 begins, the loop has already cycled 3 to 6 times and continues cycling
THROUGH the sentence's own utterance window; the 207-217 ms latch flash recurs once per 1.7-1.85 s cycle
inside that window. The probability that NONE of those 3-plus recurrences overlaps the sentence being
spoken is small by construction -- this is exactly why the architect worded the sentence as a description
of a RECURRING fact ("the flag reads...") rather than a one-time event, and why `skeleton.md`'s
"capture-semantics acceptance" section calls it "recurring every cycle in teaching use." **Flagged for
json-author/eye-walker:** if a future edit shortens S1/S2's narration to fewer/shorter sentences such that
sentence 3 is spoken inside the FIRST loop cycle only (before about 1.6 s of playback), re-verify this
argument -- the multi-cycle safety margin would shrink.

**Dual-label at first appearance (Rule 38d):** N/A -- no board-divergent term exists in this concept's
vocabulary ("gravity", "friction", "work", "conservative" read identically CBSE/IB/AP/A-Level).

### STATE_1 -- 53 words, 4 sentences (SUPPORTING aha)

| # | text_en | glow |
|---|---|---|
| s1_1 | This block slides up a frictionless slope at four metres per second. | nlb_body_block |
| s1_2 | Gravity's meter falls as it climbs, then climbs back as it slides down again. | nlb_arrow_block_weight |
| s1_3 | Crossing back over its start line, the flag reads: total work by gravity, zero joules. | checkpoint_1 |
| s1_4 | Up and back to the same spot, gravity's total work returns to zero. | nlb_body_block |

text_hi: "यह block चार metres per second की speed से एक frictionless slope पर ऊपर की ओर चढ़ रहा है।
जैसे-जैसे block ऊपर चढ़ता है, gravity का meter गिरता है, फिर जब block नीचे slide करता है तो meter वापस चढ़ता
है। अपनी start line को फिर से पार करते हुए, flag यह पढ़ता है: gravity द्वारा किया गया total work, zero joules।
ऊपर जाकर उसी जगह वापस आने पर, gravity का total work zero पर लौट आता है।"

**Prerequisite-cliff patch (Block 1, `skeleton.md`):** sentence 1's plain launch statement, combined with
sentence 2's "meter falls/climbs" framing, re-anchors the #1/#2 "the meter counts work with its sign"
prerequisite without naming either sibling concept's own apparatus (satisfies the engine-bug-queue row in
section 0). Word count exactly at the top of the architect's 40-55 band -- every obligation (bridge,
motion, latch, closing statement) fits without needing the deviation S2/S3/S4 declare.

### STATE_2 -- 55 words, 4 sentences (PRIMARY aha)

| # | text_en | glow |
|---|---|---|
| s2_1 | This slope is rough now, same round trip. | nlb_body_block |
| s2_2 | Gravity's meter falls and climbs back to zero; friction's meter only falls. | nlb_arrow_block_weight |
| s2_3 | As it crosses the start line again, the flag reads: gravity zero, friction minus twenty-seven point four joules. | checkpoint_2 |
| s2_4 | Friction is negative both ways, so the trip adds the losses: gravity is conservative, friction is non-conservative. | nlb_body_block |

text_hi: "अब यह slope rough है, same round trip। Gravity का meter गिरता है और वापस zero तक चढ़ता है; friction
का meter सिर्फ गिरता ही रहता है। जब block फिर से start line पार करता है, flag यह पढ़ता है: gravity zero,
friction minus twenty-seven point four joules। Friction दोनों तरफ negative है, इसलिए trip दोनों losses को
जोड़ देती है: gravity conservative है, friction non-conservative है।"

**Misconception delivery (Rule 16a, S1 to S2 consequence-first -- no predict-pause).** Sentence 4 IS the
`one_line_fix` for the watch entry named in section 8: "friction's work is negative on every leg, so a
round trip adds the two losses -- it never cancels them." **`checkpoint_2` glow on sentence 3 is
deliberate** -- `checkpoint_2` is the START-LINE latch (the second-authored flag on this state, per
CALLOUT-9's index rule), not the interior flag; it is the instrument this sentence is literally reading
numbers off of.

### STATE_3 -- 50 words, 4 sentences

| # | text_en | glow |
|---|---|---|
| s3_1 | The friction arrow points down the slope on the way up. | none (state focal in effect) |
| s3_2 | At the top it flips to point up the slope instead. | none (state focal in effect) |
| s3_3 | Friction always opposes the motion; the weight arrow never turns. | none (state focal in effect) |
| s3_4 | At the same spot, the flag reads minus seven joules, then minus eight point four -- the loss grows. | none (state focal in effect) |

text_hi: "ऊपर जाते समय friction का arrow slope की नीचे की दिशा में point करता है। Top पर पहुँचते ही यह flip
होकर slope की ऊपर की दिशा में point करने लगता है। Friction हमेशा motion के विपरीत होता है; weight का arrow कभी
नहीं मुड़ता। उसी spot पर, flag पहले minus seven joules पढ़ता है, फिर minus eight point four -- loss बढ़ता
जाता है।"

**Misconception delivery.** Sentence 2 (the flip) and sentence 3 (the fixed weight arrow) together ARE
the `visual_counter` for the S3 watch entry (section 8): "friction, like gravity, points one fixed way"
is refuted by showing the SAME apparatus where one arrow turns and the other categorically does not.
**Zero glow bindings, declared**: S3 authors `glow_focal: "nlb_arrow_block_friction"` at the state level,
which per the OPEN engine row silently voids any per-sentence binding -- so none is authored, matching the
architect's DoD (f-5) instruction rather than authoring dead bindings that would "pass" a naive count.

### STATE_4 -- 55 words, 4 sentences

| # | text_en | glow |
|---|---|---|
| s4_1 | Launched faster, the block flies higher, still frictionless. | nlb_body_block |
| s4_2 | Flag A reads minus fourteen point seven; flag B, minus twenty-nine point four. | checkpoint_1 |
| s4_3 | Coming back, both readings repeat exactly. | checkpoint_2 |
| s4_4 | Because gravity's work depends only on the start and end points, each point can be given one number -- the next concept, potential energy, is built from exactly this. | nlb_body_block |

text_hi: "तेज़ speed से launch होने पर, block ऊँचा उड़ता है, फिर भी frictionless। Flag A minus fourteen point
seven पढ़ता है; flag B, minus twenty-nine point four। वापस आते समय, दोनों readings बिल्कुल वैसी ही दोहराई
जाती हैं। क्योंकि gravity का work सिर्फ start और end points पर निर्भर करता है, इसलिए हर point को एक number दिया
जा सकता है -- अगला concept, potential energy, बिल्कुल इसी पर बना है।"

**Sentence 4 is the single, mandated, verbatim boundary sentence** (`skeleton.md` DoD f-2, "the
dispatch-approved one-liner") -- the ONE place in this entire concept "potential energy" is permitted. It
alone is 28 of the state's 55 words, which is why sentences 1-3 are held to 27 words combined --
deliberate, not accidental compression. **`checkpoint_1` on s4_2 anchors to Flag A** (the first-named,
first-crossed flag, per CALLOUT-9's per-state index); **`checkpoint_2` on s4_3 anchors to Flag B**, which
per `skeleton.md` section 3's own crossing order ("re-crosses B then A") is the FIRST flag the block
re-crosses on the way down -- matching "coming back" as the sentence's opening clause.

### STATE_5 -- explore, 32 words (0/open, exempt)

| # | text_en | glow |
|---|---|---|
| s5_1 | Change the slope, the friction, and the launch speed. | none (state focal in effect) |
| s5_2 | Turn friction to zero and gravity's total always returns to zero. | none (state focal in effect) |
| s5_3 | Raise friction high enough and the block stops partway -- it never gets back. | none (state focal in effect) |

text_hi: "Slope, friction, और launch speed बदलिए। Friction को zero कर दीजिए और gravity का total हमेशा
zero पर लौट आएगा। Friction को काफी ज़्यादा बढ़ा दीजिए और block बीच में ही रुक जाएगा -- यह कभी वापस नहीं
पहुँचता।"

Sentences 2 and 3 are the two named discoverables from `skeleton.md` section 3's S5 row, delivered as
narration rather than unrendered `annotations` (per the `explore_state_discoverables...annotations` scar
row). S5 authors `glow_focal: "nlb_body_block"` at the state level, so -- same as S3 -- zero per-sentence
bindings, declared.

### Titles and delta cues (Rule 41d -- front-loaded, the rail truncates; verbatim from `skeleton.md` section 3)

| State | Title | Delta cue (on-canvas, at most 5 words) |
|---|---|---|
| S1 | Gravity's total work over a round trip is zero | Gravity's work returns to zero |
| S2 | Friction: a round trip does not cancel its work | Friction: negative both ways |
| S3 | Friction always opposes the motion | Friction flips at turnaround |
| S4 | Gravity's work depends only on position | Same place, same number |
| S5 | Explore: slope, friction, launch speed | Change anything |

### Formula surfaces (Rule 34b -- ONE per state; Rule 38c -- algebra only; verbatim from skeleton DoD h)

S1: `W(up) + W(down) = 0`. S2: `W(up) + W(down) < 0`. S3: `W friction = -f*d (both legs)`. S4 (extended
ring): `W gravity = -mg*sin(theta)*(s - s0)`. S5: `Round trip: W gravity = 0, W friction < 0`.

**On-canvas Unicode note for json-author (Rule 34c):** the ASCII forms above are the DOCUMENTATION
spelling in this markdown file (chosen to keep this file's own transmission ASCII-safe); the AUTHORED
formula surfaces json-author writes into the JSON must use real Unicode glyphs -- theta as U+03B8 (θ),
the minus sign as U+2212 (−), the multiplication dot as U+00B7 (·). So S3's surface is authored as
`W friction = −f·d (both legs)` and S4's as `W gravity = −mg·sinθ·(s − s₀)`, not the ASCII spellings
above.

**Rule 38c notation-ladder audit: every formula surface is algebra-only, on a core or extended ring.** No
derivative, no integral, no vector operator, no cross product. **Nothing to FLAG to the founder** -- this
concept genuinely needs no calculus below the advanced ring, because it has none (skeleton section 2: "no
advanced ring exists -- this concept has no derivation of its own"). The one place a calculus reader
might expect a closed-loop line-integral notation is deliberately NOT written on canvas anywhere; the
Class-11-level algebraic equivalent (`W(up) + W(down) = 0`) is what ships, per the atomic claim's own
stated equivalence ("closed path" is equivalent to "total work sums to zero" is equivalent to "work
depends only on the endpoints").

**The engine-emitted stamp/bar numerals use ASCII hyphen-minus**, not U+2212 (`nlbEnFx` is
`toFixed + " J"`, no substitution on the nlb path -- an engine ride-along per skeleton F5, not this
concept's defect; do not "fix" it by hand-editing a stamp string).

---

## 8. `aha_moment`, `misconception_watch`, `assessment`, `coverage_map`, `real_world_anchor`

### `aha_moment` -- physics-checked

```json
"aha_moment": {
  "state_id": "STATE_2",
  "statement": "The same round trip that erases gravity's work makes friction's work larger, not zero.",
  "visual_confirmation": "Two work bars and a start-line flag: gravity's reads 0.0 J at the crossing while friction's reads minus 27.4 J on the same latched line.",
  "supporting": {
    "state_id": "STATE_1",
    "statement": "Gravity's minus 40 J is entirely recovered by the return leg -- the meter reads zero.",
    "visual_confirmation": "The gravity bar falls to minus 40.0 J at the apex and climbs back to a latched 0.0 J as the block re-crosses its own start line."
  }
}
```
**PRIMARY physics check: TRUE.** For a constant along-track force opposing motion on both legs of a
symmetric round trip (`W_friction_round_trip = -2*mu*m*g*cos(theta)*d_up`), the total is strictly more
negative than either leg -- never zero, and its MAGNITUDE is larger than the outbound leg alone. The
designated state (S2) genuinely renders both readings on one shared 70 J scale, at the same latched
instant. **14 words, inside the 15-word cap.**

**SUPPORTING physics check: TRUE.** For gravity, `W_gravity(s) = -m*g*sin(theta)*(s - s0)` is a function
of position only, so `W_gravity(s0) = 0` identically at every return to `s0`, regardless of speed or path
shape -- confirmed by the independent re-derivation in section 9 (S1's apex/return numbers). **14 words.**

**Cohesion check (carried from `skeleton.md` Block 2):** S1 plants the confident generalization ("round
trips cancel -- the bar came back") that S2 breaks one click later; S3 explains the mechanism; S4
restates S1's result in the endpoint form #6 needs. Exactly 1 primary plus 1 supporting.

### `misconception_watch` -- exactly 2 entries, S2 and S3 only (physics-checked)

| State | belief | visual_counter | one_line_fix -- physics-checked |
|---|---|---|---|
| S2 | "Retracing the path reverses friction's work the way it reverses gravity's" | At the interior flag, gravity stamps -4.9 J on both passes while friction's stamp falls from -2.5 J to -24.8 J; the latched start-line flag reads "W gravity = 0.0 J, W friction = -27.4 J", holding until the loop restarts. | **"Friction's work is negative on every leg, so a round trip adds the two losses -- it never cancels them."** Correct, not merely persuasive: `W_friction_leg <= 0` on EVERY leg because kinetic friction's along-track component is `-f*sign(v)`, so `dW = -f*abs(ds) <= 0` identically, on both legs, for any speed profile. |
| S3 | "A force keeps its direction; the return leg just runs it in reverse" | At the turnaround the friction arrow swings 180 degrees to point up-slope while the weight arrow holds its direction; the friction bar keeps falling through the reversal instead of climbing back. | **"Friction turns around with the block, so it pushes against the motion on the way down as well -- its work is negative on both legs."** Correct: kinetic friction's direction is `-sign(v)`, so it is genuinely NOT a fixed-direction force -- it is defined BY its opposition to whatever the current motion is, which is exactly why it differs from gravity (a fixed-direction force). |

S1, S4 and S5 carry NO `misconception_watch` entry -- 2 genuine pivots, not a per-state tic (founder
guardrail 2026-07-04, honoured verbatim from `skeleton.md` section 4). **Engine-can-show-the-
counter-evidence check** (CRITICAL row `misconception_beat_whose_own_evidence_confirms_the_wrong_belief`)
-- re-verified here independently: `b.f` genuinely flips sign with velocity (section 9 arithmetic,
`a_up != a_down` because friction subtracts on the up-leg and subtracts differently -- opposing gravity's
pull -- on the down-leg, which is only possible if `f`'s SIGN in the equation of motion actually
reverses), and both cited stamp pairs are producible at their claimed instants (section 9 cross-check).

### `assessment` -- 6 questions, every answer physics-checked

`mastery_definition`: A student who has mastered this concept can state that a force is conservative when
its total work around any closed path is zero, equivalently when its work depends only on the endpoints;
can explain that friction is non-conservative because its work is negative on every leg of a trip, so a
round trip adds the losses instead of cancelling them; can identify that friction's direction reverses
with the motion while gravity's does not, and connect that difference to the sign of the work on each
leg; and can state that a conservative force's work at a given point is the same number no matter which
path was used to reach it.

**q1_gravity_round_trip** (STATE_1, core) -- Stem: "A 2 kg block slides 3 m up a frictionless 30 degree
incline and slides back down to its starting point. What is the total work done by gravity over the
whole round trip?" Options: A **0 J** / B -29.4 J / C +29.4 J / D -58.8 J. Correct: A. Distractors: B
computes only the outbound leg's work and stops, forgetting the return leg cancels it; C computes only
the return leg as if it were the whole trip; D doubles the one-way loss instead of the two legs
cancelling -- the non-conservative-force error, misapplied to gravity.

**q2_friction_round_trip** (STATE_2, extended) -- Stem: "The same 2 kg block slides 3 m up a 30 degree
incline with mu = 0.5 and slides back to its starting point. What is the total work done by friction over
the whole round trip?" Options: A 0 J / B -25.5 J / C **-50.9 J** / D -101.8 J. Correct: C. Distractors: A
is the concept's headline misconception -- assumes the round trip cancels friction's work the way it
cancels gravity's; B computes only ONE leg's loss and forgets the second leg; D doubles the correct total
again by mistake.

**q3_friction_direction_flip** (STATE_3, core) -- Stem: "As a block slides up then back down the same
rough incline, which force's direction changes, and what does that do to its work?" Options: A Gravity
changes direction; its work becomes positive on the return leg / B **Friction changes direction; its work
stays negative on both legs** / C Neither force changes direction / D Both forces change direction.
Correct: B. Distractors: A swaps which force flips -- attributes the reversal to gravity instead of
friction; C misses that kinetic friction's direction genuinely reverses with velocity; D over-applies the
flip to gravity too.

**q4_flag_reading_repeats** (STATE_4, extended) -- Stem: "On a frictionless slope, flag A sits 0.6 m from
the launch point. On the way up, gravity's work reading at flag A is -14.7 J. What is the reading at flag
A when the block passes it again on the way down?" Options: A **-14.7 J, unchanged** / B +14.7 J / C 0 J /
D It cannot be -14.7 J twice, because work already done cannot repeat. Correct: A. Distractors: B assumes
the return crossing flips the sign -- importing friction's direction-flip rule onto gravity; C assumes
crossing a point a second time resets its reading to zero; D assumes a rendered reading must differ if
the direction of travel differs.

**q5_conservative_classification** (STATE_1 + STATE_2, core) -- Stem: "A force is classified as
conservative if..." Options: A **its total work around any closed path is zero** / B it always points in
the same direction as the motion / C it never does negative work / D it acts only through direct contact.
Correct: A. Distractors: B describes something unrelated to the definition (many conservative forces,
including gravity, do negative work on part of a trip); C assumes conservative means "never negative" --
gravity's own up-leg work is negative; it is the ROUND-TRIP total that must be zero, not each leg; D
confuses conservative with contact-vs-field, unrelated to the actual test.

**q6_explore_stuck_block** (STATE_5, extended) -- Stem: "On the explore slope (theta = 30 degrees), a
teacher sets mu_s well above tan(theta) and gives the block a small nudge up the slope. The block slides
a short way and comes to rest partway up. What happens to gravity's work reading after the block stops?"
Options: A It returns to zero, because every round trip must end at zero / B **It holds at whatever
negative value the block reached -- the block never returns to complete the round trip** / C It becomes
positive, because the block is now at rest / D It resets to zero automatically after a few seconds.
Correct: B. Distractors: A over-generalizes the round-trip-returns-to-zero result to a case where the
round trip never actually completes; C confuses being at rest with the WORK reading, a different quantity
entirely; D assumes the display auto-resets on a timer instead of on an actual return crossing.

**Every correct answer verified by arithmetic (section 9 confirms q1-q4's numbers independently):** q1:
`m*g*sin(theta)*d = 2*9.8*0.5*3 = 29.4`; round trip `-29.4 + 29.4 = 0` -- confirmed. q2:
`-2*mu*m*g*cos(theta)*d = -2*0.5*2*9.8*0.866*3 = -50.92` rounds to -50.9 -- confirmed (this is
`skeleton.md`'s own JEE-backwards-trace worked number, reused verbatim, not recomputed differently). q4:
`m*g*sin(theta)*0.6 = 24.5*0.6 = 14.7`, and since `W_gravity` is a pure function of `s` alone, the reading
at the same `s` is identical on both passes -- confirmed. q5 and q6 are conceptual/definitional and
verified against the atomic claim and the S5 CRITICAL-scar envelope walk in `skeleton.md` section 3
respectively (`mu_s >= tan(theta)` implies the block stays stuck at every reachable dial value --
`skeleton.md`'s own verified case-walk (ii)).

```json
"coverage_map": {
  "by_state": {
    "STATE_1": ["q1_gravity_round_trip", "q5_conservative_classification"],
    "STATE_2": ["q2_friction_round_trip", "q5_conservative_classification"],
    "STATE_3": ["q3_friction_direction_flip"],
    "STATE_4": ["q4_flag_reading_repeats"],
    "STATE_5": ["q6_explore_stuck_block"]
  },
  "non_assessed_states": []
}
```

### `real_world_anchor` (Rule 35 universal, Rule 41 plain -- verbatim from `skeleton.md` section 9, physics-checked)

```json
"real_world_anchor": {
  "primary": "A heavy bag lifted onto a shelf and later brought back down. While the bag goes up, gravity's work on it is negative; while it comes down, gravity's work is positive and equal in size -- over the up-and-down round trip, gravity's total work is exactly zero.",
  "secondary": "Sliding a box across the floor to a door and dragging it back. Friction points against the box on the way out and against it again on the way back: its work is negative on both legs, and the round trip adds the two losses instead of cancelling them."
}
```
**Primary physics check: TRUE** -- this is S1's own closed path, turned vertical (a lift-and-lower is a
1-D round trip against a constant force, exactly `W_gravity_round_trip = 0`). **Secondary physics check:
TRUE** -- kinetic friction opposes velocity on both the out-trip and the back-trip, so its work is
negative both times, exactly S2's claim. Neither anchor names a place, festival, food, currency, brand or
personal name; both are physics-true at full depth, not a surface analogy. No energy vocabulary in
either (boundary with #9/#10, per CALLOUT-10).

---

## 9. Numerical sanity check -- independent light re-verification (Python, spot-check not a third full re-derivation)

Per the dispatch's explicit instruction, every settled number below is reused VERBATIM from
`skeleton.md`'s "Arithmetic" section (already independently re-derived twice: architect cycle 1,
founder-proxy cycle 2). This is a light confirmation pass, run to satisfy this role's own self-review
checklist item, not a disagreement with anything sealed.

```
m = 5 kg, g = 9.8 m/s^2, theta = 30 deg
mg sin(theta)          = 24.5000 N        (sealed: 24.5)      MATCH
N = mg cos(theta)       = 42.4352 N        (sealed: 42.4354)   MATCH to 4 s.f.
f = 0.3 * N              = 12.7306 N        (sealed: 12.7306)   MATCH
a_up   = g(sin+mu cos)   = 7.446115 m/s^2   (sealed: 7.4461)    MATCH
a_down = g(sin-mu cos)   = 2.353885 m/s^2   (sealed: 2.3539)    MATCH
tan(30) = 0.5774 > mu 0.3                                       slide-back guaranteed, MATCH

S1 (frictionless, v0=4): d_up = v0^2/(2*4.9)  = 1.6327 m         (sealed: 1.6327)   MATCH
S2 (mu=0.3, v0=4):       d_up = v0^2/(2*7.446)= 1.074386 m       (sealed: 1.0744)   MATCH
   round-trip friction W = -mu*N*2*d_up = -27.355 -> -27.4 J     (sealed: -27.4)    MATCH
   INDEPENDENT cross-check via work-energy theorem (a route neither prior pass used
   for this exact number): v_return = sqrt(2*a_down*d_up) = 2.24899 m/s
   dK = 1/2*m*(v_return^2 - v0^2) = -27.355 J
   Since W_gravity_round_trip = 0 identically, delta-K must equal W_friction_round_trip alone
   -- and it does, to 3 decimal places.                                              CONFIRMED

S3 (mu=0.3, v0=3): d_up = v0^2/(2*7.446) = 0.60434 m             (sealed: 0.6043)   MATCH
   flag at 0.55 m, out-crossing: W = -f*0.55 = -7.002 -> -7.0 J   (sealed: -7.0)     MATCH
   pass-2 path length = d_up + (d_up - 0.55) = 0.65868 m
   W pass-2 = -f*0.65868 = -8.385 -> -8.4 J                       (sealed: -8.4)     MATCH

S4 (frictionless, v0=5): flag A at 0.6 m: W = -24.5*0.6 = -14.7 J (sealed: -14.7)   MATCH
                          flag B at 1.2 m: W = -24.5*1.2 = -29.4 J (sealed: -29.4)   MATCH
```

**Nothing refuted; nothing recomputed differently from the sealed values.** One thing this pass adds that
neither prior arithmetic pass used: **the work-energy-theorem cross-check on S2's headline -27.4 J
number** (`delta-K = sum of W` independently reaches the identical figure via the block's actual return
speed, not via the force-times-distance route both prior passes used) -- an independent confirmation
route, not a re-derivation of the same method.

---

## 10. Modes-by-phase statement

This concept's phase (Class 11 Ch.6, Work Energy and Power) has **not opened board or competitive mode**
-- the conceptual-only directive (Rule 20 [D]) is active chapter-wide, same as concepts #1-#4 in this
chapter. The DoD requires **EPIC-L only**. json-author should author no `mode_overrides` block and no
`derivation_sequence` -- their presence would be a Gate-8 finding, not a completeness gap. When board mode
eventually opens for this chapter, `skeleton.md`'s existing state/checkpoint/formula-surface structure is
already shaped to carry a 1-mark-per-state scheme (5 guided states = 5 marks minimum, per Rule 21) without
re-architecture -- but that authoring does not happen now.

---

## 11. Self-review checklist

- [x] Every symbol referenced in the state narratives appears in `variables` -- m, theta_deg, mu_s, mu_k,
  v0, g, N, f, s, d, W_gravity, W_friction.
- [x] `radians()` for every angle argument -- every sin/cos in section 1's formulas wraps theta_deg in
  radians(...). No bare-degree trig call anywhere.
- [x] Every state's live control(s) declared per the architect's control table -- S1-S4 empty (verified
  against the CRITICAL-scar zero-slider discipline, section 3), S5 theta/mu_s/mu_k/v0 with min, max,
  step, default for each (section 1).
- [x] `variable_overrides` documented, justified per state (section 2) -- including the two that silently
  destroy an aha if inherited wrong (S2's mu values; S3's v0 = 3 vs S2's v0 = 4).
- [ ] Board mark scheme -- DEFERRED, Rule 20 [D], declared empty in section 4 and section 10.
- [x] Drill-down cluster phrasings -- 9 clusters times 5 phrases = 45 total, real student voice, plain
  English, no Hinglish, no teacher register (section 5).
- [x] `constraints` block, 6 short factual assertions, conservation-shaped first (closed-path zero;
  friction never positive; the round-trip total strictly negative), no pedagogy (section 1).
- [x] Numerical sanity check run -- independent Python spot-check (section 9), all sealed numbers
  confirmed to the printed decimal, plus one NEW cross-check route (work-energy theorem on S2's -27.4 J)
  neither prior pass used.
- [x] Within-state motion timeline for every state (section 3) -- every row a t-window times
  what-animates times driven-by, every branch a pure function of the state clock (Rule 26), no state
  static, no two states sharing a motion, controls column matches the architect table exactly. No
  `pause_after_ms` carried -- new concept.
- [x] Rule 32 verified per state (section 3) -- 32a argued from the actual render order (bar cannot move
  before b.s in the same integration step); 32b (only friction's orientation changes in S3,
  position/ledgers only elsewhere); 32c all cues at most 5 words; 32d single home pose -3.6 in all five
  states, one camera S1-S4; 32e at most one state focal, never more.
- [x] Word budget (Rule 31a) -- 53/55/50/55 guided (all inside 25-55; S2/S4 declared at the top of the
  cap, same declared-deviation pattern as the `kinetic_energy_definition` precedent), S5 explore 32,
  exempt.
- [x] Notation ladder (Rule 38c) -- every formula surface algebra-only, core/extended ring only. Nothing
  to FLAG to the founder -- no calculus is genuinely needed anywhere in this concept (no advanced ring
  exists). Dialect (38d): N/A, no board-divergent term in this concept's vocabulary.
- [x] Engine bug queue consulted live (section 0); every relevant `prevention_rule` satisfied at a named
  site, or declared N/A with a reason -- none required a founder-facing exception.
- [x] DC Pandey check -- no formula, explanation, example problem, figure or phrasing imported from DC
  Pandey, HC Verma or NCERT. Every question in section 8, both anchors, every narration sentence and
  every drill-down phrase is authored from Newton's laws and the closed-path work definition directly.
  The one numeric scenario reused across q1/q2 (2 kg, 30 degrees, mu = 0.5, 3 m) is the ARCHITECT's own
  Block-1 "JEE-backwards trace" worked example (`skeleton.md`, independently derived there, not copied
  from a book), reused here for internal consistency rather than inventing a fresh untraceable number set.

---

## 12. Handoff to json-author

Author from **this document plus `skeleton.md`**, with no deviation from either sealed design:

1. **`m` is a `constant: 5`, never a slider** -- do not add a mass control on S5 "for symmetry" with
   `kinetic_energy_definition`; it is not in the sealed control table.
2. `work_accumulators` per CALLOUT-2 (order matters, gravity first where both exist); `checkpoints` per
   CALLOUT-1 (six flags, arithmetic literals only, never a bare displacement); `capture: ["W"]` on all
   six; `capture_mode` exactly as tabled ('first' on the two start-line latches ONLY).
3. `surface.frictionless: true` on **S1, S4 only**; `mu_s: 0.3, mu_k: 0.3` explicit on **S2, S3**; S5
   defaults `theta_deg: 30, mu_s: 0.3, mu_k: 0.3, v0: 4` with no `frictionless` key.
4. `initial_position_m: -3.6` in **every one of the five states**, `mass_kg: 5` explicit in every state's
   `bodies[]` block (section 2).
5. `initial_velocity_mps`: S1 = 4, S2 = 4, S3 = **3** (not 4), S4 = **5** (not 4), S5 slider default = 4.
6. `loop_reset_ms`: **1850 / 1700 / 1400 / 2100**, none on S5. `advance_mode`: `manual_click` S1-S4,
   `interaction_complete` S5.
7. `work_scale_J`: **70** on S1-S4, **460** on S5 (CALLOUT-6 -- never change without re-running the
   zero-overflow audit).
8. `arrows.show`: S1 ["weight"] (plus `show_components: true`), S2 ["weight"] (**no friction arrow --
   CF-6, do not regress**), S3 ["weight","friction"], S4 ["weight"], S5 ["weight","friction"].
9. `displacement_vector` on **S1 and S5 only** (CALLOUT-8). **No `angle_arc` anywhere** (CALLOUT-7).
10. Every `tts_sentences` entry carries the `glow` (or explicit none, per the state-focal opt-out) given
    in section 7. **Never bind a glow to a `work_bar_*` id.**
11. `text_hi` authored from section 7, `text_te` NOT authored (Rule 30i).
12. `glow_focal`: S1/S2/S4 author **none**; S3 = `nlb_arrow_block_friction`; S5 = `nlb_body_block`.
13. Zero `energy_layer`, zero `height_markers`, zero `sum_merge`, zero `phases`, zero `mode_overrides`,
    zero `applied_force` anywhere in this concept.
14. `slider_controls` (concept-wide, S5 only): theta {5,45,5,30}, mu_s {0,0.6,0.05,0.3}, mu_k
    {0,0.6,0.05,0.3}, v0 {0,6,0.5,4} -- key `default`, never `def`.
15. `assessment` + `coverage_map` verbatim from section 8; `misconception_watch` exactly the 2 entries in
    section 8 (S2, S3 only); `aha_moment` verbatim from section 8; `real_world_anchor` verbatim from
    section 8.
16. `curriculum_tags`: CBSE/NCERT verified; IB/AP/A-Level/JEE/NEET as claims with
    `needs_teacher_verification: true` (per `skeleton.md` DoD i-4 -- unchanged by this block).

**Checks to run before declaring done:** `npx tsc --noEmit` at 0, `npm run validate:concepts` passing on
this id, the eight registration sites, then THE EYE, with the CF-4 (eye-walker contrast pass -- flag-post
occlusion at the recross/S3 pin) and CF-5 (this block's section 7 pacing argument -- verify live, not
just from the frozen pin, per `skeleton.md`'s own "judge the latch from dense frames or live play, not
the frozen pin") items handed forward from Checkpoint A cycle 2.

**Not carried forward from this block (belong to json-author/quality-auditor/eye-walker directly, per
`founder_proxy_A_cycle2.md`):** CF-1 (Gate-8 paperwork, two named exemption clauses), CF-2 (the
dwell-lengthening lever -- an OPTIONAL Checkpoint-B taste call, not authored here), CF-3 (an optional S1
interior flag -- not authored here, the sealed design does not include it), CF-4 (eye-walker's own
contrast-pass sampling), CF-7 (Checkpoint B's D6/D7 scoring). This block discharges CF-5 only, which was
addressed to `physics_author` by name.
