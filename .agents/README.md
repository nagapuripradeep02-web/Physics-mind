# `.agents/` — Role Specifications for Concept Authoring

These files codify **how one Claude instance plays each of five roles** when retrofitting or authoring an atomic concept JSON. They are NOT runnable subagents — they are documentation templates that the solo Claude reads per-session to stay aligned with hard-won learnings from sessions 1–30.

## The pipeline

```
architect ──► physics_author ──► json_author ──► quality_auditor ──► (ship)
                                                       │
                                                       ▼
                                               (nightly, orthogonal)
                                                       │
                                                       ▼
                                                feedback_collector
                                                       │
                                                       ▼
                                          proposal_queue → Pradeep approves
                                                       │
                                                       ▼
                                          architect re-opens (if new misconception found)
```

- **architect** decides WHAT: state count, arc shape, 4 EPIC-C branches, deep-dive hot states, prerequisites, Indian anchor.
- **physics_author** decides HOW MUCH: formulas, variables, constraints, mark scheme, drill-down phrasings.
- **json_author** decides WHERE: coordinates, primitives, modes, registration.
- **quality_auditor** decides IF: 7 gates, silent-failure probes, anti-plagiarism, visual walk.
- **feedback_collector** decides WHAT CHANGES NEXT: cluster proposals from live student signal (Phase I, offline).

## Reading order per session

Each agent reads **only its own file** plus:
1. Project-level `C:\Tutor\CLAUDE.md` (mandatory every session).
2. `C:\Tutor\physics-mind\PLAN.md` (mandatory every session).
3. Upstream agent's **output** (not spec) — e.g., json_author reads physics_author's markdown block, not physics_author's spec file.
4. Reference files as needed: `CLAUDE_REFERENCE.md`, `CLAUDE_ENGINES.md`, `CLAUDE_TEST.md`.

**Anti-pattern**: reading all 5 agent specs at once. Context bloat + role confusion. The solo Claude is ONE agent at a time.

## Hard-won learnings baked into every spec

From sessions 30.5–30.7 bug sprint (see PROGRESS.md):

1. **Zod-pass ≠ works.** quality_auditor has 7 active probes; Zod is just gate 2.
2. **Off-canvas primitives slip past Zod.** Bounds check in `validate-concepts.ts` + quality_auditor gate 4 visual walk.
3. **Variable interpolation can leak** from test-env defaults into production labels. `variable_overrides` defensive pattern on critical states.
4. **UI stale-closure bugs** infect drill-down state sync. quality_auditor gate 6 inspects the network request body.
5. **Empty cluster registry** silently breaks drill-down. json_author ships a SQL migration with every concept; quality_auditor verifies row count before gate 6.
6. **DC Pandey is scope-only** (Rule 8). All 4 authoring agents include a DC Pandey check in their self-review.

## Proof-run plan — session 32

Target concept: **`umbrella_tilt_angle`** (Ch.5 Vectors/Kinematics, currently legacy-FAIL).

Why this one:
- Atomic (one teachable idea — apparent rain direction = rain velocity relative to runner).
- Has one sharp misconception ("rain is always vertical") — clean EPIC-C STATE_1.
- Medium complexity: 5-state EPIC-L arc (hook → vector diagram → relative velocity → formula → interactive angle slider).
- Indian anchor ready-made: Mumbai local monsoon, auto-rickshaw passenger tilting the umbrella.
- Physics_engine_config fits the vector_resolution template — 3 variables (v_rain_y, v_runner_x, tilt_angle), 2 formulas.

Session 32 procedure:
1. Solo Claude reads ONLY `architect/CLAUDE.md` + project CLAUDE.md. Produces architect skeleton for `umbrella_tilt_angle`.
2. Clear context. Claude reads ONLY `physics_author/CLAUDE.md` + the architect output. Produces physics block.
3. Clear context. Claude reads ONLY `json_author/CLAUDE.md` + both upstream outputs. Writes JSON + SQL migration.
4. Clear context. Claude reads ONLY `quality_auditor/CLAUDE.md` + the final JSON. Runs 7 gates.
5. If all gates pass → ship. If any fail → route to the named agent per gate feedback.

Expected duration: 4 × 45 min sub-sessions = ~3 hours total (vs ~90-120 min for manual session 28-30 retrofits). First proof run will be slower; the savings kick in on retrofits 11+ once the handoffs are smooth.

## File sizes

| File | Lines | Purpose |
|---|---|---|
| `architect/CLAUDE.md` | 150 | skeleton authoring |
| `physics_author/CLAUDE.md` | 142 | physics rigor |
| `json_author/CLAUDE.md` | 148 | schema + canvas + registration |
| `quality_auditor/CLAUDE.md` | 148 | 7 gates + silent-failure probes |
| `feedback_collector/CLAUDE.md` | 130 | Phase I nightly loop |

Target was ≤150 each. All hit budget.

## What these files are NOT

- **Not runnable subagents.** Claude Code's `.claude/agents/` mechanism (frontmatter + invocation via Task tool) is deferred. If Pradeep later wants runnable subagents, each `.agents/<name>/CLAUDE.md` converts 1:1 — the content transfers.
- **Not replacement for `CLAUDE.md`.** Project CLAUDE.md has the 23 critical design rules, glossary, and architectural context. Agent specs EXTEND these — they don't duplicate them.
- **Not frozen.** As more concepts ship through the pipeline, patterns will surface that aren't yet in these specs. Update them via a normal session edit + PROGRESS.md note.

## Out-of-scope for this system

- `CLAUDE_ENGINES.md` engine-level agents (Tier 8 Feedback Collector/Clusterer/Proposer/Auto-Promoter). Those are runtime services, not authoring agents. The `feedback_collector/CLAUDE.md` here is the **authoring-time design doc**; the runtime implementation lives in `src/lib/feedback/` when built.
- Image/diagram rendering agents. Diagrams come from scene_composition + parametric_renderer, not a separate image agent.
- Board-mode handwriting animation agent. Derivation_sequence primitives are authored by json_author inline.

## Cross-references

- Project CLAUDE.md: `C:\Tutor\CLAUDE.md`
- Master roadmap: `C:\Tutor\physics-mind\PLAN.md`
- Reference files: `C:\Tutor\physics-mind\CLAUDE_REFERENCE.md`, `CLAUDE_ENGINES.md`, `CLAUDE_TEST.md`
- Session history: `C:\Tutor\physics-mind\PROGRESS.md`
- Zod schema: `C:\Tutor\physics-mind\src\schemas\conceptJson.ts`
- Validator + bounds check: `C:\Tutor\physics-mind\src\scripts\validate-concepts.ts`
