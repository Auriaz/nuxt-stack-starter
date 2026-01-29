export const PERMISSIONS = {
  ADMIN_ACCESS: 'admin.access',
  USERS_READ: 'users.read',
  USERS_MANAGE: 'users.manage',
  ROLES_READ: 'roles.read',
  ROLES_MANAGE: 'roles.manage',
  PORTFOLIO_READ: 'portfolio.read',
  PORTFOLIO_MANAGE: 'portfolio.manage',
  CONTENT_READ: 'content.read',
  CONTENT_MANAGE: 'content.manage'
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const PERMISSION_META: Record<PermissionKey, { label: string, group: string }> = {
  'admin.access': { label: 'Dostęp do panelu admina', group: 'Admin' },
  'users.read': { label: 'Podgląd użytkowników', group: 'Users' },
  'users.manage': { label: 'Zarządzanie użytkownikami', group: 'Users' },
  'roles.read': { label: 'Podgląd ról', group: 'Roles' },
  'roles.manage': { label: 'Zarządzanie rolami', group: 'Roles' },
  'portfolio.read': { label: 'Podgląd portfolio', group: 'Portfolio' },
  'portfolio.manage': { label: 'Zarządzanie portfolio', group: 'Portfolio' },
  'content.read': { label: 'Podgląd treści', group: 'Content' },
  'content.manage': { label: 'Zarządzanie treściami', group: 'Content' }
}
