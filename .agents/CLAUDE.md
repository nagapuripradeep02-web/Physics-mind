# CLAUDE.md — `.agents/` (canonical agent specs)

Umbrella governance for the seven canonical agent specifications. This directory is the **source of truth**; `.claude/agents/*.md` is the emitted dispatch wrapper consumed by Claude Code's native auto-dispatch. Never hand-edit a wrapper.

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

Naming reminder: emission filename and `name:` field use **hyphenated** form (`json-author`). Bug-queue ownership tags and FAIL routing use **underscored cluster-prefixed** form (`alex:json_author`). Both intentional. See `~/.claude/rules/agent-teams-reference.md`.

## The seven roles

| Cluster | Role (canonical dir) | Pattern | One-line summary |
|---|---|---|---|
| Alex | `architect` | pipelined #1 | Produces 9-section skeleton + Pass-1 strategic checklist (v2.3) |
| Alex | `physics_author` | pipelined #2 | Produces physics block (variables, formulas, constraints, reveals) |
| Alex | `json_author` | pipelined #3 | Produces the `.json` + 6 registration sites + SQL migration |
| Alex | `quality_auditor` | pipelined #4 (gate) | Per-gate PASS/FAIL verdict + return-to-author FAIL routing. Reports only, never edits. |
| Peter Parker | `renderer_primitives` | FAIL-routed | Display layer in `parametric_renderer.ts` + PCPL primitives. Never call directly. |
| Peter Parker | `runtime_generation` | FAIL-routed | Generator + jsonModifier + cache sweeps. Only agent that runs `DELETE` on cache tables. Never call directly. |
| Offline | `feedback_collector` | nightly only | E38–E41 quartet. Reads 5 feedback tables, writes proposals. Never invoked during live serving paths. |

## Hard rules (verbatim from `~/.claude/rules/agent-teams-reference.md`)

1. New concept authoring uses the pipeline: architect → physics_author → json_author → quality_auditor. Sequential. Never parallel.
2. Routine checks use parallel subagents (type-check + validator + console-audit fired in one message).
3. Never call `renderer_primitives` or `runtime_generation` directly. They're triggered by quality_auditor's FAIL routing.
4. Quality_auditor is the gate, not the author. Reports + routes. Never edits content.
5. `.agents/<role>/CLAUDE.md` is the canonical source. `.claude/agents/<role>.md` is the emission. Never edit the emission directly.
6. Anchor checking (Indian context, plain English, no Hinglish) is folded into quality_auditor's anti-plagiarism probe. Do not create a separate anchor-checker agent.

## Versioning convention

Section headers carry a `(v2.x addition)` tag (e.g. architect's `Two-pass cognitive lens (v2.3 addition)`, quality_auditor's `Gate 14 (v2.3 addition)`). Edits are **additive** — append new sections, don't rewrite old ones. The v-bump is per-spec, not per-cluster; quality_auditor and architect can both be at v2.3 independently.

## Cross-references

- `physics-mind/docs/PASS_2_PROPOSAL.md` — Pass-2 framework, dogfood-pending.
- `~/.claude/rules/agent-teams-reference.md` — full agent-teams decision rule + cluster taxonomy.
- Root `C:\Tutor\CLAUDE.md` §2 — Claude's role definition + self-review checklist.
