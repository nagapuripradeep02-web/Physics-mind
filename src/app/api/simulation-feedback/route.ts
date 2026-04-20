import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      session_id,
      concept_id,
      confusion_pattern_id,
      student_rating,      // "confused"|"neutral"|"clear"|"great"
      interaction_data,    // slider events, time per state
      was_confusion_correct,
      sim_html_length,
    } = body;

    if (!session_id || !concept_id || !student_rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("simulation_feedback")
      .insert({
        session_id,
        concept_id,
        confusion_pattern_id: confusion_pattern_id ?? null,
        student_rating,
        interaction_data: interaction_data ?? null,
        was_confusion_correct: was_confusion_correct ?? null,
        sim_html_length: sim_html_length ?? null,
      });

    if (error) {
      console.error("[sim-feedback] insert failed:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[sim-feedback] unexpected error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
