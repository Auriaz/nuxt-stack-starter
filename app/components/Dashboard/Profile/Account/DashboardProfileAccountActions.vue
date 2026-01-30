<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import * as v from 'valibot'
import { useAccountActions } from '~/composables/useAccountActions'

const { deactivateAccount, deleteAccount, errors } = useAccountActions()

const showDeactivateForm = ref(false)
const showDeleteForm = ref(false)

const deactivateSchema = v.object({
  password: v.pipe(
    v.string('Hasło jest wymagane'),
    v.minLength(1, 'Hasło jest wymagane')
  )
})

const deleteSchema = v.object({
  password: v.pipe(
    v.string('Hasło jest wymagane'),
    v.minLength(1, 'Hasło jest wymagane')
  ),
  confirmation: v.pipe(
    v.string('Potwierdzenie jest wymagane'),
    v.picklist(['DELETE'], 'Musisz wpisać "DELETE" aby potwierdzić')
  )
})

const deactivateForm = useForm(deactivateSchema, { initialValues: { password: '' } })
const deleteForm = useForm(deleteSchema, { initialValues: { password: '', confirmation: '' } })

const onDeactivateSubmit = async (data: { password: string }) => {
  const ok = await deactivateAccount(data.password)
  if (ok) {
    showDeactivateForm.value = false
    deactivateForm.reset()
  }
}

const onDeleteSubmit = async (data: { password: string, confirmation: string }) => {
  const ok = await deleteAccount(data.password, data.confirmation)
  if (ok) {
    showDeleteForm.value = false
    deleteForm.reset()
  }
}

function handleDeactivateSubmitEvent(event: FormSubmitEvent<{ password: string }>) {
  deactivateForm.handleSubmit(onDeactivateSubmit)(event)
}

function handleDeleteSubmitEvent(event: FormSubmitEvent<{ password: string, confirmation: 'DELETE' }>) {
  deleteForm.handleSubmit(onDeleteSubmit)(event)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Export Data -->
    <UCard
      variant="subtle"
      color="info"
    >
      <template #header>
        <h4 class="flex items-center gap-2 text-lg font-semibold">
          <UIcon
            name="i-heroicons-arrow-down-tray"
            class="h-5 w-5 text-info-500"
          />
          Eksport danych (GDPR)
        </h4>
      </template>

      <div class="space-y-4">
        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          Pobierz kopię wszystkich swoich danych w formacie JSON zgodnie z RODO.
        </p>

        <UButton
          as="a"
          href="/api/profile/me/download"
          download="export-danych.json"
          color="info"
          icon="i-heroicons-arrow-down-tray"
        >
          Eksportuj dane
        </UButton>
      </div>
    </UCard>

    <!-- Deactivate Account -->
    <UCard
      v-if="!showDeactivateForm"
      variant="subtle"
      color="warning"
    >
      <template #header>
        <h4 class="flex items-center gap-2 text-lg font-semibold">
          <UIcon
            name="i-heroicons-pause-circle"
            class="h-5 w-5 text-warning-500"
          />
          Deaktywacja konta
        </h4>
      </template>

      <div class="space-y-4">
        <div class="rounded-lg border border-warning-200 bg-warning-50 p-4 dark:border-warning-800 dark:bg-warning-900/20">
          <div class="flex items-start gap-2">
            <UIcon
              name="i-heroicons-information-circle"
              class="h-5 w-5 text-warning-600 dark:text-warning-400"
            />
            <div class="text-sm text-warning-700 dark:text-warning-300">
              <p class="font-semibold mb-1">
                Co się stanie po deaktywacji?
              </p>
              <ul class="list-disc list-inside space-y-1">
                <li>Twoje konto zostanie tymczasowo wyłączone</li>
                <li>Nie będziesz mógł się zalogować</li>
                <li>Twoje dane pozostaną w systemie</li>
                <li>Możesz przywrócić konto kontaktując się z administratorem</li>
              </ul>
            </div>
          </div>
        </div>

        <UButton
          color="warning"
          variant="outline"
          icon="i-heroicons-pause-circle"
          @click="showDeactivateForm = true"
        >
          Deaktywuj konto
        </UButton>
      </div>
    </UCard>

    <!-- Deactivate Form -->
    <UCard
      v-else
      variant="subtle"
      color="warning"
    >
      <template #header>
        <h4 class="flex items-center gap-2 text-lg font-semibold">
          <UIcon
            name="i-heroicons-pause-circle"
            class="h-5 w-5 text-warning-500"
          />
          Potwierdź deaktywację konta
        </h4>
      </template>

      <UForm
        :schema="deactivateSchema"
        :state="deactivateForm.values.value"
        @submit="handleDeactivateSubmitEvent"
      >
        <div class="space-y-4">
          <UFormField
            label="Hasło"
            name="password"
            required
            :error="deactivateForm.errors.value.root ?? errors.root"
          >
            <UInput
              v-model="deactivateForm.values.value.password"
              type="password"
              placeholder="••••••••"
              :disabled="deactivateForm.pending.value"
            />
            <template #hint>
              <span class="text-xs text-neutral-500">
                Wprowadź swoje hasło, aby potwierdzić deaktywację konta.
              </span>
            </template>
          </UFormField>

          <div class="flex gap-3">
            <UButton
              variant="outline"
              color="neutral"
              :disabled="deactivateForm.pending.value"
              @click="showDeactivateForm = false; deactivateForm.reset()"
            >
              Anuluj
            </UButton>
            <UButton
              type="button"
              color="warning"
              :loading="deactivateForm.pending.value"
              :disabled="deactivateForm.pending.value"
              @click="handleDeactivateSubmitEvent({ data: deactivateForm.values.value } as FormSubmitEvent<{ password: string }>)"
            >
              Deaktywuj konto
            </UButton>
          </div>
        </div>
      </UForm>
    </UCard>

    <!-- Delete Account -->
    <UCard
      v-if="!showDeleteForm"
      variant="subtle"
      color="error"
    >
      <template #header>
        <h4 class="flex items-center gap-2 text-lg font-semibold">
          <UIcon
            name="i-heroicons-trash"
            class="h-5 w-5 text-error-500"
          />
          Usunięcie konta
        </h4>
      </template>

      <div class="space-y-4">
        <div class="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <div class="flex items-start gap-2">
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="h-5 w-5 text-error-600 dark:text-error-400"
            />
            <div class="text-sm text-error-700 dark:text-error-300">
              <p class="font-semibold mb-1">
                Uwaga: Ta operacja jest nieodwracalna!
              </p>
              <ul class="list-disc list-inside space-y-1">
                <li>Wszystkie Twoje dane zostaną trwale usunięte</li>
                <li>Nie będziesz mógł się zalogować</li>
                <li>Nie będzie możliwości przywrócenia konta</li>
                <li>Zalecamy najpierw wyeksportować swoje dane</li>
              </ul>
            </div>
          </div>
        </div>

        <UButton
          color="error"
          variant="outline"
          icon="i-heroicons-trash"
          @click="showDeleteForm = true"
        >
          Usuń konto
        </UButton>
      </div>
    </UCard>

    <!-- Delete Form -->
    <UCard
      v-else
      variant="subtle"
      color="error"
    >
      <template #header>
        <h4 class="flex items-center gap-2 text-lg font-semibold">
          <UIcon
            name="i-heroicons-trash"
            class="h-5 w-5 text-error-500"
          />
          Potwierdź usunięcie konta
        </h4>
      </template>

      <UForm
        :schema="deleteSchema"
        :state="deleteForm.values.value"
        @submit="deleteForm.handleSubmit(onDeleteSubmit)"
      >
        <div class="space-y-4">
          <UFormField
            label="Hasło"
            name="password"
            required
            :error="deleteForm.errors.value.root ?? errors.root"
          >
            <UInput
              v-model="deleteForm.values.value.password"
              type="password"
              placeholder="••••••••"
              :disabled="deleteForm.pending.value"
            />
          </UFormField>

          <UFormField
            label="Potwierdzenie"
            name="confirmation"
            required
            :error="deleteForm.errors.value.confirmation ?? errors.root"
          >
            <UInput
              v-model="deleteForm.values.value.confirmation"
              placeholder="Wpisz DELETE"
              :disabled="deleteForm.pending.value"
            />
            <template #hint>
              <span class="text-xs text-neutral-500">
                Wpisz <strong>DELETE</strong> aby potwierdzić, że rozumiesz konsekwencje tej operacji.
              </span>
            </template>
          </UFormField>

          <div class="flex gap-3">
            <UButton
              variant="outline"
              color="neutral"
              :disabled="deleteForm.pending.value"
              @click="showDeleteForm = false; deleteForm.reset()"
            >
              Anuluj
            </UButton>
            <UButton
              type="button"
              color="error"
              :loading="deleteForm.pending.value"
              :disabled="deleteForm.pending.value || deleteForm.values.value.confirmation !== 'DELETE'"
              @click="handleDeleteSubmitEvent({ data: deleteForm.values.value } as FormSubmitEvent<{ password: string, confirmation: 'DELETE' }>)"
            >
              Usuń konto na zawsze
            </UButton>
          </div>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
