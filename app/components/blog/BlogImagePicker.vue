<script setup lang="ts">
import type { MediaAssetDTO } from '#shared/types'
import { useMediaResource } from '~/composables/resources/useMediaResource'

interface Props {
  modelValue: string | null
  label?: string
  previewSize?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Obraz',
  previewSize: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const mediaResource = useMediaResource()
const requestURL = useRequestURL()
const toast = useToast()

const showLibraryModal = ref(false)
const showUploadModal = ref(false)
const imageItems = ref<MediaAssetDTO[]>([])
const loadingImages = ref(false)

function imageUrl(asset: MediaAssetDTO): string {
  const path = mediaResource.serveUrl(asset.id)
  if (path.startsWith('http')) return path
  const base = requestURL?.origin ?? (import.meta.client ? window.location.origin : '')
  return base + path
}

async function loadImages() {
  loadingImages.value = true
  try {
    const result = await mediaResource.list({ type: 'image', perPage: 48 })
    if (result) imageItems.value = result.items
  } finally {
    loadingImages.value = false
  }
}

function handleMediaSelect(asset: MediaAssetDTO) {
  if (asset.type === 'image') {
    emit('update:modelValue', imageUrl(asset))
    showLibraryModal.value = false
    toast.add({ title: 'Wybrano obraz', color: 'success' })
  }
}

function handleUploaded(asset: MediaAssetDTO) {
  showUploadModal.value = false
  emit('update:modelValue', imageUrl(asset))
  loadImages()
  toast.add({ title: 'Przesłano i wybrano obraz', color: 'success' })
}

function handleClear() {
  emit('update:modelValue', null)
}

const fallbackInput = computed({
  get: () => props.modelValue ?? '',
  set: (v: string) => emit('update:modelValue', v || null)
})

const previewHeight = computed(() => {
  switch (props.previewSize) {
    case 'sm': return 'h-32'
    case 'md': return 'h-48'
    case 'lg': return 'h-64'
    default: return 'h-48'
  }
})

watch(showLibraryModal, (open) => {
  if (open) loadImages()
})
</script>

<template>
  <div class="space-y-3">
    <label
      v-if="label"
      class="block text-sm font-medium text-default"
    >
      {{ label }}
    </label>

    <div
      v-if="modelValue"
      class="relative group"
    >
      <div
        :class="[
          'relative w-full rounded-lg border border-default overflow-hidden bg-default-100',
          previewHeight
        ]"
      >
        <img
          :src="modelValue"
          alt="Podgląd"
          class="w-full h-full object-cover"
          @error="(e: Event) => { (e.target as HTMLImageElement).style.display = 'none' }"
        >
      </div>
      <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <UButton
          icon="i-lucide-x"
          size="sm"
          color="error"
          variant="solid"
          square
          @click="handleClear"
        />
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <UButton
        icon="i-lucide-image"
        variant="outline"
        color="primary"
        size="sm"
        @click="showLibraryModal = true"
      >
        Wybierz z biblioteki
      </UButton>
      <UButton
        icon="i-lucide-upload"
        variant="outline"
        color="neutral"
        size="sm"
        @click="showUploadModal = true"
      >
        Dodaj nowy
      </UButton>
      <UButton
        v-if="modelValue"
        icon="i-lucide-trash-2"
        variant="ghost"
        color="error"
        size="sm"
        @click="handleClear"
      >
        Usuń
      </UButton>
    </div>

    <UInput
      v-model="fallbackInput"
      placeholder="Lub wpisz URL ręcznie"
      class="w-full"
      size="sm"
    />

    <UModal
      v-model:open="showLibraryModal"
      title="Wybierz obraz z biblioteki"
      :ui="{ content: 'w-full max-w-4xl' }"
    >
      <template #content>
        <div class="p-4">
          <MediaGrid
            :items="imageItems"
            :loading="loadingImages"
            @select="handleMediaSelect"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="showUploadModal"
      title="Dodaj obraz"
      description="Przeciągnij plik lub wybierz z dysku."
    >
      <template #content>
        <MediaUploader
          @uploaded="handleUploaded"
          @uploads-complete="showUploadModal = false"
        />
      </template>
    </UModal>
  </div>
</template>
