<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useAuthStore } from "@/store/index";
import { useIdStore } from "@/store/idStore";
import { toast } from "vue-sonner";
import { getTemplate } from "@/api/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import scroollTo from "@/utils/scroollTo";

// 简化的活动数据结构
interface ActivityData {
  id: string | null;
  paperId: string | null;
  title: string | null;
  description: string | null;
  isRun: boolean | null;
  deadline: string | null;
  createTime: string | null;
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
});

// 格式化日期显示
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "未知时间";
  try {
    return new Date(dateString).toLocaleString('zh-CN');
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

      // 清晰的数据赋值
      activity.value = {
        id: activityData.id,
        paperId: activityData.paperId,
        title: activityData.title,
        description: activityData.description,
        isRun: activityData.isRun,
        deadline: activityData.deadline,
        createTime: activityData.createTime,
      };
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
</script>

<template>
  <div class="container">

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <span class="loading-text">正在加载活动信息...</span>
    </div>

    <!-- 错误状态 -->
    <Card v-else-if="hasError" class="error-card">
      <CardHeader>
        <CardTitle class="error-title">获取活动信息失败</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription class="error-message">
          {{ errorMessage }}
        </CardDescription>
      </CardContent>
    </Card>

    <!-- 活动信息 -->
    <Card v-else class="activity-card">
      <CardHeader>
        <CardTitle class="text-xl font-bold text-gray-800">
          {{ activity.title || '未知活动' }}
        </CardTitle>
        <CardDescription v-if="activity.isRun !== null" class="text-sm">
          <span :class="activity.isRun ? 'text-green-600' : 'text-red-600'">
            {{ activity.isRun ? '🟢 进行中' : '🔴 已结束' }}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent class="space-y-6">
        <!-- 活动时间 -->
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-gray-700">活动时间</h3>
          <div class="text-gray-600 bg-gray-50 p-3 rounded-lg">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2">
              <span class="font-medium">开始时间:</span>
              <span>{{ formatDate(activity.createTime) }}</span>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
              <span class="font-medium">截止时间:</span>
              <span>{{ formatDate(activity.deadline) }}</span>
            </div>
          </div>
        </div>

        <!-- 活动详情 -->
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-gray-700">活动详情</h3>
          <div class="text-gray-600 bg-gray-50 p-4 rounded-lg leading-relaxed">
            {{ activity.description || '暂无详细描述' }}
          </div>
        </div>

        <!-- 活动ID信息 (调试用) -->
        <div v-if="activity.id" class="text-xs text-gray-400 border-t pt-2">
          活动ID: {{ activity.id }}
          <span v-if="activity.paperId" class="ml-4">
            问卷ID: {{ activity.paperId }}
          </span>
        </div>
      </CardContent>
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
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-left: 1rem;
  color: #6b7280;
}

.error-card {
  width: 90%;
  max-width: 600px;
  margin: 0 auto;
  border-color: #fecaca;
}

.error-title {
  color: #dc2626;
}

.error-message {
  color: #ef4444;
}

.activity-card {
  width: 90%;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
