<script setup lang="ts">
import navigationTop from "@/components/navigationTop.vue";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SidebarInset from "@/components/ui/sidebar/SidebarInset.vue";
</script>

<template>
  <div class="min-h-screen">
    <SidebarProvider>
      <!-- Sidebar Navigation -->
      <navigationTop />
      <SidebarInset>
        <div class="sticky bg-background top-0 z-10">
          <SidebarTrigger class="h-12 w-12" />
        </div>
        <router-view />
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>