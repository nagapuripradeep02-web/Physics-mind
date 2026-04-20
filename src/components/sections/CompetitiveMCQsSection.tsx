"use client";

import { useState } from "react";
import { Loader2, ChevronRight, RotateCcw, X, BookOpen } from "lucide-react";
import MCQBookmarkButton from "@/components/MCQBookmarkButton";

interface MCQQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty?: string;
    marks?: string;
    exam_tip?: string;
    question_type?: string;
}

interface CompetitiveMCQsSectionProps {
    contextExam?: string;
    contextKeywords?: string[];
    onClearContext?: () => void;
}

export default function CompetitiveMCQsSection({ contextKeywords = [], onClearContext }: CompetitiveMCQsSectionProps) {
    const currentMode = 'board';
    const [questions, setQuestions] = useState<MCQQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [done, setDone] = useState(false);

    const generate = async () => {
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
                    module: "Current Electricity",
                    examMode: "CBSE",
                    studentClass: "12",
                    board: "CBSE",
                    selectedExam: "CBSE Board",
                    mode: currentMode,
                }),
            });
            const data = await res.json();
            setQuestions(data.questions ?? []);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (idx: number) => {
        if (selected !== null) return;
        setSelected(idx);
    };

    const handleNext = () => {
        setAnswers(prev => [...prev, selected]);
        if (current >= questions.length - 1) {
            setDone(true);
        } else {
            setCurrent(c => c + 1);
            setSelected(null);
        }
    };

    const score = answers.filter((a, i) => a === questions[i]?.correctIndex).length;

    /* ── Landing ── */
    if (questions.length === 0 && !loading) {
        return (
            <div className="flex-1 overflow-y-auto bg-black px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-7">
                        <h1 className="text-2xl font-bold text-zinc-100 mb-1">Board Exam Practice</h1>
                        <p className="text-sm text-zinc-500">NCERT-format practice questions for Current Electricity</p>
                    </div>

                    {/* Context banner from conceptual chat */}
                    {contextKeywords.length > 0 && (
                        <div className="mb-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                                    <div>
                                        <p className="text-[13px] font-semibold text-blue-300">Based on your Conceptual chat</p>
                                        <p className="text-[12px] text-zinc-500 mt-0.5">
                                            Questions will focus on: {contextKeywords.slice(0, 3).join(", ")}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={onClearContext} className="text-zinc-600 hover:text-zinc-400 transition-colors shrink-0">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mode badge */}
                    <div className="mb-6 flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                            📋 Board Exam Mode — NCERT format questions
                        </span>
                    </div>

                    {/* Info card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-zinc-300">5 questions · Current Electricity · Class 12</p>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
                                CBSE Board
                            </span>
                        </div>
                        <p className="text-xs text-zinc-600">📝 Questions are in NCERT format with marks allocation</p>
                    </div>

                    <button onClick={generate}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                        Generate Questions <ChevronRight className="w-4 h-4" />
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
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-zinc-400">Generating CBSE Board questions...</p>
                </div>
            </div>
        );
    }

    /* ── Done ── */
    if (done) {
        const weakQ = answers.reduce<string[]>((acc, a, i) => a !== questions[i]?.correctIndex ? [...acc, `Q${i + 1}`] : acc, []);
        return (
            <div className="flex-1 flex items-center justify-center bg-black px-4">
                <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-7 text-center space-y-5">
                    <div className="text-5xl font-bold text-white">{score}<span className="text-2xl text-zinc-500">/{questions.length}</span></div>
                    <p className="text-lg font-semibold text-zinc-200">
                        {score === 5 ? "Excellent! 🚀" : score >= 3 ? "Good attempt! 💪" : "Keep practicing! 📚"}
                    </p>
                    {weakQ.length > 0 && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-left">
                            <p className="text-xs font-bold text-orange-400 mb-1">Questions to revisit</p>
                            <p className="text-xs text-zinc-400">{weakQ.join(", ")}</p>
                        </div>
                    )}
                    <button onClick={() => { setQuestions([]); setDone(false); setAnswers([]); }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">
                        <RotateCcw className="w-4 h-4" />Generate New Questions
                    </button>
                </div>
            </div>
        );
    }

    /* ── Question ── */
    const q = questions[current];

    return (
        <div className="flex-1 overflow-y-auto bg-black px-4 py-6">
            <div className="max-w-2xl mx-auto space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                        📋 CBSE Board Exam
                    </span>
                    <div className="flex items-center gap-3">
                        {q.marks && (
                            <span className="text-xs text-zinc-500 hidden sm:inline">Marks: {q.marks}</span>
                        )}
                        <span className="text-xs text-zinc-500">Q{current + 1}/{questions.length}</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                    <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${(current / questions.length) * 100}%` }} />
                </div>

                {/* Question card with bookmark button */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative">
                    <div className="absolute top-3 right-3">
                        <MCQBookmarkButton
                            question={q.question}
                            options={q.options}
                            correct_index={q.correctIndex}
                            explanation={q.explanation}
                            exam="CBSE Board"
                            difficulty={q.difficulty ?? "medium"}
                            marks={q.marks}
                            exam_tip={q.exam_tip}
                        />
                    </div>
                    {q.marks && (
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mb-3 text-indigo-400 bg-indigo-400/10 border-indigo-400/20">
                            {q.marks} marks
                        </span>
                    )}
                    <p className="text-zinc-100 font-medium text-sm leading-relaxed pr-8">{q.question}</p>
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                    {q.options.map((opt, i) => {
                        const letter = ["A", "B", "C", "D"][i];
                        let style = "border-zinc-800 bg-zinc-900 hover:border-zinc-600 text-zinc-300 cursor-pointer";
                        if (selected !== null) {
                            if (i === q.correctIndex) style = "border-emerald-500 bg-emerald-500/10 text-emerald-300";
                            else if (i === selected) style = "border-red-500 bg-red-500/10 text-red-300";
                            else style = "border-zinc-800 bg-zinc-900/50 text-zinc-600";
                        }
                        return (
                            <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null}
                                className={`w-full text-left rounded-xl border px-4 py-3.5 flex items-start gap-3 transition-all text-sm ${style}`}>
                                <span className="font-bold text-xs opacity-50 shrink-0 mt-0.5">{letter}</span>
                                <span>{opt}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Explanation */}
                {selected !== null && (
                    <div className={`rounded-xl border p-4 text-sm leading-relaxed space-y-2 ${selected === q.correctIndex ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                        <p className={`font-bold ${selected === q.correctIndex ? "text-emerald-400" : "text-red-400"}`}>
                            {selected === q.correctIndex ? "✅ Correct!" : `❌ Correct: ${["A", "B", "C", "D"][q.correctIndex]}`}
                        </p>
                        <p className="text-zinc-400">{q.explanation}</p>
                        {q.exam_tip && (
                            <p className="text-xs text-indigo-400 border-t border-zinc-700 pt-2">
                                💡 <strong>Board tip:</strong> {q.exam_tip}
                            </p>
                        )}
                    </div>
                )}

                {selected !== null && (
                    <button onClick={handleNext}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                        {current >= questions.length - 1 ? "See Performance" : "Next Question"}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
