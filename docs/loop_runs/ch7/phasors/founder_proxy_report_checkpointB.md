# FOUNDER_PROXY — Checkpoint B (BUILD GATE) — `phasors` (Ch.7 #4, `ac_phasor`)

> Persisted verbatim by the loop session. Fix cycle 0 · reviewer-disagreement adjudication (quality-auditor PASS vs eye-walker FINDINGS(2)).

## 1. VERDICT: **FIX(engine)** — one BLOCKING finding (S7), one ride-along (S5)

**eye-walker is correct on both findings; quality-auditor's PASS missed both.** I opened all four named frames and traced both to source. The auditor judged from the live founder_drive walk (which shows *settled* values) and never scrutinised the frozen H2 baseline (S5) nor noticed that S7's element is *absent*, not *dimmed* — it read the dimmed apparatus wires and inferred the intended E4 dim. On the pixels:

- **S7 is a genuine open circuit with current flowing** — CRITICAL, **blocking**. `element:"generic"` (S7) hits a renderer branch whose own comment says *"'generic' shows none"* (field_3d_renderer.ts, ac_phasor block): it hides all three R/L/C element groups but keeps the two slot stubs (a 0.6-unit gap) and keeps current beads flowing (im=vm/R=2.00A). The result is a physically impossible open loop with current in the concept's own advanced-ring derivation state. This is a recurrence-in-spirit of the chapter's flagship scar `field3d_scenario_declares_bead_element_but_never_builds_the_meshes` ("presence is not correctness") — the apparatus is present but its element is not rendered → Pass-1 recurrence → P1. The Checkpoint-A skeleton (lines 42/273/438) explicitly specifies S7 as apparatus **dimmed-but-present** (E4 restore), never opened. A physics-teaching sim projected to a class must not show current through a visible gap. **Blocks approval.**

- **S5 frozen baseline is self-contradictory (15° vs 90°)** — MODERATE, **ride-along**. Real, but confined to THE EYE's frozen H2 baseline; live playback teaches correctly (see §3 F1). Fix runs after approve, before the next concept.

Because a blocking engine finding is unresolved, **APPROVE is withheld.** The LOOP dispatches the S7 fix under CHAPTER_LOOP §3b; I re-review S7 (frozen + dense) after it lands. No physics-correctness doubt exists in the *authored* physics (every number re-derived clean, §4) → no ESCALATE. Two MODERATE cosmetic cleanups ride along to `alex:json-author`.

## 2. Per-state table (Pass-4)

Directly inspected frames: S5 (frozen + dense_t0), S7 (frozen + dense_t10000). S1–S4/S6/S8 rest on the concurrence of *both* reviewers plus my JSON + physics re-derivation (flagged "concur").

| state | correct | order_ok | labels | reads_sound_off | clearly_diff | how a teacher points at it | problem_or_missing | pri |
|---|---|---|---|---|---|---|---|---|
| S1 spin-draws-wave | Y (concur) | Y | Y | Y | Y | "the wave is just the arrow's shadow" | — | — |
| S2 arrow-vs-shadow | Y (concur) | Y | Y | Y | Y | "length is the peak, shadow is now" | auditor's struck-readout residual resolved by eye-walker's frame read | — |
| S3 two-arrows-one-clock | Y (concur) | Y | Y | Y | Y | "φ=0, in step; speed up, lock holds" | — | — |
| S4 lag→angle (PRIMARY aha) | Y (concur) | Y | Y | Y | Y | "freeze anywhere, arc stays 90°" | — | — |
| **S5 lead-mirror** | Y live / **N frozen** | Y | Y | Y | Y | "capacitor mirrors the angle to +90°" | **Frozen H2 baseline pinned mid-flip: φ=15° in HUD+mini-caption while label says φ=90°** (F1) | **P2** |
| S6 read-frozen-diagram | Y (concur; crossings re-derived i@1.0s v@2.0s Δt=1.0s ✓) | Y | Y | Y | Y | "ahead in spin = first past the line" | live-narration crossing-flash timing is a known authored risk (JSON note_arm_timing) — founder-queue note, not a finding | — |
| **S7 angle-is-ωt (derivation)** | **N** | Y | Y | formula Y / **circuit N** | Y | "θ=ωt, ω=2πf; sin(ωt∓π/2) is the diagram as algebra" | **Element box ABSENT — open circuit with current flowing** (F2) | **P1** |
| S8 explore | Y (concur; ships BRIGHT via KEYFRAMES_STATE_8, both reviewers) | Y | Y | Y | Y (sandbox) | "drag anything, φ holds steady" | — | — |

## 3. Findings

### F2 — S7 open circuit with live current [BLOCKING, P1/CRITICAL] → `[owner: peter_parker:renderer_primitives]`
**What the founder would say:** *"Why is there a gap in the circuit with current running through it? Close it."*
**Evidence (verifiable <1 min):**
- Frames: `.visual_runs/phasors/20260723-203921/STATE_7__frozen.png` and `…/STATE_7__dense_t10000.png` — right side of the loop is an open gap (top stub drops to y=0.3, bottom stub rises to y=−0.3, nothing bridges), while amber beads flow on both wires. Contrast `STATE_5__frozen.png` where the capacitor plates clearly bridge the same slot.
- Source: `field_3d_renderer.ts` ac_phasor block — `// Element carousel visibility (d.element scripts R/L/C; 'generic' shows none).` then `window.PM_phsElem = (el === "generic") ? "R" : el;` and (im path) `if (el === "R" || el === "generic") im = vm / …` → current is drawn, element is not.
- JSON: `phasors.json` STATE_7 `ac_phasor.element:"generic"`, `dim_apparatus:true`, `visible_elements` includes `phs_apparatus`.
- Design: skeleton lines 42/273/438 — S7 apparatus **dimmed-but-present** (E4), never removed; scar corpus flagship `field3d_scenario_declares_bead_element_but_never_builds_the_meshes` (Pass-1 recurrence).

**Required before/after (the fix must meet this):**
- BEFORE: `element:"generic"` renders no element → open loop, current through a gap.
- AFTER: when `element==='generic'`, render a **neutral CLOSED element** bridging `phs_slot_stub_top`↔`phs_slot_stub_bot` (a generic component box, dimmed per `dim_apparatus`, no specific R/L/C glyph), so the loop is closed and element-agnostic and current flows through a closed circuit. Re-review: S7 frozen + dense show a closed loop, no gap.
- **Why engine, not json (PRIME DIRECTIVE):** the content workaround (json_author sets S7 to a concrete R/L/C) would close the loop but narrow the *general* θ=ωt / sin(ωt∓π/2) derivation — the ∓ covers both L and C, which is the whole point of a generic element. Do not take the lower-quality workaround; route the engine fix that preserves the general derivation.

### F1 — S5 frozen baseline pinned mid-flip (15° vs 90°) [RIDE-ALONG, P2/MODERATE] → `[owner: peter_parker:visual_validator]`
**What the founder would say:** *"The frozen frame says fifteen degrees but the label says ninety — the picture contradicts itself."*
**Evidence (verifiable <1 min):**
- Frames: `STATE_5__frozen.png` (HUD `φ=15.0°`, mini-caption `φ=15.0°`, arrows near-aligned, `i=+1.00A`) vs `STATE_5__dense_t00000.png` (φ=90.0°, arrows perpendicular). Static formula label reads `φ=90° — i ahead of v` in both.
- The frozen frame is **internally consistent at 15°** (re-derived: i = 2·sin(135°+15°) = 2·sin150° = +1.00A ✓; v = 10·sin135° = +7.1V ✓) — so it is a real mid-transition capture, not a glitch. The only contradiction is vs the destination label.
- Root cause (source): `deriveStateMeta.ts` has **no `ac_phasor` block** in `maxRevealForField3dState` (grep for `flip_start_at_ms`/`lead_mirror_flip`/`acPhasor` returns nothing in that function; every sibling scenario — em, gauss, flux, ac_resistor… — has one). So it falls through to `return … : DEFAULT_REVEAL_MS` = **1500** (line 375/1898). The renderer's flip completes at `flip_start_at_ms(800) + flipDur(1200) = 2000ms` (renderer lines 28047–28053). At the 1500ms pin: φ = −90 + 180·(1500−800)/1200 = **+15°** — matches the PNG exactly.
- **Severity scope (why MODERATE, not eye-walker's MAJOR):** this is a THE-EYE frozen-baseline artifact ONLY. The review player's `onTimelineEnd` freezes at the live narration-end clock (≫2000ms), so live teacher playback always shows the settled φ=90°; `deriveStateMeta`'s 1500ms pin is used solely by THE EYE. No teacher-facing misteach. It is still a real defect: a self-contradictory reviewed frame and a fragile H2 regression reference. It does not block, and its physics-in-motion is correct → ride-along.

**Required before/after:**
- BEFORE: all ac_phasor frozen frames pin at DEFAULT 1500ms; S5 (flip at 2000ms) shows 15°.
- AFTER: add an `ac_phasor` candidate block to `maxRevealForField3dState` mirroring the siblings — `lead_mirror_flip`: `flip_start_at_ms + 1200 + margin` (~2200ms); also cover `reading_order` (`scoreboard_split_at_ms`+margin), `radians_derivation` (`chain_4_at_ms`+margin), `arrow_vs_shadow`/`lag_becomes_angle` (freeze-arm + budget), `spin_draws_sine` (`congruence_named_at_ms`+margin). Re-run `visual:eyes`; probe: S5 frozen HUD φ == static formula φ == 90.0° (no 15°).

### F3 / F4 — cosmetic cleanups [RIDE-ALONG, MODERATE] → `[owner: alex:json-author]` (next touch, non-blocking)
- **F3:** `phasors.json` `field_3d_config._engine_status_note` is stale ("scenario NOT YET BUILT… do not run visual:eyes yet") — the scenario IS built and THE EYE ran 35/35. A live "do not run" note in a shipped concept is misleading. Evidence: `phasors.json:474` vs commit `62911da`.
- **F4:** JSON-internal doc inconsistency — `physics_engine_config.variables.element` (line 35) says *"C (S5-S7)"* but STATE_7's block is `element:"generic"` (and `phi` doc line 41 lists only S5-S6 for C). Align the doc string to the built reality (S7 = generic). Evidence: `phasors.json:35` vs `:693`.

### Adjudicated CLEAN (not findings)
- **auditor residual — S2 struck readout / caption order:** eye-walker directly observed the S2 freeze content ("shadow = 0.0 V (arrow still 10.0 V long)" — pivot lands as designed). Clean.
- **auditor residual — S1 non-assessed while SUPPORTING aha:** S1 ∈ `non_assessed_states`, Gate 19 passed, projection content folded into Q1/Q2. Acceptable, concur.
- **eye-walker item 3 — S6 crossing-flash:** the teaching payoff (crossing timestamps i@1.0s, v@2.0s, Δt=1.0s) is present as static labels in the frozen frame and re-derives exactly (θ0=−90: i-crossing 90t=90→t=1.0s; v-crossing −90+90t=90→t=2.0s). The transient flash is cosmetic. I did **not** run the F7 `window.__PM_phsProbe` probe — it is non-blocking and the teaching is carried by the static timestamps. Noted for the founder: the JSON's own `note_arm_timing` (line 683) flags a genuine live-narration risk (if s6_1's TTS delays the i_cross arm past t=1.0s, the live flash fires on the next crossing ~5.0s, making "one second in" describe the flash inaccurately in the live path); recommend verifying the live cue-arm during teacher review. Not a Checkpoint-B blocker.

## 4. Physics re-derivation (independent — no report arithmetic trusted)
f=0.25Hz → ω=2πf=1.5708 rad/s = **90°/s exactly**; T=1/f=**4.0s**. im all elements = 2.00A: R→10/5=2.00; L→10/(1.5708·3.1831)=10/5.000=2.00; C→10·1.5708·0.1273=2.00 ✓. S6 crossings i@1.0s/v@2.0s/Δt=1.0s ✓. S5 frozen (15°) and dense_t0 (−90°) both internally consistent ✓. **Authored physics is correct throughout** — both findings are engine-rendering/harness defects, not physics.

## 5. Candidate scar rows (files only — NOT applied; authored to the live CHECK: severity CRITICAL|MAJOR|MODERATE, 7-value owner_cluster incl. `peter_parker:visual_validator`, probe_type sql|js_eval|manual, row_type incident|probe_definition|directive, ARRAY[]::text[] never NULL; bug_class checked against this run's file — no collision)

```sql
-- F2 (S7). Sibling of the flagship 'presence is not correctness' class, but a
-- distinct mechanism: the R/L/C meshes ARE built; the element-VALUE 'generic'
-- has no rendered representation, so the slot is left open while current flows.
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'field3d_generic_element_value_renders_nothing_leaving_open_loop_with_live_current',
  'ac_phasor S7 element="generic" hides R/L/C and draws nothing in the slot, leaving an open wire gap while amber current beads keep flowing — a physically impossible open circuit in the derivation state',
  'CRITICAL',
  'peter_parker:renderer_primitives',
  'The ac_phasor element carousel builds phsElemR/L/C meshes but treats element=="generic" as "show none" (renderer comment: "generic shows none"), keeping phs_slot_stub_top/bot (0.6-unit gap) unbridged AND keeping the current path live (im=vm/R for generic). Related to field3d_scenario_declares_bead_element_but_never_builds_the_meshes but distinct: meshes exist; the generic VALUE lacks a rendered closed element.',
  'A guided state that keeps current/voltage visibly flowing must keep the active circuit element RENDERED and the loop CLOSED (dimmed if the state calls for an E4 apparatus-dim). A "generic"/element-agnostic slot must render a neutral CLOSED component bridging the slot stubs, never an open gap.',
  'js_eval',
  'On STATE_7 under SET_TIME_FREEZE: query the Three.js scene for a visible mesh (material.opacity>0) whose bounding box bridges phs_slot_stub_top and phs_slot_stub_bot (y in [-0.3,0.3] at x=PHS_SLOT_X). Assert exactly one such element mesh exists whenever any phsBead is animating (im>0). FAIL if beads flow with no bridging element.',
  'OPEN',
  ARRAY['phasors']::text[],
  ARRAY[]::text[],
  'ch7-loop phasors checkpointB 2026-07-23',
  'incident'
);

-- F1 (S5). Harness-side: deriveStateMeta has no ac_phasor maxReveal block.
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'field3d_scenario_missing_maxreveal_block_frozen_pin_defaults_1500ms_predates_scripted_reveal',
  'ac_phasor has no maxRevealForField3dState block, so every frozen frame pins at DEFAULT_REVEAL_MS=1500ms; S5 lead_mirror_flip completes at flip_start(800)+1200=2000ms, so the H2 baseline is captured mid-flip at phi=+15deg while the static label and settled state read 90deg',
  'MODERATE',
  'peter_parker:visual_validator',
  'deriveStateMeta.ts maxRevealForField3dState has an explicit per-scenario reveal-completion block for every other scenario but none for ac_phasor; with candidates=[] it returns DEFAULT_REVEAL_MS (1500). The S5 scripted flip settles at 2000ms > 1500ms, so THE EYE freezes the baseline mid-transition. Live playback is unaffected (the review player freezes at narration-end).',
  'A new field_3d scenario with any scripted one-shot/ramp/reveal that completes after DEFAULT_REVEAL_MS must add a maxRevealForField3dState candidate block pinning the frozen frame past its LAST payoff (mirror the sibling scenario blocks): for a scripted phase relock, flip_start_at_ms + flip_duration + margin.',
  'js_eval',
  'On each guided ac_phasor state under SET_TIME_FREEZE at the derived reveal-hold pin: assert the live phi HUD readout equals the state static formula-overlay phi (both 90.0 for S5). FAIL if |HUD_phi - formula_phi| > 0.5deg (catches a mid-flip pin).',
  'OPEN',
  ARRAY['phasors']::text[],
  ARRAY[]::text[],
  'ch7-loop phasors checkpointB 2026-07-23',
  'incident'
);
```

## 6. `engine_queue` (the LOOP dispatches these under §3b — I route, I do not dispatch)

| finding | tag | owner | evidence for the engine agent | fix must meet |
|---|---|---|---|---|
| **F2 S7 open circuit** | **BLOCKING** | `peter_parker:renderer_primitives` | `STATE_7__frozen.png` + `…dense_t10000.png` (open gap, current flowing); renderer `"generic shows none"` branch + im-for-generic path; JSON `element:"generic"`+`dim_apparatus:true`+`phs_apparatus` visible; skeleton :42/:273/:438 (E4 dimmed-present) | Render a neutral CLOSED element bridging the slot stubs when `element==='generic'` (dimmed per E4, no R/L/C glyph); re-review S7 frozen+dense = closed loop, no gap. **Concept cannot APPROVE until this lands + I re-review.** |
| **F1 S5 frozen pin** | ride-along | `peter_parker:visual_validator` | `STATE_5__frozen.png` (15°) vs `…dense_t00000.png` (90°); `deriveStateMeta.ts` no ac_phasor block → `DEFAULT_REVEAL_MS=1500` (line 375/1898); renderer flip settle 2000ms (:28047–28053) | Add ac_phasor `maxRevealForField3dState` block pinning past each mode's last payoff (flip: flip_start+1200+margin); probe S5 frozen φ == formula φ == 90.0°. Runs after APPROVE, before next concept. |

If the S7 engine fix fails its 2-attempt budget, it degrades to the founder's chapter-end engine queue and the concept **parks** (blocking).

## 7. Five key frames for the founder's eyes
1. `.visual_runs\phasors\20260723-203921\STATE_7__frozen.png` — the open circuit with current flowing (F2, blocking); compare the empty slot to S5's bridged plates.
2. `.visual_runs\phasors\20260723-203921\STATE_7__dense_t10000.png` — confirms the element is missing throughout S7, not just at the freeze instant.
3. `.visual_runs\phasors\20260723-203921\STATE_5__frozen.png` — the 15°-vs-90° self-contradiction in the H2 baseline (F1).
4. `.visual_runs\phasors\20260723-203921\STATE_5__dense_t00000.png` — same state reads 90° everywhere in live playback, confirming F1 is a frozen-pin artifact, not a physics bug.
5. (source, not an image) `src\lib\renderers\field_3d_renderer.ts` ac_phasor block — the `"'generic' shows none"` line is the whole of F2's root cause.

---
**Self-review:** every P1/P2 has a <1-min-verifiable frame + source pointer; F2 routed to exactly one engine owner (renderer_primitives) with the content-workaround explicitly rejected per the PRIME DIRECTIVE; F1 routed to `peter_parker:visual_validator` (the correct owner for `deriveStateMeta.ts`); no `alex:*` FIX routing (F3/F4 are non-blocking next-touch cleanups); scar rows pass the live-CHECK enums; Rule-38 was pre-settled at Checkpoint A (I gated the build, not the design); Pass-1 recurrence check ran and named the flagship class F2 recurs; the per-state table has all 8 rows; I did **not** lower the S7 P1 to reach APPROVE — the blocking verdict stands and re-review follows the fix.
