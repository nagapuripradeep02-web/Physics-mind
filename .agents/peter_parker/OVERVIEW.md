# PETER PARKER — Cluster Overview

Engine cluster maintainer layer. Counterpart to Alex (content authoring layer under `.agents/architect`, `.agents/physics_author`, `.agents/json_author`, `.agents/quality_auditor`, `.agents/feedback_collector`).

Peter Parker personas maintain the **engines**; Alex personas author the **content**. The two layers exchange bugs and regen directives; neither writes the other's artifacts. Every cluster is a Claude persona invoked by reading its spec file — not a runtime service.

Per [docs/ARCHITECTURE_v2.2.md §2.2](../../docs/ARCHITECTURE_v2.2.md): **"writing 5 cluster specs before we have ≥3 proof-runs through Alex would lock in an abstraction we don't yet understand."** Clusters are written from observed reality, not theory. The 12 bugs surfaced in session 34's `friction_static_kinetic` proof-run triggered the first two specs. The remaining three stay deferred until their own proof-runs land.

## The five clusters

| Cluster | Owns (one-line) | Status | Trigger to write the spec |
|---|---|---|---|
| `renderer_primitives` | Parametric renderer display layer, PCPL primitive library, anchor-resolver / zone-layout / choreography / scale engines, constraint solver, postMessage consumer contract | **ACTIVE** | Session 34 friction bugs #2, #3, #4, #5, #7, #10 |
| `runtime_generation` | aiSimulationGenerator, jsonModifier, loadConstants, deep-dive / drill-down generators, physicsEngine concepts, inline `computePhysics_<concept>` functions, cache tables (R+W), API serving routes, prompt files | **ACTIVE** | Session 34 friction bugs #1, #8, #9 |
| `quality` | E42 Physics Validator as hard gate, E43 Visual Probe automation, E44 Regression Suite | DEFERRED | First concept whose bugs are caught (or missed) by gates that don't yet exist; most likely trigger: Phase F2 wiring of E42 into E25/E29/E30 |
| `self_improvement` | E39 Feedback Collector, E39b Clusterer (Haiku), E40 Change Proposer (Sonnet), E41 Auto-Promoter; the four nightly offline agents | DEFERRED | PLAN.md Phase I — requires `feedback_unified`, `test_session_log`, `proposal_queue`, `engine_bug_queue` tables first |
| `assessment` | E31 Feynman grader, E33 Assessment Generator, E34 Answer-Sheet PDF, E35 Mark Accumulator, E36 Board Template Library, E37 Answer-Sheet Layout | DEFERRED | PLAN.md Phase F5 / Phase K — first downloadable board-mode answer-sheet PDF for `normal_reaction` |

Writing a deferred cluster's spec without its trigger bugs = inventing requirements. Don't.

## Active-cluster spec files

- [renderer_primitives/CLAUDE.md](../renderer_primitives/CLAUDE.md)
- [runtime_generation/CLAUDE.md](../runtime_generation/CLAUDE.md)

## Alex ↔ Peter Parker communication protocol (interim)

Markdown-based convention; will migrate cleanly to `engine_bug_queue` + `proposal_queue` tables when PLAN.md Phase I lands.

### Bug-tagging format

`quality_auditor` (Alex) tags every bug with an owner cluster when writing it into PROGRESS.md or a per-concept `QA_REPORT.md`:

```
N. **<Title>.** <One-line description with file:line citation if known>. [owner: peter_parker:renderer_primitives] [severity: CRITICAL|MAJOR|MODERATE]
```

Valid owner tags:
- `alex:architect`
- `alex:physics_author`
- `alex:json_author`
- `peter_parker:renderer_primitives`
- `peter_parker:runtime_generation`
- `ambiguous` (rare; forces triage conversation)

### Handoff chain

```
quality_auditor   [tags bug with owner cluster]
      │
      ▼
peter_parker:<cluster>   [reads tagged bug, fixes engine, writes regen directive]
      │
      ▼
peter_parker:runtime_generation   [executes regen sweep on affected cache tables]
      │
      ▼
quality_auditor   [re-runs 7 hard gates on affected concepts]
      │
      ▼
founder   [approves promotion to verified / gold-standard]
```

If `peter_parker:<cluster>` determines root cause is actually Alex's, it updates the tag in place with a reclassification note (`[owner: peter_parker:renderer_primitives → alex:json_author]` + one-line reason) and makes no engine code change.

### Regen directive format

`renderer_primitives` emits:
```
## RENDERER REGEN DIRECTIVE
- cluster: renderer_primitives
- fix_summary: <one line>
- affected_cache_tables: [simulation_cache, deep_dive_cache, drill_down_cache]
- affected_concept_ids: [friction_static_kinetic, ...]
- affected_modes: [conceptual, board]
- handoff_to: runtime_generation
```

`runtime_generation` emits its own directive for self-fixes AND an execution log for every directive it processes (its own or `renderer_primitives`'s). See each cluster's spec for exact formats.

### Migration path to Phase I tables (documented, not executed)

- Each owner-tagged bug → one row in `engine_bug_queue { concept_id, state_id, owner_cluster, severity, repro, status }`.
- Each regen directive → one row in `proposal_queue { cluster, affected_concepts, directive_markdown, approved_by, executed_at }`.
- Each execution log → one row in `cache_regen_log` (new table, Phase I).

The markdown-to-table migration is mechanical. Keeping the interim format faithful now means no format conversion later.

## Cache-version discipline (interim)

Until cache rows carry `engine_version` / `renderer_version` hashes (PLAN.md Phase G/H):

- Every engine fix ships with a regen directive. No exceptions. A fix without a directive is incomplete.
- `runtime_generation` executes every sweep and logs it to PROGRESS.md. It is the only cluster that runs `DELETE FROM <cache_table>`.
- If a regen is skipped, the affected concept is flagged `cache_stale: true` in PROGRESS.md until swept. `quality_auditor` rejects promotion of any concept with a stale-cache flag.

## Sacred-boundary resolutions (scope report ambiguities)

Decisions locked here so future specs and fixes don't re-litigate:

| Subsystem | Owner | Why |
|---|---|---|
| `parametric_renderer.ts` — display layer (drawForceArrow, drawVector, drawAngleArc, subscene assembly, postMessage listeners) | `renderer_primitives` | Rendering is a display concern |
| `parametric_renderer.ts` — inline `computePhysics_<concept>` at lines 47–250 | `runtime_generation` | Physics compute, living in a renderer file by accident of history; scope trumps path |
| `subSimSolverHost.ts` constraint solver | `renderer_primitives` | Layout geometry feeds the renderer |
| PostMessage contract — producer side (initial `PM_physics` population) | `runtime_generation` | Generator emits the config the consumer listens to |
| PostMessage contract — consumer side (iframe listeners, SET_STATE/PARAM_UPDATE handlers) | `renderer_primitives` | Consumer side is rendering |
| Cache key fingerprint construction (5D / 6D) | `runtime_generation` | Serving-side concern |
| Supabase schema migrations | **neither cluster** — founder only | No cluster has schema authority |
| Cache-table DELETEs during regen | `runtime_generation` | Single execution chokepoint |

## Known TODOs outside this overview

Flagged so future sessions can close the loop without re-discovering:

1. **Update `quality_auditor/CLAUDE.md` escalation targets** — today's spec routes only to `architect`, `physics_author`, `json_author`. Add `peter_parker:renderer_primitives` and `peter_parker:runtime_generation` as routing targets. One-line-per-cluster edit.
2. **Update `.agents/README.md`** — today's README names only Alex. Add a pointer to this OVERVIEW.md so new sessions find Peter Parker.
3. **Phase I migration** — when `engine_bug_queue` + `proposal_queue` + `cache_regen_log` tables exist, migrate the markdown conventions to structured rows and update both active-cluster specs to point at the table API.

These three edits are not part of this spec's scope; they're follow-up work for the sessions that execute Phase F1 friction fixes and Phase I table creation.

---

*Peter Parker keeps the engines honest. Alex keeps the content extraordinary. Neither crosses.*
