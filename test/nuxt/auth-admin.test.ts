import { beforeAll, describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'

describe('Auth & Admin API', () => {
  beforeAll(async () => {
    await setup()
  })

  it('returns null user when unauthenticated', async () => {
    const response = await $fetch('/api/auth/me')
    expect(response).toEqual({ data: { user: null } })
  })

  it('rejects admin access without session', async () => {
    try {
      await $fetch('/api/admin/users')
      throw new Error('Expected unauthorized')
    } catch (error: unknown) {
      const err = error as {
        statusCode?: number
        status?: number
        response?: { status?: number }
      }
      const status = err.statusCode ?? err.status ?? err.response?.status
      expect([401, 403]).toContain(status)
    }
  })
})
