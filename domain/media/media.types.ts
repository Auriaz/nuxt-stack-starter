/**
 * Minimalny interfejs storage dla use-case'ów media.
 * Implementacja w server/services/storage (local.provider, s3.provider).
 */
export interface MediaStorage {
  save(relativePath: string, buffer: Buffer, mimeType?: string): Promise<void>
}
