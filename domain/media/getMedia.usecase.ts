import type { MediaAssetRepository } from '~~/server/repositories/mediaAsset.repo'
import type { MediaAssetDTO } from '#shared/types'
import { ok, err, type Result } from '../shared/result'
import { NotFoundError, ForbiddenError } from '../shared/errors'
import { toMediaAssetDTO } from './media.dto'
import type { MediaAssetRecord } from './media.dto'

export async function getMediaUseCase(
  userId: number,
  mediaId: string,
  repo: MediaAssetRepository,
  bypassOwner: boolean
): Promise<Result<MediaAssetDTO, NotFoundError | ForbiddenError>> {
  const record = await repo.findById(mediaId)
  if (!record) {
    return err(new NotFoundError('Media not found'))
  }
  if (!bypassOwner && record.ownerId !== userId) {
    return err(new ForbiddenError('Access denied to this media'))
  }
  return ok(toMediaAssetDTO(record as unknown as MediaAssetRecord))
}
