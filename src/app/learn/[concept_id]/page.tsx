"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Compass, Lock } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { resolveClassLevels } from "@/types/student";
import TopNav from "@/components/TopNav";
import LessonCard from "@/components/LessonCard";
import type { CatalogConcept } from "@/lib/conceptCatalog";

interface CatalogConceptResponse {
    concept: CatalogConcept | null;
}

export default function LessonPage() {
    const params = useParams<{ concept_id: string }>();
    const router = useRouter();
    const { profile, loading, concepts: studentConcepts } = useProfile();
    const [concept, setConcept] = useState<CatalogConcept | null>(null);
    const [fetching, setFetching] = useState(true);
    const [continueAnyway, setContinueAnyway] = useState(false);
    const conceptId = params?.concept_id ?? "";

    const completedIds = useMemo(
        () => new Set(studentConcepts.filter(c => c.status === "understood").map(c => c.id)),
        [studentConcepts],
    );
    const lockedPrereqs = useMemo(() => {
        if (!concept) return [];
        return concept.prerequisites.filter(p => !completedIds.has(p));
    }, [concept, completedIds]);
    const isSoftBlocked = !continueAnyway && lockedPrereqs.length > 0 && concept?.status === "live";

    useEffect(() => {
        // Reset the dismissal whenever the concept changes — different lesson, fresh decision.
        setContinueAnyway(false);
    }, [conceptId]);

    useEffect(() => {
        if (loading) return;
        if (!profile?.onboardingComplete) {
            router.replace("/");
            return;
        }
        let cancelled = false;
        setFetching(true);
        fetch(`/api/catalog/concept?id=${encodeURIComponent(conceptId)}`)
            .then(res => (res.ok ? res.json() : { concept: null }))
            .then((data: CatalogConceptResponse) => {
                if (!cancelled) setConcept(data.concept);
            })
            .finally(() => {
                if (!cancelled) setFetching(false);
            });
        return () => { cancelled = true; };
    }, [conceptId, loading, profile?.onboardingComplete, router]);

    const classLevels = profile ? resolveClassLevels(profile) : [];
    const classLevel = classLevels[0] ?? 11;

    if (loading || !profile) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col">
            <TopNav />
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-5">
                {/* Breadcrumb */}
                <Link
                    href="/learn"
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors self-start"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back to catalog
                </Link>

                {/* Loading concept metadata */}
                {fetching && (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-8 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-sm text-zinc-400">Loading concept…</p>
                    </div>
                )}

                {/* Not found */}
                {!fetching && !concept && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
                        <h1 className="text-lg font-bold text-amber-300 mb-1">Concept not found</h1>
                        <p className="text-sm text-zinc-400">
                            <code className="text-amber-400">{conceptId}</code> is not in the registered catalog.
                        </p>
                        <Link href="/learn" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 mt-3">
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Back to catalog
                        </Link>
                    </div>
                )}

                {/* Concept found */}
                {!fetching && concept && (
                    <article className="flex flex-col gap-5">
                        {/* Header */}
                        <header>
                            <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">
                                <span>Class {concept.class_level}</span>
                                {concept.section_name && (
                                    <>
                                        <span>·</span>
                                        <span>{concept.section_name}</span>
                                    </>
                                )}
                            </div>
                            <h1 className="text-2xl font-bold text-white leading-tight">
                                {concept.concept_name}
                            </h1>
                            {concept.prerequisites.length > 0 && (
                                <p className="text-xs text-zinc-500 mt-2">
                                    Builds on:{" "}
                                    {concept.prerequisites.map((p, i) => (
                                        <span key={p}>
                                            {i > 0 && <span className="mx-1 text-zinc-700">·</span>}
                                            <Link
                                                href={`/learn/${p}`}
                                                className="text-zinc-400 hover:text-blue-400 transition-colors"
                                            >
                                                {p.replace(/_/g, " ")}
                                            </Link>
                                        </span>
                                    ))}
                                </p>
                            )}
                        </header>

                        {/* Ghost concept */}
                        {concept.status === "ghost" ? (
                            <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-6 text-center">
                                <Lock className="w-6 h-6 text-amber-400/60 mx-auto mb-3" />
                                <h2 className="text-base font-bold text-amber-200 mb-1">Coming soon</h2>
                                <p className="text-sm text-zinc-400 max-w-md mx-auto">
                                    This concept is on the roadmap but the simulation hasn&apos;t been authored yet.
                                </p>
                                <Link
                                    href="/learn"
                                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 mt-4"
                                >
                                    Browse other concepts
                                </Link>
                            </div>
                        ) : isSoftBlocked ? (
                            <div className="rounded-xl border border-blue-500/40 bg-gradient-to-br from-blue-600/10 to-transparent p-6">
                                <div className="flex items-start gap-4">
                                    <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600/25 border border-blue-500/40 text-blue-200 shrink-0">
                                        <Compass className="w-5 h-5" />
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-base font-bold text-white mb-1">
                                            This builds on {lockedPrereqs.length === 1 ? "another lesson" : `${lockedPrereqs.length} earlier lessons`}.
                                        </h2>
                                        <p className="text-sm text-zinc-400 mb-3">
                                            Most students get the most out of this lesson after finishing:
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {lockedPrereqs.map(p => (
                                                <Link
                                                    key={p}
                                                    href={`/learn/${p}`}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-100 hover:bg-blue-600/30 hover:text-white transition-all"
                                                >
                                                    Start with {p.replace(/_/g, " ")} →
                                                </Link>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setContinueAnyway(true)}
                                            className="text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition-colors"
                                        >
                                            Continue anyway
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <LessonCard concept={concept} classLevel={classLevel} />
                        )}
                    </article>
                )}
            </main>
        </div>
    );
}
