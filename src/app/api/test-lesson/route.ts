/**
 * Temporary test route for Part 1 verification.
 * Usage: GET /api/test-lesson?q=explain+KVL
 * Delete this file after confirming Part 1 works.
 */
import { generateLesson } from "@/lib/teacherEngine";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get("q") ?? "explain KVL";
    const mode = req.nextUrl.searchParams.get("mode") ?? "competitive";
    const cls = req.nextUrl.searchParams.get("class") ?? "12";

    console.log(`[test-lesson] q="${q}" mode="${mode}" class="${cls}"`);

    const lesson = await generateLesson(q, mode, cls);

    if (!lesson) {
        return NextResponse.json(
            { error: "Lesson generation failed — check server logs" },
            { status: 500 }
        );
    }

    return NextResponse.json({ lesson }, { status: 200 });
}
