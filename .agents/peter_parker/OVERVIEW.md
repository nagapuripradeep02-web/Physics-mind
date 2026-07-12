# PETER PARKER — Cluster Overview

Engine cluster maintainer layer. Counterpart to Alex (content authoring layer under `.agents/architect`, `.agents/physics_author`, `.agents/json_author`, `.agents/quality_auditor`, plus the Alex verification/retrofit roles `.agents/eye_walker`, `.agents/retrofit_surgeon`). `feedback_collector` belongs to the **Offline** cluster, not Alex (fixed 2026-07-12).

Peter Parker personas maintain the **engines**; Alex personas author the **content**. The two layers exchange bugs and regen directives; neither writes the other's artifacts. Every cluster is a Claude persona invoked by reading its spec file — not a runtime service.

Per [docs/ARCHITECTURE_v2.2.md §2.2](../../docs/ARCHITECTURE_v2.2.md): **"writing 5 cluster specs before we have ≥3 proof-runs through Alex would lock in an abstraction we don't yet understand."** Clusters are written from observed reality, not theory. The 12 bugs surfaced in session 34's `friction_static_kinetic` proof-run triggered the first two specs. The remaining three stay deferred until their own proof-runs land.

## The four clusters — live 10-role model (2026-07-12 doctrine sync; replaces the original five-cluster table)

| Cluster | Roles | Pattern |
|---|---|---|
| **Alex** | `architect` · `physics_author` · `json_author` · `quality_auditor` · `eye_walker` · `retrofit_surgeon` | authoring pipeline (sequential) + parallel frame verification + per-concept doctrine deltas |
| **Peter Parker** | `renderer_primitives` · `runtime_generation` | engine layer — FAIL-routed by quality_auditor only, never called directly |
| **Release** | `shipper` | post-founder-approval release chain (owner-tag `release:shipper`); no OVERVIEW.md by design |
| **Offline** | `feedback_collector` | nightly only; never on a live serving path |

The full roster (model pins, one-line summaries, hard rules) lives in `.agents/CLAUDE.md` — do not
duplicate it here. The old deferred clusters (`quality`, `self_improvement`, `assessment`) never got
specs; their live descendants are quality_auditor's gates + THE EYE (quality) and feedback_collector's
proposal loop (self_improvement); assessment stays dormant with Rule 20. Writing a spec without trigger
bugs = inventing requirements. Don't.

## Active-cluster spec files

- [renderer_primitives/CLAUDE.md](../renderer_primitives/CLAUDE.md)
- [runtime_generation/CLAUDE.md](../runtime_generation/CLAUDE.md)

## Alex ↔ Peter Parker communication protocol (interim)

Markdown-based convention for the in-session handoff; the persistent halves already EXIST as the live `engine_bug_queue` + `proposal_queue` tables (the "Phase I" framing is from `docs/archive/PLAN.md` [HISTORICAL]).

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
quality_auditor   [re-runs gates 0–20 on affected concepts]
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
- affected_modes: [conceptual]   # board/competitive DORMANT (Rule 20)
- handoff_to: runtime_generation
```

`runtime_generation` emits its own directive for self-fixes AND an execution log for every directive it processes (its own or `renderer_primitives`'s). See each cluster's spec for exact formats.

### Migration path to Phase I tables (documented, not executed)

- Each owner-tagged bug → one row in `engine_bug_queue { concept_id, state_id, owner_cluster, severity, repro, status }`.
- Each regen directive → one row in `proposal_queue { cluster, affected_concepts, directive_markdown, approved_by, executed_at }`.
- Each execution log → one row in `cache_regen_log` (new table, Phase I).

The markdown-to-table migration is mechanical. Keeping the interim format faithful now means no format conversion later.

## Cache-version discipline (interim)

Until cache rows carry `engine_version` / `renderer_version` hashes (`docs/archive/PLAN.md` **[HISTORICAL]** Phase G/H):

- Every engine fix ships with a regen directive. No exceptions. A fix without a directive is incomplete.
- `runtime_generation` executes every sweep and logs it to PROGRESS.md. It is the only cluster that runs `DELETE FROM <cache_table>`.
- If a regen is skipped, the affected concept is flagged `cache_stale: true` in PROGRESS.md until swept. `quality_auditor` rejects promotion of any concept with a stale-cache flag.

## Sacred-boundary resolutions (scope report ambiguities)

Decisions locked here so future specs and fixes don't re-litigate:

| Subsystem | Owner | Why |
|---|---|---|
| `field_3d_renderer.ts` — display/scenario layer (Three.js — ALL current diamonds) | `renderer_primitives` | The primary live rendering surface (2026-07-12) |
| `particle_field_renderer.ts` — display/scenario layer (p5 2D — Ch.3 circuits/KCL, macro_view) | `renderer_primitives` | Live 2D rendering surface (2026-07-12) |
| Renderer template assembly + serving/seed path in `aiSimulationGenerator.ts` (`FIELD_3D_RENDERER_CODE` / `PARTICLE_FIELD_RENDERER_CODE`, `CONCEPT_RENDERER_MAP`, `PCPL_CONCEPTS`, seed scripts) | `runtime_generation` | Serving-side chokepoint (2026-07-12) |
| `src/scripts/build_review_site.ts` — review/pilot player (the Rule 36 player-half clock + the Rule 37 `onTimelineEnd` explore-state free-run invariant) | `renderer_primitives` — on FAIL-route only | Player invariants are enforced ONCE in the shared player (2026-07-12) |
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
2. ~~**Update `.agents/README.md`**~~ — DONE 2026-06-11 (README rewritten; superseded 2026-07-12 — ten roles, see .agents/CLAUDE.md).
3. **Phase I migration** — `engine_bug_queue` + `proposal_queue` tables now EXIST (migrations 2026-04-25 / 2026-06-10; `cache_regen_log` still pending) — the bug-ledger half of this TODO is live via `npm run log:lesson`; the cache_regen_log half remains open.

These three edits are not part of this spec's scope; they're follow-up work for the sessions that execute Phase F1 friction fixes and Phase I table creation.

---

*Peter Parker keeps the engines honest. Alex keeps the content extraordinary. Neither crosses.*
