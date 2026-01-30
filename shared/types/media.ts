import type { InferOutput } from 'valibot'
import type { UpdateMediaMetadataSchema, MediaListQuerySchema } from '#shared/schemas/media'

/** DTO zasobu medialnego (zwracany przez API) */
export interface MediaAssetDTO {
  id: string
  ownerId: number
  type: 'image' | 'video' | 'file'
  status: 'processing' | 'ready' | 'failed'
  originalName: string
  mimeType: string
  sizeBytes: number
  width?: number
  height?: number
  durationSeconds?: number
  storageProvider: string
  url: string
  alt?: string
  caption?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type UpdateMediaMetadata = InferOutput<typeof UpdateMediaMetadataSchema>
export type MediaListQuery = InferOutput<typeof MediaListQuerySchema>

export interface MediaListPagination {
  page: number
  perPage: number
  total: number
}

export interface MediaListResponse {
  items: MediaAssetDTO[]
  pagination: MediaListPagination
}
