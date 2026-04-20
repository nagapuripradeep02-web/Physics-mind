"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";

interface ConceptSidebarProps {
    conceptName: string;
    conceptClass: string;
    conceptSubject: string;
    onClose: () => void;
}

export default function ConceptSidebar({
    conceptName,
    conceptClass,
    conceptSubject,
    onClose,
}: ConceptSidebarProps) {
    const { markConceptUnderstood, markConceptNeedsReview, concepts } = useProfile();
    const [explanation, setExplanation] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Find concept id by name
    const concept = concepts.find(
        (c) => c.name.toLowerCase() === conceptName.toLowerCase()
    );

    useEffect(() => {
        setLoading(true);
        setError(false);
        setExplanation("");

        fetch("/api/concept", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conceptName, conceptClass, conceptSubject }),
        })
            .then((r) => r.json())
            .then((data) => {
                setExplanation(data.explanation || "No explanation available.");
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [conceptName, conceptClass, conceptSubject]);

    return (
        <div className="fixed top-0 right-0 h-full w-80 bg-zinc-950 border-l border-zinc-800 shadow-2xl z-50 flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
                <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                        Concept Refresher
                    </p>
                    <h3 className="font-bold text-zinc-100 text-sm leading-tight">{conceptName}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{conceptSubject} · Class {conceptClass}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors shrink-0 mt-0.5"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
                {loading && (
                    <div className="flex items-center gap-2 text-zinc-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Generating refresher...</span>
                    </div>
                )}
                {error && (
                    <p className="text-sm text-red-400">Failed to load explanation. Please try again.</p>
                )}
                {!loading && !error && explanation && (
                    <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {explanation}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-zinc-800 shrink-0 space-y-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Did this help?</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            if (concept) markConceptUnderstood(concept.id);
                            onClose();
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/20 rounded-xl py-2.5 text-xs font-semibold transition-colors"
                    >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Got it!
                    </button>
                    <button
                        onClick={() => {
                            if (concept) markConceptNeedsReview(concept.id);
                            onClose();
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-xl py-2.5 text-xs font-semibold transition-colors"
                    >
                        <AlertCircle className="w-3.5 h-3.5" />
                        Need review
                    </button>
                </div>
            </div>
        </div>
    );
}
