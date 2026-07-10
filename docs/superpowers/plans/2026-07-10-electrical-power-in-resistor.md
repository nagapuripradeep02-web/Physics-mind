# electrical_power_in_resistor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Ch.3 §3.9 diamond `electrical_power_in_resistor` — P = VI = I²R = V²/R, Joule heating, and the series→parallel brightness flip on two rated bulbs — as a new `scenario_type: "electric_power"` in the existing particle_field circuit family plus a full Alex-pipeline concept JSON.

**Architecture:** Reuse the whole `combination_of_resistors` circuit engine (deterministic bead loop, battery, topology, ammeter). Add ONE new primitive (`drawBulbC`, glow ∝ √(P/Pmax)), a per-bulb power + energy-accumulator adapter, a `drawPowerScenario()` render branch, an `updateReadouts()` power branch, and `deriveStateMeta` reveal pins. Then author the concept JSON via architect → physics_author → json_author → quality_auditor.

**Tech Stack:** TypeScript, p5.js renderer embedded as a string in `particle_field_renderer.ts`, Supabase cache, Zod concept schema, THE EYE (`visual:eyes`) deterministic visual gate. **No unit-test suite** — the codebase-native verification is `npx tsc --noEmit` + `npm run validate:concepts` + a standalone Playwright "smoke" (the `_circuit_smoke.ts` precedent) + THE EYE.

## Global Constraints

- **Battery-scale, no hidden calibration, no hardcoded mains** (Rule 35b). V default 6 V; bulbs Ω-scale. Two rated bulbs at 6 V: **"6 W" = 6 Ω**, **"3 W" = 12 Ω**. Series @6 V → 0.667 W / 1.333 W; parallel @6 V → 6.0 W / 3.0 W (each at nameplate).
- **Additive only** — `circuitMode()`/`emfMode()`/`irMode()`/drift/ohms/resistivity render paths must stay byte-identical (their THE EYE H2 baselines re-run 0.00%).
- **Rule 31:** guided state = ONE idea + ONE motion; narration 25–55 EN words; ≥2 distinct `advance_mode` (Gate 12); no `wait_for_answer`, no `pause_after_ms`; explore-last (`interaction_complete`). Per-state control table is authored in the architect skeleton BEFORE JSON.
- **Rule 32/34:** cause-first; one glow focal (the brighter bulb); ≤5-word delta-cue caption on-canvas, prose in `#capStrip`; ONE Unicode formula surface per state; value-only HUD; Unicode across DOM + canvas-drawn + sprite text paths (P, I², V², Ω, ·, →, ²).
- **Rule 29:** emphasis = brightness, never size. Bulb glass/filament geometry is constant; only glow intensity changes with P.
- **8 registration sites** (root CLAUDE.md §6); `PCPL_CONCEPTS` NOT touched (particle_field, not PCPL).
- **Ship is OUT of scope** — Rule 30f/g EN+TE audio + `visual:approve` is a separate founder-gated step after quality_auditor PASS.
- **No-race:** `particle_field_renderer.ts` + `deriveStateMeta.ts` are shared. Before Phase A, confirm a clean tree for these two files; commit each task surgically (explicit paths only).

---

## Phase A — Engine (executed inline in the main session, on a clean tree)

### Task A1: Register the `electric_power` scenario mode

**Files:**
- Modify: `src/lib/renderers/particle_field_renderer.ts:887-890` (the mode-gate block)

**Interfaces:**
- Produces: `powerMode(): boolean` — true when `config.scenario_type === 'electric_power'`; `isCircuitFamily()` now includes it.

- [ ] **Step 1: Add the gate + extend the family.** Replace the block at lines 887–890:

```javascript
function circuitMode() { return !!(config && config.scenario_type === 'combination_of_resistors'); }
function emfMode() { return !!(config && config.scenario_type === 'emf_definition'); }
function irMode() { return !!(config && config.scenario_type === 'internal_resistance'); }
function powerMode() { return !!(config && config.scenario_type === 'electric_power'); }
function isCircuitFamily() { return circuitMode() || emfMode() || irMode() || powerMode(); }
```

- [ ] **Step 2: Verify types.** Run: `npx tsc --noEmit`
Expected: 0 errors. (The file is a `.ts` module that emits the renderer string; a syntax slip here fails tsc.)

- [ ] **Step 3: Commit.**

```bash
git add src/lib/renderers/particle_field_renderer.ts
git commit -m "feat(electric_power): register electric_power scenario mode in circuit family"
```

---

### Task A2: `drawBulbC` primitive (glow ∝ √(P/Pmax))

**Files:**
- Modify: `src/lib/renderers/particle_field_renderer.ts` — add after `drawResistorBoxC` (ends line 1084) in the primitives block.

**Interfaces:**
- Consumes: p5 globals (`fill`, `ellipse`, `text`, `fillHex`, `strokeHex`, `PM_simTimeMs`, `constrain`, `sqrt`, `sin`, `max`), `dimFor`.
- Produces: `drawBulbC(cx, cy, rating, P, Pmax, dim)` — draws a glass envelope + filament whose brightness = `constrain(sqrt(P/Pmax), 0.12, 1)`, a heat halo scaled by the same, a rating label ("6 W") above, and a live `P = x.xx W` below. `dim` is the glow-focal multiplier (0..1) from `dimFor`.

- [ ] **Step 1: Add the primitive.** Insert:

```javascript
// A bulb = a resistor that shows its dissipation as LIGHT. Brightness (not size —
// Rule 29) tracks power via a sqrt map so low-power series bulbs still read as lit
// and their 2:1 ratio stays visible, while the parallel bulbs go full-bright.
// Pmax is a FIXED normalizer (never per-state auto-scale) so the series-vs-parallel
// magnitude flip is honest. rating e.g. '6 W'; P in watts; dim = glow-focal mult.
function drawBulbC(cx, cy, rating, P, Pmax, dim) {
  var b = constrain(sqrt(max(P, 0) / max(Pmax, 1e-6)), 0.12, 1);   // brightness 0.12..1
  var flick = 0.96 + 0.04 * sin(PM_simTimeMs / 140);               // faint filament shimmer
  var glow = b * flick;
  // heat/light halo (extends the i^2 r halo idiom from drawEmfCell)
  noStroke(); fillHex('#FFB300', 0.16 * glow * dim); ellipse(cx, cy, 46 + 26 * glow);
  fillHex('#FFCA28', 0.22 * glow * dim); ellipse(cx, cy, 30 + 12 * glow);
  // glass envelope (constant geometry — never scales)
  strokeHex('#B0BEC5', 0.85 * dim); strokeWeight(2); noFill(); ellipse(cx, cy, 26, 26);
  strokeWeight(2); line(cx - 6, cy + 12, cx + 6, cy + 12);         // base contact
  // filament: bright core whose alpha = brightness
  noStroke(); fillHex('#FFF3E0', (0.25 + 0.75 * glow) * dim); ellipse(cx, cy, 12);
  strokeHex('#FFD54F', (0.4 + 0.6 * glow) * dim); strokeWeight(1.5); noFill();
  beginShape();
  for (var k = 0; k <= 4; k++) vertex(cx - 6 + k * 3, cy + (k % 2 ? -4 : 4));
  endShape(); noStroke();
  // rating label (above) + live power (below)
  fillHex('#FFE082', 0.95 * dim); textSize(11); textStyle(BOLD); textAlign(CENTER, BOTTOM);
  text(rating, cx, cy - 18);
  fillHex('#FFFFFF', 0.98 * dim); textSize(12); textAlign(CENTER, TOP);
  text('P = ' + P.toFixed(2) + ' W', cx, cy + 18); textStyle(NORMAL);
}
```

- [ ] **Step 2: Verify types.** Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit.**

```bash
git add src/lib/renderers/particle_field_renderer.ts
git commit -m "feat(electric_power): drawBulbC primitive (brightness = sqrt(P/Pmax), Rule 29)"
```

---

### Task A3: Power + energy adapter, verified by a standalone smoke

**Files:**
- Modify: `src/lib/renderers/particle_field_renderer.ts` — add after `cCurrents()` (ends line 1016).
- Create (temp): `src/scripts/_power_smoke.ts` (Playwright headless check; deleted after Phase A).

**Interfaces:**
- Consumes: `cCurrents()` → `{ topo, i1, i2, itot, Req, V, R1, R2, single? }`.
- Produces:
  - `cBulbPowers(): { topo, single, P1, P2, Ptot, Pmax }` — per-bulb dissipation. Series: each bulb carries `itot`, so `P = itot² · R`. Parallel: each branch sees `V`, so `P = V² / R`. Single: `P1 = itot·V`. `Pmax` is the fixed normalizer `6`.
  - Module var `powerEnergyJ` (number) + `powerEnergyReset()` — the S3 accumulator.

- [ ] **Step 1: Add the adapter.** Insert after line 1016:

```javascript
var POWER_PMAX = 6;              // fixed brightness normalizer (Rule: never per-state auto-scale)
var powerEnergyJ = 0;           // S3 Joule-heating accumulator (state-local; reset on entry)
function powerEnergyReset() { powerEnergyJ = 0; }
function cBulbPowers() {
  var c = cCurrents();
  if (c.single) {                                   // M1: one bulb, P = V·i
    var Ps = c.itot * c.V;
    return { topo: 'single', single: true, P1: Ps, P2: 0, Ptot: Ps, Pmax: POWER_PMAX };
  }
  if (c.topo === 'series') {                        // same current itot through both -> P = i^2 R
    var Pa = c.itot * c.itot * c.R1, Pb = c.itot * c.itot * c.R2;
    return { topo: 'series', single: false, P1: Pa, P2: Pb, Ptot: Pa + Pb, Pmax: POWER_PMAX };
  }
  var Pp1 = (c.V * c.V) / c.R1;                     // parallel: same V across each -> P = V^2 / R
  var Pp2 = (c.i2 <= 1e-9) ? 0 : (c.V * c.V) / c.R2;
  return { topo: 'parallel', single: false, P1: Pp1, P2: Pp2, Ptot: Pp1 + Pp2, Pmax: POWER_PMAX };
}
```

- [ ] **Step 2: Wire the accumulator into the step loop.** In `stepCircuit(state)` (line 1369), after `PM_simTimeMs += 1000 / 60; ...`, add the energy integration (only when the state asks for it):

```javascript
  if (state && state.energy_accumulate) {
    var pw = cBulbPowers();
    powerEnergyJ += pw.Ptot * (1000 / 60) / 1000;   // P·dt, dt = one 60fps frame in seconds
  }
```

Reset it on state entry. `rebuildScene()` (line 471) short-circuits for the circuit family at line 473 (`if (isCircuitFamily()) { circuitInitBeads(); collisionFlashes = []; return; }`). Add the reset inside that branch, before the `return`:

```javascript
  if (isCircuitFamily()) { circuitInitBeads(); collisionFlashes = []; powerEnergyReset(); return; }
```

- [ ] **Step 3: Write the smoke.** Create `src/scripts/_power_smoke.ts` mirroring `_circuit_smoke.ts` (build the renderer HTML, load in Playwright, drive SET_STATE for a series and a parallel two-bulb config, read back `cBulbPowers()` via `window` eval). Assert:

```
series  @6V, R1=6, R2=12:  P1 ≈ 0.667 W, P2 ≈ 1.333 W   (3W bulb brighter)
parallel@6V, R1=6, R2=12:  P1 ≈ 6.000 W, P2 ≈ 3.000 W   (each at nameplate)
single  @6V, R1=6:         P1 ≈ 6.000 W
```

- [ ] **Step 4: Run the smoke.** Run: `npx tsx src/scripts/_power_smoke.ts`
Expected: all three assertions PASS (tolerance 0.01 W).

- [ ] **Step 5: Verify types + commit.**

```bash
npx tsc --noEmit
git add src/lib/renderers/particle_field_renderer.ts
git commit -m "feat(electric_power): per-bulb power (VI/I²R/V²/R) + Joule-heating energy accumulator + smoke"
```

---

### Task A4: `drawPowerScenario()` render branch + dispatch + readout

**Files:**
- Modify: `src/lib/renderers/particle_field_renderer.ts` — add `drawPowerScenario()` after `drawIrScenario()` (ends line 1367); wire the dispatch at line 1389; add the readout branch in `updateReadouts()` (after the `circuitMode()` branch, ~line 738).

**Interfaces:**
- Consumes: `cCurrents()`, `cBulbPowers()`, `circuitLoops()`, `drawWireC`, `drawCircuitBeads`, `drawBatteryC`, `drawAmmeterAtC`, `drawBulbC`, `dimFor`, `curState()`, `powerEnergyJ`.
- Produces: `drawPowerScenario()` — the electric_power render path.

- [ ] **Step 1: Add the scenario draw.** Insert after line 1367:

```javascript
// ═══ electric_power scenario — bulbs (brightness = power) on the circuit loop ═══
// M1 (single_bulb/three_faces/energy_accumulate): ONE 6 W bulb on the series loop.
// M2 series_pair: two rated bulbs at g.sR1/g.sR2 in series (same current).
// M2 parallel_flip: same two bulbs on the parallel branches (same voltage).
function drawPowerScenario() {
  var c = cCurrents(), pw = cBulbPowers(), loops = circuitLoops(), g = loops.g, st = curState();
  var wcol = '#546E7A';
  if (pw.topo === 'parallel') {
    drawWireC(loops.loop1, wcol, 0.85, 3); drawWireC(loops.loop2, wcol, 0.85, 3);
  } else {
    drawWireC(loops.series, wcol, 0.85, 3);
  }
  drawCircuitBeads(loops, c);
  drawBatteryC(g, c.V, 1);
  // glow focal = the brighter bulb (physically honest single-focal, Rule 32e).
  var d1 = dimFor('bulb1'), d2 = dimFor('bulb2');
  if (pw.single) {
    drawBulbC((g.leftX + g.rightX) / 2, g.topY, '6 W', pw.P1, pw.Pmax, dimFor('bulb1'));
  } else if (pw.topo === 'series') {
    drawBulbC(g.sR1.x, g.sR1.y, '6 W', pw.P1, pw.Pmax, d1);
    drawBulbC(g.sR2.x, g.sR2.y, '3 W', pw.P2, pw.Pmax, d2);
  } else {
    drawBulbC(g.pRx, g.topY - g.gap, '6 W', pw.P1, pw.Pmax, d1);
    drawBulbC(g.pRx, g.topY + g.gap, '3 W', pw.P2, pw.Pmax, d2);
  }
  drawAmmeterAtC(g.amMain.x, g.amMain.y, c.itot, 'AMMETER', dimFor('electrons'), 26);
  // S3 energy readout — power is a RATE; energy piles up.
  if (st && st.energy_accumulate) {
    fillHex('#FF8A65', 0.98); textSize(13); textStyle(BOLD); textAlign(LEFT, CENTER);
    text('energy = P \\u00B7 t = ' + powerEnergyJ.toFixed(0) + ' J', width * 0.28, height * 0.84);
    textStyle(NORMAL);
  }
}
```

- [ ] **Step 2: Wire the dispatch.** At line 1389 change:

```javascript
    if (emfMode()) drawEmfScenario(); else if (irMode()) drawIrScenario(); else if (powerMode()) drawPowerScenario(); else drawCircuit();
```

- [ ] **Step 3: Add the readout branch.** In `updateReadouts()`, add BEFORE the `circuitMode()` branch (so power mode wins over the generic circuit readout), after line 733:

```javascript
    } else if (powerMode()) {                                 // electric_power: P per bulb + total
      var pwr = cBulbPowers();
      if (pwr.single) {
        ro.textContent = 'P = ' + pwr.P1.toFixed(2) + ' W';
      } else {
        ro.textContent = 'P\\u2081 = ' + pwr.P1.toFixed(2) + ' W\\n' +
                         'P\\u2082 = ' + pwr.P2.toFixed(2) + ' W\\n' +
                         'total = ' + pwr.Ptot.toFixed(2) + ' W';
      }
```

- [ ] **Step 4: Verify types.** Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit.**

```bash
git add src/lib/renderers/particle_field_renderer.ts
git commit -m "feat(electric_power): drawPowerScenario render branch + dispatch + power readout"
```

---

### Task A5: THE EYE bring-up — reveal pins + slider visibility

**Files:**
- Modify: `src/lib/validators/visual/deriveStateMeta.ts:404-436` (`pfRevealMs`).
- Modify: `src/lib/renderers/particle_field_renderer.ts` — the per-state slider-row show/hide path (mirror how `circuitMode()` gates R2/topology/switch rows).

**Interfaces:**
- Consumes: the state flags this concept will carry (`energy_accumulate`, `parallel_flip`).
- Produces: correct frozen-frame timing so THE EYE photographs settled states, not mid-animation; correct per-state slider rows.

- [ ] **Step 1: Add reveal pins.** In `pfRevealMs`, after the internal_resistance block (line 435), add:

```javascript
    // electric_power: S3 energy accumulates on the clock (settle by ~3500ms so the
    // frozen frame shows a non-trivial J count); S5 parallel flip re-lands the bulbs.
    if (state.energy_accumulate === true) maxMs = Math.max(maxMs, 3500 + 400);
    if (state.parallel_flip === true) maxMs = Math.max(maxMs, 1500 + 800 + 400);
```

- [ ] **Step 2: Confirm slider visibility needs NO engine change.** Per-state slider rows are driven by a UNIVERSAL path — `particle_field_renderer.ts:569-570` reads `state.visible_controls` (subset) / `state.show_sliders` (all) regardless of scenario_type. So power-mode states expose their declared rows purely via the JSON's per-state `visible_controls` (S1/S2 → `["V"]`; S3 → `["R"]` — note: this concept's single-bulb resistance slider; S6 → all). There is NO scenario-specific exclusion chain to extend here (that stale-panel gotcha is a field_3d concern, not this generic path). This step is a CONFIRMATION only — verify the line still reads as expected, no edit:

Run: `rg -n "visible_controls|show_sliders" src/lib/renderers/particle_field_renderer.ts`
Expected: the `vis = state.visible_controls` / `showAll = state.show_sliders && !vis` block at ~569 is intact. (If confirmed, this task's only real edit is the `deriveStateMeta` pins in Step 1.)

- [ ] **Step 3: Verify types + tests.** Run: `npx tsc --noEmit && npx vitest run src/lib/validators/visual/__tests__/deriveStateMeta.reveal.test.ts`
Expected: tsc 0; the existing reveal test still passes (we only added cases).

- [ ] **Step 4: Commit.**

```bash
git add src/lib/validators/visual/deriveStateMeta.ts src/lib/renderers/particle_field_renderer.ts
git commit -m "feat(electric_power): THE EYE reveal pins (energy_accumulate, parallel_flip) + per-state slider rows"
```

---

### Task A6: Sibling regression guard (before authoring)

**Files:** none (verification only).

- [ ] **Step 1: Confirm siblings byte-identical.** The engine edits are all behind `powerMode()` / new flags. Re-seed + re-EYE one sibling to prove no drift:

Run: `npm run visual:eyes -- combination_of_resistors`
Expected: all states motion-pass; **H2 baseline diff 0.00%** (no pixel change to the shipped circuit sim). If any H2 > 0, a shared-path edit leaked — fix before Phase B.

- [ ] **Step 2: Delete the temp smoke.**

```bash
git rm src/scripts/_power_smoke.ts
git commit -m "chore(electric_power): remove temp power smoke after Phase A verification"
```

---

## Phase B — Authoring pipeline (Alex agents, sequential)

> Each agent's output is the next agent's input. Never parallel (CLAUDE.md §1). The engine flags the JSON must set are FROZEN by Phase A: `single_bulb`, `three_faces`, `energy_accumulate`, `series_pair`, `parallel_flip`, plus `interaction_complete` on explore.

### Task B1: architect skeleton

**Files:**
- Create: `.agents/proof_run/electrical_power_in_resistor_skeleton.md` (agent output)

**Interfaces:**
- Consumes: the approved spec `docs/superpowers/specs/2026-07-10-electrical-power-in-resistor-design.md`.
- Produces: 6-state skeleton with the Rule-31 per-state control table (state × teaches × archetype × delta × controls × duration), S4↔S5 declared contrast pair, PRIMARY aha = S5, misconception_watch at S4/S5 only, universal anchor (Rule 35 — a bulb / kettle coil, no country-specific culture), entry_state_map, prerequisites [ohms_law, combination_of_resistors].

- [ ] **Step 1: Dispatch architect.** `Agent(subagent_type="architect")` with the spec path + the frozen engine flag names + the calibration table. Require the control table to name each state's engine flag.
- [ ] **Step 2: Review the skeleton** against the spec §5 arc + §9 misconception beats. Confirm 6 states, contrast pair declared, no EPIC-C branches, no mode_overrides.

### Task B2: physics_author block

**Files:**
- Modify: `.agents/proof_run/electrical_power_in_resistor_skeleton.md` (append physics block)

**Interfaces:**
- Consumes: the architect skeleton.
- Produces: per-state locked slider specs (V/R1/R2/topology/switch min/max/default), the worked numbers RE-VERIFIED independently (series 0.667/1.333 W, parallel 6/3 W, single 6 W), `text_en` narration 25–55 words/state, 45 drill-down phrases across clusters, the within-state motion timeline per state.

- [ ] **Step 1: Dispatch physics_author** with the skeleton. It must independently re-derive the power numbers and confirm they match Phase A's smoke.
- [ ] **Step 2: Review** — narration word counts in budget (Gate 3f), numbers match, flag names match the engine.

### Task B3: json_author — the concept JSON + 8 registration sites

**Files:**
- Create: `src/data/concepts/electrical_power_in_resistor.json`
- Modify: `src/config/panelConfig.ts` (`CONCEPT_PANEL_MAP`), `src/lib/aiSimulationGenerator.ts` (`CONCEPT_RENDERER_MAP` → `particle_field`), `src/lib/intentClassifier.ts` (`VALID_CONCEPT_IDS` + `CLASSIFIER_PROMPT` + `ASPECT_VOCABULARY`)
- Create: `supabase_migrations/supabase_2026-07-10_seed_electrical_power_in_resistor_clusters_migration.sql`, `src/scripts/_seed_electrical_power_in_resistor_cache.ts`

**Interfaces:**
- Consumes: skeleton + physics block.
- Produces: a v2.x-schema concept JSON with `scenario_type: "electric_power"`, `particle_field_config.states` carrying the frozen flags, `slider_controls`, `tts_sentences` (text_en only — TE/HI at ship), ≥3 primitives/state, ≥2 advance_mode, per-state `visible_controls`, `misconception_watch` at S4/S5, `assessment` + `coverage_map` if authored.

- [ ] **Step 1: Dispatch json_author.**
- [ ] **Step 2: Verify.** Run: `npx tsc --noEmit && npm run validate:concepts`
Expected: tsc 0; validate PASS (target concept + suite stable, 0 WARN).
- [ ] **Step 3: Reconcile flags.** Confirm every `particle_field_config.states[*]` flag the JSON sets exists in the Phase-A engine (`single_bulb`/`three_faces`/`energy_accumulate`/`series_pair`/`parallel_flip`), and topology/switch per-state locks match combination_of_resistors' pattern (`variable_overrides`).
- [ ] **Step 4: Seed the cache.** Run: `npx tsx src/scripts/_seed_electrical_power_in_resistor_cache.ts` (curl-bypass fallback if Node fetch is flaky — see memory `feedback_node_fetch_flaky_curl_bypass`).
- [ ] **Step 5: Commit** (concept + registration + migration + seed, one commit).

---

## Phase C — Gates

### Task C1: THE EYE + eye-walker

- [ ] **Step 1: Run THE EYE.** Run: `npm run visual:eyes -- electrical_power_in_resistor`
Expected: all 6 states motion-pass ($0 deterministic); new concept → no H2 baseline yet. Investigate any "motion died" (likely a missing `deriveStateMeta` case or an `auto_after_animation` on a live-but-static state).
- [ ] **Step 2: Dispatch eye-walker** (reads ALL frames in its own context; returns per-state verdict + ≤5 founder frames + candidate engine_bug_queue rows). Fix any finding, re-seed, re-run THE EYE for that state. Key checks: the series 2:1 brightness contrast is readable; the parallel flip visibly swaps the focal; the winner-bulb glow-focal dims the loser; the S3 energy counter climbs; captions ≤5 words; Unicode intact.

### Task C2: quality_auditor

- [ ] **Step 1: Dispatch quality_auditor (Opus).** Gates 0–20 incl. Rule 31 distinct-motion/contextual-controls, Rule 32/34 legibility, glow-key integrity, registration completeness, Gate 8 engine_bug_queue regression, narration-matches-render.
Expected: PASS, or a FAIL routed to ONE upstream agent (json_author / physics_author / architect) — close the loop, do not hand to peter_parker unless the root cause is engine.

### Task C3: Full sibling regression + convergence

- [ ] **Step 1: Re-EYE all circuit-family siblings.** Run each: `npm run visual:eyes -- emf_definition` / `internal_resistance` / `combination_of_resistors` / `resistivity`
Expected: **H2 0.00%** on every one (the shared-primitive extension is pixel-identical). Any drift = a leaked shared-path edit; fix and repeat.
- [ ] **Step 2: Final green.** Run: `npx tsc --noEmit && npm run validate:concepts`
Expected: tsc 0; validate PASS.
- [ ] **Step 3: Build the review page.** Run: `npm run build:review -- electrical_power_in_resistor` then serve on a dedicated port (8091) and provide the founder link `http://localhost:8091/electrical_power_in_resistor/` (per `feedback_provide_sim_review_link`).

**Definition of Done (this plan):** tsc 0 · validate PASS · THE EYE all-states motion-pass, zero new engine_bug_queue rows · eye-walker clean · quality_auditor PASS · siblings H2 0.00% · review page live. **Ship (Rule 30f/g EN+TE audio + `visual:approve`) is a SEPARATE founder-gated step, not in this plan.**

---

## Self-review notes

- **Spec coverage:** §4 apparatus → A2; §5 arc/control-table → B1; §6 numbers → A3 smoke + B2; §7 engine → A1/A3/A4; §8 legibility → A2 (brightness=power, Rule 29) + C1 eye-walker; §9 misconception → B1/B3; §10 THE EYE gotchas → A5; §11 registration → B3; §12 reuse → A1–A4; §13 risks (fixed Pmax, sqrt brightness map, deterministic reset) → A2/A3.
- **Type consistency:** `cBulbPowers()` shape `{topo,single,P1,P2,Ptot,Pmax}` used identically in A3/A4; `powerMode()`/`isCircuitFamily()` consistent A1→A4; frozen flag set (`single_bulb/three_faces/energy_accumulate/series_pair/parallel_flip`) consistent A5→B3.
- **No placeholders:** engine tasks carry full function bodies; agent tasks carry the dispatch contract + concrete verification commands (tsc/validate/EYE) — the codebase-native "tests" (no unit-test suite exists for the embedded p5 renderer).
