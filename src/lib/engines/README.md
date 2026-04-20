# PhysicsMind Engine Architecture

> **Engines are the operating system. JSONs are the content.**
> Engine change = TypeScript code (Antigravity).
> Content change = JSON file (Architect).

---

## Engine Contract

Every engine implements this interface:

```typescript
interface Engine<Config, State> {
  readonly id: string;
  readonly dependencies: string[];
  init(config: Config, session: SimSession): Promise<State>;
  reset(): Promise<void>;
  destroy(): Promise<void>;
  onEvent?(event: SimEvent): void;
}
```

---

## Boot Order (dependency-strict)

```
Tier A (pure computation):     Physics Engine
Tier B (layout, no DOM):       Zone Layout, Scale, Anchor Resolver
Tier C (rendering, DOM):       PCPL Renderer, Choreography, Transition, Focal
Tier D (audio + events):       Teacher Script, TTS, Interaction, Panel B
Tier E (meta/routing):         State Machine, Misconception, Assessment
Tier F (observers, read-only): Telemetry, Progress
```

---

## Tier Discipline — Failure Policy

| Tier | Failure Action |
|------|----------------|
| A+B (Physics, Layout, Scale, Anchor) | FATAL — abort session, show "Try refreshing" |
| C (PCPL, Choreography, Transition, Focal) | DEGRADED MODE — static fallback, log, continue |
| D (Teacher Script, TTS, Interaction, Panel B) | SILENT FALLBACK — TTS→captions, sliders→disabled |
| E (State Machine, Misconception, Assessment) | SKIP FEATURE — serve baseline EPIC-L |
| F (Telemetry, Progress) | SILENT LOG — never visible to student |

---

## Engine Roster

### TIER 0 — Orchestration

| # | Engine | Dir | Status | Purpose |
|---|--------|-----|--------|---------|
| 0 | SimSession Orchestrator | `sim-session/` | NOT BUILT | Boots engines in dependency order, owns event bus |

### TIER 1 — Foundation

| # | Engine | Dir | Status | Purpose |
|---|--------|-----|--------|---------|
| 1 | Physics Engine | `physics/` | EXISTS (src/lib/physicsEngine/) | computePhysics(conceptId, vars) → PhysicsResult |
| 1a | Physics Validation | `physics-validation/` | NOT BUILT | Validates outputs are physical (N>=0, arrows fit canvas) |
| 2 | Zone Layout | `zone-layout/` | NOT BUILT — HIGHEST PRIORITY | zone:"MAIN_ZONE" → pixel coords. Canvas 760x500 |
| 3 | Anchor Resolver | `anchor-resolver/` | PARTIAL (body/surface registries exist) | Zone/body/surface/offset anchor resolution |
| 4 | Scale Engine | `scale/` | NOT BUILT | UNIT_TO_PX = MAIN_ZONE.height * 0.70 / maxMagnitude |
| 5 | Collision Detection | `collision/` | NOT BUILT | AABB overlap check on labels/annotations |

### TIER 2 — Teaching Loop

| # | Engine | Dir | Status | Purpose |
|---|--------|-----|--------|---------|
| 6 | PCPL Renderer | (src/lib/pcplRenderer/) | EXISTS | renderSceneComposition() — 12 primitives |
| 7 | Teacher Script | `teacher-script/` | AD-HOC in TeacherPlayer | Reads tts_sentences[], respects advance_mode |
| 8 | State Machine | `state-machine/` | SCATTERED | State graph, events: NEXT/PREV/JUMP/RESTART |
| 9 | Interaction Engine | `interaction/` | NOT BUILT | slider_changed → Physics → Scale → PCPL → Panel B |
| 10 | Panel B Equation | `panel-b/` | NOT BUILT | Live graph from panel_b_config, mathjs (not eval) |
| 10a | Cache Manager | `cache-manager/` | NOT BUILT | 5D fingerprint cache, lock-based population |

### TIER 3 — Motion and Misconception

| # | Engine | Dir | Status | Purpose |
|---|--------|-----|--------|---------|
| 11 | Choreography | `choreography/` | NOT BUILT | Physics-driven animation from equations |
| 12 | Transition | `transition/` | NOT BUILT | 800ms interpolation between scene_compositions |
| 13 | Focal Attention | `focal-attention/` | NOT BUILT | pulse/highlight/dim_others/glow on focal_primitive |
| 14 | Misconception Detection | `misconception-detection/` | SCATTERED | trigger_phrases match → EPIC-C branch selection |

### TIER 4+ — Polish, Scale, Autoauthoring

Not scaffolded yet (Month 2+): TTS, Assessment, Telemetry, Anchor-to-Student,
diagram_tutor primitives, Regeneration, Progress, i18n, Accessibility,
Image Intake, Offline 5-Agent Pipeline.

---

## AI Ban Rule

**@ai-sdk/anthropic imports BANNED in src/lib/engines/**

Engines are deterministic TypeScript. No AI calls.
Physics Engine computes N=mgcos(theta) — that is math, not an LLM task.
Zone Layout resolves pixel coords — that is geometry, not an LLM task.

Live serving target: Haiku ONLY for routing. Sonnet OFFLINE ONLY.

---

## Cross-Engine Communication

Engines NEVER call each other directly. All communication via SimEvent on the event bus.

```typescript
type SimEvent =
  | { type: 'STATE_ENTER';        state: string }
  | { type: 'STATE_EXIT';         state: string }
  | { type: 'SLIDER_CHANGE';      variable: string; value: number }
  | { type: 'HOTSPOT_TAP';        primitive_id: string }
  | { type: 'TTS_SENTENCE_END';   sentence_id: string }
  | { type: 'ANIMATION_COMPLETE'; primitive_id: string }
  | { type: 'CONFUSION_SIGNAL';   source: 'emoji' | 'reask' | 'dropoff' }
  | { type: 'MODE_CHANGE';        mode: 'conceptual' | 'board' | 'competitive' }
  | { type: 'ENGINE_FAILURE';     engine_id: string; error: Error };
```

---

## Canvas Zones (fixed 760x500)

```
MAIN_ZONE:      { x:30,  y:80,  w:430, h:380 }  — all physics drawing
CALLOUT_ZONE_R: { x:475, y:80,  w:255, h:200 }  — annotations
FORMULA_ZONE:   { x:475, y:290, w:255, h:170 }  — equations
CONTROL_ZONE:   { x:30,  y:460, w:700, h:40  }  — sliders
TITLE_ZONE:     { x:30,  y:10,  w:700, h:60  }  — state title
```
