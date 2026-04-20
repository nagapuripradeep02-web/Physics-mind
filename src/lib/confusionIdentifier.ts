import type { ConfusionPattern } from "@/lib/conceptMapLookup";

export interface ConfusionMatch {
  confusion_id: string;
  confidence: number;
  simulation_must_show: string;
  response_must_address: string;
  aha_visual: string;
}

const DEFAULT_MATCH: ConfusionMatch = {
  confusion_id: "general_understanding",
  confidence: 1.0,
  simulation_must_show: "complete concept visualization",
  response_must_address: "full concept explanation",
  aha_visual: "key insight visual for this concept",
};

/**
 * Identifies which confusion pattern best matches the student's question
 * by scoring signal phrase overlap against the full question + recent chat context.
 *
 * Minimum threshold: 0.3 (at least 1 signal phrase matched in context).
 */
export function identifyConfusion(
  studentQuestion: string,
  chatHistory: string[],
  confusionPatterns: ConfusionPattern[] | null | undefined
): ConfusionMatch {
  if (!confusionPatterns || confusionPatterns.length === 0) {
    return DEFAULT_MATCH;
  }

  const fullContext = [studentQuestion, ...chatHistory.slice(-3)]
    .join(" ")
    .toLowerCase();

  let bestMatch: ConfusionPattern | null = null;
  let bestScore = 0;

  for (const pattern of confusionPatterns) {
    const matchCount = (pattern.student_signals || []).filter(signal =>
      fullContext.includes(signal.toLowerCase())
    ).length;

    const signals = pattern.student_signals || [];
    const score = signals.length > 0 ? matchCount / signals.length : 0;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = pattern;
    }
  }

  if (bestScore >= 0.3 && bestMatch) {
    return {
      confusion_id: bestMatch.id,
      confidence: bestScore,
      simulation_must_show: bestMatch.simulation_must_show,
      response_must_address: bestMatch.response_must_address,
      aha_visual: bestMatch.aha_visual,
    };
  }

  return DEFAULT_MATCH;
}
