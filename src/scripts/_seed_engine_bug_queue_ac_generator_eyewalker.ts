/**
 * engine_bug_queue rows for the ac_generator scars found by eye-walker (run
 * .visual_runs/ac_generator/20260704-172840) during the 2026-07-04 agent-fleet
 * expansion, and RESOLVED the same session by quality-auditor triage ->
 * renderer_primitives + json_author fixes, re-verified CLEAN by eye-walker on
 * run 20260704-203342.
 *
 * All three original rows are now status FIXED with VERIFIED root_cause (the
 * initial eye-walker text was pixel-level hypothesis; the causes below were
 * confirmed in renderer/JSON code). A 4th row captures the SYSTEMIC class the
 * fix uncovered: createLabelSprite's fixed-width center-clip, which silently
 * truncated wide billboard labels across many field_3d concepts.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_ac_generator_eyewalker.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-04_agent_fleet_expansion_ac_generator_eyewalker';

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

const CONCEPT = 'ac_generator';
const RUN = '.visual_runs/ac_generator/20260704-172840';
const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';
const JSON_FILE = 'src/data/concepts/ac_generator.json';

const incidents: Row[] = [
  {
    bug_class: 'bulb_glow_not_modulating',
    title: 'ac_generator bulb indicator never brightens at EMF peaks though STATE_1 + STATE_7 captions promise it lights / responds to the live output',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `VERIFIED + FIXED 2026-07-04. The bulb emissive-modulation formula in updateAcGeneratorFrame (${RENDERER}, ~L20642: emissiveIntensity = 0.1 + 1.1*sin^2(theta)) ran every frame but was immediately overwritten: applyAcGeneratorGlow() runs AFTER updateAcGeneratorFrame() in the animate loop and looped over every acg_ object — INCLUDING the bulb — calling applyGlowEmphasis, which restores each material to a baseline lazily captured on frame 0 (theta~=0 -> sinT=0 -> bf=0 -> dark amber). So the bulb was pinned at its dark first-frame value every subsequent frame — matching "dark even at theta=275". Fixed by exempting acg_bulb from the glow loop (added \\'if (sud.id === "acg_bulb") continue;\\') so its own sin^2 modulation owns the emissive. Re-verified by eye-walker on run 20260704-203342 via STATE_7 on-screen telemetry: luminance 254.9 at theta=274 (EMF peak) vs 116-131 near EMF zero — brightness tracks |EMF|, phase-correct.`,
    prevention_rule:
      'A scenario whose caption claims an indicator (bulb / lamp / LED) responds to a live quantity MUST drive its emissive from the quantity every frame AND be EXEMPTED from the Rule-29 glow-emphasis loop (applyGlowEmphasis) — otherwise the glow system\'s frame-0 baseline restore clobbers the modulation every frame, and the bulb reads as a static dark prop. THE EYE must confirm >=1 dense frame where the indicator visibly differs from its dark state, checked at the quantity\'s PEAK frame (EMF peak = coil edge-on), never only at a zero-crossing.',
    probe_type: 'manual',
    probe_logic:
      'On ac_generator STATE_1 and STATE_7, compare the bulb\'s brightness at an EMF-peak dense frame (coil edge-on) vs an EMF-zero frame (coil face-on): the emissive must visibly differ, brighter at the peak. If uniformly dull across all dense frames while a caption claims it lights, this bug class is present.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'graph_marker_label_clipped',
    title: 'ac_generator STATE_4 (the phase-lag AHA state) dashed 90-degree phase-marker labels ("Phi max, eps=0" / "eps peak, Phi=0") are truncated at the graph panel\'s right edge, in the frozen frame and mid-state',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `VERIFIED + FIXED 2026-07-04 (owner corrected ambiguous -> peter_parker:renderer_primitives — pure renderer positioning, no JSON change). In acgDrawGraph the two snap-marker labels were drawn left-aligned (default textAlign start) from xPix(tX)-2; the flux-max / emf-max markers sit near the graph\\'s right edge (a quarter/half period behind the live dot, which is AT the right edge), so the right label "eps peak, Phi=0" overran the panel clip boundary W-padR and truncated to "eps p...". Fixed with a local acgMarkerLabel(text, mx, y) helper that measures the string (ctx.measureText) and clamps draw-x to keep the whole label inside [padL, W-padR] (shifts inward from the right edge). Re-verified CLEAN on run 20260704-203342: both labels fully inside the panel.`,
    prevention_rule:
      'Graph annotation / phase-marker labels must be bounds-checked against the graph panel rect and shifted inward (clamp draw-x into [padL, W-padR]) — never allowed to overflow the panel edge — verified especially on the state carrying the concept\'s aha. THE EYE reads the frozen frame of any graph-annotated state for clipped label text.',
    probe_type: 'manual',
    probe_logic:
      'On ac_generator STATE_4__frozen.png (and STATE_4__dense_t13000.png), every phase-marker / annotation label on the graph must sit fully inside the graph panel with no character truncation at the panel edge.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'label_occluded_and_offcanvas_circuit',
    title: 'ac_generator STATE_6 (slip-ring vs split-ring close-up) flip label truncated/occluded and the external circuit + current beads run off the bottom canvas edge in the close-up framing',
    severity: 'MODERATE',
    owner_cluster: 'alex:json_author',
    root_cause:
      `VERIFIED + FIXED 2026-07-04, COMPOUND (two distinct causes): (a) OFF-CANVAS CIRCUIT — STATE_6 camera_position was too tight [2.6, 0.2, 5.4], clipping the external circuit + current beads at the canvas bottom; fixed in ${JSON_FILE} STATE_6.ac_generator.camera_position -> [2.6, 0.6, 7.0] (json_author). (b) LABEL TRUNCATION — the on-screen flip label is RENDERER-built (createLabelSprite("I (flips each half turn = AC)") at ${RENDERER} ~L20393), NOT the JSON scene_composition annotation acg_flip_note. IMPORTANT field_3d gotcha: field_3d_renderer.ts has ZERO scene_composition references — annotation TEXT is never painted; annotations only drive glow/focal bindings. So the two JSON text edits had no effect. The real clip was createLabelSprite\\'s fixed 384px centered canvas — see the sibling row label_sprite_wide_string_clipped for the fix. Re-verified CLEAN on run 20260704-203342: label full + unoccluded, circuit in-canvas.`,
    prevention_rule:
      'In any close-up / tight-camera state, verify (via the frozen frame) every on-screen label is unoccluded AND the full current path stays inside the 760x500 canvas. NOTE for field_3d: on-canvas label text comes from renderer createLabelSprite calls, NOT scene_composition annotation.text (which only drives glow) — never try to fix a field_3d on-canvas label by editing the JSON annotation string.',
    probe_type: 'manual',
    probe_logic:
      'On ac_generator STATE_6__frozen.png, the flip-timing label must be fully readable (not clipped, not behind the axle/wire) and the current-carrying circuit path + beads must be inside the canvas bounds.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [JSON_FILE, RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'label_sprite_wide_string_clipped',
    title: 'field_3d createLabelSprite center-clips any billboard label wider than its fixed 384px canvas to the middle fragment — silently truncated wide labels across multiple concepts (surfaced on ac_generator STATE_6)',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `VERIFIED + FIXED 2026-07-04 (systemic; surfaced while fixing label_occluded_and_offcanvas_circuit). createLabelSprite (${RENDERER}:3628) used a fixed canvas.width = 384 and drew text CENTERED (fillText at canvas.width/2), so any string wider than 384px clipped at BOTH canvas edges leaving only the MIDDLE fragment ("each half tu" for "I (flips each half turn = AC)"). This is why two JSON text-shortening attempts changed nothing — the clip is upstream in the renderer. Sibling functions pmCreateAutoLabel (~3722) + createWideLabelSprite (~3762) already implemented the correct auto-grow. Fixed createLabelSprite to measure the text and set canvas.width = Math.max(384, ceil(measureText.width) + 56), re-acquire the context (resize clears state), and scale the sprite by the real canvas aspect (canvas.width/canvas.height). The Math.max(384, ...) FLOOR keeps every <=384px label byte-for-byte identical (single-glyph billboards B/I/F/theta unchanged: canvas stays 384, scale stays s*3) — only wide strings grow. Re-verified: STATE_6 label full, no other state regressed.`,
    prevention_rule:
      'Any world-space text sprite (createLabelSprite) must size its canvas to the MEASURED glyph width (Math.max(floor, measured+pad)) with a matching aspect-ratio scale — never a fixed-width canvas with centered draw, which clips wide strings to their middle fragment. THE EYE must diff the full rendered string against the frozen-frame pixels (not just re-read source) before marking any label-truncation fix resolved — a text-shortening edit does NOT fix a render-width clip. Regression rule: after any createLabelSprite change, short single-glyph labels must stay pixel-identical (canvas floor 384).',
    probe_type: 'manual',
    probe_logic:
      'For any field_3d concept, read each state\'s frozen frame and confirm every multi-word billboard label renders in FULL (first word through last), not a center fragment. Regression: single-glyph labels (B, I, F, theta) pixel-identical after the fix.',
    status: 'FIXED',
    concepts_affected: [CONCEPT, 'force_on_current_carrying_wire', 'parallel_currents_force', 'moving_coil_galvanometer'],
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
  return `-- 2026-07-04: ac_generator eye-walker scars, RESOLVED same session (run ${RUN} found,\n` +
    `-- run 20260704-203342 re-verified CLEAN). Four FIXED rows: bulb glow (glow-loop\n` +
    `-- clobber), S4 graph label clip, S6 compound (camera + label), and the systemic\n` +
    `-- createLabelSprite fixed-width clip. Generated by\n` +
    `-- src/scripts/_seed_engine_bug_queue_ac_generator_eyewalker.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  fixed_in_files = EXCLUDED.fixed_in_files;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-04_seed_engine_bug_queue_ac_generator_eyewalker_migration.sql');
  writeFileSync(sqlPath, emitSql(incidents), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${incidents.length} incident rows)`);

  const payload = incidents.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${incidents.length} scar row(s) upserted (3 FIXED instance + 1 FIXED systemic)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
