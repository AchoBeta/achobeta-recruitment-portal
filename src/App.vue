<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import 'vue-sonner/style.css'; // vue-sonner v2 requires this import
</script>

<template>
  <RouterView />
  <Toaster />
</template>

<style scoped></style>
