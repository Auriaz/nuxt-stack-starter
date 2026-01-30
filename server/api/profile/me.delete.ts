/**
 * DELETE /api/profile/me
 *
 * Usuwa konto zalogowanego użytkownika (nieodwracalne). Wymaga hasła i wpisania "DELETE".
 * Najpierw usuwa pliki użytkownika ze storage, potem rekord użytkownika (cascade usuwa MediaAsset, OAuth, itd.).
 * Wymaga sesji. Po usunięciu konta czyści sesję (nuxt-auth-utils) i cookie app_session_id.
 */
import { deleteCookie } from 'h3'
import { safeParse } from 'valibot'
import { DeleteAccountInputSchema } from '#shared/schemas/profile'
import type { SessionUser } from '~~/domain/auth/auth.types'
import { deleteAccountUseCase } from '~~/domain/account/deleteAccount.usecase'
import { mediaAssetRepository } from '~~/server/repositories/mediaAsset.repo'
import { userRepository } from '~~/server/repositories/user.repo'
import { getStorageService } from '~~/server/services/storage/storage.service'
import { APP_SESSION_ID_COOKIE } from '~~/server/utils/session-cookie'
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
  const parsed = safeParse(DeleteAccountInputSchema, body)
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

  const userId = user.id
  const userRecord = await userRepository.findById(userId)
  if (!userRecord) {
    throw createError({
      status: 404,
      statusText: 'Not Found',
      data: {
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      }
    })
  }

  const storedPassword = (userRecord as { password?: string | null }).password
  if (!storedPassword || storedPassword === '') {
    throw createError({
      status: 401,
      statusText: 'Unauthorized',
      data: {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Konto zalogowane przez serwis zewnętrzny nie ma lokalnego hasła. Nie można usunąć konta w ten sposób.'
        }
      }
    })
  }

  const isValid = await verifyPassword(storedPassword, parsed.output.password)
  if (!isValid) {
    throw createError({
      status: 401,
      statusText: 'Unauthorized',
      data: {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Nieprawidłowe hasło'
        }
      }
    })
  }

  const { items: mediaItems } = await mediaAssetRepository.listByOwner(
    userId,
    {},
    { page: 1, perPage: 10000 }
  )
  const storage = getStorageService()
  for (const asset of mediaItems) {
    try {
      await storage.delete(asset.storagePath)
    } catch {
      // Ignoruj błąd usuwania pliku ze storage – konto i tak zostanie usunięte
    }
  }

  const result = await deleteAccountUseCase(userId, userRepository)
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

  // Wyczyść sesję po stronie serwera (cookie), żeby po odświeżeniu użytkownik nie był już zalogowany
  await clearUserSession(event)
  deleteCookie(event, APP_SESSION_ID_COOKIE, { path: '/' })

  return { data: { ok: true } }
})
