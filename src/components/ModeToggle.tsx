"use client";

import type { ChatMode } from "@/contexts/ChatContext";

interface ModeToggleProps {
    value: ChatMode;
    onChange: (mode: ChatMode) => void;
}

const MODES: { id: ChatMode; label: string; emoji: string }[] = [
    { id: "competitive", label: "Competitive", emoji: "🏆" },
    { id: "board", label: "Board", emoji: "📋" },
    { id: "both", label: "Both", emoji: "⚡" },
];

export default function ModeToggle({ value, onChange }: ModeToggleProps) {
    return (
        <div className="flex bg-zinc-900 rounded-xl p-0.5 border border-zinc-800 shrink-0">
            {MODES.map(m => (
                <button
                    key={m.id}
                    onClick={() => onChange(m.id)}
                    className={`flex items-center gap-1 px-3 h-7 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${value === m.id
                            ? m.id === "competitive" ? "bg-blue-600 text-white"
                                : m.id === "board" ? "bg-indigo-600 text-white"
                                    : "bg-zinc-600 text-white"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                >
                    <span className="text-[11px]">{m.emoji}</span>
                    {m.label}
                </button>
            ))}
        </div>
    );
}

/** Returns a system prompt suffix based on the selected mode */
export function getModePromptSuffix(mode: ChatMode): string {
    if (mode === "competitive") {
        return `\n\nRESPONSE STYLE — COMPETITIVE EXAM MODE:
Respond in competitive exam style. Structure: intuition → concept → exam tricks.
Include: time-saving shortcuts, common traps, pattern recognition, what examiners test.
Be concise. Students have limited time. Add a ⚡ trick line at the end.`;
    }
    if (mode === "board") {
        return `\n\nRESPONSE STYLE — BOARD EXAM MODE:
Respond in board exam style. Structure: intuition → full concept → written solution.
Include: step-by-step working, proper notation, how to present for full marks, CBSE marking scheme awareness.
Be thorough. Every step matters. End with "Answer: [value with units]".`;
    }
    // "both"
    return `\n\nRESPONSE STYLE — DUAL MODE:
Give your response in TWO clearly divided sections:

━━━ 🏆 COMPETITIVE APPROACH ━━━
[Concise: intuition → concept → JEE/NEET tricks and shortcuts]

━━━ 📋 BOARD APPROACH ━━━
[Full step-by-step solution with proper notation and marking point awareness]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}
