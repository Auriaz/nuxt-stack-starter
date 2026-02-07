import type { BlogPostCreateInput } from '#shared/types/blog'
import { useAuth } from './useAuth'

const DRAFT_VERSION = 1
const STORAGE_KEY_PREFIX = 'blog:draft:v1'

export type BlogDraftPayload = Partial<BlogPostCreateInput>

export interface BlogDraftMeta {
  draftId: string
  updatedAt: string
  title: string
  slug: string
  excerpt: string
}

export interface BlogDraftRecord {
  version: number
  draftId: string
  updatedAt: string
  payload: BlogDraftPayload
  meta: BlogDraftMeta
}

interface BlogDraftStore {
  version: number
  userId: number
  drafts: BlogDraftRecord[]
}

function getStorageKey(userId: number): string {
  return `${STORAGE_KEY_PREFIX}:${userId}`
}

function createDraftId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizePayload(payload: BlogDraftPayload): BlogDraftPayload {
  const publishedAt = payload.publishedAt === null ? null : payload.publishedAt ?? undefined
  return {
    slug: payload.slug ?? '',
    title: payload.title ?? '',
    description: payload.description ?? '',
    bodyMd: payload.bodyMd ?? '',
    imageUrl: payload.imageUrl ?? '',
    publishedAt,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    anchors: Array.isArray(payload.anchors) ? payload.anchors : [],
    seoTitle: payload.seoTitle ?? '',
    seoDesc: payload.seoDesc ?? ''
  }
}

function buildMeta(draftId: string, updatedAt: string, payload: BlogDraftPayload): BlogDraftMeta {
  const title = (payload.title ?? '').trim()
  const slug = (payload.slug ?? '').trim()
  const rawExcerpt = (payload.description ?? payload.bodyMd ?? '').trim()
  const excerpt = rawExcerpt.slice(0, 120)
  return {
    draftId,
    updatedAt,
    title,
    slug,
    excerpt
  }
}

function readStore(userId: number): BlogDraftStore {
  if (!import.meta.client) {
    return { version: DRAFT_VERSION, userId, drafts: [] }
  }
  const key = getStorageKey(userId)
  const raw = localStorage.getItem(key)
  if (!raw) {
    return { version: DRAFT_VERSION, userId, drafts: [] }
  }
  try {
    const parsed = JSON.parse(raw) as BlogDraftStore
    if (!parsed || parsed.version !== DRAFT_VERSION || !Array.isArray(parsed.drafts)) {
      return { version: DRAFT_VERSION, userId, drafts: [] }
    }
    const drafts = parsed.drafts
      .filter(draft => draft && typeof draft.draftId === 'string')
      .map((draft) => {
        const payload = normalizePayload(draft.payload || {})
        const updatedAt = draft.updatedAt || new Date().toISOString()
        const meta = buildMeta(draft.draftId, updatedAt, payload)
        return {
          version: DRAFT_VERSION,
          draftId: draft.draftId,
          updatedAt,
          payload,
          meta
        }
      })
    return { version: DRAFT_VERSION, userId, drafts }
  } catch {
    return { version: DRAFT_VERSION, userId, drafts: [] }
  }
}

function writeStore(userId: number, store: BlogDraftStore): void {
  if (!import.meta.client) return
  const key = getStorageKey(userId)
  localStorage.setItem(key, JSON.stringify(store))
}

export function useBlogDraft() {
  const { user } = useAuth()
  const userId = computed(() => user.value?.id ?? null)

  function hasMeaningfulContent(payload: BlogDraftPayload): boolean {
    const title = (payload.title ?? '').trim()
    const body = (payload.bodyMd ?? '').trim()
    return title.length > 0 || body.length > 0
  }

  function listDrafts(): BlogDraftMeta[] {
    const id = userId.value
    if (!id) return []
    const store = readStore(id)
    return store.drafts
      .map(draft => draft.meta)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  function getDraft(draftId: string): BlogDraftRecord | null {
    const id = userId.value
    if (!id) return null
    const store = readStore(id)
    return store.drafts.find(draft => draft.draftId === draftId) || null
  }

  function getLatestDraft(): BlogDraftRecord | null {
    const id = userId.value
    if (!id) return null
    const store = readStore(id)
    const sorted = [...store.drafts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    return sorted[0] || null
  }

  function saveDraft(payload: BlogDraftPayload, draftId?: string | null): string | null {
    const id = userId.value
    if (!id) return null
    if (!import.meta.client) return null

    const store = readStore(id)
    const nextId = draftId || createDraftId()
    const updatedAt = new Date().toISOString()
    const normalized = normalizePayload(payload)
    const meta = buildMeta(nextId, updatedAt, normalized)
    const record: BlogDraftRecord = {
      version: DRAFT_VERSION,
      draftId: nextId,
      updatedAt,
      payload: normalized,
      meta
    }

    const existingIndex = store.drafts.findIndex(draft => draft.draftId === nextId)
    if (existingIndex >= 0) {
      store.drafts[existingIndex] = record
    } else {
      store.drafts.push(record)
    }

    store.drafts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    writeStore(id, store)
    return nextId
  }

  function deleteDraft(draftId: string): void {
    const id = userId.value
    if (!id) return
    if (!import.meta.client) return

    const store = readStore(id)
    store.drafts = store.drafts.filter(draft => draft.draftId !== draftId)
    if (store.drafts.length === 0) {
      localStorage.removeItem(getStorageKey(id))
      return
    }
    writeStore(id, store)
  }

  function clearDrafts(): void {
    const id = userId.value
    if (!id) return
    if (!import.meta.client) return
    localStorage.removeItem(getStorageKey(id))
  }

  return {
    hasMeaningfulContent,
    listDrafts,
    getDraft,
    getLatestDraft,
    saveDraft,
    deleteDraft,
    clearDrafts
  }
}
