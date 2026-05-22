# MCP_BACKLOG.md — deferred harness items with explicit triggers

Items identified by the 2026-05-22 harness audit as real value but mis-timed for current solo-founder load. Each has a trigger condition. If the trigger fires, promote the item to active work. If a quarterly `HARNESS_REVIEW.md` walks this file and an item has been deferred 2+ quarters with no trigger movement, kill it.

---

## Item F1 — NCERT structured-search MCP

**Trigger:** Diamond #4 (`magnetic_field_solenoid`) ships AND the M4 binary gate in `MAGNETISM_ARCHITECTURE.md` passes.

**Scope:** Small Node MCP server exposing one tool:

```
ncert_search(query: string, chapter?: string, top_k?: number = 5)
  → { chunks: [{ id, chapter, content, score }] }
```

Backed by existing `ncert_content` Supabase table (6,069 rows) + pgvector similarity using the embedding model already used by the app.

**Why this MCP specifically:** the blog calls out structured-search MCPs as the highest-leverage MCP pattern. Today the architect and physics_author agents read NCERT chunks indirectly (root CLAUDE.md references, ad-hoc Supabase queries). A dedicated tool means quality_auditor can probe "does this concept JSON's atomic claim actually appear in NCERT Ch.X?" as a Gate 14 sub-check.

**Why deferred:** real maintenance burden (embedding model upgrades, schema drift). Diamond #4 must validate the v2.3 spec framework BEFORE adding new runtime dependencies. Premature MCP becomes harness debt.

**Estimated effort when triggered:** 1 day (server + deploy + 1 quality_auditor probe rewrite + test).

---

## Item G1 — LSP-as-tool verification

**Trigger:** A single session uses ≥ 3 `grep` calls to chase the same symbol across files (signals that LSP would have returned the answer in one shot).

**Scope:** Confirm Claude Code is invoking TypeScript Language Server for symbol-level lookups in long PhysicsMind sessions. If not, configure or document the workaround.

**Why deferred:** PhysicsMind sessions today are mostly concept-JSON authoring (Glob + Read suffice). The pain emerges when refactoring across `src/lib/renderers/`, `src/lib/aiSimulationGenerator.ts`, etc. Has not yet emerged.

**Estimated effort when triggered:** 30 min investigation + possibly a `.claude/settings.local.json` toggle.

---

## Item G2 — Skill path-scoping

**Trigger:** Installed skill count exceeds 20 (currently ~13 including `~/.claude/skills/learned/` outputs from the new Stop hook).

**Scope:** Add `paths:` field to skill SKILL.md frontmatter so skills only activate in relevant subdirectories (e.g. `postgres-patterns` only inside `supabase/` or `src/lib/db/`).

**Why deferred:** skill noise is not currently a problem at 13 skills. Becomes one around 20–25.

**Estimated effort when triggered:** 15 min per skill that needs scoping × however many qualify.

---

## Review cadence

This file is walked at every quarterly `HARNESS_REVIEW.md` cycle (next: 2026-08-22). Each item: promote (do now), re-state trigger, or kill with reason.

## Cross-references

- `C:\Tutor\physics-mind\docs\HARNESS_REVIEW.md` — quarterly cadence that gates this file.
- `C:\Tutor\physics-mind\docs\PLUGIN_PACKAGING_PLAN.md` — sibling structural-decision doc.
- Anthropic blog: *How Claude Code works in large codebases — MCP Servers + LSP sections.*
