/**
 * engine_bug_queue rows for the eddy_currents + inductance pre-ship HOLDs found by
 * the eye-walker fleet (runs .visual_runs/eddy_currents/20260704-214812 and
 * .visual_runs/inductance/20260704-220024) during the 2026-07-04 Ch.6 release chain.
 *
 * All five are PRE-EXISTING (byte-identical or root-cause-traced to code untouched
 * by the 2d606b9 reseed) but real; founder directive 2026-07-04: "fix first" — the
 * 3 MAJOR rows were FIXED same session (renderer_primitives + json_author) and
 * re-verified CLEAN by eye-walker (inductance run 20260704-230212, eddy_currents
 * run 20260704-230834); the 2 MODERATE rows stay queued OPEN for a later pass.
 * A 6th row (ecp_glow_targets_never_resolve) captures the concept-wide glow no-op
 * renderer_primitives surfaced while fixing — OPEN, routing decision pending.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_ch6_preship_holds.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-04_ch6_preship_eyewalker_holds';

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

const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';
const DERIVE = 'src/lib/validators/visual/deriveStateMeta.ts';
const EDDY_JSON = 'src/data/concepts/eddy_currents.json';
const RUN_EDDY = '.visual_runs/eddy_currents/20260704-214812';
const RUN_IND = '.visual_runs/inductance/20260704-220024';

const incidents: Row[] = [
  {
    bug_class: 'coupling_state_core_reveal_pin_mismatch',
    title: 'inductance STATE_6 (coupling) frozen/H2-pin frame shows "Shared core: iron, k=0.87" readout while the core mesh is still parked outside the coils and the stale "air gap - no wire" label still shows',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `VERIFIED + FIXED 2026-07-04. Eye-walker traced (run ${RUN_IND}; pre-existing — pixel-identical in pre-reseed run 20260704-050646): ${DERIVE} maxRevealForField3dState() inductance block pinned the mode === 'coupling' freeze/H2 candidate at a literal 5000ms, while the shared_core_slide cue fires at shared_core_at_ms ?? 6000 (${RENDERER} indUpdateMutual) plus a 1.0s smoothstep slide-in (core seats ~7000ms); the readout flips INSTANTLY at cue-fire, so the frozen frame photographed the "readout flipped, mesh not seated" transient. TWO-PART FIX: (a) ${DERIVE} coupling candidate now derives asNum(ind.shared_core_at_ms, 6000) + 1500 (cue + 1000ms ease + 500ms cushion = 7500ms default, safely before the 12000ms swap cue); (b) the stale "air gap - no wire" im_gap_lbl now hides the instant the shared-core state flips (visible = !cs every frame; correctly restores when explore toggles core to none). Re-verified CLEAN by eye-walker on run 20260704-230212: frozen frame shows seated core + iron/k/M readout + zero gap text; gap label never reappears across the 6000-13000ms window incl. the swap; STATE_7 explore gap label unaffected; other 6 states byte-equivalent.`,
    prevention_rule:
      'For field_3d modes with scenario_cue-driven one-shot beats (core-slide, coil-swap, etc.), the deriveMaxRevealTimeMs freeze/H2 candidate must be derived from the state\'s own latest configured cue/*_at_ms PLUS its easing duration — never a fixed literal — else a mode whose numeric readout flips instantly at cue-fire but whose mesh eases in gets its founder-review snapshot pinned mid-transition (readout says done, mesh says not yet).',
    probe_type: 'manual',
    probe_logic:
      'On inductance STATE_6__frozen.png: if the shared-core readout shows an iron/ferrite core with a k/M value, the core mesh must be visually seated between the two coils and no stale "air gap" label may remain. Compare against a dense frame ~1s after the cue to confirm the eventual correct picture.',
    status: 'FIXED',
    concepts_affected: ['inductance'],
    fixed_in_files: [DERIVE, RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'loop_badge_label_visibility_not_wired',
    title: 'eddy_currents STATE_4 "1 loop" / "many small loops" badge label sprites are permanently visible on BOTH plates regardless of the slotted flag — the text renders as a double-exposure while the icon shapes toggle correctly',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `VERIFIED + FIXED 2026-07-04. Eye-walker traced (run ${RUN_EDDY}; pre-existing), confirmed exactly right in code: badge label sprites badgeBigLbl/badgeManyLbl (ids ..._badge_big_lbl / ..._badge_many_lbl, created ${RENDERER} ~L18995-19013) were scene-level siblings of their icon groups, but the slots_twin per-frame toggle called ecpFindById only on the icon ids — exact match on userData.id, no _lbl suffix — so the label sprites were never toggled and both texts stayed permanently visible on both plates (the 2d606b9 sprite-width fix made the overlap MORE visible by unclipping it). FIX (${RENDERER} ~L19359-19377): explicit sibling _lbl visibility toggles carrying the same state as each icon (solid: big=true/many=false; slotted: big=!slotted/many=slotted). Sibling toggles chosen over re-parenting (re-parenting into a Mesh would shift the sprite into local coords + change addToScene semantics). Re-verified CLEAN by eye-walker on run 20260704-230834: solid plate shows ONLY "1 loop", slotted ONLY "many small loops" in frozen + dense frames.`,
    prevention_rule:
      'Any toggleable label sprite paired with a mesh/group must share the exact userData.id used by the visibility-toggle lookup, or be toggled by its own explicit ecpFindById(... + "_lbl") call. When a toggle drives an icon+label pair, THE EYE frozen frame must show exactly ONE of the pair\'s text variants per plate, never both superimposed.',
    probe_type: 'manual',
    probe_logic:
      'On eddy_currents STATE_4__frozen.png: the solid plate must show ONLY "1 loop" and the slotted plate ONLY "many small loops" — any frame where both strings render superimposed on one plate is this bug class.',
    status: 'FIXED',
    concepts_affected: ['eddy_currents'],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'missing_visible_element_frozen_tail',
    title: 'eddy_currents STATE_5 authors 3 scene_composition annotations but field_3d_config visible_elements omits neutral_label — the misconception-resolution beat (s5_5) has nothing to glow and the scene is completely static for ~17s (50% of the state)',
    severity: 'MAJOR',
    owner_cluster: 'alex:json_author',
    root_cause:
      `VERIFIED + FIXED 2026-07-04, COMPOUND (JSON + renderer halves). Eye-walker traced (run ${RUN_EDDY}; pre-existing): ${EDDY_JSON} STATE_5 authored furnace_label, core_label, neutral_label in scene_composition but visible_elements omitted neutral_label — AND the applications rig genuinely hardcoded only 2 annotation slots, so the token alone would have matched nothing. FIX: (a) json_author added "s5_neutral_label" to STATE_5 visible_elements, neutral_reveal_at_ms: 19000 to the scenario block (after core_swap_at_ms 17500, before the 24000 frozen pin), and scenario_cue "neutral_label_reveal" on the s5_5 sentence (cue-channel binding, *_at_ms as THE EYE fallback); (b) renderer_primitives built the third sprite in the rig (${RENDERER} ~L19038-19047: text "same swirling-loop mechanism, opposite goals", #D4D4D8, id s5_neutral_label, bottom-centre, starts hidden) revealed via cueTriggerMs("neutral_label_reveal", ed.neutral_reveal_at_ms ?? 19000) with 0.8s fade (~L19412-19427). Re-verified CLEAN by eye-walker on run 20260704-230834: frozen frame (24000ms) shows all 3 annotations; label absent at t<=17000, present from t18000 (fired on its narration cue, before the fallback — correct); former dead tail genuinely alive (AC-reversal arrows flip through t34000).`,
    prevention_rule:
      'Every scene_composition annotation id authored in epic_l_path must have a matching entry in field_3d_config.states.<id>.visible_elements, checked at author time — an orphaned annotation silently kills the tail of the state (no reveal, no glow anchor, static dead air). Gate check: per state, annotation ids  ⊆ visible_elements.',
    probe_type: 'manual',
    probe_logic:
      'For each eddy_currents state, diff epic_l_path scene_composition annotation ids against field_3d_config.states.<id>.visible_elements: every authored annotation must appear. On STATE_5 dense frames, the final ~17s must show at least one visual change (reveal/glow), never a byte-identical static run.',
    status: 'FIXED',
    concepts_affected: ['eddy_currents'],
    fixed_in_files: [EDDY_JSON, RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'caption_clipped_by_adjacent_stat_box',
    title: 'eddy_currents STATE_4 top caption ("...solid collapses in 2-3 swings; slotted barely deca[ys]") is cut off / obscured at its right edge by the neighboring stat-readout box',
    severity: 'MODERATE',
    owner_cluster: 'ambiguous',
    root_cause:
      `Eye-walker observed (run ${RUN_EDDY}; pre-existing, byte-identical pre/post reseed). Owner ambiguous: alex:json_author (caption length) vs peter_parker:renderer_primitives (caption-box auto-width / layout vs the adjacent stat box). Queued for the next eddy_currents pass — did not block the fix-first cycle (founder 2026-07-04).`,
    prevention_rule:
      'Caption text boxes must be layout-tested against the adjacent stat-readout box position before finalizing; a caption\'s last word must never render behind a sibling box.',
    probe_type: 'manual',
    probe_logic:
      'On eddy_currents STATE_4__frozen.png the full top caption must be readable start-to-finish with no characters hidden behind the stat-readout box.',
    status: 'OPEN',
    concepts_affected: ['eddy_currents'],
    fixed_in_files: [],
    row_type: 'incident',
  },
  {
    bug_class: 'graph_title_caption_zorder_overlap',
    title: 'eddy_currents STATE_1 oversized "theta_max (deg) vs t (s)" chart title overlaps and obscures the smaller caption directly underneath it',
    severity: 'MODERATE',
    owner_cluster: 'ambiguous',
    root_cause:
      `Eye-walker observed (run ${RUN_EDDY}; pre-existing, byte-identical pre/post reseed). Sibling annotation sprites in the same vertical band collide. Owner ambiguous (title font-size/layout in renderer vs authored caption placement). Queued for the next eddy_currents pass — did not block the fix-first cycle (founder 2026-07-04).`,
    prevention_rule:
      'Sibling annotation sprites occupying the same vertical band must be layout-checked against each other, not just against canvas edges.',
    probe_type: 'manual',
    probe_logic:
      'On eddy_currents STATE_1__frozen.png the chart title and the caption below it must both be fully legible with no overlap.',
    status: 'OPEN',
    concepts_affected: ['eddy_currents'],
    fixed_in_files: [],
    row_type: 'incident',
  },
  {
    bug_class: 'ecp_glow_targets_never_resolve',
    title: 'eddy_currents concept-wide silent glow no-op: all 18 teacher_script glow targets use short-form scene_composition ids while applyEddyCurrentPendulumGlow exact-matches prefixed renderer ids (ecp_*/s4_*/s5_*) — no glow emphasis ever fires on any state',
    severity: 'MAJOR',
    owner_cluster: 'ambiguous',
    root_cause:
      `Surfaced by renderer_primitives 2026-07-04 while fixing the S4/S5 rows (pre-existing across all 6 states, present at the original quality_auditor PASS): the concept JSON's tts_sentences glow fields carry short-form scene_composition ids (off_label, furnace_label, core_label, neutral_label, ...) but applyEddyCurrentPendulumGlow exact-matches userData.id/elementType, which are prefixed (ecp_*, s4_*, s5_*), and SET_GLOW stores the raw string with no alias layer — so every glow lookup misses and Rule-29 brightness emphasis never fires anywhere in the concept. ROUTING DECISION NEEDED (founder): renderer-side alias/normalization pass in the glow resolver vs json_author prefixing all 18 glow fields to the renderer ids. Did not block the 2026-07-04 fix-first ship (defect predates the auditor PASS; narration + reveals unaffected).`,
    prevention_rule:
      'A concept\'s teacher_script glow targets must resolve against the renderer\'s actual userData.id/elementType namespace — verify at author time that every glow string matches a live object id (or add an alias layer in the glow resolver). A concept where ZERO glow targets resolve should fail a gate, not ship silently without emphasis.',
    probe_type: 'manual',
    probe_logic:
      'For each eddy_currents state, fire SET_GLOW with each sentence\'s glow target and confirm at least one scene object brightens (or diff a glow-active dense frame against its inactive sibling). If no frame ever shows Rule-29 brightness emphasis on any narrated beat, this class is present.',
    status: 'OPEN',
    concepts_affected: ['eddy_currents'],
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
  return `-- 2026-07-04: Ch.6 pre-ship eye-walker HOLD rows (eddy_currents run ${RUN_EDDY},\n` +
    `-- inductance run ${RUN_IND}). All pre-existing, surfaced by the pre-ship walk; founder\n` +
    `-- "fix first": 3 MAJOR FIXED same session + re-verified CLEAN (runs 20260704-230212 /\n` +
    `-- 20260704-230834), 2 MODERATE queued OPEN, + 1 OPEN glow-resolution row surfaced\n` +
    `-- during the fix (routing decision pending). Generated by\n` +
    `-- src/scripts/_seed_engine_bug_queue_ch6_preship_holds.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  fixed_in_files = EXCLUDED.fixed_in_files;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-04_seed_engine_bug_queue_ch6_preship_holds_migration.sql');
  writeFileSync(sqlPath, emitSql(incidents), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${incidents.length} incident rows)`);

  const payload = incidents.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${incidents.length} scar row(s) upserted (3 MAJOR FIXED + 2 MODERATE OPEN queued + 1 glow-resolution OPEN)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
