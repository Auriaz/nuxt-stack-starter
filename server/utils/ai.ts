/**
 * Helper do completion LLM (Vercel AI SDK + OpenAI).
 * Używany przez POST /api/ai/completion.
 */
import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const preserveMarkdown
  = 'IMPORTANT: Preserve all markdown formatting (bold, italic, links, etc.) exactly as in the original.'

export type CompletionMode
  = | 'continue'
    | 'fix'
    | 'extend'
    | 'reduce'
    | 'simplify'
    | 'summarize'
    | 'translate'

export function getSystemPrompt(mode: CompletionMode, language?: string): string {
  switch (mode) {
    case 'fix':
      return `You are a writing assistant. Fix all spelling and grammar errors in the given text. ${preserveMarkdown} Only output the corrected text, nothing else.`
    case 'extend':
      return `You are a writing assistant. Extend the given text with more details, examples, and explanations while maintaining the same style. ${preserveMarkdown} Only output the extended text, nothing else.`
    case 'reduce':
      return `You are a writing assistant. Make the given text more concise by removing unnecessary words while keeping the meaning. ${preserveMarkdown} Only output the reduced text, nothing else.`
    case 'simplify':
      return `You are a writing assistant. Simplify the given text to make it easier to understand, using simpler words and shorter sentences. ${preserveMarkdown} Only output the simplified text, nothing else.`
    case 'summarize':
      return 'You are a writing assistant. Summarize the given text concisely while keeping the key points. Only output the summary, nothing else.'
    case 'translate':
      return `You are a writing assistant. Translate the given text to ${language || 'English'}. ${preserveMarkdown} Only output the translated text, nothing else.`
    case 'continue':
    default:
      return `You are a writing assistant providing inline autocompletions.
CRITICAL RULES:
- Output ONLY the NEW text that comes AFTER the user's input
- NEVER repeat any words from the end of the user's text
- Keep completions short (1 sentence max)
- Match the tone and style of the existing text
- ${preserveMarkdown}`
  }
}

export function getMaxTokens(mode: CompletionMode): number {
  switch (mode) {
    case 'fix':
    case 'extend':
    case 'translate':
      return 500
    case 'reduce':
      return 300
    case 'simplify':
    case 'summarize':
      return 400
    case 'continue':
    default:
      return 80
  }
}

/**
 * Uruchamia streamText z podanym kluczem API (lub fallback z env).
 * Zwraca wynik streamText (do wywołania .toTextStreamResponse() w handlerze).
 * customSystemPrompt — własny prompt z ustawień (np. kontekst bloga, ton); dopisywany na początku systemu.
 */
export async function runCompletionStream(
  prompt: string,
  mode: CompletionMode,
  apiKey: string | null | undefined,
  language?: string,
  customSystemPrompt?: string | null
) {
  const key = (apiKey?.trim() || undefined) ?? process.env.NUXT_AI_API_KEY
  if (!key) {
    throw new Error('Skonfiguruj klucz API w Ustawieniach → Integracje lub ustaw NUXT_AI_API_KEY.')
  }

  const openai = createOpenAI({ apiKey: key })
  const baseSystem = getSystemPrompt(mode, language)
  const custom = customSystemPrompt?.trim()
  const system = custom ? `${custom}\n\n${baseSystem}` : baseSystem
  const maxTokens = getMaxTokens(mode)

  return streamText({
    model: openai('gpt-4o-mini'),
    system,
    prompt,
    maxOutputTokens: maxTokens
  })
}
