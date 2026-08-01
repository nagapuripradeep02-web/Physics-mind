# Physics Block — `work_done_by_constant_force`

> physics-author output, companion to `skeleton.md` (Checkpoint A CLOSED, cycle 2). Renderer:
> `field_3d` / `newtons_laws_body` energy layer (SEAM K+L+M+N, 0d pure-JSON). Conceptual-only
> (Rule 20 [D]) — no `mode_overrides`, no board mark scheme.
> **All arithmetic below was independently recomputed by the dispatching session before persistence —
> see the verification table at the foot of this file. Every figure matched exactly.**

## 0. Engine bug queue consultation (run before authoring)

Ran `query_engine_bug_queue.ts` against `alex:physics_author`, `alex:json_author`,
`peter_parker:runtime_generation`, and every `newtons_laws_body` sibling concept. **This discharges
the skeleton's Gate-8 FLAG for the physics-author stage.** Relevant rules and how this block
satisfies them:

| bug_class | status | applies here as |
|---|---|---|
| `default_variables_only_first_var_merged` | CRITICAL/FIXED | Every variable with a non-trivial default (`F`, `F_ang`, `m`) is explicitly authored per state — never left to fall back silently. **§2 flags one live exposure:** S6's `m` slider's own `NLB_SLIDER_SPEC` default is 2 kg, not the established 5 kg crate. |
| `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` | MAJOR/OPEN, flagged on `newton_second_law` (same scenario_type) | `F ≥ 15 N` needed for a visible arrow at `NLB_ARROW_SCALE = 0.030`. Every AUTHORED force here is ≥ 20 N (S1 20, S2 ramps to 36, S3 20, S4 40, S5 20) — clears the floor with ≥33% margin. Only S6's slider can go below 15 N; accepted explore-state exemption. |
| `field3d_param_ramp_authoring_contract` | DIRECTIVE/OPEN, on `block_on_incline` | "A `param_ramp` state must author its own body value for the ramped param equal to `from`, or entry visibly jumps." S2 authors `applied_force.N: 0` at entry (= `param_ramp.from`). |
| `nlb_uncoupled_readouts_flip_to_static_on_bound_halt` / `nlb_coupled_readouts_revert_to_rest_values_on_bound_halt` | CRITICAL/FIXED | Confirms S3's seized-traverse arrest at the bound will NOT silently relabel the physics. No action needed. |
| `nlb_hud_and_body_labels_never_show_mass…` | MAJOR/FIXED | Confirms mass renders wherever authored (relevant to S6's `m` row). |
| `guided_state_overruns_pacing_target` / `field3d_state_duration_field_clamps_eye_capture_window` | MAJOR/FIXED | Each state's `duration` must be ≥ its real narration length or THE EYE's dense capture is blind to the closing sentence. Floors given in §3. |
| `pcpl_radians_helper_missing` | MODERATE/OPEN, PCPL-only | **N/A — field_3d concept.** But see §6.1: the two layers use OPPOSITE conventions and that is the trap. |

No bug forced an exception; nothing flagged beyond the two OPEN items, both satisfied by design.

---

## 1. `physics_engine_config`

**Length + home pose:** `length_m: 6` (authored explicitly, matching `NLB_DEFAULT_LEN_M`, so the
arithmetic is legible from the JSON rather than relying on an unstated default).
`initial_position_m: -5.4` (`= -length_m + 0.6`) on **all six states, same body**.
S4's checkpoint: `d_target = 2.0` → `s_m = -5.4 + 2.0 = -3.4` (absolute track coordinate).

```json
{
  "variables": {
    "F":     { "name": "applied force magnitude", "unit": "N", "min": 0, "max": 60, "default": 20 },
    "F_ang": { "name": "pull angle above the floor", "unit": "deg", "min": 0, "max": 85, "default": 60 },
    "m":     { "name": "crate mass", "unit": "kg", "min": 0.5, "max": 10, "default": 5 },
    "g":     { "name": "gravitational acceleration", "unit": "m/s^2", "constant": 9.8 },
    "mu_s":  { "name": "coefficient of static friction (S2 only)", "unit": "", "min": 0, "max": 1, "default": 0 }
  },
  "computed_outputs": {
    "N":        { "formula": "m*g - F*sin(radians(F_ang))" },
    "F_along":  { "formula": "F*cos(radians(F_ang))" },
    "a":        { "formula": "F*cos(radians(F_ang))/m" },
    "maxStat":  { "formula": "mu_s*(m*g - F*sin(radians(F_ang)))" },
    "f_static": { "formula": "F*cos(radians(F_ang))" },
    "W":        { "formula": "F*d*cos(radians(F_ang))" }
  },
  "formulas": {
    "definition":      "W = F·d·cos θ — work done by a constant force = force magnitude × displacement magnitude × the cosine of the angle between them",
    "normal":          "N = mg − F·sin θ — the pull's vertical component changes the floor's normal reaction",
    "along_component": "F∥ = F·cos θ — only this component lies along the motion and does work",
    "static_ceiling":  "f_s = F·cos θ, valid only while F·cos θ ≤ μₛN",
    "max_static":      "maxStat = μₛ·N",
    "acceleration":    "a = F·cos θ / m — frictionless states only (S1, S3, S4, S5, S6)"
  },
  "constraints": [
    "W = F*d*cos(theta) at all times -- the engine's live work ledger and the formula agree to the last printed digit (SEAM N verified this on the 40N/30deg case)",
    "N = m*g - F*sin(theta) must stay >= 0 in every configuration; slider_controls (F<=60N, theta<=85deg) keep N>0 for all four authored pairs and every reachable sandbox setting",
    "displacement is required for work: d=0 forces W=0 regardless of F (S2)",
    "the perpendicular component F*sin(theta) does zero work on this flat floor at any theta; only F*cos(theta) enters W",
    "static friction never exceeds mu_s*N; S2's ramp target (36 N) stays at 0.816 x maxStat (44.1 N), so the crate never breaks free",
    "mass does not appear in W = F*d*cos(theta); a heavier crate takes longer to cover the same displacement, but the force does the identical work"
  ]
}
```

**Contracted config-key map** (json-author writes these, not `physics_engine_config`'s own names):

| Quantity | Contracted `newtons_laws_body` key | Notes |
|---|---|---|
| `F`, `F_ang` | `bodies[].applied_force: { N, angle_deg }` | SEAM N key. Use the new shape everywhere for consistency (angle=0 states are bit-identical to the legacy scalar, verified by SEAM N). |
| `m` | `bodies[].mass_a` | literal per-body field, independent of any slider default. |
| `mu_s` | `bodies[].mu_s` | S2 only. |
| frictionless | `newtons_laws_body.surface.frictionless: true` | S1/S3/S4/S5/S6 — hard-zeroes `mu_s`/`mu_k` (L942). **Never author on S2.** |
| `d` | `newtons_laws_body.displacement_vector: { body_id, label:'d', show_value:true }` | drawn from `initial_position_m`; auto-hides below `|Δs| < 0.02 m`. |
| `θ` arc | `newtons_laws_body.angle_arc: { from, to, body_id, label:'θ', show_value:true, radius:0.85 }` | `from:'applied'`; `to` varies by state (§3). |
| `W` | `newtons_laws_body.work_accumulators: [{ force:'applied', label:'by the pull', body_id }]` + state-level `work_scale_J` | `label` verbatim required (F5). |
| checkpoint (S4) | `newtons_laws_body.checkpoints: [{ s_m, label:'flag at 2 m', capture:['W'], capture_mode:'first', body_id }]` | `s_m` absolute, arithmetic only. |
| HUD | `newtons_laws_body.readouts: ['F_applied']` all states, `+ 'f'` on S2 | **Do NOT add `'N'` or `'a'`** — internal-only per the DoD symbol table (Rule 34). |
| slider ranges | `slider_controls: { F, F_ang, m }` | top-level, concept-wide. |

---

## 2. Per-state variable overrides

Naive baseline: `F=20`, `F_ang=60` (both `slider_controls` defaults), `m=2` (**`NLB_SLIDER_SPEC.m.def`,
NOT this concept's crate**), `mu_s=0`, `surface.frictionless` absent. Every departure, stated:

| State | Overrides vs. the naive baseline | Why |
|---|---|---|
| **S1** | `F_ang: 0` · `m: 5` · `surface.frictionless: true` · `initial_position_m: -5.4` | 0° pull is S1's whole picture; `m` must be the established crate. |
| **S2** | `F` seeded `0` (= `param_ramp.from` — the `field3d_param_ramp_authoring_contract` rule) · `F_ang: 0` · `m: 5` · `mu_s: 0.9` · **`surface.frictionless` OMITTED** | Authoring it `true` would hard-zero `mu_s` and collapse the entire PRIMARY-aha state to a frictionless free-slide. |
| **S3** | `F: 20` · `F_ang: 60` (= baseline, but authored explicitly so entry does not jump before the teacher touches the slider) · `m: 5` · `surface.frictionless: true` | Entry value must equal the live slider's own default. |
| **S4** | `F: 40` · `F_ang: 60` · `m: 5` · `surface.frictionless: true` | Deliberately kept at 60°, not 45° — Checkpoint-A ruling: exact-digit stamp agreement at `cos 60° = ½`. |
| **S5** | `F: 20` · `F_ang: 30` · `m: 5` · `surface.frictionless: true` · `angle_arc.to: 'displacement'` | Third angle; semantically honest arc target (F4). |
| **S6** | `F: 20`, `F_ang: 60` authored explicitly (sandbox opens on the picture S3–S5 left off, no teleport) · **`m: 5` DUAL override required:** (a) `bodies[].mass_a: 5`, AND (b) `slider_controls.m: { default: 5 }` using the literal key `"default"`, never `"def"` · `surface.frictionless: true` | **The concept's one live instance of `default_variables_only_first_var_merged`.** Without both halves the slider opens on 2 kg while the body physics is 5 kg — a silent mismatch on the one state a teacher actually drags. |

`slider_controls` (concept-wide, authored once):
`F: {min:0, max:60, step:5, default:20}` · `F_ang: {min:0, max:85, step:5, default:60}` ·
`m: {min:0.5, max:10, step:0.5, default:5}`.

---

## 3. Per-state motion timeline + control table (Rule 31)

**Loop arithmetic** — all guided looping states use `loop_reset_ms: 2000`. Bounding discipline
requires loop distance `< 11.4 m` (home `-5.4` → right bound `+6.0`).

| State | a (m/s²) | loop distance `½aR²` | margin to 11.4 m | loop peak `slope × distance` |
|---|---|---|---|---|
| S1 | 4.000 | 8.000 m | 3.40 m | 20.00 J/m × 8.000 = **160.0 J** |
| S3 (pre-seizure) | 2.000 | 4.000 m | 7.40 m | 10.00 J/m × 4.000 = **40.0 J** |
| S4 | 4.000 | 8.000 m | 3.40 m | 20.00 J/m × 8.000 = **160.0 J** |
| S5 | 3.464 | 6.928 m | 4.47 m | 17.32 J/m × 6.928 = **120.0 J** |

**S4 checkpoint — crossing-before-55%-of-R (F2 invariant):** `d_target = 2.0 m` at `a = 4.000` →
`t = √(2×2.0/4.000) = 1.000 s = 50.0% of R` — inside the 55% ceiling with 100 ms margin (reviewer's
verified window `R ∈ [1818, 2387] ms`). Frozen pin at `60% × 2000 = 1200 ms` lands **200 ms after**
the crossing → the frozen baseline always photographs a stamped formula surface.

**S3 seized-traverse (dominates the shared scale):** once the teacher touches `F_ang` the loop stops
resetting and the crate runs the full remaining 11.4 m once. At the clamp's lower end (θ=0°, largest
reachable slope 20.00 J/m): peak `= 20.00 × 11.4 = 228.0 J`. Arrest from a fresh entry
`t = √(2×11.4/2.000) = 3.376 s ≈ 3.4 s`; dragged toward θ=0 (`a→4.000`) `= 2.387 s ≈ 2.4 s`.
**No narration promises an endless loop.** The post-arrest `[PM_NLB_ENERGY_CLAMP]` is a real,
accepted consequence of a teacher drag — never of the automated auto-run THE EYE captures, so it
cannot trip SEAM K's open-item-D zero-occurrence assertion.

**Shared `work_scale_J` (S1–S5):** `1.1 × max(160.0, 228.0) = 250.8` → **author `260`**.
**S6's own `work_scale_J = 240`:** representative lap at its authored defaults (20 N, 60°) =
`10.00 J/m × 11.4 = 114 J` (47.5% deflection — legible); a 20 N/0° full lap = 228 J (95%, no clamp).
Sizing to the 60 N/0° extreme corner (684 J) instead would read 14% at every ordinary setting — the
Checkpoint-A N12 finding this fixes.

| # | Teaches | Archetype | t-window / what animates | Controls | Glow focal | Ring |
|---|---|---|---|---|---|---|
| **S1** | `W = F·d`, the joule | `translate-through` | Loop `R=2000ms`. `t=0`: F arrow (20N@0°) present, crate at rest at `-5.4`. `d` hidden until `|Δs|≥0.02m` (`t≈100ms`). From then `d` stretches, bar climbs 20.00 J/m. Joule beat at `t=707ms`: `d=1.00m → W=20.0J`. Loop resets `t=2000ms` (`d=8.00m`, peak 160.0J). | none | `displacement_vector` | core |
| **S2** | No displacement → no work | `null-result-hold` | No loop — the ramp IS the motion. `t=0`: `F=0` (=`param_ramp.from`), `mu_s=0.9`, no `frictionless`. `param_ramp:{param:'F',from:0,to:36,start_ms:0,end_ms:3000}`: F and the tracked `f` readout climb together 0→36N. `t≥3000ms`: both hold at 36N (`0.816×maxStat`). `d` never appears. Bar parked at `0.0J`. | none | `nlb_arrow_crate_applied` (NOT `work_bar_applied` — silent no-op, Patch 3) | core |
| **S3** | `W=F·d·cosθ` | `translate-through` (declared pair with S1) | Loop `R=2000ms` pre-seizure. `t=0`: F arrow (20N@60°), arc `θ=60°`. `d` hidden until `t≈141ms`. Bar climbs at HALF S1's rate (10.00 J/m). Resets `t=2000ms` (`d=4.00m`, peak 40.0J) **unless** the teacher drags `F_ang` — first trusted input latches the seizure. | `F_ang` (0…85) | `angle_arc` | core |
| **S4** | prediction = measurement | `flow-along-path` | Loop `R=2000ms`. `t=0`: F arrow (40N@60°), arc `θ=60°`. `d` hidden until `t=100ms`. Bar climbs 20.00 J/m. Crossing at `s_m=-3.4` (`d=2.0m`) at `t=1000ms` (50.0% of R) stamps `flag at 2 m:  W by the pull = 40.0 J`; live bar reads `40.0J` at the same instant. Reset `t=2000ms` wipes the stamp; re-fires next cycle at local `t=1000ms`. Frozen pin `t=1200ms`. | none | `checkpoint_1` | extended |
| **S5** | `W=F⃗·d⃗` at any angle | `reveal-build` | Loop `R=2000ms`. `t=0`: F arrow (20N@30°), arc `θ=30°` (`from:'applied', to:'displacement'`). `d` hidden until `t≈107ms`. Bar climbs 17.32 J/m — a third distinct NUMBER, not claimed as a perceptible delta. Vector formula surface builds `|F|` fixed, `|d|` growing, `cos θ` fixed. Reset `t=2000ms` (`d=6.928m`, peak 120.0J). | none | `angle_arc` | advanced |
| **S6** | Sandbox; mass does not enter `W` | `drag-sandbox` | `mode:'sandbox'`. Opens on `F=20, F_ang=60, m=5`. Trusted drag + all three sliders live; free-runs forever (Rule 37). On wrap the ledger zeroes and `d` collapses to a ≤0.6 m stub (F6 residual, decays ~0.8 s). `work_scale_J=240`. | ALL: `F`(0…60), `F_ang`(0…85), `m`(0.5…10) + drag | none/body | core (explore) |

**`duration` floors** (per `field3d_state_duration_field_clamps_eye_capture_window`):
S1 ≥ 22000 ms · S2 ≥ 23000 ms · S3 ≥ 25500 ms · S4 ≥ 26000 ms · S5 ≥ 23000 ms — all much longer than
`loop_reset_ms = 2000`, so each state's loop repeats several times across its narration window.

---

## 4. Narration (`text_en`)

**Rule 41 audit applied — the skeleton's own "buys" is a metaphor and does NOT appear below.**

**S1** (46 words):
> "A steady twenty newton pull moves the crate along the floor from rest. As it speeds up, the work meter climbs with the distance moved. When the crate has moved one metre, the meter reads twenty joules — one newton acting through one metre equals one joule."

**S2** (47 words):
> "The same pull now acts on a crate resting on a rough floor. The force grows larger and larger, and static friction balances it at every instant. The crate never moves. With zero displacement, the work meter holds at exactly zero joules, however large the pull becomes."

**S3** (53 words):
> "The same twenty newton pull now tilts upward at an angle. The crate still slides across the floor, but the work meter climbs at half the rate per metre — only the part of the pull along the floor does any work. Drag the angle slider and watch the meter's climb rate change live."

**S4** (54 words — carries the optional Checkpoint-A clause):
> "A forty newton pull acts at sixty degrees on the same frictionless floor. At the flag, two metres in, the formula predicts forty joules — the live meter reads the same forty joules at that instant. Prediction and measurement agree. This tilted pull does exactly as much work per metre as the first pull did."

**S5** (50 words):
> "A different pull now acts at a third angle: twenty newtons at thirty degrees. The work formula becomes a scalar product of two arrows, force and displacement, collapsing into one number — force times displacement times the cosine of the angle between them. The same rule holds at any angle."

**S6** (0 / open — teacher-led sandbox, no scripted TTS sentence).
**The `m`-slider demonstration, named** (Rule 31 dead-control requirement; Patch 10): *"Mass does not
appear in W = F·d·cos θ at all. A heavier crate takes longer to cover the same distance under the same
pull, but the force does exactly the same work over that distance — try 2 kg and 8 kg at the same F
and θ and watch the meter climb at the identical rate, just over a different time."*
json-author may author this as a persistent on-canvas annotation rather than a TTS sentence: it is
core-ring-safe (Rule 38b), and a static label is not TTS-timed, so the 0/open convention is intact.

---

## 5. Drill-down cluster phrasings (5 real student-voice phrases × 6 clusters)

**S2 — `work_vs_effort`:** "i got tired so i must have done work right" · "my arms are sore that means
i did work" · "why is holding something not work if it feels like work" · "work should mean effort not
distance" · "if it takes energy from me why is it zero work"

**S2 — `holding_is_not_working`:** "i am holding a heavy bag and not moving is that zero work" · "why
does standing still with a weight count as no work" · "does carrying a bag on a flat road do any work"
· "the bag is heavy so there must be some work happening" · "if i hold it up for an hour is that
really 0 joules"

**S2 — `force_needs_displacement`:** "why do i need both force and distance for work to count" · "if
the force is huge but nothing moves why is work zero" · "does a tiny push over a big distance count as
work" · "what happens to the force if the object never moves" · "so work is really about movement not
about pushing"

**S3 — `why_cos_theta`:** "why cos theta and not sin theta" · "how do i know when to use cos and when
to use sin" · "why does the angle formula use cosine here" · "where does cos theta even come from" ·
"is cos theta always for work or does it change"

**S3 — `component_does_the_work`:** "which part of the force actually does the work" · "does the part
of the force pointing up count for anything" · "why does only part of the force move the crate" ·
"what happens to the rest of the force that is not doing work" · "is the vertical part of the pull
wasted"

**S3 — `same_force_less_work`:** "same force so why is the work smaller now" · "how can the same pull
do less work just because it is tilted" · "if the force number did not change why did the work change"
· "does tilting the force make it weaker" · "why does angle change the work but not the force reading"

---

## 6. Constraint callouts for json-author

1. **No `radians()` inside the `newtons_laws_body` config.** SEAM N's `applied_force.angle_deg` and
   `angle_arc` take plain **degree** numbers — the engine converts internally. This is the OPPOSITE
   convention from PCPL (where `radians()` is mandatory inside formula strings). `radians()` belongs
   ONLY inside `physics_engine_config.computed_outputs`/`variables[].derived` (THE CALCULATOR's
   evaluator special-cases `radians`/`degrees`), never inside any field_3d config key.
2. **`work_accumulators[].label` must be the literal string `"by the pull"`** — the engine composes
   `"W " + label` into both the bar caption and the checkpoint stamp; any other string breaks the
   English (Rule 41 / F5).
3. **The formula surface is a static template string, not a live-evaluated expression.**
   `W = F·d·cos θ` (Cambria Math, Unicode θ) is authored once per state; live numbers render only in
   the HUD/bar/stamp (Rule 34b). No `{F}·{d}·cos({F_ang})`-style interpolation anywhere.
4. **`checkpoints[].s_m` is always `initial_position_m + d_target`, computed, never a bare literal** —
   `-3.4` for S4.
5. **`surface.frictionless: true` and `bodies[].mu_s` are mutually exclusive in effect** — authoring
   both is not a JSON error, but `frictionless: true` hard-zeroes `mu_s` at read time, silently
   defeating S2's ramp physics if ever copy-pasted onto S2.
6. **Pick one stable `body_id`** (recommend `"crate"`) and propagate it identically across
   `bodies[].id`, `displacement_vector.body_id`, `angle_arc.body_id`, `work_accumulators[].body_id`,
   `checkpoints[].body_id`, and the S2 glow focal string `nlb_arrow_crate_applied`.
7. **`slider_controls.m` must use the key `"default"`, not `"def"`** (Patch 5 / finding N6).
8. **S1's checkpoint stays unauthored** — F7 deliberately keeps S4 the sole checkpoint state. S1's
   `d=1.00m → W=20.0J` beat is a live-reading beat, not a stamped one.

---

## 7. `assessment` + `coverage_map`

Six questions, one per state, each with distractors mapped to a real misconception:

| q_id | state | tested idea | correct | key distractor |
|---|---|---|---|---|
| `q1_work_definition` | S1 | `W = F·d` aligned; the joule | 60 J | "0 J — work needs elapsed time" (work/power conflation) |
| `q2_zero_work_no_motion` | S2 | no displacement → zero work | Zero | "large positive, the push is strong" (effort = work) |
| `q3_angle_component` | S3 | `W = F·d·cos θ` | `30×5×cos 40°` | `30×5×sin 40°` (why cos not sin) |
| `q4_numeric_verification` | S4 | substituting real numbers | 40.0 J | 80.0 J (ignored cos θ entirely) |
| `q5_scalar_product` | S5 | the general vector form | `F⃗·d⃗ = F d cos θ` | `F⃗ × d⃗` (dot/cross confusion carried from torque) |
| `q6_mass_independence` | S6 | work is independent of mass | same, 60 J each | "the 8 kg crate receives four times more work" |

`coverage_map.by_state`: STATE_1→q1 · STATE_2→q2 · STATE_3→q3 · STATE_4→q4 · STATE_5→q5 ·
STATE_6→q6. `non_assessed_states`: none.
Q4 carries a parallel form matching the skeleton's own JEE-backwards trace: *"A crate is pulled 10 m
across a horizontal floor by a 50 N force directed 37° above the horizontal. Find the work done by the
applied force (cos 37° ≈ 0.80)."* Full JSON is in the json-author handoff; the shape above is the
review surface.

---

## Self-review checklist

Every narrated symbol (`F`, `F_ang`/θ, `d`, `W`, `f`, `m`) appears in `variables`/`computed_outputs` ✓
· `radians()` only in `physics_engine_config`, never in the field_3d config — flagged as the
mirror-image of `pcpl_radians_helper_missing` ✓ · live controls match the architect's table exactly
(S1/S2/S4/S5 none · S3 `F_ang` · S6 ALL) ✓ · `variable_overrides` documented and justified per state,
S6's dual `m` override tied to its bug class ✓ · mark scheme N/A (Rule 20 [D]) ✓ · 6 clusters × 5
real-student phrasings ✓ · 6 short factual constraints ✓ · numeric sanity `40×2.0×0.5 = 40.0 J`
matches the narrated stamp ✓ · motion timeline a pure function of the state clock, no `pause_after_ms`
✓ · Rule 32 cause-before-effect, S2's null-result exception reasoned, S1's rest-start substitute per
F10 ✓ · **word budget: S1 46 · S2 47 · S3 53 · S4 54 · S5 50 — all inside 25–55; S6 0/open** ✓ ·
notation ladder 38c (S1–S4/S6 algebra-only; S5 the sole vector state; no calculus) ✓ · bug queue
consulted, every prevention_rule satisfied or reasoned N/A ✓ · DC Pandey check: nothing imported; the
JEE-shaped parallel stem authored fresh ✓.

---

## Dispatching-session arithmetic verification (2026-08-01)

Every figure recomputed independently before persistence. **All matched exactly.**

| Check | Recomputed | Block claims | ✓ |
|---|---|---|---|
| track margin (home −5.4 → bound +6.0) | 11.4 m | 11.4 m | ✓ |
| S1/S4 loop distance @ a=4.000, R=2000 ms | 8.000 m (margin 3.40) | 8.00 m | ✓ |
| S3 loop distance @ a=2.000 | 4.000 m (margin 7.40) | 4.00 m | ✓ |
| S5 loop distance @ a=3.464 | 6.928 m (margin 4.47) | 6.928 m | ✓ |
| S1/S4 loop peak | 160.0 J | 160.0 J | ✓ |
| S5 loop peak | 120.0 J | 120.0 J | ✓ |
| S1 joule beat (`d = 1.00 m`) | t = 707 ms | 707 ms | ✓ |
| S4 crossing (`d = 2.0 m`) | t = 1000 ms = **50.0% of R** | 50.0% | ✓ |
| frozen pin (60% of R) vs crossing | 1200 ms, **200 ms after** | 200 ms after | ✓ |
| S3 seized arrest, fresh / θ→0 | 3.376 s / 2.387 s | ≈3.4 s / ≈2.4 s | ✓ |
| S3 seized peak | 228.0 J | 228.0 J | ✓ |
| shared `work_scale_J` | 1.1 × 228.0 = 250.8 → 260 | 260 | ✓ |
| S6 representative lap | 114 J = 47.5% of 240 | 47.5% | ✓ |
| S6 at 20 N/0° | 228 J = 95.0% of 240, no clamp | no clamp | ✓ |
| S2 ramp ratio | 36 / 44.10 = **0.816** ≤ 0.85 | 0.816 | ✓ |
| `d`-arrow appearance (0.02 m) S1/S3/S5 | 100 / 141 / 107 ms | 100 / 141 / 108 ms | ✓ |

The single 1 ms discrepancy (S5's `d`-arrow appearance, 107.5 ms rounded) is presentational, not
physical.
