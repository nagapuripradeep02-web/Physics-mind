/**
 * PATCH /api/conceptual-chat/mode
 * Updates the mode field on a conceptual_chat row.
 * Called when the user switches between "both" | "explain" | "quiz" modes.
 */

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
    try {
        const { chatId, mode } = await req.json();

        if (!chatId || !mode) {
            return Response.json({ error: "Missing chatId or mode" }, { status: 400 });
        }

        const validModes = ["both", "explain", "quiz", "simulation"] as const;
        if (!validModes.includes(mode)) {
            return Response.json({ error: "Invalid mode value" }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from("conceptual_chats")
            .update({ mode, updated_at: new Date().toISOString() })
            .eq("id", chatId);

        if (error) {
            console.warn("[conceptual-chat/mode] DB update failed:", error.message);
            // Non-fatal — the mode update is best-effort UI state, don't crash the client
            return Response.json({ ok: false, error: error.message }, { status: 200 });
        }

        return Response.json({ ok: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[conceptual-chat/mode] Error:", message);
        return Response.json({ ok: false, error: message }, { status: 200 }); // 200 so client doesn't crash
    }
}
