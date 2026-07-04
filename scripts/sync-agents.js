#!/usr/bin/env node
/**
 * sync-agents.js
 *
 * Syncs canonical agent specs → dispatch emissions.
 *
 * Canonical  : physics-mind/.agents/<role>/CLAUDE.md     (founder edits this)
 * Emission   : physics-mind/.claude/agents/<role>.md     (Claude Code dispatches this)
 *
 * Emission file layout:
 *   ---                         <- YAML frontmatter (name/description/tools/model)
 *   ...                            preserved verbatim from the existing emission
 *   ---
 *
 *   > **Spec source.** ...      <- role-specific "Spec source" preamble (blockquote)
 *                                  preserved verbatim from the existing emission
 *   # <ROLE> — Agent Spec       <- body. This H1 and everything below it IS the
 *   ...                            canonical content, and is replaced on sync.
 *
 * Sync = [everything in the emission up to the first H1] + [canonical body].
 * This preserves BOTH the frontmatter AND the per-role preamble, and only the
 * body is taken from the canonical. Line-ending agnostic (handles CRLF + LF);
 * output is normalized to LF to match how the files are stored in git.
 *
 * Only writes when canonical is newer than emission (mtime) — safe to run on
 * every edit, so the PostToolUse hook can fire it after any Edit/Write.
 *
 * Usage:
 *   node scripts/sync-agents.js            # sync all 7 roles
 *   node scripts/sync-agents.js --check    # report drift without writing (exit 1 if any)
 *   npm run sync:agents
 */

const fs   = require('fs');
const path = require('path');

const CHECK_ONLY = process.argv.includes('--check');
const ROOT = path.join(__dirname, '..');

// canonical dir name (underscore) → emission filename (hyphenated)
const ROLES = [
  { canonical: 'architect',           emission: 'architect'           },
  { canonical: 'physics_author',      emission: 'physics-author'      },
  { canonical: 'json_author',         emission: 'json-author'         },
  { canonical: 'quality_auditor',     emission: 'quality-auditor'     },
  { canonical: 'renderer_primitives', emission: 'renderer-primitives' },
  { canonical: 'runtime_generation',  emission: 'runtime-generation'  },
  { canonical: 'feedback_collector',  emission: 'feedback-collector'  },
  // added 2026-07-04 — eye_walker + retrofit_surgeon (Alex), shipper (Release cluster)
  { canonical: 'eye_walker',          emission: 'eye-walker'          },
  { canonical: 'retrofit_surgeon',    emission: 'retrofit-surgeon'    },
  { canonical: 'shipper',             emission: 'shipper'             },
];

const H1 = /^#\s/; // a markdown H1 line ("# ...")

/**
 * Build the new emission text from the existing emission + canonical body.
 * Returns the new text, or null if the layout is unexpected (caller treats
 * null as an error and skips writing — never corrupts a file).
 */
function buildEmission(emissionText, canonicalText) {
  // Split on either line-ending; we rebuild with LF.
  const emissionLines  = emissionText.split(/\r?\n/);
  const canonicalLines = canonicalText.split(/\r?\n/);

  // The canonical must start with its H1 (it is the body, no preamble).
  if (!H1.test(canonicalLines[0] || '')) return null;

  // Find the first H1 in the emission — that is where the body begins.
  // Everything before it (frontmatter + blank lines + preamble) is preserved.
  const bodyStart = emissionLines.findIndex((l) => H1.test(l));
  if (bodyStart < 0) return null;

  const header = emissionLines.slice(0, bodyStart);
  const out = header.concat(canonicalLines).join('\n');

  // Preserve a single trailing newline if the canonical had one.
  return /\r?\n$/.test(canonicalText) && !out.endsWith('\n') ? out + '\n' : out;
}

let synced = 0, upToDate = 0, errors = 0;

for (const { canonical, emission } of ROLES) {
  const canonicalPath = path.join(ROOT, '.agents', canonical, 'CLAUDE.md');
  const emissionPath  = path.join(ROOT, '.claude', 'agents', `${emission}.md`);

  if (!fs.existsSync(canonicalPath)) {
    console.warn(`SKIP  (canonical not found): .agents/${canonical}/CLAUDE.md`);
    continue;
  }

  if (!fs.existsSync(emissionPath)) {
    console.error(`ERROR (emission missing — create it with YAML frontmatter + Spec-source preamble first): .claude/agents/${emission}.md`);
    errors++;
    continue;
  }

  const canonicalMtime = fs.statSync(canonicalPath).mtimeMs;
  const emissionMtime  = fs.statSync(emissionPath).mtimeMs;

  if (canonicalMtime <= emissionMtime) {
    upToDate++;
    continue;
  }

  // Canonical is newer — needs sync
  if (CHECK_ONLY) {
    console.log(`DRIFT .agents/${canonical}/CLAUDE.md is newer than .claude/agents/${emission}.md`);
    errors++;
    continue;
  }

  const canonicalText = fs.readFileSync(canonicalPath, 'utf8');
  const emissionText  = fs.readFileSync(emissionPath, 'utf8');
  const next = buildEmission(emissionText, canonicalText);

  if (next === null) {
    console.error(`ERROR (unexpected layout — emission needs an "# <ROLE>" H1, canonical must start with one): .claude/agents/${emission}.md`);
    errors++;
    continue;
  }

  // Skip the write if nothing actually changed (keeps mtime stable, avoids churn).
  if (next === emissionText) {
    // Touch parity: bump the emission mtime so the drift check settles, without rewriting bytes.
    fs.utimesSync(emissionPath, new Date(), new Date());
    upToDate++;
    continue;
  }

  fs.writeFileSync(emissionPath, next, 'utf8');
  console.log(`SYNCED .agents/${canonical}/CLAUDE.md → .claude/agents/${emission}.md`);
  synced++;
}

if (CHECK_ONLY) {
  if (errors === 0) {
    console.log(`OK — all ${upToDate} emissions are up-to-date with their canonicals.`);
  } else {
    console.error(`\nDRIFT DETECTED: ${errors} emission(s) are stale. Run: npm run sync:agents`);
    process.exit(1);
  }
} else {
  const msg = [];
  if (synced   > 0) msg.push(`${synced} synced`);
  if (upToDate > 0) msg.push(`${upToDate} already up-to-date`);
  if (errors   > 0) msg.push(`${errors} errors`);
  console.log(`\nDone: ${msg.join(', ')}`);
  if (errors > 0) process.exit(1);
}
