import { describe, expect, it } from 'vitest'
import { listMediaUseCase } from '../../../domain/media/listMedia.usecase'
import type { MediaAssetRepository } from '../../../server/repositories/mediaAsset.repo'

describe('listMediaUseCase', () => {
  it('returns empty list when repo returns no items', async () => {
    const repo: MediaAssetRepository = {
      create: async () => ({} as never),
      findById: async () => null,
      findByIdForOwner: async () => null,
      listByOwner: async () => ({ items: [], total: 0 }),
      listAll: async () => ({ items: [], total: 0 }),
      update: async () => null,
      softDelete: async () => false
    }
    const result = await listMediaUseCase(
      { userId: 1, query: { page: 1, perPage: 24 }, bypassOwner: false },
      repo
    )
    expect(result.items).toEqual([])
    expect(result.pagination).toEqual({ page: 1, perPage: 24, total: 0 })
  })

  it('uses listAll when bypassOwner is true', async () => {
    let calledListAll = false
    const repo: MediaAssetRepository = {
      create: async () => ({} as never),
      findById: async () => null,
      findByIdForOwner: async () => null,
      listByOwner: async () => ({ items: [], total: 0 }),
      listAll: async () => {
        calledListAll = true
        return { items: [], total: 0 }
      },
      update: async () => null,
      softDelete: async () => false
    }
    await listMediaUseCase(
      { userId: 1, query: { page: 1, perPage: 24 }, bypassOwner: true },
      repo
    )
    expect(calledListAll).toBe(true)
  })
})
