import { object, string, optional, boolean, picklist, nullable, array } from 'valibot'

const localePicklist = picklist(['pl', 'en'], 'Nieprawidłowa wartość języka')
const appearanceThemePicklist = picklist(
  ['system', 'light', 'dark'],
  'Nieprawidłowa wartość motywu'
)

/** Jedna pozycja LLM w odpowiedzi (bez klucza — tylko provider i flaga hasKey). */
export const LlmProviderOutputSchema = object({
  provider: string(),
  hasKey: boolean()
})

/** Jedna pozycja LLM przy aktualizacji (provider + opcjonalny klucz; null = usuń). */
export const LlmProviderUpdateSchema = object({
  provider: string(),
  apiKey: optional(nullable(string()))
})

/**
 * Schemat outputu ustawień (GET /api/settings/me).
 * llmApiKey/llmProviders NIE zwracają kluczy; tylko hasLlmKey i llmProviders z hasKey.
 */
export const SettingsOutputSchema = object({
  locale: optional(string()),
  timezone: optional(string()),
  appearanceTheme: optional(string()),
  emailNotifications: optional(boolean()),
  marketingEmails: optional(boolean()),
  showEmail: optional(boolean()),
  hasLlmKey: optional(boolean()),
  llmProviders: optional(array(LlmProviderOutputSchema)),
  llmSystemPrompt: optional(string())
})

/**
 * Schemat inputu aktualizacji ustawień (PATCH /api/settings/me).
 * llmProviders: [{ provider, apiKey }] — apiKey null = usuń klucz dla tego providera.
 */
export const SettingsUpdateSchema = object({
  locale: optional(localePicklist),
  timezone: optional(string()),
  appearanceTheme: optional(appearanceThemePicklist),
  emailNotifications: optional(boolean()),
  marketingEmails: optional(boolean()),
  llmApiKey: optional(nullable(string())),
  llmProviders: optional(array(LlmProviderUpdateSchema)),
  llmSystemPrompt: optional(nullable(string()))
})
