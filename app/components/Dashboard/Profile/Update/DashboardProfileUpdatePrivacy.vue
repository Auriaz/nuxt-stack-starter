<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import { UpdatePrivacyInputSchema } from '#shared/schemas/profile'
import type { InferOutput } from 'valibot'
import { useProfile } from '~/composables/resources/useProfile'

const { profile, updatePrivacy, errors, isLoading } = useProfile()
const emit = defineEmits<{
  success: []
  cancel: []
}>()

const form = useForm(UpdatePrivacyInputSchema, {
  initialValues: { showEmail: true }
})

// Inicjalizacja formularza z aktualnego profilu (po załadowaniu profilu)
watch(
  () => profile.value?.showEmail,
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
    // Ustaw formularz na zapisane wartości (reset() przywróciłby initialValues z showEmail: true)
    form.setField('showEmail', values.showEmail)
    emit('success')
  } else {
    form.setErrorsFromApi({
      data: {
        error: {
          message: errors.value?.root ?? 'Nie udało się zaktualizować ustawień prywatności'
        }
      }
    })
  }
}

function handleSubmitEvent(event: FormSubmitEvent<InferOutput<typeof UpdatePrivacyInputSchema>>) {
  form.handleSubmit(onSubmit)(event)
}

function handleCancel() {
  form.reset()
  if (profile.value?.showEmail !== undefined) {
    form.setField('showEmail', profile.value.showEmail)
  }
  emit('cancel')
}
</script>

<template>
  <UForm
    :schema="UpdatePrivacyInputSchema"
    :state="form.values.value"
    class="w-full"
    @submit="handleSubmitEvent"
  >
    <div class="space-y-6">
      <UFormField
        label="Pokazuj email w profilu"
        name="showEmail"
        :error="form.errors.value?.showEmail"
      >
        <template #hint>
          <span class="text-sm text-neutral-500 dark:text-neutral-400">
            Gdy włączone, Twój adres email będzie widoczny dla innych użytkowników w publicznym profilu.
            Gdy wyłączone, email pozostanie ukryty.
          </span>
        </template>
        <USwitch
          :model-value="form.values.value?.showEmail ?? true"
          :disabled="isLoading || form.pending.value"
          @update:model-value="form.setField('showEmail', $event)"
        />
      </UFormField>
    </div>

    <div
      v-if="form.formError.value"
      class="mt-4 rounded-lg border border-error-200 bg-error-50 p-3 dark:border-error-800 dark:bg-error-900/20"
    >
      <p class="text-sm text-error-600 dark:text-error-400">
        {{ form.formError.value }}
      </p>
    </div>

    <div class="mt-6 flex items-center justify-end gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-700">
      <UButton
        variant="outline"
        color="neutral"
        :disabled="isLoading || form.pending.value"
        @click="handleCancel"
      >
        Anuluj
      </UButton>
      <UButton
        type="button"
        color="primary"
        :loading="form.pending.value"
        :disabled="isLoading || form.pending.value"
        @click="handleSubmitEvent({ data: form.values.value } as FormSubmitEvent<InferOutput<typeof UpdatePrivacyInputSchema>>)"
      >
        Zapisz zmiany
      </UButton>
    </div>
  </UForm>
</template>
