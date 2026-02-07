import type { BlogPostRepository } from '~~/server/repositories/blogPost.repo'
import type { BlogPostDTO } from '#shared/types/blog'
import { toBlogPostDTO } from './blog.dto'
import type { BlogPostRecordWithAuthor } from './blog.dto'
import { NotFoundError } from '../shared/errors'

export interface GetBlogPostByIdInput {
  id: number
}

export async function getBlogPostByIdUseCase(
  input: GetBlogPostByIdInput,
  repo: BlogPostRepository
): Promise<BlogPostDTO> {
  const post = await repo.findByIdWithAuthor(input.id)
  if (!post) {
    throw new NotFoundError('Post not found')
  }
  return toBlogPostDTO(post as BlogPostRecordWithAuthor)
}
