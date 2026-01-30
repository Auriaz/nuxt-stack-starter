import type { MediaAssetRepository } from '~~/server/repositories/mediaAsset.repo'
import { ok, err, type Result } from '../shared/result'
import { NotFoundError, ForbiddenError } from '../shared/errors'

export async function deleteMediaUseCase(
  userId: number,
  mediaId: string,
  repo: MediaAssetRepository,
  bypassOwner: boolean
): Promise<Result<{ ok: true }, NotFoundError | ForbiddenError>> {
  const existing = bypassOwner
    ? await repo.findById(mediaId)
    : await repo.findByIdForOwner(mediaId, userId)
  if (!existing) {
    const anyRecord = await repo.findById(mediaId)
    if (!anyRecord) return err(new NotFoundError('Media not found'))
    if (!bypassOwner) return err(new ForbiddenError('Access denied to this media'))
    return err(new NotFoundError('Media not found'))
  }
  const storagePath = existing.storagePath
  const deleted = await repo.hardDelete(mediaId, existing.ownerId)
  if (!deleted) return err(new NotFoundError('Media not found'))
  return ok({ ok: true, storagePath })
}
