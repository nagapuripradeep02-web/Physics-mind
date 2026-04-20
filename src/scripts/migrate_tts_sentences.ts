/**
 * Migration: tts_sentences plain strings → {id, text_en} objects.
 * IDEMPOTENT: if element is already {id, text_en} → leave it alone.
 *
 * Targets: contact_forces.json, field_forces.json,
 *          hinge_force.json, tension_in_string.json
 *
 * Usage: npx tsx src/scripts/migrate_tts_sentences.ts
 */

import fs from 'fs';
import path from 'path';

const CONCEPTS_DIR = path.resolve(__dirname, '../data/concepts');

const TARGET_FILES = [
  'contact_forces.json',
  'field_forces.json',
  'free_body_diagram.json',
  'hinge_force.json',
  'tension_in_string.json',
];

interface TtsSentence {
  id: string;
  text_en: string;
}

function migrateTtsSentences(arr: unknown[]): { migrated: number; result: TtsSentence[] } {
  let migrated = 0;
  const result: TtsSentence[] = arr.map((item, idx) => {
    if (typeof item === 'string') {
      migrated++;
      return { id: `s${idx + 1}`, text_en: item };
    }
    // Already an object with id + text_en — leave as-is
    return item as TtsSentence;
  });
  return { migrated, result };
}

function processStates(states: Record<string, unknown>): number {
  let totalMigrated = 0;

  for (const stateKey of Object.keys(states)) {
    const state = states[stateKey] as Record<string, unknown>;
    if (!state) continue;

    const teacherScript = state.teacher_script as Record<string, unknown> | undefined;
    if (!teacherScript) continue;

    const sentences = teacherScript.tts_sentences;
    if (!Array.isArray(sentences)) continue;

    const { migrated, result } = migrateTtsSentences(sentences);
    if (migrated > 0) {
      teacherScript.tts_sentences = result;
      totalMigrated += migrated;
    }
  }

  return totalMigrated;
}

function main(): void {
  console.log('\nMigrating tts_sentences: plain strings → {id, text_en}...\n');

  for (const filename of TARGET_FILES) {
    const filePath = path.join(CONCEPTS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.log(`SKIP  ${filename} — file not found`);
      continue;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw) as Record<string, unknown>;
    let totalMigrated = 0;

    // Migrate epic_l_path.states
    const epicLPath = data.epic_l_path as Record<string, unknown> | undefined;
    if (epicLPath?.states) {
      totalMigrated += processStates(epicLPath.states as Record<string, unknown>);
    }

    // Migrate epic_c_branches[].states
    const epicCBranches = data.epic_c_branches as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(epicCBranches)) {
      for (const branch of epicCBranches) {
        if (branch.states) {
          totalMigrated += processStates(branch.states as Record<string, unknown>);
        }
      }
    }

    if (totalMigrated > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
      console.log(`Migrated ${totalMigrated} tts_sentences in ${filename}`);
    } else {
      console.log(`SKIP  ${filename} — already migrated (0 plain strings found)`);
    }
  }

  console.log('\nDone.\n');
}

main();
