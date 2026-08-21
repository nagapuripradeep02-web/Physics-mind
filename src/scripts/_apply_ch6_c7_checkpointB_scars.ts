/**
 * Ch.6 concept #7 Checkpoint-B closing scar actions.
 *   1. AMEND the cycle-0 row to FIXED — closed by content, no engine spend.
 *   2. INSERT the cycle-2 lesson: adding a checkpoint to fix a stamp adds canvas ink,
 *      and the obvious direction-word label fix ships a line that is false before the return.
 * Run: npx tsx --env-file=.env.local src/scripts/_apply_ch6_c7_checkpointB_scars.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const JSONF = ['src/data/concepts/gravitational_potential_energy.json'];
const AMEND = 'state_claiming_two_values_are_equal_never_renders_both_numerals_in_one_frame';

const NEW = {
  bug_class: 'second_checkpoint_added_for_a_stamp_also_adds_a_permanent_canvas_caption_and_direction_labels_render_false_before_the_return',
  title: 'Solving a stamp problem by adding a checkpoint adds canvas ink, and the obvious label fix ships a line that is false for most of the loop',
  severity: 'MAJOR' as const, owner_cluster: 'alex:json_author',
  root_cause: "Two coupled traps. (1) Every checkpoint necessarily draws a marker caption -- marker is 'flag'|'point' (L2137) with no suppression value -- so adding a checkpoint purely to latch a second stamp also adds permanent canvas text; with the same label as its sibling it duplicates, which breaks the caption-to-stamp mapping that naming a checkpoint exists to provide. (2) capture_mode 'every' stamps on EVERY pass including pass 1 (dwell_from_pass gates only the dwell), so labelling the pair by DIRECTION (leaving/returning) renders a return line during the ascent, before the return has happened. The (pass N) token is appended from capture_mode and pass count at L50647, never from the label, so distinct labels do not remove it.",
  prevention_rule: 'When a round-trip state needs two stamps at one s_m, label the two checkpoints by their ROLE in the measurement (the latched first reading vs the current reading), never by direction -- each label must be true on every pass. Budget the caption ink against the width already proven safe at both the base and de-collided lanes, and pixel-measure clearance to body labels, which the de-collision pass never dodges against.',
  probe_type: 'js_eval',
  probe_logic: 'For any state with two checkpoints sharing an s_m: at a dense frame BEFORE the second crossing, assert no rendered stamp head or marker caption contains a direction word (return|returning|back|down|descend); and assert the set of marker caption strings has no duplicates at every captured frame.',
  status: 'FIXED' as const,
  concepts_affected: ['gravitational_potential_energy'],
  fixed_in_files: JSONF,
  discovered_in_session: 'ch6-concept-7-founder-proxy-B-cycle2',
  row_type: 'incident' as const,
  fixed_at: new Date().toISOString(),
};

async function main() {
  const cur = await supabaseAdmin.from('engine_bug_queue').select('bug_class,status').eq('bug_class', AMEND).maybeSingle();
  if (!cur.data) { console.log(`  ! ${AMEND} not found — nothing to amend`); }
  else {
    const { error } = await supabaseAdmin.from('engine_bug_queue')
      .update({ status: 'FIXED', fixed_in_files: JSONF, fixed_at: new Date().toISOString() })
      .eq('bug_class', AMEND);
    console.log(error ? `  ✗ amend: ${error.message}` : `  ↻ ${cur.data.status} -> FIXED  ${AMEND}`);
  }
  const ex = await supabaseAdmin.from('engine_bug_queue').select('bug_class').eq('bug_class', NEW.bug_class).maybeSingle();
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(NEW, { onConflict: 'bug_class' });
  console.log(error ? `  ✗ ${error.message}` : `  ${ex.data ? '↻ UPDATED' : '+ INSERT '} FIXED ${NEW.severity} ${NEW.bug_class}`);
  const after = await supabaseAdmin.from('engine_bug_queue').select('*', { count: 'exact', head: true });
  console.log(`engine_bug_queue: ${after.count} rows`);
}
main().catch(e => { console.error('💥', e); process.exit(1); });
