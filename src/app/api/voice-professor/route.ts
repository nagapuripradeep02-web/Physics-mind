/**
 * POST /api/voice-professor — generative voice-professor brain (Option B).
 *
 * Sonnet reasons + explains the concept live and decides the simulation
 * operations itself, returning a validated "beats" plan (narration + sim ops).
 * Rule 18 / Session-72: the model is grounded in the concept's authored physics
 * and every operation is validated against the whitelist before it reaches the
 * sim. Teacher-facing generative demo (the teacher is the human check).
 *
 * Request:  { concept_id, intent?, transcript?, current_state?, history?, session_id? }
 * Response: Server-Sent Events (text/event-stream). Each frame is `data: <json>` where
 *           json is {type:"beat",beat} | {type:"done",state_ids,meta} | {type:"error",error}.
 *           Beats stream as the model emits them so the client can speak beat 1 early.
 *           Malformed requests still return JSON 4xx (not a stream).
 */

import { NextRequest, NextResponse } from "next/server";
import {
    runProfessorTurnStream,
    conceptExists,
    ConceptNotFoundError,
    type ProfessorIntent,
    type ProfessorHistoryTurn,
} from "@/lib/voiceProfessor/professorBrain";

const VALID_INTENTS = new Set<ProfessorIntent>(["doubt", "start_lesson", "explain_whole"]);
const ACTORS = new Set(["founder_test", "student", "reviewer"]);
function asActor(v: unknown): "founder_test" | "student" | "reviewer" {
    return typeof v === "string" && ACTORS.has(v) ? (v as "founder_test" | "student" | "reviewer") : "founder_test";
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
        return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
    }
    const conceptId = typeof body.concept_id === "string" ? body.concept_id.trim() : "";
    const intent: ProfessorIntent = VALID_INTENTS.has(body.intent) ? body.intent : "doubt";
    const transcript = typeof body.transcript === "string" ? body.transcript.trim() : "";
    const currentState = typeof body.current_state === "string" ? body.current_state.trim() : undefined;
    const cva = body.current_view_axis;
    const currentViewAxis: [number, number, number] | undefined =
        Array.isArray(cva) && cva.length === 3 && cva.every((n) => typeof n === "number" && Number.isFinite(n))
            ? [cva[0], cva[1], cva[2]]
            : undefined;
    const isVec3 = (a: unknown): a is [number, number, number] =>
        Array.isArray(a) && a.length === 3 && a.every((n) => typeof n === "number" && Number.isFinite(n));
    let objectDirections: Record<string, [number, number, number]> | undefined;
    if (body.object_directions && typeof body.object_directions === "object") {
        const out: Record<string, [number, number, number]> = {};
        for (const [k, val] of Object.entries(body.object_directions as Record<string, unknown>)) {
            if (isVec3(val)) out[k] = val;
        }
        if (Object.keys(out).length > 0) objectDirections = out;
    }
    const sessionId = typeof body.session_id === "string" ? body.session_id.trim() : undefined;
    const actor = asActor(body.actor);

    const history: ProfessorHistoryTurn[] = Array.isArray(body.history)
        ? (body.history as unknown[])
              .map((h): ProfessorHistoryTurn | null => {
                  if (!h || typeof h !== "object") return null;
                  const rec = h as Record<string, unknown>;
                  const text = typeof rec.text === "string" ? rec.text.trim() : "";
                  if (!text) return null;
                  return { role: rec.role === "professor" ? "professor" : "student", text };
              })
              .filter((h): h is ProfessorHistoryTurn => h !== null)
        : [];

    // 4xx validation stays JSON (the client can res.json() these; only a 200 streams).
    if (!conceptId) {
        return NextResponse.json({ error: "concept_id is required" }, { status: 400 });
    }
    if (intent === "doubt" && !transcript) {
        return NextResponse.json({ error: "transcript is required" }, { status: 400 });
    }
    if (!conceptExists(conceptId)) {
        return NextResponse.json({ error: `No voice-professor concept '${conceptId}'` }, { status: 404 });
    }

    // Stream beats as Server-Sent Events so the client speaks beat 1 while the
    // rest is still generating. One JSON object per `data:` frame.
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            const send = (obj: unknown) =>
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
            try {
                const tail = await runProfessorTurnStream(
                    { conceptId, intent, transcript, currentState, currentViewAxis, objectDirections, sessionId, history, actor },
                    (beat) => send({ type: "beat", beat }),
                );
                send({
                    type: "done",
                    state_ids: tail.stateIds,
                    meta: { dropped_ops: tail.droppedOps, fallback_used: tail.fallbackUsed },
                });
            } catch (err) {
                if (err instanceof ConceptNotFoundError) {
                    send({ type: "error", error: `No voice-professor concept '${err.message}'` });
                } else {
                    console.error("[voice-professor] STREAM EXCEPTION:", err);
                    send({ type: "error", error: "Internal error" });
                }
            } finally {
                try { controller.close(); } catch { /* already closed */ }
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
