"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Menu, X } from "lucide-react";
import LeftPanel, { type Section } from "@/components/LeftPanel";
import ConceptualSection from "@/components/sections/ConceptualSection";
import BoardExamTab from "@/components/sections/BoardExamTab";
import CompetitiveTab from "@/components/sections/CompetitiveTab";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { useChats } from "@/contexts/ChatContext";

function BookmarkBadge() {
    const { count } = useBookmarks();
    return (
        <Link href="/bookmarks"
            className="relative flex items-center justify-center w-8 h-8 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
            title="My Bookmarks">
            <Bookmark className="w-4 h-4" />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center bg-amber-500 text-black text-[9px] font-bold rounded-full px-0.5 leading-none">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </Link>
    );
}

export default function ProgressTrackerClient() {
    const [section, setSection] = useState<Section>("conceptual");
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [competitiveMCQExam, setCompetitiveMCQExam] = useState<string | undefined>();
    const [competitiveMCQKeywords, setCompetitiveMCQKeywords] = useState<string[]>([]);

    const handleSectionChange = (s: Section) => {
        setSection(s);
        setMobileNavOpen(false);
    };

    const handleGoToCompetitive = (exam?: string, keywords?: string[]) => {
        setCompetitiveMCQExam(exam);
        setCompetitiveMCQKeywords(keywords ?? []);
        handleSectionChange("competitive");
    };

    const sectionLabel = section === "conceptual" ? "📚 Conceptual Understanding"
        : section === "competitive" ? "📋 Board Exam"
            : "⚡ Competitive";

    return (
        <div className="w-full h-screen flex bg-black overflow-hidden">
            {/* Desktop left panel */}
            <div className="hidden md:flex shrink-0 h-full">
                <LeftPanel
                    activeSection={section}
                    onSectionChange={handleSectionChange}
                    isCollapsed={sidebarCollapsed}
                    onToggleCollapse={setSidebarCollapsed}
                />
            </div>

            {/* Mobile drawer */}
            {mobileNavOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="h-full bg-zinc-950 shadow-2xl border-r border-zinc-800 flex flex-col">
                        <div className="flex items-center justify-end p-3 border-b border-zinc-800">
                            <button onClick={() => setMobileNavOpen(false)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <LeftPanel activeSection={section} onSectionChange={handleSectionChange} />
                        </div>
                    </div>
                    <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
                {/* Mobile header */}
                <div className="md:hidden flex items-center gap-2 px-3 py-2.5 bg-zinc-950 border-b border-zinc-800 shrink-0">
                    <button onClick={() => setMobileNavOpen(true)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800">
                        <Menu className="w-4 h-4" />
                    </button>
                    <span className="flex-1 text-[13px] font-semibold text-zinc-200 truncate">{sectionLabel}</span>
                    <BookmarkBadge />
                </div>

                {/* Section routing — CSS display:none preserves component state across switches */}
                <div style={{ display: section === "conceptual" ? "flex" : "none" }} className="flex-1 flex-col min-h-0 min-w-0 overflow-hidden">
                    <ConceptualSection onGoToCompetitive={handleGoToCompetitive} />
                </div>
                <div style={{ display: section === "competitive" ? "flex" : "none" }} className="flex-1 flex-col min-h-0 min-w-0 overflow-hidden">
                    <BoardExamTab />
                </div>
                <div style={{ display: section === "solver" ? "flex" : "none" }} className="flex-1 flex-col min-h-0 min-w-0 overflow-hidden">
                    <CompetitiveTab />
                </div>
            </div>
        </div>
    );
}
