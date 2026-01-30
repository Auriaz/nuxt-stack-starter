/**
 * POST /api/profile/me/deactivate
 *
 * Tymczasowa dezaktywacja konta zalogowanego użytkownika (wymaga hasła).
 * Ustawia deactivatedAt; po wylogowaniu konto można reaktywować przez ponowne logowanie.
 * Wymaga sesji.
 */
import { safeParse } from 'valibot'
import { ConfirmPasswordSchema } from '#shared/schemas/profile'
import type { SessionUser } from '~~/domain/auth/auth.types'
import { deactivateAccountUseCase } from '~~/domain/profile/deactivateAccount.usecase'
import { userRepository } from '~~/server/repositories/user.repo'
import { isErr } from '~~/domain/shared/result'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = session.user as SessionUser | undefined
  if (!user?.id) {
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

  const body = await readBody(event)
  const parsed = safeParse(ConfirmPasswordSchema, body)
  if (!parsed.success) {
    throw createError({
      status: 422,
      statusText: 'Validation Error',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          issues: parsed.issues
        }
      }
    })
  }

  const result = await deactivateAccountUseCase(user.id, parsed.output.password, userRepository)

  if (isErr(result)) {
    throw createError({
      status: result.error.statusCode,
      statusText: result.error.message,
      data: {
        error: {
          code: result.error.code,
          message: result.error.message,
          status: result.error.statusCode
        }
      }
    })
  }

  return { data: result.value }
})
