import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createSupabaseServer } from "@/lib/supabaseServer";

async function getUserId(): Promise<string | null> {
    const supabase = await createSupabaseServer();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
}

export async function GET() {
    const userId = await getUserId();
    if (!userId) return Response.json({ chats: [] });
    const { data, error } = await supabaseAdmin
        .from("problem_chats")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(50);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ chats: data });
}

export async function POST(req: Request) {
    const userId = await getUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { data, error } = await supabaseAdmin
        .from("problem_chats")
        .insert({ user_id: userId, title: body.title ?? "New Problem", mode: body.mode ?? "both" })
        .select()
        .single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ chat: data });
}

export async function PATCH(req: Request) {
    const userId = await getUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { id, ...patch } = await req.json();
    const { error } = await supabaseAdmin
        .from("problem_chats")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
    const userId = await getUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
    const { error } = await supabaseAdmin
        .from("problem_chats")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
}
