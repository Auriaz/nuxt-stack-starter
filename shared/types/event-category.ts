import type { InferOutput } from 'valibot'
import type {
  CreateEventCategoryInputSchema,
  UpdateEventCategoryInputSchema,
  EventCategoryScopeSchema
} from '../schemas/event-category'

/**
 * DTO kategorii zdarzeń (zwracane z API)
 */
export interface EventCategoryDTO {
  id: number
  userId: number | null
  teamId: number | null
  label: string
  slug: string
  description: string | null
  color: string
  icon: string
  isSystem: boolean
  isDefault: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string

  // Computed properties
  scope: 'system' | 'personal' | 'team'
  canEdit: boolean
  canDelete: boolean
}

/**
 * Input do tworzenia kategorii
 */
export type CreateEventCategoryInput = InferOutput<typeof CreateEventCategoryInputSchema>

/**
 * Input do aktualizacji kategorii
 */
export type UpdateEventCategoryInput = InferOutput<typeof UpdateEventCategoryInputSchema>

/**
 * Scope kategorii (filtrowanie)
 */
export type EventCategoryScope = InferOutput<typeof EventCategoryScopeSchema>

/**
 * Lista kategorii z metadanymi
 */
export interface EventCategoryListDTO {
  categories: EventCategoryDTO[]
  meta: {
    total: number
    scope: EventCategoryScope | 'all'
  }
}
