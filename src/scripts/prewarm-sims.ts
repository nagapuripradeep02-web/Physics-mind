/**
 * Prewarms simulation_cache for a fixed list of concept_ids by invoking
 * generateSimulation() directly — bypasses the HTTP stack + auth proxy.
 *
 * Why: /api/generate-simulation is behind Supabase session auth; curl can't
 * reach it without a session cookie. Direct import is the clean path.
 *
 * Usage: npx tsx --env-file=.env.local src/scripts/prewarm-sims.ts
 *        npx tsx --env-file=.env.local src/scripts/prewarm-sims.ts id1,id2,id3
 */

import { generateSimulation } from '@/lib/aiSimulationGenerator';
import type { QuestionFingerprint } from '@/lib/intentClassifier';

const DEFAULT_CONCEPTS = [
  'normal_reaction',
  'tension_in_string',
  'free_body_diagram',
  'hinge_force',
  'contact_forces',
  'field_forces',
  'vector_resolution',
];

async function warmOne(concept: string): Promise<{ ok: boolean; ms: number; note: string }> {
  const t0 = Date.now();
  const cache_key = `${concept}|understand|12|conceptual|basic_mechanics`;
  const fingerprint: QuestionFingerprint = {
    concept_id: concept,
    intent: 'understand',
    class_level: '12',
    mode: 'conceptual',
    aspect: 'basic_mechanics',
    cache_key,
    confidence: 0.9,
  };
  try {
    const result = await generateSimulation(
      concept,
      `Explain ${concept.replace(/_/g, ' ')}`,
      '12',
      undefined,
      undefined,
      fingerprint,
    );
    const ms = Date.now() - t0;
    if (!result) return { ok: false, ms, note: 'returned null' };
    if ((result as { type?: string }).type === 'multi_panel') {
      return { ok: true, ms, note: 'multi_panel result' };
    }
    const htmlLen = (result as { simHtml?: string }).simHtml?.length ?? 0;
    return { ok: htmlLen > 0, ms, note: `single_panel html=${htmlLen} bytes` };
  } catch (err: unknown) {
    const ms = Date.now() - t0;
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, ms, note: `throw: ${msg.slice(0, 200)}` };
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const concepts = argv[0] ? argv[0].split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_CONCEPTS;
  console.log(`[prewarm-sims] START — ${concepts.length} concepts: ${concepts.join(', ')}`);
  const results: Array<{ concept: string; ok: boolean; ms: number; note: string }> = [];
  for (const concept of concepts) {
    process.stdout.write(`[prewarm-sims] ${concept} ... `);
    const r = await warmOne(concept);
    console.log(`${r.ok ? 'OK' : 'FAIL'} (${r.ms}ms) ${r.note}`);
    results.push({ concept, ...r });
  }
  const okCount = results.filter((r) => r.ok).length;
  console.log(`\n[prewarm-sims] DONE — ${okCount}/${results.length} succeeded`);
  if (okCount < results.length) {
    console.log('[prewarm-sims] failures:');
    for (const r of results.filter((x) => !x.ok)) {
      console.log(`  - ${r.concept}: ${r.note}`);
    }
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error('[prewarm-sims] fatal:', err);
  process.exit(1);
});
