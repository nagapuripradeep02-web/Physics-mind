/**
 * Engine 0: SimSession Orchestrator
 *
 * Composes: EventBus + EngineRegistry + FailurePolicy + Lifecycle
 * One instance per student session.
 *
 * Boot order (dependency-strict):
 *   Tier A: Physics Engine
 *   Tier B: Zone Layout, Scale, Anchor Resolver
 *   Tier C: PCPL Renderer, Choreography, Transition, Focal
 *   Tier D: Teacher Script, TTS, Interaction, Panel B
 *   Tier E: State Machine, Misconception, Assessment
 *   Tier F: Telemetry, Progress
 */

import type { SimSession as ISimSession, SimEvent, EngineRegistration } from '../types';
import { EventBus, type EventHandler } from './event-bus';
import { EngineRegistry } from './engine-registry';
import { FailurePolicy, type FailureRecord } from './failure-policy';
import { Lifecycle } from './lifecycle';

export class SimSession implements ISimSession {
  readonly sessionId: string;

  private bus: EventBus;
  private registry: EngineRegistry;
  private failurePolicy: FailurePolicy;
  private lifecycle: Lifecycle;
  private booted = false;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.bus = new EventBus();
    this.registry = new EngineRegistry();
    this.failurePolicy = new FailurePolicy();
    this.lifecycle = new Lifecycle(this.registry, this.bus, this.failurePolicy, this);
  }

  // ── Registration ─────────────────────────────────────────────

  register(reg: EngineRegistration): void {
    this.registry.register(reg);
  }

  // ── Event bus (delegated) ────────────────────────────────────

  emit(event: SimEvent): void {
    this.bus.emit(event);
  }

  on(eventType: SimEvent['type'], handler: EventHandler): void {
    this.bus.on(eventType, handler);
  }

  off(eventType: SimEvent['type'], handler: EventHandler): void {
    this.bus.off(eventType, handler);
  }

  // ── Engine lookup ────────────────────────────────────────────

  getEngine<T>(engineId: string): T | null {
    return this.registry.getInstance<T>(engineId);
  }

  // ── Lifecycle ────────────────────────────────────────────────

  /**
   * Boot all registered engines in dependency order.
   * Throws on fatal (Tier A/B) failure.
   */
  async boot(configs: Record<string, unknown> = {}): Promise<{ booted: string[]; failed: string[] }> {
    if (this.booted) {
      throw new Error('SimSession already booted — call reset() first');
    }
    const result = await this.lifecycle.bootAll(configs);
    this.booted = true;
    return result;
  }

  async reset(): Promise<void> {
    await this.lifecycle.resetAll();
    this.booted = false;
  }

  async destroy(): Promise<void> {
    await this.lifecycle.destroyAll();
    this.booted = false;
  }

  // ── Diagnostics ──────────────────────────────────────────────

  isBooted(): boolean {
    return this.booted;
  }

  getFailures(): readonly FailureRecord[] {
    return this.failurePolicy.getFailures();
  }

  hasFatalFailure(): boolean {
    return this.failurePolicy.hasFatalFailure();
  }
}

// Re-export sub-modules for direct access if needed
export { EventBus } from './event-bus';
export { EngineRegistry } from './engine-registry';
export { FailurePolicy, type FailureAction, type FailureRecord } from './failure-policy';
export { Lifecycle } from './lifecycle';
