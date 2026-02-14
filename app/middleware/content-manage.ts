import { PERMISSIONS } from '#shared/permissions'

export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn, can, hasRole } = useAccess()

  if (!isLoggedIn.value) {
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  const allowed = can(PERMISSIONS.CONTENT_MANAGE)
    || can(PERMISSIONS.ADMIN_ACCESS)
    || hasRole('admin')

  if (!allowed) {
    return navigateTo(`/forbidden?permission=${encodeURIComponent(PERMISSIONS.CONTENT_MANAGE)}`)
  }
})
