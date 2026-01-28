import { safeParse } from 'valibot'
import { getRequestIP, getRequestHeader } from 'h3'
import { ForgotPasswordInputSchema } from '#shared/schemas/auth'
import { requestPasswordResetUseCase } from '~~/domain/auth/forgotPassword.usecase'
import { userRepository } from '~~/server/repositories/user.repo'
import { passwordResetTokenRepository } from '~~/server/repositories/passwordResetToken.repo'

/**
 * POST /api/auth/forgot-password
 *
 * Endpoint do żądania resetu hasła.
 * Generuje token resetu i wysyła email.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Walidacja inputu
  const inputResult = safeParse(ForgotPasswordInputSchema, body)
  if (!inputResult.success) {
    throw createError({
      status: 422,
      statusText: 'Invalid input',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input validation failed',
          status: 422,
          issues: inputResult.issues
        }
      }
    })
  }

  // Pobierz IP i User-Agent (opcjonalnie)
  const requestIp = getRequestIP(event) ?? undefined
  const userAgent = getRequestHeader(event, 'user-agent') ?? undefined

  // Use-case
  await requestPasswordResetUseCase(
    inputResult.output,
    userRepository,
    passwordResetTokenRepository,
    requestIp,
    userAgent
  )

  // Zawsze zwróć success (security)
  return {
    data: { ok: true }
  }
})
