<script lang="ts" setup>
import dayjs from 'dayjs'
import { BlogPostUpdateSchema } from '#shared/schemas/blog'
import type { BlogAnchorDTO } from '#shared/types/blog'
import { slugify } from '#shared/utils/content'
import { useBlogResource } from '~/composables/resources/useBlogResource'
import { useMarkdownRender } from '~/composables/useMarkdownRender'
import { useAiTextCompletion } from '~/composables/useAiTextCompletion'
import BlogEditor from '~/components/blog/BlogEditor.vue'
import AppBlogSidebar, { type BlogFormState } from '~/components/blog/BlogSidebar.vue'
import ContentProseHtml from '~/components/content/ContentProseHtml.vue'
import AuthorAbout from '~/components/content/author_about.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'content-manage']
})

const { locale } = useI18n()
const { user } = useAuth()
const toast = useToast()
const blogResource = useBlogResource()
const authorAvatarSrc = useAvatarSrc(() => user.value?.avatarUrl ?? undefined)
const route = useRoute()

function parseId(value: unknown): number | null {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

const id = computed(() => parseId(route.params.id))

const { data: post, refresh: refreshPost } = await useAsyncData(
  () => `dashboard-blog-post-${id.value}`,
  () => (id.value ? blogResource.getById(id.value) : Promise.resolve(null)),
  { watch: [id] }
)

useSeoMeta({
  title: () => post.value ? `${post.value.title} - Edycja - Blog` : 'Edycja postu - Blog - Dashboard',
  description: 'Edycja posta blogowego'
})

const form = useForm(BlogPostUpdateSchema, {
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

const aiMetaLoading = ref<'title' | 'description' | 'seoTitle' | 'seoDesc' | null>(null)
const { complete: aiComplete } = useAiTextCompletion()

watch(
  () => post.value,
  (p) => {
    if (p) {
      form.setValues({
        slug: p.slug,
        title: p.title,
        description: p.description ?? '',
        bodyMd: p.bodyMd,
        imageUrl: p.imageUrl ?? '',
        publishedAt: p.publishedAt ?? undefined,
        tags: p.tags ?? [],
        anchors: (p.anchors ?? []).map((a: BlogAnchorDTO) => ({
          label: a.label,
          to: a.to,
          order: a.order,
          icon: a.icon,
          target: a.target
        })),
        seoTitle: p.seoTitle ?? '',
        seoDesc: p.seoDesc ?? ''
      })
    }
  },
  { immediate: true }
)

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

const canSave = computed(() => !!id.value && !!post.value && !form.pending.value)

async function saveChanges() {
  if (!id.value || !post.value) {
    toast.add({
      title: 'Post jeszcze sie laduje',
      description: 'Poczekaj chwile i sprobuj ponownie.',
      color: 'warning'
    })
    return
  }
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
    form.formError.value = 'Uzupelnij wymagane pola, aby zapisac zmiany.'
    return
  }

  if (!(v?.slug ?? '').trim() && title) {
    form.setField('slug', slugify(title))
  }

  const nextSlug = (form.values.value?.slug ?? '').trim()
  if (!nextSlug) {
    setFieldError('slug', 'Brak slugu. Ustaw slug przed zapisem.')
    form.formError.value = 'Brak slugu. Ustaw slug przed zapisem.'
    return
  }

  const valid = form.validate()
  if (!valid) {
    form.formError.value = 'Sprawdz formularz i popraw bledy.'
    return
  }
  form.pending.value = true
  form.formError.value = null
  try {
    const payload: Parameters<typeof blogResource.update>[1] = {
      slug: v?.slug ?? '',
      title: v?.title ?? '',
      description: v?.description ?? undefined,
      bodyMd: v?.bodyMd ?? '',
      imageUrl: v?.imageUrl ?? undefined,
      publishedAt: v?.publishedAt as string | null | undefined,
      tags: v?.tags ?? [],
      anchors: (v?.anchors ?? []).map((a, i) => ({
        label: a.label?.trim() || '',
        to: a.to?.trim() || '#',
        order: a.order ?? i,
        icon: a.icon?.trim() || undefined,
        target: a.target?.trim() || undefined
      })),
      seoTitle: v?.seoTitle ?? undefined,
      seoDesc: v?.seoDesc ?? undefined
    }
    const updated = await blogResource.update(id.value, payload)
    if (updated) {
      await refreshPost()
      toast.add({ title: 'Zapisano zmiany', color: 'success' })
    } else {
      form.setErrorsFromApi({
        data: { error: { message: 'Nie udało się zapisać zmian.' } }
      })
    }
  } catch (e: unknown) {
    form.setErrorsFromApi(e)
  } finally {
    form.pending.value = false
  }
}

async function removePost() {
  if (!id.value) return
  const ok = await blogResource.remove(id.value)
  if (ok) {
    toast.add({ title: 'Post usunięty', color: 'success' })
    await navigateTo('/dashboard/blog')
  } else {
    toast.add({ title: 'Nie udało się usunąć posta', color: 'error' })
  }
}

const previewUrl = computed(() => post.value ? blogResource.postPath(post.value) : null)
const { toHtml } = useMarkdownRender()
const previewHtml = computed(() => toHtml(form.values.value?.bodyMd ?? ''))
const previewPublishedAt = computed(() => (form.values.value as { publishedAt?: string | null } | undefined)?.publishedAt ?? undefined)

const previewPanelOpen = ref(true)
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

const editorScrollRef = ref<HTMLElement | null>(null)
const previewScrollRef = ref<HTMLElement | null>(null)
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
      :title="post ? post.title : 'Edycja postu'"
      icon="i-lucide-pencil"
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
            color="primary"
            :loading="form.pending.value"
            :disabled="!canSave"
            @click="saveChanges"
          >
            Zapisz zmiany
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
            Podglad
          </UButton>
          <UButton
            variant="soft"
            color="neutral"
            :icon="previewPanelOpen ? 'i-lucide-panel-right-close' : 'i-lucide-eye'"
            :disabled="form.pending.value"
            :title="previewPanelOpen ? 'Ukryj podglad' : 'Pokaz podglad'"
            @click="previewPanelOpen = !previewPanelOpen"
          >
            {{ previewPanelOpen ? 'Ukryj podglad' : 'Podglad (prose)' }}
          </UButton>
          <UButton
            variant="outline"
            color="error"
            :disabled="form.pending.value"
            @click="removePost"
          >
            Usun post
          </UButton>
        </div>
      </template>

      <template #body>
        <div
          v-if="!id"
          class="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20"
        >
          <p class="text-error-600 dark:text-error-400">
            Nieprawidlowy identyfikator postu.
          </p>
          <UButton
            to="/dashboard/blog"
            variant="soft"
            color="neutral"
            class="mt-3"
          >
            Wroc do listy
          </UButton>
        </div>

        <div
          v-else-if="post"
          ref="splitContainerRef"
          class="flex w-full min-h-0 flex-1 gap-0"
          style="min-height: 420px;"
        >
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
                label="Tresc (Markdown)"
                name="bodyMd"
                :error="form.errors.value?.bodyMd"
                class="w-full"
              >
                <BlogEditor
                  :model-value="form.values.value?.bodyMd ?? ''"
                  placeholder="Tresc posta (Markdown). Uzyj / dla polecen."
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

          <div
            v-show="previewPanelOpen"
            class="flex w-1.5 shrink-0 cursor-col-resize select-none items-stretch bg-default hover:bg-primary/20 active:bg-primary/30"
            aria-label="Zmien szerokosc"
            @mousedown="startResize"
          >
            <span class="mx-auto w-px bg-border" />
          </div>

          <div
            v-show="previewPanelOpen"
            class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-r-lg border border-default border-l-0 bg-default"
          >
            <div class="border-b border-default px-3 py-2 text-sm font-medium text-muted">
              Podglad (jak docelowy post)
            </div>
            <div
              ref="previewScrollRef"
              class="min-h-0 flex-1 overflow-auto p-4 md:p-6"
              @scroll="onPreviewScroll"
            >
              <article class="max-w-none space-y-4">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-3xl">
                  {{ form.values.value?.title || 'Bez tytulu' }}
                </h1>
                <p
                  v-if="form.values.value?.description"
                  class="text-muted text-base leading-relaxed"
                >
                  {{ form.values.value.description }}
                </p>
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
                      {{ dayjs(previewPublishedAt).locale(locale).format('DD.MM.YYYY') }}
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
                        :alt="user?.name ?? user?.email ?? ''"
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
                <img
                  v-if="form.values.value?.imageUrl"
                  :src="form.values.value.imageUrl"
                  :alt="form.values.value?.title ?? 'Post'"
                  class="w-full rounded-lg object-cover"
                >
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
                    Wpisz tresc w edytorze, aby zobaczyc podglad.
                  </p>
                </div>
                <AuthorAbout
                  :src="user?.avatarUrl"
                  :name="user?.name ?? user?.email ?? 'Autor'"
                />
              </article>
            </div>
          </div>
        </div>

        <div
          v-else
          class="rounded-lg border border-default bg-default-50 p-4"
        >
          <p class="text-muted">
            Ladowanie...
          </p>
        </div>
      </template>

      <template #sidebar>
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
  </NuxtLayout>
</template>
