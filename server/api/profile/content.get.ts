/**
 * GET /api/profile/content
 *
 * Zwraca ostatnią zawartość konta (recent_media, recent_articles, recent_comments) oraz stats.
 * Wymaga sesji.
 */
import { getProfileContentUseCase } from '~~/domain/profile/getProfileContent.usecase'
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

  const content = await getProfileContentUseCase(userId, mediaAssetRepository)
  return { data: content }
})
