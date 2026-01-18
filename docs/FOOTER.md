# Dokumentacja: Footer

## Przegląd

Footer jest globalnym komponentem wyświetlanym na dole każdej strony. Jest w pełni konfigurowalny przez plik `content/app/footer.md` z fallback do `app.meta.ts`.

## Struktura plików

- **Konfiguracja**: `content/app/footer.md`
- **Composable**: `app/composables/useFooterConfig.ts`
- **Komponent**: `app/components/Footer/AppFooter.vue`
- **Schematy**: `shared/schemas/footer.ts`
- **Typy**: `shared/types/footer.ts`

## Edycja konfiguracji

### Lokalizacja pliku

Edytuj plik `content/app/footer.md` aby zmienić zawartość footera.

### Struktura frontmatter

```yaml
---
brand:
  name: 'Nazwa firmy'
  description: 'Krótki opis'
  logo: '/favicon.ico'
columns:
  - title: 'Tytuł kolumny'
    links:
      - label: 'Tekst linku'
        to: '/sciezka' # Link wewnętrzny
        # LUB
        href: 'https://example.com' # Link zewnętrzny
        external: true # Opcjonalnie
        icon: 'i-lucide-home' # Opcjonalna ikona
contact:
  email: 'email@example.com'
  phone: '+48 123 456 789'
  address: 'ul. Przykładowa 1, 00-000 Warszawa'
  hours: 'Pon-Pt: 9:00-17:00'
social:
  - name: 'GitHub'
    href: 'https://github.com/username'
    icon: 'i-simple-icons-github'
legal:
  companyName: 'Nazwa firmy'
  yearStart: '2024' # Rok rozpoczęcia działalności
  privacyUrl: '/polityka-prywatnosci'
  termsUrl: '/regulamin'
  cookiesUrl: '/polityka-cookies'
newsletter:
  enabled: true
  title: 'Newsletter'
  description: 'Zapisz się do newslettera'
  placeholder: 'Twój email'
  buttonLabel: 'Zapisz się'
backToTop: true
theme: 'light' # 'light' | 'dark' | 'brand'
container: 'default' # 'default' | 'wide'
spacing: 'md' # 'sm' | 'md' | 'lg'
schema:
  enabled: true # Włącza Schema.org (Organization, WebSite)
---
```

## Dodawanie nowej kolumny

Dodaj nową kolumnę do sekcji `columns`:

```yaml
columns:
  - title: 'Nowa kolumna'
    links:
      - label: 'Link 1'
        to: '/link-1'
      - label: 'Link 2'
        to: '/link-2'
```

## Dodawanie linków

### Link wewnętrzny (Nuxt route)

```yaml
links:
  - label: 'Strona główna'
    to: '/'
```

### Link zewnętrzny (URL)

```yaml
links:
  - label: 'Zewnętrzna strona'
    href: 'https://example.com'
    external: true # Opcjonalnie, automatycznie wykrywane dla http/https
```

### Link z ikoną

```yaml
links:
  - label: 'Home'
    to: '/'
    icon: 'i-lucide-home'
```

## Dodawanie social media

Dodaj nowy wpis do sekcji `social`:

```yaml
social:
  - name: 'GitHub'
    href: 'https://github.com/username'
    icon: 'i-simple-icons-github'
  - name: 'Twitter'
    href: 'https://twitter.com/username'
    icon: 'i-simple-icons-twitter'
```

### Dostępne ikony

Używaj ikon z:

- `i-lucide-*` - Lucide icons
- `i-simple-icons-*` - Simple Icons (dla social media)

## Włączanie/wyłączanie newslettera

```yaml
newsletter:
  enabled: true # true = włączony, false = wyłączony
  title: 'Newsletter'
  description: 'Zapisz się do newslettera'
  placeholder: 'Twój email'
  buttonLabel: 'Zapisz się'
```

**Uwaga**: Newsletter jest obecnie tylko UI - wymaga implementacji backend endpoint.

## Zmiana motywu kolorystycznego

```yaml
theme: 'light' # 'light' | 'dark' | 'brand'
```

- **light**: Jasne tło, ciemny tekst
- **dark**: Ciemne tło, jasny tekst
- **brand**: Kolor primary jako tło

## Zmiana szerokości kontenera

```yaml
container: 'default' # 'default' | 'wide'
```

- **default**: Standardowa szerokość (max-w-6xl)
- **wide**: Szerszy kontener (max-w-7xl)

## Zmiana odstępów

```yaml
spacing: 'md' # 'sm' | 'md' | 'lg'
```

- **sm**: Mniejsze odstępy (py-8 sm:py-12)
- **md**: Średnie odstępy (py-12 sm:py-16 md:py-20)
- **lg**: Większe odstępy (py-16 sm:py-20 md:py-24)

## Włączanie/wyłączanie Schema.org

```yaml
schema:
  enabled: true # true = włączony, false = wyłączony
```

Gdy włączony, dodaje:

- `Organization` schema z danymi firmy
- `WebSite` schema

## Fallback do app.meta

Jeśli plik `content/app/footer.md` nie istnieje lub nie zawiera niektórych pól, Footer używa wartości z `app.meta.ts`:

- `brand.name` → `appMeta.name`
- `brand.description` → `appMeta.description`
- `brand.logo` → `appMeta.icon`
- `contact.email` → `appMeta.contactEmail`
- `social` → mapowanie `appMeta.sameAs` do linków social
- `legal.companyName` → `appMeta.name`

## Responsywność

Footer automatycznie dostosowuje się do rozdzielczości:

- **Mobile**: 1 kolumna, stacked sections
- **Tablet**: 2 kolumny
- **Desktop**: 3-5 kolumn (w zależności od liczby sekcji)

## Dostępność (a11y)

- Semantic HTML (`<footer>`, `<nav>`, `<address>`)
- `aria-label` dla ikon social media
- Keyboard navigation
- Linki zewnętrzne z `target="_blank" rel="noopener noreferrer"`

## Back to Top

Przycisk "Do góry" jest wyświetlany gdy `backToTop: true` w konfiguracji. Przewija stronę do góry z animacją smooth scroll.

## Przykładowa konfiguracja

Zobacz `content/app/footer.md` dla pełnego przykładu konfiguracji.
