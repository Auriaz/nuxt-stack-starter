<script lang="ts" setup>
import { CreateEventCategoryInputSchema } from '#shared/schemas/event-category'
import type { CreateEventCategoryInput, EventCategoryDTO, EventCategoryScope, UpdateEventCategoryInput } from '#shared/types/event-category'
import { PERMISSIONS } from '#shared/permissions'
import { useEventCategoriesResource } from '~/composables/resources/useEventCategoriesResource'
import { useTeamsResource } from '~/composables/resources/useTeamsResource'
import ModalConfirmation from '~/components/Modal/Confirmation/ModalConfirmation.vue'
import EventCategoryModalForm from '~/components/EventCategory/ModalForm.vue'
import EventCategoryBadge from '~/components/EventCategory/Badge.vue'
import { useForm } from '~/composables/useForm'

type CategoryScope = EventCategoryScope | 'all'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'category-manage']
})

useSeoMeta({
  title: 'Kategorie i kolory - Dashboard',
  description: 'Zarzadzanie systemem kolorystyki i kategoryzacji'
})

const { can, hasRole } = useAccess()
const toast = useToast()
const categoriesResource = useEventCategoriesResource()
const teamsResource = useTeamsResource()

const scope = ref<CategoryScope>('all')
const teamId = ref<number | undefined>(undefined)
const search = ref('')
const categories = ref<EventCategoryDTO[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const teams = ref<Array<{ id: number, name: string }>>([])
const teamsLoading = ref(false)

const canSystemManage = computed(() =>
  can(PERMISSIONS.CATEGORY_SYSTEM_MANAGE)
  || can(PERMISSIONS.ADMIN_ACCESS)
  || hasRole('admin')
)
const canCreatePersonal = computed(() => can(PERMISSIONS.CATEGORY_CREATE))
const canCreateTeam = computed(() => can(PERMISSIONS.CATEGORY_TEAM_MANAGE))

const scopeItems = [
  { label: 'Wszystko', value: 'all' },
  { label: 'System', value: 'system' },
  { label: 'Prywatne', value: 'personal' },
  { label: 'Zespol', value: 'team' }
]

const typeOptions = computed(() => {
  const options: Array<{ label: string, value: 'system' | 'personal' | 'team' }> = []
  if (canSystemManage.value) options.push({ label: 'System', value: 'system' })
  if (canCreatePersonal.value) options.push({ label: 'Prywatne', value: 'personal' })
  if (canCreateTeam.value) options.push({ label: 'Zespol', value: 'team' })
  return options
})

const teamItems = computed(() =>
  teams.value.map(team => ({ label: team.name, value: team.id }))
)

const filteredCategories = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return categories.value
  return categories.value.filter(cat =>
    cat.label.toLowerCase().includes(q) || cat.slug.toLowerCase().includes(q)
  )
})

const editingCategory = ref<EventCategoryDTO | null>(null)
const isEdit = computed(() => editingCategory.value != null)
const autoSlug = ref(true)

const form = useForm(CreateEventCategoryInputSchema, {
  initialValues: {
    label: '',
    slug: '',
    description: undefined,
    color: '#3b82f6',
    icon: 'i-lucide-tag',
    isSystem: true,
    teamId: undefined,
    isDefault: false,
    sortOrder: 0
  }
})

const categoryType = computed({
  get: () => {
    if (form.values.value.isSystem) return 'system'
    if (form.values.value.teamId != null) return 'team'
    return 'personal'
  },
  set: (value: 'system' | 'personal' | 'team') => {
    if (value === 'system') {
      form.setValues({ isSystem: true, teamId: undefined })
      return
    }
    if (value === 'team') {
      form.setValues({ isSystem: false })
      return
    }
    form.setValues({ isSystem: false, teamId: undefined })
  }
})

const colorPresets = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#f97316',
  '#84cc16',
  '#6366f1'
]

const iconPresets = [
  'i-lucide-calendar',
  'i-lucide-users',
  'i-lucide-user',
  'i-lucide-alert-circle',
  'i-lucide-folder',
  'i-lucide-bell',
  'i-lucide-star',
  'i-lucide-clock',
  'i-lucide-tag',
  'i-lucide-check-circle'
]

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function onSlugChange(value: string) {
  autoSlug.value = false
  form.setField('slug', value)
}

watch(
  () => form.values.value.label,
  (value) => {
    if (!value || isEdit.value || !autoSlug.value) return
    form.setField('slug', normalizeSlug(value))
  }
)

watch(scope, (next) => {
  if (next !== 'team') {
    teamId.value = undefined
  }
  loadCategories()
})

watch(teamId, () => {
  if (scope.value === 'team') {
    loadCategories()
  }
})

async function loadTeams() {
  teamsLoading.value = true
  try {
    const data = await teamsResource.listTeams()
    teams.value = data?.teams ?? []
  } catch {
    teams.value = []
  } finally {
    teamsLoading.value = false
  }
}

async function loadCategories() {
  isLoading.value = true
  error.value = null
  try {
    const data = await categoriesResource.listCategories({
      scope: scope.value,
      teamId: scope.value === 'team' ? teamId.value : undefined
    })
    categories.value = Array.isArray(data) ? data : []
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Nie udalo sie pobrac kategorii'
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  autoSlug.value = true
  editingCategory.value = null
  form.reset()
  form.setValues({
    color: '#3b82f6',
    icon: 'i-lucide-tag',
    isSystem: canSystemManage.value,
    isDefault: false,
    sortOrder: 0
  })
}

function startEdit(category: EventCategoryDTO) {
  editingCategory.value = category
  autoSlug.value = false
  form.setValues({
    label: category.label,
    slug: category.slug,
    description: category.description ?? undefined,
    color: category.color,
    icon: category.icon,
    isSystem: category.isSystem,
    teamId: category.teamId ?? undefined,
    isDefault: category.isDefault,
    sortOrder: category.sortOrder
  })
}

function openCreateModal() {
  resetForm()
  modalRef.value?.open()
}

function openEditModal(category: EventCategoryDTO) {
  startEdit(category)
  modalRef.value?.open()
}

function handleModalClose() {
  resetForm()
}

async function submitForm() {
  if (categoryType.value === 'team' && !form.values.value.teamId) {
    form.errors.value = { ...form.errors.value, teamId: 'Wybierz zespol' }
    return
  }
  if (!form.validate()) return
  form.pending.value = true
  form.formError.value = null
  try {
    if (isEdit.value && editingCategory.value) {
      const payload = form.values.value as UpdateEventCategoryInput
      const updated = await categoriesResource.updateCategory(editingCategory.value.id, payload)
      categories.value = categories.value.map(cat => (cat.id === updated.id ? updated : cat))
      toast.add({ title: 'Zapisano', description: 'Kategoria zostala zaktualizowana.', color: 'success' })
    } else {
      const payload = form.values.value as CreateEventCategoryInput
      const created = await categoriesResource.createCategory(payload)
      categories.value = [created, ...categories.value]
      toast.add({ title: 'Utworzono', description: 'Kategoria zostala dodana.', color: 'success' })
    }
    modalRef.value?.close()
    resetForm()
  } catch (err: unknown) {
    form.setErrorsFromApi(err)
  } finally {
    form.pending.value = false
  }
}

const deleteConfirmRef = ref<InstanceType<typeof ModalConfirmation> | null>(null)
const modalRef = ref<InstanceType<typeof EventCategoryModalForm> | null>(null)

function requestDelete(categoryId: number) {
  deleteConfirmRef.value?.open(categoryId)
}

async function confirmDelete(categoryId?: number) {
  if (!categoryId) return
  try {
    await categoriesResource.deleteCategory(categoryId)
    categories.value = categories.value.filter(cat => cat.id !== categoryId)
    if (editingCategory.value?.id === categoryId) {
      resetForm()
    }
    toast.add({ title: 'Usunieto', description: 'Kategoria zostala usunieta.', color: 'success' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nie udalo sie usunac kategorii'
    toast.add({ title: 'Blad', description: message, color: 'error' })
  }
}

onMounted(() => {
  loadTeams()
  loadCategories()
})
</script>

<template>
  <NuxtLayout name="dashboard">
    <DashboardPanel
      title="Kategorie i kolory"
      icon="i-lucide-tags"
    >
      <template #body>
        <div class="space-y-6">
          <div class="flex flex-wrap items-center gap-3">
            <UInput
              v-model="search"
              placeholder="Szukaj po nazwie lub slugu"
              class="w-full max-w-sm"
            />
            <USelect
              v-model="scope"
              :items="scopeItems"
              class="w-full max-w-xs"
            />
            <USelect
              v-if="scope === 'team'"
              v-model="teamId"
              :items="teamItems"
              :loading="teamsLoading"
              placeholder="Wybierz zespol"
              class="w-full max-w-xs"
            />
            <UButton
              variant="soft"
              color="neutral"
              @click="loadCategories"
            >
              Odswiez
            </UButton>
          </div>

          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            title="Blad"
            :description="error"
          />

          <UCard variant="soft">
            <template #header>
              <div class="flex items-center justify-between gap-3">
                <h3 class="text-sm font-semibold">
                  Lista kategorii
                </h3>
                <UButton
                  color="primary"
                  variant="soft"
                  @click="openCreateModal"
                >
                  Nowa kategoria
                </UButton>
              </div>
            </template>

            <div
              v-if="isLoading"
              class="space-y-2"
            >
              <USkeleton class="h-8 w-full" />
              <USkeleton class="h-8 w-full" />
              <USkeleton class="h-8 w-full" />
            </div>

            <UAlert
              v-else-if="filteredCategories.length === 0"
              color="neutral"
              variant="soft"
              title="Brak kategorii"
              description="Dopasuj filtry lub dodaj nowa kategorie."
            />

            <div
              v-else
              class="overflow-x-auto rounded-lg border border-default"
            >
              <table class="w-full min-w-120 text-left text-sm">
                <thead class="border-b border-default bg-default-50">
                  <tr>
                    <th class="px-4 py-3 font-medium">
                      Kategoria
                    </th>
                    <th class="px-4 py-3 font-medium">
                      Scope
                    </th>
                    <th class="px-4 py-3 font-medium">
                      Kolor
                    </th>
                    <th class="px-4 py-3 font-medium">
                      Domyslna
                    </th>
                    <th class="px-4 py-3 font-medium">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-default">
                  <tr
                    v-for="category in filteredCategories"
                    :key="category.id"
                    class="hover:bg-default-50"
                  >
                    <td class="px-4 py-3">
                      <EventCategoryBadge
                        :category="category"
                        size="sm"
                      />
                      <div class="text-xs text-muted mt-1">
                        {{ category.slug }}
                      </div>
                    </td>
                    <td class="px-4 py-3 text-muted">
                      {{ category.scope }}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <span
                          class="inline-block h-4 w-4 rounded border"
                          :style="{ backgroundColor: category.color, borderColor: category.color }"
                        />
                        <span class="text-xs text-muted">{{ category.color }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <UBadge
                        :color="category.isDefault ? 'success' : 'neutral'"
                        variant="soft"
                        size="xs"
                      >
                        {{ category.isDefault ? 'Tak' : 'Nie' }}
                      </UBadge>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <UButton
                          v-if="category.canEdit"
                          size="xs"
                          variant="soft"
                          color="primary"
                          @click="openEditModal(category)"
                        >
                          Edytuj
                        </UButton>
                        <UButton
                          v-if="category.canDelete"
                          size="xs"
                          variant="soft"
                          color="error"
                          @click="requestDelete(category.id)"
                        >
                          Usun
                        </UButton>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </UCard>
        </div>
      </template>
    </DashboardPanel>

    <EventCategoryModalForm
      ref="modalRef"
      :is-edit="isEdit"
      :editing-label="editingCategory?.label"
      :form="form"
      :category-type="categoryType"
      :type-options="typeOptions"
      :team-items="teamItems"
      :teams-loading="teamsLoading"
      :color-presets="colorPresets"
      :icon-presets="iconPresets"
      @submit="submitForm"
      @close="handleModalClose"
      @slug-change="onSlugChange"
      @category-type-change="categoryType = $event"
    />

    <ModalConfirmation
      ref="deleteConfirmRef"
      title="Usunac kategorie?"
      description="Ta operacja jest nieodwracalna."
      confirm-label="Usun"
      cancel-label="Anuluj"
      variant="danger"
      @confirm="(arg: unknown) => confirmDelete(arg as number)"
    />
  </NuxtLayout>
</template>
