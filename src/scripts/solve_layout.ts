/**
 * Author-time layout solver for EPIC-L states.
 *
 * Loads a concept JSON, runs `solveSubSimLayout` (the same kiwi-backed solver
 * used at deep-dive runtime) against every EPIC-L state's scene_composition,
 * and reports the resolved coordinates per primitive.
 *
 * Usage:
 *   npm run solve:layout <concept_id>            # dry-run (report only)
 *   npm run solve:layout <concept_id> -- --write # write resolved coords back
 *
 * What this enables: authors can declare layout RELATIONSHIPS instead of
 * absolute pixel coordinates. Example — replace
 *
 *   { type: "annotation", id: "pascal_box", position: { x: 620, y: 240 } }
 *
 * with
 *
 *   { type: "annotation", id: "pascal_box",
 *     anchor: "CALLOUT_ZONE_R.center",  // semantic placement
 *     priority: "strong",                // hard preference
 *     gap: 16 }                          // minimum gap from siblings
 *
 * The solver figures out (x, y). Layout collisions become impossible — the
 * solver enforces non-overlap as a hard constraint.
 *
 * Today, the solver supports `anchor` / `edge` / `gap` / `align` / `avoid` /
 * `priority` / `width` / `height` / legacy `position` (demoted to weak
 * suggestion). See src/lib/constraintSchema.ts for the full vocabulary.
 */

import '@/lib/loadEnvLocal';
import fs from 'node:fs';
import path from 'node:path';
import { solveSubSimLayout } from '@/lib/subSimSolverHost';

interface ConceptShape {
    concept_id: string;
    physics_engine_config?: {
        variables?: Record<string, { default?: number; constant?: number }>;
    };
    epic_l_path?: {
        states?: Record<string, {
            scene_composition?: unknown[];
            [k: string]: unknown;
        }>;
    };
    [k: string]: unknown;
}

function defaultsFromVariables(concept: ConceptShape): Record<string, number> {
    const out: Record<string, number> = {};
    const vars = concept.physics_engine_config?.variables ?? {};
    for (const [name, spec] of Object.entries(vars)) {
        if (typeof spec?.default === 'number') out[name] = spec.default;
        else if (typeof spec?.constant === 'number') out[name] = spec.constant;
    }
    return out;
}

function parseArgs(argv: string[]): { conceptId: string | null; write: boolean } {
    let conceptId: string | null = null;
    let write = false;
    for (const a of argv.slice(2)) {
        if (a === '--write') write = true;
        else if (!a.startsWith('-')) conceptId = a;
    }
    return { conceptId, write };
}

function pluralize(n: number, label: string): string {
    return `${n} ${label}${n === 1 ? '' : 's'}`;
}

function formatPos(p: unknown): string {
    if (!p || typeof p !== 'object') return '(none)';
    const obj = p as { x?: unknown; y?: unknown };
    if (typeof obj.x === 'number' && typeof obj.y === 'number') {
        return `(${obj.x.toFixed(0)}, ${obj.y.toFixed(0)})`;
    }
    return '(none)';
}

async function main(): Promise<void> {
    const { conceptId, write } = parseArgs(process.argv);
    if (!conceptId) {
        console.error('Usage: npm run solve:layout <concept_id> [-- --write]');
        process.exit(1);
    }

    const filePath = path.resolve(process.cwd(), 'src', 'data', 'concepts', `${conceptId}.json`);
    if (!fs.existsSync(filePath)) {
        console.error(`Concept JSON not found: ${filePath}`);
        process.exit(1);
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const concept = JSON.parse(raw) as ConceptShape;
    const states = concept.epic_l_path?.states ?? {};
    const stateKeys = Object.keys(states);
    console.log(`\n🔧 Solving layout for ${conceptId} — ${pluralize(stateKeys.length, 'state')}\n`);

    // Build a ConfigLike that the solver expects (states map + default_variables).
    const configLike = {
        concept_id: concept.concept_id,
        default_variables: defaultsFromVariables(concept),
        states,
    } as unknown as Parameters<typeof solveSubSimLayout>[0];

    const result = solveSubSimLayout(configLike, { enabled: true });

    console.log('Solver result:');
    console.log(`  ran:                 ${result.ran}`);
    console.log(`  states touched:      ${result.statesTouched}`);
    console.log(`  primitives resolved: ${result.primitivesResolved}`);
    console.log(`  warnings:            ${result.warnings.length}`);
    if (result.warnings.length > 0) {
        for (const w of result.warnings.slice(0, 10)) console.log(`     - ${w}`);
        if (result.warnings.length > 10) {
            console.log(`     ... ${result.warnings.length - 10} more`);
        }
    }

    // Per-state per-primitive breakdown
    let totalSolved = 0;
    let totalSkipped = 0;
    for (const [stateId, state] of Object.entries(states)) {
        const scene = state?.scene_composition;
        if (!Array.isArray(scene)) continue;
        const lines: string[] = [];
        for (const prim of scene) {
            if (!prim || typeof prim !== 'object') continue;
            const p = prim as { id?: unknown; type?: unknown; position?: unknown; _solverPosition?: unknown; anchor?: unknown };
            const id = String(p.id ?? '(no id)');
            const type = String(p.type ?? 'unknown');
            const hadAnchor = typeof p.anchor === 'string';
            const original = formatPos(p.position);
            const resolved = formatPos(p._solverPosition);
            if (p._solverPosition) {
                lines.push(`    ${type.padEnd(14)} #${id.padEnd(22)} ${hadAnchor ? '[anchor]' : '[pixel] '} ${original} → ${resolved}`);
                totalSolved++;
            } else {
                lines.push(`    ${type.padEnd(14)} #${id.padEnd(22)} ${hadAnchor ? '[anchor]' : '[pixel] '} ${original} (skipped — no constraints to solve)`);
                totalSkipped++;
            }
        }
        if (lines.length > 0) {
            console.log(`\n  ${stateId}:`);
            for (const l of lines) console.log(l);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Resolved: ${totalSolved}   Skipped: ${totalSkipped}`);

    if (totalSolved === 0) {
        console.log('\nNothing to solve. Every primitive uses absolute pixel coordinates.');
        console.log('To engage the solver, replace `position: {x, y}` with anchor/edge/gap fields.');
        console.log('See src/lib/constraintSchema.ts for the vocabulary, or json_author CLAUDE.md §M.');
        return;
    }

    if (write) {
        // Write resolved coordinates back into `position` so the renderer (which
        // uses `position` directly) picks them up without runtime solver.
        for (const state of Object.values(states)) {
            const scene = state?.scene_composition;
            if (!Array.isArray(scene)) continue;
            for (const prim of scene) {
                if (!prim || typeof prim !== 'object') continue;
                const p = prim as { _solverPosition?: { x?: number; y?: number }; position?: unknown };
                if (p._solverPosition && typeof p._solverPosition.x === 'number' && typeof p._solverPosition.y === 'number') {
                    p.position = { x: Math.round(p._solverPosition.x), y: Math.round(p._solverPosition.y) };
                    delete (p as { _solverPosition?: unknown })._solverPosition;
                }
            }
        }
        fs.writeFileSync(filePath, JSON.stringify(concept, null, 2) + '\n');
        console.log(`\n✅ Wrote resolved coordinates back to ${path.relative(process.cwd(), filePath)}`);
    } else {
        console.log('\n(dry run — pass `-- --write` to bake resolved coords into the JSON)');
    }
}

main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
