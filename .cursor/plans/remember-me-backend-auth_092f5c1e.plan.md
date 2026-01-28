---
name: remember-me-backend-auth
overview: 'Plan wdrożenia pełnej obsługi opcji „Zapamiętaj mnie” w module logowania: odczyt flagi remember w login.post.ts, sterowanie czasem życia sesji w setUserSession oraz ewentualny dodatkowy cookie remember_me.'
todos:
  - id: remember-config
    content: Dodać runtimeConfig.auth.rememberMeDays i zmienną ENV AUTH_REMEMBER_ME_DAYS w nuxt.config.ts
    status: completed
  - id: login-endpoint-remember
    content: Rozszerzyć server/api/auth/login.post.ts o odczyt remember i przekazanie maxAge/remember_me do setUserSession/cookies
    status: completed
  - id: remember-middleware-v2
    content: (Opcjonalne) Rozszerzyć server/middleware/auth.ts o logikę bazującą na cookie remember_me
    status: cancelled
isProject: false
---

## Cel

Pełna, spójna obsługa opcji **„Zapamiętaj mnie”** w module logowania:

- front już wysyła `remember` → backend ma ją respektować,
- przy `remember=true` sesja powinna żyć dłużej (np. 30 dni), przy `false` być sesją przeglądarkową / krótką,
- cały mechanizm ma pozostać zgodny z nuxt-auth-utils i obecnym middleware `server/middleware/auth.ts`.

---

## 1. Przegląd aktualnego przepływu logowania

- **Schemat i typy**:
  - `LoginInputSchema` w `[shared/schemas/auth.ts](shared/schemas/auth.ts)`: pola `email`, `password`, już rozszerzone o `remember` (union string/boolean).
  - Typ `LoginInput` w `[domain/auth/auth.types.ts](domain/auth/auth.types.ts)` ma `remember?: boolean`.
- **Komponent formularza**:
  - `[app/components/Auth/Login/Form/AuthLoginForm.vue](app/components/Auth/Login/Form/AuthLoginForm.vue)` używa `UAuthForm` i `useForm(LoginInputSchema)`, wysyła `values` do `auth.login({ ...values, remember: !!remember })`.
- **Warstwa aplikacyjna**:
  - `[app/composables/useAuth.ts](app/composables/useAuth.ts)`: funkcja `login(input: LoginInput)` wywołuje `authResource.login`, następnie `session.fetch()` i robi redirect do dashboardu – _obecnie ignoruje `remember_`.
- **Endpoint backendowy**:
  - `[server/api/auth/login.post.ts](server/api/auth/login.post.ts)`: waliduje `LoginInputSchema`, wywołuje `loginUseCase`, po sukcesie ustawia sesję przez `setUserSession(event, { user })`. _Nie używa `remember` ani nie zmienia czasu życia sesji_.

Wniosek: aby „Zapamiętaj mnie” faktycznie działało, potrzebne są zmiany w endpointzie `/api/auth/login` (i opcjonalnie w `useAuth` tylko, jeśli chcemy np. dodatkową logikę frontową).

---

## 2. Założenia dla pamiętania sesji

- **Zachowanie docelowe**:
  - `remember = false` lub brak zaznaczenia → standardowa, krótkotrwała sesja (domyślne ustawienia nuxt-auth-utils – cookie sesyjne lub krótki `maxAge`).
  - `remember = true` → sesja trwa np. 30 dni (konfigurowalne), tzn. cookie sesji ma dłuższy `maxAge`.
- **Konfiguracja**:
  - Dodać zmienną środowiskową, np. `AUTH_REMEMBER_ME_DAYS=30` (lub sekcję w `runtimeConfig`), żeby łatwo sterować długością.
- **Bezpieczeństwo**:
  - Cookie z dłuższym `maxAge` nadal **HttpOnly + Secure** (domyślne zachowanie nuxt-auth-utils), bez ujawniania w JS.
  - Brak dodatkowych tokenów w localStorage.

---

## 3. Zmiany w endpointzie `/api/auth/login` (server/api/auth/login.post.ts)

1. **Odczytanie flagi remember** z już zwalidowanego inputu:

- po `safeParse(LoginInputSchema, body)` (i `inputResult.success`) utworzyć zmienną:
- dalej do use-case przekazywać `loginInput` (bez pola remember), bo domena logowania nie musi o nim wiedzieć.

1. **Wywołanie use-case bez zmian**:

- `const useCaseResult = await loginUseCase(loginInput, userRepository)` – bez `remember`.

1. **Sterowanie czasem życia sesji przy setUserSession**:

- Sprawdzić API `setUserSession` z nuxt-auth-utils; zazwyczaj przyjmuje dodatkowy obiekt opcji z `maxAge` (seconds) lub analogiczną konfiguracją.
- Logika:
- `rememberMeMaxAgeInSeconds` wyliczany np. z `runtimeConfig.auth.rememberMeDays * 24 * 60 * 60` (z fallbackiem na wartość domyślną, np. 30 dni).

1. **Konfiguracja runtime**:

- W `[nuxt.config.ts](nuxt.config.ts)` dodać wpis do `runtimeConfig`:
- W endpointzie pobrać `useRuntimeConfig()` i policzyć `rememberMeMaxAgeInSeconds` na tej podstawie.

Dzięki temu cała decyzja o długości sesji jest podejmowana **centralnie w login.post.ts**.

---

## 4. Opcjonalny cookie `remember_me` (jeśli nuxt-auth-utils nie daje maxAge)

Jeśli `setUserSession` nie pozwala sterować `maxAge` (lub chcesz bardziej jawny mechanizm):

1. **Utworzyć dodatkowe cookie** w login.post.ts:

```ts
if (shouldRemember) {
  const rememberMeMaxAge = rememberMeDays * 24 * 60 * 60
  setCookie(event, 'remember_me', '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: rememberMeMaxAge,
    path: '/',
  })
} else {
  deleteCookie(event, 'remember_me')
}
```

1. **W middleware `server/middleware/auth.ts**` (opcjonalny krok v2):

- Gdy `getUserSession(event)` zwróci brak sesji, ale cookie `remember_me` jest obecne, można:
  - albo pozwolić na „miękki” dostęp tylko do części API,
  - albo wywołać dodatkowy mechanizm odtwarzania sesji (np. po stronie nuxt-auth-utils, jeśli udostępnia taki hook).
- Dla MVP rekomendowane jest **nie ruszać middleware** – cookie `remember_me` będzie tylko sygnałem na przyszłość, a kluczowy efekt (dłuższy `maxAge` sesji) i tak uzyskamy przez opcje `setUserSession`.

---

## 5. Spójność z frontem i UX

- **Frontend** już robi:
  - `remember` checkbox w `AuthLoginForm`,
  - mapowanie na `boolean` przed wywołaniem `auth.login`.
- **UX** nie wymaga zmian: użytkownik nadal widzi prosty checkbox „Zapamiętaj mnie”, a logika sesji działa „magicznie” w tle.

---

## 6. Krótka checklista wdrożenia

1. W `[shared/schemas/auth.ts](shared/schemas/auth.ts)` – (już zrobione) upewnić się, że `remember` akceptuje string/boolean.
2. W `[app/components/Auth/Login/Form/AuthLoginForm.vue](app/components/Auth/Login/Form/AuthLoginForm.vue)` – (już zrobione) mapować `remember` na `boolean` i przekazywać do `auth.login`.
3. W `[nuxt.config.ts](nuxt.config.ts)`: dodać `runtimeConfig.auth.rememberMeDays` z domyślną wartością.
4. W `[server/api/auth/login.post.ts](server/api/auth/login.post.ts)`:

- wyciągnąć `remember` z `inputResult.output`,
- wyliczyć `shouldRemember`,
- pobrać `rememberMeDays` z `runtimeConfig`,
- przekazać odpowiedni `maxAge`/opcje do `setUserSession` **lub** ustawiać dodatkowy cookie `remember_me`.

1. (Opcjonalne v2) W `[server/middleware/auth.ts](server/middleware/auth.ts)`: rozszerzyć logikę o odczyt `remember_me` i ewentualne automatyczne odtwarzanie/przedłużanie sesji.

Taki plan **zamyka pełny cykl „Zapamiętaj mnie”**: od checkboxa w UI, przez walidację Valibot, po realne wydłużenie życia sesji po stronie backendu, z zachowaniem obecnej architektury (thin controllers, logika w domenie, nuxt-auth-utils jako warstwa sesji).
