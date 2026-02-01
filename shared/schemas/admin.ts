import { array, enum_, minLength, number, object, optional, pipe, picklist, string } from 'valibot'
import { PERMISSIONS } from '../permissions'

export const AdminUserStatusSchema = object({
  status: picklist(['active', 'blocked'], 'Status musi być active lub blocked')
})

export const CreateRoleInputSchema = object({
  name: pipe(string(), minLength(2, 'Nazwa roli jest za krótka')),
  description: optional(string())
})

export const UpdateRoleInputSchema = object({
  name: optional(pipe(string(), minLength(2, 'Nazwa roli jest za krótka'))),
  description: optional(string())
})

export const AssignPermissionsSchema = object({
  permissionKeys: array(enum_(PERMISSIONS))
})

export const AssignUserRolesSchema = object({
  roleId: number()
})
