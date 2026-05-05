"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Play, Lock, Sparkles, Search, Compass, X } from "lucide-react";
import type { CatalogChapter, CatalogConcept } from "@/lib/conceptCatalog";

interface CatalogTreeProps {
    chapters: CatalogChapter[];
    classLevels: number[];
}

interface ChapterCardProps {
    chapter: CatalogChapter;
    defaultExpanded: boolean;
    forceExpanded: boolean;
    filter: string;
}

function sectionKey(section: string): string {
    if (!section) return '';
    const parts = section.split('.');
    return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : section;
}

function matchesFilter(concept: CatalogConcept, filter: string): boolean {
    if (!filter) return true;
    const f = filter.toLowerCase();
    return (
        concept.concept_name.toLowerCase().includes(f) ||
        concept.concept_id.toLowerCase().includes(f) ||
        (concept.section_name?.toLowerCase().includes(f) ?? false)
    );
}

function ConceptRow({ concept, highlight }: { concept: CatalogConcept; highlight: string }) {
    const isLive = concept.status === "live";
    const prereqs = concept.prerequisites.filter(Boolean);
    const ringClass = highlight && matchesFilter(concept, highlight)
        ? "ring-1 ring-blue-500/50"
        : "";

    if (isLive) {
        return (
            <Link
                href={`/learn/${concept.concept_id}`}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/80 hover:border-blue-500/40 transition-all ${ringClass}`}
            >
                <span className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-600/15 border border-blue-500/30 text-blue-300 group-hover:bg-blue-600/25 transition-colors">
                    <Play className="w-3 h-3 fill-current" />
                </span>
                <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-zinc-100 truncate">
                        {concept.concept_name}
                    </div>
                    {prereqs.length > 0 && (
                        <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                            Builds on: {prereqs.join(" · ")}
                        </div>
                    )}
                </div>
            </Link>
        );
    }

    return (
        <div className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 cursor-not-allowed ${ringClass}`}>
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-600">
                <Lock className="w-3 h-3" />
            </span>
            <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-zinc-500 truncate">
                    {concept.concept_name}
                </div>
                {prereqs.length > 0 && (
                    <div className="text-[10px] text-zinc-600 truncate mt-0.5">
                        Builds on: {prereqs.join(" · ")}
                    </div>
                )}
            </div>
            <span className="text-[10px] font-semibold text-amber-500/70 bg-amber-500/5 border border-amber-500/20 px-1.5 py-0.5 rounded shrink-0">
                Coming soon
            </span>
        </div>
    );
}

function SectionDivider({ name }: { name?: string }) {
    return (
        <div className="flex items-center gap-2 pt-2.5 pb-1 px-1 first:pt-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 truncate">
                {name ?? "Topic"}
            </span>
            <span className="flex-1 h-px bg-zinc-800" />
        </div>
    );
}

const COLLAPSE_THRESHOLD = 3;

function SectionGroup({
    name,
    concepts,
    filter,
}: {
    name?: string;
    concepts: CatalogConcept[];
    filter: string;
}) {
    const [showAll, setShowAll] = useState(false);
    const overThreshold = concepts.length > COLLAPSE_THRESHOLD;
    // When the user is searching, always show all matches in the section.
    const visible = !filter && overThreshold && !showAll
        ? concepts.slice(0, COLLAPSE_THRESHOLD)
        : concepts;
    const hidden = concepts.length - visible.length;

    return (
        <div className="space-y-1.5">
            <SectionDivider name={name} />
            {visible.map(c => (
                <ConceptRow key={c.concept_id} concept={c} highlight={filter} />
            ))}
            {!filter && overThreshold && (
                <button
                    onClick={() => setShowAll(prev => !prev)}
                    className="w-full text-left text-[11px] text-zinc-500 hover:text-blue-400 px-3 py-1.5 transition-colors"
                >
                    {showAll
                        ? `Show fewer ▲`
                        : `Show ${hidden} more in ${name ?? "this topic"} ▾`}
                </button>
            )}
        </div>
    );
}

function StartHereCard({
    concept,
    chapterName,
}: {
    concept: CatalogConcept;
    chapterName: string;
}) {
    return (
        <Link
            href={`/learn/${concept.concept_id}`}
            className="group flex items-center gap-3 p-3 rounded-lg border border-blue-500/40 bg-gradient-to-r from-blue-600/10 to-blue-600/5 hover:from-blue-600/20 hover:to-blue-600/10 transition-all"
        >
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-500/50 text-blue-200 shrink-0">
                <Compass className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-blue-300/80">
                    Start here · {chapterName}
                </div>
                <div className="text-[14px] font-bold text-zinc-100 truncate mt-0.5 group-hover:text-white">
                    {concept.concept_name}
                </div>
            </div>
            <span className="flex items-center gap-1 text-[12px] font-semibold text-blue-200 group-hover:text-white shrink-0">
                Begin <Play className="w-3 h-3 fill-current" />
            </span>
        </Link>
    );
}

function ChapterCard({ chapter, defaultExpanded, forceExpanded, filter }: ChapterCardProps) {
    const [userExpanded, setUserExpanded] = useState(defaultExpanded);
    const expanded = forceExpanded || userExpanded;
    const ChevronIcon = expanded ? ChevronDown : ChevronRight;
    const hasLive = chapter.live_count > 0;
    const isFullyBuilt = chapter.live_count === chapter.total_count;

    const visibleConcepts = useMemo(() => {
        if (!filter) return chapter.concepts;
        return chapter.concepts.filter(c => matchesFilter(c, filter));
    }, [chapter.concepts, filter]);

    const entryConcept = useMemo(() => {
        if (!chapter.entry_point_concept_id) return null;
        return chapter.concepts.find(
            c => c.concept_id === chapter.entry_point_concept_id && c.status === 'live',
        ) ?? null;
    }, [chapter.entry_point_concept_id, chapter.concepts]);

    if (filter && visibleConcepts.length === 0) {
        return null;
    }

    return (
        <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
            <button
                onClick={() => setUserExpanded(prev => !prev)}
                aria-expanded={expanded}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-900/60 transition-colors"
            >
                <ChevronIcon className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="text-[11px] font-mono text-zinc-500 shrink-0 w-10">
                    Ch.{chapter.chapter_number}
                </span>
                <h3 className="flex-1 text-sm font-semibold text-zinc-100 truncate">
                    {chapter.chapter_name}
                </h3>
                {filter && visibleConcepts.length > 0 && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 shrink-0">
                        {visibleConcepts.length} match{visibleConcepts.length === 1 ? "" : "es"}
                    </span>
                )}
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${hasLive
                    ? isFullyBuilt
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                        : "bg-blue-500/10 text-blue-300 border border-blue-500/30"
                    : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                    }`}>
                    {chapter.live_count} / {chapter.total_count} ready
                </span>
            </button>
            {expanded && visibleConcepts.length > 0 && (
                <div className="px-3 pb-3 pt-0 space-y-2 border-t border-zinc-800/60">
                    {!filter && entryConcept && (
                        <div className="pt-3">
                            <StartHereCard concept={entryConcept} chapterName={chapter.chapter_name} />
                        </div>
                    )}
                    {(() => {
                        // Group concepts by section key for collapsible per-section rendering.
                        const groups: { key: string; name?: string; items: CatalogConcept[] }[] = [];
                        let cursor: { key: string; name?: string; items: CatalogConcept[] } | null = null;
                        for (const c of visibleConcepts) {
                            const key = sectionKey(c.section);
                            if (!cursor || cursor.key !== key) {
                                cursor = { key, name: c.section_name, items: [] };
                                groups.push(cursor);
                            }
                            cursor.items.push(c);
                        }
                        return groups.map(g => (
                            <SectionGroup
                                key={`group-${g.key}`}
                                name={g.name}
                                concepts={g.items}
                                filter={filter}
                            />
                        ));
                    })()}
                </div>
            )}
        </section>
    );
}

export default function CatalogTree({ chapters, classLevels }: CatalogTreeProps) {
    const [filter, setFilter] = useState("");
    const trimmed = filter.trim();

    const visibleChapters = useMemo(() => {
        if (!trimmed) return chapters;
        return chapters.filter(ch => ch.concepts.some(c => matchesFilter(c, trimmed)));
    }, [chapters, trimmed]);

    if (chapters.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center">
                <Sparkles className="w-6 h-6 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-400">
                    No chapters available for {classLevels.length === 0 ? "your" : `Class ${classLevels.join(", ")}`} yet.
                </p>
                <p className="text-xs text-zinc-600 mt-1.5">
                    The Class 11 catalog (Chapters 5–8) is the most complete today.
                </p>
            </div>
        );
    }

    const firstLiveChapterIdx = chapters.findIndex(c => c.live_count > 0);
    const totalMatches = trimmed
        ? chapters.reduce((sum, ch) => sum + ch.concepts.filter(c => matchesFilter(c, trimmed)).length, 0)
        : 0;

    return (
        <div className="space-y-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                    type="text"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    placeholder="Search concepts (e.g. 'pseudo', 'normal reaction', 'projectile')…"
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl pl-9 pr-9 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
                {filter && (
                    <button
                        onClick={() => setFilter("")}
                        aria-label="Clear search"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {trimmed && (
                <div className="text-[11px] text-zinc-500 px-1">
                    {totalMatches === 0 ? (
                        <>No concepts match <span className="text-zinc-300">&ldquo;{trimmed}&rdquo;</span>.</>
                    ) : (
                        <>{totalMatches} concept{totalMatches === 1 ? "" : "s"} match <span className="text-zinc-300">&ldquo;{trimmed}&rdquo;</span> across {visibleChapters.length} chapter{visibleChapters.length === 1 ? "" : "s"}.</>
                    )}
                </div>
            )}

            {visibleChapters.map((chapter, idx) => (
                <ChapterCard
                    key={`${chapter.class_level}-${chapter.chapter_number}`}
                    chapter={chapter}
                    defaultExpanded={!trimmed && idx === firstLiveChapterIdx}
                    forceExpanded={!!trimmed}
                    filter={trimmed}
                />
            ))}
        </div>
    );
}
