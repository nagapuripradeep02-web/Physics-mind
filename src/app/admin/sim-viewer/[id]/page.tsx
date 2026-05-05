/**
 * Admin — Cached Simulation Viewer (detail page)
 *
 * Renders a single cached simulation in an iframe with a state-stepper UI
 * for manual eyeball validation.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { deriveStateIds } from "@/lib/validators/visual/deriveStateIds";
import { SimViewerClient } from "./SimViewerClient";

interface DetailRow {
    id: string;
    concept_key: string;
    sim_type: string | null;
    served_count: number | null;
    fingerprint_key: string | null;
    sim_html: string | null;
    secondary_sim_html: string | null;
    physics_config: Record<string, unknown> | null;
    teacher_script: unknown;
    created_at: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SimViewerDetailPage({ params }: PageProps) {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
        .from("simulation_cache")
        .select("id, concept_key, sim_type, served_count, fingerprint_key, sim_html, secondary_sim_html, physics_config, teacher_script, created_at")
        .eq("id", id)
        .maybeSingle<DetailRow>();

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
                <p className="text-red-400">Fetch error: {error.message}</p>
                <Link href="/admin/sim-viewer" className="text-emerald-400 underline">← Back to list</Link>
            </div>
        );
    }
    if (!data || !data.sim_html) {
        notFound();
    }

    const stateIds = deriveStateIds(data.physics_config);
    const isMulti = data.sim_type === "multi_panel" && !!data.secondary_sim_html;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <Link href="/admin/sim-viewer" className="text-emerald-400 hover:underline text-sm">
                            ← Back to list
                        </Link>
                        <h1 className="text-2xl font-bold text-white mt-2 font-mono">{data.concept_key}</h1>
                        <p className="text-slate-400 text-xs">
                            {data.sim_type ?? "single (default)"} ·{" "}
                            {stateIds.length} state{stateIds.length === 1 ? "" : "s"} ·{" "}
                            served {data.served_count ?? 0} time{(data.served_count ?? 0) === 1 ? "" : "s"} ·{" "}
                            <span className="font-mono">{data.fingerprint_key ?? "(no fingerprint)"}</span>
                        </p>
                    </div>
                </div>

                <SimViewerClient
                    conceptId={data.concept_key}
                    simHtml={data.sim_html}
                    secondarySimHtml={isMulti ? data.secondary_sim_html : null}
                    stateIds={stateIds}
                    teacherScript={Array.isArray(data.teacher_script) ? (data.teacher_script as { text: string; sim_state: string }[]) : null}
                />
            </div>
        </div>
    );
}
