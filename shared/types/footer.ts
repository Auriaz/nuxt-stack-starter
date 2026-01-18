import type { InferOutput } from 'valibot'
import type {
  FooterConfigSchema,
  FooterLinkSchema,
  FooterColumnSchema,
  FooterContactSchema,
  FooterSocialSchema,
  FooterLegalSchema,
  FooterNewsletterSchema,
  FooterBrandSchema
} from '../schemas/footer'

// Główny typ konfiguracji footera
export type FooterConfig = InferOutput<typeof FooterConfigSchema>

// Pomocnicze typy dla poszczególnych sekcji
export type FooterLink = InferOutput<typeof FooterLinkSchema>
export type FooterColumn = InferOutput<typeof FooterColumnSchema>
export type FooterContact = InferOutput<typeof FooterContactSchema>
export type FooterSocial = InferOutput<typeof FooterSocialSchema>
export type FooterLegal = InferOutput<typeof FooterLegalSchema>
export type FooterNewsletter = InferOutput<typeof FooterNewsletterSchema>
export type FooterBrand = InferOutput<typeof FooterBrandSchema>

// Typ dla wyników queryCollection('app')
export type FooterConfigEntry = FooterConfig & {
  _path: string
  _id: string
  _type: string
}
