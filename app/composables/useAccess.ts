import type { PermissionKey } from '#shared/permissions'

export function useAccess() {
  const { user, isLoggedIn } = useAuth()

  const hasRole = (role: string) => {
    return !!user.value && user.value.role === role
  }

  const can = (permission: PermissionKey) => {
    return !!user.value && Array.isArray(user.value.permissions) && user.value.permissions.includes(permission)
  }

  return {
    user,
    isLoggedIn,
    hasRole,
    can
  }
}
