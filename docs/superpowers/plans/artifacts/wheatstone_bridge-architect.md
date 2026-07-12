# ARCHITECT SKELETON — `wheatstone_bridge`

**Chapter:** 3 (Current Electricity) · **Catalog node:** c20 · **Renderer:** `particle_field` (2D circuit family — NOT field_3d, NOT PCPL) · **Tier:** medium (5 states) · **Date:** 2026-07-12
**Source of truth:** `docs/superpowers/specs/2026-07-12-wheatstone-bridge-design.md` (APPROVED — this skeleton implements it without deviation).
**Siblings:** `kirchhoff_junction_rule_KCL` (c15, shipped 2026-07-11) + `kirchhoff_loop_rule_KVL` (c16, shipped 2026-07-12) — the bridge IS both rules made visible (KCL: the junction split into two divider paths; KVL: equal drop down each path at balance). First of the founder's **lab trio** (Wheatstone c20 → potentiometer c23 → meter bridge).

---

## 1. Atomic claim

This concept teaches ONE idea: a Wheatstone bridge — four resistors P, Q, R, S in a diamond, a battery across one diagonal (A–C) and a galvanometer across the other (B–D) — is **balanced when P/Q = R/S**, because then the two midpoints sit at the SAME potential (V_B = V_D), so the galvanometer branch carries **zero current** and the needle sits dead centre (a **null**) even though all four arms keep flowing; and because the null depends only on the resistance RATIO, never the battery, an unknown resistance reads off the knowns — **S = R·(Q/P)** — with no current or voltage ever measured. It does NOT cover: the meter bridge (1 m wire + jockey, own diamond, T4 lab nano), the potentiometer (c23, downstream sibling null-method), galvanometer internals or conversion (shipped `moving_coil_galvanometer` / `galvanometer_to_ammeter_voltmeter` — here it is a given null-detector), bridge sensitivity / best-arm-ratio / unbalanced-bridge Thevenin current (drill-down candidates only), or the deflection-mode strain-gauge bridge (anchor framing only, never a guided state).

## 2. State count + EPIC-L arc — 5 states (4 guided + explore)

| State | Purpose (one line) | teaching_method |
|---|---|---|
| S1 | Topology: one battery, current splits at A into two divider paths (P→Q, R→S), recombines at C; the meter bridges the two midpoints B–D | *(straightforward motion beat)* |
| S2 | The galvanometer is a **difference detector**: unequal ratios ⇒ V_B ≠ V_D ⇒ current through the bridge wire ⇒ needle deflects | *(straightforward motion beat)* |
| S3 | **PRIMARY aha + misconception beat #1**: sweep R to match the ratios → i_g→0, needle stops DEAD at centre — while all four arms keep flowing | `misconception_confrontation` (Rule 16a straightforward contrast — NO predict-pause) |
| S4 | **Why it's precise + misconception beat #2**: S = R·(Q/P) off the knowns; sweep ε and the needle STAYS at zero — battery-independent | `misconception_confrontation` (Rule 16a straightforward contrast) |
| S5 | Explore: all four arms + ε live; null it yourself | `exploration_sliders` |

The hook MOVES from t=0: S1 opens with beads already circulating and splitting. No static setup state. **State 2 → State 3 is the DECLARED Rule-31 contrast pair** (same galvanometer instrument; the flip = deflection off-centre vs sweep to the null — only the ratio changes).

## 3. Per-state control table (Rule 31 — FIRST design artifact)

Narration 25–55 EN words/guided state (>55 split, <~20 merge); motion may outrun narration, never the reverse; no archetype repeat except the declared S2↔S3 pair; no static state; explore-last.

| # | Teaches (one idea) | Motion archetype | Distinct motion (what animates, how it differs) | Delta cue (≤5w, Rule 32c) | Live controls | Words | Dwell |
|---|---|---|---|---|---|---|---|
| S1 | Two divider paths, one meter across the midpoints (topology) | **split-flow** *(coinage — circuit analogue of fork-split at diamond scale: one stream splits into TWO series-divider paths and recombines; distinct from KCL's single-node fork because the taught object is the two-path ROUTE, not the node)* | Beads leave the battery, split at node A into upper P→Q and lower R→S, recombine at C; arm boxes P/Q/R/S and nodes A/B/C/D label in; galvanometer sits quiet on B–D (home pose is BALANCED, R=3 Ω — physically true zero in the bridge wire, uncommented, so nothing is pre-spoiled and no untaught deflection appears). No readouts yet. | "Two paths, one meter" | none (watch-this beat) | ~35 | ~14 s (≥1 full bead circuit) |
| S2 | Needle = difference detector (unequal ratios ⇒ midpoints differ ⇒ deflection) | **needle-deflect** *(coinage — instrument-response beat: the taught motion IS the dial needle answering a potential difference)* | CAUSE first: arm R's box value visibly nudges 3→6 Ω; readable beat; V_B = 4 V and V_D = 3 V node readouts light; beads APPEAR in the B–D bridge wire (flowing B→D); needle swings off-centre; ratio HUD composes "P/Q = 0.5 vs R/S = 1.0 ✗". First numbers on screen. | "Unequal ratios → swing" | R (nudge one arm) | ~42 | ~15 s |
| S3 | **NULL (PRIMARY aha) + misconception beat #1** — match the ratios, the bridge wire dies, the arms don't | **needle-sweep-to-zero** — DECLARED contrast pair with S2 (same instrument; flip = deflection collapsing to the null) | CAUSE = continuous sweep R 6→3 Ω; V_D climbs 3→4 V toward the pinned V_B = 4 V; bridge-wire beads thin and drain to NONE; needle sweeps to dead centre and STOPS; ratio HUD ticks to "P/Q = 0.5 = R/S ✓"; the four arm bead streams keep flowing throughout (lower path visibly speeds up as R falls — i₂ 0.5→0.67 A; upper holds 0.2 A). Sweep finishes under the 1500 ms reveal floor (engine note below). | "Ratios match → zero" | R (sweep to null) | ~50 | ~18 s |
| S4 | **Why it's precise + misconception beat #2** — S = R·(Q/P); the null survives ANY battery | **battery-sweep-needle-holds** *(the circuit-family realization of `null-result-hold`: the cause sweeps, the watched effect deliberately refuses to move)* | CAUSE = ε slider swings 3→10 V; arm beads visibly speed up/slow in BOTH paths together; V_B and V_D readouts climb in lockstep (both = (2/3)ε: 2 V → 6.67 V, always equal); needle pinned at dead centre the entire sweep; then "S = R·(Q/P) = 3·(20/10) = 6 Ω" composes on the formula surface — no ε anywhere in it. | "Change battery → still zero" | ε | ~48 | ~16 s |
| S5 | Explore | **free-explore** (the circuit-family drag-sandbox) | Teacher drags P, Q, R, S, ε freely; un-balance it, re-null it; needle, V_B/V_D readouts, ratio HUD, bead densities track continuously; runs forever (Rule 37 player invariant — nothing special to author beyond `interaction_complete`). | "You balance it" | ALL: P, Q, R, S, ε (`show_sliders: true`) | 0/open | open |

**advance_mode:** `manual_click` ×4 guided + `interaction_complete` explore (Gate 12 ≥2 distinct; never `wait_for_answer`, never all-auto; per KCL/KVL/combination_of_resistors precedent).

**Rule 32 legibility plan:** 32a cause-first — S2: R box changes FIRST → beat → readouts → bridge beads → needle; S3: the R sweep is the continuous cause, needle/HUD track it; S4: ε moves FIRST → bead speed → lockstep readouts → the needle's non-motion IS the effect. 32b one-variable — S1 only the stream; S2/S3 only R; S4 only ε; continuous bead circulation is the home-pose baseline, not a violation; S5 exempt. 32c — the delta cues above ship VERBATIM as each state's on-canvas caption (Rule 34a: caption = cue only; prose narration in the subtitle strip below the canvas). 32d home pose — ONE diamond persists across all 5 states: A left, C right, B top, D bottom; battery on the outer A–C loop; galvanometer on the B–D chord; arm boxes fixed; states change only values/readouts/overlays — no teleport-rebuild. 32e single glow focal per state (keyed — non-keyed or per-sentence glow silently dims the panel, recorded ohms_law scar): S1 `junction` (node A) → S2 galvanometer → S3 galvanometer (contrast pair shares the focal) → S4 `formula` → S5 none.
**Glow enum (CLOSED):** reuse the circuit scenario's existing keys (`electrons`/`formula`/`junction`/`current_meter`…); a `galvanometer` key for S2/S3 is an in-engine addition ONLY if `current_meter` can't be re-pointed — declared peter_parker item, routed via auditor, never cold-called.

**Rule 33 dual-level:** macro = the diamond + four arm values + the galvanometer needle (the tracking indicator, 33d) + live V_B/V_D numeric readouts + the `P/Q vs R/S` ratio HUD; micro = beads per branch at density ∝ that branch's current — and ZERO beads in the bridge wire at balance (the needle IS the midpoint-difference story co-located with the carriers). Same frame, no split canvas.

**Physics (VERIFIED in spec §4 — founder-approved, BINDING; galvanometer idealized high-resistance so arm currents = open-circuit divider currents and needle reads V_D − V_B):** P = 10 Ω, Q = 20 Ω fixed (deliberately UNEQUAL 1:2 so balance reads as a ratio match, never "all four equal"); unknown S = 6 Ω; variable known arm R; ε = 6 V. V_B = ε·Q/(P+Q) = 4 V (constant). Balance at **R = 3 Ω**: V_D = 6·6/9 = 4 V ⇒ i_g = 0; S = R·(Q/P) = 6 Ω ✓; arm currents at balance i₁ = 0.2 A, i₂ ≈ 0.67 A — both flowing. Unbalanced (S2) at R = 6 Ω: V_D = 3 V, V_D − V_B = −1 V, P/Q = 0.5 vs R/S = 1.0 ✗. S4: both midpoints = (2/3)ε at every ε (2 V at 3 V … 6.67 V at 10 V) — the null holds; S = 6 Ω never references ε.

## 4. Misconception confrontation plan (Rule 16a) — TWO pivots, STATE_3 + STATE_4 ONLY

`misconception_watch` fires at exactly two genuine pivots — never per-state (founder guardrail 2026-07-04):

1. **STATE_3 — "At balance the current stops flowing everywhere."** visual_counter: the bridge-wire beads drain to none and the needle stops dead — while the four arm bead streams visibly keep flowing (0.2 A upper, 0.67 A lower; the lower path even speeds up during the sweep). one_line_fix: "Balance silences only the bridge wire — the arms keep carrying current; the two midpoints simply agree."
2. **STATE_4 — "You must read the meter / know the battery voltage to get the resistance."** visual_counter: ε sweeps 3→10 V, arm beads speed up/slow, V_B and V_D climb in lockstep, the needle never leaves zero — and the readout S = R·(Q/P) = 6 Ω contains no ε. one_line_fix: "The null depends only on the resistance ratio — the battery cancels out, so the unknown reads off the knowns."

Both shown → corrected back-to-back in motion — no prediction question, no pause. **EPIC-C branches: ZERO** (EPIC-L-first directive 2026-06-10).

## 5. `has_prebuilt_deep_dive` — DEFERRED

V1 ships ZERO authored deep-dives (Rule 18). No flags authored now. Candidates recorded for the analytics trigger (≥10 feedback rows OR median dwell >60 s @ ≥50 sessions): STATE_2 (how big is the deflection when unbalanced — the Thevenin/unbalanced-bridge current), STATE_4 (bridge sensitivity / best arm ratio — why comparable arms give the sharpest null).

## 6. Drill-down clusters — DEFERRED (authored-not-applied)

Drill-down dormant this phase. Clusters SQL migration `supabase_migrations/supabase_2026-07-12_seed_wheatstone_bridge_clusters_migration.sql` authored but NOT applied; quality_auditor Gate-8 cluster-registry probe is **N/A-DORMANT** (recorded false-FAIL scar). Candidate cluster_ids (physics_author writes 5 student-voice trigger phrases each, migration file only):
- `no_current_anywhere_at_balance` — "balanced means the whole circuit is off / nothing flows."
- `balance_needs_equal_resistors` — "the bridge balances when all four resistors are equal" (the trap the unequal 10/20 ratio arms are designed against).
- `battery_voltage_needed_for_measurement` — "you can't find S without knowing ε / reading a current."

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational: STATE_1 → STATE_3   # what is a Wheatstone bridge / balance condition / the null (contains PRIMARY aha)
  measurement:  STATE_4 → STATE_5   # finding the unknown / S = R·(Q/P) / why battery-independent
```

Default aspect = `foundational`. Both aspects → `ASPECT_VOCABULARY` / `CLASSIFIER_PROMPT` (registration sites 4–5). Cross-slice pill at the end of the foundational slice: "See how it measures an unknown resistor?" → STATE_4.

## 8. Prerequisites (advisory only — Rule 23)

- `ohms_law` (Ch.3, shipped on particle_field): divider drops V = iR. Cliff at S2 (V_B/V_D come from the two dividers) — patch: S2 narration gives the numbers as read facts, "the top midpoint sits at four volts, the bottom at three," never a derivation.
- `kirchhoff_junction_rule_KCL` (c15, SHIPPED): the split at node A. Cliff at S1 — patch: one clause, "the current splits at the left node — in equals out, as always."
- `kirchhoff_loop_rule_KVL` (c16, SHIPPED): each path spends the full ε. Cliff at S4 (why both midpoints scale as a fixed fraction of ε) — patch: "each path drops the whole battery voltage, so both midpoints ride up and down with it together."

Downstream edges unlocked: c20 → c23 (potentiometer, the sibling null method), c20 → meter bridge (T4 lab nano — the practical realization).

## 9. Real-world anchor (Rule 35 — universal, culture-neutral)

**Primary:** a **digital weighing scale**. Inside it sits this exact bridge: a strain gauge — a resistor whose value shifts a hair when the platform flexes under you — is one arm. Stepping on unbalances the bridge, and that tiny imbalance becomes your weight reading. The bridge is how electronics detect a hair-thin resistance change that no ordinary meter could see. (Honest framing per spec: the scale runs the bridge in deflection mode — surfaced ONLY as anchor framing; the sim's teaching instance stays "find an unknown resistor by nulling the galvanometer".)
**Secondary (optional, one line in S4):** the same bridge sits behind many sensor readouts — temperature and pressure sensors turn a tiny resistance shift into a signal the same way.

No country, brand, festival, currency, place, or name in any rendered or narrated text (all languages). Plain English — no Hinglish. No region-dependent constant asserted (battery sim; ε is a slider).

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) Every EPIC-L state:**
- STATE_1 — beads split at A into P→Q and R→S, recombine at C; nodes/arms label in; galvanometer quiet on B–D (balanced home pose R = 3 Ω, uncommented); junction glow; caption "Two paths, one meter"; ~35 w.
- STATE_2 — R nudges 3→6 Ω first; V_B = 4 V / V_D = 3 V light; bridge wire gains beads; needle swings; ratio HUD "P/Q = 0.5 vs R/S = 1.0 ✗"; caption "Unequal ratios → swing"; R slider live; ~42 w.
- STATE_3 — R sweeps 6→3 Ω; V_D 3→4 V meets V_B; bridge beads drain to none; needle settles dead centre; ratio HUD "0.5 = 0.5 ✓"; arm beads keep flowing (0.2 / 0.67 A); caption "Ratios match → zero"; R slider live; ~50 w.
- STATE_4 — ε sweeps 3→10 V; arm beads speed/slow; V_B, V_D climb in lockstep ((2/3)ε); needle pinned at zero; "S = R·(Q/P) = 6 Ω" composes; caption "Change battery → still zero"; ε slider live; ~48 w.
- STATE_5 — P, Q, R, S, ε all live (`show_sliders: true`); needle + readouts + HUD track continuously; `interaction_complete`; narration 0/open.

**(b) Symbol-label table** (on-canvas symbolic per Rule 24; narration expands bare symbols per Rule 30):

| Quantity named in narration | Exact on-canvas label |
|---|---|
| the four arms | `P`, `Q`, `R`, `S` resistor boxes with Ω values (`P = 10 Ω` …) |
| the nodes | `A`, `B`, `C`, `D` dots at the diamond vertices |
| the cell / EMF | `ε` (battery symbol on the A–C loop) + slider value `6.0 V` |
| the galvanometer | `G` dial, centre-zero needle (needle ∝ V_D − V_B, 33d) |
| midpoint potentials | `V_B` / `V_D` value-only readouts (`4.0 V`, `3.0 V`) |
| the balance test | ratio HUD `P/Q = 0.5  vs  R/S = 1.0 ✗` → `✓` (value-only instrument) |
| galvanometer current | `i_g = 0` at null (readout on the bridge wire) |
| formula surface (ONE per state, math-serif Unicode) | S1 none · S2 `i_g ∝ V_D − V_B` · S3 `P/Q = R/S ⇒ i_g = 0` · S4 `S = R·(Q/P)` · S5 `P/Q = R/S` |

All three Unicode text paths (DOM overlays / canvas graph text / sprite labels): real `ε · Ω ∝ ⇒ ₁₂ ✗ ✓ −`, never `eps/ohm/=>/x`.

**(c) Right-hand-rule plan:** N/A — 2D circuit; direction shown by bead flow + arrowheads (bridge beads flow B→D when V_B > V_D). Declared N/A.

**(d) Motion plan:** beads circulate in every state (home-pose baseline, density ∝ branch current); S1 split-and-recombine tour; S2 R-nudge → readouts → bridge beads → needle swing; S3 continuous R sweep → needle tracks to null → bridge beads drain while arm beads persist; S4 ε sweep → bead speed change + lockstep readouts under a pinned needle; S5 slider-driven. Needle + V_B/V_D + ratio HUD are live numeric tracking instruments (33d). No passive state.

**(e) Modes:** conceptual-only — NO `mode_overrides` (Rule 20 dormant). `epic_l_path` + `particle_field_config` only. scenario_type stays `combination_of_resistors` with a NEW gated `bridge` topology per-state flag — do NOT mint a new scenario_type (avoids the deriveStateMeta/#sliders retrofit tax; spec Approach A).

**(f) assessment + coverage_map + misconception_watch:** assessment authored — e.g. "A Wheatstone bridge has ratio arms P = 100 Ω and Q = 10 Ω. The galvanometer reads zero when the known arm R = 153 Ω. Find the unknown S; state what current flows in the galvanometer branch at balance, and whether the four arms carry current." coverage_map: topology/split → S1; difference-detector → S2; balance condition + arms-still-flow → S3; S = R·(Q/P) + ε-independence → S4. misconception_watch at STATE_3 + STATE_4 ONLY (the two §4 entries).

**Engine done-items (spec §6 — ALL gated behind new per-state flags, zero regression to combination_of_resistors / KCL / KVL / electric_power / emf_definition / internal_resistance):** (1) `bridge` topology in circuitMode — diamond layout A/B/C/D, four arm boxes, battery on A–C, galvanometer branch on B–D, bead-loops for both dividers + the bridge wire, V_B/V_D from the two dividers; (2) `drawGalvanometerC` — NEW centre-zero dial, needle angle ∝ (V_D − V_B), the only genuinely new primitive; (3) ratio HUD + V_B/V_D node readouts (`kcl_sum_readout` sibling pattern); (4) S3 null sweep finishes under the 1500 ms `DEFAULT_REVEAL_MS` floor (KVL precedent — prefer this over touching the often-raced `deriveStateMeta.ts` whitelist). **Idealization (physics_author constraint):** galvanometer treated as high-resistance ⇒ arm currents = open-circuit divider currents, needle reads V_D − V_B. **Fallback (pre-authorized):** if live bead flow in the B–D branch is fiddly, the needle + V_B/V_D numerics alone carry the pedagogy (beads in the four arms only). Bring-up contract honored: cue-gated visuals derivable at any pinned sim-time incl. t=0; static per-state layout; ceil re-sim steps; `__PM_supportsTimePin`. Registration = 8 sites per spec §7 (site 6 = clusters migration authored-not-applied; site 7 = explicitly NOT `PCPL_CONCEPTS`; seed via `_seed_wheatstone_bridge_cache.ts` storing `{ epic_l_path, particle_field_config }`). **NOT added to `PILOT_CONCEPTS`** (novel bridge renderer path → reviewer-first). Telugu TEXT via `model: sonnet` sub-agent (Rule 30g); audio on-demand only (Rule 30h).

---

## Aha-moment designation

- **PRIMARY aha (10-year memory):** STATE_3 — the needle sweeps to dead centre and STOPS while all four arms visibly keep flowing: you detect a **zero**, not a magnitude. Matching the ratios silences the bridge wire.
- **SUPPORTING aha:** STATE_4 — the zero survives ANY battery: both midpoints ride at the same fraction of ε, so the measurement is a pure ratio — which is exactly why nulling beats metering for precision.
- Cohesion: S4's battery-independence is WHY S3's null is worth detecting — the supporting aha explains the primary's payoff (a null is the one reading that can't be fooled by the source).
- Wrong-belief setup: S2 deliberately builds "the galvanometer is a meter that reads a magnitude" (it deflects, there are numbers) → S3 breaks it with zero-as-the-signal; S2/S3's concrete ε = 6 V numbers build "the battery voltage matters to the answer" → S4 breaks it with the pinned needle under the ε sweep.
- Foundational-coverage: SATISFIED — PRIMARY aha (STATE_3) is inside `entry_state_map.foundational` (STATE_1 → STATE_3).

---

## FLAGS to downstream

- **To physics_author:** the §3 numbers are FOUNDER-VERIFIED in the spec — carry them as binding, do not re-derive alternatives. Declare the high-resistance-galvanometer idealization in constraints; write per-state reveal timelines from §3; propose slider ranges keeping the null reachable on integer stops and the needle legible (suggested: R ∈ [1,12] Ω step 1 — balance at 3, demo at 6; ε ∈ [3,10] V; P, Q ∈ [5,30] Ω and S ∈ [2,12] Ω for explore — final call yours); confirm the S1 balanced home pose (R = 3 Ω, quiet meter, uncommented — physically true zero, no untaught deflection on screen, no pre-spoil since nothing is labeled); flesh out the dormant cluster trigger_examples (migration file only).
- **To json_author:** shape per `kirchhoff_junction_rule_KCL.json` (scenario_type `combination_of_resistors` + gated per-state flags + `visible_controls` + keyed `glow_focal`; misconception_watch field names `belief`/`visual_counter`/`one_line_fix`; entry_state_map as state-ID arrays); NEW per-state keys (`topology: "bridge"`, galvanometer/ratio-HUD flags) are engine adds — author against the flag names peter_parker lands; 8 sites per spec §7; aspects `foundational` + `measurement`.
- **To quality_auditor:** this dispatch had no shell — re-run the engine_bug_queue live query for `wheatstone_bridge` (and architect-class rows) before gating. Gate-8 cluster-registry probe = N/A-DORMANT (recorded false-FAIL scar). Review the declared engine-risk exceptions: `bridge` topology geometry, `drawGalvanometerC` needle, ratio HUD/node readouts, S3 sweep-vs-1500 ms reveal floor, and the pre-authorized no-beads-in-bridge-wire fallback — all routed to `peter_parker:renderer_primitives` via your FAIL, never cold-called.
