/**
 * PATCH /api/dashboard/blog/:id — aktualizacja postu (auth + content.manage).
 * Gdy w body jest anchors, zastępuje listę kotwic.
 */
import { getRouterParam, readBody } from 'h3'
import { safeParse } from 'valibot'
import { BlogPostUpdateSchema } from '#shared/schemas/blog'
import { updateBlogPostUseCase } from '~~/domain/blog/updateBlogPost.usecase'
import { toBlogPostDTO } from '~~/domain/blog/blog.dto'
import type { BlogPostRecordWithAuthor } from '~~/domain/blog/blog.dto'
import { blogPostRepository } from '~~/server/repositories/blogPost.repo'
import { blogAnchorRepository } from '~~/server/repositories/blogAnchor.repo'
import { DomainError } from '~~/domain/shared/errors'
import { PERMISSIONS } from '~~/shared/permissions'
import { requirePermission } from '~~/server/utils/access'

function parseId(value: unknown): number | null {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.CONTENT_MANAGE)

  const idParam = getRouterParam(event, 'id')
  const id = parseId(idParam)
  if (id == null) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }

  const body = await readBody(event)
  const parsed = safeParse(BlogPostUpdateSchema, body)
  if (!parsed.success) {
    throw createError({
      status: 422,
      statusText: 'Validation Error',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          status: 422,
          issues: parsed.issues
        }
      }
    })
  }

  try {
    const post = await updateBlogPostUseCase(
      { id, data: parsed.output },
      blogPostRepository
    )
    if (parsed.output.anchors !== undefined) {
      await blogAnchorRepository.deleteByBlogPostId(id)
      const anchors = parsed.output.anchors
      if (anchors.length > 0) {
        await blogAnchorRepository.createMany(id, anchors.map((a, i) => ({
          label: a.label,
          to: a.to,
          order: a.order ?? i,
          icon: a.icon ?? null,
          target: a.target ?? null
        })))
      }
      const withAnchors = await blogPostRepository.findByIdWithAuthor(id)
      return {
        data: withAnchors
          ? toBlogPostDTO(withAnchors as BlogPostRecordWithAuthor)
          : post
      }
    }
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
