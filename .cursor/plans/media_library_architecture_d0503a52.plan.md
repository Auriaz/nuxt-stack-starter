---
name: Media Library Architecture
overview: 'Plan architektury systemu multimedialnego (Media Library) do zarządzania zdjęciami i filmami w aplikacji Nuxt 4 full-stack: storage (MVP local → v2 S3), model Prisma, API, domain, resources, UI i integracja z portfolio/blog/profil.'
todos: []
isProject: false
---

# Plan architektury Media Library

## 1. Strategia storage (MVP → v2)

**Rekomendacja: MVP — pliki poza `public`, serwowane przez endpoint; v2 — S3-compatible z signed URLs.**

| Aspekt      | MVP (local)                                                                         | v2 (S3)                                                               |
| ----------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Lokalizacja | Katalog poza `public` (np. `storage/uploads/`)                                      | Bucket S3/R2/MinIO                                                    |
| Dostęp      | Endpoint `GET /api/media/:id/serve` zwraca plik (stream) po sprawdzeniu sesji/owner | Signed URLs (GET) z krótkim TTL; upload przez presigned POST          |
| Plusy       | Brak zależności, prosty deploy na VPS/Hostinger, pełna kontrola                     | Skalowalność, CDN, brak obciążania Nitro, backup po stronie providera |
| Minusy      | Dyski VPS, brak CDN, backup ręczny                                                  | Konfiguracja, koszt, dodatkowa infrastruktura                         |

**Public folder vs private + endpoint**

- **Nie** trzymać uploadów w `public/` — każdy ma bezpośredni dostęp do URL; brak kontroli dostępu.
- **Tak** — trzymać w `storage/uploads/` (lub inny katalog poza `public`) i serwować przez `GET /api/media/:id/serve`: w handlerze sprawdzamy sesję i owner (lub `media.read` / public read tylko dla określonych pól, np. avatar). Daje to kontrolę dostępu i spójność z RBAC.

**Signed URLs (v2)**  
Dla S3: generowanie signed GET URL (np. 1h TTL) w `GET /api/media/:id/url`; frontend przekierowuje lub używa URL w `<img>`. Upload dużych plików: presigned POST, frontend wysyła plik bezpośrednio do S3, potem `POST /api/media/confirm-upload` z key/metadata — backend tworzy rekord `MediaAsset`.

**CDN (przyszłość)**  
Przy S3/R2 można ustawić CDN (Cloudflare itd.) przed bucketem; signed URLs nadal generowane przez backend. MVP bez CDN.

**Konwencja ścieżek**

Rekomendacja: `**/uploads/<userId>/<mediaId>/<variant>.<ext>**`

- `userId` — izolacja per user, łatwe czyszczenie.
- `mediaId` — unikalny katalog per asset; w v2 ułatwia warianty (original, thumb, webp) w jednym "folderze".
- `variant`: `original` (MVP), potem `thumb`, `medium`, `webp` itd.

Przykład: `storage/uploads/1/abc123xyz/original.jpg`. W DB w `storagePath` trzymamy względną ścieżkę np. `1/abc123xyz/original.jpg`.

---

## 2. Model danych Prisma

**MediaAsset** (MVP)

```prisma
model MediaAsset {
  id              String   @id @default(cuid())
  ownerId         Int
  type            String   // 'image' | 'video' | 'file'
  status          String   @default("ready") // 'processing' | 'ready' | 'failed'
  originalName    String
  mimeType        String
  sizeBytes       Int
  width           Int?
  height          Int?
  durationSeconds Int?     // video
  checksum        String?  // optional, np. sha256
  storageProvider String  @default("local") // 'local' | 's3'
  storagePath     String  // relative path in storage
  alt             String?
  caption         String?
  tags            String[] // PostgreSQL array or Json
  deletedAt       DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  owner User @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  usages MediaUsage[]  // v2

  @@index([ownerId, createdAt])
  @@index([ownerId, type])
  @@index([deletedAt])
  // tags: @@index na tags jeśli Prisma/DB wspiera; alternatywa: osobna tabela MediaTag (v2)
}
```

W `User` dodać: `mediaAssets MediaAsset[]`.

**MediaUsage** (v2, zaplanowane)

```prisma
model MediaUsage {
  id         Int      @id @default(autoincrement())
  assetId    String
  entityType String   // 'portfolio' | 'blog' | 'profile' | 'page_section'
  entityId   String   // id wpisu/portfolio/profile/page
  field      String   // 'cover' | 'gallery' | 'avatar' | 'hero_image'
  createdAt  DateTime @default(now())

  asset MediaAsset @relation(fields: [assetId], references: [id], onDelete: Cascade)

  @@unique([assetId, entityType, entityId, field])
  @@index([entityType, entityId])
  @@index([assetId])
}
```

**Soft delete:** `deletedAt` w `MediaAsset`. Listy i wyszukiwanie filtrują `deletedAt: null`. Usunięcie "na stałe" (hard) można w v2 (cron lub endpoint admin) po sprawdzeniu, że nie ma `MediaUsage`.

---

## 3. Walidacja i schemy (Valibot)

Lokalizacja: [shared/schemas/media.ts](shared/schemas/media.ts) (nowy plik).

- **UploadDirectInputSchema** — nie multipart w Valibot; multipart parsowany w API, a body/metadata (alt, caption, tags?) walidowane osobnym schematem. Dla pliku: w handlerze sprawdzenie `file.type`, `file.size` po stronie serwera.
- **UpdateMediaMetadataSchema**: `object({ alt: optional(string()), caption: optional(string()), tags: optional(array(string())) })`.
- **MediaListQuerySchema**: `object({ type: optional(picklist(['image','video','file'])), search: optional(string()), tags: optional(array(string())), page: optional(number()), perPage: optional(number()) })` z wartościami domyślnymi (np. page 1, perPage 24).
- **DeleteMediaSchema**: dla body soft-delete np. `object({ hard: optional(boolean()) })` (v2).

Walidacja pliku w use-case/serwisie (MVP):

- **Typy:** whitelist MIME: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `video/mp4`.
- **Rozmiar:** np. max 10 MB obrazy, 50 MB wideo (konfigurowalne).
- **Bezpieczeństwo:** zapis pod wygenerowaną nazwą (cuid + rozszerzenie z mapowania MIME), nigdy `originalName` w ścieżce; sanity check: rozszerzenie pliku vs `mimeType`.

Eksport w [shared/schemas/index.ts](shared/schemas/index.ts).

---

## 4. API — endpointy, kontrakty, kody błędów

Wszystkie endpointy wymagają sesji (`requireUserSession`). Dostęp: zwykły user tylko do własnych zasobów (ownerId === session.user.id); admin z uprawnieniem `media.manage` — do wszystkich. Sprawdzenie w use-case lub w API po `requirePermission(event, 'media.manage')` i wtedy pomijanie filtra owner.

**MVP endpointy**

| Metoda | Ścieżka                | Opis                               | Request                                                   | Response                                                                     | Błędy                                                                  |
| ------ | ---------------------- | ---------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| POST   | `/api/media/upload`    | Upload pliku (multipart/form-data) | `file` (required), opcjonalnie `alt`, `caption`, `tags[]` | `{ data: MediaAssetDTO }`                                                    | 400 FILE_TYPE_NOT_ALLOWED, 413 PAYLOAD_TOO_LARGE, 422 VALIDATION_ERROR |
| GET    | `/api/media`           | Lista zasobów użytkownika          | Query: type, search, tags, page, perPage                  | `{ data: { items: MediaAssetDTO[], pagination: { page, perPage, total } } }` | 422 VALIDATION_ERROR                                                   |
| GET    | `/api/media/:id`       | Szczegóły zasobu                   | —                                                         | `{ data: MediaAssetDTO }`                                                    | 403 FORBIDDEN, 404 NOT_FOUND                                           |
| PATCH  | `/api/media/:id`       | Aktualizacja metadanych            | UpdateMediaMetadataSchema                                 | `{ data: MediaAssetDTO }`                                                    | 403, 404, 422                                                          |
| DELETE | `/api/media/:id`       | Soft delete                        | —                                                         | `{ data: { ok: true } }`                                                     | 403, 404                                                               |
| GET    | `/api/media/:id/serve` | Serwowanie pliku (stream)          | —                                                         | Binary (Content-Type z mimeType)                                             | 403, 404                                                               |

**DTO**

- **MediaAssetDTO**: id, ownerId, type, status, originalName, mimeType, sizeBytes, width, height, durationSeconds, storageProvider, **url** (computed: dla local np. `/api/media/:id/serve`, dla S3 w v2 — signed URL lub pole do uzupełnienia w endpointcie), alt, caption, tags, createdAt, updatedAt. Bez `storagePath` (wewnętrzne).

**v2 (do planu):**

- `POST /api/media/:id/transform` — kolejkowanie crop/resize (worker).
- `GET /api/media/:id/download` — nagłówek Content-Disposition: attachment (jeśli storage private).
- Presigned upload: `GET /api/media/upload-url?filename=...&mimeType=...` → signed URL; `POST /api/media/confirm-upload` z key + metadata → utworzenie rekordu.

Standard błędów: jak w projekcie — `{ error: { code, message, status, issues?, requestId } }` (np. 401 UNAUTHORIZED, 403 FORBIDDEN, 404 NOT_FOUND, 422 VALIDATION_ERROR, 500 INTERNAL_ERROR).

---

## 5. Domain i repozytoria

**Use-case’y** w [domain/media/](domain/):

- **uploadMedia.usecase.ts** — input: userId, file (buffer + mimeType + originalName), opcjonalne alt, caption, tags. Walidacja typu/rozmiaru, zapis przez storage service, odczyt wymiarów (obraz) lub duration (wideo) jeśli możliwe (np. sharp/ffprobe — opcjonalnie MVP), zapis w repo, zwrot DTO.
- **listMedia.usecase.ts** — userId, query (type, search, tags, page, perPage), opcjonalnie bypassOwner (dla admina). Repo zwraca listę + total; use-case mapuje na DTO + pagination.
- **getMedia.usecase.ts** — userId, mediaId, bypassOwner?; zwraca MediaAssetDTO lub NotFoundError/ForbiddenError.
- **updateMedia.usecase.ts** — userId, mediaId, payload (alt, caption, tags); sprawdzenie owner, update w repo, zwrot DTO.
- **deleteMedia.usecase.ts** — userId, mediaId, soft: true; sprawdzenie owner, ustawienie `deletedAt` (hard delete w v2 z warunkiem braku MediaUsage).

**Repozytorium** [server/repositories/mediaAsset.repo.ts](server/repositories/mediaAsset.repo.ts):

- `create(data)`, `findById(id)`, `findByIdForOwner(id, ownerId)`, `listByOwner(ownerId, filters, pagination)`, `update(id, ownerId, data)`, `softDelete(id, ownerId)`, (v2) `countUsages(assetId)`.

**Storage**

- [server/services/storage/storage.service.ts](server/services/storage/storage.service.ts) — interfejs: `save(path, buffer, mimeType)`, `getStream(path)`, `delete(path)`, `getPublicUrl(path)` (dla local zwraca np. base URL + `/api/media/:id/serve` nie jest w storage — to w use-case/API).
- [server/services/storage/local.provider.ts](server/services/storage/local.provider.ts) — implementacja zapisu do `storage/uploads/...`, odczyt streamu z dysku.
- v2: [server/services/storage/s3.provider.ts](server/services/storage/s3.provider.ts) — S3 put/get/delete + signed URL.

Zasada: API tylko parse → validate (Valibot) → use-case → return DTO. Domain używa repo i storage; nie importuje H3.

---

## 6. Autoryzacja i uprawnienia (RBAC)

W [shared/permissions.ts](shared/permissions.ts) dodać:

- `MEDIA_READ: 'media.read'` — podgląd własnych zasobów (domyślnie: zalogowany user = własne).
- `MEDIA_CREATE: 'media.create'` — upload.
- `MEDIA_UPDATE: 'media.update'` — edycja metadanych własnych.
- `MEDIA_DELETE: 'media.delete'` — usuwanie własnych.
- `MEDIA_MANAGE: 'media.manage'` — dostęp do wszystkich zasobów (admin).

Logika w endpointach:

- Wymagana sesja: `requireUserSession(event)`.
- Dla list/get/update/delete: jeśli user ma `media.manage` — pomijamy filtr owner; w przeciwnym razie tylko `ownerId === session.user.id`.
- Upload: wymaga `media.create` (lub domyślnie każdy zalogowany); limity (rozmiar, typ) w use-case.
- Serwowanie pliku `GET /api/media/:id/serve`: po pobraniu rekordu sprawdzenie: owner lub `media.manage`; potem stream z storage.

Przypisanie uprawnień do ról w panelu admin (istniejący system ról/permissions).

---

## 7. Frontend — resources i UI

**Resource** [app/composables/resources/useMediaResource.ts](app/composables/resources/useMediaResource.ts):

- `upload(file: File, meta?: { alt?: string, caption?: string, tags?: string[] })` — FormData, POST `/api/media/upload`, zwraca `Promise<MediaAssetDTO | null>`.
- `list(params: MediaListQuery)` — GET `/api/media`, zwraca `{ items, pagination }`.
- `get(id: string)` — GET `/api/media/:id`.
- `update(id: string, payload: UpdateMediaMetadata)` — PATCH `/api/media/:id`.
- `remove(id: string)` — DELETE `/api/media/:id`.
- `serveUrl(id: string)` — zwraca URL do podglądu (np. `/api/media/:id/serve`; z tokenem/session cookie wystarczy same URL w img/src).

Wszystkie wywołania przez `useApiClient()`; błędy rzucane jak dziś (H3Error z `data.error`), obsługa w komponentach lub nad useForm gdzie potrzeba.

**Typy** w [shared/types/media.ts](shared/types/media.ts): MediaAssetDTO, MediaListQuery, MediaListResponse, UpdateMediaMetadata (InferOutput z schematów gdzie możliwe).

**Komponenty UI (Nuxt UI + motion-v)**

- **Dashboard (strona Media Library):**
  - [app/pages/dashboard/media/index.vue](app/pages/dashboard/media/index.vue) — strona z listą i uploadem.
  - **MediaLibrary.vue** — kontener: pasek filtrów (typ, wyszukiwanie, tagi) + MediaUploader + MediaGrid.
  - **MediaUploader.vue** — dropzone (drag & drop), progress, walidacja po stronie klienta (typ, rozmiar), wywołanie `useMediaResource().upload()`.
  - **MediaGrid.vue** — siatka kart (grid), ładowanie: skeleton (Nuxt UI / custom).
  - **MediaCard.vue** — miniatura, nazwa, typ, rozmiar; klik → otwarcie MediaDetailsDrawer; opcje (edycja metadanych, usuń).
  - **MediaDetailsDrawer.vue** — UDrawer: podgląd (img/video), metadane, alt/caption/tags, przyciski edycja/usuń; wywołania resource.
- **Picker (użycie w innych miejscach):**
  - **MediaPicker.vue** — props: `modelValue: string | null` (mediaAssetId), `accept?: string` (image/video); emituje `update:modelValue(id)`. Wewnątrz: przycisk "Wybierz z biblioteki" → modal/drawer z listą (uproszczony MediaGrid) i wyszukiwaniem; wybór ustawia id i zamyka.
  - **MediaField.vue** — input-like dla formularzy: wyświetla wybrany asset (miniatura + nazwa) lub placeholder; "Zmień" otwiera MediaPicker. Użycie w formularzach portfolio (cover, gallery), blog (og image), profil (avatar), sekcje stron (hero). Wartość w formularzu: `mediaAssetId` (string) lub null.

UX: loading skeletons na liście i w drawerze; UAlert przy sukcesie/błędzie (soft, zamykalne); drag & drop z wizualnym feedbackiem; wyszukiwarka i filtry w jednym pasku.

**Motion-v:** wejście listy (stagger na MediaCard), otwarcie/zamknięcie drawera (slide), hover na kartach (lift + shadow). Preset w jednym pliku lub inline w komponentach.

---

## 8. Integracja z aplikacją (portfolio, blog, profile, sections)

- **Zasada:** moduły przechowują **tylko `mediaAssetId**`(string). URL do wyświetlenia pobierają przez`GET /api/media/:id`(lub cache) i używają`url`z DTO (np.`/api/media/:id/serve`) albo w v2 signed URL.
- **Portfolio:** w CMS/edycji: pole cover = MediaField (mediaAssetId); gallery = tablica mediaAssetId. W schemacie portfolio (content lub DB) zapis: `coverMediaId`, `galleryMediaIds[]`.
- **Blog:** og image / inline = mediaAssetId; w frontmatter lub w bazie: `ogImageMediaId`, opcjonalnie `inlineMediaIds[]`.
- **Profil:** avatar = mediaAssetId; w User/Profile: `avatarMediaId` (zamiast lub obok `avatarUrl`; można trzymać avatarUrl jako denormalizację dla szybkiego odczytu).
- **Sekcje stron (Page Builder):** w SectionSchema pole np. `heroImageMediaId`; w komponencie sekcji renderowanie przez MediaField/url z API.

Unikanie duplikacji: jeden plik w Media Library, wiele referencji przez mediaAssetId. v2 **MediaUsage** rejestruje każde użycie (entityType, entityId, field); przed usunięciem assetu sprawdzamy usages i blokujemy lub ostrzegamy.

---

## 9. Bezpieczeństwo (MVP vs v2)

**MVP:**

- Whitelist MIME (image/jpeg, image/png, image/webp, image/gif, video/mp4).
- Limit rozmiaru (konfigurowalne, np. 10 MB / 50 MB).
- Owner check na każdym endpoincie; serwowanie pliku tylko po autoryzacji.
- Zapis pod wygenerowaną ścieżką (cuid + ext); brak ufania do `originalName` (path traversal); sanity check rozszerzenie vs MIME.

**v2:**

- Skan antywirusowy (np. ClamAV) po uploadzie przed zapisem do storage.
- Signed URLs dla S3; private bucket.
- Rate limiting na POST `/api/media/upload`.
- Kolejka do przetwarzania obrazów (resize, webp) w tle; status `processing` → `ready`/`failed`.

---

## 10. Struktura plików (podsumowanie)

```
domain/media/
  uploadMedia.usecase.ts
  listMedia.usecase.ts
  getMedia.usecase.ts
  updateMedia.usecase.ts
  deleteMedia.usecase.ts
server/repositories/
  mediaAsset.repo.ts
server/services/storage/
  storage.service.ts   (interface + factory)
  local.provider.ts
server/api/media/
  upload.post.ts
  index.get.ts
  [id].get.ts
  [id].patch.ts
  [id].delete.ts
  [id]/serve.get.ts
shared/schemas/media.ts
shared/types/media.ts
app/composables/resources/useMediaResource.ts
app/components/Media/
  MediaLibrary.vue
  MediaUploader.vue
  MediaGrid.vue
  MediaCard.vue
  MediaDetailsDrawer.vue
  MediaPicker.vue
  MediaField.vue
app/pages/dashboard/media/index.vue
```

(v2: mediaUsage.repo.ts, MediaUsage model, s3.provider.ts, transform/confirm-upload endpointy.)

---

## 11. Checklisty wdrożenia

**MVP**

- Prisma: model MediaAsset, relacja User.mediaAssets, migracja.
- Storage: katalog storage/uploads, local.provider + storage.service (save, getStream, delete).
- Valibot: schemas media (update metadata, list query); walidacja pliku w use-case (MIME, size).
- Repo: mediaAsset.repo (create, findById, findByIdForOwner, listByOwner, update, softDelete).
- Domain: upload, list, get, update, delete use-case’y; zwracanie DTO z `url` dla serve.
- Permissions: media.read, media.create, media.update, media.delete, media.manage w shared/permissions i w meta.
- API: upload (multipart), index.get, [id].get, [id].patch, [id].delete, [id]/serve.get; auth + owner/media.manage.
- Shared types: MediaAssetDTO, MediaListQuery, MediaListResponse, UpdateMediaMetadata.
- useMediaResource: upload, list, get, update, remove, serveUrl.
- UI: MediaLibrary, MediaUploader, MediaGrid, MediaCard, MediaDetailsDrawer; strona dashboard/media.
- Motion-v: stagger list, drawer transition, card hover.
- Testy: use-case’y (opcjonalnie), ręczne testy upload/list/serve/delete.

**v2**

- MediaUsage model + migracja; mediaUsage.repo; sprawdzanie usages przed usunięciem.
- S3 provider + konfiguracja; signed URL (GET); presigned upload (POST) + confirm-upload.
- Endpoint transform (kolejka) lub cron; generowanie miniatury/webp; status processing.
- Rate limit upload; opcjonalnie ClamAV.
- MediaPicker + MediaField; integracja w formularzach portfolio/blog/profile/sections.
- Zapisywanie mediaAssetId w portfolio/blog/profile/sections zamiast surowych ścieżek.
- CDN przed S3 (dokumentacja / konfiguracja).
