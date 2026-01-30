import { createReadStream } from 'node:fs'
import { access, mkdir, readdir, rmdir, unlink, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { Readable } from 'node:stream'
import type { StorageProvider } from './storage.types'

const STORAGE_DIR = 'storage/uploads'

function resolvePath(relativePath: string): string {
  // W Nitro/dev process.cwd() to root projektu
  return join(process.cwd(), STORAGE_DIR, relativePath)
}

function getStorageRoot(): string {
  return join(process.cwd(), STORAGE_DIR)
}

/** Po usunięciu pliku usuwa puste katalogi nadrzędne (np. userId/uuid/) do storage root. */
async function removeEmptyParentDirs(fileFullPath: string): Promise<void> {
  let currentDir = dirname(fileFullPath)
  const storageRoot = getStorageRoot()
  while (currentDir !== storageRoot && currentDir.startsWith(storageRoot)) {
    try {
      const entries = await readdir(currentDir)
      if (entries.length === 0) {
        await rmdir(currentDir)
        currentDir = dirname(currentDir)
      } else {
        break
      }
    } catch {
      break
    }
  }
}

export const localStorageProvider: StorageProvider = {
  async save(relativePath: string, buffer: Buffer, _mimeType?: string): Promise<void> {
    const fullPath = resolvePath(relativePath)
    await mkdir(dirname(fullPath), { recursive: true })
    await writeFile(fullPath, buffer)
  },

  async getStream(relativePath: string): Promise<Readable> {
    const fullPath = resolvePath(relativePath)
    return createReadStream(fullPath)
  },

  async delete(relativePath: string): Promise<void> {
    const fullPath = resolvePath(relativePath)
    await unlink(fullPath)
    await removeEmptyParentDirs(fullPath)
  },

  async exists(relativePath: string): Promise<boolean> {
    try {
      await access(resolvePath(relativePath))
      return true
    } catch {
      return false
    }
  }
}
