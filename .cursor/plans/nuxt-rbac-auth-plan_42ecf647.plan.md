---
name: nuxt-rbac-auth-plan
overview: Plan systemu autentyfikacji i autoryzacji (RBAC + permissions) dla Nuxt 4 z nuxt-auth-utils, Prisma i Valibot, z panelem Admina do zarządzania rolami i uprawnieniami.
todos:
  - id: rbac-prisma-models
    content: Dodać modele ról i uprawnień w Prisma (Role, Permission, RolePermission, pole roleId w User)
    status: completed
  - id: rbac-permissions-constants
    content: Utworzyć shared/permissions.ts z listą PermissionKey i PERMISSIONS
    status: in_progress
  - id: rbac-access-helpers
    content: 'Zaimplementować helpery dostępu: domain/access/access.service.ts i server/utils/access.ts'
    status: pending
  - id: rbac-admin-api
    content: Dodać endpointy admina do zarządzania użytkownikami i rolami (users, roles, role-permissions)
    status: pending
  - id: rbac-admin-ui
    content: Zaimplementować panel admina w Nuxt UI (strony /admin/users, /admin/roles) z pickerem permissions
    status: pending
  - id: rbac-session-integration
    content: Rozszerzyć sesję (me/login/OAuth) o role i permissions użytkownika na podstawie RolePermission
    status: pending
isProject: false
---

# Plan: System autentyfikacji i autoryzacji (RBAC) w Nuxt 4

## 1. Model RBAC/permissions (MVP vs v2)

### MVP – RBAC + Permissions

- **Model**: klasyczne RBAC rozszerzone o permissions:
  - Użytkownik ma **jedną główną rolę** (prostota, mniej edge-case’ów w MVP).
  - Każda rola ma zestaw **permissions** (string keys, np. `portfolio.manage`).
  - Uprawnienia są globalne (bez kontekstu teamu/projektu).
- **Uzasadnienie**:
  - Łatwe do zrozumienia i zarządzania z panelu admina.
  - Wymusza czytelną strukturę uprawnień (enum/string keys w jednym miejscu).
  - Integruje się dobrze z sesją (`nuxt-auth-utils`) – w sesji trzymamy minimalny obraz: role + flat lista permissions.

### v2 – RBAC + kontekst (teams/scopes) + ewentualnie ABAC

- **Rozszerzenie**:
  - `Team` / `TeamMember`, `TeamRole`, `TeamPermission` – dodatkowe zbiory ról/uprawnień przypięte do kontekstu (team, projekt).
  - Możliwość przełączania „contextu” w UI (aktywny team) → `can(permission, { teamId })`.
  - ABAC (atrybuty) tylko tam, gdzie naprawdę potrzebne (np. własność zasobu, `ownerId` itp.) – **nie** w MVP.
- **Granica MVP**:
  - MVP: 1 rola per user, globalne permissions, brak teams.
  - v2: multi-role per user + teams + audyt + bardziej złożone reguły.

---

## 2. Model danych (Prisma)

**Plik**: `prisma/schema.prisma`

### 2.1. Aktualizacja `User`

Zakładając istniejący model użytkownika, dodajemy referencję do roli:

```prisma
model User {
  id          Int      @id @default(autoincrement())
  email       String?  @unique
  username    String?  @unique
  password    String
  name        String?
  avatarUrl   String?
  roleId      Int?      // główna rola (MVP)
  role        Role?     @relation(fields: [roleId], references: [id])

  // ... istniejące relacje i pola (emailVerifiedAt, tokens, itd.)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

> MVP: jedna rola per user (`roleId`).
> v2: można dodać tabelę `UserRole` i usunąć `roleId` (multi-role).

### 2.2. Model `Role`

```prisma
model Role {
  id          Int           @id @default(autoincrement())
  name        String        @unique   // np. "admin", "user", "editor"
  description String?

  users       User[]
  permissions RolePermission[]

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}
```

### 2.3. Model `Permission`

```prisma
model Permission {
  id          Int              @id @default(autoincrement())
  key         String           @unique  // np. "portfolio.manage"
  label       String?                    // do UI
  group       String?                    // np. "Portfolio", "Users"

  roles       RolePermission[]

  createdAt   DateTime         @default(now())
}
```

### 2.4. Tabela łącząca `RolePermission`

```prisma
model RolePermission {
  roleId       Int
  permissionId Int

  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
  @@index([permissionId])
}
```

### 2.5. v2 – modele kontekstowe (zarys)

Nie implementujemy, tylko plan:

```prisma
model Team {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  slug      String   @unique
  createdAt DateTime @default(now())
}

model TeamMember {
  userId Int
  teamId Int
  roleId Int? // TeamRole

  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  team   Team @relation(fields: [teamId], references: [id], onDelete: Cascade)

  @@id([userId, teamId])
}

model TeamRole { /* analogicznie do Role, ale per team */ }
model TeamPermission { /* analogicznie do RolePermission */ }

model AuditLog {
  id        Int      @id @default(autoincrement())
  userId    Int?
  action    String   // np. 'role.assign', 'permission.update'
  metadata  Json?
  createdAt DateTime @default(now())
}
```

### 2.6. Seed domyślnych danych

- Domyślne role:
  - `admin`
  - `user`
- Domyślne permissions (MVP, przykładowy zestaw):
  - `admin.access` – dostęp do panelu admina
  - `users.read`, `users.manage`
  - `roles.read`, `roles.manage`
  - `portfolio.read`, `portfolio.manage`
  - `content.read`, `content.manage`
- Domyślne przypisania:
  - `admin` → wszystkie powyższe permissions,
  - `user` → np. `portfolio.read`, `content.read`.

Seed w `prisma/seed.ts` lub dedykowany use-case w `domain/admin/seedRoles.usecase.ts`.

---

## 3. Single source of truth dla permissions

**Plik**: `shared/permissions.ts`

- Definicja stałych i typu union:

```ts
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
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
```

- Opcjonalnie mapy do UI:

```ts
export const PERMISSION_META: Record<PermissionKey, { label: string; group: string }> = {
  'admin.access': { label: 'Dostęp do panelu admina', group: 'Admin' },
  'users.read': { label: 'Podgląd użytkowników', group: 'Users' },
  // ... itd.
}
```

**Zasada**: w kodzie używamy **wyłącznie** `PERMISSIONS.X` lub `PermissionKey`, nigdy „gołych” stringów.

---

## 4. Server-side enforcement

### 4.1. Helpery dostępu (`domain/access/access.service.ts`)

**Plik**: `domain/access/access.service.ts`

- Interfejs dla usera w sesji (zgodny z `shared/types/auth.d.ts`):

```ts
export interface SessionUser {
  id: number
  role: string
  permissions: PermissionKey[]
}
```

- Funkcje pomocnicze:

```ts
export function hasPermission(
  user: SessionUser | null | undefined,
  permission: PermissionKey
): boolean {
  if (!user) return false
  return user.permissions.includes(permission)
}

export function hasRole(user: SessionUser | null | undefined, role: string): boolean {
  if (!user) return false
  return user.role === role
}
```

### 4.2. Serwerowe require helpers (`server/utils/access.ts`)

**Plik**: `server/utils/access.ts`

```ts
export async function requirePermission(
  event: H3Event,
  permission: PermissionKey
): Promise<SessionUser> {
  const session = await requireUserSession(event) // z nuxt-auth-utils

  const user = session.user as SessionUser | undefined
  if (!user || !user.permissions?.includes(permission)) {
    throw createError({
      status: 403,
      statusText: 'Forbidden',
      data: {
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
          status: 403,
        },
      },
    })
  }

  return user
}
```

- Można też mieć `requireRole(event, role)` oparte o `user.role`.

### 4.3. Użycie w endpointach

Przykład `server/api/admin/users.get.ts`:

```ts
export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ADMIN_ACCESS)
  await requirePermission(event, PERMISSIONS.USERS_READ)

  const users = await adminUserRepository.findAllWithRoles()

  return { data: users.map(toUserDTO) }
})
```

Zasada: **zawsze** robić checky na serwerze (w API/use-case), nawet jeśli UI ma własne guardy.

---

## 5. Frontend authorization (UX + guards)

### 5.1. Composable `useAccess()`

**Plik**: `app/composables/useAccess.ts`

- Opiera się na `useAuth()` / `useUserSession()`:

```ts
export function useAccess() {
  const { user, isLoggedIn } = useAuth() // user pochodzi z sesji, zawiera role + permissions

  const hasRole = (role: string) => {
    return !!user.value && user.value.role === role
  }

  const can = (permission: PermissionKey) => {
    return (
      !!user.value &&
      Array.isArray(user.value.permissions) &&
      user.value.permissions.includes(permission)
    )
  }

  return { user, isLoggedIn, hasRole, can }
}
```

### 5.2. Komponent `<Can>`

**Plik**: `app/components/access/Can.vue`

- Props: `permission?: PermissionKey`, `role?: string`, `invert?: boolean`.
- Implementacja (wysoki poziom):
  - W `setup` używa `useAccess()`.
  - Renderuje slot tylko jeśli `can(permission)`/`hasRole(role)` jest spełnione.

### 5.3. Route meta

- Konwencja: w stronach admina:

```ts
definePageMeta({
  middleware: 'auth',
  permission: 'admin.access',
})
```

- W **globalnym middleware klienckim** (np. `app/middleware/permission.global.ts`):

```ts
export default defineNuxtRouteMiddleware((to) => {
  const requiredPermission = to.meta.permission as PermissionKey | undefined
  if (!requiredPermission) return

  const { can, isLoggedIn } = useAccess()
  if (!isLoggedIn.value || !can(requiredPermission)) {
    return navigateTo('/auth/login?redirect=' + encodeURIComponent(to.fullPath))
  }
})
```

> To jest tylko UX-helper – serwer musi i tak sprawdzić uprawnienia.

---

## 6. Panel Admina (UI)

### 6.1. Widoki

**Strony** (MVP):

- `/admin` – prosty dashboard z linkami do Users/Roles.
- `/admin/users` – lista użytkowników:
  - kolumny: email, name, role, createdAt.
  - akcja: zmiana roli (select), zapis przez API.
- `/admin/roles` – zarządzanie rolami:
  - lista ról (tabela).
  - formularz edycji roli (nazwa, opis).
  - lista permissions z checkboxami (grupowane po `group` z `Permission`/`PERMISSION_META`).

_v2_ (opcjonalnie): `/admin/permissions` do przeglądania pełnej listy permissions i ich przypisań.

### 6.2. UX

- Nuxt UI (`UCard`, `UTable`, `UForm`, `UCheckbox`, `USelect`, `UAlert`).
- W widoku ról:
  - po lewej: lista ról,
  - po prawej: szczegóły roli (formularz + lista permissions pogrupowanych wg resource).
- W widoku użytkowników:
  - zmiana roli w `USelect` (bezpośrednio w tabeli), z potwierdzeniem `UButton` „Zapisz zmiany”.
- Komunikaty:
  - Po sukcesie: `UAlert`/toast „Zaktualizowano rolę użytkownika”.
  - Po błędzie: `UAlert` z kodem błędu (np. `FORBIDDEN`, `VALIDATION_ERROR`).

---

## 7. API endpoints i DTO

### 7.1. Auth/session

- `GET /api/auth/me`
  - Input: brak.
  - Output:

```ts
interface UserDTO {
  id: number
  email?: string | null
  name?: string | null
  username?: string | null
  avatarUrl?: string | null
  role: string
  permissions: PermissionKey[]
}
```

- `{ data: { user: UserDTO | null } }`.
- `POST /api/auth/logout`
  - Input: brak.
  - Output: `{ data: { ok: true } }`.

### 7.2. Admin users

- `GET /api/admin/users`
  - Wymaga: `admin.access` + `users.read`.
  - Output: `{ data: UserDTO[] }` (bez permissions, albo uproszczony wariant dla listy).
- `PATCH /api/admin/users/:id/roles`
  - Input (Valibot `AssignUserRolesSchema` – MVP: jedna rola):

```ts
AssignUserRolesSchema = object({
  roleId: number(),
})
```

- Output: `{ data: UserDTO }`.

### 7.3. Admin roles

- `GET /api/admin/roles`
  - Wymaga: `admin.access` + `roles.read`.
  - Output:

```ts
interface RoleDTO {
  id: number
  name: string
  description?: string | null
  permissions: PermissionKey[]
}
```

- `POST /api/admin/roles`
  - `CreateRoleInputSchema`:

```ts
object({
  name: pipe(string(), minLength(2)),
  description: optional(string()),
})
```

- `PATCH /api/admin/roles/:id`
  - `UpdateRoleInputSchema` – jak wyżej z `partial`.
- `PATCH /api/admin/roles/:id/permissions`
  - `AssignPermissionsSchema`:

```ts
object({
  permissionKeys: array(enum_(Object.values(PERMISSIONS))),
})
```

- Output: `{ data: RoleDTO }`.

### 7.4. Permissions (opcjonalnie)

- `GET /api/admin/permissions`
  - Output:

```ts
interface PermissionDTO {
  key: PermissionKey
  label?: string
  group?: string
}
```

---

## 8. Valibot – schemy

**Plik**: `shared/schemas/admin.ts`

- `CreateRoleInputSchema`
- `UpdateRoleInputSchema`
- `AssignPermissionsSchema`
- `AssignUserRolesSchema`

Przykłady:

```ts
export const CreateRoleInputSchema = object({
  name: pipe(string(), minLength(2, 'Nazwa roli jest za krótka')),
  description: optional(string()),
})

export const AssignUserRolesSchema = object({
  roleId: number(),
})

export const AssignPermissionsSchema = object({
  permissionKeys: array(enum_(Object.values(PERMISSIONS) as [PermissionKey, ...PermissionKey[]])),
})
```

W endpointach:

```ts
const body = await readBody(event)
const parseResult = safeParse(CreateRoleInputSchema, body)
if (!parseResult.success) throwValidationError(parseResult.issues)
```

Gdzie `throwValidationError` buduje standardowy error `{ error: { code, message, status, issues } }`.

---

## 9. Wydajność i spójność

- Permissions użytkownika trzymamy w **sesji** (`nuxt-auth-utils`), aby unikać powtarzanych joinów przy każdym request.
- Po zalogowaniu / rejestracji / OAuth:
  - generujemy listę permissions na podstawie roli (join `RolePermission` → `Permission.key`),
  - wkładamy ją do sesji jako `user.permissions: PermissionKey[]`.
- Po **zmianie roli** użytkownika (przez admina):
  - MVP:
    - update w DB,
    - sesja zostanie „stara” do momentu ponownego logowania; można dodać manualny „Invalidate sessions” w v2.
  - v2:
    - mechanizm wersjonowania sesji lub `sessionVersion` w `User`, który jest sprawdzany w `sessionHooks.hook('fetch')` i `requireUserSession` (jeśli wersja się nie zgadza → clear + wymuś ponowne logowanie).
- Prisma – unikanie N+1:
  - w repozytoriach admina używać `include`:

```ts
prisma.user.findMany({
  include: {
    role: {
      include: {
        permissions: { include: { permission: true } },
      },
    },
  },
})
```

- funkcje mapujące do DTO generują flat `permissions: PermissionKey[]`.

---

## 10. Bezpieczeństwo

- Domyślne role i permissions seeding kontrolujemy w jednym miejscu, tylko `admin` ma `admin.access`.
- Endpointy `/api/admin/*` **zawsze**:
  - `requirePermission(event, PERMISSIONS.ADMIN_ACCESS)` na początku.
- Nigdy nie umożliwiamy nadania sobie roli `admin` przez endpoint niechroniony.
- v2:
  - `AuditLog` — logowanie zmian ról i permissions,
  - rate limiting na `/api/admin/*` (np. prosta integracja z Nitro/middleware),
  - dodatkowe checki przy „niebezpiecznych” akcjach (np. nie można usunąć ostatniego admina).

---

## 11. Struktura plików

```text
/domain
  /auth
    auth.types.ts              // już istniejące typy, można dodać SessionUser
  /access
    permissions.ts             // wrappery dla PERMISSIONS z shared
    access.service.ts          // hasPermission, hasRole
  /admin
    manageRoles.usecase.ts     // CRUD ról + permissions
    manageUsers.usecase.ts     // przypisywanie ról użytkownikom

/server
  /api
    /auth
      me.get.ts                // już istnieje, rozszerzyć o role + permissions
      logout.post.ts           // już istnieje
    /admin
      users.get.ts
      users-[id]-roles.patch.ts
      roles.get.ts
      roles.post.ts
      roles-[id].patch.ts
      roles-[id]-permissions.patch.ts
  /repositories
    user.repo.ts               // metody findAllWithRoles, updateRoleId
    role.repo.ts               // CRUD ról, pobieranie z permissions
    permission.repo.ts         // listowanie permissions, metadane
  /services
    prisma.ts
  /utils
    access.ts                  // requirePermission, requireRole

/app
  /composables/resources
    useAuthResource.ts         // me(), logout() (już istnieje)
    useAdminResource.ts        // admin/users, admin/roles API
  /composables
    useAuth.ts                 // już istniejący login/register/logout + rozszerzenie o role/permissions
    useAccess.ts               // can()/hasRole()
  /components/access
    Can.vue
  /pages/admin
    index.vue
    users.vue
    roles.vue
  /components/admin
    RoleEditor.vue             // formularz roli + przypisanie permissions
    PermissionsPicker.vue      // drzewko/checkboxy permissions

/shared
  /schemas
    admin.ts                   // schemy Valibot dla admin endpoints
  /types
    auth.ts                    // UserDTO, RoleDTO, PermissionDTO
  permissions.ts               // PERMISSIONS + PermissionKey + PERMISSION_META
```

---

## 12. Checklist wdrożeniowa (MVP → v2)

### 12.1. MVP – krok po kroku

1. **Prisma**

- Dodać modele `Role`, `Permission`, `RolePermission` oraz `roleId` w `User`.
- Dodać migrację `add_rbac_models` i wykonać ją.
- Napisać seed ról i permissions.

1. **Shared permissions**

- Utworzyć `shared/permissions.ts` z `PERMISSIONS` i `PermissionKey`.

1. **Repozytoria**

- Rozszerzyć `user.repo.ts` o metody `findAllWithRoles`, `updateRoleId`.
- Utworzyć `role.repo.ts` i `permission.repo.ts`.

1. **Use-case’y**

- Utworzyć `domain/access/access.service.ts` (`hasPermission`, `hasRole`).
- Utworzyć `domain/admin/manageRoles.usecase.ts` i `manageUsers.usecase.ts`.

1. **Sesja i `me**`

- W login/OAuth (już istniejące use-case’y) dodać generowanie listy permissions na podstawie roli i wkładanie do sesji (`user.permissions`).
- Rozszerzyć `GET /api/auth/me` o `role` i `permissions` w DTO.

1. **Server access helpers**

- Dodać `server/utils/access.ts` z `requirePermission` (i ewentualnie `requireRole`).
- Zabezpieczyć nowe endpointy admina.

1. **Admin API**

- Dodać endpointy `/api/admin/users` + `/api/admin/users/:id/roles`.
- Dodać endpointy `/api/admin/roles*` + ewentualnie `/api/admin/permissions`.
- Dodać schemy Valibot w `shared/schemas/admin.ts`.

1. **Frontend**

- Dodać `useAccess.ts` i komponent `<Can>`.
- Dodać strony `/admin/users` i `/admin/roles` + komponenty `RoleEditor.vue`, `PermissionsPicker.vue`.
- Dodać meta middleware `permission.global.ts` (opcjonalnie) i meta `permission: 'admin.access'` dla stron admina.

1. **Testy**

- Sprawdzić flow: zwykły user → brak dostępu do `/admin/*` (403/redirect).
- Admin może: wejść na `/admin`, zmienić rolę usera, dodać/usunąć uprawnienie z roli.
- Sprawdzić, że `me()` zwraca poprawne role + permissions.

### 12.2. v2 – rozszerzenia

1. **Multi-role**

- Dodać tabelę `UserRole` i wygasić `roleId` w `User`.
- Zmienić generowanie permissions: union permissions z wielu ról.

1. **Teams / kontekst**

- Dodać modele `Team`, `TeamMember`, `TeamRole`, `TeamPermission`.
- Rozszerzyć `useAccess().can(permission, { teamId })`.
- Dodać UI wyboru aktywnego teamu.

1. **Audit log + bezpieczeństwo**

- Dodać `AuditLog` i logowanie zmian ról/uprawnień.
- Prosty rate limiting na `/api/admin/*`.
- Mechanizm `sessionVersion` do wymuszania ponownego logowania po krytycznych zmianach.

---

## 13. Zasady do `.cursor/remember.md`

Propozycje krótkich zasad:

- **Auth & Sessions**: używamy `nuxt-auth-utils` (useUserSession, setUserSession, requireUserSession). W sesji trzymamy tylko minimalne dane: `id`, `name`, `avatarUrl`, `role`, `permissions[]`.
- **RBAC**: role i permissions są definiowane centralnie (`Prisma` + `shared/permissions.ts`), brak „gołych” stringów w kodzie.
- **Checks**: wszystkie sprawdzenia uprawnień po stronie serwera idą przez `requirePermission(event, PERMISSIONS.X)` lub use-case. Middleware klienta jest tylko dla UX.
- **Resources**: komponenty nie robią `fetch`; zawsze korzystamy z `app/composables/resources/*` jako adapterów API.
- **Admin**: `/api/admin/*` i `/admin/*` są zawsze chronione przez `admin.access` + odpowiednie permissions per zasób.
- **Rozszerzalność**: MVP zakłada jedną rolę na użytkownika i globalne permissions; multi-role + teams są planowane w v2, nie mieszamy ich do MVP.
