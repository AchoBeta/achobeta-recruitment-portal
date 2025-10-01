import { z } from 'zod'

// 学号校验：20开头的11-13位数字
const studentIdSchema = z.string()
  .min(1, '请输入学号')
  .regex(/^20\d{8,11}$/, '请输入20开头的11~13位的学号!')

// 年级校验：20xx格式
const gradeSchema = z.coerce.number({
  message: '请输入有效的年级数字'
})
  .min(2000, '请输入20xx格式年级!')
  .max(2099, '请输入20xx格式年级!')

// 邮箱校验
const emailSchema = z.string()
  .min(1, '请输入邮箱')
  .regex(/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/, '邮箱输入有误!')

// 手机号校验：11位数字
const phoneSchema = z.string()
  .min(1, '请输入手机号')
  .regex(/^\d{11}$/, '请输入11位手机号!')

// 性别枚举
const genderSchema = z.enum(['男', '女'], {
  message: '请选择性别'
})

// 简历表单Schema
export const resumeFormSchema = z.object({
  // 基本信息
  name: z.string()
    .min(1, '请输入姓名')
    .describe('姓名'),
  
  studentId: studentIdSchema
    .describe('学号'),
  
  gender: genderSchema
    .describe('性别'),
  
  grade: gradeSchema
    .describe('年级'),
  
  major: z.string()
    .min(1, '请输入专业')
    .describe('专业'),
  
  className: z.string()
    .min(1, '请输入班级')
    .describe('班级'),
  
  email: emailSchema
    .describe('邮箱'),
  
  phoneNumber: phoneSchema
    .describe('手机号'),
  
  // 详细信息
  reason: z.string()
    .min(1, '请输入加入AB的理由')
    .describe('加入AB的理由'),
  
  introduce: z.string()
    .min(1, '请输入简历')
    .describe('个人简介'),
  
  experience: z.string()
    .min(1, '请输入经历')
    .describe('个人经历'),
  
  awards: z.string()
    .min(1, '请完善获奖经历')
    .describe('获奖经历'),
  
  remark: z.string()
    .optional()
    .describe('备注'),
})

// 导出类型
export type ResumeFormData = z.infer<typeof resumeFormSchema>

// 性别选项
export const genderOptions = [
  { value: '男', label: '男' },
  { value: '女', label: '女' }
]