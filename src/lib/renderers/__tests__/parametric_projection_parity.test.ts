import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PARAMETRIC_STATE_FIELDS } from '../parametric_renderer';

// Projection-parity gate (engine_bug_queue:
// review_site_private_config_assembler_drops_variable_choreography).
//
// The teacher review site shipped DEAD choreography while tsc, the validator,
// THE EYE and three eye-walker passes all stayed green, because a private
// assembler hand-picked per-state fields and dropped one the renderer reads.
// The fix that closed that half then hard-coded "the renderer reads exactly
// four per-state fields" — while the renderer reads FIVE (variable_overrides
// is read off a binding named `state`, not `stateData`, so a scan keyed on one
// binding name misses it). This test extracts the read set from the renderer
// SOURCE by finding every binding of PM_config.states[...] and scanning that
// binding's own scope window, then asserts it equals PARAMETRIC_STATE_FIELDS.

const ROOT = process.cwd();
const read = (rel: string): string => readFileSync(join(ROOT, ...rel.split('/')), 'utf-8');

const RENDERER = 'src/lib/renderers/parametric_renderer.ts';

// Fields the renderer template WRITES onto synthetic state objects without
// ever reading them back (the deep-dive inline path writes
// choreography_sequence and nothing reads it). Writes are not part of the
// read contract this gate protects.
const WRITE_ONLY_DECOYS = new Set(['choreography_sequence']);

// Chars of source scanned after each `... = PM_config.states[...]` binding for
// `<binding>.<field>` reads. Every real read sits within ~20 lines of its
// binding; the window is generous so a moved read stays covered.
const SCOPE_WINDOW = 5000;

function extractPerStateReads(source: string): Set<string> {
    const fields = new Set<string>();
    for (const m of source.matchAll(/PM_config\.states\[[^\]]+\]\s*\.\s*(\w+)/g)) {
        fields.add(m[1]);
    }
    for (const m of source.matchAll(/(?:var|const|let)\s+(\w+)\s*=\s*[^;\n]*?PM_config\.states\[/g)) {
        const binding = m[1];
        const windowText = source.slice(m.index ?? 0, (m.index ?? 0) + SCOPE_WINDOW);
        const readRe = new RegExp(String.raw`\b${binding}\s*\.\s*(\w+)`, 'g');
        for (const r of windowText.matchAll(readRe)) fields.add(r[1]);
    }
    for (const d of WRITE_ONLY_DECOYS) fields.delete(d);
    return fields;
}

describe('parametric per-state projection parity', () => {
    it('the renderer read set equals PARAMETRIC_STATE_FIELDS (the oracle)', () => {
        const reads = extractPerStateReads(read(RENDERER));
        expect([...reads].sort()).toEqual([...PARAMETRIC_STATE_FIELDS].sort());
    });

    it('the oracle pins both halves of the original incident', () => {
        expect(PARAMETRIC_STATE_FIELDS).toContain('variable_choreography');
        expect(PARAMETRIC_STATE_FIELDS).toContain('variable_overrides');
    });

    it('the shared assembler passes whole state objects through', () => {
        const shared = read('src/scripts/lib/buildParametricConfig.ts');
        expect(shared).toContain('{ ...st');
    });
});

describe('every parametric surface assembles via the shared builder', () => {
    // The board admin page (test-friction-static-kinetic-board) is exempt by
    // design: it substitutes accumulated board derivation primitives for the
    // scenes — a content transform, not a projection of the same content.
    const SURFACES: Array<{ file: string; importPath: string }> = [
        { file: 'src/scripts/build_review_site.ts', importPath: './lib/buildParametricConfig' },
        { file: 'src/lib/aiSimulationGenerator.ts', importPath: '@/scripts/lib/buildParametricConfig' },
        { file: 'src/app/admin/test-scalar-vs-vector/page.tsx', importPath: '@/scripts/lib/buildParametricConfig' },
        { file: 'src/app/admin/test-vector-head-to-tail/page.tsx', importPath: '@/scripts/lib/buildParametricConfig' },
        { file: 'src/app/admin/test-newton-second-law-direction/page.tsx', importPath: '@/scripts/lib/buildParametricConfig' },
        { file: 'src/app/admin/test-friction-static-kinetic/page.tsx', importPath: '@/scripts/lib/buildParametricConfig' },
    ];

    // The signature line of a hand-picked per-state projection: rebuilding the
    // states map field-by-field from an epic_l_path state binding.
    const HAND_PICK_IDIOM = /scene_composition:\s*(?:st|s)\.scene_composition/;

    for (const { file, importPath } of SURFACES) {
        it(`${file} imports the shared builder and keeps no private projection`, () => {
            const source = read(file);
            expect(source).toContain(importPath);
            expect(source).not.toMatch(HAND_PICK_IDIOM);
        });
    }
});
