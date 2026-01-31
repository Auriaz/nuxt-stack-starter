---
name: Dashboard Settings Page
overview: 'Plan architektury podstrony ustawień aplikacji pod `/dashboard/settings?tab=<id>`: audyt realnych funkcji, model danych UserSettings (MVP), API GET/PATCH settings/me, warstwy domain/server/app, taby z query param, uprawnienia settings.read/update oraz checklista MVP do v2.'
todos: []
isProject: false
---

# Plan: Podstrona ustawień `/dashboard/settings`

## 0) Zgodność z kontekstem

- **Nuxt 4 full-stack**, Nitro, Prisma, Valibot.
- **Brak fetch w komponentach** — tylko `app/composables/resources/useSettingsResource.ts`.
- **server/api** = parse → Valibot → use-case → DTO; logika w `domain/settings/*`.
- **Auth:** middleware auth + opcjonalnie `requirePermission(event, PERMISSIONS.SETTINGS_READ)` / `SETTINGS_UPDATE`.
- **UX:** wzorzec jak [app/pages/dashboard/profile/index.vue](app/pages/dashboard/profile/index.vue): taby z `route.query.tab`, `activeTab` ↔ URL, sekcje z UCard + UForm + useForm, UAlert soft, skeletony, motion-v (subtelne wejście).
- **Layout:** strona w `NuxtLayout name="dashboard"` + `DashboardPanel` (zgodnie z [.cursor/remember.md](.cursor/remember.md) sekcja 5A).

---

## 1) Audyt aplikacji — realne ustawienia

Na podstawie przeglądu:

| Obszar                 | Realne opcje                                                        | Źródło / uwagi                                                                                                                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **General**            | Język (locale), strefa czasowa (opcjonalnie)                        | i18n: pl/en w [nuxt.config.ts](nuxt.config.ts); timezone brak w User — do dodania w UserSettings.                                                                                                                                                 |
| **Notifications**      | Powiadomienia e-mail (on/off), opcjonalnie kanały (in-app już jest) | Model [Notification](prisma/schema.prisma) istnieje; brak preferencji „email przy nowej wiadomości” — nowe pole w User/UserSettings.                                                                                                              |
| **Privacy**            | Pokazywanie e-maila (showEmail)                                     | Już w [User.showEmail](prisma/schema.prisma) i [PATCH /api/profile/privacy](server/api/profile/privacy.patch.ts). W Settings: albo link do profilu, albo jeden formularz agregujący (reuse API profile/privacy).                                  |
| **Security**           | 2FA, sesje, hasło                                                   | Już w profilu: [DashboardProfileSecurity2FA](app/components/Dashboard/Profile/Security/DashboardProfileSecurity2FA.vue), sessions, password. W Settings: przekierowanie do `/dashboard/profile?tab=security` lub karta „Szybki dostęp” z linkami. |
| **Appearance**         | Motyw (system / light / dark)                                       | Obecnie [useColorMode](app/components/Dashboard/Panel/DashboardPanel.vue) (client-only). Persystencja po stronie użytkownika wymaga pola w DB (np. `appearanceTheme` w UserSettings).                                                             |
| **Integrations**       | OAuth (GitHub, Google), API keys                                    | [OAuthAccount](prisma/schema.prisma) istnieje; lista połączeń + „Odłącz” to realne MVP; API keys — v2.                                                                                                                                            |
| **Team**               | Brak modelu Team                                                    | v2: pominąć w MVP lub empty state „W przyszłości”.                                                                                                                                                                                                |
| **Billing / Advanced** | Brak                                                                | v2.                                                                                                                                                                                                                                               |

**Propozycja tabów MVP (realne):**

- **general** — locale (select pl/en), timezone (select, opcjonalnie); jedna karta „Język i region”.
- **notifications** — emailNotifications (toggle), ewentualnie „Powiadomienia w aplikacji” (info: już działają); jedna karta.
- **privacy** — showEmail (toggle); reuse `PATCH /api/profile/privacy` lub jeden endpoint settings (patrz niżej).
- **security** — karta z linkami: „Zarządzanie hasłem”, „2FA”, „Sesje” → `/dashboard/profile?tab=security` / `tab=account` (bez duplikacji logiki).
- **appearance** — appearanceTheme (radio/select: system | light | dark); zapis w UserSettings + po zapisie ustawienie `useColorMode().preference`.
- **integrations** — lista OAuth (provider, email, „Odłącz”); GET z User, PATCH delete OAuth — jeśli jest endpoint; inaczej tylko lista + TODO na odłączanie.

Taby **team**, **billing**, **advanced** — v2: w nawigacji tabów z `disabled` lub ukryte, z placeholderem „Wkrótce” po wejściu (np. przez deep link).

---

## 2) Taby — routing i definicja

- **URL:** `/dashboard/settings?tab=<id>`.
- **Domyślny tab:** `general` (gdy brak `tab` lub nieprawidłowy).
- **Tab id:** `general` | `notifications` | `privacy` | `security` | `appearance` | `integrations` | (v2: `team` | `billing` | `advanced`).

Każdy tab: `id`, `label`, `icon` (np. heroicons), opcjonalnie `permission` (np. `settings.read` dla wszystkich, team tylko z `team.manage` w v2), opcjonalnie `disabled: true` (v2).

- **Synchroniczacja z URL:** `activeTab` z `route.query.tab`; przy zmianie `activeTab` — `router.replace({ query: { ...route.query, tab: activeTab } })`. Wzorzec jak w profile: `getTabFromQuery()`, `watch(route.query.tab)`, `watch(activeTab)` → update query.
- **Empty state:** dla tabów v2 (team, billing, advanced) — jedna karta z tekstem „Ta sekcja będzie dostępna w przyszłości” i ewentualnie link do `.cursor/todo/`.

---

## 3) UI/UX — struktura strony (jak profile)

- **Layout:** [app/layouts/dashboard.vue](app/layouts/dashboard.vue) (slot); strona: `<NuxtLayout name="dashboard"><DashboardPanel title="Ustawienia" icon="...">...</DashboardPanel></NuxtLayout>`.
- **Header:** tytuł „Ustawienia”, krótki opis; breadcrumbs: Dashboard → Ustawienia (opcjonalnie).
- **Nawigacja tabów:** lista tabów (np. przyciski lub UTabs) z ikoną + label; aktywny z `route.query.tab`; klik → zmiana `activeTab` → aktualizacja URL.
- **Zawartość:** dla każdego taba `v-show="activeTab === 'general'"` (lub jeden komponent na tab z przekazanym `tabId`). Wewnątrz: **settings blocks** = UCard z tytułem + opisem + UForm + useForm + przycisk „Zapisz” (loading) + UAlert success/error. Opcjonalnie „Reset do domyślnych”.
- **Motion-v:** wejście kart (np. v-motion-fade, stagger 50 ms); bez mocnych animacji przy przełączaniu tabów.
- **Skeletony:** podczas ładowania GET settings — placeholdery kart zamiast formularzy.

Komponenty proponowane:

- `app/pages/dashboard/settings/index.vue` — strona z tabami i logiką `activeTab`/query.
- `app/components/Dashboard/Settings/` — po jednym komponencie na tab (np. `DashboardSettingsGeneral.vue`, `DashboardSettingsNotifications.vue`, …), każdy z własnymi kartami (UCard) i useForm; dane z `useSettingsResource` / `useProfile` (privacy) przekazywane przez props lub composable.

---

## 4) Model danych (Prisma)

**MVP — rekomendacja: osobna tabela `UserSettings` (1:1 User).**

Uzasadnienie: User nie jest zaśmiecany wieloma kolumnami; łatwo dodawać nowe opcje (np. v2) bez migracji User; jasna granica „ustawienia aplikacji” vs „dane profilu”.

```prisma
model UserSettings {
  id                Int      @id @default(autoincrement())
  userId            Int      @unique
  locale            String?  @default("pl")   // pl | en
  timezone          String?  @default("Europe/Warsaw")
  appearanceTheme   String?  @default("system") // system | light | dark
  emailNotifications Boolean @default(true)
  marketingEmails   Boolean  @default(false)   // opcjonalnie
  createdAt         DateTime @updatedAt
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
// W User: userSettings UserSettings?
```

- **Privacy (showEmail):** pozostawić w [User.showEmail](prisma/schema.prisma); w UI Settings tab „Privacy” tylko toggle showEmail — zapis przez istniejący `PATCH /api/profile/privacy` (bez duplikacji).
- **v2 (elastyczność):** opcjonalnie `SettingsKV` (key-value + JSON schema) lub `TeamSettings` dla zespołów; na MVP nie wymagane.

---

## 5) Kontrakty API

**Endpointy MVP**

| Metoda | Ścieżka            | Opis                                                                                                                                 | Auth  | Permission                   |
| ------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ----- | ---------------------------- |
| GET    | `/api/settings/me` | Zwraca SettingsDTO (locale, timezone, appearanceTheme, emailNotifications, marketingEmails) + ewent. showEmail z User (do agregacji) | Sesja | settings.read lub zalogowany |
| PATCH  | `/api/settings/me` | Częściowa aktualizacja (Valibot: tylko przekazane pola)                                                                              | Sesja | settings.update              |

- **GET /api/settings/me**
  - Odpowiedź: `{ data: SettingsDTO }`.
  - SettingsDTO: `{ locale?, timezone?, appearanceTheme?, emailNotifications?, marketingEmails?, showEmail? }` (showEmail z User dla spójności widoku).
  - Jeśli brak wiersza UserSettings — zwrócić domyślne wartości (z schema defaults) i ewentualnie stworzyć wiersz przy pierwszym PATCH.
- **PATCH /api/settings/me**
  - Body: częściowy obiekt (np. `{ locale: 'en', appearanceTheme: 'dark' }`).
  - Valibot: `SettingsUpdateSchema` (wszystkie pola opcjonalne, enumy gdzie trzeba).
  - Nie zmieniać `showEmail` w PATCH settings — do tego pozostawić `PATCH /api/profile/privacy`. Alternatywa: PATCH settings przyjmuje też `showEmail` i wywołuje wewnętrznie update Privacy (jedna „brama”); wtedy jeden formularz Privacy w Settings.

**Walidacja:** [shared/schemas/settings.ts](shared/schemas/) — np. `SettingsUpdateSchema`: object z optional pipe string/integer, picklist dla locale/appearanceTheme.

**Błędy:** 401 (brak sesji), 403 (brak uprawnienia), 422 (VALIDATION_ERROR + issues), 500. Format jak w [content/docs/ARCHITECTURE.md](content/docs/ARCHITECTURE.md).

**Opcjonalnie (v2):**

- `GET /api/team/:id/settings`, `PATCH /api/team/:id/settings` — gdy pojawi się model Team.

---

## 6) Domain / repositories / services

- **domain/settings/**
  - `getUserSettings.usecase.ts` — przyjmuje userId, repository; zwraca Result; czyta UserSettings + User.showEmail.
  - `updateUserSettings.usecase.ts` — przyjmuje userId, payload (partial), repository; aktualizuje tylko przekazane pola; nie zmienia showEmail (albo zmienia przez userRepo.updatePrivacy jeśli payload zawiera showEmail — wtedy jeden kontrakt).
- **server/repositories/**
  - `settings.repo.ts`: `findByUserId(userId)`, `upsert(userId, data)` (create lub update UserSettings).
  - User.showEmail — już w [user.repo.ts](server/repositories/user.repo.ts) (updatePrivacy).
- **shared/schemas/settings.ts** — Valibot: `SettingsUpdateSchema`, ewent. `SettingsDTO` schema do walidacji odpowiedzi (opcjonalnie).
- **shared/types/settings.ts** (lub w [shared/types/index.ts](shared/types/index.ts)) — typy `SettingsDTO`, `SettingsUpdateInput`.

---

## 7) Frontend — resources i composables

- **app/composables/resources/useSettingsResource.ts**
  - `getMySettings(): Promise<SettingsDTO>` — GET /api/settings/me.
  - `updateMySettings(payload: SettingsUpdateInput): Promise<SettingsDTO>` — PATCH /api/settings/me.
  - Bez fetch w komponentach; wywołania tylko z tej warstwy.
- **useSettings (composable stanu, opcjonalnie):**
  - `settings` (useState), `isLoading`, `error`; `fetchSettings()`, `updateSettings(payload)`; wywołania resource wewnątrz.
  - Inicjalizacja przy wejściu na stronę (onMounted) lub w layoutcie.
- **useSettingsTabs (opcjonalnie):**
  - Definicja tabów (id, label, icon, permission); helper `isTabVisible(permission)`; domyślny tab `general`; zgodność z `route.query.tab`.
- **Formularze:** każdy blok w Settings używa **useForm()** (values, pending, errors, formError, handleSubmit); zapis przez `updateMySettings` lub `updatePrivacy`; sukces: toast + odświeżenie danych; błędy mapowane na pola (422 issues).

---

## 8) Uprawnienia i admin

- **Nowe klucze w [shared/permissions.ts](shared/permissions.ts):**
  - `SETTINGS_READ: 'settings.read'`, `SETTISSIONS_UPDATE: 'settings.update'`.
  - W seedzie: przypisać oba roli `user` i `admin` (każdy zarządza swoimi ustawieniami).
- **Zasady:**
  - **User-level:** GET/PATCH własnych ustawień — wymagane `settings.read` / `settings.update` (lub po prostu zalogowany; wtedy sprawdzenie po stronie serwera: `requireUserSession` + userId z sesji = właściciel zasobu).
  - **Admin-level (v2):** np. `admin.settings.manage` — edycja cudzych ustawień; na MVP nie wymagane.
  - **Team-level (v2):** `team.settings.read` / `team.settings.update` gdy pojawią się zespoły.
- **UI:** jeśli tab wymaga uprawnienia (np. team w v2), nie pokazywać go w liście tabów, chyba że użytkownik ma uprawnienie. Dla tabów „coming soon” — pokazać, ale zawartość: empty state z komunikatem (bez udawania działającej funkcji).

---

## 9) Integracje i v2

- **Integrations (tab):** lista OAuth z [OAuthAccount](prisma/schema.prisma); ewent. endpoint „odłącz konto” (DELETE lub PATCH). API keys — v2.
- **Security:** linki do istniejących sekcji profilu (hasło, 2FA, sesje); bez duplikacji logiki.
- **Notifications (v2):** rozszerzenie o kanały (push, webhook), preferencje per typ — osobny model lub JSON w UserSettings.
- **Team / Billing / Advanced:** placeholder + plik w `.cursor/todo/` (np. `feature/settings-team-billing.md`) z opisem scope’u v2.

---

## 10) Deliverables — podsumowanie

### 1) Lista tabów + realne opcje

| Tab                       | Opcje MVP                                                  | Uwagi                            |
| ------------------------- | ---------------------------------------------------------- | -------------------------------- |
| general                   | locale (pl/en), timezone                                   | UserSettings                     |
| notifications             | emailNotifications (toggle), marketingEmails (opcjonalnie) | UserSettings                     |
| privacy                   | showEmail (toggle)                                         | User; API profile/privacy        |
| security                  | Linki do profilu (hasło, 2FA, sesje)                       | Brak nowych pól                  |
| appearance                | appearanceTheme (system/light/dark)                        | UserSettings + sync useColorMode |
| integrations              | Lista OAuth, „Odłącz” (jeśli endpoint)                     | OAuthAccount                     |
| team / billing / advanced | Empty state                                                | v2                               |

### 2) Model Prisma (MVP + v2)

- **MVP:** tabela `UserSettings` 1:1 z User (locale, timezone, appearanceTheme, emailNotifications, marketingEmails); showEmail pozostaje w User.
- **v2:** opcjonalnie SettingsKV lub TeamSettings; rozszerzenie UserSettings o kolejne pola bez zmiany User.

### 3) API

- **GET /api/settings/me** → `{ data: SettingsDTO }`; wymagana sesja (i opcjonalnie settings.read).
- **PATCH /api/settings/me** → body częściowy (Valibot), zwrot pełnego SettingsDTO; wymagane settings.update (lub zalogowany).
- Privacy: nadal **PATCH /api/profile/privacy** dla showEmail (albo PATCH settings przyjmuje showEmail i wywołuje updatePrivacy wewnętrznie).

### 4) Struktura plików

- **server/api/settings/me.get.ts**, **me.patch.ts**
- **server/repositories/settings.repo.ts**
- **domain/settings/getUserSettings.usecase.ts**, **updateUserSettings.usecase.ts**
- **shared/schemas/settings.ts**, **shared/types/settings.ts** (lub w index)
- **app/composables/resources/useSettingsResource.ts**
- **app/pages/dashboard/settings/index.vue**
- **app/components/Dashboard/Settings/** — komponenty per tab (General, Notifications, Privacy, Security, Appearance, Integrations).

### 5) UI

- Strona: NuxtLayout + DashboardPanel, header z tytułem i opisem, nawigacja tabów (query-driven), sekcje z v-show per tab.
- Komponenty: UCard, UForm, useForm, UButton (Zapisz), UAlert (soft), skeleton przy ładowaniu.
- Motion-v: v-motion-fade na kartach, krótki stagger.

### 6) Permissions

- `settings.read`, `settings.update` w shared/permissions + seed (user, admin).
- Endpointy: requireUserSession + sprawdzenie właściciela (userId z sesji); opcjonalnie requirePermission(SETTINGS_READ/UPDATE).
- Tabów nie ukrywać po uprawnieniach dla MVP (wszyscy zalogowani); v2: team tab tylko z team.settings.read.

### 7) Checklista wdrożenia

**MVP:**

1. Dodać model UserSettings w Prisma + migracja; relacja User.
2. Dodać permissions settings.read, settings.update + seed.
3. shared/schemas/settings.ts (Valibot) + shared/types (SettingsDTO, SettingsUpdateInput).
4. settings.repo.ts (findByUserId, upsert).
5. domain/settings: getUserSettings, updateUserSettings.
6. GET /api/settings/me, PATCH /api/settings/me (requireUserSession, Valibot, use-case, DTO).
7. useSettingsResource (getMySettings, updateMySettings).
8. Strona /dashboard/settings z tabami (query tab), definicja tabów, activeTab ↔ URL.
9. Komponenty Dashboard/Settings per tab (General, Notifications, Privacy, Security, Appearance, Integrations) z UCard + useForm + Zapisz.
10. Link „Ustawienia” w menu dashboardu (np. w [app/utils/dashboardNavigation.ts](app/utils/dashboardNavigation.ts)).
11. Tab Privacy: użycie istniejącego updatePrivacy (showEmail); tab Security: linki do profile?tab=security/account.
12. Appearance: po PATCH ustawienie useColorMode().preference na kliencie.

**v2:**

- Team tab + TeamSettings (gdy model Team); billing; advanced; SettingsKV dla elastycznych kluczy; admin.settings.manage; rozszerzenie notyfikacji (kanały, push).
