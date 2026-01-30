<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import { UpdateProfileInputSchema } from '#shared/schemas/profile'
import type { InferOutput } from 'valibot'
import { useProfile } from '~/composables/resources/useProfile'

const { profile, updateProfile, errors, isLoading } = useProfile()
const emit = defineEmits<{
  success: []
  cancel: []
}>()

const form = useForm(UpdateProfileInputSchema, {
  initialValues: { name: '', bio: '' }
})

watch(
  () => profile.value,
  (p) => {
    if (p) {
      form.setValues({ name: p.name ?? '', bio: p.bio ?? '' })
    }
  },
  { immediate: true }
)

async function onSubmit(values: InferOutput<typeof UpdateProfileInputSchema>) {
  const result = await updateProfile({ name: values.name, bio: values.bio ?? null })
  if (result) {
    emit('success')
  } else {
    form.setErrorsFromApi({
      data: {
        error: {
          message: errors.value?.root ?? 'Nie udało się zaktualizować profilu'
        }
      }
    })
  }
}

function handleSubmitEvent(event: FormSubmitEvent<InferOutput<typeof UpdateProfileInputSchema>>) {
  form.handleSubmit(onSubmit)(event)
}

function handleCancel() {
  form.reset()
  if (profile.value) {
    form.setValues({ name: profile.value.name ?? '', bio: profile.value.bio ?? '' })
  }
  emit('cancel')
}
</script>

<template>
  <UForm
    :schema="UpdateProfileInputSchema"
    :state="form.values.value"
    class="w-full"
    @submit="handleSubmitEvent"
  >
    <div class="space-y-4">
      <UFormField
        label="Imię / Nazwa wyświetlana"
        name="name"
        :error="form.errors.value?.name"
        class="w-full"
      >
        <UInput
          :model-value="form.values.value?.name"
          placeholder="Jan Kowalski"
          :disabled="isLoading || form.pending.value"
          class="w-full"
          @update:model-value="form.setField('name', $event)"
        />
      </UFormField>

      <UFormField
        label="O mnie"
        name="bio"
        :error="form.errors.value?.bio"
        class="w-full"
      >
        <UTextarea
          :model-value="form.values.value?.bio ?? ''"
          placeholder="Krótki opis o sobie (max. 500 znaków)"
          :disabled="isLoading || form.pending.value"
          class="w-full"
          :rows="4"
          maxlength="500"
          @update:model-value="form.setField('bio', $event)"
        />
        <template #hint>
          <span class="text-xs text-basic-500">
            {{ (form.values.value?.bio ?? '').length }}/500
          </span>
        </template>
      </UFormField>
    </div>

    <div
      v-if="form.formError.value"
      class="rounded-lg border border-error-200 bg-error-50 p-3 dark:border-error-800 dark:bg-error-900/20 mt-4"
    >
      <p class="text-sm text-error-600 dark:text-error-400">
        {{ form.formError.value }}
      </p>
    </div>

    <div class="flex items-center justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700 mt-6 w-full">
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
        @click="handleSubmitEvent({ data: form.values.value } as FormSubmitEvent<InferOutput<typeof UpdateProfileInputSchema>>)"
      >
        Zapisz zmiany
      </UButton>
    </div>
  </UForm>
</template>
