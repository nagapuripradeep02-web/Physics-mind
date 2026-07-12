# CLAUDE_TEST.md — PhysicsMind Visual Test Protocol
# v1.0 | April 2026 | Opened whenever Claude runs a verification session
# [2026-07-12] The ACTIVE gate = THE EYE + eye-walker (see ACTIVE VERIFICATION PATH below).
# §3–§5 = LEGACY chat-stack mechanics (their per-state audit DISCIPLINE lives on in eye-walker's protocol);
# §7 deep-dive / §8 drill-down / §9 modes + §14/§15 (44-engine E25/E42/E43 framing) = DORMANT/historical.

> **CURRENT-PHASE SCOPE (founder directive, 2026-06-11).** The loop right now is:
> build quality EPIC-L simulations → professor review (Asmi Singh) → update →
> repeat (AUTHORING_PIPELINE.md stages ②–④). Later: ~100-student feedback pool →
> free pilot with 2–3 teachers after 1–2 solid chapters → paid teacher
> subscriptions after 3–4 chapters (v1 launch). Until then:
> **Sim quality is verified via the ACTIVE VERIFICATION PATH below (THE EYE → eye-walker)** —
> §5's per-state audit questions survive as eye-walker's frame-reading protocol; §5/§6's
> browser mechanics are legacy chat-stack.
> **§7 deep-dive, §8 drill-down, §9 mode switch = DEFERRED** — deep-dive/drill-down
> are not being built this phase, and board + competitive modes are dropped per the
> conceptual-only directive (founder, 2026-06-11). Do not spend test time on them
> (see banners on those sections).

> **When to open this file**: Any session where the next task is "test X", "verify X", "visual sign-off", "Phase N smoke test", "pre-ship review", "regression check", or any prompt that involves running the product against real concepts. If you are authoring JSONs or writing code that is then visually tested before commit, this protocol is the gate.
>
> **Who this is for**: Claude Code operating as Engineer+QA in a single session. The protocol replaces "eyeball it" with a structured audit that catches quality drift — something the Architect cannot catch from diffs alone.

---

## ACTIVE VERIFICATION PATH (2026-07-12)

For field_3d / particle_field concepts (the live product):

1. `npm run visual:eyes -- <id>` (THE EYE, $0, mandatory) then dispatch **eye-walker** for the frame read.
2. `npm run smoke:visual-validator -- <id> --dense` is a **PAID escalation** — run only when THE EYE is
   inconclusive or the founder asks (cost ladder; known structural false-positives on particle_field).
3. Review-site check: `npm run build:review -- <id>` + serve + HTTP 200.
4. `npx tsc --noEmit` + `npm run validate:concepts`.

Sections 3–5 below describe the RETIRED chat-stack protocol — legacy reference only.

---

## SECTION 0 — QUALITY OATH (READ ALOUD EVERY SESSION)

1. **I will not sign off on a concept I have not personally clicked through end-to-end.**
2. **I will not report "looks good" without numeric evidence** (primitive coordinates, solver warnings, stop_reason, priority breakdown).
3. **I will not skip a state** because "the others looked fine." Every state gets the ritual.
4. **I will compare the teacher_script to what actually renders on the canvas**, and flag every mismatch.
5. **I will use Supabase MCP to clear caches before testing**, not manually in the browser, not "assume it's clear."
6. **I will file every finding** — bugs, observations, near-misses — in the structured report at the end.
7. **When in doubt, I fail the test.** A passed test that shouldn't have passed is worse than a failed test that didn't need to.

---

## SECTION 1 — PRE-FLIGHT CHECKLIST

Run before every test session. Fail-fast on any red.

| Step | Check | Tool | Pass condition |
|------|-------|------|----------------|
| 1.1 | Git working tree state | `git status` | Clean OR only intentional scratch files. If dirty, commit or stash first. |
| 1.2 | TypeScript is green | `npx tsc --noEmit` | **0 errors**. If errors exist, STOP — fix before testing. |
| 1.3 | Concept validator is green for target concept | `npm run validate:concepts` | Target concept **PASSES** (other concepts may still be in Phase E queue). |
| 1.4 | Dev server not already running | `mcp__Claude_Preview__preview_list` **[STALE tooling — current sessions drive via Playwright/chrome-devtools + detached processes]** | No existing `physics-mind-dev` server. If one exists, stop it first. |
| 1.5 | Node / Next.js compiled cleanly | `mcp__Claude_Preview__preview_logs` after start **[STALE tooling — see 1.4]** | `✓ Ready in Xs` present. No red compile errors. |
| 1.6 | Supabase reachable | Any `execute_sql` with trivial SELECT | Returns rows. If down, abort — cache state cannot be trusted. |

**Launch config** **[STALE tooling — current sessions drive via Playwright/chrome-devtools + detached processes]**: `.claude/launch.json` must exist with name `physics-mind-dev`. If missing, create it with `{ runtimeExecutable: "npm", runtimeArgs: ["run", "dev", "--prefix", "physics-mind"], port: 3000 }`.

---

## SECTION 2 — THE CACHE CLEAR (SACRED)

The **live** cache set is FOUR tables (CLAUDE.md §6):

```sql
DELETE FROM simulation_cache;
DELETE FROM lesson_cache;
DELETE FROM response_cache;
DELETE FROM session_context;
```

`deep_dive_cache` and `drill_down_cache` exist but serve DORMANT paths (Rule 18/22 [D]) — clear them
ONLY when testing the legacy deep-dive/drill-down flows.

**How to run:** one DELETE per query, **never batched**. Use the Supabase MCP (`execute_sql`,
`project_id: "dxwpkjfypzxrzgbevfnx"`) when running interactively; headless, use the documented curl
bypass (MCP OAuth doesn't run headless — see memory `feedback_node_fetch_flaky_curl_bypass`). Never
via the Supabase dashboard UI for speed.

**Never touch the sacred tables** listed in CLAUDE.md §6 ("NEVER DELETE"). Those hold real student data. If a test seems to require clearing one, STOP and ask.

---

## SECTION 3 — LOGIN RITUAL (TESTBOT ACCOUNT) **[LEGACY — retired chat-stack protocol; not the live product surface]**

```
Email:    testbot@example.com
Password: TESTBOT_PASSWORD in .env.local (rotated 2026-07-12 — never write the value into a committed doc)
```

If the account doesn't exist, run `npx tsx --env-file=.env.local create-user.ts` from the repo root (reads `TESTBOT_PASSWORD`).

**UI quirk**: `/login` defaults to the **signup** form ("Create your account"). To sign in:

1. Snapshot the page: `mcp__Claude_Preview__preview_snapshot`.
2. Find buttons: `Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim())` — the third entry is usually `"Sign in"` toggle.
3. Click the toggle (native click works here — `buttons[2].click()`).
4. Now fill email + password via `preview_fill`.
5. Click the submit button — text changes to `"Sign In"` (capital I) after toggle.
6. Wait 2-3s. Verify `window.location.pathname === "/"`.

---

## SECTION 4 — CONCEPT LOAD RITUAL **[LEGACY — retired chat-stack protocol; not the live product surface]**

```javascript
// Step 1: Fill the concept input (chat composer)
preview_fill({
  selector: 'input[placeholder*="physics concept"]',
  value: '<CONCEPT_NAME_IN_PLAIN_ENGLISH>'  // e.g. "normal reaction"
});

// Step 2: Submit via form.requestSubmit (NOT Enter key — flaky)
preview_eval({ expression: `
  const inp = document.querySelector('input[placeholder*="physics concept"]');
  inp.closest('form')?.requestSubmit();
` });

// Step 3: Wait for lesson + simulation generation
// Cache miss = 25-40s on Sonnet + Gemini chain.
// Cache hit  = 1-3s.
// Run a background sleep while watching preview_logs for:
//   "POST /api/generate-simulation 200"
//   "[aiSimGen] multi_panel cached"  OR  "fromCache: true"
```

**Failure signals** (fail-fast conditions — abort this concept, file a bug):
- `[aiSimGen] ❌ confidence gate: FAIL` — Sonnet brief rejected as low-confidence
- `[EPIC-L BYPASS] states: [ ]` (empty) — concept JSON has no states authored
- `POST /api/generate-simulation 500` — pipeline crashed
- `[subSimSolverHost] enabled=true ... warnings=N` where N > 0 AND no `"relaxed required→strong"` entries — unresolved layout failures

---

## SECTION 5 — THE PER-STATE AUDIT (THE CORE OF THIS PROTOCOL)

For a concept with N states, you will perform N audits. **Do not skip. Do not sample.**

### 5.0 Pre-audit: record expected shape

Before clicking anything, extract the concept's ground truth:

```javascript
// Load the JSON to know what SHOULD appear at each state
// Open src/data/concepts/<concept_id>.json
// For each state, record:
//   - state_id (e.g. STATE_1)
//   - title (from state.title or from teacher_script_flat)
//   - advance_mode
//   - allow_deep_dive (true/false)
//   - scene_composition.primitives.length
//   - focal_primitive_id
//   - Expected specific elements from teacher_script (look for:
//     arrow names, label values, formula strings, slider names,
//     color words, direction words)
```

### 5.1 State click ritual (USE THIS EXACT SEQUENCE) **[LEGACY — retired chat-stack protocol; not the live product surface]**

React's synthetic-event system can drop plain `.click()` calls when the pill is deep in a rerender. Use the MouseEvent sequence:

```javascript
const pill = Array.from(document.querySelectorAll('button'))
  .filter(b => b.className.includes('shrink-0') && b.className.includes('rounded-md'))
  .find(p => p.textContent.trim() === '<NUMBER>');
pill.scrollIntoView();
const r = pill.getBoundingClientRect();
['mousedown','mouseup','click'].forEach(t =>
  pill.dispatchEvent(new MouseEvent(t, {
    bubbles: true, cancelable: true, view: window,
    clientX: r.x + r.width/2, clientY: r.y + r.height/2
  }))
);
```

**Fallback if React state still doesn't update**: send `SET_STATE` postMessage directly to BOTH iframes. This bypasses TeacherPlayer but confirms the renderer works:

```javascript
document.querySelectorAll('iframe').forEach(f => {
  f.contentWindow?.postMessage({ type: 'SET_STATE', state: 'STATE_<N>' }, '*');
});
```

If only the postMessage path works, **that is a bug** — file it as "pill→iframe ref binding gap, revisit session 16/17 fix."

### 5.2 Wait 2 seconds

```bash
sleep 2
```

Do not shortcut this. Choreography sequences are designed to animate over 600-1500ms. Screenshotting too early gives you a half-composed scene.

### 5.3 Observation probe (run EVERY state)

Run this probe via `preview_eval` and capture the output into your observation log:

```javascript
(() => {
  const iframe = document.querySelectorAll('iframe')[0];
  const w = iframe.contentWindow;
  const state = w.PM_currentState;
  const st = w.PM_config?.states?.[state] || {};
  const scene = Array.isArray(st.scene_composition)
    ? st.scene_composition
    : (st.scene_composition?.primitives || []);
  const prims = scene.map(p => {
    const rp = p._solverPosition || p._resolvedPosition || p.position || {};
    const x = typeof rp.x === 'number' ? Math.round(rp.x) : rp.x;
    const y = typeof rp.y === 'number' ? Math.round(rp.y) : rp.y;
    return {
      id: p.id, type: p.type, priority: p.priority,
      x, y,
      source: p._solverPosition ? 'solver' :
              p._resolvedPosition ? 'resolved' :
              p.position ? 'raw' : 'none',
      atZero: x === 0 && y === 0,
      offCanvas: (typeof x === 'number' && (x < 0 || x > 760)) ||
                 (typeof y === 'number' && (y < 0 || y > 500)),
      label: p.label || p.equation_expr || p.text || null,
      hasUninterpolatedTemplate: /\{[A-Za-z_][A-Za-z0-9_]*\}/.test(
        JSON.stringify(p.label || p.equation_expr || p.text || '')
      )
    };
  });
  return {
    state, total: prims.length,
    atZero: prims.filter(p => p.atZero).length,
    offCanvas: prims.filter(p => p.offCanvas).length,
    templateLeak: prims.filter(p => p.hasUninterpolatedTemplate).length,
    byType: prims.reduce((a, p) => ({ ...a, [p.type]: (a[p.type] || 0) + 1 }), {}),
    targeted: prims.filter(p => ['label','annotation','formula_box'].includes(p.type)),
    forces: prims.filter(p => p.type === 'force_arrow'),
    panelB_state: document.querySelectorAll('iframe')[1]?.contentWindow?.PM_currentState || null
  };
})()
```

### 5.4 Per-state pass criteria

A state passes its audit **only if ALL hold**:

| # | Criterion | Auto-detect |
|---|-----------|-------------|
| A | `total ≥ 3` primitives in scene_composition | Rule 19. If <3, FAIL and file JSON bug. |
| B | `atZero === 0` | Any (0,0) drop = FAIL. Likely solver regression or Sonnet cargo-culting `required`. |
| C | `offCanvas === 0` | Any primitive with x<0, x>760, y<0, y>500 = FAIL. |
| D | `templateLeak === 0` | Any `{foo}` literal in rendered text = FAIL. Label interpolation regression. |
| E | At least one `force_arrow` on a force-diagram concept | Viz integrity check. |
| F | `targeted` primitives (label/annotation/formula_box) use `priority: "strong"` (not "required") — unless that state has exactly ONE tiny "required" primitive (rare exception per v2 prompt rule) | Priority audit. |
| G | `panel_b_state === state` (when dual-panel) | Bidirectional sync — state synced across both iframes. |
| H | The teacher script for this state (visible in TeacherPlayer headline area) mentions specific elements that you can SEE on the canvas — arrows, values, labels | Script-to-sim coherence. Manual visual check. |

### 5.5 Screenshot + script-alignment check

1. `preview_screenshot` → eyeball the canvas.
2. Read the teacher_script headline/body for this state from the UI.
3. **List every noun in the script** that refers to a visible entity (arrow, label, slider, value, color, region).
4. For each noun, confirm it is present on the canvas.
5. If script says "N = 588 N" and canvas shows "N = 19.6 N" or "N = {N_value}" — **FAIL**. Open a bug.
6. If script says "a red F arrow appears at mid-height" and no red arrow exists — **FAIL**.

Record the alignment result as **"Script↔Sim: Aligned / Drifted (list drifts)"**.

### 5.6 Physics sanity check (per viz_type)

| viz_type | Must satisfy |
|----------|--------------|
| `force_diagram` (normal reaction, FBD, contact) | (a) Weight arrow points down (`direction_deg: 270`); (b) Normal force points **perpendicular to surface** (90° if horizontal floor, surfaceAngleDeg+90 if incline); (c) If surface tilts and N doesn't tilt with it, FAIL. (d) Numeric label on arrow equals formula (N = m·g·cos θ for incline). |
| `kinematics` (projectile, uniform) | (a) v-arrow tangent to path at current position; (b) trajectory traces a parabola under gravity (symmetric about apex); (c) g-arrow always downward. |
| `circuit` (Ohm's, KCL, KVL) | (a) Current direction arrows consistent with conventional current (positive to negative external); (b) junction current sum = 0 (KCL); (c) loop voltage sum = 0 (KVL). |
| `vectors` (addition, components) | (a) Resultant = vector sum of components (head-to-tail); (b) angle consistent with atan2(y,x); (c) magnitude label matches √(x²+y²). |
| `graph_interactive` (Panel B) [LEGACY renderer — retired] | (a) curve equation matches formula in Panel A (e.g. N = mg cos θ cosine shape); (b) live_dot x-coord === Panel A slider value; (c) y-coord on curve, not drifting. |

If any of these fail, **DO NOT sign off** — file a "physics integrity" bug with severity: HIGH.

### 5.6b Motion & interaction quality check (from reviewer feedback, 2026-06-15)

For any state with motion, a trajectory, or interaction, ALL must hold (first surfaced by reviewer
Asmi Singh on `magnetic_force_moving_charge`; these are the general, sim-agnostic form of her bugs):

| # | Criterion | Why |
|---|-----------|-----|
| M1 | **Trajectory/path renders FULLY and PERSISTS** — the path the student is meant to see is drawn end-to-end and does not fade or clear mid-motion. A circular path must **close into a full loop.** | Asmi #11/#11b — "only halfway then it's not there"; "circle not completed". Most-flagged rendering bug. Common root cause: trail buffer too small (wraps and erases the start before the loop closes). |
| M2 | **Animation timing is physically faithful**, not just "moving." Relative speeds/durations must match the physics (e.g. at θ=45°, v·cosθ=v·sinθ ⇒ circular motion and forward drift cover equal distance in equal time — neither should look slower). | Asmi #12 — animation showed the circle taking longer than the drift, which is wrong at 45°. Watch for hardcoded speeds divorced from the real timescale. |
| M3 | **Freeze/pause is discoverable AND resumes from the frozen position (never restarts at t=0).** | Asmi #13 — she first thought she couldn't pause; verify the affordance is obvious and resume continues, not restarts. |

If any of M1–M3 fail, file a rendering/motion bug; do not sign off the visual gate.

### 5.7 State audit observation template

Fill this block for EACH state and append to session report:

```
## STATE_<N> audit

- advance_mode: <auto_after_tts | manual_click | wait_for_answer (LEGACY — Rule 15/31, never on new concepts) | interaction_complete>
- allow_deep_dive: <true | false>
- Probe: total=<N>, atZero=<N>, offCanvas=<N>, templateLeak=<N>
- byType: <dict>
- Targeted priorities: <count strong / count required>
- Panel B synced: <yes | no | N/A>
- Script↔Sim: <Aligned | Drifted — list drifts>
- Physics sanity: <Pass | Fail — list violations>
- Screenshot: <filename or "eyeballed OK">
- Anomalies: <list or "none">
- Verdict: <PASS | FAIL>
```

---

## SECTION 6 — BIDIRECTIONAL SYNC TEST (DUAL-PANEL CONCEPTS)

Only for concepts with `panel_b_config`. Confirm which via:

```javascript
preview_eval({ expression: `document.querySelectorAll('iframe').length` })
// Returns 2 for dual-panel concepts.
```

### 6.1 Panel A → Panel B

1. Navigate to a state with sliders in Panel A (e.g. normal_reaction STATE_5 has theta + mass canvas sliders).
2. Record baseline: value of Panel A's `PM_sliderValues` and Panel B's `PM_currentState` + live_dot position.
3. Drag Panel A slider programmatically:
   ```javascript
   document.querySelectorAll('iframe')[0].contentWindow.postMessage({
     type: 'PARAM_UPDATE', key: 'theta', value: 45
   }, '*');
   ```
4. Wait 500ms.
5. Verify Panel B's live_dot x-coordinate moved to ~45.
6. Verify no echo loop (Panel A didn't re-emit same value).

### 6.2 Panel B → Panel A

1. Panel B has DOM sliders (HTML `<input type="range">`) below the graph.
2. Find and change: `document.querySelectorAll('input[type="range"]')[0].value = 60; fireInput;`.
3. Wait 500ms.
4. Verify Panel A's displayed value updated (arrow length, label, etc.).

### 6.3 Pass criteria

- Both directions propagate within 500ms.
- No infinite echo (PARAM_UPDATE count ≤ 2 per drag via `preview_network`).
- Graphs + sims share identical variable values across both panels.
- If state has `no slider`, PARAM_UPDATE must not leak (STATE_2 N-arrow bleed bug from session 17).

---

## SECTION 7 — DEEP-DIVE VERIFICATION

> **DEFERRED — DO NOT TEST (2026-06-11).** Deep-dive is not part of the current
> phase (EPIC-L-first directive). Additionally, the runtime-generation flow this
> section describes (`[deepDiveGenerator]` Sonnet calls on button click) is the
> OLD design, superseded by Rule 18: the "Explain step-by-step" button routes to
> a one-sentence feedback form (`feedback_unified` write); deep-dive sub-sims are
> hand-authored later, only when analytics flag a state. This section is kept for
> reference only and must be rewritten before deep-dive testing ever resumes.

For EACH state with `allow_deep_dive: true`:

### 7.1 Trigger

1. Navigate to the parent state (via 5.1 ritual).
2. Wait for TeacherPlayer to render the **"Explain"** button (becomes visible when `currentStepIdx` matches a deep-dive-capable state).
3. Click Explain via the MouseEvent sequence (section 5.1).

### 7.2 Watch the logs

Expected in `preview_logs` within 30-60s:

```
[deepDiveGenerator] prompt_variant=v2-relationships (DEEP_DIVE_USES_RELATIONSHIPS=1)
...
[deepDiveGenerator] stop_reason: end_turn | output_chars: <N>
[subSimSolverHost] enabled=true states=<4-6> primitives_resolved=<N> warnings=<N>
```

**Pass criteria**:
- `stop_reason: end_turn` (NOT `max_tokens`, NOT `stop_sequence`)
- `output_chars < 60000` (if larger, Sonnet is over-writing)
- `warnings: 0` OR only `"Anchor tie relaxed required→strong"` notes (safety net = amber badge, not a fail)
- `states: 4-6` (per CLAUDE.md §7 DEEP-DIVE rule)
- `primitives_resolved > 0` (if 0, the solver didn't see any targeted primitives → JSON authoring bug)

### 7.3 Walk every sub-pill

After sub-pills render (5a, 5b, 5c, ...), click through EACH:

1. Click sub-pill (MouseEvent sequence).
2. Wait 2s.
3. Run the observation probe (5.3) on the CURRENT sub-state (e.g. STATE_5_DD3).
4. Apply the per-state pass criteria (5.4) to the sub-state.
5. Screenshot.

Sub-states have the SAME bar as parent states. "It's a sub-sim" is not an excuse for junk.

### 7.4 Exit and re-enter

1. Click "Exit" chip → verify return to parent state cleanly (no orphan primitives visible).
2. Click "Explain" again → verify the deep-dive is now **served from cache** (`[deepDiveGenerator] CACHE HIT`) not regenerated.

### 7.5 Sub-state coherence check

Sub-states should elaborate the PARENT state, not introduce unrelated concepts. For STATE_5 on normal_reaction (student playing with sliders):

- ✅ Sub-states about: "what happens when theta=0", "what happens when theta=90", "why N=mg cos θ", "does mass affect angle of N"
- ❌ Sub-states about: unrelated concepts (friction coefficient derivation, tension in a rope, etc.)

If sub-states drift off-concept, file as "DEEP-DIVE coherence drift" — Sonnet needs prompt tightening.

---

## SECTION 8 — DRILL-DOWN VERIFICATION

> **DEFERRED — DO NOT TEST (2026-06-11).** Drill-down is deferred with deep-dive
> under the EPIC-L-first directive — it only earns its keep once real students
> type real confusion phrases. Kept for reference until that phase.

### 8.1 Trigger

1. Navigate to any state.
2. Click "Confused?" chip (amber pill) OR type into the drill-down input.
3. Type a REAL common confusion phrase for the concept. Examples:
   - normal_reaction: "why no friction here"
   - projectile_motion: "why does the trajectory curve down"
   - ohms_law: "why does current stop when you cut the wire"

### 8.2 Classification log

Watch for:

```
[drillDownClassifier] cluster_id=<some_cluster>  confidence=<0.N>
```

### 8.3 Cache-hit vs miss

- **Cache hit**: response in <500ms, cluster_id maps to pre-authored entry.
- **Cache miss**: `[drillDownGenerator] prompt_variant=v2-relationships` → Sonnet generates → cached.

### 8.4 Pass criteria

- Classifier confidence ≥ 0.70 (if lower, the phrase is an edge case worth adding to a cluster).
- Response shows 2-4 sub-states (MICRO or LOCAL protocol per CLAUDE.md §9).
- Sub-states render cleanly (apply per-state audit 5.4).
- Response text directly answers the typed confusion (not a generic re-explain).

---

## SECTION 9 — MODE SWITCH TEST (BOARD + COMPETITIVE)

> **⛔ DO NOT TEST — DEFERRED (conceptual-only directive, founder 2026-06-11).**
> Board mode and competitive mode are dropped for the current phase (CLAUDE.md
> Rule 20 suspension; DISCUSSIONS.md Sessions 61/63/65). New concepts ship with
> NO `mode_overrides`, so there is nothing to mode-switch-test. The only live
> check for legacy concepts that already carry a board override is Gate 21 in
> `npm run validate:concepts` (all-or-nothing completeness) — no browser testing.
> The "Mode override missing — Phase E retrofit required" filing rule at the end
> of this section is RETIRED: missing modes are now the expected, correct state.
> This section is preserved for when modes resume.

Only for concepts with `mode_overrides.board` or `mode_overrides.competitive` populated. Check via:

```bash
grep -A1 "mode_overrides" src/data/concepts/<concept_id>.json
```

### 9.1 Board mode

1. Click mode tab → **Board**.
2. Verify:
   - Canvas background switches to `canvas_style: "answer_sheet"` (white ruled).
   - Each state progresses the `derivation_sequence` — lines appear with `animate_in: "handwriting"`.
   - Yellow `mark_badge` appears when derivation reaches a line in `mark_scheme`.
   - Final state = complete answer template (student can reproduce on exam).
3. Click "Download PDF" → verify PDF downloads and contains the derivation.

### 9.2 Competitive mode

1. Click mode tab → **Competitive**.
2. Verify:
   - Shortcut explanations render as MICRO chips or LOCAL sub-sims.
   - Trap-recognition examples appear (e.g. "students get this wrong because…").
   - Teacher script uses temp 0.3 voice (tighter, more formula-heavy).

If either mode is missing entirely for a concept that should have it, file: **"Mode override missing — Phase E retrofit required."**

---

## SECTION 10 — SESSION REPORT (COPY-PASTE FINALIZER)

At the end of every test session, append a block to `PROGRESS.md` AND to your final chat message to the Architect:

```
## <DATE> — Verification session: <CONCEPT_ID>

### Scope
- States tested: <list>
- Deep-dives tested: <list of parent states>
- Drill-downs tested: <list of phrases>
- Modes tested: <Conceptual / Board / Competitive>

### Terminal indicators
- stop_reason: <end_turn / other>
- output_chars: <N>
- subSimSolverHost warnings: <N> (relaxed: <N>, infeasible: <N>)
- Generate-simulation latency: <N s>
- POST errors in session: <list>

### Per-state verdicts
- STATE_1: PASS | FAIL (<reason>)
- STATE_2: PASS | FAIL
- ...

### Physics integrity
- <Per viz_type check — pass or specific failure>

### Script↔Sim alignment
- <Aligned OR list of drifts per state>

### Bidirectional sync (if dual-panel)
- Panel A → B: <ok | ms latency | broken>
- Panel B → A: <ok | ms latency | broken>

### Deep-dive coherence
- Sub-states stayed on-concept: <yes | no — which drifted>
- Cache hit on re-trigger: <yes | no>

### Drill-down hit rate
- Phrases classified ≥0.70 confidence: <N / total>

### Overall verdict
- SHIP: <green | amber | red>

### Bugs filed (new this session)
- [SEVERITY] <title> — <one-line description> — <file:line if known>

### Follow-ups for next session
- <item>
```

---

## SECTION 11 — BUG SEVERITY RUBRIC

When filing a bug discovered during test, classify it:

| Severity | Definition | Example | Response |
|----------|------------|---------|----------|
| **CRITICAL** | Student sees broken physics or unreadable content on a shipped concept | `N = {N_value}` template leak; primitive at (0,0); physics sign flipped | **Fix in the same session.** Don't ship until fixed. |
| **HIGH** | Pedagogy is compromised but the page renders | Teacher script mentions an arrow that doesn't appear; Panel B doesn't update from Panel A slider | **File + attempt fix same session.** If complex, create a plan doc and ship the test verdict as AMBER. |
| **MEDIUM** | Ergonomics / polish issue, no physics/pedagogy impact | State pill click requires MouseEvent sequence; "Pending Review" badge misaligned on narrow viewports | **File for next session.** Ship verdict GREEN. |
| **LOW** | Nit, wording, spacing | Tooltip capitalization; extra empty line in teacher script | **Note in report, don't file.** |

When in doubt, escalate. CRITICAL > HIGH > MEDIUM > LOW. A bug lower than its real severity is worse than one higher.

---

## SECTION 12 — PROTOCOL EVOLUTION

This file is a living document. When you discover a new failure mode during testing that isn't caught by any step above, add a new check.

**Rule for editing this file**: propose the addition in your session report with explicit reasoning. Do not edit `CLAUDE_TEST.md` silently — the protocol is a contract, and changes need Architect review (same rule as CLAUDE.md).

When you propose a check:
1. Quote the failure you observed.
2. Explain why existing checks didn't catch it.
3. Propose the new check (code + pass criterion).
4. Estimate the false-positive rate.

---

## SECTION 13 — KNOWN TOOL QUIRKS (WRITTEN DOWN SO YOU DON'T RE-DISCOVER)

| Quirk | Workaround |
|-------|------------|
| `.click()` on React pills sometimes doesn't update state | Use MouseEvent sequence (mousedown + mouseup + click) from section 5.1 |
| `/login` defaults to signup form | Click "Sign in" toggle (usually 3rd button) before filling credentials |
| `scene_composition` shape differs: array directly for inline sub-states, `{primitives: []}` for some JSONs | Probe checks both: `Array.isArray(...) ? ... : (x?.primitives \|\| [])` |
| Primitive position precedence | `_solverPosition > _resolvedPosition > position`. Never read raw `position` if solver ran. |
| Sonnet 16k-token deep-dive takes 30-60s | Use `run_in_background: true` on sleep, then check logs. Never poll in a tight loop. |
| Canvas bounds | 760 × 500 px (matches `createCanvas(760, 500)` in parametric_renderer.ts) (PCPL/parametric legacy concepts only — field_3d/particle_field don't use this canvas). Off-canvas = x<0 OR x>760 OR y<0 OR y>500. |
| Gemini overload → Anthropic Haiku fallback | Not a bug. But if Haiku then fails with "text content blocks must be non-empty," that IS a bug (empty system prompt on fallback). |
| `npm run dev` from `C:\Tutor\` not `C:\Tutor\physics-mind\` | launch.json uses `--prefix physics-mind` to handle this. |

---

## SECTION 14 — FORMAL TEST-REPAIR PROCEDURE (added 2026-04-22)

The iterative cycle every new concept — and every regenerated concept — flows
through. Replaces ad-hoc "spot-fix the broken JSON" with a systematic
fix-once-regenerate-many loop.

```
1. E25 (Sonnet 5-agent) generates concept JSON          [offline]
2. E42 Physics Validator runs                           [HARD GATE]
3. npm run validate:concepts (Zod schema)               [HARD GATE]
4. Cache prewarm — all 3 modes, all allow_deep_dive     [offline]
5. E43 Visual Probe + human pass (this file §5)         [session]
6. Bug triage — classify every finding as exactly one of:
     (a) prompt gap     → edit deep_dive_generator_v2.txt (or similar),
                          re-run E25 on affected concepts
     (b) renderer bug   → fix parametric_renderer.ts (or similar) ONCE,
                          regenerate ALL affected cached sims
     (c) engine bug     → fix engine, re-run prewarm
     (d) Sonnet physics → add rule to E42 Physics Validator, re-run E25
7. Pradeep approves via /admin/proposal-queue (Phase I).
8. Promoted to production cache. Old cache invalidated.
```

**Hard rule**: never hand-patch a single concept JSON to fix a bug. The root
cause lives in prompt / renderer / engine / validator — fix it there, and all
affected concepts get the fix on next regeneration. Hand-patches don't scale
to 150 concepts, let alone 500.

**Triage example from session 18** — three bugs found on `normal_reaction`:
- mg_perp direction 240° vs correct 300° → **(d) Sonnet physics** → add
  "mg_perp direction_deg = N direction_deg ± 180°" rule to E42.
- `drawVector` doesn't accept `magnitude + direction_deg` → **(b) renderer
  bug** → fix `parametric_renderer.ts:1222` once, regenerate all.
- `drawAngleArc` ignores `surface_id` → **(b) renderer bug** → fix
  `parametric_renderer.ts:1459` once, regenerate all.

Fixing these four places (prompt + E42 + renderer:1222 + renderer:1459) heals
every concept's deep-dive cache on next prewarm. No per-concept edits.

---

## SECTION 15 — VISUAL PROBE AUTOMATION (Phase I)

Today: CLAUDE_TEST.md §5 is a human-run checklist. Claude runs the probe,
writes a session report, you read it.

After Phase I: the probe also writes a structured row to `test_session_log`:

```json
{
  "session_id": "<uuid>",
  "run_at": "2026-04-22T14:30:00Z",
  "concept_id": "normal_reaction",
  "verdict": "amber",
  "bugs_filed_json": [
    { "severity": "CRITICAL", "title": "theta_arc_dd1 at (0,0)",
      "state_id": "STATE_3_DD1", "file_hint": "parametric_renderer.ts:1459" }
  ],
  "probe_warnings_json": [
    { "type": "bbox_overflow", "primitive_id": "formula_perp_dd3",
      "state_id": "STATE_3_DD3" }
  ],
  "ran_by": "claude"
}
```

E39 Collector picks this up at 1 AM the same night. E40 Proposer sees a
CRITICAL bug at a known `file_hint`, opens an `engine_bug_queue` ticket, and
if the cluster has other feedback pointing at the same primitive type, drafts
a prompt-rule addition. All before your morning coffee.

**What this unlocks**: your testing becomes data. Every session you run makes
the next session's probe catch more. The probe → `test_session_log` → E39 →
E40 → `engine_bug_queue` loop is the self-improving loop in miniature.

Until Phase I lands, keep running §5 by hand and writing the §10 session
report manually. No data lost — when `test_session_log` ships, past reports
can be backfilled from PROGRESS.md.

---

## QUICK REFERENCE — THE FAST-PATH DRILL (2026-07-12)

For fast-path sessions where you already know the protocol, the minimal LIVE loop:

1. `git status` clean + `npx tsc --noEmit` zero errors + `npm run validate:concepts` target PASS
2. Clear the 4 live caches (separate queries; +2 dormant caches only for legacy flows — §2)
3. `npm run visual:eyes -- <id>` ($0) → dispatch **eye-walker** for the frame read
4. `npm run build:review -- <id>` + serve → HTTP 200 spot-check
5. `smoke:visual-validator` ONLY as paid escalation (EYE inconclusive / founder asks)
6. Zero new `engine_bug_queue` rows → founder review → `visual:approve`

**[LEGACY chat-stack drill — retired]:** preview_start → testbot login → type concept →
per-state pill clicks → sync test → mode switches. Reference only (§3–§6); deep-dive/drill-down
remain deferred (§7/§8 banners).

---

*The concept JSON is authored once. The test protocol runs forever.*
*This is how PhysicsMind catches its own drift.*
