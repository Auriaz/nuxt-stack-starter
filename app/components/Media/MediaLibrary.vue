<script lang="ts" setup>
import type { MediaAssetDTO, MediaListQuery } from '#shared/types'
import type { Media } from '~/components/Media/MediaPreview.vue'
import { useMediaResource } from '~/composables/resources/useMediaResource'
import { useToast } from '#imports'

const mediaResource = useMediaResource()
const toast = useToast()
const requestURL = useRequestURL()
const items = ref<MediaAssetDTO[]>([])
const pagination = ref({ page: 1, perPage: 24, total: 0 })
const loading = ref(false)
const filters = ref<MediaListQuery>({
  type: undefined,
  search: '',
  tags: undefined,
  page: 1,
  perPage: 24
})
const drawerOpen = ref(false)
const selectedAsset = ref<MediaAssetDTO | null>(null)
const uploadModalOpen = ref(false)
const previewOpen = ref(false)

function assetToPreviewItem(asset: MediaAssetDTO, index: number): Media {
  const origin = requestURL.origin
  return {
    id: asset.id,
    index,
    mimeType: asset.mimeType,
    previewUrl: origin + mediaResource.serveUrl(asset.id),
    name: asset.originalName,
    description: (asset.caption ?? asset.alt ?? '') || undefined
  }
}

const previewPhotos = computed<Media[]>(() =>
  items.value
    .filter(a => a.type === 'image' || a.type === 'video')
    .map((a, i) => assetToPreviewItem(a, i))
)

const previewItem = computed<Media | null>(() => {
  const asset = selectedAsset.value
  if (!asset || (asset.type !== 'image' && asset.type !== 'video')) return null
  const idxInPreview = previewPhotos.value.findIndex(p => p.id === asset.id)
  if (idxInPreview < 0) return null
  return assetToPreviewItem(asset, idxInPreview)
})

const typeOptions = [
  { value: undefined as MediaListQuery['type'], label: 'Wszystkie typy' },
  { value: 'image' as const, label: 'Obrazy' },
  { value: 'video' as const, label: 'Wideo' },
  { value: 'file' as const, label: 'Pliki' }
]

const selectedTypeItem = computed({
  get: () => typeOptions.find(opt => opt.value === filters.value.type) ?? typeOptions[0],
  set: (item: (typeof typeOptions)[number]) => {
    filters.value = { ...filters.value, type: item?.value }
  }
})

const tagsDisplay = computed({
  get: () => (filters.value.tags ?? []).join(', '),
  set: (v: string) => {
    const tags = v.split(',').map(s => s.trim()).filter(Boolean)
    filters.value = { ...filters.value, tags: tags.length ? tags : undefined }
  }
})

const currentPage = computed({
  get: () => filters.value.page ?? 1,
  set: (p: number) => {
    filters.value = { ...filters.value, page: p }
  }
})

const showPagination = computed(() => pagination.value.total > (pagination.value.perPage ?? 24))

async function load() {
  loading.value = true
  try {
    const result = await mediaResource.list({
      ...filters.value,
      page: filters.value.page ?? 1,
      perPage: filters.value.perPage ?? 24
    })
    if (result) {
      items.value = result.items
      pagination.value = result.pagination
    }
  } finally {
    loading.value = false
  }
}

function onUploaded(asset: MediaAssetDTO) {
  items.value = [asset, ...items.value]
  pagination.value = { ...pagination.value, total: pagination.value.total + 1 }
  toast.add({
    title: 'Przesłano',
    description: 'Plik został dodany do biblioteki',
    color: 'success'
  })
}

function onUploadsComplete() {
  uploadModalOpen.value = false
}

function onSelect(asset: MediaAssetDTO) {
  selectedAsset.value = asset
  drawerOpen.value = true
}

function openPreview() {
  previewOpen.value = true
}

function onPreviewClose() {
  previewOpen.value = false
}

function onPreviewSelect(item: Media) {
  const asset = items.value.find(a => a.id === item.id)
  if (asset) selectedAsset.value = asset
}

function onDeleted(id: string) {
  items.value = items.value.filter(a => a.id !== id)
  pagination.value = { ...pagination.value, total: Math.max(0, pagination.value.total - 1) }
  if (selectedAsset.value?.id === id) {
    selectedAsset.value = null
    drawerOpen.value = false
  }
}

function onUpdated(asset: MediaAssetDTO) {
  const idx = items.value.findIndex(a => a.id === asset.id)
  if (idx >= 0) items.value[idx] = asset
  selectedAsset.value = asset
}

function applyFilters() {
  filters.value = { ...filters.value, page: 1 }
  load()
}

onMounted(load)
watch(
  () => [filters.value.page, filters.value.perPage],
  () => load()
)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center gap-4">
      <UInput
        v-model="filters.search"
        placeholder="Szukaj po nazwie..."
        icon="i-lucide-search"
        class="min-w-[200px]"
        @keyup.enter="applyFilters"
      />
      <UInput
        v-model="tagsDisplay"
        placeholder="Tagi (oddzielone przecinkami)"
        icon="i-lucide-tag"
        class="min-w-[200px]"
        @keyup.enter="applyFilters"
      />
      <USelectMenu
        v-model="selectedTypeItem"
        :items="typeOptions"
        value-attribute="value"
        class="w-40"
      />
      <UButton
        variant="soft"
        @click="applyFilters"
      >
        Filtruj
      </UButton>
      <UButton
        variant="soft"
        icon="i-lucide-plus"
        @click="uploadModalOpen = true"
      >
        Dodaj plik
      </UButton>
    </div>

    <UModal
      v-model:open="uploadModalOpen"
      title="Dodaj plik"
      description="Przeciągnij plik tutaj lub wybierz z dysku."
    >
      <template #content>
        <MediaUploader
          @uploaded="onUploaded"
          @uploads-complete="onUploadsComplete"
        />
      </template>
    </UModal>
    <MediaGrid
      :items="items"
      :loading="loading"
      @select="onSelect"
    />

    <div
      v-if="showPagination"
      class="flex justify-center pt-4"
    >
      <UPagination
        v-model:page="currentPage"
        :total="pagination.total"
        :items-per-page="pagination.perPage"
        size="sm"
        show-edges
      />
    </div>

    <MediaDetailsDrawer
      v-model="drawerOpen"
      :asset="selectedAsset"
      @deleted="onDeleted"
      @updated="onUpdated"
      @open-preview="openPreview"
    />
    <MediaPreview
      :is-show-preview-image="previewOpen"
      :photos="previewPhotos"
      :preview="previewItem"
      @close="onPreviewClose"
      @preview="onPreviewSelect"
    />
  </div>
</template>
