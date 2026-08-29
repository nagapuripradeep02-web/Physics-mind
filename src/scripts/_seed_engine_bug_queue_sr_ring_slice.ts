/**
 * engine_bug_queue rows for the SR ring-slice dispatch — solid_of_revolution
 * STATE_6 named a ring on four text surfaces and rendered one on none, plus the
 * two HUD defects routed with it at Checkpoint B.
 *
 * THREE NEW ROWS, all FIXED, all field3d_surgeon. Near classes were read first
 * and each is a SIBLING, not the same class (each row says which and why):
 *   F1 vs field3d_scenario_union_member_without_builder_renders_nothing — there a
 *      whole scenario had no builder; here a fully-built scenario is missing ONE
 *      object that four of its own text surfaces name.
 *   F3 vs vg_misconception_counter_number_arrives_after_the_false_picture_is_gone
 *      (FIXED, alex:json_author) — that one is an AUTHORED timing miss an author
 *      could re-time; this one is an ENGINE gate that makes co-residence
 *      impossible for any authoring at all, and a counter-quantity no key
 *      computed. Same family, different root cause and different owner.
 *   F4 vs hud_prints_negative_zero_on_a_value_only_instrument and
 *      existing_hud_line_reused_for_a_different_physical_quantity — those are
 *      about the VALUE; this is about the LABEL not marking a belief as a belief.
 *
 * Idempotent: upsert on bug_class, then a read-back by EXACT bug_class, one
 * query per row — never a capped select.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_sr_ring_slice.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-28_sr_checkpoint_b';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:field3d_surgeon' | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'probe_definition' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';
const GATE = 'src/scripts/check_solid_of_revolution.ts';

const rows: Row[] = [
  {
    bug_class: 'scenario_names_its_taught_object_on_every_text_surface_and_renders_it_on_none',
    title: 'solid_of_revolution STATE_6 said "Each slice is a ring" in its caption, its formula surface, its HUD ring-area line and its narration, and drew a closed shell at every t in 0-28000 ms — no annulus existed on any frame, and no authoring could have made one',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      `MEASURED at Checkpoint B on solids_of_revolution (PR #162), frame .visual_runs/solids_of_revolution/20260828-101301/STATE_6__dense_t15400.png: four text surfaces named a ring simultaneously — the on-canvas caption "Each slice is a ring", the formula surface V = Sigma pi (R^2 - r^2) dx, the HUD line "ring area = 2.3562" and the narration "Each slice is really a ring" — and the picture was a CLOSED SHELL plus the pooled ring stack of open cylinder walls. The annulus the whole state is about was on no frame at any time. Positive control in the same concept: STATE_3 (mode "slice") DOES draw its travelling circular face, so the scenario can draw a labelled cross-section; it just could not draw an annular one here. IN THE CODE (${RENDERER}, the solid_of_revolution region): mode "compare" drew the swept skin and the pooled stack and no labelled slice at all; the state authored slice_x: 1.0 and that value reached srWriteHud ONLY (it set the R / r_inner / ring_area lines) and never reached any geometry. THE OBJECT WAS UNREACHABLE BY EVERY AUTHORED COMBINATION, which is what makes this an engine row and not a JSON one: SR_MODES is a CLOSED one-mode-per-state enum (SR-D8), so "slice" and "compare" cannot be combined; and this concept two bounding curves MEET at both ends of the domain (outer sqrt x, inner x/2 cross at x = 0 and x = 4), so the closed solid exposes no ring at either end face either. Seventeen gate sections and sixty negative controls passed on that frame, because every one of them asked whether a NUMBER was right or whether a BEAT fired; not one asked whether the object the state is about EXISTS in the scene. THE FIX draws the already-authored slice_x as an annular slab on compare and stack states that already carry an inner profile: srSliceRingPlan (pure, three-free, so the gate runs it with no browser) decides whether a ring is drawn and with which radii, and srPlaceSliceRing writes an annular slab — two annulus caps whose two rims are rewritten per frame, plus an outer and an inner open cylinder wall — centred on the labelled x at R = srF(outer, x), r = srF(inner, x), thickness sr.slice_thickness. NO NEW MODE AND NO NEW ENUM MEMBER. It is gated on the SAME reveal beat the true stack rides (srStackReveal / reveal.stack_at_ms) and stands down for the whole wrong-kind window, so the answer never appears beside the misconception the state is still refuting. It carries END CAPS although the pooled stack deliberately does not (240 meshes for a surface its own neighbours occlude): here there is ONE slab and the flat annular FACE with the hole punched through it is the entire point, and the hole is drawn by drawing nothing there, so what shows through it is the axis rod and the tunnel behind it. SR-D2 holds — the plan is a pure function of the state block and the state-local clock, nothing accumulates. SR-D3 holds and is strengthened: the pass that PLACES the annulus publishes its radii into SR_PUB and the HUD reads them instead of evaluating the profile a second time, so the drawn ring and the printed ring area cannot be taken at two different x. A state with no slice_x, and every state with no inner profile, takes the null path and renders byte-identically (STATE_5 authors slice_x with no inner and is untouched). SIBLING, NOT A RECURRENCE, of field3d_scenario_union_member_without_builder_renders_nothing: there an entire scenario had no builder and the scene was empty; here a fully built scenario draws a rich, correct picture that is missing exactly the one object its own text names.`,
    prevention_rule:
      'ASSERT EXISTENCE, NOT ARITHMETIC. Every object a state NAMES on any text surface — caption, formula surface, HUD line, narration — must be asserted to EXIST in the scene on the frames that name it, with a count or a vertex read, before any assertion about its value. A gate made only of correct numbers and correctly-timed beats passes at full marks on a picture that is missing its subject, which is what happened here across 17 sections and 60 negative controls. WHEN A SCENARIO USES A CLOSED ONE-VALUE-PER-STATE MODE ENUM, CHECK WHAT THE ENUM MAKES UNAUTHORABLE: a state that needs the union of two modes has no way to ask for it, and the miss shows up as an author writing the words and the engine drawing nothing. The answer is to make the already-authored field (here slice_x) draw wherever it is meaningful, not to add a mode. And a cross-section that teaches a HOLE must be drawn with the hole OPEN and nothing behind it filling it in — draw the annular face, not a capped cylinder, and verify against the pixels that the hole reads as a hole, not from the plan that fed the geometry.',
    probe_type: 'js_eval',
    probe_logic:
      `npm run check:solid-of-revolution — section 18 (22 sections, 66 negative controls file-wide). PURE half: srSliceRingPlan on the shipped STATE_6 block returns u = 1.0, R = 1.0, r = 0.5 (drawn radius ratio exactly 2:1), th = 0.12; null before the stack beat; null while the wrong kind is summed; null with slice_x deleted; null on the STATE_5 shape (stack + slice_x, no inner); null in slice mode; null at x = 0 and x = 4 where the two curves MEET, so the engine never claims a hole the solid does not have. EXECUTED half, through section 15 live harness under a memoising THREE stub, running build -> apply -> frame: the slab group is NOT visible at t = 5000 (the wrong-solid beat) and IS visible at t = 15400 and t = 21000; the OUTER and INNER rims are read back off the SHIPPED Float32Array at 1.0000000130 and 0.4999999891 (float32 storage precision), ratio 2.0 to 1e-6; the cap carries 29 rim pairs and NO vertex inside the inner rim, so nothing the slab draws fills the hole; the HUD at t = 15400 reads "ring area = 2.3562" beside a ring that now exists. Negative controls: a pre-fix twin (srSliceRingPlan forced to return null) was WATCHED TO FAIL — 8 assertions of section 18 fail on it, including the two visibility assertions and both rim measurements; and a GREEDY twin that drew on every compare/stack state regardless of slice_x fails the absent-field identity. LIVE CONFIRMATION on the built review page (port 8098, sim.html sha256-verified identical to the served bytes), THE EYE own pin protocol RESET_TRAJECTORY -> REPLAY_ANIMATIONS -> SET_TIME_FREEZE -> poll PM_simTimeMs: window.PM_srSliceRing is null at t = 5000 and {x: 1, R: 1, r: 0.5, th: 0.12} at t = 11500 / 15400 / 21000, and the screenshots show a light-purple annulus at x = 1 with a dark open hole through which the axis rod is visible, against both the half-swept shell (t = 15400) and the fully closed 360-degree shell (t = 21000).`,
    status: 'FIXED',
    concepts_affected: ['solids_of_revolution'],
    fixed_in_files: [RENDERER, GATE],
    row_type: 'incident',
  },
  {
    bug_class: 'misconception_value_and_its_refutation_are_engine_gated_mutually_exclusive_so_no_frame_carries_both',
    title: 'solid_of_revolution gated V_n on kind !== radius_difference and V_wrong on kind === radius_difference, so the wrong number was erased in the exact frame the true one appeared — and no readout key computed the wrong RING AREA the design asked to stand against the true one',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      `In srWriteHud (${RENDERER}, the solid_of_revolution region) the V_n branch renders only when SR_PUB.kind !== "radius_difference" and the V_wrong branch only when SR_PUB.kind === "radius_difference". Because exactly ONE kind is summed per frame, the two lines are mutually exclusive BY CONSTRUCTION and no authoring can put them on one frame. MEASURED on the built page: t = 10900 renders "wrong = 1.6755" with no V_n line; t = 11100 renders "Vn = 8.3776" with no wrong line. The refutation therefore arrives in the first frame in which the thing it refutes has been erased, which is a Rule-16a contrast with one of its two halves missing. The engine own comment justified the exclusion by "the contrast-ghost-co-resident scar" — but that scar is a WRONG VALUE REACHING A TRUE-LOOKING READOUT (the published total printed as Vn with nothing on screen saying which sum produced it). That is a defect of the LABEL, not of co-residence: a distinctly-labelled key cannot be misread as the true one. Separately, what the design actually asked for was never implementable at all: it wanted "ring area = 2.3562" to stand against the WRONG RING AREA pi (R - r)^2 = 0.7854 at the labelled slice, 3.0x too small, and NO key in SR_READOUTS computed pi (R - r)^2 anywhere. FIXED by adding ring_area_wrong: a SELF-COMPUTING key on the closed SR_READOUTS enum that evaluates pi (Rc - ric)^2 directly from the geometry — the same pattern V_about_x already uses — and never touches SR_PUB, so no published total can leak into it and the original scar stays closed. Its label says "wrong ring area", so the true and the wrong ring area can now be authored together and read together. The V_n / V_wrong exclusion is deliberately LEFT AS IS: those two are the same symbol computed two ways and the label defect there is real. SIBLING, NOT A RECURRENCE, of vg_misconception_counter_number_arrives_after_the_false_picture_is_gone (FIXED, alex:json_author): that one was an AUTHORED reveal-timing miss an author could re-time on a scenario that already supported co-presence; this one is an ENGINE gate that made co-presence impossible for every possible authoring, plus a quantity no key computed.`,
    prevention_rule:
      'A MISCONCEPTION AND ITS REFUTATION MUST BE ABLE TO SHARE A FRAME, and the engine must not be what forbids it. When two readouts are gated on complementary conditions of the same variable, that is a structural guarantee that no frame will ever carry both — check that guarantee against the pedagogy before writing it, because a contrast whose halves cannot co-exist is not a contrast. The real hazard the exclusion was defending against is a wrong value reaching a TRUE-LOOKING readout, and the fix for THAT is the LABEL: give the wrong quantity its own key whose label says "wrong", compute it from the geometry rather than from any published total, and let the two stand side by side. Author the counter-number as its own readout key with its own formula — never expect a state to make a contrast out of a value that no key computes.',
    probe_type: 'js_eval',
    probe_logic:
      `npm run check:solid-of-revolution section 18 (iii): srWriteHud is run through the shipped body with readouts ["R", "r_inner", "ring_area", "ring_area_wrong"] and returns, IN ONE FRAME, ["R = 1.000", "r = 0.500", "ring area = 2.3562", "wrong ring area = 0.7854"]; the wrong value is checked against pi (R - r)^2 computed independently in the gate. Negative controls: the two numbers are exactly 3.0x apart, so the wrong one cannot be read as a rounding of the right one; a ring_area_wrong implemented as pi (R^2 - r^2) — the right formula under the wrong name — would print the same 2.3562 as the line it exists to refute, and the co-residence assertion fails on it; and the ring_area_wrong BRANCH is read out of the shipped srWriteHud by delimiter (not by a character window, which would have swallowed the V_n branch below it) and asserted to contain no SR_PUB reference at all, so no published total can leak into it.`,
    status: 'FIXED',
    concepts_affected: ['solids_of_revolution'],
    fixed_in_files: [RENDERER, GATE],
    row_type: 'incident',
  },
  {
    bug_class: 'hud_renders_a_misconception_quantity_with_a_neutral_label_so_sound_off_it_reads_as_a_fact',
    title: 'solid_of_revolution printed "pi x area = 16.7552" with a neutral label one line under a climbing true "face area", so with the sound off a student read two ordinary quantities — and the units disagreed silently, a wrong VOLUME standing beside an AREA',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      `The pi_area readout key exists to SHOW M1 (the belief that spinning a region gives pi times its area) as a consequence rather than only speaking it, per Rule 16a. It rendered "pi x area = 16.7552" — a neutral, ordinary-looking label — directly beside the true "face area = 3.1416" on STATE_3, while the same HUD writer labels the OTHER misconception in this scenario "wrong = " (the V_wrong branch). Rule 24 says the sim reads sound-off; sound-off, this HUD showed two unremarkable quantities and nothing said which was the belief being refuted. The units disagreed on top of that, silently: pi times an area is a VOLUME, printed one line under an AREA, with no unit or word to separate them. FIXED by making the label carry both facts, in the vocabulary the scenario already uses: "wrong volume (pi x area) = 16.7552". No number changed; the provenance stays visible so the belief is still shown as a consequence rather than asserted. SIBLING, NOT A RECURRENCE, of hud_prints_negative_zero_on_a_value_only_instrument and existing_hud_line_reused_for_a_different_physical_quantity: both of those are about the VALUE a line prints; this is about a correct value whose LABEL does not mark it as a belief.`,
    prevention_rule:
      'EVERY DELIBERATELY WRONG QUANTITY ON SCREEN CARRIES A LABEL THAT SAYS IT IS WRONG, in the same words the rest of the scenario uses for wrong things. A misconception rendered with a neutral label is indistinguishable from a fact with the sound off, which is the only mode Rule 24 guarantees. The label also names the KIND of quantity when the wrong value has different units from the true one beside it (a wrong volume next to an area) — otherwise the reader silently compares two numbers that are not comparable. Check this on every state that renders a misconception value: read the HUD lines alone, with no narration, and ask which line the state is refuting.',
    probe_type: 'js_eval',
    probe_logic:
      `npm run check:solid-of-revolution section 14: srWriteHud run through the shipped body on the STATE_3 shape emits "wrong volume (pi x area) = 16.7552" beside "face area = 3.1416", and a negative control asserts the pre-fix neutral string "pi x area = 16.7552" is no longer emitted anywhere. The 5.3x separation control (a student cannot read the wrong number as a rounding of the right one) is retained.`,
    status: 'FIXED',
    concepts_affected: ['solids_of_revolution'],
    fixed_in_files: [RENDERER, GATE],
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
  return `-- 2026-08-28 SR ring slice: the named ring is drawn; the counter-number can co-reside; the wrong label says wrong.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_sr_ring_slice.ts — idempotent (upsert on bug_class).\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-28_seed_engine_bug_queue_sr_ring_slice.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ upserted ${payload.length} engine_bug_queue row(s)`);

  for (const r of rows.map((x) => x.bug_class)) {
    const { data, error: rbErr } = await supabaseAdmin.from('engine_bug_queue')
      .select('bug_class,status,owner_cluster,row_type,severity,concepts_affected,fixed_in_files,discovered_in_session')
      .eq('bug_class', r).maybeSingle();
    if (rbErr || !data) { console.error(`✗ read-back failed for ${r}: ${rbErr?.message ?? 'no row'}`); process.exit(1); }
    console.log(`✓ read-back ${data.status.padEnd(5)} ${data.owner_cluster}/${data.row_type}/${data.severity} ` +
      `${JSON.stringify(data.concepts_affected)} ${data.discovered_in_session} ${r}`);
  }
}

main();
