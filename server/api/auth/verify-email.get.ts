import { safeParse } from 'valibot'
import { VerifyEmailInputSchema } from '#shared/schemas/auth'
import type { VerifyEmailInput } from '#shared/types/auth'
import { verifyEmailUseCase } from '~~/domain/auth/verifyEmail.usecase'
import { emailVerificationTokenRepository } from '~~/server/repositories/emailVerificationToken.repo'
import { userRepository } from '~~/server/repositories/user.repo'
import { isErr } from '~~/domain/shared/result'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const parseResult = safeParse(VerifyEmailInputSchema, { token: query.token })

  if (!parseResult.success) {
    throw createError({
      status: 422,
      statusText: 'Invalid input',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input validation failed',
          status: 422,
          issues: parseResult.issues
        }
      }
    })
  }

  const input = parseResult.output as VerifyEmailInput

  const useCaseResult = await verifyEmailUseCase(input, emailVerificationTokenRepository, userRepository)

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

  return {
    data: {
      verified: true
    }
  }
})
