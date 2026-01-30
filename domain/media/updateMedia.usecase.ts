import type { MediaAssetRepository } from '~~/server/repositories/mediaAsset.repo'
import type { MediaAssetDTO, UpdateMediaMetadata } from '#shared/types'
import { ok, err, type Result } from '../shared/result'
import { NotFoundError, ForbiddenError } from '../shared/errors'
import { toMediaAssetDTO } from './media.dto'
import type { MediaAssetRecord } from './media.dto'

export async function updateMediaUseCase(
  userId: number,
  mediaId: string,
  payload: UpdateMediaMetadata,
  repo: MediaAssetRepository,
  bypassOwner: boolean
): Promise<Result<MediaAssetDTO, NotFoundError | ForbiddenError>> {
  const existing = bypassOwner
    ? await repo.findById(mediaId)
    : await repo.findByIdForOwner(mediaId, userId)
  if (!existing) {
    const anyRecord = await repo.findById(mediaId)
    if (!anyRecord) return err(new NotFoundError('Media not found'))
    if (!bypassOwner) return err(new ForbiddenError('Access denied to this media'))
    return err(new NotFoundError('Media not found'))
  }
  const updated = await repo.update(mediaId, existing.ownerId, {
    alt: payload.alt,
    caption: payload.caption,
    tags: payload.tags
  })
  if (!updated) return err(new NotFoundError('Media not found'))
  return ok(toMediaAssetDTO(updated as unknown as MediaAssetRecord))
}
