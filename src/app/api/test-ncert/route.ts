import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function generateQueryEmbedding(text: string) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

  console.log('[TEST-NCERT] Generating embedding for:', text)
  console.log('[TEST-NCERT] API key exists:', !!apiKey)

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] },
        outputDimensionality: 768
      })
    }
  )

  console.log('[TEST-NCERT] Embedding API status:', response.status)

  if (!response.ok) {
    const err = await response.text()
    console.error('[TEST-NCERT] Embedding error:', err)
    return null
  }

  const data = await response.json()
  const values = data?.embedding?.values

  console.log('[TEST-NCERT] Embedding length:', values?.length)
  console.log('[TEST-NCERT] First 3 values:', values?.slice(0, 3))

  return values
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')
    || 'capacitor energy'
  const classLevel = req.nextUrl.searchParams.get('class')
    || '12'

  console.log('[TEST-NCERT] Query:', query, 'Class:', classLevel)

  // Generate embedding
  const embedding = await generateQueryEmbedding(query)

  if (!embedding) {
    return NextResponse.json({
      error: 'Embedding generation failed',
      query,
      classLevel
    })
  }

  // Try RPC with very low threshold
  const { data: rpcData, error: rpcError } = await supabaseAdmin
    .rpc('match_ncert_chunks', {
      query_embedding: embedding,
      match_threshold: 0.0,  // zero threshold — return ANYTHING
      match_count: 5,
      filter_class: null  // no class filter
    })

  console.log('[TEST-NCERT] RPC error:', rpcError)
  console.log('[TEST-NCERT] RPC results:', rpcData?.length)
  console.log('[TEST-NCERT] First result similarity:', rpcData?.[0]?.similarity)

  // Also try direct query without RPC
  const { data: directData, error: directError } = await supabaseAdmin
    .from('ncert_content')
    .select('content_text, chapter_name, class_level')
    .not('embedding', 'is', null)
    .limit(3)

  console.log('[TEST-NCERT] Direct query error:', directError)
  console.log('[TEST-NCERT] Direct query rows:', directData?.length)

  return NextResponse.json({
    query,
    classLevel,
    embeddingGenerated: !!embedding,
    embeddingLength: embedding?.length,
    rpcError: rpcError?.message || null,
    rpcResultsCount: rpcData?.length || 0,
    rpcFirstSimilarity: rpcData?.[0]?.similarity || null,
    directQueryRows: directData?.length || 0,
    directSample: directData?.[0]?.content_text?.substring(0, 100) || null,
    results: (rpcData || []).map((r: any) => ({
      similarity: r.similarity,
      chapter: r.chapter_name,
      preview: r.content?.substring(0, 150)
    }))
  })
}
