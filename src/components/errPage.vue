<script lang="ts" setup>
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

defineOptions({
  name: "errPage",
});

const props = defineProps({
  status: {
    type: String,
    default: "error",
  },
  title: {
    type: String,
    default: "错误!",
  },
  description: {
    type: String,
    default: "出错!error..er..",
  },
});

// 根据状态确定图标和颜色
const getStatusConfig = (status: string) => {
  switch (status) {
    case "success":
      return {
        icon: "✅",
        color: "text-green-600",
        bgColor: "bg-green-50",
      };
    case "warning":
      return {
        icon: "⚠️",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      };
    case "info":
      return {
        icon: "ℹ️",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      };
    default: // error
      return {
        icon: "❌",
        color: "text-red-600",
        bgColor: "bg-red-50",
      };
  }
};

const statusConfig = getStatusConfig(props.status);
</script>

<template>
  <div class="flex items-center justify-center min-h-[400px] p-4">
    <Card class="w-full max-w-md text-center">
      <CardHeader>
        <div :class="[
          'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4',
          statusConfig.bgColor
        ]">
          <span class="text-2xl">{{ statusConfig.icon }}</span>
        </div>
        <CardTitle :class="['text-xl font-semibold', statusConfig.color]">
          {{ props.title }}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-muted-foreground">
          {{ props.description }}
        </p>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped></style>
