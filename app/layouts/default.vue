<script lang="ts" setup></script>

<template>
  <div class="m-0 p-0 font-mono">
    <Header>
      <Navbar />
    </Header>

    <UMain class="md:pt-20">
      <slot />
    </UMain>

    <Footer />
  </div>
</template>
