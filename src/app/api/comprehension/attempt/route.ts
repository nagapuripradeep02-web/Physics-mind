/**
 * POST /api/comprehension/attempt
 *
 * Records one MCQ answer per call. Called by ComprehensionMCQOverlay after
 * each student answer.
 *
 * Spec: physics-mind/docs/COMPREHENSION_METRIC.md §2.3
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface AttemptBody {
    session_id: string;
    user_email?: string | null;
    concept_id: string;
    state_id: string;
    question_id: number;
    chosen_option: string;
    is_correct: boolean;
    time_to_answer_ms?: number | null;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = (await req.json()) as AttemptBody;

        if (
            !body.session_id ||
            !body.concept_id ||
            !body.state_id ||
            body.question_id == null ||
            !body.chosen_option ||
            body.is_correct == null
        ) {
            return NextResponse.json(
                {
                    error:
                        "Missing required fields: session_id, concept_id, state_id, question_id, chosen_option, is_correct",
                },
                { status: 400 }
            );
        }

        const { error } = await supabaseAdmin.from("comprehension_attempt").insert({
            session_id: body.session_id,
            user_email: body.user_email ?? null,
            concept_id: body.concept_id,
            state_id: body.state_id,
            question_id: body.question_id,
            chosen_option: body.chosen_option,
            is_correct: body.is_correct,
            time_to_answer_ms: body.time_to_answer_ms ?? null,
        });

        if (error) {
            console.error("[comprehension/attempt] insert failed:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err: unknown) {
        console.error("[comprehension/attempt] unexpected error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
