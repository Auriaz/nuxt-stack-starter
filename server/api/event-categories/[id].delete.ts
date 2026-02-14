import { createEventCategoryRepository } from '~~/server/repositories/eventCategory.repo'
import { deleteCategory } from '~~/domain/event-category/use-cases/deleteCategory'
import { EventCategoryNotFoundError, EventCategoryPermissionError } from '~~/domain/event-category/errors'
import { PERMISSIONS } from '~~/shared/permissions'
import { hasPermission, hasRole } from '~~/domain/access/access.service'

/**
 * DELETE /api/event-categories/:id
 *
 * Usuwanie kategorii zdarzeń
 */
export default defineEventHandler(async (event) => {
  // 1. Auth
  const session = await requireUserSession(event)
  const user = session.user as { id?: number, role?: string, permissions?: string[] } | undefined
  const userId = user?.id

  if (!userId) {
    throw createError({
      status: 401,
      statusText: 'Unauthorized',
      data: { error: { code: 'UNAUTHORIZED', message: 'Missing user id' } }
    })
  }

  // 2. Parse ID
  const id = getRouterParam(event, 'id')
  const categoryId = Number(id)

  if (!categoryId || isNaN(categoryId)) {
    throw createError({
      status: 400,
      statusText: 'Bad Request',
      data: { error: { code: 'VALIDATION_ERROR', message: 'Nieprawidłowe ID kategorii' } }
    })
  }

  // 3. Permissions
  if (!hasRole(user, 'admin')
    && !hasPermission(user, PERMISSIONS.ADMIN_ACCESS)
    && !hasPermission(user, PERMISSIONS.CATEGORY_SYSTEM_MANAGE)) {
    throw createError({
      status: 403,
      statusText: 'Forbidden',
      data: { error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } }
    })
  }
  const permissions = user.permissions ?? []

  // 4. Repository
  const repo = createEventCategoryRepository()

  // 5. Use-case with error handling
  try {
    await deleteCategory(
      {
        categoryId,
        userId,
        permissions
      },
      repo
    )

    // 6. Response
    return {
      data: { success: true },
      meta: {
        requestId: event.context.requestId
      }
    }
  } catch (err) {
    if (err instanceof EventCategoryNotFoundError) {
      throw createError({ status: 404, statusText: 'Not Found', data: { error: { code: 'NOT_FOUND', message: err.message } } })
    }
    if (err instanceof EventCategoryPermissionError) {
      throw createError({ status: 403, statusText: 'Forbidden', data: { error: { code: 'FORBIDDEN', message: err.message } } })
    }
    throw err
  }
})
