import type { MediaAssetDTO } from '#shared/types'

export interface MediaAssetRecord {
  id: string
  ownerId: number
  type: string
  status: string
  originalName: string
  mimeType: string
  sizeBytes: number
  width: number | null
  height: number | null
  durationSeconds: number | null
  storageProvider: string
  storagePath: string
  alt: string | null
  caption: string | null
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Mapuje rekord z repo na DTO. url dla local = /api/media/:id/serve.
 */
export function toMediaAssetDTO(record: MediaAssetRecord, baseUrl?: string): MediaAssetDTO {
  const servePath = `/api/media/${record.id}/serve`
  const url = baseUrl ? `${baseUrl.replace(/\/$/, '')}${servePath}` : servePath
  return {
    id: record.id,
    ownerId: record.ownerId,
    type: record.type as MediaAssetDTO['type'],
    status: record.status as MediaAssetDTO['status'],
    originalName: record.originalName,
    mimeType: record.mimeType,
    sizeBytes: record.sizeBytes,
    width: record.width ?? undefined,
    height: record.height ?? undefined,
    durationSeconds: record.durationSeconds ?? undefined,
    storageProvider: record.storageProvider,
    url,
    alt: record.alt ?? undefined,
    caption: record.caption ?? undefined,
    tags: record.tags,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  }
}
