---
name: Plan wdrożenia modułu Media
overview: 'Konkretny plan wdrożenia ulepszeń modułu Media (upload w modalu, wielopliki, paginacja, filtr tagów, modal usunięcia, useForm w drawerze, Kopiuj URL, status na kartach, drobne UI) z zachowaniem architektury: API tylko przez useMediaResource, formularze przez useForm(), Valibot, bez fetch w komponentach.'
todos: []
isProject: false
---

# Plan wdrożenia modułu Media

## Zasady (bez zmian)

- Komunikacja z API wyłącznie przez [app/composables/resources/useMediaResource.ts](app/composables/resources/useMediaResource.ts).
- Formularze przez `useForm()`; walidacja Valibot.
- Zmiany tylko w: [app/pages/dashboard/media/index.vue](app/pages/dashboard/media/index.vue), [app/components/Media/MediaLibrary.vue](app/components/Media/MediaLibrary.vue), [MediaUploader.vue](app/components/Media/MediaUploader.vue), [MediaGrid.vue](app/components/Media/MediaGrid.vue), [MediaDetailsDrawer.vue](app/components/Media/MediaDetailsDrawer.vue), [MediaCard.vue](app/components/Media/MediaCard.vue).

---

## Krok 1: Drobne poprawki UI (P3)

**Opis:** Literówka w klasie w MediaGrid; opcjonalny placeholder/poster dla wideo w MediaCard (ikona lub tło, bez zmiany API).

**Pliki do zmiany:**

- [app/components/Media/MediaGrid.vue](app/components/Media/MediaGrid.vue)
- [app/components/Media/MediaCard.vue](app/components/Media/MediaCard.vue)

**Zależności:** Brak.

**Priorytet:** P3.

---

## Krok 2: Status zasobu na MediaCard (P2)

**Opis:** Wyświetlanie `asset.status` (processing / ready / failed) jako badge lub ikona: loader dla processing, ikona błędu dla failed; bez zmiany layoutu karty.

**Pliki do zmiany:**

- [app/components/Media/MediaCard.vue](app/components/Media/MediaCard.vue)

**Zależności:** Brak.

**Priorytet:** P2.

---

## Krok 3: Paginacja w MediaLibrary (P1)

**Opis:** Wykorzystać `pagination` z API; dodać UI paginacji (Nuxt UI lub Previous/Next); zmiana strony ustawia `filters.page` i wywołuje `load()`.

**Pliki do zmiany:**

- [app/components/Media/MediaLibrary.vue](app/components/Media/MediaLibrary.vue)

**Zależności:** Brak.

**Priorytet:** P1.

---

## Krok 4: Filtr po tagach (P2)

**Opis:** UI filtra tagów (chips / multi-select / pole tekstowe); przekazywanie `filters.tags` do `mediaResource.list()`; spójność z istniejącymi filtrami i `applyFilters()`.

**Pliki do zmiany:**

- [app/components/Media/MediaLibrary.vue](app/components/Media/MediaLibrary.vue)

**Zależności:** Brak.

**Priorytet:** P2.

---

## Krok 5: Modal potwierdzenia usunięcia (P1)

**Opis:** Zastąpić `confirm()` w MediaDetailsDrawer przez UModal z tekstem ostrzegawczym i przyciskami Anuluj / Usuń; po potwierdzeniu wywołać obecną logikę `remove()` i zamknąć drawer.

**Pliki do zmiany:**

- [app/components/Media/MediaDetailsDrawer.vue](app/components/Media/MediaDetailsDrawer.vue)

**Zależności:** Brak.

**Priorytet:** P1.

---

## Krok 6: useForm w MediaDetailsDrawer (P1)

**Opis:** Formularz edycji metadanych (alt, caption, tags) oprzeć o `useForm()` ze schematem Valibot (np. UpdateMediaMetadataSchema); walidacja, `setErrorsFromApi`, wyświetlanie błędów per pole w UI.

**Pliki do zmiany:**

- [app/components/Media/MediaDetailsDrawer.vue](app/components/Media/MediaDetailsDrawer.vue)

**Zależności:** Brak. Schemat w shared już istnieje.

**Priorytet:** P1.

---

## Krok 7: Kopiowanie URL zasobu (P2)

**Opis:** Przycisk „Kopiuj URL” w MediaDetailsDrawer; kopiowanie `serveUrl(asset.id)` (pełny URL lub ścieżka) do schowka; toast „Skopiowano”.

**Pliki do zmiany:**

- [app/components/Media/MediaDetailsDrawer.vue](app/components/Media/MediaDetailsDrawer.vue)

**Zależności:** Brak.

**Priorytet:** P2.

---

## Krok 8: MediaUploader w modalu (P1)

**Opis:** Usunąć stały dropzone z treści; w MediaLibrary dodać przycisk „Dodaj plik” otwierający UModal; w modalu: dropzone + input file, progress, UAlert przy błędach; po udanym uploadzie zamknięcie modala i wykorzystanie istniejącego `@uploaded` (odświeżenie listy). Opcjonalnie w tym kroku: pola alt/caption/tags w modalu i przekazanie `meta` do `mediaResource.upload(file, meta)`.

**Pliki do zmiany:**

- [app/components/Media/MediaLibrary.vue](app/components/Media/MediaLibrary.vue)
- [app/components/Media/MediaUploader.vue](app/components/Media/MediaUploader.vue) — tylko jeśli dodajemy opcjonalne meta (alt, caption, tags).

**Zależności:** Brak.

**Priorytet:** P1.

---

## Krok 9: Upload wielu plików (P1)

**Opis:** Obsługa wielu plików (input multiple + wiele plików w drop); kolejka uploadów; progress per plik lub zbiorczy; błędy per plik bez blokowania reszty; bez zmiany kontraktu API (wiele wywołań `mediaResource.upload()`).

**Pliki do zmiany:**

- [app/components/Media/MediaUploader.vue](app/components/Media/MediaUploader.vue)
- [app/components/Media/MediaLibrary.vue](app/components/Media/MediaLibrary.vue) — ewentualnie jeden toast „Przesłano N plików” po zakończeniu kolejki.

**Zależności:** Wykonać po Kroku 8 (upload w modalu), żeby kolejka i progress były w jednym miejscu.

**Priorytet:** P1.

---

## Kolejność wdrażania (rekomendowana)

| Kolejność | Krok                        | Priorytet |
| --------- | --------------------------- | --------- |
| 1         | Krok 1 – Drobne poprawki UI | P3        |
| 2         | Krok 3 – Paginacja          | P1        |
| 3         | Krok 5 – Modal usunięcia    | P1        |
| 4         | Krok 6 – useForm w drawerze | P1        |
| 5         | Krok 8 – Upload w modalu    | P1        |
| 6         | Krok 9 – Wielopliki         | P1        |
| 7         | Krok 2 – Status na karcie   | P2        |
| 8         | Krok 4 – Filtr tagów        | P2        |
| 9         | Krok 7 – Kopiuj URL         | P2        |

Kroki 1–4 i 8 można w dużej mierze wykonać równolegle; Krok 9 po Kroku 8.

---

## Quick win (co zrobić jako pierwsze)

**Krok 1** (drobne poprawki) i **Krok 3** (paginacja): mało zależności, szybki efekt — użytkownik od razu ma nawigację po stronach i poprawny grid. Następnie **Krok 8** (upload w modalu) i **Krok 5** (modal usunięcia) dla spójnego UX z modalami.

---

## Co można bezpiecznie odłożyć

- **Krok 1** (drobne UI) i **Krok 2** (status na karcie) — nice-to-have, nie blokują pozostałych.
- **Krok 4** (filtr tagów) i **Krok 7** (Kopiuj URL) — P2; można wdrożyć w drugiej iteracji po zamknięciu P1.
- **Opcjonalne meta (alt/caption/tags) w Kroku 8** — można dodać później bez zmiany struktury modala.
