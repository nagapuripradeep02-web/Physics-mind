/**
 * Engine 11: Physics-Driven Choreography Engine
 *
 * Objects move from REAL PHYSICS EQUATIONS, not constant speed.
 * Per CLAUDE.md §21 Engine 11: a ball in free_fall must accelerate;
 * a projectile must slow going up, stop at peak, speed up coming down;
 * a spring mass must move fast at center and stop at extremes.
 *
 * API:
 *   startAnimation(primitiveId, spec)   — register the primitive as animating
 *   getPosition(primitiveId, t_ms)      — compute position at elapsed t_ms from start
 *   isAnimating(primitiveId)            — membership check
 *   stopAnimation(primitiveId)          — remove from active set
 *   onEvent(STATE_EXIT)                 — clear all active animations
 *
 * Returned positions are relative to the primitive's origin (x=0, y=0 at t=0).
 * Callers offset by the primitive's anchor when drawing.
 */

import type { Engine, SimSession, SimEvent } from '../types';

export type AnimationType =
  | 'projectile'
  | 'free_fall'
  | 'simple_harmonic'
  | 'circular'
  | 'atwood'
  | 'slide_incline'
  | 'grow'
  | 'fade_in'
  | 'draw_from_tail'
  | 'instant';

export interface AnimationSpec {
  type: AnimationType;
  duration_ms?: number;
  physics_vars?: Record<string, number>;
}

export interface AnimationPosition {
  x: number;
  y: number;
  opacity?: number;
  scale?: number;
}

export interface ChoreographyConfig {
  pixelsPerMeter?: number;
}

export interface ChoreographyState {
  activeCount: number;
}

interface ActiveAnimation extends AnimationSpec {
  startTime: number;
}

const DEFAULT_PIXELS_PER_METER = 20;
const DEFAULT_G = 9.8;
const DEFAULT_TIMING_DURATION_MS = 500;

export class ChoreographyEngine implements Engine<ChoreographyConfig, ChoreographyState> {
  readonly id = 'choreography';
  readonly dependencies = ['physics'];

  private session: SimSession | null = null;
  private animations = new Map<string, ActiveAnimation>();
  private pixelsPerMeter = DEFAULT_PIXELS_PER_METER;

  async init(config: ChoreographyConfig, session: SimSession): Promise<ChoreographyState> {
    this.session = session;
    this.pixelsPerMeter = config.pixelsPerMeter ?? DEFAULT_PIXELS_PER_METER;
    this.animations.clear();
    return { activeCount: 0 };
  }

  async reset(): Promise<void> {
    this.animations.clear();
  }

  async destroy(): Promise<void> {
    this.animations.clear();
    this.session = null;
  }

  startAnimation(primitiveId: string, spec: AnimationSpec): void {
    this.animations.set(primitiveId, { ...spec, startTime: Date.now() });
  }

  isAnimating(primitiveId: string): boolean {
    return this.animations.has(primitiveId);
  }

  stopAnimation(primitiveId: string): void {
    this.animations.delete(primitiveId);
  }

  getActiveCount(): number {
    return this.animations.size;
  }

  getPosition(primitiveId: string, t_ms: number): AnimationPosition | null {
    const anim = this.animations.get(primitiveId);
    if (!anim) return null;

    const t = t_ms / 1000; // seconds
    const vars = anim.physics_vars ?? {};
    const ppm = this.pixelsPerMeter;

    switch (anim.type) {
      case 'free_fall': {
        const g = vars.g ?? DEFAULT_G;
        return { x: 0, y: 0.5 * g * t * t * ppm };
      }

      case 'projectile': {
        const v0 = vars.v0 ?? 10;
        const theta = ((vars.theta_deg ?? 45) * Math.PI) / 180;
        const g = vars.g ?? DEFAULT_G;
        const xMeters = v0 * Math.cos(theta) * t;
        const yMeters = v0 * Math.sin(theta) * t - 0.5 * g * t * t;
        return { x: xMeters * ppm, y: -yMeters * ppm };
      }

      case 'simple_harmonic': {
        const A = vars.A ?? 50;
        const omega = vars.omega ?? 2 * Math.PI;
        const phi = vars.phi ?? 0;
        return { x: A * Math.cos(omega * t + phi), y: 0 };
      }

      case 'circular': {
        const r = vars.r ?? 50;
        const omega = vars.omega ?? 2 * Math.PI;
        return { x: r * Math.cos(omega * t), y: r * Math.sin(omega * t) };
      }

      case 'atwood': {
        const m1 = vars.m1 ?? 2;
        const m2 = vars.m2 ?? 1;
        const g = vars.g ?? DEFAULT_G;
        const a = ((m1 - m2) * g) / (m1 + m2);
        return { x: 0, y: 0.5 * a * t * t * ppm };
      }

      case 'slide_incline': {
        const theta = ((vars.theta_deg ?? 30) * Math.PI) / 180;
        const mu = vars.mu ?? 0;
        const g = vars.g ?? DEFAULT_G;
        let a = g * (Math.sin(theta) - mu * Math.cos(theta));
        if (a < 0) a = 0;
        const disp = 0.5 * a * t * t * ppm;
        return { x: disp * Math.cos(theta), y: disp * Math.sin(theta) };
      }

      case 'grow':
      case 'draw_from_tail': {
        const duration = anim.duration_ms ?? DEFAULT_TIMING_DURATION_MS;
        const progress = duration <= 0 ? 1 : Math.min(1, Math.max(0, t_ms / duration));
        return { x: 0, y: 0, scale: progress };
      }

      case 'fade_in': {
        const duration = anim.duration_ms ?? DEFAULT_TIMING_DURATION_MS;
        const progress = duration <= 0 ? 1 : Math.min(1, Math.max(0, t_ms / duration));
        return { x: 0, y: 0, opacity: progress };
      }

      case 'instant':
        return { x: 0, y: 0, scale: 1, opacity: 1 };

      default:
        return null;
    }
  }

  onEvent(event: SimEvent): void {
    if (event.type === 'STATE_EXIT') {
      this.animations.clear();
    }
  }
}
