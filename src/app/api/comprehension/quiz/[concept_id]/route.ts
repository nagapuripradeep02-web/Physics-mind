/**
 * GET /api/comprehension/quiz/[concept_id]
 *
 * Returns all active MCQs for a concept, grouped by state.
 * Called by ComprehensionMCQOverlay to populate questions on sim completion.
 *
 * Spec: physics-mind/docs/COMPREHENSION_METRIC.md §2.2 + §6
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface QuizOption {
    id: string;
    text: string;
    is_correct: boolean;
    distractor_label?: string;
}

export interface QuizQuestion {
    id: number;
    concept_id: string;
    state_id: string;
    question_index: number;
    question_text: string;
    question_type: "mcq_single" | "mcq_multi" | "true_false";
    options: QuizOption[];
    correct_explanation: string | null;
    state_concept_tag: string;
    weight: number;
    difficulty: "easy" | "medium" | "hard";
}

interface RouteContext {
    params: Promise<{ concept_id: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
    try {
        const { concept_id } = await ctx.params;
        if (!concept_id) {
            return NextResponse.json({ error: "Missing concept_id" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from("state_comprehension_quiz")
            .select(
                "id, concept_id, state_id, question_index, question_text, question_type, options, correct_explanation, state_concept_tag, weight, difficulty"
            )
            .eq("concept_id", concept_id)
            .eq("active", true)
            .order("state_id", { ascending: true })
            .order("question_index", { ascending: true });

        if (error) {
            console.error("[comprehension/quiz] select failed:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ questions: (data ?? []) as QuizQuestion[] });
    } catch (err: unknown) {
        console.error("[comprehension/quiz] unexpected error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
