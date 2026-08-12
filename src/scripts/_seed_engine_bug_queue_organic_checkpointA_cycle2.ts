/**
 * engine_bug_queue — organic Wave O-0 Checkpoint-A CYCLE 2 scar harvest (2026-08-09).
 *
 * FIVE rows emitted by founder_proxy at the re-gate on `cyclohexane_chair_flip`,
 * which returned DESIGN_OK (conditional). Sibling of
 * _seed_engine_bug_queue_organic_checkpointA.ts (the cycle-1 eight).
 *
 * All five are DESIGN scars found before a line of `organic_structure` exists.
 * Two are notable:
 *   - the enum-audit row RECURS in a narrower form (cycle 1 fixed the walk,
 *     cycle 2 found the walk covered 4 of ~12 declared enums);
 *   - the preset-word-inventory row was CAUSED by a title improvement applied
 *     between cycles, which is precisely why the row exists.
 *
 * Agent emits SQL text only; the session seeds it (AMENDMENT A20).
 * Idempotent: upsert onConflict 'bug_class'.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_organic_checkpointA_cycle2.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'founder_proxy checkpoint A cycle 2 2026-08-09 organic O-0';

type Owner = 'alex:architect' | 'alex:chemistry_author' | 'alex:json_author'
  | 'peter_parker:field3d_surgeon' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'probe_definition' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const C = ['cyclohexane_chair_flip'];

const rows: Row[] = [
  {
    bug_class: 'enum_freeze_audit_walks_the_enums_its_findings_touched_not_every_closed_enum_the_contract_declares',
    title: 'A pre-freeze two-directional enum audit covered four closed enums while the contract it froze declared twelve',
    severity: 'CRITICAL', owner_cluster: 'alex:architect',
    root_cause:
      'The audit was organised around the gaps the author had already found, so its scope was the set of enums those gaps lived in. Enums with no reported gap were signed off by assertion, including two whose forward-declared members for a later wave have no consumer in the served set and appear on no deferred list, while the same section asserted that exactly one enum freezes with unimplemented members.',
    prevention_rule:
      'Before a contract freeze, enumerate every closed enum in the contract text itself and walk each one in both directions. For every enum, ship an IMPLEMENTED list and a DEFERRED list as data with three assertions (union equals the contract, empty intersection, no deferred member reaches the frame pass or the apply pass) - not only for the enum the author knows is forward-declared. A claim of the form "X is the only enum with unimplemented members" is an assertion about the whole contract and must be produced by walking it.',
    probe_type: 'js_eval',
    probe_logic:
      'Parse the contract block for every identifier assigned a pipe-separated member list. For each, assert an IMPLEMENTED and a DEFERRED array exist, that their union equals the declared member set and their intersection is empty, and that every IMPLEMENTED member has at least one named consumer in the served-concept set. FAIL naming the enum and the orphan member.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'hud_line_and_narration_name_scene_atoms_the_canvas_never_labels',
    title: 'Four states rendered strings naming specific ring carbons while no state ever labelled a carbon on the molecule',
    severity: 'MAJOR', owner_cluster: 'alex:architect',
    root_cause:
      "Atom ids were adopted as the contract addressing vocabulary (bond ids, substituent sites, traced bonds) and then leaked into rendered strings - a HUD line stepping through bond names, a traced-bond label, a narration line naming two carbons - without anyone asking whether the student can see which atom is which. The DoD symbol table listed every string and its enum member but had no row for the labels the strings refer to.",
    prevention_rule:
      "Any rendered string or narrated phrase that names a scene element by identifier requires a rendered label on that element, authored as its own DoD row with a time window and a countability budget. Where the identifier is the state's only changing quantity, the label is load-bearing and must be costed into the camera solve, not added after it.",
    probe_type: 'js_eval',
    probe_logic:
      'Extract every atom or bond identifier appearing in a rendered string, a HUD line value domain, or a narration sentence. For each, assert the same identifier appears as an on-canvas label in that state or an earlier one. FAIL naming the identifier, the string that used it and the state.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'preset_cut_removes_every_state_that_names_the_phenomenon_the_concept_is_named_after',
    title: 'A rail-title edit removed the only core-ring occurrence of the word the concept is named after, leaving the reduced preset unable to name it',
    severity: 'MAJOR', owner_cluster: 'alex:architect',
    root_cause:
      'The word survived in the core ring only through one state title. When the title was improved for an unrelated reason, no one re-ran the reduced-preset word inventory, and a sandbox control label that had been justified by "the word this state teaches" lost its ground at the same moment.',
    prevention_rule:
      'After any edit to a title, cue, label or narration string, re-run the reduced-preset rendered-and-narrated word inventory. Assert that under every preset the concept names the phenomenon it is named after at least once, and that every sandbox control label is a word some surviving state renders or narrates.',
    probe_type: 'js_eval',
    probe_logic:
      "For each preset, build the union of rendered strings plus narration over surviving states. Assert the concept's own principal noun appears at least once, and that every explore-state control label appears in that union. FAIL naming the preset, the missing word and the control it labels.",
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'sandbox_exposes_a_view_mode_whose_only_readout_is_absent_from_the_explore_hud_list',
    title: 'The explore state carried a sight-along view toggle at core ring while the torsion HUD line it exists to read was not on the explore HUD list at any ring',
    severity: 'MAJOR', owner_cluster: 'alex:architect',
    root_cause:
      "The explore HUD list was assembled from the lines the guided states leave behind, and the enum ledger's consumer table omitted this concept as a consumer of the torsion line, so the line was never a candidate for the sandbox at all. The control that needs it was ring-gated independently and at a lower ring.",
    prevention_rule:
      'Ring-gate explore controls and explore HUD lines together, not separately. For every explore control that changes what is measurable, assert the readout that measures it is present in the explore HUD list at a ring no higher than the control’s, and that the state teaching that readout survives the same cut.',
    probe_type: 'js_eval',
    probe_logic:
      'For each explore control, resolve the HUD line(s) that read the quantity it changes. Assert each is present in the explore hud_lines list with min_ring no higher than the control’s min_ring. FAIL naming the control, the missing line and the preset at which the pair breaks.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'unsigned_instrument_reading_published_at_sites_where_the_underlying_quantity_alternates_sign',
    title: 'A state published three torsion readings as evidence they are identical, at three bonds whose signed torsions alternate',
    severity: 'MAJOR', owner_cluster: 'alex:architect',
    root_cause:
      'A constraint was written forbidding the induction from becoming a six-reading counting assertion, and it recorded that the instrument prints the magnitude - but it never fixed the rendered label or the sighting-direction convention, so a signed implementation prints a negative value at the middle reading while the narration says all readings are the same.',
    prevention_rule:
      'Where a state publishes repeated readings of a quantity whose sign depends on a convention (torsion, dihedral, angular displacement, potential difference), the skeleton fixes the convention explicitly: render the magnitude with a magnitude label, or fix the measurement direction per site, or select sites of one sign. A note that "the instrument prints the magnitude" is not a convention until the label says so.',
    probe_type: 'js_eval',
    probe_logic:
      "For every state publishing two or more readings of the same quantity as equal, compute the signed value at each site under the engine's own convention and assert either all signs match or the rendered label is a magnitude form. FAIL naming the sites and the differing signs.",
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
];

async function main() {
  const payload = rows.map((r) => ({ ...r, discovered_in_session: SESSION, fixed_at: null }));
  const { error } = await supabaseAdmin
    .from('engine_bug_queue')
    .upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ upserted ${payload.length} engine_bug_queue row(s)`);
  for (const r of rows) console.log(`  · [${r.severity}/${r.status}] ${r.bug_class} (${r.owner_cluster})`);
}

main();
