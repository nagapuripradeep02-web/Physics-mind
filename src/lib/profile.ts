/**
 * Profile data layer — backed by Supabase via Next.js API routes.
 * All functions are async; the ProfileContext awaits them.
 */
import type { StudentProfile, ConceptEntry } from "@/types/student";
import { getSessionId } from "./session";

// ── Profile ──────────────────────────────────────────────────

export async function getProfile(): Promise<StudentProfile | null> {
    try {
        const sid = await getSessionId();
        const res = await fetch(`/api/student?session_id=${sid}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.profile ?? null;
    } catch {
        return null;
    }
}

export async function saveProfile(profile: StudentProfile): Promise<void> {
    const sid = await getSessionId();
    await fetch("/api/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid, profile }),
    });
}

// ── Concepts ─────────────────────────────────────────────────

export async function getConcepts(): Promise<ConceptEntry[]> {
    try {
        const sid = await getSessionId();
        const res = await fetch(`/api/student?session_id=${sid}`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.concepts ?? [];
    } catch {
        return [];
    }
}

export async function saveConcept(concept: ConceptEntry): Promise<void> {
    const sid = await getSessionId();
    await fetch("/api/concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid, concept }),
    });
}

export async function updateConceptStatus(
    id: string,
    status: "understood" | "needs_review"
): Promise<void> {
    const sid = await getSessionId();
    await fetch("/api/concepts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid, concept_id: id, status }),
    });
}

// ── Module Progress ───────────────────────────────────────────

export async function getModuleProgress(): Promise<Record<number, number>> {
    try {
        const sid = await getSessionId();
        const res = await fetch(`/api/student?session_id=${sid}`);
        if (!res.ok) return {};
        const data = await res.json();
        return data.moduleProgress ?? {};
    } catch {
        return {};
    }
}

export async function saveModuleProgress(
    moduleId: number,
    score: number
): Promise<void> {
    const sid = await getSessionId();
    await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid, module_id: moduleId, score }),
    });
}

