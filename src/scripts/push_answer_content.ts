/**
 * push_answer_content — upload the per-unit answer bundles to ab_content (P3).
 *
 * The bundles are written by `npm run build:answers:gated` into
 * answer-book/content/<unit_key>.json — the FULL browser projection (typeset,
 * recall-stripped), byte-what the full build embeds. This script only carries
 * them to the table the answerbook-content endpoint serves from.
 *
 * Run: npm run content:push   (= tsx --env-file=.env.local, dev project keys)
 *
 * VIA CURL, NOT supabase-js: node's fetch to Supabase REST is flaky on this
 * machine for large bodies (recorded scar — a 550 KB jsonb upsert died in a
 * stream TransformError on its first row). The working pattern: write the row
 * to a temp file, POST it with curl -H "Expect:" and retry until 2xx.
 *
 * Fails loudly on drift: every unit in units.json must have a bundle file, and
 * no orphan bundle may upload — a stale file for a renamed unit would serve
 * dead content forever.
 */
import { readFileSync, readdirSync, existsSync, writeFileSync, rmSync, mkdtempSync } from 'fs';
import { execFileSync } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';

const ROOT = process.cwd();
// --stream=<name> must match the build that wrote the bundles (2026-08-27).
// Bundles are scoped per stream, and so is the drift check below: an MPC push
// is complete when every MPC unit has a bundle, and Botany's absence is the
// point, not an error.
const streamArg = process.argv.find((a) => a.startsWith('--stream='));
const STREAM = streamArg ? streamArg.slice('--stream='.length) : null;
const STREAM_SUBJECTS: Record<string, string[]> = {
    mpc: ['physics', 'chemistry', 'mathematics', 'mathematics_1b'],
    // Senior Inter, 2026-08-28. Kept in step with STREAMS in build_answer_book.ts
    // BY HAND: the bundles this pushes are written by that build, so a stream
    // listed in one and not the other either pushes nothing or pushes content
    // the artifact does not serve.
    mpc_2: ['physics_2', 'chemistry_2', 'mathematics_2a'],
};
// `--stream` takes a COMMA-SEPARATED list, matching build_answer_book.ts since
// 2026-08-29: one artifact can carry both years, so its bundles live in one
// directory named for the joined key and must all be pushed together.
const STREAM_KEYS = STREAM ? STREAM.split(',').map((x) => x.trim()).filter(Boolean) : [];
for (const key of STREAM_KEYS) {
    if (!STREAM_SUBJECTS[key]) {
        console.error(`✗ --stream="${key}" is not one of ${Object.keys(STREAM_SUBJECTS).join('/')}`);
        process.exit(1);
    }
}
const WANT_SUBJECTS = STREAM_KEYS.length
    ? new Set(STREAM_KEYS.flatMap((k) => STREAM_SUBJECTS[k]))
    : null;
const CONTENT_DIR = STREAM
    ? join(ROOT, 'answer-book', 'content', STREAM_KEYS.join('+'))
    : join(ROOT, 'answer-book', 'content');
const MANIFEST = join(ROOT, 'answer-book', 'units.json');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
    console.error('✗ NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required (.env.local)');
    process.exit(1);
}
if (!existsSync(CONTENT_DIR)) {
    console.error(`✗ ${CONTENT_DIR} missing — run npm run build:answers:gated${STREAM ? `:${STREAM}` : ''} first`);
    process.exit(1);
}

type ManifestUnit = { number: number; name: string; subject?: string; questions: unknown[] };
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as { units: ManifestUnit[] };
const expected = new Set(
    manifest.units
        .filter((u) => !WANT_SUBJECTS || WANT_SUBJECTS.has(u.subject || 'physics'))
        .map((u) => `${u.subject || 'physics'}-${u.number}`)
);
if (!expected.size) {
    console.error(`✗ --stream="${STREAM}" matched no units in units.json`);
    process.exit(1);
}

const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json'));
const onDisk = new Set(files.map((f) => f.replace(/\.json$/, '')));

for (const k of expected) {
    if (!onDisk.has(k)) { console.error(`✗ no bundle file for unit "${k}" — rebuild with build:answers:gated`); process.exit(1); }
}
for (const k of onDisk) {
    if (!expected.has(k)) { console.error(`✗ orphan bundle "${k}.json" matches no unit in units.json — delete it (stale rename?)`); process.exit(1); }
}

const endpoint = `${url}/rest/v1/ab_content?on_conflict=unit_key`;
const tmp = mkdtempSync(join(tmpdir(), 'ab-content-'));

/** POST one row file via curl; retry until 2xx (transient TLS/stream flakes). */
function pushRow(file: string, label: string): void {
    for (let attempt = 1; attempt <= 5; attempt++) {
        try {
            const code = execFileSync('curl', [
                '-s', '-o', join(tmp, 'resp.txt'), '-w', '%{http_code}',
                '-X', 'POST', endpoint,
                '-H', `apikey: ${key}`,
                '-H', `Authorization: Bearer ${key}`,
                '-H', 'Content-Type: application/json',
                '-H', 'Prefer: resolution=merge-duplicates',
                '-H', 'Expect:',
                '--data-binary', `@${file}`,
            ], { encoding: 'utf8' }).trim();
            if (code.startsWith('2')) return;
            console.error(`  … ${label}: HTTP ${code} (attempt ${attempt}/5) ${readFileSync(join(tmp, 'resp.txt'), 'utf8').slice(0, 200)}`);
        } catch (e) {
            console.error(`  … ${label}: curl failed (attempt ${attempt}/5) ${(e as Error).message.slice(0, 120)}`);
        }
    }
    console.error(`✗ ${label}: could not upload after 5 attempts`);
    rmSync(tmp, { recursive: true, force: true });
    process.exit(1);
}

let totalQ = 0, totalB = 0;
for (const f of files.sort()) {
    const text = readFileSync(join(CONTENT_DIR, f), 'utf8');
    const bundle = JSON.parse(text) as { unit_key: string; name: string; questions: unknown[] };
    const row = {
        unit_key: bundle.unit_key,
        name: bundle.name,
        bundle,
        question_n: bundle.questions.length,
        updated_at: new Date().toISOString(),
    };
    const rowFile = join(tmp, 'row.json');
    writeFileSync(rowFile, JSON.stringify(row), 'utf8');
    pushRow(rowFile, bundle.unit_key);
    totalQ += bundle.questions.length;
    totalB += text.length;
    console.log(`  ✓ ${bundle.unit_key}  ${String(bundle.questions.length).padStart(3)} questions  ${(text.length / 1024).toFixed(0)} KB`);
}
rmSync(tmp, { recursive: true, force: true });
console.log(`✓ content:push — ${files.length} units, ${totalQ} questions, ${(totalB / 1024).toFixed(0)} KB`);
if (totalQ === 0) { console.error('✗ zero questions uploaded — refusing to call that success'); process.exit(1); }

// ── which chapters are FREE, after the push ──────────────────────────────────
// The `free` flag lives on the ab_content ROW, keyed by unit_key, and an upsert
// leaves it alone. That is right until a unit_key changes meaning: the 2026-27
// physics renumbering (2026-08-28) moved every physics chapter down one key, so
// a row flagged free as "physics-4 Motion in a Plane" is, after this push,
// "physics-4 Laws of Motion" — still flagged free. Nothing in the push can
// know which chapter the founder MEANT to be free, so it prints the free rows
// by NAME and leaves the UPDATE to a human:
//   UPDATE ab_content SET free = (unit_key IN ('physics-3','chemistry-3','mathematics-4','mathematics_1b-3'));
try {
    const listed = execFileSync('curl', [
        '-s', `${url}/rest/v1/ab_content?select=unit_key,name,question_n&free=is.true&order=unit_key`,
        '-H', `apikey: ${key}`, '-H', `Authorization: Bearer ${key}`, '-H', 'Expect:',
    ], { encoding: 'utf8' });
    const rows = JSON.parse(listed) as { unit_key: string; name: string; question_n: number }[];
    console.log(`  free chapters now (ab_content.free): ${rows.length ? '' : 'NONE'}`);
    for (const r of rows) console.log(`    ${r.unit_key.padEnd(18)} ${r.name} (${r.question_n})`);
    console.log('  → if a free row names the wrong chapter (a renumbered unit_key), fix it with one UPDATE — see the comment above this report.');
} catch (e) {
    console.error(`  (could not list free rows: ${(e as Error).message.slice(0, 120)})`);
}
