/**
 * Dozwolone typy MIME (whitelist) i limity rozmiaru (bytes).
 */
export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
] as const

export const ALLOWED_VIDEO_MIMES = ['video/mp4'] as const

export const ALLOWED_MIMES = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES] as const

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4'
}

export function getExtensionForMime(mimeType: string): string {
  return MIME_TO_EXT[mimeType] ?? 'bin'
}

export function getMediaTypeFromMime(mimeType: string): 'image' | 'video' | 'file' {
  if (ALLOWED_IMAGE_MIMES.includes(mimeType as (typeof ALLOWED_IMAGE_MIMES)[number])) {
    return 'image'
  }
  if (ALLOWED_VIDEO_MIMES.includes(mimeType as (typeof ALLOWED_VIDEO_MIMES)[number])) {
    return 'video'
  }
  return 'file'
}

export function isAllowedMime(mimeType: string): boolean {
  return (ALLOWED_MIMES as readonly string[]).includes(mimeType)
}

export function getMaxSizeForMime(mimeType: string): number {
  if ((ALLOWED_IMAGE_MIMES as readonly string[]).includes(mimeType)) {
    return MAX_IMAGE_SIZE_BYTES
  }
  if ((ALLOWED_VIDEO_MIMES as readonly string[]).includes(mimeType)) {
    return MAX_VIDEO_SIZE_BYTES
  }
  return 0
}
