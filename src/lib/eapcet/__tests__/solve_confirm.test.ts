/**
 * ep-solve's `confirm` action: a `once` cache row (one clean solver) becomes
 * `two_ways` or `unsure` by running the OTHER solver family, so the reviewer
 * never solves and never compares a page against a single-model answer.
 * Text-level invariants on the function file (no Deno locally): the block
 * sits after the lock and the ledger read (a confirm costs a model call), it
 * patches the cache row, and its ledger row never consumes a read.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const fn = readFileSync(join(process.cwd(), 'supabase', 'functions', 'ep-solve', 'index.ts'), 'utf8').replace(/\r\n/g, '\n');
const S1 = fn.indexOf('// ── S1 intake');   // the section marker, not the header's mention of S1

describe('ep-solve confirm action', () => {
    const at = fn.indexOf("body.action === 'confirm'");
    it('exists, after the lock and the ledger read, before the intake call', () => {
        expect(S1).toBeGreaterThan(-1);
        expect(at).toBeGreaterThan(-1);
        expect(at).toBeGreaterThan(fn.indexOf('await entitled('));
        expect(at).toBeGreaterThan(fn.indexOf('await readTodayLedger()'));
        expect(at).toBeLessThan(S1);
        // the action gate lets it through
        expect(fn).toMatch(/body\.action !== 'solve' && body\.action !== 'confirm'/);
    });
    it('rebuilds the prior winner, runs the other family, and patches the row through the arbiter', () => {
        const block = fn.slice(at, S1);
        expect(block).toContain('cacheGet(fp)');
        expect(block).toContain("reason: 'unknown'");
        expect(block).toContain("reason: 'needs_photo'");
        expect(block).toContain('arbiter([prior, fresh]');
        expect(block).toContain('await cachePatch(fp, patch)');
        expect(block).toContain("label: 'two_ways'");
        expect(block).toContain("label: 'unsure'");
        expect(block).toContain("'solve_confirm'");
    });
    it('its ledger row never consumes a read', () => {
        const block = fn.slice(at, S1);
        const calls = [...block.matchAll(/ledgerRow\((true|false),/g)].map((m) => m[1]);
        expect(calls.length).toBeGreaterThan(0);
        expect(calls.every((c) => c === 'false')).toBe(true);
        expect(block).toContain("outcome: 'confirm'");
    });
    it('the image is optional for confirm and still validated when sent', () => {
        expect(fn).toContain("let mediaType = '', image = '', imageBytes = 0;");
        expect(fn.indexOf("let mediaType = '', image = '', imageBytes = 0;")).toBeLessThan(fn.indexOf('await entitled('));
    });
});
