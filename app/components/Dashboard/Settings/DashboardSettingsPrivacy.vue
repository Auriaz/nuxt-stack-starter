<script lang="ts" setup>
import type { SettingsDTO } from '#shared/types'
import { UpdatePrivacyInputSchema } from '#shared/schemas/profile'
import type { InferOutput } from 'valibot'
import { useProfile } from '~/composables/resources/useProfile'

const props = defineProps<{
  settings: SettingsDTO | null
}>()
const emit = defineEmits<{
  updated: [SettingsDTO]
}>()

const { updatePrivacy, errors: profileErrors } = useProfile()
const toast = useToast()

const form = useForm(UpdatePrivacyInputSchema, {
  initialValues: { showEmail: props.settings?.showEmail ?? true }
})

watch(
  () => props.settings?.showEmail,
  (showEmail) => {
    if (showEmail !== undefined && showEmail !== null) {
      form.setField('showEmail', showEmail)
    }
  },
  { immediate: true }
)

async function onSubmit(values: InferOutput<typeof UpdatePrivacyInputSchema>) {
  const success = await updatePrivacy({ showEmail: values.showEmail })
  if (success) {
    emit('updated', { ...props.settings!, showEmail: values.showEmail })
    toast.add({ title: 'Zapisano', description: 'Ustawienia prywatności zostały zaktualizowane.', color: 'success' })
  } else {
    form.setErrorsFromApi({
      data: {
        error: {
          message: profileErrors.value?.root ?? 'Nie udało się zaktualizować ustawień prywatności'
        }
      }
    })
  }
}
</script>

<template>
  <div class="space-y-6">
    <UCard variant="soft">
      <template #header>
        <h2 class="text-lg font-semibold">
          Widoczność e-maila
        </h2>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Czy Twój adres e-mail ma być widoczny w publicznym profilu.
        </p>
      </template>

      <UForm
        :schema="UpdatePrivacyInputSchema"
        :state="form.values.value"
        class="w-full"
        @submit="form.handleSubmit(onSubmit)"
      >
        <UFormField
          label="Pokazuj e-mail w profilu"
          name="showEmail"
          :error="form.errors.value?.showEmail"
        >
          <template #hint>
            Gdy włączone, adres e-mail będzie widoczny dla innych. Gdy wyłączone — pozostanie ukryty.
          </template>
          <USwitch
            :model-value="form.values.value?.showEmail ?? true"
            @update:model-value="form.setField('showEmail', $event)"
          />
        </UFormField>

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
