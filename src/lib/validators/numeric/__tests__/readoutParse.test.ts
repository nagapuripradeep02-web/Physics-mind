/**
 * readoutHarvest parser tests — every string here is a REAL rendered readout
 * taken from field_3d_renderer.ts / particle_field_renderer.ts, not invented.
 */
import { describe, it, expect } from 'vitest';
import { parseReadings, toleranceFor, type RawHarvest } from '../readoutHarvest';

function dom(...texts: string[]): RawHarvest {
    return {
        dom: texts.map((t, i) => ({ where: '#el' + i, text: t })),
        canvasAll: [], canvasWin: [], sprites: [], simTimeMs: 0, currentState: 'STATE_1',
    };
}

describe('parseReadings — DOM', () => {
    it('parses the capacitance HUD (field_3d_renderer.ts:6285-6296)', () => {
        const r = parseReadings(dom('V = 12.0 V\nQ = 1.06 nC\nC = 88.5 pF'));
        expect(r.map((x) => [x.symbol, x.value, x.unitToken])).toEqual([
            ['V', 12.0, 'V'], ['Q', 1.06, 'nC'], ['C', 88.5, 'pF'],
        ]);
        expect(r[1].decimals).toBe(2);
    });

    it('parses the ohms_law readout (particle_field_renderer.ts:1099-1103)', () => {
        const r = parseReadings(dom('V = 6.00 V\ni = 1.20 A\nR = 5.00 Ω'));
        expect(r.map((x) => x.symbol)).toEqual(['V', 'i', 'R']);
        expect(r[2].unitToken).toBe('Ω');
    });

    it('takes the LAST = for the value in a chained equation (plates_readout)', () => {
        const r = parseReadings(dom('E = V / d = 1200 V/m'));
        expect(r).toHaveLength(1);
        expect(r[0].symbol).toBe('E');
        expect(r[0].value).toBe(1200);
        expect(r[0].unitToken).toBe('V/m');
    });

    it('keeps a slash symbol intact (cap_ratio_readout)', () => {
        const r = parseReadings(dom('Q/V = 0.0089 nC per volt'));
        expect(r[0].symbol).toBe('Q/V');
        expect(r[0].value).toBe(0.0089);
        expect(r[0].unitToken).toBe('nC');
        expect(r[0].unit).toBe('nC per volt');
    });

    it('takes the trailing token when the label carries prose (V-I graph slope)', () => {
        const r = parseReadings(dom('slope R = 12.5 Ω'));
        expect(r[0].symbol).toBe('R');
        expect(r[0].value).toBe(12.5);
    });

    it('handles Greek symbols, subscripts and exponent notation', () => {
        const r = parseReadings(dom(
            'Φ = 0.350 Wb',
            'ρ = 1.70e-8 Ω·m',
            'ε₀ = 12.00 V',
            'm₁ = 4 kg',
        ));
        expect(r.map((x) => x.symbol)).toEqual(['Φ', 'ρ', 'ε₀', 'm₁']);
        expect(r[0].decimals).toBe(3);
        expect(r[1].value).toBeCloseTo(1.7e-8, 12);
        expect(r[3].value).toBe(4);
    });

    it('splits the middot-delimited chip form (acg_readout)', () => {
        const r = parseReadings(dom('N 100 · B 0.50 T · A 0.010 m²'));
        expect(r.map((x) => [x.symbol, x.value])).toEqual([['N', 100], ['B', 0.5], ['A', 0.01]]);
        expect(r[2].unitToken).toBe('m²');
    });

    it('parses a negative value and a unit-less value', () => {
        const r = parseReadings(dom('a = -9.81 m/s²', 'n = 3'));
        expect(r[0].value).toBe(-9.81);
        expect(r[1].value).toBe(3);
        expect(r[1].unitToken).toBe('');
    });

    it('does NOT match prose or a placeholder dash', () => {
        const r = parseReadings(dom(
            'Same push, unequal mass',
            'R = –',
            'Drag the slider to explore',
            'Full screen',
        ));
        expect(r).toHaveLength(0);
    });
});

describe('parseReadings — canvas and sprite channels', () => {
    it('reads p5 instrument text through the fillText buffer', () => {
        const raw: RawHarvest = {
            dom: [],
            canvasWin: [{ where: 'canvas#1(900x560)', text: 'I = 1.20 A', inDom: true }],
            canvasAll: [{ where: 'canvas#1(900x560)', text: 'I = 1.20 A', inDom: true }],
            sprites: [], simTimeMs: 0, currentState: 'STATE_1',
        };
        const r = parseReadings(raw);
        expect(r).toHaveLength(1);                 // the window/all overlap is de-duped
        expect(r[0].source).toBe('canvas');
        expect(r[0].symbol).toBe('I');
    });

    it('falls back to the cumulative buffer for strings painted once at creation', () => {
        const raw: RawHarvest = {
            dom: [], canvasWin: [],
            canvasAll: [{ where: 'canvas#7(384x128)', text: 'E = 1200 V/m', inDom: false }],
            sprites: [], simTimeMs: 0, currentState: 'STATE_1',
        };
        const r = parseReadings(raw);
        expect(r).toHaveLength(1);
        expect(r[0].value).toBe(1200);
    });

    it('reads retained sprite text', () => {
        const raw: RawHarvest = {
            dom: [], canvasAll: [], canvasWin: [],
            sprites: [{ where: 'sprite:pp_point_readout_0', text: '1200' }],
            simTimeMs: 0, currentState: 'STATE_1',
        };
        // A bare number with no symbol is not a reading — probe_points sprites
        // carry the value only, so the gate reads them positionally, not here.
        expect(parseReadings(raw)).toHaveLength(0);
    });
});

describe('toleranceFor', () => {
    it('uses the relative tolerance when it is the looser bound', () => {
        expect(toleranceFor(1000, 2, 1)).toBeCloseTo(10, 9);
    });
    it('never demands better than half the last displayed decimal', () => {
        // 0.350 Wb at 1% would be 0.0035, but the display cannot resolve past 0.0005.
        expect(toleranceFor(0.350, 3, 1)).toBeCloseTo(0.0035, 9);
        // A tiny value: rounding floor dominates.
        expect(toleranceFor(0.001, 3, 1)).toBeCloseTo(0.0005, 9);
    });
    it('handles an integer display', () => {
        expect(toleranceFor(1200, 0, 1)).toBeCloseTo(12, 9);
        expect(toleranceFor(3, 0, 1)).toBeCloseTo(0.5, 9);
    });
});
