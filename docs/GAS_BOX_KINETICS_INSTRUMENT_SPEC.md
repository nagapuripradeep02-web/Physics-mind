# gas_box kinetics instrument — MERGED ENGINE SPEC (one document, one owner)

> **Owner:** `peter_parker:renderer_primitives` (pcpl-surgeon). **File:** `src/lib/renderers/particle_field_renderer.ts` ONLY.
> **Authored by:** the dispatching session, 2026-08-07, merging the behavioural requirements of
> `docs/rate_of_reaction_skeleton.md` §10-A and `docs/rate_law_and_order_skeleton.md` §INSTRUMENT REQUIREMENTS.
> **Why this document exists:** founder_proxy Checkpoint A finding **P-1 (blocking)** — the two skeletons each
> wrote an independent engine ask while both claiming "one shared panel, two modes". Diffed field by field they
> disagreed on placement, both axes, sampling, fit, flag names and widget keys: two instruments wearing one name.
> Scar row filed: `sibling_skeletons_specify_one_shared_engine_mechanism_in_two_incompatible_documents`.
> **This spec is now the single source of truth.** Neither skeleton's flag names are binding; this document's are.
> **Rule 40:** this is PLATFORM work — it lands on master separately and BEFORE json_author runs on either concept.

---

## 0. Verified starting facts (re-read before coding; do not trust prose over the call graph)

| Fact | Evidence |
|---|---|
| There is **no right-hand pane**. The gas box always owns the full canvas. | `:3517-3524` — *"The box always owns the full canvas. It used to shrink to 58% whenever `layout:'with_graph'` was set… That read as broken rather than reserved. The histogram now draws as an instrument panel OVER the tank instead of beside it."* `gasBoxRFull()` at `:3524`. |
| `gasHasGraphPane()` is **dead code** — declared, never called. | `:3500`; exactly one occurrence of the identifier in the file. |
| The type comment promising a reserved pane is **stale**. | `:6906` — *"'with_graph' reserves the right pane for the speed histogram"*. |
| Every plot on this canvas is an **inset over the box**. | `drawGasArrhenius` `:5376-5462`; `drawGasConcGraph` `:5062-5121`. |
| The existing concentration graph **cannot** host a slope: x is the trace-buffer index (260 rolling samples), y autoscales to the live peak. | `:5083-5085` (*"The x axis is the TRACE BUFFER, not wall-clock"*), `:5074-5078` (peak autoscale). |
| Sampling is already sim-time gated (Rule 36 safe, freeze-reproducible). | `gasSampleComposition` `:4629` gates on `frame`, derived from `PM_simTimeMs` at `:4628`; fixed 1/60 s step at `:1146`. |
| Rule 32e reads `glow_focal`; `focal_primitive_id` reaches nothing. | `curState().glow_focal` at `:420`; 0 occurrences of `focal_primitive_id` in the file. |

**Hard constraint — ADD ONLY.** `drawGasConcGraph`, `show_concentration_graph` and `gasConcTrace` are **not to be
refactored, re-geometried, or hoisted into a shared helper.** Four baseline-locked concepts depend on their exact
pixels: `collision_theory_activation_energy`, `dynamic_equilibrium`, `le_chateliers_principle`,
`kinetic_particle_theory`. Extract the *pattern* from `drawGasArrhenius`; do not extract the *code* from either.

**Also fix in passing (both trivial, both caused this):** correct the stale `:6906` type comment, and either wire
or delete `gasHasGraphPane()`. A defined-but-uncalled accessor is a removed feature with a surviving name — it is
what the architect read and designed a whole concept against.

---

## 1. What is being built

**ONE instrument family — the "kinetics panel" — with two plot MODES and two auxiliary readouts.** Two concepts
consume it; every field is opt-in, so no shipped concept changes by a pixel.

| Piece | Serves | Purpose |
|---|---|---|
| Plot mode **A** — `count_vs_time` | `rate_of_reaction` S2–S7 | species counts against real seconds, fixed axes, with window/tangent tools |
| Plot mode **B** — `rate_vs_quantity` | `rate_law_and_order` S9–S10 | measured event rate against a live count quantity, origin-constrained fit, slope readout |
| ~~Readout **C** — rate-ratio chip~~ | — | **WITHDRAWN — do not build.** Measured wrong: in a closed batch box with no reactant feed the underlying rate always falls, so a ratio against a pinned earlier value reports (disturbance × run-down). Across 5 seeds and 3 poses the "double A" beat read ×0.43–0.66 / ×1.27–1.80 / ×0.75–0.96 against a claimed ×2.0, and the inert null read ×0.29 with the pour vs ×0.32 without under a "same rate" caption. Scar: `batch_box_rate_ratio_pinned_to_an_earlier_value_measures_the_run_down_not_the_disturbance`. Replaced by the initial-rate method (piece F). |
| Readout **D** — counts-only chip | `rate_of_reaction` S1 | species counts with **no** rate bars (the word "rate" must not appear before S3 defines it — Rule 25) |
| Readout **E** — rate-constant chip | `rate_law_and_order` S6 (core), S7 | live **`k = rate ÷ (A × B)`**, value-only. **Do NOT reuse `drawGasKRatio` (`:5043`)** — it computes the *equilibrium* constant K = nAB/(nA·nB), a different quantity: measured over the authored irreversible run-down it climbs 0.0010 → 0.3833 in 20 s (380×) under a caption reading "Rate falls, k holds". |
| Piece **F** — cue-driven re-seed + kept initial-rate chip row | `rate_law_and_order` S2–S5, S8; the teacher's tool in S11 | **DEFINED (REV 3).** The honest form of the doubling experiment — *two fresh runs, initial rates compared*, which is the initial-rate method as chemistry actually performs it. On a narration-synced cue the box **re-seeds** a fresh authored charge (species counts + piston pose per run; **each run's counts sum to that run's own N**); mode A's fitted-slope window measures the INITIAL slope over a declared opening window (~2 s at the home constants, bounded so ≤~10% of reactant is consumed — the slope stays honestly "initial"); run 1's fitted rate **persists across the re-seed** as a chip pinned ×1.00 and run 2 reads as a ratio to it. Series selectable forward / reverse / **net** (net required by S8). A state may also show a **static labelled reference chip** quoting an earlier state's verdict (`fresh box ×2.0`), visually distinct from live chips. Chips clear at state exit. **Marginal ask over mode A: the re-seed hook + chip retention** — smaller than the withdrawn Readout C. |

One panel geometry, one accumulator, one axis solver, one widget-gating discipline. Modes A and B differ only in
what is sampled onto each axis and which overlay tools are legal.

---

## 2. Placement + geometry (the decision both skeletons had to defer)

- The panel is an **inset drawn over the tank**, geometry derived from `drawGasArrhenius` (`:5380`): ~40% of box
  width × ~50% of box height, **opaque backing** (the Arrhenius rationale holds — a mostly-empty plot lets drifting
  discs read as dirt through a translucent panel).
- **One fixed home position per concept, for every state of that concept** (Rule 32d — no side-flipping between
  states; a plot that moves is a new object every click). The position is authorable once at config level, not
  per state. **`kinetics_home` takes an explicit corner and has no `'auto'` value** — an unresolved default is a
  decision handed to the surgeon, which is what this document exists to prevent. **Decided:
  `rate_of_reaction` → `tr`; `rate_law_and_order` → `bl`** (the slot its DoD (h) already reserves).
- **Slider dodge is MEASURED, not assumed** — follow the `#pm-sliders` precedent at `:5396-5404`. Note the standing
  scar `inset_relocation_fix_not_extended_to_a_later_inset`: with a third inset now possible on this canvas,
  *"opposite the other one"* is no longer a position. Resolve against the actual occupied rectangles.
- **Mutual exclusion:** at most ONE inset is lit in a guided state. The kinetics panel, the speed histogram, the
  Arrhenius plot and the legacy concentration graph may not co-occur. **Enforced in the RENDERER** — if two are
  authored, draw the kinetics panel and `console.warn` once naming both flags; do not silently z-order them.
  (A `validate:chemistry` rule would be better placed but this spec scopes the surgeon to the renderer only, and a
  rule with no owner is not a rule — the validator addition is logged as a follow-up, not assumed.)
- Must not overlap: the HUD band (top, clears `top:52px`+), the state chip (bottom-left), the counter
  (bottom-right), or the species-count chips.
- The box must stay **majority-visible** — the thinning substrate is the physical content both concepts teach.

---

## 3. Authorable surface (this namespace is binding)

All fields are per-state on `ParticleFieldStateConfig` unless marked `[config]`.

```ts
// ── the panel ───────────────────────────────────────────────────────────────
show_kinetics_plot?: boolean;          // draw the panel this state
kinetics_mode?: 'count_vs_time' | 'rate_vs_quantity';   // default 'count_vs_time'
kinetics_home?: 'auto' | 'tl' | 'tr' | 'bl' | 'br';     // [config] one position for the whole concept
kinetics_span_ms?: number;             // mode A: x-axis span, fixed at state entry (default 30000)
kinetics_y_max?: number;               // fixed full-scale; NEVER autoscale (default: initial reactant count)
kinetics_x_max?: number;               // mode B: fixed x full-scale, solved once at state entry
kinetics_series?: string[];            // mode A: species ids to plot (default: reactants + product)
kinetics_rate_series?: 'fwd' | 'rev' | 'net';           // mode B y-source, and readout C's source
kinetics_x_source?: 'reactant_product' | 'product_count';  // mode B x-source (A×B, or AB)
kinetics_window_ms?: number;           // event-rate averaging window (default 4000, per arrhenius_window_ms)

// ── the window / tangent tool (mode A only) ─────────────────────────────────
kinetics_marks?: Array<{
  t0_ms: number; t1_ms: number;        // window edges in state-relative ms
  series?: string;                     // which species curve (default: first reactant)
  at_cue?: string;                     // reveal on a narration cue (Rule 32a cause-first)
  keep?: boolean;                      // leave this chip on screen when the next mark lands (S4 early vs late)
  as_tangent?: boolean;                // draw as a tangent segment at the window's midpoint rather than a chord
  converge_from?: { t0_ms: number; t1_ms: number };  // animate the ends inward from a wider window
  converge_ms?: number;                // duration of that convergence
}>;
kinetics_mark_bind?: { position?: string; span?: string };  // slider ids that seize the LAST mark (e.g. t_lo / t_span)

// ── readout C ───────────────────────────────────────────────────────────────
show_rate_ratio?: boolean;
rate_ratio_mark_cue?: string;          // cue that pins the current windowed rate as ×1.00
                                       // (source = kinetics_rate_series; 'net' = fwd − rev)

// ── readout D ───────────────────────────────────────────────────────────────
show_species_counts_only?: boolean;    // counts, no fwd/rev rate bars
```

**Widget keys** (Rule 39 — register in `PF_WG_FLAGS` at `:571`, gate every draw call through `pfWgVis` at `:602`):
`gas_kinetics_plot` → "Kinetics plot" · `gas_rate_constant` → "Rate constant" · `gas_counts_only` → "Particle counts".

**Dim names for glow emphasis (Rules 29 / 32e) — REQUIRED, and a separate namespace from the widget keys.**
Emphasis resolves through `dimFor(name)`, and an element participates ONLY because its draw call passes a literal:
`dimFor('box')` `:4754`, `'particles'` `:4787`, `'reaction'` `:4961`, `'conc_graph'` `:5067`, `'arrhenius'` `:5405`,
`'histogram'` `:5483`. An earlier draft of this spec gave widget keys and no dim names — which would have made
Rule 32e inert on exactly the elements both concepts declare as their per-state focal, the same defect class as the
`focal_primitive_id` finding one level up (scar:
`new_renderer_instrument_ships_without_a_dim_key_so_every_glow_focal_naming_it_reaches_nothing`). Each new draw call
passes its name, and **these are the only values a concept may author as `glow_focal` for the new instruments**:

| Element | `dimFor()` name |
|---|---|
| the kinetics panel (either mode) | `kinetics_plot` |
| the window / chord / tangent overlay + its slope chip | `kinetics_mark` |
| the rate-constant chip (readout E) | `rate_constant` |
| the counts-only chip (readout D) | `species_counts` |

Acceptance adds: grep every literal passed to `dimFor()` and assert every `glow_focal` value authored by either
concept appears in that set.

---

## 4. Behaviour

**4.1 Accumulator.** A NEW accumulator, separate from `gasConcTrace`. Sample in the PHYSICS step (the `gasArrPts`
precedent), keyed on `PM_simTimeMs` step count — never on wall frames, never on `frame` alone if that would decouple
from the fixed step. Reset on state entry. Each sample carries `{ t_ms, per-species counts, fwd events, rev events }`
so both modes and both readouts read one buffer.

**4.2 Axes.** Solved ONCE at state entry (`gasArrhAxis` precedent, `:5186-5199`) and never rescaled. Mode A: x = real
seconds with numeric ticks (`0 · 10 · 20 · 30 s`), y = particle count. Mode B: x = the chosen live count quantity,
y = measured events/s. **Autoscaling is prohibited in both modes** — a slope read off a rescaling axis lies, and it
is the whole reason the legacy panel cannot serve here.

**4.3 Coincident series.** Where two series coincide by construction (A and B in both concepts), the second draws
dashed — the existing convention at `:5088-5092`, same rationale, do not re-derive it.

**4.4 Slope reads are FITTED, never two-point.** Integer counts make endpoint subtraction garbage. Mode A's window
chip and tangent chip both read a least-squares slope over the sampled trace *within the window*. Mode B's line is a
least-squares fit **constrained through the origin**, its slope printed as a value-only chip. Say so in a code
comment — a future reader will otherwise "simplify" it back to endpoints.

**4.4b One canvas, one meaning for "rate".** `kinetics_window_ms` defaults to 4000, while the existing reaction
readout computes its rate over a fixed 300-tick (5 s) trailing window (`:4692-4699`). Two windows behind one word
means the fwd bar and a slope chip can disagree on the same frame in front of a teacher. **Default
`kinetics_window_ms` to 5000 so the two agree**, and allow the author to override it only with a stated reason.

**4.5 Units on chips.** Mode A slope chips print **`discs/s`**, never a bare `/s`. Absolute rates in this engine are
viewport-dependent (OPEN scar `gas_displayed_rates_and_pressure_are_viewport_dependent`, measured span 4.6×), so the
unit must name what is actually being counted. Readout C prints a **ratio** (`rate ×2.0`) and is therefore
viewport-immune by construction — which is why the doubling states use it rather than an absolute.

**4.6 Slider seizure.** `kinetics_mark_bind` follows the established drag-seize pattern: the authored choreography
drives the mark until the teacher touches the bound slider, after which the drag owns it; `userTouched` clears on
state entry. Rung 3 must resolve to a DECLARED default, never to live slider state (the loop documented at
`:3536-3548`).

**4.7 Density independence.** The two concepts run at **different particle counts by design** — `rate_of_reaction`
takes a declared 720-disc exception for its noise floor, `rate_law_and_order` stays at 180 so its inert-null state
stays honest (excluded-volume coupling, g(η)). The instrument must be correct at both; nothing may hardcode a count.

---

## 5. Acceptance

1. `npm run check:gas-reaction` — **13/13 green before and after.** These are read-only instruments; any
   conservation check moving means the accumulator is perturbing the physics.
2. **Zero pixel change on the four locked baselines.** Primary evidence is structural: every field above is opt-in
   and **no shipped state authors any `kinetics_*` field** (verified). Confirmation is `npm run visual:eyes` on
   **all four** — `collision_theory_activation_energy`, `dynamic_equilibrium`, `le_chateliers_principle`,
   `kinetic_particle_theory` — expecting no H2 diffs. One baseline is not evidence for four.
3. `npm run check:renderer-syntax` (Rule 36c) and `npx tsc --noEmit` clean.
4. **Determinism:** under `SET_TIME_FREEZE` the drawn point count is a function of sim-ms, so THE EYE reproduces
   frames byte-identically (the probe class `skeleton_claims_a_readout_accumulates_while_the_renderer_redraws_the_full_series_every_frame`).
5. **Widget gating:** each of the three keys toggles its element live, and `WIDGET_VIS_STATE` reports it — with no
   overrides sent, THE EYE sees authored defaults.

## 5b. Two follow-ups this spec creates (owner named, not assumed)

- **Piece G — teacher `New run` control** (`rate_law_and_order` S11). Re-seeds the box at the current slider values,
  reusing piece F's re-seed hook, with the kept-chip row persisting the previous run's fitted rate. **Required, not
  optional:** the explore state's reaction is irreversible, so the box runs down and then sits still under live
  sliders that change nothing visible (measured: reactant 360 → 25 in 10 s at the old constants; at Ea 3 the
  half-life is ~27 s — one demonstration pass, not open-ended classroom use). `resetToHomePose()` is reachable only
  from the harness messages `SET_TIME_FREEZE` (`:6628`) and `RESET_TRAJECTORY` (`:6643`) — there is no teacher-facing
  path today. Rule 37's continuous free-run is unchanged; the box idles between runs.
- **`validate:chemistry` per-run charge check** (owner: whoever next touches `validate-chemistry.ts`; NOT the
  surgeon, whose scope is the renderer). `validate-chemistry.ts:63-77` checks ONE species sum per state; a run-pair
  state carries TWO authored charges and the second would go unvalidated — the exact shape of the recorded
  truncation trap that once turned `{A:360,B:360}` into 180 discs of species A.

## 6. Verify-only (no build; report findings)

- `inject_species` naming a species outside `reaction.reactants/product` behaves as fully inert.
  Shipped precedent: `le_chateliers_principle` STATE_6 pours `X`.
- A state may author an all-product charge (`A: 0, B: 0, AB: n`) without tripping the leftover-budget trap.
  Shipped precedent: `dynamic_equilibrium` STATE_5.

## 7. Explicitly NOT in scope

- Any edit to `drawGasConcGraph` / `gasConcTrace` / `show_concentration_graph` (§0).
- Any edit to `field_3d_renderer.ts` or `parametric_renderer.ts` — both are under active work by other desks (Rule 40).
- The `gas_box_glow_focal_never_authored_so_rule32e_is_inert` fleet backfill. It is OPEN and real, but backfilling it
  moves four locked baselines and is a separately scheduled founder call. **Both new concepts author `glow_focal`
  correctly from birth**, so they need nothing here.
