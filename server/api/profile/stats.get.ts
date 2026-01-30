/**
 * GET /api/profile/stats
 *
 * Zwraca statystyki konta (liczba artykułów, mediów, komentarzy).
 * Wymaga sesji.
 */
import { getProfileStatsUseCase } from '~~/domain/profile/getProfileStats.usecase'
import { mediaAssetRepository } from '~~/server/repositories/mediaAsset.repo'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: number }).id
  if (!userId) {
    throw createError({
      status: 401,
      statusText: 'Unauthorized',
      data: {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Session has no user id'
        }
      }
    })
  }

  const stats = await getProfileStatsUseCase(userId, mediaAssetRepository)
  return { data: stats }
})
