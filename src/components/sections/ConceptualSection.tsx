"use client";

import { useMemo, useState } from "react";
import { BookOpen, CheckSquare } from "lucide-react";
import LearnConceptTab from "./LearnConceptTab";
import CheckUnderstandingTab from "./CheckUnderstandingTab";
import { useProfile } from "@/contexts/ProfileContext";
import { useChats } from "@/contexts/ChatContext";
import { CONCEPT_META, type ConceptMeta } from "@/config/conceptMeta";

interface ConceptualSectionProps {
    onGoToCompetitive: (exam?: string, keywords?: string[]) => void;
}

/** Best-effort match from the chat title back to a ConceptMeta entry. */
function inferConceptMeta(title: string | undefined): ConceptMeta | null {
    if (!title) return null;
    const t = title.toLowerCase();
    for (const [id, meta] of Object.entries(CONCEPT_META)) {
        const idTokens = id.replace(/_/g, " ");
        const titleTokens = meta.title.toLowerCase();
        if (t.includes(idTokens) || t.includes(titleTokens)) return meta;
    }
    return null;
}

export default function ConceptualSection({ onGoToCompetitive }: ConceptualSectionProps) {
    const [activeTab, setActiveTab] = useState<"learn" | "check">("learn");
    const { examMode, profile } = useProfile();
    const { activeConceptualChat, activeConceptualId, getConceptualMessages } = useChats();
    const lastTopic = activeConceptualChat?.title ?? "Current Electricity";
    const chatMessages = activeConceptualId ? getConceptualMessages(activeConceptualId) : [];

    // Header badge is derived from the active chat title (first user question).
    // Falls back to the student's profile class if we can't match a known concept.
    const headerMeta = useMemo(() => inferConceptMeta(activeConceptualChat?.title), [activeConceptualChat?.title]);
    const profileClass = typeof profile?.class === "string"
        ? profile.class.replace(/^Class\s*/i, "")
        : "";
    const chapterLabel = headerMeta?.chapter ?? "PhysicsMind";
    const classLabel = headerMeta?.classLevel ?? profileClass ?? "";
    const conceptTitle = headerMeta?.title ?? (activeConceptualChat?.title ?? null);

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Tab header */}
            <div className="shrink-0 bg-zinc-950 border-b border-zinc-800 px-4 pt-2.5 flex items-center gap-0.5">
                {[
                    { id: "learn" as const, label: "Learn Concept", Icon: BookOpen },
                    { id: "check" as const, label: "Check Understanding", Icon: CheckSquare },
                ].map(tab => {
                    const Icon = tab.Icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-[13px] font-semibold border-b-2 transition-all -mb-px ${activeTab === tab.id
                                    ? "border-blue-500 text-blue-300 bg-zinc-900/40"
                                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    );
                })}
                <div className="ml-auto mb-1 flex items-center gap-2">
                    {conceptTitle && (
                        <span
                            className="text-[12px] font-semibold text-zinc-200 truncate max-w-[280px]"
                            title={conceptTitle}
                        >
                            {conceptTitle}
                        </span>
                    )}
                    <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-800/60 border border-zinc-700/50 px-2 py-0.5 rounded-full">
                        {chapterLabel}{classLabel && ` · Class ${classLabel}`}
                    </span>
                </div>
            </div>

            {/* Tab content - use CSS display instead of conditional to preserve state */}
            <div style={{ display: activeTab === "learn" ? "flex" : "none" }} className="flex-1 min-h-0 overflow-hidden">
                <LearnConceptTab onGoToCompetitive={onGoToCompetitive} />
            </div>
            <div style={{ display: activeTab === "check" ? "flex" : "none" }} className="flex-1 min-h-0 overflow-hidden">
                <CheckUnderstandingTab
                    lastTopic={lastTopic}
                    chatMessages={chatMessages}
                    onGoToCompetitive={() => onGoToCompetitive()}
                    examMode={examMode}
                />
            </div>
        </div>
    );
}
