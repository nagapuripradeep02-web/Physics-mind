/**
 * ConfigAdapter
 *
 * Pure transformation: a concept JSON (src/data/concepts/*.json) → the map of
 * per-engine configs that SimSession.boot() expects.
 *
 * Keeps concept-JSON shape concerns (snake_case, optional fields, sliders-in-scene)
 * out of engine code. Engines never import this file; this file imports engine types.
 */

import type { InteractionConfig, SliderSpec } from '../interaction';
import type { TeacherScriptConfig, TtsSentence, AdvanceMode } from '../teacher-script';
import type { StateMachineConfig } from '../state-machine';
import type { PanelBConfigInput } from '../panel-b';
import type { FocalAttentionConfig, FocalTreatment } from '../focal-attention';
import type { MisconceptionConfig, MisconceptionBranch } from '../misconception-detection';
import type { PhysicsEngineConfig } from '../physics';

// ── Loose input types ───────────────────────────────────────────────
// The JSON is Architect-authored; we accept unknown shape defensively.

export type ConceptJson = Record<string, unknown>;

type SceneItem = Record<string, unknown>;

interface EpicStateRaw {
  scene_composition?: SceneItem[];
  teacher_script?: { tts_sentences?: TtsSentence[] };
  advance_mode?: AdvanceMode;
  focal_primitive_id?: string;
  focal_treatment?: FocalTreatment;
  related_to_focal?: string[];
}

interface EpicCBranchRaw {
  branch_id?: string;
  branchId?: string;
  trigger_phrases?: string[];
  triggerPhrases?: string[];
  misconception?: string;
}

// ── Output shape ────────────────────────────────────────────────────

export interface EngineConfigs {
  physics: PhysicsEngineConfig;
  'zone-layout': Record<string, never>;
  'anchor-resolver': Record<string, never>;
  scale: Record<string, never>;
  collision: Record<string, never>;
  'state-machine': StateMachineConfig;
  'teacher-script': TeacherScriptConfig;
  interaction: InteractionConfig;
  'panel-b': PanelBConfigInput;
  choreography: Record<string, never>;
  transition: Record<string, never>;
  'focal-attention': FocalAttentionConfig;
  'misconception-detection': MisconceptionConfig;
  [engineId: string]: unknown;
}

// ── Helpers ─────────────────────────────────────────────────────────

function getRecord(obj: unknown, key: string): Record<string, unknown> | undefined {
  if (obj && typeof obj === 'object' && key in (obj as Record<string, unknown>)) {
    const val = (obj as Record<string, unknown>)[key];
    return val && typeof val === 'object' ? (val as Record<string, unknown>) : undefined;
  }
  return undefined;
}

function getString(obj: unknown, key: string): string | undefined {
  if (obj && typeof obj === 'object' && key in (obj as Record<string, unknown>)) {
    const val = (obj as Record<string, unknown>)[key];
    return typeof val === 'string' ? val : undefined;
  }
  return undefined;
}

function getNumber(obj: unknown, key: string): number | undefined {
  if (obj && typeof obj === 'object' && key in (obj as Record<string, unknown>)) {
    const val = (obj as Record<string, unknown>)[key];
    return typeof val === 'number' && Number.isFinite(val) ? val : undefined;
  }
  return undefined;
}

function getStringArray(obj: unknown, key: string): string[] | undefined {
  if (obj && typeof obj === 'object' && key in (obj as Record<string, unknown>)) {
    const val = (obj as Record<string, unknown>)[key];
    if (Array.isArray(val)) {
      return val.filter((v): v is string => typeof v === 'string');
    }
  }
  return undefined;
}

// ── Slider extraction ───────────────────────────────────────────────

function extractSliders(
  statesRaw: Record<string, EpicStateRaw>,
  variables: Record<string, unknown>,
): Record<string, SliderSpec> {
  const sliders: Record<string, SliderSpec> = {};

  for (const stateData of Object.values(statesRaw)) {
    const scene = stateData.scene_composition ?? [];
    for (const item of scene) {
      if (!item || typeof item !== 'object') continue;
      if (item.type !== 'slider') continue;
      const variable = getString(item, 'variable');
      if (!variable || sliders[variable]) continue;

      const min = getNumber(item, 'min') ?? getNumber(variables[variable], 'min') ?? 0;
      const max = getNumber(item, 'max') ?? getNumber(variables[variable], 'max') ?? 1;
      const step = getNumber(item, 'step') ?? 1;
      const defaultVal =
        getNumber(item, 'default') ??
        getNumber(variables[variable], 'default') ??
        min;

      sliders[variable] = { min, max, step, default: defaultVal };
    }
  }

  return sliders;
}

// ── Teacher script states ───────────────────────────────────────────

function buildTeacherScriptStates(
  statesRaw: Record<string, EpicStateRaw>,
): TeacherScriptConfig['states'] {
  const out: NonNullable<TeacherScriptConfig['states']> = {};
  for (const [stateId, stateData] of Object.entries(statesRaw)) {
    const sentences: TtsSentence[] = (stateData.teacher_script?.tts_sentences ?? []).map((s) => ({
      id: s.id,
      text_en: s.text_en,
    }));
    const advanceMode: AdvanceMode = stateData.advance_mode ?? 'manual_click';
    out[stateId] = { advanceMode, sentences };
  }
  return out;
}

// ── State machine states + advance modes ────────────────────────────

function buildStateMachineConfig(
  statesRaw: Record<string, EpicStateRaw>,
): StateMachineConfig {
  const states = Object.keys(statesRaw);
  const advanceModes: Record<string, AdvanceMode> = {};
  for (const [stateId, stateData] of Object.entries(statesRaw)) {
    advanceModes[stateId] = stateData.advance_mode ?? 'manual_click';
  }
  return {
    states,
    initialState: states[0],
    advanceModes,
  };
}

// ── Focal attention states ──────────────────────────────────────────

function buildFocalStates(
  statesRaw: Record<string, EpicStateRaw>,
): FocalAttentionConfig {
  const states: NonNullable<FocalAttentionConfig['states']> = {};
  for (const [stateId, stateData] of Object.entries(statesRaw)) {
    if (stateData.focal_primitive_id && stateData.focal_treatment) {
      states[stateId] = {
        focalPrimitiveId: stateData.focal_primitive_id,
        treatment: stateData.focal_treatment,
        relatedToFocal: stateData.related_to_focal ?? [],
      };
    }
  }
  return { states };
}

// ── Misconception branches ──────────────────────────────────────────

function buildMisconceptionBranches(rawBranches: EpicCBranchRaw[]): MisconceptionBranch[] {
  const out: MisconceptionBranch[] = [];
  for (const raw of rawBranches) {
    const branchId = raw.branchId ?? raw.branch_id;
    const triggerPhrases = raw.triggerPhrases ?? raw.trigger_phrases ?? [];
    if (!branchId || triggerPhrases.length === 0) continue;
    out.push({ branchId, triggerPhrases, misconception: raw.misconception });
  }
  return out;
}

// ── Main entry ──────────────────────────────────────────────────────

export function conceptJsonToEngineConfigs(concept: ConceptJson): EngineConfigs {
  const conceptId = (concept.concept_id as string | undefined) ?? 'unknown';
  const physicsCfg = getRecord(concept, 'physics_engine_config') ?? {};
  const variables = getRecord(physicsCfg, 'variables') ?? {};

  const epicL = getRecord(concept, 'epic_l_path') ?? {};
  const statesRaw = (epicL.states ?? {}) as Record<string, EpicStateRaw>;

  const declaredCount = getNumber(epicL, 'state_count');
  const actualCount = Object.keys(statesRaw).length;
  if (declaredCount !== undefined && declaredCount !== actualCount) {
    console.warn(
      `[ConfigAdapter] ${conceptId}: epic_l_path.state_count=${declaredCount} but states has ${actualCount} entries`,
    );
  }

  // Initial physics variables from defaults
  const initialVariables: Record<string, number> = {};
  for (const [key, raw] of Object.entries(variables)) {
    const defaultVal = getNumber(raw, 'default') ?? getNumber(raw, 'constant');
    if (defaultVal !== undefined) initialVariables[key] = defaultVal;
  }

  const sliders = extractSliders(statesRaw, variables);

  const epicCRaw = Array.isArray(concept.epic_c_branches)
    ? (concept.epic_c_branches as EpicCBranchRaw[])
    : [];

  const panelBRaw = (concept.panel_b_config ?? {
    renderer: 'graph_interactive',
    x_axis: { variable: 'x', label: '', min: 0, max: 1, tick_interval: 0.1 },
    y_axis: { variable: 'y', label: '', min: 0, max: 1, tick_interval: 0.1 },
    traces: [],
  }) as PanelBConfigInput;

  return {
    physics: { conceptId, initialVariables },
    'zone-layout': {},
    'anchor-resolver': {},
    scale: {},
    collision: {},
    'state-machine': buildStateMachineConfig(statesRaw),
    'teacher-script': { states: buildTeacherScriptStates(statesRaw) },
    interaction: { conceptId, sliders, hotspots: [] },
    'panel-b': panelBRaw,
    choreography: {},
    transition: {},
    'focal-attention': buildFocalStates(statesRaw),
    'misconception-detection': { branches: buildMisconceptionBranches(epicCRaw) },
  };
}
