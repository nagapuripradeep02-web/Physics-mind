/**
 * Migrates ATOMIC concept JSONs to v2 schema by filling mechanical gaps:
 *   - Adds schema_version: "2.0.0" at top level if missing
 *   - Adds advance_mode: "auto_after_tts" to every state missing it
 *     (safe non-blocking default; Architect can tighten to wait_for_answer /
 *      interaction_complete per state during content review)
 *
 * Skips LEGACY BUNDLED and LEGACY ARRAY files — those need splitting, not
 * backfilling. Detection logic matches validate-concepts.ts.
 *
 * Idempotent: re-running the script on already-migrated files is a no-op.
 *
 * Usage: npx tsx src/scripts/migrate_v1_to_v2.ts
 *        npx tsx src/scripts/migrate_v1_to_v2.ts --dry-run   (preview only)
 */

import fs from 'fs';
import path from 'path';

const CONCEPTS_DIR = path.resolve(__dirname, '../data/concepts');

type Tier = 'atomic_v2' | 'legacy_bundled' | 'legacy_array' | 'unknown';

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
        ) return true;
      }
    }
  }

  const branches = obj.epic_c_branches;
  if (Array.isArray(branches)) {
    for (const branch of branches) {
      if (branch && typeof branch === 'object' && 'states' in branch) {
        const states = (branch as { states?: unknown }).states;
        if (states && typeof states === 'object') {
          for (const state of Object.values(states)) {
            if (
              state !== null &&
              typeof state === 'object' &&
              ('physics_layer' in state || 'pedagogy_layer' in state)
            ) return true;
          }
        }
      }
    }
  }

  return false;
}

interface MigrationResult {
  file: string;
  schemaVersionAdded: boolean;
  advanceModeAddedCount: number;
  changed: boolean;
}

/**
 * Mutates a state object to add advance_mode if missing.
 * Returns 1 if a change was made, 0 otherwise.
 */
function ensureAdvanceMode(state: Record<string, unknown>): number {
  if (typeof state.advance_mode === 'string') return 0;
  state.advance_mode = 'auto_after_tts';
  return 1;
}

/**
 * Walks epic_l_path + epic_c_branches and ensures every state has advance_mode.
 * Returns the count of states that were modified.
 */
function backfillAdvanceMode(obj: Record<string, unknown>): number {
  let added = 0;

  const epicL = obj.epic_l_path;
  if (epicL && typeof epicL === 'object' && 'states' in epicL) {
    const states = (epicL as { states?: unknown }).states;
    if (states && typeof states === 'object') {
      for (const state of Object.values(states)) {
        if (state !== null && typeof state === 'object') {
          added += ensureAdvanceMode(state as Record<string, unknown>);
        }
      }
    }
  }

  const branches = obj.epic_c_branches;
  if (Array.isArray(branches)) {
    for (const branch of branches) {
      if (branch && typeof branch === 'object' && 'states' in branch) {
        const states = (branch as { states?: unknown }).states;
        if (states && typeof states === 'object') {
          for (const state of Object.values(states)) {
            if (state !== null && typeof state === 'object') {
              added += ensureAdvanceMode(state as Record<string, unknown>);
            }
          }
        }
      }
    }
  }

  return added;
}

function migrateFile(filePath: string, dryRun: boolean): MigrationResult | null {
  const file = path.basename(filePath);
  const raw = fs.readFileSync(filePath, 'utf-8');

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    console.log(`PARSE_FAIL  ${file}  — skipped`);
    return null;
  }

  const tier = detectTier(data);
  if (tier !== 'atomic_v2') {
    console.log(`SKIP        ${file}  (tier=${tier})`);
    return null;
  }

  const obj = data as Record<string, unknown>;
  const result: MigrationResult = {
    file,
    schemaVersionAdded: false,
    advanceModeAddedCount: 0,
    changed: false,
  };

  if (obj.schema_version !== '2.0.0') {
    obj.schema_version = '2.0.0';
    result.schemaVersionAdded = true;
    result.changed = true;
  }

  result.advanceModeAddedCount = backfillAdvanceMode(obj);
  if (result.advanceModeAddedCount > 0) result.changed = true;

  if (!result.changed) {
    console.log(`NOOP        ${file}  (already migrated)`);
    return result;
  }

  const diffParts: string[] = [];
  if (result.schemaVersionAdded) diffParts.push('+ schema_version="2.0.0"');
  if (result.advanceModeAddedCount > 0) {
    diffParts.push(`+ advance_mode in ${result.advanceModeAddedCount} state(s)`);
  }

  console.log(`${dryRun ? 'DRY_RUN' : 'MIGRATE'}     ${file}  ${diffParts.join(', ')}`);

  if (!dryRun) {
    const formatted = JSON.stringify(obj, null, 2);
    fs.writeFileSync(filePath, formatted + '\n', 'utf-8');
  }

  return result;
}

function main(): void {
  const dryRun = process.argv.includes('--dry-run');

  const files = fs.readdirSync(CONCEPTS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

  console.log(`\nMigrating atomic concept JSONs${dryRun ? ' (DRY RUN)' : ''}...\n`);
  console.log('='.repeat(70));

  const results: MigrationResult[] = [];
  for (const file of files) {
    const filePath = path.join(CONCEPTS_DIR, file);
    const result = migrateFile(filePath, dryRun);
    if (result) results.push(result);
  }

  console.log('='.repeat(70));

  const touched = results.filter((r) => r.changed);
  const totalSchemaVersion = touched.filter((r) => r.schemaVersionAdded).length;
  const totalAdvanceMode = touched.reduce((sum, r) => sum + r.advanceModeAddedCount, 0);

  console.log(`\nSummary:`);
  console.log(`  ${results.length} atomic file(s) inspected`);
  console.log(`  ${touched.length} file(s) modified`);
  console.log(`  ${totalSchemaVersion} schema_version field(s) added`);
  console.log(`  ${totalAdvanceMode} advance_mode field(s) added`);
  if (dryRun) console.log(`\n  (DRY RUN — no files written. Re-run without --dry-run to apply.)`);
}

main();
