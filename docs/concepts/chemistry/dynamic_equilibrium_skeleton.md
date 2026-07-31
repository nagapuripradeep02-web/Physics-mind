# SKELETON — `dynamic_equilibrium` (CHEMISTRY)

**Concept:** Dynamic equilibrium · Class 11 · NCERT Chemistry Ch.6 "Equilibrium", §6.2 (Equilibrium in chemical processes — dynamic equilibrium)
**Pipeline:** architect → **chemistry_author** → json_author → quality_auditor
**Renderer:** `renderer_pair.panel_a: "particle_field"`, `scenario_type: "gas_box"` with the reaction layer (`gas.reaction`), archetype **M — Particulate box `[LIVE]`**. Canvas 900×560 (clone `kinetic_particle_theory`).
**Structural precedent:** `src/data/concepts/chemistry/kinetic_particle_theory.json` — the only shipped gas_box concept; copy its `particle_field_config` shape, slider block, and state-key vocabulary exactly.
**Position:** P1 #2 of the `docs/CHEMISTRY_DISCUSSIONS.md` Session-C5 ranked list; the declared foundation for `le_chateliers_principle`, which is built next on this same engine.

---

## §0 ENGINE REALITY-CHECK — read before designing anything (verified against code 2026-07-28)

The brief's renderer claims were checked line-by-line against `src/lib/renderers/particle_field_renderer.ts` in this worktree. **Most held. One did not, and it is load-bearing for four of the seven states.** Recording it here in the form the archetype-`[LIVE]` scar taught: a renderer claim is a CLAIM.

**CONFIRMED authorable per state** (`particle_field_config.states.STATE_N`), each verified at its read site:
`T` · `piston_frac` / `piston_from` · `N` (in reaction mode a **delta** control) · `adiabatic` · `activation_energy_kT` · `reaction: { activation_fwd_kT, bond_energy_kT, reverse_attempt_per_s }` — **numbers only**, via `gasRxNum` · `caption` · `formula_overlay` · `visible_controls` · `show_reaction_readout` · `show_concentration_graph` · `show_energy_ledger` · `show_pressure` · `show_gas_thermometer` · `show_collision_counter` · `show_speed_histogram` · `show_gas_law` · `show_trails`.

**NOT authorable at the time of writing — the brief's one wrong claim:**

> *"Species are authored with initial `count` — so you can open a state from pure reactants, from pure product, or from a mixture."*

`gasInit()` built every state's opening composition from `gasSpeciesList()`, which reads `config.gas.species` and **nothing per-state**. `applyState` → `rebuildScene` → `gasInit` runs on every state entry, so **every state opened from the identical composition.**

Consequence if unaddressed: every guided state plays *the same movie*, differing only in which HUD is lit — a Rule-31 distinct-motion failure across five states, and the concept's strongest evidence deleted.

**→ RESOLVED: ENGINE DELTA A shipped on master (see appendix).** A state may now author `species_counts`. Additive, state-gated, no physics touched; `kinetic_particle_theory` re-verified at 44/44 with 0.00% baseline diff.

**Also confirmed, and binding on authoring:**
- `reaction.inject` is read from **config level only**, never per state. One injected species for the whole concept.
- `reaction.enabled` likewise config-level — the reaction runs in **every** state.
- `Ea_rev` is **derived** (`Ea_fwd + E_bond`). Raising `activation_fwd_kT` to suppress the forward direction **also suppresses the reverse.** There is no "forward off" knob. `reverse_attempt_per_s: 0` **does** cleanly switch the reverse off — that asymmetry shapes S1/S2 below.
- Default is **isothermal**. `adiabatic` must be **absent in every state of this concept** — an adiabatic state would let the exothermic forward heat the box, moving the equilibrium position, which would break S5's "same plateau from both sides" claim.
- `caption` and `formula_overlay` are **static text**. No live expression binding. All live numbers must come from canvas HUDs.
- **The on-canvas reaction vocabulary is hardcoded in the renderer** and cannot be authored: `fwd` / `rev` bar labels, `N.N/s` rate values, `"<n> made · <n> broken"`, and the graph's `count` / `time →` axis labels. Narration must use those exact words. Changing any of them is an engine delta — do not author around them.
- Species `label` renders in a ~46 px column — keep labels ≤ 4 characters.
- Product mass/radius are **force-corrected** at init to `m_A+m_B` and `√(r_A²+r_B²)`. Author them right anyway; the correction is a safety net, not a licence.
- **Player freeze (Rule 37):** `onTimelineEnd()` pinned the clock for every state whose `advance_mode` is not `interaction_complete`, and `timelineTotal` is the sum of sentence durations (`duration` is ignored when sentences exist). So a guided state stopped moving ~when its narration ended. **For this concept that frozen frame is literally the misconception.** → **RESOLVED: ENGINE DELTA C shipped on master** — a state may declare `continuous_motion: true` and is exempted from the freeze.

**Engine bug queue (Gate 8):** run by the orchestrator — see the appendix section appended after this skeleton was written. The two scars already known from `docs/patterns/chemistry.md` are designed around here: (1) **single-letter slider ids are a shared namespace** — this concept reuses only the existing `T` / `V` / `N` and invents **no** new single-letter id; (2) **a `[LIVE]` tier label is a claim** — §0 above is that verification, done against code.

---

## §1 Tier and the whiteboard test (Session C5 §1 — LOCKED gate)

**Tier: 💎 diamond.** A good teacher with a whiteboard and 60 seconds **cannot** produce this understanding, and the reason is structural rather than a matter of skill: **a still diagram cannot distinguish "nothing is changing" from "nothing is happening."** Those two statements have the same picture. The entire misconception lives in that collision, and only a running simulation separates them.

Capabilities needed (C5 §2 — a concept earns a build if it needs one; this needs three):

- **1. Show the invisible at scale** — ninety particles, two opposing processes firing continuously, with both event rates counted. A teacher draws four molecules and an arrow both ways, and then must assert the rest.
- **2. Run "what if" with guaranteed-correct physics** — the equilibrium position here is **measured, never scripted**: forward is a real bimolecular collision clearing a barrier, reverse is a real first-order Arrhenius decay, and where they meet is an outcome of the sweep. Start the box from pure product and it lands on the same plateau because the physics says so, not because a keyframe says so.
- **4. Make a counterintuitive result believable** — *"the reaction is still running at full speed while the amounts sit perfectly still"* is rejected by every student's intuition. The only thing that changes the belief is watching the "made · broken" counters climb past a flat line.

It does **not** need capability 3 (3D structure) — correctly a 2D build.

**The single frame that justifies the whole build:** the composition graph dead flat, while both rate bars are lit at the same length and the cumulative totals keep ticking upward. That frame cannot be drawn.

---

## §2 Atomic claim

This concept teaches ONE idea: **in a closed system a reversible reaction reaches a state where the forward and reverse reactions are still running, at equal rates, so the amounts stop changing — and that state is a definite position reached from either direction, not a state of rest and not a state of equal amounts.**

It does **NOT** cover: which way the equilibrium moves when you disturb it (deferred to `le_chateliers_principle` — the next build, deliberately withheld here, including in the explore state's narration); the equilibrium constant's *value, units, calculation or K vs Q* (deferred to `equilibrium_constant` — S6 derives that a fixed ratio must exist and stops there); reaction rates as a topic in their own right (deferred to `rate_of_reaction`); activation energy and collision theory as a topic (deferred to `collision_theory_activation_energy` — assumed at one-sentence depth in S1); ionic/phase equilibria and K_sp (Ch.6 later sections).

---

## §3 State count + arc — 7 states (justified)

The CLAUDE.md §5 calibration puts a medium-complex concept at 5–9. This lands at **7**, and the count is driven by the physics, not the table:

1. The definition is **two-sided** — the forward process and the reverse process each need their own beat with their own motion (S1, S2). Merging them puts two motions and >55 words in one state.
2. The concept carries **twin misconceptions**, both real: *"the reaction has stopped"* (S3) and *"the amounts must be equal"* (S4). Each needs its own contrast beat with its own numbers.
3. The **defining property** — that equilibrium is a position independent of the direction of approach — is a separate claim requiring a separate run from the opposite side (S5). Without it the concept is a description; with it, it is a definition.
4. Rule 38a requires the **derivation tier** (S6: why the two rates *must* meet), contiguous and immediately before explore.
5. Rule 31 requires the **explore state** (S7).

Nothing here is scaffolding. Deleting S5 costs the definition, S4 costs a named misconception, S1 or S2 costs one half of "dynamic".

| State | Purpose (one line) | `depth_ring` |
|---|---|---|
| S1 | The forward reaction: A and B that meet hard enough stick together, and the forward rate falls as they get used up. | core |
| S2 | The reverse reaction: the product breaks apart again — the arrow genuinely points both ways. | core |
| S3 | **PRIMARY AHA + misconception M1:** the two rates meet, the composition line goes flat — and both counters keep climbing. | core |
| S4 | **Misconception M2:** equal *rates*, not equal *amounts* — a lopsided start settles just as firmly at lopsided numbers. | core |
| S5 | Equilibrium is a *position*: start from pure product and the same atoms land on the same plateau. | extended |
| S6 | **Derivation:** the forward rate falls, the reverse rate rises — they must cross, and at the crossing the ratio is fixed. | advanced |
| S7 | Explore sandbox: disturb it however you like; the rates always come back together. | core-content sandbox |

Rings: core S1–S4 → extended S5 → advanced S6 (contiguous, immediately before explore) → explore S7. Ordering is qualitative (S1–S3) → quantitative (S4–S5) → derivation (S6). ✔ Rule 38a.

---

## §4 Per-state choreography + control table (Rule 31 — the REQUIRED artifact)

**Archetype declaration.** The whole concept is archetype **M — particulate box**; per the `law_of_conservation_of_mass` precedent, distinctness is declared at the **beat** level (names below seed `patterns/chemistry.md` §3). Every beat is a genuinely different picture-in-motion, and the two repeats are **declared contrast pairs** whose delta names the flip.

**Apparatus home pose (Rule 32d).** One box, full canvas, constant geometry in all seven states (the piston stays parked at 1.0 in S1–S6). Reaction readout top-right; concentration graph bottom-left inset; formula surface DOM overlay; delta-cue caption top. The apparatus never teleports — **the only thing that changes between states is the opening composition and which instrument is lit.**

| # | Teaches (ONE idea) | Beat (archetype M) | DISTINCT motion (cause → effect, Rule 32a) | Delta cue (≤5 words) | Live controls | Narration | Ring | `advance_mode` |
|---|---|---|---|---|---|---|---|---|
| **S1** | The forward reaction: a hard enough A–B collision makes AB, and the forward rate falls as A and B run out | `collide-and-stick` *(declared pair with S2)* | Opens pure A + B. CAUSE: two coloured discs meet, flash, and **become one violet disc** that visibly spins away. EFFECT, a beat later: the violet population grows and the **green fwd bar shortens** as reactants thin out. Reverse is switched off for this beat (`reverse_attempt_per_s: 0`) so only the taught process moves — Rule 32b | "A and B stick together" | none | 30–45 w | core | `manual_click` |
| **S2** | The reverse reaction: AB breaks back into A and B — the arrow points both ways | `break-apart` *(declared pair of S1 — same reaction, mirrored: which direction is running)* | Opens **pure AB** (`species_counts`). CAUSE: violet discs split into a blue and a yellow disc flying apart. EFFECT: the **orange rev bar is full while the green fwd bar sits at zero** — it cannot do otherwise, there is no A or B yet — then creeps up as fragments accumulate. Real physics, no override | "AB breaks back apart" | none | 30–45 w | core | `manual_click` |
| **S3** | **PRIMARY AHA:** the rates become equal, so the amounts stop changing — while both reactions keep running | `rates-converge` *(declared pair with S5)* | Opens pure A + B, full reaction. The two bars **close on each other** while the three curves bend and flatten. Once flat, the ONLY things still moving are the particles and the **"made · broken" totals, both climbing**. Concentration graph lit here for the first time. `continuous_motion: true` | "Flat line, both still running" | none | 45–55 w | core | `manual_click` |
| **S4** | Equal rates does not mean equal amounts | `replateau-lopsided` | Opens **A 60 · B 30 · AB 0** (`species_counts`) — same 90 atoms, deliberately lopsided. B is consumed almost to nothing; the plateau lands at wildly unequal counts, and the two rate bars still end **identical**. The readout's three numbers are the payload | "Equal rates, unequal amounts" | none | 35–50 w | core | `manual_click` |
| **S5** | Equilibrium is a definite position, reached from either direction | `converge-from-above` *(declared pair of S3 — the flip is the direction of approach; the destination is identical)* | Opens **pure AB, 45 dimers** (`species_counts`) = exactly S3's atom inventory. The AB curve **falls** to the same level S3's rose to; A and B rise to meet it. Same plateau, opposite motion, same temperature. `continuous_motion: true` | "Same end, opposite start" | none | 40–55 w | extended | `manual_click` |
| **S6** | **Why** the rates must meet: forward ∝ [A][B] falls, reverse ∝ [AB] rises, so they cross — and at the crossing the ratio is fixed | `seed-at-balance` | Opens **at the measured equilibrium composition** (`species_counts`). Nothing drifts from the very first second — flat from t = 0 — while both counters climb from zero. The only thing that *builds* on screen is the derivation on the formula surface, line by line. `continuous_motion: true` | "Start balanced: nothing drifts" | none | 45–55 w | advanced | `manual_click` |
| **S7** | Sandbox: disturb it and the rates always come back together | `drag-sandbox` *(explore only)* | Opens the config default (pure A + B), runs **continuously** (Rule 37). Slider drags feed live: heating changes how fast both directions run, the piston crowds the box, the N tap adds reagent — and after every disturbance the bars re-converge and the line re-flattens | "All yours — disturb it" | **ALL: T · V · N** | 0 / open | core-content only (38b) | `interaction_complete` |

**Gate 12:** `manual_click` + `interaction_complete` = 2 distinct advance modes ✔. No `wait_for_answer`, no predict-pause ✔.
**Rule 19:** every state ≥ 3 primitives ✔.
**Rule 32e single focal:** S1 the forming dimer · S2 the splitting dimer · S3 the two rate bars · S4 the three counts in the readout · S5 the falling AB curve · S6 the active derivation line · S7 rotating with the teacher's drag.
**Rule 32b:** in S1 the reverse is switched off so only the taught process moves; in S2–S6 the taught variable *is* the composition, and the piston/thermostat hold constant in all of them.

**Representation triangle:** S1–S5 **particulate-led**, with the symbolic `A + B ⇌ AB` entering as a label on action already seen; S6 **symbolic-led** — legal because it is advanced-ring, not core; S7 particulate with live instruments.

**Two authoring constraints that carry the concept's honesty:**
1. **S1's reverse-off is an isolation, not a claim.** chemistry_author narrates it as "look at the forward direction first," never as "the reaction only goes forward." S2 then supplies the other half. There is deliberately no mirrored trick in S2 — the engine cannot switch the forward direction off (Ea_rev is derived), and S2 does not need it, because with no A or B present the forward rate is zero on its own. That asymmetry is honest and is declared here so no one authors a fake symmetry.
2. **S7 narrates re-establishment, never direction.** "Whatever you change, the two rates come back together and the line goes flat again" is *this* concept's claim. *Which way* it shifts is `le_chateliers_principle` — Rule 25 (no untaught term).

---

## §5 Misconception confrontation plan (Rule 16a — 3 genuine pivots)

Belief source: NCERT Exemplar-class common wrong beliefs (belief only; no problem text imported). No EPIC-C branches (EPIC-L-first directive).

| # | Wrong belief | At | `misconception_watch` beat |
|---|---|---|---|
| **M1** | "At equilibrium the reaction has stopped." | **S3** | *belief:* once the amounts stop changing, nothing is happening any more · *visual_counter:* the composition line is dead flat while both rate bars stay lit at equal length and the "made · broken" totals keep climbing, second after second · *one_line_fix:* "Nothing is changing because two things are happening at the same rate — not because nothing is happening." |
| **M2** | "At equilibrium the amounts of reactants and products must be equal." | **S4** | *belief:* balance means a 50:50 split · *visual_counter:* the rates are identical while the counts are nothing like it — B nearly gone, A abundant, AB in between · *one_line_fix:* "Equal rates, not equal amounts." |
| **M3** | "The equilibrium depends on where you start — you have to begin with reactants." | **S5** | *belief:* start from the product and you get a different answer, or nothing at all · *visual_counter:* the same atoms, started as pure product, fall to exactly the plateau the reactant run climbed to · *one_line_fix:* "Same temperature, same balance — from either side." |

S1, S2, S6 and S7 carry **NO** `misconception_watch` — straightforward teaching (founder guardrail 2026-07-04).

---

## §6 `has_prebuilt_deep_dive` states

- **S3** — the misconception epicentre. Every "but if it's still reacting, why doesn't it finish?" lands here.
- **S4** — where students who accepted "still running" then trip on the numbers.

(S5 considered and rejected: it is the *resolution*. S6 rejected: advanced-ring, hidden under two of three presets.) These are the same two states carrying the Pass-1 cliff sentences. The chemistry serving path does not exist yet, so the flag is authored data only.

---

## §7 Drill-down clusters

**S3:** `does_the_reaction_actually_stop` · `why_doesnt_it_go_to_completion` · `what_keeps_the_amounts_constant`.
**S4:** `must_products_equal_reactants` · `reading_equilibrium_amounts` · `equal_rates_vs_equal_concentrations`.

---

## §8 `entry_state_map` (v2.2)

```
entry_state_map:
  foundational:    STATE_1 → STATE_4   # contains PRIMARY aha (S3) ✔
  both_directions: STATE_5
  why_it_balances: STATE_6
  exploration:     STATE_7
```

Foundational-coverage rule satisfied: the PRIMARY aha (S3) sits inside the `foundational` range.

---

## §9 Prerequisites (advisory, Rule 23)

- `kinetic_particle_theory` — **shipped, baseline-locked**, same renderer and same box. Supplies particles in constant random motion and elastic collisions. The strongest possible prerequisite: the student has already watched this exact apparatus.
- `collision_theory_activation_energy` — **not built** (P1 #4). Supplies "not every collision reacts; it must be hard enough." Advisory; patched inline in S1.
- `rate_of_reaction` — **not built** (P1 #3). Supplies "rate depends on how much is there." Advisory; the sim shows it directly on the bars.

---

## §10 Real-world anchor (Rule 35 / 38f — universal)

**Primary: an unopened bottle of fizzy drink.** It looks completely still and stays that way on a shelf for months — yet carbon dioxide molecules are leaving the liquid into the space above and dissolving back in again, continuously, at the same rate. Nothing changes because both things are happening equally. Universal (no brand, no place, no currency, no festival), physically true at every depth, and the cheapest way to make "still on the outside, busy on the inside" feel obvious before a single particle moves on screen.

**Secondary: a sealed bottle half-full of water.** The level stops changing while evaporation and condensation both continue.

**Honesty note carried into narration:** both anchors are **phase** equilibria while the sim shows a **chemical** one. This is standard teaching practice and is why the anchors work — but the mapping is stated once, explicitly, at S1 ("the same idea, now with a reaction instead of a gas dissolving"), rather than letting the student silently assume the sim is showing soda.

**38f:** a sealed carbonated drink is the widest-syllabus-overlap anchor available — CBSE, IGCSE, IB, AP and A-level all use a closed-vessel equilibrium; none requires India-lab apparatus.

---

## §11 Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the 7 states of §3, exactly as tabled in §4.

**(b) Symbol-label table.** Most of this canvas's vocabulary is **fixed by the renderer** (§0):

| Narrated quantity | On-canvas label | Source |
|---|---|---|
| reactant 1 / reactant 2 / product | `A` · `B` · `AB` (species `label`, ≤4 chars) | authored |
| the reaction | `A + B ⇌ AB` (⇌ = U+21CC, math-serif Unicode) | authored `formula_overlay` |
| forward / reverse rate | `fwd` · `rev` + bars + `N.N/s` | **engine-fixed** |
| cumulative events | `<n> made · <n> broken` | **engine-fixed** |
| composition axes | `count` (y) · `time →` (x) | **engine-fixed** |
| live populations | `A 34   B 34   AB 11` | **engine-fixed** |
| rate laws (S6 only) | `rate_f = k_f[A][B]` · `rate_r = k_r[AB]` · `[AB]/([A][B]) = k_f/k_r` | authored `formula_overlay` |

**Rule-25 bridge required of chemistry_author:** the graph's y axis reads `count`, not concentration. At the fixed volume of S1–S6, count is proportional to concentration, and narration must say so **once** (S3) before any square-bracket notation appears in S6. In S7 the volume slider breaks that proportionality — S7 narration must not lean on the graph's height as "concentration".

**(c) Balanced-equation ledger plan.** The displayed equation is `A + B ⇌ AB` in S1–S5 and S7, generic by deliberate choice: the engine's reaction is strictly 1 + 1 ⇌ 1, and every board teaches dynamic equilibrium on a generic reversible reaction first. **Rejected alternative, recorded so it is not re-litigated:** the one common real gas-phase 1:1:1 equilibrium is `CO + Cl₂ ⇌ COCl₂`, obscure and toxic and buying nothing pedagogically; `2NO₂ ⇌ N₂O₄` and `H₂ + I₂ ⇌ 2HI` do **not** fit the engine's stoichiometry and must never be labelled onto it. No coefficients appear anywhere (all are 1). No state symbols on the species labels (column width); the gaseous nature is narrated. No oxidation numbers — not a redox concept. **Every particle on screen is one particle** — no Avogadro scale-factor label is needed or permitted, since the counters count discs.

**(d) Motion plan:** exactly the §4 motion column. No state is static; every state's motion is continuous and self-renewing (particles never stop moving even at the plateau — that *is* the lesson). Nothing is a scripted keyframe: every reaction event on screen is an outcome of the collision sweep.

**(e) Modes:** `epic_l_path` only (Rule 20 [D] — no `mode_overrides`). Panel A `particle_field` / `gas_box`; panel B same.

**(f) Assessment + coverage_map + misconception_watch:** `misconception_watch` exactly the three entries of §5. `assessment` — **deliberately absent this phase**, matching `kinetic_particle_theory` (Gates 19/20 dormant; no students yet).

**(g) Macro↔micro plan (Rule 33).** The taught variable is microscopic (two event rates) and its observable is macroscopic (a composition that stops changing) — **both are on this single canvas simultaneously**, which is what satisfies Rule 33 here; no `macro_view` split band is used. Each state's interior tells its own story with a real number:

| State | Micro story (its OWN) | Macro observable | Real number | Instrument (Rule 33d) |
|---|---|---|---|---|
| S1 | hard collisions fuse pairs into spinning dimers | product accumulating | `fwd` rate falling, `n made` climbing | rate readout |
| S2 | dimers tear apart, fragments fly | product disappearing | `rev` rate high, `fwd` = 0.0/s | rate readout |
| S3 | both events firing everywhere at once | the line goes flat | two rates converge to the same `N.N/s`; totals keep climbing | rate readout + concentration graph |
| S4 | B is scarce, so an A must wait to find one | a lopsided plateau | e.g. `A 35 · B 5 · AB 25` with identical rate bars | rate readout + graph |
| S5 | splitting dominates until fragments are plentiful | the curve falls to the same level | plateau counts within noise of S3's | rate readout + graph |
| S6 | events fire from the first second with zero net change | flat from t = 0 | both totals climbing off a flat line | rate readout + graph + derivation surface |
| S7 | everything live | re-flattening after each disturbance | all of the above, live | all instruments + sliders |

**(h) Canvas budget (Rule 34):** per state ONE formula surface (`A + B ⇌ AB` in S1–S5 and S7; the rate-law derivation **replaces** it in S6 — never both); on-canvas caption = the ≤5-word delta cue only, prose narration in `#capStrip`; HUDs are value-only; all math real Unicode (⇌ ∝ · → ₂ ≠). Zones, verified non-colliding: rate readout top-right (clears the Full-screen button), concentration graph bottom-left inset, collision counter bottom-right, formula overlay DOM, sliders bottom-right panel (S7 only). `show_energy_ledger` stays **off** in every shipped state — it is a bring-up instrument.

**(i) Curriculum-flex block (Rule 38):**
- **Cut 1 (hide advanced → drop S6):** S1–S5 + S7 coherent. No surviving state uses `k_f`, `k_r`, square-bracket notation, "rate law" or "equilibrium constant". **Binding constraint on chemistry_author: those six terms appear in S6 and nowhere else, including S7.** ✔
- **Cut 2 (hide advanced + extended → drop S5, S6):** S1–S4 + S7 coherent, ending on the two misconception kills plus the sandbox. **Binding constraint: no state other than S5 may say "from either direction", "same equilibrium from both sides", or reference starting from pure product** — S7's invitation is phrased as "disturb it", never "start it from the other end". ✔
- **Explore = CORE only (38b):** S7 lights the rate readout, the concentration graph and the collision counter, shows `A + B ⇌ AB`, and carries **no** derivation surface and **no** ratio. ✔
- **Notation ladder (38c):** core/extended surfaces are the arrow equation and plain counts; proportionality and square brackets are confined to advanced S6. ✔
- **Dialect (38d):** dual-label once then bare — "the forward reaction (fwd)" then `fwd`; "reversible reaction (it goes both ways)" then bare; "closed container (a sealed system)" then "closed". Use "amount" in core states and "concentration" only after the count↔concentration bridge in S3.
- **Graph axes (38e):** engine-fixed — `count` (y) against `time →` (x), left-to-right, universal across all five boards. No board conflict exists, so **no axis-swap toggle is authored**; recorded as a decided non-issue.
- **`curriculum_tags` (38g — CLAIMS):** CBSE/NCERT Class 11 Ch.6 §6.2 → **author-verified** (Unit 6 Equilibrium is retained in full in the rationalised syllabus; the deleted Class 11 units are States of Matter, Hydrogen, s-block, p-block, Environmental Chemistry). Cambridge IGCSE (Reversible reactions and equilibrium), IB DP (Reactivity 2.3), AP Chemistry (Unit 7 — Equilibrium), A-level (Equilibria) → every cell `verified: false`, `needs_teacher_verification: true`.
- **Presets (38h — hide, never reorder):** `full` = S1–S7 · `standard` = hide S6 · `intro` = hide S5 + S6.

**(j) Config values the authors must MEASURE, not guess.**

| Quantity | Target | Why it is a target and not a guess |
|---|---|---|
| `gas.species` | `A` mass 1 r 5 `#60A5FA` · `B` mass 1 r 5 `#FBBF24` · `AB` mass 2 r 7.07 `#C084FC` | AB must be visually unmistakable and must avoid the green/orange the rate bars own |
| `gas.count` / config counts | A 45 · B 45 · AB 0 (90 discs) | matches kinetic's readable density; gives S5 an exact 45/45 atom inventory to mirror |
| `activation_fwd_kT` | tune ≈ 1.0–2.0 | must let the plateau arrive **inside the state's narration timeline** (~12–18 s), or the aha is never seen |
| `bond_energy_kT` | tune ≈ 1.5–2.5 (exothermic) | sets how far the equilibrium sits toward product |
| `reverse_attempt_per_s` | tune ≈ 2–6 | with the two above, must land the plateau at a **clearly unequal, clearly non-zero** composition — roughly `A ≈ 25 · B ≈ 25 · AB ≈ 20`. A plateau near 50:50 would hand M2 back to the student |
| S4 opening | A 60 · B 30 · AB 0 | must produce a *visibly* lopsided plateau (B nearly exhausted) with the rate bars still equal |
| S6 opening | the **measured** S3 plateau | copied from an actual S3 run, not predicted; if it is wrong the curve drifts and the state's whole claim collapses |
| S2 window | reverse visibly dominant for the first ~10 s from pure AB | verify by watching, since there is no forward-off knob |
| S3 ≡ S5 | plateau counts agree within sampling noise | **the concept's central claim — measure both runs and record the numbers in the JSON's authoring notes** |

`adiabatic` absent everywhere. `speed_scale` ≈ 0.105 (clone kinetic). `ea_ref_T` = `temperature_K` = 300. Sliders reuse `T` / `V` / `N` only — **no new single-letter id**.

**(j-bis) MEASURED on the engine before authoring — three numbers the author must not re-derive:**

1. **`adiabatic` is not merely unnecessary here, it is destructive.** Measured with the thermostat off at a 500 K start: the exothermic forward self-heated the box to **650 K**, and the same box started from pure product **cooled to 150 K and the reaction froze solid** (both rates 0.00/s). Every state of this concept must omit `adiabatic`. This is why the S5 claim would collapse without it.
2. **The central claim is verified on the engine, not asserted:** with matched atom inventories and the thermostat on, mean product from pure reactants **20.5** vs from pure product **20.8** — the same equilibrium from either side to within 1.5%. Locked as a permanent check (`npm run check:gas-reaction`, "same equilibrium from either side"), so a future engine edit that breaks S5 fails a gate instead of a lesson.
3. **The plateau VISIBLY FLUCTUATES, and the author must not narrate it away.** At 120 particles the product count wanders roughly ±6 around ~20 — a ±30% wiggle on the "flat" line. That is real equilibrium noise (small-N statistics), not a defect, but it undercuts S3's "the line goes flat" if it reads as drift. **Recommendation: raise the particle count for S3–S6 toward 160–200** and re-measure; fluctuation falls as √N while the plateau stays put. Narration should say the amounts "stop changing" / "hold steady", never "are perfectly constant" — the screen would contradict the word.

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliff.** *`kinetic_particle_theory` (shipped)* — a student without it breaks at **S1**, because "these discs are gas particles in constant random motion" would be a new claim rather than a recall. Patch: S1's opening clause names it in passing. *`collision_theory_activation_energy` (NOT built)* — the real cliff, also at **S1**: the student must accept that *only* collisions above an energy threshold react, or the flashes look arbitrary and S7's temperature behaviour is inexplicable. Patch: one non-condescending sentence in S1 — "Not every meeting does anything; the two have to hit hard enough to stick" — delivered as an observation about what is on screen, not a lecture. That sentence is also why S1 is worth its own state.

**JEE-backwards trace.** *"For the reversible reaction A(g) + B(g) ⇌ AB(g) in a closed vessel at constant temperature, which statements are true at equilibrium? (i) both reactions have stopped; (ii) the rates are equal; (iii) the concentrations are equal; (iv) the same equilibrium state would be reached starting from pure AB."* Knowledge pieces → states: reversibility → **S1 + S2**; equilibrium defined by equal *rates*, reactions continuing → **S3** (answers (i) and (ii)); equal rates ≠ equal concentrations → **S4** (answers (iii)); independence of the direction of approach → **S5** (answers (iv)); why the rates converge and that a fixed ratio follows → **S6**. Numerical K_c evaluation is deliberately **outside** the atomic claim.

**Misconception entry mapping.** **M1 is planted by S1 and S2 on purpose** — each shows one direction running alone, exactly the mental model that must be broken, and S3 breaks it one click later. **M2 is at risk of being planted by S3**, whose symmetric 45/45 start could settle near a coincidentally balanced-looking composition — which is why (j) requires the tuned plateau to be *visibly* unequal, and why S4 immediately follows. **A third belief, "equilibrium means the reaction went halfway"**, could be planted by S3's flat line if narrated as "it stops halfway": chemistry_author must never use the words "halfway", "half", or "partly finished". **M3 is not planted by anything in S1–S4**; it is a belief students arrive with, and S5 confronts it directly. **16b fallback branches: none.**

---

## Block 2 — Aha-moment designation

- **PRIMARY aha:** *The line is flat and the reaction is still going — both directions are running full speed, at exactly the same rate, and that is the only reason nothing appears to change.* At **S3**, inside `entry_state_map.foundational` ✔.
- **SUPPORTING aha:** at **S5** — *the same balance is reached starting from the product; equilibrium is a place the system goes to, not a place it happens to stop.* It turns "the rates happened to meet" into "this state is an attractor", and it is the exact fact `le_chateliers_principle` will stress next.
- **Cohesion check:** S4 (unequal amounts) is a *consequence* of the primary, not a third aha. Two ahas total ✔.
- **Wrong-belief setup:** the primary aha is earned across **S1 and S2** — two full states in which the student watches one direction dominate, building the reasonable belief that a reaction runs until it is done. The supporting aha is set up by **S3 and S4**, both starting from reactants, quietly building the assumption that reactants are where an equilibrium begins; **S5** removes it.
- **Deep-dive cross-reference:** the two `has_prebuilt_deep_dive` states (S3, S4) are exactly the Pass-1 confusion states ✔.

---

## Registration + validation (json_author: read verbatim)

- **Site #1 ONLY:** `src/data/concepts/chemistry/dynamic_equilibrium.json`.
- **FORBIDDEN (Gate 8b is all-or-nothing; the chemistry serving path does not exist yet):** no rows or edits in `concept_panel_config`, `CONCEPT_RENDERER_MAP`, `VALID_CONCEPT_IDS`, `PCPL_CONCEPTS`, `CLASSIFIER_PROMPT`.
- **Validation:** `npm run validate:chemistry` — **never** `npm run validate:concepts`.
- **After any touch to the gas path:** `npm run check:gas-reaction` (13 headless conservation checks) **and** `npm run check:renderer-syntax`.
- **THE EYE:** requires a chemistry cache-seed in `simulation_cache` before `visual:eyes`.
- **Engine work is PLATFORM (Rule 40):** DELTAS A and C landed on **master, separately**, before this concept's JSON is authored.
- **Languages:** author `text_en` now; `text_hi` via the Rule-30g Sonnet-5 sub-agent (text-only, Rule 30i); audio on demand only (30h).

## Architect self-review (chemistry form)

*"Consulted NCERT Chemistry chapter index to confirm scope (Class 11, Ch.6 'Equilibrium', §6.2). No teaching method, no example problem, no figure imported."* NCERT Exemplar consulted for misconception beliefs only (M1–M3). Renderer capability verified against `particle_field_renderer.ts` source at every read site before any state was designed (§0), per the `archetype_live_tier_unverified_against_renderer` scar.

---

# APPENDIX — Engine deltas

## DELTA A — per-state opening composition — **SHIPPED on master**

**Contract.** A state may author `species_counts`, an object keyed by species `id`, overriding the config-level per-species `count` for that state's `gasInit()` placement only:

```json
"STATE_5": { "caption": "Same end, opposite start", "species_counts": { "A": 0, "B": 0, "AB": 45 } }
```

Additive, state-gated, touches no physics and no integrator. `kinetic_particle_theory` authors no `species_counts`, so its seeded `pr()` draw order is byte-identical — verified rather than assumed by re-running THE EYE (44/44, 0.00% diff) plus `check:gas-reaction` (13/13).

**Used by:** S2, S4, S5, S6 — four of seven states.

## DELTA B — live equilibrium-ratio HUD — **DECLINED (deliberate)**

A `show_equilibrium_ratio` flag printing `[AB]/([A]·[B])` live. Declined because the quantity it prints is `equilibrium_constant`'s subject, not this concept's, and shipping it here invites S6 to drift into K-versus-Q territory Rule 25 puts out of scope. Build it *with* `equilibrium_constant`, where it is the payload rather than a garnish. **S6 works as designed without it.**

## GATE 8 — `engine_bug_queue` consultation (RUN by the orchestrator, 2026-07-28)

Queried for rows touching `kinetic_particle_theory`, the gas path, `particle_field` and slider handling. 37 rows returned; the ones that BIND this build:

| Row | Status | What it binds here |
|---|---|---|
| `gas_box_state4_asserts_unchanged_speed_with_no_instrument` (owner **alex:chemistry_author**) | FIXED | *"A state that asserts a quantity is UNCHANGED must show the instrument that proves it. Under Rule 24 the sim reads with sound off, so a claim carried only by narration is not carried at all."* **This is the single most binding row for this concept**, because S3 makes TWO unchanged-claims at once: the amounts have stopped changing (proved by the concentration graph) and the reaction has not stopped (proved by the rate bars + the climbing made/broken totals). Both instruments must be lit in S3, S4, S5 and S6. A state that narrates either claim without its instrument fails this row. |
| `pf_readout_ohms_branch_keys_on_bare_slider_name` | FIXED | Single-letter slider ids are a shared namespace. This concept adds **no** new single-letter id (reuses `T`/`V`/`N`) ✔ |
| `gas_box_state_param_falls_through_to_stale_slider_dom` + `gas_box_slider_default_overrode_authored_state_value` | FIXED | A per-state parameter must resolve teacher-drag → this state's authored value → a STABLE declared default, never live control state. `species_counts` (DELTA A) follows exactly this order and never reads `userParams` ✔ Probe every state that omits a parameter **after** visiting a state that sets it. |
| `gas_box_freeze_resim_uses_wrong_stepper` | FIXED | *"a green deterministic gate proves frames are REPRODUCIBLE, not correct."* Honoured: the reaction layer's physics was verified by measurement (`check:gas-reaction`) before any frame was trusted. |
| `renderer_backtick_in_comment_terminates_template_literal` | FIXED | Recurred during THIS build — a backtick in a new comment broke the template body; caught by `check:renderer-syntax` (Rule 36c). Standing guard confirmed effective. |
| `verification_via_applystate_bypasses_player_false_hang` | FIXED | Verify by driving the review player's rail + Play, never `applyState()` inside the iframe; install error listeners INSIDE the sim frame. Binding on quality_auditor's live walk. |
| `chemistry_cache_seeder_missing_particle_field_family` | FIXED | THE EYE needs a chemistry cache-seed; the seeder now covers `particle_field` ✔ |
| `field3d_particle_field_vestigial_dual_panel_config_gap` | OPEN | **N/A for chemistry** — chemistry ids are forbidden from `concept_panel_config` until the chemistry serving path exists (Gate 8b all-or-nothing). Do not "fix" it here. |
| `gas_box_compressed_state_empty_pane_no_affordance` | OPEN | Layout: canvas space reserved for a later state must read as deliberately reserved. Relevant only if a state hides the concentration graph that a later state shows. |

No returned row's `prevention_rule` is violated by this skeleton.

## DELTA C — per-state exemption from the end-of-timeline freeze — **SHIPPED on master**

`onTimelineEnd()` pinned the clock for every non-`interaction_complete` state, so S3 stopped dead a moment after the narration that says it never stops — the frozen frame *was* the misconception. A state may now declare `continuous_motion: true` and the player skips the freeze, exactly as it already does for `interaction_complete`. Shared-player change → Rule 40, landed on master separately. THE EYE's `SET_TIME_FREEZE` capture path is separate, so no baseline moves (Rule 37b). Used by S3, S5, S6.
