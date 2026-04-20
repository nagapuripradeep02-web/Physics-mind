export const CLARIFICATION_FALLBACKS = {
    conflict: (imageConcept: string, textConcept: string) =>
        `Your image looks like it's about ${imageConcept}, but your question is about ${textConcept}. Which one did you want to focus on?`,

    concept_unclear: (optionA: string, optionB: string) =>
        `Which topic is this about — ${optionA}, ${optionB}, or something else entirely?`,

    intent_unclear: (concept: string) =>
        `I can see this is about ${concept}. Are you trying to understand the concept, or is there a specific part that isn't clicking?`,

    belief_check: (belief: string) =>
        `Just to confirm — you're thinking ${belief}?`,

    emotional_ack_en: () =>
        `That sounds frustrating. What part is confusing you most right now?`,

    emotional_ack_hi: () =>
        `Bahut tough lag raha hai. Kaun sa part sabse zyada confuse kar raha hai?`,
};
