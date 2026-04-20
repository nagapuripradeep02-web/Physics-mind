/**
 * Validates all concept JSONs in src/data/concepts/ against v2 schema.
 *
 * Classifies each file into one of:
 *   - atomic_v2     — single concept, v2 shape (renderer_pair + direct state shape)
 *   - legacy_bundled — multi-concept bundle (renderer_hint + nested physics_layer/pedagogy_layer).
 *                     Needs splitting, not backfilling. Skipped, listed in summary.
 *   - legacy_array   — root is an array (very old format). Skipped.
 *
 * Only atomic_v2 files are validated against the Zod schema. Exit 1 if any
 * atomic file fails or if any file is unclassifiable. Legacy files do NOT
 * fail the build — they're a splitting backlog, tracked separately in
 * LEGACY_SPLIT_BACKLOG.md.
 *
 * Usage: npx tsx src/scripts/validate-concepts.ts
 */

import fs from 'fs';
import path from 'path';
import { validateConceptJson } from '../schemas/conceptJson';

const CONCEPTS_DIR = path.resolve(__dirname, '../data/concepts');

type Tier = 'atomic_v2' | 'legacy_bundled' | 'legacy_array' | 'unknown';

/**
 * Classifies a parsed JSON into one of four tiers.
 *
 * legacy_array   — root is an array
 * legacy_bundled — has renderer_hint (not renderer_pair) OR any state has
 *                  physics_layer/pedagogy_layer nesting (old authoring format)
 * atomic_v2      — has renderer_pair and states are direct { title, teacher_script, ... }
 * unknown        — doesn't fit any tier; usually indicates a shape error we should see
 */
function detectTier(data: unknown): Tier {
  if (Array.isArray(data)) return 'legacy_array';
  if (data === null || typeof data !== 'object') return 'unknown';

  const obj = data as Record<string, unknown>;

  const hasRendererPair = typeof obj.renderer_pair === 'object' && obj.renderer_pair !== null;
  const hasRendererHint = typeof obj.renderer_hint === 'object' && obj.renderer_hint !== null;

  if (stateUsesLegacyLayers(obj)) return 'legacy_bundled';
  if (hasRendererHint && !hasRendererPair) return 'legacy_bundled';
  if (hasRendererPair) return 'atomic_v2';

  return 'unknown';
}

/**
 * True if any state inside epic_l_path or epic_c_branches has the legacy
 * `physics_layer` / `pedagogy_layer` nesting.
 */
function stateUsesLegacyLayers(obj: Record<string, unknown>): boolean {
  const epicL = obj.epic_l_path;
  if (epicL && typeof epicL === 'object' && 'states' in epicL) {
    const states = (epicL as { states?: unknown }).states;
    if (states && typeof states === 'object') {
      for (const state of Object.values(states)) {
        if (
          state !== null &&
          typeof state === 'object' &&
          ('physics_layer' in state || 'pedagogy_layer' in state)
        ) {
          return true;
        }
      }
    }
  }

  const epicCBranches = obj.epic_c_branches;
  if (Array.isArray(epicCBranches)) {
    for (const branch of epicCBranches) {
      if (branch && typeof branch === 'object' && 'states' in branch) {
        const states = (branch as { states?: unknown }).states;
        if (states && typeof states === 'object') {
          for (const state of Object.values(states)) {
            if (
              state !== null &&
              typeof state === 'object' &&
              ('physics_layer' in state || 'pedagogy_layer' in state)
            ) {
              return true;
            }
          }
        }
      }
    }
  }

  return false;
}

/**
 * Extract a stable category name from a per-error line for tally grouping.
 */
function categorize(errorLine: string): string {
  if (errorLine.includes("uses legacy 'text' field")) return 'legacy_text_field';
  const match = errorLine.match(/^\s*([^:]+):/);
  if (!match) return 'uncategorized';
  const fullPath = match[1].trim();
  if (fullPath === '(root)') return 'root_shape';
  const segments = fullPath.split('.');
  const last = segments[segments.length - 1];
  return last.replace(/\[\d+\]$/, '');
}

function main(): void {
  const files = fs.readdirSync(CONCEPTS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

  console.log(`\nValidating ${files.length} concept JSONs...\n`);
  console.log('='.repeat(70));

  const tierBuckets: Record<Tier, string[]> = {
    atomic_v2: [],
    legacy_bundled: [],
    legacy_array: [],
    unknown: [],
  };

  let passCount = 0;
  let atomicFailCount = 0;
  let unknownCount = 0;
  const categoryTally = new Map<string, number>();
  const categoryFiles = new Map<string, Set<string>>();

  for (const file of files) {
    const filePath = path.join(CONCEPTS_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');

    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      console.log(`PARSE_FAIL  ${file}`);
      console.log('  Invalid JSON — parse error');
      console.log('');
      atomicFailCount++;
      const cat = 'invalid_json';
      categoryTally.set(cat, (categoryTally.get(cat) ?? 0) + 1);
      if (!categoryFiles.has(cat)) categoryFiles.set(cat, new Set());
      categoryFiles.get(cat)!.add(file);
      continue;
    }

    const tier = detectTier(data);
    tierBuckets[tier].push(file);

    if (tier === 'legacy_bundled') {
      console.log(`LEGACY      ${file}  (needs splitting — see LEGACY_SPLIT_BACKLOG.md)`);
      continue;
    }

    if (tier === 'legacy_array') {
      console.log(`LEGACY_ARR  ${file}  (skipped — root is a multi-concept array)`);
      continue;
    }

    if (tier === 'unknown') {
      console.log(`UNKNOWN     ${file}  (doesn't match any known tier)`);
      unknownCount++;
      continue;
    }

    // tier === 'atomic_v2' — run Zod validation
    const result = validateConceptJson(data, file);

    if (result.passed) {
      console.log(`PASS        ${file}`);
      passCount++;
    } else {
      console.log(`FAIL        ${file}`);
      for (const err of result.errors) {
        console.log(err);
        const cat = categorize(err);
        categoryTally.set(cat, (categoryTally.get(cat) ?? 0) + 1);
        if (!categoryFiles.has(cat)) categoryFiles.set(cat, new Set());
        categoryFiles.get(cat)!.add(file);
      }
      atomicFailCount++;
    }
    console.log('');
  }

  console.log('='.repeat(70));
  console.log('\nClassification:');
  console.log(`  ${tierBuckets.atomic_v2.length.toString().padStart(3)} ATOMIC v2        (validated against Zod schema)`);
  console.log(`  ${tierBuckets.legacy_bundled.length.toString().padStart(3)} LEGACY BUNDLED   (skipped — need splitting into atomic concepts)`);
  console.log(`  ${tierBuckets.legacy_array.length.toString().padStart(3)} LEGACY ARRAY     (skipped — root is an array)`);
  if (tierBuckets.unknown.length > 0) {
    console.log(`  ${tierBuckets.unknown.length.toString().padStart(3)} UNKNOWN          (fail — shape doesn't match any tier)`);
  }

  console.log(`\nAtomic results: ${passCount} PASS, ${atomicFailCount} FAIL out of ${tierBuckets.atomic_v2.length} atomic files\n`);

  if (categoryTally.size > 0) {
    console.log('Backfill checklist — errors grouped by category (atomic files only):');
    console.log('-'.repeat(70));
    const sorted = [...categoryTally.entries()].sort((a, b) => b[1] - a[1]);
    for (const [category, count] of sorted) {
      const fileCount = categoryFiles.get(category)?.size ?? 0;
      console.log(`  ${category.padEnd(30)} ${String(count).padStart(4)} error(s) across ${fileCount} file(s)`);
    }
    console.log('');
  }

  if (tierBuckets.legacy_bundled.length > 0) {
    console.log(`Legacy bundled files (${tierBuckets.legacy_bundled.length}):`);
    for (const f of tierBuckets.legacy_bundled) console.log(`  ${f}`);
    console.log('');
  }

  if (atomicFailCount > 0 || unknownCount > 0) {
    process.exit(1);
  }
}

main();
