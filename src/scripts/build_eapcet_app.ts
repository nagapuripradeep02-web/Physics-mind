/**
 * build_eapcet_app.ts — the EAPCET finder, one self-contained index.html.
 *
 * Shaped like build_answer_book.ts: shell.html + app.css + eapcet.css + the
 * js/ modules in file-name order + a data block, inlined into one file that
 * works from file:// (the founder's phone, the e2e suite).
 *
 * What the build refuses, because a student would otherwise meet it:
 *   - a release file the schema rejects (a solution whose option is not the
 *     key, a chapter open under EAPCET_OPEN_AT, a sibling outside the pool);
 *   - an idiom in the string table (Rule 41, the Answer Book's own scan);
 *   - a solution byte in index.html — solutions never enter the artifact, an
 *     entitled device fetches its chapter from ep-state into memory;
 *   - --dev-open together with --hosted: the dogfood switch that shows
 *     unverified questions never ships.
 *
 *   npx tsx src/scripts/build_eapcet_app.ts [--hosted] [--dev-open] [--pool=<path>]
 *
 * The default build bakes NO endpoint base: every network module is inert and
 * the page makes zero requests. --hosted bakes the EP_* bases from the
 * environment and fails if one is missing.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, resolve, sep } from 'path';
import { EAPCET_OPEN_AT, EapcetPoolReleaseSchema, type EapcetPoolRelease } from '../schemas/eapcetPool';
import { idiomsIn } from '../lib/answerBook/vidiChecks';

const ROOT = process.cwd();
const APP = join(ROOT, 'eapcet-app');
const OUT = join(APP, 'dist');
const args = process.argv.slice(2);
const HOSTED = args.includes('--hosted');
const DEV_OPEN = args.includes('--dev-open');
const poolArg = args.find((a) => a.startsWith('--pool='));
const POOL = poolArg ? resolve(poolArg.slice('--pool='.length)) : join(ROOT, 'eapcet', 'pool', 'physics_pool_v1.release.json');
// --out= exists for the e2e suite, which builds a fixture release beside dist/.
const outArg = args.find((a) => a.startsWith('--out='));
const OUT_DIR = outArg ? resolve(outArg.slice('--out='.length)) : OUT;

function fail(msg: string): never {
    console.error('\nbuild:eapcet FAILED\n' + msg + '\n');
    process.exit(1);
}
function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

if (HOSTED && DEV_OPEN) fail('--dev-open shows unverified questions; it is a dogfood switch and never ships with --hosted');
if (!existsSync(POOL)) fail(`no release file at ${POOL}\n  build it with scripts/eapcet/build_release.py, or pass --pool=<path>`);

// ── 1. the release, validated ───────────────────────────────────────────────
const raw = JSON.parse(readFileSync(POOL, 'utf8'));
const parsed = EapcetPoolReleaseSchema.safeParse(raw);
if (!parsed.success) {
    fail('the release file fails its schema:\n  ' + parsed.error.issues.slice(0, 20).map((i) => `${i.path.join('.')}: ${i.message}`).join('\n  '));
}
const release: EapcetPoolRelease = parsed.data;

// Every reader-facing string from every solution — the leak assertion below
// looks for each of them in the finished HTML.
const solutionStrings: string[] = [];
const publicQuestions: Record<string, unknown> = {};
for (const [id, q] of Object.entries(release.questions)) {
    const { solution, verified, ...pub } = q;
    if (solution) {
        solutionStrings.push(solution.approach);
        for (const s of solution.steps) {
            solutionStrings.push(s.text);
            if (s.equation) solutionStrings.push(s.equation);
            if (s.why_this_step) solutionStrings.push(s.why_this_step);
        }
        for (const m of solution.common_mistakes) solutionStrings.push(m.text);
    }
    publicQuestions[id] = { ...pub, verified: !!verified };
}
const publicPool = {
    schema: release.schema,
    built_from: release.built_from,
    exam: release.exam,
    chapters: release.chapters,
    questions: publicQuestions,
    siblings: release.siblings,
};

// ── 2. the engine files ─────────────────────────────────────────────────────
const shell = readFileSync(join(APP, 'shell.html'), 'utf8');
for (const token of ['/*__CSS__*/', '/*__JS__*/', '/*__DATA__*/', '<!--__BUILT_AT__-->', '<!--__HEAD_META__-->']) {
    if (!shell.includes(token)) fail(`shell.html is missing the token ${token}`);
}
const css = readFileSync(join(APP, 'app.css'), 'utf8') + '\n' + readFileSync(join(APP, 'eapcet.css'), 'utf8');
const jsFiles = readdirSync(join(APP, 'js')).filter((f) => /^\d\d_[a-z_]+\.js$/.test(f)).sort();
if (!jsFiles.length) fail('eapcet-app/js holds no NN_name.js modules');
const js = jsFiles.map((f) => `/* ── ${f} ── */\n` + readFileSync(join(APP, 'js', f), 'utf8')).join('\n;\n');

// Rule 41 over the string table, with the Answer Book's own list.
const strings = readFileSync(join(APP, 'js', '05_strings.js'), 'utf8');
const idioms = idiomsIn(strings);
if (idioms.length) fail(`05_strings.js carries idioms: ${idioms.join(', ')}`);

// ── 3. the bases ────────────────────────────────────────────────────────────
function envOrFail(name: string): string {
    const v = (process.env[name] || '').trim();
    if (!v) fail(`--hosted needs ${name} in the environment`);
    return v;
}
const bases = HOSTED
    ? {
        EP_CHAT_BASE: envOrFail('EP_CHAT_BASE'),
        EP_STATE_BASE: envOrFail('EP_STATE_BASE'),
        EP_PAY_BASE: (process.env.EP_PAY_BASE || '').trim(),
        EP_AUTH_BASE: (process.env.EP_AUTH_BASE || '').trim(),
        EP_AUTH_ANON: (process.env.EP_AUTH_ANON || '').trim(),
        EP_STAFF_WORD: (process.env.EP_STAFF_WORD || '').trim(),
    }
    : { EP_CHAT_BASE: '', EP_STATE_BASE: '', EP_PAY_BASE: '', EP_AUTH_BASE: '', EP_AUTH_ANON: '', EP_STAFF_WORD: '' };

const builtAt = new Date().toISOString();
const openChapters = release.chapters.filter((c) => c.open);
const verifiedCount = Object.values(release.questions).filter((q) => q.solution).length;

// </script> inside any string can never break out of the data block.
const j = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c');
const dataJs =
    `window.EP_POOL = ${j(publicPool)};\n` +
    Object.entries(bases).map(([k, v]) => `window.${k} = ${j(v)};`).join('\n') + '\n' +
    `window.EP_DEV_OPEN = ${DEV_OPEN};\n` +
    `window.EP_BUILD = ${j({ at: builtAt, hosted: HOSTED, open: openChapters.length, verified: verifiedCount, open_at: EAPCET_OPEN_AT })};\n`;

const metaTitle = 'EAPCET Physics | Viditra';
const metaDesc = 'Ten real TG EAPCET physics questions per chapter, the official key, and the kind of mistake you make.';
const headMeta = [
    `<title>${esc(metaTitle)}</title>`,
    `<meta name="description" content="${esc(metaDesc)}">`,
    `<meta name="theme-color" content="#CB6843">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Viditra">`,
    `<meta property="og:title" content="${esc(metaTitle)}">`,
    `<meta property="og:description" content="${esc(metaDesc)}">`,
].join('\n');

const html = shell
    .replace('/*__CSS__*/', () => css)
    .replace('/*__DATA__*/', () => dataJs)
    .replace('/*__JS__*/', () => js)
    .replace('<!--__BUILT_AT__-->', () => `<!-- built ${builtAt}${HOSTED ? ' hosted' : ''}${DEV_OPEN ? ' DEV-OPEN' : ''} -->`)
    .replace('<!--__HEAD_META__-->', () => headMeta);

// ── 4. the leak assertion ───────────────────────────────────────────────────
for (const s of solutionStrings) {
    if (s.length >= 12 && html.includes(s)) fail(`a solution string reached index.html: "${s.slice(0, 60)}"`);
}
if (html.includes('"approach"') || html.includes('"why_this_step"')) fail('a solution field name reached index.html');

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'index.html'), html);
const outRel = join(OUT_DIR, 'index.html').slice(ROOT.length + 1).split(sep).join('/');
console.log(`build:eapcet -> ${outRel} (${(html.length / 1024).toFixed(0)} KB)${HOSTED ? ' hosted' : ''}${DEV_OPEN ? ' DEV-OPEN' : ''}`);
console.log(`  pool ${POOL}`);
console.log(`  chapters ${release.chapters.length}, open ${openChapters.length}, verified ${verifiedCount}, modules ${jsFiles.join(' ')}`);
if (DEV_OPEN) console.log('  DEV-OPEN: chapters run on unverified pool questions; never give this build to a student');
