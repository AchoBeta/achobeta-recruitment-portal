<script lang="ts" setup>
import { ref, onMounted } from "vue";
import navigationBottom from "@/components/navigationBottom.vue";
import navigationTop from "@/components/navigationTop.vue";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import scroollTo from "@/utils/scroollTo";
import { useRouter } from "vue-router";

const transitionName = ref();
const router = useRouter();

router.beforeEach((to, from) => {
  console.log("组件下注册的全局守卫");

  if ((to.meta.index as number) > (from.meta.index as number)) {
    transitionName.value = "slide-right";
  } else if ((to.meta.index as number) < (from.meta.index as number)) {
    transitionName.value = "slide-left";
  } else {
    transitionName.value = "";
  }
});

onMounted(() => {
  scroollTo();
});
</script>

<template>
  <!-- Mobile Menu Trigger -->
  <div class="md:hidden p-4">
    <SidebarTrigger class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </SidebarTrigger>
  </div>

  <div class="animation">
    <router-view v-slot="{ Component }">
      <transition :name="transitionName">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>