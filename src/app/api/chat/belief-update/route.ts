import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { session_id, response } = await req.json()

  if (!session_id || !['changed', 'partial', 'unchanged'].includes(response)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { error } = await supabase
    .from('student_confusion_log')
    .update({ belief_change_response: response })
    .eq('session_id', session_id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('[BELIEF_UPDATE] Write failed:', error)
    return NextResponse.json({ error: 'Write failed' }, { status: 500 })
  }

  console.log(`[BELIEF_UPDATE] session=${session_id} response=${response}`)
  return NextResponse.json({ ok: true })
}
