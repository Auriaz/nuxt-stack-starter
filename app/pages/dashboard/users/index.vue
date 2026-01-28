<template>
  <div>
    <h1>Users</h1>
    <ul v-if="users?.length">
      <li
        v-for="user in users"
        :key="user.id"
      >
        {{ user.username }} ({{ user.email }})
      </li>
    </ul>
    <p v-else>
      No users yet.
    </p>
  </div>
</template>

<script setup lang="ts">
import { useUsersResource } from '~/composables/resources/useUsersResource'

const { getUsers } = useUsersResource()

// Użycie resource composable zamiast bezpośredniego useFetch
const { data: users } = await useAsyncData('users', async () => {
  return await getUsers()
})
</script>
