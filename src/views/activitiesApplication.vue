<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useAuthStore } from "@/store/index";
import { useIdStore } from "@/store/idStore";
import { toast } from "vue-sonner";
import { getTemplate } from "@/api/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import scroollTo from "@/utils/scroollTo";
import { useRouter, useRoute } from "vue-router";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

// 简化的活动数据结构
interface ActivityData {
  id: number | string | null;
  paperId: number | string | null;
  title: string | null;
  description: string | null;
  isRun: boolean | null;
  deadline: string | null;
  createTime: string | null;
  target: string | null;
}

// 新增：问题与时间段数据结构
interface QuestionVO {
  id: number | string;
  title: string | null;
  standard: string | null;
  createTime: string | null;
  updateTime: string | null;
}

interface TimePeriodVO {
  id: number | string;
  startTime: string | null;
  endTime: string | null;
}

const storage = useAuthStore();
const idStore = useIdStore();
const actId = ref<string>("");
const isLoading = ref<boolean>(true);
const hasError = ref<boolean>(false);
const errorMessage = ref<string>("");

// 使用简化的数据结构
const activity = ref<ActivityData>({
  id: null,
  paperId: null,
  title: null,
  description: null,
  isRun: null,
  deadline: null,
  createTime: null,
  target: null,
});

// 新增：完整数据的列表状态
const questions = ref<QuestionVO[]>([]);
const timePeriods = ref<TimePeriodVO[]>([]);

// 格式化日期显示
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "未知时间";
  try {
    // 兼容 Safari：不支持 "YYYY-MM-DD HH:mm:ss"，需要 "YYYY-MM-DDTHH:mm:ss"
    const normalized = dateString.replace(" ", "T");
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? dateString : d.toLocaleString('zh-CN');
  } catch {
    return dateString;
  }
};

// 获取活动数据
const fetchActivityData = async (): Promise<void> => {
  try {
    isLoading.value = true;
    hasError.value = false;

    const response = await getTemplate(actId.value, storage.token);

    if (response.data.code === 200) {
      const activityData = response.data.data.recruitmentActivityVO;
      const questionVOS = response.data.data.questionVOS || [];
      const timePeriodVOS = response.data.data.timePeriodVOS || [];

      // 清晰的数据赋值
      activity.value = {
        id: activityData.id,
        paperId: activityData.paperId,
        title: activityData.title,
        description: activityData.description,
        isRun: activityData.isRun,
        deadline: activityData.deadline,
        createTime: activityData.createTime,
        target: activityData.target ?? null,
      };

      // 新增：填充问题与时间段
      questions.value = questionVOS.map((q: any) => ({
        id: q.id,
        title: q.title,
        standard: q.standard,
        createTime: q.createTime,
        updateTime: q.updateTime,
      }));

      timePeriods.value = timePeriodVOS.map((t: any) => ({
        id: t.id,
        startTime: t.startTime,
        endTime: t.endTime,
      }));
    } else {
      throw new Error(`获取活动数据失败: ${response.data.message || '未知错误'}`);
    }
  } catch (error) {
    hasError.value = true;
    errorMessage.value = error instanceof Error ? error.message : '获取活动数据时发生未知错误';
    toast.error(errorMessage.value);
    console.error('获取活动数据失败:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  scroollTo();

  const routeActId = route.params.actId as string | undefined;
  if (routeActId) {
    actId.value = routeActId;
    idStore.setActId(routeActId);
    await fetchActivityData();
    return;
  }

  const storedActId = idStore.getActId();
  if (storedActId) {
    actId.value = storedActId;
    await fetchActivityData();
  } else {
    hasError.value = true;
    errorMessage.value = "请先选择你的招新活动!!";
    toast.warning(errorMessage.value);
    isLoading.value = false;
  }
});

const router = useRouter();
const route = useRoute();
const goToQuestionnaire = () => {
  const idVal = activity.value.id;
  if (idVal !== null && idVal !== undefined) {
    idStore.setActId(String(idVal));
    // 使用显式路径跳转，避免命名路由解析失败
    router.push({ path: `/activities/${String(idVal)}/questionnaire` });
  } else {
    // 兼容旧路由：无 actId 时仍可跳转旧路径
    router.push({ name: "questionNaire" });
  }
};
</script>

<template>
  <div class="container max-w-4xl mx-auto">

    <!-- 加载状态 -->
    <Card v-if="isLoading" class="border border-border bg-card rounded-xl">
      <CardContent class="space-y-4 p-6">
        <Skeleton class="h-6 w-2/3" />
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-5/6" />
      </CardContent>
    </Card>

    <!-- 错误状态 -->
    <Card v-else-if="hasError" class="error-card border border-border bg-card rounded-xl">
      <CardHeader>
        <CardTitle class="error-title text-destructive">获取活动信息失败</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription class="error-message text-destructive">
          {{ errorMessage }}
        </CardDescription>
      </CardContent>
    </Card>

    <!-- 活动信息 -->
    <Card v-else class="rounded-xl border border-border bg-card">
      <CardHeader class="space-y-2">
        <CardTitle class="text-xl font-bold text-card-foreground">
          {{ activity.title || '未知活动' }}
        </CardTitle>
        <CardDescription v-if="activity.isRun !== null" class="text-sm">
          <span :class="activity.isRun ? 'text-primary' : 'text-destructive'">
            {{ activity.isRun ? '🟢 进行中' : '🔴 已结束' }}
          </span>
        </CardDescription>
        <!-- 新增：面试方向 -->
        <CardDescription v-if="activity.target" class="text-sm text-muted-foreground">
          面试方向: {{ activity.target }}
        </CardDescription>
      </CardHeader>

      <CardContent class="space-y-6">
        <!-- 活动时间（简化为区块 + 分割线） -->
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-foreground">活动时间</h3>
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <Label class="font-medium">开始时间</Label>
            <span>{{ formatDate(activity.createTime) }}</span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <Label class="font-medium">截止时间</Label>
            <span>{{ formatDate(activity.deadline) }}</span>
          </div>
        </div>

        <Separator class="my-4" />

        <!-- 活动详情（简化为区块 + 分割线） -->
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-foreground">活动详情</h3>
          <div class="text-muted-foreground leading-relaxed">
            {{ activity.description || '暂无详细描述' }}
          </div>
        </div>

      </CardContent>
      <CardFooter class="flex justify-end">
        <Button class="bg-primary text-primary-foreground hover:bg-primary/90" @click="goToQuestionnaire">
          填写活动问卷
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<style scoped>
.container {
  min-height: 75vh;
  padding: 6vh 5vw 0;
  box-sizing: border-box;
}

.page-title {
  margin-bottom: 4vh;
  font-size: 1.25rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 16rem;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-left: 1rem;
}

.error-card {
  width: 90%;
  max-width: 600px;
  margin: 0 auto;
}

.loading-text {
  margin-left: 1rem;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
