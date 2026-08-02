-- THE CALCULATOR gate gap found on ch6 concept #3 kinetic_energy_definition (2026-08-02)
-- Authored, NOT applied. The apply step belongs in the ship chain, beside visual:approve.
--
-- Evidence: numeric:calc run 20260802-191526 returned 1 assertion / 1 passed / 0 failed /
-- 59 SKIPPED. readings.json shows readings=[] on STATE_1,2,3,4,6 and readings=['v','K'] on
-- STATE_5 ONLY. STATE_5 is the only state whose numbers reach a single text node (the
-- checkpoint stamp writes "flag:  v = 4.00 m/s  ·  K = 24.0 J" into #nlb_formula). Every
-- other state paints its K value in the energy panel, which THE CALCULATOR cannot parse.
--
-- The standing chapter lesson is that a skip is not a pass: on concept #2 THE CALCULATOR
-- reported a state as SKIP and that SKIP WAS the defect. Here the skips are the gate's
-- blindness rather than the concept's defect -- but that is only knowable because it was
-- investigated instead of accepted.

INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('calculator_dom_harvest_needs_symbol_and_value_in_ONE_text_node_so_the_energy_panel_is_invisible',
 'THE CALCULATOR harvests zero readings from the newtons_laws_body energy panel because the panel splits symbol and value across sibling elements',
 'MAJOR', 'peter_parker:visual_validator',
 'readoutHarvest.ts HARVEST_READ channel A walks document.querySelectorAll("body *") and collects only each element''s DIRECT text nodes, deliberately (so a container never duplicates its children). The assertion layer then matches a "symbol = value unit" pattern inside ONE harvested string. nlbBuildEnergyPanel emits the bar symbol and the bar value as SEPARATE sibling elements (.nlb_en_sym holds "K", .nlb_en_val holds "40.0 J"), so no single harvested string ever contains "K = 40.0 J" and the panel yields NOTHING. Measured on kinetic_energy_definition: readings=[] on five of six states; the only state that harvested anything is STATE_5, and only because a SEAM M checkpoint stamp writes v and K into #nlb_formula as one string. The result is 59 SKIP lines that read like coverage but are blindness: the gate reports "state paints no declared symbol" about a state that is painting the concept''s entire taught quantity in 88.9 percent of a 186 px bar.',
 'A numeric gate that matches symbol and value inside a single text node cannot see any instrument that renders them as separate elements. When a new rendering surface lands (the Phase-0 energy layer here), add a harvest channel for it in the same phase, or the gate silently goes dark on exactly the newest and least-proven instrument. Pair every harvested channel with a negative control: a state known to paint a value must not report zero readings. Never read a high SKIP count as coverage.',
 'js_eval',
 'For each state authoring energy_layer: assert the harvested reading set is non-empty and contains one entry per authored bar, with the symbol and the numeric joined from the panel''s sibling elements. Independently, run the harvester against a state known to paint a value and FAIL if readings is empty (negative control).',
 'OPEN',
 ARRAY['kinetic_energy_definition','work_energy_theorem','gravitational_potential_energy','elastic_potential_energy_spring','conservation_of_mechanical_energy','mechanical_energy_loss_with_friction']::text[],
 ARRAY[]::text[],
 'ch6-0d-kinetic_energy_definition-calculator', 'incident'),

('computed_output_divides_by_a_coefficient_whose_default_is_zero_and_evaluates_to_Infinity',
 'A computed_outputs formula divides by mu_k, whose declared default is 0, so the gate evaluates it to Infinity on every state',
 'MODERATE', 'alex:json_author',
 'physics_engine_config.computed_outputs.stopping_distance_at_mu_k is authored as "(v0 * v0) / (2 * mu_k * g)" while variables.mu_k declares default 0 (friction exists only on STATE_5, which sets it per state). THE CALCULATOR substitutes declared defaults and reports "evaluated to Infinity" on all six states. Separately, K_J and the K derived entry are written in terms of v, which is declared with a default but also carries a derived note, and the gate reports "v is not defined". Neither is rendered anywhere, so nothing on screen is wrong - but a computed_outputs block exists to be machine-checkable, and one that cannot evaluate under its own declared defaults provides no check at all. Note also that stopping distance is content this concept deliberately CEDES to concepts 4 and 10 (Checkpoint A finding F12), so its presence in computed_outputs is at best vestigial.',
 'Every computed_outputs formula must evaluate to a finite number under the declared defaults of its own variables. Before authoring one, substitute the defaults by hand: a division by a coefficient that defaults to zero is not a formula, and a symbol that is engine-derived rather than authored needs a default the gate can actually substitute. Delete a computed_output whose quantity the concept deliberately cedes to a later concept.',
 'js_eval',
 'For every concept: substitute each variable''s declared default into every computed_outputs and derived formula and assert the result is finite and not NaN. FAIL on Infinity, NaN, or an unresolved symbol. Report which variable produced it.',
 'OPEN',
 ARRAY['kinetic_energy_definition']::text[],
 ARRAY[]::text[],
 'ch6-0d-kinetic_energy_definition-calculator', 'incident');
