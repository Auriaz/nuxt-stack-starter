<script lang="ts" setup>
import type { CalendarPrefs } from '~/composables/useCalendarPreferences'
import type { CalendarViewMode } from '~/composables/useCalendarView'

const props = defineProps<{
  preferences: CalendarPrefs
  teams: Array<{ id: number, name: string }>
  isLoading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:preferences', value: CalendarPrefs): void
}>()

const hourItems = Array.from({ length: 24 }, (_, index) => ({
  label: `${String(index).padStart(2, '0')}:00`,
  value: index
}))

const viewItems: Array<{ label: string, value: CalendarViewMode }> = [
  { label: 'Rok', value: 'year' },
  { label: 'Miesiac', value: 'month' },
  { label: 'Tydzien', value: 'week' },
  { label: 'Dzien', value: 'day' },
  { label: 'Harmonogram', value: 'schedule' },
  { label: '4 dni', value: 'four-day' }
]

const scopeItems = [
  { label: 'Prywatne', value: 'personal' },
  { label: 'Zespol', value: 'team' },
  { label: 'Wszystko', value: 'all' }
]

function updatePrefs(patch: Partial<CalendarPrefs>) {
  emit('update:preferences', { ...props.preferences, ...patch })
}
</script>

<template>
  <div class="space-y-4">
    <UCard variant="soft">
      <template #header>
        <h3 class="text-sm font-semibold">
          Szybkie ustawienia
        </h3>
        <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Zmiany zapisuja sie automatycznie.
        </p>
      </template>

      <div class="space-y-4">
        <UFormField label="Domyslny widok">
          <USelect
            :model-value="preferences.defaultView"
            :items="viewItems"
            size="sm"
            color="neutral"
            @update:model-value="updatePrefs({ defaultView: $event })"
          />
        </UFormField>

        <UFormField label="Zakres">
          <USelect
            :model-value="preferences.scope"
            :items="scopeItems"
            size="sm"
            color="neutral"
            @update:model-value="updatePrefs({ scope: $event })"
          />
        </UFormField>

        <UFormField
          v-if="preferences.scope === 'team'"
          label="Zespol"
        >
          <USelect
            :model-value="preferences.teamId"
            :items="teams.map(team => ({ label: team.name, value: team.id }))"
            size="sm"
            color="neutral"
            placeholder="Wybierz zespol"
            @update:model-value="updatePrefs({ teamId: $event ?? undefined })"
          />
        </UFormField>

        <UFormField label="Strefa czasowa">
          <UInput
            :model-value="preferences.timezone"
            placeholder="Europe/Warsaw"
            size="sm"
            @update:model-value="updatePrefs({ timezone: $event })"
          />
        </UFormField>
      </div>
    </UCard>

    <UCard variant="soft">
      <template #header>
        <h3 class="text-sm font-semibold">
          Widocznosc
        </h3>
      </template>

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium">
              Pokazuj weekendy
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Ukryj soboty i niedziele.
            </p>
          </div>
          <UToggle
            :model-value="preferences.showWeekends"
            @update:model-value="updatePrefs({ showWeekends: $event })"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium">
              Pokazuj anulowane
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Widocznosc wydarzen z anulowanym statusem.
            </p>
          </div>
          <UToggle
            :model-value="preferences.showCancelled"
            @update:model-value="updatePrefs({ showCancelled: $event })"
          />
        </div>
      </div>
    </UCard>

    <UCard variant="soft">
      <template #header>
        <h3 class="text-sm font-semibold">
          Godziny pracy
        </h3>
      </template>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium">
              Tylko godziny pracy
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Skroc widok do zadanych godzin.
            </p>
          </div>
          <UToggle
            :model-value="preferences.showWorkHoursOnly"
            @update:model-value="updatePrefs({ showWorkHoursOnly: $event })"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Start">
            <USelect
              :model-value="preferences.workdayStartHour"
              :items="hourItems"
              size="sm"
              color="neutral"
              @update:model-value="updatePrefs({ workdayStartHour: $event })"
            />
          </UFormField>
          <UFormField label="Koniec">
            <USelect
              :model-value="preferences.workdayEndHour"
              :items="hourItems"
              size="sm"
              color="neutral"
              @update:model-value="updatePrefs({ workdayEndHour: $event })"
            />
          </UFormField>
        </div>
      </div>
    </UCard>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      title="Blad"
      :description="error"
    />

    <UCard
      v-if="isLoading"
      variant="soft"
      class="space-y-2"
    >
      <USkeleton class="h-4 w-32" />
      <USkeleton class="h-10 w-full" />
      <USkeleton class="h-10 w-full" />
    </UCard>
  </div>
</template>
