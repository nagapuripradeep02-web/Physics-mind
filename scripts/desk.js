#!/usr/bin/env node
/**
 * desk.js — the office/desk model, mechanised.
 *
 * The office is the main checkout, always on master and always clean: you plan
 * there, you never build there. A desk is a git worktree: one desk = one branch =
 * one session = one job. A desk is created when the job starts and CLOSED when
 * the job merges.
 *
 * Written 2026-08-01 after an audit found 7 commits living on a single hard
 * drive, three desks 81 commits behind master, and a finished desk still open a
 * day after its PR merged. Every one of those is countable, and CLAUDE.md's own
 * Rule 40 says the countable half belongs to a machine, not to a written rule.
 *
 *   npm run desk:audit                  # the truth table — run at session start AND close
 *   npm run desk:sync                   # merge origin/master into every live desk
 *   npm run desk:new   -- <branch>      # open a desk
 *   npm run desk:close -- <branch>      # close one (refuses if anything would be lost)
 *
 * Read-only by default. `sync` stops dead on the first conflict rather than
 * guessing, and `close` refuses to destroy anything that is not already on
 * GitHub — pass --yes only after reading what it prints.
 */

const { execSync, execFileSync } = require('child_process');
const fs   = require('fs');
const os   = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/**
 * This repo is worked from two machines (docs/GIT_WORKFLOW.md): physics on
 * Windows, chemistry on macOS. `audit` and `sync` are pure git and were always
 * portable; `new` and `close` shell out to `cmd /c` and were Windows-only, so on
 * macOS `close` aborted on every desk and could never finish its job.
 *
 * Every Windows branch below is the ORIGINAL line, unchanged — the POSIX branch
 * is new code Windows never reaches. Windows behaviour is identical by
 * construction.
 */
const IS_WIN = process.platform === 'win32';

/** Where `close` parks untracked files before removing a desk. */
const BACKUP_ROOT = IS_WIN
  ? path.join('C:', 'Backups')
  : path.join(os.homedir(), 'Backups');

/**
 * Branches deliberately parked long-term — never synced, never flagged stale.
 * feat/voice-professor* is the V2 student-facing track (CLAUDE.md §4): it lives
 * off master on purpose and merging master into it is not wanted.
 */
const PARKED = [/^feat\/voice-professor/];

/** Engine files shared by every chapter and both subjects (CLAUDE.md Rule 40). */
const PLATFORM_FILES = [
  'src/lib/renderers/parametric_renderer.ts',
  'src/lib/renderers/field_3d_renderer.ts',
  'src/lib/renderers/particle_field_renderer.ts',
  'src/lib/renderers/premium_primitives.ts',
  'src/lib/validators/visual/deriveStateMeta.ts',
  'src/scripts/build_review_site.ts',
];

const C = {
  red:  s => `\x1b[31m${s}\x1b[0m`,
  yel:  s => `\x1b[33m${s}\x1b[0m`,
  grn:  s => `\x1b[32m${s}\x1b[0m`,
  dim:  s => `\x1b[2m${s}\x1b[0m`,
  bold: s => `\x1b[1m${s}\x1b[0m`,
};

function git(args, cwd = ROOT) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    return null;
  }
}

function isParked(branch) {
  return PARKED.some(re => re.test(branch || ''));
}

/**
 * The ref every ahead/behind reading is taken against.
 *
 * `origin/master` in every normal case — the commands here fetch origin before
 * they measure, so it is current. Falls back to the local `master` only when the
 * remote ref does not resolve (offline, or a clone with no origin); callers
 * surface that fallback rather than silently reporting a stale number.
 */
function masterRef(cwd) {
  return git(['rev-parse', '--verify', '--quiet', 'origin/master'], cwd) ? 'origin/master' : 'master';
}

/** Parse `git worktree list --porcelain` into {path, branch, head} records. */
function worktrees() {
  const out = git(['worktree', 'list', '--porcelain']) || '';
  const list = [];
  let cur = {};
  for (const line of out.split('\n')) {
    if (line.startsWith('worktree ')) { if (cur.path) list.push(cur); cur = { path: line.slice(9) }; }
    else if (line.startsWith('HEAD ')) cur.head = line.slice(5);
    else if (line.startsWith('branch ')) cur.branch = line.slice(7).replace('refs/heads/', '');
    else if (line === 'detached') cur.branch = '(detached)';
  }
  if (cur.path) list.push(cur);
  return list;
}

function countRevs(range, cwd = ROOT) {
  const n = git(['rev-list', '--count', range], cwd);
  return n === null ? null : parseInt(n, 10);
}

function describe(wt) {
  const cwd = wt.path;
  const branch = wt.branch || '(detached)';
  const isMain = path.resolve(cwd) === path.resolve(ROOT);

  const status = git(['status', '--porcelain'], cwd) || '';
  const lines = status.split('\n').filter(Boolean);
  const dirty = lines.filter(l => !l.startsWith('??')).length;
  const untracked = lines.filter(l => l.startsWith('??')).length;

  const upstream = git(['rev-parse', '--abbrev-ref', '@{u}'], cwd);
  const unpushed = upstream ? countRevs(`${upstream}..HEAD`, cwd) : null;
  const behindOrigin = upstream ? countRevs(`HEAD..${upstream}`, cwd) : null;

  // `unpushed` measures divergence from THIS branch's own remote — which counts
  // commits that are already safe on origin/master (e.g. straight after a merge).
  // `stranded` is the number that actually exists nowhere but this disk. Report
  // the alarming one accurately: an alarm that overstates gets ignored.
  const stranded = (() => {
    const n = git(['rev-list', '--count', 'HEAD', '--not', '--remotes'], cwd);
    return n === null ? null : parseInt(n, 10);
  })();

  // Measure against origin/master, never the LOCAL master ref. Every command
  // here fetches origin first, so origin/master is fresh by construction while
  // local master is whatever this checkout last happened to leave it at — in
  // the office that is routinely hundreds of commits stale, because the office
  // is fast-forwarded by hand and nothing enforces it.
  //
  // Both readings broke, in opposite and equally bad directions:
  //   aheadMaster  OVER-reported  -> `close` cried "N commit(s) are not in
  //                                  master" over work that had just merged
  //                                  cleanly (observed: 27, actual: 0).
  //   behindMaster UNDER-reported -> a desk genuinely behind origin/master
  //                                  looked current, so `audit` never suggested
  //                                  desk:sync and the drift stayed invisible.
  // The second is the dangerous one: it is silent. This is the same principle
  // the `stranded` comment above already states — an alarm that overstates gets
  // ignored, and one that understates never fires at all.
  const mref = masterRef(cwd);
  const behindMaster = isMain ? 0 : countRevs(`HEAD..${mref}`, cwd);
  const aheadMaster  = isMain ? 0 : countRevs(`${mref}..HEAD`, cwd);

  return { ...wt, branch, isMain, dirty, untracked, upstream, unpushed, stranded, behindOrigin, behindMaster, aheadMaster, mref };
}

function flagsFor(d) {
  const f = [];
  if (d.upstream === null && !d.isMain)      f.push(C.red('NO-BACKUP(no upstream)'));
  if (d.stranded > 0)                        f.push(C.red(`STRANDED(${d.stranded})`));
  else if (d.unpushed > 0)                   f.push(C.yel(`unpushed-to-branch(${d.unpushed})`));
  if (!d.isMain && !isParked(d.branch) && d.behindMaster > 0)
    f.push((d.behindMaster > 40 ? C.red : C.yel)(`BEHIND(${d.behindMaster})`));
  if (d.isMain && d.branch !== 'master')     f.push(C.red(`OFFICE-OFF-MASTER(${d.branch})`));
  if (d.isMain && (d.dirty || d.untracked))  f.push(C.yel('OFFICE-DIRTY'));
  if (!d.isMain && d.aheadMaster === 0 && !isParked(d.branch))
    f.push(C.grn('MERGED → close it'));
  if (isParked(d.branch))                    f.push(C.dim('parked'));
  return f;
}

// ─── audit ──────────────────────────────────────────────────────────────────
function cmdAudit() {
  git(['fetch', 'origin', '--quiet']);
  const desks = worktrees().map(describe);

  console.log('\n' + C.bold('DESK AUDIT') + C.dim(`  (${new Date().toISOString().slice(0, 16).replace('T', ' ')})`));
  console.log(C.dim('─'.repeat(100)));
  console.log(
    C.dim('  ' + 'branch'.padEnd(34) + 'ahead↑'.padStart(7) + 'behind↓'.padStart(8) +
      'vs master'.padStart(11) + 'dirty'.padStart(7) + '  flags')
  );

  for (const d of desks) {
    const role = d.isMain ? 'OFFICE' : 'desk';
    const name = `${d.branch}`.slice(0, 33);
    const dirtyCell = d.dirty || d.untracked ? `${d.dirty}+${d.untracked}?` : '—';
    console.log(
      '  ' + (d.isMain ? C.bold(name.padEnd(34)) : name.padEnd(34)) +
      String(d.unpushed ?? '—').padStart(7) +
      String(d.behindOrigin ?? '—').padStart(8) +
      String(d.isMain ? '—' : `-${d.behindMaster}/+${d.aheadMaster}`).padStart(11) +
      dirtyCell.padStart(7) + '  ' + flagsFor(d).join(' ')
    );
    console.log(C.dim(`    ${role}: ${d.path}`));
  }

  // Stranded work anywhere in the repo, including branches with no desk.
  const strandedTotal = countRevs('--branches --not --remotes'.split(' ').join(' ')) ??
    parseInt(execSync('git rev-list --count --branches --not --remotes', { cwd: ROOT, encoding: 'utf8' }).trim(), 10);

  const allBranches = (git(['for-each-ref', '--format=%(refname:short)', 'refs/heads']) || '').split('\n').filter(Boolean);
  const deskBranches = new Set(desks.map(d => d.branch));
  const noDesk = allBranches.filter(b => !deskBranches.has(b));

  console.log(C.dim('─'.repeat(100)));
  console.log(`  ${desks.length} worktrees · ${allBranches.length} local branches · ${noDesk.length} branches with no desk`);
  console.log(`  commits existing ONLY on this machine: ` +
    (strandedTotal === 0 ? C.grn('0  ✓ everything is on GitHub') : C.red(`${strandedTotal}  ← PUSH THESE`)));

  if (noDesk.length) console.log(C.dim(`  branches with no desk: ${noDesk.slice(0, 12).join(', ')}${noDesk.length > 12 ? ', …' : ''}`));

  const actionable = desks.filter(d => !d.isMain && !isParked(d.branch) &&
    (d.stranded > 0 || d.unpushed > 0 || d.behindMaster > 0 || d.aheadMaster === 0));
  if (actionable.length) {
    console.log('\n  ' + C.bold('What to do:'));
    for (const d of actionable) {
      if (d.stranded > 0)       console.log(`   · ${d.branch}: ${C.red(`push ${d.stranded} commit(s)`)} — they exist on ONE DISK`);
      else if (d.unpushed > 0)  console.log(`   · ${d.branch}: ${C.yel(`${d.unpushed} commit(s) not on its own remote`)} — safe elsewhere, but push to keep the branch readable`);
      if (d.behindMaster > 0)   console.log(`   · ${d.branch}: ${C.yel(`${d.behindMaster} behind master`)} — npm run desk:sync`);
      if (d.aheadMaster === 0)  console.log(`   · ${d.branch}: ${C.grn('work is merged')} — npm run desk:close -- ${d.branch}`);
    }
  } else {
    console.log('\n  ' + C.grn('Nothing to do — every desk is pushed, current, and earning its place.'));
  }
  console.log('');
  process.exit(strandedTotal > 0 ? 1 : 0);
}

// ─── sync ───────────────────────────────────────────────────────────────────
function cmdSync() {
  git(['fetch', 'origin', '--quiet']);
  const desks = worktrees().map(describe)
    .filter(d => !d.isMain && !isParked(d.branch));

  if (!desks.length) { console.log('No live desks to sync.'); return; }

  let conflicted = 0, synced = 0, skipped = 0;
  for (const d of desks) {
    process.stdout.write(`\n${C.bold(d.branch)} `);
    if (d.behindMaster === 0) { console.log(C.dim('already current')); skipped++; continue; }
    if (d.dirty > 0) {
      console.log(C.yel(`SKIPPED — ${d.dirty} uncommitted change(s); commit or stash first`));
      skipped++; continue;
    }
    console.log(C.dim(`(${d.behindMaster} behind) merging origin/master…`));

    let out;
    try {
      out = execFileSync('git', ['merge', 'origin/master', '--no-edit'],
        { cwd: d.path, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      console.log('  ' + C.grn('merged clean') + C.dim(' — now run the triad before you trust it:'));
      console.log(C.dim('    npm run check:renderer-syntax && npx tsc --noEmit && npm run validate:concepts'));
      synced++;
    } catch (e) {
      const combined = `${e.stdout || ''}${e.stderr || ''}`;
      const files = (git(['diff', '--name-only', '--diff-filter=U'], d.path) || '').split('\n').filter(Boolean);
      const platform = files.filter(f => PLATFORM_FILES.includes(f));
      console.log('  ' + C.red(`CONFLICT in ${files.length} file(s)`));
      for (const f of files) {
        const hunks = (() => {
          try { return (fs.readFileSync(path.join(d.path, f), 'utf8').match(/^<<<<<<</gm) || []).length; }
          catch { return '?'; }
        })();
        const tag = PLATFORM_FILES.includes(f) ? C.red('  ← PLATFORM (Rule 40)') : '';
        console.log(`      ${f} ${C.dim(`(${hunks} hunk${hunks === 1 ? '' : 's'})`)}${tag}`);
      }
      if (platform.length) {
        console.log('  ' + C.red('STOP.') + ' A shared engine file conflicted. Do not keep-both blind —');
        console.log(C.dim('    a naive resolution once printed two HUD headers per body (PR #10).'));
        console.log(C.dim(`    Route to the owning surgeon: field_3d → field3d-surgeon; parametric/particle_field → pcpl-surgeon.`));
      }
      console.log(C.dim(`    Resolve in: ${d.path}   (abort with: git -C "${d.path}" merge --abort)`));
      conflicted++;
      break; // one conflict at a time — never leave two half-merged desks
    }
  }
  console.log(`\n${synced} synced · ${skipped} skipped · ${conflicted} conflicted`);
  process.exit(conflicted ? 1 : 0);
}

// ─── new ────────────────────────────────────────────────────────────────────
function cmdNew(branch) {
  if (!branch) { console.error('usage: npm run desk:new -- feat/<subject>-<thing>'); process.exit(2); }
  if (!/^feat\/[a-z0-9]+-[a-z0-9-]+$/.test(branch)) {
    console.error(C.yel(`warning: "${branch}" does not match feat/<subject>-<thing> (e.g. feat/ch9-ray-optics)`));
  }
  // Named after the checkout it sits beside, so desks stay recognisable on a
  // clone whose folder is not `physics-mind` (this Windows repo IS physics-mind,
  // so the resulting path is unchanged there).
  const dir = path.join(path.dirname(ROOT), `${path.basename(ROOT)}-${branch.replace(/^feat\//, '')}`);
  if (fs.existsSync(dir)) { console.error(C.red(`${dir} already exists`)); process.exit(1); }

  git(['fetch', 'origin', '--quiet']);
  console.log(`Opening desk ${C.bold(branch)} at ${dir}`);
  // Branches off origin/master and initially tracks it. That is self-healing:
  // the post-commit hook pushes with an explicit `--set-upstream origin <branch>`,
  // so the upstream is corrected on the first commit. A bare `git push` before
  // then is refused by git (push.default=simple) rather than going to master.
  execFileSync('git', ['worktree', 'add', '-b', branch, dir, 'origin/master'],
    { cwd: ROOT, stdio: 'inherit' });

  // node_modules as a junction, not a copy — 708 entries duplicated per desk otherwise.
  const target = path.join(ROOT, 'node_modules');
  const link = path.join(dir, 'node_modules');
  try {
    if (IS_WIN) execSync(`cmd /c mklink /J "${link}" "${target}"`, { stdio: 'ignore' });
    else fs.symlinkSync(target, link, 'dir');   // POSIX equivalent of /J
    console.log(C.grn('  node_modules junction created'));
  } catch {
    console.log(C.yel('  could not create node_modules junction — run `npm install` in the desk'));
  }
  console.log(`\n  cd ${dir}`);
  console.log(C.dim('  One desk = one branch = one job. Close it when it merges.'));
}

// ─── close ──────────────────────────────────────────────────────────────────
function cmdClose(branch, yes) {
  if (!branch) { console.error('usage: npm run desk:close -- <branch> [--yes]'); process.exit(2); }
  git(['fetch', 'origin', '--quiet']);
  const wt = worktrees().map(describe).find(d => d.branch === branch);
  if (!wt) { console.error(C.red(`no desk found for branch ${branch}`)); process.exit(1); }
  if (wt.isMain) { console.error(C.red('refusing to close the office')); process.exit(1); }

  console.log(`\nClosing ${C.bold(branch)}  ${C.dim(wt.path)}`);
  const blockers = [];
  if (wt.upstream === null && wt.stranded > 0) blockers.push('no upstream and commits exist nowhere else');
  else if (wt.stranded > 0) blockers.push(`${wt.stranded} commit(s) exist on this disk only`);
  if (wt.dirty > 0)         blockers.push(`${wt.dirty} uncommitted change(s)`);

  if (wt.mref === 'master') {
    console.log(C.yel('  warning: origin/master did not resolve — measuring against the LOCAL master ref,'));
    console.log(C.dim('  which may be stale. Fetch and re-run before trusting the line below.'));
  }
  if (wt.aheadMaster > 0) {
    console.log(C.yel(`  note: ${wt.aheadMaster} commit(s) are not in ${wt.mref}.`));
    console.log(C.dim('  That is fine IF the work landed another way (a merged PR, a port) or the branch') );
    console.log(C.dim('  stays on GitHub for the record. It is NOT fine if this is unlanded work.'));
  } else {
    console.log(C.grn(`  work is fully in ${wt.mref} ✓`));
  }

  const untracked = (git(['status', '--porcelain'], wt.path) || '')
    .split('\n').filter(l => l.startsWith('??')).map(l => l.slice(3));
  if (untracked.length) {
    console.log(C.yel(`  ${untracked.length} untracked file(s) will be LOST:`));
    untracked.slice(0, 10).forEach(f => console.log(C.dim(`      ${f}`)));
    if (untracked.length > 10) console.log(C.dim(`      … and ${untracked.length - 10} more`));
  }

  if (blockers.length) {
    console.log('\n  ' + C.red('REFUSING TO CLOSE:'));
    blockers.forEach(b => console.log(C.red(`    · ${b}`)));
    console.log(C.dim('\n  Fix those first (git push / git commit), then re-run.'));
    process.exit(1);
  }
  if (!yes) {
    console.log('\n  ' + C.dim('Dry run. Re-run with --yes to actually close:'));
    console.log(C.dim(`    npm run desk:close -- ${branch} --yes`));
    return;
  }

  if (untracked.length) {
    const stamp = new Date().toISOString().slice(0, 10);
    const backup = path.join(BACKUP_ROOT, `desk-close-${stamp}`, branch.replace(/[/\\]/g, '_'));
    fs.mkdirSync(backup, { recursive: true });
    for (const f of untracked) {
      const src = path.join(wt.path, f);
      if (!fs.existsSync(src)) continue;
      const dst = path.join(backup, f);
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      try { fs.cpSync(src, dst, { recursive: true }); } catch {}
    }
    console.log(C.grn(`  backed up untracked files → ${backup}`));
  }

  // THE JUNCTION TRAP: remove the node_modules junction BEFORE the worktree.
  // `git worktree remove` follows the junction and empties the REAL node_modules.
  const link = path.join(wt.path, 'node_modules');
  if (IS_WIN) {
    if (fs.existsSync(link)) {
      try { execSync(`cmd /c rmdir "${link}"`, { stdio: 'ignore' }); console.log(C.grn('  node_modules junction removed (before worktree — the documented order)')); }
      catch { console.error(C.red('  could not remove the junction — ABORTING rather than risk the real node_modules')); process.exit(1); }
    }
  } else {
    // lstat, never exists/stat: a stat FOLLOWS the link, which is the very thing
    // this block exists to avoid.
    let st = null;
    try { st = fs.lstatSync(link); } catch { st = null; }
    if (st && st.isSymbolicLink()) {
      // unlink removes the LINK itself and never recurses into the office's copy.
      try { fs.unlinkSync(link); console.log(C.grn('  node_modules symlink removed (before worktree — the documented order)')); }
      catch { console.error(C.red('  could not remove the symlink — ABORTING rather than risk the real node_modules')); process.exit(1); }
    } else if (st) {
      // A real per-desk install (symlink creation failed at desk:new time). It is
      // this desk's OWN copy and is gitignored, so the worktree removal may take it.
      console.log(C.dim('  node_modules is a real directory in this desk — it goes with the worktree'));
    }
  }

  try {
    execFileSync('git', ['worktree', 'remove', wt.path], { cwd: ROOT, stdio: 'inherit' });
  } catch {
    console.log(C.yel('  worktree dir is locked by a running process — pruning the registration instead'));
  }
  git(['worktree', 'prune']);

  const nm = fs.existsSync(path.join(ROOT, 'node_modules')) ? fs.readdirSync(path.join(ROOT, 'node_modules')).length : 0;
  console.log(C.grn(`  desk closed. Main node_modules intact (${nm} entries).`));
  console.log(C.dim(`  Branch ${branch} still exists locally and on GitHub — nothing was deleted.`));
}

// ─── dispatch ───────────────────────────────────────────────────────────────
const [, , sub, ...rest] = process.argv;
const args = rest.filter(a => a !== '--yes');
const yes  = rest.includes('--yes');

switch (sub) {
  case 'audit': cmdAudit(); break;
  case 'sync':  cmdSync();  break;
  case 'new':   cmdNew(args[0]); break;
  case 'close': cmdClose(args[0], yes); break;
  default:
    console.log(`usage: node scripts/desk.js <audit|sync|new|close> [args]

  audit                    the truth table for every desk (run at session start AND close)
  sync                     merge origin/master into every live desk; stops on first conflict
  new   feat/<sub>-<thing> open a desk (worktree + branch + node_modules junction)
  close <branch> [--yes]   close a desk; refuses if anything would be lost`);
    process.exit(2);
}
