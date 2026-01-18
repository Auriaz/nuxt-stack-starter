<script setup lang="ts">
import type { PortfolioProjectEntry } from '#shared/types/content'

interface Props {
  project: PortfolioProjectEntry
}

const props = defineProps<Props>()

// Computed dla linków
const liveLink = computed(() => {
  return props.project.links?.find(link => link.type === 'live')
})

const githubLink = computed(() => {
  return props.project.links?.find(link => link.type === 'github')
})

const otherLinks = computed(() => {
  return props.project.links?.filter(link =>
    link.type !== 'live' && link.type !== 'github'
  ) || []
})
</script>

<template>
  <section class="relative py-20 bg-muted/50">
    <UContainer>
      <div class="max-w-4xl mx-auto">
        <!-- Breadcrumbs -->
        <UBreadcrumb
          :items="[
            { label: 'Portfolio', to: '/portfolio' },
            { label: project.title, to: project._path }
          ]"
          class="mb-6"
        />

        <!-- Cover Image -->
        <div
          v-if="project.coverImage"
          class="mb-8 rounded-lg overflow-hidden"
        >
          <NuxtImg
            :src="project.coverImage.src"
            :alt="project.coverImage.alt || project.title"
            class="w-full h-auto"
            loading="eager"
          />
        </div>

        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">
            {{ project.title }}
          </h1>
          <p
            v-if="project.description"
            class="text-xl text-muted mb-6"
          >
            {{ project.description }}
          </p>
          <p
            v-if="project.excerpt"
            class="text-lg text-muted max-w-2xl mx-auto"
          >
            {{ project.excerpt }}
          </p>
        </div>

        <!-- Meta Info -->
        <div class="flex flex-wrap items-center justify-center gap-6 mb-8">
          <div
            v-if="project.year"
            class="flex items-center gap-2"
          >
            <UIcon
              name="i-lucide-calendar"
              class="w-5 h-5 text-muted"
            />
            <span class="text-muted">{{ project.year }}</span>
          </div>
          <div
            v-if="project.role"
            class="flex items-center gap-2"
          >
            <UIcon
              name="i-lucide-user"
              class="w-5 h-5 text-muted"
            />
            <span class="text-muted">{{ project.role }}</span>
          </div>
          <div
            v-if="project.client"
            class="flex items-center gap-2"
          >
            <UIcon
              name="i-lucide-building"
              class="w-5 h-5 text-muted"
            />
            <span class="text-muted">{{ project.client }}</span>
          </div>
        </div>

        <!-- Technologies -->
        <div
          v-if="project.technologies && project.technologies.length > 0"
          class="flex flex-wrap justify-center gap-2 mb-8"
        >
          <UBadge
            v-for="tech in project.technologies"
            :key="tech"
            variant="soft"
            color="primary"
            size="lg"
          >
            {{ tech }}
          </UBadge>
        </div>

        <!-- Links -->
        <div
          v-if="project.links && project.links.length > 0"
          class="flex flex-wrap justify-center gap-4"
        >
          <UButton
            v-if="liveLink"
            :to="liveLink.url"
            :target="liveLink.target || '_blank'"
            color="primary"
            variant="solid"
            size="lg"
            icon="i-lucide-external-link"
          >
            {{ liveLink.label }}
          </UButton>
          <UButton
            v-if="githubLink"
            :to="githubLink.url"
            :target="githubLink.target || '_blank'"
            variant="outline"
            size="lg"
            icon="i-simple-icons-github"
          >
            {{ githubLink.label }}
          </UButton>
          <UButton
            v-for="link in otherLinks"
            :key="link.url"
            :to="link.url"
            :target="link.target || '_blank'"
            variant="ghost"
            size="lg"
          >
            {{ link.label }}
          </UButton>
        </div>
      </div>
    </UContainer>
  </section>
</template>
