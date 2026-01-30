/**
 * PATCH /api/profile/password
 *
 * Zmiana hasła zalogowanego użytkownika (obecne hasło + nowe hasło).
 * Wymaga sesji. Walidacja: UpdatePasswordInputSchema.
 */
import { safeParse } from 'valibot'
import { UpdatePasswordInputSchema } from '#shared/schemas/profile'
import { changePasswordUseCase } from '~~/domain/profile/changePassword.usecase'
import { userRepository } from '~~/server/repositories/user.repo'
import { activityLogRepository } from '~~/server/repositories/activityLog.repo'
import { isErr } from '~~/domain/shared/result'

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

  const body = await readBody(event)
  const parsed = safeParse(UpdatePasswordInputSchema, body)
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

  const { currentPassword, newPassword } = parsed.output

  const result = await changePasswordUseCase(
    userId,
    currentPassword,
    newPassword,
    userRepository
  )

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

  await activityLogRepository.create({ userId, action: 'password_change', description: null })
  return { data: result.value }
})
