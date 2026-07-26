# PCPL / parametric — the blessed clone target

> **For a Class-11 Vectors (PCPL / `parametric_renderer.ts`) concept, clone this. For a field_3d 3D
> concept, clone `faraday_law_induction_skeleton.md` instead — the two renderers share NO visual
> vocabulary.**

The field_3d fleet has a blessed exemplar skeleton (`faraday_law_induction_skeleton.md`). The PCPL
fleet's exemplar is the **shipped concept itself**, not a hand-written skeleton: every PCPL skeleton in
this folder (`scalar_vs_vector_skeleton.md`, `vector_head_to_tail_skeleton.md`,
`umbrella_tilt_angle_skeleton.md`, `current_not_vector_skeleton.md`) is **[VINTAGE — never clone]**
(pre-Rule-31 Socratic architecture, and they predate the concept that actually shipped).

## The gold standard: `src/data/concepts/scalar_vs_vector.json`

Re-authored fresh 2026-07-23 as the DAG root of the Class-11 Vectors track (prerequisites `[]`).
Straightforward per Rule 31, THE EYE **23/23**, first fleet-locked PCPL visual baselines
(`visual_baselines/scalar_vs_vector/`). Its shape is what a new PCPL concept clones:

- **5 states**, `advance_mode` variety (STATE_1–4 `manual_click`, STATE_5 `interaction_complete` —
  the explore-last sandbox with ALL sliders). No `wait_for_answer` / `pause_after_ms` / Socratic beats.
- **Motion via `variable_choreography`** (per-state sweeps: `phi_hook`, `psi_pointer` loop, `theta`) and
  scene `animation` blocks — never a static state.
- **Pixel-coordinate 760×500 canvas** (x∈[40,720], y∈[40,460] to stay on-canvas); text placed by zone
  anchor (MAIN / CALLOUT_ZONE_R / FORMULA / CONTROL / TITLE) over absolute coords where possible.
- **Emphasis is brightness-only** (`PM_focalEmphasis`, Rule 29) — no zoom/size pulse, no camera.
- `entry_state_map` (`foundational` STATE_1–3, `addition_law` STATE_4–5), `misconception_watch` at
  genuine pivots, `aha_moment`, `cognitive_limits`, universal culture-neutral `real_world_anchor`
  (Rule 35), `formula_box` overlays.
- **Routing (the naming trap):** `renderer_pair.panel_a:"mechanics_2d"` AND the concept_id in
  `PCPL_CONCEPTS` (`aiSimulationGenerator.ts`, registration site #7) AND a `computePhysics_<id>` in
  `parametric_renderer.ts`. The `"mechanics_2d"` string does NOT run `mechanics_2d_renderer.ts` —
  `PCPL_CONCEPTS` overrides it at the sim-assembler. Miss site #7 or the `computePhysics` entry and the
  concept silently falls back / renders blank labels.

## Read alongside

- `docs/AUTHORING_PIPELINE.md` §Stage ② → the **PCPL / parametric variant** block (compute rules for a
  2D pixel canvas: placement, no-camera, animation-type motion, routing, THE EYE parity).
- `.agents/json_author/CLAUDE.md` → primitive table + the `panel_a:"mechanics_2d"` naming trap + the
  animation whitelist.
- `.agents/architect/CLAUDE.md` → the PCPL pre-flight + the PCPL Definition-of-Done substitution.
- Scar list: `query_engine_bug_queue.ts <concept> --pcpl --open` (the PCPL fleet flag, disjoint from
  `--field3d`).
