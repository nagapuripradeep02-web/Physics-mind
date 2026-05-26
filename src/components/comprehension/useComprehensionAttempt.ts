/**
 * Hook that posts a single MCQ attempt to /api/comprehension/attempt.
 *
 * Spec: physics-mind/docs/COMPREHENSION_METRIC.md §6 + §2.3
 */
import { useCallback, useState } from "react";

interface SubmitArgs {
    sessionId: string;
    conceptId: string;
    stateId: string;
    questionId: number;
    chosenOption: string;
    isCorrect: boolean;
    timeToAnswerMs: number;
    userEmail?: string | null;
}

export function useComprehensionAttempt() {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = useCallback(async (args: SubmitArgs): Promise<boolean> => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch("/api/comprehension/attempt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: args.sessionId,
                    user_email: args.userEmail ?? null,
                    concept_id: args.conceptId,
                    state_id: args.stateId,
                    question_id: args.questionId,
                    chosen_option: args.chosenOption,
                    is_correct: args.isCorrect,
                    time_to_answer_ms: args.timeToAnswerMs,
                }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setError(body.error ?? `HTTP ${res.status}`);
                return false;
            }
            return true;
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Network error");
            return false;
        } finally {
            setSubmitting(false);
        }
    }, []);

    return { submit, submitting, error };
}
