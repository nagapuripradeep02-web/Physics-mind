/**
 * POST /api/classify-confusion
 *
 * Takes a student's typed confusion phrase on a specific concept+state and
 * returns the best-matching cluster_id from confusion_cluster_registry.
 * Used by the TeacherPlayer "I'm confused about..." input to key the
 * drill-down cache.
 *
 * Request:  { confusion_text: string, concept_id: string, state_id?: string, session_id?: string }
 * Response: { cluster_id: string | null, confidence: number, reasoning: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { classifyConfusion } from "@/lib/confusionClassifier";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const confusionText = typeof body.confusion_text === "string" ? body.confusion_text.trim() : "";
        const conceptId = typeof body.concept_id === "string" ? body.concept_id.trim() : "";
        const stateId = typeof body.state_id === "string" ? body.state_id.trim() : undefined;
        const sessionId = typeof body.session_id === "string" ? body.session_id.trim() : undefined;

        if (!confusionText) {
            return NextResponse.json({ error: "confusion_text is required" }, { status: 400 });
        }
        if (!conceptId) {
            return NextResponse.json({ error: "concept_id is required" }, { status: 400 });
        }

        const result = await classifyConfusion({
            confusionText,
            conceptId,
            stateId,
            sessionId,
        });

        return NextResponse.json({
            cluster_id: result.clusterId,
            confidence: result.confidence,
            reasoning: result.reasoning,
        });
    } catch (err) {
        console.error("[classify-confusion] EXCEPTION:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
