<script lang="ts" setup>
import dayjs from 'dayjs'
import { BlogPostCreateSchema } from '#shared/schemas/blog'
import { useDebounceFn } from '@vueuse/core'
import { slugify } from '#shared/utils/content'
import { useBlogResource } from '~/composables/resources/useBlogResource'
import { useMarkdownRender } from '~/composables/useMarkdownRender'
import { useBlogDraft, type BlogDraftMeta, type BlogDraftPayload, type BlogDraftRecord } from '~/composables/useBlogDraft'
import { useAiTextCompletion } from '~/composables/useAiTextCompletion'
import AppBlogSidebar, { type BlogFormState } from '~/components/blog/BlogSidebar.vue'
import ModalConfirmation from '~/components/Modal/Confirmation/ModalConfirmation.vue'
import ContentProseHtml from '~/components/content/ContentProseHtml.vue'
import AuthorAbout from '~/components/content/author_about.vue'

const { locale } = useI18n()
const { user } = useAuth()
const toast = useToast()

const authorAvatarSrc = useAvatarSrc(() => user.value?.avatarUrl ?? undefined)

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Dodaj post - Blog - Dashboard',
  description: 'Tworzenie nowego posta blogowego'
})

const blogResource = useBlogResource()
const form = useForm(BlogPostCreateSchema, {
  initialValues: {
    slug: '',
    title: '',
    description: '',
    bodyMd: '',
    imageUrl: '',
    publishedAt: undefined,
    tags: [],
    anchors: [],
    seoTitle: '',
    seoDesc: ''
  }
})

const draftManager = useBlogDraft()
const route = useRoute()
const draftModalOpen = ref(false)
const draftItems = ref<BlogDraftMeta[]>([])
const activeDraftId = ref<string | null>(null)
const showMissingDraftNotice = ref(false)
const deleteDraftModalRef = ref<InstanceType<typeof ModalConfirmation> | null>(null)
const clearDraftsModalRef = ref<InstanceType<typeof ModalConfirmation> | null>(null)

const aiMetaLoading = ref<'title' | 'description' | 'seoTitle' | 'seoDesc' | null>(null)
const { complete: aiComplete } = useAiTextCompletion()

function setFieldError(field: string, message: string): void {
  form.errors.value = { ...form.errors.value, [field]: message }
}

function clearFieldError(field: string): void {
  if (!form.errors.value?.[field]) return
  const { [field]: _ignored, ...rest } = form.errors.value
  form.errors.value = rest
}

function normalizeAiLine(text: string): string {
  return text
    .replace(/^["'“”„]+|["'“”„]+$/g, '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join(' ')
    .trim()
}

function buildAiMetaContext() {
  const title = (form.values.value?.title ?? '').trim()
  const description = (form.values.value?.description ?? '').trim()
  const body = (form.values.value?.bodyMd ?? '').trim()
  const trimmedBody = body.length > 3000 ? `${body.slice(0, 3000)}...` : body
  const parts = [
    title ? `Tytul: ${title}` : null,
    description ? `Opis: ${description}` : null,
    trimmedBody ? `Tresc (Markdown):\n${trimmedBody}` : null
  ].filter(Boolean)
  return parts.length ? parts.join('\n\n') : 'Brak tresci.'
}

async function runAiMeta(kind: 'title' | 'description' | 'seoTitle' | 'seoDesc') {
  if (aiMetaLoading.value) return
  aiMetaLoading.value = kind
  try {
    const context = buildAiMetaContext()
    let instruction = ''
    if (kind === 'title') {
      instruction = 'Wygeneruj chwytliwy tytul posta (max 70 znakow).'
    } else if (kind === 'description') {
      instruction = 'Wygeneruj krotki opis posta (1-2 zdania, max 200 znakow).'
    } else if (kind === 'seoTitle') {
      instruction = 'Wygeneruj meta tytul SEO (max 60 znakow).'
    } else {
      instruction = 'Wygeneruj meta opis SEO (140-160 znakow).'
    }
    const prompt = [
      `Instrukcja: ${instruction}`,
      'Zadanie: zwroc tylko wynik, bez komentarzy ani cudzyslowow.',
      'Kontekst:',
      context
    ].join('\n\n')
    const result = await aiComplete(prompt, 'edit')
    const value = normalizeAiLine(result || '')
    if (!value) {
      setFieldError(kind === 'seoTitle' ? 'seoTitle' : kind === 'seoDesc' ? 'seoDesc' : kind, 'Brak wyniku z AI.')
      return
    }
    if (kind === 'title') form.setField('title', value)
    if (kind === 'description') form.setField('description', value)
    if (kind === 'seoTitle') form.setField('seoTitle', value)
    if (kind === 'seoDesc') form.setField('seoDesc', value)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nie udalo sie wygenerowac tresci AI.'
    toast.add({
      title: 'Asystent AI',
      description: message,
      color: 'warning'
    })
  } finally {
    aiMetaLoading.value = null
  }
}

function buildDraftPayload(): BlogDraftPayload {
  const v = form.values.value
  return {
    slug: v?.slug ?? '',
    title: v?.title ?? '',
    description: v?.description ?? '',
    bodyMd: v?.bodyMd ?? '',
    imageUrl: v?.imageUrl ?? '',
    publishedAt: v?.publishedAt ?? undefined,
    tags: v?.tags ?? [],
    anchors: v?.anchors ?? [],
    seoTitle: v?.seoTitle ?? '',
    seoDesc: v?.seoDesc ?? ''
  }
}

function refreshDrafts(): void {
  draftItems.value = draftManager.listDrafts()
}

function applyDraft(draft: BlogDraftRecord): void {
  form.reset()
  form.setValues(draft.payload as unknown as BlogFormState)
  activeDraftId.value = draft.draftId
}

function continueLatestDraft(): void {
  const latest = draftManager.getLatestDraft()
  if (!latest) {
    showMissingDraftNotice.value = true
    return
  }
  applyDraft(latest)
  draftModalOpen.value = false
}

function continueDraftById(draftId: string): void {
  const draft = draftManager.getDraft(draftId)
  if (!draft) {
    showMissingDraftNotice.value = true
    return
  }
  applyDraft(draft)
  draftModalOpen.value = false
}

function startNewPost(): void {
  form.reset()
  activeDraftId.value = null
  showMissingDraftNotice.value = false
  draftManager.clearDrafts()
  refreshDrafts()
  draftModalOpen.value = false
}

function requestDeleteDraft(draftId: string): void {
  deleteDraftModalRef.value?.open(draftId)
}

function confirmDeleteDraft(draftId?: string): void {
  if (!draftId) return
  if (activeDraftId.value === draftId) {
    activeDraftId.value = null
  }
  draftManager.deleteDraft(draftId)
  refreshDrafts()
  if (draftItems.value.length === 0) {
    draftModalOpen.value = false
  }
}

function requestClearDrafts(): void {
  clearDraftsModalRef.value?.open()
}

function confirmClearDrafts(): void {
  activeDraftId.value = null
  draftManager.clearDrafts()
  refreshDrafts()
  draftModalOpen.value = false
}

const debouncedAutoSave = useDebounceFn(() => {
  if (!import.meta.client) return
  const payload = buildDraftPayload()
  if (!draftManager.hasMeaningfulContent(payload)) return
  const nextId = draftManager.saveDraft(payload, activeDraftId.value)
  if (nextId) {
    activeDraftId.value = nextId
    refreshDrafts()
  }
}, 800)

watch(
  () => form.values.value,
  () => {
    debouncedAutoSave()
  },
  { deep: true }
)

watch(
  () => form.values.value?.title,
  (value) => {
    if ((value ?? '').trim()) clearFieldError('title')
  }
)

watch(
  () => form.values.value?.slug,
  (value) => {
    if ((value ?? '').trim()) clearFieldError('slug')
  }
)

watch(
  () => form.values.value?.description,
  (value) => {
    if ((value ?? '').trim()) clearFieldError('description')
  }
)

watch(
  () => form.values.value?.bodyMd,
  (value) => {
    if ((value ?? '').trim()) clearFieldError('bodyMd')
  }
)

onMounted(() => {
  refreshDrafts()
  const mode = Array.isArray(route.query.mode) ? route.query.mode[0] : route.query.mode
  if (mode === 'continue') {
    if (draftItems.value.length > 0) {
      continueLatestDraft()
    } else {
      showMissingDraftNotice.value = true
    }
    return
  }
  if (draftItems.value.length > 0) {
    draftModalOpen.value = true
  }
})

async function submit(asDraft: boolean) {
  const v = form.values.value
  const title = (v?.title ?? '').trim()
  const bodyMd = (v?.bodyMd ?? '').trim()
  const description = (v?.description ?? '').trim()
  form.formError.value = null
  clearFieldError('title')
  clearFieldError('slug')
  clearFieldError('description')
  clearFieldError('bodyMd')

  if (!title) {
    setFieldError('title', 'Brak tytulu. Uzupelnij tytul posta.')
  }
  if (!bodyMd) {
    setFieldError('bodyMd', 'Brak tresci. Uzupelnij tresc posta.')
  }
  if (!description) {
    setFieldError('description', 'Brak opisu. Uzupelnij krotki opis posta.')
  }
  if (!title || !bodyMd || !description) {
    return
  }

  if (!(v?.slug ?? '').trim() && title) {
    form.setField('slug', slugify(title))
  }

  const nextSlug = (form.values.value?.slug ?? '').trim()
  if (!nextSlug) {
    setFieldError('slug', 'Brak slugu. Ustaw slug przed zapisem.')
    return
  }

  try {
    const exists = await blogResource.slugExists(nextSlug)
    if (exists) {
      setFieldError('slug', 'Slug jest juz zajety. Wybierz inny.')
      return
    }
  } catch {
    // Jesli nie udalo sie sprawdzic, pozostaw walidacje po stronie API.
  }
  const payload = {
    slug: v?.slug ?? '',
    title: v?.title ?? '',
    description: v?.description ?? undefined,
    bodyMd: v?.bodyMd ?? '',
    imageUrl: v?.imageUrl ?? undefined,
    publishedAt: asDraft ? undefined : (v?.publishedAt || new Date().toISOString()),
    tags: v?.tags ?? [],
    anchors: (v?.anchors ?? [])
      .filter((a: { label?: string }) => (a.label ?? '').trim())
      .map((a: { label: string, to: string, order?: number, icon?: string, target?: string }, i: number) => ({
        label: a.label.trim(),
        to: (a.to ?? '').trim() || '#',
        order: a.order ?? i,
        icon: a.icon?.trim() || undefined,
        target: a.target?.trim() || undefined
      })),
    seoTitle: v?.seoTitle || undefined,
    seoDesc: v?.seoDesc || undefined
  }
  const valid = form.validate()
  if (!valid) return
  form.pending.value = true
  form.formError.value = null
  try {
    const post = await blogResource.create(payload)
    if (post) {
      if (activeDraftId.value) {
        draftManager.deleteDraft(activeDraftId.value)
        activeDraftId.value = null
      }
      await navigateTo(`/dashboard/blog/${post.id}`)
    } else {
      form.setErrorsFromApi({
        data: { error: { message: 'Nie udało się utworzyć posta.' } }
      })
    }
  } catch (e: unknown) {
    const apiError = (e as { data?: { error?: { code?: string } } })?.data?.error
    if (apiError?.code === 'DUPLICATE_ERROR') {
      setFieldError('slug', 'Slug jest juz zajety. Wybierz inny.')
      return
    }
    form.setErrorsFromApi(e)
  } finally {
    form.pending.value = false
  }
}

function saveDraft() {
  submit(true)
}

function publish() {
  submit(false)
}

const previewSlug = computed(() => {
  const s = form.values.value?.slug?.trim()
  return s || null
})

const previewUrl = computed(() => {
  const slug = previewSlug.value
  return slug ? `/blog/${slug}` : null
})

const { toHtml } = useMarkdownRender()
const previewHtml = computed(() => toHtml(form.values.value?.bodyMd ?? ''))

/** Panel podglądu włączony = widok podzielony (edytor | podgląd). */
const previewPanelOpen = ref(true)
/** Szerokość edytora w % gdy panel podglądu jest otwarty (resizable). */
const editorWidthPercent = ref(55)
const splitContainerRef = ref<HTMLElement | null>(null)
const resizing = ref(false)
let startX = 0
let startPercent = 0

function startResize(e: MouseEvent) {
  e.preventDefault()
  resizing.value = true
  startX = e.clientX
  startPercent = editorWidthPercent.value
  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

function onResizeMove(e: MouseEvent) {
  if (!resizing.value || !splitContainerRef.value) return
  const w = splitContainerRef.value.offsetWidth
  if (!w) return
  const delta = e.clientX - startX
  const deltaPercent = (delta / w) * 100
  const next = Math.min(75, Math.max(25, startPercent + deltaPercent))
  editorWidthPercent.value = next
}

function stopResize() {
  resizing.value = false
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

/** Refy do kontenerów przewijania (edytor i podgląd). */
const editorScrollRef = ref<HTMLElement | null>(null)
const previewScrollRef = ref<HTMLElement | null>(null)
/** Blokada pętli: gdy true, ignorujemy zdarzenie scroll z drugiego panelu. */
let scrollSyncLock = false

function getScrollRatio(el: HTMLElement): number {
  const max = el.scrollHeight - el.clientHeight
  if (max <= 0) return 0
  return el.scrollTop / max
}

function setScrollByRatio(el: HTMLElement, ratio: number) {
  const max = el.scrollHeight - el.clientHeight
  if (max <= 0) return
  el.scrollTop = Math.max(0, Math.min(1, ratio)) * max
}

function onEditorScroll() {
  if (scrollSyncLock || !editorScrollRef.value || !previewScrollRef.value) return
  scrollSyncLock = true
  const ratio = getScrollRatio(editorScrollRef.value)
  setScrollByRatio(previewScrollRef.value, ratio)
  requestAnimationFrame(() => {
    scrollSyncLock = false
  })
}

function onPreviewScroll() {
  if (scrollSyncLock || !editorScrollRef.value || !previewScrollRef.value) return
  scrollSyncLock = true
  const ratio = getScrollRatio(previewScrollRef.value)
  setScrollByRatio(editorScrollRef.value, ratio)
  requestAnimationFrame(() => {
    scrollSyncLock = false
  })
}
</script>

<template>
  <NuxtLayout name="dashboard">
    <DashboardPanel
      title="Dodaj post"
      icon="i-lucide-plus"
    >
      <template #left>
        <div class="w-full h-full flex justify-end flex-wrap items-center gap-3 px-4 border-r border-neutral-300 dark:border-neutral-700">
          <UButton
            to="/dashboard/blog"
            variant="outline"
            color="neutral"
            :disabled="form.pending.value"
          >
            Anuluj
          </UButton>
          <UButton
            variant="outline"
            color="primary"
            :loading="form.pending.value"
            @click="saveDraft"
          >
            Zapisz szkic
          </UButton>
          <UButton
            color="primary"
            :loading="form.pending.value"
            @click="publish"
          >
            Publikuj
          </UButton>
          <UButton
            v-if="previewUrl"
            :to="previewUrl"
            target="_blank"
            variant="soft"
            color="neutral"
            icon="i-lucide-external-link"
            :disabled="form.pending.value"
          >
            Podgląd
          </UButton>
          <UButton
            variant="soft"
            color="neutral"
            :icon="previewPanelOpen ? 'i-lucide-panel-right-close' : 'i-lucide-eye'"
            :disabled="form.pending.value"
            :title="previewPanelOpen ? 'Ukryj podgląd' : 'Pokaż podgląd'"
            @click="previewPanelOpen = !previewPanelOpen"
          >
            {{ previewPanelOpen ? 'Ukryj podgląd' : 'Podgląd (prose)' }}
          </UButton>
        </div>
      </template>

      <template #body>
        <UAlert
          v-if="showMissingDraftNotice"
          color="warning"
          variant="soft"
          title="Brak szkicu do kontynuacji"
          description="Nie znaleziono zapisanej wersji roboczej. Możesz rozpocząć nowy post."
          icon="i-lucide-alert-triangle"
          class="mb-4"
        />
        <div
          ref="splitContainerRef"
          class="flex w-full min-h-0 flex-1 gap-0"
          style="min-height: 420px;"
        >
          <!-- Edytor: zajmuje X% lub 100% gdy podgląd ukryty -->
          <div
            class="flex min-h-0 min-w-0 flex-col shrink-0 overflow-hidden transition-[width] duration-150"
            :style="{ width: previewPanelOpen ? `${editorWidthPercent}%` : '100%' }"
          >
            <div
              ref="editorScrollRef"
              class="flex w-full flex-1 flex-col space-y-4 overflow-auto"
              @scroll="onEditorScroll"
            >
              <UFormField
                label="Treść (Markdown)"
                name="bodyMd"
                :error="form.errors.value?.bodyMd"
                class="w-full"
              >
                <BlogEditor
                  :model-value="form.values.value?.bodyMd ?? ''"
                  placeholder="Treść posta (Markdown). Użyj / dla poleceń."
                  class="w-full"
                  @update:model-value="form.setField('bodyMd', $event)"
                />
              </UFormField>

              <div
                v-if="form.formError.value"
                class="rounded-lg border border-error-200 bg-error-50 p-3 dark:border-error-800 dark:bg-error-900/20"
              >
                <p class="text-sm text-error-600 dark:text-error-400">
                  {{ form.formError.value }}
                </p>
              </div>
            </div>
          </div>

          <!-- Separator do zmiany szerokości -->
          <div
            v-show="previewPanelOpen"
            class="flex w-1.5 shrink-0 cursor-col-resize select-none items-stretch bg-default hover:bg-primary/20 active:bg-primary/30"
            aria-label="Zmień szerokość"
            @mousedown="startResize"
          >
            <span class="mx-auto w-px bg-border" />
          </div>

          <!-- Podgląd: układ jak docelowy post (zdjęcie, tytuł, autor, data, tagi, treść) -->
          <div
            v-show="previewPanelOpen"
            class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-r-lg border border-default border-l-0 bg-default"
          >
            <div class="border-b border-default px-3 py-2 text-sm font-medium text-muted">
              Podgląd (jak docelowy post)
            </div>
            <div
              ref="previewScrollRef"
              class="min-h-0 flex-1 overflow-auto p-4 md:p-6"
              @scroll="onPreviewScroll"
            >
              <article class="max-w-none space-y-4">
                <!-- Tytuł -->
                <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-3xl">
                  {{ form.values.value?.title || 'Bez tytułu' }}
                </h1>
                <!-- Opis -->
                <p
                  v-if="form.values.value?.description"
                  class="text-muted text-base leading-relaxed"
                >
                  {{ form.values.value.description }}
                </p>
                <!-- Meta: data, autor, tagi -->
                <div class="flex flex-col gap-2 border-b border-default pb-4">
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                    <time
                      v-if="form.values.value?.publishedAt"
                      class="flex items-center gap-1"
                    >
                      <UIcon
                        name="i-lucide-calendar"
                        class="h-4 w-4 shrink-0"
                      />
                      {{ dayjs(form.values.value.publishedAt).locale(locale).format('DD.MM.YYYY') }}
                    </time>
                    <span
                      v-else
                      class="flex items-center gap-1"
                    >
                      <UIcon
                        name="i-lucide-calendar"
                        class="h-4 w-4 shrink-0"
                      />
                      Szkic (brak daty publikacji)
                    </span>
                    <span class="flex items-center gap-2">
                      <UAvatar
                        v-if="user?.avatarUrl"
                        size="xs"
                        :src="authorAvatarSrc"
                        :alt="user.name ?? user.email ?? ''"
                      />
                      <span class="text-black dark:text-white">{{ user?.name ?? user?.email ?? 'Ty' }}</span>
                    </span>
                  </div>
                  <div
                    v-if="(form.values.value?.tags ?? []).length"
                    class="flex flex-wrap gap-2"
                  >
                    <UBadge
                      v-for="(tag, idx) in (form.values.value?.tags ?? [])"
                      :key="idx"
                      :label="tag"
                      variant="subtle"
                      size="sm"
                    />
                  </div>
                </div>
                <!-- Zdjęcie główne -->
                <img
                  v-if="form.values.value?.imageUrl"
                  :src="form.values.value.imageUrl"
                  :alt="form.values.value?.title ?? 'Post'"
                  class="w-full rounded-lg object-cover"
                >
                <!-- Treść (prose) -->
                <div class="pt-2">
                  <ContentProseHtml
                    v-if="previewHtml"
                    :html="previewHtml"
                    class="max-w-none"
                  />
                  <p
                    v-else
                    class="text-muted text-sm"
                  >
                    Wpisz treść w edytorze, aby zobaczyć podgląd.
                  </p>
                </div>
                <!-- O autorze -->
                <AuthorAbout
                  :src="user?.avatarUrl"
                  :name="user?.name ?? user?.email ?? 'Autor'"
                />
              </article>
            </div>
          </div>
        </div>
      </template>

      <template #sidebar>
        <!-- Sidebar: podstawowe dane, publikacja, obraz, SEO, tagi -->
        <div class="w-full">
          <AppBlogSidebar
            :form="(form.values.value as unknown as BlogFormState)"
            :loading="form.pending.value"
            :errors="form.errors.value"
            :ai-loading="aiMetaLoading"
            @generate-title="() => runAiMeta('title')"
            @generate-description="() => runAiMeta('description')"
            @generate-seo-title="() => runAiMeta('seoTitle')"
            @generate-seo-desc="() => runAiMeta('seoDesc')"
          />
        </div>
      </template>
    </DashboardPanel>

    <UModal
      v-model:open="draftModalOpen"
      title="Kontynuować poprzedni szkic?"
      :ui="{ content: 'max-w-2xl' }"
    >
      <template #body>
        <div class="space-y-4">
          <UAlert
            color="primary"
            variant="soft"
            title="Znaleziono zapisane szkice"
            description="Wybierz szkic do kontynuacji lub rozpocznij nowy post."
            icon="i-lucide-file-edit"
          />

          <div class="space-y-3">
            <UCard
              v-for="draft in draftItems"
              :key="draft.draftId"
              variant="soft"
            >
              <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div class="min-w-0">
                  <div class="font-semibold text-basic-900 dark:text-basic-100 truncate">
                    {{ draft.title || 'Bez tytułu' }}
                  </div>
                  <div class="text-xs text-muted">
                    {{ draft.slug ? `Slug: ${draft.slug}` : 'Brak slugu' }}
                  </div>
                  <div
                    v-if="draft.excerpt"
                    class="text-xs text-muted mt-1 line-clamp-2"
                  >
                    {{ draft.excerpt }}
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-xs text-muted whitespace-nowrap">
                    {{ dayjs(draft.updatedAt).locale(locale).format('DD.MM.YYYY HH:mm') }}
                  </div>
                  <UButton
                    color="primary"
                    size="sm"
                    @click="continueDraftById(draft.draftId)"
                  >
                    Kontynuuj
                  </UButton>
                  <UButton
                    variant="outline"
                    color="error"
                    size="sm"
                    icon="i-lucide-trash-2"
                    @click="requestDeleteDraft(draft.draftId)"
                  />
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex flex-wrap items-center justify-end gap-3">
          <UButton
            v-if="draftItems.length > 1"
            variant="outline"
            color="error"
            @click="requestClearDrafts"
          >
            Wyczysc wszystkie szkice
          </UButton>
          <UButton
            variant="outline"
            color="neutral"
            @click="startNewPost"
          >
            Rozpocznij nowy post
          </UButton>
        </div>
      </template>
    </UModal>

    <ModalConfirmation
      ref="deleteDraftModalRef"
      title="Usunac szkic?"
      description="Ten szkic zostanie trwale usuniety z pamieci lokalnej."
      confirm-label="Usun"
      cancel-label="Anuluj"
      variant="danger"
      @confirm="(arg: unknown) => confirmDeleteDraft(arg as string)"
    />

    <ModalConfirmation
      ref="clearDraftsModalRef"
      title="Wyczyscic wszystkie szkice?"
      description="Wszystkie zapisane szkice zostana trwale usuniete z pamieci lokalnej."
      confirm-label="Wyczysc"
      cancel-label="Anuluj"
      variant="danger"
      @confirm="confirmClearDrafts"
    />
  </NuxtLayout>
</template>
