import { safeParse } from 'valibot'
import { ResendVerificationInputSchema } from '#shared/schemas/auth'
import type { ResendVerificationInput } from '#shared/types/auth'
import { resendVerificationUseCase } from '~~/domain/auth/resendVerification.usecase'
import { userRepository } from '~~/server/repositories/user.repo'
import { emailVerificationTokenRepository } from '~~/server/repositories/emailVerificationToken.repo'
import { isErr } from '~~/domain/shared/result'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const parseResult = safeParse(ResendVerificationInputSchema, body)

  if (!parseResult.success) {
    throw createError({
      status: 422,
      statusText: 'Invalid input',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          status: 422,
          issues: parseResult.issues
        }
      }
    })
  }

  const input = parseResult.output as ResendVerificationInput

  const useCaseResult = await resendVerificationUseCase(input, userRepository, emailVerificationTokenRepository)

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
    data: useCaseResult.value
  }
}
)
