import { safeParse } from 'valibot'
import { CreateRoleInputSchema } from '#shared/schemas/admin'
import { createRoleUseCase } from '~~/domain/admin/manageRoles.usecase'
import { roleRepository } from '~~/server/repositories/role.repo'
import { requirePermission } from '~~/server/utils/access'
import { PERMISSIONS } from '~~/shared/permissions'
import { DomainError } from '~~/domain/shared/errors'
import { toRoleDTO } from '~~/server/utils/adminDto'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ADMIN_ACCESS)
  await requirePermission(event, PERMISSIONS.ROLES_MANAGE)

  const body = await readBody(event)
  const parseResult = safeParse(CreateRoleInputSchema, body)
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
    const role = await createRoleUseCase(parseResult.output, roleRepository)
    const roleWithPermissions = await roleRepository.findByIdWithPermissions(role.id)
    if (!roleWithPermissions) {
      throw new Error('Role not found after create')
    }
    return { data: toRoleDTO(roleWithPermissions) }
  } catch (error) {
    if (error instanceof DomainError) {
      throw createError({
        status: error.statusCode,
        statusText: error.message,
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
