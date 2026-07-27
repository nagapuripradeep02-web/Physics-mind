import { NextResponse, type NextRequest } from "next/server";
import { getCatalogConcept } from "@/lib/conceptCatalog";
import type { Subject } from "@/types/student";

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    if (!id || !/^[a-z][a-z0-9_]*$/.test(id)) {
        return NextResponse.json({ concept: null }, { status: 400 });
    }
    // Optional subject filter — defaults to physics so existing callers are unchanged.
    const subject: Subject = req.nextUrl.searchParams.get("subject") === "chemistry" ? "chemistry" : "physics";
    const concept = await getCatalogConcept(id, subject);
    return NextResponse.json({ concept });
}
