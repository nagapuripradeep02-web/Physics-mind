import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface PanelConfig {
    concept_id: string;
    default_panel_count: 1 | 2 | 3;
    panel_a_renderer: string;
    panel_b_renderer: string | null;
    panel_c_renderer: string | null;
    sonnet_can_upgrade: boolean;
    verified_by_human: boolean;
}

export async function getPanelConfigForConcept(conceptId: string): Promise<PanelConfig | null> {
    const { data, error } = await supabaseAdmin
        .from('concept_panel_config')
        .select('*')
        .eq('concept_id', conceptId)
        .single();

    if (error || !data) return null;
    return data as PanelConfig;
}
