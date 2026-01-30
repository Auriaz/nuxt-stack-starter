/**
 * GET /api/profile/sessions
 *
 * Zwraca listę sesji użytkownika z bazy (UserSession).
 * Jeśli brak ciasteczka app_session_id, tworzy nową sesję w DB i ustawia ciasteczko.
 */
import { getRequestHeader, getCookie, setCookie } from 'h3'
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

  let sessionToken = getCookie(event, APP_SESSION_ID_COOKIE)
  const forwarded = getRequestHeader(event, 'x-forwarded-for')
  const ipAddress = forwarded ? forwarded.split(',')[0].trim() : (event.node.req.socket?.remoteAddress ?? 'Unknown')
  const userAgent = getRequestHeader(event, 'user-agent') ?? 'Unknown'
  const deviceType = /mobile/i.test(userAgent) ? 'Mobile' : 'Desktop'

  if (!sessionToken) {
    sessionToken = crypto.randomUUID()
    await userSessionRepository.create({
      userId,
      sessionToken,
      ipAddress,
      userAgent,
      location: null,
      deviceType
    })
    setCookie(event, APP_SESSION_ID_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    })
  } else {
    const current = await userSessionRepository.findBySessionToken(sessionToken)
    if (current && current.userId === userId) {
      await userSessionRepository.updateLastActivity(current.id)
    }
  }

  const rows = await userSessionRepository.findByUserId(userId)
  const sessions = rows.map(row => ({
    id: row.id,
    last_activity: row.lastActivityAt.toISOString(),
    ip_address: row.ipAddress ?? 'Unknown',
    location: row.location ?? 'Unknown',
    device_type: row.deviceType ?? 'Desktop'
  }))

  return { data: sessions }
})
