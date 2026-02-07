<script lang="ts" setup>
import type { SettingsDTO } from '#shared/types'
import { useSettingsResource } from '~/composables/resources/useSettingsResource'

const props = defineProps<{
  settings: SettingsDTO | null
}>()
const emit = defineEmits<{
  updated: [SettingsDTO]
}>()

const settingsResource = useSettingsResource()
const toast = useToast()

/** Id dostawcy LLM (zgodny z API). */
type LlmProviderId = 'openai' | 'anthropic'

interface LlmProviderOption {
  id: LlmProviderId
  label: string
  description: string
  icon: string
  placeholder: string
}

/** Dostępni dostawcy LLM (id = wartość w API). */
const LLM_PROVIDERS: LlmProviderOption[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    description: 'GPT-4o-mini, GPT-4 itd. Klucz w formacie sk-...',
    icon: 'i-simple-icons-openai',
    placeholder: 'sk-...'
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    description: 'Claude. Klucz API z konsoli Anthropic.',
    icon: 'i-simple-icons-anthropic',
    placeholder: 'sk-ant-...'
  }
]

const selectedProviderId = ref<LlmProviderId>((LLM_PROVIDERS[0]?.id ?? 'openai') as LlmProviderId)
const llmApiKeyInput = ref('')
const pending = ref(false)
const error = ref<string | null>(null)

/** Własny prompt systemowy dla asystenta AI (kontekst, ton, styl). */
const llmSystemPrompt = ref('')
const promptPending = ref(false)
const promptError = ref<string | null>(null)

const configuredProviders = computed(() => props.settings?.llmProviders ?? [])

/** Inicjalizuj pole promptu z ustawień (gdy settings się zmieni). */
watch(
  () => props.settings?.llmSystemPrompt,
  (v) => {
    llmSystemPrompt.value = v ?? ''
  },
  { immediate: true }
)

const selectedProvider = computed((): LlmProviderOption => {
  const found = LLM_PROVIDERS.find(p => p.id === selectedProviderId.value)
  return found ?? LLM_PROVIDERS[0]!
})

async function saveLlmKey() {
  error.value = null
  pending.value = true
  try {
    const value = llmApiKeyInput.value?.trim()
    const provider = selectedProviderId.value
    const data = await settingsResource.updateMySettings({
      llmProviders: [{ provider, apiKey: value || null }]
    })
    emit('updated', data)
    const label = selectedProvider.value?.label ?? selectedProviderId.value
    toast.add({
      title: 'Zapisano',
      description: value ? `Klucz dla ${label} został zapisany.` : `Klucz dla ${label} został usunięty.`,
      color: 'success'
    })
    llmApiKeyInput.value = ''
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Nie udało się zapisać klucza.'
    error.value = msg
    toast.add({ title: 'Błąd', description: msg, color: 'error' })
  } finally {
    pending.value = false
  }
}

async function removeProviderKey(provider: string) {
  error.value = null
  pending.value = true
  try {
    const data = await settingsResource.updateMySettings({
      llmProviders: [{ provider, apiKey: null }]
    })
    emit('updated', data)
    toast.add({
      title: 'Usunięto',
      description: `Klucz dla dostawcy został usunięty.`,
      color: 'success'
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Nie udało się usunąć klucza.'
    error.value = msg
    toast.add({ title: 'Błąd', description: msg, color: 'error' })
  } finally {
    pending.value = false
  }
}

function getProviderLabel(providerId: string): string {
  return LLM_PROVIDERS.find(p => p.id === providerId)?.label ?? providerId
}

async function saveSystemPrompt() {
  promptError.value = null
  promptPending.value = true
  try {
    const value = llmSystemPrompt.value?.trim() || null
    const data = await settingsResource.updateMySettings({ llmSystemPrompt: value ?? undefined })
    emit('updated', data)
    toast.add({
      title: 'Zapisano',
      description: value ? 'Własny prompt systemowy został zapisany.' : 'Własny prompt został usunięty.',
      color: 'success'
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Nie udało się zapisać promptu.'
    promptError.value = msg
    toast.add({ title: 'Błąd', description: msg, color: 'error' })
  } finally {
    promptPending.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Połączone konta (OAuth) -->
    <UCard
      variant="soft"
      class="overflow-hidden"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <UIcon
              name="i-lucide-link-2"
              class="h-5 w-5 text-primary"
            />
          </div>
          <div>
            <h2 class="text-lg font-semibold">
              Połączone konta
            </h2>
            <p class="mt-0.5 text-sm text-muted">
              Konta OAuth (GitHub, Google) i zarządzanie połączeniami.
            </p>
          </div>
        </div>
      </template>
      <UAlert
        color="primary"
        variant="soft"
        title="Wkrótce"
        description="Zarządzanie połączonymi kontami (OAuth) będzie dostępne w tej sekcji."
        icon="i-lucide-info"
        class="rounded-lg"
      />
    </UCard>

    <!-- Asystent AI (LLM) -->
    <UCard
      variant="soft"
      class="overflow-hidden"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <UIcon
              name="i-lucide-sparkles"
              class="h-5 w-5 text-primary"
            />
          </div>
          <div>
            <h2 class="text-lg font-semibold">
              Asystent AI (LLM)
            </h2>
            <p class="mt-0.5 text-sm text-muted">
              Klucze API są używane w edytorze bloga: kontynuacja tekstu, poprawki gramatyczne, skracanie i tłumaczenie. Możesz dodać kilku dostawców i wybrać domyślnego w edytorze.
            </p>
          </div>
        </div>
      </template>

      <div class="space-y-8">
        <!-- Wybór dostawcy i dodanie klucza -->
        <div class="rounded-xl border border-default bg-default/30 p-5">
          <h3 class="mb-4 text-sm font-medium text-muted">
            Dodaj lub zaktualizuj klucz
          </h3>
          <div class="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]">
            <UFormField
              label="Dostawca LLM"
              name="llmProvider"
            >
              <USelect
                v-model="selectedProviderId"
                :items="LLM_PROVIDERS.map(p => ({ label: p.label, value: p.id }))"
                value-key="value"
                class="w-full"
                :disabled="pending"
              />
            </UFormField>
            <UFormField
              :label="`Klucz API (${selectedProvider?.label ?? ''})`"
              name="llmApiKey"
              :error="error ?? undefined"
              :description="selectedProvider?.description"
            >
              <UInput
                v-model="llmApiKeyInput"
                type="password"
                :placeholder="selectedProvider?.placeholder"
                autocomplete="off"
                class="w-full"
                :disabled="pending"
                @keydown.enter.prevent="saveLlmKey"
              />
            </UFormField>
            <div class="flex items-end">
              <UButton
                color="primary"
                :loading="pending"
                class="w-full sm:w-auto"
                @click="saveLlmKey"
              >
                Zapisz klucz
              </UButton>
            </div>
          </div>
        </div>

        <!-- Lista skonfigurowanych dostawców -->
        <div
          v-if="configuredProviders.length > 0"
          class="rounded-xl border border-default bg-default/30 p-5"
        >
          <h3 class="mb-4 text-sm font-medium text-muted">
            Skonfigurowani dostawcy
          </h3>
          <ul class="space-y-3">
            <li
              v-for="item in configuredProviders.filter((p) => p.hasKey)"
              :key="item.provider"
              class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-default/50 bg-default/20 px-4 py-3"
            >
              <div class="flex items-center gap-3">
                <UIcon
                  :name="LLM_PROVIDERS.find((p) => p.id === item.provider)?.icon ?? 'i-lucide-key'"
                  class="h-5 w-5 text-muted"
                />
                <span class="font-medium">
                  {{ getProviderLabel(item.provider) }}
                </span>
                <UBadge
                  color="success"
                  variant="soft"
                  size="xs"
                >
                  Zapisano
                </UBadge>
              </div>
              <UButton
                variant="ghost"
                color="error"
                size="xs"
                icon="i-lucide-trash-2"
                :loading="pending"
                @click="removeProviderKey(item.provider)"
              >
                Usuń klucz
              </UButton>
            </li>
          </ul>
        </div>

        <div
          v-else
          class="rounded-xl border border-dashed border-default bg-default/20 p-6 text-center"
        >
          <UIcon
            name="i-lucide-key-round"
            class="mx-auto h-10 w-10 text-muted"
          />
          <p class="mt-2 text-sm text-muted">
            Nie dodano jeszcze żadnego klucza. Wybierz dostawcę powyżej i wpisz klucz API.
          </p>
        </div>

        <!-- Własny prompt systemowy -->
        <div class="rounded-xl border border-default bg-default/30 p-5">
          <h3 class="mb-1 text-sm font-medium text-muted">
            Własny prompt systemowy (opcjonalnie)
          </h3>
          <p class="mb-4 text-xs text-muted">
            Dodatkowy kontekst dla asystenta AI w edytorze (np. „Pisz w tonie profesjonalnym”, „Blog o Nuxt i TypeScript”). Zostanie dopisany na początku instrukcji dla każdej akcji (kontynuuj, popraw, skróć, tłumacz itd.).
          </p>
          <UFormField
            label="Prompt"
            name="llmSystemPrompt"
            :error="promptError ?? undefined"
          >
            <UTextarea
              v-model="llmSystemPrompt"
              placeholder="np. Pisz po polsku, w tonie przyjaznym i zwięzłym. Skup się na praktycznych przykładach."
              :rows="4"
              class="w-full"
              :disabled="promptPending"
            />
          </UFormField>
          <div class="mt-3">
            <UButton
              color="primary"
              :loading="promptPending"
              @click="saveSystemPrompt"
            >
              Zapisz prompt
            </UButton>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
