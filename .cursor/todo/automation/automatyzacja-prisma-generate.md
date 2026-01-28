# TODO: Automatyzacja prisma generate po migracji

**Status:** planned  
**Area:** tooling  
**Priority:** medium  
**Created:** 2026-01-25  
**Owner:** <optional>

## Context

Obecnie po każdej migracji Prisma (`bun run db:migrate` lub `prisma migrate dev`) trzeba ręcznie uruchomić `bun run db:generate` (lub `prisma generate`), aby wygenerować Prisma Client z nowymi typami.

Chociaż `prisma migrate dev` czasami automatycznie generuje client, nie zawsze to działa (np. przy użyciu `--create-only` lub gdy coś pójdzie nie tak). To prowadzi do błędów TypeScript, gdzie Prisma Client nie widzi nowych pól dodanych w migracji.

## Problem

- Ręczne uruchamianie `db:generate` po każdej migracji jest łatwe do zapomnienia
- Błędy TypeScript pojawiają się dopiero podczas kompilacji/development
- Brak spójności: czasami `migrate dev` generuje automatycznie, czasami nie
- Developer experience: dodatkowy krok, który można zautomatyzować

## Goal

Zautomatyzować generowanie Prisma Client po każdej migracji, aby:

- Prisma Client był zawsze zsynchronizowany ze schematem
- Nie trzeba było pamiętać o ręcznym uruchomieniu `db:generate`
- Błędy TypeScript związane z brakującymi polami nie występowały

## Scope (MVP)

- Hook/post-script w `prisma migrate dev`, który automatycznie uruchamia `prisma generate`
- Sprawdzenie, czy Prisma ma wbudowane rozwiązanie (np. `postinstall` hook)
- Ewentualnie: custom script, który łączy `migrate dev` + `generate`
- Dokumentacja w README/remember.md o automatycznym generowaniu

## Non-goals

- Nie zmieniamy workflow Prisma (używamy standardowych narzędzi)
- Nie tworzymy własnego narzędzia migracji
- Nie automatyzujemy innych aspektów Prisma (tylko generate po migrate)

## Proposed approach

### Opcja 1: Prisma postinstall hook

Sprawdzić, czy Prisma obsługuje hooki po migracji (np. w `prisma.config.ts` lub `package.json`).

### Opcja 2: Custom script

Utworzyć script w `package.json`:

```json
"db:migrate": "prisma migrate dev && prisma generate"
```

### Opcja 3: Prisma config

Sprawdzić, czy `prisma.config.ts` lub `schema.prisma` ma opcję auto-generate.

### Opcja 4: Git hooks / Husky

Dodać pre-commit hook, który sprawdza, czy `prisma/generated/` jest zsynchronizowany.

**Rekomendacja:** Opcja 2 (custom script) jest najprostsza i najbardziej niezawodna.

## Acceptance criteria

- [ ] Po `bun run db:migrate` automatycznie uruchamia się `prisma generate`
- [ ] Prisma Client jest zawsze zsynchronizowany po migracji
- [ ] Brak błędów TypeScript związanych z brakującymi polami po migracji
- [ ] Dokumentacja zaktualizowana (README.md lub remember.md)
- [ ] Test: utworzenie migracji i weryfikacja, że generate działa automatycznie

## Notes / Links

- Obecny workflow: `bun run db:migrate` → ręcznie `bun run db:generate`
- Prisma docs: https://www.prisma.io/docs/orm/prisma-migrate/workflows
- Plik konfiguracyjny: `prisma.config.ts`
- Package.json scripts: `db:migrate`, `db:generate`
