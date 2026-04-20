/**
 * Detects if a student's text input is too vague to generate
 * a useful response without clarification.
 *
 * "explain this" WITH a marked region or image is NOT vague —
 * those provide context. This function only checks the text itself.
 */
export function isVagueInput(text: string | null | undefined): boolean {
    if (!text || text.trim().length === 0) return true;

    const t = text.trim().toLowerCase();

    // Single characters or punctuation only
    if (t.length <= 2) return true;

    // Explicit vague phrases (English + Hinglish)
    const vaguePatterns = [
        /^(explain|explain this|explain it)$/,
        /^(what is this|what is it|what does this mean)$/,
        /^(i don'?t understand|i don'?t get it|i don'?t get this)$/,
        /^(help|help me|help please|please help)$/,
        /^(what|what\?)$/,
        /^(huh|hmm|\?+)$/,
        /^(ye kya hai|kya hai ye|samajh nahi aaya|samajh nahi|nahi samajha)$/,
        /^(sir|sir\?|bhaiya|bhaiya\?)$/,
        /^(iska matlab kya|iska matlab|matlab kya hai)$/,
    ];

    return vaguePatterns.some(p => p.test(t));
}
