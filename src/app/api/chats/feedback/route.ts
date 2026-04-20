import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
    try {
        const supabase = await createSupabaseServer();
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id ?? "anonymous";
        const { chat_id, message_idx, rating } = await req.json();
        await supabaseAdmin.from("chat_feedback").insert({ user_id: userId, chat_id, message_idx, rating });
        return Response.json({ ok: true });
    } catch {
        return Response.json({ ok: false });
    }
}
