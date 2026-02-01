<script lang="ts" setup>
import type { SettingsDTO } from '#shared/types'
import { SettingsUpdateSchema } from '#shared/schemas/settings'
import type { InferOutput } from 'valibot'
import { useSettingsResource } from '~/composables/resources/useSettingsResource'

const props = defineProps<{
  settings: SettingsDTO | null
}>()
const emit = defineEmits<{
  updated: [SettingsDTO]
}>()

const settingsResource = useSettingsResource()
const toast = useToast()

const form = useForm(SettingsUpdateSchema, {
  initialValues: {
    locale: props.settings?.locale ?? 'pl',
    timezone: props.settings?.timezone ?? 'Europe/Warsaw'
  }
})

watch(
  () => props.settings,
  (s) => {
    if (s) {
      form.setValues({ locale: s.locale ?? 'pl', timezone: s.timezone ?? 'Europe/Warsaw' })
    }
  },
  { immediate: true }
)

async function onSubmit(values: InferOutput<typeof SettingsUpdateSchema>) {
  try {
    const data = await settingsResource.updateMySettings({
      locale: values.locale,
      timezone: values.timezone
    })
    emit('updated', data)
    toast.add({ title: 'Zapisano', description: 'Ustawienia ogólne zostały zaktualizowane.', color: 'success' })
  } catch (e: unknown) {
    form.setErrorsFromApi(e)
  }
}
</script>

<template>
  <div class="space-y-6">
    <UCard variant="soft">
      <template #header>
        <h2 class="text-lg font-semibold">
          Język i region
        </h2>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Wybierz język interfejsu i strefę czasową.
        </p>
      </template>

      <UForm
        :schema="SettingsUpdateSchema"
        :state="form.values.value"
        class="w-full"
        @submit="form.handleSubmit(onSubmit)"
      >
        <div class="space-y-4">
          <UFormField
            label="Język"
            name="locale"
            :error="form.errors.value?.locale"
          >
            <USelect
              :model-value="form.values.value?.locale ?? 'pl'"
              :items="[
                { label: 'Polski', value: 'pl' },
                { label: 'English', value: 'en' }
              ]"
              @update:model-value="form.setField('locale', $event)"
            />
          </UFormField>
          <UFormField
            label="Strefa czasowa"
            name="timezone"
            :error="form.errors.value?.timezone"
          >
            <UInput
              :model-value="form.values.value?.timezone ?? 'Europe/Warsaw'"
              placeholder="Europe/Warsaw"
              @update:model-value="form.setField('timezone', $event)"
            />
          </UFormField>
        </div>

        <UAlert
          v-if="form.formError.value"
          color="error"
          variant="soft"
          :title="form.formError.value"
          class="mt-4"
        />

        <div class="mt-6 flex justify-end">
          <UButton
            type="submit"
            color="primary"
            :loading="form.pending.value"
          >
            Zapisz
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
