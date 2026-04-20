/**
 * Engine 13: Focal Attention Engine
 *
 * Per-primitive visual treatment computation. When a state designates a
 * focal_primitive_id with a treatment, the renderer queries this engine
 * every frame for the effective visual overrides.
 *
 * Treatments:
 *   pulse       — scale oscillates 1.0 → 1.08 → 1.0 at 2 Hz (focal only)
 *   highlight   — 2px gold border on focal
 *   dim_others  — opacity 0.4 for every primitive except focal + relatedToFocal
 *   glow        — radial glow on focal
 *
 * API surface:
 *   setFocal(id, treatment, related?)   imperative
 *   clearFocal()
 *   getFocal()
 *   getTreatmentFor(id, t_ms)           renderer-facing per-frame query
 *   onEvent(STATE_ENTER)                reads config.states[id].setFocal()
 */

import type { Engine, SimSession, SimEvent } from '../types';

export type FocalTreatment = 'pulse' | 'highlight' | 'dim_others' | 'glow';

export interface FocalStateDef {
  focalPrimitiveId: string;
  treatment: FocalTreatment;
  relatedToFocal?: string[];
}

export interface FocalAttentionConfig {
  states?: Record<string, FocalStateDef>;
}

export interface FocalAttentionState {
  focal: FocalFocal | null;
}

export interface FocalFocal {
  primitiveId: string;
  treatment: FocalTreatment;
  relatedToFocal: string[];
}

export interface FocalTreatmentResult {
  scale?: number;
  opacity?: number;
  borderWidth?: number;
  borderColor?: string;
  glowRadius?: number;
}

const HIGHLIGHT_BORDER_WIDTH = 2;
const HIGHLIGHT_BORDER_COLOR = '#FFD700';
const GLOW_RADIUS_PX = 12;
const DIM_OPACITY = 0.4;
const PULSE_MID = 1.04;
const PULSE_AMP = 0.04;
const PULSE_HZ = 2;

export class FocalAttentionEngine implements Engine<FocalAttentionConfig, FocalAttentionState> {
  readonly id = 'focal-attention';
  readonly dependencies = ['state-machine'];

  private session: SimSession | null = null;
  private config: FocalAttentionConfig = {};
  private focal: FocalFocal | null = null;

  async init(config: FocalAttentionConfig, session: SimSession): Promise<FocalAttentionState> {
    this.config = config ?? {};
    this.session = session;
    this.focal = null;
    return { focal: null };
  }

  async reset(): Promise<void> {
    this.focal = null;
  }

  async destroy(): Promise<void> {
    this.focal = null;
    this.session = null;
    this.config = {};
  }

  setFocal(primitiveId: string, treatment: FocalTreatment, relatedToFocal: string[] = []): void {
    this.focal = {
      primitiveId,
      treatment,
      relatedToFocal: [...relatedToFocal],
    };
  }

  clearFocal(): void {
    this.focal = null;
  }

  getFocal(): Readonly<FocalFocal> | null {
    return this.focal;
  }

  getTreatmentFor(primitiveId: string, t_ms: number): FocalTreatmentResult | null {
    if (!this.focal) return null;

    const isFocal = primitiveId === this.focal.primitiveId;
    const isRelated = this.focal.relatedToFocal.includes(primitiveId);

    if (isFocal) {
      switch (this.focal.treatment) {
        case 'pulse': {
          const tSec = t_ms / 1000;
          const scale = PULSE_MID + PULSE_AMP * Math.sin(2 * Math.PI * PULSE_HZ * tSec);
          return { scale };
        }
        case 'highlight':
          return { borderWidth: HIGHLIGHT_BORDER_WIDTH, borderColor: HIGHLIGHT_BORDER_COLOR };
        case 'glow':
          return { glowRadius: GLOW_RADIUS_PX };
        case 'dim_others':
          return { opacity: 1.0 };
      }
    }

    if (this.focal.treatment === 'dim_others') {
      if (isRelated) return { opacity: 1.0 };
      return { opacity: DIM_OPACITY };
    }

    return null;
  }

  onEvent(event: SimEvent): void {
    if (event.type !== 'STATE_ENTER') return;
    const cfg = this.config.states?.[event.state];
    if (!cfg) {
      this.focal = null;
      return;
    }
    this.setFocal(cfg.focalPrimitiveId, cfg.treatment, cfg.relatedToFocal);
  }
}
