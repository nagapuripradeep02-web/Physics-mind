/**
 * Engine 1a: Physics Validation Engine — NOT BUILT
 *
 * After Physics Engine computes → validate outputs are physical.
 * Checks: N cannot be negative, arrows fit canvas, no absurd values.
 * Action: clamp to physical limits + log warning (never crash).
 */

import type { Engine, SimSession, SimEvent } from '../types';

export interface PhysicsValidationConfig {
  maxForceMagnitude: number;   // default 1000 N
  maxVelocity: number;         // default 1000 m/s
}

export interface ValidationResult {
  valid: boolean;
  clamped: string[];
  warnings: string[];
}

export interface PhysicsValidationState {
  lastResult: ValidationResult | null;
}

export class PhysicsValidationEngine implements Engine<PhysicsValidationConfig, PhysicsValidationState> {
  readonly id = 'physics-validation';
  readonly dependencies = ['physics'];

  private state: PhysicsValidationState | null = null;
  private config: PhysicsValidationConfig | null = null;

  async init(config: PhysicsValidationConfig, _session: SimSession): Promise<PhysicsValidationState> {
    this.config = config;
    this.state = { lastResult: null };
    return this.state;
  }

  validate(values: Record<string, number>): ValidationResult {
    const clamped: string[] = [];
    const warnings: string[] = [];
    const maxForce = this.config?.maxForceMagnitude ?? 1000;

    for (const [key, val] of Object.entries(values)) {
      if (key.startsWith('N') && val < 0) {
        warnings.push(`${key} is negative (${val}), clamping to 0`);
        values[key] = 0;
        clamped.push(key);
      }
      if (Math.abs(val) > maxForce) {
        warnings.push(`${key} exceeds max (${val}), clamping to ${maxForce}`);
        values[key] = Math.sign(val) * maxForce;
        clamped.push(key);
      }
    }

    const result: ValidationResult = {
      valid: clamped.length === 0,
      clamped,
      warnings,
    };

    if (this.state) {
      this.state.lastResult = result;
    }

    return result;
  }

  async reset(): Promise<void> {
    this.state = null;
  }

  async destroy(): Promise<void> {
    this.state = null;
    this.config = null;
  }

  onEvent(_event: SimEvent): void {
    // Validate after physics recomputation
  }
}
