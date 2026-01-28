---
name: nuxt-oauth-nuxt-auth-utils-plan
overview: 'Plan wdrożenia OAuth z użyciem nuxt-auth-utils w Nuxt 4: model Prisma, flow OAuth, endpointy, sesje, ochrona API, warstwy domain/server/app oraz checklisty MVP i v2.'
todos:
  - id: prisma-oauth-models
    content: Dodać modele User i OAuthAccount w prisma/schema.prisma zgodnie z planem
    status: completed
  - id: oauth-repositories
    content: Utworzyć repozytoria user.repo.ts i oauthAccount.repo.ts z metodami pod OAuth
    status: completed
  - id: oauth-usecases
    content: Zaimplementować use-case upsertOAuthUser.usecase.ts i auth.types.ts dla SessionUser/OAuthProfile
    status: completed
  - id: auth-utils-setup
    content: Skonfigurować moduł nuxt-auth-utils (NUXT_SESSION_PASSWORD, provider GitHub, sesje cookie)
    status: completed
  - id: auth-api-endpoints
    content: Dodać endpointy /api/auth/me i /api/auth/logout oraz zintegrować callback OAuth z upsertOAuthUser
    status: completed
  - id: auth-ui-resources
    content: Rozszerzyć useAuthResource/useAuth o me(), logout() i loginWithProvider
    status: completed
  - id: auth-protection
    content: Dodać requireUserSession do wrażliwych endpointów i middleware klienckie chroniące strony
    status: completed
isProject: false
---

# Plan: System OAuth w Nuxt 4 z `nuxt-auth-utils`

## 1. Model danych (Prisma)

**Plik**: `prisma/schema.prisma`

- **Model `User**` (rozszerzalny pod RBAC i dashboard):
  - `id          Int      @id @default(autoincrement())`
  - `email       String?  @unique` _(nullable – nie każdy provider zwraca email)_
  - `name        String?`
  - `username    String?  @unique` _(opcjonalnie, do ręcznej rejestracji)_
  - `avatarUrl   String?`
  - `role        String   @default("user")` _(np. `user`, `admin` w v2)_
  - `createdAt   DateTime @default(now())`
  - `updatedAt   DateTime @updatedAt`
  - `oauthAccounts OAuthAccount[]`
- **Model `OAuthAccount**` (powiązanie provider ↔ user):
  - `id                 Int      @id @default(autoincrement())`
  - `userId             Int`
  - `provider           String` _(np. `github`, `google`)_
  - `providerAccountId  String` _(ID usera po stronie providera)_
  - `accessToken        String?`
  - `refreshToken       String?`
  - `expiresAt          DateTime?`
  - `createdAt          DateTime @default(now())`
  - `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`
  - `@@unique([provider, providerAccountId])`
  - `@@index([userId])`

**Założenia:**

- Minimalne pola, ale gotowe na v2 (refreshToken, expiresAt, role, avatarUrl).
- Email opcjonalny i unikalny tylko, jeśli istnieje.

---

## 2. Konfiguracja `nuxt-auth-utils`

**Plik**: `nuxt.config.ts`

- **Instalacja modułu**:
  - `modules: ['nuxt-auth-utils', '@nuxt/ui', ...]`
- **Konfiguracja sesji**:
  - ENV: `NUXT_SESSION_PASSWORD` (>= 32 znaków, różne dla dev/prod).
  - W `nuxt.config.ts` (jeśli potrzeba customizacji):
    - `auth: { sessionPassword: process.env.NUXT_SESSION_PASSWORD }` lub zgodnie z dokumentacją modułu.
- **Korzystanie z `useUserSession()` w UI** (np. w `app/composables/useAuth.ts` – już istnieje):
  - `const session = useUserSession()`
  - `session.user`, `session.loggedIn`, `session.ready`, `session.fetch()`, `session.clear()`
  - Dodatkowo: `session.openInPopup('/auth/github')` dla OAuth popup.
- **Server-side enforcement**:
  - Funkcje `requireUserSession(event)` / `getUserSession(event)` z modułu w endpointach API.
  - Błędy 401 przy braku sesji.

---

## 3. Flow OAuth (MVP: 1 provider)

Przykład: **GitHub** jako pierwszy provider.

### 3.1. Kroki użytkownika (flow wysokopoziomowo)

1. Użytkownik klika „Zaloguj przez GitHub”:

- Link lub przycisk w UI:
  - `navigateTo('/auth/github')` **lub** `useUserSession().openInPopup('/auth/github')`.

1. Nuxt (via `nuxt-auth-utils`) przekierowuje do GitHub OAuth authorize URL.
2. Użytkownik loguje się/akceptuje na GitHub.
3. GitHub wywołuje callback (np. `/auth/github/callback` na backendzie Nuxt).
4. Backend:

- pobiera profil użytkownika z GitHub (token -> userinfo),
- wywołuje use-case `upsertOAuthUserUseCase`:
  - znajdź `OAuthAccount` po (provider, providerAccountId),
  - jeśli istnieje → pobierz powiązanego `User`,
  - jeśli nie istnieje → utwórz `User` + `OAuthAccount`.
- tworzy sesję cookie (`setUserSession(event, { user: { id, role, name, avatarUrl } })`).

1. Backend redirectuje do `returnTo` (np. `/dashboard` albo `/`), przechowywane w query/cookie/session.
2. UI może wywołać `useUserSession().fetch()` aby odświeżyć stan po powrocie z OAuth (zwłaszcza jeśli używany jest popup).

### 3.2. Callback i `returnTo`

- `returnTo` można:
  - przekazać jako query: `/auth/github?returnTo=/dashboard`,
  - zapisać w sesji tymczasowej lub cookie (np. `auth_return_to`).
- W callbacku:
  - odczytać `returnTo` z query lub cookie,
  - po ustawieniu sesji zrobić `redirect(returnTo || '/dashboard')`.

### 3.3. Obsługa błędów OAuth

- Callback powinien obsłużyć:
  - brak code/state → `OAUTH_CALLBACK_ERROR` (400/500),
  - błąd providera `error=access_denied` → bezpieczny redirect na `/auth/login?error=oauth_denied`,
  - state mismatch → `OAUTH_PROVIDER_ERROR` + logowanie server-side.
- UI:
  - czyta `route.query.error` i pokazuje `UAlert` z prostą wiadomością.

---

## 4. Endpointy i odpowiedzialności

**Pliki w `server/api/auth**`:

1. `**me.get.ts**`

- `GET /api/auth/me`
- Używa `getUserSession(event)`.
- Zwraca DTO użytkownika z sesji:
  - `{ data: { user: { id, name, email, avatarUrl, role } } }` lub `{ data: { user: null } }`.

1. `**logout.post.ts**`

- `POST /api/auth/logout`
- Używa `setUserSession(event, null)` lub `clearUserSession` wg modułu.
- Zwraca `{ data: { ok: true } }`.

1. **OAuth routes (częściowo dostarczane przez `nuxt-auth-utils`)**

- `GET /auth/github` – przekierowanie do GitHub (najczęściej generowane przez moduł).
- `GET /auth/github/callback` – endpoint callback (custom lub modułowy):
  - pobiera token i profil,
  - wywołuje use-case `upsertOAuthUserUseCase`,
  - ustawia sesję i redirectuje (HTTP 302).

1. **Zabezpieczone endpointy biznesowe (przykład)**

- `GET /api/dashboard/stats`
  - `const session = await requireUserSession(event)`
  - jeśli brak → moduł rzuca 401,
  - wykorzystuje `session.user.id` / `session.user.role`.

---

## 5. Warstwa domeny i repozytoriów

### 5.1. Repozytoria (`server/repositories`)

- `**user.repo.ts**`
  - `findById(id: number): Promise<User | null>`
  - `findByEmail(email: string): Promise<User | null>`
  - `createFromOAuth(data: { email?: string; name?: string; username?: string; avatarUrl?: string; role?: string }): Promise<User>`
  - `updateProfile(id: number, data: Partial<...>): Promise<User>` _(v2)_
- `**oauthAccount.repo.ts**`
  - `findByProviderAccount(provider: string, providerAccountId: string): Promise<OAuthAccount & { user: User } | null>`
  - `create(data: { userId: number; provider: string; providerAccountId: string; accessToken?: string; refreshToken?: string; expiresAt?: Date }): Promise<OAuthAccount>`

### 5.2. Use-case’y (`domain/auth`)

- `**auth.types.ts**`
  - `OAuthProfile` – ustandaryzowany profil z providera:
    - `{ provider: 'github' | 'google'; providerAccountId: string; email?: string; emailVerified?: boolean; name?: string; avatarUrl?: string }`
  - `SessionUser` – minimalny user w sesji:
    - `{ id: number; role: string; name?: string; avatarUrl?: string }`
- `**upsertOAuthUser.usecase.ts**`
  - Input: `OAuthProfile`.
  - Krok 1: `oauthAccountRepo.findByProviderAccount(...)`.
  - Jeśli istnieje:
    - zwróć powiązanego `User`.
  - Jeśli nie istnieje:
    - jeśli jest `email` → opcjonalny `userRepo.findByEmail`, aby zlinkować konta w v2,
    - utwórz `User` → `userRepo.createFromOAuth`,
    - utwórz `OAuthAccount`.
  - Output: `SessionUser` (DTO do sesji).
- `**getCurrentUser.usecase.ts**`
  - Input: `SessionUser` (z sesji).
  - Ewentualnie dociąga profil z DB do UI (v2, gdy będzie potrzebny dodatkowy stan).

---

## 6. Warstwa app/resources i UI

### 6.1. `useAuthResource` (`app/composables/resources/useAuthResource.ts`)

- `async function me(): Promise<UserDTO | null>`
  - `GET /api/auth/me` → `{ data: { user } }`.
- `async function logout(): Promise<{ ok: true }>`
  - `POST /api/auth/logout`.

_(Login przez OAuth nie wymaga klasycznego endpointu `POST /api/auth/login` – używamy `/auth/<provider>` jako route do przekierowania, nie jako JSON API.)_

### 6.2. `useAuth` (`app/composables/useAuth.ts`)

- Oprócz istniejących metod (login, register, logout) dodać metody pomocnicze dla OAuth:
  - `async loginWithProvider(provider: 'github' | 'google', { returnTo }?: { returnTo?: string })`:
    - np. `const session = useUserSession()`;
    - `const url = '/auth/github' + (returnTo ? '?returnTo=' + encodeURIComponent(returnTo) : '')`;
    - `await session.openInPopup(url)` lub `navigateTo(url)`;
    - po zamknięciu popup: `await session.fetch()`.

### 6.3. Strony i komponenty

- `**/pages/auth/login.vue**` (opcjonalny wrapper wokół `[slug].vue`):
  - przyciski: „Zaloguj przez GitHub / Google”
  - UI używa `useAuth().loginWithProvider('github', { returnTo: route.query.redirect ?? '/dashboard' })`.
- **Brak konieczności osobnej strony callback** – callback jest po stronie server/api lub wewnętrznej ścieżce modułu, a frontend dostaje tylko redirect / odświeżenie sesji.

---

## 7. Kontrakt sesji i DTO

### 7.1. Co trzymamy w sesji

- Minimalny `SessionUser` (w sesji cookie przez `nuxt-auth-utils`):

```ts
{
  user: {
    id: number
    role: string
    name?: string
    avatarUrl?: string
  }
}
```

- Bez tokenów OAuth w sesji (są w DB w `OAuthAccount`).
- Sesja zawiera tylko to, co jest potrzebne UI + autoryzacji (RBAC w v2).

### 7.2. `GET /api/auth/me` DTO

- Odpowiedź:

```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "avatarUrl": "https://...",
      "role": "user"
    }
  }
}
```

- Dla niezalogowanych: `{ data: { user: null } }`.

### 7.3. Odświeżanie sesji w UI

- Po callbacku OAuth (np. po zamknięciu popupu):
  - `await useUserSession().fetch()`
  - UI może potem wykonać `await authResource.me()` aby mieć zawsze świeży profil.

---

## 8. Ochrona zasobów (server-first)

### 8.1. API

Przykład endpointu zabezpieczonego w `server/api/dashboard/stats.get.ts`:

```ts
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  // session.user.id, session.user.role dostępne tutaj

  return {
    data: {
      /* ... dane dashboardu ... */
    },
  }
})
```

- Gdy sesja nie istnieje, `requireUserSession` rzuca 401 z komunikatem `UNAUTHORIZED`.

### 8.2. Ochrona stron (`app/middleware`)

- `**app/middleware/auth.global.ts` lub `auth.ts**`:

```ts
export default defineNuxtRouteMiddleware((to) => {
  const session = useUserSession()

  // Jeśli middleware jest globalny → ogranicz do określonych ścieżek
  const protectedRoutes = ['/dashboard', '/konto', '/ustawienia']
  if (!protectedRoutes.some((path) => to.path.startsWith(path))) {
    return
  }

  if (!session.loggedIn.value && session.ready.value) {
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
```

- **Zasada:**
  - middleware klienta jest tylko _UX helperem_ – prawdziwa ochrona zawsze na serwerze przez `requireUserSession`.

---

## 9. Walidacja i błędy (Valibot + standard API)

### 9.1. Format błędów API

- Standard już używany w projekcie:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "status": 422,
    "issues": [
      /* z Valibot */
    ],
    "requestId": "..." // opcjonalnie w v2
  }
}
```

### 9.2. Kody błędów w OAuth

- `OAUTH_PROVIDER_ERROR` – błąd po stronie providera (np. brak odpowiedzi, invalid token).
- `OAUTH_CALLBACK_ERROR` – nieprawidłowy callback (np. brak `code`, `state`).
- `SESSION_INVALID` – uszkodzona/nieprawidłowa sesja.
- `UNAUTHORIZED` – brak sesji.
- `FORBIDDEN` – brak uprawnień (v2, RBAC).

**UI:**

- `UAlert` (variant `soft`) na poziomie strony loginu / callbacku,
- proste komunikaty typu: „Nie udało się zalogować przez GitHub. Spróbuj ponownie lub użyj innej metody.”
- brak wyciekania szczegółów (stack, ID tokena, dokładne przyczyny providera).

---

## 10. Minimalizm (MVP) vs v2

### 10.1. MVP

- 1 provider (np. GitHub).
- Model `User` + `OAuthAccount` jak wyżej.
- `upsertOAuthUser.usecase.ts` bez zaawansowanego linkowania wielu kont.
- `GET /api/auth/me`, `POST /api/auth/logout`.
- Ochrona API `requireUserSession` + proste middleware klienta.
- UI: przyciski „Zaloguj przez GitHub” + prosty flow redirect/popup.

### 10.2. v2 (rozszerzenia)

- **Multi-provider**:
  - `provider` ENUM lub konwencja stringowa (`github`, `google`, ...).
  - Osobne konfiguracje OAuth dla każdego providera.
- **Linkowanie kont**:
  - Gdy `email` istnieje i jest zweryfikowany, a `User` już istnieje → tworzymy nowy `OAuthAccount` i linkujemy do tego samego `User`.
  - UI: sekcja „Powiązane konta” w ustawieniach użytkownika.
- **RBAC**:
  - `role` w `User` (
    user/admin).
  - Middleware serwerowy `requireRole(event, 'admin')` (oparty o `session.user.role`).
- **Audit / bezpieczeństwo**:
  - Pola `lastLoginAt`, `lastLoginIp` w `User`.
  - Logowanie zdarzeń OAuth (provider, timestamp, IP) do osobnej tabeli.
  - Rate limiting na endpointy auth i new-session.

---

## 11. Checklist wdrożeniowa (MVP → v2)

### 11.1. MVP – krok po kroku

1. **Prisma**

- Dodać modele `User` i `OAuthAccount` wg sekcji 1.
- `npx prisma migrate dev --name add_oauth_models`.

1. **Repozytoria**

- Utworzyć `server/repositories/user.repo.ts` (jeśli jeszcze nie ma metod OAuth) i `oauthAccount.repo.ts`.

1. **Use-case’y domenowe**

- Utworzyć `domain/auth/auth.types.ts` z `OAuthProfile` i `SessionUser`.
- Utworzyć `domain/auth/upsertOAuthUser.usecase.ts`.
- Utworzyć `domain/auth/getCurrentUser.usecase.ts` (opcjonalnie prosty wrapper na `SessionUser`).

1. **Konfiguracja `nuxt-auth-utils**`

- Dodać moduł do `nuxt.config.ts`.
- Ustawić `NUXT_SESSION_PASSWORD` w ENV (dev/prod).
- Skonfigurować provider GitHub wg dokumentacji modułu (clientId, clientSecret, redirect URL).

1. **Endpointy**

- Utworzyć `server/api/auth/me.get.ts` (czyta `getUserSession`).
- Utworzyć `server/api/auth/logout.post.ts` (czyści sesję).
- Skonfigurować `/auth/github` i `/auth/github/callback` wg `nuxt-auth-utils`, w callbacku wywołać `upsertOAuthUser.usecase.ts` i `setUserSession`.

1. **UI / resources**

- Rozszerzyć `app/composables/resources/useAuthResource.ts` o `me()` i `logout()` (jeśli brak lub do ujednolicenia z aktualnym stanem).
- W `useAuth.ts` dodać `loginWithProvider(provider, { returnTo })` (popup/redirect + `session.fetch()`).
- Zaktualizować stronę logowania (`/auth/[slug].vue` lub `login.vue`) o przycisk „Zaloguj przez GitHub”.

1. **Ochrona zasobów**

- Dodać middleware klienta `auth.ts` (lub globalne z warunkiem po ścieżkach).
- Dla nowych endpointów dashboardu użyć `requireUserSession(event)`.

1. **Testy**

- Flow: klik przycisku GitHub → logowanie → redirect → `me()` zwraca usera.
- Brak sesji: wejście na chronioną stronę → redirect do loginu.
- Logout: `POST /api/auth/logout` → brak sesji, `me()` zwraca `user: null`.

### 11.2. v2 – rozszerzenia

1. **Drugi provider (Google)**

- Skonfigurować parametry OAuth dla Google.
- Dodać logikę w `upsertOAuthUser.usecase.ts` dla `provider: 'google'`.

1. **Linkowanie kont**

- Przy nowym OAuthProfile z tym samym `email` i istniejącym userem → tworzyć dodatkowy `OAuthAccount` dla tego samego `userId`.
- Dodać UI „Połącz konto GitHub/Google” w ustawieniach.

1. **RBAC**

- Dodać prosty panel admina z zabezpieczeniem `requireUserSession` + sprawdzanie `session.user.role === 'admin'`.
- Dodać helper `requireRole(event, role)` w domenie lub server utility.

1. **Audit / rate limit**

- Dodać kolumny `lastLoginAt`, `lastLoginIp` do `User`.
- Aktualizować je w callbacku OAuth.
- Dodać prosty rate limiting (np. Nitropack middleware albo zewnętrzny serwis) na `/auth/*` endpointy.

Plan jest celowo minimalistyczny w MVP, ale prowadzi naturalnie do v2 (RBAC, multi-provider, linkowanie kont) bez łamania istniejącej architektury (resources, Valibot, Prisma, domain/server separation, `nuxt-auth-utils` jako warstwa sesji).
