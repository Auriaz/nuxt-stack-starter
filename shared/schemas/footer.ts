import { object, string, array, optional, boolean, picklist } from 'valibot'

// FooterLinkSchema - pojedynczy link w kolumnie
export const FooterLinkSchema = object({
  label: string(),
  to: optional(string()), // Link wewnętrzny (Nuxt route)
  href: optional(string()), // Link zewnętrzny (URL)
  external: optional(boolean()), // Czy link jest zewnętrzny
  icon: optional(string()) // Opcjonalna ikona (np. 'i-lucide-home')
})

// FooterColumnSchema - kolumna z linkami
export const FooterColumnSchema = object({
  title: string(),
  links: array(FooterLinkSchema)
})

// FooterContactSchema - dane kontaktowe
export const FooterContactSchema = object({
  email: optional(string()),
  phone: optional(string()),
  address: optional(string()),
  hours: optional(string()) // Godziny otwarcia (np. 'Pon-Pt: 9:00-17:00')
})

// FooterSocialSchema - link do social media
export const FooterSocialSchema = object({
  name: string(), // Nazwa platformy (np. 'GitHub', 'Twitter')
  href: string(), // URL do profilu
  icon: string() // Ikona (np. 'i-simple-icons-github')
})

// FooterLegalSchema - informacje prawne
export const FooterLegalSchema = object({
  companyName: string(),
  yearStart: optional(string()), // Rok rozpoczęcia działalności (dla copyright)
  privacyUrl: optional(string()), // URL do polityki prywatności
  termsUrl: optional(string()), // URL do regulaminu
  cookiesUrl: optional(string()) // URL do polityki cookies
})

// FooterNewsletterSchema - konfiguracja newslettera
export const FooterNewsletterSchema = object({
  enabled: optional(boolean()), // Czy newsletter jest włączony
  title: optional(string()), // Tytuł sekcji newslettera
  description: optional(string()), // Opis newslettera
  placeholder: optional(string()), // Placeholder dla pola email
  buttonLabel: optional(string()) // Tekst przycisku
})

// FooterBrandSchema - brand/logo
export const FooterBrandSchema = object({
  name: optional(string()), // Nazwa firmy/brandu
  description: optional(string()), // Krótki opis
  logo: optional(string()) // Ścieżka do logo
})

// FooterConfigSchema - główny schemat konfiguracji footera
export const FooterConfigSchema = object({
  brand: optional(FooterBrandSchema),
  columns: optional(array(FooterColumnSchema)), // Kolumny z linkami nawigacji
  contact: optional(FooterContactSchema),
  social: optional(array(FooterSocialSchema)),
  legal: optional(FooterLegalSchema),
  newsletter: optional(FooterNewsletterSchema),
  backToTop: optional(boolean()), // Czy pokazać przycisk "back to top"
  theme: optional(picklist(['light', 'dark', 'brand'] as const)), // Motyw kolorystyczny
  container: optional(picklist(['default', 'wide'] as const)), // Szerokość kontenera
  spacing: optional(picklist(['sm', 'md', 'lg'] as const)), // Padding sekcji
  schema: optional(
    object({
      enabled: optional(boolean()) // Czy włączyć Schema.org
    })
  )
})
