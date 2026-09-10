/**
 * Num — the browser's reading of a number, tested against the SHIPPED
 * eapcet-app/js/56_number.js (extract-and-evaluate, like diagnose.test.ts).
 *
 * The rules that matter: the normalisation is the corpus gate's (a ratio is a
 * fraction, superscripts are powers, − is -); an option is ONE number only
 * when a unit and nothing else follows it; a question gets the number step
 * only when its four options are four distinct numbers in the same unit; a
 * typed value matches an option within one percent and otherwise matches
 * nothing (a rounded 2.3 against 2.28 is null, never a wrong pick).
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

type NumApi = {
    normalise(s: string): string;
    parse(s: string): number | null;
    optionValue(s: string): { value: number; tail: string } | null;
    answerKind(options: string[]): 'number' | 'choice';
    matchOption(text: string, options: string[]): number | null;
};

function loadNum(): NumApi {
    const js = readFileSync(join(process.cwd(), 'eapcet-app', 'js', '56_number.js'), 'utf8');
    expect(js.indexOf('var Num = (function () {'), '56_number.js does not define Num').toBeGreaterThan(-1);
    return new Function(`${js}\n; return Num;`)() as NumApi;
}

const Num = loadNum();

describe('normalise — the corpus gate\'s reading', () => {
    it('maps the minus sign, the times sign and a ratio colon, and drops spaces', () => {
        expect(Num.normalise('−2 × 10⁻³ m')).toBe('-2x10^-3m');
        expect(Num.normalise('3 : 4')).toBe('3/4');
        expect(Num.normalise('16 ms⁻¹')).toBe('16ms^-1');
        expect(Num.normalise('5 m/s² and 10 m')).toBe('5m/s^2and10m');
    });
});

describe('parse — what a student typed', () => {
    it('reads a plain number, a decimal, a fraction, a power of ten', () => {
        expect(Num.parse('36')).toBe(36);
        expect(Num.parse('2.28 m/s')).toBeCloseTo(2.28);
        expect(Num.parse(' 4/5 ')).toBeCloseTo(0.8);
        expect(Num.parse('4×10³')).toBe(4000);
        expect(Num.parse('4x10^3 m')).toBe(4000);
        expect(Num.parse('-2')).toBe(-2);
    });
    it('reads nothing from words, an empty string, or a symbolic answer', () => {
        expect(Num.parse('')).toBeNull();
        expect(Num.parse('no idea')).toBeNull();
        expect(Num.parse('−2av³')).toBe(-2);          // a student may type this; the OPTION rule below rejects it
        expect(Num.parse('(A) is false but (R) is true')).toBeNull();
    });
});

describe('optionValue — an option that IS one number', () => {
    it('accepts a number followed by a unit only', () => {
        expect(Num.optionValue('2.28 m/s')!.value).toBeCloseTo(2.28);
        expect(Num.optionValue('16 ms⁻¹')!.value).toBe(16);
        expect(Num.optionValue('101 s')!.value).toBe(101);
        expect(Num.optionValue('36')!.value).toBe(36);
        expect(Num.optionValue('3 : 4')!.value).toBeCloseTo(0.75);
        expect(Num.optionValue('4/9')!.value).toBeCloseTo(4 / 9);
    });
    it('rejects a compound answer, a triple ratio, and a plain statement', () => {
        expect(Num.optionValue('5 m/s² and 10 m')).toBeNull();
        expect(Num.optionValue('1:3:5')).toBeNull();
        expect(Num.optionValue('(A) is true, (R) is true')).toBeNull();
    });
});

describe('answerKind — which questions ask for the number first', () => {
    it('is number for four distinct values in one unit', () => {
        expect(Num.answerKind(['2.28 m/s', '4.94 m/s', '3.34 m/s', '4.12 m/s'])).toBe('number');
        expect(Num.answerKind(['0.8 s', '1.6 s', '1.0 s', '0.2 s'])).toBe('number');
        expect(Num.answerKind(['9', '36', '25', '49'])).toBe('number');
        expect(Num.answerKind(['32 ms⁻¹', '12 ms⁻¹', '16 ms⁻¹', '8 ms⁻¹'])).toBe('number');
        expect(Num.answerKind(['3 : 4', '1 : 1', '2 : 1', '3 : 2'])).toBe('number');
        expect(Num.answerKind(['2/3', '1/3', '4/5', '4/9'])).toBe('number');
    });
    it('is choice for a compound, a symbolic form, a triple ratio, mixed units, or a repeated value', () => {
        expect(Num.answerKind(['5 m/s² and 10 m', '5 m/s² and 5 m', '5 m/s² and 6 m', '6 m/s² and 5 m'])).toBe('choice');
        expect(Num.answerKind(['−2abv²', '2bv³', '−2av³', '2av²'])).toBe('choice');
        expect(Num.answerKind(['1:1:1', '1:3:5', '1:2:3', '1:4:9'])).toBe('choice');
        expect(Num.answerKind(['2 m', '2 cm', '4 m', '8 m'])).toBe('choice');
        expect(Num.answerKind(['2 m', '2.01 m', '4 m', '8 m'])).toBe('choice');
        expect(Num.answerKind(['(A) is true', '(A) is false', '(R) is true', '(R) is false'])).toBe('choice');
    });
});

describe('matchOption — the typed number against the options', () => {
    const OPTS = ['2.28 m/s', '4.94 m/s', '3.34 m/s', '4.12 m/s'];
    it('finds the option within one percent, with or without the unit', () => {
        expect(Num.matchOption('2.28', OPTS)).toBe(1);
        expect(Num.matchOption('2.28 m/s', OPTS)).toBe(1);
        expect(Num.matchOption('4.12', OPTS)).toBe(4);
        expect(Num.matchOption('4.13', OPTS)).toBe(4);
    });
    it('matches a value rounded within one percent, and nothing beyond it, a different number, or no number', () => {
        expect(Num.matchOption('2.3', OPTS)).toBe(1);          // 2.3 is within 1% of 2.28
        expect(Num.matchOption('2.4', OPTS)).toBeNull();
        expect(Num.matchOption('4.56', OPTS)).toBeNull();
        expect(Num.matchOption('', OPTS)).toBeNull();
        expect(Num.matchOption('I do not know', OPTS)).toBeNull();
    });
    it('reads a ratio typed either way', () => {
        expect(Num.matchOption('3:4', ['3 : 4', '1 : 1', '2 : 1', '3 : 2'])).toBe(1);
        expect(Num.matchOption('0.75', ['3 : 4', '1 : 1', '2 : 1', '3 : 2'])).toBe(1);
    });
});
