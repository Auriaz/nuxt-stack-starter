import { safeParse } from 'valibot'
import { ResetPasswordInputSchema } from '#shared/schemas/auth'
import { resetPasswordUseCase } from '~~/domain/auth/resetPassword.usecase'
import { userRepository } from '~~/server/repositories/user.repo'
import { passwordResetTokenRepository } from '~~/server/repositories/passwordResetToken.repo'
import { isErr } from '~~/domain/shared/result'
// setUserSession jest auto-importowane przez nuxt-auth-utils

/**
 * POST /api/auth/reset-password
 *
 * Endpoint do resetu hasła.
 * Weryfikuje token, aktualizuje hasło i ustawia sesję użytkownika.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Walidacja inputu
  const inputResult = safeParse(ResetPasswordInputSchema, body)
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

  // Use-case
  const useCaseResult = await resetPasswordUseCase(
    inputResult.output,
    passwordResetTokenRepository,
    userRepository
  )

  // Obsługa błędów z Result pattern
  if (isErr(useCaseResult)) {
    throw createError({
      status: useCaseResult.error.statusCode,
      statusText: useCaseResult.error.message,
      data: {
        error: {
          code: useCaseResult.error.code,
          message: useCaseResult.error.message,
          status: useCaseResult.error.statusCode
        }
      }
    })
  }

  // Ustaw sesję użytkownika (automatyczne logowanie po resecie)
  await setUserSession(event, {
    user: useCaseResult.value.user
  })

  return {
    data: useCaseResult.value
  }
})
