import { describe, expect, it } from 'vitest'
import { createLocalTextEmbedding, interpretLostDescription, redactSensitiveText } from '../src/ai'
import { calculateMatchScore, locationSimilarity, MATCHING_CONFIG, timeSimilarity, type MatchingInput } from '../src/matching'

function input(overrides: Partial<MatchingInput> = {}): MatchingInput {
  return {
    textEmbedding: createLocalTextEmbedding('검은색 가죽 카드지갑 금색 로고'),
    attributes: { category: 'wallet', colors: ['black'], material: 'leather', features: ['로고'] },
    occurredAt: '2026-09-22T08:00:00.000Z',
    locationText: '시청역 2번 출구 근처',
    locationGroup: '대중교통',
    ocrText: [],
    ...overrides,
  }
}

describe('lost report interpretation', () => {
  it('structures Korean natural language without an external API', () => {
    const result = interpretLostDescription('검은색 가죽 카드지갑이고 앞면에 금색 로고가 있어요.')
    expect(result.attributes.category).toBe('wallet')
    expect(result.attributes.colors).toContain('black')
    expect(result.attributes.material).toBe('leather')
    expect(result.attributes.features).toContain('로고')
  })

  it('redacts common sensitive numbers from public descriptions', () => {
    expect(redactSensitiveText('연락처 010-1234-5678 카드 1234 5678 9012 3456')).not.toContain('010-1234-5678')
    expect(redactSensitiveText('연락처 010-1234-5678')).toContain('[연락처 비공개]')
  })
})

describe('matching score', () => {
  it('keeps weights in config and sums them to one', () => {
    expect(Object.values(MATCHING_CONFIG.weights).reduce((sum, value) => sum + value, 0)).toBeCloseTo(1)
  })

  it('scores a highly similar found report above an unrelated report', () => {
    const lost = input()
    const similar = input({ occurredAt: '2026-09-22T08:40:00.000Z', locationText: '시청역 2번 출구', ocrText: ['gold logo'] })
    const unrelated = input({
      textEmbedding: createLocalTextEmbedding('하얀 운동화 파란 끈'),
      attributes: { category: 'clothing', colors: ['white'], material: 'fabric', features: ['끈'] },
      occurredAt: '2026-10-10T08:00:00.000Z',
      locationText: '강변 공원 산책로',
      locationGroup: '공원·야외',
    })
    expect(calculateMatchScore(lost, similar).finalScore).toBeGreaterThan(calculateMatchScore(lost, unrelated).finalScore)
    expect(calculateMatchScore(lost, similar).explanations.length).toBeGreaterThanOrEqual(3)
  })

  it('ranks the intended item first among 30 synthetic candidates', () => {
    const lost = input()
    const candidates = Array.from({ length: 30 }, (_, index) => index === 17
      ? input({ occurredAt: '2026-09-22T08:35:00.000Z', locationText: '시청역 2번 출구 앞' })
      : input({
          textEmbedding: createLocalTextEmbedding(`서로 다른 물건 ${index} 운동화 우산 가방`),
          attributes: { category: index % 2 ? 'clothing' : 'bag', colors: [index % 3 ? 'blue' : 'white'], features: [] },
          occurredAt: `2026-10-${String((index % 20) + 1).padStart(2, '0')}T08:00:00.000Z`,
          locationText: `다른 장소 ${index}`,
          locationGroup: '기타',
        }))
    const ranked = candidates.map((candidate, index) => ({ index, score: calculateMatchScore(lost, candidate).finalScore })).sort((a, b) => b.score - a.score)
    expect(ranked[0].index).toBe(17)
  })

  it('normalizes nearby location phrases and respects time direction', () => {
    expect(locationSimilarity('시청역 2번 출구 근처', '시청역 2번 출구 앞')).toBeGreaterThanOrEqual(0.8)
    expect(timeSimilarity('2026-09-22T08:00:00Z', '2026-09-22T08:40:00Z')).toBe(1)
    expect(timeSimilarity('2026-09-22T08:00:00Z', '2026-09-20T08:00:00Z')).toBe(0)
  })
})
