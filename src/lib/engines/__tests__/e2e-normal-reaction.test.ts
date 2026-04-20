/**
 * End-to-end integration: `normal_reaction.json` → 13 engines → asserted behavior.
 *
 * Proves that:
 *   1. ConfigAdapter produces SimSession.boot()-compatible configs from the real JSON
 *   2. All engines boot in dependency order and come out live
 *   3. Slider changes propagate through the bus in causal order
 *   4. State transitions load new teacher script + trigger Transition
 *   5. Misconception detection fires on real trigger phrases
 *   6. Focal attention gracefully no-ops when JSON has no focal fields
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SimSession } from '../sim-session';
import { PhysicsEngineAdapter } from '../physics';
import { ZoneLayoutEngine } from '../zone-layout';
import { AnchorResolverEngine } from '../anchor-resolver';
import { ScaleEngine } from '../scale';
import { CollisionEngine } from '../collision';
import { StateMachineEngine } from '../state-machine';
import { TeacherScriptEngine } from '../teacher-script';
import { InteractionEngine } from '../interaction';
import { PanelBEngine } from '../panel-b';
import { ChoreographyEngine } from '../choreography';
import { TransitionEngine } from '../transition';
import { FocalAttentionEngine } from '../focal-attention';
import { MisconceptionDetectionEngine } from '../misconception-detection';
import { conceptJsonToEngineConfigs, type ConceptJson } from '../config-adapter';
import type { SimEvent } from '../types';

function loadConcept(name: string): ConceptJson {
  const path = resolve(__dirname, '../../../data/concepts', `${name}.json`);
  return JSON.parse(readFileSync(path, 'utf-8')) as ConceptJson;
}

async function bootNormalReaction(): Promise<{
  session: SimSession;
  observed: SimEvent[];
}> {
  const json = loadConcept('normal_reaction');
  const configs = conceptJsonToEngineConfigs(json);

  const session = new SimSession('e2e-normal-reaction');

  // Wildcard observer BEFORE boot so it runs ahead of every engine handler
  // (preserves causal event order in observed[])
  const observed: SimEvent[] = [];
  session.on('*' as SimEvent['type'], (e) => { observed.push(e); });

  session.register({ id: 'physics',                 tier: 'A', dependencies: [],             factory: () => new PhysicsEngineAdapter() });
  session.register({ id: 'zone-layout',             tier: 'B', dependencies: [],             factory: () => new ZoneLayoutEngine() });
  session.register({ id: 'anchor-resolver',         tier: 'B', dependencies: ['zone-layout'],factory: () => new AnchorResolverEngine() });
  session.register({ id: 'scale',                   tier: 'B', dependencies: ['zone-layout'],factory: () => new ScaleEngine() });
  session.register({ id: 'collision',               tier: 'B', dependencies: [],             factory: () => new CollisionEngine() });
  session.register({ id: 'state-machine',           tier: 'E', dependencies: [],             factory: () => new StateMachineEngine() });
  session.register({ id: 'teacher-script',          tier: 'D', dependencies: ['state-machine'], factory: () => new TeacherScriptEngine() });
  session.register({ id: 'interaction',             tier: 'D', dependencies: ['scale'],      factory: () => new InteractionEngine() });
  session.register({ id: 'panel-b',                 tier: 'D', dependencies: ['interaction'],factory: () => new PanelBEngine() });
  session.register({ id: 'choreography',            tier: 'C', dependencies: [],             factory: () => new ChoreographyEngine() });
  session.register({ id: 'transition',              tier: 'C', dependencies: ['state-machine'], factory: () => new TransitionEngine() });
  session.register({ id: 'focal-attention',         tier: 'C', dependencies: ['state-machine'], factory: () => new FocalAttentionEngine() });
  session.register({ id: 'misconception-detection', tier: 'E', dependencies: [],             factory: () => new MisconceptionDetectionEngine() });

  await session.boot(configs);
  return { session, observed };
}

describe('E2E: normal_reaction.json through 13 engines', () => {
  let session: SimSession;
  let observed: SimEvent[];

  beforeEach(async () => {
    ({ session, observed } = await bootNormalReaction());
  });

  it('1. boot succeeds and every engine instance is available', () => {
    const ids = [
      'physics', 'zone-layout', 'anchor-resolver', 'scale', 'collision',
      'state-machine', 'teacher-script', 'interaction', 'panel-b',
      'choreography', 'transition', 'focal-attention', 'misconception-detection',
    ];
    for (const id of ids) {
      expect(session.getEngine(id), id).not.toBeNull();
    }
    expect(session.isBooted()).toBe(true);
  });

  it('2. state-machine is in STATE_1 after boot; teacher-script loads STATE_1 after manual re-enter', () => {
    const sm = session.getEngine<StateMachineEngine>('state-machine')!;
    const ts = session.getEngine<TeacherScriptEngine>('teacher-script')!;

    expect(sm.getCurrentState()).toBe('STATE_1');

    // teacher-script missed the init-time STATE_ENTER (booted after state-machine).
    // Re-enter to propagate to all wired engines.
    sm.enterState('STATE_1');
    const current = ts.getCurrentSentence();
    expect(current).not.toBeNull();
    expect(current!.id).toBe('s1');
    expect(current!.text_en).toContain('Gravity pulls you down');
  });

  it('3. panel-b precomputed trace has 10 sampled points (theta: 0..90 step 10)', () => {
    const pb = session.getEngine<PanelBEngine>('panel-b')!;
    const traces = pb.getAllTraces();
    expect(traces.length).toBe(1);
    expect(traces[0].id).toBe('N_vs_theta');
    expect(traces[0].points.length).toBe(10);
    // First point: theta=0, y = m*g*cos(0) = 2*9.8*1 = 19.6
    expect(traces[0].points[0]).toEqual({ x: 0, y: expect.closeTo(19.6, 1) });
  });

  it('4. slider change → scale + panel-b live dot update, causal event order preserved', () => {
    const sm = session.getEngine<StateMachineEngine>('state-machine')!;
    const scale = session.getEngine<ScaleEngine>('scale')!;
    const interaction = session.getEngine<InteractionEngine>('interaction')!;
    const pb = session.getEngine<PanelBEngine>('panel-b')!;

    sm.enterState('STATE_1'); // propagate STATE_ENTER after boot
    observed.length = 0;

    const scaleBefore = scale.getScale();
    interaction.handleSliderChange('theta', 60);

    expect(scale.getScale()).not.toBe(scaleBefore);

    const dot = pb.getLiveDot();
    expect(dot).not.toBeNull();
    expect(dot!.x).toBe(60);
    expect(dot!.y).toBeCloseTo(2 * 9.8 * Math.cos((60 * Math.PI) / 180), 1);

    const phys = observed.findIndex((e) => e.type === 'PHYSICS_COMPUTED');
    const scaleUpd = observed.findIndex((e) => e.type === 'SCALE_UPDATED');
    const slider = observed.findIndex((e) => e.type === 'SLIDER_CHANGE');
    expect(phys).toBeGreaterThanOrEqual(0);
    expect(scaleUpd).toBeGreaterThan(phys);
    expect(slider).toBeGreaterThan(scaleUpd);
  });

  it('5. state advance: STATE_1 → STATE_2 triggers Transition + reloads teacher-script', () => {
    const sm = session.getEngine<StateMachineEngine>('state-machine')!;
    const ts = session.getEngine<TeacherScriptEngine>('teacher-script')!;
    const tr = session.getEngine<TransitionEngine>('transition')!;

    sm.enterState('STATE_1'); // propagate
    sm.next(); // → STATE_2

    expect(sm.getCurrentState()).toBe('STATE_2');
    expect(tr.isTransitioning()).toBe(true);
    expect(tr.getProgress(800)).toBe(1);

    const current = ts.getCurrentSentence();
    expect(current).not.toBeNull();
    expect(current!.id).toBe('s1');
    expect(current!.text_en).toContain('Normal does not mean ordinary');
  });

  it('6. misconception detection hits exact trigger phrase from epic_c_branches', () => {
    const md = session.getEngine<MisconceptionDetectionEngine>('misconception-detection')!;
    const hit = md.detect('I think N equals mg always on any surface');
    expect(hit.matched).toBe(true);
    expect(hit.matchType).toBe('exact');
    expect(hit.branchId).toBe('N_equals_mg_always');

    const miss = md.detect('purple monkey dishwasher');
    expect(miss.matched).toBe(false);
    expect(miss.matchType).toBe('none');
  });

  it('7. focal attention is a graceful no-op when JSON has no focal fields', () => {
    const fa = session.getEngine<FocalAttentionEngine>('focal-attention')!;
    const sm = session.getEngine<StateMachineEngine>('state-machine')!;

    sm.enterState('STATE_1');
    expect(fa.getFocal()).toBeNull();
    expect(fa.getTreatmentFor('any_primitive', 0)).toBeNull();

    sm.next();
    expect(fa.getFocal()).toBeNull();
  });
});
