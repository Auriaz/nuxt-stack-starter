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
   - Wyjątek: komentarze o przyszłej rozbudowie funkcji oznaczamy zawsze jako `TODO: ...`
     (dla Todo Tree / szybkiej nawigacji).
7. Po zakończeniu działu/planu zawsze przypominamy o uruchomieniu testów (min. unit + API, jeśli dotyczy).

## 4) Formularze (standard)

- Wszystkie formularze używają `useForm()`:
  - values, pending, errors, formError
  - validate (Valibot)
  - handleSubmit (validate → pending → call → map errors)
- Integracja z Nuxt UI `UForm` / `UAuthForm`
- Dokumentacja: `content/docs/useForm.md`

## 4A) UI System (ContactForm-style)

### Layout & spacing

- Sekcja (standard): `py-12 md:py-16` + `space-y-12 md:space-y-16`
- Grid contentowy (desktop): `grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]`
- Mobile: stack (brak osobnych klas, domyślny flow)
- Rytm pionowy: preferuj `space-y-*` zamiast ręcznych `mt-*`

### Typografia (role tekstu)

- Section label: `text-xs md:text-sm uppercase tracking-[0.25em] text-primary`
- H1 marketing: `text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight`
- H2 sekcji: `text-2xl md:text-3xl font-semibold tracking-tight`
- H3 w kartach: `text-lg font-semibold`
- Body: `text-sm md:text-base text-gray-500 dark:text-gray-400`
- Meta: `text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400`
- Gradient (akcent): `bg-linear-to-r from-primary to-sky-500 bg-clip-text text-transparent`

### UCard (kanoniczny wygląd)

- `class`: `border border-gray-200/70 bg-white/80 shadow-sm backdrop-blur-sm dark:bg-gray-900/60 dark:border-gray-800`
- `ui.body`: `p-6 md:p-7 space-y-5`

### Formularze

- Wrapper pola: `space-y-1`
- Label: `block text-sm font-medium`
- Inputy: `UInput` / `UTextarea` bez custom CSS
- Akcje: `UButton` `primary`, `size="lg"`, `block`, `:loading`
- Feedback: `UAlert` `variant="soft"` (success/error)

### Kolor i kontrast

- Akcent tylko w nagłówkach/ikonach, nie jako tło sekcji
- Brak ciężkich efektów (glow/parallax/over‑blur)
- Kontrast zgodny z WCAG (tekst neutralny: `text-gray-500 dark:text-gray-400`)

### Motion (motion-v)

- Tylko `opacity` + `translateY`
- Timing: `duration 0.25–0.4s`, `easeOut`
- Respektuj `prefers-reduced-motion`
- Presety:
  - sectionEnter: opacity 0→1, y 12→0
  - cardEnter: opacity 0→1, y 8→0
  - listStagger: delay 60–80ms
  - alertAppear: opacity 0→1, y 6→0
  - buttonHover: scale 1.01 / y -1 (opcjonalnie)

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

### Todo Tree (VS Code)

- Komentarze rozwojowe oznaczamy tagami:
  - `TODO` (planowane zmiany), `FIXME` (błędy), `BUG` (defekt),
  - `HACK` (obejście), `NOTE` (ważna notatka),
  - `OPTIMIZE` / `PERF` (wydajność), `SECURITY` (bezpieczeństwo).
- Dla większej precyzji używamy metadanych:
  - `TODO[area=auth,priority=high]: ...`
  - `FIXME[area=server,priority=medium]: ...`
- Sposób użycia:
  - zainstaluj rozszerzenie **Todo Tree** (Gruntfuggly.todo-tree),
  - ustaw `todo-tree.general.tags` na powyższe tagi,
  - opcjonalnie włącz `todo-tree.highlights.defaultHighlight` i `todo-tree.highlights.customHighlight`.
- Przykładowe ustawienia (w `settings.json`):
  - `todo-tree.general.tags`: `["TODO","FIXME","BUG","HACK","NOTE","OPTIMIZE","PERF","SECURITY"]`
  - `todo-tree.highlights.defaultHighlight`: `{ "icon": "alert", "type": "text" }`
  - `todo-tree.highlights.customHighlight`:
    - `TODO`: `{ "icon": "check", "type": "line" }`
    - `FIXME`: `{ "foreground": "black", "iconColour": "yellow", "gutterIcon": true }`
    - `SECURITY`: `{ "foreground": "white", "background": "red", "type": "line" }`
- Raporty TODO (przydatne do pracy i LLM):
  - uruchamiaj `bun run todo:report` (cross-platform, Node),
  - opcjonalnie `bun run todo:report:ps1` (PowerShell).

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
