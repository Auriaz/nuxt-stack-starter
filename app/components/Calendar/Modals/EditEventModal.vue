<script lang="ts" setup>
import { CreateCalendarEventInputSchema } from '#shared/schemas/calendar'
import type { CalendarEventDTO, CreateCalendarEventInput } from '#shared/types/calendar'
import type { EventCategoryDTO } from '#shared/types/event-category'
import EventCategoryPicker from '~/components/EventCategory/Picker.vue'
import type { UseFormReturn } from '~/composables/useForm'

const props = defineProps<{
  open: boolean
  form: UseFormReturn<typeof CreateCalendarEventInputSchema>
  selectedEvent: CalendarEventDTO | null
  categories: EventCategoryDTO[]
  onSubmit: (values: CreateCalendarEventInput) => Promise<void> | void
  onSubmitManual: () => Promise<void> | void
  onKeydown: (event: KeyboardEvent) => void
}>()

const emit = defineEmits<{ 'update:open': [boolean] }>()

const modalOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})

const modalTitle = computed(() => {
  return props.selectedEvent ? `Edytuj: ${props.selectedEvent.title}` : 'Edytuj wydarzenie'
})
</script>

<template>
  <UModal
    v-model:open="modalOpen"
    :title="modalTitle"
  >
    <template #body>
      <UCard @keydown.enter="onKeydown">
        <UForm
          :schema="CreateCalendarEventInputSchema"
          :state="form.values.value"
          @submit="form.handleSubmit(onSubmit)"
        >
          <div class="grid gap-4">
            <UFormField
              label="Tytul"
              name="title"
              :error="form.errors.value?.title"
              class="w-full"
            >
              <UInput
                :model-value="form.values.value.title"
                class="w-full"
                @update:model-value="form.setField('title', $event)"
              />
            </UFormField>

            <UFormField
              label="Opis"
              name="description"
              :error="form.errors.value?.description"
              class="w-full"
            >
              <UTextarea
                :model-value="form.values.value.description"
                class="w-full"
                @update:model-value="form.setField('description', $event)"
              />
            </UFormField>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField
                label="Start"
                name="start_at"
                :error="form.errors.value?.start_at"
                class="w-full"
              >
                <UInput
                  :model-value="form.values.value.start_at"
                  type="datetime-local"
                  class="w-full"
                  @update:model-value="form.setField('start_at', $event)"
                />
              </UFormField>
              <UFormField
                label="Koniec"
                name="end_at"
                :error="form.errors.value?.end_at"
                class="w-full"
              >
                <UInput
                  :model-value="form.values.value.end_at"
                  type="datetime-local"
                  class="w-full"
                  @update:model-value="form.setField('end_at', $event)"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField
                label="Strefa czasowa"
                name="timezone"
                :error="form.errors.value?.timezone"
                class="w-full"
              >
                <UInput
                  :model-value="form.values.value.timezone"
                  class="w-full"
                  @update:model-value="form.setField('timezone', $event)"
                />
              </UFormField>
              <UFormField
                label="Widocznosc"
                name="visibility"
                :error="form.errors.value?.visibility"
                class="w-full"
              >
                <USelect
                  :model-value="form.values.value.visibility"
                  :items="[
                    { label: 'Prywatne', value: 'private' },
                    { label: 'Zespol', value: 'team' }
                  ]"
                  class="w-full"
                  @update:model-value="form.setField('visibility', $event)"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField
                label="Kategoria"
                name="category_id"
                :error="form.errors.value?.category_id"
                class="w-full"
              >
                <EventCategoryPicker
                  :model-value="form.values.value.category_id"
                  :categories="categories"
                  @update:model-value="form.setField('category_id', $event)"
                />
              </UFormField>
              <UFormField
                label="Lokalizacja"
                name="location"
                :error="form.errors.value?.location"
                class="w-full"
              >
                <UInput
                  :model-value="form.values.value.location"
                  class="w-full"
                  @update:model-value="form.setField('location', $event)"
                />
              </UFormField>
              <UFormField
                label="URL"
                name="url"
                :error="form.errors.value?.url"
                class="w-full"
              >
                <UInput
                  :model-value="form.values.value.url"
                  class="w-full"
                  @update:model-value="form.setField('url', $event)"
                />
              </UFormField>
            </div>

            <UFormField
              label="Reminder (min)"
              name="reminder_minutes"
              :error="form.errors.value?.reminder_minutes"
              class="w-full"
            >
              <UInput
                :model-value="form.values.value.reminder_minutes"
                type="number"
                class="w-full"
                @update:model-value="form.setField('reminder_minutes', $event === null ? undefined : Number($event))"
              />
            </UFormField>
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
          Zamknij
        </UButton>
        <UButton
          color="primary"
          type="button"
          :loading="form.pending.value"
          @click="onSubmitManual"
        >
          Zapisz zmiany
        </UButton>
      </div>
    </template>
  </UModal>
</template>
