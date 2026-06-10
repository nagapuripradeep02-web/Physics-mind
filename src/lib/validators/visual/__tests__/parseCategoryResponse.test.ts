/**
 * Robustness tests for parseCategoryResponse — the vision-ladder JSON parser.
 *
 * These reproduce the exact malformed-response shapes seen in the A5 proof run
 * (smoke 2026-06-10): the Sonnet escalation tier occasionally returns valid JSON
 * wrapped in prose, or echoes LaTeX (\sin, \,, \vec) into evidence strings —
 * producing invalid JSON escapes. The parser must recover instead of failing the
 * whole category.
 */
import { describe, it, expect } from 'vitest';
import { parseCategoryResponse } from '../promptTemplates';

const A_KEYS = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'] as const;

function cleanA(): string {
    return JSON.stringify(
        Object.fromEntries(A_KEYS.map(k => [k, { passed: true, evidence: 'ok' }])),
    );
}

describe('parseCategoryResponse robustness', () => {
    it('parses a clean JSON object (baseline unchanged)', () => {
        const results = parseCategoryResponse({ category: 'A', scope: 'STATE_1', rawText: cleanA() });
        expect(results).toHaveLength(6);
        expect(results.every(r => r.passed)).toBe(true);
    });

    it('strips ```json fences', () => {
        const raw = '```json\n' + cleanA() + '\n```';
        const results = parseCategoryResponse({ category: 'A', scope: 'STATE_1', rawText: raw });
        expect(results.every(r => r.passed)).toBe(true);
    });

    it('recovers when the model adds trailing prose after the JSON object', () => {
        // Repro: "Unexpected non-whitespace character after JSON at position N"
        const raw = cleanA() + '\n\nNote: STATE_6 looks correct overall.';
        const results = parseCategoryResponse({ category: 'A', scope: 'STATE_6', rawText: raw });
        expect(results.every(r => r.passed)).toBe(true);
        expect(results.every(r => !r.evidence.includes('not valid JSON'))).toBe(true);
    });

    it('recovers when the model adds leading prose before the JSON object', () => {
        const raw = 'Here is my analysis of the layout:\n' + cleanA();
        const results = parseCategoryResponse({ category: 'A', scope: 'STATE_1', rawText: raw });
        expect(results.every(r => r.passed)).toBe(true);
    });

    it('recovers when evidence strings echo LaTeX with invalid JSON escapes', () => {
        // Repro: "Expected ',' or '}' after property value" — \, \sin \vec are
        // invalid JSON escape sequences.
        const raw = `{
  "B1": { "passed": true, "evidence": "field B points up" },
  "B2": { "passed": true, "evidence": "F = qvB\\,\\sin 10^{\\circ}, vec form \\vec{F} = q\\vec{v}\\times\\vec{B}" },
  "B3": { "passed": true, "evidence": "n/a" },
  "B4": { "passed": true, "evidence": "n/a" },
  "B5": { "passed": true, "evidence": "n/a" },
  "B6": { "passed": true, "evidence": "n/a" },
  "B7": { "passed": true, "evidence": "two arrows" }
}`;
        // Build the literal raw text the model would emit: single backslashes.
        const modelRaw = raw.replace(/\\\\/g, '\\');
        const results = parseCategoryResponse({ category: 'B', scope: 'STATE_2', rawText: modelRaw });
        expect(results).toHaveLength(7);
        expect(results.every(r => !r.evidence.includes('not valid JSON'))).toBe(true);
        const b2 = results.find(r => r.check_id === 'B2');
        expect(b2?.passed).toBe(true);
        expect(b2?.evidence).toContain('sin');
    });

    it('still reports a parse failure for genuinely unrecoverable garbage', () => {
        const results = parseCategoryResponse({ category: 'A', scope: 'STATE_1', rawText: 'totally not json at all' });
        expect(results.every(r => !r.passed)).toBe(true);
        expect(results[0].evidence).toContain('not valid JSON');
    });
});
