# ARCHITECT SKELETON — `potentiometer`

**Chapter:** 3 (Current Electricity) · **Catalog node:** c23 · **Atomic:** A24 (`potentiometer_principle`) · **Renderer:** `particle_field` (2D circuit family — NOT field_3d, NOT PCPL) · **Tier:** medium (5 states) · **Date:** 2026-07-13
**Source of truth:** `docs/superpowers/specs/2026-07-13-potentiometer-design.md` (APPROVED — this skeleton implements it without deviation).
**Siblings:** `wheatstone_bridge` (c20, shipped 2026-07-12 — the SAME `drawGalvanometerC` null needle, the same gated-topology engine discipline; potentiometer's `topology:"wire"` mirrors its `topology:"bridge"` flag shape exactly) + `kirchhoff_loop_rule_KVL` (c16 — the emf-family potential-drop / voltmeter pattern) + `emf_definition` / `internal_resistance` (c11/c12 — the E vs E−Ir machinery S4 leans on). Second of the founder's **lab trio** (Wheatstone c20 → **potentiometer c23** → meter bridge).

---

## 1. Atomic claim

This concept teaches ONE idea: a **potentiometer measures a cell's true EMF by nulling** — a driver cell sends a steady current down a long uniform wire so the potential drops **uniformly** along it (a gradient **k = V/L**); a sliding jockey taps the drop from the start of the wire to itself (**k·l**), and when that tapped drop exactly equals the tested cell's EMF the galvanometer reads **zero** — **E = k·l**, with the balance length **directly proportional to EMF** — and because at balance **no current is drawn from the tested cell**, the reading is the **true EMF**, which a voltmeter can never give (it draws current through the cell's internal resistance and reads the smaller terminal voltage E − Ir). It does NOT cover: comparing two EMFs E₁/E₂ = l₁/l₂ (atomic **A25** — downstream diamond, natural drill-down pointer only), measuring internal resistance r = R(l₁−l₂)/l₂ (atomic **A26** — its own diamond), the meter bridge (the third lab-trio member, own apparatus), or galvanometer internals / sensitivity, end-errors, and driver-rheostat calibration of k (drill-down candidates only, never guided states).

## 2. State count + EPIC-L arc — 5 states (4 guided + explore)

| State | Purpose (one line) | teaching_method |
|---|---|---|
| S1 | Steady driver current ⇒ the potential drops EVENLY along the wire — a gradient k = V/L, drawn as a linear ramp above the wire | *(straightforward motion beat)* |
| S2 | The jockey taps the drop A→J (= k·l); when k·l ≠ E the galvanometer deflects | *(straightforward motion beat)* |
| S3 | **NULL (PRIMARY aha) + misconception beat #1**: slide to k·l = E → needle dead centre, E = k·l, and the tap branch carries ZERO current — the cell is measured undisturbed | `misconception_confrontation` (Rule 16a straightforward contrast — NO predict-pause) |
| S4 | **True EMF vs voltmeter + misconception beat #2**: a voltmeter across the same cell draws current and droops to E − Ir ≈ 1.35 V; the null still reads exactly 1.50 V | `misconception_confrontation` (Rule 16a straightforward contrast) |
| S5 | Explore: tested E / driver voltage / jockey all live; balance it yourself, watch l ∝ E | `exploration_sliders` |

The hook MOVES from t=0: S1 opens with driver beads already flowing A→C and the gradient ramp filling in above them. No static setup state. **State 2 → State 3 is the DECLARED Rule-31 contrast pair** (same jockey + same galvanometer instrument; the flip = jockey slides OFF balance and the needle swings, vs jockey slides back TO balance and the needle collapses to the null — only jockey position moves).

## 3. Per-state control table (Rule 31 — FIRST design artifact)

Narration 25–55 EN words/guided state (>55 split, <~20 merge); motion may outrun narration, never the reverse; no archetype repeat except the declared S2↔S3 pair; no static state; explore-last.

| # | Teaches (one idea) | Motion archetype | Distinct motion (what animates, how it differs) | Delta cue (≤5w, Rule 32c) | Live controls | Words | Dwell |
|---|---|---|---|---|---|---|---|
| S1 | Steady current ⇒ uniform potential drop; k = V/L | **gradient-fill** *(coinage — the circuit-family realization of `reveal-build`: the taught object is a RAMP composing along a length, tracking the already-flowing beads — distinct from the bridge's split-flow because the route is one straight wire and the reveal is the potential picture above it)* | Driver beads flow steadily A→C from t=0 (top loop through ε_d); the linear potential ramp fills in above the wire left→right (3 V at A sloping to 0 at C); `k = 3 V/m` readout composes. Full apparatus visible in home pose — tested cell E + galvanometer G in the tap branch, jockey parked at l = 0.5 m, needle quiet at dead centre (physically TRUE null, uncommented — nothing pre-spoiled, no untaught deflection on screen; bridge-S1 precedent). No tap-branch readouts yet. | "Potential drops evenly" | none (watch-this beat) | ~40 | ~14 s (≥1 full bead run) |
| S2 | The jockey taps the drop A→J = k·l; k·l ≠ E ⇒ deflection | **jockey-slide-needle-deflect** *(coinage — a sliding-tap instrument-response beat: the taught motion IS a contact moving along a length and the dial answering the mismatch; distinct from the bridge's needle-deflect because the CAUSE is a position, not a resistor value)* | CAUSE first: jockey J visibly slides 0.5 → 0.7 m along the wire; readable beat; `l = 0.70 m` and tapped-drop `k·l = 2.10 V` readouts light beside the fixed `E = 1.50 V`; beads APPEAR in the tap branch; needle swings off-centre (∝ k·l − E = +0.6 V). First tap-branch numbers on screen. | "Jockey taps the drop" | jockey (live after the slide) | ~45 | ~15 s |
| S3 | **NULL (PRIMARY aha) + beat #1** — k·l = E ⇒ needle nulls, E = k·l, zero cell current | **jockey-slide-to-null** — DECLARED contrast pair with S2 (same slide + same instrument; flip = the deflection collapsing to the null) | CAUSE = continuous jockey sweep 0.7 → 0.5 m; `k·l` ticks 2.10 → 1.50 V toward the pinned `E = 1.50 V`; tap-branch beads thin and drain to NONE; needle sweeps to dead centre and STOPS; `E = k·l = 1.50 V` composes + `i = 0` lights on the tap branch — while the wire's driver beads keep flowing throughout (the gradient is undisturbed). Sweep lands settled for the frozen frame (engine note below). | "Drop equals EMF → zero" | jockey (live after the sweep) | ~50 | ~18 s |
| S4 | **True EMF vs voltmeter + beat #2** — a voltmeter loads the cell (reads E − Ir); the null draws zero | **droop-vs-null** *(coinage — the measurement-contrast realization of `null-result-hold`: a second instrument connects and visibly DROOPS while the watched null deliberately refuses to move; two readings of the same cell, one wrong)* | Jockey stays pinned at the l = 0.5 m null (needle 0°, `E = k·l = 1.50 V` holding). CAUSE first: a voltmeter V connects across the tested cell (the compare toggle); readable beat; beads flow through the cell + voltmeter loop (the cell now WORKS); the cell's internal `r` labels in; the V dial droops to `1.35 V`; the compare readout composes `V_meter = 1.35 V vs E = 1.50 V`. The potentiometer side never moves — its stillness IS the effect. | "Voltmeter loads, null doesn't" | compare toggle (voltmeter on/off) | ~50 | ~16 s |
| S5 | Explore | **free-explore** (the circuit-family drag-sandbox) | Teacher drags tested E, driver voltage ε_d, and jockey l freely; needle, ramp slope, `k`, `k·l`, `l`, balance state all track continuously; re-null after every change and watch the balance length track l = E/k (l ∝ E at fixed k); needle reverses direction on either side of the null (centre-zero — the classic lab cue); runs forever (Rule 37 player invariant — author `interaction_complete`, nothing else special). | "You balance it" | ALL: E, ε_d (driver), jockey (`show_sliders: true`) | 0/open | open |

**advance_mode:** `manual_click` ×4 guided + `interaction_complete` explore (Gate 12 ≥2 distinct; never `wait_for_answer`, never all-auto; per wheatstone/KCL/KVL precedent).

**Rule 32 legibility plan:** 32a cause-first — S2: jockey slides FIRST → beat → readouts → tap beads → needle; S3: the jockey sweep is the continuous cause, k·l/beads/needle track it; S4: the voltmeter CONNECTS first → beat → cell beads flow → dial droops → compare readout; the null side's non-motion is the effect. 32b one-variable — S1 only the ramp reveal (beads are home-pose baseline); S2/S3 only jockey position; S4 only the voltmeter connection (jockey pinned); continuous driver-bead circulation is the home-pose baseline in every state, not a violation; S5 exempt. 32c — the delta cues above ship VERBATIM as each state's on-canvas caption (Rule 34a: caption = cue only; prose narration in the subtitle strip below the canvas). 32d home pose — ONE apparatus persists across all 5 states: horizontal wire A (left) → C (right); driver cell ε_d + outer loop on TOP; gradient ramp above the wire; jockey J on the wire; tested cell E + galvanometer G in the tap branch from A down to J; voltmeter parked disconnected until S4; states change only jockey position / readouts / the voltmeter connection — no teleport-rebuild. 32e single glow focal per state (KEYED — non-keyed or per-sentence glow silently dims the panel, recorded ohms_law scar): S1 `gradient` (in-engine key addition ONLY if needed — `dimFor()` is dynamically keyed, one call inside the ramp draw, per the bridge's `galvanometer` precedent; fallback `electrons`) → S2 `galvanometer` (reused key, shipped in c20) → S3 `galvanometer` (contrast pair shares the focal, wheatstone precedent) → S4 `formula` → S5 none.

**Rule 33 dual-level:** macro = the wire + jockey + driver/tested cells + the galvanometer needle (the tracking indicator, 33d) + the balance-length/gradient/tapped-drop numeric readouts + the S4 voltmeter dial; micro = current beads — steady driver stream along the wire in every state, tap-branch beads that appear off-balance and drain to ZERO at balance, and (S4 only) beads through the cell + voltmeter loop. Same frame, no split canvas — the gradient ramp IS the "potential per length" story co-located with the carriers.

**Physics (spec §4 — founder-approved, BINDING; physics_author finalizes only what's marked):** driver ε_d = **3 V** across wire length L = **1 m** ⇒ gradient **k = 3 V/m** (0.03 V/cm; idealize the driver loop delivering the full 3 V across the wire — physics_author declares the idealization). Tested cell **E = 1.5 V** ⇒ balance at **l = 0.5 m** (clean midpoint): k·l = 3 × 0.5 = 1.50 V = E ✓, needle null, tap current = 0 (EXACT at balance for ANY galvanometer resistance — same rigor point as the bridge). S2 unbalanced: l = **0.7 m** ⇒ k·l = **2.10 V** > E ⇒ needle deflects ∝ +0.6 V (suggest K_NEEDLE ≈ 60 °/V clamp ±60° → +36° at S2, 0° at S3 — calibration renderer-tunable if the checkpoints hold; physics_author final). S4 voltmeter contrast: exemplar r = 1 Ω, R_v = 9 Ω ⇒ I = E/(r+R_v) = 0.15 A ⇒ V = E − Ir = **1.35 V** < 1.50 V (physics_author picks final r/R_v for a legible droop ~1.35 V — the spec's number). Away from balance the tap current is kept qualitative (beads + needle only — high-resistance-galvanometer idealization; NEVER print a fabricated precise tap amperage; the bridge's exact-vs-idealized boundary applies verbatim). Explore honesty: if ε_d < E then k·L < E and the null is UNREACHABLE — needle stays deflected at every l — EXPECTED honest lab behavior ("the driver EMF must exceed the tested EMF"), never a forced null.

## 4. Misconception confrontation plan (Rule 16a) — TWO pivots, STATE_3 + STATE_4 ONLY

`misconception_watch` fires at exactly two genuine pivots — never per-state (founder guardrail 2026-07-04):

1. **STATE_3 — "The jockey/galvanometer draws current from the cell like any meter."** visual_counter: as the jockey sweeps to balance the tap-branch beads visibly drain to NONE and `i = 0` lights — while the wire's driver beads keep streaming past the jockey the whole time. one_line_fix: "At balance the wire's tapped drop exactly opposes the cell — zero current is drawn, so the cell is measured undisturbed."
2. **STATE_4 — "A voltmeter reads the true EMF."** visual_counter: the voltmeter connects, beads flow through the cell, and its dial droops to 1.35 V — while the potentiometer null, drawing nothing, holds exactly 1.50 V beside it. one_line_fix: "A voltmeter loads the cell and reads the smaller E − Ir; only the zero-current null reads the true EMF."

Both shown → corrected back-to-back in motion — no prediction question, no pause. **EPIC-C branches: ZERO** (EPIC-L-first directive 2026-06-10).

## 5. `has_prebuilt_deep_dive` — DEFERRED

V1 ships ZERO authored deep-dives (Rule 18). No flags authored now. Candidates recorded for the analytics trigger (≥10 feedback rows OR median dwell >60 s @ ≥50 sessions): STATE_1 (why a uniform wire gives a uniform gradient; calibrating k with the driver rheostat), STATE_4 (the loading error quantitatively — how a higher-resistance voltmeter droops less but never reaches E; pointer to A25 compare-two-EMFs as the next diamond).

## 6. Drill-down clusters — DEFERRED (authored-not-applied)

Drill-down dormant this phase. Clusters SQL migration `supabase_migrations/supabase_2026-07-13_seed_potentiometer_clusters_migration.sql` authored but NOT applied; quality_auditor Gate-8 cluster-registry probe is **N/A-DORMANT** (recorded false-FAIL scar). Candidate cluster_ids (physics_author writes 5 student-voice trigger phrases each, migration file only):
- `null_method_draws_no_current` — "the galvanometer has to draw some current to give a reading / at balance the meter must still be measuring something."
- `voltmeter_reads_true_emf` — "just put a voltmeter across the cell — it reads the EMF directly" (the trap S4 is built against).
- `driver_cell_role_confused` — "why do you need a second battery / can't the tested cell drive the wire itself / what happens when the driver voltage is smaller than the cell's EMF."

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational: STATE_1 → STATE_3   # what a potentiometer is / gradient / the null + E = k·l (contains PRIMARY aha)
  measurement:  STATE_4 → STATE_5   # true EMF vs voltmeter / why zero current matters / balancing it yourself
```

Default aspect = `foundational`. Both aspects → `ASPECT_VOCABULARY` / `CLASSIFIER_PROMPT` (registration sites 4–5). Cross-slice pill at the end of the foundational slice: "See why a voltmeter can't read the true EMF?" → STATE_4.

## 8. Prerequisites (advisory only — Rule 23)

- `ohms_law` (Ch.3, shipped): uniform wire ⇒ equal drop per equal length. Cliff at S1 (why the ramp is LINEAR) — patch: one clause, "same current, same resistance every centimetre — so every centimetre drops the same voltage."
- `emf_definition` (c11, SHIPPED): EMF as the cell's fixed push. Cliff at S2/S3 (E as the fixed 1.5 V the tapped drop must meet) — patch: "the cell pushes with a fixed one point five volts of EMF," stated as a read fact, never derived.
- `internal_resistance` (c12, SHIPPED): terminal voltage E − Ir. Cliff at S4 (why the voltmeter reads LESS) — patch: "any current through the cell loses some voltage inside it — that inside loss is what the meter can't see past."

Downstream edges unlocked: c23 → A25 (comparison of EMFs, E₁/E₂ = l₁/l₂), c23 → A26 (internal resistance by potentiometer), c23 → meter bridge (the lab-trio closer).

## 9. Real-world anchor (Rule 35 — universal, culture-neutral)

**Primary:** a **volume fader / dimmer slider** IS a potentiometer. Under the sliding knob sits a resistive track with a voltage across it; the slider is a jockey tapping off a fraction of that voltage — slide further, tap more. Every mixing desk fader, every dimmer knob, every joystick position sensor works on exactly the potential-gradient idea in State 1. The lab instrument simply turns that same slider into a precision measurer: instead of USING the tapped voltage, you slide until it exactly cancels a cell — and read the cell's true EMF off the length. (Teaching instance stays "measure a cell's true EMF by nulling," per spec.)
**Secondary (optional, one line in S4):** battery testers that claim the "real" cell voltage must draw almost nothing — the less a meter loads the cell, the closer it gets to what the null method reads exactly.

No country, brand, festival, currency, place, or name in any rendered or narrated text (all languages). Plain English — no Hinglish. No region-dependent constant asserted (driver voltage is a slider; all cells are generic).

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) Every EPIC-L state:**
- STATE_1 — driver beads flow A→C from t=0; gradient ramp fills in left→right (3 V at A → 0 at C); `k = 3 V/m` composes; full apparatus in home pose (jockey at 0.5 m, needle quiet at TRUE null, uncommented); `gradient` glow; caption "Potential drops evenly"; ~40 w.
- STATE_2 — jockey slides 0.5→0.7 m FIRST; `l = 0.70 m` + `k·l = 2.10 V` light beside `E = 1.50 V`; tap-branch beads appear; needle swings (+0.6 V → ~+36°); caption "Jockey taps the drop"; jockey slider live post-slide; ~45 w.
- STATE_3 — jockey sweeps 0.7→0.5 m; `k·l` ticks 2.10→1.50 V; tap beads drain to none; needle settles dead centre; `E = k·l = 1.50 V` + `i = 0` compose; driver beads flow throughout; caption "Drop equals EMF → zero"; jockey live post-sweep; ~50 w.
- STATE_4 — jockey pinned at null; voltmeter connects FIRST; beads flow through cell + voltmeter; internal `r` labels in; V dial droops to 1.35 V; compare readout `V_meter = 1.35 V vs E = 1.50 V`; the null side never moves; caption "Voltmeter loads, null doesn't"; compare toggle live; ~50 w.
- STATE_5 — E, ε_d, jockey all live (`show_sliders: true`); ramp slope / k / k·l / needle / balance state track continuously; needle reverses across the null; `interaction_complete`; narration 0/open.

**(b) Symbol-label table** (on-canvas symbolic per Rule 24; narration expands bare symbols per Rule 30):

| Quantity named in narration | Exact on-canvas label |
|---|---|
| wire ends / jockey | `A`, `C` dots at the wire ends; `J` on the sliding jockey |
| driver cell | `ε_d` battery symbol on the top loop + value `3.0 V` (slider in S5) |
| tested cell | `E` cell symbol in the tap branch + value `E = 1.50 V` |
| internal resistance (S4 only) | `r` inside the tested cell |
| galvanometer | `G` dial, centre-zero needle (needle ∝ k·l − E, 33d) |
| potential gradient | `k = 3.00 V/m` value-only readout + the linear ramp above the wire |
| jockey position / balance length | `l = 0.50 m` value-only readout |
| tapped drop | `k·l = 2.10 V` → `1.50 V` value-only readout |
| tap current at null | `i = 0` (shown ONLY inside balance tolerance — S3 scripted null + S5 when genuinely nulled) |
| S4 comparison | `V_meter = 1.35 V vs E = 1.50 V` value-only compare readout + `V` dial |
| formula surface (ONE per state, math-serif Unicode) | S1 `k = V/L` · S2 `V_AJ = k·l` · S3 `E = k·l` · S4 `V = E − I·r < E` · S5 `E = k·l` |

All Unicode text paths (DOM overlays + canvas-drawn text; no 3D sprite path in particle_field): real `ε · Ω ∝ ⇒ − ₁ ✓`, never `eps/ohm/->`.

**(c) Right-hand-rule plan:** N/A — 2D circuit; direction shown by bead flow + arrowheads (tap-branch beads reverse direction across the null on the centre-zero dial). Declared N/A.

**(d) Motion plan:** driver beads stream A→C in every state (home-pose baseline, density ∝ wire current); S1 ramp gradient-fill; S2 jockey slide → readouts → tap beads → needle swing; S3 continuous jockey sweep → k·l/beads/needle track to the null; S4 voltmeter connect → cell beads → dial droop under a pinned null; S5 slider-driven. Needle + k/l/k·l readouts + V dial are live numeric tracking instruments (33d). No passive state.

**(e) Modes:** conceptual-only — NO `mode_overrides` (Rule 20 dormant). `epic_l_path` + `particle_field_config` only. scenario_type stays **`combination_of_resistors`** (selector) with a NEW gated **`topology: "wire"`** per-state flag — do NOT mint a new scenario_type (avoids the deriveStateMeta/#sliders retrofit tax; spec directive, wheatstone Approach-A precedent).

**(f) assessment + coverage_map + misconception_watch:** assessment authored — e.g. "A potentiometer wire 1 m long has 4 V maintained across it. A cell balances at 35 cm. Find its EMF; state the current drawn from the cell at balance; and state whether a voltmeter across the same cell would read more or less than this, and why." (E = 1.40 V; zero; less — it draws current through r.) coverage_map: gradient k = V/L → S1; tapped drop + deflection → S2; null condition E = k·l + zero current → S3; true EMF vs terminal voltage → S4. misconception_watch at STATE_3 + STATE_4 ONLY (the two §4 entries).

**Engine done-items (spec §6 — ALL gated behind new per-state flags, zero regression to combination_of_resistors / wheatstone_bridge / KCL / KVL / emf_definition / internal_resistance / electrical_power_in_resistor; flag shape mirrors the shipped `topology:"bridge"` contract):**
1. **`topology: "wire"`** in circuitMode's `cTopology()` — horizontal wire A→C, driver cell + outer top loop, linear potential-gradient ramp above the wire, steady bead stream along it; gated so all seven sibling JSONs render pixel-identically when the flag is absent.
2. **Sliding jockey `J`** — movable contact, position = l via `jockey_pos`; clock-driven one-shot sweeps under distinct names `jockey_sweep` / `jockey_sweep_to` / `jockey_sweep_start_ms` / `jockey_sweep_duration_ms` (the `bridge_r_sweep` sibling pattern), whitelisted in `pfRevealMs` per the spec so THE EYE's frozen frame lands settled (belt-and-suspenders: physics_author sizes the sweeps to also finish under the 1500 ms `DEFAULT_REVEAL_MS` floor, KVL/wheatstone precedent).
3. **Tap branch + galvanometer** — tested cell E + **`drawGalvanometerC` REUSED AS-IS** (the c20 centre-zero dial; needle ∝ k·l − E with this concept's calibration constants documented like `bridge_calibration`), gated `show_galvanometer`; tap-branch beads gated `show_tap_branch_beads`, density/direction ∝ sign(k·l − E), draining to zero at balance (pre-authorized fallback per the bridge: if fiddly, the needle + numeric readouts alone carry the pedagogy).
4. **Readouts** — `show_gradient_ramp`, balance/gradient value-only readouts (`l`, `k`, `k·l` — the `kcl_sum_readout` sibling pattern) gated `show_balance_readout`; a literal `i = 0` label gated `show_izero_label`, shown ONLY when |k·l − E| is genuinely inside tolerance (never fabricated); the S4 voltmeter + compare readout gated `show_voltmeter_compare` (KVL `show_element_voltmeters` sibling).
5. **Glow key** — reuse `galvanometer` (shipped) + `formula`; a `gradient` key is a trivial in-engine `dimFor('gradient')` addition only if `electrons` can't be re-pointed.

All engine adds routed via quality_auditor FAIL → `peter_parker:renderer_primitives` — never cold-called. Bring-up contract honored (cue-gated visuals derivable at any pinned sim-time incl. t=0; static per-state layout; ceil re-sim steps; `__PM_supportsTimePin`; `npm run check:renderer-syntax` after the renderer edit, no backticks in the emitted body). Registration = 8 sites per spec §7 (site 4 `VALID_CONCEPT_IDS` — **already present, verify only**; legacy physics constants exist for `potentiometer` — the new `src/data/concepts/potentiometer.json` takes precedence via `loadConstants`' data/concepts-first order, verify no collision; site 6 = clusters migration authored-not-applied; site 7 = explicitly NOT `PCPL_CONCEPTS`; seed via `_seed_potentiometer_cache.ts` storing `{ epic_l_path, particle_field_config }`). **NOT added to `PILOT_CONCEPTS`** (novel `wire` renderer path → reviewer-first). Telugu TEXT via `model: sonnet` sub-agent (Rule 30g); audio on-demand only (Rule 30h).

---

## Aha-moment designation

- **PRIMARY aha (10-year memory):** STATE_3 — the needle settles at dead zero AND the tap-branch beads drain to nothing: the measurement happens at the one point where the cell delivers NO current — you read its true EMF *without ever loading it*. Measure by making the meter read nothing.
- **SUPPORTING aha:** STATE_4 — a voltmeter, doing the "obvious" thing, reads LESS than the EMF (1.35 V vs 1.50 V) because reading it disturbs it; the null is the only reading that can't disturb what it measures.
- Cohesion: S4 is WHY S3's zero-current property is the whole point — the supporting aha shows what goes wrong when the primary's condition (zero draw) is violated. It sets up nothing else; it serves the primary directly.
- Wrong-belief setup: S2 deliberately builds "the galvanometer is a meter that draws and reads a magnitude" (it deflects, beads flow in the tap branch, there are numbers) → S3 breaks it with zero-as-the-signal and the drained branch; S1–S3's clean `E = 1.50 V` builds "any voltmeter would just read this" → S4 breaks it with the 1.35 V droop.
- Foundational-coverage: SATISFIED — PRIMARY aha (STATE_3) is inside `entry_state_map.foundational` (STATE_1 → STATE_3).

---

## FLAGS to downstream

- **To physics_author:** the §3 numbers are FOUNDER-APPROVED in the spec — carry ε_d = 3 V / L = 1 m / k = 3 V/m / E = 1.5 V / balance 0.5 m / S2 at 0.7 m ⇒ 2.1 V as binding; YOU finalize only: the S4 r/R_v pair for the ~1.35 V droop (exemplar r = 1 Ω, R_v = 9 Ω ⇒ I = 0.15 A, V = 1.35 V — verify), the needle calibration (suggested K_NEEDLE = 60 °/V, clamp ±60°; checkpoints S2 → +36°, S3/S4 → 0°), the wire's own resistance / bead-density current (suggest R_wire = 3 Ω ⇒ i_wire = 1 A, invariant S1–S4 under the high-G idealization), and slider ranges keeping the null reachable (suggested: E ∈ [0.5, 2.5] V step 0.1, default 1.5; ε_d ∈ [2, 5] V step 0.5, default 3; jockey l ∈ [0.05, 0.95] m — final call yours). Declare BOTH idealizations in constraints: (i) driver loop delivers the full ε_d across the wire; (ii) high-resistance galvanometer ⇒ gradient undisturbed off-balance and NO fabricated numeric tap current away from null (at balance i = 0 is EXACT for any G resistance — bridge rigor point verbatim). Declare the explore-honesty constraint (ε_d < E ⇒ null unreachable, expected). Every declared variable carries an explicit `default` (`default_variables_only_first_var_merged` scar). Write per-state reveal timelines + `variable_overrides` from §3 (S1 home pose l = 0.5 balanced quiet uncommented; S2 entry 0.5 → slide to 0.7; S3 entry 0.7 → sweep to 0.5; S4 pinned 0.5 + voltmeter toggle; size `duration` off the FULL choreography window, ~14/15/18/16 s + open). Flesh out the three dormant cluster trigger_examples (migration file only). Aha statement ≤15 words (draft: "The needle reads nothing — and that nothing is the cell's true, unloaded EMF." — 13 words, verify against your numbers).
- **To json_author:** shape per `wheatstone_bridge.json` (scenario_type `combination_of_resistors` + gated per-state flags + `visible_controls` + KEYED `glow_focal`; misconception_watch field names `belief`/`visual_counter`/`one_line_fix`; entry_state_map as state-ID arrays; ≥3 primitives/state; source_book = ToC/scope-only statement). NEW per-state keys (`topology: "wire"`, `jockey_pos`, `jockey_sweep*`, `show_gradient_ramp`, `show_tap_branch_beads`, `show_balance_readout`, `show_izero_label`, `show_voltmeter_compare`) are engine adds — author against the flag names peter_parker lands; `show_galvanometer` + glow key `galvanometer` are REUSED from c20. 8 sites per spec §7; aspects `foundational` + `measurement`; verify the pre-existing `VALID_CONCEPT_IDS` entry + legacy-constants precedence rather than double-registering.
- **To quality_auditor:** this dispatch had no shell — re-run the engine_bug_queue live query for `potentiometer` (and architect-class rows) before gating; the wheatstone physics-block consultation (2026-07-12, same family) is carried forward here: `default_variables_only_first_var_merged`, `aha_statement_exceeds_15_words`, `guided_state_overruns_pacing_target`/duration-sizing, `teach_reveal_synced_to_narration`/`teach_show_quantity_live_when_named` (l/k·l/needle/compare readouts reveal on the sentence that first names them), and `label_occluded_and_offcanvas_circuit` (wire + ramp + dial + voltmeter + 4 readouts + formula in one frame — verify no label collision/clipping on the frozen frames, especially S2/S4; Rule 34d corner reservation). Gate-8 cluster-registry probe = N/A-DORMANT (recorded false-FAIL scar). Review the declared engine-risk exceptions: `wire` topology + gradient ramp geometry, sliding jockey + `jockey_sweep` `pfRevealMs` whitelisting, tap-branch beads (pre-authorized needle-plus-numerics fallback), voltmeter-compare surface — all routed to `peter_parker:renderer_primitives` via your FAIL, never cold-called.

## DC Pandey check

Consulted for chapter SCOPE only (Current Electricity ToC places the potentiometer after the Wheatstone/meter bridge as the precision null method) to confirm the A24 atomic boundary (principle only; A25 comparison + A26 internal-r are separate). No teaching method, example problem, figure, or phrasing imported — the gradient-fill → tap → null → voltmeter-contrast arc, all numbers, and all wording are authored from first principles per the approved spec.
