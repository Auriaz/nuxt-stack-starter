/**
 * GET /api/dashboard/blog/tags — lista tagów (auth + content.read).
 */
import { blogTagRepository } from '~~/server/repositories/blogTag.repo'
import { PERMISSIONS } from '~~/shared/permissions'
import { requirePermission } from '~~/server/utils/access'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.CONTENT_READ)

  const tags = await blogTagRepository.listAll()
  return { data: tags }
})
