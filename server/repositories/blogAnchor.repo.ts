import { prisma } from '../services/prisma'
import type { BlogAnchor } from '../../prisma/generated/client.js'

export interface BlogAnchorCreateItem {
  label: string
  to: string
  order?: number
  icon?: string | null
  target?: string | null
}

export interface BlogAnchorRepository {
  createMany(blogPostId: number, items: BlogAnchorCreateItem[]): Promise<BlogAnchor[]>
  deleteByBlogPostId(blogPostId: number): Promise<number>
  findManyByBlogPostId(blogPostId: number): Promise<BlogAnchor[]>
}

export const blogAnchorRepository: BlogAnchorRepository = {
  async createMany(blogPostId, items) {
    if (items.length === 0) return []
    await prisma.blogAnchor.createMany({
      data: items.map((item, index) => ({
        blogPostId,
        label: item.label,
        to: item.to,
        order: item.order ?? index,
        icon: item.icon ?? undefined,
        target: item.target ?? undefined
      }))
    })
    return await prisma.blogAnchor.findMany({
      where: { blogPostId },
      orderBy: { order: 'asc' }
    })
  },

  async deleteByBlogPostId(blogPostId) {
    const result = await prisma.blogAnchor.deleteMany({
      where: { blogPostId }
    })
    return result.count
  },

  async findManyByBlogPostId(blogPostId) {
    return await prisma.blogAnchor.findMany({
      where: { blogPostId },
      orderBy: { order: 'asc' }
    })
  }
}
