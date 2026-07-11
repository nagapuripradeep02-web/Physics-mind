/**
 * Seed engine_bug_queue with the PRE-EXISTING `biot_savart_element` engine
 * defects surfaced by THE EYE + eye-walker after the 2026-07-08 Rule-31 JSON
 * reconstruction of biot_savart_law (run .visual_runs/biot_savart_law/20260709-002004).
 *
 * These are NOT regressions from the reconstruction (JSON-only; field_3d_config
 * untouched except one label — proven by git diff). They are the engine-motion
 * axis debt for a pre-Rule-31 field_3d scenario, plus one THE-EYE capture-timing
 * gap. Full fix approach: docs/notes/biot_savart_law-engine-fix-spec.md.
 *
 * All rows OPEN — for a dedicated peter_parker:renderer_primitives pass (+ one
 * deriveStateMeta fix) on a CLEAN tree. Do NOT visual:approve biot until the
 * STATE_7 frozen-pin row is fixed (it would lock the empty aha baseline).
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 * Run (retry through the intermittent Supabase TLS flakiness):
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_biot_engine_defects.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-09_biot_savart_law_engine_defects_from_eye_walk';

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
const DERIVE = ['src/lib/validators/visual/deriveStateMeta.ts'];

const rows: Row[] = [
  {
    bug_class: 'biot_frozen_pin_precedes_sequence_assembly',
    title: 'THE EYE frozen/H2 pin fires before the accumulate:sequence circle assembles on biot STATE_7 (PRIMARY aha) and STATE_8 — deriveMaxRevealTimeMs has no biot_savart_element handler',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:visual_validator',
    root_cause: 'FIXED 2026-07-11. deriveMaxRevealTimeMs() in deriveStateMeta.ts had handlers for gauss/flux/amperes/current_loop/helix but NONE keyed on biot_element.accumulate_mode. For STATE_7 (accumulate_mode:sequence) the frozen pin fell through to the small default (~1500ms) and photographed the wire BEFORE the circle assembles. The renderer was always correct: field_3d_renderer.ts:33754-33757 ramps circle opacity from reveal_at_ms(1500) to lastStartB = reveal_at_ms + (num_elements-1)*reveal_stagger_ms + reveal_fade_ms = 1500 + 8*350 + 400 = 4700ms; STATE_7__dense_t16000.png always showed the fully assembled circle. STATE_8 (accumulate_mode:sequence, reveal_at_ms:800, weight_by_sin_theta) had the identical gap. FIX: added a biot_savart_element branch to maxRevealForField3dState mirroring the current_loop db_stack pattern — reveal_at_ms + (num_elements-1)*reveal_stagger_ms + reveal_fade_ms + 800 cushion (~5500ms for STATE_7). VERIFIED (run 20260711-152303): STATE_7__frozen.png now shows the assembled 3-loop circle + dB@P; STATE_7 D7 passes on its own assembly motion, STATE_8 D7 relaxes to reveal_hold. No regressions (41/43; the 2 fails are the separate static-pose rows below).',
    prevention_rule: 'Every field_3d accumulate/sequence reveal must be registered in deriveMaxRevealTimeMs so the frozen H2 baseline is pinned AFTER assembly. NEVER visual:approve a sequence-assembly state whose frozen frame shows the pre-assembly picture — the baseline would poison every future regression diff.',
    probe_type: 'js_eval',
    probe_logic: 'Assert STATE_7__frozen.png shows the assembled 3-loop circle (non-zero biot_circle opacity at the pin time) not a bare wire. Post-fix evidence: run 20260711-152303 STATE_7__frozen.png (assembled). Pre-fix: run 20260709-002004 STATE_7__frozen.png (empty) vs STATE_7__dense_t16000.png (full circle).',
    status: 'FIXED',
    concepts_affected: ['biot_savart_law'],
    fixed_in_files: DERIVE,
    row_type: 'incident',
  },
  {
    bug_class: 'biot_state6_dotcross_lesson_not_rendered',
    title: 'biot STATE_6 dot/cross direction lesson is invisible — ⊙/⊗ symbols + both current-direction cases live only in non-rendered scene_composition annotations; renderer draws one orbiting arrow (single case)',
    severity: 'CRITICAL',
    owner_cluster: R,
    root_cause: 'INTERIM FIX applied 2026-07-11 (JSON-only); FULL engine fix still OPEN. STATE_6 (top-down camera [0.1,6.5,0.1], direction_practice:true) teaches "current OUT of page (dot) -> field circles anti-clockwise" vs "current INTO page (cross) -> clockwise". Those symbols + case labels existed ONLY in epic_l_path.STATE_6.scene_composition (case_out_label/case_in_label/predict_label), which field_3d does NOT render (rendered on-canvas text = field_3d_config.states.{label,formula_overlay,caption} only). The end-on wire is a correct-but-unlabelled dot at origin; the renderer draws just ONE circulation arrow (biot_orbit, field_3d_renderer.ts:33777-33790) for the out-of-page case, so the into-page (cross -> clockwise) case is never shown. INTERIM: STATE_6 field_3d_config now sets caption "Two views: dot vs cross" + formula_overlay "⊙ out → CCW\\n⊗ in → CW" — the lesson is now legible on-canvas (verified run 20260711-152303 STATE_6__frozen.png). STILL OPEN: the richer engine version (3D ⊙/⊗ end-cap symbols + BOTH physical circulation cases rendered).',
    prevention_rule: 'A field_3d teaching beat may NEVER depend on scene_composition annotations for its core payload (they are not rendered). Interim done (caption + formula_overlay carry the dot/cross text). Full (renderer_primitives): add 3D ⊙/⊗ symbol primitives at the wire end-cap and render BOTH cases (two end-on wires side-by-side, or a mid-state out->in flip with the orbit arrow reversing); gate on direction_practice so sibling scenarios stay byte-identical.',
    probe_type: 'vision_model',
    probe_logic: 'Post-interim: STATE_6__frozen.png (run 20260711-152303) legibly shows the delta-cue caption + "⊙ out → CCW / ⊗ in → CW" overlay. Full-fix target: the frozen frame renders the dot AND cross 3D symbols and both circulation senses in-scene, not text-only.',
    status: 'OPEN',
    concepts_affected: ['biot_savart_law'],
    fixed_in_files: [...RENDERER, 'src/data/concepts/biot_savart_law.json'],
    row_type: 'incident',
  },
  {
    bug_class: 'biot_single_element_states_static_pose',
    title: 'biot STATE_2/3/4 are static poses after their ~1s reveal (13s no motion); STATE_4 show_proportion_bars has no renderer implementation — pre-Rule-31 static-pose scenario needs the live-instrument motion pass',
    severity: 'MODERATE',
    owner_cluster: R,
    root_cause: 'biot_savart_element is a pre-Rule-31 static-pose scenario for the single-element teaching states — same class as the Ch.1 "field3d static-poses need engine rebuild" batch. After the reveal the frames are pixel-identical. STATE_4 sets show_proportion_bars:true but no proportionality bars render. Rule 31 "no static state" is met at the JSON axis (narration/visible_controls) but not at the engine-motion axis. NOT fixable by a JSON edit.',
    prevention_rule: 'Rule 31 "no static state" must be checked against RENDERED frames, not assumed satisfied because narration was trimmed. The pass: per-state motion for the single-element beats (dl breathing, r̂/θ construction draw-on, proportionality bars that grow with I·dl·sinθ and shrink with 1/r²) + applyVisibleControls(stateDef.visible_controls) row-visibility (JSON already declares the contract; renderer does not yet honor it) + trusted-drag seize. Mirror the torque tq_*_row + per-state-motion pattern (shipped 2026-07-05). Re-baseline after; no re-voice.',
    probe_type: 'vision_model',
    probe_logic: 'eye-walker: STATE_2/3/4 dense frames pixel-identical t=1000..t=14000 (run 20260709-002004). STATE_4__frozen.png caption "Build the law from proportionalities" with no bars in-scene. Post-fix: each guided state shows distinct per-state motion + only its declared visible_controls rows.',
    status: 'OPEN',
    concepts_affected: ['biot_savart_law'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'biot_state8_db_arrow_not_scaled_by_contribution',
    title: 'biot STATE_8 dB arrow at P stays fixed length as the scan element recedes — only the wire marker scales by sinθ; the ∝ sinθ/r² payoff is not visually demonstrated',
    severity: 'MODERATE',
    owner_cluster: R,
    root_cause: 'field_3d_renderer.ts:33739-33746 scales the wire MARKER by sinThetaWeight (mkScale) but the dB ARROW at P is not length-scaled by the current scan element contribution, so "far ends barely matter (∝ sinθ/r²)" is stated but not shown.',
    prevention_rule: 'When a state claims a distance/angle falloff, the paired vector primitive length must visibly track it (Rule 32a: cause visibly produces a proportional effect). Scale the STATE_8 dB arrow length by the live sinθ/r² contribution of the current scan element.',
    probe_type: 'vision_model',
    probe_logic: 'eye-walker: STATE_8__dense_t04000.png dB arrow at P unchanged as the source element travels down the wire. Post-fix: arrow shrinks toward the far ends, peaks for the θ=90° element across from P.',
    status: 'OPEN',
    concepts_affected: ['biot_savart_law'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string {
  if (a.length === 0) return `ARRAY[]::text[]`;
  return `ARRAY[${a.map(sqlStr).join(', ')}]`;
}

function toSql(r: Row): string {
  return `INSERT INTO engine_bug_queue
  (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, row_type)
VALUES (${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(r.row_type)})
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,
  root_cause = EXCLUDED.root_cause, prevention_rule = EXCLUDED.prevention_rule,
  probe_type = EXCLUDED.probe_type, probe_logic = EXCLUDED.probe_logic, status = EXCLUDED.status,
  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files, row_type = EXCLUDED.row_type;`;
}

async function main(): Promise<void> {
  // Archival SQL (mirrors the migration convention) — always writable, no network.
  const sqlPath = join(process.cwd(), 'supabase_migrations', `supabase_2026-07-09_seed_biot_engine_defects.sql`);
  writeFileSync(sqlPath, `-- ${SESSION}\n-- biot_savart_law pre-existing engine defects surfaced by THE EYE (run 20260709-002004).\n-- Full fix approach: docs/notes/biot_savart_law-engine-fix-spec.md\n\n${rows.map(toSql).join('\n\n')}\n`, 'utf-8');
  console.log(`📝 wrote archival SQL: ${sqlPath}`);

  // Upsert to the live queue, retrying through intermittent Supabase TLS failures.
  let ok = 0;
  for (const r of rows) {
    let done = false;
    for (let attempt = 1; attempt <= 8 && !done; attempt++) {
      const res = await supabaseAdmin.from('engine_bug_queue').upsert(r, { onConflict: 'bug_class' });
      if (!res.error) { done = true; ok++; console.log(`  ✅ ${r.bug_class}`); }
      else { console.log(`  … ${r.bug_class} attempt ${attempt} failed: ${res.error.message}`); await new Promise((s) => setTimeout(s, 4000)); }
    }
    if (!done) console.log(`  ❌ GAVE UP on ${r.bug_class}`);
  }
  console.log(ok === rows.length ? `✅ Seeded all ${ok}/${rows.length} rows` : `⚠ Seeded ${ok}/${rows.length} rows — re-run when Supabase is stable (idempotent upsert)`);
  if (ok !== rows.length) process.exit(1);
}

main().catch((err) => {
  console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
  process.exit(1);
});
