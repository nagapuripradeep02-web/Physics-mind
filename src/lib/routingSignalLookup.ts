/**
 * routingSignalLookup.ts
 *
 * Looks up concept_routing_signals from Supabase to override scope/simulation_needed
 * when a student's text matches known trigger phrases for a concept.
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { ConceptScope } from './studentContext';

export interface RoutingSignalOverride {
  matched: boolean;
  concept_id?: string;
  scope?: ConceptScope;
  simulation_needed?: boolean;
}

/**
 * Check if the student's text matches any trigger phrases in concept_routing_signals.
 * Returns override values if a match is found.
 */
export async function lookupRoutingSignal(
  studentText: string,
  conceptId?: string,
): Promise<RoutingSignalOverride> {
  try {
    // Strategy 1: If conceptId is known, look up that specific concept's signals
    if (conceptId && conceptId !== 'unknown') {
      const { data: row } = await supabaseAdmin
        .from('concept_routing_signals')
        .select('concept_id, force_scope, force_simulation_needed, default_scope, default_simulation_needed')
        .eq('concept_id', conceptId)
        .maybeSingle();

      if (row) {
        const override: RoutingSignalOverride = { matched: true, concept_id: row.concept_id };
        if (row.force_scope) override.scope = row.force_scope as ConceptScope;
        if (row.force_simulation_needed !== null) override.simulation_needed = row.force_simulation_needed;
        console.log('[ROUTING_SIGNAL] concept match:', conceptId, '| scope:', override.scope ?? 'none', '| sim:', override.simulation_needed ?? 'none');
        return override;
      }
    }

    // Strategy 2: Check trigger phrases across all concepts
    const lowerText = studentText.toLowerCase();
    const { data: rows } = await supabaseAdmin
      .from('concept_routing_signals')
      .select('concept_id, trigger_phrases, force_scope, force_simulation_needed')
      .not('force_scope', 'is', null);

    if (rows && rows.length > 0) {
      for (const row of rows) {
        const phrases = row.trigger_phrases as string[] | null;
        if (!phrases) continue;
        const match = phrases.some(phrase => lowerText.includes(phrase.toLowerCase()));
        if (match) {
          const override: RoutingSignalOverride = { matched: true, concept_id: row.concept_id };
          if (row.force_scope) override.scope = row.force_scope as ConceptScope;
          if (row.force_simulation_needed !== null) override.simulation_needed = row.force_simulation_needed;
          console.log('[ROUTING_SIGNAL] trigger phrase match for:', row.concept_id, '| scope:', override.scope ?? 'none', '| sim:', override.simulation_needed ?? 'none');
          return override;
        }
      }
    }

    return { matched: false };
  } catch (err) {
    console.warn('[ROUTING_SIGNAL] lookup failed:', err instanceof Error ? err.message : String(err));
    return { matched: false };
  }
}
