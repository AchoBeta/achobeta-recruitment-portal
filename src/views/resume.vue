<template>
  <div class="container w-full px-4">
    <titleBlock :title="title" />

    <div class="mx-auto w-full max-w-md">
      <Card class="shadow-lg">
        <CardContent class="p-8">
          <!-- 剩余提交次数提示 -->
          <div v-if="count !== null" class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p class="text-blue-800 font-medium">
              剩余提交次数: <span class="text-blue-600 font-bold">{{ count }}</span>
            </p>
          </div>

          <!-- 表单 -->
          <form @submit="onSubmit" class="space-y-6">
            <!-- 姓名 -->
            <FormField v-slot="{ componentField }" name="name">
              <FormItem>
                <FormLabel>姓名</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="请填写姓名" v-bind="componentField" class="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- 学号 -->
            <FormField v-slot="{ componentField }" name="studentId">
              <FormItem>
                <FormLabel>学号</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="20开头的11~13位学号" v-bind="componentField" class="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- 性别 -->
            <FormField v-slot="{ componentField }" name="gender">
              <FormItem>
                <FormLabel>性别</FormLabel>
                <FormControl>
                  <RadioGroup v-bind="componentField" class="flex flex-row gap-6">
                    <div class="flex items-center space-x-2">
                      <RadioGroupItem value="男" id="male" />
                      <Label for="male">男</Label>
                    </div>
                    <div class="flex items-center space-x-2">
                      <RadioGroupItem value="女" id="female" />
                      <Label for="female">女</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- 年级 -->
            <FormField v-slot="{ componentField }" name="grade">
              <FormItem>
                <FormLabel>年级</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="20xx格式填写" v-bind="componentField" class="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- 专业 -->
            <FormField v-slot="{ componentField }" name="major">
              <FormItem>
                <FormLabel>专业 ( 乱填后果自负!! )</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="请填写专业" v-bind="componentField" class="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- 班级 -->
            <FormField v-slot="{ componentField }" name="className">
              <FormItem>
                <FormLabel>班级 ( 乱填后果自负!! )</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="请以班级+班号格式填写" v-bind="componentField" class="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- 邮箱 -->
            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>邮箱</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="请填写常用邮箱" v-bind="componentField" class="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- 手机号 -->
            <FormField v-slot="{ componentField }" name="phoneNumber">
              <FormItem>
                <FormLabel>手机号</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="请填写常用手机号" v-bind="componentField" class="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- 简介 -->
            <FormField v-slot="{ componentField }" name="introduce">
              <FormItem>
                <FormLabel>简介</FormLabel>
                <FormControl>
                  <Textarea placeholder="请填写个人简介" v-bind="componentField" class="w-full min-h-[100px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- 经历 -->
            <FormField v-slot="{ componentField }" name="experience">
              <FormItem>
                <FormLabel>经历</FormLabel>
                <FormControl>
                  <Textarea placeholder="请填写个人经历" v-bind="componentField" class="w-full min-h-[100px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- 获奖经历 -->
            <FormField v-slot="{ componentField }" name="awards">
              <FormItem>
                <FormLabel>获奖经历</FormLabel>
                <FormControl>
                  <Textarea placeholder="请填写获奖经历" v-bind="componentField" class="w-full min-h-[100px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- 加入理由 -->
            <FormField v-slot="{ componentField }" name="reason">
              <FormItem>
                <FormLabel>加入理由</FormLabel>
                <FormControl>
                  <Textarea placeholder="请填写加入理由" v-bind="componentField" class="w-full min-h-[100px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- 备注 -->
            <FormField v-slot="{ componentField }" name="remark">
              <FormItem>
                <FormLabel>备注</FormLabel>
                <FormControl>
                  <Textarea placeholder="可选填备注" v-bind="componentField" class="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- 文件上传区域 -->
            <div class="space-y-4">
              <!-- 证件照上传 -->
              <div>
                <Label class="text-base font-medium">证件照 *</Label>
                <div
                  class="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input type="file" accept="image/*" @change="handlePictureUpload" class="hidden" ref="pictureInput" />
                  <div v-if="!currentPicture" @click="pictureInput?.click()" class="cursor-pointer">
                    <div class="text-gray-400 mb-2">
                      <svg class="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                    <p class="text-gray-600">点击上传证件照</p>
                    <p class="text-sm text-gray-400 mt-1">支持 JPG、PNG 格式</p>
                  </div>
                  <div v-else class="relative">
                    <img :src="currentPicture" alt="证件照预览" class="mx-auto h-32 w-24 object-cover rounded-lg" />
                    <Button variant="outline" size="sm" @click="removePicture" class="mt-2">
                      重新上传
                    </Button>
                  </div>
                </div>
              </div>

              <!-- 附件上传 -->
              <div>
                <Label class="text-base font-medium">附件上传【选填】</Label>
                <div
                  class="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input type="file" multiple @change="handleFileUpload" class="hidden" ref="fileInput" />
                  <div @click="fileInput?.click()" class="cursor-pointer">
                    <div class="text-gray-400 mb-2">
                      <svg class="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M12 8v28m0 0l8-8m-8 8l-8-8m32-20v28m0 0l-8-8m8 8l8-8" stroke-width="2"
                          stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                    <p class="text-gray-600">点击上传附件</p>
                    <p class="text-sm text-gray-400 mt-1">支持多个文件上传</p>
                  </div>
                </div>

                <!-- 文件列表 -->
                <div v-if="fileList.length > 0" class="mt-4 space-y-2">
                  <div v-for="(file, index) in fileList" :key="index"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span class="text-sm text-gray-700">{{ file.name }}</span>
                    <Button variant="ghost" size="sm" @click="removeFile(index)"
                      class="text-red-500 hover:text-red-700">
                      删除
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 提交按钮 -->
            <div class="flex justify-center gap-4 pt-6">
              <Button type="submit" :disabled="isSubmitting" class="px-8"
                :class="{ 'opacity-50 cursor-not-allowed': isSubmitting }">
                {{ isSubmitting ? '提交中...' : '提交简历' }}
              </Button>
              <Button variant="outline" @click="goToActivities" class="px-8">
                跳转活动
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- 加载弹窗 -->
  <Dialog v-model:open="showModal">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>提交中...</DialogTitle>
      </DialogHeader>
      <div class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">正在处理您的简历，请稍候...</span>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/store/index'
import { useIdStore } from '@/store/idStore'

// API imports
import {
  submitResume,
  queryResume,
  uploadFileList,
  uploadPicture,
  deleteResource,
} from '@/api/api'

// Component imports
import titleBlock from '@/components/titleBlock.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Schema and types
import { resumeFormSchema, type ResumeFormData } from '@/utils/schemas/resumeSchema'
import { formType } from '@/utils/type/formType'

// Stores
const storage = useAuthStore()
const idStore = useIdStore()
const router = useRouter()
// Form setup
const form = useForm({
  validationSchema: toTypedSchema(resumeFormSchema),
  initialValues: {
    name: '',
    studentId: '',
    gender: '男',
    grade: 2024,
    major: '',
    className: '',
    email: '',
    phoneNumber: '',
    introduce: '',
    experience: '',
    awards: '',
    reason: '',
    remark: '',
  } as ResumeFormData
})

// Reactive data
const title = ref<string>('')
const batchId = ref<string>('')
const count = ref<number | null>(null)
const showModal = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)

// File handling
const fileList = ref<File[]>([])
const currentPicture = ref<string | null>(null)
const pictureFile = ref<File | null>(null)
const pictureInput = ref<HTMLInputElement>()
const fileInput = ref<HTMLInputElement>()

// Original form structure for API compatibility
const apiForm = ref<formType>({
  stuSimpleResumeDTO: {
    batchId: null,
    studentId: null,
    name: null,
    gender: null,
    grade: null,
    major: null,
    className: null,
    email: null,
    phoneNumber: null,
    reason: null,
    introduce: null,
    experience: null,
    image: null,
    awards: null,
    remark: null,
    stateCount: 999,
  },
  stuAttachmentDTOList: [],
})

// File upload handlers
const handlePictureUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    pictureFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      currentPicture.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const removePicture = () => {
  pictureFile.value = null
  currentPicture.value = null
  if (pictureInput.value) {
    pictureInput.value.value = ''
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  fileList.value.push(...files)
}

const removeFile = (index: number) => {
  fileList.value.splice(index, 1)
}

// Convert form data to API format
const syncFormData = (data: ResumeFormData) => {
  const dto = apiForm.value.stuSimpleResumeDTO
  dto.name = data.name || null
  dto.studentId = data.studentId || null
  dto.gender = data.gender === '男' ? 0 : 1
  dto.grade = data.grade || null
  dto.major = data.major || null
  dto.className = data.className || null
  dto.email = data.email || null
  dto.phoneNumber = data.phoneNumber || null
  dto.reason = data.reason || null
  dto.introduce = data.introduce || null
  dto.experience = data.experience || null
  dto.awards = data.awards || null
  dto.remark = data.remark || null
  dto.batchId = batchId.value ? parseInt(batchId.value) : null
}

// Form submission
const onSubmit = form.handleSubmit(async (data: ResumeFormData) => {
  if (!pictureFile.value && !apiForm.value.stuSimpleResumeDTO.image) {
    toast.error('请上传证件照')
    return
  }

  isSubmitting.value = true
  showModal.value = true

  try {
    // Sync form data
    syncFormData(data)

    // Upload picture if new one is selected
    if (pictureFile.value) {
      const pictureData = new FormData()
      pictureData.append('file', pictureFile.value)

      // Delete old picture if exists
      if (apiForm.value.stuSimpleResumeDTO.image) {
        await deleteResource(storage.token, apiForm.value.stuSimpleResumeDTO.image)
      }

      const pictureRes = await uploadPicture(storage.token, pictureData)
      if (pictureRes.data.code === 200) {
        apiForm.value.stuSimpleResumeDTO.image = pictureRes.data.data
      } else {
        throw new Error(pictureRes.data.message)
      }
    }

    // Upload files if any
    if (fileList.value.length > 0) {
      const fileListData = new FormData()
      fileList.value.forEach(file => {
        fileListData.append('file', file)
      })

      const fileRes = await uploadFileList(storage.token, fileListData)
      if (fileRes.data.code === 200) {
        apiForm.value.stuAttachmentDTOList = fileRes.data.data.map((attachment: number, index: number) => ({
          filename: fileList.value[index].name,
          attachment
        }))
      } else {
        throw new Error(fileRes.data.message)
      }
    }

    // Submit resume
    const res = await submitResume(storage.token, apiForm.value)
    if (res.data.code === 200) {
      toast.success('提交成功')
      if (count.value !== null) count.value--
      router.go(0)
    } else {
      throw new Error(res.data.message)
    }
  } catch (error: any) {
    console.error('提交失败:', error)
    toast.error(error.message || '提交失败，请重试')
  } finally {
    isSubmitting.value = false
    showModal.value = false
  }
})

const goToActivities = () => {
  router.push('/activity')
}

// Load existing data
const loadResumeData = async () => {
  try {
    const res = await queryResume(storage.token, batchId.value)
    if (res.data.code === 200 && res.data.data.stuSimpleResumeVO) {
      const dto = res.data.data.stuSimpleResumeVO

      // Load form data
      form.setValues({
        name: dto.name || '',
        studentId: dto.studentId || '',
        gender: dto.gender === 0 ? '男' : '女',
        grade: dto.grade || 2024,
        major: dto.major || '',
        className: dto.className || '',
        email: dto.email || '',
        phoneNumber: dto.phoneNumber || '',
        reason: dto.reason || '',
        introduce: dto.introduce || '',
        experience: dto.experience || '',
        awards: dto.awards || '',
        remark: dto.remark || '',
      })

      // Load original form structure
      Object.assign(apiForm.value.stuSimpleResumeDTO, dto, {
        stateCount: dto.state
      })
      apiForm.value.stuAttachmentDTOList = res.data.data.stuAttachmentVOList || []

      count.value = dto.state

      // Load picture if exists
      if (dto.image) {
        // You might want to load the actual image URL here
        // currentPicture.value = await getImageUrl(dto.image)
      }
    }
  } catch (error) {
    console.error('加载简历数据失败:', error)
    toast.error('加载简历数据失败')
  }
}

// Initialize
onMounted(async () => {
  // Get batchId from store
  const storedBatchId = idStore.getBatchId()

  if (storedBatchId) {
    batchId.value = storedBatchId
    title.value = '简历填写'
    await loadResumeData()
  }
})
</script>