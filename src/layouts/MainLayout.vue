<script setup lang="ts">
import navigationTop from "@/components/navigationTop.vue";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <SidebarProvider>
      <!-- Sidebar Navigation -->
      <navigationTop />

      <!-- Main Content Area -->
      <main class="flex-1">
        <!-- Mobile Menu Trigger -->
        <div class="md:hidden p-4">
          <SidebarTrigger class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </SidebarTrigger>
        </div>

        <!-- Page Content -->
        <router-view />

      </main>
    </SidebarProvider>
  </div>
</template>