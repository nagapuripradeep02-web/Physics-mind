'use client'
import { useState } from 'react'

interface BeliefProbeCardProps {
  sessionId: string
  studentBelief: string
}

export function BeliefProbeCard({ sessionId, studentBelief }: BeliefProbeCardProps) {
  const [submitted, setSubmitted] = useState(false)

  const handleResponse = async (response: 'changed' | 'partial' | 'unchanged') => {
    setSubmitted(true)
    await fetch('/api/chat/belief-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, response })
    })
  }

  if (submitted) {
    return (
      <div className="mt-4 p-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a4e] text-sm text-[#69F0AE]">
        Got it — thanks for the feedback.
      </div>
    )
  }

  return (
    <div className="mt-4 p-4 rounded-lg bg-[#0f0f1e] border border-[#2a2a4e]">
      <p className="text-xs text-[#8888aa] mb-1">Before this simulation, you thought:</p>
      <p className="text-sm italic text-[#aaaacc] mb-3">&ldquo;{studentBelief}&rdquo;</p>
      <p className="text-xs text-[#8888aa] mb-2">After seeing this, your thinking is:</p>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => handleResponse('changed')}
          className="text-left px-3 py-2 rounded bg-[#1a2e1a] border border-[#2a4e2a] text-sm text-[#69F0AE] hover:bg-[#1e3a1e] transition-colors"
        >
          ✅ That makes sense now
        </button>
        <button
          onClick={() => handleResponse('partial')}
          className="text-left px-3 py-2 rounded bg-[#2a2a1a] border border-[#4e4e2a] text-sm text-[#FFF176] hover:bg-[#333320] transition-colors"
        >
          🤔 Partially clearer
        </button>
        <button
          onClick={() => handleResponse('unchanged')}
          className="text-left px-3 py-2 rounded bg-[#2a1a1a] border border-[#4e2a2a] text-sm text-[#EF9A9A] hover:bg-[#3a2020] transition-colors"
        >
          ❓ Still confused
        </button>
      </div>
    </div>
  )
}
