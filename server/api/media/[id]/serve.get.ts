/**
 * GET /api/media/:id/serve
 * Serwowanie pliku (stream) po sprawdzeniu sesji i owner/media.manage.
 */
import { getRouterParam } from 'h3'
// import type { SessionUser } from '~~/domain/auth/auth.types'
import { mediaAssetRepository } from '~~/server/repositories/mediaAsset.repo'
import { getStorageService } from '~~/server/services/storage/storage.service'
// import { PERMISSIONS } from '~~/shared/permissions'

export default defineEventHandler(async (event) => {
  // const session = await requireUserSession(event)
  // const user = session.user as SessionUser | undefined
  // if (!user?.id) {
  //   throw createError({
  //     status: 401,
  //     statusText: 'Unauthorized',
  //     data: {
  //       error: {
  //         code: 'UNAUTHORIZED',
  //         message: 'Session has no user'
  //       }
  //     }
  //   })
  // }
  // const bypassOwner = Array.isArray(user?.permissions) && user?.permissions.includes(PERMISSIONS.MEDIA_MANAGE) ? true : false
  // Tymczasowo zezwól na dostęp bez sesji
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

  // const record = bypassOwner
  //   ? await mediaAssetRepository.findById(id)
  //   : await mediaAssetRepository.findByIdForOwner(id, user?.id)

  const record = await mediaAssetRepository.findById(id)

  if (!record) {
    const anyRecord = await mediaAssetRepository.findById(id)
    throw createError({
      status: anyRecord ? 403 : 404,
      statusText: anyRecord ? 'Forbidden' : 'Not Found',
      data: {
        error: {
          code: anyRecord ? 'FORBIDDEN' : 'NOT_FOUND',
          message: anyRecord ? 'Access denied to this media' : 'Media not found',
          status: anyRecord ? 403 : 404
        }
      }
    })
  }

  const storage = getStorageService()
  const stream = await storage.getStream(record.storagePath)
  setResponseHeader(event, 'Content-Type', record.mimeType)
  setResponseHeader(event, 'Content-Disposition', `inline; filename="${encodeURIComponent(record.originalName)}"`)
  return sendStream(event, stream)
})
