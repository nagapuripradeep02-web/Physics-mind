// Layer 0 — Intent Conversation
// Runs BEFORE the classifier on every new question.
// Flash asks ONE clarifying question with 2-3 options.
// Student picks an option → enriched input goes to classifier.
// Cost: ~$0.0001 per question. Latency: ~2 seconds.

import { GoogleGenerativeAI } from '@google/generative-ai'
import * as fs from 'fs'
import * as path from 'path'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export interface Layer0Option {
  label: string
  maps_to_aspect: string
}

export interface Layer0Result {
  skip: boolean
  clarifying_question?: string
  option_a?: Layer0Option
  option_b?: Layer0Option
  option_c?: Layer0Option
  reason?: string
}

export async function getIntentClarification(
  studentQuestion: string
): Promise<Layer0Result> {
  
  // Load prompt template
  const promptTemplate = fs.readFileSync(
    path.join(process.cwd(), 'src/prompts/layer0_intent_conversation.txt'),
    'utf-8'
  )
  
  const prompt = promptTemplate.replace('{STUDENT_QUESTION}', studentQuestion)
  
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      maxOutputTokens: 512,
      temperature: 0.3, // low temperature — we want consistent structured output
    }
  })
  
  try {
    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()
    
    // Strip markdown if Flash wraps in backticks
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()
    
    const parsed: Layer0Result = JSON.parse(cleaned)
    return parsed
    
  } catch (err) {
    // If Layer 0 fails for any reason, skip it silently
    // Never block the student because of Layer 0 failure
    console.warn('[Layer0] Failed, skipping:', err)
    return { skip: true, reason: 'layer0_error' }
  }
}

// When student picks an option, enrich the original question
// Returns a combined input for the classifier
export function buildEnrichedQuestion(
  originalQuestion: string,
  selectedOption: Layer0Option
): string {
  return `${originalQuestion} [student clarified: ${selectedOption.label}]`
}
