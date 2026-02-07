/**
 * POST /api/dashboard/blog/tags — utworzenie tagu (auth + content.manage).
 * Jeśli tag o takiej nazwie (case-insensitive) istnieje, zwraca istniejący.
 */
import { readBody } from 'h3'
import { safeParse } from 'valibot'
import { BlogTagCreateSchema } from '#shared/schemas/blog'
import { blogTagRepository } from '~~/server/repositories/blogTag.repo'
import { PERMISSIONS } from '~~/shared/permissions'
import { requirePermission } from '~~/server/utils/access'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.CONTENT_MANAGE)

  const body = await readBody(event)
  const parsed = safeParse(BlogTagCreateSchema, body)
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

  const name = parsed.output.name.trim()
  if (!name) {
    throw createError({
      status: 422,
      statusText: 'Validation Error',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nazwa tagu jest wymagana',
          status: 422
        }
      }
    })
  }

  const tag = await blogTagRepository.ensureByName(name)
  return { data: tag }
})
