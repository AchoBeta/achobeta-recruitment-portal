<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/store/index";
import { useIdStore } from "@/store/idStore";
import { Activity } from "@/utils/type/activity.ts";
import { getActivitiesList } from "@/api/api";
import { toast } from "vue-sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import errPage from "@/components/errPage.vue";

type ActivityCard = {
  id: number;
  title: string;
  description: string;
  deadline: string;
};

const isLoading = ref<boolean>(true);
const hasError = ref<boolean>(false);
const storage = useAuthStore();
const idStore = useIdStore();
const router = useRouter();
const route = useRoute();
const batchId = ref<string>("");
const activities = ref<ActivityCard[]>([]);

const toApplication = (activityId: number) => {
  idStore.setActId(activityId.toString());
  router.push({ path: "/application" });
};

onMounted(async () => {
  const token: string = storage.token;

  // 从路由参数获取batchId
  const routeBatchId = route.params.batchId as string;

  if (!routeBatchId) {
    toast.warning("请提供有效的批次ID");
    hasError.value = true;
    isLoading.value = false;
    return;
  }

  batchId.value = routeBatchId;

  try {
    const res = await getActivitiesList(batchId.value, token);
    console.log(res);

    if (res.data.code === 200 && res.data.data.length > 0) {
      activities.value = res.data.data.map((item: Activity) => ({
        id: item.id as number,
        title: item.title || "未命名活动",
        description: item.description || "暂无描述",
        deadline: item.deadline || "暂无截止时间",
      }));
      hasError.value = false;
    } else {
      hasError.value = true;
    }
  } catch (err) {
    console.error("获取活动列表失败:", err);
    hasError.value = true;
    toast.error("获取活动列表失败，请稍后重试");
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-6">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span class="ml-3 text-muted-foreground">正在加载活动列表...</span>
    </div>

    <!-- 错误状态 -->
    <errPage v-else-if="hasError" class="mt-8" status="warning" title="活动" description="暂时没有活动或加载失败" />

    <!-- 活动列表 -->
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="activity in activities" :key="activity.id"
        class="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
        @click="toApplication(activity.id)">
        <CardHeader class="pb-4">
          <CardTitle class="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
            {{ activity.title }}
          </CardTitle>
          <CardDescription class="text-muted-foreground line-clamp-2">
            {{ activity.description }}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div class="flex items-center text-sm text-muted-foreground">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            截止时间: {{ activity.deadline }}
          </div>
        </CardContent>

        <CardFooter class="pt-4 border-t">
          <Button variant="outline" size="sm"
            class="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            查看详情
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </CardFooter>
      </Card>
    </div>

    <!-- 空状态 -->
    <div v-if="!isLoading && !hasError && activities.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">📋</div>
      <h3 class="text-lg font-semibold text-foreground mb-2">暂无活动</h3>
      <p class="text-muted-foreground">当前批次还没有可用的招新活动</p>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
