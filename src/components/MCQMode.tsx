"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Clock, CheckCircle, XCircle, RotateCcw, Trophy, Loader2 } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";

interface MCQQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

const JEE_TIME_PER_Q = 120; // 2 minutes

export default function MCQMode() {
    const { examMode, currentModule, profile } = useProfile();
    const [questions, setQuestions] = useState<MCQQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [answered, setAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [weakTopics, setWeakTopics] = useState<string[]>([]);
    const [timeLeft, setTimeLeft] = useState(JEE_TIME_PER_Q);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const MODULE_NAMES: Record<number, string> = {
        1: "Current & Resistance",
        2: "Kirchhoff's Laws",
        3: "Circuits & Networks",
        4: "Energy & Power",
        5: "Measuring Instruments",
    };

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        setError("");
        setQuestions([]);
        setCurrentQ(0);
        setSelected(null);
        setAnswered(false);
        setScore(0);
        setFinished(false);
        setWeakTopics([]);
        setTimeLeft(JEE_TIME_PER_Q);

        try {
            const res = await fetch("/api/mcqset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    module: MODULE_NAMES[currentModule] || "Current Electricity",
                    examMode,
                    studentClass: profile?.class || "Class 12",
                    board: profile?.board || "CBSE",
                }),
            });
            const data = await res.json();
            if (data.questions && Array.isArray(data.questions)) {
                setQuestions(data.questions);
            } else {
                setError("Failed to parse questions. Please try again.");
            }
        } catch {
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    }, [currentModule, examMode, profile]);

    // Auto-load on mount
    useEffect(() => {
        fetchQuestions();
    }, []);

    // JEE timer
    useEffect(() => {
        if (examMode !== "JEE" || !questions.length || answered || finished || loading) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    // Time up — mark wrong
                    handleAnswer(-1);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [currentQ, answered, examMode, questions.length, finished, loading]);

    const handleAnswer = (idx: number) => {
        if (answered) return;
        if (timerRef.current) clearInterval(timerRef.current);
        setSelected(idx);
        setAnswered(true);
        const q = questions[currentQ];
        if (idx === q.correctIndex) {
            setScore((s) => s + 1);
        } else {
            setWeakTopics((wt) => [...wt, q.question.slice(0, 60)]);
        }
    };

    const handleNext = () => {
        if (currentQ + 1 >= questions.length) {
            setFinished(true);
        } else {
            setCurrentQ((q) => q + 1);
            setSelected(null);
            setAnswered(false);
            setTimeLeft(JEE_TIME_PER_Q);
        }
    };

    const pct = Math.round((score / (questions.length || 1)) * 100);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                    <p className="text-zinc-400 text-sm">Generating {examMode} questions...</p>
                    <p className="text-zinc-600 text-xs">Module: {MODULE_NAMES[currentModule]}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center px-6">
                <div className="text-center space-y-4">
                    <XCircle className="w-10 h-10 text-red-400 mx-auto" />
                    <p className="text-zinc-300 text-sm">{error}</p>
                    <button onClick={fetchQuestions} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (finished) {
        return (
            <div className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="text-center">
                        <Trophy className={`w-12 h-12 mx-auto mb-3 ${pct >= 80 ? "text-yellow-400" : pct >= 60 ? "text-blue-400" : "text-zinc-500"}`} />
                        <h2 className="text-2xl font-bold text-zinc-100">Practice Complete!</h2>
                        <p className="text-zinc-400 mt-1 text-sm">{MODULE_NAMES[currentModule]} · {examMode} Mode</p>
                    </div>

                    {/* Score ring */}
                    <div className="flex items-center justify-center">
                        <div className="relative w-28 h-28">
                            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#27272a" strokeWidth="10" />
                                <circle
                                    cx="50" cy="50" r="40" fill="none"
                                    stroke={pct >= 80 ? "#22c55e" : pct >= 60 ? "#3b82f6" : "#f59e0b"}
                                    strokeWidth="10"
                                    strokeDasharray={`${pct * 2.513} 251.3`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-2xl font-bold text-zinc-100">{pct}%</p>
                                <p className="text-xs text-zinc-500">{score}/{questions.length}</p>
                            </div>
                        </div>
                    </div>

                    {pct >= 80 && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                            <p className="text-emerald-400 font-semibold text-sm">Excellent! Next module unlocked 🎉</p>
                        </div>
                    )}

                    {weakTopics.length > 0 && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                            <p className="text-orange-400 font-semibold text-xs uppercase tracking-wider mb-2">Needs Review</p>
                            <ul className="space-y-1">
                                {weakTopics.map((t, i) => (
                                    <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                                        <span className="text-orange-500 mt-0.5">•</span>
                                        {t}...
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        onClick={fetchQuestions}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-semibold text-sm transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Practice Again
                    </button>
                </div>
            </div>
        );
    }

    if (!questions.length) return null;

    const q = questions[currentQ];
    const timerPct = (timeLeft / JEE_TIME_PER_Q) * 100;

    return (
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
            <div className="max-w-2xl mx-auto space-y-4">
                {/* Progress + Timer */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-500">Q {currentQ + 1} of {questions.length}</span>
                        <div className="flex gap-1">
                            {questions.map((_, i) => (
                                <div key={i} className={`w-4 h-1.5 rounded-full transition-colors ${i < currentQ ? "bg-blue-500" : i === currentQ ? "bg-blue-400" : "bg-zinc-700"}`} />
                            ))}
                        </div>
                    </div>
                    {examMode === "JEE" && (
                        <div className="flex items-center gap-1.5">
                            <Clock className={`w-3.5 h-3.5 ${timeLeft <= 20 ? "text-red-400 animate-pulse" : "text-zinc-500"}`} />
                            <span className={`text-xs font-bold tabular-nums ${timeLeft <= 20 ? "text-red-400" : "text-zinc-400"}`}>
                                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                            </span>
                            <div className="w-20 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${timerPct > 50 ? "bg-emerald-500" : timerPct > 25 ? "bg-amber-500" : "bg-red-500"}`}
                                    style={{ width: `${timerPct}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Question */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">
                        {examMode} · {MODULE_NAMES[currentModule]}
                    </p>
                    <p className="text-zinc-100 text-sm font-medium leading-relaxed">{q.question}</p>
                </div>

                {/* Options */}
                <div className="space-y-2">
                    {q.options.map((opt, i) => {
                        const isCorrect = i === q.correctIndex;
                        const isSelected = i === selected;
                        let style = "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500 cursor-pointer";
                        if (answered) {
                            if (isCorrect) style = "bg-emerald-500/15 border-emerald-500 text-emerald-200 cursor-default";
                            else if (isSelected && !isCorrect) style = "bg-red-500/15 border-red-500 text-red-300 cursor-default";
                            else style = "bg-zinc-900 border-zinc-800 text-zinc-500 cursor-default";
                        }

                        return (
                            <button
                                key={i}
                                onClick={() => !answered && handleAnswer(i)}
                                className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border text-sm text-left transition-all ${style}`}
                            >
                                <span className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-xs font-bold border mt-0.5 ${answered && isCorrect ? "bg-emerald-500 border-emerald-500 text-white" : answered && isSelected ? "bg-red-500 border-red-500 text-white" : "border-zinc-700 text-zinc-500"}`}>
                                    {String.fromCharCode(65 + i)}
                                </span>
                                <span className="leading-relaxed">{opt}</span>
                                {answered && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 ml-auto mt-0.5" />}
                                {answered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0 ml-auto mt-0.5" />}
                            </button>
                        );
                    })}
                </div>

                {/* Explanation (CBSE: always shown; JEE: shown after answering) */}
                {answered && (
                    <div className={`rounded-xl p-4 border text-sm ${selected === q.correctIndex
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                        : "bg-zinc-900 border-zinc-700 text-zinc-300"
                        }`}>
                        <p className="font-semibold mb-1 text-xs uppercase tracking-wider text-zinc-400">
                            {selected === q.correctIndex ? "✓ Correct!" : "✗ Incorrect"}
                            {examMode === "CBSE" && " · Step-by-Step"}
                        </p>
                        <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                )}

                {answered && (
                    <button
                        onClick={handleNext}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-semibold text-sm transition-colors"
                    >
                        {currentQ + 1 >= questions.length ? "See Results" : "Next Question →"}
                    </button>
                )}
            </div>
        </div>
    );
}
