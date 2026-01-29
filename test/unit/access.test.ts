import { describe, expect, it } from 'vitest'
import { hasPermission, hasRole } from '../../domain/access/access.service'
import { PERMISSIONS } from '../../shared/permissions'

describe('Access service', () => {
  it('should validate permission checks', () => {
    const user = {
      id: 1,
      role: 'admin',
      permissions: [PERMISSIONS.ADMIN_ACCESS]
    }

    expect(hasPermission(user, PERMISSIONS.ADMIN_ACCESS)).toBe(true)
    expect(hasPermission(user, PERMISSIONS.USERS_READ)).toBe(false)
    expect(hasPermission(null, PERMISSIONS.ADMIN_ACCESS)).toBe(false)
  })

  it('should validate role checks', () => {
    const user = {
      id: 2,
      role: 'editor',
      permissions: []
    }

    expect(hasRole(user, 'editor')).toBe(true)
    expect(hasRole(user, 'admin')).toBe(false)
    expect(hasRole(null, 'admin')).toBe(false)
  })
})
