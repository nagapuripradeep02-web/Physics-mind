import { NextResponse, type NextRequest } from "next/server";
import { getCatalogTree } from "@/lib/conceptCatalog";
import type { ClassLevel, Subject } from "@/types/student";

const VALID_LEVELS = new Set<ClassLevel>([10, 11, 12]);

// Optional `subject` filter (CHEMISTRY_BUILD_PLAN.md Phase 1). Defaults to physics,
// so existing callers (no subject param) get the identical physics catalog.
function parseSubject(raw: string | null): Subject {
    return raw === "chemistry" ? "chemistry" : "physics";
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
