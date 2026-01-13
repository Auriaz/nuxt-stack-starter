---
title: 'Nitro - Silnik serwerowy Nuxt, który zmienia zasady gry'
description: 'Odkryj Nitro - nowoczesny silnik serwerowy Nuxt, który umożliwia deployment wszędzie: Node.js, serverless, edge i statyczne hostingi.'
date: 2025-01-25
image:
  src: '/blog/nitro-server-engine.png'
  alt: 'Nitro - Silnik serwerowy Nuxt'
tags:
  - 'Nuxt'
  - 'Nitro'
  - 'Server Engine'
  - 'Full-Stack'
  - 'Deployment'
  - 'API'
authors:
  - name: 'Adam Stankiewicz'
    avatar:
      src: 'https://avatars.githubusercontent.com/u/26349096?v=4'
      alt: 'Adam Stankiewicz'
    description: 'Full-stack web developer passionate about building robust Nuxt and Vue applications.'
    to: 'https://github.com/Auriaz'
    target: '_blank'
seo:
  title: 'Nitro - Silnik serwerowy Nuxt, który zmienia zasady gry'
  description: 'Odkryj Nitro - nowoczesny silnik serwerowy Nuxt, który umożliwia deployment wszędzie: Node.js, serverless, edge i statyczne hostingi.'
  ogType: 'article'
to: '/blog/nitro-server-engine'
anchors:
  - label: 'Blog'
    to: '/blog'
    icon: 'i-lucide-book'
    target: '_self'
---

# Nitro - Silnik serwerowy Nuxt, który zmienia zasady gry

Podczas budowania Nuxt, zespół stworzył nowy silnik serwerowy: **Nitro**. To rewolucyjne rozwiązanie, które zmienia sposób, w jaki myślimy o deployment aplikacji webowych.

## Czym jest Nitro?

Nitro to nowoczesny silnik serwerowy dla Nuxt, który został zaprojektowany z myślą o elastyczności i wydajności. Zastępuje on poprzedni system serwerowy i oferuje znacznie więcej możliwości.

### Kluczowe cechy Nitro

- **Cross-platform support** - Działa na Node.js, przeglądarkach, service workers i więcej
- **Serverless support** - Gotowe wsparcie dla serverless out-of-the-box
- **API routes** - Wbudowane wsparcie dla endpointów API
- **Automatic code-splitting** - Automatyczne dzielenie kodu i asynchroniczne ładowanie chunków
- **Hybrid mode** - Tryb hybrydowy dla statycznych + serverless stron
- **Development server** - Serwer deweloperski z hot module reloading

## API Layer

Nitro używa [h3](https://github.com/h3js/h3) jako podstawy dla API Layer. Server API endpoints i middleware są automatycznie dodawane przez Nitro.

### Server Routes

API endpoints są tworzone przez umieszczenie plików w katalogu `server/api/`:

```typescript
// server/api/users.get.ts
export default defineEventHandler(async (event) => {
  const users = await getUsers()
  return users
})
```

Endpoint będzie dostępny pod adresem `/api/users` i automatycznie obsługuje metodę GET.

### Server Middleware

Middleware serwerowe można utworzyć w `server/middleware/`:

```typescript
// server/middleware/logging.ts
export default defineEventHandler((event) => {
  console.log(`Request: ${event.method} ${event.path}`)
})
```

Middleware są wykonywane przed każdym requestem.

### Kluczowe funkcje h3

- **Automatyczna obsługa JSON** - Handlery mogą zwracać obiekty/tablice, które są automatycznie konwertowane na JSON
- **Obsługa Promise** - Handlery mogą zwracać Promise, które są automatycznie awaitowane
- **Helper functions** - Funkcje pomocnicze dla body parsing, cookies, redirects, headers i więcej

## Direct API Calls

Jedną z najbardziej imponujących funkcji Nitro jest możliwość "bezpośrednich" wywołań API przez globalnie dostępny helper `$fetch`.

### Jak to działa?

```typescript
// W komponencie Vue
const data = await $fetch('/api/users')
```

Jeśli kod działa w przeglądarce, `$fetch` wykona normalne wywołanie HTTP. Ale jeśli kod działa na serwerze, `$fetch` **bezpośrednio wywoła odpowiednią funkcję**, oszczędzając dodatkowe wywołanie API!

### Korzyści

- **Lepsza wydajność** - Brak dodatkowego HTTP requestu na serwerze
- **Mniej opóźnień** - Bezpośrednie wywołanie funkcji
- **Prostszy kod** - Ten sam kod działa zarówno po stronie klienta, jak i serwera

### Przykład użycia

```vue
<script setup>
  // Ten sam kod działa zarówno na serwerze, jak i w przeglądarce
  const { data: users } = await useFetch('/api/users')
</script>
```

## Typed API Routes

Nitro automatycznie generuje typy dla API routes, o ile zwracasz wartość zamiast używać `res.end()`.

### Przykład

```typescript
// server/api/users.get.ts
export default defineEventHandler(async (event) => {
  return [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
  ]
})
```

Teraz, gdy używasz `$fetch` lub `useFetch`, TypeScript automatycznie wie, jaki typ zwraca endpoint:

```typescript
// Pełne wsparcie TypeScript!
const users = await $fetch('/api/users')
// users ma typ: { id: number, name: string }[]
```

## Standalone Server

Nitro produkuje standalone server dist, który jest niezależny od `node_modules`.

### Różnica w porównaniu do Nuxt 2

W Nuxt 2 serwer nie był standalone i wymagał części Nuxt core do działania przez uruchomienie `nuxt start`. To było kruche i nie nadawało się do środowisk serverless i service workers.

### Output Nitro

Nuxt generuje output podczas uruchomienia `nuxt build` do katalogu `.output/`. Ten output zawiera:

- **Runtime code** - Kod do uruchomienia serwera Nuxt w dowolnym środowisku
- **Static files** - Statyczne pliki do serwowania
- **Hybrid framework** - Prawdziwy framework hybrydowy dla JAMstack

### Deployment options

Dzięki Nitro możesz wdrożyć aplikację Nuxt w wielu środowiskach:

- **Node.js** - Tradycyjne serwery Node.js
- **Serverless** - AWS Lambda, Vercel Functions, Netlify Functions
- **Edge** - Cloudflare Workers, Vercel Edge Functions
- **Static** - Statyczne hostingi (Netlify, Vercel, GitHub Pages)
- **Docker** - Kontenery Docker
- **Service Workers** - Eksperymentalne wsparcie dla przeglądarek

## Przykłady deployment

### Vercel

```json
// vercel.json
{
  "buildCommand": "nuxt build",
  "outputDirectory": ".output/public"
}
```

### Netlify

```toml
# netlify.toml
[build]
  command = "nuxt build"
  publish = ".output/public"
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY .output .output
CMD ["node", ".output/server/index.mjs"]
```

## Native Storage Layer

Nitro implementuje natywną warstwę storage, wspierającą multi-source drivers i lokalne assets. To pozwala na łatwe zarządzanie danymi w różnych środowiskach.

## Podsumowanie

Nitro to potężny silnik serwerowy, który zmienia sposób, w jaki myślimy o deployment aplikacji Nuxt. Dzięki wsparciu dla wielu platform, automatycznym typom TypeScript i optymalizacji wydajności, Nitro sprawia, że Nuxt jest prawdziwie uniwersalnym frameworkiem.

Czy chcesz wdrożyć aplikację na Node.js, serverless, edge czy jako statyczną stronę - Nitro ma to wszystko pokryte.

**Dokumentacja:**

- [Server Engine](https://nuxt.com/docs/4.x/guide/concepts/server-engine)
- [Server Directory](https://nuxt.com/docs/4.x/directory-structure/server)
- [Nitro GitHub](https://github.com/nitrojs/nitro)
