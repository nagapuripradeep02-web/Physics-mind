# Renderer Capabilities — Single Source of Truth

> **Read this BEFORE authoring any concept JSON.** Most "lame first iteration"
> failures come from the author not knowing what the renderer can already do —
> shipping a static labeled scene because they didn't realize compass / hand /
> sliders / animation are one-line opt-ins.

This document enumerates every renderer extra, animation flag, and state-level
indicator that is currently wired and ready to use. Each entry shows the JSON
shape and one-line description. If you want a behavior that isn't listed here,
**ask** before authoring around it — half the time it already exists with a
different name.

---

## 1. Renderer choice (per concept)

Each concept routes to ONE renderer via `CONCEPT_RENDERER_MAP` in
`aiSimulationGenerator.ts`. Pick by the dominant pedagogical task:

| Renderer | When to pick | Examples |
|---|---|---|
| `field_3d` | 3D vector fields, RHR, compass, anything where 2D × / · symbols mislead | magnetic_field_wire, electric_field_lines, solenoid, dipole |
| `mechanics_2d` / `parametric` | Forces, motion, FBD, kinematics in a side-view plane | newton_second_law_direction, friction, projectile |
| `circuit_live` | Resistors, batteries, current paths, Kirchhoff loops | ohms_law, parallel_resistance, kirchhoffs_laws |
| `graph_interactive` | A graph IS the pedagogy (V-I, x-t, v-t) | xt_graph, vt_graph, ohms_law (paired) |
| `wave_canvas` | Oscillations, superposition, standing waves | wave_superposition, standing_waves |
| `optics_ray` | Light rays, lenses, mirrors, image formation | refraction, lens_image |
| `thermodynamics` | PV / TS diagrams, gas cycles, piston animation | first_law, isothermal, carnot |
| `particle_field` | Microscopic random motion (drift velocity, diffusion) | drift_velocity |

---

## 2. `field_3d` capabilities (Three.js, the most-extended renderer)

The `field_3d` renderer reads `Field3DConfig` from the concept JSON's
top-level `field_3d_config` field. Every entry below is opt-in per state.

### 2.1 Scenarios (`scenario_type`)

```
"point_charge_positive"   — radial field lines from +q
"point_charge_negative"   — radial field lines into -q
"dipole"                  — curved lines from + to -
"parallel_plates"         — uniform field between plates
"solenoid_field"          — dense lines inside coil, sparse outside
"bar_magnet"              — N→S external loops
"straight_wire_current"   — concentric B-circles around vertical wire
"changing_flux"           — coil + moving magnet + EMF indicator
```

### 2.2 Per-state visibility filtering (`visible_elements`)

Substring-match against scene-object `elementType` and `id`. **Use specific
tokens** — `"wire"` matches `fl_wire_*` too (greedy). Prefer `"wire_main"`,
`"curr_arr"`, `"fl_wire_1"` (one height), `"fl_wire_1_2"` (one specific circle).

```json
"visible_elements": ["wire_main", "curr_arr", "fl_wire", "arr_wire"]
```

Empty array `[]` or `["all"]` = show everything.

### 2.3 Per-state camera (`camera_position`)

```json
"camera_position": [3, 2, 4]      // oblique side view
"camera_position": [0.1, 7, 0.1]  // top-down (the × / · reveal)
"camera_position": [0, 0, 6]      // front-on
```

Renderer eases the camera over ~1 sec on state change.

### 2.4 Field-line rotation animation (`field_rotation_direction`)

```json
"field_rotation_direction": "ccw"  // current ↑ → counter-clockwise
"field_rotation_direction": "cw"   // current ↓ → clockwise
```

Field-line arrows orbit around the wire's Y-axis at 0.6 rad/sec, maintaining
tangent orientation. Sense flips when current reverses. **Only meaningful for
`straight_wire_current` scenario.**

### 2.5 Current-flow visualization (`current_direction_indicator`)

```json
"current_direction_indicator": "up"    // dots flow up the wire
"current_direction_indicator": "down"  // dots flow down the wire
```

6 yellow dots distributed along the wire animate at 0.55 wire-units/sec in the
indicated direction. Hidden when omitted. Drives the compass deflection direction
via Biot-Savart (see 2.7 below).

### 2.6 Right-hand-rule overlay (`extras.right_hand`)

Pinned to the iframe's top-right corner — NOT in the 3D scene. Shows OS-rendered
emoji hands (👍 thumb up, 👎 thumb down) with an animated curl arc and case
labels. Use `case` to show ONE case at a time (cleaner than dual display):

```json
"extras": {
  "right_hand": {
    "case": "A",                     // 'A' = thumb-up only, 'B' = thumb-down only
    "thumb_direction": [0, 1, 0],    // for legacy 3D mesh (kept for back-compat)
    "finger_curl": "ccw",            // 'ccw' or 'cw'
    "animate_curl": true,
    "scale": 2.2,
    "position": [-1.8, 0, 0.8]       // (legacy 3D, ignored by overlay)
  }
}
```

### 2.7 Compass with physics-correct deflection (`extras.compass`)

Three.js disc + N/S needle. The needle automatically deflects to point along
`B = I_hat × r_hat` at the compass's perpendicular distance from the wire.
**No manual angle config required** — physics is computed from the active
state's `current_direction_indicator` + the compass `position`.

```json
"extras": {
  "compass": {
    "position": [0, 0, 1.5],         // world coords (0,0,1.5) = +Z side of wire
    "radius": 0.45,
    "animate_swing": true,            // swing from 0 (north) to B-direction over 2s
    "swing_delay_ms": 1200            // delay after state-entry before swing starts
  }
}
```

For wire concepts: place compass on the +X or +Z side of the wire (wire is on Y
axis at origin) so the deflection is a clean 90° (not a hard-to-see 0° or 180°).

### 2.8 Highlighted point (`extras.highlighted_point`)

Glowing colored sphere with a halo, for marking "point P" in B-at-P style states.
Pulses at 3 Hz to draw the eye.

```json
"extras": {
  "highlighted_point": {
    "position": [1.6, 0, 0],
    "color": "#FFEB3B",
    "label": "P",
    "radius": 0.10
  }
}
```

### 2.9 Interactive sliders (`show_sliders` + `slider_controls`)

Per-state opt-in panel pinned top-right with live readouts. The renderer reads
slider values, recomputes `B = μ₀I/(2πr)`, redraws field-density opacity, and
shows a live `B = X.X μT` readout.

```json
"show_sliders": true                  // on this state, panel is visible

// Top-level config (sibling to states):
"slider_controls": {
  "I": { "min": 0.5, "max": 20, "step": 0.5, "default": 5,    "label": "Current I (A)" },
  "r": { "min": 0.02, "max": 0.30, "step": 0.01, "default": 0.05, "label": "Distance r (m)" }
}
```

### 2.10 Formula overlay (`formula_overlay`)

Multi-line text pinned bottom-right, mono-font, yellow text. Use for live
formulas + numeric examples. Newlines preserved.

```json
"formula_overlay": "B = μ₀ I / (2π r)\nμ₀ = 4π × 10⁻⁷ T·m/A\n\nDouble I → double B\nDouble r → half B"
```

### 2.11 Authored config preference (`field_3d_config` at JSON top level)

Embed a deterministic `Field3DConfig` directly in the concept JSON — bypasses
the runtime Sonnet generation (CLAUDE.md Rule 18 compliance). This is **the
canonical pattern** for all new field_3d concepts.

```json
{
  "concept_id": "magnetic_field_wire",
  ...
  "field_3d_config": {
    "scenario_type": "straight_wire_current",
    "field_lines": { "count": 6, ... },
    "current": { "direction": [0, 1, 0], "magnitude": 5, "wire_color": "#FFAB40" },
    "states": { "STATE_1": { ... }, "STATE_2": { ... }, ... },
    "slider_controls": { ... },
    "pvl_colors": { ... }
  }
}
```

---

## 3. Cross-renderer state-level conventions

These work on every renderer pipeline:

| Field | Type | Description |
|---|---|---|
| `advance_mode` | enum | `auto_after_tts`, `manual_click`, `wait_for_answer`, `interaction_complete`, `auto_after_animation` |
| `teacher_script.tts_sentences` | array | TTS-narrated voiceover, 3–6 sentences typical |
| `misconception_watch` | array | Inline pre-emptive correction (different from EPIC-C branches) |
| `focal_primitive_id` | string | Which primitive gets the spotlight halo |
| `duration` | number | Approx. seconds (used by `auto_after_tts`) |

---

## 4. Concept-level required structure (v2.0 schema)

Every atomic concept JSON must include:

- `concept_id`, `concept_name`, `chapter`, `section`, `schema_version: "2.0.0"`
- `renderer_pair: { panel_a, panel_b }`
- `physics_engine_config: { variables, computed_outputs?, formulas?, constraints? }`
- `real_world_anchor: { primary, secondary?, tertiary? }`
- `epic_l_path: { state_count, states }` — each state ≥ 3 scene_composition primitives, ≥ 2 distinct advance_mode values across all states
- `epic_c_branches: [...]` — at least 1 branch (4 typical for major misconceptions)

Recommended (v2.2 additions):

- `concept_tier: 'simple' | 'medium' | 'complex'`
- `cognitive_limits: { max_primitives_per_state, max_labels_per_state, max_words_per_tts_sentence }`
- `aha_moment: { state_id, statement (≤15 words), visual_confirmation? }`
- `prerequisites: [concept_id]` — soft-advisory only
- `mode_overrides: { board, competitive, foundation? }` — see CLAUDE.md §5

**New (mandatory for diamond-standard concepts):**

- `pedagogy_floor: { ... }` — see [PEDAGOGY_FLOOR.md](./PEDAGOGY_FLOOR.md). Each
  domain has must-have slots that must be explicitly addressed (or marked N/A).

---

## 5. What's NOT yet supported (avoid authoring around these)

- **`field_3d` per-state slider override** — sliders are global config, not per-state
- **`field_3d` electron-flow color animation** — only the dot-stream, not the wire itself
- **3D hand model in scene** — `createRightHand` is in code but unrendered; the 2D SVG overlay is canonical
- **Drag-to-place compass** — compass position is static per state
- **Dynamic state count** at runtime — state count is fixed per concept JSON
- **Multi-language TTS** — all `tts_sentences[].text_en` is English; language is pipeline-handled

If your pedagogy genuinely needs one of these, **flag it** in the concept's
`pedagogy_floor.unsupported_needs` array — don't fake it with text labels.

---

*This doc is a living source of truth. When the renderer ships new capabilities,
update this file in the same commit. Authors who reference this doc + start from
a `template_*.json` should hit diamond standard on iteration 1.*
