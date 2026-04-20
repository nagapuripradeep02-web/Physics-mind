"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { detectTopic } from "@/lib/topicDetector";

/* ── Types ───────────────────────────────────────────────── */

export interface ResponseBookmark {
    type: "response";
    content: string;
    section: "conceptual" | "competitive" | "solver";
}

export interface MCQBookmark {
    type: "mcq_question";
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
    exam: string;
    difficulty: string;
    marks?: string;
    exam_tip?: string;
}

export type BookmarkPayload = ResponseBookmark | MCQBookmark;

export interface Bookmark {
    id: string;
    payload: BookmarkPayload;
    topic: { name: string; colorClass: string };
    created_at: string;
}

/* ── Storage helpers ─────────────────────────────────────── */

const LS_KEY = "pm_bookmarks";
const MAX_LOCAL = 100;

function loadFromStorage(): Bookmark[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
    } catch {
        return [];
    }
}

function saveToStorage(items: Bookmark[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(LS_KEY, JSON.stringify(items.slice(0, MAX_LOCAL)));
}

/* ── Context ─────────────────────────────────────────────── */

interface BookmarkContextValue {
    bookmarks: Bookmark[];
    count: number;
    addBookmark: (payload: BookmarkPayload) => string;  // returns id
    removeBookmark: (id: string) => void;
    isBookmarked: (id: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function BookmarkProvider({ children }: { children: ReactNode }) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

    // Hydrate from localStorage on mount
    useEffect(() => {
        setBookmarks(loadFromStorage());
    }, []);

    // Persist to localStorage whenever bookmarks change
    useEffect(() => {
        if (bookmarks.length >= 0) saveToStorage(bookmarks);
    }, [bookmarks]);

    const addBookmark = useCallback((payload: BookmarkPayload): string => {
        const text = payload.type === "response"
            ? payload.content
            : `${(payload as MCQBookmark).question} ${(payload as MCQBookmark).options?.join(" ")}`;

        const topic = detectTopic(text);
        const id = `bm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const bookmark: Bookmark = { id, payload, topic, created_at: new Date().toISOString() };

        setBookmarks(prev => [bookmark, ...prev]);
        return id;
    }, []);

    const removeBookmark = useCallback((id: string) => {
        setBookmarks(prev => prev.filter(b => b.id !== id));
    }, []);

    const isBookmarked = useCallback((id: string) => {
        return bookmarks.some(b => b.id === id);
    }, [bookmarks]);

    return (
        <BookmarkContext.Provider value={{ bookmarks, count: bookmarks.length, addBookmark, removeBookmark, isBookmarked }}>
            {children}
        </BookmarkContext.Provider>
    );
}

export function useBookmarks() {
    const ctx = useContext(BookmarkContext);
    if (!ctx) throw new Error("useBookmarks must be used inside BookmarkProvider");
    return ctx;
}
