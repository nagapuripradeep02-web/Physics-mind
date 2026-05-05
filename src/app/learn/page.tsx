"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/contexts/ProfileContext";
import { resolveClassLevels } from "@/types/student";
import type { CatalogChapter } from "@/lib/conceptCatalog";
import TopNav from "@/components/TopNav";
import CatalogTree from "@/components/CatalogTree";
import GuidedPath from "@/components/GuidedPath";
import { BookOpen, ChevronLeft } from "lucide-react";

type View = "path" | "all";

export default function LearnPage() {
    const router = useRouter();
    const { profile, loading } = useProfile();
    const [chapters, setChapters] = useState<CatalogChapter[]>([]);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<View>("path");

    // Restore view preference on mount; persist whenever it changes.
    useEffect(() => {
        try {
            const saved = window.localStorage.getItem("learn:view");
            if (saved === "path" || saved === "all") setView(saved);
        } catch {
            // localStorage unavailable (private mode, SSR, etc.) — silently keep default.
        }
    }, []);
    useEffect(() => {
        try {
            window.localStorage.setItem("learn:view", view);
        } catch {
            // ignore persistence failures
        }
    }, [view]);

    const classLevels = profile ? resolveClassLevels(profile) : [];
    const levelsKey = classLevels.join(",");

    useEffect(() => {
        if (loading) return;
        if (!profile?.onboardingComplete) {
            router.replace("/");
            return;
        }
        if (classLevels.length === 0) return;
        let cancelled = false;
        setFetching(true);
        setError(null);
        fetch(`/api/catalog?levels=${levelsKey}`)
            .then(res => {
                if (!res.ok) throw new Error(`Catalog fetch failed: ${res.status}`);
                return res.json();
            })
            .then((data: { chapters: CatalogChapter[] }) => {
                if (cancelled) return;
                setChapters(data.chapters ?? []);
            })
            .catch((e: unknown) => {
                if (cancelled) return;
                setError(e instanceof Error ? e.message : "Failed to load catalog");
            })
            .finally(() => {
                if (!cancelled) setFetching(false);
            });
        return () => {
            cancelled = true;
        };
    }, [loading, profile?.onboardingComplete, levelsKey, router, classLevels.length]);

    if (loading || !profile) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const classLabel = classLevels.length === 1
        ? `Class ${classLevels[0]}`
        : `Class ${classLevels.join(" + ")}`;

    return (
        <div className="min-h-screen bg-black flex flex-col">
            <TopNav />
            <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {view === "path" ? "Today's Path" : "All Topics"}
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        {view === "path" ? `${classLabel} · Learn Physics` : `${classLabel} Catalog`}
                    </h1>
                    {view === "all" && (
                        <button
                            onClick={() => setView("path")}
                            className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-blue-400 transition-colors"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Back to Today&apos;s Path
                        </button>
                    )}
                </div>

                {fetching && chapters.length === 0 && (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-8 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-sm text-zinc-400">Loading your catalog…</p>
                    </div>
                )}

                {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {!fetching && !error && view === "path" && (
                    <GuidedPath
                        chapters={chapters}
                        onShowAllTopics={() => setView("all")}
                    />
                )}

                {!fetching && !error && view === "all" && (
                    <CatalogTree chapters={chapters} classLevels={classLevels} />
                )}
            </main>
        </div>
    );
}
