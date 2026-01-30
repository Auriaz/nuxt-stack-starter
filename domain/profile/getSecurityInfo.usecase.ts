/**
 * Use-case: pobranie informacji bezpieczeństwa konta (do widoku Security).
 */
import type { UserRepository } from '~~/server/repositories/user.repo'

const PASSWORD_RECOMMEND_CHANGE_DAYS = 90

export interface SecurityInfoDTO {
  email_verified: boolean
  last_password_change: string | null
  password_strength: 'strong' | 'consider_changing' | 'never_changed'
  password_changed_days_ago: number | null
}

export async function getSecurityInfoUseCase(
  userId: number,
  userRepository: UserRepository
): Promise<SecurityInfoDTO | null> {
  const user = await userRepository.findById(userId)
  if (!user) return null

  const userWithDates = user as { emailVerifiedAt?: Date | null, passwordChangedAt?: Date | null }
  const emailVerifiedAt = userWithDates.emailVerifiedAt
  const passwordChangedAt = userWithDates.passwordChangedAt

  let password_strength: SecurityInfoDTO['password_strength'] = 'never_changed'
  let password_changed_days_ago: number | null = null

  if (passwordChangedAt) {
    const now = new Date()
    const diffMs = now.getTime() - passwordChangedAt.getTime()
    password_changed_days_ago = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (password_changed_days_ago < PASSWORD_RECOMMEND_CHANGE_DAYS) {
      password_strength = 'strong'
    } else {
      password_strength = 'consider_changing'
    }
  }

  return {
    email_verified: !!emailVerifiedAt,
    last_password_change: passwordChangedAt ? passwordChangedAt.toISOString() : null,
    password_strength,
    password_changed_days_ago
  }
}
