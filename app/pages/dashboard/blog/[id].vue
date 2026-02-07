<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import { BlogPostUpdateSchema } from '#shared/schemas/blog'
import type { InferOutput } from 'valibot'
import type { BlogAnchorDTO } from '#shared/types/blog'
import { useBlogResource } from '~/composables/resources/useBlogResource'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const blogResource = useBlogResource()

function parseId(value: unknown): number | null {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

const id = computed(() => parseId(route.params.id))

const { data: post, refresh: refreshPost } = await useAsyncData(
  () => `dashboard-blog-post-${id.value}`,
  () => (id.value ? blogResource.getById(id.value) : Promise.resolve(null)),
  { watch: [id] }
)

useSeoMeta({
  title: () => post.value ? `${post.value.title} - Edycja - Blog` : 'Edycja postu - Blog - Dashboard',
  description: 'Edycja posta blogowego'
})

const form = useForm(BlogPostUpdateSchema, {
  initialValues: {}
})

watch(
  () => post.value,
  (p) => {
    if (p) {
      form.setValues({
        slug: p.slug,
        title: p.title,
        description: p.description ?? '',
        bodyMd: p.bodyMd,
        imageUrl: p.imageUrl ?? '',
        publishedAt: p.publishedAt ?? undefined,
        tags: p.tags ?? [],
        anchors: (p.anchors ?? []).map((a: BlogAnchorDTO) => ({
          label: a.label,
          to: a.to,
          order: a.order,
          icon: a.icon,
          target: a.target
        })),
        seoTitle: p.seoTitle ?? '',
        seoDesc: p.seoDesc ?? ''
      })
    }
  },
  { immediate: true }
)

async function onSubmit(values: InferOutput<typeof BlogPostUpdateSchema>) {
  if (!id.value) return
  const payload: Parameters<typeof blogResource.update>[1] = {
    slug: values.slug,
    title: values.title,
    description: values.description,
    bodyMd: values.bodyMd,
    imageUrl: values.imageUrl,
    publishedAt: values.publishedAt as string | null | undefined,
    tags: values.tags,
    anchors: values.anchors?.map((a, i) => ({
      label: a.label?.trim() || '',
      to: a.to?.trim() || '#',
      order: a.order ?? i,
      icon: a.icon?.trim() || undefined,
      target: a.target?.trim() || undefined
    })),
    seoTitle: values.seoTitle,
    seoDesc: values.seoDesc
  }
  const updated = await blogResource.update(id.value, payload)
  if (updated) {
    await refreshPost()
  } else {
    form.setErrorsFromApi({
      data: { error: { message: 'Nie udało się zapisać zmian.' } }
    })
  }
}

function handleSubmit(event: FormSubmitEvent<InferOutput<typeof BlogPostUpdateSchema>>) {
  form.handleSubmit(onSubmit)(event)
}

const toast = useToast()
async function removePost() {
  if (!id.value) return
  const ok = await blogResource.remove(id.value)
  if (ok) {
    toast.add({ title: 'Post usunięty', color: 'success' })
    await navigateTo('/dashboard/blog')
  } else {
    toast.add({ title: 'Nie udało się usunąć posta', color: 'error' })
  }
}
</script>

<template>
  <NuxtLayout name="dashboard">
    <DashboardPanel
      :title="post ? post.title : 'Edycja postu'"
      icon="i-lucide-pencil"
    >
      <template #body>
        <div
          v-if="!id"
          class="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20"
        >
          <p class="text-error-600 dark:text-error-400">
            Nieprawidłowy identyfikator postu.
          </p>
          <UButton
            to="/dashboard/blog"
            variant="soft"
            color="neutral"
            class="mt-3"
          >
            Wróć do listy
          </UButton>
        </div>

        <template v-else-if="post">
          <div class="mb-4 flex flex-wrap items-center gap-2">
            <UButton
              :to="blogResource.postPath(post)"
              target="_blank"
              variant="soft"
              color="neutral"
              size="sm"
              icon="i-lucide-external-link"
            >
              Zobacz na stronie
            </UButton>
          </div>

          <UForm
            :schema="BlogPostUpdateSchema"
            :state="form.values.value"
            class="w-full max-w-2xl space-y-4"
            @submit="handleSubmit"
          >
            <UFormField
              label="Slug (URL)"
              name="slug"
              :error="form.errors.value?.slug"
            >
              <UInput
                :model-value="form.values.value?.slug ?? ''"
                placeholder="moj-post"
                :disabled="form.pending.value"
                @update:model-value="form.setField('slug', $event)"
              />
            </UFormField>

            <UFormField
              label="Tytuł"
              name="title"
              :error="form.errors.value?.title"
            >
              <UInput
                :model-value="form.values.value?.title ?? ''"
                placeholder="Tytuł wpisu"
                :disabled="form.pending.value"
                @update:model-value="form.setField('title', $event)"
              />
            </UFormField>

            <UFormField
              label="Opis (krótki)"
              name="description"
              :error="form.errors.value?.description"
            >
              <UTextarea
                :model-value="form.values.value?.description ?? ''"
                placeholder="Krótki opis"
                :disabled="form.pending.value"
                :rows="2"
                @update:model-value="form.setField('description', $event)"
              />
            </UFormField>

            <UFormField
              label="Treść (Markdown)"
              name="bodyMd"
              :error="form.errors.value?.bodyMd"
            >
              <UTextarea
                :model-value="form.values.value?.bodyMd ?? ''"
                placeholder="Treść wpisu w Markdown..."
                :disabled="form.pending.value"
                :rows="12"
                class="font-mono text-sm"
                @update:model-value="form.setField('bodyMd', $event)"
              />
            </UFormField>

            <UFormField
              label="URL obrazka"
              name="imageUrl"
              :error="form.errors.value?.imageUrl"
            >
              <UInput
                :model-value="form.values.value?.imageUrl ?? ''"
                placeholder="/images/blog/obraz.jpg"
                :disabled="form.pending.value"
                @update:model-value="form.setField('imageUrl', $event)"
              />
            </UFormField>

            <UFormField
              label="Data publikacji (ISO, pusty = szkic)"
              name="publishedAt"
              :error="form.errors.value?.publishedAt"
            >
              <UInput
                :model-value="(form.values.value?.publishedAt as string | undefined) ?? ''"
                type="datetime-local"
                :disabled="form.pending.value"
                @update:model-value="form.setField('publishedAt', $event || undefined)"
              />
            </UFormField>

            <UFormField
              label="Tagi (oddzielone przecinkami)"
              name="tags"
            >
              <UInput
                :model-value="(form.values.value?.tags ?? []).join(', ')"
                placeholder="Nuxt, Vue"
                :disabled="form.pending.value"
                @update:model-value="form.setField('tags', ($event || '').split(',').map(t => t.trim()).filter(Boolean))"
              />
            </UFormField>

            <UFormField
              label="SEO: tytuł"
              name="seoTitle"
            >
              <UInput
                :model-value="form.values.value?.seoTitle ?? ''"
                :disabled="form.pending.value"
                @update:model-value="form.setField('seoTitle', $event)"
              />
            </UFormField>

            <UFormField
              label="SEO: opis"
              name="seoDesc"
            >
              <UTextarea
                :model-value="form.values.value?.seoDesc ?? ''"
                :disabled="form.pending.value"
                :rows="2"
                @update:model-value="form.setField('seoDesc', $event)"
              />
            </UFormField>

            <div
              v-if="form.formError.value"
              class="rounded-lg border border-error-200 bg-error-50 p-3 dark:border-error-800 dark:bg-error-900/20"
            >
              <p class="text-sm text-error-600 dark:text-error-400">
                {{ form.formError.value }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3 border-t border-default pt-4">
              <UButton
                to="/dashboard/blog"
                variant="outline"
                color="neutral"
                :disabled="form.pending.value"
              >
                Anuluj
              </UButton>
              <UButton
                type="submit"
                color="primary"
                :loading="form.pending.value"
              >
                Zapisz
              </UButton>
              <UButton
                variant="outline"
                color="error"
                :disabled="form.pending.value"
                @click="removePost"
              >
                Usuń post
              </UButton>
            </div>
          </UForm>
        </template>

        <div
          v-else
          class="rounded-lg border border-default bg-default-50 p-4"
        >
          <p class="text-muted">
            Ładowanie...
          </p>
        </div>
      </template>
    </DashboardPanel>
  </NuxtLayout>
</template>
