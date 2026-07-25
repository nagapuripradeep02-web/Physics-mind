# QUALITY AUDIT — `em_wave_propagation` (Ch.8 #2, NCERT §8.3)

## VERDICT: **PASS**

Every ACTIVE gate ✓ or N/A with machine evidence; all 11 states visually inspected. Three LOW-severity advisory notes (none blocking). No hard-gate FAIL — no upstream routing.

Renderer family = **field_3d** → chat-flow/pill probes (Path 2, Gate 4a/4b) and deep-dive/drill-down gates (5, 6) are **[LEGACY/DORMANT — N/A]**. Gate 3c does not fire (no `narrative_socratic`); Gate 3e + Gate 15 carry the cognitive-flow audit.

> **ORCHESTRATOR NOTE (loop, not the auditor):** this PASS was returned in parallel with the eye-walker frame-walk, which found 5 findings including a CRITICAL S9 reveal-completeness gap (`eye_walker_report.md`). The auditor's gate battery did not surface the S1/S5/S9 freeze-pin family because those defects live in *which frame THE EYE photographs as reveal-complete*, not in any gate's assertion set — the deterministic gates passed 47/47 precisely because the pins they consult are self-consistent. Both reports go to Checkpoint B; the eye-walker findings are the operative ones.

---

## Gate results

| Gate | Result | Evidence |
|---|---|---|
| **0 — Definition of Done** | ✓ | Skeleton §10 DoD present, zero TBD. 11 states ids S1–S11 match JSON. Symbol labels all present + first-shown at the declared state (E/B gauges S1; triad ŷ/x̂/E×B S4; λ/ν/D/Δt/μ₀/ε₀/c all first at S6; E₀/B₀+ratio S7; u_E/u_B tanks S8; k/ω S9; n/v S10). RHR = S4 sweep-arc glyph + E×B thrust. No static state. Conceptual-only (no mode_overrides/epic_c). `assessment`+`coverage_map` present; `misconception_watch` at S3/S5/S8 pivots only. |
| **1 — tsc** | ✓ | `npx tsc --noEmit` → exit 0. |
| **2 — validator** | ✓ | `em_wave_propagation.json` → `PASS`, zero WARN lines. Totals `126 PASS, 0 FAIL`. Registration cross-check ✓. |
| **3a — §6 mechanical** | ✓ | Rule 15: advance_mode = manual_click×10 + interaction_complete×1 (2 distinct, no `wait_for_answer`). Rule 19: every state `scene_composition.length = 3`. Rule 23: prerequisites advisory. |
| **3c — Socratic** | N/A | No `narrative_socratic` state (Rule-31-era field_3d). |
| **3d — E42 9-cond** | ✓ | Mostly N/A for field_3d. Cond5 ≥3 prims ✓; cond6 epic_c optional (absent) ✓; cond7 no circular prereq ✓; cond8 only `annotation` type ✓; cond9 mode_overrides suspended ✓. |
| **3e — Rule 31 motion/controls** | ✓ | Distinct motion per state (10 archetypes, S1↔S6 the one declared contrast pair); no static state; per-state controls match the table — S6 ν · S7/S8 field-strength · S10 n · S11 ν/field-strength/source; explore-last has all core controls; no Socratic artifacts. |
| **3f — Rule 32 legibility + word budget** | ✓ | Word budget (auditor's own count, over-counting em-dashes): S1:53 S2:55 S3:55 S4:54 S5:55 S6:55 S7:45 S8:55 S9:55 S10:55 S11:16 — all ≤55; validator agrees, no WARN. Every caption opens with a ≤5-word delta cue. Cause-first, one-variable, home-pose continuity, single glow focal confirmed in frames. |
| **3g — Rule 33/34** | ✓ | 33 N/A-as-split (declared); 33d instruments all live-numeric (receiver E/B needle, Δt stopwatch, ratio chip, twin tanks numeric+fill, λ/ν HUD, crest-counter). 34a caption = delta cue only; 34b ONE formula surface/state + value-only HUD; 34c Unicode (→ · × √ μ₀ ε₀ ½ ² − ω ✗ ° ×10⁸) across paths. |
| **3h — Rule 38 + 39g** | ✓ | `depth_ring` all states; advanced (S10) contiguous before explore (S11); both cuts coherent; S11 core-only. Tag honesty: only CBSE/NCERT `verified:true`, all others `needs_teacher_verification:true`. 39g: routes through `emwWidgetVis(...)` + emw_* discovery-convention panels — inherits ⚙ automatically. |
| **4 — visual walk** | ✓ | All 11 frozen + targeted dense frames read. |
| **7 — console/log** | ✓ | THE EYE manifest `warnings: []`; founder_drive `consoleErrors=0 flags=0 collisions=0`. |
| **8 — engine_bug_queue** | ✓ | Live SQL: `em_wave_propagation` → **no matching rows**. 14 OPEN field3d scars evaluated — none recur (glow-targets clean, HUD top:52px, focal-on-physics, dense-frames read, concrete-before-abstract staged). |
| **9 — layout overlap** | ✓ | No `OVERLAP` lines on target; THE EYE `overlayCollisions` clean (47/47). S6 densest-state overlays occupy distinct zones. |
| **10 — expression resolution** | ✓ | grep for `{var}`: no leaks. |
| **11 — plain English / Rule 35** | ✓ | grep for Hinglish/country tokens: none. Anchor (phone-across-a-room / spacecraft / sunlight) universal. On-canvas = labels/equations only, reads sound-off. |
| **12 — visual continuity** | ✓ | Antenna-left / axis / receiver-right home pose persists across all 11 states; only camera move is S4's declared round-trip. |
| **13 — animation vocab** | ✓ | No `animation.type` blocks (engine-driven); no silently-no-op verbs; Rule 29 emphasis = glow brightness, no zoom/size bulge. |
| **14 — Pass-1** | ✓ | 14a cliffs, 14b JEE trace, 14c misconception mapping (3 pivots), 14d aha (PRIMARY S6 + SUPPORTING S2), 14e foundational coverage (S6 ∈ foundational S1–S6). No TBD. |
| **15 — Pass-2 four-question** | ✓ | Walked every state; none fails >2 of 15a–d. Curiosity beats motion-driven (S1 travel-delay, S5 ghost contradiction, S6 gate-timing→constant-match, S8 tiny-B→equal-tanks). Focal on physics element every state. |
| **16–20 — comprehension** | ✓ | 8 Qs, unique ids, all `teaches_state` valid, every wrong option a real documented distractor, correct never keyed, all `parallel_form_stem` present, 8 distinct `tested_idea`, Q4 hits aha S6. coverage_map: no orphan/uncovered/mismatch; `non_assessed = S1,S2,S11` legitimately non-teaching. |
| **Anti-plagiarism** | ✓ | All `text_en` read: plain English, no DC Pandey/HC Verma mirroring, no figure refs, universal anchor. |
| 5, 6 (deep-dive/drill-down) | N/A | Dormant. `confusion_cluster_registry` probe N/A-DORMANT (correctly not routed). |
| Rule 16/EPIC-C, 20/21 modes | N/A | No epic_c_branches, no mode_overrides (conceptual-only). |

---

## The 11 concept-specific probes

1. **"light"-ban before S6 — ✓ PASS.** `light`, `μ₀`, `ε₀`, and `c`-as-speed appear NOWHERE in S1–S5 (captions/formulas/annotations/tts). First appearance is S6.
2. **S2 no-alternation — ✓ PASS.** Uses "each field's change feeds the other, one step ahead." No "E turns into B" / conversion language. The tts elaboration keys on *change sourcing the next field spatially ahead*; both trains visibly co-present.
3. **FL2 (S6 framing) — ✓ PASS.** Framed as the historical identity ("Not a coincidence: that's the measured speed of light, hiding in those constants"), never as an independent coincidental match.
4. **FL4 (S8 energy) — ✓ PASS (code-verified).** Renderer L31442-50: `uEv = 0.5*EPS0*eF*eF`, `uBv = (bF*bF)/(2*MU0)` with `bF = eF/C_EXACT`, both `(u*1e8).toFixed(2)`. `EPS0/MU0` exact CODATA; `C_EXACT = 1/√(MU0·EPS0)` (NOT the rounded display constant). At crest eF=120 → uEv = 6.375015e-8 → **"6.38"**; uBv ≡ uEv exactly → identical **"6.38"**. Sampled frames caught 6.36/6.02 (near-crest) — the coarse 1000 ms grid misses the exact peak, but the display target is provably 6.38.
5. **F2/FL5 (S10 slab) — ✓ PASS.** Both trains stay drawn inside the slab and bunch together; crest-counter "ν = 100 MHz · same both sides"; receiver reads post-slab vacuum values; no E/B ratio chip present. **The F2 design-gate bounce is correctly resolved.**
6. **Rule 38b explore purity — ✓ PASS.** S11 controls = exactly ν / field-strength / source. NO `n` row, no slab, no ratio chip, no tanks, no k/ω; formula is the bare core-ring speed chip.
7. **Rule 34b one formula surface S6 — ✓ PASS.** ONE surface renders the two-line dock + inline `✓ MATCH`; HUD is value-only.
8. **Phase continuity at slab boundary — ✓ PASS.** Dense S10 t=9000: continuous across x=3.0 m and x=7.0 m, crests bunched inside, no kink.
9. **Gate 8 live SQL — ✓ PASS.** 0 rows for this concept; none of the OPEN field3d scars recur.
10. **Rule 31 word budget — ✓ PASS.** All guided states ≤55.
11. **Rule 38a coherence cuts — ✓ PASS.** Advanced ring contiguous before explore; both cuts leave coherent lessons.

## Upstream self-flags (physics_block §11 / json_author)

- **(a) `needle_kick_at_ms`/`ghost_dissolve_at_ms` feed deriveStateMeta pins but aren't wired to runtime reveal — ACCEPTED** by the auditor (the S1 needle kick is physics-driven; the S5 ghost is `✗`-tagged and continuously contradicted). *Orchestrator note: eye-walker's frame evidence shows this acceptance was too generous — see findings 1 and 2 in `eye_walker_report.md`.*
- **(b) `show_lambda`/`show_nu` static presence booleans — ACCEPTED.** λ/ν present through S6 is fine (Class-11 prerequisite symbols; not part of the light-ban).
- **(c) displacement_current CLASSIFIER_PROMPT edit — ACCEPTED, safe for the sealed sibling.** Touches only classifier routing prose; no change to displacement_current's JSON/sim/physics. Redirect-only guardrail honored (both synonyms in `CONCEPT_SYNONYMS`, neither in `VALID_CONCEPT_IDS`/`CLASSIFIER_PROMPT`).

---

## Advisory notes (LOW severity, non-blocking)

1. **ν renders as a `v`-lookalike in the 13px monospace HUD.** The renderer emits correct Unicode `ν` (Rule 34c satisfied), but in monospace it is nearly indistinguishable from Latin `v` — and on S6 the HUD "ν = 100 MHz" sits directly above the formula "**v** = D/Δt" where `v` is *speed*. A genuine small legibility risk specific to this concept. Engine tweak if wanted → `[owner: peter_parker:renderer_primitives]` (serif HUD font, or label the row "freq ν"). Not a gate FAIL.
2. **S5 ghost persists to end pose rather than dissolving at 13.5 s** (consequence of self-flag (a)). Auditor judged this acceptable; eye-walker escalated it to a CRITICAL candidate row. See Checkpoint B.
3. **Two founder hand-test items (headless can't fire trusted drags):** S10 `n=2.0` crest-spacing legibility, and the S7/S8 field-strength seize + S10 n-drag live continuous motion (FL1).

## Paths
- Concept JSON: `src/data/concepts/em_wave_propagation.json`
- Renderer evidence (FL4 tanks L31442-50, HUD ν L31488, constants L30696/L31439): `src/lib/renderers/field_3d_renderer.ts`
- Registration/synonyms/classifier: `src/lib/intentClassifier.ts` (L602-603 synonyms, L845-846 prompt), `src/lib/aiSimulationGenerator.ts` (L2959)
- THE EYE frames + manifest: `.visual_runs/em_wave_propagation/20260725-012153/`
