# Project Memory — nuxt-base-starter

Ten plik jest „pamięcią” projektu. Opisuje najważniejsze zasady i decyzje architektoniczne.
Ma zapobiegać chaosowi i przypadkowemu łamaniu konwencji.

## 1) Cel projektu

- Nuxt full-stack starter (jeden framework, jeden język)
- Minimalizm + systemowy porządek
- Spójny UI (Nuxt UI) + animacje (motion-v)
- Content-driven marketing/pages (Nuxt Content)
- Backend przez Nitro + Prisma
- Walidacja przez Valibot

## 2) Warstwy i odpowiedzialności (MUST)

### `app/` — UI

- Vue components, sections, layout, pages
- UI oparte o Nuxt UI
- motion-v tylko w warstwie UI
- Komponenty są **presentational**: props + render
- ❌ Brak fetch w komponentach

### `server/` — HTTP + infrastruktura

- `server/api/*` = kontrolery HTTP (parse → validate → use-case → DTO)
- `server/services/*` = infrastruktura (np. prisma client)
- `server/repositories/*` = dostęp do DB (Prisma)
- ❌ Brak logiki biznesowej w `server/api`

### `domain/` — logika biznesowa

- use-case'y, reguły, mapowania, kontrakty
- nie zależy od Nuxt UI ani od `server/*`
- może zależeć od `shared/*`
- ✅ jeden kręgosłup systemowy

### `shared/` — kontrakty i narzędzia

- `shared/schemas/*` (Valibot)
- `shared/types/*` (DTO)
- utils, error/result types

### `content/` — treść

- marketing pages, blog, portfolio, app config (np. footer)
- PageSchema + sections[]
- ❌ Bez logiki aplikacyjnej i bez DB

## 3) Zasady krytyczne (NO-GO)

1. **Komponenty nie robią fetch.** Fetch tylko w `app/composables/resources/*`
2. `server/api` nie zawiera logiki biznesowej (tylko kontroler).
3. Walidacja inputów zawsze na backendzie (Valibot).
4. Jeden format błędów API (patrz sekcja 6).
5. Sekcje stron renderowane przez `SectionsRenderer` i opakowane `PageSection` (UPageSection).
6. TODO nie w komentarzach i nie „w głowie” → tylko jako pliki w `.cursor/todo/`.

## 4) Formularze (standard)

- Wszystkie formularze używają `useForm()`:
  - values, pending, errors, formError
  - validate (Valibot)
  - handleSubmit (validate → pending → call → map errors)
- Integracja z Nuxt UI `UForm` / `UAuthForm`
- Dokumentacja: `content/docs/useForm.md`

## 5) Sekcje stron (Page Builder)

- Strony content-driven: `PageSchema` zawiera `sections[]`
- Każda sekcja dziedziczy z `SectionBaseSchema`
- `PageSection.vue` jest jedynym wrapperem sekcji (UPageSection)
- `enabled: false` wyłącza sekcję
- Global CTA renderowane tylko gdy strona nie ma własnej CTA (unikamy duplikacji)

## 6) Format odpowiedzi API (kontrakt)

### Sukces

```json
{ "data": <payload>, "meta": { "requestId": "..." } }
```

### Błąd

```json
{
  "error": {
    "code": "SOME_ERROR_CODE",
    "message": "Human readable message",
    "status": 400,
    "requestId": "..."
  }
}
```

### Walidacja (422)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "status": 422,
    "issues": [{ "path": "email", "message": "Invalid email" }],
    "requestId": "..."
  }
}
```

## 7) TODO System (jak zapisujemy zadania)

### Struktura

- Każdy TODO = osobny plik w `.cursor/todo/`
- Nazewnictwo: `YYYY-MM-DD__krotki-temat.md` lub `obszar__temat.md`
- Kategorie:
  - `decision/` — odłożone decyzje architektoniczne
  - `automation/` — przyszłe automatyzacje
  - `debt/` — dług techniczny
  - `feature/` — nowe funkcje (opcjonalnie, preferowane w plans/)

### Co trafia do TODO

- ✅ Decyzje odłożone (np. automatyzacja, refaktoryzacja)
- ✅ Dług techniczny (np. "refaktoryzacja X")
- ✅ Przyszłe automatyzacje (np. generowanie, integracja)
- ❌ Błędy do naprawy (to są taski, nie TODO)
- ❌ Nowe funkcje (lepiej w `.cursor/plans/`)

### Format TODO

Każdy TODO ma sekcje:

- **Status**: planned | blocked | in-progress | done | dropped
- **Area**: ui | content | domain | server | auth | forms | sections | tooling
- **Priority**: low | medium | high
- **Context** — dlaczego to istnieje
- **Problem** — co jest niewygodne / ręczne
- **Goal** — efekt końcowy
- **Scope** — co obejmuje (MVP)
- **Non-goals** — czego nie robimy
- **Acceptance criteria** — kiedy TODO jest zakończone

### Oznaczanie

- `decision/` — decyzje architektoniczne odłożone na później
- `automation/` — automatyzacje (generowanie, integracja)
- `debt/` — dług techniczny do spłacenia

## 8) Jak dodać nową rzecz (checklisty)

### Nowy endpoint

- [ ] Valibot schema w `shared/schemas/*`
- [ ] Kontroler w `server/api/*`
- [ ] Use-case w `domain/*`
- [ ] Repo (jeśli DB) w `server/repositories/*`
- [ ] Resource w `app/composables/resources/*`

### Nowa sekcja

- [ ] Schema dziedziczy z `SectionBaseSchema`
- [ ] Komponent sekcji używa slotów `PageSection`
- [ ] Render przez `SectionsRenderer`

### Nowy formularz

- [ ] Valibot schema w `shared/schemas/*`
- [ ] `useForm()` w komponencie
- [ ] Resource composable dla API
- [ ] Endpoint API z walidacją

## 9) Zasada minimalizmu

- Najpierw MVP, potem rozszerzenia.
- Unikamy „frameworku w frameworku”.
- Granice i zakazy > mnożenie abstrakcji.

## 10) Prisma Migrations

- Migracje tworzone automatycznie przez `prisma migrate dev`
- Po każdej migracji: `prisma generate` (obecnie ręcznie przez `bun run db:generate`)
- **TODO**: Automatyzacja `prisma generate` po migracji (patrz `.cursor/todo/automation/automatyzacja-prisma-generate.md`)
- Nazewnictwo migracji: `akcja_obiekt` w snake_case (np. `add_password_to_user`)

## 11) Auto-importy w Nuxt (zasady)

### Domyślnie włączone

- Auto-importy obejmują funkcje z `vue` (np. `ref`, `watch`, `computed`)
- Nuxt composables (`useFetch`, `useAsyncData`, `useRouter`)
- Komponenty z `components/` (auto-prefixowanie)
- Composables z `composables/`
- Utils z `utils/`

### Wyłączanie auto-importów

- Wyłączenie composables/utils: `imports: { scan: false }` w `nuxt.config`
- Całkowite wyłączenie: `imports: { autoImport: false }`
- Wyłączenie komponentów: `components: { dirs: [] }`

### Dodawanie własnych katalogów

- W `nuxt.config` → `imports.dirs`:
  ```ts
  imports: {
    dirs: ['constants', 'shared/utils', 'shared/types']
  }
  ```
- **Uwaga**: `shared/utils` i `shared/types` wymagają `compatibilityVersion: 4`

### Prefiksy komponentów

- W `nuxt.config` → `components` z prefiksem:
  ```ts
  components: [{ path: 'app-components', prefix: 'App' }]
  ```
- Jeśli definiujesz `components.dirs` ręcznie, nadpisujesz domyślne katalogi

### Auto-import z paczek NPM

- W `nuxt.config` → `imports.presets` dla zewnętrznych paczek
- Przykład: auto-import funkcji z `date-fns`

### Nitro (serwer)

- Nitro ma własny klucz `nitro.imports`
- Typy H3 (`H3Event`, `H3Error`, `EventHandler`) są auto-importowane przez presety

### Ograniczenia

- ❌ Auto-importy **nie działają** w:
  - `nuxt.config.ts`
  - Modułach Nuxt
  - Warstwach (layers)
- ✅ W tych miejscach używaj: importy względne lub `#imports`

### Best practices

- ✅ Używaj auto-importów dla: Vue/Nuxt composables, oczywistych utilities
- ⚠️ Rozważ jawne importy dla: funkcji biznesowych, mniej oczywistych composables
- ⚠️ Duża liczba auto-importów utrudnia refaktoryzację w IDE (zmiana nazwy pliku nie aktualizuje "ukrytych" użyć)
