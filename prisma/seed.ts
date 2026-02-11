import 'dotenv/config'
import { PrismaClient } from './generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { PERMISSIONS, type PermissionKey } from '../shared/permissions'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const permissionsSeed: Array<{ key: PermissionKey, label: string, group: string }> = [
  { key: PERMISSIONS.ADMIN_ACCESS, label: 'Dostęp do panelu admina', group: 'Admin' },
  { key: PERMISSIONS.USERS_READ, label: 'Podgląd użytkowników', group: 'Users' },
  { key: PERMISSIONS.USERS_MANAGE, label: 'Zarządzanie użytkownikami', group: 'Users' },
  { key: PERMISSIONS.ROLES_READ, label: 'Podgląd ról', group: 'Roles' },
  { key: PERMISSIONS.ROLES_MANAGE, label: 'Zarządzanie rolami', group: 'Roles' },
  { key: PERMISSIONS.PORTFOLIO_READ, label: 'Podgląd portfolio', group: 'Portfolio' },
  { key: PERMISSIONS.PORTFOLIO_MANAGE, label: 'Zarządzanie portfolio', group: 'Portfolio' },
  { key: PERMISSIONS.CONTENT_READ, label: 'Podgląd treści', group: 'Content' },
  { key: PERMISSIONS.CONTENT_MANAGE, label: 'Zarządzanie treściami', group: 'Content' },
  { key: PERMISSIONS.MEDIA_READ, label: 'Podgląd własnych mediów', group: 'Media' },
  { key: PERMISSIONS.MEDIA_CREATE, label: 'Upload mediów', group: 'Media' },
  { key: PERMISSIONS.MEDIA_UPDATE, label: 'Edycja metadanych mediów', group: 'Media' },
  { key: PERMISSIONS.MEDIA_DELETE, label: 'Usuwanie mediów', group: 'Media' },
  { key: PERMISSIONS.MEDIA_MANAGE, label: 'Zarządzanie wszystkimi mediami', group: 'Media' },
  { key: PERMISSIONS.ANALYTICS_READ, label: 'Podgląd analityki', group: 'Analytics' },
  { key: PERMISSIONS.SETTINGS_READ, label: 'Podgląd ustawień', group: 'Settings' },
  { key: PERMISSIONS.SETTINGS_UPDATE, label: 'Edycja ustawień', group: 'Settings' },
  { key: PERMISSIONS.CHAT_USE, label: 'Korzystanie z czatu', group: 'Chat' },
  { key: PERMISSIONS.CHAT_TEAM_READ, label: 'Podgląd czatu zespołów', group: 'Chat' },
  { key: PERMISSIONS.CHAT_TEAM_WRITE, label: 'Pisanie w czatach zespołów', group: 'Chat' },
  { key: PERMISSIONS.CHAT_DM_CREATE, label: 'Tworzenie DM', group: 'Chat' },
  { key: PERMISSIONS.CHAT_AI_USE, label: 'Korzystanie z AI chat', group: 'Chat' },
  { key: PERMISSIONS.CHAT_MODERATE, label: 'Moderacja czatu', group: 'Chat' },
  { key: PERMISSIONS.FRIENDS_READ, label: 'Podgląd znajomych', group: 'Friends' },
  { key: PERMISSIONS.FRIENDS_INVITE, label: 'Wysyłanie zaproszeń do znajomych', group: 'Friends' },
  { key: PERMISSIONS.FRIENDS_MANAGE, label: 'Zarządzanie znajomymi', group: 'Friends' },
  { key: PERMISSIONS.TEAMS_READ, label: 'Podgląd zespołów', group: 'Teams' },
  { key: PERMISSIONS.TEAMS_CREATE, label: 'Tworzenie zespołów', group: 'Teams' },
  { key: PERMISSIONS.TEAMS_MANAGE, label: 'Zarządzanie zespołami', group: 'Teams' },
  { key: PERMISSIONS.TEAMS_MEMBERS_MANAGE, label: 'Zarządzanie członkami zespołu', group: 'Teams' },
  { key: PERMISSIONS.NOTIFICATIONS_READ, label: 'Odczyt powiadomień', group: 'Notifications' },
  { key: PERMISSIONS.NOTIFICATIONS_MANAGE, label: 'Zarządzanie powiadomieniami', group: 'Notifications' },
  { key: PERMISSIONS.CALENDAR_READ, label: 'Podgląd kalendarza', group: 'Calendar' },
  { key: PERMISSIONS.CALENDAR_WRITE, label: 'Tworzenie i edycja wydarzeń', group: 'Calendar' },
  { key: PERMISSIONS.CALENDAR_TEAM_READ, label: 'Podgląd kalendarza zespołu', group: 'Calendar' },
  { key: PERMISSIONS.CALENDAR_TEAM_WRITE, label: 'Edycja wydarzeń zespołowych', group: 'Calendar' },
  { key: PERMISSIONS.CALENDAR_INVITE, label: 'Zapraszanie do wydarzeń', group: 'Calendar' },
  { key: PERMISSIONS.CALENDAR_ADMIN, label: 'Administracja kalendarzem', group: 'Calendar' }
]

const rolePermissionsSeed: Record<string, PermissionKey[]> = {
  admin: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.ROLES_READ,
    PERMISSIONS.ROLES_MANAGE,
    PERMISSIONS.PORTFOLIO_READ,
    PERMISSIONS.PORTFOLIO_MANAGE,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_MANAGE,
    PERMISSIONS.MEDIA_READ,
    PERMISSIONS.MEDIA_CREATE,
    PERMISSIONS.MEDIA_UPDATE,
    PERMISSIONS.MEDIA_DELETE,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.CHAT_USE,
    PERMISSIONS.CHAT_TEAM_READ,
    PERMISSIONS.CHAT_TEAM_WRITE,
    PERMISSIONS.CHAT_DM_CREATE,
    PERMISSIONS.CHAT_AI_USE,
    PERMISSIONS.CHAT_MODERATE,
    PERMISSIONS.FRIENDS_READ,
    PERMISSIONS.FRIENDS_INVITE,
    PERMISSIONS.FRIENDS_MANAGE,
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.TEAMS_CREATE,
    PERMISSIONS.TEAMS_MANAGE,
    PERMISSIONS.TEAMS_MEMBERS_MANAGE,
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
    PERMISSIONS.CALENDAR_READ,
    PERMISSIONS.CALENDAR_WRITE,
    PERMISSIONS.CALENDAR_TEAM_READ,
    PERMISSIONS.CALENDAR_TEAM_WRITE,
    PERMISSIONS.CALENDAR_INVITE,
    PERMISSIONS.CALENDAR_ADMIN
  ],
  user: [
    PERMISSIONS.PORTFOLIO_READ,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.MEDIA_READ,
    PERMISSIONS.MEDIA_CREATE,
    PERMISSIONS.MEDIA_UPDATE,
    PERMISSIONS.MEDIA_DELETE,
    PERMISSIONS.CHAT_USE,
    PERMISSIONS.CHAT_TEAM_READ,
    PERMISSIONS.CHAT_TEAM_WRITE,
    PERMISSIONS.CHAT_DM_CREATE,
    PERMISSIONS.FRIENDS_READ,
    PERMISSIONS.FRIENDS_INVITE,
    PERMISSIONS.FRIENDS_MANAGE,
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.TEAMS_CREATE,
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.CALENDAR_READ,
    PERMISSIONS.CALENDAR_WRITE,
    PERMISSIONS.CALENDAR_TEAM_READ,
    PERMISSIONS.CALENDAR_TEAM_WRITE,
    PERMISSIONS.CALENDAR_INVITE
  ]
}

async function main() {
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'admin' },
      update: { description: 'Administrator' },
      create: { name: 'admin', description: 'Administrator' }
    }),
    prisma.role.upsert({
      where: { name: 'user' },
      update: { description: 'Użytkownik' },
      create: { name: 'user', description: 'Użytkownik' }
    })
  ])

  await prisma.permission.createMany({
    data: permissionsSeed,
    skipDuplicates: true
  })

  const permissions = await prisma.permission.findMany()
  const permissionByKey = new Map(permissions.map(permission => [permission.key, permission]))
  const roleByName = new Map(roles.map(role => [role.name, role]))

  const rolePermissionRows = Object.entries(rolePermissionsSeed).flatMap(([roleName, keys]) => {
    const role = roleByName.get(roleName)
    if (!role) {
      return []
    }
    return keys
      .map((key) => {
        const permission = permissionByKey.get(key)
        if (!permission) {
          return null
        }
        return { roleId: role.id, permissionId: permission.id }
      })
      .filter((row): row is { roleId: number, permissionId: number } => row !== null)
  })

  if (rolePermissionRows.length) {
    await prisma.rolePermission.createMany({
      data: rolePermissionRows,
      skipDuplicates: true
    })
  }

  const userRole = roleByName.get('user')
  if (userRole) {
    await prisma.user.updateMany({
      where: { roleId: null },
      data: { roleId: userRole.id, role: 'user' }
    })
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
