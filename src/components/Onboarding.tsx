"use client";

import { useState } from "react";
import { ChevronRight, Zap, BookOpen, Target, Sparkles, Check } from "lucide-react";
import type { StudentProfile, StudentClass, StudentBoard, StudentGoal, ClassLevel } from "@/types/student";
import { levelToClass } from "@/types/student";

interface OnboardingProps {
    onComplete: (profile: StudentProfile) => void;
}

const CLASS_LEVELS: { level: ClassLevel; label: StudentClass; hint: string }[] = [
    { level: 10, label: "Class 10", hint: "Foundation — NCERT 10" },
    { level: 11, label: "Class 11", hint: "JEE/NEET Year 1 — NCERT 11" },
    { level: 12, label: "Class 12", hint: "JEE/NEET Year 2 — NCERT 12" },
];
const BOARDS: StudentBoard[] = [
    "CBSE",
    "Telangana Board",
    "AP Board",
    "Maharashtra Board",
    "Other State Board",
];
const GOALS: { value: StudentGoal; label: string; desc: string; icon: string }[] = [
    { value: "JEE", label: "JEE", desc: "JEE Main & Advanced", icon: "⚡" },
    { value: "NEET", label: "NEET", desc: "Medical entrance", icon: "🔬" },
    { value: "Board Exam", label: "Board Exam", desc: "Score 95%+", icon: "📋" },
    { value: "Just Learning", label: "Just Learning", desc: "Curiosity-driven", icon: "✨" },
];
const SCARY_TOPICS = [
    "Kirchhoff's Laws",
    "Electromagnetic Induction",
    "Rotational Motion",
    "Thermodynamics",
    "Wave Optics",
    "Modern Physics",
];

export default function Onboarding({ onComplete }: OnboardingProps) {
    const [screen, setScreen] = useState(0);
    const [name, setName] = useState("");
    const [selectedLevels, setSelectedLevels] = useState<ClassLevel[]>([]);
    const [selectedBoard, setSelectedBoard] = useState<StudentBoard | "">("");
    const [selectedGoal, setSelectedGoal] = useState<StudentGoal | "">("");
    const [firstTopic, setFirstTopic] = useState("");
    const [customTopic, setCustomTopic] = useState("");

    const toggleLevel = (level: ClassLevel) => {
        setSelectedLevels(prev => {
            if (prev.includes(level)) return prev.filter(l => l !== level);
            return [...prev, level].sort((a, b) => a - b) as ClassLevel[];
        });
    };

    const handleFinish = () => {
        const topic = firstTopic === "custom" ? customTopic : firstTopic;
        const primaryLevel = selectedLevels[0];
        const profile: StudentProfile = {
            name: name.trim() || "Student",
            class: levelToClass(primaryLevel),
            class_levels: selectedLevels,
            board: selectedBoard as StudentBoard,
            goal: selectedGoal as StudentGoal,
            firstTopic: topic || "Kirchhoff's Laws",
            onboardingComplete: true,
        };
        onComplete(profile);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Progress dots */}
                <div className="flex justify-center gap-2 mb-10">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === screen
                                ? "w-8 bg-blue-500"
                                : i < screen
                                    ? "w-4 bg-blue-500/50"
                                    : "w-4 bg-zinc-700"
                                }`}
                        />
                    ))}
                </div>

                {/* Screen 0: Welcome */}
                {screen === 0 && (
                    <div className="text-center space-y-8 animate-fade-in">
                        <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex items-center justify-center mx-auto">
                            <Zap className="w-10 h-10 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
                                Physics finally<br />makes sense.
                            </h1>
                            <p className="text-zinc-400 text-base leading-relaxed">
                                Your personal AI tutor, built for JEE & Board exams.
                                Concepts, intuition, and practice — all in one place.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="w-full">
                                <input
                                    type="text"
                                    placeholder="What's your name? (optional)"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 placeholder:text-zinc-600 text-sm transition-all"
                                    maxLength={30}
                                />
                            </div>
                            <button
                                onClick={() => setScreen(1)}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3.5 font-semibold text-base transition-colors"
                            >
                                Let&apos;s personalise your experience
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Screen 1: Select Class */}
                {screen === 1 && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <BookOpen className="w-5 h-5 text-blue-400" />
                                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Step 1 of 3</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white">Which class(es) do you study?</h2>
                            <p className="text-zinc-500 text-sm mt-1">Pick one or more. Your catalog adapts to your selection.</p>
                        </div>
                        <div className="space-y-3">
                            {CLASS_LEVELS.map(({ level, label, hint }) => {
                                const isSelected = selectedLevels.includes(level);
                                return (
                                    <button
                                        key={level}
                                        onClick={() => toggleLevel(level)}
                                        aria-pressed={isSelected}
                                        className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border text-left transition-all ${isSelected
                                            ? "bg-blue-600/15 border-blue-500 text-white"
                                            : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                                            }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{label}</span>
                                            <span className="text-xs text-zinc-500">{hint}</span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isSelected
                                            ? "bg-blue-500 border-blue-500"
                                            : "border border-zinc-600"
                                            }`}>
                                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                    </button>
                                );
                            })}
                            {selectedLevels.length > 1 && (
                                <p className="text-xs text-blue-400/80 px-1">
                                    {selectedLevels.length} classes selected — chapters from all will appear in your catalog.
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => setScreen(2)}
                            disabled={selectedLevels.length === 0}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3.5 font-semibold text-base transition-colors"
                        >
                            Continue <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Screen 2: Board & Goal */}
                {screen === 2 && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-5 h-5 text-indigo-400" />
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Step 2 of 3</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white">Your board & goal</h2>
                            <p className="text-zinc-500 text-sm mt-1">Helps us match the right exam style.</p>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Board</label>
                            <div className="relative">
                                <select
                                    value={selectedBoard}
                                    onChange={(e) => setSelectedBoard(e.target.value as StudentBoard)}
                                    className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select your board</option>
                                    {BOARDS.map((b) => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 rotate-90 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">My Goal</label>
                            <div className="grid grid-cols-2 gap-2">
                                {GOALS.map((g) => (
                                    <button
                                        key={g.value}
                                        onClick={() => setSelectedGoal(g.value)}
                                        className={`flex flex-col items-start px-4 py-3 rounded-xl border text-left transition-all ${selectedGoal === g.value
                                            ? "bg-indigo-600/15 border-indigo-500 text-white"
                                            : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                                            }`}
                                    >
                                        <span className="text-lg mb-1">{g.icon}</span>
                                        <span className="font-semibold text-sm">{g.label}</span>
                                        <span className="text-zinc-500 text-xs">{g.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setScreen(3)}
                            disabled={!selectedBoard || !selectedGoal}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3.5 font-semibold text-base transition-colors"
                        >
                            Continue <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Screen 3: Scary Topic */}
                {screen === 3 && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                                <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Step 3 of 3</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white">
                                Which topic scares you most?
                            </h2>
                            <p className="text-zinc-500 text-sm mt-1">
                                We&apos;ll start here and make it your strongest point.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {SCARY_TOPICS.map((topic) => (
                                <button
                                    key={topic}
                                    onClick={() => setFirstTopic(topic)}
                                    className={`px-4 py-3 rounded-xl border text-sm text-left transition-all ${firstTopic === topic
                                        ? "bg-yellow-500/10 border-yellow-500/60 text-yellow-300"
                                        : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                                        }`}
                                >
                                    {topic}
                                </button>
                            ))}
                            <button
                                onClick={() => setFirstTopic("custom")}
                                className={`col-span-2 px-4 py-3 rounded-xl border text-sm text-left transition-all ${firstTopic === "custom"
                                    ? "bg-yellow-500/10 border-yellow-500/60 text-yellow-300"
                                    : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                                    }`}
                            >
                                Something else...
                            </button>
                        </div>

                        {firstTopic === "custom" && (
                            <input
                                type="text"
                                placeholder="Type the topic name..."
                                value={customTopic}
                                onChange={(e) => setCustomTopic(e.target.value)}
                                autoFocus
                                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 placeholder:text-zinc-600 text-sm transition-all"
                            />
                        )}

                        <button
                            onClick={handleFinish}
                            disabled={!firstTopic || (firstTopic === "custom" && !customTopic.trim())}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3.5 font-semibold text-base transition-colors"
                        >
                            Start Learning <Zap className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
