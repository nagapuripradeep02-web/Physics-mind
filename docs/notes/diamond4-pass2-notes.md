# Diamond #4 (magnetic_field_solenoid) — Pass-2 lens dogfood notes

> **Dogfood artifact** mandated by `docs/PASS_2_PROPOSAL.md` step 3 + step 5.
> Date: 2026-06-10. Concept: `magnetic_field_solenoid` (Diamond #4, magnetism, field_3d renderer).
> Method: each of the 8 EPIC-L states was put through the four-question lens by a `json_author`-persona
> agent, then adversarially walked against proposed **Gate 15** (15a–15e) by a skeptical `quality_auditor`
> agent, then a synthesis agent made the promotion call. 7 states returned structurally; STATE_4's auditor
> dropped its structured output and was re-run individually. All load-bearing claims below were verified by
> the orchestrator directly (grep + file reads), not taken on the agents' word.

---

## TL;DR

- **The lens worked — it was NOT ceremony.** It caught a **real, critical regression** every mechanical/tactical gate in the current stack missed.
- **Promotion verdict: `PROMOTE_WITH_REVISIONS`.** The proposed Gate 15 / json_author text cannot ship verbatim — it assumes a PCPL reveal mechanism (`reveal_at_tts_id` + Gate 3c underneath) that **does not apply to the field_3d renderer family that all 4 magnetism diamonds use.** Six concrete revisions below.
- **The solenoid itself has a critical regression to fix before ship:** the json_author dropped 4 of 5 `pause_after_ms` think-time beats the physics block specified, and STATE_4's "outside ≈ 0" has no visual.

---

## The single most important finding: a verified cross-agent regression

The `physics_author` block (`/.agents/proof_run/magnetic_field_solenoid_physics_block.md`) specified within-state think-time pauses on every prediction beat. The shipped JSON kept only one.

| Prediction sentence | Physics block spec | Shipped JSON | Status |
|---|---|---|---|
| `s3_2` ("predict… opposite contributions meet?") | `pause_after_ms: 3000` (marked **non-negotiable**) | `3000` | ✅ survived |
| `s4_1` ("outside — what do you predict?") | `pause_after_ms: 2500` | *(absent)* | ❌ **dropped** |
| `s5_2` ("which hand part follows the current?") | `pause_after_ms: 2500` | *(absent)* | ❌ **dropped** |
| `s6_1` ("depend on total turns N, or something else?") | `pause_after_ms: 2500` | *(absent)* | ❌ **dropped** |
| `s7_2` ("which way will B point now?") | `pause_after_ms: 2000` | *(absent)* | ❌ **dropped** |

**Why no existing gate caught it:** Gate 3c (Socratic-reveal discipline) is the only gate that checks for `pause_after_ms ≥ 2000` — but Gate 3c fires only on states carrying `teaching_method: "narrative_socratic"` (quality_auditor spec line 97). Verified: `grep teaching_method src/data/concepts` returns 85 hits across **5 files, all PCPL/parametric** (friction_static_kinetic, current_not_vector, pressure_scalar, newton_second_law_direction, vector_head_to_tail). **No field_3d concept has `teaching_method`.** Therefore Gate 3c never runs on any magnetism diamond, and the dropped pauses sailed through every mechanical gate.

This is the coverage hole Gate 15 closes: **for the entire field_3d renderer family (all 4 magnetism diamonds), Gate 15's Q2 (pause-before-resolution) and Q3 (motion-before-words) are the ONLY cognitive-flow discipline in the audit stack.**

---

## Per-state results

Reveal mechanism reminder for field_3d: within-state motion lives in `field_3d_config.states.STATE_N.*` keyed by **`reveal_at_ms`** (absolute ms after state-enter, synced to TTS by author intent). `reveal_at_tts_id` / `animate_in` in `scene_composition` are **NOT read** by the field_3d renderer — they drive only PCPL/parametric.

| State | Role | Gate 15 | Real gaps found | Lens answers concrete? |
|---|---|---|---|---|
| STATE_1 | Hook — wire→coil morph | gaps | No prediction/pause beat authored; `focal_primitive_id` = top title label, not the morph | ⚠️ Q4 evasive (only lapse) |
| STATE_2 | Each turn's B-circles | gaps | B-circles don't reveal until `reveal_at_ms 4000` → ~4s of bare coil in the re-entry window (15e) | ✅ |
| STATE_3 | **PRIMARY AHA** — radial cancels, axial adds | **clean** | Orphaned annotations: `cancel_label`/`axial_label` render at t=0 but referent arrows at `reveal_at_ms 6000/8500` → 6s of "red = cancel" with no red on screen | ✅ |
| STATE_4 | Outside ≈ 0 | gaps | `s4_1` pause dropped (spec 2500); **"outside ≈ 0" is purely narrated — no fade animation at all** (unlike STATE_3's arrows) | ✅ (re-run) |
| STATE_5 | **SUPPORTING AHA** — RHR grip swap | gaps | `s5_2` pause dropped; `right_hand` overlay is passive (student watches, doesn't attempt-then-compare); re-entry lacks axial-field reminder | ✅ |
| STATE_6 | Formula B = μ₀nI | gaps | `s6_1` pause dropped; `s6_4` narrates "stretch L 2× → B halves" with no stretch animation | ✅ |
| STATE_7 | Reverse current → B flips | gaps | `s7_2` pause dropped; annotations promise "watch the dots run the other way" but `field_3d_config.STATE_7` has **no `right_hand` and no motion primitive** — unimplemented promise | ✅ |
| STATE_8 | Explore sliders | gaps | `s8_2` pause dropped; field response to slider drag implicit in renderer, not authored | ✅ |

**Cross-state systemic patterns** (only visible because we walked all states, not a 2-state sample):
1. **Dropped prediction pauses** — STATE_4/5/6/7 (+STATE_8, +STATE_1 never had one). The dominant defect.
2. **`focal_primitive_id` = top-center title label `{x:380,y:60}` on 7 of 8 states** — the Focal Attention cue sits on the heading, not the physics. The content-bearing focal primitives the physics block named (e.g. STATE_3 `axial_arrows_rise`) live in `field_3d_config`, not `scene_composition`, so they got replaced by title labels.
3. **Annotation↔referent timing decoupling** — `scene_composition` annotations have no reveal timing, so they all appear at t=0 while the `field_3d_config` motion they describe appears seconds later (STATE_2, STATE_3).

---

## Retrospective (PASS_2_PROPOSAL.md lines 101–105)

1. **Did the lens catch real issues, or ceremony?** Real. A critical cross-agent regression (dropped within-state choreography) + a renderer-family coverage hole no mechanical gate covers. Not ceremony.
2. **Were the answers concrete?** Mostly yes — 7/8 states cited exact sentence ids, ms timings, coordinates (agent-actionable). One lapse: STATE_1 Q4 was evasive (diagnosed the mislabeled focal primitive, then retreated to "the eye instinctively follows…" without committing to a fix). **Lesson: the spec must demand a decision, not an observation.** A second, subtler problem: several per-state agents mis-targeted fixes at `reveal_at_tts_id` (a field the field_3d renderer ignores) because the proposed Gate 15 text assumes the PCPL mechanism — this is exactly why the renderer-family carve-out (Revision 3) is mandatory.
3. **Did Q1+Q2 add value beyond Socratic reveal / Gate 3c?** **Yes, decisively** — but for a reason the per-state agents got wrong and the synthesis corrected: Gate 3c *structurally does not run* on field_3d, so Q2/Q3 are not a redundant "layer above 3c," they are the **sole** cognitive-flow check for the magnetism family. Q1 ("what's invisible right now") is more marginal (overlaps Gate 14 misconception-entry mapping) but earned its keep by forcing the per-state physics specificity that produced the concrete pause/motion findings.
4. **Did the re-entry rule (15e) catch real cases?** Yes — STATE_2 (4s of bare coil before B-circles) and STATE_5 (hand overlay lands mid-state, RHR grip absent during orientation). Not redundant with any Gate 1–14.
5. **Is "spot-check 2 random non-introductory states" sound?** **No — unsound.** A random 2-state draw could easily have hit STATE_3 (clean) + STATE_8 (exploration) and declared the concept clean while 4 states silently lost their confusion beats. The four-question lens (15a–15d) must run on **ALL** EPIC-L states; only 15e re-entry may sample, and even that should target states with delayed first reveals (min 3), not "random 2."

---

## Promotion decision: `PROMOTE_WITH_REVISIONS`

The verbatim json_author + Gate 15 text from `PASS_2_PROPOSAL.md` cannot ship as-is. Six revisions:

- **R1 (sampling):** Gate 15 walks 15a–15d on **every** EPIC-L state, not a 2-state sample. A sub-check failing on 3+ states = one systemic FAIL routed to `alex:json_author`, not N findings.
- **R2 (15e sampling):** Re-entry sub-check targets every non-intro state whose first reveal is delayed (`reveal_at_ms > 2000`), min 3 — not "random 2."
- **R3 (field_3d renderer-family carve-out — the critical one):** NEW required paragraph before 15a–15d telling the auditor: for field_3d concepts (no `teaching_method`), Gate 3c does NOT fire, Gate 15 is the SOLE check, motion lives in `field_3d_config.reveal_at_ms` (NOT `reveal_at_tts_id`), and 15b/15c must be walked against `reveal_at_ms` + `pause_after_ms`. Do NOT instruct json_author to add `reveal_at_tts_id` to a field_3d primitive.
- **R4 (15d directional carve-out):** For field_3d RHR states, the gesture primitive is `field_3d_config…extras.right_hand` with `animate_curl: true`; a static hand with `animate_curl` absent/false = 15d FAIL + escalation note. A missing `reveal_at_tts_id` on `right_hand` is NOT a finding (renderer ignores it).
- **R5 (json_author note):** Append a field_3d note to the Q3 bullet: motion is authored in `field_3d_config.reveal_at_ms`; carry physics-block `pause_after_ms` values forward verbatim when porting a within-state timeline into a field_3d JSON — dropping them is the exact regression Diamond #4 shipped with.
- **R6 (process):** The dogfood step-3 json_author-time notes were not produced during authoring; Pass-2 was authored speculatively at architect time (skeleton lines 262–322). When promoting, record that the canonical "how to answer the four questions" exemplar must be a json_author-time artifact (this file), not the architect's speculative pass.

---

## Solenoid fix list (surfaced by the dogfood)

| # | State(s) | Fix | Severity |
|---|---|---|---|
| 1 | STATE_4, 5, 6, 7 (+ check STATE_2/8) | Restore dropped `pause_after_ms`: `s4_1:2500`, `s5_2:2500`, `s6_1:2500`, `s7_2:2000`. Then confirm each state's first answer-revealing `field_3d_config.reveal_at_ms` lands AFTER its pause window. | **critical** |
| 2 | ALL | Audit every state's `field_3d_config.reveal_at_ms` against the physics-block narration timeline — the TTS-sync now rests entirely on these ms values (correct-by-architecture for field_3d, but verify the motion is sentence-synced, not just present). | **critical** |
| 3 | STATE_4 | "Outside ≈ 0" is purely narrated. Add an outside-field-fade / vector-cancellation visual keyed to `reveal_at_ms` so the cancellation is shown, not described. | **major** |
| 4 | STATE_3 | Gate `cancel_label`/`axial_label` to appear with their referent arrows (`reveal_at_ms 6000/8500`), not at t=0 — currently "red = cancel" shows for ~6s with no red on screen. | **major** |
| 5 | STATE_2 | Re-entry: lower `per_turn_field_circles.reveal_at_ms` (~1500ms) or add a static orientation cue so the first ~4s isn't a bare unlabeled coil. | **major** |
| 6 | STATE_5 | Confirm `right_hand.animate_curl:true` actually drives the wire-grip→solenoid-grip cross-fade and is slow enough (~1.4s) to mirror; lands after the s5_2 pause. If it doesn't animate at render → escalate to `peter_parker:renderer_primitives`. | **major** |
| 7 | STATE_7 | The hand-flip is narrated (`s7_4`) but `field_3d_config.STATE_7` has no `right_hand` and no motion primitive. Add the grip-flip animation, or escalate. | **major** |
| 8 | 7 of 8 states | Re-point `focal_primitive_id` off the top title label onto the physics-bearing element per state (or a focal mapping the renderer honors). | **minor** |

---

## Fix disposition (applied 2026-06-10)

| Fix | Disposition |
|---|---|
| 1 — dropped pauses (`s4_1`/`s5_2`/`s6_1`/`s7_2`) | ✅ **DONE** — pauses restored (2500/2500/2500/2000). `npm run validate:concepts` → `PASS magnetic_field_solenoid.json`, no warnings. |
| 5 — STATE_2 re-entry | ✅ **DONE** — `per_turn_field_circles.reveal_at_ms` 4000 → 1500 (circles now appear ~1.5s in, mid-`s2_1` "makes B-circles", not after 4s of bare coil). |
| 2 — `reveal_at_ms` TTS-sync audit | ⏳ partial — STATE_3 arrows (6000/8500) already trail the `s3_2` 3000ms pause; STATE_4/6/7 have no answer-reveal animation, so the restored pauses give think-time before the *spoken* answer. No desync introduced by this session's edits. |
| 3 — STATE_4 outside-fade visual | 🔧 **ESCALATION → `peter_parker:renderer_primitives`** — no outside-field-fade primitive exists; the renderer draws static sparse-outside field lines (`field_3d_renderer.ts:15`). Not invented in JSON. |
| 6 / 7 — STATE_5 gesture-sequencing + STATE_7 missing hand | 🔧 **ESCALATION → `peter_parker:renderer_primitives`** — `extras.right_hand` is applied at state-enter only (`applyExtras` in `applyState`, `field_3d_renderer.ts:3342`); it has **no `reveal_at_ms`/trigger**. Showing the grip *after* the prediction pause — and adding STATE_7's hand without revealing the answer before `s7_2`'s predict — needs a delayed/triggered gesture-reveal capability. This is the dogfood's "gesture-sequencing primitive." Adding a `reveal_at_ms` to `right_hand` in JSON now would be ignored by the renderer. |
| 4 — STATE_3 orphaned annotations | 🔎 **VERIFY FIRST** — the field_3d renderer has no `scene_composition` annotation handler (grep returned none); the labels may be TeacherPlayer 2D overlays or unrendered. Confirm the reveal mechanism before gating — do not add `reveal_at_ms` to an annotation the renderer ignores. |
| 8 — `focal_primitive_id` repoint | 🔎 **VERIFY FIRST** — confirm field_3d even consumes `focal_primitive_id` (it has its own camera/caption focus). If unused for field_3d, this is a non-issue across all 4 diamonds; if used, repoint off the title labels. |

**Net:** the critical regression (dropped pauses) + the safe re-entry timing fix are shipped and validated. The remaining items are 2 renderer-primitives escalations + 2 verify-first items — none are JSON-author lapses, and none should be patched by inventing field_3d config.

## Method footnote

17 agents (8 states × [lens → Gate-15 audit] + synthesis); STATE_4 re-run individually after its auditor dropped structured output. Verifications performed directly by the orchestrator: `teaching_method` grep across `src/data/concepts`; Gate 3c trigger condition in `.agents/quality_auditor/CLAUDE.md:97`; physics-block pause spec at lines 159/169/179/191; full read of the shipped `magnetic_field_solenoid.json`.
