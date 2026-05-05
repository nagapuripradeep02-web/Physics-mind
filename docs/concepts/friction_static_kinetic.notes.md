# friction_static_kinetic — Author Notes

Architect skeleton + physics block. Working artifact for the json_author phase. Persisted for audit trail (session 34 proof-run).

---

## PART A — Architect skeleton (9 sections)

### A1. Atomic claim

**Static friction adapts up to μₛN to oppose any applied force; once F exceeds μₛN, the block slips and friction drops to the constant kinetic value μₖN < μₛN.**

This concept teaches the static-vs-kinetic distinction and the regime-switch threshold. It does NOT cover:
- Friction on inclined planes (deferred to next concept `friction_on_incline`).
- Rolling friction (separate concept).
- Air drag / fluid friction (deferred to fluid mechanics chapter).

### A2. State count + arc

**6 EPIC-L states** — medium complexity per CLAUDE.md §7 calibration table. Justification: two distinct regimes (static, kinetic) + the threshold transition + a comparison view + interactive exploration require this many to land both halves of the concept.

| State | Title | Purpose | teaching_method | advance_mode |
|---|---|---|---|---|
| 1 | Push the almirah — why doesn't it move? | Hook: real-world Indian anchor | narrative_socratic | auto_after_tts |
| 2 | Static regime — friction matches your push | Mechanism: predict where friction points | narrative_socratic | wait_for_answer |
| 3 | The threshold — friction maxes at μₛN | The key insight: when does it slip | narrative_socratic | manual_click |
| 4 | Kinetic regime — friction drops once moving | The drop: why it's "easier once moving" | narrative_socratic | auto_after_tts |
| 5 | Static vs kinetic — side by side | Comparison: graph + dual scenes | compare_contrast | manual_click |
| 6 | Slider exploration — vary μ and F | Student drives | exploration_sliders | interaction_complete |

**Variety check (Rule 15):** 4 distinct advance_modes — auto_after_tts, wait_for_answer, manual_click, interaction_complete. Pass.

### A3. Within-state choreography plan (Socratic reveal — v2.2)

Three states (2, 3, 4) introduce new physical quantities and use predict → pause → reveal → explain pacing.

**STATE_2** (static regime introduction):
- t=0: block + applied force F arrow visible
- s1: "You push the almirah with a small force F."
- s2 (PREDICTION): "Where does the friction force point — and how big is it?" [pause 2500ms]
- s3 (REVEAL fₛ): friction arrow `fs` animates in pointing opposite F, same magnitude
- s4: "Static friction adjusts to match F exactly. Block doesn't move."

**STATE_3** (threshold):
- t=0: scene from STATE_2 with F slowly increasing
- s1: "What happens as you push harder and harder?"
- s2 (PREDICTION): "At what value of F does the block start to slide?" [pause 3000ms]
- s3 (REVEAL fₛ_max): static friction maxes at μₛN, label "fₛ ≤ μₛN" appears
- s4: "Static friction has a ceiling. Once F > μₛN, the block slips."

**STATE_4** (kinetic drop):
- t=0: scene with F slightly above threshold, block starting to slide
- s1: "Block is now sliding. What happens to friction?"
- s2 (PREDICTION): "Does friction stay at μₛN, increase, or drop?" [pause 2500ms]
- s3 (REVEAL fₖ): kinetic friction arrow appears at μₖN < μₛN, the "drop" is shown explicitly
- s4: "Once moving, friction is kinetic — constant μₖN, smaller than the static peak."

### A4. EPIC-C branches (4)

| branch_id | misconception | STATE_1 visualization |
|---|---|---|
| `friction_always_opposes_velocity` | Students think friction always opposes velocity direction; actually opposes RELATIVE MOTION TENDENCY (matters when block is stationary on accelerating truck, or pushed but not moving) | Show stationary block on truck accelerating right. Wrong arrow: friction backward. Annotation: "Myth: friction opposes truck's velocity." Reveal correct: friction points in same direction as truck (forward) to keep block from sliding backward relative to truck. |
| `friction_depends_on_contact_area` | "Bigger surface = more friction" intuition. Actually independent of contact area — depends on N and μ only. | Show two identical bricks, one face-down (large area) and one edge-down (small area), both with same applied F. Wrong arrows show different friction magnitudes. Reveal: same F threshold for both — area cancels out. |
| `kinetic_greater_than_static` | "Once it's moving fast, friction must be larger." Actually μₖ < μₛ always. | Show "Myth: μₖ > μₛ" with reversed graph (kinetic above static). Reveal correct ordering. |
| `no_motion_means_no_friction` | "If block isn't moving, friction must be zero." Actually fₛ = applied force (non-zero whenever someone pushes). | Show stationary block with someone pushing F=10N. Wrong: "friction = 0 because block stationary." Reveal: fₛ = 10N opposing the push. |

### A5. has_prebuilt_deep_dive states

| State | Why pre-build | Cluster candidates |
|---|---|---|
| STATE_3 (threshold) | Most-confused state — the "ceiling" concept is non-intuitive | `threshold_when_block_slips`, `static_friction_max_value`, `friction_force_direction_at_threshold` |
| STATE_5 (comparison) | Graph reading (fₛ vs F applied) is hard for many students | `static_kinetic_swap`, `mu_s_vs_mu_k_value_relationship`, `friction_after_motion_starts` |

Other 4 states use on-demand Sonnet generation when student clicks Explain (per session 33 student-first UI).

### A6. Drill-down clusters (3 per pre-built state = 6 total)

For STATE_3:
1. **`threshold_when_block_slips`** — phrasings about when slipping starts
2. **`static_friction_max_value`** — phrasings about the maximum static friction value
3. **`friction_force_direction_at_threshold`** — direction confusion at the verge of slipping

For STATE_5:
1. **`static_kinetic_swap`** — confusing which is which
2. **`mu_s_vs_mu_k_value_relationship`** — which coefficient is bigger
3. **`friction_after_motion_starts`** — what happens to friction when motion begins

### A7. entry_state_map

```
foundational: STATE_1 → STATE_4   # general "what is friction"
threshold:    STATE_3             # specifically "when does it slip"
comparison:   STATE_5             # specifically "static vs kinetic"
explore:      STATE_6             # slider playground
```

Default aspect = `foundational`.

### A8. Prerequisites

Advisory only:
- `normal_reaction` — N = mg on horizontal surface; μN formula needs N
- `free_body_diagram` — drawing forces on a block

Both shipped (gold-standard). Non-blocking.

### A9. Real-world anchor

**Primary:** Pushing a heavy almirah (cupboard) across the floor of an Indian middle-class home. You push lightly — nothing happens. Push harder — still nothing. Push hardest — the almirah suddenly slides easily across the tile. The "sticking" feeling, then the "easier once moving" feeling, IS the static-vs-kinetic distinction made physical.

**Secondary:** Vehicle braking — anti-lock brakes (ABS) keep tyres in static friction (rolling without slipping) which has μₛ ≈ 0.7 on dry road. If tyres skid, friction drops to kinetic μₖ ≈ 0.4 — that's why ABS lets you stop faster than skidding.

**Why this hooks Class 10-12 JEE/NEET students:** every student has pushed furniture in their home. Every student has been in a vehicle that brakes. Both anchors connect μₛ > μₖ to lived experience without invoking textbook abstraction.

**DC Pandey check:** Consulted DC Pandey Vol.1 Ch.7 (Laws of Motion) table of contents only — confirms friction is part of Ch.7 Laws of Motion / Forces. No teaching method, no example problem, no figure reference imported.

---

## PART B — Physics block (6 sections)

### B1. physics_engine_config

```json
{
  "variables": {
    "m":   { "name": "mass of block",            "unit": "kg",      "min": 0.5, "max": 20, "default": 5,  "role": "block_mass" },
    "mu_s":{ "name": "static friction coefficient", "unit": "(unitless)", "min": 0.1, "max": 0.9, "default": 0.5, "role": "static_friction" },
    "mu_k":{ "name": "kinetic friction coefficient","unit": "(unitless)", "min": 0.05, "max": 0.8, "default": 0.3, "role": "kinetic_friction" },
    "F":   { "name": "applied force",            "unit": "N",       "min": 0, "max": 200, "default": 15, "role": "applied_force" },
    "g":   { "name": "gravitational acceleration", "unit": "m/s^2", "constant": 9.8 },
    "N":   { "name": "normal reaction",          "unit": "N",       "derived": "m * g",                  "role": "support_force" },
    "fs_max": { "name": "max static friction",   "unit": "N",       "derived": "mu_s * m * g",           "role": "threshold" },
    "fk":  { "name": "kinetic friction",         "unit": "N",       "derived": "mu_k * m * g",           "role": "sliding_friction" }
  },
  "formulas": {
    "N":       "m * g",
    "fs_max":  "mu_s * m * g",
    "fk":      "mu_k * m * g",
    "fs_actual": "min(F, mu_s * m * g)",
    "regime":  "(F <= mu_s * m * g) ? \"static\" : \"kinetic\""
  },
  "computed_outputs": {
    "N_value":      { "formula": "m * 9.8" },
    "fs_max_value": { "formula": "mu_s * m * 9.8" },
    "fk_value":     { "formula": "mu_k * m * 9.8" },
    "is_slipping":  { "formula": "F > mu_s * m * 9.8" }
  },
  "constraints": [
    "fs <= mu_s * N (static ceiling)",
    "fk = mu_k * N (kinetic is constant)",
    "mu_k < mu_s (kinetic is always smaller than static — empirical)",
    "friction independent of contact area",
    "friction opposes relative motion tendency, not absolute velocity"
  ]
}
```

### B2. Per-state variable_overrides

Most states use defaults. Overrides where narrative needs specific values:

- **STATE_2** (small push, no motion): `F = 5` (well below fs_max=24.5N at default μₛ=0.5).
- **STATE_3** (at threshold): `F = 24.5` (matches fs_max for default values — threshold visualization).
- **STATE_4** (sliding): `F = 30` (above threshold; block sliding; fk = 14.7N).
- **STATE_5** (comparison): `F = 35` (well above threshold for clear graph contrast).
- **STATE_6** (slider): use defaults; sliders override at runtime.

### B3. Within-state reveal timeline (REQUIRED v2.2)

| State | Sentence id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|---|
| **STATE_2** | s1 | "You push the almirah with a small force, 5 newtons to the right." | — (visible) | — | 1500 |
| | s2 | "Where does the friction force point — and how big is it?" | — (prediction) | — | 2500 |
| | s3 | "Static friction points opposite F, with the same magnitude. The almirah does not move." | fs_arrow | fade_in + focal_highlight | 800 |
| | s4 | "Static friction adjusts itself to match the push. As long as F is small, fs equals F." | fs_eq_F_label | slide_in_from_right | 1200 |
| **STATE_3** | s1 | "What happens as you push harder, and harder, and harder?" | — (visible) | — | 1500 |
| | s2 | "At what value of F does the almirah finally start to slide?" | — (prediction) | — | 3000 |
| | s3 | "Static friction has a maximum. Once F exceeds μs times N, the block slips." | fs_max_label | fade_in + focal_highlight | 1000 |
| | s4 | "For our 5 kg almirah with μs equal to 0.5, the threshold is 24.5 newtons." | threshold_value_label | slide_in_from_right | 1500 |
| **STATE_4** | s1 | "The almirah is now sliding to the right." | — (visible) | — | 1500 |
| | s2 | "Friction is still acting on it. Does friction stay at the static maximum, increase, or drop?" | — (prediction) | — | 2500 |
| | s3 | "Friction drops to the kinetic value, μk N, which is less than the static maximum." | fk_arrow | fade_in + focal_highlight | 1000 |
| | s4 | "That is why pushing the almirah is much easier once it is moving — μk is less than μs." | mu_k_less_than_mu_s_label | slide_in_from_right | 1200 |

STATE_1 (hook), STATE_5 (compare_contrast), STATE_6 (exploration_sliders) skip Socratic-reveal — see spec exemptions.

### B4. Board mode mark scheme + derivation sequence

**Total marks:** 5 (one per state STATE_1 through STATE_5; STATE_6 is interactive only, no mark).

| State | Mark | Description | derivation_sequence content |
|---|---|---|---|
| STATE_1 | 1 | Identify the body, surfaces, and applied force | "Step 1: Body — almirah, mass m=5 kg. Surface — horizontal floor. Applied force F to the right." |
| STATE_2 | 1 | Recognize static regime; write fs ≤ μs·N | "Step 2: When F ≤ μs·N, static friction acts. fs = F (matches applied force)." |
| STATE_3 | 1 | State the threshold condition | "Step 3: Threshold: fs_max = μs·N = 0.5 × 5 × 9.8 = 24.5 N." |
| STATE_4 | 1 | Switch to kinetic; write fk = μk·N | "Step 4: When F > fs_max, block slides. Kinetic friction: fk = μk·N = 0.3 × 5 × 9.8 = 14.7 N." |
| STATE_5 | 1 | Numeric for given F and verify regime | "Step 5: For F = 35 N > 24.5 N, block slides. Net force = F − fk = 35 − 14.7 = 20.3 N. Acceleration a = 4.06 m/s²." |

### B5. Drill-down cluster phrasings (5 per cluster, real student voice)

**`threshold_when_block_slips`**:
- "when does block start moving"
- "what F makes block slip"
- "how to find the slip point"
- "when does it become kinetic"
- "at what force does it move"

**`static_friction_max_value`**:
- "what is max static friction"
- "fs maximum value"
- "largest static friction can be"
- "static friction limit formula"
- "is fs always mu s times N"

**`friction_force_direction_at_threshold`**:
- "friction direction when about to slip"
- "where does fs point at maximum"
- "is friction same direction at threshold"
- "fs direction just before slipping"
- "which way friction at slip point"

**`static_kinetic_swap`**:
- "static and kinetic are same"
- "is mu s same as mu k"
- "what is difference between static kinetic"
- "kinetic friction less or more than static"
- "why two coefficients for friction"

**`mu_s_vs_mu_k_value_relationship`**:
- "which is bigger mu s or mu k"
- "is kinetic friction smaller"
- "why mu k less than mu s"
- "are mu s and mu k always different"
- "mu k bigger than mu s possible"

**`friction_after_motion_starts`**:
- "friction reduces when moving"
- "what happens to friction once moving"
- "why pushing is easier once moving"
- "friction drops after slipping"
- "kinetic less than static why"

### B6. Constraint callouts

- μₖ < μₛ is empirical, not derivable. UI must enforce the slider relationship: if user sets μₖ > μₛ, snap μₖ to μₛ − 0.05 (or warn).
- Threshold formula uses N = m·g (horizontal surface). For incline, defer to `friction_on_incline` (not this concept).
- Friction is **independent of contact area** — visualizer must NOT scale arrow magnitude with body size.
- Kinetic friction direction is opposite to **velocity**, not opposite to applied force. If F < fk briefly, block decelerates (still kinetic friction opposing velocity).
- All angle inputs in UI = degrees, formula = radians via `radians()` (not used in this concept since horizontal surface, but documented for `friction_on_incline` future).

**Numerical sanity check:** m=5, μₛ=0.5, g=9.8 → fs_max = 0.5 × 5 × 9.8 = 24.5 N. ✓ matches STATE_3 narrative.
m=5, μₖ=0.3, g=9.8 → fk = 0.3 × 5 × 9.8 = 14.7 N. ✓ matches STATE_4 narrative.

**DC Pandey check:** No formula or example problem imported. All physics derived from Newton's first law (static balance) and second law (sliding regime).

---

*Author notes complete. Hand off to json_author for v2.2 schema realization.*
