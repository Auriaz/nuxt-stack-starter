<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import type { BlogTagDTO, BlogAnchorInput } from '#shared/types/blog'
import { slugify, getExcerpt } from '#shared/utils/content'
import { useBlogResource } from '~/composables/resources/useBlogResource'
import BlogImagePicker from './BlogImagePicker.vue'

/** Formularz posta zgodny z API (slug, title, description, bodyMd, imageUrl, publishedAt, tags, anchors, seoTitle, seoDesc). */
export interface BlogFormState {
  slug: string
  title: string
  description: string
  bodyMd: string
  imageUrl: string
  publishedAt: string
  tags: string[]
  anchors?: BlogAnchorInput[]
  seoTitle: string
  seoDesc: string
}

interface Props {
  form: BlogFormState
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const tagInput = ref('')
const availableTags = ref<BlogTagDTO[]>([])
const loadingTags = ref(false)
const addingTag = ref(false)
const blogResource = useBlogResource()

function tagsInclude(name: string): boolean {
  const lower = name.toLowerCase()
  return (props.form.tags ?? []).some(t => t.toLowerCase() === lower)
}

async function loadTags() {
  loadingTags.value = true
  try {
    const list = await blogResource.listTags()
    availableTags.value = list ?? []
  } finally {
    loadingTags.value = false
  }
}

async function addTag() {
  const tag = tagInput.value.trim()
  if (!tag || !props.form.tags) return
  if (tagsInclude(tag)) {
    tagInput.value = ''
    return
  }
  addingTag.value = true
  try {
    const created = await blogResource.createTag(tag)
    const nameToAdd = created?.name ?? tag
    if (!tagsInclude(nameToAdd)) {
      props.form.tags.push(nameToAdd)
    }
    tagInput.value = ''
    if (created && !availableTags.value.some(t => t.name.toLowerCase() === nameToAdd.toLowerCase())) {
      availableTags.value = [...availableTags.value, created].sort((a, b) => a.name.localeCompare(b.name))
    }
  } finally {
    addingTag.value = false
  }
}

function addTagFromList(tag: BlogTagDTO) {
  if (!props.form.tags) return
  if (tagsInclude(tag.name)) return
  props.form.tags.push(tag.name)
}

function removeTag(tag: string) {
  if (props.form.tags) {
    props.form.tags = props.form.tags.filter(t => t !== tag)
  }
}

onMounted(loadTags)

const metaTitleLength = computed(() => (props.form?.seoTitle?.length ?? 0))
const metaDescriptionLength = computed(() => (props.form?.seoDesc?.length ?? 0))

const metaTitleColor = computed(() => {
  if (metaTitleLength.value > 60) return 'text-error'
  if (metaTitleLength.value > 48) return 'text-warning'
  return 'text-muted'
})

const metaDescriptionColor = computed(() => {
  if (metaDescriptionLength.value > 160) return 'text-error'
  if (metaDescriptionLength.value > 144) return 'text-warning'
  return 'text-muted'
})

function generateMetaTitle(title: string): string {
  if (!title) return ''
  return title.length > 60 ? title.substring(0, 57) + '...' : title
}

function autoGenerateMetaTitle() {
  props.form.seoTitle = generateMetaTitle(props.form.title ?? '')
}

function autoGenerateMetaDescription() {
  props.form.seoDesc = getExcerpt(props.form.description ?? '', 160)
}

/** Generuje slug z tytułu i ustawia w formularzu. */
function generateSlugFromTitle() {
  const t = props.form.title?.trim()
  if (t) props.form.slug = slugify(t)
}

// Auto-uzupełnianie: gdy tytuł się zmienia i slug / meta tytuł są puste — uzupełnij
watch(
  () => props.form.title,
  (title) => {
    const t = (title ?? '').trim()
    if (!t) return
    if (!(props.form.slug ?? '').trim()) props.form.slug = slugify(t)
    if (!(props.form.seoTitle ?? '').trim()) props.form.seoTitle = generateMetaTitle(t)
  },
  { flush: 'sync' }
)

// Auto-uzupełnianie: gdy opis się zmienia i meta opis jest pusty — uzupełnij
watch(
  () => props.form.description,
  (desc) => {
    const d = (desc ?? '').trim()
    if (!d) return
    if (!(props.form.seoDesc ?? '').trim()) props.form.seoDesc = getExcerpt(d, 160)
  },
  { flush: 'sync' }
)

// Kotwice
const anchors = computed(() => props.form.anchors ?? [])

function addAnchor() {
  if (!props.form.anchors) props.form.anchors = []
  props.form.anchors.push({ label: '', to: '#', order: props.form.anchors.length })
}

function removeAnchor(index: number) {
  props.form.anchors?.splice(index, 1)
}
</script>

<template>
  <div class="space-y-4">
    <UCard
      variant="outline"
      class="space-y-4"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-file-text"
            class="w-5 h-5"
          />
          <h3 class="text-sm font-semibold">
            Podstawowe informacje
          </h3>
        </div>
      </template>

      <UFormField
        label="Tytuł"
        name="title"
        required
      >
        <UInput
          v-model="form.title"
          placeholder="Tytuł posta"
          size="sm"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Slug (URL)"
        name="slug"
        required
      >
        <div class="flex gap-2">
          <UInput
            v-model="form.slug"
            placeholder="slug-postu (auto z tytułu)"
            size="sm"
            class="w-full"
          />
          <UButton
            type="button"
            variant="soft"
            size="sm"
            icon="i-lucide-link"
            title="Generuj z tytułu"
            @click="generateSlugFromTitle"
          >
            Ze tytułu
          </UButton>
        </div>
      </UFormField>

      <UFormField
        label="Opis (krótki)"
        name="description"
        required
      >
        <UTextarea
          v-model="form.description"
          placeholder="Krótki opis posta"
          :rows="3"
          size="sm"
          class="w-full"
        />
      </UFormField>
    </UCard>

    <UCard
      variant="outline"
      class="space-y-4"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-calendar"
            class="w-5 h-5"
          />
          <h3 class="text-sm font-semibold">
            Publikacja
          </h3>
        </div>
      </template>

      <UFormField
        label="Data publikacji (pusta = szkic)"
        name="publishedAt"
      >
        <UInput
          v-model="form.publishedAt"
          type="datetime-local"
          size="sm"
          class="w-full"
        />
      </UFormField>
    </UCard>

    <UCard
      variant="outline"
      class="space-y-4"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-image"
            class="w-5 h-5"
          />
          <h3 class="text-sm font-semibold">
            Obraz
          </h3>
        </div>
      </template>

      <BlogImagePicker
        v-model="form.imageUrl"
        label="Obraz główny"
        preview-size="md"
      />
    </UCard>

    <UCard
      variant="outline"
      class="space-y-4"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-search"
            class="w-5 h-5"
          />
          <h3 class="text-sm font-semibold">
            SEO
          </h3>
        </div>
      </template>

      <UFormField
        label="Meta tytuł"
        name="seoTitle"
      >
        <div class="space-y-2">
          <UInput
            v-model="form.seoTitle"
            placeholder="Auto z tytułu"
            size="sm"
            class="w-full"
          />
          <div class="flex items-center justify-between text-xs">
            <span :class="metaTitleColor">{{ metaTitleLength }}/60</span>
            <UButton
              variant="soft"
              size="xs"
              @click="autoGenerateMetaTitle"
            >
              Odśwież z tytułu
            </UButton>
          </div>
        </div>
      </UFormField>

      <UFormField
        label="Meta opis"
        name="seoDesc"
      >
        <div class="space-y-2">
          <UTextarea
            v-model="form.seoDesc"
            placeholder="Auto z opisu"
            :rows="3"
            size="sm"
            class="w-full"
          />
          <div class="flex items-center justify-between text-xs">
            <span :class="metaDescriptionColor">{{ metaDescriptionLength }}/160</span>
            <UButton
              variant="soft"
              size="xs"
              @click="autoGenerateMetaDescription"
            >
              Auto z opisu
            </UButton>
          </div>
        </div>
      </UFormField>
    </UCard>

    <UCard
      variant="outline"
      class="space-y-4"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-tag"
            class="w-5 h-5"
          />
          <h3 class="text-sm font-semibold">
            Tagi
          </h3>
        </div>
      </template>

      <UFormField
        label="Tagi"
        name="tags"
      >
        <div class="space-y-3">
          <p class="text-xs text-muted">
            Wybierz z listy lub wpisz nowy — nowy tag trafi do bazy.
          </p>
          <!-- Lista tagów z bazy (klik = dodaj do posta) -->
          <div
            v-if="availableTags.length"
            class="flex flex-wrap gap-1.5"
          >
            <UButton
              v-for="tag in availableTags"
              :key="tag.id"
              size="xs"
              variant="soft"
              color="neutral"
              :disabled="tagsInclude(tag.name)"
              @click="addTagFromList(tag)"
            >
              {{ tag.name }}
            </UButton>
          </div>
          <div
            v-if="loadingTags"
            class="text-xs text-muted"
          >
            Ładowanie tagów…
          </div>
          <!-- Wpisz nowy tag i dodaj (zapis w bazie) -->
          <div class="flex gap-2">
            <UInput
              v-model="tagInput"
              placeholder="Wpisz nowy tag i dodaj"
              size="sm"
              class="w-full"
              :disabled="addingTag"
              @keyup.enter="addTag"
            />
            <UButton
              type="button"
              icon="i-lucide-plus"
              size="sm"
              :loading="addingTag"
              @click="addTag"
            />
          </div>
          <!-- Wybrane tagi na posta -->
          <div
            v-if="form.tags?.length"
            class="flex flex-wrap gap-2"
          >
            <UBadge
              v-for="tag in form.tags"
              :key="tag"
              variant="subtle"
              color="primary"
              size="sm"
            >
              {{ tag }}
              <button
                type="button"
                class="ml-1"
                @click="removeTag(tag)"
              >
                <UIcon
                  name="i-lucide-x"
                  class="w-3 h-3"
                />
              </button>
            </UBadge>
          </div>
        </div>
      </UFormField>
    </UCard>

    <!-- Kotwice -->
    <UCard
      variant="outline"
      class="space-y-4"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-anchor"
            class="w-5 h-5"
          />
          <h3 class="text-sm font-semibold">
            Kotwice
          </h3>
        </div>
      </template>

      <UFormField
        label="Kotwice (linki w aside posta)"
        name="anchors"
      >
        <div class="space-y-3">
          <p class="text-xs text-muted">
            Dodaj linki wyświetlane w bocznej kolumnie posta (np. Spis treści → #toc, zewnętrzny link).
          </p>
          <UButton
            type="button"
            variant="soft"
            size="sm"
            icon="i-lucide-plus"
            @click="addAnchor"
          >
            Dodaj kotwicę
          </UButton>
          <div
            v-if="anchors.length"
            class="space-y-3"
          >
            <div
              v-for="(anchor, idx) in anchors"
              :key="idx"
              class="flex flex-col gap-2 rounded-lg border border-default p-3"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-medium text-muted">Kotwica {{ idx + 1 }}</span>
                <UButton
                  type="button"
                  variant="ghost"
                  color="error"
                  size="xs"
                  icon="i-lucide-trash-2"
                  title="Usuń"
                  @click="removeAnchor(idx)"
                />
              </div>
              <UInput
                v-model="anchor.label"
                placeholder="Etykieta (np. Spis treści)"
                size="sm"
                class="w-full"
                @update:model-value="updateAnchor(idx, 'label', $event)"
              />
              <UInput
                v-model="anchor.to"
                placeholder="Link (np. #toc lub /blog/xyz#sekcja)"
                size="sm"
                class="w-full"
                @update:model-value="updateAnchor(idx, 'to', $event)"
              />
              <div class="grid grid-cols-2 gap-2">
                <UInput
                  v-model="anchor.icon"
                  placeholder="Ikona (np. i-lucide-list)"
                  size="sm"
                  class="w-full"
                  @update:model-value="updateAnchor(idx, 'icon', $event)"
                />
                <UInput
                  v-model="anchor.target"
                  placeholder="Target (np. _blank)"
                  size="sm"
                  class="w-full"
                  @update:model-value="updateAnchor(idx, 'target', $event)"
                />
              </div>
            </div>
          </div>
        </div>
      </UFormField>
    </UCard>
  </div>
</template>
