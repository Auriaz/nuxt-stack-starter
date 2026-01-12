import { object, string, array, picklist } from 'valibot'

export const RoleSchema = picklist(['admin', 'editor', 'author', 'viewer'] as const)
export const PermissionSchema = picklist(['read', 'write', 'delete', 'publish'] as const)

export const UserRoleSchema = object({
  userId: string(),
  role: RoleSchema,
  permissions: array(PermissionSchema),
})
