/**
 * engine_bug_queue rows for the 5 render defects THE EYE + eye-walker found on the
 * NEW magnetic_flux_loop scenario (field_3d_renderer.ts) — magnetic_flux JSON
 * structure PASSED quality_auditor; these are all engine-side, inside
 * buildMagneticFluxLoop / applyMagneticFluxLoopState / updateMagneticFluxLoopFrame /
 * mflApplyPose / mflControlValueAt.
 *
 * Per the "recording -> engine_bug_queue" protocol: seeded OPEN first, then the
 * renderer fix lands, then a follow-up run flips each row to FIXED.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_magnetic_flux_loop_eye_pass.ts
 * Run again with FLIP_TO_FIXED=1 after the fix lands to flip all 5 to FIXED.
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-08_magnetic_flux_loop_eye_pass';
const FLIP_TO_FIXED = process.env.FLIP_TO_FIXED === '1';

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
  concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';

const rows: Row[] = [
  {
    bug_class: 'mfl_control_panel_slider_desync',
    title: 'magnetic_flux_loop: slider handle + numeric label stay pinned at authored defaults (B=0.80T/A=1.00m2/theta=0deg) on every state (S2-S5) AND the live explore state S6, while the physics readout box shows the live/tweened value',
    severity: 'CRITICAL',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `applyMagneticFluxLoopState() writes the slider DOM (value + label text) exactly once, at state-entry, from the STATE default (defB/defA/defTh) — never again. updateMagneticFluxLoopFrame() reads mflControlValueAt() every frame to drive the loop pose + Phi readout (idle-sweep-or-drag), but never writes that live/tweened value back into the #mfl_b_slider / #mfl_a_slider / #mfl_theta_slider DOM elements or their _val label spans. Reproducing in S6 (the free explore state) too rules out "scripted idle-sweep only" — even a manually dragged slider's OWN readout box (which reads mflControlValueAt's dragged branch) is correct, but a SECOND state-entry re-seeds the widget back to the default without re-syncing after any subsequent idle-sweep frame, and the idle-sweep path never touches the widget at all. FIXED 2026-07-08: added mflSyncSliderUI(mfl, Bv, Av, Thv) in ${RENDERER}, called every frame from updateMagneticFluxLoopFrame() right after the live Bv/Av/Thv are computed — writes both slider.value and its _val label span for every row named in mfl.controls (rows not in controls are intentionally static/frozen and untouched). Verified: the same Bv/Av/Thv feed both the readout panel and the slider sync call, so they can never diverge again by construction.`,
    prevention_rule:
      'Any field_3d dedicated slider panel whose live value can change on a per-frame basis (idle sweep, tween, drag) MUST sync BOTH its handle (input.value) and its numeric label span from the SAME live value the frame-update function computes for the readout — every frame, not only on state-entry or on the widget\'s own input event. A widget and its own readout panel must never be able to show different numbers for the same variable.',
    probe_type: 'manual',
    probe_logic:
      'On any magnetic_flux_loop state with a live control (S2-S6), after ~2s let the idle sweep run, then compare the #mfl_readout B/A/theta numbers against the #mfl_b_slider/#mfl_a_slider/#mfl_theta_slider handle position + their _val label text — they must match at every sampled frame.',
    concepts_affected: ['magnetic_flux'],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'mfl_state1_zero_motion_reveal',
    title: 'magnetic_flux_loop STATE_1 (lines_through_window) renders 27 byte-identical frames across ~26s with ZERO motion, despite narration "the tally builds one line at a time" and mode:guided/controls:[] (fully engine-driven motion)',
    severity: 'CRITICAL',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `buildMagneticFluxLoop() seeds every mfl_field_line ArrowHelper visible with a fixed opacity from config.field_lines.opacity, and updateMagneticFluxLoopFrame()'s density/tint pass only fires proportional to the live B value (via visCount) — it never staggers a sequential reveal for a state with controls:[] (nothing to sweep), so a state with no live control renders the fully-populated lattice motionless from frame 1. No per-line reveal timeline existed for this scenario at all. FIXED 2026-07-08: added mflUpdateHookReveal(t) in ${RENDERER}, dispatched from a new isHook branch (controls.length===0 && static_readouts.length===0) in updateMagneticFluxLoopFrame() BEFORE the generic slider/density path. Each of the 16 lattice lines is hidden until its own revealAt=(gridIndex*MFL_REVEAL_STAGGER_MS), then ArrowHelper.setLength ramps it in over MFL_REVEAL_SWEEP_MS (materialize+sweep), then holds at full length (lands); the readout's "lines through = N / 16" tally increments MFL_REVEAL_TALLY_LAG_MS after each landing (Rule 32a as a discrete step); once all 16 have ticked, the Phi=B.A.cos(theta) line appears using the state's default B/A/theta. applyMagneticFluxLoopState() also now resets every field line to full-length/visible/base-colour on every state entry so a fresh S1 replay (or a return visit) starts from a clean hidden lattice, not a stale mid-sweep frame from a prior visit.`,
    prevention_rule:
      'A field_3d state authored controls:[] (guided, nothing user-facing to drive) is NOT exempt from Rule 26/32 motion — if the narration describes a build-up, the renderer must run its OWN pure-function-of-state-clock reveal timeline. Every guided state must be checked for byte-identical consecutive frames across its full duration before declaring a scenario done; a 0-motion opening state is the worst-case regression.',
    probe_type: 'manual',
    probe_logic:
      'On magnetic_flux_loop STATE_1 dense frames, consecutive frames across the full state duration must NOT be byte-identical after the first ~0.5s — lines must appear on a staggered reveal, and the Phi/tally counter text must change at least once after the last line lands.',
    concepts_affected: ['magnetic_flux'],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'mfl_dual_glow_focal_field_lines',
    title: 'magnetic_flux_loop S1/S2/S3: 2 field lines glow bright simultaneously — Rule 32e (exactly ONE glow focal at any instant) violated',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `updateMagneticFluxLoopFrame()'s per-line opacity/tint pass computes 'slotOn' from a coarse (Math.abs(gridY)+Math.abs(gridZ)) <= threshold test against the 4x4 MFL_LINE_GRID, which admits MULTIPLE lattice slots at the same Manhattan-distance tier simultaneously (the grid has symmetric slots at equal |y|+|z|) — so the "brightened" set is never exactly one line, it is a whole distance-tier ring. FIXED 2026-07-08 in ${RENDERER}: S1 now uses mflUpdateHookReveal()'s strict single-focal priority rule (the one currently-ramping line, else the single most-recently-landed line within MFL_REVEAL_SETTLE_MS, chosen by an explicit best-landAt scan — never a tied tier). S2 (controls===['B']) highlights exactly one fixed representative line (gridIndex===MFL_S2_FOCAL_INDEX) at full opacity while every OTHER line is dimmed to 0.6x (brighten-focal + dim-peers, Rule 29/32e). S3 (controls===['A']) highlights the loop RIM (#mfl_loop_edges material) instead of any field line, and applies NO per-line focal boost, so no line competes with it.`,
    prevention_rule:
      'A single-focal reveal/highlight pass over a lattice must rank candidates with a STRICT total order (index/sequence number, not a distance metric with ties) and light exactly the top-1 (or a designated representative), never an entire tied tier. Applies to any field_3d "one thing glows" beat (S1 newest-landed, S2 densest-cluster representative, S3 rim-not-lines).',
    probe_type: 'manual',
    probe_logic:
      'On magnetic_flux_loop S1/S2/S3 dense frames, count field-line ArrowHelpers whose material.opacity is within 5% of the frame-max opacity — must be exactly 1 (S1: the newest-landed line; S2: one densest-cluster representative; S3: none — the rim itself is the focal, no line should out-glow it).',
    concepts_affected: ['magnetic_flux'],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'mfl_state3_enclosed_count_not_scaling',
    title: 'magnetic_flux_loop S3: loop rim visibly grows ~40->330px as A triples, but the enclosed/highlighted line count stays fixed at 2 lines — "more lines" is not visually reinforced by the growing loop',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `updateMagneticFluxLoopFrame()'s 'through' test (Math.abs(gridY) < footprint && Math.abs(gridZ) < footprint) uses 'footprint' correctly derived from the live area (MFL_LOOP_SCALE*sqrt(A)/2), but the fixed 4x4 MFL_LINE_GRID only has 2 lattice slots close enough to the origin to ever cross that threshold across the authored A range (0.25-4.0 m2) — the grid spacing (0.44 world units between rings) is coarser than the footprint's growth (0.25-0.8 world units), so no additional slot is ever captured as A grows. FIXED 2026-07-08 in ${RENDERER}: the box AND-test was replaced by a Euclidean-radius test (radius=sqrt(gridY^2+gridZ^2) <= footprint) against the SAME 4x4 lattice, which has 3 concentric radius tiers of 4 lines each (radius ~=0.311, ~=0.696, ~=0.933) — as footprint climbs from ~0.4 (A=0.25) to ~1.6 (A=4.0) it crosses all 3 tiers, so the enclosed count now climbs 4->8->12->16 across the authored A range instead of saturating near-instantly. The enclosed set gets a secondary "captured" opacity bump (below the sole S2/S3 glow focal, per the dual-glow fix) so the growth is visible without re-introducing a competing focal.`,
    prevention_rule:
      'When a highlighted/enclosed subset of a fixed lattice is meant to visibly scale with a growing geometric footprint, the lattice spacing must be fine enough (or the footprint growth range wide enough) that the enclosed COUNT actually changes across the full authored slider range — verify by sampling the count at range.min, range.mid, range.max before shipping, not just checking the boundary math is directionally correct.',
    probe_type: 'manual',
    probe_logic:
      'On magnetic_flux_loop S3, sample the enclosed/highlighted line count at A=0.25, A=1.0 (default), A=4.0 — the count must strictly increase across that range (expect roughly 4 -> 8-12 -> 16 with the radius-tier fix), never stay pinned at a fixed small number.',
    concepts_affected: ['magnetic_flux'],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'mfl_state4_projection_shadow_weak_shrink',
    title: 'magnetic_flux_loop S4: the A.cos(theta) amber projection-shadow only shrinks ~8% in height between theta=0 and theta=90deg in the captured camera framing, weakening the PRIMARY aha (Phi readout already correctly hits 0.00 at theta=90 but the shadow does not visually match)',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `updateMagneticFluxLoopFrame()'s projection block scales the shadow by sc = Math.sqrt(effCos) * halfWidth, i.e. a RADIUS/half-width scale — for a camera framing where the shadow's on-screen HEIGHT is dominated by a near-constant base size plus a small variable term, sqrt(cos) only reaches its steep collapse very close to theta=90 (sqrt(cos80deg)=~0.42, not visually dramatic against the loop's own unchanged apparent size), so across the authored S4 theta_range [0,90] the shrink reads as subtle rather than "collapsing to a hairline". FIXED 2026-07-08 in ${RENDERER}: the shadow is now scaled ANISOTROPICALLY — the breadth dimension stays at the loop's own half-width (proj.scale.x = hwProj, unchanged, since that axis does not foreshorten under a Y-axis tilt) while the collapsing dimension is driven LINEARLY off effective_area's cos(theta) factor (proj.scale.y = hwProj * max(0.015, cos(theta)), not sqrt) — at theta=80/85/89deg cos is already 0.17/0.087/0.017, so the shadow visibly hairlines well before theta_range's 90deg cap, matching the Phi readout's 0.00. B's ambient line-lattice opacity is driven by Bv/rB.max with a 0.35 floor and B stays a static_readout (unchanging) through S4, so it reads visually constant/pinned throughout — the intended B-pinned/A.cos(theta)-shrinks contrast.`,
    prevention_rule:
      'A shrink-to-zero visual sold as the PRIMARY aha of a state must be driven directly off the SAME effective-area quantity the numeric readout reports (not a geometric proxy like sqrt(cos) chosen for a different scenario\'s disc framing) and must be verified to visibly collapse toward a hairline (near-zero screen height) at the state\'s own theta_range maximum, not just directionally shrink.',
    probe_type: 'manual',
    probe_logic:
      'On magnetic_flux_loop S4 dense frames, the projection shadow\'s on-screen pixel height at theta=90 (theta_range max) must be <=10% of its height at theta=0, while the B field-line lattice remains fully visible/unpinned in strength throughout (the B-pinned/A.cos-theta-shrinks contrast is the aha).',
    concepts_affected: ['magnetic_flux'],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length === 0 ? `ARRAY[]::text[]` : `ARRAY[${a.map(sqlStr).join(', ')}]`; }
function sqlRow(r: Row, status: Status): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[], status: Status): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- 2026-07-08: THE EYE + eye-walker 5-defect pass on magnetic_flux_loop (status=${status}).\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_magnetic_flux_loop_eye_pass.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map((r) => sqlRow(r, status)).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  fixed_in_files = EXCLUDED.fixed_in_files;\n`;
}

async function main(): Promise<void> {
  const status: Status = FLIP_TO_FIXED ? 'FIXED' : 'OPEN';
  const suffix = FLIP_TO_FIXED ? 'fixed' : 'open';
  const sqlPath = join(process.cwd(), 'supabase_migrations', `supabase_2026-07-08_seed_engine_bug_queue_magnetic_flux_loop_eye_pass_${suffix}_migration.sql`);
  writeFileSync(sqlPath, emitSql(rows, status), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s), status=${status})`);

  const payload = rows.map((r) => ({
    bug_class: r.bug_class,
    title: r.title,
    severity: r.severity,
    owner_cluster: r.owner_cluster,
    root_cause: r.root_cause,
    prevention_rule: r.prevention_rule,
    probe_type: r.probe_type,
    probe_logic: r.probe_logic,
    status,
    concepts_affected: r.concepts_affected,
    fixed_in_files: r.fixed_in_files,
    discovered_in_session: SESSION,
    row_type: r.row_type,
    fixed_at: status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ upserted ${payload.length} engine_bug_queue row(s) at status=${status}`);
}

main();
