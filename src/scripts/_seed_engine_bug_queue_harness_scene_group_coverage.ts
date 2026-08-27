/**
 * engine_bug_queue — the two harness rows from the lines_and_planes_in_space
 * Checkpoint B verification pass, updated after the fix round, 2026-08-27.
 *
 * This is a TARGETED UPDATE, not an upsert. Both rows already exist and both
 * still carry their original idempotence markers, so the ordinary seed-script
 * path would (correctly) refuse to touch them. Recording a fix is a different
 * operation from filing a class, and it says so.
 *
 * WHAT CHANGED, and the honest split between the two:
 *
 *   E-2 (the Rule-37 probe) is CLOSED. founder_drive now shoots the probe BEFORE
 *   its own drag pass, clipped to the sim iframe, and reports a changed-pixel
 *   COUNT against an absolute floor. Verified by negative control.
 *
 *   E-1 (scene-group coverage) is NOT closed, and is deliberately left OPEN.
 *   founder_drive — half the row — now walks every declared group. THE EYE still
 *   captures only the authored default; it now DECLARES that gap loudly instead
 *   of reporting a partial capture as full coverage, which is the row's core
 *   complaint, but declaring a hole is not filling it. Per-group pixel capture
 *   needs captureSimStates() to key state_captures by (state, group), which
 *   cascades into the pixel/regression gates and every approved baseline in the
 *   fleet. Marking this FIXED because the cheap half landed would put a false
 *   green on the one list that exists to stop exactly that.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_harness_scene_group_coverage.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const FIXED_AT = '2026-08-27T06:30:00.000Z';
const FD = 'src/scripts/founder_drive.ts';
const VE = 'src/scripts/visual_eyes.ts';

const E2_NOTE =
  ' FIXED 2026-08-27 (' + FD + '): the probe is shot BEFORE the drag pass, so it can no longer measure a scene ' +
  'this harness froze itself, and every probe records shotBeforeDrags EXPLICITLY — the verdict is meaningless ' +
  'without the order, so the order travels with it. The verdict is now a changed-pixel COUNT from pixelmatch ' +
  'against an ABSOLUTE 60px floor, not byte equality. TWO FURTHER DEFECTS SURFACED WHILE FIXING IT, both found ' +
  'by running the negative control rather than by reading the code. (1) A page-relative RATIO reproduces the ' +
  'diluted-lens mistake already filed as visual_eyes_d5_ink_relative_lens_is_diluted_by_static_chrome_on_' +
  'explore_states: the first threshold (0.1% of a 1280x800 page) called a healthy, slowly-moving view FROZEN at ' +
  '626px/1s. (2) A FULL-PAGE screenshot cannot answer "did the SIM move" at all — the player\'s own timeline ' +
  'scrubber and elapsed-time readout advance every frame, so the pre-F-7 defect (view B with its only animated ' +
  'knob deleted) still scored 258px/1s and PASSED. The probe is now CLIPPED to the sim iframe. Measured after ' +
  'both corrections, clipped and pre-drag: view A 353px, view B 2343px, and the same view B with line2_offset ' +
  'removed 0px — flagged FROZEN. Three orders of magnitude between the populations, which is what makes the ' +
  'absolute floor safe.';

const E1_NOTE =
  ' PARTIALLY ADDRESSED 2026-08-27 — STILL OPEN, DELIBERATELY. Half the row is closed: founder_drive (' + FD + ') ' +
  'now enumerates #vg_scene_group_select, and for EVERY declared group selects it, shoots a Rule-37 motion probe, ' +
  'and drags that group\'s rows; drags and shots record their sceneGroup, and a declared group that exposes no ' +
  'draggable control raises SCENE_GROUP_UNEXERCISED rather than passing silently. Measured on ' +
  'lines_and_planes_in_space: groups 1 -> 2, probes 1 -> 2, drags 11 -> 13, and the previously unreachable ' +
  'line2_offset and theta_deg are now exercised. THE OTHER HALF IS NOT DONE: visual_eyes still captures only the ' +
  'authored default of a partitioned state. It now prints a VIEW COVERAGE block naming every uncaptured view ' +
  '("NOT captured, NOT gated, NOT baselined here") so a reader cannot mistake the frames for the whole state — ' +
  'which answers the row\'s complaint that a partial capture is REPORTED as full coverage, but does not fill the ' +
  'hole. REMAINING WORK: captureSimStates() keys state_captures by state_id alone; per-group capture means keying ' +
  'by (state, group), which cascades into the pixel gate, the regression gate, the frame dump, the contact ' +
  'sheets and every approved baseline filename in the fleet. That is a scoped piece of platform work, not a ' +
  'harness patch, and this row stays OPEN until it lands.';

interface Patch {
  bug_class: string;
  /** Appended to root_cause; the row keeps its original narrative. */
  note: string;
  status?: 'OPEN' | 'FIXED';
  fixed_in_files?: string[];
  fixed_at?: string | null;
  /** Refuse to write twice — the note's own first clause is the marker. */
  marker: string;
}

const PATCHES: Patch[] = [
  {
    bug_class: 'founder_drive_rule37_motion_probe_runs_after_its_own_slider_drags_so_a_drag_seized_scene_is_scored_by_noise',
    note: E2_NOTE,
    status: 'FIXED',
    fixed_in_files: [FD],
    fixed_at: FIXED_AT,
    marker: 'FIXED 2026-08-27 (' + FD + ')',
  },
  {
    bug_class: 'every_visual_gate_captures_only_the_default_scene_group_so_a_partitioned_explore_states_other_view_is_ungated',
    note: E1_NOTE,
    status: 'OPEN',
    fixed_in_files: [],
    fixed_at: null,
    marker: 'PARTIALLY ADDRESSED 2026-08-27 — STILL OPEN, DELIBERATELY',
  },
];

async function main(): Promise<void> {
  let bad = 0;
  for (const p of PATCHES) {
    const { data: ex, error } = await supabaseAdmin
      .from('engine_bug_queue')
      .select('bug_class,root_cause,status,fixed_in_files,fixed_at')
      .eq('bug_class', p.bug_class)
      .maybeSingle();
    if (error) { console.error(`✗ read ${p.bug_class}: ${error.message}`); process.exit(1); }
    if (!ex) { console.error(`✗ ${p.bug_class}: no such row — file it before recording a fix`); bad++; continue; }

    if ((ex.root_cause ?? '').includes(p.marker)) {
      console.log(`⏭  ${p.bug_class.slice(0, 60)}… already carries this note`);
      continue;
    }

    const patch: Record<string, unknown> = { root_cause: (ex.root_cause ?? '') + p.note };
    if (p.status !== undefined) patch.status = p.status;
    if (p.fixed_in_files !== undefined) patch.fixed_in_files = p.fixed_in_files;
    if (p.fixed_at !== undefined) patch.fixed_at = p.fixed_at;

    const { error: uErr } = await supabaseAdmin
      .from('engine_bug_queue').update(patch).eq('bug_class', p.bug_class);
    if (uErr) { console.error(`✗ update ${p.bug_class}: ${uErr.message}`); bad++; continue; }

    // Read-back: "it reported success" is not the evidence.
    const { data: live } = await supabaseAdmin
      .from('engine_bug_queue')
      .select('root_cause,status,fixed_in_files,fixed_at')
      .eq('bug_class', p.bug_class).maybeSingle();
    const ok =
      !!live?.root_cause?.includes(p.marker) &&
      (p.status === undefined || live?.status === p.status) &&
      (p.fixed_in_files === undefined ||
        JSON.stringify(live?.fixed_in_files ?? []) === JSON.stringify(p.fixed_in_files));
    if (!ok) { console.error(`✗ read-back mismatch on ${p.bug_class}`); bad++; continue; }
    console.log(`✓ ${p.status} — ${p.bug_class.slice(0, 58)}…`);
    console.log(`   ✓ read-back: note present, status ${live?.status}, fixed_in_files ${JSON.stringify(live?.fixed_in_files ?? [])}`);
  }
  if (bad > 0) process.exit(1);
  console.log('\nE-2 closed. E-1 stays OPEN — half the row is done and the row says which half.');
}

main().catch((e) => { console.error('💥', e); process.exit(1); });
