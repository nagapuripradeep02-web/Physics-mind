/**
 * The reviewer's two prompts live twice each: as the readable sources in
 * src/prompts/eapcet_review_transcribe.txt / eapcet_review_judge.txt and
 * embedded in the Edge Function (which cannot read repo files at runtime).
 * This test fails when either pair drifts, checks the sentences the design
 * leans on are still in the text, and holds the function to the header
 * invariants: the body is capped before it is parsed, the lock comes before
 * the ledger and the key check, the image is never written, the reviewer
 * never solves, and an ERROR reply carries the student's own line.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const readSrc = readFileSync(join(root, 'src', 'prompts', 'eapcet_review_transcribe.txt'), 'utf8').replace(/\r\n/g, '\n');
const judgeSrc = readFileSync(join(root, 'src', 'prompts', 'eapcet_review_judge.txt'), 'utf8').replace(/\r\n/g, '\n');
const fn = readFileSync(join(root, 'supabase', 'functions', 'ep-review', 'index.ts'), 'utf8').replace(/\r\n/g, '\n');

function embedded(name: string): string {
    const m = fn.match(new RegExp('const ' + name + ' = `([\\s\\S]*?)`;\\n'));
    if (!m) throw new Error('ep-review/index.ts has no ' + name + ' template');
    return m[1];
}
const flat = (s: string) => s.replace(/\s+/g, ' ');

describe('ep-review prompts', () => {
    it('are the same text in the prompt files and the function', () => {
        expect(embedded('READ_PROMPT').trim()).toBe(readSrc.trim());
        expect(embedded('JUDGE_PROMPT').trim()).toBe(judgeSrc.trim());
    });
    it('contain no backtick and no template hole (they are embedded in a template literal)', () => {
        for (const s of [readSrc, judgeSrc]) {
            expect(s).not.toContain('`');
            expect(s).not.toContain('${');
        }
    });
    it('the reader transcribes, never corrects, never guesses, never computes', () => {
        for (const line of [
            'TRANSCRIBE WHAT IS WRITTEN. NEVER CORRECT IT.',
            '2 × 3 = 5',
            'BE FAIR TO HANDWRITING',
            'MARK, NEVER GUESS',
            '[?]',
            '0.4 or less',
            'NEVER compute a value, a total, an answer or a correction',
            'explicit *',
            'sqrt(...)',
            'sin(...) cos(...) tan(...) log(...) ln(...) exp(...) abs(...)',
            'deg(30)',
            'pi for π',
            'Copy the numbers exactly, including wrong ones',
            'equation (a line of mathematics), statement',
            'Copy it; never compute it, round it or correct',
            '0.9 to 1.0 clearly legible',
            '0.0 to 0.2 you are guessing',
        ]) expect(flat(readSrc), line).toContain(line);
        for (const ph of ['{{question_text}}', '{{options_block}}']) expect(readSrc).toContain(ph);
        // the reader never sees the reference
        expect(readSrc).not.toMatch(/\{\{(reference|steps)_block\}\}/);
    });
    it('the judge holds to the standard, quotes the line, and says UNSURE rather than guess', () => {
        const j = flat(judgeSrc);
        for (const line of [
            'A different valid method is CORRECT.',
            'The reference is a comparison aid, never the standard.',
            'Quote the student\'s own line, exactly as it appears in the transcript, in evidence_quote. If you cannot quote it, you cannot dispute it.',
            'Say UNSURE rather than guess.',
            'Name ONE line. "Line 3, or possibly 5" is not an answer; that is UNSURE.',
            'The machine facts above are checked by code; do not contradict an arithmetic fact, but a fact is not a verdict.',
            'Never reveal the rest of the reference; what_should_be is one line about the disputed step only.',
            'method - the student\'s method in one plain sentence, filled only on CORRECT',
        ]) expect(j, line).toContain(line);
        for (const ph of ['{{question_block}}', '{{reference_block}}', '{{transcript_block}}', '{{facts_block}}', '{{conventions_block}}', '{{typed_final}}', '{{page_block}}']) {
            expect(judgeSrc).toContain(ph);
        }
        // the facts sit ABOVE the sentence that calls them "above"
        expect(judgeSrc.indexOf('{{facts_block}}')).toBeLessThan(judgeSrc.indexOf('The machine facts above'));
    });
});

describe('ep-review function invariants', () => {
    it('is one self-contained file on the fleet conventions', () => {
        expect(fn).toContain("import 'jsr:@supabase/functions-js/edge-runtime.d.ts';");
        expect(fn).not.toContain('npm:');
        expect(fn).not.toContain('_shared/');
        expect(fn).toContain("const TASK_TYPE = 'eapcet_review'");
        expect(fn).toContain('EP_REVIEW_PER_DAY');
        expect(fn).toContain('EP_REVIEW_DAILY_USD_CAP');
        expect(fn).toContain('EP_PHOTO_MAX_BYTES');
    });
    it('caps the body before parsing; the lock comes before the ledger and the key check', () => {
        expect(fn).toContain('content-length');
        expect(fn.indexOf('content-length')).toBeLessThan(fn.indexOf('await req.json()'));
        expect(fn.indexOf('await entitled(')).toBeLessThan(fn.indexOf('await readTodayLedger()'));
        expect(fn.indexOf('await entitled(')).toBeLessThan(fn.indexOf('if (!DEEPSEEK_KEY'));
        // the open door bypasses the device and IP caps only; the spend cap has no `open` clause
        expect(fn).toMatch(/if \(!open && deviceDay >= PER_DAY\)/);
        expect(fn).toMatch(/if \(!open && ipMinute >= IP_PER_MIN\)/);
        expect(fn).toMatch(/if \(spentToday >= DAILY_USD_CAP\)/);
    });
    it('never writes the image: the ledger and the ep_reviews row carry byte counts only', () => {
        const ledgerBlock = fn.slice(fn.indexOf('await writeUsage({'), fn.indexOf('return deviceInternal;'));
        expect(ledgerBlock.length).toBeGreaterThan(200);
        expect(ledgerBlock).not.toMatch(/\bimage\b(?!_bytes)/);
        expect(ledgerBlock).toContain('image_bytes');
        const rowStart = fn.indexOf('const reviewRow = {');
        const rowBlock = fn.slice(rowStart, fn.indexOf('};', rowStart));
        expect(rowBlock.length).toBeGreaterThan(200);
        expect(rowBlock).not.toMatch(/\bimage\b/);
        expect(rowBlock).not.toContain('imageBytes');
    });
    it('never solves: no ASKS, no solve prompt; the inline reference is probe-only', () => {
        expect(fn).not.toContain('ASKS');
        expect(fn).not.toContain('Please solve');
        expect(fn.indexOf('body.reference')).toBeGreaterThan(fn.indexOf('const isProbe'));
        expect(fn).not.toContain('thinkingConfig');
    });
    it('a read is consumed only on ok:true, and the ok reply carries the evidence line and the method', () => {
        const okReply = fn.slice(fn.lastIndexOf('return reply(origin, 200, {'), fn.lastIndexOf('});'));
        expect(okReply).toContain('ok: true');
        for (const k of ['evidence_line', 'transcript', 'judges_ran', 'escalated', 'escalation_reason', 'ask', 'ask_line', 'method', 'attempt_no', 'review_id', 'reads_left', 'cost_usd']) {
            expect(okReply, k).toContain(k);
        }
        // every unconsumed ledger row is ledgerRow(false, …); the consuming one is the last
        const consumed = [...fn.matchAll(/ledgerRow\((true|false),/g)].map((m) => m[1]);
        expect(consumed.filter((c) => c === 'true')).toHaveLength(1);
        expect(consumed[consumed.length - 1]).toBe('true');
    });
});
