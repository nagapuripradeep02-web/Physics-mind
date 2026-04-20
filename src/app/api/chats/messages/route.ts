/**
 * GET  /api/chats/messages?chat_id=xxx  → fetch all messages for a chat
 * POST /api/chats/messages              → save messages (full replace)
 *
 * Requires chat_messages table:
 * CREATE TABLE IF NOT EXISTS chat_messages (
 *   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   chat_id uuid NOT NULL,
 *   chat_type text NOT NULL,
 *   role text NOT NULL,
 *   content text NOT NULL,
 *   created_at timestamptz DEFAULT now()
 * );
 * CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
 */
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createSupabaseServer } from "@/lib/supabaseServer";

async function getUserId(): Promise<string | null> {
    const supabase = await createSupabaseServer();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
}

export async function GET(req: Request) {
    const userId = await getUserId();
    if (!userId) return Response.json({ messages: [] });

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chat_id");
    if (!chatId) return Response.json({ error: "chat_id required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
        .from("chat_messages")
        .select("role, content, created_at")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

    if (error) {
        // Table may not exist yet — return empty so app still works
        console.error("chat_messages fetch error:", error.message);
        return Response.json({ messages: [] });
    }

    return Response.json({
        messages: (data ?? []).map(r => ({
            role: r.role,
            content: r.content,
            timestamp: new Date(r.created_at).getTime(),
        })),
    });
}

export async function POST(req: Request) {
    const userId = await getUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { chat_id, chat_type, messages } = await req.json();
    if (!chat_id || !messages?.length) {
        return Response.json({ error: "chat_id and messages required" }, { status: 400 });
    }

    // Replace all messages for this chat (delete + insert)
    const { error: delErr } = await supabaseAdmin
        .from("chat_messages")
        .delete()
        .eq("chat_id", chat_id);

    if (delErr) {
        console.error("chat_messages delete error:", delErr.message);
        return Response.json({ error: delErr.message }, { status: 500 });
    }

    const rows = messages.map((m: { role: string; content: string; timestamp?: number }) => ({
        chat_id,
        chat_type: chat_type ?? "conceptual",
        role: m.role,
        content: m.content,
        created_at: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString(),
    }));

    const { error: insErr } = await supabaseAdmin
        .from("chat_messages")
        .insert(rows);

    if (insErr) {
        console.error("chat_messages insert error:", insErr.message);
        return Response.json({ error: insErr.message }, { status: 500 });
    }

    return Response.json({ ok: true });
}
