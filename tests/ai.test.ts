import { describe, expect, it } from 'vitest'
import { createLocalTextEmbedding, extractAttributes } from '../src/ai'

describe('local AI baseline', () => {
  it('extracts Korean lost item attributes without an external API', () => {
    const result = extractAttributes('검은색 가죽 카드지갑 앞면에 금색 로고가 있어요')
    expect(result.category).toBe('wallet')
    expect(result.colors).toContain('black')
    expect(result.material).toBe('leather')
    expect(result.features).toContain('로고')
  })

  it('creates a deterministic normalized embedding', () => {
    const first = createLocalTextEmbedding('검은 카드지갑')
    const second = createLocalTextEmbedding('검은 카드지갑')
    expect(first).toEqual(second)
    expect(first).toHaveLength(64)
    expect(Math.hypot(...first)).toBeCloseTo(1, 4)
  })
})
