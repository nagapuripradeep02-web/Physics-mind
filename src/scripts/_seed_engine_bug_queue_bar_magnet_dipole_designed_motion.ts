/**
 * engine_bug_queue row for the bar_magnet_as_dipole FAIL routed to
 * peter_parker:renderer_primitives ([reason: bug-class — designed motion
 * unimplemented]). The concept JSON (9 states) fully declared per-state
 * `extras` choreography (compass settle, two-phase loop trace, break + off-
 * centre second cut + frozen payoff, 180° flip, solenoid cross-fade, ghost-
 * ratio + angle-orbit, r-sweep + 1/r^2 ghost + callout, electric-dipole
 * glide) but field_3d_renderer.ts's bar_magnet_as_dipole scenario region only
 * implemented the base tracer stream + a single shared sine-based r-sweep
 * used indistinguishably by BOTH the S6 (angle-orbit) and S7 (radial-sweep)
 * misconception-contrast states, and the arrow-length formula had no ceiling
 * (clipped the +/-4 world-unit frame at m=10,r=1.2) and only a low floor
 * (collapsed the 2:1 axial:equatorial ratio at m=1,r=4).
 *
 * Fixed in this session: added a shared display-only length-compression
 * helper (bmDisplayLenFromB / bmDisplayAxialLen, eq always exactly half of
 * axial so the TRUE 2:1 ratio survives compression), split S6 (locked-r
 * angle-orbit) from S7 (locked-theta r-sweep with a dashed 1/r^2 ghost +
 * "Real /8, guess /4" callout), implemented the S4 flip / S5 solenoid cross-
 * fade / S8 electric-dipole glide / S1 field-reveal+compass-settle-with-dim
 * choreography, added the S2 two-phase ghost-death-then-real-close loop
 * trace and the S3 off-centre second-cut + genuine static frozen_pose_ms
 * payoff, wired per-state m/r control-ROW visibility (bm_m_row / bm_r_row +
 * applyVisibleControls), and registered every beat's timing in
 * deriveStateMeta.ts (deriveMotionExpectations + deriveHoldExpectations +
 * maxRevealForField3dState) so THE EYE captures the payoff pose instead of a
 * transient or a false "motion died" / false "stuck tail".
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_bar_magnet_dipole_designed_motion.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-12_bar_magnet_as_dipole_renderer_build';

const row = {
  bug_class: 'bar_magnet_dipole_designed_motion_unimplemented',
  title:
    'bar_magnet_as_dipole: the 9-state designed choreography (compass settle, two-phase loop trace, break+second-cut+frozen payoff, 180deg flip, solenoid cross-fade, ghost-ratio+angle-orbit, r-sweep+1/r^2 ghost+callout, electric-dipole glide) was declared in the concept JSON extras but never implemented in field_3d_renderer.ts — S6/S7 ran the SAME undifferentiated sine r-sweep, and the probe arrow length formula had no ceiling (clipped at m=10,r=1.2) and a low floor (collapsed the 2:1 axial:equatorial ratio at m=1,r=4).',
  severity: 'MAJOR' as const,
  owner_cluster: 'peter_parker:renderer_primitives' as const,
  root_cause:
    'buildBarMagnetAsDipole/updateBarMagnetAsDipoleFrame only ever implemented the base N->S tracer stream + generic per-state visible_elements token matching + a single legacy break-anim loop; every OTHER per-state extras key (compass_settle, loop_choreography, second_cut, frozen_pose_ms, flip_anim, moment_scales_with_m, brightness_pulse_on_drag, solenoid_crossfade, ghost_ratio_pair, orbit_probe, ghost_1_over_r2, r_sweep_theta_locked, callout_at_r_ge, edipole_glide) was read nowhere in the renderer, and bmApplyExplorer\'s refL = base*(2/r)^3 formula had no upper clamp (clips the +/-4 frame at the m=10,r=1.2 extreme) and only a low per-arrow floor (0.15/0.08) that let the 2:1 axial:equatorial ratio collapse at the m=1,r=4 extreme since each arrow was floor-clamped independently rather than derived from a shared compressed reference.',
  prevention_rule:
    'When a field_3d scenario ships a per-state `extras` choreography contract, every extras KEY the JSON declares must have a matching renderer branch before the concept reaches quality_auditor/THE EYE — grep the concept JSON\'s field_3d_config.states.*.extras keys against the renderer\'s updateBar-/update<Scenario>Frame function and flag any key with zero matches. When two states share one physical formula family (e.g. axial:equatorial, both varying with r), verify each state\'s renderer branch actually holds the OTHER varying input LOCKED (S6 locks r, varies theta; S7 locks theta, varies r) rather than reusing one generic sweep for both. When an inverse-power display quantity (1/r^3) is compressed for on-screen legibility, derive any FIXED-ratio sibling value (e.g. B_equatorial = B_axial/2, always) from the compressed PRIMARY value rather than compressing each independently — independent compression of two values with a constant true ratio destroys that ratio visually.',
  probe_type: 'manual' as const,
  probe_logic:
    'On bar_magnet_as_dipole: (1) drag m to 10 and r to 1.2 on STATE_9 — the axial probe arrow must stay within the +/-4 world-unit camera frame (not clip); (2) drag m to 1 and r to 4 — neither arrow may vanish to a zero/near-zero length; (3) at every m,r the axial arrow must render visibly ~2x the equatorial arrow\'s length (bmDisplayAxialLen\'s eq = axial*0.5 invariant); (4) STATE_6 dense frames show a locked-r (r=2) angle change (ghost pair -> real 2:1 snap -> quarter-arc glide), NOT a radial sweep; (5) STATE_7 dense frames show a locked-theta r-sweep (2->4) with a visibly slower-shrinking dashed ghost pair and a "Real /8, guess /4" callout appearing near r=3.9, NOT the same motion as STATE_6; (6) STATE_3\'s dense/frozen capture reaches a genuinely STATIC pose (both halves separated, new poles lit, no further rejoin) at or after ~14.8s state-local time.',
  concepts_affected: ['bar_magnet_as_dipole'],
  fixed_in_files: [
    'src/lib/renderers/field_3d_renderer.ts',
    'src/lib/validators/visual/deriveStateMeta.ts',
  ] as string[],
  row_type: 'incident' as const,
};

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length === 0 ? `ARRAY[]::text[]` : `ARRAY[${a.map(sqlStr).join(', ')}]`; }

async function main(): Promise<void> {
  const sqlPath = join(
    process.cwd(),
    'supabase_migrations',
    'supabase_2026-07-12_seed_engine_bug_queue_bar_magnet_dipole_designed_motion_fixed_migration.sql',
  );
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  const sql =
    `-- 2026-07-12: renderer_primitives FAIL-routed fix for bar_magnet_as_dipole designed motion (status=FIXED).\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_bar_magnet_dipole_designed_motion.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n` +
    `(${sqlStr(row.bug_class)}, ${sqlStr(row.title)}, ${sqlStr(row.severity)}, ${sqlStr(row.owner_cluster)}, ` +
    `${sqlStr(row.root_cause)}, ${sqlStr(row.prevention_rule)}, ${sqlStr(row.probe_type)}, ${sqlStr(row.probe_logic)}, ` +
    `'FIXED', ${sqlArr(row.concepts_affected)}, ${sqlArr(row.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(row.row_type)})\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  fixed_in_files = EXCLUDED.fixed_in_files, fixed_at = now();\n`;
  writeFileSync(sqlPath, sql, 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath}`);

  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(
    {
      bug_class: row.bug_class,
      title: row.title,
      severity: row.severity,
      owner_cluster: row.owner_cluster,
      root_cause: row.root_cause,
      prevention_rule: row.prevention_rule,
      probe_type: row.probe_type,
      probe_logic: row.probe_logic,
      status: 'FIXED',
      concepts_affected: row.concepts_affected,
      fixed_in_files: row.fixed_in_files,
      discovered_in_session: SESSION,
      row_type: row.row_type,
      fixed_at: new Date().toISOString(),
    },
    { onConflict: 'bug_class' },
  );
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ upserted engine_bug_queue row at status=FIXED`);
}

main();
