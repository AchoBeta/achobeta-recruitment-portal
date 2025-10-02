<script lang="ts" setup>
import { Check, Circle, Dot } from "lucide-vue-next"

import { Button } from "@/components/ui/button"
import {
  Stepper,
  StepperDescription,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'

defineOptions({
  name: "processIntroduce",
});

// 定义步骤数据
const steps = [
  {
    step: 1,
    title: "登录系统",
    description: "使用邮箱登录系统"
  },
  {
    step: 2,
    title: "填写简历",
    description: "可查看招新进度"
  },
  {
    step: 3,
    title: "等待招新活动",
    description: "耐心等待活动开始"
  },
  {
    step: 4,
    title: "查看招新活动信息",
    description: "了解活动详情"
  },
  {
    step: 5,
    title: "填写招新活动问卷",
    description: "完成相关问卷"
  },
  {
    step: 6,
    title: "等待面试安排",
    description: "等待面试通知"
  },
  {
    step: 7,
    title: "查看面试地点",
    description: "确认面试信息"
  },
  {
    step: 8,
    title: "完成面试,查看面试总结",
    description: "参加面试并查看结果"
  },
  {
    step: 9,
    title: "等待面试结果通知",
    description: "等待最终结果"
  }
];
</script>

<template>
  <div class="container mx-auto space-y-24">
    <div class="text-center">
      <h2 class="text-3xl font-bold">招新流程指南</h2>
      <p class="text-muted-foreground">跟随以下步骤完成招新申请</p>
    </div>

    <Stepper orientation="vertical" class="mx-auto flex w-full max-w-2xl flex-col justify-start gap-10">
      <StepperItem v-for="step in steps" :key="step.step" v-slot="{ state }"
        class="relative flex w-full items-start gap-6" :step="step.step">
        <StepperSeparator v-if="step.step !== steps[steps.length - 1].step"
          class="absolute left-[18px] top-[38px] block h-[105%] w-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary" />

        <StepperTrigger as-child>
          <Button :variant="state === 'completed' || state === 'active' ? 'default' : 'outline'" size="icon"
            class="z-10 rounded-full shrink-0"
            :class="[state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background']">
            <Check v-if="state === 'completed'" class="size-5" />
            <Circle v-if="state === 'active'" />
            <Dot v-if="state === 'inactive'" />
          </Button>
        </StepperTrigger>

        <div class="flex flex-col gap-1">
          <StepperTitle :class="[state === 'active' && 'text-primary']"
            class="text-sm font-semibold transition lg:text-base">
            {{ step.title }}
          </StepperTitle>
          <StepperDescription :class="[state === 'active' && 'text-primary']"
            class="sr-only text-xs text-muted-foreground transition md:not-sr-only lg:text-sm">
            {{ step.description }}
          </StepperDescription>
        </div>
      </StepperItem>
    </Stepper>
  </div>
</template>