# ARCHITECT SKELETON — `rate_law_and_order` ("Rate law and order of reaction") — REV 3 (BOUNDED REDESIGN, founder-authorized, one pass)

Class 12 · NCERT Ch.3 Chemical Kinetics · renderer: `particle_field`, `scenario_type: "gas_box"` (decided, non-negotiable) · chemistry pipeline (handoff to `chemistry_author`).

REV 3 scope (bounded): measurement METHOD of S2/S3/S4/S5/S8 → fresh-run initial-rate comparison ("many runs, compared"); home-pose constants (`activation_fwd_kT: 3`); instrument requirements re-derived from the method; forced ripples only (DQ list, legibility clause, boundary notes, closure list, k-chip and explore-rerun findings). Everything else is REV 2 verbatim: 11-state arc + justification, ring assignments (S5 core), S9→S10 ordering, all four boundary declarations' structure, anchor, assessment, reverse-layer table, `glow_focal`, titles and delta cues.

Sources check (chemistry form): *Consulted NCERT Chemistry Class-12 Ch.3 chapter index to confirm scope (rate expression, rate constant, order of a reaction, initial-rate method are Ch.3 content). No teaching method, no example problem, no figure imported. NCERT Exemplar consulted for misconception beliefs only.*

Engine-bug-queue consultation: DB query NOT run this session (no shell — quality-auditor must run `npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts rate_law_and_order` at Gate 8 and diff against this skeleton). Scars applied from the inline mirrors AND the cycle-1/cycle-2 findings (cycle-2 numbers measured headless, 5 seeds, on the emitted renderer — treated as facts):

- **Viewport-absolute-rate scar** (collision_theory constraints): absolute collisions/s spans ×5.29 across viewports. → Narrate only RATIOS (×2, ×4, ×1.00, "about ×3") and "holds/climbs" for k; no absolute rate or k value is ever narrated. Instrument chips/axes may show numbers; narration never quotes them.
- **`batch_box_rate_ratio_pinned_to_an_earlier_value_measures_the_run_down_not_the_disturbance`** (CRITICAL, THIS concept, cycle 2 — scar filed): the gas_box is a CLOSED BATCH reactor with no reactant feed, so the underlying rate falls monotonically at all times; a live ratio pinned to an earlier instant measures (disturbance × run-down), never the disturbance. Measured on the S2 "×2" claim: ×0.43–×0.66 (Ea 1.2), ×1.27–×1.80 (Ea 3), ×0.75–×0.96 (N 720) — the instrument never reaches ×2 at ANY pose, while the true counterfactual (5.2/s with the pour vs 2.2/s without at +5 s) IS ×2.4. The physics was right; the comparison was wrong. → REV 3 closes it by redesigning the method: every quantitative comparison is between the INITIAL rates of two separately seeded fresh runs (the method the boundary declaration already named: "MANY runs, compared"). No live ratio is ever pinned to an earlier moment of the SAME run.
- **`drawGasKRatio` is K, not k** (cycle 2, measured): the nearest shipped chip (:5043) computes the EQUILIBRIUM constant K = nAB/(nA·nB), which climbs 0.0010 → 0.3833 (×380) over the authored 20 s run-down — under S6's "Rate falls, k holds" caption it would refute the state. → The k chip is its OWN required instrument (R3) with its own formula; drawGasKRatio is never used here.
- **Explore-state dead box** (cycle 2, measured): the irreversible reaction runs to near-completion (reactants 360 → 25 in 10 s at the old constants), after which Rule 37 free-runs a still box with sliders that change nothing visible; `resetToHomePose()` is harness-only (:6628, :6643). → R4 requests a teacher-facing rerun affordance; S11 is redesigned around it.
- **`misconception_beat_whose_own_evidence_confirms_the_wrong_belief`** (CRITICAL, THIS concept, cycle 1): closed by the S8 counterexample — see §4 and DQ-2; fallback named.
- **`reverse_attempt_per_s` non-zero default** (renderer default **3.5** at :4460): EVERY state authors `reverse_attempt_per_s` explicitly; per-state reversibility table in §3.
- **Confrontation-ring clause** (standing scar, cycle 1): S5 is CORE; S8 is CORE.
- **`instrument_noise_needs_density_not_a_longer_average`** (le_chateliers_principle): Poisson event-rate noise is PHYSICAL; measure candidates BEFORE building. REV 3 note: the density rung is CLOSED for this concept (N pinned 180, founder decision — the sibling takes the 720 exception alone); DQ-1's ladder is re-derived accordingly.
- **Chip-size subscript illegibility** (:5447-5453): species labels (`A`, `B`, `AB`, `A × B`) with the legend; never `N_A`.
- **`glow_focal` is the authoring key** for Rule 32e (`curState().glow_focal` read at :420); `focal_primitive_id` reaches nothing.
- **No right graph pane exists** (:3517-3524; `gasHasGraphPane()` :3500 never called; :6906 stale): every plot is an INSET OVER the box.
- **`lesson_never_states_the_principle_it_is_named_after`**: S2 states "order", S2/S3/S4 fill the law, S9 shows it as a graph.
- **Single-letter slider namespace scar**: new sliders `nA`, `nB`; `T`, `V` reuse established gas_box ids.
- **`species_counts` leftover-budget trap** + sum==N validator rule (`validate-chemistry.ts:63-77`): every authored charge sums exactly to its own N — including EACH RUN of a two-run state (see instrument requirements: per-run sums are a named validator extension for the merge spec).
- **Drag-seize rung-3 scar**: explore-state slider defaults equal the home pose values.
- **K-chip noise scar** (`show_k_ratio` wanders ~50%): never narrate "watch this number stay fixed" over an unmeasured chip — drives DQ-4 (now gating R3).
- **2D-Maxwell-Boltzmann honesty**: no distribution formula anywhere; not needed here.

---

## §1 — Atomic claim + tier + whiteboard test

**Atomic claim:** This concept teaches that the rate law rate = k[A]ˣ[B]ʸ is an EXPERIMENTAL result — the orders x and y are measured by changing one concentration and reading the INITIAL rate's response, and k is the concentration-independent constant that only temperature moves. It does NOT cover why collisions react (shipped: `collision_theory_activation_energy`), how a rate is measured from a concentration–time curve (sibling: `rate_of_reaction`), where equilibrium sits (shipped: `dynamic_equilibrium`), or integrated rate equations and half-life (deferred to a future `integrated_rate_laws`).

**Tier: 💎 (diamond).** On a board, order is ASSERTED from a table of invented numbers — the teacher wrote both columns. Here the student doubles a reactant and the measured rate answers, read off an engine that was never told the rate law — and in S8 the SAME experiment, run at the wrong time, returns the WRONG exponent, which no data table on a board can honestly stage. Capability 2 (what-if with guaranteed-correct physics) + capability 4 (belief change: the equation did not give the exponent; a correctly-timed experiment did). REV 3 note: the run-pair method makes the sim's experiments literally the initial-rate method as NCERT states it — two experiments, initial rates compared — rather than an instrument of our own invention.

**Honest whiteboard-tier exclusions (not padded into states):**
- Integrated rate equations, half-life arithmetic, units-of-k algebra, order-from-data-table drills — board-tier; excluded (drill-downs only).
- The MULTI-STEP counterexample still cannot be RUN — this engine's step is elementary. But the engine DOES run a genuine measured mismatch: with the reverse reaction on and product carried in the charge, the doubling test returns the wrong exponent (S8). The multi-step caveat itself stays narration-only (one closing sentence in S8).

---

## §2 — State count + arc (Rule 11)

**11 states** (10 guided + 1 explore) — count and justification unchanged from REV 2 (10 kept per the gate + S8 mandated by L-1; DQ-2's fallback returns to 10). Two different reactions, SIX quantitative experiments (×2 A, ×2 B, ×4 compression, ×1.00 inert null, the late-test mismatch, order-1 decay), the k identity (two beats, adjacent contrast pair), and a measured-law plot.

| # | Title (Rule 41d) | Purpose | teaching_method | depth_ring |
|---|---|---|---|---|
| S1 | The exponents are unknowns | rate = k[A]ˣ[B]ʸ posed with x = ?, y = ? — to be filled by measurement | *(none)* | core |
| S2 | Double A: rate doubles | two fresh runs, initial rates compared: doubled A → ×2 → x = 1; STATES the word "order". **PRIMARY AHA** | *(none)* | core |
| S3 | Double B: same test | the same run-pair on B → y = 1 (declared contrast pair with S2) | *(none)* | core |
| S4 | Half the volume: rate ×4 | run-pair with the second run seeded at half volume → both concentrations doubled → factors multiply; overall order = 2; reconciles with collision_theory S5 | *(none)* | core |
| S5 | Extra inert particles change nothing | run-pair with inert X added to the second charge: collisions/s higher, initial rate ×1.00 (confronts S4's plant, same ring) | *(none)* | core |
| S6 | k stays fixed | irreversible run-down: rate falls with concentrations, measured k holds (pair with S7) | *(none)* | core |
| S7 | Heating changes k | T ramp at pinned concentrations: k climbs (pair with S6 — the two-directional split) | *(none)* | extended |
| S8 | Measure at the start | the SAME run-pair on a box already carrying product, reverse ON: reads ≠×2 — initial rates on a FRESH box or wrong order. **The L-1 counterexample** | *(none)* | core |
| S9 | Rate against concentration: a line | fwd rate vs count-product accumulates ONE straight line through the origin; slope = k | *(none)* | advanced |
| S10 | Breaking apart: order one | all-AB charge decays; reverse rate vs AB count is a DIFFERENT line — a different reaction, a different law | *(none)* | advanced |
| S11 | Your experiments | sliders set the next run's charge; teacher reruns at will; `interaction_complete` | exploration_sliders | core (surfaces CORE content only, 38b) |

Advanced ring = S9 + S10, contiguous, immediately before the explore state (38a) ✓, ordered THIS reaction's law first. Advance modes: `manual_click` on S1–S10, `interaction_complete` on S11 (Gate 12 ≥2 distinct ✓).

---

## §3 — Per-state choreography + control table (Rule 31 — FIRST design artifact)

Representation-triangle lead (chemistry.md §0) declared per state; symbolic never leads a core state. Scenario archetype: **M — particulate box [LIVE]**, reaction sub-capability [LIVE].

**The run-pair method (used by S2, S3, S4, S5, S8; the teacher's own tool in S11):** Run 1 seeds a fresh charge, the initial-rate tool fits a slope over the opening window (~2 s; at Ea 3 the half-life is ~27 s, so ~5% of reactant is consumed in the window — the slope is honestly "initial"); the fitted result is KEPT as a chip pinned ×1.00. On a narration-synced cue the box RE-SEEDS with the second authored charge — the changed quantity is the visible cause beat (extra discs of one color / the piston stroke / grey discs / carried product) — and the tool fits the second initial slope, displayed as a ratio to the kept chip (×2.0). What persists across the re-seed: the kept chip and the state's formula surface; the box contents are replaced (that IS the announced change). The delta cue names the changed quantity.

| St | Teaches (one idea) | Motion archetype | Distinct motion (what animates) | Delta (= ≤5-word cue, Rule 32c) | Live controls (31c) | Words | Ring | Triangle lead |
|---|---|---|---|---|---|---|---|---|
| S1 | x and y are unknowns to be measured | `reveal-build` | Box reacts at home pose (A+B flashes, AB count climbs on the conc graph); the formula surface writes the reaction header + rate = k[A]ˣ[B]ʸ with x, y as blinking "?" — the only unfilled thing on screen. Narration: the balanced equation above cannot fill them; an experiment will | "x and y: unknown" | none | 40–55 | core | particulate leads, symbolic supports |
| S2 | Order w.r.t. A: two fresh runs, second with A doubled → initial rate ×2 → x = 1; "this exponent is called the order with respect to A" | `run-pair-compare` *(coined REV 3: two back-to-back seeded runs with exactly ONE changed quantity, the first run's fitted initial rate kept as a chip, the second read as a ratio — the between-runs comparison is the experiment; no seed archetype names it. Replaces REV 2's `inject-and-jump`, retired with the pin-and-pour method)* | Run 1: fresh A90/B90, slope chord fits over the opening window, chip pins ×1.00. Re-seed cue (cause first, 32a): fresh A180/B90 — twice the blue discs at the whistle. Second chord fits; ratio chip reads ×2.0; the x slot fills with 1. Honesty clause: "measured, not copied" | "Twice A, twice rate" | none | 40–55 | core | particulate leads |
| S3 | Order w.r.t. B: same run-pair, other reactant → y = 1 | `run-pair-compare` — **declared contrast pair with S2** (flip: the OTHER species) | Run 1: A90/B90 → ×1.00. Re-seed: A90/B180 → ×2.0; y slot fills | "Twice B, twice rate" | none | 30–45 | core | particulate leads |
| S4 | Overall order: doubling BOTH multiplies the factors → ×4; carries the L-7 reconciliation | `compress-the-box` (signature beat, quantitative form — the archetype names the visible cause, the piston stroke; the run-pair is the measurement) | Run 1: home charge, piston 1.0 → ×1.00. Re-seed: same 180 discs, piston strokes to 0.5 DURING the re-seed beat (isothermal) → second chord → ~×4; surface adds `x + y = 2`. Reconciliation sentence: "In collision theory, crowding barely changed the PERCENTAGE of collisions that clear the barrier. It still has not changed — but the NUMBER of A-meets-B collisions is four times larger, so the rate is four times larger" | "Both doubled: rate ×4" | V (piston) | 45–55 | core | particulate leads |
| S5 | Only species IN the law matter: inert crowding does nothing (Rule 16a contrast beat; CORE per the confrontation-ring clause) | `null-result-hold` (the archetype names the flat verdict; the run-pair is the measurement) | Run 1: A90/B90 → ×1.00, collision counter live. Re-seed: A90/B90 + 90 grey X (shipped species) — collision counter visibly HIGHER in run 2 while the ratio chip lands ×1.00. Distinguished from `le_chateliers_principle` STATE_6 (POSITION, pressure gauge): here the instruments are the collision counter and an initial-RATE ratio | "More collisions, same rate" | none | 35–50 | core | particulate leads |
| S6 | k is what stays fixed: rate falls as concentrations fall; rate ÷ (A × B) holds | `run-down-hold` *(coined REV 1: everything falls EXCEPT the focal chip)* | No re-seed, single run, reverse OFF: reaction runs down; conc curves fall, fwd-rate bar shrinks, the glowing k chip (R3 — the live k instrument, NOT the equilibrium-K chip) holds flat. Instrument row shows A count, B count AND k together (L-12) | "Rate falls, k holds" | none | 40–55 | core | particulate leads, symbolic supports (k isolated on the surface) |
| S7 | Temperature lives inside k | `heat-the-box` (signature beat; `T_cue` synced) — **declared contrast pair with S6** | Thermostat ramps 300 → 450 K; concentrations unchanged, rate climbs, k chip climbs with it. SAME instrument trio as S6 (A, B, k) — only the moving quantity flips | "Hotter: k climbs" | T | 35–50 | extended | particulate leads |
| S8 | The doubling test only reads the true order on a FRESH box: with product in the charge and the reverse reaction running, the same run-pair reads wrong — measure initial rates on product-free mixtures | `repeat-and-mismatch` *(coined REV 2: deliberately QUOTE an earlier state's exact motion in a changed context so the instrument's different reading is the content)* | Declared entry recomposition (announced by cue): the home box "run partway" — A(90−n)/B(90−n)/AB(n), purple product visible, reverse ON, breakup flashes visible. A kept reference chip states the fresh-box verdict (`fresh box ×2.0` — S2's measurement, named in narration). Then the exact S2 run-pair on THIS box: run 1 at the carried charge → net chip ×1.00; re-seed with A doubled → the ratio reads clearly MORE than ×2 (~×3 at the DQ-2 target) — "if you trusted this, x would come out wrong." Closing sentence: real reactions also hide multi-step mechanisms — one more reason the equation's coefficients are never the order; measure initial rates on a fresh mixture | "Late test: not ×2" | none | 45–55 | core | particulate leads, symbolic supports |
| S9 | The law holds at every instant: fwd rate vs A × B is ONE straight line through the origin; the LINE is what "order one in each" looks like; slope = k | `trace-the-line` | Home pose, reverse OFF, run-down; the rate-law plot (inset) accumulates points on one line; dragging nA pours reactant and the new points land ON THE SAME LINE, further out | "Straight line, slope k" | nA | 40–55 | advanced | graph leads (advanced ring — allowed), particulate supports |
| S10 | A different reaction has a different law: AB → A + B is order 1 | `trace-the-line` — **declared contrast pair with S9** (flip: the OTHER direction; visible delta is also the all-purple recomposition) | Declared entry recomposition: fresh all-AB charge (precedent: `dynamic_equilibrium` STATE_5); dimers break one by one; the plot (reverse series, x = AB count) accumulates ITS line as the decay sweeps the axis | "New reaction, new law" | none | 40–55 | advanced | particulate leads, graph supports |
| S11 | Teacher sandbox — every experiment is a fresh run | `drag-sandbox` | Sliders set the NEXT charge (nA, nB, V, T); the teacher's **`New run` control (R4)** re-seeds at the slider values; the kept-chip row holds the previous run's fitted rate so the teacher can stage their own doubling experiments; conc graph + rate readout + core surface rate = k[A][B]; continuous run (Rule 37) — after a run-down the box idles until the next `New run` | "Run your own experiments" | nA, nB, V, T, New run | 0 / open | core | particulate |

**Per-state reverse layer (L-2 — authored EXPLICITLY in every state; renderer default 3.5 must never be inherited):**

| States | `reverse_attempt_per_s` | Why |
|---|---|---|
| S1–S7, S9 | **0** | Clean forward-only measurements; prevents S6 accidentally teaching `dynamic_equilibrium`'s converging-rates lesson |
| S8 | **8** | The counterexample NEEDS the reverse term: net = k_f[A][B] − k_r[AB] |
| S10 | **8** | The decay IS reverse events |
| S11 | **0** | Explore surfaces core content only (38b); defaults = home pose (drag-seize scar) |

**Rule 32 legibility plan:** cause first with a readable beat — in a run-pair state the RE-SEED is the cause beat, announced by its cue and named by the delta cue, and the one changed quantity is the only visible difference between the two charges (32b honoured BETWEEN runs: everything else re-seeds identical); instruments respond after their fit window. Only the taught variable moves (S6/S9/S10 declare the run-down/decay AS the taught motion). ONE glow focal per state via the **`glow_focal`** scenario key: S1 the "?" slots, S2–S5 + S8 the ratio chip, S6–S7 the k chip, S9–S10 the plot. Same apparatus at home pose: every guided state ENTERS at the home charge except S8 (product-carrying charge) and S10 (all-AB charge) — the two declared ENTRY recompositions, each announced; the mid-state re-seeds of S2–S5/S8 are declared cause beats, not pose breaks; camera/box geometry never changes.

**Home pose (REV 3 constants — session decision, corrected):** same box geometry as the shipped equilibrium pair; A blue `#60A5FA` (r 5, m 1, 90) · B pink `#F472B6` (r 5, m 1, 90) · AB purple `#C084FC` (m 2, r 7.0710678, 0) · inert **X grey `#9CA3AF`, m 1.5, r 5, 0** (the SHIPPED species from `le_chateliers_principle` — one apparatus across four sims) · T = 300 K · **`activation_fwd_kT: 3`** pinned to `ea_ref_T: 300` — **REV 2's alignment to 1.2 is RETIRED as wrong**: 1.2 is a reversible-regime constant (safe in the equilibrium pair only because `reverse_attempt_per_s: 8` holds a plateau); in this concept's irreversible states the measured reactant half-life at 1.2 is ~4 s at 180 discs (the box dies inside a state) vs ~27 s at 3, and 1.2's ~30% clearing fraction contradicts collision_theory STATE_2's narrated "a handful of collisions in every hundred" on the same apparatus. Ea 3 is collision_theory's OWN value — the barrier belongs to the concept that teaches it · `bond_energy_kT: 2.1` (authored everywhere, effective only where reverse is on) · `reverse_attempt_per_s: 0` at home (table above) · `speed_scale 0.105` · **N = 180** (pinned — the S5 excluded-volume coupling is upheld; the sibling takes the 720 density exception ALONE, ruled NOT a Rule 32d break) · every authored charge sums exactly to its own N, per run. **Sibling coordination flag (rewritten):** `rate_of_reaction` shares this Ea-3 home pose; REV 2's "sibling must adopt 1.2" flag is retired.

---

## §4 — Misconception confrontation plan (Rule 16a; guardrail: 3 only, at real pivots)

1. **"The coefficients in the balanced equation give the orders x and y."** (NCERT Exemplar; THE central one.) → `misconception_watch` on **S1**. In this elementary engine S2/S3/S4 measure the coefficients repeatedly, CONFIRMING the belief — so the decisive beat is **S8**: the identical run-pair, staged on a box already carrying product with the reverse reaction on, returns ~×3 — a measured exponent that is WRONG. The lesson lands as: the equation is not the authority and cannot even warn you when a measurement is mistimed; only an initial-rate measurement on a FRESH mixture gives the order. S2 carries the one-sentence honesty clause (order matches the coefficient here because the step is elementary); S8 closes with the narration-only multi-step caveat. **DQ-2 is the must-measure gate** (does the doubled-A net initial-rate ratio clear the noise band at a viable charge?). **Named fallback if it does not clear:** delete S8 (state count returns to 10), demote the coefficients contrast to a narrated caveat in S2, and re-aim the PRIMARY aha at "the exponent is a measured number" WITHOUT staging a refusal the data contradicts (S1's "?" slots become plain "to be measured" framing).
2. **"k changes when concentration changes / k and rate are the same thing."** → `misconception_watch` on **S6**; contrast beat: the rate bar visibly falls while the k chip (R3) visibly holds; S7 completes the pair.
3. **"Anything that adds collisions speeds the reaction."** → `misconception_watch` on **S5**; contrast beat: run 2's collision counter visibly higher, initial-rate ratio ×1.00. Planted by S4 (core) → confronted by S5 (core) — confrontation-ring clause satisfied.

No EPIC-C branches (EPIC-L-first directive). No other state carries a misconception_watch.

---

## §5 — `has_prebuilt_deep_dive` states (cache hints, not gates)

- **S2** — the doubling/initial-rate arithmetic is where order-determination questions concentrate; the primary aha lives here.
- **S6** — rate vs rate-constant confusion is documented and persistent.
- **S9** — reading order and k off a rate–concentration graph is the exam-facing skill.

Pass-1 cliff states are S1, S4, S6, S8 (Block 1). Divergence documented: S8 is a cliff (needs the reverse-reaction idea) but is NOT deep-dive-flagged — S8's own content IS the remediation for the confusion it serves, and typed confusions route to S2's clusters; S9 is flagged instead because the graph skill is the assessed representation with no state-level remediation elsewhere.

## §6 — Drill-down clusters

- S2: `order_from_doubling` (×2→2ˣ arithmetic for x = 0, 1, 2) · `why_not_coefficients` (elementary vs multi-step) · `initial_rate_data_tables` (the two-experiment table form of what S2/S8 show live).
- S6: `rate_constant_vs_rate` (which one the experiment changes) · `k_units_by_order` (board-tier algebra lives HERE, not in a state) · `k_only_temperature` (link to Arrhenius, collision_theory S8).
- S9: `rate_vs_conc_graph_shapes` (order 0/1/2 line shapes) · `slope_reads_k` · `line_through_origin_meaning`.

## §7 — `entry_state_map`

```
entry_state_map:
  foundational:            STATE_1 → STATE_6    # law posed, x/y measured, overall order, inert null, k (PRIMARY aha S2 inside ✓)
  order_wrt_one_reactant:  STATE_2 → STATE_3
  overall_order:           STATE_4 → STATE_4
  inert_and_crowding:      STATE_5 → STATE_5
  rate_constant:           STATE_6 → STATE_7
  temperature_dependence:  STATE_7 → STATE_7
  initial_rate_method:     STATE_8 → STATE_8
  order_from_graph:        STATE_9 → STATE_10
  first_order:             STATE_10 → STATE_10
  exploration:             STATE_11 → STATE_11
```

## §8 — Prerequisites (advisory, Rule 23)

- `collision_theory_activation_energy` (shipped, same apparatus) — WHY only a fraction of collisions react.
- `rate_of_reaction` (sibling, parallel design) — rate as a measured quantity; the concentration–time curve and the fitted-slope tool.
- `dynamic_equilibrium` (shipped) — the reverse reaction exists and runs (S8/S10 lean on it).
- `kinetic_particle_theory` (shipped) — the box itself.

## §9 — Real-world anchor (Rule 35 / 38f) — unchanged (passed cycle 1)

**Primary:** A glowing wooden splint barely smoulders in air, but pushed into pure oxygen it bursts into flame — the same reaction, roughly five times the oxygen concentration, dramatically faster. How MUCH faster a reaction gets when a concentration changes is a number, and that number — the order — has to be measured. (Performed in school labs on every major syllabus — widest-overlap, culture-neutral, physics-true.)

**Secondary:** A disinfectant diluted with water still kills germs — just more slowly. Halving the concentration cuts the rate by a factor you can only find by experiment.

Why it hooks: both are things a 16–18-year-old has seen, and both pose exactly the question the sim answers with a measured factor rather than an assertion.

---

## §10 — Definition of Done (Gate 0 — no TBDs)

**(a) States:** the eleven states of §2, one line each as tabled.

**(b) Symbol-label table** (on-canvas, Unicode per Rule 34c; NO underscore/subscript count labels at chip size — species labels instead):

| Quantity | On-canvas label |
|---|---|
| rate law | `rate = k[A]ˣ[B]ʸ` (S1; x, y as "?" until filled) |
| filled law | `rate = k[A][B]` (S3 onward, core states) |
| order slots | `x = ?` → `x = 1`; `y = ?` → `y = 1` |
| overall order | `x + y = 2` (S4 surface) |
| rate constant | `k`; chip `k = rate ÷ (A × B)` (R3 — forward events, never the equilibrium-K instrument), value-only, never narrated as an absolute |
| initial-rate chips (R1) | kept chip `run 1 ×1.00` · live chip `run 2 ×2.0`; S8 mode labeled `net`; S8 reference chip `fresh box ×2.0` |
| species | `A`, `B`, `AB`, `X` (legend colors as home pose; legend carries "X: inert" on S5) |
| counts | species-labeled counters (`A 90`, `B 90`, `AB 0`) — never `N_A` |
| first-order law (S10) | `rate = k′[AB]` |
| plot axes (S9) | y `reactions/s`, x `A × B` (count product; legend explains once) |
| plot axes (S10) | y `break-ups/s`, x `AB` (count) |
| temperature | `T (K)` |

**(c) Balanced-equation ledger plan (chemistry variant — RHR N/A):** S1 formula surface carries `A(g) + B(g) → AB(g)` above the rate law (one combined surface); S8's header swaps to the reversible form `A(g) + B(g) ⇌ AB(g)` (first appearance of ⇌, declared, one narration clause); S10's surface swaps to `AB(g) → A(g) + B(g)`. Abstract model species, state symbols (g), no oxidation numbers. Particle-count scale-factor legend `counts stand for concentration (box volume fixed)` on S2, dropped after (Rule 25); S4 narration notes the piston changes concentration by changing volume, not counts.

**(d) Motion plan:** S1 reacting box + surface build; S2/S3 run-pair (seed → chord fit → kept chip → announced re-seed with the doubled species → second chord → ratio); S4 run-pair with the piston stroke as the re-seed's visible change; S5 run-pair with the grey pour into charge 2, rising collision counter, flat ratio; S6 run-down + flat k chip; S7 T ramp + climbing k chip; S8 entry recomposition + breakup flashes + the quoted S2 run-pair + mismatched net ratio; S9 accumulating line + slider pour landing on the line; S10 all-AB decay sweeping its line; S11 slider-seeded reruns. No static state; every state completes ≥1 full motion cycle (for run-pair states: both runs) in its dwell.

**(e) Modes:** none (Rule 20 [D]).

**(f) Assessment + coverage_map + misconception_watch:** `assessment` authored by chemistry_author with **≥6 items** (schema floor `.min(6)`, conceptJson.ts:328): (1) define order w.r.t. a reactant; (2) deduce order from a doubling result; (3) volume-halving / overall-order factor; (4) effect of inert addition; (5) rate vs k — which one concentration changes, which one temperature changes; (6) why initial rates are used to determine order; (7) identify order and k from a rate–concentration line. `coverage_map`: 1→S2, 2→S2/S3, 3→S4, 4→S5, 5→S6/S7, 6→S8, 7→S9/S10. **`non_assessed_states`: STATE_1, STATE_11 (Gate 19d).**

**(g) Macro↔micro plan (Rule 33):** the box IS the micro level; the macro level is the INSTRUMENT ROW: the initial-rate chip row (R1 — kept ×1.00 + live ratio), the k chip (R3), the concentration graph with the fitted chord, the collision counter (S5), thermometer (S7), fwd/rev rate readout. Every instrument = live numeric reading + tracking bar (33d). Per-state interior story: S2/S3 the second charge holds twice the discs of ONE color → twice the A-meets-B encounters (×2 is the real number); S4 same discs, half the room (×4); S5 grey X discs collide constantly, never bond (counter up, ×1.00); S6 fewer flashes as reactants thin (falling curves + flat k); S8 breakup flashes running AGAINST the forward flashes (the net story; the mismatch ratio is the real number); S10 each breakup a visible split. S6 and S7 share the SAME instrument trio (A, B, k) so the contrast pair reads as one two-directional comparison.

**(h) Canvas budget (Rule 34):** ONE math-serif Unicode formula surface per state; on-canvas caption = the ≤5-word delta cue only; all HUDs value-only; the rate-law plot and the conc graph are INSETS OVER the box (no right pane exists) and never shown simultaneously in a guided state; corners reserved per gas_box zoning (instrument band above the box, state chip bottom-left, counter bottom-right, inset panel slot bottom-left).

**(i) Curriculum-flex block (Rule 38):**
- (i-1) **Preset-cut coherence, both cuts:** hide advanced (drop S9–S10) → S8 flows to explore; no surviving narration references the rate-law plot. Hide advanced+extended (drop S7, S9–S10) → S1–S6, S8, S11: law posed, x/y measured, overall order, inert null confronted, k fixed, initial-rate method — complete; S8 introduces the reverse reaction in-state and never references S7; S6's "at this fixed temperature" clause references prerequisite knowledge, not hidden-ring content. ✓
- (i-2) **Explore = CORE only (38b):** S11 shows the rate readout, the initial-rate chip row, conc graph and `rate = k[A][B]`; the rate-law plot, the ⇌ header and the k-vs-T framing stay off; reverse layer off. The `New run` control is core content (it is the initial-rate method itself as a tool).
- (i-3) **`curriculum_tags` (claims):** CBSE/NCERT Class-12 Ch.3 — verified at authoring. JEE Main/Advanced — `needs_teacher_verification`. Cambridge A-level 9701 — `needs_teacher_verification`. IB DP HL Reactivity 2.2 — `needs_teacher_verification`. AP Chemistry Unit 5 — `needs_teacher_verification`. Cambridge IGCSE — claimed NOT IN SYLLABUS, `needs_teacher_verification`; hidden at CATALOG level, not by ring-cutting.
- (i-4) **Preset proposal (hide, never reorder):** `full` = S1–S11; `no_derivation` = hide S9–S10; `qualitative_core` = hide S7, S9–S10; `igcse` = concept hidden entirely.
- (i-5) **Graph axes (38e):** rate–concentration plot: rate y, concentration (count quantity) x — uniform across boards, no axis-swap toggle. Concentration–time pane: concentration y, time x — uniform.

Target: 2–3 founder rounds. No TBD entries.

---

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

1. **Prerequisite cliffs.** `collision_theory_activation_energy` → breaks at **S1**; patch clause: "only collisions with enough energy react — that part does not change today; today we count how often the chances arise." `rate_of_reaction` → breaks at **S2** under the new method (reading a fitted chord as "the initial rate"); patch: "the slope of this curve at the start is the initial rate — the measured rate you have met"; S6's falling-curves reading keeps its REV 2 patch. `kinetic_particle_theory` → breaks at **S4**; patch: "the wall moves in, so the same particles share half the room." `dynamic_equilibrium` → breaks at **S8**; patch: "AB can break back into A and B — with product on screen, that reverse reaction is running too."
2. **JEE-backwards trace.** Q1: *"For rate = k[A][B], the vessel volume is halved at constant T. By what factor does the rate change, and does k change?"* — order meaning → S2/S3; ×4 → S4; k unchanged by concentration → S6; k moves only with T → S7. Q2: *"Why is the initial rate used to determine order?"* — delivered by **S8**, now with a genuine right-time test (S2) to contrast against. Q3: *"Doubling [X] leaves the rate unchanged — order w.r.t. X?"* — the x = 0 case is never RUN honestly; S2's doubling→2ˣ logic + S5's null beat give the reasoning; drill-down covers the arithmetic. Declared adequate.
3. **Misconception entry mapping (16a).** Belief 1 (coefficients→order): planted by textbook notation — S1 flags it at the planting moment; S2 fills the slot by measurement; **S8 delivers the confrontation with a measured mismatch between two initial-rate run-pairs — one fresh, one product-laden**. Belief 2 (k≡rate): confined to S6, confronted in the same beat, completed by S7. Belief 3 (any collision counts): planted by S4, confronted IMMEDIATELY by S5, same ring. No EPIC-C branches.

### Block 2 — Aha-moment designation

- **PRIMARY aha (S2):** *You do not read the exponent off the equation — you double the concentration and the measured rate tells you the exponent.* (10-year memory: order is an experimental number.)
- **SUPPORTING ahas (2 — above the 1+1 sweet spot, justified):** **S6** — *when the rate changes, k does not; k is the part of the law concentration cannot touch.* **S8** — *even the measurement must be done at the right moment; a late doubling reads the wrong exponent.* Both serve the primary directly; neither stands alone.
- **Cohesion check:** S4 (×4), S5 (null), S9/S10 (the lines) all reinforce "measured, not asserted"; none stands alone.
- **Wrong-belief setup:** for S2 — S1 puts the balanced equation on screen with coefficients visibly available to copy before the "?" slots refuse to fill (retained under the PRIMARY design because S8 vindicates the refusal; removed under the DQ-2 fallback — §4). For S6 — S2–S4 build "changing things changes the rate." For S8 — S2/S3 themselves build "the doubling test always works."
- **Foundational coverage:** PRIMARY aha S2 ∈ foundational (S1–S6) ✓ — no exit-pill needed.

---

## INSTRUMENT REQUIREMENTS (REV 3 — behavioural only, NO flag names, widget keys, geometry or fit implementation; the session merges these with the sibling's requirements into ONE spec and dispatches the surgeon once)

Hard constraints acknowledged: `drawGasConcGraph` / `show_concentration_graph` / `gasConcTrace` are UNTOUCHED (four locked baselines — add-only overlays permitted, no refactor of the existing draw path); the extract-from pattern is `drawGasArrhenius` (:5376-5462); no right pane exists — every plot is an inset over the box; new instruments are read-only against the physics (all 13 `check:gas-reaction` conservation checks stay green); every instrument is widget-gated per Rule 39 with keys chosen at the merge.

**R1 — Initial-rate run-pair instrument** (S2, S3, S4, S5, S8; the teacher's tool in S11) — **REPLACES REV 2's pinned live-ratio instrument, which is retired under the batch-box scar (a ratio pinned to an earlier instant of the same run measures the run-down, never the disturbance — measured never reaching ×2 at any pose):**
- **Cue-driven re-seed:** on a narration-synced cue, the box seeds a FRESH authored charge (species counts + piston pose per run; each run's counts sum to that run's N). A state may author two charges (run 1, run 2).
- **Fitted initial slope:** over a declared opening window from each run's start (~2 s at the home constants; window length is DQ-1's variable, bounded so ≤~10% of reactant is consumed — the slope stays honestly "initial"), fit a slope to the product-count trace. This REUSES the window/chord fitted-slope tool the sibling `rate_of_reaction` is already receiving — one mechanism, two consumers (merged spec).
- **Keepable chip:** run 1's fitted rate persists across the re-seed as a chip pinned ×1.00; run 2's fitted rate displays as a RATIO to it (`×2.0`), value-only, readable at a glance. Chips clear at state exit.
- **Selectable event series:** forward, reverse, or NET (forward − reverse) — net is required by S8.
- **Authored reference chip:** a state may display a labeled static chip quoting an earlier state's measured verdict (`fresh box ×2.0` in S8), visually distinct from live chips.
- **Stability (DQ-gated):** ×1 / ×2 / ~×3 / ×4 must be visually distinguishable from each other and from the run-to-run spread of the fitted slope.
- Net engine ask is SMALLER than the replaced instrument: shared fit tool + a re-seed hook + a chip row.

**R2 — Rate-vs-quantity plot** (S9, S10; one instrument, two configurations) — unchanged from REV 2: accumulates (windowed measured event-rate, live count quantity) samples; per state, y = forward OR reverse series, x = free-reactant count product OR product count; straight-line-through-origin fit with slope as value-only readout; axes fixed at state entry; seeded/deterministic; inset in the same panel slot discipline as the conc graph (one or the other, never both).

**R3 — Live k chip** (S6, S7; value-only) — **NEW as its own piece (omitted from the REV 2 merge spec):** computes `k = (windowed forward event rate) ÷ (nA × nB)` live, displayed value-only with a flat/tracking bar. Explicitly NOT `drawGasKRatio` (:5043): that chip computes the EQUILIBRIUM constant K = nAB/(nA·nB), measured climbing 0.0010 → 0.3833 (×380) over the authored 20 s run-down — under the caption "Rate falls, k holds" it would refute the state. DQ-4 gates its narratable flatness.

**R4 — Teacher rerun affordance** (S11) — **NEW:** a teacher-facing `New run` control that re-seeds the box at the current slider values, reusing R1's re-seed hook; the kept-chip row persists the previous run's fitted rate so the teacher can stage doubling experiments. Justification (measured): the irreversible reaction runs down and the box then sits dead under live sliders (reactants 360 → 25 in 10 s at the old constants; `resetToHomePose()` is harness-only, :6628/:6643). At Ea 3 the half-life is ~27 s — enough for ONE demonstration pass, judged NOT enough for open-ended classroom use; the rerun affordance is REQUIRED, not optional. Rule 37's continuous free-run is unchanged — the box idles between runs.

**Verify-only (kept from REV 2; shipped precedents):**
- `inject_species` / seeding with a species outside `reaction.reactants/product` behaves as fully inert — precedent: `le_chateliers_principle` STATE_6.
- A state can author an all-AB charge (A:0, B:0) without the leftover-budget trap firing — precedent: `dynamic_equilibrium` STATE_5.
- **Validator extension (flag to the merge spec):** `validate-chemistry.ts:63-77` checks ONE species sum per state; two-run states carry two authored charges, each of which must sum to its own N — the per-run check must be added or the second charge goes unvalidated.

## Design-quantification (DQ) list for chemistry_author — measure BEFORE narrating, and measure candidates BEFORE building

1. **Fitted-slope repeatability × inert null (ONE coupled item).** At the REV 3 home pose (Ea 3, N 180), measure the run-to-run spread of the fitted initial slope over ≥5 seeds and verify ×1 / ×2 / ~×3 / ×4 separate from the spread. Mitigation ladder (density rung CLOSED — N pinned 180, founder decision; the sibling takes 720 alone): (a) lengthen the fit window, bounded by the ≤~10% consumption honesty limit (~2–4 s at the measured ~27 s half-life); (b) seeded repeat-run averaging (the many-runs method extends naturally: fit each run twice and average); (c) if neither clears → **named BLOCKER to the founder**, not a third instrument. Coupled S5 check stays at N 180: 2D hard-disc g(η) — at 180 discs (η ≈ 0.046) the +90 inert charge raises the A–B encounter rate ~4%, inside the noise band, so the null is honest; re-derive only if the pour size changes.
2. **S8 viability sweep — the must-measure gate (re-derived).** The REV 2 target (A60/B60/AB60, N 180) is RETIRED twice over: it sat AT equilibrium (measured fwd 15.8/s vs rev 16.4/s, net −0.6/s — the ratio divided by ~zero) and it was arithmetically ambiguous (180 discs but 240 atoms — denser than the home pose it claimed to share; sum==N enforced). REV 3 charge family: **the home box "run partway" — A(90−n)/B(90−n)/AB(n), N = 180−n** — atom-conserving with the home pose, so "this box already ran for a while" is literally true. DQ-2: at Ea 3, reverse 8, sweep n; measure initial F and R per charge; the doubled-A run-pair predicts a net factor (2F−R)/(F−R); **target R ≈ F/2 → factor ~×3 with net baseline F/2** (illustrative at the cycle-1 measured effective constants: n ≈ 30 → A60/B60/AB30 gives F ≈ 15.8, R ≈ 8.2, factor ≈ ×3.1, net ≈ 7.6/s — re-measure at Ea 3, where both F and the derived reverse barrier shift). The chosen n must clear ×2 by at least DQ-1's measured spread while F − R stays above the noise floor. **If no n clears → invoke the §4 named fallback** (delete S8, 10 states, narrated caveat, re-aimed primary aha).
3. **S4 compression factor** at piston 0.5, as a ratio of two fitted initial slopes (dilute-limit ×4; hard-disc packing at the compressed η pushes it above — measure, narrate "about four times").
4. **S6 k-chip (R3) flatness** at Ea 3: measure the k = rate ÷ (A × B) wander over the run-down and size the state's window so "holds flat" is visibly true; never narrate a value.
5. **S9/S10 line quality** at Ea 3: events are rarer than at 1.2 — measure points-per-state and R² at the shipped seed discipline; dwell may need lengthening.
6. **S10 decay pace at the REV 3 constants:** bond 2.1, reverse 8, fwd barrier now 3 (Ea_rev is derived, never authored) — the shipped all-AB precedent runs at the equilibrium pair's Ea 1.2, so its pace does NOT transfer; verify one full plot sweep fits the state's dwell at Ea 3.
7. **Run-pair state dwell:** verify two fit windows + the re-seed beat + chip reads fit each run-pair state's dwell with ≥1 full motion cycle per run.

## Boundary declarations (required)

- **vs `collision_theory_activation_energy` (shipped):** it owns WHY a collision reacts (Ea, fraction, T-fraction link, catalyst, Arrhenius). This concept never re-teaches the barrier and has no Ea slider anywhere. REV 3 constant note (rewritten): this concept now RUNS collision_theory's own barrier, `activation_fwd_kT: 3` — the barrier belongs to the concept that teaches it, and the ~5% clearing fraction keeps its "a handful of collisions in every hundred" narration true on the shared apparatus (REV 2's 1.2 alignment, which broke both, is retired). Its "Crowded" state showed more particles → more collisions QUALITATIVELY; S2–S5 go past it to MEASURED FACTORS. S4 carries the explicit one-sentence reconciliation with its S5.
- **vs `rate_of_reaction` (sibling, parallel design):** it owns rate as a measured quantity (conc-time curve, average vs instantaneous, slope). This concept ASSUMES the curve and uses it as an instrument. Shared home pose (Rule 32d cross-sim): identical box, species, counts, T, **Ea 3**; the sibling's N-720 density exception is its own declared exception (ruled NOT a Rule 32d break) — this concept stays at 180. Shared instrument: ONE window/chord fitted-slope mechanism, two consumers (its average/instantaneous overlays; my R1 initial-rate chips + R2 plot) — merged spec, surgeon dispatched once.
- **vs `dynamic_equilibrium` (shipped):** its STATE_5 already runs S10's all-AB charge verbatim and its STATE_6 ASSERTS both rate laws in narration. The relationship is **assert → measure**: equilibrium STATED the two laws to explain a plateau; S9/S10 MEASURE them as straight lines and read k off the slope. It owns where the plateau sits; every equilibrium-flavoured picture (converging rates) is confined to S8/S10 with reverse-on declared. REV 3 constant note: the equilibrium pair ships Ea 1.2/bond 2.1/reverse 8 — this concept borrows the reverse MACHINERY and the all-AB charge precedent but runs them at Ea 3, so no pace or plateau measured there transfers (DQ-2/DQ-6 re-measure).
- **vs `le_chateliers_principle` (shipped):** its STATE_6 pours the grey inert X for a "nothing happens" verdict measured as POSITION (pressure gauge, unchanged plateau). S5 uses the SAME shipped species (X, `#9CA3AF`, m 1.5, r 5 — one apparatus across four sims) but measures RATE: two fresh runs whose initial-rate chips read ×1.00 while run 2's collision counter is visibly higher. Different instrument, different claim; S5's narration never mentions equilibrium position.

## Self-review confirmations

Atomic claim one sentence ✓ · 11 states, justification unchanged (fallback path returns to 10) ✓ · control table complete: archetypes declared, THREE declared contrast pairs (S2/S3 species-flip on `run-pair-compare`; S6/S7 two-directional k split; S9/S10 direction-flip), three coined archetypes each justified (`run-pair-compare` REV 3, `run-down-hold`, `repeat-and-mismatch`; `inject-and-jump` retired with its method), no static state, no undeclared archetype repeat, drag-sandbox last ✓ · per-state reverse-layer table authored ✓ · misconception_watch at exactly 3 pivots, same-or-lower-ring confrontations ✓ · deep-dive flags 3 with clusters ✓ · no `narrative_socratic`/`wait_for_answer` ✓ · Rules 32 (re-seed-as-cause-beat clause added; `glow_focal`) /33/34/38/41 plans present ✓ · assessment 7 items + `non_assessed_states` ✓ · anchor universal ✓ · [LIVE]-only archetype ✓ · requirements-only instrument section (R1–R4 + verify-only, no keys/geometry/fit) ✓ · every quantitative claim in a run-pair state is now a comparison of two initial rates from separately seeded runs — no ratio anywhere is pinned to an earlier instant of the same run ✓ · handoff-ready to `chemistry_author` ✓ · bug-queue DB query outstanding (flagged to quality_auditor).

**Findings closed (cycle 2 — this REV 3 pass):**
- **C2-1 (CRITICAL) pin-and-pour measures the run-down, not the disturbance** — method replaced on S2/S3/S4/S5/S8 with the fresh-run initial-rate comparison ("many runs, compared" — the method my own boundary declaration named): seed → fitted initial slope → kept chip ×1.00 → announced re-seed with ONE changed quantity → second slope → ratio. R1 rewritten around it (shared window/chord tool + re-seed hook + keepable chip — a smaller ask than the retired instrument); archetype recoined `run-pair-compare`; scar row mirrored with the measured refutation (never reached ×2 at any pose; true counterfactual ×2.4).
- **C2-2 constants corrected** — `activation_fwd_kT: 3` (collision_theory's own value; measured half-life ~27 s vs ~4 s at 1.2; clearing-fraction continuity with its "handful per hundred" narration); REV 2's 1.2 alignment retired as a reversible-regime constant misapplied to an irreversible box; N pinned 180 (S5 g(η) coupling upheld; sibling takes 720 alone); sibling flag rewritten to Ea 3; boundary notes vs collision_theory and the equilibrium pair re-derived.
- **C2-3 S8 re-derived under the new method** — contrast = two run-pairs of initial rates, fresh box vs product-carrying box; old target charge A60/B60/AB60 retired (measured AT equilibrium, net −0.6/s, ratio divided by ~zero; and 240-atom mass ambiguity vs sum==N). New charge family A(90−n)/B(90−n)/AB(n), N = 180−n — mass-consistent with the home pose, so the "already ran for a while" story is literally true; DQ-2 sweeps n targeting R ≈ F/2 (factor ~×3, net = F/2); §4 fallback retained verbatim.
- **C2-4 k chip specified as its own instrument (R3)** — `k = forward rate ÷ (A × B)`, value-only; `drawGasKRatio` explicitly excluded with the measured reason (it is equilibrium K, climbing ×380 over the run-down under a "k holds" caption).
- **C2-5 explore dead box** — Ea 3's ~27 s half-life judged sufficient for one demonstration pass but NOT for open-ended classroom use; R4 (teacher `New run` re-seed + kept-chip row, reusing R1's hook) is a REQUIRED ask; S11 redesigned so sliders set the next run's seed — turning the dead-box defect into the initial-rate method as a teacher tool.
- **Forced ripples closed:** Rule 32 plan gains the re-seed-as-cause-beat clause (entry recompositions S8/S10 unchanged); per-run sum==N validator extension flagged to the merge spec; DQ list re-derived at Ea 3 (ladder re-ordered with the density rung closed, DQ-6 pace non-transfer, new DQ-7 dwell check); DoD (b)/(d)/(g) and §5-adjacent text updated to the chip row; prerequisite-cliff S2 patch updated to the fitted-chord reading.

**Honesty statement:** no part of the new method requires the engine to fake anything — the fitted slope, re-seed and chips are all measurements or replays of things the box genuinely does. The one place honesty could still fail is statistical (rare events at Ea 3 making the fitted slopes too noisy to separate ×2 from ×1) — that is DQ-1's measured gate, and its ladder ends in a NAMED BLOCKER, not a workaround instrument.

---

## Open questions for the founder (architect)

1. **R4 confirmed as the resolution to the dead-box finding?** I judged Ea 3's longevity insufficient for open-ended classroom use and made the rerun affordance a required ask (it reuses R1's re-seed, so the marginal engine cost is one control + wiring). If you prefer to ship without it, S11's honest fallback is "one demonstration pass per state entry," which I do not recommend.
2. **S8's mass-consistent charge family** A(90−n)/B(90−n)/AB(n) (N = 180−n) — confirm the family; DQ-2 picks n. (State count 10 → 11 and explore-reverse-off were REV 2's open questions; this pass proceeded under the founder authorization and they stand as designed.)
