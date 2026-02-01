<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
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
const colorMode = useColorMode()
const toast = useToast()

const form = useForm(SettingsUpdateSchema, {
  initialValues: {
    appearanceTheme: (props.settings?.appearanceTheme ?? 'system') as 'system' | 'light' | 'dark'
  }
})

watch(
  () => props.settings?.appearanceTheme,
  (theme) => {
    if (theme) {
      form.setField('appearanceTheme', theme)
    }
  },
  { immediate: true }
)

async function onSubmit(values: InferOutput<typeof SettingsUpdateSchema>) {
  try {
    const data = await settingsResource.updateMySettings({
      appearanceTheme: values.appearanceTheme
    })
    emit('updated', data)
    if (data.appearanceTheme && data.appearanceTheme !== 'system') {
      colorMode.preference = data.appearanceTheme
    } else {
      colorMode.preference = 'system'
    }
    toast.add({ title: 'Zapisano', description: 'Motyw został zaktualizowany.', color: 'success' })
  } catch (e: unknown) {
    form.setErrorsFromApi(e)
  }
}

function handleSubmitEvent(event: FormSubmitEvent<InferOutput<typeof SettingsUpdateSchema>>) {
  form.handleSubmit(onSubmit)(event)
}
</script>

<template>
  <div class="space-y-6">
    <UCard variant="soft">
      <template #header>
        <h2 class="text-lg font-semibold">
          Motyw
        </h2>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Wybierz motyw interfejsu: systemowy, jasny lub ciemny.
        </p>
      </template>

      <UForm
        :schema="SettingsUpdateSchema"
        :state="form.values.value"
        class="w-full"
        @submit="handleSubmitEvent"
      >
        <div class="space-y-4">
          <UFormField
            label="Motyw"
            name="appearanceTheme"
            :error="form.errors.value?.appearanceTheme"
          >
            <USelect
              :model-value="form.values.value?.appearanceTheme ?? 'system'"
              :items="[
                { label: 'Zgodny z systemem', value: 'system' },
                { label: 'Jasny', value: 'light' },
                { label: 'Ciemny', value: 'dark' }
              ]"
              @update:model-value="form.setField('appearanceTheme', $event)"
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
            type="button"
            color="primary"
            :loading="form.pending.value"
            @click="handleSubmitEvent({ data: form.values.value } as FormSubmitEvent<InferOutput<typeof SettingsUpdateSchema>>)"
          >
            Zapisz
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
