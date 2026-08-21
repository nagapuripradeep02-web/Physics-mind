/**
 * engine_bug_queue — the vg ARC GLOW INVERSION, found at founder-proxy Checkpoint B cycle 0
 * on `lines_and_planes_in_space`, 2026-08-21.
 *
 * Two rows, one root cause, deliberately split by owner:
 *   · the ENGINE gap (arcs carry no vgId and are not brightenOnly) — OPEN, a founder call,
 *     because the fix is a platform file and would make arcs glowable fleet-wide;
 *   · the AUTHORING instance on this concept — filed already FIXED, because the bindings were
 *     re-pointed in the same session and the prevention rule is what has to survive.
 *
 * The reason this is worth two rows rather than a note: naming an arc is not a no-op that
 * degrades to "no glow". It INVERTS — the named object is the only one that gets dimmed.
 * And THE EYE cannot see it by construction, so a green 39/40 sat on top of a live product
 * defect for a full round.
 *
 * Marker-gated, SQL emitted from the SAME structures the TS applies, never a downgrade.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_vg_arc_glow_inversion.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-21_cpb_cycle0_arc_glow_inversion';
const FIXED_AT = '2026-08-21T10:40:00.000Z';
const J = 'src/data/concepts/mathematics/lines_and_planes_in_space.json';
const BLOCK = 'docs/skeletons/lines_and_planes_in_space_mathematics_block.md';
const R = 'src/lib/renderers/field_3d_renderer.ts';

interface Row {
  bug_class: string; title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  owner_cluster: string;
  root_cause: string; prevention_rule: string;
  probe_type: 'js_eval'; probe_logic: string;
  status: 'OPEN' | 'FIXED'; concepts_affected: string[]; fixed_in_files: string[];
  row_type: 'incident'; fixed_at: string | null; marker: string;
}

const ROWS: Row[] = [
  {
    bug_class: 'vg_angle_arcs_are_never_stamped_so_a_glow_that_names_an_arc_dims_the_very_object_the_sentence_is_about',
    title: 'An angle arc cannot be a glow focal, and naming one INVERTS the emphasis: the arc drops to 40% while its own lines hold',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause: 'In the vg lines/planes writer, applyGlowEmphasis matches a glow target against userData.vgId (the vg_lp_* branch of the glow pass). vgId is written by exactly one function, stamp(), and it is called for lines (which also covers the projection shadow and the renderer-injected <lineId>_lambda marker), planes and their .normal, points, segments and vectors. The ANGLE ARC block never calls it — resolve by symbol: the arc pool is built as elementType "vg_lp_arc" and written in the same frame function as the others, with no stamp() line. So an authored glow naming an arc id can never match, and the arc is treated as a non-focal PEER. It is then also absent from the brightenOnly list in the glow branch (which names vg_lp_line, vg_lp_seg, vg_lp_normal, vg_lp_vec, vg_lp_dir), so it takes the touchOp path and is written to GLOW_DIM_OPACITY = 0.4. The failure is therefore not "the glow does nothing" — it is that the ONE object the sentence is about is the ONE object that dims, while its peers hold at full brightness and nothing brightens at all. Measured on lines_and_planes_in_space at CP-B cycle 0: five bindings named arcs (s6_1/s6_4 -> arc1, s7_2 -> arc_normal, s7_3/s7_4 -> arc_plane), on the two states whose entire subject IS an angle arc. Rules 29 and 32e run backwards on 2 of 4 sentences in STATE_6 and 3 of 4 in STATE_7. Two aggravating facts: the concept declares focal_primitive_id "arc1"/"arc_normal", i.e. the authored focal is an object the mechanism cannot address (that field is schema-only and consumed by no renderer, so it is inert rather than a second defect, but it is the same tell); and the renderer own comment above stamp() states the invariant the arc pool breaks — "Every pool member carries the RESOLVED object own id ... so glow_focal can name the common perpendicular rather than pool slot 2".',
    prevention_rule: 'EVERY POOL THAT CAN BE NAMED BY AN AUTHORED ID CALLS stamp() — a pool that skips it is not merely unaddressable, it is a trap, because the glow pass treats unmatched members as peers to DIM. Engine fix (founder call, Rule 40 platform file, lands on master through its own PR): add stamp(al, A.id) to the arc block mirroring the other five pools, and add vg_lp_arc to the brightenOnly list so a peer arc is never opacity-clobbered. That makes an angle arc glowable fleet-wide, which is the right end state — an arc is the natural focal of any angle state. AUTHORING RULE until it lands: a glow target must be a line, a plane (or <plane>.normal), a point, a segment or a vector; never an arc. GENERAL LESSON: when a mechanism resolves by id, enumerate the id-PRODUCING sites, not the id-CONSUMING ones — a verification that only checks "does this id exist in the authored JSON" passes every one of these five bindings.',
    probe_type: 'js_eval',
    probe_logic: 'Static, and cheap enough to run on every concept: build the stampable id set per state from the renderer stamp() call sites (lines + projection id + <lineId>_lambda where show_lambda_marker, planes and <plane>.normal, points, segments, vectors, perpendicular, common_perpendicular, intersections) and assert every tts_sentences[].glow and every focal_primitive_id is in it. NOTE the injected lambda marker: the renderer pushes {id: line.id + "_lambda"} into the points array BEFORE the point loop stamps, so a checker that models only AUTHORED vg.points produces a false positive on it — that false positive was observed in this very session. Negative controls: the five pre-fix bindings (arc1 x2, arc_normal, arc_plane x2) must FAIL; L1_lambda must PASS. Runtime form: drive SET_GLOW naming an arc under a frozen clock and assert the arc material opacity does not fall below its peers.',
    status: 'OPEN', concepts_affected: ['lines_and_planes_in_space'], fixed_in_files: [],
    row_type: 'incident', fixed_at: null,
    marker: 'the ONE object the sentence is about is the ONE object that dims',
  },
  {
    bug_class: 'a_glow_target_verified_only_against_the_authored_json_passes_ids_the_renderer_can_never_address',
    title: 'The glow table was signed off as "ids verified against the stamp() sites" and five of them named a pool that has no stamp() call',
    severity: 'MAJOR',
    owner_cluster: 'alex:json_author',
    root_cause: 'CP-B finding F7 asked for glow bindings on 33 unbound narration sentences. The authoring pass returned 26 bindings reported as "all target ids verified against the actual stamp() call sites in field_3d_renderer.ts", and the report was specific enough to be believed — it correctly noted that plane normals stamp as "P1.normal" not "P1_normal", and that the lambda marker auto-generates as "L1_lambda" not the doc label "L1_lambda_marker". Both of those are right. But the verification answered "does an object with this id exist in the authored state?" rather than "is an object of this TYPE ever stamped?", and angle arcs are never stamped at all, so five arc ids passed a check that looked rigorous. The dispatching session then relayed the table into the JSON without re-deriving it, and THE EYE returned 39/40 because its capture path never sends SET_GLOW — so a live product defect (build_review_site fires the glow on the STATE CLOCK, narration on or off) sat under a green gate for a full round. CLOSED 2026-08-21 in the same session it was found: s6_1/s6_4 unbound (each names the pair, not one object — the convention the other nine no-binding sentences already follow), s7_2 -> P1.normal, s7_3/s7_4 -> shadow (the drawn carrier of "the angle to the plane"), and all 24 surviving bindings re-verified against the stampable id set.',
    prevention_rule: 'A CLAIM THAT IDS WERE "VERIFIED AGAINST THE ENGINE" NAMES THE PRODUCING SITES IT ENUMERATED. When an authoring pass binds authored ids to an engine mechanism, its report states which engine sites it read and what the resulting legal SET is — not merely that it checked. The reviewing session re-derives that set once, mechanically, rather than relaying a table on the strength of a plausible-sounding verification: the tell here was that the report proved two SPECIFIC id spellings, which reads as thoroughness while saying nothing about the TYPE coverage. Corollary for gates: where a mechanism is invisible to THE EYE (glow, TTS-driven reveals, teacher drags), a green EYE run is not evidence about it, and the authoring check IS the only gate — so it gets a machine probe, not a prose assurance.',
    probe_type: 'js_eval',
    probe_logic: 'Run the stampable-id probe from the sibling row over every concept that authors tts_sentences[].glow, and assert zero unresolvable. Negative control: this concept at commit 5dc2e2f0 must FAIL with exactly five (arc1, arc1, arc_normal, arc_plane, arc_plane); at da29306c it must PASS with 24/24.',
    status: 'FIXED', concepts_affected: ['lines_and_planes_in_space'], fixed_in_files: [J, BLOCK],
    row_type: 'incident', fixed_at: FIXED_AT,
    marker: 'five of them named a pool that has no stamp() call',
  },
];

const PROTECTED = ['FIXED', 'FALSE_POSITIVE'];
function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : `ARRAY[]::text[]`; }

function emitSql(): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type, fixed_at';
  const ins = ROWS.map((r) =>
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n` +
    `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ` +
    `${sqlStr(r.row_type)}, ${r.fixed_at ? sqlStr(r.fixed_at) : 'NULL'})\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  root_cause = EXCLUDED.root_cause, prevention_rule = EXCLUDED.prevention_rule,\n` +
    `  probe_logic = EXCLUDED.probe_logic, status = EXCLUDED.status, fixed_at = EXCLUDED.fixed_at,\n` +
    `  fixed_in_files = EXCLUDED.fixed_in_files, concepts_affected = EXCLUDED.concepts_affected\n` +
    `WHERE engine_bug_queue.root_cause NOT LIKE ${sqlStr(`%${r.marker}%`)}\n` +
    `  AND engine_bug_queue.status NOT IN ('FIXED', 'FALSE_POSITIVE');\n`).join('\n');
  return `-- 2026-08-21 — the vg ARC GLOW INVERSION, found at founder-proxy Checkpoint B cycle 0.\n` +
    `-- Two rows, one root cause, split by owner: the ENGINE gap stays OPEN (platform file, Rule 40,\n` +
    `-- founder call — the fix would make arcs glowable fleet-wide); the AUTHORING instance is filed\n` +
    `-- FIXED because the bindings were re-pointed in the same session.\n` +
    `-- Naming an arc is not a no-op that degrades to "no glow" — it INVERTS: the named object is the\n` +
    `-- only one dimmed. THE EYE cannot see it (its capture path never sends SET_GLOW), so a green\n` +
    `-- 39/40 sat on top of a live product defect for a full round.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_vg_arc_glow_inversion.ts from the SAME\n` +
    `-- structures the TS path applies. Idempotent, order-independent, never a downgrade.\n\n` + ins;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-21_seed_engine_bug_queue_vg_arc_glow_inversion_migration.sql');
  writeFileSync(sqlPath, emitSql(), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${ROWS.length} inserts)`);

  for (const r of ROWS) {
    const { marker, ...row } = r;
    const { data: ex, error: rErr } = await supabaseAdmin
      .from('engine_bug_queue').select('bug_class,root_cause,status').eq('bug_class', row.bug_class).maybeSingle();
    if (rErr) { console.error(`✗ read ${row.bug_class}: ${rErr.message}`); process.exit(1); }
    if (ex?.root_cause?.includes(marker)) { console.log(`⏭  ${row.bug_class} — marker present`); continue; }
    if (ex && PROTECTED.includes(ex.status)) {
      console.log(`⏭  ${row.bug_class} — live status ${ex.status}; REFUSING to overwrite a protected row`); continue;
    }
    const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(row, { onConflict: 'bug_class' });
    if (error) { console.error(`✗ upsert ${row.bug_class}: ${error.message}`); process.exit(1); }
    console.log(`✓ filed ${row.bug_class} (${row.severity}/${row.status})`);
  }

  const { data: open } = await supabaseAdmin.from('engine_bug_queue')
    .select('bug_class').contains('concepts_affected', ['lines_and_planes_in_space']).in('status', ['OPEN', 'DEFERRED']);
  console.log(`\n· ${open?.length ?? 0} row(s) now OPEN/DEFERRED for this concept`);
}

main();
