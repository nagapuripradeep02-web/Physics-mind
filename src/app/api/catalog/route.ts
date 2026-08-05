import { NextResponse, type NextRequest } from "next/server";
import { getCatalogTree } from "@/lib/conceptCatalog";
import type { ClassLevel, Subject } from "@/types/student";

const VALID_LEVELS = new Set<ClassLevel>([10, 11, 12]);

// Optional `subject` filter (CHEMISTRY_BUILD_PLAN.md Phase 1; mathematics added
// 2026-08-04, MATHEMATICS_BUILD_PLAN.md Phase 1). Defaults to physics, so existing
// callers (no subject param) get the identical physics catalog.
//
// Driven off a Set rather than a chain of `===` so adding a subject to the `Subject`
// union cannot silently leave this route behind. The previous two-branch form was
// exactly that trap: `?subject=mathematics` would have returned the PHYSICS catalog
// with a 200, which reads as "mathematics has no concepts" rather than as an error.
const VALID_SUBJECTS = new Set<Subject>(["physics", "chemistry", "mathematics"]);

function parseSubject(raw: string | null): Subject {
    return raw !== null && VALID_SUBJECTS.has(raw as Subject) ? (raw as Subject) : "physics";
}

function parseLevels(raw: string | null): ClassLevel[] {
    if (!raw) return [];
    const tokens = raw.split(",").map(s => s.trim()).filter(Boolean);
    const out: ClassLevel[] = [];
    for (const t of tokens) {
        const n = Number.parseInt(t, 10);
        if (n === 10 || n === 11 || n === 12) {
            if (VALID_LEVELS.has(n) && !out.includes(n)) out.push(n);
        }
    }
    return out;
}

export async function GET(req: NextRequest) {
    const levels = parseLevels(req.nextUrl.searchParams.get("levels"));
    if (levels.length === 0) {
        return NextResponse.json({ chapters: [] });
    }
    const subject = parseSubject(req.nextUrl.searchParams.get("subject"));
    const chapters = await getCatalogTree(levels, subject);
    return NextResponse.json({ chapters });
}
