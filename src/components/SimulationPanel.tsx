"use client";

import { useEffect, useState } from "react";
import { X, Zap } from "lucide-react";

interface SimulationPanelProps {
    content: string;
    onClose: () => void;
}

function getSimUrl(content: string): string {
    const lower = content.toLowerCase();
    if (/kcl|junction|current split|kirchhoff/.test(lower)) {
        return "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html";
    }
    if (/ohm|resistance|voltage/.test(lower)) {
        return "https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_en.html";
    }
    return "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc-virtual-lab/latest/circuit-construction-kit-dc-virtual-lab_en.html";
}

function getSimLabel(content: string): string {
    const lower = content.toLowerCase();
    if (/kcl|junction|current split|kirchhoff/.test(lower)) return "Circuit Construction Kit";
    if (/ohm|resistance|voltage/.test(lower)) return "Ohm's Law";
    return "Circuit Virtual Lab";
}

export default function SimulationPanel({ content, onClose }: SimulationPanelProps) {
    const [tip, setTip] = useState("");
    const [loadingTip, setLoadingTip] = useState(true);
    const simUrl = getSimUrl(content);
    const simLabel = getSimLabel(content);

    useEffect(() => {
        let isMounted = true;
        setLoadingTip(true);
        fetch("/api/tip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
        })
            .then(res => res.json())
            .then(data => { if (isMounted) setTip(data.tip || ""); })
            .catch(() => { if (isMounted) setTip("Adjust the resistance and voltage sliders and watch how current changes at each junction."); })
            .finally(() => { if (isMounted) setLoadingTip(false); });

        return () => { isMounted = false; };
    }, [content]);

    return (
        <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="font-semibold text-zinc-100 text-sm">Visual Simulation</span>
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{simLabel}</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                    aria-label="Close panel"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* "What to look for" tip */}
            <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/40 shrink-0">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">
                    What to look for
                </p>
                {loadingTip ? (
                    <div className="space-y-2">
                        <div className="h-3 bg-zinc-800 rounded-full animate-pulse w-full" />
                        <div className="h-3 bg-zinc-800 rounded-full animate-pulse w-4/5" />
                        <div className="h-3 bg-zinc-800 rounded-full animate-pulse w-3/5" />
                    </div>
                ) : (
                    <p className="text-zinc-300 text-sm leading-relaxed">{tip}</p>
                )}
            </div>

            {/* PhET iframe */}
            <div className="flex-1 relative bg-zinc-900">
                <iframe
                    src={simUrl}
                    className="w-full h-full border-0"
                    allow="fullscreen"
                    title={simLabel}
                />
            </div>
        </div>
    );
}
