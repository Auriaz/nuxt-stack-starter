<script lang="ts" setup>
import type { MediaAssetDTO } from '#shared/types'
import { UpdateMediaMetadataSchema } from '#shared/schemas/media'
import { useMediaResource } from '~/composables/resources/useMediaResource'
import { useToast } from '#imports'

const props = defineProps<{
  modelValue: boolean
  asset: MediaAssetDTO | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'deleted': [id: string]
  'updated': [asset: MediaAssetDTO]
  'openPreview': []
}>()

const mediaResource = useMediaResource()
const toast = useToast()
const requestURL = useRequestURL()
const isEditing = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const deleteConfirmOpen = ref(false)

const editForm = useForm(UpdateMediaMetadataSchema, {
  initialValues: { alt: '', caption: '', tags: [] }
})

const serveUrl = computed(() => props.asset ? mediaResource.serveUrl(props.asset.id) : '')
const isImage = computed(() => props.asset?.type === 'image')
const isVideo = computed(() => props.asset?.type === 'video')
const canPreview = computed(() => isImage.value || isVideo.value)

watch(
  () => props.asset,
  (a) => {
    if (a) {
      editForm.setValues({
        alt: a.alt ?? '',
        caption: a.caption ?? '',
        tags: a.tags ?? []
      })
      isEditing.value = false
    }
  },
  { immediate: true }
)

function close() {
  emit('update:modelValue', false)
}

async function save() {
  if (!props.asset) return
  isSaving.value = true
  try {
    const handler = editForm.handleSubmit(async (values) => {
      const updated = await mediaResource.update(props.asset!.id, values)
      if (updated) {
        emit('updated', updated)
        toast.add({
          title: 'Zapisano',
          description: 'Metadane zostały zaktualizowane',
          color: 'success'
        })
        isEditing.value = false
      }
    })
    await handler({
      preventDefault: () => {},
      data: editForm.values.value
    } as unknown as Parameters<ReturnType<typeof editForm.handleSubmit>>[0])
  } catch {
    // Błędy API są mapowane w handleSubmit przez setErrorsFromApi
  } finally {
    isSaving.value = false
  }
}

function openDeleteConfirm() {
  deleteConfirmOpen.value = true
}

async function doRemove() {
  if (!props.asset) return
  isDeleting.value = true
  deleteConfirmOpen.value = false
  try {
    const ok = await mediaResource.remove(props.asset.id)
    if (ok) {
      emit('deleted', props.asset.id)
      toast.add({
        title: 'Usunięto',
        description: 'Plik został usunięty',
        color: 'success'
      })
      close()
    }
  } finally {
    isDeleting.value = false
  }
}

function setTagsFromString(value: string) {
  editForm.setField('tags', value.split(',').map(s => s.trim()).filter(Boolean))
}

function copyServeUrl() {
  const url = serveUrl.value
  if (!url) return
  const fullUrl = requestURL.origin + url
  navigator.clipboard.writeText(fullUrl).then(() => {
    toast.add({
      title: 'Skopiowano',
      description: 'URL skopiowany do schowka',
      color: 'success'
    })
  })
}

const formValues = editForm.values
const formErrors = editForm.errors
const formError = editForm.formError
</script>

<template>
  <USlideover
    :open="modelValue"
    @update:open="emit('update:modelValue', $event)"
  >
    <template #content>
      <div
        v-if="asset"
        class="p-4 space-y-4"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">
            Szczegóły pliku
          </h3>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            size="sm"
            @click="close"
          />
        </div>

        <div class="aspect-video bg-basic-100 dark:bg-basic-800 rounded-lg overflow-hidden">
          <img
            v-if="isImage"
            :src="serveUrl"
            :alt="asset.alt || asset.originalName"
            class="w-full h-full object-contain"
          >
          <video
            v-else-if="isVideo"
            :src="serveUrl"
            class="w-full h-full object-contain"
            controls
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

        <div class="text-sm text-basic-600 dark:text-basic-400 space-y-1">
          <p class="font-medium text-basic-900 dark:text-basic-100">
            {{ asset.originalName }}
          </p>
          <p>{{ asset.type }} · {{ (asset.sizeBytes / 1024).toFixed(1) }} KB</p>
          <UButton
            variant="ghost"
            size="xs"
            icon="i-lucide-copy"
            class="mt-1"
            @click="copyServeUrl"
          >
            Kopiuj URL
          </UButton>
        </div>

        <div
          v-if="!isEditing"
          class="space-y-2"
        >
          <p v-if="asset.alt">
            <span class="text-basic-500">Alt:</span> {{ asset.alt }}
          </p>
          <p v-if="asset.caption">
            <span class="text-basic-500">Opis:</span> {{ asset.caption }}
          </p>
          <p v-if="asset.tags?.length">
            <span class="text-basic-500">Tagi:</span> {{ asset.tags.join(', ') }}
          </p>
          <div class="flex flex-wrap gap-2 pt-2">
            <UButton
              v-if="canPreview"
              variant="soft"
              size="sm"
              icon="i-lucide-maximize-2"
              @click="emit('openPreview')"
            >
              Podgląd pełnoekranowy
            </UButton>
            <UButton
              variant="soft"
              size="sm"
              icon="i-lucide-pencil"
              @click="isEditing = true"
            >
              Edytuj
            </UButton>
            <UButton
              variant="soft"
              color="error"
              size="sm"
              icon="i-lucide-trash-2"
              :loading="isDeleting"
              @click="openDeleteConfirm"
            >
              Usuń
            </UButton>
          </div>
        </div>
        <div
          v-else
          class="space-y-3"
        >
          <UFormField
            label="Alt"
            :error="formErrors?.alt"
          >
            <UInput
              :model-value="formValues?.alt ?? ''"
              placeholder="Tekst alternatywny"
              class="w-full"
              @update:model-value="editForm.setField('alt', $event)"
            />
          </UFormField>
          <UFormField
            label="Opis"
            :error="formErrors?.caption"
          >
            <UInput
              :model-value="formValues?.caption ?? ''"
              placeholder="Caption"
              class="w-full"
              @update:model-value="editForm.setField('caption', $event)"
            />
          </UFormField>
          <UFormField
            label="Tagi (oddzielone przecinkami)"
            :error="formErrors?.tags"
          >
            <UInput
              :model-value="Array.isArray(formValues?.tags) ? formValues.tags.join(', ') : ''"
              placeholder="tag1, tag2"
              class="w-full"
              @update:model-value="setTagsFromString(typeof $event === 'string' ? $event : '')"
            />
          </UFormField>
          <UAlert
            v-if="formError"
            color="error"
            variant="soft"
            :title="formError"
            class="text-sm w-full"
          />
          <div class="flex gap-2 w-full">
            <UButton
              size="sm"
              :loading="isSaving"
              class="w-full flex items-center justify-center"
              @click="save"
            >
              Zapisz
            </UButton>
            <UButton
              variant="outline"
              size="sm"
              class="w-full flex items-center justify-center"
              @click="isEditing = false"
            >
              Anuluj
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </USlideover>

  <UModal
    v-model:open="deleteConfirmOpen"
    title="Usuń plik"
    description="Czy na pewno usunąć ten plik? Tej operacji nie można cofnąć."
  >
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          @click="deleteConfirmOpen = false"
        >
          Anuluj
        </UButton>
        <UButton
          color="error"
          :loading="isDeleting"
          @click="doRemove"
        >
          Usuń
        </UButton>
      </div>
    </template>
  </UModal>
</template>
