# INPUT HANDLING — COMPLETION REPORT

## All 9 Input Cases

| Case | Input | needsClarification | Expected Behavior | Status |
|------|-------|-------------------|-------------------|--------|
| 1 | Text only, specific ("why does current reduce") | false | Direct pipeline → sim | WORKING (pre-existing) |
| 2 | Image only, no text | **true** | Clarification Q about image | **FIXED** |
| 3 | Vague text only ("I don't understand") | **true** | Clarification Q asking topic | **FIXED** |
| 4 | Image + "explain this" | false | Full explanation (image IS context) | WORKING (pre-existing) |
| 5 | Image + specific text | false | Specific confusion pipeline | WORKING (pre-existing) |
| 6 | Image + mark, no text | **true** | Clarification referencing marked region | **FIXED** |
| 7 | Image + mark + text | false | Forced specific_confusion on marked area | WORKING (prev build) |
| 8 | Follow-up text in session | false | Follow-up classifier → text/sim | WORKING (pre-existing) |
| 9 | New image mid-session | false | Updates image context, continues | WORKING (pre-existing) |

## What Was Built

### Fix 1 — `src/lib/isVagueInput.ts` (NEW)
- Pattern matcher for vague student inputs
- Handles English ("explain this", "help", "what is this") and Hinglish ("samajh nahi aaya", "ye kya hai", "iska matlab kya")
- Returns `true` if text alone provides no actionable context

### Fix 2 — `src/lib/generateClarificationQuestion.ts` (NEW)
- Generates conversational clarification questions using Flash
- Three branches:
  - Marked region: directly references what was highlighted
  - Image + no text: Flash generates a targeted 20-word question about the image content
  - Text only vague: returns a generic "which topic?" question
- Conversational tone, not form-like

### Fix 3A — `chat/route.ts`: Imports
- Added `isVagueInput` and `generateClarificationQuestion` imports

### Fix 3B — `chat/route.ts`: Input classification
- Added `hasMarkedRegion`, `textIsMeaningful`, `hasAnyText`, `needsClarification` flags
- Classification runs AFTER Flash Vision and marked region processing (so we have all context)
- Three clarification triggers:
  1. Vague text + no image + no mark (Case 3)
  2. Image + absolutely no text + no mark (Case 2)
  3. Mark + no text (Case 6)
- "explain this" WITH an image does NOT trigger clarification (image IS the context)

### Fix 3C — `chat/route.ts`: Early return for clarification
- Returns `{ type: 'clarification', message, retain_image_context }` response
- Logs to `student_confusion_log` with `clarification_asked: true` and proper `input_type`

### Fix 3D — `chat/route.ts`: Forced intent for marked regions
- When `hasMarkedRegion && textIsMeaningful`, forces intent to `specific_confusion`
- Override applied after `resolveStudentIntent()` returns

### Fix 3E — `chat/route.ts`: Input type logging for ALL intents
- The fire-and-forget `student_confusion_log` insert now includes:
  - `input_type` (text, image+text, image_no_text, marked_image, marked_image_no_text)
  - `has_marked_region`
  - `marked_region_description`
- These fire for every intent, not just `specific_confusion`

### Fix 4 — `LearnConceptTab.tsx`: Handle clarification response
- New `type: 'clarification'` handler in the response processing chain
- Shows clarification question as assistant message in chat
- **Image retention**: when `retain_image_context: true`, re-sets `uploadedImage` state so student doesn't need to re-upload
- Clears `annotationBounds` (mark already processed)

### Fix 5 — `intentResolver.ts`: Empty text guard
- Added null/empty text guard at top of `resolveStudentIntent()`
- Returns `intent: 'full_explanation'` with `confidence: 0.3` for empty text + no image
- Hinglish examples: **ALREADY PRESENT** in `intent_resolver.txt` (lines 36-41)

### Fix 6 — Session context retrieval
- **STATUS: DOES NOT EXIST** — no `session_context` table or turn-based context retrieval
- NCERT chunks are re-fetched via pgvector on every turn (not cached per session)
- **DEFERRED**: full session context system is a larger feature, flagged for future build

## TypeScript Errors: 0
```
npx tsc --noEmit → clean (0 errors)
```

## Test Plan

### Test Case 2 — Image only, no text
- Upload image, send with no text
- Expected: `[inputClassifier] needsClarification: true`, response `type: 'clarification'`
- DB: `input_type='image_no_text'`, `clarification_asked=true`

### Test Case 3 — Vague text only
- Type "I don't understand" with no image
- Expected: `needsClarification: true`, response: "Could you tell me which concept..."
- DB: `input_type='vague_text'`, `clarification_asked=true`

### Test Case 6 — Image + mark, no text
- Upload image, draw rectangle, send with no text
- Expected: `needsClarification: true`, response references marked region content
- DB: `input_type='marked_image_no_text'`, `clarification_asked=true`

### Test Case 4 (regression) — Image + "explain this"
- Upload image, type "explain this"
- Expected: `needsClarification: false`, proceeds to full_explanation pipeline

### Test Case 5 (regression) — Image + mark + text
- Upload image, draw rectangle, type "I don't understand this formula"
- Expected: `needsClarification: false`, forced `specific_confusion`

### Test Case 1 (regression) — Specific text
- Type "why does current reduce after each resistor"
- Expected: unchanged pipeline behavior

## Deferred
- Session context retrieval across turns (Fix 6) — no `session_context` table exists
- `universalInputUnderstanding.ts` remains dead code (not fixed per instructions)
