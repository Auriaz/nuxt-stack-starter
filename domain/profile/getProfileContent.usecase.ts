/**
 * Use-case: ostatnia zawartość konta (recent_media, recent_articles, recent_comments + stats).
 * MVP: tylko recent_media z MediaAsset i stats.
 */
import type { MediaAssetDTO } from '#shared/types'
import type { MediaAssetRepository } from '~~/server/repositories/mediaAsset.repo'
import type { ProfileStatsDTO } from './getProfileStats.usecase'
import { getProfileStatsUseCase } from './getProfileStats.usecase'
import { toMediaAssetDTO } from '~~/domain/media/media.dto'
import type { MediaAssetRecord } from '~~/domain/media/media.dto'

export interface ProfileContentDTO {
  recent_articles: unknown[]
  recent_media: MediaAssetDTO[]
  recent_comments: unknown[]
  stats: ProfileStatsDTO
}

export async function getProfileContentUseCase(
  userId: number,
  mediaAssetRepository: MediaAssetRepository
): Promise<ProfileContentDTO> {
  const stats = await getProfileStatsUseCase(userId, mediaAssetRepository)
  const { items } = await mediaAssetRepository.listByOwner(
    userId,
    {},
    { page: 1, perPage: 10 }
  )
  const recent_media = items.map((r: unknown) => toMediaAssetDTO(r as MediaAssetRecord))
  return {
    recent_articles: [],
    recent_media,
    recent_comments: [],
    stats
  }
}
