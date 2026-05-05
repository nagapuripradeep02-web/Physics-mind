"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/contexts/ProfileContext";
import ProgressTrackerClient from "@/app/ProgressTrackerClient";

export default function ChatPage() {
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
        <main className="flex min-h-screen bg-black text-zinc-100 font-sans selection:bg-blue-500/30">
            <ProgressTrackerClient />
        </main>
    );
}
