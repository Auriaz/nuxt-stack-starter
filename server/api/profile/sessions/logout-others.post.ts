/**
 * POST /api/profile/sessions/logout-others
 *
 * Usuwa z bazy wszystkie sesje użytkownika oprócz bieżącej (identyfikowanej przez ciasteczko app_session_id).
 * Wymaga sesji.
 */
import { getCookie } from 'h3'
import { userSessionRepository } from '~~/server/repositories/userSession.repo'
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

  const currentToken = getCookie(event, APP_SESSION_ID_COOKIE)
  if (currentToken) {
    await userSessionRepository.deleteByUserIdExceptToken(userId, currentToken)
  }

  return { data: { ok: true } }
})
