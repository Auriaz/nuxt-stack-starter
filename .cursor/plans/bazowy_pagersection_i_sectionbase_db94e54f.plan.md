---
name: bazowy_pagersection_i_sectionbase
overview: Migracja systemu sekcji do jednego, bazowego komponentu PageSection opartego na Nuxt UI UPageSection oraz wspólnego kontraktu SectionBaseSchema w Valibot.
todos:
  - id: update-sectionbase-schema
    content: Rozszerzyć SectionBaseSchema o pola layoutu (spacing, theme, background, container, align, schema) i dopasować ui do potrzeb PageSection.
    status: completed
  - id: inherit-schemas-from-base
    content: Zrefaktoryzować wszystkie schemy sekcji (Hero, Features, CTA, Pricing, FAQ, Testimonials, itd.), aby dziedziczyły z SectionBaseSchema bez duplikacji pól.
    status: completed
  - id: implement-new-pagesection
    content: Przepisać PageSection.vue tak, aby przyjmował SectionBase, mapował layout na UPageSection i udostępniał standardowe sloty sekcji.
    status: completed
  - id: refactor-sections-to-use-pagesection
    content: Zaktualizować komponenty sekcji (Hero, Features, CTA, Pricing, FAQ, Testimonials) tak, aby nie używały ui/Section.vue ani własnego wrappera UPageSection, tylko treść w slotach PageSection.
    status: completed
  - id: update-sectionsrenderer
    content: Zaktualizować SectionsRenderer.vue, aby filtrował sekcje po enabled, rozwiązywał komponenty treści i zawsze opakowywał je w PageSection.
    status: completed
  - id: deprecate-ui-section
    content: Usunąć lub zdeprecjonować app/components/ui/Section.vue po migracji odpowiedzialności do PageSection.
    status: completed
  - id: write-docs-new-section
    content: Dodać krótką dokumentację opisującą jak zdefiniować nową sekcję opartą o PageSection i SectionBaseSchema.
    status: completed
isProject: false
---

# Bazowy PageSection + SectionBase jako fundament sekcji

## 1. Analiza i docelowa architektura

- **Aktualny stan**:
- `PageSection.vue` w `app/components/Page/Section/PageSection.vue` jest cienką nakładką na `UPageSection` z własnymi propsami (type/id/ref/headline/...); nie jest jeszcze centralnym wrapperem.
- `Section.vue` w `app/components/ui/Section.vue` odpowiada za layout (spacing, theme, background, container) i jest zewnętrznym wrapperem `<section><div class="container">` używanym przez sekcje (`SectionsHero`, `SectionsFeatures`, itd.).
- `SectionBaseSchema` w `[shared/schemas/sections.ts](shared/schemas/sections.ts)` ma część pól wspólnych (type/as/icon/id/ref/enabled/headline/title/description/links/orientation/features/reverse/ui), ale konkretne schemy sekcji duplikują większość z nich ręcznie.
- `SectionsRenderer.vue` renderuje bezpośrednio komponenty sekcji (`SectionsHero`, `SectionsFeatures`, ...) wybierane po `section.type`, bez globalnego wrappera `PageSection`.
- **Stan docelowy**:
- `PageSection.vue` staje się **single source of truth** dla layoutu i API sekcji, oparty o `UPageSection` jako root i przyjmujący jeden prop `section` typu `SectionBase`.
- `SectionBaseSchema` w pełni opisuje wszystkie cross-sekcyjne pola (layout, spacing, theme, background, container, align, ui, schema.org, itp.) i jest **rozszerzany** przez wszystkie schemy sekcji bez duplikacji.
- `SectionsRenderer.vue` filtruje sekcje po `enabled !== false`, rozwiązuje komponent treści (Hero/Features/...) i **zawsze** renderuje go w slocie `PageSection`.
- Stary `Section.vue` z `app/components/ui/Section.vue` jest zdeprecjonowany/usunięty; jego odpowiedzialności przejęte przez `PageSection` + `SectionBase`.

## 2. Rozszerzenie i ujednolicenie SectionBaseSchema

- **2.1. Rozszerzenie pól layoutu w SectionBaseSchema** w `[shared/schemas/sections.ts](shared/schemas/sections.ts)`:
- Dodać pola:
- `spacing: optional(picklist(['xs','sm','md','lg','xl','2xl'] as const))`
- `theme: optional(picklist(['light','dark','brand','neutral'] as const))`
- `background: optional(picklist(['none','subtle','muted','surface'] as const))`
- `container: optional(picklist(['default','narrow','wide','full'] as const))`
- `align: optional(picklist(['left','center'] as const))` (mapowane na wyrównanie tekstu / contentu w `UPageSection` przez `ui` lub przyszłe propsy).
- `schema: optional(any())` (lub bardziej restrykcyjny obiekt w przyszłości) na potrzeby konfiguracji schema.org.
- Rozszerzyć istniejący `ui` tak, aby mógł przekazać klasy do `UPageSection`/container:
- Uzupełnić o pola dla layoutu (np. `section`, `background`, `spacing`, `container`, `align`), jeśli będą potrzebne w implementacji.
- **2.2. Ujednolicenie typów sekcji wokół SectionBaseSchema**:
- Dla każdego schematu (`SectionHeroSchema`, `SectionFeaturesSchema`, `SectionCTASchema`, `SectionPricingSchema`, `SectionFAQSchema`, `SectionTestimonialsSchema`, itd.) zrefaktoryzować definicje tak, aby **dziedziczyły** z `SectionBaseSchema`, zamiast powielać pola:
- Wzorzec (przykład):
- Zamiast ręcznego powtarzania pól `id/ref/enabled/headline/title/description/links/...`, użyć helpera, np. `merge([SectionBaseSchema, object({ type: literal('hero'), image: optional(ImageSchema), ...specyficzne pola... })])` lub analogicznego mechanizmu dostępnego w Valibot (w zależności od istniejących helperów w projekcie).
- Upewnić się, że `type` jest zawężane do odpowiedniej literału (`'hero'`, `'features'`, ...), a pozostałe pola pozostają spójne z `SectionBaseSchema`.
- Upewnić się, że typy `SectionHero`, `SectionFeatures`, itd. generowane z tych schem (w `#shared/types/sections`) korzystają z jednej bazy i nie duplikują definicji pól layoutu.

## 3. Nowy PageSection.vue oparty o UPageSection + SectionBase

- **3.1. API komponentu** w `[app/components/Page/Section/PageSection.vue](app/components/Page/Section/PageSection.vue)`:
- Zmienić propsy komponentu na:
- `section: { type: Object as PropType<SectionBase>, required: true }` (lub `defineProps<{ section: SectionBase }>()`).
- Usunąć wszystkie dotychczasowe pojedyncze propsy (`type`, `id`, `enabled`, `headline`, itp.), które teraz będą brane z `section`.
- **3.2. Logika layoutu i mapowanie na UPageSection**:
- Na podstawie `section` obliczyć konfigurację do przekazania do `UPageSection`:
- `id`, `headline`, `icon`, `title`, `description`, `links`, `features`, `orientation`, `reverse`, `ui` (w tym `ui.root`, `ui.container`, `ui.header`, itd.).
- Filtrowanie domyślnych wartości (`orientation` domyślnie np. `'vertical'`, `reverse` domyślnie `false`, `enabled` domyślnie `true`).
- Zaimplementować mapowanie layoutu z `SectionBase`:
- `spacing`, `theme`, `background` -> obliczone klasy Tailwind (podobne do aktualnych map w `Section.vue`) i wstrzykiwane przez:
- `class` na `UPageSection` (np. tło),
- oraz/lub przez `ui.root`/`ui.wrapper`/`ui.container` komponentu `UPageSection`.
- `container` -> kontrola szerokości (zastępująca stare `containerClasses`):
- wykorzystać `UPageSection` + jego wewnętrzny `UContainer` przez `ui`, np. dostosowując `max-w`/`px` klasami.
- `align` -> mapowane na klasy wyrównania (`text-left`, `text-center`) na `ui.header`/`ui.body` albo globalnie na root.
- Zasada: jeżeli `section.ui` dostarcza własne klasy, **nie nadpisywać** ich domyślnymi, tylko składać (np. `[defaultClass, section.ui.root].filter(Boolean).join(' ')`).
- **3.3. Implementacja slotów jako oficjalnego kontraktu**:
- W szablonie `UPageSection` zadeklarować sloty:
- `#top`, `#header`, `#leading="slotProps"`, `#headline`, `#title`, `#description`, `#body`, `#features`, `#footer`, `#links`, `#default`, `#bottom`.
- Każdy slot ma być **opcjonalny** – w `PageSection` jedynie deklarujemy jego istnienie, a użycie zależy od sekcji; nie renderujemy żadnego dodatkowego HTML-a wewnątrz tych slotów.
- Dla slotów z propsami (np. `leading { ui?: object }`) przekazywać dalej to, co oferuje `UPageSection`, ewentualnie wzbogacone o `section.ui`.

## 4. Refaktoryzacja SectionsRenderer do korzystania z PageSection

- **4.1. Aktualizacja renderera** w `[app/components/sections/SectionsRenderer.vue](app/components/sections/SectionsRenderer.vue)`:
- Zachować istniejący filtr `enabledSections` po `section.enabled !== false`.
- Rozszerzyć logikę renderowania tak, żeby:
- Dla każdej `section`:
- zmapować `section.type` na komponent treści (Hero, Features, CTA, Pricing, FAQ, Testimonials, itd.) – obecna mapa `sectionComponents` może zostać.
- komponent treści otrzymywał **całego** `section` (jak teraz).
- komponent treści renderowany był **wewnątrz** `PageSection`:
- `PageSection` jako zewnętrzny wrapper z `:section="section"`.
- wewnątrz `PageSection`, w odpowiednim slocie (najczęściej `body` lub `default`), `component :is="resolvedSectionComponent"` renderujący treść.
- Usunąć przypadek, w którym sekcja typu `section` renderuje bezpośrednio `SectionsBase` jako komponent; zamiast tego każda sekcja będzie przechodzić przez `PageSection`.
- **4.2. Wymuszenie braku sekcji bez wrappera**:
- Upewnić się, że żaden z komponentów w rendererze nie jest renderowany poza `PageSection` (czyli brak `component :is` bezpośrednio w root `div.sections-renderer`).

## 5. Refaktoryzacja konkretnych sekcji do korzystania z PageSection + slotów

- **5.1. Wspólny wzorzec**:
- Każda sekcja (`SectionsHero.vue`, `SectionsFeatures.vue`, `SectionsCTA.vue`, `SectionsPricing.vue`, `SectionsFAQ.vue`, `SectionsTestimonials.vue`) zostanie uproszczona do komponentu, który:
- przyjmuje `section: <konkretny typ>` (jak obecnie),
- przygotowuje dane specyficzne (np. `image`, `plans`, `accordionItems`, schema.org),
- **nie** używa `Section.vue` ani nie opakowuje się w własne `<section>`/`UPageSection`,
- renderuje wyłącznie zawartość w ramach odpowiednich slotów `PageSection` (udostępnionych przez `SectionsRenderer`).
- **5.2. Sekcja Hero** (`[app/components/Sections/Hero/SectionsHero.vue](app/components/Sections/Hero/SectionsHero.vue)`):
- Usunąć wrapper `<Section>` i wewnętrzne `<UPageHero>` jako główne źródło layoutu.
- Przenieść `UPageHero` do odpowiedniego slotu `PageSection` (np. `#body` lub `#default`) – w praktyce: `SectionsRenderer` w slocie `default/body` renderuje `<SectionsHero>`; a `SectionsHero` wewnątrz zwraca tylko `UPageHero` + obraz.
- Pozostawić konfigurację `image` oraz motion (`Motion`, `fadeUp`), ale bez kontroli spacingu/container – to zapewnia `PageSection`.
- **5.3. Sekcja Features** (`[app/components/Sections/Features/SectionsFeatures.vue](app/components/Sections/Features/SectionsFeatures.vue)`):
- Usunąć zewnętrzny `<Section>` i wewnętrzny `<UPageSection>`.
- `UCard` + `Motion` pozostają jako zawartość sekcji w slocie `body`/`features`:
- `PageSection` zapewnia `headline/title/description/links/orientation` przez własne propsy; tam, gdzie do tej pory robił to lokalny `UPageSection`, przesuwamy tę odpowiedzialność do `PageSection`.
- Zredukować `config` do wartości potrzebnych wewnątrz (np. `features`, `ui.body`).
- **5.4. Sekcja CTA** (`[app/components/Sections/CTA/SectionsCTA.vue](app/components/Sections/CTA/SectionsCTA.vue)`):
- Usunąć `<Section>` i `<UPageCTA>` jako element opakowujący layout sekcji.
- Zostawić `UPageCTA` jako część treści sekcji w slocie odpowiednim (np. `body`), a layout (spacing, container, tło) przenieść do `PageSection`.
- Mapowanie `variant`, `orientation`, `links` nadal odbywa się w `SectionsCTA`, ale tylko na poziomie `UPageCTA`.
- **5.5. Sekcja Pricing** (`[app/components/Sections/Pricing/SectionsPricing.vue](app/components/Sections/Pricing/SectionsPricing.vue)`):
- Usunąć `<Section>` i lokalny `<UPageSection>`.
- Logika budowy `plans` z typem `PricingPlanProps` zostaje w sekcji.
- `UPageGrid` + `UPricingPlan` stają się zawartością slotu `features` lub `body`, natomiast `headline/title/description/links` pochodzą z `PageSection`.
- **5.6. Sekcja FAQ** (`[app/components/Sections/FAQ/SectionsFAQ.vue](app/components/Sections/FAQ/SectionsFAQ.vue)`):
- Usunąć `<Section>` i lokalny `<UPageSection>`.
- Zostawić logikę `accordionItems` i `useSchemaOrg`.
- `UAccordion` renderować jako zawartość slotu `body`/`features`, podczas gdy `PageSection` kontroluje nagłówek.
- **5.7. Sekcja Testimonials** (`[app/components/Sections/Testimonials/SectionsTestimonials.vue](app/components/Sections/Testimonials/SectionsTestimonials.vue)`):
- Usunąć `<Section>` i lokalny `<UPageSection>`.
- Zostawić logikę `reviewSchema` i `useSchemaOrg`.
- `Motion + CardTestimonial` (grid) oraz `UCarousel + CardTestimonial` (carousel) stają się zawartością slotu sekcji.

## 6. Deprecjacja / usunięcie ui/Section.vue

- **6.1. Odłączenie od kodu**:
- Po zrefaktoryzowaniu wszystkich komponentów sekcji tak, by nie importowały `Section` z `app/components/ui/Section.vue`, sprawdzić czy komponent jest używany gdziekolwiek indziej.
- Jeśli już nie jest używany:
- albo całkowicie usunąć plik,
- albo tymczasowo zostawić z komentarzem `// DEPRECATED: replaced by PageSection` (w zależności od Twoich preferencji w repo), ale bez żadnych realnych użyć.
- **6.2. Ewentualne mapowanie klas**:
- Upewnić się, że mapy `spacingClasses`, `themeClasses`, `backgroundClasses`, `containerClasses` zostały przeniesione lub odtworzone w nowym `PageSection.vue`, tak aby zachować spójny wygląd.

## 7. Typy, bezpieczeństwo i brak duplikacji logiki

- **7.1. Typy TS dla sekcji**:
- Zaktualizować `#shared/types/sections` (jeśli korzysta z `SectionBaseSchema`/`Section*Schema`) tak, by:
- `SectionBase` odzwierciedlał nowe pola layoutu.
- `SectionHero`, `SectionFeatures`, itd. były rozszerzeniami `SectionBase` (np. przez `&` z dodatkowymi polami), a nie równoległymi definicjami.
- **7.2. PageSection bez `any**`:
- Użyć `SectionBase` jako typu propsa `section` i unikać `any` w obliczeniach (np. w computed i mapowaniach ui).
- **7.3. Przeniesienie logiki warunkowej**:
- Tam, gdzie obecnie sekcje zawierają logikę warunkową layoutu (np. `orientation` domyślne, `enabled` domyślne, mapowanie ui), przenieść ją do `PageSection`/SectionBase tak, aby komponenty sekcji skupiały się uniquement na treści i specyficznych interakcjach.

## 8. Dokumentacja „Jak dodać nową sekcję opartą o PageSection”

- **8.1. Krótki przewodnik** (np. w `README.md` lub osobny plik w `docs/`):
- Opisać kroki:

1. Dodanie nowego schematu sekcji jako rozszerzenie `SectionBaseSchema` (np. `SectionProcessSchema`).
2. Dodanie nowego typu TS sekcji (`SectionProcess`).
3. Stworzenie komponentu sekcji w `app/components/Sections/<Name>/Sections<Name>.vue`, który:

- przyjmuje `section: SectionProcess`,
- mapuje dane tylko na wewnętrzne UI/komponenty,
- nie używa własnego wrappera sekcji.

1. Zarejestrowanie nowego komponentu w `SectionsRenderer` w mapie `sectionComponents`.

- Wyjaśnić krótko, które sloty `PageSection` są preferowane dla jakich typów treści (np. `header` dla nagłówków, `body` dla głównej zawartości, `features` dla list kart).
- **8.2. Przykład kodu**:
- Pokazać minimalny przykład nowej sekcji, wykorzystujący dane z `SectionBase` i sloty `PageSection`.

## 9. Weryfikacja i testy

- **9.1. Spójność wizualna**:
- Odpalić aplikację i przejść przez strony używające wszystkich sekcji, porównując przed/po:
- spacing,
- tło,
- szerokość kontenera,
- wyrównanie.
- **9.2. Typy i linter**:
- Uruchomić linter/TS (np. `pnpm lint`/`pnpm typecheck` według konfiguracji projektu) i poprawić ewentualne błędy typu.
- **9.3. Treść ze `content/**`:
- Upewnić się, że dane generowane przez Content Layer pasują do nowych schem sekcji i że renderowanie z `SectionsRenderer` działa poprawnie dla wszystkich typów sekcji.
