<script lang="ts" setup>
import type { MediaAssetDTO, MediaListQuery } from '#shared/types'
import { useMediaResource } from '~/composables/resources/useMediaResource'
import { useToast } from '#imports'

const mediaResource = useMediaResource()
const toast = useToast()
const items = ref<MediaAssetDTO[]>([])
const pagination = ref({ page: 1, perPage: 24, total: 0 })
const loading = ref(false)
const filters = ref<MediaListQuery>({
  type: undefined,
  search: '',
  page: 1,
  perPage: 24
})
const drawerOpen = ref(false)
const selectedAsset = ref<MediaAssetDTO | null>(null)

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

function onSelect(asset: MediaAssetDTO) {
  selectedAsset.value = asset
  drawerOpen.value = true
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
      <USelectMenu
        v-model="filters.type"
        :items="[
          { value: undefined, label: 'Wszystkie typy' },
          { value: 'image', label: 'Obrazy' },
          { value: 'video', label: 'Wideo' },
          { value: 'file', label: 'Pliki' }
        ]"
        value-attribute="value"
        class="w-40"
      />
      <UButton
        variant="soft"
        @click="applyFilters"
      >
        Filtruj
      </UButton>
    </div>

    <MediaUploader @uploaded="onUploaded" />
    <MediaGrid
      :items="items"
      :loading="loading"
      @select="onSelect"
    />

    <MediaDetailsDrawer
      v-model="drawerOpen"
      :asset="selectedAsset"
      @deleted="onDeleted"
      @updated="onUpdated"
    />
  </div>
</template>
