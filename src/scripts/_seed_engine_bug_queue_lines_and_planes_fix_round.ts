/**
 * engine_bug_queue — #9 `lines_and_planes_in_space` FIX ROUND, 2026-08-10.
 * The queue writes for the session that executed the handoff's §2a/§2b/§2c fix
 * list, absorbed the first-ever quality_auditor pass (FAIL, four findings, all
 * verified and fixed), and ran the six-dispatch engine sequence (PRs #108–#114,
 * gate 712 → 1015 PASS).
 *
 * SHAPE (the §2a doctrine, held since the seed-guard retrofit): every write is
 * MARKER-GATED — a row already carrying its note is never touched again — the
 * emitted SQL is generated from the SAME structures this file applies, no write
 * ever downgrades a protected status, and the migration is committed in the
 * SAME change as the DB write.
 *
 * EIGHT CLOSES · FOUR ANNOTATE-KEEP-OPEN · ONE NEW ROW.
 * (The projection-deferral row was closed by its own dispatch's script, which
 * rides PR #108 — verified FIXED here, not re-written.)
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_lines_and_planes_fix_round.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const FIXED_AT = '2026-08-10T12:17:59.000Z';
const J = 'src/data/concepts/mathematics/lines_and_planes_in_space.json';
const R = 'src/lib/renderers/field_3d_renderer.ts';
const GATE = 'src/scripts/check_vector_geometry_3d.ts';

interface Update {
  bug_class: string; marker: string; note: string;
  status?: 'FIXED'; fixed_at?: string; fixed_in_files?: string[];
}

const UPDATES: Update[] = [
  // ── the six chapter-side closes ─────────────────────────────────────────
  {
    bug_class: 'vg_state_authors_controls_without_show_sliders_so_the_row_is_unreachable',
    marker: 'FIXED 2026-08-10 (fix-list §2b)',
    status: 'FIXED', fixed_at: FIXED_AT, fixed_in_files: [J],
    note: ' FIXED 2026-08-10 (fix-list §2b): show_sliders: true authored at the state level on STATE_1/STATE_2/STATE_6 (the stateDef key the panel gate reads, placed as STATE_9 places it). Verified from PIXELS by both reviewers: S1 λ row tracking its ramp (-0.81 at t=9000 matches the closed form), S2 patch-size row, S6 θ row. The JSON probe (non-empty vg.controls ⇒ show_sliders) holds on all four control-bearing states.',
  },
  {
    bug_class: 'vg_misconception_counter_number_arrives_after_the_false_picture_is_gone',
    marker: 'arrival 1620 ms, 380 ms before',
    status: 'FIXED', fixed_at: FIXED_AT, fixed_in_files: [J],
    note: ' FIXED 2026-08-10 (fix-list §2c): common_perpendicular re-authored reveal_at_ms 0 / grow_ms 1800 — arrival computed against the THRESHOLD (0.999 through the ease-out cubic = reveal + 0.9·grow) gives arrival 1620 ms, 380 ms before the crossing marker’s 2000 ms reveal, co-present through its whole 2000–3500 window (was 5780, never co-present). quality_auditor proved it from pixels ("shortest distance = 1.800" beside the pulsing marker at t=3000) and independently recomputed the value: 2.033591/1.129773 = 1.79999. The misconception_watch claim ("the live reading already says 1.80 apart before the marker ever appears") is now TRUE. At the illusion camera the perpendicular is near end-on, so the NUMBER leads and the segment becomes visible on the 7.5 s orbit — the designed beat.',
  },
  {
    bug_class: 'vg_readout_token_authored_on_a_state_whose_constructs_never_publish_it',
    marker: 'swept two instances beyond the filed row',
    status: 'FIXED', fixed_at: FIXED_AT, fixed_in_files: [J],
    note: ' FIXED 2026-08-10 (fix-list §2c), and the sweep found TWO instances beyond the filed row: besides STATE_1/STATE_9 lambda, STATE_2 authored n_norm (published only inside the perpendicular block — S2 authors no perpendicular) and STATE_9 authored angle_lines_deg (published only by an arc — S9 authors no arcs). All four dead tokens removed by sweeping EVERY state’s value_readouts against the constructs that state actually authors. STATE_1’s live λ number is the slider row, which vgSyncRampedRows drives from the resolved animate value every frame; its scene_composition note now names that surface. The empty list also hides the panel entirely on S1, killing the stale-row flash at entry as a side effect.',
  },
  {
    bug_class: 'vg_explore_state_surfaces_advanced_ring_content_under_a_reduced_preset',
    marker: 'the second attempt closed it',
    status: 'FIXED', fixed_at: FIXED_AT, fixed_in_files: [J],
    note: ' FIXED 2026-08-10, and the second attempt closed it — the first (§2c) removed only the cross_norm/numerator_triple_product TOKENS while the cross_vec VECTOR OBJECT survived in group B (the edit was dropped in a compact-anchor rewrite; invisible to THE EYE because scene_group defaults to A and no captured frame can contain group B). quality_auditor’s machine ring-check caught it: d₁×d₂ notation was introduced only by STATE_8, hidden by BOTH reduced presets, while STATE_9 is hidden by none. cross_vec is now deleted; STATE_9’s readouts are point_plane_distance / n_norm / skew_distance and its resolved surfaces are d / d₁ / d₂ only — coherent under every preset. The notation ladder carries a dated amendment superseding its refuted group-B 38b claim.',
  },
  {
    bug_class: 'vg_one_symbol_carries_two_meanings_across_states_of_one_concept',
    marker: 'capital D on every rendered and mirrored surface',
    status: 'FIXED', fixed_at: FIXED_AT, fixed_in_files: [J, 'docs/skeletons/lines_and_planes_in_space_mathematics_block.md'],
    note: ' FIXED 2026-08-10 (fix-list §2c + auditor F4): the distance is capital D on every rendered and mirrored surface — STATE_3/STATE_8 formula_overlay, STATE_8’s epic mirror, the two epic scene_composition formula labels the first pass missed (the auditor caught the JSON contradicting its own formulas-block declaration), and physics_engine_config.formulas, which now states the reservation in prose: lowercase d is the direction concept-wide, D the distance. Choice recorded in the mathematics block’s notation ladder.',
  },
  {
    bug_class: 'vg_lp_line_label_does_not_render_on_an_offset_animated_line_although_it_is_authored',
    marker: 'hypothesis (3) CONFIRMED by computation',
    status: 'FIXED', fixed_at: FIXED_AT, fixed_in_files: [J],
    note: ' FIXED 2026-08-10 — ROOT CAUSE PROVEN, and it was none of the dispatch-favoured suspects. The row’s own three discriminating tests were run by quality_auditor: hypotheses (1) dir1/dir2 role interaction and (2) the offset are REFUTED by a single frame (aux_a = 0, both offsets dead, d₂ renders while d₁ does not); hypothesis (3) CONFIRMED by computation — STATE_6’s camera sat at r = 5.0, HALF A UNIT OUTSIDE VG_SCENE_RADIUS 4.5, with M1’s label point (pinned to the far sphere-clip end) 47.4° off-axis, outside any plausible frustum, while M2’s sat at 23.8° and rendered. Fix is AUTHORING, not engine: camera scaled to sibling radius 13 (same viewing direction; S5, whose pair "returns" in S6, is also at 13). Pixel-verified on the fresh EYE dump: d₁ AND d₂ both label, at θ = 69.4/110.9/115.0. The n=1 eye-walk attribution (dir1+offset) is retracted by this evidence. Residual engine hardening (an authored-label-must-project-on-frame gate) remains a candidate probe, not a defect.',
  },
  // ── the two engine closes whose PRs carry the fix (D1's row closed by its own script in PR #108) ──
  {
    bug_class: 'vg_segment_length_readout_borrows_the_point_plane_distance_label',
    marker: 'the borrow is now unrepresentable',
    status: 'FIXED', fixed_at: FIXED_AT, fixed_in_files: [R, GATE],
    note: ' FIXED 2026-08-10, PR #109 (stacked on #108; merge pending at close time): new first-class segment_length token (label "segment length", 3 dp matching its sibling — the dispatch said 2, the sibling and the table’s own doctrine say 3); readout:"length" publishes it and never point_plane_distance, so the borrow is now unrepresentable. The split also killed a LATENT defect the shared token was hiding: the segments pass runs after F13a, so a co-arrived perpendicular + length-segment silently OVERWROTE the true distance under the "distance" label — dodged in shipped STATE_3 only because its hide_at_ms coincides with the perpendicular’s reveal. Zero readout:"length" consumers exist on master; the only author is unmerged #9. Gate §24 (34 assertions / 3 negative controls) reproduces the founder’s pixel evidence pre-fix. AUTHORING FOLLOW-UP on the #9 branch after merge: STATE_3 value_readouts must add segment_length or the sweep goes silent (better than lying, not yet the two-row payoff).',
  },
  {
    bug_class: 'vg_theta_deg_slider_row_is_labelled_for_products_mode_objects_in_every_mode',
    marker: 'derived at apply time, never swapped for another literal',
    status: 'FIXED', fixed_at: FIXED_AT, fixed_in_files: [R, GATE],
    note: ' FIXED 2026-08-10, PR #110 (stacked; merge pending at close time): the label is derived at apply time, never swapped for another literal (a per-mode string is the same defect one mode deeper) — the object whose rotate block binds theta_deg + the first other labelled object in the LIVE scene group. #9 S6 and S9-group-B read "θ (d₁, d₂)"; S9-group-A reads bare "θ" (nothing there binds the knob — naming group B’s lines would be the same class of lie); every products state byte-identical "θ (a, b)". Six un-derivable cases fall back to bare θ, never invented objects; restore-every-row via VG_ROW_LABEL; the scene-group picker re-writes labels. PREMISE CORRECTION recorded: Act I authors mode:"products" explicitly on all 8 states (the dispatch believed mode was omitted); the negative gate makes both identical. Six other object-naming rows (|a|, |b|, b tilt, θ c, φ c, |c|) are unreachable from any lines_planes state — pinned in gate §25 so future reachability fails loudly.',
  },
  // ── the four annotate-keep-OPEN ─────────────────────────────────────────
  {
    bug_class: 'vg_offset_animate_ends_off_zero_so_a_rotated_line_leaves_its_shared_arc_apex',
    marker: 'RESIDUE 2026-08-10',
    note: ' PARTIALLY DISCHARGED, RESIDUE 2026-08-10: the authored-timeline half is fixed and pixel-verified — the second aux_a window ends at 0 (offset = along·(knob − zero), so the anchor is home before the θ ramp), a holding window keeps θ at 69.3846 through the slide, and the arc is seated at θ = 69.4/110.9/115.0 on the fresh dump (an eye-walk refutation at high θ was tested at the exact filed negative-control angle and did NOT reproduce — its frames were the old r=5 camera that sat outside the scene sphere). THE RESIDUE, found by quality_auditor: §2b made theta_deg LIVE from ms 0 through the drag-seize funnel while aux_a is a pure un-seizable ramp — a teacher dragging θ during [0, 8000) rotates M2 about an apex its displaced anchor does not pass through, up to ~1 unit, self-healing at 8000 ms. The probe must sweep stateMs ∈ [0, 8000) × the θ range, not only the settled window. Close needs either per-window control gating (no authoring surface exists) or an accepted design note that the slide beat tolerates a transient drag detachment.',
  },
  {
    bug_class: 'vg_plane_reveal_fraction_scales_its_normal_so_a_carried_normal_is_deleted_and_regrown',
    marker: 'AUTHORED AROUND 2026-08-10',
    note: ' AUTHORED AROUND 2026-08-10 on the reporting concept; ENGINE HALF REMAINS. #9 STATE_2 no longer frac-grows its plane: the plane is present at frac 1 from ms 1 (state reveal_ms 1) and GROWS by animating the already-bound half_extent knob 0.4→3.0 over 4 s — the normal (length = normal_len · P.frac) stays full from the first frame, pixel-verified, and the row’s own S1→S2 negative control now PASSES. The ENGINE coupling is untouched: a normal still cannot declare a reveal independent of its parent plane, so any future concept that frac-grows a plane with show_normal reproduces this row — that is what keeps it OPEN. Auditor F7, founder-taste, recorded: at the seam the patch now visibly shrinks from S1’s full ghost to a 0.4 sliver before unfolding — the scar’s letter passes (the normal is never deleted), Rule 32d’s spirit is a founder call on the opening frame.',
  },
  {
    bug_class: 'vg_explore_animate_windows_are_finite_so_the_free_running_sandbox_freezes',
    marker: 'ENGINE MECHANISM SHIPPED 2026-08-10',
    note: ' ENGINE MECHANISM SHIPPED 2026-08-10, PR #113 (stacked; merge pending): authored vg.animate_loop_ms — animate[] evaluates against stateMs % period, the wrap living INSIDE vgAnimValue so the object-level reveal/hide/ghost chains, the grow-in ease and camera_steps structurally cannot see the wrapped clock (a looping sandbox never re-plays a reveal — proven end-to-end). Drag-seize returns before the wrap. deriveStateMeta changed in the SAME commit (the #95 scar): first-cycle pin semantics, and hold classification now refuses reveal_hold on a looping guided state so D7’s stuck-tail check stays armed. Gate §27, 54 assertions; strict no-op on every shipped concept. ROW STAYS OPEN: the negative control (STATE_9 constant at 80000 ms) still fails on the shipped state until the #9 desk authors the follow-up — collapse the eight λ windows to one closed ping-pong cycle (0→9000 −3.5→3.5, 9000→18000 3.5→−3.5) + animate_loop_ms: 18000 — and gate §27(i) hard-FAILs on the merged desk until it does.',
  },
  {
    bug_class: 'vg_explore_controls_are_not_group_aware_so_half_the_sliders_are_inert',
    marker: 'COUNTS CORRECTED 2026-08-10',
    note: ' ENGINE MECHANISM SHIPPED + COUNTS CORRECTED 2026-08-10, PR #114 (stacked; merge pending): authored vg.group_controls keyed by scene-group, flat controls as fallback (byte-identical for every shipped state); the row-visibility pass is extracted and re-run on the picker path ONLY (never the full apply — drag-seize flags, per-state ranges and the ⚙ engine all proven untouched); scene_group is deliberately unpartitionable (a group that hid the picker would be a trap). CORRECTION to this row’s probe_logic: "4 of 6 rows are inert in group A" is the GROUP-B count — measured through the shipped resolver: A = 2 inert (theta_deg, line2_offset), B = 4 inert (lambda, lambda_span, half_extent, q_height). Gate §28, 60 assertions, measures both. ROW STAYS OPEN until the #9 desk authors group_controls { A: [lambda, lambda_span, half_extent, q_height], B: [theta_deg, line2_offset] } — §28(h) hard-FAILs on the merged desk until it does.',
  },
];

/** The one NEW row — D4's finding: the eye-walk's string hypothesis was refuted; the defect is the FONT. */
const NEW_ROW = {
  bug_class: 'vg_readout_norm_bars_merge_to_one_stroke_in_the_readout_font_stack',
  title: 'The readout panel’s serif stack has no usable U+2016, so ‖d₁×d₂‖ rendered as |d₁×d₂| beside a formula surface drawing it correctly',
  severity: 'MODERATE' as const,
  owner_cluster: 'peter_parker:field3d_surgeon' as const,
  root_cause: 'Filed by the 2026-08-10 eye-walk as a wrong LABEL STRING (HUD "|d₁×d₂| = 0.936" under a formula surface writing ‖d₁×d₂‖); the dispatch REFUTED the premise — VG_READOUT_LABEL.cross_norm has been "‖d₁×d₂‖" (real U+2016) since the VG-C build, and git log --all -S shows a single-bar literal NEVER existed in the tree. The defect is the GLYPH: the #vg_readout cssText ended "Cambria Math",Georgia,serif, and neither Georgia nor the serif default ships a usable DOUBLE VERTICAL LINE — measured in THE EYE’s own Chromium, ‖ advances 3.65px under the serif stack (both strokes collapsing to one 2px stem at 13px) vs 7.80px under monospace, the generic #formula_overlay itself uses. S9’s "correct" ‖n‖ was the identical merge on a narrower letter — the eye-walk’s own control case was wrong. Fixed by ONE WORD: the panel’s last-resort family becomes monospace, so both surfaces of one screen resolve the norm bar through the same font; per-character fallback proven to move exactly one glyph (every other character byte-identical under both stacks). The products half’s |a|, |b|, |a×b| are that concept’s own consistent school magnitude notation and were deliberately NOT rewritten — doing so would plant this bug_class mirrored. RESIDUAL RISK, untestable on this machine: a client with Cambria Math actually installed resolves ‖ through Cambria Math instead; as a math font its norm delimiter should be properly spaced, but it was not measurable here. RE-BASELINE NOTE: every #9 frame printing n_norm/cross_norm changes pixels — H2 re-baseline after founder OK (Rule 34e), chapter desk.',
  prevention_rule: 'A glyph the design depends on is verified in the FONT STACK that has to draw it, at the size it draws at — a correct string in a font without the glyph is the same defect as a wrong string, and invisible to every source-level check. When a label looks wrong on pixels, diff the STRING first (git log -S), then the RENDER: the two have different owners and different fixes. Distinct surfaces showing one quantity resolve its critical glyphs through the same font family.',
  probe_type: 'js_eval' as const,
  probe_logic: 'Gate §26: render cross_norm/n_norm through the shipped vgReadoutLine and assert exactly two U+2016 and zero U+007C beside the vector name; parse the shipped #vg_readout cssText and assert its last-resort family is monospace and matches #formula_overlay’s generic; table-wide bar audit — every token classified scalar/vector, single bars never wrap a vector in the lines/planes half, the products-half allowlist byte-locked. Negative controls (both executed, anchor-guarded): a planted single-bar label table, and the genuine pre-fix serif cssText.',
  status: 'FIXED' as const,
  concepts_affected: ['lines_and_planes_in_space'],
  fixed_in_files: [R, GATE],
  discovered_in_session: 'session_2026-08-10_lines_and_planes_fix_round',
  row_type: 'incident' as const,
  fixed_at: FIXED_AT,
  marker: 'git log --all -S shows a single-bar literal NEVER existed',
};

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : `ARRAY[]::text[]`; }

function emitSql(): string {
  const upd = UPDATES.map((u) => {
    const sets: string[] = [];
    if (u.status) sets.push(`status = ${sqlStr(u.status)}`);
    if (u.fixed_at) sets.push(`fixed_at = ${sqlStr(u.fixed_at)}`);
    if (u.fixed_in_files) sets.push(`fixed_in_files = ${sqlArr(u.fixed_in_files)}`);
    sets.push(`root_cause = root_cause || ${sqlStr(u.note)}`);
    return `UPDATE engine_bug_queue SET\n  ${sets.join(',\n  ')}\nWHERE bug_class = ${sqlStr(u.bug_class)}\n  AND root_cause NOT LIKE ${sqlStr(`%${u.marker}%`)};\n`;
  }).join('\n');
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type, fixed_at';
  const n = NEW_ROW;
  const ins = `INSERT INTO engine_bug_queue (${cols}) VALUES\n` +
    `(${sqlStr(n.bug_class)}, ${sqlStr(n.title)}, ${sqlStr(n.severity)}, ${sqlStr(n.owner_cluster)}, ` +
    `${sqlStr(n.root_cause)}, ${sqlStr(n.prevention_rule)}, ${sqlStr(n.probe_type)}, ${sqlStr(n.probe_logic)}, ` +
    `${sqlStr(n.status)}, ${sqlArr(n.concepts_affected)}, ${sqlArr(n.fixed_in_files)}, ${sqlStr(n.discovered_in_session)}, ` +
    `${sqlStr(n.row_type)}, ${sqlStr(n.fixed_at)})\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  root_cause = EXCLUDED.root_cause, prevention_rule = EXCLUDED.prevention_rule,\n` +
    `  probe_logic = EXCLUDED.probe_logic, status = EXCLUDED.status,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = EXCLUDED.fixed_at\n` +
    `WHERE engine_bug_queue.root_cause NOT LIKE ${sqlStr(`%${n.marker}%`)};\n`;
  return `-- 2026-08-10 — lines_and_planes_in_space FIX ROUND: ${UPDATES.length} marker-gated updates\n` +
    `-- (8 closes, 4 annotate-keep-open) + 1 new row. Generated by\n` +
    `-- src/scripts/_seed_engine_bug_queue_lines_and_planes_fix_round.ts from the SAME structures\n` +
    `-- the TS path applies. Idempotent; order-independent; never a downgrade (every status\n` +
    `-- written is FIXED, and a row already carrying its marker is never touched).\n\n` +
    upd + '\n' + ins;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-10_seed_engine_bug_queue_lines_and_planes_fix_round_migration.sql');
  writeFileSync(sqlPath, emitSql(), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${UPDATES.length} updates + 1 insert)`);

  for (const u of UPDATES) {
    const { data: ex, error: rErr } = await supabaseAdmin
      .from('engine_bug_queue').select('bug_class,root_cause,status')
      .eq('bug_class', u.bug_class).maybeSingle();
    if (rErr) { console.error(`✗ read ${u.bug_class}: ${rErr.message}`); process.exit(1); }
    if (!ex) { console.error(`✗ expected existing row ${u.bug_class} — NOT found; refusing to create as a side effect.`); process.exit(1); }
    if ((ex.root_cause ?? '').includes(u.marker)) { console.log(`⏭  ${u.bug_class} — marker present`); continue; }
    const patch: Record<string, unknown> = { root_cause: (ex.root_cause ?? '') + u.note };
    if (u.status) patch.status = u.status;
    if (u.fixed_at) patch.fixed_at = u.fixed_at;
    if (u.fixed_in_files) patch.fixed_in_files = u.fixed_in_files;
    const { error } = await supabaseAdmin.from('engine_bug_queue').update(patch).eq('bug_class', u.bug_class);
    if (error) { console.error(`✗ update ${u.bug_class}: ${error.message}`); process.exit(1); }
    console.log(`✓ ${u.bug_class} → ${u.status ?? ex.status}`);
  }

  const { marker, ...row } = NEW_ROW;
  const { data: exNew, error: nErr } = await supabaseAdmin
    .from('engine_bug_queue').select('bug_class,root_cause').eq('bug_class', row.bug_class).maybeSingle();
  if (nErr) { console.error(`✗ read ${row.bug_class}: ${nErr.message}`); process.exit(1); }
  if (exNew?.root_cause?.includes(marker)) {
    console.log(`⏭  ${row.bug_class} — marker present`);
  } else {
    const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(row, { onConflict: 'bug_class' });
    if (error) { console.error(`✗ upsert ${row.bug_class}: ${error.message}`); process.exit(1); }
    console.log(`✓ filed ${row.bug_class} (FIXED, PR #112)`);
  }

  // D1's row was closed by its own dispatch script (rides PR #108) — verify, never re-write.
  const { data: d1 } = await supabaseAdmin.from('engine_bug_queue').select('status')
    .eq('bug_class', 'vg_projection_publishes_both_angle_tokens_before_either_arc_is_drawn').maybeSingle();
  console.log(`· projection-deferral row status: ${d1?.status} (closed by its own dispatch, PR #108)`);
}

main();
