import { describe, expect, it } from 'vitest'
import { foundReportSchema, registerSchema } from '@/lib/validation'

describe('registration validation', () => {
  it('accepts a valid Korean nickname account', () => {
    expect(registerSchema.parse({ email: 'hello@itda.kr', password: 'safe-password', nickname: '잇령이' }).email).toBe('hello@itda.kr')
  })
  it('rejects short passwords', () => {
    expect(() => registerSchema.parse({ email: 'hello@itda.kr', password: 'short', nickname: '잇령이' })).toThrow()
  })
})

describe('found report validation', () => {
  it('requires 1 to 5 uploaded images', () => {
    const common = { title: '검은 지갑', description: '소파 옆에서 발견', category: 'wallet', foundAt: new Date().toISOString(), timePrecision: 'EXACT', locationText: '학생회관 1층', locationGroup: '순천대학교 학생회관' }
    expect(() => foundReportSchema.parse({ ...common, imageIds: [] })).toThrow()
    expect(foundReportSchema.parse({ ...common, imageIds: ['30000000-0000-4000-8000-000000000001'] }).imageIds).toHaveLength(1)
  })
})
