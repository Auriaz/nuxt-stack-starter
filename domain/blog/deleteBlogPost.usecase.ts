import type { BlogPostRepository } from '~~/server/repositories/blogPost.repo'
import { NotFoundError } from '../shared/errors'

export interface DeleteBlogPostInput {
  id: number
}

export async function deleteBlogPostUseCase(
  input: DeleteBlogPostInput,
  repo: BlogPostRepository
): Promise<void> {
  const existing = await repo.findById(input.id)
  if (!existing) {
    throw new NotFoundError('Post not found')
  }
  const deleted = await repo.delete(input.id)
  if (!deleted) {
    throw new NotFoundError('Post not found')
  }
}
