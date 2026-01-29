import { safeParse } from 'valibot'
import { UpdateRoleInputSchema } from '#shared/schemas/admin'
import { updateRoleUseCase } from '~~/domain/admin/manageRoles.usecase'
import { roleRepository } from '~~/server/repositories/role.repo'
import { requirePermission } from '~~/server/utils/access'
import { PERMISSIONS } from '~~/shared/permissions'
import { DomainError } from '~~/domain/shared/errors'
import { toRoleDTO } from '~~/server/utils/adminDto'

function parseRoleId(event: H3Event): number {
  const param = getRouterParam(event, 'id')
  const roleId = Number(param)
  if (!Number.isFinite(roleId)) {
    throw createError({
      status: 400,
      statusText: 'Invalid role id',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid role id',
          status: 400
        }
      }
    })
  }
  return roleId
}

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ADMIN_ACCESS)
  await requirePermission(event, PERMISSIONS.ROLES_MANAGE)

  const roleId = parseRoleId(event)
  const body = await readBody(event)
  const parseResult = safeParse(UpdateRoleInputSchema, body)
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

  try {
    const updatedRole = await updateRoleUseCase(roleId, parseResult.output, roleRepository)
    return { data: toRoleDTO(updatedRole) }
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
