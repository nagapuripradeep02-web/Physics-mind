import fs from 'fs';
import path from 'path';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { StudentContext } from './studentContext';
import { extractConceptFromImage } from './aiSimulationGenerator';
import { supabaseAdmin } from './supabaseAdmin';
import { lookupRoutingSignal } from './routingSignalLookup';

async function logStudentConfusion(data: {
  session_id: string;
  confusion_text: string;
  extracted_concept_id: string;
  extracted_intent: string;
  image_uploaded: boolean;
  confidence_score: number;
  source_type: string;
  class_level?: string;
  exam_mode?: string;
  input_type?: string;
  raw_question?: string;
  extraction_confidence?: number;
}) {
  try {
    const { error } = await supabaseAdmin.from('student_confusion_log').insert([{
      session_id: data.session_id,
      confusion_text: data.confusion_text,
      extracted_concept_id: data.extracted_concept_id,
      extracted_intent: data.extracted_intent,
      image_uploaded: data.image_uploaded,
      confidence_score: data.confidence_score,
      source_type: data.source_type,
      class_level: data.class_level ?? null,
      exam_mode: data.exam_mode ?? null,
      input_type: data.input_type ?? null,
      raw_question: data.raw_question ?? null,
      extraction_confidence: data.extraction_confidence ?? null,
    }]);
    if (error) console.error("Error logging student confusion:", error);
  } catch (err) {
    console.error("Exception logging student confusion:", err);
  }
}


const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
});

// Load the universal prompt
const UNIVERSAL_PROMPT_PATH = path.join(process.cwd(), 'src/prompts/universal_input_understanding.txt');
const universalPromptTemplate = fs.readFileSync(UNIVERSAL_PROMPT_PATH, 'utf-8');

interface UniversalInputArgs {
  text?: string;
  imageBase64?: string;
  imageMediaType?: string;
  imageDescription?: string;
  markedRegion?: string;
  sessionId?: string;
  extractedConceptId?: string; // Flash Vision concept_id already extracted in route.ts
  classLevel?: string;
  examMode?: string;
}

// Maps keywords in student text to known concept_ids for mismatch detection
const CONCEPT_KEYWORD_MAP: Record<string, string> = {
  'joule':             'electric_power_heating',
  'joule heat':        'electric_power_heating',
  'heat produced':     'electric_power_heating',
  'thermal energy':    'electric_power_heating',
  'p = i2r':           'electric_power_heating',
  'p=i2r':             'electric_power_heating',
  'i squared':         'electric_power_heating',
  'ohm':               'ohms_law',
  'ohms law':          'ohms_law',
  'v = ir':            'ohms_law',
  'v=ir':              'ohms_law',
  'drift':             'drift_velocity',
  'drift velocity':    'drift_velocity',
  'kirchhoff':         'kirchhoffs_laws',
  'kcl':               'kirchhoffs_current_law',
  'kvl':               'kirchhoffs_voltage_law',
  'resistivity':       'resistivity',
  'rho':               'resistivity',
  'internal resistance': 'emf_internal_resistance',
  'emf':               'emf_internal_resistance',
  'terminal voltage':  'emf_internal_resistance',
  'potentiometer':     'potentiometer',
  'wheatstone':        'wheatstone_bridge',
  'meter bridge':      'meter_bridge',
  'series resist':     'series_resistance',
  'parallel resist':   'parallel_resistance',
};

function extractConceptMentionFromText(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [keyword, conceptId] of Object.entries(CONCEPT_KEYWORD_MAP)) {
    if (lower.includes(keyword)) return conceptId;
  }
  return null;
}

export interface UniversalOutput {
  context: StudentContext;
}

/**
 * Main entry point for the Universal Input Understanding Layer.
 * Processes any combination of text, image, and marked region.
 */
export async function buildStudentContext({
  text = '',
  imageBase64,
  imageMediaType,
  imageDescription = '',
  markedRegion,
  sessionId,
  extractedConceptId,
  classLevel,
  examMode,
}: UniversalInputArgs): Promise<UniversalOutput> {
  const model = google('models/gemini-2.5-flash');

  if (imageBase64 && !imageDescription) {
    // 1. Get a raw description of the image using the existing Flash Vision function
    // (extractConceptFromImage happens to just return structured text about what it sees)
    const extractionResult = await extractConceptFromImage(imageBase64, imageMediaType || '');
    if (extractionResult) {
      imageDescription = extractionResult.diagram_description || 'An image provided by the student.';
    }
    // Could also append extracted concept but let the universal prompt decide from the pure vision desc
  }

  // 2. Build the exact input string for the prompt
  let studentInputText = '';
  if (text) {
    studentInputText += `TEXT: "${text}"\n`;
  }
  if (imageDescription) {
    studentInputText += `IMAGE_DESCRIPTION: "${imageDescription}"\n`;
  }
  if (markedRegion) {
    studentInputText += `MARKED_REGION: "${markedRegion}"\n`;
  }

  if (!studentInputText.trim()) {
    // Edge case: literally nothing was sent. Shouldn't happen in UI.
    studentInputText = `TEXT: "help"`;
  }

  const finalPrompt = universalPromptTemplate.replace('{STUDENT_INPUT}', studentInputText.trim());

  // 3. Call Gemini 2.5 Flash to parse into the unified StudentContext
  try {
    const { text: resultText } = await generateText({
      model,
      prompt: finalPrompt,
    });

    // Clean up potential markdown formatting from the response
    const jsonStrMatch = resultText.match(/\{[\s\S]*\}/);
    const rawJsonStr = jsonStrMatch ? jsonStrMatch[0] : resultText;
    const context: StudentContext = JSON.parse(rawJsonStr);

    // 3b. Set scope + simulation_needed defaults if Flash did not return them
    if (!context.scope) context.scope = 'local';
    if (context.simulation_needed === undefined || context.simulation_needed === null) {
      context.simulation_needed = true;
    }
    console.log('[SCOPE]', context.scope, '| sim_needed:', context.simulation_needed);

    // 3c. Routing signal override — check concept_routing_signals for trigger phrase matches
    const routingOverride = await lookupRoutingSignal(text, context.concept_id);
    if (routingOverride.matched) {
      if (routingOverride.scope) context.scope = routingOverride.scope;
      if (routingOverride.simulation_needed !== undefined) context.simulation_needed = routingOverride.simulation_needed;
      console.log('[ROUTING_OVERRIDE]', context.scope, '| sim_needed:', context.simulation_needed);
    }

    // 4. Concept name mismatch check — Flash Vision vs student's stated concept
    if (imageBase64 && text && extractedConceptId && extractedConceptId !== 'unknown') {
      const studentMentionedConcept = extractConceptMentionFromText(text);
      if (studentMentionedConcept && studentMentionedConcept !== extractedConceptId) {
        console.log(`[ConceptVerify] Mismatch: student said "${studentMentionedConcept}" but image shows "${extractedConceptId}"`);
        context.concept_name_mismatch = true;
        context.student_stated_concept = studentMentionedConcept;
      }
    }

    // Fire and forget logging
    await logStudentConfusion({
      session_id: sessionId || '',
      confusion_text: studentInputText,
      extracted_concept_id: context.concept_id,
      extracted_intent: context.intent,
      image_uploaded: !!imageBase64,
      confidence_score: context.confidence,
      source_type: 'universal_input',
      class_level: classLevel,
      exam_mode: examMode,
      input_type: context.input_type,
      raw_question: text || undefined,
      extraction_confidence: context.confidence,
    });

    return { context };

  } catch (error) {
    console.error("Error in buildStudentContext:", error);
    // Fallback to a safe unknown state requiring clarification
    const fallbackContext: StudentContext = {
      input_type: imageBase64 ? (text ? 'image_with_text' : 'image_only') : 'text_only',
      source: 'unknown',
      concept_id: 'unknown',
      chapter: 'unknown',
      intent: 'unknown',
      specific_focus: '',
      original_question: text,
      image_description: imageDescription,
      marked_area_description: markedRegion,
      confidence: 0,
      scope: 'local',
      simulation_needed: true,
    };
    return { context: fallbackContext };
  }
}
