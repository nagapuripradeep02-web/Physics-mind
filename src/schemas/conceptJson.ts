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

// ── Misconception Watch (per-state, optional) ───────────────────────
// Pre-empts a common wrong belief inline within EPIC-L (distinct from
// EPIC-C branches which fire after a wrong answer). One-liner counter.

const misconceptionWatchSchema = z.object({
  belief: z.string().min(1),
  visual_counter: z.string().optional(),
  one_line_fix: z.string().min(1),
});

// ── State (within epic_l_path or epic_c_branches) ───────────────────
// advance_mode + teacher_script are now REQUIRED per state.
// CLAUDE.md rule 15: advance_mode must be specified per state. Never global.
// Phase A (2026-04-19) tightening:
//   - scene_composition: required, >= 3 primitives (rule 19)
//   - focal_primitive_id: required, non-empty (Section 6)
// v2.2 additions (2026-05-04, optional for legacy v2.0 retrofit window):
//   - misconception_watch: array of inline pre-emptive corrections

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
  misconception_watch: z.array(misconceptionWatchSchema).optional(),
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

// ── Cognitive Limits (concept-level ceiling) ────────────────────────
// Caps clutter per state. Validator (or quality_auditor gate 5) enforces
// each state respects these. Recommended defaults per concept_tier:
//   simple:  primitives=4, labels=3, words=15
//   medium:  primitives=5, labels=3, words=18
//   complex: primitives=6, labels=4, words=20

const cognitiveLimitsSchema = z.object({
  max_primitives_per_state: z.number().int().positive(),
  max_labels_per_state: z.number().int().positive(),
  max_words_per_tts_sentence: z.number().int().positive(),
});

// ── Aha Moment (one explicit insight, on the AHA state) ─────────────
// Required for any concept with epic_l_path.state_count >= 4 once schema
// transition is complete. Statement <= 15 words to keep it memorable.

const ahaMomentSchema = z.object({
  state_id: z.string().min(1),
  statement: z.string().min(1),
  visual_confirmation: z.string().min(1).optional(),
});

// ── Assessment (pre/post comprehension quiz) ────────────────────────
// The pre/post MCQ quiz that MEASURES comprehension (North Star: a cold,
// teacherless student reaches 80–85% on the first pass). Backward-designed:
// the 6 questions together define mastery, and each maps to the EPIC-L
// state that teaches its idea (see coverage_map). Optional during phase-in
// — Gates 19/20 in the superRefine fire ONLY when `assessment` is present,
// so the un-retrofitted atomics keep passing.
// See docs/COMPREHENSION_LOOP_PLAN.md.

const quizQuestionSchema = z.object({
  q_id: z.string().min(1),
  stem: z.string().min(1),
  options: z.object({
    A: z.string().min(1),
    B: z.string().min(1),
    C: z.string().min(1),
    D: z.string().min(1),
  }),
  correct: z.enum(['A', 'B', 'C', 'D']),
  // Keyed by option letter. The "every wrong option present + correct NOT a
  // key" check is Gate 19a in the superRefine. A z.string() key (vs an enum
  // key) avoids zod/v4 record enum-key narrowing uncertainty.
  distractor_misconceptions: z.record(z.string(), z.string().min(1)),
  tested_idea: z.string().min(1),
  teaches_state: z.string().min(1),
  difficulty: z.enum(['core', 'stretch']),
  // Reworded equivalent stem (same physics, different surface story/numbers)
  // for the post-test, to blunt the pre/post memory effect.
  parallel_form_stem: z.string().min(1).optional(),
});

const assessmentSchema = z.object({
  mastery_definition: z.string().min(1),
  questions: z.array(quizQuestionSchema).length(6),
});

const coverageMapSchema = z.object({
  by_state: z.record(z.string(), z.array(z.string())),
  // States that legitimately teach no testable claim (hook, interactive
  // sliders). First-class auditable declaration — Gate 19d exempts these
  // from the orphan check; quality_auditor sanity-checks they're truthful.
  non_assessed_states: z.array(z.string()).default([]),
});

// ── Concept Tier (authoring complexity classification) ──────────────
// Drives default state count band + cognitive_limits defaults.

const conceptTierSchema = z.enum(['simple', 'medium', 'complex']);

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

  // Relaxed from min(4) → min(1) on 2026-05-04 (forcing 4 caused authors to
  // manufacture filler branches), then made OPTIONAL on 2026-06-11 per the
  // EPIC-L-first directive (founder, 2026-06-10): misconceptions are
  // confronted INSIDE EPIC-L via misconception_watch + predict→reveal beats
  // (CLAUDE.md Rule 16a). EPIC-C branches are authored only once real
  // student confusion data exists. When present, every branch must still be
  // a real (non-strawman) misconception with STATE_1 showing the wrong
  // belief explicitly (Rule 16b).
  epic_c_branches: z.array(epicCBranchSchema).optional(),
  regeneration_variants: z.array(regenerationVariantSchema).optional(),
  panel_b_config: panelBConfigSchema.optional(),
  mode_overrides: modeOverridesSchema.optional(),
  available_renderer_scenarios: availableRendererScenariosSchema.optional(),

  // v2.2 additions (2026-05-04). Optional during the legacy retrofit window;
  // gold-standard concepts (v2.2-native) author all four. The validator's
  // superRefine below adds shape checks that fire only when the field is
  // present, so legacy v2.0 JSONs continue to pass.
  concept_tier: conceptTierSchema.optional(),
  cognitive_limits: cognitiveLimitsSchema.optional(),
  aha_moment: ahaMomentSchema.optional(),

  // Comprehension-loop keystone (2026-05-30). Optional during the phase-in
  // window; Gates 19/20 in the superRefine fire only when `assessment` is
  // present, so the 62 un-retrofitted atomics stay passing.
  assessment: assessmentSchema.optional(),
  coverage_map: coverageMapSchema.optional(),
}).passthrough().superRefine((data, ctx) => {
  // Phase A — CLAUDE.md rule 15: at least 2 distinct advance_mode values
  // across epic_l_path.states. All-`auto_after_tts` ships a passive video,
  // not an interactive lesson — reject.
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
      message: `advance_mode variety: found ${modes.size} distinct value(s) (${[...modes].join(', ') || 'none'}), need >= 2. CLAUDE.md rule 15: mix auto_after_tts, manual_click, wait_for_answer, interaction_complete.`,
    });
  }

  // v2.2 aha_moment shape checks — fire only when authored.
  // (Required-for-gold-standard gate lives in validate-concepts.ts so legacy
  // v2.0 JSONs can stay passing during the retrofit window.)
  if (data.aha_moment) {
    const wordCount = data.aha_moment.statement.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 15) {
      ctx.addIssue({
        code: 'custom',
        path: ['aha_moment', 'statement'],
        message: `aha_moment.statement is ${wordCount} words; keep it <= 15 so students remember the insight as one sentence.`,
      });
    }
    if (!(data.aha_moment.state_id in states)) {
      ctx.addIssue({
        code: 'custom',
        path: ['aha_moment', 'state_id'],
        message: `aha_moment.state_id "${data.aha_moment.state_id}" must reference a state defined in epic_l_path.states.`,
      });
    }
  }

  // ── Gate 19 (coverage) + Gate 20 (quiz-quality) ───────────────────
  // (Gates 16 POE / 17 one-variable / 18 concrete-first are auditor-judgment
  //  gates defined in the quality_auditor spec; Gate 15 is reserved for the
  //  Pass-2 audit. Only the two machine gates below run in code.)
  // Fire ONLY when an assessment is authored (phase-in carve-out, same
  // pattern as aha_moment above). The machine checks live here; the
  // pedagogical-reality checks (distractors are REAL student errors,
  // mastery_definition is honest) are the quality_auditor's job.
  // See docs/COMPREHENSION_LOOP_PLAN.md.
  if (data.assessment) {
    const questions = data.assessment.questions ?? [];
    const stateIds = new Set(Object.keys(states));
    const coverage = data.coverage_map;
    const byState = coverage?.by_state ?? {};
    const nonAssessed = new Set(coverage?.non_assessed_states ?? []);
    const qIds = questions.map((q) => q.q_id);
    const letters = ['A', 'B', 'C', 'D'] as const;

    // Gate 19a — coverage_map required when assessment present.
    if (!coverage) {
      ctx.addIssue({
        code: 'custom',
        path: ['coverage_map'],
        message: 'Gate 19a: coverage_map is required when assessment is authored.',
      });
    }

    // Gate 20d — q_ids unique.
    const dupQ = [...new Set(qIds.filter((id, i) => qIds.indexOf(id) !== i))];
    if (dupQ.length > 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['assessment', 'questions'],
        message: `Gate 20d: duplicate q_id(s): ${dupQ.join(', ')}.`,
      });
    }

    questions.forEach((q, i) => {
      // Gate 19b — teaches_state must be a real EPIC-L state.
      if (!stateIds.has(q.teaches_state)) {
        ctx.addIssue({
          code: 'custom',
          path: ['assessment', 'questions', i, 'teaches_state'],
          message: `Gate 19b: teaches_state "${q.teaches_state}" is not a state in epic_l_path.states.`,
        });
      }
      // Gate 19f — teaches_state must agree with coverage_map placement.
      if (!(byState[q.teaches_state] ?? []).includes(q.q_id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['assessment', 'questions', i, 'teaches_state'],
          message: `Gate 19f: ${q.q_id}.teaches_state="${q.teaches_state}" but coverage_map.by_state["${q.teaches_state}"] does not list ${q.q_id}.`,
        });
      }
      // Gate 20a — every wrong option has a misconception; correct is NOT a key.
      const map = q.distractor_misconceptions ?? {};
      for (const letter of letters) {
        if (letter === q.correct) {
          if (letter in map) {
            ctx.addIssue({
              code: 'custom',
              path: ['assessment', 'questions', i, 'distractor_misconceptions'],
              message: `Gate 20a: correct option ${letter} must NOT appear in distractor_misconceptions for ${q.q_id}.`,
            });
          }
        } else if (!map[letter]) {
          ctx.addIssue({
            code: 'custom',
            path: ['assessment', 'questions', i, 'distractor_misconceptions'],
            message: `Gate 20a: wrong option ${letter} of ${q.q_id} has no distractor_misconception.`,
          });
        }
      }
    });

    // Gate 19c — by_state keys are real states; listed q_ids are real.
    for (const [sid, qs] of Object.entries(byState)) {
      if (!stateIds.has(sid)) {
        ctx.addIssue({
          code: 'custom',
          path: ['coverage_map', 'by_state'],
          message: `Gate 19c: coverage_map.by_state key "${sid}" is not a real EPIC-L state.`,
        });
      }
      for (const qid of qs) {
        if (!qIds.includes(qid)) {
          ctx.addIssue({
            code: 'custom',
            path: ['coverage_map', 'by_state', sid],
            message: `Gate 19c: coverage_map lists unknown question "${qid}" under ${sid}.`,
          });
        }
      }
    }

    // Gate 19d — recompute orphan states (no question AND not declared non_assessed).
    const coveredStates = new Set(
      Object.entries(byState).filter(([, qs]) => qs.length > 0).map(([sid]) => sid),
    );
    const orphans = [...stateIds].filter(
      (sid) => !coveredStates.has(sid) && !nonAssessed.has(sid),
    );
    if (orphans.length > 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['coverage_map'],
        message: `Gate 19d: state(s) ${orphans.join(', ')} are neither assessed nor declared in non_assessed_states.`,
      });
    }

    // Gate 19e — recompute uncovered questions (never placed in any by_state list).
    const placedQ = new Set(Object.values(byState).flat());
    const uncovered = qIds.filter((id) => !placedQ.has(id));
    if (uncovered.length > 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['assessment', 'questions'],
        message: `Gate 19e: question(s) ${uncovered.join(', ')} are not placed in coverage_map.by_state.`,
      });
    }

    // Gate 20b — >= 3 distinct tested_idea.
    const ideas = new Set(questions.map((q) => q.tested_idea));
    if (ideas.size < 3) {
      ctx.addIssue({
        code: 'custom',
        path: ['assessment', 'questions'],
        message: `Gate 20b: quiz spans only ${ideas.size} distinct tested_idea(s); need >= 3.`,
      });
    }

    // Gate 20c — if aha_moment authored, >= 1 question teaches the aha state.
    if (data.aha_moment) {
      const ahaStateId = data.aha_moment.state_id;
      if (!questions.some((q) => q.teaches_state === ahaStateId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['assessment', 'questions'],
          message: `Gate 20c: no question maps to the aha_moment state "${ahaStateId}".`,
        });
      }
    }
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
