/**
 * engine_bug_queue rows for the galvanometer_to_ammeter_voltmeter Rule-31 rebuild
 * (2026-07-05) — two eye-walker findings from run 20260705-180427, plus one broader
 * coverage gap surfaced alongside them.
 *
 *  1. gav_readout_panel_ignores_per_state_extras_config (MODERATE) → FIXED. The
 *     #sliders readout div showed all four derived values (Shunt S, Series R,
 *     Ammeter≈, Voltmeter≈) on every show_sliders state, leaking Voltmeter info into
 *     the shunt-only S4 and Ammeter info into the voltmeter-only S6 — contradicting
 *     the Rule-31c contract (S4 hides V, S6 hides I). Fixed: refreshGalvanometerExplorer
 *     now builds the readout from the state's visible_controls (has I → shunt line;
 *     has V → series line; both → both).
 *
 *  2. gav_assemble_reveal_pin_missing_from_derive_state_meta (MAJOR) → FIXED (reveal
 *     pin). deriveStateMeta.maxRevealForField3dState had no galvanometer_to_ammeter_
 *     voltmeter block, so S5 (assemble_ammeter @9000+1500ms) and S7 (assemble_voltmeter
 *     @8000+1500ms) fell back to DEFAULT_REVEAL_MS (1500ms) and the frozen capture
 *     photographed the PRE-assembly picture. Fixed: added a gav block pinning the
 *     frozen frame past each assemble merge.
 *
 *  3. galvanometer_family_motion_expectation_undeclared (MODERATE) → DEFERRED. Neither
 *     moving_coil_galvanometer NOR galvanometer_to_ammeter_voltmeter is declared in
 *     deriveMotionExpectations, so D5/D6 dense-motion checks silently SKIP for all
 *     their states (never fail, never check). The motion (coil deflection / current-dot
 *     stream / assemble cross-fades) is real and eye-walker-verified on-frame, so the
 *     sims are correct — but the automated gate is hollow. Deferred to a dedicated
 *     validator pass: declaring motion on the slow-creep dot states (S1 Ig-only) risks
 *     D6 false-fails near DENSE_MOTION_EPSILON, so it needs per-state tuning + a full
 *     EYE re-run, not a drive-by edit.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_gav_findings.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-05_gav_rule31_rebuild';

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

const CONCEPT = 'galvanometer_to_ammeter_voltmeter';
const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';
const DERIVE = 'src/lib/validators/visual/deriveStateMeta.ts';

const incidents: Row[] = [
  {
    bug_class: 'gav_readout_panel_ignores_per_state_extras_config',
    title: 'galvanometer_to_ammeter_voltmeter: the #sliders readout renders all four derived values on every show_sliders state, leaking Voltmeter into the shunt-only S4 and Ammeter into the voltmeter-only S6 (contradicts the Rule-31c per-state control contract)',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `FIXED 2026-07-05 (field_3d_renderer.ts refreshGalvanometerExplorer). Was: the gav_readout innerHTML unconditionally listed Shunt S, Series R, Ammeter≈ and Voltmeter≈ whenever the panel was visible — so S4 (contextual controls Ig,G,I) still showed "Voltmeter ≈ 10000 Ω" and S6 (Ig,G,V) still showed "Ammeter ≈ 0.100 Ω", undoing the per-state contextual filtering the slider rows already did. Fix: the readout is now built from the current state's visible_controls — has "I" ⇒ show the shunt-S/ammeter line, has "V" ⇒ show the series-R/voltmeter line, both (S9 sandbox) ⇒ both, absent ⇒ both (safe default). Same visible_controls gate as the slider rows.`,
    prevention_rule:
      'A scenario readout/derived-value panel must be gated by the SAME per-state signal (visible_controls / extras.readout.fields) as its slider rows — never rendered unconditionally in the panel-init. A contextual-control state that hides a slider must also hide the readout line that slider drives, or the disclosure leaks.',
    probe_type: 'manual',
    probe_logic:
      'On S4 the readout shows only the shunt-S/ammeter line (no Voltmeter/Series-R); on S6 only the series-R/voltmeter line (no Ammeter/Shunt-S); on S9 both. Any state whose readout names the other meter is a leak.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'gav_assemble_reveal_pin_missing_from_derive_state_meta',
    title: 'galvanometer_to_ammeter_voltmeter frozen capture photographs the PRE-assembly picture on S5/S7 — deriveStateMeta.maxRevealForField3dState has no gav block, so the assemble_ammeter/assemble_voltmeter one-shot reveals fall back to DEFAULT_REVEAL_MS (1500ms), far before the 8000–9000ms merge fires',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `FIXED 2026-07-05 (deriveStateMeta.ts). Was: no galvanometer_to_ammeter_voltmeter case in maxRevealForField3dState, so every state clamped to DEFAULT_REVEAL_MS (1500ms). STATE_5's assemble_ammeter fires at 9000ms (+1500ms) and STATE_7's assemble_voltmeter at 8000ms (+1500ms), so the frozen/H2-pin capture photographed the state BEFORE the G‖shunt→"A" and G+R→"V" merges completed, and no deterministic check caught it (some content is on screen so D1p/D5 pass trivially). Fix: added a gav block that pushes each assemble's at_ms+duration_ms(+400) as a reveal candidate, pinning the frozen frame past the completed meter box.`,
    prevention_rule:
      'Every new field_3d scenario_type whose per-state extras carry one-shot timed reveals (at_ms + duration_ms) MUST add a matching candidate block in deriveStateMeta.maxRevealForField3dState (mirroring every sibling scenario) — else the frozen capture pins at the 1500ms default and photographs the state before its payoff, invisibly to the deterministic gate. Add the scenario to deriveStateMeta at author time, alongside the renderer.',
    probe_type: 'manual',
    probe_logic:
      'grep deriveStateMeta.ts for the scenario_type / its reveal-extras keys (here assemble_ammeter/assemble_voltmeter). If absent while the concept has timed reveals, its frozen frames are mistimed. Verify the S5/S7 frozen frames show the assembled A/V meter box, not the pre-merge lens+resistor.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [DERIVE],
    row_type: 'incident',
  },
  {
    bug_class: 'galvanometer_family_motion_expectation_undeclared',
    title: 'Neither moving_coil_galvanometer nor galvanometer_to_ammeter_voltmeter is declared in deriveMotionExpectations, so THE EYE D5/D6 dense-motion checks silently SKIP every state of both — the automated motion gate is hollow (never fails, never checks)',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:visual_validator',
    root_cause:
      `DEFERRED (tracked) 2026-07-05. deriveMotionExpectations has per-scenario motion blocks (gauss/acl/potential/capacitor/pef/em/mag/faraday/motional_emf/eddy) but NONE for the two galvanometer scenarios, and the field_3d loop never sees an advance_mode (that lives on epic_l_path, not field_3d_config), so both concepts' states resolve to undefined → D5/D6 skip. The motion IS real (mcg coil deflection + current dots; gav continuous current-dot stream ∝ I + the S5/S7 assemble cross-fades) and eye-walker pixel-verified it on-frame (mcg run 20260705-045637, gav run 20260705-180427), so both sims are correct — only the automated gate is absent. NOT fixed drive-by: declaring motion on the slow-creep states (gav S1 = Ig-only trickle, gav S3/S4 shunt split) risks D6 false-fails near DENSE_MOTION_EPSILON, so it needs per-state tuning + a full EYE re-run to confirm. Fix in a dedicated validator pass covering both galvanometers together.`,
    prevention_rule:
      'A new field_3d scenario with continuous or one-shot motion should be declared in deriveMotionExpectations (true for guided motion states, false/undefined for show_sliders/interactive) so D5/D6 actually gate it — an undeclared scenario passes THE EYE trivially without ever checking motion. Pair the declaration with a full EYE re-run to confirm the dense motion clears the floor on the slowest state.',
    probe_type: 'manual',
    probe_logic:
      'grep deriveMotionExpectations for the scenario_type / its per-state motion keys. If absent, D5/D6 skip and a "clean" EYE pass does not imply motion was verified — an eye-walker frame read is then load-bearing, not optional.',
    status: 'DEFERRED',
    concepts_affected: [CONCEPT, 'moving_coil_galvanometer'],
    fixed_in_files: [],
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
  return `-- 2026-07-05: galvanometer_to_ammeter_voltmeter Rule-31 rebuild — eye-walker findings.\n` +
    `-- readout leak (FIXED), assemble reveal-pin (FIXED), galvanometer-family motion\n` +
    `-- declaration gap (DEFERRED). Generated by\n` +
    `-- src/scripts/_seed_engine_bug_queue_gav_findings.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  fixed_in_files = EXCLUDED.fixed_in_files;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-05_seed_engine_bug_queue_gav_findings_migration.sql');
  writeFileSync(sqlPath, emitSql(incidents), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${incidents.length} incident rows)`);

  const payload = incidents.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${incidents.length} gav finding row(s) upserted (2 FIXED, 1 DEFERRED)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
