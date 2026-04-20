import { describe, it, expect } from 'vitest';
import { SimSession } from '../sim-session';
import { StateMachineEngine } from '../state-machine';
import { TeacherScriptEngine, type TtsSentence } from '../teacher-script';
import type { SimEvent } from '../types';

const S1: TtsSentence = { id: 's1', text_en: 'First.' };
const S2: TtsSentence = { id: 's2', text_en: 'Second.' };
const S3: TtsSentence = { id: 's3', text_en: 'Hook state line.' };

async function makeBootedSession() {
  const session = new SimSession('integration-test');

  session.register({
    id: 'state-machine',
    tier: 'E',
    dependencies: [],
    factory: () => new StateMachineEngine(),
  });

  session.register({
    id: 'teacher-script',
    tier: 'D',
    dependencies: ['state-machine'],
    factory: () => new TeacherScriptEngine(),
  });

  await session.boot({
    'state-machine': {
      states: ['STATE_1', 'STATE_2'],
      advanceModes: { STATE_1: 'auto_after_tts', STATE_2: 'manual_click' },
    },
    'teacher-script': {
      states: {
        STATE_1: { advanceMode: 'auto_after_tts', sentences: [S1, S2] },
        STATE_2: { advanceMode: 'manual_click', sentences: [S3] },
      },
    },
  });

  const stateMachine = session.getEngine<StateMachineEngine>('state-machine')!;
  const teacherScript = session.getEngine<TeacherScriptEngine>('teacher-script')!;

  // Capture all events emitted after boot for assertions
  const observed: SimEvent[] = [];
  session.on('*' as SimEvent['type'], (e) => { observed.push(e); });

  return { session, stateMachine, teacherScript, observed };
}

describe('SimSession ↔ StateMachine ↔ TeacherScript integration', () => {
  it('1. STATE_ENTER from state machine auto-loads teacher script sentences', async () => {
    const { stateMachine, teacherScript } = await makeBootedSession();

    // State machine booted first and already entered STATE_1 before
    // teacher-script was wired. Re-enter to observe full chain.
    stateMachine.enterState('STATE_1');

    expect(stateMachine.getCurrentState()).toBe('STATE_1');
    expect(teacherScript.getCurrentSentence()).toEqual(S1);
    expect(teacherScript.getAdvanceMode()).toBe('auto_after_tts');
  });

  it('2. next() transitions state and swaps teacher script sentences', async () => {
    const { stateMachine, teacherScript } = await makeBootedSession();

    stateMachine.next(); // → STATE_2 (both engines wired)

    expect(stateMachine.getCurrentState()).toBe('STATE_2');
    expect(teacherScript.getCurrentSentence()).toEqual(S3);
    expect(teacherScript.getAdvanceMode()).toBe('manual_click');
  });

  it('3. auto_after_tts chain: external TTS_SENTENCE_END advances script and sets canAdvance', async () => {
    const { session, stateMachine, teacherScript } = await makeBootedSession();

    stateMachine.enterState('STATE_1'); // re-enter so teacher-script loads
    expect(teacherScript.getCurrentSentence()).toEqual(S1);
    expect(stateMachine.canAdvance()).toBe(false);

    // External TTS engine signals sentence 1 finished
    session.emit({ type: 'TTS_SENTENCE_END', sentence_id: 's1' });
    expect(teacherScript.getCurrentSentence()).toEqual(S2);

    // External TTS engine signals sentence 2 finished → teacher-script
    // advances past end and self-emits TTS_SENTENCE_END for s2
    session.emit({ type: 'TTS_SENTENCE_END', sentence_id: 's2' });
    expect(teacherScript.getCurrentSentence()).toBeNull();
    expect(stateMachine.canAdvance()).toBe(true);
  });

  it('4. LESSON_COMPLETE fires when next() called past last state', async () => {
    const { session, stateMachine, observed } = await makeBootedSession();

    stateMachine.next(); // → STATE_2
    observed.length = 0;
    stateMachine.next(); // past last → LESSON_COMPLETE

    expect(observed.find(e => e.type === 'LESSON_COMPLETE')).toBeDefined();
    // Should NOT emit a STATE_ENTER past the last state
    expect(observed.find(e => e.type === 'STATE_ENTER')).toBeUndefined();
  });

  it('5. STATE_EXIT precedes STATE_ENTER on transition (event ordering)', async () => {
    const { stateMachine, observed } = await makeBootedSession();

    observed.length = 0;
    stateMachine.next(); // STATE_1 → STATE_2

    const exitIdx = observed.findIndex(e => e.type === 'STATE_EXIT');
    const enterIdx = observed.findIndex(e => e.type === 'STATE_ENTER' && e.state === 'STATE_2');
    expect(exitIdx).toBeGreaterThanOrEqual(0);
    expect(enterIdx).toBeGreaterThan(exitIdx);
  });

  it('6. session.destroy() cleans up engines; re-boot yields fresh state', async () => {
    const { session } = await makeBootedSession();
    await session.destroy();

    const fresh = new SimSession('integration-test-2');
    fresh.register({
      id: 'state-machine',
      tier: 'E',
      dependencies: [],
      factory: () => new StateMachineEngine(),
    });
    fresh.register({
      id: 'teacher-script',
      tier: 'D',
      dependencies: ['state-machine'],
      factory: () => new TeacherScriptEngine(),
    });

    await fresh.boot({
      'state-machine': { states: ['A', 'B'] },
      'teacher-script': { states: { A: { advanceMode: 'manual_click', sentences: [S1] } } },
    });

    const sm = fresh.getEngine<StateMachineEngine>('state-machine')!;
    expect(sm.getCurrentState()).toBe('A');
  });
});
