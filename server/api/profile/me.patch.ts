/**
 * PATCH /api/profile/me
 *
 * Aktualizuje profil zalogowanego użytkownika (name, avatarUrl, bio).
 * Wymaga sesji. Walidacja: UpdateProfileInputSchema.
 */
import { safeParse } from 'valibot'
import { UpdateProfileInputSchema } from '#shared/schemas/profile'
import { updateProfileUseCase } from '~~/domain/profile/updateProfile.usecase'
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
  const parsed = safeParse(UpdateProfileInputSchema, body)
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

  const result = await updateProfileUseCase(userId, parsed.output, userRepository)
  if (isErr(result)) {
    throw createError({
      status: result.error.statusCode,
      statusText: result.error.message,
      data: {
        error: {
          code: result.error.code,
          message: result.error.message
        }
      }
    })
  }

  await activityLogRepository.create({ userId, action: 'profile_update', description: null })
  return { data: result.value }
})
