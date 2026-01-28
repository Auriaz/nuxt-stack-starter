---
name: kontakt_futurystyczny
overview: 'Przebuduję stronę kontaktu w futurystycznym układzie z różnymi gridami oraz kompletnym zestawem bloków: karty kontaktowe, adres, mapa, social media i FAQ. Zmiany obejmą treść w `content/kontakt.md` oraz layout/styling w `app/pages/kontakt.vue` i powiązanych sekcjach.'
todos:
  - id: kontakt-content
    content: Ustawić strukturę i dane w content/kontakt.md
    status: completed
  - id: kontakt-layout
    content: Dopasować układ i tło w app/pages/kontakt.vue
    status: completed
  - id: kontakt-sections
    content: Dostosować/rozszerzyć komponenty sekcji Kontakt
    status: completed
isProject: false
---

# Plan przebudowy Kontakt

## Założenia

- Styl futurystyczny: kontrasty, delikatne poświaty, gradienty, „glassmorphism”, akcenty neonowe.
- Różne rozstawienia grid: sekcje o zmiennej szerokości kolumn, asymetria 2/1 oraz 3‑kolumnowe karty.
- Zawartość wg Twoich wyborów: karty kontaktowe, adres, mapa (Google Maps embed), social media, FAQ.

## Kroki

1. Zaktualizować treść w `[content/kontakt.md](content/kontakt.md)`:

- Ułożyć sekcje w kolejności: hero (opcjonalnie jako header), karty kontaktowe, adres + mapa (split grid), social media, FAQ.
- Dodać dane kontaktowe i adresowe jako pola w sekcji `contact` (lub nowych sekcjach, jeśli już używacie własnych struktur).
- Dodać URL do embedu Google Maps oraz link do nawigacji.

2. Dostosować layout w `[app/pages/kontakt.vue](app/pages/kontakt.vue)`:

- Zbudować layout oparty o `PageSection` i `SectionsRenderer`, zapewniając futurystyczny background (gradienty, ringi, blur).
- Zastosować różne siatki (`grid`, `lg:grid-cols-2`, `xl:grid-cols-3`) w zależności od sekcji.

3. Uspójnić wygląd sekcji Kontakt:

- Dodać/zmodyfikować komponenty w `app/components/Sections/Contact/SectionsContact.vue` (lub utworzyć dodatkowe sekcje dla kart/adresu/FAQ), aby obsłużyć nowe dane z `kontakt.md`.
- Zapewnić spójne style kart (UCard + custom classes) i elementów mapy (iframe w kontenerze z zaokrągleniem i ringiem).

4. Finalny polish:

- Dodać akcenty UI: badge’y, ikonki, podkreślenia, hover state.
- Sprawdzić responsywność i kontrast na dark mode.

## Pliki do zmiany

- `[content/kontakt.md](content/kontakt.md)` – struktura i dane sekcji
- `[app/pages/kontakt.vue](app/pages/kontakt.vue)` – układ i tło strony
- `[app/components/Sections/Contact/SectionsContact.vue](app/components/Sections/Contact/SectionsContact.vue)` – render nowych bloków (lub nowe sekcje, jeśli wydzielimy)

## Test plan

- Sprawdzić `/kontakt` na desktop i mobile.
- Zweryfikować poprawne renderowanie mapy (iframe) i linków.
- Sprawdzić układ gridów i czy wszystkie bloki są czytelne w dark mode.
