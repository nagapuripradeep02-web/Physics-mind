# CLAUDE.md — `.agents/` (canonical agent specs)

Umbrella governance for the fifteen canonical agent specifications (seven original + three added 2026-07-04: `eye_walker`, `retrofit_surgeon`, `shipper`; + `chemistry_author` added 2026-07-23 — CHEMISTRY_BUILD_PLAN.md Phase 2; + `founder_proxy` and `field3d_surgeon` GRADUATED 2026-07-31 from the ch7/ch8 chapter-loop trial; `renderer_primitives` renamed `pcpl_surgeon` the same day; + `git_steward` added 2026-08-01 — the Ops cluster, repo hygiene; + `mathematics_author` added 2026-08-04 — MATHEMATICS_BUILD_PLAN.md Phase 2, the third subject). This directory is the **source of truth**; `.claude/agents/*.md` is the emitted dispatch wrapper consumed by Claude Code's native auto-dispatch. Never hand-edit a wrapper.

## Canonical source vs dispatch wrapper

Per hard rule 5 (`~/.claude/rules/agent-teams-reference.md`, mirrored in §Hard rules below):

- `physics-mind/.agents/<role>/CLAUDE.md` — **canonical**. Founder-edited. Markdown body only, no YAML.
- `physics-mind/.claude/agents/<role>.md` — **emission**. YAML frontmatter (`name:`, `description:`, optional `model:`) + body copied from canonical. Regenerated, never hand-written.

Silent failure mode this prevents: someone edits the wrapper because it's the file Claude Code reads at dispatch time → next regeneration from canonical overwrites the change → fix vanishes with no audit trail.

## Regeneration procedure

When you edit `<role>/CLAUDE.md`, run **`npm run sync:agents`** (scripts/sync-agents.js, added 2026-07-04):
it preserves everything above each emission's first H1 (YAML frontmatter + Spec-source preamble) verbatim
and replaces the body with the canonical's. `npm run sync:agents -- --check` verifies without writing.
Frontmatter (`name:`, `description:`, `model:`, `tools:`) is hand-maintained IN the emission — update
`description:` there directly when the role's one-line summary genuinely changed. Manual fallback:

1. Open the corresponding `.claude/agents/<role>.md`.
2. Preserve the existing YAML frontmatter block at the top.
3. Replace the body below the first H1 with the new canonical body verbatim.
4. Save.

**Same-session rule (added 2026-06-11):** a canonical edit without its emission regenerated in the SAME session is an unfinished edit. The 2026-06-11 harness audit found emissions running days-to-weeks behind their canonicals (renderer_primitives 9 days; physics_author two spec generations) — auto-dispatched agents were operating on stale contracts. Regenerate before the session ends, every time.

Naming reminder: emission filename and `name:` field use **hyphenated** form (`json-author`). Bug-queue ownership tags and FAIL routing use **underscored cluster-prefixed** form (`alex:json_author`). Both intentional. See `~/.claude/rules/agent-teams-reference.md`.

## The fifteen roles (2026-07-04: adds `eye_walker`, `retrofit_surgeon`, `shipper` + the Release cluster; 2026-07-23: adds `chemistry_author`; 2026-07-31: graduates `founder_proxy` + `field3d_surgeon`, renames `renderer_primitives` → `pcpl_surgeon`, marks `feedback_collector` DORMANT; 2026-08-01: adds `git_steward` + the Ops cluster; 2026-08-04: adds `mathematics_author`)

| Cluster | Role (canonical dir) | Pattern | One-line summary |
|---|---|---|---|
| Alex | `architect` | pipelined #1 | Produces 9-section skeleton + Pass-1 strategic checklist (v2.3). Model-pinned `claude-fable-5` (2026-07-08 — the creative pedagogy/choreography role; watch the first dispatch's token cost, fallback = revert pin to sonnet-5). |
| Alex | `physics_author` | pipelined #2 | Produces physics block (variables, formulas, constraints, reveals). Model-pinned `claude-sonnet-5` (2026-07-04). |
| Alex | `chemistry_author` | pipelined #2 (chemistry) | Chemistry sibling of `physics_author` (added 2026-07-23): produces the chemistry block (balanced-equation ledger, quantities with units, formulas, constraints, Rule 31 timelines) for chemistry concepts — the chemistry sequence substitutes it at position #2. Model-pinned `claude-sonnet-5`. |
| Alex | `mathematics_author` | pipelined #2 (mathematics) | Mathematics sibling of `physics_author` / `chemistry_author` (added 2026-08-04 — MATHEMATICS_BUILD_PLAN.md Phase 2): produces the mathematics block for mathematics concepts — the **domain & validity ledger** (domain, range, excluded points, the interval actually drawn, every "for all x" claim traced to a named theorem with its hypotheses checked), UNITLESS quantities carrying domains instead (the physics units checklist is replaced, not inherited), Rule 31 timelines, and the Rule 38c notation ladder (formal limit/integral notation on advanced-ring states only). The mathematics sequence substitutes it at position #2. Model-pinned `claude-sonnet-5`. |
| Alex | `json_author` | pipelined #3 | Produces the `.json` + 8 registration sites + SQL migration. Model-pinned `claude-sonnet-5` (2026-07-08). |
| Alex | `quality_auditor` | pipelined #4 (gate) | Per-gate PASS/FAIL verdict + return-to-author FAIL routing. Reports only, never edits. Model-pinned `claude-opus-5` (2026-07-08 — upgraded from sonnet-5; founder call: the final adversarial pre-founder gate reasons across skeleton+physics+JSON+THE EYE+eye_walker+routing and never edits files, so it is the highest-ROI single Opus slot / zero blast radius. Fallback = revert pin to sonnet-5). |
| Alex | `eye_walker` | parallel verification (frames) | Reads THE EYE frame dumps in its own context; per-state verdict table + ≤5 frames for founder eyes. Curates, never approves. Dispatched alongside quality_auditor. |
| Alex | `retrofit_surgeon` | dispatched per-concept for doctrine deltas | ONE concept + ONE named delta = minimal surgical diff; preserves cue/glow bindings + PRIMARY aha; fleet migration = N parallel dispatches. |
| Review | `founder_proxy` | checkpoints A (design) / B (build) / C (handover) | GRADUATED 2026-07-31 (born 2026-07-22 chapter-loop trial). Plays the founder's per-sim taste review — reject-biased; APPROVE = authoring sign-off only, NEVER shipping (Rule 17 intact). Reports only, never edits. Model-pinned `claude-opus-5`, effort high (2026-07-22 — pure-judgment role, zero blast radius; deliberately NOT Fable: token-cost call 2026-07-31). |
| Peter Parker | `pcpl_surgeon` | FAIL-routed | RENAMED from `renderer_primitives` 2026-07-31 (DB tag `peter_parker:renderer_primitives` unchanged, maps here). 2D display layers: `parametric_renderer.ts` + PCPL primitives + `particle_field_renderer.ts`. Never call directly. Model-pinned `claude-sonnet-5` (2026-07-08). |
| Peter Parker | `field3d_surgeon` | FAIL-routed + Phase-0 scenario builds | GRADUATED 2026-07-31 (born 2026-07-24 trial). Specialist for `field_3d_renderer.ts` (~55K lines) + its `deriveStateMeta.ts` co-edits; carries the region map + scar checklist; ~3.4M tokens/dispatch vs ~25M general-purpose. ONE bug_class per dispatch. Owner tag `peter_parker:field3d_surgeon`. Never call directly. Model-pinned `claude-opus-5` (audit: half the calls of Sonnet on this task class). |
| Peter Parker | `runtime_generation` | FAIL-routed | Generator + jsonModifier + cache sweeps. Only agent that runs `DELETE` on cache tables. Never call directly. Model-pinned `claude-sonnet-5` (2026-07-08). |
| Release | `shipper` | post-approval release chain — **founder-triggered only** | Rule 30h/30i chain: visual:approve → `tts:generate --langs=en` (audio on-demand; the product is English-only) → build:review → verify. No translation gate (Rule 30i, 2026-07-17 — the old `text_te` refusal is REMOVED; `text_hi` is authored pre-ship by a Sonnet-5 sub-agent but never blocks a release, and `tts:translate` stays forbidden). Refuses to run without an approval statement. |
| Ops | `git_steward` | dispatched at LAND (repo hygiene) | ADDED 2026-08-01. Carries a sealed desk to a reviewable PR: sync `origin/master` → verify chain → surgical `git add` of a NAMED list → commit → push → `gh pr create`. **STOPS at any conflict under `src/`** — above all the six Rule-40 platform engine files — and routes to the owning surgeon (field_3d → `field3d_surgeon`; parametric/particle_field/premium_primitives → `pcpl_surgeon`). Never merges to master, never force-pushes, never `git add -A`, never touches `visual:approve`/TTS/`PILOT_CONCEPTS`/deploy (Rule 17 intact). Owner tag `ops:git_steward`. Model-pinned `claude-sonnet-5`. Mechanical desk hygiene is the `desk:*` scripts, not this agent. |
| Offline | `feedback_collector` | nightly only — **DORMANT (2026-07-31)** | E38–E41 quartet. Reads 5 feedback tables, writes proposals. Never invoked during live serving paths. Shelved until `pilot_feedback`/`simulation_feedback` hold real teacher rows — dispatching it now clusters noise. |

**Release cluster (added 2026-07-04).** A fourth, deliberately lightweight cluster beyond Alex / Peter
Parker / Offline: script-orchestration roles that run AFTER the Rule 17 human gate. It has no OVERVIEW.md
(no shared-subsystem sacred-boundary table, no inter-cluster handoff protocol — a single role invoking
idempotent npm scripts doesn't warrant one; author an OVERVIEW only if the cluster grows a second role or
a real handoff protocol). Owner-tag form: `release:shipper`.

## Hard rules (verbatim from `~/.claude/rules/agent-teams-reference.md`)

1. New concept authoring uses the pipeline: architect → physics_author → json_author → quality_auditor. Sequential. Never parallel.
2. Routine checks use parallel subagents (type-check + validator + console-audit fired in one message).
3. Never call `pcpl_surgeon`, `field3d_surgeon`, or `runtime_generation` directly. They're triggered by quality_auditor's (or founder_proxy's `FIX(engine)`) FAIL routing — or, for field3d_surgeon, a planned Phase-0 chapter-opening build (`docs/AUTHORING_PIPELINE.md` §0).
4. Quality_auditor is the gate, not the author. Reports + routes. Never edits content.
5. `.agents/<role>/CLAUDE.md` is the canonical source. `.claude/agents/<role>.md` is the emission. Never edit the emission directly.
6. Anchor checking (UNIVERSAL culture-neutral anchor per Rule 35 — founder 2026-07-10, supersedes the old "Indian context" requirement; plain English, no Hinglish) is folded into quality_auditor's anti-plagiarism probe. Do not create a separate anchor-checker agent.
7. *(added 2026-07-04)* `shipper` dispatches ONLY on explicit founder approval (Rule 17 gate — quality_auditor PASS / THE EYE clean are NOT approval); `eye_walker` curates frames but never approves (`visual:approve` stays founder-triggered); `retrofit_surgeon` never touches registration sites, renderer code, or a second file — it escalates instead.
8. *(added 2026-07-31)* `founder_proxy` runs at Checkpoints A/B/C on every new concept (Checkpoint A on every new architect skeleton is the default); its APPROVE is authoring sign-off ONLY — it never ships, never edits, never dispatches. `feedback_collector` is DORMANT — do not dispatch until real teacher feedback rows exist.

**Chemistry addendum (2026-07-23, repo-local — not yet mirrored in `~/.claude/rules/agent-teams-reference.md`):** chemistry concepts run rule 1's pipeline with `chemistry_author` substituted at position #2 (`architect → chemistry_author → json_author → quality_auditor`); all other hard rules apply unchanged. Chemistry concept JSONs live ONLY in `src/data/concepts/chemistry/` (isolation contract — `docs/CHEMISTRY_ARCHITECTURE.md` §7).

**Mathematics addendum (2026-08-04, repo-local — same mirroring status as the chemistry addendum above):** mathematics concepts run rule 1's pipeline with `mathematics_author` substituted at position #2 (`architect → mathematics_author → json_author → quality_auditor`); all other hard rules apply unchanged. Mathematics concept JSONs live ONLY in `src/data/concepts/mathematics/` (isolation contract — `docs/MATHEMATICS_ARCHITECTURE.md` §5). Two mathematics-only gates on top of the shared rules: (a) **nothing may be authored that is not on the ranked list** in `docs/MATHEMATICS_DISCUSSIONS.md` §6 — mathematics is the most whiteboard-native subject and the demo tier is larger here than in chemistry; (b) **only archetypes marked [LIVE] in `docs/patterns/mathematics.md` may appear in a skeleton** — `cartesian_plane`, the scenario every top-ranked mathematics diamond needs, does not exist yet and must land on master separately (Rule 40) before those concepts are scheduled.

## Versioning convention

Section headers carry a `(v2.x addition)` tag (e.g. architect's `Two-pass cognitive lens (v2.3 addition)`, quality_auditor's `Gate 14 (v2.3 addition)`). Edits are **additive** — append new sections, don't rewrite old ones. The v-bump is per-spec, not per-cluster; quality_auditor and architect can both be at v2.3 independently.

## Cross-references

- `physics-mind/docs/archive/PASS_2_PROPOSAL.md` — Pass-2 framework. SHIPPED as Gate 15 (quality_auditor) + json_author guidance after the Diamond-#4 dogfood (Session 64); doc archived.
- `~/.claude/rules/agent-teams-reference.md` — full agent-teams decision rule + cluster taxonomy.
- `C:\Tutor\physics-mind\CLAUDE.md` §1 (architecture) + §6 (self-review checklist) — the operating manual.
