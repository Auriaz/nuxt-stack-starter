import { localStorageProvider } from './local.provider'
import type { StorageProvider } from './storage.types'

let instance: StorageProvider = localStorageProvider

/**
 * Serwis storage — dostarcza aktywny provider (MVP: local).
 * v2: można przełączyć na S3 przez konfigurację.
 */
export function getStorageService(): StorageProvider {
  return instance
}

export function setStorageService(provider: StorageProvider): void {
  instance = provider
}

export type { StorageProvider } from './storage.types'
