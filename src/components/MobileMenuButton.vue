<script setup lang="ts">
defineOptions({
  name: "MobileMenuButton",
});

const emit = defineEmits<{
  'toggle': [];
}>();

const handleClick = () => {
  emit('toggle');
};
</script>

<template>
  <button 
    @click="handleClick"
    class="md:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
    aria-label="打开菜单"
  >
    <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
</template>