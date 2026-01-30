/**
 * POST /api/media/upload
 * Upload pliku (multipart/form-data): file (required), opcjonalnie alt, caption, tags[].
 */
import { readMultipartFormData } from 'h3'
import { safeParse } from 'valibot'
import { UploadMetadataSchema } from '#shared/schemas/media'
import { uploadMediaUseCase } from '~~/domain/media/uploadMedia.usecase'
import { mediaAssetRepository } from '~~/server/repositories/mediaAsset.repo'
import { getStorageService } from '~~/server/services/storage/storage.service'
import { requirePermission } from '~~/server/utils/access'
import { PERMISSIONS } from '~~/shared/permissions'
import { isErr } from '~~/domain/shared/result'

export default defineEventHandler(async (event) => {
  const user = await requirePermission(event, PERMISSIONS.MEDIA_CREATE)
  const userId = user.id

  const form = await readMultipartFormData(event)
  if (!form?.length) {
    throw createError({
      status: 422,
      statusText: 'Validation Error',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No file provided',
          status: 422
        }
      }
    })
  }

  const filePart = form.find(p => p.name === 'file' && p.data?.length)
  if (!filePart?.data) {
    throw createError({
      status: 422,
      statusText: 'Validation Error',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing file field',
          status: 422
        }
      }
    })
  }

  const altPart = form.find(p => p.name === 'alt')
  const captionPart = form.find(p => p.name === 'caption')
  const tagsParts = form.filter(p => p.name === 'tags' && p.data?.length)
  const metaInput = {
    alt: altPart?.data ? (Buffer.isBuffer(altPart.data) ? altPart.data.toString('utf-8') : String(altPart.data)) : undefined,
    caption: captionPart?.data ? (Buffer.isBuffer(captionPart.data) ? captionPart.data.toString('utf-8') : String(captionPart.data)) : undefined,
    tags: tagsParts.length ? tagsParts.map(p => Buffer.isBuffer(p.data) ? p.data.toString('utf-8') : String(p.data)) : undefined
  }
  const parsedMeta = safeParse(UploadMetadataSchema, metaInput)
  const meta = parsedMeta.success ? parsedMeta.output : {}

  const mimeType = filePart.type ?? 'application/octet-stream'
  const originalName = filePart.filename ?? 'file'
  const buffer = Buffer.isBuffer(filePart.data) ? filePart.data : Buffer.from(filePart.data as ArrayBuffer)

  const storage = getStorageService()
  const result = await uploadMediaUseCase(
    {
      userId,
      file: { buffer, mimeType, originalName },
      meta: Object.keys(meta).length ? meta : undefined
    },
    mediaAssetRepository,
    storage
  )

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
