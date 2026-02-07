/**
 * POST /api/dashboard/blog — tworzenie postu (auth + content.manage).
 * Po utworzeniu posta zapisuje kotwice (anchors) jeśli podane.
 */
import { readBody } from 'h3'
import { safeParse } from 'valibot'
import { BlogPostCreateSchema } from '#shared/schemas/blog'
import type { SessionUser } from '~~/domain/auth/auth.types'
import { createBlogPostUseCase } from '~~/domain/blog/createBlogPost.usecase'
import { toBlogPostDTO } from '~~/domain/blog/blog.dto'
import type { BlogPostRecordWithAuthor } from '~~/domain/blog/blog.dto'
import { blogPostRepository } from '~~/server/repositories/blogPost.repo'
import { blogAnchorRepository } from '~~/server/repositories/blogAnchor.repo'
import { DomainError } from '~~/domain/shared/errors'
import { PERMISSIONS } from '~~/shared/permissions'
import { requirePermission } from '~~/server/utils/access'

export default defineEventHandler(async (event) => {
  const user = await requirePermission(event, PERMISSIONS.CONTENT_MANAGE) as SessionUser
  if (!user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const body = await readBody(event)
  const parsed = safeParse(BlogPostCreateSchema, body)
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
    const post = await createBlogPostUseCase(
      { authorId: user.id, data: parsed.output },
      blogPostRepository
    )
    const anchors = parsed.output.anchors ?? []
    if (anchors.length > 0) {
      await blogAnchorRepository.createMany(post.id, anchors.map((a, i) => ({
        label: a.label,
        to: a.to,
        order: a.order ?? i,
        icon: a.icon ?? null,
        target: a.target ?? null
      })))
    }
    const withAnchors = await blogPostRepository.findByIdWithAuthor(post.id)
    return {
      data: withAnchors
        ? toBlogPostDTO(withAnchors as BlogPostRecordWithAuthor)
        : post
    }
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
