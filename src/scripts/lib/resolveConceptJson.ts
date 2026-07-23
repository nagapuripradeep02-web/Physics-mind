/**
 * Shared concept-JSON path resolver for CLI scripts (2026-07-23,
 * CHEMISTRY_BUILD_PLAN.md Phase 2.5).
 *
 * Subject routing for the SCRIPTS layer: physics concepts live flat in
 * src/data/concepts/; chemistry concepts live ONLY in src/data/concepts/chemistry/
 * (isolation contract — docs/CHEMISTRY_ARCHITECTURE.md §7). The flat path is
 * checked FIRST, so physics resolution is byte-identical to the historical
 * behaviour; the resolver logs only when a concept resolves from the chemistry
 * namespace (kills the silent-degradation trap where a subfolder concept's
 * metadata quietly went missing from THE EYE's Category I/E checks).
 *
 * App-layer sibling: `sourcesFor(subject)` in src/lib/conceptCatalog.ts (not
 * reused here — its loader gates on CONCEPT_PANEL_MAP, wrong for the
 * registration-free review/verify path these scripts serve).
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export type ConceptSubject = 'physics' | 'chemistry';

export interface ResolvedConceptJson {
    path: string;
    subject: ConceptSubject;
}

export function resolveConceptJsonPath(conceptId: string): ResolvedConceptJson | null {
    const flat = join(process.cwd(), 'src', 'data', 'concepts', `${conceptId}.json`);
    if (existsSync(flat)) return { path: flat, subject: 'physics' };

    const chem = join(process.cwd(), 'src', 'data', 'concepts', 'chemistry', `${conceptId}.json`);
    if (existsSync(chem)) {
        console.log(`[concept-resolver] "${conceptId}" → chemistry namespace (src/data/concepts/chemistry/)`);
        return { path: chem, subject: 'chemistry' };
    }

    return null;
}
