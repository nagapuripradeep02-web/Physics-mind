import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

type ClarificationContext = {
    hasImage: boolean;
    imageDescription?: string;
    markedRegionDescription?: string;
    studentText?: string;
    ambiguity_type?: 'conflict' | 'concept_unclear' | 'intent_unclear' | 'belief_check' | 'emotional_ack';
    concept?: string;
    conflict_details?: {
        image_concept: string;
        text_concept: string;
    };
    language?: 'english' | 'hinglish';
    fallback_fn?: () => string;
};

export async function generateClarificationQuestion(
    ctx: ClarificationContext
): Promise<string> {
    const isHinglish = ctx.language === 'hinglish';
    const fallbackMessage = ctx.fallback_fn ? ctx.fallback_fn() : (isHinglish ? "Kya aap thoda aur detail de sakte ho?" : "Could you clarify what you mean?");

    // If it's a marked region and no specific ambiguity is flagged, use the targeted question fallback but we can still ask Sonnet
    if (ctx.markedRegionDescription && !ctx.ambiguity_type) {
        const snippet = ctx.markedRegionDescription.slice(0, 80);
        return `I can see you've highlighted a specific part — it looks like: "${snippet}". What about this part is confusing you? Are you unsure what it means, why it's true, or how to apply it?`;
    }

    // Build the prompt based on ambiguity type
    let instructions = "";
    if (ctx.ambiguity_type === 'conflict') {
        instructions = `The student's image is about ${ctx.conflict_details?.image_concept}, but their text mentions ${ctx.conflict_details?.text_concept}. Ask them gently which one they want to focus on.`;
    } else if (ctx.ambiguity_type === 'concept_unclear') {
        instructions = `It's unclear what physics concept they are asking about. Their text says: "${ctx.studentText}". Ask them what topic or lesson they are currently studying.`;
    } else if (ctx.ambiguity_type === 'intent_unclear') {
        instructions = `They are asking about ${ctx.concept}. It's unclear what they need to know about it. Ask if they want a full explanation, help with a problem, or have a specific doubt.`;
    } else if (ctx.ambiguity_type === 'belief_check') {
        instructions = `They just asked a confirmation question (belief check): "${ctx.studentText}". Rephrase their question back to them as a confirmation, e.g., "Just to confirm, you want to know if X is true?"`;
    } else if (ctx.ambiguity_type === 'emotional_ack') {
        instructions = `The student is distressed or frustrated: "${ctx.studentText}". Empathize with their struggle briefly, then ask what specific step or concept is blocking them right now.`;
    } else if (ctx.hasImage && !ctx.studentText) {
        instructions = `They uploaded an image showing: "${ctx.imageDescription?.slice(0, 200)}". Ask them what specifically they want to figure out about this image.`;
    } else {
        instructions = `They said: "${ctx.studentText}". Ask them to clarify what they need help with.`;
    }

    const languageInstruction = isHinglish 
        ? "Respond in conversational Hinglish (Hindi written in English alphabet). Keep it natural and friendly, typical of an Indian tutor." 
        : "Respond in simple, friendly English.";

    try {
        const result = await generateText({
            model: google('gemini-2.5-flash'),
            prompt: `You are the intake layer of an AI physics tutor. You need clarification from the student before proceeding.
            
INSTRUCTIONS:
${instructions}

REQUIREMENTS:
- Be very brief (1-2 sentences max).
- End entirely with a question.
- Do NOT answer any physics questions. Do NOT explain anything.
- ${languageInstruction}`,
            maxOutputTokens: 60,
        });
        
        const text = result.text.trim();
        return text ? text : fallbackMessage;
    } catch (err) {
        console.error('[clarification] Flash generation failed:', err);
        return fallbackMessage;
    }
}
