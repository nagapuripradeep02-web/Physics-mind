# MARKED REGION FEATURE — COMPLETION REPORT

## Audit Gaps Addressed

| Gap | Severity | Status | What was done |
|-----|----------|--------|---------------|
| Gap 2 | CRITICAL | FIXED | `marked_region` parsed from POST body in `chat/route.ts` |
| Gap 3 | CRITICAL | FIXED | `ImageAnnotator.tsx` component created — drag-to-draw rectangle with touch support |
| Gap 4 | HIGH | FIXED | `markedRegionDescription` now passed to `extractStudentConfusion()` call in route.ts |
| Gap 5 | MEDIUM | FIXED | `maxOutputTokens: 400` added to `generateObject()` in extractStudentConfusion.ts |
| Gap 10 | MEDIUM | FIXED | `sharp` added as direct dependency in package.json |

## What Was Built

### 1. `src/components/ImageAnnotator.tsx` (NEW)
- Canvas overlay on uploaded image for drawing one selection rectangle
- Fractional coordinates (resolution-independent): `{ x, y, width, height }` as 0.0–1.0
- Touch support (touchstart/touchmove/touchend) with passive:false for scroll prevention
- Minimum rect threshold (2% of image dimension) to discard accidental clicks
- "Clear selection" button and hint text
- Corner handles drawn as white circles with blue stroke

### 2. `src/components/sections/LearnConceptTab.tsx` (MODIFIED)
- Replaced 12x12px image thumbnail chip with full-size ImageAnnotator preview
- Added `annotationBounds` state wired to `onAnnotationChange`
- `marked_region: annotationBounds ?? null` added to POST payload to `/api/chat`
- Bounds cleared on image removal and message submission

### 3. `src/app/api/chat/route.ts` (MODIFIED)
- `marked_region` destructured from request body
- `cropMarkedRegion()` helper: uses sharp to crop image by fractional bounds
- When `marked_region` is present: crops image → runs Flash Vision on cropped region → stores description
- `markedRegionDescription` passed to `extractStudentConfusion()` for focused confusion extraction
- `image_context_cache` upsert: added `marked_region_bounds`, `marked_region_description`, `has_marked_region`
- `student_confusion_log` upsert: added `marked_region_description`, `has_marked_region`, `input_type: 'marked_image'`

### 4. `src/lib/extractStudentConfusion.ts` (MODIFIED)
- `maxOutputTokens: 400` added to `generateObject()` call
- Log line added after extraction

## DB Columns (pre-applied migration, not touched)
- `image_context_cache`: `marked_region_bounds` (jsonb), `marked_region_description` (text), `has_marked_region` (boolean)
- `student_confusion_log`: `marked_region_description` (text), `has_marked_region` (boolean)

## TypeScript Errors: 0
```
npx tsc --noEmit → clean (0 errors)
```

## Test Plan

### Test A — WITH marking
1. Upload a physics textbook image
2. Draw a rectangle over one formula or sentence
3. Type "I don't understand this" and submit
4. Expected logs:
   - `[markedRegion] bounds: {"x":...,"y":...,"width":...,"height":...}`
   - `[markedRegion] description: "The formula..."`
   - `[confusionExtractor] tokens used, max: 400`
5. Expected DB:
   - `student_confusion_log.has_marked_region = true`
   - `student_confusion_log.marked_region_description = non-null`
   - `student_confusion_log.input_type = 'marked_image'`
   - `student_confusion_log.student_belief = non-null`

### Test B — WITHOUT marking (regression)
1. Upload same image, draw NO rectangle
2. Submit same message
3. Expected: No `[markedRegion]` logs, `input_type = 'image+text'`, `has_marked_region = false`

### Test C — Text only (regression)
1. Type a question with no image
2. Expected: No change in behavior whatsoever

## Deferred Gaps (not addressed in this build)
- Gap 1: `universalInputUnderstanding.ts` remains dead code
- Gap 8: `quality_score` always written as 0 (no scoring logic)
- Gap 9: Cache key inconsistency on vision path (5D vs 2-segment)
