<script lang="ts" setup>
import type { MediaAssetDTO, UpdateMediaMetadata } from '#shared/types'
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
}>()

const mediaResource = useMediaResource()
const toast = useToast()
const isEditing = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const formValues = ref<UpdateMediaMetadata>({
  alt: '',
  caption: '',
  tags: []
})

const serveUrl = computed(() => props.asset ? mediaResource.serveUrl(props.asset.id) : '')
const isImage = computed(() => props.asset?.type === 'image')
const isVideo = computed(() => props.asset?.type === 'video')

watch(
  () => props.asset,
  (a) => {
    if (a) {
      formValues.value = {
        alt: a.alt ?? '',
        caption: a.caption ?? '',
        tags: a.tags ?? []
      }
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
    const updated = await mediaResource.update(props.asset.id, formValues.value)
    if (updated) {
      emit('updated', updated)
      toast.add({
        title: 'Zapisano',
        description: 'Metadane zostały zaktualizowane',
        color: 'success'
      })
      isEditing.value = false
    }
  } finally {
    isSaving.value = false
  }
}

async function remove() {
  if (!props.asset) return
  if (!confirm('Czy na pewno usunąć ten plik?')) return
  isDeleting.value = true
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
  formValues.value = {
    ...formValues.value,
    tags: value.split(',').map(s => s.trim()).filter(Boolean)
  }
}
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

        <div class="text-sm text-basic-600 dark:text-basic-400">
          <p class="font-medium text-basic-900 dark:text-basic-100">
            {{ asset.originalName }}
          </p>
          <p>{{ asset.type }} · {{ (asset.sizeBytes / 1024).toFixed(1) }} KB</p>
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
          <div class="flex gap-2 pt-2">
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
              @click="remove"
            >
              Usuń
            </UButton>
          </div>
        </div>
        <div
          v-else
          class="space-y-3"
        >
          <UFormField label="Alt">
            <UInput
              v-model="formValues.alt"
              placeholder="Tekst alternatywny"
            />
          </UFormField>
          <UFormField label="Opis">
            <UInput
              v-model="formValues.caption"
              placeholder="Caption"
            />
          </UFormField>
          <UFormField label="Tagi (oddzielone przecinkami)">
            <UInput
              :model-value="Array.isArray(formValues.tags) ? formValues.tags.join(', ') : ''"
              placeholder="tag1, tag2"
              @update:model-value="setTagsFromString(typeof $event === 'string' ? $event : '')"
            />
          </UFormField>
          <div class="flex gap-2">
            <UButton
              size="sm"
              :loading="isSaving"
              @click="save"
            >
              Zapisz
            </UButton>
            <UButton
              variant="ghost"
              size="sm"
              @click="isEditing = false"
            >
              Anuluj
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>
