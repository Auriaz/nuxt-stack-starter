import { prisma } from '../services/prisma'
import type { UserSettings } from '@prisma/client'
import type { SettingsUpdateInput } from '../../shared/types/settings.js'

/** Typ jednego wpisu w llmProviders (w DB: JSON). */
export type LlmProviderEntry = { provider: string, apiKey: string }

/**
 * Repository dla operacji na ustawieniach użytkownika (UserSettings).
 * Abstrakcja bazy danych dla settings use-case'ów.
 */
export interface SettingsRepository {
  findByUserId(userId: number): Promise<UserSettings | null>
  upsert(userId: number, data: Partial<SettingsUpdateInput>): Promise<UserSettings>
}

export function parseLlmProviders(json: unknown): LlmProviderEntry[] {
  if (!Array.isArray(json)) return []
  return json.filter(
    (x): x is LlmProviderEntry =>
      x && typeof x === 'object' && typeof (x as LlmProviderEntry).provider === 'string' && typeof (x as LlmProviderEntry).apiKey === 'string'
  )
}

export const settingsRepository: SettingsRepository = {
  async findByUserId(userId: number) {
    return await prisma.userSettings.findUnique({
      where: { userId }
    })
  },

  async upsert(userId: number, data: Partial<SettingsUpdateInput>) {
    const updateData: Record<string, unknown> = {}
    if (data.locale !== undefined) updateData.locale = data.locale
    if (data.timezone !== undefined) updateData.timezone = data.timezone
    if (data.appearanceTheme !== undefined) updateData.appearanceTheme = data.appearanceTheme
    if (data.emailNotifications !== undefined) updateData.emailNotifications = data.emailNotifications
    if (data.marketingEmails !== undefined) updateData.marketingEmails = data.marketingEmails
    if (data.llmApiKey !== undefined) updateData.llmApiKey = data.llmApiKey
    if (data.llmSystemPrompt !== undefined) updateData.llmSystemPrompt = data.llmSystemPrompt
    if (data.calendarPrefs !== undefined) updateData.calendarPrefs = data.calendarPrefs

    if (data.llmProviders !== undefined && data.llmProviders.length > 0) {
      const existing = await prisma.userSettings.findUnique({ where: { userId } })
      const current = parseLlmProviders((existing as { llmProviders?: unknown })?.llmProviders ?? null)
      const byProvider = new Map(current.map(e => [e.provider, e]))
      for (const item of data.llmProviders) {
        if (item.apiKey === null || item.apiKey === undefined || String(item.apiKey).trim() === '') {
          byProvider.delete(item.provider)
        } else {
          byProvider.set(item.provider, { provider: item.provider, apiKey: String(item.apiKey).trim() })
        }
      }
      updateData.llmProviders = Array.from(byProvider.values())
    }

    return await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        ...(updateData as {
          locale?: string
          timezone?: string
          appearanceTheme?: string
          emailNotifications?: boolean
          marketingEmails?: boolean
          llmApiKey?: string | null
          llmProviders?: LlmProviderEntry[]
          llmSystemPrompt?: string | null
          calendarPrefs?: unknown
        })
      },
      update: updateData as {
        locale?: string
        timezone?: string
        appearanceTheme?: string
        emailNotifications?: boolean
        marketingEmails?: boolean
        llmApiKey?: string | null
        llmProviders?: LlmProviderEntry[]
        llmSystemPrompt?: string | null
        calendarPrefs?: unknown
      }
    })
  }
}
