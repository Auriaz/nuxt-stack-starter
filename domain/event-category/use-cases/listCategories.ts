import type { EventCategoryDTO, EventCategoryScope } from '#shared/types/event-category'
import type { EventCategoryRepository } from '~~/server/repositories/eventCategory.repo'
import { mapEventCategoryToDTO } from '../mappers/categoryMapper'
import { PERMISSIONS } from '#shared/permissions'

export interface ListCategoriesInput {
  scope: EventCategoryScope
  userId: number
  teamId?: number
  permissions: string[]
}

/**
 * Use-case: Lista kategorii dla użytkownika według scope
 */
export async function listCategories(
  input: ListCategoriesInput,
  repo: EventCategoryRepository
): Promise<EventCategoryDTO[]> {
  const categories: EventCategoryDTO[] = []

  // 1. Systemowe (zawsze widoczne dla wszystkich)
  if (input.scope === 'system' || input.scope === 'all') {
    const systemCategories = await repo.list({ isSystem: true, userId: null, teamId: null })
    categories.push(...systemCategories.map(cat => mapEventCategoryToDTO(cat, input.userId, input.permissions)))
  }

  // 2. Osobiste (prywatne użytkownika)
  if (input.scope === 'personal' || input.scope === 'all') {
    if (input.permissions.includes(PERMISSIONS.CATEGORY_READ)) {
      const personalCategories = await repo.list({ userId: input.userId, teamId: null, isSystem: false })
      categories.push(...personalCategories.map(cat => mapEventCategoryToDTO(cat, input.userId, input.permissions)))
    }
  }

  // 3. Teamowe
  if (input.scope === 'team' || input.scope === 'all') {
    if (input.teamId && input.permissions.includes(PERMISSIONS.CATEGORY_READ)) {
      const teamCategories = await repo.list({ userId: null, teamId: input.teamId, isSystem: false })
      categories.push(...teamCategories.map(cat => mapEventCategoryToDTO(cat, input.userId, input.permissions)))
    }
  }

  return categories
}
