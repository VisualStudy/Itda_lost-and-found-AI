import { z } from 'zod'

export const registerSchema = z.object({
  email: z.email('올바른 이메일을 입력해 주세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 해요.').max(72),
  nickname: z.string().trim().min(2, '닉네임은 2자 이상이어야 해요.').max(20),
})

export const loginSchema = z.object({
  email: z.email('올바른 이메일을 입력해 주세요.'),
  password: z.string().min(1, '비밀번호를 입력해 주세요.'),
})

export const foundReportSchema = z.object({
  title: z.string().trim().min(2).max(60),
  description: z.string().trim().min(2).max(1000),
  category: z.enum(['wallet', 'bag', 'electronics', 'keys', 'clothing', 'document', 'accessory', 'other']),
  foundAt: z.iso.datetime(),
  timePrecision: z.enum(['EXACT', 'APPROXIMATE', 'UNKNOWN']).default('EXACT'),
  locationText: z.string().trim().min(2).max(120),
  locationGroup: z.string().trim().min(2).max(80),
  imageIds: z.array(z.string().uuid()).min(1).max(5),
})
