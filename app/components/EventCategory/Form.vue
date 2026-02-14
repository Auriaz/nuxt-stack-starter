<script lang="ts" setup>
import { CreateEventCategoryInputSchema } from '#shared/schemas/event-category'
import type { EventCategoryDTO, CreateEventCategoryInput, UpdateEventCategoryInput } from '#shared/types/event-category'
import { useForm } from '~/composables/useForm'

const props = defineProps<{
  open: boolean
  category?: EventCategoryDTO // jeśli jest, to edycja, jeśli nie - tworzenie
  teamId?: number
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  'submit': [data: CreateEventCategoryInput | UpdateEventCategoryInput]
}>()

const modalOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})

const isEdit = computed(() => !!props.category)
const modalTitle = computed(() => (isEdit.value ? `Edytuj: ${props.category?.label}` : 'Nowa kategoria'))

// Kolory preset
const colorPresets = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#f97316', // orange
  '#84cc16', // lime
  '#6366f1' // indigo
]

// Ikony preset
const iconPresets = [
  'i-lucide-calendar',
  'i-lucide-users',
  'i-lucide-user',
  'i-lucide-alert-circle',
  'i-lucide-folder',
  'i-lucide-bell',
  'i-lucide-star',
  'i-lucide-clock',
  'i-lucide-tag',
  'i-lucide-check-circle'
]

const form = useForm(CreateEventCategoryInputSchema, {
  initialValues: props.category
    ? {
        label: props.category.label,
        slug: props.category.slug,
        description: props.category.description ?? undefined,
        color: props.category.color,
        icon: props.category.icon,
        teamId: props.teamId,
        isDefault: props.category.isDefault,
        sortOrder: props.category.sortOrder
      }
    : {
        label: '',
        slug: '',
        description: undefined,
        color: '#3b82f6',
        icon: 'i-lucide-calendar',
        teamId: props.teamId,
        isDefault: false,
        sortOrder: 0
      }
})

// Auto-generate slug z label
watch(() => form.values.value.label, (newLabel) => {
  if (!isEdit.value && newLabel) {
    form.values.value.slug = newLabel
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }
})

async function handleSubmit(data: CreateEventCategoryInput) {
  emit('submit', data)
  modalOpen.value = false
  form.reset()
}

function submitManual() {
  const handler = form.handleSubmit(handleSubmit)
  return handler({ data: form.values.value } as { data: CreateEventCategoryInput })
}
</script>

<template>
  <UModal
    v-model:open="modalOpen"
    :title="modalTitle"
  >
    <template #body>
      <UCard>
        <UForm
          :schema="CreateEventCategoryInputSchema"
          :state="form.values.value"
          @submit="form.handleSubmit(handleSubmit)"
        >
          <div class="grid gap-4">
            <UFormField
              label="Nazwa"
              name="label"
              :error="form.errors.value?.label"
              class="w-full"
            >
              <UInput
                v-model="form.values.value.label"
                placeholder="np. Spotkanie, Deadline, Projekt"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Slug"
              name="slug"
              :error="form.errors.value?.slug"
              class="w-full"
              description="Unikalny identyfikator (małe litery, cyfry, myślniki)"
            >
              <UInput
                v-model="form.values.value.slug"
                placeholder="np. spotkanie, deadline, projekt"
                class="w-full"
                :disabled="isEdit"
              />
            </UFormField>

            <UFormField
              label="Opis"
              name="description"
              :error="form.errors.value?.description"
              class="w-full"
            >
              <UTextarea
                v-model="form.values.value.description"
                placeholder="Opcjonalny opis kategorii"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Kolor"
              name="color"
              :error="form.errors.value?.color"
              class="w-full"
            >
              <div class="flex gap-2">
                <UColorPicker
                  v-model="form.values.value.color"
                  class="flex-1"
                />
                <div class="flex gap-1 flex-wrap">
                  <button
                    v-for="preset in colorPresets"
                    :key="preset"
                    type="button"
                    class="w-8 h-8 rounded border-2"
                    :class="form.values.value.color === preset ? 'border-gray-900 dark:border-white' : 'border-gray-300'"
                    :style="{ backgroundColor: preset }"
                    @click="form.values.value.color = preset"
                  />
                </div>
              </div>
            </UFormField>

            <UFormField
              label="Ikona"
              name="icon"
              :error="form.errors.value?.icon"
              class="w-full"
              description="Nazwa ikony Nuxt UI (np. i-lucide-calendar)"
            >
              <div class="space-y-2">
                <UInput
                  v-model="form.values.value.icon"
                  placeholder="i-lucide-calendar"
                  class="w-full"
                />
                <div class="flex gap-2 flex-wrap">
                  <button
                    v-for="preset in iconPresets"
                    :key="preset"
                    type="button"
                    class="p-2 rounded border"
                    :class="form.values.value.icon === preset ? 'border-gray-900 dark:border-white bg-gray-100 dark:bg-gray-800' : 'border-gray-300'"
                    @click="form.values.value.icon = preset"
                  >
                    <UIcon
                      :name="preset"
                      class="w-5 h-5"
                    />
                  </button>
                </div>
              </div>
            </UFormField>

            <!-- Preview -->
            <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p class="text-sm font-medium mb-2">
                Podgląd:
              </p>
              <EventCategoryBadge
                :category="{
                  label: form.values.value.label || 'Podgląd',
                  color: form.values.value.color || '#3b82f6',
                  icon: form.values.value.icon || 'i-lucide-tag'
                }"
                size="md"
              />
            </div>

            <UAlert
              v-if="form.formError.value"
              color="error"
              variant="soft"
              :title="form.formError.value"
              class="w-full"
            />
          </div>
        </UForm>
      </UCard>
    </template>

    <template #footer>
      <div class="w-full flex justify-end gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          @click="modalOpen = false"
        >
          Anuluj
        </UButton>
        <UButton
          color="primary"
          type="button"
          :loading="form.pending.value"
          @click="submitManual"
        >
          {{ isEdit ? 'Zapisz zmiany' : 'Utwórz kategorię' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
