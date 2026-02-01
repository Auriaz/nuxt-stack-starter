export const PERMISSIONS = {
  ADMIN_ACCESS: 'admin.access',
  USERS_READ: 'users.read',
  USERS_MANAGE: 'users.manage',
  ROLES_READ: 'roles.read',
  ROLES_MANAGE: 'roles.manage',
  PORTFOLIO_READ: 'portfolio.read',
  PORTFOLIO_MANAGE: 'portfolio.manage',
  CONTENT_READ: 'content.read',
  CONTENT_MANAGE: 'content.manage',
  MEDIA_READ: 'media.read',
  MEDIA_CREATE: 'media.create',
  MEDIA_UPDATE: 'media.update',
  MEDIA_DELETE: 'media.delete',
  MEDIA_MANAGE: 'media.manage',
  ANALYTICS_READ: 'analytics.read',
  SETTINGS_READ: 'settings.read',
  SETTINGS_UPDATE: 'settings.update'
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
  'content.manage': { label: 'Zarządzanie treściami', group: 'Content' },
  'media.read': { label: 'Podgląd własnych mediów', group: 'Media' },
  'media.create': { label: 'Upload mediów', group: 'Media' },
  'media.update': { label: 'Edycja metadanych mediów', group: 'Media' },
  'media.delete': { label: 'Usuwanie mediów', group: 'Media' },
  'media.manage': { label: 'Zarządzanie wszystkimi mediami', group: 'Media' },
  'analytics.read': { label: 'Podgląd analityki', group: 'Analytics' },
  'settings.read': { label: 'Podgląd ustawień', group: 'Settings' },
  'settings.update': { label: 'Edycja ustawień', group: 'Settings' }
}
