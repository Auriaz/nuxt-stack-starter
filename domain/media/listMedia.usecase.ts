import type { MediaAssetRepository } from '~~/server/repositories/mediaAsset.repo'
import type { MediaListQuery, MediaListResponse } from '#shared/types'
import { toMediaAssetDTO } from './media.dto'
import type { MediaAssetRecord } from './media.dto'

export interface ListMediaInput {
  userId: number
  query: MediaListQuery
  bypassOwner?: boolean
}

export async function listMediaUseCase(
  input: ListMediaInput,
  repo: MediaAssetRepository
): Promise<MediaListResponse> {
  const { userId, query, bypassOwner } = input
  const page = Math.max(1, query.page ?? 1)
  const perPage = Math.min(100, Math.max(1, query.perPage ?? 24))
  const filters = {
    type: query.type,
    search: query.search,
    tags: query.tags
  }
  const pagination = { page, perPage }

  const { items, total } = bypassOwner
    ? await repo.listAll(filters, pagination)
    : await repo.listByOwner(userId, filters, pagination)

  return {
    items: items.map((r: MediaAssetRecord) => toMediaAssetDTO(r)),
    pagination: { page, perPage, total }
  }
}
