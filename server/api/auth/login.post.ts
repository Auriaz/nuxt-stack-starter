import { safeParse } from 'valibot'
import { LoginInputSchema } from '#shared/schemas/auth'
import { loginUseCase } from '~~/domain/auth/login.usecase'
import { userRepository } from '~~/server/repositories/user.repo'
import { roleRepository } from '~~/server/repositories/role.repo'
import { isErr } from '~~/domain/shared/result'
import { useRuntimeConfig } from '#imports'
import { getRequestHeader, setCookie } from 'h3'
import { userSessionRepository } from '~~/server/repositories/userSession.repo'
import { loginEventRepository } from '~~/server/repositories/loginEvent.repo'
import { activityLogRepository } from '~~/server/repositories/activityLog.repo'
import { APP_SESSION_ID_COOKIE } from '~~/server/utils/session-cookie'
// setUserSession jest auto-importowane przez nuxt-auth-utils

/**
 * POST /api/auth/login
 *
 * Endpoint do logowania użytkownika.
 * Ustawia sesję (nuxt-auth-utils), tworzy wpis UserSession, LoginEvent, ActivityLog i ciasteczko app_session_id.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const inputResult = safeParse(LoginInputSchema, body)
  if (!inputResult.success) {
    throw createError({
      status: 400,
      statusText: 'Invalid input',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input validation failed',
          issues: inputResult.issues
        }
      }
    })
  }

  const { remember, ...loginInput } = inputResult.output
  const shouldRemember = !!remember

  const useCaseResult = await loginUseCase(loginInput, userRepository, roleRepository)

  if (isErr(useCaseResult)) {
    throw createError({
      status: useCaseResult.error.statusCode,
      statusText: useCaseResult.error.message,
      data: {
        error: {
          code: useCaseResult.error.code,
          message: useCaseResult.error.message
        }
      }
    })
  }

  const runtimeConfig = useRuntimeConfig()
  const rememberMeDays = runtimeConfig.auth?.rememberMeDays ?? 30
  const maxAge = shouldRemember ? rememberMeDays * 24 * 60 * 60 : undefined

  await setUserSession(
    event,
    { user: useCaseResult.value.user },
    maxAge ? { maxAge } : undefined
  )

  const userId = useCaseResult.value.user.id
  const forwarded = getRequestHeader(event, 'x-forwarded-for')
  const ipAddress = forwarded ? forwarded.split(',')[0].trim() : (event.node.req.socket?.remoteAddress ?? null)
  const userAgent = getRequestHeader(event, 'user-agent') ?? null
  const deviceType = userAgent && /mobile/i.test(userAgent) ? 'Mobile' : 'Desktop'
  const sessionToken = crypto.randomUUID()

  await userSessionRepository.create({
    userId,
    sessionToken,
    ipAddress,
    userAgent,
    location: null,
    deviceType
  })
  await loginEventRepository.create({ userId, ipAddress, location: null })
  await activityLogRepository.create({ userId, action: 'login', description: null })

  setCookie(event, APP_SESSION_ID_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    ...(maxAge ? { maxAge } : {})
  })

  return { data: useCaseResult.value }
})
