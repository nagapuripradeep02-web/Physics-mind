/**
 * tts_rollout — drive the multilingual narration rollout across every field_3d
 * diamond: for each concept, run translate -> generate (Sarvam mp3) -> build the
 * review page. Resilient: a per-concept/per-step failure is logged and the run
 * continues; a PASS/FAIL summary prints at the end.
 *
 * Idempotent: translate skips already-translated sentences, generate skips
 * existing mp3 clips, build always rebuilds. Orphaned .wav clips (from the old
 * WAV proof) are deleted so the player serves mp3 only.
 *
 * Run (long — ~45-60 min; prefer background):
 *   npx tsx --env-file=.env.local src/scripts/tts_rollout.ts
 *   npx tsx --env-file=.env.local src/scripts/tts_rollout.ts --only=coulombs_law,gauss_law
 *   ... --skip-translate   (clips/build only)   ... --force (re-translate + re-gen)
 */
import '@/lib/loadEnvLocal';
import { readFileSync, readdirSync, existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const CONCEPTS_DIR = join(ROOT, 'src', 'data', 'concepts');
const OUT_DIR = join(ROOT, 'review-site');

function hasField3dWithNarration(file: string): boolean {
  try {
    const j = JSON.parse(readFileSync(join(CONCEPTS_DIR, file), 'utf-8')) as {
      field_3d_config?: unknown;
      epic_l_path?: { states?: Record<string, { teacher_script?: { tts_sentences?: unknown[] } }> };
    };
    if (!j.field_3d_config) return false;
    const states = j.epic_l_path?.states ?? {};
    return Object.values(states).some((s) => (s.teacher_script?.tts_sentences?.length ?? 0) > 0);
  } catch {
    return false;
  }
}

function enumerateConcepts(): string[] {
  return readdirSync(CONCEPTS_DIR)
    .filter((f) => f.endsWith('.json') && f !== 'CLAUDE.md')
    .filter(hasField3dWithNarration)
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
}

function run(script: string, conceptId: string, extra: string[]): number {
  // shell:true so Windows resolves npx(.cmd); args are controlled concept ids.
  const args = ['tsx', '--env-file=.env.local', `src/scripts/${script}`, conceptId, ...extra];
  const res = spawnSync('npx', args, { stdio: 'inherit', shell: true });
  return res.status ?? 1;
}

function deleteOrphanWavs(conceptId: string): void {
  const dir = join(OUT_DIR, conceptId, 'audio');
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) {
    if (f.endsWith('.wav')) {
      try { unlinkSync(join(dir, f)); } catch { /* ignore */ }
    }
  }
}

function main(): void {
  const argv = process.argv.slice(2);
  const force = argv.includes('--force');
  const skipTranslate = argv.includes('--skip-translate');
  const onlyArg = argv.find((a) => a.startsWith('--only='));
  const only = onlyArg ? onlyArg.split('=')[1].split(',').map((s) => s.trim()).filter(Boolean) : null;
  const providerArg = argv.find((a) => a.startsWith('--provider='));

  const concepts = only ?? enumerateConcepts();
  console.log(`\n=== TTS rollout: ${concepts.length} concept(s) ===`);
  console.log(concepts.join(', ') + '\n');

  const results: { id: string; translate: string; generate: string; build: string }[] = [];

  for (let i = 0; i < concepts.length; i++) {
    const id = concepts[i];
    console.log(`\n────────── [${i + 1}/${concepts.length}] ${id} ──────────`);
    const r = { id, translate: 'skip', generate: '-', build: '-' };

    if (!skipTranslate) {
      const tFlags = [...(force ? ['--force'] : []), ...(providerArg ? [providerArg] : [])];
      const code = run('translate_concept_tts.ts', id, tFlags);
      r.translate = code === 0 ? 'ok' : code === 2 ? 'partial' : 'FAIL';
    }

    const gCode = run('generate_tts_audio.ts', id, force ? ['--force'] : []);
    r.generate = gCode === 0 ? 'ok' : 'FAIL';
    deleteOrphanWavs(id); // drop old WAV clips now that mp3 exists

    const bCode = run('build_review_site.ts', id, []);
    r.build = bCode === 0 ? 'ok' : 'FAIL';

    results.push(r);
  }

  console.log('\n\n=========== ROLLOUT SUMMARY ===========');
  let fails = 0;
  for (const r of results) {
    const bad = [r.translate, r.generate, r.build].some((s) => s === 'FAIL');
    if (bad) fails++;
    console.log(`${bad ? '✗' : '✓'} ${r.id.padEnd(42)} translate=${r.translate} generate=${r.generate} build=${r.build}`);
  }
  console.log(`\n${results.length - fails}/${results.length} concepts clean, ${fails} with a FAIL step.`);
  if (fails > 0) process.exitCode = 2;
}

main();
