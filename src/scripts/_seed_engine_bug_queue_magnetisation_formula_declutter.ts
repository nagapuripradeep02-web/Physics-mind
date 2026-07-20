/**
 * engine_bug_queue rows for the quality-auditor FAIL routed to
 * peter_parker:renderer_primitives on magnetisation_and_intensity (2026-07-20):
 * five competing formula surfaces (Rule 34b), a narration-desynced dense-line
 * ramp (Rule 32a), and physically-fictitious susceptibilities whose readout
 * additionally hid the tiny dia/para numbers under fixed-precision rounding.
 * All four fixed in the SAME renderer_primitives session, in
 * src/lib/renderers/field_3d_renderer.ts, gated to scenario_type === "magnetisation".
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_magnetisation_formula_declutter.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-20_magnetisation_formula_declutter';
const FIXED_FILES = ['src/lib/renderers/field_3d_renderer.ts'];

type Row = {
  bug_class: string;
  title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  root_cause: string;
  prevention_rule: string;
  probe_type: 'sql' | 'js_eval' | 'manual';
  probe_logic: string;
  concepts_affected: string[];
};

const rows: Row[] = [
  {
    bug_class: 'mag_formula_surface_duplication',
    title:
      'magnetisation_and_intensity: the same relation (H = nI, B = mu0(H+M)) is printed on up to five competing on-canvas surfaces at once — the 3D coil sprite, the state-legend body line, the mag_readout HUD (with the derivation baked into the label), the field_3d_config.states label header (rendered as the legend bold title), and the intentional big formula_overlay panel — instead of ONE prominent surface (Rule 34b).',
    severity: 'MODERATE',
    root_cause:
      'The earlier mag_formula_not_prominent fix ADDED the prominent formula_overlay panel but never retired the pre-existing surfaces that said the same thing: createWideLabelSprite("solenoid: H = n I", ...), the magMode==="sum" legend line "B = mu0(H + M): applied + material", and the mag_readout HUD lines built as "M = chiH = <value>" / "B = mu0(H+M) = <value>" / "mu_r = 1+chi = <value>" (derivation baked into the label instead of value-only).',
    prevention_rule:
      'When adding a prominent formula_overlay panel to a scenario, grep every OTHER text surface that scenario touches (3D sprite labels, the state-aware legend branch, the readout/HUD builder, the field_3d_config.states.label header) for the same symbols and strip the redundant ones down to a plain object/quantity label (Rule 34b: one formula surface; readouts stay value-only, never "symbol = value").',
    probe_type: 'js_eval',
    probe_logic:
      'On any magnetisation state with show_readout, assert #mag_readout innerHTML contains no "=" followed by a Greek/formula token before the numeric value (i.e. no "chiH =", "mu0(H+M) =", "1+chi =" patterns) — every readout line is "<symbol> = <value> <unit>" with no embedded derivation. Also assert the 3D sprite text for id mag_coil_lbl is exactly "solenoid" (no formula), and the magMode==="sum" legend line contains no "=" sign.',
    concepts_affected: ['magnetisation_and_intensity'],
  },
  {
    bug_class: 'mag_dense_pack_cue_desync',
    title:
      'magnetisation_and_intensity STATE_4: the internal dense-field-line ramp (denseOp) always started at state entry and completed by t=1.5s, but the sentence narrating it ("watch the internal field lines pack in denser", s4_2) lands ~10-20s into the ~30s state — the teacher says "watch" onto an already-settled pose (Rule 32a cause-before-effect violation).',
    severity: 'MODERATE',
    root_cause:
      'updateMagnetisationFrame() computed denseOp as a pure function of state-local clock time (0.85*min(1,t/1.5)) with no binding to the narration timeline, so the one-shot always fired far ahead of the sentence that describes it.',
    prevention_rule:
      'Any scenario one-shot that a sentence explicitly narrates ("watch X happen") must be bound via the scenario-cue channel (SET_CUE_TIME + cueTriggerMs(name, fallbackMs)) so it fires on the narrated beat in the live player, while keeping the original *_at_ms-equivalent fallback (here: ramp-from-state-entry) so THE EYE, which never sends a cue, still captures a deterministic settled pose.',
    probe_type: 'js_eval',
    probe_logic:
      "Live player: on STATE_4 entry, before SET_CUE_TIME('dense_pack', ...) is posted, mag_fl_dense opacity stays 0; after the player posts SET_CUE_TIME('dense_pack', tMs) at s4_2's narrated start, opacity begins ramping from that point and reaches 0.85 by tMs+1500. THE EYE (no cue sent): opacity ramps from t=0 exactly as before (denseStartS falls back to 0), so frozen frames are byte-identical to pre-fix baselines.",
    concepts_affected: ['magnetisation_and_intensity'],
  },
  {
    bug_class: 'mag_material_susceptibility_unphysical',
    title:
      "magnetisation_and_intensity's three materials used exaggerated placeholder susceptibilities (dia chi=-0.08, para chi=0.60, ferro chi=199) that are 3-4 orders of magnitude off real matter (bismuth chi~-1.66e-5, aluminium chi~2.3e-5, iron-order chi~1e3 per NCERT Ch.5 Table 5.2) — the H/M/B/mu_r readout taught fictitious numbers even though the qualitative sign/ordering was correct.",
    severity: 'MAJOR',
    root_cause:
      "magMaterial(idx) hardcoded chi values chosen only to make the dipole-alignment animation and the B jump visually obvious, conflating the ANIMATION-drive quantity ('align', a 0..1 tilt fraction) with the READOUT quantity ('chi', which feeds the exact formulas M=chiH, B=mu0(H+M), mu_r=1+chi) in one shared object literal.",
    prevention_rule:
      "Decouple animation-drive magnitudes from physics-readout magnitudes on any scenario data table: an 'align'/'intensity fraction' field may be exaggerated for legibility (Rule 29 exempts a real physical magnitude that is deliberately scaled for visibility, e.g. tauThrob), but any field feeding a live numeric readout (chi here) must be the physically true order-of-magnitude value, with the readout's number FORMATTING (not the underlying value) doing the legibility work when the true magnitude is very small or very large.",
    probe_type: 'manual',
    probe_logic:
      'Compare magMaterial(1/2/3).chi against NCERT Physics Part 2 Ch.5 Table 5.2 (dia: bismuth -1.66e-5; para: aluminium 2.3e-5; ferro: iron-order ~1e3) — values must match order of magnitude. align (-0.14/0.40/1.0) is intentionally unchanged and drives visuals only.',
    concepts_affected: ['magnetisation_and_intensity'],
  },
  {
    bug_class: 'mag_readout_fixed_precision_hides_small_materials',
    title:
      'A direct switch to physically-true susceptibilities would make the mag_readout HUD unusable: Math.round(M) prints "0 A/m" for both dia and para at classroom H values (M~0.05-0.12 A/m), and mu_r.toFixed(2) prints "1.00" for BOTH — the readout would teach that two of the three materials are indistinguishable, defeating STATE_5\'s "three materials, three chi" aha.',
    severity: 'MODERATE',
    root_cause:
      'The HUD formatted M via Math.round() and mu_r via a fixed .toFixed(2), both tuned for the old exaggerated chi values (para M~1800 A/m, mu_r spread 0.92/1.6/200) — precision assumptions that silently break once chi becomes physically small for dia/para.',
    prevention_rule:
      'Any live numeric readout spanning many orders of magnitude across sibling states/materials (here dia ~1e-5, para ~1e-5, ferro ~1e3) needs ADAPTIVE formatting, not a single fixed decimal count: switch to scientific notation (real Unicode x10^n via superscript digits, Rule 34c) outside a legible fixed-point band, and scale decimal count on near-unity quantities (mu_r) by the actual deviation from 1 so materials with a tiny but nonzero effect stay visibly distinct from vacuum/each other.',
    probe_type: 'js_eval',
    probe_logic:
      'At H=3000 A/m and H=5000 A/m, mag_readout must render THREE DISTINCT non-"0"/non-"1.00" values for M and mu_r across dia/para/ferro (e.g. dia M=−0.050 A/m, para M=0.069 A/m, ferro M=3.00×10⁶ A/m at H=3000; dia mu_r=0.9999834, para mu_r=1.0000230, ferro mu_r=1001) — no two materials collapse to the same displayed string, and every string uses real Unicode (×, superscript digits, −, μᵣ, χ), never ASCII (x10^-5, mu_r).',
    concepts_affected: ['magnetisation_and_intensity'],
  },
];

function sqlStr(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}
function sqlArr(a: string[]): string {
  return a.length === 0 ? `ARRAY[]::text[]` : `ARRAY[${a.map(sqlStr).join(', ')}]`;
}

async function main(): Promise<void> {
  const sqlPath = join(
    process.cwd(),
    'supabase_migrations',
    'supabase_2026-07-20_seed_engine_bug_queue_magnetisation_formula_declutter_migration.sql',
  );
  const cols =
    'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  let sql =
    `-- 2026-07-20: renderer_primitives fixes for the magnetisation_and_intensity quality-auditor FAIL\n` +
    `-- (formula-surface duplication, narration-desynced dense-pack ramp, unphysical chi + the\n` +
    `-- adaptive-precision readout fix that had to ship alongside it). All status=FIXED.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_magnetisation_formula_declutter.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n`;
  sql += rows
    .map(
      (row) =>
        `(${sqlStr(row.bug_class)}, ${sqlStr(row.title)}, ${sqlStr(row.severity)}, 'peter_parker:renderer_primitives', ` +
        `${sqlStr(row.root_cause)}, ${sqlStr(row.prevention_rule)}, ${sqlStr(row.probe_type)}, ${sqlStr(row.probe_logic)}, ` +
        `'FIXED', ${sqlArr(row.concepts_affected)}, ${sqlArr(FIXED_FILES)}, ${sqlStr(SESSION)}, 'incident')`,
    )
    .join(',\n');
  sql +=
    `\nON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic, title = EXCLUDED.title,\n` +
    `  severity = EXCLUDED.severity, concepts_affected = EXCLUDED.concepts_affected,\n` +
    `  fixed_in_files = EXCLUDED.fixed_in_files, fixed_at = now();\n`;
  writeFileSync(sqlPath, sql, 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath}`);

  for (const row of rows) {
    const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(
      {
        bug_class: row.bug_class,
        title: row.title,
        severity: row.severity,
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: row.root_cause,
        prevention_rule: row.prevention_rule,
        probe_type: row.probe_type,
        probe_logic: row.probe_logic,
        status: 'FIXED',
        concepts_affected: row.concepts_affected,
        fixed_in_files: FIXED_FILES,
        discovered_in_session: SESSION,
        row_type: 'incident',
        fixed_at: new Date().toISOString(),
      },
      { onConflict: 'bug_class' },
    );
    if (error) {
      console.error(`✗ upsert failed for ${row.bug_class}: ${error.message}`);
      process.exit(1);
    }
    console.log(`✓ upserted ${row.bug_class} at status=FIXED`);
  }
}

main();
