/**
 * StudentContext — the unified output of the Universal Input Understanding Layer.
 * Every student input (text, image, image+text, marked area) produces ONE of these
 * before any simulation or explanation is generated.
 */

export type InputType =
  | 'text_only'
  | 'image_only'
  | 'image_with_text'
  | 'image_with_marked_area'

export type StudentIntent =
  | 'full_explanation'   // explain the whole concept
  | 'specific_confusion' // student has a targeted confusion
  | 'problem_solving'    // solve this numerically
  | 'hypothetical'       // what if X happened
  | 'belief_check'       // student checking if their mental model is right
  | 'error_diagnosis'    // student wants to know where they went wrong
  | 'comparison'         // student comparing X vs Y
  | 'continuation'       // student asking a follow-up
  | 'unknown'            // fallback

export type ConceptScope = 'micro' | 'local' | 'global'

export interface StudentContext {
  input_type: InputType
  source: 'ncert' | 'non_ncert' | 'unknown'
  concept_id: string            // maps to physics_concept_map
  chapter: string               // e.g. "Current Electricity"
  intent: StudentIntent
  specific_focus: string        // e.g. "why current splits at junction"
  original_question: string     // raw student text
  image_description?: string    // what Flash Vision extracted
  marked_area_description?: string // what student pointed at
  confidence: number            // 0-1
  scope: ConceptScope           // micro|local|global — how much of the concept the student needs
  simulation_needed: boolean    // whether this question needs a visual simulation
  concept_name_mismatch?: boolean      // Flash Vision concept_id differs from student's stated concept
  student_stated_concept?: string      // concept the student mentioned in their text

  // 6-Question Pipeline additions
  action?: 'PROCEED' | 'CLARIFY' | 'DIAGNOSE_ERROR' | 'OUT_OF_SCOPE' | 'ACKNOWLEDGE_EMOTION'
  emotional_state?: 'neutral' | 'frustrated' | 'distressed'
  exam_mode?: 'conceptual' | 'board' | 'competitive' | null
  entry_point?: string | null
  clarifying_question?: string | null
}
