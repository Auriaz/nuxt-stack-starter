---
name: Naprawa ostrzeżenia o duplikatach komponentów Pricing
overview: Usunięcie starego komponentu Pricing.vue, który powoduje konflikt nazw z nowym SectionsPricing.vue w Nuxt auto-import.
todos: []
---

# Naprawa ostrzeżenia o duplikatach komponentów Pricing

## Analiza ostrzeżeń z terminala

### Główne ostrzeżenie:

```
WARN  Two component files resolving to the same name SectionsPricing:
- C:/Apache24/htdocs/Projects/starters/static/app/components/sections/Pricing/SectionsPricing.vue
- C:/Apache24/htdocs/Projects/starters/static/app/components/sections/Pricing/Pricing.vue
```

**Przyczyna:**

- Nuxt auto-import próbuje zaimportować oba komponenty jako `SectionsPricing`
- `Pricing.vue` w katalogu `Pricing/` jest interpretowany przez Nuxt jako `SectionsPricing` (konwencja nazewnictwa)
- `SectionsPricing.vue` to nowy komponent zgodny z systemem page builder
- `Pricing.vue` to stary komponent, który nie jest używany w kodzie

### Ostrzeżenia Vue Router (nie wymagają naprawy):

```
WARN  [Vue Router warn]: No match found for location with path "/__nuxt_content/content/query?t=..."
```

- To są normalne ostrzeżenia dla wewnętrznych ścieżek API Nuxt Content
- Nie wpływają na działanie aplikacji
- Nie wymagają naprawy

## Plan naprawy

### 1. Usunięcie starego komponentu Pricing.vue

**Plik do usunięcia:** `app/components/sections/Pricing/Pricing.vue`

**Uzasadnienie:**

- Komponent nie jest używany nigdzie w kodzie (sprawdzono grep)
- Został zastąpiony przez `SectionsPricing.vue`, który jest zgodny z systemem page builder
- Powoduje konflikt nazw w Nuxt auto-import
- Stary komponent używa innego interfejsu (nie jest zgodny z `SectionPricing` type)

**Weryfikacja przed usunięciem:**

- ✅ Sprawdzono grep - brak użycia `Pricing.vue` w kodzie
- ✅ `SectionsPricing.vue` jest używany w `SectionsRenderer.vue`
- ✅ `SectionsPricing.vue` jest zgodny z systemem page builder

## Kolejność wykonania

1. Usunięcie `app/components/sections/Pricing/Pricing.vue`

## Oczekiwane rezultaty

- Brak ostrzeżenia o duplikatach komponentów `SectionsPricing`
- Tylko `SectionsPricing.vue` pozostaje w systemie
- Spójność z innymi sekcjami (wszystkie używają prefiksu `Sections`)
- Brak konfliktów w Nuxt auto-import
