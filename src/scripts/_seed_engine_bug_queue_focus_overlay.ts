/**
 * engine_bug_queue rows from the Focus Overlay build (2026-08-19) — the
 * narration-synced pointing layer (design spec:
 * docs/superpowers/specs/2026-08-19-focus-overlay-design.md). Three rows:
 *
 *   1. field3d_faraday_glow_tokens_never_resolve_to_built_ids — FIXED this
 *      session. faraday_law_induction authored 18 per-sentence glow tokens,
 *      ALL `*_label` (flux_label, push_label, …) matching NO built
 *      sceneObjects userData id/elementType (the real ids are far_* with a
 *      _lbl suffix; resolveGlowAliases strips only ONE leading segment and
 *      cannot bridge push_label→far_push_lbl). With brightenOnly=true the
 *      result was a fully authored, fully inert glow track: nothing
 *      brightened, nothing dimmed, and no gate ever noticed. Re-pointed at
 *      real built ids in the same change that authored the concept's focus
 *      bindings.
 *
 *   2. visual_validator_tts_legend_builder_expects_object_scene_composition —
 *      OPEN. ttsBindings.ts buildLegend() reads
 *      `asRecord(state.scene_composition)?.primitives`, but the schema and
 *      the whole fleet author scene_composition as a FLAT ARRAY —
 *      asRecord() returns undefined for arrays, so primitives is always []
 *      and the vision model judging Category I has never seen a single
 *      authored PCPL primitive id (only the 12 hardcoded field_3d legend
 *      entries). Today's I1 "glow target present" check — and the new I3
 *      focus-target check — are materially weaker than they read. Fix is
 *      small (accept the array shape + top-level text/label fields) but it
 *      changes what the PAID vision gate sees fleet-wide → its own PR,
 *      founder call.
 *
 *   3. authoring_reveal_primitive_id_authored_110x_read_by_nothing — OPEN
 *      directive. `reveal_primitive_id` appears on 110 tts_sentences and has
 *      ZERO runtime consumers (player, renderers, validators — nothing reads
 *      it; it lives only in proof-run design docs). Cautionary precedent the
 *      Focus Overlay wiring was explicitly built to avoid (focus was
 *      registered end-to-end BEFORE any binding was authored). Decide:
 *      implement a consumer, or deprecate the field and strip it on next
 *      touch. Do NOT silently delete the 110 bindings.
 *
 * Idempotent: upsert onConflict 'bug_class'. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_focus_overlay.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-19_focus_overlay';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const rows: Row[] = [
  {
    bug_class: 'field3d_faraday_glow_tokens_never_resolve_to_built_ids',
    title: 'faraday_law_induction: all 18 authored glow tokens were *_label names matching no built id — the entire narration glow track was inert',
    severity: 'MAJOR',
    owner_cluster: 'alex:json_author',
    root_cause:
      'The concept authored per-sentence glow tokens from a label-style vocabulary (flux_label, steady_label, push_label, …) that matches NO sceneObjects userData.id or elementType in the faraday scenario (real ids are far_coil / far_magnet / far_needle / far_push_lbl …). resolveGlowAliases (field_3d_renderer.ts) strips exactly one leading segment, so it can bridge furnace_label→s5_furnace_label but never push_label→far_push_lbl (suffix mismatch). glowTargets went non-empty each sentence → glowActive=true with no focal → every far_* object took the non-focal branch, and because the faraday applier passes brightenOnly=true, the peer-dim was also skipped: nothing brightened, nothing dimmed, and every gate stayed green (THE EYE never sends SET_GLOW; no deterministic gate resolves binding targets). Same scar family as ch6 inherited_scars "an id where every element stays at 1.0 is this bug".',
    prevention_rule:
      'Glow and focus targets must be REAL built ids, never invented label vocabulary. The oracle is now cheap: with the Focus Overlay host in every renderer, PM_FOCUS_HOST.resolve(id) in the sim console returns null for a token that resolves to nothing — quality_auditor Gate 3f#7 additionally requires window.PM_focusMisses to be EMPTY after a live walk. json_author spec updated with the field contract; a binding authored without a resolve() check is an authoring defect.',
    probe_type: 'js_eval',
    probe_logic:
      'For each tts_sentence glow/focus target in the concept JSON, evaluate PM_FOCUS_HOST.resolve(token) in the sim iframe on the state that carries the sentence: null for a 3D/DOM target that should exist = the scar. faraday reference: resolve("flux_label") was null pre-fix; resolve("far_coil") returns a rect post-fix.',
    status: 'FIXED',
    concepts_affected: ['faraday_law_induction'],
    fixed_in_files: ['src/data/concepts/faraday_law_induction.json'],
    row_type: 'incident',
  },
  {
    bug_class: 'visual_validator_tts_legend_builder_expects_object_scene_composition',
    title: 'ttsBindings buildLegend reads scene_composition as {primitives:[]} but the fleet authors a flat array — the Category I vision check has never seen an authored PCPL primitive id',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:visual_validator',
    root_cause:
      'buildLegend() (src/lib/validators/visual/ttsBindings.ts) calls asRecord(state.scene_composition) and reads .primitives — but conceptJson.ts declares scene_composition as z.array(...) and every concept authors it as a flat array, so asRecord() returns undefined (it rejects arrays) and primitives is always []. It also reads p.properties.text/label where the fleet authors text at top level. Net: primitive_legend has only ever contained the 12 hardcoded field_3d entries, so the vision model judging I1 (glow target present) — and now I3 (focus target present) — has no legend for any authored PCPL id. The check is materially weaker than its passCriterion reads.',
    prevention_rule:
      'When a validator derives context from concept JSON, its shape assumptions must match the Zod schema (the schema is the contract, not a guess) — and a helper whose output is provably always-empty for the entire fleet is dead code that must fail loudly, not silently degrade a paid gate. Fix = accept the flat-array shape + top-level text/label fields; it changes what the PAID vision gate sees fleet-wide, so it ships in its own small PR after founder sign-off.',
    probe_type: 'js_eval',
    probe_logic:
      'Call extractTtsVisualBindings on any PCPL concept with authored glow bindings (e.g. scalar_vs_vector) and inspect primitive_legend: entries beyond the 12 hardcoded RENDERER_ELEMENT_LEGEND items = fixed; exactly the hardcoded 12 (or fewer) = the scar persists.',
    status: 'OPEN',
    concepts_affected: [],
    fixed_in_files: [],
    row_type: 'incident',
  },
  {
    bug_class: 'authoring_reveal_primitive_id_authored_110x_read_by_nothing',
    title: 'reveal_primitive_id is authored on 110 tts_sentences and read by zero runtime consumers — decide: implement or deprecate, never silently delete',
    severity: 'MODERATE',
    owner_cluster: 'ambiguous',
    root_cause:
      'The field appears in proof-run design docs (.agents/proof_run/*.md) and was authored into 110 sentences across the fleet, but no player, renderer, or validator ever reads it — authors wrote 110 bindings into a table column no code consumes, and nothing failed. This is the exact failure mode the Focus Overlay wiring was built to avoid (focus was registered at the player extraction, ttsBindings keep-gate, retrofit-surgeon grep audit, and auditor gate BEFORE any binding was authored).',
    prevention_rule:
      'A new per-sentence authoring field ships only with its consumer and its audit registration in the same change (the reveal_primitive_id lesson, now written into the Focus Overlay spec). For the existing 110: founder decision — implement a consumer or deprecate the field and strip it on next concept touch; never a silent mass deletion.',
    probe_type: 'manual',
    probe_logic:
      'git grep "reveal_primitive_id" over src/**/*.ts must show at least one non-type consumer (player extraction, renderer, or validator) for the field to count as live; today the only hits are design docs and concept JSONs.',
    status: 'OPEN',
    concepts_affected: [],
    fixed_in_files: [],
    row_type: 'directive',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length === 0 ? `ARRAY[]::text[]` : `ARRAY[${a.map(sqlStr).join(', ')}]`; }
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- 2026-08-19: Focus Overlay build — the faraday inert-glow scar (FIXED by\n` +
    `-- re-pointing), the ttsBindings dead legend builder (OPEN), and the\n` +
    `-- reveal_primitive_id dead-field directive (OPEN). Generated by\n` +
    `-- src/scripts/_seed_engine_bug_queue_focus_overlay.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = now();\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-08-19_seed_engine_bug_queue_focus_overlay_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${rows.length} row(s) upserted (1 FIXED, 2 OPEN)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
