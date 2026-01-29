import type { OAuthProfile, SessionUser } from './auth.types'
import type { UserRepository } from '~~/server/repositories/user.repo'
import type { OAuthAccountRepository } from '~~/server/repositories/oauthAccount.repo'
import type { RoleRepository } from '~~/server/repositories/role.repo'
import type { PermissionKey } from '~~/shared/permissions'

/**
 * Use-case: utworzenie lub odnalezienie użytkownika na podstawie profilu OAuth.
 *
 * - Jeśli istnieje OAuthAccount dla (provider, providerAccountId) → zwraca powiązanego User.
 * - Jeśli nie istnieje → tworzy User (bazując na email/name) oraz OAuthAccount.
 * - Zwraca minimalny SessionUser, który trafi do sesji (nuxt-auth-utils).
 */
export async function upsertOAuthUserUseCase(
  profile: OAuthProfile,
  userRepository: UserRepository,
  oauthAccountRepository: OAuthAccountRepository,
  roleRepository: RoleRepository
): Promise<SessionUser> {
  // 1. Sprawdź, czy istnieje already linked OAuthAccount
  const existingAccount = await oauthAccountRepository.findByProviderAccount(
    profile.provider,
    profile.providerAccountId
  )

  if (existingAccount) {
    const user = await userRepository.findByIdWithRolePermissions(existingAccount.userId)
    if (!user) {
      throw new Error('User not found for OAuth account')
    }
    const roleName = user.roleRef?.name ?? user.role
    let permissions: PermissionKey[] = []
    if (user.roleRef?.permissions) {
      permissions = user.roleRef.permissions.map(rolePermission => rolePermission.permission.key as PermissionKey)
    } else if (roleName) {
      const roleWithPermissions = await roleRepository.findByNameWithPermissions(roleName)
      permissions = roleWithPermissions?.permissions.map(rolePermission => rolePermission.permission.key as PermissionKey) ?? []
    }

    return {
      id: user.id,
      role: roleName,
      permissions,
      name: user.name ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined
    }
  }

  // 2. (Opcjonalnie v2) – próbuj dopasować istniejącego użytkownika po emailu
  let user = null
  if (profile.email && profile.emailVerified) {
    user = await userRepository.findByEmail(profile.email)
  }

  // 3. Jeśli nie znaleziono użytkownika, utwórz nowego z danymi z providera
  if (!user) {
    user = await userRepository.createFromOAuth({
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      // W v2 można wprowadzić logikę generowania username na podstawie providera
      username: profile.email?.split('@')[0]
    })
  }

  // 4. Utwórz OAuthAccount
  await oauthAccountRepository.create({
    userId: user.id,
    provider: profile.provider,
    providerAccountId: profile.providerAccountId
  })

  // 5. Zwróć minimalny SessionUser do zapisania w sesji
  const userWithRole = await userRepository.findByIdWithRolePermissions(user.id)
  const roleName = userWithRole?.roleRef?.name ?? user.role
  const permissions = userWithRole?.roleRef?.permissions.map(rolePermission => rolePermission.permission.key as PermissionKey) ?? []

  return {
    id: user.id,
    role: roleName,
    permissions,
    name: user.name ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined
  }
}
