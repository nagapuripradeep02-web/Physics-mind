# POSTAUDIT FIXES — COMPLETE

**Date:** 2026-03-24
**Build status:** SUCCESS (tsc: 0 errors, next build: clean)

---

## FIX 1 — CRITICAL: session_context cache-hit bypass

**File:** `src/app/api/chat/route.ts` (line ~1069)

**Problem:** `session_context` only wrote when `res.ncertSources.length > 0`. Tier 1/2 cache hits return `ncertSources: []`, so the session was NEVER written for cached responses. This is why `session_context` had 0 rows despite the table existing.

**Fix:** Changed condition from `if (!ncertChunksFromSession && res.ncertSources.length > 0)` to `if (!ncertChunksFromSession)`. Session now writes on Turn 1 regardless of whether NCERT sources came from cache or AI. Empty `ncert_chunks: []` is written for cache hits — the concept metadata (concept_id, mode, class_level, student_belief) is still valuable for follow-up turns.

**Expected logs:**
```
Turn 1: [session] context written for session: <id> chunks: 5 concept: ohms_law
Turn 1 (cache hit): [session] context written for session: <id> chunks: 0 concept: ohms_law
Turn 2+: session_context.update({ turn_count: N })
```

---

## FIX 2 — CRITICAL: searchNCERT session skip for specific_confusion

**File:** `src/app/api/chat/route.ts` (line ~693)

**Problem:** `searchNCERT()` always ran fresh for `specific_confusion` intent, even when the session already had cached NCERT chunks. This wasted a pgvector query on every follow-up confusion question.

**Fix:** Added conditional check: if `ncertChunksFromSession` exists and has entries, reuse them; otherwise run fresh `searchNCERT()`. The cached chunks are passed to `extractStudentConfusion()` the same way.

**Expected logs:**
```
Turn 2+ (same concept): [pgvector] SKIPPED specific_confusion — using 3 chunks from session
Turn 2+ (concept changed): [pgvector] ran for specific_confusion — 3 chunks
```

---

## FIX 3 — HIGH: Intent resolver marked_region awareness

**Files:** `src/lib/intentResolver.ts`, `src/app/api/chat/route.ts`

**Problem:** `resolveStudentIntent()` had no `marked_region_description` parameter. When a student annotated a specific region of an image, the intent resolver couldn't see it and might resolve as `full_explanation` instead of `specific_confusion`, causing the confusion extraction pipeline to be skipped entirely.

**Fix:**
1. Added `marked_region_description?: string` to the input interface
2. When provided, prepends an IMPORTANT block to the prompt telling the model to treat annotated regions as `specific_confusion` unless text clearly indicates otherwise (derive, compare)
3. Wired `markedRegionDescription` into the `resolveStudentIntent()` call in route.ts

**Note:** The existing `forcedIntent` override (line ~569) already forces `specific_confusion` when `hasMarkedRegion && textIsMeaningful`. This fix makes the resolver itself aware of marked regions, so even when the forced override doesn't fire (e.g., text is ambiguous), the resolver has the context to make a better decision.

---

## FIX 4 — HIGH: image_context_cache improved diagnostics

**File:** `src/app/api/chat/route.ts` (line ~434)

**Problem:** `image_context_cache` had 0 rows. The existing error logging was minimal (`console.error("[chat] Failed to write image_context_cache:", insertError)`) — not enough to diagnose whether the issue was a missing table, column mismatch, RLS denial, or pHash null.

**Fix:**
1. Added `phash_16` value to the initial log line for traceability
2. Enhanced error logging: now prints `message`, `code`, and `details` separately
3. Added success log with sha256 prefix for confirmation
4. Added `else` branch when `phashValues` is null — logs explicit warning that pHash computation failed, so the write was skipped

**Expected logs (success):**
```
[chat] Inserting new Flash Vision extraction to image_context_cache, pHash: a1b2c3d4e5f6g7h8
[imageCache] written successfully for sha256: a1b2c3d4e5f6
```

**Expected logs (failure):**
```
[imageCache] WRITE FAILED: relation "image_context_cache" does not exist | code: 42P01 | details: ...
```
or:
```
[imageCache] skipping write — pHash computation returned null
```

---

## FIX 5 — MEDIUM: Deduplicate student_confusion_log writes

**File:** `src/app/api/chat/route.ts` (line ~743)

**Problem:** For `specific_confusion` intents, 3 separate writes fired:
1. Line ~533: clarification INSERT (only when `needsClarification=true`) — correct, no change
2. Line ~605: intent resolver INSERT (fires for ALL intents) — correct, this is the base row
3. Line ~743: confusion UPSERT with `onConflict: 'session_id'` — this created a SECOND row or clobbered the first

For a single student turn with `specific_confusion` intent, rows 2 and 3 both wrote, creating duplicate/conflicting entries.

**Fix:** Changed line ~743 from `upsert()` to `update()`. Now it enriches the existing row (written at line ~605) with confusion extraction fields:
- `student_belief`, `actual_physics`, `simulation_emphasis`, `extraction_confidence`, `misconception_confirmed`
- Uses `.is('student_belief', null)` guard to only update rows that haven't been enriched yet
- Uses `.order('created_at', { ascending: false }).limit(1)` to target the most recent row

**Expected result:** Exactly 1 row per student turn in `student_confusion_log`, with both intent resolver data AND confusion extraction data in the same row.

---

## VERIFICATION RESULTS

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | 0 errors |
| `npm run build` | SUCCESS — all 32 pages generated |
| Files modified | 2: `src/app/api/chat/route.ts`, `src/lib/intentResolver.ts` |

## REMAINING ITEMS (not addressed by these fixes)

1. **quality_score always 0** — simulation_cache has no quality scoring. Needs a separate feature to evaluate sim quality post-generation.
2. **MATHPIX not integrated** — equation_cache will remain empty until MATHPIX keys are added and OCR pipeline is wired.
3. **image_context_cache 0 rows** — Fix 4 adds diagnostics but may not resolve the root cause if the table schema or RLS is wrong. Check Vercel logs after next image upload.
