/**
 * GET /api/blog — publiczna lista opublikowanych postów (bez auth).
 */
import { getQuery } from 'h3'
import { safeParse } from 'valibot'
import { BlogListQuerySchema } from '#shared/schemas/blog'
import { listBlogPostsUseCase } from '~~/domain/blog/listBlogPosts.usecase'
import { blogPostRepository } from '~~/server/repositories/blogPost.repo'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const parsed = safeParse(BlogListQuerySchema, {
    page: query.page != null ? Number(query.page) : undefined,
    perPage: query.perPage != null ? Number(query.perPage) : undefined,
    search: query.search,
    tags: typeof query.tags === 'string' ? [query.tags] : Array.isArray(query.tags) ? query.tags : undefined
  })
  if (!parsed.success) {
    throw createError({
      status: 422,
      statusText: 'Validation Error',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query',
          status: 422,
          issues: parsed.issues
        }
      }
    })
  }

  const result = await listBlogPostsUseCase(
    { query: parsed.output, forDashboard: false },
    blogPostRepository
  )
  return { data: result }
})
