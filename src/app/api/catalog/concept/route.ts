import { NextResponse, type NextRequest } from "next/server";
import { getCatalogConcept } from "@/lib/conceptCatalog";
import type { Subject } from "@/types/student";

// Mirrors the Set-driven parse in ../route.ts (2026-08-04) — see the comment there.
// A two-branch `===` chain silently returns the PHYSICS catalog for any subject it
// has not been taught about, which reads as an empty subject rather than an error.
const VALID_SUBJECTS = new Set<Subject>(["physics", "chemistry", "mathematics"]);

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    if (!id || !/^[a-z][a-z0-9_]*$/.test(id)) {
        return NextResponse.json({ concept: null }, { status: 400 });
    }
    // Optional subject filter — defaults to physics so existing callers are unchanged.
    const rawSubject = req.nextUrl.searchParams.get("subject");
    const subject: Subject = rawSubject !== null && VALID_SUBJECTS.has(rawSubject as Subject)
        ? (rawSubject as Subject)
        : "physics";
    const concept = await getCatalogConcept(id, subject);
    return NextResponse.json({ concept });
}
