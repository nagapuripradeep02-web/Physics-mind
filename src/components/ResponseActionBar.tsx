"use client";

import { useState } from "react";
import { Copy, Check, Bookmark, BookmarkCheck, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { shareViaWhatsApp } from "@/lib/whatsapp";
import { detectTopic } from "@/lib/topicDetector";

interface ResponseActionBarProps {
    content: string;
    section: "conceptual" | "competitive" | "solver";
    messageId: string;
}

export default function ResponseActionBar({ content, section, messageId }: ResponseActionBarProps) {
    const { addBookmark } = useBookmarks();
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [shared, setShared] = useState(false);
    const [thumbed, setThumbed] = useState<"up" | "down" | null>(null);

    const handleCopy = async () => {
        try { await navigator.clipboard.writeText(content); } catch { }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = () => {
        if (saved) return;
        addBookmark({ type: "response", content, section });
        setSaved(true);
    };

    const handleShare = () => {
        const topic = detectTopic(content).name;
        shareViaWhatsApp(topic, content);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
    };

    const btn = (active: boolean, activeClass: string) =>
        `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${active ? activeClass : "bg-zinc-800/80 text-zinc-500 border border-zinc-700/50 hover:text-zinc-300 hover:border-zinc-600"
        }`;

    return (
        <div className="flex items-center gap-1 mt-2 opacity-70 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 flex-wrap">
            <button onClick={handleCopy} className={btn(copied, "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25")}>
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
            </button>

            <button onClick={handleSave} className={btn(saved, "bg-amber-500/15 text-amber-400 border border-amber-500/25")}>
                {saved ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                {saved ? "Saved ✓" : "Save"}
            </button>

            <button onClick={handleShare} className={btn(shared, "bg-green-500/15 text-green-400 border border-green-500/25")}>
                <Share2 className="w-3 h-3" />
                {shared ? "Shared!" : "Share"}
            </button>

            <div className="ml-0.5 flex items-center gap-0.5">
                <button onClick={() => setThumbed(thumbed === "up" ? null : "up")}
                    className={`p-1.5 rounded-lg transition-all ${thumbed === "up" ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800"}`}>
                    <ThumbsUp className="w-3 h-3" />
                </button>
                <button onClick={() => setThumbed(thumbed === "down" ? null : "down")}
                    className={`p-1.5 rounded-lg transition-all ${thumbed === "down" ? "text-red-400 bg-red-500/10" : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800"}`}>
                    <ThumbsDown className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
