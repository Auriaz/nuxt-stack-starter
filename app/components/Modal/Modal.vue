<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

const breakpoints = useBreakpoints(breakpointsTailwind)

export interface ModalProps {
  getArgs: () => unknown | undefined
  open: (arg?: unknown | undefined) => void
  close: () => void
  layout?: 'default' | 'drawer' | 'overlay'
}

const currentArg = ref<unknown | undefined>()
const isOpen = ref(false)
const isMobile = computed(() => breakpoints.smaller('md').value)
const isTablet = computed(() => breakpoints.between('md', 'lg').value)
const isDesktop = computed(() => breakpoints.greaterOrEqual('lg').value)

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
    layout?: 'default' | 'drawer' | 'overlay'
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
    v-else-if="!isMobile && layout === 'default'"
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

  <Transition
    enter-active-class="transition-all duration-300 delay-100 ease-out"
    enter-from-class="-translate-y-16"
    enter-to-class="-translate-y-0"
    leave-active-class="transition-all duration-200 delay-100 ease-in"
    leave-from-class="translate-y-0"
    leave-to-class="-translate-y-16"
  >
    <div
      v-if="!isMobile && isOpen && layout === 'overlay'"
      class="fixed left-0 top-16 w-screen flex items-start justify-center bg-elevated/50 backdrop-blur-md p-2 sm:p-4 md:p-6 rounded-lg gap-2 sm:gap-4 md:gap-6 border border-primary-500/20"
    >
      <div
        :class="[
          'flex w-full max-w-7xl',
          isTablet ? 'flex-col gap-4' : 'flex-row items-start justify-between gap-4 lg:gap-6 xl:gap-8'
        ]"
      >
        <div
          :class="[
            'flex flex-col gap-2 sm:gap-4',
            isTablet ? 'w-full items-center' : 'items-start justify-start',
            isDesktop ? 'flex-1' : 'w-full'
          ]"
        >
          <slot
            name="body"
            :arg="currentArg"
          />
        </div>

        <div
          :class="[
            'flex flex-col gap-2 sm:gap-3',
            isTablet ? 'w-full items-center max-w-full' : 'items-end justify-end shrink-0',
            isDesktop ? 'w-auto' : 'w-full max-w-full'
          ]"
        >
          <slot
            name="footer"
            :arg="currentArg"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>
