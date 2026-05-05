# umbrella_tilt_angle — Architect Skeleton (session 32 proof run)

Produced by: architect agent (session 32.a, 2026-04-23)
Upstream inputs: project CLAUDE.md, .agents/architect/CLAUDE.md
Target file: `src/data/concepts/umbrella_tilt_angle.json` (currently legacy v2.0 — mechanics_2d, 3 states)
Chapter: 6 (Kinematics — Relative Motion), section 6.12
Class level: 11

---

## 1. Atomic claim

This concept teaches **how to compute the forward tilt angle θ of an umbrella for a person running in vertically-falling rain**, where tan(θ) = v_person / v_rain. It does NOT cover:

- The **magnitude** of the apparent rain velocity (deferred to `apparent_rain_velocity` — sibling concept, still legacy).
- General 2D relative motion (deferred to a `relative_motion` root concept — not yet shipped).
- Rain with a crosswind (out of scope — the formula only holds for rain falling vertically in the ground frame).

## 2. State count + arc — 6 states

Medium complexity (sanity band: 5–6 states). Each state has one clear purpose; every transition earns its keep:

| State | Purpose |
|---|---|
| **STATE_1** | Hook — Mumbai Dadar commuter sprints through the monsoon. Three wrong intuitions shown: straight-up, tilt backward, tilt by 90°. Question: which tilt keeps her dry? |
| **STATE_2** | Ground frame. Vertical rain vectors, horizontal commuter velocity. Establish the two velocities are PERPENDICULAR. |
| **STATE_3** | Reference-frame shift. Move into the commuter's frame. Rain now appears to come from the front-and-above. Apparent velocity triangle drawn. **[allow_deep_dive: true]** — this is the pedagogical bottleneck. |
| **STATE_4** | Key insight: the umbrella's canopy must be PERPENDICULAR to the apparent rain direction. Which means the SHAFT must be PARALLEL to the apparent rain direction — i.e., tilted FORWARD by the same angle θ. |
| **STATE_5** | Formula. tan(θ) = v_person / v_rain. Walk through: opposite side = v_person (horizontal), adjacent = v_rain (vertical), so the angle with vertical = arctan(opposite/adjacent). Plug in 4/5 → θ ≈ 38.7°. **[allow_deep_dive: true]** — tan vs sin/cos is a classic confusion. |
| **STATE_6** | Interactive slider. Student drags v_person and v_rain; umbrella shaft tilts live; formula updates. Show edge cases: stationary (θ=0), fast runner in light rain (θ→90°). |

Quality test: A student who watches all 6 states can answer: "A cyclist at 18 m/s in rain falling at 6 m/s — at what angle should she tilt her helmet-mounted umbrella?" → θ = arctan(18/6) = 71.6° forward. YES, deliverable from these 6 states.

## 3. EPIC-C branches (4 genuine misconceptions)

Each STATE_1 VISUALIZES the wrong belief (Rule 16 — not a strawman).

### Branch 1: `tilt_backward_to_block_rain` (intuition error)
**Wrong belief**: "Rain comes from above, so I tilt the umbrella backward to shield my head like a hood."
**STATE_1 visualization**: Commuter with umbrella tilted BACK (shaft angles toward the ground behind her). Rain arrows clearly soak her front. Red overlay: "Myth: Tilt the umbrella backward like a hood." Red X on the dry-front expectation; blue droplets hitting her face/chest.

### Branch 2: `sin_cos_reflex` (formula habit)
**Wrong belief**: "All angle problems use mg·sinθ or mg·cosθ — I should use those."
**STATE_1 visualization**: Student scribbles showing "θ = arcsin(v_person / v_rain)" and "θ = arccos(v_person / v_rain)" written down, both struck through with red lines. Label: "Myth: This is a sin/cos problem." Small right-triangle diagram annotated to show WHY tan is the correct function (opposite-over-adjacent, not hypotenuse).

### Branch 3: `v_apparent_adds_arithmetic` (vector-as-scalar error)
**Wrong belief**: "Apparent velocity = rain speed + person speed = 5 + 4 = 9 m/s (added as numbers)."
**STATE_1 visualization**: A speech bubble from the commuter: "v_apparent = 5 + 4 = 9 m/s" struck out. Below: correct Pythagorean setup "v_apparent = √(v_rain² + v_person²) = √(25 + 16) = √41 ≈ 6.4 m/s" and a right-triangle diagram. Label: "Myth: Velocities add like arithmetic numbers."

### Branch 4: `use_ground_frame_angle` (frame conflation)
**Wrong belief**: "The rain falls vertically, so the rain's angle is 0 — no tilt needed."
**STATE_1 visualization**: Two side-by-side panels. LEFT: ground-frame — rain vertical, commuter running, umbrella straight up, commuter soaked. RIGHT: commuter's-frame — rain slanted, umbrella tilted forward, commuter dry. Arrow from left to right: "You must work in your OWN frame, not the ground's." Label: "Myth: The rain's ground-frame angle tells me the tilt."

## 4. `allow_deep_dive` states (2)

**STATE_3 (reference-frame shift)** — this is WHERE students get stuck. Moving from ground frame to their own frame is the single most difficult leap in the concept. Students know what "apparent" means colloquially but don't have a mental model for it physically. Deep-dive justified: walks through relative velocity as vector subtraction, shows the apparent velocity triangle built up step-by-step, and brings in the "walking in rain" everyday analogy.

**STATE_5 (formula)** — second-biggest bottleneck. Once students accept the reference-frame shift, the next stumbling block is: why `tan`, not `sin` or `cos`? Deep-dive justified: geometric construction of the right triangle on the apparent velocity diagram; pointing out which leg is opposite, which is adjacent, which would be the hypotenuse if the question were about magnitude not angle.

## 5. Drill-down clusters (3 per deep_dive state)

### STATE_3 — reference-frame shift:
- `why_change_frame` — "why do I look at it from my own perspective?" (conceptual: why frames matter)
- `what_does_apparent_mean` — "is apparent velocity real? Does the rain actually move forward?" (ontological: is apparent = real?)
- `rain_direction_in_both_frames` — "what's the rain direction in my frame vs ground frame?" (mechanical: side-by-side comparison)

### STATE_5 — formula:
- `why_tan_not_sin_or_cos` — "why tan and not sin or cos?" (formula choice)
- `what_angle_is_this_exactly` — "tilt of WHAT from WHAT?" (angle definition: shaft from vertical)
- `why_ratio_not_sum` — "why v_person divided by v_rain and not plus?" (ratio vs sum)

## 6. Prerequisites (advisory — Rule 23)

- **`apparent_rain_velocity`** — sibling concept covering the MAGNITUDE of apparent rain velocity. Our concept uses its DIRECTION. Currently legacy, still unretrofitted. Advisory link only; student can start here without having done apparent_rain_velocity first.
- **`vector_basics`** (or equivalent) — legacy/not-shipped. Implicit: student needs to know vectors have both magnitude and direction.
- **`relative_motion`** — theoretical parent. Not shipped. Would be the root of this sub-tree.

Note for json_author: since none of the prerequisites are gold-standard yet, the `prerequisites` array can list them with the understanding that they're aspirational — the UI "builds on X" suggestion will gracefully no-op if the target concept is legacy.

## 7. Real-world anchor

**Primary (Indian specific, plain English, physics-true)**:

> A Mumbai local commuter stepping out of Dadar station at 6:30 PM during the monsoon. Rain falls vertically at 5 m/s; she sprints for a rickshaw at 4 m/s. She doesn't hold the umbrella straight up — she tilts it forward, about 39° from vertical. Hold it straight up and the rain soaks her front. Tilt it back and her back gets drenched. That forward tilt angle equals the angle of the apparent rain in her frame. One ratio — arctan(v_person / v_rain) — saves a uniform every monsoon.

**Secondary (optional — more advanced)**:

> A delivery rider on a Hero Splendor in Bengaluru traffic during an evening shower. Rain at 6 m/s, bike at 18 m/s. Helmet-rigged umbrella tilts at arctan(18/6) = 71.6° — almost horizontal — because at bike speed the rain seems to blast in from the front.

**Why these hook Class 10-12 students**: every Indian teenager has run through monsoon rain with an umbrella. They've felt the wrong tilts (getting wet despite the umbrella). The Dadar station scenario is urban, specific, and instantly recognizable. The Bengaluru Splendor rider makes the formula's range visceral — same physics, dramatically different angle.

No textbook-flavored "block of mass m" setups. No figure references. No Hinglish. Age-appropriate (students travel by train and bike every day).

---

## DC Pandey check

Consulted DC Pandey Ch. 6 table of contents to confirm "umbrella tilt problem" is in the Relative Motion section (6.12). No teaching sequence, no example problem, no figure reference, no explanation phrasing imported. The legacy `source_book` field in the existing JSON references DC Pandey 6.12 but that's metadata — the actual state sequence and teacher scripts are authored from first principles above.

## Self-review checklist

- [x] Atomic claim is ONE sentence (compound but single-clause).
- [x] State count (6) matches §7 "Medium" band.
- [x] 4 EPIC-C branches, each a real misconception (sources: physics ed literature on relative-motion errors + common tutoring confusions).
- [x] Each EPIC-C STATE_1 describes a visual wrong-belief (primitive-level, not just narration).
- [x] 2 `allow_deep_dive` states picked (STATE_3, STATE_5), each with 3 cluster_ids.
- [x] Prerequisites advisory (all still legacy, noted for json_author).
- [x] Real-world anchor: Indian, plain English, physics-true.
- [x] DC Pandey check line present: scope only.
- [x] No section missing. Ready for physics_author handoff.

---

## Handoff note to physics_author

Variables expected: `v_rain` (default 5 m/s, min 1, max 20), `v_person` (default 4 m/s, min 0, max 25), `theta_tilt` (computed: atan(v_person/v_rain) in degrees). Key formula: tan(θ) = v_person/v_rain → θ in radians then convert to degrees for UI display. Watch for units: `atan(ratio)` returns radians; JSON must wrap in `degrees()` or use `atan(ratio) * 180/PI`.

Animation type per E11: relative-motion is a composite. The commuter translates horizontally (type "translate"); rain droplets free-fall (type "free fall"). In the commuter's frame, rain droplets follow the apparent-velocity vector (composite translate). Physics_author should specify these in animate_in notes.

Mark scheme for board mode: minimum 6 states × 1 mark = 6 marks. Suggested breakdown: 1 mark identify frames, 1 mark draw velocity triangle, 1 mark perpendicular-canopy insight, 1 mark identify opposite/adjacent/hypotenuse, 1 mark apply tan, 1 mark numeric with correct direction.

---
---

# PHYSICS BLOCK (session 32.b — physics_author)

Produced by: physics_author agent
Upstream inputs: .agents/physics_author/CLAUDE.md, architect skeleton above
Numerical sanity checks run against 5 anchor scenarios — all match (see bottom of block).

## 1. physics_engine_config

```json
{
  "variables": {
    "v_rain": {
      "name": "Rain speed (vertical, ground frame)",
      "unit": "m/s",
      "min": 1,
      "max": 20,
      "default": 5
    },
    "v_person": {
      "name": "Commuter speed (horizontal, ground frame)",
      "unit": "m/s",
      "min": 0,
      "max": 25,
      "default": 4
    },
    "theta_tilt": {
      "name": "Umbrella forward tilt from vertical",
      "unit": "deg",
      "derived": "atan(v_person / v_rain) * 180 / PI"
    },
    "v_apparent": {
      "name": "Apparent rain speed in commuter's frame",
      "unit": "m/s",
      "derived": "sqrt(v_rain^2 + v_person^2)"
    }
  },
  "formulas": {
    "theta_tilt_rad": "atan(v_person / v_rain)",
    "theta_tilt_deg": "atan(v_person / v_rain) * 180 / PI",
    "v_apparent_mag": "sqrt(v_rain * v_rain + v_person * v_person)",
    "tilt_rule": "The umbrella shaft tilts forward from vertical by theta such that tan(theta) = v_person / v_rain",
    "perpendicular_rule": "Canopy perpendicular to apparent rain → shaft parallel to apparent rain → tilt equals the angle the apparent rain makes with vertical"
  },
  "computed_outputs": {
    "theta_display": { "formula": "atan(v_person / v_rain) * 180 / PI" },
    "v_apparent_display": { "formula": "sqrt(v_rain * v_rain + v_person * v_person)" },
    "ratio_display": { "formula": "v_person / v_rain" }
  },
  "constraints": [
    "Rain falls vertically in the ground frame (no crosswind assumed)",
    "Tilt angle theta is measured forward from vertical in the plane of motion",
    "Formula uses tan (not sin or cos) because v_person and v_rain are perpendicular",
    "v_rain > 0 always — no 'zero rain' state makes physical sense, also prevents division by zero",
    "0 <= theta < 90 degrees — upper bound approached as v_person / v_rain → infinity"
  ]
}
```

## 2. Per-state variable_overrides

STATE_1 through STATE_5 fix `v_rain = 5` and `v_person = 4` to keep the narrative-driven numbers consistent with the teacher_script and primitive labels. Without overrides, an upstream leak (e.g., test-engines default) could inject wrong values and the "38.7°" rendered in STATE_5's label would desync from the triangle drawn in STATE_3 — exactly the class of bug session 30.7 fixed on `field_forces.json` STATE_5.

| State | variable_overrides | Justification |
|---|---|---|
| STATE_1 (Hook) | `{ v_rain: 5, v_person: 4 }` | Teacher script quotes "5 m/s rain, 4 m/s sprint"; scene must match. |
| STATE_2 (Ground frame) | `{ v_rain: 5, v_person: 4 }` | Vector arrows drawn to scale; numeric labels referenced in narration. |
| STATE_3 (Frame shift) | `{ v_rain: 5, v_person: 4 }` | Apparent velocity triangle sides labelled exactly 4 and 5. |
| STATE_4 (Perpendicular insight) | `{ v_rain: 5, v_person: 4 }` | Umbrella shaft angle shown geometrically matches the triangle. |
| STATE_5 (Formula) | `{ v_rain: 5, v_person: 4 }` | Derivation writes "tan θ = 4/5 = 0.8 → θ = 38.7°" verbatim. |
| STATE_6 (Interactive) | **NO override** — sliders control v_rain and v_person from `default_variables`. | Student drags. |

**Pattern reference**: `field_forces.json` STATE_5 (`variable_overrides: { m: 1 }`). Same defensive intent.

## 3. Board-mode mark scheme + derivation_sequence

6 states × 1 mark = **6 marks** (meets Rule 21's "1 mark per state minimum").

| State | Mark | Handwriting line (derivation_step) |
|---|---|---|
| STATE_1 | 1 | "Given: v_rain = 5 m/s ↓, v_person = 4 m/s →. Find: umbrella tilt angle θ from vertical." |
| STATE_2 | 1 | "Ground frame: rain velocity vertical; commuter velocity horizontal. Vectors are perpendicular." |
| STATE_3 | 1 | "Commuter's frame: v_rain_apparent = v_rain_ground − v_person_ground = (−4 m/s, −5 m/s). Rain slants in from the front-above." |
| STATE_4 | 1 | "Canopy must be ⊥ to apparent rain → shaft ∥ to apparent rain → shaft tilts forward by angle θ = angle of apparent rain from vertical." |
| STATE_5 | 1 | "tan θ = (opposite side) / (adjacent side) = v_person / v_rain = 4/5 = 0.8." |
| STATE_6 | 1 | "θ = arctan(0.8) = 38.7° forward from vertical. Direction: FORWARD (in the direction of motion)." |

`mark_badge` primitives: one per state tied to the derivation line above. Badge position: upper-right of the state's scene_composition, color `#FCD34D` (yellow) per existing board-mode convention in `normal_reaction.json`.

## 4. Drill-down cluster trigger phrases

### STATE_3 clusters (reference-frame shift):

**`why_change_frame`** (Why do I need to leave the ground frame?):
- "why do i look from my own perspective"
- "why change frames"
- "whats wrong with ground frame"
- "why not just use the ground frame"
- "why go into my own frame"

**`what_does_apparent_mean`** (Is apparent velocity real or imagined?):
- "is apparent velocity real"
- "does the rain actually move forward"
- "is apparent real or imagined"
- "whats the point of apparent velocity"
- "is rain really hitting me from front"

**`rain_direction_in_both_frames`** (How can rain have two directions?):
- "whats the rain direction in my frame"
- "how does rain look different in two frames"
- "rain direction changes"
- "why rain slanted in my frame but vertical from outside"
- "same rain two directions how"

### STATE_5 clusters (formula):

**`why_tan_not_sin_or_cos`** (Why tan specifically?):
- "why tan not sin"
- "why not sin or cos"
- "when to use tan and when to use sin"
- "why is it tan here"
- "why not use cos theta"

**`what_angle_is_this_exactly`** (What does θ measure?):
- "tilt of what from what"
- "angle between what two things"
- "what is theta here exactly"
- "is it angle from vertical or horizontal"
- "which side is the angle measured from"

**`why_ratio_not_sum`** (Why divide, not add?):
- "why divide not add"
- "why not v_rain + v_person"
- "why ratio instead of sum"
- "why v_person over v_rain"
- "why not velocity sum 9"

## 5. Constraint callouts for json_author

### Units + PM_interpolate

- `v_rain`, `v_person` are in **m/s**; displayed as-is.
- `theta_tilt` is in **degrees** for UI (slider label, numeric display) but must be converted from radians inside formulas.
- **PM_interpolate expressions for θ display**: `{(atan(v_person / v_rain) * 180 / PI).toFixed(1)}` — tested; produces "38.7" for defaults.
- `atan` is in PM_buildEvalScope (per physics_author spec line 57); `PI` is also available. Do NOT use `radians()` — it's not in scope; use explicit `* 180 / PI` / `* PI / 180`.

### Animation-physics coupling (E11)

This concept is **not a perfect fit for any of the 6 canonical E11 motion types**. Specifically:

- **STATE_2 rain**: free-fall animation per E11 #2 (`y(t) = y₀ − ½gt²`). ✓ supported.
- **STATE_2 person**: uniform translation (`x(t) = x₀ + v·t`) — **NOT in E11's list of 6**. Closest match: the existing `translate` animation primitive in `parametric_renderer.ts`. Use that. Flag: E11 should probably be extended with "Uniform translation" as motion type #7 — **engine bug to file against `renderer_primitives` cluster**.
- **STATE_3 relative-velocity visualization**: drawing the apparent-velocity triangle is a **static diagram**, not an animation. Use vector primitives + labels; no animate_in needed (or use `fade_in` for staged reveal).

Json_author action: use `translate` for STATE_2 person; `free_fall` for rain droplets in STATE_2; STATE_3 is static vectors. No ad-hoc animations.

### Scale factors (avoid bug 1 off-canvas class)

Canvas is 760×500. Suggested scaling:
- Rain column: vertical span ~200px in MAIN_ZONE (y: 100 → 300). Droplets as small circles, `size: 8`.
- Person sprite: starting position `x: 120, y: 350`; size roughly 40×60. Translation endpoint `x: 320` (stays within MAIN_ZONE width).
- Apparent-velocity triangle in STATE_3: 8 px per m/s scale → 4 m/s horizontal = 32px; 5 m/s vertical = 40px. Triangle fits in MAIN_ZONE easily.

All proposed positions + sizes respect 760×500 bounds. Json_author should still run the bounds-check after writing.

## Numerical sanity checks (performed)

| Scenario | v_p | v_r | Expected θ (deg) | Pythagorean v_app | Verified |
|---|---|---|---|---|---|
| Dadar default | 4 | 5 | 38.66 | 6.40 | ✓ |
| Bengaluru Splendor | 18 | 6 | 71.57 | 18.97 | ✓ |
| Mars rover | 0.05 | 0.5 | 5.71 | 0.50 | ✓ |
| Stationary | 0 | 5 | 0.00 | 5.00 | ✓ (edge: θ → 0) |
| Fast runner in drizzle | 25 | 1 | 87.71 | 25.02 | ✓ (edge: θ → 90°) |

Run via `python3 -c "import math; …"` — all 5 match architect skeleton values.

## DC Pandey check

No formula derivation imported from DC Pandey / HC Verma. tan θ = v_person / v_rain derived directly from the right triangle in the commuter's reference frame: horizontal leg (v_person), vertical leg (v_rain), angle θ with vertical axis → tan θ = opposite/adjacent. Vector subtraction for apparent velocity is textbook relative-motion — authored from first principles, not paraphrased.

## Self-review checklist

- [x] Every symbol (v_rain, v_person, theta_tilt, v_apparent) in architect narratives is declared in `variables`.
- [x] `atan` wrapped correctly — no raw degrees in formulas; conversion to degrees only for DISPLAY via `* 180 / PI`.
- [x] STATE_6 has the slider; variables `v_rain` and `v_person` have `default`, `min`, `max` declared. (Step: json_author adds `step: 0.5` for slider snap.)
- [x] `variable_overrides` documented for STATE_1–STATE_5 with per-state justification.
- [x] Mark scheme totals 6 marks across 6 states, 1 mark each.
- [x] 6 clusters × 5 phrasings = 30 trigger phrases, all Indian-student voice (no teacherspeak, no Hinglish).
- [x] Constraints block: 5 short assertions.
- [x] Numerical sanity check run on 5 scenarios — all match.
- [x] DC Pandey check: first-principles derivation confirmed.

## Escalation / engine bug to file

**E11 Choreography gap**: "Uniform translation" (constant-velocity rectilinear motion) is not in the 6 canonical motion types but is required here (STATE_2 person moving horizontally at constant speed). The renderer already supports `translate` as an animation primitive, so this is a documentation gap in E11, not a runtime blocker. File engine bug against `renderer_primitives` cluster: "Add 'uniform translation' as E11 motion type #7 to close the documentation/runtime gap."

No architect-level escalation needed — the concept is atomic, the formula is well-defined, the misconceptions are real.

## Handoff note to json_author

All 6 states use scene_composition per v2.1 schema. Primitives needed:
- `body` (rect and circle shapes — person sprite, rain droplets)
- `vector` (velocity arrows in ground frame and commuter's frame)
- `angle_arc` (mark the tilt angle θ on the umbrella shaft)
- `label` + `annotation` (numeric readouts, misconception callouts)
- `formula_box` (STATE_5 tan θ = 4/5 = 0.8 display)
- `slider` (STATE_6: v_rain slider + v_person slider)
- `derivation_step` (board mode per-state handwriting lines — spec'd above)
- `mark_badge` (board mode — 6 badges total)

**No primitives required from the 22-planned list.** All needed primitives are in the 12-built set. Concept is shippable immediately; no blocking on renderer_primitives cluster.

Cluster registry SQL migration: json_author writes `supabase_2026-04-23_seed_umbrella_tilt_angle_clusters.sql` with 6 INSERT rows, 5 `trigger_examples` each (phrasings in §4 above).

Registration sites: add `umbrella_tilt_angle` to `PCPL_CONCEPTS` set (line 2821) and `VALID_CONCEPT_IDS` — note: not already in CONCEPT_RENDERER_MAP; no removal needed.
