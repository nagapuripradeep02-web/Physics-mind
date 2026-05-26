/**
 * Comprehension MCQ overlay — slides up after simulation completion.
 *
 * Lifecycle:
 *  1. Mount only when isOpen (parent controls visibility based on isComplete).
 *  2. On first open: GET /api/comprehension/quiz/[conceptId], sample 3 questions.
 *  3. Render one MCQQuestionCard at a time. On answer: POST attempt + advance.
 *  4. After last question: render MCQResultSummary.
 *  5. Skip / Close: mark MCQ done for this concept in sessionStorage to suppress re-prompt.
 *
 * Spec: physics-mind/docs/COMPREHENSION_METRIC.md §6 (full UX).
 * Founder decision: students see their own score (§11).
 */
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { X } from "lucide-react";
import { MCQQuestionCard } from "./MCQQuestionCard";
import { MCQResultSummary } from "./MCQResultSummary";
import { useComprehensionAttempt } from "./useComprehensionAttempt";
import { sampleQuestions } from "./sampleQuestions";
import { markMCQShown } from "@/lib/comprehensionSession";
import type { QuizQuestion } from "@/app/api/comprehension/quiz/[concept_id]/route";

interface ComprehensionMCQOverlayProps {
    isOpen: boolean;
    conceptId: string;
    conceptName?: string;
    sessionId: string;
    onClose: () => void;
    onReplay?: () => void;
}

type Phase = "loading" | "no_quiz" | "asking" | "summary" | "error";

export function ComprehensionMCQOverlay({
    isOpen,
    conceptId,
    conceptName,
    sessionId,
    onClose,
    onReplay,
}: ComprehensionMCQOverlayProps) {
    const [phase, setPhase] = useState<Phase>("loading");
    const [sampled, setSampled] = useState<QuizQuestion[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [loadError, setLoadError] = useState<string | null>(null);
    const { submit: submitAttempt } = useComprehensionAttempt();

    // Fetch + sample questions when overlay opens
    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;
        setPhase("loading");
        setLoadError(null);
        setCurrentIdx(0);
        setCorrectCount(0);
        setSampled([]);

        (async () => {
            try {
                const res = await fetch(`/api/comprehension/quiz/${encodeURIComponent(conceptId)}`);
                if (cancelled) return;
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    setLoadError(body.error ?? `HTTP ${res.status}`);
                    setPhase("error");
                    return;
                }
                const body = (await res.json()) as { questions: QuizQuestion[] };
                if (cancelled) return;
                const all = body.questions ?? [];
                if (all.length === 0) {
                    setPhase("no_quiz");
                    return;
                }
                const picked = sampleQuestions(all, 3);
                setSampled(picked);
                setPhase("asking");
            } catch (e: unknown) {
                if (cancelled) return;
                setLoadError(e instanceof Error ? e.message : "Network error");
                setPhase("error");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isOpen, conceptId]);

    const handleAnswered = useCallback(
        async (result: {
            questionId: number;
            chosenOption: string;
            isCorrect: boolean;
            timeToAnswerMs: number;
        }) => {
            const current = sampled[currentIdx];
            if (!current) return;
            if (result.isCorrect) setCorrectCount((c) => c + 1);

            // Fire-and-forget — failures should not block UX
            void submitAttempt({
                sessionId,
                conceptId,
                stateId: current.state_id,
                questionId: result.questionId,
                chosenOption: result.chosenOption,
                isCorrect: result.isCorrect,
                timeToAnswerMs: result.timeToAnswerMs,
            });

            // Brief pause so student reads correct/incorrect feedback before advancing
            setTimeout(() => {
                if (currentIdx + 1 >= sampled.length) {
                    setPhase("summary");
                } else {
                    setCurrentIdx((idx) => idx + 1);
                }
            }, 1500);
        },
        [sampled, currentIdx, sessionId, conceptId, submitAttempt]
    );

    const handleSkip = useCallback(() => {
        markMCQShown(conceptId);
        onClose();
    }, [conceptId, onClose]);

    const handleSummaryClose = useCallback(() => {
        markMCQShown(conceptId);
        onClose();
    }, [conceptId, onClose]);

    const handleRetry = useCallback(() => {
        markMCQShown(conceptId);
        onReplay?.();
        onClose();
    }, [conceptId, onReplay, onClose]);

    const handleEmailSubmit = useCallback(
        (email: string) => {
            // For v1, just log to server alongside next interaction. Phase-2: dedicated endpoint.
            void fetch("/api/comprehension/attempt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionId,
                    user_email: email,
                    concept_id: conceptId,
                    state_id: "EMAIL_CAPTURE",
                    question_id: 0,
                    chosen_option: "email",
                    is_correct: true,
                    time_to_answer_ms: 0,
                }),
            }).catch(() => {
                /* fire-and-forget; ignore failure */
            });
        },
        [sessionId, conceptId]
    );

    const currentQuestion = useMemo(() => sampled[currentIdx], [sampled, currentIdx]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mcq-overlay-title"
        >
            <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-xl sm:rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-zinc-950 border-b border-zinc-800">
                    <h2 id="mcq-overlay-title" className="text-sm font-semibold text-zinc-200">
                        Quick check — answer 3 questions
                    </h2>
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                        aria-label="Skip questions and close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4">
                    {phase === "loading" && (
                        <div className="py-12 text-center text-sm text-zinc-500">Loading questions…</div>
                    )}

                    {phase === "no_quiz" && (
                        <div className="py-12 text-center">
                            <div className="text-sm text-zinc-400 mb-4">
                                Comprehension questions are coming soon for this concept.
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}

                    {phase === "error" && (
                        <div className="py-12 text-center">
                            <div className="text-sm text-rose-400 mb-2">Could not load questions.</div>
                            {loadError && <div className="text-xs text-zinc-500 mb-4">{loadError}</div>}
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}

                    {phase === "asking" && currentQuestion && (
                        <MCQQuestionCard
                            question={currentQuestion}
                            questionNumber={currentIdx + 1}
                            totalQuestions={sampled.length}
                            onAnswered={handleAnswered}
                        />
                    )}

                    {phase === "summary" && (
                        <MCQResultSummary
                            correctCount={correctCount}
                            totalCount={sampled.length}
                            conceptName={conceptName}
                            onRetry={handleRetry}
                            onClose={handleSummaryClose}
                            onEmailSubmit={handleEmailSubmit}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
