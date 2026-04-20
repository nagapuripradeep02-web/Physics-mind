// src/lib/jsonModifier.ts
// Runs between Brief Writer (Stage 1) and Config Writer (Stage 2).
// Takes the Master JSON + student confusion data + Brief output.
// Produces a SimulationJSON with emphasis adapted for this student's confusion.
// Never modifies locked_facts. Only modifies simulation strategy fields.

import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { loadConstants } from "@/lib/physics_constants/index";
import type { EpicState1 } from "./epicStateBuilder";
import type { ConceptScope } from "./studentContext";

export interface JsonModifierInput {
  masterJson: Record<string, unknown>        // full constants JSON for this concept
  studentBelief: string | null               // from student_confusion_log
  simulationEmphasis: string | null          // from student_confusion_log
  epicState1: EpicState1                     // already built
  briefSummary: string                       // key_insight_to_show from Brief
  conceptId: string                          // concept_id for DB lookup
  scope?: ConceptScope                       // micro|local|global — affects max_states
}

export interface TechnologyConfig {
  panel_count: number                        // from concept_panel_config
  technology_a: string                       // e.g. 'p5js', 'canvas2d', 'threejs'
  technology_b: string | null                // null for single-panel
  sync_required: boolean                     // from concept_panel_config
  renderer_a: string                         // e.g. 'circuit_live'
  renderer_b: string | null
}

export interface PanelAssignment {
  primary_panel: 'panel_a' | 'panel_b'
  panel_a_emphasis: string
  panel_b_emphasis: string | null
  panel_a_state_3_focus: string
  panel_b_state_3_focus: string | null
}

export interface ModifiedSimulationJson {
  concept_id: string
  locked_facts: unknown                      // copied unchanged from masterJson
  simulation_strategy: {
    primary_emphasis: string                 // what the simulation MUST show above all else
    state_3_focus: string                    // what STATE_3 climax must demonstrate
    misconception_being_targeted: string     // exact wrong belief in one sentence
    correct_replacement: string              // exact correct physics in one sentence
    interactive_variables: string[]          // which variables student can manipulate
    max_states?: number                      // scope-aware state cap
    scope_instruction?: string              // scope-specific guidance for config writer
  }
  renderer_hint: unknown                     // copied from masterJson if present
  aha_moment: unknown                        // from Brief, not from masterJson
  is_epic_c: boolean                         // true when student_belief is present
  technology_config: TechnologyConfig        // Phase 6: panel/technology routing
  panel_assignment: PanelAssignment          // Phase 6: per-panel emphasis
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ---------------------------------------------------------------------------
// fetchTechnologyConfig — Supabase lookup for concept_panel_config
// ---------------------------------------------------------------------------

async function fetchTechnologyConfig(conceptId: string): Promise<TechnologyConfig> {
  // Last-resort default. Only returned when BOTH the Supabase DB row AND the
  // concept JSON's renderer_pair are unavailable — in which case the pipeline
  // will log a warning and every concept without declared routing will route
  // to particle_field. That used to happen silently; now it's a signal.
  const defaultConfig: TechnologyConfig = {
    panel_count: 1,
    technology_a: 'canvas2d',
    technology_b: null,
    sync_required: false,
    renderer_a: 'particle_field',
    renderer_b: null,
  };

  try {
    const { data: panelRow } = await supabaseAdmin
      .from('concept_panel_config')
      .select(
        'panel_a_renderer, panel_b_renderer, technology_a, ' +
        'technology_b, default_panel_count, sync_required'
      )
      .eq('concept_id', conceptId)
      .single();

    if (panelRow) {
      const row = panelRow as unknown as Record<string, unknown>;
      return {
        panel_count: (row.default_panel_count as number) ?? 1,
        technology_a: (row.technology_a as string) ?? 'canvas2d',
        technology_b: (row.technology_b as string | null) ?? null,
        sync_required: (row.sync_required as boolean) ?? false,
        renderer_a: (row.panel_a_renderer as string) ?? 'particle_field',
        renderer_b: (row.panel_b_renderer as string | null) ?? null,
      };
    }
  } catch {
    // fall through to JSON-fallback below
  }

  // JSON-fallback: read renderer_pair.panel_a from src/data/concepts/<id>.json.
  // This matters when a concept JSON exists but no concept_panel_config row
  // has been inserted for it — without this, every such concept silently
  // routes to particle_field and Stage 2 fabricates a broken sim.
  try {
    const constants = await loadConstants(conceptId);
    const rendererPair = (constants as Record<string, unknown> | null)?.renderer_pair as
      | { panel_a?: string; panel_b?: string | null }
      | undefined;
    if (rendererPair?.panel_a) {
      const panelB = rendererPair.panel_b ?? null;
      console.warn(
        `[jsonModifier] No concept_panel_config row for "${conceptId}" — ` +
          `using renderer_pair from JSON (panel_a=${rendererPair.panel_a}, panel_b=${panelB}). ` +
          `Insert a row into concept_panel_config to remove this warning.`,
      );
      return {
        panel_count: panelB ? 2 : 1,
        technology_a: 'canvas2d',
        technology_b: panelB ? 'canvas2d' : null,
        sync_required: false,
        renderer_a: rendererPair.panel_a,
        renderer_b: panelB,
      };
    }
  } catch {
    // fall through to the absolute default
  }

  console.warn(
    `[jsonModifier] No concept_panel_config row AND no concept JSON renderer_pair ` +
      `for "${conceptId}" — falling back to particle_field. This will likely produce ` +
      `a broken sim.`,
  );
  return defaultConfig;
}

// ---------------------------------------------------------------------------
// fetchPanelAssignment — Sonnet decides panel emphasis (EPIC-C + dual only)
// ---------------------------------------------------------------------------

async function fetchPanelAssignment(
  studentBelief: string,
  simulationEmphasis: string | null,
  technologyConfig: TechnologyConfig,
): Promise<PanelAssignment> {
  const systemPrompt = `You are deciding simulation panel emphasis for a physics tutoring app.
You receive: the student's specific confusion, the simulation_emphasis,
and the two panels available (renderer + technology for each).

Output ONLY valid JSON with these exact keys:
{
  "primary_panel": "panel_a" or "panel_b",
  "panel_a_emphasis": "one sentence describing what Panel A must show",
  "panel_b_emphasis": "one sentence describing what Panel B must show",
  "panel_a_state_3_focus": "the specific visual at STATE_3 climax for Panel A",
  "panel_b_state_3_focus": "the specific visual at STATE_3 climax for Panel B"
}

primary_panel is the panel that directly addresses the student's confusion.
STATE_3 is the climax state — the moment of maximum understanding.
Keep each field under 80 characters.
No preamble. No markdown. JSON only.`;

  const userMessage = `Student confusion: ${studentBelief}
Simulation emphasis: ${simulationEmphasis ?? 'general concept demonstration'}
Panel A: ${technologyConfig.renderer_a} (${technologyConfig.technology_a})
Panel B: ${technologyConfig.renderer_b} (${technologyConfig.technology_b})`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });
    const text = (message.content[0] as { type: "text"; text: string }).text;
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as PanelAssignment;

    console.log('[jsonModifier] primary_panel:', parsed.primary_panel);
    console.log('[jsonModifier] panel_a_emphasis:', parsed.panel_a_emphasis?.slice(0, 80));
    if (parsed.panel_b_emphasis) {
      console.log('[jsonModifier] panel_b_emphasis:', parsed.panel_b_emphasis?.slice(0, 80));
    }

    return parsed;
  } catch (e) {
    console.warn('[jsonModifier] panel_assignment Sonnet call failed, using default:', e instanceof Error ? e.message : String(e));
    return {
      primary_panel: 'panel_a',
      panel_a_emphasis: simulationEmphasis ?? 'Show the core concept',
      panel_b_emphasis: null,
      panel_a_state_3_focus: simulationEmphasis ?? '',
      panel_b_state_3_focus: null,
    };
  }
}

// ---------------------------------------------------------------------------
// runJsonModifier — main export
// ---------------------------------------------------------------------------

export async function runJsonModifier(
  input: JsonModifierInput
): Promise<ModifiedSimulationJson> {

  const { masterJson, studentBelief, simulationEmphasis, epicState1, briefSummary, conceptId, scope } = input;

  // ── Scope-aware state count ──
  const effectiveScope = scope ?? 'local';
  let max_states: number;
  let scope_instruction: string | undefined;

  if (effectiveScope === 'micro') {
    max_states = 2;
    scope_instruction = 'Focus ONLY on the specific element the student asked about. Maximum 2 states. Do not explain the full concept.';
    console.log('[MODIFIER] micro mode — max 2 states');
  } else if (effectiveScope === 'global') {
    max_states = 6;
    scope_instruction = undefined; // EPIC-L path handles this
    console.log('[MODIFIER] global scope — EPIC-L path, no modification');
  } else if (effectiveScope === 'local') {
    max_states = 3;
    scope_instruction = undefined;
    console.log('[MODIFIER] local/branch mode — max 3 states');
  } else {
    max_states = 6;
    scope_instruction = undefined;
    console.log('[MODIFIER] fallback scope — max 6 states');
  }

  console.log('[MODIFIER] scope:', effectiveScope, '| max_states:', max_states);

  // ── 3A: Fetch technology_config from Supabase (runs before EPIC branching) ──
  const technology_config = await fetchTechnologyConfig(conceptId);
  console.log('[jsonModifier] technology_config:', JSON.stringify(technology_config));

  // Default panel_assignment — used for EPIC-L and single-panel concepts
  const defaultPanelAssignment: PanelAssignment = {
    primary_panel: 'panel_a',
    panel_a_emphasis: simulationEmphasis ?? briefSummary,
    panel_b_emphasis: null,
    panel_a_state_3_focus: simulationEmphasis ?? '',
    panel_b_state_3_focus: null,
  };

  // If scope is global — return master JSON as-is (EPIC-L path, no modification)
  // Also EPIC-L for no confusion
  if (effectiveScope === 'global' || !studentBelief || epicState1.type === 'BASELINE_NO_CURRENT') {
    return {
      concept_id: String(masterJson.concept_id ?? masterJson.concept ?? ''),
      locked_facts: masterJson.locked_facts,
      simulation_strategy: {
        primary_emphasis: briefSummary,
        state_3_focus: 'Demonstrate the core concept clearly',
        misconception_being_targeted: 'none',
        correct_replacement: briefSummary,
        interactive_variables: [],
        max_states,
        scope_instruction,
      },
      renderer_hint: masterJson.renderer_hint ?? null,
      aha_moment: masterJson.aha_moment ?? null,
      is_epic_c: false,
      technology_config,
      panel_assignment: defaultPanelAssignment,
    };
  }

  // EPIC-C path — call Sonnet to adapt the master JSON for this confusion
  const systemPrompt = `You are a physics pedagogy expert. You receive a Master JSON containing locked physics facts for a concept, and a student's specific wrong belief.

Your job: produce a ModifiedSimulationJson that tells the Config Writer exactly what to emphasise in this simulation to break the student's specific wrong belief.

RULES:
1. NEVER modify or remove anything inside locked_facts. Copy it exactly.
2. NEVER invent physics facts. Only reorganise emphasis.
3. simulation_strategy.primary_emphasis must reference simulation_emphasis directly.
4. state_3_focus must describe the exact visual moment that breaks the student_belief.
5. misconception_being_targeted must be one sentence max — the student's exact belief.
6. correct_replacement must be one sentence max — the NCERT correct answer.
7. Output valid JSON only. No markdown. No explanation.`;

  const userMessage = `MASTER JSON FOR CONCEPT:
${JSON.stringify(masterJson, null, 2)}

STUDENT WRONG BELIEF:
${studentBelief}

SIMULATION EMPHASIS (what the simulation must show):
${simulationEmphasis}

BRIEF SUMMARY:
${briefSummary}

Produce a ModifiedSimulationJson following the schema exactly.
Copy locked_facts unchanged. Build simulation_strategy around the student's specific confusion. is_epic_c must be true.

Output JSON schema:
{
  "concept_id": "<string>",
  "locked_facts": <copied from master JSON exactly>,
  "simulation_strategy": {
    "primary_emphasis": "<what the simulation MUST show above all else>",
    "state_3_focus": "<what STATE_3 climax must demonstrate>",
    "misconception_being_targeted": "<exact wrong belief in one sentence>",
    "correct_replacement": "<exact correct physics in one sentence>",
    "interactive_variables": ["<variable1>", "<variable2>"]
  },
  "renderer_hint": <copied from master JSON if present, else null>,
  "aha_moment": null,
  "is_epic_c": true
}`;

  // ── 3B: Panel assignment decision (EPIC-C + dual-panel only) ──
  let panel_assignment: PanelAssignment;
  if (technology_config.panel_count > 1) {
    panel_assignment = await fetchPanelAssignment(studentBelief, simulationEmphasis, technology_config);
  } else {
    panel_assignment = defaultPanelAssignment;
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });
    const text = (message.content[0] as { type: "text"; text: string }).text;

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const modified = JSON.parse(cleaned) as Omit<ModifiedSimulationJson, 'technology_config' | 'panel_assignment'>;
    console.log('[jsonModifier] ✅ modified for belief:', studentBelief?.slice(0, 60));
    return {
      ...modified,
      simulation_strategy: {
        ...modified.simulation_strategy,
        max_states,
        scope_instruction,
      },
      technology_config,
      panel_assignment,
    };
  } catch (e) {
    // Fallback — return master JSON unwrapped if parse or API fails
    console.warn('[jsonModifier] ⚠️ failed, using master JSON fallback:', e instanceof Error ? e.message : String(e));
    return {
      concept_id: String(masterJson.concept_id ?? masterJson.concept ?? ''),
      locked_facts: masterJson.locked_facts,
      simulation_strategy: {
        primary_emphasis: simulationEmphasis ?? briefSummary,
        state_3_focus: simulationEmphasis ?? '',
        misconception_being_targeted: studentBelief ?? '',
        correct_replacement: briefSummary,
        interactive_variables: [],
        max_states,
        scope_instruction,
      },
      renderer_hint: masterJson.renderer_hint ?? null,
      aha_moment: null,
      is_epic_c: true,
      technology_config,
      panel_assignment,
    };
  }
}
