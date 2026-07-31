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
    const chem = join(process.cwd(), 'src', 'data', 'concepts', 'chemistry', `${conceptId}.json`);
    const hasFlat = existsSync(flat);
    const hasChem = existsSync(chem);

    // CONCEPT IDS ARE ONE NAMESPACE ACROSS BOTH SUBJECTS, even though the
    // directories are separate — and flat-first precedence means a collision
    // resolves SILENTLY to physics. Found 2026-07-28: conceptCatalog.ts already
    // rosters a physics `dynamic_equilibrium` (the Class-11 Ch.8 mechanics
    // sense) while chemistry ships one for NCERT Ch.6. Only the chemistry file
    // exists today, so nothing misbehaves — but the day that physics JSON is
    // authored, build:review / visual:eyes / tts:generate would every one of
    // them quietly read the wrong file, render the wrong sim, and voice the
    // wrong narration, with no error anywhere.
    //
    // Failing loudly is the whole fix. Renaming is a real decision (which
    // subject gets the plain name) and belongs to the architect, not to a
    // resolver — but nobody can now make that decision by accident.
    if (hasFlat && hasChem) {
        throw new Error(
            `[concept-resolver] AMBIGUOUS concept id "${conceptId}": a JSON exists in BOTH ` +
            `src/data/concepts/${conceptId}.json (physics) and ` +
            `src/data/concepts/chemistry/${conceptId}.json (chemistry). ` +
            `Concept ids are a single namespace across subjects; flat-first precedence would ` +
            `silently resolve this to physics. Rename one of them (architect decision) before ` +
            `running any tooling against this id.`,
        );
    }

    if (hasFlat) return { path: flat, subject: 'physics' };

    if (hasChem) {
        console.log(`[concept-resolver] "${conceptId}" → chemistry namespace (src/data/concepts/chemistry/)`);
        return { path: chem, subject: 'chemistry' };
    }

    return null;
}
