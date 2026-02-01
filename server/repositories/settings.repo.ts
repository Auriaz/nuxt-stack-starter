import { prisma } from '../services/prisma'
import type { UserSettings } from '../../prisma/generated/client.js'
import type { SettingsUpdateInput } from '../../shared/types/settings.js'

/**
 * Repository dla operacji na ustawieniach użytkownika (UserSettings).
 * Abstrakcja bazy danych dla settings use-case'ów.
 */
export interface SettingsRepository {
  findByUserId(userId: number): Promise<UserSettings | null>
  upsert(userId: number, data: Partial<SettingsUpdateInput>): Promise<UserSettings>
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
        })
      },
      update: updateData as {
        locale?: string
        timezone?: string
        appearanceTheme?: string
        emailNotifications?: boolean
        marketingEmails?: boolean
      }
    })
  }
}
