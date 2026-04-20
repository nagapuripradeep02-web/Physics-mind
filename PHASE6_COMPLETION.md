# Phase 6 — Hybrid Technology System: Completion Report
Generated: 2026-03-22

## Summary

Phase 6 wires multi-panel routing into the simulation pipeline. It establishes
the data flow for dual-panel concepts (technology_config + panel_assignment)
without building the frontend sync UI (sendToAll / STATE_REACHED bridge).

## Files Modified (4 total)

### 1. `src/lib/jsonModifier.ts` — Extended
- **Added types**: `TechnologyConfig`, `PanelAssignment`
- **Extended**: `ModifiedSimulationJson` with `technology_config` and `panel_assignment` fields
- **Extended**: `JsonModifierInput` with `conceptId` field
- **Added**: `fetchTechnologyConfig()` — Supabase lookup for concept_panel_config
- **Added**: `fetchPanelAssignment()` — Sonnet call for EPIC-C + dual-panel panel emphasis
- **Extended**: `runJsonModifier()` — fetches technology_config before EPIC branching,
  runs panel_assignment Sonnet call only on EPIC-C + panel_count > 1

### 2. `src/lib/simulation/stage2Prompt.ts` — Extended
- **Extended**: `buildStage2Prompt()` with multi-panel block (when panel_count > 1)
  - Injects MULTI-PANEL DISPLAY section requiring `panel_a_config` + `panel_b_config`
  - Injects SHARED STATE CONTRACT (STATE_1-4 must be identical)
- **Added**: Technology-specific config shape hints:
  - Three.js (field_3d) — scene_type, charge_positions, camera_position
  - Mixed (thermodynamics) — process_type, initial/final_state, pv_diagram
  - Plotly (graph_interactive) — graph_type, axes, data_points

### 3. `src/lib/simulation/stage2Runner.ts` — Extended
- **Extended**: `max_tokens` from 2000 to 2500 for multi-panel prompts

### 4. `src/lib/aiSimulationGenerator.ts` — Extended
- **Extended**: `SimulationResult` type to union: `SinglePanelResult | MultiPanelResult`
- **Added**: Multi-panel routing block after jsonModifier, before renderer routing
  - When panel_count > 1: runs Stage 2 with multi-panel prompt
  - If Config Writer returns dual configs: returns `MultiPanelResult`
  - If Config Writer fails to produce dual configs: falls through to single-panel
- **Updated**: `runJsonModifier()` call site to pass `conceptId`

### 5. `src/app/api/generate-simulation/route.ts` — Extended
- **Added**: `multi_panel` result handling branch before existing single-panel response

## Architecture

```
Student question → /api/chat → extractStudentConfusion
                 → /api/generate-simulation → generateSimulation()
                   ├─ Stage 1: Brief (Flash)
                   ├─ jsonModifier (NOW: fetches technology_config from DB)
                   │   ├─ fetchTechnologyConfig(conceptId) → Supabase lookup
                   │   ├─ if EPIC-C + panel_count > 1:
                   │   │   └─ fetchPanelAssignment() → Sonnet decides panel emphasis
                   │   └─ returns modifiedJson with technology_config + panel_assignment
                   ├─ if panel_count > 1:
                   │   ├─ Stage 2: Config Writer (Sonnet, max_tokens=2500)
                   │   │   └─ Multi-panel prompt → { panel_a_config, panel_b_config }
                   │   └─ return MultiPanelResult
                   └─ else:
                       └─ existing single-panel routing (unchanged)
```

## Fallback Chain

1. Supabase lookup fails → default single-panel config (canvas2d, circuit_live)
2. Panel assignment Sonnet call fails → default panel_assignment (panel_a primary)
3. Config Writer returns single config for dual concept → falls through to single-panel
4. All existing single-panel pipelines → unchanged

## TypeScript
- `npx tsc --noEmit`: **0 errors**

## Testing

Tests require running `npm run dev` and curling `/api/generate-simulation`.

Expected log patterns:

### Single-panel concept (e.g., series_resistance)
```
[jsonModifier] technology_config: {"panel_count":1,"technology_a":"canvas2d",...}
[jsonModifier] primary_panel: panel_a
→ Existing pipeline, unchanged behavior
```

### Dual-panel concept, EPIC-L (e.g., "explain Ohm's Law")
```
[jsonModifier] technology_config: {"panel_count":1,...}
→ ohms_law has panel_count=1 in DB, so single-panel path
```

### Dual-panel concept, EPIC-C with panel_count > 1
```
[jsonModifier] technology_config: {"panel_count":2,...}
[jsonModifier] primary_panel: panel_a
[jsonModifier] panel_a_emphasis: ...
[jsonModifier] panel_b_emphasis: ...
[multiPanel] routing dual panel: <concept_id>
[multiPanel] panel_a renderer: <renderer>
[multiPanel] panel_b renderer: <renderer>
```

## What Comes Next

1. **Frontend sync UI** — build sendToAll() / STATE_REACHED iframe bridge
   to actually synchronize dual panels from TeacherPlayer
2. **Update concept_panel_config rows** — set `default_panel_count=2` for
   concepts that should use dual panels (currently all rows have panel_count=1)
3. **Dual-panel HTML assembly** — generate actual iframe HTML for each panel
   using the per-panel configs from Config Writer
