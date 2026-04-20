/**
 * Engine registry — register, lookup, and topological sort by dependencies.
 *
 * Topological sort ensures engines boot in dependency order:
 *   Tier A (no deps) boots first → Tier F (many deps) boots last.
 *   Circular dependencies throw at boot time (never silently ignored).
 */

import type { Engine, EngineRegistration, EngineTier } from '../types';

export class EngineRegistry {
  private registrations = new Map<string, EngineRegistration>();
  private instances = new Map<string, Engine>();

  register(reg: EngineRegistration): void {
    if (this.registrations.has(reg.id)) {
      throw new Error(`Engine "${reg.id}" already registered`);
    }
    this.registrations.set(reg.id, reg);
  }

  getRegistration(id: string): EngineRegistration | undefined {
    return this.registrations.get(id);
  }

  setInstance(id: string, engine: Engine): void {
    this.instances.set(id, engine);
  }

  getInstance<T>(id: string): T | null {
    return (this.instances.get(id) as T) ?? null;
  }

  getAllInstances(): Engine[] {
    return Array.from(this.instances.values());
  }

  getAllRegistrations(): EngineRegistration[] {
    return Array.from(this.registrations.values());
  }

  getTier(id: string): EngineTier | undefined {
    return this.registrations.get(id)?.tier;
  }

  /**
   * Topological sort: returns engine IDs in dependency-safe boot order.
   * Throws on circular dependency.
   */
  topologicalSort(): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (id: string): void => {
      if (visited.has(id)) return;
      if (visiting.has(id)) {
        throw new Error(`Circular dependency detected involving engine "${id}"`);
      }

      visiting.add(id);

      const reg = this.registrations.get(id);
      if (reg) {
        for (const dep of reg.dependencies) {
          if (this.registrations.has(dep)) {
            visit(dep);
          }
          // Skip unregistered deps silently — engine may be optional
        }
      }

      visiting.delete(id);
      visited.add(id);
      sorted.push(id);
    };

    for (const id of this.registrations.keys()) {
      visit(id);
    }

    return sorted;
  }

  clear(): void {
    this.registrations.clear();
    this.instances.clear();
  }
}
