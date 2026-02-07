import { object, string, optional, picklist } from 'valibot'

const completionModePicklist = picklist(
  ['continue', 'fix', 'extend', 'reduce', 'simplify', 'summarize', 'translate'],
  'Nieprawidłowy tryb completion'
)

/** Body POST /api/ai/completion */
export const CompletionBodySchema = object({
  prompt: string(),
  mode: completionModePicklist,
  language: optional(string()),
  provider: optional(string()) // np. openai, anthropic — domyślnie openai
})
