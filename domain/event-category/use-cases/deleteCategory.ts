import type { EventCategoryRepository } from '~~/server/repositories/eventCategory.repo'
import { canDeleteCategory } from '../rules/categoryRules'
import { EventCategoryNotFoundError, EventCategoryPermissionError } from '../errors'
import { prisma } from '~~/server/services/prisma'

export interface DeleteCategoryInput {
  categoryId: number
  userId: number
  permissions: string[]
}

/**
 * Use-case: Usuwanie kategorii
 *
 * Usuwa kategorię i aktualizuje wszystkie powiązane wydarzenia,
 * ustawiając ich categoryId na null (fallback).
 */
export async function deleteCategory(
  input: DeleteCategoryInput,
  repo: EventCategoryRepository
): Promise<void> {
  // 1. Pobierz kategorię
  const category = await repo.findById(input.categoryId)
  if (!category) {
    throw new EventCategoryNotFoundError('Kategoria nie istnieje')
  }

  // 2. Sprawdź uprawnienia
  if (!canDeleteCategory(category, input.userId, input.permissions)) {
    throw new EventCategoryPermissionError('Brak uprawnień do usunięcia tej kategorii')
  }

  // 3. Znajdź fallback category (domyślna systemowa lub null)
  const scope = {
    userId: category.userId,
    teamId: category.teamId
  }

  const fallbackCategory = await repo.findDefaultForScope(scope)
  const fallbackCategoryId = fallbackCategory?.id ?? null

  // 4. Aktualizuj wszystkie powiązane wydarzenia (categoryId → fallback)
  const client = prisma as unknown as {
    calendarEvent: {
      updateMany: (args: unknown) => Promise<{ count: number }>
    }
  }

  await client.calendarEvent.updateMany({
    where: { categoryId: input.categoryId },
    data: { categoryId: fallbackCategoryId }
  })

  // 5. Usuń kategorię
  await repo.delete(input.categoryId)
}
