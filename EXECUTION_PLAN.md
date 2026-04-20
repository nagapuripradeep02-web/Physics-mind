# PhysicsMind — Autonomous Renderer Build + Hybrid Technology System
## Detailed Execution Plan

**Date**: 2026-03-21
**Status**: PLAN — awaiting approval before execution
**Risk level**: Medium-High (touching pipeline, DB schema, 4 new renderers)

---

## CURRENT STATE AUDIT

### Renderers (4 existing)
| Renderer | Location | Type | Pattern |
|----------|----------|------|---------|
| particle_field | `src/lib/renderers/particle_field_renderer.ts` + `public/renderers/particle_field_renderer.js` | Config-driven p5.js | Reads `window.SIM_CONFIG`, 4-state postMessage sync |
| graph_interactive | `src/lib/renderers/graph_interactive_renderer.ts` | Plotly-based | Reads `window.SIM_CONFIG`, slider-driven |
| circuit_live | `public/renderers/circuit_live_renderer.js` (57KB) | Canvas 2D | Reads config via postMessage, state switching |
| mechanics_2d | `src/lib/renderers/mechanics_2d_renderer.ts` (30KB) | Config-driven p5.js | 10 scenario types, reads `window.SIM_CONFIG` |

### Renderers (also found)
| Renderer | Location | Notes |
|----------|----------|-------|
| ohmsLaw | `src/lib/renderers/ohmsLawRenderer.ts` + `public/renderers/ohms_law_renderer.js` | Macroscopic R=ρL/A |

**Total: 5 renderers** (particle_field, graph_interactive, circuit_live, mechanics_2d, ohmsLaw)

### Physics Constants JSONs — TWO DIRECTORIES (critical finding)

**Directory 1**: `src/lib/physics_constants/` — 30 JSON files
- Loaded by: `loadConstants()` in `index.ts` (dynamic, file-based)
- Used by: `stage2Runner.ts` (Stage 2 Config Writer)

**Directory 2**: `src/data/physics_constants/` — 14 JSON files (DUPLICATES of Dir 1)
- Loaded by: `loadConstantsForConcept()` in `physics_validator.ts` (sync, file-based)
- Used by: `validatePhysics()` (physics validation after Stage 2)

**THREE SEPARATE LOOKUP SYSTEMS**:
1. `PHYSICS_CONSTANTS_MAP` in `aiSimulationGenerator.ts` — static imports, 20 entries, only 3 actual JSON files
2. `loadConstants()` in `physics_constants/index.ts` — reads from `src/lib/physics_constants/`
3. `CONCEPT_FILE_MAP` (32 entries) + `loadConstantsForConcept()` in `physics_validator.ts` — reads from `src/data/physics_constants/`

**This must be consolidated in Phase 0.**

### Physics Constants JSONs (30 files in src/lib/physics_constants/)
**TWO INCOMPATIBLE SCHEMAS detected:**

**Schema A** (matches `PhysicsConstantsFile` interface — 19 files):
```json
{ "concept": "...", "locked_facts": { key: value }, "animation_constraints": { ... }, "ncert_truth_statements": [...] }
```
Files: drift_velocity, ohms_law, series_resistance, kirchhoffs_laws, kirchhoffs_voltage_law, kirchhoffs_current_law, kirchhoffs_law, wheatstone_bridge, meter_bridge, emf_internal_resistance, resistivity, resistance_temperature_dependence, electric_current, electrical_power_energy, parallel_resistance, electric_power_heating, internal_resistance, potentiometer, cells_in_series_parallel

**Schema B** (rich schema, does NOT match `PhysicsConstantsFile` — 11 files):
```json
{ "concept_id": "...", "concept_name": "...", "chapter": "...", "class_level": 12, "renderer_hint": {...}, "variables": {...}, "locked_facts": [...array...], "truth_statements": [...], "aha_moment": {...}, "simulation_states": [...], "common_misconceptions": [...], "legend": [...] }
```
Files: ac_basics, phasors, resistor_in_ac, inductor_in_ac, capacitor_in_ac, lc_oscillations, lcr_series_circuit, resonance_lcr, power_in_ac, transformer

### PHYSICS_CONSTANTS_MAP (20 entries, only 3 actual JSON imports)
All entries alias to: `driftVelocityConstants`, `ohmsLawConstants`, or `electricPowerHeatingConstants`.
Many concepts (kirchhoff, wheatstone, meter_bridge, etc.) point to `ohmsLawConstants` instead of their own JSON.

### CONCEPT_RENDERER_MAP (35 entries)
Routes concepts to: `circuit_live` (17), `graph_interactive` (5), `particle_field` (3), `mechanics_2d` (10)

### Supabase `concept_panel_config` (27 rows)
Columns: `concept_id`, `default_panel_count`, `panel_a_renderer`, `panel_b_renderer`, `panel_c_renderer`, `sonnet_can_upgrade`, `upgrade_max`, `verified_by_human`, `reasoning`
**Note**: Column names are `panel_a_renderer` (not `renderer_a`) and `default_panel_count` (not `panel_count`).

### `panelConfig.ts` RendererType union
Already includes `wave_canvas` and `field_3d` — no type changes needed there.

---

## CRITICAL ISSUE: JSON SCHEMA MISMATCH

The 11 Schema B files (AC chapter) use `locked_facts` as an **array** (not a Record), `concept_id` (not `concept`), and `truth_statements` (not `ncert_truth_statements`). The `loadConstants()` function in `physics_constants/index.ts` returns them as `PhysicsConstantsFile` but the shape doesn't match.

**Decision required**:
- **Option A**: Standardize ALL JSONs to Schema A (simpler, matches existing interface)
- **Option B**: Update `loadConstants()` and `PhysicsConstantsFile` to handle both schemas via normalization
- **Option C**: Use Schema B for new JSONs and add a normalization layer

**Recommendation**: Option B — add a normalization step in `loadConstants()` that converts Schema B → Schema A shape at load time. This preserves the rich data in Schema B files while ensuring the pipeline receives a consistent interface. New JSONs should use Schema B (richer, better for pedagogy) with the normalizer handling the rest.

---

## EXECUTION ORDER

### Phase 0: Foundation (must be first — everything depends on this)
### Phase 1: Group A — mechanics_2d JSONs (safest — renderer already exists)
### Phase 2: Group B — wave_canvas renderer + JSONs
### Phase 3: Group C — optics_ray renderer + JSONs
### Phase 4: Group D — field_3d renderer + JSONs (highest risk — Three.js)
### Phase 5: Group E — thermodynamics renderer + JSONs
### Phase 6: Hybrid Technology System (DB + pipeline wiring)
### Phase 7: Verification + COMPLETION_REPORT.md

---

## PHASE 0 — FOUNDATION (estimated: 45 min)

### 0.1 — Fix JSON schema normalization in `loadConstants()`

**File**: `src/lib/physics_constants/index.ts`

Add a `normalizeConstants()` function that converts Schema B → Schema A:
```typescript
function normalizeConstants(raw: Record<string, unknown>): PhysicsConstantsFile {
  // Schema B detection: locked_facts is an array, or concept_id exists
  if (Array.isArray(raw.locked_facts)) {
    return {
      concept: String(raw.concept_id ?? raw.concept ?? ""),
      locked_facts: Object.fromEntries(
        (raw.locked_facts as string[]).map((fact, i) => [`fact_${i + 1}`, fact])
      ),
      animation_constraints: raw.animation_constraints ?? {},
      ncert_truth_statements: (raw.truth_statements ?? raw.ncert_truth_statements ?? []) as string[],
    };
  }
  // Schema A — return as-is
  return raw as unknown as PhysicsConstantsFile;
}
```

Call this after `JSON.parse()` in `loadConstants()`.

### 0.2 — Consolidate the THREE lookup systems into ONE

**Problem**: Three independent systems load physics constants:
1. `PHYSICS_CONSTANTS_MAP` in `aiSimulationGenerator.ts` (static imports, 3 files aliased 20 ways)
2. `loadConstants()` in `physics_constants/index.ts` (reads `src/lib/physics_constants/`)
3. `CONCEPT_FILE_MAP` + `loadConstantsForConcept()` in `physics_validator.ts` (reads `src/data/physics_constants/`)

**Solution**:
- **Keep `loadConstants()`** as the single authority (already dynamic, handles nulls gracefully)
- **Remove `PHYSICS_CONSTANTS_MAP`** from `aiSimulationGenerator.ts`. Replace `lookupPhysicsConstants()` with:
  ```typescript
  async function lookupPhysicsConstants(conceptId: string): Promise<PhysicsConstantsFile | null> {
    return await loadConstants(conceptId);
  }
  ```
- **Update `physics_validator.ts`**: Point `loadConstantsForConcept()` at `loadConstants()` instead of its own file reader. Or symlink `src/data/physics_constants/` → `src/lib/physics_constants/`.
- **Keep `CONCEPT_FILE_MAP`** in physics_validator.ts (it has useful aliases like "ohm" → "ohms_law", "emf" → "emf_internal_resistance") but have it call `loadConstants(resolvedName)` instead of its own file reader.

**Risk**: `lookupPhysicsConstants` is currently synchronous. The call site at line 3789 must be changed to `await`. Audit shows only one call site → safe to change.

### 0.3 — Eliminate duplicate `src/data/physics_constants/` directory

**Action**: Delete `src/data/physics_constants/` (14 files). All 14 files already exist in `src/lib/physics_constants/` with the same content. Update `physics_validator.ts` to use `loadConstants()`.

**Pre-check**: Diff the two directories to ensure they're truly identical before deleting.

### 0.4 — Remove static imports from aiSimulationGenerator.ts

**File**: `src/lib/aiSimulationGenerator.ts`

Remove the three static imports at the top:
```typescript
// DELETE these:
import driftVelocityConstants from "@/lib/physics_constants/drift_velocity.json";
import ohmsLawConstants from "@/lib/physics_constants/ohms_law.json";
import electricPowerHeatingConstants from "@/lib/physics_constants/electric_power_heating.json";
```

And remove the entire `PHYSICS_CONSTANTS_MAP` block (lines 1886-1910).

### 0.5 — Verify `loadConstants()` fallback behavior

`loadConstants()` already returns `null` for missing files (line 96-98). This is safe — the pipeline already handles `null` constants gracefully (line 3789-3790 + line 136-141 in stage2Runner.ts).

---

## PHASE 1 — GROUP A: mechanics_2d JSONs (10 concepts)

**Renderer**: `mechanics_2d_renderer.ts` — already exists, supports 10 scenarios
**Risk**: LOW — only adding JSON files, no code changes
**Files to create**: `src/lib/physics_constants/{concept}.json`

| # | Concept ID | Scenario Type | Key Physics |
|---|-----------|---------------|-------------|
| 1 | projectile_motion | projectile | parabolic path, vx constant, vy = gt |
| 2 | uniform_circular_motion | circular | centripetal a = v²/r toward center |
| 3 | laws_of_motion_friction | friction | f_s ≤ μ_s·N, f_k = μ_k·N |
| 4 | laws_of_motion_atwood | atwood | a = (m1-m2)g/(m1+m2), T = 2m1m2g/(m1+m2) |
| 5 | work_energy_theorem | work_energy | W_net = ΔKE |
| 6 | conservation_of_momentum | momentum | p_before = p_after |
| 7 | simple_pendulum | pendulum | T = 2π√(L/g) for small angles |
| 8 | spring_mass_system | spring_mass | F = -kx, T = 2π√(m/k) |
| 9 | torque_rotation | torque | τ = r × F, τ_net = Iα |
| 10 | circular_motion_banking | banking | tan θ = v²/rg |

**Schema**: Use Schema A (matches `PhysicsConstantsFile` directly). These are simple mechanics concepts with numerical constraints.

**Sample JSON structure**:
```json
{
  "concept": "projectile_motion",
  "locked_facts": {
    "trajectory_shape": "parabolic",
    "horizontal_acceleration": "zero (no air resistance)",
    "vertical_acceleration": "g = 9.8 m/s² downward",
    "range_formula": "R = u²sin(2θ)/g",
    "max_height_formula": "H = u²sin²(θ)/(2g)",
    "time_of_flight": "T = 2u·sin(θ)/g",
    "max_range_angle": "45 degrees"
  },
  "animation_constraints": {
    "g_px_per_frame_sq": 0.15,
    "trail_length_max": 200,
    "velocity_arrow_scale": 2.0,
    "must_show_components": true
  },
  "ncert_truth_statements": [
    "Horizontal velocity remains constant throughout projectile motion (no air resistance)",
    "Vertical velocity changes uniformly under gravity",
    "The trajectory is a parabola",
    "Range is maximum at 45 degrees for a given speed",
    "Time of flight depends only on vertical component of initial velocity"
  ]
}
```

**CONCEPT_RENDERER_MAP**: Already has all 10 entries → `mechanics_2d`. No changes needed.

**MECHANICS_SCENARIO_MAP**: Already has all 10 entries (line 2628-2639). No changes needed.

**PHYSICS_CONSTANTS_MAP**: After Phase 0.2, these auto-load via `loadConstants()`. No manual wiring needed.

**CONCEPT_FILE_MAP** (physics_validator.ts): Must add entries for the 10 mechanics concepts so validation works:
```typescript
projectile_motion: "projectile_motion",
uniform_circular_motion: "uniform_circular_motion",
// ... etc for all 10
```

---

## PHASE 2 — GROUP B: wave_canvas renderer + 6 JSONs

**Renderer**: NEW — `src/lib/renderers/wave_canvas_renderer.ts`
**Technology**: p5.js (same as mechanics_2d)
**Risk**: MEDIUM — new renderer, but follows established pattern

### 2.1 — Build wave_canvas_renderer.ts

**Pattern**: Copy mechanics_2d_renderer.ts structure. Config-driven, reads `window.SIM_CONFIG`.

**Interface** (`WaveCanvasConfig`):
```typescript
interface WaveCanvasConfig {
  scenario: 'transverse' | 'longitudinal' | 'superposition' | 'standing' | 'doppler' | 'beats';
  waves: WaveDefinition[];
  medium: { type: 'string' | 'air' | 'water'; particle_count: number; damping: number; };
  show_displacement_graph: boolean;
  show_wavelength_markers: boolean;
  show_node_antinode: boolean;
  canvas_width?: number;
  canvas_height?: number;
  states: Record<string, WaveState>;
  pvl_colors?: { background: string; text: string; wave_1: string; wave_2: string; resultant: string; };
}

interface WaveDefinition {
  id: string;
  amplitude: number;        // pixels
  wavelength: number;       // pixels
  frequency: number;        // Hz (display)
  phase: number;            // radians
  direction: 'left' | 'right' | 'stationary';
  color: string;
  label: string;
}

interface WaveState {
  label: string;
  active_waves: string[];   // which wave IDs are visible
  show_resultant: boolean;
  slider_active: boolean;
  caption: string;
  what_student_sees?: string;
}
```

**Scenarios**:
| Scenario | Visualization |
|----------|--------------|
| transverse | Sinusoidal wave on a string, particles move ⊥ to propagation |
| longitudinal | Compression-rarefaction in air column (particles move ∥) |
| superposition | Two waves merge → resultant wave |
| standing | Two equal opposite waves → nodes/antinodes |
| doppler | Moving source, wavefronts compress ahead / expand behind |
| beats | Two close-frequency waves → amplitude modulation |

**PostMessage sync**: Same as mechanics_2d: `SET_STATE` in → `SIM_READY` / `STATE_REACHED` out.

### 2.2 — Assembly function

**File**: `src/lib/aiSimulationGenerator.ts`

Add `assembleWaveCanvasHtml(config: WaveCanvasConfig): string` following the `assembleMechanics2DHtml` pattern — embeds the renderer code and config into a self-contained HTML document.

### 2.3 — Pipeline routing

Add to `CONCEPT_RENDERER_MAP`:
```typescript
// Wave concepts
wave_superposition:         "wave_canvas",
standing_waves:             "wave_canvas",
beats_waves:                "wave_canvas",
doppler_effect:             "wave_canvas",
sound_waves:                "wave_canvas",
wave_on_string:             "wave_canvas",
```

Add renderer type `"wave_canvas"` to the union in `CONCEPT_RENDERER_MAP` type.

Add pipeline branch in `generateSimulation()` (after mechanics_2d block):
```typescript
if (rendererType === "wave_canvas") {
  // Similar to mechanics_2d pipeline
}
```

### 2.4 — Wave concept JSONs (6 files)

| # | Concept ID | Scenario | Key Physics |
|---|-----------|----------|-------------|
| 1 | wave_superposition | superposition | y = y1 + y2, constructive/destructive |
| 2 | standing_waves | standing | nodes at nλ/2, antinodes at (2n+1)λ/4 |
| 3 | beats_waves | beats | f_beat = |f1 - f2| |
| 4 | doppler_effect | doppler | f' = f(v ± v_o)/(v ∓ v_s) |
| 5 | sound_waves | longitudinal | v = √(B/ρ), compression/rarefaction |
| 6 | wave_on_string | transverse | v = √(T/μ), harmonics |

---

## PHASE 3 — GROUP C: optics_ray renderer + 7 JSONs

**Renderer**: NEW — `src/lib/renderers/optics_ray_renderer.ts`
**Technology**: p5.js (Canvas 2D is ideal for ray diagrams)
**Risk**: MEDIUM — ray tracing geometry is well-defined

### 3.1 — Build optics_ray_renderer.ts

**Interface** (`OpticsRayConfig`):
```typescript
interface OpticsRayConfig {
  scenario: 'convex_lens' | 'concave_lens' | 'convex_mirror' | 'concave_mirror' | 'prism' | 'tir' | 'refraction';
  optical_element: {
    type: 'lens' | 'mirror' | 'prism' | 'interface';
    focal_length?: number;      // pixels
    radius_of_curvature?: number;
    refractive_index?: number;
    prism_angle?: number;        // degrees
    position_x: number;
    position_y: number;
  };
  object: {
    type: 'arrow' | 'point';
    position_x: number;
    position_y: number;
    height: number;
    label: string;
  };
  rays: RayDefinition[];
  show_principal_axis: boolean;
  show_focal_points: boolean;
  show_image: boolean;
  show_measurements: boolean;
  states: Record<string, OpticsState>;
  pvl_colors?: { background: string; text: string; ray: string; element: string; image: string; };
}
```

**Key drawing routines**:
- `drawLens()` / `drawMirror()` — element shapes
- `traceRay()` — refraction/reflection at surface using Snell's law
- `findImage()` — mirror/lens formula: 1/v - 1/u = 1/f
- `drawPrincipalAxis()` — horizontal line with F, 2F marks

### 3.2 — Optics concept JSONs (7 files)

| # | Concept ID | Scenario | Key Physics |
|---|-----------|----------|-------------|
| 1 | convex_lens | convex_lens | 1/v - 1/u = 1/f, real/virtual image |
| 2 | concave_lens | concave_lens | Always virtual, erect, diminished |
| 3 | convex_mirror | convex_mirror | Always virtual, erect (rear-view mirror) |
| 4 | concave_mirror | concave_mirror | Real/virtual depending on object position |
| 5 | refraction_snells_law | refraction | n₁sinθ₁ = n₂sinθ₂ |
| 6 | total_internal_reflection | tir | sinθ_c = n₂/n₁, θ > θ_c → TIR |
| 7 | prism_dispersion | prism | δ = (n-1)A, dispersion of white light |

### 3.3 — Pipeline routing

Add to `CONCEPT_RENDERER_MAP`, add `"optics_ray"` to:
1. `RendererType` union in `panelConfig.ts` (currently missing — add it)
2. `CONCEPT_RENDERER_MAP` type union in `aiSimulationGenerator.ts` (line 2256)
3. `resolveRendererType()` return type (line 2357)
4. Pipeline dispatch block in `generateSimulation()` (after mechanics_2d block)

---

## PHASE 4 — GROUP D: field_3d renderer + 8 JSONs

**Renderer**: NEW — `public/renderers/field_3d_renderer.js`
**Technology**: Three.js (loaded from CDN)
**Risk**: HIGH — Three.js is heavier, bundle size concern, mobile performance
**Mitigation**: Renderer is a standalone HTML file (like circuit_live), not bundled with Next.js

### 4.1 — Build field_3d_renderer.js

**Location**: `public/renderers/field_3d_renderer.js` (not in `src/lib/renderers/` — Three.js is too large for Next.js bundle)

**Approach**: Self-contained HTML page that loads Three.js from CDN:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
```

**Interface** (`Field3DConfig`):
```typescript
interface Field3DConfig {
  scenario: 'point_charge' | 'dipole' | 'parallel_plates' | 'magnetic_field_wire' | 'solenoid' | 'em_wave' | 'bar_magnet' | 'current_loop';
  charges: ChargeDefinition[];
  field_lines: { density: number; color: string; animated: boolean; };
  equipotential_surfaces: boolean;
  show_vectors: boolean;
  show_test_charge: boolean;
  camera: { distance: number; angle_x: number; angle_y: number; auto_rotate: boolean; };
  states: Record<string, Field3DState>;
}
```

**Key drawing routines**:
- `computeElectricField(point, charges)` — Coulomb vector sum
- `drawFieldLines()` — streamlines from charges
- `drawEquipotentials()` — isosurface meshes
- `drawCharges()` — spheres with + / - labels
- `animateTestCharge()` — particle following field direction

**PostMessage sync**: Same protocol — `SET_STATE` / `SIM_READY` / `STATE_REACHED`.

### 4.2 — Assembly function

Add `assembleField3DHtml(config: Field3DConfig): string` that embeds the renderer + config into a standalone HTML doc.

### 4.3 — Field/EM concept JSONs (8 files)

| # | Concept ID | Scenario | Key Physics |
|---|-----------|----------|-------------|
| 1 | coulombs_law_3d | point_charge | F = kq₁q₂/r², field E = kq/r² |
| 2 | electric_dipole | dipole | p = qd, torque τ = p × E |
| 3 | parallel_plate_capacitor | parallel_plates | E = σ/ε₀ uniform, C = ε₀A/d |
| 4 | magnetic_field_wire | magnetic_field_wire | B = μ₀I/(2πr), right-hand rule |
| 5 | solenoid_field | solenoid | B = μ₀nI inside, ~0 outside |
| 6 | electromagnetic_wave | em_wave | E ⊥ B ⊥ propagation, c = 1/√(μ₀ε₀) |
| 7 | bar_magnet_field | bar_magnet | Field lines N→S outside, S→N inside |
| 8 | current_loop_field | current_loop | B at center = μ₀I/(2R) |

### 4.4 — Pipeline routing + RendererType

Add `"field_3d"` to `CONCEPT_RENDERER_MAP` entries, add pipeline branch. Already in `RendererType` union.

### 4.5 — Performance safeguard

Add mobile detection: if `window.innerWidth < 768`, fall back to a 2D field-line SVG instead of Three.js. This prevents crashes on low-end Android devices (common among Indian students).

---

## PHASE 5 — GROUP E: thermodynamics renderer + 5 JSONs

**Renderer**: NEW — `src/lib/renderers/thermodynamics_renderer.ts`
**Technology**: p5.js (main canvas) + embedded Plotly (PV diagram)
**Risk**: MEDIUM — mixed rendering, but both technologies are proven in codebase

### 5.1 — Build thermodynamics_renderer.ts

**Interface** (`ThermodynamicsConfig`):
```typescript
interface ThermodynamicsConfig {
  scenario: 'piston_gas' | 'carnot_cycle' | 'heat_engine' | 'conduction' | 'radiation';
  gas: {
    type: 'ideal';
    n_moles: number;
    initial_P: number;     // Pa
    initial_V: number;     // L
    initial_T: number;     // K
    gamma: number;         // Cp/Cv
  };
  process: 'isothermal' | 'adiabatic' | 'isobaric' | 'isochoric' | 'cyclic';
  piston: {
    show: boolean;
    position_y: number;    // pixels from top
    width: number;
  };
  molecules: {
    count: number;
    show_velocity_arrows: boolean;
    color_by_speed: boolean;
  };
  pv_diagram: {
    show: boolean;
    x_range: [number, number];
    y_range: [number, number];
  };
  states: Record<string, ThermoState>;
}
```

**Key drawing routines**:
- `drawPiston()` — movable piston with gas chamber
- `drawMolecules()` — random-walk particles, speed ∝ √T
- `drawPVDiagram()` — Plotly graph embedded alongside p5.js canvas
- `animateProcess()` — piston moves, molecules speed up/slow down, PV curve traces

### 5.2 — Thermodynamics concept JSONs (5 files)

| # | Concept ID | Scenario | Key Physics |
|---|-----------|----------|-------------|
| 1 | ideal_gas_kinetic_theory | piston_gas | PV = nRT, KE_avg = (3/2)kT |
| 2 | thermodynamic_processes | piston_gas | isothermal/adiabatic/isobaric/isochoric |
| 3 | carnot_engine | carnot_cycle | η = 1 - T₂/T₁, max efficiency |
| 4 | heat_conduction | conduction | Q/t = kA(T₁-T₂)/L |
| 5 | first_law_thermodynamics | piston_gas | ΔU = Q - W |

---

## PHASE 6 — HYBRID TECHNOLOGY SYSTEM

### 6.1 — DB Migration (Supabase)

Add columns to `concept_panel_config`:
```sql
ALTER TABLE concept_panel_config
  ADD COLUMN IF NOT EXISTS technology_a TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS technology_b TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS technology_c TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS technology_hint TEXT DEFAULT NULL;
```

Values: `"p5js"`, `"threejs"`, `"plotly"`, `"canvas2d"`, `null` (auto-detect).

### 6.2 — Extend ModifiedSimulationJson

**File**: `src/lib/jsonModifier.ts`

Add optional fields:
```typescript
export interface ModifiedSimulationJson {
  // ... existing fields ...
  technology_config?: {
    primary_technology: 'p5js' | 'threejs' | 'plotly' | 'canvas2d';
    secondary_technology?: 'p5js' | 'threejs' | 'plotly' | 'canvas2d';
  };
  panel_assignment?: {
    primary_panel: string;     // renderer type for panel A
    secondary_panel?: string;  // renderer type for panel B
  };
}
```

### 6.3 — Extend buildStage2Prompt for multi-panel

**File**: `src/lib/simulation/stage2Prompt.ts`

When `technology_config` is present, add a TECHNOLOGY section to the prompt telling Sonnet which rendering constraints to respect (e.g., Three.js scenes can't use p5.js draw functions).

### 6.4 — Multi-panel routing in generateSimulation

**File**: `src/lib/aiSimulationGenerator.ts`

After `resolveRendererType()`, check `concept_panel_config` from Supabase. If `default_panel_count > 1`, run both renderers:
- Primary → generates `simHtml`
- Secondary → generates `secondarySimHtml` (existing field in SimulationResult)

This is already partially implemented for `graph_interactive` via `runGraphPipeline`. Extend pattern.

### 6.5 — Update CONCEPT_PANEL_MAP

**File**: `src/config/panelConfig.ts`

Add entries for all new concepts with appropriate layouts.

### 6.6 — Supabase inserts for new concepts

Insert rows into `concept_panel_config` for all ~36 new concepts.

---

## PHASE 7 — VERIFICATION + COMPLETION_REPORT.md

### 7.1 — Type-check
```bash
npx tsc --noEmit
```
Must pass with no new errors beyond the pre-existing 7.

### 7.2 — Build test
```bash
npm run build
```
Must complete successfully.

### 7.3 — Manual verification (per renderer)
For each new renderer, verify:
- [ ] `assembleXxxHtml()` produces valid self-contained HTML
- [ ] `window.SIM_CONFIG` is injected correctly
- [ ] `SET_STATE` → `STATE_REACHED` postMessage works
- [ ] `SIM_READY` fires on load
- [ ] All 4 states render correctly
- [ ] Mobile fallback works (for field_3d)

### 7.4 — Generate COMPLETION_REPORT.md

---

## SAFE EXECUTION ORDER (dependency graph)

```
Phase 0 (foundation)
  ├─ 0.1 loadConstants normalizer
  └─ 0.2 remove PHYSICS_CONSTANTS_MAP, use loadConstants
       │
       ▼
Phase 1 (mechanics_2d JSONs — safest, no renderer changes)
       │
       ▼
Phase 2 (wave_canvas — follows mechanics_2d pattern)
Phase 3 (optics_ray — follows same pattern)
  [these can run in parallel]
       │
       ▼
Phase 4 (field_3d — highest risk, Three.js)
Phase 5 (thermodynamics — mixed tech)
  [these can run in parallel]
       │
       ▼
Phase 6 (hybrid tech system — touches DB + pipeline)
       │
       ▼
Phase 7 (verification)
```

## ROLLBACK STRATEGY

Each phase is independently reversible:
- **Phase 0**: Revert index.ts + aiSimulationGenerator.ts changes
- **Phase 1-5**: Delete JSON files + renderer files, revert CONCEPT_RENDERER_MAP entries
- **Phase 6**: Roll back DB migration (`ALTER TABLE ... DROP COLUMN`)

No existing functionality is broken at any step — all changes are additive. Existing concepts continue to use their current renderers and JSONs.

## FILES THAT WILL BE MODIFIED

| File | Change Type |
|------|------------|
| `src/lib/physics_constants/index.ts` | Add normalizer function |
| `src/lib/aiSimulationGenerator.ts` | Remove PHYSICS_CONSTANTS_MAP, add pipeline branches, add assembly functions |
| `src/config/panelConfig.ts` | Add CONCEPT_PANEL_MAP entries |
| `src/lib/jsonModifier.ts` | Add technology_config, panel_assignment fields |
| `src/lib/simulation/stage2Prompt.ts` | Add technology section to prompt |

## FILES THAT WILL BE CREATED

| File | Size Est. |
|------|-----------|
| `src/lib/renderers/wave_canvas_renderer.ts` | ~15KB |
| `src/lib/renderers/optics_ray_renderer.ts` | ~20KB |
| `public/renderers/field_3d_renderer.js` | ~25KB |
| `src/lib/renderers/thermodynamics_renderer.ts` | ~18KB |
| 10 mechanics_2d JSON files | ~1KB each |
| 6 wave JSON files | ~1.5KB each |
| 7 optics JSON files | ~1.5KB each |
| 8 field/EM JSON files | ~1.5KB each |
| 5 thermodynamics JSON files | ~1.5KB each |
| Supabase migration SQL | ~2KB |
| COMPLETION_REPORT.md | ~3KB |

**Total new files**: ~42 files
**Total new code**: ~110KB estimated

## QUESTIONS FOR APPROVAL

1. **JSON Schema**: Go with Option B (normalizer in loadConstants)? Or standardize everything to Schema A?
2. **field_3d mobile fallback**: Use 2D SVG fallback on mobile, or show a "rotate your phone" message?
3. **Phase execution**: Execute all phases sequentially, or parallelize Phases 2+3 and 4+5?
4. **Existing AC JSONs (Schema B)**: Wire them into the pipeline now, or leave for a later session?
5. **Hybrid Technology System (Phase 6)**: Build it now, or defer until renderers are proven stable?
