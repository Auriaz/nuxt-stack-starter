import type { PermissionKey } from '~~/shared/permissions'
import type { SessionUser } from '~~/domain/auth/auth.types'
import type { H3Event } from 'h3'

export async function requirePermission(event: H3Event, permission: PermissionKey): Promise<SessionUser> {
  const session = await requireUserSession(event)
  const user = session.user as SessionUser | undefined

  if (!user || !Array.isArray(user.permissions) || !user.permissions.includes(permission)) {
    throw createError({
      status: 403,
      statusText: 'Forbidden',
      data: {
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
          status: 403
        }
      }
    })
  }

  return user
}

export async function requireRole(event: H3Event, role: string): Promise<SessionUser> {
  const session = await requireUserSession(event)
  const user = session.user as SessionUser | undefined

  if (!user || user.role !== role) {
    throw createError({
      status: 403,
      statusText: 'Forbidden',
      data: {
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient role',
          status: 403
        }
      }
    })
  }

  return user
}
