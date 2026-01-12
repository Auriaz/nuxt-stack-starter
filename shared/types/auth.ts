import type { InferOutput } from 'valibot'
import type { RoleSchema, PermissionSchema, UserRoleSchema } from '../schemas/auth'

export type Role = InferOutput<typeof RoleSchema>
export type Permission = InferOutput<typeof PermissionSchema>
export type UserRole = InferOutput<typeof UserRoleSchema>
