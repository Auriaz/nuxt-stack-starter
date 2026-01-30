<script lang="ts" setup>
interface Props {
  variant?: 'overview' | 'settings' | 'activity' | 'content' | 'privacy' | 'security' | 'account'
}

withDefaults(defineProps<Props>(), {
  variant: 'overview'
})
</script>

<template>
  <div class="space-y-6">
    <!-- Overview Skeleton -->
    <template v-if="variant === 'overview'">
      <div class="animate-pulse space-y-6">
        <!-- Profile Header -->
        <div class="flex flex-col items-center gap-6 md:flex-row">
          <div class="h-32 w-32 rounded-full bg-basic-200 dark:bg-basic-700" />
          <div class="flex-1 space-y-3">
            <div class="h-8 w-64 rounded bg-basic-200 dark:bg-basic-700" />
            <div class="h-4 w-48 rounded bg-basic-200 dark:bg-basic-700" />
            <div class="flex gap-2">
              <div class="h-6 w-20 rounded-full bg-basic-200 dark:bg-basic-700" />
              <div class="h-6 w-20 rounded-full bg-basic-200 dark:bg-basic-700" />
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div
            v-for="i in 3"
            :key="i"
            class="h-24 rounded-lg bg-basic-200 dark:bg-basic-700"
          />
        </div>

        <!-- Bio & Details -->
        <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div class="h-32 rounded-lg bg-basic-200 dark:bg-basic-700" />
          <div class="h-32 rounded-lg bg-basic-200 dark:bg-basic-700" />
        </div>
      </div>
    </template>

    <!-- Settings Skeleton -->
    <template v-else-if="variant === 'settings'">
      <div class="animate-pulse space-y-6">
        <div
          v-for="i in 3"
          :key="i"
          class="space-y-4 rounded-lg border border-basic-200 p-6 dark:border-basic-700"
        >
          <div class="h-6 w-48 rounded bg-basic-200 dark:bg-basic-700" />
          <div class="h-32 rounded bg-basic-200 dark:bg-basic-700" />
        </div>
      </div>
    </template>

    <!-- Activity Skeleton -->
    <template v-else-if="variant === 'activity'">
      <div class="animate-pulse space-y-4">
        <div class="h-8 w-48 rounded bg-basic-200 dark:bg-basic-700" />
        <div
          v-for="i in 5"
          :key="i"
          class="h-20 rounded-lg bg-basic-200 dark:bg-basic-700"
        />
      </div>
    </template>

    <!-- Content Skeleton -->
    <template v-else-if="variant === 'content'">
      <div class="animate-pulse space-y-6">
        <div class="h-8 w-48 rounded bg-basic-200 dark:bg-basic-700" />
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div
            v-for="i in 4"
            :key="i"
            class="h-24 rounded-lg bg-basic-200 dark:bg-basic-700"
          />
        </div>
        <div class="space-y-3">
          <div
            v-for="i in 3"
            :key="i"
            class="h-16 rounded-lg bg-basic-200 dark:bg-basic-700"
          />
        </div>
      </div>
    </template>

    <!-- Privacy Skeleton -->
    <template v-else-if="variant === 'privacy'">
      <div class="animate-pulse space-y-6">
        <div class="h-8 w-48 rounded bg-basic-200 dark:bg-basic-700" />
        <div class="space-y-4">
          <div
            v-for="i in 4"
            :key="i"
            class="h-16 rounded-lg bg-basic-200 dark:bg-basic-700"
          />
        </div>
      </div>
    </template>

    <!-- Security Skeleton -->
    <template v-else-if="variant === 'security'">
      <div class="animate-pulse space-y-6">
        <div class="h-8 w-48 rounded bg-basic-200 dark:bg-basic-700" />
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div
            v-for="i in 3"
            :key="i"
            class="h-32 rounded-lg bg-basic-200 dark:bg-basic-700"
          />
        </div>
      </div>
    </template>

    <!-- Account Skeleton -->
    <template v-else-if="variant === 'account'">
      <div class="animate-pulse space-y-6">
        <div
          v-for="i in 3"
          :key="i"
          class="h-32 rounded-lg bg-basic-200 dark:bg-basic-700"
        />
      </div>
    </template>

    <!-- Default Skeleton -->
    <template v-else>
      <div class="animate-pulse space-y-4">
        <div class="h-8 w-48 rounded bg-basic-200 dark:bg-basic-700" />
        <div class="h-64 rounded-lg bg-basic-200 dark:bg-basic-700" />
      </div>
    </template>
  </div>
</template>
