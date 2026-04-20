"use client";

import { useState } from "react";
import { Search, Trash2, ChevronDown, ChevronUp, X, RotateCcw, Share2 } from "lucide-react";
import Link from "next/link";
import { useBookmarks, type Bookmark, type MCQBookmark } from "@/contexts/BookmarkContext";
import { shareViaWhatsApp } from "@/lib/whatsapp";
import { detectTopic } from "@/lib/topicDetector";

/* ── Helpers ───────────────────────────────────────── */
function formatRelativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

/* ── Solve-Again mini quiz ─────────────────────────── */
function SolveAgain({ bm }: { bm: MCQBookmark }) {
    const [selected, setSelected] = useState<number | null>(null);
    return (
        <div className="mt-3 space-y-2">
            {bm.options.map((opt, i) => {
                let style = "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500";
                if (selected !== null) {
                    if (i === bm.correct_index) style = "bg-emerald-500/15 border-emerald-500 text-emerald-300";
                    else if (i === selected) style = "bg-red-500/15 border-red-500 text-red-300";
                    else style = "bg-zinc-900/50 border-zinc-800 text-zinc-600";
                }
                return (
                    <button key={i} onClick={() => selected === null && setSelected(i)}
                        className={`w-full text-left border rounded-lg px-3 py-2.5 text-xs transition-all flex gap-2 ${style}`}>
                        <span className="font-bold opacity-50 shrink-0">{["A", "B", "C", "D"][i]}</span>
                        <span>{opt}</span>
                    </button>
                );
            })}
            {selected !== null && (
                <div className="bg-zinc-800/60 rounded-lg p-3 text-xs text-zinc-400 leading-relaxed">
                    {bm.explanation}
                </div>
            )}
            {selected !== null && (
                <button onClick={() => setSelected(null)} className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" />Try again
                </button>
            )}
        </div>
    );
}

/* ── Response Card ─────────────────────────────────── */
function ResponseCard({ bm, onDelete }: { bm: Bookmark; onDelete: () => void }) {
    const [expanded, setExpanded] = useState(false);
    const content = (bm.payload as any).content as string;
    const preview = content.slice(0, 180);

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${bm.topic.colorClass}`}>
                            {bm.topic.name}
                        </span>
                        <span className="text-[10px] text-zinc-600 capitalize">{(bm.payload as any).section}</span>
                        <span className="text-[10px] text-zinc-700">{formatRelativeTime(bm.created_at)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => shareViaWhatsApp(bm.topic.name, content)}
                        className="p-1 text-zinc-700 hover:text-green-400 transition-colors" title="Share via WhatsApp">
                        <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={onDelete} className="p-1 text-zinc-700 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
                {expanded ? content : `${preview}${content.length > 180 ? "…" : ""}`}
            </p>

            {content.length > 180 && (
                <button onClick={() => setExpanded(e => !e)}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    {expanded ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />Show more</>}
                </button>
            )}
        </div>
    );
}

/* ── MCQ Card ──────────────────────────────────────── */
function MCQCard({ bm, onDelete }: { bm: Bookmark; onDelete: () => void }) {
    const mcq = bm.payload as MCQBookmark;
    const [showSolve, setShowSolve] = useState(false);

    const diffColor = mcq.difficulty === "hard" ? "text-red-400 bg-red-500/10 border-red-500/20"
        : mcq.difficulty === "medium" ? "text-orange-400 bg-orange-500/10 border-orange-500/20"
            : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 hover:border-zinc-700 transition-colors">
            <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${bm.topic.colorClass}`}>
                            {bm.topic.name}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border text-blue-400 bg-blue-500/10 border-blue-500/20">
                            {mcq.exam}
                        </span>
                        {mcq.difficulty && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${diffColor}`}>
                                {mcq.difficulty}
                            </span>
                        )}
                        <span className="text-[10px] text-zinc-700">{formatRelativeTime(bm.created_at)}</span>
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed">{mcq.question}</p>
                </div>
                <button onClick={onDelete} className="p-1 text-zinc-700 hover:text-red-400 transition-colors shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {showSolve && <SolveAgain bm={mcq} />}

            <div className="flex items-center gap-2">
                <button onClick={() => setShowSolve(s => !s)}
                    className={`text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${showSolve ? "bg-zinc-800 border-zinc-700 text-zinc-300" : "bg-zinc-800/60 border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"}`}>
                    <RotateCcw className="w-3 h-3" />
                    {showSolve ? "Hide" : "Solve Again"}
                </button>
                <button
                    onClick={() => shareViaWhatsApp(mcq.exam + " MCQ", mcq.question + "\n\nCorrect: " + mcq.options[mcq.correct_index])}
                    className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-zinc-800/60 border-zinc-700/50 text-zinc-500 hover:text-green-400 hover:border-green-500/30 transition-all">
                    <Share2 className="w-3 h-3" />Share
                </button>
            </div>
        </div>
    );
}

/* ── Main Page ─────────────────────────────────────── */
export default function BookmarksPage() {
    const { bookmarks, removeBookmark } = useBookmarks();
    const [tab, setTab] = useState<"responses" | "questions">("responses");
    const [search, setSearch] = useState("");
    const [diffFilter, setDiffFilter] = useState<string>("all");
    const [examFilter, setExamFilter] = useState<string>("all");

    const responses = bookmarks.filter(b => b.payload.type === "response");
    const questions = bookmarks.filter(b => b.payload.type === "mcq_question");

    const filteredResponses = responses.filter(b =>
        !search || JSON.stringify(b).toLowerCase().includes(search.toLowerCase())
    );

    const filteredQuestions = questions.filter(b => {
        const mcq = b.payload as MCQBookmark;
        if (search && !JSON.stringify(b).toLowerCase().includes(search.toLowerCase())) return false;
        if (diffFilter !== "all" && mcq.difficulty !== diffFilter) return false;
        if (examFilter !== "all" && mcq.exam !== examFilter) return false;
        return true;
    });

    // Unique exams for filter
    const uniqueExams = [...new Set(questions.map(b => (b.payload as MCQBookmark).exam).filter(Boolean))];

    const isEmpty = tab === "responses" ? filteredResponses.length === 0 : filteredQuestions.length === 0;

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            {/* Header */}
            <div className="bg-zinc-950 border-b border-zinc-800 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm">
                        ← Back
                    </Link>
                    <div className="w-px h-4 bg-zinc-800" />
                    <div>
                        <h1 className="text-sm font-semibold text-zinc-100">My Study Library</h1>
                        <p className="text-[10px] text-zinc-600">{bookmarks.length} saved item{bookmarks.length !== 1 ? "s" : ""}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
                {/* Tabs */}
                <div className="flex gap-1 bg-zinc-900 rounded-xl p-1 border border-zinc-800">
                    <button onClick={() => setTab("responses")}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "responses" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}>
                        💬 Saved Responses {responses.length > 0 && <span className="text-xs opacity-60">({responses.length})</span>}
                    </button>
                    <button onClick={() => setTab("questions")}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "questions" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}>
                        ❓ Saved Questions {questions.length > 0 && <span className="text-xs opacity-60">({questions.length})</span>}
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={tab === "responses" ? "Search saved responses..." : "Search saved questions..."}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                    {search && <button onClick={() => setSearch("")} className="absolute right-3 top-2.5 text-zinc-600 hover:text-zinc-400"><X className="w-4 h-4" /></button>}
                </div>

                {/* MCQ filters */}
                {tab === "questions" && questions.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        {["all", "easy", "medium", "hard"].map(d => (
                            <button key={d} onClick={() => setDiffFilter(d)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize ${diffFilter === d ? "bg-blue-600 border-blue-500 text-white" : "bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500"}`}>
                                {d === "all" ? "All Difficulties" : d}
                            </button>
                        ))}
                        {uniqueExams.slice(0, 4).map(exam => (
                            <button key={exam} onClick={() => setExamFilter(examFilter === exam ? "all" : exam)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${examFilter === exam ? "bg-blue-600 border-blue-500 text-white" : "bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500"}`}>
                                {exam}
                            </button>
                        ))}
                    </div>
                )}

                {/* Items */}
                {isEmpty ? (
                    <div className="py-16 text-center space-y-3">
                        <div className="text-5xl mb-2">🔖</div>
                        <p className="text-zinc-300 font-medium">Nothing saved yet</p>
                        <p className="text-sm text-zinc-600 max-w-xs mx-auto leading-relaxed">
                            Bookmark responses and questions as you study — they&apos;ll appear here as your personal study library.
                        </p>
                        <Link href="/"
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors">
                            Start Studying →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tab === "responses"
                            ? filteredResponses.map(bm => <ResponseCard key={bm.id} bm={bm} onDelete={() => removeBookmark(bm.id)} />)
                            : filteredQuestions.map(bm => <MCQCard key={bm.id} bm={bm} onDelete={() => removeBookmark(bm.id)} />)
                        }
                    </div>
                )}
            </div>
        </div>
    );
}
