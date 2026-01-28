---
name: System autoryzacji i autentyfikacji z nuxt-auth-utils
overview: 'Plan integracji nuxt-auth-utils z istniejącą architekturą Nuxt full-stack, obejmujący rejestrację, logowanie, reset hasła, sesje i ochronę routów, zgodnie z zasadami: resources layer, domain use-cases, walidacja Valibot.'
todos:
  - id: '1'
    content: Rozszerzyć Prisma schema o pole password (i opcjonalnie resetToken, resetTokenExpiry)
    status: completed
  - id: '2'
    content: Utworzyć server/repositories/user.repo.ts z metodami dla auth
    status: completed
  - id: '3'
    content: Zaimplementować domain/auth use-case'y (login, register, logout, forgotPassword, resetPassword)
    status: completed
  - id: '4'
    content: Zaktualizować API endpoints aby używały setUserSession() i clearUserSession() z nuxt-auth-utils
    status: completed
  - id: '5'
    content: Utworzyć app/middleware/auth.ts i guest.ts dla ochrony routów
    status: completed
  - id: '6'
    content: Zaktualizować server/middleware/auth.ts aby sprawdzał sesję
    status: completed
  - id: '7'
    content: Zrefaktoryzować useAuth() aby używał useUserSession() z nuxt-auth-utils
    status: completed
  - id: '8'
    content: Rozszerzyć useAuthResource() o forgotPassword i resetPassword
    status: completed
  - id: '9'
    content: Rozszerzyć shared/schemas/auth.ts o ForgotPassword i ResetPassword schemas
    status: completed
  - id: '10'
    content: Zrefaktoryzować komponenty formularzy aby używały shared schemas i nie wykonywały fetch
    status: completed
  - id: '11'
    content: Zaktualizować Header.vue aby używał useAuth() i wyświetlał stan użytkownika
    status: completed
isProject: false
---

# System autoryzacji i autentyfikacji z nuxt-auth-utils

## Analiza obecnego stanu

### Co istnieje:

- Moduł `nuxt-auth-utils` dodany do projektu
- Komponenty formularzy (Login, Register, ForgotPassword, ResetPassword)
- Struktura domain/auth z placeholderami
- Struktura server/api/auth z placeholderami
- useAuth composable (niezintegrowany z auth-utils)
- useAuthResource composable
- Layout guest.vue
- Routing `/auth/[slug]`

### Problemy:

1. Komponenty używają lokalnych schematów Valibot zamiast shared/schemas/auth.ts
2. useAuth() nie używa useUserSession() z nuxt-auth-utils
3. Brak pola password w Prisma schema
4. Use-case'y są placeholderami
5. Brak middleware guest i auth
6. Brak integracji z setUserSession() w endpointach
7. Brak forgot/reset password endpointów

---

## Architektura systemu auth

### Flow autoryzacji:

```
┌─────────────────────────────────────────────────────────┐
│ UI Component (AuthLoginForm)                           │
│ - Tylko UI + emit danych                               │
│ - Walidacja frontendowa (minimalna)                    │
└─────────────────┬───────────────────────────────────────┘
                  │ emit('submit', data)
                  ▼
┌─────────────────────────────────────────────────────────┐
│ useAuth() Composable                                    │
│ - Stan użytkownika (useUserSession z auth-utils)       │
│ - Metody: login, register, logout                       │
└─────────────────┬───────────────────────────────────────┘
                  │ używa
                  ▼
┌─────────────────────────────────────────────────────────┐
│ useAuthResource()                                       │
│ - Jedyny fetch do API auth                              │
│ - Adapter API ↔ UI                                      │
└─────────────────┬───────────────────────────────────────┘
                  │ $fetch('/api/auth/*')
                  ▼
┌─────────────────────────────────────────────────────────┐
│ API Endpoint (server/api/auth/*.ts)                     │
│ - Walidacja inputu (Valibot)                           │
│ - Wywołanie use-case                                    │
│ - setUserSession() (nuxt-auth-utils)                    │
└─────────────────┬───────────────────────────────────────┘
                  │ używa
                  ▼
┌─────────────────────────────────────────────────────────┐
│ Domain Use-case (domain/auth/*.usecase.ts)              │
│ - Logika biznesowa (weryfikacja, hash)                  │
│ - Result pattern                                        │
└─────────────────┬───────────────────────────────────────┘
                  │ używa
                  ▼
┌─────────────────────────────────────────────────────────┐
│ Repository (server/repositories/user.repo.ts)            │
│ - Prisma queries                                        │
│ - Mapowanie Prisma → Domain types                       │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
          ┌──────────────┐
          │ Prisma + DB  │
          └──────────────┘
```

---

## Struktura plików (docelowa)

```
/domain
  /auth
    login.usecase.ts          → Weryfikacja hasła, logika logowania
    register.usecase.ts       → Hash hasła, tworzenie użytkownika
    logout.usecase.ts         → Czyszczenie sesji
    forgotPassword.usecase.ts → Generowanie tokena resetu
    resetPassword.usecase.ts  → Weryfikacja tokena, reset hasła
    auth.types.ts             → Typy domenowe (LoginInput, RegisterInput, etc.)

/server
  /api
    /auth
      login.post.ts           → Walidacja → use-case → setUserSession
      register.post.ts        → Walidacja → use-case → setUserSession
      logout.post.ts          → clearUserSession
      forgot-password.post.ts → Walidacja → use-case
      reset-password.post.ts  → Walidacja → use-case → setUserSession
      me.get.ts               → Zwraca dane z sesji
  /repositories
    user.repo.ts              → Prisma queries dla auth
  /services
    auth.ts                   → Wrapper dla nuxt-auth-utils utilities
  /middleware
    auth.ts                   → Ochrona endpointów (sprawdza sesję)

/app
  /pages
    /auth
      [slug].vue              → Routing auth pages (już istnieje)
  /components
    /Auth
      /Login/Form/AuthLoginForm.vue        → Refaktoryzacja
      /Register/Form/AuthRegisterForm.vue → Refaktoryzacja
      /ForgotPassword/Form/...            → Refaktoryzacja
      /ResetPassword/Form/...             → Refaktoryzacja
  /layouts
    guest.vue                 → Layout dla auth (już istnieje)
  /composables
    useAuth.ts                → Integracja z useUserSession()
    /resources
      useAuthResource.ts      → Adapter API ↔ UI (już istnieje)
  /middleware
    auth.global.ts            → Ochrona stron (redirect do /auth/login)
    guest.ts                  → Redirect zalogowanych użytkowników

/shared
  /schemas
    auth.ts                   → Rozszerzenie o ForgotPassword, ResetPassword
  /types
    auth.ts                   → Typy DTO (już istnieje)

/prisma
  schema.prisma               → Dodanie pola password do User
```

---

## Implementacja warstwa po warstwie

### 1. Rozszerzenie Prisma Schema

**Plik**: `prisma/schema.prisma`

Dodaj pole password do modelu User:

```prisma
model User {
  id       Int    @id @default(autoincrement())
  email    String @unique
  username String @unique
  password String // Hash hasła (bcrypt)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Migracja**: `bunx prisma migrate dev --name add_password_to_user`

---

### 2. Repository Layer

**Plik**: `server/repositories/user.repo.ts`

```typescript
import { prisma } from '../services/prisma'
import type { User } from '@prisma/client'

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
  create(data: { email: string; username: string; password: string }): Promise<User>
  updatePassword(id: number, password: string): Promise<User>
}

export const userRepository: UserRepository = {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    })
  },

  async findByUsername(username: string) {
    return await prisma.user.findUnique({
      where: { username },
    })
  },

  async create(data) {
    return await prisma.user.create({
      data,
    })
  },

  async updatePassword(id, password) {
    return await prisma.user.update({
      where: { id },
      data: { password },
    })
  },
}
```

---

### 3. Domain Use-cases

**Plik**: `domain/auth/login.usecase.ts`

```typescript
import type { LoginInput, AuthOutput } from './auth.types'
import type { UserRepository } from '~/server/repositories/user.repo'
import { ok, err, type Result } from '../shared/result'
import { ValidationError, UnauthorizedError } from '../shared/errors'
import { verify } from 'nuxt-auth-utils/runtime/server'

export async function loginUseCase(
  input: LoginInput,
  repository: UserRepository
): Promise<Result<AuthOutput, ValidationError | UnauthorizedError>> {
  // 1. Znajdź użytkownika
  const user = await repository.findByEmail(input.email)
  if (!user) {
    return err(new UnauthorizedError('Invalid email or password'))
  }

  // 2. Zweryfikuj hasło (nuxt-auth-utils używa bcrypt)
  const isValid = await verify(input.password, user.password)
  if (!isValid) {
    return err(new UnauthorizedError('Invalid email or password'))
  }

  // 3. Zwróć dane użytkownika (bez hasła)
  return ok({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  })
}
```

**Plik**: `domain/auth/register.usecase.ts`

```typescript
import type { RegisterInput, AuthOutput } from './auth.types'
import type { UserRepository } from '~/server/repositories/user.repo'
import { ok, err, type Result } from '../shared/result'
import { ValidationError, DuplicateError } from '../shared/errors'
import { hash } from 'nuxt-auth-utils/runtime/server'

export async function registerUseCase(
  input: RegisterInput,
  repository: UserRepository
): Promise<Result<AuthOutput, ValidationError | DuplicateError>> {
  // 1. Sprawdź czy email już istnieje
  const existingEmail = await repository.findByEmail(input.email)
  if (existingEmail) {
    return err(new DuplicateError('User with this email already exists'))
  }

  // 2. Sprawdź czy username już istnieje
  const existingUsername = await repository.findByUsername(input.username)
  if (existingUsername) {
    return err(new DuplicateError('User with this username already exists'))
  }

  // 3. Hash hasła
  const hashedPassword = await hash(input.password)

  // 4. Utwórz użytkownika
  const user = await repository.create({
    email: input.email,
    username: input.username,
    password: hashedPassword,
  })

  // 5. Zwróć dane użytkownika (bez hasła)
  return ok({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  })
}
```

**Plik**: `domain/auth/logout.usecase.ts`

```typescript
import { ok, type Result } from '../shared/result'
import type { AuthOutput } from './auth.types'

/**
 * Use-case dla wylogowania
 *
 * W rzeczywistości logout jest obsługiwany przez clearUserSession() w endpoincie,
 * ale use-case może być użyty do dodatkowej logiki (np. logowanie wylogowania)
 */
export async function logoutUseCase(): Promise<Result<{ success: boolean }, never>> {
  // Można dodać logikę (np. logowanie wylogowania)
  return ok({ success: true })
}
```

**Plik**: `domain/auth/forgotPassword.usecase.ts`

```typescript
import type { ForgotPasswordInput } from './auth.types'
import type { UserRepository } from '~/server/repositories/user.repo'
import { ok, err, type Result } from '../shared/result'
import { NotFoundError } from '../shared/errors'
// TODO: Import email service gdy będzie dodany

export async function forgotPasswordUseCase(
  input: ForgotPasswordInput,
  repository: UserRepository
): Promise<Result<{ success: boolean }, NotFoundError>> {
  // 1. Znajdź użytkownika
  const user = await repository.findByEmail(input.email)
  if (!user) {
    // Dla bezpieczeństwa nie ujawniamy czy email istnieje
    return ok({ success: true })
  }

  // 2. Wygeneruj token resetu (np. crypto.randomBytes)
  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 godzina

  // 3. Zapisz token w DB (wymaga dodania pól do User model)
  // await repository.updateResetToken(user.id, resetToken, resetTokenExpiry)

  // 4. Wyślij email z linkiem resetu
  // TODO: Implementacja email service
  // await emailService.sendResetPasswordEmail(user.email, resetToken)

  return ok({ success: true })
}
```

**Plik**: `domain/auth/resetPassword.usecase.ts`

```typescript
import type { ResetPasswordInput, AuthOutput } from './auth.types'
import type { UserRepository } from '~/server/repositories/user.repo'
import { ok, err, type Result } from '../shared/result'
import { ValidationError, UnauthorizedError } from '../shared/errors'
import { hash } from 'nuxt-auth-utils/runtime/server'

export async function resetPasswordUseCase(
  input: ResetPasswordInput,
  repository: UserRepository
): Promise<Result<AuthOutput, ValidationError | UnauthorizedError>> {
  // 1. Znajdź użytkownika
  const user = await repository.findByEmail(input.email)
  if (!user) {
    return err(new UnauthorizedError('Invalid reset token'))
  }

  // 2. Zweryfikuj token (wymaga pól resetToken, resetTokenExpiry w User)
  // if (user.resetToken !== input.token || user.resetTokenExpiry < new Date()) {
  //   return err(new UnauthorizedError('Invalid or expired reset token'))
  // }

  // 3. Hash nowego hasła
  const hashedPassword = await hash(input.password)

  // 4. Zaktualizuj hasło i wyczyść token
  const updatedUser = await repository.updatePassword(user.id, hashedPassword)
  // await repository.clearResetToken(user.id)

  // 5. Zwróć dane użytkownika
  return ok({
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
    },
  })
}
```

**Plik**: `domain/auth/auth.types.ts` (rozszerzenie)

```typescript
export interface LoginInput {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterInput {
  username: string
  email: string
  password: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ResetPasswordInput {
  email: string
  password: string
  token: string
}

export interface AuthOutput {
  user: {
    id: number
    username: string
    email: string
  }
}
```

---

### 4. API Endpoints

**Plik**: `server/api/auth/login.post.ts`

```typescript
import { safeParse } from 'valibot'
import { LoginInputSchema } from '#shared/schemas/auth'
import { loginUseCase } from '~/domain/auth/login.usecase'
import { userRepository } from '~/server/repositories/user.repo'
import { isErr } from '~/domain/shared/result'
import { setUserSession } from '#auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Walidacja inputu
  const inputResult = safeParse(LoginInputSchema, body)
  if (!inputResult.success) {
    throw createError({
      status: 400,
      statusText: 'Invalid input',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input validation failed',
          issues: inputResult.issues,
        },
      },
    })
  }

  // Use-case
  const useCaseResult = await loginUseCase(inputResult.output, userRepository)

  if (isErr(useCaseResult)) {
    throw createError({
      status: useCaseResult.error.statusCode,
      statusText: useCaseResult.error.message,
      data: {
        error: {
          code: useCaseResult.error.code,
          message: useCaseResult.error.message,
        },
      },
    })
  }

  // Ustaw sesję użytkownika (nuxt-auth-utils)
  await setUserSession(event, {
    user: useCaseResult.value.user,
  })

  return { data: useCaseResult.value }
})
```

**Plik**: `server/api/auth/register.post.ts`

```typescript
// Podobnie jak login.post.ts, ale wywołuje registerUseCase
// i również używa setUserSession() po sukcesie
```

**Plik**: `server/api/auth/logout.post.ts`

```typescript
import { clearUserSession } from '#auth'

export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  return { data: { success: true } }
})
```

**Plik**: `server/api/auth/forgot-password.post.ts`

```typescript
import { safeParse } from 'valibot'
import { ForgotPasswordInputSchema } from '#shared/schemas/auth'
import { forgotPasswordUseCase } from '~/domain/auth/forgotPassword.usecase'
import { userRepository } from '~/server/repositories/user.repo'
import { isErr } from '~/domain/shared/result'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const inputResult = safeParse(ForgotPasswordInputSchema, body)
  if (!inputResult.success) {
    throw createError({
      status: 400,
      statusText: 'Invalid input',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input validation failed',
          issues: inputResult.issues,
        },
      },
    })
  }

  const useCaseResult = await forgotPasswordUseCase(inputResult.output, userRepository)

  if (isErr(useCaseResult)) {
    throw createError({
      status: useCaseResult.error.statusCode,
      statusText: useCaseResult.error.message,
      data: {
        error: {
          code: useCaseResult.error.code,
          message: useCaseResult.error.message,
        },
      },
    })
  }

  return { data: useCaseResult.value }
})
```

**Plik**: `server/api/auth/reset-password.post.ts`

```typescript
// Podobnie jak forgot-password, ale wywołuje resetPasswordUseCase
// i używa setUserSession() po sukcesie
```

**Plik**: `server/api/auth/me.get.ts`

```typescript
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  if (!session?.user) {
    throw createError({
      status: 401,
      statusText: 'Unauthorized',
      data: {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        },
      },
    })
  }

  return { data: { user: session.user } }
})
```

---

### 5. Server Middleware (ochrona endpointów)

**Plik**: `server/middleware/auth.ts`

```typescript
import { getServerSession } from '#auth'

/**
 * Middleware do ochrony endpointów API wymagających autoryzacji
 *
 * Automatycznie sprawdza sesję i dodaje user do event.context
 */
export default defineEventHandler(async (event) => {
  // Pomiń middleware dla publicznych endpointów
  const publicPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password']
  if (publicPaths.includes(event.path)) {
    return
  }

  const session = await getServerSession(event)

  if (!session?.user) {
    throw createError({
      status: 401,
      statusText: 'Unauthorized',
      data: {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      },
    })
  }

  // Dodaj użytkownika do context (dostępne w endpointach)
  event.context.user = session.user
})
```

---

### 6. Frontend Middleware

**Plik**: `app/middleware/auth.ts`

```typescript
import { useUserSession } from '#auth'

/**
 * Middleware do ochrony stron wymagających autoryzacji
 *
 * Redirect do /auth/login jeśli użytkownik nie jest zalogowany
 */
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
```

**Plik**: `app/middleware/guest.ts`

```typescript
import { useUserSession } from '#auth'

/**
 * Middleware dla stron auth (login, register)
 *
 * Redirect do /dashboard jeśli użytkownik jest już zalogowany
 */
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()

  if (loggedIn.value) {
    return navigateTo('/dashboard')
  }
})
```

---

### 7. useAuth Composable (integracja z nuxt-auth-utils)

**Plik**: `app/composables/useAuth.ts`

```typescript
import { useUserSession } from '#auth'
import { useAuthResource } from './resources/useAuthResource'
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '#shared/types/auth'
import { useToast } from '#app'

/**
 * Composable do zarządzania stanem autoryzacji
 *
 * Integracja z nuxt-auth-utils przez useUserSession()
 */
export function useAuth() {
  const session = useUserSession()
  const authResource = useAuthResource()
  const toast = useToast()
  const router = useRouter()

  // Stan z nuxt-auth-utils
  const user = computed(() => session.data.value?.user || null)
  const isLoggedIn = computed(() => session.loggedIn.value)
  const isLoading = computed(() => session.status.value === 'pending')

  async function login(input: LoginInput): Promise<boolean> {
    try {
      const result = await authResource.login(input)

      // Odśwież sesję (nuxt-auth-utils automatycznie odczyta z cookies)
      await session.fetch()

      toast.add({
        title: 'Sukces',
        description: 'Zalogowano pomyślnie',
        color: 'success',
      })

      // Redirect do dashboard lub zapisanego redirect
      const redirect = router.currentRoute.value.query.redirect as string
      await router.push(redirect || '/dashboard')

      return true
    } catch (error: any) {
      toast.add({
        title: 'Błąd logowania',
        description: error.message || 'Nie udało się zalogować',
        color: 'error',
      })
      return false
    }
  }

  async function register(input: RegisterInput): Promise<boolean> {
    try {
      const result = await authResource.register(input)

      // Odśwież sesję
      await session.fetch()

      toast.add({
        title: 'Sukces',
        description: 'Konto zostało utworzone',
        color: 'success',
      })

      await router.push('/dashboard')
      return true
    } catch (error: any) {
      toast.add({
        title: 'Błąd rejestracji',
        description: error.message || 'Nie udało się utworzyć konta',
        color: 'error',
      })
      return false
    }
  }

  async function logout(): Promise<void> {
    try {
      await authResource.logout()

      // Wyczyść sesję (nuxt-auth-utils)
      await session.clear()

      toast.add({
        title: 'Wylogowano',
        description: 'Zostałeś wylogowany',
        color: 'success',
      })

      await router.push('/auth/login')
    } catch (error: any) {
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się wylogować',
        color: 'error',
      })
    }
  }

  async function forgotPassword(input: ForgotPasswordInput): Promise<boolean> {
    try {
      await authResource.forgotPassword(input)

      toast.add({
        title: 'Email wysłany',
        description: 'Sprawdź swoją skrzynkę pocztową',
        color: 'success',
      })

      await router.push('/auth/login')
      return true
    } catch (error: any) {
      toast.add({
        title: 'Błąd',
        description: error.message || 'Nie udało się wysłać emaila',
        color: 'error',
      })
      return false
    }
  }

  async function resetPassword(input: ResetPasswordInput): Promise<boolean> {
    try {
      const result = await authResource.resetPassword(input)

      // Odśwież sesję (użytkownik jest automatycznie zalogowany po resecie)
      await session.fetch()

      toast.add({
        title: 'Hasło zresetowane',
        description: 'Twoje hasło zostało zmienione',
        color: 'success',
      })

      await router.push('/dashboard')
      return true
    } catch (error: any) {
      toast.add({
        title: 'Błąd',
        description: error.message || 'Nie udało się zresetować hasła',
        color: 'error',
      })
      return false
    }
  }

  return {
    user: readonly(user),
    isLoggedIn,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  }
}
```

---

### 8. useAuthResource (rozszerzenie)

**Plik**: `app/composables/resources/useAuthResource.ts`

Dodaj metody forgotPassword i resetPassword:

```typescript
async function forgotPassword(input: ForgotPasswordInput): Promise<{ success: boolean }> {
  const response = await apiClient.request<{ data: { success: boolean } }>(
    '/api/auth/forgot-password',
    {
      method: 'POST',
      body: input,
    }
  )
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: { success: boolean } }).data
  }
  return response as { success: boolean }
}

async function resetPassword(input: ResetPasswordInput): Promise<AuthOutput> {
  const response = await apiClient.request<{ data: AuthOutput } | AuthOutput>(
    '/api/auth/reset-password',
    {
      method: 'POST',
      body: input,
    }
  )
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: AuthOutput }).data
  }
  return response as AuthOutput
}
```

---

### 9. Walidacja (rozszerzenie schematów)

**Plik**: `shared/schemas/auth.ts`

```typescript
import { object, string, minLength, number, optional, email } from 'valibot'

export const LoginInputSchema = object({
  email: string([email('Invalid email format')]),
  password: string([minLength(1, 'Password is required')]),
  remember: optional(string()),
})

export const RegisterInputSchema = object({
  username: string([minLength(3, 'Username must be at least 3 characters')]),
  email: string([email('Invalid email format')]),
  password: string([
    minLength(8, 'Password must be at least 8 characters'),
    // Można dodać regex dla złożoności hasła
  ]),
})

export const ForgotPasswordInputSchema = object({
  email: string([email('Invalid email format')]),
})

export const ResetPasswordInputSchema = object({
  email: string([email('Invalid email format')]),
  password: string([minLength(8, 'Password must be at least 8 characters')]),
  token: string([minLength(1, 'Token is required')]),
})

export const AuthOutputSchema = object({
  user: object({
    id: number(),
    username: string(),
    email: string(),
  }),
})
```

---

### 10. Refaktoryzacja komponentów formularzy

**Zasady**:

- Usuń lokalne schematy Valibot
- Użyj schematów z `shared/schemas/auth.ts`
- Formularze tylko emitują dane, nie wykonują fetch
- Walidacja frontendowa minimalna (required, email format)

**Plik**: `app/components/Auth/Login/Form/AuthLoginForm.vue`

```vue
<script lang="ts" setup>
  import { LoginInputSchema } from '#shared/schemas/auth'
  import type { FormSubmitEvent } from '@nuxt/ui'

  const emit = defineEmits<{
    switchToRegister: []
    switchToForgotPassword: []
  }>()

  const auth = useAuth()
  const form = useForm(LoginInputSchema)

  // Fields dla UAuthForm (bez zmian)
  const fields = [
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'password', type: 'password', label: 'Hasło', required: true },
    { name: 'remember', type: 'checkbox', label: 'Zapamiętaj mnie' },
  ]

  async function onSubmit(payload: FormSubmitEvent<any>) {
    const success = await auth.login({
      email: payload.data.email,
      password: payload.data.password,
      remember: payload.data.remember,
    })
    // Redirect jest w useAuth.login()
  }
</script>

<template>
  <!-- Template bez zmian -->
</template>
```

Podobnie dla Register, ForgotPassword, ResetPassword.

---

### 11. Aktualizacja Header

**Plik**: `app/components/Header/Header.vue`

```typescript
const { loggedIn, user, clear } = useUserSession()
// lub
const { isLoggedIn, user, logout } = useAuth()

// W template:
<template v-if="isLoggedIn">
  <UDropdown>
    <UButton variant="ghost">
      {{ user?.username }}
    </UButton>
    <template #items>
      <UDropdownItem @click="logout">
        Wyloguj się
      </UDropdownItem>
    </template>
  </UDropdown>
</template>
<template v-else>
  <UButton to="/auth/login">Zaloguj się</UButton>
  <UButton to="/auth/register">Zarejestruj się</UButton>
</template>
```

---

## Integracja z nuxt-auth-utils

### Jak działa nuxt-auth-utils:

1.  **Sesje**: Przechowywane w encrypted cookies (sealed cookies)
2.  **Composable**: `useUserSession()` - reactive stan użytkownika
3.  **Server utilities**:

                                                - `setUserSession(event, { user })` - ustawia sesję
                                                - `clearUserSession(event)` - czyści sesję
                                                - `getServerSession(event)` - pobiera sesję na serwerze

4.  **Password hashing**: `hash()` i `verify()` z `nuxt-auth-utils/runtime/server`

### Konfiguracja:

**Plik**: `.env`

```env
NUXT_SESSION_PASSWORD=your-secret-password-min-32-chars
```

**Plik**: `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-auth-utils'],
  // Opcjonalna konfiguracja
  auth: {
    // Konfiguracja jeśli potrzebna
  },
})
```

---

## Ochrona routów

### Strony wymagające autoryzacji:

**Plik**: `app/pages/dashboard/**/*.vue`

```typescript
definePageMeta({
  middleware: 'auth', // Wymaga zalogowania
})
```

### Strony auth (tylko dla gości):

**Plik**: `app/pages/auth/[slug].vue`

```typescript
definePageMeta({
  middleware: 'guest', // Redirect jeśli zalogowany
})
```

---

## Rozszerzenie Prisma Schema (reset hasła)

Dla pełnej funkcjonalności resetu hasła, dodaj pola do User:

```prisma
model User {
  id                Int       @id @default(autoincrement())
  email             String    @unique
  username          String    @unique
  password          String
  resetToken        String?  @unique
  resetTokenExpiry  DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Podsumowanie implementacji

### Kolejność wdrożenia:

1. Rozszerz Prisma schema (password, opcjonalnie resetToken)
2. Utwórz user repository
3. Zaimplementuj use-case'y (login, register, logout)
4. Zaktualizuj API endpoints (użyj setUserSession)
5. Utwórz middleware (auth, guest)
6. Zaktualizuj useAuth (integracja z useUserSession)
7. Rozszerz useAuthResource (forgot/reset password)
8. Rozszerz schematy Valibot
9. Refaktoryzuj komponenty formularzy
10. Zaktualizuj Header

### Extension points (v2):

- Roles: Dodaj pole `role` do User, middleware sprawdzający role
- Permissions: Tabela permissions, sprawdzanie w use-case'ach
- Social login: OAuth providers w nuxt-auth-utils
- Email verification: Dodaj pole `emailVerified`, endpoint verify-email

---

## Oczekiwany efekt

Po wdrożeniu:

- Auth jest systemowo spójny z resztą aplikacji
- Backend i frontend mają jasne granice
- Walidacja jest przewidywalna (Valibot)
- Błędy są czytelne
- UI auth jest czyste i wymienne
- nuxt-auth-utils jest używany świadomie
- Architektura gotowa na rozbudowę (roles, permissions)
