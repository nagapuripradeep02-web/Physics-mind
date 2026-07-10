# internal_resistance Diamond — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the `internal_resistance` teaching diamond (Ch.3 Current Electricity #6, catalog A13) — the hidden r inside the D1 cell, V = ε − ir, short circuit, two-reading measurement, and the charging case V = ε + ir — on the particle_field 2D renderer.

**Architecture:** Add a new `scenario_type: "internal_resistance"` to `particle_field_renderer.ts` joining the CIRCUIT family (`isCircuitFamily()`), reusing the shipped `emf_definition` primitives (`drawEmfCell`, `drawPotentialLadder`, `drawVoltmeterC`, loop/bead engine) via OPTIONAL trailing parameters whose absence reproduces today's rendering exactly. New physics `irCurrents()` (discharge/open/short/charging); ONE new primitive `drawChargerC`. Then the Alex pipeline (architect → physics_author → json_author → quality_auditor), THE EYE (+ an `emf_definition` pixel-regression re-run), founder approval, EN+TE audio last.

**Tech Stack:** TypeScript, p5.js (global mode inside the particle_field code string), Next.js, Supabase (cache seed), Zod (concept validator). No test framework — see Global Constraints.

**Spec:** `docs/superpowers/specs/2026-07-10-internal-resistance-design.md` (approved 2026-07-10).

## Global Constraints

- **No unit-test suite.** Verification = `npx tsc --noEmit` (0 errors, always) + `npm run validate:concepts` (target PASSES) + THE EYE (`npm run visual:eyes -- internal_resistance`, eye-walker reads every frame) + `npm run build:review -- internal_resistance`. (CLAUDE.md §6)
- **Physics numbers are LOCKED (spec §4):** ε=1.5 V, r=0.5 Ω, R=1.0 Ω → i=1.0 A, droop=0.50 V, V=1.00 V; S3 sweep R→0.25 → i=2.0 A, V=0.50 V; S4 R→0 EXACTLY → i_max=3.0 A, V=0; S5 two readings → r=0.50/1.0=0.5 Ω; S6 charger ε_ch=3.0 V ideal + series R=1.0 → i=1.0 A, V_cell=2.00 V.
- **Shipped `emf_definition` stays pixel-identical.** Shared primitives gain optional trailing params only; its 6 locked baselines are the regression proof — re-run `visual:eyes -- emf_definition` after Phase A and require 0 baseline fails.
- **Conceptual-only:** OMIT `mode_overrides` (Rule 20) and `epic_c_branches` (EPIC-L-first). Misconceptions confronted INSIDE EPIC-L via `misconception_watch` + straightforward contrast beats (Rule 16a — no predict-pause, no `wait_for_answer`).
- **Rule 31:** guided state = ONE idea + ONE motion; narration **25–55 EN words** on `text_en`; per-state contextual controls; distinct archetype + delta line per state (S3↔S6 = the one declared contrast pair); explore-last = duration 0 + `interaction_complete`; ≥2 distinct `advance_mode` (Gate 12).
- **Rule 32:** cause moves before effect; one variable per guided state; ≤5-word delta cue opens the caption; home-pose continuity (S1 opens on D1's end pose); ONE glow focal per instant.
- **Rule 19:** every state `scene_composition.primitives.length ≥ 3`. **Rule 24:** on-canvas text = labels/equations only. **Rule 34:** ONE formula surface per state; value-only HUD; Unicode math. **Rule 35:** universal anchors only (car headlights dim at starter crank; worn cell; phone charging above emf) — no country-specific culture anywhere.
- **Glow enum is a CLOSED set.** Every `glow_focal`/per-sentence `glow` must be one of: `pump · ladder · voltmeter · load · electrons · formula · switch · r_internal · charger` (last two added by Task 6; `switch` already keyed at a combination call-site). Unkeyed names silently dim the whole panel (the `ohms_law` scar).
- **Rule 30:** plain English; expand bare symbols in narration (ε → "the emf epsilon", r → "internal resistance r", V → "terminal voltage V", i → "current i"); colour words English in `text_hi`/`text_te`; on-canvas labels symbolic. **Telugu via the Sonnet-5 subscription sub-agent (Rule 30g), NEVER `npm run tts:translate`.** Audio LAST, EN+TE only, after founder approval.
- **Shared-renderer no-race:** `particle_field_renderer.ts` + `deriveStateMeta.ts` are shared/uncommitted across sessions. `git status`/diff FIRST; region-disjoint additive edits; re-read before each Edit; commit ONLY explicitly named files (never `git add -A` — the tree carries other sessions' work).
- **Escape convention (Rule 14):** inside the particle_field code string use `\\u03B5` (ε), `\\u03A9` (Ω), `\\u00B7` (·) — double-escaped. **No backticks** anywhere in the code string.
- **8 registration sites** for a new concept (CLAUDE.md §6). Canvas 760×500. Supabase flaky-fetch fallback: curl bypass (memory `feedback_node_fetch_flaky_curl_bypass`).

---

## Phase A — Engine (`particle_field_renderer.ts`) + dev harness

> Verified per-task by `tsc` + `visual:eyes` against a disposable stub (Task 1). Full truth is Phase C.

### Task 1: Pre-flight + disposable dev stub

**Files:**
- Create: `src/data/concepts/internal_resistance.json` (DISPOSABLE 2-state stub — Phase B overwrites)
- Create: `src/scripts/_seed_internal_resistance_cache.ts`
- Modify: `src/lib/aiSimulationGenerator.ts` (`CONCEPT_RENDERER_MAP`)
- Modify: `src/lib/intentClassifier.ts` (`VALID_CONCEPT_IDS`)
- Modify: `src/config/panelConfig.ts` (`CONCEPT_PANEL_MAP`)

**Interfaces:**
- Produces: a loadable `internal_resistance` concept whose `particle_field_config.scenario_type === "internal_resistance"`, seeded into `simulation_cache` so `visual:eyes -- internal_resistance` renders.

- [ ] **Step 1: No-race check.** Run:
```bash
git status --short src/lib/renderers/particle_field_renderer.ts src/lib/validators/visual/deriveStateMeta.ts
```
Expected: neither file carries another session's uncommitted edits (git status at session start showed both CLEAN — only `field_3d_renderer.ts` and others are dirty, and this plan never touches those). If either shows `M`, diff it and confirm the changes are this session's own before proceeding; if a parallel session owns it, STOP and coordinate.

- [ ] **Step 2: Re-read the emf scenario region fresh** (`particle_field_renderer.ts` lines ~866–1230 and ~1697–1790) so edits target current line numbers. Confirm these symbols exist: `circuitMode`, `emfMode`, `isCircuitFamily`, `cEmf`, `cLoadR`, `emfSwitchOpen`, `emfCurrents`, `circuitGeom`, `circuitLoops`, `circuitInitBeads`, `circuitBeadS`, `drawCircuitBeads`, `drawWireC`, `drawResistorBoxC`, `drawEmfCell`, `drawPotentialLadder`, `drawVoltmeterC`, `drawAmmeterAtC`, `drawEmfScenario`, `dimFor`, `curState`, `hasSlider`, `sliderVal`, `sliderDefault`, `physConst`, `userTouched`, `fmtNum`, `updateReadouts`.

- [ ] **Step 3: Write the disposable stub** `src/data/concepts/internal_resistance.json`:
```json
{
  "concept_id": "internal_resistance",
  "concept_name": "Internal Resistance — the Hidden r Inside Every Real Cell",
  "chapter": 3,
  "section": "3.11",
  "schema_version": "2.0.0",
  "class_level": 12,
  "concept_tier": "medium",
  "source_book": "STUB — replaced by json_author in Phase B",
  "renderer_pair": { "panel_a": "particle_field", "panel_b": "particle_field" },
  "available_renderer_scenarios": { "particle_field": ["internal_resistance"] },
  "prerequisites": ["emf_definition", "ohms_law"],
  "real_world_anchor": { "primary": "STUB", "secondary": "STUB" },
  "physics_engine_config": { "variables": {}, "formulas": {}, "constraints": [] },
  "cognitive_limits": { "max_primitives_per_state": 5, "max_labels_per_state": 4, "max_words_per_tts_sentence": 32 },
  "aha_moment": { "state_id": "STATE_2", "statement": "STUB", "visual_confirmation": "STUB" },
  "entry_state_map": { "foundational": ["STATE_1", "STATE_2"] },
  "epic_l_path": {
    "state_count": 2,
    "states": {
      "STATE_1": { "title": "stub droop intro", "duration": 12, "focal_primitive_id": "a", "advance_mode": "manual_click",
        "scene_composition": [{ "type": "annotation", "id": "a", "position": { "x": 380, "y": 90 }, "text": "stub", "color": "#FFB74D", "is_persistent": false }],
        "teacher_script": { "tts_sentences": [{ "id": "s1_1", "text_en": "stub", "text_hi": "stub", "text_te": "stub", "glow": "voltmeter" }] } },
      "STATE_2": { "title": "stub charging", "duration": 0, "focal_primitive_id": "a", "advance_mode": "interaction_complete",
        "scene_composition": [{ "type": "annotation", "id": "a", "position": { "x": 380, "y": 90 }, "text": "stub", "color": "#FFB74D", "is_persistent": false }],
        "teacher_script": { "tts_sentences": [{ "id": "s2_1", "text_en": "stub", "text_hi": "stub", "text_te": "stub", "glow": "charger" }] } }
    }
  },
  "particle_field_config": {
    "scenario_type": "internal_resistance",
    "particles": { "count": 34, "color": "#42A5F5", "size": 8 },
    "slider_controls": {
      "emf": { "min": 1, "max": 12, "step": 0.1, "default": 1.5, "label": "EMF \\u03b5", "unit": "V" },
      "r": { "min": 0.1, "max": 2, "step": 0.1, "default": 0.5, "label": "internal r", "unit": "\\u03a9" },
      "R": { "min": 0.25, "max": 12, "step": 0.25, "default": 1, "label": "Load R", "unit": "\\u03a9" },
      "switch": { "min": 0, "max": 1, "step": 1, "default": 1, "label": "Switch" }
    },
    "pvl_colors": { "background": "#0A0A1A", "electron": "#42A5F5", "wire": "#546E7A", "cell": "#FFD54F", "ladder": "#4DD0E1", "voltmeter": "#B39DDB", "load": "#FFB74D", "labels": "#D4D4D8" },
    "states": {
      "STATE_1": { "label": "V = \\u03b5 \\u2212 ir", "caption": "Close switch \\u2014 volts drop", "formula_overlay": "V = \\u03b5 \\u2212 ir", "droop_intro": true, "show_voltmeter": true, "show_ladder": true, "show_r": true, "show_sliders": false, "visible_controls": [], "glow_focal": "voltmeter", "emf": 1.5, "r": 0.5, "R": 1 },
      "STATE_2": { "label": "V = \\u03b5 + ir", "caption": "Charging lifts V above \\u03b5", "formula_overlay": "V = \\u03b5 + ir", "charging": true, "show_r": true, "show_voltmeter": true, "show_ladder": true, "show_sliders": true, "glow_focal": "charger", "emf": 1.5, "r": 0.5, "R": 1 }
    }
  }
}
```
(The stub exercises BOTH extreme paths — the cued droop and the charging reversal — so every Phase-A task has a live render target.)

- [ ] **Step 4: Register the 3 code sites.**
  - `CONCEPT_RENDERER_MAP` in `aiSimulationGenerator.ts`: add `internal_resistance: 'particle_field',` next to `emf_definition`.
  - `VALID_CONCEPT_IDS` in `intentClassifier.ts`: add `'internal_resistance',` (grep first — if a legacy placeholder id exists, verify/extend, don't duplicate).
  - `CONCEPT_PANEL_MAP` in `panelConfig.ts`: add an `internal_resistance` entry mirroring `emf_definition`'s shape.

- [ ] **Step 5: Write the seed script** `src/scripts/_seed_internal_resistance_cache.ts` — clone `src/scripts/_seed_emf_definition_cache.ts` verbatim, replacing the concept id; it stores `physics_config = { epic_l_path, particle_field_config }` read from `internal_resistance.json` via `supabaseAdmin` (`.env.local`).

- [ ] **Step 6: tsc + seed + render smoke.** Run:
```bash
npx tsc --noEmit
npx tsx src/scripts/_seed_internal_resistance_cache.ts
npm run visual:eyes -- internal_resistance
```
Expected: tsc 0; seed writes a `simulation_cache` row (curl bypass on `fetch failed`); `visual:eyes` produces `.visual_runs/internal_resistance/` frames. Render is **partial** (scenario not built yet — the family gate doesn't match, so the free-drift path draws) — expected; the point is the concept + scenario resolve without error.

- [ ] **Step 7: Commit (named files only).**
```bash
git add src/data/concepts/internal_resistance.json src/scripts/_seed_internal_resistance_cache.ts src/lib/aiSimulationGenerator.ts src/lib/intentClassifier.ts src/config/panelConfig.ts
git commit -m "feat(internal_resistance): register concept + disposable dev stub for Phase-A bring-up"
```

---

### Task 2: Family gate + ir physics + scenario skeleton

**Files:**
- Modify: `src/lib/renderers/particle_field_renderer.ts` (beside `emfCurrents` ~line 907; the `isCircuitFamily` line ~875; the `draw()` dispatch ~1227)

**Interfaces:**
- Produces: `irMode()`, `cIntR()`, `cIrLoadR()`, `irSwitchOpen()`, `irRampK()`, `irCurrents()` returning `{ eps:number, r:number, R:number, i:number, swOpen:boolean, Vterm:number, mode:'discharge'|'open'|'charging', epsCh?:number }`; a minimal `drawIrScenario()` + `drawIrSwitch(g, open, dim)`.
- Consumes: `cEmf`, `cLoadR`, `circuitLoops`, `drawWireC`, `drawCircuitBeads`, `drawResistorBoxC`, `drawAmmeterAtC`, `drawEmfCell`, `dimFor`, `curState`, `hasSlider`, `sliderVal`, `sliderDefault`, `physConst`, `userTouched`, `fmtNum`.

- [ ] **Step 1: Add the mode gates** — edit the two existing lines (~874–875):
```javascript
function emfMode() { return !!(config && config.scenario_type === 'emf_definition'); }
function irMode() { return !!(config && config.scenario_type === 'internal_resistance'); }
function isCircuitFamily() { return circuitMode() || emfMode() || irMode(); }
```

- [ ] **Step 2: Add the ir physics block** (append after `emfCurrents`, ~line 907):
```javascript
// ── internal_resistance physics — the REAL cell: i = eps/(R+r), V = eps - i*r ──
// (charging: an ideal 3.0 V charger drives i backwards -> V = eps + i*r).
// Per-state numeric locks (st.emf/st.r/st.R/st.switch) win over sliders (Rule 25d).
function cIntR() {
  var st = curState();
  if (st && typeof st.r === 'number') return st.r;
  return hasSlider('r') ? sliderVal('r') : physConst('r_internal', 0.5);
}
function cIrLoadR() {
  var st = curState();
  if (st && st.R_autosweep_down && !userTouched['R']) {   // S3 droop-grow / S4 short-circuit sweep (teacher-seizable)
    var a = (st && typeof st.R === 'number') ? st.R : (hasSlider('R') ? sliderDefault('R') : 1.0);
    var b = (st.R_autosweep_to !== undefined) ? st.R_autosweep_to : 0.25;
    return a + (b - a) * constrain((PM_simTimeMs - 700) / 3200, 0, 1);
  }
  return cLoadR();
}
function irSwitchOpen() {
  var st = curState();
  if (st && st.droop_intro && !userTouched['switch']) return PM_simTimeMs < 1500;   // S1: cued close
  if (st && st.two_reading && !userTouched['switch']) return PM_simTimeMs < 2500;   // S5: open-hold, then close
  if (st && st.open_circuit) return true;
  if (st && typeof st.switch === 'number') return st.switch < 0.5;
  if (hasSlider('switch')) return sliderVal('switch') < 0.5;
  return false;
}
function irRampK() {   // deterministic 800ms current ease after a cued switch-close
  var st = curState();
  if (userTouched['switch']) return 1;
  var t0 = (st && st.droop_intro) ? 1500 : ((st && st.two_reading) ? 2500 : 0);
  if (!t0) return 1;
  return constrain((PM_simTimeMs - t0) / 800, 0, 1);
}
function irCurrents() {
  var eps = cEmf(), r = max(cIntR(), 1e-6);
  var st = curState();
  if (st && st.charging) {
    var epsCh = (typeof st.charger_emf === 'number') ? st.charger_emf : 3.0;
    var Rs = cIrLoadR();
    var iC = max(epsCh - eps, 0) / (Rs + r);
    return { eps: eps, r: r, R: Rs, i: iC, swOpen: false, Vterm: eps + iC * r, mode: 'charging', epsCh: epsCh };
  }
  var R = cIrLoadR();
  var swOpen = irSwitchOpen();
  var i = swOpen ? 0 : (eps / (R + r)) * irRampK();
  return { eps: eps, r: r, R: R, i: i, swOpen: swOpen, Vterm: eps - i * r, mode: swOpen ? 'open' : 'discharge' };
}
```
(`R_autosweep_to: 0` is legal — the denominator is `R + r ≥ r > 0`, so S4's short circuit lands `i = ε/r = 3.0 A` exactly.)

- [ ] **Step 3: Add the scenario skeleton + switch primitive** (append after `drawEmfScenario`, ~line 1205):
```javascript
// ═══ internal_resistance scenario — the emf loop with the hidden r revealed ═══
// Reuses the emf cell/ladder/voltmeter; the switch is drawn at 0.78 of the bottom
// edge (drawSwitchC's series position collides with the main ammeter).
function drawIrSwitch(g, open, dim) {
  var sx = g.leftX + (g.rightX - g.leftX) * 0.78, sy = g.botY;
  var col = open ? '#EF5350' : '#66BB6A';
  fillHex('#ECEFF1', 0.9 * dim); noStroke(); ellipse(sx - 11, sy, 5); ellipse(sx + 11, sy, 5);
  strokeHex(col, 0.98 * dim); strokeWeight(3);
  if (open) line(sx - 11, sy, sx + 7, sy - 15); else line(sx - 11, sy, sx + 11, sy);
  noStroke();
}
function drawIrScenario() {
  var c = irCurrents(), loops = circuitLoops(), g = loops.g, st = curState();
  drawWireC(loops.series, '#546E7A', 0.85, 3);
  drawCircuitBeads(loops, { topo: 'series', single: true, i1: c.i, i2: c.i, itot: c.i,
                            Req: c.R, V: c.eps, R1: c.R, R2: c.R,
                            dir: (c.mode === 'charging') ? -1 : 1 });
  drawResistorBoxC((g.leftX + g.rightX) / 2, g.topY, 'R = ' + fmtNum(c.R) + ' \\u03A9', dimFor('load'));
  drawAmmeterAtC(g.amMain.x, g.amMain.y, c.i, 'AMMETER', dimFor('electrons'), 26);
  drawEmfCell(g, c.eps, 1, !c.swOpen);          // r-reveal arg added in Task 3
  if (!(st && st.charging)) drawIrSwitch(g, c.swOpen, dimFor('switch'));
  if (st && st.show_voltmeter) {
    var vmDim = dimFor('voltmeter'), vx = g.leftX + 82, vy = g.midY;
    strokeHex('#B39DDB', 0.7 * vmDim); strokeWeight(1.5);
    line(g.leftX, g.midY - 16, vx, vy - 14); line(g.leftX, g.midY + 16, vx, vy + 14);
    noStroke();
    drawVoltmeterC(vx, vy, c.Vterm, max(c.eps * 1.5, c.Vterm), vmDim);
  }
  // ladder call added in Task 4; charger in Task 5; state beats in Task 6
}
```
(Note `drawVoltmeterC`'s second value arg is its needle full-scale: `eps * 1.5` headroom so V = 2.0 V in charging doesn't peg the needle; the D1 call-site is untouched.)

- [ ] **Step 4: Bead direction support** — in `circuitBeadS` (~line 997), one additive line:
```javascript
function circuitBeadS(i, c) {
  var spd = (c.itot < 0.02) ? 0 : constrain(c.itot / 1.0, 0.28, 3.0);
  var dir = (c && c.dir === -1) ? -1 : 1;                     // charging: beads reverse
  return (circuitBeadPhase[i] + dir * CIRCUIT_BEAD_RATE * (PM_simTimeMs / 1000) * spd) % 1;
}
```
(`polyAt` already normalizes negative fractions via `((s % 1) + 1) % 1`; combination/emf pass no `dir` → unchanged.)

- [ ] **Step 5: Dispatch** — edit the `draw()` branch (~line 1227):
```javascript
if (emfMode()) drawEmfScenario(); else if (irMode()) drawIrScenario(); else drawCircuit();
```

- [ ] **Step 6: tsc + render.** Run:
```bash
npx tsc --noEmit
npm run visual:eyes -- internal_resistance
```
Expected: tsc 0. STATE_1 `__frozen` (pinned past the 1500ms cue once Task 7 lands; for now read a dense frame ≥ 2500ms): beads flowing, ammeter `I = 1.00 A`, voltmeter `V = 1.00 V`, switch closed green. STATE_2: beads flowing REVERSED, ammeter `I = 1.00 A`, voltmeter `V = 2.00 V`.

- [ ] **Step 7: Commit.**
```bash
git add src/lib/renderers/particle_field_renderer.ts
git commit -m "feat(internal_resistance): family gate + real-cell physics (V = eps - ir) + scenario skeleton + reversed-bead support"
```

---

### Task 3: Cell r-reveal extension (`drawEmfCell` optional arg)

**Files:**
- Modify: `src/lib/renderers/particle_field_renderer.ts` (`drawEmfCell` ~line 1032; `drawIrScenario`)

**Interfaces:**
- Produces: `drawEmfCell(g, eps, dim, pumpActive, rr)` where `rr` (optional) = `{ r:number, i:number, reveal:number 0..1, heat:number 0..1 }`. `rr` absent ⇒ pixel-identical D1 rendering.
- Consumes: `dimFor('r_internal')` (keyed in Task 6), `PM_simTimeMs`.

- [ ] **Step 1: Extend `drawEmfCell`** — add the trailing parameter and the interior block just before the ε-label chip code (the casing + zigzag draw INSIDE the existing function; nothing before it changes):
```javascript
function drawEmfCell(g, eps, dim, pumpActive, rr) {
  // ... existing plate + pump-charge code UNCHANGED ...
  if (rr && rr.reveal > 0) {
    var rDim = dimFor('r_internal') * rr.reveal;
    var bx2 = g.leftX, byT = g.midY - 34;                     // r sits between + plate and the wire exit
    if (rr.heat > 0.05) {                                     // i^2 r heat halo (short circuit cooks the cell)
      var hp = 0.5 + 0.5 * sin(PM_simTimeMs / 260);
      noStroke(); fillHex('#FF7043', (0.10 + 0.25 * rr.heat * hp) * rDim);
      ellipse(bx2 - 2, g.midY - 12, 54 + 26 * rr.heat);
    }
    strokeHex('#B0BEC5', 0.55 * rDim); strokeWeight(1); noFill();
    rectMode(CENTER); rect(bx2 - 2, g.midY - 6, 34, 62, 5); rectMode(CORNER);   // the opened casing
    strokeHex('#FF8A65', 0.95 * rDim); strokeWeight(2); noFill();               // the hidden r (vertical zigzag)
    beginShape();
    for (var zk = 0; zk <= 6; zk++) vertex(bx2 + (zk === 0 || zk === 6 ? 0 : (zk % 2 ? -5 : 5)), byT + zk * (16 / 6));
    endShape();
    noStroke(); fillHex('#FF8A65', 0.95 * rDim); textSize(10); textStyle(BOLD); textAlign(LEFT, CENTER);
    text('r = ' + rr.r.toFixed(1) + ' \\u03A9', bx2 + 12, byT + 8);
    if (rr.i > 0.02) {
      fillHex('#FFAB91', 0.9 * rDim); textSize(10); textAlign(LEFT, CENTER);
      text('i\\u00B7r = ' + (rr.i * rr.r).toFixed(2) + ' V', bx2 + 12, byT + 22);
    }
    textStyle(NORMAL);
  }
  // ... existing eps-label chip code UNCHANGED ...
}
```

- [ ] **Step 2: Wire it from `drawIrScenario`** — replace the Task-2 cell call:
```javascript
  var rr = null;
  if (st && (st.show_r || st.r_reveal)) {
    var rev = (st && st.r_reveal) ? constrain((PM_simTimeMs - 700) / 900, 0, 1) : 1;
    rr = { r: c.r, i: c.i, reveal: rev, heat: constrain((c.i * c.i * c.r) / 4.5, 0, 1) };
  }
  drawEmfCell(g, c.eps, 1, !c.swOpen, rr);
```
(`heat` normalizes to 1.0 exactly at short circuit: i²r = 3.0² × 0.5 = 4.5 W. States WITHOUT `show_r`/`r_reveal` — S1's mystery pose — pass `rr = null` and get the untouched D1 cell.)

- [ ] **Step 3: tsc + render both concepts.** Run:
```bash
npx tsc --noEmit
npm run visual:eyes -- internal_resistance
npm run visual:eyes -- emf_definition
```
Expected: tsc 0. internal_resistance STATE_1 shows the opened casing + orange zigzag + `r = 0.5 Ω` + `i·r = 0.50 V`. **emf_definition: all 6 baselines still PASS (0 H2 fails)** — the optional-arg claim proven early.

- [ ] **Step 4: Commit.**
```bash
git add src/lib/renderers/particle_field_renderer.ts
git commit -m "feat(internal_resistance): drawEmfCell r-reveal extension (hidden r + i*r label + heat halo)"
```

---

### Task 4: Ladder internal step + charging profile (`drawPotentialLadder` optional arg)

**Files:**
- Modify: `src/lib/renderers/particle_field_renderer.ts` (`drawPotentialLadder` ~line 1741; `drawIrScenario`)

**Interfaces:**
- Produces: `drawPotentialLadder(eps, i, R, swOpen, dim, traceS, holdPulse, prof, ir)` where `ir` (optional) = `{ mode:'discharge'|'open'|'charging', r:number, epsCh:number, V:number }`. `ir` absent ⇒ pixel-identical D1 profile.
- Consumes: `dimFor('ladder')`, `dimFor('r_internal')`.

- [ ] **Step 1: Extend `drawPotentialLadder`** — add the trailing param; at the top of the staircase-drawing section branch on `ir`:
```javascript
function drawPotentialLadder(eps, i, R, swOpen, dim, traceS, holdPulse, prof, ir) {
  // ... existing panel/axes setup UNCHANGED (vmax line becomes:) ...
  var vmax = (ir && ir.mode === 'charging') ? ir.epsCh * 1.15 : eps * 1.2;
  // ... py(), axes, eps reference line UNCHANGED ...
  if (ir && ir.mode === 'charging') {
    // charger lifts to epsCh -> down i*R across the series R -> cell band: down eps (stored) + down i*r (heat)
    var lD = dimFor('ladder'), rD = dimFor('r_internal');
    var xq = gx, x1 = gx + gw * 0.36, x2 = gx + gw * 0.52, x3 = gx + gw * 0.66, x35 = gx + gw * 0.80, x4 = gx + gw * 0.90, xe2 = gx + gw;
    var vTop = ir.epsCh, vMid = ir.epsCh - i * R;             // = V across the cell = eps + i*r
    strokeHex('#4DD0E1', 0.98 * lD); strokeWeight(2.5); noFill();
    beginShape();
    vertex(xq, py(0)); vertex(xq, py(vTop));                  // charger riser
    vertex(x1, py(vTop));                                     // flat
    vertex(x2, py(vMid)); vertex(x3, py(vMid));               // down i*R across the series R, flat
    vertex(x35, py(i * ir.r));                                // down eps INSIDE the cell (stored as chemistry)
    endShape();
    strokeHex('#FF8A65', 0.98 * rD); strokeWeight(2.5); noFill();
    beginShape(); vertex(x35, py(i * ir.r)); vertex(x4, py(0)); endShape();   // down i*r (heat) — highlighted
    strokeHex('#4DD0E1', 0.98 * lD); strokeWeight(2.5); noFill();
    beginShape(); vertex(x4, py(0)); vertex(xe2, py(0)); endShape();
    noStroke(); fillHex('#B39DDB', 0.95 * dim); textSize(10); textStyle(BOLD); textAlign(LEFT, BOTTOM);
    text('V = ' + ir.V.toFixed(2) + ' V', x3 + 2, py(vMid) - 3);              // terminal-to-terminal across the cell
    fillHex('#FF8A65', 0.9 * rD); textAlign(LEFT, TOP); text('i\\u00B7r', x35 + 2, py(i * ir.r) + 2);
    fillHex('#B0BEC5', 0.85 * dim); textSize(9); textStyle(NORMAL); textAlign(CENTER, TOP);
    text('charger', xq + gw * 0.18, gy + 3); text('R', (x2 + x3) / 2 - gw * 0.08, gy + 3); text('cell', (x3 + x4) / 2, gy + 3);
    textStyle(NORMAL);
  } else if (ir) {
    // discharge/open: up eps at the cell, down i*r STILL INSIDE the cell band, flat at V, down V across the load
    var lD2 = dimFor('ladder'), rD2 = dimFor('r_internal');
    var xb = gx + gw * 0.13;
    var vT = eps - i * ir.r;                                  // terminal voltage (= eps when i = 0)
    noStroke(); fill(60, 40, 30, 60 * dim); rect(gx, y0 + 20, gw * 0.13, h - padB - 20 - 18);   // 'inside the cell' shading
    strokeHex('#4DD0E1', 0.98 * lD2); strokeWeight(2.5); noFill();
    beginShape(); vertex(gx, py(0)); vertex(gx, py(eps)); endShape();          // the eps riser (the lift)
    strokeHex('#FF8A65', 0.98 * rD2); strokeWeight(2.5); noFill();
    beginShape(); vertex(gx, py(eps)); vertex(xb, py(vT)); endShape();         // the INTERNAL step — highlighted
    strokeHex('#4DD0E1', 0.98 * lD2); strokeWeight(2.5); noFill();
    beginShape();
    vertex(xb, py(vT)); vertex(xc, py(vT));                                    // flat at V along the wire
    vertex(xd, py(0)); vertex(xe, py(0));                                      // down V across the load
    endShape();
    noStroke(); fillHex('#4DD0E1', 0.98 * lD2); textSize(11); textStyle(BOLD); textAlign(LEFT, BOTTOM);
    text('\\u03B5 = ' + eps.toFixed(1) + ' V', gx + 4, py(eps) - 4);
    if (i > 0.02) {
      fillHex('#FF8A65', 0.95 * rD2); textSize(10); textAlign(LEFT, TOP);
      text('i\\u00B7r = ' + (i * ir.r).toFixed(2) + ' V', xb + 3, py((eps + vT) / 2) - 5);
      fillHex('#B39DDB', 0.95 * dim); textAlign(RIGHT, BOTTOM);
      text('V = ' + vT.toFixed(2) + ' V', xc, py(vT) - 3);
    }
    fillHex('#B0BEC5', 0.85 * dim); textSize(9); textStyle(NORMAL); textAlign(CENTER, TOP);
    text('cell', gx + gw * 0.07, gy + 3); text('load', (xc + xd) / 2, gy + 3);
    textStyle(NORMAL);
  } else {
    // ... the ENTIRE existing D1 staircase + labels block UNCHANGED ...
  }
  // ... existing holdPulse + traceS blocks stay inside the D1 (else) branch; title text UNCHANGED ...
}
```
(Move nothing in the D1 branch — wrap it as the `else`. When `i = 0` the discharge profile degenerates to flat-at-ε, matching D1's open pose by construction. `xc`/`xd`/`xe`/`gy`/`y0`/`h`/`padB` are the function's existing locals.)

- [ ] **Step 2: Call from `drawIrScenario`** (after the voltmeter block):
```javascript
  if (st && st.show_ladder) {
    drawPotentialLadder(c.eps, c.i, c.R, c.swOpen, 1, null, 0, null,
      { mode: c.mode, r: c.r, epsCh: c.epsCh || 0, V: c.Vterm });
  }
```

- [ ] **Step 3: tsc + render both concepts.** Run:
```bash
npx tsc --noEmit
npm run visual:eyes -- internal_resistance
npm run visual:eyes -- emf_definition
```
Expected: tsc 0. STATE_1 dense frame ≥2500ms: ladder shows ε riser 1.5, orange internal step down to 1.0, flat at `V = 1.00 V`, drop across load. STATE_2: charger riser to 3.0, down 1.0 across R, cell band drops with the orange `i·r` tail, `V = 2.00 V` label. **emf_definition still 0 baseline fails.**

- [ ] **Step 4: Commit.**
```bash
git add src/lib/renderers/particle_field_renderer.ts
git commit -m "feat(internal_resistance): potential-ladder internal step + charging profile (optional arg, D1 branch untouched)"
```

---

### Task 5: `drawChargerC` + charging polish

**Files:**
- Modify: `src/lib/renderers/particle_field_renderer.ts` (append near `drawEmfCell`; `drawIrScenario`)

**Interfaces:**
- Produces: `drawChargerC(g, epsCh, dim)` — ideal second source on the loop's right edge.
- Consumes: `dimFor('charger')` (keyed in Task 6).

- [ ] **Step 1: Add the primitive:**
```javascript
// The external charger — an ideal second source on the RIGHT edge of the loop,
// strong enough (3.0 V > eps) to force current BACKWARDS through the cell.
function drawChargerC(g, epsCh, dim) {
  var cx = g.rightX, cy = g.midY;
  fill(10, 12, 28, 235); noStroke(); rectMode(CENTER); rect(cx, cy, 26, 44, 4); rectMode(CORNER);
  strokeHex('#ECEFF1', 0.92 * dim); strokeWeight(2); line(cx, cy - 16, cx, cy + 16);   // long plate
  strokeWeight(6); line(cx + 9, cy - 8, cx + 9, cy + 8);                                // short plate
  noStroke(); fillHex('#66BB6A', 0.95 * dim); textSize(11); textStyle(BOLD); textAlign(RIGHT, CENTER);
  text('charger ' + epsCh.toFixed(1) + ' V', cx - 16, cy); textStyle(NORMAL);
}
```

- [ ] **Step 2: Wire it in `drawIrScenario`** (after the cell call):
```javascript
  if (st && st.charging) drawChargerC(g, c.epsCh, dimFor('charger'));
```

- [ ] **Step 3: tsc + render.** Run `npx tsc --noEmit` then `npm run visual:eyes -- internal_resistance`. Expected: STATE_2 shows the charger on the right edge, green label, beads reversed, `V = 2.00 V`.

- [ ] **Step 4: Commit.**
```bash
git add src/lib/renderers/particle_field_renderer.ts
git commit -m "feat(internal_resistance): drawChargerC second source (charging state)"
```

---

### Task 6: Glow keys + two_reading beat + readout panel

**Files:**
- Modify: `src/lib/renderers/particle_field_renderer.ts` (`drawIrScenario`; `updateReadouts` ~line 667–724; the R-tracking guard ~line 684)

**Interfaces:**
- Produces: `r_internal` + `charger` live as dim call-sites (Tasks 3–5 already call `dimFor` with them — this task verifies + adds the remaining sites); the S5 `two_reading` on-canvas sequence; ε/r/V/i readout; slider-row autosweep tracking for ir.
- Consumes: `irCurrents`, `dimFor`, `fmtNum`.

- [ ] **Step 1: Verify the glow keys are real call-sites.** Grep `dimFor('r_internal')` and `dimFor('charger')` — Tasks 3/4/5 introduced them. The glow "enum" IS the set of dim call-sites; a `glow_focal: "r_internal"` now brightens the r zigzag + internal ladder step while dimming peers. Confirm `dimFor('switch')` exists (combination call-site) — `drawIrSwitch` already uses it.

- [ ] **Step 2: Add the `two_reading` on-canvas sequence to `drawIrScenario`:**
```javascript
  if (st && st.two_reading) {
    var bx3 = width * 0.28, by3 = height * 0.84;
    fillHex('#CFD8DC', 0.95); textSize(13); textStyle(BOLD); textAlign(LEFT, CENTER);
    if (PM_simTimeMs < 2500) {
      text('reading 1 \\u2014 open:  V = \\u03B5 = ' + c.eps.toFixed(2) + ' V', bx3, by3);
    } else {
      text('reading 2 \\u2014 closed:  V = ' + c.Vterm.toFixed(2) + ' V   at   i = ' + c.i.toFixed(2) + ' A', bx3, by3);
      if (PM_simTimeMs >= 3600) {
        fillHex('#FF8A65', 0.98);
        text('r = (\\u03B5 \\u2212 V) / i = (' + c.eps.toFixed(2) + ' \\u2212 ' + c.Vterm.toFixed(2) + ') / ' + c.i.toFixed(2) + ' = ' + ((c.eps - c.Vterm) / max(c.i, 1e-6)).toFixed(1) + ' \\u03A9', bx3, by3 + 20);
      }
    }
    textStyle(NORMAL);
  }
```
(Reading 1 shows ε because `irSwitchOpen()` holds the loop open until 2500ms in this state; after the close + 800ms ramp, V settles at 1.00 and i at 1.00 → the r line computes 0.5 Ω exactly. ONE-shot sequence, never a cycle — the resistivity `material_cycle` scar.)

- [ ] **Step 3: Extend `updateReadouts`.**
  - Change the ohms-only R-tracking guard (~line 684) from `!emfMode()` to `!emfMode() && !irMode()` (it calls ohms_law's `plotR()`).
  - Add ir slider-row tracking + the readout branch (before the `emfMode()` readout branch):
```javascript
  if (irMode() && hasSlider('R') && !userTouched['R'] && curState() && curState().R_autosweep_down) {
    var rSwEl = document.getElementById('pm-sv-R');            // R row tracks the S3/S4 auto-sweep
    if (rSwEl) { var rdd = defs.R || {}; rSwEl.textContent = (Math.round(cIrLoadR() * 100) / 100) + (rdd.unit ? (' ' + rdd.unit) : ''); }
  }
  if (irMode() && hasSlider('switch') && !userTouched['switch'] && curState() && (curState().droop_intro || curState().two_reading)) {
    var swIrEl = document.getElementById('pm-sv-switch');      // switch row tracks the cued close
    if (swIrEl) swIrEl.textContent = irSwitchOpen() ? 'Open' : 'Closed';
  }
```
  and in the `pm-readout` chain:
```javascript
    if (irMode()) {                                           // internal_resistance: eps, r, V, i
      var ic2 = irCurrents();
      ro.textContent = '\\u03B5 = ' + ic2.eps.toFixed(1) + ' V\\n' +
                       'r = ' + ic2.r.toFixed(1) + ' \\u03A9\\n' +
                       'V = ' + ic2.Vterm.toFixed(2) + ' V\\n' +
                       'i = ' + ic2.i.toFixed(2) + ' A';
    } else if (emfMode()) { ... existing ... }
```

- [ ] **Step 4: tsc + render.** Run `npx tsc --noEmit` then `npm run visual:eyes -- internal_resistance`. Expected: tsc 0; readout shows 4 lines; no silent panel-dim on either stub state.

- [ ] **Step 5: Commit.**
```bash
git add src/lib/renderers/particle_field_renderer.ts
git commit -m "feat(internal_resistance): two-reading beat + eps/r/V/i readout + ir autosweep row tracking"
```

---

### Task 7: THE EYE bring-up (deriveStateMeta pins) + emf regression gate

**Files:**
- Modify: `src/lib/validators/visual/deriveStateMeta.ts` (`pfRevealMs` ~line 404–428)

**Interfaces:**
- Produces: `__frozen` pins landing AFTER each ir one-shot settles; D5 motion truth for all ir states.

- [ ] **Step 1: No-race check on deriveStateMeta.** `git status --short src/lib/validators/visual/deriveStateMeta.ts` — expect clean or own-session edits only.

- [ ] **Step 2: Add the ir reveal pins to `pfRevealMs`** (after the `emf_autosweep` line ~426):
```typescript
    // internal_resistance: cued one-shots (S1 switch-close 1500, S5 two-reading close 2500
    // + result line 3600, S2 r-reveal 700+900, S3/S4 R sweep 700+3200) — pin the frozen
    // frame past each settle (+800ms current ramp where the switch closes).
    if (state.droop_intro === true) maxMs = Math.max(maxMs, 1500 + 800 + 400);
    if (state.two_reading === true) maxMs = Math.max(maxMs, 3600 + 400);
    if (state.r_reveal === true) maxMs = Math.max(maxMs, 700 + 900 + 400);
    if (state.R_autosweep_down === true) maxMs = Math.max(maxMs, 700 + 3200 + 400);
```

- [ ] **Step 3: Motion truth check.** The pfMotion branch (~line 90–102) declares motion unless `motion === false || open_circuit === true`. No ir state authors `open_circuit` (S1/S5 open phases are cue-driven one-shots inside moving states), so ALL ir states declare motion — correct: beads move in every state after its cue. No edit needed; verify by reading the branch.

- [ ] **Step 4: Full render + regression.** Run:
```bash
npx tsc --noEmit
npx tsx src/scripts/_seed_internal_resistance_cache.ts
npm run visual:eyes -- internal_resistance
npm run visual:eyes -- emf_definition
```
Expected: stub states render with `__frozen` on settled content (STATE_1 frozen at ≥2700ms: needle at 1.00 V, ladder stepped); **emf_definition 26/26 with 0 baseline fails** (Phase-A regression gate). If Supabase fetch flakes, curl bypass + retry.

- [ ] **Step 5: Commit.**
```bash
git add src/lib/validators/visual/deriveStateMeta.ts
git commit -m "feat(internal_resistance): THE EYE bring-up — pfRevealMs pins for droop/two-reading/r-reveal/R-sweep"
```

> **Phase A gate:** ir scenario renders droop, hidden r, internal ladder step, charger reversal, two-reading sequence; tsc 0; THE EYE runs clean on the stub; emf_definition baselines untouched. Ready to author.

---

## Phase B — Alex authoring pipeline (sequential; never parallel)

### Task 8: Architect skeleton

- [ ] **Step 1: Dispatch `architect`** with: concept_id `internal_resistance`, chapter 3, the approved spec path `docs/superpowers/specs/2026-07-10-internal-resistance-design.md`, and the D1 skeleton `.agents/proof_run/emf_definition_skeleton.md` as the shape reference. Require the 9-section skeleton to match the spec exactly: **7 states** per spec §6 (S1 close-and-droop → S2 reveal-interior PRIMARY aha → S3 ramp-droop → S4 collapse-extreme → S5 measure-compare → S6 reverse-flow → S7 sandbox), the Rule 31 control table, the S3↔S6 declared contrast pair, 3 misconception pivots (S1/S2 primary "a 1.5 V cell always delivers 1.5 V", S4 "short = infinite current", S6 "V can never exceed ε"), `entry_state_map` (foundational S1–S3), prerequisites `[emf_definition, ohms_law]`, the UNIVERSAL anchors (spec §9 — Rule 35, car-headlights primary), locked numbers (spec §4). OMIT epic_c_branches + mode_overrides.
- [ ] **Step 2: Save** to `.agents/proof_run/internal_resistance_skeleton.md`.
- [ ] **Step 3: Verify** skeleton arc == spec §6 (7 states, pair, explore-last, glow names ⊂ the closed set). Re-dispatch with the delta named if it drifts. Commit:
```bash
git add .agents/proof_run/internal_resistance_skeleton.md
git commit -m "feat(internal_resistance): architect skeleton (7 states, S2 primary aha, S3<->S6 contrast pair)"
```

### Task 9: Physics block

- [ ] **Step 1: Dispatch `physics_author`** with the skeleton + spec §4/§5. Require: variables `emf` (V, 1–12, 0.1, default 1.5), `r` (Ω, 0.1–2, 0.1, default 0.5), `R` (Ω, 0.25–12, 0.25, default 1.0), `switch` (0/1); formulas `i = ε/(R+r)`, `V = ε − i·r` (discharge), `V = ε` (open), `i_max = ε/r` (short), `i = (ε_ch − ε)/(R+r)` + `V = ε + i·r` (charging, ε_ch = 3.0 fixed); every spec-§4 worked number re-derived and verified; per-state motion timeline + control spec (S3 exposes R; S5 exposes switch; S7 all; others none); per-state numeric locks; the two-reading arithmetic; the honesty constraint "open circuit V = ε holds for ANY cell". 45 drill-down phrases across the clusters. Board mark schemes deferred.
- [ ] **Step 2: Append** to `.agents/proof_run/internal_resistance_skeleton.md` (D1 kept a separate `_physics_block.md` — either file shape is fine, name it in the dispatch). Verify units + numbers. Commit:
```bash
git add .agents/proof_run/internal_resistance_skeleton.md .agents/proof_run/internal_resistance_physics_block.md
git commit -m "feat(internal_resistance): physics block (locked numbers, per-state locks + controls)"
```

### Task 10: JSON author + registration

- [ ] **Step 1: Dispatch `json_author`** with skeleton + physics block + this plan's Task 1 stub path. It OVERWRITES the stub with the final `src/data/concepts/internal_resistance.json`: all 7 states, `text_en` 25–55 words/state, per-state `visible_controls` (S1/S2/S4/S6 `[]`; S3 `["R"]`; S5 `["switch"]`; S7 `show_sliders: true`), state flags per spec §5.7 (S1 `droop_intro` + `show_voltmeter` + `show_ladder`; S2 `r_reveal` + `show_r` + ladder+voltmeter; S3 `R_autosweep_down` + `R_autosweep_to: 0.25` + `show_r` + ladder; S4 `R_autosweep_down` + `R_autosweep_to: 0` + `short_circuit` + `show_r` + ladder+voltmeter; S5 `two_reading` + `show_r` + voltmeter (+ladder); S6 `charging` + `show_r` + ladder+voltmeter; S7 all overlays + sliders), numeric locks (`emf`/`r`/`R`/`switch`) on every guided state, **every glow name ⊂ the closed set** (Global Constraints), formula_overlay per state (spec §11: `V < ε` / `V = ε − ir` / `i_max = ε/r` / `r = (ε−V)/i` / `V = ε + ir`), aha_moment on STATE_2.
- [ ] **Step 2: Complete registration:** `CLASSIFIER_PROMPT` + `ASPECT_VOCABULARY` in `intentClassifier.ts`; confirm `PCPL_CONCEPTS` N/A; author `supabase_migrations/supabase_2026-07-10_seed_internal_resistance_clusters_migration.sql` (authored-not-applied).
- [ ] **Step 3: Iterate to green:**
```bash
npx tsc --noEmit
npm run validate:concepts
```
Expected: tsc 0; `internal_resistance` PASSES all gates (12/13/19…). Fix until green.
- [ ] **Step 4: Commit.**
```bash
git add src/data/concepts/internal_resistance.json src/lib/intentClassifier.ts supabase_migrations/supabase_2026-07-10_seed_internal_resistance_clusters_migration.sql
git commit -m "feat(internal_resistance): final concept JSON + registration (7 states, real cell)"
```

---

## Phase C — THE EYE + audit + approval + ship

### Task 11: THE EYE + eye-walker (+ emf regression)

- [ ] **Step 1: Re-seed + run THE EYE on BOTH concepts:**
```bash
npx tsx src/scripts/_seed_internal_resistance_cache.ts
npm run visual:eyes -- internal_resistance
npm run visual:eyes -- emf_definition
```
- [ ] **Step 2: Dispatch `eye-walker`** (never read ~100 PNGs in the main session) → per-state verdict table + ≤5 frames for founder + candidate `engine_bug_queue` rows. Judge from `__frozen` frames. Checklist per state: S1 needle visibly droops 1.50→1.00 AFTER the switch closes (cause-first); S2 r + internal step legible, single focal; S3 droop grows, numbers hit 2.0 A / 0.50 V at settle; S4 heat halo + `i_max = 3.0 A`, V = 0; S5 the two readings + the r = 0.5 Ω line; S6 beads REVERSED + `V = 2.00 V` above ε; S7 all controls live.
- [ ] **Step 3: Zero-new-bug gate.** Rendering defects → fix in Phase A files (no-race rules); content defects → route to json_author/physics_author/architect. Re-run until zero new `engine_bug_queue` rows AND emf_definition keeps 0 baseline fails.
- [ ] **Step 4: Commit fixes (named files only).**

### Task 12: Quality auditor

- [ ] **Step 1: Dispatch `quality-auditor`** (Opus pin; gates 0–20; dev server on localhost:3000). Flag in the dispatch: confusion_cluster_registry Gate-8 probe = N/A-DORMANT (migration authored-not-applied); Rule 33 N/A per spec §8 (the ladder IS the mechanism view — pre-empt a false-FAIL).
- [ ] **Step 2: Address FAILs** via its routing. Re-run until PASS. Commit.

### Task 13: Founder review gate

- [ ] **Step 1: Build + serve:**
```bash
npm run build:review -- internal_resistance
```
Serve detached on **8091** (8080 is the pilot server; pilot builds PRUNE non-pilot folders — the emf_definition session's scar) and hand the founder **http://localhost:8091/internal_resistance/**.
- [ ] **Step 2: STOP for founder visual approval.** No TTS without an explicit approval statement. On approval: `npm run visual:approve -- internal_resistance` (founder-triggered).

### Task 14: EN+TE audio (post-approval ONLY)

- [ ] **Step 1: Rule 30g translation** — dump every state's `text_en` → a `model: sonnet` subscription sub-agent returns code-mixed `text_te` (+ `text_hi` text-only) under Rule 30 constraints (technical terms Latin, never transliterate, bare symbols expanded, colour words English). Write structurally into the JSON. **NEVER `npm run tts:translate`.**
- [ ] **Step 2: Voice EN+TE:**
```bash
npm run tts:generate -- internal_resistance --langs=en,te
```
(hash-aware; never `--force`; no Hindi audio.)
- [ ] **Step 3: Verify + rebuild:**
```bash
npm run build:review -- internal_resistance
```
Expected: manifest EN+TE complete, **stale-clips 0**, HTTP 200, validate PASS. Telugu = DRAFT until native review.
- [ ] **Step 4: Commit final JSON + baselines; update `PROGRESS.md`** (CLAUDE.md §9).

---

## Self-Review (against the spec)

**Spec coverage:** §2 atomic claim (all four limits) → Tasks 2 (physics) + 10 (states); §3 representation + two-reading → Tasks 3/4/6; §4 locked numbers → Global Constraints + Tasks 2/9; §5.1–5.7 engine additions → Tasks 2–7 (family gate T2, cell r-reveal T3, ladder T4, charger T5, glow keys+flags+readout T6, deriveStateMeta T7); §6 state arc → Tasks 8/10; §7 misconceptions → Tasks 8/10; §8 Rule-33 N/A → Task 12 dispatch note; §9 anchors → Task 8; §10 registration → Tasks 1 (3 sites) + 10 (rest); §11 DoD → Tasks 11–14 (incl. the emf pixel-regression in Tasks 3/4/7/11). No gaps.

**Placeholder scan:** only intentional stub is Task 1's disposable JSON (overwritten in Task 10). All engine steps carry real code; no "TBD"/"similar to Task N" hand-waves (Task 4 names the D1 branch as the `else` — the code being preserved, not written).

**Type consistency:** `irCurrents()` returns `{eps,r,R,i,swOpen,Vterm,mode,epsCh?}` and Tasks 3/4/5/6 consume exactly those keys (`c.r`, `c.i`, `c.Vterm`, `c.mode`, `c.epsCh`). `drawEmfCell(g,eps,dim,pumpActive,rr)` with `rr = {r,i,reveal,heat}` matches its Task-3 call-site. `drawPotentialLadder(...,ir)` with `ir = {mode,r,epsCh,V}` matches Task 4's call. `dir` on the bead config matches `circuitBeadS`. Glow keys `r_internal`/`charger`/`switch` are dim call-sites before the JSON references them (Task 10).
