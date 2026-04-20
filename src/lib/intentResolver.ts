import fs from 'fs';
import path from 'path';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { ConceptScope } from './studentContext';
import { lookupRoutingSignal } from './routingSignalLookup';

const GLOBAL_SCOPE_TRIGGERS = [
    "don't understand", "dont understand", "samajh nahi",
    "explain", "what is", "kya hai", "kya hota hai",
];

const MICRO_SCOPE_TRIGGERS = [
    // Greek letter / trig symbol references
    'cosθ', 'sinθ', 'tanθ',
    'cos theta', 'sin theta', 'tan theta',
    // Targeted "this X" patterns — one element of a formula
    'this symbol', 'this variable', 'this term',
    'this sign', 'this constant', 'this letter',
    // Formula-specific one-element queries
    'in the formula', 'formula mein', 'formula me',
    // Follow-up cue + targeted question
    'wait what', 'wait why',
];

const FALLBACK_KEYWORD_MAP: Record<string, string> = {
    'vector': 'vector_addition',
    'projectile': 'projectile_motion',
    'pendulum': 'simple_pendulum',
    'momentum': 'conservation_of_momentum',
    'inertia': 'newtons_laws_overview',
    'friction': 'friction_laws',
    'ohm': 'ohms_law',
    'kirchhoff': 'kirchhoffs_laws',
    'lens': 'convex_lens',
    'gravity': 'acceleration_due_to_gravity_variation',
};

function applyGlobalScopeOverride(text: string, scope: ConceptScope): ConceptScope {
    // Preserve explicit micro — never downgrade a targeted one-symbol query to global
    if (scope === 'micro') return scope;
    const lower = text.toLowerCase();
    if (GLOBAL_SCOPE_TRIGGERS.some(p => lower.includes(p))) {
        return 'global' as ConceptScope;
    }
    return scope;
}

function applyMicroScopeOverride(text: string, scope: ConceptScope): ConceptScope {
    const lower = text.toLowerCase();
    if (MICRO_SCOPE_TRIGGERS.some(p => lower.includes(p))) {
        return 'micro' as ConceptScope;
    }
    return scope;
}

function keywordFallback(input: { studentText: string; conceptId?: string }): IntentResolverResult {
    const lower = input.studentText.toLowerCase();
    let resolvedConcept = input.conceptId ?? '';

    for (const [keyword, concept] of Object.entries(FALLBACK_KEYWORD_MAP)) {
        if (lower.includes(keyword)) {
            resolvedConcept = concept;
            console.log('[IntentResolver] fallback keyword match:', concept);
            break;
        }
    }

    // Micro triggers are most specific — check first, they take precedence over global
    const microScope = applyMicroScopeOverride(input.studentText, 'local' as ConceptScope);
    const scope: ConceptScope = microScope === 'micro'
        ? microScope
        : applyGlobalScopeOverride(input.studentText, 'local' as ConceptScope);
    // Micro scope → student asks about one element, never a full explanation
    const intent: ResolvedIntent = scope === 'micro' ? 'specific_confusion' : 'full_explanation';
    const confidence = resolvedConcept && resolvedConcept !== (input.conceptId ?? '') ? 0.9 : 0.5;

    return {
        intent,
        simulationEmphasis: '',
        resolvedConcept,
        confidence,
        reasoning: 'Keyword fallback after parse failure',
        scope,
        simulation_needed: true,
    };
}

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

const PROMPT_PATH = path.join(process.cwd(), 'src/prompts/intent_resolver.txt');
const systemPrompt = fs.readFileSync(PROMPT_PATH, 'utf-8');

export type ResolvedIntent =
    | 'specific_confusion'
    | 'full_explanation'
    | 'hypothetical'
    | 'derive'
    | 'compare';

export interface IntentResolverResult {
    intent: ResolvedIntent;
    simulationEmphasis: string;
    resolvedConcept: string;
    confidence: number;
    reasoning: string;
    scope: ConceptScope;
    simulation_needed: boolean;
}

export async function resolveStudentIntent(input: {
    studentText: string;
    imageDescription?: string;
    marked_region_description?: string;
    conceptId?: string;
    isImagePresent: boolean;
}): Promise<IntentResolverResult> {
    // Guard: empty/null text with no image context
    if ((!input.studentText || !input.studentText.trim()) && !input.isImagePresent) {
        return {
            intent: 'full_explanation',
            simulationEmphasis: '',
            resolvedConcept: input.conceptId ?? '',
            confidence: 0.3,
            reasoning: 'Empty text with no image — defaulting to full_explanation',
            scope: 'local' as ConceptScope,
            simulation_needed: true,
        };
    }

    const markedRegionBlock = input.marked_region_description
        ? `\nIMPORTANT: The student has annotated a specific region of their image. This annotated region contains: "${input.marked_region_description}". When a student marks a specific region, treat this as specific_confusion intent unless their text clearly indicates otherwise (e.g. "derive this" or "compare these").`
        : '';

    const userContent = [
        `student_text: "${input.studentText}"`,
        input.imageDescription ? `image_description: "${input.imageDescription}"` : '',
        input.conceptId ? `concept_id: "${input.conceptId}"` : '',
        `image_present: ${input.isImagePresent}`,
        markedRegionBlock,
    ]
        .filter(Boolean)
        .join('\n');

    try {
        const { text } = await generateText({
            model: google('gemini-2.5-flash'),
            system: systemPrompt,
            prompt: userContent,
            maxOutputTokens: 200,
        });

        // First parse attempt
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        let parsed: Record<string, unknown> | null = null;
        if (jsonMatch) {
            try { parsed = JSON.parse(jsonMatch[0]); } catch { /* will retry */ }
        }

        // Retry once with stricter prompt if parse failed
        if (!parsed) {
            console.log('[IntentResolver] retry after parse failure');
            const { text: retryText } = await generateText({
                model: google('gemini-2.5-flash'),
                system: systemPrompt + '\nYou must respond with ONLY valid JSON. No markdown, no backticks, no explanation.',
                prompt: userContent,
                maxOutputTokens: 200,
            });
            const jsonMatch2 = retryText.match(/\{[\s\S]*\}/);
            if (jsonMatch2) {
                try { parsed = JSON.parse(jsonMatch2[0]); } catch { /* fall to keyword */ }
            }
        }

        // If both attempts failed, use keyword fallback — never block the pipeline
        if (!parsed) {
            return keywordFallback({ studentText: input.studentText, conceptId: input.conceptId });
        }

        let resolvedScope: ConceptScope = (['micro', 'local', 'global'].includes(parsed.scope as string) ? parsed.scope : 'local') as ConceptScope;
        let resolvedSimNeeded: boolean = typeof parsed.simulation_needed === 'boolean' ? parsed.simulation_needed : true;

        // Micro triggers are most specific — take precedence over global override.
        // e.g. "wait what does cosθ do in the formula" must stay micro even though
        // the LLM may have returned 'local' and global triggers don't match.
        const microOverride = applyMicroScopeOverride(input.studentText, resolvedScope);
        if (microOverride === 'micro') {
            resolvedScope = 'micro' as ConceptScope;
        } else {
            resolvedScope = applyGlobalScopeOverride(input.studentText, resolvedScope);
        }

        console.log('[SCOPE]', resolvedScope, '| sim_needed:', resolvedSimNeeded);

        // Routing signal override — check concept_routing_signals for trigger phrase matches
        const routingOverride = await lookupRoutingSignal(input.studentText, (parsed.resolvedConcept as string) || input.conceptId);
        if (routingOverride.matched) {
            if (routingOverride.scope) resolvedScope = routingOverride.scope;
            if (routingOverride.simulation_needed !== undefined) resolvedSimNeeded = routingOverride.simulation_needed;
            console.log('[ROUTING_OVERRIDE]', resolvedScope, '| sim_needed:', resolvedSimNeeded);
        }

        // Micro scope → student asks about ONE symbol/constant/step.
        // Intent must be specific_confusion by definition — never full_explanation.
        let resolvedIntent: ResolvedIntent = (parsed.intent as ResolvedIntent) ?? 'full_explanation';
        if (resolvedScope === 'micro' && resolvedIntent === 'full_explanation') {
            resolvedIntent = 'specific_confusion';
            console.log('[IntentResolver] micro scope → forcing intent=specific_confusion');
        }

        return {
            intent: resolvedIntent,
            simulationEmphasis: (parsed.simulationEmphasis as string) ?? '',
            resolvedConcept: (parsed.resolvedConcept as string) ?? '',
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
            reasoning: (parsed.reasoning as string) ?? '',
            scope: resolvedScope,
            simulation_needed: resolvedSimNeeded,
        };
    } catch (err: any) {
        console.error('[intentResolver] Error:', err.message);
        // Always resolve — never block
        return keywordFallback({ studentText: input.studentText, conceptId: input.conceptId });
    }
}
