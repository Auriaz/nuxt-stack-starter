<script lang="ts" setup>
import { nextTick, ref, toRefs, watch } from 'vue'
import type { UIMessage, ChatStatus } from 'ai'
import { useMarkdownRender } from '~/composables/useMarkdownRender'
import ContentProseHtml from '~/components/content/ContentProseHtml.vue'

const props = defineProps<{
  threadTitle?: string
  messages: UIMessage[]
  status: ChatStatus
  typingUsers?: number[]
  loading?: boolean
  error?: string | null
  draft: string
  disabled?: boolean
  focusMessageId?: string | number | null
}>()

const { threadTitle, messages, status, typingUsers, loading, error, draft, disabled, focusMessageId } = toRefs(props)

const emit = defineEmits<{
  (event: 'send'): void
  (event: 'typing', typing: boolean): void
  (event: 'update:draft', value: string): void
}>()

const { toHtml } = useMarkdownRender()

function renderMarkdown(content?: string) {
  return toHtml(content ?? '')
}

function getMessageText(message: UIMessage) {
  if (!Array.isArray(message.parts)) return ''
  return message.parts
    .filter(part => part.type === 'text' && 'text' in part)
    .map(part => part.text)
    .join('')
}

function escapeAttr(value: string) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }
  return value.replace(/"/g, '\\"')
}

const lastFocusedId = ref<string | null>(null)

async function tryScrollToMessage(messageId: string) {
  await nextTick()
  const selector = `[data-message-id="${escapeAttr(messageId)}"]`
  const target = document.querySelector(selector) as HTMLElement | null
  if (!target) return false
  target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  return true
}

watch(
  () => [focusMessageId.value, messages.value.length],
  async ([id]) => {
    if (!id) return
    const messageId = String(id)
    if (lastFocusedId.value === messageId) return
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const found = await tryScrollToMessage(messageId)
      if (found) {
        lastFocusedId.value = messageId
        break
      }
      await new Promise(resolve => setTimeout(resolve, 80))
    }
  }
)
</script>

<template>
  <UCard
    class="h-full"
    :ui="{ body: 'p-0 h-full flex flex-col' }"
  >
    <div class="flex items-center justify-between border-b border-basic-200 dark:border-basic-800 px-4 py-3">
      <div class="min-w-0">
        <p class="text-sm font-semibold text-basic-900 dark:text-basic-100 truncate">
          {{ threadTitle || 'Czat' }}
        </p>
        <p
          v-if="typingUsers && typingUsers.length"
          class="text-xs text-basic-500"
        >
          Pisze...
        </p>
      </div>
    </div>

    <div class="flex-1 min-h-0">
      <UChatPalette class="h-full">
        <template #default>
          <div
            v-if="loading"
            class="p-4 space-y-3"
          >
            <USkeleton
              v-for="item in 4"
              :key="item"
              class="h-12"
            />
          </div>
          <div
            v-else-if="messages.length === 0"
            class="h-full flex items-center justify-center text-sm text-basic-500"
          >
            Brak wiadomosci
          </div>
          <UChatMessages
            v-else
            class="h-full"
            :messages="messages"
            :status="status"
            :should-auto-scroll="true"
            :should-scroll-to-bottom="true"
          >
            <template #content="{ message }">
              <div :data-message-id="message.id">
                <ContentProseHtml
                  v-if="message.role === 'assistant'"
                  :html="renderMarkdown(getMessageText(message))"
                />
                <span v-else>{{ getMessageText(message) }}</span>
              </div>
            </template>
          </UChatMessages>
        </template>
        <template #prompt>
          <div class="border-t border-basic-200 dark:border-basic-800 p-4">
            <ChatPromptBox
              :model-value="draft"
              :status="status"
              :disabled="disabled"
              @update:model-value="(value) => emit('update:draft', value)"
              @send="emit('send')"
              @typing="(value) => emit('typing', value)"
            />
          </div>
        </template>
      </UChatPalette>
    </div>

    <div
      v-if="error"
      class="p-4"
    >
      <UAlert
        variant="soft"
        color="error"
        :title="error"
      />
    </div>
  </UCard>
</template>
