# MCP Server - Przewodnik Użycia

## 🎯 Co to jest MCP?

MCP (Model Context Protocol) to protokół, który umożliwia AI asystentom (jak Cursor, Claude Desktop) dostęp do strukturyzowanych danych i narzędzi z Twojego projektu. Dzięki temu AI może lepiej rozumieć Twój kod i pomagać w rozwoju.

## ✅ Status

MCP Server jest **skonfigurowany i gotowy do użycia**.

Endpoint: `http://localhost:3000/mcp` (wymaga POST request - standard MCP)

## 📦 Dostępne Narzędzia

### Tools (Narzędzia dla AI)

1. **`list_api_endpoints`**
   - Lista wszystkich endpointów API w projekcie
   - Filtrowanie po metodzie HTTP (GET, POST, etc.)
   - **Kiedy używać**: "Jakie endpointy API są dostępne?"

2. **`list_schemas`**
   - Lista wszystkich schematów Valibot w `shared/schemas/`
   - **Kiedy używać**: "Jakie schematy są dostępne w projekcie?"

3. **`get_schema`**
   - Pobiera zawartość konkretnego schematu
   - **Kiedy używać**: "Pokaż mi schemat sekcji Hero"

4. **`get_database_schema`**
   - Schemat Prisma z wszystkimi modelami i polami
   - **Kiedy używać**: "Jaka jest struktura bazy danych?"

5. **`get_component_info`**
   - Informacje o komponencie Vue (props, imports, slots)
   - **Kiedy używać**: "Jak używać komponentu PageSection?"

### Resources (Zasoby kontekstowe)

1. **`readme`**
   - Plik README projektu z dokumentacją

2. **`architecture-guide`**
   - Przewodnik po architekturze projektu
   - Zasady systemowe i flow danych

### Prompts (Szablony)

1. **`create_new_section`**
   - Pomoc w tworzeniu nowej sekcji strony
   - Krok po kroku zgodnie z architekturą
   - **Parametry**: `sectionName` (opcjonalny, np. "gallery", "testimonials")
   - **Przykład użycia**: "Pomóż mi utworzyć nową sekcję Gallery"

2. **`add_api_endpoint`**
   - Pomoc w dodawaniu nowego endpointu API
   - Zgodnie z warstwową architekturą
   - **Parametry**: `endpointName` (opcjonalny), `method` (opcjonalny, GET/POST/PUT/DELETE/PATCH)
   - **Przykład użycia**: "Jak dodać endpoint API dla produktów?"

## 🚀 Jak Skonfigurować w Cursor

### Krok 1: Uruchom serwer deweloperski

```bash
bun dev
```

### Krok 2: Dodaj MCP Server w Cursor

1. Otwórz ustawienia Cursor:
   - `Ctrl + ,` (Windows) lub `Cmd + ,` (Mac)
   - Wyszukaj "MCP" lub przejdź do: **Features → MCP Servers**

2. Kliknij **"Add MCP Server"** lub **"Connect"**

3. Wybierz typ: **HTTP** (nie OAuth!)

4. Wypełnij formularz:
   - **Name**: `Fullstack Base Starter` (lub dowolna nazwa)
   - **Type**: `http`
   - **URL**: `http://localhost:3000/mcp`
   - **Authentication**: **NIE** wybieraj OAuth - zostaw puste lub wybierz "None"

5. **WAŻNE**: Jeśli widzisz opcję OAuth Authentication:
   - Kliknij **"Back to Connect"** lub **"Skip Authentication"**
   - Lokalny MCP server **NIE wymaga** OAuth
   - OAuth jest tylko dla zewnętrznych, publicznych MCP serverów

6. Zrestartuj Cursor po konfiguracji

### Krok 3: Sprawdź połączenie

W Cursor możesz teraz pytać AI:

- "Jakie endpointy API są dostępne?"
- "Pokaż mi schemat sekcji Features"
- "Jaka jest struktura bazy danych?"
- "Pomóż mi utworzyć nową sekcję Gallery" (wymaga nazwy sekcji w pytaniu)
- "Jak dodać endpoint API dla produktów?" (AI automatycznie wywnioskuje metodę HTTP)

AI automatycznie użyje narzędzi MCP, aby uzyskać aktualne informacje o projekcie.

## 💡 Praktyczne Zastosowania

### 1. Onboarding Nowych Developerów

AI może pomóc nowym developerom zrozumieć:

- Architekturę projektu (przez `architecture-guide`)
- Dostępne endpointy API
- Strukturę bazy danych
- Jak dodawać nowe funkcje

### 2. Szybkie Wyszukiwanie Informacji

Zamiast przeszukiwać kod ręcznie, możesz zapytać AI:

- "Jakie są wszystkie sekcje dostępne w projekcie?"
- "Pokaż mi przykład użycia PageSection"
- "Jakie są wymagane pola w schemacie User?"

### 3. Tworzenie Nowych Funkcji

AI może pomóc w tworzeniu:

- Nowych sekcji (używając `create_new_section` prompt)
- Nowych endpointów API (używając `add_api_endpoint` prompt)
- Nowych komponentów (zrozumienie istniejących wzorców)

### 4. Debugowanie i Refaktoryzacja

AI może pomóc:

- Znaleźć wszystkie użycia konkretnego schematu
- Zrozumieć zależności między komponentami
- Sprawdzić zgodność z architekturą

## 🔧 Rozszerzanie MCP Server

Możesz dodać własne narzędzia:

### Dodaj nowy Tool

Utwórz plik w `server/mcp/tools/my-tool.ts`:

```typescript
import { z } from 'zod'

export default defineMcpTool({
  description: 'Opis co robi narzędzie',
  inputSchema: {
    param: z.string().describe('Parametr'),
  },
  async handler({ param }) {
    // Twoja logika
    return jsonResult({ result: 'data' })
  },
})
```

### Dodaj nowy Resource

Utwórz plik w `server/mcp/resources/my-resource.ts`:

```typescript
export default defineMcpResource({
  name: 'my-resource',
  description: 'Opis zasobu',
  file: 'path/to/file.md', // lub custom handler
})
```

### Dodaj nowy Prompt

Utwórz plik w `server/mcp/prompts/my-prompt.ts`:

```typescript
import { z } from 'zod'

export default defineMcpPrompt({
  description: 'Opis promptu',
  inputSchema: {
    topic: z.string().describe('Temat'),
  },
  async handler({ topic }) {
    return {
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Pomoc z tematem: ${topic}`,
          },
        },
      ],
    }
  },
})
```

## 🐛 Troubleshooting

### MCP Server nie odpowiada

1. Sprawdź, czy serwer działa: `bun dev`
2. Sprawdź endpoint: `http://localhost:3000/mcp` (wymaga POST)
3. Sprawdź logi w terminalu

### Cursor nie łączy się z MCP

1. **Problem z OAuth**: Jeśli Cursor próbuje użyć OAuth:
   - Kliknij **"Back to Connect"** lub **"Skip Authentication"**
   - Lokalny MCP server nie wymaga OAuth
   - Wybierz typ **HTTP** bez autentykacji

2. Sprawdź URL w konfiguracji: `http://localhost:3000/mcp`
3. Upewnij się, że serwer jest uruchomiony (`bun dev`)
4. Sprawdź, czy port 3000 nie jest zablokowany
5. Zrestartuj Cursor po zmianie konfiguracji
6. Sprawdź logi w terminalu Nuxt - powinny być informacje o załadowanych MCP tools/resources

### Błędy w narzędziach MCP

1. Sprawdź logi w terminalu Nuxt
2. Upewnij się, że pliki istnieją (schematy, komponenty, etc.)
3. Sprawdź uprawnienia do odczytu plików

## 📚 Więcej Informacji

- [Nuxt MCP Toolkit Dokumentacja](https://mcp-toolkit.nuxt.dev)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Przykłady MCP](https://github.com/nuxt/nuxt.com/tree/main/server/mcp)
