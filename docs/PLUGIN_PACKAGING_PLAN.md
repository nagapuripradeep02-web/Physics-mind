# PLUGIN_PACKAGING_PLAN.md

**Status: STRUCTURAL DECISION ONLY — build deferred until trigger fires.**

This doc commits PhysicsMind to a plugin layout so today's edits don't paint into a corner. It does **not** build the plugin. Build happens when the trigger fires.

## Trigger

Build the plugin when EITHER:

- A first engineering hire is 2 weeks from start date (so they walk into a working harness on day 1), OR
- A decision is made to open-source any portion of the agent ecosystem (e.g. publish to the Claude Code plugin marketplace).

Whichever fires first.

## Planned layout

```
physics-mind/
├── .claude-plugin/
│   ├── plugin.json          # name=physicsmind-harness, version, author, description
│   └── marketplace.json     # for internal install / future public publish
├── .claude/
│   ├── agents/              # already exists — 7 dispatch wrappers
│   ├── commands/            # already exists — cache-clear, etc.
│   ├── skills/              # NEW slot — project-specific skills if/when needed
│   └── hooks/               # NEW slot — project-specific hooks if/when needed
├── .agents/                 # canonical sources — ships separately or referenced
│   ├── CLAUDE.md            # umbrella (created today)
│   └── <role>/CLAUDE.md     # 7 canonical specs
└── .mcp.json                # project MCP config (without secrets)
```

Template borrowed from `~/.claude/skills/watch/.claude-plugin/plugin.json` (a working plugin shipped today). Same shape: top-level `name`, `version`, `description`, `author`, `repository`, `license`, `keywords`.

## In the plugin

- Dispatch wrappers (`physics-mind/.claude/agents/*.md` — all 7).
- Project commands (`physics-mind/.claude/commands/*.md`).
- Project-specific skills (none today; slot reserved).
- Project-specific hooks (none today; slot reserved).
- Project MCP config (`physics-mind/.mcp.json`) — without secrets.
- Plugin manifest and marketplace entry.

## NOT in the plugin

- **Canonical agent sources** at `.agents/<role>/CLAUDE.md` — founder-edited authoring artifacts. Ship in a parallel "specs" package or keep repo-local. Regeneration tool ships separately.
- **Secrets**: `.env`, `.env.local`, `SUPABASE_SERVICE_ROLE_KEY`, any API key. Plugin install must prompt user for their own keys.
- **Root `CLAUDE.md`** — lives at `C:\Tutor\CLAUDE.md` (repo root), is project context not a portable harness component.
- **Concept JSONs** (`src/data/concepts/*`) — content, not harness.
- **NCERT corpus / Supabase schema** — content, not harness.

## Tradeoffs to decide at build time (not now)

| Question | Options | Decision deferred to |
|---|---|---|
| Distribution | Marketplace publish vs internal-only install | Build time, gated by open-source decision |
| Secret handling | First-run prompt, env-var-only, or skip entirely (instruct user to copy `.env`) | Build time |
| Versioning | semver tied to PhysicsMind app version vs independent | Build time |
| Canonical sources | Bundle in plugin (read-only) vs separate `physicsmind-agent-specs` repo | Build time |

## Compatibility declaration

Today's session edits to `.claude/agents/*.md` (dispatch wrappers) and `.agents/<role>/CLAUDE.md` (canonical sources) are compatible with this layout. No rework needed when the plugin ships. New `src/data/concepts/CLAUDE.md` and `.agents/CLAUDE.md` umbrella docs are also compatible — they stay in their current locations.

## Cross-references

- `C:\Tutor\physics-mind\docs\HARNESS_REVIEW.md` — quarterly check that promotes/kills this item.
- `C:\Tutor\physics-mind\docs\MCP_BACKLOG.md` — sibling deferred-with-trigger doc.
- `~/.claude/skills/watch/.claude-plugin/` — template plugin scaffolding.
- Anthropic blog: *How Claude Code works in large codebases — Plugins section.*
