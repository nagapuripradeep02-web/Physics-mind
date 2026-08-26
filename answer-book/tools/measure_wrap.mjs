/**
 * measure_wrap.mjs — the line-wrap measurer the e2e suite does not have.
 *
 *   node answer-book/tools/measure_wrap.mjs <id_prefix>
 *   node answer-book/tools/measure_wrap.mjs ts_ipe_z1
 *
 * One authored line must equal ONE ruled row (docs/patterns/answer_book.md).
 * The e2e wrap gate measures a single question; this renders EVERY line of
 * every question under the prefix in the real font (Kalam 26px, the notebook's
 * size) at the real page width and reports the lines that wrap. Budgets:
 * `boxed` 535px · `eq`/`indent` 624-56 = 568px · everything else 624px.
 * KaTeX lines are typeset, not typed — skipped.
 *
 * Shipped wrap rates: physics 0.1% · chemistry 4.1% · botany 1.3%. Reflow an
 * outlier at word boundaries (no words changed); never split a `boxed` line.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const require = createRequire(join(ROOT, 'package.json'));
const { chromium } = require('playwright');

const prefix = process.argv[2];
if (!prefix) { console.error('usage: node answer-book/tools/measure_wrap.mjs <id_prefix>'); process.exit(2); }

const QDIR = join(ROOT, 'answer-book', 'questions');
const rows = [];
for (const f of readdirSync(QDIR).filter((x) => x.startsWith(prefix) && x.endsWith('.json')).sort()) {
    const q = JSON.parse(readFileSync(join(QDIR, f), 'utf8'));
    const push = (sid, raw, where) => {
        const spec = typeof raw === 'string' ? { text: raw, style: 'normal' } : raw;
        if (spec.render === 'katex') return;
        rows.push({ qid: q.question_id, sid, where, style: spec.style || 'normal', text: spec.text });
    };
    for (const s of q.answer.steps) {
        const dflt = s.kind === 'equation' ? 'eq' : 'normal';
        for (const raw of s.lines || []) {
            const spec = typeof raw === 'string' ? { text: raw, style: dflt } : { style: dflt, ...raw };
            push(s.id, spec, 'steps');
        }
    }
    for (const c of q.cuts || []) {
        // cut.steps is a Record keyed by step id, not an array (physics has 5
        // cards with cuts; zoology has none, which is why this never fired).
        const kindOf = new Map(q.answer.steps.map((s) => [s.id, s.kind]));
        for (const [sid, s] of Object.entries(c.steps || {})) {
            const dflt = kindOf.get(sid) === 'equation' ? 'eq' : 'normal';
            for (const raw of s.lines || []) {
                const spec = typeof raw === 'string' ? { text: raw, style: dflt } : { style: dflt, ...raw };
                push(sid, spec, 'cut:' + c.key);
            }
        }
    }
}
if (!rows.length) { console.log('no lines under', prefix); process.exit(0); }

const outDir = join(HERE, 'out');
mkdirSync(outDir, { recursive: true });
const harness = join(outDir, 'wrap_harness.html');
writeFileSync(harness, `<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap" rel="stylesheet">
<style>span.m{font-family:Kalam,cursive;font-size:26px;white-space:pre;display:inline-block}</style><div id="h"></div>`);

const b = await chromium.launch();
const p = await b.newPage();
await p.goto('file:///' + harness.replace(/\\/g, '/'));
await p.waitForTimeout(2500);   // let Kalam load — measuring in fallback cursive is meaningless
const widths = await p.evaluate((rows) => {
    const h = document.getElementById('h');
    return rows.map((x) => {
        const s = document.createElement('span'); s.className = 'm'; s.textContent = x.text;
        h.appendChild(s); const w = Math.ceil(s.getBoundingClientRect().width); h.innerHTML = ''; return w;
    });
}, rows);
await b.close();

const budget = (style) => (style === 'boxed' ? 535 : (style === 'eq' || style === 'indent') ? 568 : 624);
const res = rows.map((r, i) => ({ ...r, w: widths[i], avail: budget(r.style) }));
const over = res.filter((r) => r.w > r.avail);
const byQ = {};
for (const r of over) byQ[r.qid] = (byQ[r.qid] || 0) + 1;

console.log(`lines measured: ${res.length} · wrapping: ${over.length} (${((100 * over.length) / res.length).toFixed(1)}%)`);
for (const r of over) {
    console.log(`  ! ${r.qid} ${r.sid} [${r.style}${r.where === 'steps' ? '' : ' ' + r.where}] w=${r.w}/${r.avail} over=${r.w - r.avail} | ${r.text}`);
}
writeFileSync(join(outDir, `wrap_${prefix.replace('ts_ipe_', '')}.json`), JSON.stringify(over, null, 1));
if (Object.keys(byQ).length) {
    console.log('\nby question:');
    for (const [k, v] of Object.entries(byQ).sort((a, b) => b[1] - a[1])) console.log(`  ${v.toString().padStart(3)}  ${k}`);
}
