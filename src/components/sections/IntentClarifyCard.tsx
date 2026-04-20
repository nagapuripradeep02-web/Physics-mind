// Layer 0 clarification card
// Renders when API returns type: "LAYER0_CLARIFY"
// Student sees one question with 2-3 option buttons
// Picking an option sends enriched question back to pipeline
import { useState } from 'react'

export interface IntentClarifyCardProps {
  clarifying_question: string
  option_a: { label: string; maps_to_aspect: string }
  option_b: { label: string; maps_to_aspect: string }
  option_c?: { label: string; maps_to_aspect: string } | null
  original_question: string
  onOptionSelected: (enrichedQuestion: string) => void
}

export function IntentClarifyCard({
  clarifying_question,
  option_a,
  option_b,
  option_c,
  original_question,
  onOptionSelected
}: IntentClarifyCardProps) {
  
  const [selected, setSelected] = useState<string | null>(null)
  
  const handleSelect = (option: { label: string; maps_to_aspect: string }) => {
    if (selected) return // prevent double-click
    setSelected(option.label)
    
    // Build enriched question and send back to pipeline
    const enriched = `[L0_ANSWER] ${original_question} [student clarified: ${option.label}]`
    onOptionSelected(enriched)
  }
  
  const options = [option_a, option_b, option_c].filter(Boolean) as { label: string; maps_to_aspect: string }[]
  
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-4 max-w-sm">
      <p className="text-amber-400 text-xs font-medium mb-2">
        ● One sec...
      </p>
      <p className="text-white text-sm mb-3">
        {clarifying_question}
      </p>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <button
            key={opt.maps_to_aspect}
            onClick={() => handleSelect(opt)}
            disabled={!!selected}
            className={`
              text-left text-sm px-3 py-2 rounded-md border transition-all
              ${selected === opt.label 
                ? 'border-amber-500 bg-amber-500/20 text-amber-300' 
                : selected 
                  ? 'border-white/10 text-white/30 cursor-not-allowed'
                  : 'border-white/20 text-white hover:border-amber-500/50 hover:bg-white/5'
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
