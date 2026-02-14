import type { UpdateEventCategoryInput, EventCategoryDTO } from '#shared/types/event-category'
import type { EventCategoryRepository } from '~~/server/repositories/eventCategory.repo'
import { mapEventCategoryToDTO } from '../mappers/categoryMapper'
import { canEditCategory, normalizeSlug } from '../rules/categoryRules'
import { EventCategoryNotFoundError, EventCategoryPermissionError, EventCategoryConflictError } from '../errors'

export interface UpdateCategoryInput {
  categoryId: number
  data: UpdateEventCategoryInput
  userId: number
  permissions: string[]
}

/**
 * Use-case: Aktualizacja kategorii
 */
export async function updateCategory(
  input: UpdateCategoryInput,
  repo: EventCategoryRepository
): Promise<EventCategoryDTO> {
  // 1. Pobierz kategorię
  const category = await repo.findById(input.categoryId)
  if (!category) {
    throw new EventCategoryNotFoundError('Kategoria nie istnieje')
  }

  // 2. Sprawdź uprawnienia
  if (!canEditCategory(category, input.userId, input.permissions)) {
    throw new EventCategoryPermissionError('Brak uprawnień do edycji tej kategorii')
  }

  // 3. Jeśli zmieniono slug, sprawdź unikalność
  if (input.data.slug && input.data.slug !== category.slug) {
    const normalizedSlug = normalizeSlug(input.data.slug)
    const scope = {
      userId: category.userId,
      teamId: category.teamId
    }

    const existingCount = await repo.countBySlug(normalizedSlug, scope, category.id)
    if (existingCount > 0) {
      throw new EventCategoryConflictError('Kategoria o podanym slug już istnieje w tym scope')
    }

    input.data.slug = normalizedSlug
  }

  // 4. Aktualizuj kategorię
  const updated = await repo.update(input.categoryId, input.data)

  // 5. Zwróć DTO
  return mapEventCategoryToDTO(updated, input.userId, input.permissions)
}
