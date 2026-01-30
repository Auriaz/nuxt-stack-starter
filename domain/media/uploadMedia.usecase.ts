import { randomUUID } from 'node:crypto'
import type { MediaAssetRepository } from '~~/server/repositories/mediaAsset.repo'
import type { MediaAssetDTO } from '#shared/types'
import { ok, err, type Result } from '../shared/result'
import { DomainError } from '../shared/errors'
import type { MediaStorage } from './media.types'
import {
  isAllowedMime,
  getMaxSizeForMime,
  getExtensionForMime,
  getMediaTypeFromMime
} from './media.constants'
import { toMediaAssetDTO } from './media.dto'

export interface UploadMediaInput {
  userId: number
  file: {
    buffer: Buffer
    mimeType: string
    originalName: string
  }
  meta?: {
    alt?: string
    caption?: string
    tags?: string[]
  }
}

export async function uploadMediaUseCase(
  input: UploadMediaInput,
  repo: MediaAssetRepository,
  storage: MediaStorage
): Promise<Result<MediaAssetDTO, DomainError>> {
  const { userId, file, meta } = input

  if (!isAllowedMime(file.mimeType)) {
    return err(new DomainError('FILE_TYPE_NOT_ALLOWED', 'File type not allowed', 400))
  }

  const maxSize = getMaxSizeForMime(file.mimeType)
  if (file.buffer.length > maxSize) {
    return err(new DomainError('PAYLOAD_TOO_LARGE', 'File size exceeds limit', 413))
  }

  const id = randomUUID()
  const ext = getExtensionForMime(file.mimeType)
  const relativePath = `${userId}/${id}/original.${ext}`
  await storage.save(relativePath, file.buffer, file.mimeType)

  const type = getMediaTypeFromMime(file.mimeType)
  const record = await repo.create({
    id,
    ownerId: userId,
    type,
    status: 'ready',
    originalName: file.originalName,
    mimeType: file.mimeType,
    sizeBytes: file.buffer.length,
    storageProvider: 'local',
    storagePath: relativePath,
    alt: meta?.alt ?? null,
    caption: meta?.caption ?? null,
    tags: meta?.tags ?? []
  })

  return ok(toMediaAssetDTO(record as unknown as import('./media.dto').MediaAssetRecord))
}
