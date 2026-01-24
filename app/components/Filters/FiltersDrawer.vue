<script setup lang="ts">
// Ref do komponentu Modal
interface ModalInstance {
  open: () => void
  close: () => void
}

const emit = defineEmits<{
  reset: []
  apply: []
}>()

// useFilters jest auto-importowany przez Nuxt
const filters = useFilters()

const modalRef = ref<ModalInstance | null>(null)

// SSR safety - render tylko po mounted
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

// Synchronizacja stanu z useFilters
watch(() => filters.isOpen.value, (isOpen) => {
  if (!modalRef.value) return
  if (isOpen) {
    modalRef.value.open()
  } else {
    modalRef.value.close()
  }
})

// Obsługa zamknięcia z Modal
const handleModalClose = () => {
  filters.close()
}

const handleReset = () => {
  emit('reset')
}

// const handleApply = () => {
//   emit('apply')
//   filters.close()
// }
</script>

<template>
  <Modal
    ref="modalRef"
    title="Filtry"
    dismissible
    :ui-sheet-variants="{ body: 'w-full sm:w-96' }"
    layout="overlay"
    @close="handleModalClose"
    @open="() => filters.open()"
  >
    <template #body>
      <!-- Slot na zawartość filtrów -->
      <div
        class="flex flex-col sm:flex-row lg:flex-row xl:flex-row items-center justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 w-full"
      >
        <slot />
      </div>
    </template>

    <template #footer>
      <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full max-w-full overflow-hidden">
        <UButton
          variant="outline"
          icon="i-lucide-rotate-ccw"
          color="error"
          size="sm"
          class="flex-1 sm:flex-none items-center justify-center min-w-0 sm:min-w-[120px] md:min-w-[140px] max-w-full"
          @click="handleReset"
        >
          <span class="hidden sm:inline truncate">Resetuj</span>
          <span class="sm:hidden truncate">Reset</span>
        </UButton>
      </div>
    </template>
  </Modal>
</template>
