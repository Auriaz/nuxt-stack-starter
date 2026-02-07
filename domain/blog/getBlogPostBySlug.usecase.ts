import type { BlogPostRepository } from '~~/server/repositories/blogPost.repo'
import type { BlogPostDTO } from '#shared/types/blog'
import { toBlogPostDTO } from './blog.dto'
import type { BlogPostRecordWithAuthor } from './blog.dto'
import { NotFoundError } from '../shared/errors'

export interface GetBlogPostBySlugInput {
  slug: string
  requirePublished: boolean
}

export async function getBlogPostBySlugUseCase(
  input: GetBlogPostBySlugInput,
  repo: BlogPostRepository
): Promise<BlogPostDTO> {
  const post = await repo.findBySlugWithAuthor(input.slug)
  if (!post) {
    throw new NotFoundError('Post not found')
  }
  if (input.requirePublished && !post.publishedAt) {
    throw new NotFoundError('Post not found')
  }
  return toBlogPostDTO(post as BlogPostRecordWithAuthor)
}
