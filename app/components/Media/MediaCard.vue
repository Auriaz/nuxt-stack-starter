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
      <img
        v-if="isImage"
        :src="serveUrl"
        :alt="asset.alt || asset.originalName"
        class="w-full h-full object-cover"
        loading="lazy"
      >
      <video
        v-else-if="isVideo"
        :src="serveUrl"
        class="w-full h-full object-cover"
        muted
        preload="metadata"
      />
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
