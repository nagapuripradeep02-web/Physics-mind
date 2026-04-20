import { supabaseAdmin } from "@/lib/supabaseAdmin";

// ─── Legacy types (kept for backward compatibility with older DB rows) ─────────

export interface ConfusionPattern {
  id: string;
  student_signals: string[];
  confusion: string;
  simulation_must_show: string;
  response_must_address: string;
  aha_visual: string;
}

/** Legacy SimulationState format (older rows in DB) */
export interface SimulationState {
  name: string;
  description: string;
  what_is_visible: string;
}

export interface ConceptMapEntry {
  concept_id: string;
  display_name: string;
  class_level: string;
  chapter: string;
  formula: string | null;
  formula_latex: string | null;
  variables: Record<string, unknown> | null;
  what_if_rules: string[] | null;
  why_rules: string[] | null;
  misconceptions: string[] | null;
  connected_concepts: string[] | null;
  confusion_patterns: ConfusionPattern[] | null;
  visualization_type: string | null;
  simulation_emphasis: string | null;
  simulation_states: SimulationState[] | null;
  exam_relevance: string[] | null;
  difficulty: string | null;
}

// ─── New types (Phase 2+ rows with full structured data) ──────────────────────

export interface VariableMeta {
  symbol: string;
  name: string;
  unit: string;
  min: number;
  max: number;
  default: number;
}

export interface Misconception {
  id: string;
  mvs_phrase: string;
  why_wrong: string;
  trigger_keywords: string[];
  correct_mental_model: string;
  simulation_emphasis: string;
}

/** New SimulationState format used by Phase 2+ rows */
export interface SimulationStep {
  state: string;    // e.g. "STATE_1"
  label: string;    // e.g. "Open circuit"
  what_student_sees: string;
}

export interface ConceptMap {
  concept_id: string;
  display_name: string;
  class_level: string;
  chapter: string;
  subject: string;
  formula: string | null;
  formula_latex: string | null;
  variables: Record<string, VariableMeta> | null;
  misconceptions: Misconception[] | null;
  what_if_rules: Array<{ condition: string; effect: string; formula_ref: string }> | null;
  why_rules: Array<{ rule: string }> | null;
  connected_concepts: string[] | null;
  confusion_patterns: Array<{ pattern_id: string; description: string }> | null;
  visualization_type: string | null;
  simulation_emphasis: string | null;
  simulation_states: SimulationStep[] | null;
  exam_relevance: string[] | null;
  difficulty: string | null;
  related_concepts: string[];
  mvs_verification_question: string | null;
}

export interface MisconceptionDetectionResult {
  detected: boolean;
  misconception_id: string | null;
  mvs_phrase: string | null;
  correct_mental_model: string | null;
  simulation_emphasis: string | null;
}

// Suffixes the classifier appends that don't exist in the concept map
const CLASSIFIER_SUFFIXES = [
  "_definition", "_basic", "_intro", "_overview",
  "_concept", "_explanation", "_meaning", "_formula",
  "_principle", "_working", "_and_working", "_law",
];

function normalizeConceptId(conceptId: string): string {
  let normalized = conceptId;
  for (const suffix of CLASSIFIER_SUFFIXES) {
    if (normalized.endsWith(suffix)) {
      normalized = normalized.slice(0, -suffix.length);
      break;
    }
  }
  return normalized;
}

export async function lookupConceptMap(
  conceptId: string,
  classLevel: string
): Promise<ConceptMapEntry | null> {
  try {
    // 1. Exact match on original concept_id
    const { data: exact } = await supabaseAdmin
      .from("physics_concept_map")
      .select("*")
      .eq("concept_id", conceptId)
      .maybeSingle();

    if (exact) return exact as ConceptMapEntry;

    // 2. Normalized exact match (strips classifier suffixes like _definition)
    const normalized = normalizeConceptId(conceptId);
    if (normalized !== conceptId) {
      console.log(`[conceptMapLookup] normalizing "${conceptId}" → "${normalized}"`);
      const { data: normExact } = await supabaseAdmin
        .from("physics_concept_map")
        .select("*")
        .eq("concept_id", normalized)
        .maybeSingle();

      if (normExact) return normExact as ConceptMapEntry;
    }

    // 3. Partial ilike match — use normalized base for better hit rate
    const base = normalized !== conceptId ? normalized : conceptId;
    const words = base.replace(/_/g, " ").split(" ");
    const searchTerm = words.slice(0, 3).join("_");

    const { data: partial } = await supabaseAdmin
      .from("physics_concept_map")
      .select("*")
      .ilike("concept_id", `%${searchTerm}%`)
      .eq("class_level", classLevel)
      .limit(1)
      .maybeSingle();

    return (partial as ConceptMapEntry) ?? null;
  } catch (err) {
    console.warn("[conceptMapLookup] lookup failed:", err);
    return null;
  }
}

// ─── New Phase 2+ functions ────────────────────────────────────────────────────

/**
 * Fetch a single concept by concept_id, with exact-then-normalized fallback.
 * Returns the full ConceptMap row including new Phase 2 fields.
 */
export async function getConceptMap(conceptId: string): Promise<ConceptMap | null> {
  try {
    const { data: exact } = await supabaseAdmin
      .from("physics_concept_map")
      .select("*")
      .eq("concept_id", conceptId)
      .maybeSingle();

    if (exact) return exact as ConceptMap;

    const normalized = normalizeConceptId(conceptId);
    if (normalized !== conceptId) {
      const { data: norm } = await supabaseAdmin
        .from("physics_concept_map")
        .select("*")
        .eq("concept_id", normalized)
        .maybeSingle();

      if (norm) return norm as ConceptMap;
    }

    return null;
  } catch (err) {
    console.warn("[getConceptMap] failed:", err);
    return null;
  }
}

/**
 * Pure TypeScript keyword match — no AI call, zero cost.
 * Scans student question against all trigger_keywords in the concept's
 * misconceptions array. Returns the first matched misconception.
 */
export async function detectMisconception(
  conceptId: string,
  studentQuestion: string
): Promise<MisconceptionDetectionResult> {
  const notDetected: MisconceptionDetectionResult = {
    detected: false,
    misconception_id: null,
    mvs_phrase: null,
    correct_mental_model: null,
    simulation_emphasis: null,
  };

  try {
    const concept = await getConceptMap(conceptId);
    if (!concept?.misconceptions?.length) return notDetected;

    const question = studentQuestion.toLowerCase();

    for (const m of concept.misconceptions as Misconception[]) {
      if (!m.trigger_keywords?.length) continue;
      const hit = m.trigger_keywords.some((kw) =>
        question.includes(kw.toLowerCase())
      );
      if (hit) {
        return {
          detected: true,
          misconception_id: m.id,
          mvs_phrase: m.mvs_phrase,
          correct_mental_model: m.correct_mental_model,
          simulation_emphasis: m.simulation_emphasis,
        };
      }
    }

    return notDetected;
  } catch (err) {
    console.warn("[detectMisconception] failed:", err);
    return notDetected;
  }
}

/**
 * Returns the related_concepts array for a concept_id.
 * Used for cache similarity matching — if a simulation exists for a related
 * concept, it can be reused with new narration instead of regenerating.
 */
export async function getRelatedConcepts(conceptId: string): Promise<string[]> {
  try {
    const { data } = await supabaseAdmin
      .from("physics_concept_map")
      .select("related_concepts")
      .eq("concept_id", conceptId)
      .maybeSingle();

    return (data as { related_concepts: string[] } | null)?.related_concepts ?? [];
  } catch (err) {
    console.warn("[getRelatedConcepts] failed:", err);
    return [];
  }
}

/**
 * Returns the 4-step simulation_states array for a concept.
 * Used by TeacherPlayer to know what label/narration to show at each state.
 */
export async function getSimulationStates(conceptId: string): Promise<SimulationStep[]> {
  try {
    const { data } = await supabaseAdmin
      .from("physics_concept_map")
      .select("simulation_states")
      .eq("concept_id", conceptId)
      .maybeSingle();

    return (
      (data as { simulation_states: SimulationStep[] } | null)
        ?.simulation_states ?? []
    );
  } catch (err) {
    console.warn("[getSimulationStates] failed:", err);
    return [];
  }
}
