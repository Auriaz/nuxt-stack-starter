<script lang="ts" setup>
import { PERMISSIONS } from '#shared/permissions'
import { useBlogResource } from '~/composables/resources/useBlogResource'
import { useBlogDraft } from '~/composables/useBlogDraft'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Blog - Dashboard',
  description: 'Zarządzanie postami blogowymi'
})

const blogResource = useBlogResource()
const draftManager = useBlogDraft()
const { data: listResponse } = await useAsyncData('dashboard-blog-posts', () =>
  blogResource.listDashboard({ status: 'all' })
)
const posts = computed(() => listResponse.value?.items ?? [])

const draftCount = ref(0)
const hasDrafts = computed(() => draftCount.value > 0)
const continueDraftUrl = computed(() => '/dashboard/blog/create?mode=continue')

const { can } = useAccess()
const hasContentManage = computed(() => can(PERMISSIONS.CONTENT_MANAGE))

onMounted(() => {
  const drafts = draftManager.listDrafts()
  draftCount.value = drafts.length
})
</script>

<template>
  <NuxtLayout name="dashboard">
    <DashboardPanel
      title="Blog"
      icon="i-lucide-book-open"
    >
      <template #body>
        <UAlert
          v-if="hasContentManage"
          color="primary"
          variant="soft"
          title="Posty w bazie (Prisma)"
          description="Lista postów z bazy danych. Aby dodać wpis, użyj «Dodaj post». Aby edytować — «Edytuj»."
          icon="i-lucide-database"
          class="mb-6"
        />

        <UAlert
          v-if="!posts?.length"
          color="neutral"
          variant="soft"
          title="Brak postów"
          description="Dodaj pierwszy wpis przyciskiem «Dodaj post»."
          icon="i-lucide-book-open"
        />

        <div
          v-else
          class="overflow-x-auto rounded-lg border border-default"
        >
          <table class="w-full min-w-120 text-left text-sm">
            <thead class="border-b border-default bg-default-50">
              <tr>
                <th
                  scope="col"
                  class="px-4 py-3 font-medium"
                >
                  Tytuł
                </th>
                <th
                  scope="col"
                  class="px-4 py-3 font-medium"
                >
                  Data
                </th>
                <th
                  scope="col"
                  class="px-4 py-3 font-medium"
                >
                  Status
                </th>
                <th
                  scope="col"
                  class="px-4 py-3 font-medium"
                >
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr
                v-for="post in posts"
                :key="post.id"
                class="hover:bg-default-50"
              >
                <td class="px-4 py-3">
                  <NuxtLink
                    :to="blogResource.postPath(post)"
                    class="font-medium text-primary hover:underline"
                  >
                    {{ post.title }}
                  </NuxtLink>
                </td>
                <td class="px-4 py-3 text-muted">
                  {{ post.publishedAt ? formatDateShort(post.publishedAt, 'pl-PL') : '—' }}
                </td>
                <td class="px-4 py-3">
                  <UBadge
                    :color="post.publishedAt ? 'success' : 'neutral'"
                    variant="soft"
                    size="xs"
                  >
                    {{ post.publishedAt ? 'Opublikowany' : 'Szkic' }}
                  </UBadge>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <NuxtLink
                      :to="blogResource.postPath(post)"
                      target="_blank"
                      class="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-default-100"
                    >
                      <UIcon
                        name="i-lucide-external-link"
                        class="size-4"
                      />
                      Zobacz
                    </NuxtLink>
                    <NuxtLink
                      v-if="hasContentManage"
                      :to="`/dashboard/blog/${post.id}`"
                      class="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary-50 dark:hover:bg-primary-950/30"
                    >
                      <UIcon
                        name="i-lucide-pencil"
                        class="size-4"
                      />
                      Edytuj
                    </NuxtLink>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="hasContentManage"
          class="mt-6"
        >
          <div class="flex flex-wrap items-center gap-3">
            <ClientOnly>
              <UButton
                v-if="hasDrafts"
                :to="continueDraftUrl"
                icon="i-lucide-rotate-ccw"
                color="warning"
                variant="soft"
              >
                Kontynuuj post
              </UButton>
            </ClientOnly>
            <UButton
              to="/dashboard/blog/create"
              icon="i-lucide-plus"
              color="primary"
            >
              Dodaj post
            </UButton>
          </div>
        </div>
      </template>
    </DashboardPanel>
  </NuxtLayout>
</template>
