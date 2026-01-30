<script lang="ts" setup>
import Modal from '~/components/Modal/Modal.vue'

export type ConfirmationVariant = 'neutral' | 'primary' | 'danger'

const props = withDefaults(
  defineProps<{
    /** Tytuł modala (np. "Usuń zdjęcie") */
    title?: string
    /** Opis / pytanie (np. "Czy na pewno chcesz usunąć to zdjęcie?") */
    description?: string
    /** Etykieta przycisku potwierdzenia */
    confirmLabel?: string
    /** Etykieta przycisku anulowania */
    cancelLabel?: string
    /** Wariant przycisku potwierdzenia: danger dla usuwania, primary dla akcji głównej */
    variant?: ConfirmationVariant
  }>(),
  {
    title: 'Potwierdź',
    description: 'Czy na pewno chcesz kontynuować?',
    confirmLabel: 'Potwierdź',
    cancelLabel: 'Anuluj',
    variant: 'neutral'
  }
)

const emit = defineEmits<{
  (e: 'confirm', arg: unknown): void
  (e: 'cancel'): void
}>()

const modalRef = ref<InstanceType<typeof Modal> | null>(null)

const confirmButtonColor = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'error'
    case 'primary':
      return 'primary'
    default:
      return 'neutral'
  }
})

function open(arg?: unknown) {
  modalRef.value?.open(arg)
}

function close() {
  modalRef.value?.close()
}

function onConfirm() {
  const arg = modalRef.value?.getArgs?.()
  emit('confirm', arg)
  close()
}

function onCancel() {
  emit('cancel')
  close()
}

function onModalClose() {
  emit('cancel')
}

defineExpose({
  open,
  close
})
</script>

<template>
  <Modal
    ref="modalRef"
    :title="title"
    :description="description"
    layout="default"
    @close="onModalClose"
  >
    <template #footer>
      <UButton
        variant="outline"
        color="neutral"
        @click="onCancel"
      >
        {{ cancelLabel }}
      </UButton>
      <UButton
        :color="confirmButtonColor"
        @click="onConfirm"
      >
        {{ confirmLabel }}
      </UButton>
    </template>
  </Modal>
</template>
