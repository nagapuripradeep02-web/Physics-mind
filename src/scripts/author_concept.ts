/**
 * Phase-2 auto-repair retry harness — v2 (tool-use, session 55).
 *
 * Drives the JSON authoring loop autonomously: take a concept_id, expose a
 * `string_replace` tool to Claude Sonnet 4.6, let Sonnet fix one defect at a
 * time. Validate after Sonnet finishes its turn; retry up to N outer
 * attempts if defects remain.
 *
 * Why tool-use vs full-JSON-rewrite (v1, retired 2026-05-05):
 *   v1 had Sonnet emit the entire repaired JSON each turn. For a 70 KB
 *   concept like pressure_scalar that's ~20k output tokens — Sonnet hit the
 *   max_tokens ceiling, stream timeouts, AND introduced unrelated
 *   regressions (changing schema_version, etc.) because rewriting a long
 *   file invites collateral edits. Tool-use bounds output to the diff:
 *   typically <100 tokens per fix, no collateral changes possible.
 *
 *   PASS  → write to src/data/concepts/<id>.json
 *   FAIL  → write candidate to src/data/concepts/<id>.json.candidate +
 *           append to tmp/authoring_queue.json with status='needs_review'
 *
 * Phase 2 keeps the queue local-file (no Supabase migration). Phase 3 moves
 * it to a Supabase table when the batch runner needs persistence.
 *
 * Usage:
 *   npx tsx --env-file=.env.local src/scripts/author_concept.ts <concept_id>
 *   npx tsx --env-file=.env.local src/scripts/author_concept.ts <id> --max-retries=3
 *   npx tsx --env-file=.env.local src/scripts/author_concept.ts <id> --dry-run
 */

import '@/lib/loadEnvLocal';
import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { validateConceptFile, type ConceptFileValidation, type GateFailure } from './validate-concepts';

const CONCEPTS_DIR = path.resolve(__dirname, '..', 'data', 'concepts');
const QUEUE_FILE = path.resolve(process.cwd(), 'tmp', 'authoring_queue.json');
const SYSTEM_PROMPT_FILE = path.resolve(process.cwd(), '.agents', 'json_author', 'CLAUDE.md');
const MODEL = 'claude-sonnet-4-6';

// Hard cap on tool calls within one outer attempt — prevents runaway loops
// where Sonnet keeps editing without converging. With file content visible
// in the prompt, Sonnet typically converges in 2-5 calls; 12 is a safe ceiling.
const MAX_TOOL_CALLS_PER_ATTEMPT = 12;

interface CliArgs {
    conceptId: string;
    maxRetries: number;
    dryRun: boolean;
}

function parseArgs(argv: string[]): CliArgs {
    const out: CliArgs = { conceptId: '', maxRetries: 3, dryRun: false };
    for (const a of argv.slice(2)) {
        if (a === '--dry-run') out.dryRun = true;
        else if (a.startsWith('--max-retries=')) out.maxRetries = parseInt(a.slice('--max-retries='.length), 10) || 3;
        else if (!a.startsWith('-')) out.conceptId = a;
    }
    return out;
}

function loadSystemPrompt(): string {
    if (!fs.existsSync(SYSTEM_PROMPT_FILE)) {
        throw new Error(`System prompt not found: ${SYSTEM_PROMPT_FILE}`);
    }
    return fs.readFileSync(SYSTEM_PROMPT_FILE, 'utf8');
}

function loadConceptJson(conceptId: string): { exists: boolean; raw: string } {
    const fp = path.join(CONCEPTS_DIR, `${conceptId}.json`);
    if (!fs.existsSync(fp)) return { exists: false, raw: '' };
    return { exists: true, raw: fs.readFileSync(fp, 'utf8') };
}

function formatFailures(failures: GateFailure[]): string {
    const fatal = failures.filter(f => f.severity === 'FAIL');
    if (fatal.length === 0) return '(no fatal failures)';
    const byCategory = new Map<string, GateFailure[]>();
    for (const f of fatal) {
        const arr = byCategory.get(f.category) ?? [];
        arr.push(f);
        byCategory.set(f.category, arr);
    }
    const lines: string[] = [];
    for (const [cat, items] of byCategory.entries()) {
        lines.push(`\n## ${cat}  (${items.length} failure${items.length === 1 ? '' : 's'})`);
        for (const f of items.slice(0, 12)) {
            lines.push(`  - ${f.path}: ${f.message}`);
        }
        if (items.length > 12) lines.push(`  - ... and ${items.length - 12} more`);
    }
    return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool definitions exposed to Sonnet
// ─────────────────────────────────────────────────────────────────────────────

const STRING_REPLACE_TOOL: Anthropic.Messages.Tool = {
    name: 'string_replace',
    description:
        `Replace exactly one occurrence of old_string with new_string in the concept JSON file. ` +
        `old_string must appear EXACTLY once in the file — include enough surrounding context (whitespace, neighbouring keys) to make it unique. ` +
        `If old_string is not found, the call will fail and you can try again with different surrounding context. ` +
        `If old_string matches multiple times, the call will fail with the count and you must add more context. ` +
        `Use this tool to fix one validator failure at a time — don't try to combine multiple defects into one replacement.`,
    input_schema: {
        type: 'object',
        properties: {
            old_string: {
                type: 'string',
                description: 'Exact text to find — must be unique in the file. Include surrounding context if necessary.',
            },
            new_string: {
                type: 'string',
                description: 'Replacement text.',
            },
        },
        required: ['old_string', 'new_string'],
    },
};

const TOOLS: Anthropic.Messages.Tool[] = [STRING_REPLACE_TOOL];

interface ToolResult {
    ok: boolean;
    message: string;
}

function applyStringReplace(filePath: string, oldStr: string, newStr: string): ToolResult {
    const current = fs.readFileSync(filePath, 'utf8');
    const idx = current.indexOf(oldStr);
    if (idx === -1) {
        return { ok: false, message: `old_string not found in file. Verify exact whitespace, JSON quoting, and surrounding context.` };
    }
    const lastIdx = current.lastIndexOf(oldStr);
    if (lastIdx !== idx) {
        // Count occurrences
        let count = 0;
        let pos = 0;
        while ((pos = current.indexOf(oldStr, pos)) !== -1) { count++; pos += oldStr.length; }
        return { ok: false, message: `old_string matches ${count} times. Add more surrounding context to make it unique.` };
    }
    const next = current.slice(0, idx) + newStr + current.slice(idx + oldStr.length);
    fs.writeFileSync(filePath, next);
    // Compute line number of the edit for human-readable feedback.
    const linesBefore = current.slice(0, idx).split('\n').length;
    return { ok: true, message: `Replaced 1 occurrence at line ${linesBefore}.` };
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner tool-use loop — Sonnet edits until it stops calling tools
// ─────────────────────────────────────────────────────────────────────────────

interface AttemptStats {
    attemptN: number;
    toolCallsMade: number;
    toolCallsSucceeded: number;
    toolCallsFailed: number;
    inputTokens: number;
    outputTokens: number;
    durationMs: number;
    finalValidation: ConceptFileValidation | null;
    stoppedReason: 'end_turn' | 'tool_call_cap' | 'error' | 'invalid_response';
}

async function runOneAttempt(args: {
    anthropic: Anthropic;
    systemPrompt: string;
    initialUserMessage: string;
    workingFilePath: string;
    attemptN: number;
}): Promise<AttemptStats> {
    const start = Date.now();
    const stats: AttemptStats = {
        attemptN: args.attemptN,
        toolCallsMade: 0,
        toolCallsSucceeded: 0,
        toolCallsFailed: 0,
        inputTokens: 0,
        outputTokens: 0,
        durationMs: 0,
        finalValidation: null,
        stoppedReason: 'end_turn',
    };

    const messages: Anthropic.Messages.MessageParam[] = [
        { role: 'user', content: args.initialUserMessage },
    ];

    // Inner loop: request → tool calls → tool results → repeat until stop_reason=end_turn.
    for (let toolTurn = 0; toolTurn < MAX_TOOL_CALLS_PER_ATTEMPT; toolTurn++) {
        let response: Anthropic.Messages.Message;
        try {
            // Cache the 30 KB system prompt — without caching, every tool turn
            // would re-bill the full prompt (×12 turns × $3/M = wasteful).
            const stream = args.anthropic.messages.stream({
                model: MODEL,
                max_tokens: 4096, // small — we only emit tool calls + brief reasoning
                system: [
                    { type: 'text', text: args.systemPrompt, cache_control: { type: 'ephemeral' } },
                ],
                tools: TOOLS,
                messages,
            });
            response = await stream.finalMessage();
        } catch (err) {
            console.log(`   ❌ Sonnet API error: ${err instanceof Error ? err.message : String(err)}`);
            stats.stoppedReason = 'error';
            stats.durationMs = Date.now() - start;
            return stats;
        }
        stats.inputTokens += response.usage?.input_tokens ?? 0;
        stats.outputTokens += response.usage?.output_tokens ?? 0;

        const toolUses = response.content.filter((b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use');

        // No tool calls — Sonnet thinks it's done.
        if (toolUses.length === 0) {
            messages.push({ role: 'assistant', content: response.content });
            stats.stoppedReason = 'end_turn';
            break;
        }

        // Apply each tool call and collect results.
        const toolResultBlocks: Anthropic.Messages.ToolResultBlockParam[] = [];
        for (const tu of toolUses) {
            stats.toolCallsMade++;
            if (tu.name !== 'string_replace') {
                toolResultBlocks.push({
                    type: 'tool_result',
                    tool_use_id: tu.id,
                    content: `Unknown tool: ${tu.name}. Only string_replace is available.`,
                    is_error: true,
                });
                stats.toolCallsFailed++;
                continue;
            }
            const input = tu.input as { old_string?: string; new_string?: string };
            if (typeof input.old_string !== 'string' || typeof input.new_string !== 'string') {
                toolResultBlocks.push({
                    type: 'tool_result',
                    tool_use_id: tu.id,
                    content: 'old_string and new_string must both be strings.',
                    is_error: true,
                });
                stats.toolCallsFailed++;
                continue;
            }
            const result = applyStringReplace(args.workingFilePath, input.old_string, input.new_string);
            toolResultBlocks.push({
                type: 'tool_result',
                tool_use_id: tu.id,
                content: result.message,
                is_error: !result.ok,
            });
            if (result.ok) stats.toolCallsSucceeded++;
            else stats.toolCallsFailed++;
            const symbol = result.ok ? '✓' : '✗';
            console.log(`   ${symbol} string_replace: ${result.message}`);
        }

        messages.push({ role: 'assistant', content: response.content });
        messages.push({ role: 'user', content: toolResultBlocks });

        if (toolTurn === MAX_TOOL_CALLS_PER_ATTEMPT - 1) {
            stats.stoppedReason = 'tool_call_cap';
        }
    }

    stats.durationMs = Date.now() - start;
    stats.finalValidation = validateConceptFile(args.workingFilePath);
    return stats;
}

// ─────────────────────────────────────────────────────────────────────────────
// Failure queue
// ─────────────────────────────────────────────────────────────────────────────

interface QueueRow {
    concept_id: string;
    queued_at: string;
    attempts: number;
    final_failures_count: number;
    final_failure_categories: string[];
    candidate_path: string;
    notes: string;
}

function appendQueueRow(row: QueueRow): void {
    fs.mkdirSync(path.dirname(QUEUE_FILE), { recursive: true });
    let existing: QueueRow[] = [];
    if (fs.existsSync(QUEUE_FILE)) {
        try {
            const raw = fs.readFileSync(QUEUE_FILE, 'utf8');
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) existing = parsed;
        } catch {
            fs.copyFileSync(QUEUE_FILE, QUEUE_FILE + '.corrupt-' + Date.now());
        }
    }
    existing.push(row);
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(existing, null, 2) + '\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Driver
// ─────────────────────────────────────────────────────────────────────────────

function withLineNumbers(content: string): string {
    const lines = content.split('\n');
    const width = String(lines.length).length;
    return lines.map((line, i) => `${String(i + 1).padStart(width, ' ')}  ${line}`).join('\n');
}

function buildAttemptPrompt(
    conceptId: string,
    failures: GateFailure[],
    isFirstAttempt: boolean,
    fileContent: string,
): string {
    const intro = isFirstAttempt
        ? `Audit and repair the concept JSON for concept_id="${conceptId}".`
        : `The previous repair attempt left some validator failures unfixed. Continue repairing.`;
    return `${intro}

You have a string_replace tool — use it to fix each validator failure. Make ONE edit per tool call. Do not modify anything not directly required by a failure. Do not change schema_version, version metadata, or unrelated fields.

When picking old_string, copy text DIRECTLY from the file content shown below. Include enough surrounding lines (typically 2-3 lines of JSON before/after) to make old_string unique. The same JSON snippet (e.g. \`"direction_deg": 90\`) often appears many times across states — always include the surrounding key/id context.

Validator failures to fix:
${formatFailures(failures)}

Current file content (with line numbers — line numbers are NOT part of the file, do NOT include them in old_string):

\`\`\`
${withLineNumbers(fileContent)}
\`\`\`

When all failures are addressed, stop calling tools and respond with a brief "done" message.`;
}

async function main(): Promise<void> {
    const cli = parseArgs(process.argv);
    if (!cli.conceptId) {
        console.error('Usage: npx tsx src/scripts/author_concept.ts <concept_id> [--max-retries=N] [--dry-run]');
        process.exit(1);
    }
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('ANTHROPIC_API_KEY not set. Run via --env-file=.env.local.');
        process.exit(1);
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const systemPrompt = loadSystemPrompt();
    const { exists, raw } = loadConceptJson(cli.conceptId);
    const targetPath = path.join(CONCEPTS_DIR, `${cli.conceptId}.json`);
    const workingPath = targetPath + '.candidate';

    console.log(`\n📝 author_concept (tool-use) — ${cli.conceptId}`);
    console.log(`   System prompt: ${path.relative(process.cwd(), SYSTEM_PROMPT_FILE)} (${systemPrompt.length} chars)`);
    console.log(`   Existing JSON: ${exists ? `yes (${raw.length} chars)` : 'no — brand-new authoring not supported in v2 yet'}`);
    console.log(`   Max retries:   ${cli.maxRetries}`);
    console.log(`   Dry run:       ${cli.dryRun}\n`);

    if (!exists) {
        console.error('Brand-new authoring is not supported by the tool-use harness yet (no existing file to edit).');
        process.exit(1);
    }

    // Short-circuit if already passing.
    const initial = validateConceptFile(targetPath);
    if (initial.passed) {
        console.log(`✅ ${cli.conceptId} already passes all gates. No Sonnet call needed.\n`);
        return;
    }
    const initialFails = initial.gateFailures.filter(f => f.severity === 'FAIL');
    console.log(`⚠️  ${cli.conceptId} has ${initialFails.length} FAIL(s); engaging tool-use repair loop.\n`);

    // Working copy — edits land here, not on the live file, until we know the file passes.
    fs.copyFileSync(targetPath, workingPath);

    let totalInput = 0;
    let totalOutput = 0;
    let lastStats: AttemptStats | null = null;
    let lastFailures: GateFailure[] = initialFails;

    for (let attempt = 1; attempt <= cli.maxRetries; attempt++) {
        console.log(`── Attempt ${attempt}/${cli.maxRetries} ──`);
        // Re-read the working file so each attempt sees prior edits.
        const currentFileContent = fs.readFileSync(workingPath, 'utf8');
        const prompt = buildAttemptPrompt(cli.conceptId, lastFailures, attempt === 1, currentFileContent);

        const stats = await runOneAttempt({
            anthropic,
            systemPrompt,
            initialUserMessage: prompt,
            workingFilePath: workingPath,
            attemptN: attempt,
        });
        totalInput += stats.inputTokens;
        totalOutput += stats.outputTokens;
        lastStats = stats;

        console.log(`   Sonnet: ${stats.inputTokens}+${stats.outputTokens} tokens, ${stats.toolCallsMade} tool call(s) (${stats.toolCallsSucceeded} ok / ${stats.toolCallsFailed} err), ${stats.durationMs}ms, stop=${stats.stoppedReason}`);

        if (stats.stoppedReason === 'error') {
            console.log('   Aborting attempt due to API error.');
            continue;
        }

        const validation = stats.finalValidation;
        if (!validation) {
            console.log('   No validation result available — skipping outcome check.');
            continue;
        }

        const fails = validation.gateFailures.filter(f => f.severity === 'FAIL');
        const warns = validation.gateFailures.filter(f => f.severity === 'WARN');
        console.log(`   Validator: ${fails.length} FAIL, ${warns.length} WARN`);

        if (validation.passed) {
            console.log(`\n✅ PASSED on attempt ${attempt}.`);
            console.log(`   Total cost: ~$${((totalInput * 3 + totalOutput * 15) / 1_000_000).toFixed(4)} (${totalInput}+${totalOutput} tokens)`);
            if (cli.dryRun) {
                console.log(`   [DRY RUN] Skipping write to ${path.relative(process.cwd(), targetPath)}.`);
                fs.unlinkSync(workingPath);
                return;
            }
            fs.copyFileSync(workingPath, targetPath);
            fs.unlinkSync(workingPath);
            console.log(`   Wrote → ${path.relative(process.cwd(), targetPath)}\n`);
            return;
        }

        const catCounts = new Map<string, number>();
        for (const f of fails) catCounts.set(f.category, (catCounts.get(f.category) ?? 0) + 1);
        const top = [...catCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
        console.log(`   Top categories: ${top.map(([c, n]) => `${c}=${n}`).join(', ')}`);

        lastFailures = fails;
    }

    // Exhausted retries.
    const finalFails = lastStats?.finalValidation?.gateFailures.filter(f => f.severity === 'FAIL') ?? lastFailures;
    console.log(`\n❌ Exhausted ${cli.maxRetries} retries with ${finalFails.length} FAIL(s) remaining.`);
    console.log(`   Total cost: ~$${((totalInput * 3 + totalOutput * 15) / 1_000_000).toFixed(4)} (${totalInput}+${totalOutput} tokens)`);

    const candidateExists = fs.existsSync(workingPath);
    if (cli.dryRun) {
        console.log(`   [DRY RUN] Skipping queue write.`);
        if (candidateExists) fs.unlinkSync(workingPath);
        process.exit(1);
    }

    const categories = [...new Set(finalFails.map(f => f.category))];
    const queueRow: QueueRow = {
        concept_id: cli.conceptId,
        queued_at: new Date().toISOString(),
        attempts: cli.maxRetries,
        final_failures_count: finalFails.length,
        final_failure_categories: categories,
        candidate_path: candidateExists ? path.relative(process.cwd(), workingPath) : '(not written)',
        notes: `Final attempt validator: ${categories.join(', ')}.`,
    };
    appendQueueRow(queueRow);
    console.log(`   Queue → ${path.relative(process.cwd(), QUEUE_FILE)}`);
    console.log(`   Candidate → ${queueRow.candidate_path}\n`);

    process.exit(1);
}

main().catch(err => {
    console.error('\n💥 author_concept crashed:', err instanceof Error ? err.stack : err);
    process.exit(2);
});
