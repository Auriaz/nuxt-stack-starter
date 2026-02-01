<script lang="ts" setup>
import type { MediaAssetDTO } from '#shared/types'
import { useMediaResource } from '~/composables/resources/useMediaResource'

const props = defineProps<{
  asset: MediaAssetDTO
}>()

const emit = defineEmits<{
  click: [asset: MediaAssetDTO]
}>()

const mediaResource = useMediaResource()
const serveUrl = computed(() => mediaResource.serveUrl(props.asset.id))
const isImage = computed(() => props.asset.type === 'image')
const isVideo = computed(() => props.asset.type === 'video')
const status = computed(() => props.asset.status)
const sizeLabel = computed(() => {
  const bytes = props.asset.sizeBytes
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
})

function onClick() {
  emit('click', props.asset)
}
</script>

<template>
  <UCard
    class="cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    :ui="{ root: '', body: 'p-0' }"
    @click="onClick"
  >
    <div class="aspect-square bg-basic-100 dark:bg-basic-800 relative">
      <div
        v-if="status === 'processing'"
        class="absolute inset-0 z-10 flex items-center justify-center bg-basic-900/40 rounded-t-lg"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="w-10 h-10 text-primary-400 animate-spin"
          aria-hidden
        />
      </div>
      <div
        v-else-if="status === 'failed'"
        class="absolute top-2 right-2 z-10 rounded-full bg-error-500/90 p-1.5"
        title="Błąd przetwarzania"
      >
        <UIcon
          name="i-lucide-alert-circle"
          class="w-4 h-4 text-white"
          aria-hidden
        />
      </div>
      <img
        v-if="isImage"
        :src="serveUrl"
        :alt="asset.alt || asset.originalName"
        class="w-full h-full object-cover"
        loading="lazy"
      >
      <div
        v-else-if="isVideo"
        class="w-full h-full relative bg-basic-200 dark:bg-basic-700 flex items-center justify-center"
      >
        <video
          :src="serveUrl"
          class="w-full h-full object-cover absolute inset-0"
          muted
          preload="metadata"
        />
        <UIcon
          name="i-lucide-play"
          class="w-12 h-12 text-basic-400/80 relative z-10 pointer-events-none"
          aria-hidden
        />
      </div>
      <div
        v-else
        class="w-full h-full flex items-center justify-center"
      >
        <UIcon
          name="i-lucide-file"
          class="w-16 h-16 text-basic-400"
        />
      </div>
    </div>
    <div class="p-2">
      <p
        class="text-sm font-medium text-basic-900 dark:text-basic-100 truncate"
        :title="asset.originalName"
      >
        {{ asset.originalName }}
      </p>
      <p class="text-xs text-basic-500 dark:text-basic-400">
        {{ asset.type }} · {{ sizeLabel }}
      </p>
    </div>
  </UCard>
</template>
