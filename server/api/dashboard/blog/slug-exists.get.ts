/**
 * GET /api/dashboard/blog/slug-exists?slug=...
 * Sprawdza, czy slug jest zajęty (auth + content.manage).
 */
import { getQuery } from 'h3'
import { slugify } from '#shared/utils/content'
import { blogPostRepository } from '~~/server/repositories/blogPost.repo'
import { PERMISSIONS } from '~~/shared/permissions'
import { requirePermission } from '~~/server/utils/access'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.CONTENT_MANAGE)

  const query = getQuery(event)
  const rawSlug = typeof query.slug === 'string' ? query.slug : ''
  const normalized = slugify(rawSlug.trim())

  if (!normalized) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  const exists = await blogPostRepository.existsBySlug(normalized)
  return { data: { exists } }
})
