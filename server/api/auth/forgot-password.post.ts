import { safeParse } from 'valibot'
import { ForgotPasswordInputSchema } from '#shared/schemas/auth'
import { forgotPasswordUseCase } from '~~/domain/auth/forgotPassword.usecase'
import { userRepository } from '~~/server/repositories/user.repo'
import { isErr } from '~~/domain/shared/result'

/**
 * POST /api/auth/forgot-password
 *
 * Endpoint do żądania resetu hasła.
 * Generuje token resetu i wysyła email (gdy email service będzie dodany).
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Walidacja inputu
  const inputResult = safeParse(ForgotPasswordInputSchema, body)
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

  // Use-case
  const useCaseResult = await forgotPasswordUseCase(inputResult.output, userRepository)

  // Obsługa błędów (forgotPasswordUseCase zawsze zwraca success dla bezpieczeństwa)
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

  return { data: useCaseResult.value }
})
