import { describe, it, expect, beforeEach } from 'vitest';
import {
  MisconceptionDetectionEngine,
  levenshtein,
  normalizedLevenshtein,
  type MisconceptionConfig,
} from '../index';
import type { SimEvent, SimSession } from '../../types';

function makeSession(): SimSession & { emitted: SimEvent[] } {
  const emitted: SimEvent[] = [];
  return {
    sessionId: 'test',
    emit: (e: SimEvent) => { emitted.push(e); },
    on: () => {},
    off: () => {},
    getEngine: <T,>() => null as T | null,
    emitted,
  } as SimSession & { emitted: SimEvent[] };
}

const CONFIG: MisconceptionConfig = {
  branches: [
    {
      branchId: 'forces_cancel',
      triggerPhrases: [
        'N and mg cancel out',
        'forces balance',
      ],
      misconception: 'Normal reaction and weight cancel each other',
    },
    {
      branchId: 'current_decreases_in_series',
      triggerPhrases: ['current decreases'],
      misconception: 'Current drops across resistors',
    },
  ],
};

describe('MisconceptionDetectionEngine', () => {
  let engine: MisconceptionDetectionEngine;
  let session: SimSession & { emitted: SimEvent[] };

  beforeEach(async () => {
    engine = new MisconceptionDetectionEngine();
    session = makeSession();
    await engine.init(CONFIG, session);
  });

  it('1. Exact substring match → matched=true, matchType=exact, confidence=1', () => {
    const result = engine.detect('N and mg cancel out');
    expect(result.matched).toBe(true);
    expect(result.branchId).toBe('forces_cancel');
    expect(result.matchType).toBe('exact');
    expect(result.confidence).toBe(1);
  });

  it('2. Exact match case-insensitive', () => {
    const result = engine.detect('CURRENT DECREASES when it flows through');
    expect(result.matched).toBe(true);
    expect(result.branchId).toBe('current_decreases_in_series');
    expect(result.matchType).toBe('exact');
  });

  it('3. No match → matched=false, matchType=none', () => {
    const result = engine.detect('the sun is bright today');
    expect(result.matched).toBe(false);
    expect(result.branchId).toBeNull();
    expect(result.matchType).toBe('none');
  });

  it('4. Fuzzy match with small typo (< 0.3 normalized) → matched=true, matchType=fuzzy', () => {
    // "current decreaes" — one transposition from "current decreases"
    const result = engine.detect('current decreaes');
    expect(result.matched).toBe(true);
    expect(result.matchType).toBe('fuzzy');
    expect(result.branchId).toBe('current_decreases_in_series');
  });

  it('5. Fuzzy confidence = 1 − normalizedDistance', () => {
    const result = engine.detect('current decreaes'); // 1 edit in 17 chars
    expect(result.matchType).toBe('fuzzy');
    const expectedDist = normalizedLevenshtein('current decreaes', 'current decreases');
    expect(result.confidence).toBeCloseTo(1 - expectedDist, 5);
  });

  it('6. Too-distant text → matched=false', () => {
    const result = engine.detect('completely unrelated gibberish 12345');
    expect(result.matched).toBe(false);
    expect(result.matchType).toBe('none');
  });

  it('7. Multiple branches, multiple fuzzy matches → best (lowest distance) wins', async () => {
    const twoBranchConfig: MisconceptionConfig = {
      branches: [
        { branchId: 'far_branch',   triggerPhrases: ['cuurrnt deqrases'] },   // farther from "current decreases"
        { branchId: 'close_branch', triggerPhrases: ['current decreasse'] },   // closer
      ],
    };
    const eng = new MisconceptionDetectionEngine();
    await eng.init(twoBranchConfig, session);
    const result = eng.detect('current decreases');
    expect(result.matched).toBe(true);
    expect(result.branchId).toBe('close_branch');
  });

  it('8. Empty input → matched=false', () => {
    const result = engine.detect('');
    expect(result.matched).toBe(false);
    expect(result.matchType).toBe('none');
    const ws = engine.detect('   ');
    expect(ws.matched).toBe(false);
  });

  it('9. levenshtein("kitten", "sitting") === 3', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('', '')).toBe(0);
    expect(levenshtein('abc', '')).toBe(3);
    expect(levenshtein('abc', 'abc')).toBe(0);
  });

  it('10. Multiple trigger phrases per branch — any phrase match hits the branch', () => {
    const first = engine.detect('N and mg cancel out');
    expect(first.branchId).toBe('forces_cancel');
    const second = engine.detect('the two forces balance here');
    expect(second.branchId).toBe('forces_cancel');
    expect(second.matchType).toBe('exact');
  });
});
