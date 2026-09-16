/**
 * The reviewer's $0 code — the safe evaluator, the step facts, the final
 * check with the exam's conventions, the judge validation, the escalation
 * predicate and the arbiter — tested against the SHIPPED function text: the
 * block between the PURE markers in supabase/functions/ep-review/index.ts is
 * sliced, transpiled and run here in Node (no Deno locally, no esbuild).
 *
 * The rules that matter: a fact is never a verdict; a failing fact blocks
 * CORRECT (two errors that cancel are still errors); an ERROR always names a
 * transcript line a judge quoted; a hedge, a missing quote or a lone judge with
 * no fact is UNSURE, never ERROR; a misread line at low legibility is
 * unchecked, never an error; a different method that reaches the key is
 * CORRECT; the exam's conventions (g = 10, summed relative errors, units) are
 * the standard, not the reference.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import ts from 'typescript';

type TLine = { n: number; text: string; tex: string; calc: string | null; kind: string; legible: number };
type Fact = { line: number; fact: string; detail: string | null };
type Judge = { verdict: string; first_error_line: number | null; error_class: string | null; what_should_be: string | null; concept_tag: string | null; evidence_quote: string | null; method: string | null; confidence: number };
type Validated = { status: string; judge: Judge | null; reason: string | null; quote_line: number | null; name?: string };
type Ref = { question_text?: string; options?: string[]; key_option?: number | null; key_value?: string | null; steps?: unknown[] };
type FinalCheck = { final: string | null; finalMatch: boolean; option: number | null; fact: Fact | null; detail: string | null; note: string | null };
type Verdict = { verdict: string; first_error_line: number | null; error_class: string | null; what_should_be: string | null; concept_tag: string | null; evidence_line: { n: number; text: string; tex: string } | null; ask: string | null; ask_line: number | null; method: string | null; reason: string | null };
type Api = {
    evaluate(expr: string, vars?: Record<string, number>): number | null;
    stepFacts(transcript: TLine[], typedAt?: { n: number; value: string } | null): Fact[];
    finalCheck(finalRead: string | null, typedFinal: string | null, ref: Ref, tags: string[], finalLine?: number): FinalCheck;
    conventionsOf(question: string, options: string[]): string[];
    validateJudge(raw: unknown, transcript: TLine[]): Validated;
    escalationReason(b: Validated | null, facts: Fact[], transcript: TLine[], meanLegible: number): string | null;
    arbitrate(facts: Fact[], judges: Validated[], finalMatch: boolean, transcript: TLine[], meanLegible: number): Verdict;
};

const fn = readFileSync(join(process.cwd(), 'supabase', 'functions', 'ep-review', 'index.ts'), 'utf8').replace(/\r\n/g, '\n');
const START = '// ---- PURE (tested) ----';
const END = '// ---- END PURE ----';

function load(): Api {
    const a = fn.indexOf(START), b = fn.indexOf(END);
    expect(a, 'PURE start marker').toBeGreaterThan(-1);
    expect(b, 'PURE end marker').toBeGreaterThan(a);
    const src = fn.slice(a, b);
    // the block runs anywhere: no Deno, no fetch, no environment, no outside constant
    expect(src).not.toMatch(/\bDeno\b/);
    expect(src).not.toMatch(/\bfetch\b/);
    expect(src).not.toMatch(/\benv\b/);
    const out = ts.transpileModule(src, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None }, reportDiagnostics: true });
    expect(out.diagnostics ?? []).toHaveLength(0);
    return new Function(out.outputText + '\n; return { evaluate, stepFacts, finalCheck, conventionsOf, validateJudge, escalationReason, arbitrate };')() as Api;
}
const P = load();

function L(n: number, text: string, calc: string | null = text, legible = 0.9, kind = 'equation'): TLine {
    return { n, text, tex: '$' + text + '$', calc, kind, legible };
}
const failing = (facts: Fact[]) => facts.filter((f) => ['arith_mismatch', 'does_not_follow', 'final_mismatch', 'final_conflict'].includes(f.fact));
function J(verdict: string, over: Partial<Judge> = {}): Judge {
    return { verdict, first_error_line: null, error_class: null, what_should_be: null, concept_tag: null, evidence_quote: null, method: null, confidence: 0.9, ...over };
}
function ok(name: string, judge: Judge): Validated { return { name, status: 'ok', judge, reason: null, quote_line: judge.first_error_line }; }

// A clean page: v² = u² + 2as with u = 0, a = 10, s = 5 → v = 10 m/s.
const CLEAN: TLine[] = [
    L(1, 'Given: u = 0, a = 10 m/s^2, s = 5 m', null, 0.95, 'statement'),
    L(2, 'v^2 = u^2 + 2*a*s'),
    L(3, 'v^2 = 0 + 2*10*5'),
    L(4, '= 100'),
    L(5, 'v = 10 m/s', 'v = 10', 0.9, 'final'),
];

describe('the evaluator', () => {
    it('follows precedence, right-associative powers, unary minus', () => {
        expect(P.evaluate('2 + 3 * 4')).toBe(14);
        expect(P.evaluate('2 ^ 3 ^ 2')).toBe(512);
        expect(P.evaluate('-2^2')).toBe(-4);
        expect(P.evaluate('2^-1')).toBe(0.5);
        expect(P.evaluate('(2 + 3) * 4')).toBe(20);
        expect(P.evaluate('10 / 4')).toBe(2.5);
    });
    it('inserts implicit multiplication', () => {
        expect(P.evaluate('2(3+4)')).toBe(14);
        expect(P.evaluate('2a', { a: 3 })).toBe(6);
        expect(P.evaluate('(1+1)(2+2)')).toBe(8);
        expect(P.evaluate('a(b + 1)', { a: 2, b: 3 })).toBe(8);
        expect(P.evaluate('2 pi r', { r: 1 })).toBeCloseTo(2 * Math.PI, 9);
    });
    it('knows the functions and constants', () => {
        expect(P.evaluate('sin(deg(30))')).toBeCloseTo(0.5, 9);
        expect(P.evaluate('cos(deg(60))')).toBeCloseTo(0.5, 9);
        expect(P.evaluate('sqrt(16)')).toBe(4);
        expect(P.evaluate('log(100)')).toBeCloseTo(2, 9);
        expect(P.evaluate('ln(e)')).toBeCloseTo(1, 9);
        expect(P.evaluate('abs(-3)')).toBe(3);
        expect(P.evaluate('exp(0)')).toBe(1);
        expect(P.evaluate('pi')).toBeCloseTo(Math.PI, 9);
    });
    it('reads the unicode a transcript carries', () => {
        expect(P.evaluate('2 × 3 − 1')).toBe(5);
        expect(P.evaluate('v²', { v: 3 })).toBe(9);
        expect(P.evaluate('√(9)')).toBe(3);
        expect(P.evaluate('√9 + 1')).toBe(4);
        expect(P.evaluate('π')).toBeCloseTo(Math.PI, 9);
        expect(P.evaluate('sin(θ)', { theta: Math.PI / 2 })).toBeCloseTo(1, 9);
        expect(P.evaluate('10⁻³')).toBeCloseTo(0.001, 12);
        expect(P.evaluate('6 ÷ 3')).toBe(2);
    });
    it('discards the non-finite, the unknown, the unparseable, the too deep and the too long', () => {
        expect(P.evaluate('1/0')).toBeNull();
        expect(P.evaluate('sqrt(-1)')).toBeNull();
        expect(P.evaluate('x + 1')).toBeNull();
        expect(P.evaluate('2 +')).toBeNull();
        expect(P.evaluate('sin 30')).toBeNull();
        expect(P.evaluate('[?] + 1')).toBeNull();
        expect(P.evaluate('')).toBeNull();
        expect(P.evaluate('('.repeat(45) + '1' + ')'.repeat(45))).toBeNull();
        expect(P.evaluate('('.repeat(20) + '1' + ')'.repeat(20))).toBe(1);
        expect(P.evaluate(Array.from({ length: 101 }, () => '1').join('+'))).toBeNull();
        expect(P.evaluate(Array.from({ length: 50 }, () => '1').join('+'))).toBe(50);
    });
});

describe('step facts', () => {
    it('flags an arithmetic slip on a closed line', () => {
        const facts = P.stepFacts([L(1, 'F = 400*0.5/20 = 12')]);
        expect(failing(facts)).toEqual([expect.objectContaining({ line: 1, fact: 'arith_mismatch' })]);
        expect(facts[0].detail).toContain('12');
    });
    it('passes a continuation that follows, and a clean page has no failing fact', () => {
        expect(failing(P.stepFacts([L(1, 'v^2 = 400 - 100'), L(2, '= 300')]))).toEqual([]);
        expect(failing(P.stepFacts(CLEAN))).toEqual([]);
        expect(P.stepFacts(CLEAN).some((f) => f.fact === 'follows' || f.fact === 'arith_ok')).toBe(true);
    });
    it('flags a continuation that does not follow (symbolic, sampled)', () => {
        const facts = P.stepFacts([L(1, 'v^2 = u^2 + 2*a*s'), L(2, '= u^2 - 2*a*s')]);
        expect(failing(facts)).toEqual([expect.objectContaining({ line: 2, fact: 'does_not_follow' })]);
    });
    it('flags the same left side with a different right side', () => {
        const facts = P.stepFacts([L(1, 'v^2 = u^2 + 2*a*s'), L(2, 'v^2 = u^2 - 2*a*s')]);
        expect(failing(facts)).toEqual([expect.objectContaining({ line: 2, fact: 'does_not_follow' })]);
    });
    it('never yields a negative fact for a rearrangement with a different left side', () => {
        expect(failing(P.stepFacts([L(1, 'v^2 = u^2 + 2*a*s'), L(2, 's = (v^2 - u^2)/(2*a)')]))).toEqual([]);
        expect(failing(P.stepFacts([L(1, 'v = u + a*t'), L(2, 't = (v - u)/a + 99')]))).toEqual([]);
    });
    it('never yields a negative fact for a substitution (the free variables changed)', () => {
        expect(failing(P.stepFacts([L(1, 'v^2 = u^2 + 2*a*s'), L(2, 'v^2 = 0 + 2*10*5')]))).toEqual([]);
        expect(failing(P.stepFacts([L(1, 'F = m*a'), L(2, '= 2*3')]))).toEqual([]);
    });
    it('does not compare across an unreadable or non-calc line', () => {
        expect(failing(P.stepFacts([L(1, 'v^2 = 400 - 100'), L(2, '[?]', null, 0.1), L(3, '= 12')]))).toEqual([]);
    });
    it('downgrades a failing fact on a hard-to-read line to unchecked_low_legibility', () => {
        const facts = P.stepFacts([L(1, 'F = 400*0.5/20 = 12', 'F = 400*0.5/20 = 12', 0.4)]);
        expect(failing(facts)).toEqual([]);
        expect(facts).toEqual([expect.objectContaining({ line: 1, fact: 'unchecked_low_legibility' })]);
        const cross = P.stepFacts([L(1, 'v^2 = u^2 + 2*a*s', 'v^2 = u^2 + 2*a*s', 0.5), L(2, '= u^2 - 2*a*s')]);
        expect(failing(cross)).toEqual([]);
        expect(cross.some((f) => f.fact === 'unchecked_low_legibility')).toBe(true);
    });
    it('is deterministic', () => {
        const page = [L(1, 'v^2 = u^2 + 2*a*s'), L(2, '= u^2 - 2*a*s'), L(3, 'x = (a+b)^2'), L(4, 'x = a^2 + 2*a*b + b^2')];
        expect(P.stepFacts(page)).toEqual(P.stepFacts(page));
        expect(failing(P.stepFacts(page)).map((f) => f.line)).toEqual([2]);
    });
    it('substitutes a typed value for the line the student clarified, keeping it fully legible', () => {
        const page = [L(1, 'F = 400*0.5/20'), L(2, '= [?]', null, 0.2)];
        expect(failing(P.stepFacts(page))).toEqual([]);
        const facts = P.stepFacts(page, { n: 2, value: '12' });
        expect(failing(facts)).toEqual([expect.objectContaining({ line: 2, fact: 'does_not_follow' })]);
        expect(failing(P.stepFacts(page, { n: 2, value: '10' }))).toEqual([]);
        const lhs = P.stepFacts([L(1, 'F = 400*0.5/20'), L(2, 'F = [?]', null, 0.3)], { n: 2, value: '12' });
        expect(failing(lhs)).toEqual([expect.objectContaining({ line: 2, fact: 'does_not_follow' })]);
    });
});

describe('conventions and the final check', () => {
    it('tags the exam conventions from the question', () => {
        expect(P.conventionsOf('The percentage error in the measurement of the resistance is', ['1 %', '2 %', '3 %', '4 %'])).toContain('pct_error');
        expect(P.conventionsOf('The relative error in the volume is', [])).toContain('pct_error');
        expect(P.conventionsOf('A ball is dropped from 20 m (take g = 10 m/s^2). Find the speed.', [])).toContain('g_fixed');
        expect(P.conventionsOf('A ball is dropped from 20 m. Find the speed.', [])).not.toContain('g_fixed');
        expect(P.conventionsOf('The ratio of the kinetic energies is', ['1:2', '2:3', '3:4', '4:5'])).toContain('ratio_answer');
        expect(P.conventionsOf('Find the speed.', ['1 m/s', '2 m/s'])).toEqual([]);
    });
    it('matches the key by option, by value, by rounding, by unit prefix', () => {
        const opt = P.finalCheck('4 m', null, { options: ['2 m', '4 m', '6 m', '8 m'], key_option: 2 }, []);
        expect(opt.finalMatch).toBe(true);
        expect(opt.option).toBe(2);
        expect(opt.fact).toBeNull();
        const wrong = P.finalCheck('6 m', null, { options: ['2 m', '4 m', '6 m', '8 m'], key_option: 2 }, [], 5);
        expect(wrong.finalMatch).toBe(false);
        expect(wrong.fact).toEqual(expect.objectContaining({ line: 5, fact: 'final_mismatch' }));
        // within one percent is a plain value match; beyond it, rounding to the key's printed decimals
        expect(P.finalCheck('2.3', null, { key_value: '2.28 m/s' }, []).finalMatch).toBe(true);
        expect(P.finalCheck('2.3', null, { key_value: '2.28 m/s' }, []).detail).toBe('value');
        expect(P.finalCheck('3.1', null, { key_value: '3.14 s' }, []).finalMatch).toBe(true);
        expect(P.finalCheck('3.1', null, { key_value: '3.14 s' }, []).detail).toBe('rounded');
        // outside the one-percent, the printed-rounding and the g-twin windows: a mismatch
        expect(P.finalCheck('3.5', null, { key_value: '3.14 s' }, []).finalMatch).toBe(false);
        expect(P.finalCheck('2.1', null, { key_value: '2.28 m/s' }, []).finalMatch).toBe(false);
        expect(P.finalCheck('2', null, { key_value: '2.4 m' }, []).finalMatch).toBe(false);
        const cm = P.finalCheck('250 cm', null, { key_value: '2.5 m' }, []);
        expect(cm.finalMatch).toBe(true);
        expect(cm.detail).toBe('unit_prefix');
        expect(P.finalCheck('2.5 km', null, { key_value: '2.5 m' }, []).finalMatch).toBe(false);
        expect(P.finalCheck('3:4', null, { key_value: '0.75' }, ['ratio_answer']).finalMatch).toBe(true);
    });
    it('accepts the g = 9.8 twin of a g = 10 key unless the question fixed g', () => {
        const rescaled = P.finalCheck('19.6 m', null, { key_value: '20 m' }, []);
        expect(rescaled.finalMatch).toBe(true);
        expect(rescaled.detail).toBe('g_rescaled');
        expect(P.finalCheck('4.9 m', null, { key_value: '5 m' }, []).finalMatch).toBe(true);
        expect(P.finalCheck('9.899 m/s', null, { key_value: '10 m/s' }, []).detail).toBe('g_rescaled');   // sqrt(2·9.8·5) against sqrt(2·10·5)
        expect(P.finalCheck('9.9 m/s', null, { key_value: '10 m/s' }, []).detail).toBe('value');          // already within one percent
        const fixed = P.finalCheck('19.6 m', null, { key_value: '20 m' }, ['g_fixed'], 4);
        expect(fixed.finalMatch).toBe(false);
        expect(fixed.fact).toEqual(expect.objectContaining({ fact: 'final_mismatch' }));
    });
    it('reports a typed final that contradicts the one read as a conflict', () => {
        const c = P.finalCheck('12 m', '15 m', { key_value: '12 m' }, [], 3);
        expect(c.fact).toEqual(expect.objectContaining({ line: 3, fact: 'final_conflict' }));
        expect(c.finalMatch).toBe(false);
        expect(P.finalCheck('12 m', '12 m', { key_value: '12 m' }, []).finalMatch).toBe(true);
        expect(P.finalCheck(null, '12 m', { key_value: '12 m' }, []).finalMatch).toBe(true);
        const none = P.finalCheck(null, null, { key_value: '12 m' }, []);
        expect(none.finalMatch).toBe(false);
        expect(none.fact).toBeNull();
    });
    it('on a percentage-error page a printed option is a match and the difference is a convention note, not a failing fact', () => {
        const ref = { question_text: 'The percentage error in the measurement is', options: ['1 %', '2.3 %', '0.01', '5 %'], key_option: 3 };
        const fc = P.finalCheck('2.3 %', null, ref, ['pct_error'], 6);
        expect(fc.finalMatch).toBe(true);
        expect(fc.fact).toEqual(expect.objectContaining({ line: 6, fact: 'final_differs_convention' }));
        expect(failing([fc.fact!])).toEqual([]);
        expect(fc.note).toContain('EAPCET adds relative errors');
        const page = [L(1, 'dR/R = dV/V + dI/I'), L(2, '= 0.01 + 0.013'), L(3, '= 0.023')];
        const facts = P.stepFacts(page).concat(fc.fact ? [fc.fact] : []);
        const v = P.arbitrate(facts, [ok('B', J('CORRECT', { method: 'Added the relative errors of V and I.' }))], fc.finalMatch, page, 0.9);
        expect(v.verdict).toBe('CORRECT');
        expect(v.method).toBe('Added the relative errors of V and I.');
        // a value that matches no printed option is still a mismatch
        expect(P.finalCheck('7 %', null, ref, ['pct_error']).finalMatch).toBe(false);
    });
});

describe('judge validation', () => {
    it('accepts an ERROR that names a line and quotes it (within one line, text or tex)', () => {
        const v = P.validateJudge({ verdict: 'ERROR', first_error_line: 3, error_class: 'calculation', evidence_quote: 'v^2 = 0 + 2*10*5', what_should_be: 'x', confidence: 0.8 }, CLEAN);
        expect(v.status).toBe('ok');
        expect(v.quote_line).toBe(3);
        const near = P.validateJudge({ verdict: 'error', first_error_line: 2, error_class: 'Calculation', evidence_quote: 'v^2 = 0 + 2*10*5', confidence: 0.8 }, CLEAN);
        expect(near.status).toBe('ok');
        expect(near.quote_line).toBe(3);
        expect(near.judge!.verdict).toBe('ERROR');
        expect(near.judge!.error_class).toBe('calculation');
    });
    it('discards an ERROR whose quote is not on the page, or whose line is not in the transcript', () => {
        expect(P.validateJudge({ verdict: 'ERROR', first_error_line: 3, error_class: 'calculation', evidence_quote: 'v = u + a t with u = 0', confidence: 0.9 }, CLEAN).status).toBe('discarded');
        expect(P.validateJudge({ verdict: 'ERROR', first_error_line: 3, error_class: 'calculation', evidence_quote: null, confidence: 0.9 }, CLEAN).status).toBe('discarded');
        expect(P.validateJudge({ verdict: 'ERROR', first_error_line: 9, error_class: 'calculation', evidence_quote: 'v^2 = 0 + 2*10*5', confidence: 0.9 }, CLEAN).status).toBe('discarded');
        expect(P.validateJudge({ verdict: 'ERROR', first_error_line: null, error_class: 'calculation', evidence_quote: 'v^2 = 0 + 2*10*5', confidence: 0.9 }, CLEAN).status).toBe('discarded');
        // the quote is one line away from the named line but two lines from it: no
        expect(P.validateJudge({ verdict: 'ERROR', first_error_line: 5, error_class: 'calculation', evidence_quote: 'v^2 = 0 + 2*10*5', confidence: 0.9 }, CLEAN).status).toBe('discarded');
    });
    it('marks a hedge: low confidence or two lines named', () => {
        expect(P.validateJudge({ verdict: 'CORRECT', confidence: 0.3 }, CLEAN).status).toBe('hedged');
        expect(P.validateJudge({ verdict: 'ERROR', first_error_line: 3, error_class: 'calculation', evidence_quote: 'v^2 = 0 + 2*10*5', what_should_be: 'Line 3, or possibly line 5, has the slip', confidence: 0.9 }, CLEAN).status).toBe('hedged');
        expect(P.validateJudge({ verdict: 'ERROR', first_error_line: 3, error_class: 'calculation', evidence_quote: 'v^2 = 0 + 2*10*5', what_should_be: 'line 3/4', confidence: 0.9 }, CLEAN).status).toBe('hedged');
        expect(P.validateJudge({ verdict: 'CORRECT', confidence: 0.9 }, CLEAN).status).toBe('ok');
    });
    it('parses fenced or wrapped JSON, fails on none, keeps method only on CORRECT', () => {
        const fenced = '```json\n{"verdict":"CORRECT","method":"Energy conservation.","confidence":0.95}\n```';
        const v = P.validateJudge(fenced, CLEAN);
        expect(v.status).toBe('ok');
        expect(v.judge!.method).toBe('Energy conservation.');
        const wrapped = P.validateJudge('Here is my verdict: {"verdict":"UNSURE","confidence":0.6} thanks', CLEAN);
        expect(wrapped.status).toBe('ok');
        expect(wrapped.judge!.verdict).toBe('UNSURE');
        expect(P.validateJudge('no json here', CLEAN).status).toBe('failed');
        expect(P.validateJudge('', CLEAN).status).toBe('failed');
        const e = P.validateJudge({ verdict: 'ERROR', first_error_line: 3, error_class: 'concept', evidence_quote: 'v^2 = 0 + 2*10*5', method: 'should be dropped', confidence: 0.9 }, CLEAN);
        expect(e.judge!.method).toBeNull();
        expect(P.validateJudge({ verdict: 'CORRECT', first_error_line: 3, confidence: 0.9 }, CLEAN).judge!.first_error_line).toBeNull();
    });
});

describe('the arbiter', () => {
    const ERR3 = (name: string, cls = 'calculation', conf = 0.9) => ok(name, J('ERROR', { first_error_line: 3, error_class: cls, evidence_quote: 'v^2 = 0 + 2*10*5', what_should_be: 'Substitute a = 10 and s = 5 correctly.', concept_tag: 'kinematics', confidence: conf }));
    const facts3: Fact[] = [{ line: 3, fact: 'arith_mismatch', detail: '2*10*5 = 100 but 12' }];

    it('a different method that reaches the key with no failing fact is CORRECT', () => {
        const page = [L(1, 'm*g*h = 1/2*m*v^2'), L(2, 'v = sqrt(2*g*h)'), L(3, 'v = sqrt(2*10*5)'), L(4, '= 10', '= 10', 0.9, 'final')];
        const v = P.arbitrate(P.stepFacts(page), [ok('B', J('CORRECT', { method: 'Energy conservation instead of the kinematic equation.' }))], true, page, 0.9);
        expect(v.verdict).toBe('CORRECT');
        expect(v.method).toContain('Energy conservation');
        expect(v.first_error_line).toBeNull();
    });
    it('a failing fact blocks CORRECT even when the final matches the key (two errors that cancel)', () => {
        const v = P.arbitrate(facts3, [ok('B', J('CORRECT'))], true, CLEAN, 0.9);
        expect(v.verdict).not.toBe('CORRECT');
        expect(v.verdict).toBe('UNSURE');
        const both = P.arbitrate(facts3, [ok('B', J('CORRECT')), ERR3('A')], true, CLEAN, 0.9);
        expect(both.verdict).toBe('ERROR');
        expect(both.first_error_line).toBe(3);
        expect(both.evidence_line!.n).toBe(3);
    });
    it('a final that does not match the key is never CORRECT', () => {
        const v = P.arbitrate([], [ok('B', J('CORRECT'))], false, CLEAN, 0.9);
        expect(v.verdict).toBe('UNSURE');
    });
    it('two judges on the same line and class is ERROR at the lower line, with the namer\'s note', () => {
        const a = ok('A', J('ERROR', { first_error_line: 4, error_class: 'calculation', evidence_quote: '= 100', what_should_be: 'A says', confidence: 0.7 }));
        const v = P.arbitrate([], [ERR3('B'), a], false, CLEAN, 0.9);
        expect(v.verdict).toBe('ERROR');
        expect(v.first_error_line).toBe(3);
        expect(v.error_class).toBe('calculation');
        expect(v.evidence_line).toEqual({ n: 3, text: 'v^2 = 0 + 2*10*5', tex: '$v^2 = 0 + 2*10*5$' });
        expect(v.what_should_be).toBe('Substitute a = 10 and s = 5 correctly.');
        // different classes: no agreement, no fact → UNSURE
        expect(P.arbitrate([], [ERR3('B'), ERR3('A', 'concept')], false, CLEAN, 0.9).verdict).toBe('UNSURE');
        // same class two lines apart: no agreement
        const far = ok('A', J('ERROR', { first_error_line: 5, error_class: 'calculation', evidence_quote: 'v = 10', confidence: 0.7 }));
        expect(P.arbitrate([], [ERR3('B'), far], false, CLEAN, 0.9).verdict).toBe('UNSURE');
    });
    it('one judge plus a failing fact within one line is ERROR at the judge\'s line', () => {
        const v = P.arbitrate(facts3, [ERR3('B')], false, CLEAN, 0.9);
        expect(v.verdict).toBe('ERROR');
        expect(v.first_error_line).toBe(3);
        expect(v.error_class).toBe('calculation');
        expect(v.concept_tag).toBe('kinematics');
        const near = P.arbitrate([{ line: 4, fact: 'does_not_follow', detail: null }], [ERR3('B')], false, CLEAN, 0.9);
        expect(near.verdict).toBe('ERROR');
        expect(near.first_error_line).toBe(3);
    });
    it('a hedge, a discarded quote, or an always-ERROR judge with no fact is UNSURE, never ERROR', () => {
        const hedged: Validated = { name: 'B', status: 'hedged', judge: J('ERROR', { first_error_line: 3, error_class: 'calculation', evidence_quote: 'v^2 = 0 + 2*10*5', confidence: 0.3 }), reason: 'low_confidence', quote_line: 3 };
        expect(P.arbitrate(facts3, [hedged], false, CLEAN, 0.9).verdict).toBe('UNSURE');
        const discarded: Validated = { name: 'B', status: 'discarded', judge: J('ERROR', { first_error_line: 3, error_class: 'calculation', evidence_quote: 'nowhere' }), reason: 'no_quote_match', quote_line: null };
        expect(P.arbitrate(facts3, [discarded], false, CLEAN, 0.9).verdict).toBe('UNSURE');
        const dummy = P.arbitrate([], [ERR3('B')], true, CLEAN, 0.9);
        expect(dummy.verdict).toBe('UNSURE');
        expect(dummy.ask).toBe('type_value_at_line');
        expect(dummy.ask_line).toBe(3);
        const failed: Validated = { name: 'B', status: 'failed', judge: null, reason: 'no_json', quote_line: null };
        const nothing = P.arbitrate([], [failed], false, CLEAN, 0.9);
        expect(nothing.verdict).toBe('UNSURE');
        expect(nothing.ask_line).toBe(5);   // the last equation line
    });
    it('a reading dispute is UNSURE with a retake', () => {
        const reading = ok('A', J('ERROR', { first_error_line: 3, error_class: 'reading', evidence_quote: 'v^2 = 0 + 2*10*5', what_should_be: 'The page says 2*10*5, the transcript misread it.' }));
        const v = P.arbitrate(facts3, [ERR3('B'), reading], false, CLEAN, 0.9);
        expect(v.verdict).toBe('UNSURE');
        expect(v.ask).toBe('retake');
        expect(v.reason).toBe('transcript_disputed');
    });
    it('asks for a retake when the page or the disputed line is hard to read, else for the value at the line', () => {
        expect(P.arbitrate([], [ERR3('B')], false, CLEAN, 0.6).ask).toBe('retake');
        const faint = CLEAN.map((l) => l.n === 3 ? { ...l, legible: 0.4 } : l);
        expect(P.arbitrate([], [ERR3('B')], false, faint, 0.9).ask).toBe('retake');
        expect(P.arbitrate([], [ERR3('B')], false, CLEAN, 0.9).ask).toBe('type_value_at_line');
    });
    it('every ERROR carries an evidence line that is a transcript line', () => {
        const runs = [
            P.arbitrate(facts3, [ERR3('B')], false, CLEAN, 0.9),
            P.arbitrate([], [ERR3('B'), ERR3('A')], false, CLEAN, 0.9),
            P.arbitrate(facts3, [ok('B', J('CORRECT')), ERR3('A')], true, CLEAN, 0.9),
        ];
        for (const v of runs) {
            expect(v.verdict).toBe('ERROR');
            expect(v.evidence_line).not.toBeNull();
            const line = CLEAN.find((l) => l.n === v.evidence_line!.n)!;
            expect(line).toBeDefined();
            expect(v.evidence_line!.text).toBe(line.text);
            expect(v.first_error_line).toBe(v.evidence_line!.n);
        }
    });
});

describe('the escalation predicate', () => {
    const B_OK = ok('B', J('CORRECT'));
    const B_ERR = ok('B', J('ERROR', { first_error_line: 3, error_class: 'calculation', evidence_quote: 'v^2 = 0 + 2*10*5' }));
    const F3: Fact[] = [{ line: 3, fact: 'arith_mismatch', detail: null }];
    it('fires each of the seven reasons, first match wins', () => {
        expect(P.escalationReason(B_OK, [], CLEAN, 0.6)).toBe('low_legibility');
        expect(P.escalationReason(B_OK, [], [...CLEAN, L(6, 'free body sketch', null, 0.9, 'diagram')], 0.9)).toBe('diagram');
        expect(P.escalationReason(ok('B', J('UNSURE')), [], CLEAN, 0.9)).toBe('judge_b_unsure');
        expect(P.escalationReason({ name: 'B', status: 'failed', judge: null, reason: 'no_json', quote_line: null }, [], CLEAN, 0.9)).toBe('judge_b_unsure');
        expect(P.escalationReason({ name: 'B', status: 'hedged', judge: J('CORRECT', { confidence: 0.2 }), reason: 'low_confidence', quote_line: null }, [], CLEAN, 0.9)).toBe('judge_b_unsure');
        expect(P.escalationReason({ name: 'B', status: 'discarded', judge: J('ERROR', { first_error_line: 3, error_class: 'calculation' }), reason: 'no_quote_match', quote_line: null }, F3, CLEAN, 0.9)).toBe('judge_b_no_quote');
        expect(P.escalationReason(B_ERR, [], CLEAN, 0.9)).toBe('judge_b_unsupported');
        expect(P.escalationReason(B_OK, F3, CLEAN, 0.9)).toBe('judge_b_vs_machine');
        const reading = ok('B', J('ERROR', { first_error_line: 3, error_class: 'reading', evidence_quote: 'v^2 = 0 + 2*10*5' }));
        expect(P.escalationReason(reading, F3, CLEAN, 0.9)).toBe('transcript_disputed');
    });
    it('is silent on a clean page a confident judge passed at legibility 0.9, and on a supported ERROR', () => {
        expect(P.escalationReason(B_OK, [], CLEAN, 0.9)).toBeNull();
        expect(P.escalationReason(B_ERR, F3, CLEAN, 0.9)).toBeNull();
        expect(P.escalationReason(B_OK, [{ line: 2, fact: 'follows', detail: null }], CLEAN, 0.9)).toBeNull();
    });
});
