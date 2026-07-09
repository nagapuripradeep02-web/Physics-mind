# emf_definition Diamond — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the `emf_definition` teaching diamond (Ch.3 Current Electricity #5) — emf as the energy a cell gives each charge (ε = W/q), on the particle_field 2D renderer with a new circuit + potential-ladder scenario.

**Architecture:** Add a new `scenario_type: "emf_definition"` to `particle_field_renderer.ts` that reuses the shipped `combination_of_resistors` CIRCUIT engine (loop / beads / geometry / `stepCircuit`) and adds three emf-specific primitives (`drawEmfCell`, `drawPotentialLadder`, `drawVoltmeterC`) + glow keys. The concept JSON is then authored through the Alex pipeline (architect → physics_author → json_author → quality_auditor), verified by THE EYE, founder-approved, and voiced EN+TE last.

**Tech Stack:** TypeScript, p5.js (global mode, inside the `FIELD_3D_RENDERER_CODE`/particle_field code string), Next.js, Supabase (cache seed), Zod (concept validator). No test framework — see Global Constraints.

## Global Constraints

- **No unit-test suite.** Verification = `npx tsc --noEmit` (0 errors, always) + `npm run validate:concepts` (target PASSES) + THE EYE (`npm run visual:eyes -- emf_definition`, read every frame) + `npm run build:review -- emf_definition`. (CLAUDE.md §6)
- **The cell is IDEAL here (r = 0).** Terminal voltage = ε at all times. The droop (`V = ε − Ir`) is Diamond 2 — D1 claims nothing about it, only teases it in S5 narration. (spec §2)
- **Conceptual-only:** OMIT `mode_overrides` (Rule 20) and `epic_c_branches` (EPIC-L-first, 2026-06-10). Confront the "emf is a force" misconception INSIDE EPIC-L via `misconception_watch` + a straightforward contrast beat (Rule 16a — no predict-pause, no `wait_for_answer`).
- **Rule 31 (pacing/controls):** every guided state = ONE idea + ONE motion; narration **25–55 EN words** on `text_en`; per-state contextual controls (only the relevant slider row); distinct motion archetype + delta line per state (S2↔S4 are the one declared contrast pair); explore-last = duration 0 + `interaction_complete`. ≥2 distinct `advance_mode` (Gate 12).
- **Rule 32 (legibility):** cause moves before effect; one variable moves per guided state; caption opens with the ≤5-word delta cue; home-pose continuity; exactly one glow focal per instant.
- **Rule 19:** every state `scene_composition.primitives.length ≥ 3`. **Rule 24:** on-canvas text = labels/equations only, reads sound-off.
- **Glow enum is a CLOSED set.** Any `glow_focal` or per-sentence `glow` name not registered in `dimFor()` **silently dims the whole panel** (the `ohms_law` scar). Every glow name in the JSON must be one of: `pump · ladder · voltmeter · load · electrons · formula`.
- **Rule 30 narration:** plain English (never Hinglish); expand bare symbols in spoken narration (ε → "the emf epsilon", V → "voltage V", I → "current I", W → "work W", q → "charge q"); colour words stay English in `text_hi`/`text_te`; on-canvas labels stay symbolic. **Telugu via the Sonnet-5 subscription sub-agent (Rule 30g), NEVER `npm run tts:translate`.** Audio rendered LAST, EN+TE only.
- **Shared-renderer no-race:** `src/lib/renderers/particle_field_renderer.ts` is shared/uncommitted across sessions. `git status`/diff FIRST; region-disjoint additive edits only; re-read before each Edit; **never** commit over a parallel session's work.
- **Escape convention (Rule 14):** inside the particle_field code string, use `\\u03B5` (ε), `\\u03A9` (Ω), `\\u03C4` (τ) — double-escaped. **No backticks** anywhere in the code string.
- **8 registration sites** for a new concept (CLAUDE.md §6). Canvas is **760×500**.

---

## Phase A — Engine primitives (`particle_field_renderer.ts`) + dev harness

> Phase A is verified per-task by `tsc` + a quick `visual:eyes` render against a disposable stub config (Task 1). The stub is overwritten by json_author in Phase B. Full integration truth is Phase C (THE EYE against the real JSON).

### Task 1: Pre-flight + disposable dev stub

**Files:**
- Create: `src/data/concepts/emf_definition.json` (DISPOSABLE 2-state stub — Phase B overwrites)
- Create: `src/scripts/_seed_emf_definition_cache.ts`
- Modify: `src/lib/aiSimulationGenerator.ts` (`CONCEPT_RENDERER_MAP`)
- Modify: `src/lib/intentClassifier.ts` (`VALID_CONCEPT_IDS`)
- Modify: `src/config/panelConfig.ts` (`CONCEPT_PANEL_MAP`)

**Interfaces:**
- Produces: a loadable `emf_definition` concept whose `particle_field_config.scenario_type === "emf_definition"`, seeded into `simulation_cache` so `visual:eyes -- emf_definition` can render.

- [ ] **Step 1: No-race check.** Run:
```bash
git status --short src/lib/renderers/particle_field_renderer.ts
```
Expected: file is NOT in another session's uncommitted edits. If it shows `M`, diff it (`git diff src/lib/renderers/particle_field_renderer.ts`), confirm the changes are yours/committed-safe, and keep all edits below region-disjoint (append new functions; touch only the specific dispatch lines named). If a parallel session owns it, STOP and coordinate.

- [ ] **Step 2: Re-read the circuit region fresh** (lines ~860–1090 of `particle_field_renderer.ts`) so the gating edits target current line numbers. Confirm these symbols still exist: `circuitMode`, `cCurrents`, `circuitGeom`, `circuitLoops`, `circuitInitBeads`, `drawCircuit`, `stepCircuit`, `drawBatteryC`, `drawAmmeterAtC`, `dimFor`, `curState`, `hasSlider`, `sliderVal`, `physConst`.

- [ ] **Step 3: Write the disposable stub** `src/data/concepts/emf_definition.json`:
```json
{
  "concept_id": "emf_definition",
  "concept_name": "EMF — the Energy a Cell Gives Each Charge",
  "chapter": 3,
  "section": "3.11",
  "schema_version": "2.0.0",
  "class_level": 12,
  "concept_tier": "moderate",
  "source_book": "STUB — replaced by json_author in Phase B",
  "renderer_pair": { "panel_a": "particle_field", "panel_b": "particle_field" },
  "available_renderer_scenarios": { "particle_field": ["emf_definition"] },
  "prerequisites": ["ohms_law", "drift_velocity"],
  "real_world_anchor": { "primary": "STUB", "secondary": "STUB" },
  "physics_engine_config": { "variables": {}, "formulas": {}, "constraints": [] },
  "cognitive_limits": { "max_primitives_per_state": 5, "max_labels_per_state": 4, "max_words_per_tts_sentence": 32 },
  "aha_moment": { "state_id": "STATE_3", "statement": "STUB", "visual_confirmation": "STUB" },
  "entry_state_map": { "foundational": ["STATE_1", "STATE_2", "STATE_3"] },
  "epic_l_path": {
    "state_count": 2,
    "states": {
      "STATE_1": { "title": "stub pump+ladder", "duration": 12, "focal_primitive_id": "a", "advance_mode": "manual_click",
        "scene_composition": [{ "type": "annotation", "id": "a", "position": { "x": 380, "y": 90 }, "text": "stub", "color": "#FFB74D", "is_persistent": false }],
        "teacher_script": { "tts_sentences": [{ "id": "s1_1", "text_en": "stub", "text_hi": "stub", "text_te": "stub", "glow": "pump" }] } },
      "STATE_2": { "title": "stub open circuit", "duration": 0, "focal_primitive_id": "a", "advance_mode": "interaction_complete",
        "scene_composition": [{ "type": "annotation", "id": "a", "position": { "x": 380, "y": 90 }, "text": "stub", "color": "#FFB74D", "is_persistent": false }],
        "teacher_script": { "tts_sentences": [{ "id": "s2_1", "text_en": "stub", "text_hi": "stub", "text_te": "stub", "glow": "voltmeter" }] } }
    }
  },
  "particle_field_config": {
    "scenario_type": "emf_definition",
    "particles": { "count": 34, "color": "#42A5F5", "size": 8 },
    "slider_controls": {
      "emf": { "min": 1, "max": 12, "step": 0.1, "default": 1.5, "label": "EMF \\u03b5", "unit": "V" },
      "R": { "min": 0.5, "max": 12, "step": 0.5, "default": 1.5, "label": "Load R", "unit": "\\u03a9" },
      "switch": { "min": 0, "max": 1, "step": 1, "default": 1, "label": "Switch" }
    },
    "pvl_colors": { "background": "#0A0A1A", "electron": "#42A5F5", "wire": "#546E7A", "cell": "#FFD54F", "ladder": "#4DD0E1", "voltmeter": "#B39DDB", "load": "#FFB74D", "labels": "#D4D4D8" },
    "states": {
      "STATE_1": { "label": "\\u03b5 = W / q", "caption": "Cell lifts each charge", "formula_overlay": "\\u03b5 = W / q", "pump_focus": true, "show_ladder": true, "show_sliders": false, "visible_controls": [], "glow_focal": "pump" },
      "STATE_2": { "label": "no current \\u2192 V = \\u03b5", "caption": "All yours", "formula_overlay": "V = \\u03b5", "open_circuit": true, "show_voltmeter": true, "show_ladder": true, "show_sliders": true, "glow_focal": "voltmeter" }
    }
  }
}
```

- [ ] **Step 4: Register the 3 code sites so it loads + renders.**
  - `CONCEPT_RENDERER_MAP` in `aiSimulationGenerator.ts`: add `emf_definition: 'particle_field',`
  - `VALID_CONCEPT_IDS` in `intentClassifier.ts`: add `'emf_definition',`
  - `CONCEPT_PANEL_MAP` in `panelConfig.ts`: add an `emf_definition` entry mirroring `combination_of_resistors`'s shape (panel_a/panel_b = particle_field).

- [ ] **Step 5: Write the seed script** `src/scripts/_seed_emf_definition_cache.ts` — clone `src/scripts/_seed_biot_savart_law_cache.ts`'s structure but store `physics_config = { epic_l_path, particle_field_config }` read from `emf_definition.json`, using `supabaseAdmin` from `.env.local`. (Reference: memory `reference_visual_gate_ops` — seed via `_seed_<id>_cache.ts` + `supabaseAdmin`.)

- [ ] **Step 6: tsc + seed + render smoke.** Run:
```bash
npx tsc --noEmit
npx tsx src/scripts/_seed_emf_definition_cache.ts
npm run visual:eyes -- emf_definition
```
Expected: tsc 0 errors; seed writes a `simulation_cache` row; `visual:eyes` produces a `.visual_runs/emf_definition/` frame dump. Render will be **partial/blank** (primitives not built yet) — that is expected at this task; the point is the pipeline resolves the concept + scenario_type without error. If Supabase `fetch failed` (memory `feedback_node_fetch_flaky_curl_bypass`), use the curl bypass.

- [ ] **Step 7: Commit.**
```bash
git add src/data/concepts/emf_definition.json src/scripts/_seed_emf_definition_cache.ts src/lib/aiSimulationGenerator.ts src/lib/intentClassifier.ts src/config/panelConfig.ts
git commit -m "feat(emf_definition): register concept + disposable dev stub for Phase-A engine bring-up"
```

---

### Task 2: Family gate + emf physics helpers

**Files:**
- Modify: `src/lib/renderers/particle_field_renderer.ts` (circuit region ~864, `stepCircuit` re-sim call-site ~1780, `draw()` ~1090, `circuitInitBeads` call-site ~473)

**Interfaces:**
- Produces: `isCircuitFamily()`, `emfMode()`, `cEmf()`, `cLoadR()`, `emfSwitchOpen()`, `emfCurrents()` returning `{ eps:number, R:number, i:number, swOpen:boolean, Vterm:number }`.
- Consumes: existing `circuitGeom`, `circuitLoops`, `circuitInitBeads`, `circuitBeadS`, `polyLen`, `polyAt`, `hasSlider`, `sliderVal`, `physConst`, `curState`.

- [ ] **Step 1: Add the family gate + emf physics** (append beside `circuitMode`, ~line 864):
```javascript
function emfMode() { return !!(config && config.scenario_type === 'emf_definition'); }
function isCircuitFamily() { return circuitMode() || emfMode(); }

// ── emf physics (ideal cell, r = 0: terminal V = eps always) ────────────────
function cEmf()   { return hasSlider('emf') ? sliderVal('emf') : physConst('emf', 1.5); }
function cLoadR() { return hasSlider('R')   ? sliderVal('R')   : physConst('R_load', 1.5); }
function emfSwitchOpen() {
  var st = curState();
  if (st && st.open_circuit) return true;              // S5: loop opened to measure emf
  if (hasSlider('switch')) return sliderVal('switch') < 0.5;
  return false;
}
function emfCurrents() {
  var eps = cEmf(), R = max(cLoadR(), 1e-6);
  var swOpen = emfSwitchOpen();
  var i = swOpen ? 0 : eps / R;                         // ideal cell
  return { eps: eps, R: R, i: i, swOpen: swOpen, Vterm: eps };
}
```

- [ ] **Step 2: Route beads + re-sim + draw to the family gate.** Change these three call-sites from `circuitMode()` to `isCircuitFamily()`:
  - `circuitInitBeads()` guard (~line 473): `if (isCircuitFamily()) { circuitInitBeads(); collisionFlashes = []; return; }`
  - the re-sim step loop (~line 1780): `for (var k = 0; k < steps; k++) { if (isCircuitFamily()) stepCircuit(st); else stepPhysics(st); }`
  - the `draw()` branch (~line 1090): `if (isCircuitFamily()) { if (!frozen && !paused) stepCircuit(state); ...` — inside, dispatch by scenario: `if (emfMode()) drawEmfScenario(); else drawCircuit();` (leave the `drawCircuit()` path for `combination_of_resistors` untouched).
  - Leave the `r2_autosweep`/`switch_cycle` advance-mode blocks (~700–711) gated on `circuitMode()` (combination-only) — the emf scenario must NOT enter them.

- [ ] **Step 3: Add a minimal `drawEmfScenario()` stub** (append near `drawCircuit`) that draws the loop + beads + a placeholder cell, so Task 2 renders something before the real primitives land:
```javascript
function drawEmfScenario() {
  var c = emfCurrents(), loops = circuitLoops(), g = loops.g;
  drawWireC(loops.series, '#546E7A', 0.85, 3);
  // reuse the combination bead engine with a single series loop
  drawCircuitBeads(loops, { topo: 'series', single: true, i1: c.i, i2: c.i, itot: c.i, Req: c.R, V: c.eps, R1: c.R, R2: c.R });
  drawResistorBoxC((g.leftX + g.rightX) / 2, g.topY, 'R = ' + fmtNum(c.R) + ' \\u03A9', dimFor('load'));
  drawAmmeterAtC(g.amMain.x, g.amMain.y, c.i, 'AMMETER', dimFor('electrons'), 26);
  drawBatteryC(g, c.eps, 1);   // placeholder cell — replaced by drawEmfCell in Task 3
}
```

- [ ] **Step 4: tsc + render.** Run:
```bash
npx tsc --noEmit
npm run visual:eyes -- emf_definition
```
Expected: tsc 0; `.visual_runs/emf_definition/` now shows a single loop with beads flowing, a load resistor, an ammeter reading `I = 1.00 A` (ε=1.5, R=1.5), and a battery symbol. Read the `__frozen` frame to confirm.

- [ ] **Step 5: Commit.**
```bash
git add src/lib/renderers/particle_field_renderer.ts
git commit -m "feat(emf_definition): family gate + ideal-cell physics + loop/bead reuse"
```

---

### Task 3: `drawEmfCell` — the charge-pump cell

**Files:**
- Modify: `src/lib/renderers/particle_field_renderer.ts`

**Interfaces:**
- Produces: `drawEmfCell(g, eps, dim, pumpActive)` — draws the battery symbol + (when `pumpActive`) charges rising inside the cell − → + and a work arrow.
- Consumes: `dimFor('pump')`, `PM_simTimeMs`, `circuitGeom` fields (`g.leftX`, `g.midY`).

- [ ] **Step 1: Add the primitive** (append near `drawBatteryC`):
```javascript
function drawEmfCell(g, eps, dim, pumpActive) {
  var bx = g.leftX, by = g.midY;
  strokeHex('#ECEFF1', 0.92 * dim); strokeWeight(2); line(bx, by - 16, bx, by + 16);   // + plate (long)
  strokeWeight(6); line(bx - 9, by - 8, bx - 9, by + 8);                                 // - plate (short/thick)
  if (pumpActive) {
    var pDim = dimFor('pump'), n = 4;
    for (var k = 0; k < n; k++) {
      var ph = (PM_simTimeMs / 900 + k / n) % 1;                 // 0 = bottom (-), 1 = top (+)
      var py = lerp(by + 13, by - 13, ph);
      fillHex('#42A5F5', (0.2 + 0.7 * sin(ph * PI)) * pDim); noStroke(); ellipse(bx - 3, py, 6);
    }
    strokeHex('#FFD54F', 0.9 * pDim); strokeWeight(2);           // work-on-each-charge arrow (upward)
    line(bx - 3, by + 11, bx - 3, by - 11);
    line(bx - 3, by - 11, bx - 7, by - 5); line(bx - 3, by - 11, bx + 1, by - 5);
    noStroke();
  }
  fillHex('#FFD54F', 0.95 * dim); textSize(12); textStyle(BOLD); textAlign(RIGHT, CENTER);
  text('\\u03B5 = ' + eps.toFixed(1) + ' V', bx - 20, by); textStyle(NORMAL);
}
```

- [ ] **Step 2: Call it from `drawEmfScenario`** — replace the `drawBatteryC(g, c.eps, 1)` line with:
```javascript
var st = curState();
drawEmfCell(g, c.eps, 1, !!(st && st.pump_focus) || !c.swOpen);
```
(Pump animates whenever current flows, and is the focus in S1.)

- [ ] **Step 3: tsc + render.** Run `npx tsc --noEmit && npm run visual:eyes -- emf_definition`. Expected: tsc 0; the cell now shows blue charges rising inside it with a yellow up-arrow and the `ε = 1.5 V` label. Read `__frozen`.

- [ ] **Step 4: Commit.**
```bash
git add src/lib/renderers/particle_field_renderer.ts
git commit -m "feat(emf_definition): drawEmfCell charge-pump primitive"
```

---

### Task 4: `drawPotentialLadder` — the ε-step inset

**Files:**
- Modify: `src/lib/renderers/particle_field_renderer.ts`

**Interfaces:**
- Produces: `drawPotentialLadder(eps, i, R, swOpen, dim)` — right-side inset staircase; step up ε at cell, flat, step down ε across load (flat at ε when `swOpen`).
- Consumes: `dimFor('ladder')`, `width`, `height`, `constrain`, `lerp`.

- [ ] **Step 1: Add the primitive** (append near `drawVIGraph`):
```javascript
function drawPotentialLadder(eps, i, R, swOpen, dim) {
  var x0 = width * 0.74, y0 = height * 0.30, w = width * 0.225, h = height * 0.42;
  rectMode(CORNER); fill(10, 12, 28, 210 * dim); noStroke(); rect(x0, y0, w, h, 6);
  strokeHex('#37474F', 0.8 * dim); strokeWeight(1); noFill(); rect(x0, y0, w, h, 6);
  var padL = 30, padB = 20, gx = x0 + padL, gy = y0 + h - padB, gw = w - padL - 12, gh = h - padB - 20;
  var vmax = eps * 1.2;
  function py(v) { return gy - gh * constrain(v / vmax, 0, 1); }
  strokeHex('#78909C', 0.7 * dim); strokeWeight(1.5); line(gx, gy, gx, gy - gh); line(gx, gy, gx + gw, gy);
  strokeHex('#66BB6A', 0.35 * dim); strokeWeight(1); line(gx, py(eps), gx + gw, py(eps));
  var xa = gx, xc = gx + gw * 0.50, xd = gx + gw * 0.70, xe = gx + gw;
  var lDim = dimFor('ladder'), lo = swOpen ? eps : 0;
  strokeHex('#4DD0E1', 0.98 * lDim); strokeWeight(2.5); noFill();
  beginShape();
  vertex(xa, py(0)); vertex(xa, py(eps));       // STEP UP by eps at the cell (the lift)
  vertex(xc, py(eps));                          // flat along the wire
  vertex(xd, py(lo)); vertex(xe, py(lo));       // STEP DOWN across the load (to 0 when current flows)
  endShape();
  noStroke(); fillHex('#4DD0E1', 0.98 * lDim); textSize(11); textStyle(BOLD); textAlign(LEFT, BOTTOM);
  text('\\u03B5 = ' + eps.toFixed(1) + ' V', xa + 4, py(eps) - 4);
  fillHex('#B0BEC5', 0.85 * dim); textSize(9); textStyle(NORMAL); textAlign(LEFT, TOP);
  text('potential around loop (J/C)', gx, y0 + 4);
  textAlign(CENTER, TOP); text('cell', xa + gw * 0.25, gy + 3); text('load', (xc + xd) / 2, gy + 3);
  textStyle(NORMAL);
}
```

- [ ] **Step 2: Call it from `drawEmfScenario`** (gated by `show_ladder`):
```javascript
if (st && st.show_ladder) drawPotentialLadder(c.eps, c.i, c.R, c.swOpen, 1);
```

- [ ] **Step 3: tsc + render.** Run `npx tsc --noEmit && npm run visual:eyes -- emf_definition`. Expected: tsc 0; STATE_1 shows the ladder inset with a clear step **up ε** at the cell and **down** across the load; STATE_2 (open_circuit) shows the ladder **flat at ε** the whole way. Read `__frozen` for both states.

- [ ] **Step 4: Commit.**
```bash
git add src/lib/renderers/particle_field_renderer.ts
git commit -m "feat(emf_definition): drawPotentialLadder inset (eps = step height)"
```

---

### Task 5: `drawVoltmeterC` + open-circuit halt

**Files:**
- Modify: `src/lib/renderers/particle_field_renderer.ts`

**Interfaces:**
- Produces: `drawVoltmeterC(cx, cy, vVal, eps, dim)` — voltmeter gauge (purple needle) reading volts across the terminals.
- Consumes: `dimFor('voltmeter')`, `PI`, `constrain`, `lerp`, `cos`, `sin`.

- [ ] **Step 1: Add the primitive** (append near `drawAmmeterAtC`):
```javascript
function drawVoltmeterC(cx, cy, vVal, eps, dim) {
  var amR = 24, boxW = amR * 2 + 30, boxH = amR + 42;
  rectMode(CENTER); fill(0, 0, 0, 150 * dim); noStroke(); rect(cx, cy + 4, boxW, boxH, 8); rectMode(CORNER);
  var aLo = -PI * 3 / 4, aHi = -PI / 4;
  strokeHex('#78909C', 0.7 * dim); strokeWeight(2); noFill(); arc(cx, cy, amR * 2, amR * 2, aLo - 0.08, aHi + 0.08);
  var na = lerp(aLo, aHi, constrain(vVal / max(eps * 1.15, 1e-6), 0, 1));
  strokeHex('#B39DDB', 0.98 * dim); strokeWeight(3); line(cx, cy, cx + cos(na) * amR * 0.9, cy + sin(na) * amR * 0.9);
  noStroke(); fillHex('#B39DDB', 0.98 * dim); ellipse(cx, cy, 5);
  fillHex('#CE93D8', 0.9 * dim); textSize(10); textAlign(CENTER, BOTTOM); text('VOLTMETER', cx, cy - amR - 3);
  fillHex('#FFFFFF', 0.98 * dim); textSize(15); textStyle(BOLD); textAlign(CENTER, TOP); text('V = ' + vVal.toFixed(2) + ' V', cx, cy + amR * 0.5 + 3);
  textStyle(NORMAL);
}
```

- [ ] **Step 2: Call it from `drawEmfScenario`** (gated by `show_voltmeter`), placed across the terminals near the cell:
```javascript
if (st && st.show_voltmeter) drawVoltmeterC(g.leftX + 60, g.midY, c.Vterm, c.eps, dimFor('voltmeter'));
```

- [ ] **Step 3: tsc + render.** Run `npx tsc --noEmit && npm run visual:eyes -- emf_definition`. Expected: tsc 0; STATE_2 shows the voltmeter reading `V = 1.50 V` with beads **halted** (open circuit → i=0 → `circuitBeadS` speed 0) and the ammeter at `I = 0.00 A`. Read `__frozen`.

- [ ] **Step 4: Commit.**
```bash
git add src/lib/renderers/particle_field_renderer.ts
git commit -m "feat(emf_definition): drawVoltmeterC + open-circuit measurement"
```

---

### Task 6: Glow keys + state-flag dispatch + charge-double beat

**Files:**
- Modify: `src/lib/renderers/particle_field_renderer.ts` (`dimFor`, `drawEmfScenario`)

**Interfaces:**
- Produces: `dimFor()` keyed for `pump · ladder · voltmeter · load` (in addition to existing `electrons · formula`); `charge_double` intensive-invariance beat in `drawEmfScenario`.
- Consumes: `dimFor`, `PM_simTimeMs`.

- [ ] **Step 1: Read `dimFor()`** (grep for `function dimFor`) and add the 4 new glow keys to its keyed set exactly as the combination keys were added, so a `glow_focal`/`glow` of `pump`/`ladder`/`voltmeter`/`load` resolves (non-keyed names silently dim — Global Constraints). Confirm `electrons` and `formula` are already keyed (from the combination/drift work).

- [ ] **Step 2: Add the `charge_double` beat to `drawEmfScenario`** — the S3 "energy per charge, not a force" invariance. After a reveal, highlight 1 then 2 coulombs riding the ladder while the per-charge ε holds and total work doubles:
```javascript
if (st && st.charge_double) {
  var t = PM_simTimeMs / 1000;
  var nq = (t % 4 < 2) ? 1 : 2;                       // 1 charge, then 2 — total work doubles
  var wTot = nq * c.eps;                              // W = n * eps
  rectMode(CORNER); fillHex('#0A0A1A', 0.82); noStroke();
  var bx = width * 0.30, by = height * 0.80;
  fillHex('#CFD8DC', 0.95); textSize(12); textStyle(BOLD); textAlign(LEFT, CENTER);
  text('charges q = ' + nq + '   \\u2192   work W = ' + wTot.toFixed(1) + ' J', bx, by);
  fillHex('#4DD0E1', 0.98);
  text('but W / q = \\u03B5 = ' + c.eps.toFixed(1) + ' V  (unchanged)', bx, by + 18);
  textStyle(NORMAL);
}
```

- [ ] **Step 3: Confirm the S1 pump-only / S4 ε-scale flags render** — `pump_focus` (Task 3 wired), ε slider live via `visible_controls` (renderer's per-state control chain shows/hides rows). Verify `drawEmfScenario` honors `show_ladder`, `show_voltmeter`, `pump_focus`, `charge_double`, `open_circuit` and draws ≥3 primitives per state (loop + cell + ladder/meter counts satisfy Rule 19 at the renderer level; the JSON's `scene_composition` carries the ≥3 annotations for the validator).

- [ ] **Step 4: tsc + render.** Run `npx tsc --noEmit && npm run visual:eyes -- emf_definition`. Expected: tsc 0; no silent panel-dim (ladder/cell stay bright under their glow_focal). Read `__frozen`.

- [ ] **Step 5: Commit.**
```bash
git add src/lib/renderers/particle_field_renderer.ts
git commit -m "feat(emf_definition): glow keys + charge-double invariance beat + state dispatch"
```

---

### Task 7: Bring-up contract (deriveStateMeta / time-pin / reset)

**Files:**
- Modify: `src/scripts/visual_eyes.ts` or the `deriveStateMeta` source (grep `deriveStateMeta` / `pfRevealMs`), `src/lib/renderers/particle_field_renderer.ts` (reset + time-pin)

**Interfaces:**
- Produces: correct `__frozen` pin timing for emf reveal beats; `RESET_TRAJECTORY` home-pose; `#sliders` exclusion so THE EYE doesn't false-fail.

- [ ] **Step 1: Teach `deriveStateMeta` the emf reveal timings.** Find where `pfRevealMs` is derived (memory `feedback_new_field3d_scenario_gotchas` + `project_ch3_circuit_scenario_engine`). For `emf_definition`, the ladder draw-in and the `charge_double` beat animate on the state clock with no scenario_cue — set `pfRevealMs` so the `__frozen` frame lands AFTER the beat settles (e.g. ≥ the `charge_double` period start). Add the `emf_definition` scenario_type to the same detection branch that recognizes `combination_of_resistors` (so deriveStateMeta reads `particle_field_config`).

- [ ] **Step 2: Verify time-pin + reset invariants** already hold for the family path (they were built for the circuit engine): `window.__PM_supportsTimePin = true`, `RESET_TRAJECTORY` → home-pose reset, `ceil` re-sim step count. Confirm `emfMode()` beads reset to their `circuitInitBeads` phase on `RESET_TRAJECTORY` (shared with combination — should already work; verify).

- [ ] **Step 3: Add `emf_definition` to the `#sliders` exclusion chain** if THE EYE's slider-panel diffing keys on scenario_type (memory `feedback_new_field3d_scenario_gotchas`) — else a stale panel bleeds / false-fail.

- [ ] **Step 4: Full render + read.** Run:
```bash
npx tsc --noEmit
npx tsx src/scripts/_seed_emf_definition_cache.ts
npm run visual:eyes -- emf_definition
```
Expected: both stub states render with the `__frozen` frame landing on settled content (ladder drawn, needle settled); no `pollSimTimeReached` ~5s burns; no new false-fails in the run log.

- [ ] **Step 5: Commit.**
```bash
git add -A
git commit -m "feat(emf_definition): THE EYE bring-up (deriveStateMeta reveal timing + time-pin)"
```

> **Phase A gate:** engine renders the pump, ladder (step up/down + flat-at-ε when open), and voltmeter correctly against the stub, tsc clean, THE EYE runs without false-fails. Ready to author the real content.

---

## Phase B — Alex authoring pipeline (sequential; each output is the next input)

> Dispatch order is fixed (CLAUDE.md §1): architect → physics_author → json_author → quality_auditor. Never parallel.

### Task 8: Architect skeleton

- [ ] **Step 1: Dispatch `architect`** with: concept_id `emf_definition`, chapter 3, and the approved spec `docs/superpowers/specs/2026-07-10-emf-definition-design.md`. Require the 9-section skeleton to match the spec exactly: **6 states** with the §5 arc + the Rule 31 per-state control table (state × teaches × archetype × delta × controls × duration), PRIMARY aha = STATE_3, the `misconception_watch` "emf is a force" at STATE_3 (Rule 16a straightforward beat), `entry_state_map` (foundational S1–S3), prerequisites `[ohms_law, drift_velocity]`, and the Indian emf-hierarchy anchor. Ideal cell (r=0) stated. OMIT epic_c_branches + mode_overrides.
- [ ] **Step 2: Save** the skeleton to `.agents/proof_run/emf_definition_skeleton.md`.
- [ ] **Step 3: Verify** the skeleton's state arc == spec §5 (6 states, S2↔S4 contrast pair, explore-last). If it drifts, re-dispatch with the delta named. Commit the skeleton.

### Task 9: Physics block

- [ ] **Step 1: Dispatch `physics_author`** with the skeleton. Require: variables `emf` (V, min 1, max 12, default 1.5), `R` (Ω, load, default 1.5 → I=1.0 A), `switch`; formula `i = ε/R` (ideal, r=0), `V_terminal = ε`; the **ideal-cell constraint** (no droop in D1), `ε = W/q` with a worked real number (1.5 V dry cell → 1.5 J/C), per-state motion timeline + control spec (which row is live per state), and the intensive-invariance argument for S3 (double q → double W, same ε). Board mark schemes deferred (conceptual-only).
- [ ] **Step 2: Append** the physics block to `.agents/proof_run/emf_definition_skeleton.md`. Verify units + the ideal-cell honesty. Commit.

### Task 10: JSON author + registration

- [ ] **Step 1: Dispatch `json_author`** with skeleton + physics block. It writes the FINAL `src/data/concepts/emf_definition.json` (OVERWRITE the Task-1 stub) with all 6 states, `text_en` narration at **25–55 EN words/state**, per-state `visible_controls` (S1–S3 none; S4 `emf`; S5 none; S6 all + `interaction_complete`), and **maps every glow name onto the keyed set** `pump/ladder/voltmeter/load/electrons/formula` (Global Constraints — the closed-enum trap).
- [ ] **Step 2: Complete all 8 registration sites** (Task 1 did renderer_map / VALID_CONCEPT_IDS / panelConfig): now add `CLASSIFIER_PROMPT` + `ASPECT_VOCABULARY` entries in `intentClassifier.ts`; confirm `PCPL_CONCEPTS` is **not** needed (particle_field circuit, not PCPL — verify against how `combination_of_resistors` was handled); write `supabase_migrations/supabase_2026-07-10_seed_emf_definition_clusters_migration.sql` (authored-not-applied; dormant this phase).
- [ ] **Step 3: Iterate to green.** Run:
```bash
npx tsc --noEmit
npm run validate:concepts
```
Expected: tsc 0 errors; validator target `emf_definition` PASSES (Gates 12/13/19 etc.). Fix until both pass.
- [ ] **Step 4: Commit.**
```bash
git add src/data/concepts/emf_definition.json src/lib/intentClassifier.ts supabase_migrations/supabase_2026-07-10_seed_emf_definition_clusters_migration.sql
git commit -m "feat(emf_definition): final concept JSON + registration (6 states, ideal cell)"
```

---

## Phase C — THE EYE + audit + approval + ship

### Task 11: THE EYE + eye-walker

- [ ] **Step 1: Re-seed + run THE EYE.**
```bash
npx tsx src/scripts/_seed_emf_definition_cache.ts
npm run visual:eyes -- emf_definition
```
- [ ] **Step 2: Dispatch `eye-walker`** to read ALL frames in its own context → per-state verdict table + ≤5 frames for founder + candidate `engine_bug_queue` rows. (Never read ~100 PNGs in the main session.) Judge field content from `__frozen`, not dense frames (memory `feedback_field3d_visual_gate_reading`).
- [ ] **Step 3: Zero-new-bug gate.** Every guided state's ε step / needle / pump reads correctly; cause-first, single glow focal, delta cue legible. If eye-walker finds a **rendering** defect → fix in Phase A (engine) under no-race; if a **content** defect → route to json_author/physics_author/architect. Re-run until zero new `engine_bug_queue` rows.
- [ ] **Step 4: Commit** any fixes.

### Task 12: Quality auditor

- [ ] **Step 1: Dispatch `quality-auditor`** (gates 0–20, dual-path live walk on localhost:3000). Note: the confusion_cluster_registry Gate-8 probe **N/A-DORMANT** this phase (migration authored-not-applied — memory `feedback_auditor_cluster_registry_false_fail`); don't let it false-FAIL json_author.
- [ ] **Step 2: Address FAILs** via the auditor's routing (upstream agent or engine). Re-run until PASS. Commit.

### Task 13: Founder review gate

- [ ] **Step 1: Build + serve the review site.**
```bash
npm run build:review -- emf_definition
```
Then serve on 8080 (detached, per memory `feedback_detached_process_for_long_tasks`) and give the founder **http://localhost:8080/emf_definition/** (memory `feedback_provide_sim_review_link`).
- [ ] **Step 2: STOP for founder visual approval.** Do not proceed to TTS without an explicit approval statement (Rule 30f / shipper gate).

### Task 14: EN+TE audio (post-approval ONLY)

- [ ] **Step 1: Translate `text_te` via a `model: sonnet` sub-agent** (Rule 30g) — dump each state's `text_en`, get back code-mixed `text_te` (technical/English terms stay Latin, never transliterate, expand bare symbols to spoken names, colour words English). **NEVER `npm run tts:translate`** (bills metered API). Write `text_te` structurally into the JSON.
- [ ] **Step 2: Voice EN+TE.**
```bash
npm run tts:generate -- emf_definition --langs=en,te
```
(hash-aware; never `--force`, never Hindi audio.)
- [ ] **Step 3: Verify + rebuild.**
```bash
npm run build:review -- emf_definition
```
Expected: manifest EN+TE clips present, **stale-clips 0** (memory `feedback_tts_clip_stale_after_text_edit`), HTTP 200, validate PASSES. Telugu stays DRAFT until a native reviewer.
- [ ] **Step 4: Commit** the final JSON with `text_te` + audio manifest. Update `PROGRESS.md` (CLAUDE.md §9).

---

## Self-Review (against the spec)

**Spec coverage:** §1 order → Task 8; §2 atomic claim + ideal cell → Tasks 2/9; §3 representation (circuit+ladder) → Tasks 2–4; §4 engine additions (family gate, drawEmfCell, drawPotentialLadder, drawVoltmeterC, glow keys, state flags, bring-up contract) → Tasks 2–7; §5 6-state arc → Tasks 8/10; §6 misconception S3 → Tasks 8/10; §7 Rule 33 N/A → documented in json (Task 10, source_book/notes); §8 anchor → Tasks 8/10; §9 8 registration sites → Tasks 1 (3) + 10 (5); §10 DoD → Tasks 11–14. No gaps.

**Placeholder scan:** the only intentional stub is Task 1's disposable JSON (explicitly overwritten in Task 10). No "TBD/handle edge cases/similar to Task N". Engine steps carry real, compiling code.

**Type consistency:** `emfCurrents()` returns `{eps,R,i,swOpen,Vterm}` and every consumer (Tasks 3/4/5/6) uses those exact keys. `drawEmfCell(g,eps,dim,pumpActive)`, `drawPotentialLadder(eps,i,R,swOpen,dim)`, `drawVoltmeterC(cx,cy,vVal,eps,dim)` signatures match their call-sites. Glow keys `pump/ladder/voltmeter/load` are defined (Task 6) before the JSON references them (Task 10).
