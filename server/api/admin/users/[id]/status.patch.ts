import { getRouterParam, readBody } from 'h3'
import { safeParse } from 'valibot'
import { AdminUserStatusSchema } from '#shared/schemas/admin'
import { updateUserStatusUseCase } from '~~/domain/admin/updateUserStatus.usecase'
import { userRepository } from '~~/server/repositories/user.repo'
import { requirePermission } from '~~/server/utils/access'
import { PERMISSIONS } from '~~/shared/permissions'
import { DomainError } from '~~/domain/shared/errors'
import { toUserDTO } from '~~/server/utils/adminDto'
import type { SessionUser } from '~~/domain/auth/auth.types'

function parseUserId(event: H3Event): number {
  const param = getRouterParam(event, 'id')
  const userId = Number(param)
  if (!Number.isFinite(userId)) {
    throw createError({
      status: 400,
      statusText: 'Invalid user id',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid user id',
          status: 400
        }
      }
    })
  }
  return userId
}

export default defineEventHandler(async (event) => {
  const sessionUser = await requirePermission(event, PERMISSIONS.ADMIN_ACCESS)
  await requirePermission(event, PERMISSIONS.USERS_MANAGE)

  const userId = parseUserId(event)
  const body = await readBody(event)
  const parseResult = safeParse(AdminUserStatusSchema, body)
  if (!parseResult.success) {
    throw createError({
      status: 422,
      statusText: 'Invalid input',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input validation failed',
          issues: parseResult.issues
        }
      }
    })
  }

  const currentUser = sessionUser as SessionUser
  const currentUserId = currentUser.id

  try {
    const user = await updateUserStatusUseCase(
      userId,
      parseResult.output.status,
      currentUserId,
      userRepository
    )
    return { data: toUserDTO(user) }
  } catch (error) {
    if (error instanceof DomainError) {
      throw createError({
        status: error.statusCode,
        statusText: error.message,
        data: {
          error: {
            code: error.code,
            message: error.message,
            status: error.statusCode,
            issues: (error as { issues?: unknown[] }).issues
          }
        }
      })
    }
    throw error
  }
})
