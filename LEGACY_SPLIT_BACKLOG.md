# Legacy Bundle Splitting — Backlog

## Context

16 of the 24 JSON files in `src/data/concepts/` are **legacy bundled format** — each one contains 3–10 atomic physics concepts inside a single file, using the old `renderer_hint` + nested `physics_layer`/`pedagogy_layer` shape.

Per CLAUDE.md: *"Atomic concept = one teachable idea = one student question = one JSON."* These bundles violate that rule and need to be split into individual atomic JSONs.

**They are deliberately skipped by `npm run validate:concepts` and `npm run migrate_v1_to_v2`** — mechanical backfill would produce fake-v2 shape that masks the real requirement.

**Total atomic concepts to produce from splitting: ~50 new JSONs** (based on the `subconcept_triggers` field inside each bundle). Plus the 8 atomic files that already pass v2 validation, the full corpus after splitting is approximately **58 concept JSONs across vectors + kinematics + forces**.

---

## How to split one bundle (workflow)

For each legacy file `<bundle>.json`:

1. Read the file's `routing_signals.subconcept_triggers` — that's the authoritative list of atomic concepts inside
2. For each sub-concept key:
   - Create `src/data/concepts/<subconcept_id>.json` with full v2 schema (see CLAUDE.md Section 7 schema)
   - Populate from the bundle's `epic_l_path.states[*].physics_layer` + `pedagogy_layer` content
   - Author epic_c_branches per misconception (often the bundle has a few in `epic_c_branches` — split those by which sub-concept they apply to)
   - Set `renderer_pair` (inferable from the bundle's `renderer_hint.renderer` → panel_a; panel_b per pedagogy decision)
3. Update `src/lib/intentClassifier.ts` → `VALID_CONCEPT_IDS` to include each new atomic id
4. Update `src/lib/aiSimulationGenerator.ts` → `CONCEPT_RENDERER_MAP` with each new id → renderer
5. Insert row into `concept_panel_config` Supabase table for each new id
6. Delete the original bundle file (or rename to `<bundle>.legacy.json.deleted` for rollback)
7. Run `npm run validate:concepts` — new atomic files should PASS; bundle disappears from LEGACY list
8. Regenerate `simulation_cache` rows (DELETE from simulation_cache WHERE concept_id IN new ids, then let live-gen repopulate)

---

## Per-file splitting backlog

Priority ordering (recommended execution): **Ch.7 Vectors first** (shared primitives, highest reuse for all later chapters) → **Ch.7 Kinematics** → **Ch.8 Projectile/Relative Motion** (depend on vectors).

### Priority 1 — Vectors core (chapter 7, shared foundation)

| Bundle | Sub-concepts to extract | Count |
|---|---|---|
| `vector_basics.json` | unit_vector, angle_between_vectors, scalar_multiplication, negative_vector, equal_vs_parallel | 5 |
| `scalar_vs_vector.json` | current_not_vector, parallelogram_law_test, pressure_scalar, area_vector | 4 |
| `vector_addition.json` | resultant_formula, special_cases, range_inequality, direction_of_resultant | 4 |
| `vector_components.json` | unit_vector_form, inclined_plane_components, negative_components | 3 |
| `dot_product.json` | (no subconcept_triggers — treat the whole file as 1 atomic concept: `dot_product`) | 1 |

**Sub-total: 17 atomic concepts**

### Priority 2 — Kinematics 1D

| Bundle | Sub-concepts to extract | Count |
|---|---|---|
| `distance_vs_displacement.json` | distance_displacement_basics, average_speed_velocity, instantaneous_velocity, sign_convention, s_in_equations | 5 |
| `uniform_acceleration.json` | sign_convention, three_cases, free_fall, sth_formula, negative_time | 5 |
| `non_uniform_acceleration.json` | a_function_of_t, a_function_of_x, a_function_of_v, initial_conditions | 4 |
| `motion_graphs.json` | xt_graph, vt_graph, at_graph, direction_reversal | 4 |

**Sub-total: 18 atomic concepts**

### Priority 3 — Relative Motion + Projectile

| Bundle | Sub-concepts to extract | Count |
|---|---|---|
| `relative_motion.json` | relative_velocity_1d, relative_velocity_2d, time_to_meet, relative_acceleration | 4 |
| `river_boat_problems.json` | minimum_time, zero_drift, impossible_case, drift_calculation | 4 |
| `rain_umbrella.json` | basic_rain_setup, rain_with_wind, find_rain_speed, umbrella_tilt_direction | 4 |
| `aircraft_wind_problems.json` | vector_triangle_setup, sine_rule_solution, time_calculation, perpendicular_component_method | 4 |
| `projectile_motion.json` | (no subconcept_triggers — likely 1 atomic or split by trajectory angle/horizontal/full) | 1–3 |
| `projectile_inclined.json` | (no subconcept_triggers — treat as 1 atomic concept) | 1 |
| `relative_motion_projectiles.json` | (no subconcept_triggers — treat as 1 atomic concept) | 1 |

**Sub-total: 19–21 atomic concepts**

---

## Aggregate

| Priority | Bundles | Atomic Concepts to Produce |
|---|---|---|
| 1 — Vectors | 5 | 17 |
| 2 — Kinematics 1D | 4 | 18 |
| 3 — Relative / Projectile | 7 | 19–21 |
| **Total** | **16 bundles** | **54–56 atomic JSONs** |

Plus the 8 existing atomic files → **~62–64 atomic JSONs in `src/data/concepts/` after full split.**

---

## Sizing (honest effort estimate)

Per atomic JSON authoring (full v2 schema with 6 EPIC-L states + 3–5 EPIC-C branches + Indian anchors + physics engine config + panel_b config):

- Architect authoring time: **~2–4 hours per concept** (real pedagogy decisions)
- Antigravity save + register: **~15 min per concept** (4 places: JSON file, VALID_CONCEPT_IDS, CONCEPT_RENDERER_MAP, concept_panel_config)
- Supabase cache regen: **~30 sec per concept** (live-gen on first student hit)

**Total for full corpus (54 new atomic concepts): ~150–250 hours of Architect time.**

This is a multi-week project. Not scoped for Day 1. Recommended cadence: **1 priority group per week** — Vectors done in Week 1, Kinematics in Week 2, Relative/Projectile in Week 3.

Alternatively, activate CLAUDE_ENGINES.md Engine 25 (offline 5-agent JSON pipeline) **after** engines stabilize — that can draft JSONs at ~$0.05/concept (~$3 for full corpus), leaving the Architect only review/approval work.

---

## Related work (unblocked by splitting)

- Completes `VALID_CONCEPT_IDS` coverage (currently 52 entries; should be ~80 after splits)
- Enables proper fingerprint caching per atomic concept (bundles confuse the 5D fingerprint key)
- Allows atomic MICRO / HOTSPOT paths (which are defined per-concept, not per-bundle)
- Makes the Playwright smoke harness meaningful (one atomic JSON = one smoke test)
