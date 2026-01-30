/**
 * DELETE /api/media/:id
 * Soft delete zasobu (owner lub media.manage) + usunięcie pliku ze storage.
 */
import { getRouterParam } from 'h3'
import type { SessionUser } from '~~/domain/auth/auth.types'
import { deleteMediaUseCase } from '~~/domain/media/deleteMedia.usecase'
import { mediaAssetRepository } from '~~/server/repositories/mediaAsset.repo'
import { getStorageService } from '~~/server/services/storage/storage.service'
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

  const result = await deleteMediaUseCase(user.id, id, mediaAssetRepository, bypassOwner)
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

  const { storagePath } = result.value
  if (storagePath) {
    try {
      const storage = getStorageService()
      await storage.delete(storagePath)
    } catch {
      // Ignoruj błąd usuwania pliku ze storage – rekord w DB i tak zostanie usunięty
    }
  }

  return { data: { ok: true } }
})
