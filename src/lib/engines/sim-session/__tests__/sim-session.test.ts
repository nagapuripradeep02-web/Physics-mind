import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '../event-bus';
import { EngineRegistry } from '../engine-registry';
import { FailurePolicy } from '../failure-policy';
import { SimSession } from '../index';
import type { SimEvent, Engine, EngineRegistration } from '../../types';

// ── Helper: minimal engine factory ──────────────────────────────────

function makeEngine(id: string, deps: string[] = []): EngineRegistration {
  return {
    id,
    tier: 'C',
    dependencies: deps,
    factory: () => ({
      id,
      dependencies: deps,
      init: vi.fn().mockResolvedValue({}),
      reset: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn().mockResolvedValue(undefined),
    }),
  };
}

// ── EventBus ────────────────────────────────────────────────────────

describe('EventBus', () => {
  it('1. emit delivers to typed handler', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on('STATE_ENTER', handler);
    bus.emit({ type: 'STATE_ENTER', state: 'STATE_1' });
    expect(handler).toHaveBeenCalledWith({ type: 'STATE_ENTER', state: 'STATE_1' });
  });

  it('2. off removes handler', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on('STATE_ENTER', handler);
    bus.off('STATE_ENTER', handler);
    bus.emit({ type: 'STATE_ENTER', state: 'STATE_1' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('3. wildcard handler receives all events', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on('*', handler);
    bus.emit({ type: 'STATE_ENTER', state: 'STATE_1' });
    bus.emit({ type: 'SLIDER_CHANGE', variable: 'm', value: 5 });
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('4. handler error does not break other handlers', () => {
    const bus = new EventBus();
    const badHandler = vi.fn(() => { throw new Error('boom'); });
    const goodHandler = vi.fn();
    bus.on('STATE_ENTER', badHandler);
    bus.on('STATE_ENTER', goodHandler);
    bus.emit({ type: 'STATE_ENTER', state: 'STATE_1' });
    expect(goodHandler).toHaveBeenCalled();
  });

  it('5. listenerCount reports correctly', () => {
    const bus = new EventBus();
    bus.on('STATE_ENTER', () => {});
    bus.on('STATE_ENTER', () => {});
    bus.on('SLIDER_CHANGE', () => {});
    bus.on('*', () => {});
    expect(bus.listenerCount('STATE_ENTER')).toBe(3); // 2 typed + 1 wildcard
    expect(bus.listenerCount()).toBe(4); // 2 + 1 + 1
  });

  it('6. clear removes all handlers', () => {
    const bus = new EventBus();
    bus.on('STATE_ENTER', () => {});
    bus.on('*', () => {});
    bus.clear();
    expect(bus.listenerCount()).toBe(0);
  });
});

// ── EngineRegistry ──────────────────────────────────────────────────

describe('EngineRegistry', () => {
  it('7. register and lookup by id', () => {
    const reg = new EngineRegistry();
    const engine = makeEngine('physics');
    reg.register(engine);
    expect(reg.getRegistration('physics')).toBe(engine);
  });

  it('8. duplicate registration throws', () => {
    const reg = new EngineRegistry();
    reg.register(makeEngine('physics'));
    expect(() => reg.register(makeEngine('physics'))).toThrow('already registered');
  });

  it('9. topological sort respects dependencies', () => {
    const reg = new EngineRegistry();
    reg.register({ ...makeEngine('scale', ['physics', 'zone-layout']), tier: 'B' as const });
    reg.register({ ...makeEngine('physics'), tier: 'A' as const });
    reg.register({ ...makeEngine('zone-layout'), tier: 'B' as const });

    const order = reg.topologicalSort();
    const physIdx = order.indexOf('physics');
    const zoneIdx = order.indexOf('zone-layout');
    const scaleIdx = order.indexOf('scale');

    expect(physIdx).toBeLessThan(scaleIdx);
    expect(zoneIdx).toBeLessThan(scaleIdx);
  });

  it('10. circular dependency throws', () => {
    const reg = new EngineRegistry();
    reg.register(makeEngine('a', ['b']));
    reg.register(makeEngine('b', ['a']));
    expect(() => reg.topologicalSort()).toThrow('Circular dependency');
  });
});

// ── FailurePolicy ───────────────────────────────────────────────────

describe('FailurePolicy', () => {
  it('11. Tier A/B → fatal', () => {
    const fp = new FailurePolicy();
    expect(fp.classify('A')).toBe('fatal');
    expect(fp.classify('B')).toBe('fatal');
    expect(fp.isFatal('A')).toBe(true);
  });

  it('12. Tier C → degraded, D → silent_fallback, E → skip, F → silent_log', () => {
    const fp = new FailurePolicy();
    expect(fp.classify('C')).toBe('degraded');
    expect(fp.classify('D')).toBe('silent_fallback');
    expect(fp.classify('E')).toBe('skip_feature');
    expect(fp.classify('F')).toBe('silent_log');
  });

  it('13. handleFailure records and returns action', () => {
    const fp = new FailurePolicy();
    const record = fp.handleFailure('physics', 'A', new Error('oops'));
    expect(record.action).toBe('fatal');
    expect(record.engineId).toBe('physics');
    expect(fp.hasFatalFailure()).toBe(true);
    expect(fp.getFailures()).toHaveLength(1);
  });
});

// ── SimSession (integration) ────────────────────────────────────────

describe('SimSession', () => {
  it('14. boot initializes engines in dependency order', async () => {
    const session = new SimSession('test-1');
    const initOrder: string[] = [];

    session.register({
      id: 'scale',
      tier: 'B',
      dependencies: ['physics'],
      factory: () => ({
        id: 'scale',
        dependencies: ['physics'],
        init: vi.fn(async () => { initOrder.push('scale'); return {}; }),
        reset: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined),
      }),
    });
    session.register({
      id: 'physics',
      tier: 'A',
      dependencies: [],
      factory: () => ({
        id: 'physics',
        dependencies: [],
        init: vi.fn(async () => { initOrder.push('physics'); return {}; }),
        reset: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined),
      }),
    });

    const result = await session.boot();
    expect(result.booted).toEqual(['physics', 'scale']);
    expect(initOrder).toEqual(['physics', 'scale']);
  });

  it('15. Tier A failure aborts boot with error', async () => {
    const session = new SimSession('test-2');
    session.register({
      id: 'physics',
      tier: 'A',
      dependencies: [],
      factory: () => ({
        id: 'physics',
        dependencies: [],
        init: vi.fn().mockRejectedValue(new Error('physics init failed')),
        reset: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined),
      }),
    });

    await expect(session.boot()).rejects.toThrow('Fatal engine failure in "physics"');
  });

  it('16. Tier C failure continues boot (non-fatal)', async () => {
    const session = new SimSession('test-3');
    session.register({
      id: 'physics',
      tier: 'A',
      dependencies: [],
      factory: () => ({
        id: 'physics',
        dependencies: [],
        init: vi.fn().mockResolvedValue({}),
        reset: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined),
      }),
    });
    session.register({
      id: 'choreography',
      tier: 'C',
      dependencies: [],
      factory: () => ({
        id: 'choreography',
        dependencies: [],
        init: vi.fn().mockRejectedValue(new Error('choreo failed')),
        reset: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined),
      }),
    });

    const result = await session.boot();
    expect(result.booted).toContain('physics');
    expect(result.failed).toContain('choreography');
    expect(session.getFailures()).toHaveLength(1);
    expect(session.hasFatalFailure()).toBe(false);
  });

  it('17. getEngine returns booted engine', async () => {
    const session = new SimSession('test-4');
    session.register({
      id: 'physics',
      tier: 'A',
      dependencies: [],
      factory: () => ({
        id: 'physics',
        dependencies: [],
        init: vi.fn().mockResolvedValue({}),
        reset: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined),
      }),
    });

    await session.boot();
    const engine = session.getEngine<Engine>('physics');
    expect(engine).not.toBeNull();
    expect(engine!.id).toBe('physics');
  });

  it('18. emit routes events through the bus', async () => {
    const session = new SimSession('test-5');
    const handler = vi.fn();
    session.on('SLIDER_CHANGE', handler);
    session.emit({ type: 'SLIDER_CHANGE', variable: 'theta', value: 45 });
    expect(handler).toHaveBeenCalledWith({ type: 'SLIDER_CHANGE', variable: 'theta', value: 45 });
  });

  it('19. double boot throws', async () => {
    const session = new SimSession('test-6');
    await session.boot();
    await expect(session.boot()).rejects.toThrow('already booted');
  });

  it('20. destroy then re-boot works', async () => {
    const session = new SimSession('test-7');
    session.register({
      id: 'physics',
      tier: 'A',
      dependencies: [],
      factory: () => ({
        id: 'physics',
        dependencies: [],
        init: vi.fn().mockResolvedValue({}),
        reset: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined),
      }),
    });

    await session.boot();
    await session.destroy();
    expect(session.isBooted()).toBe(false);
    // Re-register after destroy (registry was cleared)
    session.register({
      id: 'physics',
      tier: 'A',
      dependencies: [],
      factory: () => ({
        id: 'physics',
        dependencies: [],
        init: vi.fn().mockResolvedValue({}),
        reset: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined),
      }),
    });
    const result = await session.boot();
    expect(result.booted).toContain('physics');
  });
});
