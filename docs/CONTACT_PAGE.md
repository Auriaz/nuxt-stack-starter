# Strona kontaktowa

## Jak edytować stronę kontaktową bez dotykania kodu

Strona "Kontakt" jest w pełni konfigurowalna z pliku `content/kontakt.md`.

### Struktura pliku

Plik `content/kontakt.md` zawiera:

- Frontmatter (YAML) z konfiguracją strony i sekcji
- Opcjonalnie treść markdown (jeśli potrzebna)

### Edycja treści

1. Otwórz `content/kontakt.md`
2. Edytuj frontmatter:
   - `title` - tytuł strony
   - `description` - opis strony
   - `seo` - meta SEO
   - `sections[]` - lista sekcji

### Dostępne sekcje dla strony kontaktowej

#### 1. Hero Section

Sekcja hero z tytułem i opisem:

```yaml
- type: 'hero'
  id: 'hero'
  title: 'Skontaktuj się z nami'
  description: 'Opis strony kontaktowej'
  align: 'center'
  spacing: 'lg'
  props:
    layout: 'centered'
    variant: 'primary'
```

#### 2. Contact Details Section

Wyświetla informacje kontaktowe (email, telefon, adres, godziny):

```yaml
- type: 'contact-details'
  id: 'contact-details'
  title: 'Informacje kontaktowe'
  description: 'Jesteśmy dostępni...'
  align: 'left'
  spacing: 'lg'
  props:
    variant: 'cards' # cards | list
    items:
      - label: 'Email'
        value: 'kontakt@example.com'
        href: 'mailto:kontakt@example.com'
        icon: 'i-lucide-mail'
      - label: 'Telefon'
        value: '+48 123 456 789'
        href: 'tel:+48123456789'
        icon: 'i-lucide-phone'
      - label: 'Adres'
        value: 'ul. Przykładowa 123\n00-000 Warszawa'
        icon: 'i-lucide-map-pin'
        note: 'Dodatkowa notatka'
```

**Warianty:**

- `cards` - kafelki w grid (domyślnie)
- `list` - lista pionowa

**Pola item:**

- `label` - etykieta (wymagane)
- `value` - wartość (wymagane, może zawierać `\n` dla wielu linii)
- `href` - link (opcjonalnie, np. `mailto:`, `tel:`, `https://`)
- `icon` - ikona (opcjonalnie, np. `i-lucide-mail`)
- `note` - dodatkowa notatka (opcjonalnie)

#### 3. Contact Form Section

Formularz kontaktowy z dynamicznymi polami:

```yaml
- type: 'contact-form'
  id: 'contact-form'
  title: 'Wyślij wiadomość'
  description: 'Wypełnij formularz...'
  align: 'left'
  spacing: 'lg'
  props:
    endpoint: '/api/contact' # Endpoint API
    method: 'POST'
    fields:
      - name: 'name'
        label: 'Imię i nazwisko'
        type: 'text'
        required: true
        placeholder: 'Jan Kowalski'
        icon: 'i-lucide-user'
      - name: 'email'
        label: 'Email'
        type: 'email'
        required: true
        placeholder: 'jan@example.com'
        icon: 'i-lucide-mail'
      - name: 'message'
        label: 'Wiadomość'
        type: 'textarea'
        required: true
        placeholder: 'Twoja wiadomość...'
    consent:
      label: 'Wyrażam zgodę na przetwarzanie danych'
      required: true
    successMessage: 'Wiadomość została wysłana pomyślnie.'
    errorMessage: 'Wystąpił błąd. Spróbuj ponownie.'
    spamProtection:
      type: 'honeypot' # honeypot | turnstile (tylko config)
```

**Pola formularza:**

- `name` - nazwa pola (wymagane, np. `name`, `email`, `phone`, `subject`, `message`)
- `label` - etykieta pola (wymagane)
- `type` - typ pola: `text`, `email`, `tel`, `textarea` (opcjonalnie)
- `required` - czy wymagane (opcjonalnie, domyślnie: `false`)
- `placeholder` - placeholder (opcjonalnie)
- `icon` - ikona (opcjonalnie)

**Uwagi:**

- Pola zgodne z `ContactFormSchema` (`name`, `email`, `phone`, `subject`, `message`) są walidowane przez schema
- Inne pola (np. `company`) są opcjonalne i nie są walidowane przez schema
- `consent` - checkbox zgody (opcjonalnie)
- `spamProtection` - konfiguracja ochrony przed spamem (tylko config, bez implementacji)

#### 4. Map Section

Mapa lub link do mapy:

```yaml
- type: 'map'
  id: 'map'
  title: 'Lokalizacja'
  spacing: 'lg'
  props:
    type: 'embed' # embed | link
    embedUrl: 'https://www.google.com/maps/embed?pb=...'
    linkUrl: 'https://www.google.com/maps'
    addressText: 'ul. Przykładowa 123, 00-000 Warszawa'
    note: 'Znajdź nas na mapie'
```

**Warianty:**

- `embed` - osadzona mapa (iframe) z `embedUrl`
- `link` - przycisk z linkiem do mapy + tekst adresu

#### 5. FAQ Section

Często zadawane pytania:

```yaml
- type: 'faq'
  id: 'faq'
  title: 'Często zadawane pytania'
  description: 'Odpowiedzi na najczęstsze pytania...'
  align: 'center'
  spacing: 'lg'
  props:
    items:
      - question: 'Jak szybko odpowiadacie?'
        answer: 'Odpowiadamy w ciągu 24 godzin.'
```

#### 6. CTA Section

Call-to-action:

```yaml
- type: 'cta'
  id: 'cta'
  title: 'Masz pytania?'
  description: 'Skontaktuj się z nami już dziś.'
  align: 'center'
  spacing: 'lg'
  props:
    variant: 'centered'
    actions:
      - label: 'Skontaktuj się'
        to: '#contact-form'
        color: 'primary'
        variant: 'solid'
```

### Wyłączanie sekcji

Aby tymczasowo wyłączyć sekcję bez usuwania:

```yaml
- type: 'contact-form'
  id: 'contact-form'
  enabled: false # Sekcja nie będzie renderowana
  # ...
```

### Zmiana kolejności sekcji

Po prostu zmień kolejność elementów w tablicy `sections[]`:

```yaml
sections:
  - type: 'hero'
    # ...
  - type: 'contact-form' # Przeniesione wyżej
    # ...
  - type: 'contact-details' # Przeniesione niżej
    # ...
```

### Integracja z backendem

Formularz kontaktowy używa endpointu `/api/contact` (domyślnie). Aby zmienić endpoint:

```yaml
props:
  endpoint: '/api/custom-contact' # Własny endpoint
```

**Przygotowanie pod przyszły backend:**

1. Endpoint jest konfigurowalny przez `props.endpoint`
2. Composable `useContactForm` jest abstrakcją nad `$fetch` - łatwa podmiana
3. W przyszłości można:
   - Dodać rate limiting
   - Dodać captcha (Turnstile, reCAPTCHA)
   - Logować zgłoszenia do DB
   - Dodać panel admina do zarządzania wiadomościami

### Schema.org

Strona automatycznie generuje Schema.org:

- **ContactPage** - typ strony kontaktowej
- **Organization** - dane firmy z `app.meta.ts`

Schema jest generowany automatycznie na podstawie danych z `content/kontakt.md` i `app.meta.ts`.

### SEO

SEO jest konfigurowane w `seo`:

```yaml
seo:
  title: 'Kontakt - Tytuł SEO'
  description: 'Opis SEO'
  image: '/images/og-image.png'
```

### Rozwiązywanie problemów

#### Formularz nie wysyła się

- Sprawdź czy `endpoint` jest poprawny
- Sprawdź czy wszystkie wymagane pola są wypełnione
- Sprawdź czy `consent` jest zaznaczony (jeśli wymagany)
- Sprawdź konsolę przeglądarki i terminal serwera

#### Błąd walidacji

- Sprawdź czy pola zgodne z `ContactFormSchema` są poprawnie wypełnione
- Sprawdź czy `name`, `email`, `subject`, `message` są zgodne z wymaganiami

#### Sekcja nie wyświetla się

- Sprawdź czy `enabled: false` nie jest ustawione
- Sprawdź czy `type` jest poprawny
- Sprawdź czy `props` są zgodne ze schematem sekcji

#### Map nie wyświetla się

- Sprawdź czy `embedUrl` lub `linkUrl` jest ustawione
- Sprawdź czy `type` jest `embed` lub `link`
- Sprawdź czy URL jest poprawny
