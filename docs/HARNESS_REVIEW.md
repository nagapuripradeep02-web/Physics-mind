# HARNESS_REVIEW.md — quarterly review of CLAUDE.md + agent specs

Per Anthropic's *"How Claude Code works in large codebases"* blog: review CLAUDE.md and the agent ecosystem every 3–6 months, or whenever performance plateaus after a major model release. Solo founder doing this ad-hoc misses the cadence under load. This doc codifies it.

## Purpose

Keep CLAUDE.md + agent specs aligned with **current** model capabilities. Rules that helped earlier models stay on track can become defensive crutches that prevent newer models from making coordinated multi-file edits they handle well. Reviews remove rot.

## Next review

**Date:** 2026-08-22 (3 months from 2026-05-22).
**Owner:** Founder (Pradeep).
**Duration estimate:** 2 hours focused.

After the review, update this line with the next date.

## Ad-hoc triggers (don't wait for scheduled date if any fire)

- New Claude major release (e.g. 4.8, 5.x).
- Validator pass-rate drops below 85% across the last 10 concepts authored.
- Founder notices the same correction surfacing 3+ sessions in a row.
- A subagent visibly burns >50% of its context on rediscovering rules already encoded somewhere.

## 10-item review checklist

1. **Root `CLAUDE.md` size**: target < 300 lines (currently ~250). If over, push detail to a referenced doc.
2. **Subdir CLAUDE.md drift**: `src/data/concepts/CLAUDE.md` and `.agents/CLAUDE.md` still match reality? Any registration sites moved, any new gate added?
3. **Agent spec staleness**: skim all 7 `.agents/<role>/CLAUDE.md` for "v2.x addition" tags. Promote items past validation. Demote items that turned out wrong.
4. **Dispatch wrapper sync**: are all 7 `.claude/agents/<role>.md` files in sync with their canonical source? Diff each.
5. **Hook health**: review `~/.claude/skills/learned/` outputs from the last 90 days. Promote any pattern that has surfaced 3+ times to a skill or agent-spec line. Delete one-shot noise.
6. **MCP usage audit**: which servers were actually called in the last 90 days? Remove unused entries from `.mcp.json` (each unused MCP is harness weight).
7. **Skill activation review**: any skill triggered in 0 sessions over the quarter? Delete or path-scope.
8. **Validator gate hit-rate**: per gate, how often did it fire / catch a real bug vs false-positive? Tune thresholds for gates with FP > 30%.
9. **Backlog promotion/kill**: walk `archive/LEGACY_SPLIT_BACKLOG.md`, `MCP_BACKLOG.md`, `engine_bug_queue` table, `archive/PASS_2_PROPOSAL.md`. Each item: promote (do now), defer (re-state trigger), or kill (write reason).
10. **Interview-with-self**: "If a new engineer joined tomorrow, what one paragraph would I write them about how to work in this codebase?" Compare to root `CLAUDE.md`'s opening section. If different, the gap is your real onboarding doc.

## Post-review actions

- Update root `CLAUDE.md` and subdir CLAUDE.md files inline with findings.
- Open a single commit `chore: harness review YYYY-MM-DD — N rules pruned, M added`.
- Update the **Next review** date at top of this file.

## Cross-references

- `C:\Tutor\physics-mind\docs\PLUGIN_PACKAGING_PLAN.md` — plugin structural decision (build deferred).
- `C:\Tutor\physics-mind\docs\MCP_BACKLOG.md` — deferred MCP / LSP / skill-scoping items.
- Anthropic blog: *How Claude Code works in large codebases — Pattern 2: Maintain CLAUDE.md as models evolve.*
