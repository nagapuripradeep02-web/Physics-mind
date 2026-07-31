/**
 * Seed engine_bug_queue with the renderer-side fixes from the capacitance
 * quality_auditor FAIL routed to peter_parker:renderer_primitives (2026-07-21).
 * Four items:
 *   1. UPDATE field3d_sliders_panel_top12_vs_fsbtn_top10 — capacitance confirmed
 *      + fixed (both the right-edge #fsTopControls collision on #cap_readout AND
 *      a left-edge mirror case against #simPenBar on #cap_ratio_readout). Status
 *      stays OPEN — helical_motion_charge_in_uniform_B and
 *      cyclotron_period_independent_of_speed still carry the unfixed pattern.
 *   2. INSERT capacitance_negative_pool_low_contrast — translucent-plate
 *      painter's-algorithm dilution of the far dot pool.
 *   3. INSERT capacitance_chain_link_derivation_pulse_unwired — the S6
 *      dot-pool/field-line/gap-bracket spotlight was authored (scenario_cue
 *      link_1/2/3) but never wired in the renderer.
 *   4. INSERT capacitance_pF_readout_precision_mismatch — hardcoded
 *      toFixed(1) diverged from the narration/annotation's conditional
 *      precision (<100pF = 1 decimal, >=100pF = integer).
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_capacitance_renderer_fixes.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-21_capacitance_renderer_fixes';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'directive';

interface Row {
  bug_class: string;
  title: string;
  severity: Severity;
  owner_cluster: Owner;
  root_cause: string;
  prevention_rule: string;
  probe_type: ProbeType;
  probe_logic: string;
  status: Status;
  concepts_affected: string[];
  fixed_in_files: string[];
  row_type: RowType;
}

const R = 'peter_parker:renderer_primitives';
const RENDERER = ['src/lib/renderers/field_3d_renderer.ts'];

// ── 1. UPDATE the existing fleet-wide row (append capacitance) ─────────────
const sliderPanelUpdate: Row = {
  bug_class: 'field3d_sliders_panel_top12_vs_fsbtn_top10',
  title: 'Every #*_sliders / readout DOM panel anchored top:12/right:12 (or top:12/left:12) collides with build_review_site.ts review-chrome — #fsTopControls (Full-screen + Clean, top:10/right:10) on the right, #simPenBar (Move/Draw/Clear, top:10/left:10) on the left',
  severity: 'MODERATE',
  owner_cluster: R,
  root_cause: 'field_3d_renderer.ts DOM overlays created with position:fixed;top:12px;right:12px (or left:12px) collide with build_review_site.ts chrome anchored at the SAME corner (top:10px). THE EYE captures the raw sim only, never the wrapped review site, so this class of collision passes 31/31 or 38/38 deterministic gates and ships. capacitance confirmed BOTH sides: #cap_readout (top:12/right:12) collided with #fsTopControls; #cap_ratio_readout (top:12/left:12) collided with #simPenBar and is S2\\u2019s sole glow focal (the PRIMARY aha readout) -- the worse of the two since it hid the single most important number in the concept.',
  prevention_rule: 'Any new field_3d DOM panel anchored to a top corner must use top:52px+ (the established clearance, already used by gm_readout/em_readout/acg_readout on the right) on BOTH edges -- top:12px;left:12px is just as unsafe as top:12px;right:12px once #simPenBar is accounted for. Before shipping a NEW top-anchored panel, check it against both #fsTopControls (right) and #simPenBar (left) in build_review_site.ts, not just THE EYE.',
  probe_type: 'manual',
  probe_logic: 'MANUAL/EYE: open the built review site (build:review) on the state carrying the panel, and visually confirm the panel does NOT overlap #fsTopControls (top-right) or #simPenBar (top-left). capacitance verified fixed: #cap_readout moved to top:52px;right:12px, #cap_ratio_readout moved to top:52px;left:12px. helical_motion_charge_in_uniform_B and cyclotron_period_independent_of_speed remain UNFIXED -- row stays OPEN fleet-wide.',
  status: 'OPEN',
  concepts_affected: ['helical_motion_charge_in_uniform_B', 'cyclotron_period_independent_of_speed', 'capacitance'],
  fixed_in_files: RENDERER,
  row_type: 'incident',
};

// ── 2. NEW: negative dot-pool washed out by translucent-plate blend order ──
const negPoolContrast: Row = {
  bug_class: 'capacitance_negative_pool_low_contrast',
  title: 'The negative (-) charge-dot pool renders washed-out grey-lavender against the bright + pool because painter\\u2019s-algorithm alpha blending stacks the translucent plates (opacity 0.5 each) over whichever pool sits farther from the camera',
  severity: 'MAJOR',
  owner_cluster: R,
  root_cause: 'posDotGrp/negDotGrp share the same (x,y) grid slots (dotSlots), differing only in Z, so at the authored camera_position they project into the SAME screen region. From that camera, world-Z order (near to far) is posDotGrp, posPlate, negPlate, negDotGrp -- Three.js\\u2019s default back-to-front transparent sort draws negDotGrp first, then negPlate (own colour, harmless), then posPlate (translucent RED, opacity 0.5) composites on top of everything drawn so far, diluting the blue negDotGrp toward grey-lavender. posDotGrp draws last (nearest) so it is never diluted and reads bright.',
  prevention_rule: 'When two colour-coded populations (or any two elements meant to be equally legible) sit on opposite sides of a scene with translucent geometry between them and the camera, give BOTH populations depthTest:false + depthWrite:false + an explicit renderOrder above the translucent geometry\\u2019s default (0) -- e.g. renderOrder:998, mirroring the cap_fl_shaft field-line idiom already in the same builder. Tie the renderOrder value between the two populations so they still Z-sort correctly AGAINST EACH OTHER (no regression to whichever pool was already correct); only the intervening translucent geometry\\u2019s dilution is removed. Colour/brightness only -- never size (Rule 29).',
  probe_type: 'manual',
  probe_logic: 'MANUAL/EYE: open capacitance STATE_1/STATE_2 (show_dots:true) and compare the + and - dot pool colour saturation side by side -- both must read as clearly saturated red/blue, neither washed toward grey. capacitance verified fixed: dotP/dotN materials given depthTest:false/depthWrite:false + renderOrder:998 in buildCapacitanceField.',
  status: 'FIXED',
  concepts_affected: ['capacitance'],
  fixed_in_files: RENDERER,
  row_type: 'incident',
};

// ── 3. NEW: S6 chain-link derivation spotlight never wired ─────────────────
const chainLinkUnwired: Row = {
  bug_class: 'capacitance_chain_link_derivation_pulse_unwired',
  title: 'S6\\u2019s three-line derivation (sigma=Q/A, E=sigma/eps0, V=E.d) authored scenario_cue link_1/link_2/link_3 on its narrated sentences expecting a spotlight on the physical element each line explains (dot pool / field lines / gap bracket) -- the renderer only ever revealed the TEXT, no 3D element ever pulsed',
  severity: 'MODERATE',
  owner_cluster: R,
  root_cause: 'capUpdateDerivation() read cd.link_cues directly (not routed through cueTriggerMs, so it also silently ignored SET_CUE_TIME(\\u2019link_1\\u2019/...) from the live player) and only ever produced derivation TEXT lines. No code anywhere applied a glow/brighten pass to the plate-dot pools, field-line shafts, or gap bracket keyed to those same cue times -- eye-walker sampling at THE EYE\\u2019s 1000ms dense cadence found CONSTANT brightness across all three regions for the whole S6 timeline.',
  prevention_rule: 'A scenario_cue authored on a teacher_script sentence (link_1/link_2/...) that names a physical concept ("this line is about X") must be paired with an ACTUAL renderer-side effect on X keyed to the same cueTriggerMs time -- an authored scenario_cue with no renderer consumer is a silent no-op, same failure class as an *_at_ms field nobody reads. When wiring a "spotlight" tied to a derivation reveal, make each segment SUSTAINED (from its cue until the next cue fires, not a brief flash) so any >=1s sampling cadence is guaranteed to catch it, per Rule 32e (exactly one focal at a time).',
  probe_type: 'manual',
  probe_logic: 'MANUAL/EYE: on capacitance STATE_6 (mode:derivation), sample 3D brightness/emissive of the plate-dot pools at t in [1.5s,2.5s), the field-line shafts at t in [2.5s,3.5s), and the gap bracket at t>=3.5s -- each must show a measurably brighter/warmer state than the other two during its own window. capacitance verified fixed: applyCapacitanceGlow(stateDef) now computes capLinkFocalType(cd) from capLinkCueMs(cd) (cueTriggerMs-routed) and brightens cap_dot_grp / cap_field_line / cap_gap_bracket in sequence.',
  status: 'FIXED',
  concepts_affected: ['capacitance'],
  fixed_in_files: RENDERER,
  row_type: 'incident',
};

// ── 4. NEW: pF readout precision diverges from narration/annotation ────────
const pfPrecisionMismatch: Row = {
  bug_class: 'capacitance_pF_readout_precision_mismatch',
  title: 'The live C readout hardcoded (C*1e12).toFixed(1), so STATE_4 showed "177.1 pF" while the narration says "one-seventy-seven picofarads" and the on-canvas annotation says "177 pF" -- three surfaces disagreeing on the same number',
  severity: 'MODERATE',
  owner_cluster: R,
  root_cause: 'A single fixed .toFixed(1) was applied regardless of magnitude. The concept\\u2019s own authored constraint (sigma/E/V chain "stays algebraically consistent... at every state") implies a display-precision expectation matching the round numbers narration/annotations were written against (88.5, 177, 44.3), which a flat 1-decimal format cannot reproduce once the value crosses 100 (177.08 -> "177.1", not "177").',
  prevention_rule: 'A live numeric readout whose value is also spoken in narration and printed as a static on-canvas annotation must use the SAME precision rule the annotation text was authored against, not an arbitrary fixed toFixed(n). For capacitance pF: <100 -> 1 decimal, >=100 -> integer (capFormatPF). When authoring or fixing any readout, cross-check its formatted output against every OTHER surface (tts_sentences, scene_composition annotation text) that states the same number for the same state.',
  probe_type: 'manual',
  probe_logic: 'MANUAL/EYE: capacitance STATE_4 at its settled end pose -- #cap_readout must show "177 pF" (not "177.1 pF"), matching the s4_double_label annotation text "double area -> double charge: 88.5 -> 177 pF" and STATE_3\\u2019s "slope = C -- 88.5 pF" annotation (readout also shows "88.5 pF", <100 branch unaffected). capacitance verified fixed: capFormatPF(pF) added, cap_readout HTML now calls it instead of a flat toFixed(1).',
  status: 'FIXED',
  concepts_affected: ['capacitance'],
  fixed_in_files: RENDERER,
  row_type: 'incident',
};

const rows: Row[] = [sliderPanelUpdate, negPoolContrast, chainLinkUnwired, pfPrecisionMismatch];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string {
  if (a.length === 0) return `ARRAY[]::text[]`;
  return `ARRAY[${a.map(sqlStr).join(', ')}]`;
}
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- ============================================================================
-- 2026-07-21: seed/update engine_bug_queue with the renderer-side fixes from
-- the capacitance quality_auditor FAIL routed to peter_parker:renderer_primitives.
-- Generated by src/scripts/_seed_engine_bug_queue_capacitance_renderer_fixes.ts
-- — idempotent (upsert on bug_class).
-- ============================================================================

INSERT INTO engine_bug_queue (${cols}) VALUES
${all.map(sqlRow).join(',\n')}
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,
  root_cause = EXCLUDED.root_cause, prevention_rule = EXCLUDED.prevention_rule,
  probe_type = EXCLUDED.probe_type, probe_logic = EXCLUDED.probe_logic,
  status = EXCLUDED.status, concepts_affected = EXCLUDED.concepts_affected,
  fixed_in_files = EXCLUDED.fixed_in_files, row_type = EXCLUDED.row_type;
`;
}

async function upsertBatch(rowsIn: Row[], label: string): Promise<boolean> {
  const payload = rowsIn.map((r) => ({ ...r, discovered_in_session: SESSION }));
  const { error } = await supabaseAdmin
    .from('engine_bug_queue')
    .upsert(payload, { onConflict: 'bug_class' });
  if (error) {
    console.error(`  x ${label} upsert failed: ${error.message}`);
    return false;
  }
  console.log(`  ok ${label}: ${rowsIn.length} rows upserted`);
  return true;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-21_seed_engine_bug_queue_capacitance_renderer_fixes_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} rows)`);

  console.log('Upserting capacitance renderer-fix rows...');
  await upsertBatch(rows, 'capacitance_renderer_fixes');

  const { data, error } = await supabaseAdmin
    .from('engine_bug_queue')
    .select('bug_class, status, concepts_affected')
    .in('bug_class', rows.map((r) => r.bug_class));
  if (error) { console.error('verify query failed:', error.message); return; }
  console.log('Verified rows:');
  for (const row of data ?? []) console.log(`  [${row.status}] ${row.bug_class} -- concepts: ${JSON.stringify(row.concepts_affected)}`);
}

main().catch((err) => {
  console.error('seed failed:', err instanceof Error ? err.stack : err);
  process.exit(1);
});
