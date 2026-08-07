/**
 * engine_bug_queue: CLOSE
 *   f3d_widget_autolabel_contradicts_the_panel_header_it_toggles
 *
 * Filed OPEN in the Ch.6 concept #2 review chain (2026-08-02) from a live WIDGET_DECLARE
 * capture on positive_negative_zero_work. Fixed the same day. The bug_class string is
 * UNCHANGED, so this is an upsert of the same row and not a duplicate.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_wg_autolabel_selfdeclare.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-02_wg_autolabel_selfdeclare';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:renderer_primitives' | 'peter_parker:field3d_surgeon'
  | 'peter_parker:runtime_generation' | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'probe_definition' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';

const rows: Row[] = [
  {
    bug_class: 'f3d_widget_autolabel_contradicts_the_panel_header_it_toggles',
    title:
      'The Rule-39g auto-discovered widget list labelled the work-bar panel "Energy" while the panel header read "Work done", and printed id abbreviations ("Annots", "Slowmo") as teacher-facing English',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'FIXED 2026-08-02. The generic widget engine derives every teacher-facing label from the DISCOVERED ELEMENT ID (pmWgPanelLabel -> pmWgPanelWords), which names what a panel was CALLED when it was written, not what it SHOWS now. Two failure modes, both confirmed from a live WIDGET_DECLARE capture on the built review page. (1) REUSE ROT: SEAM M reused SEAM L energy panel #nlb_energy to carry the signed WORK ledgers, so the id outlived its contents and the gear row read "Energy" over a panel whose own rendered header reads "Work done" — on positive_negative_zero_work, a concept that deliberately bans the word energy from every reader-facing string because that word is its boundary with work_energy_theorem. Nothing in the engine could have caught it: an id is not evidence about content. (2) ABBREVIATION: an id is written for code and abbreviates freely, so the same fallback printed "Annots" for #f3d_annots and "Slowmo" for #nlb_slowmo, which are not English words (Rule 41) in a list a teacher reads. The data-wg-label self-declaration hook already existed for panels but was read by NOTHING in the fleet and was not honoured for slider rows at all.',
    prevention_rule:
      'The id-derived label is the LAST resort and carries two guarantees only: it is spelled in whole English words, and it never survives a panel that knows better. (a) SELF-DECLARATION is authoritative — any element that knows its own teacher-facing name sets data-wg-label on the discovered node and the engine reads it in preference to everything else, for slider rows as well as panels. This is not the curated 39a path: no SIM_READY list, no per-concept authoring, so Rule 39f/g still holds (a new scenario inherits the gear panel for free). (b) A self-declared label is computed CONCEPT-WIDE, from what the concept authors, never from the state that happens to be applied first — the engine captures a label once at declaration and the review chrome only re-renders the list when the KEY SET changes, so a per-state label is both unstable under Rule 25d state reordering and unable to update itself later. (c) A panel whose contents outlive its id must name what it SHOWS and share a stem with the header it renders, so the gear row and the thing it toggles read as the same object. (d) The id fallback expands known abbreviated stems (whole-token match only, never a substring) before it capitalises. Corollary observed while fixing and NOT part of this row: #nlb_energy and #f3d_annots are declared as toggles on all 12 newtons_laws_body concepts including the 10 that author neither block and the concepts that author no annotations, because a dynamic position:fixed panel is declared on sight rather than on first visibility — a phantom-widget defect of its own class, unfixed.',
    probe_type: 'js_eval',
    probe_logic:
      'Capture the WIDGET_DECLARE (generic engine) and SIM_READY.widgets (curated 39a) payloads on the built review page, walking every state on the rail so late-revealed widgets declare. For each entry, resolve the element in the sim iframe and take its first visible short text-bearing leaf as the rendered header; where such a header exists, assert the declared label shares a stem with it. Independently assert every declared label is whole English words: reject any token that is a known abbreviation or is not in a dictionary. Measured 2026-08-02, positive_negative_zero_work before -> after: nlb_energy "Energy" -> "Work done" (header "Work done"), f3d_annots "Annots" -> "Annotations", nlb_slowmo "Slowmo" -> "Slow motion"; work_done_by_constant_force identical; normal_force nlb_energy "Energy" -> "Energy bars" (that concept authors neither block and the panel never becomes visible, so no header exists to match); capacitance emits ZERO WIDGET_DECLARE and its curated 7-entry SIM_READY list is byte-identical, which is the collateral-damage proof. Labels are chrome, never sim pixels: THE EYE H2 must be flat.',
    status: 'FIXED',
    concepts_affected: [
      'positive_negative_zero_work', 'work_done_by_constant_force', 'connected_bodies',
      'friction_force', 'block_on_incline', 'normal_force', 'tension_force',
      'newton_first_law', 'newton_second_law', 'newton_third_law',
      'free_body_diagram', 'rolling_friction',
    ],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
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
  return `-- 2026-08-02: widget self-declaration (data-wg-label) + whole-word id fallback.\n` +
    `-- CLOSES f3d_widget_autolabel_contradicts_the_panel_header_it_toggles.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_wg_autolabel_selfdeclare.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = CASE WHEN EXCLUDED.status = 'FIXED' THEN now() ELSE engine_bug_queue.fixed_at END;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-02_seed_engine_bug_queue_wg_autolabel_selfdeclare_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${rows.length} row(s) upserted (status FIXED)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
