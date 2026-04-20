"use client";

import { useState, useEffect } from "react";
import { Loader2, ChevronRight, RotateCcw } from "lucide-react";
import type { ChatMessage } from "@/contexts/ChatContext";

interface MCQQuestion {
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
}

const DIFFICULTY_LABELS = [
    { label: "Warm Up 🟢", color: "text-emerald-400 bg-emerald-400/10 border-emerald-500/20" },
    { label: "Warm Up 🟢", color: "text-emerald-400 bg-emerald-400/10 border-emerald-500/20" },
    { label: "Getting There 🟡", color: "text-yellow-400 bg-yellow-400/10 border-yellow-500/20" },
    { label: "Think Harder 🟠", color: "text-orange-400 bg-orange-400/10 border-orange-500/20" },
    { label: "Challenge 🔴", color: "text-red-400 bg-red-400/10 border-red-500/20" },
];

interface CheckUnderstandingTabProps {
    lastTopic: string | null;
    chatMessages: ChatMessage[];
    onGoToCompetitive: () => void;
    examMode: "JEE" | "CBSE";
}

export default function CheckUnderstandingTab({ lastTopic, chatMessages, onGoToCompetitive, examMode }: CheckUnderstandingTabProps) {
    const [questions, setQuestions] = useState<MCQQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [done, setDone] = useState(false);
    const [autoGenTriggered, setAutoGenTriggered] = useState(false);

    // Auto-generate MCQs when tab loads and there are 2+ messages
    useEffect(() => {
        if (!autoGenTriggered && chatMessages.length >= 2 && !loading && questions.length === 0 && lastTopic) {
            setAutoGenTriggered(true);
            generate();
        }
    }, [autoGenTriggered, chatMessages.length, loading, questions.length, lastTopic]);

    const generate = async () => {
        if (!lastTopic) return;
        setLoading(true);
        setQuestions([]);
        setCurrent(0);
        setSelected(null);
        setAnswers([]);
        setDone(false);
        try {
            const res = await fetch("/api/mcqset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    module: lastTopic,
                    examMode,
                    studentClass: "12",
                    board: "CBSE",
                    conceptual: true,
                }),
            });
            const data = await res.json();
            setQuestions(data.questions ?? []);
        } catch (error) {
            console.error("Failed to generate MCQs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (idx: number) => {
        if (selected !== null) return;
        setSelected(idx);
    };

    const handleNext = () => {
        const newAnswers = [...answers, selected];
        setAnswers(newAnswers);
        if (current >= questions.length - 1) {
            setDone(true);
        } else {
            setCurrent(c => c + 1);
            setSelected(null);
        }
    };

    const score = answers.filter((a, i) => a === questions[i]?.correct_index).length;
    const wrongIndices = answers.reduce<number[]>((acc, a, i) => a !== questions[i]?.correct_index ? [...acc, i] : acc, []);
    const weakArea = wrongIndices.length > 0 ? `Q${wrongIndices[0] + 1}: ${questions[wrongIndices[0]]?.question.slice(0, 60)}...` : null;

    /* ── Empty state: no chat messages yet ── */
    if (chatMessages.length < 2) {
        return (
            <div className="flex-1 flex items-center justify-center bg-black">
                <div className="text-center max-w-sm px-6">
                    <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📚</span>
                    </div>
                    <h2 className="text-lg font-semibold text-zinc-200 mb-2">Learn first, then test</h2>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                        Ask about any concept in the <strong className="text-zinc-300">Learn Concept</strong> tab first,
                        then come back here to test yourself.
                        <br className="mt-1" />Your questions will be based on what you just learned.
                    </p>
                </div>
            </div>
        );
    }

    /* ── Generate button ── */
    if (questions.length === 0 && !loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-black">
                <div className="text-center max-w-sm px-6">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🧪</span>
                    </div>
                    <h2 className="text-lg font-semibold text-zinc-100 mb-1">Check Your Understanding</h2>
                    <p className="text-sm text-zinc-500 mb-6">
                        5 conceptual MCQs based on: <span className="text-blue-400 font-medium">{lastTopic}</span>
                    </p>
                    <button onClick={generate} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors">
                        Generate 5 Questions
                    </button>
                </div>
            </div>
        );
    }

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-black">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">Generating questions based on your conversation...</p>
                </div>
            </div>
        );
    }

    /* ── Score card ── */
    if (done) {
        return (
            <div className="flex-1 flex items-center justify-center bg-black px-4">
                <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-7 text-center space-y-5">
                    <div className="text-5xl font-bold text-white">{score}<span className="text-2xl text-zinc-500">/{questions.length}</span></div>
                    <p className="text-lg font-semibold text-zinc-200">
                        {score === 5 ? "Perfect! 🎉" : score >= 3 ? "Good job! 👍" : "Keep practicing! 💪"}
                    </p>
                    <p className="text-zinc-400 text-sm">You got <strong className="text-white">{score}/{questions.length}</strong> correct</p>
                    {weakArea && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-left">
                            <p className="text-xs font-bold text-orange-400 mb-1">Weak area identified</p>
                            <p className="text-xs text-zinc-400">{weakArea}</p>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <button onClick={() => { setQuestions([]); setDone(false); setAnswers([]); }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors">
                            <RotateCcw className="w-4 h-4" />Retry
                        </button>
                        <button onClick={onGoToCompetitive}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
                            Competitive MCQs <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Question ── */
    const q = questions[current];
    const diff = DIFFICULTY_LABELS[current];
    const isCorrect = selected === q.correct_index;

    return (
        <div className="flex-1 overflow-y-auto bg-black px-4 py-6">
            <div className="max-w-2xl mx-auto space-y-5">
                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${diff.color}`}>{diff.label}</span>
                        <span>Question {current + 1} of {questions.length}</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${((current) / questions.length) * 100}%` }} />
                    </div>
                </div>

                {/* Question */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                    <p className="text-zinc-100 font-medium text-sm leading-relaxed">{q.question}</p>
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                    {q.options.map((opt, i) => {
                        const letter = ["A", "B", "C", "D"][i];
                        let style = "border-zinc-800 bg-zinc-900 hover:border-zinc-600 text-zinc-300";
                        if (selected !== null) {
                            if (i === q.correct_index) style = "border-emerald-500 bg-emerald-500/10 text-emerald-300";
                            else if (i === selected) style = "border-red-500 bg-red-500/10 text-red-300";
                            else style = "border-zinc-800 bg-zinc-900 text-zinc-600";
                        }
                        return (
                            <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null}
                                className={`w-full text-left rounded-xl border px-4 py-3.5 flex items-center gap-3 transition-all text-sm ${style}`}>
                                <span className="font-bold text-xs opacity-60 shrink-0">{letter}</span>
                                <span>{opt}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Explanation */}
                {selected !== null && (
                    <div className={`rounded-xl border p-4 text-sm leading-relaxed ${isCorrect ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-red-500/10 border-red-500/30 text-red-300"}`}>
                        <p className="font-bold mb-1">{isCorrect ? "✅ Correct!" : "❌ Incorrect"}</p>
                        <p className="text-zinc-400">{q.explanation}</p>
                    </div>
                )}

                {selected !== null && (
                    <button onClick={handleNext}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                        {current >= questions.length - 1 ? "See Results" : "Next Question"}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
