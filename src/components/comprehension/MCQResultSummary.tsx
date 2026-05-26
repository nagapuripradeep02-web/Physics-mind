/**
 * Post-quiz score summary. Shows X/N score + framing, retry button, optional
 * email capture, close button.
 *
 * Founder decision (2026-05-23): students SEE their own score per spec §11.
 *
 * Spec: physics-mind/docs/COMPREHENSION_METRIC.md §6.1 step 4-6
 */
"use client";

import { useState } from "react";

interface MCQResultSummaryProps {
    correctCount: number;
    totalCount: number;
    conceptName?: string;
    onRetry: () => void;
    onClose: () => void;
    onEmailSubmit?: (email: string) => void;
}

export function MCQResultSummary({
    correctCount,
    totalCount,
    conceptName,
    onRetry,
    onClose,
    onEmailSubmit,
}: MCQResultSummaryProps) {
    const [email, setEmail] = useState("");
    const [emailSubmitted, setEmailSubmitted] = useState(false);
    const pct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    const tier =
        pct >= 90
            ? { label: "Excellent", color: "text-emerald-400", framing: "You really understood this concept." }
            : pct >= 70
              ? { label: "Strong", color: "text-blue-300", framing: "Solid grasp — one or two details to revisit." }
              : pct >= 50
                ? { label: "Getting there", color: "text-amber-300", framing: "Worth replaying the simulation once more." }
                : { label: "Worth a retry", color: "text-rose-300", framing: "Some core ideas didn't land. Replay and try again." };

    const handleEmailSubmit = () => {
        if (!email.trim()) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;
        onEmailSubmit?.(email.trim());
        setEmailSubmitted(true);
    };

    return (
        <div className="flex flex-col gap-5 p-6 bg-zinc-900 rounded-lg border border-zinc-800">
            <div className="text-center">
                <div className="text-5xl font-bold text-zinc-100">
                    {correctCount}/{totalCount}
                </div>
                <div className={`text-sm font-semibold mt-2 ${tier.color}`}>
                    {tier.label} — {pct}%
                </div>
                <div className="text-sm text-zinc-400 mt-3 leading-relaxed">{tier.framing}</div>
                {conceptName && (
                    <div className="text-xs text-zinc-500 mt-1">on {conceptName}</div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    type="button"
                    onClick={onRetry}
                    className="flex-1 px-4 py-2.5 rounded-md bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
                >
                    Replay simulation
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold transition-colors"
                >
                    Close
                </button>
            </div>

            {onEmailSubmit && !emailSubmitted && (
                <div className="flex flex-col gap-2 pt-3 border-t border-zinc-800">
                    <label htmlFor="mcq-email" className="text-xs text-zinc-500">
                        Want to be notified when the next concept ships? (Optional)
                    </label>
                    <div className="flex gap-2">
                        <input
                            id="mcq-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="flex-1 px-3 py-2 rounded-md bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-700"
                        />
                        <button
                            type="button"
                            onClick={handleEmailSubmit}
                            className="px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                        >
                            Notify me
                        </button>
                    </div>
                </div>
            )}
            {emailSubmitted && (
                <div className="text-xs text-emerald-400 text-center pt-2 border-t border-zinc-800">
                    Thanks — we'll email you when the next concept ships.
                </div>
            )}
        </div>
    );
}
