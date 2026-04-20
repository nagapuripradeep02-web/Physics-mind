/**
 * MinerU equation extraction client
 * Replaces Mathpix for non-NCERT textbook image processing
 *
 * Architecture: image → MinerU service (port 8000) → LaTeX equations
 * Caching: results stored in equation_cache permanently
 * Cost: Rs 0 (self-hosted, runs locally / on server)
 */

const MINERU_SERVICE_URL = process.env.MINERU_SERVICE_URL || 'http://localhost:8000'

export interface ExtractedEquation {
  latex: string
  type: 'block' | 'inline'
  display: string
}

export interface MinerUExtractionResult {
  success: boolean
  equations: ExtractedEquation[]
  equation_count: number
  plain_text: string
  raw_markdown: string
  source: 'mineru' | 'cache'
  cached: boolean
}

export async function checkMinerUHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${MINERU_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(3000)
    })
    return response.ok
  } catch {
    return false
  }
}

export async function extractEquationsFromImage(
  imageBuffer: Buffer,
  mimeType: string = 'image/jpeg'
): Promise<MinerUExtractionResult | null> {
  try {
    const isHealthy = await checkMinerUHealth()
    if (!isHealthy) {
      console.warn('[mineruClient] MinerU service not reachable at', MINERU_SERVICE_URL)
      return null
    }

    const formData = new FormData()
    const blob = new Blob([new Uint8Array(imageBuffer)], { type: mimeType })
    formData.append('file', blob, 'page.jpg')

    const response = await fetch(`${MINERU_SERVICE_URL}/extract`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(90000) // 90s timeout for slow CPU inference
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[mineruClient] Extraction failed:', error)
      return null
    }

    const result = await response.json()

    return {
      ...result,
      source: 'mineru',
      cached: false
    }
  } catch (error) {
    console.error('[mineruClient] Error calling MinerU service:', error)
    return null
  }
}
