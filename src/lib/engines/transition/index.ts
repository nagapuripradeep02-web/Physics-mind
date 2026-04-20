/**
 * Engine 12: Transition Engine
 *
 * Interpolates numeric values (positions, magnitudes, opacities) over a duration
 * when states change. Defaults: 800ms, ease_in_out.
 *
 * API:
 *   startTransition(spec)            — begin a new transition
 *   getProgress(t_ms)                — eased 0..1 at elapsed t_ms
 *   interpolate(from, to, t_ms)      — from + (to - from) * getProgress(t_ms)
 *   isTransitioning()                — boolean, true after startTransition
 *   onEvent(STATE_ENTER)             — auto-starts transition from previous → new state
 */

import type { Engine, SimSession, SimEvent } from '../types';

export type Easing = 'linear' | 'ease_in_out';

export interface TransitionSpec {
  from_state: string | null;
  to_state: string;
  duration_ms?: number;
  easing?: Easing;
}

export interface TransitionConfig {
  defaultDurationMs?: number;
  defaultEasing?: Easing;
}

export interface TransitionState {
  isTransitioning: boolean;
  fromState: string | null;
  toState: string | null;
  durationMs: number;
  easing: Easing;
}

const DEFAULT_DURATION_MS = 800;
const DEFAULT_EASING: Easing = 'ease_in_out';

interface ActiveTransition {
  spec: Required<Omit<TransitionSpec, 'from_state'>> & { from_state: string | null };
  startTime: number;
}

export class TransitionEngine implements Engine<TransitionConfig, TransitionState> {
  readonly id = 'transition';
  readonly dependencies = ['state-machine'];

  private session: SimSession | null = null;
  private defaultDurationMs = DEFAULT_DURATION_MS;
  private defaultEasing: Easing = DEFAULT_EASING;
  private active: ActiveTransition | null = null;
  private lastEnteredState: string | null = null;

  async init(config: TransitionConfig, session: SimSession): Promise<TransitionState> {
    this.session = session;
    this.defaultDurationMs = config.defaultDurationMs ?? DEFAULT_DURATION_MS;
    this.defaultEasing = config.defaultEasing ?? DEFAULT_EASING;
    this.active = null;
    this.lastEnteredState = null;
    return this.snapshot();
  }

  async reset(): Promise<void> {
    this.active = null;
    this.lastEnteredState = null;
  }

  async destroy(): Promise<void> {
    this.active = null;
    this.session = null;
  }

  startTransition(spec: TransitionSpec): void {
    this.active = {
      spec: {
        from_state: spec.from_state,
        to_state: spec.to_state,
        duration_ms: spec.duration_ms ?? this.defaultDurationMs,
        easing: spec.easing ?? this.defaultEasing,
      },
      startTime: Date.now(),
    };
  }

  isTransitioning(): boolean {
    return this.active !== null;
  }

  getProgress(t_ms: number): number {
    if (!this.active) return 0;
    const duration = this.active.spec.duration_ms;
    if (duration <= 0) return 1;
    const linear = Math.min(1, Math.max(0, t_ms / duration));
    if (this.active.spec.easing === 'linear') return linear;
    return linear < 0.5
      ? 2 * linear * linear
      : -1 + (4 - 2 * linear) * linear;
  }

  interpolate(from: number, to: number, t_ms: number): number {
    return from + (to - from) * this.getProgress(t_ms);
  }

  getActiveSpec(): Readonly<TransitionSpec> | null {
    return this.active ? this.active.spec : null;
  }

  onEvent(event: SimEvent): void {
    if (event.type === 'STATE_ENTER') {
      this.startTransition({
        from_state: this.lastEnteredState,
        to_state: event.state,
      });
      this.lastEnteredState = event.state;
    }
  }

  private snapshot(): TransitionState {
    return {
      isTransitioning: this.active !== null,
      fromState: this.active?.spec.from_state ?? null,
      toState: this.active?.spec.to_state ?? null,
      durationMs: this.active?.spec.duration_ms ?? this.defaultDurationMs,
      easing: this.active?.spec.easing ?? this.defaultEasing,
    };
  }
}
