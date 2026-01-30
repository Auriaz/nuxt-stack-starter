<script lang="ts" setup>
import { Cropper, CircleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import ModalConfirmation from '~/components/Modal/Confirmation/ModalConfirmation.vue'
import { useProfile } from '~/composables/resources/useProfile'
import { useMediaResource } from '~/composables/resources/useMediaResource'
import type { MediaAssetDTO } from '#shared/types'

const { profile, uploadAvatar, setAvatarFromMedia, deleteAvatar, errors, isLoading } = useProfile()
const media = useMediaResource()
const toast = useToast()
const emit = defineEmits<{
  success: []
  cancel: []
}>()

const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const isSubmitting = ref(false)
const libraryOpen = ref(false)
const libraryItems = ref<MediaAssetDTO[]>([])
const libraryLoading = ref(false)

/** Obraz do przycięcia (data URL) – po wyborze pliku otwiera się cropper */
const cropImageSrc = ref<string | null>(null)
const cropperOpen = ref(false)
const cropperRef = ref<InstanceType<typeof Cropper> | null>(null)

async function loadLibrary() {
  libraryLoading.value = true
  const res = await media.list({ type: 'image', perPage: 50 })
  libraryItems.value = res?.items ?? []
  libraryLoading.value = false
}

watch(libraryOpen, (open: boolean) => {
  if (open) {
    loadLibrary()
  }
})

watch(cropperOpen, (open: boolean) => {
  if (!open) {
    cropImageSrc.value = null
    selectedFile.value = null
    previewUrl.value = null
  }
})

async function selectFromLibrary(asset: MediaAssetDTO) {
  isSubmitting.value = true
  try {
    const ok = await setAvatarFromMedia(asset.id)
    if (ok) {
      libraryOpen.value = false
      emit('success')
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''

  if (!file) return
  if (!file.type.startsWith('image/')) return

  const maxSizeBytes = 5 * 1024 * 1024
  if (file.size > maxSizeBytes) {
    toast.add({
      title: 'Za duży plik',
      description: 'Maksymalny rozmiar avatara to 5MB.',
      color: 'error'
    })
    return
  }

  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    if (dataUrl) {
      cropImageSrc.value = dataUrl
      cropperOpen.value = true
    }
  }
  reader.readAsDataURL(file)
}

/** Po przycięciu: canvas → blob → File → upload */
function applyCrop() {
  const cropper = cropperRef.value
  if (!cropper || !cropImageSrc.value) return

  const cropResult = cropper.getResult()
  if (!cropResult?.canvas) return

  isSubmitting.value = true
  cropResult.canvas.toBlob(
    async (blob: Blob | null) => {
      try {
        if (!blob) {
          toast.add({ title: 'Błąd', description: 'Nie udało się przyciąć obrazu', color: 'error' })
          return
        }
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
        const avatarUrl = await uploadAvatar(file)
        if (avatarUrl) {
          closeCropper()
          emit('success')
        }
      } finally {
        isSubmitting.value = false
      }
    },
    'image/jpeg',
    0.92
  )
}

function closeCropper() {
  cropperOpen.value = false
  cropImageSrc.value = null
  selectedFile.value = null
  previewUrl.value = null
}

const confirmDeleteRef = ref<InstanceType<typeof ModalConfirmation> | null>(null)

function handleDelete() {
  confirmDeleteRef.value?.open()
}

async function onConfirmDelete() {
  isSubmitting.value = true
  try {
    const success = await deleteAvatar()
    if (success) {
      previewUrl.value = null
      emit('success')
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  selectedFile.value = null
  previewUrl.value = null
  emit('cancel')
}

const currentAvatarUrl = computed(() => {
  if (previewUrl.value) {
    return previewUrl.value
  }
  return profile.value?.avatarUrl ?? null
})

/** Pełny URL avatara (origin + ścieżka), żeby UAvatar poprawnie ładował /api/media/:id/serve */
const avatarSrc = useAvatarSrc(currentAvatarUrl)
</script>

<template>
  <div class="space-y-6">
    <!-- Current Avatar Preview -->
    <div class="flex justify-center">
      <div class="relative">
        <UAvatar
          v-if="currentAvatarUrl"
          :src="avatarSrc"
          :alt="profile?.name ?? 'Avatar'"
          size="xl"
          class="h-38 w-38 ring-4 ring-primary-200 dark:ring-primary-800"
        />
        <div
          v-else
          class="flex h-32 w-32 items-center justify-center rounded-full border-4 border-neutral-200 bg-linear-to-br from-primary-400 to-primary-600 dark:border-neutral-800"
        >
          <UIcon
            name="i-heroicons-user"
            class="h-16 w-16 text-white"
          />
        </div>
      </div>
    </div>

    <!-- File Upload & Library -->
    <div class="space-y-4">
      <div class="flex flex-wrap items-center gap-3">
        <UFormField
          label="Wybierz nowy avatar"
          name="avatar"
          :error="errors.avatar"
          class="flex-1 min-w-0"
        >
          <UInput
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            :disabled="isLoading || isSubmitting"
            @change="handleFileSelect"
          />
        </UFormField>
        <UButton
          variant="outline"
          color="neutral"
          :disabled="isLoading || isSubmitting"
          class="self-end"
          @click="libraryOpen = true"
        >
          Wybierz z biblioteki
        </UButton>
      </div>
      <template v-if="!errors.avatar">
        <p class="text-xs text-neutral-500">
          PNG, JPG lub WEBP (max. 5MB). Możesz też wybrać zdjęcie z biblioteki mediów.
        </p>
      </template>

      <div
        v-if="errors.root"
        class="rounded-lg border border-error-200 bg-error-50 p-3 dark:border-error-800 dark:bg-error-900/20"
      >
        <p class="text-sm text-error-600 dark:text-error-400">
          {{ errors.root }}
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
      <UButton
        v-if="profile?.avatarUrl"
        variant="outline"
        color="error"
        :disabled="isLoading || isSubmitting"
        @click="handleDelete"
      >
        Usuń avatar
      </UButton>
      <UButton
        variant="outline"
        color="neutral"
        :disabled="isLoading || isSubmitting"
        @click="handleCancel"
      >
        Anuluj
      </UButton>
    </div>

    <!-- Cropper: po wyborze pliku użytkownik przycina zdjęcie, potem Zastosuj = upload -->
    <USlideover
      v-model:open="cropperOpen"
      title="Przytnij zdjęcie avatara"
    >
      <template #body>
        <div class="flex flex-col h-full">
          <div class="flex-1 min-h-0 p-4">
            <div class="cropper-container h-80 sm:h-96 w-full rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              <Cropper
                v-if="cropImageSrc"
                ref="cropperRef"
                :src="cropImageSrc"
                :stencil-component="CircleStencil"
                :canvas="{
                  maxWidth: 512,
                  maxHeight: 512,
                  minWidth: 64,
                  minHeight: 64
                }"
                class="cropper h-full w-full"
              />
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 p-4 border-t border-neutral-200 dark:border-neutral-700">
            <UButton
              variant="outline"
              color="neutral"
              :disabled="isSubmitting"
              @click="closeCropper"
            >
              Anuluj
            </UButton>
            <UButton
              color="primary"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              @click="applyCrop"
            >
              Zastosuj i zapisz avatar
            </UButton>
          </div>
        </div>
      </template>
    </USlideover>

    <!-- Media library picker -->
    <USlideover
      v-model:open="libraryOpen"
      title="Wybierz avatar z biblioteki"
    >
      <template #body>
        <div class="p-4">
          <MediaGrid
            :items="libraryItems"
            :loading="libraryLoading"
            slideover
            @select="selectFromLibrary"
          />
        </div>
      </template>
    </USlideover>

    <!-- Potwierdzenie usunięcia avatara -->
    <ModalConfirmation
      ref="confirmDeleteRef"
      title="Usuń zdjęcie"
      description="Czy na pewno chcesz usunąć zdjęcie profilowe?"
      confirm-label="Usuń"
      cancel-label="Anuluj"
      variant="danger"
      @confirm="onConfirmDelete"
    />
  </div>
</template>

<style scoped>
.cropper-container :deep(.cropper) {
  height: 100%;
  min-height: 20rem;
}
</style>
