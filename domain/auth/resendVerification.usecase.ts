import type { ResendVerificationInput } from './auth.types'
import type { EmailVerificationTokenRepository } from '~~/server/repositories/emailVerificationToken.repo'
import type { UserRepository } from '~~/server/repositories/user.repo'
import { ok, err, type Result } from '../shared/result'
import type { RateLimitError } from '../shared/errors'
import { NotFoundError } from '../shared/errors'
import { generateSecureToken, hashToken } from '~~/server/services/security/token.service'
import { sendVerificationEmail } from '~~/server/services/email/email.service'

type ResendVerificationOutput = { ok: true }

export async function resendVerificationUseCase(
  input: ResendVerificationInput,
  userRepository: UserRepository,
  tokenRepository: EmailVerificationTokenRepository
): Promise<Result<ResendVerificationOutput, NotFoundError | RateLimitError>> {
  const user = await userRepository.findByEmail(input.email)

  if (!user) {
    // MVP: jawny błąd; w v2 można zwracać zawsze ok
    return err(new NotFoundError('User with this email does not exist'))
  }

  if (user.emailVerifiedAt) {
    // Konto już zweryfikowane – w MVP traktujemy jako NotFoundError lub osobny błąd domenowy
    return err(new NotFoundError('Email is already verified'))
  }

  // Placeholder pod rate limiting – do zaimplementowania w v2
  // throw new RateLimitError()

  // Unieważnij poprzednie tokeny
  await tokenRepository.invalidateForUser(user.id)

  const plainToken = generateSecureToken()
  const tokenHash = hashToken(plainToken)

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  await tokenRepository.create({
    userId: user.id,
    tokenHash,
    expiresAt
  })

  const verificationPath = `/auth/verify-email?token=${plainToken}`
  await sendVerificationEmail(user.email, verificationPath)

  return ok({ ok: true })
}
