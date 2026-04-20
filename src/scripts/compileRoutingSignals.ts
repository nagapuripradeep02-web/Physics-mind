/**
 * compileRoutingSignals.ts
 *
 * Build script: scans physics_constants/*.json and generates routing signal
 * rows in the concept_routing_signals Supabase table.
 *
 * For each concept JSON:
 *   - Extracts concept_id
 *   - Builds trigger_phrases from locked_facts keys + ncert_truth_statements keywords
 *   - Sets default_scope = 'local' and default_simulation_needed = true
 *   - Concepts with common_misconceptions get force_simulation_needed = true
 *
 * Usage:
 *   npx tsx src/scripts/compileRoutingSignals.ts
 *
 * Pre-requisite: run supabase_routing_signals_migration.sql in Supabase SQL Editor
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // load project secrets
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const CONSTANTS_DIR = path.join(process.cwd(), 'src/lib/physics_constants');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface ConceptJson {
  concept?: string;
  concept_id?: string;
  concept_name?: string;
  locked_facts?: Record<string, unknown> | unknown[];
  ncert_truth_statements?: string[];
  truth_statements?: string[];
  common_misconceptions?: unknown[];
  routing_signals?: {
    trigger_phrases?: string[];
    default_scope?: string;
    default_simulation_needed?: boolean;
    force_scope?: string;
    force_simulation_needed?: boolean;
  };
}

function extractTriggerPhrases(json: ConceptJson): string[] {
  const phrases = new Set<string>();
  const conceptId = json.concept_id ?? json.concept ?? json.concept_name ?? '';

  // Add concept_id variants as trigger phrases
  if (conceptId) {
    phrases.add(conceptId.replace(/_/g, ' '));
    // Also add each word if multi-word
    const words = conceptId.split('_').filter(w => w.length > 3);
    words.forEach(w => phrases.add(w));
  }

  // Extract key physics terms from locked_facts keys
  if (json.locked_facts && !Array.isArray(json.locked_facts)) {
    for (const key of Object.keys(json.locked_facts)) {
      const readable = key.replace(/_/g, ' ');
      if (readable.length > 4) phrases.add(readable);
    }
  }

  // If the JSON has explicit routing_signals.trigger_phrases, use them
  if (json.routing_signals?.trigger_phrases) {
    json.routing_signals.trigger_phrases.forEach(p => phrases.add(p));
  }

  return [...phrases].slice(0, 20); // Cap at 20 phrases per concept
}

async function main() {
  const files = await readdir(CONSTANTS_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  console.log(`[compileRoutingSignals] Found ${jsonFiles.length} concept JSON files`);

  let upserted = 0;
  let skipped = 0;

  for (const file of jsonFiles) {
    const filePath = path.join(CONSTANTS_DIR, file);
    const raw = await readFile(filePath, 'utf-8');
    let json: ConceptJson;
    try {
      json = JSON.parse(raw);
    } catch {
      console.warn(`[compileRoutingSignals] Skipping ${file} — invalid JSON`);
      skipped++;
      continue;
    }

    const conceptId = json.concept_id ?? json.concept ?? json.concept_name ?? file.replace('.json', '');
    const triggerPhrases = extractTriggerPhrases(json);
    const hasMisconceptions = Array.isArray(json.common_misconceptions) && json.common_misconceptions.length > 0;

    // Use explicit routing_signals from JSON if present, otherwise defaults
    const signals = json.routing_signals;
    const scope = signals?.default_scope ?? 'local';
    const simulationNeeded = hasMisconceptions ? true : (signals?.default_simulation_needed ?? true);

    // Insert one row per trigger phrase (table has singular trigger_phrase column)
    const rows = triggerPhrases.map(phrase => ({
      concept_id: conceptId,
      trigger_phrase: phrase,
      scope,
      simulation_needed: simulationNeeded,
      language: 'en',
    }));

    // Delete existing rows for this concept, then insert fresh
    const { error: delError } = await supabase
      .from('concept_routing_signals')
      .delete()
      .eq('concept_id', conceptId);

    if (delError) {
      console.error(`[compileRoutingSignals] Error deleting ${conceptId}:`, delError.message);
      skipped++;
      continue;
    }

    const { error: insError } = await supabase
      .from('concept_routing_signals')
      .insert(rows);

    if (insError) {
      console.error(`[compileRoutingSignals] Error inserting ${conceptId}:`, insError.message);
      skipped++;
    } else {
      upserted++;
      console.log(`[compileRoutingSignals] ✓ ${conceptId} (${triggerPhrases.length} phrases${hasMisconceptions ? ', force_sim' : ''})`);
    }
  }

  console.log(`\n[compileRoutingSignals] Done: ${upserted} upserted, ${skipped} skipped`);
}

main().catch(err => {
  console.error('[compileRoutingSignals] Fatal:', err);
  process.exit(1);
});
