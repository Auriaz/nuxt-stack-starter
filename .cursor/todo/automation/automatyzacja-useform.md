# TODO: Automatyzacja useForm — generowanie formularzy

**Status:** planned  
**Area:** tooling | forms  
**Priority:** low  
**Created:** 2026-01-25  
**Owner:** <optional>

## Context

Obecnie `useForm` composable działa poprawnie i jest używany w 4 formularzach auth (Login, Register, ForgotPassword, ResetPassword). Proces tworzenia nowego formularza jest manualny:

1. Utworzenie Valibot schema w `shared/schemas/*`
2. Utworzenie TypeScript type w `shared/types/*`
3. Utworzenie komponentu Vue z `useForm()`
4. Utworzenie resource composable w `app/composables/resources/*`
5. Utworzenie endpointu API w `server/api/*`
6. Utworzenie use-case w `domain/*` (jeśli potrzebny)

## Problem

- Duplikacja kodu przy tworzeniu podobnych formularzy
- Ryzyko pominięcia kroków (np. brak walidacji, brak resource)
- Czasochłonność przy tworzeniu wielu formularzy (np. dashboard, admin panel)
- Brak spójności między formularzami (różne wzorce)

## Goal

Zautomatyzować proces tworzenia formularzy, zachowując spójność z architekturą projektu. Automatyzacja powinna generować:

- Valibot schema + TypeScript type
- Komponent Vue z `useForm()` i integracją Nuxt UI
- Resource composable
- Endpoint API z walidacją
- Use-case (opcjonalnie)

## Scope (MVP)

- Generator CLI / script, który:
  - Przyjmuje nazwę formularza i pola (interaktywny input)
  - Generuje pliki zgodnie z architekturą projektu
  - Używa template'ów opartych o istniejące formularze auth
  - Integruje się z `useForm`, Valibot, Nuxt UI
- Template'y dla:
  - Prosty formularz (np. Contact)
  - Formularz auth (Login/Register)
  - Formularz z prefill (ResetPassword)
- Walidacja generowanych plików (sprawdzenie spójności)

## Non-goals

- Nie zastępujemy `useForm` — generator używa istniejącego composable
- Nie tworzymy "frameworku w frameworku" — generator to narzędzie, nie abstrakcja
- Nie automatyzujemy logiki biznesowej — use-case'y pozostają ręczne
- Nie generujemy testów automatycznie (możliwe jako rozszerzenie)

## Proposed approach

### Konwencje

- Generator jako script w `scripts/` lub osobne narzędzie
- Template'y w `.cursor/templates/forms/`
- Konfiguracja przez plik `.cursor/generator.config.ts` (opcjonalnie)

### Pliki do wygenerowania

1. `shared/schemas/{formName}.ts` — Valibot schema
2. `shared/types/{formName}.ts` — TypeScript type (InferOutput)
3. `app/components/{FormName}/Form/{FormName}Form.vue` — Komponent Vue
4. `app/composables/resources/use{FormName}Resource.ts` — Resource composable
5. `server/api/{formName}/post.ts` — Endpoint API
6. `domain/{formName}/{action}.usecase.ts` — Use-case (opcjonalnie)

### Template'y

- `simple-form.vue.template` — podstawowy formularz
- `auth-form.vue.template` — formularz autoryzacji
- `prefill-form.vue.template` — formularz z prefill

### Integracja

- Generator używa istniejących wzorców z formularzy auth
- Zachowuje spójność z `useForm`, Valibot, Nuxt UI
- Generuje kod zgodny z zasadami z `.cursor/remember.md`

## Acceptance criteria

- [ ] Generator CLI działa i generuje wszystkie wymagane pliki
- [ ] Wygenerowane formularze działają poprawnie z `useForm`
- [ ] Wygenerowane pliki są zgodne z architekturą projektu
- [ ] Dokumentacja generatora w `content/docs/generator.md`
- [ ] Testy manualne: wygenerowanie 2-3 formularzy i weryfikacja działania

## Notes / Links

- Przykłady formularzy: `app/components/Auth/*/Form/*.vue`
- Dokumentacja useForm: `content/docs/useForm.md`
- Architektura: `.cursor/remember.md`
- Możliwe narzędzia: Plop.js, Yeoman, custom script (Node.js/Bun)
