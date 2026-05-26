/**
 * POST /api/comprehension/log-interaction
 *
 * Writes one completed row to state_interaction_log per state visit.
 * Called by TeacherPlayer when a state exits (next state arrives OR unmount).
 *
 * Spec: physics-mind/docs/COMPREHENSION_METRIC.md §2.1 + §7.1
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface LogInteractionBody {
    session_id: string;
    user_email?: string | null;
    concept_id: string;
    state_id: string;
    state_index: number;
    mode?: string;
    class_level?: number | null;
    entered_at: string;
    exited_at?: string | null;
    dwell_ms?: number | null;
    replay_count?: number;
    asked_explain?: boolean;
    typed_confusion?: boolean;
    completed?: boolean;
    abandoned?: boolean;
    device_class?: string | null;
    network_type?: string | null;
    metadata?: Record<string, unknown> | null;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = (await req.json()) as LogInteractionBody;

        if (!body.session_id || !body.concept_id || !body.state_id || body.entered_at == null) {
            return NextResponse.json(
                { error: "Missing required fields: session_id, concept_id, state_id, entered_at" },
                { status: 400 }
            );
        }

        const { error } = await supabaseAdmin.from("state_interaction_log").insert({
            session_id: body.session_id,
            user_email: body.user_email ?? null,
            concept_id: body.concept_id,
            state_id: body.state_id,
            state_index: body.state_index,
            mode: body.mode ?? "conceptual",
            class_level: body.class_level ?? null,
            entered_at: body.entered_at,
            exited_at: body.exited_at ?? null,
            dwell_ms: body.dwell_ms ?? null,
            replay_count: body.replay_count ?? 0,
            asked_explain: body.asked_explain ?? false,
            typed_confusion: body.typed_confusion ?? false,
            completed: body.completed ?? false,
            abandoned: body.abandoned ?? false,
            device_class: body.device_class ?? null,
            network_type: body.network_type ?? null,
            metadata: body.metadata ?? null,
        });

        if (error) {
            console.error("[comprehension/log-interaction] insert failed:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err: unknown) {
        console.error("[comprehension/log-interaction] unexpected error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
