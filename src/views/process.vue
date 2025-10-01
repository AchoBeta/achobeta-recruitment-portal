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

onMounted(async () => {
  let batchId: string = "";
  if (idStore.getBatchId() != null) {
    //如果地址栏不为空
    batchId = idStore.getBatchId() as string;
  } else {
    toast.error("请先选择你的招新批次!!!");
  }

  await getStatusList(storage.token).then((res) => {
    if (res.data.code === 200) {
      console.log(res);
      res.data.data.forEach((item: statusList) => {
        statuslist.value.push({
          code: item.code,
          message: item.message,
        });
      });
    } else {
      toast.warning(res.data.message);
    }
  });

  await getEventList(storage.token).then((res) => {
    if (res.data.code === 200) {
      console.log(res);

      res.data.data.forEach((item: eventList) => {
        eventlist.value.push({
          event: item.event,
          description: item.description,
        });
      });
    } else {
      toast.warning(res.data.message);
    }
  });

  getResumeStatus(storage.token, batchId).then((res) => {
    if (res.data.code === 200) {
      console.log(res);

      res.data.data.forEach((item: resumeProcess) => {
        resumeprocess.value.push({
          resumeStatus: item.resumeStatus,
          resumeEvent: item.resumeEvent,
          createTime: item.createTime,
        });
      });
    } else {
      toast.warning(res.data.message);
    }
  });
});

const swtichStatus = (id: number) => {
  // return eventColor[id]
  return {
    [eventColor[id]]: true,
  };
};

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
  <div class="process-layout">
    <div class="box">
      <Stepper orientation="vertical" class="stepper-container">
        <StepperItem 
          v-for="(stepData, index) in stepperData" 
          :key="stepData.step" 
          :step="stepData.step"
          class="step-item"
        >
          <StepperTrigger class="step-trigger">
            <StepperIndicator :class="['step-indicator', stepData.colorClass]">
              {{ stepData.indicator }}
            </StepperIndicator>
            <div class="step-content">
              <StepperTitle class="step-title">
                {{ stepData.title }}
              </StepperTitle>
              <StepperDescription class="step-description">
                {{ stepData.description }}
              </StepperDescription>
              <div class="step-time">
                {{ stepData.time }}
              </div>
            </div>
          </StepperTrigger>
          <StepperSeparator v-if="index < stepperData.length - 1" class="step-separator" />
        </StepperItem>
      </Stepper>
    </div>
  </div>
</template>

<style scoped>
.top {
  z-index: 999;
  position: sticky;
  top: 0;
}

.process-layout {
  width: 100vw;
  padding: 2vh 0 2vh 0;
  min-height: 80vh;
  box-sizing: border-box;
}

.box {
  width: 90vw;
  margin: 0 5vw 0 auto;
  border-width: none;
  border-color: white;
  box-shadow: 0 0 20px #b5b2b2;
  padding: 4vh 2vw 4vh 2vw;
  border-radius: 20px;
  background: white;
}

.stepper-container {
  width: 100%;
}

.step-item {
  margin-bottom: 1rem;
}

.step-trigger {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.5rem 0;
  cursor: default;
}

.step-indicator {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f3f4f6;
  border: 2px solid #d1d5db;
  font-weight: 600;
  font-size: 0.875rem;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  font-weight: 600;
  font-size: 1rem;
  color: #111827;
  margin-bottom: 0.25rem;
}

.step-description {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 0.25rem;
}

.step-time {
  font-size: 0.75rem;
  color: #9ca3af;
  font-style: italic;
}

.step-separator {
  margin-left: 1rem;
  height: 1.5rem;
}

/* 颜色类 */
.green {
  background: #dcfce7 !important;
  border-color: #16a34a !important;
  color: #16a34a !important;
}

.red {
  background: #fecaca !important;
  border-color: #dc2626 !important;
  color: #dc2626 !important;
}

.gray {
  background: #f3f4f6 !important;
  border-color: #b5b2b2 !important;
  color: #b5b2b2 !important;
}

.yellow {
  background: #fef3c7 !important;
  border-color: #f5cd4a !important;
  color: #f5cd4a !important;
}
</style>
