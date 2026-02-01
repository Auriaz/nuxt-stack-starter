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
    emailNotifications: props.settings?.emailNotifications ?? true,
    marketingEmails: props.settings?.marketingEmails ?? false
  }
})

watch(
  () => props.settings,
  (s) => {
    if (s) {
      form.setValues({
        emailNotifications: s.emailNotifications ?? true,
        marketingEmails: s.marketingEmails ?? false
      })
    }
  },
  { immediate: true }
)

async function onSubmit(values: InferOutput<typeof SettingsUpdateSchema>) {
  try {
    const data = await settingsResource.updateMySettings({
      emailNotifications: values.emailNotifications,
      marketingEmails: values.marketingEmails
    })
    emit('updated', data)
    toast.add({ title: 'Zapisano', description: 'Ustawienia powiadomień zostały zaktualizowane.', color: 'success' })
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
          Powiadomienia e-mail
        </h2>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Zarządzaj powiadomieniami wysyłanymi na adres e-mail.
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
            label="Powiadomienia e-mail"
            name="emailNotifications"
            :error="form.errors.value?.emailNotifications"
          >
            <template #hint>
              Otrzymuj powiadomienia o ważnych zdarzeniach (np. nowe wiadomości, aktywność).
            </template>
            <USwitch
              :model-value="form.values.value?.emailNotifications ?? true"
              @update:model-value="form.setField('emailNotifications', $event)"
            />
          </UFormField>
          <UFormField
            label="E-mail marketingowy"
            name="marketingEmails"
            :error="form.errors.value?.marketingEmails"
          >
            <template #hint>
              Otrzymuj newsy i oferty (opcjonalnie).
            </template>
            <USwitch
              :model-value="form.values.value?.marketingEmails ?? false"
              @update:model-value="form.setField('marketingEmails', $event)"
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
