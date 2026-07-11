/**
 * node --check the emitted renderer JS bodies. tsc cannot see inside the
 * FIELD_3D_RENDERER_CODE / PARTICLE_FIELD_RENDERER_CODE template strings, so a
 * stray backtick (terminates the template!) or JS syntax slip ships silently
 * and only surfaces as a blank canvas at runtime. Run after any renderer edit:
 *   npm run check:renderer-syntax
 */
import { writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FIELD_3D_RENDERER_CODE } from '@/lib/renderers/field_3d_renderer';
import { PARTICLE_FIELD_RENDERER_CODE } from '@/lib/renderers/particle_field_renderer';

for (const [name, code] of [
  ['field_3d', FIELD_3D_RENDERER_CODE],
  ['particle_field', PARTICLE_FIELD_RENDERER_CODE],
] as const) {
  const p = join(tmpdir(), `_pm_${name}_syntax_check.js`);
  writeFileSync(p, code);
  const r = spawnSync('node', ['--check', p], { encoding: 'utf-8' });
  if (r.status === 0) {
    console.log(`${name}: syntax OK (${(code.length / 1024).toFixed(0)} KB)`);
  } else {
    console.error(`${name}: SYNTAX FAIL\n${r.stderr.slice(0, 800)}`);
    process.exit(1);
  }
}
