/**
 * reflow_lines.mjs — move over-wide lines back inside the ruled row, MECHANICALLY.
 *
 *   node answer-book/tools/reflow_lines.mjs <id_prefix> [--write]
 *
 * One authored line must equal ONE ruled row. A line that measures wider than its budget
 * wraps onto a second row and every line below it walks off the ruled paper.
 *
 * This tool NEVER changes a word. It moves trailing WORDS from an over-wide line onto the
 * next line, and if the next line cannot take them (it is boxed, it is an equation, or it
 * starts a new numbered item) it inserts a fresh line instead. Boxed and equation lines
 * are never split — an author has to shorten those by hand.
 *
 * Budgets match measure_wrap.mjs: boxed 535 · eq/indent 568 · everything else 624.
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
const WRITE = process.argv.includes('--write');
if (!prefix) { console.error('usage: node answer-book/tools/reflow_lines.mjs <id_prefix> [--write]'); process.exit(2); }

const QDIR = join(ROOT, 'answer-book', 'questions');
const files = readdirSync(QDIR).filter((x) => x.startsWith(prefix) && x.endsWith('.json')).sort();
const docs = files.map((f) => ({ f, q: JSON.parse(readFileSync(join(QDIR, f), 'utf8')) }));

const outDir = join(HERE, 'out');
mkdirSync(outDir, { recursive: true });
const harness = join(outDir, 'reflow_harness.html');
writeFileSync(harness, `<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap" rel="stylesheet">
<style>span.m{font-family:Kalam,cursive;font-size:26px;white-space:pre;display:inline-block}</style><div id="h"></div>`);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file:///' + harness.replace(/\\/g, '/'));
await page.waitForTimeout(2500);   // let Kalam load — measuring in fallback cursive is meaningless
                                   // (the same wait measure_wrap.mjs uses; without it this tool
                                   //  silently under-reports and fixes a fraction of the lines)

// Serialise every step's lines, reflow in-page where the measurer lives, read them back.
const payload = docs.map(({ f, q }) => ({
    f,
    steps: q.answer.steps.map((s) => ({
        id: s.id,
        kind: s.kind,
        lines: (s.lines || []).map((raw) => (typeof raw === 'string' ? { text: raw, plain: true } : { ...raw })),
    })),
}));

const result = await page.evaluate((docs) => {
    const host = document.getElementById('h');
    const cache = new Map();
    const measure = (t) => {
        if (cache.has(t)) return cache.get(t);
        const sp = document.createElement('span');
        sp.className = 'm';
        sp.textContent = t;
        host.appendChild(sp);
        const w = Math.ceil(sp.getBoundingClientRect().width);
        host.removeChild(sp);
        cache.set(t, w);
        return w;
    };
    const budgetOf = (style) => (style === 'boxed' ? 535 : (style === 'eq' || style === 'indent') ? 568 : 624);
    // a line that OPENS a new item must not have another line's tail glued onto its front
    const opensItem = (t) => /^\s*(\(?[ivx]+\)|\(?[a-h]\)|\d+\.|[•‣-]|[A-Z][A-Z ,\-']{6,}:)/.test(t);

    let moved = 0, inserted = 0, unfixable = 0;
    for (const doc of docs) {
        for (const step of doc.steps) {
            const dflt = step.kind === 'equation' ? 'eq' : 'normal';
            for (let i = 0; i < step.lines.length; i++) {
                const L = step.lines[i];
                if (L.render === 'katex') continue;
                const style = L.style || dflt;
                const budget = budgetOf(style);
                if (measure(L.text) <= budget) continue;
                if (style === 'boxed' || style === 'eq') { unfixable++; continue; }
                const words = L.text.split(' ');
                const carry = [];
                while (words.length > 1 && measure(words.join(' ')) > budget) carry.unshift(words.pop());
                if (!carry.length) { unfixable++; continue; }
                L.text = words.join(' ');
                const carryText = carry.join(' ');
                const nxt = step.lines[i + 1];
                const nStyle = nxt && (nxt.style || dflt);
                if (nxt && nxt.render !== 'katex' && nStyle === style && nStyle !== 'boxed'
                    && nStyle !== 'eq' && !opensItem(nxt.text)) {
                    nxt.text = carryText + ' ' + nxt.text;
                    moved++;
                } else {
                    step.lines.splice(i + 1, 0, { text: carryText, ...(L.plain ? { plain: true } : {}), ...(L.style ? { style: L.style } : {}) });
                    inserted++;
                }
            }
        }
    }
    return { docs, moved, inserted, unfixable };
}, payload);

await browser.close();

let changedFiles = 0;
for (const [n, { f, q }] of docs.entries()) {
    const reflowed = result.docs[n];
    let touched = false;
    q.answer.steps.forEach((s, si) => {
        const rl = reflowed.steps[si].lines;
        const rebuilt = rl.map((L) => {
            const { plain, ...rest } = L;
            return plain && Object.keys(rest).length === 1 ? rest.text : rest;
        });
        if (JSON.stringify(rebuilt) !== JSON.stringify(s.lines || [])) { s.lines = rebuilt; touched = true; }
    });
    if (touched) {
        changedFiles++;
        if (WRITE) writeFileSync(join(QDIR, f), JSON.stringify(q, null, 2) + '\n', 'utf8');
    }
}
console.log(`reflow under "${prefix}": ${result.moved} tail(s) moved down · ${result.inserted} line(s) inserted · ${result.unfixable} left for the author (boxed or equation)`);
console.log(`${changedFiles} file(s)${WRITE ? ' written' : ' would change — pass --write'}`);
