#!/usr/bin/env node
'use strict';
/**
 * install-git-hooks.js
 * ---------------------------------------------------------------------------
 * Copies the tracked hooks in .githooks/ into this repository's SHARED hook
 * directory, normalising line endings on the way.
 *
 * Run once per machine:   node scripts/install-git-hooks.js
 *
 * WHY A COPY AND NOT core.hooksPath
 *   `core.hooksPath` is a single repo-wide value, but a RELATIVE value resolves
 *   against the CURRENT WORKTREE's top level (verified). This repo has 13
 *   worktrees and only master carries `.githooks/`, so setting
 *   core.hooksPath=.githooks would SILENTLY disable every hook — including the
 *   agent-emission guard — in the 12 worktrees whose branch lacks the
 *   directory. Git does NOT fall back to .git/hooks and prints no warning:
 *
 *     $ git -c core.hooksPath=./__missing__ hook run pre-commit
 *     error: cannot find a hook named pre-commit
 *
 *   The shared <common .git>/hooks directory is branch- AND worktree-
 *   independent, so a copy works everywhere at once.
 *   Revisit core.hooksPath once every branch carries .githooks/.
 *
 * Idempotent. Never overwrites an unmanaged hook without saving a .bak first.
 * NEVER exits non-zero — it must not be able to fail an `npm install` or CI.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const MARKER = 'PM-MANAGED-HOOK v1';
const say = (m) => console.log(`install-git-hooks: ${m}`);
const git = (args, cwd) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

function main() {
  if (process.env.PM_SKIP_HOOK_INSTALL) return say('skipped (PM_SKIP_HOOK_INSTALL)');
  // A CI runner checks out a real git repo, so git commands would succeed —
  // that's the danger. Hooks are pointless there and an auto-push hook on a
  // runner would be actively wrong. GitHub Actions sets CI=true.
  if (process.env.CI) return say('skipped (CI)');

  const here = __dirname; // <worktree>/scripts
  let top, hookDir;
  try {
    top = git(['rev-parse', '--show-toplevel'], here);
    // `--git-path hooks` resolves to the COMMON .git/hooks even from a linked
    // worktree. `--absolute-git-dir` does NOT — it returns
    // .git/worktrees/<name>, whose hooks/ git never reads. (The legacy
    // scripts/install-git-hooks.sh has exactly that bug, so running it from
    // any linked worktree silently installs nothing.)
    // Output is cwd-relative in the main worktree and absolute in a linked
    // one, so resolve it against the cwd we passed to git.
    hookDir = path.resolve(here, git(['rev-parse', '--git-path', 'hooks'], here));
  } catch {
    return say('skipped (not inside a git work tree)');
  }

  const srcDir = path.join(top, '.githooks');
  if (!fs.existsSync(srcDir)) {
    return say(`skipped (${srcDir} not present on this branch)`);
  }

  fs.mkdirSync(hookDir, { recursive: true });

  let changed = 0;
  for (const name of fs.readdirSync(srcDir)) {
    const src = path.join(srcDir, name);
    if (name.startsWith('.') || !fs.statSync(src).isFile()) continue;

    // Strip CR unconditionally. core.autocrlf=true may have checked this file
    // out with CRLF, and a CRLF shebang is fatal:
    //   /usr/bin/env: 'bash\r': No such file or directory   (exit 127)
    // Doing it here means even a clone made before .githooks/.gitattributes
    // existed still installs working hooks.
    const body = fs.readFileSync(src, 'utf8').replace(/\r\n/g, '\n');
    const dest = path.join(hookDir, name);

    if (fs.existsSync(dest)) {
      const cur = fs.readFileSync(dest, 'utf8');
      if (cur === body) continue;
      if (!cur.includes(MARKER)) {
        const bak = `${dest}.pre-githooks.bak`;
        if (!fs.existsSync(bak)) {
          fs.copyFileSync(dest, bak);
          say(`existing ${name} was not managed by us — saved a copy at ${bak}`);
        }
      }
    }
    fs.writeFileSync(dest, body, { mode: 0o755 });
    try { fs.chmodSync(dest, 0o755); } catch { /* no-op on Windows */ }
    say(`installed ${name} -> ${dest}`);
    changed += 1;
  }

  say(changed
    ? `${changed} hook(s) updated in ${hookDir} (shared by all worktrees).`
    : 'all hooks already up to date.');
}

try {
  main();
} catch (err) {
  say(`skipped (${(err && err.message) || err})`);
}
process.exit(0); // never non-zero
