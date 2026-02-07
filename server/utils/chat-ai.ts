import { streamText, type ModelMessage } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const baseSystemPrompt
  = 'You are a helpful assistant inside the application. Be concise and provide actionable guidance.'

export function buildChatSystemPrompt(customSystemPrompt?: string | null) {
  const custom = customSystemPrompt?.trim()
  return custom ? `${custom}\n\n${baseSystemPrompt}` : baseSystemPrompt
}

export function createChatCompletionStream(options: {
  apiKey?: string | null
  customSystemPrompt?: string | null
  messages: ModelMessage[]
  onDelta?: (delta: string) => void
}) {
  const key = (options.apiKey?.trim() || undefined) ?? process.env.NUXT_AI_API_KEY
  if (!key) {
    throw new Error('Skonfiguruj klucz API w Ustawieniach -> Integracje lub ustaw NUXT_AI_API_KEY.')
  }

  const openai = createOpenAI({ apiKey: key })
  const system = buildChatSystemPrompt(options.customSystemPrompt)

  return streamText({
    model: openai('gpt-4o-mini'),
    system,
    messages: options.messages,
    onChunk: (event) => {
      if (event.chunk.type === 'text-delta' && 'text' in event.chunk) {
        options.onDelta?.(event.chunk.text)
      }
    }
  })
}
