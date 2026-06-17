// Hardened wrapper around `netlify deploy --dir review-site --prod --no-build`.
//
// WHY THIS EXISTS
// `netlify deploy` scans the PROJECT ROOT and finds `.netlify/deploy/v1/blobs/`
// — tens of MB of STALE Next.js prerender-cache blobs left behind by a prior
// `next build` of the MAIN app (its /admin/*, /chat, etc.), nothing the static
// review site needs. The CLI tries to upload all of them to the Netlify blob
// store; when that endpoint is slow/flaky the fetch fails ("Uploading blobs to
// deploy store: fetch failed") and the whole deploy aborts. We used to fix this
// by hand each time (move the dir aside, deploy, move it back). This automates
// that so `npm run deploy:review` just works.
//
// WHAT IT DOES
//   1. (self-heal) If a previous run was interrupted after moving the blobs
//      aside but before restoring, put them back first.
//   2. Move `.netlify/deploy/v1/blobs` -> `...__deploy_review_bak` if present.
//   3. Run the real netlify deploy (stdio inherited so you see live output).
//   4. ALWAYS restore the blobs dir in `finally` — even if the deploy fails or
//      is Ctrl-C'd. (The blobs are pure cache; the next `next build` rebuilds
//      them, so nothing is ever lost.)
//
// `.netlify/` is gitignored, so moving the dir is invisible to git.

import { existsSync, renameSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve paths against the project root so this works no matter where it's
// invoked from (src/scripts -> ../.. -> project root).
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BLOBS_DIR = join(ROOT, '.netlify', 'deploy', 'v1', 'blobs');
const BLOBS_BAK = join(ROOT, '.netlify', 'deploy', 'v1', 'blobs__deploy_review_bak');

const log = (m) => console.log('[deploy:review] ' + m);

// 1. Self-heal an interrupted previous run: backup exists, live dir gone.
if (existsSync(BLOBS_BAK) && !existsSync(BLOBS_DIR)) {
  renameSync(BLOBS_BAK, BLOBS_DIR);
  log('recovered blobs dir from an interrupted previous run.');
}

let moved = false;
try {
  // 2. Move the stale blobs aside (only if there's no stray backup already).
  if (existsSync(BLOBS_DIR)) {
    if (existsSync(BLOBS_BAK)) {
      log('a backup already exists at ' + BLOBS_BAK + ' — leaving blobs in place; deploy may be slow.');
    } else {
      renameSync(BLOBS_DIR, BLOBS_BAK);
      moved = true;
      log('moved stale main-app prerender blobs aside for the deploy.');
    }
  }

  // 3. Run the real deploy. shell:true so `npx`/`npx.cmd` resolves on Windows.
  //    DEPLOY_REVIEW_DRYRUN=1 exercises the move-aside/restore round-trip
  //    without actually deploying (used to verify the wrapper).
  if (process.env.DEPLOY_REVIEW_DRYRUN) {
    log('DRY RUN — skipping the real deploy. blobs moved=' + moved + '.');
    process.exitCode = 0;
  } else {
    const args = ['-y', 'netlify-cli@latest', 'deploy', '--dir', 'review-site', '--prod', '--no-build'];
    const res = spawnSync('npx', args, { stdio: 'inherit', cwd: ROOT, shell: true });
    process.exitCode = res.status == null ? 1 : res.status;
  }
} finally {
  // 4. Always restore.
  if (moved && existsSync(BLOBS_BAK) && !existsSync(BLOBS_DIR)) {
    mkdirSync(dirname(BLOBS_DIR), { recursive: true });
    renameSync(BLOBS_BAK, BLOBS_DIR);
    log('restored blobs dir.');
  }
}
