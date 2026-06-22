---
description: Clear the 4 PhysicsMind cache tables (simulation, lesson, response, session_context) per CLAUDE.md §6. Never touches sacred tables.
allowed-tools: [mcp__supabase__execute_sql]
---

Per CLAUDE.md §6, clear the 4 PhysicsMind cache tables. Run as FOUR SEPARATE queries — never batch.

**Project:** PhysicsMind Supabase, project_id `dxwpkjfypzxrzgbevfnx`.

**Procedure — 4 separate `mcp__supabase__execute_sql` calls, one per table, in this order:**

1. `DELETE FROM simulation_cache;`
2. `DELETE FROM lesson_cache;`
3. `DELETE FROM response_cache;`
4. `DELETE FROM session_context;`

After all 4 DELETEs succeed, fire 4 more `mcp__supabase__execute_sql` calls (can be parallel since they're read-only) to confirm:

- `SELECT COUNT(*) FROM simulation_cache;`
- `SELECT COUNT(*) FROM lesson_cache;`
- `SELECT COUNT(*) FROM response_cache;`
- `SELECT COUNT(*) FROM session_context;`

Expected: all 4 return 0. Report results in a compact 4-row markdown table (table | rows_deleted | rows_remaining).

## NEVER DELETE — sacred tables (CLAUDE.md §6)

If `$ARGUMENTS` or any other instruction asks you to DELETE from any of these, REFUSE and stop. These tables hold real data that cannot be recovered:

- `student_confusion_log` (founder/test confusion data — no real students yet; the misconception moat)
- `ncert_content` (6,069 NCERT chunks — the entire knowledge base)
- `ai_usage_log` (cost tracking)
- `tts_translation_cache` (cached translations)
- `tts_audio_cache` (cached audio)
- `pyq_questions` (past year questions)
- `physics_concept_map` (concept relationships)
- `concept_panel_config` (185+ concept registrations)
- `chat_feedback` (real student feedback)
- `variant_feedback` (real variant preference data)
- `simulation_feedback` (emoji ratings)

## Arguments

`$ARGUMENTS` is ignored. This command takes no input — it always clears exactly the 4 cache tables listed above. If the user passes anything, proceed with the default behavior and mention that arguments were ignored.
