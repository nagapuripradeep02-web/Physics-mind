# CLAUDE_APPENDIX.md — PhysicsMind on-demand reference
# Open when needed — NOT loaded every session. Pointed to from CLAUDE.md.
# Current as of 2026-06-20 (relocated out of CLAUDE.md to keep it under the 40k per-session cap).
# These are LOOKUP/REFERENCE blocks, not per-session decisions — the live rules stay in CLAUDE.md.

---

## A — GLOSSARY  (was CLAUDE.md §9)

| Term | Meaning |
|------|---------|
| EPIC-L | Full explanation path (hook → mechanism → formula → depth → edge → interactive) |
| EPIC-C | Misconception correction. STATE_1 ALWAYS shows wrong belief. |
| LOCAL | 2-4 state path for students with specific gap (skip hook) |
| MICRO | ALWAYS exactly 2 states — one symbol or formula term |
| WHAT-IF | 0 new states — Physics Engine reruns with student values |
| HOTSPOT | ALWAYS exactly 2 states — triggered by canvas tap |
| PCPL | Physics-Constrained Parametric Composition Layer |
| Atomic concept | One teachable idea = one student question = one JSON |
| Zone | Named canvas region (MAIN_ZONE, CALLOUT_ZONE_R, etc.) |
| Anchor | Semantic position (block_bottom_center, surface.floor at 0.4) |
| UNIT_TO_PX | MAIN_ZONE.height × 0.70 / maxMagnitude |
| scene_composition | Array of PCPL primitives defining what appears in a state |
| focal_primitive | The one primitive Focal Attention Engine highlights |
| Transition | 800ms interpolation between two scene_compositions |
| mode_overrides | Per-mode diff object; merged over baseline at session start |
| Type A variant | Same physical world, different parameter values |
| Type B variant | Different physical world, same physics law |
| advance_mode | auto_after_tts / manual_click / wait_for_answer (LEGACY — never on new concepts, Rule 31) / interaction_complete — ≥2 distinct per JSON (Gate 12) |
| 5D fingerprint | concept_id \| intent \| class_level \| mode \| aspect |
| 6D fingerprint | concept_id \| state_id \| cluster_id \| class_level \| mode \| aspect (drill-down cache) |
| DEEP-DIVE | Hand-authored sub-simulation that elaborates a single parent state in 4–6 sub-states. Triggered by student button click ("Explain step-by-step") on a parent state flagged `allow_deep_dive: true`. **Not runtime-generated.** Until a (concept_id, state_id) pair accumulates threshold analytics (≥10 feedback submissions OR median dwell >60s with ≥50 sessions), the button routes to a one-sentence feedback form (`feedback_unified` write). Once flagged, hand-authored at diamond bar ~1 per week. Cache key: concept_id \| state_id \| class_level \| mode. |
| DRILL-DOWN | Confusion-targeted sub-simulation. Haiku classifies student phrase → cluster_id → serve pre-authored or cached MICRO/LOCAL sub-sim. Distinct from DEEP-DIVE — triggered by typed confusion, not button. |
| FEYNMAN-MODE | "Now you explain it back" — student types/speaks their own explanation after a concept → Sonnet grades against physics_engine_config + misconceptions → targeted feedback. |
| ANSWER-SHEET | Board-mode canvas style (white ruled background) + downloadable PDF of the complete step-by-step answer the student should reproduce on their exam paper. |
| PREREQUISITES | Soft-advisory concept dependency. `prerequisites: [concept_id]` array in each atomic JSON. Shown as "builds on X — 5 min intro?" suggestion, never as hard gate. |
| cluster_id | Semantic cluster of confusion phrases. Many raw student phrases ("why no friction", "where did friction go", "what about friction here") → one `friction_not_in_fbd` cluster. Haiku classifies at runtime. |
| allow_deep_dive | Boolean flag on `epic_l_path.states.STATE_N`. When true, DEEP-DIVE button renders below the state. Set for 2–3 hard states per concept. |
| canvas_style | `default` (conceptual) or `answer_sheet` (board). Controls sim canvas background + primitive style. |
| derivation_sequence | Board-mode-only primitive layer inside `mode_overrides.board`. Per-state `primitives` array with `animate_in: "handwriting"` that writes the answer character-by-character. |
| mark_badge | Yellow "+N marks" overlay primitive tied to a line in the `mark_scheme`. Accumulates visually through the board-mode simulation. |
| Claude | Single Architect+Engineer role (retired the old Project/Antigravity split on 2026-04-19) — designs, authors JSON content, implements engines |
| Reviewer | Pradeep — gates every JSON change, agent proposal, A/B winner |

---

## B — CONCEPT JSON INVENTORY  (was CLAUDE.md §6: id list + §6.2 + VALID_CONCEPT_IDS superset)

> The action items for adding a concept (Two File Locations, the EIGHT required
> registration updates, canonical default state order) stay in CLAUDE.md §6.
> This block is the id inventory + legacy redirect + classifier superset.

### Current atomic concept_ids on disk (70 atomic + 1 legacy bundle = 71 files — verify live: `ls src/data/concepts/*.json`; grouped by chapter)

> ⚠ Count refreshed 2026-06-23 (was "66"). The grouped list below may lag recent additions — e.g.
> electrostatics `electric_field_point_charge` / `electric_field_dipole` / `force_on_charge_in_field`
> and `force_on_current_carrying_wire`. Treat the live directory as source of truth, not this list.

```
Magnetism (Ch.26): magnetic_field_wire, magnetic_force_moving_charge,
  biot_savart_law, torque_on_current_loop_in_field, magnetic_field_solenoid

Vectors (Ch.5): vector_resolution, unit_vector, angle_between_vectors,
  scalar_multiplication, negative_vector, equal_vs_parallel,
  current_not_vector, parallelogram_law_test, pressure_scalar, area_vector,
  resultant_formula, special_cases, range_inequality, direction_of_resultant,
  unit_vector_form, inclined_plane_components, negative_components, dot_product,
  vector_head_to_tail

Kinematics (Ch.6-7): distance_displacement_basics, average_speed_velocity,
  instantaneous_velocity, sign_convention, s_in_equations,
  three_cases, free_fall, sth_formula, negative_time,
  a_function_of_t, a_function_of_x, a_function_of_v, initial_conditions,
  xt_graph, vt_graph, at_graph, direction_reversal,
  vab_formula, relative_1d_cases, time_to_meet,
  upstream_downstream, shortest_time_crossing, shortest_path_crossing,
  apparent_rain_velocity, umbrella_tilt_angle,
  ground_velocity_vector, heading_correction,
  time_of_flight, max_height, range_formula,
  up_incline_projectile, down_incline_projectile,
  two_projectile_meeting, two_projectile_never_meet

Forces (Ch.8): field_forces, contact_forces, normal_reaction,
  tension_in_string, hinge_force, free_body_diagram,
  friction_static_kinetic, newton_second_law_direction
```

### §6.2 Legacy bundle redirect

`class12_current_electricity.json` is a legacy array-of-concepts bundle (old `physics_constants/` shape, not atomic v2). It contains 10 nested concept_ids that the classifier may surface to students until the splitting backlog completes:

```
drift_velocity, ohms_law, resistivity, emf_internal_resistance,
kirchhoffs_laws, series_parallel_resistance, wheatstone_bridge,
meter_bridge, potentiometer, electric_power_heating
```

These are NOT atomic JSONs. `ohms_law` queries currently route here, not to a standalone file. See LEGACY_SPLIT_BACKLOG.md for the planned split.

### `intentClassifier.ts` `VALID_CONCEPT_IDS` superset

`intentClassifier.ts:36` defines `VALID_CONCEPT_IDS` with **84 entries** (verified 2026-06-11) — a superset that includes the 66 atomic IDs above PLUS the 10 bundle-nested IDs (so `ohms_law` validates) PLUS some legacy bundle parent names retained for classifier vocabulary (vector_basics, vector_addition, etc.) that redirect via `CONCEPT_SYNONYMS` post-classify. The classifier file is the runtime source of truth; this section is the editorial summary.

**Full v2 concept JSON schema, verified field list, and planned fields: see CLAUDE_REFERENCE.md.**

---

## C — THE LEARNING MODEL  (expansion of CLAUDE.md Rule 17 — "what 'learns' actually means")

"The engine learns" is FIVE different things. The answer differs for each — that is the whole point. Do not collapse them.

| # | Meaning | Allowed? | Where it lives / how |
|---|---|---|---|
| 1 | **Engine capabilities improve** (confusion → build a better renderer; `field_3d` added because PCPL couldn't do 3D fields) | ✅ Yes | Human-driven, content-pull. Ships as engine code via normal review. |
| 2 | **Engine *defaults/parameters* tuned from data** (transition timing, dwell on EPIC-C STATE_1, contrast, auto-advance thresholds) | ✅ Yes | Nightly agents PROPOSE engine-config deltas → founder approves → ships as **versioned config**, not opaque weights. **This is the engine genuinely learning from production feedback — done safely.** |
| 3 | **Personalization policy picks what to show *this* student** (path, difficulty, variant) | ✅ Yes, but **later** (needs scale/data we don't have) | A policy layer that SELECTS among human-reviewed content. Never authors physics. |
| 4 | **Engine generates the simulation live via LLM at serve time** | ❌ No | The hard floor. Non-deterministic, un-reviewable, can serve wrong physics to thousands. (Rule 18.) |
| 5 | **Engine rewrites its own code from production data** | ❌ No | Catastrophe risk, zero upside. |

**The real axis is NOT "engine vs JSON."** It is **offline+reviewed vs online+un-reviewed**, and **where the learned artifact lives** (reviewable config/content vs opaque runtime behavior). Meanings 1–3 are offline + reviewed + reviewable-artifact → allowed and *encouraged* (they compound quality). Meanings 4–5 are un-reviewed runtime generation in the correctness path → forbidden.

**Engine-default learning (meaning 2) is a first-class loop, not just JSON.** The Tier-8 offline agents (Collector → Clusterer → Proposer → Auto-Promoter) may write proposals that change `engine config / defaults`, not only concept JSONs. Same approval gate, same `proposal_queue`.

**Approval-graduation path** (so "humans approve everything" is not an eternal ceiling):
- **Now** (solo founder, ~4 diamonds, ~no students, no trusted test net): founder approves everything. Correct — no data, no automated safety net.
- **Later** (Tier-9 Validator + Visual Probe + Regression Suite trusted): a learned change that passes all automated gates AND does not regress the comprehension metric may **auto-promote**; only physics-touching or novel-shape changes require founder review.
- The validator is *already* a non-human approver — the graduation path is the existing Tier-9 inventory maturing, not new philosophy.

**Sequencing caution (do not over-rotate):** learning loops need DATA. With ~4 diamonds and almost no students, meanings 2–3 are fuel-starved. **Fix the architecture to ALLOW engine learning now (cheap); build content + the comprehension metric + the first cohort to generate fuel; THEN light up the offline-tuning and personalization loops.** Building RL/personalization infra before students exist is premature optimization on an empty dataset.
