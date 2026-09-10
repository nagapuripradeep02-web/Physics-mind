/**
 * The photo-read prompt lives twice: as the readable source in
 * src/prompts/eapcet_photo_read.txt and embedded in the Edge Function (which
 * cannot read repo files at runtime). This test fails when the two drift, and
 * checks the rules the design leans on are still in the text.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const source = readFileSync(join(root, 'src', 'prompts', 'eapcet_photo_read.txt'), 'utf8').replace(/\r\n/g, '\n');
const fn = readFileSync(join(root, 'supabase', 'functions', 'ep-photo-read', 'index.ts'), 'utf8').replace(/\r\n/g, '\n');

function embedded(): string {
    const m = fn.match(/const PROMPT = `([\s\S]*?)`;\n/);
    if (!m) throw new Error('ep-photo-read/index.ts has no PROMPT template');
    return m[1];
}

describe('ep-photo-read prompt', () => {
    it('is the same text in the prompt file and the function', () => {
        expect(embedded().trim()).toBe(source.trim());
    });
    it('keeps the propose-never-mark posture and the three placeholders', () => {
        for (const line of ['YOU ARE PROPOSING, NOT MARKING', 'NEVER compute a value', 'NEVER say which option is correct', 'Copy it; never compute it']) {
            expect(source).toContain(line);
        }
        for (const ph of ['{{question_text}}', '{{options_block}}', '{{steps_block}}']) expect(source).toContain(ph);
    });
    it('the function caps the body before parsing, never stores the image, and has its own task type and caps', () => {
        expect(fn).toContain("content-length");
        expect(fn.indexOf("content-length")).toBeLessThan(fn.indexOf('await req.json()'));
        expect(fn).toContain("const TASK_TYPE = 'eapcet_photo_read'");
        expect(fn).toContain("EP_PHOTO_DAILY_USD_CAP");
        expect(fn).toContain("EP_PHOTO_PER_DAY");
        expect(fn).toContain("EP_PHOTO_MAX_BYTES");
        // the lock comes before the ledger and before the key check
        expect(fn.indexOf('await entitled(')).toBeLessThan(fn.indexOf('await readTodayLedger()'));
        expect(fn.indexOf('await entitled(')).toBeLessThan(fn.indexOf('if (!GEMINI_KEY)'));
        // the image string is never written: only its byte count reaches the ledger
        const ledgerBlock = fn.slice(fn.indexOf('await writeUsage({'), fn.indexOf('await writeEvent('));
        expect(ledgerBlock).not.toMatch(/\bimage\b(?!_bytes)/);
        expect(ledgerBlock).toContain('image_bytes');
    });
});
