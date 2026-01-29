import { describe, expect, it } from 'vitest'
import { getCurrentUserUseCase } from '../../../domain/auth/getCurrentUser.usecase'
import type { SessionUser } from '../../../domain/auth/auth.types'
import type { UserRepository } from '../../../server/repositories/user.repo'

describe('getCurrentUserUseCase', () => {
  const repositoryStub = {} as UserRepository

  it('returns null when session user missing', async () => {
    const result = await getCurrentUserUseCase(null, repositoryStub)
    expect(result).toBeNull()
  })

  it('returns session user as-is', async () => {
    const sessionUser: SessionUser = {
      id: 1,
      role: 'user',
      permissions: []
    }

    const result = await getCurrentUserUseCase(sessionUser, repositoryStub)
    expect(result).toEqual(sessionUser)
  })
})
