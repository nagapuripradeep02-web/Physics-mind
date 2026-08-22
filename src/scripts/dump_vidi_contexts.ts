/**
 * dump_vidi_contexts.ts — capture the REAL ANSWER FACTS string for every question
 * and every cut, straight out of the built page.
 *
 *   npm run build:answers && npm run vidi:contexts
 *
 * Why this exists. The shakedown used to re-implement buildVidiContext() in
 * TypeScript, and the copy had drifted from the shipped builder on seven axes —
 * cut-projected steps, per-cut mark_split, cut-aware stars, the other-cuts skip,
 * the cut's own question_text, section/marks/time, and the cut_key it reported.
 * So the harness was probing the model with grounding text no student ever sees,
 * and every "P16 passed" was evidence about a context that does not exist. The
 * page owns the builder; this script reads it through the read-only PM_ANSWER
 * seam and writes a dump the harness consumes. Offline, deterministic, $0.
 *
 * Output: .answerbook_logs/vidi_contexts.json  (gitignored)
 */
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

type Row = {
    question_id: string;
    cut_key: string;
    qtype: string;
    marks_total: number;
    stars: number;
    context: string;
    chars: number;
};

const DIST = join(process.cwd(), 'answer-book', 'dist', 'index.html');
const OUT_DIR = join(process.cwd(), '.answerbook_logs');
const OUT = join(OUT_DIR, 'vidi_contexts.json');

// The server slices ANSWER FACTS at 10,000 chars, silently. Anything past this
// warn line is one authoring pass away from losing its tail steps.
const SLICE = 10_000;
const WARN_AT = 9_000;

async function main() {
    if (!existsSync(DIST)) {
        console.error('✗ answer-book/dist/index.html missing — run npm run build:answers first');
        process.exit(1);
    }

    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('file:///' + DIST.replace(/\\/g, '/'));
    // Everything boots behind the web-font gate; the seam is the readiness signal.
    await page.waitForFunction(() => !!(window as never as { PM_ANSWER?: unknown }).PM_ANSWER);

    const ids: string[] = await page.evaluate(() => (window as never as {
        PM_ANSWER: { questionIds: string[] };
    }).PM_ANSWER.questionIds);

    const rows: Row[] = [];
    for (const id of ids) {
        // Open once to learn which cuts this question offers, then walk them all.
        const cutKeys: string[] = await page.evaluate((qid) => {
            const A = (window as never as {
                PM_ANSWER: {
                    openQuestion(id: string, cut?: string): boolean;
                    listCuts(): { key: string }[];
                };
            }).PM_ANSWER;
            A.openQuestion(qid);
            return A.listCuts().map((c) => c.key);
        }, id);

        for (const key of cutKeys) {
            const row = await page.evaluate(
                ({ qid, cut }) => {
                    const A = (window as never as {
                        PM_ANSWER: {
                            openQuestion(id: string, cut?: string): boolean;
                            vidiContext(): string;
                            getState(): { marksTotal: number; cutKey: string };
                            question: { qtype: string; question_id: string };
                        };
                    }).PM_ANSWER;
                    A.openQuestion(qid, cut);
                    const st = A.getState();
                    const ctx = A.vidiContext();
                    // STARS comes off the manifest inside the builder; read it back
                    // out of the string rather than duplicating the lookup here.
                    const m = /^STARS: (\d)/m.exec(ctx);
                    return {
                        question_id: qid,
                        cut_key: st.cutKey,
                        qtype: A.question.qtype,
                        marks_total: st.marksTotal,
                        stars: m ? Number(m[1]) : 0,
                        context: ctx,
                        chars: ctx.length,
                    };
                },
                { qid: id, cut: key },
            );
            rows.push(row);
        }
    }

    await browser.close();

    if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(OUT, JSON.stringify(rows, null, 2), 'utf8');

    const chars = rows.map((r) => r.chars).sort((a, b) => b - a);
    const mean = Math.round(chars.reduce((s, n) => s + n, 0) / chars.length);
    const over = rows.filter((r) => r.chars > WARN_AT);
    const sliced = rows.filter((r) => r.chars > SLICE);

    console.log(`\n  ${rows.length} contexts from ${ids.length} questions → ${OUT}`);
    console.log(`  chars: max ${chars[0]} · mean ${mean} · min ${chars[chars.length - 1]}`);
    console.log('  widest:');
    for (const r of rows.slice().sort((a, b) => b.chars - a.chars).slice(0, 5)) {
        console.log(`    ${String(r.chars).padStart(5)}  ${r.qtype.padEnd(4)} ${r.cut_key.padEnd(12)} ${r.question_id}`);
    }
    if (sliced.length) {
        console.error(`\n  ✗ ${sliced.length} context(s) EXCEED the ${SLICE}-char server slice — their tail steps are being dropped:`);
        for (const r of sliced) console.error(`      ${r.chars}  ${r.question_id} (${r.cut_key})`);
        process.exit(1);
    }
    if (over.length) {
        console.warn(`\n  ⚠ ${over.length} context(s) past ${WARN_AT} chars — one authoring pass from the ${SLICE} slice.`);
        for (const r of over) console.warn(`      ${r.chars}  ${r.question_id} (${r.cut_key})`);
    } else {
        console.log(`  ✓ every context clears the ${SLICE}-char slice (widest uses ${Math.round((100 * chars[0]) / SLICE)}%).`);
    }
}

main().catch((e) => { console.error(e); process.exit(1); });
