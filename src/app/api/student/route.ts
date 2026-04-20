/**
 * GET  /api/student?session_id=xxx  → load profile + concepts + module progress
 * POST /api/student                 → upsert profile
 */
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const sessionId = user.id;

    const [profileRes, conceptsRes, progressRes] = await Promise.all([
        supabaseAdmin
            .from("student_profiles")
            .select("*")
            .eq("session_id", sessionId)
            .single(),
        supabaseAdmin
            .from("concepts")
            .select("*")
            .eq("session_id", sessionId)
            .order("updated_at", { ascending: false }),
        supabaseAdmin
            .from("module_progress")
            .select("module_id, score")
            .eq("session_id", sessionId),
    ]);

    const profile = profileRes.data
        ? {
            name: profileRes.data.name,
            class: profileRes.data.class,
            board: profileRes.data.board,
            goal: profileRes.data.goal,
            firstTopic: profileRes.data.first_topic,
            onboardingComplete: profileRes.data.onboarding_complete,
        }
        : null;

    const concepts = (conceptsRes.data ?? []).map((row: any) => ({
        id: row.id,
        name: row.name,
        conceptClass: row.concept_class,
        subject: row.subject,
        status: row.status,
        timestamp: new Date(row.updated_at).getTime(),
    }));

    const moduleProgress: Record<number, number> = {};
    for (const row of progressRes.data ?? []) {
        moduleProgress[row.module_id] = row.score;
    }

    return Response.json({ profile, concepts, moduleProgress });
}

export async function POST(req: Request) {
    try {
        const supabase = await createSupabaseServer();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const { profile } = await req.json();
        if (!profile) {
            return Response.json({ error: "profile required" }, { status: 400 });
        }

        const session_id = user.id;

        const { error } = await supabaseAdmin.from("student_profiles").upsert(
            {
                session_id,
                name: profile.name,
                class: profile.class,
                board: profile.board,
                goal: profile.goal,
                first_topic: profile.firstTopic,
                onboarding_complete: profile.onboardingComplete,
            },
            { onConflict: "session_id" }
        );

        if (error) throw error;
        return Response.json({ ok: true });
    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}
