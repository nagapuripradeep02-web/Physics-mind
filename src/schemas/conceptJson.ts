/**
 * Zod validator for v2 concept JSON schema.
 * Matches CLAUDE.md Section 7 target shape.
 *
 * Files that do not match will report violations — the Architect fixes
 * content; Antigravity fixes schema shape.
 */

import { z } from 'zod/v4';

// ── TTS Sentence — must be {id, text_en}, NOT plain string ──────────

const ttsSentenceSchema = z.object({
  id: z.string(),
  text_en: z.string(),
});

// ── Teacher Script per state ────────────────────────────────────────

const teacherScriptSchema = z.object({
  tts_sentences: z.array(ttsSentenceSchema).min(1),
});

// ── Choreography phase ──────────────────────────────────────────────

const choreographyPhaseSchema = z.object({
  at_t: z.number(),
  show: z.string(),
  enter: z.string(),
  duration: z.number().optional(),
});

// ── State (within epic_l_path or epic_c_branches) ───────────────────
// advance_mode + teacher_script are now REQUIRED per state.
// CLAUDE.md rule 15: advance_mode must be specified per state. Never global.
// Phase A (2026-04-19) tightening:
//   - scene_composition: required, >= 3 primitives (rule 20)
//   - focal_primitive_id: required, non-empty (Section 6)

const stateSchema = z.object({
  title: z.string(),
  duration: z.number().optional(),
  focal_primitive_id: z.string().min(1),
  advance_mode: z.enum([
    'auto_after_tts',
    'manual_click',
    'auto_after_animation',
    'interaction_complete',
    'wait_for_answer',
  ]),
  scene_composition: z.array(z.record(z.string(), z.unknown())).min(3),
  teacher_script: teacherScriptSchema,
  choreography_sequence: z.object({
    phases: z.array(choreographyPhaseSchema),
  }).optional(),
});

// ── Physics Engine Config ───────────────────────────────────────────

const variableSchema = z.object({
  name: z.string(),
  unit: z.string(),
  min: z.number().optional(),
  max: z.number().optional(),
  default: z.number().optional(),
  role: z.string().optional(),
  constant: z.number().optional(),
  derived: z.string().optional(),
});

const computedOutputSchema = z.object({
  formula: z.string(),
});

const physicsEngineConfigSchema = z.object({
  variables: z.record(z.string(), variableSchema),
  computed_outputs: z.record(z.string(), computedOutputSchema).optional(),
  formulas: z.record(z.string(), z.string()).optional(),
  constraints: z.array(z.string()).optional(),
});

// ── Renderer Pair ───────────────────────────────────────────────────

const rendererPairSchema = z.object({
  panel_a: z.string(),
  panel_b: z.string(),
});

// ── Real World Anchor ───────────────────────────────────────────────

const realWorldAnchorSchema = z.object({
  primary: z.string(),
  secondary: z.string().optional(),
  tertiary: z.string().optional(),
});

// ── EPIC-L Path ─────────────────────────────────────────────────────

const epicLPathSchema = z.object({
  state_count: z.number().int().min(2),
  states: z.record(z.string(), stateSchema),
});

// ── EPIC-C Branch ───────────────────────────────────────────────────

const epicCBranchSchema = z.object({
  branch_id: z.string(),
  misconception: z.string(),
  trigger_phrases: z.array(z.string()).optional(),
  state_sequence: z.array(z.string()).optional(),
  states: z.record(z.string(), stateSchema).optional(),
});

// ── Regeneration Variant ────────────────────────────────────────────

const regenerationVariantSchema = z.object({
  variant_id: z.string(),
  type: z.string(),
  label: z.string(),
  physical_world: z.string().optional(),
  same_physics: z.string().optional(),
  scene_hint: z.string().optional(),
});

// ── Panel B Config ──────────────────────────────────────────────────

const panelBTraceSchema = z.object({
  id: z.string(),
  color: z.string(),
  // Accept either field name: equation_expr (v2 target) or equation (current)
  equation_expr: z.string().optional(),
  equation: z.string().optional(),
  label: z.string().optional(),
}).passthrough();

const panelBConfigSchema = z.object({
  renderer: z.string(),
  x_axis: z.object({
    variable: z.string().optional(),
    label: z.string(),
    min: z.number(),
    max: z.number(),
  }).passthrough().optional(),
  y_axis: z.object({
    variable: z.string().optional(),
    label: z.string(),
    min: z.number(),
    max: z.number(),
  }).passthrough().optional(),
  traces: z.array(panelBTraceSchema).optional(),
  live_dot: z.object({
    x_variable: z.string().optional(),
    color: z.string(),
    size: z.number(),
    // Accept either: y_expr (v2 target) or y_variable (current)
    y_expr: z.string().optional(),
    y_variable: z.string().optional(),
    // Variables the live_dot tracks. When the graph renderer receives a
    // PARAM_UPDATE whose key is in this list, the live dot recomputes. Also
    // drives the DOM slider controls rendered on the Panel B footer.
    sync_with_panel_a_sliders: z.array(z.string()).optional(),
  }).passthrough().optional(),
}).passthrough();

// ── Mode Overrides ──────────────────────────────────────────────────

const modeOverrideSchema = z.object({
  assessment_style: z.string().optional(),
  phase_2_content: z.record(z.string(), z.unknown()).optional(),
  epic_l_path: z.object({
    states: z.record(z.string(), z.object({
      teacher_script: teacherScriptSchema.optional(),
    }).passthrough()).optional(),
  }).optional(),
}).passthrough();

const modeOverridesSchema = z.object({
  board: modeOverrideSchema.optional(),
  competitive: modeOverrideSchema.optional(),
  foundation: modeOverrideSchema.optional(),
  neet: modeOverrideSchema.optional(),
  olympiad: modeOverrideSchema.optional(),
}).passthrough();

// ── Available Renderer Scenarios ────────────────────────────────────
// Per CLAUDE.md rule 11: Sonnet picks scenarios ONLY from available_renderer_scenarios.
// Shape: { "epic_l": [...], "epic_c": [...], "panel_b": [...] }
// Optional today (only 1/23 JSONs populated). check:scenarios enforces the contents.

const availableRendererScenariosSchema = z.record(
  z.string(),
  z.array(z.string()),
);

// ── Top-Level Concept JSON Schema (v2 target) ───────────────────────

export const conceptJsonSchema = z.object({
  concept_id: z.string(),
  concept_name: z.string(),
  chapter: z.union([z.number(), z.string()]),
  section: z.string(),
  schema_version: z.literal('2.0.0'),
  class_level: z.union([z.number(), z.string()]).optional(),
  source_book: z.string().optional(),

  renderer_pair: rendererPairSchema,
  physics_engine_config: physicsEngineConfigSchema,
  real_world_anchor: realWorldAnchorSchema,
  epic_l_path: epicLPathSchema,

  epic_c_branches: z.array(epicCBranchSchema).min(4),
  regeneration_variants: z.array(regenerationVariantSchema).optional(),
  panel_b_config: panelBConfigSchema.optional(),
  mode_overrides: modeOverridesSchema.optional(),
  available_renderer_scenarios: availableRendererScenariosSchema.optional(),
}).passthrough().superRefine((data, ctx) => {
  // Phase A rule 16: at least 2 distinct advance_mode values across
  // epic_l_path.states. All-`auto_after_tts` ships a passive video, not an
  // interactive lesson — reject.
  const states = data.epic_l_path?.states ?? {};
  const modes = new Set<string>();
  for (const state of Object.values(states)) {
    if (state && typeof state === 'object' && 'advance_mode' in state) {
      const mode = (state as { advance_mode?: unknown }).advance_mode;
      if (typeof mode === 'string') modes.add(mode);
    }
  }
  if (modes.size < 2) {
    ctx.addIssue({
      code: 'custom',
      path: ['epic_l_path', 'states'],
      message: `advance_mode variety: found ${modes.size} distinct value(s) (${[...modes].join(', ') || 'none'}), need >= 2. CLAUDE.md rule 16: mix auto_after_tts, manual_click, wait_for_answer, interaction_complete.`,
    });
  }
});

// ── Validation helper ───────────────────────────────────────────────

export interface ValidationResult {
  file: string;
  passed: boolean;
  errors: string[];
}

/**
 * Walks the entire JSON and flags any tts_sentences[].text field (legacy name).
 * CLAUDE.md rule 13: teacher_script uses text_en, not text. Language is
 * pipeline responsibility, not content responsibility.
 */
function findLegacyTextFields(data: unknown, path: string[]): string[] {
  const errors: string[] = [];

  if (data === null || typeof data !== 'object') return errors;

  if (Array.isArray(data)) {
    data.forEach((item, i) => {
      errors.push(...findLegacyTextFields(item, [...path, `[${i}]`]));
    });
    return errors;
  }

  const record = data as Record<string, unknown>;

  if (Array.isArray(record.tts_sentences)) {
    record.tts_sentences.forEach((sentence, i) => {
      if (
        sentence !== null &&
        typeof sentence === 'object' &&
        'text' in sentence &&
        !('text_en' in sentence)
      ) {
        const where = [...path, `tts_sentences[${i}]`].join('.');
        errors.push(
          `  ${where}: uses legacy 'text' field. Rename to 'text_en' — language is pipeline responsibility (CLAUDE.md rule 13).`,
        );
      }
    });
  }

  for (const [key, value] of Object.entries(record)) {
    errors.push(...findLegacyTextFields(value, [...path, key]));
  }

  return errors;
}

export function validateConceptJson(data: unknown, filename: string): ValidationResult {
  // Reject arrays (old class12_current_electricity.json format)
  if (Array.isArray(data)) {
    return {
      file: filename,
      passed: false,
      errors: ['  (root): Root is an array, not an object. Must be a single concept object per file.'],
    };
  }

  const legacyErrors = findLegacyTextFields(data, []);
  const result = conceptJsonSchema.safeParse(data);

  if (result.success && legacyErrors.length === 0) {
    return { file: filename, passed: true, errors: [] };
  }

  const errors: string[] = [];
  if (!result.success) {
    errors.push(
      ...result.error.issues.map((issue) => {
        const issuePath = issue.path.join('.');
        return `  ${issuePath || '(root)'}: ${issue.message}`;
      }),
    );
  }
  errors.push(...legacyErrors);

  return { file: filename, passed: false, errors };
}
