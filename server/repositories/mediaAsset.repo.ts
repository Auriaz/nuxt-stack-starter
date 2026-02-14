import { prisma } from '../services/prisma'
import type { MediaAsset } from '@prisma/client'

export interface MediaAssetCreateInput {
  id: string
  ownerId: number
  type: string
  status: string
  originalName: string
  mimeType: string
  sizeBytes: number
  width?: number | null
  height?: number | null
  durationSeconds?: number | null
  checksum?: string | null
  storageProvider: string
  storagePath: string
  alt?: string | null
  caption?: string | null
  tags: string[]
}

export interface MediaAssetListFilters {
  type?: 'image' | 'video' | 'file'
  search?: string
  tags?: string[]
}

export interface MediaAssetPagination {
  page: number
  perPage: number
}

export interface MediaAssetRepository {
  create(data: MediaAssetCreateInput): Promise<MediaAsset>
  findById(id: string): Promise<MediaAsset | null>
  findByIdForOwner(id: string, ownerId: number): Promise<MediaAsset | null>
  listByOwner(
    ownerId: number,
    filters: MediaAssetListFilters,
    pagination: MediaAssetPagination
  ): Promise<{ items: MediaAsset[], total: number }>
  listAll(
    filters: MediaAssetListFilters,
    pagination: MediaAssetPagination
  ): Promise<{ items: MediaAsset[], total: number }>
  update(
    id: string,
    ownerId: number,
    data: { alt?: string | null, caption?: string | null, tags?: string[] }
  ): Promise<MediaAsset | null>
  softDelete(id: string, ownerId: number): Promise<boolean>
  hardDelete(id: string, ownerId: number): Promise<boolean>
}

export const mediaAssetRepository: MediaAssetRepository = {
  async create(data) {
    return await prisma.mediaAsset.create({
      data: {
        id: data.id,
        ownerId: data.ownerId,
        type: data.type,
        status: data.status,
        originalName: data.originalName,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        width: data.width ?? undefined,
        height: data.height ?? undefined,
        durationSeconds: data.durationSeconds ?? undefined,
        checksum: data.checksum ?? undefined,
        storageProvider: data.storageProvider,
        storagePath: data.storagePath,
        alt: data.alt ?? undefined,
        caption: data.caption ?? undefined,
        tags: data.tags
      }
    })
  },

  async findById(id) {
    return await prisma.mediaAsset.findUnique({
      where: { id, deletedAt: null }
    })
  },

  async findByIdForOwner(id, ownerId) {
    return await prisma.mediaAsset.findFirst({
      where: { id, ownerId, deletedAt: null }
    })
  },

  async listByOwner(ownerId, filters, pagination) {
    const where: {
      ownerId: number
      deletedAt: null
      type?: 'image' | 'video' | 'file'
      originalName?: { contains: string, mode: 'insensitive' }
      tags?: { hasSome: string[] }
    } = {
      ownerId,
      deletedAt: null
    }
    if (filters.type) {
      where.type = filters.type
    }
    if (filters.search?.trim()) {
      where.originalName = { contains: filters.search.trim(), mode: 'insensitive' }
    }
    if (filters.tags?.length) {
      where.tags = { hasSome: filters.tags }
    }
    const skip = (pagination.page - 1) * pagination.perPage
    const [items, total] = await Promise.all([
      prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.perPage
      }),
      prisma.mediaAsset.count({ where })
    ])
    return { items, total }
  },

  async listAll(filters, pagination) {
    const where: {
      deletedAt: null
      type?: 'image' | 'video' | 'file'
      originalName?: { contains: string, mode: 'insensitive' }
      tags?: { hasSome: string[] }
    } = { deletedAt: null }
    if (filters.type) where.type = filters.type
    if (filters.search?.trim()) {
      where.originalName = { contains: filters.search.trim(), mode: 'insensitive' }
    }
    if (filters.tags?.length) where.tags = { hasSome: filters.tags }
    const skip = (pagination.page - 1) * pagination.perPage
    const [items, total] = await Promise.all([
      prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.perPage
      }),
      prisma.mediaAsset.count({ where })
    ])
    return { items, total }
  },

  async update(id, ownerId, data) {
    const updated = await prisma.mediaAsset.updateMany({
      where: { id, ownerId, deletedAt: null },
      data: {
        ...(data.alt !== undefined && { alt: data.alt }),
        ...(data.caption !== undefined && { caption: data.caption }),
        ...(data.tags !== undefined && { tags: data.tags })
      }
    })
    if (updated.count === 0) return null
    return await prisma.mediaAsset.findUniqueOrThrow({ where: { id } })
  },

  async softDelete(id, ownerId) {
    const result = await prisma.mediaAsset.updateMany({
      where: { id, ownerId, deletedAt: null },
      data: { deletedAt: new Date() }
    })
    return result.count > 0
  },

  async hardDelete(id, ownerId) {
    const result = await prisma.mediaAsset.deleteMany({
      where: { id, ownerId }
    })
    return result.count > 0
  }
}
