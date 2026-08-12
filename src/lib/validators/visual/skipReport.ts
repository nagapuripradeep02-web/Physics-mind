/**
 * Skip accounting for the visual gates — the one place that decides how a
 * check-that-never-ran is reported.
 *
 * WHY THIS FILE EXISTS (engine_bug_queue:
 * eye_gate_skipped_for_an_unregistered_scenario_is_counted_as_a_pass, OPEN):
 * every skip emits `passed: true` so the gate fails CLOSED on missing inputs —
 * correct. But both CLI reporters then computed "passed = total - failed", so a
 * run in which the motion gate never executed once printed a perfect green.
 * Measured twice: lines_and_planes_in_space's first run ("39 checks · 39 passed ·
 * 0 failed", nine of them skips), and the 2026-08-12 registry audit — 344 of 653
 * baseline-locked states (52.7%) carry an unknown motion expectation, so D5 has
 * never run on 41 concepts, every one of them reporting clean.
 *
 * A skip is not evidence. This module makes that visible in one line and in a
 * per-check breakdown, and names the specific case where the gap swallows a
 * concept's entire motion coverage.
 */
import type { CheckResult } from './spec';

export interface SkipTally {
    total: number;
    failed: number;
    /** Checks that never executed (CheckResult.skipped). */
    skipped: number;
    /** Checks that ran and passed — the only number that means anything. */
    passed: number;
}

export function tally(results: CheckResult[]): SkipTally {
    const failed = results.filter(r => !r.passed).length;
    const skipped = results.filter(r => r.skipped === true).length;
    return { total: results.length, failed, skipped, passed: results.length - failed - skipped };
}

/** `47 checks · 30 ran and passed · 17 SKIPPED (never ran) · 0 failed` */
export function tallyLine(t: SkipTally): string {
    return `${t.total} deterministic checks · ${t.passed} ran and passed · `
        + `${t.skipped} ${t.skipped > 0 ? 'SKIPPED (never ran)' : 'skipped'} · ${t.failed} failed`;
}

/**
 * Grouped breakdown of every skipped check: one line per (check_id, reason),
 * with the state list. Reason = the evidence up to the first colon/parenthesis,
 * so "no approved baseline for STATE_3" and "…for STATE_4" collapse into one row.
 */
export function skipBreakdown(results: CheckResult[]): string[] {
    const skips = results.filter(r => r.skipped === true);
    if (skips.length === 0) return [];
    const groups = new Map<string, { checkId: string; reason: string; states: string[] }>();
    for (const r of skips) {
        const reason = normalizeReason(r.evidence, r.state_id);
        const key = `${r.check_id}::${reason}`;
        const g = groups.get(key) ?? { checkId: r.check_id, reason, states: [] };
        g.states.push(r.state_id);
        groups.set(key, g);
    }
    return [...groups.values()]
        .sort((a, b) => b.states.length - a.states.length || a.checkId.localeCompare(b.checkId))
        .map(g => `  ⊘ ${g.checkId} × ${g.states.length} — ${g.reason}  [${g.states.join(', ')}]`);
}

function normalizeReason(evidence: string, stateId: string): string {
    let r = evidence.replace(/^Skipped\s*[—-]\s*/, '');
    // Fold the per-state id out so identical reasons group.
    r = r.split(stateId).join('<state>');
    // First sentence only — the long D5 explanation carries its own guidance.
    const cut = r.indexOf('. ');
    if (cut > 0) r = r.slice(0, cut);
    if (r.length > 150) r = `${r.slice(0, 150)}…`;
    return r.replace(/\s+/g, ' ').trim();
}

/**
 * The specific gap worth shouting about: D5 skipped on EVERY state that had a
 * dense series, i.e. this concept has zero motion-gate coverage. Returns null
 * when at least one state's motion was actually enforced.
 */
export function motionGateBlackout(results: CheckResult[], scenarioLabel?: string): string | null {
    const d5 = results.filter(r => r.check_id === 'D5');
    if (d5.length === 0) return null;
    const ran = d5.filter(r => r.skipped !== true);
    if (ran.length > 0) return null;
    const unknown = d5.filter(r => /UNKNOWN/i.test(r.evidence)).length;
    if (unknown === 0) return null;     // every state legitimately declared static
    return `🚨 MOTION GATE NEVER RAN — D5 skipped on ALL ${d5.length} state(s) `
        + `(${unknown} with an UNKNOWN motion expectation)`
        + `${scenarioLabel ? ` — UNCLASSIFIED SCENARIO: ${scenarioLabel}` : ''}. `
        + `This concept has ZERO automated motion coverage: `
        + `a state whose animation is dead would report exactly the same green as one that works. `
        + `Register the scenario in deriveMotionExpectations, and see the fleet picture with `
        + `npm run check:motion-registry.`;
}

/** One-line verdict that cannot read as "clean" while checks are missing. */
export function verdictLine(t: SkipTally, cleanMessage: string): string {
    if (t.failed > 0) return '❌ Deterministic failures above — fix before any founder review.\n';
    if (t.skipped > 0) {
        return `⚠️  No failures — but ${t.skipped} check(s) NEVER RAN (see gate coverage above). `
            + `Not the same as clean. Then Read the frames — the eye is the gate the machine cannot replace.\n`;
    }
    return cleanMessage;
}
