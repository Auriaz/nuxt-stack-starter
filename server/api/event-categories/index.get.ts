import { safeParse } from 'valibot'
import { ListEventCategoriesQuerySchema } from '#shared/schemas/event-category'
import { createEventCategoryRepository } from '~~/server/repositories/eventCategory.repo'
import { listCategories } from '~~/domain/event-category/use-cases/listCategories'

/**
 * GET /api/event-categories
 *
 * Lista kategorii zdarzeń według scope (personal, team, all, system)
 */
export default defineEventHandler(async (event) => {
  // 1. Auth
  const session = await requireUserSession(event)
  const user = session.user as { id?: number, permissions?: string[] } | undefined
  const userId = user?.id

  if (!userId) {
    throw createError({
      status: 401,
      statusText: 'Unauthorized',
      data: { error: { code: 'UNAUTHORIZED', message: 'Missing user id' } }
    })
  }

  // 2. Parse & validate query
  const query = getQuery(event)
  const parseResult = safeParse(ListEventCategoriesQuerySchema, query)

  if (!parseResult.success) {
    throw createError({
      status: 400,
      statusText: 'Bad Request',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nieprawidłowe parametry zapytania',
          issues: parseResult.issues.map(issue => ({
            path: issue.path?.map(p => String(p.key)).join('.') ?? 'unknown',
            message: issue.message
          }))
        }
      }
    })
  }

  const { scope = 'all', teamId } = parseResult.output

  // 3. Permissions
  const permissions = user.permissions ?? []

  // 4. Repository
  const repo = createEventCategoryRepository()

  // 5. Use-case
  const categories = await listCategories(
    {
      scope,
      userId,
      teamId,
      permissions
    },
    repo
  )

  // 6. Response
  return {
    data: categories,
    meta: {
      total: categories.length,
      scope
    }
  }
})
