import { safeParse } from 'valibot'
import { LoginInputSchema } from '#shared/schemas/auth'
import { loginUseCase } from '~~/domain/auth/login.usecase'
import { userRepository } from '~~/server/repositories/user.repo'
import { isErr } from '~~/domain/shared/result'
// setUserSession jest auto-importowane przez nuxt-auth-utils

/**
 * POST /api/auth/login
 *
 * Endpoint do logowania użytkownika.
 * Waliduje dane, wywołuje use-case i ustawia sesję przez nuxt-auth-utils.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Walidacja inputu
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

  // Złożona logika → use-case
  const useCaseResult = await loginUseCase(inputResult.output, userRepository)

  // Obsługa błędów z Result pattern
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

  // Ustaw sesję użytkownika (nuxt-auth-utils)
  await setUserSession(event, {
    user: useCaseResult.value.user
  })

  return { data: useCaseResult.value }
})
