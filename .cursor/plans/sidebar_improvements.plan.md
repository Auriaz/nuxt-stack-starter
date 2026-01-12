# Plan ulepszeń panelu bocznego (UPageAside) - Blog Post

## Analiza obecnej struktury

### Obecne elementy:

1. **TOC (Table of Contents)** - spis treści z linkami
2. **Sekcja "Udostępnij"** - 4 duże przyciski (Twitter, Facebook, LinkedIn, Kopiuj link)
3. **Powiązane artykuły** - carousel z obrazkami (collapsible)

### Zidentyfikowane problemy:

1. **Wizualne:**
   - Brak wyraźnego podziału sekcji (wszystko w jednym kontenerze)
   - Przyciski social media zajmują zbyt dużo miejsca (4 pełne przyciski)
   - Brak kart/sekcji wizualnie oddzielających elementy
   - Carousel w panelu bocznym może być zbyt obszerny

2. **Funkcjonalne:**
   - Wszystko w jednym `sticky top-4` - może być problem gdy panel jest za długi
   - Brak max-height dla TOC - przy długich artykułach TOC może być za długi
   - Brak scrollowania dla długich sekcji
   - Carousel może nie być optymalny dla panelu bocznego (lepsza lista)

3. **UX:**
   - Przyciski social media powinny być bardziej kompaktowe (tylko ikony lub mniejsze)
   - Powiązane artykuły w carousel mogą być trudne do nawigacji w wąskim panelu
   - Brak możliwości szybkiego skopiowania linku (tylko przycisk)

## Proponowane ulepszenia

### 1. Struktura wizualna

**Użyć kart (UCard) dla każdej sekcji:**

- TOC w karcie z nagłówkiem
- Social media w karcie z kompaktowymi przyciskami
- Powiązane artykuły w karcie jako lista (nie carousel)

**Korzyści:**

- Lepsza wizualna separacja
- Czytelniejszy układ
- Łatwiejsze w utrzymaniu

### 2. TOC (Table of Contents)

**Zmiany:**

- Dodać nagłówek "Spis treści"
- Dodać `max-height` (np. `max-h-96`) z `overflow-y-auto`
- Dodać `sticky top-4` tylko dla TOC (nie całego kontenera)
- Możliwość zwijania/rozwijania (UCollapsible)

**Kod:**

```vue
<UCard>
  <template #header>
    <h3 class="text-sm font-semibold">Spis treści</h3>
  </template>
  <div class="max-h-96 overflow-y-auto">
    <UContentToc ... />
  </div>
</UCard>
```

### 3. Social Media - kompaktowa wersja

**Zmiany:**

- Zmniejszyć przyciski do wariantu `ghost` lub `subtle` z tylko ikonami
- Użyć grid layout (2x2) zamiast kolumny
- Dodać tooltip z nazwą platformy
- Dodać toast notification po skopiowaniu linku

**Kod:**

```vue
<UCard>
  <template #header>
    <h3 class="text-sm font-semibold">Udostępnij</h3>
  </template>
  <div class="grid grid-cols-2 gap-2">
    <UButton icon="i-simple-icons-x" variant="ghost" size="sm" />
    <UButton icon="i-simple-icons-facebook" variant="ghost" size="sm" />
    <UButton icon="i-simple-icons-linkedin" variant="ghost" size="sm" />
    <UButton icon="i-lucide-link" variant="ghost" size="sm" />
  </div>
</UCard>
```

### 4. Powiązane artykuły - lista zamiast carousel

**Zmiany:**

- Zastąpić carousel prostą listą artykułów
- Każdy artykuł jako kompaktowa karta z obrazkiem i tytułem
- Maksymalnie 3-5 artykułów
- Hover effect dla lepszej interaktywności

**Kod:**

```vue
<UCard>
  <template #header>
    <h3 class="text-sm font-semibold">Powiązane artykuły</h3>
  </template>
  <div class="space-y-3">
    <NuxtLink v-for="item in links" :to="item.path" class="block">
      <div class="flex gap-3 group">
        <div class="w-20 h-20 rounded overflow-hidden shrink-0">
          <NuxtImg :src="item.image?.src" :alt="item.title" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold line-clamp-2 group-hover:text-primary">
            {{ item.title }}
          </h4>
        </div>
      </div>
    </NuxtLink>
  </div>
</UCard>
```

### 5. Sticky positioning

**Zmiany:**

- Każda karta osobno sticky (jeśli potrzebne)
- Lub cały kontener sticky z max-height i scroll
- Lepsze zarządzanie przestrzenią

**Opcja A - każda sekcja osobno:**

```vue
<div class="space-y-4">
  <div class="sticky top-4">
    <UCard>...</UCard>
  </div>
  <div class="sticky top-4">
    <UCard>...</UCard>
  </div>
</div>
```

**Opcja B - cały kontener:**

```vue
<div class="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto space-y-4">
  <UCard>...</UCard>
  <UCard>...</UCard>
</div>
```

### 6. Responsywność

**Zmiany:**

- Upewnić się że panel jest ukryty na mobile (`hidden lg:block`)
- Na desktop - optymalna szerokość
- Smooth scrolling dla długich sekcji

## Implementacja - kolejność kroków

1. **Refaktor struktury** - użyć UCard dla każdej sekcji
2. **TOC** - dodać nagłówek, max-height, scroll
3. **Social Media** - kompaktowa wersja (grid 2x2, tylko ikony)
4. **Powiązane artykuły** - zmienić z carousel na listę
5. **Sticky positioning** - zoptymalizować
6. **Spacing i separatory** - poprawić odstępy między sekcjami
7. **Toast notifications** - dodać feedback po akcjach (kopiowanie linku)

## Przykładowa finalna struktura

```vue
<UPageAside class="hidden lg:block">
  <div class="sticky top-4 space-y-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
    <!-- TOC -->
    <UCard>
      <template #header>
        <h3 class="text-sm font-semibold text-muted uppercase tracking-wide">
          Spis treści
        </h3>
      </template>
      <div class="max-h-96 overflow-y-auto">
        <UContentToc ... />
      </div>
    </UCard>

    <!-- Social Media -->
    <UCard>
      <template #header>
        <h3 class="text-sm font-semibold text-muted uppercase tracking-wide">
          Udostępnij
        </h3>
      </template>
      <div class="grid grid-cols-2 gap-2">
        <!-- Kompaktowe przyciski -->
      </div>
    </UCard>

    <!-- Powiązane artykuły -->
    <UCard v-if="links && links.length > 0">
      <template #header>
        <h3 class="text-sm font-semibold text-muted uppercase tracking-wide">
          Powiązane artykuły
        </h3>
      </template>
      <div class="space-y-3">
        <!-- Lista artykułów -->
      </div>
    </UCard>
  </div>
</UPageAside>
```

## Korzyści z ulepszeń

1. **Lepsza czytelność** - wyraźne sekcje w kartach
2. **Mniej miejsca** - kompaktowe przyciski social media
3. **Lepsza nawigacja** - lista zamiast carousel
4. **Lepsze UX** - scrollowanie dla długich sekcji
5. **Wizualna spójność** - użycie kart Nuxt UI
6. **Responsywność** - lepsze zarządzanie przestrzenią

## Uwagi techniczne

- Użyć `UCard` z Nuxt UI dla spójności
- Dodać `max-height` i `overflow-y-auto` dla scrollowania
- Użyć `sticky top-4` z odpowiednim max-height
- Dodać tooltips dla przycisków social media (tylko ikony)
- Rozważyć toast notifications dla feedbacku użytkownika
