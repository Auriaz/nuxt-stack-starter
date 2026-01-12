<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

const breakpoints = useBreakpoints(breakpointsTailwind)

export interface ModalProps {
  getArgs: () => unknown | undefined
  open: (arg?: unknown | undefined) => void
  close: () => void
}

const currentArg = ref<unknown | undefined>()
const isOpen = ref(false)
const isMobile = computed(() => breakpoints.smaller('md').value)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open', arg: unknown): unknown
}>()

const props = withDefaults(
  defineProps<{
    id?: string
    title?: string | ((arg: unknown | undefined) => string | undefined)
    uiSheetVariants?: { [key: string]: unknown }
    uiBoxVariants?: { [key: string]: unknown }
    description?: string | ((arg: unknown | undefined) => string | undefined)
    dismissible?: boolean
  }>(),
  {
    dismissible: true
  }
)

const metaVariants = computed(() => ({
  description:
      typeof props.description === 'string'
        ? props.description
        : props.description?.(currentArg.value),
  title: typeof props.title === 'string' ? props.title : props.title?.(currentArg.value),
  dismissible: props.dismissible
}))

watch(isOpen, (val) => {
  if (!val) {
    emit('close')
  } else {
    emit('open', currentArg.value)
  }
})

function open(arg: unknown | undefined) {
  currentArg.value = arg
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

defineExpose<ModalProps>({
  getArgs: () => currentArg.value,
  open: open,
  close: close
})
</script>

<template>
  <UDrawer
    v-if="isMobile"
    v-model:open="isOpen"
    v-bind="metaVariants"
    :ui="{ body: 'w-full', footer: 'items-end', ...uiSheetVariants }"
  >
    <template
      v-if="$slots.title"
      #title
    >
      <slot
        name="title"
        :arg="currentArg"
      />
    </template>

    <template
      v-if="$slots.body"
      #body
    >
      <slot
        name="body"
        :arg="currentArg"
      />
    </template>

    <template
      v-if="$slots.footer"
      #footer
    >
      <slot
        name="footer"
        :arg="currentArg"
      />
    </template>
  </UDrawer>

  <UModal
    v-else
    v-model:open="isOpen"
    v-bind="metaVariants"
    :ui="{ footer: 'justify-end', ...uiBoxVariants }"
  >
    <template
      v-if="$slots.title"
      #title
    >
      <slot
        name="title"
        :arg="currentArg"
      />
    </template>

    <template
      v-if="$slots.body"
      #body
    >
      <slot
        name="body"
        :arg="currentArg"
      />
    </template>

    <template
      v-if="$slots.footer"
      #footer
    >
      <div class="flex justify-end w-full gap-2">
        <slot
          name="footer"
          :arg="currentArg"
        />
      </div>
    </template>
  </UModal>
</template>
