/**
 * POST /api/concepts          → upsert a concept
 * PATCH /api/concepts         → update concept status
 */
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
    try {
        const supabase = await createSupabaseServer();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const { concept } = await req.json();
        if (!concept) {
            return Response.json({ error: "concept required" }, { status: 400 });
        }

        const session_id = user.id;

        const { error } = await supabaseAdmin.from("concepts").upsert(
            {
                id: concept.id,
                session_id,
                name: concept.name,
                concept_class: concept.conceptClass,
                subject: concept.subject,
                status: concept.status,
            },
            { onConflict: "id,session_id" }
        );

        if (error) throw error;
        return Response.json({ ok: true });
    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const supabase = await createSupabaseServer();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const { concept_id, status } = await req.json();
        if (!concept_id || !status) {
            return Response.json({ error: "concept_id, status required" }, { status: 400 });
        }

        const session_id = user.id;

        const { error } = await supabaseAdmin
            .from("concepts")
            .update({ status })
            .eq("id", concept_id)
            .eq("session_id", session_id);

        if (error) throw error;
        return Response.json({ ok: true });
    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}
