<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import {
  statusList,
  eventList,
  resumeProcess,
} from "@/utils/type/processType.ts";
import { getStatusList, getEventList, getResumeStatus } from "@/api/api";
import { useAuthStore } from "@/store/index";
import { useIdStore } from "@/store/idStore.ts";
import { toast } from "vue-sonner";
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper';


const statuslist = ref<statusList[]>([]); //对应码号，说明简历的状态（待筛之类？其实我认为两者概念似乎倒转了）
const eventlist = ref<eventList[]>([]); //对应码号，说明简历所处事件状态
const resumeprocess = ref<resumeProcess[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const eventColor = [
  "green",
  "green",
  "red",
  "gray",
  "yellow",
  "yellow",
  "green",
]; //为事件状态创建对应颜色表，每个下标的事件代表的不同的颜色（目前有4大类颜色）
const storage = useAuthStore();
const idStore = useIdStore();

const retryLoad = () => {
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};

// 获取指示器的 Tailwind 类
const getIndicatorClasses = (colorClass: string) => {
  switch (colorClass) {
    case 'green':
      return 'bg-green-100 border-2 border-green-500 text-green-600';
    case 'red':
      return 'bg-red-100 border-2 border-red-500 text-red-600';
    case 'yellow':
      return 'bg-yellow-100 border-2 border-yellow-500 text-yellow-600';
    case 'gray':
    default:
      return 'bg-gray-100 border-2 border-gray-400 text-gray-500';
  }
};

onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;

    let batchId: string = "";
    const storedBatchId = idStore.getBatchId();
    if (storedBatchId && storedBatchId.trim() !== "") {
      //如果地址栏不为空
      batchId = storedBatchId;
    } else {
      error.value = "请先选择你的招新批次!!!";
      toast.error("请先选择你的招新批次!!!");
      loading.value = false;
      return; // 如果没有 batchId，直接返回，不执行后续 API 调用
    }

    // 并行获取状态列表和事件列表
    const [statusRes, eventRes] = await Promise.all([
      getStatusList(storage.token),
      getEventList(storage.token)
    ]);

    if (statusRes.data.code === 200) {
      statuslist.value = statusRes.data.data.map((item: statusList) => ({
        code: item.code,
        message: item.message,
      }));
    } else {
      toast.warning(statusRes.data.message);
      error.value = statusRes.data.message;
    }

    if (eventRes.data.code === 200) {
      eventlist.value = eventRes.data.data.map((item: eventList) => ({
        event: item.event,
        description: item.description,
      }));
    } else {
      toast.warning(eventRes.data.message);
      error.value = eventRes.data.message;
    }

    // 获取简历状态
    const resumeRes = await getResumeStatus(storage.token, batchId);
    if (resumeRes.data.code === 200) {
      resumeprocess.value = resumeRes.data.data.map((item: resumeProcess) => ({
        resumeStatus: item.resumeStatus,
        resumeEvent: item.resumeEvent,
        createTime: item.createTime,
      }));
    } else {
      toast.warning(resumeRes.data.message);
      error.value = resumeRes.data.message;
    }
  } catch (err) {
    console.error('加载流程数据失败:', err);
    error.value = '加载数据失败，请稍后重试';
    toast.error('加载数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
});


// 计算步骤数据，将API数据转换为Stepper组件需要的格式
const stepperData = computed(() => {
  return resumeprocess.value.map((item, index) => {
    const statusMessage = statuslist.value[item.resumeStatus as number]?.message || '';
    const eventDescription = eventlist.value[(item.resumeEvent as number) - 1]?.description || '';
    const eventColorIndex = (item.resumeEvent as number) - 1;

    return {
      step: index + 1,
      title: statusMessage,
      description: eventDescription,
      time: item.createTime,
      colorClass: eventColor[eventColorIndex] || 'gray',
      indicator: (index + 1).toString()
    };
  });
});
</script>

<template>
  <div class="w-full py-8 min-h-[80vh] bg-blue-50">
    <div class="w-[90vw] mx-auto bg-white rounded-3xl shadow-lg p-8">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-16 space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="text-gray-600 text-lg">正在加载流程信息...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-16 space-y-4">
        <div class="text-6xl">⚠️</div>
        <p class="text-red-600 text-lg font-medium">{{ error }}</p>
        <button @click="retryLoad"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          重试
        </button>
      </div>

      <!-- 正常内容 -->
      <div v-else-if="stepperData.length > 0">
        <Stepper orientation="vertical" class="w-full">
          <StepperItem v-for="(stepData, index) in stepperData" :key="stepData.step" :step="stepData.step" class="mb-4">
            <StepperTrigger class="flex items-start gap-4 py-2 cursor-default">
              <StepperIndicator :class="[
                'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm',
                getIndicatorClasses(stepData.colorClass)
              ]">
                {{ stepData.indicator }}
              </StepperIndicator>
              <div class="flex-1 min-w-0">
                <StepperTitle class="font-semibold text-base text-gray-900 mb-1">
                  {{ stepData.title }}
                </StepperTitle>
                <StepperDescription class="text-sm text-gray-600 leading-relaxed mb-1">
                  {{ stepData.description }}
                </StepperDescription>
                <div class="text-xs text-gray-400 italic">
                  {{ stepData.time }}
                </div>
              </div>
            </StepperTrigger>
            <StepperSeparator v-if="index < stepperData.length - 1" class="ml-4 h-6" />
          </StepperItem>
        </Stepper>
      </div>

      <!-- 空状态 -->
      <div v-else class="flex flex-col items-center justify-center py-16 space-y-4">
        <div class="text-6xl">📋</div>
        <p class="text-gray-700 text-lg font-medium">暂无流程信息</p>
        <p class="text-gray-500 text-sm">请确保已选择正确的招新批次</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 所有样式已迁移到 Tailwind CSS */
</style>
