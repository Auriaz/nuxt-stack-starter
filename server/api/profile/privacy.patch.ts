/**
 * PATCH /api/profile/privacy
 *
 * Aktualizuje ustawienia prywatności (showEmail).
 * Wymaga sesji. Walidacja: UpdatePrivacyInputSchema.
 */
import { safeParse } from 'valibot'
import { UpdatePrivacyInputSchema } from '#shared/schemas/profile'
import { updatePrivacyUseCase } from '~~/domain/profile/updatePrivacy.usecase'
import { userRepository } from '~~/server/repositories/user.repo'

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
  const parsed = safeParse(UpdatePrivacyInputSchema, body)
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

  await updatePrivacyUseCase(userId, parsed.output, userRepository)
  return { data: { ok: true } }
})
