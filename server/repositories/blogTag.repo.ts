import { prisma } from '../services/prisma'
import type { BlogTag } from '../../prisma/generated/client.js'

export interface BlogTagRepository {
  listAll(): Promise<BlogTag[]>
  findByName(name: string): Promise<BlogTag | null>
  create(name: string): Promise<BlogTag>
  ensureByName(name: string): Promise<BlogTag>
}

export const blogTagRepository: BlogTagRepository = {
  async listAll() {
    return await prisma.blogTag.findMany({
      orderBy: { name: 'asc' }
    })
  },

  async findByName(name: string) {
    const normalized = name.trim()
    if (!normalized) return null
    return await prisma.blogTag.findUnique({
      where: { name: normalized }
    })
  },

  async create(name: string) {
    const normalized = name.trim()
    if (!normalized) throw new Error('Tag name is required')
    return await prisma.blogTag.create({
      data: { name: normalized }
    })
  },

  /** Zwraca tag po nazwie (case-insensitive); jeśli nie istnieje, tworzy i zwraca. */
  async ensureByName(name: string) {
    const normalized = name.trim()
    if (!normalized) throw new Error('Tag name is required')
    const all = await this.listAll()
    const existing = all.find(t => t.name.toLowerCase() === normalized.toLowerCase())
    if (existing) return existing
    return await this.create(normalized)
  }
}
