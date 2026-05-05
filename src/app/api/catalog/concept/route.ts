import { NextResponse, type NextRequest } from "next/server";
import { getCatalogConcept } from "@/lib/conceptCatalog";

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    if (!id || !/^[a-z][a-z0-9_]*$/.test(id)) {
        return NextResponse.json({ concept: null }, { status: 400 });
    }
    const concept = await getCatalogConcept(id);
    return NextResponse.json({ concept });
}
