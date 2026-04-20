/**
 * equation_cache — permanent storage for MinerU extraction results
 *
 * Cache key: SHA-256 hash of image bytes (content hash, not filename)
 * Two students uploading different photos of same page → same cache hit
 * MinerU called once per unique page, forever
 */

import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import type { MinerUExtractionResult } from './mineruClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export function computeImageHash(imageBuffer: Buffer): string {
  return createHash('sha256').update(imageBuffer).digest('hex')
}

export async function checkEquationCache(
  imageHash: string
): Promise<MinerUExtractionResult | null> {
  const { data, error } = await supabase
    .from('equation_cache')
    .select('*')
    .eq('image_hash', imageHash)
    .maybeSingle()

  if (error || !data) return null

  // Increment served_count
  await supabase
    .from('equation_cache')
    .update({
      served_count: (data.served_count || 0) + 1,
      last_used_at: new Date().toISOString()
    })
    .eq('image_hash', imageHash)

  console.log(`[equationCache] HIT for hash ${imageHash.substring(0, 12)}... served_count=${data.served_count + 1}`)

  return {
    success: true,
    equations: data.equations_extracted || [],
    equation_count: (data.equations_extracted || []).length,
    plain_text: data.plain_text_extracted || '',
    raw_markdown: '',
    source: 'cache',
    cached: true
  }
}

export async function writeEquationCache({
  imageHash,
  result,
  sourceType,
  bookHint,
  chapterHint,
  conceptId
}: {
  imageHash: string
  result: MinerUExtractionResult
  sourceType: string
  bookHint?: string
  chapterHint?: string
  conceptId?: string
}): Promise<void> {
  const { error } = await supabase
    .from('equation_cache')
    .upsert({
      image_hash: imageHash,
      source_type: sourceType,
      book_hint: bookHint || null,
      chapter_hint: chapterHint || null,
      concept_id: conceptId || null,
      mathpix_latex: result.equations.map(e => e.latex).join('\n'),
      equations_extracted: result.equations,
      plain_text_extracted: result.plain_text,
      has_diagram: false, // Flash Vision sets this separately
      served_count: 0,
      created_at: new Date().toISOString(),
      last_used_at: new Date().toISOString()
    }, {
      onConflict: 'image_hash'
    })

  if (error) {
    console.error('[equationCache] Write failed:', error)
  } else {
    console.log(`[equationCache] WRITE for hash ${imageHash.substring(0, 12)}... equations=${result.equation_count}`)
  }
}
