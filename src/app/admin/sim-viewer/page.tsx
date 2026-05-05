/**
 * Admin — Cached Simulation Viewer (manual eyeball validation)
 *
 * Lists every row in `simulation_cache` so the founder can manually click
 * through state-by-state and judge layout/physics/pedagogy by eye —
 * substitute for the Sonnet vision gate when Anthropic credits run out.
 *
 * Companion: pixelGate (D1p + H1) still runs automated and free via
 * `npm run smoke:visual-validator [concept]` from CLI. This UI is the
 * human-judgment layer for the 33 vision-only checks.
 */

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { deriveStateIds } from "@/lib/validators/visual/deriveStateIds";
import { SimViewerList } from "./SimViewerList";

export interface SimCacheRow {
    id: string;
    concept_key: string;
    sim_type: string | null;
    served_count: number;
    fingerprint_key: string | null;
    sim_html_len: number;
    state_count: number;
    has_panel_b: boolean;
    state_ids: string[];
    created_at: string;
}

interface RawCacheRow {
    id: string;
    concept_key: string;
    sim_type: string | null;
    served_count: number | null;
    fingerprint_key: string | null;
    sim_html: string | null;
    secondary_sim_html: string | null;
    physics_config: Record<string, unknown> | null;
    created_at: string;
}

export default async function SimViewerPage() {
    const { data, error } = await supabaseAdmin
        .from("simulation_cache")
        .select("id, concept_key, sim_type, served_count, fingerprint_key, sim_html, secondary_sim_html, physics_config, created_at")
        .not("sim_html", "is", null)
        .order("served_count", { ascending: false, nullsFirst: false });

    const rawRows = (data ?? []) as RawCacheRow[];
    const rows: SimCacheRow[] = rawRows
        .filter((r) => r.sim_html && r.sim_html.length > 100)
        .map((r) => {
            const stateIds = deriveStateIds(r.physics_config);
            return {
                id: r.id,
                concept_key: r.concept_key,
                sim_type: r.sim_type,
                served_count: r.served_count ?? 0,
                fingerprint_key: r.fingerprint_key,
                sim_html_len: r.sim_html?.length ?? 0,
                state_count: stateIds.length,
                has_panel_b: !!r.secondary_sim_html && r.secondary_sim_html.length > 100,
                state_ids: stateIds,
                created_at: r.created_at,
            };
        });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Cached Simulation Viewer</h1>
                    <p className="text-slate-400 text-sm">
                        {rows.length} cached row{rows.length === 1 ? "" : "s"} — click any row to step through states manually.
                        {error && <span className="text-red-400 ml-2">— fetch error: {error.message}</span>}
                    </p>
                    <p className="text-slate-500 text-xs mt-2">
                        Vision gate is offline (no Anthropic credits). pixelGate still runs free via{" "}
                        <code className="text-slate-300 bg-slate-800 px-1 py-0.5 rounded">
                            npm run smoke:visual-validator [concept]
                        </code>
                        . This page is for the 33 vision-only checks the human eye must judge.
                    </p>
                </div>

                {rows.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
                        No cached simulations. Generate one via{" "}
                        <code className="text-slate-300">/api/generate-simulation</code> first.
                    </div>
                ) : (
                    <SimViewerList rows={rows} />
                )}
            </div>
        </div>
    );
}
