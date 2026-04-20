"use client";

import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";
import Onboarding from "@/components/Onboarding";
import ProgressTrackerClient from "./ProgressTrackerClient";
import type { StudentProfile } from "@/types/student";

function AppShell() {
    const { profile, loading, saveProfileData } = useProfile();

    // Wait for Supabase data to load
    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile?.onboardingComplete) {
        return (
            <Onboarding
                onComplete={(p: StudentProfile) => {
                    saveProfileData(p);
                }}
            />
        );
    }

    return <ProgressTrackerClient />;
}

export default function Home() {
    return (
        <ProfileProvider>
            <main className="flex min-h-screen bg-black text-zinc-100 font-sans selection:bg-blue-500/30">
                <AppShell />
            </main>
        </ProfileProvider>
    );
}
