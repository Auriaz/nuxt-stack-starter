import type { PermissionKey } from '#shared/permissions'

export default defineNuxtRouteMiddleware((to) => {
  const requiredPermission = to.meta.permission as PermissionKey | undefined
  if (!requiredPermission) {
    return
  }

  const { can, isLoggedIn } = useAccess()

  if (!isLoggedIn.value || !can(requiredPermission)) {
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
