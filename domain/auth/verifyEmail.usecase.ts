import type { VerifyEmailInput, VerifyEmailOutput } from './auth.types'
import type { EmailVerificationTokenRepository } from '~~/server/repositories/emailVerificationToken.repo'
import type { UserRepository } from '~~/server/repositories/user.repo'
import { ok, err, type Result } from '../shared/result'
import {
  TokenInvalidError,
  TokenExpiredError,
  TokenAlreadyUsedError
} from '../shared/errors'
import { hashToken } from '~~/server/services/security/token.service'

export async function verifyEmailUseCase(
  input: VerifyEmailInput,
  tokenRepository: EmailVerificationTokenRepository,
  userRepository: UserRepository
): Promise<Result<VerifyEmailOutput, TokenInvalidError | TokenExpiredError | TokenAlreadyUsedError>> {
  const tokenHash = hashToken(input.token)

  const record = await tokenRepository.findByTokenHash(tokenHash)

  if (!record) {
    return err(new TokenInvalidError())
  }

  const now = new Date()

  if (record.usedAt) {
    return err(new TokenAlreadyUsedError())
  }

  if (record.expiresAt <= now) {
    return err(new TokenExpiredError())
  }

  // Zaktualizuj użytkownika i oznacz token jako użyty
  await userRepository.updateEmailVerifiedAt(record.userId, now)
  await tokenRepository.markUsed(record.id, now)

  return ok({
    verified: true,
    user: {
      id: record.user.id,
      username: record.user.username,
      email: record.user.email
    }
  })
}
