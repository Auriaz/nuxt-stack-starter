<script lang="ts" setup>
import { CreateEventCategoryInputSchema } from '#shared/schemas/event-category'
import Modal from '~/components/Modal/Modal.vue'
import EventCategoryBadge from '~/components/EventCategory/Badge.vue'

const _props = defineProps<{
  isEdit: boolean
  editingLabel?: string | null
  form: {
    values: { value: Record<string, unknown> }
    errors: { value: Record<string, string> }
    formError: { value: string | null }
    pending: { value: boolean }
    setField: (name: string, value: unknown) => void
  }
  categoryType: { value: 'system' | 'personal' | 'team' }
  typeOptions: Array<{ label: string, value: 'system' | 'personal' | 'team' }>
  teamItems: Array<{ label: string, value: number }>
  teamsLoading: boolean
  colorPresets: string[]
  iconPresets: string[]
}>()

const emit = defineEmits<{
  (e: 'submit' | 'close'): void
  (e: 'slug-change', value: string): void
  (e: 'category-type-change', value: 'system' | 'personal' | 'team'): void
}>()

const modalRef = ref<InstanceType<typeof Modal> | null>(null)

function open() {
  modalRef.value?.open()
}

function close() {
  modalRef.value?.close()
}

defineExpose({
  open,
  close
})
</script>

<template>
  <Modal
    ref="modalRef"
    :title="isEdit ? `Edycja: ${editingLabel ?? ''}` : 'Nowa kategoria'"
    dismissible
    layout="default"
    :ui-box-variants="{ content: 'max-w-2xl' }"
    @close="emit('close')"
  >
    <template #body>
      <UForm
        :schema="CreateEventCategoryInputSchema"
        :state="form.values.value"
        class="space-y-4"
        @submit="emit('submit')"
      >
        <UFormField
          label="Typ"
          name="isSystem"
        >
          <USelect
            :model-value="categoryType.value"
            :items="typeOptions"
            :disabled="isEdit"
            class="w-full"
            @update:model-value="emit('category-type-change', $event)"
          />
        </UFormField>

        <UFormField
          v-if="categoryType.value === 'team'"
          label="Zespol"
          name="teamId"
          :error="form.errors.value?.teamId"
        >
          <USelect
            :model-value="form.values.value.teamId"
            :items="teamItems"
            :loading="teamsLoading"
            placeholder="Wybierz zespol"
            class="w-full"
            @update:model-value="form.setField('teamId', $event)"
          />
        </UFormField>

        <UFormField
          label="Nazwa"
          name="label"
          :error="form.errors.value?.label"
        >
          <UInput
            :model-value="form.values.value.label"
            placeholder="np. Spotkanie, Deadline"
            class="w-full"
            @update:model-value="form.setField('label', $event)"
          />
        </UFormField>

        <UFormField
          label="Slug"
          name="slug"
          :error="form.errors.value?.slug"
          description="Maly format: a-z, cyfry, myslniki"
        >
          <UInput
            :model-value="form.values.value.slug"
            placeholder="np. spotkanie"
            :disabled="isEdit"
            class="w-full"
            @update:model-value="emit('slug-change', $event)"
          />
        </UFormField>

        <UFormField
          label="Opis"
          name="description"
          :error="form.errors.value?.description"
        >
          <UTextarea
            :model-value="form.values.value.description"
            placeholder="Opcjonalny opis"
            class="w-full"
            @update:model-value="form.setField('description', $event)"
          />
        </UFormField>

        <UFormField
          label="Kolor"
          name="color"
          :error="form.errors.value?.color"
        >
          <div class="space-y-3">
            <UColorPicker
              :model-value="form.values.value.color"
              @update:model-value="form.setField('color', $event)"
            />
            <div class="flex flex-wrap gap-2">
              <button
                v-for="preset in colorPresets"
                :key="preset"
                type="button"
                class="h-8 w-8 rounded border-2"
                :class="form.values.value.color === preset ? 'border-gray-900 dark:border-white' : 'border-gray-300'"
                :style="{ backgroundColor: preset }"
                @click="form.setField('color', preset)"
              />
            </div>
          </div>
        </UFormField>

        <UFormField
          label="Ikona"
          name="icon"
          :error="form.errors.value?.icon"
        >
          <div class="space-y-2">
            <UInput
              :model-value="form.values.value.icon"
              placeholder="i-lucide-calendar"
              class="w-full"
              @update:model-value="form.setField('icon', $event)"
            />
            <div class="flex flex-wrap gap-2">
              <button
                v-for="preset in iconPresets"
                :key="preset"
                type="button"
                class="p-2 rounded border"
                :class="form.values.value.icon === preset ? 'border-gray-900 dark:border-white bg-gray-100 dark:bg-gray-800' : 'border-gray-300'"
                @click="form.setField('icon', preset)"
              >
                <UIcon
                  :name="preset"
                  class="h-5 w-5"
                />
              </button>
            </div>
          </div>
        </UFormField>

        <slot
          name="extra-fields"
          :form="form"
        />

        <div class="grid grid-cols-2 gap-4">
          <UFormField
            label="Sortowanie"
            name="sortOrder"
            :error="form.errors.value?.sortOrder"
          >
            <UInput
              :model-value="form.values.value.sortOrder"
              type="number"
              min="0"
              class="w-full"
              @update:model-value="form.setField('sortOrder', $event)"
            />
          </UFormField>
          <UFormField
            label="Domyslna"
            name="isDefault"
          >
            <USwitch
              :model-value="form.values.value.isDefault"
              @update:model-value="form.setField('isDefault', $event)"
            />
          </UFormField>
        </div>

        <div class="rounded-lg border border-default bg-default-50 p-3">
          <p class="text-xs text-muted mb-2">
            Podglad
          </p>
          <EventCategoryBadge
            :category="{
              label: form.values.value.label || 'Podglad',
              color: form.values.value.color || '#3b82f6',
              icon: form.values.value.icon || 'i-lucide-tag'
            }"
            size="sm"
          />
        </div>

        <UAlert
          v-if="form.formError.value"
          color="error"
          variant="soft"
          :title="form.formError.value"
        />
      </UForm>
    </template>

    <template #footer>
      <UButton
        variant="outline"
        color="neutral"
        @click="close"
      >
        Anuluj
      </UButton>
      <UButton
        color="primary"
        :loading="form.pending.value"
        @click="emit('submit')"
      >
        {{ isEdit ? 'Zapisz' : 'Utworz' }}
      </UButton>
    </template>
  </Modal>
</template>
