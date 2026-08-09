/**
 * engine_bug_queue — the organic Wave O-0 Checkpoint-A scar harvest (2026-08-09).
 *
 * EIGHT rows emitted by founder_proxy at Checkpoint A on `cyclohexane_chair_flip`,
 * the Phase-0 0b design that specs the `organic_structure` scenario. The gate
 * returned DESIGN_FIX; these rows are the durable half of that verdict.
 *
 * Per the standing contract (and AMENDMENT A20, recorded by the 3d_geometry_wave
 * harvest): an agent emits SQL TEXT ONLY and the dispatching session applies it.
 * A scar row that is AUTHORED but never SEEDED is invisible to the very
 * consultation designed to surface it.
 *
 * Five of the eight are pre-engine DESIGN scars — they were found before a line
 * of `organic_structure` existed, which is the whole point of gating a Phase-0
 * 0b design rather than a built concept.
 *
 * Idempotent: upsert onConflict 'bug_class'.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_organic_checkpointA.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'founder_proxy Checkpoint A, cyclohexane_chair_flip, 2026-08-09';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:chemistry_author' | 'alex:json_author'
  | 'peter_parker:field3d_surgeon' | 'peter_parker:renderer_primitives'
  | 'peter_parker:runtime_generation' | 'peter_parker:visual_validator' | 'ambiguous';
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
    bug_class: 'core_ring_hud_line_prints_a_conformer_vocabulary_only_a_cut_ring_teaches',
    title: 'A core-ringed explore HUD line renders shape NAMES whose only introduction lives in a hidden extended state',
    severity: 'MAJOR', owner_cluster: 'alex:architect',
    root_cause:
      'The Rule-38b cut was run over unit-bearing VALUES and over symbols, but not over a HUD line whose payload is a controlled VOCABULARY. cyclohexane_chair_flip ringed pose (chair/half-chair/twist-boat/boat) at min_ring core while the states that name those shapes are extended, so under core_only the sandbox prints three untaught words the moment the core pucker control moves.',
    prevention_rule:
      "Run the coherent-when-cut check over every HUD line's VALUE DOMAIN, not just its unit. For a line whose output is drawn from a closed vocabulary, the earliest state teaching EACH member must survive the cut; if any member does not, re-ring the line or restrict its vocabulary under that preset. Sibling of core_ring_state_shows_value_whose_only_derivation_is_higher_ring (the value variant); this is the name variant, and a units-based probe is blind to it.",
    probe_type: 'js_eval',
    probe_logic:
      "For each preset cut, enumerate the value domain of every HUD line the explore state renders at or below the surviving ring. For a vocabulary-valued line, assert every member string appears in a surviving state's rendered text or narration. FAIL naming the member and the state that would have taught it.",
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'enum_gap_audit_walks_the_engine_ask_list_instead_of_the_dod_symbol_table',
    title: 'A pre-freeze closed-enum audit found two gaps by walking its own engine asks and missed three more that its own DoD symbol table renders',
    severity: 'CRITICAL', owner_cluster: 'alex:architect',
    root_cause:
      'The enum-gap section was derived from the buy list (what the author knew was missing) rather than from the Definition-of-Done symbol table (what the sim will actually draw). cyclohexane_chair_flip declared two gaps, then rendered T = 298 K, a second kJ/mol quantity and a spin control with no member in the frozen hud_lines / controls enums; a fourth gap was raised only by the downstream chemistry block. One declared gap was also mis-shaped as an enum member when the correct fix was a new scalar field.',
    prevention_rule:
      'A closed-enum audit is executed against the DoD symbol table and the per-state control table, line by line, in BOTH directions: every rendered string maps to a declared member, and every declared member maps to a rendered string or an explicit deferred list. Additionally, classify each gap as ENUM MEMBER (freeze-blocking) or FIELD (additive, not freeze-blocking) — an urgency claim that does not survive that classification wastes the freeze window on the wrong item.',
    probe_type: 'manual',
    probe_logic:
      "Diff the skeleton DoD symbol-label table plus the explore control/HUD list against the contract's closed enums. Assert set difference empty in both directions. For each declared gap, assert an explicit ENUM/FIELD classification is stated.",
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'directive',
  },
  {
    bug_class: 'new_scenario_buy_list_omits_the_visual_gate_platform_registration_sites',
    title: 'A Phase-0 engine specification listed sixteen renderer asks and none of the deriveStateMeta / snap-set registrations the frozen pin depends on',
    severity: 'CRITICAL', owner_cluster: 'alex:architect',
    root_cause:
      'The buy list was walked state by state against field_3d_renderer.ts only. A new field_3d scenario_type must also register at F3D_REVEAL_KEYS, maxRevealForField3dState, deriveHoldExpectations and deriveMotionExpectations in deriveStateMeta.ts, and join the accumulator-free snap set in field_3d_renderer.ts. Unregistered, every state pins at DEFAULT_REVEAL_MS = 1500 ms and the frozen frame lands before every payoff, while the motion gate reports Skipped and the run still headlines a pass.',
    prevention_rule:
      'Any skeleton that specifies a NEW scenario_type carries the platform registration sites as explicit buy-list rows alongside the renderer asks, with the per-state pin candidates derived from its own choreography table. A success test of the form "authorable as pure JSON with zero further renderer edits" is false until those rows exist, because deriveStateMeta.ts and the snap set are Rule-40 platform files outside the renderer.',
    probe_type: 'js_eval',
    probe_logic:
      'For a new scenario_type: build a minimal config in both the concept-JSON and flattened shapes with one state whose reveal pin is provably not 1500; assert deriveMaxRevealTimeMs and deriveHoldExpectations agree and the pin is not DEFAULT_REVEAL_MS; assert deriveMotionExpectations returns a running (not Skipped) D5 for a state with non-empty motion; assert the scenario_type string is present in the snap-set condition.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'directive',
  },
  {
    bug_class: 'skeleton_budgets_its_pins_against_one_scenarios_local_pin_heuristic_as_if_it_were_the_fleet_rule',
    title: 'A pin budget and a downstream 30 percent duration inflation were both derived from clamp(0.60*R,150,R-150), which exists only inside the newtons_laws_body branch',
    severity: 'MAJOR', owner_cluster: 'alex:architect',
    root_cause:
      "The frozen pin is a per-scenario authored candidate maximum in deriveStateMeta.ts (Math.max of pushed candidates, falling back to DEFAULT_REVEAL_MS). The 0.60*R form is one scenario's local heuristic. Treating it as an engine law produced an invented constraint R >= (L+167)/0.60, which the chemistry block then used to justify inflating the concept from 125 s to 162 s of guided narration.",
    prevention_rule:
      'Before budgeting choreography against a pin rule, quote the reader by file and line for the TARGET scenario. If the scenario is new, the pin is something the skeleton SPECIFIES (as candidates past its own last reveal), not something it must survive. Never inherit a numeric pin rule from a sibling scenario, and never let a pacing decision rest on one.',
    probe_type: 'manual',
    probe_logic:
      "For any skeleton stating a pin formula, grep deriveStateMeta.ts for that expression and assert it is reached by the target scenario_type's branch. If the scenario has no branch, require the skeleton to author pin candidates instead of budgeting against a formula.",
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'directive',
  },
  {
    bug_class: 'payoff_sentence_glows_an_instrument_whose_reading_is_identical_before_and_after_the_payoff',
    title: "The primary aha's closing narration was bound to a symmetric count that reads the same at u=0 and u=1",
    severity: 'MAJOR', owner_cluster: 'alex:architect',
    root_cause:
      'cyclohexane_chair_flip S4 claims every axial bond becomes equatorial and glows the ae_count HUD line, which reads "axial 6 . equatorial 6" both before and after the flip. The same document elsewhere records that this equality is a symmetry identity carrying no information. Compounding it, deriving the family tint from the CURRENT tag at every u returns the untraced bonds to a visually equivalent colouring at the far end, so the generalisation is carried by narration alone on a sim required to read with sound off.',
    prevention_rule:
      'A sentence asserting that a transformation changed something must glow an element whose rendered state DIFFERS across that transformation. Where the taught claim is that a labelling inverted while the counts are symmetric, the evidence must be an ORIGIN-identity trace (the set that started in state A, kept visually distinct through the sweep), never a count and never a tag re-derived at the far end. Check every declared focal against the frame before and the frame after; a focal that is byte-identical across the beat is not evidence.',
    probe_type: 'js_eval',
    probe_logic:
      'For each narration sentence whose text asserts a change, capture the declared focal element at the beat start and the beat end and assert its rendered content or colour differs. FAIL on any focal identical across the beat it is bound to.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'state_survives_a_downstream_author_withdrawing_the_rationale_it_was_added_for',
    title: 'A state added to the arc for a stated reason was kept after the physics author proved that reason unrenderable and deleted it',
    severity: 'MAJOR', owner_cluster: 'alex:architect',
    root_cause:
      "cyclohexane_chair_flip S2 was added because a flat ring eclipses all twelve C-H bonds. The chemistry block correctly proved that evidence unrenderable at the authored camera and hidden-hydrogen setting and dropped the claim, leaving a state that defines a term the concept never uses again, whose narration omits the payload the skeleton's own backwards-trace assigns to it, and in which only the camera moves.",
    prevention_rule:
      'When a downstream author withdraws a claim, re-run the arc over the state that claim justified: does the state still deliver a payload some later state or the backwards-trace consumes? If not, restore the claim in a renderable form or cut the state. Record the decision in writing. A withdrawal recorded only in a disagreements list is not a re-run of the arc.',
    probe_type: 'manual',
    probe_logic:
      "For each disagreement that removes a narrated claim, identify the state whose stated rationale contained it, and assert either that the state's remaining payload is consumed by a later state or by the backwards-trace table, or that an explicit keep/cut decision is recorded.",
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'directive',
  },
  {
    bug_class: 'advanced_ring_relation_prints_a_symbol_whose_standard_sign_convention_the_surface_inverts',
    title: 'An equilibrium relation rendered exp(dG/RT) with a positive dG, inverting the standard dG = -RT ln K convention so two sign errors cancel to the right number',
    severity: 'MAJOR', owner_cluster: 'alex:chemistry_author',
    root_cause:
      'The A-value is defined as the NEGATIVE of dG for the axial-to-equatorial equilibrium and is quoted positive. Rendering "dG = 7.3 kJ/mol" beside "N(eq):N(ax) = exp(dG/RT):1" therefore inverts both the printed sign and the exponent sign. The arithmetic is right and the notation is wrong, which is invisible to a numeric gate and obvious to the advanced-ring student the surface is written for.',
    prevention_rule:
      'On an advanced-ring formula surface, print the quantity under the name whose sign convention the surface uses. Where a literature quantity is defined as the negative of a thermodynamic symbol (A-values, electrode-potential conventions, binding energies), render the literature symbol, not the thermodynamic one. Cross-check every rendered relation against the sign convention the target boards teach, not only against the number it produces.',
    probe_type: 'manual',
    probe_logic:
      'For each formula surface containing a thermodynamic symbol, substitute the HUD value with its printed sign and assert the relation reproduces the rendered result under the standard sign convention for that symbol. FAIL when the result is correct only if the symbol carries a non-standard sign.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'sandbox_species_selector_offers_members_the_published_table_cannot_number',
    title: 'An explore group selector offered five substituents while the published table declared one A-value and one contact geometry',
    severity: 'MAJOR', owner_cluster: 'alex:architect',
    root_cause:
      "cyclohexane_chair_flip S9 exposes group = H|CH3|Cl|Br|OH while the engine_config declares only A(CH3) = 7.3 kJ/mol and the CH3 contact distances. Selecting any other group leaves the population bar, the energy line and the contact readout with no sourced number. Separately, the assessment's transfer item tests tert-butyl, which the frozen group enum cannot name at all.",
    prevention_rule:
      'Every member a sandbox selector can reach must have a sourced entry in the published table for every instrument the sandbox renders. Restrict the selector to the members the table covers, or extend the table with cited values before the enum freezes. Where an assessment item tests a member, that member must be reachable in the sandbox or the item must be marked as staged by no state.',
    probe_type: 'js_eval',
    probe_logic:
      'For each explore selector over a closed member set, assert every member has an entry in the published constants block for every instrument the explore state renders. Independently assert every species named in an assessment item is either reachable in the sandbox or listed in coverage_map.notes as unstaged.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
];

async function main() {
  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: null,
  }));
  const { error } = await supabaseAdmin
    .from('engine_bug_queue')
    .upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ upserted ${payload.length} engine_bug_queue row(s)`);
  for (const r of rows) console.log(`  · [${r.severity}/${r.status}] ${r.bug_class} (${r.owner_cluster})`);
}

main();
