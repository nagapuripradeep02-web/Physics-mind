"use client";

import { useState, useEffect } from "react";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";
import { useProfile } from "@/contexts/ProfileContext";
import { useChats } from "@/contexts/ChatContext";
import ChatList from "@/components/ChatList";

export type Section = "conceptual" | "competitive" | "solver";

interface LeftPanelProps {
    activeSection: Section;
    onSectionChange: (s: Section) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: (collapsed: boolean) => void;
}

const SECTION_ICONS = {
    conceptual: "📚",
    competitive: "📋",
    solver: "⚡",
} as const;

const SECTION_NAMES = {
    conceptual: "Conceptual Understanding",
    competitive: "Board Exam",
    solver: "Competitive",
} as const;

// Legacy section names → accent token names. "competitive" is the Board Exam
// tab (historical), "solver" is the Competitive tab.
const SECTION_ACCENT_VAR: Record<Section, string> = {
    conceptual: "var(--accent-conceptual)",
    competitive: "var(--accent-board)",
    solver: "var(--accent-competitive)",
};

// Class variant — matches the `.accent-*` rules in globals.css. Safer than
// inline `style={{ '--accent': ... }}` because some React builds serialize
// custom properties inconsistently; a scoped class is bulletproof.
const SECTION_ACCENT_CLASS: Record<Section, string> = {
    conceptual: "accent-conceptual",
    competitive: "accent-board",
    solver: "accent-competitive",
};

const SECTION_TAGLINE: Record<Section, string> = {
    conceptual: "Foundations · NCERT",
    competitive: "Exam-format answers",
    solver: "JEE / NEET speed",
};

export default function LeftPanel({ activeSection, onSectionChange, isCollapsed = false, onToggleCollapse }: LeftPanelProps) {
    const router = useRouter();
    const { profile } = useProfile();
    const {
        conceptualChats, activeConceptualId, setActiveConceptualId,
        createConceptualChat, deleteConceptualChat, renameConceptualChat,
        problemChats, activeProblemId, setActiveProblemId,
        createProblemChat, deleteProblemChat, renameProblemChat,
    } = useChats();
    const [mounted, setMounted] = useState(false);

    // Load collapsed state from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("sidebar_collapsed");
        if (saved === "true" && onToggleCollapse) {
            onToggleCollapse(true);
        }
    }, [onToggleCollapse]);

    const handleToggleCollapse = () => {
        const newState = !isCollapsed;
        localStorage.setItem("sidebar_collapsed", String(newState));
        onToggleCollapse?.(newState);
    };

    const handleSignOut = async () => {
        await supabaseBrowser.auth.signOut();
        router.push("/login");
    };

    const handleConceptualChatSelect = (id: string) => {
        setActiveConceptualId(id);
        onSectionChange("conceptual");
    };

    const handleProblemChatSelect = (id: string) => {
        setActiveProblemId(id);
        onSectionChange("solver");
    };

    if (!mounted) return null;

    const sidebarWidth = isCollapsed ? "w-[52px]" : "w-[260px]";

    return (
        <div className={`${sidebarWidth} h-full bg-zinc-950 border-r border-zinc-800 flex flex-col overflow-hidden transition-all duration-200`}>
            {/* Header with toggle button */}
            <div className={`px-3 pt-4 pb-3 border-b border-zinc-800 shrink-0 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
                {!isCollapsed && (
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                            <span className="text-[13px] font-bold text-blue-400">
                                {profile?.name?.[0]?.toUpperCase() ?? "S"}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-zinc-100 truncate">{profile?.name ?? "Student"}</p>
                            <p className="text-[11px] text-zinc-500 truncate">{profile?.class ?? "Class 12"} · {profile?.board ?? "CBSE"}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleToggleCollapse}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all shrink-0"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Nav / chat lists */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 min-h-0">
                {isCollapsed ? (
                    /* Collapsed state: icons only */
                    <>
                        {(["conceptual", "competitive", "solver"] as Section[]).map((s) => {
                            const isActive = activeSection === s;
                            const activeStyle = isActive
                                ? {
                                      backgroundColor: "rgb(var(--accent) / 0.15)",
                                      borderColor: "rgb(var(--accent) / 0.45)",
                                  }
                                : undefined;
                            return (
                                <button
                                    key={s}
                                    onClick={() => onSectionChange(s)}
                                    className={`${SECTION_ACCENT_CLASS[s]} w-full h-10 flex items-center justify-center rounded-xl border transition-all ${
                                        isActive ? "" : "border-transparent hover:bg-zinc-800/60"
                                    }`}
                                    style={activeStyle}
                                    title={SECTION_NAMES[s]}
                                >
                                    <span className="text-base">{SECTION_ICONS[s]}</span>
                                </button>
                            );
                        })}
                    </>
                ) : (
                    /* Expanded state: full content */
                    <>
                        {/* Conceptual Understanding */}
                        <ChatList
                            label="Conceptual Understanding"
                            emoji="📚"
                            chats={conceptualChats}
                            activeChatId={activeConceptualId}
                            onSelect={handleConceptualChatSelect}
                            onCreate={async () => {
                                await createConceptualChat();
                                onSectionChange("conceptual");
                            }}
                            onRename={renameConceptualChat}
                            onDelete={deleteConceptualChat}
                            isActive={activeSection === "conceptual"}
                            onSectionClick={() => onSectionChange("conceptual")}
                            accentClass={SECTION_ACCENT_CLASS.conceptual}
                            tagline={activeSection === "conceptual" ? SECTION_TAGLINE.conceptual : undefined}
                        />

                        {/* Board Exam — standalone button (no sub-chats yet) */}
                        <button
                            onClick={() => onSectionChange("competitive")}
                            className={`${SECTION_ACCENT_CLASS.competitive} w-full flex items-center gap-2 px-2 py-2 rounded-xl border transition-all ${
                                activeSection === "competitive" ? "" : "border-transparent hover:bg-zinc-800/60"
                            }`}
                            style={activeSection === "competitive"
                                ? {
                                    backgroundColor: "rgb(var(--accent) / 0.15)",
                                    borderColor: "rgb(var(--accent) / 0.45)",
                                }
                                : undefined}
                        >
                            <span className="text-base leading-none shrink-0">📋</span>
                            <span className="flex-1 min-w-0 text-left">
                                <span
                                    className="block text-[13px] font-medium truncate"
                                    style={{ color: activeSection === "competitive" ? "rgb(var(--accent))" : "rgb(212 212 216)" }}
                                >
                                    Board Exam
                                </span>
                                {activeSection === "competitive" && (
                                    <span className="block text-[10px] text-zinc-500 truncate tracking-wide">
                                        {SECTION_TAGLINE.competitive}
                                    </span>
                                )}
                            </span>
                            {activeSection === "competitive" && (
                                <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ backgroundColor: "rgb(var(--accent))" }}
                                />
                            )}
                        </button>

                        {/* Competitive */}
                        <ChatList
                            label="Competitive"
                            emoji="⚡"
                            chats={problemChats}
                            activeChatId={activeProblemId}
                            onSelect={handleProblemChatSelect}
                            onCreate={async () => {
                                await createProblemChat();
                                onSectionChange("solver");
                            }}
                            onRename={renameProblemChat}
                            onDelete={deleteProblemChat}
                            isActive={activeSection === "solver"}
                            onSectionClick={() => onSectionChange("solver")}
                            accentClass={SECTION_ACCENT_CLASS.solver}
                            tagline={activeSection === "solver" ? SECTION_TAGLINE.solver : undefined}
                        />
                    </>
                )}
            </div>

            {/* Footer */}
            {!isCollapsed && (
                <div className="px-3 py-3 border-t border-zinc-800 shrink-0">
                    <button
                        onClick={handleSignOut}
                        className="w-full h-8 flex items-center gap-2 px-2 rounded-lg text-[12px] text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-all"
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        Sign out
                    </button>
                    <p
                        className="text-[10px] text-zinc-700 text-center tracking-wide pt-2"
                        title="Beta build — coverage expanding"
                    >
                        β PhysicsMind
                    </p>
                </div>
            )}

            {/* Collapsed footer: sign out icon only */}
            {isCollapsed && (
                <div className="px-3 py-3 border-t border-zinc-800 shrink-0 flex justify-center">
                    <button
                        onClick={handleSignOut}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-all"
                        title="Sign out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
