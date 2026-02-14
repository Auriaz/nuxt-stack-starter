/**
 * GET /api/dashboard/blog — lista postów (auth + content.read).
 */
import { getQuery } from 'h3'
import { safeParse } from 'valibot'
import { BlogListQuerySchema } from '#shared/schemas/blog'
import { listBlogPostsUseCase } from '~~/domain/blog/listBlogPosts.usecase'
import { blogPostRepository } from '~~/server/repositories/blogPost.repo'
import { PERMISSIONS } from '~~/shared/permissions'
import { requirePermission } from '~~/server/utils/access'
import { hasPermission, hasRole } from '~~/domain/access/access.service'

export default defineEventHandler(async (event) => {
  const user = await requirePermission(event, PERMISSIONS.CONTENT_READ)
  const canViewAll = hasRole(user, 'admin')
    || hasPermission(user, PERMISSIONS.ADMIN_ACCESS)
    || hasPermission(user, PERMISSIONS.CONTENT_MANAGE)

  const query = getQuery(event)
  const parsed = safeParse(BlogListQuerySchema, {
    page: query.page != null ? Number(query.page) : undefined,
    perPage: query.perPage != null ? Number(query.perPage) : undefined,
    search: query.search,
    tags: typeof query.tags === 'string' ? [query.tags] : Array.isArray(query.tags) ? query.tags : undefined,
    status: query.status
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
    {
      query: parsed.output,
      forDashboard: true,
      authorId: canViewAll ? undefined : user.id
    },
    blogPostRepository
  )
  return { data: result }
})
