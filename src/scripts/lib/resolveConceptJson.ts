/**
 * Shared concept-JSON path resolver for CLI scripts (2026-07-23,
 * CHEMISTRY_BUILD_PLAN.md Phase 2.5; widened from a hard-coded 2-way check to an
 * N-way one 2026-08-04, MATHEMATICS_BUILD_PLAN.md Phase 1).
 *
 * Subject routing for the SCRIPTS layer: physics concepts live flat in
 * src/data/concepts/; chemistry concepts live ONLY in src/data/concepts/chemistry/
 * and mathematics concepts ONLY in src/data/concepts/mathematics/ (isolation
 * contract — docs/CHEMISTRY_ARCHITECTURE.md §7, docs/MATHEMATICS_ARCHITECTURE.md §5).
 * The flat path is checked FIRST, so physics resolution is byte-identical to the
 * historical behaviour; the resolver logs only when a concept resolves from a
 * subfolder namespace (kills the silent-degradation trap where a subfolder
 * concept's metadata quietly went missing from THE EYE's Category I/E checks).
 *
 * App-layer sibling: `sourcesFor(subject)` in src/lib/conceptCatalog.ts (not
 * reused here — its loader gates on CONCEPT_PANEL_MAP, wrong for the
 * registration-free review/verify path these scripts serve).
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export type ConceptSubject = 'physics' | 'chemistry' | 'mathematics';

export interface ResolvedConceptJson {
    path: string;
    subject: ConceptSubject;
}

/**
 * Candidate namespaces in PRECEDENCE ORDER. Physics (the flat dir) stays first so
 * its resolution is unchanged; each subfolder subject appends.
 *
 * Adding a subject = adding a row here, and nothing else in this file is
 * per-subject. That is the point of the 2026-08-04 widening: the previous version
 * hard-coded the collision check to exactly one pair (flat vs chemistry), so a
 * third namespace would have silently reintroduced the precedence bug the check
 * exists to prevent — a mathematics/chemistry collision would not have been
 * caught at all.
 */
const NAMESPACES: ReadonlyArray<{ subject: ConceptSubject; segments: string[] }> = [
    { subject: 'physics', segments: ['src', 'data', 'concepts'] },
    { subject: 'chemistry', segments: ['src', 'data', 'concepts', 'chemistry'] },
    { subject: 'mathematics', segments: ['src', 'data', 'concepts', 'mathematics'] },
];

export function resolveConceptJsonPath(conceptId: string): ResolvedConceptJson | null {
    const hits: ResolvedConceptJson[] = [];
    for (const ns of NAMESPACES) {
        const path = join(process.cwd(), ...ns.segments, `${conceptId}.json`);
        if (existsSync(path)) hits.push({ path, subject: ns.subject });
    }

    // CONCEPT IDS ARE ONE NAMESPACE ACROSS ALL SUBJECTS, even though the
    // directories are separate — and flat-first precedence means a collision
    // resolves SILENTLY to physics. Found 2026-07-28: conceptCatalog.ts already
    // rosters a physics `dynamic_equilibrium` (the Class-11 Ch.8 mechanics
    // sense) while chemistry ships one for NCERT Ch.6. Only the chemistry file
    // exists today, so nothing misbehaves — but the day that physics JSON is
    // authored, build:review / visual:eyes / tts:generate would every one of
    // them quietly read the wrong file, render the wrong sim, and voice the
    // wrong narration, with no error anywhere.
    //
    // Mathematics RAISES this risk rather than leaving it flat: `vectors`,
    // `circle`, `limits` and `work` all have live physics senses. Hence the check
    // below is over ALL namespaces, not the single pair it was written as.
    //
    // Failing loudly is the whole fix. Renaming is a real decision (which
    // subject gets the plain name) and belongs to the architect, not to a
    // resolver — but nobody can now make that decision by accident.
    if (hits.length > 1) {
        const where = hits
            .map(h => `${h.path.replace(`${process.cwd()}/`, '')} (${h.subject})`)
            .join(' and ');
        throw new Error(
            `[concept-resolver] AMBIGUOUS concept id "${conceptId}": a JSON exists in ${hits.length} ` +
            `namespaces — ${where}. Concept ids are a single namespace across subjects; precedence ` +
            `would silently resolve this to ${hits[0].subject}. Rename all but one of them ` +
            `(architect decision) before running any tooling against this id.`,
        );
    }

    if (hits.length === 0) return null;

    const hit = hits[0];
    if (hit.subject !== 'physics') {
        console.log(`[concept-resolver] "${conceptId}" → ${hit.subject} namespace (src/data/concepts/${hit.subject}/)`);
    }
    return hit;
}
