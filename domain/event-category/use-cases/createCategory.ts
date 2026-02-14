import type { CreateEventCategoryInput, EventCategoryDTO } from '#shared/types/event-category'
import type { EventCategoryRepository } from '~~/server/repositories/eventCategory.repo'
import { mapEventCategoryToDTO } from '../mappers/categoryMapper'
import { normalizeSlug } from '../rules/categoryRules'
import { PERMISSIONS } from '#shared/permissions'
import { EventCategoryPermissionError, EventCategoryConflictError } from '../errors'

export interface CreateCategoryInput {
  data: CreateEventCategoryInput
  userId: number
  permissions: string[]
}

/**
 * Use-case: Tworzenie nowej kategorii
 */
export async function createCategory(
  input: CreateCategoryInput,
  repo: EventCategoryRepository
): Promise<EventCategoryDTO> {
  // 1. Sprawdź uprawnienia
  const isSystemCategory = input.data.isSystem === true
  const isTeamCategory = input.data.teamId !== undefined && input.data.teamId !== null

  if (isSystemCategory && isTeamCategory) {
    throw new EventCategoryPermissionError('Kategoria systemowa nie moze byc powiazana z zespol')
  }

  const isAdmin = input.permissions.includes(PERMISSIONS.ADMIN_ACCESS)

  if (isSystemCategory && !isAdmin && !input.permissions.includes(PERMISSIONS.CATEGORY_SYSTEM_MANAGE)) {
    throw new EventCategoryPermissionError('Brak uprawnien do tworzenia kategorii systemowych')
  }

  if (isTeamCategory && !isAdmin && !input.permissions.includes(PERMISSIONS.CATEGORY_TEAM_MANAGE)) {
    throw new EventCategoryPermissionError('Brak uprawnien do tworzenia kategorii zespolowych')
  }

  if (!isAdmin && !isSystemCategory && !isTeamCategory && !input.permissions.includes(PERMISSIONS.CATEGORY_CREATE)) {
    throw new EventCategoryPermissionError('Brak uprawnien do tworzenia kategorii')
  }

  // 2. Normalizuj slug
  const slug = normalizeSlug(input.data.slug)

  // 3. Sprawdź unikalność slug w scope
  const scope = {
    userId: isSystemCategory || isTeamCategory ? null : input.userId,
    teamId: isTeamCategory ? input.data.teamId ?? null : null
  }

  const existingCount = await repo.countBySlug(slug, scope)
  if (existingCount > 0) {
    throw new EventCategoryConflictError('Kategoria o podanym slug już istnieje w tym scope')
  }

  // 4. Utwórz kategorię
  const category = await repo.create({
    userId: isSystemCategory || isTeamCategory ? null : input.userId,
    teamId: isTeamCategory ? input.data.teamId ?? null : null,
    label: input.data.label,
    slug,
    description: input.data.description ?? null,
    color: input.data.color,
    icon: input.data.icon,
    isSystem: isSystemCategory,
    isDefault: input.data.isDefault ?? false,
    sortOrder: input.data.sortOrder ?? 0
  })

  // 5. Zwróć DTO
  return mapEventCategoryToDTO(category, input.userId, input.permissions)
}
