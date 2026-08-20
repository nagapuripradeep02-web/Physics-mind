/**
 * MOTION-REGISTRY AUDIT — which concepts' motion gate (D5) never actually runs.
 *
 * WHY (2026-08-12, following the electric_potential_point_charge root-cause in
 * PROGRESS.md): deriveMotionExpectations() is a per-scenario branch chain. When a
 * scenario_type has NO branch, every state's expectation is `undefined`, and that
 * ONE gap does two harmful things at once:
 *
 *   1. THE EYE's D5 (motion declared but pixels never move) SKIPS the state — and
 *      visual_eyes aggregates skips into the headline pass count, so a concept
 *      whose motion gate has never executed reports a perfect green.
 *   2. visual_approve computes `compare: !(<expectation> === true)`, so an
 *      `undefined` expectation sets live-compare TRUE on a state that visibly
 *      animates — a baseline that cannot reproduce, i.e. permanent H2 noise.
 *
 * This script reports, per concept, the motion map derived from the SAME source
 * THE EYE uses (`loadConceptJson`), the scenario_type, and — where a baselines
 * manifest exists — which animated-but-unregistered states already carry
 * compare:true. No DB, no browser, $0, seconds to run.
 *
 * Usage:
 *   npm run check:motion-registry              # baseline-locked fleet (default)
 *   npm run check:motion-registry -- --all     # every concept JSON on disk
 *   npm run check:motion-registry -- <id> ...  # named concepts only
 */
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { deriveStateIds } from '@/lib/validators/visual/deriveStateIds';
import { deriveMotionExpectations, describeScenario } from '@/lib/validators/visual/deriveStateMeta';
import { resolveConceptJsonPath } from './lib/resolveConceptJson';

interface Row {
    conceptId: string;
    subject: string;
    family: string;
    scenarioType: string;
    states: number;
    unknown: string[];
    declaredTrue: number;
    declaredFalse: number;
    /** animated-looking states that the manifest live-compares (compare !== false) */
    liveComparedUnknown: string[];
    hasManifest: boolean;
}

function asObj(v: unknown): Record<string, unknown> | null {
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

/**
 * Renderer family + scenario_type. Uses the SAME resolver the gates use
 * (describeScenario in deriveStateMeta) so this audit can never disagree with
 * what THE EYE prints for the same concept — a second private copy of the
 * classification would be a way for the audit to be quietly wrong.
 */
function classify(json: Record<string, unknown>): { family: string; scenarioType: string } {
    const label = describeScenario(json);
    const slash = label.indexOf(' / ');
    if (slash < 0) return { family: label, scenarioType: '(none)' };
    return { family: label.slice(0, slash), scenarioType: label.slice(slash + 3) };
}

function readManifest(conceptId: string): Record<string, { compare?: boolean; compare_frozen?: boolean }> | null {
    const p = join(process.cwd(), 'visual_baselines', conceptId, 'baselines.json');
    if (!existsSync(p)) return null;
    try {
        const m = JSON.parse(readFileSync(p, 'utf-8')) as Record<string, unknown>;
        const states = asObj(m.states);
        return (states as Record<string, { compare?: boolean; compare_frozen?: boolean }>) ?? null;
    } catch {
        return null;
    }
}

function auditOne(conceptId: string): Row | null {
    const resolved = resolveConceptJsonPath(conceptId);
    if (!resolved) return null;
    let json: Record<string, unknown>;
    try {
        json = JSON.parse(readFileSync(resolved.path, 'utf-8')) as Record<string, unknown>;
    } catch {
        return null;
    }

    const stateIds = deriveStateIds(json);
    const motion = deriveMotionExpectations(json);
    const { family, scenarioType } = classify(json);

    const unknown = stateIds.filter(s => motion[s] === undefined);
    const manifest = readManifest(conceptId);
    const liveComparedUnknown = manifest
        ? unknown.filter(s => manifest[s] && manifest[s].compare !== false)
        : [];

    return {
        conceptId,
        subject: resolved.subject,
        family,
        scenarioType,
        states: stateIds.length,
        unknown,
        declaredTrue: stateIds.filter(s => motion[s] === true).length,
        declaredFalse: stateIds.filter(s => motion[s] === false).length,
        liveComparedUnknown,
        hasManifest: !!manifest,
    };
}

function baselineLockedIds(): string[] {
    const dir = join(process.cwd(), 'visual_baselines');
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort();
}

function allConceptIds(): string[] {
    const out = new Set<string>();
    for (const segs of [['src', 'data', 'concepts'], ['src', 'data', 'concepts', 'chemistry'], ['src', 'data', 'concepts', 'mathematics']]) {
        const dir = join(process.cwd(), ...segs);
        if (!existsSync(dir)) continue;
        for (const f of readdirSync(dir)) if (f.endsWith('.json')) out.add(f.slice(0, -5));
    }
    return [...out].sort();
}

function main(): void {
    const args = process.argv.slice(2).filter(a => a.trim().length > 0);
    const all = args.includes('--all');
    // --budget <N> consumes BOTH tokens — the bare number would otherwise fall
    // through to `named` below and be audited as a concept id.
    let budget: number | null = null;
    const budgetIdx = args.indexOf('--budget');
    if (budgetIdx !== -1) {
        const v = Number(args[budgetIdx + 1]);
        if (!Number.isFinite(v) || v < 0) {
            console.error('--budget requires a non-negative number, e.g. --budget 344');
            process.exit(2);
        }
        budget = v;
        args.splice(budgetIdx, 2);
    }
    const named = args.filter(a => !a.startsWith('--'));
    const ids = named.length > 0 ? named : all ? allConceptIds() : baselineLockedIds();

    console.log(`\n🔎 MOTION-REGISTRY AUDIT — ${ids.length} concept(s), source = concept JSON (same as THE EYE)\n`);

    const rows: Row[] = [];
    const missing: string[] = [];
    for (const id of ids) {
        const r = auditOne(id);
        if (!r) { missing.push(id); continue; }
        rows.push(r);
    }

    const fully = rows.filter(r => r.unknown.length === r.states && r.states > 0);
    const partial = rows.filter(r => r.unknown.length > 0 && r.unknown.length < r.states);
    const clean = rows.filter(r => r.unknown.length === 0 && r.states > 0);
    const noStates = rows.filter(r => r.states === 0);

    const pad = (s: string, n: number) => (s.length >= n ? s : s + ' '.repeat(n - s.length));

    const printGroup = (label: string, group: Row[]) => {
        if (group.length === 0) return;
        console.log(`\n${label} (${group.length})`);
        console.log(`  ${pad('concept', 44)}${pad('family', 16)}${pad('scenario_type', 34)}${pad('states', 8)}unknown`);
        for (const r of [...group].sort((a, b) => (a.scenarioType + a.conceptId).localeCompare(b.scenarioType + b.conceptId))) {
            const flag = r.liveComparedUnknown.length > 0 ? `  ⚠ live-compare ON: ${r.liveComparedUnknown.join(',')}` : '';
            console.log(`  ${pad(r.conceptId, 44)}${pad(r.family, 16)}${pad(r.scenarioType, 34)}${pad(String(r.states), 8)}${r.unknown.length}${flag}`);
        }
    };

    printGroup('❌ D5 NEVER RUNS — every state unknown', fully);
    printGroup('⚠ D5 PARTIAL — some states unknown', partial);

    // scenario_type rollup: the actual registration work-list.
    const byScenario = new Map<string, { concepts: string[]; unknownStates: number; totalStates: number }>();
    for (const r of [...fully, ...partial]) {
        const key = `${r.family} / ${r.scenarioType}`;
        const e = byScenario.get(key) ?? { concepts: [], unknownStates: 0, totalStates: 0 };
        e.concepts.push(r.conceptId);
        e.unknownStates += r.unknown.length;
        e.totalStates += r.states;
        byScenario.set(key, e);
    }
    if (byScenario.size > 0) {
        console.log('\n📋 UNREGISTERED / PARTIAL scenario_types — the registration work-list');
        for (const [k, v] of [...byScenario.entries()].sort((a, b) => b[1].unknownStates - a[1].unknownStates)) {
            console.log(`  ${pad(k, 52)}${v.unknownStates}/${v.totalStates} states unknown across ${v.concepts.length}: ${v.concepts.join(', ')}`);
        }
    }

    const liveRisk = rows.filter(r => r.liveComparedUnknown.length > 0);
    if (liveRisk.length > 0) {
        console.log(`\n🚨 BASELINE RISK — unknown-expectation states with live compare ON (${liveRisk.length} concept(s))`);
        for (const r of liveRisk) console.log(`  ${pad(r.conceptId, 44)}${r.liveComparedUnknown.join(', ')}`);
    }

    if (noStates.length > 0) console.log(`\nℹ  0 states derived (legacy/bundle shape): ${noStates.map(r => r.conceptId).join(', ')}`);
    if (missing.length > 0) console.log(`\nℹ  no concept JSON on disk: ${missing.join(', ')}`);

    const totalStates = rows.reduce((n, r) => n + r.states, 0);
    const totalUnknown = rows.reduce((n, r) => n + r.unknown.length, 0);
    console.log(
        `\n── SUMMARY ──\n` +
        `  concepts audited      ${rows.length}\n` +
        `  fully unregistered    ${fully.length}\n` +
        `  partially registered  ${partial.length}\n` +
        `  fully registered      ${clean.length}\n` +
        `  states               ${totalStates} total · ${totalUnknown} unknown (${totalStates ? ((100 * totalUnknown) / totalStates).toFixed(1) : '0'}%) — D5 skips these\n` +
        `  baseline risk         ${liveRisk.length} concept(s) live-comparing an unknown state\n`,
    );

    if (budget !== null) {
        if (totalUnknown > budget) {
            console.error(
                `❌ MOTION-REGISTRY RATCHET — ${totalUnknown} unknown state(s) exceeds the budget of ${budget} ` +
                `(+${totalUnknown - budget}). A scenario shipped without registering in deriveMotionExpectations. ` +
                `Register it (deriveStateMeta.ts) — or, only as a conscious decision, raise the budget in verify.yml.`,
            );
            process.exit(1);
        }
        console.log(`  ratchet               ${totalUnknown} unknown ≤ budget ${budget} ✓\n`);
    }
}

main();
