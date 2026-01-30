<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import { UpdatePasswordFormSchema } from '#shared/schemas/profile'
import type { InferOutput } from 'valibot'
import { useProfile } from '~/composables/resources/useProfile'

const { updatePassword, errors, isLoading } = useProfile()
const emit = defineEmits<{
  success: []
  cancel: []
}>()

const form = useForm(UpdatePasswordFormSchema, {
  initialValues: {
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  }
})

async function onSubmit(values: InferOutput<typeof UpdatePasswordFormSchema>) {
  if (values.newPassword !== values.newPasswordConfirm) {
    form.errors.value.newPasswordConfirm = 'Hasła muszą być identyczne'
    return
  }

  const success = await updatePassword({
    currentPassword: values.currentPassword,
    newPassword: values.newPassword
  })

  if (success) {
    form.reset()
    emit('success')
  } else {
    form.setErrorsFromApi({
      data: {
        error: {
          message: errors.value?.root ?? 'Nie udało się zmienić hasła'
        }
      }
    })
  }
}

function handleSubmitEvent(event: FormSubmitEvent<InferOutput<typeof UpdatePasswordFormSchema>>) {
  form.handleSubmit(onSubmit)(event)
}

function handleCancel() {
  form.reset()
  emit('cancel')
}

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showNewPasswordConfirm = ref(false)
</script>

<template>
  <UForm
    :schema="UpdatePasswordFormSchema"
    :state="form.values.value"
    class="w-full"
    @submit="handleSubmitEvent"
  >
    <div class="space-y-4 w-full">
      <UFormField
        label="Obecne hasło"
        name="currentPassword"
        required
        :error="form.errors.value?.currentPassword"
        class="w-full"
      >
        <UInput
          :model-value="form.values.value?.currentPassword"
          :type="showCurrentPassword ? 'text' : 'password'"
          placeholder="••••••••"
          :disabled="isLoading || form.pending.value"
          class="w-full"
          @update:model-value="form.setField('currentPassword', $event)"
        >
          <template #trailing>
            <UButton
              type="button"
              color="neutral"
              size="xs"
              variant="ghost"
              :icon="showCurrentPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="showCurrentPassword ? 'Ukryj hasło' : 'Pokaż hasło'"
              @click="showCurrentPassword = !showCurrentPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <UFormField
        label="Nowe hasło"
        name="newPassword"
        required
        :error="form.errors.value?.newPassword"
        class="w-full"
      >
        <UInput
          :model-value="form.values.value?.newPassword"
          :type="showNewPassword ? 'text' : 'password'"
          placeholder="••••••••"
          :disabled="isLoading || form.pending.value"
          class="w-full"
          @update:model-value="form.setField('newPassword', $event)"
        >
          <template #trailing>
            <UButton
              type="button"
              color="neutral"
              size="xs"
              variant="ghost"
              :icon="showNewPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="showNewPassword ? 'Ukryj hasło' : 'Pokaż hasło'"
              @click="showNewPassword = !showNewPassword"
            />
          </template>
        </UInput>
        <template #hint>
          <span class="text-xs text-neutral-500 w-full">
            Hasło musi mieć co najmniej 8 znaków i zawierać wielkie litery, małe litery, cyfry i znaki specjalne.
          </span>
        </template>
      </UFormField>

      <UFormField
        label="Potwierdź nowe hasło"
        name="newPasswordConfirm"
        required
        :error="form.errors.value?.newPasswordConfirm"
        class="w-full"
      >
        <UInput
          :model-value="form.values.value?.newPasswordConfirm"
          :type="showNewPasswordConfirm ? 'text' : 'password'"
          placeholder="••••••••"
          :disabled="isLoading || form.pending.value"
          class="w-full"
          @update:model-value="form.setField('newPasswordConfirm', $event)"
        >
          <template #trailing>
            <UButton
              type="button"
              color="neutral"
              size="xs"
              variant="ghost"
              :icon="showNewPasswordConfirm ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="showNewPasswordConfirm ? 'Ukryj hasło' : 'Pokaż hasło'"
              @click="showNewPasswordConfirm = !showNewPasswordConfirm"
            />
          </template>
        </UInput>
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

    <div class="flex items-center justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700 mt-6">
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
        @click="handleSubmitEvent({ data: form.values.value } as FormSubmitEvent<InferOutput<typeof UpdatePasswordFormSchema>>)"
      >
        Zmień hasło
      </UButton>
    </div>
  </UForm>
</template>
