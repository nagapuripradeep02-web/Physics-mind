# PHYSICS BLOCK — `potential_energy_definition` — cycle 1 (post Checkpoint-A `DESIGN_OK`, 2026-08-09)

> Input: `docs/loop_runs/ch6/potential_energy_definition/skeleton.md` (cycle 1, 322 lines) +
> `founder_proxy_A.md` (cycle 0) + `founder_proxy_A_cycle2.md` (cycle 2, final `DESIGN_OK`).
> Renderer: `field_3d` / `newtons_laws_body`. Route (a) implemented (one `h_ref_m = -3.05` in all
> four states). Board mode DEFERRED (Rule 20 [D]) — no `mode_overrides` authored.
> **All arithmetic in this block was independently re-derived from the skeleton's own constants
> (m, g, theta, s0, v0, h_ref, mu_k) before being compared against the architect's and
> founder-proxy's numbers — every value reproduced exactly, see the summary at the end.**

## Engine bug queue consultation (pre-authoring)

Ran `npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts --owner alex:physics_author`
and `--owner alex:json_author`. Relevant FIXED/OPEN prevention rules honoured in this block:

- `nlb_signed_bar_half_range_breaks_equal_value_pairing_with_an_unsigned_bar` (FIXED) —
  `bar_max_J = 2 x work_scale_J` in every energy/work-bar state. Already the skeleton's own §3
  scale plan (290/145 guided, 560/280 sandbox); restated in §6 below as a physics-author-owned
  invariant so json_author cannot silently equalize the two scales.
- `computed_output_name_encodes_a_symbol_no_instrument_paints_so_every_reading_is_harvested_then_discarded`
  (CRITICAL/OPEN) — `computed_outputs` keys are named to the exact painted caption
  (`U_J`->"U", `gravity_J`->"gravity", `friction_J`->"friction"), never a compound like
  `W_pull_J`. Applied in §1.
- `prose_in_a_variable_derived_field_deletes_its_painted_value_from_scope...` (CRITICAL/OPEN) —
  every `derived` field below is a pure expression, never a sentence; independent painted
  quantities (`v0`, `mu_s`, `mu_k`, `m`, `g`, `theta`, `h_ref`, `s0`) carry no `derived` key at all.
- `nlb_signed_launch_velocity_state_never_renders_K0...` (FIXED) — N/A here, no K bar anywhere
  in this concept (confirmed against the skeleton's own boundary list).
- `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` (DIRECTIVE/OPEN)
  — re-verified: mg = 39.2 N -> 39.2 x 0.048 = 1.882 world units = 3.4x the 0.55 floor. Clears
  with margin; only one arrow (weight) is ever drawn, no ratio to protect.
- `concept_ships_zero_narration_glow_bindings` (MAJOR/OPEN) — out of physics_author's formula
  scope, but flagged here for continuity: the glow-binding duty (skeleton f-5, id whitelist)
  is json_author's to discharge against the tts_sentences I hand down in §3.

No FIXED row required a change to this design; nothing here contradicts the architect's own §0
scar disposition (already exhaustive on `newtons_laws_body`).

---

## 1. `physics_engine_config`

The `newtons_laws_body` scenario computes `s(t)` internally via its own semi-implicit-Euler
kinematics (piecewise-constant acceleration per phase); it is NOT evaluated through an authored
PM_interpolate formula string. The block below is therefore the DOCUMENTED closed form the engine's
internal functions realize (`nlbHeightM`, `b.U_grav_J`, `nlbRunWorkAccum` — all cited with line
numbers in the skeleton's §0.0), given here so json_author and quality_auditor can hand-check any
frame against it. `theta` is authored in DEGREES; every trig call wraps it in `radians()`
(field_3d/newtons_laws_body dialect — NOT the PCPL "no radians()" gotcha, that applies only to
`parametric_renderer.ts` expressions).

```json
{
  "variables": {
    "m":     { "name": "mass", "unit": "kg", "constant": 4 },
    "g":     { "name": "gravitational acceleration", "unit": "m/s^2", "constant": 9.8 },
    "theta": { "name": "incline angle", "unit": "deg", "constant": 30 },
    "h_ref": { "name": "energy reference height (the U = 0 line, measured from the ramp's foot)", "unit": "m", "constant": -3.05 },
    "s0":    { "name": "home position along the track (+s is up-slope)", "unit": "m", "constant": -3.6 },
    "v0":    { "name": "launch speed", "unit": "m/s", "min": 0, "max": 8, "default": 8, "step": 0.5 },
    "mu_s":  { "name": "coefficient of static friction", "unit": "(dimensionless)", "min": 0, "max": 0.5, "default": 0, "step": 0.05 },
    "mu_k":  { "name": "coefficient of kinetic friction", "unit": "(dimensionless)", "min": 0, "max": 0.5, "default": 0, "step": 0.05 },
    "N":     { "name": "normal force", "unit": "N", "derived": "m * g * cos(radians(theta))" },
    "f_k":   { "name": "kinetic friction magnitude", "unit": "N", "derived": "mu_k * N" },
    "F_grav_parallel": { "name": "gravity's component along the incline (always down-slope)", "unit": "N", "derived": "m * g * sin(radians(theta))" }
  },
  "formulas": {
    "h_of_s":        "s * sin(radians(theta)) - h_ref",
    "U_grav":        "m * g * (s * sin(radians(theta)) - h_ref)",
    "W_gravity":     "-(m * g * sin(radians(theta))) * (s - s_ref)",
    "W_friction":    "-(mu_k * m * g * cos(radians(theta))) * path_length_since_s_ref",
    "a_free":        "g * sin(radians(theta))",
    "a_up_rough":    "g * (sin(radians(theta)) + mu_k * cos(radians(theta)))",
    "a_down_rough":  "g * (sin(radians(theta)) - mu_k * cos(radians(theta)))"
  },
  "computed_outputs": {
    "U_J":        "U_grav",
    "gravity_J":  "W_gravity",
    "friction_J": "W_friction"
  },
  "constraints": [
    "Delta-U = -W_gravity at every instant, for any motion, rough or smooth, guided or dragged (the definitional law this concept teaches)",
    "U = m * g * (s * sin(theta) - h_ref) is a pure function of position s only, never of time or velocity directly",
    "friction's work is path-dependent (proportional to cumulative |ds| since s_ref, not to net displacement), so friction has no potential energy",
    "U >= 0 everywhere on the track for h_ref = -3.05 m; the guard margin is >= 1.96 J at the track's lowest reachable point (s = -6 m), not 0.98 J (see Section 6, P3-a)",
    "h_ref = -3.05 m is IDENTICAL in all four states -- the U = 0 reference never moves at any state transition (Rule 32d)",
    "normal force N = m * g * cos(theta) is constant -- the block never leaves the incline surface in any state"
  ]
}
```

`s_ref` and `path_length_since_s_ref` are bookkeeping, not authored sliders: `s_ref = s0 = -3.6`
for S1-S3 (the home pose, fixed for the whole guided loop); for S4, `s_ref` re-anchors at every
wrap (the engine's `nlbSandboxWrapRemap` FIXED-row behaviour, relied on unchanged) — so S4's
"changes since the wrap" narration duty (skeleton f-3) is engine-native, not something
physics_author has to script.

---

## 2. Per-state `variable_overrides`

Following the `hinge_force.json` STATE_4 / `field_forces.json` STATE_5 defensive pattern — lock
every value a state's narrative assumes, even when it numerically equals the global default,
because an upstream leak (session 30.5-30.7 bug class) would otherwise silently carry a prior
state's slider value forward.

| State | `variable_overrides` | Why |
|---|---|---|
| S1 | `{ v0: 8, mu_s: 0, mu_k: 0 }` | Frictionless ascent/descent; S1 authors zero sliders, so these must be locked scenario params, not inherited from S2's rough values or S4's slider defaults. |
| S2 | `{ v0: 8, mu_s: 0.35, mu_k: 0.35 }` | The rough trip — the ONLY state where friction is nonzero. Locking both coefficients prevents an S1-frictionless leak or an S4-slider leak. |
| S3 | `{ v0: 7, mu_s: 0, mu_k: 0 }` | v0 = 7 is deliberately DIFFERENT from S1/S2's 8 (keeps S3's numeral set collision-free, per the skeleton's cross-state freshness check); frictionless, locked defensively same as S1. |
| S4 | none (all three are LIVE sliders: `v0`, `mu_s`, `mu_k`, defaults 8/0/0) | This is the one state where the values are meant to move under teacher control — an override here would defeat the slider. |

`h_ref = -3.05` and `s0 = -3.6` carry NO per-state override — they are `constant` in every state
(§1). This is itself the fix for the P1-3 finding (cycle 0): a single unchanging reference means
there is no teleport at the click into S4.

---

## 3. Within-state motion timeline + per-state control spec (Rule 31) + authored narration

**Control spec (all four states):** S1/S2/S3 expose **zero** sliders (`controls_visible: []`,
guided, Rule 31 only-what-this-state-teaches — there is nothing to control, the physics is fully
determined by the locked overrides in §2). S4 exposes **ALL**: `v0` (0-8, step 0.5, default 8),
`mu_s` (0-0.5, step 0.05, default 0), `mu_k` (0-0.5, step 0.05, default 0), plus
`trusted_drag_seizes: true`. This matches the architect's §3 control table exactly.

Every motion row below is a pure function of `time - stateStartTime` (Rule 26) — nothing is driven
by narration or TTS events; the crossings/apexes/loop-resets are position/time facts of the
constant-acceleration kinematics, independent of anything spoken.

### STATE_1 — `work_stored_as_potential_energy` (core · `cycle-compare` · v0 = 8 m/s, frictionless)

| t-window (state clock, ms) | What animates | Driven by | Live controls |
|---|---|---|---|
| 0 -> 1632.7 (ascent to apex) | Block climbs `s(t) = s0 + v0*t - 0.5*a_free*t^2`; U bar rises 49.0 -> 177.0 J; gravity work bar falls 0 -> -128.0 J (32a: block moves first, bars follow within one visible beat) | `s(t)`, `a_free = 4.9 m/s^2` | none |
| 1632.7 (apex, v = 0) | Momentary top: U = 177.0 J, W_gravity = -128.0 J — an exact mirror (no frame-slack excursion, since v = 0 here means no folded-step overshoot) | `s(t)` | none |
| 1632.7 -> 3150 (descent, frozen pin at 1890) | Block descends; U falls back 177.0 -> 66.4 J; gravity's work climbs back -128.0 -> -17.4 J. Frozen pin at **1890 ms**: U = 173.8, W = -124.8 (Delta-U = 124.8 = \|W\|, the M-1 measurement frame) | `s(t)` | none |
| 3150 (`loop_reset_ms`) | Ledgers/position rewind to s0 = -3.6, U resets to 49.0 exactly; cycle repeats | loop reset (`nlbResetTrajectory` + `nlbSpringPhysReset`) | none |

**Narration (`text_en`, 55 words — top of the 25-55 band, matches the skeleton's "top of budget"
flag for the compressed anchor hook; verified via `wc -w`, zero banned-vocabulary hits):**

> "Like a pumped-storage plant, this block stores energy by position. U, the potential energy,
> counts from the dashed line at the ramp's foot, opening at 49.0 joules. Going up, gravity's work
> falls to negative 128 joules while U climbs equally. Coming down, gravity's work turns positive,
> climbing back toward zero as U falls back equally."

Satisfies the **P2-1 binding hand-down**: "empties"/"empty" struck completely; uses "falls back"
(the architect's own suggested verb) both times a descent is described. Names the dashed line and
the 49.0 J opening exactly once (DoD b). Names the pumped-storage anchor as one compressed clause
(Rule 35, §9 primary anchor). Expands U to "the potential energy" at first mention (Rule 30); bare
`U` thereafter reads naturally in continuous prose. `misconception_watch` beat: "negative work
means the energy is gone" — the visual_counter is exactly the U-bar-climbs-as-gravity-bar-falls
picture this narration describes, both directions.

### STATE_2 — `friction_has_no_potential_energy` (core · `cycle-compare`, declared contrast pair with S1 · v0 = 8 m/s, rough)

| t-window (ms) | What animates | Driven by | Live controls |
|---|---|---|---|
| 0 -> 1016.5 (ascent to apex) | Block climbs under `a_up_rough = 7.8705 m/s^2` (steeper deceleration than S1's frictionless case — 32b: this IS the one taught-variable change from S1, everything else holds pose); U bar rises 49.0 -> 128.7 J; gravity work bar falls 0 -> -79.7 J; a THIRD bar (friction) appears and falls 0 -> -48.3 J | `s(t)`, `a_up_rough` | none |
| 1016.5 (apex) | U = 128.7, W_gravity = -79.7, W_friction = -48.3 — U still exactly mirrors gravity's ledger; friction has no partner | `s(t)` | none |
| 1016.5 -> 2950 (descent, frozen pin at 1770) | Block descends under `a_down_rough = 1.9295 m/s^2`; U falls back 128.7 -> 58.0 J; gravity's work climbs back -79.7 -> -9.0 J; friction's work CONTINUES falling -48.3 -> -91.2 J (both legs negative — the picture S1 cannot draw). Frozen pin at **1770 ms**: U = 118.0, W_gravity = -69.0 (Delta-U = 69.0 = \|W_gravity\|), W_friction = -54.8 | `s(t)` | none |
| 2950 (`loop_reset_ms`) | Rewind to s0, all three ledgers re-zero, U resets to 49.0 | loop reset | none |

**Narration (`text_en`, 50 words — at the band's top, matches skeleton's 35-50 flag; `wc -w`
verified, zero banned-vocabulary hits):**

> "Same rough slope, same launch speed. A third bar joins: friction, falling going up, and falling
> coming down. No partner rises to meet it. U keeps its joule-for-joule lock with gravity's work,
> both ways. Friction's joules become heat, a later lesson tracks them. Only conservative forces
> have a potential energy."

Satisfies the **P3-c binding hand-down**: "leave the block as heat" replaced with "become heat" —
no locative claim (the dissipated joules become internal energy of the block AND the ramp; "leave"
falsely implies the block sheds them). The destination is named in the SAME breath as the
no-partner picture (P1-2's original fix intent, preserved): screen-fact then destination, closing
off the "therefore destroyed" inference. `misconception_watch` beat: "work against ANY force is
stored, friction too" — the counter is exactly this no-mirror-plus-named-destination picture.

### STATE_3 — `delta_u_between_two_points` (extended · `reveal-build` · v0 = 7 m/s, frictionless)

**Checkpoint flags (per the P3-b binding hand-down — B MOVED from `s0 + 4.0` to `s0 + 4.4`):**

| Flag | Position `s_m` | Physics-clock crossing | Stamp (U, W_gravity) |
|---|---|---|---|
| A (unchanged) | `s0 + 2.0 = -1.6` | 322.0 ms, v = 5.422 m/s | U = 88.2 J, W = -39.2 J |
| B (**moved**) | `s0 + 4.4 = +0.8` | 933.7 ms, v = 2.425 m/s | U = 135.2 J, W = -86.2 J |

Both `{ capture: ['U_grav','W'], capture_mode: 'first', marker: 'point', dwell_ms: 2000 }`,
`dwell_from_pass` default 1 (fires on the stamped ascent pass only).

| t-window (ms, WALL CLOCK incl. dwells) | What animates | Driven by | Live controls |
|---|---|---|---|
| 0 -> 322.0 | Block ascends toward point A | `s(t)`, `a_free` | none |
| 322.0 | Crossing A: stamp latches `point A:  U = 88.2 J . W gravity = -39.2 J`; scene FREEZES (badge `paused: point A`) | crossing-triggered dwell scheduler | none |
| 2322.0 -> 2933.7 | Physics resumes; block continues ascending from A toward B | `s(t)` | none |
| 2933.7 | Crossing B: stamp latches `point B:  U = 135.2 J . W gravity = -86.2 J`; scene freezes again (badge `paused: point B`) | crossing-triggered dwell scheduler | none |
| **3933.7 -> 3934 (`eye_capture_ms`, RECOMPUTED — see below)** | Mid-B-dwell: both stamps visible simultaneously, live bars trail the B stamp by <= 0.79 J (the declared one-step residual) | authored `eye_capture_ms` | none |
| 4933.7 -> 6600 (`loop_reset_ms`, unchanged) | Physics resumes; block completes the ascent to apex (U = 147.0 J at 1428.6 ms physics) and descends to the loop-end (U = 81.1 J at 2600 ms physics) | `s(t)` | none |
| 6600 | Stamps clear, flags re-arm from seed, loop repeats | loop reset | none |

**Recomputed clock cascade from the B move (all reproduced independently — see summary):**
`T_B` (physics) = 933.7 ms -> wall-clock = 322.0 (A's own crossing) + 2000 (A's dwell) +
(933.7 - 322.0) = **2933.7 ms**; hold to 4933.7; `loop_reset_ms = 6600 >= 4933.7 + 500 = 5433.7`
holds (margin 1166.3 ms, `[PM_NLB_DWELL]` never fires); **`eye_capture_ms = 2933.7 + 1000 = 3933.7`,
authored as `3934`** (margins 1000/1000 from both dwell-window edges) — **this REPLACES the
architect's `3790`**, which was computed against the old B position and is now stale. B's
freeze-residual IMPROVES from 1.02 J to `19.6 * 2.425 / 60 = 0.79 J` (v_B fell from 3.13 to
2.425 m/s at the later crossing point). A's crossing, dwell and 1.77 J residual are UNCHANGED —
only B and everything timed off it moves.

**Narration (`text_en`, 54 words — inside the 45-55 band; `wc -w` verified, zero banned-vocabulary
hits; the closing sentence is HELD VERBATIM per the coordinated ruling with `gravitational_potential_energy`):**

> "Slower launch this time. The block crosses point A, then point B, the scene freezes. The levels
> don't match, but the change does: U rose by 47.0 joules, and gravity's work fell equally. The next
> concept gives gravity's U its own formula, and lets you place the U = 0 line wherever you like."

Reads the CHANGE (47.0 J = 135.2 - 88.2 = -(-86.2 - (-39.2))), never a level and never the live-bar
transient — the individual level numbers (88.2/-39.2/135.2/-86.2) are already legible on the
latched stamp text itself (DoD symbol-label table), so narration is not required to re-speak all
four; this is a word-budget-forced design choice, flagged for the parent session below. States the
level-vs-change contrast explicitly ("levels don't match, but the change does") per the (f-3) duty.
**47.0 no longer collides with any other rendered numeral in the state** (the whole point of moving
B) — under the OLD B position, `Delta-W(A->B) = -39.2` was numerically identical to `W(A) = -39.2`;
under the new B, `Delta-U(A->B) = 47.0` and `Delta-W(A->B) = -47.0` match nothing else on screen
(rendered set: `{88.2, -39.2, 135.2, -86.2}`).

### STATE_4 — `explore` (core, explore · `drag-sandbox` · opens moving, mu defaults 0)

| t-window | What animates | Driven by | Live controls |
|---|---|---|---|
| continuous, free-running (Rule 37 — never auto-freezes) | Block motion under whatever `v0`/`mu_s`/`mu_k`/drag the teacher sets; U bar tracks height above the SAME dashed line as every guided state; gravity + friction ledgers accumulate since the last wrap or the last trusted drag; friction bar falls whichever direction the block moves | live `v0`, `mu_s`, `mu_k`, `trusted_drag_seizes` | `v0` (0-8, step 0.5, default 8) · `mu_s` (0-0.5, step 0.05, default 0) · `mu_k` (0-0.5, step 0.05, default 0) + drag |
| wrap at s = +/-6 | Position re-anchors, `s_ref` resets to the wrap point, ledgers re-zero | wrap boundary | (same) |

**Narration policy: zero scripted `tts_sentences` (word budget "0/open" per Rule 31 — the final
explore state).** The (f-3) duty "S4 speaks in changes-since-the-wrap and names the dashed line" is
discharged by the engine-native "so far" HUD qualifier on the live ledgers (§0.B, the declared
dwell-residual honesty mechanism extended to the sandbox case) — NOT by authored TTS, since S4 is
teacher-driven and open-ended by design. No `misconception_watch` (S3/S4 carry none, per the
founder's pivots-only guardrail).

---

## 4. Board-mode mark scheme + derivation sequence

**DEFERRED.** Conceptual-only directive active (Rule 20 [D], founder 2026-06-11). No
`mode_overrides` authored for this concept. Skip entirely per the standing suspension.

---

## 5. Drill-down cluster phrasings (9 clusters x 5 real-student phrases, plain English, no Hinglish)

### S1 clusters

**`where_negative_work_goes`**
1. "if gravity does negative work where does that energy go"
2. "does negative work mean energy disappeared"
3. "how can work be negative and energy still increase"
4. "gravity did negative work so where did the energy actually go"
5. "is negative work the same as losing energy"

**`stored_energy_returns_on_descent`**
1. "why does the energy come back when it falls"
2. "does the block get back the same energy it stored"
3. "why does U go down again on the way down"
4. "how does the potential energy return to the block"
5. "is the energy given back exactly or only part of it"

**`sign_of_delta_u`**
1. "why is delta U positive when the block goes up"
2. "why is delta U negative when it comes down"
3. "does delta U being negative mean energy is lost"
4. "how do i know the sign of delta U without calculating"
5. "why does going up make delta U positive but W negative"

### S2 clusters

**`why_only_conservative_forces_have_u`**
1. "why cant every force have a potential energy"
2. "why does friction not get its own U"
3. "what makes a force conservative or not"
4. "why does the definition need the word conservative"
5. "can normal force have a potential energy too"

**`friction_work_is_not_stored`**
1. "if friction does negative work why is it not stored like gravity"
2. "why doesn't friction's work come back like gravity's does"
3. "is friction's work also stored somewhere we cant see"
4. "why is friction's negative work different from gravity's negative work"
5. "does pushing against friction store energy the same way as lifting"

**`round_trip_test_recap`**
1. "what was that round trip test again"
2. "why does the round trip decide if a force has a U"
3. "how do i check if a force is conservative using a round trip"
4. "why does friction's work not cancel on a round trip"
5. "what happens to gravity's work on a full round trip"

### S3 clusters

**`computing_delta_u_from_work`**
1. "how do i calculate delta U between two points"
2. "do i just use minus W to get delta U"
3. "what work value do i plug into delta U equals minus W"
4. "how do i find the change in potential energy from work done"
5. "is delta U always equal to minus the work by gravity"

**`u_level_vs_u_change`**
1. "why doesn't U equal minus W at every point"
2. "if U is not minus W then what is actually true"
3. "why do the U and W numbers not match on the screen"
4. "is it the level or the change that has to match"
5. "why does the difference work but the actual values dont"

**`minus_sign_in_the_definition`**
1. "why is there a minus sign in delta U equals minus W"
2. "what happens if i forget the minus sign"
3. "why is potential energy defined with a negative sign"
4. "does the minus sign mean the energy is negative"
5. "where does the minus sign in the definition come from"

---

## 6. Constraint callouts

- **radians() conversion (field_3d/newtons_laws_body dialect):** every trig call in §1's formulas
  wraps `theta` in `radians()` — `theta` is authored/painted in DEGREES (30), never radians. This is
  the OPPOSITE convention from PCPL/`parametric_renderer.ts` (which has no `radians()` helper at
  all) — do not cross-apply the PCPL gotcha here; this concept is field_3d only.
- **P3-a fix (negative-U guard margin):** `skeleton.md:300` states "margin >= 0.98 J at the
  physical bound" — this is WRONG. Correct: `U(s = -6) = 19.6 * (-6 + 6.1) = 19.6 * 0.1 = 1.96 J`.
  The skeleton's own error applied the 19.6 N/m along-slope rate to the 0.05 m HEIGHT margin
  (`h_min - h_ref = -3.0 - (-3.05) = 0.05`) instead of the 0.1 m TRACK-position margin
  (at `s = -6`, `s + 6.1 = 0.1`, so `U = 19.6 * 0.1 = 1.96`). Safe direction (understates by 2x)
  but must be corrected in the shipped concept, since this guard is what an H4 EYE FAIL rests on
  (commit `bb32001` made `[PM_NLB_ENERGY_SCALE_WARN]` a real gate failure, not filtered noise).
  The drag-inset figure on the same line (`19.6 * 0.65 = 12.74` J at `s_min = -5.45`) was already
  correct and needs no change.
- **P3-b cascade (S3 flag B move — full downstream recompute, see §3 STATE_3 for the derivation):**
  flag B moves from `s_m = +0.4` to `s_m = +0.8`; stamp values become U = 135.2 / W = -86.2
  (was 127.4 / -78.4); `eye_capture_ms` becomes **3934** (was 3790); B's dwell-residual improves to
  0.79 J (was 1.02 J); A, its dwell, `loop_reset_ms` (6600) and every S1/S2/S4 number are UNCHANGED.
  json_author must author the flag position and `eye_capture_ms` exactly as given here, never the
  architect's pre-fix values.
- **Scale invariant (restated, unchanged from architect):** `bar_max_J = 2 x work_scale_J` in
  every energy/work-bar state — guided **290/145**, sandbox **560/280**. One joule maps to one
  pixel height on BOTH bar families (`nlbFitEnergyPanel` writes one `S.trk` height to every
  `.nlb_en_trk`), so equal joule CHANGES move equal pixels on every reflow rung — never author the
  two scales equal to each other (that pairs a value with itself at HALF the height on the signed
  bar, the FIXED bug this row exists to prevent).
- **Vocabulary corrections carried forward as binding text (not just guidance):** every rendered
  string describing the U bar uses "falls back" / "returns" / "climbs back" — NEVER "empties" or
  "empty" (P2-1). The friction-destination clause reads "Friction's joules become heat" — NEVER
  "leave the block as heat" (P3-c, my own cycle-0 wording, corrected by founder-proxy cycle 2).
- **Angle-unit note for json_author:** `theta_deg: 30` is authored once at the scenario/apparatus
  level (not per-state); every derived quantity in §1 (N, f_k, F_grav_parallel, the four kinematic
  accelerations) is computed FROM that single degree value via `radians()` — there is no
  per-state theta override anywhere in this concept.
- **Checkpoint-B measurement duties (unchanged, architect-authored, restated for continuity):**
  M-1 (S1 pin frame, `U - 49.0 = -W` at display precision: `173.8 - 49.0 = 124.8 = |-124.8|`),
  M-2 (pixel-change parity between the two bar families for a synthetic Delta-J), M-3 (S3's two
  latched stamps: `135.2 - 88.2 = 47.0 = -((-86.2) - (-39.2))` — value updated for the B move, same
  measurement). All three measure the CHANGE, never the level, per the route-(a) ruling.

---

## 7. Assessment + `coverage_map` (physics-author input, per DoD (f) and the skeleton's own Handoff line)

The skeleton's Handoff section explicitly names `assessment` + `coverage_map` as a physics-author
input ("physics-author inputs: ... `assessment` + `coverage_map` per (f) with the re-designed q2").
Six backward-designed questions, all grounded in numbers this concept actually renders:

| # | Question | Answer | Coverage | Distractor misconception (if MCQ) |
|---|---|---|---|---|
| q1 | A ball is launched up a frictionless slope. While it climbs, is the work done by gravity positive or negative? What happens to the potential energy U during the climb? | Negative; U rises by exactly the same amount gravity's work falls. | S1 | "negative work means U falls too" (confuses the sign of W with the sign of the change in U — they are opposite by definition) |
| q2 (P2-7 redesigned) | As the block moves from its highest point back down the slope, is the work done by gravity on that leg positive or negative? Does U rise or fall over that same leg? | Positive; U falls, by the same amount gravity's work rises. | S1 (descent beat) | "gravity always does negative work" (mistakes gravity's SIGN for a fixed property instead of one set by the direction of motion relative to the force) |
| q3 | A block is dragged across a rough floor and back to its start. Explain why there is no "potential energy of friction," and state where the energy removed by friction actually goes. | Friction's work depends on the path taken, not the position reached (it fails the round-trip test), so no single stored value can be assigned to a position; the energy becomes heat. | S2 | "friction's energy is destroyed" (the exact belief S1/S2 exist to correct — misses that it becomes heat) |
| q4 | Between two marked points on a slope, gravity does -50 J of work on a block. What is the change in the block's potential energy between those two points? | Delta-U = +50 J | S3 | "U at the second point equals -50 J" (confuses the CHANGE with the LEVEL — exactly the distinction S3's stamps exist to teach) |
| q5 | State the general definition of potential energy in terms of work, and explain why this definition can only apply to certain forces. | Delta-U = -W_conservative; only forces whose work is path-independent (conservative forces) can have a potential energy defined this way — a non-conservative force's work depends on the trip taken, so no single number-per-position exists. | S2 | "any force whose work can be calculated has a potential energy" (mistakes computability of work for storability) |
| q6 | A block is released from the same height on a frictionless slope twice — once launched slowly, once launched fast. Compare the potential energy U at that height in the two cases. | U is identical in both cases — it depends only on position (height), never on speed. | S4 | "the faster block has more potential energy" (confuses kinetic energy, out of scope, with U) |

`coverage_map`: `{q1: STATE_1, q2: STATE_1, q3: STATE_2, q4: STATE_3, q5: STATE_2, q6: STATE_4}`.
`misconception_watch` stays exactly the 2 entries in skeleton §4 (S1, S2) — S3/S4 carry none,
matching the founder's pivots-only guardrail; q3's distractor deliberately restates that exact
S1/S2 belief as a transfer check, not a new watch entry.

---

## Self-review checklist

- [x] Every symbol in the skeleton's state narratives (`U`, gravity's work, friction's work, `v`,
      `f`, `mg`) appears in §1's `variables`/`computed_outputs`.
- [x] Every formula wraps `theta` in `radians()`.
- [x] Every state's live control(s) match the architect's table exactly: S1/S2/S3 = none, S4 = ALL
      three sliders + drag, each with default/min/max/step.
- [x] `variable_overrides` documented for S1/S2/S3 with a one-line defensive justification each; S4
      explicitly carries none (its values ARE the live sliders).
- [x] Board mode — DEFERRED, correctly skipped (Rule 20 [D]).
- [x] Drill-down phrasings: 9 clusters x 5 phrases, real-student plain English, no Hinglish, no
      textbook-prose register.
- [x] `constraints` block: 6 short conservation-first assertions.
- [x] Numerical sanity check run: S1 home pose, m=4, g=9.8, theta=30, h_ref=-3.05, s0=-3.6 ->
      U0 = 4*9.8*(-3.6*0.5 - (-3.05)) = 39.2*1.25 = 49.0 J exactly, matching the narrated "opening
      at 49.0 joules." Apex: U=177.0, W=-128.0, Delta-U=128.0=|W| exactly (v=0 at apex, no
      integration slack).
- [x] Within-state motion timeline written for all four states, every row a pure fn of the state
      clock; no two states share a motion (`cycle-compare` x2 declared contrast pair, `reveal-build`
      x1, `drag-sandbox` explore-only, matching the architect's archetype audit); no static state.
- [x] Rule 32 sequencing: the block always moves before/with the bars responding (32a — same beat,
      no lag needed since the bars ARE the block's height/work, not a delayed reaction); only the
      taught pairing changes per state (32b): S1 adds nothing new to the apparatus, S2 adds ONE new
      bar (friction) and nothing else, S3 adds the flags/stamps and nothing else.
- [x] Word budget (Rule 31a), verified with `wc -w`: S1 = 55, S2 = 50, S3 = 54 — all within
      25-55 and matching the skeleton's own per-state bands (45-55 / 35-50 / 45-55). S4 = 0
      (explore, correctly open).
- [x] Notation ladder (Rule 38c): no calculus anywhere in this concept (no advanced ring exists);
      every formula surface (`Delta-U = -W gravity`, `Delta-U = -W conservative`,
      `Delta-U = -W gravity (A -> B)`) is algebra-only. Dialect (38d): "potential energy U" expanded
      at first mention in every state that introduces it; no board-divergent term needs dual-labeling
      here (the concept doesn't touch p.d./voltage-class vocabulary).
- [x] Engine bug queue consulted (see the top section); every relevant prevention_rule satisfied,
      none required a design change.
- [x] DC Pandey check: no formula, explanation, or example problem imported from DC Pandey, HC
      Verma, or NCERT. All three narrations, the pumped-storage anchor treatment, the assessment
      questions, and the friction-heat wording are authored from first principles (Newton's second
      law resolved along the incline + the work-energy definition), consistent with the skeleton's
      own Compliance-lines source check.

---

## Summary for the dispatching session

**Arithmetic reproduction:** every number in the skeleton's §Arithmetic table and both
founder-proxy reports was independently re-derived from the four raw constants
(m=4, g=9.8, theta=30 deg, h_ref=-3.05) plus each state's v0/mu — **all reproduced exactly**,
including the founder-proxy cycle-2 spot checks (S1 pin 173.8/-124.8/124.8, S2 pin 118.0/-69.0/-54.8,
S3's original A/B stamps 88.2/-39.2 and 127.4/-78.4) and both of founder-proxy's cycle-0 corrections
(S1 U(3150)=66.4 not the old adjacent value, S2's R-column fix). Nothing failed to reproduce.

**How the three binding constraints were carried:**
1. **P2-1 ("empties"):** struck completely from all three authored narrations; every U-bar descent
   uses "falls back" (S1, twice) or is described via the level-vs-change contrast (S3) rather than
   a range-verb at all. Also struck from the vocabulary-bans note in §6 so json_author never
   re-introduces it from the skeleton's stale `(f-2)` allowed-verb list.
2. **P3-c ("leave the block as heat"):** replaced with "Friction's joules become heat, a later
   lesson tracks them" verbatim in S2's narration and §6's constraint callout.
3. **P3-b (S3 flag spacing):** flag B moved from `s0+4.0` to `s0+4.4`; recomputed the ENTIRE
   downstream cascade myself (crossing time, wall-clock dwell schedule, `eye_capture_ms`, both
   stamp values, the residual, the collision check) rather than only copying founder-proxy's
   numbers — every one reproduced independently (see STATE_3 above). `eye_capture_ms` MUST change
   from the architect's authored 3790 to **3934** — this is a live authoring instruction for
   json_author, not just documentation.

I also carried the mechanical P3-a fix (guard margin 1.96 J, not 0.98 J) into §1's `constraints`
array and §6, since it wasn't explicitly named as "binding" but is a direct correction founder-proxy
identified in the arithmetic artifact my own formulas rest on.

**Judgment call flagged for review:** S3's narration states the CHANGE (47.0 J) but does not
re-speak all four individual stamp numbers (88.2/-39.2/135.2/-86.2) aloud — the 45-55 word budget
with the mandatory ~20-word HELD closing sentence to `gravitational_potential_energy` left no room
to read all four numbers AND state the contrast AND deliver the bridge. The individual levels are
already legible on the rendered stamp text itself (CALCULATOR-harvestable per the DoD symbol-label
table), so I judged this an acceptable trade under Rule 34 (numbers belong on the instrument, not
necessarily repeated in narration) rather than a violation of "(f-3): S3 narration reads the STAMP
numbers only" — I read that duty as constraining WHICH numbers may be spoken if any are spoken
(the latched stamp, never the live-bar transient), not as mandating that all four be read aloud.
Flagging this explicitly in case the dispatching session or founder-proxy Checkpoint B wants it
read differently.

**Nothing in the skeleton was found physically wrong or requiring escalation back to the architect.**

Path: `docs/loop_runs/ch6/potential_energy_definition/physics_block.md`
