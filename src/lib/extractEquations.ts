/**
 * Main entry point for equation extraction in the pipeline
 *
 * Flow:
 * 1. Compute SHA-256 hash of image bytes
 * 2. Check equation_cache → HIT: return cached result (Rs 0)
 * 3. MISS: call MinerU service → extract equations
 * 4. Write result to equation_cache permanently
 * 5. Return result to pipeline
 *
 * If MinerU service is unreachable: return null (pipeline continues without equations)
 * Equations are enhancement, not blocking — pipeline never fails because of this
 */

import { computeImageHash, checkEquationCache, writeEquationCache } from './equationCache'
import { extractEquationsFromImage } from './mineruClient'
import type { MinerUExtractionResult } from './mineruClient'

export async function extractEquations({
  imageBuffer,
  sourceType,
  bookHint,
  chapterHint,
  conceptId,
  mimeType = 'image/jpeg'
}: {
  imageBuffer: Buffer
  sourceType: string
  bookHint?: string
  chapterHint?: string
  conceptId?: string
  mimeType?: string
}): Promise<MinerUExtractionResult | null> {
  // Step 1: Hash the image
  const imageHash = computeImageHash(imageBuffer)
  console.log(`[extractEquations] image_hash=${imageHash.substring(0, 12)}...`)

  // Step 2: Cache check
  const cached = await checkEquationCache(imageHash)
  if (cached) {
    return cached
  }

  // Step 3: Call MinerU
  console.log('[extractEquations] Cache MISS — calling MinerU service')
  const result = await extractEquationsFromImage(imageBuffer, mimeType)

  if (!result || !result.success) {
    console.warn('[extractEquations] MinerU returned no result — continuing without equations')
    return null
  }

  // Step 4: Write to cache
  await writeEquationCache({
    imageHash,
    result,
    sourceType,
    bookHint,
    chapterHint,
    conceptId
  })

  return result
}

export type { MinerUExtractionResult }
