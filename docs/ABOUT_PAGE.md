# Strona O nas

## Jak edytować stronę O nas bez dotykania kodu

Strona "O nas" jest w pełni konfigurowalna z pliku `content/o-nas.md`.

### Struktura pliku

Plik `content/o-nas.md` zawiera:

- Frontmatter (YAML) z konfiguracją strony i sekcji
- Opcjonalnie treść markdown (jeśli potrzebna)

### Edycja treści

1. Otwórz `content/o-nas.md`
2. Edytuj frontmatter:
   - `title` - tytuł strony
   - `description` - opis strony
   - `seo` - meta SEO
   - `sections[]` - lista sekcji

### Dodawanie/edycja sekcji

Każda sekcja w `sections[]` ma:

- `type` - typ sekcji (hero, features, process, etc.)
- `id` - unikalny identyfikator
- `title`, `description` - tytuł i opis sekcji
- `props` - specyficzne właściwości sekcji

### Przykład dodania nowej sekcji

```yaml
sections:
  - type: 'features'
    id: 'new-section'
    title: 'Nowa sekcja'
    description: 'Opis nowej sekcji'
    align: 'center'
    spacing: 'lg'
    props:
      layout: 'grid'
      columns: 3
      items:
        - title: 'Element 1'
          description: 'Opis elementu 1'
```

### Dostępne typy sekcji

- `hero` - sekcja hero
- `features` - lista funkcji/wartości
- `process` - kroki procesu
- `social-proof` - statystyki, logos, testimonials
- `portfolio` - projekty portfolio
- `faq` - często zadawane pytania
- `cta` - call-to-action
- `pricing` - cennik

### SEO

SEO jest konfigurowane w `seo`:

```yaml
seo:
  title: 'O nas - Tytuł SEO'
  description: 'Opis SEO'
  image: '/images/og-image.png'
```

### Przykładowa struktura sekcji

#### Hero Section

```yaml
- type: 'hero'
  id: 'hero'
  title: 'O nas'
  description: 'Opis strony'
  align: 'center'
  spacing: 'lg'
  props:
    layout: 'centered' # centered | split | full-width
    variant: 'primary' # primary | neutral | gradient | minimal
    actions:
      - label: 'Skontaktuj się'
        to: '/kontakt'
        color: 'primary'
        variant: 'solid'
```

#### Features Section

```yaml
- type: 'features'
  id: 'values'
  title: 'Nasze wartości'
  description: 'Opis sekcji'
  align: 'center'
  spacing: 'lg'
  props:
    layout: 'grid' # grid | list
    columns: 3 # 2 | 3 | 4
    variant: 'cards' # default | cards | minimal
    items:
      - title: 'Wartość 1'
        description: 'Opis wartości 1'
        icon: 'i-lucide-target'
```

#### Process Section

```yaml
- type: 'process'
  id: 'process'
  title: 'Jak pracujemy'
  description: 'Opis procesu'
  align: 'center'
  spacing: 'lg'
  props:
    layout: 'vertical' # vertical | horizontal | timeline
    variant: 'default' # default | minimal
    steps:
      - title: 'Krok 1'
        description: 'Opis kroku 1'
        icon: 'i-lucide-search'
        number: 1
```

#### Social Proof Section (Stats)

```yaml
- type: 'social-proof'
  id: 'stats'
  title: 'Nasze osiągnięcia'
  align: 'center'
  spacing: 'lg'
  props:
    variant: 'stats' # logos | stats | testimonials
    stats:
      - value: '100+'
        label: 'Zrealizowanych projektów'
        icon: 'i-lucide-briefcase'
```

#### CTA Section

```yaml
- type: 'cta'
  id: 'cta'
  title: 'Chcesz z nami współpracować?'
  description: 'Opis CTA'
  align: 'center'
  spacing: 'lg'
  props:
    variant: 'centered' # default | centered | banner
    actions:
      - label: 'Skontaktuj się'
        to: '/kontakt'
        color: 'primary'
        variant: 'solid'
        size: 'lg'
```

### Wspólne właściwości sekcji

Wszystkie sekcje mają wspólne pola bazowe:

- `type` - typ sekcji (wymagane)
- `id` - unikalny identyfikator (opcjonalne)
- `enabled` - czy sekcja jest włączona (domyślnie: true)
- `title` - tytuł sekcji (opcjonalne)
- `description` - opis sekcji (opcjonalne)
- `align` - wyrównanie ('left' | 'center', domyślnie: 'center')
- `theme` - motyw ('light' | 'dark' | 'brand', domyślnie: 'light')
- `container` - kontener ('default' | 'wide' | 'full', domyślnie: 'default')
- `spacing` - odstępy ('sm' | 'md' | 'lg', domyślnie: 'md')
- `background` - tło (opcjonalne)
- `seo` - SEO sekcji (opcjonalne)
- `schema` - Schema.org (opcjonalne)

### Wyłączanie sekcji

Aby tymczasowo wyłączyć sekcję bez usuwania:

```yaml
- type: 'features'
  id: 'values'
  enabled: false # Sekcja nie będzie renderowana
  title: 'Nasze wartości'
  # ...
```

### Zmiana kolejności sekcji

Po prostu zmień kolejność elementów w tablicy `sections[]`:

```yaml
sections:
  - type: 'hero'
    # ...
  - type: 'process' # Przeniesione wyżej
    # ...
  - type: 'features' # Przeniesione niżej
    # ...
```

### Rozwiązywanie problemów

#### Sekcja nie wyświetla się

- Sprawdź czy `enabled: false` nie jest ustawione
- Sprawdź czy `type` jest poprawny
- Sprawdź czy `props` są zgodne ze schematem sekcji

#### Błąd walidacji

- Sprawdź czy wszystkie wymagane pola w `props` są wypełnione
- Sprawdź typy danych (np. `items` musi być array)
- Sprawdź czy wartości enum są poprawne (np. `layout: 'centered'`)

#### SEO nie działa

- Sprawdź czy `seo` jest wypełnione w frontmatter
- Sprawdź czy `seo.title` i `seo.description` są ustawione
- Sprawdź czy `seo.image` wskazuje na istniejący obraz
