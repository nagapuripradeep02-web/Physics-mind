import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
const CONCEPT='hybridisation_sp_sp2_sp3';
type Row={bug_class:string;title:string;severity:'CRITICAL'|'MAJOR'|'MODERATE';owner_cluster:string;status:'OPEN'|'FIXED';subject:'physics'|'chemistry'|'subject_neutral';root_cause:string;prevention_rule:string;probe_type:'js_eval'|'manual';probe_logic:string;fixed_in_files:string[]};
const R:Row[]=[
 {bug_class:'declared_motion_archetypes_deliver_one_uniform_scale_up',
  title:'Three consecutive states named three archetypes and performed the same rigid swell',
  severity:'MAJOR',owner_cluster:'peter_parker:renderer_primitives',status:'FIXED',subject:'subject_neutral',
  root_cause:'The growth beat drove every member of a set through ONE scalar, so any two states with the same element count produced an identical uniform scale-up no matter what archetype each declared. Rule 31 distinctness was satisfied on the NAME and failed on the motion, and no gate compares two states motion to each other.',
  prevention_rule:'An archetype is a claim about RHYTHM, not a label. When two states animate the same element count, they must differ in per-element timing (stagger, order, or a held pause) or they are the same motion. Give the engine a per-element offset and author it; then verify by diffing dense frames of the two states at matching t, not by reading the archetype names. Any timing field the author adds must also be taught to deriveStateMeta, or THE EYE pins the frozen frame before the set has settled.',
  probe_type:'manual',probe_logic:'Diff dense frames of the two states at equal t. If the silhouettes are congruent up to scale, the archetypes are not distinct.',
  fixed_in_files:['src/lib/renderers/field_3d_renderer.ts','src/lib/validators/visual/deriveStateMeta.ts']},
 {bug_class:'contrast_ghost_coresident_with_the_real_set_fuses_both',
  title:'A Rule-16a ghost overlay destroyed countability of the very set it was contrasting',
  severity:'MAJOR',owner_cluster:'alex:architect',status:'FIXED',subject:'subject_neutral',
  root_cause:'The wrong-expectation ghost was shown AT THE SAME TIME as the real set. Ghost lobes land in the angular gaps between the real ones, so the union fills space and neither set is countable - the same fusion geometry that forced front_only. The first response was to delete the ghost, which then failed Rule 16a because the wrong belief was left stated only in narration, and narration is off by default.',
  prevention_rule:'A contrast beat is SEQUENTIAL, not superimposed: show the wrong expectation alone, let it dissolve, then assemble the real physics in its place. That is also the correct Rule-16a order. Superimposing two translucent sets of similar scale is a countability failure by construction, and deleting the contrast to fix it trades a legibility defect for a pedagogy one - do neither.',
  probe_type:'manual',probe_logic:'Read a dense frame during the ghost window and one after it. Each must show exactly one countable set.',
  fixed_in_files:['src/lib/renderers/field_3d_renderer.ts','src/data/concepts/chemistry/hybridisation_sp_sp2_sp3.json']},
 {bug_class:'rule19_primitives_satisfied_by_json_the_renderer_never_receives',
  title:'Every field_3d concept passes the 3-primitives gate with annotations that structurally cannot paint',
  severity:'MAJOR',owner_cluster:'peter_parker:renderer_primitives',status:'OPEN',subject:'subject_neutral',
  root_cause:'scene_composition lives in epic_l_path; the renderer is only ever handed field_3d_config. The annotations were never dropped by a draw call - they never reached the renderer at all. So Rule 19 and every focal_primitive_id have been satisfied fleet-wide by content that cannot exist on screen. Sibling of the older annotation-noop row, stated at the level of the actual cause.',
  prevention_rule:'A content gate must count what the RENDERER receives, not what the concept file contains. When a gate reads one JSON block and the renderer is handed another, the gate measures nothing. Capability now exists behind render_annotations; the fleet decision (backfill ~41 concepts and re-baseline, or stop counting non-rendering primitives toward Rule 19) is still OPEN and is a founder call.',
  probe_type:'js_eval',probe_logic:'For any field_3d concept, grep each authored annotation text verbatim in its built sim.html. Zero hits means the primitive does not exist on screen.',
  fixed_in_files:['src/lib/renderers/field_3d_renderer.ts','src/scripts/build_review_site.ts']},
];
async function main(){
 const {data:ex,error:e1}=await supabaseAdmin.from('engine_bug_queue').select('bug_class').in('bug_class',R.map(r=>r.bug_class));
 if(e1)throw e1;
 const have=new Set((ex??[]).map(r=>r.bug_class as string));
 const ins=R.filter(r=>!have.has(r.bug_class)).map(r=>({...r,row_type:'incident',concepts_affected:[CONCEPT],discovered_in_session:'chemistry-p4-hybridisation-2026-07-29'}));
 if(have.size)console.log('skip existing:',[...have].join(', '));
 if(ins.length){const {data,error}=await supabaseAdmin.from('engine_bug_queue').insert(ins).select('bug_class,status,severity');
  if(error)throw error;console.log(`inserted ${data?.length}:`);for(const r of data??[])console.log(`  [${r.status}/${r.severity}] ${r.bug_class}`);}
 else console.log('nothing new');
}
main().catch(e=>{console.error(e);process.exit(1);});
