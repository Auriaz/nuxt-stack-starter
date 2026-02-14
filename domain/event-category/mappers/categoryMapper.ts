import type { EventCategoryRecord } from '~~/server/repositories/eventCategory.repo'
import type { EventCategoryDTO } from '#shared/types/event-category'
import { canDeleteCategory, canEditCategory, getCategoryScope } from '../rules/categoryRules'

/**
 * Mapuje EventCategoryRecord (DB) → EventCategoryDTO (API response)
 */
export function mapEventCategoryToDTO(
  category: EventCategoryRecord,
  userId: number,
  permissions: string[]
): EventCategoryDTO {
  return {
    id: category.id,
    userId: category.userId,
    teamId: category.teamId,
    label: category.label,
    slug: category.slug,
    description: category.description,
    color: category.color,
    icon: category.icon,
    isSystem: category.isSystem,
    isDefault: category.isDefault,
    sortOrder: category.sortOrder,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),

    // Computed properties
    scope: getCategoryScope(category),
    canEdit: canEditCategory(category, userId, permissions),
    canDelete: canDeleteCategory(category, userId, permissions)
  }
}
