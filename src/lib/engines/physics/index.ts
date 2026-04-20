/**
 * Engine 1: Physics Engine — wrapper around existing src/lib/physicsEngine/
 *
 * EXISTS: src/lib/physicsEngine/ (computePhysics, 6 force concepts)
 * This stub re-exports the existing engine under the Engine<Config, State> interface.
 * Do NOT rebuild — the physics engine is already complete.
 */

import type { Engine, SimSession, SimEvent } from '../types';
import type { PhysicsResult } from '@/lib/physicsEngine/types';

export interface PhysicsEngineConfig {
  conceptId: string;
  initialVariables?: Record<string, number>;
}

export interface PhysicsEngineState {
  conceptId: string;
  variables: Record<string, number>;
  result: PhysicsResult | null;
}

export class PhysicsEngineAdapter implements Engine<PhysicsEngineConfig, PhysicsEngineState> {
  readonly id = 'physics';
  readonly dependencies: string[] = [];

  private state: PhysicsEngineState | null = null;
  private session: SimSession | null = null;

  async init(config: PhysicsEngineConfig, session: SimSession): Promise<PhysicsEngineState> {
    this.session = session;
    this.state = {
      conceptId: config.conceptId,
      variables: config.initialVariables ?? {},
      result: null,
    };
    // TODO: call computePhysics() from src/lib/physicsEngine/
    return this.state;
  }

  async reset(): Promise<void> {
    this.state = null;
  }

  async destroy(): Promise<void> {
    this.state = null;
    this.session = null;
  }

  onEvent(event: SimEvent): void {
    if (event.type === 'SLIDER_CHANGE' && this.state) {
      this.state.variables[event.variable] = event.value;
      // TODO: recompute physics and emit result
    }
  }
}
