import { describe, it, expect, beforeEach } from 'vitest';
import { FocalAttentionEngine } from '../index';
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

describe('FocalAttentionEngine', () => {
  let engine: FocalAttentionEngine;
  let session: SimSession & { emitted: SimEvent[] };

  beforeEach(async () => {
    engine = new FocalAttentionEngine();
    session = makeSession();
    await engine.init({}, session);
  });

  it('1. getFocal() returns null initially', () => {
    expect(engine.getFocal()).toBeNull();
  });

  it('2. setFocal records primitive + treatment', () => {
    engine.setFocal('arrow', 'pulse');
    const focal = engine.getFocal();
    expect(focal).not.toBeNull();
    expect(focal!.primitiveId).toBe('arrow');
    expect(focal!.treatment).toBe('pulse');
    expect(focal!.relatedToFocal).toEqual([]);
  });

  it('3. clearFocal() returns to null', () => {
    engine.setFocal('arrow', 'highlight');
    expect(engine.getFocal()).not.toBeNull();
    engine.clearFocal();
    expect(engine.getFocal()).toBeNull();
  });

  it('4. pulse treatment at t=0 → scale ≈ 1.04', () => {
    engine.setFocal('arrow', 'pulse');
    const treatment = engine.getTreatmentFor('arrow', 0);
    expect(treatment?.scale).toBeCloseTo(1.04, 5);
  });

  it('5. pulse treatment at t=125ms → scale ≈ 1.08 (peak)', () => {
    engine.setFocal('arrow', 'pulse');
    const treatment = engine.getTreatmentFor('arrow', 125);
    expect(treatment?.scale).toBeCloseTo(1.08, 5);
  });

  it('6. dim_others: non-focal, non-related primitive → opacity = 0.4', () => {
    engine.setFocal('focal_id', 'dim_others', ['related_id']);
    const treatment = engine.getTreatmentFor('other_id', 0);
    expect(treatment).toEqual({ opacity: 0.4 });
  });

  it('7. dim_others: related-to-focal primitive → opacity = 1.0 (preserved)', () => {
    engine.setFocal('focal_id', 'dim_others', ['related_id']);
    const treatment = engine.getTreatmentFor('related_id', 0);
    expect(treatment).toEqual({ opacity: 1.0 });
  });

  it('8. highlight on focal → borderWidth=2, borderColor present', () => {
    engine.setFocal('arrow', 'highlight');
    const treatment = engine.getTreatmentFor('arrow', 0);
    expect(treatment?.borderWidth).toBe(2);
    expect(typeof treatment?.borderColor).toBe('string');
    expect(treatment?.borderColor).toMatch(/^#/);
  });

  it('9. glow on focal → glowRadius > 0', () => {
    engine.setFocal('arrow', 'glow');
    const treatment = engine.getTreatmentFor('arrow', 0);
    expect(treatment?.glowRadius).toBeGreaterThan(0);
  });

  it('10. onEvent(STATE_ENTER) with configured state → calls setFocal for that state', async () => {
    const engCfg = new FocalAttentionEngine();
    await engCfg.init({
      states: {
        STATE_2: {
          focalPrimitiveId: 'force_arrow',
          treatment: 'pulse',
          relatedToFocal: ['block'],
        },
      },
    }, session);

    expect(engCfg.getFocal()).toBeNull();
    engCfg.onEvent({ type: 'STATE_ENTER', state: 'STATE_2' });
    const focal = engCfg.getFocal();
    expect(focal?.primitiveId).toBe('force_arrow');
    expect(focal?.treatment).toBe('pulse');
    expect(focal?.relatedToFocal).toEqual(['block']);
  });
});
