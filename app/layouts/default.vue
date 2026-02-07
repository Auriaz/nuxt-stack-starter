<script lang="ts" setup></script>

<template>
  <div class="m-0 p-0 font-mono ">
    <Header>
      <Navbar />
    </Header>

    <UMain class="md:pt-8 relative isolate">
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 right-0 h-80 w-80 rounded-full bg-primary/20 blur-[140px]" />
        <div class="absolute left-0 top-32 h-96 w-96 rounded-full bg-sky-500/20 blur-[160px]" />
        <div class="absolute bottom-0 right-20 h-72 w-72 rounded-full bg-violet-500/20 blur-[140px]" />
      </div>
      <slot />
    </UMain>

    <ChatDrawer />

    <Footer />
  </div>
</template>
