import { object, string, optional, boolean, picklist } from 'valibot'

const localePicklist = picklist(['pl', 'en'], 'Nieprawidłowa wartość języka')
const appearanceThemePicklist = picklist(
  ['system', 'light', 'dark'],
  'Nieprawidłowa wartość motywu'
)

/**
 * Schemat outputu ustawień (GET /api/settings/me).
 * Zawiera pola z UserSettings + showEmail z User (do agregacji widoku).
 */
export const SettingsOutputSchema = object({
  locale: optional(string()),
  timezone: optional(string()),
  appearanceTheme: optional(string()),
  emailNotifications: optional(boolean()),
  marketingEmails: optional(boolean()),
  showEmail: optional(boolean())
})

/**
 * Schemat inputu aktualizacji ustawień (PATCH /api/settings/me).
 * Wszystkie pola opcjonalne; enumy dla locale i appearanceTheme.
 */
export const SettingsUpdateSchema = object({
  locale: optional(localePicklist),
  timezone: optional(string()),
  appearanceTheme: optional(appearanceThemePicklist),
  emailNotifications: optional(boolean()),
  marketingEmails: optional(boolean())
})
