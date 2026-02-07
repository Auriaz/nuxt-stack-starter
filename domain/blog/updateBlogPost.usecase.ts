import type { BlogPostRepository } from '~~/server/repositories/blogPost.repo'
import type { BlogPostDTO, BlogPostUpdateInput } from '#shared/types/blog'

import { toBlogPostDTO } from './blog.dto'
import type { BlogPostRecordWithAuthor } from './blog.dto'
import { NotFoundError, DuplicateError } from '../shared/errors'

export interface UpdateBlogPostInput {
  id: number
  data: BlogPostUpdateInput
}

export async function updateBlogPostUseCase(
  input: UpdateBlogPostInput,
  repo: BlogPostRepository
): Promise<BlogPostDTO> {
  const existing = await repo.findById(input.id)
  if (!existing) {
    throw new NotFoundError('Post not found')
  }

  const slug = input.data.slug != null
    ? input.data.slug.trim().toLowerCase().replace(/\s+/g, '-')
    : existing.slug
  if (slug && slug !== existing.slug) {
    const exists = await repo.existsBySlug(slug, input.id)
    if (exists) {
      throw new DuplicateError('Post with this slug already exists')
    }
  }

  const publishedAt = input.data.publishedAt !== undefined
    ? (input.data.publishedAt ? new Date(input.data.publishedAt) : null)
    : undefined

  const updateData: Parameters<BlogPostRepository['update']>[1] = {
    ...(input.data.slug !== undefined && { slug }),
    ...(input.data.title !== undefined && { title: input.data.title }),
    ...(input.data.description !== undefined && { description: input.data.description }),
    ...(input.data.bodyMd !== undefined && { bodyMd: input.data.bodyMd }),
    ...(input.data.imageUrl !== undefined && { imageUrl: input.data.imageUrl }),
    ...(publishedAt !== undefined && { publishedAt }),
    ...(input.data.tags !== undefined && { tags: input.data.tags }),
    ...(input.data.seoTitle !== undefined && { seoTitle: input.data.seoTitle }),
    ...(input.data.seoDesc !== undefined && { seoDesc: input.data.seoDesc })
  }

  const updated = await repo.update(input.id, updateData)
  if (!updated) {
    throw new NotFoundError('Post not found')
  }

  const withAuthor = await repo.findByIdWithAuthor(input.id)
  if (!withAuthor) {
    return toBlogPostDTO(updated as unknown as BlogPostRecordWithAuthor)
  }
  return toBlogPostDTO(withAuthor as BlogPostRecordWithAuthor)
}
