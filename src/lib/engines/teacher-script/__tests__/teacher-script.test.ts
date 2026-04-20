import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeacherScriptEngine, type TtsSentence } from '../index';
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

const S1: TtsSentence = { id: 's1', text_en: 'First sentence.' };
const S2: TtsSentence = { id: 's2', text_en: 'Second sentence.' };
const S3: TtsSentence = { id: 's3', text_en: 'Third sentence.' };

describe('TeacherScriptEngine', () => {
  let engine: TeacherScriptEngine;
  let session: SimSession & { emitted: SimEvent[] };

  beforeEach(async () => {
    engine = new TeacherScriptEngine();
    session = makeSession();
    await engine.init({}, session);
  });

  it('1. loadState sets sentences correctly', () => {
    engine.loadState('STATE_1', [S1, S2, S3], 'manual_click');
    expect(engine.getCurrentSentence()).toEqual(S1);
    expect(engine.getAdvanceMode()).toBe('manual_click');
  });

  it('2. getCurrentSentence returns first sentence after loadState', () => {
    engine.loadState('STATE_1', [S1, S2]);
    expect(engine.getCurrentSentence()).toEqual(S1);
  });

  it('3. advance() moves to sentence 2', () => {
    engine.loadState('STATE_1', [S1, S2]);
    const next = engine.advance();
    expect(next).toEqual(S2);
    expect(engine.getCurrentSentence()).toEqual(S2);
  });

  it('4. advance() at last sentence → emits TTS_SENTENCE_END', () => {
    engine.loadState('STATE_1', [S1, S2]);
    engine.advance(); // now at s2 (last)
    const result = engine.advance(); // past last
    expect(result).toBeNull();
    const ttsEnd = session.emitted.find(e => e.type === 'TTS_SENTENCE_END');
    expect(ttsEnd).toBeDefined();
    expect(ttsEnd).toEqual({ type: 'TTS_SENTENCE_END', sentence_id: 's2' });
  });

  it('5. advance() past last sentence → returns null', () => {
    engine.loadState('STATE_1', [S1]);
    engine.advance(); // past end
    const again = engine.advance();
    expect(again).toBeNull();
  });

  it('6. onEvent STATE_ENTER → resets to new state sentences', async () => {
    const cfgEngine = new TeacherScriptEngine();
    await cfgEngine.init({
      states: {
        STATE_1: { advanceMode: 'manual_click', sentences: [S1] },
        STATE_2: { advanceMode: 'auto_after_tts', sentences: [S2, S3] },
      },
    }, session);
    cfgEngine.onEvent({ type: 'STATE_ENTER', state: 'STATE_1' });
    expect(cfgEngine.getCurrentSentence()).toEqual(S1);
    cfgEngine.onEvent({ type: 'STATE_ENTER', state: 'STATE_2' });
    expect(cfgEngine.getCurrentSentence()).toEqual(S2);
    expect(cfgEngine.getAdvanceMode()).toBe('auto_after_tts');
  });

  it('7. auto_after_tts mode: TTS_SENTENCE_END → auto-advance', () => {
    engine.loadState('STATE_1', [S1, S2], 'auto_after_tts');
    expect(engine.getCurrentSentence()).toEqual(S1);
    engine.onEvent({ type: 'TTS_SENTENCE_END', sentence_id: 's1' });
    expect(engine.getCurrentSentence()).toEqual(S2);
  });

  it('8. manual_click mode: TTS_SENTENCE_END → does NOT auto-advance', () => {
    engine.loadState('STATE_1', [S1, S2], 'manual_click');
    engine.onEvent({ type: 'TTS_SENTENCE_END', sentence_id: 's1' });
    expect(engine.getCurrentSentence()).toEqual(S1);
  });

  it('9. Empty sentences array → getCurrentSentence returns null', () => {
    engine.loadState('STATE_1', [], 'manual_click');
    expect(engine.getCurrentSentence()).toBeNull();
    expect(engine.advance()).toBeNull();
  });

  it('10. Sentence IDs are preserved correctly', () => {
    engine.loadState('STATE_1', [S1, S2, S3]);
    expect(engine.getCurrentSentence()?.id).toBe('s1');
    engine.advance();
    expect(engine.getCurrentSentence()?.id).toBe('s2');
    engine.advance();
    expect(engine.getCurrentSentence()?.id).toBe('s3');
  });
});
