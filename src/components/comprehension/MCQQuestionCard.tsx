/**
 * Single MCQ question UI. Renders question + 4 options. On select, locks the
 * answer and shows correct/incorrect feedback + correct_explanation. Parent
 * calls onAnswered with the result.
 *
 * Spec: physics-mind/docs/COMPREHENSION_METRIC.md §6
 */
"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, X } from "lucide-react";
import type { QuizQuestion, QuizOption } from "@/app/api/comprehension/quiz/[concept_id]/route";

interface MCQQuestionCardProps {
    question: QuizQuestion;
    questionNumber: number;
    totalQuestions: number;
    onAnswered: (result: {
        questionId: number;
        chosenOption: string;
        isCorrect: boolean;
        timeToAnswerMs: number;
    }) => void;
}

export function MCQQuestionCard({
    question,
    questionNumber,
    totalQuestions,
    onAnswered,
}: MCQQuestionCardProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const startedAt = useMemo(() => Date.now(), [question.id]);

    // Reset state when the question changes
    useEffect(() => {
        setSelectedId(null);
        setSubmitted(false);
    }, [question.id]);

    const correctOption = question.options.find((o) => o.is_correct);
    const isCorrect = !!(selectedId && correctOption && selectedId === correctOption.id);

    const handleSelect = (optionId: string) => {
        if (submitted) return;
        setSelectedId(optionId);
        setSubmitted(true);
        const timeToAnswerMs = Date.now() - startedAt;
        const wasCorrect = !!(correctOption && optionId === correctOption.id);
        onAnswered({
            questionId: question.id,
            chosenOption: optionId,
            isCorrect: wasCorrect,
            timeToAnswerMs,
        });
    };

    return (
        <div className="flex flex-col gap-4 p-5 bg-zinc-900 rounded-lg border border-zinc-800">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold">
                <span>
                    Question {questionNumber} of {totalQuestions}
                </span>
                <span className="text-zinc-600">{question.state_id}</span>
            </div>

            <p className="text-base text-zinc-100 leading-relaxed">{question.question_text}</p>

            <div className="flex flex-col gap-2">
                {question.options.map((opt) => (
                    <OptionButton
                        key={opt.id}
                        option={opt}
                        selected={selectedId === opt.id}
                        submitted={submitted}
                        onClick={() => handleSelect(opt.id)}
                    />
                ))}
            </div>

            {submitted && question.correct_explanation && (
                <div
                    className={`text-sm leading-relaxed p-3 rounded-md ${
                        isCorrect
                            ? "bg-emerald-950/40 border border-emerald-800/50 text-emerald-200"
                            : "bg-amber-950/40 border border-amber-800/50 text-amber-200"
                    }`}
                >
                    <div className="font-semibold mb-1">
                        {isCorrect ? "Correct" : "Not quite"}
                    </div>
                    <div>{question.correct_explanation}</div>
                </div>
            )}
        </div>
    );
}

interface OptionButtonProps {
    option: QuizOption;
    selected: boolean;
    submitted: boolean;
    onClick: () => void;
}

function OptionButton({ option, selected, submitted, onClick }: OptionButtonProps) {
    const isCorrectAnswer = option.is_correct;
    const showAsCorrect = submitted && isCorrectAnswer;
    const showAsWrong = submitted && selected && !isCorrectAnswer;

    let classes =
        "flex items-start gap-3 p-3 rounded-md text-left text-sm transition-all border";
    if (showAsCorrect) {
        classes += " bg-emerald-900/30 border-emerald-700 text-emerald-100";
    } else if (showAsWrong) {
        classes += " bg-rose-900/30 border-rose-700 text-rose-100";
    } else if (selected) {
        classes += " bg-blue-900/30 border-blue-700 text-blue-100";
    } else if (submitted) {
        classes += " bg-zinc-900 border-zinc-800 text-zinc-500";
    } else {
        classes +=
            " bg-zinc-950 border-zinc-800 text-zinc-200 hover:bg-zinc-900 hover:border-zinc-700 cursor-pointer";
    }

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={submitted}
            className={classes}
            aria-pressed={selected}
        >
            <span className="font-bold w-6 shrink-0 text-zinc-400">{option.id}.</span>
            <span className="flex-1">{option.text}</span>
            {showAsCorrect && <Check className="w-4 h-4 shrink-0 text-emerald-400" />}
            {showAsWrong && <X className="w-4 h-4 shrink-0 text-rose-400" />}
        </button>
    );
}
