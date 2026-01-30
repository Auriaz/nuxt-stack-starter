/**
 * PATCH /api/media/:id
 * Aktualizacja metadanych (alt, caption, tags).
 */
import { getRouterParam, readBody } from 'h3'
import { safeParse } from 'valibot'
import { UpdateMediaMetadataSchema } from '#shared/schemas/media'
import type { SessionUser } from '~~/domain/auth/auth.types'
import { updateMediaUseCase } from '~~/domain/media/updateMedia.usecase'
import { mediaAssetRepository } from '~~/server/repositories/mediaAsset.repo'
import { PERMISSIONS } from '~~/shared/permissions'
import { isErr } from '~~/domain/shared/result'

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
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      status: 400,
      statusText: 'Bad Request',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing media id'
        }
      }
    })
  }

  const body = await readBody(event)
  const parsed = safeParse(UpdateMediaMetadataSchema, body)
  if (!parsed.success) {
    throw createError({
      status: 422,
      statusText: 'Validation Error',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          status: 422,
          issues: parsed.issues
        }
      }
    })
  }

  const result = await updateMediaUseCase(user.id, id, parsed.output, mediaAssetRepository, bypassOwner)
  if (isErr(result)) {
    throw createError({
      status: result.error.statusCode,
      statusText: result.error.message,
      data: {
        error: {
          code: result.error.code,
          message: result.error.message,
          status: result.error.statusCode
        }
      }
    })
  }
  return { data: result.value }
})
