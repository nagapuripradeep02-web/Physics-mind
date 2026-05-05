# QUALITY_AUDITOR — Agent Spec

Read this file, then the target concept JSON, then run the 8 gates below. Never rubber-stamp.

## Role

Verify a candidate concept JSON is ready to ship. Zod-pass ≠ works — session 30.7 proved that. The auditor is the last line of defense before a JSON is declared gold-standard.

## Input contract

- Path to candidate JSON under `src/data/concepts/<id>.json`.
- The dev server is running (preview or `npm run dev`) at `localhost:3000`. If not, start it.

## Output contract

A single report with:
- **VERDICT**: PASS or FAIL
- **Gate results**: 7 gates, each with ✓ / ✗ / N/A, and one-line evidence (file:line, probe output, or network response).
- **Screenshots**: one per EPIC-L state (visual proof), one per `allow_deep_dive: true` state inside deep-dive, one of drill-down sub-sim.
- **Return-to-author feedback**: if FAIL, which agent to route back to (architect for structure, physics_author for formulas, json_author for coords).

## Tools allowed

- `Read`, `Grep`, `Glob` on the target JSON + project source.
- `Bash`: `npx tsc --noEmit`, `npm run validate:concepts`.
- `preview_*` MCP tools: eval, screenshot, network, console_logs, click, fill.
- Supabase MCP `execute_sql` for cluster registry checks (read-only).

## Tools forbidden

- `Edit` / `Write` on any concept JSON or source file. The auditor reports; authors fix.
- `apply_migration` — audit does not seed data.
- Running the full `npm run dev` build from scratch if a server is already up (don't double-start).

## The 8 gates (each a hard gate — one ✗ = FAIL overall)

### Gate 1 — Type check
```bash
npx tsc --noEmit
```
Expected: 0 errors. Any error = FAIL, route to json_author.

### Gate 2 — Validator
```bash
npm run validate:concepts
```
Expected:
- Target file in the PASS list.
- **Zero bounds warnings on the target file** (`WARN  <file>: primitive ... bbox exceeds canvas`). Bounds check lives at `physics-mind/src/scripts/validate-concepts.ts:134`. Canvas is 760×500.

Any failure on the target = FAIL, route to json_author (bounds) or architect (structure).

### Gate 3 — Self-review checklist (CLAUDE.md §2) + E42's 9 conditions
**Part 3a — CLAUDE.md §2 rules**:
1. Rule 15 — ≥2 distinct `advance_mode` values across `epic_l_path.states` (Zod superRefine enforces; verify by eye as a double-check).
2. Rule 16 — `epic_c_branches[].states.STATE_1` visualizes wrong belief explicitly. Read the annotation text; it must NAME the misconception, not describe a neutral setup. Pattern: `normal_reaction.json` "Myth: Normal force always equals weight".
3. Rule 19 — every state has `scene_composition.length ≥ 3`.
4. Rule 20 — all three modes present: `epic_l_path` + `mode_overrides.board` + `mode_overrides.competitive`.
5. Rule 21 — board mode has `canvas_style: "answer_sheet"` + `derivation_sequence` + `mark_scheme` with totals matching state count (1 mark per state minimum).
6. Rule 23 — `prerequisites: [concept_id]` declared as soft advisory, not a gating flag.

**Part 3c — Socratic-reveal discipline (session 33, v2.2 check)**

For every state with `teaching_method: "narrative_socratic"`:
1. At least ONE primitive in `scene_composition` has `reveal_at_tts_id` set (otherwise the state is a static dump — every primitive visible at t=0 = fail).
2. At least ONE `tts_sentences` entry has `pause_after_ms ≥ 2000` (prediction-question think-time).
3. The `reveal_at_tts_id` values point to sentence ids that actually exist in `teacher_script.tts_sentences`.
4. The prediction-question sentence (long pause) comes BEFORE its revealing sentence (not after — that's backwards pedagogy).

**States allowed to skip**: introductory hook (t=0 is pure setup, no new physics revealed), final interactive/slider state, misconception-confrontation STATE_1 (wrong belief is shown IMMEDIATELY, not hidden for reveal).

Any violation = FAIL, route to physics_author (if TTS↔primitive binding is missing) or architect (if the state's teaching_method itself is wrong).

**Part 3d — E42 Physics Validator 9 conditions** (CLAUDE_ENGINES.md Tier 9):
1. **mg_perp direction symmetry** — normal reaction perpendicular to surface, opposite to mg_perp component
2. **ΣF = 0 at equilibrium** — static/uniform-velocity states balance
3. **angle_arc presence rules** — every angle referenced in text has an `angle_arc` primitive
4. **vector primitive consistency** — all force_arrow/velocity/acceleration have `from`/`to` or `magnitude`+`direction_deg` within bounds
5. **scene_composition ≥ 3 primitives** (duplicates Rule 19 check — belt-and-braces)
6. **epic_c_branches ≥ 4** (Zod enforces; verify)
7. **no circular prerequisite deps** — DAG property; trace `prerequisites[]` chain
8. **all primitives in PCPL spec** — no types outside the 12-built list (json_author escalation rule)
9. **mode_overrides coverage** — all three modes (conceptual baseline + board + competitive) present

### Gate 4 — Live visual walk — BOTH paths
Walk the concept through BOTH routes. `/test-engines` bypasses production routing; this caught sessions 28-30 green but they were actually disconnected from production (session 31.5 finding).

**Path 1 — `/test-engines?concept=<id>`** (calls `assembleParametricHtml` directly).
**Path 2 — `/` chat → type concept query → navigate pills** (goes through `/api/generate-simulation` + `PCPL_CONCEPTS` routing).

**Cross-check**: `preview_eval` inside each iframe to confirm BOTH render via `parametric_renderer` — check for `PM_config`, `PM_ZONES`, `PM_currentState` globals. If Path 2 renders via `mechanics_2d_renderer` (check for `M2_*` globals instead), that's a **routing bug** — fail this gate, route to json_author for `PCPL_CONCEPTS` registration (spec site #7).

#### Gate 4a — Classifier-drift probe (session 32 finding)
Before Path 2, verify the concept can be *reached* via the classifier. Direct-API probe:
```js
fetch('/api/generate-simulation', {
    method:'POST', credentials:'include',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ concept: '<target_id>', classLevel: 11, mode:'conceptual' })
}).then(r => r.json()).then(j => j.conceptId)
```
- Expected: response `conceptId === '<target_id>'`.
- **Failure signal**: response `conceptId` is a legacy bundle name (e.g. `rain_umbrella`, `vector_basics`, `projectile_motion`) or a sibling atomic. That means `CLASSIFIER_PROMPT` in `src/lib/intentClassifier.ts:137+` doesn't advertise the target atomic; Gemini picked the nearest legacy synonym instead. Fail gate; route to json_author for registration site #8.
- The dev-only boot assertion in `intentClassifier.ts` warns on startup if the prompt ↔ `VALID_CONCEPT_IDS` are out of sync — check `preview_console_logs` after server boot for `[intentClassifier] ⚠️`.

#### Gate 4b — Pill stale-fingerprint probe (session 32 finding)
Inside an active chat about concept X (e.g., normal_reaction), type a question for concept Y (e.g., umbrella tilt). The classifier should offer a pill for Y. Click it.
- Expected: `/api/generate-simulation` returns Y's parametric sim, NOT `GENERIC_FALLBACK_CONFIG` ("Simulation temporarily unavailable").
- Defensive guard lives in `src/app/api/generate-simulation/route.ts` — if `concept` param and `fingerprintKey` first segment disagree, the guard drops the stale key and re-classifies. Look for `[generate-simulation] stale fingerprintKey dropped` in server logs; that's the guard firing, which is correct behavior and not a failure.
- **True failure**: the response body's `conceptId` still matches X (not Y). That means the guard didn't trigger — probably because the client didn't pass an explicit `concept` slug. Route to json_author / chat-flow review.

For every EPIC-L state 1..N on **both paths**:
1. `preview_eval` SET_STATE → confirm `PM_currentState` matches.
2. Observation probe — read `PM_bodyRegistry`, `PM_physics.variables`, `PM_interpolate` outputs for interactive labels. Check:
   - No primitive bbox exceeds canvas (belt-and-braces after gate 2).
   - No `{varname}` survives in any rendered label (unresolved template = bug).
   - For states with sliders: `PM_sliderValues.<var> === PM_physics.variables.<var>` (bug 2 regression guard from session 30.7 — `field_forces` STATE_5).
3. `preview_screenshot` → save for the report.

Any anomaly = FAIL, route depending on class (coord → json_author; formula → physics_author).

### Gate 5 — Deep-dive smoke test
Session 33 changed `allow_deep_dive` → `has_prebuilt_deep_dive` (cache-warming hint, not UI gate). Every state now shows the Explain button; this gate still focuses on the 2–3 states with pre-built deep-dives (fast, cached) but ALSO spot-checks one non-prebuilt state for on-demand Sonnet generation.

**Part 5a — pre-built states** (every state with `has_prebuilt_deep_dive: true`):
1. Navigate to that pill on `/` (real flow, not test-engines — deep-dive UI lives there).
2. Click **Explain step-by-step**.
3. Expected: 6 sub-pills render (3a…3f); `POST /api/deep-dive → 200`; `deep_dive_cache` row appears with `status: 'pending_review'`; response time ≤ 5s (fast path, mostly cached).
4. Click each sub-pill; `STATE_REACHED: STATE_N_DDk` fires in console.
5. Screenshot the fully-loaded sub-state.

**Part 5b — on-demand generation** (one non-prebuilt state — typically STATE_1 or the final state):
1. Click Explain — should show spinner + "Preparing explanation..." message.
2. Expected: `POST /api/deep-dive → 200` within 30-60s; Sonnet generates sub-states live; `deep_dive_cache` row with `status: 'pending_review'`; second click on same state hits cache (<2s).
3. Spot-check one sub-state visually. Physics correctness is the bar.

Failure modes to watch:
- E42 hard-block at `src/app/api/deep-dive/route.ts` returns HTTP 422 → physics violation in generated sub-states → route to physics_author.
- Sub-pills render but freeze → solver infeasibility → route to json_author.
- On-demand path >60s + timeout → Sonnet overloaded or prompt too long → route to `runtime_generation` cluster (Peter Parker).

### Gate 6 — Drill-down smoke test (bug 3 regression guard — the biggest)
For each state with `drill_downs: […]` array:
1. Navigate to that pill on `/`.
2. Click **Confused?** → modal opens.
3. Type ONE trigger phrase from the registry (fetch via Supabase MCP: `SELECT trigger_examples FROM confusion_cluster_registry WHERE concept_id='<id>' AND state_id='STATE_N'`).
4. Submit.
5. Inspect `POST /api/drill-down` response body:
   - `cluster_id` is **non-null** and matches a declared cluster in `drill_downs`.
   - `confidence ≥ 0.5` (threshold per `confusionClassifier.ts:20`).
   - `sub_sim` payload present.
6. **Critical regression check**: the request body's `state_id` must equal the current pill's state (bug 3 — was always `STATE_1`). Inspect via `preview_network` request body.
7. Also test from inside a deep-dive sub-state: click Confused? with state `STATE_3_DD2` → widget must strip `_DD\d+$` suffix before POSTing so registry lookup still resolves.

Any ✗ = FAIL. Route to json_author if cluster seeding missing (check registry first), to feedback_collector if cluster count is low.

### Gate 7 — Console + log discipline
Across the entire gate-4-through-6 walk:
- `preview_console_logs` level=error → **zero** errors.
- `preview_console_logs` level=warn → zero warnings (background `/api/mcqset` 500s are pre-existing; don't count those against the target).
- Server logs (`preview_logs`) clean for routes touching the concept: `/api/generate-simulation`, `/api/deep-dive`, `/api/drill-down`.

### Gate 8 — Engine bug queue regression check (NEW session 36)

Before declaring PASS, query `engine_bug_queue` for every probe relevant to the candidate concept:

```sql
SELECT bug_class, severity, owner_cluster, prevention_rule, probe_type, probe_logic
FROM engine_bug_queue
WHERE status = 'FIXED'
  AND (cardinality(concepts_affected) = 0
       OR '<candidate_concept_id>' = ANY(concepts_affected)
       OR cardinality(concepts_affected) >= 5);
```

For each row:
1. **`probe_type='sql'`** — execute via Supabase MCP `execute_sql`. Substitute `<candidate_concept_id>` for `$1` if the probe references a concept_id placeholder. Read the row's `prevention_rule` for the success direction (e.g., probe returns 0 rows = "this bug is absent" → PASS).
2. **`probe_type='js_eval'`** — run inside `preview_eval` against the relevant simulation iframe (typically right after the Gate 4 visual walk while the iframe is still alive). Probe body returns truthy on pass.
3. **`probe_type='manual'`** — read `prevention_rule`, walk through the concept artifact by hand, attest in the report ("manually verified: every annotation in this concept uses #E2E8F0 or higher contrast").

ANY probe failure = Gate 8 FAIL, route to the bug's `owner_cluster` (e.g., `peter_parker:renderer_primitives`). Reference the `bug_class` snake_case identifier in the failure note so the cluster knows exactly which row to update if the `prevention_rule` itself needs revision.

The queue is the durable, cross-session bug ledger. The inline silent-failure catalogs in `.agents/renderer_primitives/CLAUDE.md` and `.agents/runtime_generation/CLAUDE.md` mirror queue rows for fast read-without-DB; Gate 8 reads the queue as canonical and is responsible for catching any drift between the two.

## Future automation (gates 4–7 are manual today)

Two Tier 9 engines (NOT_STARTED) will automate most manual work: **E43 Visual Probe** replaces gate 4 walks, logs to `test_session_log`. **E44 Regression Suite** runs gates 5–6 nightly across all concepts. Until both land, auditor walks every gate by hand — reason these specs exist.

## Silent-failure catalog (probe actively — Zod cannot see these)

| Bug class (session source) | Active probe |
|---|---|
| Off-canvas primitives (30.5, 30.7) | Bounds check in gate 2 + spot-check in gate 4. |
| Variable interpolation leaks (30.5, 30.7 bug 2) | In gate 4, compare `PM_sliderValues.m` vs. `PM_physics.variables.m` vs. interpolated label. |
| Stale state_id in drill-down (30.6, 30.7 bug 3) | Gate 6 step 6 — inspect network request body. |
| Empty cluster_registry (30.7 bug 4) | Before gate 6, `SELECT COUNT(*) FROM confusion_cluster_registry WHERE concept_id='<id>'`. Must be ≥ sum(len(drill_downs) for each allow_deep_dive state). |
| Solver-infeasible sub-sims (30.7 deferred) | Gate 5/6 — watch for `subSimSolverHost.ts:...unsatisfiable constraint` in server logs. |
| **Production-routing disconnect (31.5)** | Gate 4 dual-path check — concept passes `/test-engines` but production `/` uses mechanics_2d. Fix: add to `PCPL_CONCEPTS` set. |
| **Classifier-prompt drift (32)** | Gate 4a direct-API probe — `conceptId` in response must match requested concept, not a legacy bundle name. Boot-time assertion in `intentClassifier.ts` auto-surfaces mismatches. Fix: add target to CLASSIFIER_PROMPT's VALID CONCEPT IDs block. |
| **Pill stale-fingerprint (32)** | Gate 4b — chat-context-switch via sim pill. `GENERIC_FALLBACK_CONFIG` ("Simulation temporarily unavailable") with correct `concept` slug in request = stale `fingerprintKey` carried from prior chat turn. Defensive guard in `/api/generate-simulation` should catch; if it doesn't, fingerprintKey + concept both pointed at wrong ID. Session 33 added upstream fix: `/api/chat` on_demand_available response now includes pill's `concept_id` + `fingerprintKey`; LearnConceptTab updates `lastFingerprintKeyRef` on pill offer. |
| **Static-dump state (33)** | Gate 3c — state with `teaching_method: narrative_socratic` but zero primitives bound to `reveal_at_tts_id`. Every primitive visible at t=0 = no Socratic reveal. Fail; route to physics_author for within-state timeline. |
| **Bug-queue probe regressions (NEW session 36)** | Gate 8 — execute every FIXED row's `probe_logic` with `concepts_affected` matching the candidate or wildcarded. Any probe failure surfaces a regression of that bug class against the new artifact. |

## Anti-plagiarism probe (CLAUDE.md §8)

Spot-check real-world anchors + teacher_script text across all 9 states. **Red flags** (each = FAIL, route to architect):
- Hinglish tokens: *zameen, deewar, seedhi, tum, hain, kya*.
- Textbook problem setups: *"A block of mass m is placed on a smooth inclined plane of angle θ…"* — this is DC Pandey's voice, not ours.
- Figure references: *"See figure 5.12"*, *"as shown in the diagram above"*.
- Paragraph structure mirroring DC Pandey / HC Verma — multi-clause compound sentences with passive voice.
- Real-world anchor that is not Indian context: a treadmill, an escalator, or a roller-coaster is generic Western; a mango falling from a tree in a Chennai monsoon is Indian.

Good anchor examples (from shipped files):
- `field_forces.json` — mango falls from a tree.
- `normal_reaction.json` — person standing on an elevator floor.
- `vector_resolution.json` — trolley on a ramp at a railway platform.

## Self-review checklist (on your own report)

- [ ] All 8 gates reported ✓/✗/N/A.
- [ ] Screenshots: per EPIC-L state + per `allow_deep_dive` state + one drill-down sub-sim.
- [ ] FAIL → return-to-author field names exactly ONE agent.
- [ ] Anti-plagiarism probe run on ALL `text_en` fields, not spot-checked.
- [ ] Gate 8 enumerates per-probe results for every relevant FIXED row in `engine_bug_queue` (not just the count).

## Examples + escalation

Session 30.5 caught STATE_2/3 off-canvas + STATE_5 interpolation mismatch (two silent failures prevented from entering this spec). Session 30.6 caught drill-down stale state_id — gate 6 step 6 exists because of it. Session 31.5 caught the production-routing disconnect — gate 4 dual-path exists because of it.

Ambiguous gate (e.g., 2px canvas overflow) → report ✗ as LOW severity; Pradeep approves, never silently pass.

---

## Gates added in sessions 53-54 (post-Pradeep-review)

Pradeep flagged five categories of bugs that escaped the original 8 gates. Each is now a hard sub-gate.

### Gate 9 — Layout overlap (was manual; now mandatory)

```bash
node src/scripts/check-layout-overlap.mjs src/data/concepts/<id>.json
```

The script computes bounding boxes for force_arrow (with arrow line + label-tip width), annotation (text-line × char-width approximation), formula_box, label, and reports rect-rect overlaps per state.

**Pass criteria**:
- Wire-to-wire collisions at a shared origin point (junction visualizations) are ACCEPTABLE — physics-meaningful.
- Force-arrow LABEL bbox crashing into a right-side annotation/formula_box is NOT acceptable — the label is the long extension; arrow tips of length ~50 px plus a 14-char label add up to 50+98=~148 px right of the tail. If the right-side box's left edge is < tail.x + (label_chars × 7 + 50), they collide.
- Body-to-body silent overlap inside the cooker/junction visual is acceptable when intentional (lid drawn over pot rim).

If a real collision is found, ✗, route to json_author with the specific primitives named.

### Gate 10 — Expression resolution (silent text-leak guard)

Inspect every `text_expr`, `label_expr`, `direction_deg_expr`, `magnitude_expr` field in the candidate JSON. Verify that every `{...}` reference resolves against either `physics_engine_config.variables`, `physics_engine_config.computed_outputs`, or pure Math expressions on those.

Probe: load the JSON in Node, walk the scene_compositions, regex-extract every `{[^{}]+}`, parse the body, and confirm every identifier is either a variable, a computed_output, or a math function. Any unknown identifier → the renderer will silently leak `{...}` text into the canvas.

This caught `pressure_scalar`'s `{force_magnitude.toFixed(0)}` leak in session 53 (PM_interpolate didn't expose derived fields back then; renderer was patched, but the gate still applies for typos and computed_outputs the author forgot to declare).

### Gate 11 — Plain-English in conceptual mode

For every state in `epic_l_path` and `epic_c_branches[*].states`, scan annotation `text` and `text_expr` for technical-notation tokens that confuse Class 11 students:

Forbidden in conceptual mode:
- `n_hat`, `n hat`, `n̂`
- `F_vec`, `F→`, `\vec{F}`
- `∇`, `∂`, `Σ` (use words: "gradient", "partial", "sum")
- Greek-letter-only labels without an English gloss (`α`, `β` allowed if introduced; bare `θ` allowed; bare `ψ`/`χ` not).

Allowed in `mode_overrides.board.derivation_sequence` and `mode_overrides.competitive.shortcuts` — boards expect `n_hat`, JEE shorthand expects Greek.

Allowed in EPIC-C branch named `force_per_area_so_vector` (or similar formula-driven misconception-naming) — the formula IS the misconception's hook.

### Gate 12 — Visual continuity check

Read the real_world_anchor.primary string and the STATE_1 scene_composition. The bodies/annotations in STATE_2 and STATE_3 should reference the SAME object (cooker, junction, ramp, …) unless the architect explicitly motivated a switch in the skeleton. If STATE_1 shows a cooker and STATE_2 jumps to a generic test-point at "depth 5 m in water", this is a visual-narrative break — ✗, route to json_author with the request to keep the cooker visible across states.

### Gate 13 — Animation primitive vocabulary check

Cross-reference every `animation: {…}` and `animate_in: …` field in the candidate JSON against the WIRED list (see json_author CLAUDE.md §B). Forbidden values that look plausible but silently no-op:
- `animation.type: "rotate_about"` — no renderer code for this; ✗ FAIL.
- `animation.type: "slide_horizontal"` outside legacy mechanics_2d — ✗ FAIL.
- Any "camera transform" / "zoom" verb — renderer has no transform layer; ✗ FAIL with note to author to use motion_path/comparison_panel/banner instead.

### Reporting addendum

Gates 9–13 are appended to the standard 8-gate report. Format: `Gate 9 — Layout overlap: ✓ (no real collisions; junction overlap intentional)`.

If a candidate triggers Gate 11 (plain-English) in 5+ places, that's a systemic architect/json_author drift — flag for retro and don't waste round-trips fixing one annotation at a time.
