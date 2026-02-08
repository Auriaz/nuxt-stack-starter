<script lang="ts" setup>
import { nextTick, ref, toRefs, watch } from 'vue'
import type { UIMessage, ChatStatus } from 'ai'
import type { ChatThreadDTO, ChatParticipantWithUserDTO, ChatMessageDTO } from '#shared/types/chat'
import { useMarkdownRender } from '~/composables/useMarkdownRender'
import ContentProseHtml from '~/components/content/ContentProseHtml.vue'

const props = defineProps<{
  threadTitle?: string
  threadType?: ChatThreadDTO['type']
  currentUserId?: number
  currentUserName?: string
  currentUserAvatarUrl?: string | null
  participants?: ChatParticipantWithUserDTO[]
  rawMessages?: ChatMessageDTO[]
  messages: UIMessage[]
  status: ChatStatus
  typingUsers?: number[]
  loading?: boolean
  error?: string | null
  draft: string
  disabled?: boolean
  focusMessageId?: string | number | null
}>()

const { threadTitle, threadType, currentUserId, currentUserName, currentUserAvatarUrl, participants, rawMessages, messages, status, typingUsers, loading, error, draft, disabled, focusMessageId } = toRefs(props)

const emit = defineEmits<{
  (event: 'send'): void
  (event: 'typing', typing: boolean): void
  (event: 'update:draft', value: string): void
}>()

const { toHtml } = useMarkdownRender()

const typeLabelMap: Record<string, string> = {
  ai: 'AI',
  dm: 'DM',
  team: 'Zespol',
  room: 'Pokoj'
}

type BadgeColor = 'error' | 'primary' | 'neutral' | 'success' | 'warning' | 'secondary' | 'info'

const typeColorMap: Record<string, BadgeColor> = {
  ai: 'primary',
  dm: 'neutral',
  team: 'success',
  room: 'warning'
}

const typeIconMap: Record<string, string> = {
  ai: 'i-lucide-sparkles',
  dm: 'i-lucide-user',
  team: 'i-lucide-users',
  room: 'i-lucide-hash'
}

const threadBadgeLabel = computed(() => (threadType.value ? typeLabelMap[threadType.value] : undefined))
const threadBadgeColor = computed<BadgeColor | undefined>(() => {
  const key = threadType.value as keyof typeof typeColorMap | undefined
  return key ? typeColorMap[key] : undefined
})
const threadBadgeIcon = computed(() => {
  const key = threadType.value as keyof typeof typeIconMap | undefined
  return key ? typeIconMap[key] : undefined
})

const currentUserIdValue = computed(() => {
  const raw = currentUserId.value
  const parsed = typeof raw === 'string' ? Number(raw) : raw
  return Number.isFinite(parsed) ? parsed : undefined
})

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

const rawMessageMap = computed(() => {
  const map = new Map<string, ChatMessageDTO>()
  if (!rawMessages.value) return map
  for (const item of rawMessages.value) {
    map.set(String(item.id), item)
  }
  return map
})

function getRawMessage(message: UIMessage) {
  return rawMessageMap.value.get(String(message.id))
}

function getSenderId(message: UIMessage) {
  const raw = getRawMessage(message)
  if (raw && typeof raw.sender_id === 'number') return raw.sender_id
  return (message as UIMessage & { senderId?: number }).senderId
}

function getParticipant(senderId?: number) {
  if (!senderId || !participants.value) return null
  return participants.value.find(item => item.user_id === senderId) || null
}

function isOwnMessage(message: UIMessage) {
  const senderId = getSenderId(message)
  return senderId && senderId === currentUserIdValue.value
}

function getInitials(label?: string) {
  if (!label) return 'TY'
  const parts = label.trim().split(' ').filter(Boolean)
  if (parts.length === 0) return 'TY'
  const first = parts[0] || ''
  if (parts.length === 1) return first.slice(0, 2).toUpperCase() || 'TY'
  const second = parts[1] || ''
  const initials = `${first[0] || ''}${second[0] || ''}`.toUpperCase()
  return initials || 'TY'
}

function getMessageMeta(message: UIMessage) {
  const senderId = getSenderId(message)
  const participant = senderId ? getParticipant(senderId) : null
  const participantName = participant?.user?.name || participant?.user?.username
  const author = senderId
    ? (senderId === currentUserIdValue.value ? 'Ty' : (participantName || `Uzytkownik ${senderId}`))
    : (message.role === 'assistant' ? 'Asystent' : 'System')
  const raw = getRawMessage(message)
  const createdAt = raw?.created_at
    ? new Date(raw.created_at)
    : (message as UIMessage & { createdAt?: Date }).createdAt
  const timestamp = createdAt ? createdAt.toLocaleString() : ''
  return timestamp ? `${author} • ${timestamp}` : author
}

function getMessageBubbleClass(message: UIMessage) {
  if (isOwnMessage(message)) {
    return 'bg-primary-600 text-white'
  }
  if (message.role === 'assistant') {
    return 'bg-basic-100 dark:bg-basic-800 text-basic-900 dark:text-basic-100'
  }
  if (message.role === 'system') {
    return 'bg-basic-50 dark:bg-basic-900/60 text-basic-600 dark:text-basic-300'
  }
  return 'bg-basic-50 dark:bg-basic-900/40 text-basic-900 dark:text-basic-100'
}

async function copyMessageText(message: UIMessage) {
  const text = getMessageText(message)
  if (!text) return
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
  } else {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', 'true')
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }

  const key = String(message.id)
  copiedById.value[key] = true
  setTimeout(() => {
    copiedById.value[key] = false
  }, 1200)
}

function escapeAttr(value: string) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }
  return value.replace(/"/g, '\\"')
}

const lastFocusedId = ref<string | null>(null)
const copiedById = ref<Record<string, boolean>>({})

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
        <div class="flex items-center gap-2">
          <p class="text-sm font-semibold text-basic-900 dark:text-basic-100 truncate">
            {{ threadTitle || 'Czat' }}
          </p>
          <UBadge
            v-if="threadBadgeLabel"
            :label="threadBadgeLabel"
            :color="threadBadgeColor"
            variant="soft"
            size="xs"
          />
          <UIcon
            v-if="threadBadgeIcon"
            :name="threadBadgeIcon"
            class="h-3.5 w-3.5 text-basic-500 dark:text-basic-400"
          />
        </div>
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
            <template #default>
              <UChatMessage
                v-for="message in messages"
                :key="message.id"
                v-bind="message"
                :side="isOwnMessage(message) ? 'right' : 'left'"
                :variant="isOwnMessage(message) ? 'soft' : 'naked'"
                :avatar="isOwnMessage(message)
                  ? { src: currentUserAvatarUrl || undefined, text: getInitials(currentUserName) }
                  : (message.role === 'assistant'
                    ? { icon: 'i-lucide-sparkles' }
                    : { src: getParticipant(getSenderId(message))?.user?.avatar_url, text: getInitials(getParticipant(getSenderId(message))?.user?.name || getParticipant(getSenderId(message))?.user?.username) })"
              >
                <template #content>
                  <div
                    :data-message-id="message.id"
                    class="space-y-1"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <p class="text-[11px] text-basic-500 dark:text-basic-400">
                        {{ getMessageMeta(message) }}
                      </p>
                      <UButton
                        size="xs"
                        variant="ghost"
                        color="neutral"
                        :icon="copiedById[String(message.id)] ? 'i-lucide-check' : 'i-lucide-copy'"
                        :aria-label="'Kopiuj wiadomosc'"
                        @click.stop="copyMessageText(message)"
                      />
                    </div>
                    <div
                      class="rounded-lg px-3 py-2 text-sm leading-relaxed"
                      :class="getMessageBubbleClass(message)"
                    >
                      <ContentProseHtml
                        v-if="message.role === 'assistant'"
                        :html="renderMarkdown(getMessageText(message))"
                      />
                      <span v-else>{{ getMessageText(message) }}</span>
                    </div>
                  </div>
                </template>
              </UChatMessage>
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
