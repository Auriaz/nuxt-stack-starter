<script lang="ts" setup>
import type { MediaAssetDTO } from '#shared/types'
import { useMediaResource } from '~/composables/resources/useMediaResource'

const emit = defineEmits<{
  uploaded: [asset: MediaAssetDTO]
}>()

const mediaResource = useMediaResource()
const isDragging = ref(false)
const isUploading = ref(false)
const progress = ref(0)
const error = ref<string | null>(null)

const ALLOWED_TYPES = 'image/jpeg,image/png,image/webp,image/gif,video/mp4'
const MAX_IMAGE_MB = 10
const MAX_VIDEO_MB = 50

function validateFile(file: File): string | null {
  const allowed = ALLOWED_TYPES.split(',')
  if (!allowed.includes(file.type)) {
    return `Nieobsługiwany typ pliku: ${file.type}`
  }
  const isVideo = file.type.startsWith('video/')
  const maxMb = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB
  if (file.size > maxMb * 1024 * 1024) {
    return `Maksymalny rozmiar: ${maxMb} MB`
  }
  return null
}

async function handleFiles(files: FileList | File[]) {
  const list = Array.isArray(files) ? files : Array.from(files)
  if (!list.length) return
  error.value = null
  const file = list[0]
  const err = validateFile(file)
  if (err) {
    error.value = err
    return
  }
  isUploading.value = true
  progress.value = 0
  const interval = setInterval(() => {
    progress.value = Math.min(progress.value + 15, 90)
  }, 200)
  try {
    const asset = await mediaResource.upload(file)
    progress.value = 100
    if (asset) {
      emit('uploaded', asset)
    } else {
      error.value = 'Upload nie powiódł się'
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Błąd uploadu'
  } finally {
    clearInterval(interval)
    isUploading.value = false
    progress.value = 0
  }
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files?.length) handleFiles(files)
}

function onInput(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) handleFiles(input.files)
}
</script>

<template>
  <div class="space-y-2">
    <div
      class="border-2 border-dashed rounded-xl p-8 text-center transition-colors"
      :class="[
        isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' : 'border-basic-300 dark:border-basic-600',
        isUploading && 'pointer-events-none opacity-80'
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <input
        type="file"
        class="hidden"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
        :disabled="isUploading"
        @change="onInput"
      >
      <label class="cursor-pointer block">
        <UIcon
          v-if="!isUploading"
          name="i-lucide-upload-cloud"
          class="w-12 h-12 mx-auto text-basic-400 dark:text-basic-500 mb-2"
        />
        <UIcon
          v-else
          name="i-lucide-loader-2"
          class="w-12 h-12 mx-auto text-primary-500 animate-spin mb-2"
        />
        <p class="text-sm text-basic-600 dark:text-basic-400">
          {{ isUploading ? 'Przesyłanie...' : 'Przeciągnij plik tutaj lub kliknij, aby wybrać' }}
        </p>
        <p class="text-xs text-basic-500 dark:text-basic-500 mt-1">
          Obrazy (JPEG, PNG, WebP, GIF) do {{ MAX_IMAGE_MB }} MB, wideo MP4 do {{ MAX_VIDEO_MB }} MB
        </p>
        <UProgress
          v-if="isUploading"
          :model-value="progress"
          class="mt-3 max-w-xs mx-auto"
        />
      </label>
    </div>
    <UAlert
      v-if="error"
      color="error"
      :title="error"
      variant="soft"
      icon="i-lucide-alert-circle"
      class="mt-2"
    />
  </div>
</template>
