import { object, string, optional, array, number, picklist, boolean } from 'valibot'

/**
 * Schemat metadanych do uploadu (alt, caption, tags) — walidacja pól z multipart.
 */
export const UploadMetadataSchema = object({
  alt: optional(string()),
  caption: optional(string()),
  tags: optional(array(string()))
})

/**
 * Schemat aktualizacji metadanych zasobu (PATCH /api/media/:id)
 */
export const UpdateMediaMetadataSchema = object({
  alt: optional(string()),
  caption: optional(string()),
  tags: optional(array(string()))
})

/**
 * Schemat query listy zasobów (GET /api/media)
 */
export const MediaListQuerySchema = object({
  type: optional(picklist(['image', 'video', 'file'])),
  search: optional(string()),
  tags: optional(array(string())),
  page: optional(number()),
  perPage: optional(number())
})

/**
 * Schemat body usuwania (v2: opcjonalnie hard delete)
 */
export const DeleteMediaSchema = object({
  hard: optional(boolean())
})
