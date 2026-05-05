"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Check, Compass, Lock, Play, Sparkles } from "lucide-react";
import type { CatalogChapter, CatalogConcept } from "@/lib/conceptCatalog";
import { useProfile } from "@/contexts/ProfileContext";

type SpineState = "completed" | "current" | "future";

interface SpineRow {
    concept: CatalogConcept;
    state: SpineState;
}

interface GuidedPathProps {
    chapters: CatalogChapter[];
    onShowAllTopics: () => void;
}

interface ChapterSpine {
    chapter: CatalogChapter;
    rows: SpineRow[];
    completedCount: number;
    totalSpineCount: number;
}

function buildSpine(
    chapters: CatalogChapter[],
    completedIds: Set<string>,
): {
    perChapter: ChapterSpine[];
    currentConcept: CatalogConcept | null;
    totalSpine: number;
    completedSpine: number;
} {
    const perChapter: ChapterSpine[] = [];
    let currentConcept: CatalogConcept | null = null;
    let totalSpine = 0;
    let completedSpine = 0;

    for (const ch of chapters) {
        const spineConcepts = ch.concepts.filter(c => c.is_spine === true);
        if (spineConcepts.length === 0) continue;

        const rows: SpineRow[] = spineConcepts.map(c => {
            if (completedIds.has(c.concept_id)) {
                return { concept: c, state: "completed" };
            }
            if (currentConcept === null && c.status === "live") {
                currentConcept = c;
                return { concept: c, state: "current" };
            }
            return { concept: c, state: "future" };
        });

        const chapterCompleted = rows.filter(r => r.state === "completed").length;
        totalSpine += rows.length;
        completedSpine += chapterCompleted;

        perChapter.push({
            chapter: ch,
            rows,
            completedCount: chapterCompleted,
            totalSpineCount: rows.length,
        });
    }

    return { perChapter, currentConcept, totalSpine, completedSpine };
}

function HeroCard({ concept }: { concept: CatalogConcept }) {
    return (
        <Link
            href={`/learn/${concept.concept_id}`}
            className="group block rounded-xl border border-blue-500/40 bg-gradient-to-br from-blue-600/15 via-blue-600/5 to-transparent p-5 hover:from-blue-600/25 hover:to-blue-600/10 transition-all"
        >
            <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-500/50 text-blue-200 shrink-0">
                    <Compass className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-300/80">
                    Today&apos;s lesson
                </span>
            </div>
            <div className="text-xl font-bold text-white leading-tight mb-1 group-hover:text-blue-100">
                {concept.concept_name}
            </div>
            {concept.section_name && (
                <div className="text-xs text-zinc-400 mb-3">
                    {concept.section_name}
                </div>
            )}
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-200 group-hover:text-white">
                Continue <Play className="w-3.5 h-3.5 fill-current" />
            </span>
        </Link>
    );
}

function CompletionCard({ onShowAllTopics }: { onShowAllTopics: () => void }) {
    return (
        <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-600/15 to-transparent p-5">
            <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 shrink-0">
                    <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300/80">
                    Core path complete
                </span>
            </div>
            <div className="text-lg font-bold text-white leading-tight mb-3">
                You&apos;ve finished the must-know lessons.
            </div>
            <button
                onClick={onShowAllTopics}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-200 hover:text-white transition-colors"
            >
                Explore the rest →
            </button>
        </div>
    );
}

function PathPendingCard() {
    return (
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-600/10 to-transparent p-5">
            <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-600/20 border border-amber-500/40 text-amber-200 shrink-0">
                    <Compass className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-300/80">
                    Path being built
                </span>
            </div>
            <div className="text-lg font-bold text-white leading-tight mb-1">
                Your guided lessons are coming.
            </div>
            <p className="text-sm text-zinc-400">
                We&apos;re crafting each lesson by hand. Check back soon — the must-know
                concepts in your track will unlock first.
            </p>
        </div>
    );
}

function SpineRowCard({ row }: { row: SpineRow }) {
    const { concept, state } = row;
    const isLive = concept.status === "live";

    if (state === "completed") {
        return (
            <Link
                href={`/learn/${concept.concept_id}`}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg border border-emerald-700/30 bg-emerald-900/10 hover:bg-emerald-900/20 transition-all"
            >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                </span>
                <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-zinc-300 truncate">
                        {concept.concept_name}
                    </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400/70">Done</span>
            </Link>
        );
    }

    if (state === "current") {
        return (
            <Link
                href={`/learn/${concept.concept_id}`}
                className="group flex items-center gap-3 px-3 py-3 rounded-lg border-2 border-blue-500/60 bg-blue-600/10 hover:bg-blue-600/15 transition-all ring-2 ring-blue-500/20"
            >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/40 border border-blue-400/60 text-blue-100 shrink-0">
                    <Play className="w-3.5 h-3.5 fill-current" />
                </span>
                <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-white truncate">
                        {concept.concept_name}
                    </div>
                    <div className="text-[10px] text-blue-300/80 mt-0.5">Up next</div>
                </div>
                <span className="text-[11px] font-semibold text-blue-200 group-hover:text-white">
                    Begin →
                </span>
            </Link>
        );
    }

    // future: clickable but visually de-emphasized; ghost concepts even more so
    if (!isLive) {
        return (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 cursor-not-allowed">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-600 shrink-0">
                    <Lock className="w-3 h-3" />
                </span>
                <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-zinc-500 truncate">
                        {concept.concept_name}
                    </div>
                </div>
                <span className="text-[10px] font-semibold text-amber-500/70 bg-amber-500/5 border border-amber-500/20 px-1.5 py-0.5 rounded">
                    Coming soon
                </span>
            </div>
        );
    }

    return (
        <Link
            href={`/learn/${concept.concept_id}`}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all"
        >
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500 shrink-0">
                <Play className="w-3 h-3 fill-current" />
            </span>
            <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-zinc-400 truncate">
                    {concept.concept_name}
                </div>
            </div>
        </Link>
    );
}

function ChapterSpineSection({ spine }: { spine: ChapterSpine }) {
    const { chapter, rows, completedCount, totalSpineCount } = spine;
    return (
        <section className="space-y-2">
            <div className="flex items-center gap-2 px-1">
                <h3 className="text-sm font-bold text-zinc-100">{chapter.chapter_name}</h3>
                <span className="text-[11px] font-semibold text-zinc-500">
                    {completedCount} of {totalSpineCount} done
                </span>
                <span className="flex-1 h-px bg-zinc-800" />
            </div>
            <div className="space-y-1.5">
                {rows.map(r => (
                    <SpineRowCard key={r.concept.concept_id} row={r} />
                ))}
            </div>
        </section>
    );
}

export default function GuidedPath({ chapters, onShowAllTopics }: GuidedPathProps) {
    const { concepts } = useProfile();

    const completedIds = useMemo(() => {
        return new Set(
            concepts.filter(c => c.status === "understood").map(c => c.id),
        );
    }, [concepts]);

    const { perChapter, currentConcept, totalSpine, completedSpine } = useMemo(
        () => buildSpine(chapters, completedIds),
        [chapters, completedIds],
    );

    if (perChapter.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center">
                <Compass className="w-6 h-6 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-400">
                    No guided path available yet for your class.
                </p>
                <button
                    onClick={onShowAllTopics}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 mt-3"
                >
                    Browse all topics →
                </button>
            </div>
        );
    }

    const allComplete = totalSpine > 0 && completedSpine === totalSpine;

    return (
        <div className="space-y-5">
            {currentConcept ? (
                <HeroCard concept={currentConcept} />
            ) : allComplete ? (
                <CompletionCard onShowAllTopics={onShowAllTopics} />
            ) : (
                <PathPendingCard />
            )}

            {perChapter.map(spine => (
                <ChapterSpineSection
                    key={`${spine.chapter.class_level}-${spine.chapter.chapter_number}`}
                    spine={spine}
                />
            ))}

            <div className="pt-2 text-center">
                <button
                    onClick={onShowAllTopics}
                    className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    See all topics →
                </button>
            </div>
        </div>
    );
}
