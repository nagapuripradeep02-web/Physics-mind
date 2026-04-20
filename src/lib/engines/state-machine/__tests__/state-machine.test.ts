import { describe, it, expect, beforeEach } from 'vitest';
import { StateMachineEngine } from '../index';
import type { SimEvent, SimSession } from '../../types';

function makeSession(): SimSession & { emitted: SimEvent[] } {
  const emitted: SimEvent[] = [];
  return {
    sessionId: 'test-session',
    emit: (event: SimEvent) => { emitted.push(event); },
    on: () => {},
    off: () => {},
    getEngine: <T,>() => null as T | null,
    emitted,
  } as SimSession & { emitted: SimEvent[] };
}

const STATES = ['STATE_1', 'STATE_2', 'STATE_3'];

describe('StateMachineEngine', () => {
  let engine: StateMachineEngine;
  let session: SimSession & { emitted: SimEvent[] };

  beforeEach(async () => {
    engine = new StateMachineEngine();
    session = makeSession();
    await engine.init({ states: STATES }, session);
    session.emitted.length = 0; // clear init emissions
  });

  it('1. enterState emits STATE_EXIT then STATE_ENTER', () => {
    engine.enterState('STATE_2');
    expect(session.emitted).toEqual([
      { type: 'STATE_EXIT', state: 'STATE_1' },
      { type: 'STATE_ENTER', state: 'STATE_2' },
    ]);
  });

  it('2. getCurrentState returns correct state after enterState', () => {
    engine.enterState('STATE_2');
    expect(engine.getCurrentState()).toBe('STATE_2');
  });

  it('3. next() advances to next state', () => {
    engine.next();
    expect(engine.getCurrentState()).toBe('STATE_2');
    engine.next();
    expect(engine.getCurrentState()).toBe('STATE_3');
  });

  it('4. next() at last state → emits LESSON_COMPLETE', () => {
    engine.next(); // → STATE_2
    engine.next(); // → STATE_3 (last)
    session.emitted.length = 0;
    engine.next(); // past last
    const lessonComplete = session.emitted.find(e => e.type === 'LESSON_COMPLETE');
    expect(lessonComplete).toBeDefined();
    expect(engine.getCurrentState()).toBe('STATE_3');
  });

  it('5. previous() goes back', () => {
    engine.next(); // → STATE_2
    engine.next(); // → STATE_3
    engine.previous(); // → STATE_2
    expect(engine.getCurrentState()).toBe('STATE_2');
  });

  it('6. previous() at first state → no-op (no crash)', () => {
    expect(engine.getCurrentState()).toBe('STATE_1');
    session.emitted.length = 0;
    expect(() => engine.previous()).not.toThrow();
    expect(engine.getCurrentState()).toBe('STATE_1');
    expect(session.emitted).toEqual([]);
  });

  it('7. getStateIds returns all states in order', () => {
    expect(engine.getStateIds()).toEqual(['STATE_1', 'STATE_2', 'STATE_3']);
  });

  it('8. canAdvance with manual_click → always true', async () => {
    const eng = new StateMachineEngine();
    const sess = makeSession();
    await eng.init({
      states: STATES,
      advanceModes: { STATE_1: 'manual_click', STATE_2: 'manual_click', STATE_3: 'manual_click' },
    }, sess);
    expect(eng.canAdvance()).toBe(true);
    eng.next();
    expect(eng.canAdvance()).toBe(true);
  });

  it('9. canAdvance with auto_after_tts → false until TTS_SENTENCE_END received', async () => {
    const eng = new StateMachineEngine();
    const sess = makeSession();
    await eng.init({
      states: STATES,
      advanceModes: { STATE_1: 'auto_after_tts' },
    }, sess);
    expect(eng.canAdvance()).toBe(false);
    eng.onEvent({ type: 'TTS_SENTENCE_END', sentence_id: 's1' });
    expect(eng.canAdvance()).toBe(true);
  });

  it('10. STATE_ENTER event payload includes stateId', () => {
    engine.enterState('STATE_3');
    const enterEvent = session.emitted.find(e => e.type === 'STATE_ENTER');
    expect(enterEvent).toBeDefined();
    expect(enterEvent).toEqual({ type: 'STATE_ENTER', state: 'STATE_3' });
  });
});
