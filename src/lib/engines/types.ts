/**
 * Shared types for the PhysicsMind engine architecture.
 * Every engine implements Engine<Config, State>.
 * Engines communicate ONLY via SimEvent on the event bus.
 */

// ── SimEvent union (cross-engine communication) ─────────────────────

export type SimEvent =
  | { type: 'STATE_ENTER';        state: string }
  | { type: 'STATE_EXIT';         state: string }
  | { type: 'SLIDER_CHANGE';      variable: string; value: number }
  | { type: 'HOTSPOT_TAP';        primitive_id: string }
  | { type: 'TTS_SENTENCE_END';   sentence_id: string }
  | { type: 'ANIMATION_COMPLETE'; primitive_id: string }
  | { type: 'CONFUSION_SIGNAL';   source: 'emoji' | 'reask' | 'dropoff' }
  | { type: 'MODE_CHANGE';        mode: 'conceptual' | 'board' | 'competitive' }
  | { type: 'ENGINE_FAILURE';     engine_id: string; error: Error }
  | { type: 'PHYSICS_COMPUTED';   conceptId: string; forces: { id: string; magnitude: number }[] }
  | { type: 'SCALE_UPDATED';     unitToPx: number; maxMagnitude: number }
  | { type: 'LESSON_COMPLETE' };

// ── Engine interface ────────────────────────────────────────────────

export interface SimSession {
  readonly sessionId: string;
  emit(event: SimEvent): void;
  on(eventType: SimEvent['type'], handler: (event: SimEvent) => void): void;
  off(eventType: SimEvent['type'], handler: (event: SimEvent) => void): void;
  getEngine<T>(engineId: string): T | null;
}

export interface Engine<Config = unknown, State = unknown> {
  readonly id: string;
  readonly dependencies: string[];
  init(config: Config, session: SimSession): Promise<State>;
  reset(): Promise<void>;
  destroy(): Promise<void>;
  onEvent?(event: SimEvent): void;
}

// ── Canvas zones (fixed 760x500) ────────────────────────────────────

export interface Zone {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const CANVAS_WIDTH = 760;
export const CANVAS_HEIGHT = 500;

export const ZONES: Record<string, Zone> = {
  MAIN_ZONE:      { x: 30,  y: 80,  w: 430, h: 380 },
  CALLOUT_ZONE_R: { x: 475, y: 80,  w: 255, h: 200 },
  FORMULA_ZONE:   { x: 475, y: 290, w: 255, h: 170 },
  CONTROL_ZONE:   { x: 30,  y: 460, w: 700, h: 40  },
  TITLE_ZONE:     { x: 30,  y: 10,  w: 700, h: 60  },
};

// ── Engine tiers (for failure policy) ───────────────────────────────

export type EngineTier = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface EngineRegistration {
  id: string;
  tier: EngineTier;
  factory: () => Engine;
  dependencies: string[];
}
