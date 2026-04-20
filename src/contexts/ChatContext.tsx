"use client";

import {
    createContext, useContext, useState, useEffect,
    useCallback, useRef, ReactNode
} from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

/* ── Types ───────────────────────────────────────────────── */

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp?: number;
    isMvsResponse?: boolean;
}

export type ChatMode = "competitive" | "board" | "both";

export interface Chat {
    id: string;
    title: string;
    mode: ChatMode;
    exam: string;
    keywords: string[];
    updatedAt: string;
}

/* ── Generate title from first user message ─────────────── */
export function titleFromMessage(text: string): string {
    const words = text.trim().split(/\s+/).slice(0, 4).join(" ");
    return words.length > 24 ? words.slice(0, 24) + "…" : words || "New Chat";
}

/* ── localStorage fallback for messages ─────────────────── */
const LS_MSG_PREFIX = "pm_msgs_";
function lsMsgsGet(chatId: string): ChatMessage[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(LS_MSG_PREFIX + chatId) ?? "[]"); } catch { return []; }
}
function lsMsgsSet(chatId: string, msgs: ChatMessage[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(LS_MSG_PREFIX + chatId, JSON.stringify(msgs));
}

/* ── Context shape ───────────────────────────────────────── */

interface ChatContextValue {
    /* Conceptual chats */
    conceptualChats: Chat[];
    activeConceptualId: string | null;
    setActiveConceptualId: (id: string) => void;
    createConceptualChat: () => Promise<string>;
    updateConceptualChat: (id: string, patch: Partial<Chat>) => Promise<void>;
    deleteConceptualChat: (id: string) => Promise<void>;
    renameConceptualChat: (id: string, title: string) => Promise<void>;
    activeConceptualChat: Chat | null;

    /* Problem chats */
    problemChats: Chat[];
    activeProblemId: string | null;
    setActiveProblemId: (id: string) => void;
    createProblemChat: () => Promise<string>;
    updateProblemChat: (id: string, patch: Partial<Chat>) => Promise<void>;
    deleteProblemChat: (id: string) => Promise<void>;
    renameProblemChat: (id: string, title: string) => Promise<void>;
    activeProblemChat: Chat | null;

    /* Messages — keyed by chat ID, single source of truth */
    conceptualMessages: Record<string, ChatMessage[]>;
    problemMessages: Record<string, ChatMessage[]>;
    getConceptualMessages: (chatId: string) => ChatMessage[];
    getProblemMessages: (chatId: string) => ChatMessage[];
    saveConceptualMessages: (chatId: string, messages: ChatMessage[]) => Promise<void>;
    saveProblemMessages: (chatId: string, messages: ChatMessage[]) => Promise<void>;
    loadConceptualMessages: (chatId: string) => Promise<void>;
    loadProblemMessages: (chatId: string) => Promise<void>;

    /* For MCQ context */
    lastConceptualKeywords: string[];
    chatLoading: boolean;
}

const ChatContext = createContext<ChatContextValue | null>(null);

/* ── Provider ────────────────────────────────────────────── */

export function ChatProvider({ children }: { children: ReactNode }) {
    const [conceptualChats, setConceptualChats] = useState<Chat[]>([]);
    const [activeConceptualId, setActiveConceptualIdState] = useState<string | null>(null);
    const [problemChats, setProblemChats] = useState<Chat[]>([]);
    const [activeProblemId, setActiveProblemIdState] = useState<string | null>(null);
    const [chatLoading, setChatLoading] = useState(true);

    /* Messages stored in context — never in component state */
    const [conceptualMessages, setConceptualMessages] = useState<Record<string, ChatMessage[]>>({});
    const [problemMessages, setProblemMessages] = useState<Record<string, ChatMessage[]>>({});

    /* Track which chat IDs have been loaded from Supabase (avoid re-fetching) */
    const loadedConceptual = useRef<Set<string>>(new Set());
    const loadedProblem = useRef<Set<string>>(new Set());

    /* ── Load all chat metadata on mount ── */
    useEffect(() => {
        loadAllChats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadAllChats = async () => {
        setChatLoading(true);
        try {
            const [cRes, pRes] = await Promise.all([
                fetch("/api/chats/conceptual"),
                fetch("/api/chats/problems"),
            ]);

            if (cRes.ok) {
                const { chats: c } = await cRes.json();
                const chats: Chat[] = (c ?? []).map(normChat);
                setConceptualChats(chats);
                if (chats.length) {
                    setActiveConceptualIdState(chats[0].id);
                    // Pre-load messages for the first (active) chat
                    loadMessagesById(chats[0].id, "conceptual");
                }
            }

            if (pRes.ok) {
                const { chats: p } = await pRes.json();
                const chats: Chat[] = (p ?? []).map(normChat);
                setProblemChats(chats);
                if (chats.length) {
                    setActiveProblemIdState(chats[0].id);
                    loadMessagesById(chats[0].id, "problem");
                }
            }
        } catch {
            // Network error or server not ready — silently continue with empty chats
        } finally {
            setChatLoading(false);
        }
    };

    /* ── Message loading ── */

    const loadMessagesById = useCallback(async (chatId: string, type: "conceptual" | "problem") => {
        const loaded = type === "conceptual" ? loadedConceptual : loadedProblem;
        if (loaded.current.has(chatId)) return; // already loaded
        loaded.current.add(chatId);

        // Warm from localStorage immediately (instant UX)
        const local = lsMsgsGet(chatId);
        if (local.length) {
            if (type === "conceptual") {
                setConceptualMessages(prev => ({ ...prev, [chatId]: local }));
            } else {
                setProblemMessages(prev => ({ ...prev, [chatId]: local }));
            }
        }

        // Then fetch from Supabase (authoritative)
        try {
            const res = await fetch(`/api/chats/messages?chat_id=${chatId}`);
            if (res.ok) {
                const { messages } = await res.json();
                if (messages?.length) {
                    if (type === "conceptual") {
                        setConceptualMessages(prev => ({ ...prev, [chatId]: messages }));
                    } else {
                        setProblemMessages(prev => ({ ...prev, [chatId]: messages }));
                    }
                    lsMsgsSet(chatId, messages); // keep localStorage in sync
                }
            }
        } catch {
            /* Stay with localStorage data */
        }
    }, []);

    const loadConceptualMessages = useCallback((chatId: string) =>
        loadMessagesById(chatId, "conceptual"), [loadMessagesById]);

    const loadProblemMessages = useCallback((chatId: string) =>
        loadMessagesById(chatId, "problem"), [loadMessagesById]);

    /* ── Message getters ── */

    const getConceptualMessages = useCallback((chatId: string): ChatMessage[] =>
        conceptualMessages[chatId] ?? [], [conceptualMessages]);

    const getProblemMessages = useCallback((chatId: string): ChatMessage[] =>
        problemMessages[chatId] ?? [], [problemMessages]);

    /* ── Message savers ── */

    const saveConceptualMessages = useCallback(async (chatId: string, messages: ChatMessage[]) => {
        // Update context immediately (optimistic)
        setConceptualMessages(prev => ({ ...prev, [chatId]: messages }));
        // Save to localStorage immediately
        lsMsgsSet(chatId, messages);
        // Persist to Supabase (fire and forget)
        try {
            await fetch("/api/chats/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, chat_type: "conceptual", messages }),
            });
        } catch { /* localStorage is fallback */ }
    }, []);

    const saveProblemMessages = useCallback(async (chatId: string, messages: ChatMessage[]) => {
        setProblemMessages(prev => ({ ...prev, [chatId]: messages }));
        lsMsgsSet(chatId, messages);
        try {
            await fetch("/api/chats/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, chat_type: "problem", messages }),
            });
        } catch { }
    }, []);

    /* ── setActiveConceptualId: load messages when switching chats ── */

    const setActiveConceptualId = useCallback((id: string) => {
        setActiveConceptualIdState(id);
        loadMessagesById(id, "conceptual");
    }, [loadMessagesById]);

    const setActiveProblemId = useCallback((id: string) => {
        setActiveProblemIdState(id);
        loadMessagesById(id, "problem");
    }, [loadMessagesById]);

    /* ── Conceptual CRUD ── */

    const createConceptualChat = useCallback(async (): Promise<string> => {
        try {
            const res = await fetch("/api/chats/conceptual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "New Chat", mode: "both" }),
            });
            if (res.ok) {
                const { chat } = await res.json();
                const c = normChat(chat);
                setConceptualChats(prev => [c, ...prev]);
                setActiveConceptualIdState(c.id);
                setConceptualMessages(prev => ({ ...prev, [c.id]: [] }));
                loadedConceptual.current.add(c.id);
                return c.id;
            }
        } catch { }
        // Local fallback
        const id = `local_${Date.now()}`;
        const c: Chat = { id, title: "New Chat", mode: "both", exam: "JEE Main", keywords: [], updatedAt: new Date().toISOString() };
        setConceptualChats(prev => [c, ...prev]);
        setActiveConceptualIdState(id);
        setConceptualMessages(prev => ({ ...prev, [id]: [] }));
        loadedConceptual.current.add(id);
        return id;
    }, []);

    const updateConceptualChat = useCallback(async (id: string, patch: Partial<Chat>) => {
        setConceptualChats(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
        try {
            await fetch("/api/chats/conceptual", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...patch }),
            });
        } catch { }
    }, []);

    const deleteConceptualChat = useCallback(async (id: string) => {
        setConceptualChats(prev => {
            const rest = prev.filter(c => c.id !== id);
            setActiveConceptualIdState(curr => curr === id ? (rest[0]?.id ?? null) : curr);
            return rest;
        });
        setConceptualMessages(prev => { const n = { ...prev }; delete n[id]; return n; });
        loadedConceptual.current.delete(id);
        try { await fetch(`/api/chats/conceptual?id=${id}`, { method: "DELETE" }); } catch { }
    }, []);

    const renameConceptualChat = useCallback(async (id: string, title: string) => {
        await updateConceptualChat(id, { title });
    }, [updateConceptualChat]);

    /* ── Problem chat CRUD ── */

    const createProblemChat = useCallback(async (): Promise<string> => {
        try {
            const res = await fetch("/api/chats/problems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "New Problem", mode: "both" }),
            });
            if (res.ok) {
                const { chat } = await res.json();
                const c = normChat(chat);
                setProblemChats(prev => [c, ...prev]);
                setActiveProblemIdState(c.id);
                setProblemMessages(prev => ({ ...prev, [c.id]: [] }));
                loadedProblem.current.add(c.id);
                return c.id;
            }
        } catch { }
        const id = `local_${Date.now()}`;
        const c: Chat = { id, title: "New Problem", mode: "both", exam: "JEE Main", keywords: [], updatedAt: new Date().toISOString() };
        setProblemChats(prev => [c, ...prev]);
        setActiveProblemIdState(id);
        setProblemMessages(prev => ({ ...prev, [id]: [] }));
        loadedProblem.current.add(id);
        return id;
    }, []);

    const updateProblemChat = useCallback(async (id: string, patch: Partial<Chat>) => {
        setProblemChats(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
        try {
            await fetch("/api/chats/problems", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...patch }),
            });
        } catch { }
    }, []);

    const deleteProblemChat = useCallback(async (id: string) => {
        setProblemChats(prev => {
            const rest = prev.filter(c => c.id !== id);
            setActiveProblemIdState(curr => curr === id ? (rest[0]?.id ?? null) : curr);
            return rest;
        });
        setProblemMessages(prev => { const n = { ...prev }; delete n[id]; return n; });
        loadedProblem.current.delete(id);
        try { await fetch(`/api/chats/problems?id=${id}`, { method: "DELETE" }); } catch { }
    }, []);

    const renameProblemChat = useCallback(async (id: string, title: string) => {
        await updateProblemChat(id, { title });
    }, [updateProblemChat]);

    /* ── Derived values ── */
    const activeConceptualChat = conceptualChats.find(c => c.id === activeConceptualId) ?? null;
    const activeProblemChat = problemChats.find(c => c.id === activeProblemId) ?? null;
    const lastConceptualKeywords = activeConceptualChat?.keywords ?? [];

    return (
        <ChatContext.Provider value={{
            conceptualChats, activeConceptualId, setActiveConceptualId,
            createConceptualChat, updateConceptualChat, deleteConceptualChat, renameConceptualChat,
            activeConceptualChat,

            problemChats, activeProblemId, setActiveProblemId,
            createProblemChat, updateProblemChat, deleteProblemChat, renameProblemChat,
            activeProblemChat,

            conceptualMessages, problemMessages,
            getConceptualMessages, getProblemMessages,
            saveConceptualMessages, saveProblemMessages,
            loadConceptualMessages, loadProblemMessages,

            lastConceptualKeywords,
            chatLoading,
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChats() {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error("useChats must be used inside ChatProvider");
    return ctx;
}

/* ── Helpers ─────────────────────────────────────────────── */
function normChat(raw: any): Chat {
    return {
        id: raw.id,
        title: raw.title ?? "New Chat",
        mode: (raw.mode as ChatMode) ?? "both",
        exam: raw.exam ?? "JEE Main",
        keywords: raw.keywords ?? [],
        updatedAt: raw.updated_at ?? raw.updatedAt ?? new Date().toISOString(),
    };
}
