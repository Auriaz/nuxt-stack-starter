import type { PermissionKey } from '#shared/permissions'

export default defineNuxtRouteMiddleware((to) => {
  const requiredPermission = to.meta.permission as PermissionKey | undefined
  if (!requiredPermission) {
    return
  }

  const { can, isLoggedIn } = useAccess()

  if (!isLoggedIn.value) {
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  if (!can(requiredPermission)) {
    return navigateTo(`/forbidden?permission=${encodeURIComponent(String(requiredPermission))}`)
  }
})
