<script setup lang="ts">
import appMeta from '~/app.meta'

interface Props {
  src?: string
  name?: string
  description?: string
  to?: string
  target?: string
}

const props = withDefaults(defineProps<Props>(), {
  src: appMeta.author.image.url,
  name: appMeta.author.name,
  description: appMeta.author.description,
  to: appMeta.author.to,
  target: appMeta.author.target
})

const avatarSrc = useAvatarSrc(() => props.src)
</script>

<template>
  <UCard
    id="author-about"
    variant="soft"
    class="mt-16"
  >
    <div class="flex flex-col sm:flex-row gap-6">
      <!-- Avatar -->
      <div class="shrink-0">
        <UAvatar
          :src="avatarSrc"
          :alt="props.name"
          size="xl"
          class="w-20 h-20"
        />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex flex-col gap-3">
          <div>
            <h3 class="text-lg font-bold mb-1">
              O autorze
            </h3>
            <div class="flex items-center gap-2 mb-2">
              <NuxtLink
                v-if="props.to"
                :to="props.to"
                :target="props.target"
                class="text-xl font-semibold hover:text-primary transition-colors"
              >
                {{ props.name }}
              </NuxtLink>
              <span
                v-else
                class="text-xl font-semibold"
              >
                {{ props.name }}
              </span>
            </div>
            <p
              v-if="props.description"
              class="text-muted leading-relaxed"
            >
              {{ props.description }}
            </p>
          </div>

          <!-- Links -->
          <div
            v-if="props.to"
            class="flex items-center gap-2"
          >
            <UButton
              :to="props.to"
              :target="props.target"
              variant="outline"
              size="sm"
              icon="i-lucide-external-link"
            >
              Zobacz profil
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
