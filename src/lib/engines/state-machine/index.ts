/**
 * Engine 8: State Machine Engine
 *
 * Linear state graph: STATE_1 → STATE_2 → ... → STATE_N (EPIC-L)
 * Emits STATE_EXIT / STATE_ENTER / LESSON_COMPLETE through the event bus.
 * canAdvance() reads the current state's advance_mode.
 */

import type { Engine, SimSession, SimEvent } from '../types';
import type { AdvanceMode } from '../teacher-script';

export interface StateMachineConfig {
  states: string[];
  initialState?: string;
  advanceModes?: Record<string, AdvanceMode>;
}

export interface StateMachineState {
  currentState: string | null;
  stateIndex: number;
  stateCount: number;
}

export class StateMachineEngine implements Engine<StateMachineConfig, StateMachineState> {
  readonly id = 'state-machine';
  readonly dependencies: string[] = [];

  private session: SimSession | null = null;
  private config: StateMachineConfig | null = null;
  private state: StateMachineState = { currentState: null, stateIndex: -1, stateCount: 0 };
  private ttsDone = false;
  private interactionDone = false;

  async init(config: StateMachineConfig, session: SimSession): Promise<StateMachineState> {
    this.config = config;
    this.session = session;
    this.state = { currentState: null, stateIndex: -1, stateCount: config.states.length };
    const initial = config.initialState ?? config.states[0];
    if (initial !== undefined) {
      this.enterState(initial);
    }
    return this.state;
  }

  enterState(stateId: string): void {
    if (!this.config) return;
    const newIdx = this.config.states.indexOf(stateId);
    if (newIdx < 0) return;

    if (this.state.currentState !== null) {
      this.session?.emit({ type: 'STATE_EXIT', state: this.state.currentState });
    }
    this.state.currentState = stateId;
    this.state.stateIndex = newIdx;
    this.ttsDone = false;
    this.interactionDone = false;
    this.session?.emit({ type: 'STATE_ENTER', state: stateId });
  }

  getCurrentState(): string | null {
    return this.state.currentState;
  }

  getStateIds(): string[] {
    return this.config ? [...this.config.states] : [];
  }

  next(): void {
    if (!this.config) return;
    const nextIdx = this.state.stateIndex + 1;
    if (nextIdx >= this.config.states.length) {
      this.session?.emit({ type: 'LESSON_COMPLETE' });
      return;
    }
    this.enterState(this.config.states[nextIdx]);
  }

  previous(): void {
    if (!this.config) return;
    const prevIdx = this.state.stateIndex - 1;
    if (prevIdx < 0) return;
    this.enterState(this.config.states[prevIdx]);
  }

  canAdvance(): boolean {
    if (!this.config || this.state.currentState === null) return false;
    const mode = this.config.advanceModes?.[this.state.currentState] ?? 'manual_click';
    switch (mode) {
      case 'manual_click':
        return true;
      case 'auto_after_tts':
        return this.ttsDone;
      case 'interaction_complete':
        return this.interactionDone;
      case 'wait_for_answer':
        return false;
      default:
        return false;
    }
  }

  async reset(): Promise<void> {
    this.state = {
      currentState: null,
      stateIndex: -1,
      stateCount: this.config?.states.length ?? 0,
    };
    this.ttsDone = false;
    this.interactionDone = false;
  }

  async destroy(): Promise<void> {
    await this.reset();
    this.config = null;
    this.session = null;
  }

  onEvent(event: SimEvent): void {
    if (event.type === 'TTS_SENTENCE_END') {
      this.ttsDone = true;
    } else if (event.type === 'SLIDER_CHANGE' || event.type === 'ANIMATION_COMPLETE') {
      this.interactionDone = true;
    }
  }
}
