import { safeParse } from 'valibot'
import { RegisterInputSchema } from '#shared/schemas/auth'
import { registerUseCase } from '~~/domain/auth/register.usecase'
import { userRepository } from '~~/server/repositories/user.repo'
import { emailVerificationTokenRepository } from '~~/server/repositories/emailVerificationToken.repo'
import { isErr } from '~~/domain/shared/result'

/**
 * POST /api/auth/register
 *
 * Endpoint do rejestracji użytkownika.
 * Waliduje dane, wywołuje use-case rejestracji oraz wysyła mail weryfikacyjny.
 * Sesja nie jest ustawiana – użytkownik musi zweryfikować e-mail.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Walidacja inputu
  const inputResult = safeParse(RegisterInputSchema, body)
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

  // Złożona logika → use-case
  const useCaseResult = await registerUseCase(inputResult.output, userRepository, emailVerificationTokenRepository)

  // Obsługa błędów z Result pattern
  if (isErr(useCaseResult)) {
    const baseError = useCaseResult.error
    const code = baseError.code === 'DUPLICATE_ERROR' ? 'EMAIL_ALREADY_EXISTS' : baseError.code

    throw createError({
      status: baseError.statusCode,
      statusText: baseError.message,
      data: {
        error: {
          code,
          message: baseError.message,
          status: baseError.statusCode
        }
      }
    })
  }

  return {
    data: {
      ok: true
    }
  }
})
