<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { useAuthStore } from "@/store/index";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

defineOptions({
  name: "navigationTop",
});

const router = useRouter();
const storage = useAuthStore();
const isLogin = computed(() => storage.isLoggedIn);

const toAnother = (path: number) => {
  switch (path) {
    case 1:
      router.push("/");
      break;
    case 2:
      toast.warning("暂未完成，敬请期待~");
      break;
    case 3:
      toast.warning("暂未完成，敬请期待~");
      break;
    // 登录/退出登录
    case 4:
      if (isLogin.value) {
        storage.clearToken();
        toast.success("已退出登录");
        router.push("/login");
      } else {
        router.push("/login");
      }
      break;
  }
};

// 导航数据
const navigationData = {
  navMain: [
    {
      title: "主要功能",
      items: [
        {
          title: "关于我们",
          action: () => toAnother(1),
          isActive: false,
        },
        {
          title: "我的面试",
          action: () => toAnother(2),
          isActive: false,
        },
        {
          title: "个人信息",
          action: () => toAnother(3),
          isActive: false,
        },
      ],
    },
    {
      title: "账户",
      items: [
        {
          title: isLogin.value ? "退出登录" : "登录",
          action: () => toAnother(4),
          isActive: false,
        },
      ],
    },
  ],
};
</script>

<template>
  <Sidebar>
    <SidebarHeader class="border-b border-gray-100 p-6">
      <div class="flex items-center gap-3">
        <img src="/src/assets/achoBeta.png" class="h-10 w-10" alt="AchoBeta Logo" />
        <div>
          <h2 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AchoBeta
          </h2>
          <p class="text-sm text-gray-500">招新</p>
        </div>
      </div>
      <div class="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <img src="/src/assets/avatar.jpg" class="h-8 w-8 rounded-full" alt="用户头像" />
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">
            {{ isLogin ? "已登录用户" : "未登录" }}
          </p>
          <p class="text-xs text-gray-500">
            {{ isLogin ? "欢迎回来" : "请先登录" }}
          </p>
        </div>
      </div>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup v-for="group in navigationData.navMain" :key="group.title">
        <SidebarGroupLabel class="text-gray-600 font-medium">
          {{ group.title }}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in group.items" :key="item.title">
              <SidebarMenuButton @click="item.action" :is-active="item.isActive"
                class="hover:bg-blue-50 hover:text-blue-700 transition-colors">
                <span>{{ item.title }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarRail />
  </Sidebar>
</template>
