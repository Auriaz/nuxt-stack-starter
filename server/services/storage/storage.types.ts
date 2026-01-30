import type { Readable } from 'node:stream'

/**
 * Interfejs providera storage dla plików Media Library.
 * MVP: local filesystem; v2: S3-compatible.
 */
export interface StorageProvider {
  /** Zapisuje bufor pod zadaną ścieżką (względną). Tworzy katalogi jeśli potrzeba. */
  save(relativePath: string, buffer: Buffer, mimeType?: string): Promise<void>

  /** Zwraca stream do odczytu pliku. */
  getStream(relativePath: string): Promise<Readable>

  /** Usuwa plik (lub katalog z plikiem). */
  delete(relativePath: string): Promise<void>

  /** Sprawdza czy plik istnieje. */
  exists(relativePath: string): Promise<boolean>
}
