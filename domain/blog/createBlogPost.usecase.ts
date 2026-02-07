import type { BlogPostRepository } from '~~/server/repositories/blogPost.repo'
import type { BlogPostDTO, BlogPostCreateInput } from '#shared/types/blog'

import { toBlogPostDTO } from './blog.dto'
import type { BlogPostRecordWithAuthor } from './blog.dto'
import { DuplicateError, ValidationError } from '../shared/errors'

export interface CreateBlogPostInput {
  authorId: number
  data: BlogPostCreateInput
}

export async function createBlogPostUseCase(
  input: CreateBlogPostInput,
  repo: BlogPostRepository
): Promise<BlogPostDTO> {
  const slug = input.data.slug.trim().toLowerCase().replace(/\s+/g, '-')
  if (!slug) {
    throw new ValidationError('Slug is required')
  }
  const exists = await repo.existsBySlug(slug)
  if (exists) {
    throw new DuplicateError('Post with this slug already exists')
  }

  const publishedAt = input.data.publishedAt
    ? new Date(input.data.publishedAt)
    : null

  const created = await repo.create({
    slug,
    title: input.data.title,
    description: input.data.description ?? null,
    bodyMd: input.data.bodyMd,
    imageUrl: input.data.imageUrl ?? null,
    publishedAt,
    authorId: input.authorId,
    tags: input.data.tags ?? [],
    seoTitle: input.data.seoTitle ?? null,
    seoDesc: input.data.seoDesc ?? null
  })

  const withAuthor = await repo.findByIdWithAuthor(created.id)
  if (!withAuthor) {
    return toBlogPostDTO(created as unknown as BlogPostRecordWithAuthor)
  }
  return toBlogPostDTO(withAuthor as BlogPostRecordWithAuthor)
}
