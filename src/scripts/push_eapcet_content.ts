/**
 * push_eapcet_content — carry the RELEASE file's verified solutions to
 * ep_solutions, the table ep-state (bundle) and ep-vidi-chat (grounding) read.
 *
 * Only the release file writes here, and only its VERIFIED questions (gate
 * pass + blind audit ok/weak + not spot-failed — build_release.py decides).
 * Each row carries the question, the solution and the two grounded Answer
 * Book cards resolved to text, so every server read is one row.
 *
 * A solution that has LEFT the verified set (a later audit said wrong, a spot
 * check failed, the pool was rebuilt) is un-verified here on the same run:
 * a row the release no longer vouches for must not keep serving.
 *
 * Run: npm run content:push:eapcet -- --pool=<release.json>
 *      (= tsx --env-file=.env.local, dev project keys; the default pool path is
 *       eapcet/pool/physics_pool_v1.release.json under the cwd)
 *
 * VIA CURL, NOT supabase-js — the same recorded scar as push_answer_content.ts:
 * node's fetch to Supabase REST is flaky on this machine for large bodies.
 * Rows go up one CHAPTER per POST with -H "Expect:" and retry until 2xx.
 */
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { join, resolve } from 'path';
import { tmpdir } from 'os';
import { EapcetPoolReleaseSchema, type EapcetPoolRelease } from '../schemas/eapcetPool';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const poolArg = args.find((a) => a.startsWith('--pool='));
const POOL = poolArg ? resolve(poolArg.slice('--pool='.length)) : join(ROOT, 'eapcet', 'pool', 'physics_pool_v1.release.json');
const CARDS = join(ROOT, 'answer-book', 'questions');
const DRY = args.includes('--dry-run');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!DRY && (!url || !key)) {
    console.error('✗ NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required (.env.local)');
    process.exit(1);
}
if (!existsSync(POOL)) {
    console.error(`✗ no release file at ${POOL} — build it with scripts/eapcet/build_release.py, or pass --pool=<path>`);
    process.exit(1);
}

const parsed = EapcetPoolReleaseSchema.safeParse(JSON.parse(readFileSync(POOL, 'utf8')));
if (!parsed.success) {
    console.error('✗ the release file fails its schema:\n  ' +
        parsed.error.issues.slice(0, 20).map((i) => `${i.path.join('.')}: ${i.message}`).join('\n  '));
    process.exit(1);
}
const release: EapcetPoolRelease = parsed.data;
const chapterName = new Map(release.chapters.map((c) => [c.key, c.name]));

// ── the grounding cards, resolved to text ───────────────────────────────────
interface CardLine { text?: string; style?: string; render?: string }
interface Card {
    question_id: string;
    question_text?: string;
    answer?: { steps?: { label?: string; lines?: (string | CardLine)[]; why?: string }[] };
}

/** The card's answer as one plain paragraph per step. KaTeX lines are TeX
    source and would reach the model as backslashes — they are left out; the
    prose around them carries the idea. */
function cardText(card: Card): string {
    const parts: string[] = [];
    for (const s of card.answer?.steps ?? []) {
        const lines: string[] = [];
        for (const l of s.lines ?? []) {
            if (typeof l === 'string') lines.push(l);
            else if (l && typeof l.text === 'string' && l.render !== 'katex') lines.push(l.text);
        }
        const body = lines.join(' ').replace(/\s+/g, ' ').trim();
        if (!body) continue;
        parts.push((s.label ? s.label + ': ' : '') + body + (s.why ? ' Why: ' + s.why : ''));
    }
    return parts.join('\n').slice(0, 1200);
}

const cardCache = new Map<string, { question_id: string; title: string; text: string } | null>();
function groundingCard(qid: string) {
    if (cardCache.has(qid)) return cardCache.get(qid)!;
    const p = join(CARDS, qid + '.json');
    if (!existsSync(p)) { cardCache.set(qid, null); return null; }
    const card = JSON.parse(readFileSync(p, 'utf8')) as Card;
    const out = { question_id: qid, title: String(card.question_text ?? qid).slice(0, 300), text: cardText(card) };
    cardCache.set(qid, out.text ? out : null);
    return cardCache.get(qid)!;
}

// ── the rows ────────────────────────────────────────────────────────────────
type Row = {
    qid: string; chapter_key: string; question: Record<string, unknown>; solution: unknown;
    grounding: unknown[]; verified: boolean; updated_at: string;
};
const byChapter = new Map<string, Row[]>();
let missingCards = 0;
const now = new Date().toISOString();
for (const q of Object.values(release.questions)) {
    if (!q.solution || !q.verified) continue;
    const cards = (q.grounding?.answer_book_cards ?? []).map((c) => groundingCard(c.question_id)).filter(Boolean);
    if (cards.length < (q.grounding?.answer_book_cards ?? []).length) missingCards++;
    const row: Row = {
        qid: q.id,
        chapter_key: q.chapter_key,
        question: {
            asked_label: q.asked_label,
            chapter: chapterName.get(q.chapter_key) ?? q.chapter_key,
            question_en: q.question_en,
            options_en: q.options_en,
            answer: q.answer,
        },
        solution: q.solution,
        grounding: cards,
        verified: true,
        updated_at: now,
    };
    if (!byChapter.has(q.chapter_key)) byChapter.set(q.chapter_key, []);
    byChapter.get(q.chapter_key)!.push(row);
}
const verifiedIds = new Set([...byChapter.values()].flat().map((r) => r.qid));
console.log(`release ${POOL}\n  verified solutions ${verifiedIds.size} in ${byChapter.size} chapters` +
    (missingCards ? `\n  ${missingCards} questions ground on a card missing from answer-book/questions (pushed without it)` : ''));

if (DRY) {
    for (const [ck, rows] of [...byChapter.entries()].sort()) {
        console.log(`  ${ck}  ${String(rows.length).padStart(3)} rows  ${(JSON.stringify(rows).length / 1024).toFixed(0)} KB`);
    }
    process.exit(0);
}

// ── curl, one chapter per POST, retry until 2xx ─────────────────────────────
const tmp = mkdtempSync(join(tmpdir(), 'ep-content-'));
function curl(argv: string[], label: string): string {
    for (let attempt = 1; attempt <= 5; attempt++) {
        try {
            const code = execFileSync('curl', ['-s', '-o', join(tmp, 'resp.txt'), '-w', '%{http_code}', ...argv], { encoding: 'utf8' }).trim();
            if (code.startsWith('2')) return readFileSync(join(tmp, 'resp.txt'), 'utf8');
            console.error(`  … ${label}: HTTP ${code} (attempt ${attempt}/5) ${readFileSync(join(tmp, 'resp.txt'), 'utf8').slice(0, 200)}`);
        } catch (e) {
            console.error(`  … ${label}: curl failed (attempt ${attempt}/5) ${(e as Error).message.slice(0, 120)}`);
        }
    }
    console.error(`✗ ${label}: gave up after 5 attempts`);
    rmSync(tmp, { recursive: true, force: true });
    process.exit(1);
}
const auth = ['-H', `apikey: ${key}`, '-H', `Authorization: Bearer ${key}`, '-H', 'Content-Type: application/json', '-H', 'Expect:'];

for (const [ck, rows] of [...byChapter.entries()].sort()) {
    const file = join(tmp, `${ck}.json`);
    writeFileSync(file, JSON.stringify(rows), 'utf8');
    curl(['-X', 'POST', `${url}/rest/v1/ep_solutions?on_conflict=qid`, ...auth,
        '-H', 'Prefer: resolution=merge-duplicates,return=minimal', '--data-binary', `@${file}`], ck);
    console.log(`  ✓ ${ck}  ${String(rows.length).padStart(3)} rows  ${chapterName.get(ck) ?? ''}`);
}

// ── un-verify what the release no longer vouches for ────────────────────────
const live = JSON.parse(curl(['-X', 'GET', `${url}/rest/v1/ep_solutions?select=qid&verified=is.true&limit=5000`, ...auth], 'read live')) as { qid: string }[];
const stale = live.map((r) => r.qid).filter((q) => !verifiedIds.has(q));
if (stale.length) {
    const file = join(tmp, 'unverify.json');
    writeFileSync(file, JSON.stringify({ verified: false, updated_at: now }), 'utf8');
    const list = stale.map((q) => `"${q}"`).join(',');
    curl(['-X', 'PATCH', `${url}/rest/v1/ep_solutions?qid=in.(${list})`, ...auth, '-H', 'Prefer: return=minimal', '--data-binary', `@${file}`], 'unverify');
    console.log(`  ✓ un-verified ${stale.length} rows the release no longer carries: ${stale.slice(0, 5).join(', ')}${stale.length > 5 ? ' …' : ''}`);
}
rmSync(tmp, { recursive: true, force: true });
console.log(`done: ${verifiedIds.size} verified rows live, ${stale.length} un-verified`);
