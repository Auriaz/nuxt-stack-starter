/**
 * GET /api/profile/me
 *
 * Zwraca profil zalogowanego użytkownika.
 * Wymaga sesji (401 bez sesji).
 * Gdy użytkownik nie istnieje w bazie (np. konto usunięte) – czyści sesję i zwraca 401.
 */
import { deleteCookie } from 'h3'
import { getProfileUseCase } from '~~/domain/profile/getProfile.usecase'
import { userRepository } from '~~/server/repositories/user.repo'
import { APP_SESSION_ID_COOKIE } from '~~/server/utils/session-cookie'

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

  const profile = await getProfileUseCase(userId, userRepository)
  if (!profile) {
    // Użytkownik usunięty z bazy – wyczyść sesję, żeby klient nie był „zalogowany” z nieistniejącym kontem
    await clearUserSession(event)
    deleteCookie(event, APP_SESSION_ID_COOKIE, { path: '/' })
    throw createError({
      status: 401,
      statusText: 'Unauthorized',
      data: {
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found'
        }
      }
    })
  }

  return { data: profile }
})
