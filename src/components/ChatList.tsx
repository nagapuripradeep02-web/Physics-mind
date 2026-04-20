"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, ChevronDown, ChevronRight, MessageSquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface Chat {
    id: string;
    title: string;
    updatedAt: string;
}

interface ChatListProps {
    label: string;
    emoji: string;
    chats: Chat[];
    activeChatId: string | null;
    onSelect: (id: string) => void;
    onCreate: () => void;
    onRename: (id: string, title: string) => void;
    onDelete: (id: string) => void;
    /** Whether the parent section is the active nav item */
    isActive: boolean;
    onSectionClick: () => void;
    /** Accent scope class (e.g. "accent-conceptual"); maps to .accent-* rules in globals.css. */
    accentClass?: string;
    /** Optional tagline shown below the section title when the section is active. */
    tagline?: string;
}

export default function ChatList({
    label, emoji, chats, activeChatId, onSelect, onCreate,
    onRename, onDelete, isActive, onSectionClick,
    accentClass = "accent-conceptual", tagline,
}: ChatListProps) {
    const [expanded, setExpanded] = useState(isActive);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");
    const renameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isActive) setExpanded(true);
    }, [isActive]);

    useEffect(() => {
        if (renamingId) renameRef.current?.focus();
    }, [renamingId]);

    const handleToggle = () => {
        if (!isActive) onSectionClick();
        setExpanded(e => !e);
    };

    const submitRename = (id: string) => {
        if (renameValue.trim()) onRename(id, renameValue.trim());
        setRenamingId(null);
        setRenameValue("");
    };

    const activeStyle = isActive
        ? {
              backgroundColor: "rgb(var(--accent) / 0.15)",
              borderColor: "rgb(var(--accent) / 0.45)",
          }
        : undefined;

    return (
        <div className={accentClass}>
            {/* Section header — acts as nav item */}
            <button
                onClick={handleToggle}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl border transition-all text-left ${
                    isActive ? "" : "border-transparent hover:bg-zinc-800/60"
                }`}
                style={activeStyle}
            >
                <span className="text-base leading-none shrink-0">{emoji}</span>
                <span className="flex-1 min-w-0">
                    <span
                        className="block text-[13px] font-medium truncate"
                        style={{ color: isActive ? "rgb(var(--accent))" : "rgb(212 212 216)" }}
                    >
                        {label}
                    </span>
                    {tagline && (
                        <span className="block text-[10px] text-zinc-500 truncate tracking-wide">
                            {tagline}
                        </span>
                    )}
                </span>
                {expanded
                    ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    : <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                }
            </button>

            {/* Expandable chat list */}
            {expanded && (
                <div className="mt-0.5 ml-3 pl-2 border-l border-zinc-800 space-y-0.5">
                    {/* + New Chat */}
                    <button
                        onClick={onCreate}
                        className="w-full h-8 flex items-center gap-1.5 px-2 rounded-lg text-[12px] text-zinc-500 hover:text-blue-400 hover:bg-zinc-800/60 transition-all"
                    >
                        <Plus className="w-3.5 h-3.5 shrink-0" />
                        <span>New Chat</span>
                    </button>

                    {chats.slice(0, 20).map(chat => (
                        <div key={chat.id} className="group relative">
                            {renamingId === chat.id ? (
                                <input
                                    ref={renameRef}
                                    value={renameValue}
                                    onChange={e => setRenameValue(e.target.value)}
                                    onBlur={() => submitRename(chat.id)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") submitRename(chat.id);
                                        if (e.key === "Escape") { setRenamingId(null); setRenameValue(""); }
                                    }}
                                    className="w-full h-8 bg-zinc-800 border border-blue-500/50 rounded-lg px-2 text-[12px] text-zinc-200 outline-none"
                                />
                            ) : (
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => { onSelect(chat.id); }}
                                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onSelect(chat.id); }}
                                    className={`w-full h-8 flex items-center gap-1.5 px-2 rounded-lg text-[12px] transition-all cursor-pointer select-none ${activeChatId === chat.id
                                            ? "border-l-2 bg-zinc-800/60 text-zinc-100 pl-1.5"
                                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
                                        }`}
                                    style={activeChatId === chat.id ? { borderLeftColor: "rgb(var(--accent))" } : undefined}
                                >
                                    <MessageSquare className="w-3 h-3 shrink-0 opacity-50" />
                                    <span className="flex-1 truncate">{chat.title}</span>
                                    {/* 3-dot menu — valid inside a div */}
                                    <button
                                        onClick={e => { e.stopPropagation(); setMenuOpenId(menuOpenId === chat.id ? null : chat.id); }}
                                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-700 transition-all"
                                    >
                                        <MoreHorizontal className="w-3 h-3 text-zinc-500" />
                                    </button>
                                </div>
                            )}

                            {/* Dropdown menu */}
                            {menuOpenId === chat.id && (
                                <div className="absolute right-0 top-8 z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1 min-w-[120px]">
                                    <button
                                        onClick={() => { setRenamingId(chat.id); setRenameValue(chat.title); setMenuOpenId(null); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-zinc-300 hover:bg-zinc-800 transition-colors"
                                    >
                                        <Pencil className="w-3 h-3" />Rename
                                    </button>
                                    <button
                                        onClick={() => { onDelete(chat.id); setMenuOpenId(null); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-400 hover:bg-zinc-800 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
