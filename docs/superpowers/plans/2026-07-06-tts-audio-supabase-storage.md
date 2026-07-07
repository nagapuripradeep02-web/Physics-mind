# TTS Audio → Supabase Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every reviewer-approved Sarvam TTS clip durable and machine-independent by storing it (content-addressed) in Supabase Storage, with a small git-tracked manifest per concept — ending the "audio exists only on this one laptop in a git-ignored folder" risk without putting binaries in git.

**Architecture:** Git stays source-only (narration text in the concept JSON + a tiny tracked manifest); a public-read Supabase Storage bucket `tts-audio` in the **dev** project (`dxwpkjfypzxrzgbevfnx`) holds the mp3 bytes, keyed by `concept/sentence_lang_texthash8.mp3` so objects are immutable and deduped; `tts:generate` uploads as it voices, a new `tts:pull` re-hydrates any clone/machine, and `build:review`/`build:pilot` keep reading **local files** so the Netlify pilot stays fully static (zero runtime egress). Migration uploads the ~2,000 existing clips (live `review-site/` + `review-site-archive/`).

**Tech Stack:** TypeScript (tsx scripts), `@supabase/supabase-js` v2 Storage API (already a dependency — `src/lib/supabaseAdmin.ts`), Sarvam TTS (unchanged), sha1 `text_hash` (already computed per clip).

## Global Constraints

- **No test framework exists in this repo** (root `CLAUDE.md` §6: "No test suite"). Every task's verify steps are script runs / file checks with expected output, not unit tests. Do NOT add a test framework.
- `npx tsc --noEmit` must be **0 errors** after every task.
- Bucket lives in the **dev** Supabase project `dxwpkjfypzxrzgbevfnx` (the authoring store). NEVER the pilot project `jqbnmltsupnnbuvqgkix` (auth + telemetry only).
- Env vars `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` already exist in `.env.local`; all new scripts run with `npx tsx --env-file=.env.local`.
- Bucket = **public read, service-role write only** (never add an anon/authenticated INSERT storage policy). Clips are not sensitive.
- **Rule 30f unchanged:** voicing still happens only post-founder-approval; this plan changes *where bytes persist*, never *when* they're generated. No Hindi audio, never `--force`, `bulbul:v3`/`priya` defaults untouched.
- The pilot/professor serving path stays **static files on Netlify** — no runtime fetches from Supabase Storage in any player page.
- Long-running steps (migration upload of ~2,000 clips) must run **detached** (`Start-Process cmd.exe`) — this machine SIGTERMs foreground runs at ~8 min.
- `CLAUDE.md` is founder-gated: Task 6 *drafts* a suggestion; it never edits `CLAUDE.md` directly.
- Commit style: conventional commits, no attribution footer (repo convention, e.g. `fad34d3`).

## Current-State Map (verified 2026-07-06)

| Fact | Where |
|---|---|
| Clips written to `review-site/<id>/audio/<sentenceId>_<lang>.mp3` | `src/scripts/generate_tts_audio.ts:33` (`OUT_DIR`), `:292` |
| Manifest written to `review-site/<id>/audio_manifest.json` (incrementally, after every clip) | `generate_tts_audio.ts:267–286` (`flushManifest`) |
| `ClipEntry = {id, lang, file, duration_ms, chars, available, text_hash?}` | `generate_tts_audio.ts:53–65` |
| Reuse check: prior manifest `text_hash` vs current sentence sha1 | `generate_tts_audio.ts:305–316` |
| Builder reads manifest at **build time** from `review-site/<id>/audio_manifest.json`, embeds it; player uses relative `./audio/…` paths | `src/scripts/build_review_site.ts:151–161` (`loadAudioManifest`), `:868` |
| `review-site/` is git-ignored; `visual_baselines/` is tracked | `.gitignore:94`, `:59` |
| Supabase admin client (service role, from `.env.local`) | `src/lib/supabaseAdmin.ts` |
| No `.storage.` usage anywhere yet | verified by grep |
| Measured size: 56 clips = 3.2 MB (one concept); archive holds ~2,000 clips | this session + PROGRESS 2026-07-05 |

## File Structure

- **Create** `src/lib/ttsStorage.ts` — the ONLY module that knows the bucket name/key scheme; upload/download/init helpers shared by all three scripts.
- **Create** `src/scripts/storage_init_tts_audio.ts` — one-shot idempotent bucket bootstrap.
- **Create** `src/scripts/pull_tts_audio.ts` — re-hydrate local `review-site/<id>/audio/` from Storage (`tts:pull`).
- **Create** `src/scripts/_migrate_audio_to_storage.ts` — one-shot upload of all existing clips (prefix `_` = temp convention, like `_seed_*_cache.ts`).
- **Create** `src/data/audio_manifests/` — git-tracked canonical manifests, one `<concept_id>.json` each.
- **Modify** `src/scripts/generate_tts_audio.ts` — upload-after-voice + dual-path manifest write.
- **Modify** `src/scripts/build_review_site.ts` — read tracked manifest first, legacy fallback.
- **Modify** `package.json` — `storage:init`, `tts:pull` scripts.

---

### Task 1: `ttsStorage` lib + bucket bootstrap (`storage:init`)

**Files:**
- Create: `src/lib/ttsStorage.ts`
- Create: `src/scripts/storage_init_tts_audio.ts`
- Modify: `package.json` (scripts block, after `"tts:rollout"` line 19)

**Interfaces:**
- Produces (used by Tasks 2, 4, 5):
  - `TTS_AUDIO_BUCKET = 'tts-audio'`
  - `storageKeyFor(conceptId: string, sentenceId: string, lang: string, textHash: string): string` → `` `${conceptId}/${sentenceId}_${lang}_${textHash.slice(0, 8)}.mp3` ``
  - `uploadClip(key: string, mp3: Buffer): Promise<'uploaded' | 'exists'>` — upsert:false; duplicate ⇒ `'exists'` (content-addressed, so a duplicate IS success); any other error throws
  - `downloadClip(key: string): Promise<Buffer>` — throws if missing
  - `ensureBucket(): Promise<'created' | 'exists'>`

- [ ] **Step 1: Write `src/lib/ttsStorage.ts`**

```typescript
/**
 * ttsStorage — the single module that knows how TTS audio lives in Supabase
 * Storage. Bucket `tts-audio` (public READ, service-role WRITE) in the DEV
 * project. Keys are content-addressed with the sentence text_hash so objects
 * are immutable: re-voicing changed text creates a NEW key; identical text
 * re-uploads dedupe to 'exists'. Consumers: generate_tts_audio (upload),
 * pull_tts_audio (download), _migrate_audio_to_storage (backfill).
 */
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const TTS_AUDIO_BUCKET = 'tts-audio';

/** `<concept>/<sentence>_<lang>_<hash8>.mp3` — hash8 pins the clip to the exact text it voiced. */
export function storageKeyFor(conceptId: string, sentenceId: string, lang: string, textHash: string): string {
    return `${conceptId}/${sentenceId}_${lang}_${textHash.slice(0, 8)}.mp3`;
}

export async function ensureBucket(): Promise<'created' | 'exists'> {
    const { error } = await supabaseAdmin.storage.createBucket(TTS_AUDIO_BUCKET, {
        public: true, // public READ; writes still need the service key (no INSERT policy added)
        fileSizeLimit: '10MB',
        allowedMimeTypes: ['audio/mpeg'],
    });
    if (!error) return 'created';
    if (/already exists/i.test(error.message)) return 'exists';
    throw new Error(`createBucket failed: ${error.message}`);
}

export async function uploadClip(key: string, mp3: Buffer): Promise<'uploaded' | 'exists'> {
    const { error } = await supabaseAdmin.storage
        .from(TTS_AUDIO_BUCKET)
        .upload(key, mp3, { contentType: 'audio/mpeg', upsert: false });
    if (!error) return 'uploaded';
    // Content-addressed: an existing object at this key IS this clip.
    if (/already exists|duplicate/i.test(error.message)) return 'exists';
    throw new Error(`upload ${key} failed: ${error.message}`);
}

export async function downloadClip(key: string): Promise<Buffer> {
    const { data, error } = await supabaseAdmin.storage.from(TTS_AUDIO_BUCKET).download(key);
    if (error || !data) throw new Error(`download ${key} failed: ${error?.message ?? 'no data'}`);
    return Buffer.from(await data.arrayBuffer());
}
```

- [ ] **Step 2: Write `src/scripts/storage_init_tts_audio.ts`**

```typescript
/**
 * One-shot idempotent bootstrap for the `tts-audio` Storage bucket.
 * Run: npm run storage:init
 */
import '@/lib/loadEnvLocal';
import { ensureBucket, TTS_AUDIO_BUCKET } from '@/lib/ttsStorage';

async function main(): Promise<void> {
    const result = await ensureBucket();
    console.log(`✅ bucket "${TTS_AUDIO_BUCKET}": ${result}`);
}

main().catch((err) => {
    console.error('💥 storage:init failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
```

(Import of `@/lib/loadEnvLocal` mirrors `_seed_gauss_law_solid_sphere_cache.ts:16` — same env-loading convention.)

- [ ] **Step 3: Add npm scripts** — in `package.json`, directly after the `"tts:rollout"` entry:

```json
    "storage:init": "npx tsx --env-file=.env.local src/scripts/storage_init_tts_audio.ts",
    "tts:pull": "npx tsx --env-file=.env.local src/scripts/pull_tts_audio.ts",
```

(`tts:pull` points at a Task-4 file; npm scripts referencing a not-yet-created file are inert until invoked.)

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Run the bootstrap + verify live**

Run: `npm run storage:init`
Expected: `✅ bucket "tts-audio": created` (first run) — re-run once more and expect `exists` (idempotency proof).
Then verify in SQL (Supabase MCP or dashboard, dev project): `SELECT id, public FROM storage.buckets WHERE id = 'tts-audio';` → one row, `public = true`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/ttsStorage.ts src/scripts/storage_init_tts_audio.ts package.json
git commit -m "feat(tts): tts-audio Storage bucket bootstrap + ttsStorage lib (content-addressed keys)"
```

---

### Task 2: `tts:generate` uploads as it voices + tracked manifest

**Files:**
- Modify: `src/scripts/generate_tts_audio.ts` (imports `:24–28`, config `:30–34`, `ClipEntry` `:53–65`, prior-manifest read `:249–256`, `flushManifest` `:267–286`, voice loop `:288–342`)

**Interfaces:**
- Consumes: `storageKeyFor`, `uploadClip` from Task 1.
- Produces (relied on by Tasks 3, 4, 5):
  - `ClipEntry` gains `storage_key?: string` — set iff the clip's bytes are known-present in the bucket.
  - Canonical manifest now ALSO written to `src/data/audio_manifests/<conceptId>.json` (git-tracked). The legacy `review-site/<id>/audio_manifest.json` copy is still written (other readers — e.g. the pilot audio-freshness audit — keep working).

- [ ] **Step 1: Add imports + tracked-manifest dir const** — after line 33 (`const OUT_DIR = …`):

```typescript
import { storageKeyFor, uploadClip } from '@/lib/ttsStorage';
// (import goes at the top with the others; const goes with the config block)
const MANIFEST_DIR = join(ROOT, 'src', 'data', 'audio_manifests'); // git-tracked canonical manifests
```

- [ ] **Step 2: Extend `ClipEntry`** — add after `text_hash?: string;` (line 64):

```typescript
  /** Supabase Storage object key (bucket tts-audio) holding this clip's exact
   *  bytes — content-addressed with text_hash so it never goes stale. Absent =
   *  clip not yet durably stored (upload failed or pre-migration). */
  storage_key?: string;
```

- [ ] **Step 3: Prior-manifest read prefers the tracked path** — replace lines 250–256:

```typescript
  // Canonical manifest is the git-tracked one; fall back to the legacy
  // review-site copy for concepts voiced before the Storage migration.
  const manifestPathExisting = existsSync(join(MANIFEST_DIR, `${conceptId}.json`))
    ? join(MANIFEST_DIR, `${conceptId}.json`)
    : join(OUT_DIR, conceptId, 'audio_manifest.json');
  if (existsSync(manifestPathExisting)) {
    try {
      const prev = JSON.parse(readFileSync(manifestPathExisting, 'utf-8')) as { clips?: Record<string, ClipEntry> };
      for (const [k, c] of Object.entries(prev.clips ?? {})) prior[k] = c;
    } catch { /* ignore */ }
  }
```

- [ ] **Step 4: `flushManifest` dual-writes** — inside `flushManifest` (lines 272–286), replace the single `writeFileSync(manifestPath, …)` with:

```typescript
    const body = JSON.stringify(manifest, null, 2);
    writeFileSync(manifestPath, body, 'utf-8');            // legacy copy (review-site readers)
    mkdirSync(MANIFEST_DIR, { recursive: true });
    writeFileSync(join(MANIFEST_DIR, `${conceptId}.json`), body, 'utf-8'); // canonical, git-tracked
```

- [ ] **Step 5: Upload after voicing + backfill on reuse** — two edits in the voice loop:

(a) In the freshly-voiced branch, after `written++;` (line 326), replace the `console.log` line with:

```typescript
          let storageKey: string | undefined;
          try {
            storageKey = storageKeyFor(conceptId, s.id, lang, hash);
            await uploadClip(storageKey, wavToMp3(wav));
          } catch (e) {
            storageKey = undefined; // durable storage is best-effort; local file + manifest still valid
            console.warn(`   ${tag} ⚠ Storage upload failed (clip kept locally) — ${e instanceof Error ? e.message : e}`);
          }
          console.log(`   ${tag} ✓ ${Math.round(duration_ms)}ms${storageKey ? ' ☁' : ''}`);
```

and change the final clip record (line 339) to carry it:

```typescript
      clips[key] = { id: s.id, lang, file: rel, duration_ms, chars: text.length, available: true, text_hash: hash, storage_key: storageKeyMaybe };
```

(b) To make that compile for BOTH branches, declare `let storageKeyMaybe: string | undefined;` next to `let duration_ms: number;` (line 312); in the fresh branch assign `storageKeyMaybe = storageKey;`; in the ⏭ already-on-disk branch (line 313–316) backfill:

```typescript
        duration_ms = p?.duration_ms ?? 0;
        storageKeyMaybe = p?.storage_key;
        if (!storageKeyMaybe) {
          // Voiced pre-migration: push the existing local bytes up now (backfill).
          try {
            storageKeyMaybe = storageKeyFor(conceptId, s.id, lang, hash);
            await uploadClip(storageKeyMaybe, readFileSync(abs));
            console.log(`   ${tag} ⏭ already on disk → ☁ backfilled`);
          } catch (e) {
            storageKeyMaybe = undefined;
            console.warn(`   ${tag} ⏭ already on disk; ⚠ backfill failed — ${e instanceof Error ? e.message : e}`);
          }
        } else {
          console.log(`   ${tag} ⏭ already on disk + ☁`);
        }
        skippedExisting++;
```

(The failed-clip and no-text paths at lines 299/331 stay as-is — they never set `storage_key`.)

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 7: End-to-end verify on a real voiced concept (all-reuse = $0 Sarvam)**

Run: `npm run tts:generate -- gauss_law_solid_sphere --langs=en,te`
Expected: 56 × `⏭ already on disk → ☁ backfilled` (first run), `0 written` (no Sarvam calls, no cost), and a new `src/data/audio_manifests/gauss_law_solid_sphere.json` whose every clip has `"storage_key": "gauss_law_solid_sphere/…_<hash8>.mp3"` and `"available": true`.
Re-run the same command: expected `⏭ already on disk + ☁` (idempotent, no re-upload).
Live check: `SELECT count(*) FROM storage.objects WHERE bucket_id = 'tts-audio' AND name LIKE 'gauss_law_solid_sphere/%';` → 56.

- [ ] **Step 8: Commit**

```bash
git add src/scripts/generate_tts_audio.ts src/data/audio_manifests/gauss_law_solid_sphere.json
git commit -m "feat(tts): generate uploads clips to Storage (content-addressed) + git-tracked audio manifests"
```

---

### Task 3: `build:review` reads the tracked manifest first

**Files:**
- Modify: `src/scripts/build_review_site.ts` (`loadAudioManifest` `:151–161`; the no-manifest warning at `:2026`)

**Interfaces:**
- Consumes: tracked manifest path convention `src/data/audio_manifests/<conceptId>.json` (Task 2). The builder's `AudioClip` type (`:140–149`) needs no change — `storage_key` is an extra field it simply ignores.

- [ ] **Step 1: Point `loadAudioManifest` at the canonical path with legacy fallback** — replace lines 151–161:

```typescript
function loadAudioManifest(conceptId: string): Record<string, AudioClip> {
    // Canonical: git-tracked manifest (Storage-era). Fallback: legacy copy
    // inside review-site/ for concepts voiced before the migration.
    const tracked = join(ROOT, 'src', 'data', 'audio_manifests', `${conceptId}.json`);
    const p = existsSync(tracked) ? tracked : join(OUT_DIR, conceptId, 'audio_manifest.json');
    if (!existsSync(p)) return {};
    try {
        const m = JSON.parse(readFileSync(p, 'utf-8')) as { clips?: Record<string, AudioClip> };
        return m.clips ?? {};
    } catch {
        console.warn(`   ⚠ could not parse ${p} — narration will be silent`);
        return {};
    }
}
```

(If `ROOT` is not already a const in this file, mirror the existing pattern: `const ROOT = process.cwd();` next to `OUT_DIR`.)

- [ ] **Step 2: Teach the no-audio warning about `tts:pull`** — at line 2026 replace the warn text:

```typescript
        console.warn(`   ⚠ ${conceptId}: no audio_manifest.json — run "npm run tts:generate ${conceptId}" (new voicing) or "npm run tts:pull -- ${conceptId}" (fetch stored clips) first; narration will be silent.`);
```

Also add, right after the manifest load succeeds in that build path, a missing-local-file guard so a fresh clone gets a precise instruction instead of a silently-broken page:

```typescript
        const missingLocal = Object.values(manifest).filter(
            (c) => c.available && !existsSync(join(OUT_DIR, conceptId, c.file))
        ).length;
        if (missingLocal > 0) {
            console.warn(`   ⚠ ${conceptId}: ${missingLocal} clips in manifest but not on disk — run "npm run tts:pull -- ${conceptId}" to fetch them from Storage.`);
        }
```

(Anchor: place it in the same function that calls `loadAudioManifest` for the build — search for the `:2026` warn; the guard goes in the success branch beside it. `manifest` = that function's local return of `loadAudioManifest(conceptId)`.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Verify build is byte-stable**

Run: `npm run build:review -- gauss_law_solid_sphere`
Expected: `✅ Built review page for gauss_law_solid_sphere (7 states)`, NO stale/muted/missing warnings (all 56 clips exist locally). Page must behave identically — the manifest content is the same JSON, just read from the tracked path.
Then: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/gauss_law_solid_sphere/` → `200` (server already running).

- [ ] **Step 5: Commit**

```bash
git add src/scripts/build_review_site.ts
git commit -m "feat(review): builder reads git-tracked audio manifests (legacy fallback) + tts:pull hints"
```

---

### Task 4: `tts:pull` — re-hydrate any machine from Storage

**Files:**
- Create: `src/scripts/pull_tts_audio.ts` (npm script `tts:pull` already added in Task 1)

**Interfaces:**
- Consumes: `downloadClip` (Task 1); tracked manifests (Task 2).
- Produces: local `review-site/<id>/audio/<sentenceId>_<lang>.mp3` files — exactly where `build:review`/`build:pilot` expect them.

- [ ] **Step 1: Write `src/scripts/pull_tts_audio.ts`**

```typescript
/**
 * tts:pull — re-hydrate local review-site/<id>/audio/ from Supabase Storage
 * using the git-tracked manifest. The inverse of generate's upload: makes any
 * fresh clone / second machine audio-complete WITHOUT re-voicing (exact
 * approved bytes, $0 Sarvam).
 *
 * Run: npm run tts:pull -- <conceptId>   (or --all for every tracked manifest)
 */
import '@/lib/loadEnvLocal';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { downloadClip } from '@/lib/ttsStorage';

const ROOT = process.cwd();
const MANIFEST_DIR = join(ROOT, 'src', 'data', 'audio_manifests');
const OUT_DIR = join(ROOT, 'review-site');

interface ClipEntry {
    id: string;
    lang: string;
    file: string;           // e.g. "audio/s1_1_en.mp3" (local relative path)
    available: boolean;
    storage_key?: string;   // e.g. "gauss_law_solid_sphere/s1_1_en_ab12cd34.mp3"
}

async function pullConcept(conceptId: string): Promise<void> {
    const mPath = join(MANIFEST_DIR, `${conceptId}.json`);
    if (!existsSync(mPath)) {
        console.warn(`⚠ ${conceptId}: no tracked manifest at ${mPath} — nothing to pull`);
        return;
    }
    const clips = (JSON.parse(readFileSync(mPath, 'utf-8')) as { clips?: Record<string, ClipEntry> }).clips ?? {};
    const audioDir = join(OUT_DIR, conceptId, 'audio');
    mkdirSync(audioDir, { recursive: true });

    let pulled = 0, present = 0, unpullable = 0;
    for (const c of Object.values(clips)) {
        if (!c.available) continue;
        const abs = join(OUT_DIR, conceptId, c.file);
        if (existsSync(abs)) { present++; continue; }
        if (!c.storage_key) { unpullable++; console.warn(`   ⚠ ${c.file}: no storage_key (pre-migration clip never uploaded)`); continue; }
        writeFileSync(abs, await downloadClip(c.storage_key));
        pulled++;
    }
    console.log(`✅ ${conceptId}: ${pulled} pulled, ${present} already local, ${unpullable} unpullable`);
    if (unpullable > 0) console.log(`   → fix unpullable clips with: npm run tts:generate -- ${conceptId} (re-voices only what's missing)`);
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const all = args.includes('--all');
    const conceptId = args.find((a) => !a.startsWith('--'));
    const targets = all
        ? readdirSync(MANIFEST_DIR).filter((f) => f.endsWith('.json')).map((f) => basename(f, '.json'))
        : conceptId ? [conceptId] : [];
    if (targets.length === 0) {
        console.error('Usage: tts:pull -- <conceptId> | --all');
        process.exit(1);
    }
    for (const t of targets) await pullConcept(t);
}

main().catch((err) => {
    console.error('💥 tts:pull failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Verify with a real round-trip (safe: move-aside, never delete)**

```powershell
Move-Item review-site\gauss_law_solid_sphere\audio\s1_1_en.mp3 $env:TEMP\s1_1_en.mp3.bak
npm run tts:pull -- gauss_law_solid_sphere
```
Expected: `✅ gauss_law_solid_sphere: 1 pulled, 55 already local, 0 unpullable`, and the file exists again with identical size to the backup (`(Get-Item review-site\gauss_law_solid_sphere\audio\s1_1_en.mp3).Length` equals the .bak's Length — byte-exact restoration is the whole point).

- [ ] **Step 4: Commit**

```bash
git add src/scripts/pull_tts_audio.ts
git commit -m "feat(tts): tts:pull re-hydrates local audio from Storage (exact approved bytes, \$0)"
```

---

### Task 5: Migrate ALL existing clips (live + archive) to Storage

**Files:**
- Create: `src/scripts/_migrate_audio_to_storage.ts`
- Creates (output): one `src/data/audio_manifests/<id>.json` per migrated concept

**Interfaces:**
- Consumes: `storageKeyFor`, `uploadClip` (Task 1).
- Produces: every historical clip durable in the bucket; tracked manifests for every voiced concept (the archive's ~2,000 clips included — those are approved voices worth preserving byte-exact).

- [ ] **Step 1: Write `src/scripts/_migrate_audio_to_storage.ts`**

```typescript
/**
 * TEMP one-shot — upload every existing local TTS clip (review-site/ AND
 * review-site-archive/) to the tts-audio bucket and write git-tracked
 * manifests. Idempotent: content-addressed keys make re-runs dedupe to
 * 'exists'. Delete this script after the migration commit (mirrors the
 * _seed_*_cache.ts convention).
 *
 * Storage keys need a text_hash. Clips whose manifest entry has text_hash
 * use it directly. Older manifests without text_hash: hash the CURRENT
 * concept-JSON sentence text IF its char-length matches the manifest's
 * `chars` (the pre-hash equality rule from generate_tts_audio.ts:310);
 * otherwise upload under sha1 of the mp3 BYTES (prefix 'b') — still unique
 * + immutable, and the next real tts:generate run supersedes it.
 *
 * Run DETACHED (>8 min for ~2k clips): see Global Constraints.
 */
import '@/lib/loadEnvLocal';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { storageKeyFor, uploadClip } from '@/lib/ttsStorage';

const ROOT = process.cwd();
const SOURCES = [join(ROOT, 'review-site'), join(ROOT, 'review-site-archive')];
const MANIFEST_DIR = join(ROOT, 'src', 'data', 'audio_manifests');
const CONCEPTS_DIR = join(ROOT, 'src', 'data', 'concepts');

interface ClipEntry {
    id: string; lang: string; file: string; duration_ms: number; chars: number;
    available: boolean; text_hash?: string; storage_key?: string;
}
type Manifest = { meta?: Record<string, unknown>; clips?: Record<string, ClipEntry> };

const sha1 = (b: Buffer | string): string => createHash('sha1').update(b).digest('hex');

function currentTextFor(conceptId: string, sentenceId: string, lang: string): string | undefined {
    const p = join(CONCEPTS_DIR, `${conceptId}.json`);
    if (!existsSync(p)) return undefined;
    const json = JSON.parse(readFileSync(p, 'utf-8')) as {
        epic_l_path?: { states?: Record<string, { teacher_script?: { tts_sentences?: Array<{ id: string; text_en?: string; text_hi?: string; text_te?: string }> } }> };
    };
    for (const st of Object.values(json.epic_l_path?.states ?? {})) {
        for (const s of st.teacher_script?.tts_sentences ?? []) {
            if (s.id === sentenceId) {
                const v = lang === 'en' ? s.text_en : lang === 'hi' ? s.text_hi : s.text_te;
                return (v ?? '').trim() || undefined;
            }
        }
    }
    return undefined;
}

async function migrateConcept(dir: string, conceptId: string): Promise<{ up: number; dedup: number; skip: number }> {
    const mPath = join(dir, conceptId, 'audio_manifest.json');
    const manifest = JSON.parse(readFileSync(mPath, 'utf-8')) as Manifest;
    const clips = manifest.clips ?? {};
    let up = 0, dedup = 0, skip = 0;

    for (const [key, c] of Object.entries(clips)) {
        if (!c.available) { skip++; continue; }
        const abs = join(dir, conceptId, c.file);
        if (!existsSync(abs)) { skip++; console.warn(`   ⚠ ${conceptId}/${key}: manifest says available but file missing`); continue; }
        const mp3 = readFileSync(abs);

        let hash = c.text_hash;
        if (!hash) {
            const t = currentTextFor(conceptId, c.id, c.lang);
            hash = t != null && t.length === c.chars ? sha1(t) : `b${sha1(mp3)}`; // bytes-hash fallback, 'b' prefix
        }
        const storageKey = storageKeyFor(conceptId, c.id, c.lang, hash);
        const r = await uploadClip(storageKey, mp3);
        r === 'uploaded' ? up++ : dedup++;
        c.storage_key = storageKey;
        if (!c.text_hash && !hash.startsWith('b')) c.text_hash = hash;
    }

    mkdirSync(MANIFEST_DIR, { recursive: true });
    const tracked = join(MANIFEST_DIR, `${conceptId}.json`);
    // Live review-site/ manifests win over archive ones for the same concept id.
    if (!existsSync(tracked) || dir.endsWith('review-site')) {
        writeFileSync(tracked, JSON.stringify(manifest, null, 2), 'utf-8');
    }
    console.log(`   ${conceptId}: ↑${up} =${dedup} skip${skip}`);
    return { up, dedup, skip };
}

async function main(): Promise<void> {
    let totals = { up: 0, dedup: 0, skip: 0 };
    for (const dir of SOURCES) {
        if (!existsSync(dir)) continue;
        console.log(`\n📦 ${dir}`);
        for (const conceptId of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
            if (!existsSync(join(dir, conceptId, 'audio_manifest.json'))) continue;
            const r = await migrateConcept(dir, conceptId);
            totals = { up: totals.up + r.up, dedup: totals.dedup + r.dedup, skip: totals.skip + r.skip };
        }
    }
    console.log(`\n✅ migration: ${totals.up} uploaded, ${totals.dedup} deduped, ${totals.skip} skipped`);
}

main().catch((err) => {
    console.error('💥 migration failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
```

Note the ordering subtlety: `SOURCES` lists `review-site` FIRST so its manifests land first, and the `dir.endsWith('review-site')` guard lets live manifests overwrite archive ones — an archived concept that was later re-voiced keeps its NEWEST manifest.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Dry-run on one concept first** — temporarily run with `SOURCES` narrowed? No — instead verify the smallest real slice: the script is idempotent, so just run it DETACHED (Global Constraints) and watch the log:

```powershell
# launcher .cmd in the scratchpad, same pattern as run_tts_gsolid.cmd:
#   call npx tsx --env-file=.env.local src/scripts/_migrate_audio_to_storage.ts > <scratchpad>\migrate_audio.log 2>&1
#   echo DONE_EXIT_%ERRORLEVEL%>> <scratchpad>\migrate_audio.log
Start-Process -FilePath "cmd.exe" -ArgumentList '/c','<scratchpad>\run_migrate_audio.cmd' -WindowStyle Hidden
```
Expected in log: per-concept `↑N =M skipK` lines; final `✅ migration: … uploaded …`; `DONE_EXIT_0`. Concepts this session already backfilled (e.g. `gauss_law_solid_sphere` via Task 2 Step 7) show `=56` (all deduped) — the idempotency proof in production data.

- [ ] **Step 4: Verify totals live**

`SELECT split_part(name,'/',1) AS concept, count(*) FROM storage.objects WHERE bucket_id='tts-audio' GROUP BY 1 ORDER BY 1;`
Expected: one row per voiced concept; totals ≈ local mp3 counts. Also `ls src/data/audio_manifests/*.json` count = number of voiced concepts.

- [ ] **Step 5: Commit manifests, then delete the temp script**

```bash
git add src/data/audio_manifests/
git commit -m "feat(tts): migrate all existing clips to Storage; commit tracked audio manifests"
git rm src/scripts/_migrate_audio_to_storage.ts
git commit -m "chore(tts): drop one-shot audio migration script (migration complete)"
```

(If the script was never committed, plain `Remove-Item` instead of `git rm`.)

---

### Task 6: Docs + guardrails

**Files:**
- Modify: `.gitignore` (comment block around line 93)
- Modify: `docs/AUTHORING_PIPELINE.md` (the tts/ship stage section)
- Create: PROGRESS.md session entry (top of file, standard format)
- Create: a CLAUDE.md **suggestion** in the PROGRESS entry (never edit CLAUDE.md directly — founder-gated)

**Interfaces:** none (docs only).

- [ ] **Step 1: `.gitignore` comment** — replace the line-93 comment block:

```gitignore
# Static review-site build artifact (build:review) — not tracked.
# TTS audio bytes live in Supabase Storage (bucket tts-audio, dev project);
# the git-tracked manifests are src/data/audio_manifests/<id>.json.
# Fresh clone: npm run tts:pull -- --all   (exact approved bytes, $0)
review-site/
```

- [ ] **Step 2: `docs/AUTHORING_PIPELINE.md`** — in the ship/tts stage, add one paragraph:

```markdown
**Audio durability (2026-07):** `tts:generate` uploads every clip to Supabase
Storage (`tts-audio` bucket, dev project) as it voices, content-addressed by
sentence `text_hash`; the git-tracked manifest is `src/data/audio_manifests/
<id>.json`. Any machine re-hydrates with `npm run tts:pull -- <id>` (or
`--all`) — never re-voice just to fill a local gap. `review-site/` remains a
disposable build artifact.
```

- [ ] **Step 3: PROGRESS.md entry** — standard session block at top: what shipped (bucket, upload-on-voice, tts:pull, migration totals, manifests tracked), verification evidence, and this CLAUDE.md §6 suggestion for the founder:

> Suggested CLAUDE.md §6 addition (founder call): under Commands add `npm run tts:pull -- <id> | --all  # re-hydrate approved audio from Storage ($0)`, and note `tts-audio` bucket + `src/data/audio_manifests/` as the audio system of record.

- [ ] **Step 4: Commit**

```bash
git add .gitignore docs/AUTHORING_PIPELINE.md PROGRESS.md
git commit -m "docs(tts): audio-in-Storage workflow (tts:pull, tracked manifests, gitignore note)"
```

---

## Cost & Capacity (decision record)

| Item | Number |
|---|---|
| Measured clip footprint | 3.2 MB / concept (56 clips EN+TE) |
| Today (~50 voiced concepts incl. archive) | ~160–200 MB storage |
| Full catalog (~300 concepts) | ~1 GB storage, one version; content-addressing means re-voices ADD only changed clips |
| Supabase Free tier | 1 GB storage / 5 GB egress — fits today; tight at full catalog |
| Supabase Pro ($25/mo) | 100 GB storage / 250 GB egress — the ceiling disappears; likely wanted for the pilot project anyway |
| Egress profile | Build-time pulls on dev machines only (pilot serves static Netlify files) — a few GB/month worst case |
| vs Git LFS | LFS = ~$5/50 GB-mo metered + still bloats on re-voice + no CDN; strictly worse here |
| vs mp3s in plain git | history ratchets 5–20 GB over a year of re-voicing; GitHub hard limits; rejected |

**Trigger to upgrade to Pro:** `SELECT pg_size_pretty(sum(metadata->>'size')::bigint) FROM storage.objects WHERE bucket_id='tts-audio';` approaching ~800 MB.

## Explicit non-goals (YAGNI)

- No runtime audio streaming from Storage in any player (pilot stays static).
- No CDN/custom-domain config (Supabase public URLs unused today; pull-to-disk only).
- No deletion/pruning of superseded Storage objects (cheap; revisit at Pro-tier scale).
- No change to WHEN voicing happens (Rule 30f release chain untouched).
- No test framework.

## Execution notes for the implementer

- Read root `CLAUDE.md` + `.gitignore` before starting; this repo has session-critical conventions (detached long-runs, founder-gated files, shared working tree — commit path-scoped only).
- Tasks 1→5 are strictly ordered; Task 6 can interleave after Task 4.
- Total new Sarvam spend across the entire plan: **$0** (everything reuses existing bytes).
