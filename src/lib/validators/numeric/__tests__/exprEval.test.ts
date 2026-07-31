/**
 * exprEval unit tests — every input here is a REAL string taken from
 * src/data/concepts/*.json, not an invented case.
 */
import { describe, it, expect } from 'vitest';
import {
    rewriteCaret,
    normalizeDerived,
    normalizeComputedOutput,
    evaluateExpr,
} from '../exprEval';

describe('rewriteCaret', () => {
    it('rewrites a simple power', () => {
        expect(rewriteCaret('R^2')).toBe('Math.pow(R,2)');
    });
    it('rewrites both terms of ac_power_factor Z = sqrt(R^2 + X^2)', () => {
        expect(rewriteCaret('sqrt(R^2 + X^2)')).toBe('sqrt(Math.pow(R,2) + Math.pow(X,2))');
    });
    it('rewrites resistivity n*e^2*rho', () => {
        expect(rewriteCaret('n*e^2*rho')).toBe('n*Math.pow(e,2)*rho');
    });
    it('absorbs a parenthesized left operand', () => {
        expect(rewriteCaret('(a+b)^2')).toBe('Math.pow((a+b),2)');
    });
    it('absorbs a function-call left operand', () => {
        expect(rewriteCaret('sqrt(x)^2')).toBe('Math.pow(sqrt(x),2)');
    });
    it('handles a unary-negative exponent', () => {
        expect(rewriteCaret('10^-3')).toBe('Math.pow(10,-3)');
    });
    it('leaves caret-free input untouched', () => {
        expect(rewriteCaret('epsilon0 * A / d')).toBe('epsilon0 * A / d');
    });
});

describe('normalizeDerived', () => {
    it('passes a bare RHS through (capacitance C)', () => {
        const r = normalizeDerived('epsilon0 * A / d');
        expect(r).toEqual({ ok: true, expr: 'epsilon0 * A / d' });
    });

    it('strips a single redundant LHS (ac_power_factor Z)', () => {
        const r = normalizeDerived('Z = sqrt(R^2 + X^2)');
        expect(r.ok).toBe(true);
        if (r.ok) expect(r.expr).toBe('sqrt(Math.pow(R,2) + Math.pow(X,2))');
    });

    it('takes the first RHS from a doubled-LHS alternative chain (ac_power_factor X_L)', () => {
        const r = normalizeDerived('X_L = X_L = omega*L = 2*PI*f_demo*L');
        expect(r.ok).toBe(true);
        if (r.ok) expect(r.expr).toBe('omega*L');
    });

    it('takes the first expression from an alternative chain (ac_power_factor omega_deg_per_s)', () => {
        const r = normalizeDerived('omega_deg_per_s = omega * 180/PI = 360*f_demo');
        expect(r.ok).toBe(true);
        if (r.ok) expect(r.expr).toBe('omega * 180/PI');
    });

    it('rejects prose rather than guessing (ohms_law i)', () => {
        const r = normalizeDerived('V/R (ohmic) or V/R_eff (non-ohmic)');
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.reason).toContain('prose');
    });

    it('rejects a bracketed authoring note (ac_power_factor theta)', () => {
        const r = normalizeDerived('theta = omega_deg_per_s * t  [t = time since STATE ENTRY, ...]');
        expect(r.ok).toBe(false);
    });

    it('rejects Unicode math transcription rather than mangling it', () => {
        const r = normalizeDerived('i = neAv_d = (ne²Aτ/(m_e L)) * V');
        expect(r.ok).toBe(false);
    });

    it('accepts radians(), which is not a JS built-in', () => {
        const r = normalizeDerived('v_t = vm * sin(radians(theta + phi))');
        expect(r.ok).toBe(true);
        if (r.ok) expect(r.expr).toBe('vm * sin(radians(theta + phi))');
    });

    it('never throws on empty or junk input', () => {
        expect(normalizeDerived('').ok).toBe(false);
        expect(normalizeDerived('   ').ok).toBe(false);
    });
});

describe('normalizeComputedOutput', () => {
    it('passes a capacitance ternary through unchanged', () => {
        const raw = '(C*1e12) < 100 ? (C*1e12).toFixed(1) : (C*1e12).toFixed(0)';
        expect(normalizeComputedOutput(raw)).toEqual({ ok: true, expr: raw });
    });
    it('passes Math.* calls through unchanged', () => {
        expect(normalizeComputedOutput('Math.round(Q_nC / 0.1)')).toEqual({
            ok: true, expr: 'Math.round(Q_nC / 0.1)',
        });
    });

    it('strips an LHS authored into a computed_output ("Invalid left-hand side" class)', () => {
        const r = normalizeComputedOutput('C = epsilon0*A/d');
        expect(r.ok).toBe(true);
        if (r.ok) expect(r.expr).toBe('epsilon0*A/d');
    });
});

describe('evaluateExpr', () => {
    it('computes capacitance C = epsilon0*A/d', () => {
        const r = evaluateExpr('epsilon0 * A / d', { epsilon0: 8.854e-12, A: 0.01, d: 0.001 });
        expect(r.ok).toBe(true);
        if (r.ok) expect(r.value).toBeCloseTo(8.854e-11, 18);
    });

    it('returns the numeric value AND the text of a .toFixed() output', () => {
        const r = evaluateExpr('(Q*1e9).toFixed(2)', { Q: 1.0625e-9 });
        expect(r.ok).toBe(true);
        if (r.ok) {
            expect(r.value).toBeCloseTo(1.06, 6);
            expect(r.text).toBe('1.06');   // decimal count drives the rounding tolerance
        }
    });

    it('lets a concept variable shadow Math.E (ohms_law/capacitance declare E as a field)', () => {
        const r = evaluateExpr('E * 2', { E: 1200 });
        expect(r.ok).toBe(true);
        if (r.ok) expect(r.value).toBe(2400);
    });

    it('resolves bare math names without the Math. prefix', () => {
        const r = evaluateExpr('sqrt(Math.pow(3,2) + Math.pow(4,2))', {});
        expect(r.ok).toBe(true);
        if (r.ok) expect(r.value).toBe(5);
    });

    it('reports an unresolved identifier instead of throwing (ac_generator free t)', () => {
        const r = evaluateExpr('N*B*A*cos(omega*t)', { N: 100, B: 0.5, A: 0.01, omega: 314 });
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.reason).toMatch(/t is not defined/);
    });

    it('resolves once t is injected', () => {
        const r = evaluateExpr('N*B*A*cos(omega*t)', { N: 100, B: 0.5, A: 0.01, omega: 314, t: 0 });
        expect(r.ok).toBe(true);
        if (r.ok) expect(r.value).toBeCloseTo(0.5, 10);
    });

    it('rejects a division that produced Infinity', () => {
        const r = evaluateExpr('V / d', { V: 12, d: 0 });
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.reason).toContain('Infinity');
    });

    it('rejects a non-numeric string result', () => {
        const r = evaluateExpr("'KINETIC'", {});
        expect(r.ok).toBe(false);
    });

    it('survives a reserved-word variable name (combination_of_resistors declares `switch`)', () => {
        // The reserved name is unusable and dropped; every OTHER identifier in
        // the same concept must still resolve. Before the fix, `new Function`
        // threw a syntax error and killed every assertion for the concept.
        const r = evaluateExpr('R1 + R2', { R1: 4, R2: 6, switch: 1, default: 0 });
        expect(r.ok).toBe(true);
        if (r.ok) expect(r.value).toBe(10);
    });
});
