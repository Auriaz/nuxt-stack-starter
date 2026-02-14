<script lang="ts" setup>
const props = defineProps<{
  open: boolean
  teams: Array<{ id: number, name: string }>
  onMove: (teamId: number | null, visibility: 'private' | 'team') => Promise<void> | void
}>()

const emit = defineEmits<{ 'update:open': [boolean] }>()

const modalOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})
</script>

<template>
  <UModal
    v-model:open="modalOpen"
    title="Przenieś wydarzenie"
  >
    <template #body>
      <UCard>
        <div class="space-y-4">
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            Wybierz docelowy zespół lub przenieś do wydarzeń prywatnych.
          </p>

          <div class="space-y-2">
            <UButton
              variant="outline"
              color="neutral"
              block
              @click="onMove(null, 'private')"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-user" />
                <span>Prywatne</span>
              </div>
            </UButton>

            <UButton
              v-for="team in teams"
              :key="team.id"
              variant="outline"
              color="neutral"
              block
              @click="onMove(team.id, 'team')"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-users" />
                <span>{{ team.name }}</span>
              </div>
            </UButton>
          </div>
        </div>
      </UCard>
    </template>

    <template #footer>
      <div class="w-full flex justify-end">
        <UButton
          variant="ghost"
          color="neutral"
          @click="modalOpen = false"
        >
          Anuluj
        </UButton>
      </div>
    </template>
  </UModal>
</template>
