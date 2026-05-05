import { NextResponse, type NextRequest } from "next/server";
import { getCatalogTree } from "@/lib/conceptCatalog";
import type { ClassLevel } from "@/types/student";

const VALID_LEVELS = new Set<ClassLevel>([10, 11, 12]);

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
    const chapters = await getCatalogTree(levels);
    return NextResponse.json({ chapters });
}
