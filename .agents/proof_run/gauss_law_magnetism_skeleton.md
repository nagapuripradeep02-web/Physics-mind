# ARCHITECT SKELETON — `gauss_law_magnetism` (REBUILD, Ch.5 #3)

> **Mode:** Reconstruction (Rule 31/32/34 rebuild of an existing 6-state Socratic build — full-pipeline rebuild per founder's 2026-07-12 Ch.5 directive, NOT a retrofit-surgeon delta).
> **Authoritative inputs:** `docs/superpowers/specs/2026-07-13-gauss-law-magnetism-design.md` (arc, misconception map, locked quality decisions A/B — followed exactly) · `src/data/concepts/bar_magnet_in_uniform_field.json` (reference shape, Ch.5 #2) · `src/data/concepts/gauss_law_magnetism.json` (physics/scope carry-over only).
> **Renderer:** `field_3d`, scenario `gauss_law_magnetism` (exists — **Class A**: per-state `gm.mode` blocks `loops/whole/pole/morph/contrast/sandbox` + `show_sliders` already supported → pure JSON pass for structure; the spec-§7 additive engine deltas are flagged in §10 below and route to `peter_parker:renderer_primitives` via quality_auditor if THE EYE surfaces them).
> **Handoff:** physics_author (motion timelines + final narration) → json_author (JSON + registration verify) → quality_auditor (Gates 0–20 + eye-walker ∥).

---

## 1. Atomic claim

This concept teaches that the net magnetic flux through ANY closed surface is identically zero — ∮B·dA = 0 — because magnetic field lines are continuous closed loops with no sources or sinks (no magnetic monopole), in structural contrast with the electric Gauss law ∮E·dA = q/ε₀; and only that. It does not cover magnetisation/H-field (deferred to `magnetisation_and_intensity`) or the dipole-field derivation and 1/r³ axial/equatorial forms (owned by the prerequisite `bar_magnet_as_dipole`).

## 2. State count + arc — 6 states (complex; matches the §5 table and the founder-approved spec spine)

Same 6 state IDs as the old build (the carried-over `assessment` mapping STATE_2/3/4/5 stays valid). Guided beats S1–S5, combined sandbox last. The hook MOVES from t=0 (the tracer is already riding the loop in S1 — no static setup state).

| State | One-line purpose | `teaching_method` | `advance_mode` |
|---|---|---|---|
| S1 | A bar magnet's B field is continuous closed loops — out of N, around, into S, back through the body — no line starts or ends | *(omit — straightforward motion beat, Rule 31 default)* | `manual_click` |
| S2 | Wrap any closed surface — every loop out also comes back in → net Φ_B = 0 = ∮B·dA (live crossing tally) | *(omit — straightforward motion beat)* | `manual_click` |
| S3 ⭐ | Shrink onto the N pole alone — lines re-enter through the magnet BODY inside the surface; still zero; no monopole — **PRIMARY aha** | *(omit — straightforward motion beat)* | `manual_click` |
| S4 | Sphere→cube→blob morph — net flux stays pinned at 0, independent of shape & size | *(omit — straightforward motion beat)* | `manual_click` |
| S5 | Magnet (loops, Φ_B = 0) beside a +q (radial-out lines, Φ_E = q/ε₀ ≠ 0) — charges have ends, magnets don't | `compare_contrast` | `manual_click` |
| S6 | Free explore: reshape & slide the surface anywhere, even onto one pole — live net Φ_B stays 0 | `exploration_sliders` | `interaction_complete` |

Gate 12: two distinct advance modes (`manual_click` ×5 + `interaction_complete`) ✓. No `wait_for_answer`, no `auto_after_tts`, no `pause_after_ms`, no `narrative_socratic` anywhere (all stripped from the old build).

## 3. Per-state choreography + control plan (Rule 31 — the control table)

Archetype notes: `tracer-circulate` is a coined variant of seed `flow-along-path` (coined because the loop's CLOSURE — return through the body — is the taught fact, not the flow itself). `surface-envelop+count` is a coined variant of `reveal-build` (the count is the payload). `surface-shrink-onto-pole` is coined (translate+scale of the SURFACE, not an object through it — no seed equivalent). `shape-morph` is coined (continuous geometry morph; no seed equivalent). `side-by-side-contrast` is a coined sibling of `cycle-compare` (simultaneous spatial contrast instead of temporal A→B→A′). `drag-sandbox` is seed, explore-only. **No archetype repeats; no state static.**

| State | Teaches (one aspect) | Motion archetype | DISTINCT motion (cause → effect, Rule 32a) | Delta (= ≤5-word caption, Rule 32c) | Live controls | Narration budget / dwell |
|---|---|---|---|---|---|---|
| S1 | B lines are closed loops with no ends | `tracer-circulate` | One bright tracer rides a FULL loop: out of N → arcs around outside → into S → visibly continues through the magnet body back to N; moment m arrow shown; ≥1 full circuit per dwell, looping. Glow focal: the tracer. | "Closed loops, no ends" | none | 25–55 EN words (~35 target) / ~14 s motion loop |
| S2 | Any closed surface: out = in → ∮B·dA = 0 | `surface-envelop+count` | CAUSE: translucent Gaussian sphere fades in around the whole magnet (~0.8 s) → EFFECT (readable beat later): tracers cross it and the live tally HUD ticks Φ_out and Φ_in up in lock-step, `net = 0` held. Glow focal: the surface. | "Out equals in" | none | 25–55 (~45) / ~16 s |
| S3 ⭐ | One pole enclosed → STILL zero → no monopole | `surface-shrink-onto-pole` | CAUSE: the same surface slides + shrinks onto the N pole alone → EFFECT: the internal return path (`gm_internal`, S→N through the body) BRIGHTENS as the single glow focal (cutaway); tally re-balances to net 0. Everything else holds pose. | "One pole → still 0" | none | 25–55 (~50) / ~18 s |
| S4 | Zero is shape- and size-independent | `shape-morph` | CAUSE: surface morphs continuously sphere→cube→blob (deterministic seeded geometry, looping) → EFFECT: net-flux readout holds dead steady at 0 through every shape. Glow focal: the surface. | "Shape doesn't matter" | none | 25–55 (~40) / ~16 s |
| S5 | Electric contrast: ∮E·dA = q/ε₀ ≠ 0 | `side-by-side-contrast` | Magnet + its loops keep their pose, framed LEFT (no teleport-rebuild; camera pulls back to make room — Rule 32d); +q with radial-outward piercing lines reveals RIGHT after a readable beat. Inset labels: Φ_B = 0 vs Φ_E ≠ 0. Glow focal: the +q's outward-piercing lines. | "Electric law ≠ 0" | none | 25–55 (~50) / ~16 s |
| S6 | The law survives anything the teacher does | `drag-sandbox` | Teacher drives surface shape + position live (even onto one pole); tracers keep circulating; tally + `net Φ_B = 0` update live. Idle auto-sweep until first trusted drag; clock free-runs forever (Rule 37). | "Drag — always 0" | **ALL: `surface_shape` (sphere/cube/blob) + `surface_pos` (−1.2…+1.2 along axis)** | 0/open (≤30-word invitation permitted) |

Guided S1–S5 expose **no sliders** (deterministic for THE EYE); control panel built once, both rows hidden until S6 (same screen position). Rule 32e: exactly one glow focal per state as listed. Rule 32b: only the taught variable moves per state (S1 tracer; S2 surface-in + tally; S3 surface shrink + cutaway brighten; S4 morph; S5 right-panel reveal).

## 4. Misconception confrontation plan (Rule 16a — straightforward contrast beats; NO EPIC-C branches)

Five `misconception_watch` entries, one per guided pivot — **above the usual 1–3 guardrail, justified per spec §2**: this concept's pedagogical identity IS a ladder of five genuinely distinct confusions (no-ends → net-out → monopole → shape → electric-contrast), each attached to a different state's one idea. Not a per-state tic; quality_auditor to sanity-check, not auto-FAIL. (Spec permits consolidating M1→S2 if S1 reads as pure setup — it does not: S1 carries its own motion and its own genuine belief, so all five stand.)

| ID | State | `belief` | `visual_counter` (wrong expectation's consequence shown, then the real physics — no predict-pause) | `one_line_fix` |
|---|---|---|---|---|
| M1 | S1 | Magnetic field lines start at N and end at S, like electric lines start/end on charges | The tracer reaches S — where the "end" should be — and visibly keeps going, through the magnet body back to N: one unbroken closed loop | Magnetic field lines are closed loops with no start or end; poles are not sources or sinks |
| M2 | S2 | A surface around the magnet catches a net flux OUT (the magnet is a source) | The live tally ticks Φ_out and Φ_in up in lock-step — every crossing out is matched by a crossing in; net holds at 0 | Out equals in for closed loops, so the net magnetic flux through any closed surface is zero |
| M3 | S3 ⭐ | A surface around the N pole alone encloses "north magnetic charge" → positive flux (the monopole belief) | The surface shrinks onto N — exactly where a source SHOULD give net-out — yet the bright cutaway shows the lines re-entering through the magnet body inside the surface; tally re-balances to 0 | There is no magnetic monopole — even around one pole, every line out comes back in |
| M4 | S4 | A bigger or oddly-shaped surface catches a different amount of flux | Sphere→cube→blob morph runs continuously while the net-flux readout holds dead steady at 0 | Net magnetic flux is zero regardless of the closed surface's shape or size |
| M5 | S5 | Gauss's law always gives "enclosed source over a constant", so the magnetic version must too | Side by side: the +q's lines pierce its surface outward only (Φ_E ≠ 0) while the magnet's loops cross in and out equally (Φ_B = 0) | Charges are flux sources (q/ε₀); magnets have no monopole source, so the flux is zero |

## 5. `has_prebuilt_deep_dive` states — NONE this build (documented exception)

Spec §10 (authoritative): the old build's `has_prebuilt_deep_dive`/`allow_deep_dive` flags on S3/S4 **drop** — deep-dive is dormant (Rule 18: un-flagged Explain buttons route to the feedback form; V1.0 ships zero authored deep-dives). If analytics later trigger hand-authoring (≥10 feedback rows or dwell >60 s @ ≥50 sessions), the investment order is **S3** (monopole/enclosure abstraction — the historically stuck state), then **S5** (the two-Gauss-laws unification). FLAG to quality_auditor: Gate-check this as a declared exception, not an omission.

## 6. Drill-down clusters — DORMANT (documented for the future S3/S5 revival only)

Clusters SQL migration is authored-not-applied this phase (N/A-DORMANT — do not FAIL-route on the registry probe). Candidates recorded for later:
- S3: `monopole_enclosure_confusion` — "why isn't the flux positive around just the N pole?"; `lines_inside_the_magnet` — students forget B continues through the body; `cutting_magnet_isolates_pole` — snapping a magnet to "trap" one pole.
- S5: `two_gauss_laws_conflation` — swapping the right-hand sides; `flux_vs_field_zero` — thinking ∮B·dA = 0 means B = 0 outside the surface.

## 7. `entry_state_map`

```
entry_state_map:
  foundational: STATE_1 → STATE_5   # the full law: loops → out=in → no monopole → any shape → electric contrast
  no_monopole:  STATE_3             # "can I enclose one pole?" / monopole queries route straight to the aha
  exploration:  STATE_6             # sandbox
```
PRIMARY aha (S3) is inside `foundational` → foundational-coverage rule satisfied, no exit-pill needed. All three aspects are valid classifier `aspect` values; default = `foundational`.

## 8. Prerequisites (advisory only — Rule 23)

- `bar_magnet_as_dipole` — SHIPPED (Ch.5 #1 rebuild, 2026-07-12, baseline-locked). Delivers "field lines are continuous closed loops" — the fact S1 re-states in motion.
- `gauss_law` — SHIPPED (field_3d, electric Gauss law). Delivers "closed surface + flux counting + q/ε₀" — the mental machinery S2 reuses and S5 contrasts.

## 9. Real-world anchor (Rule 35 — universal, culture-neutral; carried over from the old build unchanged in substance)

**Primary:** Iron filings sprinkled on a glass sheet over a bar magnet trace the field as continuous loops that arc out of the north end and dive back into the south end — every line that leaves comes right back. Imagine any closed bubble drawn around the magnet: each loop that pokes out through the bubble also pokes back in, so the net magnetic flux out of the bubble is zero. **Secondary:** A compass needle always shows BOTH a north and a south end — snap it in two and each piece is again a complete magnet. You can never hold an isolated north pole, which is exactly why there is no magnetic "charge" to trap inside a surface. *Why it hooks a Class 10–12 student:* the filings demo is something they have physically done in a school lab, and "snap the needle — you never get half a magnet" is a mini-paradox they can test at a desk; both are lab/household-universal (no places, brands, festivals, currency — Rule 35 clean).

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** S1 closed-loop tracer + m arrow · S2 surface envelop + live tally → ∮B·dA = 0 · S3 shrink-onto-pole + bright body cutaway → no monopole (PRIMARY aha) · S4 sphere→cube→blob morph, net pinned 0 · S5 magnet-vs-+q side-by-side, Φ_B = 0 vs Φ_E = q/ε₀ · S6 sandbox (shape + position sliders, live net 0).

**(b) Symbol-label table** (every narrated quantity → exact on-canvas label; all Unicode, Rule 34c):

| Narrated quantity | On-canvas label |
|---|---|
| Magnetic field / field lines | `B` |
| Magnetic moment (S1 arrow) | `m` |
| Poles | `N`, `S` |
| Flux out / in (tally HUD) | `Φ_out`, `Φ_in` |
| Net magnetic flux | `net Φ_B = 0` |
| The law (formula surface) | `∮B·dA = 0` |
| No-monopole statement (S3 formula surface) | `no monopole → net Φ_B = 0` |
| Charge / its field / permittivity (S5 right panel) | `+q`, `E`, `∮E·dA = q/ε₀` |
| Area element (narration "B dot dA" only) | appears only inside `∮B·dA` — never a standalone dA arrow (scope: flux counting, not surface integrals) |

**(c) Right-hand-rule plan:** N/A — declared exception. No state teaches a cross-product or circulation direction; the law is a scalar flux count. No hand object, no RHR beat (avoids the "narrated hand with no hand drawn" scar).

**(d) Motion plan:** every state's motion is the §3 table row (tracer circuit · surface fade-in + tally ticks · shrink + cutaway brighten · continuous morph loop · right-panel reveal with piercing lines · live slider-driven surface). No passive state; S1's loop and S4's morph loop continuously; S6 free-runs (Rule 37, automatic via `interaction_complete`).

**(e) Modes:** conceptual-only — NO `mode_overrides` (Rule 20 suspension), NO `epic_c_branches` (EPIC-L-first). `schema_version` stays `"2.0.0"`; `renderer_pair` both `field_3d`; scenario `gauss_law_magnetism`.

**(f) Assessment + coverage:** the existing 6-MCQ `assessment` + `coverage_map` carry over UNCHANGED (`teaches_state` STATE_2/3/4/5 mapping stays valid; non-assessed S1/S6). `misconception_watch` = the five §4 entries at their pivots. `aha_moment.state_id = "STATE_3"` with `primary: true`.

**(g) Macro↔micro plan (Rule 33):** the taught variable (flux through an imagined surface) is field-level, not a macro-object-with-micro-mechanism — the 33a/b/c split-band pattern is N/A (declared). The applicable clause is **33d instruments**: the live crossing tally IS the instrument — value-only running `Φ_out = +N · Φ_in = −N · net = 0` that ticks with visible tracer crossings (spec decision A), present on S2/S3/S4/S6, hidden on S1 and S5. Must be frame-rate-independent (Rule 36 — derived from surface geometry + loop paths, never per-frame increments) and byte-stable under `SET_TIME_FREEZE` for THE EYE.

**(h) Canvas budget (Rule 34):** per state — ONE Cambria-Math Unicode formula surface (S1: none, small "closed loops" label only · S2 `∮B·dA = 0` · S3 `no monopole → net Φ_B = 0` · S4 `∮B·dA = 0  (any surface)` · S5 `∮B·dA = 0   vs   ∮E·dA = q/ε₀` · S6 `live net Φ_B = 0`); on-canvas `caption` = the ≤5-word delta cue ONLY (§3 column — the old build's empty captions get populated); prose lives in the subtitle strip; HUD value-only, `top:52px`+ clear of review chrome; Unicode sweep covers all THREE text paths (DOM overlays, canvas text, `createLabelSprite`/`createWideLabelSprite` 3D sprites — the S5 inset's `∮`/`ε₀` escapes stay clean).

**Engine deltas required (flag FIRST, spec §7 — additive, `peter_parker:renderer_primitives` scope):** (1) live crossing-tally HUD (decision A — NEW); (2) S3 `gm_internal` cutaway brightening as single glow focal at `gm.mode:"pole"` (decision B — NEW; verify "inside the surface" from actual EYE pixels, not the node driver); (3) confirm `#caption` renders under the gm scenario (legend is suppressed); (4) `gm_readout` restyle to value-only; (5) per-state `applyGlowEmphasis` focal wiring (closed focal set — non-keyed focals silently no-op). Every renderer edit: `npm run check:renderer-syntax`, no backticks in the emitted template, Rule 36 clock intact.

---

## Reconstruction grading pass (every OLD state re-earns its row)

Old build: 6 states, Socratic (`wait_for_answer` S1/S4, `auto_after_tts` S2, `pause_after_ms` predict beats s1_2/s2_1/s3_1/s4_1, unrendered `annotation` overlays, empty captions). Hand-counted `text_en` word counts below (from the JSON read — **json_author: script-verify before trimming**).

| Old state | ~Words | Verdict | One-line reason |
|---|---|---|---|
| STATE_1 | ~74 | **KEEP + REWRITE** | Genuine distinct idea (closed loops) + distinct motion (tracer); strip s1_2's predict-question + pause; trim to 25–55 |
| STATE_2 | ~93 | **KEEP + REWRITE** | The law itself; strip s2_1's count-question + pause; the new tally SHOWS what the old script asked; trim to 25–55 |
| STATE_3 | ~104 | **KEEP + REWRITE** | PRIMARY aha — survives in place; strip s3_1's "surely positive?" predict beat (the cutaway shows the consequence instead); trim to 25–55 |
| STATE_4 | ~71 | **KEEP + REWRITE** | Distinct shape-independence idea + morph motion; strip s4_1's question + pause; trim |
| STATE_5 | ~97 | **KEEP + REWRITE** | The electric contrast is the supporting aha; trim to 25–55; keep side-by-side |
| STATE_6 | ~72 | **KEEP + TRIM** | Sandbox; narration → 0/open (short invitation OK) |

No merges/deletes/splits — the founder-approved spec pins the proven 6-state spine; every state has a distinct archetype and a real idea.

**Deletion-mechanics checklist:** `state_count` 6 unchanged, no renumbering · `entry_state_map` unchanged (foundational S1–S5 contains PRIMARY aha ✓) · Gate 12: `wait_for_answer`/`auto_after_tts` → `manual_click` ×5 + `interaction_complete`; all `pause_after_ms` stripped · deep-dive flags on S3/S4 DROP (declared exception, §5) · `aha_moment` stays STATE_3, gains `primary: true` · `scene_composition` keeps ≥3 primitives/state (Gate 19) with annotation text rewritten non-Socratic (they're unrendered in field_3d — visible text goes in `field_3d_config.states.{label,formula_overlay,caption}`) · TTS: every script rewritten → re-run the Rule-30g Sonnet-5 `text_te` sub-agent on ALL sentences; audio on-demand only (Rule 30h — no speculative render) · baselines: lock via `visual:approve` only AFTER founder review (HUD/caption changes are expected H2 fails — re-baseline, not a fix cycle, Rule 34e) · registration: all 8 sites already exist — json_author verifies + re-seeds `_seed_gauss_law_magnetism_cache.ts` after restructure.

**Class A/B triage:** Class A — the scenario is motion-native with per-state modes and sandbox sliders; no blocking engine rebuild. The §10 engine deltas are additive polish, expected to surface as EYE-driven fix rounds (concept #1 took 3; #2 several).

---

## Two-pass cognitive lens — Block 1 (Pass-1 strategic checklist)

**Prerequisite cliff.** Without `bar_magnet_as_dipole`, the concept breaks at **S1**: a student who still pictures field lines starting at N and stopping at S cannot accept "out = in" at S2. Patch: S1's tracer explicitly rides THROUGH the magnet body (the segment the prerequisite taught), and the narration names it in one clause ("…and back through the body to north") — self-contained for arrivals, zero condescension for the prepared. Without `gauss_law`, the concept breaks at **S2**: "closed surface" and "flux" are untaught words. Patch: S2's choreography makes the surface's meaning literal — the tally counts visible line crossings, so "flux" is grounded as "crossings, counted with sign" in one sentence, no integral machinery assumed.

**JEE-backwards trace.** Question: *"A closed Gaussian surface encloses only the north pole of a bar magnet. The net magnetic flux through it is: (A) μ₀m (B) positive and shape-dependent (C) zero (D) q_m/μ₀."* Knowledge pieces → delivering states: field lines are closed loops (S1) → closed loops force out = in on any closed surface (S2) → this holds even for a single enclosed pole because the return path runs through the body (S3) → the answer is shape/size-independent (S4) → the distractor pattern "enclosed source over a constant" is the electric law, not the magnetic one (S5). No missing piece; the carried-over Q1–Q6 assessment covers the same trace (coverage_map STATE_2/3/4/5).

**Misconception entry mapping (16a).** All five beliefs are confronted proactively at their §4 pivots. Planting-risk audit: S1's own visual could PLANT M2 (a dense burst of lines leaving N reads as "N emits flux") — prevented by making the tracer's return leg through the body equally bright in S1, never showing an N-side-only line burst. S2's whole-magnet zero could PLANT M3's inverse ("zero only because BOTH poles are inside") — this is deliberate: it is the earned wrong belief S3 breaks (see Block 2). S5 must not plant "Φ_E is always nonzero" — the inset labels tie Φ_E ≠ 0 explicitly to the ENCLOSED charge. 16b fallback: none — no EPIC-C branches (EPIC-L-first directive, 2026-06-10).

## Two-pass cognitive lens — Block 2 (Aha-moment designation)

- **PRIMARY aha (S3):** *Wrap a surface around one pole alone — the net magnetic flux is STILL zero, because the lines come back through the magnet's own body: there is no magnetic monopole.* (The 10-year memory: "you can't trap half a magnet.")
- **SUPPORTING aha (S5, one — sweet spot 1+1):** the two Gauss laws differ by exactly one structural fact — electric lines have ends (sources), magnetic lines don't — so ∮E·dA = q/ε₀ while ∮B·dA = 0.
- **Cohesion check:** S5's contrast exists to explain WHY S3's zero is profound (no source term to enclose) — it reinforces the primary, not a standalone insight. No third aha; S2's "out = in" is the setup ramp, not an aha.
- **Wrong-belief setup:** S3's aha is earned by S1+S2 — after S2 the student confidently believes the zero came from enclosing BOTH poles ("they cancel"), so enclosing ONE pole should surely give net-out; S3 breaks exactly that confident belief (M3). S5's aha is set up by the prerequisite `gauss_law` + S2–S4 — the student confidently expects every Gauss law to read "enclosed source over a constant" (M5); S5 shows the magnetic right-hand side has no source to name.
- **Foundational coverage:** S3 ∈ `foundational` (S1–S5) ✓ — no exit-pill needed.

---

## Engine bug queue consultation

Consulted `docs/FIELD3D_SCENARIO_CHECKLIST.md` (the human-readable distillation of the field_3d `incident`/`directive` rows) + the spec's §7 scar references. *(The live `query_engine_bug_queue.ts` run is unavailable in this read-only architect context — FLAG: quality_auditor runs `npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts gauss_law_magnetism` and `--field3d --open` as its Gate 8 pass.)* Directive rows applied: **concrete-before-abstract** (visible crossings counted before the ∮ symbol appears; the law's formula surface arrives at S2, not S1); **reveal-synced-to-narration** (physics_author tunes each `at_ms`/cue to its narrating beat; keep `*_at_ms` as THE EYE fallback, `scenario_cue` for one-shots); **visual-must-match-narration** ("re-enter through the body" is SHOWN as the bright cutaway, never just said); **don't-pre-spoil** (ε₀ and the electric law appear first at S5; the S1 label stays "closed loops", not the integral); **deterministic morph geometry** (seeded, no per-frame randomness); **explorers must move** (S6 idle auto-sweep until first trusted drag); **specific `visible_elements` tokens** (`gm_*` prefixes, substring-safe); **no frozen tail / reveal_hold** correctly declared per state in `deriveStateMeta` (scenario already registered); **Rule 29** brightness-only emphasis (the S3 cutaway brightens, never bulges). Checklist's "sliders in the LAST state only" line predates Rule 31 — superseded by the per-state contextual-controls table (§3), which here happens to coincide (guided states carry zero controls by design, for EYE determinism).

## DC Pandey check

Consulted chapter table-of-contents scope only (NCERT Ch.5 §5.3 confirms "Magnetism and Gauss's Law" is its own section; DC Pandey lists it under Magnetics alongside bar-magnet dipole treatment — consistent with the split into `bar_magnet_as_dipole` + this concept). No teaching method, no example problem, no figure reference imported; sequence and anchors authored from first principles / carried from the founder-approved spec.

## Self-review (architect checklist)

Atomic claim ONE sentence ✓ · 6 states = complex-tier sanity range ✓ · control table complete (archetype/delta/controls/budget per state, no repeats, none static, drag-sandbox last) ✓ · Rule 32 plan (cause-first beats, one-variable-moves, delta-cue captions, home-pose continuity — S5's deliberate frame-widening documented, single focal per state) ✓ · Rule 33d instrument plan ✓ · Rule 34 canvas budget ✓ · misconception_watch at 5 genuine pivots with spec-§2 justification ✓ · deep-dive/drill-down declared dormant exceptions ✓ · entry_state_map with foundational + no_monopole + exploration ✓ · prerequisites advisory, both shipped ✓ · anchor universal (Rule 35) ✓ · DoD zero TBDs (RHR + macro/micro declared N/A with reasons) ✓ · reconstruction grading + deletion-mechanics complete, PRIMARY aha survives in place ✓ · Block 1 + Block 2 complete, foundational-coverage satisfied ✓ · handoff-ready to physics_author.
