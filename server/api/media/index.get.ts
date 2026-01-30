/**
 * GET /api/media
 * Lista zasobów użytkownika (lub wszystkich dla admina z media.manage).
 */
import { getQuery } from 'h3'
import { safeParse } from 'valibot'
import { MediaListQuerySchema } from '#shared/schemas/media'
import type { SessionUser } from '~~/domain/auth/auth.types'
import { listMediaUseCase } from '~~/domain/media/listMedia.usecase'
import { mediaAssetRepository } from '~~/server/repositories/mediaAsset.repo'
import { PERMISSIONS } from '~~/shared/permissions'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = session.user as SessionUser | undefined
  if (!user?.id) {
    throw createError({
      status: 401,
      statusText: 'Unauthorized',
      data: {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Session has no user'
        }
      }
    })
  }
  const bypassOwner = Array.isArray(user.permissions) && user.permissions.includes(PERMISSIONS.MEDIA_MANAGE)

  const query = getQuery(event)
  const parsed = safeParse(MediaListQuerySchema, {
    type: query.type,
    search: query.search,
    tags: typeof query.tags === 'string' ? [query.tags] : Array.isArray(query.tags) ? query.tags : undefined,
    page: query.page != null ? Number(query.page) : undefined,
    perPage: query.perPage != null ? Number(query.perPage) : undefined
  })
  if (!parsed.success) {
    throw createError({
      status: 422,
      statusText: 'Validation Error',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query',
          status: 422,
          issues: parsed.issues
        }
      }
    })
  }

  const result = await listMediaUseCase(
    { userId: user.id, query: parsed.output, bypassOwner },
    mediaAssetRepository
  )
  return { data: result }
})
