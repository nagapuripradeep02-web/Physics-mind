"use client";

import { useState } from "react";

export type FeedbackKind = "deep-dive" | "drill-down";
type Signal = "positive" | "negative";

interface DeepDiveFeedbackThumbsProps {
    kind: FeedbackKind;
    cacheId: string;
    sessionId: string;
}

interface FeedbackResponse {
    ok: boolean;
    positive: number;
    negative: number;
    promoted: boolean;
    status: string;
}

const ENDPOINT: Record<FeedbackKind, string> = {
    "deep-dive": "/api/deep-dive/feedback",
    "drill-down": "/api/drill-down/feedback",
};

export default function DeepDiveFeedbackThumbs({
    kind,
    cacheId,
    sessionId,
}: DeepDiveFeedbackThumbsProps) {
    const [voted, setVoted] = useState<Signal | null>(null);
    const [counts, setCounts] = useState<{ positive: number; negative: number } | null>(null);
    const [saving, setSaving] = useState(false);

    async function cast(signal: Signal) {
        if (saving || voted) return;
        setSaving(true);
        setVoted(signal);
        try {
            const res = await fetch(ENDPOINT[kind], {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cacheId, sessionId, signal }),
            });
            if (res.ok) {
                const data = (await res.json()) as FeedbackResponse;
                setCounts({ positive: data.positive, negative: data.negative });
            }
        } catch {
            // silent — vote is a nice-to-have, never blocks UX
        } finally {
            setSaving(false);
        }
    }

    const base =
        "inline-flex items-center justify-center w-7 h-7 rounded-md text-sm transition-all";
    const positiveClass = voted === "positive"
        ? "bg-emerald-500/25 ring-1 ring-emerald-400/60"
        : voted
            ? "opacity-30 cursor-default"
            : "hover:bg-emerald-500/15 hover:scale-110";
    const negativeClass = voted === "negative"
        ? "bg-rose-500/25 ring-1 ring-rose-400/60"
        : voted
            ? "opacity-30 cursor-default"
            : "hover:bg-rose-500/15 hover:scale-110";

    return (
        <div className="flex items-center gap-2 mt-2 text-[11px] text-zinc-500">
            <span className="shrink-0">Was this helpful?</span>
            <button
                type="button"
                onClick={() => cast("positive")}
                disabled={saving || !!voted}
                title="Helpful"
                className={`${base} ${positiveClass}`}
            >
                👍
            </button>
            <button
                type="button"
                onClick={() => cast("negative")}
                disabled={saving || !!voted}
                title="Not helpful"
                className={`${base} ${negativeClass}`}
            >
                👎
            </button>
            {voted && (
                <span className="text-emerald-400/80">
                    Thanks{counts ? ` — ${counts.positive} 👍 / ${counts.negative} 👎` : ""}
                </span>
            )}
        </div>
    );
}
