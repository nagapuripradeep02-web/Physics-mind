# CLAUDE.md — `.agents/` (canonical agent specs)

Umbrella governance for the ten canonical agent specifications (seven original + three added 2026-07-04: `eye_walker`, `retrofit_surgeon`, `shipper`). This directory is the **source of truth**; `.claude/agents/*.md` is the emitted dispatch wrapper consumed by Claude Code's native auto-dispatch. Never hand-edit a wrapper.

## Canonical source vs dispatch wrapper

Per root `CLAUDE.md` §2 hard rule 5:

- `physics-mind/.agents/<role>/CLAUDE.md` — **canonical**. Founder-edited. Markdown body only, no YAML.
- `physics-mind/.claude/agents/<role>.md` — **emission**. YAML frontmatter (`name:`, `description:`, optional `model:`) + body copied from canonical. Regenerated, never hand-written.

Silent failure mode this prevents: someone edits the wrapper because it's the file Claude Code reads at dispatch time → next regeneration from canonical overwrites the change → fix vanishes with no audit trail.

## Regeneration procedure (manual today; automate later)

When you edit `<role>/CLAUDE.md`:

1. Open the corresponding `.claude/agents/<role>.md`.
2. Preserve the existing YAML frontmatter block at the top (`name:`, `description:`, `model:` if set). Update `description:` only if the role's one-line summary genuinely changed.
3. Replace the body below the frontmatter with the new canonical body verbatim.
4. Save.

**Same-session rule (added 2026-06-11):** a canonical edit without its emission regenerated in the SAME session is an unfinished edit. The 2026-06-11 harness audit found emissions running days-to-weeks behind their canonicals (renderer_primitives 9 days; physics_author two spec generations) — auto-dispatched agents were operating on stale contracts. Regenerate before the session ends, every time.

Naming reminder: emission filename and `name:` field use **hyphenated** form (`json-author`). Bug-queue ownership tags and FAIL routing use **underscored cluster-prefixed** form (`alex:json_author`). Both intentional. See `~/.claude/rules/agent-teams-reference.md`.

## The ten roles (2026-07-04: adds `eye_walker`, `retrofit_surgeon`, `shipper` + the Release cluster)

| Cluster | Role (canonical dir) | Pattern | One-line summary |
|---|---|---|---|
| Alex | `architect` | pipelined #1 | Produces 9-section skeleton + Pass-1 strategic checklist (v2.3). Model-pinned `claude-fable-5` (2026-07-08 — the creative pedagogy/choreography role; watch the first dispatch's token cost, fallback = revert pin to sonnet-5). |
| Alex | `physics_author` | pipelined #2 | Produces physics block (variables, formulas, constraints, reveals). Model-pinned `claude-sonnet-5` (2026-07-04). |
| Alex | `json_author` | pipelined #3 | Produces the `.json` + 8 registration sites + SQL migration. Model-pinned `claude-sonnet-5` (2026-07-08). |
| Alex | `quality_auditor` | pipelined #4 (gate) | Per-gate PASS/FAIL verdict + return-to-author FAIL routing. Reports only, never edits. Model-pinned `claude-opus-4-8` (2026-07-08 — upgraded from sonnet-5; founder call: the final adversarial pre-founder gate reasons across skeleton+physics+JSON+THE EYE+eye_walker+routing and never edits files, so it is the highest-ROI single Opus slot / zero blast radius. Fallback = revert pin to sonnet-5). |
| Alex | `eye_walker` | parallel verification (frames) | Reads THE EYE frame dumps in its own context; per-state verdict table + ≤5 frames for founder eyes. Curates, never approves. Dispatched alongside quality_auditor. |
| Alex | `retrofit_surgeon` | dispatched per-concept for doctrine deltas | ONE concept + ONE named delta = minimal surgical diff; preserves cue/glow bindings + PRIMARY aha; fleet migration = N parallel dispatches. |
| Peter Parker | `renderer_primitives` | FAIL-routed | Display layer in `parametric_renderer.ts` + PCPL primitives. Never call directly. Model-pinned `claude-sonnet-5` (2026-07-08). |
| Peter Parker | `runtime_generation` | FAIL-routed | Generator + jsonModifier + cache sweeps. Only agent that runs `DELETE` on cache tables. Never call directly. Model-pinned `claude-sonnet-5` (2026-07-08). |
| Release | `shipper` | post-approval release chain — **founder-triggered only** | Rule 30f last step: visual:approve → translate (provider fallback) → tts EN+TE → rebuild → verify. Refuses to run without an approval statement. |
| Offline | `feedback_collector` | nightly only | E38–E41 quartet. Reads 5 feedback tables, writes proposals. Never invoked during live serving paths. |

**Release cluster (added 2026-07-04).** A fourth, deliberately lightweight cluster beyond Alex / Peter
Parker / Offline: script-orchestration roles that run AFTER the Rule 17 human gate. It has no OVERVIEW.md
(no shared-subsystem sacred-boundary table, no inter-cluster handoff protocol — a single role invoking
idempotent npm scripts doesn't warrant one; author an OVERVIEW only if the cluster grows a second role or
a real handoff protocol). Owner-tag form: `release:shipper`.

## Hard rules (verbatim from `~/.claude/rules/agent-teams-reference.md`)

1. New concept authoring uses the pipeline: architect → physics_author → json_author → quality_auditor. Sequential. Never parallel.
2. Routine checks use parallel subagents (type-check + validator + console-audit fired in one message).
3. Never call `renderer_primitives` or `runtime_generation` directly. They're triggered by quality_auditor's FAIL routing.
4. Quality_auditor is the gate, not the author. Reports + routes. Never edits content.
5. `.agents/<role>/CLAUDE.md` is the canonical source. `.claude/agents/<role>.md` is the emission. Never edit the emission directly.
6. Anchor checking (Indian context, plain English, no Hinglish) is folded into quality_auditor's anti-plagiarism probe. Do not create a separate anchor-checker agent.
7. *(added 2026-07-04)* `shipper` dispatches ONLY on explicit founder approval (Rule 17 gate — quality_auditor PASS / THE EYE clean are NOT approval); `eye_walker` curates frames but never approves (`visual:approve` stays founder-triggered); `retrofit_surgeon` never touches registration sites, renderer code, or a second file — it escalates instead.

## Versioning convention

Section headers carry a `(v2.x addition)` tag (e.g. architect's `Two-pass cognitive lens (v2.3 addition)`, quality_auditor's `Gate 14 (v2.3 addition)`). Edits are **additive** — append new sections, don't rewrite old ones. The v-bump is per-spec, not per-cluster; quality_auditor and architect can both be at v2.3 independently.

## Cross-references

- `physics-mind/docs/archive/PASS_2_PROPOSAL.md` — Pass-2 framework. SHIPPED as Gate 15 (quality_auditor) + json_author guidance after the Diamond-#4 dogfood (Session 64); doc archived.
- `~/.claude/rules/agent-teams-reference.md` — full agent-teams decision rule + cluster taxonomy.
- Root `C:\Tutor\CLAUDE.md` §2 — Claude's role definition + self-review checklist.
