<template>
  <div class="space-y-6">
    <AutoForm :schema="resumeFormSchema" :field-config="fieldConfig" @submit="handleSubmit" class="space-y-4">
      <div class="flex justify-center gap-4 pt-6">
        <Button type="submit" :disabled="!isFormValid" class="px-8"
          :class="{ 'opacity-50 cursor-not-allowed': !isFormValid }">
          提交简历
        </Button>
        <Button variant="outline" @click="$emit('toActivities')" class="px-8">
          跳转活动
        </Button>
      </div>
    </AutoForm>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { AutoForm } from '@/components/ui/auto-form'
import { Button } from '@/components/ui/button'
import { resumeFormSchema, type ResumeFormData, genderOptions } from '@/utils/schemas/resumeSchema'
import { toast } from 'vue-sonner'

// Props
interface Props {
  initialData?: Partial<ResumeFormData>
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({}),
  isSubmitting: false
})

// Emits
const emit = defineEmits<{
  submit: [data: ResumeFormData]
  toActivities: []
}>()

// Form data
const formData = ref<Partial<ResumeFormData>>({
  ...props.initialData
})

// Watch for prop changes
watch(() => props.initialData, (newData) => {
  formData.value = { ...newData }
}, { deep: true })

// Field configuration for AutoForm
const fieldConfig = {
  name: {
    label: '姓名',
    inputProps: {
      placeholder: '请填写姓名',
      class: 'w-full'
    }
  },
  studentId: {
    label: '学号',
    inputProps: {
      placeholder: '11~13位学号',
      class: 'w-full'
    }
  },
  gender: {
    label: '性别',
    component: 'radio' as const,
    inputProps: {
      class: 'flex gap-4'
    }
  },
  grade: {
    label: '年级',
    component: 'number' as const,
    inputProps: {
      placeholder: '20xx格式填写',
      class: 'w-full'
    }
  },
  major: {
    label: '专业 ( 乱填后果自负!! )',
    inputProps: {
      placeholder: '请填写专业',
      class: 'w-full'
    }
  },
  className: {
    label: '班级 ( 乱填后果自负!! )',
    inputProps: {
      placeholder: '请以班级+班号格式填写',
      class: 'w-full'
    }
  },
  email: {
    label: '邮箱',
    component: 'string' as const,
    inputProps: {
      type: 'email',
      placeholder: '请填写常用邮箱',
      class: 'w-full'
    }
  },
  phoneNumber: {
    label: '手机号',
    inputProps: {
      placeholder: '请填写常用手机号',
      class: 'w-full'
    }
  },
  introduce: {
    label: '简介',
    component: 'textarea' as const,
    inputProps: {
      placeholder: '请填写个人简介',
      class: 'w-full min-h-[100px]'
    }
  },
  experience: {
    label: '经历',
    component: 'textarea' as const,
    inputProps: {
      placeholder: '请填写个人经历',
      class: 'w-full min-h-[100px]'
    }
  },
  awards: {
    label: '获奖经历',
    component: 'textarea' as const,
    inputProps: {
      placeholder: '请填写获奖经历',
      class: 'w-full min-h-[100px]'
    }
  },
  reason: {
    label: '加入理由',
    component: 'textarea' as const,
    inputProps: {
      placeholder: '请填写加入理由',
      class: 'w-full min-h-[100px]'
    }
  },
  remark: {
    label: '备注',
    inputProps: {
      placeholder: '可选填备注',
      class: 'w-full'
    }
  }
}

// Form validation
const isFormValid = computed(() => {
  try {
    resumeFormSchema.parse(formData.value)
    return true
  } catch {
    return false
  }
})

// Handle form submission
const handleSubmit = (data: ResumeFormData) => {
  if (!isFormValid.value) {
    toast.error('请检查表单填写是否完整')
    return
  }

  emit('submit', data)
}

// Expose form validation state
defineExpose({
  isFormValid,
  formData
})
</script>