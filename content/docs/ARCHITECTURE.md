---
title: Architecture Guide
description: Kompletny przewodnik po architekturze projektu, zasadach i decyzjach architektonicznych
---

# Architecture Guide

Ten dokument opisuje architekturę projektu, zasady systemowe i decyzje architektoniczne.

> 💡 **Pełna dokumentacja**: Zobacz [.cursor/remember.md](../../.cursor/remember.md) dla szczegółowej "pamięci projektu" z wszystkimi zasadami i decyzjami.

## Warstwy architektury

Projekt używa warstwowej architektury z jasnymi granicami odpowiedzialności:

### 1. UI Layer (`app/`)

- Vue components, sections, layout, pages
- UI oparte o Nuxt UI
- motion-v tylko w warstwie UI
- Komponenty są **presentational**: props + render
- ❌ **Brak fetch w komponentach**

### 2. Resources Layer (`app/composables/resources/`)

- **Jedyny punkt, gdzie UI wykonuje fetch**
- Adapter między UI a API
- Przykłady: `useAuthResource()`, `useContactResource()`

### 3. API Layer (`server/api/`)

- Kontrolery HTTP
- Flow: parse input → validate (Valibot) → call use-case → return DTO
- ❌ **Brak logiki biznesowej**

### 4. Domain Layer (`domain/`)

- Use-case'y - logika biznesowa
- Types - kontrakty domenowe
- Errors - błędy domenowe
- Result pattern - bezpieczne obsługiwanie błędów
- ✅ Nie zależy od Nuxt UI ani `server/*`

### 5. Repository Layer (`server/repositories/`)

- Prisma queries
- Abstrakcja bazy danych
- Ułatwia testowanie i mockowanie

### 6. Data Layer (Prisma)

- Model bazy danych
- Migracje

## Flow danych

```
UI Component
    ↓ (używa)
Resource Composable (useApiClient)
    ↓ (fetch)
API Endpoint
    ↓ (walidacja Valibot)
Use-case (domain/)
    ↓ (używa)
Repository
    ↓ (Prisma)
Database
```

## Zasady krytyczne (NO-GO)

1. **Komponenty nie robią fetch.** Fetch tylko w `app/composables/resources/*`
2. `server/api` nie zawiera logiki biznesowej (tylko kontroler).
3. Walidacja inputów zawsze na backendzie (Valibot).
4. Jeden format błędów API (patrz sekcja "Format odpowiedzi API").
5. Sekcje stron renderowane przez `SectionsRenderer` i opakowane `PageSection` (UPageSection).
6. TODO nie w komentarzach i nie „w głowie” → tylko jako pliki w `.cursor/todo/`.
   - Wyjątek: komentarze o przyszłej rozbudowie funkcji oznaczamy zawsze jako `TODO: ...`.
   - Dodatkowe tagi dla Todo Tree: `FIXME`, `BUG`, `HACK`, `NOTE`, `OPTIMIZE`, `PERF`, `SECURITY`.

## Format odpowiedzi API (kontrakt)

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

## Standardy

### Formularze

- Wszystkie formularze używają `useForm()` composable
- Integracja z Nuxt UI `UForm` / `UAuthForm`
- Dokumentacja: [useForm.md](./useForm.md)

### Sekcje stron (Page Builder)

- Strony content-driven: `PageSchema` zawiera `sections[]`
- Każda sekcja dziedziczy z `SectionBaseSchema`
- `PageSection.vue` jest jedynym wrapperem sekcji

### Prisma Migrations

- Migracje tworzone automatycznie przez `prisma migrate dev`
- Po każdej migracji: `prisma generate` (obecnie ręcznie przez `bun run db:generate`)
- Nazewnictwo migracji: `akcja_obiekt` w snake_case (np. `add_password_to_user`)

### Auto-importy w Nuxt

- Domyślnie włączone dla Vue/Nuxt composables
- `shared/utils` i `shared/types` wymagają `compatibilityVersion: 4`
- Auto-importy nie działają w `nuxt.config.ts`, modułach Nuxt, warstwach

## Checklisty

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

## Zasada minimalizmu

- Najpierw MVP, potem rozszerzenia.
- Unikamy „frameworku w frameworku”.
- Granice i zakazy > mnożenie abstrakcji.

## Zobacz także

- [.cursor/remember.md](../../.cursor/remember.md) - Pełna "pamięć projektu" z wszystkimi zasadami
- [useForm.md](./useForm.md) - Dokumentacja `useForm` composable
- [README.md](../../README.md) - Ogólna dokumentacja projektu
