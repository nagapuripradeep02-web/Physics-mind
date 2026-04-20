"use client";

import { useState } from "react";

const RATINGS = [
    { emoji: "😕", value: 1, label: "Very unclear" },
    { emoji: "😐", value: 2, label: "Still confused" },
    { emoji: "🙂", value: 3, label: "Getting it" },
    { emoji: "😊", value: 4, label: "Clear!" },
    { emoji: "💪", value: 5, label: "Got it!" },
];

interface ConfidenceMeterProps {
    chatId: string;
    messageIdx: number;
    onLowConfidence: () => void; // trigger alternative explanation
}

export default function ConfidenceMeter({ chatId, messageIdx, onLowConfidence }: ConfidenceMeterProps) {
    const [selected, setSelected] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    const handleRate = async (value: number) => {
        setSelected(value);
        setSaving(true);
        // Save to Supabase (fire-and-forget)
        try {
            await fetch("/api/chats/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, message_idx: messageIdx, rating: value }),
            });
        } catch { }
        setSaving(false);
        // Low confidence → trigger re-explanation
        if (value <= 2) setTimeout(onLowConfidence, 400);
    };

    return (
        <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] text-zinc-600 shrink-0">How clear is this?</span>
            <div className="flex gap-0.5">
                {RATINGS.map(r => (
                    <button
                        key={r.value}
                        onClick={() => !selected && handleRate(r.value)}
                        title={r.label}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${selected === r.value
                                ? "bg-blue-500/20 scale-110 ring-1 ring-blue-500/40"
                                : selected
                                    ? "opacity-30 cursor-default"
                                    : "hover:bg-zinc-800 hover:scale-110"
                            }`}
                    >
                        {r.emoji}
                    </button>
                ))}
            </div>
            {selected && selected <= 2 && (
                <span className="text-[11px] text-amber-400 animate-pulse">Trying a different approach...</span>
            )}
        </div>
    );
}
