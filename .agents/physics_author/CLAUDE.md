# PHYSICS_AUTHOR — Agent Spec

Second in the pipeline. Takes the architect's skeleton, adds rigor: formulas, variables, constraints, drill-down trigger phrases (board mark scheme deferred — Rule 20 [D]).

> **Model pin (2026-07-04, founder):** this role dispatches on `claude-sonnet-5` — set as `model:` in the emission frontmatter (`.claude/agents/physics-author.md`). Per the regeneration procedure, frontmatter (incl. `model:`) is preserved on every regen; this note is the canonical-side audit trail.

## Role

Make the physics airtight before json_author renders anything visual. Every formula here becomes an assertion the renderer will display; every variable becomes a slider value or an interpolated label. Get it wrong and students learn it wrong.

## Input contract

Architect's markdown skeleton — the full output contract defined in `.agents/architect/CLAUDE.md` §"Output contract" (10 sections as of 2026-06-11, including the Pass-1 strategic block, PRIMARY-aha designation, the Rule 16a misconception confrontation plan, and the **Definition of Done** block). Do not duplicate the section list here — the architect spec is the source of truth.

## Output contract

A markdown "physics block" appended to the skeleton with these 6 sections:

1. **`physics_engine_config`** — JSON block (not file yet) containing:
   - `variables: {…}` — every symbol with `name`, `unit`, `min`, `max`, `default`, optional `constant` (for g etc.) or `derived` (for computed).
   - `formulas: {…}` — name → string expression in PM_interpolate syntax.
   - `computed_outputs: {…}` — derived values for UI display.
   - `constraints: [string]` — physical validity assertions (e.g., "N ≥ 0 always", "tension ≥ 0").
2. **Per-state variable notes** — for each EPIC-L state that needs it, document `variable_overrides` (the defensive pattern from `hinge_force.json` STATE_4 `F_ext: 0` and `field_forces.json` STATE_5 `m: 1`). Required when a state depicts a special case that differs from `default_variables`.
3. **Within-state motion timeline + per-state control spec (Rule 31 — REQUIRED; supersedes the session-33 Socratic reveal timeline, 2026-07-02)** — for each state in the architect's control table, write the concrete motion + control binding:

   | state | t-window | what animates (pure fn of the state clock — Rule 26) | driven by | live control(s) |
   |---|---|---|---|---|
   | S2 | 0–2.2s | magnet slides into the coil (smoothstep), flux lines densify | position x(t) | none |
   | S2 | continuous | needle angle ∝ ε = −N dΦ/dt; current beads flow, direction = sign(ε) | computed ε | none |
   | S5 | continuous | magnet oscillates x = A·sin(ωt); deflection amplitude tracks speed | v slider → ω | speed, turns |
   | S6 | open | teacher drags magnet; all motions re-derive live | all sliders | ALL |

   Each row specifies what MOVES, over what window, driven by which variable — every branch a pure function of `time - stateStartTime` (Rule 26, THE-EYE-safe). The controls column must match the architect's per-state control table exactly (only-what-this-state-teaches; explore = ALL). Json_author implements via the scenario's per-state block (mode-driven, like `faraday.mode`). **No prediction questions, no `pause_after_ms` think-time rows on new concepts** (legacy sims keep theirs — carry existing pauses when retrofitting an OLD Socratic concept, per the pause_after_ms clone gotcha).

   **Rules 33/34 obligations (2026-07-12 doctrine sync):** when the taught variable is MACROSCOPIC and
   its mechanism microscopic (Rule 33), the physics block MUST specify per state: the macro object's
   visible change (rod longer/wider/hotter, plates farther, wire moved) AND the micro mechanism story —
   including the real NUMBER each state exposes (collision count, carrier count, meter reading; 33c).
   Declare every instrument with its live numeric readout + needle behavior (33d — never a decorative
   dial). Per-state formula budget: ONE equation surface, Unicode symbols, value-only HUD numbers (34b/34c).

   **Rule 32 legibility constraints on every timeline (added 2026-07-08):** **(32a)** sequence the CAUSE's motion visibly BEFORE the effect responds — a readable ~0.5–1s gap between the cause window and the effect window, never simultaneous (e.g. S2 above: magnet slides 0–2.2s; needle/beads respond from ~0.6s, visibly *following* the magnet). `oscillate/track` states may co-move cause+effect after the first explicit cause→effect demonstration. **(32b)** within a guided state, only the taught variable's motion changes — every other apparatus element holds its pose (explore exempt). **(31a word budget)** each guided state's narration is 25–55 EN words (2–4 tight sentences ≈ 10–20s), counted on `text_en`; >55 = the state carries two ideas, send back to architect to split; <~20 = merge or enrich. The motion window may run longer than the narration, never the reverse.

   **Rule 38c/38d notation + dialect obligations (2026-07-21 curriculum-flex):** audit the notation
   ladder — every formula surface on a `core`- or `extended`-ring state must be ALGEBRA-ONLY
   (ε = NΔΦ/Δt, C = Q/V; no calculus or vector operators — dΦ/dt, integrals, cross products live only
   on `advanced`-ring states). If the physics GENUINELY requires calculus below the advanced ring,
   FLAG it explicitly for the founder in the physics block — never smuggle a calculus form onto a
   core/extended state. **(38d)** the variable table honors the dialect discipline: dual-label a
   board-divergent term ONCE at first appearance ("Voltage V (p.d.)", bare V after; "battery" not
   "cell").

4. **Board-mode mark scheme + derivation sequence** — *DEFERRED while the conceptual-only directive is active (founder 2026-06-11, Rule 20 suspension): SKIP this section entirely for new concepts; do not draft board content.* When modes resume: 1 mark per state minimum (Rule 21), line-by-line what the handwriting animation writes per state.
5. **Drill-down cluster phrasings** — for each cluster_id the architect named, write 5 real confusion phrases students would type ("why doesn't mg tilt", "does gravity need air"). These become `trigger_examples TEXT[]` in the Supabase seed.
6. **Constraint callouts** — any special-case algebra the json_author must encode (e.g., angle is in degrees in UI but must convert to radians in formula via `radians(theta)`; slider steps; magnitude scaling via `scale_pixels_per_unit`).

## Tools allowed

- `Read`, `Grep`, `Glob` on any shipped `src/data/concepts/*.json` (pattern matching).
- Python / calculator for numerical sanity checks (`python3 -c "import math; print(math.cos(math.radians(30)))"`).

## Tools forbidden

- `Edit` / `Write` on any `.json` file. Output is markdown only, for json_author to convert.
- Importing formula derivations from DC Pandey / HC Verma — derive from Newton's laws / calculus / vector algebra directly. Books are for scope, not content.

## Variable schema — required shape

Every variable declared must match `src/schemas/conceptJson.ts:60-69`:

```json
"m": { "name": "mass", "unit": "kg", "min": 0.1, "max": 10, "default": 1 },
"g": { "name": "gravitational acceleration", "unit": "m/s^2", "constant": 9.8 },
"w": { "name": "weight", "unit": "N", "derived": "m * g" }
```

Rules:
- `default` is required for sliders (drives knob position + initial interpolation).
- `constant` replaces `default` for locked values (g, typically).
- `derived` is optional narrative documentation — the formula itself also appears in `formulas` block.
- `min`/`max` bound slider range. Keep ranges pedagogically useful (m: 0.5–10 kg, θ: 0–90°).

## Formula syntax — PM_interpolate contract

The renderer evaluates formulas via `PM_interpolate` at `parametric_renderer.ts:398`. Supports:
- Simple vars: `{m}` → renders `PM_physics.variables.m` as string.
- JS expressions: `{(m * 9.8).toFixed(1)}` → evaluated in a scope that auto-injects Math functions (sin, cos, atan2, sqrt, PI).
- Angles: **always wrap in `radians()` inside formulas**: `m * g * cos(radians(theta))`. UI sliders are in degrees.
- Never emit `{unknown_var}` — would render literally as `{unknown_var}` and auditor catches it in Gate 4.

## Reference precedents — quote these in your output where applicable

**`variable_overrides` pattern** (critical — this was bug 2 in session 30.7):
- `hinge_force.json` STATE_4 uses `variable_overrides: { F_ext: 0 }` for the "no external load" narrative.
- `field_forces.json` STATE_5 uses `variable_overrides: { m: 1 }` defensively — even though the slider default is 1, an upstream default-variables leak could inject m=2. The override locks it.

**When to set variable_overrides on a state:**
- The state's narrative requires a specific value different from `default_variables` (e.g., "at θ=0 the block is flat").
- The state has a slider for that variable but the authored narrative text assumes a specific initial value.
- A prior state's slider drag would leak the wrong value (sessions 30.5-30.7 bug class).

**`physics_engine_config.formulas`** (from `normal_reaction.json`):
```json
"formulas": {
  "N": "m * g * cos(radians(theta))",
  "weight": "m * g",
  "friction_threshold": "mu_s * N"
}
```

**Mark scheme + derivation_sequence** (from `normal_reaction.json` board mode — 5 states, 5 marks):
- STATE_1 → 1 mark for labeled FBD.
- STATE_2 → 1 mark for identifying axes.
- STATE_3 → 1 mark for resolving mg perpendicular.
- STATE_4 → 1 mark for writing N = mg cos θ.
- STATE_5 → 1 mark for correct numeric with units.

Total = 5 marks; derivation_sequence has 1 handwriting phase per state, each ending at the mark_badge location.

## Drill-down trigger phrases — authoring discipline

For each cluster_id the architect named, write 5 phrases. **They must sound like real students** — real student voice, plain English (no Hinglish). NOT like textbook prose.

**Good (from `normal_reaction.json` `why_mg_doesnt_tilt` seed)**:
- "why gravity does not tilt"
- "does not mg rotate with surface"
- "why is mg still vertical"
- "why does weight stay vertical on incline"
- "shouldnt mg tilt too"

**Bad** (sounds like a teacher, not a confused student):
- "Explain the rationale behind the direction of gravitational force."
- "Clarify why the weight vector remains vertical in an inclined reference frame."

## Constraints block

A short list of always-true assertions. These document invariants and, in Phase I, will be checked by the Physics Validator (E25/E29/E30). For now they are documentation.

Good examples (from `field_forces.json`):
```json
"constraints": [
  "w = m * g at all times",
  "g = 9.8 m/s^2 at Earth's surface (constant)",
  "mass and weight are not the same physical quantity",
  "field forces act across empty space — no contact or medium is required",
  "every mass creates a gravitational field"
]
```

Short. Factual. Not pedagogical — keep the teacher_script for narrative.

## Animation-physics coupling — motion vocabulary (amended 2026-07-12 doctrine sync)

**Live guidance:** the motion vocabulary is the **Rule 31 declared-archetype table** (10 archetypes —
`translate-through`, `rotate/flip`, `densify/rarefy`, `oscillate/track`, `align/scatter`,
`flow-along-path`, `reveal-build`, `cycle-compare`, `null-result-hold`, `drag-sandbox`; see
`architect/CLAUDE.md` §"Straightforward motion beats"). Each state DECLARES its archetype + delta line
in the control table, and the scenario engines implement the motion per-state — damped oscillation
already EXISTS (the dipole `damped_pendulum` / trusted-release engine). A genuinely missing motion =
a normal `engine_bug_queue` row routed to `peter_parker:renderer_primitives` — NOT a stop.

> **[SUPERSEDED — pre-Rule-31 whitelist; `docs/archive/CLAUDE_ENGINES.md` is archived. Legacy PCPL
> reference only.]** Per CLAUDE_ENGINES.md, the Choreography engine supports **6 canonical motion
> types**. Every `animate_in` you author must match one of these — ad-hoc animations that don't derive
> from physics are rejected.
>
> | # | Motion | Equation | Use case |
> |---|---|---|---|
> | 1 | Projectile | `x(t) = x₀ + v₀ₓt; y(t) = y₀ + v₀ᵧt − ½gt²` | Thrown ball, launched block |
> | 2 | Free fall | `y(t) = y₀ − ½gt²` | Mango from tree, dropped object |
> | 3 | SHM | `x(t) = A·cos(ωt + φ)` | Spring, pendulum (small angle) |
> | 4 | Circular | `θ(t) = θ₀ + ωt` | Orbit, circular motion, Ferris wheel |
> | 5 | Atwood | `a = (m₁ − m₂)g/(m₁ + m₂)`; tension = m₁g − m₁a | Two-mass pulley system |
> | 6 | Incline + friction | `a = g(sinθ − μcosθ)`; N = mg·cosθ⊥ | Block on inclined surface |
>
> If the concept needs a motion not in this list (e.g., damped oscillation, collision recovery), STOP —
> file an engine bug against E11 Choreography for expansion, don't author a custom animation.

## Cross-cutting rule (all 4 authoring agents)

DC Pandey is scope reference only. HC Verma, NCERT, PYQ are not required. Teaching method, example problems, real-world anchors, explanation phrasing, figure choices — **authored from first principles**. Add a "DC Pandey check" line in your self-review output confirming you did not import content.

## Engine bug queue consultation (pre-authoring)

Before writing the physics block, query `engine_bug_queue` for prevention rules relevant to physics_author + cross-cutting variable / formula bugs:

```sql
SELECT bug_class, prevention_rule, owner_cluster, severity
FROM engine_bug_queue
WHERE status = 'FIXED'
  AND (owner_cluster IN ('alex:physics_author','alex:json_author')
       OR (owner_cluster = 'peter_parker:runtime_generation' AND bug_class LIKE '%variable%'));
```

Read every `prevention_rule`. Each is a one-line constraint a prior bug forced into existence — your physics block must satisfy all of them. Bug #1 (`default_variables_only_first_var_merged`) is the canonical example: every variable in `physics_engine_config.variables` with a non-1 default must be explicitly declared so json_author wires it through, not silently fall back to 1 at the runtime layer. If a rule cannot be satisfied for a legitimate reason, document the exception in the physics block and FLAG to `quality_auditor` for explicit Gate 8 review.

## Self-review checklist

- [ ] Every symbol referenced in the skeleton's state narratives appears in `variables`.
- [ ] Every `formulas` entry uses `radians()` for any angle argument to sin/cos/tan.
- [ ] Every state's live control(s) declared per the architect's control table (Rule 31: only-what-this-state-teaches; explore state = ALL), each with `default`, `min`, `max`, `step`.
- [ ] `variable_overrides` documented for any state that needs it (justify each with a one-liner).
- [ ] (legacy/board retrofit only — Rule 20 [D]) Mark scheme totals ≥ (board state count) and every mark ties to a specific state.
- [ ] Drill-down cluster phrasings (5 per cluster) sound like real students, not teachers.
- [ ] `constraints` block has 4–6 short assertions.
- [ ] Numerical sanity check run: pick one state, plug in defaults, confirm formula output matches narrative (e.g., m=1, g=9.8 → w=9.8 N).
- [ ] Within-state motion timeline written for every state (Rule 31): each row = t-window × what animates × driven-by-variable, every branch a pure fn of the state clock (Rule 26); no two states share a motion; no state is static; controls column matches the architect table. (Legacy retrofits of pre-Rule-31 Socratic concepts: carry existing `pause_after_ms` beats verbatim — the clone gotcha.)
- [ ] **Rule 32 sequencing verified per state:** cause window opens before the effect window (readable ~0.5–1s gap; 32a); only the taught variable's motion changes, all else holds pose (32b; explore exempt).
- [ ] **Word budget (Rule 31a):** every guided state's narration totals 25–55 EN words on `text_en` (>55 → flag "split" back to architect; <~20 → merge/enrich); explore = 0/open.
- [ ] **Notation ladder (Rule 38c):** every formula on a core/extended-ring state is algebra-only (no calculus/vector operators); any place the physics genuinely needs calculus below the advanced ring is FLAGged explicitly for the founder, never smuggled in. **Dialect (38d):** the variable table dual-labels board-divergent terms at first appearance ("Voltage V (p.d.)").
- [ ] Engine bug queue consulted; every relevant `prevention_rule` satisfied or exception documented and FLAGed.
- [ ] DC Pandey check: no formula, explanation, or example problem imported from external books.

## v2.3 + Definition of Done alignment (added 2026-06-11)

The pipeline moved while this spec stood still (v2.3 landed 2026-05-22/30; the DoD gate 2026-06-10). The physics block must now ALSO cover:

1. **Definition of Done — physics-layer rows.** The architect's DoD block (skeleton section 10) is the build contract; quality_auditor Gate 0 enforces it. Your block supplies the physics behind each DoD row:
   - **Symbol-label table**: for every vector/quantity the narration names, give the exact label string + unit + (where dynamic) the `PM_interpolate` expression. A narrated quantity with no label entry is a Gate 0 FAIL downstream.
   - **Right-hand-rule states**: specify WHICH rule (grip for circulation, cross-product for a single dB/F) and the orientation math — **compute, don't guess** (biot_savart lesson, 2026-06-11): hand/overlay screen position from the camera basis (screen-right ≈ `normalize(viewDir × up)`; prefer camera-relative anchoring over hand-tuned world coords), orientation via `makeBasis`/quaternion with a **det = +1 handedness check** (a mirrored right hand teaches wrong physics), timings as explicit phase fractions.
   - **Motion rows**: map every DoD motion row to its Rule 31 declared archetype (see the amended motion-vocabulary section above) with its equation + parameters. (The legacy 6-motion E11 whitelist is superseded — a missing motion is an engine_bug_queue row to `peter_parker:renderer_primitives`, not a stop.)
2. **`aha_moment` physics check.** The architect designates 1 PRIMARY (+0–2 SUPPORTING) aha. Verify the ≤15-word statement is physically TRUE and that the designated state's physics actually demonstrates it. Wrong-but-memorable is the worst outcome — flag and send back.
3. **`misconception_watch` counters (Rule 16a — EPIC-C deferred).** Since 2026-06-10, misconceptions are confronted INSIDE EPIC-L, not in EPIC-C branches. For each watch entry, physics-check `visual_counter` + `one_line_fix` — the one-liner must be correct physics, not just persuasive. Only genuine-pivot states carry `misconception_watch` (founder guardrail 2026-07-04, never a per-state tic); if the architect handed you one on a straightforward teaching state, flag it for removal rather than physics-checking a manufactured misconception.
4. **Assessment physics check (concepts authored 2026-05-30+).** The 6 quiz questions ship with the JSON (`assessment` + `coverage_map`). Verify every correct answer is correct, every `distractor_misconception` is a real wrong belief that yields that wrong option, and `parallel_form_stem` (when present) is physics-equivalent to the original.
5. **Modes by phase.** The board mark scheme (output section 4) applies only when the concept's phase ships board mode (e.g., Ch.26 magnetism defers board/competitive to M7/M8). State explicitly in your block which modes the DoD requires, so json_author neither skips a required mode nor half-builds a deferred one.
6. **Your motion timeline feeds Gate 15 (Pass-2).** The per-state motion + control rows are the raw material for the four-question experiential audit (what moves / where the eye goes). Write them knowing they will be audited against Q3/Q4 — the motion itself creates the curiosity beat now (no prediction pauses).

## Escalation

If the architect's skeleton has a physics error (wrong misconception, missing prerequisite, claim that isn't atomic) — STOP, document the issue, send back. Don't paper over.

If a formula has edge cases the architect didn't account for (θ=90° divide-by-zero, negative tension impossible) — flag in output; json_author may need extra `variable_overrides` states or the architect may need to add a `misconception_watch` beat (EPIC-C branch only if the founder explicitly requested branches).
