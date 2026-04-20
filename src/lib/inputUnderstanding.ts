import fs from 'fs';
import path from 'path';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { logUsage } from '@/lib/usageLogger';
import { CONCEPT_KEYWORD_MAP } from './conceptKeywordMap';
import { generateClarificationQuestion } from './generateClarificationQuestion';
import { CLARIFICATION_FALLBACKS } from './clarificationFallbacks';
import type { ConceptScope } from './studentContext';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
});

export interface InputUnderstandingArgs {
    studentText: string;
    imageDescription?: string;
    studentWorkDetected?: boolean;
    extractedConceptId?: string;
    flashConfidence?: number;
    markedRegionDescription?: string;
    sessionContext?: {
        current_chapter?: string;
        last_concept?: string;
        exam_mode?: 'conceptual' | 'board' | 'competitive' | null;
        last_misconception?: string;
    };
    sectionMode?: 'conceptual' | 'board' | 'competitive';
}

export type InputAction =
    | 'PROCEED'
    | 'CLARIFY'
    | 'DIAGNOSE_ERROR'
    | 'OUT_OF_SCOPE'
    | 'ACKNOWLEDGE_EMOTION';

export interface InputUnderstandingResult {
    action: InputAction;
    concept_id: string | null;
    intent: string | null;
    specific_aspect: string | null;
    exam_mode: 'conceptual' | 'board' | 'competitive' | null;
    entry_point: string | null;
    conflict_detected: boolean;
    clarifying_question: string | null;
    confidence: number;
    emotional_state: 'neutral' | 'frustrated' | 'distressed';
    reasoning: string;
    scope?: ConceptScope;
}

// ── Prompt template cache ──
let cachedPromptTemplate: string | null = null;

function loadPromptTemplate(): string {
    if (cachedPromptTemplate) return cachedPromptTemplate;
    const promptPath = path.join(process.cwd(), 'src', 'prompts', 'input_understanding.txt');
    cachedPromptTemplate = fs.readFileSync(promptPath, 'utf-8');
    return cachedPromptTemplate;
}

// ── JSON parsing helpers (matches intentClassifier.ts pattern) ──
function extractJsonFromText(text: string): unknown {
    // Tier 1: strip markdown fences and parse directly
    const stripped = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try {
        return JSON.parse(stripped);
    } catch { /* fall through */ }

    // Tier 2: regex extract first JSON object
    const match = stripped.match(/\{[\s\S]*\}/);
    if (match) {
        try {
            return JSON.parse(match[0]);
        } catch { /* fall through */ }
    }

    throw new Error('Could not extract valid JSON from LLM response');
}

const VALID_ACTIONS = new Set(['PROCEED', 'CLARIFY', 'DIAGNOSE_ERROR', 'OUT_OF_SCOPE', 'ACKNOWLEDGE_EMOTION']);
const VALID_INTENTS = new Set(['full_explanation', 'specific_confusion', 'belief_check', 'comparison', 'problem_solve', 'error_diagnosis', 'continuation']);
const VALID_MODES = new Set(['conceptual', 'board', 'competitive']);
const VALID_EMOTIONS = new Set(['neutral', 'frustrated', 'distressed']);

function validateResult(raw: unknown): InputUnderstandingResult {
    if (!raw || typeof raw !== 'object') throw new Error('LLM returned non-object');
    const obj = raw as Record<string, unknown>;

    if (!VALID_ACTIONS.has(obj.action as string)) throw new Error(`Invalid action: ${obj.action}`);

    const action = obj.action as InputAction;
    const concept_id = typeof obj.concept_id === 'string' ? obj.concept_id : null;
    const intent = VALID_INTENTS.has(obj.intent as string) ? (obj.intent as string) : null;
    const specific_aspect = typeof obj.specific_aspect === 'string' ? obj.specific_aspect : null;
    const exam_mode = VALID_MODES.has(obj.exam_mode as string) ? (obj.exam_mode as 'conceptual' | 'board' | 'competitive') : null;
    const entry_point = typeof obj.entry_point === 'string' ? obj.entry_point : null;
    const conflict_detected = obj.conflict_detected === true;
    const clarifying_question = typeof obj.clarifying_question === 'string' ? obj.clarifying_question : null;
    const confidence = typeof obj.confidence === 'number' ? Math.max(0, Math.min(1, obj.confidence)) : 0.5;
    const emotional_state = VALID_EMOTIONS.has(obj.emotional_state as string)
        ? (obj.emotional_state as 'neutral' | 'frustrated' | 'distressed')
        : 'neutral';
    const reasoning = typeof obj.reasoning === 'string' ? obj.reasoning : 'No reasoning provided';

    // Sanity: CLARIFY/ACKNOWLEDGE_EMOTION must have a clarifying_question
    if ((action === 'CLARIFY' || action === 'ACKNOWLEDGE_EMOTION') && !clarifying_question) {
        throw new Error(`Action ${action} requires a clarifying_question but got null`);
    }

    return {
        action, concept_id, intent, specific_aspect, exam_mode,
        entry_point, conflict_detected, clarifying_question,
        confidence, emotional_state, reasoning
    };
}

// ── LLM-based analysis (primary path) ──
async function llmAnalyze(args: InputUnderstandingArgs): Promise<InputUnderstandingResult> {
    const template = loadPromptTemplate();

    const sessionCtxStr = args.sessionContext
        ? JSON.stringify(args.sessionContext, null, 2)
        : 'No session context';

    const prompt = template
        .replace('{{student_message}}', args.studentText || '(no text)')
        .replace('{{image_description}}', args.imageDescription || 'No image provided')
        .replace('{{student_work_detected}}', String(!!args.studentWorkDetected))
        .replace('{{session_context}}', sessionCtxStr)
        .replace('{{marked_region_description}}', args.markedRegionDescription || 'No marked region')
        .replace('{{flash_concept_id}}', args.extractedConceptId || 'none')
        .replace('{{flash_confidence}}', args.flashConfidence != null ? String(args.flashConfidence) : 'N/A')
        .replace('{{section_mode}}', args.sectionMode || 'not set');

    const startMs = Date.now();

    const { text } = await Promise.race([
        generateText({
            model: google('gemini-2.5-flash'),
            prompt,
            temperature: 0.05,
            maxOutputTokens: 1500,
        }),
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Input understanding LLM timeout (20s)')), 20000)
        ),
    ]);

    const latencyMs = Date.now() - startMs;

    console.log('[InputUnderstanding] LLM raw response:', text.slice(0, 300));
    const parsed = extractJsonFromText(text);
    const result = validateResult(parsed);

    // Fire-and-forget usage logging
    logUsage({
        taskType: 'input_understanding',
        provider: 'google',
        model: 'gemini-2.5-flash',
        inputChars: prompt.length,
        outputChars: text.length,
        latencyMs,
        estimatedCostUsd: (prompt.length * 0.15 + text.length * 0.6) / 1_000_000,
        wasCacheHit: false,
    });

    return result;
}

// ══════════════════════════════════════════════════════════════════
// Rule-based fallback (original implementation)
// ══════════════════════════════════════════════════════════════════

const CONCEPT_TO_CHAPTER: Record<string, string> = {
    "ohms_law": "Current Electricity",
    "drift_velocity": "Current Electricity",
    "series_resistance": "Current Electricity",
    "parallel_resistance": "Current Electricity",
    "kirchhoffs_voltage_law": "Current Electricity",
    "kirchhoffs_current_law": "Current Electricity",
    "wheatstone_bridge": "Current Electricity",
    "potentiometer": "Current Electricity",
    "internal_resistance": "Current Electricity",
    "resistivity": "Current Electricity",
    "resistance": "Current Electricity",
};

function extractConceptMentionFromText(text: string): string | null {
    const textLower = text.toLowerCase();
    for (const [phrase, conceptId] of Object.entries(CONCEPT_KEYWORD_MAP)) {
        if (textLower.includes(phrase)) {
            return conceptId;
        }
    }
    return null;
}

function conceptsAreDistinct(conceptA: string, conceptB: string): boolean {
    if (conceptA === conceptB) return false;
    const chapterA = CONCEPT_TO_CHAPTER[conceptA];
    const chapterB = CONCEPT_TO_CHAPTER[conceptB];
    if (chapterA && chapterB && chapterA === chapterB) {
        return false;
    }
    return true;
}

function classifyIntent(textLower: string, hasImage: boolean, studentWorkDetected: boolean, lastConcept?: string) {
    if (
        textLower.includes("is it true") ||
        textLower.includes("right?") ||
        textLower.includes("hota hai na") ||
        textLower.includes("na?") ||
        textLower.includes("correct?") ||
        textLower.includes("so this means") ||
        textLower.match(/\bi think.*happens?\b/)
    ) {
        return { intent: 'belief_check', confidence: 0.92 };
    }

    if (
        textLower.match(/i got.*answer is/) ||
        textLower.includes("mera answer galat kyu") ||
        textLower.includes("where did i go wrong") ||
        textLower.includes("where am i wrong") ||
        textLower.includes("ye kaise galat")
    ) {
        return { intent: 'error_diagnosis', confidence: studentWorkDetected ? 0.95 : 0.85 };
    }

    if (
        textLower.includes("difference between") ||
        textLower.match(/\bvs\b/) ||
        textLower.includes("which one") ||
        textLower.match(/when to use.*vs.*/)
    ) {
        return { intent: 'comparison', confidence: 0.90 };
    }

    if (
        hasImage && (
            textLower.includes("find the") ||
            textLower.includes("calculate") ||
            textLower.includes("solve this") ||
            textLower.includes("numerical")
        )
    ) {
        return { intent: 'problem_solving', confidence: 0.85 };
    }

    if (
        lastConcept && (
            textLower.includes("what about") ||
            textLower.includes("aur ye") ||
            textLower.includes("ye bhi") ||
            textLower.includes("also explain") ||
            textLower.match(/and for this( case)?/)
        )
    ) {
        return { intent: 'continuation', confidence: 0.85 };
    }

    if (
        textLower.includes("why does") ||
        textLower.includes("why is") ||
        textLower.match(/how does.*happen/) ||
        textLower.includes("ye part nahi samjha") ||
        textLower.includes("this step confuses me") ||
        textLower.includes("i don't understand why")
    ) {
        return { intent: 'specific_confusion', confidence: 0.90 };
    }

    // Declarative misconception — student asserting a wrong belief
    // confidently, with no question mark (EPIC-C sub-case 2)
    const declarativeMisconceptionPatterns = [
        /i think .+ is (just like|same as|similar to)/i,
        /i think .+ (must be|should be|equals|=)\s*\d/i,
        /so (r|resultant) must be/i,
        /always thought .+ (is|equals|=)/i,
        /it (must|should) (always )?be \d/i,
    ];
    if (declarativeMisconceptionPatterns.some(p => p.test(textLower))) {
        return { intent: 'specific_confusion', confidence: 0.92 };
    }

    if (
        textLower.includes("explain") ||
        textLower.includes("what is") ||
        textLower.includes("samajhao") ||
        textLower.includes("bata do") ||
        textLower.includes("from scratch") ||
        (!textLower.trim() && hasImage)
    ) {
        return { intent: 'full_explanation', confidence: 0.85 };
    }

    return { intent: 'full_explanation', confidence: 0.50 };
}

function detectEmotion(textLower: string): 'neutral' | 'frustrated' | 'distressed' {
    if (
        textLower.includes("i'll fail") ||
        textLower.includes("give up") ||
        textLower.includes("de diya") ||
        textLower.match(/kuch( bhi)? samajh nahi aata/) ||
        textLower.includes("i can't do this") ||
        textLower.includes("samajh nahi aata kuch bhi") ||
        textLower.includes("mai fail ho jaunga")
    ) {
        return 'distressed';
    }

    if (
        textLower.includes("hours se padh raha") ||
        textLower.includes("teen ghante") ||
        textLower.includes("bahut mushkil") ||
        textLower.includes("still don't get it") ||
        textLower.includes("still samajh nahi") ||
        textLower.includes("again puch raha") ||
        textLower.includes("nahi samajh aa raha")
    ) {
        return 'frustrated';
    }

    return 'neutral';
}

function inferExamMode(textLower: string, sessionMode?: 'conceptual' | 'board' | 'competitive' | null, sectionMode?: 'conceptual' | 'board' | 'competitive'): 'conceptual' | 'board' | 'competitive' | null {
    if (sessionMode) return sessionMode;

    let languageMode: 'conceptual' | 'board' | 'competitive' | null = null;
    if (
        textLower.includes("derive") ||
        textLower.includes("prove") ||
        textLower.includes("jee mein") ||
        textLower.includes("neet mein") ||
        textLower.includes("edge case") ||
        textLower.includes("hc verma") ||
        textLower.includes("dc pandey") ||
        textLower.includes("coaching")
    ) {
        languageMode = 'competitive';
    } else if (
        textLower.includes("steps") ||
        textLower.includes("marks kaise") ||
        textLower.includes("board exam") ||
        textLower.includes("cbse") ||
        textLower.includes("how to write")
    ) {
        languageMode = 'board';
    } else if (
        textLower.includes("explain") ||
        textLower.match(/\bwhy\b/) ||
        textLower.includes("how does") ||
        textLower.includes("samajhao") ||
        textLower.includes("what is") ||
        textLower.includes("kya hota") ||
        textLower.includes("concept")
    ) {
        languageMode = 'conceptual';
    }

    if (sectionMode === 'competitive' && languageMode === 'conceptual') {
        return 'conceptual';
    }

    if (languageMode) return languageMode;
    if (sectionMode) return sectionMode;
    return null;
}

async function ruleBasedAnalyze(args: InputUnderstandingArgs): Promise<InputUnderstandingResult> {
    const textLower = args.studentText.toLowerCase();
    const hasImage = !!args.imageDescription;
    const isVagueText = textLower.split(' ').length <= 3 && !hasImage;

    // Q1: CONFLICT CHECK
    const conceptFromText = extractConceptMentionFromText(textLower);
    const conceptFromImage = args.extractedConceptId && args.extractedConceptId !== 'unknown' ? args.extractedConceptId : null;
    let conflictDetected = false;

    if (conceptFromText && conceptFromImage && conceptFromText !== conceptFromImage) {
        if (conceptsAreDistinct(conceptFromText, conceptFromImage)) {
            conflictDetected = true;
        }
    }

    // Q2: CONCEPT IDENTIFICATION
    let concept_id: string | null = null;
    let conceptConfidence = 0.0;

    if (args.sessionContext?.last_concept && isVagueText) {
        concept_id = args.sessionContext.last_concept;
        conceptConfidence = 0.80;
    } else if (conceptFromImage && (args.flashConfidence || 0) >= 0.80) {
        concept_id = conceptFromImage;
        conceptConfidence = args.flashConfidence!;
    } else if (conceptFromText) {
        concept_id = conceptFromText;
        for (const phrase of Object.keys(CONCEPT_KEYWORD_MAP)) {
            if (textLower.includes(phrase)) {
                conceptConfidence = 0.90;
                break;
            }
        }
        if (conceptConfidence === 0.0) conceptConfidence = 0.75;
    }

    // Q3: INTENT CLASSIFICATION
    const { intent, confidence: intentConfidence } = classifyIntent(textLower, hasImage, !!args.studentWorkDetected, args.sessionContext?.last_concept);

    // Q4: KNOWLEDGE STATE -> ENTRY POINT
    let entry_point: string | null = null;
    if (intent === 'error_diagnosis') {
        entry_point = null;
    } else if (intent === 'belief_check') {
        entry_point = 'EPIC-C';
    } else if (intent === 'full_explanation') {
        entry_point = args.sessionContext?.last_concept ? 'STATE_3' : 'STATE_1';
    } else if (intent === 'specific_confusion') {
        entry_point = 'STATE_2';
    } else if (intent === 'continuation') {
        entry_point = null;
    }

    // Q5: EXAM MODE INFERENCE
    const exam_mode = inferExamMode(textLower, args.sessionContext?.exam_mode, args.sectionMode);

    // Q6: EMOTIONAL STATE
    const emotional_state = detectEmotion(textLower);

    // DECISION RULES
    let action: InputAction = 'PROCEED';
    let clarifying_question: string | null = null;
    let ambiguityType: 'conflict' | 'concept_unclear' | 'intent_unclear' | 'belief_check' | 'emotional_ack' | undefined;
    const language: 'english' | 'hinglish' = textLower.match(/[a-z]+ (raha|hai|kya|kyu|kaun|bhi|hi|samajhao|bata|do|ho|gaya|nahi|matlab)/) ? 'hinglish' : 'english';

    // Short-circuit: concept + intent both known → always PROCEED
    if (
        concept_id &&
        concept_id !== 'unknown' &&
        intent &&
        intent !== 'unknown' &&
        (intent === 'full_explanation' || intent === 'specific_confusion') &&
        !conflictDetected &&
        emotional_state !== 'distressed'
    ) {
        console.log(`[DecisionEngine] Rule-based FORCED PROCEED — concept=${concept_id} intent=${intent}`);
        return {
            action: 'PROCEED',
            concept_id,
            intent,
            specific_aspect: null,
            exam_mode,
            entry_point,
            conflict_detected: false,
            clarifying_question: null,
            confidence: Math.min(conceptConfidence, intentConfidence),
            emotional_state,
            reasoning: `[rule-based] FORCED PROCEED — concept=${concept_id} intent=${intent} both resolved`
        };
    }

    if (emotional_state === 'distressed') {
        action = 'ACKNOWLEDGE_EMOTION';
        ambiguityType = 'emotional_ack';
    } else if (concept_id && ['math', 'chemistry', 'biology', 'history'].includes(concept_id)) {
        action = 'OUT_OF_SCOPE';
        clarifying_question = "PhysicsMind only covers Class 10-12 Physics. I can't help with that subject.";
    } else if (intent === 'error_diagnosis' && (args.studentWorkDetected || textLower.match(/i got.*answer is/))) {
        action = 'DIAGNOSE_ERROR';
    } else if (
        conflictDetected ||
        conceptConfidence < 0.80 ||
        intentConfidence < 0.80 ||
        intent === 'belief_check' ||
        isVagueText
    ) {
        action = 'CLARIFY';
        if (conflictDetected) ambiguityType = 'conflict';
        else if (intent === 'belief_check') ambiguityType = 'belief_check';
        else if (conceptConfidence < 0.80) ambiguityType = 'concept_unclear';
        else ambiguityType = 'intent_unclear';
    }

    if ((action === 'CLARIFY' || action === 'ACKNOWLEDGE_EMOTION') && !clarifying_question) {
        const conflict_details = conflictDetected ? { image_concept: conceptFromImage!, text_concept: conceptFromText! } : undefined;
        let fallback_fn: () => string;

        switch (ambiguityType) {
            case 'conflict':
                fallback_fn = () => CLARIFICATION_FALLBACKS.conflict(conceptFromImage!, conceptFromText!);
                break;
            case 'concept_unclear':
                fallback_fn = () => CLARIFICATION_FALLBACKS.concept_unclear('related topic 1', 'related topic 2');
                break;
            case 'intent_unclear':
                fallback_fn = () => CLARIFICATION_FALLBACKS.intent_unclear(concept_id || 'this topic');
                break;
            case 'belief_check':
                fallback_fn = () => CLARIFICATION_FALLBACKS.belief_check('that');
                break;
            case 'emotional_ack':
                fallback_fn = language === 'hinglish' ? CLARIFICATION_FALLBACKS.emotional_ack_hi : CLARIFICATION_FALLBACKS.emotional_ack_en;
                break;
            default:
                fallback_fn = () => "Could you clarify what you mean?";
        }

        clarifying_question = await generateClarificationQuestion({
            hasImage,
            imageDescription: args.imageDescription,
            markedRegionDescription: args.markedRegionDescription,
            studentText: args.studentText,
            ambiguity_type: ambiguityType,
            concept: concept_id || undefined,
            conflict_details,
            language,
            fallback_fn
        });
    }

    return {
        action,
        concept_id,
        intent,
        specific_aspect: null,
        exam_mode,
        entry_point,
        conflict_detected: conflictDetected,
        clarifying_question,
        confidence: Math.min(conceptConfidence, intentConfidence),
        emotional_state,
        reasoning: `[rule-based] Decided ${action} based on emotion=${emotional_state}, intent=${intent}, conflict=${conflictDetected}`
    };
}

// ══════════════════════════════════════════════════════════════════
// Exported entry point — LLM primary, rule-based fallback
// ══════════════════════════════════════════════════════════════════

export async function analyzeStudentInput(args: InputUnderstandingArgs): Promise<InputUnderstandingResult> {
    let result: InputUnderstandingResult;
    try {
        result = await llmAnalyze(args);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[InputUnderstanding] LLM path failed, falling back to rule-based:', msg);
        result = await ruleBasedAnalyze(args);
    }

    // Short-circuit: if concept and intent are both resolved, never clarify
    if (
        result.action === 'CLARIFY' &&
        result.concept_id &&
        result.concept_id !== 'unknown' &&
        result.intent &&
        result.intent !== 'unknown' &&
        (result.intent === 'full_explanation' ||
         result.intent === 'understand' ||
         result.intent === 'specific_confusion')
    ) {
        result.action = 'PROCEED';
        result.clarifying_question = null;
        console.log('[DecisionEngine] FORCED PROCEED — concept and intent both known');
    }

    // Micro trigger override — CLARIFY→PROCEED for targeted formula questions
    // when concept_id is null but text clearly references one symbol/constant.
    // e.g. "wait what does cosθ do in the formula" → default to vector_addition,
    // scope=micro, so the pipeline doesn't block on a legitimately clear query.
    if (result.action === 'CLARIFY' && !result.concept_id) {
        const lower = args.studentText.toLowerCase();
        const MICRO_TRIGGERS = [
            'cosθ', 'sinθ', 'tanθ', 'cos theta', 'sin theta', 'tan theta',
            'in the formula', 'formula mein', 'formula me',
            'this symbol', 'this variable', 'this term',
            'wait what', 'wait why',
        ];
        const isMicro = MICRO_TRIGGERS.some(t => lower.includes(t));
        if (isMicro) {
            console.log('[InputUnderstanding] CLARIFY→PROCEED override: micro trigger detected');
            result.action = 'PROCEED';
            result.concept_id = 'vector_addition'; // default formula context for Ch.5
            result.scope = 'micro';
            result.clarifying_question = null;
        }
    }

    console.log(`[DecisionEngine] Action=${result.action} concept=${result.concept_id} intent=${result.intent} confidence=${result.confidence}`);
    return result;
}
