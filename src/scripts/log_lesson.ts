/**
 * log:lesson — durable intake for professor / founder / authoring lessons into
 * engine_bug_queue (AUTHORING_PIPELINE.md: "the professor's feedback is ALSO
 * logged to the queue with a prevention_rule, so each lesson protects every
 * FUTURE concept, not just this one").
 *
 * Upserts by bug_class: existing row → appends the concept to
 * concepts_affected and refreshes title/prevention_rule when provided; new
 * bug_class → inserts with probe_type='manual'.
 *
 * --prevention-rule is REQUIRED (NOT NULL column, and the whole point: a
 * lesson without a prevention rule does not compound).
 *
 * Usage:
 *   npm run log:lesson -- \
 *     --bug-class FLEMING_SCOPE_UNSTATED \
 *     --title "Fleming overlay shown without its +q / 90° scope caveat" \
 *     --severity MODERATE \
 *     --owner alex:json_author \
 *     --root-cause "Authored the Class-10 mnemonic panel without stating its limits." \
 *     --prevention-rule "Any Fleming overlay must state: works for +q only; right-hand rule stays canonical." \
 *     [--concept magnetic_force_moving_charge] \
 *     [--probe-logic "manual review during professor gate"]
 */

// MUST be the first import.
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const VALID_SEVERITIES = ['CRITICAL', 'MAJOR', 'MODERATE'] as const;
const VALID_OWNERS = [
    'alex:architect', 'alex:physics_author', 'alex:json_author',
    'peter_parker:renderer_primitives', 'peter_parker:runtime_generation',
    'peter_parker:visual_validator', 'ambiguous',
] as const;

function parseArgs(argv: string[]): Map<string, string> {
    const out = new Map<string, string>();
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a.startsWith('--')) {
            const key = a.slice(2);
            const next = argv[i + 1];
            if (next !== undefined && !next.startsWith('--')) {
                out.set(key, next);
                i++;
            } else {
                out.set(key, 'true');
            }
        }
    }
    return out;
}

function fail(message: string): never {
    console.error(`\n❌ ${message}\n`);
    process.exit(1);
}

async function main(): Promise<void> {
    const args = parseArgs(process.argv.slice(2));

    const bugClass = args.get('bug-class')?.trim();
    const preventionRule = args.get('prevention-rule')?.trim();
    if (!bugClass) fail('--bug-class is required (UPPER_SNAKE_CASE, e.g. FLEMING_SCOPE_UNSTATED).');
    if (!preventionRule) {
        fail('--prevention-rule is required. A lesson without a prevention rule does not compound — '
            + 'write the rule that stops this class of mistake on every future concept.');
    }

    const severity = (args.get('severity') ?? 'MODERATE').toUpperCase();
    if (!VALID_SEVERITIES.includes(severity as typeof VALID_SEVERITIES[number])) {
        fail(`--severity must be one of ${VALID_SEVERITIES.join(' | ')}.`);
    }
    const owner = args.get('owner') ?? 'alex:json_author';
    if (!VALID_OWNERS.includes(owner as typeof VALID_OWNERS[number])) {
        fail(`--owner must be one of:\n  ${VALID_OWNERS.join('\n  ')}`);
    }

    const title = args.get('title') ?? bugClass.replaceAll('_', ' ').toLowerCase();
    const rootCause = args.get('root-cause') ?? 'Captured via log:lesson — see prevention_rule.';
    const probeLogic = args.get('probe-logic') ?? 'manual review — see prevention_rule';
    const concept = args.get('concept')?.trim();

    interface ExistingRow {
        bug_class: string;
        concepts_affected: string[] | null;
        status: string;
    }

    const { data: existing, error: selectError } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('bug_class, concepts_affected, status')
        .eq('bug_class', bugClass)
        .maybeSingle<ExistingRow>();
    if (selectError) fail(`engine_bug_queue query failed: ${selectError.message}`);

    if (existing) {
        const current = existing.concepts_affected ?? [];
        const next = concept && !current.includes(concept) ? [...current, concept] : current;
        const { error } = await supabaseAdmin
            .from('engine_bug_queue')
            .update({
                title,
                prevention_rule: preventionRule,
                concepts_affected: next,
                updated_at: new Date().toISOString(),
            })
            .eq('bug_class', bugClass);
        if (error) fail(`update failed: ${error.message}`);
        console.log(`\n✅ Updated existing lesson ${bugClass}`);
        console.log(`   concepts_affected: ${next.join(', ') || '(none)'}`);
    } else {
        const { error } = await supabaseAdmin
            .from('engine_bug_queue')
            .insert({
                bug_class: bugClass,
                title,
                severity,
                owner_cluster: owner,
                root_cause: rootCause,
                prevention_rule: preventionRule,
                probe_type: 'manual',
                probe_logic: probeLogic,
                status: 'OPEN',
                concepts_affected: concept ? [concept] : [],
                discovered_in_session: `log_lesson_${new Date().toISOString().slice(0, 10)}`,
            });
        if (error) fail(`insert failed: ${error.message}`);
        console.log(`\n✅ Logged new lesson ${bugClass} (${severity}, owner ${owner})`);
    }

    console.log(`   prevention_rule: ${preventionRule}\n`);
}

main().catch(err => {
    console.error('\n💥 log:lesson crashed:', err instanceof Error ? err.stack : err);
    process.exit(2);
});
