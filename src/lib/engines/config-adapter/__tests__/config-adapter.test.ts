import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { conceptJsonToEngineConfigs, type ConceptJson } from '../index';

function loadConcept(name: string): ConceptJson {
  const path = resolve(__dirname, '../../../../data/concepts', `${name}.json`);
  return JSON.parse(readFileSync(path, 'utf-8')) as ConceptJson;
}

describe('conceptJsonToEngineConfigs', () => {
  it('1. produces a config for every declared engine slot', () => {
    const json = loadConcept('normal_reaction');
    const cfg = conceptJsonToEngineConfigs(json);
    expect(cfg.physics).toBeDefined();
    expect(cfg['zone-layout']).toBeDefined();
    expect(cfg.scale).toBeDefined();
    expect(cfg['state-machine']).toBeDefined();
    expect(cfg['teacher-script']).toBeDefined();
    expect(cfg.interaction).toBeDefined();
    expect(cfg['panel-b']).toBeDefined();
    expect(cfg.choreography).toBeDefined();
    expect(cfg.transition).toBeDefined();
    expect(cfg['focal-attention']).toBeDefined();
    expect(cfg['misconception-detection']).toBeDefined();
  });

  it('2. extracts sliders from scene_composition across states, deduped', () => {
    const json = loadConcept('normal_reaction');
    const { interaction } = conceptJsonToEngineConfigs(json);
    expect(interaction.conceptId).toBe('normal_reaction');
    const varNames = Object.keys(interaction.sliders).sort();
    expect(varNames).toEqual(['m', 'theta']);
    expect(interaction.sliders.theta).toEqual({ min: 0, max: 80, step: 5, default: 30 });
    expect(interaction.sliders.m).toEqual({ min: 0.5, max: 10, step: 0.5, default: 2 });
  });

  it('3. state-machine config has 5 states in declaration order with initialState', () => {
    const json = loadConcept('normal_reaction');
    const sm = conceptJsonToEngineConfigs(json)['state-machine'];
    expect(sm.states).toEqual(['STATE_1', 'STATE_2', 'STATE_3', 'STATE_4', 'STATE_5']);
    expect(sm.initialState).toBe('STATE_1');
    // Every state has a declared advance mode (default manual_click)
    for (const s of sm.states) {
      expect(sm.advanceModes?.[s]).toBe('manual_click');
    }
  });

  it('4. teacher-script config includes every state\'s sentences with id + text_en', () => {
    const json = loadConcept('normal_reaction');
    const ts = conceptJsonToEngineConfigs(json)['teacher-script'];
    const s1 = ts.states?.STATE_1;
    expect(s1).toBeDefined();
    expect(s1!.sentences.length).toBe(4);
    expect(s1!.sentences[0]).toEqual({
      id: 's1',
      text_en: 'You are standing on the floor. Gravity pulls you down with 588 Newtons.',
    });
    expect(s1!.advanceMode).toBe('manual_click');
  });

  it('5. misconception-detection branches map snake_case → camelCase', () => {
    const json = loadConcept('normal_reaction');
    const md = conceptJsonToEngineConfigs(json)['misconception-detection'];
    expect(md.branches.length).toBe(1);
    const branch = md.branches[0];
    expect(branch.branchId).toBe('N_equals_mg_always');
    expect(branch.triggerPhrases).toContain('N equals mg always');
    expect(branch.triggerPhrases.length).toBe(3);
  });

  it('6. panel-b config passes through with snake_case accepted', () => {
    const json = loadConcept('normal_reaction');
    const pb = conceptJsonToEngineConfigs(json)['panel-b'] as Record<string, unknown>;
    expect(pb.renderer).toBe('graph_interactive');
    expect(pb.x_axis).toBeDefined();
    expect(pb.live_dot).toBeDefined();
  });

  it('7. focal-attention states map is empty when JSON has no focal_primitive_id', () => {
    const json = loadConcept('normal_reaction');
    const fa = conceptJsonToEngineConfigs(json)['focal-attention'];
    expect(fa.states).toEqual({});
  });

  it('8. physics config includes conceptId + initialVariables from defaults/constants', () => {
    const json = loadConcept('normal_reaction');
    const p = conceptJsonToEngineConfigs(json).physics;
    expect(p.conceptId).toBe('normal_reaction');
    expect(p.initialVariables).toEqual({ m: 2, g: 9.8, theta: 30 });
  });
});
