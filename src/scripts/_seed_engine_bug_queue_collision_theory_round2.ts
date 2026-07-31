/** Round-2 review scars for collision_theory_activation_energy (2026-07-30). */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
const S='session_2026-07-30_collision_theory_review_round2';
const R='src/lib/renderers/particle_field_renderer.ts';
const C='collision_theory_activation_energy';
const rows=[
 {bug_class:'inset_relocation_fix_not_extended_to_a_later_inset',
  title:'Moving the histogram off the slider panel sent the NEXT inset into the slot it vacated — and the fix for that went into the wrong function, silently',
  severity:'MAJOR',owner_cluster:'peter_parker:renderer_primitives',subject:'chemistry',
  root_cause:'VERIFIED + FIXED 2026-07-30, found independently by eye_walker AND quality_auditor. '+
   'gas_histogram_inset_clipped_by_review_slider_panel was fixed by moving the histogram LEFT when a '+
   'state shows sliders. The energy hill, added later, positions itself OPPOSITE the histogram — so on '+
   'the one state with sliders + histogram + hill, the hill took the right slot the histogram had just '+
   'fled, which is exactly where #pm-sliders lives. Measured: the Volume slider row sat on the "kT" of '+
   'the hill\'s own Ea label, occluding the peak, the right flank and the upper arrowhead, in the ONE '+
   'state where a teacher drags Ea and watches that value move. Mean luma of the overlap rect was '+
   'identical to 1 d.p. across three sampled frames, so it was structural, not transient. WORSE in the '+
   'product than in the capture: pmSlidersTop is 10px under THE EYE and 52px in review chrome, pushing '+
   'the panel 42px further into the inset. SECOND DEFECT, self-inflicted: the first fix was applied to '+
   'drawGasArrhenius instead of drawGasProfile, because the two carry near-identical placement '+
   'comments. It compiled, all gates passed, THE EYE returned 39/39, and the frame was unchanged — '+
   'caught only by grepping the EMITTED renderer body for the new code.',
  prevention_rule:'A relocation fix must be re-derived for EVERY inset that shares the state, not '+
   'transplanted: "opposite the other one" is not a position when the other one has itself been moved. '+
   'Dodge by MEASURING the overlay (offsetTop + offsetHeight of #pm-sliders) so the fix holds at both '+
   'review-chrome offsets. And when two functions carry near-identical code, verify the edit reached '+
   'the one you meant by inspecting the emitted output — a same-shaped block elsewhere accepts the '+
   'patch and changes nothing.',
  probe_type:'vision_model',visual_category:'H',state_id:'STATE_9',
  probe_logic:'For every state with show_sliders, assert no canvas inset rect intersects the #pm-sliders rect, at BOTH pmSlidersTop values (10px and 52px).',
  status:'FIXED',concepts_affected:[C],fixed_in_files:[R],row_type:'incident'},
 {bug_class:'scene_composition_undercounts_what_the_config_actually_renders',
  title:'Four states painted instruments their scene_composition never declared — the exact reverse of the declared-but-never-painted defect',
  severity:'MODERATE',owner_cluster:'alex:json_author',subject:'chemistry',
  root_cause:'VERIFIED + FIXED 2026-07-30 (eye_walker + quality_auditor). After '+
   'chemistry_formula_surface_declared_without_a_formula_overlay was fixed by adding the missing '+
   'overlays, the mirror gap remained: STATE_5 and STATE_6 painted formula surfaces, STATE_6 and '+
   'STATE_9 painted the energy hill, and STATE_8 ran a particle cloud, with none of them declared. '+
   'Rule 19 still passed on count, but scene_composition is the record a reviewer reads to know what a '+
   'state SHOWS — and STATE_6, cited as the proof that the hill lowers on a catalyst cue, did not list '+
   'the hill at all.',
  prevention_rule:'Reconcile scene_composition against the config flags in BOTH directions: every '+
   'declared primitive must paint, and every painted instrument must be declared. One direction alone '+
   'leaves the record wrong.',
  probe_type:'js_eval',
  probe_logic:'Diff declared primitive ids against the set implied by the state config flags (show_* / formula_overlay); report both directions.',
  status:'FIXED',concepts_affected:[C],fixed_in_files:[],row_type:'incident'},
 {bug_class:'contract_prose_not_renumbered_with_the_states',
  title:'Renumbering states fixed every functional field and no prose — 32 self-referential references stayed off by one, three of them stating the opposite of the truth',
  severity:'MODERATE',owner_cluster:'alex:json_author',subject:'chemistry',
  root_cause:'VERIFIED + FIXED 2026-07-30. Inserting a state shifted the keys, labels, tts ids, '+
   'aha_moment.state_id and entry_state_map correctly, and left variables notes, constraints, '+
   'authoring_notes, the anchor and curriculum_tags pointing at the old numbering — 32 fields. Three '+
   'were not merely stale but FALSE: cannot_show_declared_omissions still listed the reaction-profile '+
   'energy diagram as something this sim CANNOT show, when it had just become the concept\'s signature '+
   'instrument; vocabulary_quarantine claimed the A + B -> AB surface was quarantined to one state '+
   'while a core state also showed it; and the activation_energy_kT note said the opening state '+
   'authors 3 when the whole point of that state is that it authors 0. Nothing renders this prose, so '+
   'no gate and no frame can see it — but it is what the next session reads as truth.',
  prevention_rule:'A state insertion touches prose as well as keys. After renumbering, sweep every '+
   'free-text contract field and re-read the ones that make CLAIMS about what the sim can and cannot '+
   'do — those decay into confident falsehoods rather than obvious typos.',
  probe_type:'js_eval',
  probe_logic:'Extract STATE_n / Sn references from all prose fields and assert each names a state whose content matches the claim.',
  status:'FIXED',concepts_affected:[C],fixed_in_files:[],row_type:'incident'},
];
(async()=>{for(const r of rows){const res=await supabaseAdmin.from('engine_bug_queue').upsert({...r,discovered_in_session:S},{onConflict:'bug_class'});
console.log(res.error?`  x ${r.bug_class}: ${res.error.message}`:`  ok ${r.severity.padEnd(8)} ${r.status.padEnd(5)} ${r.bug_class}`);}
const {data}=await supabaseAdmin.from('engine_bug_queue').select('root_cause').eq('bug_class','symbol_printed_on_canvas_before_the_lesson_defines_it').single();
if(data){const note=' RECURRED 2026-07-30 in the SAME concept, in two more symbols after the Ea instance was fixed: the opening state\'s formula overlay printed A, B and AB while A/B were defined one state later and AB six states later, and the advanced state printed f, c and k with none of the three ever named. A FORMULA SURFACE COUNTS AS USE, not just an instrument. Fixed by dropping the opening state\'s overlay entirely (the skeleton had specified none there) and by binding f and Boltzmann\'s k in narration while replacing the bare intercept c with the word "constant".';
const {error}=await supabaseAdmin.from('engine_bug_queue').update({root_cause:(data.root_cause??'')+note}).eq('bug_class','symbol_printed_on_canvas_before_the_lesson_defines_it');
console.log(error?`  x extend: ${error.message}`:'  ok extended symbol_printed_on_canvas_before_the_lesson_defines_it (recurrence recorded)');}})();
