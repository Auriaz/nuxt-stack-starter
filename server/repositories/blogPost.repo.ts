import { prisma } from '../services/prisma'
import type { BlogPost } from '@prisma/client'

export interface BlogPostCreateInput {
  slug: string
  title: string
  description?: string | null
  bodyMd: string
  imageUrl?: string | null
  publishedAt?: Date | null
  authorId: number
  tags: string[]
  seoTitle?: string | null
  seoDesc?: string | null
}

export interface BlogPostUpdateInput {
  slug?: string
  title?: string
  description?: string | null
  bodyMd?: string
  imageUrl?: string | null
  publishedAt?: Date | null
  tags?: string[]
  seoTitle?: string | null
  seoDesc?: string | null
}

export interface BlogPostListFilters {
  search?: string
  tags?: string[]
  status?: 'published' | 'draft' | 'all'
  authorId?: number
}

export interface BlogPostPagination {
  page: number
  perPage: number
}

export interface BlogPostRepository {
  create(data: BlogPostCreateInput): Promise<BlogPost>
  findById(id: number): Promise<BlogPost | null>
  findBySlug(slug: string): Promise<BlogPost | null>
  findBySlugWithAuthor(slug: string): Promise<(BlogPost & { author: { id: number, name: string | null, avatarUrl: string | null } }) | null>
  findByIdWithAuthor(id: number): Promise<(BlogPost & { author: { id: number, name: string | null, avatarUrl: string | null } }) | null>
  listPublic(filters: BlogPostListFilters, pagination: BlogPostPagination): Promise<{ items: BlogPost[], total: number }>
  listForDashboard(filters: BlogPostListFilters, pagination: BlogPostPagination): Promise<{ items: (BlogPost & { author: { id: number, name: string | null, avatarUrl: string | null } })[], total: number }>
  update(id: number, data: BlogPostUpdateInput): Promise<BlogPost | null>
  delete(id: number): Promise<boolean>
  existsBySlug(slug: string, excludeId?: number): Promise<boolean>
}

export const blogPostRepository: BlogPostRepository = {
  async create(data) {
    return await prisma.blogPost.create({
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description ?? undefined,
        bodyMd: data.bodyMd,
        imageUrl: data.imageUrl ?? undefined,
        publishedAt: data.publishedAt ?? undefined,
        authorId: data.authorId,
        tags: data.tags ?? [],
        seoTitle: data.seoTitle ?? undefined,
        seoDesc: data.seoDesc ?? undefined
      }
    })
  },

  async findById(id) {
    return await prisma.blogPost.findUnique({
      where: { id }
    })
  },

  async findBySlug(slug) {
    return await prisma.blogPost.findUnique({
      where: { slug }
    })
  },

  async findBySlugWithAuthor(slug) {
    return await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true }
        },
        anchors: { orderBy: { order: 'asc' } }
      }
    }) as (BlogPost & { author: { id: number, name: string | null, avatarUrl: string | null }, anchors: Array<{ id: number, blogPostId: number, label: string, to: string, order: number, icon: string | null, target: string | null, createdAt: Date }> }) | null
  },

  async findByIdWithAuthor(id) {
    return await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true }
        },
        anchors: { orderBy: { order: 'asc' } }
      }
    }) as (BlogPost & { author: { id: number, name: string | null, avatarUrl: string | null }, anchors: Array<{ id: number, blogPostId: number, label: string, to: string, order: number, icon: string | null, target: string | null, createdAt: Date }> }) | null
  },

  async listPublic(filters, pagination) {
    const where: {
      publishedAt: { not: null }
      title?: { contains: string, mode: 'insensitive' }
      tags?: { hasSome: string[] }
    } = {
      publishedAt: { not: null }
    }
    if (filters.search?.trim()) {
      where.title = { contains: filters.search.trim(), mode: 'insensitive' }
    }
    if (filters.tags?.length) {
      where.tags = { hasSome: filters.tags }
    }
    const skip = (pagination.page - 1) * pagination.perPage
    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: pagination.perPage
      }),
      prisma.blogPost.count({ where })
    ])
    return { items, total }
  },

  async listForDashboard(filters, pagination) {
    const where: {
      publishedAt?: { not: null } | null
      title?: { contains: string, mode: 'insensitive' }
      tags?: { hasSome: string[] }
      authorId?: number
    } = {}
    if (filters.status === 'published') {
      where.publishedAt = { not: null }
    } else if (filters.status === 'draft') {
      where.publishedAt = null
    }
    if (filters.search?.trim()) {
      where.title = { contains: filters.search.trim(), mode: 'insensitive' }
    }
    if (filters.tags?.length) {
      where.tags = { hasSome: filters.tags }
    }
    if (filters.authorId != null) {
      where.authorId = filters.authorId
    }
    const skip = (pagination.page - 1) * pagination.perPage
    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pagination.perPage,
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true }
          }
        }
      }),
      prisma.blogPost.count({ where })
    ])
    return { items, total }
  },

  async update(id, data) {
    const updated = await prisma.blogPost.updateMany({
      where: { id },
      data: {
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.bodyMd !== undefined && { bodyMd: data.bodyMd }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.publishedAt !== undefined && { publishedAt: data.publishedAt }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
        ...(data.seoDesc !== undefined && { seoDesc: data.seoDesc })
      }
    })
    if (updated.count === 0) return null
    return await prisma.blogPost.findUniqueOrThrow({ where: { id } })
  },

  async delete(id) {
    const result = await prisma.blogPost.deleteMany({
      where: { id }
    })
    return result.count > 0
  },

  async existsBySlug(slug, excludeId) {
    const existing = await prisma.blogPost.findFirst({
      where: {
        slug,
        ...(excludeId != null && { id: { not: excludeId } })
      }
    })
    return existing != null
  }
}
