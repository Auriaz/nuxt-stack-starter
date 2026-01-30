/**
 * Use-case: statystyki konta użytkownika (liczba artykułów, mediów, komentarzy).
 * MVP: tylko total_media z MediaAsset; articles i comments = 0.
 */
import type { MediaAssetRepository } from '~~/server/repositories/mediaAsset.repo'

export interface ProfileStatsDTO {
  total_articles: number
  total_media: number
  total_comments: number
}

export async function getProfileStatsUseCase(
  userId: number,
  mediaAssetRepository: MediaAssetRepository
): Promise<ProfileStatsDTO> {
  const { total } = await mediaAssetRepository.listByOwner(
    userId,
    {},
    { page: 1, perPage: 1 }
  )
  return {
    total_articles: 0,
    total_media: total,
    total_comments: 0
  }
}
