/**
 * Engine lifecycle — boot, reset, destroy in dependency-sorted order.
 *
 * bootAll():    topological sort → init each engine → wire onEvent to bus
 * resetAll():   reverse order → reset each engine
 * destroyAll(): reverse order → destroy each engine → clear bus + registry
 */

import type { SimSession, SimEvent } from '../types';
import { EngineRegistry } from './engine-registry';
import { EventBus } from './event-bus';
import { FailurePolicy } from './failure-policy';

export class Lifecycle {
  constructor(
    private registry: EngineRegistry,
    private bus: EventBus,
    private failurePolicy: FailurePolicy,
    private session: SimSession,
  ) {}

  async bootAll(configs: Record<string, unknown>): Promise<{ booted: string[]; failed: string[] }> {
    const order = this.registry.topologicalSort();
    const booted: string[] = [];
    const failed: string[] = [];

    for (const engineId of order) {
      const reg = this.registry.getRegistration(engineId);
      if (!reg) continue;

      try {
        const engine = reg.factory();
        const config = configs[engineId] ?? {};
        await engine.init(config, this.session);

        this.registry.setInstance(engineId, engine);

        // Wire onEvent to bus
        if (engine.onEvent) {
          const handler = (event: SimEvent) => engine.onEvent!(event);
          this.bus.on('*' as SimEvent['type'], handler);
        }

        booted.push(engineId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        const record = this.failurePolicy.handleFailure(engineId, reg.tier, error);

        if (record.action === 'fatal') {
          failed.push(engineId);
          // Abort: destroy already-booted engines in reverse
          for (const id of booted.reverse()) {
            const instance = this.registry.getInstance(id);
            if (instance && typeof (instance as { destroy?: () => Promise<void> }).destroy === 'function') {
              try {
                await (instance as { destroy: () => Promise<void> }).destroy();
              } catch {
                // Best-effort cleanup during fatal abort
              }
            }
          }
          throw new Error(`Fatal engine failure in "${engineId}": ${error.message}`);
        }

        // Non-fatal: log and continue
        failed.push(engineId);
      }
    }

    return { booted, failed };
  }

  async resetAll(): Promise<void> {
    const instances = this.registry.getAllInstances();
    // Reset in reverse boot order
    for (const engine of instances.reverse()) {
      try {
        await engine.reset();
      } catch {
        // Best-effort reset
      }
    }
  }

  async destroyAll(): Promise<void> {
    const instances = this.registry.getAllInstances();
    // Destroy in reverse boot order
    for (const engine of instances.reverse()) {
      try {
        await engine.destroy();
      } catch {
        // Best-effort destroy
      }
    }
    this.bus.clear();
    this.registry.clear();
    this.failurePolicy.clear();
  }
}
