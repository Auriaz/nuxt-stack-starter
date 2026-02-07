<script lang="ts" setup>
import type { ChatStatus } from 'ai'
import { useDebounceFn } from '@vueuse/core'

const props = defineProps<{
  modelValue: string
  status?: ChatStatus
  disabled?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'send'): void
  (event: 'typing', typing: boolean): void
}>()

const localValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

const emitTypingStop = useDebounceFn(() => {
  emit('typing', false)
}, 800)

const handleInput = () => {
  emit('typing', true)
  emitTypingStop()
}

const handleSubmit = (event: Event) => {
  event.preventDefault()
  emit('send')
}
</script>

<template>
  <UChatPrompt
    v-model="localValue"
    :disabled="disabled"
    placeholder="Napisz wiadomość..."
    class="w-full"
    @update:model-value="handleInput"
    @submit="handleSubmit"
  >
    <template #footer>
      <div class="flex items-center justify-between w-full gap-3">
        <span class="text-xs text-basic-500">
          Enter wysyla, Shift+Enter nowa linia
        </span>
        <UChatPromptSubmit :status="status || 'ready'" />
      </div>
    </template>
  </UChatPrompt>
</template>
