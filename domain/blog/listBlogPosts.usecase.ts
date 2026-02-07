import type { BlogPostRepository } from '~~/server/repositories/blogPost.repo'
import type { BlogListQuery, BlogListResponse } from '#shared/types/blog'
import { toBlogPostDTO } from './blog.dto'
import type { BlogPostRecordWithAuthor } from './blog.dto'

export interface ListBlogPostsInput {
  query: BlogListQuery
  forDashboard: boolean
}

export async function listBlogPostsUseCase(
  input: ListBlogPostsInput,
  repo: BlogPostRepository
): Promise<BlogListResponse> {
  const page = Math.max(1, input.query.page ?? 1)
  const perPage = Math.min(50, Math.max(1, input.query.perPage ?? 12))
  const pagination = { page, perPage }
  const filters = {
    search: input.query.search,
    tags: input.query.tags,
    status: input.query.status ?? (input.forDashboard ? 'all' : 'published')
  }

  const { items, total } = input.forDashboard
    ? await repo.listForDashboard(filters, pagination)
    : await repo.listPublic(filters, pagination)

  return {
    items: items.map((r: BlogPostRecordWithAuthor) => toBlogPostDTO(r)),
    pagination: { page, perPage, total }
  }
}
