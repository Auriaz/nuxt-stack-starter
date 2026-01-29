import type { SessionUser } from '../auth/auth.types'
import type { PermissionKey } from './permissions'

export function hasPermission(user: SessionUser | null | undefined, permission: PermissionKey): boolean {
  if (!user) {
    return false
  }
  return Array.isArray(user.permissions) && user.permissions.includes(permission)
}

export function hasRole(user: SessionUser | null | undefined, role: string): boolean {
  if (!user) {
    return false
  }
  return user.role === role
}
