/**
 * GET /api/dashboard/blog/:id — pojedynczy post (auth + content.read).
 */
import { getRouterParam } from 'h3'
import { getBlogPostByIdUseCase } from '~~/domain/blog/getBlogPostById.usecase'
import { blogPostRepository } from '~~/server/repositories/blogPost.repo'
import { DomainError } from '~~/domain/shared/errors'
import { PERMISSIONS } from '~~/shared/permissions'
import { requirePermission } from '~~/server/utils/access'

function parseId(value: unknown): number | null {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.CONTENT_READ)

  const idParam = getRouterParam(event, 'id')
  const id = parseId(idParam)
  if (id == null) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }

  try {
    const post = await getBlogPostByIdUseCase({ id }, blogPostRepository)
    return { data: post }
  } catch (error) {
    if (error instanceof DomainError) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
        data: {
          error: {
            code: error.code,
            message: error.message,
            status: error.statusCode
          }
        }
      })
    }
    throw error
  }
})
