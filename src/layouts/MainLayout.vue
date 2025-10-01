<script setup lang="ts">
import navigationTop from "@/components/navigationTop.vue";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
</script>

<template>
  <div class="min-h-screen">
    <SidebarProvider>
      <!-- Sidebar Navigation -->
      <navigationTop />
      <main>
        <div class="sticky bg-background top-0 z-10">
          <SidebarTrigger class="h-12 w-12" />
        </div>
        <router-view />
      </main>
    </SidebarProvider>
  </div>
</template>