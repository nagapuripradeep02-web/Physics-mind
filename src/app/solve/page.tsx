"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/contexts/ProfileContext";
import TopNav from "@/components/TopNav";
import CompetitiveTab from "@/components/sections/CompetitiveTab";
import { Sigma } from "lucide-react";

export default function SolvePage() {
    const router = useRouter();
    const { profile, loading } = useProfile();

    useEffect(() => {
        if (!loading && !profile?.onboardingComplete) {
            router.replace("/");
        }
    }, [loading, profile?.onboardingComplete, router]);

    if (loading || !profile?.onboardingComplete) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col">
            <TopNav />
            <div className="px-4 pt-5 max-w-6xl w-full mx-auto">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1.5">
                    <Sigma className="w-3.5 h-3.5" />
                    Solve — Problem Walkthrough
                </div>
                <h1 className="text-2xl font-bold text-white">Upload a problem</h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Photo of a question, screenshot, or paste the text. The AI will identify the concepts involved and walk through the solution.
                </p>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden mt-4">
                <CompetitiveTab />
            </div>
        </div>
    );
}
