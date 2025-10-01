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
  <div class="activitiesLayout">
    <SidebarProvider>
      <navigationTop class="top"></navigationTop>
      <main class="main-content">
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
      </main>
    </SidebarProvider>
    <navigationBottom class="navigationBottom"></navigationBottom>
  </div>
</template>

<style scoped>
.top {
  z-index: 999;
  position: sticky;
  top: 0;
}
.activitiesLayout {
  width: 100vw;
  min-height: 100vh;
  background-color: #eff7ff;
}

.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s;
}

.slide-right-leave-from,
.slide-right-enter-from {
  transform: translateX(0);
}
.slide-right-leave-to,
.slide-right-enter-to {
  transform: translateX(-100%); /*组件向左移动*/
}

.slide-left-enter-from {
  transform: translateX(-200%);
}
.slide-left-enter-to {
  transform: translateX(-100%);
}
.slide-left-leave-from {
  transform: translateX(0);
}
.slide-left-leave-to {
  transform: translateX(100%);
}
.navigationBottom {
  margin: 4vh 0 0 0;
  position: sticky;
  bottom: 3vh;
  left: 5vw;
}
</style>
