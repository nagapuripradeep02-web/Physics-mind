/**
 * POST /api/progress → upsert module score (keeps highest score)
 */
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
    try {
        const supabase = await createSupabaseServer();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const { module_id, score } = await req.json();
        if (module_id == null || score == null) {
            return Response.json({ error: "module_id, score required" }, { status: 400 });
        }

        const session_id = user.id;

        // Only update if the new score is higher than the current one
        const { data: existing } = await supabaseAdmin
            .from("module_progress")
            .select("score")
            .eq("session_id", session_id)
            .eq("module_id", module_id)
            .single();

        const currentScore = existing?.score ?? 0;
        const newScore = Math.max(currentScore, Math.min(100, score));

        const { error } = await supabaseAdmin.from("module_progress").upsert(
            { session_id, module_id, score: newScore },
            { onConflict: "session_id,module_id" }
        );

        if (error) throw error;
        return Response.json({ ok: true, score: newScore });
    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}
