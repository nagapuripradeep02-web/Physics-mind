"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

const EXAM_GROUPS = [
    {
        label: "🏆 Popular Exams",
        exams: ["JEE Main", "JEE Advanced", "NEET", "MHT-CET", "TS EAMCET", "AP EAMCET"],
    },
    {
        label: "📋 Other Entrances",
        exams: ["WBJEE", "KCET", "COMEDK", "BITSAT", "VITEEE", "KEAM (Kerala)", "GUJCET", "CUET"],
    },
];

const ALL_EXAMS = EXAM_GROUPS.flatMap(g => g.exams);

interface ExamSelectorProps {
    value: string;
    onChange: (exam: string) => void;
}

export default function ExamSelector({ value, onChange }: ExamSelectorProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Focus search when opening
    useEffect(() => {
        if (open) setTimeout(() => searchRef.current?.focus(), 50);
    }, [open]);

    const filtered = search.trim()
        ? ALL_EXAMS.filter(e => e.toLowerCase().includes(search.toLowerCase()))
        : null;

    const showCustomOption = search.trim() && !ALL_EXAMS.some(e => e.toLowerCase() === search.toLowerCase());

    const select = (exam: string) => {
        onChange(exam);
        setOpen(false);
        setSearch("");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between gap-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded-xl px-4 py-3 text-sm text-zinc-200 transition-all"
            >
                <span className="font-medium">{value || "Select exam..."}</span>
                <ChevronDown className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
                    {/* Search */}
                    <div className="p-3 border-b border-zinc-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                            <input
                                ref={searchRef}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search exam (e.g. OJEE, BCECE...)"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            {search && (
                                <button onClick={() => setSearch("")} className="absolute right-2 top-2 p-0.5 text-zinc-500 hover:text-zinc-300">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto py-2">
                        {/* Custom option */}
                        {showCustomOption && (
                            <button onClick={() => select(search.trim())}
                                className="w-full text-left px-4 py-2.5 text-sm text-blue-400 hover:bg-blue-500/10 transition-colors flex items-center gap-2">
                                <span className="text-blue-500">+</span>
                                Generate questions for &ldquo;<strong>{search.trim()}</strong>&rdquo;
                            </button>
                        )}

                        {/* Filtered list */}
                        {filtered ? (
                            filtered.length > 0 ? filtered.map(exam => (
                                <button key={exam} onClick={() => select(exam)}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${value === exam ? "bg-blue-600/20 text-blue-300" : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"}`}>
                                    {exam}
                                </button>
                            )) : !showCustomOption && (
                                <p className="px-4 py-4 text-sm text-zinc-600 text-center">No matches</p>
                            )
                        ) : (
                            EXAM_GROUPS.map(group => (
                                <div key={group.label}>
                                    <p className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{group.label}</p>
                                    {group.exams.map(exam => (
                                        <button key={exam} onClick={() => select(exam)}
                                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${value === exam ? "bg-blue-600/20 text-blue-300" : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"}`}>
                                            {exam}
                                            {value === exam && <span className="float-right text-blue-400">✓</span>}
                                        </button>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
